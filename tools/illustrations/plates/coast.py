"""The Istanbul series (guide §2.9, review row S34): one light (upper left, late afternoon from the Asian
side), one weight scale, one way of drawing water and sky, so any two plates can sit together.

Shared pieces: an engraved sky (horizontal ruling that thins upward, clouds left out with a stippled
edge), water (horizontal broken ruling, closer toward the horizon, reflections as vertical breaks), hill
silhouettes in hairline with hatching on their shadow side, a city ferry (vapur) in broadside, gulls as
small massed bodies (never a "v").

Plates in this file:
- pier: under the postcards (replacing istanbul.svg): the Bostancı pier at dusk, a vapur coming in, the
  Princes' Islands on the horizon. 1600 x 600, ambient strength. Its horizon runs on into the Record's
  tape (the handover, guide §2.7).
- bosphorus: the panorama from Salacak (the first screen's desktop plate in the guide; unplaced, since
  the first-screen study chose the Bostancı platform): the Maiden's Tower at the left third, the historic
  peninsula far right in hairline, a ferry, gulls. 1600 x 700.
- maidens: the Maiden's Tower, portrait (the guide's phone plate; unplaced). 390 x 844.
Usage: python3 coast.py <out-dir> [pier|bosphorus|maidens]
"""
import math
import random
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from burin import (Plate, Camera, parallel, ruled, rect, arc, bez, lin, radial, add, nz, edge_fade, clear_zone,
                   concentric, resample, fbm, noise)


# ----------------------------------------------------------------------------- shared

def sky(P, layer, W, hz, top=0, dense=0.36, seed=3, mask=None, sun=None):
    """Horizontal ruling that thins upward; clouds by leaving the ruling out."""
    sid = P.shape(rect(0, top, W, hz - 1), layer, tone=lambda X, Y: np.clip(
        dense * (((Y - top) / (hz - top)) ** 1.5) + 0.12 * (fbm(X / 260, Y / 80, seed) - 0.5), 0, 1))
    lines = []
    y = top + 4.0
    while y < hz - 1:
        lines.append(np.array([[x, y + 0.5 * math.sin(x / 190 + y * 0.2)] for x in np.arange(-4, W + 6, 12.0)]))
        y += 3.0 + 3.6 * (1 - (y - top) / (hz - top))

    def m(X, Y):
        v = np.clip((fbm(X / 200, Y / 40, seed + 9) - 0.32) / 0.12, 0, 1)
        if sun is not None:
            sx, sy, sr = sun
            v = v * np.clip((np.hypot(X - sx, Y - sy) - sr) / 6, 0, 1)
        return v * (mask(X, Y) if mask else 1)
    P.hatch(sid, lines, t0=0.08, t1=0.42, w0=0.4, w1=0.8, mask=m)
    return sid


def water(P, layer, W, hz, bottom, seed=5, road=None, mask=None, tone=0.32):
    """Still water: broken horizontal ruling, the gaps widening toward a light road; reflections as
    vertical breaks (road: (x, half-width at the bottom))."""
    sid = P.shape(rect(0, hz + 1, W, bottom), layer, tone=lambda X, Y: np.clip(tone + 0.1 * ((Y - hz) / (bottom - hz)) + 0.1 * (fbm(X / 120, Y / 9, seed) - 0.5), 0, 1))
    lines = []
    y = hz + 1.6
    k = 0
    while y < bottom:
        lines.append(np.array([[x, y] for x in np.arange(-4, W + 6, 10.0)]))
        y += 1.8 + 4.2 * ((y - hz) / (bottom - hz)) ** 0.8
        k += 1

    def m(X, Y):
        d = (Y - hz) / max(1, bottom - hz)
        # broken: short dashes near the horizon, longer near the eye
        v = (noise(X / (10 + 50 * d), Y / 2.2, seed) > 0.3 + 0.12 * (1 - d)).astype(float)
        return v * (mask(X, Y) if mask else 1)
    P.hatch(sid, lines, t0=0.06, t1=0.45, w0=0.4, w1=0.75, mask=m)
    if road is not None:
        # the light road on the water: on this dark ground the light is the line, so the road is a
        # column of short bright dashes, widening toward the eye, broken by the swell
        rx, rw = road
        sp_lines = [np.array([[x, y] for x in np.arange(rx - rw * 1.6, rx + rw * 1.6, 4.0)]) for y in np.arange(hz + 1.2, bottom, 2.2)]

        def rm(X, Y):
            d = np.clip((Y - hz) / max(1, bottom - hz), 0, 1)
            half = 3 + rw * d
            inside = np.clip(1 - np.abs(X - rx) / half, 0, 1) ** 0.7
            return inside * (noise(X / (4 + 12 * d), Y / 1.6, seed + 4) > 0.45).astype(float) * (mask(X, Y) if mask else 1)
        P.hatch(sid, sp_lines, t0=0.0, t1=0.3, w0=0.45, w1=1.0, mask=rm)
    return sid


