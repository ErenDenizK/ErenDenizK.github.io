// The rules every icon is drawn from. Nothing in icons.mjs picks a stroke width, a margin or
// a corner radius by eye: it asks for them here. See README.md "Rules" for the reasoning and
// docs/research/2026-10-icons.md for the evidence.

/** Inter metrics, measured with fontTools on @fontsource/inter 5.3 (units per em 2048). */
export const INTER = {
  upm: 2048,
  cap: 1490, // OS/2 sCapHeight
  x: 1118, // OS/2 sxHeight
  ascent: 1984, // hhea = typo (USE_TYPO_METRICS set)
  descent: 494,
  // Vertical stem of "I", measured on the variable font instanced at each weight.
  stem: { 400: 190, 500: 228.5 },
}

/** Centre of the cap height above the baseline, in em. Equals the content-area centre in
 * Inter ((ascent - descent) / 2 = 745 = cap / 2), so flex `align-items: center` lands an
 * icon on the cap-height centre with no correction. */
export const CAP_CENTRE_EM = INTER.cap / 2 / INTER.upm // 0.3638
export const X_CENTRE_EM = INTER.x / 2 / INTER.upm // 0.2729

/** Newsreader (display face) metrics, @fontsource-variable/newsreader 5.3 (upm 2000). Its
 * content-area centre (0.235em) sits 0.1em below its cap-height centre (0.335em), so an
 * icon beside a serif title needs that correction (icons.css `.on-serif`). */
export const NEWSREADER = { upm: 2000, cap: 1340, x: 852, ascent: 1470, descent: 530 }
export const SERIF_CAP_CENTRE_EM = NEWSREADER.cap / 2 / NEWSREADER.upm // 0.335
export const SERIF_LIFT_EM =
  SERIF_CAP_CENTRE_EM - (NEWSREADER.ascent - NEWSREADER.descent) / 2 / NEWSREADER.upm // 0.1

/** Each icon size is drawn for a text size it sits beside (the site's type scale). */
export const PAIRED_TEXT = { 16: 15, 20: 18, 24: 22 }

/** UI weights the icons follow: the label weight beside them. */
export const WEIGHTS = { regular: 400, medium: 500 }

const quarter = (v) => Math.round(v * 4) / 4

/** Stroke width = the Inter stem at the paired text size and weight, rounded to 0.25px.
 * regular: 16 → 1.5, 20 → 1.75, 24 → 2; medium: 16 → 1.75, 20 → 2, 24 → 2.5. */
export function strokeFor(size, weight) {
  const em = INTER.stem[WEIGHTS[weight]] / INTER.upm
  return quarter(em * PAIRED_TEXT[size])
}

/** Optical-size table: a smaller canvas spends more of itself on the drawing, keeps
 * features larger relative to the canvas, and simplifies. Values are fractions of the
 * live half-size H unless named in px. */
export const OPTICAL = {
  16: { margin: 1, arrowSpan: 0.86, head: 0.48, chevron: 0.62, cross: 0.66, plus: 0.84 },
  20: { margin: 1.5, arrowSpan: 0.84, head: 0.46, chevron: 0.6, cross: 0.64, plus: 0.82 },
  24: { margin: 2, arrowSpan: 0.82, head: 0.45, chevron: 0.58, cross: 0.62, plus: 0.8 },
}

/** Pixel grid the stroke edges snap to. 0.5 = one device pixel at 2x (Mac, most phones);
 * at 3x a quarter-pixel error is invisible. */
export const GRID = 0.5

/**
 * The drawing context handed to each icon. All coordinates are canvas px.
 * - S: canvas size; w: stroke width; c: centre; H: live half-size, measured to the stroke
 *   centre line, so a shape drawn to ±H has its outer edge exactly at the margin.
 * - snap(v): centre-line coordinate whose outer stroke edge lands on the grid.
 * - r: corner radius for 90° corners on shapes at least 8px (one stroke width, min 1px),
 *   rs for smaller shapes (half that).
 */
