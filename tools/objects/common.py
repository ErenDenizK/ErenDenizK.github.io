"""Shared pieces for the hero object scripts (ADR-0005): materials, geometry helpers, the
lighting rig for Cycles posters, GLB export and optimisation.

Every value that must match the real-time page (camera, lights, studio HDRI, tone mapping,
exposure, ground) comes from rig.json, which prototypes/e-dark/objects/rig.js embeds too.
See README.md for how to run.
"""
import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time

import bpy  # noqa: I001 (bpy must be imported before bmesh)
import bmesh
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
RIG = json.load(open(os.path.join(HERE, "rig.json")))
DEFAULT_OUT = os.path.join(REPO, "prototypes", "e-dark", "objects")
FONT_DIRS = ["/usr/share/fonts/opentype/inter", os.path.expanduser("~/.fonts")]


# ---------------------------------------------------------------- colour and space

def lin(hex_color, alpha=1.0):
    """sRGB hex -> linear RGBA tuple (Blender colour sockets are scene linear)."""
    h = hex_color.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, alpha)


def b3(v):
    """three.js (y up, camera on +z) -> Blender (z up, camera on -y)."""
    return Vector((v[0], -v[2], v[1]))


# ---------------------------------------------------------------- arguments / scene

def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--samples", type=int, default=int(os.environ.get("SAMPLES", 160)))
    ap.add_argument("--res", type=int, default=1200)
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--no-export", action="store_true")
    ap.add_argument("--blend", help="also save the .blend here (for inspection)")
    return ap.parse_args(argv)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def link(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob


# ---------------------------------------------------------------- materials

def _principled(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    if p is None:
        p = nt.nodes.new("ShaderNodeBsdfPrincipled")
        nt.links.new(p.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m, p


def _gltf_output_group():
    """The 'glTF Material Output' node group the exporter reads thickness from."""
    g = bpy.data.node_groups.get("glTF Material Output")
    if g:
        return g
    g = bpy.data.node_groups.new("glTF Material Output", "ShaderNodeTree")
    # The exporter only reads this group from the original (not inlined) material, and it
    # skips inlining when the group has an Occlusion input, as Blender's own group does.
    g.interface.new_socket("Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    g.interface.new_socket("Thickness", in_out="INPUT", socket_type="NodeSocketFloat")
    g.nodes.new("NodeGroupInput")
    return g


def glass(name, color="#ffffff", transmission=1.0, rough=0.04, ior=1.45, coat=0.0,
          thickness=0.0, absorb=None, density=0.0, spec=0.5):
    """Clear or tinted glass. `transmission` < 1 leaves a diffuse body in `color` so tinted glass
    still reads on a black ground. `thickness` (in modelling units, before fit() scales the root) becomes
    KHR_materials_volume, so three.js refracts; `absorb`/`density` tint the volume in both."""
    m, p = _principled(name)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Transmission Weight"].default_value = transmission
    p.inputs["Roughness"].default_value = rough
    p.inputs["IOR"].default_value = ior
    p.inputs["Specular IOR Level"].default_value = spec
    if coat:
        p.inputs["Coat Weight"].default_value = coat
        p.inputs["Coat Roughness"].default_value = 0.02
    nt = m.node_tree
    if thickness:
        gn = nt.nodes.new("ShaderNodeGroup")
        gn.node_tree = _gltf_output_group()
        gn.inputs["Thickness"].default_value = thickness
    if absorb and density:
        va = nt.nodes.new("ShaderNodeVolumeAbsorption")
        va.inputs["Color"].default_value = lin(absorb)
        va.inputs["Density"].default_value = density
        nt.links.new(va.outputs[0], nt.nodes["Material Output"].inputs["Volume"])
    return m


def metal(name, color="#d9dbe0", rough=0.22, aniso=0.0):
    m, p = _principled(name)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = rough
    return m


def ceramic(name, color="#f2efe9", rough=0.32, coat=0.7):
    """Glazed ceramic / enamel: diffuse body under a clear coat."""
    m, p = _principled(name)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Roughness"].default_value = rough
    if coat:
        p.inputs["Coat Weight"].default_value = coat
        p.inputs["Coat Roughness"].default_value = 0.04
    return m


def emissive(name, color, strength=4.0):
    """A small light (an LED): exported as emissive + KHR_materials_emissive_strength."""
    m, p = _principled(name)
    p.inputs["Base Color"].default_value = lin(color)
    p.inputs["Emission Color"].default_value = lin(color)
    p.inputs["Emission Strength"].default_value = strength
    p.inputs["Roughness"].default_value = 0.3
    return m


# ---------------------------------------------------------------- 2D outlines

def arc(cx, cy, r, a0, a1, n=None, step_deg=6.0):
    """Points on an arc from angle a0 to a1 (degrees), inclusive."""
    if n is None:
        n = max(2, int(abs(a1 - a0) / step_deg) + 1)
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / (n - 1))),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / (n - 1)))) for i in range(n)]