def hills(P, layer, pts, hz, tone=0.35, w=0.6, hatch_sp=3.0):
    """A far hill line: a filled silhouette down to the horizon, hatched on its shadow side."""
    pts = np.asarray(pts, float)
    poly = np.concatenate([pts, [[pts[-1, 0], hz], [pts[0, 0], hz]]])
    x0, x1 = pts[:, 0].min(), pts[:, 0].max()
    top = pts[:, 1].min()
    sid = P.shape(poly, layer, tone=lambda X, Y: np.clip(tone + 0.25 * (X - x0) / max(1, x1 - x0), 0, 1))
    P.hatch(sid, [np.array([[x0 - 4, y], [x1 + 4, y]]) for y in np.arange(top + 1.5, hz, hatch_sp)], t0=0.15, t1=0.6, w0=0.4, w1=0.6)
    P.contour(pts, sid, w=w)
    return sid


def smooth_ridge(x0, x1, base, peaks, n=80, seed=0):
    """A ridge through (x, height) peaks with a soft profile and a little irregularity."""
    xs = np.linspace(x0, x1, n)
    h = np.zeros(n)
    for (px, ph, pw) in peaks:
        h = np.maximum(h, ph * np.exp(-((xs - px) / pw) ** 2))
    h = h * (1 + 0.08 * (np.array([fbm(x / 30, 0.5, seed) for x in xs]) - 0.5))
    edge = np.clip(np.minimum(xs - x0, x1 - xs) / ((x1 - x0) * 0.12), 0, 1)
    return np.stack([xs, base - h * edge], axis=1)


def vapur(P, layer, x, y, L, s=1.0, facing=-1, seed=0):
    """A city ferry in broadside: a long low hull with a sheer, two decks with a run of windows (three
    drawn, the rest implied by the shadow of the deck above), the funnel aft. x, y: the bow at the
    waterline; L: length; facing -1 = bow to the left."""
    d = facing
    xb, xs = x, x - d * L        # bow, stern
    H1 = 0.13 * L * s; H2 = 0.08 * L; H3 = 0.06 * L
    g = P.nid
    # hull: sheer line rising to the bow
    top = np.array([[xs, y - H1 * 0.9], [xs + d * L * 0.5, y - H1 * 0.85], [xb, y - H1 * 1.08]])
    top = resample(np.concatenate([bez(top[0], top[0] + (top[1] - top[0]) * 0.5, top[1], top[1], 12), bez(top[1], top[1] + (top[2] - top[1]) * 0.5, top[2], top[2], 12)]), 2)
    hull = np.concatenate([top, [[xb - d * L * 0.03, y], [xs + d * L * 0.02, y]]])
    sh = P.shape(hull, layer, tone=lin(0, y - H1, 0, y, 0.15, 0.75), group=g)
    P.hatch(sh, [np.array([[min(xs, xb) - 4, yy], [max(xs, xb) + 4, yy]]) for yy in np.arange(y - H1, y, 1.9)], t0=0.15, t1=0.7, w0=0.4, w1=0.8)
    P.contour(hull, sh, w=1.1, closed=True)
    # decks: two stepped boxes with window rows
    for k, (a, b, h) in enumerate(((0.12, 0.86, H2), (0.2, 0.72, H3))):
        base = y - H1 * 0.88 - (H2 if k else 0)
        xa, xb2 = xs + d * L * a, xs + d * L * b
        box = rect(min(xa, xb2), base - h, max(xa, xb2), base)
        sb = P.shape(box, layer, tone=0.08, group=g)
        P.contour(box, sb, w=0.9, closed=True)
        # the deck's overhang throws a shadow band; windows as short vertical breaks within it
        band = rect(min(xa, xb2), base - h * 0.78, max(xa, xb2), base - h * 0.35)
        sw = P.shape(band, layer, tone=0.62, group=g)
        P.hatch(sw, parallel(0, 1.4, (min(xa, xb2), base - h, max(xa, xb2), base)), t0=0.3, t1=0.8, w0=0.4, w1=0.7)
        P.hatch(sw, parallel(90, max(2.4, L * 0.018), (min(xa, xb2), base - h, max(xa, xb2), base)), t0=0.5, t1=0.9, w0=0.4, w1=0.6)
    # funnel aft, with its band
    fx = xs + d * L * 0.36
    ftop = y - H1 * 0.88 - H2 - H3 - 0.1 * L
    fun = np.array([[fx - 0.035 * L, y - H1 * 0.88 - H2 - H3], [fx - 0.03 * L, ftop], [fx + 0.03 * L, ftop], [fx + 0.035 * L, y - H1 * 0.88 - H2 - H3]])
    sf = P.shape(fun, layer, tone=lin(fx - 0.035 * L, 0, fx + 0.035 * L, 0, 0.1, 0.7), group=g)
    P.hatch(sf, parallel(90, 1.6, (fx - 0.04 * L, ftop, fx + 0.04 * L, y)), t0=0.15, t1=0.6, w0=0.4, w1=0.8)
    P.contour(fun, sf, w=1.0, closed=True)
    # mast and a short flagstaff
    P.line(np.array([[xs + d * L * 0.62, y - H1 * 0.88 - H2 - H3], [xs + d * L * 0.64, ftop - 0.08 * L]]), layer, w=0.7)
    return g


