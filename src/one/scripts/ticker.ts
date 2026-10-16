/* The page's one scroll source and its one clock (spec v2 §7, motion contract rules 1, 2, 4 and 20).

   The source: the real scroll position of the document (or of a layer). On desktop the wheel is
   smoothed: each notch moves a target, and every frame the position moves 10 % of the way there
   (lerp 0.1 per 60 Hz frame, k = 1 - 0.9^(dt / 16.67)). The position is written with scrollTo, so Back,
   anchors, the keyboard, find-in-page and the rail still meet a real scroll position. Touch scrolls
   natively (its own momentum). This is the own-lerp fallback that spec v2 §7 rule 1 names; it needs no
   dependency. Wheel input is left native when it falls on an inner scroller that can still scroll that
   way, when Ctrl is held (zoom) and when it is mostly horizontal.

   The clock: one requestAnimationFrame loop. Each frame reads the scroll position once, derives the
   smoothed velocity (px/s, time constant 90 ms) and calls every subscriber with the same frame. It runs
   while the smoothing moves, while the velocity decays, or while a subscriber asks for one more frame
   (pointer parallax settling), and sleeps otherwise. Under reduced motion or ?still nothing here starts
   (rule 20): the subscribers are called once on load and on resize, so still pages stay correct. */

export interface Frame {
  /** the scroll position of the page */
  y: number;
  /** smoothed velocity, px/s, positive downward */
  v: number;
  vh: number;
  vw: number;
  /** ms since the last frame (16.7 on the first) */
  dt: number;
  t: number;
}
/** A subscriber returns true to ask for one more frame although the page is still. */
type Sub = (f: Frame) => boolean | void;

const root = document.documentElement;
const still = () => root.classList.contains('still');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

const subs = new Set<Sub>();
let raf = 0, last = 0, lastY = -1, v = 0, paused = false, more = false;
const frame: Frame = { y: 0, v: 0, vh: innerHeight, vw: innerWidth, dt: 16.7, t: 0 };

function tick(t: number) {
  raf = 0;
  const dt = last ? Math.min(64, Math.max(1, t - last)) : 16.7;
  last = t;
  let moving = false;
  for (const s of smoothers) if (!(paused && s.page) && s.step(dt)) moving = true;
  /* paused (a layer is open, a view transition runs): only a layer's own smoothing still moves */
  if (paused) { if (moving) raf = requestAnimationFrame(tick); else last = 0; return; }
  const y = scrollY;
  if (lastY < 0) lastY = y;
  /* a jump (a key, an anchor, the rail: over 40 % of a view in one frame) is not a speed; the raw value
     is clamped, and a still page lets the velocity fall faster (60 ms) than a moving one follows it */
  const dy = y - lastY;
  const raw = Math.abs(dy) > frame.vh * 0.4 ? 0 : Math.max(-4000, Math.min(4000, (dy / dt) * 1000));
  lastY = y;
  v += (raw - v) * (1 - Math.exp(-dt / (raw === 0 ? 60 : 90)));
  if (Math.abs(v) < 4 && raw === 0) v = 0;
  frame.y = y; frame.v = v; frame.dt = dt; frame.t = t;
  more = false;
  for (const s of subs) if (s(frame)) more = true;
  if (moving || v !== 0 || more) raf = requestAnimationFrame(tick);
  else last = 0;
}

/** Ask for a frame (a scroll, a resize, a layout change, a pointer move). */
export function kick(): void {
  if (!raf) raf = requestAnimationFrame(tick);
}

/** Subscribe to the frame. Returns the unsubscribe function. The first call happens on the next frame. */
export function onFrame(fn: Sub): () => void {
  subs.add(fn);
  kick();
  return () => subs.delete(fn);
}

/** Stop the page's subscribers and its smoothing (a view transition starts, a layer opens: rule 17).
    A layer's own smoothing keeps running. */
export function pauseTicker(on: boolean): void {
  if (on === paused) return;
  paused = on;
  if (on) { v = 0; for (const s of smoothers) if (s.page) s.sync(); }
  else { lastY = scrollY; v = 0; kick(); }
}

