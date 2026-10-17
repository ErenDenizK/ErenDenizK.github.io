/* In-page travel on the two-page Home (review rows S14 and S33, owner 2026-10-17: "it closes without
   animation and scrolls slowly to Work"; "the buttons on the first screen that go to the projects jump at
   once; they must travel animated through the page"). One function for the rail's names (bloom.ts) and the
   brief's project links: the page is travelled through, frame by frame, so every scroll scene on the way
   plays (the plate's handover, the Work flights), instead of a cut or the browser's own smooth scroll, whose
   duration the browser chooses. The numbers are from the first-screen study (round six, §5), a little
   quicker because the owner found the old travel slow:

   - duration clamp(480 + 340 log2(1 + d / vh), 760, 1600) ms: a near section in under a second, the whole
     page in 1.6 s at most;
   - curve cubic-bezier(.55, 0, .12, 1): a firm launch, a long cruise and a soft landing, no overshoot;
   - the target is read again every frame, so a picture that loads on the way never makes it land short;
   - a wheel, a touch, a key or a press stops it at once, and the page stays where it is.

   The clock is the document timeline, so the travel keeps time with the CSS and WAAPI motion around it (and
   a slowed timeline slows it too, which the frame sequences use). Reduced motion or ?still: the page goes
   at once. Without JavaScript the links stay plain anchors. */
import { reduce } from '../../scripts/env';
import type { HomeRail } from './bloom';

const root = document.documentElement;
const still = () => reduce() || root.classList.contains('still');
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** a cubic Bézier easing as a function of time (Newton steps on x, then y) */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let k = 0; k < 8; k++) { const e = sx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
    return sy(clamp(t, 0, 1));
  };
}
const curve = bezier(0.55, 0, 0.12, 1);
/** the travel's duration for a distance, in ms */
export const travelTime = (d: number, vh: number) => clamp(480 + 340 * Math.log2(1 + Math.abs(d) / vh), 760, 1600);
/** the document timeline's time (ms): the clock of the travel and of the rail's press */
export const now = () => (document.timeline?.currentTime as number | null) ?? performance.now();
/** run `fn` after `ms` on that clock; returns a cancel function */
export function after(ms: number, fn: () => void) {
  const t1 = now() + ms;
  let raf = 0;
  const w = () => { if (now() >= t1) fn(); else raf = requestAnimationFrame(w); };
  if (ms <= 0) fn(); else raf = requestAnimationFrame(w);
  return () => cancelAnimationFrame(raf);
}

export interface Scroller { y(): number; set(y: number): void; vh(): number }
const page: Scroller = { y: () => scrollY, set: (y) => scrollTo({ top: y, behavior: 'instant' }), vh: () => innerHeight };

let live: { stop(): void } | null = null;
/** Stop a travel under way; the page stays where it is. */
export const stopTravel = () => live?.stop();

/** Travel to `to()` (read again every frame). Starts after `delay` ms; returns the travel's duration. */
export function travel(to: () => number, o: { scroller?: Scroller; delay?: number; onLand?: () => void } = {}) {
  const sc = o.scroller ?? page;
  stopTravel();
  const y0 = sc.y(), d0 = to() - y0;
  if (still() || Math.abs(d0) < 2) { sc.set(to()); o.onLand?.(); return 0; }
  const dur = travelTime(d0, sc.vh());
  let raf = 0, t0 = -1, from = y0;
  const ac = new AbortController();
  const stop = () => { cancelAnimationFrame(raf); ac.abort(); if (live === me) live = null; };
  const me = { stop };
  live = me;
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, stop, { passive: true, capture: true, signal: ac.signal });
  const start = now() + (o.delay ?? 0);
  const step = () => {
    const t = now();
    if (t < start) { raf = requestAnimationFrame(step); return; }
    /* the launch reads the page where it is then (the delay may have let a scene settle) */
    if (t0 < 0) { t0 = t; from = sc.y(); }
    const k = clamp((t - t0) / dur, 0, 1);
    sc.set(from + (to() - from) * curve(k));
    if (k < 1) raf = requestAnimationFrame(step);
    else { stop(); o.onLand?.(); }
  };
  raf = requestAnimationFrame(step);
  return dur;
}

/** The brief's project links (S33): the chip gives under the press, its coloured dot flies on an arc into
    the project's bead on the rail, which lights in the project's colour (the rail acknowledges the choice,
    as the round-six study proposed), and the page travels there. The hash follows without a history entry,
    as the rail's names do; a keyboard press moves focus to the project. */
export function initBriefLinks(homeRail: () => HomeRail | null) {
  const chips = document.querySelectorAll<HTMLAnchorElement>('#brief a.chip[href^="#"]');
  chips.forEach((a) => a.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const id = decodeURIComponent(a.hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const keyboard = e.detail === 0;
    const rail = homeRail();
    const i = rail ? rail.index(el) : -1;
    const top = () => (rail && i >= 0 ? rail.api.top(i) : Math.max(0, el.getBoundingClientRect().top + scrollY));
    const land = () => {
      history.replaceState(history.state, '', '#' + id);
      if (keyboard) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    };
    if (still()) { travel(top, { onLand: land }); return; }
    /* the press: the chip gives and springs back (the liquid-glass press of S15 may replace this) */
    a.animate([{ scale: 1 }, { scale: 0.93, offset: 0.22 }, { scale: 1 }], { duration: 560, easing: 'cubic-bezier(.34, 1.4, .64, 1)' });
    const dot = a.querySelector<HTMLElement>('.dot');
    if (dot && rail && i >= 0) rail.fly(dot, i, getComputedStyle(a).getPropertyValue('--c').trim());
    travel(top, { delay: 260, onLand: land });
  }));
}
