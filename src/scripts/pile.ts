/* The pile of postcards on About (docs/research/2026-10-about-and-postcards.md §3; ADR-0008 amendment of
   2026-10-11). The owner (brief log, 2026-10-11): "postcards should be more interactive".

   Three postcards lie in a loose pile, each depth with its own small offset and turn. The top card is
   the live one:
   - with a mouse it leans toward the pointer under a moving glare, and the cards beneath fan out a
     little to show there are more;
   - drag it (mouse, pen or a sideways swipe; vertical scrolling stays native through touch-action) and
     it follows the hand, turning with its speed. Let go and the throw is projected (release speed x
     0.22 s, research row 5): past 42 % of the card's width it slides off and tucks under the pile, and
     the next card rises; short of that it springs back with the hand's speed;
   - click or tap turns it over (Enter and Space too: the face is a button);
   - "Previous", "Next" and "Turn over" buttons, and the arrow keys anywhere inside the pile, do the same
     for everyone. The caption beside the pile is a polite live region.

   One loop for the whole pile, asleep at rest, the motion system's springs (motion audit §4.1): slots
   ζ ≈ 0.82, tilt ζ ≈ 0.87 (the ui spring), the turn ζ ≈ 0.84 (as card3d.ts), so nothing wobbles past
   its place.

   Still twins (CLAUDE.md): reduced motion or ?still gets no tilt, drag, fan or slide: the order changes
   at once and the turn is the postcard's own 150 ms crossfade (.is-flipped). Without JavaScript the
   cards stand in a row with their notes under them (PostcardPile.astro). */
import { mq, motionOK } from './env';

type Spring = { x: number; v: number; to: number };
type K = [number, number];
const SLOT: K = [190, 2 * 0.82 * Math.sqrt(190)];
const TILT: K = [300, 30];
const TURN: K = [170, 22];
const H = 1 / 240;
const sp = (x = 0): Spring => ({ x, v: 0, to: x });
function step(s: Spring, [k, c]: K, dt: number) {
  s.v += (-k * (s.x - s.to) - c * s.v) * dt;
  s.x += s.v * dt;
}
const rest = (s: Spring, eps: number) => Math.abs(s.x - s.to) < eps && Math.abs(s.v) < eps * 4;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** where a card lies at each depth: offset as a fraction of the card's width, and its turn in degrees */
const SLOTS = [{ x: 0, y: 0, r: -1.2 }, { x: 0.06, y: 0.025, r: 3.6 }, { x: -0.05, y: 0.045, r: -4.8 }];
const slot = (k: number) => SLOTS[k] ?? { x: (k % 2 ? 0.03 : -0.03), y: 0.05, r: k % 2 ? 2 : -2 };
/** how far the cards beneath spread while a pointer is over the pile */
const FAN = 0.8;
const THROW = 0.42; // of the card's width, measured at the projected landing point
const PROJECT = 0.22; // s
const DRAG_TURN = 14; // deg of turn per card width dragged

type Card = {
  el: HTMLElement; pc: HTMLElement; body: HTMLElement; faces: HTMLElement[]; turns: HTMLButtonElement[];
  x: Spring; y: Spring; r: Spring; rx: Spring; ry: Spring; fl: Spring; gl: Spring;
  flipped: boolean; tone: string; place: string; note: string;
  /** on its way off the pile: the side it leaves by, and where it lands (top or bottom) */
  away: null | { dir: number; top: boolean };
};

export function initPiles(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-pile]').forEach(setup);
}

