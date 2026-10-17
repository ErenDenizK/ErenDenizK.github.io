"""The Record's plate (guide §2.7, review row S27): where the tape comes from.

An exploded tape transport in the manner of the Encyclopédie: the supply reel's flange stands large
behind the recorder object (its turned face in concentric ruling, the wound tape seen through its
three windows: the round-five rings, now engraved); the take-up spool is lifted out to the right; the
head and its two guide posts float to the upper left; and the capstan with its pinch roller stands
where the strip's tape turns down. The tape passes between them and becomes the spine: the record
moves forward because something pulls it.

The tape itself is the page's own element (rs-tape), never part of the drawing. Nothing crosses the
object's glass: a clear circle is cut round it. Layers: back (the flange and the spool, .06) and
mid (the mechanism, .09).

Desktop: 1440 x 900, band x = page x at 1440 (centred), band y = strip y + 260.
Phone: 390 x 720, band x = page x, band y = strip y + 260.
Usage: python3 record.py <out-dir>
"""
import math
import random
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from burin import (Plate, parallel, ruled, rect, arc, bez, lin, radial, add, nz, edge_fade, clear_zone,
                   concentric, resample)

LIGHT = np.array([-0.766, -0.643])


def circle(c, r, n=None):
    return arc(c, r, 0, 2 * math.pi, n or max(48, int(r * 1.2)))


def ellipse(c, a, b, rot, n=96, t0=0.0, t1=2 * math.pi):
    return arc(c, a, t0, t1, n, ry=b, rot=rot)


def flange(P, c, r, layer, depth, windows=3, w_in=0.6, w_out=0.92, hub=0.13, pack=0.82, rot0=-0.35, seed=0):
    """A reel's flange seen face on with its rim (the oblique sends depth up and right): a turned face in
    concentric ruling, three windows onto the wound tape, a keyed hub."""
    d = np.array([0.8, -0.6]) * depth
    g = P.nid
    cb = (c[0] + d[0], c[1] + d[1])
    rim = P.shape(circle(cb, r), layer, tone=add(0.55, lin(cb[0] - r, cb[1] - r, cb[0] + r, cb[1] + r, -0.3, 0.25)), group=g)
    face = P.shape(circle(c, r), layer, tone=add(0.05, lin(c[0] - r, c[1] - r, c[0] + r, c[1] + r, -0.12, 0.42)), group=g)
    wins = []
    for k in range(windows):
        a0 = rot0 + k * 2 * math.pi / windows
        a1 = a0 + 2 * math.pi / windows * 0.62
        outer = arc(c, r * w_out, a0, a1, 40)
        inner = arc(c, r * w_in, a1, a0, 30)
        poly = np.concatenate([outer, inner])
        wins.append(P.shape(poly, layer, tone=0.0, group=g))
    # the wound tape behind the windows: a pack of fine rings, darker toward the hub (light falls in
    # through the upper-left of each window)
    packs = []
    for k in range(windows):
        a0 = rot0 + k * 2 * math.pi / windows + 0.02
        a1 = a0 + 2 * math.pi / windows * 0.62 - 0.04
        outer = arc(c, r * min(pack, w_out - 0.02), a0, a1, 40)
        inner = arc(c, r * (w_in + 0.01), a1, a0, 30)
        poly = np.concatenate([outer, inner])
        sp = P.shape(poly, layer, tone=add(0.35, radial(c[0], c[1], r, 0.25, -0.2), lin(c[0] - r, c[1] - r, c[0] + r, c[1] + r, -0.1, 0.25)), group=g)
        P.hatch(sp, concentric(c, r * w_in, r * pack, 3.2), t0=0.1, t1=0.55, w0=0.42, w1=0.75)
        packs.append(sp)
    hb = P.shape(circle(c, r * hub), layer, tone=add(0.35, lin(c[0] - r * hub, c[1] - r * hub, c[0] + r * hub, c[1] + r * hub, -0.25, 0.5)), group=g)
    bore = P.shape(circle(c, r * hub * 0.42), layer, tone=0.9, group=g)
    # hatching: the rim in rings along the depth (contour hatching on the edge), the face turned
    P.hatch(rim, [circle((c[0] + d[0] * t, c[1] + d[1] * t), r) for t in np.linspace(0.15, 1, max(3, int(depth / 2.6)))], t0=0.15, t1=0.65, w0=0.42, w1=1.0)
    P.hatch(face, concentric(c, r * hub, r, 5.0), t0=0.12, t1=0.55, w0=0.42, w1=0.8)
    P.hatch(face, parallel(-50, 5.6, (c[0] - r, c[1] - r, c[0] + r, c[1] + r)), t0=0.36, t1=0.7, w0=0.42, w1=0.7)
    P.hatch(hb, concentric(c, r * hub * 0.42, r * hub, 2.6), t0=0.15, t1=0.7, w0=0.42, w1=0.85)
    P.hatch(bore, parallel(45, 2.6, (c[0] - r * hub, c[1] - r * hub, c[0] + r * hub, c[1] + r * hub)), t0=0.3, t1=0.9, w0=0.45, w1=0.9)
    P.hatch(bore, parallel(-45, 3.0, (c[0] - r * hub, c[1] - r * hub, c[0] + r * hub, c[1] + r * hub)), t0=0.6, t1=1.0, w0=0.42, w1=0.8)
    P.contour(circle(c, r), face, w=1.3)
    P.contour(circle(cb, r), rim, w=1.4)
    P.contour(circle(c, r * hub), hb, w=1.0)
    P.contour(circle(c, r * hub * 0.42), bore, w=0.9)
    for k in range(windows):
        a0 = rot0 + k * 2 * math.pi / windows
        a1 = a0 + 2 * math.pi / windows * 0.62
        P.contour(np.concatenate([arc(c, r * w_out, a0, a1, 40), arc(c, r * w_in, a1, a0, 30)]), wins[k], w=1.1, closed=True)
        # the window's far wall, the thickness of the flange: a thin bright edge on its lower right
        P.line(arc((c[0] + d[0] * 0.6, c[1] + d[1] * 0.6), r * w_in, a0 + 0.04, a1 - 0.04, 30), layer, w=0.6, sid=wins[k])
    # three key notches in the hub
    for k in range(3):
        a = k * 2 * math.pi / 3 + 0.4
        p0 = np.array(c) + np.array([math.cos(a), math.sin(a)]) * r * hub * 0.42
        p1 = np.array(c) + np.array([math.cos(a), math.sin(a)]) * r * hub * 0.62
        P.line(np.stack([p0, p1]), layer, w=1.1)
    return face


