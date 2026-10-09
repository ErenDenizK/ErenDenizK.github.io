"""Encode one object's 16-bit masters (frames.py) into the site's media and its manifest
(ADR-0006 §2-3; media research §8 and its recipe).

  python3 tools/objects/encode.py edk [--masters DIR] [--out media/objects]

Needs numpy, Pillow with WebP and AVIF (the Blender venv has both) and an ffmpeg with
libsvtav1, libx265 and libx264 (Ubuntu's ffmpeg 6.1 has all three).

1. Every master is composited on the ground exactly as common.render_poster does, then the
   ground is subtracted in sRGB code values: v = max(0, px - ground). Pure black survives every
   codec; the page draws the media with mix-blend-mode: plus-lighter and adds its own ground
   back. Pixels the render had darker than the ground (the contact shadow) become 0.
2. Stills: the lean grid in two tiers (full = the rendered crop, half = half of it, at a lower quality) and the
   poster at 600 and 1200, each in the still format chosen by the black test (report.json).
3. Video: the interaction clip, the droplet clip forward and reversed (the arriving object plays
   it backward; browsers cannot play video in reverse) and an idle loop synthesised from the
   grid, each as AV1 10-bit, HEVC Main 10 (hvc1) and H.264 High, BT.709 limited range tagged,
   +faststart, no audio. Clips are padded back to the full square so they sit on the poster.
4. The floor shadow (frames.py stage `shadow`), which step 1 zeroes: a small grayscale map
   m = composite / ground, clamped to 1, meaning "multiply the ground by this". The page draws
   it under the object with mix-blend-mode: multiply, so ground * m + object reproduces the
   poster's floor.
5. manifest.json: what the media stage reads (shape in README.md, "The manifest").
6. For the live frame engine (ADR-0009), when frames.py's `normal` stage exists: the normal
   maps at half size, one vertical strip per pitch row plus the rest pose alone, and the clip
   as stills (half size strip, plus the state axis's peak at full size) with its own normals.
   `--live-only` writes just these and adds `normals` and `states` to the existing manifest.

Per-object settings that differ from the defaults (budgets, media research §7) are in OBJECT
below, so a rerun reproduces the shipped files; command-line flags override them.
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
ap.add_argument("--webp-q", type=int)
ap.add_argument("--avif-q", type=int, help="full grid tier (default 60)")
ap.add_argument("--avif-q-half", type=int, help="the half tier only stands in until the full one arrives (default 50)")
ap.add_argument("--idle-seconds", type=float)
ap.add_argument("--droplet-fps", type=int, default=60)
ap.add_argument("--videos", default="interact,droplet,idle",
                help="videos to (re-)encode; the others are kept from the existing manifest")
ap.add_argument("--skip-video", action="store_true", help="stills and manifest only (tests)")
ap.add_argument("--live-only", action="store_true",
                help="only the live engine's normals and state frames, merged into the existing manifest")
ap.add_argument("--normal-q", type=int, default=45, help="AVIF quality of the normal strips (4:4:4)")
A = ap.parse_args()

# Defaults, then per-object overrides for an object that does not fit the desktop (~1.15 MB) or
# phone (~450 KB) budget with them (media research §7). edk, thick clear glass three letters
# wide, is the heaviest: its full grid goes to AVIF q55, and its HEVC idle loop one step further.
DEFAULTS = {"webp_q": 82, "avif_q": 60, "avif_q_half": 50, "idle_seconds": 6.0}
OBJECT = {"edk": {"avif_q": 55, "idle_crf": {"hevc": "32"}}}
for k, v in {**DEFAULTS, **OBJECT.get(A.obj, {})}.items():
    if k != "idle_crf" and getattr(A, k) is None:
        setattr(A, k, v)

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


def assert_lit(arrs, what, share=0.35):
    """Stop before writing media from a broken master: every frame must show the object (more
    than 0.2 % of its pixels above 8 levels and at least `share` of the stage's median). Cycles
    once returned edk grid frames with the object's alpha but black RGB; they subtract to an
    all-black frame that nothing downstream would notice."""
    lit = [float((a.max(-1) > 8 / 255).mean()) for a in arrs]
    med = float(np.median(lit))
    bad = [k for k, v in enumerate(lit) if v < 0.002 or v < share * med]
    if bad:
        raise SystemExit(f"{A.obj} {what}: frames {bad} are empty or nearly (lit share "
                         f"{[round(lit[k], 4) for k in bad]}, median {med:.4f}); re-render them")
    return round(min(lit), 4)


def edge_max(arr):
    """Largest value on the crop's border, in 8-bit levels (> 1 means the crop cut light off)."""
    return float(max(arr[0].max(), arr[-1].max(), arr[:, 0].max(), arr[:, -1].max()) * 255)


def rel(p):
    return os.path.relpath(p, OUT).replace(os.sep, "/")


def size(p):
    return os.path.getsize(p)


def far_ground(src, r=16):
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
def save_still(img8, path, fmt, half=False):
    if fmt == "webp":
        img8.save(path, "WEBP", quality=A.webp_q - (8 if half else 0), method=6)
    else:
        img8.save(path, "AVIF", quality=A.avif_q_half if half else A.avif_q, speed=4, subsampling="4:4:4")


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


# the idle loop is made of blended grid frames (soft, always moving): it takes a higher CRF
IDLE_CRF = {"av1": "36", "hevc": "30", "h264": "27"}


def encode_video(seq_dir, name, fps, crf=None):
    """seq_dir holds f_%03d.png (16-bit, subtracted, full square). Returns the sources."""
    sources = []
    for kind, (args, pixfmt) in CODECS.items():
        if crf:
            args = list(args)
            args[args.index("-crf") + 1] = crf[kind]
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



# ================================================================ 6. the live engine (ADR-0009)
def read_normals(path):
    """A normal master (frames.py stage `normal`): camera-space n (x, y, z) and coverage."""
    im = read_rgba16(path)
    return im[..., :3] * 2 - 1, im[..., 3]


def half_normals(n, cov, w, h):
    """Halve a normal map by averaging the normals weighted by coverage (a silhouette edge does
    not pull its neighbours toward the ground's dummy normal), then renormalise. Coverage itself
    is not shipped: a hard 0-to-1 step rings under any lossy codec (AVIF q45 4:4:4 decoded up to
    125 levels on the ground beside edges), so the page gates light by the beauty frame instead,
    whose ground is exact 0. B stays 0, which also makes the strip smaller (about -18 %)."""
    def rs(a):
        return np.asarray(Image.fromarray(a.astype(np.float32), "F").resize((w, h), Image.BOX))
    c = np.clip(rs(cov), 0, 1)
    v = np.stack([rs(n[..., i] * cov) for i in range(3)], -1)
    v /= np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-6)
    out = np.dstack([v[..., 0] * 0.5 + 0.5, v[..., 1] * 0.5 + 0.5, np.zeros_like(c)])
    out[c < 1e-3, :2] = 0.5
    return out


