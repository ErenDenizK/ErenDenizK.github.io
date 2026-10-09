"""Record, concept C: a card-catalogue tray in glass (docs/research/2026-10-record-object.md).
The Record is a dated file of entries kept for years; a reading room keeps it in a drawer of
index cards. Year dividers stand up in Record blue; the front card is half drawn out, and on
its first rule a short waveform turns into handwriting: a voice note becoming an entry.
Parts (root "record_c"): tray (clear glass drawer), cards (the stack), dividers (four blue
glass year tabs), card (the drawn card with its ink), rod (the catalogue rod and its knob),
plate (steel label holder and pull on the front), follower (the steel block at the back).
The interaction draws the card up out of the stack and lets it settle back.
Run: <venv>/bin/python tools/objects/record_c.py [--out DIR] [--samples N]"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"  # Record blue (brief §7)

args = C.parse_args()
C.reset()
rng = random.Random(7)
glass = C.glass("glass_clear", "#e9eef8", transmission=0.95, rough=0.04, ior=1.5, coat=0.5,
                thickness=0.05)
blue = C.glass("glass_blue", "#a9c6ff", transmission=0.78, rough=0.08, ior=1.5, coat=0.6,
               thickness=0.02)
steel = K.brushed("steel_brushed", "#d6d9de", rough=0.22, axis="X")
polished = C.metal("steel_satin", "#e6e8ec", rough=0.26)
stock = K.paper("card_stock", "#e9e3d6", rough=0.7)
ink = C.ceramic("ink", "#1d2740", rough=0.35, coat=0.3)

# ------------------------------------------------------------------ the tray
W, D, H, T = 1.28, 2.0, 0.5, 0.05    # outer width (x), depth (y), height, glass wall
outer = K.box("tray", W, D, H, 0.03, mat=glass, loc=(0, 0, H / 2))
inner = K.box("hollow", W - 2 * T, D - 2 * T, H, 0.012, loc=(0, 0, H / 2 + T))
outer.modifiers.clear()
inner.modifiers.clear()
bo = outer.modifiers.new("hollow", "BOOLEAN")
bo.operation = "DIFFERENCE"
bo.object = inner
bo.solver = "EXACT"
for o in C.bpy.context.view_layer.objects:
    o.select_set(o == outer)
C.bpy.context.view_layer.objects.active = outer
C.bpy.ops.object.modifier_apply(modifier="hollow")
C.bpy.data.objects.remove(inner, do_unlink=True)
C.bpy.context.view_layer.update()
outer.modifiers.clear()
C.bevel(outer, 0.01, segments=3, angle=40)
C.shade(outer, 35)
tray = outer

# ------------------------------------------------------------------ the cards
CW, CH, CT = W - 2 * T - 0.05, 0.66, 0.007   # 5 x 3 in card, landscape
Y0, Y1 = -D / 2 + T + 0.2, D / 2 - T - 0.24   # the stack, front to back
Z0 = T + 0.005


def card_mesh(name, w, h, mat, tab=None, t=CT):
    """A thin card in the XZ plane (faces -y), bottom edge at z=0, optional tab on top."""
    outline = C.rounded_rect(w, h, 0.03, cx=0, cy=h / 2, step_deg=15)
    if tab:
        x0, tw, th = tab
        pts = [(-w / 2, 0), (w / 2, 0), (w / 2, h), (x0 + tw, h), (x0 + tw - 0.02, h + th),
               (x0 + 0.02, h + th), (x0, h), (-w / 2, h)]
        outline = C.fillet(pts, [0.02, 0.02, 0.02, 0.0, 0.02, 0.02, 0.0, 0.02], step_deg=15)
    ob = C.outline_solid(name, [outline], t, t * 0.45, bevel_res=1, mat=mat)
    ob.rotation_euler.x = math.radians(90)
    K.apply_tf(ob)
    return ob


cards = []
N = 70
dividers = []
div_at = {10: 0, 27: 1, 44: 2, 60: 3}   # four years of entries, the newest at the front
for i in range(N):
    y = Y0 + (Y1 - Y0) * i / (N - 1)
    if i in div_at:
        k = div_at[i]
        tab_x = -CW / 2 + 0.08 + k * (CW - 0.36) / 3
        d = card_mesh("divider", CW + 0.01, CH - 0.02, blue, tab=(tab_x, 0.2, 0.13), t=0.014)
        d.location = (0, y, Z0)
        d.rotation_euler.x = math.radians(-4 + rng.uniform(-1, 1))
        dividers.append(d)
        continue
    c = card_mesh("card", CW, CH - rng.uniform(0, 0.012), stock)
    c.location = (rng.uniform(-0.006, 0.006), y, Z0)
    c.rotation_euler = (math.radians(-5 + rng.uniform(-2.2, 2.2)), 0,
                        math.radians(rng.uniform(-0.5, 0.5)))
    cards.append(c)
C.bpy.context.view_layer.update()
cards = K.join("cards", cards)
dividers = K.join("dividers", dividers)

# ------------------------------------------------------------------ the drawn card
rule = K.ruled_card("card_ruled", "#ece6d9", "#9fb9e6", "#6f93d6", pitch=0.075, first=0.43 - CH / 2,
                    top=0.53 - CH / 2, width=0.1, axis="Z")  # object space: centred on the card
FRONT_Y = Y0 - 0.06
LIFT = 0.36
card = card_mesh("card", CW, CH, rule)
card.location = (0, FRONT_Y, Z0 + LIFT)
strokes = []


def stroke(x0, x1, z, w=0.0085):
    s = C.outline_solid("ink", [C.rounded_rect(x1 - x0, w, w / 2 - 1e-4, cx=(x0 + x1) / 2, cy=z,
                                               step_deg=30)], 0.004, 0.0015, bevel_res=1, mat=ink)
    s.rotation_euler.x = math.radians(90)
    K.apply_tf(s)
    s.location = (0, FRONT_Y - CT / 2 - 0.0015, Z0 + LIFT)
    return s


def words(x0, x1, z):
    """A written line: words of uneven length with small gaps and a wandering baseline, so it
    reads as handwriting rather than an interface's placeholder bar (round 1)."""
    out, x = [], x0
    while x < x1 - 0.03:
        wlen = min(rng.choice((0.05, 0.09, 0.13, 0.2)) * rng.uniform(0.8, 1.2), x1 - x)
        out.append(stroke(x, x + wlen, z + rng.uniform(-0.003, 0.003)))
        x += wlen + rng.uniform(0.016, 0.024)
    return out


