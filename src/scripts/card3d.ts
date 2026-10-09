/* Cards you can pick up (ADR-0008): the ID card on About hangs on a lanyard (data-card="hang"), a
   postcard only tilts (data-card="tilt"). Both turn over on click, Enter or Space.

   One small loop per card, asleep at rest; CSS 3D transforms and a pointer-driven glare, no canvas,
   no WebGL. Springs from the motion system (craft audit §4.1): the swing keeps the object spring's
   damping (ζ = 0.6) with a slower stiffness because it hangs; tilt uses the ui spring (ζ ≈ 0.87);
   the turn is close to critical (ζ ≈ 0.84) so the card never wobbles past its face.

   Still twins (CLAUDE.md): reduced motion gets no swing, tilt or drag, and the turn is a crossfade
   (CSS, .is-flipped); touch gets tap to turn and no drag; without JavaScript both faces are shown. */
import { mq, motionOK } from './env';

type Spring = { x: number; v: number; to: number };
const SWING: [number, number] = [90, 2 * 0.6 * Math.sqrt(90)];
const UI: [number, number] = [300, 30];
const TURN: [number, number] = [170, 22];
const sp = (x = 0): Spring => ({ x, v: 0, to: x });
function step(s: Spring, [k, c]: [number, number], dt: number) {
  s.v += (-k * (s.x - s.to) - c * s.v) * dt;
  s.x += s.v * dt;
}
const rest = (s: Spring, eps: number) => Math.abs(s.x - s.to) < eps && Math.abs(s.v) < eps * 4;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
/** Rubber band: follows the hand near rest, never passes `max`. */
const band = (x: number, max: number) => max * Math.tanh(x / max);

export function initCards(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-card]').forEach(setup);
}

