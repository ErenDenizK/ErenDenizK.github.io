/* The liquid motion of the glass family (review row S15; glass.css "the liquid motion"). Every glass
   object (the Home/Record tab, the opened project's capsules, the photo view's capsules) behaves like a
   body of water held in a skin:
   - hover (fine pointers): the body leans and bulges a few pixels toward the pointer; the specular light
     and the rim's bright edge follow the pointer, so the light moves with the shape;
   - press: the body swells like a drop under the finger (it overshoots and contracts back while held), and
     the pressed item rises out of it with a light that spreads from the press point;
   - release: the body and the item contract past their rest size and settle with a soft overshoot.
   One damped spring of mass 1 per channel (the family kit's grammar, docs/family-kit/springs.js), stepped
   on requestAnimationFrame only while a channel moves; at rest no frame runs. Only transform and opacity
   change, so nothing lays out again. Reduced motion (html.still): no shape changes; the press light still
   rises and falls as a short fade. Without JavaScript the CSS hover and :active states of glass.css stay. */
import { eachGlass } from './glass';

const ITEMS = 'a, button';

type Ch = { x: number; v: number; t: number; k: number; c: number };
const ch = (k: number, c: number): Ch => ({ x: 0, v: 0, t: 0, k, c });
/* the springs (k stiffness, c damping; ζ = c / 2√k):
   lean 170/15 (ζ .58): a jelly that follows the pointer and wobbles once when it leaves;
   hover 200/24 (ζ .85): the presence of the pointer, no overshoot;
   press 380/15 (ζ .38): the drop, about 30 % overshoot each way, settled in about 550 ms */
const LEAN: [number, number] = [170, 15], HOVER: [number, number] = [200, 24], PRESS: [number, number] = [380, 15];
/* the press kick: the swell starts fast, so the drop overshoots its held size and contracts back */
const KICK = 9;
/* sizes in CSS pixels, so a small cross and a wide capsule give by the same amount */
const BULGE = 7, LIFT_X = 2.5, LIFT_Y = 1.5, SWELL_X = 7, SWELL_Y = 5, ITEM_GROW = 0.08;

