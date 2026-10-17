"""YTU Davutpaşa, the Orta Bahçe (guide §2.10, review rows S34 and S46): PROVISIONAL.

A bird's-eye view in the manner of the old vedute: the long rectangle of the historic barracks with
its hipped tile roofs and two storeys of arched windows, and inside it the central courtyard garden:
lawns with mature trees, paths in a symmetric, partly radial plan, a small pavilion near the centre.
Drawn from the owner's reference photographs (docs/research/references/davutpasa/, never published)
for proportion only: the plan of the paths is simplified and the window count is implied after three
(guide §1.6). Everything here waits for the owner's check (row S59) before it is placed.

1600 x 800. Usage: python3 davutpasa.py <out-dir>
"""
import math
import random
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from burin import (Plate, Camera, parallel, rect, arc, bez, lin, radial, add, nz, edge_fade, fbm, noise, resample)

LIGHT3 = np.array([-0.55, 0.7, 0.45])   # toward the light: upper left, from the front-left, late afternoon
LIGHT3 = LIGHT3 / np.linalg.norm(LIGHT3)


def build():
    W, H = 1600, 800
    P = Plate(W, H, res=2, seed=46)
    for L in ('back', 'mid', 'front'):
        P.layer(L)
    cam = Camera(eye=(-70, 105, -80), target=(150, 0, 80), f=900, cx=920, cy=340)
    pr = cam.p
    rng = random.Random(46)
    fade = edge_fade(H, top=0.14, bottom=0.12, W=W, left=0.06, right=0.06)

    def face_tone(n, base=0.05):
        n = np.asarray(n, float); n = n / np.linalg.norm(n)
        return float(np.clip(base + 0.75 * (1 - max(0.0, n @ LIGHT3)), 0, 1))

    def quad(pts, layer, tone, group=None):
        return P.shape(pr(pts), layer, tone=tone, group=group)

    # ------------------------------------------------------------------ ground: lawns, the city beyond
    X0, X1, Z0, Z1 = 0.0, 260.0, 0.0, 120.0       # the courtyard (inside the wings)
    Wd, Hw, Hr = 14.0, 12.0, 5.5                    # wing depth, wall height, roof rise
    outer = [(-40, 0, -40), (440, 0, -40), (440, 0, 320), (-40, 0, 320)]
    g_out = quad(outer, 'back', tone=lambda X, Y: np.clip(0.14 + 0.15 * (fbm(X / 90, Y / 40, 3) - 0.5), 0, 1))
    court = [(X0, 0, Z0), (X1, 0, Z0), (X1, 0, Z1), (X0, 0, Z1)]
    g_court = quad(court, 'mid', tone=lambda X, Y: np.clip(0.2 + 0.18 * (fbm(X / 60, Y / 30, 5) - 0.5), 0, 1))
    # lawn: fine ruling along the courtyard's length (mown stripes), broken by the noise of the grass
    P.hatch(g_court, [pr([(X0, 0, z), (X1, 0, z)]) for z in np.arange(Z0, Z1, 3.2)], t0=0.1, t1=0.5, w0=0.4, w1=0.6,
            mask=lambda X, Y: (noise(X / 8, Y / 2, 6) > 0.35).astype(float))

    # the paths: a long axis, a cross axis at the centre, two oval loops, diagonals to the corners, the
    # pavilion's round at the centre; drawn as pale bands (the lawn's ruling stops at them)
    cx, cz = (X0 + X1) / 2, (Z0 + Z1) / 2
    paths = []
    def band(pts, w):
        pts = np.asarray(pts, float)
        out = []
        for i in range(len(pts)):
            a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
            d = b - a; d = d / (np.linalg.norm(d) + 1e-9)
            n = np.array([-d[1], d[0]])
            out.append((pts[i] + n * w / 2, pts[i] - n * w / 2))
        left = [o[0] for o in out]; right = [o[1] for o in out][::-1]
        poly = np.array(left + right)
        return [(p[0], 0.05, p[1]) for p in poly]
    def line2(a, b, n=30):
        return np.linspace(a, b, n)
    def oval(c, rx, rz, n=90, a0=0, a1=2 * math.pi):
        t = np.linspace(a0, a1, n)
        return np.stack([c[0] + rx * np.cos(t), c[1] + rz * np.sin(t)], axis=1)
    plan = [line2((X0, cz), (X1, cz)), line2((cx, Z0), (cx, Z1)),
            oval((70, cz), 42, 34), oval((190, cz), 42, 34),
            line2((X0, Z0), (70 - 30, cz - 24)), line2((X0, Z1), (70 - 30, cz + 24)),
            line2((X1, Z0), (190 + 30, cz - 24)), line2((X1, Z1), (190 + 30, cz + 24)),
            line2((70, cz - 34), (cx - 6, cz - 4)), line2((70, cz + 34), (cx - 6, cz + 4)),
            line2((190, cz - 34), (cx + 6, cz - 4)), line2((190, cz + 34), (cx + 6, cz + 4)),
            line2((X0, 30), (X1, 30)), line2((X0, 90), (X1, 90))]
    for k, pl in enumerate(plan):
        pts3 = band(pl, 3.2 if k > 1 else 4.6)
        sid = quad(pts3, 'mid', tone=0.02)
        paths.append(sid)
    # the path edges in hairline (only the visible side of each band)
    for pl in plan:
        for off in (-1.6, 1.6):
            q = np.asarray(pl, float)
            P.line(pr([(p[0], 0.06, p[1] + off) for p in q]), 'mid', w=0.95, sid=g_court)
    # rounds: the pavilion's at the centre and a small one in each oval
    for (rc, rr) in (((cx, cz), 9.0), ((70, cz), 5.0), ((190, cz), 5.0)):
        ring = oval(rc, rr, rr, 60)
        sid = quad([(p[0], 0.06, p[1]) for p in ring], 'mid', tone=0.03)
        P.line(pr([(p[0], 0.07, p[1]) for p in ring]), 'mid', w=0.7, sid=g_court)

    # ------------------------------------------------------------------ trees (back to front)
    trees = []
    for k in range(90):
        x = rng.uniform(X0 + 4, X1 - 4); z = rng.uniform(Z0 + 4, Z1 - 4)
        # keep the paths clear
        near_path = abs(z - cz) < 5 or abs(x - cx) < 5 or abs(z - 30) < 4 or abs(z - 90) < 4
        for oc in ((70, cz), (190, cz)):
            r = math.hypot((x - oc[0]) / 42, (z - oc[1]) / 34)
            near_path = near_path or abs(r - 1) < 0.12 or r < 0.25
        if near_path:
            continue
        trees.append((x, z, rng.uniform(7, 12)))
    # trees outside the barracks, in front and to the left (the park), and a line behind
    for k in range(0):
        trees.append((rng.uniform(-150, 420), rng.uniform(-120, -30), rng.uniform(9, 15)))
    for k in range(16):
        trees.append((rng.uniform(-60, -22), rng.uniform(-10, 150), rng.uniform(9, 15)))
    # keep only trees well in front of the eye and inside the band
    def seen(t):
        if cam.depth([(t[0], 0, t[1])])[0] < 45:
            return False
        q = pr([(t[0], 0, t[1])])[0]
        return -40 < q[0] < W + 40 and -40 < q[1] < H + 60
    trees = [t for t in trees if seen(t)]
    trees.sort(key=lambda t: -cam.depth([(t[0], 0, t[1])])[0])

    def crown(t, layer):
        x, z, h = t
        top = pr([(x, h, z)])[0]; base = pr([(x, 0, z)])[0]
        r = min(60.0, max(2.2, (base[1] - top[1]) * 0.55))
        g = P.nid
        lr = random.Random(int(x * 7 + z * 13))
        lobes = [(top[0] + lr.uniform(-0.4, 0.4) * r, top[1] + lr.uniform(-0.2, 0.3) * r, r * lr.uniform(0.55, 0.8)) for _ in range(lr.randint(2, 4))]
        sids = []
        for (lx, ly, rr) in lobes:
            pts = np.array([(lx + math.cos(a) * rr * (1 + 0.14 * math.sin(a * 6 + lx)), ly + math.sin(a) * rr * 0.85 * (1 + 0.1 * math.sin(a * 9 + ly))) for a in np.linspace(0, 2 * math.pi, 28)])
            sid = P.shape(pts, layer, tone=radial(lx - rr * 0.5, ly - rr * 0.5, rr * 2.2, 0.0, 0.9, 1.2), group=g)
            P.hatch(sid, [arc((lx - rr * 0.35, ly - rr * 0.4), rad, -0.5, 2.4, 20) for rad in np.arange(rr * 0.35, rr * 2.1, 2.2)], t0=0.3, t1=0.8, w0=0.4, w1=0.75)
            sids.append((sid, pts))
        for sid, pts in sids:
            P.contour(pts, sid, w=0.6, closed=True)
        # its shadow on the lawn, to the lower right
        sh = np.array([(base[0] + r * 0.7 + math.cos(a) * r * 0.7, base[1] + math.sin(a) * r * 0.26) for a in np.linspace(0, 2 * math.pi, 20)])
        s2 = P.shape(sh, 'back', tone=0.45)
        P.hatch(s2, parallel(-20, 2.0, (sh[:, 0].min(), sh[:, 1].min(), sh[:, 0].max(), sh[:, 1].max())), t0=0.3, t1=0.8, w0=0.4, w1=0.6)

    # ------------------------------------------------------------------ the barracks (far wings first)
    def wing(x0, x1, z0, z1, layer, door=None):
        """A two-storey wing: walls, the hipped roof, arched windows on the faces turned to the eye."""
        g = P.nid
        eye = cam.eye
        corners = {'sw': (x0, z0), 'se': (x1, z0), 'ne': (x1, z1), 'nw': (x0, z1)}
        faces = []
        if eye[2] < z0:
            faces.append(('s', [(x0, 0, z0), (x1, 0, z0), (x1, Hw, z0), (x0, Hw, z0)], (0, 0, -1), (x1 - x0)))
        if eye[2] > z1:
            faces.append(('n', [(x1, 0, z1), (x0, 0, z1), (x0, Hw, z1), (x1, Hw, z1)], (0, 0, 1), (x1 - x0)))
        if eye[0] < x0:
            faces.append(('w', [(x0, 0, z1), (x0, 0, z0), (x0, Hw, z0), (x0, Hw, z1)], (-1, 0, 0), (z1 - z0)))
        if eye[0] > x1:
            faces.append(('e', [(x1, 0, z0), (x1, 0, z1), (x1, Hw, z1), (x1, Hw, z0)], (1, 0, 0), (z1 - z0)))
        for name, f, n, length in faces:
            t = face_tone(n, 0.02)
            sid = quad(f, layer, tone=t, group=g)
            q = pr(f)
            # wall tone: courses along the façade in the shadowed faces only
            P.hatch(sid, [pr([f[0][:1] + (yy,) + f[0][2:], f[1][:1] + (yy,) + f[1][2:]]) for yy in np.arange(0.4, Hw, 0.8)], t0=0.25, t1=0.7, w0=0.4, w1=0.7)
            # windows: two storeys of arched openings, every 4.5 m; the string course between
            n_w = int(length / 4.5)
            a = np.array(f[0], float); b = np.array(f[1], float)
            for i in range(n_w):
                tt = (i + 0.5) / n_w
                p = a + (b - a) * tt
                for (y0, y1) in ((1.6, 4.4), (7.0, 10.0)):
                    wpts = [p + (b - a) / np.linalg.norm(b - a) * dx + np.array([0, yy, 0]) for dx, yy in ((-0.7, y0), (0.7, y0), (0.7, y1 - 0.7), (0, y1), (-0.7, y1 - 0.7))]
                    ws = pr(wpts)
                    sw = P.shape(ws, layer, tone=0.88, group=g)
                    if np.ptp(ws[:, 0]) > 2.2:
                        P.hatch(sw, parallel(90, 1.2, (ws[:, 0].min(), ws[:, 1].min(), ws[:, 0].max(), ws[:, 1].max())), t0=0.3, t1=0.95, w0=0.4, w1=0.65)
            P.line(pr([(a[0], 5.6, a[2]), (b[0], 5.6, b[2])]), layer, w=0.7)
            P.contour(q, sid, w=0.9, closed=True)
            if door is not None and name == door[0]:
                p = a + (b - a) * door[1]
                d = (b - a) / np.linalg.norm(b - a)
                arch = [p + d * dx + np.array([0, yy, 0]) for dx, yy in ((-2.2, 0), (2.2, 0), (2.2, 3.6), (1.1, 4.8), (0, 5.1), (-1.1, 4.8), (-2.2, 3.6))]
                sa = P.shape(pr(arch), layer, tone=0.95, group=g)
                P.hatch(sa, parallel(90, 1.0, (pr(arch)[:, 0].min(), pr(arch)[:, 1].min(), pr(arch)[:, 0].max(), pr(arch)[:, 1].max())), t0=0.3, t1=0.95, w0=0.4, w1=0.7)
                P.contour(pr(arch), sa, w=1.0, closed=True)
                # the portal's frame stands proud of the wall
                frame = [p + d * dx + np.array([0, yy, 0]) for dx, yy in ((-3.4, 0), (3.4, 0), (3.4, 6.2), (-3.4, 6.2))]
                P.line(pr(frame + [frame[0]]), layer, w=0.9)
        # the hipped roof: four slopes up to a ridge
        e = 0.6
        ridge_a = (x0 + Wd / 2, Hw + Hr, z0 + Wd / 2) if (x1 - x0) > (z1 - z0) else (x0 + Wd / 2, Hw + Hr, z0 + Wd / 2)
        if (x1 - x0) > (z1 - z0):
            ra, rb = (x0 + Wd / 2, Hw + Hr, (z0 + z1) / 2), (x1 - Wd / 2, Hw + Hr, (z0 + z1) / 2)
        else:
            ra, rb = ((x0 + x1) / 2, Hw + Hr, z0 + Wd / 2), ((x0 + x1) / 2, Hw + Hr, z1 - Wd / 2)
        E = [(x0 - e, Hw, z0 - e), (x1 + e, Hw, z0 - e), (x1 + e, Hw, z1 + e), (x0 - e, Hw, z1 + e)]
        if (x1 - x0) > (z1 - z0):
            slopes = [([E[0], E[1], rb, ra], (0, 1, -1)), ([E[1], E[2], rb], (1, 1, 0)), ([E[2], E[3], ra, rb], (0, 1, 1)), ([E[3], E[0], ra], (-1, 1, 0))]
        else:
            slopes = [([E[0], E[1], ra], (0, 1, -1)), ([E[1], E[2], rb, ra], (1, 1, 0)), ([E[2], E[3], rb], (0, 1, 1)), ([E[3], E[0], ra, rb], (-1, 1, 0))]
        # draw the slopes far to near
        slopes.sort(key=lambda s: -float(np.mean(cam.depth(s[0]))))
        for pts, n in slopes:
            sid = quad(pts, layer, tone=face_tone(n, 0.0), group=g)
            # tile courses: lines parallel to the eave, closer toward the ridge
            ea, eb = np.array(pts[0], float), np.array(pts[1], float)
            top = np.array(pts[2], float) if len(pts) == 3 else (np.array(pts[2], float) + np.array(pts[3], float)) / 2
            lines = []
            for tt in np.linspace(0.06, 0.96, 11):
                lines.append(pr([ea + (top - ea) * tt - (eb - ea) * 0.1, eb + (top - eb) * tt + (eb - ea) * 0.1]))
            P.hatch(sid, lines, t0=-0.15, t1=0.6, w0=0.4, w1=0.8)
            P.contour(pr(pts), sid, w=0.9, closed=True)
        P.line(pr([ra, rb]), layer, w=1.0)

    # far wings first: north, east, then west and south (nearest)
    wing(-Wd, X1 + Wd, Z1, Z1 + Wd, 'mid')
    wing(X1, X1 + Wd, Z0, Z1, 'mid')
    # the pavilion near the centre: an octagonal kiosk with a low roof
    pav = []
    for k in range(8):
        a = k * math.pi / 4 + math.pi / 8
        pav.append((cx + 5 * math.cos(a), cz + 5 * math.sin(a)))
    for t in trees:
        if cam.depth([(t[0], 0, t[1])])[0] > cam.depth([(cx, 0, cz)])[0]:
            crown(t, 'mid')
    g = P.nid
    for k in range(8):
        (ax, az), (bx, bz) = pav[k], pav[(k + 1) % 8]
        n = (math.cos(k * math.pi / 4 + math.pi / 4), 0, math.sin(k * math.pi / 4 + math.pi / 4))
        f = [(ax, 0, az), (bx, 0, bz), (bx, 3.4, bz), (ax, 3.4, az)]
        if (np.array(f[0]) - cam.eye) @ np.array(n) < 0:
            sid = quad(f, 'mid', tone=face_tone(n, 0.05), group=g)
            P.hatch(sid, parallel(90, 1.4, (pr(f)[:, 0].min(), pr(f)[:, 1].min(), pr(f)[:, 0].max(), pr(f)[:, 1].max())), t0=0.3, t1=0.8, w0=0.4, w1=0.6)
            P.contour(pr(f), sid, w=0.7, closed=True)
    roof = [pr([(cx + 6.4 * math.cos(k * math.pi / 4 + math.pi / 8), 3.4, cz + 6.4 * math.sin(k * math.pi / 4 + math.pi / 8))])[0] for k in range(8)]
    apex = pr([(cx, 6.2, cz)])[0]
    for k in range(8):
        tri = np.array([roof[k], roof[(k + 1) % 8], apex])
        sid = P.shape(tri, 'mid', tone=0.15 + 0.5 * (k in (0, 1, 7)), group=g)
        P.contour(tri, sid, w=0.6, closed=True)
    for t in trees:
        if cam.depth([(t[0], 0, t[1])])[0] <= cam.depth([(cx, 0, cz)])[0] and t[2] < 13 and 0 < t[1] < Z1 and 0 < t[0] < X1:
            crown(t, 'mid')
    wing(-Wd, X0, Z0, Z1, 'front')
    wing(-Wd, X1 + Wd, Z0 - Wd, Z0, 'front', door=('s', 0.5))
    for t in trees:
        if not (0 < t[1] < Z1 and 0 < t[0] < X1) and cam.depth([(t[0], 0, t[1])])[0] < cam.depth([(cx, 0, Z0 - Wd)])[0]:
            crown(t, 'front')
    P.bake()
    P.engrave(step=1.0, mask=fade)
    return P


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    P = build()
    s = P.svg({'back': 0.14, 'mid': 0.18, 'front': 0.2}, ink='#e8e3dd', q=4)
    open(f'{out}/davutpasa.svg', 'w').write(s)
    print(len(s))
