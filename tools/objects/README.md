# Hero objects

Scripts that build the hero objects for Prototype E (ADR-0005, `prototypes/e-dark/SPEC.md`
"Objects") in headless Blender and write, into `prototypes/e-dark/objects/`:

- `<name>.glb`: the real-time object, meshopt-compressed, with named parts for animation;
- `<name>-poster.webp` (1200²) and `<name>-poster-600.webp`: the Cycles render, the still twin
  for phones, reduced motion and no WebGL;
- `compare-<name>.png`: the poster beside the GLB rendered in three.js with `rig.js`.

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

## Known gaps between poster and page

three.js transmission is screen-space: it sees opaque things behind glass but not other glass
(Recto's back pages and English Prep's reply bubble are missing from inside the front glass),
and it has no internal reflections, so thick clear glass (the edk letters) looks smoother and
brighter than in Cycles. Shadows in the page are approximations of the catcher's. The
`compare-*.png` files show where each object stands.

`make_recto.py` and `turntable.py` are the 2026-10-08 research test (`docs/research/
2026-10-3d-objects.md`), kept for reference; `recto.py` replaces the object.
