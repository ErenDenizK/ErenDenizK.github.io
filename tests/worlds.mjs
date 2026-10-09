// Every product world the embassies read (content/projects/<slug>/world.json) against the family kit:
//   1. the contract: docs/family-kit/world.schema.json (a small JSON Schema 2020-12 validator for the
//      keywords that schema uses; the repo takes no dependencies for it);
//   2. the light: docs/family-kit/light.js checkField() (light.md §1);
//   3. the files: every capture's files exist beside world.json, and every capture a project's
//      frontmatter picks is in its world;
//   4. contrast through the light (charter rule 2, light.md rule 8): measured against the brightest
//      point of the field's envelope under its cap (and under an event's boost), WCAG 2:
//      body text (ink.primary) >= 7:1, secondary and tertiary text (meta, captions) >= 4.5:1,
//      links (ink.link) >= 4.5:1, the accent's label on every stop of the accent >= 4.5:1.
// node tests/worlds.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkField, contrast, hexToLinear } from '../docs/family-kit/light.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/family-kit/world.schema.json'), 'utf8'));
const DIR = path.join(ROOT, 'content/projects');
/* Known gaps, each named and dated, so a new one fails: Eat Map has no captures until it is shot in
   the simulator (family.md §3.1); the schema asks for at least one. */
const ALLOWED = new Set(['eat-map /captures: fewer than 1 items']);

/* ---- a JSON Schema validator for the keywords world.schema.json uses ---- */
function validate(v, s, at, root, out) {
  if (s.$ref) s = s.$ref.split('/').slice(1).reduce((o, k) => o[k], root);
  if (s.oneOf) {
    const ok = s.oneOf.filter((sub) => { const e = []; validate(v, sub, at, root, e); return !e.length; }).length;
    if (ok !== 1) out.push(`${at || '/'}: matches ${ok} of oneOf, needs exactly 1`);
    return;
  }
  const type = v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
  if (s.type && !(s.type === type || (s.type === 'number' && type === 'integer'))) { out.push(`${at || '/'}: is ${type}, not ${s.type}`); return; }
  if ('const' in s && v !== s.const) out.push(`${at}: must be ${JSON.stringify(s.const)}`);
  if (s.enum && !s.enum.includes(v)) out.push(`${at}: must be one of ${s.enum.join(', ')}`);
  if (typeof v === 'string' && s.pattern && !new RegExp(s.pattern).test(v)) out.push(`${at}: "${v}" does not match ${s.pattern}`);
  if (typeof v === 'string' && s.format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) out.push(`${at}: "${v}" is not a date`);
  if (typeof v === 'number') {
    if (s.minimum !== undefined && v < s.minimum) out.push(`${at}: ${v} < ${s.minimum}`);
    if (s.maximum !== undefined && v > s.maximum) out.push(`${at}: ${v} > ${s.maximum}`);
    if (s.exclusiveMinimum !== undefined && v <= s.exclusiveMinimum) out.push(`${at}: ${v} <= ${s.exclusiveMinimum}`);
  }
  if (type === 'array') {
    if (s.minItems !== undefined && v.length < s.minItems) out.push(`${at}: fewer than ${s.minItems} items`);
    if (s.maxItems !== undefined && v.length > s.maxItems) out.push(`${at}: more than ${s.maxItems} items`);
    if (s.items) v.forEach((x, i) => validate(x, s.items, `${at}/${i}`, root, out));
  }
  if (type === 'object') {
    for (const k of s.required ?? []) if (!(k in v)) out.push(`${at || '/'}: ${k} is required`);
    for (const [k, x] of Object.entries(v)) {
      if (s.properties?.[k]) validate(x, s.properties[k], `${at}/${k}`, root, out);
      else if (s.additionalProperties === false) out.push(`${at || '/'}: ${k} is not allowed`);
    }
  }
}

/* ---- colour through the light ---- */

/** The field over the ground at opacity a: the cap flattens every pigment first (light.css), so at any
    point the field's colour is at most one pigment at its core; composited in sRGB, as the browser does. */
