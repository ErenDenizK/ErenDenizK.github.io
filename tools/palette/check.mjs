#!/usr/bin/env node
// The palette checker. It reads the colour tokens from the stylesheets, resolves var() chains, and
// measures every declared text/ground pairing with WCAG 2 and APCA. A pairing that misses its floor
// fails the run. The reviewer's eye does not have to find it.
//
// Modelled on English Prep's tools/palette.mjs (same owner). The difference: English Prep derives its
// tokens from OKLCH specs in the script. Here the stylesheets are the source, and the script only reads
// them, so the check cannot drift from what ships.
//
// Usage:
//   npm run palette                          every theme, a text table, exit 1 on any failure
//   npm run palette -- --theme dark          one theme
//   npm run palette -- --md report.md        also write a Markdown report
//   npm run palette -- --no-worlds           skip the product worlds (embassy themes)
//   npm run palette -- --worlds-advisory     measure the worlds, but only the house theme fails the run
//                                            (npm run verify and CI; ADR-0016: a world's colours come
//                                            from the product's world.json, which this site does not own)
//   npm run palette -- --candidates          only the theme lab's candidates (npm run palette:lab)
//   npm run palette -- --all                 the live theme, the worlds and the candidates
//
// Limits, stated so nobody over-reads a green run:
// - Only pairings in PAIRS are measured. A new text rule needs a new row.
// - A ground is flat colour. Text over photographs, renders, objects or the light field is not measured.
// - The page grain (global.css .grain) is not modelled. It shifts the ground by a few levels at most.
// - Glass is measured over the flat ground. Over a lighter object behind it the contrast is lower.

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, flatten, wcagContrast, apca, toHex, toOklch } from './color.mjs';
import { oneTheme, onePairs } from './one.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ---- 1. Where the tokens live ----

   Every top-level `:root` block in these files is read, in this order; a later file wins. The family
   kit's light.css is listed because the site imports it; today it declares no colour tokens. Since
   2026-10-17 the two-page site is the live site (ADR-0019): its token file is the base, and the
   four-page stylesheets (global.css and the rest) are gone with their pages
   (docs/history/removed-2026-10-17.md). */
const TOKEN_FILES = [
  'src/one/tokens.css',
  'src/styles/rail.css',
  'src/styles/wordmarks.css',
  'docs/family-kit/light.css',
];

/** The rule in embassy.css that re-points the house tokens at a product's world tokens. */
const EMBASSY_SELECTOR = '.case.has-world :is(.emb, .emb-foot)';

/* ---- 2. Floors ----

   A role says what the text is for. Each role has an APCA floor and a WCAG 2 floor.
   APCA levels are from the APCA "Bronze Simple Mode" readability criterion (git.apcacontrast.com,
   documentation/APCA_in_a_Nutshell). APCA is a public beta, removed from the WCAG 3 draft in 2023, so
   it is a design bar here, not a conformance claim. WCAG 2 levels are SC 1.4.3 (text) and SC 1.4.11
   (non-text). WCAG "large" is 24 px, or 18.66 px at weight 700 and above; large text needs 3:1. */
export const ROLES = {
  body: {
    lc: 75,
    wcag: 4.5,
    source: 'APCA Bronze: Lc 75 is the minimum for body text and columns (Lc 90 preferred). WCAG 1.4.3 AA.',
  },
  large: {
    lc: 60,
    wcag: 4.5,
    source:
      'APCA Bronze: Lc 60 is the minimum for content text that is not body text; used here for large or bold text (titles, names). WCAG 1.4.3 AA (3:1 when WCAG-large).',
  },
  label: {
    lc: 45,
    wcag: 4.5,
    source:
      "Project floor for short labels (dates, captions, navigation). APCA Bronze puts Lc 45 at large headlines and Lc 30 at incidental text; Lc 45 for small labels is this project's choice, between the two. WCAG 1.4.3 AA.",
  },
  nontext: {
    lc: 30,
    wcag: 3,
    source:
      'APCA Bronze: Lc 30 for semantic non-text such as icons and indicators (Lc 15 is the absolute floor). WCAG 1.4.11 asks 3:1.',
  },
  logo: {
    lc: 30,
    wcag: 3,
    source:
      'A wordmark in its own colour. WCAG 1.4.3 exempts logotypes; the project keeps the non-text floor (APCA Lc 30, 3:1) so the name is still seen as a mark.',
  },
  decor: { lc: 0, wcag: 0, source: 'Decorative: no requirement. Measured so its values are on record.' },
};

