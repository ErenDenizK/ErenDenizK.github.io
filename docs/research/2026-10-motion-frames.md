# Frames study: the reference clips, frame by frame, and a motion spec for the new Home

**Status:** research, 2026-10-15 (late night). Evidence for the two-page redesign (brief log,
2026-10-15 late night). Not a decision. It corrects `phase3/motion-grammar.md` where the clips
show otherwise (section 9). Nothing here is binding until the owner and the lead accept it.

**Marks.** [M] measured on the extracted frames (positions, times, pixel change). [D] a number
from the archive's `dossier.json` or `measurements.json`. [S] seen in a frame, not measured.
[I] inference.

---

## 0. Method and the time base

- Sources: the liked-dossier clips (`clip-arrival`, `clip-scroll`, `clip-hover-N`) and journey
  frames (`desktop-jNN`, `phone-jNN`) of eight sites; the library captures
  (`desktop-arrival-3s.webp`); the transition clips of 2026-10-14-03; the repo figures.
- Tools (in `phase3/tools/`, all run with `python3 -I`): `sheets.py` extracts every frame with its
  real time stamp and a pixel-change figure, and builds labelled contact sheets; `libsheets.py`
  does the same for the library captures; `strip.py`, `enh.py`, `mix.py` build zoomed strips;
  `shift.py`, `vflow.py` measure region displacement between frames.
- Output: `phase3/frames/<site>/` holds `clip-*-sheet.png`, `lib-*-sheet.png`,
  `journey-desktop.png`, `journey-phone.png`, every frame as `clip-*/fNN_tNNNNms.png`,
  `profile.json` (per-frame time and change %) and the zoomed strips `z-*.png`.
- **Time base, a correction.** The dossier recorder resampled the screencast at **12 fps** and
  saved each frame at 100 ms (`dossier.py` `resample(..., fps=12)`, `capture.py` `save_anim(...,
  duration=100)`). So **real time = playback time / 1.2**: one frame is 83 ms, not 100 ms. Frames
  that did not change were merged, so some frames last 167–583 ms. All times below are real.
  The library captures and the 2026-10-14-03 open/back clips were resampled at 10 fps, so their
  100 ms frames are real (the earlier pass is right for those).
- **Scroll base.** The scroll clip is 36 wheel steps of 100 px, one every 110 ms plus overhead,
  then a 0.9 s pause, at a 1440 × 900 viewport. The tear edge on Shopify (a page layer at 1×)
  moved 0.86 px/ms [M]; this agrees with the input rate. So in a scroll clip **1 s ≈ 850 px ≈
  0.95 vh** (±15 %; Lenis smoothing and screencast jitter). Scroll positions below use this.
- **Hover clips** move the pointer from (5, 5) to the element centre in 6 steps and wait 1.1 s.
- **Change %** = share of pixels that changed by more than 6 grey levels between two resampled
  frames. These are not comparable with the dossier's `maxChangePct`, which compares raw
  screencast frames.
- Limits: no phone clips exist (phone = still journey frames only); Chrome, not Safari; the
  clips are 360–720 px wide, so small UI motion (under about 4 px at 1440) is not visible.

---

## 1. Shopify Editions, Winter '26 (priority 1)

### 1.1 Arrival (`clip-arrival`, 34 frames, 0–2.9 s)

| t (ms) | What happens | Mark |
|---|---|---|
| 0–330 | Black. The first construction strokes start (a short horizontal rule, a corner). | [S] |
| 330–500 | The title "The [ai] Edition" fades in at the centre, white, small (about 14 px). | [M] |
| 500–2,900 | A geometric construction drawing draws itself on the black: two large arcs, two long diagonals crossing at the title, golden-section rectangles, a bracket frame. Line contrast is very low (about 8–12 % white). This is the `stroke-dashoffset` 3 s line drawing of the dossier. | [M, D] |
| 670–1,000 | The header (edition name, nav, "Start for free") fades in. | [M] |
| 1,500 | The title completes to "Ren[ai]ssance": the word grows letters around the "ai" glyph. | [M] |
| 1,500–2,500 | The bracket frame closes around the title and index. | [S] |
| 2,900 | The painting starts to resolve from coloured noise at the lower right. | [S] |

So the arrival is a **3 s line drawing on black** that resolves into the painting. Text is never
hidden: the title is readable at 0.5 s.

### 1.2 The scroll journey (`clip-scroll`, 56 frames, 0–4.9 s ≈ 0–4.7 vh)

