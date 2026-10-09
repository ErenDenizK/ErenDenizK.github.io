"""Encode one object's 16-bit masters (frames.py) into the site's media and its manifest
(ADR-0006 §2-3; media research §8 and its recipe).

  python3 tools/objects/encode.py edk [--masters DIR] [--out media/objects]

Needs numpy, Pillow with WebP and AVIF (the Blender venv has both) and an ffmpeg with
libsvtav1, libx265, libx264 and libaom-av1 (Ubuntu's ffmpeg 6.1 has all four).

1. Every master is composited on the ground exactly as common.render_poster does, then the
   ground is subtracted in sRGB code values: v = max(0, px - ground). Pure black survives every
   codec; the page draws the media with mix-blend-mode: plus-lighter and adds its own ground
   back. Pixels the render had darker than the ground (the contact shadow) become 0.
2. Stills: the lean grid in two tiers (full = the rendered crop, half = half of it) and the
   poster at 600 and 1200, each in the still format chosen by the black test (report.json).
3. Video: the interaction clip, the droplet clip forward and reversed (the arriving object plays
   it backward; browsers cannot play video in reverse) and an idle loop synthesised from the
   grid, each as AV1 10-bit, HEVC Main 10 (hvc1) and H.264 High, BT.709 limited range tagged,
   +faststart, no audio. Clips are padded back to the full square so they sit on the poster.
4. manifest.json: what the media stage reads (shape in README.md, "The manifest").
"""
import argparse
import json
import math
import os
import shutil
import subprocess

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
RIG = json.load(open(os.path.join(HERE, "rig.json")))
G8 = np.array([int(RIG["ground"].lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)], float)
G = G8 / 255

ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
ap.add_argument("obj")
ap.add_argument("--masters", default=os.environ.get("OBJECT_MASTERS", "/tmp/object-masters"))
ap.add_argument("--out", default=os.path.join(REPO, "media", "objects"))
ap.add_argument("--still", choices=("auto", "webp", "avif"), default="auto")
ap.add_argument("--webp-q", type=int, default=82)
ap.add_argument("--avif-q", type=int, default=60)
ap.add_argument("--idle-seconds", type=float, default=8.0)
ap.add_argument("--droplet-fps", type=int, default=60)
ap.add_argument("--skip-video", action="store_true", help="stills and manifest only (tests)")
A = ap.parse_args()

M = os.path.join(A.masters, A.obj)
OUT = os.path.join(A.out, A.obj)
WORK = os.path.join(M, "sub")
for d in (OUT, WORK):
    os.makedirs(d, exist_ok=True)
report = {"obj": A.obj}


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, **kw)