const isWcagLarge = (px, weight) => px >= 24 || (px >= 18.66 && weight >= 700);

/* The size half, as an advisory column only. APCA's model is that contrast, size and weight are one
   requirement. Rows from APCA Bronze and its font lookup table, as transcribed in English Prep's
   tools/palette.mjs; the 500 column for Lc 100 and 110 is interpolated by us [approx]. A size below
   the table means APCA does not support it for fluent reading at any contrast; for a short label that
   is a warning, not a failure. */
const FONT_MATRIX = [
  { lc: 60, px: { 400: 24, 500: 21, 600: 18, 700: 16 } },
  { lc: 75, px: { 400: 18, 500: 16, 600: 15, 700: 14 } },
  { lc: 90, px: { 400: 16, 500: 14, 600: 14.5, 700: 14 } },
  { lc: 100, px: { 400: 15, 500: 14.25, 600: 13.5, 700: 13 } },
  { lc: 110, px: { 400: 14, 500: 13, 600: 12, 700: 11 } },
];

export function tableLc(px, weight) {
  const w = [400, 500, 600, 700].reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
  if (px >= FONT_MATRIX[0].px[w]) return FONT_MATRIX[0].lc;
  for (let i = 0; i < FONT_MATRIX.length - 1; i += 1) {
    const hi = FONT_MATRIX[i];
    const lo = FONT_MATRIX[i + 1];
    if (px <= hi.px[w] && px >= lo.px[w]) {
      const t = hi.px[w] === lo.px[w] ? 0 : (hi.px[w] - px) / (hi.px[w] - lo.px[w]);
      return hi.lc + t * (lo.lc - hi.lc);
    }
  }
  return null;
}

/* ---- 3. The pairings ----

   Every place the stylesheets set text or a meaningful mark, as the pair it renders.
   text   the colour, as CSS (var() allowed)
   on     the ground, bottom layer first; translucent layers are composited in order
   px, weight   rendered size and weight (the smallest size of a clamp())
   role   a key of ROLES
   scope  'site' (house pages) or 'embassy' (inside a product's world); default 'site'
   each   'project' repeats the row once per project, with --p (accent colour), --pg (the project's
          light: glow, else colour) and --pa set for it; 'accent' repeats it per page accent
   A rule not listed here is not checked. Adding a text rule means adding its row.

   Literal colours in the stylesheets are written here as var(--name, literal). The live theme does not
   declare those names, so the literal is measured, as before. A theme candidate (section 6) declares
   them, so the same row measures the candidate. The names are the tokens a theme would need before it
   could ship: --pill, --btn, --frame-bar and the rest replace literals in global.css and work.css.
   Product text takes --p-ink (the product's ink in that theme) when the theme gives one. */
