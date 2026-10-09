#!/usr/bin/env node
// Builds every icon at 16, 20 and 24 px in two weights from rules.mjs + icons.mjs and
// writes optimised SVGs, a JSON map, an ES module and the alignment/motion CSS to out/.
//
//   node tools/icons/build.mjs [--deps <dir with node_modules containing svgo>]
//
// Output is deterministic: run it twice and nothing changes. svgo is a dev dependency
// (package.json); without it the hand-written markup is emitted unoptimised and a warning
// is printed, so the site never depends on it at runtime.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import {
  context,
  strokeFor,
  measure,
  shift,
  circle,
  WEIGHTS,
  PAIRED_TEXT,
  OPTICAL,
  CAP_CENTRE_EM,
  X_CENTRE_EM,
  SERIF_CAP_CENTRE_EM,
  SERIF_LIFT_EM,
  GRID,
  fmt,
} from './rules.mjs'
import { ICONS, BRANDS } from './icons.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, 'out')
const SIZES = [16, 20, 24]

// ---- svgo (optional dev dependency) ---------------------------------------------------
async function loadSvgo() {
  const i = process.argv.indexOf('--deps')
  const base = i > 0 ? resolve(process.argv[i + 1]) : here
  try {
    const req = createRequire(join(base, 'package.json'))
    const mod = await import(req.resolve('svgo'))
    return mod.optimize
  } catch {
    console.warn('svgo not found; writing unoptimised SVG (npm i in tools/icons, or pass --deps)')
    return null
  }
}
const svgoConfig = {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          mergePaths: false, // keep one path per stroke, in drawing order, for draw-on
          removeUnknownsAndDefaults: { keepRoleAttr: true },
        },
      },
    },
  ],
}

// ---- drawing ------------------------------------------------------------------------
const OPTICAL_PULL = 0.5 // move halfway from the box centre to the ink centroid
const q = (v) => Math.round(v * 4) / 4

function drawIcon(def, size, weight) {
  const g = context(size, weight)
  let prims = def.draw(g)
  let m = measure(prims, size, g.w)
  let dx = 0
  let dy = 0
  if (def.optical) {
    const bx = (m.box[0] + m.box[2]) / 2
    const by = (m.box[1] + m.box[3]) / 2
    // First centre the box, then pull toward the canvas centre by half the ink offset.
    if (def.optical.includes('x')) dx = q(g.c - bx - OPTICAL_PULL * (m.cx - bx))
    if (def.optical.includes('y')) dy = q(g.c - by - OPTICAL_PULL * (m.cy - by))
    if (dx || dy) {
      prims = shift(prims, dx, dy)
      m = measure(prims, size, g.w)
    }
  }
  const draw = def.animate === 'draw'
  const paths = prims
    .map((p) => {
      const fill = p.fill ? ' fill="currentColor"' : ''
      const len = draw ? ' pathLength="1"' : ''
      return `<path${fill}${len} d="${p.d}"/>`
    })
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"` +
    ` fill="none" stroke="currentColor" stroke-width="${g.w}" stroke-linecap="round" stroke-linejoin="round"` +
    ` aria-hidden="true" focusable="false">${paths}</svg>`
  return { svg, stroke: g.w, ink: m, shift: [dx, dy], prims }
}

