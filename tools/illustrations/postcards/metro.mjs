// Postcard 02: the metro station as a cutaway (round-six engraving guide, brief 2.4; review row S23).
// The back shows what the photograph cannot. The photograph (the stamp on the same back) shows the
// platform; the plate cuts the station open from the street to the track, after the section plates of
// Diderot and d'Alembert's Encyclopédie. One section plane, and behind it everything in one oblique
// projection (depth recedes up and to the right, as in those plates), so every receding edge is
// parallel and every level reads at one scale: 1 m is 30 units.
//
// From the top: the street (the stair head with its balustrade, a lamp, two passers-by), the roof
// slab, the ticket hall with three gates and the stair cut through the slab, then the platform hall
// with the train standing, its doors open, and two people walking away along the platform; the near
// one carries the red bag of the photograph, the plate's one colour. Earth is cut in section hatching
// that frays away from the walls; concrete is ruled along its member.
//
// A white-line plate: the back's ink is light on a dark ground, so a line is light, and tone is drawn
// where the light is (the lit car's windows and open doors, the ticket windows, the lantern, the lit
// floor and roof), never in the shade. Faces turned from the light (the left walls, the train's side)
// stay the ground; the people are dark against the lit car, drawn by a rim of light on the side toward
// the light (upper left) and a few lines that turn their form there.
import { rng, curve, dense, seg, taper, outline, hatch, flow, dots, runs, within, cutout, Layer, plate } from './burin.mjs';

export const photo = 'metro-platform';
export const W = 420, H = 520;

const DX = 0.4, DY = -0.25; // the oblique: one unit of depth moves a point this far on the plate
const P = (x, y, z = 0) => [x + z * DX, y + z * DY];
const circ = (c, rx, ry = rx, k = 12) => Array.from({ length: k }, (_, i) => { const a = (i / k) * Math.PI * 2; return [c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * ry]; });

