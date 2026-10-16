# Owner review of `/lab/one/` (2026-10-16)

**Status:** live tracker. Every sentence of the owner's review is one item below. An item closes only
when the owner sees it fixed ("her şey benim gözümde düzelene ve temiz olana kadar"). The lead
updates the Status column at each milestone. Source: the owner's dictated message of 2026-10-16
(condensed verbatim in `docs/history/brief-log.md`, same date).

Status values: open, in work, built (waiting for the owner), closed (the owner accepted).

Round 2 (2026-10-16): a row is set to built only where the critic's frame sequences show it fixed on
`/lab/one/` at 1440 x 900 and 390 x 844 (headless Chromium, not real hardware). The evidence, the
verdict for every row and the rows still partly done are in the round's critique.

## Overall

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| G1 | The first screen is OK: acceptable, simple, nice. | Keep the brief's text and layout. Only its plate changes (P1). | closed |
| G2 | The order of the parts is as wanted, but the presentation fails. | Keep the order; redo the presentation of Work, the person's part, photos and the Record strip. | open |
| G3 | The site must not look cheap anywhere. | Every part passes an "is this cheap?" review in the critic's checklist. | open |
| G4 | Treat it as an art project, not a portfolio. Every frame, opened and studied frame by frame, must be flawless and feel like a masterpiece ("wow, this is creative"). | The critic reviews frame sequences of every motion; a frame with a defect stops the line. | open |
| G5 | Before the Record, review the design tokens, the fill and empty-space ratios and the animations. | A token and rhythm audit (type, spacing, density, motion) before Record work starts. | open |
| G6 | Every user interaction (scroll down or up, click) must be felt. Everything alive and responsive; responsive does not mean fast: an animation may be long, but there is always an animation, never an empty wait. | Scroll-linked motion everywhere (continuous, not stepped); no state where input gives no visible response. | open |
| G7 | Read Shopify and the other references more: list every feature they have and check whether we have it. It need not match; the goal is the same fullness of features. | A feature parity matrix: each reference feature, ours or not, plan. | open |
| G8 | Maybe Shopify and Robin have scroll animations but no click-to-enlarge, and that is why it was not understood. | The parity matrix separates scroll features from click features; the click-to-enlarge model comes from our own open (which works) and Robin's open. | open |
| G9 | Work on this until everything is fixed and clean in the owner's eyes. | This tracker stays open until every row is closed. | open |

## Scrolling and motion

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| M1 | Scrolling feels like it catches. Not the duration: the design is bad, so the animations do not feel good. | Redesign the scroll structure, not only timings. | open |
| M2 | The animations do not feel oiled and polished. Everything should feel like it floats in the air or on a pond: smooth. | Inertial, smoothed scroll feel (desktop); scroll-linked motion with soft, continuous easing; no stepped jumps. | open |
| M3 | Waits while scrolling are not a problem in themselves. | Long scenes are allowed if they move. | built |
| M4 | Every scroll should animate, as in Shopify and the other examples: text slides slowly and continuously, also in reverse (not only on first arrival); text shapes itself with the motion; the page turns with it. | Scroll-scrubbed motion (reversible), not one-shot reveals. | built |
| M5 | Improve every scroll animation. | Part of the frame-by-frame review (G4). | open |

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
| C2 | Take the previous card exactly (the version the owner loved) and improve it: a bit more texture, a livelier photo, and on hover the card and the rope sway as feedback. | Port the live `IdCard` (dev before the two-page line) unchanged, then add: denser texture, a livelier photo, hover sway of card and lanyard. | open |
| C3 | Not sure the card belongs there in the order. | The lead proposes its place; shown on the lab page. | open |
| C4 | How I work (By hand / With agents): much more readable now, but the previous design was much more elegant: two lanes with a slow effect like falling drops. Now it looks cheap. | Bring back the previous tracks figure's design and its drop motion; keep today's readability. | built |

## Photos (postcards)

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| P1 | The Bostancı photo under the brief: did not like it. It shows only a little at the bottom and shows nothing. If used, use the large, uncropped, vertical version. A photo placed where it cannot be seen is a bad minus. | Show the photograph properly (vertical, uncropped, large) or not at all. The repo holds the 1932 x 2576 original. | built |
| P2 | The photos are piled at the bottom. Picking up and turning them catches, as with the ID card. | Rebuild the postcard interaction on the proven card physics. | built |
| P3 | Picking up is animated, but letting go is not. Very buggy. | Release animates back as smoothly as the pick-up. | built |
| P4 | The card's back should change in design. Reimagine the postcard from scratch as a concept: list what a postcard contains, then design each part new: modern, elegant, innovative, like a resume or an artwork, especially the back and the frame. Do not paste the first search result for "postcard". | A new postcard design (front frame, back), designed from its parts. | open |
| P5 | Three photos side by side; hovering one lifts it, but it should feel like it is really picked up and placed on top, not passing through the others. | Hover lifts and re-stacks the card above the others with depth, no clipping through. | built |

## Record strip and the Record page

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| R1 | The Record examples on Home do not match the Record's design language at all. | The Home strip uses the Record's design language. | built |
| R2 | Define the Record page's design language and build to it. The owner likes the Record page a lot, above all its 3D object and its animations. | Write the Record design language from the live Record (keep the recorder object and its motion). | open |