def rounded_rect(w, h, r, cx=0.0, cy=0.0, step_deg=6.0):
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    pts = []
    pts += arc(x1 - r, y0 + r, r, -90, 0, step_deg=step_deg)
    pts += arc(x1 - r, y1 - r, r, 0, 90, step_deg=step_deg)
    pts += arc(x0 + r, y1 - r, r, 90, 180, step_deg=step_deg)
    pts += arc(x0 + r, y0 + r, r, 180, 270, step_deg=step_deg)
    return pts


def fillet(poly, radii, step_deg=6.0):
    """Round the corners of a closed polygon; `radii` is one radius or one per vertex (0 = keep
    the corner sharp)."""
    n = len(poly)
    if not isinstance(radii, (list, tuple)):
        radii = [radii] * n
    out = []
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        r = radii[i]
        if r <= 0:
            out.append(tuple(p1))
            continue
        a = (p0 - p1).normalized()
        b = (p2 - p1).normalized()
        theta = a.angle(b)
        # never let a corner eat more than half of either neighbouring edge
        d = min(r / math.tan(theta / 2), 0.5 * (p0 - p1).length, 0.5 * (p2 - p1).length)
        r = d * math.tan(theta / 2)
        t0, t1 = p1 + a * d, p1 + b * d
        bis = (a + b).normalized()
        c = p1 + bis * (r / math.sin(theta / 2))
        a0 = math.degrees(math.atan2(t0.y - c.y, t0.x - c.x))
        a1 = math.degrees(math.atan2(t1.y - c.y, t1.x - c.x))
        cross = a.x * b.y - a.y * b.x
        if cross < 0:  # convex corner of a counter-clockwise outline: sweep counter-clockwise
            while a1 < a0:
                a1 += 360
        else:
            while a1 > a0:
                a1 -= 360
        out += arc(c.x, c.y, r, a0, a1, step_deg=step_deg)
    return out


def dedupe(pts, eps=1e-5):
    out = []
    for p in pts:
        if not out or (abs(p[0] - out[-1][0]) > eps or abs(p[1] - out[-1][1]) > eps):
            out.append(p)
    if len(out) > 2 and abs(out[0][0] - out[-1][0]) < eps and abs(out[0][1] - out[-1][1]) < eps:
        out.pop()
    return out


def outline_solid(name, outlines, depth, bevel, bevel_res=5, mat=None, z=0.0):
    """Extrude closed 2D outlines (first = outer, rest = holes, counter-clockwise outer) into a
    solid lying in the XY plane, front face at z + depth/2, with a round bevel of radius
    `bevel` that stays inside the outline (curve offset)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = max(depth / 2 - bevel, 0.0)
    cu.bevel_depth = bevel
    cu.bevel_resolution = bevel_res
    cu.offset = -bevel
    for pts in outlines:
        pts = dedupe(pts)
        sp = cu.splines.new("POLY")
        sp.points.add(len(pts) - 1)
        for p, (x, y) in zip(sp.points, pts):
            p.co = (x, y, 0, 1)
        sp.use_cyclic_u = True
        sp.use_smooth = True
    ob = link(bpy.data.objects.new(name, cu))
    ob.location.z = z
    if mat:
        cu.materials.append(mat)
    return to_mesh(ob)


def text_solid(name, body, font, size, depth, bevel, bevel_res=4, mat=None, res_u=10,
               spacing=1.0, align="CENTER"):
    """Extruded, bevelled text in the XY plane (reads along +X, up = +Y, front = +Z)."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = font
    cu.size = size
    cu.extrude = max(depth / 2 - bevel, 0.0)
    cu.bevel_depth = bevel
    cu.bevel_resolution = bevel_res
    cu.offset = -bevel
    cu.resolution_u = res_u
    cu.space_character = spacing
    cu.align_x = align
    cu.align_y = "BOTTOM_BASELINE"
    ob = link(bpy.data.objects.new(name, cu))
    if mat:
        cu.materials.append(mat)
    return to_mesh(ob)


