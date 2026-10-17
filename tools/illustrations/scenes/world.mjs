// A street in 3D for the scene plates: street coordinates (s along the street, l across it, h up), one
// camera, and faces drawn front to back so that each drawn face hides what lies behind it.
import { camera, inside, bbox, clipRing } from './engrave.mjs';

/**
 * segs: [{ s0, a }] the street's direction (radians, to the right of the camera's forward) from s0 on.
 * cam: camera options; at: { s, l } where the camera stands; grade: fall per metre along s.
 */
export function street({ cam: co, at, segs, grade = 0.07, ground = null }) {
  const cam = camera(co);
  /* the street's centre line as joined straight runs */
  const runs = [];
  let ox = 0, oz = 0;
  segs.forEach((g, i) => {
    const s1 = segs[i + 1]?.s0 ?? 1e4;
    runs.push({ s0: g.s0, s1, a: g.a, ox, oz });
    ox += Math.sin(g.a) * (s1 - g.s0); oz += Math.cos(g.a) * (s1 - g.s0);
  });
  const run = (s) => runs.find((r) => s < r.s1) ?? runs[runs.length - 1];
  const gnd = ground ?? ((s) => -grade * s);
  /** world point; h is above the datum (absolute), not above the ground */
  function W(s, l, h, rr) {
    const r = rr ?? run(s);
    const d = s - r.s0;
    const x = r.ox + Math.sin(r.a) * d + Math.cos(r.a) * l;
    const z = r.oz + Math.cos(r.a) * d - Math.sin(r.a) * l;
    return [x, h, z];
  }
  /* the camera stands at (at.s, at.l) */
  const c0 = W(at.s, at.l, 0);
  const shift = ([x, y, z]) => [x - c0[0], y, z - c0[2]];
  const P = (s, l, h, rr) => cam.P(shift(W(s, l, h, rr)));
  const Z = (s, l, h, rr) => cam.project(shift(W(s, l, h, rr)))[2];
  const vp = (a, slope = 0) => cam.vp(a, slope);
  return { cam, P, Z, W, g: gnd, runs, run, vp };
}

/** Signed area of a screen polygon (positive: clockwise on screen, y down). */
export function area(pts) {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]);
  return a / 2;
}

/** The occluders drawn so far, and a guard that tells whether a screen polygon is worth drawing. */
export function occluders() {
  const list = [];
  return {
    list,
    add(pts) { if (!pts || pts.length < 3) return; const c = clipRing(pts, [-40, -40, 1640, 1340]); if (c.length > 2 && Math.abs(area(c)) > 1) list.push(c); },
    /* is the polygon entirely hidden? (all corners and its centre hidden) */
    covered(pts) {
      const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
      return [...pts, c].every((p) => list.some((rg) => inside(p, [rg])));
    },
    bbox: (pts) => bbox(pts),
  };
}
