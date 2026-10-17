// Eat Map's scene (engraving guide §2.1, row S21): the map becomes the street. We stand on the near
// pavement of a Kadıköy market street at dusk and look across at the far row of shops; the street runs to
// the right, turns and falls away toward the pier and the sea. Below the far kerb the ground is no longer
// drawn in perspective: it is a cadastral plan of the quarter, in the manner of the Pervititch insurance
// maps, and the far row stands up out of it like a pop-up page. The route's three places are a mark on
// the plan, the lit doorway of the lokanta (the focus, low left) and a lit doorway down the street.
import { plate, spline, mix, lerp, smooth, rng } from './engrave.mjs';
import { street, occluders, area } from './world.mjs';

const D = Math.PI / 180;

/** The desktop master: 1600 x 1000 units over a 1526 x 954 px box at 1440 (the hero covers the middle at
    rest, so the picture lives in the left and right panels and the band under the hero). */
export function eatMapDesktop({ debug = false } = {}) {
  const W = 1600, H = 1000, HY = 500, BEND = 6;
  const P = plate({ w: W, h: H, seed: 2101, fade: [0.18, 0.18], clear: [{ x0: 640, y0: 656, x1: 962, y1: 940, f: 30 }], quiet: [{ x0: 500, y0: 140, x1: 1100, y1: 530, keep: 0.25 }], wk: 1.6 });
  const scene = streetScene(P, {
    cam: { f: 620, cx: 800, hy: HY, eye: [0, 1.6, 0] }, at: { s: 0, l: 4.0 }, b0: 65, b1: 40, BEND,
    far: [
      { s0: -9, s1: -4.6, top: 13.0, kind: 'shutter', chim: [-7.5], lit: [10] },
      { s0: -4.6, s1: 1.6, top: 15.2, kind: 'lokanta', door: [-1.75, -0.65], vit: [[-4.25, -2.25]], cumba: [-4.1, -1.2], chim: [-3.5, 0.6], lit: [] },
      { s0: 1.6, s1: 6.0, top: 13.6, kind: 'shop', cumba: [2.4, 5.2], chim: [3.4], cumbaLight: 1 },
      { s0: 6.6, s1: 13.5, top: 14.0, kind: 'fish', chim: [8.4, 12.6], lit: [1] },
      { s0: 13.5, s1: 21, top: 12.6, kind: 'shop', chim: [15.2], lit: [11] },
      { s0: 21, s1: 29, top: 11.8, kind: 'lit', chim: [24] },
      { s0: 29, s1: 40, top: 10.6, kind: 'shutter', chim: [33, 37] },
      { s0: 40, s1: 54, top: 9.5, kind: 'shop', chim: [45] },
    ],
    near: [
      { s0: 12, s1: 21, top: 13.2, kind: 'lit', chim: [18] },
      { s0: 21, s1: 31, top: 12.0, kind: 'shutter', chim: [27], cumba: [23, 27] },
      { s0: 31, s1: 46, top: 10.4, kind: 'shop', chim: [40] },
    ],
    cart: [-5.2, -4.25],
    cable: 16,
    farDoor: 25,
    debug,
  });
  return { P, svg: () => P.svg({ title: 'Eat Map: a market street that rises out of its map', desc: 'A Kadıköy market street at dusk as an engraving: a lit lokanta doorway, striped awnings, bay windows on corbels, the street turning down to the sea; below the far kerb the same quarter is a plan.', places: scene.places }) };
}

/** The phone master: 480 x 900 units over a 480 px box (guide §1.7): the market street as a stair that
    climbs up the column, the lokanta low on the left, the plan at the foot of the stair. One layer. */
export function eatMapPhone({ debug = false } = {}) {
  const W = 480, H = 900;
  /* the hero covers 36-354 x 110-335 at rest, the texts 120-360 x 350-545 (each plus its margin) */
  const P = plate({ w: W, h: H, seed: 2102, fade: [0.18, 0.18], one: 'phone', wk: 1.85,
    clear: [{ x0: 118, y0: 352, x1: 362, y1: 548, f: 22 }], quiet: [{ x0: 80, y0: 110, x1: 400, y1: 335, keep: 0.5 }] });
  const scene = streetScene(P, {
    cam: { f: 520, cx: 300, hy: 613, eye: [0, 1.6, 0] }, at: { s: 0, l: 3.5 }, b0: 62, b1: 62, BEND: 1000,
    ground: (s) => (s < 2.6 ? 0 : 0.17 * Math.ceil((s - 2.6) / 0.3)), half: 5.0, back: 'none', planRot: 0,
    far: [
      { s0: -6, s1: -1.8, top: 12.5, kind: 'shutter' },
      { s0: -1.8, s1: 2.6, top: 14.6, kind: 'lokanta', door: [0.8, 1.8], vit: [[-1.6, 0.35]], cumba: [-1.3, 2.2], chim: [] },
      { s0: 2.6, s1: 6.4, top: 12.0, kind: 'lit', cumba: [3.0, 6.0], cumbaLight: 1 },
      { s0: 6.4, s1: 11, top: 12.4, kind: 'shop' },
      { s0: 11, s1: 18, top: 11.6, kind: 'shutter' },
    ],
    near: [],
    farDoor: 4.5, planK: 3.4, lanes: [[30, 3], [70, 3.4], [120, 3]], markAt: [38, 60],
    debug,
  });
  return { P, svg: () => P.svg({ title: 'Eat Map: a market stair that rises out of its map', desc: 'A Kadıköy market stair at dusk as an engraving: a lit lokanta doorway, awnings and bay windows climbing the column, a minaret at the top; the plan of the quarter at its foot.', places: scene.places.map(([x, y]) => [x, y, 22, 6]) }) };
}

