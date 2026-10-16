# Design spec v2: Home on `/lab/one/`, round two

**Status:** proposal of the design lead, 2026-10-16. It revises `docs/design/one-spec.md` (round one)
after the owner's review `docs/feedback/2026-10-16-lab-one-review.md`. Every row of that review is
binding; section 1 answers each one. Where this file and round one disagree, this file wins for
`/lab/one/`. Taste points that need the owner are in section 10; everything else is technique and is
decided here. Nothing goes to a live page before the owner has tried the lab page.

**Inputs:** the review and the brief log (2026-10-16), `round2/parity.md` (81 reference features),
`round2/record-language.md` (the Record's language and the strip), `round2/motion-audit.md`
(measurements and the motion contract), the dev sources `src/components/IdCard.astro`,
`src/scripts/card3d.ts`, `src/pages/about.astro` (tracks), the content in `content/`.

**Comps** (stills of moving states; every inline transform in them is one frozen value of a
scroll-linked function in this file). Folder: `round2/comps/`. Screenshots in `round2/comps/shots/`
at 1440x900 and 390x844 (DPR 2, touch); one contact sheet: `round2/comps/sheet-comps.png`.

| Comp | File | What it shows |
|---|---|---|
| Work at rest | `work.html?s=rest` | Recto with one clear frame, its line-art portico behind, one dim side frame |
| Work mid-scroll | `work.html?s=mid` | Recto leaving (bent, draining), English Prep arriving, the street motif, a sakura branch in front |
| Opened project | `open.html` | Recto between step 01 and 02: the next screen laid over the last, rule between labels, the layer rail |
| Bostancı | `bostanci.html` | P1: the photograph whole and vertical, in the brief's construction circle |
| How I work | `person.html?s=lanes` | The tear just passed over the pinned Eat Map map; the previous two-lane figure with drops |
| The card | `person.html?s=card` | The dev ID card (ported) with the three additions, hover sway at its peak, the footer object rising |
| Postcards, table | `postcards.html?s=table` | Three cards, the middle one picked up and placed on top, proof marks showing |
| Postcard, back | `postcards.html?s=back` | The new back in the large view |
| Record strip | `record.html` | A cut of the Record: head, year strip, spine with three rows, dashed tail, recorder |
| Motif sheet | `motif-preview.html` | The three project motifs and the guilloche, at full strength (build at 6 to 16 %) |

Marks: [O] the owner's words, [M] measured (audit, parity, record study), [D] decided here.

---

## 0. What is kept, what changes, what is new

**Kept from round one:** the brief's text and layout (G1); the order of the parts (G2), with one move
(the ID card, section 3.5); the token faces, type scale, colour inks and aura sets (§2.1 to §2.5); the
bar and tabs; the open and close by view transition ("the paper grows", W3, O1); real URLs and the static
project pages; the opened layer's parts (hero, facts, steps, numbers, why, how, next); the footer
bookend; every still twin; the one-fact-one-place table (amended in 3.9).

**Changed:**
1. Work: the pinned deck, the shuffle and the timed title swap are removed. Work is a flight: frames in
   normal page flow that move with the scroll (section 3.3).
2. Motion: every scroll-linked value is a pure function of scroll position. No one-shot reveals, no
   timers, no "settle, then swap". Desktop wheel input is smoothed (section 7). This replaces round one
   §4.2, §4.4 (timed aura cross-fade), §4.5 (two clocks) and §7.1 ("no Lenis").
3. The aura: no transition of inherited `@property` colours on `:root`. Each section owns a fixed pool
   set; the field cross-fades two sets by opacity as a function of position (section 2.4).
4. The opened layer: it gets the rail, and steps move with the scroll (section 3.4).
5. The ID card: the round-one reimplementation is dropped; the dev card is ported as it is, then three
   additions (section 3.5).
6. How I work: back to the previous About figure (two lanes, falling drops), at today's sizes (3.5).
7. Postcards: designed again from their parts; new pick-up, release and re-stack physics (3.6).
8. The Bostancı photo: whole and vertical in its own frame between the brief and Work (3.2).
9. The Record strip: a cut of the Record in the Record's own language (3.7).
10. The person's part is three chapters with chapter gaps, not seven equal strips (section 4).

**New:** a line-art motif per project and per chapter, layered with the aura in 2.5D (section 5); the
moving tear over a pinned last Work scene (W7); pointer parallax; text that rises in per-line masks;
the art-project frame standard (section 6); the round-two token additions (section 2); the adopted
motion contract (section 7).

**Removed:** the deck (`deck.ts`, the sticky stage, clock 2); the `?work=deck|drift` switch (dead, parity
§10); the Contact strip (its links live on the card, 3.5); the cropped Bostancı plate behind the brief;
the "Work 01 / 03" index label (the rail and the frame caption carry it); the glass objects in Work on
Home (they live in the opened layer and in Eat Map's frame).

---

## 1. Every review row, answered

| Id | Design answer | Where |
|---|---|---|
| G1 | Brief text and layout unchanged. Its plate changes: the cropped photo and its twin leave; the construction drawing stays and now centres on the Bostancı frame, whose top edge peeks at the bottom of the first screen (it replaces the Work peek). | 3.1, 3.2 |
| G2 | Order kept: brief, (Bostancı), Work, then the person's part. One move: the ID card goes to the end and absorbs Contact (C3). | 3.5, 4 |
| G3 | The "is this cheap?" test is a line of the frame standard (6.3): no default pill rows, no stock shadows, no centred-label-plus-three-lines strips, no white-bordered prints, each strip owns a drawing. | 6 |
| G4 | The art-project standard: 14 frame rules checked on 60 fps frame sheets of every scene, both widths, both directions; one defect stops the line. | 6 |
| G5 | Token and rhythm corrections before Record work: type floor, four sizes per screen, chapter gaps, fill targets, new motion tokens. | 2, 4 |
| G6 | Every value follows position; wheel input is smoothed; every click answers in one frame and animates the whole way; no dead span over 120 px. | 7 |
| G7 | Parity matrix done (`parity.md`); its 15 "fullness" features are all placed in this spec (table 5.4). | 5.4 |
| G8 | Click model: only Robin pairs scroll flow with a click open; ours keeps the open and adds the missing scroll half (flight). | 3.3 |
| G9 | Process row; this spec plus its lab switches is the round-two plan. | 10 |
| M1 | The catch came from the design: a pinned deck with 41 % dead scroll, timed swaps, a root-wide style recalc per frame and stepped wheel input [M]. All four causes are removed. | 2.4, 3.3, 7 |
| M2 | "Pond": desktop wheel smoothing (lerp 0.1), layers at their own speeds (0.6 to 1.25x), skew from smoothed velocity, pointer parallax. Touch keeps native momentum. | 7 |
| M3 | Long scenes are allowed when they move: the Bostancı frame and the tear are long, never still. | 3.2, 3.3.4 |
| M4 | Text rises in masks line by line and plays backwards on the way up; images fly, bend and regain colour by position; the aura hue follows position. | 7, 3 |
| M5 | Every scroll scene is re-specified as a function (sections 3 and 7) and reviewed on frame sheets (6). | 6 |
| W1 | No pin and no shuffle. | 3.3 |
| W2 | Robin's flow: frames fly up through the view at their own depths, bend through the centre, skew with speed, regain colour in the middle. | 3.3.1 |
| W3 | The open is kept; it starts from the hero frame's frozen transform. Its cost drops (ticker and field paused first, at most 8 named groups). | 3.3.5 |
| W4 | One line-art motif per project, three depth layers each, with the aura behind: Recto a portico of pages, English Prep a night street under signs, Eat Map an engraved city plan. | 5 |
| W5 | At rest one clear frame per project; side frames at most 30 % inside the view and at most 45 % bright; no glass object in Work on Home. | 3.3.1 |
| W6 | No page swap inside a project: a project's other screens fly past as side frames; they never replace the hero. | 3.3.1 |
| W7 | Eat Map takes 0.6 screen, carried by its pin object and its map; then its scene pins while the torn paper slides over it, and the map's route lights with the tear. No still span over 120 px. | 3.3.4 |
| O1 | The open is kept. | 3.3.5 |
| O2 | The layer has its own rail (beads, the active part's name beside it on desktop). | 3.4 |
| O3 | Steps are scrubbed: the next screen slides over the last inside the window, the text rolls over in masks, the index rule glides. Reversible, no dead zone. | 3.4 |
| C1 | The reimplemented card is deleted. | 3.5 |
| C2 | `IdCard.astro` and `card3d.ts` from dev ported unchanged (physics constants included); only token names are mapped. Then: guilloche plus fibre texture, a regraded photo under a moving laminate, a hover sway of card and lanyard. | 3.5.1 |
| C3 | The card moves to the end of the page, as the one place of the links (Contact is removed). Lab switch `?card=end|lanes` shows the alternative (between the two lanes). | 3.5.2 |
| C4 | The previous About tracks figure returns (two thin lines, a light falling down each, a U that meets at "Both matter."), at today's sizes and contrast. | 3.5.3 |
| P1 | The Bostancı photograph whole (1932x2576, 3:4), 772 px tall on desktop and full width on phones, in its own frame after the brief. | 3.2 |
| P2 | The large view uses the card3d tilt engine (the ID card's proven springs) for drag, swing and turn. | 3.6.4 |
| P3 | Release animates on the same spring as the pick-up (ui spring, then the landing spring). | 3.6.4 |
| P4 | Postcard designed again from 16 parts: the front a photograph in a mount made of its own light; the back a card of the photograph (its words, its colours, its place, a stamp cut from it, a ring postmark whose cancellation is its own luminance). | 3.6.1 to 3.6.3 |
| P5 | Hover lifts the card out of the overlap first, switches its stacking while nothing overlaps, then lays it on top; neighbours lean away; the last card touched stays on top. Parallel planes, so nothing intersects. | 3.6.4 |
| R1 | The strip is a cut of the Record: serif titles, spine, kind marks, project colour, year strip, the recorder. | 3.7 |
| R2 | The Record's language is written (`record-language.md` §2) and adopted as binding for the strip and the Record page; round one §6 is withdrawn. | 3.7, 10 |
| E1 | Textures and drawings per screen: project motifs, the brief's construction circle, rain hairlines in How I work, the guilloche behind the card, the engraved map under the tear, floating tech tags in Work margins; rules against clutter in 5.3. | 5 |
| H1 to H3 | Not design rows; the lead handles them in the process (authorship, achievements, pull requests). | - |
| X1 | Process row; closed by the tracker. | - |

---

## 2. Tokens: corrections and additions

Write these numbers into `docs/design/charter.md` before use (CLAUDE.md rule).

### 2.1 Type

- Floor 12 px everywhere, the phone included. The ID card text is in container units; on phones the card
  is 280 px wide, so its smallest text (4.3cqi) is 12.0 px. `idc-issued` and the hint use
  `max(12px, 4cqi)`.
- At most four text sizes per screen. How I work drops to four: 42 (title), 29 (lane labels, the quote),
  17 (items, the lede, the "gives" line in italic serif), 13 (meta). The `gives` line was 19/20 px: it
  is now 17 px in Newsreader italic, set apart by its face, not by size.
- No hard-coded `15px` or `11px`: `.btn` and `.tabs a` use `--fs-small`; print captions use `--fs-cap`.
- Masked lines (`.ln`) pad 0.06 em above and 0.26 em below (descenders of "g" and "p" were cut in the
  first comp at 0.08 em). Inside the mask the text is never cut at rest.

### 2.2 Space and rhythm

- `--chapter-gap`: 168 px desktop, 112 px phone, between the person's chapters (section 4).
- `--in-chapter`: 48 to 72 px desktop (`--s-7` to `--s-8`), 36 to 48 px phone, between blocks of one
  chapter. `--strip-gap` is retired.
- Fill per screen [M targets]: 30 to 55 % at 1440, 35 to 70 % at 390; never under 25 % unless the screen
  is a deliberate art frame whose drawing moves with the scroll; never over 75 % on the phone.
- Work length: 0.9 to 1.1 screens of scroll per project, Eat Map at most 0.6 plus the tear.

### 2.3 Motion tokens (new)

| Token | Value | Use |
|---|---|---|
| `--lerp-wheel` | 0.1 per 60 Hz frame (`k = 1 - 0.9^(dt/16.67)`) | desktop wheel smoothing |
| `--vel-skew` | 0.06 deg per px/s of smoothed velocity | skew of flying frames |
| `--skew-max` | 6 deg desktop, 3 deg phone | clamp of that skew |
| `--line-stagger` | 6 % of the range | per-line offset in a mask group |
| `--line-rise` | 110 % plus 4 deg skewY | a line's start inside its mask |
| `--fly-depth` | 0.82 to 1.18 desktop, 0.92 to 1.08 phone | frame speed factors |
| `--fly-turn` | 5 deg desktop, 3 deg phone | the turn that reverses through the centre |
| `--fly-bend` | 14 deg desktop, 0 phone | rotateX as a frame passes the centre |
| `--fly-scale` | 0.88 (edge) to 1 (centre) | frame scale |
| `--exit-rise` | 30 % with opacity to 0 over the last 40 % of the range | lines leaving (no clip) |
| `--px-pointer` | 4 / 10 / 18 px (far / mid / near), time constant 100 ms | pointer parallax, fine pointers |

Retired: `--ease-reel`, `--step` for scroll-linked work (stagger lives in ranges now), `--t-swap` for the
aura (the aura no longer changes in time).

### 2.4 Aura

- The pigments stay as round one §2.5. They are no longer animated custom properties on `:root`. Each
  section has a fixed pool set (three pools as small elements scaled by transform). The field holds two
  sets at a time and cross-fades them by opacity, as a pure function of the boundary's position in the
  view (the boundary crossing from 70 % to 30 % of the view height). Cause and measurement: the root-wide
  recalc took 3.4 s of an 11 s scroll [M, audit §2.1].
- No blend reaches the fixed field: glass objects and pools blend only inside isolated groups, or the
  light is baked into the media (audit rule 14).
- Under text: at most `--aura-quiet` 0.08. The hush stays.

### 2.5 Record grid (from the Record, named for the new set)

`--rec-gutter` 64 px, `--rec-spine` 36 px, `--rec-col` 680 px, `--rec-thumb` 244 px, `--rec-w` 1060 px;
phone spine column 22 px. The spine uses `--line-3` (0.22) until measured; the old 0.10 / 0.18 rules
map to `--line-1` / `--line-2`.

### 2.6 Shared object tokens (card and postcards)

`--gold-ink` rgb(243 184 134); `--foil` the conic gradient of the dev card (`#f3b886, #f6dcc4, #c9d4ff,
#efb1cb`); `--guilloche` 0.07 (behind the card) to 0.11 (on a card face). The card and the postcards are
one family: the same foil edge, the same guilloche, the same gold ink.

### 2.7 Line art

Stroke 1 px, `vector-effect: non-scaling-stroke`, round caps. Opacity by layer: far 0.06 to 0.10, mid
0.12 to 0.16, near 0.2 to 0.5 (only small pieces: sheets, blossoms, route pins). Colour: the section's a1.

---

## 3. Layout and motion, part by part

### 3.1 The bar and the rail

- Bar unchanged. In the opened layer on phones its backing goes to 96 % (the leaving screen in the comp
  made "edk" unreadable over a white document at 78 %).
- The Record tab gets a "near" state while the Record strip is in view: its label goes to `--ink-2` and
  its lens leans 22 % toward it (record-language §4.5).
- Page rail labels: Eren, Recto, English Prep, Eat Map, How I work, Path, Photos, Now, Record, Card. The
  Bostancı frame belongs to "Eren". Each bead re-inks as the torn edge passes it (parity SH6).

### 3.2 The brief and the Bostancı frame (P1)

First screen (G1): text and layout as built. Behind it only the construction drawing (8 to 10 % ink,
the arrival line drawing kept). The cropped photo and its line twin are removed. At the bottom of the
first screen the top edge of the Bostancı frame peeks (desktop at y 760, phone at y 720).

The frame, desktop (comp `bostanci-1440.png`):
- The photograph whole, 3:4, 772 x 579 px, centred, radius 3, `--e-lift` plus a 160 px blue glow. Source
  `content/photos/bostanci-rain-dusk.jpg` (1932 x 2576) at 1160 and 1740 px tall (AVIF), never upscaled.
- The construction circle of the brief continues around it (r 520 dashed, r 322 solid at 10 % ink), the
  page axis dotted, the horizon through the photo's horizon line, crop marks at two corners.
- Caption at the left, bottom-aligned with the photo: the note in Newsreader italic `--fs-h3`
  ("Bostancı station in the rain, at blue hour.", from `about.chapters[photos].photos[0]`) and the place
  in meta. The caption is the one place of this note (the postcards no longer carry Bostancı).
- Scroll, over 1.2 screens (pure functions of the frame's view progress p): scale 0.92 to 1.0 at p 0.5
  to 1.03 at p 1 (NC2 push-in); the photo develops from its line twin (an ink-coloured alpha image
  above it, opacity 1 to 0 over p 0.1 to 0.45); the caption lines rise in masks; the brief's text above
  leaves by `--exit-rise`. From p 0.7 the red signal in the photo (a measured pixel) glows; the portal
  into Work grows from it (round one §4.6, now part of this frame, priority 2).

Phone: the photo full width (358 x 477), top at 96 px when centred; the caption under it; the same
functions with scale 0.95 to 1.0.

### 3.3 Work: the flight

#### 3.3.1 Desktop (comps `work-*-1440.png`)

Each project is a block of normal page flow: Recto and English Prep 1.05 screens, Eat Map 0.6 screen.
Inside a block, top to bottom: the hero frame, the meta label, the wordmark, the promise, the button.
Side frames, motif layers and tags are absolutely placed in the block.

For each frame let `u` = (frame centre - view centre) / view height, so `u` is 0 at the centre, -1 a
screen above, +1 a screen below. Every value is a function of `u` and of the smoothed velocity `v`:

| Value | Hero frame | Side frames |
|---|---|---|
| speed (depth `d`) | 1.0 at rest; leaving 1.18 (`u < 0`), arriving 0.94 (`u > 0`) | fixed per frame: 0.82 or 1.18 |
| translateY | `-u * (d - 1) * vh` | same formula |
| rotateX | `14deg * u` (bends away above the centre, toward the viewer below it) | `10deg * u` |
| rotate | rest turn (-1 deg) `- 3.5deg * u` | rest turn (+-5 deg) `- 2deg * u` |
| rotateY | 0 | `+-(20 to 26)deg` toward the axis |
| scale | `1 - 0.12 * |u|^1.5` | 0.55 to 0.62 of the hero |
| skewY | `clamp(v * 0.06, -6, 6)` deg | the same, times 1.3 |
| colour | a greyscale twin above it, opacity `smoothstep(0.25, 0.8, |u|)` | a dark overlay at 55 to 70 % |

Rules:
- At rest (`|u| < 0.1`, no scroll) the screen holds exactly one clear frame: the hero, 760 px wide (16:10
  plus an 8 / 8 / 28 px mount in the project's paper), top at 104 px. Side frames are at least 70 %
  outside the view and at most 45 % bright. The wordmark, promise and button sit under the hero (comp).
- In transit at most two heroes and two side frames are visible. The next hero enters when the current
  one is at `u = -0.35`.
- The wordmark drifts at 0.8x: it enters through its mask (`--line-rise`) as its block arrives and
  leaves by `--exit-rise` (no clip at slow speed). Promise and button move at 1x, lines in masks, 6 %
  apart. The meta label leads by 4 %.
- A project's other captures appear only as side frames (W6): Recto's light table and markup screens,
  English Prep's phone lesson. They never replace the hero.
- Colour change only by opacity (greyscale twin, overlay). No `filter` is animated (audit rule 13).
- Caption on the mount: "Recto · The Library" left; the project's number "01 / 03" right.
- The aura: the project's pool set fades in as the block's top crosses from 70 % to 30 % of the view;
  the previous set fades out by the same function (2.4).
- Hover (fine pointer): the hero lifts 4 px and scales 1.02 over 200 ms; the button's letters roll
  (parity AW10, 300 ms). Pointer parallax on the motif layers (`--px-pointer`).
- Tech tags (parity SH14): two or three words from the project's `stack` field ("WebAssembly", "PDFium")
  in the far margins at 0.6x, label style, `--ink-4` at 55 %.

#### 3.3.2 Why this is Robin's flow and not the deck

Robin's frames travel with the wheel, bend through the middle and regain colour there; the page never
stops [M, `clip-robin-noguier.png`]. We keep that and drop what made our deck catch: the pin, the
shuffle, the timed swap and the text that waited for the hand to stop [M, audit §2.4]. The title moves
with the page instead of swapping (Robin swaps it; the owner did not want swaps, W6).

#### 3.3.3 Phone (comps `work-*-390.png`)

A different composition, not a smaller desktop:
- Frames are flat: rotateZ only (at most 3 deg), no rotateX or rotateY. Depth 0.92 to 1.08. Skew from
  velocity at most 3 deg (touch momentum still gives a velocity).
- Recto's hero is a 350 px square crop (the content's `focus` point); English Prep uses its phone
  captures as tall frames, 234 px wide; Eat Map its object.
- One motif layer only (far, 0.6x); no near pieces (the sakura branch crossed the wordmark in the first
  phone comp).
- At rest the next project's frame peeks 60 px at the bottom. Block length 1.0 screen (English Prep 1.15,
  for its tall frame).
- No pointer parallax and no device tilt.

#### 3.3.4 Eat Map and the tear (W7)

- Eat Map's block is 0.6 screen. Its frame is the glass pin object (poster, then its spin loop) on the
  wine paper (#261116), set into its engraved map (section 5). Wordmark, promise ("An iOS app, built in
  Xcode.") and the "Code not public yet" note under it.
- Then the scene pins (sticky) for 0.5 screen while the paper sheet with the torn edge slides up over it
  at 1x (parity SH11). The tear's top travels 1.2 screens in total. While it travels, the map's route
  lights stop by stop (each stop's ring gains opacity as the edge passes its y). So nothing is still.
- The torn edge: our grain, one light fibre line at `--line-2`, generated per width (the first phone
  comp compressed a 1440 px edge into 390 px and it read as a saw blade).
- Phone: the same, 0.4 screen of pin.

#### 3.3.5 The open (kept)

Round one §4.8 holds, with three changes: (1) the open starts from the hero frame's current transform
(frozen at the click), so a frame clicked mid-flight grows from where it is; (2) before
`startViewTransition` the ticker, the smoothing and the field pause (the measured worst frame was
600 ms at 4x [M]); (3) at most 8 named groups: `paper`, `shot`, `meta`, `title`, `promise`, `side-1`,
`side-2` (desktop), and the bar. `obj` is dropped (no object in Work).

### 3.4 The opened project (O2, O3; comp `open-mid-*.png`)

- **Rail.** `createRail({ scroller: layer, ... })` with the parts that have data: Overview, Facts, one bead
  per step, Numbers, Why, How it's made, Next. The active bead fills with the part's progress. On desktop
  the active part's name sits beside its bead while the layer scrolls and fades 1 s after it stops; on
  phones beads only.
- **Smoothing.** Its own Lenis instance on desktop (wrapper the layer, content the presentation), created
  on open, destroyed on close.
- **Hero.** Push-in: scale 1 to 1.06 over the first 0.4 screen while the facts row arrives (NC2).
- **Steps, desktop.** A sticky stage: the index row at y 100, the window (800 x 500, radius 10) at y 136,
  the step text under it, the capsule at the bottom. Each step owns 70 svh of scroll. Around each
  boundary a transition window of 45 % of a step:
  - the next screen slides up over the last inside the window (translateY 100 % to 0), with a 40 px
    shadow on its top edge;
  - the last screen moves -4 %, scales to 0.95 and darkens (an overlay to 45 %);
  - the step text rolls over in the first third of the window (old lines leave by `--exit-rise`, new lines
    rise in masks), so in most frames the text is whole;
  - the index rule interpolates its left edge and width between the two labels; label inks interpolate.
  Between windows the screen pushes in slowly (scale 1 to 1.025) and a step's clip plays if it has one,
  so no span is dead. Everything reverses on the way up.
- **Steps, phone.** Linear: number, title, body, then the screen; each screen rises by its own view
  timeline (28 px to 0, scale 0.97 to 1, opacity 0.6 to 1); leaving screens scale to 0.96 and dim.
- **Quiet ground.** The project's motif at 5 to 6 % behind the layer (parity SH8).
- **Capsule.** Unchanged; labels never wrap (`white-space: nowrap`; the first phone comp wrapped "Open
  Recto").

### 3.5 The person: the card, How I work

#### 3.5.1 The ID card (C1, C2; comp `person-card-*.png`)

Port, exactly: copy `src/components/IdCard.astro` and `src/scripts/card3d.ts` from dev into
`src/one/rest/IdCard.astro` and `src/one/scripts/card3d.ts`. Keep every physics constant (UI 300/30,
TURN 170/22, LAND, HANG, the rope with 10 segments, G 3200, the calm limits), the entrance twist, the
rope, the still twins and the WebKit face fix. Map only token names (`--about` to the gold ink,
`--f-display` to `--f-serif`, `--f-ui` to `--f-sans`, `--rule` to `--line-1`, `--t-meta` to
`--fs-label`). Delete `src/one/scripts/idcard.ts`. Then add three things and nothing else:

1. **Denser texture.** A guilloche engraving (two rosettes, `--guilloche` 0.11) and a paper fibre (the
   grain tile at 64 px, overlay) under the type, on both faces; one micro line along the lower edge
   ("EDK · YILDIZ TECHNICAL UNIVERSITY · ISTANBUL", 2.4cqi, gold at 28 %, `aria-hidden`). The guilloche
   rotates 1 deg per 10 deg of card yaw, so the engraving catches the light.
2. **Livelier photo.** Regraded at build by `tools/photos` (exposure +6 %, saturation +16 %, contrast
   +7 %, warmth +6 %; a new `gate-card-live-*` set), seated as a window (inset hairline, a 1 px top
   light), under a laminate band (a 115 deg gradient of the foil colours, screen blend) whose position
   follows the existing glare variables `--gx`, `--gy`. So the photo shimmers as the card turns. If the
   owner meant a moving portrait, that needs a short clip from the owner (section 10, Q5).
3. **Hover sway.** On `pointerenter` over the card or its rope (fine pointers), the rope's clip gets one
   sideways impulse through the existing integrator: `clamp(pointer vx * 0.35, -140, 140)` px/s, or
   60 px/s away from the entry side when the pointer barely moves. It stays under `SPIN_FROM`, so it
   never spins. Result: a 3 to 5 deg swing of card and lanyard together, settled in about 1.2 s. One
   impulse per entry; none while held; none under reduced motion.

The entrance twist now starts when the card enters the view (not at page load). Phone: the card is
280 px wide; tap turns; no rope.

#### 3.5.2 Where the card hangs (C3)

At the end of the page, as the last chapter, with the footer (comp `person-card-1440.png`):
- The card carries the links on its front (exactly as on dev). So the card becomes the one place of
  GitHub and LinkedIn, and the Contact strip is removed. One fact, one place.
- An ID card with your links is what you hand over when you leave. It closes the page with the one
  object the owner loves, and it fills the weakest screen of round one (Contact plus footer, 20 % [M]).
- The 900 px band of empty ground after Work (the lanyard on an empty screen [M]) disappears, because
  the tear now reveals How I work, a dense chapter.
- Layout: the strap runs up out of the view (it fades into the bar zone); the card's top at y 236; the
  hint at y 772; behind it a large guilloche rosette (1120 px, 7 %) that turns 20 deg over the chapter's
  scroll; the footer's edk object rises at the bottom. Phone: card top at 210, hint "Tap to turn it
  over", the object at 760.
- Lab switch `?card=end|lanes`: `lanes` hangs the card on the axis between the two lanes of How I work
  (its back line is the two lanes in one sentence). Default `end`.

#### 3.5.3 How I work (C4; comp `person-lanes-*.png`)

The previous About figure (`about.astro` `.tracks`), centred as one 760 px block:
- Title "How I work" (`--fs-h2`), the lede (`--fs-body`, ink-2), then two lanes 64 px apart. Each lane:
  a 1 px line on its left (gold for "With agents"), the label in Newsreader `--fs-h3`, three items with
  4 px bullets on the line, then "What it teaches" (meta) and the `gives` line (italic serif 17). Under
  them the U that joins the two lines, the node, "Both matter." (`--fs-h3`), then the quote (italic serif
  29) with its gold bar. No cards, no boxes (the boxed lanes read cheap [O]).
- The drops: each line carries a falling light (8 px, glow 12 px) with a 56 px comet tail; periods 7.0 s
  and 5.6 s, independent phases; the second lane carries a second, fainter drop. When a drop reaches the
  end of its line it runs into the U and the node brightens once. This is the chapter's one ambient loop;
  it pauses off screen and under reduced motion (a drop then rests at the top of each line).
- Scroll: the two lines draw down as the chapter enters (view timeline, reversible); the items rise in
  masks 6 % apart; the U and the node draw when both lines are complete.
- Texture: faint rain hairlines (gold, 22 % at their foot) in the margins only, at 0.7x: the brief's rain,
  come back as drops.
- Phone: the lanes stacked; the agents' line continues the hand's line (as on the old phone About); the U
  is dropped; the node and "Both matter." follow the second lane.

#### 3.5.4 Path

The line from the node "Both matter." continues downward and turns into the timeline (desktop: a
horizontal line across `--w-wide`; phone: vertical on the axis), so How I work and Path read as one
drawing. The line draws with the scroll; each stop's text rises in its mask as the line reaches it; the
"now" stop is lit gold. Content as round one §3.4 item 3.

### 3.6 Photos: the postcard, designed again (P2 to P5)

#### 3.6.1 What a postcard carries, and what each part becomes

| Part | Stock postcard | Ours |
|---|---|---|
| Picture | photo with a white border | the photograph at its own aspect, never cropped, a light keyline |
| Frame | white paper margin | a mount made of the photo's own light: a blurred copy of itself at 38 % brightness, plus grain; each card's frame has its photo's colour |
| Edge | none | a 1 px foil hairline (the ID card's foil) |
| Caption | printed title | one edge line: the place in Newsreader italic, the index "01 / 03" in tabular figures |
| Proof | none | gold crop marks at the four corners, shown only while the card is held |
| Paper | card stock | warm dark stock (#1c1a17 to #11100e), fibre grain |
| Security | none | the guilloche of the ID card, low left |
| Divided back | a vertical centre line | a gold hairline at 67 % height with a diamond node at the golden section |
| Message | handwriting | the note in Newsreader italic, set ragged like a hand; hidden when the content has no note |
| Signature | a scrawl | "Eren" in italic gold, under the note |
| Stamp | a printed stamp | a crop of the photograph itself, scalloped edge (bites every 9 px), on a cream backing |
| Postmark | rubber circle | two thin gold rings, the place on the ring (textPath), the edk mark in the middle |
| Cancellation | wavy bars | five lines traced from the photograph's own luminance row (a tool computes them per photo) |
| Address | name and street on rules | the place on rules: "Place", "City" (from `place`); "Date" only when the content has a date |
| Postcode boxes | digit boxes | a palette: the five colours the photograph is made of (measured by the photos tool), the first three in hex |
| Publisher line | small print | a micro line along the lower edge: "EDK · PHOTOGRAPH · <place>" |

The result reads as an artwork card about one photograph (its words, its colours, its place), not as a
post-office form. Nothing is invented: every value comes from `home.postcards` or is measured from the
file. The year is not shown (the photos carry no date).

#### 3.6.2 Front (comp `postcards-table-1440.png`)

Desktop: three cards side by side on the paper, about 324 px wide (the landscape metro photo 412 px),
rest turns -5, +2, -2 deg, 10 % overlap, one soft floor shadow under the row. Phone: a loose pile of two
small cards (196 and 186 px) and the landscape card under them (300 px); fill stays under 75 %.

#### 3.6.3 Back (comp `postcards-back-*.png`)

Layout of a portrait back, as fractions of the card: header row at 6 % (edk mark left; "PHOTOGRAPH ·
01 / 03" right); the stamp top right at 13 % (22 % of the width); the postmark overlapping the stamp's
lower left corner, its cancellation running left; the note at 45 %, left, up to 57 % of the width; the
signature under it; the divider at 67 %; under it the palette (left) and the place rules (right); the
micro line at the bottom. A landscape back keeps the same order in two columns. Phone: the note spans
the width, the palette and the rules stack.

#### 3.6.4 Physics (all on the card3d engine)

- **Hover pick-up (desktop, P5).** All cards lie on parallel planes (rotateZ only at rest, no rotateX or
  rotateY on the table), at distinct depths (translateZ 0, 1, 2 px by stacking order), so no plane can
  cut another. The pick-up path, 420 ms:
  1. 0 to 140 ms: the card slides out of its overlap, away from the card above it (overlap width plus
     8 px), and rises 8 px; its shadow begins to separate. It is still under its neighbour.
  2. At 140 ms nothing overlaps it: its stacking order changes (invisible at that moment).
  3. 140 to 420 ms: it rises to translateZ 60 px, scale 1.05, turns to about 0 deg, and settles back
     over the overlap position, now on top. Proof marks fade in. The neighbours lean away (-7 / +4.5 deg,
     20 px apart).
  All on the ui spring (300 / 30). On `pointerleave` it settles down onto the pile on the landing spring
  (LAND, zeta 0.75: one small overshoot) and stays on top: the last card touched is the top card, like
  real cards on a table.
- **Open.** Click or Enter grows the card into the large view (view transition, shared name per card);
  height min(76 svh, 690 px) desktop, full width minus 32 px on phones; the ground dims to 72 %.
- **Large view (P2, P3).** card3d in tilt mode: a drag swings it (clamped 18 deg, rubber band), the
  release springs back on the ui spring (the release is animated, P3), a click turns it on the TURN
  spring (no wobble past the face), Escape, Back or a click outside returns it to its place on the
  table by the reverse transition, landing on top. Touch: tap turns; no drag.
- **Burn-in.** The photo in the large view develops from its line twin to colour in 600 ms (an opacity
  cross-fade, brief §Photos).

### 3.7 Now and the Record strip (R1, R2; comp `record-strip-*.png`)

Built to `record-language.md` §4 exactly; summary and the decisions it left open:
- **Now** joins the strip as its first line, in the Record's grid: "Now" in the date gutter, the text in
  reading serif in the content column, a slowly breathing open mark on the spine. One chapter ("the
  signal") instead of two thin strips.
- **Head:** "The record" (Newsreader `--fs-h2`), the Record's dek under it (`log.dek`), left-aligned to
  the content column of a 1060 px band. The count lives once, in the gutter with the year ("2026 / 8
  entries"), not again beside the title.
- **Year strip** of the newest year, every tick; **three newest rows** on the spine by `LogRow compact`;
  the **dashed tail** (4 on, 5 off) for 72 px, then an open ring mark and "The whole record" with the
  `arrow-right-16-medium` icon. No pills, no uppercase, no kind words.
- **Recorder** at the head's right, 280 px desktop, 136 px phone (152 px covered the year strip in the
  phone comp), on one Record-blue pool (not a section aura).
- **Motion:** spine draws, marks land as the line reaches them, rows follow, ticks fill month by month,
  the recorder turns with the scroll on its exact lean frames (desktop; row 1 only, about 265 KB, loaded
  one screen ahead); phones keep float and spin. Hover: mark 1.3x, title to `--ink-hi`, its tick lit.
  All reversible.
- **Hand-over:** shared view-transition names with the Record page (`stage`, `ystrip-<year>`,
  `rec-row-<slug>`), the Record tab's near state, Back returns to the strip.
- **Before porting the recorder:** fix the three live defects in record-language §3 (year page wrapper,
  the dark square on leaving, the bright frame on arrival), checked at 60 fps.
- **The Record page** is built to record-language §5, not to round one §6 (section 10, Q2).

### 3.8 Footer

The edk glass object (poster, then idle loop), the colophon line, the licence line, in the card
chapter's gold light. The links moved to the card.

### 3.9 One place per fact (amendments to round one §3.5)

| Fact | Its one place now |
|---|---|
| GitHub, LinkedIn | the ID card front (was Contact) |
| The Bostancı note | the Bostancı frame caption (was a postcard) |
| Entry count | the Record strip's gutter, with the year |
| This month | the Now line, inside the Record strip |

---

## 4. Rhythm of the page

| # | Part | Desktop length | Phone length | Fill target |
|---|---|---|---|---|
| 1 | Brief | 1 screen | 1 screen | as built (35 % / 61 % [M]) |
| 2 | Bostancı frame | 1.2 screens (art frame, moving) | 1.0 | 35 % / 60 % |
| 3 | Work: Recto, English Prep | 1.05 each | 1.0, 1.15 | 30 to 50 % |
| 4 | Work: Eat Map + tear | 0.6 + 0.5 pin | 0.6 + 0.4 | 30 % (map + object) |
| 5 | Chapter I: How I work + Path | 1.6 | 2.2 | 40 to 55 % |
| 6 | Chapter II: Photos | 1.0 | 1.0 | 45 to 55 % / under 75 % |
| 7 | Chapter III: Now + Record strip | 1.0 | 1.4 | 45 % |
| 8 | Chapter IV: the card + footer | 1.1 | 1.2 | art frame (card, guilloche) |

`--chapter-gap` sits between chapters I to IV and `--in-chapter` inside them. About 10.2 screens on
desktop (was 10.6 with 41 % of Work dead) and 11.5 on phones (was 12.4), with no dead span.

---

## 5. Drawings and textures (E1, W4)

### 5.1 The project motifs (2.5D with the aura)

| Project | Motif | Why it fits | Layers |
|---|---|---|---|
| Recto | **The portico of pages**: a classical temple front; the pediment is an open book, the frieze is set in lines of text, every column shaft carries the hairlines of stacked sheets; a golden circle and two sight lines as construction | "Recto" is the right-hand page; a library of documents kept in its own temple, where nothing leaves (its promise: nothing is uploaded) | far 0.6x: portico and construction; mid 0.8x: the wordmark; near 1.25x: three loose sheets drifting in front of the frame's edge |
| English Prep | **The night street**: a narrow Istanbul street in one-point perspective, facades with windows, projecting signs, cables, a tram line; two signs lit in sakura read "vs" and "a/an" | its learners picked English up from screens and streets ("competence without the labels"); every lesson is an "X vs Y" contrast | far 0.6x: street; mid: wordmark; near 1.25x: a sakura branch (the product's colour and brand) |
| Eat Map | **The engraved city plan**: a coast with engraved sea lines, a hill in contour lines, street fragments, a dotted route linking meals, a dashed ring around them, a compass | a map of meals that only the people inside the ring can see ("Only the people here see your log") | far: plan and contours; mid: the ring and the route; near: the pin object itself |

How they layer: pools (field, fixed) under the far drawing, which sits under the frame; small near
pieces cross in front of the frame's edge (z-interleaved, parity AW6). Far layers carry pointer
parallax of 4 px, mid 10 px, near 18 px. The drawings are hand-finished SVG, one file per layer, at most
12 KB gzip each, lazy-loaded one screen ahead; phones load the far layer only. The comp motifs
(`motifs.js`) are generated stand-ins for the concept, not the final art.

### 5.2 Chapter textures

| Screen | Texture | Moves |
|---|---|---|
| Brief and Bostancı | the construction circle, axis, horizon, crop marks (8 to 10 %) | draws at arrival; circle scales with the photo |
| Work margins | tech tags from `stack` (SH14) | 0.6x |
| Eat Map and tear | the engraved plan; the route lights with the tear | scroll |
| How I work | rain hairlines in the margins; perspective is not used (it would compete with the lanes) | 0.7x |
| Photos | the paper itself (grain), one floor shadow; no drawing (the photos are the picture) | - |
| Record strip | none: the Record's language has no decoration (record-language §2.6) | - |
| The card | a large guilloche rosette, 7 % | turns 20 deg over the chapter |

### 5.3 Rules against clutter

One motif per screen; at most three drawn layers per screen; drawn ink covers at most 12 % of the empty
area; no stroke inside a text block's hush; near pieces never cross text (the first phone comp broke
this and the piece was removed); line art is never brighter than the frame it decorates.

### 5.4 The parity "fullness" list, placed

| # (parity §11) | Feature | Here |
|---|---|---|
| 1 | Robin flight | 3.3 |
| 2 | Line-art parallax set | 5.1 |
| 3 | Reversible arrivals | 7 (rules 5, 6) |
| 4 | Line masks, words at 0.8x | 3.3.1, 7 rule 9 |
| 5 | Smoothed follow | 7 rule 1 |
| 6 | Rail and scrubbed steps in the layer | 3.4 |
| 7 | Moving tear over a pinned scene | 3.3.4 |
| 8 | Pointer parallax | 2.3, 5.1 |
| 9 | Aura hue by position | 2.4 |
| 10 | Bostancı large with push-in | 3.2 |
| 11 | Wipe and blur-in reveals | replaced by slide-over (layer) and opacity twins (no animated filter or clip on large boxes, audit rule 13) |
| 12 | Index flight into the rail | priority 2: the brief's three rows fly to their beads between 0.25 and 0.7 screen |
| 13 | Portal with a line twin | 3.2 (priority 2) |
| 14 | Self-drawing edge lines | 3.5.3 (lines draw), 3.5.4 (Path) |
| 15 | Letter roll and postcard pick-up | 3.3.1, 3.6.4 |

---

## 6. The art-project standard (G3, G4, M5)

### 6.1 What every frame must satisfy

1. **No sliced text at rest.** At rest and below 200 px/s no word is cut by a mask edge. Lines enter by
   mask; they leave by `--exit-rise`. Masks pad 0.26 em below.
2. **Every element has a layer and a speed** (0.6, 0.8, 1, 1.18, 1.25). Nothing moves at an unnamed speed.
3. **No pop.** Between two frames at 60 fps and 800 px/s, no opacity changes by more than 8 % and no
   element jumps more than 24 px beyond its function. No z-order flip of overlapping elements (the
   deck's flip was a defect [M]).
4. **One focus per screen.** One element at full colour and full contrast; everything else steps down.
5. **Fill** inside 2.2's targets.
6. **Text on light:** no text on more than `--aura-quiet`; the hush under every text block over a pool.
7. **Images whole or deliberately cropped** (with a focal point); never "a little at the bottom" (P1).
8. **No visible edge of a light layer:** pools feathered to at least 1.2 viewports; no banding (the
   grain covers it).
9. **Whole pixels for bitmaps at rest** (objects, photos); no sub-pixel blur of a still image.
10. **Colour:** the section's one light plus the product colour; nothing else saturated.
11. **Reversible:** scrolling back plays every scene backwards.
12. **No layout shift** after first paint (fonts metric-matched, media boxes sized).
13. **No dead span** over 120 px of scroll (frame test).
14. **Not cheap:** no default pill rows (at most one filled button per screen), no stock shadow, no
    centred label with three lines under it on empty ground, no white-bordered prints, no boxes around
    text that the Record or the old About did not need.

### 6.2 How the critic checks it

Frame sheets at 60 fps (every third frame kept) of: the arrival; the brief into Bostancı; each Work
project in and out; the tear; each person chapter; an open, a step transition and a close; the strip into
the Record. Both widths, both scroll directions, a wheel test (100 px notches) and a trackpad-like
stream. A sheet with one defect returns the scene to its builder. Plus the audit's probes
(`probe/scroll.mjs`, `oil.mjs`, `dead.py`) against the budgets in section 7.

### 6.3 Cheapness test (per strip)

Before a strip is shown: does it own a drawing or an object? Is its type in the four sizes? Does it
answer scroll in both directions? Would it look at home on Shopify Editions or the Record page? If any
answer is no, it is not finished.

---

## 7. The motion contract (adopted)

The 20 rules of `motion-audit.md` §5 are adopted as written, with four amendments:

- **Rule 1 (source).** Desktop smooths the wheel with Lenis 1.3.27 (`lerp: 0.1`, `smoothWheel: true`,
  `syncTouch: false`, `autoRaf: false`, `anchors: true`), exact version pinned and vendored or loaded
  from an allowed CDN; the 30-line own lerp (`spike/oil.html`) is the fallback. This reverses round one
  §7.1 and §8.1 ("no smooth-scroll library") and `two-page-tech.md` §1.3 item 5. Their reasons (Back
  restoration, keyboard, momentum) still hold because Lenis moves the real scroll position. Record it in
  a new motion ADR (technique; the owner is told, not asked).
- **Rule 6 (reversible)** gains: lines leave by `--exit-rise` without a clip (6.1 rule 1).
- **Rule 7 (no dead scroll)** applies inside the opened layer too.
- **Ambient loops** (new): at most one per viewport, transform and opacity only, paused off screen, when
  the layer is open and in still twins. The list: the aura drift, the How I work drops, the Now mark's
  breath, the footer object's idle loop.

Budgets (rig of the audit: headless Chromium, software raster, 4x CPU, 800 px/s): p90 frame at most
50 ms at 1440 and 20 ms at 390; frames over 50 ms at most 20 and 8 per full scroll; wheel test 0 % still
frames, largest step at most 30 px; layer area at most 8 viewports. Confirm on the owner's phone before
any claim.

Still twins: reduced motion, `?still` and no JS load no smoothing and no ticker; the page is complete and
still (Work as a list of heroes with their texts; lanes drawn with a resting drop; postcards at rest;
the strip drawn; the card hanging still, the turn a cross-fade).

---

## 8. Files for the builders (round two lanes)

- Lane A (shell and motion): `src/one/tokens.css` (2), `field.css` and `field.ts` (2.4), a new
  `src/one/scripts/ticker.ts` (one rAF, Lenis, smoothed velocity), `lines.ts` (line masks), `scrub.ts`
  (folds into the ticker), retire `arrive.ts`; `Plate.astro` becomes the construction drawing only; new
  `Bostanci.astro` (3.2); `tear.ts` (moving tear).
- Lane B (Work): `src/one/work/Flight.astro` and `scripts/work/flight.ts` (3.3), delete `deck.ts` and the
  deck markup; `stepper.ts` rewritten scrubbed (3.4); layer rail; the motif SVGs in
  `media/art/<slug>/{far,near}.svg` with a `art` field in each project's content (data, ADR-0002).
- Lane C (person): port `IdCard.astro` and `card3d.ts` (3.5.1), `Tracks.astro` from `about.astro`
  (3.5.3), `Path.astro` (3.5.4), `Postcards.astro` and `postcards.ts` on card3d (3.6), `tools/photos`
  additions (palette, luminance row, regraded gate photo, Bostancı sizes).
- Lane D (Record): the strip (3.7) after the three live Record fixes; `media.css` shared stylesheet for
  the recorder stage.
- Tests: extend `tests/e2e/lab-one*.spec.ts`: no dead span, reversibility (scroll down, up, compare
  frames), the open from a mid-flight frame, the rail in the layer, postcard stacking order after hover,
  the card's links present once on the page.

---

## 9. Budgets added to round one §7.2

| Item | Budget |
|---|---|
| Lenis (desktop only, after first paint) | 5.3 KB gzip [M] |
| Line-art layers | at most 12 KB gzip each, lazy, one screen ahead |
| Recorder lean row for the strip | about 265 KB, one screen ahead, desktop only [M] |
| Bostancı photo | AVIF 1160 h at most 160 KB, 1740 h at most 300 KB (desktop at DPR 2) |
| Greyscale twins of hero frames | AVIF, at most 30 KB each |

---

## 10. Questions for the owner (taste), with lab switches

Each comes with a short Turkish brief when the lead asks it (CLAUDE.md).

1. **Q1, the card's place (C3).** Default: at the end, as the one place of the links (Contact removed).
   Switch `?card=end|lanes`.
   *TR:* "Kimlik kartını sayfanın en sonuna, iletişim yerine koymayı öneriyorum: GitHub ve LinkedIn
   linkleri zaten kartın önünde, ayrıca bir İletişim bölümü gerekmiyor. Alternatif olarak kartı 'How I
   work' bölümündeki iki şeridin ortasına asabiliriz. Lab sayfasında iki hali de açılabilecek."
2. **Q2, the Record page.** Round one §6 (centred rows, label dates) repeats the look rejected in R1.
   Proposal: build the Record page to `record-language.md` §5 (its current design on the new tokens).
   *TR:* "Record sayfasını, sevdiğin mevcut tasarımıyla (tarih omurgası, işaretler, yıl şeridi, kayıt
   cihazı) yeni token setine taşımayı öneriyorum; ilk plandaki ortalanmış liste o tasarımı kaybediyordu."
3. **Q3, the first screen's peek.** The Bostancı frame's top edge replaces the Work peek at the bottom of
   the first screen (the text and layout do not change).
4. **Q4, the three motifs.** Portico of pages, night street with "vs" signs, engraved city plan. Shown in
   the lab before the art is finished by hand.
5. **Q5, "livelier photo".** Proposal: a warmer, brighter grade under a laminate that shimmers with the
   tilt. If a moving portrait was meant, it needs a short clip from the owner.
6. **Q6, the postcard back's signature.** "Eren" in gold italic under the note: keep or remove.

Not asked (technique, recorded in ADRs): Lenis on desktop; the aura by opacity; the flight functions;
the postcard stacking path; the port of the dev card.