def read_rgba16(path):
    w, h = map(int, sh(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height", "-of", "csv=p=0", path], text=True).stdout.strip().split(","))
    raw = sh(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgba64le", "-"]).stdout
    return np.frombuffer(raw, "<u2").reshape(h, w, 4).astype(np.float64) / 65535.0


def subtracted(path):
    """Composite on the ground (straight alpha, sRGB code values, as common.render_poster),
    then subtract the ground: float RGB in 0..1, 0 where the ground was."""
    im = read_rgba16(path)
    a = im[..., 3:4]
    comp = im[..., :3] * a + G * (1 - a)
    return np.clip(comp - G, 0, 1)


def write_png16(arr, path):
    h, w = arr.shape[:2]
    raw = np.round(np.clip(arr, 0, 1) * 65535).astype(">u2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48be", "-s",
                    f"{w}x{h}", "-i", "-", path], input=raw, check=True)


def to8(arr):
    return Image.fromarray(np.round(np.clip(arr, 0, 1) * 255).astype(np.uint8), "RGB")


def resize(arr, w, h):
    """Lanczos in float per channel (Pillow 'F'); zero stays exactly zero away from edges."""
    chans = [np.asarray(Image.fromarray(arr[..., c].astype(np.float32), "F").resize((w, h), Image.LANCZOS))
             for c in range(3)]
    return np.clip(np.stack(chans, -1), 0, 1)


def pad(arr, crop, size):
    """Place a cropped frame back into the full square."""
    full = np.zeros((size, size, 3))
    h, w = arr.shape[:2]
    x, y = crop["x"], crop["y"]
    full[y:y + h, x:x + w] = arr[:size - y, :size - x]
    return full


def frames_of(stage):
    d = os.path.join(M, stage)
    fs = sorted(f for f in os.listdir(d) if f.startswith("f_") and f.endswith(".png"))
    crop = json.load(open(os.path.join(d, "crop.json")))
    return [os.path.join(d, f) for f in fs], crop


def edge_max(arr):
    """Largest value on the crop's border, in 8-bit levels (> 1 means the crop cut light off)."""
    return float(max(arr[0].max(), arr[-1].max(), arr[:, 0].max(), arr[:, -1].max()) * 255)


def rel(p):
    return os.path.relpath(p, OUT).replace(os.sep, "/")


def size(p):
    return os.path.getsize(p)


def far_ground(src, r=8):
    """Ground pixels (exact 0) more than r px from anything lit: where a codec offset would show
    as a visible rectangle. Codec error right at the object's edge is ordinary ringing."""
    lit = src.max(-1) > 0
    m = lit.copy()
    for _ in range(r):
        d = m.copy()
        d[1:] |= m[:-1]
        d[:-1] |= m[1:]
        d[:, 1:] |= m[:, :-1]
        d[:, :-1] |= m[:, 1:]
        m = d
    return ~m


def ground_stats(src, dec):
    z = (src == 0).all(-1)
    far = far_ground(src)
    return {"ground_off_share": round(float((dec[z] != 0).any(-1).mean()) if z.any() else 0.0, 6),
            "far_ground_px": int(far.sum()),
            "far_ground_off": int((dec[far] != 0).any(-1).sum()),
            "far_ground_max": int(dec[far].max()) if far.any() else 0}


# ---------------------------------------------------------------- still codec: the black test
def save_still(img8, path, fmt):
    if fmt == "webp":
        img8.save(path, "WEBP", quality=A.webp_q, method=6)
    else:
        img8.save(path, "AVIF", quality=A.avif_q, speed=4, subsampling="4:4:4")


def black_test(samples):
    """Encode sample frames each way, decode them back and check the ground: exact 0 in the
    source must decode to exact 0, above all away from the object. Also object error and bytes."""
    res = {}
    tmp = os.path.join(WORK, "blacktest")
    os.makedirs(tmp, exist_ok=True)

    def merge(stats):
        out = {"ground_off_share": round(float(np.mean([s["ground_off_share"] for s in stats])), 6)}
        for k in ("far_ground_px", "far_ground_off"):
            out[k] = sum(s[k] for s in stats)
        out["far_ground_max"] = max(s["far_ground_max"] for s in stats)
        return out

    for fmt in ("webp", "avif"):
        tot, stats, maes = 0, [], []
        for i, arr in enumerate(samples):
            src = np.round(np.clip(arr, 0, 1) * 255).astype(np.uint8)
            p = os.path.join(tmp, f"s{i}.{fmt}")
            save_still(Image.fromarray(src, "RGB"), p, fmt)
            tot += size(p)
            dec = np.asarray(Image.open(p).convert("RGB")).astype(int)
            stats.append(ground_stats(src, dec))
            obj = src.max(-1) > 6
            maes.append(float(np.abs(dec[obj] - src[obj]).mean()) if obj.any() else 0.0)
        res[fmt] = {"bytes": tot, **merge(stats), "object_mae": round(float(np.mean(maes)), 2)}
    # 10-bit 4:4:4 AVIF through libaom (ffmpeg), decoded back by ffmpeg, for comparison
    tot, stats = 0, []
    for i, arr in enumerate(samples):
        h, w = arr.shape[:2]
        p16 = os.path.join(tmp, f"s{i}.png")
        write_png16(arr, p16)
        p = os.path.join(tmp, f"s{i}_10.avif")
        sh(["ffmpeg", "-v", "error", "-y", "-i", p16, "-vf",
            "scale=out_color_matrix=bt709:out_range=tv,format=yuv444p10le", "-c:v", "libaom-av1",
            "-still-picture", "1", "-crf", "30", "-cpu-used", "4", "-colorspace", "bt709",
            "-color_primaries", "bt709", "-color_trc", "iec61966-2-1", "-color_range", "tv", p])
        tot += size(p)
        raw = sh(["ffmpeg", "-v", "error", "-i", p, "-vf", "scale=in_color_matrix=bt709:in_range=tv,format=rgb24",
                  "-f", "rawvideo", "-"]).stdout
        dec = np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(int)
        stats.append(ground_stats(np.round(np.clip(arr, 0, 1) * 255).astype(np.uint8), dec))
    res["avif10_libaom"] = {"bytes": tot, **merge(stats)}
    shutil.rmtree(tmp, ignore_errors=True)
    return res


# ---------------------------------------------------------------- video
COLOR = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
         "-color_range", "tv", "-an", "-movflags", "+faststart"]
CODECS = {
    "av1": (["-c:v", "libsvtav1", "-preset", "4", "-crf", "30", "-pix_fmt", "yuv420p10le",
             "-svtav1-params", "tune=0"], "yuv420p10le"),
    "hevc": (["-c:v", "libx265", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p10le",
              "-tag:v", "hvc1", "-x265-params", "log-level=error"], "yuv420p10le"),
    "h264": (["-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high",
              "-pix_fmt", "yuv420p"], "yuv420p"),
}


def codec_string(path, kind):
    """The RFC 6381 codecs parameter for <source type>, from the stream itself."""
    j = json.loads(sh(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                       "stream=profile,level,width,height", "-of", "json", path], text=True).stdout)["streams"][0]
    lvl = int(j.get("level", -99))
    if kind == "h264":
        prof = {"High": 0x64, "Main": 0x4D, "Constrained Baseline": 0x42}.get(j.get("profile"), 0x64)
        return f'avc1.{prof:02X}00{lvl:02X}'
    if kind == "hevc":
        return f"hvc1.2.4.L{lvl}.B0"
    # AV1 Main profile, 10-bit; ffprobe reports seq_level_idx as the level when it can
    if lvl < 0:
        px = j["width"] * j["height"]
        lvl = 4 if px <= 665856 else (8 if px <= 2228224 else 12)
    return f"av01.0.{lvl:02d}M.10"