def cylinder_v(P, x, y0, y1, r, layer, k=0.3, tone=0.12, metal=True, group=None):
    """An upright cylinder in a slight view from above: an elliptical top, contour hatching that packs
    toward the shadow side (the right)."""
    g = P.nid if group is None else group
    top = ellipse((x, y0), r, r * k, 0, 48)
    bot = ellipse((x, y1), r, r * k, 0, 48, 0, math.pi)
    body = np.concatenate([np.array([[x - r, y0]]), np.array([[x - r, y1]]), bot[::-1][::-1], np.array([[x + r, y1]]), np.array([[x + r, y0]])])
    body = np.concatenate([[[x - r, y0]], ellipse((x, y1), r, r * k, 0, 48, math.pi, 0), [[x + r, y0]]])
    sb = P.shape(body, layer, tone=lambda X, Y: np.clip(tone + 0.75 * ((X - (x - r * 0.35)) / (r * 1.35)) ** 2 * (X > x - r * 0.35), 0, 1), group=g)
    st = P.shape(top, layer, tone=0.04, group=g)
    # generators: vertical lines packed toward both edges (the turn of the form)
    lines = []
    n = max(4, int(r / 1.4))
    for i in range(n + 1):
        s = (1 - math.cos(math.pi * i / n)) / 2
        xx = x - r + 2 * r * s
        lines.append(np.array([[xx, y0 - r], [xx, y1 + r]]))
    P.hatch(sb, lines, t0=0.12, t1=0.7, w0=0.42, w1=1.0 if metal else 0.8)
    P.contour(np.array([[x - r, y0], [x - r, y1]]), sb, w=0.9)
    P.contour(np.array([[x + r, y0], [x + r, y1]]), sb, w=1.5)
    P.contour(ellipse((x, y1), r, r * k, 0, 48, 0, math.pi), sb, w=1.3)
    P.contour(top, st, w=0.9, closed=True)
    return sb, st


