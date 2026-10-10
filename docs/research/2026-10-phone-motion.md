# Research: phone motion, turning pre-rendered objects (2026-10-10)

Brief §7 (2026-10-10, phone check): "objects flash a white light while scrolling (the
still-to-video switch); phone objects are not lively enough; the owner wants turning, moving
pre-rendered objects like prototype A's spinning letters." This file covers the colour tag behind
the suspected flash (§1), what makes a turning object read as alive (§2), the pre-rendered options
and the one chosen (§3), the edk proof (§4), how it composes with the rest of the stage (§5), and
a recommendation per object with costs (§6).

Evidence grades as in the other research files: **E** measured or read in code here; **P**
primary but indirect; **F** forum or secondary; **M** recollection, not re-checked. Renders ran on
the container's four CPU cores; browser shots are headless Chromium (AV1 software decode), never
Safari.

## 1. The colour tag (done)

**Finding.** Every object clip was tagged BT.709 for matrix, primaries **and transfer**
(`color_trc bt709`, code 1), in two places: the stream (H.264/HEVC VUI, AV1 sequence header) and
the MP4 sample entry's `colr` box (`nclx 1/1/1`, limited range) (E, read with `ffprobe` and a box
walk). The pixels themselves are sRGB code values: `encode.py` composites the Cycles masters in
sRGB and subtracts the ground in code values, and the posters beside them are sRGB stills.

**Why it matters on Safari.** Chrome treats the BT.709 transfer as sRGB (Chromium developer on the
FFmpeg tracker, F; media research §4), so on Chrome still and video match. Apple's video path
(AVFoundation and CoreVideo, which WebKit plays through) honours the tag and draws code-1 video
through its BT.709 handling, which is not the sRGB curve: dark tones come out lighter than in a
tagged-sRGB still (long-standing QuickTime "washed out 709" reports, F; ASWF wiki, F). On a dark
glass object most pixels are dark tones, so the video can look brighter than the poster it
replaces: a plausible cause of the "white light" at the handoff, together with the crossfade fixed
on 2026-10-10 (ADR-0006, Consequences).

**What WebKit reads.** CoreVideo has an sRGB transfer function since iOS 11 / macOS 10.13
(`kCVImageBufferTransferFunction_sRGB`; Chromium's VideoToolbox code maps transfer 13 to it behind
that availability check, P; FFmpeg's VideoToolbox patches of 2021, P). An MP4's colour reaches the
decoder's format description from the `colr` box, and the parameter sets' VUI is the fallback when
the box is absent (Apple TN2227 for the `nclc`/`nclx` atoms, M). Which one wins in current WebKit
was not verifiable here, so both now say the same thing.

**Done (E).** All 72 clips in `media/objects/*/` (6 objects × interact, droplet-in, droplet-out,
idle × 3 codecs) were retagged to transfer `iec61966-2-1` (code 13) without re-encoding:
`ffmpeg -c copy` with the `h264_metadata` / `hevc_metadata` / `av1_metadata` bitstream filter
(`transfer_characteristics=13`) for the stream, plus `-color_trc iec61966-2-1` on the stream copy,
which the MP4 muxer writes into `colr` (`nclx 1/13/1`). Matrix and primaries stay BT.709, range
stays limited. Checked per file: `ffprobe` reads `iec61966-2-1`; `trace_headers` shows
`transfer_characteristics = 13` in the stream (VUI, SPS, and every AV1 sequence header); the
decoded frames are bit-identical (md5 of the decode before and after); `moov` stays before
`mdat`. Sizes: H.264 and HEVC unchanged to the byte, AV1 files 36–192 bytes smaller (the muxer
rewrites the AV1 OBU framing; the decode is identical). `encode.py --retag` does this for an
object and updates the manifest's byte counts; every new encode writes code 13 itself (`COLOR` in
`encode.py`). Firefox ignores colour tags (Mozilla bug 1783458, F), so it is unaffected either way.

**Still to check on the owner's iPhone:** whether the poster-to-video handoff is now invisible
in a dark room, and that nothing else changed. If Safari still shifts, the next suspect is the
limited-range black (16) against the poster's 0, which the ground subtraction should already hide.