export function context(size, weight) {
  const w = strokeFor(size, weight)
  const o = OPTICAL[size]
  const S = size
  const c = S / 2
  const H = c - o.margin - w / 2
  // Snap the edge that faces away from the centre, measured from the centre, so mirrored
  // pairs stay mirrored and the silhouette is the crisp part. The centre axis is exact:
  // a symmetric icon is never pushed off centre to reach the grid.
  const snap = (v) => {
    const d = v - c
    if (Math.abs(d) < 1e-9) return c
    const e = Math.round((Math.abs(d) + w / 2) / GRID) * GRID
    return c + Math.sign(d) * Math.max(0, e - w / 2)
  }
  const r = Math.max(1, w)
  return { S, w, c, H, o, snap, r, rs: r / 2, size, weight }
}

// ---------------------------------------------------------------------------------------
// Primitives. Each returns { d, fill, segs } where segs is the flattened centre line (for
// the ink measurement) and fill marks a solid shape (filled and stroked, so its corners get
// the same round join as every outline).

const fmt = (v) => {
  const n = Math.round(v * 1000) / 1000
  return Object.is(n, -0) ? '0' : String(n)
}

/** Open or closed polyline with round caps and joins, optional fillet radius per corner. */
export function line(pts, { closed = false, radius = 0, fill = false } = {}) {
  const n = pts.length
  const corner = (i) => (Array.isArray(radius) ? radius[i] : radius) || 0
  const out = []
  const segs = []
  let prev = null
  const add = (p) => {
    if (prev) segs.push([prev, p])
    prev = p
  }
  const vec = (a, b) => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l = Math.hypot(dx, dy)
    return [dx / l, dy / l, l]
  }
  const pieces = []
  for (let i = 0; i < n; i++) {
    const P = pts[i]
    const hasPrev = closed || i > 0
    const hasNext = closed || i < n - 1
    const rr = corner(i)
    if (!rr || !hasPrev || !hasNext) {
      pieces.push({ type: 'pt', p: P })
      continue
    }
    const A = pts[(i - 1 + n) % n]
    const B = pts[(i + 1) % n]
    const [ux, uy, la] = vec(P, A)
    const [vx, vy, lb] = vec(P, B)
    const cos = ux * vx + uy * vy
    const theta = Math.acos(Math.max(-1, Math.min(1, cos)))
    let t = rr / Math.tan(theta / 2)
    // A segment shared with another corner gives each corner half; a segment that runs to
    // an open end can be used up entirely (the end then sits on the fillet's tangent).
    const endA = !closed && i - 1 === 0
    const endB = !closed && i + 1 === n - 1
    t = Math.min(t, endA ? la : la / 2, endB ? lb : lb / 2)
    const rad = t * Math.tan(theta / 2)
    const p1 = [P[0] + ux * t, P[1] + uy * t]
    const p2 = [P[0] + vx * t, P[1] + vy * t]
    const cross = ux * vy - uy * vx
    pieces.push({ type: 'arc', p1, p2, rad, sweep: cross < 0 ? 1 : 0, P, u: [ux, uy], v: [vx, vy] })
  }
  const start = pieces[0].type === 'pt' ? pieces[0].p : pieces[0].p2
  out.push(`M${fmt(start[0])} ${fmt(start[1])}`)
  add(start)
  const order = closed ? [...pieces.slice(1), pieces[0]] : pieces.slice(1)
  for (const pc of order) {
    if (pc.type === 'pt') {
      out.push(`L${fmt(pc.p[0])} ${fmt(pc.p[1])}`)
      add(pc.p)
    } else {
      // Skip a zero-length run when the fillet starts where the path already is (svgo
      // would otherwise turn it into a stray close-path).
      if (Math.hypot(pc.p1[0] - prev[0], pc.p1[1] - prev[1]) > 1e-6) {
        out.push(`L${fmt(pc.p1[0])} ${fmt(pc.p1[1])}`)
        add(pc.p1)
      }
      out.push(`A${fmt(pc.rad)} ${fmt(pc.rad)} 0 0 ${pc.sweep} ${fmt(pc.p2[0])} ${fmt(pc.p2[1])}`)
      // flatten the fillet as a quadratic through the corner (close enough for measuring)
      for (let k = 1; k <= 6; k++) {
        const s = k / 6
        const q = [
          (1 - s) * (1 - s) * pc.p1[0] + 2 * (1 - s) * s * pc.P[0] + s * s * pc.p2[0],
          (1 - s) * (1 - s) * pc.p1[1] + 2 * (1 - s) * s * pc.P[1] + s * s * pc.p2[1],
        ]
        add(q)
      }
    }
  }
  if (closed) {
    out.push('Z')
    add(start)
  }
  return { d: out.join(''), fill, segs, poly: closed ? pts : null }
}

