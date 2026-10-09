"""Shared pieces for the Record object concepts (record_a/b/c.py, docs/research/
2026-10-record-object.md): finishes the family audit asks for so the objects read crafted
rather than toy-like (C3): brushed and spun metal, paper, a satin tape oxide, ruled card
stock, and a few geometry helpers (ribbons along a 2D path, circle tangents).
Everything here builds on common.py and uses the same rig."""
import math

import bmesh

import common as C

bpy = C.bpy


def _nodes(m):
    nt = m.node_tree
    return nt, nt.nodes, nt.links, nt.nodes["Principled BSDF"]


def brushed(name, color="#d7dade", rough=0.24, axis="X", scale=(1.0, 1.0, 1.0), depth=0.08):
    """Brushed metal: fine scratches along `axis` (object space) as a bump and a roughness
    wobble, so highlights stretch across the grain."""
    m = C.metal(name, color, rough=rough)
    nt, N, L, p = _nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping")
    s = {"X": (2.0, 600.0, 600.0), "Y": (600.0, 2.0, 600.0), "Z": (600.0, 600.0, 2.0)}[axis]
    mp.inputs["Scale"].default_value = tuple(a * b for a, b in zip(s, scale))
    nz = N.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.0
    nz.inputs["Detail"].default_value = 6.0
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = depth
    bump.inputs["Distance"].default_value = 0.002
    ramp = N.new("ShaderNodeMapRange")
    ramp.inputs["To Min"].default_value = rough * 0.75
    ramp.inputs["To Max"].default_value = rough * 1.3
    L.new(tc.outputs["Object"], mp.inputs["Vector"])
    L.new(mp.outputs["Vector"], nz.inputs["Vector"])
    L.new(nz.outputs["Fac"], bump.inputs["Height"])
    L.new(nz.outputs["Fac"], ramp.inputs["Value"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    L.new(ramp.outputs["Result"], p.inputs["Roughness"])
    return m


def spun(name, color="#d7dade", rough=0.2, rings=900.0, depth=0.1, axis="Z"):
    """Spun (lathe-turned) metal or a wound pack: concentric rings round the object's `axis`."""
    m = C.metal(name, color, rough=rough)
    _rings(m, rings, depth, rough, axis)
    return m


def _rings(m, rings, depth, rough, axis="Z"):
    nt, N, L, p = _nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    a, b = {"Z": ("X", "Y"), "Y": ("X", "Z"), "X": ("Y", "Z")}[axis]
    comb = N.new("ShaderNodeCombineXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    L.new(sep.outputs[a], comb.inputs["X"])
    L.new(sep.outputs[b], comb.inputs["Y"])
    ln = N.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    L.new(comb.outputs[0], ln.inputs[0])
    nz = N.new("ShaderNodeTexNoise")
    nz.noise_dimensions = "1D"
    nz.inputs["Scale"].default_value = rings
    nz.inputs["Detail"].default_value = 4.0
    L.new(ln.outputs["Value"], nz.inputs["W"])
    bump = N.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = depth
    bump.inputs["Distance"].default_value = 0.002
    L.new(nz.outputs["Fac"], bump.inputs["Height"])
    L.new(bump.outputs["Normal"], p.inputs["Normal"])
    if rough is not None:
        ramp = N.new("ShaderNodeMapRange")
        ramp.inputs["To Min"].default_value = rough * 0.7
        ramp.inputs["To Max"].default_value = rough * 1.35
        L.new(nz.outputs["Fac"], ramp.inputs["Value"])
        L.new(ramp.outputs["Result"], p.inputs["Roughness"])


def tape_oxide(name, color="#3b2c24", rough=0.38, axis="Z"):
    """The wound tape pack: a dark, warm satin oxide with fine winding rings round local Z."""
    m, p = C._principled(name)
    p.inputs["Base Color"].default_value = C.lin(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.6
    p.inputs["Coat Weight"].default_value = 0.15
    _rings(m, 2400.0, 0.05, rough, axis)
    return m


def paper(name, color="#ece7dc", rough=0.62, sheen=0.25):
    m, p = C._principled(name)
    p.inputs["Base Color"].default_value = C.lin(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.3
    p.inputs["Sheen Weight"].default_value = sheen
    p.inputs["Subsurface Weight"].default_value = 0.08
    p.inputs["Subsurface Radius"].default_value = (0.02, 0.02, 0.02)
    return m


def ruled_card(name, paper_color, rule_color, head_color, pitch, first, top, width=0.12,
               axis="Z"):
    """Index-card stock: rules every `pitch` (object units along `axis`) below `first`, and a
    heading rule at `top`, printed into the base colour."""
    m = paper(name, paper_color)
    nt, N, L, p = _nodes(m)
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    coord = sep.outputs[axis]

    def math_(op, a, b=None):
        n = N.new("ShaderNodeMath")
        n.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                n.inputs[i].default_value = v
            else:
                L.new(v, n.inputs[i])
        return n.outputs[0]

    # rules: frac((first - z) / pitch) < width, only below `first`
    t = math_("DIVIDE", math_("SUBTRACT", first, coord), pitch)
    fr = math_("FRACT", t)
    tri = math_("MINIMUM", fr, math_("SUBTRACT", 1.0, fr))
    rule = math_("LESS_THAN", tri, width / 2)
    below = math_("GREATER_THAN", t, -width / 2)
    rule = math_("MULTIPLY", rule, below)
    head = math_("LESS_THAN", math_("ABSOLUTE", math_("SUBTRACT", coord, top)), pitch * width * 0.6)
    mixr = N.new("ShaderNodeMix")
    mixr.data_type = "RGBA"
    mixr.inputs["A"].default_value = C.lin(paper_color)
    mixr.inputs["B"].default_value = C.lin(rule_color)
    L.new(rule, mixr.inputs["Factor"])
    mixh = N.new("ShaderNodeMix")
    mixh.data_type = "RGBA"
    L.new(mixr.outputs["Result"], mixh.inputs["A"])
    mixh.inputs["B"].default_value = C.lin(head_color)
    L.new(head, mixh.inputs["Factor"])
    L.new(mixh.outputs["Result"], p.inputs["Base Color"])
    return m


def rubber(name, color="#17181b", rough=0.55):
    m, p = C._principled(name)
    p.inputs["Base Color"].default_value = C.lin(color)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.35
    return m


# ---------------------------------------------------------------- geometry

def box(name, w, d, h, r, bevel_res=4, mat=None, loc=(0, 0, 0)):
    """A rounded box: w (x) by d (y) by h (z), outline in XZ extruded along Y, edges rounded
    by `r`, centred on `loc`."""
    ob = C.outline_solid(name, [C.rounded_rect(w, h, min(r * 2, min(w, h) / 2 - 1e-3),
                                               step_deg=10)],
                         d, r, bevel_res=bevel_res, mat=mat)
    ob.rotation_euler.x = math.radians(90)
    ob.location = loc
    C.bpy.context.view_layer.update()
    apply_tf(ob)
    return ob


def apply_tf(ob):
    for o in bpy.context.view_layer.objects:
        o.select_set(o == ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    return ob


def cylinder_y(name, r, y0, y1, x, z, mat=None, segments=48, bevel=0.0):
    """A cylinder along Y (towards the camera is -Y) at (x, z), lathed with optional round
    edges."""
    y0, y1 = min(y0, y1), max(y0, y1)
    prof = [(0.0, y0)]
    if bevel:
        prof += [(r - bevel, y0)] + [(r - bevel + bevel * math.sin(a), y0 + bevel - bevel * math.cos(a))
                                     for a in [math.pi / 2 * i / 4 for i in range(1, 5)]]
        prof += [(r - bevel + bevel * math.cos(a), y1 - bevel + bevel * math.sin(a))
                 for a in [math.pi / 2 * i / 4 for i in range(0, 5)]]
        prof += [(0.0, y1)]
    else:
        prof += [(r, y0), (r, y1), (0.0, y1)]
    ob = C.lathe(name, C.dedupe(prof), segments, mat, 40)
    ob.rotation_euler.x = math.radians(-90)
    bpy.context.view_layer.update()
    apply_tf(ob)  # -90 deg about X maps the lathe's +Z onto +Y, so y0..y1 holds
    ob.location = (x, 0, z)
    bpy.context.view_layer.update()
    return ob


def ribbon(name, path, y0, y1, mat=None, thick=0.0):
    """A flat band through the 2D path [(x, z), ...] spanning y0..y1 (tape across a deck)."""
    bm = bmesh.new()
    a = [bm.verts.new((x, y0, z)) for x, z in path]
    b = [bm.verts.new((x, y1, z)) for x, z in path]
    for i in range(len(path) - 1):
        bm.faces.new((a[i], a[i + 1], b[i + 1], b[i]))
    ob = C.mesh_from_bm(name, bm, mat, smooth_angle=30)
    if thick:
        md = ob.modifiers.new("solid", "SOLIDIFY")
        md.thickness = thick
        md.offset = 0
        ob.modifiers.move(len(ob.modifiers) - 1, 0)
    return ob


def tangent(c1, r1, c2, r2, side):
    """Outer tangent of two circles (2D) on `side` (+1 left of c1->c2, -1 right).
    Returns (p1, p2, n) with n the shared outward normal."""
    dx, dy = c2[0] - c1[0], c2[1] - c1[1]
    L = math.hypot(dx, dy)
    phi = math.atan2(dy, dx)
    a = math.acos((r1 - r2) / L)
    t = phi + side * a
    n = (math.cos(t), math.sin(t))
    return ((c1[0] + r1 * n[0], c1[1] + r1 * n[1]), (c2[0] + r2 * n[0], c2[1] + r2 * n[1]), n)


def inner_tangent(c1, r1, c2, r2, side):
    """Crossing tangent of two circles: leaves c1 on its `side` normal and meets c2 opposite."""
    dx, dy = c2[0] - c1[0], c2[1] - c1[1]
    L = math.hypot(dx, dy)
    phi = math.atan2(dy, dx)
    a = math.acos((r1 + r2) / L)
    t = phi + side * a
    n = (math.cos(t), math.sin(t))
    return ((c1[0] + r1 * n[0], c1[1] + r1 * n[1]), (c2[0] - r2 * n[0], c2[1] - r2 * n[1]), n)


def arc_pts(c, r, a0, a1, step_deg=6):
    return C.arc(c[0], c[1], r, math.degrees(a0), math.degrees(a1), step_deg=step_deg)


def join(name, obs):
    for o in bpy.context.view_layer.objects:
        o.select_set(o in obs)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    return ob
