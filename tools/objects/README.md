# Hero objects

Scripts that build the hero objects for Prototype E (ADR-0005, `prototypes/e-dark/SPEC.md`
"Objects") in headless Blender and write, into `prototypes/e-dark/objects/`:

- `<name>.glb`: the real-time object, meshopt-compressed, with named parts for animation;
- `<name>-poster.webp` (1200²) and `<name>-poster-600.webp`: the Cycles render, the still twin
  for phones, reduced motion and no WebGL;
- `compare-<name>.png`: the poster beside the GLB rendered in three.js with `rig.js`.

Since ADR-0006 the site ships pre-rendered frames and clips instead (`frames.py`, `encode.py`,
"Pre-rendered media" below); the GLBs stay as source and for experiments.

| Script | Object | Parts (children of the root node of the same name) |
|---|---|---|
| `edk.py` | glass "edk" wordmark (Inter Display Bold) | `e`, `d`, `k` |
| `recto.py` | glass page stack, folded corner, steel clip | `page_1`, `page_2`, `page_3`, `fold`, `title`, `lines`, `clip` |
| `englishprep.py` | sakura glass speech bubble with "Aa" | `bubble`, `A`, `a`, `reply`, `dots` |
| `eatmap.py` | rose glass map pin over a ceramic plate | `pin`, `plate` |
| `log.py` | glass studio microphone | `head`, `core`, `band`, `neck`, `stem`, `base`, `led` |
| `about.py` | round gold-wire glasses | `rim_left`, `rim_right`, `bridge`, `temple_left`, `temple_right`, `lens_left`, `lens_right` |
| `calib.py` | chrome, clay and glass balls (rig check only) | `chrome`, `clay`, `glass` |

