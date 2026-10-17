// Postcard 03: a kitten on the sea wall, the sun low over the Marmara (round-six engraving guide, brief
// 2.5; review row S23). A classical sea view with the kitten as its small living point, drawn as a
// white-line plate: the back's ink is light on a dark ground, so a line is light. Where the light is (the
// sun, its road, the glow along the horizon) the lines are dense and full; where it is not (the wall's
// face, the kitten against the sun) the ground stays and only a rim of light is drawn.
//
// The sun is a ruled disc in a glory of fine rays, never a circle; the sky is horizontal ruling that
// swells toward the sun and stops where two bands of cloud cross it; distant islands lie on the horizon
// in hairline (the owner is asked which shore, so their outline can be made exact). The sea is broken
// ruling that closes toward the horizon; the road is where the ruling runs thick and unbroken. The wall
// is concrete: its top catches the sky in sparse ruling, its face is dark. The kitten sits at a third of
// the width, a fifth of the plate high, a silhouette with a lit rim and a few strokes that follow its fur.
import { rng, curve, seg, taper, outline, hatch, flow, dots, runs, within, Layer, plate } from './burin.mjs';

export const photo = 'cat-sunset-silhouette';
export const W = 460, H = 330;

export function draw() {
  const r = rng(37);
  const K = new Layer(), M = new Layer(), T = new Layer();
  const HZ = 200; // the horizon
  const SUN = [262, 174], SR = 11;
  const BIG = [[-10, -10], [470, -10], [470, 340], [-10, 340]];
  const glow = ([x, y]) => Math.exp(-Math.hypot((x - SUN[0]) / 1.6, y - SUN[1]) / 70);
  const edge = ([x, y]) => Math.min(1, x / 70, (460 - x) / 70, y / 60);

  /* ---- the wall: its rear edge (toward the sea), its front edge, its dark face ---- */
  const rear = (x) => 262 - x * 0.058, front = (x) => 292 - x * 0.066;
  const top = [[-10, rear(-10)], [470, rear(470)], [470, front(470)], [-10, front(-10)]];
  const wall = [[-10, rear(-10)], [470, rear(470)], [470, 340], [-10, 340]];

  /* ---- the kitten: sitting, facing us, the sun behind it to the right ---- */
  const CX = 146, CB = (rear(146) + front(146)) / 2 + 2, CH = 66, s = CH / 70;
  const C = (u, v) => [CX + u * s, CB - v * s];
  const cat = curve([
    C(-17.6, 1), C(-19.4, 7), C(-19, 15), C(-16.4, 23), C(-12, 30), C(-10.2, 35.4), C(-13.6, 39.4), C(-16, 43.4), C(-15.6, 48.4), C(-13.6, 52.6), C(-12.8, 57.2),
    C(-11.6, 67), C(-6.8, 61), C(-3, 59.6), C(0, 59.4), C(3, 59.6), C(7, 61.2), C(11.8, 67.6), C(13.2, 57.6), C(14.2, 52.8), C(16.4, 48.6),
    C(16.8, 43.6), C(14.4, 39.4), C(10.8, 35.4), C(12.8, 30), C(17.4, 23.4), C(20, 15), C(20.2, 7), C(18.4, 1), C(12, -0.2), C(8.4, 0.2), C(7.4, 1.6), C(3.6, 1.2), C(2.4, -0.6), C(-1, -0.6), C(-2.6, 1.2), C(-6.6, 1.6), C(-7.6, 0.2), C(-11.4, -0.2),
  ], 6, true);
  const catHole = [BIG, cat];
  const hole = (rings) => [rings, cat];

  /* ---- the sky: ruling that swells toward the sun, stopped by two bands of cloud ---- */
  const clouds = [
    curve([[-10, 132], [80, 126], [190, 131], [300, 124], [470, 130], [470, 138], [300, 134], [180, 139], [70, 136], [-10, 141]], 4, true),
    curve([[40, 168], [140, 163], [215, 166], [214, 170], [130, 172], [44, 174]], 4, true),
  ];
  const disc = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [SUN[0] + Math.cos(a) * SR, SUN[1] + Math.sin(a) * SR]; });
  const sky = [[-10, 14], [470, 14], [470, HZ - 1.5], [-10, HZ - 1.5]];
  /* each ruled line is cut into lengths, and each length takes the width of its own light */
  for (let y = 16; y < HZ - 1; y += y > 150 ? 3.4 : 4.4) {
    for (let x = -10; x < 470;) {
      const len = 14 + r() * 30;
      const a = [x, y], b = [Math.min(470, x + len), y];
      const m = [(a[0] + b[0]) / 2, y];
      const lightAt = Math.min(1, glow(m) * 1.3 + Math.max(0, (y - 110) / 90) * 0.5);
      const w = 0.3 + 1.1 * lightAt;
      if (r() < (0.05 + lightAt * 1.2) * edge(m)) {
        for (const rr of runs(seg(a, b, Math.ceil(len / 3)), [sky, ...clouds, disc, ...[cat]])) {
          const L = Math.hypot(rr[rr.length - 1][0] - rr[0][0], rr[rr.length - 1][1] - rr[0][1]);
          if (L > 2.5) T.add(taper(rr, w, { e: 0.15, lit: 0, step: Math.max(3, L / 4) }));
        }
      }
      x += len + 1.5 + r() * 4 * (1 - lightAt);
    }
  }
  /* the clouds' edges: a stipple where the ruling stops, thicker on the side the sun lights */
  /* the sun: a ruled disc, the brightest ruling in the plate */
  T.add(hatch([disc], { angle: 0, gap: 1.5, w: 1.15, inset: 0.2 }));
  /* its glory: fine rays that reach out from the disc, longer and shorter in turn, stopped by the
     clouds and the horizon */
  for (let k = 0; k < 36; k++) {
    const a = Math.PI * 1.06 + (k / 35) * Math.PI * 0.88;
    const L0 = SR + 4, L1 = SR + (k % 2 ? 16 : 30) + r() * 12;
    const p = [SUN[0] + Math.cos(a) * L0, SUN[1] + Math.sin(a) * L0], q = [SUN[0] + Math.cos(a) * L1, SUN[1] + Math.sin(a) * L1];
    for (const rr of runs(seg(p, q, 20), [sky, ...clouds, cat])) T.add(taper(rr, k % 2 ? 0.4 : 0.55, { e: 0.05, lit: 0, pow: 0.3, step: 6 }));
  }

  /* ---- the horizon, islands in hairline, one ship ---- */
  const hzLine = (x0, x1) => { for (const rr of runs(seg([x0, HZ], [x1, HZ], 120), catHole)) M.add(taper(rr, 0.8, { lit: 0, step: 8 })); };
  hzLine(-6, 466);
  const island = (x0, x1, h, seed) => {
    const q = rng(seed);
    const pts = [[x0, HZ]];
    for (let i = 1; i < 8; i++) { const t = i / 8; pts.push([x0 + (x1 - x0) * t, HZ - h * Math.pow(Math.sin(Math.PI * t), 0.7) * (0.85 + q() * 0.3)]); }
    pts.push([x1, HZ]);
    const c = curve(pts, 4);
    for (const rr of runs(c, catHole)) M.add(taper(rr, 0.65, { e: 0.2, lit: 0, step: 3 }));
    /* the island's face toward the sun catches it: a few short ruled lines */
    T.add(hatch([c], { angle: 0, gap: 1.6, w: 0.5, inset: 0.6, keep: ([x]) => x > (x0 + x1) / 2 }));
  };
  island(22, 74, 5.5, 2); island(84, 112, 3.6, 3); island(384, 446, 4.6, 4);
  /* a ship far out, hull and superstructure, small and exact */
  const sx = 204;
  M.add(outline([[sx, HZ - 0.4], [sx + 13, HZ - 0.4], [sx + 14.5, HZ - 2.6], [sx + 9, HZ - 2.6], [sx + 8.6, HZ - 5], [sx + 5, HZ - 5], [sx + 4.6, HZ - 2.6], [sx - 1, HZ - 2.6]], 0.6, 0.6, 1.2));

  /* ---- the sea: broken ruling that closes toward the horizon, thick and whole along the road ---- */
  let gap = 2.6;
  for (let y = HZ + 2.2; y < 300; y += gap, gap = Math.min(5.2, gap * 1.075)) {
    const t = (y - HZ) / 100; // nearer
    const roadW = 6 + t * 48; // the road widens toward us
    for (let x = -10; x < 470;) {
      const dx = Math.abs(x - SUN[0]);
      const inRoad = Math.max(0, 1 - dx / roadW);
      const len = inRoad > 0 ? 6 + r() * 16 : 6 + r() * (18 + t * 20);
      const a = [x, y + r.pm(0.3)], b = [x + len, y + r.pm(0.3)];
      const light = Math.min(1, 0.95 * inRoad + 0.35 * glow([x, HZ]) * (1 - t * 0.6) + 0.05);
      if (r() < (0.12 + light * 1.1) * edge([x, 200])) {
        for (const rr of runs(seg(a, b, Math.ceil(len / 3)), [[[-10, HZ + 1], [470, HZ + 1], [470, 340], [-10, 340]], wall, cat])) {
          const L = Math.hypot(rr[rr.length - 1][0] - rr[0][0], rr[rr.length - 1][1] - rr[0][1]);
          if (L > 2) T.add(taper(rr, 0.3 + 1.2 * light, { e: 0.12, lit: 0, step: Math.max(3, L / 3) }));
        }
      }
      x += len + (inRoad > 0.4 ? 1.2 + r() * 2 : 3 + r() * (6 + t * 10));
    }
  }

  /* ---- the wall: the lit rear edge, the front edge, sparse ruling on its top, joints as dark gaps ---- */
  for (const rr of runs(seg([-10, rear(-10)], [470, rear(470)], 160), catHole)) K.add(taper(rr, 1.5, { e: 0.2, lit: 0, step: 10 }));
  for (const rr of runs(seg([-10, front(-10)], [470, front(470)], 160), catHole)) K.add(taper(rr, 0.9, { e: 0.2, lit: 0, step: 10 }));
  const joints = [70, 248, 372].map((x) => [[x - 2, rear(x - 2) - 0.5], [x + 1.4, rear(x + 1.4) - 0.5], [x - 4.6, front(x - 4.6) + 0.5], [x - 8, front(x - 8) + 0.5]]);
  /* the kitten's shadow falls toward us across the top: there the ruling stops */
  const shadow = curve([C(-18, -3), C(4, -8), C(30, -6), C(44, -18), C(20, -26), C(-14, -14)].map(([x, y]) => [x, y]), 4, true);
  for (let k = 0; k < 7; k++) {
    const f0 = (k + 0.6) / 7.4;
    const yA = (x) => rear(x) + (front(x) - rear(x)) * f0;
    for (let x = -10; x < 470;) {
      const len = 10 + r() * 34;
      const a = [x, yA(x)], b = [x + len, yA(x + len)];
      const light = Math.min(1, 0.2 + 0.9 * glow([x, HZ]) + (1 - f0) * 0.3);
      if (r() < 0.3 + light) for (const rr of runs(seg(a, b, Math.ceil(len / 3)), [top, cat, shadow, ...joints])) T.add(taper(rr, 0.3 + 0.75 * light, { e: 0.15, lit: 0, step: 6 }));
      x += len + 2 + r() * 8;
    }
  }
  /* a crack along the top, and a weed growing out of it right of the kitten, lit from behind */
  const crack = curve([[300, rear(300) + 9], [330, rear(330) + 12], [360, rear(360) + 11], [398, rear(398) + 15]], 4);
  M.add(taper(crack, 0.7, { lit: 0 }));
  const wb = [212, rear(212) + 5];
  for (const [dx, dy, bend] of [[-4.4, -9, -2.4], [-0.6, -14, -0.8], [2.6, -12, 1.8], [5.4, -7.4, 2.8]]) {
    const st = curve([wb, [wb[0] + dx * 0.5 + bend, wb[1] + dy * 0.55], [wb[0] + dx, wb[1] + dy]], 5);
    K.add(taper(st, 0.75, { lit: 0, e: 0.05, pow: 0.4 }));
  }

  /* ---- the kitten: a rim of light, heaviest toward the sun; fur tufts along the rim; a few strokes
     that follow the fur over the head and the chest; fine lit whiskers ---- */
  K.add(outline(cat, 1.9, 0.35, 2, [-0.9, 0.42]));
  /* tufts: short strokes leaving the rim outward along the cheeks, the chest and the flanks */
  const tufts = [[-14.8, 44, -1, -0.2], [-14.4, 41, -1, 0.3], [15.6, 44.6, 1, -0.2], [15.4, 41.6, 1, 0.3], [-16.6, 24, -1, 0.1], [17.6, 22, 1, 0.1], [18.8, 12, 1, 0], [-17.6, 12, -1, 0], [12.6, 36, 1, 0.5], [-12.4, 36.4, -1, 0.5]];
  for (const [u, v, d, up] of tufts) { const a = C(u, v), b = C(u + d * 2.6, v + up * 2.4 + 0.4); K.add(taper(curve([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.6], b], 3), d > 0 ? 0.9 : 0.5, { lit: 0, e: 0.15 })); }
  /* fur: arcs over the crown, short strokes down the chest, the line of the shoulder; brighter right */
  const fam = [];
  for (let v = 44; v < 58; v += 2.6) fam.push(curve([C(-14, v - 2), C(0, v + 1.2), C(14, v - 2)], 5));
  T.add(flow(fam, [cat], { w: 0.5, wf: ([x]) => Math.max(0, (x - (CX - 4)) / 20), min: 2 }));
  /* the front legs: the line between them and the line of the near leg's front, lit from the right */
  K.add(taper(curve([C(0.4, 27), C(0.2, 14), C(0.6, 1.6)], 4), 0.45, { lit: 0 }));
  M.add(taper(curve([C(7.2, 25), C(7.6, 13), C(7.6, 2)], 4), 0.5, { lit: 0 }));
  /* the shoulder's turn on the sun side: three short strokes */
  for (let k = 0; k < 3; k++) T.add(taper(curve([C(10 + k * 2, 30 - k * 3), C(13 + k * 1.6, 22 - k * 3), C(14.6 + k * 1.2, 12 - k * 2)], 4), 0.5, { lit: 0 }));
  /* the ears: a short ruling inside each, along the ear */
  for (const sgn of [-1, 1]) {
    const ear = [C(sgn * 11.4, 64), C(sgn * 7.4, 59.8), C(sgn * 12.2, 57)];
    for (let k = 0; k < 3; k++) T.add(taper(curve([C(sgn * (8.4 + k * 1.2), 59.4 - k * 0.6), C(sgn * (10.4 + k * 0.5), 62 - k * 0.8)], 2), 0.45, { lit: 0 }));
    void ear;
  }
  /* whiskers, lit from behind: three a side, fine and long */
  for (const sgn of [-1, 1]) for (let k = 0; k < 3; k++) {
    const a = C(sgn * 5, 46 - k * 1.2), b = C(sgn * (23 + k * 1.5), 48.5 - k * 3.6);
    T.add(taper(curve([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 1.2], b], 4), sgn > 0 ? 0.55 : 0.42, { lit: 0, e: 0.1 }));
  }

  void within; void hole;
  return plate({
    w: W, h: H, id: 'pc-cat', title: 'A kitten on the sea wall',
    desc: 'An engraved sea view at sunset: the sun low over the Marmara in a glory of fine rays, its road on the water, low islands and one ship on the horizon, and on the sea wall in the foreground a kitten sitting against the light, a weed growing from a crack beside it.',
    layers: [
      { id: 'k', k: 'k', layer: K, reveal: 4 },
      { id: 'm', k: 'm', layer: M, wipe: true },
      { id: 't', k: 't', layer: T, wipe: true },
    ],
  });
}
