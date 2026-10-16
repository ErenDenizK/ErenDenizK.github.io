# Round 3: the role of the 3D objects on the new Home (T8, with a note for T7)

**Status:** research, 2026-10-16. Proposal only; the owner decides. Built on `lane/review-r3`
(a801fdb), served from `dist` on port 4811, headless Chromium, 1440 x 900 and 390 x 844, Graphite.
Comps are HTML overlays on the real page (not built features). Files:
`(session scratchpad) round3/obj-shots/`
(walk-through sheets `sheet-d.jpg`, `sheet-p.jpg`; posters `posters.jpg`; comps `compA-*`, `compB-*`).
Comp script: `(session scratchpad) round3/obj-tools/comp.mjs`.

## 1. What exists

| Object | Built by | What it is | On the lab Home today |
|---|---|---|---|
| edk | `tools/objects/edk.py` | clear glass wordmark, three letters | the footer, 240 px, gold aura (`src/one/Foot.astro`) |
| recto | `recto.py` | lime glass page stack, clip | not on Home (only as `pt-obj` behind the opened project's hero) |
| englishprep | `englishprep.py` | sakura glass bubble "Aa" with a reply | same as Recto |
| eatmap | `eatmap.py` | rose glass pin over a ceramic plate | Eat Map's print in Work (no screenshots), and the opened project's hero |
| recorder | `recorder.py` | blue glass pocket cassette recorder, cassette behind a clear door | Record strip head, 280 px desktop / 136 px phone |
| retired | `record.py`, `log.py`, `about.py` | card file, microphone, glasses | `media/archive/objects/` |

How they are made (ADR-0006, `tools/objects/README.md`): one Blender script per object, one shared
rig (`rig.json`, studio HDRI, key/rim, Record-like backlight disc that only glass sees, PBR Neutral).
`frames.py` renders a 1200 px poster (128 spp, 5-10 min), a 33 x 3 lean grid at 1040 px (32 spp +
OIDN), the interaction clip (30-45 frames), two droplet clips (24 frames each), a shadow, and a
phone spin (edk: 78 frames, about 25 min, so about 19 s a frame). `encode.py` writes AVIF/WebP
posters, the grid in two tiers, AV1/HEVC/H.264 clips and `manifest.json`. Ground-subtracted,
drawn with `plus-lighter`.

Measured cost of one complete object: about 1.5-2 CPU hours of renders (grid 99 frames about
30 min, clips and droplets about 30 min, spin about 25 min, poster about 8 min) plus the modelling
session. Disk 3.2-5.6 MB per object (lean 1.4-2.3 MB). First paint 6-25 KB (poster AVIF at the
used size); the full lean tier 0.41-0.65 MB fetched only on desktop pointer use.

## 2. What the page and the references say

- The page now speaks in line drawings, aura, grain and photographs. Glass objects are the one
  thing not born from that language. The recorder is loved; edk is not; the Eat Map pin works
  because it stands in for missing screenshots inside a frame.
- Owner, W5 and spec v2 W5: "fewer layers per project at rest"; "no glass object in Work on Home".
  T20: the Record strip feels "pasted from outside". Scout Motors (dislike): cheap renders. So any
  object must be top quality and must belong to the drawing around it.
- Shopify Editions (MF section 1.2, parity SH3/SH9/SH13): props are part of the collage, on their
  own parallax layer (1.2-1.5x), one turning prop per viewport. The props are painted in the same
  hand as the collage. That is the lesson: a prop is loved because it is in the picture's style.
- Anime.js (parity AJ2/AJ3): one 3D object that scroll turns, and the same object shown as its
  line drawing when the chapter changes. That pairing (rendered and line twin) is the closest
  reference for our page, where the scenes are already line art.
- Robin and Antoine: no 3D props; their "objects" are the frames themselves. Our frames already
  carry Work.
- Record language (`docs/design/record-language.md` sections 2.4, 5): "one living object, a still
  document"; the recorder is never cropped; the recorder turns with the scroll (scrubbed lean
  grid); the strip and the Record share the `stage` view transition. Known defect: a dark square
  plate behind the recorder (also visible in comp B at 1440 as a faint box).

## 3. Options

