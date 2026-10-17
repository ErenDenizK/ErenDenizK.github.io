# Round 6 critique (frame-by-frame critic, 2026-10-17)

Branch `wip/r6-work`, after the promotion (3a2de2b to 790073d). Headless
Chromium only, 1440 x 900 (DPR 1) and 390 x 844 (DPR 3, touch). Frames come from the CDP screencast, which
delivers every painted frame: median 17 ms at 390 and 30 to 90 ms at 1440. Sheets are sampled at 50 to
160 ms. Raw frames: `scratchpad/round6/f/`; sheets and stills: `scratchpad/round6/s/`; the 14 chosen
pictures: `scratchpad/round6/show/`. The capture tools are in `scratchpad/round6/tools/`.

A measurement note that changes how to read every 1440 sequence: headless desktop Chromium paints Home at
about 17 frames per second during the arrival and the bloom (rAF: 75 frames in 4.5 s; at 390 DPR 3 it is
235). Disabling the first-screen plate's eight radial-mask animations brings it to 178 frames. So 1440
timings here are pessimistic; real GPU hardware has to confirm them. Phone timings are trustworthy.

## Critic commits

1. `f230594` fix: decode ahead. (a) The postcards: after a rail jump the three prints showed their tone
   plates for up to 0.7 s, although the files were loaded; they were not decoded. `decode()` before the
   fade-in fixed it (`12-postcards-jump-before-after-390.webp`: top row before, bottom row after).
   (b) Work's hero screens: at a steady scroll on the phone the English Prep print was an empty black
   screen for about 0.7 s while on screen. The flight's warm-up now decodes the hero screens too; the
   re-filmed scroll shows the picture in every frame. (c) The photo view's backdrop: the page's rule
   gives the view-transition root no animation, so the dim blur appeared and vanished in one frame while
   the card was still large; the bar, a named group, stood sharp above the blur. Under `pc-vt` the root
   now cross-fades over 360 ms and the bar is part of the page (`10-photo-close-after-fix-390.webp`).
2. `039255c` fix: the project close. (a) The close now starts on the press; it used to wait for
   `history.back()`'s popstate (a `closing` flag keeps the late popstate from closing twice, as the
   postcards do since S35). (b) From deep in a layer (hero screen off screen) the shared screen flew in
   from above while Home stood empty for 250 to 400 ms. Now the layer fades over Home in 320 ms with the
   print already standing (`11-layer-close-deep-after-fix-390.webp`). The close from the top keeps its morph.
3. `bceea73` fix: the rail names had no `-webkit-tap-highlight-color`; a tap painted the browser's blue
   box over the designed press (S14). The year page printed "8 entries" twice, 70 px apart; the group's
   count is hidden there like its heading.
4. `test(lab-one)`: the phone scrub test sampled the name's 180 ms fade once at 260 ms; under the full
   suite it read opacity 1 and failed once (passed 3 of 3 alone). It now polls up to 1.5 s.
5. `docs`: the S statuses below, R2 built, V4 superseded by S4, and this critique as `docs/research/2026-10-round6-critique.md`.

## Rows S1-S48

