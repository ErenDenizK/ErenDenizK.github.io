# Round 5 critique (integrator, 2026-10-17)

Branch `wip/r5-work` (worktree `scratchpad/wt/r5-work`): Work lane, merged polish lane (7946a85), merged docs
lane (7391cea), then five integrator commits. Headless Chromium only, 1440 x 900 and 390 x 844 (DPR 3, touch).
Frames: `scratchpad/round5/crit2/` (contact sheets `s-*.jpg`, `sh-*.jpg`; frame folders beside them).

## Integrator commits

1. `837c2cf` fix: a press on the dark space while a postcard grows closes it once it stands. Before, every
   press during the growth was queued as a turn, so the view stayed open (polish lane item 12). The card's
   box now decides between turn and close. The existing "press while growing turns the card" test passes.
2. `2a15e91` fix: on a phone, "Open English Prep" squeezed the close capsule's word to "Cl" for 4 s. When
   the word is clipped, the close starts folded.
3. `8dc7611` fix: that fold is now instant. A 390 frame at 1665 ms showed a half-faded "C".
4. `9a52294` feat: the layer's rail groups its steps as one part, with the gaps Home's rail has
   (rail-bloom 6). The polish lane described this but could not edit the Work file.
5. `1daacc5` docs: tracker statuses from this review.

## Rows, with evidence

| Row | Verdict | Evidence |
|---|---|---|
| V17 grey prints after a jump | fixed | Rail jump to Eat Map (1440) and English Prep (390): an image audit on every frame found 0 incomplete images; the first frame after landing already has its pictures (`sh-jump-d.jpg`, `sh-jump-p.jpg`). |
| V17 open wait | better | 390: paper moves at once, layer settled by about 1.1 s; capsules arrive at about 1.4 s (`sh-open-p.jpg`). 1440: the screenshot loop is too slow to time it here, but the layer is complete at the second frame. |
| V17 Eat Map hold (9.2) | fixed | 12 positions through the section at both sizes (`sh-hold.jpg`, `sh-hold-d.jpg`): the drawing rises and the route lights; no still picture is held. |
| V17 Close label | fixed | The label comes from `content/site.json`. |
| V17 parity plan column, top bar motion | not done | No lane covered them. |
| V14 bloom by feel, one rail | built | Home bloom 1440 and 390 (`sh-bl-d.jpg`, `sh-bl-p.jpg`): the names spread from the press with no overlap; the layer's bloom (`sh-lb-*.jpg`) is the same rail, with part gaps. |
| Phone scrub, no word twice | built | `sh-scrub-p.jpg`: while a section title is on screen, only "Work 0N / 10" shows. |
| Card turn on the phone | good | `sh-card-p.jpg`: the edge-on frame (201 ms) has no dark block; the back settles by 480 ms. |
| V13 postcard back on the phone | waiting for the owner | `x/pcback-1.png` at DPR 3: the block is tight, labels and hex are readable, the micro line fades at its end. |
| V24 burn-in | built (polish evidence) | Red, warm grey, colour in 640 ms; checked in the polish lane's frames only. |
| V23/T27 | built | Resting sheen visible on the phone card front. |
| P4 front frame | built | Plate mark, bevelled window and hairline visible in the large view. |
| E1 two bands | partly | `sh-band-*.jpg`: the tape runs from "Tap one to look closer" into the recorder and from "The whole record" to edk, on both sizes; it draws with the scroll. Other quiet bands were not judged. |

## Still weak (no change made: these are taste calls, or too large for tonight)

1. Open on the phone: while the paper grows into the page, its lighter edge crosses the summary for about
   one frame (692 ms frame). This is the designed morph, but the edge is visible.
2. Hold at 1440: after the texts leave, the lower 40 % of the screen is a dark band until the torn edge
   arrives (hold-d-05..07). Not empty to the eye at speed, but quiet.
3. Phone scrub: the big name ("How I work", "Card") is drawn over body text and over the card photo
   during the drag (move14, move18). It is legible, but it sits on content, not on a clear field.
4. Layer bloom on the phone: the longest step name ("One glass capsule changes shape") reaches about
   26 px from the left edge. It fits, but it is close to the gutter.
5. Postcard view on the phone: during the open, the photo's aspect morphs (400 ms frame looks narrow).
6. Headless frames cannot show real-device timing; the iPhone checklist (V18) is still owed.

## Checks

See the summary returned to the lead (real counts from `scratchpad/round5/verify.log`).

Real counts (E2E_PORT=5061): `npm run check` 0 errors, 0 warnings, 1 hint; `build:test` exit 0;
`palette:gate` 174 of 177 pairings (gate met); budget printed, lab/one 194.8 KB; worlds passed.
Full Playwright suite: 179 passed, 27 failed, 0 skipped. All 27 failures were in `rail.spec.ts` with
`net::ERR_UNSAFE_PORT`: that spec sets its own `launchOptions`, which replaces the local flag that lets
Chromium use port 5061 (a blocked SIP port). With the flag added in a local, uncommitted edit, `rail.spec.ts`
passed 36 of 36. So the code passes all 206 tests; the failures come from the environment. CI uses its
own port, so it does not hit this. Lab-one specs alone: 54 of 54.