def save_strip(tiles, path, q, fmt="avif"):
    """Frames stacked top to bottom, frame 0 at the top: the page uploads a strip into texture-array
    layers in one call (UNPACK_IMAGE_HEIGHT = one frame's height)."""
    img = to8(np.concatenate(tiles, 0))
    if fmt == "avif":
        img.save(path, "AVIF", quality=q, speed=4, subsampling="4:4:4")
    else:
        img.save(path, "WEBP", quality=q, method=6)
    return {"src": rel(path), "type": f"image/{fmt}", "bytes": size(path)}


def encode_live(prev, still_fmt):
    nd = os.path.join(M, "normal")
    if not os.path.isdir(os.path.join(nd, "grid")):
        return {}
    d = os.path.join(OUT, "live")
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(d)
    lean = prev["lean"]
    cols, rows = lean["cols"], lean["rows"]
    gcrop = json.load(open(os.path.join(nd, "grid", "crop.json")))
    assert all(gcrop[k] == lean["crop"][k] for k in ("x", "y", "w", "h")), "normals and grid crops differ"
    gfiles = sorted(f for f in os.listdir(os.path.join(nd, "grid")) if f.startswith("f_"))
    assert len(gfiles) == cols * rows, f"normal grid incomplete: {len(gfiles)} of {cols * rows}"
    hw, hh = round(lean["crop"]["w"] / 2), round(lean["crop"]["h"] / 2)
    tiles = [half_normals(*read_normals(os.path.join(nd, "grid", f)), hw, hh) for f in gfiles]
    rows_out = []
    for j in range(rows):
        rows_out.append({**save_strip(tiles[j * cols:(j + 1) * cols], os.path.join(d, f"normals-r{j}.avif"), A.normal_q),
                         "row": j, "frames": cols})
    c = lean["center"]
    rest = save_strip([tiles[c["row"] * cols + c["col"]]], os.path.join(d, "normals-rest.avif"), A.normal_q)
    dec = np.asarray(Image.open(os.path.join(OUT, rows_out[c["row"]]["src"])).convert("RGB")).astype(int)
    src = np.round(np.concatenate(tiles[c["row"] * cols:(c["row"] + 1) * cols], 0) * 255).astype(int)
    def n3(x):
        xy = x[..., :2] / 255 * 2 - 1
        return np.dstack([xy, np.sqrt(np.clip(1 - (xy ** 2).sum(-1), 0, 1))])
    on = (np.abs(src[..., :2] - 128) > 1).any(-1)   # object pixels (the ground is 128, 128)
    deg = np.degrees(np.arccos(np.clip((n3(src) * n3(dec)).sum(-1), -1, 1)))[on]
    report["normals_check"] = {"angle_mean_deg": round(float(deg.mean()), 2), "angle_p95_deg": round(float(np.percentile(deg, 95)), 2)}
    normals = {"scale": 0.5, "w": hw, "h": hh,
               "encoding": "R, G = camera-space normal x (right), y (up) as n * 0.5 + 0.5; z = sqrt(1 - x^2 - y^2); B unused (0); "
                           "the ground is (0.5, 0.5); gate light by the beauty frame",
               "rows": rows_out, "rest": rest}
    states = {}
    cd = os.path.join(nd, "clip")
    if os.path.isdir(cd) and os.path.isdir(os.path.join(M, "clip")):
        ninfo = json.load(open(os.path.join(cd, "crop.json")))
        cfiles, ccrop = frames_of("clip")
        assert all(ninfo[k] == ccrop[k] for k in ("x", "y", "w", "h")), "clip normals and clip crops differ"
        n = ninfo["frames"]
        nfiles = sorted(f for f in os.listdir(cd) if f.startswith("f_"))[:n]
        assert ninfo["axis"] != "state" or len(nfiles) == n, f"clip normals incomplete: {len(nfiles)} of {n}"
        cw, ch = round(ccrop["w"] / 2), round(ccrop["h"] / 2)
        beauty = [subtracted(f) for f in cfiles[:n]]
        assert_lit(beauty, "clip")
        if ninfo["axis"] == "state":
            # a state axis can rest anywhere (a held hover keeps Recto fanned), so it gets its own
            # normals; a time axis is over in a second and the page fades the light out during it
            normals["clips"] = {"interact": {"crop": {k: ccrop[k] for k in ("x", "y", "w", "h")}, "w": cw, "h": ch, "frames": n,
                                             **save_strip([half_normals(*read_normals(os.path.join(cd, f)), cw, ch) for f in nfiles],
                                                          os.path.join(d, "clip-normals.avif"), A.normal_q)}}
        half = [resize(b, cw, ch) for b in beauty]
        q_half = A.avif_q_half if still_fmt == "avif" else A.webp_q - 8
        st = {"axis": ninfo["axis"], "fps": ninfo["fps"], "frames": n, "crop": {k: ccrop[k] for k in ("x", "y", "w", "h")},
              "half": {"w": cw, "h": ch, **save_strip(half, os.path.join(d, f"clip-half.{still_fmt}"), q_half, still_fmt)}}
        if ninfo["axis"] == "state":
            st["peak"] = ninfo["peak"]
            st["values"] = ninfo["values"]
            p = os.path.join(d, f"clip-peak.{still_fmt}")
            save_still(to8(beauty[ninfo["peak"]]), p, still_fmt)
            st["peakFull"] = {"w": ccrop["w"], "h": ccrop["h"], "src": rel(p), "type": f"image/{still_fmt}", "bytes": size(p)}
        states["interact"] = st
    return {"normals": normals, "states": states}