const over = (ground, pigment, a) => {
  const g = ground.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  const p = pigment.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
  return '#' + g.map((c, i) => Math.round(c + (p[i] - c) * a).toString(16).padStart(2, '0')).join('');
};
const lum = (hex) => { const [r, g, b] = hexToLinear(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };


let failed = 0;
const fail = (m) => { failed++; console.log('  FAIL', m); };
const slugs = fs.readdirSync(DIR).filter((d) => fs.existsSync(path.join(DIR, d, 'world.json'))).sort();
if (!slugs.length) fail('no world.json found');
for (const slug of slugs) {
  const file = path.join(DIR, slug, 'world.json');
  const w = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`${slug}${w.source?.estimated?.length ? ' (estimated: ' + w.source.estimated.join(', ') + ')' : ''}`);

  const errs = [];
  validate(w, SCHEMA, '', SCHEMA, errs);
  for (const e of errs) if (!ALLOWED.has(`${slug} ${e}`)) fail(`schema ${e}`); else console.log('  known gap:', e);
  if (w.slug !== slug) fail(`slug "${w.slug}" is not its folder "${slug}"`);
  if (!fs.existsSync(path.join(DIR, `${slug}.md`)) && !fs.existsSync(path.join(DIR, `${slug}.mdx`))) fail(`no content/projects/${slug}.md beside it`);

  for (const e of checkField(w.light)) fail(`light: ${e}`);

  for (const c of w.captures ?? []) for (const f of c.files) if (!fs.existsSync(path.join(DIR, slug, f))) fail(`capture ${c.id}: ${f} is missing`);
  /* the codec levels src/lib/world.ts declares for a clip of this size (when ffprobe is here) */
  const LEVEL = { phone: { av1: 4, hevc: 90, h264: 30 }, wide: { av1: 8, hevc: 120, h264: 40 }, hi: { av1: 13, hevc: 153, h264: 52 } };
  const bucket = (px) => (px < 600 ? 'phone' : px <= 1920 ? 'wide' : 'hi');
  for (const c of (w.captures ?? []).filter((c) => c.kind === 'signature')) for (const f of c.files.filter((f) => f.endsWith('.mp4'))) {
    let level;
    try { level = +execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=level', '-of', 'csv=p=0', path.join(DIR, slug, f)]).toString().trim(); } catch { continue; }
    const want = LEVEL[bucket(c.viewport[0] * c.dpr)][f.split('.').at(-2)];
    if (level !== want) fail(`${f}: codec level ${level}, src/lib/world.ts declares ${want}`);
  }
  const md = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8').split('\n---')[0];
  for (const m of md.matchAll(/\{\s*id:\s*([a-z0-9-]+)/g)) if (!(w.captures ?? []).some((c) => c.id === m[1])) fail(`${slug}.md picks capture "${m[1]}", which world.json does not have`);
  for (const m of md.matchAll(/phone:\s*([a-z0-9-]+)/g)) if (!(w.captures ?? []).some((c) => c.id === m[1])) fail(`${slug}.md picks clip "${m[1]}", which world.json does not have`);

  const pigments = w.light.sources.flatMap((s) => s.pigments);
  const brightest = pigments.reduce((a, b) => (lum(b) > lum(a) ? b : a));
  const caps = [w.light.cap, ...(w.light.behaviour === 'event' ? [Math.min(1, w.light.cap * (w.light.event?.boost ?? 1.25))] : [])];
  const grounds = [w.ground.base, ...caps.map((a) => over(w.ground.base, brightest, a))];
  const worst = grounds.reduce((a, b) => (lum(b) > lum(a) ? b : a));
  const pairs = [
    ['body text', w.ink.primary, 7],
    ['secondary text', w.ink.secondary, 4.5],
    ...(w.ink.tertiary ? [['tertiary text', w.ink.tertiary, 4.5]] : []),
    ['links', w.ink.link ?? w.ink.primary, 4.5],
  ];
  for (const [name, ink, need] of pairs) {
    const r = Math.min(...grounds.map((g) => contrast(ink, g)));
    const line = `${name.padEnd(15)} ${ink} ${r.toFixed(2)}:1 (>= ${need}) on ${worst}`;
    if (r < need) fail(line); else console.log('  ok', line);
  }
  /* the button's fill: the gradient when it starts at the accent (src/lib/world.ts fills), else the accent */
  const fill = w.accent.gradient && w.accent.gradient.stops[0] === w.accent.color ? w.accent.gradient.stops : [w.accent.color];
  for (const stop of fill) {
    const r = contrast(w.accent.ink, stop);
    const line = `${'button label'.padEnd(15)} ${w.accent.ink} on ${stop} ${r.toFixed(2)}:1 (>= 4.5)`;
    if (r < 4.5) fail(line); else console.log('  ok', line);
  }
}
console.log(failed ? `${failed} problem(s)` : `${slugs.length} worlds pass`);
process.exit(failed ? 1 : 0);
