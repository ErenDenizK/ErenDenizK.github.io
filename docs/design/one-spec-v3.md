# Design spec v3: Home on `/lab/one/`, round three

**Status:** proposal of the design lead, 2026-10-16. It revises `docs/design/one-spec-v2.md` after the
owner's review of round two (rows T1 to T21 in `docs/feedback/2026-10-16-lab-one-review.md`, binding).
Where this file and v2 disagree, this file wins for `/lab/one/`. Taste questions are in section 13;
everything else is technique and is decided here.

**Inputs:** the review (all rows), the brief log (2026-10-16, afternoon), the round-3 audit
(`round3/audit.md`), the objects study (`round3/objects.md`), the dev sources in `src/one/`, and the
round-2 build in `dist/` (served to the comps by request interception, headless Chromium, not real
hardware; WebKit is not installed).

**Comps.** HTML and CSS injected into the real round-2 page, then screenshotted. Folder:
`round3/comps/` (scripts in `pc/`, `cap/`, `rail/`, `rec/`, harness `tools/h.mjs`); stills in
`round3/comps/shots/` at 1440 x 900 (DPR 1) and 390 x 844 (DPR 2, touch); one contact sheet
`round3/comps/sheet-comps.jpg`. Baselines of today: `shots/now-*.png`.

| Comp | Files (`-d` desktop, `-p` phone) | What it shows |
|---|---|---|
| Postcard backs (T2) | `pc-back-0`, `pc-back-1`, `pc-back-2` | The three new backs in the large view: drawing, stamp set into it, note, signature, colophon |
| Photo view exit (T15) | `exit-photo` | Page blurred behind, close capsule and turn capsule, the close cursor over the dark space |
| Project bar (T13, T14, T15) | `cap-first`, `cap-folded`, `cap-how` | Two glass capsules; first open with the labelled close and `esc`; folded; the pull ring on the phone |
| Rail panel (T9) | `rail-mid`, `rail-open` | The panel growing from the right edge (frame at 45 %), open, light veil |
| Record strip (T20, T6, T8) | `rec-head`, `rec-rows` | Centred frontispiece, recorder on a dark local ground, reel drawing, the tape becoming the spine |

Comp drawings (the three postcard drawings, the reel rings) are composition studies drawn in a few
minutes by code. The builder redraws them with the line-art kit (section 2.4), and the critic reviews
them at 2x zoom before they ship.

---

## 1. Every row, answered

### 1.1 Round 3 (binding)

| Id | Answer | Lane | Section |
|---|---|---|---|
| T1 | The lanes placement becomes the only placement. Remove `?card=lanes`, the `pick('card', ...)` line in `One.astro`, the inline mover script in `Rest.astro`, `.ch-4` and `CardEnd.astro`'s second home. The card renders in chapter I between How I work and Path at build time (no DOM move, so no layout shift and no flash). Slot height: card plus swing allowance, 560 px at 1440 (today 773); gap card to Path `--in-chapter` (72 / 48), because the card is part of chapter I. Rail row "Card" stays. | PERSON | 3.6, 9 |
| T2 | A new back, designed as an artwork about one photograph: the photograph's own line drawing is the hero, the photograph is set into it as the stamp, the note and the "Eren" signature carry the voice, one colophon row carries the facts. Each back takes its ground and its ink from its own photograph. | PERSON | 2 |
| T3 | Three cut layers with parallax tied to the card's tilt, plus a relief light. Lab switch `?photo=flat|layers` (default `layers` once the owner agrees). | PERSON | 3.1 to 3.4 |
| T4 | Reminder for the lead's next report: the owner sets the default branch and "delete head branches" in the GitHub settings at the computer. No build work. | lead | 13 |
| T5 | Closed. | - | - |
| T6 | Fixed by the Record lane: dark local ground under the recorder, slot inside the gutter, poster plus float on Home phones until the device check, drawing masked out of the object's circle. | RECORD | 8.4 |
| T7 | No work. Kept as a known weak point. One small fix from G5 touches its band only (footer top padding 112 to 72), which shortens the empty run before the edk; the edk itself does not change. | RECORD | 10 |
| T8 | Adopt the study's option 2 now (the recorder is the Record's emblem and its tape is the spine), and plan option 3 (line twins from the Blender models) as the next objects step, starting with the recorder's own line twin as the strip's drawing. No new Cycles renders. No glass returns to Work. | RECORD | 8, 9 |
| T9 | The jump panel becomes a full-height glass sheet that grows from the rail's own edge, rows aligned to their beads, a light veil (3 px blur) over the page, spring motion in and out. | WORK+SHELL | 7 |
| T10 | The lanyard follows every card motion: the hover lean, the hover sway, the idle settle and the entrance twist all reach the rope (desktop) and a new two-segment strap (touch). | PERSON | 3.5 |
| T11 | Replace the tilted screenshot crop with "the cutaway": a line drawing of the product's layers, each labelled from the "How it's made" list, drawn on with the scroll. | WORK+SHELL | 6 |
| T12 | Closed. Keep. | - | - |
| T13 | The bottom bar is the tab bar's glass (shared tokens), one item height, one baseline. | WORK+SHELL | 5 |
| T14 | Two capsules: close alone on the left, actions on the right, 12 px apart, same height. Desktop: a centred pair. Phone: close at the left gutter, actions at the right gutter. | WORK+SHELL | 5 |
| T15 | One exit language for both layers: the labelled close capsule (it folds to a cross after the first use), `esc` on fine pointers, a close cursor over the empty space, swipe down with a pull ring, and a backdrop that shows the page behind. | PERSON (photo), WORK+SHELL (project) | 4 |
| T16 | Closed. | - | - |
| T17 | Closed. Keep drawings, colours, motion. The new drawings in this round (postcards, cutaway, reels) use the same kit. | - | 2.4 |
| T18 | Questions only in section 13. | - | 13 |
| T19 | The critic reviews every new piece frame by frame at 1440 x 900 and 390 x 844: the postcard back (turn sequence), the photo view open and close, the capsules (first open, fold, press), the rail panel (open and close, 30 fps sheets), the record frontispiece (scroll scrub), the lanyard (hover, entrance). A defect frame stops the line. | critic | 11 |
| T20 | The strip is rebuilt from the new page's grammar: a centred chapter head like How I work and Photos, its own line drawing (reel rings), the aura, scroll-drawn motion. It keeps the Record's identity: spine, marks by kind, year strip, recorder. The recorder's tape becomes the spine. | RECORD | 8 |
| T21 | The open rows below continue in this round where a lane owns them. | all | 1.2 |

