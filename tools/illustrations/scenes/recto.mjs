// Recto's scene (engraving guide §2.2, row S36): the temple of pages the owner liked, kept line for line
// and re-cut as an engraving (tapered contours, tone on the shadow side of each column, the portico's shadow
// on the cella wall), now standing in a temenos: a walled precinct. Recto runs in the browser and uploads
// nothing; the files stay inside the wall. Stoas line the court, their back walls shelves of bound volumes;
// cypresses, a paved court, a ruled sky with a glory behind the pediment, a few folios in the air.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { plate, camera, spline, mix, lerp, smooth, rng } from './engrave.mjs';
import { occluders, area } from './world.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
/* the temple as the owner approved it (round two), traced from its own vector source, not redrawn */
const TEMPLE = fs.readFileSync(path.join(here, 'recto-temple.svg'), 'utf8');

/** The paths of the approved temple as polylines, with their class (main, f: secondary, h: hatching). */
function templePaths() {
  const out = [];
  for (const m of TEMPLE.matchAll(/<path(?: class="(\w)")? d="([^"]+)"\/>/g)) {
    const cls = m[1] ?? 'main';
    for (const sub of parse(m[2])) out.push({ cls, pts: sub.pts, closed: sub.closed });
  }
  return out;
}

/** A small SVG path parser (M L H V C A Z, absolute and relative) into polylines. */
function parse(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const subs = [];
  let i = 0, cmd = '', cur = [0, 0], start = [0, 0], pts = null;
  const num = () => +toks[i++];
  const isNum = () => i < toks.length && !/[a-zA-Z]/.test(toks[i]);
  const begin = (p) => { if (pts && pts.length > 1) subs.push({ pts, closed: false }); pts = [p]; start = p; };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === 'Z') { if (pts) { pts.push(start); subs.push({ pts, closed: true }); pts = null; } cur = start; continue; }
    if (C === 'M') { const p = [num(), num()]; cur = rel ? [cur[0] + p[0], cur[1] + p[1]] : p; begin(cur); cmd = rel ? 'l' : 'L'; continue; }
    if (C === 'L') { const p = [num(), num()]; cur = rel ? [cur[0] + p[0], cur[1] + p[1]] : p; pts.push(cur); continue; }
    if (C === 'H') { const x = num(); cur = [rel ? cur[0] + x : x, cur[1]]; pts.push(cur); continue; }
    if (C === 'V') { const y = num(); cur = [cur[0], rel ? cur[1] + y : y]; pts.push(cur); continue; }
    if (C === 'C') {
      const a = [num(), num()], b = [num(), num()], e = [num(), num()];
      const [A, B, E] = rel ? [a, b, e].map((p) => [cur[0] + p[0], cur[1] + p[1]]) : [a, b, e];
      const p0 = cur;
      for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * A[0] + 3 * u * t * t * B[0] + t * t * t * E[0], u * u * u * p0[1] + 3 * u * u * t * A[1] + 3 * u * t * t * B[1] + t * t * t * E[1]]); }
      cur = E; continue;
    }
    if (C === 'A') {
      const rx = num(), ry = num(); num(); const large = num(), sweep = num(); const e = [num(), num()];
      const E = rel ? [cur[0] + e[0], cur[1] + e[1]] : e;
      /* endpoint arc to centre form (circles and ellipses without rotation, which is all the file uses) */
      const [x1, y1] = cur, [x2, y2] = E;
      const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
      let rxs = rx, rys = ry;
      const lam = (dx * dx) / (rxs * rxs) + (dy * dy) / (rys * rys);
      if (lam > 1) { rxs *= Math.sqrt(lam); rys *= Math.sqrt(lam); }
      const sgn = large === sweep ? -1 : 1;
      const num2 = rxs * rxs * rys * rys - rxs * rxs * dy * dy - rys * rys * dx * dx;
      const co = sgn * Math.sqrt(Math.max(0, num2 / (rxs * rxs * dy * dy + rys * rys * dx * dx)));
      const cxp = (co * rxs * dy) / rys, cyp = (-co * rys * dx) / rxs;
      const cx = cxp + (x1 + x2) / 2, cy = cyp + (y1 + y2) / 2;
      const a1 = Math.atan2((y1 - cy) / rys, (x1 - cx) / rxs);
      let a2 = Math.atan2((y2 - cy) / rys, (x2 - cx) / rxs);
      let da = a2 - a1;
      if (sweep && da < 0) da += 2 * Math.PI; else if (!sweep && da > 0) da -= 2 * Math.PI;
      const n = Math.max(6, Math.ceil((Math.abs(da) * Math.max(rxs, rys)) / 2));
      for (let k = 1; k <= n; k++) { const a = a1 + (da * k) / n; pts.push([cx + Math.cos(a) * rxs, cy + Math.sin(a) * rys]); }
      cur = E; continue;
    }
    i++;
  }
  if (pts && pts.length > 1) subs.push({ pts, closed: false });
  return subs;
}

