"""Recorder: the Record's object since 2026-10-10, a pocket cassette recorder standing upright,
because the record is a habit of talking into a recorder you carry, written up afterwards
(docs/research/2026-10-record-object.md, round 4, concept 2; it replaces the card file of
record.py). A smoked glass body with a deep bezel round a clear glass door; behind the door a
loaded cassette, its two packs of tape lit Record blue from inside (one full, one just started)
under a blank label; three chunky keys on top, the record key in Record blue; a thumb wheel on
the right side; and the record lamp, a Record-blue lens on the bezel, lit ("on air").

Simplified from the concept for a 120 px read: the thin tape run between the packs is gone (a
faint trapezoid at small sizes), the lamp is larger, the plain keys are paler and less blue so the
record key stands apart, and the hubs carry three teeth so the reels' turn shows in the clip.

Parts (root "recorder"): body, bezel, door, cassette, label, reel_left, reel_right (pack and hub
together; they turn about their own axle), key_rec, key_play, key_stop, wheel, led.
The interaction (frames.clip_recorder) presses the record key, brightens the lamp and turns the
reels, then lets the key up. Concept script: the session scratch's recobj/r4/player.py.
Run: <venv>/bin/python tools/objects/recorder.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"   # Record blue (brief §7, src/lib/media.ts)
TURN = -22.0         # yaw of the whole object, degrees
LED = 2.0            # the lamp at rest: lit, but not yet "recording" (the clip brightens it)
SMOKE = 1.4          # volume absorption of the body glass


def apply_all(ob):
    C.bpy.context.view_layer.update()
    for o in C.bpy.context.view_layer.objects:
        o.select_set(o == ob)
    C.bpy.context.view_layer.objects.active = ob
    C.bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return ob


def slab(name, outlines, y_front, depth, bevel, mat, bevel_res=4):
    """Extrude XZ outlines along +Y: front face at y_front (toward the camera is -Y)."""
    ob = C.outline_solid(name, outlines, depth, bevel, bevel_res=bevel_res, mat=mat)
    ob.rotation_euler.x = math.radians(90)      # XY -> XZ, the +Z face turns to -Y
    ob.location.y = y_front + depth / 2
    return apply_all(ob)


def lathe_y(name, prof, x, z, mat, segments=96):
    ob = C.lathe(name, prof, segments, mat, 50)
    ob.rotation_euler.x = math.radians(-90)
    K.apply_tf(ob)
    ob.location = (x, 0, z)
    return apply_all(ob)


def pack_y(name, r_in, r, y0, y1, x, z, mat):
    """The wound tape: a thick ring with soft edges, along Y."""
    e = min(0.012, (y1 - y0) / 4)
    pr = [(r_in, y0), (r - e, y0), (r, y0 + e), (r, y1 - e), (r - e, y1), (r_in, y1), (r_in, y0)]
    return lathe_y(name, pr, x, z, mat)


def hub_y(name, r_out, r_in, y0, y1, x, z, mat):
    """A hub: a flat ring with three teeth pointing in (they show the reel turning)."""
    ring = lathe_y(name, [(r_in, y0), (r_out, y0), (r_out, y1), (r_in, y1), (r_in, y0)], x, z, mat, 64)
    teeth = []
    tl = r_in * 0.55
    for i in range(3):
        a = math.radians(90 + 120 * i)
        t = slab(f"{name}_t{i}", [C.rounded_rect(tl + 0.004, 0.012, 0.004, cx=0, cy=0, step_deg=30)],
                 y0, y1 - y0, 0.002, mat, bevel_res=1)
        t.rotation_euler.y = -a
        t.location = (x + math.cos(a) * (r_in - tl / 2), 0, z + math.sin(a) * (r_in - tl / 2))
        teeth.append(apply_all(t))
    return K.join(name, [ring, *teeth])


def tape_light(name, glow=1.4, scale=38.0):
    """Wound tape as deep blue glass lit from inside in bands (record_b2.py)."""
    m = C.glass(name, "#2f5fd6", transmission=0.15, rough=0.3, ior=1.5, coat=0.4, thickness=0.1)
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    p = N["Principled BSDF"]
    p.inputs["Emission Color"].default_value = C.lin(ACCENT)
    tc = N.new("ShaderNodeTexCoord")
    ln = N.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    L.new(tc.outputs["Object"], ln.inputs[0])
    nz = N.new("ShaderNodeTexNoise")
    nz.noise_dimensions = "1D"
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 1.0
    L.new(ln.outputs["Value"], nz.inputs["W"])
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.35
    mr.inputs["From Max"].default_value = 0.65
    mr.inputs["To Min"].default_value = glow * 0.6
    mr.inputs["To Max"].default_value = glow * 1.15
    L.new(nz.outputs["Fac"], mr.inputs["Value"])
    L.new(mr.outputs["Result"], p.inputs["Emission Strength"])
    return m


args = C.parse_args()
C.reset()
body_m = C.glass("glass_body", "#c9d0dc", transmission=0.94, rough=0.06, ior=1.45, coat=0.0,
                 thickness=0.6, absorb="#8d97a8", density=SMOKE, spec=0.3)
door_m = C.glass("glass_clear", "#f1f4f9", transmission=0.97, rough=0.02, ior=1.5, coat=0.5,
                 thickness=0.04)
shell_m = C.glass("glass_shell", "#e3e9f4", transmission=0.8, rough=0.3, ior=1.5, coat=0.3,
                  thickness=0.06)
key_m = C.glass("glass_key", "#e4e7ec", transmission=0.8, rough=0.18, ior=1.5, coat=0.4,
                thickness=0.1)
rec_m = C.glass("glass_rec", "#7fa8ff", transmission=0.6, rough=0.12, ior=1.5, coat=0.6,
                thickness=0.1)
pack_m = tape_light("tape_light", glow=1.5)
hub_m = C.ceramic("hub", "#eef0f4", rough=0.35, coat=0.5)
paper = C.ceramic("label", "#efe9dd", rough=0.5, coat=0.2)
led_m = C.emissive("led", "#5b8fff", strength=LED)

BW, BH, BD = 1.12, 0.84, 0.34       # body
R = 0.09
yF = -BD / 2                         # front face
BACK_D = 0.2                         # the solid back block
BEZ_D = BD - BACK_D                  # bezel depth (holds the cassette)
DW, DH, DZ = 0.92, 0.6, 0.39         # door / window
back = slab("body", [C.rounded_rect(BW, BH, R, cx=0, cy=BH / 2, step_deg=8)], yF + BEZ_D,
            BACK_D, 0.04, body_m)
win = C.rounded_rect(DW, DH, 0.05, cx=0, cy=DZ, step_deg=8)
bezel = slab("bezel", [C.rounded_rect(BW, BH, R, cx=0, cy=BH / 2, step_deg=8), win], yF,
             BEZ_D + 0.02, 0.035, body_m)
door = slab("door", [C.rounded_rect(DW - 0.01, DH - 0.01, 0.045, cx=0, cy=DZ, step_deg=8)],
            yF + 0.012, 0.03, 0.012, door_m)
# clear and smoked glass let the key light through (no caustics: a solid shadow otherwise)
for o in (back, bezel, door):
    o.visible_shadow = False

# the cassette behind the door
KW, KH = 0.84, 0.53
ky0, kd = yF + 0.05, BEZ_D - 0.05
kshell = slab("cassette", [C.rounded_rect(KW, KH, 0.035, cx=0, cy=DZ, step_deg=10)], ky0 + 0.003,
              kd - 0.006, 0.012, shell_m)
kshell.visible_shadow = False
CX, CZ = 0.19, DZ + 0.01
RIN, PL, PR = 0.06, 0.16, 0.09       # hub radius, the full pack, the started one
reels = []
for side, x, r in (("left", -CX, PL), ("right", CX, PR)):
    pk = pack_y(f"pack_{side}", RIN, r, ky0 - 0.004, ky0 + 0.03, x, CZ, pack_m)
    hb = hub_y(f"hub_{side}", RIN, 0.034, ky0 - 0.008, ky0 + 0.03, x, CZ, hub_m)
    reels.append(K.join(f"reel_{side}", [pk, hb]))
label = slab("label", [C.rounded_rect(KW - 0.1, 0.075, 0.015, cx=0, cy=DZ + KH / 2 - 0.07,
                                      step_deg=10)], ky0 - 0.006, 0.006, 0.002, paper, bevel_res=2)

# three keys on top, set back from the front; the record key first, taller and blue
keys = []
for name, x, h, m in (("key_rec", -0.36, 0.11, rec_m), ("key_play", -0.13, 0.085, key_m),
                      ("key_stop", 0.1, 0.085, key_m)):
    keys.append(slab(name, [C.rounded_rect(0.19, h * 2, 0.035, cx=x, cy=BH, step_deg=10)],
                     yF + 0.07, 0.17, 0.025, m))
# the thumb wheel on the right side
wheel = K.cylinder_y("wheel", 0.11, -0.045, 0.045, 0, 0, key_m, segments=64, bevel=0.02)
wheel.rotation_euler.z = math.radians(90)
wheel.location = (BW / 2 + 0.01, yF + 0.17, BH * 0.62)
apply_all(wheel)
# the record lamp, lit
C.bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.05,
                                       location=(DW / 2 - 0.04, yF - 0.002, BH - 0.06))
lamp = C.bpy.context.active_object
lamp.name = "led"
lamp.scale.y = 0.45
lamp.data.materials.append(led_m)
C.shade(lamp, 60, weighted=False)
apply_all(lamp)

parts = [back, bezel, door, kshell, *reels, label, *keys, wheel, lamp]
for p in parts:
    C.origin_to_center(p)
root = C.empty("recorder", parts)
root.rotation_euler = (0, 0, math.radians(TURN))
root["led_rest"] = LED
C.finish("recorder", root, ACCENT, args, size=2.15, lift=0.0)
