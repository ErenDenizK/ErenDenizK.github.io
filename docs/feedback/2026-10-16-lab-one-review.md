# Owner review of `/lab/one/` (2026-10-16)

**Status:** live tracker. Every sentence of the owner's review is one item below. An item closes only
when the owner sees it fixed ("her şey benim gözümde düzelene ve temiz olana kadar"). The lead
updates the Status column at each milestone. Source: the owner's dictated message of 2026-10-16
(condensed verbatim in `docs/history/brief-log.md`, same date).

Status values: open, partly, in work, built (waiting for the owner), closed (the owner accepted).
"Partly" means better, but a frame or a part still fails, or the proof needs real hardware; the
round critiques say which part. A row can also be "deferred" (the owner said later),
"superseded by" a newer row, "merged into" another row, or "waiting for the owner" (a decision or a
device check only the owner can give). Since 2026-10-17 (V20) the Status column uses these words
instead of the critiques' notes alone.

Round 2 (2026-10-16): a row is set to built only where the critic's frame sequences show it fixed on
`/lab/one/` at 1440 x 900 and 390 x 844 (headless Chromium, not real hardware). The evidence, the
verdict for every row and the rows still partly done are in the round's critique.

Round 3 (2026-10-16): the same rule. The integrator's frame sequences (1440 x 900, 390 x 844 touch,
and the Record strip at 390 x 844, DPR 3) set T1, T2, T3, T6, T8, T9, T10, T11, T13, T14, T15, T20 and
T23 to built. Headless Chromium only: the glass blur, the pull gestures and the recorder on a real
iPhone are not checked. The verdicts and the weak points are in the round-three critique.

Round 4 (2026-10-16, night): the same rule. The integrator merged the rail, glass and type, and person
lanes and took frame sequences at 1440 x 900 and 390 x 844 (DPR 3, touch): a steady scroll of the whole page,
the rail's hold-scrub and its bloom opening and closing in each variant, each glass version over dark and
light content, the name in each face, the ID card and the postcards. The frames set V2, V5, V6, V7, V8, V10
and T27 to built; T9 is superseded by V6; T22 and T25 are closed by V1 and V3; T24 waits (V2). V7 and V8 are
built with a default chosen from the studies; the owner picks the final version on the lab page
(`?glass=a|b|c|now`, `?name=nr|current|playfair|fraunces`, `?bloom=drop|palm|fan`). Headless Chromium only.
The verdicts are in the round-four critique.

Round 5 (2026-10-17, night): the archivist lane set the statuses of V20. T22 and T25 are closed (V1,
V3), T24 is deferred (V2), T9 is superseded by V6, T8 waits for the owner (V4), R1 is merged into T20,
and the rows the round-two to round-four critiques call partly now say "partly" (G2-G8, M1, M2, M5,
C2, P4, R2, E1, T19, T21, T26). The build lanes of round 5 set their own rows.

Round 5 integration (2026-10-17, night): the integrator merged the polish, docs and Work lanes and took
frame sequences at 1440 x 900 and 390 x 844 (DPR 3, touch): a steady scroll of the whole page, a rail
jump to Eat Map and to English Prep with an image audit (no grey picture in any frame), Take a look to the
settled layer, the bloom on Home and in the layer, the phone scrub, the card turn and the postcard back on
the phone, the Eat Map hold and both filled bands. The frames set V14, V23, V24 and P4 to built; V13 waits
for the owner's reading; V17, E1 and T26 stay partly. Headless Chromium only. The verdicts are in the
round-five critique.

Round 6 critique (2026-10-17): the frame-by-frame critic took screenshots and 50-100 ms frame sequences
at 1440 x 900 and 390 x 844 (DPR 3, touch) of the promoted site: the first screen, a steady scroll, the
rail, the glass, the card and lanyard, the drop, every project open and close, the flow and objects
switches, ten photo views, the Record, an entry and the redirects. The S rows say what the frames show.
Headless Chromium only. The verdicts and the weak points are in the round-six critique.

