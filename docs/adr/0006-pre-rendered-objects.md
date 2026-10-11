# ADR-0006: Objects are pre-rendered Cycles frames; real time is only glue

**Status:** accepted 2026-10-09 (owner: "fake it with very high-resolution photos and video; a
still first, the moving version behind it"); **under review 2026-10-10:** the owner finds the
objects stutter in tiny movements and may bring real-time 3D back on desktop once the performance
difference is reported (brief, "Look, motion and objects"; `docs/PLAN.md` track 7); the stutter
causes inside this pipeline were fixed on 2026-10-10 (amendment below), and the softness and "2.5D" look
the same evening (second amendment). A new ADR would
supersede item 7 and ADR-0001 item 2 · **Amends:** ADR-0005 items 2 and 3 ·
**Rests on:** brief §7 (2026-10-09, after prototype E); `research/2026-10-render-bakeoff.md`,
`research/2026-10-3d-quality.md`, `research/2026-10-media.md`

## Context

In-page three.js could not reach the Cycles render: transmission sees one opaque layer, never
glass behind glass, and has no internal reflection. Measured at a leaned pose against Cycles,
real time scored SSIM 0.49 (edk) and 0.82 (Recto); Cycles frames shipped as WebP scored 0.99.
Premium 3D sites mostly pay for the look offline and keep real time thin.

## Decision

1. **Every pixel of an object at rest is a Cycles frame.** Per object, from its committed
   Blender script and `rig.json`:
   - a poster (first paint, and the centre frame of the grid);
   - a lean grid of stills (about 17 yaw × 3 pitch at 2° steps; 33 × 3 at 1° since 2026-10-10 for edk and 2026-10-11 for the others), which also made the idle drift;
   - one clip per micro-interaction (30–45 frames);
   - one clip melting into the shared glass droplet (24 frames).
2. **Formats.** Grids are stills (fast to decode, exact to scrub). Linear clips are video:
   AV1 10-bit, then HEVC Main 10 (`hvc1`), then H.264, BT.709 matrix and primaries, limited range,
   the sRGB transfer tagged (`iec61966-2-1`, since 2026-10-10; see Consequences), no audio,
   `+faststart`. Frames are rendered on the exact ground, the ground is subtracted, and media is
   drawn with `mix-blend-mode: plus-lighter`, so the page's own ground shows through exactly.
   Anything that fades or moves around blended media paints the ground itself.
3. **Loading order.** HTML and poster first (no loader) → half-resolution grid → full grid →
   clips → the next likely object. Keep 25–40 decoded frames; drop the rest.
4. **Interaction.** The pointer maps onto the grid, blending the four nearest frames, and comes
   to rest on an exact frame. Micro-interactions play their clip. Wide glows and the project
   colour live in CSS, not in the media.
5. **Tab change.** The old object's droplet clip plays forward, a short crossfade at the shared
   droplet, the new object's clip plays backward: one clip per object, not one per pair.
6. **Tiers.** Desktop: everything. Phone: poster, idle loop (the object's spin loop instead where its
   manifest has one, 2026-10-10: `research/2026-10-phone-motion.md`) and droplet clips. Reduced motion,
   Save-Data, or a rejected `play()` (Low Power Mode): poster only, no play button.
7. **Real-time GLBs** stay in `tools/objects/` as the source and for later experiments, but the
   site does not ship three.js for objects.

## Amendment 2026-10-10: stutter fixes inside the pre-rendered pipeline (option a)

The real-time 3D study (`research/2026-10-realtime-3d.md` §1, option a) and the site audit
(`research/2026-10-site-audit.md` §3-4) traced the "tiny stuttering movements" to causes inside this
pipeline. Fixed in `src/scripts/media.ts`, `src/scripts/lean.ts` and `global.css`; technique decided
by the agent, the look of the float is the owner's to judge.

- **Items 1 and 6, the idle:** the idle loop is no longer played. It was built from crossfaded 2°
  stills (sharpness pulsing 4:1 about four times a second) and had a seam every 6 s (edk: last-to-first
  step 3.2x the median). In its place the **float**: the layer showing the exact poster (or lean frame)
  moves as a whole on three slow sines (bob 0.55 % of the square, sway 0.18 %, roll 0.25°; periods
  7.0, 11.9 and 8.9 s, the live engine's), transform only. A CSS animation is not refused by Low Power
  Mode the way `video.play()` is. Phones and tablets keep a real-rendered spin where the manifest has
  one (edk; its seam is 0.15x a step). `?idle=blend` brings the old loop back for comparison. The idle
  files stay in the manifests and on disk, unfetched.
  Measured on the Home object at rest, 60 screenshots over 4-11 s, Laplacian variance over the
  object: DPR 1 max/min 4.58 → 2.01 (the rest is sub-pixel resampling of a moving exact frame);
  DPR 2 4.28 → 1.38.
- **Item 3, decoded frames (amended):** where the lean canvas shows more pixels than the half-size
  frames have (more than 1.1x: DPR 2, or the large Work slots), the full-size files are fetched in the
  background after the half grid and decoded at the canvas's own size around the current pose, in an
  LRU capped at 40 MB per object (8-30 frames), and the lean blends those, never a mix of sizes. So
  moving and resting are equally sharp: no soft-to-sharp pop when the hand stops (edk at DPR 2: 93 of
  93 frames of a slow sweep drawn from full-size frames). Cost: the full tier per leaned object
  (0.41-0.65 MB of AVIF), while the 0.2-0.26 MB idle video is no longer fetched.
- **Item 4, interaction (amended):** the lean answers a pointer near the object only: full lean at one
  object width from its centre, faded out between 1 and 1.8 widths; a pointer that leaves the window
  returns it to rest; a scroll re-aims it. It moves on a spring (ζ 0.9, about 300 ms), so the pose
  never changes speed in a step. 90 ms after the pointer rests, the target moves to an exact cell
  chosen ahead in the direction of travel (unless that is more than 0.7 of a cell away), so the settle
  is the tail of the hand's movement: measured after a stop, backtrack 0.003 of a cell (before: a
  0.33-cell turn back starting 300 ms after the stop) and the exact frame at about 360 ms (before:
  958 ms, then a sharpness step). With no idle loop there is no handoff between lean and idle and no
  hidden video under the lean. A press while leaning glides to the rest pose first (stiff, critically
  damped, about 250 ms) and the clip starts there (measured within 0.1 of a cell of the centre); the
  lean resumes from the rest pose afterwards.
- **Item 5, droplet:** the melt plays at its own rate (24 frames at 60 fps, 400 ms) instead of 1.143x.
- **Not done:** a 1° yaw grid. Moving the hand still crossfades between 2° columns (the remaining
  stepping, only while the hand moves); halving it costs a night of Blender renders and doubles the
  grid bytes per object. Left for the owner's eye on a real screen first.

## Amendment 2026-10-10, evening: every frame as sharp as the poster (softness and the "2.5D" look)

The owner, on the live site (desktop, a laptop screen): the renders look very blurry, "sort of 2.5D",
as if bugged. Measured in Playwright Chromium at DPR 1, 1.25, 1.5 and 2 (1440 x 900, the Home object),
screenshots on whole device pixels with the page's ground subtracted, Laplacian variance (LV) over the
object against the ideal of what the frame should show: the poster, or the exact grid frame nearest the
pose, Lanczos-reduced to the slot's device size. A slow pointer sweep was captured frame by frame (41
frames, the lean's own state read alongside). Technique decided by the agent; the look stays the owner's.

**Causes, each isolated on the page and measured (LV, 1 = the ideal or the stated control):**

- **The float resampled the bitmap all the time.** Its roll (0.25°) and its sub-pixel bob and sway
  moved the exact poster by fractions of a pixel: frozen mid-roll 0.48-0.58 of the still, mid-bob
  0.51-0.58. A photograph of a 3D object turning in its own plane also reads as a card, the "2.5D".
- **The lean crossfaded 2° neighbours** in nearly every pose of a moving hand (3-11 of 41 sweep frames
  exact): a 50/50 mix keeps 0.49 of a frame's LV and shows every edge twice.
- **The lean canvas was resampled by the compositor as a whole.** Its box was a percentage of the slot
  (365.33 px at x 929.64): 0.45 of a native `<img>` of the same frame at DPR 1.5, 0.76 at 1.25; at
  DPR 2 a box half a CSS pixel wide (odd device widths) kept 49 of 191 levels of a 1-px checkerboard.
  A frame stretched by one pixel in height (215 to 216) cost as much at DPR 1.25.
- **The poster was drawn between device pixels** at DPR 1.25 (470 CSS px = 587.5 px at x 1097.9):
  0.54 of the same file drawn on whole pixels. And any reduction costs: Chrome reducing the 600 or
  1200 poster to the slot kept 0.61 (DPR 1), 0.26 (1.25), 0.85 (1.5), 0.65 (2) of a Lanczos reduction.
- **The browser's resize filters are soft** at the lean's ratios (0.56-0.9): `createImageBitmap`
  (`resizeQuality` high or medium), `drawImage` and the page's paint kept 0.68-0.79 of Lanczos.
- **The half tier stood in at DPR 1** (404 px reduced to 365: 0.78-0.89 of the full tier).
- **The pointer parallax** slid the poster up to 6 px like a card wherever the lean was not loaded.
- Not causes: `plus-lighter` and the ground subtraction (removing every blend mode changed nothing,
  0.41-0.42 either way); the glint (0.07 % of the object's energy over a leaned frame); video (at rest
  everything is a still; clips play only on a press and the droplet). Small, kept: the full tier's AVIF
  (0.89-0.94 of the 16-bit master), and the grid's 32-sample render, 0.76-1.08 of the poster at the
  hand-over (below).

**Fixes** (`src/scripts/media.ts`, `src/scripts/lean-resize.worker.ts`, `global.css`, `encode.py`):

1. The float is the bob alone, as WAAPI steps of whole device pixels (`bobFrames`); sway and roll are
   gone. Frozen at any step it is as sharp as the still.
2. The lean shows one exact frame for most poses and dissolves to the next over the middle 24 % of a
   step (`snapT`, still tied to the pose). edk's grid is now **1° in yaw** (33 x 3, rendered for the
   new odd columns; the even ones are the old renders, bit-identical): the change from frame to frame
   during a sweep is 1.36 mean levels (median; max 2.20) against 1.81 (max 3.19) for 2° snapped. The
   other objects keep 2° until their odd columns are rendered (about 40-110 minutes each).
