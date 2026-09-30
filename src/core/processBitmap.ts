import { Kernel, FLOYD_STEINBERG, ATKINSON, diffuse } from '../core/dither';
import { ASCII_RAMPS } from '../core/ascii';
import { packBraille } from '../core/braille';
import { areaAverageResize } from '../core/resample';
import { rgbaToLuminance, adjustLuminance } from '../core/color';
import { quantize } from '../core/utils';

/**
 * Process a bitmap (RGBA Uint8ClampedArray) to ASCII or Braille art.
 * This is a pure function that mirrors the logic in the pipeline worker.
 */
export function processBitmapToArt(
  bitmap: Uint8ClampedArray,
  width: number,
  height: number,
  outputWidth: number,
  outputMode: 'ascii' | 'braille',
  brightness: number, // in [-1, 1]
  contrast: number,
  gamma: number,
  invert: boolean,
  characterRamp: string,
  ditheringAlgorithm: string,
  ditherStrength: number,
  serpentine: boolean,
  edgeDetect: boolean,
  edgeThreshold: number, // in [0, 100]
  fillBlankCells: boolean,
  thresholdAuto: boolean,
  threshold: number, // in [0, 255]
  backgroundColor: { r: number; g: number; b: number }
): { art: string; cols: number; rows: number } {
  // Step 1: Downscale image if larger than max dimensions (4096px) - but we assume bitmap is already reasonable size.
  // For text rendering, we skip this step because the bitmap is generated at a reasonable size.
  // We'll still apply the same resampling to outputWidth as the worker does.
  let resizedWidth = width;
  let resizedHeight = height;
  let resizedData = bitmap;

  // The worker does not downscale based on MAX_DIMENSION for text? Actually, the worker does downscale if width/height > 4096.
  // We'll apply the same logic.
  const MAX_DIMENSION = 4096;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    resizedWidth = Math.max(1, Math.round(width * scale));
    resizedHeight = Math.max(1, Math.round(height * scale));
    resizedData = areaAverageResize(bitmap, width, height, resizedWidth, resizedHeight);
  }

  // Step 2: Convert to linear luminance with background compositing
  const lum = rgbaToLuminance(
    resizedData,
    resizedWidth,
    resizedHeight,
    backgroundColor.r,
    backgroundColor.g,
    backgroundColor.b
  );

  // Step 3: Apply tone adjustments (brightness in [-1, 1], contrast, gamma, invert)
  const bNorm = Math.abs(brightness) > 1 ? brightness / 100 : brightness;
  const adjustedLum = adjustLuminance(lum, bNorm, contrast, gamma, invert);

  // Step 4: Resample to output character or dot grid
  let finalWidth: number;
  let finalHeight: number;

  if (outputMode === 'ascii') {
    // Monospace aspect ratio ~0.5 (width:height = 1:2)
    const cellAspect = 0.5;
    const aspectRatio = resizedHeight / resizedWidth;
    const calculatedRows = Math.round(
      outputWidth * aspectRatio * cellAspect * (serpentine ? 1 : 1) // stretchY/stretchX are not exposed here; we assume 1.0
      // Note: we are not exposing stretchX/stretchY in the text rendering settings; we could add them but we omit for simplicity.
      // For now, we assume stretchX = stretchY = 1.
    );
    finalWidth = Math.max(1, outputWidth);
    finalHeight = Math.max(1, calculatedRows);
  } else {
    // Braille mode: 2 dots wide, 4 dots high per cell
    const dotCols = Math.max(2, outputWidth * 2);
    const dotRows = Math.round((resizedHeight / resizedWidth) * dotCols * (serpentine ? 1 : 1));
    const paddedDotRows = Math.max(4, Math.ceil(dotRows / 4) * 4);
    finalWidth = dotCols;
    finalHeight = paddedDotRows;
  }

  const finalLum = new Float32Array(finalWidth * finalHeight);
  const xScale = resizedWidth / finalWidth;
  const yScale = resizedHeight / finalHeight;
  for (let y = 0; y < finalHeight; y++) {
    const srcY = Math.min(resizedHeight - 1, Math.floor(y * yScale));
    for (let x = 0; x < finalWidth; x++) {
      const srcX = Math.min(resizedWidth - 1, Math.floor(x * xScale));
      finalLum[y * finalWidth + x] = adjustedLum[srcY * resizedWidth + srcX];
    }
  }

  // Step 5: Dithering and quantization
  let resultArt = '';

  if (outputMode === 'ascii') {
    const ramp = characterRamp && characterRamp.length > 0 ? characterRamp : ASCII_RAMPS.classic;
    const rampLen = ramp.length;
    const targets = new Float32Array(rampLen);
    for (let i = 0; i < rampLen; i++) {
      targets[i] = i / Math.max(1, rampLen - 1);
    }

    let charIndices: Uint8Array;
    if (ditheringAlgorithm && ditheringAlgorithm !== 'none') {
      let kernel: Kernel;
      switch (ditheringAlgorithm) {
        case 'atkinson':
          kernel = ATKINSON;
          break;
        case 'floyd-steinberg':
        default:
          kernel = FLOYD_STEINBERG;
          break;
      }
      charIndices = diffuse(
        finalLum,
        finalWidth,
        finalHeight,
        targets,
        kernel,
        ditherStrength,
        serpentine
      );
    } else {
      charIndices = new Uint8Array(finalLum.length);
      for (let i = 0; i < finalLum.length; i++) {
        charIndices[i] = quantize(finalLum[i], targets);
      }
    }

    const lines: string[] = [];
    for (let y = 0; y < finalHeight; y++) {
      let line = '';
      for (let x = 0; x < finalWidth; x++) {
        const idx = y * finalWidth + x;
        const charIdx = Math.min(rampLen - 1, charIndices[idx]);
        line += ramp[charIdx];
      }
      lines.push(line);
    }
    resultArt = lines.join('\n');
  } else {
    // Braille output
    let dots: Uint8Array;
    if (ditheringAlgorithm && ditheringAlgorithm !== 'none') {
      const targets = new Float32Array([0, 1]);
      const kernel: Kernel = ditheringAlgorithm === 'atkinson' ? ATKINSON : FLOYD_STEINBERG;
      dots = diffuse(
        finalLum,
        finalWidth,
        finalHeight,
        targets,
        kernel,
        ditherStrength,
        serpentine
      );
    } else {
      const threshVal = thresholdAuto
        ? otsuThreshold(finalLum)
        : (threshold > 1 ? threshold / 255 : threshold);
      dots = new Uint8Array(finalLum.length);
      for (let i = 0; i < finalLum.length; i++) {
        dots[i] = finalLum[i] >= threshVal ? 1 : 0;
      }
    }

    resultArt = packBraille(dots, finalWidth, finalHeight, fillBlankCells);
  }

  const outRows = outputMode === 'ascii' ? finalHeight : Math.ceil(finalHeight / 4);

  return { art: resultArt, cols: outputWidth, rows: outRows };
}

/**
 * Calculate optimal threshold using Otsu's method
 */
function otsuThreshold(lum: Float32Array): number {
  const histogram = new Int32Array(256);
  const total = lum.length;
  if (total === 0) return 0.5;

  for (let i = 0; i < total; i++) {
    const val = Math.max(0, Math.min(255, Math.round(lum[i] * 255)));
    histogram[val]++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let bestThreshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVar) {
      maxVar = variance;
      bestThreshold = t;
    }
  }

  return bestThreshold / 255;
}