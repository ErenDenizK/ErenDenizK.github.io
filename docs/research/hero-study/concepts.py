"""Hero-object concept study (2026-10-11). Builds one concept in one pose with the house rig
(tools/objects/common.py, read-only) and renders a Cycles still.
Run: <venv>/bin/python concepts.py -- --concept cat --pose rest --out DIR --samples 64 --res 1200
     [--clay] (fast grey preview)"""
import math
import os
import sys

REPO_OBJ = "/home/user/Portfolio/tools/objects"
sys.path.insert(0, REPO_OBJ)
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
concept = argv[argv.index("--concept") + 1]
pose = argv[argv.index("--pose") + 1]
clay = "--clay" in argv
rest = [a for i, a in enumerate(argv)
        if a not in ("--concept", "--pose", "--clay") and (i == 0 or argv[i - 1] not in ("--concept", "--pose"))]
sys.argv = [sys.argv[0], "--"] + rest + ["--no-export"]

import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Vector, Quaternion, Matrix  # noqa: E402
import common as C  # noqa: E402

args = C.parse_args()
C.reset()

EDK = "#c9d4ff"
LIME, SAKURA, ROSE = "#bbed26", "#efb1cb", "#eb4f6b"


def mat_clear(name="glass_clear"):
    if clay:
        return C.ceramic(name + "_clay", "#bdbdbd", rough=0.5, coat=0)
    return C.glass(name, "#eef1f8", transmission=0.94, rough=0.04, ior=1.5, coat=0.6, thickness=0.8)


def mat_tint(name, color, tr=0.7):
    if clay:
        return C.ceramic(name + "_clay", color, rough=0.5, coat=0)
    return C.glass(name, color, transmission=tr, rough=0.08, ior=1.5, coat=0.8, thickness=0.3)


def glow(name, color=EDK, s=6.0):
    return C.emissive(name, color, s)


# ---------------------------------------------------------------- metaball helpers

class Meta:
    """Overlapping primitives, later fused by union_remesh (voxel remesh + smooth = fillets)."""
    def __init__(self, name, res=None):
        self.name = name
        self.obs = []

    def _sph(self, p, r, scale=(1, 1, 1), rot=None):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, radius=r, location=p)
        ob = bpy.context.active_object
        ob.scale = scale
        if rot is not None:
            ob.rotation_mode = "QUATERNION"
            ob.rotation_quaternion = rot
        self.obs.append(ob)
        return ob

    def ball(self, p, r, stiff=None):
        return self._sph(p, r)

    def ell(self, p, r, sx, sy, sz, stiff=None, rot=None):
        return self._sph(p, r, (sx, sy, sz), rot)

    def capsule(self, a, b, r, stiff=None):
        a, b = Vector(a), Vector(b)
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=(b - a).length,
                                            location=(a + b) / 2)
        ob = bpy.context.active_object
        ob.rotation_mode = "QUATERNION"
        ob.rotation_quaternion = Vector((0, 0, 1)).rotation_difference((b - a).normalized())
        self.obs.append(ob)
        self._sph(a, r)
        self._sph(b, r)
        return ob

    def mesh(self, mat, name=None):
        return self.obs


def union_remesh(obs, name, mat, voxel=0.012, smooth=6, blend=12):
    """Join meshes, voxel-remesh into one watertight surface, smooth it (`blend` repeats of a
    plain smooth round the creases into fillets)."""
    flat = []
    for o in obs:
        flat += o if isinstance(o, list) else [o]
    obs = flat
    for o in bpy.context.view_layer.objects:
        o.select_set(o in obs)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    m = ob.modifiers.new("remesh", "REMESH")
    m.mode = "VOXEL"
    m.voxel_size = voxel
    m.adaptivity = 0.0
    if blend:
        sm = ob.modifiers.new("blend", "SMOOTH")
        sm.factor = 0.8
        sm.iterations = blend
    s = ob.modifiers.new("smooth", "CORRECTIVE_SMOOTH")
    s.iterations = smooth
    s.smooth_type = "LENGTH_WEIGHTED"
    s.use_only_smooth = True
    bpy.ops.object.convert(target="MESH")
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def cone(name, base, tip, r, flat=0.55, verts=32, mat=None):
    base, tip = Vector(base), Vector(tip)
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r * 0.12,
                                    depth=(tip - base).length)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (1, flat, 1)
    bpy.ops.object.transform_apply(scale=True)
    q = Vector((0, 0, 1)).rotation_difference((tip - base).normalized())
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = q
    ob.location = (base + tip) / 2
    if mat:
        ob.data.materials.append(mat)
    return ob


