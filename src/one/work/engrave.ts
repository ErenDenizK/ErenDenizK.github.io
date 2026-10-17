/* A small engraving kit for the How I made plates (round 6, S29; engraving guide 1.2 and 1.3), run at
   build time. Every line is a tapered filled shape: thin at both ends, full in the middle, as a burin
   cuts it, so no plate has the uniform CAD line the owner called cheap. Tone is hatching: parallel cuts
   clipped to a shape, never a fill. Units are the plate's user units (CSS px at the desktop width). */
export type Pt = [number, number];

const f = (n: number) => n.toFixed(1);

/** A tapered line through the points: width w in the middle, `end` times w at both ends. */
export function cut(pts: Pt[], w: number, end = 0.2): string {
  if (pts.length < 2) return '';
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = acc[acc.length - 1] || 1;
  const L: Pt[] = [], R: Pt[] = [];
  pts.forEach((p, i) => {
    const t = acc[i] / tot;
    const ww = (w * (end + (1 - end) * Math.pow(Math.sin(Math.PI * t), 0.6))) / 2;
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    L.push([p[0] + nx * ww, p[1] + ny * ww]);
    R.push([p[0] - nx * ww, p[1] - ny * ww]);
  });
  return 'M' + [...L, ...R.reverse()].map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

/** A straight line as a cut, sampled so the taper reads. */
export const seg = (a: Pt, b: Pt, w: number, end = 0.2) => cut(Array.from({ length: 9 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / 8, a[1] + ((b[1] - a[1]) * i) / 8] as Pt), w, end);

/** Points on an ellipse arc (degrees, 0 = +x, clockwise on screen). */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt; });
}

/** Parallel hatch cuts across a box at an angle (degrees), spaced `gap`; clip them with a clipPath. */
export function hatch(x: number, y: number, w: number, h: number, angle: number, gap: number, wt: number): string {
  const a = (angle * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a);
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + gap;
  const out: string[] = [];
  for (let s = -R; s <= R; s += gap) {
    const ox = cx - dy * s, oy = cy + dx * s;
    out.push(seg([ox - dx * R, oy - dy * R], [ox + dx * R, oy + dy * R], wt, 0.35));
  }
  return out.join('');
}