function precinct(P, cfg) {
  const cam = camera(cfg.cam);
  const pr = (x, y, z) => cam.P([x, y, z]);
  const occ = occluders();
  const O = () => occ.list.slice();
  const r = rng(36);
  const ln = (layer, pts, w, o = {}) => P.line(layer, pts, w, { occl: O(), taper: o.taper ?? 18, ...o });
  const vp = [cfg.cam.cx, cfg.cam.hy];
  const ZT = 23.3; // the temple's front, metres from the eye
  /* the approved temple's 2D frame: 420 old units for 10 m, its stylobate (old y 742) on the ground at ZT */
  const k = (cfg.cam.f * 10) / ZT / 420;
  const base = pr(0, 0, ZT);
  const T = ([x, y]) => [cfg.cam.cx + (x - 800) * k, base[1] + (y - 742) * k];
  const M = 'mid';

  /* ================= FRONT: two folios close to the eye ================= */
  const folio = (layer, c, w, h, rot, curl, wk = 1) => {
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const at = (u, v) => [c[0] + u * cs - v * sn, c[1] + u * sn + v * cs];
    const A = at(-w / 2, -h / 2), B = at(w / 2, -h / 2), Cc = at(w / 2, h / 2), Dd = at(-w / 2, h / 2);
    /* the curled corner: the sheet bends up at its lower right, its underside in tone */
    const c1 = at(w / 2, h / 2 - curl), c2 = at(w / 2 - curl, h / 2);
    const tip = at(w / 2 - curl * 0.55, h / 2 - curl * 1.25);
    const sheet = [A, B, c1, ...spline([c1, at(w / 2 - curl * 0.35, h / 2 - curl * 0.35), c2], 2).slice(1, -1), c2, Dd];
    ln(layer, [...sheet, A], 1.0 * wk, { taper: 30 });
    const under = spline([c1, tip, c2], 2);
    ln(layer, under, 0.9 * wk, { taper: 12 });
    P.hatch(layer, [c1, tip, c2], { angle: (rot * 180) / Math.PI + 60, s: 2.6, w: 0.45, occl: O() });
    /* a few ruled lines of writing (no letters), short at the paragraph ends */
    for (let i = 0; i < 6; i++) {
      const v = -h / 2 + h * (0.2 + i * 0.11), wl = w * (i % 3 === 2 ? 0.45 : 0.72);
      ln(layer, [at(-w / 2 + w * 0.13, v), at(-w / 2 + w * 0.13 + wl, v)], 0.45 * wk, { taper: 'lens' });
    }
    /* its shadow on nothing: a soft ruled tone under the lower edge, the sheet floats */
    occ.add(sheet);
  };
  for (const f of cfg.folios) folio('front', f.c, f.w, f.h, f.rot, f.curl);

  /* ================= MID: the temple (approved), re-cut ================= */
  const paths = templePaths();
  const tPts = paths.map((p) => ({ ...p, pts: p.pts.map(T) }));
  /* columns: their outer contours from the file, found by their place (tall closed shapes) */
  const tBox = (() => { const xs = tPts.flatMap((p) => p.pts.map((q) => q[0])), ys = tPts.flatMap((p) => p.pts.map((q) => q[1])); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; })();
  for (const p of tPts) {
    const [x0, y0, x1, y1] = [Math.min(...p.pts.map((q) => q[0])), Math.min(...p.pts.map((q) => q[1])), Math.max(...p.pts.map((q) => q[0])), Math.max(...p.pts.map((q) => q[1]))];
    const horiz = y1 - y0 < 1.5, vert = x1 - x0 < 1.5;
    /* weights: the file's main lines become tapered contours, heavier where they face away from the light
       (right and lower edges); secondary lines fine; its hatching hairline */
    let w = p.cls === 'main' ? 1.15 : p.cls === 'f' ? 0.8 : 0.55;
    if (p.cls === 'main' && vert && x0 > cfg.cam.cx) w *= 1.2;
    if (p.cls === 'main' && horiz && y0 > tBox[3] - 50 * k) w *= 1.15;
    ln(M, p.pts, w * cfg.tw, { taper: p.cls === 'h' ? 'lens' : 24, occl: O() });
  }
  /* tone: the shadow side of each column (contour hatching that follows its round), the portico's shadow on
     the cella wall, the tympanum, the steps' risers */
  const colX = [470, 590, 710, 890, 1010, 1130], colW = 62;
  for (const cx0 of colX) {
    const top = T([cx0, 482]), bot = T([cx0, 690]);
    const hw = (colW / 2) * k;
    for (let i = 0; i < 5; i++) {
      /* lines bunch toward the shadow edge: cos spacing over the right 40 % of the shaft */
      const f = 0.25 + 0.75 * Math.sin(((i + 1) / 6) * Math.PI / 2);
      const x = top[0] + hw * f * 0.92;
      ln(M, [[x, top[1] + 4 * k], [x, bot[1] - 4 * k]], (0.42 + 0.06 * i) * cfg.tw, { taper: 'lens' });
    }
    /* entasis: a faint swelling line on the lit side */
    ln(M, spline([[top[0] - hw * 0.96, top[1]], [top[0] - hw * 1.02, (top[1] + bot[1]) / 2], [bot[0] - hw, bot[1]]], 3), 0.42 * cfg.tw, { taper: 'lens' });
  }
  /* the portico's shadow on the cella wall, under the architrave, falling down and to the right */
  {
    const a = T([500, 475]), b = T([1150, 475]);
    const band = [a, b, T([1150, 540]), T([500, 520])];
    P.hatch(M, band, { angle: 0, s: 3.4, w: 0.5 * cfg.tw, occl: O(), drop: (x) => smooth(T([1160, 0])[0], T([520, 0])[0], x) * 0.5 + 0.5 });
  }
  /* the tympanum in half tone: ruling parallel to the cornice's right rake (the shadow side) */
  {
    const apex = T([800, 300]), l = T([420, 395]), rr = T([1180, 395]);
    P.hatch(M, [apex, rr, l], { angle: 0, s: 4.6, w: 0.45 * cfg.tw, occl: O(), drop: (x) => (x > apex[0] ? 0.85 : 0.35) });
  }
  /* the steps' risers: a fine ruling on each riser, densest in the shadow of each tread */
  for (const [yt, x0, x1] of [[700, 420, 1180], [714, 400, 1200], [728, 380, 1220]]) {
    P.hatch(M, [T([x0, yt + 2]), T([x1, yt + 2]), T([x1, yt + 8]), T([x0, yt + 8])], { angle: 0, s: 2.8, w: 0.42 * cfg.tw, occl: O() });
  }
  /* the temple hides what is behind it */
  occ.add([T([380, 742]), T([380, 470]), T([370, 400]), T([800, 285]), T([1230, 400]), T([1220, 470]), T([1220, 742])]);

  /* the handover thread: the stylobate continues across the court as its back edge, to both sides */
  ln(M, [[-40, base[1]], [P.w + 40, base[1]]], 0.7 * cfg.tw, { taper: 300, free: true });

  /* ================= MID: cypresses, stoas, the court, the wall and its gate ================= */
  const cypress = (x, z, h, layer = M) => {
    const b = pr(x, 0, z), t = pr(x, h, z);
    const wd = Math.abs(pr(x + 1.1, 0, z)[0] - b[0]);
    const H = b[1] - t[1];
    /* a flame: widest a third of the way up, the tip slightly bent; its mass built from short curved
       strokes that turn with the foliage, dense on the shadow (right) side */
    const outline = (side) => spline([[b[0] + side * wd * 0.35, b[1]], [b[0] + side * wd * 0.95, b[1] - H * 0.28], [b[0] + side * wd * 0.8, b[1] - H * 0.6], [t[0] + side * wd * 0.35, b[1] - H * 0.88], [t[0] + wd * 0.06, t[1]]], 3);
    const L0 = outline(-1), R0 = outline(1);
    ln(layer, L0, 0.7 * cfg.tw, { taper: 30 });
    ln(layer, R0, 1.15 * cfg.tw, { taper: 30 });
    const n = Math.round(H / 5.5);
    for (let i = 1; i < n; i++) {
      const t2 = i / n, yy = b[1] - H * t2;
      const wl = Math.max(0.2, (t2 < 0.3 ? 0.4 + t2 * 2 : 1 - (t2 - 0.3) * 1.2)) * wd * 0.9;
      const cx = lerp(b[0], t[0], t2);
      /* each stroke a little arc, starting right of centre on the dark side */
      const x0 = cx - wl * (0.1 + r() * 0.3), x1 = cx + wl * (0.9 + r() * 0.1);
      ln(layer, [[x0, yy + 1.5], [(x0 + x1) / 2, yy - 1.4], [x1, yy + 1]], 0.48 * cfg.tw, { taper: 'lens' });
    }
    occ.add([...L0, ...R0.slice().reverse()]);
  };
  for (const c of cfg.cypresses) cypress(...c);

  /** a stoa along x = xs (its front colonnade), from z0 to z1, facing the court; its back wall a library */
  const stoa = (xs, side, z0, z1) => {
    const xb = xs + side * 5, H = 6.2, E = 1.2;
    const cols = [];
    for (let z = z0 + 0.6; z < z1; z += 3.2) cols.push(z);
    /* columns, nearest first: each a shaft with an echinus and an abacus, its shadow side ruled */
    for (const z of cols) {
      const b = pr(xs, 0, z), t = pr(xs, H, z);
      const hw = Math.abs(pr(xs + 0.33, 0, z)[0] - b[0]);
      if (b[0] < -40 || b[0] > P.w + 40) continue;
      const sh = [[b[0] - hw, b[1]], [b[0] + hw, b[1]], [t[0] + hw * 0.85, t[1]], [t[0] - hw * 0.85, t[1]]];
      ln(M, [sh[0], sh[3]], (side < 0 ? 0.7 : 1.1) * cfg.tw, { taper: 30 });
      ln(M, [sh[1], sh[2]], (side < 0 ? 1.1 : 0.7) * cfg.tw, { taper: 30 });
      for (let i = 0; i < 3; i++) {
        const f = 0.35 + i * 0.22;
        ln(M, [[b[0] + hw * f, b[1] - 2], [t[0] + hw * 0.85 * f, t[1] + 2]], 0.42 * cfg.tw, { taper: 'lens' });
      }
      const cap = [[t[0] - hw * 1.5, t[1]], [t[0] + hw * 1.5, t[1]], [t[0] + hw * 1.5, t[1] - hw * 0.5], [t[0] - hw * 1.5, t[1] - hw * 0.5]];
      ln(M, [...cap, cap[0]], 0.7 * cfg.tw, { taper: 0 });
      occ.add(sh); occ.add(cap);
    }
    /* entablature along the front, and the roof's edge */
    const e0 = pr(xs, H, z0), e1 = pr(xs, H, z1), e2 = pr(xs, H + E, z1), e3 = pr(xs, H + E, z0);
    const ent = [e0, e1, e2, e3];
    ln(M, [e3, e2], 1.2 * cfg.tw, { taper: 60 });
    ln(M, [e0, e1], 0.9 * cfg.tw, { taper: 60 });
    ln(M, [mix(e0, e3, 0.45), mix(e1, e2, 0.45)], 0.5 * cfg.tw, { taper: 60 });
    /* triglyphs: short verticals on the frieze, three drawn in full, the rest thinner */
    for (let z = z0 + 0.6, i = 0; z < z1; z += 1.6, i++) {
      const a = pr(xs, H + E * 0.5, z), b2 = pr(xs, H + E * 0.95, z);
      ln(M, [a, b2], (i < 3 ? 0.6 : 0.42) * cfg.tw, { taper: 'lens' });
    }
    occ.add(ent);
    /* the ceiling (soffit) seen from below: deep tone, ruled toward the vanishing point */
    const s0 = pr(xs, H, z0), s1 = pr(xs, H, z1), s2 = pr(xb, H, z1), s3 = pr(xb, H, z0);
    if (Math.abs(area([s0, s1, s2, s3])) > 50) P.tone(M, [s0, s1, s2, s3], 2, { vp, s: 4.4, w: 0.45 * cfg.tw, occl: O(), angle2: 0 });
    /* the back wall: shelves of bound volumes, row by row; spines as short verticals, a few leaning */
    const shelfH = [0.4, 1.3, 2.2, 3.1, 4.0, 4.9];
    for (const h of shelfH) {
      const a = pr(xb, h, z0), b2 = pr(xb, h, z1);
      ln(M, [a, b2], 0.6 * cfg.tw, { taper: 60 });
      let z = z0 + 0.1;
      while (z < z1 - 0.1) {
        const wv = 0.05 + r() * 0.07;
        const tall = 0.55 + r() * 0.25;
        const p0 = pr(xb, h, z), p1 = pr(xb, h + tall, z + (r() < 0.06 ? 0.15 : 0));
        if (Math.abs(p0[1] - p1[1]) > 4) ln(M, [p0, p1], 0.4 * cfg.tw, { taper: 'lens' });
        z += wv + (r() < 0.04 ? 0.25 : 0);
      }
    }
    /* the back wall's shadow tone at the top (under the roof) */
    P.hatch(M, [pr(xb, H, z0), pr(xb, H, z1), pr(xb, 5.6, z1), pr(xb, 5.6, z0)], { vp, s: 3.4, w: 0.42 * cfg.tw, occl: O() });
    occ.add([pr(xs, 0, z0), pr(xs, 0, z1), pr(xs, H + E, z1), pr(xs, H + E, z0)]);
  };
  if (cfg.stoas) { stoa(-14, -1, 9, 27); stoa(14, 1, 9, 27); }

  /* the court: paving in courses (lines across), each course's joints offset from the last, finer and
     sparser as they recede; no grid */
  {
    let last = 1e9, row = 0;
    for (let z = 9.5; z < ZT; z += 1.1) {
      const y = pr(0, 0, z)[1];
      if (last - y < 9) continue;
      last = y; row++;
      ln(M, [pr(-13, 0, z), pr(13, 0, z)], 0.45 * cfg.tw, { taper: 'lens' });
      const zn = z + 1.1;
      for (let x = -13 + (row % 2) * 0.9; x < 13; x += 1.8) {
        if (r() < 0.25) continue;
        ln(M, [pr(x, 0, z), pr(x, 0, Math.min(zn, ZT - 0.2))], 0.4 * cfg.tw, { taper: 'lens' });
      }
    }
  }

  /* the precinct wall in front, its coping, its courses; the gate: two posts with a lintel */
  if (cfg.wall) {
    const zw = cfg.wall, hw2 = 1.5, gx = cfg.gate ?? 3.2;
    for (const side of [-1, 1]) {
      const x0 = side * gx, x1 = side * 40;
      const a = pr(x0, 0, zw), b = pr(x1, 0, zw), c = pr(x1, hw2, zw), d = pr(x0, hw2, zw);
      ln(M, [d, c], 1.3 * cfg.tw, { taper: 80 });
      ln(M, [pr(x0, hw2 - 0.12, zw), pr(x1, hw2 - 0.12, zw)], 0.55 * cfg.tw, { taper: 80 });
      if (cfg.wallCourses) {
        /* the wall as the subject of the column's foot: squared blocks, joints offset course by course */
        for (let h = 0.3, row = 0; h < hw2 - 0.15; h += 0.3, row++) {
          ln(M, [pr(x0, h, zw), pr(x1, h, zw)], 0.45 * cfg.tw, { taper: 'lens' });
          for (let x = x0 + side * (0.35 + (row % 2) * 0.35); Math.abs(x) < 9; x += side * 0.7) ln(M, [pr(x, h, zw), pr(x, h + 0.3, zw)], 0.4 * cfg.tw, { taper: 'lens' });
        }
      } else ln(M, [pr(x0, 0.7, zw), pr(x1, 0.7, zw)], 0.42 * cfg.tw, { taper: 'lens' });
      /* the coping's shadow on the wall face */
      P.hatch(M, [pr(x0, hw2 - 0.12, zw), pr(x1, hw2 - 0.12, zw), pr(x1, hw2 - 0.35, zw), pr(x0, hw2 - 0.35, zw)], { angle: 0, s: 2.6, w: 0.42 * cfg.tw, occl: O() });
      /* the post */
      const pw = 0.7, ph = 4.2;
      const px0 = side * gx, px1 = side * (gx + pw);
      const p = [pr(px0, 0, zw - 0.1), pr(px1, 0, zw - 0.1), pr(px1, ph, zw - 0.1), pr(px0, ph, zw - 0.1)];
      ln(M, [p[0], p[3]], (side < 0 ? 0.8 : 1.4) * cfg.tw, { taper: 30 });
      ln(M, [p[1], p[2]], (side < 0 ? 1.4 : 0.8) * cfg.tw, { taper: 30 });
      ln(M, [pr(px0 - side * 0.12, ph, zw - 0.1), pr(px1 + side * 0.12, ph, zw - 0.1)], 1.1 * cfg.tw, { taper: 0 });
      ln(M, [pr(px0 - side * 0.12, ph + 0.3, zw - 0.1), pr(px1 + side * 0.12, ph + 0.3, zw - 0.1)], 0.7 * cfg.tw, { taper: 0 });
      occ.add(p);
      occ.add([a, b, c, d]);
    }
  }

  /* ================= BACK: the ruled sky, the glory behind the pediment, distant sheets ================= */
  const apex = T([800, 282]);
  {
    /* the glory: long and short rays alternating, from just above the pediment out into the sky */
    const n = cfg.rays ?? 64;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + 0.2 + (i / n) * (Math.PI - 0.4);
      const r0 = 14 + (i % 2) * 8, r1 = (i % 2 ? 0.55 : 1) * cfg.glory * (0.9 + r() * 0.12);
      ln('back', [[apex[0] + Math.cos(a) * r0, apex[1] + Math.sin(a) * r0], [apex[0] + Math.cos(a) * r1, apex[1] + Math.sin(a) * r1]], (i % 2 ? 0.45 : 0.6) * cfg.tw, { taper: 'lens', e: 0.15 });
    }
    /* sky ruling: long fine horizontal lines, each broken once or twice, left out where the glory burns */
    for (let y = cfg.skyTop; y < cfg.skyBottom; y += 7) {
      let x = -10;
      while (x < P.w) {
        const x1 = Math.min(P.w + 10, x + 180 + r() * 420);
        const pts = [];
        for (let xx = x; xx <= x1; xx += 6) {
          const d = Math.hypot(xx - apex[0], (y - apex[1]) * 1.6);
          if (d < cfg.glory * 0.5) { if (pts.length > 1) ln('back', pts.slice(), 0.4 * cfg.tw, { taper: 40 }); pts.length = 0; continue; }
          pts.push([xx, y]);
        }
        if (pts.length > 1) ln('back', pts, 0.4 * cfg.tw, { taper: 40 });
        x = x1 + 8 + r() * 30;
      }
    }
    for (const f of cfg.farFolios) folio('back', f.c, f.w, f.h, f.rot, f.curl, 0.7);
  }

  return { T, k, base };
}