def encode_video(seq_dir, name, fps):
    """seq_dir holds f_%03d.png (16-bit, subtracted, full square). Returns sources + checks."""
    sources = []
    for kind, (args, pixfmt) in CODECS.items():
        p = os.path.join(OUT, f"{name}.{kind}.mp4")
        sh(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", os.path.join(seq_dir, "f_%03d.png"),
            "-vf", f"scale=out_color_matrix=bt709:out_range=tv,format={pixfmt}", *args, *COLOR, p])
        sources.append({"src": rel(p), "type": f'video/mp4; codecs="{codec_string(p, kind)}"',
                        "codec": kind, "bytes": size(p)})
    return sources


def check_video(path, ref_first):
    """Decode frame 0 back and report ground exactness against the subtracted master."""
    h, w = ref_first.shape[:2]
    raw = sh(["ffmpeg", "-v", "error", "-i", path, "-frames:v", "1", "-vf",
              "scale=in_color_matrix=bt709:in_range=tv,format=rgb24", "-f", "rawvideo", "-"]).stdout
    dec = np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(int)
    src = np.round(ref_first * 255).astype(int)
    obj = src.max(-1) > 6
    return {**ground_stats(src, dec), "object_mae": round(float(np.abs(dec[obj] - src[obj]).mean()), 2)}


def write_seq(arrs, d):
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(d)
    for i, a in enumerate(arrs):
        write_png16(a, os.path.join(d, f"f_{i:03d}.png"))


# ================================================================ 1. the grid
grid_files, gcrop = frames_of("grid")
ginfo = gcrop
nyaw, npitch = len(ginfo["yaw"]), len(ginfo["pitch"])
assert len(grid_files) == nyaw * npitch, f"grid incomplete: {len(grid_files)} of {nyaw * npitch}"
SIZE = ginfo["res"]
grid = [subtracted(f) for f in grid_files]
gh, gw = grid[0].shape[:2]
ginfo["w"], ginfo["h"] = gw, gh
report["grid_edge_max_levels"] = round(max(edge_max(a) for a in grid), 2)