def disc_h(P, c, rx, k, th, layer, tone=0.05, rings=True):
    """A horizontal disc (a flywheel) seen from a little above: its top face and its rim."""
    g = P.nid
    x, y = c
    rim_poly = np.concatenate([ellipse((x, y), rx, rx * k, 0, 60, math.pi, 0)[::-1] if False else ellipse((x, y), rx, rx * k, 0, 60, 0, math.pi),
                               ellipse((x, y + th), rx, rx * k, 0, 60, math.pi, 0)])
    rim_poly = np.concatenate([[[x + rx, y]], ellipse((x, y + th), rx, rx * k, 0, 60, 0, math.pi), [[x - rx, y]]])
    sr = P.shape(rim_poly, layer, tone=lambda X, Y: np.clip(0.3 + 0.5 * (X - x) / rx, 0, 1), group=g)
    top = ellipse((x, y), rx, rx * k, 0, 80)
    stp = P.shape(top, layer, tone=add(tone, lin(x - rx, y, x + rx, y, -0.05, 0.3)), group=g)
    P.hatch(sr, [np.array([[xx, y - 4], [xx, y + th + rx * k + 4]]) for xx in np.arange(x - rx, x + rx, 2.8)], t0=0.15, t1=0.7, w0=0.42, w1=0.9)
    if rings:
        P.hatch(stp, [ellipse((x, y), rr, rr * k, 0, 80) for rr in np.arange(4, rx, 4.0)], t0=0.1, t1=0.5, w0=0.42, w1=0.7)
    P.contour(top, stp, w=1.1, closed=True)
    P.contour(ellipse((x, y + th), rx, rx * k, 0, 60, 0, math.pi), sr, w=1.5)
    P.contour(np.array([[x - rx, y], [x - rx, y + th]]), sr, w=0.9)
    P.contour(np.array([[x + rx, y], [x + rx, y + th]]), sr, w=1.4)
    return stp


def spool(P, c, r, L, layer, u=(0.62, -0.78), k=0.36, pack_r=0.78, seed=0):
    """The take-up spool lifted out of the machine: two flanges on an axis, the wound tape between them,
    seen three-quarter (the axis runs up and right, away from the eye)."""
    u = np.array(u) / np.linalg.norm(u)
    n = np.array([-u[1], u[0]])
    rot = math.atan2(n[1], n[0])
    c0 = np.array(c, float); c1 = c0 + u * L
    g = P.nid
    # far flange first
    far = ellipse(c1, r, r * k, rot, 90)
    s_far = P.shape(far, layer, tone=add(0.42, lin(c1[0] - r, c1[1] - r, c1[0] + r, c1[1] + r, -0.25, 0.3)), group=g)
    P.hatch(s_far, [ellipse(c1, rr, rr * k, rot, 90) for rr in np.arange(r * 0.15, r, 3.2)], t0=0.15, t1=0.65, w0=0.42, w1=0.8)
    # the pack: a cylinder between the flanges
    rp = r * pack_r
    side_a = np.stack([c0 + n * rp, c1 + n * rp]); side_b = np.stack([c1 - n * rp, c0 - n * rp])
    body = np.concatenate([side_a, ellipse(c1, rp, rp * k, rot, 40, 0, math.pi), side_b, ellipse(c0, rp, rp * k, rot, 40, math.pi, 2 * math.pi)])
    s_pack = P.shape(body, layer, tone=lambda X, Y: np.clip(0.18 + 0.6 * (((X - c0[0]) * n[0] + (Y - c0[1]) * n[1]) / rp * -1 + 1) / 2, 0, 1), group=g)
    # contour hatching along the pack: lines parallel to the axis, packed toward the edges
    lines = []
    for i in range(22):
        s = (1 - math.cos(math.pi * i / 21)) / 2
        o = -rp + 2 * rp * s
        lines.append(np.stack([c0 + n * o - u * 8, c1 + n * o + u * 8]))
    P.hatch(s_pack, lines, t0=0.12, t1=0.7, w0=0.42, w1=0.9)
    P.hatch(s_pack, [ellipse(c0 + u * t, rp, rp * k, rot, 40, 0, math.pi) for t in np.arange(4, L, 3.4)], t0=0.5, t1=0.85, w0=0.42, w1=0.7)
    P.contour(side_a, s_pack, w=1.1)
    P.contour(side_b, s_pack, w=1.1)
    # near flange: the face toward the eye, with its windows and hub
    near = ellipse(c0, r, r * k, rot, 100)
    s_near = P.shape(near, layer, tone=add(0.04, lin(c0[0] - r, c0[1] - r * k, c0[0] + r, c0[1] + r * k, -0.08, 0.4)), group=g)
    P.hatch(s_near, [ellipse(c0, rr, rr * k, rot, 100) for rr in np.arange(r * 0.16, r, 3.8)], t0=0.12, t1=0.55, w0=0.42, w1=0.75)
    for kk in range(3):
        a0 = kk * 2 * math.pi / 3 + 0.5
        a1 = a0 + 2 * math.pi / 3 * 0.6
        win = np.concatenate([ellipse(c0, r * 0.88, r * 0.88 * k, rot, 30, a0, a1), ellipse(c0, r * 0.4, r * 0.4 * k, rot, 20, a1, a0)])
        sw = P.shape(win, layer, tone=0.62, group=g)
        P.hatch(sw, [ellipse(c0 + u * 6, rr, rr * k, rot, 60) for rr in np.arange(r * 0.4, r * pack_r, 2.6)], t0=0.2, t1=0.7, w0=0.42, w1=0.75)
        P.contour(win, sw, w=0.9, closed=True)
    hub = ellipse(c0, r * 0.14, r * 0.14 * k, rot, 30)
    sh = P.shape(hub, layer, tone=0.85, group=g)
    P.hatch(sh, parallel(45, 2.4, (c0[0] - r * 0.2, c0[1] - r * 0.1, c0[0] + r * 0.2, c0[1] + r * 0.1)), t0=0.3, t1=0.9, w0=0.42, w1=0.8)
    P.contour(hub, sh, w=0.9, closed=True)
    P.contour(near, s_near, w=1.3, closed=True)
    P.contour(far, s_far, w=1.0, closed=True)
    return s_near


