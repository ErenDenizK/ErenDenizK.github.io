# Round 2 critique of `/lab/one/` (2026-10-16)

Integrator and frame-by-frame critic. Branch `wip/r2-work` (worktree
`(session scratchpad) wt/r2-work`),
with `wip/r2-person` merged in (`c6037c4`, one conflict in `src/one/scripts/shell.ts`: both
init lists kept, the ticker first).

All evidence is under
`(session scratchpad) round2/crit/`:

- `seq/<name>/NNNN.jpg`: 10 fps frames from headless Chromium videos (`vid/<name>.webm`),
  `marks.json` beside them. Names: `arrive-d|p`, `scroll-d|p`, `open-<slug>-d|p`,
  `card-d|p`, `pc-d|p`.
- `sh-*.jpg`: labelled contact sheets of those frames (frame number in the corner).
- `walk-d/`, `walk-p/`: stills every half view; `st/tear-d|p/`: stills across the tear after
  the fix; `ly-*.jpg`: stills inside an opened project; `cmp-card.jpg`: card before / after the
  rosette change.
- `tools/`: `rec.mjs` (record + extract), `sheet.py`, `walk.mjs`, `range.mjs`, `shot.mjs`,
  `layer.mjs`, `vtprobe.mjs` (view-transition phase timings), `show.mjs`.

Frame timings are headless and software-rendered; the video recorder itself slows the page. Real
hardware was not checked.

## Defects found and fixed (commits on `wip/r2-work`)

