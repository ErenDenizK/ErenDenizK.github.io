// Primitives for log illustrations. Each returns SVG markup (a string), or an object with
// `svg` and the geometry other primitives attach to (a box's edges). Nothing here chooses a
// colour or a size: rules.mjs does. See README.md for the rules and a worked example.

import { INK, ACCENT, ARROW, RADIUS, STROKE, TYPE, FAMILY, DOT, HAND, UNIT, textWidth, crisp, css } from './rules.mjs'

const f = (v) => {
  const n = Math.round(v * 100) / 100
  return Object.is(n, -0) ? '0' : String(n)
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const join = (parts) => parts.map((p) => (p && typeof p === 'object' ? p.svg : p || '')).join('')

export const warnings = []
const warn = (m) => warnings.push(m)

// ------------------------------------------------------------------------------------------
// Stylesheet. One copy goes in the page (out/illustrations.css); a standalone .svg carries
// its own. Every value is a CSS variable with the token as fallback (rules.mjs INK/ACCENT).

export function stylesheet() {
  const t = (name, r) =>
    `.il .il-${name}{font:${r.weight} ${r.size}px/1 ${css(FAMILY[r.family])};fill:${css(INK[r.fill])};${r.tabular ? 'font-variant-numeric:tabular-nums;' : ''}letter-spacing:${r.size <= 13 ? '0.005em' : '0'}}`
  return [
    `.il{display:block;overflow:visible;font-family:${css(FAMILY.ui)};--il-accent:${css(ACCENT.log)}}`,
    `.il .il-hair{fill:none;stroke:${css(INK.rule)};stroke-width:${STROKE.hair}}`,
    `.il .il-line{fill:none;stroke:${css(INK.ink3)};stroke-width:${STROKE.line};stroke-linecap:round;stroke-linejoin:round}`,
    `.il .il-line.il-a{stroke:var(--il-accent)}`,
    `.il .il-line.il-dash{stroke-dasharray:1 5;stroke:${css(INK.ink4)}}`,
    `.il .il-box{fill:${css(INK.wash)};stroke:${css(INK.rule)};stroke-width:${STROKE.hair}}`,
    `.il .il-box.il-a{fill:color-mix(in srgb,var(--il-accent) 9%,transparent);stroke:var(--il-accent);stroke-width:${STROKE.line}}`,
    `.il .il-box.il-dash{fill:none;stroke:${css(INK.ink4)};stroke-dasharray:3 4}`,
    `.il .il-dot{fill:var(--il-accent)}`,
    `.il .il-ring{fill:none;stroke:var(--il-accent);stroke-width:${STROKE.line}}`,
    `.il .il-dot.il-later{fill:${css(INK.ground)};stroke:${css(INK.ink4)};stroke-width:${STROKE.line}}`,
    `.il .il-bar{fill:${css(INK.ink4)}}`,
    `.il .il-bar.il-a{fill:var(--il-accent)}`,
    `.il .il-hand{fill:var(--il-accent)}`,
    `.il .il-frame{fill:none;stroke:rgba(255,255,255,0.1);stroke-width:${STROKE.hair}}`,
    t('label', TYPE.label),
    t('name', TYPE.name),
    t('note', TYPE.note),
    t('num', TYPE.num),
    `.il .il-a-text{fill:var(--il-accent)}`,
    `.il .il-knock{paint-order:stroke;stroke:${css(INK.ground)};stroke-width:6px;stroke-linejoin:round}`,
    // Small plates (essay thumbnails in the index) carry no text.
    `.il.il-plate{pointer-events:none}`,
  ].join('\n')
}

// ------------------------------------------------------------------------------------------
// The figure: one <svg> per width. `accent` names a key of ACCENT. Title and desc are the
// accessible name and description (alt text); the visible caption lives in the page.

export function figure({ id, width, height, accent = 'log', title, desc, body, plate = false, standalone = false }) {
  const a = ACCENT[accent] || ACCENT.log
  const style = standalone ? `<style>${stylesheet()}</style>` : ''
  const labelled = plate ? 'aria-hidden="true"' : `role="img" aria-labelledby="${id}-t ${id}-d"`
  const meta = plate ? '' : `<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(desc)}</desc>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="il${plate ? ' il-plate' : ''}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" ${labelled} style="--il-accent:${css(a)}" focusable="false">` +
    meta +
    style +
    join(Array.isArray(body) ? body : [body]) +
    `</svg>`
  )
}

