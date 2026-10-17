"""The first-screen plate (guide §2.8 as the first-screen study recommends it: comp A, "The signal").

The Bostancı platform, constructed, not traced (review row S23): one camera that matches the owner's
photograph (eye 1.6 m above the platform, the vanishing point on the page axis, the red signal just
above it), and the station built in that camera's space: the platform and its tactile strips, the
tracks, the catenary, the lattice pylon with its lamp, the station sign (blank: no lettering in a
plate), the billboard (a blank frame: the advertisement shows a stranger), the far shelter, the fence,
the gantry, the trees and the city on the horizon, the sky, the rain. The photograph is placed whole
in the middle (desktop: full height, its vanishing point on the axis; phone: full width under the bar)
and the engraving continues it to both edges; under the photograph the engraving is its twin, which
the arrival shows before the photograph opens from the signal.

People are left out (the walker with the umbrella in the photograph). The construction drawing that
the brief's plate has carried since the first round (circle, horizon, axis, diagonals) is the
scaffold group: it draws first, from the vanishing point.

Groups, in drawing order for the arrival: scaffold, sky, horizon, ground, structure, wires, rain, light.
Each is written as its own SVG file, so the arrival can grow one radial mask per group from the
vanishing point, and the parallax can move them at their depth (sky and horizon: back; ground and
structure: mid; wires and rain: front).

Desktop: 1600 x 1000 units, the photograph at (608.5, 0) 675 x 900, the vanishing point (800, 575.9).
The plate scales with the view's height (1000 units = 1.111 vh).
Phone: 390 x 1000 units, the photograph at (0, 64) 390 x 520, the vanishing point (110.6, 397.1).
Usage: python3 firstplate.py <out-dir>
"""
import math
import random
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from burin import (Plate, Camera, parallel, ruled, rect, arc, bez, lin, radial, add, mul, nz, edge_fade,
                   clear_zone, concentric, resample, fbm, noise)

GROUPS = ('scaffold', 'sky', 'horizon', 'ground', 'structure', 'wires', 'rain', 'light')
ALPHA = {'scaffold': 0.16, 'sky': 0.13, 'horizon': 0.16, 'ground': 0.18, 'structure': 0.2, 'wires': 0.2,
         'rain': 0.12, 'light': 0.22}
# Strength on the page (integration, round 6): beside the full-colour photograph the desktop plate read as
# empty ground at the ladder's values, so the desktop masters carry 1.5 times the alpha (sky and rain 1.3,
# so the weather stays behind the structure); the phone master sits under the words and keeps 1.15.
GAIN = {True: {'sky': 1.3, 'rain': 1.3}, False: {}}
GAIN_ALL = {True: 1.5, False: 1.15}


def alpha(gname, desktop):
    return round(ALPHA[gname] * GAIN[desktop].get(gname, GAIN_ALL[desktop]), 3)


