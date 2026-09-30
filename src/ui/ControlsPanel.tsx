import { AppState } from '../state/useAppState';
import { ExportPanel } from './ExportPanel';
import { ImageDropZone } from './ImageDropZone';
import { RenderingControls } from './RenderingControls';
import { Segmented } from './controls/Segmented';
import { TextButton } from './controls/TextButton';
import { TextControls } from './TextControls';
import { AsciiIcon, BrailleIcon, ImageIcon, TextIcon } from './icons/Icons';
import styles from './ControlsPanel.module.css';

interface ControlsPanelProps {
  state: AppState;
  onFileSelected: (file: File) => void;
  onUrlLoad: (url: string) => void;
}

/** Left pane. Header + top switches stay fixed; the body scrolls on its own
 * (see docs/ui-spec.md#layout). Export lives at the bottom of this panel,
 * not the output pane, so it's reachable without losing your place in
 * the controls while adjusting settings. */
export function ControlsPanel({ state, onFileSelected, onUrlLoad }: ControlsPanelProps) {
  const {
    inputMode,
    setInputMode,
    outputMode,
    setOutputMode,
    common,
    setCommon,
    ascii,
    setAscii,
    braille,
    setBraille,
    text,
    setText,
    resetAll,
    hasImage,
  } = state;

  const hasContent = inputMode === 'image' ? hasImage : text.text.trim().length > 0;

  // Character count for export panel (length of first line of output)
  const charCount = state.outputArt.length > 0
    ? state.outputArt.split('\n')[0].length
    : 0;

  return (
    <div className={styles.panel} id="controls-panel">
      <div className={styles.header}>
        <span className={styles.title}>Controls</span>
        <TextButton variant="link" onClick={resetAll}>
          Reset all
        </TextButton>
      </div>

      <div className={styles.switches}>
        <Segmented
          ariaLabel="Input type"
          value={inputMode}
          options={[
            { value: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
            { value: 'text', label: 'Text', icon: <TextIcon size={14} /> },
          ]}
          onChange={setInputMode}
        />
        <Segmented
          ariaLabel="Output type"
          value={outputMode}
          options={[
            { value: 'ascii', label: 'ASCII', icon: <AsciiIcon size={14} /> },
            { value: 'braille', label: 'Braille', icon: <BrailleIcon size={14} /> },
          ]}
          onChange={setOutputMode}
        />
      </div>

      <div className={styles.scroll}>
        {inputMode === 'image' ? (
          <>
            <section className={styles.section} style={{ borderTop: 'none', paddingTop: 0 }}>
              <h3 className={styles.sectionLabel}>Image</h3>
              <ImageDropZone onFileSelected={onFileSelected} onUrlLoad={onUrlLoad} />
            </section>
            <RenderingControls
              outputMode={outputMode}
              common={common}
              setCommon={setCommon}
              ascii={ascii}
              setAscii={setAscii}
              braille={braille}
              setBraille={setBraille}
            />

            <ExportPanel
              outputMode={outputMode}
              hasContent={hasContent}
              charCount={charCount}
              onCopyArt={() => {}}
              onDiscord={() => {}}
              onFullWidth={() => {}}
              onCopyImage={() => {}}
              onDownloadPng={() => {}}
              onDownloadTxt={() => {}}
            />
          </>
        ) : (
          <>
            <TextControls outputMode={outputMode} text={text} setText={setText} />
            <RenderingControls
              outputMode={outputMode}
              common={common}
              setCommon={setCommon}
              ascii={ascii}
              setAscii={setAscii}
              braille={braille}
              setBraille={setBraille}
            />

            <ExportPanel
              outputMode={outputMode}
              hasContent={hasContent}
              charCount={charCount}
              onCopyArt={() => {}}
              onDiscord={() => {}}
              onFullWidth={() => {}}
              onCopyImage={() => {}}
              onDownloadPng={() => {}}
              onDownloadTxt={() => {}}
            />
          </>
        )}
      </div>
    </div>
  );
}