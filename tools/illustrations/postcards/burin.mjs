// The burin: engraving primitives for the postcard backs drawn after the round-six art direction
// (the round-six engraving guide, rules 1.2 to 1.7). engrave.mjs draws with one stroke
// width; the burin draws every line as a filled shape that swells and tapers, so a back reads as a plate
// and not as a CAD trace.
//
// - taper(): a centre line offset by a width profile (about 28 % at each end, full in the body).
// - outline(): a closed contour whose weight follows the light: thin on the lit upper left, heavy on
//   the shaded lower right (one light, from the upper left at about 40 degrees, in every plate).
// - hatch(): straight hatching clipped to rings (holes allowed), each line a lozenge.
// - flow(): any family of curves clipped to rings, each run tapered: contour hatching that follows
//   the form (a vault's rings, a cat's fur, a stone's turn).
// - dots(): stipple for transitions only.
// Every primitive also returns its centre line. The plate draws itself on through a mask made of those
// centre lines (stroked wide, pathLength 1), because a filled shape cannot be drawn on by its own
// dash. Seeded and deterministic: a rebuild is byte-identical.

export { rng } from './engrave.mjs';

/* output: every coordinate is written as a whole number in a space Q times finer than the drawing's
   units, so a plate's fills cost few bytes and keep a quarter-unit precision (plate() scales its viewBox) */
let Q = 4;
export const quant = (q) => { Q = q; };
const f = (v) => Math.round(v * Q).toString();
const g = (v) => Math.round(v * Q).toString();
const LIGHT = [0.64, 0.77]; // the shade direction: away from a light at the upper left

/** A Catmull-Rom curve through points, sampled `k` times per span. */
export function curve(pts, k = 6, closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((a) => 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3)));
    }
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}

/** Points along a straight segment, so it can be tapered. */
export const seg = (a, b, k = 4) => Array.from({ length: k + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / k, a[1] + ((b[1] - a[1]) * i) / k]);

const centre = (pts) => 'M' + pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1).map((p) => `${g(p[0])} ${g(p[1])}`).join('L');

function normals(pts, closed) {
  const L = pts.length;
  return pts.map((p, i) => {
    const a = pts[closed ? (i - 1 + L) % L : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % L : Math.min(L - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
}
/** Points along a polyline every `step` units of length (at least its two ends): fewer vertices, the
    same shape, so a tapered fill costs few bytes. */
export function resample(pts, step) {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T = len[len.length - 1];
  const k = Math.max(2, Math.round(T / step) + 1);
  const out = [];
  let j = 0;
  for (let i = 0; i < k; i++) {
    const t = (T * i) / (k - 1);
    while (j < len.length - 2 && len[j + 1] < t) j++;
    const u = (t - len[j]) / ((len[j + 1] - len[j]) || 1);
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u]);
  }
  return out;
}
const ring = (pts) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L') + 'Z';

/** A tapered line along `pts` (already dense, e.g. from curve()): width `w` in its body, `e` x w at the
    ends. `lit` (0..1) thins the line where its normal faces the light. */
export function taper(pts0, w, { e = 0.28, lit = 0.35, pow = 0.55, step = 4 } = {}) {
  if (pts0.length < 2) return { d: '', c: '' };
  const pts = resample(pts0, step);
  const N = normals(pts, false);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T = len[len.length - 1] || 1;
  const L = [], R = [];
  pts.forEach((p, i) => {
    const t = len[i] / T;
    let s = e + (1 - e) * Math.pow(Math.sin(Math.PI * t), pow);
    const sh = Math.abs(N[i][0] * LIGHT[0] + N[i][1] * LIGHT[1]);
    s *= 1 - lit + lit * sh;
    const h = (w * s) / 2;
    L.push([p[0] + N[i][0] * h, p[1] + N[i][1] * h]);
    R.push([p[0] - N[i][0] * h, p[1] - N[i][1] * h]);
  });
  return { d: ring([...L, ...R.reverse()]), c: centre(pts) };
}

/** A closed contour (dense points) as a band whose weight follows the light: `w0` where the outward
    normal faces the light, `w1` where it faces away. Drawn as an outer and an inner ring (a hole). */
export function outline(pts0, w0, w1, step = 3, dir = LIGHT) {
  const pts = step ? resample([...pts0, pts0[0]], step).slice(0, -1) : pts0;
  const N = normals(pts, true);
  /* outward: the normal points away from the centroid */
  let cx = 0, cy = 0;
  pts.forEach((p) => { cx += p[0] / pts.length; cy += p[1] / pts.length; });
  const sgn = Math.sign(N.reduce((s, n, i) => s + n[0] * (pts[i][0] - cx) + n[1] * (pts[i][1] - cy), 0)) || 1;
  const O = [], I = [];
  pts.forEach((p, i) => {
    const n = [N[i][0] * sgn, N[i][1] * sgn];
    const k = Math.max(0, Math.min(1, (n[0] * dir[0] + n[1] * dir[1] + 0.25) / 1.25));
    const h = (w0 + (w1 - w0) * k) / 2;
    O.push([p[0] + n[0] * h * 0.5, p[1] + n[1] * h * 0.5]);
    I.push([p[0] - n[0] * h * 1.5, p[1] - n[1] * h * 1.5]);
  });
  return { d: ring(O) + ring(I.reverse()), c: centre([...pts, pts[0]]) };
}

/** Is a point inside the rings (even-odd, so a ring inside another is a hole)? */
export function within([x, y], rings) {
  let on = false;
  for (const poly of rings) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) on = !on;
    }
  }
  return on;
}

