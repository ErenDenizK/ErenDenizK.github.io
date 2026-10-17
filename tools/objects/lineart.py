"""The line twin of a glass object (round 6, row S4; ADR-0018 option 3): Grease Pencil Line Art from
the object's own Blender model, seen through its poster camera, written as an engraved SVG. Run with
the Blender Python (bpy) on a .blend saved by the object's script:

  python tools/objects/<name>.py --no-render --no-export --blend /tmp/<name>.blend
  python tools/objects/lineart.py /tmp/<name>.blend src/one/work/objects/<name>-line.svg [hatch]

EEVEE needs a GPU context that a headless container lacks, so the Line Art modifier is evaluated on the
CPU and its strokes are projected and drawn here instead of rendered. Passes: contour (the outline),
detail (creases, intersections, material borders), hidden (lines behind one or two surfaces, which the
glass shows) and hatch: sections of each part by parallel planes across its longest axis, kept where
the surface turns away from the engraver's light (upper left, in front) and where the camera sees
them, so the tone follows the form. Every line is a tapered filled shape (engraving guide 1.2): thin
at both ends, full in the middle, as a burin cuts it."""

import bpy, bmesh, sys, math, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
src, out, res = sys.argv[1], sys.argv[2], 1200
hatch_n = int(sys.argv[3]) if len(sys.argv) > 3 else 80
# the line weights scale with the size the twin is shown at: 1 for a 480 px figure, 1.9 for the 200 to
# 360 px figures of the page (engraving guide 1.2: a plate shown smaller needs its own weights)
weight = float(sys.argv[4]) if len(sys.argv) > 4 else 1.9
bpy.ops.wm.open_mainfile(filepath=src)
scn = bpy.context.scene
cam = scn.camera
scn.render.resolution_x = scn.render.resolution_y = res
for o in list(scn.objects):
    if o.type == 'MESH' and o.parent is None: bpy.data.objects.remove(o)
parts = [o for o in scn.objects if o.type == 'MESH']
bpy.ops.object.grease_pencil_add(type='LINEART_SCENE')
gp = [o for o in scn.objects if o.name.startswith('LineArt')][0]
gpd = gp.data
for n in ('contour', 'detail', 'hidden'):
    gpd.layers.new(n)
def setup(m, layer, contour, detail, lo, hi):
    m.source_type = 'SCENE'; m.target_layer = layer
    m.use_contour = contour
    m.use_crease = detail; m.use_intersection = detail; m.use_material = detail; m.use_edge_mark = detail; m.use_loose = detail
    m.crease_threshold = math.radians(135)
    m.use_multiple_levels = hi > lo; m.level_start = lo; m.level_end = hi
    m.use_back_face_culling = False
base = gp.modifiers[0]; setup(base, 'contour', True, False, 0, 0)
m2 = gp.modifiers.new('detail', 'LINEART'); m2.target_material = base.target_material; setup(m2, 'detail', False, True, 0, 0)
m3 = gp.modifiers.new('hidden', 'LINEART'); m3.target_material = base.target_material; setup(m3, 'hidden', True, True, 1, 2)
dg = bpy.context.evaluated_depsgraph_get()
ev = gp.evaluated_get(dg)
mw = gp.matrix_world
proj = lambda w: (lambda v: (v.x * res, (1 - v.y) * res, v.z))(world_to_camera_view(scn, cam, w))
strokes = {'contour': [], 'detail': [], 'hidden': [], 'hatch': []}
for layer in ev.data.layers:
    fr = layer.current_frame()
    if not fr or layer.name not in strokes: continue
    for s in fr.drawing.strokes:
        pts = [proj(mw @ p.position)[:2] for p in s.points]
        if len(pts) >= 2: strokes[layer.name].append(pts)
# hatch: plane sections of each part, along the part's longest local axis family turned 35 deg
key = scn.objects.get('key')
camloc = cam.matrix_world.translation
# the engraver's light: upper left, in front (engraving guide 1.3), placed in the camera's frame
cm = cam.matrix_world.to_3x3()
light = camloc + cm @ Vector((-6.0, 6.0, 2.0))
gp.hide_viewport = True; gp.hide_render = True
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
def visible(w):
    d = (w - camloc); dist = d.length; d.normalize()
    hit, loc, *_ = scn.ray_cast(dg, camloc, d, distance=dist - 1e-3)
    return not hit
