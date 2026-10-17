// The engraving kit for the project scenes (engraving guide 2026-10-17, §1.10). Every line is a filled,
// tapered shape (a burin line swells and ends thin), tone is hatching that follows the form, and a plate
// knows its own focus: its ink fades to nothing over the top and bottom of its box and it keeps the text's
// clear zones empty. Seeded and deterministic: a rebuild is byte-identical.
//
// Units are the plate's user units; the scenes are drawn so that a unit is about one CSS pixel where the
// plate is shown (desktop: 1600 units over 1526 px at 1440; phone: 480 units over 480 px).

export function rng(seed) {
  let s = seed >>> 0 || 1;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  r.pm = (a) => (r() - 0.5) * 2 * a;
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, x) => { if (a === b) return (b >= a ? x >= a : x <= a) ? 1 : 0; const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const len = (a) => Math.hypot(a[0], a[1]);

/** Point in polygon (even-odd), for a list of rings. */
export function inside(p, rings) {
  let c = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}

/** Parameters (0..1) where segment a-b crosses the rings' edges. */
function crossings(a, b, rings) {
  const out = [];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const p = ring[j], q = ring[i];
      const ex = q[0] - p[0], ey = q[1] - p[1];
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((p[0] - a[0]) * ey - (p[1] - a[1]) * ex) / den;
      const u = ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / den;
      if (t >= 0 && t <= 1 && u >= 0 && u < 1) out.push(t);
    }
  }
  return out.sort((x, y) => x - y);
}

/** The parts of segment a-b inside the rings (even-odd), as [t0, t1] pairs. */
export function clipSeg(a, b, rings) {
  const ts = [0, ...crossings(a, b, rings), 1];
  const out = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    if (t1 - t0 < 1e-6) continue;
    if (inside(mix(a, b, (t0 + t1) / 2), rings)) out.push([t0, t1]);
  }
  return out;
}

const bbCache = new WeakMap();
export function bbOf(rg) { let b = bbCache.get(rg); if (!b) { b = bbox(rg); bbCache.set(rg, b); } return b; }
/** Is a point inside any of the rings (each tested alone)? */
export function hidden(p, rings) {
  for (const rg of rings) { const b = bbOf(rg); if (p[0] < b[0] || p[0] > b[2] || p[1] < b[1] || p[1] > b[3]) continue; if (inside(p, [rg])) return true; }
  return false;
}

/** Sutherland-Hodgman: a ring clipped to a rectangle [x0, y0, x1, y1]. */
export function clipRing(pts, [x0, y0, x1, y1]) {
  let out = pts;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1]]];
  for (const [inn, cut] of edges) {
    const src = out; out = [];
    for (let i = 0; i < src.length; i++) {
      const a = src[(i + src.length - 1) % src.length], b = src[i];
      if (inn(b)) { if (!inn(a)) out.push(cut(a, b)); out.push(b); } else if (inn(a)) out.push(cut(a, b));
    }
    if (!out.length) return out;
  }
  return out;
}
/** Liang-Barsky: a polyline cut to a rectangle, as a list of polylines. */
export function clipLine(pts, [x0, y0, x1, y1]) {
  const outs = []; let cur = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    let t0 = 0, t1 = 1, ok = true;
    for (const [p, q] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
      if (p === 0) { if (q < 0) { ok = false; break; } continue; }
      const t = q / p;
      if (p < 0) { if (t > t1) { ok = false; break; } if (t > t0) t0 = t; } else { if (t < t0) { ok = false; break; } if (t < t1) t1 = t; }
    }
    if (!ok) { if (cur.length > 1) outs.push(cur); cur = []; continue; }
    const A = [a[0] + dx * t0, a[1] + dy * t0], B = [a[0] + dx * t1, a[1] + dy * t1];
    if (!cur.length || t0 > 0) { if (cur.length > 1) outs.push(cur); cur = [A]; }
    cur.push(B);
    if (t1 < 1) { outs.push(cur); cur = []; }
  }
  if (cur.length > 1) outs.push(cur);
  return outs;
}

export function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

/** Resample a polyline at a fixed step (keeps the corners). */
export function resample(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const d = len(sub(b, a));
    const n = Math.max(1, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) out.push(mix(a, b, k / n));
  }
  return out;
}

