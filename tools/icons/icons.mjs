// Icon definitions. Each draw(g) returns primitives in canvas px, using only the context's
// measures (g.c centre, g.H live half-size to the stroke centre line, g.w stroke, g.o the
// optical-size table, g.r / g.rs corner radii, g.snap). Add an icon here, run build.mjs,
// look at the contact sheet. README.md "Adding an icon" has the checklist.
//
//   align   'cap' centres on the cap height of the text beside it (default), 'x' on the
//           x-height (for marks that read with lowercase, like the status dot).
//   optical axes on which the icon is moved halfway from its box centre toward its ink
//           centroid, so a heavy end (an arrowhead, a play triangle's base) does not pull
//           the icon off centre. '' for symmetric icons.
//   animate how the icon may move, read by the site's motion code (README "Motion").

import { line, rect, circle } from './rules.mjs'

const G = 0.5
const grid = (v) => Math.round(v / G) * G

function arrowH(g, dir) {
  const { c, H, o, snap } = g
  const span = o.arrowSpan * 2 * H
  const x0 = snap(c - span / 2)
  const x1 = snap(c + span / 2)
  const hp = grid(o.head * span)
  const y = snap(c)
  const [tail, tip] = dir > 0 ? [x0, x1] : [x1, x0]
  return [
    line([
      [tail, y],
      [tip, y],
    ]),
    line([
      [tip - dir * hp, y - hp],
      [tip, y],
      [tip - dir * hp, y + hp],
    ]),
  ]
}

function chevron(g, dir, tall = false) {
  const { c, H, o, snap } = g
  // A 90° chevron, or the taller, narrower navigation chevron that leads a "Back" label.
  // The navigation chevron is a larger 90° chevron (iOS's back chevron is about as wide as
  // a regular one is tall): it leads a label, so it spans most of the cap-height band.
  const half = tall ? 0.78 * H : o.chevron * H
  const run = tall ? half * 0.9 : half
  const tipX = snap(c + (dir * run) / 2)
  const backX = snap(c - (dir * run) / 2)
  const y0 = snap(c - half)
  const y1 = snap(c + half)
  const yc = (y0 + y1) / 2
  return [
    line([
      [backX, y0],
      [tipX, yc],
      [backX, y1],
    ]),
  ]
}