/** One lozenge: a hatching line that swells in its middle and ends in points. */
function lozenge(a, b, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (w / 2), ny = (dx / l) * (w / 2);
  if (l < 26) {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    return `M${f(a[0])} ${f(a[1])}L${f(m[0] + nx)} ${f(m[1] + ny)}L${f(b[0])} ${f(b[1])}L${f(m[0] - nx)} ${f(m[1] - ny)}Z`;
  }
  const p = [a[0] + dx * 0.22, a[1] + dy * 0.22], q = [a[0] + dx * 0.78, a[1] + dy * 0.78];
  return `M${f(a[0])} ${f(a[1])}L${f(p[0] + nx)} ${f(p[1] + ny)}L${f(q[0] + nx)} ${f(q[1] + ny)}L${f(b[0])} ${f(b[1])}L${f(q[0] - nx)} ${f(q[1] - ny)}L${f(p[0] - nx)} ${f(p[1] - ny)}Z`;
}

/** Straight hatching inside `rings`, at `angle` degrees, every `gap` units, each line `w` wide.
    `keep([x, y], i)` may drop a line (by its middle); `jit` moves the ends (an engraver's uneven stops);
    `wf([x, y])` may scale the width (tone that deepens toward the focus). */
export function hatch(rings, { angle = 0, gap = 5, w = 0.8, jit = 0, r = null, keep = null, inset = 0.8, wf = null, from = 0, clip = null } = {}) {
  const a = (-angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const rot = ([x, y]) => [x * c - y * s, x * s + y * c];
  const back = ([x, y]) => [x * c + y * s, -x * s + y * c];
  const RR = rings.map((p) => p.map(rot));
  const ys = RR.flat().map((p) => p[1]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  let d = '', cl = '';
  let i = 0;
  for (let y = y0 + gap / 2 + from; y < y1; y += gap, i++) {
    const xs = [];
    for (const P of RR) for (let k = 0, j = P.length - 1; k < P.length; j = k++) {
      const [xa, ya] = P[j], [xb, yb] = P[k];
      if ((ya <= y && yb > y) || (yb <= y && ya > y)) xs.push(xa + ((y - ya) * (xb - xa)) / (yb - ya));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let xa = xs[k] + inset, xb = xs[k + 1] - inset;
      if (r && jit) { xa += r() * jit; xb -= r() * jit; }
      if (xb - xa < 2) continue;
      const A = back([xa, y]), B = back([xb, y]);
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      if (keep && !keep(mid, i)) continue;
      const ww = w * (wf ? wf(mid) : 1);
      if (ww < 0.2) continue;
      /* `clip`: rings the line must also lie in (inside the first, outside the rest), cut exactly */
      const parts = clip ? runs(seg(A, B, Math.max(2, Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]) / 1.5))), clip).map((q) => [q[0], q[q.length - 1]]) : [[A, B]];
      for (const [p, q] of parts) {
        if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 2) continue;
        d += lozenge(p, q, ww);
        cl += `M${g(p[0])} ${g(p[1])}L${g(q[0])} ${g(q[1])}`;
      }
    }
  }
  return { d, c: cl };
}

/** Inside the first ring and outside every other one (overlapping holes stay holes). */
export const cutout = (p, rings) => within(p, [rings[0]]) && !rings.slice(1).some((q) => within(p, [q]));