function setup(root: HTMLElement) {
  if (root.dataset.pileLive) return;
  const stage = root.querySelector<HTMLElement>('[data-pile-stage]');
  const els = [...root.querySelectorAll<HTMLElement>('[data-pile-card]')];
  if (!stage || els.length < 2) return;
  root.dataset.pileLive = '1';
  const cards: Card[] = els.map((el) => {
    const pc = el.querySelector<HTMLElement>('[data-pc]')!;
    return {
      el, pc, body: pc.querySelector<HTMLElement>('[data-card-body]')!,
      faces: [...pc.querySelectorAll<HTMLElement>('[data-face]')],
      turns: [...pc.querySelectorAll<HTMLButtonElement>('[data-turn]')],
      x: sp(), y: sp(), r: sp(), rx: sp(), ry: sp(), fl: sp(), gl: sp(),
      flipped: false, tone: el.dataset.tone || '', place: el.dataset.place || '', note: el.dataset.note || '',
      away: null,
    };
  });
  const n = cards.length;
  const prevB = root.querySelector<HTMLButtonElement>('[data-pile-prev]');
  const nextB = root.querySelector<HTMLButtonElement>('[data-pile-next]');
  const turnB = root.querySelector<HTMLButtonElement>('[data-pile-turn]');
  const capPlace = root.querySelector<HTMLElement>('[data-pile-place]');
  const capNote = root.querySelector<HTMLElement>('[data-pile-note]');
  const countN = root.querySelector<HTMLElement>('[data-pile-n]');
  const live = root.querySelector<HTMLElement>('[data-pile-live]');

  const still = () => !motionOK();
  const canTilt = () => mq.fine.matches && !still();
  let order = cards.map((_, i) => i);
  const fan = sp();
  let W = stage.clientWidth || 300;
  let raf = 0, last = 0, acc = 0, suppress = false;

  const depth = (c: Card) => order.indexOf(cards.indexOf(c));
  const top = () => cards[order[0]];
  function place(c: Card) {
    const k = depth(c), s = slot(k), f = k ? 1 + fan.x * FAN : 1;
    c.x.to = s.x * W * f; c.y.to = s.y * W * f; c.r.to = s.r * f;
  }

  /* what the pile says: the top card's place and note, its number, which faces can be reached */
  function state(announce: boolean) {
    const t = top();
    cards.forEach((c) => {
      const k = depth(c);
      c.el.inert = k !== 0;
      c.el.style.setProperty('--d', String(k));
      if (!c.away) c.el.style.zIndex = String(n - k);
      c.faces.forEach((f, i) => { f.inert = (i === 1) !== c.flipped; });
      c.pc.classList.toggle('is-flipped', c.flipped);
    });
    root.style.setProperty('--tone', t.tone);
    root.classList.toggle('is-still', still());
    if (countN) countN.textContent = String(order[0] + 1).padStart(2, '0');
    if (capPlace) capPlace.textContent = t.place;
    if (capNote) capNote.textContent = t.note;
    if (turnB) turnB.setAttribute('aria-pressed', String(t.flipped));
    if (announce && live) live.textContent = `${order[0] + 1} ${root.dataset.of || 'of'} ${n}: ${t.place}`;
  }

  function settleAll() {
    for (const c of cards) {
      if (c.away) continue;
      place(c);
      if (still()) for (const s of [c.x, c.y, c.r]) { s.x = s.to; s.v = 0; }
    }
  }

  function turn(c = top()) {
    const had = c.el.contains(document.activeElement);
    c.flipped = !c.flipped;
    state(false);
    if (had) c.turns[c.flipped ? 1 : 0].focus({ preventScroll: true });
    if (still()) { c.fl.x = c.fl.to = c.flipped ? 180 : 0; c.fl.v = 0; render(); return; }
    c.fl.to = Math.round(c.fl.to / 180) * 180 + (c.flipped ? 180 : -180);
    kick();
  }

  /** the top card goes under the pile (dir: the side it leaves by, -1 left, 1 right; by default the
      right, away from the words beside the pile) */
  function next(dir = 1, v = 0) { shift(order[0], dir, false, v); }
  /** the bottom card comes back on top, by the right */
  function prev() { shift(order[n - 1], 1, true, 0); }
  function shift(i: number, dir: number, toTop: boolean, v: number) {
    const c = cards[i];
    const focusIn = root.contains(document.activeElement) && els.some((e) => e.contains(document.activeElement));
    order = toTop ? [i, ...order.filter((j) => j !== i)] : [...order.filter((j) => j !== i), i];
    /* a turned card is put away face up */
    if (c.flipped) { c.flipped = false; c.fl.to = Math.round(c.fl.to / 360) * 360; }
    if (still()) {
      c.away = null;
      if (c.fl.to % 360 === 0) { c.fl.x = c.fl.to; c.fl.v = 0; }
      settleAll(); state(true); render();
    } else {
      c.away = { dir, top: toTop };
      c.el.style.zIndex = String(toTop ? 0 : n + 1);
      c.x.to = dir * W * 1.1; c.y.to = -0.03 * W; c.r.to = dir * 9;
      if (v) c.x.v = v;
      settleAll(); state(true); kick();
    }
    if (focusIn) top().turns[0].focus({ preventScroll: true });
  }

  for (const c of cards) for (const b of c.turns) b.addEventListener('click', () => { if (suppress) return; if (c === top()) turn(c); });
  turnB?.addEventListener('click', () => turn());
  nextB?.addEventListener('click', () => next());
  prevB?.addEventListener('click', () => prev());
  root.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  /* ---- hover: the top card leans to the pointer, the pile fans out (mouse only) ---- */
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag || !canTilt()) return;
    const r = top().body.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    const t = top();
    t.ry.to = nx * 9; t.rx.to = -ny * 7; t.gl.to = 1;
    t.body.style.setProperty('--gx', (50 + nx * 38).toFixed(1) + '%');
    t.body.style.setProperty('--gy', (40 + ny * 34).toFixed(1) + '%');
    if (fan.to !== 1) { fan.to = 1; }
    kick();
  });
  stage.addEventListener('pointerleave', () => {
    for (const c of cards) { c.rx.to = c.ry.to = 0; c.gl.to = 0; }
    fan.to = 0; kick();
  });

  /* ---- drag: the top card follows the hand; a throw puts it under the pile ---- */
  type Drag = { id: number; x0: number; y0: number; moved: boolean; vx: number; t: number; lx: number; c: Card; bx: number; by: number };
  let drag: Drag | null = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || still() || drag) return;
    const c = top();
    if (!c.el.contains(e.target as Node) || c.away) return;
    W = stage.clientWidth || W;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, vx: 0, t: e.timeStamp, lx: e.clientX, c, bx: c.x.x, by: c.y.x };
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) {
      /* a touch that moves mostly up or down is the page scrolling: the browser takes it (pan-y) */
      if (Math.hypot(dx, dy) < 6) return;
      if (e.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      drag.moved = true;
      stage.setPointerCapture(e.pointerId);
      root.classList.add('is-held');
      const c = drag.c; c.rx.to = c.ry.to = 0;
    }
    const c = drag.c, s = slot(0);
    c.x.x = c.x.to = drag.bx + dx; c.x.v = 0;
    c.y.x = c.y.to = drag.by + dy * 0.3; c.y.v = 0;
    c.r.to = s.r + clamp((dx / W) * DRAG_TURN + drag.vx * 0.004, -16, 16);
    const dt = (e.timeStamp - drag.t) / 1000;
    if (dt > 0.004) {
      const iv = (e.clientX - drag.lx) / dt, k = dt > 0.1 ? 1 : 0.6;
      drag.vx += (iv - drag.vx) * k; drag.t = e.timeStamp; drag.lx = e.clientX;
    }
    kick();
  });
  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (!d.moved) return;
    root.classList.remove('is-held');
    suppress = true;
    setTimeout(() => { suppress = false; }, 0);
    /* a hand that stopped before letting go throws nothing */
    const vx = e.timeStamp - d.t > 110 ? 0 : clamp(d.vx, -2400, 2400);
    const dx = d.c.x.x - d.bx;
    const projected = dx + vx * PROJECT;
    if (Math.abs(projected) > THROW * W) next(Math.sign(projected), vx);
    else { d.c.x.v = vx; place(d.c); kick(); }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('lostpointercapture', end);

  /* ---- the loop ---- */
  function render() {
    const calm = still();
    for (const c of cards) {
      c.el.style.transform = `translate3d(${c.x.x.toFixed(2)}px, ${c.y.x.toFixed(2)}px, 0) rotate(${c.r.x.toFixed(3)}deg)`;
      c.body.style.transform = calm ? '' : `rotateX(${c.rx.x.toFixed(2)}deg) rotateY(${(c.ry.x + c.fl.x).toFixed(2)}deg)`;
      c.body.style.setProperty('--glare', (0.3 + c.gl.x * 0.6).toFixed(3));
    }
  }
  function frame(t: number) {
    const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000));
    last = t; acc += dt;
    while (acc >= H) {
      acc -= H;
      step(fan, TILT, H);
      for (const c of cards) {
        if (!c.away && !(drag?.moved && drag.c === c)) place(c);
        step(c.x, SLOT, H); step(c.y, SLOT, H); step(c.r, drag?.moved && drag.c === c ? TILT : SLOT, H);
        step(c.rx, TILT, H); step(c.ry, TILT, H); step(c.gl, TILT, H); step(c.fl, TURN, H);
        /* off the pile: once it is clear of the others it changes layer and comes back to its slot */
        if (c.away && Math.abs(c.x.x) > Math.abs(c.x.to) * 0.82) {
          c.away = null;
          c.el.style.zIndex = String(n - depth(c));
          place(c);
        }
      }
    }
    render();
    const moving = !!drag?.moved || !rest(fan, 0.002) || cards.some((c) => c.away || !rest(c.x, 0.05) || !rest(c.y, 0.05) || !rest(c.r, 0.01) || !rest(c.rx, 0.02) || !rest(c.ry, 0.02) || !rest(c.fl, 0.05) || !rest(c.gl, 0.002));
    if (moving) raf = requestAnimationFrame(frame);
    else {
      for (const c of cards) for (const s of [c.x, c.y, c.r, c.rx, c.ry, c.fl, c.gl]) { s.x = s.to; s.v = 0; }
      for (const c of cards) { c.fl.x = c.fl.to = c.flipped ? 180 : 0; }
      render();
      raf = 0;
    }
  }
  function kick() {
    if (raf) return;
    last = performance.now(); acc = 0;
    raf = requestAnimationFrame(frame);
  }

  /* the pile is dealt when it first comes into view: the cards start squared up and spread to their
     places (motion welcome only; a pile already on screen is simply there) */
  settleAll();
  for (const c of cards) for (const s of [c.x, c.y, c.r]) { s.x = s.to; s.v = 0; }
  state(false);
  root.classList.add('is-live');
  if (!still() && 'IntersectionObserver' in window && stage.getBoundingClientRect().top > innerHeight) {
    for (const c of cards) { c.x.x = 0; c.y.x = 0.06 * W; c.r.x = 0; }
    const io = new IntersectionObserver((es) => {
      if (!es.some((x) => x.isIntersecting)) return;
      io.disconnect();
      cards.forEach((c, i) => { c.r.v = (i % 2 ? 1 : -1) * 20; });
      kick();
    }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(stage);
  }
  render();

  new ResizeObserver(() => {
    const w = stage.clientWidth;
    if (!w || Math.abs(w - W) < 0.5) return;
    W = w;
    settleAll();
    for (const c of cards) if (!c.away) for (const s of [c.x, c.y]) { s.x = s.to; s.v = 0; }
    render();
  }).observe(stage);

  const reset = () => {
    for (const c of cards) {
      c.away = null;
      for (const s of [c.rx, c.ry, c.gl]) { s.x = s.to = 0; s.v = 0; }
      c.fl.x = c.fl.to = c.flipped ? 180 : 0; c.fl.v = 0;
    }
    fan.x = fan.to = 0;
    settleAll();
    for (const c of cards) for (const s of [c.x, c.y, c.r]) { s.x = s.to; s.v = 0; }
    state(false); render();
  };
  mq.reduce.addEventListener?.('change', reset);
}
