"""How I work's plate (guide §2.6, review row S28): the loom where weaving by hand and weaving by a
programmed machine meet in one cloth.

A frontal elevation with a slight oblique, as the Encyclopédie draws its weaving plates. The left half
is a hand loom: a pulley, two heddle shafts on their cords, the treadles, the shuttle at the fell.
The right half is the Jacquard head on the same frame: the box, its card cylinder, the chain of
punched cards draped down the margin, the harness cords. Both feed one warp, and the warp ends at
one fell line: the cloth is woven where the two lanes of How I work meet ("Both matter."). The lanes'
lines stand on warp threads, so the drops fall along the warp.

The column of text (760 px, centred) is a clear zone: the loom stands in the margins; inside the
column only warp threads pass, in the gaps between the text blocks.

Band: 1600 x 1000, centred on the How I work section (band y = section y + 176 at 1440).
Phone master: 390 x 1200: the warp along the lane line and the card chain at the right edge.
Usage: python3 loom.py <out-dir>
"""
import math
import random
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from burin import (Plate, parallel, ruled, across, rect, arc, bez, lin, radial, add, nz, edge_fade,
                   clear_zone, concentric, resample, fbm)

OBL = np.array([9.0, -6.0])     # the oblique: one unit of depth goes right and up (light from upper left)


def box_faces(x0, y0, x1, y1, depth):
    """A block in frontal elevation with the oblique: front, top and right side faces."""
    o = OBL * depth
    front = rect(x0, y0, x1, y1)
    top = np.array([[x0, y0], [x1, y0], [x1 + o[0], y0 + o[1]], [x0 + o[0], y0 + o[1]]])
    side = np.array([[x1, y0], [x1 + o[0], y0 + o[1]], [x1 + o[0], y1 + o[1]], [x1, y1]])
    return front, top, side


def grain_lines(x0, y0, x1, y1, sp, vertical, seed):
    """Wood grain: lines along the timber with a slow wander and a knot now and then."""
    out = []
    if vertical:
        L = y1 - y0
        t = np.arange(y0 - 2, y1 + 3, 3.0)
        for i, x in enumerate(np.arange(x0 + sp * 0.7, x1, sp)):
            dx = 1.4 * (fbm(t / 60, i * 0.37, seed) - 0.5)
            out.append(np.stack([x + dx, t], axis=1))
    else:
        t = np.arange(x0 - 2, x1 + 3, 3.0)
        for i, y in enumerate(np.arange(y0 + sp * 0.7, y1, sp)):
            dy = 1.2 * (fbm(t / 70, i * 0.41, seed) - 0.5)
            out.append(np.stack([t, y + dy], axis=1))
    return out


def timber(P, x0, y0, x1, y1, depth, layer, grain='v', tone=0.12, side_tone=0.62, top_tone=0.05, seed=0):
    front, top, side = box_faces(x0, y0, x1, y1, depth)
    g = P.nid
    s_side = P.shape(side, layer, tone=add(side_tone, lin(x1, y0, x1, y1, -0.08, 0.1)), group=g)
    s_top = P.shape(top, layer, tone=top_tone, group=g)
    s_front = P.shape(front, layer, tone=add(tone, lin(x0, y0, x1, y1, -0.06, 0.16), nz(40, 0.12, seed)), group=g)
    P.hatch(s_front, grain_lines(x0, y0, x1, y1, 4.2, grain == 'v', seed), t0=0.12, t1=0.5, w0=0.42, w1=0.85)
    # side: lines along the depth direction, then a vertical cross in the deepest part
    sl = [np.array([[x1, y], [x1 + OBL[0] * depth, y + OBL[1] * depth]]) for y in np.arange(y0 - 6, y1 + 8, 3.6)]
    P.hatch(s_side, sl, t0=0.2, t1=0.6, w0=0.45, w1=1.05)
    P.hatch(s_side, [np.array([[x, y0 - 12], [x, y1 + 6]]) for x in np.arange(x1 + 1.2, x1 + OBL[0] * depth, 3.2)], t0=0.5, t1=0.85, w0=0.42, w1=0.8)
    P.hatch(s_top, [np.array([[x, y0], [x + OBL[0] * depth, y0 + OBL[1] * depth]]) for x in np.arange(x0, x1, 6)], t0=0.08, t1=0.3, w0=0.4, w1=0.6)
    return s_front, s_top, s_side, front, top, side


