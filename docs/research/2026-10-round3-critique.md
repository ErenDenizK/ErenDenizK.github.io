# Round 3 critique of `/lab/one/` (2026-10-16)

Integrator and frame-by-frame critic. Branch `wip/r3-work` (worktree
`(session scratchpad) wt/r3-work`).
`wip/r3-person` merged as `c8d589c`, `wip/r3-record` as `848b0db` (both `--no-ff`, no conflicts;
`One.astro`, `tokens.css` and `lab-one.spec.ts` auto-merged).

Evidence is under `(session scratchpad) round3/crit/`:

- `seq/<name>/NNNN.jpg`: 10 fps frames from headless Chromium videos (`vid/<name>.webm`), with
  `marks.json`. Names: `scroll-d|p`, `open-recto-d|p`, `open-english-prep-d|p`, `open-eat-map-d|p`,
  `rail-d|p`, `card-d|p`, `entrance-p`, `photos-d|p`.
- `seq/rec-dpr3/NNNN.png`: the Record strip arriving at 390 x 844, DPR 3, isMobile, hasTouch (39
  steps of 36 px, `info.json` with the slot boxes).
- `sh-*.jpg`: labelled contact sheets. `sh-rope-d.jpg` and `sh-ent-rope.jpg`: lanyard close-ups.
  `rail-probe.png`, `cursor-side-d.png`: stills.
- `tools/`: `rec.mjs`, `recdpr3.mjs`, `sheet.py`, `probe-rail.mjs`, `probe-cur.mjs`.

Frames are headless and software-rendered; the recorder slows the page. Real hardware is not checked.
The best ten stills are in `../show/` (webp).

## Defects found and fixed (commits on `wip/r3-work`)

| Commit | Defect (evidence) | Fix |
|---|---|---|
| `826e74a` | After the merge, `lab/one` was 201.5 KB at first paint (limit 200 KB): `npm run verify` failed at `budget` (`integ/verify1.log`). The three postcard drawings were inlined in the large-view templates (about 15 KB gzip). | The drawings are published as files and fetched on the first pick-up or open, then set into each clone. 188.4 KB. The back still draws on (`seq/photos-d` 0110-0124). |
| `ab38f01` | At 1440 the opened project's close cursor (T15) almost never showed: `.pt-stage`, which holds the side prints, was excluded, so only a thin band was left (`seq/open-recto-d` 0236-0246: plain pointer over the side print). Over a light print the bare "Close" caption could not be read. | The side prints count as empty space (only the hero and its object are excluded); both close cursors carry their label on glass. `cursor-side-d.png`: cursor shown, click closes. |
| `fd03918` | On a phone the Record strip's dek faded in while the title's line mask still showed only the tops of its letters (`seq/rec-dpr3` 0011-0013, `z13.png`). | The dek starts at `--sp` 0.25 instead of 0.2. |
| `7b14c3f` | Coverage row T23 had no test. | `lab-one.spec.ts`: no sentence of five or more words twice outside the brief (passes; it reads more than 20 blocks). |
| `d887956` | ADR-0018 had no row in the index. | Row added (proposed); the review's Status column updated. |

## Verdicts, round 3 rows (binding)

| Id | Verdict | Evidence |
|---|---|---|
| T1 card next to How I work | fixed | `seq/scroll-d` 0199-0262, `seq/scroll-p` 0233-0330; no `?card` switch; test "hangs in chapter I". |
| T2 postcard back study | fixed (built), taste open | `seq/photos-d` 0104-0130, `show/04`: header rule, drawing plate, stamp and ring, note in italic, signature, colophon with place, city and colours. The park drawing still reads a little like clouds; metro figures are simple. |
| T3 2.5D card photo | fixed | `?photo=flat|layers`, default layers; person lane `tilt-sheet.png`; in my frames the depth is subtle at rest and shows only in the lean. |
| T4 owner's GitHub settings | not (note) | The lead reminds the owner. |
| T6 recorder on phones | fixed in headless | `seq/rec-dpr3` 0013-0039, `show/03`: solid object on a dark pool, no see-through, slot inside the gutter, poster without the spin (`data-spin="off"`). The iPhone check of `?spin=0` vs default is still owed. |
| T7 edk at the bottom | not (note) | Unchanged on purpose (`seq/scroll-d` 0385-0430). |
| T8 role of 3D objects | fixed (study delivered) | ADR-0018 proposed; the recorder is the strip's frontispiece and turns with the scroll. The direction waits for the owner. |
| T9 rail panel grows from the edge, light blur | fixed | `seq/rail-d` 0044-0072 (grows from the right edge, 3 px veil, group headers, closes on Escape), `rail-probe.png`; `seq/rail-p` 0036-0076 (full-height sheet, veil tap closes, row jumps). |
| T10 lanyard follows every motion | fixed | `sh-rope-d.jpg`: the strap's lower part and clip bend in the hover lean (0046-0054, 0077-0110) and in the drag; `sh-ent-rope.jpg`: the clip follows the phone entrance swing. The entrance swing itself is small. |
| T11 "How it's made" object | fixed | `seq/open-recto-d` 0180-0228, `show/06`: isometric cutaway with leaders, scrubbed both ways; numbered list on phones (`seq/open-recto-p` 0147-0168). |
| T13 bottom bar aligned glass | fixed | `show/07`: one height, one baseline, the bar's glass recipe. Headless often shows text sharp behind it (lane weak point 1). |
| T14 close apart on the left | fixed | `show/07`, `seq/open-recto-p` 0051-0057 (gutters on phone). |
| T15 clear exits | fixed | Project: labelled close with `esc` that folds after 4 s or the first scroll; close cursor (after `ab38f01`); phone pull fills a ring and closes (`sh-open-recto-p-exit.jpg` 0210-0225). Photo view: capsules, cursor over the dark space (`show/05`), phone pull (`seq/photos-p` 0122-0150). |
| T19 frame-by-frame review | partly | This review; continues each round. |
| T20 Home Record strip in the new language | fixed | `seq/scroll-d` 0334-0380, `show/02`: recorder above a centred weight-500 title, the tape becomes the spine on the 340 px edge, rows at one size. |
| T21 continue the open rows | partly | See below. |