for o in parts:
    me = o.evaluated_get(dg).to_mesh()
    bm = bmesh.new(); bm.from_mesh(me); bm.transform(o.matrix_world)
    bm.normal_update()
    lo = Vector([min(v.co[i] for v in bm.verts) for i in range(3)]); hi = Vector([max(v.co[i] for v in bm.verts) for i in range(3)])
    # plane normal: the camera's right axis turned a little, so the cuts read as diagonal hatching
    # the cuts run across the part's longest local axis, so on a curved part they wrap around the form
    dims = list(o.dimensions); ax = dims.index(max(dims))
    nrm = (o.matrix_world.to_3x3() @ Vector([1 if i == ax else 0 for i in range(3)])).normalized()
    ds = [nrm.dot(v.co) for v in bm.verts]; d0, d1 = min(ds), max(ds)
    span = d1 - d0
    k = max(6, int(hatch_n * span / 2.2))
    for i in range(1, k):
        dd = d0 + span * i / k
        cut = bm.copy()
        r = bmesh.ops.bisect_plane(cut, geom=cut.verts[:] + cut.edges[:] + cut.faces[:], plane_co=nrm * dd, plane_no=nrm)
        edges = [e for e in r['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
        for e in edges:
            fs = e.link_faces
            if not fs: continue
            mid = (e.verts[0].co + e.verts[1].co) / 2
            n = sum((f.normal for f in fs), Vector()).normalized()
            view = (camloc - mid).normalized()
            if n.dot(view) < 0.02: continue  # back face
            lam = n.dot((light - mid).normalized())
            if lam > 0.32: continue  # lit side stays clean
            if not visible(mid + n * 1e-3): continue
            a, b = proj(e.verts[0].co), proj(e.verts[1].co)
            strokes['hatch'].append([a[:2], b[:2], round(lam, 2)])
        cut.free()
    bm.free(); o.evaluated_get(dg).to_mesh_clear()
data = json.loads(json.dumps(strokes))
print('STROKES', {k: len(v) for k, v in strokes.items()})

# ---- the SVG ----

R = 1200
W = {'contour': 4.6 * weight, 'detail': 2.4 * weight, 'hidden': 1.3 * weight}
def rdp(pts, eps):
    if len(pts) < 3: return pts
    if math.hypot(pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1]) < 1.5:
        # a closed line: split at the point farthest from the start, simplify both halves
        far = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
        if 0 < far < len(pts) - 1: return rdp(pts[:far + 1], eps)[:-1] + rdp(pts[far:], eps)
    (x1, y1), (x2, y2) = pts[0][:2], pts[-1][:2]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps: return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]
def chaikin(pts, k=2):
    for _ in range(k):
        if len(pts) < 3: return pts
        q = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            q += [tuple(0.75*x+0.25*y for x, y in zip(a, b)), tuple(0.25*x+0.75*y for x, y in zip(a, b))]
        q.append(pts[-1]); pts = q
    return pts
def taper(pts, wfn, minlen=6):
    n = len(pts); acc = [0.0]
    for a, b in zip(pts, pts[1:]): acc.append(acc[-1] + math.hypot(b[0]-a[0], b[1]-a[1]))
    tot = acc[-1]
    if tot < minlen: return None
    L, Rt = [], []
    for i, p in enumerate(pts):
        t = acc[i] / tot
        ww = wfn(i, p) * (0.15 + 0.85 * math.sin(math.pi * t) ** 0.6) / 2
        a = pts[max(i - 1, 0)]; b = pts[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        L.append((p[0] + nx * ww, p[1] + ny * ww)); Rt.append((p[0] - nx * ww, p[1] - ny * ww))
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in L + Rt[::-1]) + 'Z'
def chain(segs):
    key = lambda p: (round(p[0], 1), round(p[1], 1))
    adj = {}
    for i, (a, b, lam) in enumerate(segs):
        adj.setdefault(key(a), []).append(i); adj.setdefault(key(b), []).append(i)
    used = [False] * len(segs); lines = []
    for i in range(len(segs)):
        if used[i]: continue
        used[i] = True
        a, b, lam = segs[i]
        line = [(a[0], a[1], lam), (b[0], b[1], lam)]
        for end in (1, 0):
            while True:
                p = line[-1] if end else line[0]
                nxt = [j for j in adj.get(key(p), []) if not used[j]]
                if not nxt: break
                j = nxt[0]; used[j] = True
                a2, b2, l2 = segs[j]
                q = b2 if key(a2) == key(p) else a2
                if end: line.append((q[0], q[1], l2))
                else: line.insert(0, (q[0], q[1], l2))
        lines.append(line)
    return lines
groups = []
hl = chain(data.get('hatch', []))
hd = []
for ln in hl:
    p = chaikin(rdp(ln, 0.5), 1)
    d = taper(p, lambda i, q: weight * (1.1 + 1.5 * min(1, max(0, (0.32 - q[2]) / 0.9))), 9)
    if d: hd.append(d)
groups.append(f'<g class="la-hatch"><path d="{"".join(hd)}"/></g>')
for role in ('hidden', 'detail', 'contour'):
    ds = []
    for s in data[role]:
        p = chaikin(rdp([tuple(x) for x in s], 0.7), 2)
        d = taper(p, lambda i, q, w=W[role]: w)
        if d: ds.append(d)
    groups.append(f'<g class="la-{role}"><path d="{"".join(ds)}"/></g>')
# white ink with its own tones: the page uses the file as a mask and paints it in the project's ink
tones = '<style>.la-hidden{opacity:.42}.la-detail{opacity:.85}.la-hatch{opacity:.8}</style>'
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {R} {R}" fill="#fff">' + tones + ''.join(groups) + '</svg>'
open(out, 'w').write(svg)
print(out, round(len(svg) / 1024, 1), 'KB', len(hl), 'hatch lines')
