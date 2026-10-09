// The rules every log illustration is drawn from. Drawings in drawings/ never pick a colour,
// a stroke, a size or a gap by eye: they ask for them here. README.md "Rules" gives the
// reasoning; docs/design/log.md §7 says where figures go and how they are captioned.

/** Colours: the site tokens (prototype F, :root). In the page every value is read through a
 * CSS variable with this as its fallback, so a drawing follows the page if the tokens move. */
export const INK = {
  ground: ['--ground', '#0a0a0b'],
  ink: ['--ink', '#e9e5de'],
  ink2: ['--ink-2', '#b6b1a8'],
  ink3: ['--ink-3', '#8c877f'],
  ink4: ['--ink-4', '#5f5b55'],
  rule: ['--rule-2', 'rgba(233, 229, 222, 0.18)'],
  wash: ['--wash', 'rgba(233, 229, 222, 0.06)'],
}

/** One accent per drawing: the project the entry belongs to, or the Log's blue. Lime is drawn
 * with the softer glow green on black (craft audit §5.3), never #bbed26 as a thin line. */
export const ACCENT = {
  log: ['--log', '#8fb8ff'],
  recto: ['--recto-glow', '#a6d873'],
  englishprep: ['--prep', '#efb1cb'],
  eatmap: ['--eat', '#eb4f6b'],
  edk: ['--edk', '#c9d4ff'],
  about: ['--about', '#f3b886'],
}

/** Two widths, never one scaled to the other: text inside an SVG must not shrink below its
 * size on the page. wide = the reading column with figures allowed to break out (46em of
 * 17px ≈ 720, measured on F); narrow = a 390 phone minus two 16px gutters. */
export const WIDTH = { wide: 720, narrow: 358 }

/** Layout grid. Every box edge, gap and row sits on it. */
export const UNIT = 8

/** Strokes follow the icon set (tools/icons/rules.mjs): 1.5 is the 16px regular stroke,
 * the stem of Inter beside 15px text. Hairlines are for axes and frames only. */
export const STROKE = { hair: 1, line: 1.5, strong: 2 }

/** Arrowheads are the 16px icon's head: two arms at 45° to the shaft, 5.25px long
 * (icons OPTICAL[16].head × arrowSpan), round caps and joins. */
export const ARROW = { arm: 5.25, gap: 6 }

/** Corner radius of a box: one step of the grid less a quarter, so a 40px box reads like
 * the 44px pill buttons at the same scale. Frames (screenshots) take 8. */
export const RADIUS = { box: 6, frame: 8 }

/** Type: the page's own faces through CSS variables, at sizes on the site scale only
 * (craft audit §3.4). Labels 13 (meta), names 15 (ui, 500), a figure's own title never. */
export const TYPE = {
  label: { size: 13, weight: 400, family: 'ui', fill: 'ink3' },
  name: { size: 15, weight: 500, family: 'ui', fill: 'ink' },
  note: { size: 15, weight: 400, family: 'ui', fill: 'ink2' },
  num: { size: 13, weight: 400, family: 'ui', fill: 'ink2', tabular: true },
}
export const FAMILY = {
  ui: ['--f-ui', '"Inter", "Inter Fallback", system-ui, sans-serif'],
  display: ['--f-display', '"Newsreader", "Newsreader Fallback", Georgia, serif'],
}

/** Dots on timelines: 4px radius (an 8px mark, the 16px status dot at half scale), the
 * current one ringed at 8. */
export const DOT = { r: 4, ring: 8 }

/** Hand marks (perfect-freehand). One per figure at most; they annotate, never structure.
 * Size matches the strong stroke after thinning; seeded, so a rebuild is byte-identical. */
export const HAND = { size: 3.2, thinning: 0.55, smoothing: 0.6, streamline: 0.45, jitter: 1.4 }

/** Estimated advance widths for Inter at 1em, by character class. Used only to warn when a
 * label will not fit its box and to centre single-line labels; the browser lays the text out. */
const NARROW = new Set("iIjl.,:;'|!()[] ")
const WIDE = new Set('mwMW@')
export function textWidth(s, size, weight = 400) {
  let em = 0
  for (const ch of String(s)) {
    if (NARROW.has(ch)) em += 0.29
    else if (WIDE.has(ch)) em += 0.84
    else if (/[0-9]/.test(ch)) em += 0.6
    else if (/[A-ZĞİŞÇÖÜ]/.test(ch)) em += 0.66
    else em += 0.54
  }
  return em * size * (weight >= 500 ? 1.03 : 1)
}

export const snap = (v) => Math.round(v / UNIT) * UNIT
/** Half-pixel offset so a 1px or 1.5px horizontal or vertical line lands crisply at 2x. */
export const crisp = (v) => Math.round(v * 2) / 2

/** CSS value with fallback: var(--ink-3, #8c877f). */
export const css = (pair) => `var(${pair[0]}, ${pair[1]})`