function setup(el: HTMLElement) {
  if (el.dataset.cardLive) return;
  el.dataset.cardLive = '1';
  const hang = el.dataset.card === 'hang';
  const body = el.querySelector<HTMLElement>('[data-card-body]');
  const faces = [...el.querySelectorAll<HTMLElement>('[data-face]')];
  const turns = [...el.querySelectorAll<HTMLButtonElement>('[data-turn]')];
  if (!body || faces.length !== 2 || turns.length !== 2) return;
  const swing = el.querySelector<HTMLElement>('[data-card-swing]');
  const anchor = el.querySelector<HTMLElement>('[data-card-anchor]');

  const still = () => mq.reduce.matches;
  const canTilt = () => mq.fine.matches && !still();
  const canHold = () => hang && canTilt();

  let flipped = false;
  const th = sp(), st = sp(), tx = sp(), ty = sp(), fl = sp(), gl = sp();
  let raf = 0, last = 0, suppress = false;
  let drag: null | { id: number; x0: number; y0: number; ax: number; ay: number; a0: number; d0: number; th0: number; st0: number; moved: boolean; trail: [number, number, number][] } = null;

  function faceState() {
    faces.forEach((f, i) => { f.inert = (i === 1) !== flipped; });
    el.classList.toggle('is-flipped', flipped);
  }
  faceState();
  el.classList.add('is-live');

  function turn() {
    const hadFocus = el.contains(document.activeElement);
    flipped = !flipped;
    faceState();
    if (hadFocus) turns[flipped ? 1 : 0].focus({ preventScroll: true });
    if (still()) { fl.x = fl.to = flipped ? 180 : 0; fl.v = 0; render(); return; }
    fl.to = flipped ? 180 : 0;
    kick();
  }
  for (const b of turns) b.addEventListener('click', () => { if (suppress) return; turn(); });

  function render() {
    const twist = hang ? clamp(-th.v * 7, -22, 22) : 0;
    const yaw = ty.x + twist + fl.x;
    const pitch = tx.x;
    body!.style.transform = still() ? '' : `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    if (swing) swing.style.transform = still() ? '' : `rotate(${th.x.toFixed(4)}rad)`;
    el.style.setProperty('--stretch', (still() ? 0 : st.x).toFixed(1) + 'px');
    /* the light is fixed above and to the left; its reflection moves as the visible face turns */
    let local = ((yaw + 90) % 360 + 360) % 360 - 90;
    if (local > 90) local -= 180;
    const swingDeg = th.x * 57.3;
    body!.style.setProperty('--gx', (50 - local * 2.6 - swingDeg * 1.4).toFixed(1) + '%');
    body!.style.setProperty('--gy', (26 + pitch * 3).toFixed(1) + '%');
    body!.style.setProperty('--glare', clamp(0.3 + gl.x * 0.7 + Math.abs(local) / 40 + Math.abs(swingDeg) / 30, 0, 1).toFixed(3));
    body!.style.setProperty('--fa', (150 + local * 5 + swingDeg * 4).toFixed(1) + 'deg');
  }

  function frame(t: number) {
    const dt = Math.min(0.034, Math.max(0.001, (t - last) / 1000));
    last = t;
    const n = 4, h = dt / n;
    for (let i = 0; i < n; i++) {
      if (!drag) { step(th, SWING, h); step(st, SWING, h); }
      step(tx, UI, h); step(ty, UI, h); step(gl, UI, h); step(fl, TURN, h);
    }
    render();
    const done = !drag && rest(th, 0.0008) && rest(st, 0.05) && rest(tx, 0.02) && rest(ty, 0.02) && rest(fl, 0.05) && rest(gl, 0.002);
    if (done) {
      for (const s of [th, st, tx, ty, fl, gl]) { s.x = s.to; s.v = 0; }
      render();
      raf = 0;
    } else raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /* hover: lean toward the pointer (fine pointers only) */
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag || !canTilt()) return;
    const r = body.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    ty.to = nx * (hang ? 14 : 10);
    tx.to = -ny * (hang ? 10 : 8);
    gl.to = 1;
    kick();
  });
  el.addEventListener('pointerleave', () => { tx.to = ty.to = 0; gl.to = 0; kick(); });

  /* drag (the hanging card only): it follows the hand around its anchor and swings back */
  if (hang && swing && anchor) {
    body.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.pointerType === 'touch' || !canHold() || (e.target as Element).closest('a')) return;
      const a = anchor.getBoundingClientRect();
      const ax = a.left, ay = a.top;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ax, ay, a0: Math.atan2(e.clientX - ax, e.clientY - ay), d0: Math.hypot(e.clientX - ax, e.clientY - ay), th0: th.x, st0: st.x, moved: false, trail: [] };
    });
    body.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
        drag.moved = true;
        body.setPointerCapture(e.pointerId);
        el.classList.add('is-held');
        tx.to = ty.to = 0;
      }
      const a = Math.atan2(e.clientX - drag.ax, e.clientY - drag.ay);
      th.x = band(drag.th0 - (a - drag.a0), 0.75);
      const s = drag.st0 + Math.hypot(e.clientX - drag.ax, e.clientY - drag.ay) - drag.d0;
      st.x = s > 0 ? band(s, 34) : band(s, 16);
      const now = performance.now();
      drag.trail.push([now, th.x, st.x]);
      while (drag.trail.length > 2 && now - drag.trail[0][0] > 90) drag.trail.shift();
      kick();
    });
    const end = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) {
        const t0 = drag.trail[0], t1 = drag.trail[drag.trail.length - 1];
        const span = t1 && t0 && t1[0] > t0[0] ? (t1[0] - t0[0]) / 1000 : 0;
        th.v = span ? clamp((t1[1] - t0[1]) / span, -9, 9) : 0;
        st.v = span ? clamp((t1[2] - t0[2]) / span, -600, 600) : 0;
        /* the click that ends a drag is not a request to turn the card */
        suppress = true;
        setTimeout(() => { suppress = false; }, 0);
        el.classList.remove('is-held');
      }
      drag = null;
      kick();
    };
    body.addEventListener('pointerup', end);
    body.addEventListener('pointercancel', end);
    body.addEventListener('lostpointercapture', end);
  }

  /* a small settle when the page opens, as if it was just hung up (wide screens, motion welcome) */
  if (hang && canHold() && motionOK()) { th.x = 0.05; th.v = -0.35; kick(); }

  mq.reduce.addEventListener?.('change', () => {
    for (const s of [th, st, tx, ty, gl]) { s.x = s.to = 0; s.v = 0; }
    fl.x = fl.to = flipped ? 180 : 0; fl.v = 0;
    render();
  });
}
