"""Pre-rendered frames for one hero object (ADR-0006): the 16-bit masters that encode.py turns
into the site's media. Builds the object with its own script and rig.json, then renders in
Cycles, one stage per Blender process (the droplet stage rewrites the meshes):

  poster   the centre pose at --poster-samples (first paint; frame 0 of everything)
  grid     the lean grid: --nyaw yaw columns x --npitch pitch rows (ADR-0006 §1, §4)
  clip     the object's micro-interaction, from rest back to rest (CLIPS below)
  droplet  rest -> the shared glass droplet (ADR-0006 §5; render bake-off "The morph")
  shadow   the rest pose's floor shadow alone: the object hidden from the camera but still
           casting, the whole square at --shadow-res (encode.py turns it into a multiply map)
  normal   camera-space normals and coverage for every grid pose and every frame of the state
           axis or clip, inside the grid's and the clip's own crops (needs those stages first),
           for the live frame engine's pointer light (ADR-0009; liveliness research §3 d).
           An emission override, no bounces, 8 spp: about a second a frame, not minutes

  <venv>/bin/python tools/objects/frames.py edk                       # all four stages
  <venv>/bin/python tools/objects/frames.py recto --stage grid --res 1040 --masters DIR

Masters land in DIR/<name>/<stage>/ as Cycles' straight-alpha RGBA 16-bit PNGs (f_000.png ...)
beside crop.json (the rendered rectangle inside the square frame) and log.json (per-frame
seconds). encode.py composites them on the ground exactly as common.render_poster does, then
subtracts the ground. A stage that is interrupted resumes: frames already on disk are skipped.

Pose conventions (shared with encode.py and the manifest):
  yaw    the object turns about the vertical axis through its bounds centre, as the page's
         lean turned it; positive = the object faces right (its front turns toward +x).
  pitch  the camera orbits about the same centre, so the object stays on its floor and shadow;
         positive = the object faces up (the camera drops by that angle).
"""
import argparse
import json
import math
import os
import runpy
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
OBJECTS = ("edk", "recto", "englishprep", "eatmap", "log", "record")
STAGES = ("poster", "grid", "clip", "droplet", "shadow", "normal")
# The live engine plays a clip either as a time axis (forward from rest, back to rest) or, where
# its first frames rise monotonically from rest to one extreme, as a reversible state axis: a
# spring picks the frame, so it can stop, reverse and overshoot (liveliness research §3 d).
# Recto's fan is spring(120, 13) toward 1: its frames 0..11 run from rest to the furthest fan
# (the overshoot peak at 0.37 s), so they are the axis; frames after it are the way back.
AXES = {"recto": {"axis": "state", "frames": 12, "peak": 11}}
# Record's lift is one too; clip_record() adds its entry, because its peak frame comes from its spring.


def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("obj", choices=OBJECTS)
    ap.add_argument("--stage", default="all", help="comma list of %s, or all" % ", ".join(STAGES))
    ap.add_argument("--masters", default=os.environ.get("OBJECT_MASTERS", "/tmp/object-masters"))
    ap.add_argument("--res", type=int, default=1040, help="square frame size of grid and clips")
    ap.add_argument("--poster-res", type=int, default=1200)
    ap.add_argument("--samples", type=int, default=32, help="grid, clip and droplet (+ OIDN)")
    ap.add_argument("--poster-samples", type=int, default=128)
    ap.add_argument("--bounces", type=int, default=12, help="transmission bounces (bake-off: 12)")
    ap.add_argument("--yaw", type=float, default=16.0, help="grid half range, degrees")
    ap.add_argument("--nyaw", type=int, default=17)
    ap.add_argument("--pitch", type=float, default=4.0, help="grid half range, degrees")
    ap.add_argument("--npitch", type=int, default=3)
    ap.add_argument("--droplet-frames", type=int, default=24)
    ap.add_argument("--shadow-res", type=int, default=600, help="the shadow is soft: half the poster")
    ap.add_argument("--shadow-samples", type=int, default=128)
    ap.add_argument("--preview-res", type=int, default=260, help="crop-finding previews")
    ap.add_argument("--limit", type=int, default=0, help="render only the first N frames (tests)")
    ap.add_argument("--normal-samples", type=int, default=8, help="normal stage: no denoise, no bounces")
    return ap.parse_args(argv)


A = parse()
stages = STAGES if A.stage == "all" else tuple(s.strip() for s in A.stage.split(","))
if len(stages) > 1:
    # one process per stage: the droplet stage bakes and moves vertices, and a fresh scene keeps
    # every stage independent of the others' state
    out = os.path.join(A.masters, A.obj)
    os.makedirs(out, exist_ok=True)
    times = {}
    rest = [a for a in sys.argv[1:] if a not in ("--",)]
    i = rest.index("--stage") if "--stage" in rest else None
    if i is not None:
        del rest[i:i + 2]
    for st in stages:
        t = time.time()
        subprocess.run([sys.executable, os.path.abspath(__file__), *rest, "--stage", st], check=True)
        times[st] = round(time.time() - t, 1)
        print(f"STAGE {A.obj} {st} {times[st]}s", flush=True)
    p = os.path.join(out, "render.json")
    old = json.load(open(p)) if os.path.exists(p) else {}
    old.update({"stages_s": {**old.get("stages_s", {}), **times}})
    json.dump(old, open(p, "w"), indent=1)
    sys.exit(0)

