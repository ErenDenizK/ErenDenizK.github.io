// Postcard 02: a metro platform (spec v3 §2.4). One-point perspective from the vanishing point: the
// coffered roof and the mezzanine's lattice, the platform edge, the tactile strip as dots growing toward
// the viewer, the train as a box receding to the right with its windows and its stripe, long hatching for
// its motion, the hanging clock, two people walking away, the red bag as the one closed, hatched shape.
import { rng, poly, smooth, ellipse, hatch, svg } from './engrave.mjs';

export const photo = 'metro-platform';
export const W = 420, H = 520;

export function draw() {
  const r = rng(23);
  const V = [118, 236]; // the vanishing point
  /* a point on the ray from V through (x at the right edge, y): t = 0 at V, 1 at the right edge */
  const T = (t, y) => [V[0] + (430 - V[0]) * t, V[1] + (y - V[1]) * t];
  const P = { line: '', fine: '', hat: '', dash: '' };
  const q = (pts) => poly(pts);

  /* construction: one circle about the vanishing point, one sight line along the platform edge */
  P.dash += ellipse(V[0], V[1], 150, 150, 0, 160);
  P.dash += q([V, [420, 494]]);
  P.fine += ellipse(V[0], V[1], 2.5, 2.5);

  /* the train: its roof line, its floor line and the far car's face */
  const t0 = 0.22;
  P.line += q([T(t0, 52), T(1, 52)]) + q([T(t0, 470), T(1, 470)]) + q([T(t0, 52), T(t0, 470)]);
  P.fine += q([T(t0, 34), T(1, 34)]) + q([T(t0, 34), T(t0, 52)]);
  /* roof vents */
  for (const [a, b] of [[0.42, 0.5], [0.66, 0.78], [0.9, 1]]) P.fine += q([T(a, 44), T(b, 44), T(b, 36), T(a, 36), T(a, 44)]);
  /* the stripe: an orange band and a blue band under the windows */
  P.line += q([T(t0, 346), T(1, 346)]) + q([T(t0, 374), T(1, 374)]);
  P.fine += q([T(t0, 396), T(1, 396)]) + q([T(t0, 150), T(1, 150)]) + q([T(t0, 158), T(1, 158)]);
  P.hat += hatch([T(t0, 347), T(1, 347), T(1, 373), T(t0, 373)], { angle: -16, gap: 3.2 });
  /* the doors: two leaves with a seam */
  for (const t of [0.36]) {
    const a = t, b = t + 0.1;
    P.line += q([T(a, 120), T(a, 470)]) + q([T(b, 120), T(b, 470)]) + q([T(a, 120), T(b, 120)]);
    P.fine += q([T((a + b) / 2, 120), T((a + b) / 2, 470)]);
    P.fine += q([T(a + 0.012, 170), T(a + 0.04, 170), T(a + 0.04, 270), T(a + 0.012, 270), T(a + 0.012, 170)]);
    P.fine += q([T(b - 0.04, 170), T(b - 0.012, 170), T(b - 0.012, 270), T(b - 0.04, 270), T(b - 0.04, 170)]);
  }
  /* the windows: rounded panes receding, a frame bar across each, dark glass hatched with the motion */
  for (const [a, b] of [[0.27, 0.33], [0.5, 0.62], [0.68, 0.84], [0.9, 1.06]]) {
    const pane = [T(a, 176), T(b, 176), T(b, 318), T(a, 318)];
    P.line += q([...pane, pane[0]]);
    P.fine += q([T(a, 214), T(b, 214)]);
    P.hat += hatch(pane, { angle: -12 * (1 - a), gap: 3, jit: 6, r, keep: (i) => i % 3 !== 1 });
  }
  /* passengers as soft shapes in the glass */
  for (const [t, y] of [[0.74, 268], [0.79, 262], [0.96, 258]]) { const [x, yy] = T(t, y); P.fine += ellipse(x, yy, 9 * t, 11 * t); }
  /* the train's motion: long strokes along its lower body, toward the vanishing point */
  for (let i = 0; i < 18; i++) {
    const y = 400 + i * 4 + r.pm(1.5), a = t0 + 0.05 + r() * 0.3, b = Math.min(1, a + 0.25 + r() * 0.5);
    P.hat += q([T(a, y), T(b, y)]);
  }

  /* the roof: beams across, closer together toward the vanishing point; the mezzanine's lattice */
  for (let i = 0; i < 7; i++) {
    const t = Math.pow(0.7, i);
    const [x1, y1] = [V[0] - (V[0] + 10) * t, V[1] - (V[1] - 6) * t];
    P[i % 2 ? 'hat' : 'fine'] += q([[x1, y1], T(Math.max(t0, t), 30 + (1 - t) * 4)]);
  }
  /* the mezzanine over the platform: its slab, two rails and balusters that close up toward the far end */
  P.line += q([[0, 4], V]) + q([[0, 96], [V[0] - 3, V[1] - 2]]);
  P.fine += q([[0, 30], [V[0] - 1, V[1] - 8]]) + q([[0, 80], [V[0] - 2, V[1] - 4]]);
  for (let i = 0; i < 22; i++) {
    const t = Math.pow(0.88, i);
    const x = V[0] - V[0] * t;
    const ya = V[1] - (V[1] - 30) * t, yb = V[1] - (V[1] - 80) * t;
    P.hat += q([[x, ya], [x, yb]]);
  }
  P.hat += hatch([[0, 82], [V[0] - 2, V[1] - 3], [V[0] - 3, V[1] - 1], [0, 94]], { angle: -62, gap: 3 });
  /* the light strip along the left wall, and the sign over the platform */
  P.fine += q([[0, 160], [V[0] - 4, V[1] - 2]]) + q([[0, 172], [V[0] - 4, V[1]]]);
  P.fine += q([[28, 128], [64, 158], [64, 166], [28, 138], [28, 128]]);

  /* the clock, hanging toward the far end */
  P.fine += q([[92, 168], [92, 192]]);
  P.line += ellipse(92, 200, 7.5, 7.5);
  P.fine += q([[92, 200], [92, 195]]) + q([[92, 200], [96, 202]]);

  /* the platform: its edge, the tactile strip as dots growing toward the viewer, floor joints */
  P.line += q([V, [430, 504]]);
  P.fine += q([V, [362, 520]]) + q([V, [300, 520]]);
  for (let i = 1; i < 22; i++) {
    const t = 1 - Math.pow(0.87, i);
    for (const k of [0, 1]) {
      const a = [V[0] + ((k ? 362 : 300) - V[0]) * t, V[1] + (520 - V[1]) * t];
      const b = [V[0] + ((k ? 380 : 330) - V[0]) * t, V[1] + (520 - V[1]) * t];
      if (a[1] > 520) continue;
      P.fine += ellipse((a[0] + b[0]) / 2, a[1], 0.6 + t * 2.2, 0.4 + t * 1.2);
    }
  }
  for (const x of [-120, 40, 200]) P.hat += q([V, [x, 520]]);
  for (let i = 1; i < 6; i++) { const t = Math.pow(1.38, i) / 6; const y = V[1] + (520 - V[1]) * t; if (y < 520) P.hat += q([[0, y], [V[0] + (300 - V[0]) * t, y]]); }

  /* two people walking away along the platform, the near one with the red bag at his side */
  const head = [[84, 350], [86, 338], [94, 334], [101, 339], [102, 352], [98, 360], [88, 360]];
  const coat = [[86, 360], [74, 364], [64, 374], [60, 404], [58, 440], [64, 446], [72, 448], [118, 448], [124, 444], [124, 404], [120, 374], [110, 364], [100, 360]];
  const legs = [[74, 448], [72, 480], [70, 508], [84, 510], [90, 470], [94, 470], [100, 510], [114, 510], [114, 478], [116, 448]];
  P.line += smooth(head, true) + smooth(coat, true) + poly(legs);
  P.hat += hatch(head, { angle: 20, gap: 1.8, inset: 0.6 });
  P.hat += hatch(coat, { angle: 70, gap: 1.9, inset: 0.6 });
  P.hat += hatch([...legs, [74, 448]], { angle: 85, gap: 2.8, inset: 0.6 });
  P.fine += smooth([[66, 378], [64, 410], [66, 438]]) + smooth([[118, 378], [120, 410], [118, 436]]) + poly([[92, 364], [92, 446]]);
  P.fine += poly([[72, 508], [66, 512], [86, 513]]) + poly([[100, 510], [118, 513], [114, 508]]);
  const bag = [[40, 452], [44, 446], [70, 446], [74, 452], [74, 494], [68, 500], [46, 500], [40, 494]];
  P.line += smooth(bag, true) + smooth([[48, 447], [56, 430], [62, 432], [66, 446]]);
  P.hat += hatch(bag, { angle: 45, gap: 2.2, inset: 1.2 }) + hatch(bag, { angle: -45, gap: 3.6, inset: 1.2 });
  P.fine += poly([[42, 470], [72, 470]]);
  const her = [[14, 372], [6, 378], [2, 420], [4, 468], [12, 470], [16, 432], [20, 470], [28, 468], [30, 420], [28, 378], [22, 372]];
  P.fine += smooth(her, true) + ellipse(18, 360, 7.5, 9.5);
  P.hat += hatch(her, { angle: 76, gap: 2.6, inset: 0.6 });

  return svg({
    w: W, h: H, id: 'pc-metro', title: 'A metro platform',
    desc: 'An engraved drawing of the photograph: a platform in one-point perspective, the train passing on the right, two people walking away, one with a red bag.',
    parts: [{ c: 'd', d: P.dash }, { c: '', d: P.line }, { c: 'f', d: P.fine }, { c: 'h', d: P.hat }],
  });
}