def load_font(names=("InterDisplay-Bold.otf",)):
    for d in FONT_DIRS:
        for n in names:
            p = os.path.join(d, n)
            if os.path.exists(p):
                return bpy.data.fonts.load(p)
    print("font not found, using Blender's built-in font", file=sys.stderr)
    return bpy.data.fonts.load("<builtin>")


# ---------------------------------------------------------------- mesh helpers

def to_mesh(ob):
    """Convert a curve/text object to a mesh in place and give it crisp shading."""
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob = bpy.context.view_layer.objects.active
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(ob.data)
    bm.free()
    return shade(ob)


def shade(ob, angle=40, weighted=True):
    me = ob.data
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(angle))
    if weighted:
        wn = ob.modifiers.new("weighted", "WEIGHTED_NORMAL")
        wn.keep_sharp = True
        wn.weight = 50
    return ob


def bevel(ob, width, segments=4, angle=35):
    md = ob.modifiers.new("bevel", "BEVEL")
    md.width = width
    md.segments = segments
    md.limit_method = "ANGLE"
    md.angle_limit = math.radians(angle)
    md.harden_normals = False
    # keep the bevel before the weighted-normal pass
    ob.modifiers.move(len(ob.modifiers) - 1, 0)
    return ob


def mesh_from_bm(name, bm, mat=None, smooth_angle=40):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if mat:
        me.materials.append(mat)
    return shade(ob, smooth_angle)


