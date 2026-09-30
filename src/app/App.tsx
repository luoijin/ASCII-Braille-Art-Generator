import { useCallback, useEffect, useRef, useState } from 'react';
import { ControlsPanel } from '../ui/ControlsPanel';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { HeroBackdrop } from '../ui/HeroBackdrop';
import { DocsBackdrop } from '../ui/DocsBackdrop';
import { OutputPanel } from '../ui/OutputPanel';
import { StatusRegion } from '../ui/StatusRegion';
import { useAppState } from '../state/useAppState';
import { loadImageFile, loadImageUrl, getImageData } from '../io/decode';
import { ASCII_RAMPS } from '../core/ascii';
import { renderTextToBitmap } from '../core/text/textToBitmap';
import { renderFiglet } from '../core/text/figlet';
import { processBitmapToArt } from '../core/processBitmap';
import { InputMode, TextSettings } from '../state/types';
import styles from './App.module.css';
import { scrollToSection } from './navigation';

// Helper function to wrap text at word boundaries (same as in textToBitmap.ts)
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

interface CachedImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function App() {
  const state = useAppState();
  const workerRef = useRef<Worker | null>(null);
  const currentImageRef = useRef<CachedImage | null>(null);
  const prevInputModeRef = useRef<InputMode>(state.inputMode);

  // Preserved state for switching between input modes
  const [preservedTextState, setPreservedTextState] = useState<TextSettings | null>(null);
  const [preservedImageState, setPreservedImageState] = useState<{
    currentImage: CachedImage | null;
    hasImage: boolean;
    imageName: string | null;
  } | null>(null);

  // Reflect the theme on <html> so CSS custom properties in theme.css apply globally.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  // Helper to post a process job to the worker
  const dispatchProcess = useCallback(
    (img: CachedImage) => {
      const worker = workerRef.current;
      if (!worker) return;

      const ramp =
        state.ascii.ramp === 'custom'
          ? state.ascii.customRamp || ASCII_RAMPS.classic
          : ASCII_RAMPS[state.ascii.ramp] || ASCII_RAMPS.classic;

      state.setIsProcessing(true);

      // Create a copy of the buffer for transfer to avoid detaching our original data
      // This allows us to keep the original image data in main thread for reprocessing
      const imageDataCopy = img.data.slice(0);

      worker.postMessage(
        {
          type: 'process',
          payload: {
            width: img.width,
            height: img.height,
            outputWidth: state.common.columns,
            outputMode: state.outputMode,
            brightness: state.common.brightness / 100,
            contrast: state.common.contrast,
            gamma: state.common.gamma,
            stretchX: state.common.stretchX,
            stretchY: state.common.stretchY,
            invert: state.common.invert,
            characterRamp: ramp,
            dithering: state.common.dithering.algorithm,
            ditherStrength: state.common.dithering.strength,
            serpentine: state.common.dithering.serpentine,
            edgeDetect: state.ascii.edgeEnabled,
            edgeThreshold: state.ascii.edgeThreshold,
            fillBlankCells: state.braille.fillBlank,
            thresholdAuto: state.braille.thresholdAuto,
            threshold: state.braille.threshold,
            backgroundColor:
              state.theme === 'dark' ? { r: 14, g: 16, b: 21 } : { r: 255, g: 255, b: 255 },
          },
        },
        [imageDataCopy.buffer] // Transfer the copy buffer efficiently
      );
    },
    [state]
  );

  // Initialize the pipeline worker
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../workers/pipeline.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (e: MessageEvent) => {
        const { type, payload } = e.data;

        if (type === 'result') {
          const { art, cols, rows } = payload;
          state.setOutputArt(art);
          state.setOutputCols(cols);
          state.setOutputRows(rows);
          state.setIsProcessing(false);
        } else if (type === 'error') {
          state.setIsProcessing(false);
          console.error('Worker error:', payload.message);
        }
      };

      worker.onerror = (e: ErrorEvent) => {
        state.setIsProcessing(false);
        console.error('Worker error:', e.message);
      };

      workerRef.current = worker;

      // If we already have a cached image when worker mounts, process it
      if (currentImageRef.current) {
        dispatchProcess(currentImageRef.current);
      }