# the heading: a date, as a short and a long stroke
strokes += [stroke(-CW / 2 + 0.08, -CW / 2 + 0.24, 0.56), stroke(-CW / 2 + 0.29, -CW / 2 + 0.46, 0.56)]
# the first rule: a waveform that turns into writing
xw0, xw1 = -CW / 2 + 0.08, -CW / 2 + 0.48
nbar = 15
for i in range(nbar):
    x = xw0 + (xw1 - xw0) * i / (nbar - 1)
    env = math.sin(math.pi * (i + 0.6) / (nbar + 0.2)) ** 0.8
    h = 0.012 + 0.07 * env * (0.55 + 0.45 * abs(math.sin(i * 2.3)))
    s = C.outline_solid("bar", [C.rounded_rect(0.012, h, 0.0059, cx=x, cy=0.45, step_deg=30)],
                        0.004, 0.0015, bevel_res=1, mat=ink)
    s.rotation_euler.x = math.radians(90)
    K.apply_tf(s)
    s.location = (0, FRONT_Y - CT / 2 - 0.0015, Z0 + LIFT)
    strokes.append(s)
strokes += words(xw1 + 0.05, CW / 2 - 0.1, 0.45)
for j, (a, b) in enumerate([(-0.48, 0.38), (-0.48, 0.12), (-0.48, 0.42)]):
    strokes += words(a, b, 0.45 - 0.075 * (j + 1))
card = K.join("card", [card, *strokes])

# ------------------------------------------------------------------ hardware
ROD_Z = Z0 + 0.09
rod = K.cylinder_y("rod", 0.016, -D / 2 + 0.01, D / 2 - T - 0.02, 0, ROD_Z, polished, segments=24)
knob = K.cylinder_y("knob", 0.05, -D / 2 - 0.08, -D / 2 + 0.002, 0, ROD_Z, polished, segments=48,
                    bevel=0.014)
rod = K.join("rod", [rod, knob])

# label holder (a frame with a card in it) and a cup pull on the front wall
FY = -D / 2
holder = C.outline_solid("holder", [C.rounded_rect(0.44, 0.17, 0.02, step_deg=15),
                                    list(reversed(C.rounded_rect(0.38, 0.11, 0.008, step_deg=15)))],
                         0.018, 0.005, bevel_res=2, mat=steel)
holder.rotation_euler.x = math.radians(90)
holder.location = (0, FY - 0.009, H - 0.17)
K.apply_tf(holder)
label = C.outline_solid("label", [C.rounded_rect(0.39, 0.12, 0.006, step_deg=15)], 0.004, 0.001,
                        bevel_res=1, mat=stock)
label.rotation_euler.x = math.radians(90)
label.location = (0, FY - 0.004, H - 0.17)
K.apply_tf(label)
pull_prof = [(0.0, 0.0), (0.075, 0.0), (0.09, 0.006), (0.095, 0.02), (0.085, 0.03), (0.06, 0.012),
             (0.0, 0.012)]
pull = C.lathe("pull", pull_prof, 48, polished, 40)
pull.rotation_euler.x = math.radians(90)
K.apply_tf(pull)
pull.location = (0, FY, ROD_Z + 0.0)
plate = K.join("plate", [holder, label, pull])

follower = K.box("follower", CW - 0.02, 0.05, 0.42, 0.012, mat=steel,
                 loc=(0, Y1 + 0.06, Z0 + 0.21))
follower.rotation_euler.x = math.radians(-8)

parts = [tray, cards, dividers, card, rod, plate, follower]
root = C.empty("record_c", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(-28))
C.finish("record_c", root, ACCENT, args, size=2.1, lift=0.0)
