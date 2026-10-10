/* Cards you can pick up (ADR-0008): the ID card on About hangs on a lanyard (data-card="hang"), a
   postcard only tilts (data-card="tilt"). Both turn over on click, Enter or Space.

   One small loop per card, asleep at rest; CSS 3D transforms, an SVG rope and a pointer-driven glare,
   no canvas, no WebGL. Tilt uses the ui spring (ζ ≈ 0.87); the turn is close to critical (ζ ≈ 0.84)
   so a button turn never wobbles past its face.

   The hanging card (brief §7, 2026-10-10: "pull it by its lanyard, swing and spin it, like GitHub's
   event badges") is a short Verlet rope from an anchor above the page to the clip. The clip is the
   rope's heavy last point: it falls under gravity, the rope holds it, and its swing is damped to
   ζ ≈ 0.9. The card hangs from the clip and follows the rope's last segment on a spring. A fling
   hands the hand's speed to the clip and its sideways speed to a spin about the vertical axis; the
   spin runs down on friction and then settles on the nearest face, front or back, and that face
   becomes the live one.

   Calm (brief, 2026-10-10: "playable and good but goes wild; extreme input gets extreme reactions";
   ADR-0008 amendment of 2026-10-10 has the measured numbers): every reaction saturates instead of
   growing with the input. The throw is capped at 1200 px/s, the spin at 720°/s (2 turns a second,
   under 12° a frame at 60 Hz) and runs down on a stronger friction, the strap stretches at most
   about 8 px however hard it is pulled (a soft limit, then the hand slips past), the swing saturates
   near 30°, and the card's area has soft walls that push back over their last 40 px and bounce what
   still reaches them instead of stopping it dead. A fling settles in about two seconds.

   Still twins (CLAUDE.md): reduced motion gets no rope, swing, tilt or drag, and the turn is a
   crossfade (CSS, .is-flipped); touch gets tap to turn and no drag; without JavaScript the front. */
import { mq, motionOK } from './env';

type Spring = { x: number; v: number; to: number };
const UI: [number, number] = [300, 30];
const TURN: [number, number] = [170, 22];
/** after a free spin: ζ = 0.75, so the face it lands on overshoots a little, once */
const LAND: [number, number] = [120, 2 * 0.75 * Math.sqrt(120)];
/** the card following its rope: a little lag, ζ ≈ 0.9 */
const HANG: [number, number] = [260, 2 * 0.9 * Math.sqrt(260)];
const sp = (x = 0): Spring => ({ x, v: 0, to: x });
function step(s: Spring, [k, c]: [number, number], dt: number) {
  s.v += (-k * (s.x - s.to) - c * s.v) * dt;
  s.x += s.v * dt;
}
const rest = (s: Spring, eps: number) => Math.abs(s.x - s.to) < eps && Math.abs(s.v) < eps * 4;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
/** Rubber band: follows the hand near rest, never passes `max`. */
const band = (x: number, max: number) => max * Math.tanh(x / max);
/** A soft limit on a length: unchanged up to `max`, then at most `give` more. */
const give = (d: number, max: number, extra: number) => (d <= max ? d : max + band(d - max, extra));

/* the rope */
const SEG = 10;
const G = 3200; // px/s²: a 19 cm lanyard swings with a period near 1.5 s
const H = 1 / 240; // fixed physics step
const CLIP_MASS = 4;
const ITER = 16;
/** how far the free rope may stretch: a long-range limit from the anchor keeps it from creeping */
const STRETCH = 1.02;
const SPIN_FRICTION = 2.5; // 1/s
const SPIN_LAND = 240; // deg/s: below this the spin gives way to the landing spring
/* calm limits (see the header) */
const SPIN_MAX = 720; // deg/s, for the free spin and the button turn alike
const SPIN_FROM = 600; // px/s: a slower or mostly vertical throw does not spin the card
const THROW_MAX = 1200; // px/s
const GIVE = 8; // px: how far the strap gives past its length, on a soft limit
const SWING_MAX = 0.52; // rad (30°), a soft limit
const WALL = 40; // px: the soft walls push back over this distance before the card's limits
const WALL_K = 900; // 1/s²: stops a 1200 px/s card within WALL
const BOUNCE = 0.3; // restitution at a limit
const TWIST_MAX = 12; // deg, while held