const G = 'var(--ground)';
const TAB_GLASS = [G, 'var(--pill, rgba(22, 22, 25, 0.66))'];
/* product text: the theme's ink for the product, else today's mix */
const PINK = (mix) => `var(--p-ink, ${mix})`;
export const PAIRS = [
  // reading
  { where: 'body text (Inter)', text: 'var(--ink)', on: [G], px: 17, weight: 400, role: 'body' },
  { where: '.prose (Newsreader)', text: 'var(--read)', on: [G], px: 19, weight: 400, role: 'body' },
  { where: '.read, .n-text, .ch-body (Newsreader 430)', text: 'var(--read)', on: [G], px: 21, weight: 430, role: 'body' },
  { where: 'notes: .pc-cap-note (italic)', text: 'var(--read)', on: [G], px: 17, weight: 400, role: 'body' },
  { where: 'decks: .vdek, .post-dek, .e-dek, .tr-items, colophon', text: 'var(--ink-2)', on: [G], px: 17, weight: 400, role: 'body' },
  { where: '.ab-intro .lede', text: 'var(--ink-2)', on: [G], px: 21, weight: 400, role: 'body' },
  { where: 'summaries: .sc-what, .w-what, .also-sum, .r-items, .w-cap', text: 'var(--ink-2)', on: [G], px: 15, weight: 400, role: 'body' },
  { where: 'links in the Record (.read a)', text: 'var(--log-ink, var(--log))', on: [G], px: 21, weight: 430, role: 'body' },
  { where: '::selection', text: 'var(--ground)', on: [G, 'var(--sel, rgba(233, 229, 222, 0.85))'], px: 17, weight: 400, role: 'body' },

  // large and bold
  { where: '.vtitle', text: 'var(--ink)', on: [G], px: 46, weight: 400, role: 'large' },
  { where: '.tr-label (About, lane 1)', text: 'color-mix(in srgb, var(--about-ink, var(--about)) 75%, var(--ink))', on: [G], px: 25, weight: 400, role: 'large' },
  { where: '.r-name (release name)', text: PINK('color-mix(in srgb, var(--p) 88%, var(--ink))'), on: [G], px: 34, weight: 400, role: 'large', each: 'project' },
  { where: '.post-version', text: PINK('color-mix(in srgb, var(--p) 88%, var(--ink))'), on: [G], px: 25, weight: 400, role: 'large', each: 'project' },
  { where: '.post-next b', text: PINK('color-mix(in srgb, var(--p) 80%, var(--ink))'), on: [G], px: 17, weight: 600, role: 'large', each: 'project' },

  // labels and navigation
  { where: 'UI links: .bar-end a, .qlink, .copy-link, .more', text: 'var(--ink-2)', on: [G], px: 15, weight: 400, role: 'label' },
  { where: '.sheet-bar .crumb b', text: 'var(--ink-2)', on: [G, 'var(--sheet-bar, rgba(10, 10, 11, 0.95))'], px: 15, weight: 400, role: 'label' },
  { where: '.w-facts dd', text: 'var(--ink-2)', on: [G], px: 14, weight: 400, role: 'label' },
  { where: '.toc a, .post-toc a, .clock (place)', text: 'var(--ink-3)', on: [G], px: 15, weight: 400, role: 'label' },
  { where: '.tabs a (not current), on the pill', text: 'var(--ink-3)', on: TAB_GLASS, px: 15, weight: 500, role: 'label' },
  { where: '.tabs a[aria-current], on the pill', text: 'color-mix(in oklab, var(--accent) 18%, var(--ink))', on: [...TAB_GLASS, 'var(--pill-on, rgba(255, 255, 255, 0.075))'], px: 15, weight: 500, role: 'label', each: 'accent' },
  { where: '.rail-i (titles), on the rail panel', text: 'var(--ink-3)', on: [G, 'var(--rail-panel)'], px: 14, weight: 400, role: 'label' },
  { where: '.meta (dates, captions, figcaptions)', text: 'var(--ink-3)', on: [G], px: 13, weight: 400, role: 'label' },
  { where: '12 px labels: .sample, .ym-l', text: 'var(--ink-3)', on: [G], px: 12, weight: 400, role: 'label' },
  { where: '.fr-url (frame address bar)', text: 'var(--fr-url-ink, var(--ink-3))', on: ['var(--frame-bar, #151517)', 'var(--frame-url, rgba(255, 255, 255, 0.05))'], px: 12, weight: 400, role: 'label' },
  { where: '.ym-more', text: 'var(--ink-3)', on: [G], px: 10, weight: 500, role: 'label' },
  { where: '.w-cap-of (caption counter)', text: 'var(--w-cap-of, var(--ink-4))', on: [G], px: 15, weight: 400, role: 'label' },
  { where: 'About labels: .now-label, .ch-n, .tl-when.is-now', text: 'var(--about-ink, var(--about))', on: [G], px: 13, weight: 400, role: 'label' },
  { where: '.pj (project name in meta)', text: PINK('color-mix(in srgb, var(--pg) 86%, var(--ink))'), on: [G], px: 13, weight: 400, role: 'label', each: 'project' },
  { where: '.ab-status', text: 'color-mix(in srgb, var(--p-ink, var(--pa)) 60%, var(--ink-3))', on: [G], px: 13, weight: 400, role: 'label', each: 'project' },
  { where: '.w-cap-n (capture number)', text: PINK('var(--p)'), on: [G], px: 15, weight: 400, role: 'label', each: 'project' },
  { where: '.btn label', text: 'var(--btn-ink, #0b0b0c)', on: ['var(--btn, var(--ink))'], px: 15, weight: 500, role: 'label' },
  { where: '.btn:hover label', text: 'var(--btn-ink, #0b0b0c)', on: ['var(--btn-hover, #fff8ee)'], px: 15, weight: 500, role: 'label' },
  { where: '.btn.tint label', text: 'var(--btn-ink-tint, var(--btn-ink, #0b0b0c))', on: ['var(--p-fill, var(--p))'], px: 15, weight: 500, role: 'label', each: 'project' },
  { where: '.skip link', text: 'var(--ground)', on: ['var(--ink)'], px: 15, weight: 500, role: 'label' },
  { where: 'postcard: .pc-note, .pc-from (hand)', text: 'var(--hand)', on: ['var(--paper)'], px: 13, weight: 400, role: 'label', vars: { '--hand': '#23304a', '--paper': '#e9e2d4' } },
  { where: 'postcard: paper ink', text: '#3a322a', on: ['#e9e2d4'], px: 13, weight: 400, role: 'label' },
  { where: 'postcard: printed caption (0.72)', text: 'rgba(58, 50, 42, 0.72)', on: ['#e9e2d4'], px: 8, weight: 500, role: 'label' },
  { where: 'postcard: printed edge, .pc-credit (0.73)', text: 'var(--pc-edge, rgba(58, 50, 42, 0.73))', on: ['#e9e2d4'], px: 6.5, weight: 500, role: 'label' },

  // a product's name in its own face and colour (components/Wordmark.astro). WCAG 1.4.3 exempts logotypes,
  // so the floor is the non-text one: the name must still be seen as a mark on the ground.
  { where: 'wordmark (.wm) in its colour', text: 'var(--wm-ink, var(--wm))', on: [G], px: 34, weight: 600, role: 'logo', each: 'project' },

  // non-text
  { where: ':focus-visible outline', text: 'var(--focus)', on: [G], role: 'nontext' },
  { where: 'rail: dash ahead (--rail-idle)', text: 'var(--rail-idle)', on: [G], role: 'nontext' },
  { where: 'rail: bead / mark in an accent', text: 'var(--a-ink, var(--a))', on: [G], role: 'nontext', each: 'accent' },
  { where: 'link underline at rest (--ink-4)', text: 'var(--ink-4)', on: [G], role: 'nontext', note: 'SC 1.4.11 may not apply: the link text itself also differs from its neighbours only by the underline' },

  // decorative
  { where: '--rule (hairline)', text: 'var(--rule)', on: [G], role: 'decor' },
  { where: '--rule-2 (stronger hairline)', text: 'var(--rule-2)', on: [G], role: 'decor' },
  { where: '--wash (hover fill)', text: 'var(--wash)', on: [G], role: 'decor' },
  { where: '.sep (middle dot between projects)', text: 'var(--ink-4)', on: [G], px: 13, weight: 400, role: 'decor' },

  // inside a product's world (embassy.css); the house names are re-pointed at the world's tokens
  { scope: 'embassy', where: '.emb .prose (21 px)', text: 'var(--read)', on: [G], px: 21, weight: 400, role: 'body' },
  { scope: 'embassy', where: '.emb .decisions li', text: 'var(--read)', on: [G], px: 19, weight: 400, role: 'body' },
  { scope: 'embassy', where: '.emb links', text: 'var(--w-link)', on: [G], px: 21, weight: 400, role: 'body' },
  { scope: 'embassy', where: '.emb ink-2 (summaries, 15 px)', text: 'var(--ink-2)', on: [G], px: 15, weight: 400, role: 'body' },
  { scope: 'embassy', where: '.emb-gloss, figcaption, credits (.meta)', text: 'var(--ink-3)', on: [G], px: 13, weight: 400, role: 'label' },
  { scope: 'embassy', where: '.emb-mark', text: 'var(--ink)', on: [G], px: 26, weight: 500, role: 'large' },
  { scope: 'embassy', where: '.w-btn label, each fill stop', text: 'var(--w-accent-ink)', on: ['var(--stop)'], px: 15, weight: 500, role: 'label', each: 'stop' },
  { scope: 'embassy', where: 'world accent light as a mark', text: 'var(--w-accent-light)', on: [G], role: 'nontext' },
];