// ------------------------------------------------------------------------------------------
// Text. role is a key of TYPE; anchor start|middle|end. `lines` stack at 1.35 line height.

export function text(x, y, str, { role = 'label', anchor = 'start', accent = false, knock = false } = {}) {
  const lines = Array.isArray(str) ? str : [str]
  const r = TYPE[role]
  const lh = Math.round(r.size * 1.35)
  const cls = `il-${role}${accent ? ' il-a-text' : ''}${knock ? ' il-knock' : ''}`
  return lines
    .map((l, i) => `<text class="${cls}" x="${f(x)}" y="${f(y + i * lh)}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${esc(l)}</text>`)
    .join('')
}

// ------------------------------------------------------------------------------------------
// Box: a rounded rectangle with a name (15/500) and an optional label (13) under it.
// Returns geometry: edge points already pulled back by ARROW.gap, so an arrow drawn from
// box.right to other.left never touches either outline.

export function box({ x, y, w, h, name, label, emph = false, dashed = false, align = 'middle' }) {
  const cls = `il-box${emph ? ' il-a' : ''}${dashed ? ' il-dash' : ''}`
  const parts = [`<rect class="${cls}" x="${f(crisp(x))}" y="${f(crisp(y))}" width="${f(w)}" height="${f(h)}" rx="${RADIUS.box}"/>`]
  const tx = align === 'start' ? x + 2 * UNIT : x + w / 2
  const anchor = align === 'start' ? 'start' : 'middle'
  const hasLabel = !!label
  const nameY = y + h / 2 + (hasLabel ? -3 : 5)
  if (name) {
    parts.push(text(tx, nameY, name, { role: 'name', anchor }))
    const tw = textWidth(name, TYPE.name.size, 500)
    if (tw > w - 2 * UNIT) warn(`box "${name}": name ~${Math.round(tw)}px is wider than ${w - 2 * UNIT}px`)
  }
  if (label) {
    parts.push(text(tx, nameY + 18, label, { role: 'label', anchor }))
    const tw = textWidth(label, TYPE.label.size)
    if (tw > w - 2 * UNIT) warn(`box "${name}": label ~${Math.round(tw)}px is wider than ${w - 2 * UNIT}px`)
  }
  const g = ARROW.gap
  return {
    svg: parts.join(''),
    x, y, w, h,
    left: [x - g, y + h / 2],
    right: [x + w + g, y + h / 2],
    top: [x + w / 2, y - g],
    bottom: [x + w / 2, y + h + g],
    at: (fx, fy) => [x + fx * w, y + fy * h],
  }
}

// ------------------------------------------------------------------------------------------
// Arrow: a polyline through `points` (2 or more), corners rounded by one grid step, ending in
// the icon set's arrowhead. `label` sits at the middle of the longest segment, knocked out
// of the ground so it can cross a line.

export function arrow({ points, accent = false, dashed = false, label, labelSide = 'above', head = true }) {
  const pts = points.map(([x, y]) => [crisp(x), crisp(y)])
  const r = UNIT
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]
    if (i < pts.length - 1) {
      const a = pts[i - 1], b = pts[i + 1]
      const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(b[0] - p[0], b[1] - p[1])
      const rr = Math.min(r, l1 / 2, l2 / 2)
      const p1 = [p[0] - ((p[0] - a[0]) / l1) * rr, p[1] - ((p[1] - a[1]) / l1) * rr]
      const p2 = [p[0] + ((b[0] - p[0]) / l2) * rr, p[1] + ((b[1] - p[1]) / l2) * rr]
      d += ` L${f(p1[0])} ${f(p1[1])} Q${f(p[0])} ${f(p[1])} ${f(p2[0])} ${f(p2[1])}`
    } else d += ` L${f(p[0])} ${f(p[1])}`
  }
  const cls = `il-line${accent ? ' il-a' : ''}${dashed ? ' il-dash' : ''}`
  const parts = [`<path class="${cls}" d="${d}"/>`]
  if (head) {
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]]
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
    const arm = (s) => [b[0] - ARROW.arm * Math.cos(ang + s * Math.PI / 4), b[1] - ARROW.arm * Math.sin(ang + s * Math.PI / 4)]
    const [h1, h2] = [arm(1), arm(-1)]
    parts.push(`<path class="il-line${accent ? ' il-a' : ''}" d="M${f(h1[0])} ${f(h1[1])} L${f(b[0])} ${f(b[1])} L${f(h2[0])} ${f(h2[1])}"/>`)
  }
  if (label) {
    let best = 0, bl = -1
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
      if (l > bl) { bl = l; best = i }
    }
    const [a, b] = [pts[best - 1], pts[best]]
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
    const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])
    if (vertical) parts.push(text(mx + (labelSide === 'left' ? -UNIT : UNIT), my + 4, label, { role: 'label', anchor: labelSide === 'left' ? 'end' : 'start' }))
    else parts.push(text(mx, labelSide === 'below' ? my + 18 : my - UNIT, label, { role: 'label', anchor: 'middle', knock: true }))
  }
  return parts.join('')
}