def head(P, c, layer, s=1.0):
    """The record/play head: a rounded-front block on a mounting plate, laminations in section."""
    x, y = c
    g = P.nid
    # mounting plate (oblique)
    d = np.array([10, -7]) * s
    pw, ph = 96 * s, 12 * s
    plate_front = rect(x - pw / 2, y + 30 * s, x + pw / 2, y + 30 * s + ph)
    plate_top = np.array([[x - pw / 2, y + 30 * s], [x + pw / 2, y + 30 * s], [x + pw / 2 + d[0], y + 30 * s + d[1]], [x - pw / 2 + d[0], y + 30 * s + d[1]]])
    plate_side = np.array([[x + pw / 2, y + 30 * s], [x + pw / 2 + d[0], y + 30 * s + d[1]], [x + pw / 2 + d[0], y + 30 * s + ph + d[1]], [x + pw / 2, y + 30 * s + ph]])
    s_ps = P.shape(plate_side, layer, tone=0.7, group=g)
    s_pt = P.shape(plate_top, layer, tone=0.06, group=g)
    s_pf = P.shape(plate_front, layer, tone=add(0.2, lin(x - pw / 2, 0, x + pw / 2, 0, -0.1, 0.25)), group=g)
    P.hatch(s_pf, [np.array([[x - pw, yy], [x + pw, yy]]) for yy in np.arange(y + 30 * s + 2, y + 30 * s + ph, 2.8)], t0=0.1, t1=0.5, w0=0.42, w1=0.8)
    P.hatch(s_ps, parallel(90, 2.6, (x + pw / 2, y, x + pw / 2 + d[0], y + 60 * s)), t0=0.3, t1=0.8, w0=0.42, w1=0.85)
    for poly, sid, w in ((plate_front, s_pf, 1.1), (plate_top, s_pt, 0.8), (plate_side, s_ps, 1.2)):
        P.contour(poly, sid, w=w, closed=True)
    # the head block: front face with a rounded profile (shown as its section on the right side)
    hw, hh = 34 * s, 40 * s
    fr = rect(x - hw / 2, y - hh / 2 + 6 * s, x + hw / 2, y + 30 * s)
    sd = np.array([[x + hw / 2, y - hh / 2 + 6 * s], [x + hw / 2 + d[0], y - hh / 2 + 6 * s + d[1]], [x + hw / 2 + d[0], y + 30 * s + d[1]], [x + hw / 2, y + 30 * s]])
    tp = np.array([[x - hw / 2, y - hh / 2 + 6 * s], [x + hw / 2, y - hh / 2 + 6 * s], [x + hw / 2 + d[0], y - hh / 2 + 6 * s + d[1]], [x - hw / 2 + d[0], y - hh / 2 + 6 * s + d[1]]])
    s_sd = P.shape(sd, layer, tone=0.6, group=g)
    s_tp = P.shape(tp, layer, tone=0.05, group=g)
    s_fr = P.shape(fr, layer, tone=lambda X, Y: np.clip(0.06 + 0.7 * (np.abs(X - x) / (hw / 2)) ** 2, 0, 1), group=g)
    # the front's curvature: vertical lines packed toward both edges (it is a curved face)
    lines = []
    for i in range(13):
        sx = (1 - math.cos(math.pi * i / 12)) / 2
        xx = x - hw / 2 + hw * sx
        lines.append(np.array([[xx, y - hh], [xx, y + 40 * s]]))
    P.hatch(s_fr, lines, t0=0.1, t1=0.7, w0=0.42, w1=0.9)
    # laminations on the side: the core's stack in section (fine, tight, at 45 degrees and horizontal)
    P.hatch(s_sd, [np.array([[x + hw / 2 - 2, yy], [x + hw / 2 + d[0] + 2, yy + d[1]]]) for yy in np.arange(y - hh / 2 + 4 * s, y + 34 * s, 2.6)], t0=0.2, t1=0.7, w0=0.42, w1=0.8)
    for poly, sid, w in ((fr, s_fr, 1.2), (tp, s_tp, 0.8), (sd, s_sd, 1.3)):
        P.contour(poly, sid, w=w, closed=True)
    # the gap: one fine bright line down the middle of the face
    P.line(np.array([[x, y - hh / 2 + 7 * s], [x, y + 29 * s]]), layer, w=1.0)
    # screws in the plate: a disc with a slot
    for sx in (x - pw / 2 + 12 * s, x + pw / 2 - 12 * s):
        sc = (sx, y + 30 * s + ph / 2)
        ss = P.shape(circle(sc, 4.2 * s, 24), layer, tone=0.3, group=g)
        P.hatch(ss, concentric(sc, 1, 4.2 * s, 1.6), t0=0.1, t1=0.6, w0=0.4, w1=0.6)
        P.contour(circle(sc, 4.2 * s, 24), ss, w=0.8, closed=True)
        P.line(np.array([[sc[0] - 3.4 * s, sc[1] + 1.2 * s], [sc[0] + 3.4 * s, sc[1] - 1.2 * s]]), layer, w=0.9)