def live_bytes(man):
    """What each live tier fetches beyond what the page already has (README "The manifest")."""
    nm, st = man.get("normals"), man.get("states", {}).get("interact")
    if not nm:
        return None
    first = man["bytes"]["tiers"]["firstPaint"]
    lean = man["lean"]
    full = next(t for t in lean["tiers"] if t["name"] == "full")
    c = lean["center"]
    rest_full = size(os.path.join(OUT, full["frames"][c["row"] * lean["cols"] + c["col"]]))
    clip_n = nm.get("clips", {}).get("interact", {}).get("bytes", 0)
    st_b = (st["half"]["bytes"] + st.get("peakFull", {}).get("bytes", 0)) if st else 0
    drop = sum(s["bytes"] for k in ("out", "in") for s in man["droplet"][k]["sources"] if s["codec"] == "av1") if man.get("droplet") else 0
    return {"normalsGrid": sum(r["bytes"] for r in nm["rows"]), "normalsRest": nm["rest"]["bytes"],
            "clipNormals": clip_n, "states": st_b, "restFull": rest_full,
            "tiers": {"phoneLive": first + rest_full + nm["rest"]["bytes"],
                      "desktopLite": first + man["bytes"]["leanHalf"] + nm["rest"]["bytes"] + st_b + drop,
                      "desktopFull": first + man["bytes"]["leanHalf"] + rest_full + sum(r["bytes"] for r in nm["rows"])
                      + clip_n + st_b + drop},
            "note": "desktop tiers add full-size grid frames on demand at rest (lean/full, about 10 KB each)"}


