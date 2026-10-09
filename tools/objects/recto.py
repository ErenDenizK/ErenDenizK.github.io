"""Recto: a glass page stack with a folded corner and a metal paper clip (SPEC "Objects").
Parts (root "recto"): page_1 (front, clear glass), page_2, page_3 (frosted, behind),
fold (the folded corner, lime glass), lines (text bars on page_1, white enamel),
title (the lime title bar), clip (steel wire). Pages fan out around the clip on hover.
Run: <venv>/bin/python tools/objects/recto.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#bbed26"
W, H, FOLD = 1.5, 1.95, 0.40  # page size and the folded corner's leg
T = 0.06                       # page thickness
GAP = 0.085                    # page pitch in the stack
CLIP_X = -0.38                 # the clip sits on the top edge, left of centre

args = C.parse_args()
C.reset()
clear = C.glass("glass_clear", "#f4f7f2", transmission=1.0, rough=0.035, ior=1.5, coat=0.4,
                thickness=T)
frost = C.glass("glass_frost", "#e9eee6", transmission=0.85, rough=0.32, ior=1.5,
                thickness=T)
lime = C.glass("glass_lime", ACCENT, transmission=0.55, rough=0.18, ior=1.5, coat=0.6,
               thickness=0.04)
enamel = C.ceramic("enamel_white", "#eceae4", rough=0.3, coat=0.5)
lime_enamel = C.ceramic("enamel_lime", ACCENT, rough=0.3, coat=0.6)
steel = C.metal("steel", "#e3e5e8", rough=0.14)


def page_outline():
    x0, x1, y0, y1 = -W / 2, W / 2, -H / 2, H / 2
    poly = [(x0, y0), (x1, y0), (x1, y1 - FOLD), (x1 - FOLD, y1), (x0, y1)]
    return C.fillet(poly, [0.07, 0.07, 0.02, 0.02, 0.07])


pages = []
for i in range(3):
    pg = C.outline_solid(f"page_{i + 1}", [page_outline()], T, 0.018, bevel_res=4,
                         mat=clear if i == 0 else frost, z=-i * GAP)
    # fan slightly around the clip so the stack reads at rest
    pg.rotation_euler.z = math.radians(-3.5 * i)
    pivot = C.Vector((CLIP_X, H / 2, 0))
    off = pg.location - pivot
    off.rotate(pg.rotation_euler)
    pg.location = pivot + off
    pages.append(pg)

# The folded corner: a triangle lying on page_1, its long edge on the cut.
tri = [(W / 2 - FOLD, H / 2), (W / 2 - FOLD, H / 2 - FOLD), (W / 2, H / 2 - FOLD)]
fold = C.outline_solid("fold", [C.fillet(tri, [0.015, 0.05, 0.015])], 0.035, 0.012,
                       bevel_res=3, mat=lime, z=T / 2 + 0.0175 + 0.001)

# Text bars on page_1: they sit on the surface, never inside the glass.
bar_t = 0.026
z_bar = T / 2 + bar_t / 2 + 0.0015
bars = []
rows = [(0.62, True), (0.98, False), (0.86, False), (0.98, False), (0.7, False), (0.5, False)]
for i, (frac, is_title) in enumerate(rows):
    length = (W - 0.36) * frac
    hgt = 0.1 if is_title else 0.055
    y = H / 2 - 0.74 - (0 if is_title else 0.06 + i * 0.17)
    x = -W / 2 + 0.18 + length / 2
    b = C.outline_solid(f"bar_{i}", [C.rounded_rect(length, hgt, hgt / 2, x, y, step_deg=15)],
                        bar_t, 0.01, bevel_res=2, mat=lime_enamel if is_title else enamel,
                        z=z_bar)
    bars.append(b)
title = bars[0]
title.name = "title"
lines = bars[1:]
for o in lines:
    o.select_set(True)
C.bpy.context.view_layer.objects.active = lines[0]
for o in C.bpy.context.view_layer.objects:
    o.select_set(o in lines)
C.bpy.ops.object.join()
lines = C.bpy.context.view_layer.objects.active
lines.name = "lines"

# Paper clip: straight legs and true arcs, front legs on page_1, the outer loop passing over
# the top edge to the back of the stack.
R = 0.017
z_front = T / 2 + R + 0.002
z_back = -2 * GAP - T / 2 - R - 0.002
edge = H / 2 - 0.03  # where the wire crosses the stack's top edge (pages are fanned)


def seg(p, q, n=2):
    return [(p[0] + (q[0] - p[0]) * t / (n - 1), p[1] + (q[1] - p[1]) * t / (n - 1)) for t in range(n)]


top_y = edge + 0.08
path = []
path += seg((0.065, top_y - 0.62), (0.065, top_y - 0.2))
path += C.arc(0.0, top_y - 0.2, 0.065, 0, 180, step_deg=10)[1:]
path += seg((-0.065, top_y - 0.2), (-0.065, top_y - 0.86))[1:]
path += C.arc(0.03, top_y - 0.86, 0.095, 180, 360, step_deg=10)[1:]
path += seg((0.125, top_y - 0.86), (0.125, top_y - 0.125), 6)[1:]
big = C.arc(0.0, top_y - 0.125, 0.125, 0, 180, step_deg=7.5)[1:]
path += big
path += seg((-0.125, top_y - 0.125), (-0.125, top_y - 0.74), 6)[1:]
CS = 0.62  # clip scale: about a third of the page height
pts3 = [[CLIP_X + x * CS, top_y + (y - top_y) * CS, 0.0] for (x, y) in path]
# z: on the front until the big arc clears the top edge, over it, then down the back
i0 = len(path) - len(big) - 5
i1 = i0 + len(big)
for k, p in enumerate(pts3):
    u = min(max((k - i0) / (i1 - i0), 0.0), 1.0)
    t = min(max((u - 0.3) / 0.4, 0.0), 1.0)
    s = t * t * (3 - 2 * t)
    p[2] = z_front * (1 - s) + z_back * s
clip = C.tube("clip", [tuple(p) for p in pts3], R, mat=steel, res=5)

parts = pages + [fold, title, lines, clip]
root = C.empty("recto", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (math.radians(78), math.radians(4), math.radians(-20))
C.finish("recto", root, ACCENT, args, size=2.15, lift=0.12)
