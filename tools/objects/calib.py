"""Calibration object for the rig: a chrome ball, a white clay ball and a clear glass ball.
Rendering it in Cycles and in three.js with rig.js shows at once whether the HDRI orientation,
light strengths, tone mapping and shadows agree, before judging a real object.
Run: <venv>/bin/python tools/objects/calib.py [--out DIR] [--samples N]"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

args = C.parse_args()
C.reset()
chrome = C.metal("chrome", "#f4f5f7", rough=0.05)
clay = C.ceramic("clay", "#cfcfcf", rough=0.6, coat=0)
clear = C.glass("glass", "#ffffff", rough=0.03, thickness=0.7)
parts = []
balls = (("chrome", chrome), ("clay", clay), ("glass", clear))
if os.environ.get("CALIB_ONLY"):
    balls = [b for b in balls if b[0] == os.environ["CALIB_ONLY"]]
for i, (n, m) in enumerate(balls):
    C.bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.34,
                                           location=((i - 1) * 0.78, 0, 0.34))
    ob = C.bpy.context.active_object
    ob.name = n
    ob.data.materials.append(m)
    ob.data.shade_smooth()
    parts.append(ob)
root = C.empty("calib", parts)
C.finish("calib", root, "#bbed26", args, size=2.2 if len(balls) > 1 else 1.5)
