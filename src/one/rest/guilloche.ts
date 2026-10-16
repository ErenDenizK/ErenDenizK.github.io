/* Guilloché engraving (spec v2 §2.6, §3.5.1, §3.6.1): the rosettes of a banknote or an ID card, drawn
   at build time as SVG paths, so the ID card, its chapter and the postcards share one security pattern.
   A rosette is a family of hypotrochoids: a small circle of radius r rolls inside a circle of radius R
   and a pen at distance d from its centre draws the curve; several pens at slowly growing distances give
   the woven band. Integers R and r close the curve after r / gcd(R, r) turns. */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export type Rosette = { cx: number; cy: number; R: number; r: number; d: number; scale: number; pens?: number; spread?: number; steps?: number };

/** One path string with every pen of the rosette, in user units around (cx, cy). */
export function rosette({ cx, cy, R, r, d, scale, pens = 5, spread = 0.12, steps = 1400 }: Rosette): string {
  const turns = r / gcd(R, r);
  const k = (R - r) / r;
  const out: string[] = [];
  for (let p = 0; p < pens; p++) {
    const dd = d * (1 + (p - (pens - 1) / 2) * spread);
    /* relative moves in tenths, rounded against the rounded pen position so nothing drifts: about a third
       of the bytes of absolute points, and it compresses far better (first-paint budget, ADR-0006) */
    let px = 0, py = 0, path = '';
    const num = (v: number) => { const s = (v / 10).toString().replace(/^(-?)0\./, '$1.'); return v < 0 ? s : ' ' + s; };
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2 * turns;
      const x = Math.round((cx + ((R - r) * Math.cos(t) + dd * Math.cos(k * t)) * scale) * 10);
      const y = Math.round((cy + ((R - r) * Math.sin(t) - dd * Math.sin(k * t)) * scale) * 10);
      path += i ? num(x - px) + num(y - py) : `M${x / 10} ${y / 10}l`;
      px = x; py = y;
    }
    out.push(path + 'z');
  }
  return out.join('');
}

/* The rosettes of the person's part, each drawn once into its own SVG file (src/pages/lab/one/guil/
   [name].svg.ts) and shown as an image: inline, the six postcard copies, the two card faces and the
   chapter's rosette made Home's HTML about 270 KB gzip, past the 200 KB first-paint budget (ADR-0006).
   The ink is baked in (--gold-ink); each place sets only size, place and opacity. */
export const ROSETTES = {
  pc: { cx: 0, cy: 0, R: 60, r: 16, d: 41, scale: 1.5, pens: 3, spread: 0.06 },
  'idc-a': { cx: 0, cy: 0, R: 60, r: 16, d: 41, scale: 2.4, pens: 4, spread: 0.05 },
  'idc-b': { cx: 0, cy: 0, R: 50, r: 13, d: 35, scale: 2.1, pens: 3, spread: 0.06 },
  rose: { cx: 0, cy: 0, R: 90, r: 24, d: 50, scale: 4.6, pens: 2, spread: 0.05, steps: 2400 },
} satisfies Record<string, Rosette>;
export type RosetteName = keyof typeof ROSETTES;

/** The rosette's outer radius in its own units (the pen farthest out, at its farthest). */
export const reach = (o: Rosette) => (o.R - o.r + o.d * (1 + ((o.pens ?? 5) - 1) / 2 * (o.spread ?? 0.12))) * o.scale;

/** The SVG file of one rosette: centred, square, 1 px ink at any size. */
/* half the side of each file's square, as the inline drawings had it (the postcard's crops its rosette) */
export const BOX: Record<RosetteName, number> = { pc: 110, 'idc-a': Math.ceil(reach(ROSETTES['idc-a'])) + 2, 'idc-b': Math.ceil(reach(ROSETTES['idc-b'])) + 2, rose: 560 };
export function rosetteSvg(name: RosetteName, ink = '#f3b886'): string {
  const o = ROSETTES[name], e = BOX[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-e} ${-e} ${2 * e} ${2 * e}"><path d="${rosette(o)}" fill="none" stroke="${ink}" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
}
