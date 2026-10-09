"""Record, concept A: a large-diaphragm valve microphone in a spider mount
(docs/research/2026-10-record-object.md). The shipped microphone (log.py) kept the symbol
and lost the instrument; this one is engineered: a woven steel grille with the blue
diaphragm visible inside, a glass body showing the valve and its warm heater, elastic
cords, a stand and a right-angle plug whose cable runs off across the desk.
Parts (root "record_a"): body (glass shell), grille (woven steel head), band (steel ring),
capsule (the diaphragm), valve (the tube and its socket, heater glowing), mount (spider rings,
collars and cords), stand (yoke, rod and base), cable (plug and lead), led (on-air lamp).
The interaction: the lamp goes on air, the heater brightens and the mic rocks once in its
cords.
Run: <venv>/bin/python tools/objects/record_a.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"  # Record blue (brief §7)
LED_REST, LED_ON_AIR = 0.6, 10.0

args = C.parse_args()
C.reset()
glass = C.glass("glass_body", "#e2eafa", transmission=0.94, rough=0.04, ior=1.5, coat=0.5,
                thickness=0.03)
valve_glass = C.glass("glass_valve", "#f2f2f0", transmission=0.97, rough=0.02, ior=1.5,
                      thickness=0.01)
steel = C.metal("steel_polished", "#e4e6ea", rough=0.2)
satin = K.brushed("steel_brushed", "#cdd0d5", rough=0.26, axis="Z")
wire = C.metal("steel_wire", "#d4d7dc", rough=0.32)
iron = C.ceramic("iron_satin", "#1b1c20", rough=0.45, coat=0.2)
rubber = K.rubber("cord_rubber", "#1a1b1f", rough=0.5)
cable_mat = K.rubber("cable", "#141518", rough=0.42)
diaphragm = K.spun("anodised_blue", "#4f7fd6", rough=0.22, rings=1600.0, axis="Y")
anode = C.metal("anode", "#3a3c40", rough=0.5)
heater = C.emissive("heater", "#ffae66", strength=2.5)
led = C.emissive("led", ACCENT, strength=LED_REST)
led.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = C.lin("#1c2436")

R_BODY, Z_B0, Z_B1 = 0.25, 0.74, 1.38     # glass body
Z_H1 = 2.02                                # top of the head
R_OUT = 0.45                               # spider's outer rings


def capsule_prof(r, z0, z1, cap0, cap1, n=10):
    prof = [(0.0, z0)]
    for i in range(1, n + 1):
        a = math.pi / 2 * i / n
        prof.append((r * math.sin(a), z0 + r * cap0 * (1 - math.cos(a))))
    for i in range(n + 1):
        a = math.pi / 2 * i / n
        prof.append((r * math.cos(a), z1 - r * cap1 * (1 - math.sin(a))))
    prof.append((0.0, z1))
    return C.dedupe(prof)


# ------------------------------------------------------------------ body: a glass shell
outer = capsule_prof(R_BODY, Z_B0, Z_B1, 0.35, 0.0001, n=10)[1:-1]
inner = capsule_prof(R_BODY - 0.028, Z_B0 + 0.028, Z_B1, 0.33, 0.0001, n=10)[1:-1]
shell = outer + list(reversed(inner)) + [outer[0]]
body = C.lathe("body", shell, 72, glass, 50)

# inside: a satin spine, the valve on its socket, two capacitors
spine = K.box("spine", 0.11, 0.012, Z_B1 - Z_B0 - 0.1, 0.004, mat=satin,
              loc=(0, 0.1, (Z_B0 + Z_B1) / 2 + 0.03))
sock = C.lathe("socket", [(0, 1.02), (0.07, 1.02), (0.075, 1.035), (0.07, 1.06), (0, 1.06)], 40,
               iron, 40)
env = C.lathe("envelope", capsule_prof(0.055, 1.06, 1.36, 0.2, 1.0, n=8), 40, valve_glass, 50)
plate = K.box("anode", 0.07, 0.035, 0.15, 0.006, mat=anode, loc=(0, 0, 1.2))
fil = C.lathe("filament", [(0, 1.12), (0.008, 1.12), (0.008, 1.29), (0, 1.29)], 12, heater, 30)
fil.location.y = -0.024
getter = C.lathe("getter", [(0, 1.31), (0.03, 1.31), (0.03, 1.318), (0, 1.318)], 24, steel, 30)
caps = []
for x, z in ((-0.12, 1.3), (0.12, 1.14)):
    c = C.lathe("cap", [(0, z), (0.028, z), (0.03, z + 0.008), (0.03, z + 0.1), (0.028, z + 0.108),
                        (0, z + 0.108)], 24, C.ceramic("cap_glaze", "#d9cfbf", 0.4, 0.4), 40)
    c.location = (x, 0.06, 0)
    caps.append(c)
valve = K.join("valve", [sock, env, plate, fil, getter, *caps])
valve.location.z += Z_B0 - 0.92  # laid out for a body starting at 0.92
spine_join = spine

# ------------------------------------------------------------------ band and grille
band = C.lathe("band", [(0, Z_B1 - 0.03), (0.262, Z_B1 - 0.03), (0.272, Z_B1 - 0.02),
                        (0.275, Z_B1 + 0.04), (0.272, Z_B1 + 0.075), (0.262, Z_B1 + 0.085),
                        (0, Z_B1 + 0.085)], 72, steel, 35)
ZG0 = Z_B1 + 0.085
gp = capsule_prof(0.262, ZG0, Z_H1, 0.0001, 1.0, n=14)[1:]
# even rows along the profile: a woven-looking grid once wireframed
pts = []
acc = [0.0]
for a, b in zip(gp, gp[1:]):
    acc.append(acc[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
rows = 44
for k in range(rows + 1):
    s = acc[-1] * k / rows
    for i in range(len(acc) - 1):
        if acc[i] <= s <= acc[i + 1] + 1e-9:
            f = (s - acc[i]) / max(acc[i + 1] - acc[i], 1e-9)
            pts.append((gp[i][0] + (gp[i + 1][0] - gp[i][0]) * f, gp[i][1] + (gp[i + 1][1] - gp[i][1]) * f))
            break
# the wire stops short of the pole, where a small spun button closes the dome
ring_pts = [p for p in pts if p[0] > 0.045]
grille = C.lathe("grille", C.dedupe(ring_pts), 96, wire, 60)
wf = grille.modifiers.new("weave", "WIREFRAME")
wf.thickness = 0.0042
wf.use_even_offset = True
grille.modifiers.move(len(grille.modifiers) - 1, 0)
rt, zt = ring_pts[-1]
button = C.lathe("button", [(0, zt - 0.004), (rt + 0.006, zt - 0.004), (rt + 0.008, zt + 0.004),
                            (rt * 0.6, zt + 0.014), (0, zt + 0.016)], 48, satin, 40)
# the cap ring at the top and the seam ring at the bottom of the grille
rim = C.lathe("rim", [(0.25, ZG0 - 0.005), (0.27, ZG0 - 0.005), (0.272, ZG0 + 0.02), (0.25, ZG0 + 0.02)]
              + [(0.25, ZG0 - 0.005)], 72, steel, 35)
grille = K.join("grille", [grille, button, rim])

# the capsule: a large diaphragm on edge, facing the camera, inside the head
CZ = (ZG0 + Z_H1) / 2 - 0.02
film = K.cylinder_y("capsule", 0.15, -0.012, 0.012, 0, CZ, diaphragm, segments=72, bevel=0.004)
ring = C.lathe("capring", [(0.15, -0.022), (0.175, -0.022), (0.18, -0.012), (0.18, 0.012),
                           (0.175, 0.022), (0.15, 0.022), (0.15, -0.022)], 72, steel, 35)
ring.rotation_euler.x = math.radians(-90)
K.apply_tf(ring)
ring.location = (0, 0, CZ)
post = C.lathe("cappost", [(0, ZG0 - 0.02), (0.018, ZG0 - 0.02), (0.018, CZ - 0.17), (0, CZ - 0.17)], 16,
               satin, 30)
capsule = K.join("capsule", [film, ring, post])

# the on-air lamp, in the band facing the camera
C.bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.026,
                                       location=(0, -0.272, Z_B1 + 0.028))
dot = C.bpy.context.active_object
dot.name = "led"
dot.scale.y = 0.45
dot.data.materials.append(led)
C.shade(dot, 60, weighted=False)

# ------------------------------------------------------------------ spider mount
mount = []
ZR = (Z_B0 + 0.12, Z_B1 - 0.09)
for zr in ZR:
    collar = C.lathe("collar", [(R_BODY + 0.002, zr - 0.025), (R_BODY + 0.022, zr - 0.025),
                                (R_BODY + 0.028, zr), (R_BODY + 0.022, zr + 0.025),
                                (R_BODY + 0.002, zr + 0.025), (R_BODY + 0.002, zr - 0.025)], 72,
                     satin, 35)
    mount.append(collar)
    ring_pts = [(R_OUT * math.cos(2 * math.pi * i / 96), R_OUT * math.sin(2 * math.pi * i / 96), zr)
                for i in range(96)]
    mount.append(K.join("oring", [C.tube("oring", ring_pts, 0.016, steel, res=4, closed=True)]))
    n = 8
    for i in range(n):
        a0 = 2 * math.pi * i / n + math.pi / n / 2
        a1 = a0 + math.pi / n
        p0 = ((R_BODY + 0.028) * math.cos(a0), (R_BODY + 0.028) * math.sin(a0), zr)
        p1 = ((R_OUT - 0.01) * math.cos(a1), (R_OUT - 0.01) * math.sin(a1), zr + (0.04 if i % 2 else -0.04))
        p2 = ((R_BODY + 0.028) * math.cos(a1 + math.pi / n), (R_BODY + 0.028) * math.sin(a1 + math.pi / n), zr)
        mount.append(C.tube("cord", [p0, p1, p2], 0.0075, rubber, res=3))
# side struts joining the two rings, then the yoke down to the swivel
for sx in (-1, 1):
    mount.append(C.tube("strut", [(sx * R_OUT, 0, ZR[0]), (sx * R_OUT, 0, ZR[1])], 0.016, steel, res=4))
Z_PIV = 0.5   # a short desk stand: the microphone, not the stand, fills the frame
yoke = []
for i in range(17):
    t = i / 16
    a = math.pi * t
    yoke.append((-R_OUT * math.cos(a), 0, ZR[0] - (ZR[0] - Z_PIV) * math.sin(a) ** 0.7))
mount.append(C.tube("yoke", yoke, 0.018, steel, res=4))
mount = K.join("mount", mount)

piv = K.cylinder_y("swivel", 0.05, -0.06, 0.06, 0, Z_PIV, satin, segments=40, bevel=0.012)
knob = K.cylinder_y("knob", 0.035, -0.06, -0.11, 0, Z_PIV, iron, segments=32, bevel=0.01)
rod = C.lathe("rod", [(0, 0.08), (0.022, 0.08), (0.022, Z_PIV - 0.04), (0, Z_PIV - 0.04)], 32, steel, 40)
collar_s = C.lathe("rodcollar", [(0, 0.24), (0.034, 0.24), (0.038, 0.25), (0.038, 0.29), (0.034, 0.3),
                                 (0, 0.3)], 40, satin, 35)
base = C.lathe("base", [(0, 0.0), (0.38, 0.0), (0.405, 0.012), (0.41, 0.04), (0.395, 0.06), (0.3, 0.075),
                        (0.06, 0.085), (0, 0.085)], 72, iron, 40)
base_ring = C.lathe("basering", [(0.392, 0.055), (0.405, 0.04), (0.41, 0.045), (0.398, 0.064)]
                    + [(0.392, 0.055)], 72, steel, 35)
stand = K.join("stand", [piv, knob, rod, collar_s, base, base_ring])

# ------------------------------------------------------------------ right-angle plug and lead
plug_v = C.lathe("plug", [(0, Z_B0 - 0.12), (0.06, Z_B0 - 0.12), (0.065, Z_B0 - 0.11),
                          (0.065, Z_B0 + 0.02), (0, Z_B0 + 0.02)], 40, satin, 35)
plug_h = K.cylinder_y("plug_h", 0.06, 0.0, 0.2, 0, Z_B0 - 0.065, satin, segments=40, bevel=0.012)
plug_h.rotation_euler.z = math.radians(-50)
K.apply_tf(plug_h)
boot = K.cylinder_y("boot", 0.036, 0.18, 0.3, 0, Z_B0 - 0.065, cable_mat, segments=24, bevel=0.01)
boot.rotation_euler.z = math.radians(-50)
K.apply_tf(boot)
d = (math.sin(math.radians(50)), math.cos(math.radians(50)))   # the plug's direction, +x +y
start = (0.29 * d[0], 0.29 * d[1], Z_B0 - 0.065)
lead = [start]
ctrl = [start, (0.5 * d[0], 0.5 * d[1], Z_B0 - 0.1), (0.62, 0.42, 0.38), (0.74, 0.28, 0.025),
        (0.86, -0.1, 0.025), (0.78, -0.5, 0.025), (0.55, -0.72, 0.025)]


def bez_chain(p, n=10):
    """Catmull-Rom through the control points (3D)."""
    out = []
    for i in range(len(p) - 1):
        p0, p1, p2, p3 = p[max(i - 1, 0)], p[i], p[i + 1], p[min(i + 2, len(p) - 1)]
        for k in range(n):
            t = k / n
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t
                                    + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3)
                             for j in range(3)))
    out.append(p[-1])
    return out


lead = C.tube("lead", bez_chain(ctrl), 0.022, cable_mat, res=4)
cable = K.join("cable", [plug_v, plug_h, boot, lead])

mic_parts = [body, spine_join, valve, band, grille, capsule, dot]
spine_join.name = "spine"
parts = [body, spine_join, valve, band, grille, capsule, dot, mount, stand, cable]
root = C.empty("record_a", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(-12))
root["led_on_air"] = LED_ON_AIR
C.finish("record_a", root, ACCENT, args, size=2.15, lift=0.0)