// ------------------------------------------------------------------------------------------
// Timeline. events: [{ at: 0..1, name, label, state: 'done' | 'now' | 'later', anchor }].
// Horizontal (wide) or vertical (narrow). The axis is solid up to "now", dotted after it:
// the future is drawn as not yet happened, never as a promise.

export function timeline({ x, y, length, events, vertical = false, start, end }) {
  const parts = []
  const nowAt = Math.max(0, ...events.filter((e) => e.state !== 'later').map((e) => e.at))
  const P = (t) => (vertical ? [x, y + t * length] : [x + t * length, y])
  const [a0, a1, a2] = [P(0), P(nowAt), P(1)]
  parts.push(`<path class="il-line" d="M${f(crisp(a0[0]))} ${f(crisp(a0[1]))} L${f(crisp(a1[0]))} ${f(crisp(a1[1]))}"/>`)
  parts.push(`<path class="il-line il-dash" d="M${f(crisp(a1[0]))} ${f(crisp(a1[1]))} L${f(crisp(a2[0]))} ${f(crisp(a2[1]))}"/>`)
  if (start) parts.push(vertical ? text(x - 2 * UNIT, y + 4, start, { role: 'label', anchor: 'end' }) : text(x, y - 2 * UNIT, start, { role: 'label' }))
  if (end) parts.push(vertical ? text(x - 2 * UNIT, y + length + 4, end, { role: 'label', anchor: 'end' }) : text(x + length, y - 2 * UNIT, end, { role: 'label', anchor: 'end' }))
  for (const e of events) {
    const [px, py] = P(e.at)
    if (e.state === 'now') parts.push(`<circle class="il-ring" cx="${f(px)}" cy="${f(py)}" r="${DOT.ring}"/>`)
    parts.push(`<circle class="il-dot${e.state === 'later' ? ' il-later' : ''}" cx="${f(px)}" cy="${f(py)}" r="${DOT.r}"/>`)
    if (vertical) {
      parts.push(text(px + 3 * UNIT, py + 5, e.name, { role: 'name' }))
      if (e.label) parts.push(text(px + 3 * UNIT, py + 27, e.label, { role: 'label' }))
    } else {
      const anchor = e.anchor || 'middle'
      parts.push(text(px, py + 4 * UNIT, e.name, { role: 'name', anchor }))
      if (e.label) parts.push(text(px, py + 4 * UNIT + 22, e.label, { role: 'label', anchor }))
    }
  }
  return parts.join('')
}

// ------------------------------------------------------------------------------------------
// Bars: one series, labelled directly (no legend, no gridlines). `highlight` is the index
// drawn in the accent; the rest are ink-4. Values are written above each bar.

export function bars({ x, y, w, h, data, highlight = -1, max }) {
  const n = data.length
  const gap = UNIT
  const slot = (w - gap * (n - 1)) / n
  // Bars are at most four grid steps wide, centred in their slot: a chart of a few months
  // must not turn into blocks of colour.
  const bw = Math.min(slot, 4 * UNIT)
  const top = max || Math.max(...data.map((d) => d.value))
  const parts = [`<path class="il-hair" d="M${f(x)} ${f(crisp(y + h))} H${f(x + w)}"/>`]
  data.forEach((d, i) => {
    const bh = top ? (d.value / top) * (h - 3 * UNIT) : 0
    const bx = x + i * (slot + gap) + (slot - bw) / 2
    if (bh > 0) parts.push(`<rect class="il-bar${i === highlight ? ' il-a' : ''}" x="${f(bx)}" y="${f(y + h - bh)}" width="${f(bw)}" height="${f(bh)}" rx="2"/>`)
    parts.push(text(bx + bw / 2, y + h - bh - UNIT, String(d.value), { role: 'num', anchor: 'middle' }))
    parts.push(text(bx + bw / 2, y + h + 2.5 * UNIT, d.label, { role: 'label', anchor: 'middle' }))
  })
  return parts.join('')
}

