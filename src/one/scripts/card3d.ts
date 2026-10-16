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
   crossfade (CSS, .is-flipped); touch gets tap to turn and no drag; without JavaScript the front.

   The face away from the viewer is also faded out by the script, from the turn's angle (2026-10-11):
   WebKit can paint a masked face's back side despite backface-visibility, and the back, later in
   the DOM, then covered the front on the owner's iPhone. The CSS starts from the front for the same
   reason (IdCard.astro).

   Entrance (ADR-0008 amendment of 2026-10-11; owner: "a small swing or turn, natural, as if it
   started moving with the page opening"): once per page view, when the card's photo is decoded, the
   hanging card twists on its lanyard and settles in two decaying oscillations (k 60, ζ 0.3, about
   1.2 s); with the rope the clip also swings out once, without it (touch) the card swings a few
   degrees about its clip. Any press, key or hover takes over and the twist settles on the turn
   spring. None under reduced motion, Save-Data or ?still.

   Round two on the two-page Home (spec v2 §3.5.1; review row C2). The physics above is unchanged;
   three things are added:
   - the entrance waits until the card is on screen (Home is long: at page load the card is far below),
     and only then listens for the press or key that takes over;
   - the guilloché under the type turns 1 deg per 10 deg of the card's turn (--gr), so the engraving
     catches the light;
   - hover sway: a pointer that enters the card or its rope gives the clip one sideways push through the
     integrator (the pointer's speed x 0.35, at most 140 px/s; 60 px/s away from the entry side when the
     pointer barely moves). It stays under SPIN_FROM, so it never spins: card and lanyard sway a few
     degrees together and settle. One push per entry, none while held, none without the rope (touch,
     reduced motion).
   - the tilting card (a postcard in its large view, spec v2 §3.6.4, rows P2 and P3) can be swung by a
     mouse drag: the turn follows the hand on a rubber band (at most 18 deg across, 12 deg up and down)
     and the release springs back on the same ui spring as the lean, so letting go animates as smoothly
     as picking up. A drag is not a click: it does not turn the card.

   Round three (spec v3 §2.5, §3.3):
   - the lean as depth: --px and --py on the card body (-1 to 1, from the lean springs), read by layers
     that sit in front of or behind the face (the ID card's cut photo, the postcard's stamp);
   - the back's reveal: .is-back-on while the back faces the viewer (within 25 deg of face-on), and
     .is-drawn from the first time it does, kept for the view, so the postcard's drawing draws once and
     only its flourish replays (--fd shortens the flourish's wait after the first time).
   - the lanyard follows every motion of the card (spec v3 §3.5, review rows T10 and C1). Before, the
     hover lean and the entrance twist turned only the card body, so the card moved "by itself" while
     the lanyard stood still. Now (no new physics, the same Verlet rope):
     1. the lean is a torque on the clip: each step a sideways force -900 px/s² x sin(lean) on the rope's
        last point, so the rope bends a few pixels as the pointer leans the card and relaxes on the same
        hang spring; a pitch lifts the clip toward the viewer by L (1 - cos pitch) / 2;
     2. the card's yaw (the entrance twist, the turn) twists the strap's lower 30 %: that part of the
        ribbon narrows by |cos yaw| and shows its plain back face past 90 deg (the lettering is masked off
        it), so a turned card hangs from a half-twisted strap, as a real one does;
     3. touch gets the rope too, without the hand: the strap is the same renderer, and the entrance push
        swings strap and card together instead of the card swinging about a fixed clip;
     4. the hover sway's push and the lean's force add, so sway and lean read as one motion;
     5. at rest nothing moves (ADR-0008), but a page scroll while the card is in view drags the rope's
        middle sideways a little (-0.04 x the scroll speed, at most 60 px/s), and on touch tips the photo's
        layers (--py, at most 0.3), so a scroll is felt and the card never wanders. */
import { mq, motionOK } from '../../scripts/env';

type Spring = { x: number; v: number; to: number };
const UI: [number, number] = [300, 30];
const TURN: [number, number] = [170, 22];
/** after a free spin: ζ = 0.75, so the face it lands on overshoots a little, once */
const LAND: [number, number] = [120, 2 * 0.75 * Math.sqrt(120)];
/** the card following its rope: a little lag, ζ ≈ 0.9 */
const HANG: [number, number] = [260, 2 * 0.9 * Math.sqrt(260)];
/** the entrance: an underdamped twist (period ≈ 0.85 s, ζ 0.3), handed to TURN after ENTER_MS */
const ENTER: [number, number] = [60, 2 * 0.3 * Math.sqrt(60)];
const ENTER_MS = 1300;
/** first-peak sizes: the twist on the rope and on touch, the touch card's swing about its clip, the
    clip's sideways push on the rope */
const ENTER_YAW_ROPE = 130, ENTER_YAW_TOUCH = 210, ENTER_SWING = 50; // deg/s
const ENTER_PUSH = 200; // px/s
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
/* round three: the lanyard follows the card (see the header) */
const K_LEAN = 900; // px/s² per radian of lean, sideways on the clip
const TWIST_PART = 0.3; // the strap's lower part that twists with the card's yaw
const SCROLL_DRAG = 0.04, SCROLL_DRAG_MAX = 60; // px/s at the rope's middle per px/s of scroll, and the cap
const SCROLL_TILT = 0.3; // the most a scroll tips the photo's layers (--py)

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
  /* round three: the strap's lower part, drawn narrower as it twists, and the lettering's mask */
  const ropeLow = [...(rope?.querySelectorAll<SVGPathElement>('[data-rope-low]') ?? [])];
  const ropeUp = [...(rope?.querySelectorAll<SVGPathElement>('[data-rope-up]') ?? [])];
  const textStops = [...(rope?.querySelectorAll<SVGStopElement>('[data-rope-tstop]') ?? [])];
  const hold = el.querySelector<HTMLElement>('.idc-hold');
  /* the floor shadow (round five, round-four critique §6): it stayed a full card-sized dark block while the
     card turned, so the frame where the card stood edge-on showed a thin card beside a dark soft rectangle.
     It now narrows with the card's projected width (|cos yaw|, never under 22 %) and lightens with it. */
  const shade = el.querySelector<HTMLElement>('.idc-shadow');
  let shadeW = -1;

  const still = () => mq.reduce.matches;
  const canTilt = () => mq.fine.matches && !still();
  /* the rope runs wherever motion is welcome (round three: touch too); only a fine pointer may hold it */
  const canRope = () => hang && !still() && !!(swing && anchor && rope && ropePath);

  let flipped = false;
  const tx = sp(), ty = sp(), fl = sp(), gl = sp(), th = sp(), tw = sp();
  /* the entrance: a twist about the lanyard (en, deg) and, without the rope, a swing about the clip (ep, deg) */
  const en = sp(), ep = sp();
  let entering = 0; // performance.now() when the entrance began, 0 when none is playing
  let tookOver = false;
  let spinning = false, landing = false;
  let raf = 0, last = 0, acc = 0, suppress = false;
  let backOn = false, drawn = false;
  /* a scroll's tip of the photo's layers (touch), a spring back to 0 */
  const sv = sp();

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

  /** Only the face toward the viewer is drawn: the normal of the front, turned by rotateY(yaw) (pitch
      never passes 90°), points at the viewer while cos(yaw) > 0. Under reduced motion the CSS
      crossfade decides. */
  function showFaces(yaw: number) {
    if (still()) { faces.forEach((f) => (f.style.opacity = '')); return; }
    const front = Math.cos((yaw * Math.PI) / 180) >= 0;
    faces[0].style.opacity = front ? '1' : '0';
    faces[1].style.opacity = front ? '0' : '1';
  }
  function faceState() {
    faces.forEach((f, i) => { f.inert = (i === 1) !== flipped; });
    el.classList.toggle('is-flipped', flipped);
  }
  faceState();
  showFaces(0);
  el.classList.add('is-live');
  /* round three: the photo's depth layers show together, once all of them are decoded */
  const relief = el.querySelector<HTMLElement>('.idc-relief');
  if (relief) {
    const imgs = [...relief.querySelectorAll('img')];
    const ready = () => Promise.all(imgs.map((im) => (im.complete && im.naturalWidth ? Promise.resolve() : im.decode()))).then(() => relief.classList.add('is-ready'), () => {});
    if (imgs.every((im) => im.complete && im.naturalWidth)) relief.classList.add('is-ready');
    else imgs.forEach((im) => im.addEventListener('load', () => { void ready(); }, { once: true }));
  }

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
    rope?.querySelector('[data-rope-tgrad]')?.setAttribute('y2', String(L));
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
    /* round three: the card's lean pushes its clip sideways (the lean's torque on the clip) */
    const lean = settling || drag ? 0 : -K_LEAN * Math.sin((ty.x * Math.PI) / 180);
    for (let i = 1; i <= SEG; i++) {
      const p = pts[i];
      if (drag && drag.pin === i) continue;
      const f = i === SEG ? 0.9995 : 0.985; // the strap itself is light and damps quickly
      const vx = (p.x - p.px) * f, vy = (p.y - p.py) * f;
      p.px = p.x; p.py = p.y;
      p.x += vx + (i === SEG ? lean * h * h : 0); p.y += vy + G * h * h;
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

  /** The clip's lift toward the viewer as the card pitches (round three), px. */
  const lift = () => restY * (1 - Math.cos((tx.x * Math.PI) / 180)) * 0.5;
  function renderRope(yaw = 0) {
    if (!ropePath) return;
    /* the drawn rope ends exactly at the card's clip: any difference between the simulated and the
       laid-out rest is spread along the rope */
    const ex = 0 - simRest.x, ey = restY - simRest.y - lift();
    const P = pts.map((p, i) => [p.x + (ex * i) / SEG, p.y + (ey * i) / SEG]);
    /* one smooth path through the points from a to b: quadratics through the midpoints */
    const trace = (a: number, b: number) => {
      const mid = (i: number) => [(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2];
      const f = (q: number[]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      let d = `M${f(a === 0 ? P[0] : mid(a - 1 >= 0 ? a - 1 : 0))}`;
      if (a === 0) d += ` L${f(mid(0))}`;
      for (let i = Math.max(1, a); i < b; i++) d += ` Q${f(P[i])} ${f(i + 1 === SEG && b === SEG ? P[SEG] : mid(i))}`;
      return d;
    };
    ropePath.setAttribute('d', trace(0, SEG));
    if (!ropeLow.length) return;
    /* the twist: the lower part narrows by |cos yaw| and shows its back face past 90 deg */
    const k = Math.round(SEG * (1 - TWIST_PART));
    const c = Math.cos((yaw * Math.PI) / 180);
    const up = trace(0, k), low = trace(k, SEG);
    for (const e of ropeUp) e.setAttribute('d', up);
    for (const e of ropeLow) { e.setAttribute('d', low); e.style.strokeWidth = `calc(${Math.max(0.1, Math.abs(c)).toFixed(3)} * var(--sw))`; }
    rope!.classList.toggle('is-back', c < 0);
    const vis = c <= 0.3 ? 0 : (c - 0.3) / 0.7;
    if (textStops.length === 2) {
      textStops[0].setAttribute('offset', ((k - 0.8) / SEG).toFixed(3));
      textStops[1].setAttribute('offset', ((k + 0.2) / SEG).toFixed(3));
      textStops[1].setAttribute('stop-opacity', vis.toFixed(3));
    }
  }

  function render() {
    const twist = clamp(-th.v * 0.4, -10, 10) + tw.x;
    const yaw = ty.x + twist + fl.x + en.x;
    const pitch = tx.x;
    body!.style.transform = still() ? '' : `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
    showFaces(yaw);
    if (shade) {
      const w = still() ? 1 : 0.22 + 0.78 * Math.abs(Math.cos((yaw * Math.PI) / 180));
      if (Math.abs(w - shadeW) > 0.004) { shadeW = w; shade.style.transform = w > 0.996 ? '' : `scaleX(${w.toFixed(3)})`; shade.style.opacity = w > 0.996 ? '' : (0.35 + 0.65 * w).toFixed(3); }
    }
    if (hold && !live) hold.style.transform = still() || Math.abs(ep.x) < 0.005 ? '' : `rotate(${ep.x.toFixed(3)}deg)`;
    if (live) {
      const c = pts[SEG];
      swing!.style.transform = `translate(${(c.x - simRest.x).toFixed(2)}px, ${(c.y - simRest.y - lift()).toFixed(2)}px) rotate(${th.x.toFixed(4)}rad)`;
      renderRope(yaw);
    } else if (swing) swing.style.transform = '';
    /* the light is fixed above and to the left; its reflection moves as the visible face turns */
    let local = ((yaw + 90) % 360 + 360) % 360 - 90;
    if (local > 90) local -= 180;
    const swingDeg = th.x * 57.3;
    body!.style.setProperty('--gx', (50 - local * 2.6 - swingDeg * 1.4).toFixed(1) + '%');
    body!.style.setProperty('--gy', (26 + pitch * 3).toFixed(1) + '%');
    body!.style.setProperty('--glare', clamp(0.3 + gl.x * 0.7 + Math.abs(local) / 40 + Math.abs(swingDeg) / 30, 0, 1).toFixed(3));
    body!.style.setProperty('--fa', (150 + local * 5 + swingDeg * 4).toFixed(1) + 'deg');
    body!.style.setProperty('--gr', (local * 0.1 + swingDeg * 0.1).toFixed(2) + 'deg');
    /* the depth layers follow every motion: the lean, the entrance twist, the swing, a scroll (touch) */
    body!.style.setProperty('--px', clamp((ty.x + en.x * 0.6 + twist * 0.5) / 14 + th.x * 1.2, -1, 1).toFixed(3));
    body!.style.setProperty('--py', clamp(-tx.x / 10 + sv.x + ep.x / 20, -1, 1).toFixed(3));
    /* the back's reveal (round three): face-on within 25 deg */
    const on = Math.cos((yaw * Math.PI) / 180) < -0.906;
    if (on !== backOn) {
      backOn = on;
      el.classList.toggle('is-back-on', on);
      if (on && !drawn) {
        drawn = true;
        el.classList.add('is-drawn');
        setTimeout(() => el.style.setProperty('--fd', '150ms'), 2400);
      }
    }
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
      step(tx, UI, H); step(ty, UI, H); step(gl, UI, H); step(tw, UI, H); step(sv, UI, H);
      const ent = entering && t - entering < ENTER_MS ? ENTER : TURN;
      step(en, ent, H); step(ep, ent, H);
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
    const done = !drag && !moving && !spinning && rest(tx, 0.02) && rest(ty, 0.02) && rest(fl, 0.05) && rest(gl, 0.002) && rest(tw, 0.02) && rest(en, 0.02) && rest(ep, 0.01) && rest(sv, 0.002);
    if (done) {
      entering = 0;
      if (el.dataset.entrance === 'play') el.dataset.entrance = 'done';
      for (const s of [tx, ty, gl, tw, th, en, ep, sv]) { s.x = s.to; s.v = 0; }
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

  /* round two: a mouse drag swings the tilting card (see the header) */
  let td: { id: number; x: number; y: number; moved: boolean } | null = null;
  if (!hang) {
    body.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !canTilt()) return;
      td = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    });
    el.addEventListener('pointermove', (e) => {
      if (!td || e.pointerId !== td.id) return;
      const dx = e.clientX - td.x, dy = e.clientY - td.y;
      if (!td.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        td.moved = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-held');
      }
      ty.to = band(dx * 0.09, 18);
      tx.to = -band(dy * 0.07, 12);
      gl.to = 1;
      kick();
    });
    const tend = (e: PointerEvent) => {
      if (!td || e.pointerId !== td.id) return;
      if (td.moved) {
        tx.to = ty.to = 0;
        suppress = true;
        setTimeout(() => { suppress = false; }, 0);
        el.classList.remove('is-held');
      }
      td = null;
      kick();
    };
    el.addEventListener('pointerup', tend);
    el.addEventListener('pointercancel', tend);
  }

  /* hover: lean toward the pointer (fine pointers only) */
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || drag || td || spinning || !canTilt()) return;
    takeOver();
    const r = body.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
    ty.to = nx * (hang ? 14 : 10);
    tx.to = -ny * (hang ? 10 : 8);
    gl.to = 1;
    kick();
  });
  el.addEventListener('pointerleave', () => { tx.to = ty.to = 0; gl.to = 0; kick(); });

  /* hover sway (round two, see the header): the pointer's recent speed, measured on the page */
  let px = 0, pt = 0, pv = 0, inside = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const dt = e.timeStamp - pt;
    if (dt > 0 && dt < 120) pv += ((e.clientX - px) / (dt / 1000) - pv) * 0.5; else pv = 0;
    px = e.clientX; pt = e.timeStamp;
  }, { passive: true });
  el.addEventListener('pointerover', (e) => {
    if (inside || e.pointerType !== 'mouse') return;
    const t = e.target as Element;
    if (!t.closest('[data-card-body], [data-rope-hit]')) return;
    inside = true;
    if (!live || drag || spinning) return;
    const r = body.getBoundingClientRect();
    let v = clamp(pv * 0.35, -140, 140);
    if (Math.abs(v) < 60) v = e.clientX < r.left + r.width / 2 ? 60 : -60;
    const c = pts[SEG];
    c.px = c.x - v * H;
    kick();
  });
  el.addEventListener('pointerout', (e) => {
    const to = e.relatedTarget as Element | null;
    if (!to || !to.closest?.('[data-card-body], [data-rope-hit]') || !el.contains(to)) inside = false;
  });

  /* hold (the hanging card only): grab the card or its rope, pull, let go or fling */
  function setLive() {
    const on = canRope();
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
      if (e.button !== 0 || e.pointerType === 'touch' || !live || !canTilt() || (e.target as Element).closest('a')) return;
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

    enter();

    /* round three: a scroll is felt (see the header, point 5) */
    let ly = scrollY, lt = performance.now(), seen = false, quiet = 0;
    new IntersectionObserver((es) => { seen = es.some((x) => x.isIntersecting); }).observe(el);
    addEventListener('scroll', () => {
      const now = performance.now(), dt = (now - lt) / 1000, dy = scrollY - ly;
      ly = scrollY; lt = now;
      if (!seen || still() || !motionOK() || dt <= 0 || dt > 0.2 || drag) return;
      const v = dy / dt;
      if (live) {
        const j = pts[SEG >> 1];
        const cur = (j.x - j.px) / H;
        const want = clamp(cur + clamp(-SCROLL_DRAG * v, -SCROLL_DRAG_MAX, SCROLL_DRAG_MAX) * 0.25, -SCROLL_DRAG_MAX, SCROLL_DRAG_MAX);
        j.px = j.x - want * H;
      }
      if (!mq.fine.matches) {
        sv.to = clamp(v / 4000, -SCROLL_TILT, SCROLL_TILT);
        clearTimeout(quiet);
        quiet = window.setTimeout(() => { sv.to = 0; kick(); }, 120);
      }
      kick();
    }, { passive: true });
  }

  /* ---- the entrance (see the header) ---- */
  function takeOver() {
    tookOver = true;
    entering = 0; // the twist and swing settle on the turn spring from wherever they are
  }
  function enter() {
    if (!motionOK()) return;
    /* round two: wait until the card is on screen */
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); begin(); } }, { threshold: 0.35 });
    io.observe(body!);
  }
  function begin() {
    if (!motionOK()) return;
    const stop = () => { takeOver(); off(); };
    const off = () => { removeEventListener('pointerdown', stop, true); removeEventListener('keydown', stop, true); };
    addEventListener('pointerdown', stop, true);
    addEventListener('keydown', stop, true);
    const img = el.querySelector<HTMLImageElement>('.idc-photo img');
    const decoded = !img || (img.complete && img.naturalWidth > 0) ? Promise.resolve() : img.decode().catch(() => {});
    let late = false;
    const go = () => {
      /* a reader who already pressed something, or a photo that took seconds, gets no entrance */
      if (tookOver || late || still() || !motionOK()) { off(); return; }
      if (document.hidden) { addEventListener('visibilitychange', () => requestAnimationFrame(go), { once: true }); return; }
      entering = performance.now();
      el.dataset.entrance = 'play';
      setTimeout(off, ENTER_MS + 1500);
      if (live) {
        en.v = ENTER_YAW_ROPE;
        const c = pts[SEG]; c.px = c.x - ENTER_PUSH * H;
      } else {
        en.v = ENTER_YAW_TOUCH;
        ep.v = ENTER_SWING;
      }
      kick();
    };
    Promise.race([decoded.then(() => 'ok'), new Promise((r) => setTimeout(r, 4000, 'late'))]).then((v) => {
      late = v === 'late';
      requestAnimationFrame(() => requestAnimationFrame(go));
    });
  }

  const reset = () => {
    for (const s of [tx, ty, gl, th, tw, en, ep, sv]) { s.x = s.to = 0; s.v = 0; }
    entering = 0;
    spinning = landing = false;
    fl.x = fl.to = flipped ? 180 : 0; fl.v = 0;
    if (hang) setLive();
    render();
  };
  mq.reduce.addEventListener?.('change', reset);
  mq.fine.addEventListener?.('change', reset);
}