def build(W, H, desktop=True, seed=5):
    P = Plate(W, H, res=2, seed=seed)
    for L in ('flange', 'takeup', 'mech'):
        P.layer(L)
    if desktop:
        # object (glass) clear circle, and the text's boxes (band coordinates)
        GLASS = (720, 410, 176)
        TEXT = [(624, 629, 816, 689), (473, 706, 967, 757), (240, 789, 1020, 855), (300, 865, 1000, 900)]
        SPINE = (322, 605)
        REEL = (682.5, 419)
        R_BIG = 285
    else:
        GLASS = (286, 348, 104)
        TEXT = [(44, 474, 250, 519), (38, 539, 374, 587), (38, 603, 374, 696)]
        SPINE = (27, 456)
        REEL = (264, 353)
        R_BIG = 190
    gx, gy, gr = GLASS
    clear = clear_zone(TEXT, pad=16, soft=36)

    def glass(X, Y):
        return np.clip((np.hypot(X - gx, Y - gy) - gr) / 26, 0, 1)

    def spine(X, Y):
        # the spine (the page's tape) runs down from SPINE: keep 12 px either side clear below the nip
        d = np.abs(X - SPINE[0])
        return np.where(Y > SPINE[1] + 90, np.clip((d - 10) / 14, 0, 1), 1.0)

    fade = edge_fade(H, top=0.0, bottom=0.2)

    def low(X, Y):
        # the big flange thins out below the object, so it never stands as a heavy ring over the head
        v = np.clip((H * 0.82 - Y) / (H * 0.22), 0, 1) ** 1.2
        return np.where(np.hypot(X - REEL[0], Y - REEL[1]) < R_BIG + 14, v, 1.0)

    def M(X, Y):
        return clear(X, Y) * glass(X, Y) * fade(X, Y) * spine(X, Y)

    # the flange turns with the scroll, so its clear zones (the glass, the text below) are CSS masks on a
    # wrapper that does not turn; the drawing itself is whole

    if desktop:
        # back: the supply reel's flange, behind the object; the take-up spool lifted out to the right
        flange(P, REEL, 285, 'flange', depth=10, w_in=0.6, w_out=0.93, pack=0.86, rot0=-1.15)
        # the take-up reel, lifted out to the right: smaller, its windows turned a third further
        flange(P, (1096, 318), 118, 'takeup', depth=7, w_in=0.42, w_out=0.9, pack=0.55, rot0=-0.2, hub=0.16)
        # mid: the head with its guide posts (upper left), the capstan and the pinch roller at the nip
        head(P, (290, 300), 'mech', s=1.15)
        for gxp in (212, 372):
            cylinder_v(P, gxp, 300, 352, 6.5, 'mech', k=0.32)
            disc_h(P, (gxp, 298), 13, 0.32, 3, 'mech')
            disc_h(P, (gxp, 352), 13, 0.32, 3, 'mech')
        # the capstan: a steel shaft on its flywheel; the pinch roller beside it, on its arm
        nx, ny = SPINE
        cylinder_v(P, nx - 6.5, ny - 48, ny + 52, 4.5, 'mech', k=0.3)
        disc_h(P, (nx - 6.5, ny + 58), 54, 0.28, 11, 'mech')
        cylinder_v(P, nx + 17, ny - 34, ny + 34, 15, 'mech', k=0.3, tone=0.22, metal=False)
        disc_h(P, (nx + 17, ny - 36), 6, 0.3, 4, 'mech', rings=False)
        # the roller's arm: a flat lever from its axle out to the right, with a spring
        arm = np.array([[nx + 17, ny - 46], [nx + 118, ny - 70], [nx + 121, ny - 60], [nx + 19, ny - 37]])
        sa = P.shape(arm, 'mech', tone=0.32)
        P.hatch(sa, [np.array([[nx + 17, ny - 46 + t], [nx + 118, ny - 70 + t]]) for t in np.arange(0, 10, 2.4)], t0=0.15, t1=0.6, w0=0.42, w1=0.8)
        P.contour(arm, sa, w=1.0, closed=True)
        coil = np.array([[nx + 118 + 2.2 * math.sin(t * 2.2), ny - 64 + t * 1.5] for t in np.arange(0, 30, 0.25)])
        P.line(coil, 'mech', w=0.6, step=0.5)
    else:
        flange(P, REEL, 190, 'flange', depth=8, w_in=0.6, w_out=0.93, pack=0.86, rot0=-1.15)
        flange(P, (86, 150), 58, 'takeup', depth=5, w_in=0.42, w_out=0.9, pack=0.55, rot0=-0.2, hub=0.16)
        nx, ny = SPINE
        cylinder_v(P, nx - 5.5, ny - 56, ny + 30, 3.4, 'mech', k=0.3)
        cylinder_v(P, nx + 11, ny - 44, ny + 8, 8, 'mech', k=0.3, tone=0.22, metal=False)
        head(P, (226, 196), 'mech', s=0.8)
    P.bake()
    P.engrave(step=1.1, mask={'flange': None, '*': M})
    return P


ALPHA = {'flange': 0.06, 'takeup': 0.065, 'mech': 0.09}
INK = '#a8c4f5'   # the Record's blue mixed into the ink (72 / 28)


def write(P, out, suffix):
    info = {}
    for L in ('flange', 'takeup', 'mech'):
        bb = P.layer_bbox(L)
        svg = P.svg({L: ALPHA[L]}, ink=INK, q=4, crop=bb)
        open(f'{out}/record-{L}{suffix}.svg', 'w').write(svg)
        info[L] = (bb, len(svg))
    return info


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    print(write(build(1440, 900, True), out, ''))
    print(write(build(390, 720, False), out, '-phone'))