| t (ms) | ≈ vh | What moves | Mark |
|---|---|---|---|
| 0 | 0 | Hero: full-bleed collage (two flying figures reaching toward each other, pink skateboard, pink bag) and a thin centred frame holding title, promise and the I–XII index. | [S] |
| 0–750 | 0–0.7 | **The collage is a set of parallax layers driven by scroll.** The skateboard turns over about its long axis (pink underside, then edge-on at 250 ms, then black top at 500 ms: about 180°) and rises from the lower left to below the left figure's feet (about +8 % vw, −12 % vh). The two figures drift toward each other; the bag swings. | [M, S] |
| 250–750 | 0.25–0.7 | **Index flight.** The centred frame dissolves; the title moves to the top-left corner (small); the 12 index items leave the frame one by one and fly along a curve to the bottom-left corner, as a diagonal cascade (each item a little behind the one above). Settled at 750 ms. | [M] |
| 833–917 | 0.8–0.87 | **Spark.** A white light bursts between the two hands (about 8 % vw). | [M] |
| 1,000–1,250 | 0.95–1.2 | **Portal.** The spark becomes a ring of glitter (1,000 ms: about 20 % vw), the ring expands (1,083 ms: about 40 % vw, dark starry inside) and covers the frame (1,250 ms). While the ring passes, the painting turns into its **white line-engraving version** on a starfield. | [M] |
| 1,250–1,500 | 1.2–1.4 | The next painting (a masked portrait on a starfield) resolves from the line version; "Sidekick" (194 px) rises from the bottom edge. | [M] |
| 1,333–2,417 | 1.25–2.3 | **Chapter word over a pinned painting.** The portrait does not move (its eye line stays at 15–16 % vh for 1.1 s of scroll: pinned). The word travels from 83 % to 0 % vh: about 0.8 × page speed. A foreground prop (armillary sphere, laptop) rises faster than the page (about 1.2–1.5 ×). | [M] |
| 2,000–3,000 | 1.9–2.85 | The outcome line ("The AI-powered Shopify expert...", serif with script initial) and a video tile with a play button rise at page speed over the pinned portrait. | [M] |
| 2,583–4,083 | 2.45–3.9 | **Torn-paper cut.** A cream sheet with a torn top edge and a white fibre line scrolls up at page speed (1 ×) over the pinned portrait. The portrait is covered, not faded. Each index item changes from white to dark grey at the moment the tear passes behind it. | [M] |
| 3,500–4,167 | 3.3–3.95 | Cream page: heading with a script initial ("Insights, proactively delivered"), a label, three lines of serif body, a "Read help doc" link. | [S] |
| 3,917–4,333 | 3.7–4.1 | **Card fan.** Seven product cards rise from the bottom edge as a fan: overlapping by about a quarter of their width, each turned between about −8° and +8°, the middle one in front. They settle at about 4,333 ms. | [M] |
| 4,500–4,667 | 4.25–4.4 | **Gather.** The fan collapses to the centre in about 170–250 ms; the middle card grows (about 1.4 ×) and comes to the front; the others tuck behind it and fade out. | [M] |
| 4,667–4,917 | 4.4–4.65 | **Props and chips.** One large card stays. A painted prop (skateboard with roses) and a pink wheel arrive beside it; status chips ("Paid", "Unfulfilled") and a small sales card slide out from behind it. The next heading ("Complexity, delegated") rises. | [M] |

### 1.3 Hover (`clip-hover-0` to `-5`)

- All six clips show the same response, whatever element was hovered: when the pointer enters
  the page, **the collage layers shift by pointer parallax**. Change per frame 58 %, 37 %, 6 %,
  0 %: most of the move in the first 83 ms, settled by about 330 ms (a short smoothing, time
  constant about 100 ms) [M].
- Displacement at 600 px clip width: the bag and the skateboard about 20 px, the right figure's
  head about 10 px [M, ±4 px]. At 1440 px: about 25–50 px. Nearer layers move more [I].
- A per-element hover (link colour, underline) is below the clip's resolution [I]. Hover clips
  1–5 duplicate clip 0 and can be dropped from the repo.

### 1.4 Desktop journey frames (30 stops, 675 px apart) [S]

- Every chapter repeats the beat: painting with a giant word (j02, j15, j19, j27–28) → outcome
  heading and video → torn cut to cream (j04, j20) → cards and floating chips (j05, j09–j11) →
  dense table (j14, j24) → reverse tear, through which the next painting shows as coarse dither
  (j14) → next painting.
- j12: floating mono tags ("/brand-image", "/discount-strategy") scattered at different sizes and
  greys, as a depth field.
- j25: the line-engraving version of a painting is also used as a quiet dark ground behind a
  heading ("Introducing Tinker"), not only during the portal.
- j27–j28: in the Retail chapter the giant word rises through the frame from the bottom to the
  top while the painting is pinned: the same word-over-pinned-plate move as Sidekick.

### 1.5 Phone (14 stops, 760 px apart) [S]