function brandPaths(file) {
  const src = readFileSync(join(here, file), 'utf8')
  return [...src.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((x) => x[1])
}

function drawBrand(def, size) {
  const g = context(size, 'regular')
  const [x0, y0, x1, y1] = def.bounds[size]
  const sw = x1 - x0
  const sh = y1 - y0
  // The mark's silhouette fills the keyline: a circle mark matches the outer edge of a
  // stroked circle (2H + w); a square mark is set to the vendor minimum or the keyline.
  let target = 2 * g.H + g.w
  if (def.shape === 'square') target = Math.max(def.minPx || 0, (2 * g.H + g.w) * 0.94)
  const k = target / Math.max(sw, sh) // uniform: a mark is never stretched
  const tx = g.c - (x0 + sw / 2) * k
  const ty = g.c - (y0 + sh / 2) * k
  const d = brandPaths(def.sources[size])
  const paths = d
    .map((p) => `<path transform="matrix(${fmt(k)} 0 0 ${fmt(k)} ${fmt(tx)} ${fmt(ty)})" d="${p}"/>`)
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"` +
    ` fill="currentColor" aria-hidden="true" focusable="false">${paths}</svg>`
  return { svg, scale: k, target }
}

// ---- motion recipes derived from geometry -------------------------------------------
function menuToClose(size, weight) {
  // Both lines of the menu turn into the cross about the canvas centre.
  const g = context(size, weight)
  const menu = ICONS.find((i) => i.name === 'menu').draw(g)
  const close = ICONS.find((i) => i.name === 'close').draw(g)
  const len = (p) => {
    const [[a, b]] = p.segs
    return Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  const yTop = menu[0].segs[0][0][1]
  const yBot = menu[1].segs[0][0][1]
  const k = len(close[0]) / len(menu[0])
  if (Math.abs(k - 1) > 0.01) throw new Error(`menu and close lines differ in length (${k})`)
  // Read right to left: move the line onto the centre, then turn it about the centre.
  return {
    top: `rotate(45deg) translateY(${fmt(g.c - yTop)}px)`,
    bottom: `rotate(-45deg) translateY(${fmt(g.c - yBot)}px)`,
  }
}

// ---- build ----------------------------------------------------------------------------
const optimize = await loadSvgo()
const opt = (s) => (optimize ? optimize(s, svgoConfig).data : s)

if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(join(OUT, 'svg'), { recursive: true })

const map = {}
const report = []
let bytes = 0

// Reference weight: a stroked circle on the full keyline, per size and weight.
const reference = {}
for (const size of SIZES)
  for (const weight of Object.keys(WEIGHTS)) {
    const g = context(size, weight)
    reference[`${size}/${weight}`] = measure([circle(g.c, g.c, g.H)], size, g.w).area
  }

for (const def of ICONS) {
  const entry = { label: def.label, align: def.align || 'cap', animate: def.animate, sizes: {} }
  for (const size of SIZES) {
    entry.sizes[size] = {}
    for (const weight of Object.keys(WEIGHTS)) {
      const r = drawIcon(def, size, weight)
      const svg = opt(r.svg)
      bytes += svg.length
      const file = `${def.name}-${size}${weight === 'regular' ? '' : '-' + weight}.svg`
      writeFileSync(join(OUT, 'svg', file), svg + '\n')
      entry.sizes[size][weight] = { stroke: r.stroke, svg }
      const ref = reference[`${size}/${weight}`]
      report.push({
        icon: def.name,
        size,
        weight,
        stroke: r.stroke,
        weight_vs_circle: +(r.ink.area / ref).toFixed(2),
        ink_offset: [+(r.ink.cx - size / 2).toFixed(2), +(r.ink.cy - size / 2).toFixed(2)],
        box: r.ink.box.map((v) => +v.toFixed(2)),
        optical_shift: r.shift,
      })
    }
  }
  map[def.name] = entry
}

for (const def of BRANDS) {
  const entry = {
    label: def.label,
    align: 'cap',
    animate: 'none',
    brand: true,
    interim: !!def.interim,
    minPx: def.minPx || null,
    sizes: {},
  }
  for (const size of def.sizes) {
    const r = drawBrand(def, size)
    const svg = opt(r.svg)
    bytes += svg.length
    writeFileSync(join(OUT, 'svg', `${def.name}-${size}.svg`), svg + '\n')
    // Brand marks have no stroke, so both weights are the same drawing.
    entry.sizes[size] = { regular: { stroke: 0, svg }, medium: { stroke: 0, svg } }
    report.push({ icon: def.name, size, weight: '-', stroke: 0, mark_px: +r.target.toFixed(2) })
  }
  map[def.name] = entry
}

const motion = {}
for (const size of SIZES) motion[size] = { menuToClose: menuToClose(size, 'regular') }

const rules = {
  sizes: SIZES,
  pairedText: PAIRED_TEXT,
  strokes: Object.fromEntries(
    Object.keys(WEIGHTS).map((w) => [w, Object.fromEntries(SIZES.map((s) => [s, strokeFor(s, w)]))]),
  ),
  optical: OPTICAL,
  grid: GRID,
  capCentreEm: +CAP_CENTRE_EM.toFixed(4),
  xCentreEm: +X_CENTRE_EM.toFixed(4),
  serifCapCentreEm: +SERIF_CAP_CENTRE_EM.toFixed(4),
  serifLiftEm: +SERIF_LIFT_EM.toFixed(4),
}

writeFileSync(join(OUT, 'icons.json'), JSON.stringify({ rules, motion, icons: map }, null, 2) + '\n')

// ES module: inner markup only, one entry per icon/size/weight, plus a helper.
const flat = {}
for (const [name, e] of Object.entries(map))
  for (const [size, ws] of Object.entries(e.sizes))
    for (const [weight, v] of Object.entries(ws)) {
      if (weight === 'medium' && e.brand) continue
      flat[`${name}/${size}${weight === 'regular' ? '' : '/' + weight}`] = v.svg
    }
const js = `// Generated by tools/icons/build.mjs. Do not edit.
export const icons = ${JSON.stringify(flat, null, 0).replace(/","/g, '",\n  "')}

/** icon('arrow-right', { size: 16, weight: 'medium' }) returns the SVG markup. Brand marks
 * have one weight; a size that was not drawn falls back to the nearest larger one. */
export function icon(name, { size = 16, weight = 'regular' } = {}) {
  for (const s of [size, 16, 20, 24].filter((s) => s >= size)) {
    const v = icons[name + '/' + s + (weight === 'regular' ? '' : '/' + weight)] || icons[name + '/' + s]
    if (v) return v
  }
  throw new Error('no icon ' + name)
}
`
writeFileSync(join(OUT, 'icons.js'), js)

const css = `/* Generated by tools/icons/build.mjs. Alignment and motion for the icon set. */
.icon {
  display: inline-block;
  flex: none;
  width: var(--icon, 16px);
  height: var(--icon, 16px);
  /* Inline in running text: centre on Inter's cap height (${rules.capCentreEm}em above the
     baseline). In a flex row, align-items: center already does this, because Inter's
     content-area centre equals its cap-height centre. */
  vertical-align: calc(${rules.capCentreEm}em - var(--icon, 16px) / 2);
  overflow: visible;
}
/* x-height marks (the status dot): inline, centre on the x-height; in a flex row the top
   margin moves the centred box down by half its size, from cap centre to x centre. */
.icon[data-align='x'] {
  vertical-align: calc(${rules.xCentreEm}em - var(--icon, 16px) / 2);
  margin-top: ${fmt(2 * (rules.capCentreEm - rules.xCentreEm))}em;
}
/* Beside Newsreader (titles): its content-area centre is ${rules.serifLiftEm}em below its cap
   centre. Put .on-serif on the element that holds the title text and the icon. */
.on-serif > .icon {
  margin-bottom: ${fmt(2 * rules.serifLiftEm)}em;
  vertical-align: calc(${rules.serifCapCentreEm}em - var(--icon, 16px) / 2 - ${fmt(2 * rules.serifLiftEm)}em);
}
.icon--20 { --icon: 20px; }
.icon--24 { --icon: 24px; }

/* Motion (README "Motion"). Every effect has a still twin under reduced motion. */
.icon path { transform-box: view-box; transform-origin: center; }
.icon[data-animate='nudge'] { transition: transform 200ms cubic-bezier(0.2, 0.7, 0.1, 1); }
/* Hover nudges only where hover exists: on touch a tap would leave the icon displaced. */
@media (hover: hover) {
  :where(a, button):hover > .icon[data-animate='nudge'] { transform: translateX(2px); }
  :where(a, button):hover > .icon[data-name='arrow-up-right'] { transform: translate(1.5px, -1.5px); }
  :where(a, button):hover > .icon[data-name='arrow-left'],
  :where(a, button):hover > .icon[data-name='chevron-left'],
  :where(a, button):hover > .icon[data-name='back'] { transform: translateX(-2px); }
}
.icon[data-animate='flip'] { transition: transform 320ms cubic-bezier(0.2, 0.7, 0.1, 1); }
[aria-expanded='true'] > .icon[data-animate='flip'] { transform: rotate(180deg); }
.icon[data-animate='draw'] path { stroke-dasharray: 1; stroke-dashoffset: 0; }
.icon[data-animate='draw'].is-drawing path { animation: icon-draw 320ms cubic-bezier(0.2, 0.7, 0.1, 1) both; }
@keyframes icon-draw { from { stroke-dashoffset: 1; } }
.icon-swap { display: inline-grid; }
.icon-swap > .icon { grid-area: 1 / 1; transition: opacity 160ms, transform 240ms cubic-bezier(0.2, 0.7, 0.1, 1); }
.icon-swap > .icon:last-child, .icon-swap.is-on > .icon:first-child { opacity: 0; transform: scale(0.6); }
.icon-swap.is-on > .icon:last-child { opacity: 1; transform: none; }
${SIZES.map(
  (s) => `.icon--menu[data-size='${s}'].is-open path:first-child { transform: ${motion[s].menuToClose.top}; }
.icon--menu[data-size='${s}'].is-open path:last-child { transform: ${motion[s].menuToClose.bottom}; }`,
).join('\n')}
.icon--menu path { transition: transform 320ms cubic-bezier(0.65, 0, 0.35, 1); }
@media (prefers-reduced-motion: reduce) {
  .icon, .icon path, .icon-swap > .icon { transition-duration: 0s !important; animation: none !important; }
  :where(a, button):hover > .icon { transform: none !important; }
  .icon-swap > .icon { transition: opacity 120ms !important; transform: none !important; }
}
`
writeFileSync(join(OUT, 'icons.css'), css)
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1) + '\n')

// ---- console summary --------------------------------------------------------------------
const rows = report.filter((r) => r.weight !== 'medium')
console.log('icon            size stroke  weight/circle  ink offset      shift')
for (const r of rows)
  console.log(
    r.icon.padEnd(16) +
      String(r.size).padEnd(5) +
      String(r.stroke).padEnd(8) +
      String(r.weight_vs_circle ?? (r.mark_px ? 'mark ' + r.mark_px + 'px' : '')).padEnd(15) +
      String(r.ink_offset ?? '').padEnd(16) +
      String(r.optical_shift ?? ''),
  )
console.log(`\n${Object.keys(map).length} icons, ${Object.keys(flat).length} drawings, ${bytes} bytes of SVG`)