      return () => {
        worker.terminate();
        workerRef.current = null;
      };
    } catch (error) {
      console.warn('Could not create worker:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-process when rendering settings change and an image is loaded
  useEffect(() => {
    if (currentImageRef.current && state.inputMode === 'image') {
      dispatchProcess(currentImageRef.current);
    }
  }, [
    state.common,
    state.ascii,
    state.braille,
    state.outputMode,
    state.inputMode,
    state.theme,
    dispatchProcess,
  ]);

  // Process text when text or settings change
  useEffect(() => {
    if (state.inputMode !== 'text') return;
    if (!state.text?.text?.trim()) {
      // If text is empty, clear output and return
      state.setOutputArt('');
      state.setOutputCols(0);
      state.setOutputRows(0);
      state.setIsProcessing(false);
      return;
    }

    state.setIsProcessing(true);
    state.setOutputArt(''); // Clear previous output

    // Handle FIGlet engine separately - bypass image processing pipeline
    if (state.text.engine === 'figlet') {
      // Apply wrap width to INPUT text before FIGlet processing
      const wrappedInput = state.text.wrapWidth > 0 ? wrapText(state.text.text, state.text.wrapWidth) : state.text.text;

      renderFiglet(wrappedInput, state.text.figletFont, state.text.figletLayout as any)
        .then((figletText) => {
          // Set output art directly (no further wrapping - preserve FIGlet formatting)
          state.setOutputArt(figletText);

          // Calculate dimensions from FIGlet output
          const lines = figletText.split('\n');
          // Handle case where figletText might be empty or have trailing newlines
          const filteredLines = lines.filter(line => line.length > 0);
          const maxLineLength = Math.max(
            ...filteredLines.map(line => line.length),
            0
          );
          state.setOutputCols(maxLineLength);
          state.setOutputRows(lines.length); // Include empty lines for accurate row count

          state.setIsProcessing(false);
        })
        .catch(error => {
          state.setIsProcessing(false);
          console.error('Error rendering FIGlet text:', error);
        });
    } else {
      // Handle raster engine and image input mode using existing pipeline
      renderTextToBitmap({
        text: state.text,
        common: state.common,
        ascii: state.ascii,
        braille: state.braille,
        outputMode: state.outputMode,
      })
        .then(bitmap => {
          // Process the bitmap directly using the pure function (avoiding worker)
          const ramp =
            state.ascii.ramp === 'custom'
              ? state.ascii.customRamp || ASCII_RAMPS.classic
              : ASCII_RAMPS[state.ascii.ramp] || ASCII_RAMPS.classic;

          const result = processBitmapToArt(
            bitmap.data,
            bitmap.width,
            bitmap.height,
            state.common.columns, // outputWidth
            state.outputMode,
            state.common.brightness / 100, // brightness in [-1, 1]
            state.common.contrast,
            state.common.gamma,
            state.common.invert,
            ramp,
            state.common.dithering.algorithm,
            state.common.dithering.strength,
            state.common.dithering.serpentine,
            state.ascii.edgeEnabled,
            state.ascii.edgeThreshold,
            state.braille.fillBlank,
            state.braille.thresholdAuto,
            state.braille.threshold,
            state.theme === 'dark' ? { r: 14, g: 16, b: 21 } : { r: 255, g: 255, b: 255 }
          );

          state.setOutputArt(result.art);
          state.setOutputCols(result.cols);
          state.setOutputRows(result.rows);
          state.setIsProcessing(false);
        })
        .catch(error => {
          state.setIsProcessing(false);
          console.error('Error rendering text:', error);
        });
    }
  }, [
    state.text,
    state.common,
    state.ascii,
    state.braille,
    state.outputMode,
    state.inputMode,
    state.theme,
  ]);

  // Preserve and restore state when switching between input modes
  useEffect(() => {
    const prevMode = prevInputModeRef.current;
    const currMode = state.inputMode;

    // Save state when leaving a mode
    if (prevMode === 'text' && currMode === 'image') {
      // Leaving text mode: save current text state
      setPreservedTextState(state.text);
    } else if (prevMode === 'image' && currMode === 'text') {
      // Leaving image mode: save current image state
      setPreservedImageState({
        currentImage: currentImageRef.current,
        hasImage: state.hasImage,
        imageName: state.imageName
      });
    }

    // Restore state when entering a mode
    if (currMode === 'text' && preservedTextState !== null) {
      // Entering text mode: restore preserved text state
      state.setText(preservedTextState);
    } else if (currMode === 'image' && preservedImageState !== null) {
      // Entering image mode: restore preserved image state
      if (preservedImageState.currentImage !== null) {
        currentImageRef.current = preservedImageState.currentImage;
      }
      state.setHasImage(preservedImageState.hasImage);
      state.setImageName(preservedImageState.imageName);
    }

    // Update the previous mode for next comparison
    prevInputModeRef.current = currMode;
  }, [state.inputMode]);

  async function handleFileSelected(file: File) {
    state.setIsProcessing(true);
    state.setOutputArt(''); // Clear previous output

    try {
      const imageData = await loadImageFile(file);
      const { data, width, height } = getImageData(imageData);
      const cached = { data, width, height };
      currentImageRef.current = cached;

      state.setImageName(file.name);
      state.setHasImage(true);

      dispatchProcess(cached);
    } catch (error) {
      state.setIsProcessing(false);
      console.error('Error loading image:', error);
    }
  }

  async function handleUrlLoad(url: string) {
    state.setIsProcessing(true);
    state.setOutputArt(''); // Clear previous output

    try {
      const imageData = await loadImageUrl(url);
      const { data, width, height } = getImageData(imageData);
      const cached = { data, width, height };
      currentImageRef.current = cached;

      const urlName = url.split('/').pop()?.split('?')[0] || 'remote-image';
      state.setImageName(urlName);
      state.setHasImage(true);

      dispatchProcess(cached);
    } catch (error) {
      state.setIsProcessing(false);
      console.error('Error loading image:', error);
    }
  }

  return (
    <div className={styles.shell}>
      <Header
        theme={state.theme}
        onToggleTheme={state.toggleTheme}
        controlsOpen={state.controlsOpen}
        onToggleControls={() => state.setControlsOpen(!state.controlsOpen)}
        onShowControls={() => state.setControlsOpen(true)}
        onShowOutput={() => state.setControlsOpen(false)}
      />

      <section className={styles.hero} aria-labelledby="hero-title">
        <HeroBackdrop />
        <div className={styles.heroContent}>
          <div className={styles.heroBadges} aria-label="Highlights">
            <span className={styles.heroBadge}><strong>NEW</strong> Braille-ready rendering</span>
            <span className={styles.heroBadge}>✓ Client-side processing</span>
          </div>
          <h1 id="hero-title" className={styles.heroTitle}>
            Images and text,
            <br />
            into ASCII art.
          </h1>
          <p className={styles.heroCopy}>
            Convert an image or type text to pixel-perfect ASCII and Braille art—ready for code,
            chat, and creative projects.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.heroPrimary} onClick={() => state.setControlsOpen(true)}>
              Open generator
            </button>
            <a className={styles.heroSecondary} href="#features" onClick={event => scrollToSection(event, 'features')}>
              See features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className={styles.body} aria-label="Generator features">
        <div
          className={`${state.controlsOpen ? styles.controlsPaneOpen : styles.controlsPane} fade-in-up`}
          style={{ animationDelay: '60ms' }}
        >
          <ControlsPanel
            state={state}
            onFileSelected={handleFileSelected}
            onUrlLoad={handleUrlLoad}
          />
        </div>

        <div id="output-panel" className={`${styles.outputPane} fade-in-up`} style={{ animationDelay: '120ms' }}>
          <OutputPanel
            hasContent={state.outputArt?.length > 0}
            art={state.outputArt}
            cols={state.outputCols}
            rows={state.outputRows}
            zoom={state.zoom}
            onZoomChange={state.setZoom}
            onChooseImage={() => state.setControlsOpen(true)}
          />
        </div>
      </section>

      <section id="docs" className={styles.about} aria-labelledby="about-title">
        <DocsBackdrop />
        <div className={styles.aboutInner}>
          <h2 id="about-title">What is ASCII & Braille Art Generator?</h2>
          <p>
            ASCII & Braille Art Generator is a free, browser-based tool that transforms images
            and text into artwork made from characters. It turns pixels into expressive patterns
            you can copy into code, chat, documentation, or creative projects.
          </p>
          <p>
            Everything runs locally in your browser. Your images stay on your device, with no
            account, upload, or server-side processing required.
          </p>

          <h3>Image to ASCII and Braille</h3>
          <p>
            Upload an image or paste a URL, then tune width, brightness, contrast, gamma, stretch,
            dithering, and character ramps in real time. Switch between ASCII for familiar text
            art and Braille for denser, higher-resolution output.
          </p>

          <h3>Made for sharing</h3>
          <p>
            Copy aligned text for Discord, Twitch, YouTube, and terminals, or export a PNG when
            you want the artwork to keep its exact visual shape across platforms.
          </p>
        </div>
      </section>
      <Footer onOpenGenerator={() => state.setControlsOpen(true)} />
      <StatusRegion message={state.isProcessing ? (state.inputMode === 'text' ? 'Processing text...' : 'Processing image...') : ''} />
    </div>
  );
}