- Hero: the frame is kept, but the collage is cropped to one figure and the skateboard; the
  index stays inside the frame (pj00).
- The same glitter portal opens on the phone (pj01). It is not a separate phone effect.
- The chapter word is 72 px, left-aligned, at the top of the painting; heading, video and text
  follow in one column (pj02).
- No fixed I–XII index on the phone after the hero.
- Painting fragments become the tile behind UI cards (pj06, pj07); the tear is kept (pj13).

---

## 2. Robin Noguier (priority 2)

### 2.1 Arrival (dossier `clip-arrival` 12 fps, library `desktop-arrival-3s` 10 fps)

| t (ms) | What happens | Mark |
|---|---|---|
| 0–2,000 | Black ground. The name "Robin Noguier" fades from about 15 % to full; "INTERACTIVE DESIGNER" under it. | [M] |
| 500–2,800 | A thin vertical line at the left edge grows from the bottom: a progress bar. | [M] |
| 700–1,000 | Grey placeholder tiles appear in the right half: parallelograms (the right edge leans), about 45 % vw wide, 6 px gaps. | [M] |
| 1,000–2,300 | **The reel.** Images load into the tiles and the whole column runs down through about 12 images (every project image), like a slot reel. Peak speed about 70 px per 83 ms at 720 px (about 1,700 px/s at 1440). | [M] |
| 1,833–2,833 | **Deceleration.** Per-frame travel 70, 55, 47, 42, 34, 27, 23, 17, 13, 8, 3, 0 px: 51 % of the distance in the first 25 % of the time, 88 % at 58 %. This is close to an out-cubic, `cubic-bezier(.33, 1, .68, 1)`. The first project's image comes to rest at the top. | [M] |
| 2,800–2,900 | The project ground (#3d6681) wipes in from the left edge with a hard vertical edge. | [M] |
| 2,900 | The active tile bends into its drum pose. Measured settle 6.6 s. | [M, D] |

### 2.2 The drum at rest [S, M]

- The work index is a **vertical drum of skewed, slightly curved image planes**, right of centre.
  The active plane is about 41 % vw wide and 49 % vh high, turned about −8° in its plane, its top
  edge bowed.
- The previous image shows above it (cut by the top edge) and the next below it (cut by the
  bottom edge). Both are **greyscale**, foreshortened to about 55 % of their height (turned away
  about a horizontal axis), and slightly smaller (about 0.85 ×).
- The drum axis is tilted: upper images sit further right, lower ones further left (about 12°
  from vertical).
- At the left: project name (135 px serif), two lines of pitch, "OPEN CASE STUDY", and a small
  video tile. At the right edge: a column of dots, the active one in the project colour. A 3 px
  line on the left edge carries the project colour.
- At rest nothing moves except the video tile (hover clip: 1 % change).

### 2.3 Scroll (`clip-scroll`, 58 frames)

| t (ms) | What happens | Mark |
|---|---|---|
| 0–2,500 | The drum turns continuously with the wheel: about 8 images pass, one every 310 ms (about 265 px of wheel per image). Each image regains colour and flattens as it reaches the centre, and loses colour as it leaves. **The title, pitch, ground and index do not change while the drum turns.** | [M] |
| 2,167–2,667 | The drum passes the "Google" image, overshoots by one image, and comes back: a snap to the nearest project. | [M] |
| 2,667–2,833 | The old title and pitch fade out (about 170 ms). | [M] |
| 2,667–3,167 | **Ground change.** #3d6681 blue → grey-blue → near white (about 500 ms). The active image's own white plane merges with the new ground. | [M] |
| 2,833–3,083 | The new title (pink serif "Google") and pitch fade in (about 250 ms). The video tile collapses to a thin bar and reopens with the new project (about 250 ms). The active index dot and the left edge line turn pink. | [M] |
| 3,250 → | Rest. | [M] |

So Robin separates **two motions**: the drum (scroll-linked, 1:1, fast) and the project swap
(time-based, about 580 ms in all, played once the drum settles).

### 2.4 Open and back

Unchanged from `motion-grammar.md` §2.2–2.3 (those clips are real 10 fps): open 1.38 s, a pale
panel wipes from the left, the clicked image never disappears and flattens into the case-study
slot, the title is re-coloured by the wipe; back 1.63 s through a curtain from the right with a
fully covered moment of about 200 ms.

### 2.5 Phone [S]

- `phone-j00`: no drum. A flat, untilted image at full width; the next image peeks at the right
  edge (a horizontal swipe carousel); a dot row at the top; the name (58 px) and pitch below the
  image. Ground colour per project is kept.

---

## 3. Antoine Wodniack (priority 3)

### 3.1 Arrival (library 10 fps) [M]

- 0–1,100 ms: on the red field, a small barcode mark builds bar by bar (about 100 ms per bar).
- 2,200–2,900 ms: a black band rises from the bottom edge like a curtain, and the hair-line wave
  canvas appears behind it. The hero composes after 3 s.

### 3.2 Scroll (`clip-scroll`, 60 frames ≈ 0–4.7 vh)

| t (ms) | What happens | Mark |
|---|---|---|
| 0–1,300 | The wave canvas and "CREATIVE · DEVELOPER" (216 px) scroll at page speed. | [M] |
| 1,000–2,000 | The About column (thin serif in a framed centred column) enters a **perspective tunnel**: grid lines on both sides converge to a vanishing point, as walls of a corridor. | [S] |
| 1,500–4,600 | **Award tiles.** Each tile is first a black plate with a small "+" at its centre. As it enters, the plate retracts (a clip wipe from one side) and reveals the tile: one tile about every 150–250 ms of scroll, in reading order (Webby, Awwwards, Net Mag, FWA, CSSDA, GSAP...). | [M] |
| 4,600–4,900 | A black arch rises from a perspective floor grid at the bottom, a giant "K" in it. | [M] |

### 3.3 The Work wall (desktop journey, stops 5–27, about 15,000 px) [S, D]

- Stop 5–6: the arch becomes a vertical pill with W-O-R-K, centred on the red grid.
- Stop 7: the pill opens into a **wall of four rows** filling the screen: a row of W, a row of O,
  a row of R, a row of K, red letters with a dark extruded side (3D depth), on #160000 with a dot
  grid. Phone `j09`: the letters stretch vertically as the pill grows, before the split.
- Stops 8–25: **project screens drift through the wall**: two in view, at different sizes (30–45 %
  vw) and positions (one high, one low, left and right alternate), each slightly turned in 3D
  (about 5–10°). One letter of a row is in front of each screen (z-interleaving). A tiny red
  mono caption under each: name left, "NNNN/34" right. The row offsets differ from stop to stop,
  so **each row slides sideways with scroll** [I]. 34 projects over about 13 vh: about 0.4 vh per
  project.
- Stop 26: the rows bow into a concave band (a **cylinder**, letters smaller toward the centre).
- Stop 27: the wall closes back into the WORK pill (a bookend). Stop 29: "CODING MY WAY SINCE
  1987" in steep perspective.
- Phone (`phone-j08`–`j12`): the same wall, three to four letters per row, one screen at about
  85 % vw at a time.
- Hover clips: 0.1–1.7 % change; no visible hover.

---

## 4. Dia (priority 4)

### 4.1 Arrival (`clip-arrival`) [M]

- 0 ms white; 83 ms the yellow ground appears with a **moving caustic light** (soft bright
  patches drifting: the blurred WebGL canvas; it never stops).
- 83–500 ms the "DIA" serif mark fades from about 30 % to full.
- 333–1,000 ms the black "Download Dia for free" pill fades in (grey to black).
- 750 ms the browser window appears in front of the lower half of the mark and rises a few
  per cent of vh, settled by 1,250 ms.
- The dossier lists no CSS animations at load; the motion is in JavaScript and WebGL [D, I].

### 4.2 Scroll (`clip-scroll`, 51 frames)

| t (ms) | ≈ vh | What happens | Mark |
|---|---|---|---|
| 0–600 | 0–0.6 | The yellow hero scrolls away. A **white arc** (a convex horizon) stays fixed at the bottom edge, and the black pill stays fixed at the bottom centre throughout. | [M] |
| 600–1,100 | 0.6–1.0 | "Dia reads between the tabs" (centred) and the stepper rise at page speed. | [M] |
| 1,100–2,900 | 1.0–2.75 | **Stepper.** The left column (three numbered steps) is pinned; the right column of real screens (Friday Brief, Sarah's Week Recap, a chat) scrolls at page speed. When the next screen passes about the middle of the viewport, the active step changes: its title turns dark, a short rule appears at its left, its body opens; the previous body closes (an accordion, about 300 ms). | [M] |
| 2,900–4,900 | 2.75–4.6 | "Built for how you actually work" rises; a two-column card grid follows. Card images come in **blurred and sharpen** (the `pulse` keyframe: opacity 0, scale 0.5, blur 2 px to rest). | [M, D] |

### 4.3 Phone [S]

- The stepper is linearised: per step, the screen first, then "01", the heading and the body
  (`phone-j01`, `j02`). The yellow hero, the mark and the bottom pill are kept.

---

## 5. Notion Calendar (priority 5)

- **Arrival** [M]: the "14" icon at 250 ms; about eight pastel stickers (laptop, ball, cat, list,
  bicycle, mug) **pop in one by one** between about 250 and 2,000 ms, about 200 ms apart (fade
  and scale up: the `popIn` 0.75 → 1 keyframe [D]). Nothing else moves.
- **Scroll** [M]: in the first 0.4 vh the hero device image grows from about 60 % to 68 % of the
  viewport width (scale about 1.13) while it rises, then it scrolls normally. Then a heading
  ("Time management, simplified."), one wide card with a big screen, pairs of cards. Cards fade
  in as they enter the bottom edge. The stickers scroll with the page.
- **Phone** [S]: the same centred hero, stickers at the edges, the device image below the
  buttons.

---

## 6. Anthony Fu (priority 6)

- **Arrival** [M]: the name is there at 0 ms. From 330 ms the blocks below it fade and rise one by
  one, top to bottom, until about 1,500 ms (90 ms apart, the measured `--enter-step` [D]). From
  about 1,700 ms a very faint branch drawing grows in the corners (about 5 % contrast). All
  settled by 1.6 s except the branch loop.
- **Scroll** [M]: the page is short; it only scrolls.
- **Phone** [S]: the same text column; nothing is changed.

---

## 7. Anime.js and Stripe (brief)

- **Anime.js** [M]: the hero ring is the open end of a **3D object (a lens tube) that scroll
  turns**: in the first 2 s of scroll it rotates out of the ring view, its panels fly off (1.0–1.5
  s) and return, and it ends horizontal. At 2,167–2,417 ms the ground flips from near-black to
  light grey in about 250 ms, and **the same object is shown as a line drawing**, which keeps
  turning with scroll. Hover: 1–3 % change.
- **Stripe** [M]: the hero gradient ribbon moves continuously; the rest is plain scrolling of cards
  and real UI; no hover response visible.

---

## 8. What the clips show across sites

1. **Pinned plate, moving words** (Shopify chapters, Antoine's wall, Dia's stepper): one layer is
   pinned for 1–2.5 vh while text and objects pass over it. This is how "alive on every scroll"
   coexists with legible text: the text moves at page speed or is pinned; only images and
   display words take other speeds.
2. **Two clocks**: scroll-linked motion for geometry (drum, parallax, tears, the 3D object) and
   short timed sequences for state changes (Robin's 580 ms project swap, Shopify's card gather,
   Dia's accordion).
3. **The line-drawing twin** (Shopify portal and j25, Anime.js ground flip, Shopify's arrival): the
   same picture shown as rendered art and as line art; the switch marks a change of chapter.
4. **The ground changes by covering, not by fading** (Shopify tear at 1×, Robin's wipe, Antoine's
   rising band). The only crossfade is Robin's 500 ms project colour.
5. **Bookends** (Antoine's WORK pill opens and closes the wall; Shopify's index leaves the hero
   frame and lives at the edge).
6. **Fans gather to one** (Shopify): a set of images is shown fanned, then one comes forward with
   its props. This is the closest measured model for "a set of photo frames" per project.
7. Hover is nearly invisible everywhere (0.1–1.7 %), except Shopify's pointer parallax.

---

## 9. Corrections to `motion-grammar.md`

| Earlier statement | What the clips show |
|---|---|
| Frame times are about 100 ms (all clips). | Dossier clips are 83 ms per frame (12 fps resampled, saved at 10 fps). The open/back clips are 100 ms (correct). |
| Robin: "one curved plane", "nothing shows above the active image", "the images are not staggered". | The previous image shows above and the next below; neighbours are greyscale and foreshortened; the drum axis is tilted about 12°, so the column is staggered on a diagonal. |
| Robin: "the turning motion is unseen". | It turns about one image per 310 ms of wheel input; title and ground change only after the drum snaps to a project, in about 580 ms. |
| Robin: "no load animation captured". | The arrival is a reel of all project images that decelerates (out-cubic, about 1 s) and a colour wipe from the left at 2.8 s. |
| Robin's scroll clip "changes at most 19.7 %". | Per resampled frame 27–30 % while turning and 97 % at the ground change; the 19.7 % compares raw screencast frames. |
| Shopify phone: "a glowing burn ring, the phone's version of the cut". | The glitter portal opens between the hands on desktop too; it is the hero-to-chapter cut, and inside it the painting becomes a line engraving. |
| Shopify: "the painting collage and the tears are WebGL". | The tear is a page layer moving at 1× over a pinned painting [M]; the collage is layered and scroll- and pointer-driven [M]; WebGL is likely for the portal and the dither only [I]. |
| Shopify hero: a still collage. | Layers move with scroll (skateboard flip, figures drift) and with the pointer (25–50 px at 1440). |
| Shopify index: fixed at the bottom left. | It starts inside the hero frame and flies to the corner along a curve with a cascade, between 0.25 and 0.7 vh. Each item re-colours as the tear passes it. |
| Dia: "no animation at load". | No CSS animation, but a caustic light loop, a fading mark and a rising window in the first 1.25 s. |
| Dia's stepper: "the screen changing beside it". | Left text pinned with an accordion; right screens scroll at page speed; the step changes at mid-viewport. |
| Notion stickers: "whether they move is not visible". | They pop in one by one (about 200 ms apart) on arrival, then scroll with the page; the hero device grows about 13 % in the first 0.4 vh. |
| Antoine: "how a screen moves is not visible". | Screens drift through a pinned four-row letter wall, at 30–45 % vw, slightly turned, two at a time, about 0.4 vh each; a letter overlaps each screen; the wall bows into a cylinder and closes back into the WORK pill. |

---

## 10. Motion spec for our Home

Graphite theme only (dark, no white pages); aura, grain and noise are the concept; everything
centred; desktop and phone may differ. Numbers are measured values from §1–7, adapted. The lab
chooses final values inside the bands.

### 10.0 Tokens

| Token | Value | Source |
|---|---|---|
| `--t-quick` | 160 ms | Robin's title out (170) |
| `--t-ui` | 300 ms | Shopify opacity 300; Dia accordion |
| `--t-swap` | 500 ms | Robin's ground crossfade |
| `--t-reveal` | 700 ms | Anthony Fu blocks (600–1,000) |
| `--t-move` | 900 ms | Antoine translate 1 s; Robin open image path |
| `--t-draw` | 2,400 ms | Shopify line drawing 3 s |
| `--step` | 90 ms (phone 75 ms) | Anthony Fu 90; Shopify phone 75 |
| `--ease-out` | `cubic-bezier(.2,.7,.1,1)` | charter |
| `--ease-soft` | `cubic-bezier(.23,1,.32,1)` | Antoine translate/scale |
| `--ease-move` | `cubic-bezier(.65,0,.35,1)` | charter; shared-element paths |
| `--ease-reel` | `cubic-bezier(.33,1,.68,1)` | fitted to Robin's deceleration |
| `--ease-settle` | `cubic-bezier(.34,1.56,.64,1)` | Shopify cards (about 10 % overshoot) |
| `--ease-draw` | `cubic-bezier(.34,.22,.47,.84)` | Shopify line drawing |

Global rules (kept from `motion-grammar.md` §5.1, still valid): native vertical scroll (no wheel
capture; Robin's drum look without its input model); text readable from first paint; everything
settles within about 1.5 s of the last input except ambient loops; body text moves only at page
speed or is pinned; one budget per viewport (one scrubbed scene, one ambient loop, at most two
videos); every type has a still twin.

### 10.1 A · Compose (arrival of the brief)

- Desktop: the name at 0 ms; each block below fades in and rises 10 px, `--t-reveal`,
  `--ease-out`, `--step` apart, at most 7 steps (the rest with the last); done by about 1.4 s.
- Behind it, one own line drawing (construction lines or the owner's illustration in line form)
  draws with `stroke-dashoffset` over `--t-draw` on `--ease-draw`, at 8–12 % contrast (Shopify's
  level). The aura blooms from 0 to its rest strength over 1.2 s, `--ease-out`.
- Phone: same, `--step` 75 ms, rise 8 px; the line drawing is a smaller crop.
- Reduced motion: all present at once; the drawing is shown complete; the aura is static.

### 10.2 B · Arrive one by one (scroll reveal)

- Trigger: an element's top passes 85 % vh; plays once.
- Text: opacity 0 → 1, rise 12 px, `--t-reveal`, `--ease-out`. Images and frames: rise 24 px and
  scale 0.97 → 1, `--t-move`, `--ease-soft`. Siblings `--step` apart, at most 4 per group.
- Images may also come in from blur 2 px (Dia's `pulse`) while they decode.
- Phone: 500–600 ms, rise 16 px, 75 ms apart.
- Reduced motion: present at once.

### 10.3 C · Plate parallax (the 2.5D illustrations)

Measured on Shopify: back plate pinned (0 ×) for 1.1–2.5 vh, chapter word about 0.8 ×, text 1 ×,
foreground props 1.2–1.5 ×. For our own layered drawings:

| Layer | Speed vs page | Content |
|---|---|---|
| L0 ground | fixed | graphite ground, grain, aura field |
| L1 far drawing | 0 × pinned (sticky) for 1–1.5 vh, then 1 × | line drawing or painted plate |
| L2 mid | 0.6 × | illustration figures, pre-rendered 3D objects |
| L3 display word | 0.8 × | one section word only; never body text |
| L4 text | 1 × | all reading text |
| L5 props | 1.25 × (cap 1.5 ×) | small objects, chips, the ID card corner |

- A prop may also turn with scroll (Shopify's skateboard: about 180° over 0.5 vh). Cap: one
  turning prop per viewport.
- **Pointer parallax (desktop, fine pointer only):** L1 4 px, L2 10 px, L5 18 px at 1440 px
  (Shopify measured 25–50 px; we take about half for a calmer page); smoothing time constant
  100 ms, settled by about 330 ms.
- Phone: two layers only (L1 pinned 0.6 vh, L5 1.15 ×); no pointer parallax; no device tilt.
- Reduced motion: all layers at 1 ×, no pinning, no pointer parallax; the composition is the
  rest frame of the scene.

### 10.4 D · Ground change on one dark theme

Shopify alternates black and cream; we cannot. Three dark variants, from the clips:

1. **D1 Grain tear** (Shopify tear, adapted): a sheet of the next ground (graphite one step lighter,
   for example from L* 6 to L* 11, never above L* 15) with a torn edge drawn in our grain and a
   faint light fibre line, scrolling at 1 × over a pinned plate. Edge travel 1.2–1.5 vh (Shopify
   1.45 vh). Fixed UI that crosses the edge (the index) switches its ink per item as the edge
   passes. Phone: same, travel 1 vh.
2. **D2 Aura swap** (Robin's ground colour, on dark): the aura hue follows the section or project
   in view. On a project settle: crossfade `--t-swap` on `--ease-move`. Between sections:
   scroll-linked over 0.6 vh. The ground lightness never changes. Phone: same.
3. **D3 Portal**, once per page (Shopify's glitter ring): a point of light at a focal point of the
   illustration (8 % vw), becoming a grain-and-spark ring that grows from 20 % to cover the
   viewport over 0.4 vh of scroll; inside the ring the illustration is its line-drawing twin;
   the next section resolves from it over the next 0.25 vh. Proposed only for Brief → Work.
   Phone: same ring, 0.3 vh; no WebGL required (a radial mask plus a sprite ring).
- Reduced motion: D1 becomes a hard cut at the section edge; D2 shows the nearest section's
  aura, no fade; D3 is a plain section boundary with the line drawing shown as a still.

### 10.5 E · The Work stack (the drum)

Robin's geometry, centred and on native scroll:

- A pinned stage, one slot per project frame (or per project set), 0.9 vh of scroll per slot.
- Active frame at the centre: width min(56 vw, 760 px), in-plane turn from −4° (entering) through
  0° (centre) to +4° (leaving) — the "maybe a rotation" — full colour.
- Neighbours above and below at about ±62 % of the frame height: rotateX ∓38° (Robin's
  foreshortening to about 55 %), scale 0.86, saturation 0.15, brightness 0.55. Second neighbours
  rotateX ∓62°, opacity 0.25. Colour returns over the last half slot before the centre.
- Scroll-linked 1:1 (no smoothing above 100 ms). `scroll-snap-type: y proximity` on the slot
  centres, never mandatory.
- **Settle swap** (Robin's second clock), played on `scrollend` plus 120 ms when a different
  project is at the centre: old title and line out (`--t-quick`, rise −8 px); aura D2 crossfade
  `--t-swap`; new title and line in (260 ms, delay 140 ms, `--step` between lines); the index
  mark moves to the new project (`--t-ui`, `--ease-move`).
- Alternative backdrop (Antoine): the project names set as rows of large letters behind the
  stack, each row sliding sideways at ±0.3 × scroll, one letter overlapping the active frame.
  Only one of the two may run in a viewport.
- Phone: no rotateX above 20°; frames flat at 88 vw; previous and next frames peek 12 % of their
  height at the top and bottom; 0.8 vh per slot; the same settle swap.
- Reduced motion: a vertical list of flat frames, all in colour; the swap is instant.

### 10.6 F · Fan and gather (a project's set of photo frames)

- Shopify measured: 7 cards, overlapping by a quarter, turns −8° to +8°, rise from the bottom
  edge; settle on `--ease-settle`; gather to one card in about 200 ms with 1.4 × growth.
- Ours: 3–5 frames per project. Fan in on reveal: 450 ms `--ease-settle`, travel ≤ 24 px (so the
  overshoot is ≤ 2.4 px), turns −6° to +6°, 60 ms apart from the centre out. On hover or
  focus (desktop) the fan opens 4° further and lifts 4 px, 200 ms. The gather happens as the
  first step of the open (G).
- Phone: a small fan (±3°), no hover; tap opens.
- Reduced motion: frames side by side, untilted; no overshoot.

### 10.7 G · Open: the paper grows into the project (and Close)

From Robin's open (1.38 s, image never hidden, title kept) and Shopify's gather, on dark:

| t (ms) | Desktop open | Mark |
|---|---|---|
| 0 | Click or Enter on the active frame. The frame lifts: scale 1.02, 120 ms. The URL changes (same document). | [I] |
| 0–200 | The fan gathers behind the clicked frame (F); neighbour projects in the stack keep turning away to rotateX ±90° and opacity 0 (400 ms, ease-in). | Shopify 170–250 ms |
| 0–900 | The frame moves and grows (FLIP) from its stack rect, with its turn, to the presentation's hero rect (min(88 vw, 1200 px), turn 0°), `--t-move` on `--ease-move`. It is never hidden. | Robin 400–700 ms flatten |
| 0–700 | The project's aura floods outward from the frame's rect to the viewport (a radial mask), `--ease-out`. Grain stays constant. This is the dark-theme version of Robin's wipe. | Robin wipe 0–500 ms |
| 0–900 | The project title moves from under the frame to the presentation title slot (shared element), same curve. | Robin title kept |
| 200–1,000 | The other frames of the set fly from behind the hero to their slots in the presentation, 70 ms apart, `--t-move` `--ease-soft`, each from its fan turn to 0°. | Shopify props |
| 500 → | The presentation's first step and its text arrive (B), `--step` apart. Focus moves to the heading at the end. | Dia |

- **The presentation** (Dia and Notion): desktop pins the numbered steps at the left of a centred
  two-part layout and scrolls the real screens at the right; the active step changes when its
  screen passes 50 % vh: title brightens, body opens (`--t-ui`), previous body closes. Each step
  has one outcome heading over one wide screen, then pairs (Notion). Phone: per step, screen first,
  then number, heading and body (Dia phone).
- **Close** (button, Escape, browser Back): content fades out 200 ms; the hero frame flies back to
  its stack slot with its turn (800 ms `--ease-move`); the aura contracts to the frame (600 ms);
  the set fans back in (F); the scroll position of the stack is restored to the same project. No
  fully covered frame (unlike Robin's back).
- Phone: open 600–700 ms; the frame grows to full width; neighbours fade in 200 ms instead of
  turning; the aura flood is the same; the system back gesture closes.
- Reduced motion: an instant change or a 150 ms crossfade; focus to the heading; close returns
  to the same stack slot.

### 10.8 H · Index flight and the fixed index

- Shopify measured: the index starts inside the hero frame and flies to the bottom-left corner
  between 0.25 and 0.7 vh, along a curve, as a cascade; then it stays fixed; each item re-inks as
  a ground edge passes it.
- Ours: the scroll rail (owner: "scroll bar güzel") is the fixed index of the sections and
  projects. In the hero its labels sit in the brief; between 0.25 and 0.7 vh they fly to the rail,
  scroll-linked, each item offset by 0.03 vh. The active item glows in the current aura hue.
- Phone: no flight; the rail is the phone rail of ADR-0013; labels show only while touched.
- Reduced motion: the rail is in place from the start.

### 10.9 I · Hover and press

- Frames: lift 4 px, scale ≤ 1.02, saturation +10 %, 200 ms in, 300 ms out, `--ease-out`.
  Links: colour and underline 150 ms (Shopify's colour timing).
- Touch: a press state (scale 0.98, 120 ms); no hover-only content.
- Reduced motion: colour change only.

### 10.10 J · Ambient

- One loop per viewport, period 13–20 s: the aura drift, or a caustic light (Dia) on one
  illustration, or a faint branch-like line growth (Anthony Fu). Paused when the page is hidden
  or the section is off screen.
- Reduced motion: still.

### 10.11 Pacing of the whole Home (desktop, approximate)

| Part | Scroll length | Main motions |
|---|---|---|
| Brief | 1.0–1.3 vh | A, C (layered drawing, pointer parallax), H |
| Brief → Work | 0.5–0.7 vh | D3 portal (once) |
| Work stack | 0.9 vh × slots (3 projects, 1–2 slots each: about 3–5 vh) | E, F, D2; G on click |
| The rest (About, photos, ID card, now, links, Record pointer) | 3–4 vh | B, C, D1 tear between two parts |

Phone: the same order, about 1.2 × longer (Shopify phone 65.6 vs 60.1 screens [D]).

### 10.12 Risks

- Vestibular load: the drum, parallax and the portal together. Reduced motion removes turns and
  pinning entirely. Proposed caps: one scrubbed scene and one turning prop per viewport.
- iOS Safari is untested (no Safari in the clips). Every type goes to a lab page and the owner's
  phone first.
- Assets: the 2.5D drawings, line twins and project sets do not exist yet (the owner accepts
  adapting assets later).
- The clips are 12 fps; motions shorter than about 150 ms and moves under about 4 px at 1440 are
  not measurable here.