Every part has its origin at the centre of its bounds. The root node carries glTF extras:
`accent` (the rim colour) and `stage` (the poster's camera and backlight).

## The rig: why the page matches the poster

`rig.json` is the single source for everything both renderers must agree on: the camera
direction and framing, the key and rim lights, the studio HDRI, tone mapping, exposure and the
ground. `common.py` sets Cycles up from it; `prototypes/e-dark/objects/rig.js` embeds a copy
(and the HDRI as base64) and sets three.js up the same way:

- **Environment:** `make_env.py` paints a small studio HDRI (softboxes on a dark sphere) from
  `rig.json` and writes `studio.hdr`. Cycles lights with it; three.js PMREM-filters the same
  pixels. Rays leaving glass see the ground colour in Cycles, as three.js transmission sees
  the page.
- **Lights:** key and rim are suns in Cycles and directional lights in three.js with the same
  strengths (both divide by pi the same way). Only the key casts shadows, in both.
- **Backlight:** a soft accent disc behind the object that only rays passing through glass see
  (Cycles ray visibility; in three.js it is drawn only into the transmission buffer). It is
  what makes glass read on a black ground.
- **Tone mapping:** Khronos PBR Neutral in both (`View Transform` in Blender,
  `NeutralToneMapping` in three.js), the same published curve, so colours like the Recto lime
  survive and exposure means the same thing. AgX is available (`"toneMapping": "agx"`), but
  Blender's and three.js's AgX are not identical curves.
- **Ground:** the poster uses a shadow catcher composited over `#0A0A0B`; the page uses a
  `ShadowMaterial` plane for the key shadow plus a blurred depth-from-below contact shadow.
- **Camera:** `common.stage()` frames each object from its bounds and stores the camera in the
  GLB; `rig.frameCamera(camera, object)` uses it.

## Running

Needs Python 3.13 with `bpy` (5.2 LTS) and Pillow, Node with `@gltf-transform/cli` 4, and
for the comparison Playwright with Chromium and the three@0.170.0 package. The fonts are Inter
Display (SIL OFL), looked up in `/usr/share/fonts/opentype/inter` or `~/.fonts`; without them
Blender's built-in font is used.

```sh
python3.13 -m venv /tmp/obj-venv && /tmp/obj-venv/bin/pip install "bpy==5.2.*" pillow
python3 tools/objects/make_env.py                 # after editing rig.json (needs numpy)
/tmp/obj-venv/bin/python tools/objects/recto.py   # options: --samples 128 --res 1200 --out DIR
                                                  #          --no-render --blend file.blend
THREE_DIR=node_modules/three PLAYWRIGHT=<playwright package> \
  node tools/objects/compare.mjs recto            # writes compare-recto.png
```

`GLTF_TRANSFORM=<path to the gltf-transform binary>` avoids `npx`. EEVEE needs libEGL, so the
posters use Cycles on the CPU: about 5–10 minutes per poster at 1200² and 128 samples on four
cores. Thickness values in the scripts are in modelling units (before `fit()` scales the root);
gltf-transform keeps them consistent through quantisation.

## Pre-rendered media (ADR-0006)

The site does not ship three.js for objects: every pixel of an object at rest is a Cycles
frame. Two scripts turn each object script into the media in `media/objects/<name>/`:

```sh
export OBJECT_MASTERS=/somewhere/outside/the/repo      # 16-bit masters, ~0.5 GB per object
<venv>/bin/python tools/objects/frames.py edk          # poster, grid, clip, droplet (hours)
<venv>/bin/python tools/objects/frames.py edk --stage grid   # one stage; reruns resume
<venv>/bin/python tools/objects/encode.py edk          # media + manifest.json (minutes)
```

`frames.py` builds the object with its own script (`--no-render --no-export`), hangs it from
a pivot at its bounds centre, and renders one stage per Blender process:

| Stage | What | Defaults |
|---|---|---|
| `poster` | the centre pose, first paint | 1200², 128 spp |
| `grid` | the lean grid, 17 yaw × 3 pitch: yaw ±16° in 2° steps, pitch −4°/0°/+4° | 1040², 32 spp + OIDN |
| `clip` | the object's micro-interaction, rest → rest, 30 fps (`CLIPS` in `frames.py`) | 30–45 frames |
| `droplet` | rest → the shared glass droplet, ease-in cubic, uniform in time | 24 frames |
| `shadow` | the rest pose's floor shadow alone: the object hidden from the camera, still casting | 600², 128 spp, whole square |

Yaw turns the object about its vertical axis (positive faces right), as the page's lean did;
pitch orbits the camera about the same centre (positive faces up), so the object stays on its
floor. Settings from the render bake-off: 12 transmission bounces, persistent data, a fixed
seed (the denoiser does not flicker between poses), and a crop to what will survive ground
subtraction, found from small previews of the extreme poses (`<stage>/crop.json`; a resumed
run keeps it, so delete the stage's folder after changing an object). After about fifty
re-renders in one session, persistent data started returning frames with the object missing
(edk's grid, and the bake-off's): `frames.py` flushes it every 16 frames and re-renders any
frame whose coverage collapses against the previous one. The
interactions follow prototype E's `MICRO` code: edk's letters hop in sequence; Recto's back
pages fan out on a spring and settle back; English Prep's bubble pops, A and a bob, the reply
ducks and pops back in and its dots bounce; Eat Map's pin rises, drops onto the plate (the
landing is ray-cast onto the glaze), squashes about its tip and lifts home; Log's LED, dim and
blue at rest, goes on air (six times brighter) while three soft accent rings ripple out round
the head, growing to 1.8 head radii so they stay inside the square. Every clip starts and ends on the
grid's centre frame. The droplet is the bake-off's melt with a real glass sphere grown over the
last 45 %; camera and backlight glide to canonical values, so every object's last frame is the
same droplet and only the accent light differs.

`encode.py` composites each master on the ground exactly as `common.render_poster` does,
subtracts the ground (`max(0, px − #0A0A0B)`, so the ground becomes exact black) and writes:

- `poster-600|1200.avif|webp`;
- `lean/half/` and `lean/full/`: the grid as stills, `r<row>c<col>.<ext>`, cropped to the
  rectangle in the manifest. The format is chosen by a black test on three grid frames (bytes,
  object error, and whether ground far from the object decodes to exact 0), recorded in
  `$OBJECT_MASTERS/<name>/encode-report.json`;
- `shadow.avif|webp`: the floor shadow as a 600² grayscale map, `m = composite / ground`
  clamped to 1 and feathered to exactly 1 over the outer 12 % of the square (a key shadow can run
  off it, and the page's ground does not stop there), meaning "multiply the ground by this";
- `interact.*.mp4`, `droplet-out.*.mp4`, `droplet-in.*.mp4` (the same clip reversed, because
  browsers cannot play video backwards) and `idle.*.mp4` (a 6 s figure-of-eight through the
  grid, synthesised from the grid frames: no extra render). Each as `av1` (10-bit), `hevc`
  (Main 10, `hvc1`) and `h264` (High, 8-bit), BT.709 limited range, `+faststart`, no audio.
  Clips are padded to the full square so they sit exactly on the poster.

Per-object settings that differ from the defaults are in `OBJECT` in `encode.py` (edk: full
grid at AVIF q55 rather than 60, HEVC idle at CRF 32 rather than 30, to fit the budgets). Every
master stage is checked before anything is written: an empty or near-empty frame stops the
encode (`assert_lit`), and `frames.py` re-renders a frame whose coverage or light collapses.
`--videos interact,droplet,idle`
picks which videos to re-encode; the others are kept from the existing manifest.

### The manifest

`media/objects/<name>/manifest.json`; URLs are relative to it. All pixel coordinates are in the
`size` square (the grid's frame); the poster and videos cover the whole square.

```js
{
  version: 1, name: "edk", light: "#c9d4ff",          // accent: rim and backlight colour
  ground: "#0a0a0b", groundSubtracted: true, blend: "plus-lighter",
  size: 1040,
  poster: { w: 1200, h: 1200, sources: [{ src, type: "image/avif", w: 600|1200, bytes }] },
  lean: {
    cols: 17, rows: 3, yaw: [-16 … 16], pitch: [-4, 0, 4],   // degrees per column / row
    stepDeg: { yaw: 2, pitch: 4 }, center: { col: 8, row: 1 },
    order: "row-major; row 0 is the lowest pitch (faces down), column 0 the lowest yaw (faces left)",
    crop: { x, y, w, h },                    // where every grid frame sits in the square
    tiers: [{ name: "half"|"full", scale, w, h, format, type, frames: [url × cols·rows], bytes }]
  },
  idle:  { fps: 30, frames: 180, duration: 6, loop: true, sources },
  clips: { interact: { label: "hop", returnsToRest: true, fps, frames, duration, sources } },
  droplet: { fps: 60, frames: 24, duration: 0.4, dropletFrame: 23, curve,
             out: { sources },                // rest → droplet: the leaving object, forward
             in:  { sources } },              // droplet → rest: the arriving object
  shadow: { blend: "multiply", pose: "rest", w: 600, h: 600, min,   // optional; covers the square
            sources: [{ src, type: "image/avif"|"image/webp", bytes }] },
  bytes: { shadow, poster1200, leanHalf, leanFull, clips: {av1, hevc, h264}, idle: {…},
           tiers: { firstPaint, phone: {…}, desktopLow, desktopFull: {…} } }   // tiers include the shadow
}
// sources: [{ src, type: 'video/mp4; codecs="av01.0.08M.10"', codec: "av1"|"hevc"|"h264", bytes }]
// in that order; take the first one canPlayType() accepts.
```

Drawing it (ADR-0006 §2–4; media research §8): put poster, canvas and videos in one square
whose element paints `background: var(--ground)` itself, each drawn with
`mix-blend-mode: plus-lighter`. The canvas covers `lean.crop` (as percentages of `size`) and
draws the four nearest grid frames with weights summing to 1 using
`globalCompositeOperation = "lighter"`, which is the exact bilinear blend; at rest, settle on
an exact frame. The optional `shadow` goes first in the square, covering all of it, with
`mix-blend-mode: multiply` (not plus-lighter): ground × shadow + object reproduces the poster's
floor, which ground subtraction had zeroed. It belongs to the rest pose, so the page fades it a
little with lean (the check page: opacity 1 − 0.3 × lean, lean 0…1 to the grid's edge) and out
with `droplet.out`, back in with `droplet.in`. On a #0A0A0B ground it can only darken by 10
levels, which is all the Cycles poster's shadow does. Hide the poster once the canvas has drawn, and the canvas once a clip's first
frame is up (`requestVideoFrameCallback`). A change plays the leaving object's `droplet.out`,
cross-fades at `dropletFrame`, then plays the arriving object's `droplet.in`. The check page
used during the build is in the session scratch (`pipe/check/check.html`), not committed.

## Known gaps between poster and page

three.js transmission is screen-space: it sees opaque things behind glass but not other glass
(Recto's back pages and English Prep's reply bubble are missing from inside the front glass),
and it has no internal reflections, so thick clear glass (the edk letters) looks smoother and
brighter than in Cycles. Shadows in the page are approximations of the catcher's. The
`compare-*.png` files show where each object stands.

`make_recto.py` and `turntable.py` are the 2026-10-08 research test (`docs/research/
2026-10-3d-objects.md`), kept for reference; `recto.py` replaces the object.
