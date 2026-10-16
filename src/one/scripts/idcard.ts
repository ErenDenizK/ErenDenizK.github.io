/* The ID card's behaviour (design spec §3.4 item 1, §4.7). One pendulum: the lanyard, the clip and the
   card turn together about the anchor (rotate on .pend, origin at the anchor). Physics is the family
   kit's spring solver (docs/family-kit/springs.js), never a fork of it: the swing settles on the
   portfolio's settle role, with its bounce raised a little so a pendulum reads as one (clamped ±22°).
   - Arrival: when the card first comes into view it drops from 9° and swings to rest.
   - A mouse can pull it (the angle follows the pointer about the anchor) and let go: it swings back.
   - A click, a tap, Enter or Space turns it over (700 ms on the kit's glide curve; aria-pressed).
   - A fine pointer tilts the card a few degrees toward it and moves the glare and the back's sheen.
   Reduced motion: no swing, no tilt; the turn is a crossfade (IdCard.astro). */
import { spring, solve } from '../../../docs/family-kit/springs.js';
import { motion } from './bus';

const MAX = 22;                                        // the widest swing, in degrees
const SWING = spring({ duration: 1.1, bounce: 0.42 }); // a pendulum: slower and livelier than the UI settle
const DRAG = 4;                                        // px before a press becomes a pull

export function initIdCard(root: ParentNode = document) {
  for (const el of root.querySelectorAll<HTMLElement>('[data-idcard]')) mount(el);
}

function mount(el: HTMLElement) {
  const pend = el.querySelector<HTMLElement>('[data-pend]')!;
  const card = el.querySelector<HTMLElement>('[data-card]')!;
  const btn = el.querySelector<HTMLButtonElement>('[data-turn]')!;
  const front = el.querySelector<HTMLElement>('[data-face="front"]')!;
  const back = el.querySelector<HTMLElement>('[data-face="back"]')!;
  const live = motion() === 'full';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- turning over ---------- */
  let turned = false;
  const turn = () => {
    turned = !turned;
    card.classList.toggle('is-turned', turned);
    card.style.setProperty('--turned', turned ? '180deg' : '0deg');
    btn.setAttribute('aria-pressed', String(turned));
    btn.setAttribute('aria-label', turned ? 'Turn the card back to the front' : 'Turn the card over');
    front.setAttribute('aria-hidden', String(turned));
    back.setAttribute('aria-hidden', String(!turned));
  };

  /* ---------- the swing ---------- */
  let angle = 0, vel = 0, raf = 0, t0 = 0, x0 = 0, v0 = 0;
  const draw = () => pend.style.setProperty('--sw', `${angle.toFixed(3)}deg`);
  const release = (from: number, v: number) => {
    if (!live) return;
    cancelAnimationFrame(raf);
    x0 = Math.max(-MAX, Math.min(MAX, from)); v0 = v; t0 = performance.now();
    const step = (now: number) => {
      const [x, xv] = solve(SWING, x0, v0, (now - t0) / 1000);
      angle = x; vel = xv; draw();
      if (Math.abs(x) > 0.02 || Math.abs(xv) > 0.05) raf = requestAnimationFrame(step);
      else { angle = 0; draw(); }
    };
    raf = requestAnimationFrame(step);
  };

  /* arrival: it drops into view and swings to rest, once */
  if (live) {
    angle = 9; draw();
    const io = new IntersectionObserver((e) => {
      if (!e.some((x) => x.isIntersecting)) return;
      io.disconnect();
      release(9, 0);
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(card);
  }

  /* ---------- pull with a mouse; click, tap or key to turn ---------- */
  let down: { x: number; y: number; ax: number; ay: number; id: number } | null = null;
  let pulled = false, lastA = 0, lastT = 0;
  btn.addEventListener('pointerdown', (e) => {
    if (!live || e.pointerType !== 'mouse' || e.button !== 0) return;
    const r = el.getBoundingClientRect();   // the anchor: the top centre of the card's box (the strap's top)
    down = { x: e.clientX, y: e.clientY, ax: r.left + r.width / 2, ay: r.top, id: e.pointerId };
    pulled = false; lastA = angle; lastT = e.timeStamp;
  });
  btn.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id) return;
    if (!pulled && Math.hypot(e.clientX - down.x, e.clientY - down.y) < DRAG) return;
    if (!pulled) { pulled = true; btn.setPointerCapture(e.pointerId); el.classList.add('is-held'); cancelAnimationFrame(raf); }
    /* the angle of the pointer about the anchor, eased toward the clamp */
    const raw = Math.atan2(down.ax - e.clientX, Math.max(40, e.clientY - down.ay)) * 180 / Math.PI;
    const a = MAX * Math.tanh(raw / MAX);
    const dt = Math.max(1, e.timeStamp - lastT) / 1000;
    vel = (a - lastA) / dt; lastA = a; lastT = e.timeStamp;
    angle = a; draw();
  });
  const up = (e: PointerEvent) => {
    if (!down || e.pointerId !== down.id) return;
    down = null;
    el.classList.remove('is-held');
    if (pulled) release(angle, Math.max(-400, Math.min(400, vel)));
  };
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('click', (e) => {
    if (pulled) { pulled = false; e.preventDefault(); return; }
    turn();
    if (live && e.detail) release(angle, (Math.random() < 0.5 ? -1 : 1) * 30);   // a small sway from the touch
  });

  /* ---------- tilt and light toward a fine pointer ---------- */
  if (live && fine) {
    let tr = 0;
    el.addEventListener('pointermove', (e) => {
      if (down) return;
      cancelAnimationFrame(tr);
      tr = requestAnimationFrame(() => {
        card.style.setProperty('--tilt-t', '120ms');
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(tr);
      card.style.setProperty('--tilt-t', '500ms');
      card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
    });
  }
}