type Pt = { x: number; y: number; px: number; py: number };

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
  const rope = el.querySelector<SVGSVGElement>('[data-card-rope]');
  const ropePath = rope?.querySelector<SVGPathElement>('[data-rope-path]');
  const ropeFade = rope?.querySelector<SVGLinearGradientElement>('linearGradient');

  const still = () => mq.reduce.matches;
  const canTilt = () => mq.fine.matches && !still();
  const canHold = () => hang && canTilt() && !!(swing && anchor && rope && ropePath);

  let flipped = false;
  const tx = sp(), ty = sp(), fl = sp(), gl = sp(), th = sp(), tw = sp();
  let spinning = false, landing = false;
  let raf = 0, last = 0, acc = 0, suppress = false;

  /* rope state, in px relative to the anchor */
  const pts: Pt[] = Array.from({ length: SEG + 1 }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
  let segLen = 0, restY = 0, w = 300, cardH = 480, damp = 5;
  let simRest = { x: 0, y: 0 }; // where the simulated clip comes to rest
  let restPts: { x: number; y: number }[] = [];
  let lim = { l: 0, r: 0, up: 0, down: 0 };
  let live = false, settling = false; // the rope is running (fine pointer, motion welcome)
  type Drag = {
    id: number; x0: number; y0: number; moved: boolean; pin: number; ox: number; oy: number;
    ax: number; ay: number; focus: boolean;
    /** the hand's velocity, smoothed over its last few events, px/s */
    vx: number; vy: number; t: number; lx: number; ly: number;
  };
  let drag: Drag | null = null;

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
    spinning = false;
    if (still()) { fl.x = fl.to = flipped ? 180 : 0; fl.v = 0; render(); return; }
    fl.to = Math.round(fl.to / 180) * 180 + (flipped ? 180 : -180);
    kick();
  }
  for (const b of turns) b.addEventListener('click', () => { if (suppress) return; turn(); });

  /* ---- the rope ---- */
  /** The card's room to move, from where it is laid out (the page may still be easing in, so this is
      read again when a hand takes the card). */
  function limits() {
    const r = el.getBoundingClientRect();
    const area = (el.closest('.about-badge') as HTMLElement | null ?? el.parentElement!).getBoundingClientRect();
    const sx = r.width / w || 1;
    const room = (d: number) => Math.max(0, Math.min(d / sx - 0.2 * w, 1.3 * w));
    const L = restY;
    lim = { l: room(r.left - area.left), r: room(Math.min(area.right, innerWidth) - r.right), up: Math.min(0.35 * L, 72), down: GIVE };
  }
  function measure() {
    /* layout values, not boxes: transforms on the page (its entrance) must not reach the rope */
    w = el.offsetWidth;
    cardH = body!.offsetHeight || w * 1.6;
    /* the clip's pivot sits 9.4% of the card's width above the card (IdCard.astro, .idc-swing) */
    restY = Math.max(40, -anchor!.offsetTop - 0.094 * w);
    const L = restY;
    segLen = (L / SEG) * 0.985;
    damp = 2 * 0.9 * Math.sqrt(G / L);
    limits();
    if (ropeFade) ropeFade.setAttribute('y2', String(Math.min(0.6 * L, 140)));
    /* hang the rope straight and let it settle offline, so the page opens on the rope's own rest */
    for (let i = 0; i <= SEG; i++) { const p = pts[i]; p.x = p.px = 0; p.y = p.py = (restY * i) / SEG; }
    settling = true;
    for (let i = 0; i < 960; i++) physics(H);
    settling = false;
    simRest = { x: pts[SEG].x, y: pts[SEG].y };
    restPts = pts.map((p) => ({ x: p.x, y: p.y }));
  }

  function physics(h: number) {
    const c = pts[SEG];
    /* the clip's swing is damped across the rope (ζ ≈ 0.9); a fall along the rope is not */
    if (!drag || drag.pin !== SEG) {
      const n = pts[SEG - 1];
      let ux = c.x - n.x, uy = c.y - n.y;
      const d = Math.hypot(ux, uy) || 1;
      ux /= d; uy /= d;
      let vx = c.x - c.px, vy = c.y - c.py;
      const along = vx * ux + vy * uy;
      const k = Math.exp(-damp * h);
      vx = along * ux + (vx - along * ux) * k;
      vy = along * uy + (vy - along * uy) * k;
      c.px = c.x - vx; c.py = c.y - vy;
    }
    for (let i = 1; i <= SEG; i++) {
      const p = pts[i];
      if (drag && drag.pin === i) continue;
      const f = i === SEG ? 0.9995 : 0.985; // the strap itself is light and damps quickly
      const vx = (p.x - p.px) * f, vy = (p.y - p.py) * f;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + G * h * h;
    }
    /* soft walls: over the last WALL px before a side limit, a spring pushes the clip back */
    if (!settling && (!drag || drag.pin !== SEG)) {
      const ox = c.x - simRest.x;
      const pen = Math.max(0, ox - (lim.r - WALL)) - Math.max(0, -(lim.l - WALL) - ox);
      if (pen) c.x -= WALL_K * pen * h * h;
    }
    for (let it = 0; it < ITER; it++) {
      for (let i = 0; i < SEG; i++) {
        const a = pts[i], b = pts[i + 1];
        const wa = i === 0 || (drag && drag.pin === i) ? 0 : 1;
        const wb = drag && drag.pin === i + 1 ? 0 : i + 1 === SEG ? 1 / CLIP_MASS : 1;
        const sum = wa + wb;
        if (!sum) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        /* a rope pulls and never pushes: a slack strap folds instead of standing up as a rod (a
           straight upward yank used to leave the card propped in mid-air on its own strap) */
        if (d <= segLen && !settling) continue;
        const k = (d - segLen) / d / sum;
        a.x += dx * k * wa; a.y += dy * k * wa;
        b.x -= dx * k * wb; b.y -= dy * k * wb;
      }
    }
    /* long-range attachment: no point further from the anchor than the rope up to it allows */
    for (let i = 1; i <= SEG; i++) {
      if (drag && drag.pin === i) continue;
      const p = pts[i], max = i * segLen * STRETCH, d = Math.hypot(p.x, p.y);
      if (d > max) { p.x *= max / d; p.y *= max / d; }
    }
    /* the card's area: never past the text column, never off the page */
    if (!settling && (!drag || drag.pin !== SEG)) {
      const ox = c.x - simRest.x, oy = c.y - simRest.y;
      const nx = clamp(ox, -lim.l, lim.r), ny = clamp(oy, -lim.up, lim.down);
      /* what still reaches a limit bounces off it (restitution 0.3) instead of stopping dead */
      if (nx !== ox) { const v = c.x - c.px; c.x = simRest.x + nx; c.px = c.x + v * BOUNCE; }
      if (ny !== oy) { const v = c.y - c.py; c.y = simRest.y + ny; c.py = c.y + v * BOUNCE; }
    }
  }

  function holdTarget(hx: number, hy: number) {
    /* the hand, rubber-banded inside the card's area; the rope gives at most GIVE px past its length
       in any direction (a box alone let a sideways pull stretch the strap by half) */
    let ox = hx - simRest.x, oy = hy - simRest.y;
    ox = ox < 0 ? -band(-ox, lim.l || 1) : band(ox, lim.r || 1);
    oy = oy < 0 ? -band(-oy, lim.up) : band(oy, lim.down);
    return reach(simRest.x + ox, simRest.y + oy, Math.hypot(simRest.x, simRest.y));
  }
  /** A point held at most `max` (+ GIVE, softly) from the anchor. */
  function reach(x: number, y: number, max: number) {
    const d = Math.hypot(x, y);
    if (d <= max) return { x, y };
    const k = give(d, max, GIVE) / d;
    return { x: x * k, y: y * k };
  }

  function renderRope() {
    if (!ropePath) return;
    /* the drawn rope ends exactly at the card's clip: any difference between the simulated and the
       laid-out rest is spread along the rope */
    const ex = 0 - simRest.x, ey = restY - simRest.y;
    let d = '';
    let qx = 0, qy = 0;
    for (let i = 0; i <= SEG; i++) {
      const f = i / SEG;
      const x = pts[i].x + ex * f, y = pts[i].y + ey * f;
      if (i === 0) d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      else if (i === SEG) d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      else if (i > 1) d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${((qx + x) / 2).toFixed(1)} ${((qy + y) / 2).toFixed(1)}`;
      else d += ` L${((x) / 2).toFixed(1)} ${(y / 2).toFixed(1)}`;
      qx = x; qy = y;
    }
    ropePath.setAttribute('d', d);
  }

  function render() {
    const twist = clamp(-th.v * 0.4, -10, 10) + tw.x;
    const yaw = ty.x + twist + fl.x;
    const pitch = tx.x;
    body!.style.transform = still() ? '' : `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    if (live) {
      const c = pts[SEG];
      swing!.style.transform = `translate(${(c.x - simRest.x).toFixed(2)}px, ${(c.y - simRest.y).toFixed(2)}px) rotate(${th.x.toFixed(4)}rad)`;
      renderRope();
    } else if (swing) swing.style.transform = '';
    /* the light is fixed above and to the left; its reflection moves as the visible face turns */
    let local = ((yaw + 90) % 360 + 360) % 360 - 90;
    if (local > 90) local -= 180;
    const swingDeg = th.x * 57.3;
    body!.style.setProperty('--gx', (50 - local * 2.6 - swingDeg * 1.4).toFixed(1) + '%');
    body!.style.setProperty('--gy', (26 + pitch * 3).toFixed(1) + '%');
    body!.style.setProperty('--glare', clamp(0.3 + gl.x * 0.7 + Math.abs(local) / 40 + Math.abs(swingDeg) / 30, 0, 1).toFixed(3));
    body!.style.setProperty('--fa', (150 + local * 5 + swingDeg * 4).toFixed(1) + 'deg');
  }

  function land() {
    spinning = false;
    fl.to = Math.round((fl.x + fl.v * 0.18) / 180) * 180;
    const back = Math.abs(Math.round(fl.to / 180)) % 2 === 1;
    if (back !== flipped) {
      const lost = drag?.focus || el.contains(document.activeElement);
      flipped = back;
      faceState();
      if (lost) turns[flipped ? 1 : 0].focus({ preventScroll: true });
    }
  }

  function frame(t: number) {
    const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000));
    last = t;
    acc += dt;
    let moving = false;
    while (acc >= H) {
      acc -= H;
      if (live) {
        physics(H);
        /* the card hangs along the rope's last segment, kept inside its area */
        const c = pts[SEG], n = pts[SEG - 1];
        let a = -Math.atan2(c.x - n.x, c.y - n.y);
        const ox = c.x - simRest.x;
        const lo = Math.asin(clamp((ox - lim.r) / cardH, -0.9, 0.9));
        const hi = Math.asin(clamp((ox + lim.l) / cardH, -0.9, 0.9));
        a = clamp(a, Math.min(lo, hi), Math.max(lo, hi));
        th.to = SWING_MAX * Math.tanh(a / SWING_MAX);
        step(th, HANG, H);
      }
      step(tx, UI, H); step(ty, UI, H); step(gl, UI, H); step(tw, UI, H);
      if (spinning) {
        fl.v *= Math.exp(-SPIN_FRICTION * H);
        fl.x += fl.v * H;
        if (Math.abs(fl.v) < SPIN_LAND) land();
      } else { step(fl, landing ? LAND : TURN, H); fl.v = clamp(fl.v, -SPIN_MAX, SPIN_MAX); }
    }
    if (landing && rest(fl, 0.05)) landing = false;
    render();
    if (live) {
      /* near rest the last sub-pixel sway is not worth waking for: it snaps to the rest shape below */
      const c = pts[SEG];
      const eps = Math.hypot(c.x - simRest.x, c.y - simRest.y) < 1.5 ? 0.03 : 0.004;
      for (const p of pts) if (Math.abs(p.x - p.px) > eps || Math.abs(p.y - p.py) > eps) { moving = true; break; }
      moving ||= !rest(th, eps < 0.01 ? 0.0008 : 0.004);
    }
    const done = !drag && !moving && !spinning && rest(tx, 0.02) && rest(ty, 0.02) && rest(fl, 0.05) && rest(gl, 0.002) && rest(tw, 0.02);
    if (done) {
      for (const s of [tx, ty, gl, tw, th]) { s.x = s.to; s.v = 0; }
      fl.x = fl.to = flipped ? 180 : 0; fl.v = 0;
      for (const p of pts) { p.px = p.x; p.py = p.y; }
      /* within a pixel and a half of rest, the rope takes its rest shape exactly, and the card hangs
         straight: the page at rest is the page as laid out */
      const c = pts[SEG];
      if (restPts.length && Math.hypot(c.x - simRest.x, c.y - simRest.y) < 1.5) {
        pts.forEach((p, i) => { p.x = p.px = restPts[i].x; p.y = p.py = restPts[i].y; });
        th.x = th.to = 0;
      }
      render();
      raf = 0;
    } else raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf) return;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  }

  /* hover: lean toward the pointer (fine pointers only) */
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag || spinning || !canTilt()) return;
    const r = body.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    ty.to = nx * (hang ? 14 : 10);
    tx.to = -ny * (hang ? 10 : 8);
    gl.to = 1;
    kick();
  });
  el.addEventListener('pointerleave', () => { tx.to = ty.to = 0; gl.to = 0; kick(); });

  /* hold (the hanging card only): grab the card or its rope, pull, let go or fling */
  function setLive() {
    const on = canHold();
    if (on === live) return;
    live = on;
    el.classList.toggle('is-rope', live);
    if (live) measure();
    th.x = th.to = th.v = 0;
    render();
  }
  if (hang) {
    setLive();
    let rs = 0;
    const remeasure = () => { if (!drag && live) { measure(); render(); } };
    if (live) new ResizeObserver(remeasure).observe(el);
    addEventListener('resize', () => { clearTimeout(rs); rs = window.setTimeout(remeasure, 120); });

    const start = (e: PointerEvent, onRope: boolean) => {
      if (e.button !== 0 || e.pointerType === 'touch' || !live || (e.target as Element).closest('a')) return;
      limits();
      const a = anchor!.getBoundingClientRect();
      const hx = e.clientX - a.left, hy = e.clientY - a.top;
      let pin = SEG, ox = 0, oy = 0;
      if (onRope) {
        let best = Infinity;
        for (let i = 1; i < SEG; i++) {
          const d = Math.hypot(pts[i].x - hx, pts[i].y - hy);
          if (d < best) { best = d; pin = i; }
        }
        ox = pts[pin].x - hx; oy = pts[pin].y - hy;
      } else {
        /* the grab point, in the card's own frame around its clip */
        const c = pts[SEG];
        const px = 0 + (c.x - simRest.x), py = restY + (c.y - simRest.y);
        const wx = hx - px, wy = hy - py, cs = Math.cos(-th.x), sn = Math.sin(-th.x);
        ox = wx * cs - wy * sn; oy = wx * sn + wy * cs;
      }
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, pin, ox, oy, ax: a.left, ay: a.top, focus: el.contains(document.activeElement), vx: 0, vy: 0, t: e.timeStamp, lx: e.clientX, ly: e.clientY };
      if (onRope) e.preventDefault();
    };
    body.addEventListener('pointerdown', (e) => start(e, false));
    /* the hit stroke is a <use> outside the <defs> that hold the path (IdCard.astro) */
    rope!.querySelector('[data-rope-hit]')?.addEventListener('pointerdown', (e) => start(e as PointerEvent, true));

    el.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-held');
        tx.to = ty.to = 0;
        spinning = false;
        landing = false;
        fl.to = Math.round(fl.x / 180) * 180;
      }
      const hx = e.clientX - drag.ax, hy = e.clientY - drag.ay;
      const p = pts[drag.pin];
      let t: { x: number; y: number };
      if (drag.pin === SEG) {
        const cs = Math.cos(th.x), sn = Math.sin(th.x);
        const px = hx - (drag.ox * cs - drag.oy * sn), py = hy - (drag.ox * sn + drag.oy * cs);
        /* pivot (layout) back to the simulated clip */
        t = holdTarget(px + simRest.x, py - restY + simRest.y);
      } else t = reach(hx + drag.ox, Math.max(4, hy + drag.oy), drag.pin * segLen * STRETCH);
      p.x = p.px = t.x; p.y = p.py = t.y;
      /* events can arrive coalesced, one a frame, after a pause: measure between events, not over a
         window that may still hold the pause */
      const dt = (e.timeStamp - drag.t) / 1000;
      if (dt > 0.004) {
        const ix = (e.clientX - drag.lx) / dt, iy = (e.clientY - drag.ly) / dt;
        const k = dt > 0.1 ? 1 : 0.65;
        drag.vx += (ix - drag.vx) * k; drag.vy += (iy - drag.vy) * k;
        drag.t = e.timeStamp; drag.lx = e.clientX; drag.ly = e.clientY;
      }
      tw.to = clamp(drag.vx * 0.01, -TWIST_MAX, TWIST_MAX);
      kick();
    });
    const end = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) {
        /* a hand that stopped before letting go throws nothing */
        const held = e.timeStamp - drag.t > 110;
        /* the throw saturates: its direction is kept, its speed capped */
        const sp = Math.hypot(drag.vx, drag.vy), cap = held || !sp ? 0 : Math.min(1, THROW_MAX / sp);
        const vx = drag.vx * cap, vy = drag.vy * cap;
        /* the hand's speed goes to what it held, and a quick, mostly sideways throw spins the card */
        const p = pts[drag.pin];
        p.px = p.x - vx * H; p.py = p.y - vy * H;
        const spin = Math.abs(vx) > SPIN_FROM && Math.abs(vx) > 1.5 * Math.abs(vy);
        fl.v = spin ? clamp(tw.x * 4 + vx * 0.6, -SPIN_MAX, SPIN_MAX) : 0;
        spinning = Math.abs(fl.v) > SPIN_LAND;
        landing = true;
        if (!spinning) land();
        tw.to = 0;
        /* the click that ends a drag is not a request to turn the card */
        suppress = true;
        setTimeout(() => { suppress = false; }, 0);
        el.classList.remove('is-held');
      }
      drag = null;
      kick();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);

    /* a small settle when the page opens, as if it was just hung up (wide screens, motion welcome) */
    if (live && motionOK()) { const c = pts[SEG]; c.px = c.x + 1.6; kick(); }
  }

  const reset = () => {
    for (const s of [tx, ty, gl, th, tw]) { s.x = s.to = 0; s.v = 0; }
    spinning = landing = false;
    fl.x = fl.to = flipped ? 180 : 0; fl.v = 0;
    if (hang) setLive();
    render();
  };
  mq.reduce.addEventListener?.('change', reset);
  mq.fine.addEventListener?.('change', reset);
}