PAIRS.push(...onePairs());

/* ---- 4. Reading the stylesheets ---- */

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Top-level rules of a stylesheet: [{ selector, body }]. Nested blocks (at-rules) are skipped. */
function topLevelRules(css) {
  const rules = [];
  let depth = 0;
  let start = 0;
  let selector = '';
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === '{') {
      if (depth === 0) {
        selector = css.slice(start, i).trim();
        start = i + 1;
      }
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        rules.push({ selector, body: css.slice(start, i) });
        start = i + 1;
      }
    } else if (ch === ';' && depth === 0) {
      start = i + 1; // @import and similar statements
    }
  }
  return rules.filter((r) => !r.selector.startsWith('@'));
}

/** Custom-property declarations of a rule body, for blocks with no nesting. */
function customProps(body) {
  const out = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) out[m[1]] = m[2].trim();
  return out;
}

export function readTokens() {
  const tokens = {};
  const origin = {};
  let embassy = {};
  for (const file of TOKEN_FILES) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    for (const rule of topLevelRules(stripComments(readFileSync(path, 'utf8')))) {
      if (rule.selector === ':root') {
        const props = customProps(rule.body);
        Object.assign(tokens, props);
        for (const k of Object.keys(props)) origin[k] = file;
      }
      if (rule.selector === EMBASSY_SELECTOR) embassy = customProps(rule.body);
    }
  }
  return { tokens, origin, embassy };
}

