/* The glass family's lab versions (src/one/glass.css; glass study V7) and its liquid motion (S15,
   glass-motion.ts), which every version shares. Version a paints with CSS only. b and c load their script only when the switch asks for them, so the default page pays
   nothing. Glass objects that appear later (an opened project's capsules, the photo view's capsules) are
   picked up by a MutationObserver. */
import { initGlassMotion } from './glass-motion';

export const GLASS = '.tabs, .glass, .pv-glass';

/** Calls fn once for every glass object now in the page and every one added later. */
export function eachGlass(fn: (el: HTMLElement) => void) {
  const seen = new WeakSet<HTMLElement>();
  const take = (root: ParentNode) => root.querySelectorAll<HTMLElement>(GLASS).forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    fn(el);
  });
  take(document);
  new MutationObserver((list) => {
    for (const r of list) for (const n of r.addedNodes) if (n instanceof HTMLElement) {
      if (n.matches(GLASS)) take(n.parentNode ?? document);
      else take(n);
    }
  }).observe(document.body, { childList: true, subtree: true });
}

export function initGlass() {
  const v = document.documentElement.dataset.glass;
  /* the liquid motion (S15) belongs to every version: it moves the body, the versions only paint it */
  initGlassMotion();
  if (matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
  if (v === 'b') void import('./glass-b').then((m) => m.initLens());
  if (v === 'c') void import('./glass-c').then((m) => m.initLight());
}