STAGE = stages[0]
OUT = os.path.join(A.masters, A.obj, STAGE)
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- build the object
sys.path.insert(0, HERE)
res = {"poster": A.poster_res, "shadow": A.shadow_res}.get(STAGE, A.res)
spp = {"poster": A.poster_samples, "shadow": A.shadow_samples, "normal": A.normal_samples}.get(STAGE, A.samples)
sys.argv = [os.path.join(HERE, f"{A.obj}.py"), "--no-render", "--no-export", "--out", OUT,
            "--samples", str(spp), "--res", str(res)]
runpy.run_path(os.path.join(HERE, f"{A.obj}.py"), run_name="__main__")

import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Matrix, Quaternion, Vector  # noqa: E402

import common as C  # noqa: E402

scn = bpy.context.scene
cy = scn.cycles
cy.samples = spp
cy.use_denoising = True
cy.denoiser = "OPENIMAGEDENOISE"
cy.seed = 0
cy.use_animated_seed = False   # neighbouring poses denoise alike (no flicker between frames)
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.01 if STAGE in ("poster", "shadow") else 0.02
cy.transmission_bounces = A.bounces
cy.max_bounces = A.bounces
cy.glossy_bounces = min(cy.glossy_bounces, 4) if STAGE not in ("poster", "shadow") else cy.glossy_bounces
scn.render.resolution_x = scn.render.resolution_y = res
scn.render.resolution_percentage = 100
scn.render.use_persistent_data = True
scn.render.image_settings.color_depth = "16"
scn.render.image_settings.color_mode = "RGBA"

root = bpy.data.objects[A.obj]
parts = [o for o in C.descendants(root) if o.type == "MESH"]
lo, hi = C.world_bbox(parts)
center = (lo + hi) / 2
# the page's lean pivot: an empty at the bounds centre that the root hangs from
piv = bpy.data.objects.new("pivot", None)
scn.collection.objects.link(piv)
piv.location = center
bpy.context.view_layer.update()
mw = root.matrix_world.copy()
root.parent = piv
root.matrix_parent_inverse = piv.matrix_world.inverted()
bpy.context.view_layer.update()
assert (root.matrix_world.translation - mw.translation).length < 1e-5
cam = scn.camera
CAM0 = cam.matrix_world.copy()
REST = {o.name: o.matrix_world.copy() for o in C.descendants(root)}
I4 = Matrix.Identity(4)


def T(v):
    return Matrix.Translation(v)


def pose(yaw_deg=0.0, pitch_deg=0.0):
    """Turn the object by yaw about its vertical axis; orbit the camera by pitch (see header)."""
    piv.matrix_world = T(center) @ Matrix.Rotation(math.radians(yaw_deg), 4, "Z")
    d = CAM0.translation - center
    h = Vector((d.x, d.y, 0))
    elev = math.atan2(d.z, h.length) - math.radians(pitch_deg)
    p = center + h.normalized() * d.length * math.cos(elev) + Vector((0, 0, d.length * math.sin(elev)))
    cam.matrix_world = T(p) @ (center - p).to_track_quat("-Z", "Y").to_matrix().to_4x4()
    bpy.context.view_layer.update()


def place(o, off=None, rot=None, scale=None, about=None):
    """World-space move of a part from its rest matrix: scale (world axes) and rotate about
    `about` (default: the part's origin, the centre of its bounds), then translate by `off`."""
    M0 = REST[o.name]
    p = about if about is not None else M0.translation
    S = Matrix.Diagonal((*scale, 1.0)) if scale is not None else I4
    R = rot.to_matrix().to_4x4() if rot is not None else I4
    o.matrix_world = T(off if off is not None else Vector()) @ T(p) @ R @ S @ T(-p) @ M0


def b3(v):
    return C.b3(v)


def set_border(rect):
    """rect = (x, y, w, h) in pixels of the square frame, origin top left; None = whole frame."""
    r = scn.render
    if rect is None:
        r.use_border = False
        r.use_crop_to_border = False
        return
    x, y, w, h = rect
    r.use_border = True
    r.use_crop_to_border = True
    r.border_min_x, r.border_max_x = x / res, (x + w) / res
    r.border_min_y, r.border_max_y = 1 - (y + h) / res, 1 - y / res


def render(path):
    scn.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t


def read_rgba16(path):
    """A PNG as float RGBA in 0..1, at full 16-bit precision (Pillow would truncate to 8)."""
    info = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                           "stream=width,height", "-of", "csv=p=0", path],
                          check=True, capture_output=True, text=True).stdout.strip().split(",")
    w, h = int(info[0]), int(info[1])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt",
                          "rgba64le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, "<u2").reshape(h, w, 4).astype(np.float64) / 65535.0


