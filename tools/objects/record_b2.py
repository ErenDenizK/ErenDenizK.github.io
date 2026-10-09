"""Record, concept B round 2: a compact glass tape recorder (docs/research/2026-10-record-object.md,
"Round 2"). Round 1's deck was a flat plate with thin reels, which the owner found empty. Here
the parts are fewer and fuller: a solid glass desk body with a sloped face, like a recorder on a
desk, two thick clear glass reels lying on the slope with the wound tape inside each lit in
Record blue, the tape running straight between them, and the record lamp on the
front edge as the one warm accent. The left reel is full and the right one has just started:
the tape still to be recorded is the years ahead.
Parts (root "record_b2"): body (smoked glass), reel_left and reel_right (clear glass discs with their
hubs), pack_left and pack_right (the wound tape, blue light), tape (the run between them), led
(the record lamp, warm, dim at rest). With RECORD_HYBRID=1
(record_h2.py) the front edge carries the card's motif, a waveform turning into handwriting, in
blue light: part "window".
The interaction lights the lamp, turns both reels and moves a little tape from left to right:
pack_left shrinks a hair and pack_right grows by as much.
Run: <venv>/bin/python tools/objects/record_b2.py [--out DIR] [--samples N]"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"  # Record blue (brief §7)
WARM = "#ffb070"    # the record lamp: the object's one warm light
LED_REST, LED_ON_AIR = 2.0, 12.0
HYBRID = os.environ.get("RECORD_HYBRID") == "1"
NAME = "record_h2" if HYBRID else "record_b2"
TURN = float(os.environ.get("B2_TURN", "-18"))
PACK_GLOW = float(os.environ.get("B2_GLOW", "1.4"))
FROST = float(os.environ.get("B2_FROST", "0.05"))
SMOKE = float(os.environ.get("B2_SMOKE", "1.6"))   # absorption density of the body glass
TILT = float(os.environ.get("B2_TILT", "20"))      # the face leans back this far from vertical

args = C.parse_args()
C.reset()
# no clear coat and a low specular level: a glossy slope mirrors the key softbox as a white sheet
body_glass = C.glass("glass_body", "#c9d0dc", transmission=0.94, rough=FROST, ior=1.45, coat=0.0,
                     thickness=0.6, absorb="#8d97a8", density=SMOKE, spec=0.3)
clear = C.glass("glass_clear", "#f1f4f9", transmission=0.97, rough=0.03, ior=1.5, coat=0.5,
                thickness=0.16)
led = C.emissive("led", WARM, strength=LED_REST)
led.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = C.lin("#6a4426")
ink = C.emissive("window_ink", ACCENT, strength=2.5)


def tape_light(name):
    """The wound tape: deep blue glass lit from inside. The light comes in bands, one per few
    turns of tape, so the pack reads as wound rather than as a flat blue disc (round 2). The
    bands follow the distance from the pack's centre (the pack is thin, so the 3D distance is
    the radius, whatever the lean)."""
    m = C.glass(name, "#2f5fd6", transmission=0.15, rough=0.3, ior=1.5, coat=0.4,
                thickness=0.1)
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
    nz.inputs["Scale"].default_value = 38.0
    nz.inputs["Detail"].default_value = 2.0
    L.new(ln.outputs["Value"], nz.inputs["W"])
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.35
    mr.inputs["From Max"].default_value = 0.65
    mr.inputs["To Min"].default_value = PACK_GLOW * 0.6
    mr.inputs["To Max"].default_value = PACK_GLOW * 1.15
    L.new(nz.outputs["Fac"], mr.inputs["Value"])
    L.new(mr.outputs["Result"], p.inputs["Emission Strength"])
    fine = N.new("ShaderNodeTexNoise")
    fine.noise_dimensions = "1D"
    fine.inputs["Scale"].default_value = 900.0
    L.new(ln.outputs["Value"], fine.inputs["W"])
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.1
    bump.inputs["Distance"].default_value = 0.002
    L.new(fine.outputs["Fac"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


pack_mat = tape_light("tape_light")
run_mat = tape_light("tape_run")


def apply_all(ob):
    C.bpy.context.view_layer.update()
    for o in C.bpy.context.view_layer.objects:
        o.select_set(o == ob)
    C.bpy.context.view_layer.objects.active = ob
    C.bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


# ------------------------------------------------------------------ the body
# side profile in (y, z): a low front edge, the face sloping back at TILT from vertical, a flat
# top and a vertical back. x right, z up, the camera looks along +y (the front faces -y)
BW = 2.1
FRONT_Y, FRONT_H = -0.42, 0.3
FACE_L = 0.98                       # length of the sloped face
t = math.radians(TILT)
TOP_Y, TOP_Z = FRONT_Y + FACE_L * math.sin(t), FRONT_H + FACE_L * math.cos(t)
BACK_Y = TOP_Y + 0.22
prof = [(FRONT_Y, 0.0), (BACK_Y, 0.0), (BACK_Y, TOP_Z), (TOP_Y, TOP_Z), (FRONT_Y, FRONT_H)]
prof = C.fillet(prof, [0.05, 0.05, 0.1, 0.12, 0.1], step_deg=6)
body = C.outline_solid("body", [prof], BW, 0.07, bevel_res=6, mat=body_glass)
body.rotation_euler = (math.radians(90), 0, math.radians(90))   # (u, v, w) -> (y, z, x)
K.apply_tf(body)
body.visible_shadow = False   # glass: no solid shadow over the reels and the lamp


# ------------------------------------------------------------------ on the face
# built flat in the face's own frame (face plane at y = 0, "up the slope" = +z), then leaned
# back about the front edge and set onto the slope
RX, RZ = 0.5, float(os.environ.get('B2_RZ', '0.64'))  # reel centres: they stand above the top
R_REEL, REEL_D = 0.42, 0.15
PACK_L, PACK_R, R_HUB = 0.35, 0.2, 0.1
Y_R0, Y_R1 = -0.005, -0.005 - REEL_D
Y_P0, Y_P1 = Y_R0 - 0.025, Y_R1 + 0.025


def disc(name, r, y0, y1, x, z, mat, bevel, segments=96):
    return K.cylinder_y(name, r, y0, y1, x, z, mat, segments=segments, bevel=bevel)


def reel(name, x):
    g = disc(f"{name}_glass", R_REEL, Y_R1, Y_R0, x, RZ, clear, 0.05)
    # the hub is clear glass too: a bright metal hub in each reel read as two eyes (round 2)
    hub = disc(f"{name}_hub", R_HUB, Y_R1 - 0.03, Y_R0, x, RZ, clear, 0.03, 64)
    return K.join(name, [g, hub])


def pack(name, x, r):
    pr = [(R_HUB + 0.004, Y_P0), (r - 0.01, Y_P0), (r, Y_P0 - 0.01), (r, Y_P1 + 0.01),
          (r - 0.01, Y_P1), (R_HUB + 0.004, Y_P1)]
    ob = C.lathe(name, pr + [pr[0]], 96, pack_mat, 50)
    ob.rotation_euler.x = math.radians(-90)
    K.apply_tf(ob)
    ob.location = (x, 0, RZ)
    return ob


reel_left, reel_right = reel("reel_left", -RX), reel("reel_right", RX)
pack_left, pack_right = pack("pack_left", -RX, PACK_L), pack("pack_right", RX, PACK_R)

# the tape: a straight run under both reels, from the bottom of the full pack to the bottom of
# the new one (a head between them read as a mouth under two eyes, round 2's first render)
p1, p2, n1 = K.tangent((-RX, RZ), PACK_L, (RX, RZ), PACK_R, -1)
d = (p2[0] - p1[0], p2[1] - p1[1])
L = math.hypot(*d)
u = (d[0] / L, d[1] / L)
path = [(p1[0] - u[0] * 0.02 - n1[0] * 0.006, p1[1] - u[1] * 0.02 - n1[1] * 0.006),
        (p2[0] + u[0] * 0.02 - n1[0] * 0.006, p2[1] + u[1] * 0.02 - n1[1] * 0.006)]
tape = K.ribbon("tape", path, Y_P0 - 0.008, Y_P1 + 0.008, run_mat, thick=0.012)

face_parts = [reel_left, reel_right, pack_left, pack_right, tape]
for ob in face_parts:
    apply_all(ob)                    # geometry in the face frame, origin on its front edge
    ob.rotation_euler.x = -t         # lean the face back
    ob.location = (0, FRONT_Y, FRONT_H)
    apply_all(ob)

# the record lamp on the front edge, to the right: the one warm light
C.bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.045,
                                       location=(0.78, FRONT_Y - 0.005, FRONT_H * 0.5))
lamp = C.bpy.context.active_object
lamp.name = "led"
lamp.scale.y = 0.5
lamp.data.materials.append(led)
C.shade(lamp, 60, weighted=False)

parts = [body, *face_parts, lamp]

if HYBRID:
    # the card's motif along the front edge: a waveform, then looped handwriting
    rg = random.Random(5)
    marks = []
    Z_W = FRONT_H * 0.5
    wy = FRONT_Y - 0.004

    def flat(ob):
        ob.rotation_euler.x = math.radians(90)
        K.apply_tf(ob)
        ob.location.y = wy
        return ob

    def stroke(pts):
        tb = C.tube("ink", pts, 0.008, ink, res=3)
        tb.scale.y = 0.4
        K.apply_tf(tb)
        tb.location.y = wy
        return tb

    for i in range(9):
        x = -0.86 + 0.042 * i
        env = math.sin(math.pi * (i + 0.7) / 9.4) ** 0.7 * (1 - 0.5 * i / 9)
        h = 0.02 + 0.1 * env * (0.6 + 0.4 * abs(math.sin(i * 2.1 + 0.4)))
        marks.append(flat(C.outline_solid("bar", [C.rounded_rect(0.02, h, 0.0095, cx=x, cy=Z_W,
                                                                  step_deg=20)],
                                          0.006, 0.002, bevel_res=1, mat=ink)))
    pts, x, tt0 = [], -0.47, 0.0
    a, n = 0.6 * 0.028, 0
    while x < 0.6:
        bb = 0.028 * (1.0 + 0.45 * math.sin(n * 1.7))
        for j in range(16):
            tt = tt0 + 2 * math.pi * j / 16
            pts.append((x + a * (tt - tt0) + bb * 0.95 * math.sin(tt), 0.0,
                        Z_W - 0.03 + bb * 1.1 * (1 - math.cos(tt)) * 0.5))
        x += a * 2 * math.pi
        tt0 += 2 * math.pi
        n += 1
        if n % rg.randint(3, 5) == 0:
            marks.append(stroke(pts))
            pts = []
            x += 0.05
    if len(pts) > 3:
        marks.append(stroke(pts))
    parts.append(K.join("window", marks))

root = C.empty(NAME, parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(TURN))
root["led_on_air"] = LED_ON_AIR
C.finish(NAME, root, ACCENT, args, size=2.15, lift=0.0)