if A.live_only:
    man = json.load(open(os.path.join(OUT, "manifest.json")))
    fmt = next(t for t in man["lean"]["tiers"] if t["name"] == "full")["format"]
    man.update(encode_live(man, fmt))
    lb = live_bytes(man)
    if lb:
        man["bytes"]["live"] = lb
    json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    rp = os.path.join(M, "encode-report.json")
    old = json.load(open(rp)) if os.path.exists(rp) else {}
    old.update({k: v for k, v in report.items() if k != "obj"})
    old.setdefault("bytes", {})["live"] = lb
    json.dump(old, open(rp, "w"), indent=1)
    print(json.dumps({"normals_check": report.get("normals_check"), "live": lb}, indent=1))
    raise SystemExit(0)


# ================================================================ 1. the grid
grid_files, gcrop = frames_of("grid")
ginfo = gcrop
nyaw, npitch = len(ginfo["yaw"]), len(ginfo["pitch"])
assert len(grid_files) == nyaw * npitch, f"grid incomplete: {len(grid_files)} of {nyaw * npitch}"
SIZE = ginfo["res"]
grid = [subtracted(f) for f in grid_files]
report["grid_min_lit_share"] = assert_lit(grid, "grid")
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
        save_still(to8(img), p, FMT, half=scale != 1)
        urls.append(rel(p))
        tot += size(p)
    tiers.append({"name": tier, "scale": scale, "w": tw, "h": th, "format": FMT,
                  "type": f"image/{FMT}", "frames": urls, "bytes": tot})

# ================================================================ 2. the poster
pfiles, pcrop = frames_of("poster")
parr = pad(subtracted(pfiles[0]), pcrop, pcrop["res"])
assert_lit([parr], "poster")
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
WANT = set() if A.skip_video else {v.strip() for v in A.videos.split(",") if v.strip()}
prev_path = os.path.join(OUT, "manifest.json")
prev = json.load(open(prev_path)) if os.path.exists(prev_path) else {}
# kept videos: their files are already in OUT, their entries come from the previous manifest
if "interact" not in WANT and prev.get("clips", {}).get("interact"):
    videos["interact"] = {k: v for k, v in prev["clips"]["interact"].items() if k not in ("label", "returnsToRest")}
if "droplet" not in WANT and prev.get("droplet"):
    videos["droplet-out"], videos["droplet-in"] = prev["droplet"]["out"], prev["droplet"]["in"]
if "idle" not in WANT and prev.get("idle"):
    videos["idle"] = prev["idle"]
drop_n = prev["droplet"]["frames"] if prev.get("droplet") else 0

if "interact" in WANT:
    cfiles, ccrop = frames_of("clip")
    clip = [pad(subtracted(f), ccrop, SIZE) for f in cfiles]
    assert_lit(clip, "clip")
    report["clip_edge_max_levels"] = round(max(edge_max(subtracted(f)) for f in cfiles[::4]), 2)
    write_seq(clip, os.path.join(WORK, "clip"))
    srcs = encode_video(os.path.join(WORK, "clip"), "interact", ccrop["fps"])
    videos["interact"] = {"fps": ccrop["fps"], "frames": len(clip), "duration": round(len(clip) / ccrop["fps"], 3),
                          "sources": srcs, "check": check_video(os.path.join(OUT, srcs[0]["src"]), clip[0])}

if "droplet" in WANT:
    # the droplet, forward and reversed
    dfiles, dcrop = frames_of("droplet")
    drop_n = len(dfiles)
    drop = [pad(subtracted(f), dcrop, SIZE) for f in dfiles]
    assert_lit(drop, "droplet", share=0)   # the object shrinks into the droplet on purpose
    report["droplet_edge_max_levels"] = round(max(edge_max(subtracted(f)) for f in dfiles[::4]), 2)
    write_seq(drop, os.path.join(WORK, "droplet"))
    write_seq(drop[::-1], os.path.join(WORK, "droplet_rev"))
    for key, d in (("out", "droplet"), ("in", "droplet_rev")):
        srcs = encode_video(os.path.join(WORK, d), f"droplet-{key}", A.droplet_fps)
        videos[f"droplet-{key}"] = {"sources": srcs}
    videos["droplet-out"]["check"] = check_video(os.path.join(OUT, videos["droplet-out"]["sources"][0]["src"]), drop[0])

