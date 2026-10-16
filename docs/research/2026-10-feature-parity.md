# Feature parity: seven references against `/lab/one/` (review rows G7, G8)

**Status:** analysis, 2026-10-16. Read-only. Evidence for round 2; not a decision. Every row of the
owner's review (`docs/feedback/2026-10-16-lab-one-review.md`) is binding and wins over a proposal here.

**What was compared.** Shopify Editions (SH), Robin Noguier (RN), Antoine Wodniack (AW), Dia (DI),
Notion Calendar (NC), Anthony Fu (AF), Anime.js (AJ). For each, every feature that a visitor can see or
do. For each feature: the evidence, whether `/lab/one/` has it, and a proposal.

**Sources.**
- Reference clips `docs/research/references/clips/<site>/clip-*.webp`. Frames were extracted with
  `python3 -I` and Pillow. Contact sheets: `round2/clip-<site>.png` (16 frames each). Dossier clips run at
  12 fps saved as 10 fps, so real time = playback time / 1.2 (motion-frames §0). Times below are real.
- Stills `docs/research/references/img/*.webp` (sheets `round2/still-a.png`, `round2/still-b.png`).
- `docs/research/2026-10-motion-frames.md` (MF), `docs/research/2026-10-reference-notes.md` (RNo),
  `docs/research/2026-10-two-page-tech.md` (TT).
- The lab: worktree of `lane/review-plan` at `003f160`, `astro build` (24 pages, exit 0), served on
  port 4711. Screenshots in `round2/parity-shots/`: desktop 1440x900 every 720 px (`d-NN-yY.png`),
  phone 390x844 every 675 px (`p-NN-yY.png`), the first project's open at 150/450/900/1600 ms
  (`d-open-*`, `p-open-*`) and six scroll stops inside the opened layer (`d-layer-*`, `p-layer-*`).
  Sheets: `round2/sheet-d.png`, `round2/sheet-p.png`, `round2/sheet-open.png`, live Record
  `round2/sheet-rec.png`. No console errors on either width.

**Measured on the lab (desktop / phone).** Page 9,556 px = 10.6 screens / 10,482 px = 12.4 screens.
Section tops (desktop): Brief 0, Recto 690 (1,530 tall), English Prep 2,220 (1,530), Eat Map 3,750
(900), About 5,761, How I work 6,599, Path 7,398, Photos 7,700, Now 8,269, Record 8,449, Contact 8,905.
Between the end of Eat Map (4,650) and About (5,761) there are about 1,100 px with only the Eat Map
title (`d-07-y5040.png`): this is W7. Sticky elements: the Work chrome, three sets and three text
blocks (the pinned deck). View-transition names at rest: root, bar, mark-dot, tab-ind, rail. The
opened layer is 4,761 px tall (desktop) and has no rail (O2). `scroll()` timelines are supported in
the test browser; only the brief's plate uses one.

**Marks.** Lab column: YES (present and working), PART (present but different or weaker), NO (absent),
REJ (present but rejected by the owner on 2026-10-16; the review id is given). Proposal: ADOPT (take it),
ADAPT (take it with a stated change), SKIP (with a reason).

---

