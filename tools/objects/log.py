"""Log: a glass studio microphone, because the log is dictated (SPEC "Objects").
Parts (root "log"): head (glass capsule), core (the metal capsule seen through it), band
(steel ring), neck, stem, base (steel), led (a small light in the accent colour). The head
and core can pulse with a waveform.
Run: <venv>/bin/python tools/objects/log.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402

ACCENT = "#8fb8ff"  # cool blue for the Log tab (placeholder until the owner picks one)

args = C.parse_args()
C.reset()
glass = C.glass("glass_clear", "#e4ecfb", transmission=0.94, rough=0.04, ior=1.5, coat=0.5,
                thickness=0.06)
steel = C.metal("steel", "#e4e6ea", rough=0.16)
gun = C.metal("gunmetal", "#5b6068", rough=0.32)
grille = C.metal("steel_satin", "#c9ccd2", rough=0.28)
# The LED rests dim enough to keep its colour (at 6 it tone-mapped to a white dot and going on air
# barely showed) and goes on air at LED_ON_AIR times that in the interaction (frames.clip_log).
LED_REST, LED_ON_AIR = 1.2, 6.0
led = C.emissive("led", ACCENT, strength=LED_REST)


def capsule(r, z0, z1, cap0=1.0, cap1=1.0, n=10):
    """(radius, height) profile of a capsule from z0 to z1 with elliptic caps (cap = depth/r)."""
    prof = [(0.0, z0)]
    for i in range(1, n + 1):
        a = math.pi / 2 * i / n
        prof.append((r * math.sin(a), z0 + r * cap0 * (1 - math.cos(a))))
    for i in range(n + 1):
        a = math.pi / 2 * i / n
        prof.append((r * math.cos(a), z1 - r * cap1 * (1 - math.sin(a))))
    prof.append((0.0, z1))
    return C.dedupe(prof)


# head: a thin glass shell (outer capsule up, inner capsule back down), open into the band
outer = capsule(0.42, 0.56, 1.72, cap0=0.45, cap1=1.0, n=12)[1:]
inner = capsule(0.39, 0.59, 1.69, cap0=0.42, cap1=1.0, n=12)[1:]
shell = outer + list(reversed(inner)) + [outer[0]]
head = C.lathe("head", shell, 64, glass, 50)
# core: the capsule inside, ridged like a grille
core_prof = [(0.0, 0.62), (0.15, 0.62)]
for i in range(1, 49):
    z = 0.64 + 0.7 * i / 48
    core_prof.append((0.16 + 0.012 * math.cos(i * math.pi / 2) ** 2, z))
core_prof += C.arc(0, 1.34, 0.16, 0, 90, step_deg=10)[1:]
core = C.lathe("core", C.dedupe(core_prof), 40, grille, 50)
band_prof = [(0.0, 0.47), (0.38, 0.47), (0.43, 0.48), (0.455, 0.51), (0.46, 0.56), (0.455, 0.61),
             (0.43, 0.64), (0.38, 0.65), (0.0, 0.65)]
band = C.lathe("band", band_prof, 64, steel, 35)
neck = C.lathe("neck", [(0.0, 0.2), (0.075, 0.2), (0.09, 0.3), (0.16, 0.42), (0.3, 0.48), (0.0, 0.48)],
               40, steel, 40)
stem = C.lathe("stem", [(0.0, 0.08), (0.06, 0.08), (0.06, 0.22), (0.0, 0.22)], 32, gun, 40)
base = C.lathe("base", [(0.0, 0.0), (0.5, 0.0), (0.56, 0.015), (0.58, 0.045), (0.56, 0.075),
                        (0.5, 0.09), (0.12, 0.1), (0.0, 0.1)], 64, steel, 35)
C.bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.035,
                                       location=(0, -0.458, 0.56))
dot = C.bpy.context.active_object
dot.name = "led"
dot.scale.y = 0.5
dot.data.materials.append(led)
C.shade(dot, 60, weighted=False)

parts = [head, core, band, neck, stem, base, dot]
root = C.empty("log", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(-10))
root["led_on_air"] = LED_ON_AIR
C.finish("log", root, ACCENT, args, size=2.1, lift=0.0)