interface Body {
  el: HTMLElement;
  lx: Ch; ly: Ch; h: Ch; p: Ch;
  item: HTMLElement | null; ip: Ch;
  hovering: boolean; pressing: boolean; running: boolean; last: number;
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

function step(c: Ch, dt: number) {
  /* semi-implicit Euler in 1/240 s steps: stable for these stiffnesses at any frame rate */
  const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
  for (let i = 0; i < n; i++) {
    c.v += (-c.k * (c.x - c.t) - c.c * c.v) * h;
    c.x += c.v * h;
  }
  if (Math.abs(c.x - c.t) < 1e-3 && Math.abs(c.v) < 1e-2) { c.x = c.t; c.v = 0; return false; }
  return true;
}

export function initGlassMotion() {
  const root = document.documentElement;
  const still = () => root.classList.contains('still');
  root.classList.add('g-live');

  eachGlass((el) => {
    const b: Body = {
      el, lx: ch(...LEAN), ly: ch(...LEAN), h: ch(...HOVER), p: ch(...PRESS),
      item: null, ip: ch(...PRESS), hovering: false, pressing: false, running: false, last: 0,
    };

    const paint = () => {
      const w = el.offsetWidth || 1, hh = el.offsetHeight || 1;
      const lx = b.lx.x, ly = b.ly.x, h = clamp(b.h.x, 0, 1), p = b.p.x;
      const reach = BULGE * Math.abs(lx) * h;
      const sx = 1 + (reach + SWELL_X * p) / w;
      const sy = 1 - (reach * 0.4) / hh + (SWELL_Y * p) / hh;
      el.style.transformOrigin = `${50 - clamp(lx, -1, 1) * 45}% ${50 - clamp(ly, -1, 1) * 30}%`;
      el.style.transform = `translate(${(lx * LIFT_X * h).toFixed(2)}px, ${(ly * LIFT_Y * h).toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      el.style.setProperty('--gx', `${(50 + clamp(lx, -1, 1) * 42).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(24 + clamp(ly, -1, 1) * 26).toFixed(1)}%`);
      el.style.setProperty('--gl', clamp(0.45 * h + 0.75 * p, 0, 1).toFixed(3));
      el.style.setProperty('--g-tilt', `${(-clamp(lx, -1, 1) * h * 38).toFixed(1)}deg`);
      if (b.item) {
        const s = 1 + ITEM_GROW * b.ip.x;
        b.item.style.transform = `scale(${s.toFixed(4)})`;
        b.item.style.setProperty('--ip', clamp(b.ip.x, 0, 1).toFixed(3));
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - b.last) / 1000 || 1 / 60);
      b.last = now;
      let moving = false;
      for (const c of [b.lx, b.ly, b.h, b.p, b.ip]) if (step(c, dt)) moving = true;
      paint();
      if (moving) requestAnimationFrame(frame);
      else {
        b.running = false;
        if (!b.hovering && !b.pressing) rest();
      }
    };
    const run = () => {
      if (b.running) return;
      b.running = true;
      b.last = performance.now();
      requestAnimationFrame(frame);
    };
    /* at rest the inline styles go, so the CSS states and the arrival transitions own the object again */
    const rest = () => {
      el.style.removeProperty('transform'); el.style.removeProperty('transform-origin');
      for (const p of ['--gx', '--gy', '--gl', '--g-tilt']) el.style.removeProperty(p);
      if (b.item && !b.pressing) { b.item.style.removeProperty('transform'); b.item.style.removeProperty('--ip'); b.item = null; }
    };

    const aim = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      b.lx.t = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      b.ly.t = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    const aimItem = (e: PointerEvent, it: HTMLElement) => {
      const r = it.getBoundingClientRect();
      it.style.setProperty('--ix', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      it.style.setProperty('--iy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };

    const press = (it: HTMLElement | null) => {
      if (b.item && b.item !== it) { b.item.style.removeProperty('transform'); b.item.style.removeProperty('--ip'); b.ip.x = 0; b.ip.v = 0; }
      b.item = it;
      b.pressing = true;
      if (still()) { if (it) it.style.setProperty('--ip', '1'); return; }
      b.p.t = 1; b.p.v += KICK;
      b.ip.t = 1; b.ip.v += KICK;
      run();
    };
    const release = () => {
      if (!b.pressing) return;
      b.pressing = false;
      if (still()) { b.item?.style.removeProperty('--ip'); b.item = null; return; }
      b.p.t = 0; b.ip.t = 0;
      if (!b.hovering) { b.h.t = 0; b.lx.t = 0; b.ly.t = 0; }
      run();
    };

    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || still()) return;
      b.hovering = true; b.h.t = 1; aim(e); run();
    });
    el.addEventListener('pointermove', (e) => {
      if (still() || (!b.hovering && !b.pressing)) return;
      aim(e);
      if (b.item) aimItem(e, b.item);
      run();
    });
    el.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      b.hovering = false; b.h.t = 0; b.lx.t = 0; b.ly.t = 0;
      if (b.pressing) release();
      run();
    });
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const it = (e.target as Element).closest<HTMLElement>(ITEMS);
      const item = it && el.contains(it) ? it : null;
      if (item) aimItem(e, item);
      /* a finger has no hover: the body leans toward the press point while it is held */
      if (e.pointerType !== 'mouse' && !still()) { b.h.t = 1; aim(e); }
      press(item);
    });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) el.addEventListener(t, release);
    /* a keyboard press: Enter or Space on a focused item plays the same drop, centred */
    el.addEventListener('keydown', (e) => {
      if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat) return;
      const it = (e.target as Element).closest<HTMLElement>(ITEMS);
      if (!it || !el.contains(it)) return;
      it.style.setProperty('--ix', '50%'); it.style.setProperty('--iy', '50%');
      press(it);
      setTimeout(release, 140);
    });
  });
}