The screen captures in `content/projects/*/captures/` (`tools/captures/clip.mjs`) carry the same
BT.709 transfer tag beside their WebP posters; they were out of scope here and are the obvious next
retag (the same `--retag` recipe, one line in `clip.mjs`).

## 2. What makes a turning object read as alive

**Where the reference is.** `prototypes/a-die/` is the die prototype: a Canvas2D chip die with a
package, blocks and pulses along buses, and no turning letters in its code (E: no rotation over
time, no 3D type). The turning glass letters the owner remembers are most likely prototype E's
`edk` (three.js, whose idle added a slow spin and float to the letters) or the 2026-10-08
turntable test (`tools/objects/turntable.py`). This file takes the request as written, "turning,
moving objects like spinning letters", and the owner should confirm which one he meant.

**What reads as alive (E, from the liveliness research and the shots here).**

- **Rotation beats drift.** The current phone idle is a figure-of-eight through the lean grid,
  ±8° yaw and ±3° pitch, synthesised from blended grid frames: on a 210 px phone object that is a
  few pixels of parallax, and blends soften it. A turn changes the silhouette: a letter becomes a
  glass block edge-on, then its mirror, then itself again. The eye reads that as an object, not a
  picture that sways.
- **Staggered parts beat a rigid whole.** Three letters turning one after another (0.3 s apart)
  read as a wave with a beginning and an end, the same thing E's `MICRO` hop did with lifts. A
  whole-word turntable would show "kde" mirrored for a second and lose the name.
- **A rest beat.** Each turn eases in and out (smoothstep, 2 s per letter) and the loop holds the
  exact rest pose for 1.3 s of its 4 s. The rest is what the poster shows, so the poster-to-video
  handoff and the loop seam both land on the same pixels, and the object does not feel like a
  screensaver.
- **Real refraction.** Every frame is Cycles: the glass bends the backlight and the other letters
  as it turns. This is the one thing no CSS or real-time trick here can fake (ADR-0006).

**And one bug that mattered more than any of this (E).** On a phone the Home page shows two
slots at once, the pinned `edk` object and, below it, the Recto showcase. Both woke together;
the second to start paused the first mid-`play()`, whose promise rejected with `AbortError`, and
`media.ts` treated that as a failed video: it released it and marked the slot failed for the rest
of the visit. Measured in Chromium at 390×844: the Home object had **no video at all**; only the
showcase moved. So before any new media, phones simply never saw the Home object move. Fixed with
the proof (§5).

## 3. Options and the choice

| Option | What | Bytes (edk) | Turns? | Verdict |
|---|---|---|---|---|
| Idle loop as now | figure-of-eight through the 17×3 grid, synthesised | 203–255 KB | no, ±8° | too little on a phone (brief) |
| Wider grid (±45° or 360°) and a canvas scrub | more grid columns, drawn like the desktop lean | 360° at 5°: 72 stills ≈ 0.7 MB at half size | yes | heavy, blends soften it, per-part stagger impossible |
| Whole-object turntable video | the pivot turns 360° | ≈ same as below | yes | mirrors the word for a second |
| **Per-part spin video** (chosen for edk) | each letter turns 360° about its own axis, staggered, then rests; one seamless loop | 230–281 KB | yes | reads as the name, lands on the poster |
| Swing video | the whole object ±30–40° about the pivot, sine, seamless | est. 200–280 KB | partly | for objects that only read from the front |
| Animated AVIF of the spin | the same frames as an image | 166 KB at 640² (E) | yes | not refused by Low Power Mode; untested on Safari |
| Live engine (ADR-0009, `?live`) | float and light over one rest frame | ~28 KB | no | complementary: life without video |

The spin is a new `frames.py` stage (`spin`, `SPINS` per object) and an `encode.py` step
(`--spin-only`, or part of a full encode), and the manifest gains an optional `spin` entry. No
new runtime: the stage plays it with the existing idle machinery.

## 4. The edk proof