### 1.2 Earlier rows still open or partly done (from the audit)

| Id | Answer this round | Lane |
|---|---|---|
| G2 | The order stays. The presentation of Work (capsule, cutaway), the person (card, photo, postcards) and the Record strip is redone in this round. | all |
| G3 | Cheap spots from the audit, each with an owner: phone close icon at 12 px (WORK+SHELL, first fix), text reading through glass (WORK+SHELL: glass tokens plus a bottom quiet band in the layer, 5.3), empty bands (section 10), the "How it's made" crop (T11), the rail foot larger than its rows (7.4). | as noted |
| G4, M5 | Frame review continues (section 11). New: the opened postcard ignores clicks for about 1.5 s after it opens (measured by the comp script: a click at 1.3 s does nothing, at 2.2 s it turns). Input must always answer: a press during the open queues the turn and plays it when the open lands. | PERSON |
| G5 | Section 9: every token and rhythm correction, each with its lane and file. | all |
| G6 | Press state everywhere (9.6). The photo view queues input (G4 note). Lazy postcards: `loading="eager"` plus `fetchpriority="low"` for the three table images once the Photos chapter is within 1.5 screens, so a rail jump never lands on grey cards (P2). | PERSON, WORK+SHELL |
| G7, G8 | The parity matrix gets a "plan" column; this round closes these rows: SH7 capsule glass (T13), AJ2 the object turns with the scroll (8.3), Robin's close affordance (T15). The lead updates `docs/research/2026-10-feature-parity.md` after the merge. | lead |
| M1, M2 | No new scroll structure this round. Two motion costs from the motion audit are fixed where a lane touches them: the rail panel animates `clip-path` and `transform` only (no layout), the record frontispiece animates `stroke-dashoffset` and `transform` only. Real hardware check stays open. | WORK+SHELL, RECORD |
| C1 | The fast-shake response gets stronger only through T10 (the strap now carries the motion, so the same physics reads larger). No change to the calm limits of ADR-0008. | PERSON |
| C2 | "Livelier photo" is T3. Texture and hover sway exist. | PERSON |
| C3 | Closed by T1 once built. | PERSON |
| P4 | Answered by T2. | PERSON |
| R1, R2 | R1: the hand-over to `/record/` is the "The whole record" link with the Record page's view-transition names on the spine and the recorder (`record-spine`, `record-object`), so the strip grows into the Record page in browsers that support cross-document view transitions; elsewhere a plain navigation. R2: `docs/design/record-language.md` gains a section "the strip on Home" from section 8 of this file. | RECORD |
| E1 | Section 10 (fill). | as noted |
| W3, O1 | The open's snapshot wait (0.35 to 0.4 s headless) stays the open's cost. The press already answers in 120 ms; add the frame's lift (translateY -6 px, shadow grows) during the wait so the wait reads as the paper being picked up. | WORK+SHELL |
| O3 | White document pages in Recto's clip and steps: a 6 % ink veil (`--paper-veil: rgb(18 18 20 / 0.06)`) and a 1 px inner keyline over every Recto still and clip in the layer, so white paper sits on the Graphite page without being the brightest object. Do not regrade the captures. | WORK+SHELL |
| P2 | See G6. | PERSON |
| H2, H3 | Process, not design. H3: every lane lands as a PR with a merge commit (CLAUDE.md rule in place). H2: the lead keeps the achievements plan. | lead |

---

## 2. The postcard back (T2)

Comps: `pc-back-0-d.png`, `pc-back-1-d.png`, `pc-back-2-d.png` and the `-p` twins. Today's backs:
`now-back-*.png`.

### 2.1 What a back carries (inventory, and what each part becomes)

| Part | Today | New | Source |
|---|---|---|---|
| Mark | "edk" top left | Same, 4.6u serif, min 17 px | `site.mark` |
| Number | "Photograph · 01 / 03" | "Photograph **01** / 03": the index in the photograph's ink | index |
| Rule | none at the head | A hairline under the head row in the ink at 22 % | - |
| Drawing | none (a guilloché in the corner) | **The hero**: the photograph's own scene as a line drawing in the page's engraved style, about 45 % of the card's height, with one construction circle and one sight line, fading out at its edges | new SVG per card (2.4) |
| Stamp | Scalloped cream stamp with the photo, top right | The photograph set into the drawing: a cream mount with a 1 px dashed inner keyline (no scallops), rotated 2 deg, at the drawing's top right, so the drawing reads as the photograph continued in ink | photo file, crop point per card |
| Postmark | Two rings, place on the ring, five cancellation waves | One small ring overlapping the stamp's lower corner: place on the ring, "edk" in the middle. The waves are removed (they read as stock postcard logic) | place |
| Note | Italic serif, 5.4u | Same face and size, balanced wrap; stands under the drawing at 60 % height | `home.postcards[].note` |
| Signature | "Eren" in gold italic | "Eren" at 6.2u (min 18 px) in the photograph's ink, with one ink flourish under it (a seeded hand stroke, stroke 1.2) | `site.firstName` |
| Colours | Five dots plus three hex values (portrait); five tall bands (landscape) | Portrait: one thin proportional bar (five segments, each as wide as its share) plus three hex values on one line. Landscape: the five bands stay (the right column needs a figure), the bar is dropped | `postcards-meta.json` |
| Place, city | Ruled lines | One colophon row: Place, City, Its colours, on one rule. A missing field is hidden, never filled (content rule) | `place` |
| Date | not present | Shown in the colophon only if `home.postcards[].date` exists; today none has one, so nothing shows | content |
| Micro line | Along the lower edge | Same, 1.4u, ink at 32 % | mark, place |
| Texture | Grain plus a guilloché rosette | Laid paper (chain lines every 6u at 3.5 %, laid lines every 3 px at 1.8 %) under the grain; the guilloché leaves the back (the drawing replaces it) | `grain.png`, CSS |
| Ground | One gradient for all | The photograph's darkest palette colour mixed into the card brown (55 % at the top, 40 % at the bottom), plus a faint radial of its tone at the upper left | palette `deep`, `tone` |
| Ink | `--gold-ink` for all | `color-mix(in srgb, var(--tone) 78%, #f3e6cf)`: each card has its own ink (park olive-gold, metro amber, cat terracotta) | manifest `tone` |