export function draw() {
  const r = rng(31);
  const K = new Layer(), M = new Layer(), T = new Layer(), RK = new Layer(), RT = new Layer();

  /* a straight line, tapered, clipped to `clip` rings (inside the first, outside the rest) */
  const ln = (L, a, b, w, clip = null, o = {}) => {
    const pts = seg(a, b, Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3)));
    for (const run of clip ? runs(pts, clip) : [pts]) {
      const len = Math.hypot(run[run.length - 1][0] - run[0][0], run[run.length - 1][1] - run[0][1]);
      L.add(taper(run, w, { step: Math.max(3, len / 4), ...o }));
    }
  };
  const cv = (L, pts, w, clip = null, o = {}) => {
    const d = curve(pts, 8);
    for (const run of clip ? runs(d, clip) : [d]) L.add(taper(run, w, o));
  };
  const box4 = (a, b, c, d) => [a, b, c, d];

  /* ---- levels (y at the section plane) and walls (x) ---- */
  const ST = 118, HC = 132, HF = 214, PC = 226, PL = 400, TR = 432, BOT = 446;
  const XO = 46, XL = 58, XR = 362, XRO = 374, EDGE = 176;
  const ZH = 110, ZP = 220; // depth of the hall and of the platform hall

  const hall = box4([XL, HC], [XR, HC], [XR, HF], [XL, HF]);
  const ph = [[XL, PC], [XR, PC], [XR, PL], [EDGE, PL], [EDGE, TR], [XL, TR]];
  /* the stair from the street down to the hall: 12 steps, from x 344 at the street to x 224 at the floor */
  const n = 12, sx0 = 344, sx1 = 224, rise = (HF - ST) / n, run = (sx0 - sx1) / n;
  const steps = [];
  for (let i = 0; i <= n; i++) { steps.push([sx0 - i * run, ST + i * rise]); if (i < n) steps.push([sx0 - i * run, ST + (i + 1) * rise]); }
  const soffit = [[sx1 + 16, HF], [sx0 + 6, ST + 16]];
  const stairCut = [...steps, soffit[0], soffit[1]];
  const WELL = 250; // the slab is open above the stair from here to the stair head (2 m of headroom)

  /* ---- the section: concrete ruled along each member, the cut edges as contours ---- */
  const rule = (a, b, c, d, k) => { // k lines between edge a-b and edge d-c
    for (let i = 1; i <= k; i++) { const t = i / (k + 1); ln(M, [a[0] + (d[0] - a[0]) * t, a[1] + (d[1] - a[1]) * t], [b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t], 0.6, null, { e: 0.15 }); }
  };
  rule([XO, ST], [WELL, ST], [WELL, HC], [XO, HC], 2); rule([sx0, ST], [XRO, ST], [XRO, HC], [sx0, HC], 2);
  rule([XO, HF], [XRO, HF], [XRO, PC], [XO, PC], 2);
  rule([XO, TR], [XRO, TR], [XRO, BOT], [XO, BOT], 2);
  rule([XO, HC], [XO, TR], [XL, TR], [XL, HC], 2); rule([XRO, HC], [XRO, PL], [XR, PL], [XR, HC], 2);
  rule([EDGE, PL + 4], [XR, PL + 4], [XR, TR], [EDGE, TR], 4);
  /* the cut edges: heavier on the shaded side of each member */
  const cut = (pts, w0 = 0.6, w1 = 1.5) => K.add(outline(dense(pts, 14), w0, w1, 0));
  cut([[XO, ST], [WELL, ST], [WELL, HC], [XL, HC], [XL, TR], [EDGE, TR], [EDGE, PL], [XR, PL], [XR, HC], [sx0 + 2, HC], [sx0 + 2, ST], [XRO, ST], [XRO, BOT], [XO, BOT]]);
  cut([[XL, HF], [XR, HF], [XR, PC], [XL, PC]], 0.6, 1.3);
  /* the stair: its nosings as one stepped line and its soffit; the stair's own cut ruled */
  K.add(taper(steps, 1.3, { e: 0.5, lit: 0.2, step: 2 }));
  ln(K, soffit[0], soffit[1], 1.1);
  T.add(hatch([stairCut], { angle: 45, gap: 5, w: 0.7, inset: 0.4 }));
  /* the street's surface: the one line that leaves the box on both sides */
  ln(K, [4, ST], [XO, ST], 1.1); ln(K, [XRO, ST], [416, ST], 1.1);

  /* the earth: section hatching that hugs the walls and frays away from them */
  const off = 28;
  const earthOut = [[XO - off, ST], [XRO + off, ST], [XRO + off, BOT + off], [XO - off, BOT + off]];
  const boxO = [[XO, ST], [XRO, ST], [XRO, BOT], [XO, BOT]];
  const dist = ([x, y]) => Math.max(XO - x, x - XRO, y - BOT, 0);
  T.add(hatch([earthOut, boxO], { angle: 45, gap: 8.5, w: 1.1, r, jit: 5, keep: (m) => r() < 1.1 - dist(m) / off, wf: (m) => 1 - (0.6 * dist(m)) / off }));
  for (let i = 0; i < 5; i++) {
    const side = i % 3;
    const c = side === 0 ? [XO - 8 - r() * 20, ST + 40 + r() * 300] : side === 1 ? [XRO + 8 + r() * 20, ST + 40 + r() * 300] : [XO + 40 + r() * 240, BOT + 8 + r() * 18];
    const st = circ(c, 3 + r() * 3, 2 + r() * 2, 9).map(([x, y]) => [x + r.pm(0.8), y + r.pm(0.8)]);
    M.add(outline(curve(st, 3, true), 0.35, 1));
  }

  /* ---- the street, behind the section ---- */
  const above = [[[0, 0], [420, 0], [420, ST], [0, ST]]];
  ln(M, P(4, ST, 70), P(420, ST, 70), 0.8, above); ln(M, P(4, ST, 73), P(420, ST, 73), 0.45, above);
  ln(M, P(-60, ST, 190), P(420, ST, 190), 0.55, above);
  /* the stair head: a balustrade on its far side (z 48) and its left end (x WELL), posts and a rail */
  const BZ = 48, BH = 30;
  ln(M, P(WELL, ST, 2), P(WELL, ST, BZ), 0.7); ln(M, P(WELL, ST, BZ), P(sx0, ST, BZ), 0.7);
  ln(K, P(WELL, ST - BH, 2), P(WELL, ST - BH, BZ), 1.1); ln(K, P(WELL, ST - BH, BZ), P(sx0 + 4, ST - BH, BZ), 1.2);
  for (let x = WELL + 8; x <= sx0; x += 8.5) ln(M, P(x, ST, BZ), P(x, ST - BH, BZ), 0.6, null, { e: 0.7 });
  for (let z = 2; z < BZ; z += 9.5) ln(M, P(WELL, ST, z), P(WELL, ST - BH, z), 0.7, null, { e: 0.7 });
  /* the treads seen through the well, receding */
  for (let i = 0; i < n; i++) { const x = sx0 - i * run, y = ST + (i + 1) * rise; if (x > WELL - 4) ln(M, P(x, y, 0), P(x, y, BZ), 0.5); }
  /* a lamp: base, a tapering shaft, a bracket and a lantern whose glass is in tone */
  const lb = P(388, ST, 30), lt = [lb[0], lb[1] - 92];
  K.add(outline(dense([[lb[0] - 3.2, lb[1]], [lb[0] - 1.4, lb[1] - 14], [lb[0] - 1, lt[1] + 8], [lb[0] + 1, lt[1] + 8], [lb[0] + 1.4, lb[1] - 14], [lb[0] + 3.2, lb[1]]], 3), 0.4, 1.2));
  const lan = [[lt[0] - 7, lt[1] - 12], [lt[0] + 7, lt[1] - 12], [lt[0] + 4.5, lt[1] + 6], [lt[0] - 4.5, lt[1] + 6]];
  K.add(outline(dense(lan, 2), 0.5, 1.3));
  ln(K, [lt[0] - 9, lt[1] - 13], [lt[0] + 9, lt[1] - 13], 1.3); cv(K, [[lt[0] - 6, lt[1] - 14], [lt[0], lt[1] - 20], [lt[0] + 6, lt[1] - 14]], 0.9);
  T.add(hatch([lan], { angle: 90, gap: 1.9, w: 0.75, inset: 0.8 }));
  /* passers-by: massed, each a coat with a lit and a shaded side */
  const passer = (x, z, h, step) => {
    const [bx, by] = P(x, ST, z), s = h / 52;
    const X = (u) => bx + u * s, Y = (v) => by - v * s;
    const coat = [[X(-6.5), Y(44)], [X(-9), Y(40)], [X(-9.5), Y(28)], [X(-9), Y(17)], [X(9), Y(17)], [X(9.5), Y(28)], [X(9), Y(40)], [X(6.5), Y(44)], [X(2.5), Y(45.6)], [X(-2.5), Y(45.6)]];
    const legs = [[X(-6.5), Y(17.2)], [X(-7.5 - step), Y(0.6)], [X(-3.5 - step), Y(0)], [X(0), Y(13)], [X(3.5 + step), Y(0)], [X(7 + step), Y(0.6)], [X(6), Y(17.2)]];
    K.add(outline(curve(coat, 3, true), 1.3, 0.4));
    K.add(outline(dense(legs, 3), 1, 0.3));
    K.add(outline(circ([X(0), Y(49)], 3.8 * s, 4.4 * s, 10), 1.1, 0.4));
    T.add(hatch([coat], { angle: 72, gap: 3.4, w: 0.7, keep: ([u]) => u < X(-4) }));
  };
  passer(132, 22, 50, 1.6);
  passer(176, 46, 48, -1);

  /* ---- the ticket hall ---- */
  const hb = box4(P(XL, HC, ZH), P(XR, HC, ZH), P(XR, HF, ZH), P(XL, HF, ZH)); // its back wall
  const hallClip = [hall, stairCut];
  ln(M, hb[0], hb[3], 0.8, hallClip); ln(M, hb[3], hb[2], 0.9, hallClip);
  ln(M, [XL, HF], hb[3], 0.9, hallClip); ln(M, [XL, HC], hb[0], 0.8, hallClip);
  /* three ticket windows in the back wall, each with its reveal in shade */
  const wins = [];
  for (const x of [150, 196, 242]) {
    const wq = box4(P(x, HC + 22, ZH), P(x + 28, HC + 22, ZH), P(x + 28, HC + 46, ZH), P(x, HC + 46, ZH));
    wins.push(wq);
    K.add(outline(dense(wq, 3), 0.5, 1.2));
    T.add(hatch([wq], { angle: 0, gap: 2.4, w: 1.1, inset: 1.2 }));
    ln(M, P(x - 3, HC + 49, ZH), P(x + 31, HC + 49, ZH), 0.8);
  }
  /* the back wall's tile courses, light */
  T.add(hatch([box4([hb[0][0], HC], [XR, HC], [XR, hb[3][1]], [hb[0][0], hb[3][1]]), ...wins], { angle: 0, gap: 9, w: 0.42, clip: [hall, stairCut] }));
  /* the left wall faces away from the light: it stays dark, the ground of the plate */
  /* the floor's joints, receding */
  for (let x = XL + 50; x < XR; x += 50) ln(M, [x, HF], P(x, HF, ZH), 0.42, hallClip);
  /* three gates across the hall: small cabinets with a lit top, a shaded side and one arm each */
  for (const gx of [116, 160, 204]) {
    const z0 = 52, z1 = 74, h = 26, w = 9;
    const F = box4(P(gx, HF, z0), P(gx + w, HF, z0), P(gx + w, HF - h, z0), P(gx, HF - h, z0));
    const S = box4(P(gx + w, HF, z0), P(gx + w, HF, z1), P(gx + w, HF - h, z1), P(gx + w, HF - h, z0));
    K.add(outline(dense([F[0], F[1], S[1], S[2], P(gx, HF - h, z1), F[3]], 3), 0.45, 1.2));
    ln(M, F[2], F[1], 0.6); ln(M, F[2], S[2], 0.5);
    T.add(hatch([box4(F[3], F[2], S[2], P(gx, HF - h, z1))], { angle: 32, gap: 2.4, w: 0.6, inset: 0.4 }));
    ln(K, P(gx + w, HF - h + 8, (z0 + z1) / 2), P(gx + w + 20, HF - h + 8, (z0 + z1) / 2), 1);
  }

  /* ---- the platform hall ---- */
  /* the figures first: everything behind them is cut out of their shapes */
  const person = (x, z, h, kind) => {
    const [bx, by] = P(x, PL, z), s = h / 52;
    const X = (u) => bx + u * s, Y = (v) => by - v * s;
    if (kind === 'man') {
      /* from behind, stepping off: a short padded jacket, trousers, a balding crown */
      return { bx, by, s, X, Y,
        jacket: [[X(-8.4), Y(45.4)], [X(-11), Y(41)], [X(-11.8), Y(30)], [X(-11.4), Y(21)], [X(11.2), Y(21)], [X(12), Y(30)], [X(11.2), Y(41)], [X(8.4), Y(45.4)], [X(3.2), Y(47.2)], [X(-3.2), Y(47.2)]],
        legs: [[X(-9), Y(21.2)], [X(-10.4), Y(9.6)], [X(-11.4), Y(0.8)], [X(-6.2), Y(0)], [X(-4.6), Y(9.6)], [X(-0.6), Y(17.6)], [X(2.2), Y(9.6)], [X(4.6), Y(2.2)], [X(9.4), Y(2.8)], [X(8.8), Y(11)], [X(9.2), Y(21.2)]],
        head: circ([X(0.4), Y(51.4)], 4.5 * s, 5.4 * s, 14) };
    }
    /* a woman in a knee-length coat, her hair to the shoulders, farther along */
    return { bx, by, s, X, Y, hair: true,
      jacket: [[X(-6), Y(43.6)], [X(-9.2), Y(41.6)], [X(-9.6), Y(34)], [X(-8.4), Y(28)], [X(-9.4), Y(19)], [X(-10.8), Y(11.6)], [X(10.6), Y(11.6)], [X(9.4), Y(19)], [X(8.4), Y(28)], [X(9.6), Y(34)], [X(9.2), Y(41.6)], [X(6), Y(43.6)], [X(2.4), Y(44.4)], [X(-2.4), Y(44.4)]],
      legs: [[X(-6.4), Y(11.8)], [X(-6.6), Y(0.6)], [X(-3.2), Y(0)], [X(-2.2), Y(10)], [X(2), Y(10)], [X(2.8), Y(1.4)], [X(6.4), Y(2)], [X(6.2), Y(11.8)]],
      head: [[X(-4.8), Y(49.6)], [X(-4.2), Y(54)], [X(-1.6), Y(56.4)], [X(1.8), Y(56.4)], [X(4.4), Y(54)], [X(5), Y(49.6)], [X(5.8), Y(44.6)], [X(3.4), Y(42.8)], [X(0), Y(43.4)], [X(-3.4), Y(42.8)], [X(-5.8), Y(44.6)]] };
  };
  const man = person(204, 24, 52, 'man');
  const woman = person(250, 112, 50, 'woman');
  const { X: mX, Y: mY } = man;
  /* the red bag: a duffel held at his right side, toward the train, the strap in his hand */
  const bag = [[mX(-22.6), mY(20.4)], [mX(-22.4), mY(8)], [mX(-20), mY(4.6)], [mX(-10), mY(4.6)], [mX(-8.4), mY(8)], [mX(-9), mY(20.4)], [mX(-11.8), mY(22.6)], [mX(-19.6), mY(22.6)]];
  const figs = [man.jacket, man.legs, man.head, bag, woman.jacket, woman.legs, woman.head];
  const phClip = [ph, ...figs];

  /* the train: its end at z 24, its side and roof receding into the portal */
  const CL = 92, CR = 172, ROOF = 325, BODY = 406, Z0 = 24;
  const E = (u, v) => P(CL + u, ROOF + v, Z0);
  const end = [E(0, 81), E(0, 14), E(8, 3), E(20, 0), E(60, 0), E(72, 3), E(80, 14), E(80, 81)];
  const S = (z, v) => P(CR, ROOF + v, z);
  const side = [S(Z0, 14), S(ZP, 14), S(ZP, 81), S(Z0, 81)];
  const roof = [E(8, 3), P(CL + 8, ROOF + 3, ZP), P(CR - 8, ROOF + 3, ZP), S(ZP, 14), S(Z0, 14), E(72, 3), E(60, 0), E(20, 0)];
  const train = [end, side, roof];
  const behind = [ph, ...figs, end, side, roof]; // what lies behind the train and the figures
  const pb = box4(P(XL, PC, ZP), P(XR, PC, ZP), P(XR, TR, ZP), P(XL, TR, ZP)); // its back wall
  /* the tunnel portal in the back wall over the track: wider than the car, its crown under the ceiling */
  const portalRing = [P(76, TR, ZP), ...curve([P(76, 330, ZP), P(90, 306, ZP), P(132, 292, ZP), P(174, 306, ZP), P(188, 330, ZP)], 4), P(188, TR, ZP)];
  const pbPl = P(EDGE, PL, ZP), pbTr = P(EDGE, TR, ZP);
  ln(M, pb[0], pb[3], 0.8, behind); ln(M, pb[3], pbTr, 0.8, behind); ln(M, pbTr, pbPl, 0.8, behind); ln(M, pbPl, P(XR, PL, ZP), 0.9, behind);
  ln(M, [XL, TR], pb[3], 0.9, behind); ln(M, [XL, PC], pb[0], 0.9, behind);
  /* the platform: its edge receding, the tactile strip as dots that shrink with depth, the joints */
  ln(K, [EDGE, PL], pbPl, 1.2, phClip);
  for (let z = 5; z < ZP; z += 8) { const p = P(EDGE + 10, PL, z); if (cutout(p, phClip)) T.add(dots([circ(p, 3, 3, 6)], 1, r, { size: 1.1 - (z / ZP) * 0.45 })); }
  ln(M, P(EDGE + 18, PL, 0), P(EDGE + 18, PL, ZP), 0.42, phClip);
  for (let x = EDGE + 62; x < XR; x += 62) ln(M, [x, PL], P(x, PL, ZP), 0.42, phClip);
  for (let z = 44; z < ZP; z += 44) ln(M, P(EDGE, PL, z), P(XR, PL, z), 0.4, phClip);
  /* the left wall in shade */
  /* the left wall faces away from the light: dark; only its tile joints show, in hairline */
  for (const v of [270, 320, 370]) ln(M, [XL, v], P(XL, v, ZP), 0.4, behind);
  /* the back wall: tile courses on the platform side; a portal over the track */
  const backVis = box4([pbPl[0], PC], [XR, PC], [XR, pbPl[1]], pbPl);
  T.add(hatch([backVis], { angle: 0, gap: 9, w: 0.42, clip: behind, keep: (m) => m[1] > 250 }));

  /* the portal: its arch, and the dark of the tunnel round the train */
  const portal = portalRing;
  const notTrain = [ph, end, side, roof];
  cv(M, portal.slice(1, -1), 1, [ph, ...train]);
  /* the train's edges: the side's lower edge is the darkest line in the plate (the focus's accent) */
  const tc = [ph, ...figs];
  ln(K, end[7], side[3], 1.6, tc); ln(K, side[3], side[2], 2.1, tc); ln(K, side[0], side[1], 1.1, tc);
  ln(K, roof[1], roof[0], 0.7, tc); ln(K, end[0], end[7], 1.4, tc);
  cv(K, end.slice(0, 7).concat([end[7]]), 1.2, tc);
  /* the end: a wide windscreen with one light across it, the destination box, two lamps, the stripes,
     the coupler; the end faces the viewer and is half lit */
  const scr = [E(9, 16), E(71, 16), E(71, 42), E(9, 42)];
  K.add(outline(dense(scr, 3), 0.6, 1.4));
  T.add(hatch([scr], { angle: 0, gap: 3, w: 0.9, inset: 1.2, keep: ([x, y]) => Math.abs((x - scr[0][0]) * 0.7 + (y - scr[0][1]) - 26) > 5 }));
  M.add(outline(dense([E(28, 6), E(52, 6), E(52, 12), E(28, 12)], 2), 0.4, 0.9));
  for (const u of [12, 68]) {
    const c = E(u, 63);
    M.add(outline(circ(c, 3.4, 3.4, 10), 0.45, 1.1));
    T.add(hatch([circ(c, 2.6, 2.6, 8)], { angle: 0, gap: 1.6, w: 0.7, inset: 0.2 }));
  }
  ln(M, E(1, 48), E(79, 48), 0.8); ln(M, E(1, 56), E(79, 56), 0.8);
  T.add(hatch([box4(E(1, 48), E(79, 48), E(79, 56), E(1, 56))], { angle: 0, gap: 2.7, w: 0.8, inset: 0.6 }));
  ln(K, E(36, 81), E(36, 92), 1.3); ln(K, E(44, 81), E(44, 92), 1.3); ln(M, E(33, 92), E(47, 92), 1.1);
  /* the bogie and wheels under the end; the rails and sleepers in front of it */
  for (const u of [12, 56]) M.add(outline(circ(E(u + 6, 93), 9, 9, 14), 0.5, 1.3));
  const under = box4(E(0, 81), E(80, 81), E(80, 107), E(0, 107));
  for (const x of [108, 156]) ln(M, P(x, TR - 6, 0), P(x, TR - 6, Z0), 1, [ph]);
  for (let z = 4; z < Z0; z += 9) ln(M, P(CL - 4, TR - 3, z), P(CR + 2, TR - 3, z), 0.6, [ph]);
  /* the roof: lit from the station's lamps, ruled along the depth; its right shoulder turns dark */
  const rtop = [E(8, 3), E(72, 3), P(CR - 8, ROOF + 3, ZP), P(CL + 8, ROOF + 3, ZP)];
  T.add(hatch([rtop], { angle: 32, gap: 3.6, w: 0.75, clip: tc, wf: ([x]) => Math.max(0.2, 1 - (x - CL) / 200) }));
  ln(M, E(72, 3), P(CR - 8, ROOF + 3, ZP), 0.6, tc); ln(M, E(60, 0), P(CR - 20, ROOF, ZP), 0.45, tc);
  /* the side, in shade: hatched along the depth; two stripes darker; doors open, windows dark */
  const doors = [[52, 86], [150, 184]].map(([a, b]) => box4(S(a, 18), S(b, 18), S(b, 75), S(a, 75)));
  const wins2 = [[94, 142], [192, ZP - 6], [Z0 + 6, 44]].map(([a, b]) => box4(S(a, 18), S(b, 18), S(b, 46), S(a, 46)));
  const holes = [...doors, ...wins2];
  const inPh = (m) => within(m, [ph]);
  const band = (v0, v1) => box4(S(Z0, v0), S(ZP, v0), S(ZP, v1), S(Z0, v1));
  T.add(hatch([band(57, 66), ...holes], { angle: 32, gap: 2.6, w: 0.7, clip: tc }));
  for (const v of [50, 55, 57, 66]) ln(M, S(Z0, v), S(ZP, v), 0.5, [ph, ...holes, ...figs]);
  /* windows: frames heavier on their shaded edges, dark glass, one reflected light across each */
  for (const o of wins2) {
    for (const rr of runs(dense([...o, o[0]], 2, false), tc)) K.add(taper(rr, 1.1, { e: 0.5, step: 5 }));
    /* the car is lit inside: its windows glow, and the seated passengers are dark against them */
    const za = (o[0][0] - CR) / DX, zb = (o[1][0] - CR) / DX;
    const seated = [];
    for (let zc = za + 12; zc < zb - 6; zc += 22) seated.push([...circ([0, 0], 4.2, 5, 10).map(([a, b]) => S(zc + a, 29 + b)), S(zc + 4, 34), S(zc + 9, 38), S(zc + 10, 46), S(zc - 10, 46), S(zc - 9, 38), S(zc - 4, 34)]);
    T.add(hatch([o, ...seated], { angle: 32, gap: 2.5, w: 1.05, inset: 1.2, clip: tc }));
  }
  /* the doors: the dark of the car (three sets, the plate's deepest tone), a lit floor edge, a pole */
  for (const o of doors) {
    for (const rr of runs(dense([...o, o[0]], 2, false), tc)) K.add(taper(rr, 1.5, { e: 0.6, step: 5 }));
    const pole = (() => { const mz = (o[0][0] + o[1][0]) / 2, mt = (o[0][1] + o[1][1]) / 2, mb = (o[3][1] + o[2][1]) / 2; return box4([mz - 1.4, mt], [mz + 1.4, mt], [mz + 1.4, mb], [mz - 1.4, mb]); })();
    const dk = [o, pole];
    T.add(hatch(dk, { angle: 32, gap: 2.2, w: 1.15, inset: 1, clip: tc }));
    ln(M, [pole[1][0], pole[1][1]], [pole[2][0], pole[2][1]], 0.5, tc);
  }

  /* ---- the figures: contours, and tone that follows the body ---- */
  const body = (f, k) => {
    /* against the lit car they are dark masses: a rim of light on the side toward the light, the
       form turned by a few lines on that side only */
    K.add(outline(curve(f.jacket, 4, true), 1.8, 0.45));
    K.add(outline(dense(f.legs, 2), 1.3, 0.4));
    K.add(outline(curve(f.head, 4, true), 1.4, 0.4));
    const fam = [];
    for (let v = 22; v < 47; v += 3.4) fam.push(curve([[f.X(-13), f.Y(v + 1.6)], [f.X(0), f.Y(v - 1)], [f.X(13), f.Y(v + 1.6)]], 6));
    const lit = ([x]) => Math.max(0, Math.min(1, (f.X(4) - x) / (f.X(4) - f.X(-11))));
    T.add(flow(fam, [f.jacket], { w: 0.95 * k, wf: (m) => (lit(m) > 0.35 ? lit(m) : 0), min: 2 }));
    T.add(hatch([f.legs], { angle: 84, gap: 3.2, w: 0.7, inset: 0.3, keep: ([x]) => x < f.X(-5) }));
    const hf = [];
    if (f.hair) for (let u = -4.5; u < 6; u += 1.8) hf.push(curve([[f.X(u * 0.6), f.Y(57)], [f.X(u * 0.95), f.Y(50)], [f.X(u * 1.15), f.Y(43)]], 5));
    else for (let v = 0; v < 6; v++) hf.push(curve([[f.X(-6), f.Y(45 + v * 2.2)], [f.X(0.5), f.Y(44.2 + v * 2.2)], [f.X(7), f.Y(45.8 + v * 2.2)]], 5));
    T.add(flow(hf, [f.head], { w: 0.6, wf: ([x, y]) => (x < f.X(1) && y < f.Y(48) ? 1 : 0), min: 1.5 }));
    /* the cast shadow, thrown forward and right along the floor */
    const [x, y] = [f.bx, f.by];
    shadows.push(curve([[x - 8 * f.s, y - 0.6], [x + 10, y + 0.4], [x + 34 * f.s, y + 4], [x + 38 * f.s, y + 7], [x + 14, y + 6], [x - 6 * f.s, y + 2.4]], 3, true));
  };
  const shadows = [];
  body(man, 1);
  body(woman, 0.85);
  /* the platform floor: lit, ruled across; the cast shadows are where the ruling stops */
  const floor = [[EDGE, PL], [XR, PL], [XR, pbPl[1]], pbPl];
  T.add(hatch([floor, ...shadows], { angle: 0, gap: 4.6, w: 0.5, clip: phClip, wf: ([, y]) => 0.5 + (y - pbPl[1]) / 110 }));
  cv(M, [[mX(-5.4), mY(45)], [mX(0), mY(43)], [mX(5.4), mY(45)]], 0.8);
  cv(M, [[mX(0.2), mY(42.6)], [mX(0.7), mY(31)], [mX(0.2), mY(21.6)]], 0.55);
  /* the bag in red: contour, the strap to his hand, a seam, tone that turns with its body */
  RK.add(outline(curve(bag, 3, true), 1.7, 0.5));
  cv(RK, [[mX(-19.6), mY(22.2)], [mX(-17), mY(28.6)], [mX(-12.6), mY(29)], [mX(-11.6), mY(22.2)]], 1);
  ln(RK, [mX(-21), mY(18.4)], [mX(-9.6), mY(18.4)], 0.6);
  const bf = [];
  for (let u = -22.2; u < -8.6; u += 2.6) bf.push(curve([[mX(u + 0.8), mY(22.6)], [mX(u - 0.3), mY(13)], [mX(u + 0.8), mY(4)]], 5));
  RT.add(flow(bf, [bag], { w: 1, wf: ([x]) => Math.max(0, 1 - (x - mX(-22)) / (mX(-12) - mX(-22))), min: 2 }));

  return plate({
    w: W, h: H, id: 'pc-metro', title: 'A metro station in section',
    desc: 'An engraved cutaway of an Istanbul metro station, from the street to the track: a stair head and a lamp on the pavement, the ticket hall with three gates and the stair cut through the slab, and below it the platform hall with a train standing, its doors open, while two people walk away along the platform, one carrying a red bag.',
    layers: [
      { id: 'k', k: 'k', layer: K, reveal: 4 },
      { id: 'm', k: 'm', layer: M, wipe: true },
      { id: 'r', k: 'm', layer: RK, reveal: 4, fill: '#c4553f' },
      { id: 't', k: 't', layer: T, wipe: true },
      { id: 'q', k: 't', layer: RT, wipe: true, fill: '#c4553f' },
    ],
  });
}
