/* The one scroll driver for browsers without scroll timelines (design spec §7.1; Firefox, iOS 18). Every
   scene is written once as CSS keyframes. Where `animation-timeline: scroll()` works the timeline drives
   it and this file does nothing. Elsewhere the CSS holds the animation paused at a 1 s duration with
   animation-delay: calc(var(--p) * -1s), and this sets --p from the scroll position: one style write per
   scene per frame, only while the page moves. data-scrub="<from> <to>" is the range in screens (vh) of
   the page's scroll. It reads the position from the page's one clock (ticker.ts, spec v2 §7 rule 2). */
import { motion } from './bus';
import { onFrame } from './ticker';

export function initScrub() {
  if (motion() === 'reduced' || CSS.supports('animation-timeline: scroll()')) return;
  const scenes = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map((el) => {
    const [a, b] = (el.dataset.scrub || '0 100').split(/\s+/).map(Number);
    return { el, a, b, p: -1 };
  });
  if (!scenes.length) return;
  onFrame((f) => {
    const vh = f.vh / 100, y = f.y;
    for (const s of scenes) {
      const p = Math.min(1, Math.max(0, (y - s.a * vh) / ((s.b - s.a) * vh)));
      if (Math.abs(p - s.p) < 0.001) continue;
      s.p = p;
      s.el.style.setProperty('--p', p.toFixed(4));
    }
  });
}
