/* The scroll scenes' fallback driver (spec v2 §7; scene.css). Where the browser has view timelines
   (Chromium, Safari 26) CSS animates each scene's --p and this file does nothing. Elsewhere it writes
   the same cover progress from the document's scroll position: one style write per changed scene per
   frame, only while the page moves. Layout is read on resize and on content changes, never per frame
   (motion contract rule 4). Under reduced motion or ?still nothing runs and --p keeps its rest value 1. */
import { motion } from './bus';

type Scene = { el: HTMLElement; top: number; h: number; p: number };

export function initScene() {
  if (motion() === 'reduced' || CSS.supports('animation-timeline: view()')) return;
  const scenes: Scene[] = [...document.querySelectorAll<HTMLElement>('[data-scene]')].map((el) => ({ el, top: 0, h: 0, p: -1 }));
  if (!scenes.length) return;
  const measure = () => {
    const y = scrollY;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + y; s.h = r.height; s.p = -1;
    }
  };
  let queued = false;
  const frame = () => {
    queued = false;
    const vh = innerHeight, y = scrollY;
    for (const s of scenes) {
      const p = Math.min(1, Math.max(0, (y + vh - s.top) / (s.h + vh)));
      if (Math.abs(p - s.p) < 0.0005) continue;
      s.p = p;
      s.el.style.setProperty('--p', p.toFixed(4));
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  measure();
  frame();
  addEventListener('scroll', queue, { passive: true });
  new ResizeObserver(() => { measure(); queue(); }).observe(document.body);
}