## Overall

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| G1 | The first screen is OK: acceptable, simple, nice. | Keep the brief's text and layout. Only its plate changes (P1). | closed |
| G2 | The order of the parts is as wanted, but the presentation fails. | Keep the order; redo the presentation of Work, the person's part, photos and the Record strip. | partly |
| G3 | The site must not look cheap anywhere. | Every part passes an "is this cheap?" review in the critic's checklist. | partly |
| G4 | Treat it as an art project, not a portfolio. Every frame, opened and studied frame by frame, must be flawless and feel like a masterpiece ("wow, this is creative"). | The critic reviews frame sequences of every motion; a frame with a defect stops the line. | partly |
| G5 | Before the Record, review the design tokens, the fill and empty-space ratios and the animations. | A token and rhythm audit (type, spacing, density, motion) before Record work starts. | partly |
| G6 | Every user interaction (scroll down or up, click) must be felt. Everything alive and responsive; responsive does not mean fast: an animation may be long, but there is always an animation, never an empty wait. | Scroll-linked motion everywhere (continuous, not stepped); no state where input gives no visible response. | partly |
| G7 | Read Shopify and the other references more: list every feature they have and check whether we have it. It need not match; the goal is the same fullness of features. | A feature parity matrix: each reference feature, ours or not, plan. | partly |
| G8 | Maybe Shopify and Robin have scroll animations but no click-to-enlarge, and that is why it was not understood. | The parity matrix separates scroll features from click features; the click-to-enlarge model comes from our own open (which works) and Robin's open. | partly |
| G9 | Work on this until everything is fixed and clean in the owner's eyes. | This tracker stays open until every row is closed. | open |

## Scrolling and motion

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| M1 | Scrolling feels like it catches. Not the duration: the design is bad, so the animations do not feel good. | Redesign the scroll structure, not only timings. | partly |
| M2 | The animations do not feel oiled and polished. Everything should feel like it floats in the air or on a pond: smooth. | Inertial, smoothed scroll feel (desktop); scroll-linked motion with soft, continuous easing; no stepped jumps. | partly |
| M3 | Waits while scrolling are not a problem in themselves. | Long scenes are allowed if they move. | built |
| M4 | Every scroll should animate, as in Shopify and the other examples: text slides slowly and continuously, also in reverse (not only on first arrival); text shapes itself with the motion; the page turns with it. | Scroll-scrubbed motion (reversible), not one-shot reveals. | built |
| M5 | Improve every scroll animation. | Part of the frame-by-frame review (G4). | partly |

## Work

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| W1 | Nice things were made, but the deck is wrong. Do not rotate all the photos for a long time while scrolling. | Remove the pinned deck that shuffles prints. | built |
| W2 | Robin is what the owner wants: the sheets, the photos move as if flying in the air while scrolling. | Work becomes Robin's flow: frames that drift past with the scroll (skew, depth, speed differences). | built |
| W3 | On click it opens at once; the current open is actually not bad, it opens nicely. | Keep the open (view transition, the paper grows). | built |
| W4 | Small drawings behind each project, a background texture next to the aura: e.g. one like a temple, one a small cyberpunk scene; ornament, art, lines. | One line-art illustration set per project, layered with the aura (2.5D). | built |
| W5 | Scrolling the idle state is not nice. The important elements of the app are piled up (3D object, pages): too heaped. Something that flows like oil is better. | Fewer layers per project at rest; one clear frame, motion carries the rest. | built |
| W6 | The project pages change while scrolling, and that animation is buggy and catches. The owner does not think they wanted it. | Remove the page swap inside the deck. | built |
| W7 | Eat Map: nothing to show, so one scrolls an empty space for half an hour. Silly. | Eat Map gets a short block, no long empty scroll. | built |

## Opened project

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| O1 | The open animation is good. | Keep it. | built |
| O2 | A scroll bar is needed in the opened project. | The rail inside the presentation layer. | built |
| O3 | Scrolling inside it does not animate well. Not "scroll a bit, the image does not change, scroll more, it jumps to the second image". | Continuous scroll-linked transitions between steps. | built |

## The person's part

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| C1 | The ID card feels like a much buggier version; nothing like the previous one. Swing, interactivity, the flip on a hard shake, the general flip, the hover: all buggy, catching, ugly. | Drop the reimplemented card. | built |
| C2 | Take the previous card exactly (the version the owner loved) and improve it: a bit more texture, a livelier photo, and on hover the card and the rope sway as feedback. | Port the live `IdCard` (dev before the two-page line) unchanged, then add: denser texture, a livelier photo, hover sway of card and lanyard. | partly |
| C3 | Not sure the card belongs there in the order. | The lead proposes its place; shown on the lab page. | closed (T1: next to How I work) |
| C4 | How I work (By hand / With agents): much more readable now, but the previous design was much more elegant: two lanes with a slow effect like falling drops. Now it looks cheap. | Bring back the previous tracks figure's design and its drop motion; keep today's readability. | built |

