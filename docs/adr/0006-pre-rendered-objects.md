# ADR-0006: Objects are pre-rendered Cycles frames; real time is only glue

**Status:** accepted 2026-10-09 (owner: "fake it with very high-resolution photos and video; a
still first, the moving version behind it"); **under review 2026-10-10:** the owner finds the
objects stutter in tiny movements and may bring real-time 3D back on desktop once the performance
difference is reported (brief, "Look, motion and objects"; `docs/PLAN.md` track 7); the stutter
causes inside this pipeline were fixed on 2026-10-10 (amendment below). A new ADR would
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
   - a lean grid of stills (about 17 yaw × 3 pitch at 2° steps), which also makes the idle drift;
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