## Emptiness and decoration

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| E1 | Still feels empty in places; textures etc. in the background. | Line-art textures and layered drawings across Home, with the aura. | open |

## GitHub profile and badges

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| H1 | Commits are in the owner's name to feature the GitHub profile and the portfolio (LinkedIn cannot be used for some reasons). | Keep authorship as set up. | closed |
| H2 | Chase all GitHub achievements, through real work, never fake. | A plan of the achievements that real work earns. | open |
| H3 | Recto decided this already: move to pull requests (PRC-17), which earn the badges missing so far. Adapt it here and to the other projects if needed. | Lanes land on `dev` through pull requests with merge commits; a CLAUDE.md rule with the owner's comment (given). | open |

## Process

| Id | The owner said | What it means for the work | Status |
|---|---|---|---|
| X1 | Study every sentence; skip none; list them; keep everything in a file as a plan so nothing is lost. | This file. | closed |

## Round 3 (owner, 2026-10-16, after round 2)

Kept as said; the lead's classification in the last column (task, note, or decided).

| Id | The owner said | What it means for the work | Kind | Status |
|---|---|---|---|---|
| T1 | The card's place with `?card=lanes` is very nice, the right place. | Make the lanes placement the default; drop the switch. | task | open |
| T2 | The "Eren" signature on the postcard back is nice, but the back needs a much more balanced fill and empty space: a special study. Not only postcard logic. Better than before; think more about how to make it fuller and more elegant; maybe drawings on the backs; work on fill, font, type size and texture. | A dedicated postcard-back study: layout grid, type scale, texture, a drawing per card. | task | open |
| T3 | The card photo feels very flat and 2D. Maybe a 2.5D try; not sure about a moving portrait. | Try a 2.5D (depth-layered) photo on the ID card; show it as a lab switch against today's. | task | open |
| T4 | The owner's own actions (default branch, delete head branches) will be done at the computer; remind at the next gap. | The lead reminds in the next report. | note | open |
| T5 | Which round is this? The plans are right; continue. | Round 3; the open list of round 2 carries on. | decided | closed |
| T6 | The Record's 3D object has a small mobile render problem. | Reproduce and fix the recorder object on phones. | task | open |
| T7 | The edk at the very bottom stays for now, but it is cut off from the rest of the page. A better thing may be designed much later, only when the owner asks. | No work now; recorded as a known weak point. | note | open |
| T8 | With the 3D objects gone from most of the page, the owner is unsure. Two remain: edk (not well received) and the recorder (loved, but alone). Think, research and evaluate: new 3D objects from scratch? Where? In the background? The owner loves the recorder object and does not want it gone; fit it better into the whole page. | A study of the 3D objects' role on the new page, with options and a recommendation; the recorder stays. | task | open |
| T9 | The panel that opens when the rail is clicked is good and makes jumping easy, but it should match the rail's lively look: maybe it grows from the side instead of a small window, blurs the background slightly, a bit more Apple design. | Redesign the rail's jump panel: grows from the rail's edge, light backdrop blur. | task | open |
| T10 | The lanyard does not move when the card moves by itself: on the small hover response and the phone's first swing. It must react to those too, not only to pulling. | The lanyard follows every card motion (hover sway, idle, entrance). | task | open |
| T11 | In the opened project, the "How it's made" part's object is a bad object; design something much better. | Replace that object with a designed piece. | task | open |
| T12 | The rest of the opened project is good. | Keep it. | decided | closed |
| T13 | The bottom bar in the opened project is not aligned (texts and buttons), and does not feel like glass. It need not be liquid glass, but like the Home/Record tab at the top. | Rebuild the capsule on the bar's glass, aligned on one baseline and one height. | task | open |
| T14 | Separate the close (cross) from the go-to-project part: the cross on the left, the rest on its right, aligned and the same height, but apart. | Two capsules: close alone on the left, the actions on the right. | task | open |
| T15 | In tests, many users did not notice how to leave an enlarged photo (click the dark space) or an opened project (the cross at the left) and got stuck. Make leaving clearer; not a huge ugly button: creative solutions. | Exit affordances for the photo view and the project layer: visible, designed, not a big button. | task | open |
| T16 | The Record could also come next, but this page still has many improvements to make. | Finish Home first; Record page after. | decided | closed |
| T17 | The background drawings are very good, the colours are very good, the animations are really beautiful: a good prototype. Moving the card was good. | Keep the drawings, colours and motion. | decided | closed |
| T18 | Ask about anything missing; the owner can dictate. Same plan and discipline. | Questions only where a gap remains. | note | closed |
| T19 | It is a presentational artwork; every detail thought through. Look into these points in the visuals too. | The critic checks every new piece frame by frame. | task | open |
| T20 | The Record part reached by scrolling down Home does not fit the new page's design language: it feels copy-pasted from outside. Harmonise and improve it. | Rework the Home Record strip so it is born from the new page's language while keeping the Record's identity. | task | open |
| T21 | Continue the next steps already listed (tests and the open rows). | The round-2 open rows (G5, G7 follow-ups, partly rows) continue. | task | open |
