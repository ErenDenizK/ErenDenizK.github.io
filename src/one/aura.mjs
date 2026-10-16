/* The aura sets of the two-page site (design spec §2.5). Each part of Home has three pigments; the
   field (src/one/Field.astro, scripts/field.ts) takes the set of the section in view. The house sets are
   fixed here; a project's set is read from its content and its world.json, never copied by hand, so a new
   project brings its own light (ADR-0002). Plain JavaScript: the pages and the palette checker
   (tools/palette/check.mjs) both import it. */
import { parseColor, toOklab } from '../../tools/palette/color.mjs';

/** The house sets: the brief (blue hour), the person (the Marmara sunset), the Record. */
export const SETS = {
  brief: ['#6f8cff', '#9a9cf0', '#3a4fb8'],
  person: ['#f3b886', '#e8955a', '#8a4a2e'],
  record: ['#8fb8ff', '#6f8cff', '#6fc9cf'],
};

const lab = (hex) => toOklab(parseColor(hex));
const dist = (a, b) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };

/**
 * A project's three pigments. a1 is the project's light on black (accent.glow, else accent.color: the
 * colour the rest of the site already shows for it). a2 and a3 are the world's own light pigments
 * (world.json light.sources): the two farthest from a1 in OKLab, so the set reads as three lights and
 * not one light twice, written lightest first; the content's accent.p2 / p3 fill a gap.
 * @param {{ color: string, glow?: string, p2?: string, p3?: string }} accent  the project's content accent
 * @param {{ light: { sources: { pigments: string[] }[] } } | null} world  its world.json, or null
 * @returns {[string, string, string]}
 */
export function projectSet(accent, world) {
  const a1 = (accent.glow ?? accent.color).toLowerCase();
  const pool = [...new Set((world?.light.sources ?? []).flatMap((s) => s.pigments).map((c) => c.toLowerCase()))];
  const rest = pool.filter((c) => c !== a1).sort((x, y) => dist(y, a1) - dist(x, a1)).slice(0, 2).sort((x, y) => lab(y)[0] - lab(x)[0]);
  for (const c of [accent.p2, accent.p3]) if (c && rest.length < 2 && !rest.includes(c.toLowerCase())) rest.push(c.toLowerCase());
  while (rest.length < 2) rest.push(a1);
  return [a1, rest[0], rest[1]];
}

/** The pigments as the markup carries them: data-aura="a1 a2 a3" (the A/B interface, spec §7.5). */
export const auraAttr = (set) => set.join(' ');
/** The pigments as inline custom properties, for the still twin's pools inside a section (spec §4.11). */
export const auraVars = (set) => set.map((c, i) => `--s${i + 1}: ${c}`).join('; ');
