/* Damped springs, stepped every frame (liveliness research §5: every motion is a spring, so motions
   add instead of switching, and any target can change mid-way without a jump). Semi-implicit Euler
   in fixed 1/240 s substeps: stable for the stiffest spring here (k 260) at any frame rate. */
export type Spring = { x: number; v: number; to: number; k: number; c: number };

/** k: stiffness (1/s²); zeta: damping ratio (1 critical, < 1 overshoots). */
export function spring(x: number, k: number, zeta: number): Spring {
  return { x, v: 0, to: x, k, c: 2 * Math.sqrt(k) * zeta };
}
export function retune(s: Spring, k: number, zeta: number) {
  s.k = k; s.c = 2 * Math.sqrt(k) * zeta;
}
const H = 1 / 240;
export function step(s: Spring, dt: number) {
  let t = dt;
  while (t > 1e-6) {
    const h = Math.min(H, t);
    s.v += (s.k * (s.to - s.x) - s.c * s.v) * h;
    s.x += s.v * h;
    t -= h;
  }
}
/** At rest: close enough to snap onto the target (an exact frame, not a blend near it). */
export function settle(s: Spring, eps = 2e-3): boolean {
  if (Math.abs(s.to - s.x) < eps && Math.abs(s.v) < eps * 20) { s.x = s.to; s.v = 0; return true; }
  return false;
}