## 1. Shopify Editions (the owner: "the most elegant in every respect")

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| SH1 | Arrival: a 3 s construction line drawing on black (arcs, diagonals, golden rectangles, 8-12 % white) that resolves into the painting; title readable at 0.5 s | time | `clip-arrival` 0-2.9 s; MF §1.1; dossier `stroke-dashoffset` 3 s (RNo §13.6) | YES. Plate construction lines draw over 2.4 s, photo opens radially from the signal (`Plate.astro`; `d-00`) | KEEP (G1 closed). The plate under it changes (P1). |
| SH2 | Title grows letters around a glyph ("Ren[ai]ssance") | time | MF §1.1, 1.5 s | NO | SKIP: a wordplay specific to the issue; our name must read at once. |
| SH3 | Hero collage as parallax layers driven by scroll: a skateboard flips about 180 deg over 0.5 vh, figures drift toward each other, a bag swings | scroll-linked | `clip-scroll` frames 0-9 (0-0.75 s); MF §1.2 | PART. One layer only (plate drifts at 0.5x and fades, `Plate.astro` `plate-drift`) | ADAPT: three to five line-art layers per scene at 0 / 0.6 / 0.8 / 1 / 1.25x (MF §10.3), one turning prop per viewport. This is the "fullness" most missing (E1, W4). |
| SH4 | Pointer parallax on the hero layers: 25-50 px at 1440, settled in about 330 ms; the only visible hover in all clips | hover | `clip-hover-0..5` (identical), MF §1.3 | NO | ADOPT on fine pointers: 4 / 10 / 18 px per layer (MF §10.3). Gives "every interaction is felt" (G6) without clicks. |
| SH5 | Index flight: the I-XII index leaves the hero frame and flies, item by item on a curve, to the bottom-left corner between 0.25 and 0.7 vh; then fixed | scroll-linked | `clip-scroll` frames 3-9; MF §1.2 | NO. The rail is in place from the start | ADAPT: the brief's three rows fly into the rail's labels, scroll-linked (MF §10.8). Reversible by construction (M4). |
| SH6 | Fixed numbered index, active item full ink with a leader, others about 40 %; each item re-inks as a ground edge passes it | scroll-linked | `shopify-dj00..14`; RNo §13.6 | PART. Rail with section labels and accents (`rail.ts`, `data-rail-sec`); no per-item re-ink at a ground edge | ADAPT: rail labels change ink as the tear passes them. |
| SH7 | Spark, then a glitter portal ring that grows to cover the frame; inside it the painting becomes its white line-engraving twin | scroll-linked | `clip-scroll` frames 12-15 (1.0-1.25 s); `shopify-pj01` (phone too); MF §1.2 | NO | ADAPT once per page (Brief to Work): radial mask plus sprite ring, line twin inside (MF §10.4 D3). |
| SH8 | Line-engraving twin of a painting reused as a quiet ground behind a heading | static | `shopify-dj14`, j25; MF §1.4 | NO | ADOPT: each project's line drawing (W4) appears as the quiet ground of its opened layer. |
| SH9 | Chapter word (194 px) rises through a pinned painting at about 0.8x page speed; foreground prop rises at 1.2-1.5x | scroll-linked | `clip-scroll` frames 15-30; MF §1.2 | NO. Project names sit still in the sticky text block (`d-01`) | ADAPT for Work: the project word drifts at 0.8x over its drawing while the frame flies at 1.2x (Robin-style flight, W2). |
| SH10 | Outcome line with a script initial and a video tile rise at page speed over the pinned plate | scroll-linked | frames 24-36 | NO | ADAPT: promise line at 1x over the drawing; video tile only where a clip exists. |
| SH11 | Torn-paper cut: a sheet with a torn edge and a fibre line covers the pinned painting at 1x (covers, never fades) | scroll-linked | frames 36-45 (3.0-3.8 s); `shopify-dj04`; MF §1.2 | PART. A static torn edge between Work and the rest (`Rest.astro`: "P1: the tear is a static edge"; `d-07`); nothing pinned behind it, so it reads as a line, not a reveal | ADOPT: pin the last scene (Eat Map's drawing) while the sheet slides over it. It also fixes W7's empty run. |
| SH12 | Card fan: seven product cards rise from below, overlapping, turned -8 to +8 deg, spring settle (.34,1.56,.64,1) 400-500 ms | scroll-triggered | frame 45; MF §1.2; RNo §13.6 | REJ as a pinned deck (W1, W6). The fan exists inside the deck (`deck.ts`) | ADAPT: a short fan on arrival only, no pin and no shuffle; or drop it (Robin flow wins, W2). |
| SH13 | Gather: the fan collapses to one card that grows 1.4x and comes forward, with props and chips | scroll-triggered | MF §1.2 (4.5-4.7 s) | NO | ADAPT as the first 200 ms of the open (MF §10.7). |
| SH14 | Floating mono tags at mixed sizes and greys as a depth field | static/parallax | j12; MF §1.4 | NO | ADOPT as texture in empty zones (E1): tech names of each project as a far layer at 0.6x. |
| SH15 | Grounds alternate black and cream; about 74 % black | scroll | RNo §13.6 | PART. One ground plus aura per section, cross-faded 1,100 ms on a middle band (`field.ts`) | ADAPT: the aura hue becomes scroll-scrubbed between sections (M4), not a timed cross-fade. Never a white page (N15). |
| SH16 | Smooth scroll (Lenis) | scroll | dossier (RNo §13.6) | NO. Native scroll | ADAPT: keep native scroll (TT §1.3 item 5, ADR-0010, ADR-0014: Back restoration, keyboard, momentum). Get the "pond" feel (M2) from scroll-linked layers that follow with a 120-200 ms smoothing. Put Lenis to the owner only if this fails. |
| SH17 | Video opens as a shared element in a modal (view-transition names `video-modal-background`, `video-container`, `video-close-button`) | click | dossier (RNo §13.6) | YES in kind: projects open by view transition (`open.ts`); postcards open in a dialog (`postcards.ts`) | KEEP (W3, O1). |
| SH18 | Accordions on a spring (grid-template-rows + opacity 300 ms) | click | RNo §13.6 | NO | SKIP on Home; possible for "How it's made" in the layer. |
| SH19 | Sticky header: edition title fixed top-left, "Start for free" top-right, blur 8 px | chrome | `shopify-dj00..14` | YES. Bar with mark, tab pill and clock; quiet band after the page moves (`Bar.astro`) | KEEP (liked as is). |
| SH20 | Phone: same portal and tear, chapter word 72 px left, one column, no fixed index after the hero | phone | `shopify-pj01`, MF §1.5 | PART | ADAPT: phone keeps the tear and one portal; no pointer parallax. |
| SH21 | Reduced motion: 9 rules; forced-colors rules | a11y | RNo §13.6 | YES. `html.still` twins everywhere | KEEP. |

## 2. Robin Noguier (the owner's model for Work: "frames flying through the air")

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| RN1 | Arrival reel: every project image runs down a column of skewed tiles like a slot reel, decelerates (out-cubic, about 1 s), then the project ground wipes in from the left | time | `clip-arrival`; MF §2.1 | NO | ADAPT, lighter: when Work enters, the frames of all three projects stream past once and settle (time, 900 ms, `--ease-reel`). Not at page load (the brief comes first). |
| RN2 | The drum: skewed, curved image planes; active one in colour, neighbours above and below greyscale, foreshortened to about 55 %, tilted axis about 12 deg | scroll-linked | `clip-scroll` frames 0-33 (0-2.75 s); `robin-carousel.webp`; MF §2.2 | REJ in its pinned form (W1, W6). The deck pins a stage and shuffles prints | ADAPT (W2): no pin. Frames travel up with the page at their own speeds (0.8-1.3x), turn from -6 deg to 0 to +6 deg and bend (rotateX) as they pass the middle, regain colour at the centre, lose it as they leave. The page never stops; the frames fly. |
| RN3 | Two clocks: geometry 1:1 with the wheel; the project swap (title, pitch, ground colour, index dot) in about 580 ms after the drum settles | scroll + time | frames 33-45 (2.75-3.75 s); MF §2.3 | PART. `deck.ts` has both clocks; the swap is what the owner calls "pages change while scrolling" (W6) | ADAPT: titles move with the page (no swap); only the aura hue is scrubbed by position. |
| RN4 | Ground colour per project (#3d6681 blue, then near-white for Google), with a 3 px edge line in the project colour | scroll-triggered | frames 33-36; MF §2.3 | PART. Aura per project (`setAura`), no edge line | ADOPT the hue; dark only (N15). |
| RN5 | Dot index at the right edge, active dot elongated in the project colour | chrome | `robin-carousel.webp`; RNo §13.4 | YES via the rail (accent per section) | KEEP. |
| RN6 | Project name 135 px serif, pitch 20 px, "OPEN CASE STUDY" CTA, small video tile bottom-left | static | `robin-carousel.webp`; RNo §13.4 | PART. Name about 60 px, one-line pitch, "Take a look" pill; no video tile on Home | ADAPT: larger name within the type cap, a small looping tile only for projects with a clip. |
| RN7 | Click to open: the curved plane flattens and slides into the case-study hero slot; a pale panel wipes from the left; title kept and re-coloured; no blank frame; 1.38 s | click | `robin-noguier-open-sheet.webp`; MF §2.4; RNo §13.4 | YES. The paper grows, the shot is never hidden, the title is shared (`open.ts`; `d-open-t150..1600`). Settles by about 900 ms (`?open=1400` exists) | KEEP (W3, O1). |
| RN8 | Back: a horizontal curtain, 1.63 s, returns to the same project | click | `robin-noguier-back-sheet.webp` | YES. Close, Escape and Back reverse the transition and restore the slot (`open.ts`, `popstate`) | KEEP. |
| RN9 | Case study: hero, then long scroll of large images and text; round scroll cue under the hero | scroll | `robin-case-study-sheet.webp`; RNo §13.4 | PART. Layer with hero, facts, stepper, how it is made, next project, capsule (`d-layer-1..6`); no rail (O2); steps change in time, not scrubbed (O3, `stepper.ts` "change in time (not scrubbed)") | ADAPT: the rail inside the layer; steps cross-fade and slide scrubbed by position. |
| RN10 | Header turns into "<- BACK HOME" while a project is open | chrome | open sheet; RNo §12 | PART. A capsule with a close button at the bottom (`d-layer-*`) | KEEP the capsule; add a quiet "Back to Work" in the bar for the desktop. |
| RN11 | Phone: no drum; flat full-width image, next one peeks at the right (swipe carousel), dot row on top | phone | `phone-j00` (MF §2.5) | PART. Phone deck pins too (`p-01..p-07`) | ADAPT: on phones frames flow vertically, flat, with a small turn; the next frame peeks. |
| RN12 | Hover: nearly nothing (about 1 % change) | hover | `clip-hover-0`; MF §2.2 | YES (lift on prints) | KEEP small; the owner wants feedback (G6). |
| RN13 | Reduced motion: no rules | a11y | RNo §13.4 | YES (we have twins) | Do not copy the gap. |

## 3. Antoine Wodniack

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| AW1 | Arrival: a barcode mark builds bar by bar (about 100 ms a bar); a black band rises like a curtain; a hair-line wave canvas behind | time | MF §3.1; `antoine-dj00.webp` | NO | SKIP the curtain (no gate, E1). ADOPT the hair-line wave field idea as a far texture layer. |
| AW2 | Giant tracked display line ("CREATIVE + DEVELOPER", 216 px) scrolling at page speed, slightly faster than the content | scroll | `clip-scroll` frames 0-12 | NO | SKIP the poster name (RNo §4.6: names as posters are a "do not"). |
| AW3 | Perspective tunnel: grid lines converge to a vanishing point around the About column | scroll-linked | frames 12-21 (1.0-1.75 s); MF §3.2 | NO | ADAPT as a line-art ground for How I work (thin perspective lines, 8-12 % ink). |
| AW4 | Award tiles: each a black plate with a "+" that retracts by a clip wipe to reveal the tile, one per 150-250 ms of scroll | scroll-triggered | frames 24-45 (2.0-3.75 s); MF §3.2 | NO. Arrivals are fade-and-rise only (`arrive.ts`) | ADOPT clip-path wipes (.86,0,.07,1) for postcards, Record rows and step images; scrubbed where possible (M4). |
| AW5 | Arch from a perspective floor; pill W-O-R-K opens into a wall of four letter rows with extruded sides | scroll-linked | MF §3.3; `antoine-dj08.webp` | NO | ADAPT, optional: project names as large rows behind the flying frames, each row sliding sideways at +-0.3x (MF §10.5). Only one backdrop per viewport. |
| AW6 | Project screens drift through the wall at 30-45 % vw, slightly turned in 3D, one letter in front of each (z-interleaving), tiny mono caption "name / NNNN/34" | scroll-linked | `antoine-dj08.webp`; MF §3.3 | PART. Prints have mono captions (`Print.astro`); no z-interleaving, they are pinned | ADOPT the drift and the z-interleave (a line-art element in front of a frame). This is the second half of W2. |
| AW7 | The wall bows into a cylinder, then closes back into the pill (a bookend) | scroll-linked | MF §3.3 | NO | ADAPT: Work opens and closes on one shape (for example the line drawing that starts and ends the section). |
| AW8 | Closing line in steep perspective ("CODING MY WAY SINCE 1987") | scroll | MF §3.3 | PART. Footer has the glass edk loop (`Foot.astro`) | KEEP our bookend. |
| AW9 | Awards and proof built into the layout | static | RNo §5 | PART. Facts row in the layer | KEEP. |
| AW10 | CTA characters roll up and down on hover | hover | RNo §13.5 | NO | ADOPT for "Take a look", tab labels and contact pills (short, 300 ms). |
| AW11 | Smooth scroll (Lenis); no reduced-motion rules; saturated red | - | RNo §13.5 | - | SKIP all three (see SH16; N15). |
| AW12 | Phone: same wall, three or four letters a row, one screen at 85 % vw | phone | MF §3.3 | - | ADAPT with RN11. |

## 4. Dia

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| DI1 | Arrival: a moving caustic light on the hero (WebGL, never stops); mark fades in; browser window rises | time + ambient | `clip-arrival`; MF §4.1 | PART. The aura field drifts on 23/31/37 s loops (`field.css`) | KEEP. |
| DI2 | A convex white horizon fixed at the bottom edge; the download pill fixed bottom-centre throughout | chrome | `clip-scroll`; `dia-dj01.webp`; MF §4.2 | PART. The capsule exists only inside an opened project | SKIP on Home (no sales CTA); KEEP in the layer. |
| DI3 | Stepper: left column pinned, right screens scroll at page speed; the active step changes at mid-viewport (title dark, rule, body opens, 300 ms accordion) | scroll-linked + time | `clip-scroll` frames 16-40; `dia-dj01.webp`; MF §4.2 | PART. `stepper.ts` pins and changes the step in time every 0.9 screen; the owner: "scroll a bit, nothing, then it jumps" (O3) | ADAPT: screens move with the page, the active rule and the step text interpolate with position; no dead zone. |
| DI4 | Cards in two columns, unequal widths, product crop bleeding out of the bottom edge; images come in blurred and sharpen (`pulse`) | scroll-triggered | `dia-dj04.webp`; MF §4.2 | PART. Cards in the layer, no blur-in | ADOPT the blur-to-sharp entry for screens (and scrub it). |
| DI5 | One ink at 100/80/60/40 % on dark; Exposure / Oracle / Favorit Mono voices | static | RNo §13.1 | YES (ink ladder in `tokens.css`) | KEEP. |
| DI6 | Closing CTA "Ready for a better day?" | static | `dia-dj08.webp` | YES in kind: "Next" project at the end of the layer (`d-layer-5`) | KEEP. |
| DI7 | Phone: stepper linearised, screen first, then number, heading, body | phone | `dia-pj00.webp`; MF §4.3 | YES (`Stepper.astro` linear form) | KEEP. |
| DI8 | Hover: under 2 % | hover | `clip-hover-0..1` | - | - |

## 5. Notion Calendar

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| NC1 | Arrival: about eight pastel stickers pop in one by one (opacity, scale 0.75 to 1), about 200 ms apart | time | `clip-arrival`; `notion-dj00.webp`; MF §5 | NO | ADAPT: the small line drawings (W4) pop in around each project's frame, then ride their parallax layer. |
| NC2 | Hero device image grows from 60 % to 68 % vw (scale 1.13) in the first 0.4 vh while rising | scroll-linked | `clip-scroll`; MF §5 | NO | ADOPT for the opened layer's hero and for the Bostancı photo (P1): a scroll-linked push-in. |
| NC3 | Two-level layout: outcome heading, one wide card with a real screen bleeding off the edge, then 2-up cards | static | `notion-dj02/03.webp`; RNo §13.2 | YES in the layer | KEEP. |
| NC4 | Cards fade in at the bottom edge; 14 scroll-timeline uses (scroll-driven) | scroll-linked | RNo §13.2 | PART. One-shot `IntersectionObserver` reveals, never reverse (`arrive.ts`: "plays once") | ADAPT: switch arrivals to `animation-timeline: view()` with `animation-range: entry`, so they reverse on scroll up (M4). JS fallback via `scrub.ts`. |
| NC5 | Stickers scroll with the page at the edges | parallax | MF §5 | NO | ADOPT as edge texture (E1). |
| NC6 | FAQ accordion; integrations grid | click | RNo §8.5 | NO | SKIP (not our content). |
| NC7 | Phone: same hero, stickers at the edges | phone | MF §5 | - | ADAPT with NC5. |

## 6. Anthony Fu

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| AF1 | Name present at 0 ms; blocks fade and rise 10 px, 90 ms apart, 1 s each | time | `clip-arrival`; RNo §13.3 | YES (`Brief.astro`, `--d` 180-450 ms) | KEEP (G1). |
| AF2 | Faint self-drawing branches at the corners (about 5 % contrast, 10 s loop) | ambient | `antfu-dj00.webp` (top-left branches visible); MF §6 | NO | ADOPT: a slow line growth in empty corners of the rest (E1); one ambient loop per viewport. |
| AF3 | Structural rows with logo chips ("Working at / Creator of") | static | `antfu-dj00.webp` | YES (Studying / Building / Writing rows with coloured chips) | KEEP. |
| AF4 | Phone: same column, nothing changes | phone | `antfu-pj00.webp` | YES | KEEP. |
| AF5 | Scroll: none (1.4 screens) | - | `clip-scroll` (5 frames) | - | - |

## 7. Anime.js (no clips; stills and MF §7)

| # | Feature | Kind | Evidence | Lab | Proposal |
|---|---|---|---|---|---|
| AJ1 | One fixed ring stage; each feature lights it in its own accent (glow) | scroll-linked | `anime-dj00/10/14.webp` | PART. Aura per project | KEEP the per-project light. |
| AJ2 | The ring is the open end of a 3D lens tube that scroll turns; panels fly off and return; ends horizontal | scroll-linked | MF §7; `anime-dj03.webp` | NO. Glass objects are still posters or loops (`Obj.astro`, ADR-0006) | ADAPT: a pre-rendered object turntable scrubbed by scroll (image sequence), one per viewport. |
| AJ3 | Ground flips dark to light in 250 ms and the object is shown as its line drawing | scroll-triggered | MF §7; `anime-dj03.webp` | NO | ADAPT (dark only): the object becomes its line twin as a section changes (same idea as SH7, SH8). |
| AJ4 | Code snippet beside each feature; progress as a lit ring segment | static | `anime-dj10/14.webp` | PART. "How it's made" lines in the layer | ADAPT: a short code card in Recto's "how" step. |

## 8. Cross-cutting families (what our page has against all seven)

| Family | References | Lab | Gap |
|---|---|---|---|
| Arrival | all seven | YES (brief stagger, line drawing, plate reveal) | none for G1 |
| Scroll-linked, reversible | SH, RN, AW, DI, NC, AJ | PART: plate drift, deck geometry only | arrivals are one-shot; aura is timed; no parallax set; no scrubbed steps |
| Scroll-triggered, timed | RN swap, SH fan/gather, DI accordion | YES (deck swap, stepper, arrive) | the owner rejects the dead zones they create (O3, W6) |
| Pinned | SH plate, AW wall, DI stepper | REJ deck (W1); stepper pin | replace the pinned deck with free flight; keep pins short and only under moving content |
| Parallax layers | SH, AW, NC | PART (one plate) | the biggest single gap (E1, W4) |
| Grounds and chapter transitions | SH tear and portal, RN wipe, AW curtain, AJ flip | PART (static tear, aura fade) | moving tear, one portal, line twins |
| Orientation | SH index, RN dots, DI steps, AJ ring | YES rail; NO rail in layer | O2; index flight |
| Hover | SH pointer parallax (the only visible one); AW CTA roll | PART (print lift, card tilt) | pointer parallax; text roll; postcard pick-up (P5) |
| Cursor | none evidenced (no custom cursor in any clip or still) | NO | SKIP: no evidence, and it fights touch parity |
| Click and open | RN (case study), SH (video modal) | YES (project open, postcard dialog) | keep; rail inside the layer |
| Close and back | RN curtain 1.63 s | YES (reverse VT, Back, Escape) | keep |
| Text motion (split lines, masks) | AW clip-path reveals and character roll; SH word rises at 0.8x | NO split or mask reveals | ADOPT line masks (each line rises inside its own clip) scrubbed by view timeline; never on reading text in the Record |
| Image motion | RN bend, colour return; DI blur-in; NC push-in; SH flip | PART (deck turns) | flight, colour return, blur-in, push-in |
| Video | SH 12 videos; AW 34; RN tile; NC hero loop | YES (stepper clip, hero clip, footer loop) | a small loop per Work frame where a clip exists |
| Sound | none evidenced in any capture | NO | SKIP |
| Chrome | all: fixed header; SH fixed index; DI fixed pill | YES bar, tabs, clock, capsule | keep |
| Footer | AW bookend line; DI closing CTA | YES glass edk loop, colophon, licence | keep |
| Phone differences | SH portal kept, index dropped; RN swipe carousel; DI linear stepper; AW narrow wall | PART: phone repeats the pinned deck | design the phone flow separately (repo rule; N12) |
| Reduced motion | SH 9, DI 5, NC 20, AF 3 rules; RN, AW, AJ none | YES (`html.still` twins) | keep; every new scrubbed effect needs its still twin |

---

## 9. G8: which references have a click-to-enlarge, which only scroll

| Reference | Click-to-enlarge | What the visitor does | Evidence |
|---|---|---|---|
| Shopify Editions | Only for videos (a video tile opens as a shared-element modal). The paintings, cards and chapters are scroll only. | Scroll | view-transition names `video-modal-background`, `video-container` (RNo §13.6); all chapter motion in `clip-scroll` |
| Robin Noguier | YES: "Open case study" grows the image into the case-study hero (1.38 s) and Back returns (1.63 s). The home carousel itself is scroll only. | Scroll to pick, click to open | `robin-noguier-open-sheet.webp`, `-back-sheet.webp`; MF §2.4 |
| Antoine Wodniack | Not evidenced (no click clip; hover clips show 0.1-1.7 % change). The Work wall is scroll only in every capture. | Scroll | MF §3.3 |
| Dia | NO (the only click is the download CTA) | Scroll | MF §4 |
| Notion Calendar | NO (CTA and FAQ accordions only) | Scroll | MF §5 |
| Anthony Fu | NO (links only) | Read | MF §6 |
| Anime.js | NO (scroll-turned object, code beside it) | Scroll | MF §7 |

So the owner's guess holds: Shopify's elegance is all scroll. Only Robin pairs a scroll flow with a
click open, and only for a whole case study, never for a single image. Our click model (project open,
postcard large view) therefore has no reference beyond Robin's open; it comes from our own open, which
the owner accepted (W3, O1). What we lack is the scroll half: the frames must move by themselves while
the visitor scrolls, before any click (W2, M4).

---

## 10. What `/lab/one/` has that no reference has

- Postcards with a large view, turn and swing (`postcards.ts`). The owner wants the physics redone (P2,
  P3, P5) and the postcard redesigned (P4).
- The ID card pendulum (`idcard.ts`). Rejected (C1); port the dev card (C2: `src/components/IdCard.astro`
  and `src/scripts/card3d.ts` on `dev`; the file exists there).
- Real URLs per project with a static twin page (`Presentation.astro` mode "page").
- A `?work=drift` lab switch is declared in `src/layouts/One.astro` (line 59) but nothing reads it:
  `grep drift src/one/work/` finds no match. It is a dead switch; the Robin flow should take its name.

---

## 11. The 15 features that would most raise "fullness", ranked

Ranked by how many review rows each one closes, times how visible it is on both widths.

1. **Robin flight for Work (RN2 + AW6).** No pin, no shuffle: frames fly up through the viewport at
   their own speeds, turn and bend as they pass the middle, regain colour at the centre. Closes W1, W2,
   W5, W6, M1. Phone: flat frames with a small turn, the next one peeking (RN11).
2. **A line-art parallax set per project and section (SH3 + SH14 + NC5).** Three to five drawn layers
   (temple, small cyberpunk scene, ornament) at 0 / 0.6 / 0.8 / 1 / 1.25x beside the aura. Closes W4,
   E1, G3.
3. **Reversible, scroll-scrubbed arrivals (NC4).** Move `arrive.ts` reveals to `view()` timelines so text
   slides in and back out with the scroll. Closes M4, G6 for every strip.
4. **Line-mask text motion (AW4 + SH9).** Headings and promise lines rise inside per-line clips,
   scrubbed; project words drift at 0.8x over their drawings. Closes M4 ("text shapes itself").
5. **Smoothed follow on scroll-linked layers (SH16 adapted).** Native scroll, but layers ease toward
   their target with a 120-200 ms time constant: the "pond" feel without taking the scroll. Closes M2.
6. **Rail and scrubbed steps inside the opened project (RN9 + DI3).** The rail in the layer; screens
   move with the page and the active step interpolates with position, no dead zone. Closes O2, O3.
7. **Moving tear over a pinned last scene (SH11).** Eat Map's drawing pins while the paper sheet slides
   over it at 1x; the Eat Map block becomes short. Closes W7 and gives the Work-to-person boundary a
   reveal instead of a line.
8. **Pointer parallax on fine pointers (SH4).** 4 / 10 / 18 px per layer, settled in about 330 ms.
   Closes G6 for "every interaction is felt" between clicks.
9. **Scroll-scrubbed aura hue (SH15 + RN4).** The field's pigments interpolate by section position
   instead of a 1,100 ms timed fade; per-project hue in Work. Closes M4, G6.
10. **Bostancı photo large, whole, vertical, with a push-in (NC2).** The 1932x2576 original in a tall
    frame that grows about 10 % as it rises. Closes P1.
11. **Clip-path wipe reveals for images (AW4 + DI4).** Postcards, step screens and Record rows open by a
    wipe or come in from blur, scrubbed. Closes G3, M5.
12. **Index flight into the rail (SH5).** The brief's rows fly to the rail labels between 0.25 and
    0.7 vh. A first-screen signature that reverses on scroll up. Closes M4 at the top of the page.
13. **One portal from Brief to Work with a line twin (SH7 + SH8).** Spark, ring, line drawing inside,
    Work resolves from it. Once per page; phone too. Closes G4 ("wow, this is creative").
14. **Self-drawing edge lines in empty zones (AF2 + AW3).** Slow line growth in the corners of the
    person's part, perspective lines behind How I work; one ambient loop per viewport. Closes E1, C4
    (supports the falling-drop lanes).
15. **Text roll on CTAs and tabs (AW10) plus the postcard pick-up (P5).** Characters roll on hover;
    a hovered postcard lifts and re-stacks above the others with depth. Closes G6, P5.

Not in the list because the owner already settled them: the click open (keep, W3), the ID card (port
the dev card, C2), How I work (previous lanes, C4), the Record strip (Record language, R1, R2).

---

## 12. Limits

- No phone clips exist for any reference; phone rows rest on still journey frames (MF §0).
- Chromium only; Safari behaviour of every proposal is untested (TT §6).
- The lab screenshots are stills 1.3 s after each programmatic scroll; scroll-linked smoothness was not
  measured here (that is the frame critic's work, G4).
- Anime.js has no clip in the repo; its rows rest on stills and MF §7.
