# ADR-0009: Live frames: one frame engine and one light, behind a flag

**Status:** proposed (the owner A/Bs it on the live site behind `?live`; nothing changes without the
flag); no verdict recorded, parked until the real-time 3D decision (2026-10-10, `docs/PLAN.md`
track 7) · **Amends:** ADR-0006 items 4 (interaction) and 6 (tiers); keeps items 1–3, 5 and 7 ·
**Rests on:** brief §7 (2026-10-09 after v0: the owner misses prototype E's live, interactive
animation on desktop; "if we render well, phones can get animation too");
`research/2026-10-liveliness.md` (§2 diagnosis, §5 design, §6 proofs, §7 tiers)

## Context

The liveliness research measured why the current stage feels less alive than E even though its
lean is faster: its motion is modal. The idle video, the Canvas2D lean and the interaction video
are separate media that switch: touching the object stops its life and jumps it 8–12°, resting
freezes it for 4 s and then jumps 24° back into the idle loop, and interactions are videos that
cannot reverse or start from a leaned pose. E was alive because one simulation added float, lean,
per-part springs and light every frame. Real-time 3D is not the fix (glass scored SSIM 0.49 against
Cycles; ADR-0006). The research recommended a frame engine over the Cycles frames plus a light
relit from a normal pass, and proved both in a scratch page.

## Decision

Build it in the site, opt-in, for the Home object (edk) and the Home showcase (Recto):