class Scene:
    """The station in one camera. World: x right, y up (platform top = 0), z away from the eye."""

    def __init__(self, P, cam, ox=0.0):
        self.P, self.cam = P, cam

    def pr(self, pts):
        return self.cam.p(np.asarray(pts, float))

    def poly(self, pts3, layer, tone, group=None):
        return self.P.shape(self.pr(pts3), layer, tone=tone, group=group)

    def seg(self, a, b, n=60):
        a = np.asarray(a, float); b = np.asarray(b, float)
        t = np.linspace(0, 1, n)[:, None]
        # sample in depth so the projected line is dense where it is near
        return self.pr(a + (b - a) * t)

    def line3(self, a, b, layer, w, n=80, sid=None, fade_far=True, wfar=0.45):
        a = np.asarray(a, float); b = np.asarray(b, float)
        t = np.linspace(0, 1, n)
        pts = a + (b - a) * t[:, None]
        z = np.maximum(pts[:, 2], 0.5)
        sp = self.pr(pts)
        if fade_far:
            # weight by distance (atmospheric perspective by weight, guide §1.5)
            k = np.clip(6.0 / z, 0, 1) ** 0.6
            prof = wfar / w + (1 - wfar / w) * k
            self.P.line(sp, layer, w=w, profile=lambda tt, prof=prof: np.interp(tt, np.linspace(0, 1, len(prof)), prof), sid=sid, step=1.0)
        else:
            self.P.line(sp, layer, w=w, sid=sid, step=1.0)

    def box(self, x0, x1, y0, y1, z0, z1, layer, base=0.12, hatch=True, sp=3.2, contour=1.1, lit_tone=None):
        """A box: its visible faces (front z0, top, the side toward the eye) with tone by orientation."""
        cam = self.cam
        ex = cam.eye
        faces = []
        # front (facing -z), top (+y), left (-x) or right (+x) whichever faces the eye, bottom if below eye
        faces.append(('front', [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], base + 0.05))
        if y1 < ex[1]:
            faces.append(('top', [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], base - 0.08 if lit_tone is None else lit_tone))
        else:
            faces.append(('bottom', [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], base + 0.45))
        if x1 < ex[0]:
            faces.append(('right', [(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], base + 0.42))
        elif x0 > ex[0]:
            faces.append(('left', [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], base + 0.02))
        g = self.P.nid
        ids = []
        for name, f, t in faces:
            sid = self.poly(f, layer, tone=max(0, t), group=g)
            ids.append((name, sid, f))
        return ids


def build(desktop=True, seed=11):
    rng = random.Random(seed)
    if desktop:
        W, H = 1600, 1000
        S = 0.349                      # plate units per photograph pixel
        PX, PY = 608.5, 0.0            # the photograph's top-left in the plate
    else:
        W, H = 390, 1000
        S = 390 / 1932
        PX, PY = 0.0, 64.0
    VPX, VPY = PX + 548 * S, PY + 1650 * S
    f = 1859 * S
    P = Plate(W, H, res=2, seed=seed)
    for g in GROUPS:
        P.layer(g)
    cam = Camera(eye=(0, 1.6, 0), target=(0, 1.6, 10), f=f, cx=VPX, cy=VPY)
    sc = Scene(P, cam)
    photo = (PX, PY, PX + 1932 * S, PY + 2576 * S)

    # ------------------------------------------------------------------ masks: the text's hush
    if desktop:
        # the brief's frame (comp A: 640 x 378 centred on the axis, from y 132) and its name line
        def hush(X, Y):
            def box(x0, y0, x1, y1, soft):
                dx = np.maximum(np.maximum(x0 - X, X - x1), 0); dy = np.maximum(np.maximum(y0 - Y, Y - y1), 0)
                return np.clip(1 - np.hypot(dx, dy) / soft, 0, 1)
            v = 1 - 0.6 * box(480, 132, 1120, 510, 50)
            v = v * (1 - 0.8 * box(520, 160, 1080, 236, 30))
            sides = np.clip(np.minimum(X, W - X) / 120, 0, 1) ** 1.2
            return v * sides
    else:
        def hush(X, Y):
            # the name in the photograph's sky, the lede and the rows on the platform's continuation
            v = np.ones_like(X, dtype=float)
            v = v * np.where((Y > 96) & (Y < 200), 0.35, 1.0)
            v = v * np.where(Y > 600, 0.7, 1.0)
            return v

    # ------------------------------------------------------------------ the sky (back)
    sky = P.shape(rect(0, 0, W, VPY - 8), 'sky', tone=lambda X, Y: np.clip(
        0.3 * ((Y / VPY) ** 1.4) + 0.16 * (fbm(X / 300, Y / 110, 4) - 0.5) + 0.1 * (fbm(X / 900, Y / 260, 8) - 0.5), 0, 1))
    ruling = []
    y = 5.0
    while y < VPY:
        ruling.append(np.array([[x, y + 0.6 * math.sin(x / 170 + y * 0.3)] for x in np.arange(-4, W + 6, 10.0)]))
        y += 3.6 + 3.4 * (1 - y / VPY)       # closer toward the horizon
    # clouds by leaving the ruling out (guide §1.3): soft breaks where the cloud field is light
    P.hatch(sky, ruling, t0=0.08, t1=0.42, w0=0.4, w1=0.8,
            mask=lambda X, Y: np.clip((fbm(X / 220, Y / 46, 21) - 0.3) / 0.12, 0, 1) * hush(X, Y))

    # ------------------------------------------------------------------ the horizon: city and trees
    # far city: blocks at 120-320 m, simple boxes; each window row suggested by its reveal shadow only
    blocks = []
    x = -260.0
    while x < 300:
        w = rng.uniform(9, 22); d = rng.uniform(10, 18); h = rng.uniform(9, 26)
        z = rng.uniform(150, 300)
        blocks.append((x, x + w, 0 - 2.0, h, z, z + d))
        x += w + rng.uniform(1, 9)
    blocks.sort(key=lambda b: -b[4])
    for (x0, x1, y0, y1, z0, z1) in blocks:
        ids = sc.box(x0, x1, y0, y1, z0, z1, 'horizon', base=0.2)
        for name, sid, fc in ids:
            if name == 'front':
                # window reveals: short horizontal strokes in rows (three rows drawn, the rest implied)
                q = sc.pr(fc)
                xa, xb = q[:, 0].min(), q[:, 0].max(); ya, yb = q[:, 1].min(), q[:, 1].max()
                if xb - xa > 5 and yb - ya > 6:
                    rows = np.arange(ya + 2.2, yb - 1, 2.8)
                    P.hatch(sid, [np.array([[xa, r], [xb, r]]) for r in rows], t0=0.05, t1=0.4, w0=0.4, w1=0.6)
            if name in ('right', 'left'):
                q = sc.pr(fc)
                P.hatch(sid, parallel(90, 2.6, (q[:, 0].min(), q[:, 1].min(), q[:, 0].max(), q[:, 1].max())), t0=0.2, t1=0.7, w0=0.4, w1=0.7)
            P.contour(sc.pr(fc), sid, w=0.55, closed=True, light=False, wmin=0.42)
    # trees: massed crowns at 50-110 m, left of the platform and far right; each crown a few lobes, the
    # shadow side (lower right) in contour hatching that turns with the lobe
    def crown(cx, cy, r, layer, seed):
        lr = random.Random(seed)
        lobes = []
        for k in range(lr.randint(4, 7)):
            a = lr.uniform(-math.pi, 0.2)
            rr = r * lr.uniform(0.45, 0.7)
            lobes.append((cx + math.cos(a) * r * 0.55, cy + math.sin(a) * r * 0.45 + r * 0.15, rr))
        lobes.append((cx, cy + r * 0.25, r * 0.7))
        g = P.nid
        sids = []
        for (lx, ly, rr) in lobes:
            pts = []
            for t in np.linspace(0, 2 * math.pi, 40):
                wob = 1 + 0.12 * math.sin(t * 7 + lx) + 0.06 * math.sin(t * 13 + ly)
                pts.append((lx + math.cos(t) * rr * wob, ly + math.sin(t) * rr * wob * 0.9))
            pts = np.array(pts)
            sid = P.shape(pts, layer, tone=radial(lx - rr * 0.5, ly - rr * 0.55, rr * 2.1, 0.0, 0.85, 1.3), group=g)
            P.hatch(sid, [arc((lx - rr * 0.3, ly - rr * 0.35), rad, -0.6, 2.4, 30) for rad in np.arange(rr * 0.3, rr * 2.0, 3.0)], t0=0.25, t1=0.75, w0=0.4, w1=0.8)
            P.hatch(sid, parallel(-35, 3.1, (lx - rr, ly - rr, lx + rr, ly + rr)), t0=0.6, t1=0.95, w0=0.4, w1=0.7)
            sids.append((sid, pts))
        for sid, pts in sids:
            P.contour(pts, sid, w=0.75, closed=True)
        return g

    trees = []
    for k in range(20):
        x = rng.uniform(-60, -4.5) if k < 14 else rng.uniform(16, 60)
        z = rng.uniform(45, 110)
        h = rng.uniform(7, 13)
        trees.append((x, z, h))
    trees.sort(key=lambda t: -t[1])
    for (x, z, h) in trees:
        base = sc.pr([(x, -1.0, z)])[0]
        top = sc.pr([(x, h, z)])[0]
        r = (base[1] - top[1]) * 0.42
        crown(top[0], top[1] + r, r, 'horizon', int(x * 100 + z))
        # trunk: two tapered strokes
        P.line(np.array([[base[0], base[1]], [base[0], top[1] + r * 1.7]]), 'horizon', w=0.6)

    # ------------------------------------------------------------------ the ground
    ZN, ZF = (2.2 if desktop else 0.95), 420.0
    # the track bed (ballast) to the left of the platform, a metre below it
    bed = sc.poly([(-40, -1.05, ZN), (-1.41, -1.05, ZN), (-1.41, -1.05, ZF), (-40, -1.05, ZF)], 'ground',
                  tone=add(0.42, nz(26, 0.3, 5)))
    # ballast: stipple in the half tones and a few broken rays along the track
    P.hatch(bed, [sc.seg((xw, -1.05, ZN), (xw, -1.05, 60), 50) for xw in np.arange(-40, -1.4, 0.45)], t0=0.35, t1=0.9, w0=0.4, w1=0.6,
            mask=lambda X, Y: (noise(X / 2.5, Y / 1.1, 3) > 0.5).astype(float) * hush(X, Y))
    P.stipple(bed, 0.32, 0.8, spacing=6.4, r=0.55)
    # sleepers between the rails: each a short bar, drawn to 70 m
    tracks = [(-3.535, -2.1), (-8.2, -6.765), (-12.9, -11.465), (-17.6, -16.165)]
    for (ra, rb) in tracks:
        z = ZN
        while z < 70:
            q = sc.pr([(ra - 0.35, -1.0, z), (rb + 0.35, -1.0, z), (rb + 0.35, -1.0, z + 0.22), (ra - 0.35, -1.0, z + 0.22)])
            s_ = P.shape(q, 'ground', tone=0.42)
            P.hatch(s_, [np.array([[q[0, 0] - 2, yy], [q[1, 0] + 2, yy]]) for yy in np.arange(q[2, 1] + 0.6, q[0, 1] + 1, 2.2)], t0=0.2, t1=0.7, w0=0.4, w1=0.75)
            z += 0.6
        for xr in (ra, rb):
            for dx, w in ((-0.035, 1.1), (0.035, 0.6)):
                sc.line3((xr + dx, -0.92, ZN), (xr + dx, -0.92, ZF), 'ground', w=w * 1.4, n=200)
    # the platform: wet tiles in a 0.6 m grid, the joints in hairline; the light (lamp, signal) leaves
    # vertical breaks of reflection in the wet surface (light group)
    plat = sc.poly([(-1.41, 0, ZN), (40, 0, ZN), (40, 0, ZF), (-1.41, 0, ZF)], 'ground',
                   tone=lambda X, Y: np.clip(0.2 + 0.18 * (fbm(X / 90, Y / 14, 7) - 0.5) + 0.1 * ((Y - VPY) / (H - VPY)), 0, 1))
    # the wet surface: horizontal ruling (as still water, guide §1.3), broken where the wet patches shine
    wet = [np.array([[x, yy] for x in np.arange(-4, W + 6, 12.0)]) for yy in np.arange(VPY + 3, H, 3.6 if desktop else 3.0)]
    P.hatch(plat, wet, t0=0.12, t1=0.45, w0=0.4, w1=0.75,
            mask=lambda X, Y: np.clip((fbm(X / 60, Y / 5, 13) - 0.35) / 0.1, 0, 1) * hush(X, Y))
    # the tile joints: along the platform faintly to 45 m, across only near the eye
    for xw in np.arange(-1.2, 40, 0.6):
        sc.line3((xw, 0, ZN), (xw, 0, 45), 'ground', w=0.6, n=100, sid=plat, wfar=0.4)
    z = ZN
    while z < 14:
        q = sc.pr([(-1.41, 0, z), (40, 0, z)])
        P.line(q, 'ground', w=max(0.42, min(0.7, 3.0 / z)), sid=plat)
        z += 0.6
    # the coping: the platform's white edge, and the drop to the track
    sc.line3((-1.41, 0, ZN), (-1.41, 0, ZF), 'ground', w=1.6, n=240, sid=None)
    sc.line3((-1.18, 0, ZN), (-1.18, 0, ZF), 'ground', w=0.8, n=240, sid=plat)
    face = sc.poly([(-1.41, 0, ZN), (-1.41, -1.05, ZN), (-1.41, -1.05, ZF), (-1.41, 0, ZF)], 'ground', tone=0.6)
    # tactile strips: the warning strip (studs) and the guide strip (ribs)
    for (xa, xb, kind) in ((-0.83, -0.44, 'studs'), (0.0, 0.38, 'ribs')):
        q = sc.pr([(xa, 0, ZN), (xb, 0, ZN), (xb, 0, ZF), (xa, 0, ZF)])
        st = P.shape(q, 'ground', tone=0.28)
        if kind == 'ribs':
            P.hatch(st, [sc.seg((xr, 0, ZN), (xr, 0, 90), 100) for xr in np.arange(xa + 0.04, xb, 0.065)], t0=0.05, t1=0.3, w0=0.42, w1=0.8)
        else:
            z = ZN
            while z < 18:
                for xr in np.arange(xa + 0.05, xb, 0.07):
                    p = sc.pr([(xr, 0, z)])[0]
                    P.dot(p[0], p[1], 'ground', r=max(0.4, min(0.9, 2.6 / z)))
                z += 0.08 * (1 + z / 5)
        sc.line3((xa, 0, ZN), (xa, 0, ZF), 'ground', w=1.0, n=200)
        sc.line3((xb, 0, ZN), (xb, 0, ZF), 'ground', w=1.0, n=200)

    # ------------------------------------------------------------------ the structures
    # the far shelter on the right: a canopy on columns from 18 to 90 m
    for zc in np.arange(20, 92, 6.0):
        sc.line3((3.2, 0, zc), (3.2, 3.5, zc), 'structure', w=1.1, n=10, wfar=0.5)
        sc.line3((9.5, 0, zc), (9.5, 3.5, zc), 'structure', w=0.9, n=10, wfar=0.5)
    roof = sc.poly([(2.6, 3.5, 18), (11, 3.5, 18), (11, 3.5, 92), (2.6, 3.5, 92)], 'structure', tone=0.36)
    P.hatch(roof, [sc.seg((xx, 3.5, 18), (xx, 3.5, 92), 30) for xx in np.arange(2.6, 11, 0.35)], t0=0.25, t1=0.7, w0=0.4, w1=0.8)
    fascia = sc.poly([(2.6, 3.5, 18), (11, 3.5, 18), (11, 3.9, 18), (2.6, 3.9, 18)], 'structure', tone=0.1)
    P.contour(sc.pr([(2.6, 3.9, 18), (11, 3.9, 18), (11, 3.5, 18), (2.6, 3.5, 18)]), fascia, w=1.0, closed=True)
    sc.line3((2.6, 3.5, 18), (2.6, 3.5, 92), 'structure', w=1.1, n=80)
    # the fence across the platform's far end
    zf = 37.0
    sc.line3((-1.4, 1.1, zf), (16, 1.1, zf), 'structure', w=0.9, n=20, wfar=0.6)
    sc.line3((-1.4, 0.55, zf), (16, 0.55, zf), 'structure', w=0.6, n=20, wfar=0.6)
    for xx in np.arange(-1.4, 16, 0.25):
        sc.line3((xx, 0, zf), (xx, 1.1, zf), 'structure', w=0.5, n=4, wfar=0.5)
    # the signal gantry beyond the fence: two lattice legs and a lattice beam
    zg = 30.0
    for xl in (5.4, 10.4):
        sc.line3((xl - 0.25, 0, zg), (xl - 0.25, 7.6, zg), 'structure', w=0.8, n=8)
        sc.line3((xl + 0.25, 0, zg), (xl + 0.25, 7.6, zg), 'structure', w=0.8, n=8)
        for yy in np.arange(0, 7.6, 0.5):
            sc.line3((xl - 0.25, yy, zg), (xl + 0.25, yy + 0.5, zg), 'structure', w=0.5, n=3)
    for yy in (6.9, 7.6):
        sc.line3((4.4, yy, zg), (11.4, yy, zg), 'structure', w=0.8, n=10)
    for xx in np.arange(4.4, 11.4, 0.5):
        sc.line3((xx, 6.9, zg), (xx + 0.5, 7.6, zg), 'structure', w=0.5, n=3)
    # the red signal on its post (the light itself is the page's own element; here the housing)
    zs = 40.0
    sc.line3((0.2, 0, zs), (0.2, 4.0, zs), 'structure', w=0.9, n=8)
    hs = sc.poly([(0.0, 4.0, zs), (0.4, 4.0, zs), (0.4, 4.9, zs), (0.0, 4.9, zs)], 'structure', tone=0.7)
    q = sc.pr([(0.0, 4.0, zs), (0.4, 4.9, zs)])
    P.hatch(hs, parallel(90, 1.2, (q[0, 0] - 1, q[1, 1] - 1, q[1, 0] + 1, q[0, 1] + 1)), t0=0.3, t1=0.9, w0=0.4, w1=0.6)
    # catenary poles at the left (between the tracks), with their cantilevers over the near track
    for zp in (15.7, 65.7, 115.7, 165.7):
        xp = -4.8
        sc.line3((xp, -1.0, zp), (xp, 8.2, zp), 'structure', w=2.0 if zp < 20 else 1.2, n=20)
        sc.line3((xp, 6.9, zp), (-1.6, 6.9, zp), 'structure', w=1.2, n=10)
        sc.line3((xp, 7.9, zp), (-1.9, 6.95, zp), 'structure', w=0.9, n=10)
        sc.line3((xp, 6.0, zp), (-2.4, 6.0, zp), 'structure', w=0.9, n=10)
        sc.line3((-3.6, 6.0, zp), (-2.9, 6.9, zp), 'structure', w=0.7, n=6)
        # and the poles of the far tracks (left extension; the nearest stands behind the eye)
        if zp - 8 < 20:
            continue
        sc.line3((-14.5, -1.0, zp - 8), (-14.5, 8.0, zp - 8), 'structure', w=1.8 if zp < 20 else 1.0, n=20)
        sc.line3((-14.5, 6.9, zp - 8), (-7.2, 6.9, zp - 8), 'structure', w=1.0, n=10)
        sc.line3((-14.5, 6.0, zp - 8), (-11.8, 6.0, zp - 8), 'structure', w=0.8, n=10)
    # the lattice pylon on the platform's right (the photograph's mast), its arm and the lamp
    zx, xx0 = 16.1, 6.3
    hP = 12.6
    for dx in (-0.28, 0.28):
        sc.line3((xx0 + dx, 0, zx), (xx0 + dx, hP, zx), 'structure', w=1.6 if dx > 0 else 1.1, n=30, fade_far=False)
    yy = 0.0
    k = 0
    while yy < hP - 0.5:
        a, b = (xx0 - 0.28, xx0 + 0.28) if k % 2 == 0 else (xx0 + 0.28, xx0 - 0.28)
        sc.line3((a, yy, zx), (b, yy + 0.55, zx), 'structure', w=0.7, n=4, fade_far=False)
        sc.line3((xx0 - 0.28, yy, zx), (xx0 + 0.28, yy, zx), 'structure', w=0.6, n=4, fade_far=False)
        yy += 0.55; k += 1
    sc.line3((xx0 - 0.28, 7.07, zx), (11.5, 7.07, zx), 'structure', w=1.4, n=20, fade_far=False)
    sc.line3((xx0 + 0.28, 7.35, zx), (11.5, 7.35, zx), 'structure', w=0.9, n=20, fade_far=False)
    sc.line3((xx0 + 0.28, 5.6, zx), (6.95, 5.69, zx), 'structure', w=1.2, n=8, fade_far=False)
    lamp = sc.pr([(6.85, 5.62, zx), (7.25, 5.62, zx), (7.25, 5.76, zx), (6.85, 5.76, zx)])
    sl = P.shape(lamp, 'structure', tone=0.1)
    P.contour(lamp, sl, w=1.0, closed=True)
    # the station sign: a blank board on two posts (no lettering inside a plate)
    zsn = 13.5
    for xpst in (4.4, 6.4):
        sc.line3((xpst, 0, zsn), (xpst, 2.8, zsn), 'structure', w=1.2, n=8, fade_far=False)
    bd = [(3.94, 2.78, zsn), (6.56, 2.78, zsn), (6.56, 3.55, zsn), (3.94, 3.55, zsn)]
    sb = sc.poly(bd, 'structure', tone=lin(0, 0, 1600, 0, 0.05, 0.2))
    q = sc.pr(bd)
    P.hatch(sb, [np.array([[q[0, 0] - 2, yy], [q[1, 0] + 2, yy]]) for yy in np.arange(q[2, 1] + 1.5, q[0, 1], 2.4)], t0=0.08, t1=0.4, w0=0.4, w1=0.6)
    P.contour(q, sb, w=1.2, closed=True)
    # the bench and a bin near the sign
    sc.box(4.6, 6.4, 0.42, 0.48, 10.2, 10.6, 'structure', base=0.1)
    for xb in (4.7, 6.3):
        sc.line3((xb, 0, 10.2), (xb, 0.42, 10.2), 'structure', w=1.0, n=4, fade_far=False)
        sc.line3((xb, 0, 10.6), (xb, 0.42, 10.6), 'structure', w=0.8, n=4, fade_far=False)
    sc.box(2.4, 2.95, 0, 1.0, 17.0, 17.5, 'structure', base=0.25)
    # the billboard: a blank frame on two posts, parallel to the track, from 7.45 m toward the eye
    xb_, ya_, yb_ = 4.14, 1.18, 3.54   # fitted to the photograph at its right edge (top y 350, foot y 625)
    zA, zB = 7.45, 1.4
    frame = sc.poly([(xb_, ya_, zA), (xb_, ya_, zB), (xb_, yb_, zB), (xb_, yb_, zA)], 'structure', tone=0.12)
    inner = [(xb_ - 0.01, ya_ + 0.12, zA - 0.1), (xb_ - 0.01, ya_ + 0.12, zB), (xb_ - 0.01, yb_ - 0.12, zB), (xb_ - 0.01, yb_ - 0.12, zA - 0.1)]
    P.contour(sc.pr([(xb_, ya_, zA), (xb_, ya_, zB)]), frame, w=1.4)
    P.contour(sc.pr([(xb_, yb_, zA), (xb_, yb_, zB)]), frame, w=1.0)
    P.contour(sc.pr([(xb_, ya_, zA), (xb_, yb_, zA)]), frame, w=1.4)
    P.line(sc.pr(inner + [inner[0]]), 'structure', w=0.6)
    # the panel: lit from behind, so only a fine ruling along its length, thinning toward the eye
    P.hatch(frame, [sc.seg((xb_ - 0.01, yy, zA), (xb_ - 0.01, yy, zB), 60) for yy in np.arange(ya_ + 0.2, yb_ - 0.15, 0.16)], t0=0.06, t1=0.5, w0=0.4, w1=0.55)
    # its frame's thickness on the near side (the case, in shadow)
    case = sc.poly([(xb_, ya_, zA), (xb_ + 0.18, ya_, zA), (xb_ + 0.18, yb_, zA), (xb_, yb_, zA)], 'structure', tone=0.7)
    for zp in (6.9, 3.2):
        sc.line3((xb_ + 0.09, 0, zp), (xb_ + 0.09, ya_, zp), 'structure', w=1.8, n=6, fade_far=False)
    # the light-tube eave above the billboard, receding along the track
    sc.line3((4.0, 4.0, 30), (4.0, 4.0, 1.6), 'structure', w=1.6, n=120, fade_far=False)
    sc.line3((4.0, 4.14, 30), (4.0, 4.14, 1.6), 'structure', w=0.7, n=120, fade_far=False)

    # ------------------------------------------------------------------ the wires (front)
    def catenary(x, y_hi, y_lo, z0, z1, span=50.0, w=0.9):
        z = z0
        while z < z1:
            za, zb = z, min(z1, z + span)
            ts = np.linspace(0, 1, 60)
            pts = np.array([(x, y_hi - 0.7 * 4 * t * (1 - t) * (1 if span > 10 else 0), za + (zb - za) * t) for t in ts])
            sp = sc.pr(pts)
            P.line(sp, 'wires', w=w * max(0.5, min(1, 12 / max(za, 1))) + 0.15, step=1.0)
            z = zb
        sc.line3((x, y_lo, z0), (x, y_lo, z1), 'wires', w=w * 0.9, n=200)
    for xw in (-2.8, -7.5, -12.2):
        catenary(xw, 6.9, 5.6, -34.3 + 50, 420, w=1.0)
        # droppers near the eye
        for zd in np.arange(17, 60, 4.5):
            sag = 0.7 * 4 * ((zd - 15.7) % 50 / 50) * (1 - (zd - 15.7) % 50 / 50)
            sc.line3((xw, 5.6, zd), (xw, 6.9 - sag, zd), 'wires', w=0.5, n=3, fade_far=False)
    # feeder wires from the upper left, high, converging (as the photograph's long diagonals)
    for (xw, yw) in ((-5.0, 9.2), (-5.4, 8.6), (-15.0, 9.0)):
        sc.line3((xw, yw, 3.0), (xw, yw, 420), 'wires', w=1.1, n=300)
    # from the pylon's top out over the right, toward the eye
    for (yw, xe) in ((11.6, 9.0), (10.9, 9.8)):
        pts = np.array([(6.3 + (xe - 6.3) * t, yw - 1.2 * 4 * t * (1 - t), 16.1 + (1.0 - 16.1) * t) for t in np.linspace(0, 1, 80)])
        P.line(sc.pr(pts), 'wires', w=0.8, step=1.0)

    # ------------------------------------------------------------------ the rain (front)
    for i in range(700 if desktop else 220):
        x = rng.uniform(0, W); y = rng.uniform(0, H)
        L = rng.uniform(7, 18)
        P.line(np.array([[x, y], [x - L * 0.18, y + L]]), 'rain', w=0.5, step=1.5)

    # ------------------------------------------------------------------ the light: the lamp's burst,
    # the signal's small burst, reflections in the wet platform
    lp = sc.pr([(7.05, 5.62, 16.1)])[0]
    for k in range(40):
        a = k / 40 * 2 * math.pi
        if math.sin(a) < -0.5:   # the burst is cut by the lamp's housing above
            continue
        r1 = 4.5; r2 = rng.uniform(16, 46) * (1 if desktop else 0.6)
        P.line(np.array([[lp[0] + math.cos(a) * r1, lp[1] + math.sin(a) * r1], [lp[0] + math.cos(a) * r2, lp[1] + math.sin(a) * r2]]),
               'light', w=0.8, profile=lambda t: 1 - 0.7 * t)
    sg = sc.pr([(0.2, 4.45, 40.0)])[0]
    for k in range(18):
        a = k / 18 * 2 * math.pi
        P.line(np.array([[sg[0] + math.cos(a) * 3, sg[1] + math.sin(a) * 3], [sg[0] + math.cos(a) * 11, sg[1] + math.sin(a) * 11]]),
               'light', w=0.55, profile=lambda t: 1 - 0.6 * t)
    # reflections: vertical broken ruling under the lamp and the signal, on the platform
    for (src, xs, zs_, spread) in ((lp, 7.05, 16.1, 0.9), (sg, 0.2, 40.0, 0.35)):
        base = sc.pr([(xs, 0, zs_)])[0]
        for k in range(46 if src is lp else 22):
            xx = base[0] + rng.gauss(0, 7 * spread * (2.2 if desktop else 0.8))
            y0 = base[1] + rng.uniform(0, 130 if desktop else 60) ** 1.0
            L = rng.uniform(3, 12)
            P.line(np.array([[xx, y0], [xx, y0 + L]]), 'light', w=0.7, step=1.0)

    # ------------------------------------------------------------------ the scaffold (the brief's plate)
    R = 430 if desktop else 300
    circ = arc((VPX, VPY), R, -math.pi / 2, 1.5 * math.pi, 400)
    P.line(circ, 'scaffold', w=0.7)
    P.line(np.array([[0, VPY], [W, VPY]]), 'scaffold', w=0.6)
    P.line(np.array([[VPX, 80 if desktop else 70], [VPX, H]]), 'scaffold', w=0.5)
    for xe in ((90, 1350) if desktop else (-60, 370)):
        P.line(np.array([[VPX, VPY], [VPX + (xe - 720 if desktop else xe - 110.6) * 1.2, VPY + (680 if desktop else 600)]]), 'scaffold', w=0.6)
    P.line(np.array([[VPX - 16, VPY], [VPX - 6, VPY]]), 'scaffold', w=1.2)
    P.line(np.array([[VPX + 6, VPY], [VPX + 16, VPY]]), 'scaffold', w=1.2)

    P.bake()
    P.engrave(step=1.1, mask=hush)
    return P, dict(W=W, H=H, VP=(VPX, VPY), photo=photo, f=f)


def write(P, info, out, suffix=''):
    sizes = {}
    for gname in GROUPS:
        svg = P.svg({gname: alpha(gname, suffix == '')}, ink='#e8e3dd', q=4)
        open(f'{out}/signal-{gname}{suffix}.svg', 'w').write(svg)
        sizes[gname] = len(svg)
    return sizes


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    P, info = build(True)
    s = write(P, info, out, '')
    print('desktop', s, sum(s.values()), info['VP'])
    Q, qi = build(False)
    t = write(Q, qi, out, '-phone')
    print('phone', t, sum(t.values()), qi['VP'])
