"""English Prep: a sakura glass speech bubble with a crisp "Aa" (SPEC "Objects").
Parts (root "englishprep"): bubble (sakura glass), A and a (white enamel letters standing on
the bubble's face), reply (a small iris glass bubble behind), dots (three lagoon enamel dots
on the reply). The bubble pops on hover; the reply can type with its dots.
Run: <venv>/bin/python tools/objects/englishprep.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#efb1cb"   # sakura
IRIS = "#c8b4e9"     # English Prep --secondary
LAGOON = "#6fb3c2"   # between English Prep --cool (#a4d3db) and aurora lagoon (#28798a)

args = C.parse_args()
C.reset()
sakura = C.glass("glass_sakura", "#f6c6d9", transmission=0.82, rough=0.1, ior=1.48, coat=0.8,
                 thickness=0.4)
iris = C.glass("glass_iris", IRIS, transmission=0.8, rough=0.12, ior=1.48, coat=0.8,
               thickness=0.25)
enamel = C.ceramic("enamel_white", "#f6f2f0", rough=0.28, coat=0.6)
lagoon = C.ceramic("enamel_lagoon", LAGOON, rough=0.3, coat=0.6)


def bubble_outline(w, h, r, tail_x0, tail_x1, tip, mirror=False):
    x0, x1, y0, y1 = -w / 2, w / 2, -h / 2, h / 2
    poly = [(x0, y0), (x0 + tail_x0, y0), tip, (x0 + tail_x1, y0), (x1, y0), (x1, y1), (x0, y1)]
    radii = [r, 0.08, 0.16, 0.14, r, r, r]
    if mirror:
        poly = [(-x, y) for (x, y) in reversed(poly)]
        radii = list(reversed(radii))
    return C.fillet(poly, radii, step_deg=5)


W, H, D = 1.9, 1.34, 0.42
main = bubble_outline(W, H, 0.48, 0.6, 1.22, (-W / 2 + 0.3, -H / 2 - 0.44))
bubble = C.outline_solid("bubble", [main], D, 0.11, bevel_res=6, mat=sakura)

font = C.load_font(("InterDisplay-Bold.otf",))
size = 0.74
cap = 0.727 * size  # Inter's cap height
text = C.text_solid("Aa", "Aa", font, size, depth=0.09, bevel=0.014, bevel_res=3, mat=enamel,
                    res_u=10, spacing=1.02)
text.location = (0.0, -cap / 2 + 0.02, D / 2 + 0.045 + 0.001)
letters = C.separate_loose(text, ["A", "a"])

rw, rh, rd = 0.92, 0.6, 0.24
small = bubble_outline(rw, rh, 0.26, 0.32, 0.64, (-rw / 2 + 0.16, -rh / 2 - 0.22), mirror=True)
reply = C.outline_solid("reply", [small], rd, 0.07, bevel_res=5, mat=iris)
RX, RY, RZ = 0.98, 0.78, -0.4  # up and right, mostly clear of the main bubble
reply.location = (RX, RY, RZ)
reply.rotation_euler.z = math.radians(-6)
dots = []
for i in range(3):
    C.bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.055,
                                           location=(RX + (i - 1) * 0.19, RY, RZ + rd / 2 + 0.03))
    d = C.bpy.context.active_object
    d.scale.z = 0.6
    d.data.materials.append(lagoon)
    C.shade(d, 60, weighted=False)
    dots.append(d)
for o in C.bpy.context.view_layer.objects:
    o.select_set(o in dots)
C.bpy.context.view_layer.objects.active = dots[0]
C.bpy.ops.object.join()
dots = C.bpy.context.view_layer.objects.active
dots.name = "dots"

parts = [bubble, *letters, reply, dots]
root = C.empty("englishprep", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (math.radians(90), 0, math.radians(-16))
C.finish("englishprep", root, ACCENT, args, size=2.15, lift=0.1)