export function rectoDesktop() {
  const W = 1600, H = 1000;
  const P = plate({ w: W, h: H, seed: 3601, fade: [0.18, 0.18], wk: 1.5,
    clear: [{ x0: 630, y0: 656, x1: 970, y1: 940, f: 30 }], quiet: [{ x0: 500, y0: 140, x1: 1100, y1: 530, keep: 0.6 }] });
  precinct(P, {
    cam: { f: 900, cx: 800, hy: 520, eye: [0, 3.5, 0] }, tw: 1, stoas: true, wall: 9,
    cypresses: [[-11.6, 24.5, 12.5], [12.2, 26, 11.5], [-19.5, 31, 13]],
    folios: [{ c: [205, 330], w: 96, h: 124, rot: -0.42, curl: 26 }, { c: [1405, 300], w: 84, h: 110, rot: 0.55, curl: 22 }],
    farFolios: [{ c: [430, 150], w: 26, h: 34, rot: 0.6, curl: 7 }, { c: [1210, 175], w: 22, h: 29, rot: -0.3, curl: 6 }, { c: [1520, 470], w: 18, h: 24, rot: 0.9, curl: 5 }],
    glory: 720, skyTop: 120, skyBottom: 330,
  });
  return { P, svg: () => P.svg({ title: 'Recto: a temple of pages in its precinct', desc: 'The temple of pages, its columns stacks of paper, in a walled precinct: stoas whose back walls are shelves of bound volumes, cypresses, a paved court, a ruled sky with a glory behind the pediment, a few folios in the air.' }) };
}