def gull(P, layer, x, y, s=1.0, flap=0.5, d=1):
    """A gull as a small body with two curved wings in tapered strokes (never a 'v')."""
    body = np.array([[x - 2.2 * s * d, y], [x, y - 0.9 * s], [x + 2.4 * s * d, y + 0.2 * s], [x, y + 0.8 * s]])
    sb = P.shape(body, layer, tone=0.2)
    lw = np.array([bez((x, y), (x - 3 * s * d, y - 4 * s * flap), (x - 6 * s * d, y - 4.5 * s * flap), (x - 9 * s * d, y - 2 * s * flap), 14)])[0]
    rw = np.array([bez((x, y), (x + 3 * s * d, y - 5 * s * flap), (x + 7 * s * d, y - 5.5 * s * flap), (x + 10 * s * d, y - 2.5 * s * flap), 14)])[0]
    P.line(lw, layer, w=1.0 * s, profile=lambda t: 1 - 0.75 * t)
    P.line(rw, layer, w=1.0 * s, profile=lambda t: 1 - 0.75 * t)


# ----------------------------------------------------------------------------- plates

def pier():
    """Under the postcards: the Bostancı pier at dusk. Only the margins and the band under the cards
    show (the cards are opaque), so the pier stands at the left, the ferry at the right, and the
    horizon with the islands runs under the cards' feet."""
    W, H, HZ = 1600, 600, 470
    P = Plate(W, H, res=2, seed=7)
    for L in ('back', 'mid', 'front'):
        P.layer(L)
    TEXT = [(689, 478, 911, 500)]                 # the hint under the cards
    clear = clear_zone(TEXT, pad=4, soft=120)
    fade = edge_fade(H, top=0.3, bottom=0.0, W=W, left=0.04, right=0.04)

    def M(X, Y):
        return clear(X, Y) * fade(X, Y)
    sky(P, 'back', W, HZ, top=40, dense=0.32, seed=4, mask=M)
    # the Princes' Islands on the horizon (Kınalıada, Burgazada, Heybeliada, Büyükada), far: hairline
    isl = [((700, 800), [(745, 7, 26)]), ((870, 990), [(930, 15, 30)]), ((1050, 1250), [(1110, 16, 36), (1200, 13, 30)]),
           ((1290, 1530), [(1360, 18, 42), (1460, 20, 40)])]
    for (a, b), pk in isl:
        hills(P, 'back', smooth_ridge(a, b, HZ, pk, seed=a), HZ, tone=0.25, w=0.55, hatch_sp=2.6)
    # the Asian shore at the far left, receding: a low line with trees and roofs
    shore = smooth_ridge(0, 520, HZ, [(60, 30, 140), (240, 18, 120), (420, 8, 90)], seed=2)
    hills(P, 'back', shore, HZ, tone=0.3, w=0.6, hatch_sp=2.8)
    water(P, 'mid', W, HZ, H, seed=6, road=None, mask=M, tone=0.28)
    # the pier: a deck on piles running out from the shore, and its pavilion with a wide hipped roof
    cam = Camera(eye=(0, 4, 0), target=(0, 4, 10), f=900, cx=800, cy=HZ)
    pr = cam.p
    deck = [(-150, 2.2, 90), (-128, 2.2, 90), (-128, 2.2, 260), (-150, 2.2, 260)]
    sd = P.shape(pr(deck), 'mid', tone=0.1)
    # piles under the deck's front edge, receding
    for z in np.arange(90, 260, 6):
        a = pr([(-128, 2.2, z)])[0]; b = pr([(-128, -0.5, z)])[0]
        P.line(np.stack([a, b]), 'mid', w=0.9 * min(1, 200 / z) + 0.3)
    side = [(-128, 2.2, 90), (-128, 1.4, 90), (-128, 1.4, 260), (-128, 2.2, 260)]
    ss = P.shape(pr(side), 'mid', tone=0.6)
    P.hatch(ss, [pr([(-128, yy, 90), (-128, yy, 260)]) for yy in np.arange(1.45, 2.2, 0.18)], t0=0.3, t1=0.8, w0=0.4, w1=0.8)
    P.contour(pr([(-128, 2.2, 90), (-128, 2.2, 260)]), sd, w=1.0)
    # the pavilion at the pier's head: walls, a band of windows, the hipped roof and its eaves' shadow
    x0, x1, z0, z1 = -150, -124, 200, 232
    wall_f = [(x1, 2.2, z0), (x1, 8, z0), (x1, 8, z1), (x1, 2.2, z1)]        # the side toward the eye (right)
    wall_n = [(x0, 2.2, z0), (x1, 2.2, z0), (x1, 8, z0), (x0, 8, z0)]       # the front (toward the shore)
    swn = P.shape(pr(wall_n), 'mid', tone=0.08)
    swf = P.shape(pr(wall_f), 'mid', tone=0.5)
    P.hatch(swf, [pr([(x1, yy, z0), (x1, yy, z1)]) for yy in np.arange(2.3, 8, 0.45)], t0=0.2, t1=0.7, w0=0.4, w1=0.8)
    for zz in np.arange(z0 + 2, z1, 3.4):
        q = pr([(x1, 4.0, zz), (x1, 6.4, zz)])
        P.line(q, 'mid', w=1.0)
    ridge = [(x0 + 4, 12.5, z0 + 6), (x1 - 4, 12.5, z0 + 6), (x1 - 4, 12.5, z1 - 6), (x0 + 4, 12.5, z1 - 6)]
    roof_r = [(x1 + 1.5, 7.6, z0 - 1.5), (x1 - 4, 12.5, z0 + 6), (x1 - 4, 12.5, z1 - 6), (x1 + 1.5, 7.6, z1 + 1.5)]
    roof_f = [(x0 - 1.5, 7.6, z0 - 1.5), (x1 + 1.5, 7.6, z0 - 1.5), (x1 - 4, 12.5, z0 + 6), (x0 + 4, 12.5, z0 + 6)]
    srf = P.shape(pr(roof_f), 'mid', tone=0.12)
    srr = P.shape(pr(roof_r), 'mid', tone=0.55)
    P.hatch(srr, [pr([(x1 + 1.5 - t * 5.5, 7.6 + t * 4.9, z0 - 1.5 + t * 7.5), (x1 + 1.5 - t * 5.5, 7.6 + t * 4.9, z1 + 1.5 - t * 7.5)]) for t in np.linspace(0, 1, 14)], t0=0.2, t1=0.7, w0=0.4, w1=0.9)
    P.hatch(srf, [pr([(x0 - 1.5 + t * 5.5, 7.6 + t * 4.9, z0 - 1.5 + t * 7.5), (x1 + 1.5 - t * 5.5, 7.6 + t * 4.9, z0 - 1.5 + t * 7.5)]) for t in np.linspace(0, 1, 10)], t0=0.05, t1=0.5, w0=0.4, w1=0.6)
    for poly, sid, w in ((roof_f, srf, 1.1), (roof_r, srr, 1.3), (wall_n, swn, 1.0), (wall_f, swf, 1.2)):
        P.contour(pr(poly), sid, w=w, closed=True)
    # a lamp post on the deck and its light on the water
    lpx, lpz = -129, 140
    P.line(pr([(lpx, 2.2, lpz), (lpx, 7.5, lpz)]), 'mid', w=0.9)
    lp = pr([(lpx, 7.6, lpz)])[0]
    for k in range(16):
        a = k / 16 * 2 * math.pi
        P.line(np.array([[lp[0] + math.cos(a) * 2.5, lp[1] + math.sin(a) * 2.5], [lp[0] + math.cos(a) * 9, lp[1] + math.sin(a) * 9]]), 'front', w=0.6, profile=lambda t: 1 - 0.6 * t)
    # the ferry coming in from the right, its wake behind it
    vapur(P, 'mid', 1330, HZ + 13, 220, facing=-1, seed=3)
    rng = random.Random(9)
    for k in range(5):
        y0 = HZ + 14 + k * 2.2
        pts = np.array([[1330 + 220 + 6 + t * (60 + k * 30), y0 + t * t * (6 + k * 3)] for t in np.linspace(0, 1, 20)])
        P.line(pts, 'mid', w=0.7 - k * 0.06)
    # gulls over the pier and the ferry
    for (gx, gy, s, fl) in ((300, 330, 1.1, 0.7), (338, 352, 0.8, 0.3), (1460, 340, 1.0, 0.6), (1500, 312, 0.7, 0.9)):
        gull(P, 'front', gx, gy, s, fl)
    P.bake()
    P.engrave(step=1.1, mask=M)
    return P


