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
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2 * turns;
      const x = (R - r) * Math.cos(t) + dd * Math.cos(k * t);
      const y = (R - r) * Math.sin(t) - dd * Math.sin(k * t);
      pts.push(`${(cx + x * scale).toFixed(1)} ${(cy + y * scale).toFixed(1)}`);
    }
    out.push('M' + pts.join('L') + 'Z');
  }
  return out.join('');
}