1. **Opt-in.** `?live` turns the engine on and remembers it in this browser (`localStorage`
   `edk-live`); `?live=0` or the chip's "Turn off" ends it. Without the flag the page loads 1 KB more
   script (the flag check and Vite's preload helper) and behaves exactly as before; the engine
   (10 KB gzip) is a separate chunk loaded only when the flag is on.
2. **One engine, one canvas per slot** (`src/scripts/live/`, WebGL2, no library). Exact Cycles frames
   live in texture arrays; a single shader draws them. Every motion is a spring stepped every frame
   and they add:
   - **float**: E's bob (0.7 % of the square), sway and a 0.26° roll on incommensurate sines, applied
     to the whole frame as a 2D move. A floating object is a Cycles frame moved by a sub-pixel
     offset, never a blend of frames. `?float=0` turns it off (then rest is pixel-exact);
   - **lean**: a pointer near the object (amended 2026-10-10, `lean.ts`) turns the object (yaw ±70 % of the grid's arc, as
     now) through the four nearest half-size frames, on an underdamped spring (k 70, ζ 0.72: 90 % in
     322 ms, a little overshoot). 250 ms after the pointer rests, the target snaps to the nearest grid
     cell, the spring settles there and the full-size frame replaces the blend. The float never stops
     while it settles, so there is no dead frame and no mode switch;
   - **interactions as axes** (amends ADR-0006 item 4): an interaction clip becomes stills on the GPU.
     Recto's fan is a **state axis**: hover springs it open (k 120, ζ 0.55), leave closes it from
     wherever it is, re-hover reverses it mid-way; each frame's fan amount (from `frames.py`) maps the
     spring's value to a frame, and the fully open fan rests on an exact full-size frame. edk's hop is
     a **time axis** played forward after 140 ms of hover intent or on a press. Both gather the lean
     to the centre first (a stiff spring, the clip was rendered there) and crossfade from the leaned
     pose over the last one or two degrees;
   - **light**: one pointer light (touch and scroll on phones; a slow wander at rest; one sweep on
     arrival) relights the Cycles pixels from the normal pass: a glint on bevels and an accent fresnel,
     added. At rest the object is the exact frame plus the glint (owner's taste question; default
     `?light=glint`); a pool that scales the pixels appears only while the pointer moves. `?light=soft`
     keeps a mild pool at rest, `?light=pool` is the research proof, `?light=off` none.
3. **Compositing is unchanged** (ADR-0006 item 2): frames stay ground-subtracted, the canvas is drawn
   with `plus-lighter` inside the stage, the pool only scales object pixels and every added light is
   gated by the beauty frame, so the ground stays exact. The contact shadow stays a multiply layer
   in the page, lighter with lean and as the float lifts the object. The droplet change between tabs
   stays video (ADR-0006 item 5, ADR-0007).
4. **New media** (`tools/objects`): a `normal` stage in `frames.py` (an emission override of the world
   normal, converted to camera space, 8 spp, no bounces: 0.3–1.3 s a frame) and `encode.py
   --live-only`, which writes half-size normal maps as AVIF strips (one per pitch row, two channels,
   no coverage because a hard edge rings under any lossy codec), the rest pose's normal alone, and the
   clip as half-size stills (plus the state axis's peak at full size and its normals). The manifest
   gains optional `normals`, `states` and `bytes.live` entries (README, "The manifest").
5. **Tiers** (amends ADR-0006 item 6), decided once per page view and only ever stepped down:

   | Tier | Who | Gets | Fetches (edk / Recto) | GPU memory (edk / Recto) |
   |---|---|---|---|---|
   | still | reduced motion, Save-Data, `?still`, no WebGL2, a software renderer, a failed benchmark, the watchdog's floor | the poster and shadow | 0 | 0 |
   | phone | coarse pointer, narrow screen | the rest frame at full size and its normals; float; light from touch and scroll | 12 KB / 17 KB | 1.3 MB / 2.2 MB |
   | lite | weak GPU (benchmark 4–10 ms), DPR 1 | half grid, rest normals, the clip at half size | ~470 KB / ~420 KB | 26 MB / 36 MB |
   | full | fine pointer, benchmark under 4 ms | half grid in motion, exact full-size frames at rest (an LRU of up to 6), normals for every pose, the clip with its own normals and exact peak | ~470 KB / ~480 KB measured in a session | 40 MB / 58 MB |

   The **benchmark** draws the real shader at the real canvas size on stand-in textures of the real
   sizes for about 12 frames (stopping after ~120 ms on a slow device), syncing by reading one pixel
   back. The renderer string can only refuse (SwiftShader, llvmpipe, Basic Render Driver; Safari
   masks it). The **watchdog** takes the p90 of rAF intervals over 2 s windows; above 22 ms it steps
   down: DPR 2 to 1.5 to 1, full to lite, light off, still. The **memory planner** fits the full-size
   rest slots into a 60 MB budget per object after the half grid, normals (RG8) and clip. Tablets
   (coarse pointer, wide) get the desktop tiers with touch: a tap plays the interaction, touch moves
   the light.
6. **Pausing.** The loop runs at 60 fps on input, 30 fps for the float and wander, and stops after a
   minute without input once the object has settled. Offscreen or hidden, it stops; after 30 s
   offscreen it releases its GPU memory and rebuilds from the HTTP cache on return.
7. **Overrides for the A/B and tests:** `?live=force` skips the renderer and benchmark gates (headless
   Chromium renders on SwiftShader), `?tier=still|phone|lite|full`, `?watchdog=0`, `?hud` (a readout),
   and the shader constants (`kSpec`, `kSharp`, `kPool`, ...) as query parameters.

## Amendment 2026-10-10: not the desktop default yet

The stutter work (ADR-0006 amendment of 2026-10-10) weighed making the engine the desktop default
(real-time 3D study, option a item 1) and kept it behind `?live`:

- it covers two slots (Home and the showcase); Work, the sheet and the Record would keep the media
  stage, so the stutter had to be fixed there anyway, and was;
- its benchmark and watchdog thresholds come from the research, not from a real GPU, and on a
  software renderer it falls back to the poster with no motion at all, a step down from the float;
- the fixes that mattered most for the default path are now shared or matched: the float of an
  exact frame (the engine's own idea), no idle video, the lean zone and the rest rule (`lean.ts`,
  imported by the engine: a pointer far away no longer turns it, and its rest cell is chosen once,
  ahead in the direction of travel, 90 ms after the pointer rests instead of rounding at 250 ms).

It becomes the default only after the owner's A/B on their own machine and a real-device frame-time
and battery check (still open, as below).

## Consequences

- No idle video on live slots: phones fetch about 30 KB instead of a 180–200 KB idle loop, and the
  life no longer depends on `video.play()`, which Low Power Mode refuses. Desktops fetch about the same
  as now (1.04 MB of media in a scripted session on both paths), with the idle video and interaction
  video replaced by normals and clip stills.
- Rest pixels against the current poster path, measured at 1440×900: object MAE 0.7 levels (the
  poster and the grid's centre frame are separate renders), ground max 1 level (float and light off).
  With the default glint at rest: object MAE 1.4 levels, ground unchanged.
- A floating object is resampled by a sub-pixel offset (bilinear); with `?float=0` rest is exact.
- Each object costs one more Blender pass (about a minute) and about 250–290 KB of AVIF.
- The watchdog and benchmark thresholds come from the research, not from the owner's hardware; real
  frame times, heat and battery must be measured on their desktop and iPhone before this leaves the flag.
- Per-part axes (edk's letters hopping independently, the Eat Map pin under gravity) and video as
  texture transport are not built yet (research §8 items 3–4).