GROUND = np.array([int(C.RIG["ground"].lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def visible_mask(path):
    """Pixels that survive ground subtraction (composite over the ground, then above it)."""
    im = read_rgba16(path)
    a = im[..., 3:4]
    lift = (a * (im[..., :3] - GROUND)).max(-1)
    return lift > 1.5 / 255


def find_crop(states, tag):
    """Render each state small and fast, union what survives subtraction, add a margin, and
    return a pixel rect (even-sized) of the full-resolution frame."""
    saved = (scn.render.resolution_x, cy.samples, cy.adaptive_threshold)
    scn.render.resolution_x = scn.render.resolution_y = A.preview_res
    cy.samples = 8
    set_border(None)
    union = None
    pdir = os.path.join(OUT, "preview")
    os.makedirs(pdir, exist_ok=True)
    for k, apply in enumerate(states):
        apply()
        p = os.path.join(pdir, f"{tag}_{k:03d}.png")
        render(p)
        m = visible_mask(p)
        union = m if union is None else (union | m)
    scn.render.resolution_x = scn.render.resolution_y = saved[0]
    cy.samples, cy.adaptive_threshold = saved[1], saved[2]
    ys, xs = np.nonzero(union)
    if len(xs) == 0:
        return (0, 0, res, res)
    s = res / A.preview_res
    margin = max(12, round(0.025 * res))
    x0 = max(0, int(xs.min() * s) - margin)
    y0 = max(0, int(ys.min() * s) - margin)
    x1 = min(res, int((xs.max() + 1) * s) + margin)
    y1 = min(res, int((ys.max() + 1) * s) + margin)
    x0, y0 = x0 - x0 % 2, y0 - y0 % 2
    x1, y1 = min(res, x1 + (x1 - x0) % 2), min(res, y1 + (y1 - y0) % 2)
    return (x0, y0, x1 - x0, y1 - y0)


def health(path):
    """(coverage, light): the share of the frame the render covers (alpha > 0.5) and the mean of
    max(RGB) x alpha. Both collapse when Cycles drops the object; only the light collapses when
    it keeps the object's alpha but returns it black (edk grid frames 8-15, 2026-10-09)."""
    im = read_rgba16(path)
    return float((im[..., 3] > 0.5).mean()), float((im[..., :3].max(-1) * im[..., 3]).mean())


def broken(h, prev):
    """A frame to render again: black although it covers something, or either measure
    collapsing against the previous frame."""
    if STAGE == "shadow":   # the catcher's shadow is black with alpha by design
        return False
    cov, lit = h
    if cov > 0.01 and lit < 0.002:
        return True
    return prev is not None and (cov < 0.35 * prev[0] or lit < 0.35 * prev[1])


FLUSH_EVERY = 16   # frames between persistent-data flushes (see run_frames)


def run_frames(states, crop, extra=None):
    """Render states (callables that set the scene) into OUT/f_###.png inside `crop`.

    Persistent data is what makes a pose grid affordable (bake-off: 85 s -> 22 s a frame), but
    after about fifty re-renders in one session Cycles started returning frames with the
    object missing (edk grid frames 48-50 here, the bake-off's edk grid from frame 49 on), and
    once frames with the object's alpha but black RGB (edk grid 8-15). So the cache is flushed
    every FLUSH_EVERY frames, and a broken frame (see broken()) is rendered again from a fresh
    sync, up to twice; one still broken stops the stage so that encode never sees it."""
    json.dump({"res": res, "x": crop[0], "y": crop[1], "w": crop[2], "h": crop[3],
               "samples": spp, "bounces": A.bounces, **(extra or {})},
              open(os.path.join(OUT, "crop.json"), "w"), indent=1)
    set_border(crop)
    logp = os.path.join(OUT, "log.json")
    log = json.load(open(logp)) if os.path.exists(logp) else {"frames": {}}
    n = len(states) if not A.limit else min(A.limit, len(states))
    since, prev = 0, None
    for k in range(n):
        path = os.path.join(OUT, f"f_{k:03d}.png")
        if os.path.exists(path):
            prev = None
            continue
        states[k]()
        if since >= FLUSH_EVERY:
            scn.render.use_persistent_data = False
            since = 0
        dt = render(path)
        scn.render.use_persistent_data = True
        since += 1
        h = health(path)
        tries = 0
        while broken(h, prev):
            if tries == 2:
                os.remove(path)
                raise SystemExit(f"{A.obj} {STAGE} frame {k}: still broken {h} after two fresh renders")
            print(f"RETRY {A.obj} {STAGE} {k + 1}: coverage/light {h} after {prev}", flush=True)
            scn.render.use_persistent_data = False
            dt += render(path)
            scn.render.use_persistent_data = True
            since = 1
            tries += 1
            h = health(path)
            log.setdefault("retries", []).append(k)
        prev = h
        log["frames"][str(k)] = round(dt, 1)
        json.dump(log, open(logp, "w"), indent=1)
        print(f"FRAME {A.obj} {STAGE} {k + 1}/{len(states)} {dt:.1f}s", flush=True)
    ts = list(log["frames"].values())
    log["total_s"] = round(sum(ts), 1)
    log["mean_s"] = round(sum(ts) / max(1, len(ts)), 1)
    json.dump(log, open(logp, "w"), indent=1)
    print(f"TOTAL {A.obj} {STAGE} {log['total_s']}s", flush=True)


def stage_crop(states, tag):
    """The crop of an interrupted run is kept, so resumed frames line up with the earlier ones."""
    p = os.path.join(OUT, "crop.json")
    if os.path.exists(p):
        c = json.load(open(p))
        if c.get("res") == res:
            return (c["x"], c["y"], c["w"], c["h"])
    return find_crop(states, tag)


# ---------------------------------------------------------------- micro-interactions
# Each clip starts and ends on the rest pose (the grid's centre frame), so the page can play it
# over the still and hand back without a seam. The choreography follows each object's MICRO
# entry in prototypes/e-dark/index.html (the motion the owner has seen), sampled at 30 fps;
# continuous idle terms there (the slow float and spin) are left to the grid.

FPS = 30
UP = b3((0, 1, 0))
TOWARD = b3((0, 0, 1))   # three.js +z: toward the camera


def spring_track(n, k, c, events, dt=1 / 600):
    """Simulate x'' = -k (x - to) - c v; events = [(t, {'to': .., 'v+': .., 'x': .., 'v': ..})].
    Returns x at each of n frames."""
    x = v = to = 0.0
    out = []
    ev = sorted(events, key=lambda e: e[0])
    t = 0.0
    for f in range(n):
        tf = f / FPS
        while t < tf - 1e-9:
            while ev and ev[0][0] <= t + 1e-9:
                e = ev.pop(0)[1]
                to = e.get("to", to)
                v += e.get("v+", 0.0)
                x = e.get("x", x)
                v = e.get("v", v)
            a = -k * (x - to) - c * v
            v += a * dt
            x += v * dt
            t += dt
        out.append(x)
    return out


def taper(n, k, frames=6):
    """1 until the last `frames` frames, then down to exactly 0 on the last frame."""
    u = (k - (n - 1 - frames)) / frames
    if u <= 0:
        return 1.0
    u = min(u, 1.0)
    return 1 - u * u * (3 - 2 * u)


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def part(name):
    return bpy.data.objects[name]


def clip_edk():
    """The letters hop in sequence, each with a little roll (MICRO.edk)."""
    n = 30
    L = [part(c) for c in "edk"]

    def state(k):
        t = k / FPS

        def f():
            for i, P in enumerate(L):
                p = min(max((t - i * 0.09) / 0.5, 0.0), 1.0)
                lift = math.sin(p * math.pi) * (1 - p * 0.3) * 0.34
                roll = math.sin(p * math.pi * 2) * 0.09
                place(P, off=UP * lift, rot=Quaternion(TOWARD, roll))
            bpy.context.view_layer.update()
        return f
    return n, [state(k) for k in range(n)]


def clip_recto():
    """page_2 and page_3 fan out round the clip on a spring, hold, and settle back
    (MICRO.recto: spring(120, 13), arrive() fans out and closes after 0.9 s)."""
    n = 45
    fan = spring_track(n, 120, 13, [(0.0, {"to": 1.0}), (0.75, {"to": 0.0})])
    clip_recto.values = [fan[k] * taper(n, k) for k in range(n)]   # the fan amount per frame
    p2, p3 = part("page_2"), part("page_3")

    def state(k):
        f = fan[k] * taper(n, k)

        def g():
            place(p2, off=b3((-0.16 * f, -0.05 * f, -0.03 * f)), rot=Quaternion(TOWARD, 0.13 * f))
            place(p3, off=b3((-0.32 * f, -0.1 * f, -0.06 * f)), rot=Quaternion(TOWARD, 0.26 * f))
            bpy.context.view_layer.update()
        return g
    return n, [state(k) for k in range(n)]


def clip_englishprep():
    """The bubble pops, A and a bob up, the reply ducks away and pops back in, its dots
    bounce (MICRO.englishprep: pop spring(260, 9) kicked by 7, reply spring(200, 11) after
    0.22 s, dots 1 + max(0, sin 9t) * 0.18 * e^-1.5t). The page made the reply vanish in one
    frame; here it shrinks away over 0.12 s so the clip starts on the rest pose."""
    n = 45
    pop = spring_track(n, 260, 9, [(0.0, {"v+": 7.0})])
    rep = spring_track(n, 200, 11, [(0.0, {"x": 0.0, "v": 0.0, "to": 0.0}), (0.22, {"to": 1.0})])
    A_, a_, reply, dots = part("A"), part("a"), part("reply"), part("dots")

    def state(k):
        t = k / FPS
        w = taper(n, k, 8)
        if t < 0.12:
            rs = 1 - smooth(t / 0.12)
        elif t < 0.22:
            rs = 0.0
        else:
            rs = min(max(rep[k], 0.0), 1.3)
        rs = 1 + (rs - 1) * w
        b = 1 + max(0.0, math.sin((t - 0.22) * 9)) * 0.18 * math.exp(-(t - 0.22) * 1.5) if t > 0.22 else 1.0
        b = 1 + (b - 1) * w
        ps = 1 + pop[k] * 0.08 * w

        def g():
            piv.matrix_world = T(center) @ Matrix.Diagonal((ps, ps, ps, 1.0))
            bpy.context.view_layer.update()
            for o in (A_, a_, reply, dots):
                REST[o.name] = (T(center) @ Matrix.Diagonal((ps, ps, ps, 1.0)) @ T(-center)) @ REST0[o.name]
            place(A_, off=UP * (pop[k] * 0.04 * w))
            place(a_, off=UP * (pop[k] * 0.06 * w))
            s = max(rs, 1e-4)
            reply.hide_render = dots.hide_render = rs < 1e-3
            place(reply, scale=(s, s, s))
            place(dots, scale=(s * b,) * 3)
            bpy.context.view_layer.update()
        return g
    return n, [state(k) for k in range(n)]


def clip_eatmap():
    """The pin rises a little, drops onto the plate, squashes, bounces once, rests and lifts
    back (MICRO.eatmap: gravity 14, restitution 0.34, squash min(0.28, -v * 0.05) easing out at
    e^-9t, then a 0.7 s smoothstep home). The page teleported the pin up 0.75 to start; here a
    short rise keeps the first frame on the rest pose. The squash is about the tip, which stays
    on the glaze, and the landing height is ray-cast onto the plate's surface."""
    n = 45
    pin = part("pin")
    dg = bpy.context.evaluated_depsgraph_get()
    ev = pin.evaluated_get(dg)
    verts = [ev.matrix_world @ v.co for v in ev.data.vertices]
    tip = min(verts, key=lambda v: v.z)
    hit, loc, *_ = scn.ray_cast(dg, tip - Vector((0, 0, 1e-4)), Vector((0, 0, -1)))
    floor = -(tip.z - loc.z) + 0.004 if hit else -0.1
    rise, g = 0.16, 14.0
    ys, sqs = [], []
    y = vy = sq = 0.0
    phase, rest_t = "rise", 0.0
    dt = 1 / 600
    t = 0.0
    for f in range(n):
        while t < f / FPS - 1e-9:
            if phase == "rise":
                u = min(t / 0.18, 1.0)
                y = rise * math.sin(u * math.pi / 2)
                if u >= 1:
                    phase, vy = "fall", 0.0
            elif phase == "fall":
                vy -= g * dt
                y += vy * dt
                if y <= floor:
                    y = floor
                    sq = max(sq, min(0.28, -vy * 0.05))
                    vy = -vy * 0.34
                    if abs(vy) < 0.5:
                        phase, vy, rest_t = "rest", 0.0, 0.0
            else:
                rest_t += dt
                y = floor * (1 - smooth((rest_t - 0.22) / 0.6))
            sq *= math.exp(-dt * 9)
            t += dt
        ys.append(y)
        sqs.append(sq)

    def state(k):
        w = taper(n, k, 4)
        yk, s = ys[k] * w, sqs[k] * w

        def h():
            place(pin, off=UP * yk, scale=(1 + 0.5 * s, 1 + 0.5 * s, 1 - s), about=tip)
            bpy.context.view_layer.update()
        return h
    return n, [state(k) for k in range(n)]


RING_GROW = 0.7   # the rings' radius grows from 1.06 to 1.06 * 1.7 head radii (see clip_log)


def clip_log():
    """The LED goes on air and soft accent rings ripple out round the head (MICRO.log: three
    camera-facing rings, opacity (1 - p)^2; the LED brightens). MICRO grew them to 2.5 times
    the head's radius, which left the 1040 square at the top; here they grow to RING_GROW
    (1.8x), so even the last faint ring stays inside the frame. The LED rests dim (log.py
    LED_REST) and goes on air at LED_ON_AIR times that. Rings are flat discs with a soft radial
    profile, seen only by the camera."""
    n = 45
    led = part("led")
    head = part("head")
    hlo, hhi = C.world_bbox([head])
    hc = (hlo + hhi) / 2
    hr = (hhi.x - hlo.x) / 2
    led_mat = led.data.materials[0]
    p_led = led_mat.node_tree.nodes["Principled BSDF"]
    base = p_led.inputs["Emission Strength"].default_value
    on_air = float(root.get("led_on_air", 4.0))
    accent = root["accent"]
    rings = []
    for i in range(3):
        bpy.ops.mesh.primitive_plane_add(size=2, location=hc)
        pl = bpy.context.active_object
        pl.name = f"ring_{i}"
        pl.rotation_euler = (cam.location - hc).to_track_quat("Z", "Y").to_euler()
        for attr in ("visible_diffuse", "visible_glossy", "visible_transmission", "visible_shadow",
                     "visible_volume_scatter"):
            setattr(pl, attr, False)
        m = bpy.data.materials.new(f"ring_{i}")
        m.use_nodes = True
        nt = m.node_tree
        for nd in list(nt.nodes):
            nt.nodes.remove(nd)
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        tc = nt.nodes.new("ShaderNodeTexCoord")
        ln = nt.nodes.new("ShaderNodeVectorMath")
        ln.operation = "LENGTH"
        # profile(r) = core + halo gaussians around radius R (object space; the disc is scaled)
        prof = nt.nodes.new("ShaderNodeMath")
        prof.operation = "MULTIPLY"
        R = nt.nodes.new("ShaderNodeValue")
        R.name = "R"
        op = nt.nodes.new("ShaderNodeValue")
        op.name = "opacity"
        L = nt.links
        widths = []   # (divide node, sigma as a fraction of the head's radius)

        def gauss(sigma, weight):
            d = nt.nodes.new("ShaderNodeMath")
            d.operation = "SUBTRACT"
            L.new(ln.outputs["Value"], d.inputs[0])
            L.new(R.outputs[0], d.inputs[1])
            q = nt.nodes.new("ShaderNodeMath")
            q.operation = "DIVIDE"
            L.new(d.outputs[0], q.inputs[0])
            widths.append((q, sigma))
            sq_ = nt.nodes.new("ShaderNodeMath")
            sq_.operation = "MULTIPLY"
            L.new(q.outputs[0], sq_.inputs[0])
            L.new(q.outputs[0], sq_.inputs[1])
            ng = nt.nodes.new("ShaderNodeMath")
            ng.operation = "MULTIPLY"
            ng.inputs[1].default_value = -0.5
            L.new(sq_.outputs[0], ng.inputs[0])
            ex = nt.nodes.new("ShaderNodeMath")
            ex.operation = "EXPONENT"
            L.new(ng.outputs[0], ex.inputs[0])
            wt = nt.nodes.new("ShaderNodeMath")
            wt.operation = "MULTIPLY"
            wt.inputs[1].default_value = weight
            L.new(ex.outputs[0], wt.inputs[0])
            return wt
        g1, g2 = gauss(0.012, 1.0), gauss(0.05, 0.3)
        add = nt.nodes.new("ShaderNodeMath")
        add.operation = "ADD"
        L.new(g1.outputs[0], add.inputs[0])
        L.new(g2.outputs[0], add.inputs[1])
        L.new(add.outputs[0], prof.inputs[0])
        L.new(op.outputs[0], prof.inputs[1])
        clampn = nt.nodes.new("ShaderNodeClamp")
        L.new(prof.outputs[0], clampn.inputs["Value"])
        L.new(tc.outputs["Object"], ln.inputs[0])
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = C.lin(accent)
        em.inputs["Strength"].default_value = 1.6
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        mix = nt.nodes.new("ShaderNodeMixShader")
        L.new(clampn.outputs[0], mix.inputs["Fac"])
        L.new(tr.outputs[0], mix.inputs[1])
        L.new(em.outputs[0], mix.inputs[2])
        L.new(mix.outputs[0], out.inputs["Surface"])
        pl.data.materials.append(m)
        rings.append((pl, R, op, widths))
    births = (0.08, 0.3, 0.52)
    life = 0.92

    def state(k):
        t = k / FPS
        on = smooth(t / 0.12) * (1 - smooth((t - 1.0) / 0.42))

        def h():
            p_led.inputs["Emission Strength"].default_value = base * (1 + (on_air - 1) * on)
            for (pl, R, op, widths), b in zip(rings, births):
                p = (t - b) / life
                if p <= 0 or p >= 1:
                    pl.hide_render = True
                    continue
                pl.hide_render = False
                rad = hr * 1.06 * (1 + p * RING_GROW)
                ext = rad + hr * 0.25
                pl.scale = (ext, ext, ext)
                R.outputs[0].default_value = rad / ext
                op.outputs[0].default_value = (1 - p) ** 2 * 0.6 * smooth(p / 0.06)
                # the disc is scaled by ext: keep the profile's widths constant in world space
                for q, sigma in widths:
                    q.inputs[1].default_value = sigma * 1.06 / (ext / hr)
            bpy.context.view_layer.update()
        return h
    for ring in rings:
        ring[0].hide_render = True
    return n, [state(k) for k in range(n)]


RECORD_LIFT = 0.28   # the full lift, in card heights: the card's foot clears the stack's top
RECORD_TIP = 11.0    # degrees the card tips toward the viewer at the top of the lift


def clip_record():
    """The drawn card lifts all the way out of the file, tips toward the viewer about its foot and
    settles back (research "Round 2": a note lifts a little, an essay all the way; the shipped
    clip is one full lift). Lift is spring(110, 13) toward 1, let go at 0.62 s, so it rises,
    overshoots a little, hangs and drops back with a small settle into the stack; the tip follows
    on a softer spring(80, 11), a beat later, so the card leans out as it arrives. Frames 0..peak
    rise monotonically, so the lift is also a state axis (AXES) the live engine could stop
    anywhere: a short entry a little, an essay all the way."""
    n = 42
    lift = spring_track(n, 110, 13, [(0.0, {"to": 1.0}), (0.62, {"to": 0.0})])
    tip = spring_track(n, 80, 11, [(0.07, {"to": 1.0}), (0.66, {"to": 0.0})])
    card = part("card")
    M0 = REST[card.name]
    R3 = M0.to_3x3()
    width, up = R3.col[0].normalized(), R3.col[2].normalized()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = card.evaluated_get(dg)
    vs = [ev.matrix_world @ v.co for v in ev.data.vertices]
    c0 = M0.translation
    hs = [(v - c0).dot(up) for v in vs]
    foot = c0 + up * min(hs)                 # the middle of the card's bottom edge
    height = max(hs) - min(hs)
    top = c0 + up * max(hs)
    # tip toward the camera: the sign that brings the card's top closer to it
    to_cam = (cam.matrix_world.translation - foot).normalized()
    sign = 1.0 if (Quaternion(width, 0.1) @ (top - foot)).dot(to_cam) > (top - foot).dot(to_cam) else -1.0
    vals = [lift[k] * taper(n, k) for k in range(n)]
    peak = max(range(n // 2), key=lambda k: vals[k])
    clip_record.values = vals
    AXES["record"] = {"axis": "state", "frames": peak + 1, "peak": peak}

    def state(k):
        w = taper(n, k)
        lk, tk = vals[k], tip[k] * w

        def g():
            place(card, off=UP * (lk * RECORD_LIFT * height),
                  rot=Quaternion(width, sign * math.radians(RECORD_TIP) * tk), about=foot)
            bpy.context.view_layer.update()
        return g
    return n, [state(k) for k in range(n)]


CLIPS = {"edk": clip_edk, "recto": clip_recto, "englishprep": clip_englishprep,
         "eatmap": clip_eatmap, "log": clip_log, "record": clip_record}

# ---------------------------------------------------------------- stages
REST0 = {k: v.copy() for k, v in REST.items()}
info = {"obj": A.obj, "stage": STAGE, "accent": root["accent"]}

if STAGE == "poster":
    pose(0, 0)
    crop = stage_crop([lambda: pose(0, 0)], "poster")
    run_frames([lambda: pose(0, 0)], crop, info)

elif STAGE == "grid":
    yaws = [-A.yaw + 2 * A.yaw * i / (A.nyaw - 1) for i in range(A.nyaw)]
    pitches = [0.0] if A.npitch == 1 else [-A.pitch + 2 * A.pitch * j / (A.npitch - 1) for j in range(A.npitch)]
    states = [(lambda y=y, p=p: pose(y, p)) for p in pitches for y in yaws]
    ends = [(lambda y=y, p=p: pose(y, p)) for p in (pitches[0], 0.0, pitches[-1])
            for y in (yaws[0], 0.0, yaws[-1])]
    crop = stage_crop(ends, "grid")
    run_frames(states, crop, {**info, "yaw": yaws, "pitch": pitches,
                              "order": "row-major: rows are pitch (first = lowest), columns yaw"})

elif STAGE == "clip":
    pose(0, 0)
    n, states = CLIPS[A.obj]()
    crop = stage_crop(states[::3] + [states[-1]], "clip")
    for o, M in REST0.items():
        REST[o] = M.copy()
    run_frames(states, crop, {**info, "frames": n, "fps": FPS})

elif STAGE == "droplet":
    # rest -> the shared droplet, from the bake-off's melt (render_seq.py --mode melt): every
    # vertex moves toward centre + dir * R on the page's leaving curve (ease-in cubic), a real
    # glass sphere grows over the last 45 % while the parts shrink inside it, and camera and
    # backlight glide to canonical values. Every object's last frame is the same droplet under
    # the same camera; only the accent (rim light and backlight colour) differs.
    pose(0, 0)
    RIG = C.RIG
    canon_c = b3([0, 0.92, 0])
    canon_r = 0.62
    cpos = b3(RIG["camera"]["position"])
    camC = T(cpos) @ (canon_c - cpos).to_track_quat("-Z", "Y").to_matrix().to_4x4()
    fov0 = cam.data.angle_y
    fovC = math.radians(RIG["camera"]["fov"])
    bl = bpy.data.objects["backlight"]
    bl0 = bl.matrix_world.copy()
    dvec = (Vector(RIG["camera"]["position"]) - Vector(RIG["camera"]["target"])).normalized()
    blc = b3(list(Vector((0, 0.92, 0)) - dvec * RIG["backlight"]["behind"] * canon_r))
    blr = RIG["backlight"]["radius"] * 2 * canon_r
    blC = T(blc) @ b3(list(dvec)).to_track_quat("Z", "Y").to_matrix().to_4x4() @ Matrix.Diagonal((blr, blr, blr, 1))
    dg = bpy.context.evaluated_depsgraph_get()
    rest = {}
    for o in parts:
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        o.modifiers.clear()
        o.data = me
        rest[o.name] = [o.matrix_world @ v.co for v in me.vertices]
    fac, gi = {}, 0
    for o in parts:
        isg = any(m and "glass" in m.name for m in o.data.materials)
        fac[o.name] = (1 - 0.03 * gi) if isg else None
        gi += isg
    drop_mat = C.glass("droplet", "#f2f4f8", transmission=1.0, rough=0.03, ior=1.45, coat=0.5)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1.0, location=canon_c)
    drop = bpy.context.active_object
    drop.data.shade_smooth()
    drop.data.materials.append(drop_mat)
    N = A.droplet_frames
    R0 = 0.42 * (hi - lo).length / 2

    def state(k):
        def f():
            p = k / (N - 1)
            m = p * p * p
            cc = center.lerp(canon_c, m)
            R = (R0 + (canon_r - R0) * m) * (1 - 0.92 * smooth((m - 0.55) / 0.45))
            g = smooth((m - 0.45) / 0.55)
            drop.location = cc
            drop.scale = (max(g, 1e-3) * canon_r,) * 3
            drop.hide_render = g < 1e-3
            for o in parts:
                inv = o.matrix_world.inverted()
                fo = fac[o.name] if fac[o.name] is not None else 0.5 * (1 - m ** 4) + 1e-3
                for v, w in zip(o.data.vertices, rest[o.name]):
                    d = w - center
                    d = d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))
                    v.co = inv @ w.lerp(cc + d * R * fo, m)
                o.data.update()
            s = smooth(m)
            loc = CAM0.translation.lerp(camC.translation, s)
            rot = CAM0.to_quaternion().slerp(camC.to_quaternion(), s)
            cam.matrix_world = T(loc) @ rot.to_matrix().to_4x4()
            cam.data.angle_y = fov0 + (fovC - fov0) * s
            l0, r0, s0 = bl0.decompose()
            l1, r1, s1 = blC.decompose()
            bl.matrix_world = Matrix.LocRotScale(l0.lerp(l1, s), r0.slerp(r1, s), s0.lerp(s1, s))
            bpy.context.view_layer.update()
        return f
    states = [state(k) for k in range(N)]
    # crop finding re-runs the melt; positions are recomputed from `rest` each frame
    crop = stage_crop(states[::2] + [states[-1]], "droplet")
    run_frames(states, crop, {**info, "frames": N, "curve": "ease-in cubic, uniform in time",
                              "droplet": {"center": [0, 0.92, 0], "radius": canon_r}})

elif STAGE == "shadow":
    # The floor shadow of the rest pose on its own (encode.py: "multiply the ground by this"),
    # because ground subtraction zeroes everything darker than the ground. The object stays in
    # the scene for shadow, diffuse and glossy rays and leaves only the camera's, so the
    # catcher records the same key and contact shadow as the poster, including the part the
    # object covers (the page leans the object over it). One pose only: pitch moves the floor
    # by a few pixels, and the page fades the shadow a little with lean instead.
    pose(0, 0)
    for o in parts:
        o.visible_camera = False
    run_frames([lambda: pose(0, 0)], (0, 0, res, res), {**info, "kind": "floor shadow, rest pose"})

elif STAGE == "normal":
    # Camera-space normals of the first surface the camera sees, for the same poses and inside
    # the same crops as the grid and clip masters, so every normal pixel sits under its beauty
    # pixel (checked by overlay in the liveliness research). Every material is overridden with
    # an emission of the world normal; nothing else is seen by the camera (floor, backlight, the
    # log clip's rings); no bounces, no denoise. Written as 16-bit RGBA PNGs: RGB = n * 0.5 + 0.5
    # with +x right, +y up, +z toward the viewer; A = coverage. encode.py packs them small.
    def need(stage):
        p = os.path.join(A.masters, A.obj, stage, "crop.json")
        if not os.path.exists(p):
            raise SystemExit(f"{A.obj} normal: render the {stage} stage first ({p} is missing)")
        return json.load(open(p))

    gcrop, ccrop = need("grid"), need("clip")
    assert gcrop["res"] == res and ccrop["res"] == res, "normal: --res must match the grid and clip"
    mat = bpy.data.materials.new("normal_override")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    ma = nt.nodes.new("ShaderNodeVectorMath")
    ma.operation = "MULTIPLY_ADD"
    ma.inputs[1].default_value = (0.5, 0.5, 0.5)
    ma.inputs[2].default_value = (0.5, 0.5, 0.5)
    em = nt.nodes.new("ShaderNodeEmission")
    mo = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Normal"], ma.inputs[0])
    nt.links.new(ma.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], mo.inputs["Surface"])
    bpy.context.view_layer.material_override = mat
    cy.use_denoising = False
    cy.use_adaptive_sampling = False
    cy.max_bounces = cy.transparent_max_bounces = 0
    scn.render.film_transparent = True
    vs = scn.view_settings
    vs.view_transform, vs.look, vs.exposure, vs.gamma = "Standard", "None", 0.0, 1.0
    scn.render.image_settings.file_format = "OPEN_EXR"
    scn.render.image_settings.color_depth = "32"

    def hide_rest():
        for o in scn.objects:
            if o.type in ("MESH", "CURVE", "FONT") and o not in parts:
                o.visible_camera = False

    def normal_frames(states, crop, sub, extra):
        d = os.path.join(OUT, sub)
        os.makedirs(d, exist_ok=True)
        json.dump({**{k: crop[k] for k in ("res", "x", "y", "w", "h")}, "samples": spp, **info,
                   "kind": "camera-space normal * 0.5 + 0.5 (+x right, +y up, +z to viewer); A coverage",
                   **extra}, open(os.path.join(d, "crop.json"), "w"), indent=1)
        set_border((crop["x"], crop["y"], crop["w"], crop["h"]))
        tmp = os.path.join(d, "tmp.exr")
        n = len(states) if not A.limit else min(A.limit, len(states))
        tot = 0.0
        for k in range(n):
            path = os.path.join(d, f"f_{k:03d}.png")
            if os.path.exists(path):
                continue
            states[k]()
            dt = render(tmp)
            im = bpy.data.images.load(tmp)
            a = np.empty(len(im.pixels), np.float32)
            im.pixels.foreach_get(a)
            a = a.reshape(im.size[1], im.size[0], 4)[::-1]   # top row first
            bpy.data.images.remove(im)
            al = a[..., 3:4]
            nw = np.where(al > 1e-4, a[..., :3] / np.maximum(al, 1e-4), 0.5) * 2 - 1
            nc = nw @ np.array(cam.matrix_world.to_3x3())   # world -> camera axes
            nc /= np.maximum(np.linalg.norm(nc, axis=-1, keepdims=True), 1e-6)
            out = np.dstack([nc * 0.5 + 0.5, np.clip(al, 0, 1)])
            out[al[..., 0] <= 1e-4, :3] = 0.5
            h, w = out.shape[:2]
            raw = np.round(np.clip(out, 0, 1) * 65535).astype("<u2").tobytes()
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba64le",
                            "-s", f"{w}x{h}", "-i", "-", path], input=raw, check=True)
            tot += dt
            print(f"FRAME {A.obj} normal/{sub} {k + 1}/{len(states)} {dt:.1f}s", flush=True)
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"TOTAL {A.obj} normal/{sub} {tot:.1f}s", flush=True)

    hide_rest()
    yaws, pitches = gcrop["yaw"], gcrop["pitch"]
    normal_frames([(lambda y=y, p=p: pose(y, p)) for p in pitches for y in yaws], gcrop, "grid",
                  {"yaw": yaws, "pitch": pitches, "order": gcrop.get("order")})
    pose(0, 0)
    n, states = CLIPS[A.obj]()
    for o, M in REST0.items():
        REST[o] = M.copy()
    hide_rest()   # the clip may add camera-only helpers (log's rings)
    ax = dict(AXES.get(A.obj, {"axis": "time", "frames": n}))
    vals = getattr(CLIPS[A.obj], "values", None)
    if ax["axis"] == "state" and vals:
        # the axis value of each frame, 0 at rest and 1 at the peak: the page maps a spring's value
        # to a frame through these, so the fan's amount, not the clip's clock, follows the spring
        top = vals[ax["peak"]]
        assert all(vals[i] < vals[i + 1] for i in range(ax["peak"])), "state frames must rise"
        ax["values"] = [round(v / top, 4) for v in vals[:ax["frames"]]]
    # a time axis plays in a second with the light faded; only a state axis, which can rest
    # anywhere, needs its own normals (the crop.json is still written: encode reads the axis there)
    normal_frames(states[:ax["frames"]] if ax["axis"] == "state" else [], ccrop, "clip",
                  {"fps": FPS, "clipFrames": n, **ax})
