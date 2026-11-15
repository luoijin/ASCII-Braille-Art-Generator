import { renderFiglet } from './figlet';
import { rasterizeText, RasterTextOptions } from './rasterText';
import { AsciiSettings, BrailleSettings, CommonSettings, TextEngine, TextSettings } from '../state/types';

export interface TextToBitmapOptions {
  text: TextSettings;
  common: CommonSettings;
  ascii: AsciiSettings;
  braille: BrailleSettings;
  outputMode: 'ascii' | 'braille';
}

/**
 * Wraps text at word boundaries to the given width (in characters).
 * If a word is longer than width, it will be placed on its own line.
 */
function wrapText(text: string, width: number): string {
  if (width <= 0) return text;
  const lines: string[] = [];
  let currentLine = '';
  for (const word of text.split(/\s+/)) {
    // If adding this word would exceed the width, start a new line
    if ((currentLine.length + (currentLine.length > 0 ? 1 : 0) + word.length) > width) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      if (currentLine) {
        currentLine += ' ' + word;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join('\n');
}

/**
 * Renders text to a bitmap (RGBA Uint8ClampedArray) suitable for the image processing pipeline.
 * Returns a promise that resolves to { data: Uint8ClampedArray, width, height }.
 */
export async function renderTextToBitmap(options: TextToBitmapOptions): Promise<{data: Uint8ClampedArray; width: number; height: number}> {
  const { text, common, ascii, braille, outputMode } = options;

  // Apply wrap width if set (wrapWidth is in characters)
  const wrappedText = text.wrapWidth > 0 ? wrapText(text.text, text.wrapWidth) : text.text;

  // Step 1: Generate the raw text bitmap (either via figlet or raster)
  let bitmap: {width: number; height: number; data: ImageData};
  if (text.engine === 'figlet') {
    // Render figlet text to a string
    const asciiText = await renderFiglet(wrappedText, text.figletFont, text.figletLayout as any);
    // Now we need to render this ascii text to a bitmap using a monospace font.
    // We'll use a raster approach with a monospace font (e.g., 'Courier New') to convert the ascii text to a bitmap.
    const rasterOptions: RasterTextOptions = {
      text: asciiText,
      fontFamily: 'Courier New', // monospace font for ascii art
      fontWeight: 400,
      fontSizePx: 96, // arbitrary, will be scaled down later
      lineHeight: 1.2,
      align: text.align,
      paddingPx: 16,
    };
    bitmap = await rasterizeText(rasterOptions);
  } else {
    // Raster engine
    const rasterOptions: RasterTextOptions = {
      text: wrappedText,
      fontFamily: text.fontFamily,
      fontWeight: text.fontWeight,
      fontSizePx: 96, // we'll use a fixed size; the pipeline will scale down
      lineHeight: text.lineHeight,
      align: text.align,
      paddingPx: 16,
    };
    bitmap = await rasterizeText(rasterOptions);
  }

  // Step 2: Convert ImageData to Uint8ClampedArray (already is)
  const { data, width, height } = bitmap;

  // We now have a RGBA bitmap of the rendered text (white on black).
  // We can now feed this into the same pipeline as an image.
  return { data, width, height };
}