if "idle" in WANT:
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
    srcs = encode_video(os.path.join(WORK, "idle"), "idle", 30,
                        {**IDLE_CRF, **OBJECT.get(A.obj, {}).get("idle_crf", {})})
    videos["idle"] = {"fps": 30, "frames": n, "duration": round(n / 30, 3), "loop": True, "sources": srcs}

# ================================================================ 4. the floor shadow
shadow = None
sdir = os.path.join(M, "shadow")
if os.path.isdir(sdir) and any(f.startswith("f_") for f in os.listdir(sdir)):
    sfiles, scrop = frames_of("shadow")
    im = read_rgba16(sfiles[0])
    a = im[..., 3:4]
    comp = im[..., :3] * a + G * (1 - a)              # as common.render_poster, in code values
    m = np.clip(comp.mean(-1) / G.mean(), 0, 1)        # grey: the ground is neutral to 1 level
    # a 1 px blur takes the catcher's sampling grain out; the shadow is soft anyway
    k = np.exp(-0.5 * np.arange(-3, 4) ** 2)
    k /= k.sum()
    for ax in (0, 1):
        m = np.apply_along_axis(lambda r: np.convolve(np.pad(r, 3, mode="edge"), k, "valid"), ax, m)
    m = np.clip(m, 0, 1)
    # The key shadow can run off the square (Recto's does); the page's ground continues past
    # the square, so the shadow fades out over the outer 12 % instead of ending on a straight edge
    hh, ww = m.shape
    d = np.minimum.outer(np.minimum(np.arange(hh), hh - 1 - np.arange(hh)),
                         np.minimum(np.arange(ww), ww - 1 - np.arange(ww))) / (0.12 * min(hh, ww))
    d = np.clip(d, 0, 1)
    m = 1 - (1 - m) * d * d * (3 - 2 * d)
    m[m > 0.995] = 1.0                                 # far floor: exactly "no change"
    sw = m.shape[1]
    im8 = Image.fromarray(np.round(m * 255).astype(np.uint8), "L")
    shadow = {"blend": "multiply", "pose": "rest", "w": sw, "h": m.shape[0], "min": round(float(m.min()), 3),
              "sources": []}
    for fmt in ("avif", "webp"):
        p = os.path.join(OUT, f"shadow.{fmt}")
        if fmt == "avif":
            im8.save(p, "AVIF", quality=70, speed=4)
        else:
            im8.save(p, "WEBP", quality=80, method=6)
        dec = np.asarray(Image.open(p).convert("L")).astype(int)
        report[f"shadow_{fmt}"] = {"bytes": size(p), "max_err_levels": int(np.abs(dec - np.round(m * 255)).max()),
                                   "white_off": int((dec[m == 1] != 255).sum())}
        shadow["sources"].append({"src": rel(p), "type": f"image/{fmt}", "bytes": size(p)})

# ================================================================ 5. manifest
cinfo = json.load(open(os.path.join(M, "clip", "crop.json"))) if os.path.exists(os.path.join(M, "clip", "crop.json")) else {}
dinfo = json.load(open(os.path.join(M, "droplet", "crop.json"))) if os.path.exists(os.path.join(M, "droplet", "crop.json")) else {}
CLIP_NAME = {"edk": "hop", "recto": "fan", "englishprep": "pop", "eatmap": "drop", "log": "on-air", "record": "lift"}
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
    "droplet": ({"fps": A.droplet_fps, "frames": drop_n, "duration": round(drop_n / A.droplet_fps, 3),
                 "dropletFrame": drop_n - 1, "curve": dinfo.get("curve"),
                 "out": videos["droplet-out"], "in": videos["droplet-in"]} if "droplet-out" in videos else None),
}
if shadow:
    man["shadow"] = shadow
p1200 = min(s["bytes"] for s in poster["sources"] if s["w"] == 1200)
half_b = tiers[0]["bytes"]
full_b = tiers[1]["bytes"]
sh_b = min(s["bytes"] for s in shadow["sources"]) if shadow else 0
p1200 += sh_b   # the shadow ships with the poster: every tier below includes it
man["bytes"] = {
    "shadow": sh_b,
    "poster1200": p1200 - sh_b,
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
man.update(encode_live(man, FMT))
if live_bytes(man):
    man["bytes"]["live"] = live_bytes(man)
json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
report["bytes"] = man["bytes"]
report["checks"] = {k: v.get("check") for k, v in videos.items() if v.get("check")}
json.dump(report, open(os.path.join(M, "encode-report.json"), "w"), indent=1)
print(json.dumps(report, indent=1))