## Photos (postcards)

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| P1 | The Bostancı photo under the brief: did not like it. It shows only a little at the bottom and shows nothing. If used, use the large, uncropped, vertical version. A photo placed where it cannot be seen is a bad minus. | Show the photograph properly (vertical, uncropped, large) or not at all. The repo holds the 1932 x 2576 original. | built |
| P2 | The photos are piled at the bottom. Picking up and turning them catches, as with the ID card. | Rebuild the postcard interaction on the proven card physics. | built |
| P3 | Picking up is animated, but letting go is not. Very buggy. | Release animates back as smoothly as the pick-up. | built |
| P4 | The card's back should change in design. Reimagine the postcard from scratch as a concept: list what a postcard contains, then design each part new: modern, elegant, innovative, like a resume or an artwork, especially the back and the frame. Do not paste the first search result for "postcard". | A new postcard design (front frame, back), designed from its parts. | built (back in round 4; front frame in round 5: plate mark, bevelled window, gold hairline) |
| P5 | Three photos side by side; hovering one lifts it, but it should feel like it is really picked up and placed on top, not passing through the others. | Hover lifts and re-stacks the card above the others with depth, no clipping through. | built |

## Record strip and the Record page

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| R1 | The Record examples on Home do not match the Record's design language at all. | The Home strip uses the Record's design language. | merged into T20 |
| R2 | Define the Record page's design language and build to it. The owner likes the Record page a lot, above all its 3D object and its animations. | Write the Record design language from the live Record (keep the recorder object and its motion). | built (round six: the Record page is rebuilt to `docs/design/record-language.md`, recorder and arrival kept) |

## Emptiness and decoration

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| E1 | Still feels empty in places; textures etc. in the background. | Line-art textures and layered drawings across Home, with the aura. | partly (round 5 filled the band above the recorder and the band before edk with the tape; other quiet bands not reviewed) |

## GitHub profile and badges

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| H1 | Commits are in the owner's name to feature the GitHub profile and the portfolio (LinkedIn cannot be used for some reasons). | Keep authorship as set up. | closed |
| H2 | Chase all GitHub achievements, through real work, never fake. | A plan of the achievements that real work earns. | open |
| H3 | Recto decided this already: move to pull requests (PRC-17), which earn the badges missing so far. Adapt it here and to the other projects if needed. | Lanes land on `dev` through pull requests with merge commits; a CLAUDE.md rule with the owner's comment (given). | closed (rule in CLAUDE.md, PR #1) |

## Process

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| X1 | Study every sentence; skip none; list them; keep everything in a file as a plan so nothing is lost. | This file. | closed |

## Round 3 (owner, 2026-10-16, after round 2)

Kept as said; the lead's classification in the last column (task, note, or decided).

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| T1 | The card's place with `?card=lanes` is very nice, the right place. | Make the lanes placement the default; drop the switch. | task | built |
| T2 | The "Eren" signature on the postcard back is nice, but the back needs a much more balanced fill and empty space: a special study. Not only postcard logic. Better than before; think more about how to make it fuller and more elegant; maybe drawings on the backs; work on fill, font, type size and texture. | A dedicated postcard-back study: layout grid, type scale, texture, a drawing per card. | task | built |
| T3 | The card photo feels very flat and 2D. Maybe a 2.5D try; not sure about a moving portrait. | Try a 2.5D (depth-layered) photo on the ID card; show it as a lab switch against today's. | task | built |
| T4 | The owner's own actions (default branch, delete head branches) will be done at the computer; remind at the next gap. | The lead reminds in the next report. | note | open |
| T5 | Which round is this? The plans are right; continue. | Round 3; the open list of round 2 carries on. | decided | closed |
| T6 | The Record's 3D object has a small mobile render problem. | Reproduce and fix the recorder object on phones. | task | built |
| T7 | The edk at the very bottom stays for now, but it is cut off from the rest of the page. A better thing may be designed much later, only when the owner asks. | No work now; recorded as a known weak point. | note | open |
| T8 | With the 3D objects gone from most of the page, the owner is unsure. Two remain: edk (not well received) and the recorder (loved, but alone). Think, research and evaluate: new 3D objects from scratch? Where? In the background? The owner loves the recorder object and does not want it gone; fit it better into the whole page. | A study of the 3D objects' role on the new page, with options and a recommendation; the recorder stays. | task | waiting for the owner (V4: the objects options need pictures) |
| T9 | The panel that opens when the rail is clicked is good and makes jumping easy, but it should match the rail's lively look: maybe it grows from the side instead of a small window, blurs the background slightly, a bit more Apple design. | Redesign the rail's jump panel: grows from the rail's edge, light backdrop blur. | task | superseded by V6 (the owner rejected the panel) |
| T10 | The lanyard does not move when the card moves by itself: on the small hover response and the phone's first swing. It must react to those too, not only to pulling. | The lanyard follows every card motion (hover sway, idle, entrance). | task | built |
| T11 | In the opened project, the "How it's made" part's object is a bad object; design something much better. | Replace that object with a designed piece. | task | built |
| T12 | The rest of the opened project is good. | Keep it. | decided | closed |
| T13 | The bottom bar in the opened project is not aligned (texts and buttons), and does not feel like glass. It need not be liquid glass, but like the Home/Record tab at the top. | Rebuild the capsule on the bar's glass, aligned on one baseline and one height. | task | built |
| T14 | Separate the close (cross) from the go-to-project part: the cross on the left, the rest on its right, aligned and the same height, but apart. | Two capsules: close alone on the left, the actions on the right. | task | built |
| T15 | In tests, many users did not notice how to leave an enlarged photo (click the dark space) or an opened project (the cross at the left) and got stuck. Make leaving clearer; not a huge ugly button: creative solutions. | Exit affordances for the photo view and the project layer: visible, designed, not a big button. | task | built |
| T16 | The Record could also come next, but this page still has many improvements to make. | Finish Home first; Record page after. | decided | closed |
| T17 | The background drawings are very good, the colours are very good, the animations are really beautiful: a good prototype. Moving the card was good. | Keep the drawings, colours and motion. | decided | closed |
| T18 | Ask about anything missing; the owner can dictate. Same plan and discipline. | Questions only where a gap remains. | note | closed |
| T19 | It is a presentational artwork; every detail thought through. Look into these points in the visuals too. | The critic checks every new piece frame by frame. | task | partly (standing row; each round) |
| T20 | The Record part reached by scrolling down Home does not fit the new page's design language: it feels copy-pasted from outside. Harmonise and improve it. | Rework the Home Record strip so it is born from the new page's language while keeping the Record's identity. | task | built |
| T21 | Continue the next steps already listed (tests and the open rows). | The round-2 open rows (G5, G7 follow-ups, partly rows) continue. | task | partly (standing row; each round) |

