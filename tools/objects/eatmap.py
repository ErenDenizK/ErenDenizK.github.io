"""Eat Map: a rose glass map pin above a small ceramic plate (SPEC "Objects").
Parts (root "eatmap"): pin (rose glass, a hole through its head), plate (glazed ceramic).
The pin drops onto the plate on hover; animate pin's position only.
Run: <venv>/bin/python tools/objects/eatmap.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#eb4f6b"  # rose: the app's own accent (selected tab, compose button), sampled from
#                    a simulator photo; redder and more saturated than English Prep's sakura

args = C.parse_args()
C.reset()
rose = C.glass("glass_rose", "#ff94b0", transmission=0.8, rough=0.08, ior=1.5, coat=0.8,
                thickness=0.36)
glaze = C.ceramic("ceramic_plate", "#f3ebe7", rough=0.22, coat=0.8)

# Pin: a teardrop outline (circle + tangent lines to the tip) with a round hole.
r, cy, tip_y = 0.56, 0.0, -1.02
d = cy - tip_y
alpha = math.degrees(math.acos(r / d))
a_right, a_left = -90 + alpha, -90 - alpha + 360
outer = [(0.0, tip_y)] + C.arc(0, cy, r, a_right, a_left, step_deg=4)
outer = C.fillet(outer, [0.2] + [0] * (len(outer) - 1))
hole = list(reversed(C.arc(0, cy, 0.22, 0, 360, step_deg=6)[:-1]))
pin = C.outline_solid("pin", [outer, hole], 0.38, 0.13, bevel_res=6, mat=rose)
pin.rotation_euler = (math.radians(90), 0, math.radians(-22))
pin.location.z = 1.02 + 0.32

# Plate: a lathe profile (radius, height), smoothed.
prof = [(0.0, 0.03), (0.4, 0.03), (0.44, 0.0), (0.5, 0.0), (0.53, 0.02), (0.72, 0.075),
        (0.84, 0.12), (0.86, 0.135), (0.845, 0.145), (0.8, 0.135), (0.6, 0.075), (0.5, 0.055),
        (0.0, 0.055)]


def catmull(pts, n=6):
    out = []
    for i in range(len(pts) - 1):
        p0 = pts[max(i - 1, 0)]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[min(i + 2, len(pts) - 1)]
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t
                                    + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3)
                             for j in range(2)))
    out.append(pts[-1])
    return out


smooth = catmull(prof)
smooth[0] = (0.0, smooth[0][1])
smooth[-1] = (0.0, smooth[-1][1])
# lathe expects the profile from the bottom centre around to the top centre
plate = C.lathe("plate", smooth, segments=72, mat=glaze, smooth_angle=60)
plate.scale = (1.05, 1.05, 1.05)

parts = [pin, plate]
root = C.empty("eatmap", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(-8))
C.finish("eatmap", root, ACCENT, args, size=2.05, lift=0.0)