// ------------------------------------------------------------------------------------------
// Annotated screenshot frame. `href` is the image (a path at build, a data URI when inlined).
// notes: [{ at: [fx, fy] in the image (0..1), label, side: 'left' | 'right' }]: a dot on the
// spot, a hairline leader out to the side, the label beyond the frame's edge.

export function frame({ id, x, y, w, h, href, notes = [] }) {
  const parts = [
    `<clipPath id="${id}-clip"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${RADIUS.frame}"/></clipPath>`,
    `<image href="${esc(href)}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMin slice" clip-path="url(#${id}-clip)"/>`,
    `<rect class="il-frame" x="${f(x + 0.5)}" y="${f(y + 0.5)}" width="${f(w - 1)}" height="${f(h - 1)}" rx="${RADIUS.frame}"/>`,
  ]
  // Labels on one side keep at least three grid steps between baselines; a label pushed down
  // gets a leader that runs level to just past the frame, then bends to it.
  const placed = notes.map((n) => ({ ...n, px: x + n.at[0] * w, py: y + n.at[1] * h, right: n.side !== 'left' }))
  for (const side of [true, false]) {
    let last = -Infinity
    placed.filter((n) => n.right === side).sort((a, b) => a.py - b.py).forEach((n) => {
      n.ly = Math.max(n.py, last + 3 * UNIT)
      last = n.ly
    })
  }
  for (const n of placed) {
    const { px, py, ly, right } = n
    const edge = right ? x + w + UNIT : x - UNIT
    const ex = right ? x + w + 2 * UNIT : x - 2 * UNIT
    const d = ly === py ? `M${f(px)} ${f(crisp(py))} H${f(ex)}` : `M${f(px)} ${f(crisp(py))} H${f(edge)} L${f(ex)} ${f(crisp(ly))}`
    parts.push(`<path class="il-hair" style="stroke:var(--ink-3, #8c877f)" d="${d}"/>`)
    parts.push(`<circle class="il-dot" cx="${f(px)}" cy="${f(py)}" r="${DOT.r}"/>`)
    parts.push(text(right ? ex + UNIT : ex - UNIT, ly + 4, n.label, { role: 'note', anchor: right ? 'start' : 'end' }))
  }
  return parts.join('')
}

// ------------------------------------------------------------------------------------------
// Hand marks, drawn with perfect-freehand (build-time). The build calls useFreehand() with
// its getStroke; without it the mark falls back to a plain round-capped stroke and warns.
// Seeded: the same seed draws the same mark, so the output is reproducible.

let getStroke = null
export function useFreehand(fn) { getStroke = fn }

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function outline(points, opts = {}) {
  if (!getStroke) {
    warn('hand mark drawn without perfect-freehand (pass --deps)')
    return `<path class="il-line il-a" style="stroke-width:${STROKE.strong}" d="M${points.map((p) => f(p[0]) + ' ' + f(p[1])).join(' L')}"/>`
  }
  const o = getStroke(points, { size: HAND.size, thinning: HAND.thinning, smoothing: HAND.smoothing, streamline: HAND.streamline, simulatePressure: true, last: true, ...opts })
  if (!o.length) return ''
  const d = o.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length]
    acc.push(f(x0), f(y0), f((x0 + x1) / 2), f((y0 + y1) / 2))
    return acc
  }, ['M', ...o[0].map(f), 'Q'])
  return `<path class="il-hand" d="${d.join(' ')} Z"/>`
}

export const hand = {
  /** A slightly rising underline from x0 to x1 at baseline y + 4. */
  underline({ x0, x1, y, seed = 1 }) {
    const r = rng(seed)
    const pts = []
    const n = 14
    for (let i = 0; i <= n; i++) {
      const t = i / n
      pts.push([x0 + (x1 - x0) * t, y + 4 - t * 2 + (r() - 0.5) * HAND.jitter, 0.5])
    }
    return outline(pts)
  },
  /** A loose loop around a point or a word: just over one turn, so the ends cross. */
  circle({ cx, cy, rx, ry, seed = 1 }) {
    const r = rng(seed)
    const pts = []
    const turns = 1.12, n = 48, a0 = -2.4 + r() * 0.4
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const a = a0 + t * turns * 2 * Math.PI
      const k = 1 + (r() - 0.5) * 0.05 + t * 0.06
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k])
    }
    return outline(pts)
  },
}