export const ICONS = [
  {
    name: 'arrow-right',
    label: 'Arrow right',
    optical: 'x',
    animate: 'nudge',
    draw: (g) => arrowH(g, 1),
  },
  {
    name: 'arrow-left',
    label: 'Arrow left',
    optical: 'x',
    animate: 'nudge',
    draw: (g) => arrowH(g, -1),
  },
  {
    name: 'arrow-up-right',
    label: 'External link',
    optical: 'xy',
    animate: 'nudge',
    draw: (g) => {
      const { c, H, o, snap } = g
      // Diagonals read larger than horizontals of the same length, so the box is smaller.
      const s = o.arrowSpan * 2 * H * 0.7
      const x0 = snap(c - s / 2)
      const x1 = snap(c + s / 2)
      const y0 = snap(c - s / 2)
      const y1 = snap(c + s / 2)
      const arm = grid((x1 - x0) * 0.8)
      return [
        line([
          [x0, y1],
          [x1, y0],
        ]),
        line([
          [x1 - arm, y0],
          [x1, y0],
          [x1, y0 + arm],
        ]),
      ]
    },
  },
  {
    name: 'chevron-right',
    label: 'Chevron right',
    optical: 'x',
    animate: 'nudge',
    draw: (g) => chevron(g, 1),
  },
  {
    name: 'chevron-left',
    label: 'Chevron left',
    optical: 'x',
    animate: 'nudge',
    draw: (g) => chevron(g, -1),
  },
  {
    name: 'chevron-down',
    label: 'Chevron down',
    optical: 'y',
    animate: 'flip',
    draw: (g) => {
      // The right chevron turned a quarter about the centre.
      const { c } = g
      return chevron(g, 1).map((p) => {
        const pts = p.segs.length ? [p.segs[0][0], ...p.segs.map((s) => s[1])] : []
        return line(pts.map(([x, y]) => [c - (y - c), c + (x - c)]))
      })
    },
  },
  {
    name: 'back',
    label: 'Back',
    optical: 'x',
    animate: 'nudge',
    draw: (g) => chevron(g, -1, true),
  },
  {
    name: 'close',
    label: 'Close',
    optical: '',
    animate: 'morph:menu',
    draw: (g) => {
      const { c, H, o, snap } = g
      const h = o.cross * H
      const a = snap(c - h)
      const b = snap(c + h)
      return [
        line([
          [a, a],
          [b, b],
        ]),
        line([
          [b, a],
          [a, b],
        ]),
      ]
    },
  },
  {
    name: 'menu',
    label: 'Menu',
    optical: '',
    animate: 'morph:close',
    draw: (g) => {
      // Two lines, not three: quieter, and it turns into the close cross exactly. Each line
      // is as long as a diagonal of the cross, so the morph is a pure turn (no scaling,
      // which would stretch the round caps).
      const { c, H, o, snap } = g
      const half = (c - snap(c - o.cross * H)) * Math.SQRT2
      const x0 = c - half
      const x1 = c + half
      const gap = grid(H * 0.36)
      return [
        line([
          [x0, snap(c - gap)],
          [x1, snap(c - gap)],
        ]),
        line([
          [x0, snap(c + gap)],
          [x1, snap(c + gap)],
        ]),
      ]
    },
  },
  {
    name: 'plus',
    label: 'Plus',
    optical: '',
    animate: 'turn',
    draw: (g) => {
      const { c, H, o, snap } = g
      const h = o.plus * H
      const a = snap(c - h)
      const b = snap(c + h)
      const m = snap(c)
      return [
        line([
          [a, m],
          [b, m],
        ]),
        line([
          [m, a],
          [m, b],
        ]),
      ]
    },
  },
  {
    name: 'check',
    label: 'Check',
    optical: 'xy',
    animate: 'draw',
    draw: (g) => {
      const { c, H, snap } = g
      const k = H * 0.9
      const P = (x, y) => [snap(c + x * k), snap(c + y * k)]
      return [line([P(-0.92, 0.02), P(-0.32, 0.62), P(0.92, -0.64)])]
    },
  },
  {
    name: 'copy',
    label: 'Copy',
    optical: '',
    animate: 'replace:check',
    draw: (g) => {
      const { c, H, r, snap } = g
      const f = grid(2 * H * 0.66)
      const fx = snap(c + H - f)
      const fy = snap(c + H - f)
      const front = rect(fx, fy, f, f, r)
      const bx = snap(c - H)
      const by = snap(c - H)
      // The back sheet shows only its top and left edges and stops a clear stroke short of
      // the front one (Lucide: gaps of at least 2px at 24).
      const back = line(
        [
          [bx + r, by + f],
          [bx, by + f],
          [bx, by],
          [bx + f, by],
          [bx + f, by + r],
        ],
        { radius: r },
      )
      return [front, back]
    },
  },
  {
    name: 'calendar',
    label: 'Date',
    optical: '',
    animate: 'none',
    draw: (g) => {
      const { c, H, r, snap } = g
      const th = grid(Math.max(1.5, H * 0.24))
      const x0 = snap(c - H * 0.96)
      const x1 = snap(c + H * 0.96)
      const top = snap(c - H + th)
      const bottom = snap(c + H)
      const tick = (x) =>
        line([
          [x, snap(c - H)],
          [x, top + th],
        ])
      const prims = [rect(x0, top, x1 - x0, bottom - top, r), tick(snap(c - H * 0.46)), tick(snap(c + H * 0.46))]
      // The header rule sits below the rings with a clear gap at every size, so even the
      // 16px drawing reads as a calendar, not a box with ears.
      const hy = snap(top + (bottom - top) * 0.38)
      prims.push(
        line([
          [x0, hy],
          [x1, hy],
        ]),
      )
      return prims
    },
  },
  {
    name: 'clock',
    label: 'Time',
    optical: '',
    animate: 'none',
    draw: (g) => {
      const { c, H, snap } = g
      const m = snap(c)
      return [
        circle(c, c, H),
        line([
          [m, snap(c - H * 0.56)],
          [m, m],
          [snap(c + H * 0.4), snap(c + H * 0.24)],
        ]),
      ]
    },
  },
  {
    name: 'play',
    label: 'Play',
    optical: 'x',
    animate: 'replace:pause',
    draw: (g) => {
      // Solid: filled and stroked with the same width, so its corners take the round join.
      const { c, H, w, snap } = g
      const h = 2 * H * 0.8
      const wd = h * 0.86
      const x0 = snap(c - wd / 2)
      const y0 = snap(c - h / 2)
      const y1 = snap(c + h / 2)
      return [
        line(
          [
            [x0, y0],
            [x0 + wd, (y0 + y1) / 2],
            [x0, y1],
          ],
          { closed: true, fill: true, radius: w * 0.5 },
        ),
      ]
    },
  },
  {
    name: 'pause',
    label: 'Pause',
    optical: '',
    animate: 'replace:play',
    draw: (g) => {
      const { c, H, w, snap } = g
      const h = 2 * H * 0.76
      const bw = grid(Math.max(w, 2 * H * 0.14))
      const gap = grid(2 * H * 0.24)
      const y0 = snap(c - h / 2)
      const y1 = snap(c + h / 2)
      const bar = (x) => {
        const p = rect(x, y0, bw, y1 - y0, w * 0.25)
        p.fill = true
        return p
      }
      return [bar(snap(c - gap / 2 - bw)), bar(snap(c + gap / 2))]
    },
  },
  {
    name: 'dot',
    label: 'Status',
    align: 'x',
    optical: '',
    animate: 'none',
    draw: (g) => {
      // Diameter about 0.72 of the paired text's x-height: 6, 7, 8.5px.
      const { c, w, size } = g
      const D = { 16: 6, 20: 7, 24: 8.5 }[size]
      return [circle(c, c, D / 2 - w / 2, { fill: true })]
    },
  },
]