/* ---- 5. Resolving var() ---- */

/** Replaces every var(--x, fallback) in `value`, recursively. */
export function resolve(value, tokens, seen = new Set()) {
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at < 0) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, at);
    let depth = 0;
    let end = at + 3;
    for (; end < value.length; end += 1) {
      if (value[end] === '(') depth += 1;
      if (value[end] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const inner = value.slice(at + 4, end);
    const comma = inner.indexOf(',');
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    if (seen.has(name)) throw new Error(`var() cycle at ${name}`);
    if (tokens[name] !== undefined) out += resolve(tokens[name], tokens, new Set([...seen, name]));
    else if (fallback !== null) out += resolve(fallback, tokens, seen);
    else throw new Error(`undefined token ${name}`);
    i = end + 1;
  }
  return out;
}

/* ---- 6. Themes ----

   A theme is a name, a scope and a set of token overrides on top of the stylesheet tokens. The product
   worlds are themes too: their overrides are the world's tokens plus embassy.css's re-pointing of the
   house names.

   Theme candidates come from the theme lab's stylesheet (CANDIDATE_FILE, used only by the hidden page
   src/pages/lab/themes.astro). A candidate is a top-level rule whose selector is
     :root:has(#lab-t[data-t="<name>"])              the candidate's page tokens
     :root:has(#lab-t[data-t="<name>"]) .lab-<scope>  a surface inside it (a paper band, a dark island)
   One rule may list several such selectors. A surface theme is its candidate's tokens plus its own.
   Candidates whose tokens come out identical are measured once and reported under all their names. */
export const THEMES = [
  /* the live site since 2026-10-17 (ADR-0019): the two-page token file and its rows (one.mjs). The
     four-page house theme ('dark', scope 'site') went with its stylesheets; its rows stay below as the
     record of what it measured and run only for a theme of that scope (a lab candidate). */
  ...[oneTheme()].filter(Boolean),
];

const CANDIDATE_FILE = 'src/styles/lab-themes.css';
const CANDIDATE_SELECTOR = /^:root:has\(#lab-t\[data-t="([\w-]+)"\]\)(?:\s+\.lab-([\w-]+))?$/;

/** The theme candidates in the lab stylesheet, as themes. */
export function readCandidates() {
  const path = join(ROOT, CANDIDATE_FILE);
  if (!existsSync(path)) return [];
  const page = new Map();
  const surface = new Map();
  for (const rule of topLevelRules(stripComments(readFileSync(path, 'utf8')))) {
    for (const sel of rule.selector.split(',').map((x) => x.trim().replace(/\s+/g, ' '))) {
      const m = sel.match(CANDIDATE_SELECTOR);
      if (!m) continue;
      const props = Object.fromEntries(Object.entries(customProps(rule.body)).filter(([k]) => !k.startsWith('--lab-')));
      if (!Object.keys(props).length) continue; // a rule that only draws (no tokens) is not a theme
      const key = m[2] ? `${m[1]}/${m[2]}` : m[1];
      const into = m[2] ? surface : page;
      into.set(key, { ...(into.get(key) ?? {}), ...props });
    }
  }
  const themes = [...page].map(([name, overrides]) => ({ name: `cand:${name}`, overrides }));
  for (const [key, own] of surface) {
    const base = page.get(key.split('/')[0]) ?? {};
    themes.push({ name: `cand:${key}`, overrides: { ...base, ...own } });
  }
  /* merge candidates with the same tokens */
  const seen = new Map();
  for (const t of themes) {
    const sig = JSON.stringify(Object.entries(t.overrides).sort());
    if (seen.has(sig)) seen.get(sig).names.push(t.name);
    else seen.set(sig, { ...t, names: [t.name] });
  }
  return [...seen.values()].map((t) => ({
    name: t.names.join(' = '),
    scope: 'site',
    note: `theme candidate (${CANDIDATE_FILE})`,
    overrides: t.overrides,
  }));
}

/** Projects and their accents, read from content/projects/*.md front matter. */
function readProjects() {
  const dir = join(ROOT, 'content/projects');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => {
      const src = readFileSync(join(dir, f), 'utf8');
      const line = src.match(/^accent:\s*\{([^}]*)\}/m)?.[1] ?? '';
      const wm = src.match(/^wordmark:\s*\{([^}]*)\}/m)?.[1] ?? '';
      const field = (k, l = line) => l.match(new RegExp(`\\b${k}:\\s*"([^"]+)"`))?.[1];
      const color = field('color');
      return { id: f.replace(/\.mdx?$/, ''), color, glow: field('glow'), ink: field('ink'), fill: field('fill'), wordmark: field('color', wm) ?? color };
    })
    .filter((p) => p.color);
}