/** The phone master: the temple and its gate fill the column; the stoas drop out. */
export function rectoPhone() {
  const W = 480, H = 900;
  const P = plate({ w: W, h: H, seed: 3602, fade: [0.18, 0.18], wk: 1.8, one: 'phone',
    clear: [{ x0: 104, y0: 500, x1: 376, y1: 712, f: 22 }], quiet: [{ x0: 60, y0: 110, x1: 420, y1: 485, keep: 0.6 }] });
  precinct(P, {
    cam: { f: 470, cx: 240, hy: 400, eye: [0, 3.5, 0] }, tw: 0.85, stoas: false, wall: 3.2, gate: 1.0, rays: 40, wallCourses: true,
    cypresses: [[-11.2, 25, 12.5], [11.4, 26, 11.5]],
    folios: [{ c: [52, 560], w: 50, h: 64, rot: -0.4, curl: 14 }, { c: [430, 600], w: 44, h: 58, rot: 0.5, curl: 12 }],
    farFolios: [{ c: [400, 190], w: 16, h: 21, rot: 0.6, curl: 5 }, { c: [80, 230], w: 14, h: 18, rot: -0.5, curl: 4 }],
    glory: 260, skyTop: 90, skyBottom: 90,
  });
  return { P, svg: () => P.svg({ title: 'Recto: a temple of pages in its precinct', desc: 'The temple of pages behind the gate of its walled precinct, cypresses beside it, a glory behind the pediment.' }) };
}
