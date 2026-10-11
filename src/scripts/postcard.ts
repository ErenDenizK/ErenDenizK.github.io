/* Postcards you handle directly (ADR-0008, amendment of 2026-10-11 "postcards through the page"). The
   owner (brief log, 2026-10-11): "switching and turning by buttons is bad: more interactivity by
   tapping and clicking". Each postcard on About stands beside its chapter and is its own object:

   - a tap or a click turns it over (Enter and Space too: each face is a button, and focus follows to
     the other side). The turn is a spring with a little give (ζ ≈ 0.62), and the card lifts toward the
     viewer while it is edge-on, so it reads as a card picked up and turned, not a page flipping;
   - with a mouse or pen it can be picked up: it follows the hand on a rubber band (never more than a
     few dozen pixels), leans into the direction it is moved, and when it is let go it is tossed back to
     where it lay with the hand's speed and settles (ζ ≈ 0.5: one small overshoot, then still);
   - a sheen follows a mouse over it, and it leans a few degrees toward the pointer.

   Touch gets the tap only; vertical scrolling is never taken. No device orientation (it would need a
   permission prompt). Only the face toward the viewer is drawn, decided from the turn's angle on every
   frame, so WebKit cannot show the back first (ADR-0008, amendment "the front first").

   One loop per card, asleep at rest, CSS transforms only. Still twins (CLAUDE.md): reduced motion or
   ?still gets no lift, toss, lean or sheen, and the turn is a crossfade (.is-still in Postcard.astro).
   Without JavaScript the front stands with its caption. */
import { mq, motionOK } from './env';

type Spring = { x: number; v: number; to: number };
type K = [number, number];
const k = (stiff: number, zeta: number): K => [stiff, 2 * zeta * Math.sqrt(stiff)];
const TURN = k(150, 0.62);
const TOSS = k(170, 0.5);
const LEAN = k(260, 0.86);
const H = 1 / 240;
const sp = (x = 0): Spring => ({ x, v: 0, to: x });
function step(s: Spring, [kk, c]: K, dt: number) {
  s.v += (-kk * (s.x - s.to) - c * s.v) * dt;
  s.x += s.v * dt;
}
const rest = (s: Spring, eps: number) => Math.abs(s.x - s.to) < eps && Math.abs(s.v) < eps * 4;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
/** a rubber band: follows the hand at first, then gives less and less, never past `max` */
const band = (d: number, max: number) => max * Math.tanh(d / (max * 1.6));

export function initPostcards(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-postcard]').forEach(setup);
}

