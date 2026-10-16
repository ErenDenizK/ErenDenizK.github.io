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
    // How I work and Path (spec v2 §3.5.3, §3.5.4): no boxes, lanes on the paper
    { where: 'one paper: agents lane label (gold mix, serif 24)', text: 'color-mix(in srgb, var(--gold-ink) 75%, var(--ink))', on: PAPER, px: 24, weight: 400, role: 'large' },
    { where: 'one paper: "gives" line (serif italic 16)', text: 'var(--ink)', on: PAPER, px: 16, weight: 400, role: 'body' },
    { where: 'one paper: now stop (gold)', text: 'var(--gold-ink)', on: PAPER, px: 13, weight: 400, role: 'label' },
    // the Record strip on the paper (spec v2 §3.7)
    { where: 'one paper: record note (read, serif 19)', text: 'var(--read)', on: PAPER, px: 19, weight: 430, role: 'body' },
    { where: 'one paper: record dates, meta (ink-3)', text: 'var(--ink-3)', on: PAPER, px: 13, weight: 400, role: 'label' },
    { where: 'one paper: now month (record blue)', text: 'var(--record-1)', on: PAPER, px: 13, weight: 400, role: 'label' },
    { where: 'one paper: record months (12 px, ink-3)', text: 'var(--ink-3)', on: PAPER, px: 12, weight: 400, role: 'label' },
    // the ID card (its face, darkest stop of the stock), at the 12 px floor (spec v2 §2.1)
    { where: 'one id card: issued, label (ink-3)', text: 'var(--ink-3)', on: ['#100f0d'], px: 12, weight: 400, role: 'label' },
    { where: 'one id card: role (ink-2)', text: 'var(--ink-2)', on: ['#100f0d'], px: 12, weight: 400, role: 'label' },
    // the postcard (spec v2 §3.6): the front's edge line on the mount (the photo's own light at 38 %, its
    // lightest measured mount), and the dark back
    { where: 'one postcard: place on the mount (serif italic 16)', text: 'var(--ink)', on: ['#4a4530'], px: 16, weight: 400, role: 'body' },
    { where: 'one postcard: index on the mount (12 px)', text: 'var(--ink-2)', on: ['#4a4530'], px: 12, weight: 500, role: 'label' },
    { where: 'one postcard back: note (serif italic 17)', text: 'var(--ink)', on: ['#1c1a17'], px: 17, weight: 400, role: 'body' },
    { where: 'one postcard back: signature (gold)', text: 'var(--gold-ink)', on: ['#1c1a17'], px: 15, weight: 400, role: 'label' },
    { where: 'one postcard back: labels, hex (12 px, ink-3)', text: 'var(--ink-3)', on: ['#1c1a17'], px: 12, weight: 500, role: 'label' },
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
