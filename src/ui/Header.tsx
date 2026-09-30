import { ExternalLinkIcon, GithubIcon, ImageIcon, MenuIcon, MoonIcon, SlidersIcon, SunIcon } from './icons/Icons';
import styles from './Header.module.css';
import { scrollToSection, scrollToTop } from '../app/navigation';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  controlsOpen: boolean;
  onToggleControls: () => void;
  onShowControls: () => void;
  onShowOutput: () => void;
}

export function Header({
  theme,
  onToggleTheme,
  controlsOpen,
  onToggleControls,
  onShowControls,
  onShowOutput,
}: HeaderProps) {
  return (
    <div className={`${styles.wrap} fade-in-up`}>
      <nav className={styles.nav} aria-label="Primary">
        <a
          className={styles.brand}
          href="/"
          aria-label="Open controls"
          onClick={event => {
            event.preventDefault();
            onShowControls();

            if (window.matchMedia('(min-width: 901px)').matches) {
              scrollToTop();
            }
          }}
        >
          <img className={styles.mark} src="/ascii-braille-logo-v2.png" alt="ASCII & Braille" />
          <span>ASCII &amp; Braille</span>
        </a>

        <div className={styles.links}>
          <a className={styles.link} href="#features" onClick={event => scrollToSection(event, 'features')}>
            Features
          </a>
          <a className={styles.link} href="#docs" onClick={event => scrollToSection(event, 'docs')}>
            Docs
          </a>
          
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.outputToggle}
            aria-label={controlsOpen ? 'Show output' : 'Show controls'}
            aria-controls={controlsOpen ? 'output-panel' : 'controls-panel'}
            onClick={controlsOpen ? onShowOutput : onToggleControls}
          >
            {controlsOpen ? <ImageIcon size={15} /> : <SlidersIcon size={15} />}
            <span className={styles.controlsToggleLabel}>{controlsOpen ? 'Output' : 'Controls'}</span>
          </button>
          <a
            className={styles.iconButton}
            href="https://github.com/luoijin/ASCII-Braille-Art-Generator"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
          >
            <GithubIcon size={16} />
          </a>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={controlsOpen ? 'Close controls' : 'Open controls'}
            aria-expanded={controlsOpen}
            aria-controls="controls-panel"
            onClick={onToggleControls}
          >
            <MenuIcon size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
}
