// Engraving primitives for the postcard drawings (spec v3 §2.4): the page's line-art language of the
// scene drawings (src/one/work/art/*.svg), drawn by code. One stroke width, round caps and joins;
// classes .f (secondary, 0.55), .h (hatching, 0.4), .d (dashed construction). Every drawing is drawn
// at its plate's size on a desktop card, so a user unit is about one pixel there and the strokes need no
// vector-effect (which would break pathLength, and the back draws each path on by its length).
// Seeded: a rebuild is byte-identical.

export function rng(seed) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  r.pm = (a) => (r() - 0.5) * 2 * a; // plus or minus a
  return r;
}

/* whole units: a user unit is about a pixel on the desktop card, and the drawings stay small */
const n = (v) => Math.round(v).toString();
const pt = ([x, y]) => `${n(x)} ${n(y)}`;

/** A polyline as path data. */
export const poly = (pts, closed = false) => 'M' + pts.map(pt).join('L') + (closed ? 'Z' : '');

/** A smooth curve through points (Catmull-Rom, as cubic Béziers). */
export function smooth(pts, closed = false, t = 0.5) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = 'M' + pt(P[1]);
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 3, p1[1] + ((p2[1] - p0[1]) * t) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 3, p2[1] - ((p3[1] - p1[1]) * t) / 3];
    d += 'C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(p2);
  }
  return d + (closed ? 'Z' : '');
}

/** An ellipse as path data, two half arcs from angle a0 (so it can be drawn on by its length from there). */
export function ellipse(cx, cy, rx, ry, rot = 0, a0 = -90) {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180);
  const at = (deg) => { const a = (deg * Math.PI) / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; };
  const [p, q] = [at(a0), at(a0 + 180)];
  const f = (v) => (Math.round(v * 10) / 10).toString();
  const A = (e) => `A${f(rx)} ${f(ry)} ${Math.round(rot)} 1 1 ${f(e[0])} ${f(e[1])}`;
  return `M${f(p[0])} ${f(p[1])}${A(q)}${A(p)}`;
}
/** An open arc of an ellipse from angle a0 to a1 (degrees, clockwise on screen). */
export function arc(cx, cy, rx, ry, a0, a1, rot = 0) {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180);
  const at = (deg) => { const a = (deg * Math.PI) / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; };
  const [p, q] = [at(a0), at(a1)];
  const f = (v) => (Math.round(v * 10) / 10).toString();
  return `M${f(p[0])} ${f(p[1])}A${f(rx)} ${f(ry)} ${Math.round(rot)} ${a1 - a0 > 180 ? 1 : 0} 1 ${f(q[0])} ${f(q[1])}`;
}
export const circle = (cx, cy, r, a0) => ellipse(cx, cy, r, r, 0, a0);

/** Points on an ellipse, for building shapes. */
export function ring(cx, cy, rx, ry, k, rot = 0, a0 = 0, a1 = 360) {
  const c = Math.cos((rot * Math.PI) / 180), s = Math.sin((rot * Math.PI) / 180), out = [];
  for (let i = 0; i < k; i++) {
    const a = ((a0 + ((a1 - a0) * i) / (a1 - a0 === 360 ? k : k - 1)) * Math.PI) / 180;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

/** Is a point inside a polygon (even-odd)? */
export function inside([x, y], poly) {
  let on = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) on = !on;
  }
  return on;
}

/** Parallel hatching clipped to a polygon: lines at `angle` degrees every `gap` units. `jit` moves each
    end along the line (an engraver's uneven stops); `keep(i, mid)` may drop a line. */