/** One embassy theme per world.json, mirroring the colour part of src/lib/world.ts worldVars(). */
function worldThemes(embassy) {
  const dir = join(ROOT, 'content/projects');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'world.json')))
    .map((d) => {
      const w = JSON.parse(readFileSync(join(dir, d.name, 'world.json'), 'utf8'));
      const g = w.accent.gradient;
      const fills = !!g && g.stops[0].toLowerCase() === w.accent.color.toLowerCase();
      const wv = {
        '--w-ground': w.ground.base,
        '--w-frame': w.ground.frame ?? w.ground.base,
        '--w-raised': w.ground.raised ?? w.ground.frame ?? w.ground.base,
        '--w-hair': w.ground.hairline ?? 'rgba(255, 255, 255, 0.1)',
        '--w-ink': w.ink.primary,
        '--w-ink2': w.ink.secondary,
        '--w-ink3': w.ink.tertiary ?? w.ink.secondary,
        '--w-link': w.ink.link ?? w.ink.primary,
        '--w-accent': w.accent.color,
        '--w-accent-ink': w.accent.ink,
        '--w-accent-light': w.accent.light ?? w.accent.color,
      };
      return {
        name: `world:${d.name}`,
        scope: 'embassy',
        note: `${d.name}'s world inside its embassy (world.json; light field not modelled, cap ${w.light?.cap ?? 'n/a'})`,
        overrides: { ...wv, ...embassy },
        stops: fills ? g.stops : [w.accent.color],
      };
    });
}

/* ---- 7. Measuring ---- */

const ACCENTS = ['--edk', '--recto', '--recto-glow', '--prep', '--iris', '--lagoon', '--eat', '--eat-pink', '--log', '--about'];

/* Product colours by theme: a candidate names a product's ink (text and marks), its button fill and its
   wordmark colour with these prefixes, e.g. --recto-ink, --eat-fill, --prep-wm. */
const PRODUCT_TOKEN = { recto: '--recto', 'english-prep': '--prep', 'eat-map': '--eat' };

/** Expands `each` rows into concrete rows with their extra variables. */
function expand(pair, theme, projects, tokens) {
  const has = (name) => tokens[name] !== undefined;
  if (pair.each === 'project')
    return projects.map((p) => {
      const pre = PRODUCT_TOKEN[p.id];
      const vars = { ...pair.vars, '--p': p.color, '--pg': p.glow ?? p.color, '--pa': p.color, '--wm': p.wordmark === 'ink' ? 'var(--ink)' : p.wordmark };
      /* the live site: the product's own ink and fill from its content (accent.ink, accent.fill; ADR-0016) */
      if (p.ink) vars['--p-ink'] = p.ink;
      if (p.fill) vars['--p-fill'] = p.fill;
      /* a theme candidate may name its own, which wins */
      if (pre && has(`${pre}-ink`)) vars['--p-ink'] = `var(${pre}-ink)`;
      if (pre && has(`${pre}-fill`)) vars['--p-fill'] = `var(${pre}-fill)`;
      if (pre && has(`${pre}-wm`)) vars['--wm-ink'] = `var(${pre}-wm)`;
      return { ...pair, where: `${pair.where} [${p.id}]`, vars };
    });
  if (pair.each === 'accent')
    return ACCENTS.map((a) => {
      const vars = { ...pair.vars, '--accent': `var(${a})`, '--a': `var(${a})` };
      if (has(`${a}-ink`)) vars['--a-ink'] = `var(${a}-ink)`;
      return { ...pair, where: `${pair.where} [${a}]`, vars };
    });
  if (pair.each === 'stop')
    return (theme.stops ?? []).map((s, i) => ({ ...pair, where: `${pair.where} [${i + 1}: ${s}]`, vars: { ...pair.vars, '--stop': s } }));
  return [pair];
}