def bosphorus():
    """The panorama from Salacak at late afternoon: the Maiden's Tower on its rock at the left third,
    the historic peninsula across the water in hairline (its domes and minarets as one far silhouette,
    each of the great mosques drawn once, never a template), a ferry crossing, gulls near the eye."""
    W, H, HZ = 1600, 700, 430
    P = Plate(W, H, res=2, seed=17)
    for L in ('back', 'mid', 'front'):
        P.layer(L)
    fade = edge_fade(H, top=0.12, bottom=0.12, W=W, left=0.05, right=0.05)
    sky(P, 'back', W, HZ, top=0, dense=0.34, seed=12, mask=fade, sun=(330, 150, 34))
    # the sun's burst, low over the European side (the light: upper left, late afternoon)
    for k in range(64):
        a = k / 64 * 2 * math.pi
        r1, r2 = 38, 38 + (40 if k % 2 else 70)
        P.line(np.array([[330 + math.cos(a) * r1, 150 + math.sin(a) * r1], [330 + math.cos(a) * r2, 150 + math.sin(a) * r2]]), 'back', w=0.55, profile=lambda t: 1 - 0.6 * t)
    disc = P.shape(arc((330, 150), 30, 0, 2 * math.pi, 80), 'back', tone=0.3)
    P.hatch(disc, [np.array([[290, y], [370, y]]) for y in np.arange(121, 180, 2.6)], t0=0.1, t1=0.5, w0=0.4, w1=0.6)
    # the historic peninsula, far right: a low hill line and the silhouettes on it, in hairline
    pen = smooth_ridge(820, 1600, HZ, [(1000, 22, 160), (1250, 30, 180), (1480, 26, 160)], seed=5)
    sp = hills(P, 'back', pen, HZ, tone=0.22, w=0.5, hatch_sp=2.4)

    def mosque(cx, base, s, minarets, sid_layer='back'):
        """A great mosque as a far silhouette: a stepped mass of half-domes up to the central dome,
        minarets as tapered needles with their balconies."""
        g = P.nid
        dome = np.concatenate([arc((cx, base - 14 * s), 13 * s, math.pi, 2 * math.pi, 40), [[cx + 13 * s, base], [cx - 13 * s, base]]])
        sd = P.shape(dome, sid_layer, tone=lin(cx - 13 * s, 0, cx + 13 * s, 0, 0.1, 0.6), group=g)
        P.hatch(sd, [arc((cx - 3 * s, base - 14 * s), r, math.pi, 2 * math.pi, 30) for r in np.arange(3, 13 * s, 2.2)], t0=0.2, t1=0.6, w0=0.4, w1=0.6)
        P.contour(arc((cx, base - 14 * s), 13 * s, math.pi, 2 * math.pi, 40), sd, w=0.7)
        P.line(np.array([[cx, base - 27 * s], [cx, base - 31 * s]]), sid_layer, w=0.6)
        for side in (-1, 1):
            hd = np.concatenate([arc((cx + side * 15 * s, base - 6 * s), 8 * s, math.pi, 2 * math.pi, 24), [[cx + side * 15 * s + 8 * s, base], [cx + side * 15 * s - 8 * s, base]]])
            sh = P.shape(hd, sid_layer, tone=0.35 if side > 0 else 0.12, group=g)
            P.contour(arc((cx + side * 15 * s, base - 6 * s), 8 * s, math.pi, 2 * math.pi, 24), sh, w=0.55)
        for mx, mh in minarets:
            P.line(np.array([[cx + mx * s, base], [cx + mx * s, base - mh * s]]), sid_layer, w=1.1 * s, profile=lambda t: 1 - 0.7 * t)
            for b in (0.55, 0.75):
                P.line(np.array([[cx + mx * s - 1.4 * s, base - mh * s * b], [cx + mx * s + 1.4 * s, base - mh * s * b]]), sid_layer, w=0.5)
    # Hagia Sophia (four minarets, the great flattened dome), the Blue Mosque (six), Süleymaniye far
    mosque(1250, HZ - 28, 1.4, [(-24, 34), (24, 34), (-30, 30), (30, 30)])
    mosque(1390, HZ - 26, 1.3, [(-26, 40), (26, 40), (-34, 36), (34, 36), (-40, 32), (40, 32)])
    mosque(1040, HZ - 22, 1.1, [(-22, 38), (22, 38), (-28, 32), (28, 32)])
    # Topkapı's point and the walls along the water: a low line of roofs and cypresses
    for x in np.arange(1460, 1590, 9):
        h = 6 + 5 * noise(x / 13, 0.3, 4)
        P.line(np.array([[x, HZ - 10], [x, HZ - 10 - h]]), 'back', w=0.9, profile=lambda t: 1 - 0.7 * t)
    water(P, 'mid', W, HZ, H, seed=13, road=(330, 120), mask=fade, tone=0.3)
    # the Maiden's Tower on its rock at the left third (mid layer), with the Asian shore behind it at left
    shore = smooth_ridge(0, 300, HZ, [(40, 20, 120), (200, 12, 100)], seed=8)
    hills(P, 'back', shore, HZ, tone=0.32, w=0.55, hatch_sp=2.6)
    tower(P, 'mid', 520, HZ + 74, 2.6)
    # a ferry crossing toward the peninsula
    vapur(P, 'mid', 900, HZ + 22, 150, facing=1)
    for k in range(4):
        pts = np.array([[900 - 150 - 4 - t * (50 + k * 26), HZ + 22 + k * 2 + t * t * (5 + k * 2)] for t in np.linspace(0, 1, 18)])
        P.line(pts, 'mid', w=0.65 - k * 0.06)
    for (gx, gy, s, fl, d) in ((180, 520, 3.4, 0.6, 1), (250, 566, 2.4, 0.2, 1), (1300, 560, 3.0, 0.8, -1), (700, 300, 1.6, 0.5, 1)):
        gull(P, 'front', gx, gy, s, fl, d)
    P.bake()
    P.engrave(step=1.0, mask=fade)
    return P


