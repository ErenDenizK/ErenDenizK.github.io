// Postcard 01: the inner courtyard at YTÜ, through a tinted lens (spec v3 §2.4). The lens is the frame:
// inside it the courtyard is drawn in full (trunks, engraved crowns, the lawn in perspective hatching, the
// walkway, one walker); outside it the horizon and the trunks go on in dashed construction, so the
// drawing shows what the lens does. Two fingertips that hold the lens enter from the left edge.
import { rng, poly, smooth, ellipse, ring, hatch, crown, svg } from './engrave.mjs';

export const photo = 'park-through-lens';
export const W = 460, H = 330;

export function draw() {
  const r = rng(11);
  const L = { cx: 262, cy: 172, rx: 176, ry: 196, rot: -6 };
  const hz = 214; // the horizon, inside the lens
  const P = { line: '', fine: '', hat: '', dash: '', rim: '', rimF: '', rimH: '', hand: '', handF: '', handH: '' };

  /* construction: one circle about the lens, one sight line from the walker down to the near lawn */
  P.dash += ellipse(L.cx, L.cy, 212, 212, 0, 200);
  P.dash += poly([[364, hz - 12], [150, 330]]);
  /* outside the lens: the horizon and trunks continue, dashed */
  P.dash += poly([[0, hz + 6], [92, hz + 3]]) + poly([[432, hz - 2], [460, hz - 3]]);
  P.dash += poly([[56, hz + 4], [57, 120]]) + poly([[72, hz + 4], [73, 150]]) + poly([[447, hz - 2], [446, 96]]);

  /* inside the lens: the horizon and the walkway along it */
  P.line += poly([[60, hz + 2], [460, hz - 3]]);
  P.fine += poly([[60, hz + 8], [460, hz + 3]]);
  /* the lawn: lines that open toward the viewer, broken like mown grass */
  for (let i = 1; i < 15; i++) {
    const y = hz + 8 + i * i * 0.55 + i * 2.2;
    let x = 64 + r() * 20;
    while (x < 452) {
      const len = 30 + r() * 70;
      P.hat += `M${Math.round(x)} ${Math.round(y - (x - 70) * 0.012)}l${Math.round(len)} ${(-len * 0.012).toFixed(1)}`;
      x += len + 5 + r() * 14;
    }
  }
  /* grass tufts in the near lawn, fewer toward the horizon */
  for (let i = 0; i < 40; i++) {
    const y = hz + 30 + Math.sqrt(r()) * 110, x = 100 + r() * 340;
    const s = 1.5 + (y - hz) * 0.035;
    P.fine += `M${Math.round(x - s)} ${Math.round(y)}l${(s * 0.6).toFixed(1)} ${(-s * 1.7).toFixed(1)}M${Math.round(x)} ${Math.round(y)}l${(s * 0.2).toFixed(1)} ${(-s * 2.1).toFixed(1)}M${Math.round(x + s * 0.7)} ${Math.round(y)}l${(s * 0.5).toFixed(1)} ${(-s * 1.5).toFixed(1)}`;
  }
  /* a fallen leaf or two */
  P.fine += 'M300 286q4 -5 9 -1q-4 5 -9 1M168 266q3 -4 7 -1q-3 4 -7 1';

  /* the trees, far to near: [x of the trunk, base y, height, crown rx, ry, kind] */
  const trees = [
    [150, hz + 2, 76, 24, 22, 'far'], [180, hz + 1, 64, 20, 18, 'far'], [318, hz - 1, 56, 18, 16, 'far'], [340, hz - 1, 70, 22, 20, 'far'],
    [240, hz, 128, 40, 0, 'cone'],
    [110, hz + 2, 156, 62, 54, 'big'],
    [396, hz - 2, 176, 74, 66, 'big'],
  ];
  for (const [x, y0, h, rx, ry, kind] of trees) {
    const top = y0 - h;
    const w = kind === 'far' ? 1.2 : kind === 'cone' ? 2 : 3.6;
    const lean = r.pm(2);
    const up = top + (kind === 'cone' ? 30 : ry * 0.7);
    P[kind === 'far' ? 'fine' : 'line'] += smooth([[x - w, y0], [x - w * 0.8 + lean * 0.5, (y0 + up) / 2], [x - w * 0.5 + lean, up]]) + smooth([[x + w, y0], [x + w * 0.8 + lean * 0.5, (y0 + up) / 2], [x + w * 0.5 + lean, up]]);
    if (kind === 'big') {
      /* bark: short strokes down the shaded side of the trunk, two limbs into the crown */
      for (let k = 0; k < 9; k++) { const yy = y0 - 6 - k * ((y0 - up) / 9); P.hat += `M${Math.round(x + 0.5)} ${Math.round(yy)}l2 -4`; }
      P.line += smooth([[x + lean, up + 10], [x + 14, up - 10], [x + 26, up - 26]]) + smooth([[x + lean, up + 4], [x - 10, up - 12], [x - 22, up - 30]]);
    }
    if (kind === 'cone') {
      /* the pointed tree in the middle (the photograph's centre): tiers narrowing to a point */
      for (let k = 0; k < 5; k++) {
        const cy = top + 8 + k * 22, crx = 12 + k * 7.5;
        const c = crown(x, cy, crx, 13 + k * 1.5, r, { lumps: 4, scale: 4, leaves: 6 + k * 3, shade: 0.5, gap: 2.6 });
        P.line += c.line; P.fine += c.fine; P.hat += c.hatch;
      }
      continue;
    }
    const big = kind === 'big';
    const c = crown(x + (big ? (x < 200 ? -8 : 10) : 0), top + ry * 0.35, rx, ry, r, { lumps: big ? 7 : 5, scale: big ? 5.5 : 4, leaves: big ? 70 : 14, shade: big ? 0.55 : 0.7, gap: big ? 2.8 : 2.4 });
    P[big ? 'line' : 'fine'] += c.line;
    P.fine += c.fine;
    P.hat += c.hatch;
    if (big) {
      /* a second, lower mass of leaves, so the crown is not one cloud */
      const c2 = crown(x + (x < 200 ? 26 : -30), top + ry * 0.95, rx * 0.55, ry * 0.45, r, { lumps: 5, scale: 4.5, leaves: 26, shade: 0.6 });
      P.line += c2.line; P.fine += c2.fine; P.hat += c2.hatch;
    }
  }
  /* people sitting on the far lawn, and the walker on the walkway, seen from the side */
  for (const [x, s] of [[200, 5], [286, 4.5], [298, 5]]) P.fine += `M${x - 2} ${hz + 1}q2 ${-s} 4 0M${x} ${hz + 1 - s}l0 ${-s * 0.4}`;
  const wx = 366, wy = hz - 1;
  P.line += `M${wx - 4} ${wy}q2 -6 3 -11q2 5 5 11M${wx - 1} ${wy - 11}q-1 -6 0 -10q2 -1 4 1q1 5 -1 9z` + ellipse(wx + 1, wy - 25, 2.6, 3);
  P.hat += hatch([[wx - 1, wy - 11], [wx - 1, wy - 21], [wx + 3, wy - 20], [wx + 2, wy - 11]], { angle: 90, gap: 1.6 });

  /* the lens: rim, its inner edge, and the tint as a crescent of hatching along the right side */
  P.rim += ellipse(L.cx, L.cy, L.rx, L.ry, L.rot, 200);
  P.rimF += ellipse(L.cx, L.cy, L.rx + 9, L.ry + 9, L.rot, 200);
  const outer = ring(L.cx, L.cy, L.rx + 9, L.ry + 9, 40, L.rot, -60, 70);
  const inner = ring(L.cx, L.cy, L.rx, L.ry, 40, L.rot, -60, 70).reverse();
  P.rimH += hatch([...outer, ...inner], { angle: 64, gap: 2.2 });

  /* the fingertips that hold the lens, entering from the left edge (over the lens, so not clipped) */
  P.hand += smooth([[0, 24], [26, 16], [50, 36], [52, 74], [34, 98], [0, 102]]);
  P.handF += smooth([[12, 40], [26, 34], [36, 44]]);
  P.handH += hatch([[0, 28], [24, 22], [44, 40], [46, 72], [30, 94], [0, 96]], { angle: 74, gap: 2.6, keep: (i, [x, y]) => x < 30 - (y - 60) * 0.1 });
  P.hand += smooth([[0, 214], [22, 222], [40, 256], [38, 300], [28, 340]]);
  P.handH += hatch([[0, 220], [20, 228], [33, 258], [30, 330], [0, 330]], { angle: 74, gap: 2.6, keep: (i, [x]) => x < 24 });

  const lens = ellipse(L.cx, L.cy, L.rx, L.ry, L.rot, 200);
  return svg({
    w: W, h: H, id: 'pc-park', title: 'The courtyard through a lens',
    desc: 'An engraved drawing of the photograph: a lens held close, the courtyard inside it drawn in full, the horizon and trunks continuing outside it in dashes.',
    clips: { lens },
    parts: [
      { c: 'd', d: P.dash },
      { c: '', d: P.rim + P.hand },
      { c: '', d: P.line, clip: 'lens' },
      { c: 'f', d: P.rimF + P.handF },
      { c: 'f', d: P.fine, clip: 'lens' },
      { c: 'h', d: P.hat, clip: 'lens' },
      { c: 'h', d: P.rimH + P.handH },
    ],
  });
}