### 2.2 Grid, fill and empty space

Units: `--u` is 1 % of the card's width (portrait) or 0.75 % of its height (landscape), as today.

Portrait (5 : 7). Margins 8 % left and right.
- 5.6 % to 10 %: head row and its rule.
- 11.5 % to 58.5 %: the plate (drawing, full width minus 4 % each side, masked by a soft radial so it never
  ends in a hard box). Stamp at right 8 %, top 15.5 %, width 23 %. Ring at right 3.5 %, top 34 %, width 16 %.
- 60 % to 80 %: the note (right margin 14 %, so the measure is about 30 characters) and the signature.
- 80 % to 91.6 %: the colophon (three columns `.8fr .8fr 1.5fr`; two columns `1fr 1.6fr` when there is
  no Place).
- 96.6 %: the micro line.

The empty space is gathered in two calm fields: the band between the note's last line and the
colophon rule, and the right side of the note. Measured on the desktop comps, ink covers about 55 %
of the card (drawing included), against about 30 % on today's portrait back and 25 % on today's
landscape back without a note.

Landscape (about 6 : 5). Margins 5.5 %.
- Plate: left 3 % to 54 %, top 15 % to 91 %.
- Right column (57 % to 94.5 %): stamp top right (width 15 %), ring overlapping it, then the message
  (note and signature) at 21 % to 44 %, the five colour bands at 46 % to 72 %, the colophon at the
  bottom (City, then the hex line).
- No note: the signature grows to 8u and stands alone at the top of the column. The owner may add a
  note for the metro photograph (section 13); the layout already has room for two lines.

Phone. The portrait backs keep the desktop grid at 358 px width (comp `pc-back-0-p.png`, `-2-p`). The
landscape back at 358 x 298 hides the ring and the colours column of the colophon (the bands already
show the colours) and keeps City alone (comp `pc-back-1-p.png`).

### 2.3 Type on the back

| Role | Face | Size (u, min) | Line height | Colour |
|---|---|---|---|---|
| Mark | Newsreader 400 | 4.6, 17 px | 1 | `--ink` |
| Number, labels | Inter 500, caps, tracking 0.16 em | 2.1 (labels 1.8), 11 px / 10 px | 1 | `--ink-3`, index in ink |
| Note | Newsreader italic 400 | 5.4, 17 px | 1.24 | `--ink` |
| Signature | Newsreader italic 400 | 6.2, 18 px | 1 | ink |
| Colophon values | Newsreader 400 | 3.3, 14 px | 1.15 | `--ink` |
| Hex | Inter 500, tabular | 1.7, 10 px | 1 | `--ink-3` |
| Micro | Inter 500, tracking 0.34 em | 1.4, 7 px (decoration, `aria-hidden`) | 1 | ink at 32 % |

Four sizes are text a visitor reads (note, signature, values, mark); the rest are labels. 10 px is
only for caps labels inside the object, which the charter allows for labels in a figure.

### 2.4 The drawings (one per card)

Each card gets one drawing of its own photograph, in the language of the scene drawings the owner
loves (`src/one/work/art/*.svg`, `src/one/rest/art/istanbul.svg`): `stroke-width: 1`,
`vector-effect: non-scaling-stroke`, round caps and joins, classes `.f` (0.55), `.h` (0.4, hatching),
`.d` (dash 2 5, construction). Each has one construction circle and one sight line, as the Recto
portico does.

| Card | Drawing |
|---|---|
| 01, YTÜ courtyard through a tinted lens | The lens is the frame: inside it the courtyard is drawn in full (trunks, engraved foliage clusters, the lawn in perspective hatching, the path, one walker); outside the lens the same horizon and trunks continue in dashed construction, so the drawing shows what the lens does. The two fingertips that hold the lens enter from the left edge. |
| 02, a metro platform | One-point perspective from the vanishing point: the coffered roof, the platform edge, the tactile strip as dots growing toward the viewer, the train as a box receding right with four windows and the stripe, long horizontal hatching for its motion, the hanging clock, two figures walking away, the red bag as the one closed shape. |
| 03, a kitten on the sea wall | Horizon, the low sun as a circle with two dashed halos, its road on the water as stacked strokes that widen toward the viewer, the sea wall's rough top edge and hatched face, the kitten as an outline filled with fine vertical hatching (a silhouette against the light), one weed in the wall. |

