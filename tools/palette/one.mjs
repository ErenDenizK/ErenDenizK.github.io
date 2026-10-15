// The two-page site's pairings (lab page /lab/one/; design spec §2.4, §2.6, §8.1), measured as their own
// theme "one": the tokens of src/one/tokens.css over the house tokens. Rows cover the inks on the night
// ground, on the paper of the person's part, on each project's paper (world.json ground.frame) and on
// "ground + aura at 0.08 additive" for every pigment of every aura set (the most light any text block may
// stand on: field.css pools are added with plus-lighter, and the hush keeps text at or under it).
// Imported by check.mjs; the rows use its roles and its var() resolution.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, toHex } from './color.mjs';
import { SETS, projectSet } from '../../src/one/aura.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ONE_FILE = 'src/one/tokens.css';

/** The :root custom properties of the token file (its blocks hold no nested braces). */
export function oneTheme() {
  const path = join(ROOT, ONE_FILE);
  if (!existsSync(path)) return null;
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const overrides = {};
  for (const m of css.matchAll(/(?:^|\})\s*:root\s*\{([^}]*)\}/g)) {
    for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) overrides[d[1]] = d[2].trim();
  }
  return { name: 'one', scope: 'one', note: `the two-page site (${ONE_FILE}, lab page /lab/one/)`, overrides };
}

/** A pigment added to the ground at alpha a (plus-lighter in sRGB, as the field paints it). */
function add(ground, pigment, a) {
  const g = parseColor(ground), p = parseColor(pigment);
  const ch = (k) => Math.min(255, g[k] + a * p[k]);
  return toHex({ r: ch('r'), g: ch('g'), b: ch('b') });
}

function projects() {
  const dir = join(ROOT, 'content/projects');
  return readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => {
    const id = f.replace(/\.mdx?$/, '');
    const src = readFileSync(join(dir, f), 'utf8');
    const line = src.match(/^accent:\s*\{([^}]*)\}/m)?.[1] ?? '';
    const field = (k) => line.match(new RegExp(`\\b${k}:\\s*"([^"]+)"`))?.[1];
    const wf = join(dir, id, 'world.json');
    const world = existsSync(wf) ? JSON.parse(readFileSync(wf, 'utf8')) : null;
    return { id, accent: { color: field('color'), glow: field('glow'), p2: field('p2'), p3: field('p3') }, world, live: /kind:\s*live\b/.test(src) };
  }).filter((p) => p.accent.color);
}

const G = 'var(--ground)';
const PAPER = [G, 'var(--paper-lift)'];