function measure(pair, tokens) {
  const t = { ...tokens, ...pair.vars };
  const ground = flatten(pair.on.map((layer) => parseColor(resolve(layer, t))));
  const textRaw = parseColor(resolve(pair.text, t));
  const text = flatten([ground, textRaw]); // a translucent text or mark is seen over its ground
  const ratio = wcagContrast(text, ground);
  const lc = apca(text, ground);
  const role = ROLES[pair.role];
  const large = pair.px !== undefined && isWcagLarge(pair.px, pair.weight);
  const needWcag = ['nontext', 'logo', 'decor'].includes(pair.role) ? role.wcag : large ? 3 : role.wcag;
  const ok = Math.abs(lc) >= role.lc && ratio >= needWcag;
  const table = pair.px !== undefined && pair.role !== 'decor' ? tableLc(pair.px, pair.weight) : undefined;
  return { ...pair, textHex: toHex(text), groundHex: toHex(ground), ratio, lc, needLc: role.lc, needWcag, ok, table, textAlpha: textRaw.a };
}

export function runTheme(theme, base, projects) {
  const tokens = { ...base, ...theme.overrides };
  const rows = [];
  for (const pair of PAIRS) {
    if ((pair.scope ?? 'site') !== theme.scope) continue;
    for (const p of expand(pair, theme, projects, tokens)) {
      try {
        rows.push(measure(p, tokens));
      } catch (e) {
        rows.push({ ...p, error: e.message, ok: false });
      }
    }
  }
  return { theme, rows, tokens };
}

/* ---- 8. Pure black and pure white ---- */

const PURE = /#000(?:000)?\b|#fff(?:fff)?\b|\b(?:black|white)\b/gi;