## Verdicts, earlier and coverage rows

| Id | Verdict | Note |
|---|---|---|
| G2, G3 | partly | Cheap spots left: grey placeholders after a jump (postcards `seq/photos-p` 0020-0038, the English Prep print `seq/open-english-prep-d` 0029-0045); the right half of the Record rows bare at 1440. |
| G4, M5 | partly | Open waits: from the "Take a look" press to the layer about 1.6-2 s in the recording (`seq/open-recto-d` 0023-0042); part of it is the recorder's load, real hardware unchecked. |
| G5 | partly | Lane fixes in tokens (glass, radii, `--lh-*`, hit sizes); Eat Map hold (spec 9.2) not done. |
| G6 | partly | Same as G2: lazy media after a rail jump. |
| G7, G8 | partly | The parity matrix still needs its plan column. |
| M1, M2 | partly | Steady scroll is continuous in every frame of `seq/scroll-d` and `seq/scroll-p`; real hardware unchecked. |
| C2 | partly | Hover sway and rope done; texture (T27) not done this round. |
| P4 | partly | The back is new (T2); the front frame was not redesigned this round. |
| R2 | partly | Language written; the recorder turns with the scroll; the hand-over to `/record/` carries only the object (no `record-spine` name on the Record page). |
| E1 | partly | Fill improved by the frontispiece rings; empty band before the edk remains (T7). |
| T22 HyperFrames question | not | Owner question. |
| T23 no repetition test | fixed | `7b14c3f`. |
| T24 achievements list | not | Not in a lane. |
| T25 PR rule to English Prep | not | Through the owner. |
| T26 list of silent elements | not | Not in a lane. |
| T27 card texture | not | Not in a lane this round. |

Counts over T1-T21 and T22-T27 (27 rows): fixed 13 (T1, T2, T3, T6, T8, T9, T10, T11, T13, T14, T15,
T20, T23), partly 2 (T19, T21), not 12 (T4, T7 as notes; T5, T12, T16, T17, T18 already closed or
decided; T22, T24, T25, T26, T27). Earlier rows: 12 partly (G2-G8, M1, M2, C2, P4, R2, E1 grouped as
above), none newly fixed.

## Weak points that remain

1. Real hardware: glass blur, both pull gestures, the rope on touch and the recorder on the iPhone are
   unchecked; headless Chromium runs the blurred layers at about 10 fps.
2. Lazy media show grey for up to 2 s after a jump from the rail or the brief (postcards, side
   prints).
3. The open waits about 1.6-2 s in the recording between the press and the layer.
4. The postcard drawings are code-built: the park crowns read a little like clouds.
5. The desktop rail opens its sheet only by pointer; Enter or Space does nothing (no focusable column).
6. The Record strip's spine is drawn over `--sp` 0.22-0.62, later than spec 8.2; the right half of the
   rows is bare at 1440.
7. Eat Map's shorter hold (spec 9.2) is not done.
8. The home year-strip month links point at anchors that exist only on `/record/` (older bug,
   `YearStrip.astro`).
9. A press during the postcard open whose click lands after the card can turn it twice.
10. The close label "Close" is hard-coded in both layers (not a content string).

## Checks (final, at `d887956`)

`E2E_PORT=4861 npm run verify` exit 0 (`integ/verify2.log`): worlds OK; palette gate 174 of 177 pairings
(the 3 misses are advisory, inside the products' own worlds); `astro check` 0 errors, 0 warnings;
`build:test` OK; budget OK (`lab/one` 188.5 KB); Playwright 188 passed, 0 failed, 0 flaky.