def outline_box(P, ids, faces, w=1.0):
    s_front, s_top, s_side = ids
    front, top, side = faces
    P.contour(front, s_front, w=w, closed=True)
    P.contour(top, s_top, w=w * 0.8, closed=True)
    P.contour(side, s_side, w=w * 1.1, closed=True)


def wheel(P, c, r, layer, hub=0.22, seed=0):
    """A pulley seen face on: rim with contour hatching (ellipses following the rim), spokes, hub."""
    g = P.nid
    rim = P.shape(arc(c, r, 0, 2 * math.pi, 120), layer, tone=add(radial(c[0] - r * 0.5, c[1] - r * 0.5, r * 2.2, 0.0, 0.7)), group=g)
    inner = P.shape(arc(c, r * 0.78, 0, 2 * math.pi, 100), layer, tone=0.0, group=g)
    hubs = P.shape(arc(c, r * hub, 0, 2 * math.pi, 40), layer, tone=add(radial(c[0] - r * hub * 0.5, c[1] - r * hub * 0.5, r * hub * 2.2, 0.0, 0.8)), group=g)
    P.hatch(rim, concentric(c, r * 0.79, r * 0.99, 2.6), t0=0.12, t1=0.6, w0=0.42, w1=0.9)
    P.hatch(hubs, concentric(c, 1.5, r * hub, 2.4), t0=0.15, t1=0.7, w0=0.42, w1=0.85)
    P.contour(arc(c, r, 0, 2 * math.pi, 160), rim, w=1.2)
    P.contour(arc(c, r * 0.78, 0, 2 * math.pi, 140), rim, w=0.8)
    P.contour(arc(c, r * hub, 0, 2 * math.pi, 50), hubs, w=0.9)
    for k in range(6):
        a = k * math.pi / 3 + 0.2
        p0 = np.array(c) + np.array([math.cos(a), math.sin(a)]) * r * hub
        p1 = np.array(c) + np.array([math.cos(a), math.sin(a)]) * r * 0.78
        n = np.array([-math.sin(a), math.cos(a)])
        poly = np.array([p0 + n * 2.6, p1 + n * 3.6, p1 - n * 3.6, p0 - n * 2.6])
        sp = P.shape(poly, layer, tone=0.35 + 0.3 * max(0, -(n @ np.array([-0.77, -0.64]))), group=g)
        P.hatch(sp, [np.array([p0 + n * t, p1 + n * t * 1.3]) for t in np.arange(-2.6, 2.8, 1.8)], t0=0.2, t1=0.7, w0=0.4, w1=0.7)
        P.contour(poly, sp, w=0.8, closed=True)
    return rim


