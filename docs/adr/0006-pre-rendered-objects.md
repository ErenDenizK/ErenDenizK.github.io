# ADR-0006: Objects are pre-rendered Cycles frames; real time is only glue

**Status:** accepted 2026-10-09 (owner: "fake it with very high-resolution photos and video; a
still first, the moving version behind it") · **Amends:** ADR-0005 items 2 and 3 ·
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
   AV1 10-bit, then HEVC Main 10 (`hvc1`), then H.264, BT.709 limited range tagged, no audio,
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
6. **Tiers.** Desktop: everything. Phone: poster, idle loop and droplet clips. Reduced motion,
   Save-Data, or a rejected `play()` (Low Power Mode): poster only, no play button.
7. **Real-time GLBs** stay in `tools/objects/` as the source and for later experiments, but the
   site does not ship three.js for objects.

## Consequences

- Objects are as good as the render, and the page gets lighter (no WebGL on the main path).
- Every object costs an overnight CPU render; changing a light means re-rendering.
- Free rotation is limited to the grid's arc (about ±16° yaw, ±4° pitch).
- The still-to-video handoff is a crossfade both ways (2026-10-10, after the owner saw objects
  flash while scrolling on a phone): `media.ts` hands a slot back to its poster by fading the video out
  under it before releasing the decoder, and Work gives an object its video only after its section has
  held the middle for 300 ms. Still unverified on WebKit: whether Safari draws the BT.709-tagged clips
  brighter than the sRGB stills (media research §4: retag `-color_trc iec61966-2-1` if it does).
- To check on the owner's iPhone: ground seam in a dark room, `plus-lighter` over video, Low
  Power Mode, loop seam, every tab twice without a crash, a 206 Range response on Pages.