export function rect(x, y, w, h, r) {
  return line(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    { closed: true, radius: r },
  )
}

export function circle(cx, cy, r, { fill = false } = {}) {
  const d = `M${fmt(cx - r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx + r)} ${fmt(cy)}A${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx - r)} ${fmt(cy)}Z`
  const segs = []
  const N = 48
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * 2 * Math.PI
    const a1 = ((i + 1) / N) * 2 * Math.PI
    segs.push([
      [cx + r * Math.cos(a0), cy + r * Math.sin(a0)],
      [cx + r * Math.cos(a1), cy + r * Math.sin(a1)],
    ])
  }
  return { d, fill, segs, disc: fill ? [cx, cy, r] : null }
}

/** Translate primitives (used by optical centring). */
export function shift(prims, dx, dy) {
  return prims.map((p) => {
    const d = p.d.replace(/([MLA])([^MLAZ]*)/g, (m, cmd, args) => {
      const n = args.trim().split(/[\s,]+/).map(Number)
      if (cmd === 'A') {
        n[5] += dx
        n[6] += dy
      } else {
        n[0] += dx
        n[1] += dy
      }
      return cmd + n.map(fmt).join(' ')
    })
    const mv = (q) => [q[0] + dx, q[1] + dy]
    return {
      ...p,
      d,
      segs: p.segs.map(([a, b]) => [mv(a), mv(b)]),
      poly: p.poly && p.poly.map(mv),
      disc: p.disc && [p.disc[0] + dx, p.disc[1] + dy, p.disc[2]],
    }
  })
}

// ---------------------------------------------------------------------------------------
// Ink measurement: coverage sampled on a 1/8 px grid. Gives the ink area (visual weight,
// Lucide's "blur test" as a number) and the ink centroid (for optical centring).

function distSeg(px, py, [a, b]) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  let t = l2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy)
}

function inPoly(px, py, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function measure(prims, S, w) {
  const step = 1 / 8
  let area = 0
  let sx = 0
  let sy = 0
  let minX = S
  let minY = S
  let maxX = 0
  let maxY = 0
  const h = w / 2
  for (let y = step / 2; y < S; y += step) {
    for (let x = step / 2; x < S; x += step) {
      let hit = false
      for (const p of prims) {
        if (p.disc && Math.hypot(x - p.disc[0], y - p.disc[1]) <= p.disc[2] + h) hit = true
        else if (p.fill && p.poly && inPoly(x, y, p.poly)) hit = true
        else for (const s of p.segs) if (distSeg(x, y, s) <= h) { hit = true; break }
        if (hit) break
      }
      if (hit) {
        area += step * step
        sx += x * step * step
        sy += y * step * step
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  return {
    area,
    cx: sx / area,
    cy: sy / area,
    box: [minX - step / 2, minY - step / 2, maxX + step / 2, maxY + step / 2],
  }
}

export { fmt }