3. The canvas holds exactly the device pixels it covers: its box is snapped outward to the smallest
   whole CSS length that is whole device pixels (`grid()`: 1 px at DPR 1 and 2, 2 at 1.5, 4 at 1.25)
   in document space, and the frame is drawn inside at its own place, never stretched. A 1-px
   checkerboard drawn into it survives at every DPR. It is a CPU canvas (`willReadFrequently`).
4. Full-size frames are decoded at exactly the device size and Lanczos-3 filtered in a worker (up to
   1.5x the file's size); the browser's resize stands in where there is no worker or OffscreenCanvas.
   The full tier is used wherever the half would be drawn above 0.75 of its size (DPR 1 too).
5. The stage and the contact shadow are fitted to the same device grid (`fit()`), at most half a grid
   step from the slot's box, and the poster comes at the slot's exact device width: `encode.py
   --poster-only` adds widths per object (`SLOTS`, `poster_widths`: edk 470, 590, 705, 940; the projects
   400-960; Record 320-640; 4-25 KB each), so the page draws it 1:1.
6. The pointer parallax is removed.

**Before and after** (LV against the ideal; DPR 1 / 1.25 / 1.5 / 2):

| | before | after |
|---|---|---|
| poster at rest | 0.61 / 0.26 / 0.85 / 0.65 | 0.79 / 0.80 / 0.81 / 0.83 |
| floating, worst frame | 0.19 / 0.19 / 0.31 / 0.29 | as at rest |
| floating, median | 0.29 / 0.21 / 0.44 / 0.35 | as at rest |
| slow sweep, median frame | 0.14 / 0.14 / 0.18 / 0.22 | 0.88 / 0.88 / 0.88 / 0.88 |
| slow sweep, exact frames | 3 / 11 / 7 / 10 of 41 | 38 / 39 / 41 / 41 of 41 |
| lean at rest | 0.18 / 0.15 / 0.18 / 0.31 | 0.89 / 0.90 / 0.89 / 0.89 |
| lean centre over poster (the hand-over) | 0.50 / 0.81 / 0.39 / 0.51 | 1.08 / 0.99 / 0.90 / 0.76 |

The sweep's worst frames (0.18-0.47) are the first one or two of a first lean, before the full frames
around that pose are decoded (the half tier stands in), and the dissolve's middle.

**Costs.** edk's grid doubles: half tier 205 to 396 KB, full tier 524 KB to 1.01 MB, the desktop tier
1.0 to 1.68 MB (AV1); the full tier is now also fetched at DPR 1. Posters add 4-25 KB per file in the
repo, nothing per visit. The worker is a separate chunk loaded with the first lean.

**Not verified:** Safari and Firefox (Safari's layer rasterisation and canvas snapping may differ),
a real GPU-composited Chrome and real laptop panels; all numbers are headless Chromium. Work's slots
are 640 CSS px at 1440 wide, so at DPR 2 the poster (1200) is enlarged 1.07x and the lean frames
(1040-scale renders) up to 1.23x: closing that needs larger renders or a smaller slot, the owner's call.
The live engine behind `?live` (ADR-0009) still blends four frames and keeps its own roll.

## Note 2026-10-10 (evening): the Record's object is the pocket cassette recorder

The owner chose a tape / voice recorder (`research/2026-10-record-object.md`, round 4, concept 2).
It shipped through this pipeline unchanged in shape: `tools/objects/recorder.py`, media in
`media/objects/recorder/`, the Record page's one `obj` switched; the card file (`record`) stays on
disk unused, as the microphone did. What the slot needs under the amendment above: poster, shadow,
lean grid (both tiers), the interaction clip and both droplet clips; the idle loop is encoded and in
the manifest but unfetched (the float replaces it); no spin loop, since only edk has one on phones
(`SPINS` keeps a swing proposal, unrendered); the live engine's normals and clip stills as for every
object. Standing settings (poster 1200² at 128 spp; grid, clip and droplet 1040² at 32 spp + OIDN;
17 × 3 grid at 2°; `--nyaw 33` re-renders it at 1°). Render: 3 h 02 min on four shared cores
(poster 13 min, grid 1 h 51 min, clip 37 min, droplet 19 min, shadow and normals 1.4 min), slowed
about 2x in the first hour by another object's render. Bytes (full grid at AVIF q50, as `record`):
first paint 21.6 KB; desktop full 1.08 / 1.11 / 1.13 MB (AV1 / HEVC / H.264) against about 1.15 MB;
phone 361 / 391 / 444 KB against about 450 KB. The clip is 36 frames (record key down, lamp up, reels
turn); far ground decodes exact in the clip and the droplet.

## Note 2026-10-11: every object on the 1° grid; Work's emblems drawn at their own size

The owner approved the evening amendment's sharpness fix; this brings the other leaned objects (Recto,
English Prep, Eat Map, the recorder) to edk's grid. Technique decided by the agent.

- **The 1° grid.** As for edk: the 2° frames copied bit-identically to the even columns of a 33 × 3
  grid, `frames.py <obj> --stage grid --nyaw 33` rendering only the 48 odd frames (32 spp + OIDN,
  `nice -n 19` on four cores shared with other agents' tests), then `--stage normal` again for the two
  objects with a live engine. Encoded with `encode.py <obj> --videos ""`: grid, posters, live normals and
  manifest only; clips, droplets and the unfetched idle are unchanged. Render time (sum of frame times):
  English Prep 48 min (60 s a frame), Recto 45 min (57 s) + normals 52 s, Eat Map 18 min (23 s, an
  unloaded machine), recorder 41 min (51 s) + normals 42 s; encodes 3-7 min each.
- **Bytes** (lean half / full tier; `desktopFull` AV1, the manifest's worst case):

  | | half | full | desktopFull |
  |---|---|---|---|
  | Recto | 223 → 432 KB | 654 KB → 1.27 MB | 1.10 → 1.93 MB |
  | English Prep | 169 → 328 KB | 413 → 801 KB | 0.70 → 1.25 MB |
  | Eat Map | 177 → 343 KB | 429 → 832 KB | 0.76 → 1.33 MB |
  | recorder | 257 → 500 KB | 585 KB → 1.14 MB | 1.08 → 1.88 MB |

  First paint and the phone tiers are unchanged (phones never fetch the grid). **The desktop budget
  (about 1.15 MB, media research §7) rises** for Recto, Eat Map and the recorder, as it did for edk
  (1.68 MB): the grid is the only thing that can halve the step, every byte of it loads after first
  paint, on desktop only, for the one object in view, and the alternative, a lower AVIF quality, gives
  back the sharpness this work is for. What Work actually fetches (measured, 1440 × 900, DPR 1 and 2):
  Recto's and English Prep's emblems the half tier only (422 and 320 KB), Eat Map half and full
  (335 + 813 KB).
- **Work's slots (ADR-0014) were not what `SLOTS` said.** Measured: the emblem is 144 CSS px at
  1440 × 900 (`clamp(112px, 10vw, 148px)`), 99 at 1180 × 820, 92 on phones; Eat Map's object 600.
  `SLOTS` still listed Work's old 640 and the emblem's `sizes` said 200 px, so a 144 px emblem drew the
  400 poster (reduced 2.8x at DPR 1, 1.4x at DPR 2). Now `SLOTS` has 99, 104, 120, 144 and 148 for the
  emblems and 600 for Eat Map, `PHONE_SLOTS` the 92 px phone emblem at DPR 2 and 3, and both `sizes`
  attributes follow work.css's rules, so each slot gets its exact width (1440: 144 and 288; 390 at DPR 3:
  276). The 640 and 960 posters, which nothing draws any more, are removed.
- **Small slots drew the half tier through the browser's resize** (0.3 of its size in an emblem): 0.55-
  0.67 of the ideal frame at rest and in motion. The half frames are now decoded at the canvas's device
  size by the same Lanczos worker as the full ones when the canvas shows them below 0.95 of their size
  (`media.ts halfFrames`).
- **The decode-ahead window outgrew the LRU** at 1°: 4° behind and 6° ahead is 22 frames, and Eat Map's
  808 px frames at DPR 2 fit 14 in 40 MB, so frames were evicted before the pose reached them (9 of 61
  sweep frames fell back to the half tier). The window is now capped at half the LRU's frames (2° behind,
  4° ahead there; unchanged wherever it fits).

**Sharpness, slow pointer sweep on /work/ and /record/** (the evening amendment's method: 61 positions
across the object's middle row, from one object width left of centre to one right, 16 ms apart, each
captured on whole device pixels with the ground subtracted; LV against the exact nearest full grid frame
Lanczos-reduced to the frame's device size; frame-to-frame change in mean levels; before = dev, after =
this work; DPR 1 / DPR 2):

| | median LV, before | after | lean at rest, after | change per frame (median), before | after | exact frames, before | after |
|---|---|---|---|---|---|---|---|
| Recto (144) | 0.61 / 0.67 | 0.83 / 0.81 | 0.83 / 0.80 | 1.34 / 3.24 | 1.35 / 1.86 | 50 / 57 | 47 / 48 |
| English Prep (144) | 0.56 / 0.59 | 0.81 / 0.77 | 0.82 / 0.79 | 1.02 / 2.19 | 0.62 / 0.96 | 48 / 58 | 51 / 48 |
| Eat Map (600) | 0.95 / 0.88 | 0.95 / 0.88 | 0.93 / 0.88 | 1.60 / 3.55 | 1.57 / 2.98 | 59 / 61 | 58 / 61 |
| recorder (320) | 0.68 / 0.86 | 0.83 / 0.87 | 0.81 / 0.84 | 3.94 / 3.47 | 2.53 / 2.94 | 54 / 61 | 51 / 60 |

Exact frames are of 61. A sweep now crosses twice as many steps, each with its 24 % dissolve, so a few
more frames fall inside one; each change is smaller. The emblems sweep through 18-21 of the 33 columns
(the lean is relative to the object's width and the sweep stays within one width). The worst frames
(0.26-0.57) are still the first one or two of a first lean. Headless Chromium only, as above.

## Consequences

- Objects are as good as the render, and the page gets lighter (no WebGL on the main path).
- Every object costs an overnight CPU render; changing a light means re-rendering.
- Free rotation is limited to the grid's arc (about ±16° yaw, ±4° pitch).
- The still-to-video handoff is a crossfade both ways (2026-10-10, after the owner saw objects
  flash while scrolling on a phone): `media.ts` hands a slot back to its poster by fading the video out
  under it before releasing the decoder, and Work gives an object its video only after its section has
  held the middle for 300 ms. The clips were tagged with the BT.709 transfer, which Apple's decoders
  draw through a different curve than the sRGB stills (brighter in the shadows), a suspected cause of
  the light at the handoff on the iPhone. Since 2026-10-10 every clip carries the sRGB transfer
  (`iec61966-2-1`, code 13) in both places a decoder may read it, the stream (VUI or AV1 sequence
  header) and the MP4 `colr` box, retagged without re-encoding (`encode.py --retag`, pixels checked
  identical by md5) and written that way by every new encode (phone motion research §1). Chrome draws
  both tags alike and Firefox ignores them; whether the handoff is now invisible on Safari is still
  for the owner's iPhone to confirm.
- To check on the owner's iPhone: ground seam in a dark room, `plus-lighter` over video, Low
  Power Mode, loop seam, every tab twice without a crash, a 206 Range response on Pages.