function streetScene(P, cfg) {
  const { BEND, debug } = cfg;
  const HY = cfg.cam.hy;
  const st = street({
    cam: cfg.cam, at: cfg.at,
    segs: [{ s0: -60, a: cfg.b0 * D }, { s0: BEND, a: cfg.b1 * D }],
    ground: cfg.ground ?? ((s) => (s < BEND ? -0.05 * s : -0.05 * BEND - 0.085 * (s - BEND))),
  });
  const along = cfg.view === 'along';
  const { g } = st;
  const pt = (s, l, h) => st.P(s, l, h);
  const Zof = (s, l, h) => st.Z(s, l, h);
  const vp0 = st.vp(cfg.b0 * D), vp1 = st.vp(cfg.b1 * D), vpx = st.vp(cfg.b0 * D - Math.PI / 2), vpx1 = st.vp(cfg.b1 * D - Math.PI / 2);
  const vpOf = (s) => (s < BEND ? vp0 : vp1);
  const vpxOf = (s) => (s < BEND ? vpx : vpx1);
  const occ = occluders();
  const r = rng(77);
  const O = () => occ.list.slice();
  const ln = (layer, pts, w, o = {}) => P.line(layer, pts, w, { occl: O(), taper: o.taper ?? 16, ...o });
  const FAR = -(cfg.half ?? 5.0), NEAR = cfg.half ?? 5.0, KF = FAR + 1.4, KN = NEAR - 1.4;
  const L = 'mid';
  /* level of detail: a face far from the eye gets no tone and thinner lines */
  const lod = (s, l = FAR) => clampN(1 - (Zof(s, l, g(s)) - 14) / 30, 0.35, 1);

  function face(layer, pts, o = {}) {
    if (occ.covered(pts)) return false;
    if (o.tone && Math.abs(area(pts)) > (o.minArea ?? 60)) P.tone(layer, pts, o.tone, { ...o.hatch, occl: O() });
    const ws = o.ew ?? [];
    if (o.edges !== false) for (let i = 0; i < pts.length; i++) {
      const w = (ws[i] ?? o.w ?? 0.9) * (o.k ?? 1);
      if (w > 0.3) ln(layer, [pts[i], pts[(i + 1) % pts.length]], w, { taper: 20 });
    }
    if (o.hide !== false) occ.add(pts);
    return true;
  }

  /** light around a lamp: stipple that thins out with distance (no rays: a lamp is not a sun) */
  function halo(layer, c, r0, r1, n, down = false) {
    const ring = [];
    for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2; ring.push([c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1 * (down ? 1.2 : 1)]); }
    P.stipple(layer, ring, n, { size: 0.5, minD: 2.2, dens: (x, y) => { const d = Math.hypot(x - c[0], y - c[1]); return d < r0 ? 0 : (1 - (d - r0) / (r1 - r0)) ** 1.5 * (down && y < c[1] - 2 ? 0.25 : 1); } });
  }

  /* the fold: the far kerb up to the turn, then across the street at the turn. Below it, the plan. */
  const foldPts = [];
  if (along) for (let l = -14; l <= 14; l += 0.5) foldPts.push(pt(cfg.sFold, l, g(cfg.sFold)));
  else for (let s = -14; s <= BEND; s += 0.5) foldPts.push(pt(s, KF, g(s)));
  if (!along) {
    /* past the turn the fold keeps the kerb's line across the page: the street beyond the turn stands up
       out of the sheet behind it */
    const a = foldPts[foldPts.length - 8], b = foldPts[foldPts.length - 1];
    const m = (b[1] - a[1]) / (b[0] - a[0]);
    for (let x = b[0] + 40; x <= 1720; x += 40) foldPts.push([x, b[1] + m * (x - b[0])]);
  }
  occ.add([...foldPts, [1800, 1200], [-200, 1200]]);

  if (debug && !along) {
    const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
    const to = (sx, sy) => [(sx + 43) / 0.954, (sy + 18) / 0.954];
    const box = (a, b, c, d) => { const p = to(a, b), q = to(c, d); return rect(p[0], p[1], q[0], q[1]); };
    P.line('debug', box(420, 100, 1020, 505), 2, { keep: true, free: true, taper: 0 });
    P.line('debug', box(588, 625, 853, 840), 2, { keep: true, free: true, taper: 0 });
  }

  /* ================= FRONT: the bulbs strung across the street past the turn ================= */
  if (cfg.cable) {
    const s = cfg.cable, h = g(s) + 5.0;
    const cab = (t) => pt(s, lerp(FAR, NEAR, t), lerp(h + 0.1, h + 0.3, t) - 0.6 * Math.sin(Math.PI * t));
    ln('front', Array.from({ length: 33 }, (_, i) => cab(i / 32)), 0.75, { taper: 60 });
    const n = 8;
    for (let i = 1; i < n; i++) {
      const t = i / n, top = cab(t);
      const bot = pt(s, lerp(FAR, NEAR, t), lerp(h + 0.1, h + 0.3, t) - 0.6 * Math.sin(Math.PI * t) - 0.28);
      ln('front', [top, bot], 0.45, { taper: 0 });
      const k = Math.max(2.4, (bot[1] - top[1]) * 0.42);
      const c = [bot[0], bot[1] + k * 1.05];
      /* the bulb: a pear with a light, ruled shoulder; a ring of short rays around it */
      const pear = spline([[c[0], bot[1]], [c[0] + k * 0.45, bot[1] + k * 0.35], [c[0] + k * 0.85, c[1] + k * 0.25], [c[0], c[1] + k * 1.05], [c[0] - k * 0.85, c[1] + k * 0.25], [c[0] - k * 0.45, bot[1] + k * 0.35], [c[0], bot[1]]], 1);
      ln('front', pear, 0.55, { taper: 0 });
      halo('front', [c[0], c[1] + 0.3 * k], k * 1.6, k * 4.2, 22);
    }
  }

  /** a window with its reveal, sill and head shadow */
  function win(s0, s1, h0, h1, f, o = {}) {
    const sg = f < 0 ? -1 : 1, dep = 0.17 * sg, k = o.k ?? 1;
    const A = pt(s0, f, h0), B = pt(s1, f, h0), C = pt(s1, f, h1), Dd = pt(s0, f, h1);
    const a = pt(s0, f + dep, h0), b = pt(s1, f + dep, h0), c = pt(s1, f + dep, h1), d = pt(s0, f + dep, h1);
    const open = [A, B, C, Dd];
    if (occ.covered(open) || Math.abs(area(open)) < 20) return;
    const j1 = [A, Dd, d, a], j2 = [B, C, c, b];
    const jamb = Math.abs(area(j1)) > Math.abs(area(j2)) ? j1 : j2;
    if (o.lit) P.hatch(L, [a, b, c, d], { angle: 90, s: 2.8, w: 0.48, occl: O(), jit: 0.14 });
    else if (o.shut) P.hatch(L, [a, b, c, d], { vp: vpOf(s0), s: 3.4, w: 0.42, occl: O() });
    if (k > 0.6) {
      if (Math.abs(area(jamb)) > 8) P.hatch(L, jamb, { angle: 90, s: 3.6, w: 0.42, occl: O() });
    }
    ln(L, [Dd, C], 1.0 * k); ln(L, [B, C], 1.1 * k); ln(L, [A, B], 0.65 * k); ln(L, [A, Dd], 0.65 * k);
    if (k > 0.6) ln(L, [d, c], 0.5, { taper: 'lens' });
    if (o.mullion !== false && k > 0.5) {
      ln(L, [mix(a, b, 0.5), mix(d, c, 0.5)], 0.48 * k);
      ln(L, [mix(a, d, 0.7), mix(b, c, 0.7)], 0.42 * k);
    }
    /* the sill and the shadow it throws */
    const so = -0.11 * sg;
    const p0 = pt(s0 - 0.09, f + so, h0), p1 = pt(s1 + 0.09, f + so, h0), q1 = pt(s1 + 0.09, f + so, h0 - 0.08), q0 = pt(s0 - 0.09, f + so, h0 - 0.08);
    ln(L, [p0, p1], 0.65 * k); ln(L, [q0, q1], 0.9 * k);
    if (k > 0.6) P.hatch(L, [q0, q1, pt(s1 + 0.09, f, h0 - 0.26), pt(s0 - 0.09, f, h0 - 0.26)], { vp: vpOf(s0), s: 3, w: 0.42, occl: O() });
    occ.add(open);
  }

  /** a striped canvas awning (the stripes are real: alternate panels ruled), seen from below near the eye */
  function awning(s0, s1, f, hTop, hLow, depth, k = 1) {
    const out = f < 0 ? depth : -depth;
    const A = pt(s0, f, hTop), B = pt(s1, f, hTop), C = pt(s1, f + out, hLow), Dd = pt(s0, f + out, hLow);
    const vC = pt(s1, f + out, hLow - 0.24), vD = pt(s0, f + out, hLow - 0.24);
    const n = Math.max(4, Math.round((s1 - s0) / 0.4));
    const val = [Dd, C, vC, vD];
    if (!occ.covered(val)) {
      for (let i = 0; i < n; i += 2) {
        const q = [mix(Dd, C, i / n), mix(Dd, C, (i + 1) / n), mix(vD, vC, (i + 1) / n), mix(vD, vC, i / n)];
        if (k > 0.5) P.hatch(L, q, { angle: 90, s: 2.7, w: 0.42, occl: O() });
      }
      const hem = [];
      for (let i = 0; i <= n * 6; i++) { const t = i / (n * 6); const p = mix(vD, vC, t); hem.push([p[0], p[1] + Math.abs(Math.sin(t * n * Math.PI)) * 1.4 * k]); }
      ln(L, hem, 1.2 * k, { taper: 30 });
      ln(L, [Dd, C], 0.9 * k, { taper: 30 });
      occ.add(val);
    }
    const top = [A, B, C, Dd];
    if (!occ.covered(top)) {
      /* seen from below: the underside of the canvas, its stripes faint through it and its ribs */
      const under = (area(top) > 0) === (f < 0);
      for (let i = 0; i < n; i++) {
        const q = [mix(A, B, i / n), mix(A, B, (i + 1) / n), mix(Dd, C, (i + 1) / n), mix(Dd, C, i / n)];
        if (i % 2 === 0 && k > 0.5) P.hatch(L, q, { vp: vpxOf(s0), s: under ? 4.2 : 3.4, w: 0.4, occl: O(), drop: () => (under ? 0.7 : 0.9) });
        if (i % 3 === 0) ln(L, [mix(A, B, i / n), mix(Dd, C, i / n)], 0.42 * k, { taper: 'lens' });
      }
      ln(L, [A, B], 0.6 * k, { taper: 30 });
      occ.add(top);
    }
    for (const sc of [s0, s1]) {
      const ch = [pt(sc, f, hTop), pt(sc, f + out, hLow), pt(sc, f + out, hLow - 0.24), pt(sc, f, hLow - 0.1)];
      if (Math.abs(area(ch)) > 40) face(L, ch, { tone: k > 0.5 ? 1 : 0, hatch: { angle: 80, s: 3.6, w: 0.42 }, ew: [0.7, 0.8, 0.5, 0.5], k });
    }
    /* a narrow band of shadow on the wall under it */
    if (k > 0.5) P.hatch(L, [pt(s0, f, hTop), pt(s1, f, hTop), pt(s1, f, hTop - 0.55), pt(s0, f, hTop - 0.55)], { vp: vpOf(s0), s: 3.6, w: 0.42, occl: O() });
  }

  /** a bay window (cumba) on corbels */
  function cumba(c0, c1, f, h0, h1, light, k = 1) {
    const out = f < 0 ? 0.9 : -0.9, ch = 0.32;
    const fr = [pt(c0 + ch, f + out, h0), pt(c1 - ch, f + out, h0), pt(c1 - ch, f + out, h1), pt(c0 + ch, f + out, h1)];
    const sN = [pt(c0, f, h0), pt(c0 + ch, f + out, h0), pt(c0 + ch, f + out, h1), pt(c0, f, h1)];
    const sF = [pt(c1 - ch, f + out, h0), pt(c1, f, h0), pt(c1, f, h1), pt(c1 - ch, f + out, h1)];
    const bot = [pt(c0, f, h0), pt(c1, f, h0), pt(c1 - ch, f + out, h0), pt(c0 + ch, f + out, h0)];
    const nf = Math.max(1, Math.floor((h1 - h0) / 3.0));
    /* corbels first: they are in front of the wall and under the bay */
    for (const t of [0.12, 0.5, 0.88]) {
      const sc = lerp(c0 + 0.2, c1 - 0.2, t);
      const k1 = pt(sc, f, h0 - 0.95), k3 = pt(sc, f + out * 0.9, h0 - 0.02), elbow = pt(sc, f + out * 0.2, h0 - 0.32);
      ln(L, spline([k1, elbow, k3], 1.5), 1.0 * k, { taper: 8 });
      ln(L, spline([pt(sc + 0.06, f, h0 - 0.9), pt(sc + 0.06, f + out * 0.22, h0 - 0.28), pt(sc + 0.06, f + out * 0.88, h0 - 0.02)], 1.5), 0.45 * k, { taper: 8 });
    }
    face(L, bot, { tone: k > 0.5 ? 3 : 1, hatch: { vp: vpOf(c0), s: 3.4, w: 0.42 }, ew: [0.4, 0.6, 1.3, 0.6], k });
    for (let fl = 0; fl < nf; fl++) {
      for (let i = 0; i < 3; i++) {
        const w0 = lerp(c0 + ch + 0.16, c1 - ch - 0.16, i / 3) + 0.09, w1 = lerp(c0 + ch + 0.16, c1 - ch - 0.16, (i + 1) / 3) - 0.09;
        const y0 = h0 + fl * 3.0 + 0.8, y1 = y0 + 1.55;
        const q = [pt(w0, f + out, y0), pt(w1, f + out, y0), pt(w1, f + out, y1), pt(w0, f + out, y1)];
        if (occ.covered(q)) continue;
        if (light === fl * 10 + i) P.hatch(L, q, { angle: 90, s: 2.8, w: 0.46, occl: O() });
        ln(L, [q[3], q[2]], 0.85 * k); ln(L, [q[2], q[1]], 0.85 * k); ln(L, [q[1], q[0]], 0.55 * k); ln(L, [q[0], q[3]], 0.55 * k);
        ln(L, [mix(q[0], q[3], 0.68), mix(q[1], q[2], 0.68)], 0.4 * k);
        occ.add(q);
      }
      if (fl > 0) ln(L, [pt(c0 + ch, f + out, h0 + fl * 3.0), pt(c1 - ch, f + out, h0 + fl * 3.0)], 0.55 * k, { taper: 30 });
    }
    ln(L, [pt(c0 + ch - 0.06, f + out * 1.06, h1 + 0.1), pt(c1 - ch + 0.06, f + out * 1.06, h1 + 0.1)], 1.0 * k, { taper: 30 });
    face(L, fr, { tone: 0, ew: [0.7, 1.3, 0.9, 0.8], k });
    const side = Math.abs(area(sN)) > Math.abs(area(sF)) ? sN : sF;
    face(L, side, { tone: k > 0.5 ? 1 : 0, hatch: { angle: 90, s: 4.2, w: 0.42 }, ew: [0.5, 0.9, 0.5, 0.5], k });
    /* its cast shadow on the wall, down and to the right */
    if (k > 0.5) P.hatch(L, [pt(c1, f, h1 - 0.4), pt(c1 + 0.5, f, h1 - 0.7), pt(c1 + 0.5, f, h0 - 1.1), pt(c1, f, h0 - 0.8)], { vp: vpOf(c1), s: 3.6, w: 0.42, occl: O() });
  }

  /** a building of a row */
  function building(b) {
    const f = b.f ?? FAR, sg = f < 0 ? 1 : -1;
    const gHi = Math.max(g(b.s0), g(b.s1)), gLo = Math.min(g(b.s0), g(b.s1));
    const top = gLo + b.top, shop = gHi + 3.9;
    const k = lod((b.s0 + b.s1) / 2, f);
    const A = pt(b.s0, f, g(b.s0)), B = pt(b.s1, f, g(b.s1)), C = pt(b.s1, f, top), Dd = pt(b.s0, f, top);
    if (b.kind === 'lokanta') lokanta(b, f, sg, shop);
    else if (b.kind === 'fish') fishStall(b, f, sg, shop, k);
    else {
      const s0 = b.s0 + 0.45, s1 = b.s1 - 0.45;
      awning(s0 - 0.1, s1 + 0.1, f, shop - 0.2, shop - 1.05, 1.25, k);
      const shp = [pt(s0, f + 0.15 * sg, g(s0)), pt(s1, f + 0.15 * sg, g(s1)), pt(s1, f + 0.15 * sg, shop - 1.3), pt(s0, f + 0.15 * sg, shop - 1.3)];
      if (b.kind === 'shutter') P.hatch(L, shp, { vp: vpOf(s0), s: 4.4, w: 0.38, occl: O() });
      else if (b.kind === 'lit') {
        const dm = (s0 + s1) / 2;
        const dr = [pt(dm - 0.55, f + 0.15 * sg, g(dm)), pt(dm + 0.55, f + 0.15 * sg, g(dm)), pt(dm + 0.55, f + 0.15 * sg, g(dm) + 2.3), pt(dm - 0.55, f + 0.15 * sg, g(dm) + 2.3)];
        P.hatch(L, dr, { angle: 90, s: 2.5, w: 0.46, occl: O() });
        ln(L, [dr[0], dr[3], dr[2], dr[1]], 1.3);
        occ.add(dr);
        P.hatch(L, shp, { vp: vpOf(s0), s: 6, w: 0.4, occl: O() });
      } else if (k > 0.5) P.hatch(L, shp, { vp: vpOf(s0), s: 5.6, w: 0.4, occl: O() });
      ln(L, [shp[0], shp[3], shp[2], shp[1]], 0.9 * k);
      occ.add(shp);
    }
    if (b.cumba) cumba(b.cumba[0], b.cumba[1], f, shop + 0.55, top - 1.1, b.cumbaLight ?? 11, k);
    const nfl = Math.max(1, Math.floor((top - 1.0 - shop) / 3.0));
    const parts = b.cumba ? [[b.s0 + 0.25, b.cumba[0] - 0.25], [b.cumba[1] + 0.25, b.s1 - 0.25]] : [[b.s0 + 0.25, b.s1 - 0.25]];
    for (const [a0, a1] of parts) {
      if (a1 - a0 < 1.3) continue;
      const nw = Math.max(1, Math.round((a1 - a0) / 2.5));
      for (let fl = 0; fl < nfl; fl++) {
        const y0 = shop + fl * 3.0 + 0.85;
        for (let i = 0; i < nw; i++) {
          const c = lerp(a0, a1, (i + 0.5) / nw);
          win(c - 0.55, c + 0.55, y0, y0 + 1.65, f, { lit: (b.lit ?? []).includes(fl * 10 + i), shut: (b.shut ?? []).includes(fl * 10 + i), k });
        }
      }
    }
    for (let fl = 1; fl <= nfl; fl++) ln(L, [pt(b.s0, f, shop + fl * 3.0 - 0.15), pt(b.s1, f, shop + fl * 3.0 - 0.15)], 0.45 * k, { taper: 40 });
    /* the cornice: a band that stands out over a narrow, deep shadow */
    const co = 0.38 * sg;
    face(L, [pt(b.s0, f + co, top), pt(b.s1, f + co, top), pt(b.s1, f + co, top - 0.22), pt(b.s0, f + co, top - 0.22)], { tone: 0, ew: [0.8, 0.6, 1.2, 0.6], k });
    if (k > 0.5) P.hatch(L, [pt(b.s0, f, top - 0.22), pt(b.s1, f, top - 0.22), pt(b.s1, f, top - 0.7), pt(b.s0, f, top - 0.7)], { vp: vpOf(b.s0), s: 3.4, w: 0.42, occl: O() });
    /* the wall: lit if it faces the light (the far row before the turn, the near row after it) */
    const lit = f < 0 ? b.s0 < BEND : true;
    face(L, [A, B, C, Dd], lit || k < 0.5 ? { tone: 0, ew: [0.6, 1.1, 0.6, 0.8], k } : { tone: 1, hatch: { vp: vpOf(b.s0), s: 6.2, w: 0.42 }, ew: [0.6, 1.1, 0.6, 0.8], k });
    for (const cs of b.chim ?? []) {
      const ch = [pt(cs, f - 1.4 * sg, top), pt(cs + 0.6, f - 1.4 * sg, top), pt(cs + 0.6, f - 1.4 * sg, top + 1.5), pt(cs, f - 1.4 * sg, top + 1.5)];
      face('back', ch, { tone: k > 0.6 ? 1 : 0, hatch: { angle: 90, s: 3.6, w: 0.4 }, ew: [0.4, 0.8, 0.5, 0.5], k });
      ln('back', [pt(cs - 0.08, f - 1.4 * sg, top + 1.5), pt(cs + 0.68, f - 1.4 * sg, top + 1.5)], 0.7 * k);
    }
  }

  function lokanta(b, f, sg, shop) {
    const [d0, d1] = b.door, dh = g(d0) + 2.55;
    /* the fascia over the door (a plain board, no letters) and the awning over the vitrine only */
    awning(b.vit[0][0] - 0.1, b.vit[0][1] + 0.15, f, shop - 0.2, shop - 1.15, 1.45);
    const fas = [pt(d0 - 0.25, f + 0.05 * sg, dh + 0.35), pt(d1 + 0.25, f + 0.05 * sg, dh + 0.35), pt(d1 + 0.25, f + 0.05 * sg, dh + 0.95), pt(d0 - 0.25, f + 0.05 * sg, dh + 0.95)];
    ln(L, [...fas, fas[0]], 0.8, { taper: 0 });
    ln(L, [mix(fas[0], fas[3], 0.2), mix(fas[1], fas[2], 0.2)], 0.45);
    /* a lamp on a bracket over the door, its light ruled around it */
    {
      const lb = pt((d0 + d1) / 2, f + 0.55 * sg, dh + 0.35), wall = pt((d0 + d1) / 2, f, dh + 0.55);
      ln(L, [wall, lb], 0.9, { taper: 0 });
      const kk = 5.5, c = [lb[0], lb[1] + kk];
      ln(L, spline([[c[0] - kk * 0.9, lb[1] + 1], [c[0], lb[1] - kk * 0.3], [c[0] + kk * 0.9, lb[1] + 1]], 1), 1.0, { taper: 0 });
      halo(L, [c[0], c[1] + 2], kk * 1.4, kk * 5, 40, true);
      occ.add([[c[0] - kk, lb[1]], [c[0] + kk, lb[1]], [c[0] + kk, c[1] + 2], [c[0] - kk, c[1] + 2]]);
    }
    /* the doorway: open; the lit room beyond is a fine ruling (the densest ink of the plate) and the
       cook at the counter is left out of it, a dark figure against the light */
    const door = [pt(d0, f, g(d0)), pt(d1, f, g(d1)), pt(d1, f, dh), pt(d0, f, dh)];
    const inn = [pt(d0, f - 0.38 * sg, g(d0)), pt(d1, f - 0.38 * sg, g(d1)), pt(d1, f - 0.38 * sg, dh), pt(d0, f - 0.38 * sg, dh)];
    const ww = inn[1][0] - inn[0][0], hh = inn[0][1] - inn[3][1];
    const X = (u) => inn[0][0] + ww * u, Y = (v) => inn[0][1] - hh * v;
    /* the cook: a cap, a head turned a little, broad shoulders, an arm out to the trays */
    const cook = spline([[X(0.36), Y(0.42)], [X(0.35), Y(0.58)], [X(0.38), Y(0.66)], [X(0.46), Y(0.69)], [X(0.47), Y(0.73)],
      [X(0.455), Y(0.79)], [X(0.47), Y(0.84)], [X(0.53), Y(0.855)], [X(0.585), Y(0.83)], [X(0.58), Y(0.78)], [X(0.565), Y(0.73)],
      [X(0.57), Y(0.69)], [X(0.66), Y(0.665)], [X(0.72), Y(0.62)], [X(0.86), Y(0.55)], [X(0.88), Y(0.52)], [X(0.71), Y(0.56)], [X(0.69), Y(0.42)]], 1.4);
    const counter = [[X(0), Y(0.42)], [X(1), Y(0.42)], [X(1), Y(0)], [X(0), Y(0)]];
    P.hatch(L, inn, { angle: 90, s: 2.4, w: 0.48, occl: O(), jit: 0.06, holes: [cook, counter] });
    /* the counter: its top edge and a soft shine on its front */
    ln(L, [[X(0), Y(0.42)], [X(1), Y(0.42)]], 0.8, { taper: 0 });
    P.hatch(L, counter, { angle: 0, s: 3.2, w: 0.42, occl: O() });
    /* the cook's lit rim (the light is behind) and the hatching that turns with the shoulders */
    ln(L, cook.slice(0, Math.floor(cook.length * 0.55)), 0.5, { taper: 'lens' });
    for (let i = 0; i < 5; i++) {
      const y = Y(0.44 + i * 0.04), xL = X(0.37 + i * 0.006), xR = X(0.69 - i * 0.004);
      ln(L, spline([[xL, y + 1], [(xL + xR) / 2, y - 1.2], [xR, y + 1]], 1.5), 0.38, { taper: 'lens' });
    }
    /* the far jamb and the head in deep tone, the shadow-side contour as the plate's accent */
    P.tone(L, [door[1], door[2], inn[2], inn[1]], 3, { angle: 90, s: 2.8, w: 0.48, occl: O() });
    P.tone(L, [door[3], door[2], inn[2], inn[3]], 2, { angle: 0, s: 2.8, w: 0.48, occl: O() });
    ln(L, [door[0], door[3]], 1.1, { taper: 30 });
    ln(L, [door[3], door[2]], 1.5, { taper: 30 });
    ln(L, [door[2], door[1]], 2.2, { taper: 34 });
    ln(L, [inn[3], inn[2], inn[1]], 0.6);
    /* the threshold, a worn marble step */
    const t0 = pt(d0 - 0.12, f + 0.26 * sg, g(d0) + 0.13), t1 = pt(d1 + 0.12, f + 0.26 * sg, g(d1) + 0.13);
    ln(L, [t0, t1], 1.0); ln(L, [pt(d0 - 0.12, f + 0.26 * sg, g(d0)), pt(d1 + 0.12, f + 0.26 * sg, g(d1))], 0.75);
    occ.add(door);
    /* the light falling out of the door across the pavement, ruled toward the kerb */
    const spill = [pt(d0, f + 0.3 * sg, g(d0)), pt(d1, f + 0.3 * sg, g(d1)), pt(d1 + 0.7, KF - 0.05, g(d1 + 0.7)), pt(d0 - 0.4, KF - 0.05, g(d0 - 0.4))];
    P.hatch(L, spill, { vp: vpx, s: 3.2, w: 0.42, occl: O(), drop: () => 0.8 });
    /* the vitrine: two rows of steam trays behind the glass, the room's light behind them */
    for (const [v0, v1] of b.vit) {
      const vb = g(v1) + 0.8, vt = shop - 1.35;
      const vit = [pt(v0, f, vb), pt(v1, f, vb), pt(v1, f, vt), pt(v0, f, vt)];
      for (const row of [0, 1]) {
        const h2 = vb + 0.12 + row * 0.6, nT = Math.max(2, Math.round((v1 - v0) / 0.6));
        for (let i = 0; i < nT; i++) {
          const t0b = lerp(v0 + 0.12, v1 - 0.12, i / nT) + 0.05, t1b = lerp(v0 + 0.12, v1 - 0.12, (i + 1) / nT) - 0.05;
          const rim = [pt(t0b, f - 0.18 * sg, h2 + 0.1), pt(t1b, f - 0.18 * sg, h2 + 0.1), pt(t1b, f - 0.62 * sg, h2 + 0.1), pt(t0b, f - 0.62 * sg, h2 + 0.1)];
          /* each tray: a rim, a front face, the food heaped as a crown with stipple on its lit top */
          ln(L, [rim[3], rim[0], rim[1], rim[2]], 0.6, { taper: 0 });
          const fr = [rim[0], rim[1], pt(t1b, f - 0.18 * sg, h2), pt(t0b, f - 0.18 * sg, h2)];
          P.hatch(L, fr, { angle: 0, s: 2.6, w: 0.4, occl: O() });
          ln(L, [fr[3], fr[2]], 0.5);
          const crown = spline([rim[3], mix(rim[3], rim[2], 0.3).map((v, q) => v - (q ? 3.2 : 0)), mix(rim[3], rim[2], 0.7).map((v, q) => v - (q ? 2.6 : 0)), rim[2]], 1.5);
          ln(L, crown, 0.45, { taper: 'lens' });
          P.stipple(L, [rim[0], rim[1], ...crown.slice().reverse()], 5, { size: 0.5, minD: 2.4, occl: O() });
        }
        ln(L, [pt(v0, f - 0.12 * sg, h2), pt(v1, f - 0.12 * sg, h2)], 0.7);
      }
      /* the glass: light from inside, a sparse ruling, two glints */
      P.hatch(L, vit, { angle: 90, s: 4, w: 0.4, occl: O(), drop: () => 0.55 });
      for (const t of [0.18, 0.26]) ln(L, [mix(vit[3], vit[2], t), mix(vit[0], vit[1], t + 0.18)], 0.45, { taper: 'lens' });
      ln(L, [vit[3], vit[2]], 1.0); ln(L, [vit[2], vit[1]], 1.25); ln(L, [vit[1], vit[0]], 0.75); ln(L, [vit[0], vit[3]], 0.75);
      occ.add(vit);
    }
  }

  function fishStall(b, f, sg, shop, k) {
    awning(b.s0 + 0.2, b.s1 - 0.2, f, shop - 0.2, shop - 1.1, 1.7, k);
    const s0 = b.s0 + 0.6, s1 = b.s1 - 0.6;
    /* crates of fish on ice on a stepped stand on the pavement: fish laid head to tail across each crate */
    for (let row = 2; row >= 0; row--) {
      const l0 = f + (0.45 + row * 0.42) * sg, l1 = l0 + 0.4 * sg, h = g(s1) + 0.72 + (2 - row) * 0.2;
      const nC = Math.max(2, Math.round((s1 - s0) / 0.75));
      for (let i = 0; i < nC; i++) {
        const c0 = lerp(s0, s1, i / nC) + 0.03, c1 = lerp(s0, s1, (i + 1) / nC) - 0.03;
        const top4 = [pt(c0, l1, h), pt(c1, l1, h), pt(c1, l0, h), pt(c0, l0, h)];
        const front = [pt(c0, l1, h), pt(c1, l1, h), pt(c1, l1, h - 0.16), pt(c0, l1, h - 0.16)];
        if (occ.covered(top4) || Math.abs(area(top4)) < 12) continue;
        face(L, front, { tone: k > 0.6 ? 1 : 0, hatch: { vp: vpOf(c0), s: 3, w: 0.4 }, ew: [0.5, 0.6, 0.8, 0.5], k });
        if (k > 0.75) for (let q = 0; q < 3; q++) {
          const tt = 0.12 + (q + 0.5) * 0.25;
          const p0 = mix(mix(top4[0], top4[1], tt), mix(top4[3], top4[2], tt), 0.1), p1 = mix(mix(top4[0], top4[1], tt), mix(top4[3], top4[2], tt), 0.86);
          const dx = p1[0] - p0[0], dy = p1[1] - p0[1], Ld = Math.hypot(dx, dy) || 1;
          ln(L, [p0, p1], Math.min(1.6, Ld * 0.16), { taper: 'lens', e: 0.12, occl: [] });
          ln(L, [p1, [p1[0] + dx * 0.14 + dy * 0.12, p1[1] + dy * 0.14 - dx * 0.12]], 0.42, { taper: 'lens', occl: [] });
          ln(L, [p1, [p1[0] + dx * 0.14 - dy * 0.12, p1[1] + dy * 0.14 + dx * 0.12]], 0.42, { taper: 'lens', occl: [] });
        }
        ln(L, [top4[0], top4[1]], 0.55 * k);
        occ.add(top4);
      }
    }
    const shp = [pt(s0, f + 0.15 * sg, g(s0)), pt(s1, f + 0.15 * sg, g(s1)), pt(s1, f + 0.15 * sg, shop - 1.3), pt(s0, f + 0.15 * sg, shop - 1.3)];
    if (k > 0.5) P.hatch(L, shp, { vp: vpOf(s0), s: 4.6, w: 0.42, occl: O() });
    ln(L, [shp[0], shp[3], shp[2], shp[1]], 0.85 * k);
    occ.add(shp);
  }

  /* the simit cart on the far pavement */
  function cart(s0, s1) {
    const l0 = FAR + 0.45, l1 = l0 + 0.65, gb = g(s1);
    const hb = gb + 0.5, ht = gb + 0.95, hg = gb + 1.4;
    for (const ws of [s0 + 0.22, s1 - 0.22]) {
      const c = pt(ws, l1 + 0.05, gb + 0.27);
      const rr = Math.abs(pt(ws, l1, gb + 0.54)[1] - pt(ws, l1, gb)[1]) / 2;
      const ring = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; ring.push([c[0] + Math.cos(a) * rr * 0.8, c[1] + Math.sin(a) * rr]); }
      ln(L, ring, 0.85, { taper: 0 });
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; ln(L, [[c[0] - Math.cos(a) * rr * 0.72, c[1] - Math.sin(a) * rr * 0.9], [c[0] + Math.cos(a) * rr * 0.72, c[1] + Math.sin(a) * rr * 0.9]], 0.4, { taper: 'lens' }); }
      occ.add(ring);
    }
    /* the glass case, simit stacked on three pegs: each a ring with its hole */
    const g0 = pt(s0, l1, ht), g1 = pt(s1, l1, ht), g2 = pt(s1, l1, hg), g3 = pt(s0, l1, hg), g4 = pt(s1, l0, hg), g5 = pt(s0, l0, hg), g6 = pt(s1, l0, ht);
    for (let i = 0; i < 3; i++) for (let q = 0; q < 3; q++) {
      const sc = lerp(s0 + 0.16, s1 - 0.16, (i + 0.5) / 3), h2 = ht + 0.08 + q * 0.11;
      const c = pt(sc, (l0 + l1) / 2, h2);
      const rx = Math.abs(pt(sc + 0.12, l1, h2)[0] - pt(sc, l1, h2)[0]) + 1.5, ry = rx * 0.34;
      const el = []; for (let j = 0; j <= 28; j++) { const a = (j / 28) * Math.PI * 2; el.push([c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry]); }
      ln(L, el, 0.55, { taper: 0 });
      ln(L, spline([[c[0] - rx * 0.4, c[1] + 0.2], [c[0], c[1] - ry * 0.25], [c[0] + rx * 0.4, c[1] + 0.2]], 1), 0.4, { taper: 'lens' });
      P.hatch(L, el.slice(14), { angle: 70, s: 2.6, w: 0.38, occl: O() });
    }
    ln(L, [g0, g3, g2, g1], 0.6, { taper: 0 }); ln(L, [g3, g5, g4, g2], 0.55, { taper: 0 }); ln(L, [g4, g6, g1], 0.5, { taper: 0 });
    occ.add([g0, g1, g6, g4, g5, g3]);
    const front = [pt(s0, l1, hb), pt(s1, l1, hb), pt(s1, l1, ht), pt(s0, l1, ht)];
    const end = [pt(s1, l1, hb), pt(s1, l0, hb), pt(s1, l0, ht), pt(s1, l1, ht)];
    face(L, front, { tone: 0, ew: [1.0, 0.8, 0.9, 0.8] });
    ln(L, [mix(front[0], front[3], 0.5), mix(front[1], front[2], 0.5)], 0.45);
    face(L, end, { tone: 2, hatch: { angle: 90, s: 2.8, w: 0.42 }, ew: [0.8, 0.6, 0.5, 1.1] });
    ln(L, [pt(s0, l1 - 0.08, ht - 0.05), pt(s0 - 0.5, l1 - 0.08, ht + 0.06)], 0.85);
    ln(L, [pt(s0, l0 + 0.08, ht - 0.05), pt(s0 - 0.5, l0 + 0.08, ht + 0.06)], 0.55);
    P.hatch(L, [pt(s0, l1, gb), pt(s1, l1, gb), pt(s1 + 0.45, l1 + 0.25, gb), pt(s0 + 0.45, l1 + 0.25, gb)], { vp: vp0, s: 3, w: 0.4, occl: O() });
  }

  /* ---------- draw, nearest first ---------- */
  if (cfg.cart) cart(...cfg.cart);
  for (const b of cfg.far.filter((x) => x.s0 < BEND)) building(b);
  for (const b of cfg.near) building({ ...b, f: NEAR });
  for (const b of cfg.far.filter((x) => x.s0 >= BEND)) building(b);
  /* the corner at the turn: a chamfered house that closes the first stretch */
  {
    const a = pt(BEND - 0.05, FAR, g(BEND)), c = st.P(BEND + 0.65, FAR, g(BEND), st.runs[1]);
    void c;
  }

  if (along) steps(); else streetPast();
  function steps() {
    /* the stair street: each step a nosing and the shadow under it, thinning out as they climb */
    let lastY = 1e9;
    for (let s = cfg.sFold; s < 40; s += cfg.tread) {
      const y = pt(s, 0, g(s + 0.01))[1];
      if (lastY - y < 4) continue;
      lastY = y;
      const k = smooth(36, 8, s);
      ln(L, [pt(s, KF, g(s + 0.01)), pt(s, KN, g(s + 0.01))], 0.9 * k + 0.3, { taper: 'lens' });
      if (s < 14) P.hatch(L, [pt(s, KF, g(s + 0.01)), pt(s, KN, g(s + 0.01)), pt(s, KN, g(s - 0.01)), pt(s, KF, g(s - 0.01))], { angle: 0, s: 3, w: 0.42, occl: O() });
    }
    for (const l of [KF, KN]) ln(L, Array.from({ length: 60 }, (_, i) => pt(cfg.sFold + i * 0.6, l, g(cfg.sFold + i * 0.6) + 0.02)), 0.8, { taper: 60 });
  }
  function streetPast() {
  /* the street past the turn: kerbs, cobble courses that thin out with distance */
  for (const l of [KF, KN]) {
    const kerb = [], face2 = [];
    for (let s = BEND + 0.6; s <= 58; s += 0.8) { kerb.push(pt(s, l, g(s) + 0.14)); face2.push(pt(s, l, g(s))); }
    ln(L, kerb, 0.85, { taper: 60 }); ln(L, face2, 0.5, { taper: 60 });
  }
  let lastY = -1e9;
  for (let s = BEND + 1.0; s < 50; s += 0.38 + (s - BEND) * 0.05) {
    const yy = pt(s, 0, g(s))[1];
    if (Math.abs(yy - lastY) < 4.5) continue;
    lastY = yy;
    ln(L, [pt(s, KF, g(s)), pt(s, KN, g(s))], 0.42, { taper: 'lens', wf: () => smooth(50, 16, s) });
    if (s < 26) for (let i = 0; i < 9; i++) {
      if (r() < 0.6) continue;
      const l = lerp(KF, KN, (i + (Math.round(s * 2.6) % 2) * 0.5) / 9);
      ln(L, [pt(s, l, g(s)), pt(s + 0.3, l, g(s + 0.3))], 0.38, { taper: 'lens' });
    }
  }
  /* the far pavement's slab joints, before the fold */
  for (let s = -9; s < BEND; s += 1.15) ln(L, [pt(s, FAR + 0.3, g(s)), pt(s, KF - 0.02, g(s))], 0.42, { taper: 'lens' });
  /* the far kerb's top edge, a hair above the fold */
  const kx = pt(BEND, KF, g(BEND))[0];
  ln(L, foldPts.filter((p) => p[0] < kx).map((p) => [p[0], p[1] - 4]), 0.7, { taper: 80 });
  }

  /* ================= BACK: the sea at the end of the street, the far shore ================= */
  const back = 'back';
  if (along || cfg.back === 'minaret') minaret(); else if (cfg.back !== 'none') sea();
  function minaret() {
    /* at the top of the stair, over the roofs: a minaret drawn as a turned shaft (contour hatching on its
       shadow side), its balcony on a ring of corbels, the upper shaft and the cone with its finial */
    const [sM, lM] = cfg.minaret ?? [44, -0.5], base = g(sM) + 6, H2 = 30;
    const P0 = pt(sM, lM, base), P1 = pt(sM, lM, base + H2);
    const rad = Math.abs(pt(sM + 0, lM + 1.2, base)[0] - P0[0]);
    const x = P0[0], y0 = P0[1], y1 = P1[1], hh = y0 - y1;
    const at = (t) => y0 - hh * t;
    const shaft = (t0, t1, r0, r1) => {
      P.line(back, [[x - r0, at(t0)], [x - r1, at(t1)]], 0.6, { taper: 0, occl: O() });
      P.line(back, [[x + r0, at(t0)], [x + r1, at(t1)]], 0.8, { taper: 0, occl: O() });
      for (let i = 1; i <= 3; i++) { const f = i / 4; P.line(back, [[x + r0 * (0.3 + f * 0.6), at(t0)], [x + r1 * (0.3 + f * 0.6), at(t1)]], 0.4, { taper: 'lens', occl: O() }); }
    };
    shaft(0, 0.62, rad, rad * 0.9);
    /* the balcony: a ring, its corbels, its parapet */
    const by = at(0.62), br = rad * 1.6;
    const ring = (yy, rr) => Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI; return [x + Math.cos(a) * rr, yy + Math.sin(a) * rr * 0.22]; });
    P.line(back, ring(by, br), 0.6, { taper: 0, occl: O() });
    P.line(back, ring(by - 3, br), 0.45, { taper: 0, occl: O() });
    for (let i = 0; i < 5; i++) { const xx = x - br * 0.8 + (i / 4) * br * 1.6; P.line(back, [[xx, by + 1], [xx * 0.5 + x * 0.5, by + 6]], 0.4, { taper: 'lens', occl: O() }); }
    shaft(0.66, 0.84, rad * 0.8, rad * 0.75);
    /* the cone and its finial */
    P.line(back, [[x - rad * 0.95, at(0.84)], [x, at(1)]], 0.55, { taper: 0, occl: O() });
    P.line(back, [[x + rad * 0.95, at(0.84)], [x, at(1)]], 0.75, { taper: 0, occl: O() });
    P.hatch(back, [[x, at(1)], [x + rad * 0.95, at(0.84)], [x + rad * 0.2, at(0.84)]], { angle: 80, s: 2.6, w: 0.38, occl: O() });
    P.line(back, [[x, at(1)], [x, at(1) - 6]], 0.5, { taper: 0, occl: O() });
  }
  function sea() {
  P.line(back, [[0, HY], [1600, HY]], 0.6, { taper: 300, occl: O() });
  for (let k2 = 1; k2 < 11; k2++) {
    const y = HY + k2 * k2 * 0.5 + 1.5;
    for (let x = r() * 30; x < 1600; x += 20 + r() * 40 + k2 * 3) {
      const Lx = 8 + r() * 26;
      if (Math.abs(x - 1250) < 36 && r() < 0.65) continue;
      P.line(back, [[x, y], [x + Lx, y]], 0.42, { taper: 'lens', occl: O() });
    }
  }
  const shore = spline([[1150, HY - 2], [1230, HY - 4], [1300, HY - 6], [1370, HY - 7], [1450, HY - 5], [1540, HY - 3]], 6);
  P.line(back, shore, 0.48, { taper: 60, occl: O() });
  {
    const dx = 1356, base = HY - 7;
    const dome = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; dome.push([dx + Math.cos(a) * 8, base - 4 + Math.sin(a) * 5.5]); }
    P.line(back, dome, 0.48, { taper: 0, occl: O() });
    P.line(back, [[dx - 8, base - 4], [dx - 9, base], [dx + 9, base], [dx + 8, base - 4]], 0.42, { taper: 0, occl: O() });
    for (const mx of [dx - 15, dx + 16]) {
      P.line(back, [[mx - 0.8, base], [mx - 0.5, base - 17], [mx, base - 22], [mx + 0.5, base - 17], [mx + 0.8, base]], 0.4, { taper: 0, occl: O() });
      P.line(back, [[mx - 1.5, base - 12], [mx + 1.5, base - 12]], 0.4, { taper: 0, occl: O() });
    }
  }
  }

  /* ================= THE PLAN: below the fold, the quarter as an insurance-map sheet ================= */
  const places = [];
  /* the plan lies only below the fold: everything above it hides plan lines */
  occ.list.length = 0;
  occ.add([...foldPts, [P.w + 200, -400], [-200, -400]]);
  {
    ln(L, foldPts, 1.35, { taper: 80, occl: [] });
    const kpx = cfg.planK ?? 5.6;
    const i0 = foldPts.findIndex((p) => p[0] > -40);
    const a0 = foldPts[i0], a1 = foldPts[Math.min(foldPts.length - 1, i0 + 14)];
    const rot = cfg.planRot ?? Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    const c = Math.cos(rot), s = Math.sin(rot);
    const M = (x, y) => [a0[0] + (x * c - y * s) * kpx, a0[1] + (x * s + y * c) * kpx];
    /* the near half of our street and its pavement, then the block we stand in, a lane, the next block */
    const y0 = 5.0;
    const lanes = cfg.lanes ?? [[44, 3.6], [112, 4.2], [176, 3.4], [232, 4]];
    const rows = [[y0, y0 + 24], [y0 + 28.5, y0 + 56]];
    const types = ['m', 't', 'm', 'm', 'y', 't', 'm', 't', 'm', 'y', 'm', 't'];
    let ti = 3;
    for (const [ry0, ry1] of rows) {
      let x0 = -6;
      for (const [lx, lw] of [...lanes, [300, 0]]) {
        const bx0 = x0, bx1 = lx;
        x0 = lx + lw;
        const ring = [M(bx0, ry0), M(bx1, ry0), M(bx1, ry1), M(bx0, ry1)];
        ln(L, [...ring, ring[0]], 0.7, { taper: 0 });
        let px = bx0;
        while (px < bx1 - 2.5) {
          const pw = Math.min(bx1 - px, 5.5 + r() * 5);
          const dep = (ry1 - ry0) * (0.5 + r() * 0.18);
          const t = types[ti++ % types.length];
          const pr = [M(px, ry0), M(px + pw, ry0), M(px + pw, ry0 + dep), M(px, ry0 + dep)];
          ln(L, [pr[1], pr[2], pr[3]], 0.42, { taper: 0 });
          /* masonry cross-hatched, timber single-hatched, a yard left open with a tree's dots */
          const far2 = ry0 > y0 ? 0.0 : 1;
          if (t === 'm') { P.hatch(L, pr, { angle: 45 + rot / D, s: 4.4, w: 0.38, drop: () => far2, occl: O() }); if (ti % 3 === 0) P.hatch(L, pr, { angle: -45 + rot / D, s: 5.2, w: 0.36, drop: () => far2, occl: O() }); }
          else if (t === 't') P.hatch(L, pr, { angle: -45 + rot / D, s: 5.4, w: 0.36, drop: () => far2, occl: O() });
          else if (far2) P.stipple(L, pr, 10, { size: 0.5, minD: 3, occl: O() });
          /* a light well in the bigger masonry houses */
          if (t === 'm' && pw > 8) { const lw2 = [M(px + pw * 0.4, ry0 + dep * 0.4), M(px + pw * 0.6, ry0 + dep * 0.4), M(px + pw * 0.6, ry0 + dep * 0.6), M(px + pw * 0.4, ry0 + dep * 0.6)]; P.line(L, [...lw2, lw2[0]], 0.5, { taper: 0 }); }
          if (!places.length && ry0 === y0 && px > (cfg.markAt ?? [16, 34])[0] && px < (cfg.markAt ?? [16, 34])[1]) places.push(M(px + pw / 2, ry0 + dep * 0.5));
          const yard = [M(px, ry0 + dep), M(px + pw, ry0 + dep), M(px + pw, ry1), M(px, ry1)];
          P.stipple(L, yard, 3, { size: 0.45, minD: 4, occl: O() });
          px += pw;
        }
      }
    }
    /* the near kerb of our street in the plan, and our own place on the pavement: a small open circle */
    ln(L, [M(-6, y0 - 1.4), M(300, y0 - 1.4)], 0.7, { taper: 100 });
  }

  const lok = cfg.far.find((b) => b.kind === 'lokanta');
  const thr = pt(lerp(lok.door[0], lok.door[1], 0.5), FAR + 0.6, g(lok.door[0]));
  const fd = cfg.farDoorNear ? pt(cfg.farDoor, NEAR - 0.6, g(cfg.farDoor)) : pt(cfg.farDoor, FAR + 0.6, g(cfg.farDoor));
  return { places: [places[0], thr, fd].map((p) => [Math.round(p[0]), Math.round(p[1])]) };
}

const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
