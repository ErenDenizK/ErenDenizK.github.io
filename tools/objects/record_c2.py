"""Record, concept C round 2: the card-catalogue tray simplified to the family's level
(docs/research/2026-10-record-object.md, "Round 2"). The owner liked C's glass tray, blue year
dividers and drawn card, and found round 1 over-detailed. So: a thick clear glass tray with no
hardware, a short stack of thick cards, three blue glass year dividers with large tabs, and one
card drawn high out of the back of the stack, facing the viewer above the tabs. On it a bold waveform turns into a line of
looped handwriting: a voice note becoming an entry. Record blue enters as light: the dividers,
and a soft glow in the tray's floor that lights the stack from inside.
Parts (root "record_c2"): tray (clear glass), glow (the light in the floor), cards (the stack),
dividers (three blue glass year tabs), card (the drawn card with its ink).
The interaction lifts the drawn card a little further, tips it toward the viewer and lets it
settle back; a note lifts it a little, an essay all the way.
Run: <venv>/bin/python tools/objects/record_c2.py [--out DIR] [--samples N]"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common as C  # noqa: E402
import record_kit as K  # noqa: E402

ACCENT = "#8fb8ff"  # Record blue (brief §7)
GLOW = float(os.environ.get("C2_GLOW", "3"))   # the floor light's strength
TURN = float(os.environ.get("C2_TURN", "-15"))   # yaw of the whole object, degrees
LIFT = float(os.environ.get("C2_LIFT", "0.55"))  # how far the card stands out of the stack
POS = os.environ.get("C2_POS", "back")            # drawn from the back of the stack or the front
FROST = float(os.environ.get("C2_FROST", "0.035"))  # tray roughness: clear 0.035, soft frost 0.2

args = C.parse_args()
C.reset()
rng = random.Random(11)
glass = C.glass("glass_clear", "#eef2f8", transmission=0.96, rough=FROST, ior=1.5, coat=0.5,
                thickness=0.08)
blue = C.glass("glass_blue", "#9fc0ff", transmission=0.7, rough=0.12, ior=1.5, coat=0.6,
               thickness=0.04)
CARDS = os.environ.get("C2_CARDS", "paper")   # the stack: "paper" or soft-frost "glass"
if CARDS == "glass":
    # the stack in soft frost, so the drawn card is the one paper and the brightest thing
    stock = C.glass("card_frost", "#e8eef9", transmission=0.85, rough=0.3, ior=1.5, coat=0.3,
                    thickness=0.026)
else:
    stock = C.ceramic("card_stock", "#ece7dc", rough=0.45, coat=0.25)   # satin enamel
# rules in the drawn card's object space (its origin ends up at its centre, z = 0.45)
face = K.ruled_card("card_face", "#efe9dd", "#c6d4ee", "#7fa3e6", pitch=0.16, first=0.18,
                    top=0.33, width=0.06, axis="Z")
ink = C.ceramic("ink", "#1f2a46", rough=0.35, coat=0.4)
glow = C.emissive("glow", ACCENT, strength=GLOW)

# ------------------------------------------------------------------ the tray
W, D, H, T = 1.5, 1.0, float(os.environ.get('C2_H', '0.46')), float(os.environ.get('C2_T', '0.06'))    # outer width (x), depth (y), height, glass wall
outer = K.box("tray", W, D, H, 0.07, mat=glass, loc=(0, 0, H / 2))
inner = K.box("hollow", W - 2 * T, D - 2 * T, H, 0.035, loc=(0, 0, H / 2 + T))
bo = outer.modifiers.new("hollow", "BOOLEAN")
bo.operation = "DIFFERENCE"
bo.object = inner
bo.solver = "EXACT"
for o in C.bpy.context.view_layer.objects:
    o.select_set(o == outer)
C.bpy.context.view_layer.objects.active = outer
C.bpy.ops.object.modifier_apply(modifier="hollow")
C.bpy.data.objects.remove(inner, do_unlink=True)
C.bevel(outer, 0.02, segments=3, angle=40)
C.shade(outer, 35)
tray = outer
# clear glass lets the key through: without caustics a Cycles glass wall would cast a solid
# shadow and leave the stack inside it dark grey (round 2, first renders)
tray.visible_shadow = False

# the light in the floor: a thin panel under the cards, inside the glass floor's top
C.bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, T + 0.002))
light = C.bpy.context.active_object
light.name = "glow"
light.scale = (W - 2 * T - 0.06, D - 2 * T - 0.06, 1)
K.apply_tf(light)
light.data.materials.append(glow)

# ------------------------------------------------------------------ the stack
CW, CH = W - 2 * T - 0.06, 0.66      # card width and height
CT = 0.026                           # thick cards: they read as slabs at 120 px
Z0 = T + 0.004
Y0, Y1 = -D / 2 + T + 0.08, D / 2 - T - (0.14 if POS == "back" else 0.06)


def card_mesh(name, w, h, t, mat, tab=None):
    """A card in the XZ plane, front face towards -y, bottom edge at z=0, optional top tab."""
    outline = C.rounded_rect(w, h, 0.045, cx=0, cy=h / 2, step_deg=10)
    if tab:
        x0, tw, th = tab
        pts = [(-w / 2, 0), (w / 2, 0), (w / 2, h), (x0 + tw, h), (x0 + tw - 0.03, h + th),
               (x0 + 0.03, h + th), (x0, h), (-w / 2, h)]
        outline = C.fillet(pts, [0.045, 0.045, 0.045, 0.02, 0.035, 0.035, 0.02, 0.045],
                           step_deg=10)
    ob = C.outline_solid(name, [outline], t, t * 0.4, bevel_res=2, mat=mat)
    ob.rotation_euler.x = math.radians(90)
    K.apply_tf(ob)
    return ob


# front to back: the newest year first. "d" is a divider, "c" a card
order = os.environ.get("C2_ORDER", "ccdcccdcccdcc")
cards, dividers = [], []
k = 0
for i, kind in enumerate(order):
    y = Y0 + (Y1 - Y0) * i / (len(order) - 1)
    lean = math.radians(-6 + rng.uniform(-1.2, 1.2))
    if kind == "d":
        tab_x = -CW / 2 + 0.06 + k * (CW - 0.12 - 0.36) / 2
        d = card_mesh("divider", CW + 0.01, CH - 0.04, 0.034, blue, tab=(tab_x, 0.36, 0.17))
        d.location = (0, y, Z0)
        d.rotation_euler.x = lean
        dividers.append(d)
        k += 1
        continue
    c = card_mesh("card", CW, CH - rng.uniform(0.0, 0.02), CT, stock)
    c.location = (rng.uniform(-0.005, 0.005), y, Z0)
    c.rotation_euler = (lean, 0, math.radians(rng.uniform(-0.6, 0.6)))
    cards.append(c)
C.bpy.context.view_layer.update()
cards = K.join("cards", cards)
dividers = K.join("dividers", dividers)

# ------------------------------------------------------------------ the drawn card
DW, DH = CW, 0.9          # taller than the stack, so it stands well clear of the tray
FY = Y0 - 0.075 if POS == "front" else Y1 + 0.07
card = card_mesh("card", DW, DH, CT, face)
inks = []
FRONT = -CT / 2 - 0.004   # ink sits on the card's face


def flat(ob):
    ob.rotation_euler.x = math.radians(90)
    K.apply_tf(ob)
    ob.location.y += FRONT
    return ob


def bar(x, h, w=0.03):
    return flat(C.outline_solid("bar", [C.rounded_rect(w, h, w / 2 - 1e-4, cx=x, cy=Z_WAVE,
                                                       step_deg=20)], 0.008, 0.003, bevel_res=1,
                                mat=ink))


def cursive(x0, x1, z, letters=None, amp=0.046, r=0.016, seed=0):
    """Looped handwriting: a prolate cycloid along the line, with letters of uneven size and a
    pen lift between words, drawn as a flattened round stroke."""
    rg = random.Random(seed)
    pts, out, x = [], [], x0
    t = 0.0
    word_len = rg.randint(3, 6)
    n = 0
    while x < x1:
        b = amp * (1.0 + 0.5 * math.sin(n * 1.7 + seed)) if letters is None else letters
        a = 0.6 * amp
        for j in range(16):
            tt = t + 2 * math.pi * j / 16
            # x runs back at the top of each turn (bx > a), so every letter is a loop
            pts.append((x + a * (tt - t) + b * 0.95 * math.sin(tt), 0.0,
                        z + b * 1.1 * (1 + math.cos(tt + math.pi)) * 0.5 + rg.uniform(-0.001, 0.001)))
        x += a * 2 * math.pi
        t += 2 * math.pi
        n += 1
        if n % word_len == 0 or x >= x1:
            if len(pts) > 3:
                tb = C.tube("ink", pts, r, ink, res=3)
                tb.scale.y = 0.35
                K.apply_tf(tb)
                tb.location.y += FRONT
                out.append(tb)
            pts = []
            x += 0.07
            word_len = rg.randint(2, 5)
    return out


# the date heading, above the blue head rule
Z_HEAD = 0.84
inks.append(flat(C.outline_solid("date", [C.rounded_rect(0.34, 0.05, 0.024, cx=-DW / 2 + 0.27,
                                                         cy=Z_HEAD, step_deg=20)], 0.008, 0.003,
                                 bevel_res=1, mat=ink)))
# line one: a waveform that calms into handwriting
Z_WAVE = 0.66
xw0, xw1 = -DW / 2 + 0.11, -DW / 2 + 0.55
nbar = 9
for i in range(nbar):
    x = xw0 + (xw1 - xw0) * i / (nbar - 1)
    env = math.sin(math.pi * (i + 0.7) / (nbar + 0.4)) ** 0.7 * (1 - 0.55 * i / nbar)
    h = 0.03 + 0.2 * env * (0.6 + 0.4 * abs(math.sin(i * 2.1 + 0.4)))
    inks.append(bar(x, h))
inks += cursive(xw1 + 0.05, DW / 2 - 0.12, Z_WAVE - 0.03, seed=1)
inks += cursive(-DW / 2 + 0.11, DW / 2 - 0.2, Z_WAVE - 0.19, seed=2)
inks += cursive(-DW / 2 + 0.11, 0.05, Z_WAVE - 0.35, seed=3)
card = K.join("card", [card, *inks])
card.location = (0, FY, Z0 + LIFT)
card.rotation_euler.x = math.radians(-3)

parts = [tray, light, cards, dividers, card]
root = C.empty("record_c2", parts)
for p in parts:
    C.origin_to_center(p)
root.rotation_euler = (0, 0, math.radians(TURN))
C.finish("record_c2", root, ACCENT, args, size=2.15, lift=0.0)