## Coverage audit (lead, 2026-10-16)

A cross-check of the owner's last four messages against this file found nothing misread, four
items noted but dropped, and open rows that no build lane owned. New rows:

| Id | Source | What it means for the work | Kind | Status |
|---|---|---|---|---|
| T22 | message 1 ("HyperFrames or an alternative") | Decide with the owner whether composed motion-graphic loops (HyperFrames renders here) are made for the project presentations and the hero, or why not. | owner question | closed (V1: after Home and Record) |
| T23 | message 2 (no repetition) | A lab-one test that finds no repeated sentence of 5+ words outside the brief; re-run after the postcard and Record strip changes. | task | built |
| T24 | message 3 (all achievements, real work) | A short list for the owner of the real-work routes beyond the PR flow (READMEs worth starring, Discussions answers), with who does each. | task | deferred (V2: no rush) |
| T25 | message 3 (PRs in the other projects too) | Pass the PR rule to the English Prep chat through the owner; H3 here is done (CLAUDE.md rule). | task | closed (V3: English Prep archived) |
| T26 | messages 1 and 3 (motion everywhere, no empty wait; G6) | List every interactive element that gives no motion response and assign it to a lane. | task | partly (person area built in round 4; Work and the project layer in round 5: Take a look, next print, close cursor; the top bar not yet listed) |
| T27 | message 3 (C2, card texture) | A denser texture on both faces of the ported ID card. | task | built |

