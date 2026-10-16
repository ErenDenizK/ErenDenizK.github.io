// Postcard 03: a kitten on the sea wall, the sun low over the Marmara (spec v3 §2.4). The horizon, the low
// sun as a circle with two dashed halos, its road on the water as stacked strokes that widen toward the
// viewer, the sea wall's rough top and its hatched face, the kitten as an outline filled with fine
// vertical hatching (a silhouette against the light, its eyes left open), one weed in the wall.
import { rng, poly, smooth, ellipse, arc, hatch, inside, svg } from './engrave.mjs';

export const photo = 'cat-sunset-silhouette';
export const W = 460, H = 330;

export function draw() {
  const r = rng(31);
  const hz = 150, S = [262, 98];
  const P = { line: '', fine: '', hat: '', dash: '', bline: '', bfine: '', bhat: '' };
  /* the kitten's outline, traced as numbers from the photograph's own proportions (source pixels x 0.55,
     so it stands on the wall where the photograph has it). Everything behind it is cut out around it. */
  const K = (pts) => pts.map(([x, y]) => [8 + x * 0.55, y * 0.55 - 176]);
  const kitPts = K([[184, 914], [178, 860], [176, 800], [180, 742], [194, 702], [184, 656], [184, 612], [190, 590], [196, 548], [234, 582], [256, 578], [282, 584], [326, 554], [328, 600], [332, 642], [322, 682], [310, 706], [334, 750], [354, 800], [362, 850], [356, 896], [330, 916], [300, 918], [270, 916], [258, 878], [240, 872], [222, 878], [214, 914]]);
  const kitPoly = kitPts;

  /* construction: one circle about the sun, one sight line from the sun down its road */
  P.dash += arc(S[0], S[1], 150, 150, -200, 112);
  P.dash += poly([[S[0], S[1] + 20], [S[0] + 4, 256]]);
  P.dash += ellipse(S[0], S[1], 17, 17) + ellipse(S[0], S[1], 36, 36);
  P.line += ellipse(S[0], S[1], 6.5, 6.5);

  /* the sky: long strata of cloud, a darker band low over the horizon */
  for (let i = 0; i < 7; i++) {
    const y = 16 + i * 11 + r.pm(3);
    let x = r() * 80;
    while (x < 460) {
      const len = 30 + r() * 120;
      if (r() > 0.35 && (Math.abs(x + len / 2 - S[0]) > 60 + len / 2 || y < 30)) P.hat += `M${Math.round(x)} ${Math.round(y)}q${Math.round(len / 2)} ${(-2 + r() * 2).toFixed(1)} ${Math.round(len)} ${(r.pm(1.5)).toFixed(1)}`;
      x += len + 20 + r() * 50;
    }
  }
  /* the low band of cloud over the horizon, thinning toward the sun */
  for (let i = 0; i < 3; i++) { const y = 126 + i * 5; P.hat += `M${4 + i * 10} ${y}q${90 - i * 10} -2 ${176 - i * 22} 1M${338 + i * 12} ${y + 1}q${50} -1 ${116 - i * 12} -1`; }
  P.fine += 'M302 74q8 -5 16 -1q-6 3 -16 1';

  /* the horizon, and two ships on it */
  P.line += poly([[0, hz], [460, hz]]);
  P.fine += 'M58 150l14 0l1 -3l6 0l0 3M372 150l20 0l2 -4l8 0l1 4M120 150l0 -6l3 6';

  /* the sun's road on the water: stacked strokes that widen and break toward the viewer */
  for (let i = 0; i < 22; i++) {
    const y = hz + 3 + i * 4.2 + i * i * 0.06;
    if (y > 268) break;
    const w = 4 + i * 2.1 + r() * 4;
    const off = r.pm(1.5) + i * 0.3;
    const gap = i > 6 && r() > 0.5 ? 2 + r() * 4 : 0;
    if (gap) P[i % 2 ? 'fine' : 'line'] += poly([[S[0] - w / 2 + off, y], [S[0] - gap + off, y]]) + poly([[S[0] + gap + off, y], [S[0] + w / 2 + off, y]]);
    else P[i % 2 ? 'fine' : 'line'] += poly([[S[0] - w / 2 + off, y], [S[0] + w / 2 + off, y]]);
  }
  /* the water: short ripples, longer toward the viewer, none on the road */
  for (let i = 0; i < 70; i++) {
    const y = hz + 6 + Math.pow(r(), 0.8) * 130, x = r() * 460;
    if (Math.abs(x - S[0]) < 12 + (y - hz) * 0.32) continue;
    const len = 6 + (y - hz) * 0.18;
    P.hat += `M${Math.round(x)} ${Math.round(y)}q${(len / 2).toFixed(1)} -1.5 ${Math.round(len)} 0`;
  }

  /* the sea wall: the far edge of its top, rough; the top hatched dark; the face at the right */
  const edge = [];
  for (let x = -4; x <= 464; x += 12) edge.push([x, 296 - x * 0.15 + r.pm(1.6) + (x > 300 && x < 330 ? -3 : 0)]);
  P.line += smooth(edge);
  const front = [[250, 330], [300, 316], [380, 300], [464, 284]];
  P.line += smooth(front);
  const top = [...edge, [464, 330], [-4, 330]];
  /* the concrete: broken strokes, so it reads rough, never ruled */
  const face = [[250, 330], [300, 316], [380, 300], [464, 284], [464, 340], [250, 340]];
  let wall = '';
  for (let i = 0; i < 520; i++) {
    const x = r() * 464, y = 228 + r() * 104;
    if (!inside([x, y], top) || inside([x, y], face) || inside([x, y], kitPoly)) continue;
    const len = 3 + r() * 9;
    wall += `M${Math.round(x)} ${Math.round(y)}l${Math.round(len)} ${(-len * 0.15).toFixed(1)}`;
  }
  P.hat += wall;
  P.hat += hatch([[250, 330], [300, 316], [380, 300], [464, 284], [464, 340], [250, 340]], { angle: 90, gap: 2.2 });
  P.fine += smooth([[300, 262], [330, 264], [352, 258], [372, 262]]);
  /* weeds in the wall */
  P.fine += 'M326 250q-2 -8 1 -14M326 250q3 -6 8 -9M326 250q-5 -4 -9 -5M230 268q-1 -7 2 -12M230 268q4 -5 7 -6';

  /* the kitten, sitting, facing us: an outline filled with fine vertical hatching, its eyes left open */
  const B = { ...P };
  P.line = P.fine = P.hat = '';
  const kit = kitPts;
  P.line += smooth(kit, true);
  const eyes = K([[226, 642], [286, 642]]).map(([x, y]) => [x, y, 6.2, 3.6]);
  const inEye = ([x, y]) => eyes.some(([ex, ey, rx, ry]) => ((x - ex) / (rx + 1.6)) ** 2 + ((y - ey) / (ry + 1.6)) ** 2 < 1);
  /* vertical hatching, broken where it crosses an eye */
  const xs0 = kit.map((p) => p[0]);
  for (let x = Math.min(...xs0) + 1; x < Math.max(...xs0); x += 1.8) {
    const xs = [];
    for (let i = 0, j = kit.length - 1; i < kit.length; j = i++) {
      const [x1, y1] = kit[i], [x2, y2] = kit[j];
      if ((x1 <= x && x2 > x) || (x2 <= x && x1 > x)) xs.push(y1 + ((x - x1) * (y2 - y1)) / (x2 - x1));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let y = xs[k] + 1.2, start = y;
      const end = xs[k + 1] - 1.2;
      for (; y <= end; y += 1) {
        if (inEye([x, y])) { if (y - start > 1.5) P.hat += `M${x.toFixed(1)} ${Math.round(start)}V${Math.round(y)}`; while (y <= end && inEye([x, y])) y += 1; start = y; }
      }
      if (end - start > 1.5) P.hat += `M${x.toFixed(1)} ${Math.round(start)}V${Math.round(end)}`;
    }
  }
  for (const [ex, ey, rx, ry] of eyes) P.fine += ellipse(ex, ey, rx, ry, 0, 180);
  const [nx, ny] = K([[256, 672]])[0];
  /* the nose and mouth, tabby bars on the brow and the chest, whiskers, the line of the near leg */
  P.fine += `M${nx - 3} ${ny}l3 3l3 -3M${nx} ${ny + 3}q-3 4 -6 3M${nx} ${ny + 3}q3 4 6 3`;
  P.fine += `M${nx - 9} ${ny - 32}l4 8M${nx} ${ny - 34}l0 9M${nx + 9} ${ny - 32}l-4 8`;
  P.fine += `M${nx - 18} ${ny + 26}q18 7 36 0M${nx - 20} ${ny + 42}q20 8 40 0M${nx - 20} ${ny + 58}q20 8 40 0`;
  P.fine += `M${nx - 8} ${ny + 4}l-36 -6M${nx - 8} ${ny + 7}l-34 5M${nx + 8} ${ny + 4}l36 -7M${nx + 8} ${ny + 7}l34 4`;
  P.fine += smooth(K([[300, 760], [312, 830], [306, 900]]));

  return svg({
    w: W, h: H, id: 'pc-cat', title: 'A kitten on the sea wall',
    desc: 'An engraved drawing of the photograph: the sun low over the sea and its road on the water, a kitten sitting on the sea wall as a silhouette against the light.',
    clips: { behind: { d: `M-10 -10H470V340H-10Z${smooth(kitPts, true)}`, rule: 'evenodd' } },
    parts: [
      { c: 'd', d: B.dash, clip: 'behind' },
      { c: '', d: B.line, clip: 'behind' }, { c: '', d: P.line },
      { c: 'f', d: B.fine, clip: 'behind' }, { c: 'f', d: P.fine },
      { c: 'h', d: B.hat, clip: 'behind' }, { c: 'h', d: P.hat },
    ],
  });
}