def lathe(name, profile, segments=48, mat=None, smooth_angle=50):
    """Revolve a (radius, height) profile around the Z axis. Ends on the axis are capped by
    the profile itself (start/finish with radius 0)."""
    bm = bmesh.new()
    rings = []
    closed = len(profile) > 2 and (Vector(profile[0]) - Vector(profile[-1])).length < 1e-6
    if closed:  # a closed profile (a shell): the last ring is the first one
        profile = profile[:-1]
    for (r, z) in profile:
        if r < 1e-6:
            rings.append([bm.verts.new((0, 0, z))])
        else:
            rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / segments),
                                        r * math.sin(2 * math.pi * i / segments), z))
                          for i in range(segments)])
    pairs = list(zip(rings, rings[1:])) + ([(rings[-1], rings[0])] if closed else [])
    for a, b in pairs:
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1:
            for i in range(segments):
                bm.faces.new((a[0], b[(i + 1) % segments], b[i]))
        elif len(b) == 1:
            for i in range(segments):
                bm.faces.new((a[i], a[(i + 1) % segments], b[0]))
        else:
            for i in range(segments):
                bm.faces.new((a[i], a[(i + 1) % segments], b[(i + 1) % segments], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_from_bm(name, bm, mat, smooth_angle)


def tube(name, pts, radius, mat=None, res=6, closed=False, res_u=1):
    """A round wire along a 3D polyline (points already dense where it bends)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    cu.resolution_u = res_u
    cu.twist_mode = "MINIMUM"
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, (x, y, z) in zip(sp.points, pts):
        p.co = (x, y, z, 1)
    sp.use_cyclic_u = closed
    sp.use_smooth = True
    ob = link(bpy.data.objects.new(name, cu))
    if mat:
        cu.materials.append(mat)
    return to_mesh(ob)


def parent(children, root):
    for c in children:
        c.parent = root
    return root


def empty(name, children=()):
    ob = link(bpy.data.objects.new(name, None))
    parent(children, ob)
    return ob


def descendants(ob):
    out = []
    for c in ob.children:
        out.append(c)
        out += descendants(c)
    return out


def world_bbox(obs):
    dg = bpy.context.evaluated_depsgraph_get()
    lo = Vector((1e9, 1e9, 1e9))
    hi = -lo
    for o in obs:
        if o.type != "MESH":
            continue
        ev = o.evaluated_get(dg)
        for v in ev.data.vertices:
            w = ev.matrix_world @ v.co
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def fit(root, size=None, lift=0.0, center_depth=True):
    """Scale `root` so the object's larger of width/height is `size` (rig.json fit.size), centre
    it on X (and depth), and stand its lowest point `lift` above the floor."""
    size = size or RIG["fit"]["size"]
    bpy.context.view_layer.update()
    lo, hi = world_bbox(descendants(root))
    dim = hi - lo
    s = size / max(dim.x, dim.z)
    root.scale = root.scale * s
    bpy.context.view_layer.update()
    lo, hi = world_bbox(descendants(root))
    c = (lo + hi) / 2
    root.location.x -= c.x
    if center_depth:
        root.location.y -= c.y
    root.location.z += RIG["fit"]["floor"] + lift - lo.z
    bpy.context.view_layer.update()
    return s


def stage(root, backlight=1.0):
    """Camera and backlight for this object, in three.js coordinates. Stored on the root as
    glTF extras ("stage") so rig.js frames and lights the object exactly like the poster."""
    lo, hi = world_bbox(descendants(root))
    c3 = [(lo.x + hi.x) / 2, (lo.z + hi.z) / 2, -(lo.y + hi.y) / 2]
    dim = hi - lo
    extent = max(dim.x, dim.z)
    cam = RIG["camera"]
    d = Vector(cam["position"]) - Vector(cam["target"])
    d.normalize()
    dist = (extent / 2) / (RIG["frame"]["fill"] * math.tan(math.radians(cam["fov"]) / 2))
    dist += max(dim.y, 0) / 2
    pos = Vector(c3) + d * dist
    bl = RIG["backlight"]
    back = Vector(c3) - d * bl["behind"] * extent / 2
    st = {
        "camera": {"fov": cam["fov"], "position": [round(v, 4) for v in pos],
                   "target": [round(v, 4) for v in c3]},
        "backlight": {"center": [round(v, 4) for v in back],
                      "normal": [round(v, 4) for v in d],
                      "radius": round(bl["radius"] * extent, 4),
                      "intensity": round(bl["intensity"] * backlight, 4)},
    }
    root["stage"] = st
    return st


def tri_count(obs):
    dg = bpy.context.evaluated_depsgraph_get()
    n = 0
    for o in obs:
        if o.type == "MESH":
            me = o.evaluated_get(dg).to_mesh()
            me.calc_loop_triangles()
            n += len(me.loop_triangles)
            o.evaluated_get(dg).to_mesh_clear()
    return n


# ---------------------------------------------------------------- export

def export_glb(root, path):
    """GLB of `root` and its descendants (modifiers applied, names kept), then meshopt."""
    for o in bpy.context.view_layer.objects:
        o.select_set(o == root or o in descendants(root))
    raw = path.replace(".glb", ".raw.glb")
    bpy.ops.export_scene.gltf(
        filepath=raw, export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_extras=True, export_cameras=False, export_lights=False,
        export_texcoords=False, export_normals=True, export_attributes=False)
    tool = os.environ.get("GLTF_TRANSFORM")
    cmd = [tool] if tool else ["npx", "-y", "@gltf-transform/cli@4"]
    subprocess.run(cmd + [
        "optimize", raw, path, "--compress", "meshopt", "--texture-compress", "false",
        "--simplify", "false", "--join", "false", "--flatten", "false", "--instance", "false",
        "--palette", "false"], check=True, stdout=subprocess.DEVNULL)
    os.remove(raw)
    return os.path.getsize(path)


# ---------------------------------------------------------------- Cycles poster

def setup_render(accent, samples, res, st):
    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    cy = scn.cycles
    cy.device = "CPU"
    cy.samples = samples
    cy.use_denoising = True
    cy.max_bounces = 24
    cy.transmission_bounces = 24
    cy.glossy_bounces = 8
    cy.diffuse_bounces = 3
    cy.transparent_max_bounces = 16
    # three.js has no caustics; without them Cycles' glass shadows and floor match it too
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 0.5
    scn.render.resolution_x = scn.render.resolution_y = res
    scn.render.film_transparent = True
    scn.view_settings.view_transform = {
        "neutral": "Khronos PBR Neutral", "agx": "AgX", "aces": "AgX"}[RIG["toneMapping"]]
    scn.view_settings.look = "None"
    scn.view_settings.exposure = math.log2(RIG["exposure"])
    scn.render.image_settings.file_format = "PNG"
    scn.render.image_settings.color_mode = "RGBA"
    scn.render.image_settings.color_depth = "16"

    # World: the shared studio HDRI for lighting and reflections; rays leaving through glass
    # see the ground colour instead, as three.js transmission does (it samples the page).
    w = bpy.data.worlds.new("studio")
    scn.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputWorld")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    # studio.hdr is written in three.js equirect convention; checked with calib.py (chrome
    # ball), Blender's world lookup then needs no extra rotation.
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(os.path.join(HERE, "studio.hdr"))
    env.interpolation = "Linear"
    bg_env = nt.nodes.new("ShaderNodeBackground")
    bg_flat = nt.nodes.new("ShaderNodeBackground")
    bg_flat.inputs["Color"].default_value = lin(RIG["ground"])
    lp = nt.nodes.new("ShaderNodeLightPath")
    mx = nt.nodes.new("ShaderNodeMath")
    mx.operation = "MAXIMUM"
    mix = nt.nodes.new("ShaderNodeMixShader")
    L = nt.links
    L.new(tc.outputs["Generated"], env.inputs["Vector"])
    L.new(env.outputs["Color"], bg_env.inputs["Color"])
    # ...but only straight through glass: once a path has been reflected (a metal part seen
    # inside a glass shell), the environment shows, as it does for opaque parts in three.js
    nog = nt.nodes.new("ShaderNodeMath")
    nog.operation = "LESS_THAN"
    nog.inputs[1].default_value = 0.5
    tr = nt.nodes.new("ShaderNodeMath")
    tr.operation = "MULTIPLY"
    L.new(lp.outputs["Glossy Depth"], nog.inputs[0])
    L.new(lp.outputs["Is Transmission Ray"], tr.inputs[0])
    L.new(nog.outputs[0], tr.inputs[1])
    L.new(lp.outputs["Is Camera Ray"], mx.inputs[0])
    L.new(tr.outputs[0], mx.inputs[1])
    L.new(mx.outputs[0], mix.inputs["Fac"])
    L.new(bg_env.outputs[0], mix.inputs[1])
    L.new(bg_flat.outputs[0], mix.inputs[2])
    L.new(mix.outputs[0], out.inputs["Surface"])

    lights = RIG["lights"]
    for key, color in (("key", lights["key"]["color"]), ("rim", accent)):
        spec = lights[key]
        ld = bpy.data.lights.new(key, "SUN")
        ld.energy = spec["intensity"]
        ld.angle = math.radians(spec["angle"])
        ld.color = lin(color)[:3]
        lo = link(bpy.data.objects.new(key, ld))
        travel = -b3(spec["from"]).normalized()
        lo.rotation_euler = travel.to_track_quat("-Z", "Y").to_euler()
        # three.js transmission never sees a light through glass; neither should Cycles
        lo.visible_transmission = False
        # three.js lets only the key cast a shadow
        ld.use_shadow = key == "key"

    c = st["camera"]
    cd = bpy.data.cameras.new("camera")
    cd.sensor_fit = "VERTICAL"
    cd.angle_y = math.radians(c["fov"])
    cd.clip_start = 0.1
    cam = link(bpy.data.objects.new("camera", cd))
    cam.location = b3(c["position"])
    cam.rotation_euler = (b3(c["target"]) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scn.camera = cam

    backlight(accent, st["backlight"])

    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, RIG["fit"]["floor"]))
    floor = bpy.context.active_object
    floor.name = "shadow_catcher"
    floor.is_shadow_catcher = True
    fm, fp = _principled("floor")
    fp.inputs["Base Color"].default_value = lin(RIG["ground"])
    fp.inputs["Roughness"].default_value = 1.0
    fp.inputs["Specular IOR Level"].default_value = 0.0
    floor.data.materials.append(fm)


def backlight(accent, bl):
    """A soft accent glow behind the object that only rays passing through glass can see: the
    'light behind a transparent object' of the brief. rig.js draws the same disc only into
    three.js's transmission buffer. Emission = accent * intensity * (1 - (r/R)^2)^2."""
    bpy.ops.mesh.primitive_plane_add(size=2)
    pl = bpy.context.active_object
    pl.name = "backlight"
    pl.location = b3(bl["center"])
    pl.scale = (bl["radius"],) * 3
    pl.rotation_euler = b3(bl["normal"]).to_track_quat("Z", "Y").to_euler()
    pl.visible_camera = False
    pl.visible_diffuse = False
    pl.visible_glossy = False
    pl.visible_shadow = False
    pl.visible_volume_scatter = False
    pl.visible_transmission = True
    m = bpy.data.materials.new("backlight")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ln = nt.nodes.new("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    sq = nt.nodes.new("ShaderNodeMath")
    sq.operation = "MULTIPLY"
    sub = nt.nodes.new("ShaderNodeMath")
    sub.operation = "SUBTRACT"
    sub.inputs[0].default_value = 1.0
    sub.use_clamp = True
    pw = nt.nodes.new("ShaderNodeMath")
    pw.operation = "MULTIPLY"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = bl["intensity"]
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = lin(accent)
    L = nt.links
    L.new(tc.outputs["Object"], ln.inputs[0])
    L.new(ln.outputs["Value"], sq.inputs[0])
    L.new(ln.outputs["Value"], sq.inputs[1])
    L.new(sq.outputs[0], sub.inputs[1])
    L.new(sub.outputs[0], pw.inputs[0])
    L.new(sub.outputs[0], pw.inputs[1])
    L.new(pw.outputs[0], mul.inputs[0])
    L.new(mul.outputs[0], em.inputs["Strength"])
    L.new(em.outputs[0], out.inputs["Surface"])
    pl.data.materials.append(m)
    return pl


def render_poster(name, out_dir, res, samples):
    from PIL import Image  # pip install pillow into the same venv

    scn = bpy.context.scene
    tmp = os.path.join(tempfile.mkdtemp(), f"{name}.png")
    scn.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    im = np.asarray(Image.open(tmp)).astype(np.float64)
    if im.max() > 255:
        im = im / 65535.0
    else:
        im = im / 255.0
    rgb, a = im[..., :3], im[..., 3:4]
    h = RIG["ground"].lstrip("#")
    ground = np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])
    comp = rgb * a + ground * (1 - a)
    img = Image.fromarray(np.clip(comp * 255 + 0.5, 0, 255).astype(np.uint8))
    p1200 = os.path.join(out_dir, f"{name}-poster.webp")
    p600 = os.path.join(out_dir, f"{name}-poster-600.webp")
    img.save(p1200, "WEBP", quality=88, method=6)
    img.resize((600, 600), Image.LANCZOS).save(p600, "WEBP", quality=88, method=6)
    shutil.rmtree(os.path.dirname(tmp), ignore_errors=True)
    return p1200, p600


# ---------------------------------------------------------------- the whole run

def finish(name, root, accent, args, size=None, lift=0.0, backlight=1.0):
    """Fit, export, render; print a one-line report."""
    t0 = time.time()
    os.makedirs(args.out, exist_ok=True)
    fit(root, size=size, lift=lift)
    root["accent"] = accent  # exported as extras: the page reads the rim colour from the GLB
    st = stage(root, backlight)
    parts = [o for o in descendants(root) if o.type == "MESH"]
    for o in parts:
        o.data.name = o.name
    tris = tri_count(parts)
    glb_kb = None
    if not args.no_export:
        glb_kb = export_glb(root, os.path.join(args.out, f"{name}.glb")) / 1024
    t1 = time.time()
    setup_render(accent, args.samples, args.res, st)
    if args.blend:
        bpy.ops.wm.save_as_mainfile(filepath=args.blend)
    posters = None
    if not args.no_render:
        posters = render_poster(name, args.out, args.res, args.samples)
    t2 = time.time()
    report = {
        "name": name, "tris": tris, "glb_kb": round(glb_kb, 1) if glb_kb else None,
        "parts": sorted(o.name for o in parts),
        "poster_kb": [round(os.path.getsize(p) / 1024, 1) for p in posters] if posters else None,
        "export_s": round(t1 - t0, 1), "render_s": round(t2 - t1, 1),
    }
    print("REPORT " + json.dumps(report))
    return report


def separate_loose(ob, names_by_x=None):
    """Split a mesh into its loose parts; optionally name them left to right."""
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    parts = list(bpy.context.selected_objects)
    for p in parts:
        origin_to_center(p)
    parts.sort(key=lambda o: o.matrix_world.translation.x)
    if names_by_x:
        for p, n in zip(parts, names_by_x):
            p.name = n
    return parts


def origin_to_center(ob):
    """Move the object's origin to the centre of its bounds (parts animate about themselves)."""
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    return ob