Rows G2, G3, G6, G7, G8, M1, M2 and E1 stay partly and must be owned by a lane in every round until
closed (V17 names the unowned leftovers). C3 is answered by T1; H3 is done (the rule is in CLAUDE.md since PR #1).

## Round 4 (owner, 2026-10-16, night; answers and new points)

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| V1 | HyperFrames: wait; certainly used later, maybe one round per app once everything is done. In-page animation goes well. | T22 deferred to after Home and Record are done. | decided | closed |
| V2 | Other achievements: no rush. The current ones have not appeared yet; unclear why. | Check why Pull Shark / YOLO did not show (likely the default branch is still `main`); report. | task | built (a report of the likely reasons and the owner's checks) |
| V3 | English Prep is archived; no change there for now. | T25 closed. | decided | closed |
| V4 | The tape-as-spine Record idea may not be bad; the owner tests in the morning. The project-objects idea was not clear. | Explain the objects options simply with pictures in the next report. | note | superseded by S4 (the objects options are a lab switch) |
| V5 | The postcard-back drawings look good; the text at the bottom spreads a bit; maybe a phone problem; measure on the phone too. | Fix the postcard back's lower text block on phones; every measurement at 390 as well as 1440. | task | built |
| V6 | The rail's opened panel looks very ugly in the shot. The plain rail at the right is good. The rail needs two more parts: press-and-hold to drag (scrub), and a menu on click that is a showcase. Never a separate drawer or window. A click should feel like touching something alive that grows or reveals from that point: a water drop pressed spreads lower and wider; a closed palm whose fingers open. The background blur is gradual and natural from the side, not inside a window, to bring the text and the pressed rail forward; above all on phones. Fonts, taps and motion must be expert, professional and artistic, not a technical feature: every light, colour and motion detail matters; a masterpiece; creative, meticulous, measured. | Redesign the rail interaction: hold-to-scrub; a click that blooms from the rail point (no panel box); edge-graded backdrop blur; typographic and motion craft; iterate several versions and judge them frame by frame. | task | built (default drop; the owner judges the variants) |
| V7 | The new glass looks good. Should the bottom capsules and the top Home/Record tab be the same glass? Different? Real refraction, or would it hurt performance; GPU on capable devices? The top one's light changes with the aura and feels more like glass; the bottom ones are nicely minimal. Let each take the best of the other; test several versions to find the right one. | A glass study: one family for the tab and the capsules; aura-tinted light, minimal body; optional refraction on capable GPUs with a fallback; versions as lab switches with measured cost. | task | built (default A; the owner picks a version) |
| V8 | The owner's father found the name's typeface at the top cheap. The owner thinks it is elegant and personal rather than product-like. Review all references, portfolios and research again; evaluate candidate typefaces yourself, why and why not; follow the research and the lead's view. | A typeface study for the name (and display role): candidates against the references; a recommendation; candidates as a lab switch; the owner decides. | task | built (default Newsreader display at 48/34 px; the owner decides) |
| V9 | Keep working through the night: open work first, then small improvements (no big changes), then iterate the rail. | Continue the open rows; rail iterations. | task | in work |
| V10 | Check again that nothing that turned into a note in earlier messages was left undone; gather everything. | A second coverage pass over all owner messages. | task | built (coverage pass two) |

## Coverage pass two (2026-10-17, night)

Sixteen rows from the second coverage audit (`docs/research/2026-10-coverage-pass-two.md`).

| Id | Source | What it means for the work | Kind | Status |
|---|---|---|---|---|
| V11 | coverage pass two (I1) | Answer the owner's model question in the morning report: every turn of this session ran on the same main model; no turn ran on the small one. | note (answer owed) | closed |
| V12 | coverage pass two (J2) | One-line answer: HyperFrames renders HTML compositions to video files; in-page motion stays CSS and scripts. So it fits the later per-app video round, not the page. | note (answer owed) | closed |
| V13 | coverage pass two (J9) | The postcard back's lower text on phones: check both readings of "açılmış" (spacing spread and colour washed out) at 390 DPR 3; show the before/after picture and ask which was meant. | task | waiting for the owner (both readings built in round 5: one tight group, contrast raised; the owner says which was meant) |
| V14 | coverage pass two (J16, O2) | Judge the bloom variants by feel (the press point gives, then spreads wider; things open outwards), not by drawing a drop or a palm. Apply the chosen rail to the opened project's rail too, so there is one rail. | task | built (round 5: the beads give under the press, then the names bloom out; the layer's rail is the same rail with the steps as one part) |
| V15 | coverage pass two (J20-J22) | Glass default: the lead keeps version A as the default, because the owner asked that the tab and the capsules each take the best of the other, and A also fixes the inactive tab label (1.9:1 over white). Today's glass stays one word away at `?glass=now`; the owner picks. | decided (lead; owner may overrule) | open |
| V16 | coverage pass two (J24, J7, D5) | One morning question sheet, Turkish, each with a picture and a lab link: rail variants, glass versions, name typefaces, project objects (V4, with drawings), tape-as-spine, `?photo=flat | layers`, `?cap=line | open |
| V17 | coverage pass two (G-rows rule) | Give the unowned leftovers an owner this round (a small Work-leftovers lane or the integrator): Work grey prints after a jump, the 1.6-2 s open wait, the Eat Map hold (spec 9.2), the parity plan column, the postcard front frame, the band before edk, silent elements outside the person area, the "Close" label as content. | task | partly (round 5 Work lane: prints load before a jump, open wait shorter, hold 300 px shorter, front frame, band before edk, Work controls move, Close from content; the parity plan column and the top bar are not done) |
| V18 | coverage pass two (T6, T10, T13, T15, M1, M2) | A five-minute iPhone checklist for the owner (recorder `?spin`, glass blur, both pulls, rope on the first swing, scroll feel), with what "good" looks like; results update those rows. | task (owner) | open |
| V19 | coverage pass two (T15) | T15 counts as done only after two or three people find both exits unaided, as in the owner's own test. | note | open |
| V20 | coverage pass two (doc truth) | Tracker statuses: T22 closed (V1), T25 closed (V3), T24 deferred (V2), T9 superseded by V6, T8 "waiting for the owner" (V4), R1 merged into T20; add "partly" to the status values and use it. | task | built (2026-10-17, archivist lane) |
| V21 | coverage pass two (I, J) | Brief log entries for 2026-10-16 evening and night; brief.md lines for T1, V6, V7, the masterpiece and phone-measurement standard, V1, V3; mark the 2026-10-09 "Desktop first" line superseded. | task | built (2026-10-17, archivist lane) |
| V22 | coverage pass two (doc truth) | Refresh PLAN (where we are, phases 3 rows, morning questions, drop English Prep item), HANDOFF (round 2-4 state, metro photos, hero object, decisions) and the 10-16 journal. | task | built (2026-10-17, archivist lane; the night is in the 10-17 journal) |
| V23 | coverage pass two (A15) | T27 wording: "a CD-like surface or similar; density, not realism; visible on the front too" (brief line 60), passed to whoever builds it. | task | built (round 5: checked against the wording; the resting sheen on phones raised from 6 to 10 percent) |
| V24 | coverage pass two (A12) | Check the postcard burn-in against "too slow"; keep the small colour detail the owner liked. | task | built (round 5: safelight red, warm grey, colour in 640 ms, 60 ms after the press) |
| V25 | coverage pass two (D3, V8) | Give the type study the provisional 48/34 px answer: the name's size and weight, not only the face, may be what reads cheap; include size in the switch. | note | open |
| V26 | coverage pass two (A19) | Dictation inside artifacts: the owner said not to bother if heavy; keep as a note, no work. | note | closed |

## Round 6 (owner, 2026-10-17: answers to the morning sheet and a long brief)

Status values: open, in work, partly, built (waiting for the owner), closed. Kind: task, note, decided, owner question.

### Answers to the morning sheet

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| S1 | Rail opening: drop. When it opens from the side, no dots may stay behind at the side: the dots must move and become part of the new part, so it feels born from the rail and grown out of it, not a new thing opening. Share your view. The current design looks very elegant in the picture. | The beads themselves travel out along the curve and become the markers beside their names; none stays on the rail; they travel back on close. (Lead's view: agreed; it is the missing half of "born from the rail".) | task | built (round six critique: the beads leave the rail and become the markers, 390 and 1440 frames) |
| S2 | Glass: A. Watch the implementation: the Bostancı section's colour is blue but the glass looks green in the picture. | Check the aura colour each glass takes per section; Bostancı/brief must read blue. | task | built (the bar's glass is blue over the first screen at 1440 and 390) |
| S3 | Name typeface: Newsreader display cut. | Keep as default; drop the switch later. | decided | closed |
| S4 | Project objects: option 2, but not fully understood; explain better or let me test: only one picture (option 1) was given and it looked OK. A better preview of options 1 and 2. | Build both as a lab switch (`?objects=glass|line|none`) with real renders, so the owner can test. | task | built (waiting for the owner: `?objects=glass|line|none` renders all three at 1440 and 390) |
| S5 | Tape as the timeline: nice, keep. | Keep. | decided | closed |
| S6 | Card photo: layered; only small cut errors, above all at the right shoulder; separate them flawlessly. | Recut the 2.5D layers; the blurred background no longer sticks to the shoulder. | task | built (tilted card at 1440, DPR 2: no blurred part on the right shoulder) |
| S7 | Postcard back "açılmış": does not remember; the fix is good. | Close V13. | decided | closed |
| S8 | Caption when enlarged, open 900 ms; did not see the differences; the long animation felt quite elegant. | Keep the caption choice; make 1400 ms the open default, since the owner found the long one elegant. | decided | closed |
| S9 | iPhone notes come in the next dictation. | Wait. | note | open |

### The brief

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| S10 | On phones the Record's 3D object shows as a white square box, colours inverted, like a render problem. | Find and fix the recorder's phone rendering (blend mode over video on iOS Safari is the first suspect). | task | waiting for the owner (headless phone renders the recorder correctly; an iPhone check is owed) |
| S11 | Progress is good. | Note. | note | closed |
| S12 | Phone optimisation may be an issue, but last: first all features, design and animation work and are tuned; then optimise, refactor, only on the owner's manual instruction. Not a task now. | No optimisation or refactor work unless the owner asks; record it. | decided | closed |
| S13 | The rail: equal spacing between the names when open; now some are very close and some not; it looks cheap; more orderly. | Equal rhythm between bloom labels (and between groups). | task | built (one 40 px pitch between the names at 1440 and 390) |
| S14 | Clicking a name (e.g. Work): the rail must acknowledge the click inside itself; now it closes without animation and scrolls slowly to Work. | A press state on the chosen label, then an animated close that carries the choice, then the scroll. | task | built (the name is pressed, carried home, the page travels; the browser tap box is removed) |
| S15 | The glass blocks need animation: hover and press are cheap CSS now. Like Apple's Liquid Glass: like water, a water drop: on hover a slight change of shape; on press grow and shrink; for every glass button; a joyful language; every animation visible, not short and hidden, as long as it does not stutter. | A liquid-glass motion system for all glass buttons (shape, press, release), measured. | task | built (press swells and releases at 390; the hover change at 1440 is subtle) |
| S16 | The page overall is beautiful; the drawings are nice. | Note. | note | closed |
| S17 | ID card: the edge of the shoulder is not cut cleanly in 2.5D; a blurred part that should go to the background is joined to the shoulder and turns with it. | Same as S6. | task | built (same as S6) |
| S18 | Turning the lanyard: it breaks and turns from the middle of the rope; it should turn as a whole from the part above the page (front and back). | The rope pivots from its off-screen top; no visible kink. | task | built (the ribbon turns whole from its off-page top; no kink in 33 ms frames) |
| S19 | The rope's reactions to motion are good. | Keep. | decided | closed |
| S20 | Background drawings are very elegant; the moving ones are better than the fixed ones. Only: the moving English Prep and Eat Map drawings run into each other too much: a mess. Shared lines or transitions are fine, but not this much. | Separate the project scenes in motion; controlled overlap only at the handover. | task | built (the English Prep scene has left before Eat Map's rises in the handover stills) |
| S21 | Eat Map's city drawing behind is very low quality. This is a huge design project; work finely. | Redraw Eat Map's scene. | task | built (waiting for the owner's eye: a market street rising out of its map) |
| S22 | The park drawing behind the lens photo is nice; the walking man looks like a stick figure. Remove it or make a better illustration (a fully realistic man may be too much). | Remove or redraw the walker. | task | built (the walker is removed) |
| S23 | The metro and the cat drawings are both very bad: not pleasing, not realistic, imitate the photo at low quality, like a cheap AI line. Rework both completely; think long; special agent flows for the drawings, also to improve the existing ones. | Redraw the metro and the cat backs. | task | partly (both redrawn: the metro cutaway reads well; the cat is still an outline icon on a good sea) |
| S24 | The owner loves the drawings idea; it must be flawless, artistic, harmonious, with fine craft and many details, well thought and well checked. A large budget: time, agents, everything needed. The Recto temple and English Prep drawings are good (simpler). | A dedicated engraving line with art direction, several illustrators and a reviewer. | task | partly (standing row: the line exists; the owner judges) |
| S25 | How I work (By hand / With agents) is good on phone and desktop, but the drop does not feel right: its tail is buggy; when the drop turns left the tail snaps 90 degrees. Design a smoother, beautiful drop; work on the drop separately. | Redesign the drop and its tail (continuous path, no snap). | task | built (the drop and its tail follow the route without a snap at 390 and 1440) |
| S26 | The pattern of the owner's briefs: the idea is good, now work the fine details (drops, drawings). | Note for every lane: refine, do not replace accepted ideas. | note | closed |
| S27 | The Record part has no drawing behind it; fill it with drawings. | A Record scene. | task | built (an exploded tape transport behind the strip and the Record head; faint by design) |
| S28 | Behind How I work there is a squared, boxy drawing whose subject cannot be understood; redo it with something good. | Replace the How I work background drawing. | task | built (the loom replaces the boxy plan) |
| S29 | How I made is very good for every project, but all three are the same design: could each be different, specific to the project? A good start. | Per-project How I made designs. | task | partly (Recto has the column, English Prep the loop; Eat Map shows no How I made section) |
| S30 | Longer project explanations: vision, why it was made; How I made exists; what else? Look at how the references and the web explain projects; grow the content, not just to grow it: list options, pick the best, build variants and choose the best. | A project-story study and variants (sections, order, depth) per project. | task | partly (the story sections exist and stay hidden until the owner writes them, S42) |
| S31 | The photos coming up from below while scrolling: good, or would a horizontal, turning, living, cylinder-like flow of flying sheets be better than the vertical stack? Evaluate. | Build a horizontal flow as a lab switch next to today's vertical one and judge it. | task | built (waiting for the owner: `?work=flow` flies the sheets sideways at 1440 and 390) |
| S32 | The biggest point: every scroll stage improved, but the first impression is very weak: only text, little drawing, a tiny bit of Bostancı at the bottom; it feels half-finished. Screenshot desktop and phone without scrolling: the back is empty, the drawing insufficient, the composition alone is very bad. Content is fine; the design must improve. Look at the Renaissance edition again. | Redesign the first screen's composition (desktop and phone) with the engravings and the photo; options; the content stays. | task | partly (the new composition stands; at 1440 headless the colour arrives as a cut, see the round six critique) |
| S33 | The buttons on the first screen that go to the projects jump at once; they must travel animated through the page. | Animated in-page travel from the brief's links (the same feel as the rail). | task | built (the brief's links fly a dot to the rail and travel the page) |
| S34 | Two drawing concepts: Istanbul (the Bosphorus, the Maiden's Tower, different places of Istanbul) for long work; and YTU's Davutpaşa campus, which is very elegant, from reference images. | Two engraving series; ask the owner for Davutpaşa reference photos. | task | partly (Istanbul plates and a provisional Davutpaşa study on `/lab/engravings/` only) |
| S35 | The photos' animations are good; sometimes the going-back animation does not load when entering or leaving a photo (also by button). Maybe a phone issue. | Find the intermittent missing close animation of the photo view. | task | built (ten opens and closes at 390: every close morphs; the backdrop now fades) |
| S36 | Behind Recto it is still a bit empty; the lines are nice, but more around it. | Fuller Recto scene. | task | built (a walled precinct round the temple) |
| S37 | Turn every sentence into a report; gather everything left from earlier messages; nothing left over. | Coverage pass three. | task | open |
| S38 | Move on to the Record page too. The owner loves the new version (lab/one): drop the old version and work as if this is the product; it has become a real vision. | Promote the new Home to the site's root, retire the old pages with redirects, and build the Record page in the new language. | task | built (Home at the root, redirects and the Record checked at 1440 and 390) |
| S39 | A new week; a much more flexible budget: use many agents and complex structures; no 2-builder or 4-agent limit; build the system as needed. | Pace rule in CLAUDE.md changes (owner's comment given). | decided | closed |
| S40 | It is an artistic page: every structure carries an idea, a thought, an effort. | The standard. | note | closed |
| S41 | Small details left between the big points: close them with the owner's design vision; ask if needed. | The lead closes small gaps. | note | closed |
| S42 | Texts and content are updated later on the owner's word; now visuals and animations. | Content later. | decided | closed |
| S43 | Give these drawings a name to refer to them. | Name: "the engravings" (Turkish: "gravürler"). | decided | closed |
| S44 | Say what research, technique, skill, connection or reference photos are needed for flawless drawings. | Ask the owner (Davutpaşa photos, Istanbul places). | owner question | open |
| S45 | Check the project files, old prompts, CLAUDE.md and old things; keep the project clean. | Clean-up station this round. | task | partly (the four-page code is removed; the round's docs clean-up is not reviewed) |

### Round 6 additions (owner, 2026-10-17, a second message; information, not a new priority)

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| S46 | Davutpaşa reference photos sent (five). The place meant is the Orta Bahçe: the central courtyard inside the old barracks, a rectangular historic building with trees and paths in the middle; iconic; students spend much time there. | Draw the Davutpaşa engraving of the Orta Bahçe from `docs/research/references/davutpasa/` (references only, never published). | task | partly (provisional study on the lab page) |
| S47 | Swipe-to-close (photo view, project) was not noticed even by the owner; it catches a bit and is not obvious; partly an optimisation problem. | Make the pull-to-close discoverable and smooth (with S15's motion language). | task | open |
| S48 | The engravings move while scrolling and have a multi-layer structure: check their motion and depth as carefully as their drawing. | The art review grades each engraving in motion (layer speeds, separation, depth), not only still. | task | partly (separation checked in the handover; layer speeds not graded) |
| S49 | Performance optimisation may go on in small steps without breaking the flow; big steps are not needed, but performance should improve a little at every stage, or everything tangles. | Revises S12: small, safe performance work in every round; no large refactor without the owner. | decided | closed |
| S50 | The owner likes the work system; keep looking for improvements to the project and to the workflow, for quality and speed. | Note for the lead. | note | closed |

### Round 6 notes (owner, 2026-10-17, after the round closed)

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| S51 | Test round 6 before any big new work. | Round 7 was stopped before it changed anything; round 6 ships first; round 7 waits for the owner's test. | decided | closed |
| S52 | Not sure about the first-screen plate from the pictures. For something new and creative the owner has not approved (above all the Home's first screen), first show a quick concept: a rough sketch or a spoken description of the idea in minutes, before an hour of engraving. Fill the page with meaningful things, not lines everywhere that tire the eyes. | New rule: a new creative concept gets a concept sheet (rough sketches, the idea in words) and the owner's yes before full work; refinements of approved pieces go straight on. | decided | closed |