# the black test on three grid frames (centre, a corner, an edge) decides the still format
centre = (npitch // 2) * nyaw + nyaw // 2
bt = black_test([grid[centre], grid[0], grid[nyaw - 1]])
report["still_black_test"] = bt
if A.still == "auto":
    # exact far ground first, then fewer bytes
    FMT = min(("webp", "avif"), key=lambda f: (bt[f]["far_ground_off"] > 0, bt[f]["bytes"]))
else:
    FMT = A.still
report["still_format"] = FMT

tiers = []
for tier, scale in (("half", 0.5), ("full", 1.0)):
    d = os.path.join(OUT, "lean", tier)
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(d)
    tw, th = round(gw * scale), round(gh * scale)
    urls, tot = [], 0
    for k, arr in enumerate(grid):
        r, c = divmod(k, nyaw)
        p = os.path.join(d, f"r{r}c{c:02d}.{FMT}")
        img = arr if scale == 1 else resize(arr, tw, th)
        save_still(to8(img), p, FMT)
        urls.append(rel(p))
        tot += size(p)
    tiers.append({"name": tier, "scale": scale, "w": tw, "h": th, "format": FMT,
                  "type": f"image/{FMT}", "frames": urls, "bytes": tot})

# ================================================================ 2. the poster
pfiles, pcrop = frames_of("poster")
parr = pad(subtracted(pfiles[0]), pcrop, pcrop["res"])
report["poster_edge_max_levels"] = round(edge_max(subtracted(pfiles[0])), 2)
poster = {"w": 1200, "h": 1200, "sources": []}
for w in (600, 1200):
    img = parr if w == pcrop["res"] else resize(parr, w, w)
    for fmt in ("avif", "webp"):
        p = os.path.join(OUT, f"poster-{w}.{fmt}")
        im8 = to8(img)
        if fmt == "webp":
            im8.save(p, "WEBP", quality=88, method=6)
        else:
            im8.save(p, "AVIF", quality=64, speed=4, subsampling="4:4:4")
        poster["sources"].append({"src": rel(p), "type": f"image/{fmt}", "w": w, "bytes": size(p)})

# ================================================================ 3. video
videos = {}
if not A.skip_video:
    # the interaction clip
    cfiles, ccrop = frames_of("clip")
    clip = [pad(subtracted(f), ccrop, SIZE) for f in cfiles]
    report["clip_edge_max_levels"] = round(max(edge_max(subtracted(f)) for f in cfiles[::4]), 2)
    write_seq(clip, os.path.join(WORK, "clip"))
    srcs = encode_video(os.path.join(WORK, "clip"), "interact", ccrop["fps"])
    videos["interact"] = {"fps": ccrop["fps"], "frames": len(clip), "duration": round(len(clip) / ccrop["fps"], 3),
                          "sources": srcs, "check": check_video(os.path.join(OUT, srcs[0]["src"]), clip[0])}

    # the droplet, forward and reversed
    dfiles, dcrop = frames_of("droplet")
    drop = [pad(subtracted(f), dcrop, SIZE) for f in dfiles]
    report["droplet_edge_max_levels"] = round(max(edge_max(subtracted(f)) for f in dfiles[::4]), 2)
    write_seq(drop, os.path.join(WORK, "droplet"))
    write_seq(drop[::-1], os.path.join(WORK, "droplet_rev"))
    for key, d in (("out", "droplet"), ("in", "droplet_rev")):
        srcs = encode_video(os.path.join(WORK, d), f"droplet-{key}", A.droplet_fps)
        videos[f"droplet-{key}"] = {"sources": srcs}
    videos["droplet-out"]["check"] = check_video(os.path.join(OUT, videos["droplet-out"]["sources"][0]["src"]), drop[0])

    # the idle loop: a slow figure-of-eight through the grid, from the grid itself
    n = round(A.idle_seconds * 30)
    full = [pad(a, gcrop, SIZE) for a in grid]
    idle = []
    for k in range(n):
        t = k / n * 2 * math.pi
        u = 0.5 + 0.25 * math.sin(t)          # yaw +-8 deg of +-16
        v = 0.5 + 0.375 * math.sin(2 * t)     # pitch +-3 deg of +-4
        fx, fy = u * (nyaw - 1), v * (npitch - 1)
        i0, j0 = min(int(fx), nyaw - 2), min(int(fy), max(0, npitch - 2))
        tx, ty = fx - i0, (fy - j0) if npitch > 1 else 0.0
        f = lambda i, j: full[j * nyaw + i]  # noqa: E731
        row0 = f(i0, j0) * (1 - tx) + f(i0 + 1, j0) * tx
        row1 = (f(i0, j0 + 1) * (1 - tx) + f(i0 + 1, j0 + 1) * tx) if npitch > 1 else row0
        idle.append(row0 * (1 - ty) + row1 * ty)
    write_seq(idle, os.path.join(WORK, "idle"))
    srcs = encode_video(os.path.join(WORK, "idle"), "idle", 30)
    videos["idle"] = {"fps": 30, "frames": n, "duration": round(n / 30, 3), "loop": True, "sources": srcs}

# ================================================================ 4. manifest
cinfo = json.load(open(os.path.join(M, "clip", "crop.json"))) if os.path.exists(os.path.join(M, "clip", "crop.json")) else {}
dinfo = json.load(open(os.path.join(M, "droplet", "crop.json"))) if os.path.exists(os.path.join(M, "droplet", "crop.json")) else {}
CLIP_NAME = {"edk": "hop", "recto": "fan", "englishprep": "pop", "eatmap": "drop", "log": "on-air"}
yaws, pitches = ginfo["yaw"], ginfo["pitch"]


def vbytes(key, codec):
    if key not in videos:
        return 0
    return sum(s["bytes"] for s in videos[key]["sources"] if s["codec"] == codec)


man = {
    "version": 1,
    "name": A.obj,
    "light": ginfo.get("accent"),
    "ground": RIG["ground"].lower(),
    "groundSubtracted": True,
    "blend": "plus-lighter",
    "size": SIZE,
    "poster": poster,
    "lean": {
        "cols": nyaw, "rows": npitch,
        "yaw": [round(y, 3) for y in yaws], "pitch": [round(p, 3) for p in pitches],
        "stepDeg": {"yaw": round(yaws[1] - yaws[0], 3) if nyaw > 1 else 0,
                    "pitch": round(pitches[1] - pitches[0], 3) if npitch > 1 else 0},
        "center": {"col": nyaw // 2, "row": npitch // 2},
        "order": "row-major; row 0 is the lowest pitch (faces down), column 0 the lowest yaw (faces left)",
        "crop": {"x": gcrop["x"], "y": gcrop["y"], "w": gw, "h": gh},
        "tiers": tiers,
    },
    "idle": videos.get("idle"),
    "clips": ({"interact": {"label": CLIP_NAME.get(A.obj), "returnsToRest": True, **videos["interact"]}}
              if "interact" in videos else {}),
    "droplet": ({"fps": A.droplet_fps, "frames": len(dfiles), "duration": round(len(dfiles) / A.droplet_fps, 3),
                 "dropletFrame": len(dfiles) - 1, "curve": dinfo.get("curve"),
                 "out": videos["droplet-out"], "in": videos["droplet-in"]} if "droplet-out" in videos else None),
}
p1200 = min(s["bytes"] for s in poster["sources"] if s["w"] == 1200)
half_b = tiers[0]["bytes"]
full_b = tiers[1]["bytes"]
man["bytes"] = {
    "poster1200": p1200,
    "leanHalf": half_b,
    "leanFull": full_b,
    "clips": {c: vbytes("interact", c) + vbytes("droplet-out", c) + vbytes("droplet-in", c) for c in CODECS},
    "idle": {c: vbytes("idle", c) for c in CODECS},
    "tiers": {
        "firstPaint": p1200,
        "phone": {c: p1200 + vbytes("idle", c) + vbytes("droplet-out", c) + vbytes("droplet-in", c) for c in CODECS},
        "desktopLow": p1200 + half_b,
        "desktopFull": {c: p1200 + half_b + full_b + vbytes("interact", c) + vbytes("droplet-out", c)
                        + vbytes("droplet-in", c) for c in CODECS},
    },
}
json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
report["bytes"] = man["bytes"]
report["checks"] = {k: v.get("check") for k, v in videos.items() if v.get("check")}
json.dump(report, open(os.path.join(M, "encode-report.json"), "w"), indent=1)
print(json.dumps(report, indent=1))