export function hatch(polyPts, { angle = 0, gap = 4, jit = 0, r = null, keep = null, from = 0, inset = 0 } = {}) {
  const a = (-angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const rot = ([x, y]) => [x * c - y * s, x * s + y * c];
  const back = ([x, y]) => [x * c + y * s, -x * s + y * c];
  const P = polyPts.map(rot);
  const ys = P.map((p) => p[1]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  let d = '';
  let i = 0;
  for (let y = y0 + gap / 2 + from; y < y1; y += gap, i++) {
    const xs = [];
    for (let k = 0, j = P.length - 1; k < P.length; j = k++) {
      const [xa, ya] = P[j], [xb, yb] = P[k];
      if ((ya <= y && yb > y) || (yb <= y && ya > y)) xs.push(xa + ((y - ya) * (xb - xa)) / (yb - ya));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let xa = xs[k] + inset, xb = xs[k + 1] - inset;
      if (r && jit) { xa += r() * jit; xb -= r() * jit; }
      if (xb - xa < 1.5) continue;
      const mid = back([(xa + xb) / 2, y]);
      if (keep && !keep(i, mid)) continue;
      d += 'M' + pt(back([xa, y])) + 'L' + pt(back([xb, y]));
    }
  }
  return d;
}

/** A scalloped outline along a closed polygon: small bumps outward, the engraver's foliage edge. */
export function scallop(pts, size, r) {
  let d = '';
  const L = pts.length;
  let cx = 0, cy = 0;
  pts.forEach(([x, y]) => { cx += x / L; cy += y / L; });
  for (let i = 0; i < L; i++) {
    const a = pts[i], b = pts[(i + 1) % L];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.round(len / size));
    for (let j = 0; j < k; j++) {
      const p = [a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k];
      const q = [a[0] + ((b[0] - a[0]) * (j + 1)) / k, a[1] + ((b[1] - a[1]) * (j + 1)) / k];
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      let nx = m[0] - cx, ny = m[1] - cy;
      const nl = Math.hypot(nx, ny) || 1;
      const h = (len / k) * (0.45 + (r ? r() * 0.3 : 0));
      nx = (nx / nl) * h; ny = (ny / nl) * h;
      d += (i === 0 && j === 0 ? 'M' + pt(p) : '') + 'Q' + pt([m[0] + nx, m[1] + ny]) + ' ' + pt(q);
    }
  }
  return d;
}

/** A crown of engraved foliage: a lumpy outline of small scallops, leaf clumps that thicken on the side
    away from the light (the light comes from the upper left), and shade hatching there.
    Returns { line, fine, hatch, blob } path data. */
export function crown(cx, cy, rx, ry, r, { lumps = 7, scale = 5, leaves = 40, shade = 0.55, gap = 2.8, angle = -38 } = {}) {
  const blob = [];
  const K = 30;
  const ph = r() * 6;
  for (let i = 0; i < K; i++) {
    const a = (i / K) * Math.PI * 2;
    const w = 1 + 0.14 * Math.sin(a * lumps + ph) + 0.06 * Math.sin(a * (lumps * 2 + 1) + ph * 2) + r.pm(0.03);
    blob.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  const line = scallop(blob, scale, r);
  /* the shade of a point: 0 on the lit upper left, 1 on the far lower right */
  const sh = (x, y) => Math.max(0, Math.min(1, ((x - cx) / rx + (y - cy) / ry + 1.4) / 2.8));
  let fine = '';
  let placed = 0;
  for (let t = 0; t < leaves * 6 && placed < leaves; t++) {
    const x = cx + r.pm(rx), y = cy + r.pm(ry);
    if (!inside([x, y], blob)) continue;
    if (r() > 0.25 + sh(x, y) * 0.9) continue;
    const s = scale * (0.5 + r() * 0.35);
    fine += `M${n(x - s)} ${n(y)}q${n(s)} ${n(-s * 1.1)} ${n(2 * s)} 0`;
    placed++;
  }
  const h = hatch(blob, { angle, gap, jit: 2, r, inset: 1.5, keep: (i, [x, y]) => sh(x, y) > 1 - shade });
  return { line, fine, hatch: h, blob };
}

/** Assemble a drawing: parts in the order the back draws them on (construction, line, fine, hatch).
    A part with `clip` is drawn inside that clip path (ids are prefixed per drawing, as all three backs
    sit in one page). */
export function svg({ w, h, id, title, desc, parts, clips = {} }) {
  /* a clip is path data, or { d, rule: 'evenodd' } to cut a shape out (a frame around it plus the shape) */
  const defs = Object.entries(clips).map(([k, c]) => `<clipPath id="${id}-${k}"><path${c.rule ? ` clip-rule="${c.rule}"` : ''} d="${c.d ?? c}"/></clipPath>`).join('');
  const body = parts
    .filter((p) => p.d)
    .map((p) => {
      const cls = (p.c || '').split(' ').filter(Boolean);
      const el = `<path${cls.length ? ` class="${cls.join(' ')}"` : ''}${cls.includes('d') ? '' : ' pathLength="1"'} d="${p.d}"/>`;
      return p.clip ? `<g clip-path="url(#${id}-${p.clip})">${el}</g>` : el;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><title>${title}</title><desc>${desc}</desc>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}