function pureUse(themes) {
  const notes = [];
  for (const { theme, tokens } of themes) {
    for (const [name, value] of Object.entries(tokens)) {
      if (!name.startsWith('--')) continue;
      let resolved;
      try {
        resolved = resolve(value, tokens);
      } catch {
        continue;
      }
      if (!/^(#|rgb|oklch|oklab|color-mix)/i.test(resolved)) continue;
      if (resolved.match(PURE)) notes.push(`${theme.name}: ${name} = ${value}${value !== resolved ? ` (${resolved})` : ''}`);
    }
  }
  return [...new Set(notes)];
}

/* ---- 9. Output ---- */

const fmtLc = (lc) => (Math.abs(lc) < 0.05 ? '0' : Math.abs(lc).toFixed(1));
const tableNote = (r) => (r.table === undefined ? '' : r.table === null ? 'below table' : `needs ${r.table.toFixed(0)}`);
const sizeOf = (r) => (r.px === undefined ? '-' : `${r.px}/${r.weight}`);

function printTheme({ theme, rows }) {
  console.log(`\n=== ${theme.name} (${theme.scope}) ===  ${theme.note}`);
  for (const r of rows) {
    if (r.error) {
      console.log(`  ERROR ${r.where}: ${r.error}`);
      continue;
    }
    const verdict = r.role === 'decor' ? 'info' : r.ok ? 'ok' : 'FAIL';
    console.log(
      `  ${verdict.padEnd(4)} ${r.where.slice(0, 62).padEnd(62)} ${sizeOf(r).padStart(7)} ${r.role.padEnd(7)} ` +
        `${r.ratio.toFixed(2).padStart(5)}:1 /${String(r.needWcag).padStart(3)}  Lc ${fmtLc(r.lc).padStart(5)} /${String(r.needLc).padStart(3)}` +
        `  ${tableNote(r)}`,
    );
  }
}

function markdown(results, base, origin, pure) {
  const L = [];
  L.push('# Palette check', '');
  L.push(`Generated by \`npm run palette\` (tools/palette/check.mjs) on ${new Date().toISOString().slice(0, 10)}.`, '');
  L.push('## Floors', '');
  L.push('| role | APCA Lc | WCAG 2 | source |', '|---|---|---|---|');
  for (const [k, r] of Object.entries(ROLES)) L.push(`| ${k} | ${r.lc} | ${r.wcag ? r.wcag + ':1' : '-'} | ${r.source} |`);
  L.push('', 'WCAG-large text (24 px, or 18.66 px at weight 700+) needs 3:1 instead of 4.5:1.', '');
  L.push(
    '"APCA table" is advisory. It is the Lc that APCA\'s font table asks for at that size and weight for fluent reading. "below table" means APCA supports no contrast for fluent reading at that size. It does not fail the run.',
    '',
  );
  L.push('## Tokens', '');
  L.push('| token | value | resolved | OKLCH (L C H) | file |', '|---|---|---|---|---|');
  for (const [k, v] of Object.entries(base)) {
    let res = '';
    let lch = '';
    try {
      const c = parseColor(resolve(v, base));
      res = toHex(c);
      const o = toOklch(c);
      lch = `${o.L.toFixed(3)} ${o.C.toFixed(3)} ${o.H.toFixed(0)}`;
    } catch {
      continue; // not a colour
    }
    L.push(`| \`${k}\` | \`${v}\` | ${res} | ${lch} | ${origin[k]} |`);
  }
  for (const { theme, rows } of results) {
    L.push('', `## Theme: ${theme.name}`, '', theme.note, '');
    L.push('| | where | text | ground | size | role | WCAG | need | APCA Lc | need | APCA table |', '|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of rows) {
      if (r.error) {
        L.push(`| ERROR | ${r.where} | ${r.error} | | | | | | | | |`);
        continue;
      }
      const v = r.role === 'decor' ? 'info' : r.ok ? 'pass' : '**FAIL**';
      L.push(
        `| ${v} | ${r.where} | \`${r.text}\` ${r.textHex} | ${r.groundHex} | ${sizeOf(r)} | ${r.role} | ${r.ratio.toFixed(2)} | ${r.needWcag || '-'} | ${fmtLc(r.lc)} | ${r.needLc || '-'} | ${tableNote(r)} |`,
      );
    }
  }
  L.push('', '## Pure black and pure white in colour tokens', '');
  L.push(...(pure.length ? pure.map((p) => `- ${p}`) : ['- none']));
  return L.join('\n') + '\n';
}

/* ---- 10. Main ---- */

export function runAll({ themeFilter, worlds = true, live = true, candidates = false, extraThemes = [] } = {}) {
  const { tokens: base, origin, embassy } = readTokens();
  const projects = readProjects();
  let themes = [...(live ? THEMES : []), ...extraThemes, ...(worlds ? worldThemes(embassy) : []), ...(candidates ? readCandidates() : [])];
  if (themeFilter) themes = themes.filter((t) => t.name.split(' = ').includes(themeFilter));
  const results = themes.map((t) => runTheme(t, base, projects));
  return { results, base, origin, projects };
}

function main() {
  const args = process.argv.slice(2);
  const opt = (k) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };
  /* --candidates: only the theme lab's candidates; --all: the live theme, the worlds and the candidates */
  const only = args.includes('--candidates');
  const all = args.includes('--all');
  const { results, base, origin } = runAll({
    themeFilter: opt('--theme'),
    live: !only,
    worlds: !only && !args.includes('--no-worlds'),
    candidates: only || all || !!opt('--theme')?.startsWith('cand:'),
  });
  if (!results.length) {
    console.error('no theme matched');
    process.exit(2);
  }
  for (const r of results) printTheme(r);
  const pure = pureUse(results);
  console.log('\npure black / white in colour tokens:' + (pure.length ? '\n  ' + pure.join('\n  ') : ' none'));

  const md = opt('--md');
  if (md) {
    writeFileSync(md, markdown(results, base, origin, pure));
    console.log(`\nreport: ${relative(process.cwd(), md) || md}`);
  }

  const misses = results.flatMap(({ theme, rows }) => rows.filter((r) => !r.ok && r.role !== 'decor').map((r) => ({ theme, at: `${theme.name}: ${r.where}` })));
  const total = results.reduce((n, { rows }) => n + rows.filter((r) => r.role !== 'decor').length, 0);
  /* --worlds-advisory: a miss inside a product's world is reported, not failed. The fix belongs to the
     product and the Family chat (world.json), not to this site's stylesheets. */
  const advisory = args.includes('--worlds-advisory');
  const isWorld = (t) => t.name.startsWith('world:');
  const failures = misses.filter((m) => !(advisory && isWorld(m.theme))).map((m) => m.at);
  const noted = misses.filter((m) => advisory && isWorld(m.theme)).map((m) => m.at);
  if (noted.length) console.log(`\npalette: ${noted.length} pairings miss inside a product's world (advisory, world.json):\n` + noted.map((f) => '  - ' + f).join('\n'));
  if (failures.length) {
    console.log(`\npalette: ${failures.length} of ${total} pairings fail:\n` + failures.map((f) => '  - ' + f).join('\n'));
    process.exit(1);
  }
  console.log(noted.length ? `\npalette: the house theme meets every floor (${total - noted.length} of ${total} pairings pass)` : `\npalette: all ${total} pairings meet their floors`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
