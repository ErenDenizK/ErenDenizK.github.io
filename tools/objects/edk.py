"""Home: the lowercase "edk" wordmark in extruded glass (SPEC "Objects", ADR-0005).
Parts: edk (root) > e, d, k, each a separate glass letter with its origin at its centre.
Run: <venv>/bin/python tools/objects/edk.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#c9d4ff"  # cool white rim for Home (placeholder until the owner picks a home colour)

REST_TURN = -4.0

args = C.parse_args()
C.reset()
font = C.load_font(("InterDisplay-Bold.otf",))
glass = C.glass("glass_clear", "#eef1f8", transmission=0.92, rough=0.05, ior=1.5, coat=0.6,
                thickness=0.8)
word = C.text_solid("edk", "edk", font, size=1.0, depth=0.34, bevel=0.03, bevel_res=5,
                    mat=glass, res_u=12, spacing=1.16)
letters = C.separate_loose(word, ["e", "d", "k"])
root = C.empty("edk", letters)
# Rests turned -4 deg: the lean grid spans rest +-16 deg, and from a -12 deg rest its left end
# (-28 deg) slid the e's side face over the d. -4 keeps a hint of the extrusion at rest, and the
# two ends (-20 / +12 deg) come equally close to touching (previews, 2026-10-09).
root.rotation_euler = (math.radians(90), 0, math.radians(REST_TURN))
C.finish("edk", root, ACCENT, args, size=2.2)
