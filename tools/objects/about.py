"""About: a pair of round glasses; the owner wears round ones (SPEC "Objects").
Parts (root "about"): rim_left, rim_right (round gold wire frames), bridge, temple_left,
temple_right (arms, open), lens_left, lens_right (glass). A light flare can sweep the lenses.
Run: <venv>/bin/python tools/objects/about.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#f3b886"  # warm peach for About (placeholder until the owner picks one)
RL, CX, WIRE = 0.4, 0.5, 0.032  # lens radius, lens centre offset, wire radius

args = C.parse_args()
C.reset()
gold = C.metal("gold", "#dcb46e", rough=0.17)
lens_glass = C.glass("glass_lens", "#f5f1ea", transmission=1.0, rough=0.02, ior=1.5, coat=0.0,
                     thickness=0.045)


def ring(cx):
    return [(cx + RL * math.cos(math.radians(a)), 0.0, RL * math.sin(math.radians(a)))
            for a in range(0, 360, 5)]


rim_l = C.tube("rim_left", ring(-CX), WIRE, gold, res=5, closed=True)
rim_r = C.tube("rim_right", ring(CX), WIRE, gold, res=5, closed=True)

# keyhole bridge through three points on the inner tops of the rims
zc, rb = 0.0919, 0.188
bridge_pts = [(rb * math.cos(math.radians(a)), 0.0, zc + rb * math.sin(math.radians(a)))
              for a in range(35, 146, 5)]
bridge = C.tube("bridge", bridge_pts, WIRE * 0.85, gold, res=5)


def temple(side):
    x = side * (CX + RL)
    pts = [(x, 0.0, 0.06), (x + side * 0.04, 0.05, 0.065), (x + side * 0.06, 0.16, 0.065)]
    pts += [(x + side * (0.06 + 0.02 * t / 10), 0.16 + 1.05 * t / 10, 0.065 - 0.02 * t / 10)
            for t in range(1, 11)]
    end_y, end_z = pts[-1][1], pts[-1][2]
    for a in range(10, 91, 10):  # the ear bend
        r = 0.26
        pts.append((x + side * 0.08, end_y + r * math.sin(math.radians(a)),
                    end_z - r * (1 - math.cos(math.radians(a)))))
    return pts


temple_l = C.tube("temple_left", temple(-1), WIRE * 0.8, gold, res=4)
temple_r = C.tube("temple_right", temple(1), WIRE * 0.8, gold, res=4)

lens_prof = [(0.0, -0.022), (RL * 0.5, -0.02), (RL - 0.004, -0.012), (RL, 0.0), (RL - 0.004, 0.012),
             (RL * 0.5, 0.02), (0.0, 0.022)]
lenses = []
for side, nm in ((-1, "lens_left"), (1, "lens_right")):
    ln = C.lathe(nm, lens_prof, 64, lens_glass, 30)
    ln.rotation_euler.x = math.radians(90)
    ln.location.x = side * CX
    lenses.append(ln)

parts = [rim_l, rim_r, bridge, temple_l, temple_r, *lenses]
root = C.empty("about", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (math.radians(-8), 0, math.radians(-26))
C.finish("about", root, ACCENT, args, size=2.1, lift=0.18, backlight=0.6)