/** Clip a dense polyline to `rings`: the runs of consecutive points inside the first ring and outside
    the others. */
export function runs(pts, rings) {
  const out = [];
  let cur = [];
  for (const p of pts) {
    if (cutout(p, rings)) cur.push(p);
    else { if (cur.length > 1) out.push(cur); cur = []; }
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/** Contour hatching: each curve of `family` (dense polylines) clipped to `rings` and tapered to `w`.
    `wf(p)` scales a run's width by its middle; runs shorter than `min` are dropped. */
export function flow(family, rings, { w = 0.8, wf = null, min = 3, e = 0.22 } = {}) {
  let d = '', c = '';
  for (const line of family) {
    for (const run of runs(line, rings)) {
      let L = 0;
      for (let i = 1; i < run.length; i++) L += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]);
      if (L < min) continue;
      const m = run[run.length >> 1];
      const ww = w * (wf ? wf(m) : 1);
      if (ww < 0.2) continue;
      const t = taper(run, ww, { e, lit: 0 });
      d += t.d; c += t.c;
    }
  }
  return { d, c };
}

/** Stipple: small lozenge dots inside `rings`, at most `n`, accepted with probability `p([x, y])`. */
export function dots(rings, n, r, { size = 0.9, p = () => 1, box = null } = {}) {
  const pts = rings.flat();
  const [x0, x1] = box ? [box[0], box[2]] : [Math.min(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[0]))];
  const [y0, y1] = box ? [box[1], box[3]] : [Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[1]))];
  let d = '', c = '';
  for (let t = 0, k = 0; t < n * 8 && k < n; t++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    if (!within([x, y], rings) || r() > p([x, y])) continue;
    const s = size * (0.7 + r() * 0.5);
    d += `M${f(x - s)} ${f(y)}L${f(x)} ${f(y - s * 0.8)}L${f(x + s)} ${f(y)}L${f(x)} ${f(y + s * 0.8)}Z`;
    c += `M${g(x)} ${g(y)}h${Q}`;
    k++;
  }
  return { d, c };
}

/** A group of marks of one kind: fills and the centre lines that reveal them. */
export class Layer {
  constructor() { this.d = ''; this.c = ''; }
  add(...parts) { for (const p of parts) if (p) { this.d += p.d; this.c += p.c; } return this; }
}

/** Assemble a burin plate. `layers` in draw-on order: { id, k: class of its reveal (k, m, t), layer,
    reveal: the mask's stroke width, fill (optional colour), wipe: reveal by a soft diagonal edge that
    travels from the upper left, with the light, instead of by centre lines (tone: cheaper, and the
    tone falls in the way the light does) }. Without motion the masks are solid and
    the plate stands complete (Postcards.astro sets the draw-on). */
export function plate({ w, h, id, title, desc, layers }) {
  const L = layers.filter((l) => l.layer.d);
  const W3 = (v) => Math.round(v * Q);
  const defs = L.map((l) => l.wipe
    ? `<linearGradient id="${id}-${l.id}g" gradientUnits="userSpaceOnUse" x1="${W3(w * 1.05)}" y1="${W3(h * 1.05)}" x2="${W3(w * 1.3)}" y2="${W3(h * 1.3)}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${id}-${l.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W3(w)}" height="${W3(h)}"><rect class="wipe" x="${W3(-3 * w)}" y="${W3(-3 * h)}" width="${W3(4.5 * w)}" height="${W3(4.5 * h)}" fill="url(#${id}-${l.id}g)"/></mask>`
    : `<mask id="${id}-${l.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W3(w)}" height="${W3(h)}"><path class="${l.k}" pathLength="1" fill="none" stroke="#fff" stroke-width="${W3(l.reveal)}" stroke-linecap="round" stroke-linejoin="round" d="${l.layer.c}"/></mask>`).join('');
  const body = L.map((l) => `<path${l.fill ? ` fill="${l.fill}"` : ''} mask="url(#${id}-${l.id})" d="${l.layer.d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W3(w)} ${W3(h)}" class="burin" fill="currentColor"><title>${title}</title><desc>${desc}</desc><defs>${defs}</defs>${body}</svg>`;
}

/** A polygon with straight edges, subdivided every `step` units so outline() can weigh each edge by
    the light (a corner keeps its own two normals). */
export function dense(pts, step = 3, closed = true) {
  const out = [];
  const L = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < L; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}