def tower(P, layer, cx, base, s):
    """Kız Kulesi: the rock, the square stone terrace, the low building around the tower's foot, and
    the tower: a square shaft, an upper stage with arched windows, a balcony, and the lantern dome with
    its finial. Light from the upper left: the right faces in shadow. base: the waterline at the rock."""
    g = P.nid
    u = s  # px per metre (roughly)
    # the rock: a low irregular mass, contour-hatched, in the water
    rk = np.array([[cx - 34 * u, base], [cx - 28 * u, base - 4 * u], [cx - 10 * u, base - 6 * u], [cx + 18 * u, base - 5 * u], [cx + 34 * u, base - 2 * u], [cx + 38 * u, base], ])
    rkp = np.concatenate([rk, [[cx + 40 * u, base + 3 * u], [cx - 36 * u, base + 3 * u]]])
    sr = P.shape(rkp, layer, tone=lin(cx - 36 * u, 0, cx + 40 * u, 0, 0.3, 0.8), group=g)
    P.hatch(sr, parallel(-30, 2.2, (cx - 40 * u, base - 8 * u, cx + 42 * u, base + 4 * u)), t0=0.2, t1=0.7, w0=0.4, w1=0.8)
    P.hatch(sr, parallel(25, 2.6, (cx - 40 * u, base - 8 * u, cx + 42 * u, base + 4 * u)), t0=0.55, t1=0.9, w0=0.4, w1=0.7)
    P.contour(rk, sr, w=1.1)
    # the terrace: a low wall all round (front face lit, right return in shadow)
    tw0, tw1, ty = cx - 30 * u, cx + 30 * u, base - 5 * u
    face = rect(tw0, ty - 5 * u, tw1, ty)
    ret = np.array([[tw1, ty - 5 * u], [tw1 + 6 * u, ty - 8 * u], [tw1 + 6 * u, ty - 3 * u], [tw1, ty]])
    sf = P.shape(face, layer, tone=0.08, group=g); st = P.shape(ret, layer, tone=0.6, group=g)
    P.hatch(st, parallel(90, 1.8, (tw1, ty - 9 * u, tw1 + 6 * u, ty)), t0=0.3, t1=0.8, w0=0.4, w1=0.8)
    for x in np.arange(tw0 + 4 * u, tw1, 6 * u):     # the stone courses as short joints
        P.line(np.array([[x, ty - 5 * u], [x, ty - 2.5 * u]]), layer, w=0.45)
    P.contour(face, sf, w=1.0, closed=True); P.contour(ret, st, w=1.2, closed=True)
    # the building around the tower's foot: two blocks with arched windows (three drawn per face)
    def block(x0, x1, y1, h, depth, roof=True):
        f = rect(x0, y1 - h, x1, y1)
        r = np.array([[x1, y1 - h], [x1 + depth, y1 - h - depth * 0.5], [x1 + depth, y1 - depth * 0.5], [x1, y1]])
        s1 = P.shape(f, layer, tone=add(0.06, lin(x0, 0, x1, 0, 0, 0.1)), group=g)
        s2 = P.shape(r, layer, tone=0.62, group=g)
        P.hatch(s2, parallel(90, 1.7, (x1, y1 - h - depth, x1 + depth, y1)), t0=0.3, t1=0.8, w0=0.4, w1=0.85)
        P.hatch(s2, parallel(-40, 2.4, (x1, y1 - h - depth, x1 + depth, y1)), t0=0.55, t1=0.9, w0=0.4, w1=0.7)
        n = 3
        for i in range(n):
            wx = x0 + (x1 - x0) * (i + 0.5) / n
            ww, wh = (x1 - x0) / n * 0.32, h * 0.42
            win = np.concatenate([[[wx - ww / 2, y1 - h * 0.25]], arc((wx, y1 - h * 0.25 - wh + ww / 2), ww / 2, math.pi, 2 * math.pi, 12), [[wx + ww / 2, y1 - h * 0.25]]])
            sw = P.shape(win, layer, tone=0.85, group=g)
            P.hatch(sw, parallel(90, 1.3, (wx - ww, y1 - h, wx + ww, y1)), t0=0.3, t1=0.9, w0=0.4, w1=0.7)
            P.contour(win, sw, w=0.6, closed=True)
        P.contour(f, s1, w=1.0, closed=True); P.contour(r, s2, w=1.2, closed=True)
        if roof:
            rf = np.array([[x0 - 1 * u, y1 - h], [x1 + 1 * u, y1 - h], [x1 + depth + 1 * u, y1 - h - depth * 0.5], [x0 + depth - 1 * u, y1 - h - depth * 0.5]])
            s3 = P.shape(rf, layer, tone=0.15, group=g)
            P.contour(rf, s3, w=0.8, closed=True)
            P.line(np.array([[x0 - 1 * u, y1 - h + 0.8 * u], [x1 + 1 * u, y1 - h + 0.8 * u]]), layer, w=0.9)
    block(cx - 24 * u, cx - 4 * u, ty - 5 * u, 9 * u, 7 * u)
    block(cx + 8 * u, cx + 24 * u, ty - 5 * u, 7 * u, 6 * u)
    # the tower: a square shaft
    sx0, sx1 = cx - 6 * u, cx + 6 * u
    shaft_top = ty - 5 * u - 38 * u
    d = 4 * u
    sh_f = rect(sx0, shaft_top, sx1, ty - 5 * u)
    sh_r = np.array([[sx1, shaft_top], [sx1 + d, shaft_top - d * 0.5], [sx1 + d, ty - 5 * u - d * 0.5], [sx1, ty - 5 * u]])
    a1 = P.shape(sh_f, layer, tone=lin(sx0, 0, sx1, 0, 0.02, 0.2), group=g)
    a2 = P.shape(sh_r, layer, tone=0.66, group=g)
    P.hatch(a1, parallel(90, 2.2, (sx0, shaft_top, sx1, ty)), t0=0.12, t1=0.5, w0=0.4, w1=0.6)
    P.hatch(a2, parallel(90, 1.5, (sx1, shaft_top - d, sx1 + d, ty)), t0=0.3, t1=0.8, w0=0.4, w1=0.85)
    P.hatch(a2, parallel(-45, 2.2, (sx1, shaft_top - d, sx1 + d, ty)), t0=0.55, t1=0.9, w0=0.4, w1=0.7)
    for i, yy in enumerate((shaft_top + 8 * u, shaft_top + 19 * u, shaft_top + 29 * u)):
        win = np.concatenate([[[cx - 1.4 * u, yy + 5 * u]], arc((cx, yy + 1.4 * u), 1.4 * u, math.pi, 2 * math.pi, 10), [[cx + 1.4 * u, yy + 5 * u]]])
        sw = P.shape(win, layer, tone=0.9, group=g)
        P.hatch(sw, parallel(90, 1.2, (cx - 2 * u, yy, cx + 2 * u, yy + 6 * u)), t0=0.3, t1=0.9, w0=0.4, w1=0.7)
    P.contour(sh_f, a1, w=1.1, closed=True); P.contour(sh_r, a2, w=1.4, closed=True)
    # the cornice and the balcony
    P.line(np.array([[sx0 - 1.5 * u, shaft_top], [sx1 + d + 1.5 * u, shaft_top - d * 0.5]]), layer, w=1.3)
    # the upper stage: narrower, its arched windows, then the drum of the dome
    ux0, ux1 = cx - 4.5 * u, cx + 4.5 * u
    up_top = shaft_top - 9 * u
    up_f = rect(ux0, up_top, ux1, shaft_top)
    up_r = np.array([[ux1, up_top], [ux1 + d * 0.8, up_top - d * 0.4], [ux1 + d * 0.8, shaft_top - d * 0.4], [ux1, shaft_top]])
    b1 = P.shape(up_f, layer, tone=0.06, group=g); b2 = P.shape(up_r, layer, tone=0.62, group=g)
    P.hatch(b2, parallel(90, 1.4, (ux1, up_top - d, ux1 + d, shaft_top)), t0=0.3, t1=0.8, w0=0.4, w1=0.8)
    for wx in (cx - 2.2 * u, cx + 2.2 * u):
        win = np.concatenate([[[wx - 1.0 * u, shaft_top - 2 * u]], arc((wx, up_top + 3 * u), 1.0 * u, math.pi, 2 * math.pi, 10), [[wx + 1.0 * u, shaft_top - 2 * u]]])
        sw = P.shape(win, layer, tone=0.9, group=g)
        P.hatch(sw, parallel(90, 1.1, (wx - 1.5 * u, up_top, wx + 1.5 * u, shaft_top)), t0=0.3, t1=0.9, w0=0.4, w1=0.65)
    P.contour(up_f, b1, w=1.0, closed=True); P.contour(up_r, b2, w=1.2, closed=True)
    P.line(np.array([[ux0 - 1 * u, up_top], [ux1 + d * 0.8 + 1 * u, up_top - d * 0.4]]), layer, w=1.1)
    # the lantern dome: an ogee cone in lead, contour-hatched as a solid of revolution; the finial
    dc = cx + 0.8 * u
    db = up_top - 0.6 * u
    hgt = 13 * u
    left = bez((dc - 5.2 * u, db), (dc - 5.6 * u, db - hgt * 0.35), (dc - 1.2 * u, db - hgt * 0.6), (dc, db - hgt), 30)
    right = bez((dc, db - hgt), (dc + 1.2 * u, db - hgt * 0.6), (dc + 5.6 * u, db - hgt * 0.35), (dc + 5.2 * u, db), 30)
    dome = np.concatenate([left, right])
    sdm = P.shape(dome, layer, tone=lambda X, Y: np.clip(0.05 + 0.75 * ((X - (dc - 2 * u)) / (7 * u)) ** 2 * (X > dc - 2 * u), 0, 1), group=g)
    lines = []
    for i in range(1, 12):
        t = i / 12
        # meridians: from the base circle to the tip, packed toward the edges
        xb = dc + 5.2 * u * math.cos(math.pi * (1 - t))
        lines.append(np.stack([[xb, db], [dc + (xb - dc) * 0.55, db - hgt * 0.45], [dc, db - hgt]]))
        lines[-1] = bez(lines[-1][0], lines[-1][1], lines[-1][1], lines[-1][2], 16)
    P.hatch(sdm, lines, t0=0.1, t1=0.7, w0=0.4, w1=0.85)
    P.hatch(sdm, [np.array([[dc - 6 * u, yy], [dc + 6 * u, yy]]) for yy in np.arange(db - hgt, db, 1.8)], t0=0.55, t1=0.9, w0=0.4, w1=0.6)
    P.contour(left, sdm, w=0.9); P.contour(right, sdm, w=1.5)
    P.line(np.array([[dc, db - hgt], [dc, db - hgt - 4 * u]]), layer, w=0.9, profile=lambda t: 1 - 0.6 * t)
    pen = np.array([[dc, db - hgt - 4 * u], [dc + 2.6 * u, db - hgt - 3.4 * u], [dc, db - hgt - 2.6 * u]])
    P.line(pen, layer, w=0.5)
    # the small lighthouse turret on the terrace at the right
    lx = cx + 27 * u
    lt = rect(lx - 1.6 * u, ty - 15 * u, lx + 1.6 * u, ty - 5 * u)
    sl = P.shape(lt, layer, tone=lin(lx - 1.6 * u, 0, lx + 1.6 * u, 0, 0.1, 0.7), group=g)
    P.hatch(sl, parallel(90, 1.2, (lx - 2 * u, ty - 16 * u, lx + 2 * u, ty)), t0=0.2, t1=0.7, w0=0.4, w1=0.7)
    P.contour(lt, sl, w=0.9, closed=True)
    P.line(np.array([[lx - 2.2 * u, ty - 15 * u], [lx, ty - 18 * u], [lx + 2.2 * u, ty - 15 * u]]), layer, w=0.9)
    # its reflection: vertical breaks in the water under the rock
    rng = random.Random(int(cx))
    for k in range(40):
        x = cx + rng.gauss(0, 10 * u)
        y = base + 4 * u + rng.uniform(0, 30 * u)
        P.line(np.array([[x, y], [x, y + rng.uniform(2, 6) * u * 0.5]]), layer, w=0.6)
    return g