**Render (E).** `frames.py edk --stage spin`: 1040², 32 spp + OIDN, the grid's settings. The loop
is 120 frames at 30 fps (4 s); frames 78–119 are the rest pose and are not rendered, so 78
frames: **1431 s (24 min) on four CPU cores**, 18 s a frame, no retries. The crop was found from
21 low-resolution previews (every fourth state) and covers the letters at their widest diagonal
(848×356, a little wider than the grid's 808×380).

**Encode (E).** Rendered frames, then frame 0 repeated to 120, as AV1 10-bit, HEVC Main 10 and
H.264 High, BT.709 matrix, limited range, sRGB transfer, `+faststart`:

| CRF (AV1/HEVC/H.264) | AV1 | HEVC | H.264 | Note |
|---|---|---|---|---|
| 34 / 28 / 26 | 389 KB | 405 KB | 347 KB | first try: over budget |
| **40 / 32 / 30** (shipped) | **281 KB** | **274 KB** | **230 KB** | object MAE 2.65 levels on frame 0 |
| 42 (AV1) | 252 KB | | | |
| 36 at 904² (AV1) | 300 KB | | | downscaling saves little |
| 36 / 40 at 640² (AV1) | 204 / 164 KB | | 187 KB (CRF 26) | a phone-only size, see §6 |

Turning glass is the costliest video per second here: it refracts everything behind it in every
frame. Far ground (everything outside the letters' rows, 120 frames decoded): exact 0 in HEVC and
H.264; AV1 at CRF 40 within **1 level** on 3.6 % of those pixels (8-bit decode of the 10-bit
stream; on the #0A0A0B ground under `plus-lighter` that is invisible, but it is not the exact 0 the
other clips keep; CRF 38 and `enable-tf=0` did not remove it).

**Phone tier (E, manifest `bytes.tiers.phoneSpin`).** Poster, shadow, spin and both droplet clips:
**467 KB AV1, 499 KB HEVC, 410 KB H.264**, against the idle tier's 389 / 437 / 435 KB. By the media
research's own bucket (still + loop ≤ 450 KB) the spin is 297 KB AV1; with the droplets, which only
load when the visitor changes tab, it sits at the ~450 KB line (HEVC 11 % over).

**Look (E, `scratchpad/spinlook/`).** At 390×844 (2× DPR) the Home object is 210 CSS px wide; the
filmstrip (0–4 s, every third of a second) shows `e` starting, `d` and `k` following, each letter
passing through a clear glass block edge-on and its mirror image, and all three back on the rest
pose from 2.7 s. The edge-on blocks are bright (the letters are deep), which makes the turn
legible at phone size; whether the blocks are too heavy a look is the owner's call. The ground
around the object is seamless in every frame; the loop seam and the poster handoff are the same
rest frame. Desktop (1440×900) keeps the idle loop and the lean; the touch tablet (1180×820) plays
the spin.

## 5. How it composes with the rest of the stage

- **Phones and touch tablets** (`!desktopTier()`): `media.ts` picks `manifest.spin` over
  `manifest.idle` for the loop; nothing else changes. `?spin=0` keeps the idle loop for an A/B on
  the owner's iPhone. Without a `spin` entry (every object but edk) the idle plays as before.
- **One loop at a time, and the right one.** The loop now belongs to the visible slot whose centre
  is nearest the middle of the window, re-decided on scroll (24 px hysteresis); an interrupted
  `play()` (`AbortError`) leaves the video in place, paused, instead of failing the slot. On the
  phone Home this means `edk` turns at the top and the Recto showcase takes over as it reaches the
  middle (checked: top edk plays, scrolled showcase plays, back to the top edk plays again).
- **Desktop.** Unchanged: the lean grid on pointer, the idle loop after 4 s of rest. The spin
  could replace the desktop idle too, but the lean starts from the grid's centre pose and a
  mid-turn handoff would jump; it would need the lean to wait for the spin's hold frames
  (`holdFrom`). Not trivially better, so not done.
- **Taps on phones.** Today a tap does nothing on phones (`play()` is desktop-only). The natural
  next step: a tap during the hold seeks the spin to frame 0 ("tap and the letters turn"), or the
  hold is dropped and the tap is the only trigger. Owner's taste; one line in `play()`.
- **Reduced motion, Save-Data, a refused `play()` (Low Power Mode).** The poster, exactly as now
  (ADR-0006 item 6). Low Power Mode refuses video, not images: an animated AVIF of the same frames
  (166 KB at 640², §3) would turn even then, at the cost of a software decode of 120 frames. Not
  built; it needs a check on the iPhone first (decode heat, `plus-lighter` on an animated image).
- **Live engine (`?live`).** Its phone tier (float and pointer light over the rest frame) has no
  video, so the spin does not run there; the two can combine later by playing the spin as a time
  axis in the engine (liveliness research §8, "video as texture transport").
- **Colour.** The spin is tagged sRGB like every clip now (§1), so it hands off from the poster
  with the same curve on Safari, if §1's diagnosis is right.

## 6. Recommendation per object, and costs

| Object | Spin | Why | Render (4 CPU cores) | Bytes, est. |
|---|---|---|---|---|
| edk | **full 360° per letter, staggered** (built) | the name survives; edge-on glass blocks read well | 24 min (78 frames, measured) | 230–281 KB (measured) |
| Eat Map | **the pin turns 360° about its tip, the plate still** (`SPINS` entry, unrendered) | a pin is nearly round; turning it is the same gesture as the letters | ~30 min (72 frames at 23 s) | ~150–200 KB (one small part moves) |
| English Prep | **swing ±40°** | "Aa" mirrors from behind; the bubble's depth shows in a swing | ~85 min (180 frames at 28 s; halves with the symmetric-pose saving below) | ~200–250 KB |
| Recto | **swing ±35°** | flat pages go edge-on at 90° and their back mirrors the title; a swing shows the stack's depth | ~2.5 h (180 frames at 50 s; ~1.3 h halved) | ~200–250 KB |
| Record (card file) | **swing ±30°** | the tray reads from the front and the drawn card faces the viewer; its frames are the slowest here | ~7 h (180 frames at 137 s; ~3.5 h halved) | ~250 KB at CRF 40 |
| Log (unused) | none | not on the site | | |

The swing's poses repeat (yaw at frame k equals yaw at frame n/2 − k), so a swing needs only
n/2 + 1 unique renders; `frames.py` renders all n today, and a pose map in the stage and the encode
would halve those times. The estimates scale edk's measured CRF-40 sizes by each object's current
idle size; they are guesses until rendered.

**Recommendation.**

1. Keep the edk spin as the phone idle and let the owner judge it on his iPhone (with `?spin=0` to
   compare), together with the colour retag (§1): both fix what he reported, and the loop-owner fix
   is what makes any phone motion visible on Home at all.
2. If he likes it: Eat Map's pin next (cheapest, the same gesture), then English Prep and Recto as
   swings, Record last (its frames cost the most). Add the symmetric-pose saving before Recto and
   Record.
3. Decide with him whether a tap should replay the turn (§5), and whether the edge-on blocks are
   the look he wants (thinner letters or a 180° turn would change it; a re-render is 24 minutes).
4. Later, for Low Power Mode, try the animated-AVIF twin on the iPhone, and a 640² phone-only size
   (about 40 % fewer bytes) if the tier budget gets tight.

## Sources

- Gigazine on the Mux colour study (untagged video, Safari guesses):
  https://gigazine.net/gsc_news/en/20210528-browser-different-colors
- Poynton, "sde – vui – nclc – nclx" (the `colr` box and VUI): https://poynton.ca/notes/misc/sde-nclc-vui-nclx.html
- Chromium `vt_config_util.mm` (transfer 13 to `kCVImageBufferTransferFunction_sRGB`, macOS 10.13+):
  https://cobalt.googlesource.com/cobalt/+/HEAD/media/gpu/mac/vt_config_util.mm
- FFmpeg-devel, VideoToolbox sRGB transfer (iOS 11 / macOS 10.13):
  https://ffmpeg.org/pipermail/ffmpeg-devel/2021-July/282469.html
- Media research §4 (`2026-10-media.md`) for the Chrome and Firefox behaviour and the ASWF note.

## Files

Scratch (not committed), `scratchpad/spinlook/`: `filmstrip-390.png` (12 frames, 0–4 s),
`shots/phone-390x844.png`, `shots/home-1440x900.png`, `shots/home-1180x820.png`, `previews.png`
(the crop previews), `shoot.mjs`. Masters: `scratchpad/pipe/masters/edk/spin/`.