| Commit | Defect (evidence) | Fix |
|---|---|---|
| `c1f36af` | After the tear rose over Eat Map, about 775 px of blank paper before How I work: two seconds of empty frames in a steady scroll (`sh-x2.jpg` 0138-0158, `walk-d/009.jpg`). A visible seam where the edge paper met the person's lift (`z.jpg` of the tear, phone). | The person's part rides a short margin behind the edge; its paper fades from the edge's opaque paper into the lift. After: `sh-tear-d.jpg`, `sh-tear-p.jpg`. |
| `ac54657` | Click on "Take a look": nothing moved for about 400 ms (snapshot), up to 1 s in the recording (`sh-open-recto-d.jpg` 0082-0091). Eat Map waited on the 350 ms decode timeout (`vtprobe`: cb-out 780 ms). Recto's clip cut from the dark capture to a white page (`sh-layer-recto-d.jpg` 0114-0118). On close the layer showed the clip's last frame (pages grid) and the deck print showed the Library: a swap at the end (`sh-close-recto-d.jpg` 0380-0405). | The 120 ms press plays before the snapshot; the open is called off if Back or Escape comes in the press. Opened hero eager. Clip fades in over 900 ms; on close it fades back to the capture (250 ms) before the transition. After: `sh-o1.jpg`, `sh-o2.jpg`. |
| `d2b5624` | A jump to a project (the brief's project chips, the rail) landed on an empty black hero for up to 7 s (`sh-oe.jpg` first run, 0040-0105; Recto 0043-0060). | The three hero frames and Eat Map's object load eagerly; side frames stay lazy. |
| `dcfbafb` | `npm run budget` failed: Home 392 KB at first paint, HTML 273 KB gzip, from inline guilloché paths repeated nine times. | Each rosette is one static SVG file (`src/pages/lab/one/guil/[name].svg.ts`) shown as an image, relative path data; Home is 184 KB. Look unchanged (`cmp-card.jpg`, `pc-now.jpg`). |
| `6fdb914` | During the open, old and new meta lines and titles at half opacity together: a double image (`sh-orp2.jpg` first run, 0057-0058). Blue tap flash on the light pill buttons (phone, 0027). | Old texts leave in 220 ms, new ones come after 260 ms. Tap highlight off on `.btn` and `.chip`. |
| `58db2f8` | At 1440 x 900 the opened project's step text ran under the action capsule (`ly-recto-d-0.jpg`, first run). Layer text read through the bar on phones (`ly-ep-p-0.jpg`, first run). | The step window leaves room for two lines above the capsule; a 96 % backing under the bar over an open layer. |
| `bb2526e` | Phone: a tap to turn the ID card tinted the whole card blue for a frame (`sh-card-p.jpg` first run, 0091). | Tap highlight off on the card and the large postcard. |

## Per-row verdicts

fixed = the evidence shows it; partly = better, but a frame or a part still fails or the owner's
answer is needed; not = not addressed in this round. Only "fixed" rows are set to "built" in
`docs/feedback/2026-10-16-lab-one-review.md`.

| Id | Verdict | Evidence and note |
|---|---|---|
| G1 | (closed) | `sh-arrive-d.jpg`, `sh-arrive-p.jpg`: brief text and layout unchanged; its plate is the Bostancı photo now. |
| G2 | partly | Order kept; every part re-presented (`sheet-walk-d.jpg`). Whether it no longer "fails" is the owner's call. |
| G3 | partly | Blank paper, black heroes, overlaps and flashes fixed. Still cheap in places: the white document page in Recto's clip and steps; the near-empty view between "The whole record" and the card (`sh-scroll-d-b.jpg` 0262-0270); postcards grey and blurred for about 5 s after a jump while lazy images load (`sh-pc-a.jpg` 0044-0100). |
| G4 | partly | Every motion was recorded and looked at; the defects above were stopped and fixed. Not yet a masterpiece frame by frame: the open still has a dead 0.4 s on slow hardware before the transition, and the shake of the card barely moves in the recording. |
| G5 | not | No token, fill and rhythm audit was run in this round (the person lane wrote its tokens into the charter only). |
| G6 | partly | The open answers at once now; scroll is scrubbed everywhere. Lazy postcards after a jump and the snapshot pause remain. |
| G7 | not | No parity matrix in the repo (a draft `parity.md` exists only in the scratchpad). |
| G8 | partly | Same: the scroll / click split exists only in the scratchpad draft. |
| G9 | (open by definition) | Tracker stays open. |
| M1 | partly | The structure is redesigned (no deck, one scroll source, ADR 0017). The headless browser runs at about 60 ms a frame at 1440; real hardware not checked. |
| M2 | partly | Desktop wheel smoothed (own lerp 0.1); the frames float and skew (`sh-scroll-d-a.jpg`). Same performance caveat. |
| M3 | fixed | Long scenes move: the Eat Map hold carries the rising tear and How I work behind it (`sh-tear-d.jpg`). |
| M4 | fixed | Text rises line by line in masks as a function of position, also in reverse (`sh-scroll-d-b.jpg` up-part; spec "same frame on the way back" passes). |
| M5 | partly | Improved; see G4. |
| W1 | fixed | No pinned deck; frames fly in page flow (`sh-scroll-d-a.jpg`). |
| W2 | fixed | Hero bends, turns and greys as it leaves; side frames dim; drawings at their own speed (`sh-x1.jpg`, `walk-d/004.jpg`). |
| W3 | fixed | Open kept and grows from mid-flight; the press now answers at once (`sh-o1.jpg`). |
| W4 | fixed | Line drawings behind each project with the aura: temple (Recto), study (English Prep), night alley (Eat Map) (`walk-d/004.jpg`, `005.jpg`, `008.jpg`). Not the spec's night street and city plan. |
| W5 | fixed | One clear frame at rest per project (`walk-d/005.jpg`). |
| W6 | fixed | No page swap while scrolling Home. |
| W7 | fixed | Eat Map is one short block; after `c1f36af` no empty scroll follows it (`sh-tear-d.jpg`, `sh-tear-p.jpg`). |
| O1 | fixed | `sh-o1.jpg`, `sh-om.jpg`, `sh-orp2.jpg`. |
| O2 | fixed | The layer has its own rail (`ly-recto-d-0.jpg`, right edge). |
| O3 | fixed | Steps are scrubbed: the next screen slides up inside the window, labels' rule glides (`sh-layer-recto-d.jpg` 0262-0270). |
| C1 | fixed | The live card is ported (`sh-card-a.jpg`, `sh-card-b.jpg`: swing, settle, turn). |
| C2 | partly | Texture and hover sway are there (`sh-card-a.jpg` 0092-0104); the "livelier photo" is a regrade only (owner question Q5). The fast shake barely moved the card in the recording. |
| C3 | partly | Card at the end; `?card=lanes` shows the other place. The owner decides. |
| C4 | fixed | Two lanes that draw with the scroll, drops into the U and the node, then the quote (`walk-d/010.jpg`, `sh-tear-d.jpg`). |
| P1 | fixed | Whole, vertical 3:4, 772 px tall, develops as it pushes in (`walk-d/001.jpg`, `002.jpg`). |
| P2 | fixed | Table on the card engine; hover lifts and re-stacks (`sh-pc-a.jpg` 0104-0300). |
| P3 | fixed | Release springs back in the large view (`sh-pc-b.jpg` 0372-0420). |
| P4 | partly | New back (stamp, traced postmark, palette, ruled place lines) and a foil mount (`seq/pc-d/0435.jpg`). It still reads as a postcard more than an artwork, and only three of five hex values fit under the swatches. Signature Q6 open. |
| P5 | fixed | The hovered card slides out of the overlap before it rises (`sh-pc-a.jpg`). |
| R1 | fixed | Serif titles, date spine with kind marks, year strip, the recorder (`seq/scroll-d/0244.jpg`). The hand-over to the Record page is not wired. |
| R2 | partly | The Record language is written only in the scratchpad (`round2/record-language.md`), not in the repo; the recorder does not turn with the scroll. |
| E1 | partly | Drawings behind Work, circuit under Path, Istanbul under the postcards. Empty band before the card remains (`sh-scroll-d-b.jpg` 0262-0270). |

Counts (G, M, W, O, C, P, R, E; 36 rows, G1 already closed, G9 open by definition):
fixed 19, partly 13, not 2, plus G1 closed and G9 open.

## Remaining weak points, most important first

1. Performance is unproven: about 60 ms a frame at 1440 in headless Chromium; the screencast held
   frames. Check on real hardware before showing the owner.
2. The open still waits for the page snapshot (about 0.35-0.4 s headless) after the 120 ms press.
3. White pages inside Recto (the clip, the step screens): it is the product's sample PDF, but it is
   the brightest thing on a Graphite page.
4. Lazy postcards (and side frames) after a jump look grey and blurred for seconds.
5. Near-empty view between the Record strip's last link and the card on desktop and phone.
6. The postcard back is designed but still a postcard; hex labels truncated.
7. Not built: parity matrix (G7, G8), token and rhythm audit (G5), Record language in the repo
   (R2), the Record hand-over, the rail bead labels (spec 3.4).
8. Housekeeping from the lanes: unused stage props and `props/*.png`; ADR 0017 has no index row;
   a stray local branch `lane/review-plan` and an empty `/wt` folder.

## Checks (after the last commit, 42800e2)

`E2E_PORT=4761 npm run verify` exit 0: worlds 3 pass; palette gate 174 of 177 house pairings pass,
3 advisory misses inside product worlds (unchanged); `astro check` 0 errors; `build:test` clean;
budget: every page under 200 KB (Home 184 KB); Playwright 178 passed, 0 failed, 0 skipped. The
first full run had 177 passed and 1 failed (the placeholder scan read the photos chapter's `ph-`
classes as markers), fixed in 42800e2. Logs: `crit/verify.log`, `crit/verify2.log`.
Show set: `round2/show/*.webp` (10 images, 28-65 KB).