| Row | Verdict | Evidence |
|---|---|---|
| S1 beads born from the rail | built | `06-rail-bloom-390-frames`: the beads travel out on the curve (517-891 ms) and become the markers; none stays on the rail. Desktop the same (`05`). |
| S2 glass blue over Bostancı | built | `01`: the bar is blue over the photograph. Lab-one test passes. |
| S4 objects options | built, owner tests | `objects-{glass,line,none}-{d,p}.png`: glass, line twin and none all render. |
| S6 / S17 shoulder cut | built | `09`: tilted both ways at DPR 2; no blurred piece rides the right shoulder. |
| S10 recorder on phones | waiting for the owner | Headless phone shows the recorder and its alpha shadow correctly (`13`); only an iPhone proves it. |
| S13 equal rhythm | built | `05`: one 40 px pitch, desktop and phone. |
| S14 press, carry, travel | built | `pick-p.jpg`: the name is pressed (after fix: no blue box), carried home, the page travels through each section to Photos. |
| S15 liquid glass | built | `07`: on a press the capsule swells, glows, releases with a small overshoot (~600 ms). Desktop hover bulge is real but small. |
| S18 lanyard pivot | built | `08`: 33 ms frames through the turn; the ribbon narrows as a whole from the top, no kink. Drag swing the same. |
| S20 scenes apart | built | `eng-hand-500/-250`: English Prep's scene is gone before Eat Map's stands. |
| S21 Eat Map scene | built, taste waits | `14` top: arcades left, string lights right, the map's route below. |
| S22 walker | built | Removed. |
| S23 metro and cat | partly | `art.jpg`: the metro cutaway reads well; the figures are blocky. The cat is an outline icon over a good hatched sea; it can still read "cheap". |
| S24 engraving line | partly | Standing row. |
| S25 drop | built | `drop-p-z.jpg`, `drop-d-z.jpg`: the drop and its short tail follow the curve; no snap seen. |
| S27 Record drawing | built | The transport engraving sits behind the strip and the Record head; faint by design. |
| S28 How I work drawing | built | The loom replaced the plan; faint. |
| S29 per-project How I made | partly | `how-p.jpg`: Recto the column, English Prep the loop; Eat Map has no section (no public stack). |
| S30 longer stories | partly | Built, hidden until written (S42). Nothing to see yet. |
| S31 horizontal flow | built, owner judges | `flow-d.jpg`, `flow-p.jpg`: `?work=flow` flies the sheets sideways; continuous. |
| S32 first screen | partly | `01`, `02`: the composition is strong (the photograph on the axis, the plate continuing it, the brief in its hairline frame). Phone arrival is lovely (`03`: the colour opens from the signal 2.2-2.9 s). At 1440 the colour arrives in one frame (`04`, 3598 to 3627 ms) because the plate's masks starve the headless raster; the computed `--open` animates smoothly. Needs a desktop GPU check; if it repeats there, the eight mask animations are the cost. Small weaknesses: at 1440 "BUILDING" sits across the photograph's left edge; on the phone the photograph ends in a hard horizontal edge above the words. |
| S33 brief links travel | built | `chip-p.jpg`: a dot flies to the rail, the page travels Recto, English Prep, Eat Map in about 1.2 s. |
| S34 Istanbul, Davutpaşa | partly | `/lab/engravings/` only; the Davutpaşa courtyard reads as a flat tray. |
| S35 photo close | built | Ten opens and closes at 390: every close has 8-19 in-between frames (200-380 ms). Backdrop fade fixed today. |
| S36 Recto fuller | built | `14` bottom: the precinct's columns and walls round the temple. |
| S38 promotion | built | `/` is Home; `/work/` to `/#work` (lands at 0 px), `/about/` to `/#how` (-3 px), `/lab/one/` to `/`; project pages canonical. |
| S45 clean-up | partly | Code removed; docs clean-up not reviewed. |
| S46 Davutpaşa | partly | Provisional. |
| S47 pull-to-close | not reviewed | No pull gesture filmed this round. |
| S48 engravings in motion | partly | Separation checked at the handover; layer speeds not graded. |

Rows S3, S5, S7-S9, S11, S12, S16, S19, S26, S39-S44, S49, S50 are notes, decisions or owner questions; S37
(coverage pass three) is not done.

## Coverage rows

R2 is built (the Record page follows `record-language.md`, the recorder kept). V4 is superseded by S4.
G2-G8, M1, M2, M5, E1, T19, T21, T26 and V17 stay partly: the frames show no regression, and none of
them is finished in the owner's sense.

## Still weak (not changed)

1. Response latency on 1440 headless: a project open shows its first movement about 300 ms after the
   click, the photo view's capture takes 370-570 ms before anything moves (phone: 120-210 ms). The root
   capture is the cost; real hardware must say whether it matters.
2. The photo view on phones: a tap on the dark side closes, but at 390 the card fills the width, so a tap
   at the side turns the card. Only the space above and below closes it.
3. The bloom's first 300 ms on the phone shows only the lit bead before the blur and beads move.
4. The rope ribbon's back side is pale and plain against the printed front (by design, but it reads as a
   different strap mid-turn).
5. Eat Map's pin in the layer is filmed edge-on at times (its turntable), a thin red bar.
6. Home is 199.6 KB against the 200 KB first-paint limit (+0.1 KB from these fixes).

## Checks

- `npm run check`: 0 errors, 0 warnings, 6 hints. `build:test`: builds. `palette:gate`: 114 of 115 pass
  (1 advisory). `budget`: passes, Home 199.6 KB. Worlds: 3 pass.
- Full `npm run verify` (E2E_PORT=6521), first run: 140 passed, 1 failed (the phone scrub timing test),
  0 skipped. The test now polls; `lab-one-rail.spec.ts` alone: 16 of 16. Second full run after all commits: 141 passed, 0 failed, 0 skipped (exit 0).