/** Ramer-Douglas-Peucker. */
export function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [i, j] = st.pop();
    const a = pts[i], b = pts[j];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
    let m = -1, md = tol;
    for (let k = i + 1; k < j; k++) {
      const d = L < 1e-6 ? Math.hypot(pts[k][0] - a[0], pts[k][1] - a[1]) : Math.abs((pts[k][0] - a[0]) * dy - (pts[k][1] - a[1]) * dx) / L;
      if (d > md) { md = d; m = k; }
    }
    if (m >= 0) { keep[m] = 1; st.push([i, m], [m, j]); }
  }
  return pts.filter((_, k) => keep[k]);
}

/** Catmull-Rom through points, as a polyline. */
export function spline(pts, step = 4, closed = false) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const n = Math.max(2, Math.ceil(len(sub(p2, p1)) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(closed ? pts[0] : pts[pts.length - 1]);
  return out;
}

/** Points of an elliptical arc (screen degrees, clockwise). */
export function arcPts(cx, cy, rx, ry, a0, a1, step = 4, rot = 0) {
  const n = Math.max(3, Math.ceil((Math.abs(a1 - a0) * Math.PI / 180 * Math.max(rx, ry)) / step));
  const c = Math.cos(rot), s = Math.sin(rot), out = [];
  for (let k = 0; k <= n; k++) {
    const a = ((a0 + (a1 - a0) * (k / n)) * Math.PI) / 180;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

const num = (v) => {
  const r = Math.round(v * 10) / 10;
  let s = (Object.is(r, -0) ? 0 : r).toString();
  if (s.startsWith('0.')) s = s.slice(1); else if (s.startsWith('-0.')) s = '-' + s.slice(2);
  return s;
};
/** Path data with relative moves, compact: "M x y l dx dy ... z". */
function ring(pts) {
  let d = '';
  let px = Math.round(pts[0][0] * 10), py = Math.round(pts[0][1] * 10);
  let first = true, n = 0;
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(pts[i][0] * 10), y = Math.round(pts[i][1] * 10);
    const dx = (x - px) / 10, dy = (y - py) / 10;
    if (dx === 0 && dy === 0) continue;
    const a = num(dx), b = num(dy);
    d += (first || a.startsWith('-') ? '' : ' ') + a + (b.startsWith('-') ? '' : ' ') + b;
    first = false; n++;
    px = x; py = y;
  }
  if (n < 2) return '';
  /* the shape's start and end in tenths, so that the next shape can move relative to this one's end */
  return { x: Math.round(pts[0][0] * 10), y: Math.round(pts[0][1] * 10), ex: px, ey: py, d };
}

/**
 * A plate: layers of filled shapes, with its fade and its clear zones.
 * opts: { w, h, seed, fade: [top, bottom] (fractions of h), clear: [{x0, y0, x1, y1, f}], minW, threads: [{y0, y1}] }
 */
export function plate(opts) {
  const { w, h } = opts;
  const r = rng(opts.seed ?? 7);
  const fadeTop = (opts.fade?.[0] ?? 0.18) * h, fadeBot = (opts.fade?.[1] ?? 0.18) * h;
  const clear = opts.clear ?? [];
  const minW = (opts.minW ?? 0.32) * (opts.wk ?? 1);
  const layers = {};
  const stats = {};
  /* a phone master is one layer: every part of the scene goes into it */
  const L = (name) => (layers[opts.one && name !== 'debug' ? opts.one : name] ??= []);

  /** Hatching kept inside a quiet zone (a part the page covers at rest: less tone, same contours). */
  const quietAt = (x, y) => { for (const q of opts.quiet ?? []) if (x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1) return q.keep; return 1; };

  /** How much ink a point may carry: 0 in the clear zones and at the box's top and bottom edges. */
  function room(x, y, free = false) {
    let m = free ? 1 : Math.pow(smooth(0, fadeTop, y) * smooth(h, h - fadeBot, y), opts.fadePow ?? 1.7);
    for (const c of clear) {
      const f = c.f ?? 24;
      const dx = Math.max(c.x0 - x, 0, x - c.x1), dy = Math.max(c.y0 - y, 0, y - c.y1);
      m *= smooth(0, f, Math.hypot(dx, dy));
    }
    return m;
  }

  /**
   * One burin line along a polyline. w: body width; o: { taper: length of each end's taper (units, or
   * 'lens' for a full lens), e: end width as a fraction, occl: rings that hide it, free: ignore the fade,
   * keep: ignore the clear zones too, step }
   */
  const VIEW = [-30, -30, w + 30, h + 30];
  function line(layer, pts, wBody, o = {}) {
    if (!pts || pts.length < 2) return;
    if (pts.some(([x, y]) => x < VIEW[0] || y < VIEW[1] || x > VIEW[2] || y > VIEW[3])) {
      for (const part of clipLine(pts, VIEW)) line1(layer, part, wBody, o);
      return;
    }
    line1(layer, pts, wBody, o);
  }
  function line1(layer, pts, wBody, o) {
    wBody *= opts.wk ?? 1;
    const step = o.step ?? 2.5;
    const P = resample(pts, step);
    const occ = o.occl && o.occl.length ? o.occl : null;
    let near = null;
    if (occ) {
      const [lx0, ly0, lx1, ly1] = bbox(P);
      near = occ.filter((rg) => { const b = bbOf(rg); return b[0] <= lx1 && b[2] >= lx0 && b[1] <= ly1 && b[3] >= ly0; });
      if (!near.length) near = null;
    }
    const m = P.map(([x, y]) => (o.keep ? 1 : room(x, y, o.free)) * (near && hidden([x, y], near) ? 0 : 1));
    if (o.wf) for (let i = 0; i < P.length; i++) m[i] *= o.wf(P[i], i / (P.length - 1));
    /* runs where the line is visible and wide enough */
    let run = [];
    const flush = () => { if (run.length >= 2) stroke(layer, run, wBody, o); run = []; };
    for (let i = 0; i < P.length; i++) {
      if (m[i] * wBody >= minW) run.push([P[i][0], P[i][1], m[i]]);
      else flush();
    }
    flush();
  }

  function stroke(layer, run, wBody, o) {
    let total = 0;
    const s = [0];
    for (let i = 1; i < run.length; i++) { total += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]); s.push(total); }
    if (total < (o.minLen ?? 1.2)) return;
    const e = o.e ?? 0.3;
    const tl = o.taper === 'lens' || o.taper == null ? total / 2 : Math.min(o.taper, total / 2);
    const widths = run.map((p, i) => {
      const t = tl <= 0 ? 1 : Math.min(smooth(0, tl, s[i]), smooth(0, tl, total - s[i]));
      return wBody * p[2] * (e + (1 - e) * Math.sqrt(t));
    });
    const c = simplify(run.map((p, i) => [p[0], p[1], i]), o.tol ?? 0.2);
    const left = [], right = [];
    for (let k = 0; k < c.length; k++) {
      const i = c[k][2];
      const a = c[Math.max(0, k - 1)], b = c[Math.min(c.length - 1, k + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const hw = widths[i] / 2;
      left.push([c[k][0] - dy * hw, c[k][1] + dx * hw]);
      right.push([c[k][0] + dy * hw, c[k][1] - dx * hw]);
    }
    /* a straight piece: one lens (ends, and the widest point on each side) */
    if (c.length === 2) {
      const a = c[0], b = c[1];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const wm = Math.max(...widths) / 2, w0 = widths[0] / 2, w1 = widths[widths.length - 1] / 2;
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const pts = (w0 < 0.12 && w1 < 0.12)
        ? [a, [mid[0] - dy * wm, mid[1] + dx * wm], b, [mid[0] + dy * wm, mid[1] - dx * wm]]
        : [[a[0] - dy * w0, a[1] + dx * w0], [mid[0] - dy * wm, mid[1] + dx * wm], [b[0] - dy * w1, b[1] + dx * w1],
          [b[0] + dy * w1, b[1] - dx * w1], [mid[0] + dy * wm, mid[1] - dx * wm], [a[0] + dy * w0, a[1] - dx * w0]];
      { const d = ring(pts); if (d) L(layer).push(d); }
    } else {
      const d = ring([...left, ...right.reverse()]); if (d) L(layer).push(d);
    }
    stats[layer] = (stats[layer] ?? 0) + total;
  }

  /** A short straight lens stroke. */
  const seg = (layer, a, b, wBody, o = {}) => line(layer, [a, b], wBody, o);

  /**
   * Hatching inside rings. o: { angle (deg) | vp: [x, y], s: spacing, w, jit, holes: rings, occl: rings,
   * inset, taper, wf, drop(x, y) -> 0..1 chance to keep }
   */
  function hatch(layer, rings, o) {
    const R = (Array.isArray(rings[0][0]) ? rings : [rings]).map((rg) => clipRing(rg, VIEW)).filter((rg) => rg.length > 2);
    if (!R.length) return;
    const all = [...R, ...(o.holes ?? [])];
    const [x0, y0, x1, y1] = bbox(R.flat());
    const s = o.s ?? 6, jit = o.jit ?? 0.12;
    const segs = [];
    if (o.vp) {
      const [vx, vy] = o.vp;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const dist = Math.hypot(cx - vx, cy - vy);
      const angs = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => Math.atan2(y - vy, x - vx));
      let a0 = Math.min(...angs), a1 = Math.max(...angs);
      if (a1 - a0 > Math.PI) { const n = angs.map((a) => (a < 0 ? a + 2 * Math.PI : a)); a0 = Math.min(...n); a1 = Math.max(...n); }
      const da = s / dist;
      const far = 2 * Math.hypot(x1 - x0, y1 - y0) + dist * 2;
      for (let a = a0 + da * r(); a <= a1; a += da * (1 + r.pm(jit))) {
        segs.push([[vx, vy], [vx + Math.cos(a) * far, vy + Math.sin(a) * far]]);
      }
    } else {
      const ang = ((o.angle ?? 45) * Math.PI) / 180;
      const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      const corners = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]];
      const ps = corners.map(([x, y]) => x * nx + y * ny), qs = corners.map(([x, y]) => x * dx + y * dy);
      const p0 = Math.min(...ps), p1 = Math.max(...ps), q0 = Math.min(...qs) - 2, q1 = Math.max(...qs) + 2;
      for (let p = p0 + s * (o.phase ?? r()); p <= p1; p += s * (1 + r.pm(jit))) {
        const aj = r.pm(o.aj ?? 0.008);
        const ddx = dx - aj * dy, ddy = dy + aj * dx;
        const cxp = nx * p, cyp = ny * p;
        segs.push([[cxp + ddx * q0, cyp + ddy * q0], [cxp + ddx * q1, cyp + ddy * q1]]);
      }
    }
    for (const [a, b] of segs) {
      for (const [t0, t1] of clipSeg(a, b, all)) {
        const A = mix(a, b, t0), B = mix(a, b, t1);
        const Ln = len(sub(B, A));
        const ins = Math.min(o.inset ?? 1.2, Ln / 4);
        const i0 = (ins * (0.4 + r())) / Ln, i1 = (ins * (0.4 + r())) / Ln;
        const a2 = mix(A, B, i0), b2 = mix(A, B, 1 - i1);
        { const mm = mix(a2, b2, 0.5); if (o.drop && r() > o.drop(mm[0], mm[1])) continue; if (r() > quietAt(mm[0], mm[1])) continue; }
        line(layer, [a2, b2], (o.w ?? 0.7) * (1 + r.pm(0.12)), { occl: o.occl, taper: o.taper ?? 'lens', e: o.e ?? 0.25, wf: o.wf, free: o.free });
      }
    }
  }

  /** Tone by line: 1 single, 2 cross, 3 cross and a dense third set. dir: { angle | vp }, cross angle. */
  function tone(layer, rings, level, o = {}) {
    if (level <= 0) return;
    const base = { ...o, s: o.s ?? (level >= 3 ? 4.2 : 5.6), w: o.w ?? 0.62 };
    hatch(layer, rings, base);
    if (level >= 2) hatch(layer, rings, { ...o, vp: o.vp2, angle: o.angle2 ?? (o.angle ?? 0) + 52, s: o.s2 ?? 6.2, w: (o.w ?? 0.62) * 0.85 });
    if (level >= 3) hatch(layer, rings, { ...o, vp: undefined, angle: o.angle3 ?? (o.angle ?? 0) - 38, s: 4.6, w: (o.w ?? 0.62) * 0.8, holes: o.deep ? [...(o.holes ?? [])] : o.holes, ...(o.deep ? {} : {}) });
  }

  /** Dot-and-lozenge stipple inside rings; dens(x, y) in 0..1 scales the chance of a dot. */
  function stipple(layer, rings, n, o = {}) {
    const R = (Array.isArray(rings[0][0]) ? rings : [rings]).map((rg) => clipRing(rg, VIEW)).filter((rg) => rg.length > 2);
    if (!R.length) return;
    const [x0, y0, x1, y1] = bbox(R.flat());
    const sz = o.size ?? 0.7;
    let made = 0, tries = 0;
    const pts = [];
    const minD = o.minD ?? 2.6;
    while (made < n && tries < n * 30) {
      tries++;
      const p = [lerp(x0, x1, r()), lerp(y0, y1, r())];
      if (!inside(p, R)) continue;
      if (o.occl && hidden(p, o.occl)) continue;
      const m = room(p[0], p[1], o.free) * (o.dens ? o.dens(p[0], p[1]) : 1);
      if (r() > m) continue;
      if (pts.some((q) => Math.abs(q[0] - p[0]) < minD && Math.abs(q[1] - p[1]) < minD)) continue;
      pts.push(p); made++;
      const k = sz * (0.7 + r() * 0.6);
      { const d = ring([[p[0] - k, p[1]], [p[0], p[1] - k * 0.8], [p[0] + k, p[1]], [p[0], p[1] + k * 0.8]]); if (d) L(layer).push(d); }
    }
  }

  /** A filled shape (for the deepest accents only: a doorway's dark, a cast-shadow core). */
  function solid(layer, pts) { const d = ring(pts); if (d) L(layer).push(d); }

  function svg({ title, desc, places, extra = '' }) {
    /* one path a layer; each filled shape is left open (a fill closes itself) and starts with a move
       relative to where the last one ended */
    const join = (v) => {
      let out = '', cx = null, cy = null;
      for (const r of v) {
        if (cx === null) out += 'M' + num(r.x / 10) + ' ' + num(r.y / 10);
        else { const a = num((r.x - cx) / 10), b = num((r.y - cy) / 10); out += 'm' + a + (b.startsWith('-') ? '' : ' ') + b; }
        out += 'l' + r.d;
        cx = r.ex; cy = r.ey;
      }
      return out;
    };
    const groups = Object.entries(layers).filter(([, v]) => v.length).map(([k, v]) => `<g id="${k}"><path d="${join(v)}"/></g>`).join('\n');
    const pl = places && places.length
      ? `\n<g id="places" display="none"><path d="${places.map(([x, y, rx = 34, ry = 9]) => `M${num(x - rx)} ${num(y)}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`).join('')}"/></g>`
      : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" data-ink="fill" role="img" aria-hidden="true">\n<title>${title}</title>\n<desc>${desc}</desc>\n${groups}${pl}${extra}\n</svg>\n`;
  }

  return { w, h, r, room, line, seg, hatch, tone, stipple, solid, svg, layers, stats };
}

/**
 * A pinhole camera with a shift lens (verticals stay vertical, the horizon sits where the plate needs it).
 * World: x right, y up, z forward. yaw turns the view to the right (radians).
 */
export function camera({ f, cx, hy, eye = [0, 1.6, 0], yaw = 0 }) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  function view([x, y, z]) {
    const X = x - eye[0], Y = y - eye[1], Z = z - eye[2];
    return [X * c - Z * s, Y, X * s + Z * c];
  }
  function project(p) {
    const [X, Y, Z] = view(p);
    const zz = Math.max(Z, 0.05);
    return [cx + (f * X) / zz, hy - (f * Y) / zz, Z];
  }
  const P = (p) => { const q = project(p); return [q[0], q[1]]; };
  /** The vanishing point of a horizontal direction (angle a from +z toward +x), with optional slope. */
  function vp(a, slope = 0) {
    const d = [Math.sin(a), slope, Math.cos(a)];
    const [X, Y, Z] = [d[0] * c - d[2] * s, d[1], d[0] * s + d[2] * c];
    return [cx + (f * X) / Z, hy - (f * Y) / Z];
  }
  return { f, cx, hy, project, P, view, vp };
}