def build(W, H, desktop=True, seed=3):
    P = Plate(W, H, res=2, seed=seed)
    rng = random.Random(seed)
    for L in ('back', 'mid', 'front'):
        P.layer(L)

    if desktop:
        # band coordinates of the page's text (1440 layout: band x = page x + 80, band y = section y + 226)
        # the text's line boxes, measured on the page at 1440 (section coordinates), moved into the band
        LINES = [[618, 5, 822, 47], [502, 76, 938, 96], [647, 103, 793, 123], [368, 179, 465, 208], [368, 228, 434, 245],
                 [368, 262, 545, 279], [368, 295, 527, 312], [368, 335, 463, 351], [368, 359, 487, 376], [780, 179, 920, 208],
                 [780, 228, 1088, 245], [780, 262, 1025, 279], [780, 295, 1082, 312], [780, 321, 816, 338], [780, 360, 875, 376],
                 [780, 385, 1012, 402], [530, 486, 720, 515], [368, 570, 798, 599], [368, 607, 796, 636]]
        TEXT = [(a + 80, b + 226, c + 80, d + 226) for a, b, c, d in LINES]
        # the text blocks (the general clear zone: soft, so no hole has the shape of a line of text)
        BLOCKS = [(690, 226, 910, 286), (575, 300, 1025, 352), (440, 402, 630, 610), (852, 402, 1170, 630),
                  (600, 706, 805, 745), (440, 790, 885, 866)]
        CL, CR = 420, 1180                          # the column
        LANE = (423.5, 835.5)                       # the lanes' lines
        FELL = 693                                  # the U's floor: the fell of the cloth
    else:
        LINES = [[16, 3, 169, 35], [16, 63, 370, 83], [16, 89, 213, 109], [42, 163, 122, 187], [42, 208, 106, 224],
                 [42, 240, 212, 256], [42, 272, 195, 288], [42, 310, 137, 326], [42, 334, 157, 350], [42, 403, 157, 427],
                 [42, 447, 339, 463], [42, 479, 278, 495], [42, 511, 371, 527], [42, 549, 137, 565], [42, 574, 268, 590],
                 [20, 639, 164, 663], [36, 716, 264, 740], [36, 747, 282, 771], [36, 779, 263, 803]]
        TEXT = [(a, b + 170, c, d + 170) for a, b, c, d in LINES]
        BLOCKS = TEXT
        CL, CR = 16, 374
        LANE = (19.5,)
        FELL = 800

    clear = clear_zone(BLOCKS, pad=16, soft=44 if desktop else 26)
    fade = edge_fade(H, top=0.12, bottom=0.12)
    if desktop:
        # density falls off toward the outer edges of the band (the focus is where the two halves meet)
        def side_fade(X, Y):
            return np.clip(np.minimum(X, W - X) / 150, 0, 1) ** 1.2
    else:
        def side_fade(X, Y):
            return np.ones_like(X)

    def M(X, Y):
        return clear(X, Y) * fade(X, Y) * side_fade(X, Y)

    if desktop:
        # ---------------------------------------------------------------- the warp (behind everything)
        # from the back of the loom (behind the heddles and the harness) down to the fell; everywhere,
        # except where text stands (the clear zone keeps only the gaps between the blocks)
        wsid = P.shape(rect(104, 380, 1530, FELL + 1), 'back', tone=add(0.34, lin(0, 380, 0, FELL, -0.12, 0.12)))
        # in the margins the warp shows only below the heddles and the harness (above, they hide it)
        warp = [np.array([[x, 380 if CL - 20 < x < CR + 20 else 560], [x, FELL]]) for x in np.arange(110, 1530, 7.0)
                if not (CL + 30 < x < CR - 4) or int(x) % 2 == 0]
        P.hatch(wsid, warp, t0=0.05, t1=0.5, w0=0.42, w1=0.62)
        warp = []
        # the lanes' lines stand on warp threads (the drops fall along them): a bundle beside each line,
        # inside its 28 px padding where no text stands
        for lx in LANE:
            for dx in (-7, 7, 13.5, 20):
                warp.append(np.array([[lx + dx, 380], [lx + dx, FELL]]))
        warp_clear = clear_zone(TEXT, pad=7, soft=10)
        P.hatch(wsid, warp, t0=0.05, t1=0.5, w0=0.42, w1=0.62, mask=lambda X, Y: warp_clear(X, Y) * fade(X, Y) * side_fade(X, Y))

        # ---------------------------------------------------------------- the frame
        ids = timber(P, 60, 150, 1572, 172, 2.4, 'back', grain='h', tone=0.1, seed=1)
        outline_box(P, ids[:3], ids[3:], w=1.0)
        for (x0, x1) in ((70, 100), (1540, 1568)):
            ids = timber(P, x0, 168, x1, 1040, 2.6, 'mid', grain='v', tone=0.14, seed=x0)
            outline_box(P, ids[:3], ids[3:], w=1.25)

        # ---------------------------------------------------------------- the hand loom (left)
        wheel(P, (250, 236), 34, 'mid')
        br = P.shape(np.array([[244, 172], [256, 172], [254, 236], [246, 236]]), 'mid', tone=0.5)
        P.hatch(br, parallel(90, 2.8, (240, 170, 260, 238)), t0=0.2, t1=0.7, w0=0.4, w1=0.8)
        P.contour(np.array([[244, 172], [246, 236]]), br, w=0.8)
        P.contour(np.array([[256, 172], [254, 236]]), br, w=1.1)
        for x in (216.5, 283.5):
            P.line(np.array([[x, 236], [x, 404]]), 'mid', w=0.8)
        for k, (y0, y1) in enumerate(((404, 474), (488, 558))):
            for yy in (y0, y1 - 7):
                ids = timber(P, 128, yy, 404, yy + 7, 1.2, 'mid', grain='h', tone=0.18, seed=yy)
                outline_box(P, ids[:3], ids[3:], w=0.9)
            for j, x in enumerate(np.arange(136 + 2 * k, 400, 5.2)):
                P.line(np.array([[x, y0 + 7], [x, y1 - 7]]), 'mid', w=0.5)
                if j % 2 == 0:
                    ey = (y0 + y1) / 2 + (4 if (j // 2 + k) % 2 else -4)
                    P.line(np.array([[x - 1.2, ey - 2.4], [x, ey - 3.8], [x + 1.2, ey - 2.4], [x + 1.2, ey + 2.4],
                                     [x, ey + 3.8], [x - 1.2, ey + 2.4], [x - 1.2, ey - 2.4]]), 'mid', w=0.5, step=0.6)
        # treadle cords and treadles (low, sinking into the bottom fade)
        for k in range(2):
            P.line(np.array([[150 + k * 210, 558], [168 + k * 150, 902 - k * 18]]), 'back', w=0.55)
        for k, y in enumerate((900, 922)):
            pts = np.array([[118, y + 18], [400, y - 8]])
            d = pts[1] - pts[0]; n = np.array([-d[1], d[0]]) / np.linalg.norm(d)
            poly = np.array([pts[0] + n * 4.2, pts[1] + n * 3.2, pts[1] - n * 3.2, pts[0] - n * 4.2])
            s = P.shape(poly, 'mid', tone=add(0.3, lin(118, 0, 400, 0, 0.25, -0.05)))
            P.hatch(s, [pts + n * t for t in np.arange(-3.6, 4, 1.8)], t0=0.15, t1=0.6, w0=0.42, w1=0.8)
            P.contour(poly, s, w=1.0, closed=True)

        # ---------------------------------------------------------------- the Jacquard head (right)
        hx0, hy0, hx1, hy1 = 1222, 196, 1428, 334
        ids = timber(P, hx0, hy0, hx1, hy1, 3.4, 'mid', grain='h', tone=0.16, side_tone=0.66, seed=9)
        outline_box(P, ids[:3], ids[3:], w=1.35)
        for r in range(5):
            for c in range(21):
                x = hx0 + 18 + c * 8.2; y = hy0 + 36 + r * 15
                P.line(np.array([[x, y], [x + 3.4, y]]), 'mid', w=0.65)
        for y in (hy0 + 18, hy1 - 16):
            P.line(np.array([[hx0 + 6, y], [hx1 - 6, y]]), 'mid', w=0.9)
        # the head stands on two short legs on the top beam (it hangs from the frame)
        for x in (hx0 + 30, hx1 - 30):
            P.line(np.array([[x, 172], [x, hy0]]), 'mid', w=1.3)
        # the card cylinder: a square prism seen end on, right of the box, on its arm
        cx, cy, cs = 1468, 262, 25
        P.line(np.array([[hx1 + 30, cy], [cx - cs + 3, cy]]), 'mid', w=1.0)
        sq = np.array([[cx, cy - cs], [cx + cs, cy], [cx, cy + cs], [cx - cs, cy]])
        sc = P.shape(sq, 'mid', tone=add(0.3, lin(cx - cs, cy - cs, cx + cs, cy + cs, -0.25, 0.45)))
        P.hatch(sc, parallel(45, 2.9, (cx - cs, cy - cs, cx + cs, cy + cs)), t0=0.15, t1=0.6, w0=0.42, w1=0.9)
        P.hatch(sc, parallel(-45, 3.2, (cx - cs, cy - cs, cx + cs, cy + cs)), t0=0.45, t1=0.8, w0=0.42, w1=0.8)
        P.contour(sq, sc, w=1.4, closed=True)
        # the card chain: the punched cards hang from the cylinder in a fan-fold, each card turned
        # against its neighbour, so the faces alternate: one tilted up to the light, one turned down.
        # It runs down the margin, turns at the bottom and goes back up behind itself.
        holes = random.Random(42)
        y = cy + cs + 2
        i = 0
        H0, hw = 17.0, 40.0
        near = []
        while y < 846:
            a = 0.98 if i % 2 else 1.18           # fold angle from the vertical plane
            h = H0 * math.cos(a) + 2.0
            x = cx + 4 + 9 * math.sin((y - cy) / 210)
            near.append((x, y, h, i % 2 == 0))
            y += h; i += 1
        # the far run (back layer), seen only beside the near one
        for x, yy, h, lit in near[2:]:
            xf = x + 15
            poly = rect(xf - hw + 4, yy + 1, xf + hw - 4, yy + h + 1)
            s_ = P.shape(poly, 'back', tone=0.55 if lit else 0.3)
            P.hatch(s_, [np.array([[xf - hw, v], [xf + hw, v]]) for v in np.arange(yy + 2, yy + h, 2.6)], t0=0.25, t1=0.7, w0=0.4, w1=0.7)
            P.contour(poly, s_, w=0.55, closed=True)
        # the turn at the bottom
        tb = near[-1][1] + near[-1][2]
        turn = np.concatenate([bez((near[-1][0] - hw, tb), (near[-1][0] - hw, tb + 26), (near[-1][0] + 15 + hw - 4, tb + 26), (near[-1][0] + 15 + hw - 4, tb - 2), 30)])
        P.line(turn, 'mid', w=0.8)
        for x, yy, h, lit in near:
            poly = rect(x - hw, yy, x + hw, yy + h)
            s_ = P.shape(poly, 'mid', tone=add(0.06 if lit else 0.46, lin(x - hw, 0, x + hw, 0, -0.04, 0.12)))
            P.hatch(s_, [np.array([[x - hw - 2, v], [x + hw + 2, v]]) for v in np.arange(yy + 1.3, yy + h, 2.4)], t0=0.2, t1=0.65, w0=0.4, w1=0.8)
            P.contour(poly, s_, w=0.8, closed=True, light=True)
            if lit:
                for k in range(-7, 8):
                    if holes.random() < 0.45:
                        P.dot(x + k * 4.8, yy + h * 0.5, 'mid', r=0.8)
        for side in (-1, 1):
            P.line(np.array([[e[0] + side * (hw - 6), e[1] + e[2] * 0.5] for e in near]), 'mid', w=0.5)

        # harness cords: from the head's floor down through the comber board to the warp
        comber_y = 440
        ids = timber(P, 1190, comber_y, 1436, comber_y + 8, 1.4, 'mid', grain='h', tone=0.24, seed=13)
        outline_box(P, ids[:3], ids[3:], w=0.9)
        for k, x in enumerate(np.arange(1198, 1430, 4.6)):
            xh = hx0 + 10 + (x - 1198) / (1430 - 1198) * (hx1 - hx0 - 20)
            P.line(np.array([[xh, hy1 + 2], [x, comber_y]]), 'back', w=0.48)
            yl = 548 + (k % 5) * 9
            P.line(np.array([[x, comber_y + 8], [x, yl]]), 'back', w=0.48)
            P.line(np.array([[x, yl], [x, yl + 8]]), 'mid', w=1.35, taper=1.5)

        # ---------------------------------------------------------------- the batten and the reed
        for (y0, y1) in ((598, 607), (640, 649)):
            ids = timber(P, 108, y0, 1536, y1, 1.2, 'mid', grain='h', tone=0.2, seed=y0)
            outline_box(P, ids[:3], ids[3:], w=0.9)
        # the batten's swords: hanging from the top beam at both sides, the reed between them
        for x in (112, 1524):
            ids = timber(P, x, 172, x + 9, 649, 1.4, 'back', grain='v', tone=0.2, seed=int(x))
            outline_box(P, ids[:3], ids[3:], w=0.8)
        reed = P.shape(rect(121, 607, 1524, 640), 'back', tone=0.3)
        P.hatch(reed, [np.array([[x, 606], [x, 641]]) for x in np.arange(124, 1524, 3.0)], t0=0.1, t1=0.6, w0=0.42, w1=0.55)

        # ---------------------------------------------------------------- the shuttle in the shed
        # seen from the weaver's side: a long low boat with steel tips, the pirn of weft in its slot
        sx0, sx1, sy = 196, 372, 668
        top = np.concatenate([bez((sx0 - 2, sy + 4), (sx0 + 20, sy - 6), (sx0 + 40, sy - 8), (sx0 + 60, sy - 8), 14),
                              np.array([[sx1 - 60, sy - 8]]),
                              bez((sx1 - 60, sy - 8), (sx1 - 40, sy - 8), (sx1 - 20, sy - 6), (sx1 + 2, sy + 4), 14)])
        bot = np.concatenate([bez((sx1 + 2, sy + 4), (sx1 - 16, sy + 9), (sx1 - 34, sy + 10), (sx1 - 54, sy + 10), 12),
                              np.array([[sx0 + 54, sy + 10]]),
                              bez((sx0 + 54, sy + 10), (sx0 + 34, sy + 10), (sx0 + 16, sy + 9), (sx0 - 2, sy + 4), 12)])
        body = np.concatenate([top, bot])
        g = P.nid
        sb = P.shape(body, 'front', tone=add(lin(0, sy - 8, 0, sy + 10, 0.04, 0.72), lin(sx0, 0, sx1, 0, -0.04, 0.08)), group=g)
        slot = rect(sx0 + 52, sy - 8.5, sx1 - 52, sy - 3)
        sh = P.shape(slot, 'front', tone=0.9, group=g)
        P.hatch(sb, ruled(top, bot[::-1], 7, dist='cos'), t0=0.1, t1=0.7, w0=0.42, w1=1.0)
        P.hatch(sh, parallel(0, 1.8, (sx0 + 50, sy - 9, sx1 - 50, sy - 2)), t0=0.3, t1=0.9, w0=0.45, w1=0.9)
        # the pirn's top shows above the slot: wound thread as short contour strokes
        for x in np.arange(sx0 + 60, sx1 - 60, 2.2):
            P.line(np.array([[x, sy - 11.5], [x + 0.6, sy - 8.6]]), 'front', w=0.5)
        P.line(bez((sx0 + 58, sy - 11.5), (sx0 + 70, sy - 13), (sx1 - 70, sy - 13), (sx1 - 58, sy - 11.5), 16), 'front', w=0.6)
        P.contour(top, sb, w=1.2)
        P.contour(bot, sb, w=1.7)
        P.contour(slot, sh, w=0.7, closed=True)
        P.line(np.array([[sx0 - 18, sy + 4.5], [sx0 + 2, sy + 3.5]]), 'front', w=1.8, profile=lambda t: 0.3 + 0.7 * t)
        P.line(np.array([[sx1 - 2, sy + 3.5], [sx1 + 18, sy + 4.5]]), 'front', w=1.8, profile=lambda t: 1 - 0.7 * t)
        # the weft leaves the shuttle and runs down to the fell, toward the meeting point
        weft = bez((sx1 - 66, sy - 11), (sx1 + 6, sy - 22), (404, FELL - 2), (440, FELL - 0.5), 30)
        P.line(weft, 'front', w=0.7)

        # ---------------------------------------------------------------- the cloth, the beam, the roll
        cloth = P.shape(np.array([[106, FELL], [1536, FELL], [1536, 750], [106, 750]]), 'mid',
                        tone=add(0.34, lin(0, FELL, 0, 750, -0.1, 0.14), nz(70, 0.12, 3)))
        P.hatch(cloth, [np.array([[100, y], [1540, y]]) for y in np.arange(FELL + 2.5, 750, 3.4)], t0=0.18, t1=0.62, w0=0.42, w1=0.7)
        P.hatch(cloth, parallel(-62, 7.0, (100, FELL, 1540, 750)), t0=0.3, t1=0.72, w0=0.42, w1=0.72)
        P.contour(np.array([[106, FELL], [1536, FELL]]), cloth, w=1.0, light=False)
        ids = timber(P, 100, 750, 1540, 776, 2.0, 'mid', grain='h', tone=0.1, seed=5)
        outline_box(P, ids[:3], ids[3:], w=1.1)
        roll = P.shape(rect(106, 776, 1536, 838), 'mid', tone=add(0.16, lin(0, 776, 0, 838, -0.16, 0.42)))
        P.hatch(roll, [np.array([[100, y], [1540, y]]) for y in np.arange(778, 838, 3.8)], t0=0.15, t1=0.65, w0=0.42, w1=0.95)
        P.hatch(roll, parallel(-60, 4.0, (100, 800, 1540, 838)), t0=0.5, t1=0.9, w0=0.42, w1=0.7)
        P.contour(np.array([[106, 838], [1536, 838]]), roll, w=1.4, light=False)
    else:
        # ---------------------------------------------------------------- phone master (390 x 1150)
        # the warp in a bundle on both sides of the lane line, from the harness down to the fell under
        # "Both matter."; the card chain falls down the right edge, half off the screen
        warp_clear = clear_zone(TEXT, pad=6, soft=10)
        wsid = P.shape(rect(0, 120, W, FELL + 1), 'back', tone=add(0.34, lin(0, 120, 0, FELL, -0.12, 0.12)))
        warp = [np.array([[x, 150], [x, FELL]]) for x in (3, 8, 13, 26, 32, 38)]
        warp += [np.array([[x, 260], [x, FELL]]) for x in np.arange(46, 330, 14.0)]
        P.hatch(wsid, warp, t0=0.05, t1=0.5, w0=0.42, w1=0.62, mask=lambda X, Y: warp_clear(X, Y) * fade(X, Y))
        # harness cords from above the title, fanning into the bundle
        for k, x in enumerate((3, 8, 13, 26, 32, 38)):
            P.line(np.array([[150 + k * 18, 40], [x, 150]]), 'back', w=0.45)
        holes = random.Random(7)
        H0, hw = 17.0, 38.0
        y, i = 96.0, 0
        while y < FELL + 30:
            a = 0.98 if i % 2 else 1.18
            h = H0 * math.cos(a) + 2.0
            x = 384 + 6 * math.sin(y / 160)
            lit = i % 2 == 0
            poly = rect(x - hw, y, x + hw, y + h)
            s_ = P.shape(poly, 'mid', tone=add(0.06 if lit else 0.46, lin(x - hw, 0, x + hw, 0, -0.04, 0.12)))
            P.hatch(s_, [np.array([[x - hw - 2, v], [x + hw + 2, v]]) for v in np.arange(y + 1.3, y + h, 2.4)], t0=0.2, t1=0.65, w0=0.4, w1=0.8)
            P.contour(poly, s_, w=0.8, closed=True)
            if lit:
                for k in range(-7, 1):
                    if holes.random() < 0.45:
                        P.dot(x + k * 4.8, y + h * 0.5, 'mid', r=0.8)
            y += h; i += 1
        P.line(np.array([[384 - hw + 6 + 6 * math.sin(v / 160), v] for v in np.arange(96, FELL + 30, 4)]), 'mid', w=0.5)
        # the reed above the fell, the cloth below it
        reed = P.shape(rect(0, FELL - 44, W, FELL - 12), 'back', tone=0.3)
        P.hatch(reed, [np.array([[x, FELL - 45], [x, FELL - 11]]) for x in np.arange(1, W, 3.0)], t0=0.1, t1=0.6, w0=0.42, w1=0.55)
        cloth = P.shape(rect(0, FELL, W, FELL + 58), 'mid', tone=add(0.34, lin(0, FELL, 0, FELL + 58, -0.1, 0.16), nz(50, 0.1, 5)))
        P.hatch(cloth, [np.array([[0, y], [W, y]]) for y in np.arange(FELL + 2.5, FELL + 58, 3.4)], t0=0.18, t1=0.62, w0=0.42, w1=0.7)
        P.hatch(cloth, parallel(-62, 7.0, (0, FELL, W, FELL + 58)), t0=0.3, t1=0.72, w0=0.42, w1=0.72)
        P.contour(np.array([[0, FELL], [W, FELL]]), cloth, w=1.0, light=False)

    P.bake()
    P.engrave(step=1.2, mask=M)
    return P


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    P = build(1600, 1100, True)
    svg = P.svg({'back': 0.065, 'mid': 0.085, 'front': 0.09}, ink='#e8e3dd', q=4)
    open(f'{out}/loom.svg', 'w').write(svg)
    Q = build(390, 1150, False)
    open(f'{out}/loom-phone.svg', 'w').write(Q.svg({'back': 0.065, 'mid': 0.085, 'front': 0.09}, ink='#e8e3dd', q=4))
    print(len(svg), 'bytes desktop')