def maidens():
    """The Maiden's Tower in portrait, for the phone: the tower in the lower half on its rock, the water
    ruling round it, the Asian shore a thin band behind, the sky above for the name and the brief."""
    W, H, HZ = 390, 844, 520
    P = Plate(W, H, res=3, seed=23)
    for L in ('back', 'mid', 'front'):
        P.layer(L)
    fade = edge_fade(H, top=0.1, bottom=0.08)
    sky(P, 'back', W, HZ, top=60, dense=0.34, seed=31, mask=fade, sun=(84, 300, 18))
    for k in range(44):
        a = k / 44 * 2 * math.pi
        r1, r2 = 21, 21 + (22 if k % 2 else 40)
        P.line(np.array([[84 + math.cos(a) * r1, 300 + math.sin(a) * r1], [84 + math.cos(a) * r2, 300 + math.sin(a) * r2]]), 'back', w=0.5, profile=lambda t: 1 - 0.6 * t)
    # the far shore behind (the Asian side at Salacak, to the right, and the European side far left)
    hills(P, 'back', smooth_ridge(150, 390, HZ, [(250, 14, 70), (360, 10, 60)], seed=3), HZ, tone=0.3, w=0.5, hatch_sp=2.4)
    hills(P, 'back', smooth_ridge(0, 120, HZ, [(40, 8, 50)], seed=4), HZ, tone=0.22, w=0.45, hatch_sp=2.4)
    water(P, 'mid', W, HZ, H, seed=33, road=(84, 40), mask=fade, tone=0.3)
    tower(P, 'mid', 210, 672, 3.2)
    gull(P, 'front', 96, 430, 1.6, 0.6, 1)
    gull(P, 'front', 300, 380, 1.1, 0.3, -1)
    P.bake()
    P.engrave(step=1.0, mask=fade)
    return P


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    which = sys.argv[2:] or ['pier', 'bosphorus', 'maidens']
    if 'pier' in which:
        P = pier()
        s = P.svg({'back': 0.06, 'mid': 0.08, 'front': 0.09}, ink='#e8e3dd', q=4)
        open(f'{out}/pier.svg', 'w').write(s); print('pier', len(s))
    if 'bosphorus' in which:
        P = bosphorus()
        s = P.svg({'back': 0.16, 'mid': 0.2, 'front': 0.22}, ink='#e8e3dd', q=4)
        open(f'{out}/bosphorus.svg', 'w').write(s); print('bosphorus', len(s))
    if 'maidens' in which:
        P = maidens()
        s = P.svg({'back': 0.16, 'mid': 0.2, 'front': 0.22}, ink='#e8e3dd', q=4)
        open(f'{out}/maidens-tower.svg', 'w').write(s); print('maidens', len(s))
