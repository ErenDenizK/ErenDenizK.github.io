/* Where an object looks, shared by the media stage (media.ts) and the live frame engine
   (live/engine.ts), so both answer the pointer the same way (site audit 2026-10-10 §4: the object
   leaned toward the pointer anywhere on the page, so it was almost always turned and the reach for
   "See the work" turned it too).

   The lean is a direction and a gain. The direction is the pointer's offset from the object's
   centre over a reach of about one object width (full lean there); the gain fades the lean out
   between 1 and 1.8 reaches, so a pointer across the page leaves the object at rest. A pointer
   that has left the window is no pointer at all. */

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const clamp1 = (x: number) => Math.max(-1, Math.min(1, x));

/** The lean toward a pointer at (px, py) for an object laid out at `r`: mx, my in -1..1 (right and
    down are positive), already faded with distance. */
export function aim(r: DOMRect, px: number, py: number): { mx: number; my: number } {
  const R = Math.max(320, r.width);
  const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
  const g = 1 - smooth(R, 1.8 * R, Math.hypot(dx, dy));
  return { mx: clamp1(dx / R) * g, my: clamp1(dy / R) * g };
}

/** The exact grid cell a resting pose settles on, in grid units. `t` is where the pose is going,
    `c` where it is now. The cell ahead in the direction of travel wins unless it is more than 0.7 of
    a cell away, so the last bit of motion continues the hand's movement instead of turning back
    (site audit §3.3: the object used to turn back by itself 300 ms after the hand stopped). */
export function cellFor(t: number, c: number): number {
  const f = Math.floor(t), fr = t - f;
  if (fr < 1e-3) return f;
  if (1 - fr < 1e-3) return f + 1;
  return t >= c ? (1 - fr <= 0.7 ? f + 1 : f) : (fr <= 0.7 ? f : f + 1);
}

/** The pointer has rested this long (ms): time to settle on an exact cell. Long enough that a slow
    hand (a mouse reports at 60-1000 Hz) is not taken for a resting one, short enough that the settle
    is the tail of the hand's own movement rather than a second movement after it. */
export const REST_MS = 90;
