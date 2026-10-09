"""Record, concept B: an open-reel tape deck in glass (docs/research/2026-10-record-object.md).
The Record is dictated, so its object is a recorder; the left reel is full and the right one
has barely started, so the tape itself is the four years still to come.
Parts (root "record_b"): deck (blue glass faceplate), plinth (brushed steel), reel_left and
reel_right (clear glass flanges on spun hubs), pack_left and pack_right (the wound tape),
tape (the run across the heads), guides (two steel posts), heads (brushed head cover), led
(the record lamp, dim at rest, on air in the interaction). The interaction turns both reels
and moves a little tape from left to right while the lamp is lit.
Run: <venv>/bin/python tools/objects/record_b.py [--out DIR] [--samples N]"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"  # Record blue (brief §7, 2026-10-09 after prototype E)
LED_REST, LED_ON_AIR = 0.6, 10.0

args = C.parse_args()
C.reset()
# smoked glass: the plate is dark and lets the backlight through only at its edges and
# through the reels; a pale plate read as painted plastic (round 1)
glass_deck = C.glass("glass_deck", "#3b4049", transmission=0.92, rough=0.05, ior=1.5, coat=0.7,
                     thickness=0.14, absorb="#727c8e", density=4.0)
glass_reel = C.glass("glass_reel", "#eef2f8", transmission=0.96, rough=0.03, ior=1.5, coat=0.5,
                     thickness=0.03)
steel = K.brushed("steel_brushed", "#dcdfe3", rough=0.3, axis="X")
hub_metal = K.spun("alu_spun", "#d8dbe0", rough=0.3, rings=700.0, axis="Y")
guide_metal = C.metal("steel_satin", "#e6e8ec", rough=0.24)
oxide = K.tape_oxide("tape_oxide", "#3a2b22", rough=0.4, axis="Y")
tape_mat = K.tape_oxide("tape_run", "#3a2b22", rough=0.32, axis="Y")
led = C.emissive("led", ACCENT, strength=LED_REST)
led.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = C.lin("#1c2436")

# ------------------------------------------------------------------ layout (Blender units)
# x right, z up, the camera looks along +y (the front faces -y).
DECK_W, DECK_H, DECK_D = 2.3, 1.2, 0.14
DECK_Z0 = 0.08
RX, RZ = 0.56, 1.2          # reel centres at (+-RX, RZ): the reels stand proud of the plate
R_FL = 0.47                 # flange radius
R_HUB = 0.115
PACK_L, PACK_R = 0.43, 0.21  # left reel nearly full, right one just started
Y_BACK = -DECK_D / 2        # deck front face
FL_T = 0.026                # flange thickness
TAPE_W = 0.12
y_fb0, y_fb1 = Y_BACK - 0.035, Y_BACK - 0.035 - FL_T   # back flange
y_t0, y_t1 = y_fb1 - 0.004, y_fb1 - 0.004 - TAPE_W      # the tape's width
y_ff0, y_ff1 = y_t1 - 0.004, y_t1 - 0.004 - FL_T        # front flange
GUIDE_R, GX, GZ = 0.048, 0.33, 0.42

deck = C.outline_solid("deck", [C.rounded_rect(DECK_W, DECK_H, 0.13, step_deg=6)], DECK_D, 0.035,
                       bevel_res=5, mat=glass_deck)
deck.rotation_euler.x = math.radians(90)
deck.location = (0, 0, DECK_Z0 + DECK_H / 2)
K.apply_tf(deck)

plinth = K.box("plinth", DECK_W + 0.08, 0.62, 0.13, 0.03, mat=steel, loc=(0, 0, 0.065))
# a slot lip along the top, where the faceplate stands in the plinth
lip = K.box("lip", DECK_W - 0.1, DECK_D + 0.08, 0.05, 0.015, mat=steel, loc=(0, 0, 0.15))


def flange_outline(R, r_in, r_out, n=3, gap_deg=30):
    """A reel flange: a disc with n kidney windows between r_in and r_out."""
    outer = C.arc(0, 0, R, 0, 360, step_deg=4)[:-1]
    holes = []
    span = 360 / n - gap_deg
    for i in range(n):
        a0 = 90 + i * 360 / n + gap_deg / 2
        a1 = a0 + span
        win = C.arc(0, 0, r_out, a0, a1, step_deg=4) + C.arc(0, 0, r_in, a1, a0, step_deg=6)
        win = C.fillet(win, 0.05, step_deg=8)
        holes.append(list(reversed(win)))
    return [outer, *holes]


def reel(name, x):
    parts = []
    for tag, (ya, yb) in (("back", (y_fb0, y_fb1)), ("front", (y_ff0, y_ff1))):
        fl = C.outline_solid(f"{name}_{tag}", flange_outline(R_FL, R_HUB + 0.07, R_FL - 0.06),
                             FL_T, 0.008, bevel_res=3, mat=glass_reel)
        fl.rotation_euler.x = math.radians(90)
        fl.location = (x, (ya + yb) / 2, RZ)
        K.apply_tf(fl)
        parts.append(fl)
    hub = K.cylinder_y(f"{name}_hub", R_HUB, y_fb0 + 0.01, y_ff1 - 0.01, x, RZ, hub_metal,
                       segments=64, bevel=0.012)
    # the three-lobed hold-down on the spindle, in front of the reel
    cap = K.cylinder_y(f"{name}_cap", 0.055, y_ff1 - 0.01, y_ff1 - 0.055, x, RZ, guide_metal,
                       segments=48, bevel=0.012)
    lobes = []
    for i in range(3):
        a = math.radians(90 + 120 * i)
        lb = K.cylinder_y(f"{name}_lobe{i}", 0.026, y_ff1 - 0.02, y_ff1 - 0.05,
                          x + 0.07 * math.cos(a), RZ + 0.07 * math.sin(a), guide_metal,
                          segments=24, bevel=0.008)
        lobes.append(lb)
    return K.join(name, [*parts, hub, cap, *lobes])


reel_left = reel("reel_left", -RX)
reel_right = reel("reel_right", RX)


def pack(name, x, r_out):
    prof = [(R_HUB - 0.002, y_t0), (r_out - 0.004, y_t0), (r_out, y_t0 - 0.004),
            (r_out, y_t1 + 0.004), (r_out - 0.004, y_t1), (R_HUB - 0.002, y_t1)]
    ob = C.lathe(name, prof + [prof[0]], 96, oxide, 50)
    ob.rotation_euler.x = math.radians(-90)
    K.apply_tf(ob)
    ob.location = (x, 0, RZ)
    return ob


# lathe profiles here are (radius, y); cylinder_y's rotation maps the lathe axis onto +y
pack_left = pack("pack_left", -RX, PACK_L)
pack_right = pack("pack_right", RX, PACK_R)

# ------------------------------------------------------------------ the tape path
cL, cR = (-RX, RZ), (RX, RZ)
gL, gR = (-GX, GZ), (GX, GZ)
p1, p2, n1 = K.tangent(cL, PACK_L, gL, GUIDE_R, -1)
q1, q2, n2 = K.tangent(gR, GUIDE_R, cR, PACK_R, -1)
tL = math.atan2(n1[1], n1[0])
tR = math.atan2(n2[1], n2[0])
path = [p1]
path += K.arc_pts(gL, GUIDE_R + 0.002, tL, -math.pi / 2, step_deg=8)
path += K.arc_pts(gR, GUIDE_R + 0.002, -math.pi / 2, tR, step_deg=8)
path += [q2]
path = C.dedupe(path)
# start and end a little inside the packs so no seam shows
def _inset(a, b, d):
    dx, dz = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dz)
    return (a[0] + dx / L * d, a[1] + dz / L * d)


path[0] = _inset(path[1], path[0], math.hypot(path[0][0] - path[1][0], path[0][1] - path[1][1]) + 0.01)
path[-1] = _inset(path[-2], path[-1], math.hypot(path[-1][0] - path[-2][0], path[-1][1] - path[-2][1]) + 0.01)
tape = K.ribbon("tape", path, y_t0 + 0.002, y_t1 - 0.002, tape_mat, thick=0.006)

guides = []
for gx in (-GX, GX):
    post = K.cylinder_y("guide", GUIDE_R, Y_BACK - 0.005, y_ff1 + 0.012, gx, GZ, guide_metal,
                        segments=40, bevel=0.006)
    for yy in (y_t0 + 0.012, y_t1 - 0.012):
        fl = K.cylinder_y("gfl", GUIDE_R + 0.022, yy - 0.006, yy + 0.006, gx, GZ, guide_metal,
                          segments=40, bevel=0.003)
        guides.append(fl)
    guides.append(post)
guides = K.join("guides", guides)

# head cover: sits just above the tape run between the guides, its face brushed
HZ0 = GZ - GUIDE_R + 0.012
heads = K.box("heads", 0.46, Y_BACK - y_ff1 + 0.02, 0.27, 0.028, mat=steel,
              loc=(0, (Y_BACK + y_ff1 - 0.02) / 2, HZ0 + 0.135))
# the record lamp: a small round lens on the head cover's face
C.bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.034,
                                       location=(0.13, y_ff1 - 0.02 - 0.002, HZ0 + 0.17))
lamp = C.bpy.context.active_object
lamp.name = "led"
lamp.scale.y = 0.45
lamp.data.materials.append(led)
C.shade(lamp, 60, weighted=False)
# a bezel round the lamp
bezel = K.cylinder_y("bezel", 0.05, y_ff1 - 0.02 - 0.012, y_ff1 - 0.02 + 0.004, 0.13, HZ0 + 0.17,
                     guide_metal, segments=40, bevel=0.006)
heads = K.join("heads", [heads, bezel])

parts = [deck, plinth, reel_left, reel_right, pack_left, pack_right, tape, guides, heads, lamp]
lipped = K.join("plinth", [parts[1], lip])
parts[1] = lipped
plinth = lipped
root = C.empty("record_b", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(-14))
root["led_on_air"] = LED_ON_AIR
C.finish("record_b", root, ACCENT, args, size=2.15, lift=0.0)