def sphere(name, p, r, scale=(1, 1, 1), mat=None, seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=p)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = scale
    for f in ob.data.polygons:
        f.use_smooth = True
    if mat:
        ob.data.materials.append(mat)
    return ob


def curve_tube(name, pts, r0, r1, mat=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    n = len(pts)
    for i, p in enumerate(pts):
        sp.points[i].co = (*p, 1)
        sp.points[i].radius = r0 + (r1 - r0) * i / (n - 1)
    sp.use_endpoint_u = True
    sp.order_u = 4
    sp.resolution_u = 16
    ob = C.link(bpy.data.objects.new(name, cu))
    if mat:
        cu.materials.append(mat)
    return ob


def rot_about(p, pivot, axis, deg):
    q = Quaternion(Vector(axis), math.radians(deg))
    return tuple(Vector(pivot) + q @ (Vector(p) - Vector(pivot)))


# ---------------------------------------------------------------- concepts
# Blender space: z up, the camera looks along +y (front of an object faces -y).

def build_cat(pose):
    glass = mat_clear()
    eye = glow("eye", EDK, 9.0)
    dotm = C.glass("bead", "#f2f4f8", transmission=1.0, rough=0.03, ior=1.45, coat=0.5,
                   thickness=0.2) if not clay else C.ceramic("dotc", EDK)
    corem = glow("beadcore", EDK, 4.0)
    m = Meta("cat")
    tilt = 0.0 if pose == "rest" else 18.0     # head tilt (roll), degrees
    look = 0.0 if pose == "rest" else 16.0     # head pitch (positive = down)
    turn = 0.0 if pose == "rest" else 32.0     # head yaw toward the dot
    neck = (0, -0.1, 1.08)

    def H(p):  # head-space point -> world (tilt about the neck)
        p = rot_about(p, neck, (1, 0, 0), look)
        p = rot_about(p, neck, (0, 1, 0), tilt)
        return rot_about(p, neck, (0, 0, 1), turn)

    # body: one seated pear of revolution (no join between haunch and chest), leaning forward
    prof = [(0.0, 0.0), (0.3, 0.0), (0.4, 0.06), (0.43, 0.2), (0.41, 0.36), (0.35, 0.52),
            (0.28, 0.68), (0.23, 0.84), (0.2, 0.98), (0.17, 1.08), (0.0, 1.14)]
    pear = C.lathe("pear", prof, segments=64, mat=None, smooth_angle=80)
    pear.scale = (0.86, 1.18, 1.0)
    pear.rotation_euler = (math.radians(12), 0, 0)
    pear.location = (0, 0.12, 0.0)
    m.obs.append(pear)
    m.ball((0.2, 0.24, 0.26), 0.25)
    m.ball((-0.2, 0.24, 0.26), 0.25)
    # front legs
    m.capsule((-0.12, -0.38, 0.08), (-0.11, -0.22, 0.62), 0.07)
    m.ell((-0.12, -0.43, 0.05), 1.0, 0.08, 0.12, 0.05)
    if pose == "rest":
        m.capsule((0.12, -0.38, 0.08), (0.11, -0.22, 0.62), 0.07)
        m.ell((0.12, -0.43, 0.05), 1.0, 0.08, 0.12, 0.05)
    else:  # right paw out to the side, batting at the dot
        m.capsule((0.11, -0.24, 0.66), (0.32, -0.5, 0.56), 0.07)
        m.ell((0.36, -0.55, 0.54), 1.0, 0.085, 0.105, 0.07)
    # neck and head
    m.ell(H((0, -0.08, 1.12)), 1.0, 0.18, 0.18, 0.2)
    m.ell(H((0, -0.12, 1.36)), 1.0, 0.3, 0.26, 0.25)
    m.ball(H((0.12, -0.21, 1.3)), 0.11)
    m.ball(H((-0.12, -0.21, 1.3)), 0.11)
    m.ball(H((0, -0.33, 1.28)), 0.08)  # muzzle
    body = m.mesh(glass, "cat_meta")
    ears = []
    for s in (1, -1):
        b = H((0.17 * s, -0.1, 1.5))
        t = H((0.27 * s, -0.08, 1.77))
        ears.append(cone(f"ear{s}", b, t, 0.12, flat=0.5, mat=glass))
    if pose == "rest":  # tail wraps round the front of the paws
        tail = [(0.22, 0.62, 0.07), (0.5, 0.32, 0.055), (0.52, -0.16, 0.055), (0.32, -0.52, 0.055),
                (0.02, -0.6, 0.055)]
    else:  # tail up, curled at the tip
        tail = [(0.08, 0.55, 0.15), (0.3, 0.68, 0.5), (0.36, 0.64, 0.95), (0.28, 0.56, 1.25),
                (0.12, 0.52, 1.32), (0.07, 0.5, 1.2)]
    t = curve_tube("tail", tail, 0.07, 0.05, mat=glass)
    cat = union_remesh([body, t] + ears, "cat", glass, voxel=0.011, blend=60)
    # eyes: almond slits of edk light, just under the glass surface
    eyes = []
    for s in (1, -1):
        e = sphere(f"eye{s}", H((0.115 * s, -0.335, 1.385)), 0.045, scale=(1.0, 0.4, 0.42), mat=eye)
        e.rotation_euler = (math.radians(look), math.radians(-22 * s + tilt), math.radians(-14 * s + turn))
        eyes.append(e)
    # the "dot": a glowing glass bead (edk.'s period) the cat plays with
    if pose == "rest":
        dot = sphere("dot", (-0.4, -0.66, 0.09), 0.09, mat=dotm)
    else:
        dot = sphere("dot", (0.52, -0.74, 0.62), 0.09, mat=dotm)
    core = sphere("dotcore", tuple(dot.location), 0.04, mat=corem)
    root = C.empty("cat_root", [cat, dot, core] + eyes)
    root.rotation_euler = (0, 0, math.radians(-24))
    return root, EDK, 2.15


def build_dot(pose):
    glass = mat_clear()
    font = C.load_font(("InterDisplay-Bold.otf", "Inter-Bold.otf"))
    word = C.text_solid("edk", "edk", font, size=1.0, depth=0.34, bevel=0.03, bevel_res=5,
                        mat=glass, res_u=12, spacing=1.16)
    letters = C.separate_loose(word, ["e", "d", "k"])
    for L in letters:
        L.rotation_euler = (math.radians(90), 0, 0)
        L.location = (L.location.x, L.location.z, L.location.y)
    bpy.context.view_layer.update()
    lo, hi = C.world_bbox(letters)
    for L in letters:
        L.location.z -= lo.z
    bpy.context.view_layer.update()
    lo, hi = C.world_bbox(letters)
    k = letters[2]
    klo, khi = C.world_bbox([k])
    dropm = C.glass("drop", "#f2f4f8", transmission=1.0, rough=0.03, ior=1.45, coat=0.5,
                    thickness=0.6) if not clay else C.ceramic("dropc", "#cccccc")
    core = glow("core", EDK, 5.0)
    eye = glow("eye", "#ffffff", 12.0)
    r = 0.15
    print("KBOX", tuple(klo), tuple(khi))
    if pose == "rest":  # sits as the period after the k, looking at the camera
        c = Vector((khi.x + 0.3, 0.0, r * 0.88))
        sc = (1.06, 1.06, 0.88)
        gaze = Vector((0, -1, 0.05))
    else:  # hopped up onto the e, squashed on landing, looking back at the camera
        elo, ehi = C.world_bbox([letters[0]])
        c = Vector(((elo.x + ehi.x) / 2 + 0.03, 0.0, ehi.z + r * 0.84))
        sc = (1.12, 1.12, 0.86)
        gaze = Vector((0.35, -0.9, 0.1)).normalized()
    drop = sphere("dot", c, r, scale=sc, mat=dropm, seg=64)
    inner = sphere("core", c, r * 0.24, scale=sc, mat=core)
    eyes = []
    side = gaze.cross(Vector((0, 0, 1))).normalized()
    for s in (1, -1):
        dirv = (gaze + side * s * 0.42 + Vector((0, 0, 0.22))).normalized()
        p = c + Vector((dirv.x * r * sc[0], dirv.y * r * sc[1], dirv.z * r * sc[2])) * 0.985
        e = sphere(f"eye{s}", p, 0.024, scale=(0.8, 0.8, 1.55), mat=eye)
        eyes.append(e)
    root = C.empty("dot_root", letters + [drop, inner] + eyes)
    root.rotation_euler = (0, 0, math.radians(-4))
    return root, EDK, 2.6


def build_conductor(pose):
    glass = mat_clear()
    visor = glow("visor", EDK, 7.0)
    metal = C.metal("baton", "#e8eaf0", rough=0.15)
    m = Meta("cond")
    up = pose != "rest"
    tilt = -10.0 if up else 0.0
    neckp = (0, 0, 1.15)

    def H(p):
        return rot_about(rot_about(p, neckp, (1, 0, 0), -8 if up else 0), neckp, (0, 1, 0), tilt)

    # a pawn-like glass body: wide foot, waisted, rounded shoulders
    m.ell((0, 0, 0.16), 0.5, 1.0, 1.0, 0.36)
    m.ell((0, 0, 0.62), 0.42, 0.78, 0.78, 1.1)
    m.ell((0, 0, 0.98), 0.4, 0.92, 0.82, 0.55)
    m.ell(H((0, 0, 1.42)), 0.36, 1.05, 1.0, 0.95)
    # arms: short glass stubs; the right holds a baton
    m.capsule((-0.36, 0, 0.98), (-0.5, -0.05, 0.62), 0.09)
    if up:
        hand = Vector((0.62, -0.18, 1.5))
        m.capsule((0.36, 0, 1.0), tuple(hand), 0.09)
    else:
        hand = Vector((0.5, -0.12, 0.66))
        m.capsule((0.36, 0, 0.98), tuple(hand), 0.09)
    body = m.mesh(glass, "cond_meta")
    body = union_remesh([body], "conductor", glass, voxel=0.012)
    # visor: a thin curved band of edk light across the face
    vz = 1.44
    pts = []
    for i in range(13):
        a = math.radians(-125 + 70 * i / 12)
        pts.append(H((0.335 * math.cos(a), 0.335 * math.sin(a), vz)))
    band = curve_tube("visor", pts, 0.028, 0.028, mat=visor)
    bdir = (Vector((0.35, -0.5, 0.9)) if up else Vector((0.55, -0.6, -0.15))).normalized()
    baton = curve_tube("baton", [tuple(hand), tuple(hand + bdir * 0.2), tuple(hand + bdir * 0.45),
                                 tuple(hand + bdir * 0.7)], 0.022, 0.006, mat=metal)
    agents = []
    cols = [("lime", LIME), ("sakura", SAKURA), ("rose", ROSE)]
    if up:  # swept into a rising arc that follows the baton tip
        tip = hand + bdir * 0.7
        pos = [tip + Vector((0.2, -0.12, 0.18)), Vector((0.95, -0.25, 1.15)), Vector((0.98, -0.2, 0.6))]
        rad = [0.12, 0.13, 0.14]
    else:  # parked in an even orbit at chest height
        pos = []
        for i in range(3):
            a = math.radians(-60 + i * 120)
            pos.append(Vector((0.9 * math.cos(a), 0.9 * math.sin(a), 0.55 + 0.12 * math.sin(a))))
        rad = [0.13, 0.13, 0.13]
    for (n, col), p, r in zip(cols, pos, rad):
        agents.append(sphere(n, p, r, mat=mat_tint("g_" + n, col, 0.6)))
    root = C.empty("cond_root", [body, band, baton] + agents)
    root.rotation_euler = (0, 0, math.radians(-18))
    return root, EDK, 2.2


def letter_prism(ch, font, axis, glass):
    """One letter fitted to the unit square, extruded 1.2 through, facing along `axis`."""
    t = C.text_solid(ch, ch, font, size=1.0, depth=1.3, bevel=0.0, bevel_res=0, mat=glass,
                     res_u=12, spacing=1.0)
    bpy.context.view_layer.update()
    lo, hi = C.world_bbox([t])
    d = hi - lo
    t.location -= (lo + hi) / 2
    t.scale = (1.0 / d.x, 1.0 / d.y, 1.0)
    bpy.context.view_layer.update()
    for o in bpy.context.view_layer.objects:
        o.select_set(o == t)
    bpy.context.view_layer.objects.active = t
    bpy.ops.object.transform_apply(location=True, scale=True)
    lo, hi = C.world_bbox([t])
    t.location -= (lo + hi) / 2
    bpy.ops.object.transform_apply(location=True)
    # text reads along +x, up +y, extruded along z: re-orient
    if axis == "front":   # seen from -y: reads along +x, up +z
        t.rotation_euler = (math.radians(90), 0, 0)
    elif axis == "side":  # seen from +x: reads along +y, up +z
        t.rotation_euler = (math.radians(90), 0, math.radians(90))
    else:                 # seen from +z (top): reads along +x, up +y
        t.rotation_euler = (0, 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    return t


def build_triplet(pose):
    glass = mat_clear()
    font = C.load_font(("InterDisplay-Black.otf", "Inter-Black.otf", "Inter-ExtraBold.otf"))
    e = letter_prism("e", font, "front", glass)
    d = letter_prism("d", font, "side", glass)
    k = letter_prism("k", font, "top", glass)
    for o, other in ((e, d), (e, k)):
        b = e.modifiers.new("i", "BOOLEAN")
        b.operation = "INTERSECT"
        b.solver = "EXACT"
        b.object = other
    for o in bpy.context.view_layer.objects:
        o.select_set(o == e)
    bpy.context.view_layer.objects.active = e
    bpy.ops.object.convert(target="MESH")
    bpy.data.objects.remove(d)
    bpy.data.objects.remove(k)
    e.name = "triplet"
    bv = e.modifiers.new("bevel", "BEVEL")
    bv.width = 0.008
    bv.segments = 3
    bv.limit_method = "ANGLE"
    C.shade(e, angle=35)
    root = C.empty("triplet_root", [e])
    if pose == "e":
        root.rotation_euler = (0, 0, 0)
    elif pose == "d":
        root.rotation_euler = (0, 0, math.radians(-90))
    elif pose == "k":
        root.rotation_euler = (math.radians(-90), 0, 0)
    else:  # three-quarter: all three letters' edges at once
        root.rotation_euler = (math.radians(-18), 0, math.radians(38))
    return root, EDK, 1.9


BUILD = {"cat": build_cat, "dot": build_dot, "conductor": build_conductor, "triplet": build_triplet}
root, accent, size = BUILD[concept](pose)
name = f"{concept}-{pose}" + ("-clay" if clay else "")
rep = C.finish(name, root, accent, args, size=size)