function setup(el: HTMLElement) {
  if (el.dataset.pcLive) return;
  const found = el.querySelector<HTMLElement>('[data-card-body]');
  const faces = [...el.querySelectorAll<HTMLElement>('[data-face]')];
  const turns = [...el.querySelectorAll<HTMLButtonElement>('[data-turn]')];
  if (!found || faces.length !== 2 || turns.length !== 2) return;
  const body: HTMLElement = found;
  el.dataset.pcLive = '1';

  const still = () => !motionOK();
  const canHand = () => mq.fine.matches && !still();
  /* x, y: px; rz: deg in the page's plane; rx, ry: lean; fl: the turn; lift 0..1; sh: the sheen */
  const x = sp(), y = sp(), rz = sp(), rx = sp(), ry = sp(), fl = sp(), lift = sp(), sh = sp();
  let flipped = false;
  let raf = 0, last = 0, acc = 0, suppress = false;
  let W = el.clientWidth || 300;

  function showFaces(yaw: number) {
    if (still()) { faces.forEach((f) => (f.style.opacity = '')); return; }
    const front = Math.cos((yaw * Math.PI) / 180) >= 0;
    faces[0].style.opacity = front ? '1' : '0';
    faces[1].style.opacity = front ? '0' : '1';
  }
  function faceState() {
    faces.forEach((f, i) => { f.inert = (i === 1) !== flipped; });
    el.classList.toggle('is-flipped', flipped);
    el.classList.toggle('is-still', still());
  }

  function turn() {
    const had = el.contains(document.activeElement);
    flipped = !flipped;
    faceState();
    if (had) turns[flipped ? 1 : 0].focus({ preventScroll: true });
    if (still()) { fl.x = fl.to = flipped ? 180 : 0; fl.v = 0; render(); return; }
    /* turn the way the card was last leaning, so a card nudged right turns over to the right */
    const dir = ry.x < -0.5 ? -1 : 1;
    fl.to = Math.round(fl.to / 180) * 180 + dir * 180;
    kick();
  }
  for (const b of turns) b.addEventListener('click', () => { if (suppress) return; turn(); });

  /* ---- hover: lean toward the pointer, a sheen where it is (mouse only) ---- */
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag?.moved || !canHand()) return;
    const r = body.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    /* on the back the horizontal sense is mirrored */
    const side = Math.cos((fl.x * Math.PI) / 180) >= 0 ? 1 : -1;
    ry.to = nx * 7; rx.to = -ny * 6; sh.to = 1; lift.to = 0.18;
    body.style.setProperty('--gx', (50 + nx * side * 42).toFixed(1) + '%');
    body.style.setProperty('--gy', (45 + ny * 40).toFixed(1) + '%');
    kick();
  });
  el.addEventListener('pointerleave', () => {
    if (drag?.moved) return;
    rx.to = ry.to = 0; sh.to = 0; lift.to = 0; kick();
  });

  /* ---- pick it up (mouse or pen): it follows on a rubber band and is tossed back ---- */
  type Drag = { id: number; x0: number; y0: number; moved: boolean; vx: number; vy: number; t: number; lx: number; ly: number };
  let drag: Drag | null = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch' || !canHand() || drag) return;
    W = el.clientWidth || W;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, vx: 0, vy: 0, t: e.timeStamp, lx: e.clientX, ly: e.clientY };
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      try { el.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
      el.classList.add('is-held');
    }
    const dt = (e.timeStamp - drag.t) / 1000;
    if (dt > 0.004) {
      const kk = dt > 0.1 ? 1 : 0.5;
      drag.vx += ((e.clientX - drag.lx) / dt - drag.vx) * kk;
      drag.vy += ((e.clientY - drag.ly) / dt - drag.vy) * kk;
      drag.t = e.timeStamp; drag.lx = e.clientX; drag.ly = e.clientY;
    }
    const max = clamp(W * 0.14, 28, 56);
    x.x = x.to = band(dx, max); x.v = 0;
    y.x = y.to = band(dy, max * 0.8); y.v = 0;
    /* it leans into the move: turns in the page's plane with the distance, tips with the speed */
    rz.to = clamp((x.x / W) * 22 + drag.vx * 0.0025, -9, 9);
    ry.to = clamp(drag.vx * 0.012, -16, 16);
    rx.to = clamp(-drag.vy * 0.01, -12, 12);
    lift.to = 1; sh.to = 1;
    kick();
  });
  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.moved) return;
    el.classList.remove('is-held');
    suppress = true;
    setTimeout(() => { suppress = false; }, 0);
    /* the toss: what the hand was doing when it let go becomes the springs' speed */
    const fresh = e.timeStamp - d.t < 100;
    const vx = fresh ? clamp(d.vx, -2600, 2600) : 0, vy = fresh ? clamp(d.vy, -2600, 2600) : 0;
    x.to = 0; y.to = 0; x.v = vx * 0.22; y.v = vy * 0.22;
    rz.to = 0; rz.v = vx * 0.03;
    ry.to = 0; ry.v = vx * 0.05; rx.to = 0; rx.v = -vy * 0.04;
    lift.to = 0; sh.to = 0;
    kick();
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('lostpointercapture', end);

  /* ---- the loop ---- */
  function render() {
    if (still()) {
      body.style.transform = '';
      el.style.setProperty('--lift', '0');
      body.style.setProperty('--sheen', '0');
      showFaces(0);
      return;
    }
    /* the turn lifts the card toward the viewer while it is edge-on */
    const edge = Math.abs(Math.sin((fl.x * Math.PI) / 180));
    const l = Math.max(lift.x, 0) + edge * 0.7;
    const s = 1 + Math.max(lift.x, 0) * 0.035 + edge * 0.05;
    body.style.transform =
      `translate3d(${x.x.toFixed(2)}px, ${(y.x - edge * W * 0.03).toFixed(2)}px, ${(l * 28).toFixed(1)}px) ` +
      `rotate(${rz.x.toFixed(3)}deg) rotateX(${rx.x.toFixed(2)}deg) rotateY(${(ry.x + fl.x).toFixed(2)}deg) scale(${s.toFixed(4)})`;
    el.style.setProperty('--lift', clamp(l, 0, 1.2).toFixed(3));
    body.style.setProperty('--sheen', clamp(sh.x, 0, 1).toFixed(3));
    showFaces(fl.x + ry.x);
  }
  const all = [x, y, rz, rx, ry, fl, lift, sh];
  function frame(t: number) {
    const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000));
    last = t; acc += dt;
    while (acc >= H) {
      acc -= H;
      if (!drag?.moved) { step(x, TOSS, H); step(y, TOSS, H); }
      step(rz, drag?.moved ? LEAN : TOSS, H);
      step(rx, drag?.moved ? LEAN : TOSS, H); step(ry, drag?.moved ? LEAN : TOSS, H);
      step(fl, TURN, H); step(lift, LEAN, H); step(sh, LEAN, H);
    }
    render();
    const moving = !!drag?.moved || !rest(x, 0.05) || !rest(y, 0.05) || !rest(rz, 0.01) || !rest(rx, 0.02) || !rest(ry, 0.02) || !rest(fl, 0.05) || !rest(lift, 0.002) || !rest(sh, 0.002);
    if (moving) raf = requestAnimationFrame(frame);
    else {
      for (const s of all) { s.x = s.to; s.v = 0; }
      fl.x = fl.to = flipped ? 180 : 0;
      render();
      raf = 0;
    }
  }
  function kick() {
    if (raf) return;
    last = performance.now(); acc = 0;
    raf = requestAnimationFrame(frame);
  }

  faceState();
  render();
  el.classList.add('is-live');

  new ResizeObserver(() => { W = el.clientWidth || W; }).observe(el);
  mq.reduce.addEventListener?.('change', () => {
    for (const s of all) { s.x = s.to = 0; s.v = 0; }
    fl.x = fl.to = flipped ? 180 : 0;
    faceState(); render();
  });
}