export function onePairs() {
  const rows = [
    // on the night ground
    { where: 'one: body (Inter 17)', text: 'var(--ink-2)', on: [G], px: 17, weight: 400, role: 'body' },
    { where: 'one: lede (Inter 20)', text: 'var(--ink-2)', on: [G], px: 20, weight: 400, role: 'body' },
    { where: 'one: titles, row values (ink)', text: 'var(--ink)', on: [G], px: 17, weight: 400, role: 'body' },
    { where: 'one: name (Newsreader 500, 32)', text: 'var(--ink)', on: [G], px: 32, weight: 500, role: 'large' },
    { where: 'one: .label (13 px, ink-3)', text: 'var(--ink-3)', on: [G], px: 13, weight: 500, role: 'label' },
    { where: 'one: .cap (12 px, ink-3)', text: 'var(--ink-3)', on: [G], px: 12, weight: 500, role: 'label' },
    { where: 'one: chip label on fill-1', text: 'var(--ink)', on: [G, 'var(--fill-1)'], px: 15, weight: 500, role: 'label' },
    { where: 'one: clock time (ink-2)', text: 'var(--ink-2)', on: [G], px: 13, weight: 500, role: 'label' },
    { where: 'one: tab (ink-3) on the pill', text: 'var(--ink-3)', on: [G, 'rgb(30 30 34 / 0.62)'], px: 15, weight: 500, role: 'label' },
    { where: 'one: current tab on the bed', text: 'var(--ink)', on: [G, 'rgb(30 30 34 / 0.62)', 'rgb(255 255 255 / 0.08)'], px: 15, weight: 500, role: 'label' },
    { where: 'one: skip link', text: 'var(--ground)', on: ['var(--ink)'], px: 15, weight: 500, role: 'label' },
    // on the paper (the person's part)
    { where: 'one paper: body (ink-2)', text: 'var(--ink-2)', on: PAPER, px: 16, weight: 400, role: 'body' },
    { where: 'one paper: ink', text: 'var(--ink)', on: PAPER, px: 16, weight: 400, role: 'body' },
    { where: 'one paper: .label (ink-3)', text: 'var(--ink-3)', on: PAPER, px: 13, weight: 500, role: 'label' },
    { where: 'one paper: lane on fill-1', text: 'var(--ink-2)', on: [...PAPER, 'var(--fill-1)'], px: 16, weight: 400, role: 'body' },
    { where: 'one paper: lane label on fill-1', text: 'var(--ink-3)', on: [...PAPER, 'var(--fill-1)'], px: 13, weight: 500, role: 'label' },
    { where: 'one paper: now stop (gold)', text: 'var(--person-1)', on: PAPER, px: 13, weight: 500, role: 'label' },
    { where: 'one paper: lane title (gold mix)', text: 'color-mix(in srgb, var(--person-1) 70%, var(--ink))', on: [...PAPER, 'var(--fill-1)'], px: 20, weight: 500, role: 'large' },
    { where: 'one paper: "Both matter." (gold mix)', text: 'color-mix(in srgb, var(--person-1) 55%, var(--ink))', on: PAPER, px: 20, weight: 500, role: 'large' },
    // the ID card (its face, darkest stop of the stock)
    { where: 'one id card: issued, label (ink-3)', text: 'var(--ink-3)', on: ['#100f0d'], px: 11.7, weight: 500, role: 'label' },
    { where: 'one id card: role (ink-2)', text: 'var(--ink-2)', on: ['#100f0d'], px: 12.6, weight: 400, role: 'label' },
    // the postcard's back in the large view
    { where: 'one postcard: note and address (hand)', text: '#23304a', on: ['#e6ddcc'], px: 17, weight: 400, role: 'body' },
    { where: 'one postcard: printed head (0.78)', text: 'rgb(58 50 42 / 0.78)', on: ['#e6ddcc'], px: 11, weight: 500, role: 'label' },
    { where: 'one postcard: credit (0.73)', text: 'rgb(58 50 42 / 0.73)', on: ['#e6ddcc'], px: 8, weight: 500, role: 'label' },
    // non-text
    { where: 'one: signal light', text: 'var(--signal)', on: [G], role: 'nontext' },
    { where: 'one: focus ring', text: 'var(--focus)', on: [G], role: 'nontext' },
    { where: 'one: link underline (ink-4)', text: 'var(--ink-4)', on: [G], role: 'nontext' },
  ];
  /* text over the strongest light it may stand on: ground + each pigment of each set at --aura-quiet */
  const sets = [['brief', SETS.brief], ['person', SETS.person], ['record', SETS.record], ...projects().map((p) => [p.id, projectSet(p.accent, p.world)])];
  for (const [name, set] of sets) {
    for (const pig of set) {
      const g = add('#121214', pig, 0.08);
      rows.push({ where: `one aura ${name} ${pig} at 0.08: body (ink-2)`, text: 'var(--ink-2)', on: [g], px: 17, weight: 400, role: 'body' });
      rows.push({ where: `one aura ${name} ${pig} at 0.08: label (ink-3)`, text: 'var(--ink-3)', on: [g], px: 13, weight: 500, role: 'label' });
    }
  }
  /* each project's paper (world.json ground.frame) and its product button (the accent with its ink) */
  for (const p of projects()) {
    const f = p.world?.ground?.frame;
    if (f) {
      rows.push({ where: `one paper ${p.id} ${f}: body (ink-2)`, text: 'var(--ink-2)', on: [f], px: 17, weight: 400, role: 'body' });
      rows.push({ where: `one paper ${p.id} ${f}: label (ink-3)`, text: 'var(--ink-3)', on: [f], px: 13, weight: 500, role: 'label' });
    }
    /* the button exists only where there is a live link (Eat Map shows "Code not public yet" instead) */
    if (p.live && p.world?.accent) rows.push({ where: `one ${p.id}: product button label`, text: p.world.accent.ink, on: [p.world.accent.color], px: 15, weight: 500, role: 'label' });
  }
  return rows.map((r) => ({ scope: 'one', ...r }));
}
