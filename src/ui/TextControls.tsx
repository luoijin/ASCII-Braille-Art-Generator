import { useEffect, useState } from 'react';
import { OutputMode, TextSettings } from '../state/types';
import { Segmented } from './controls/Segmented';
import { SliderField } from './controls/SliderField';
import { ToggleField } from './controls/ToggleField';
import styles from './ControlsPanel.module.css';

interface TextControlsProps {
  outputMode: OutputMode;
  text: TextSettings;
  setText: (patch: Partial<TextSettings>) => void;
}

/** Braille output requires the raster engine (see docs/text-mode.md#overview);
 * the engine switch is disabled in that case rather than hidden, so it's clear why. */

export function TextControls({ outputMode, text, setText }: TextControlsProps) {
  const engineLocked = outputMode === 'braille';

  const [fontManifest, setFontManifest] = useState<Array<{name: string; category: string; file: string; bytes: number}>>([]);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the figlet font manifest
    fetch('/fonts/figlet-fonts.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load font manifest: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setFontManifest(data);
        setManifestLoaded(true);
        setManifestError(null);
      })
      .catch(error => {
        console.warn('Could not load figlet font manifest, falling back to hardcoded fonts:', error);
        setManifestLoaded(true); // still consider loaded so we can show fallback
        setManifestError(error.message);
      });
  }, []);

  // Fallback hardcoded font groups (used if manifest fails to load)
  const hardcodedFontGroups = [
    { label: 'Popular', fonts: ['Standard', 'Slant', 'Big'] },
    { label: '3D and Shadow', fonts: ['ANSI Shadow'] },
    { label: 'Bold and Block', fonts: ['Block'] },
  ];

  // Build font groups from manifest
  const fontGroups = manifestLoaded
    ? manifestError
      ? hardcodedFontGroups // fallback on error
      : Object.entries(
          fontManifest.reduce((acc, font) => {
            const category = font.category || 'All';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(font.name);
            return acc;
          }, {} as Record<string, string[]>)
        ).map(([label, fonts]) => ({ label, fonts: fonts.sort() }))
    : []; // empty while loading

  return (
    <>
      <section className={styles.section}>
        <h3 className={styles.sectionLabel}>Text</h3>
        <textarea
          aria-label="Text to convert"
          placeholder="Type something"
          value={text.text}
          onChange={e => setText({ text: e.target.value })}
          rows={4}
          style={{
            width: '100%',
            resize: 'vertical',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text)',
            padding: 8,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            marginTop: 8,
          }}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionLabel}>Engine</h3>
        <Segmented
          ariaLabel="Text engine"
          value={engineLocked ? 'raster' : text.engine}
          options={[
            { value: 'figlet', label: 'FIGlet' },
            { value: 'raster', label: 'Raster' },
          ]}
          onChange={v => !engineLocked && setText({ engine: v })}
        />
        {engineLocked && <p className={styles.hint}>Braille output uses the raster engine.</p>}
      </section>

      {text.engine === 'figlet' && !engineLocked ? (
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Font</h3>
          <select
            aria-label="FIGlet font"
            value={text.figletFont}
            onChange={e => setText({ figletFont: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: 8,
            }}
          >
            {manifestLoaded && manifestError ? (
              <optgroup label="Error loading fonts">
                <option value="">Failed to load font list</option>
              </optgroup>
            ) : (
              <>
                {fontGroups.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.fonts.map(font => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {/* If manifest is still loading, show a placeholder */}
                {!manifestLoaded && (
                  <optgroup label="Loading fonts...">
                    <option value="" disabled>Loading...</option>
                  </optgroup>
                )}
              </>
            )}
          </select>

          <h3 className={styles.sectionLabel} style={{ marginTop: 12 }}>
            Layout
          </h3>
          <select
            aria-label="FIGlet layout"
            value={text.figletLayout}
            onChange={e => setText({ figletLayout: e.target.value as TextSettings['figletLayout'] })}
            style={{
              width: '100%',
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: 8,
            }}
          >
            <option value="default">Default</option>
            <option value="full">Full</option>
            <option value="fitted">Fitted</option>
            <option value="controlled smushing">Controlled smushing</option>
            <option value="universal smushing">Universal smushing</option>
          </select>
        </section>
      ) : (
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Font</h3>
          <select
            aria-label="Raster font family"
            value={text.fontFamily}
            onChange={e => setText({ fontFamily: e.target.value })}
            style={{
              width: '100%',
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: 8,
            }}
          >
            <option value="Inter">Inter</option>
            <option value="IBM Plex Mono">IBM Plex Mono</option>
            <option value="Playfair Display">Playfair Display</option>
          </select>
          <SliderField
            label="Weight"
            value={text.fontWeight}
            min={100}
            max={900}
            step={100}
            onChange={v => setText({ fontWeight: v })}
          />
          <SliderField
            label="Line height"
            value={text.lineHeight}
            min={0.8}
            max={2}
            step={0.05}
            format={v => v.toFixed(2)}
            onChange={v => setText({ lineHeight: v })}
          />
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionLabel}>Layout</h3>
        <Segmented
          ariaLabel="Text alignment"
          value={text.align}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
          onChange={v => setText({ align: v })}
        />
        <SliderField
          label="Wrap width"
          value={text.wrapWidth}
          min={0}
          max={200}
          step={1}
          onChange={v => setText({ wrapWidth: v })}
        />
      </section>

      <section className={styles.section}>
        <ToggleField label="Color gradient" checked={text.gradient} onChange={v => setText({ gradient: v })} />
        {text.gradient && (
          <>
            <Segmented
              ariaLabel="Gradient direction"
              value={text.gradientDirection}
              options={[
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
              ]}
              onChange={v => setText({ gradientDirection: v })}
            />
          </>
        )}
      </section>
    </>
  );
}