Production: new modules `tools/illustrations/postcards/{park,metro,cat}.mjs` that use the kit's
primitives and rules (`tools/illustrations/kit.mjs`, `rules.mjs`), seeded, built by
`tools/illustrations/build.mjs` into `src/one/rest/art/pc-<photo>.svg`. A photograph's line twin
(`tools/illustrations/line-twin/`) may be used as a tracing guide only; the shipped drawing is the
constructed one, because traced edges read as a filter, not as a drawing. Budget: at most 18 KB each
after svgo. Each card's drawing is data: `postcards-meta.json` gains `drawing` (file stem) and `crop`
(the stamp's crop point). A card without a drawing shows the plate empty and moves the message up
(no placeholder).

### 2.5 Motion on the back

- The turn stays (card3d, TURN spring). As the back reaches face-on (turn angle within 25 deg of 180),
  the drawing draws on: `stroke-dashoffset` from full length to 0 over 1.4 s on `--ease-draw`,
  construction first (`.d`), then the main strokes, then the hatching. The stamp lands 200 ms later
  (scale 1.04 to 1, rotate 4 to 2 deg, 380 ms `--ease-settle`), then the ring (opacity and rotate
  -12 to 0 deg). The signature's flourish draws last (600 ms).
- Turning back to the front and turning to the back again replays only the flourish (the drawing
  stays drawn for the rest of the view).
- Tilt: the drawing sits 0 px deep, the stamp 6 px in front (translateZ inside the preserved 3D card),
  so a tilt shows the stamp lifting off the paper.
- Reduced motion: everything drawn at once; the turn is the existing crossfade.

---

## 3. The ID card photo in 2.5D (T3) and the lanyard (T10)

### 3.1 Options weighed

| Option | How | Cost | Verdict |
|---|---|---|---|
| A. Depth map | A depth model makes a map; a WebGL or SVG displacement shader moves pixels by tilt | A model download (not available offline here), a shader or a per-frame `feDisplacementMap` (paint cost on every tilt frame), stretching artefacts at the hair edge | Rejected: heavy, and the artefacts are cheap-looking at the card's size |
| B. Three cut layers | Background, person, near hand as separate images, each translated by the card's tilt times its depth | Masks drawn once as polygons (data), background filled behind the person by edge smear at build time (Pillow), about +40 to 60 KB | **Chosen** |
| C. Light relief only | A specular sweep and an embossed edge on the flat photo | Cheap | Kept as the third ingredient of B, not alone (alone it still reads flat) |
| D. Moving portrait | A short video | The owner is not sure; it competes with the card's own motion | Not now |

### 3.2 Build (option B)

- Source: `src/assets/photos/gate-card-live-*` (square, 640 / 960).
- Masks: `content/photos/masks/gate-card.json`, two closed polygons in source pixels: `person` (head,
  hood, shoulders, backpack straps) and `near` (the thumbs-up hand and the forearm). Drawn once by the
  builder over the image at 2x zoom, about 60 to 90 points each, smoothed by Catmull-Rom at build time.
- Script: `tools/photos/relief.mjs` (Node with sharp, which `tools/photos/grade.mjs` already uses;
  it writes the card's graded photo today, so the relief layers start from the same grade). Steps: rasterize each
  polygon with a 1.5 px feather; cut `near` and `person`; for the background, fill the person's area
  by repeating the 24 px band just outside its edge outward and blurring 8 px (the parallax shifts by
  at most 7 px, so only a thin rim of this fill is ever seen); write three WebP/AVIF files at 640 and
  960 (`gate-card-bg-*`, `gate-card-person-*`, `gate-card-near-*`, the last two with alpha).
- Markup: inside `.idc-win`, three `<picture>` layers stacked with `position: absolute; inset: 0`,
  the flat photo kept as the first child for no-JS, reduced motion and `?photo=flat`.

### 3.3 Coupling to the card

card3d already computes the card's lean (`tx`, `ty` springs, degrees) and the swing (`th`). Add one
custom property pair on the card body, set in `render()`: `--px = ty / 14` and `--py = -tx / 10`
(both -1 to 1). CSS:

```
.idc-win .l-bg     { transform: translate(calc(var(--px) * -5px), calc(var(--py) * -4px)) scale(1.04); }
.idc-win .l-person { transform: translate(calc(var(--px) *  1px), calc(var(--py) *  1px)); }
.idc-win .l-near   { transform: translate(calc(var(--px) *  6px), calc(var(--py) *  5px)) scale(1.02); }
```

The background also takes `filter: blur(0.6px)` so the person separates. The relief light: the
existing `.idc-glare` gets a second gradient masked to the person layer's alpha (`mask-image` with
the person file), so the highlight crosses the face and the hood but not the background. During the
entrance twist and the flip the layers move with the same springs, so the depth reads in every
motion, not only on hover. Touch: the entrance swing and the device's own scroll (a small `--py`
from the card's velocity in the viewport, capped at 0.3) drive it.

### 3.4 Lab switch

`?photo=flat|layers` in `One.astro`'s pick list (one line, PERSON lane). The default is `layers` in
the lab; the flat photo remains the still twin. Budget: three layers at 640 px together at most 70 KB
AVIF.

### 3.5 The lanyard follows every motion (T10)

Today: the hover lean (`tx`, `ty`) and the entrance twist (`en`, `ep`) rotate only the card body. The
rope (desktop) ends at a fixed clip; on touch the strap is a static CSS strip inside `.idc-swing`.
That is why the owner sees the card move "by itself" while the lanyard stays still.

New coupling (all inside `card3d.ts`; no new physics engine):

1. **Lean to clip (desktop).** The card's lean is a torque on the clip. Each step, add a sideways
   force to the rope's last point: `F = -k_lean * sin(ty)` with `k_lean = 900 px/s²` per radian, and
   pull the clip toward the viewer (shorten the projected rope) by `L * (1 - cos(tx)) * 0.5`. The rope
   then bends a few pixels when the pointer leans the card, and relaxes on the same HANG spring.
2. **Twist to strap (both).** The entrance twist and any yaw (`en`, the turn's off-face angle) twist
   the strap's lower 30 %: the drawn ribbon narrows by `cos(yaw)` and shows its back face (ink 0.6)
   past 90 deg. On desktop this is a width change on the rope's last segment (two offset paths); on
   touch it is the new strap below.
3. **Touch strap.** Replace the static `.idc-strap` with the same SVG rope renderer driven by a
   two-segment pendulum (no pointer input): the anchor fixed, the joint and the clip simulated with
   the existing Verlet step, the card's entrance swing (`ep`) applied as an initial sideways velocity
   at the clip (`ENTER_SWING` converted to px/s). The strap then swings with the card and settles in
   the same 1.2 s, instead of the card swinging about a fixed clip.
4. **Hover sway.** Already pushes the clip; keep it, and let point 1 add the lean's share so the
   sway and the lean read as one motion.
5. **Idle settle.** At rest nothing moves (ADR-0008 calm rule). The page's own scroll gives the rope
   a tiny drag: when the card is in view and the page scrolls, add `-0.04 * scrollVelocity` px/s
   sideways at the joint (capped at 60 px/s), so a scroll is felt (G6) without the card ever
   wandering.

Still twins: reduced motion and `?still` get no rope motion (unchanged).

---

## 4. Exits (T15): leaving an enlarged photo and an opened project

Comps: `exit-photo-d.png`, `exit-photo-p.png`, `cap-first-d.png`, `cap-folded-d.png`,
`cap-first-p.png`, `cap-how-p.png`.

### 4.1 Cues considered

| Cue | Verdict |
|---|---|
| A close cursor (a small glass disc with the cross and "Close" under it) over the empty space | **Yes**, fine pointers. It explains "click the dark space" at the moment the pointer is there |
| The page behind visible through a light blur (backdrop 0.5 ink plus `blur(10px) saturate(.8)`, today 0.72 flat) | **Yes**. The visitor sees the page is still there and the view is a layer over it |
| A labelled close that grows from the capsule | **Yes**, as the first state of the close capsule: cross plus "Close" plus an `esc` key cap on fine pointers. After the first close in the session, or 4 s, or the first scroll in the layer, it folds to the cross alone (width animates from the left edge, 300 ms `--ease-out`, label fades in the first 120 ms). The fold is remembered per session (`sessionStorage`, wrapped in try/catch) |
| Escape hint | **Yes**, the key cap inside the labelled close. Escape already works in both layers |
| Swipe down on touch, with a pull ring | **Yes**. A downward drag on the photo, or an overscroll past the top or the end of the project layer, pulls the layer down (rubber band, `band(d, 120)`), dims the backdrop, and fills a ring around the cross in the close capsule (`stroke-dasharray` 0 to 100 % at 96 px of pull). Release past 96 px closes; before it, the layer springs back. The ring ties the gesture to the button |
| An edge that shows the page behind (the layer as a sheet with its top edge visible) | Rejected for the project layer: the open's paper grows to full screen by design (O1, kept). The light-blur backdrop does this job for the photo view |
| A first-time coach mark ("Swipe down to close") | Rejected: text over the photograph; the labelled close does the same job without covering anything |
| A big button | Rejected (owner) |

### 4.2 Chosen: one exit language for both layers

- **Photo view** (PERSON): the hint line under the card is replaced by two capsules on the glass
  tokens: [cross "Close" `esc`] and [turn icon "Turn it over"]. Desktop: a centred pair 16 px under
  the card. Phone: fixed at the bottom, close at the left gutter, turn at the right gutter (the same
  place as the project's capsules, so a visitor learns one place). The close cursor appears over the
  backdrop only (not over the card, where the cursor stays the grab hand). Tap on the backdrop still
  closes. The turn button gives touch users a visible way to turn, which today is only a hint.
- **Project layer** (WORK+SHELL): the close capsule of section 5 with the same first state, the same
  fold, `esc`, the pull ring on touch, and the close cursor on the far left and right empty margins
  of the layer's hero at 1440 (the side frames remain clickable as they are).
- Focus: on open, focus goes to the close button (both layers), so a keyboard user hears "Close,
  button" first. Icons come from `tools/icons` (`close`, a new `turn` icon drawn to the icon contract;
  no characters).

---

## 5. The opened project's bottom bar (T13, T14)

Comps: `cap-first-*`, `cap-folded-*`, `cap-how-*`.

### 5.1 Glass tokens (new, in `tokens.css`)

```
--glass-bg: rgb(30 30 34 / 0.62);
--glass-blur: blur(22px) saturate(1.5);
--glass-edge: inset 0 0 0 1px rgb(255 255 255 / 0.07), inset 0 1px 0 rgb(255 255 255 / 0.05);
--glass-shadow: 0 12px 40px -16px rgb(0 0 0 / 0.7);
--glass-pad: 4px;
--glass-item: 40px;   /* 44px under (pointer: coarse) */
--glass-gap: 12px;    /* between two capsules */
```

These are the tab bar's values (`Bar.astro`), with the blur raised from 16 to 22 px and a saturate
added. The tab bar, the two capsules, the photo view capsules, the close cursor and the rail panel all
use them. The tabs get `min-height: var(--glass-item)` (44 px on touch, audit hit-size fix).

### 5.2 Layout

- Two `<nav>` elements, each `.glass`: close (`aria-label="Close"`) and actions (`aria-label` the
  project's title). Both outer heights `item + 2 * pad`: 48 px desktop, 52 px touch.
- Desktop: a centred pair, gap 12 px, bottom 24 px plus the safe area.
- Phone: close at `left: 16px`, actions at `right: 16px`, bottom 16 px plus the safe area.
- Labels `--fs-small` 500, one baseline: every item is `inline-flex; align-items: center` with the
  same min-height, icons 16 px for arrows, 20 px for the cross, all with `data-align="cap"` from the
  icon contract.
- Primary action keeps the product fill inside the glass (`Open Recto`), secondary is plain
  (`Code`). A missing link shows the note as plain text, as today.
- Bug fix first (audit 2.5): the phone rule `.capsule :is(a, .cap-note) { padding: 0 16px }` must not
  reach the close; with two navs the close has its own class and the rule targets the actions only.

### 5.3 Text under glass

The comps show body text staying readable through the glass in headless Chromium where the layer's
text sits in composited layers. Two measures:
1. A bottom quiet band in the layer, the mirror of the bar's top band: `html.layer-open` gets a fixed
   `::after` on the layer, 120 px tall, `linear-gradient(to top, var(--ground) 0%, rgb(18 18 20 / 0.86)
   46%, transparent)`, under the capsules (z 61). The text fades before it reaches the glass.
2. If a device still shows text through, raise `--glass-bg` alpha to 0.72 for the layer capsules only.
   Check on the owner's iPhone.

### 5.4 Motion

On open the two capsules rise 16 px and fade in, close first, actions 60 ms later (spring
`--ease-out`, 420 ms), after the paper lands. On close they drop and fade in 200 ms. Press: scale 0.96
in 120 ms, release on the ui spring (same as the chips). Hover: `--fill-2` bed.

---

## 6. "How it's made": the cutaway (T11)

Today: a tilted crop of Recto's pages grid hangs out of the card, about 70 % black with four small
white pages (`round3/how-cmp.jpg`).

New piece: **the cutaway**, a line drawing of the product's layers in the same engraved language as
its scene, drawn on with the scroll, with the "How it's made" items as its labels.

- Form: three to five thin isometric planes stacked with 28 px gaps (like an exploded diagram), each
  plane a labelled layer of the product, joined by vertical dashed leader lines. The planes are drawn
  in the project's ink (`--wm-c` or the aura's first pigment) at 0.55, the leaders in `.d`.
- Labels: each list item stays as text (the list remains the accessible content). On desktop the
  list sits in two columns left and right of the drawing, each item with a short leader to its plane;
  on phones the drawing sits above the list, items numbered 1 to n, and the planes carry the same
  numbers.
- Content: a new optional field per project, `how.layers` in `content/projects/<id>.md`: a list of
  `{ name, items }`, where `items` are indices into `how.items`. Example for Recto (from its own list,
  no invented facts): Browser tab (Vite, React 19 and TypeScript) / Web Worker (PDFium compiled to
  WebAssembly) / Your files, which stay on the device (the CSP item) / Export check (the re-open and
  redaction items) / Tests in three engines (the last item). English Prep: Static files (no build
  step) / The page (zero runtime dependencies, no innerHTML) / The learner's browser storage /
  CI validation and blind review. Eat Map has no list: the section stays hidden. If `layers` is
  missing the section shows the list alone, with no picture.
- Drawing: a build-time component `src/one/work/HowMade.astro` renders the SVG from the data (no
  hand-drawn file per project); plane width 360 px desktop, 280 px phone.
- Motion: as the section enters, the planes draw from the bottom one up (`stroke-dashoffset`, 90 ms
  stagger, `--ease-draw`), then they separate from a closed stack (gaps 0) to their 28 px gaps,
  scrubbed by the section's progress (reversible). Reduced motion: drawn and separated.
- The `.how-crop` picture and the `howCrop` field in `data.ts` are removed. The card's bottom margin
  returns to the in-chapter scale.

---

## 7. The rail's jump panel (T9)

Comps: `rail-mid-d.png` (frame at 45 %), `rail-open-d.png`, `rail-open-p.png`.

### 7.1 Form

- A full-height sheet anchored to the right edge, 340 px desktop, `min(330px, 84vw)` on phones,
  radius 28 px on its left corners only. Background: `--glass-bg` plus a horizontal gradient so it
  reads as light gathering toward the rail; `--glass-blur`; a 1 px inner edge on its left side;
  shadow `-40px 0 80px -40px rgb(0 0 0 / .7)`.
- The rail stays where it is and becomes the sheet's spine: the beads are the rows' marks, so the
  sheet grows out of the rail rather than appearing next to it. Rows are right-aligned 14 px left of
  their bead; the existing open behaviour that pushes beads apart sets the row spacing (36 px desktop,
  46 px touch).
- Groups: small caps headers (11 px, `--ink-4`) "Work", "Eren", "The record" with the brief's "Eren"
  row above them. Rows: Inter 500, 15 px desktop, 17 px phone, `--ink-3`; passed rows show their
  section colour on the bead; the current row is Newsreader 21 px (24 px phone) in `--ink` with its
  bead as a 3 x 22 px glowing bar.
- Foot: "30 % down the page" at 13 px `--ink-3` (audit fix), a 2 px progress line under it, and
  "Esc to close" (12 px, fine pointers only).
- Veil over the page: `rgb(18 18 20 / .14)` with `backdrop-filter: blur(3px) saturate(.9)`. Light on
  purpose: the page stays legible, the panel is clearly in front.

### 7.2 Motion

- Open (click on the rail, Enter or Space on the focused rail, or a tap on touch): the sheet's
  `clip-path: inset(0 0 0 100% round 28px 0 0 28px)` animates to `inset(0 round ...)` on a spring
  (stiffness 260, damping 28, about 420 ms, family kit `springs.js` portfolio tempo), so it grows from
  the rail's edge. The rows do not get cut mid-word (the comp's 45 % frame shows the problem with a
  clip alone): each row slides in from 24 px right with opacity 0 to 1, 24 ms stagger from the current
  row outward. The veil fades in over 300 ms. The beads move apart on the same spring.
- Close (Escape, a click on the veil, a row click, a swipe right on touch): reverse, 300 ms, rows out
  first. A row click closes and scrolls; the sheet's close and the scroll start together.
- Hover (desktop) still previews the titles as today (the small state); the sheet is the click state.
- Reduced motion: the sheet and the veil cross-fade (150 ms), no slide.

### 7.3 Files

The rail is shared with the live site (`src/scripts/rail.ts`, `src/styles/rail.css`). The live site
must not change. WORK+SHELL adds `src/one/rail.css` (imported in `One.astro` after `rail.css`) and, if
the script needs a hook, an opt-in option `initRail({ sheet: true })` in `rail.ts` whose default keeps
today's behaviour; the live pages are checked unchanged by screenshot before the PR.

### 7.4 Phone

Same sheet from the right edge, over the bar (the bar's mark stays visible at the left of the sheet),
rows 46 px, current row 24 px serif. Swipe right or a tap on the veil closes. The rail touch target
stays 44 px.

---

## 8. The Home Record strip (T20) and the recorder (T6, T8)

Comps: `rec-head-d.png`, `rec-rows-d.png`, `rec-head-p.png`, `rec-rows-p.png`. Today: the objects
study's `compB-strip-*.png` and `round3/comps/shots/` baselines.

### 8.1 Grammar taken from the new page

- **Centred head, desktop.** "The record" and its dek are centred on the page axis, like How I work and
  Photos, at `--fs-h2` weight **500** (audit: the strip was 400). The dek is centred, max 30 em.
- **A frontispiece.** The recorder stands centred above the title, 300 px desktop, in its own line
  drawing: concentric reel rings around the left reel (nine rings, every third dashed, at 16 % blue
  `--record-1`), smaller dashed rings around the right reel, and six faint spokes from the left reel as
  construction. The drawing is the strip's own "scene", the way each project has one.
- **The tape becomes the spine.** One 1.5 px line (`--record-1` at 55 %) leaves the recorder at its
  lower left (from under the left reel), curves left around the title and the dek (never crossing
  text), and descends into the spine at "Now". From there the spine is the same line. This is the
  Record's identity (spine, marks) joined to the emblem.
- **One left edge.** The content column starts at 340 px at 1440, the same edge as How I work
  (`--rec-w` 1060 to 960). Year and dates hang in the margin to its left.
- **One entry-title size.** 21 px, weight 430 for notes and essays (the essay differs by its mark and
  dek, not by size).

Phone: the head is not centred (all phone chapter heads are left). Instead the whole chapter hangs on
the spine: the head and the year strip take `padding-left: var(--spine-w)`, the recorder (176 px)
stands at the right above the title inside the gutter, and the tape leaves it and turns down into the
spine above the title, so the spine runs from the recorder to the last row.

### 8.2 Motion (a pure function of the chapter's `--sp`, reversible)

| `--sp` | What moves |
|---|---|
| 0 to 0.12 | The reel rings draw from the inside out (`stroke-dashoffset`), the dark ground under the object fades in |
| 0.04 to 0.2 | The recorder turns with the scroll through its lean grid (desktop: the existing `m-lean` frames, mapped from `--sp` instead of the pointer while no pointer is near; phone: the poster, see 8.4) |
| 0.1 to 0.22 | The tape draws from the reel down to "Now" (`stroke-dashoffset` on the one path) |
| 0.2 onward | The spine continues to draw down, each mark lands, each row follows (today's choreography) |
| 0.3 | The tail and "The whole record" |

The pointer lean and the press clip of the recorder stay as on `/record/`.

### 8.3 The objects decision (T8)

Adopted: the study's **option 2** now, **option 3** next.
- Option 2 is section 8.1: 0 render hours, about 4 to 6 builder hours, 2 to 4 KB of SVG.
- Option 3 (next round, own lane): export each object's line drawing from its Blender model
  (Grease Pencil Line Art to SVG, in `tools/objects/`), starting with the recorder; its line twin then
  replaces the comp's reel rings as the strip's drawing, so the drawing and the glass object are one
  thing in two forms (the Anime.js pairing). Later, line twins of Recto, English Prep and Eat Map may
  enter their own scenes as one more layer; glass shows only where a chapter opens. This needs about
  half a day of tooling and no new Cycles hours.
- Rejected: option 1 (glass in the scenes) reads as a sticker on a pencil drawing and returns the
  piling W5 removed; option 4 (a new glass family) is the highest cost and taste risk and brings
  objects back into Work.
- edk in the footer stays (T7). An ADR records the decision (ADR-0018, "objects on the two-page
  Home: the recorder as emblem, line twins next").

### 8.4 The recorder on phones (T6), from the audit

1. **Dark local ground.** A radial pool under the object: `radial-gradient(closest-side, rgb(13 13 15 /
   .92), rgb(13 13 15 / .7) 55%, transparent)`, 1.7x the object's size, in the same stacking level as
   the stage (no `z-index` on it or on the object's wrapper, so `plus-lighter` still reaches the
   ground; the comp first failed exactly here: a `z-index` on the wrapper isolated the blend and the
   poster's black square showed). Additive drawing then behaves as on `/record/`. This also hides a
   WebKit black disc if Safari ignores the blend on a playing video.
2. **Inside the gutter.** Remove the phone margin `-36px -16px -40px 0`; the slot ends 16 px from the
   edge, so the shadow and the glow end before the screen edge and the rail's beads.
3. **Poster plus float on Home phones** until the owner's device check: a `data-spin="off"` attribute
   on the Home slot, read by `loopOf` in `src/scripts/media.ts` (opt-in; `/record/` keeps the spin).
   The edge-on spin frames read as a flicker at this size anyway.
4. **Mask the drawing out of the object's circle.** The Istanbul plate and the reel rings get a radial
   mask hole at the object's centre, so no line crosses the glass.
5. Device check for the owner (section 13): compare `/lab/one/` with `/lab/one/?spin=0` on the iPhone.

The faint dark square behind the recorder at 1440 (record-language known defect) has the same cause
as point 1's comp failure: an isolating ancestor. The builder checks with `tools/stack.mjs` from the
audit that no ancestor of `.m-stage` creates a stacking context.

---

## 9. Token and rhythm corrections (G5)

Each line names its lane and file. "Shared" files have the owner list in section 10.2.

### 9.1 Type

| Correction | Lane, file |
|---|---|
| Section heads one role: How I work, Photos, The record at `--fs-h2` weight 500 | RECORD (`RecordStrip.astro` `.rs-title`) |
| Path is a sub-head of chapter I: keep h3 29 px, align to the 340 edge | PERSON (`Path.astro`) |
| Body line heights two values: `--lh-list: 1.5` (lists, rows), `--lh-lede: 1.6` (ledes) | tokens (shared); each lane applies in its files |
| Lists at 17 px one family: Newsreader for both How I work's lanes and Path's rows (Path's look is the warmer one) | PERSON (`Tracks.astro`) |
| Record strip one entry-title size: 21 / 430 | RECORD (`RecordStrip.astro`, `LogRow` compact class only) |
| Tabs and capsule labels `--fs-small` | WORK+SHELL (`Bar.astro`, `work.css`) |
| Rail foot 13 px `--ink-3` | WORK+SHELL (`src/one/rail.css`) |
| Card: round the scaled sizes to two steps (no 13.8 / 12.9 pair) | PERSON (`IdCard.astro`) |

### 9.2 Space and rhythm

| Correction | Lane, file |
|---|---|
| Card slot 773 to about 560 px; card to Path `--in-chapter` | PERSON (`Rest.astro`, `IdCard.astro`) |
| How I work inner gaps 24 / 48 / 48 / 48 (`--s-5`, `--s-7` x 3) | PERSON (`Tracks.astro`) |
| Brief: replace `min-height` 690 / 700 plus margin with `padding-bottom: var(--s-9)` desktop, `var(--s-8)` phone | WORK+SHELL (`Brief.astro`) |
| Eat Map hold: shorten by 300 px and let the night-alley drawing rise into the empty upper half (layer offset -18vh at the hold's start) | WORK+SHELL (`src/one/work/work.css`, `Work.astro`) |
| Footer top padding `--s-9` to `--s-8` | RECORD (`Foot.astro`) |

### 9.3 Alignment

| Correction | Lane, file |
|---|---|
| One left edge 340 at 1440 for the person's part; Path heading 328 to 340 (drop its desktop `padding-left: 26px`) | PERSON (`Path.astro`) |
| Record strip on the same edge: `--rec-w` 1060 to 960 | tokens (shared, RECORD changes it) |
| Bostancı caption: 48 px gap to the photo becomes 32 (`--s-6`) | WORK+SHELL (`Bostanci.astro`) |

### 9.4 Glass

`--glass-*` tokens (5.1) for the tab bar, capsules, photo view capsules, close cursor and rail panel.

### 9.5 Radii

New tokens `--r-panel: 14px` (rail desktop states, small panels), `--r-sheet: 28px` (the rail sheet),
`--r-focus: 6px` (every focus ring), `--r-phone: 26px` (phone frames). Map the postcard raw values
4 / 2 / 6 / 12 to `--r-print` (3) and `--r-chip` (6); the card's container-unit radii stay (they scale
with the card). Each lane folds the raw values in its own files.

### 9.6 Hit sizes and press states

| Element | Fix | Lane |
|---|---|---|
| Tabs | 44 px on `(pointer: coarse)` via `--glass-item` | WORK+SHELL |
| Brief "The record" link | `padding-block: 12px; margin-block: -12px` | WORK+SHELL |
| Card face links | 44 px tall on touch (padding, not a bigger font) | PERSON |
| Record strip date and project links | Folded into the row link on touch (the row is one 44 px+ target, the project link becomes text); on desktop padded to 24 px | RECORD |
| Month bars on phones | 44 px wide hit area via `::before` | RECORD |
| Press state 120 ms scale 0.98 (0.96 for capsules) | Tabs, `.mark`, capsules (WORK+SHELL); card links (PERSON); `.rs-all`, month bars (RECORD) | all |

### 9.7 Motion tokens

Remove `--ease-reel`. Replace the raw 150 ms in `Bar.astro` and `work.css` with `--t-quick`
(160 ms). Add `--t-sheet: 420ms` (rail sheet, capsules in).

---

## 10. Fill and the page's end (E1)

Desktop half-screens graded C in the audit (#8 to #12, #17 to #19) are treated as follows:
- #8 Eat Map hold: 9.2 (drawing rises, hold 300 px shorter).
- #9 to #11 How I work to the card: the in-chapter gaps (9.2) and the card in chapter I (T1) remove
  about 260 px. The lanyard keeps its drop; the lanyard is the content of that band.
- #12 card to Path: slot and gap fix (9.2) removes about 380 px.
- #16 to #17 Record rows: the frontispiece's rings extend under the rows at fading strength, so the
  right half of the strip is not bare (comp `rec-rows-d.png` shows the first rings; the builder keeps
  them at most 9 % where text stands, as the aura rule `--aura-quiet` says).
- #18 to #19 end: footer top 72 px. The edk stays alone (T7).

---

## 11. Frame review (T19, G4)

The critic records 30 fps sequences (Playwright screenshots on a fixed clock) of: the postcard turn to
the back and back again (desktop, phone); the photo view open, first close, second open (the folded
close); the project open, the capsules arriving, the fold after 4 s, a press on each capsule, the pull
ring on the phone; the rail sheet open and close by click, by Escape, by a row; the record strip from
`--sp` 0 to 0.4 scrubbed in 40 steps; the card's hover lean with the rope, the entrance on desktop and
on the phone with the new strap; the 2.5D photo at five tilt angles. Defects that stop the line:
any text cut mid-word in a frame, any line crossing text, any black square or disc behind glass, any
frame where a press gives no visible response within 120 ms, any jump between consecutive frames
larger than the motion's own step.

---

## 12. Build lanes and file ownership

Three lanes, disjoint files. Each lane works in its own worktree on `wip/<topic>`, the lead merges to
`lane/one-r3` and opens the PR into `dev` (merge commit).

### 12.1 Lanes

**PERSON** (T1, T2, T3, T10, T15 photo part, G4 queued input, P2 eager images, C1, C2, C3, P4; G5 lines
marked PERSON)
- Owns: `src/one/rest/IdCard.astro`, `src/one/rest/CardEnd.astro` (delete or fold into `Rest.astro`),
  `src/one/rest/Rest.astro`, `src/one/rest/Postcards.astro`, `src/one/rest/Tracks.astro`,
  `src/one/rest/Path.astro`, `src/one/rest/guilloche.ts`, `src/one/scripts/card3d.ts`,
  `src/one/scripts/postcards.ts`, `src/one/scripts/tracks.ts`, `src/one/scripts/rest.ts`.
- Creates: `src/one/rest/art/pc-*.svg`, `tools/illustrations/postcards/*.mjs` (plus its entry in
  `tools/illustrations/build.mjs`), `tools/photos/relief.mjs`, `content/photos/masks/
  gate-card.json`, the relief image files in `src/assets/photos/`, the `turn` icon in `tools/icons/`.
- Data: `src/assets/photos/postcards-meta.json` gains `drawing`, `crop`, `deep` (written by
  `tools/photos/live.mjs`, which this lane extends).

**WORK+SHELL** (T9, T11, T13, T14, T15 project part, W3/O1 lift, O3 veil; G5 lines marked WORK+SHELL)
- Owns: `src/one/work/**` (including `Presentation.astro`, `work.css`, `data.ts`, `scripts/open.ts`,
  new `HowMade.astro`), `src/one/Bar.astro`, `src/one/Brief.astro`, `src/one/Bostanci.astro`,
  `src/one/base.css`, `src/one/scripts/shell.ts`, new `src/one/rail.css`.
- May touch, opt-in only: `src/scripts/rail.ts` (an option whose default is today's behaviour; live
  pages screenshot-checked unchanged).
- Content: `how.layers` added to `content/projects/recto.md` and `english-prep.md` from their existing
  `how.items` (no new facts), and the schema in `src/content.config.ts` (`how: section`, line 112)
  extended with an optional `layers`.

**RECORD+OBJECTS** (T6, T8, T20, R1, R2; G5 lines marked RECORD)
- Owns: `src/one/rest/RecordStrip.astro`, `src/one/media.css`, `src/one/Foot.astro` (padding only),
  new `src/one/rest/art/reels.svg` (or inline SVG in the strip), `docs/adr/0018-objects-on-home.md`,
  the "strip on Home" section of `docs/design/record-language.md`.
- May touch, opt-in only: `src/components/Media.astro` (a `spin` prop that writes `data-spin`),
  `src/scripts/media.ts` (`loopOf` honours `data-spin="off"`), `src/components/LogRow.astro` (a compact
  class for one title size; the Record page's own rows unchanged). The `/record/` page is
  screenshot-checked unchanged.

### 12.2 Shared files

| File | Who changes what |
|---|---|
| `src/one/tokens.css` | WORK+SHELL adds `--glass-*`, `--t-sheet`, `--r-panel`, `--r-sheet`, `--r-focus`, `--r-phone`; removes `--ease-reel`. RECORD changes `--rec-w` to 960px. PERSON adds `--lh-list`, `--lh-lede`. Each lane edits only its own lines; the lead merges WORK+SHELL first, then PERSON, then RECORD. |
| `src/layouts/One.astro` | PERSON removes the `card` pick and adds `pick('photo', ['flat','layers'], 'layers')`. WORK+SHELL adds `import '../one/rail.css'` after `rail.css`. No one else. |
| `src/pages/lab/one.astro` | No change. |
| `docs/feedback/2026-10-16-lab-one-review.md`, `docs/HANDOFF.md`, `docs/PLAN.md` | The lead only. |

---

## 13. Questions for the owner (taste), with a short brief in Turkish for the lead's message

1. The postcard back: is the drawing of each photograph, with the photograph set into it as the stamp,
   the right direction? (comps `pc-back-*`)
2. The metro photograph has no note. Would the owner like to dictate one line for it? The layout has
   room for two lines; without a note the signature stands alone.
3. The recorder as the Record's emblem, its tape becoming the spine (comps `rec-head-*`): right?
4. Should the project objects come back later as line drawings (option 3), or stay off Home?
5. Device check: on the iPhone, open `/lab/one/` and `/lab/one/?spin=0` at the Record strip and say
   whether a dark circle shows behind the recorder in the first one.
6. Reminder (T4): the default branch and "delete head branches" in the GitHub settings.