/** The velocity now (px/s), for code that is not a subscriber. */
export const velocity = () => v;

/* ---- smoothing ---- */

interface Smoother { step(dt: number): boolean; sync(): void; page: boolean; destroy(): void }
const smoothers = new Set<Smoother>();

/** True where wheel smoothing applies: a fine pointer, motion welcome. */
export const smoothOK = () => !still() && fine.matches;

/** Can `el` or an ancestor below `stop` still scroll in the direction of dy? Then the wheel is theirs. */
function innerTakes(el: Element | null, stop: Element, dy: number): boolean {
  for (let n = el; n && n !== stop && n !== document.body && n !== root; n = n.parentElement) {
    if (!(n instanceof HTMLElement)) continue;
    if (n.scrollHeight <= n.clientHeight + 1) continue;
    const oy = getComputedStyle(n).overflowY;
    if (oy !== 'auto' && oy !== 'scroll') continue;
    if (dy > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0) return true;
    if (getComputedStyle(n).overscrollBehaviorY !== 'auto') return true;
  }
  return false;
}

/** Smooth the wheel on a scroller (the window, or a layer). Destroy it when the scroller goes away. */
export function createSmoother(scroller: HTMLElement | Window = window): { destroy(): void } {
  const page = scroller === window;
  const el = page ? root : (scroller as HTMLElement);
  const get = () => (page ? scrollY : el.scrollTop);
  const max = () => (page ? root.scrollHeight - innerHeight : el.scrollHeight - el.clientHeight);
  const set = (y: number) => (page ? window.scrollTo(0, y) : (el.scrollTop = y));
  let target = get(), cur = target, on = false, wrote = -1;
  const ac = new AbortController();

  const s: Smoother = {
    page,
    step(dt) {
      if (!on) return false;
      /* something else moved the scroll (a key, the rail, find-in-page): follow it, stop smoothing */
      const now = get();
      if (wrote >= 0 && Math.abs(now - wrote) > 2) { s.sync(); return false; }
      const k = 1 - Math.pow(0.9, dt / 16.67);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < 0.4) { cur = target; on = false; }
      const y = Math.round(cur * 2) / 2;
      set(y);
      wrote = get();
      return on;
    },
    sync() { on = false; wrote = -1; target = cur = get(); },
    destroy() { ac.abort(); smoothers.delete(s); },
  };
  smoothers.add(s);

  el.addEventListener('wheel', (e: WheelEvent) => {
    if (e.defaultPrevented || e.ctrlKey || paused && page || !smoothOK()) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (page && root.classList.contains('layer-open')) return;
    if (innerTakes(e.target as Element, el, e.deltaY)) return;
    const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? (page ? innerHeight : el.clientHeight) : 1;
    if (!on) { target = cur = get(); }
    target = Math.max(0, Math.min(max(), target + e.deltaY * unit));
    if (target === cur && !on) return;
    e.preventDefault();
    on = true;
    wrote = -1;
    kick();
  }, { passive: false, signal: ac.signal });
  /* a scroll the smoothing did not write: the clock still has to see it */
  (page ? window : el).addEventListener('scroll', () => { if (!on) target = cur = get(); kick(); }, { passive: true, signal: ac.signal });
  addEventListener('resize', () => s.sync(), { passive: true, signal: ac.signal });
  return { destroy: s.destroy };
}

/* ---- the page ---- */

let started = false;
/** Start the page's source: the window's smoothing (desktop) and the clock's wake-ups. */
export function initTicker(): void {
  if (started) return;
  started = true;
  const resize = () => { frame.vh = innerHeight; frame.vw = innerWidth; kick(); };
  addEventListener('resize', resize, { passive: true });
  if (still()) {
    /* still twins: one call on load and on resize, no loop, no smoothing */
    const once = () => { frame.y = scrollY; frame.v = 0; for (const s of subs) s(frame); };
    addEventListener('resize', once, { passive: true });
    addEventListener('load', once);
    return;
  }
  addEventListener('scroll', kick, { passive: true });
  createSmoother(window);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  kick();
}