/** Brand marks: official drawings, never redrawn. Scaled uniformly into the keyline circle
 * (or square), recoloured only to currentColor, never stretched. See README "Brand marks". */
export const BRANDS = [
  {
    name: 'github',
    label: 'GitHub',
    // GitHub's own Octicons drawings of the Invertocat, @primer/octicons 19.40.0 (MIT code;
    // the mark is a GitHub trademark). 16 and 24 are separate natural-size drawings.
    sources: { 16: 'brands/github-16.svg', 20: 'brands/github-24.svg', 24: 'brands/github-24.svg' },
    // The mark's circle in the source drawing (getBBox gives 0 0 16 15.5 and
    // 0.5 1 23.5 23.28: the cat's tail leaves the bottom of the circle open).
    bounds: { 16: [0, 0, 16, 16], 20: [0.5, 1, 23.5, 24], 24: [0.5, 1, 23.5, 24] },
    shape: 'circle',
    sizes: [16, 20, 24],
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    // INTERIM: Bootstrap Icons 1.13.2 "linkedin" (MIT), a redraw of the [in] bug. LinkedIn
    // says "use only approved logo assets"; replace brands/linkedin.svg with the official
    // white bug from brand.linkedin.com/downloads before the site ships (README).
    sources: { 24: 'brands/linkedin.svg' },
    bounds: { 24: [0, 0, 16, 16] },
    shape: 'square',
    interim: true,
    // LinkedIn's minimum on screen is 21px for the [in], so the bug is only drawn at 24.
    sizes: [24],
    minPx: 21,
  },
]