### Option 1. Glass in the scene (each project's object as a quiet lit layer)
Where: inside each Work scene, L2 (0.6x), away from the frame, about 210 px desktop / 120 px phone,
60 % opacity, a pool in the project hue; Eat Map keeps its pin.
Comps: `compA-recto-d/p.png`, `compA-englishprep-d/p.png`.
- Pros: no renders (posters exist); 6-12 KB per project; reuses the lean on desktop.
- Cons: in the comps the coloured glass reads as a sticker on a pencil drawing; it collides with
  scene labels ("241 QUESTIONS") and on the phone it overlaps the frame corner, which is the piling
  W5 removed. Directly against spec v2 W5.
- Cost: 0 render hours; 1-2 builder hours; +10 KB per project (+0.4-0.65 MB if leaned).

### Option 2. The recorder is the Record's emblem, and the tape is the spine (recommended base)
Where: the Record strip head, larger (340 px desktop, 180 px phone, never cropped), with its
light; one line leaves the left reel, runs above the year strip and becomes the spine at "Now".
Behind it, concentric reel rings in Record blue as the strip's own line drawing (the strip gets a
scene like the projects). Scroll turns it (record-language section 5, existing grid); the press
plays the record-key clip; the `stage` transition carries it to the Record page and back.
Comps: `compB-strip-d.png`, `compB-strip-p.png`. Also tried: a 64 px recorder as the brief's
"Writing" mark (`compB-brief-d/p.png`): rejected, at that size the glass loses its detail and it
covers the label; the departure point should be the blue light, not the object.
- Pros: answers T8 and T20 together: the loved object is no longer alone, it produces the
  strip's line (the drawing language of the page) and the Record's identity. No new renders.
  Desktop and phone keep the same idea at two sizes.
- Cons: still only one object on the lower half; the dark plate defect and the phone render bug
  (T6: on the 390 px walk-through the recorder showed as a thin edge-on sliver, likely a spin
  frame) must be fixed first; the tape path must be drawn per breakpoint.
- Cost: 0 render hours; about 4-6 builder hours (SVG path from measured anchors, scrubbed draw,
  reel rings); +2-4 KB SVG; recorder media already shipped.

### Option 3. Line twins (objects rendered as line drawings in the scenes)
Where: every object gets a line twin exported from its own Blender model (Grease Pencil Line Art,
SVG export), placed in its project scene and in the strip; the glass version appears only where it
earns it (Eat Map's print, the recorder, the opened project's "How it's made" T11), and the line
twin lights up into glass as a chapter begins (Anime.js AJ3, reversed).
- Pros: born from the page's own language; the drawings and the glass become one family; very
  light; solves "objects gone" without piling.
- Cons: new pipeline step; line twins of glass need hand clean-up to match the drawn scenes; the
  light-up crossfade must avoid the plus-lighter/grain pitfalls.
- Cost: about 0.5 day tooling, minutes of render per object, 5-30 KB SVG per object; 0 new Cycles
  hours.

### Option 4. A new family designed from scratch
Where: one object per project plus a new signature for the foot, all in the recorder's grammar
(a small machine of clear blue-tinted glass with its working parts visible inside: "the low level,
the machine's own language"); e.g. a glass page press for Recto, a glass radio or card reader for
English Prep, the pin kept.
- Pros: one coherent family; the recorder stops being the odd one; strongest "artwork" result.
- Cons: highest cost and taste risk; four new objects to approve; brings objects back to Work,
  which the owner reduced on purpose.
- Cost: about 1.5-2 CPU hours per object for the full set (about 8 hours for four), plus one
  modelling session each; 3-5 MB disk and 10-25 KB first paint per object.

## 4. Recommendation

Option 2 now, with Option 3 as its next step. The recorder becomes the Record's emblem: bigger,
never cropped, turning with the scroll, and its tape becomes the spine, so the object writes the
line the page is made of. Then export line twins from the same Blender models: the recorder's
twin as the strip's drawing, and the project objects' twins inside their own scenes, lit to glass
only where a chapter opens. This keeps W5 (no glass piled in Work), answers T20, reuses every
render, and leaves Option 4 for a later round if the owner wants a full family. Fix T6 and the
dark plate before the comp is built.

Questions for the owner (taste): is the tape-as-spine idea right; should the project objects come
back as line drawings (Option 3) or stay out of Home.

## 5. Note for later (T7, no work now)

The edk footer floats alone on an empty brown field after the record's dashed tail: no scene,
line or light connects it to what is above, and it repeats the bar's "edk" logo as chrome letters.
A later fix should tie the foot to the page's last line (for example the record's tail ending in
it) rather than add a new object.
