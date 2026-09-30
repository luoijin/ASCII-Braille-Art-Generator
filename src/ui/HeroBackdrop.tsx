import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './HeroBackdrop.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const image = backdropRef.current?.querySelector('img');
      const hero = backdropRef.current?.parentElement;
      if (!image || !hero) return;
      const initialOpacity = parseFloat(getComputedStyle(image).opacity);

      gsap.fromTo(
        image,
        { scale: 1, opacity: initialOpacity },
        {
          scale: 1.08,
          opacity: initialOpacity * 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      );
    },
    { scope: backdropRef },
  );

  return (
    <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
      <img
        className={styles.image}
        src="/ascii-braille-hero-bg.png"
        alt=""
        fetchpriority="high"
      />
    </div>
  );
}
