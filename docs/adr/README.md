# Architecture decision records

One file per decision, numbered, never renumbered. Status is `proposed` until the owner
accepts it; a later ADR supersedes an earlier one instead of editing it. Dated amendment
and note lines inside an ADR record facts that moved (2026-10-10 tidy).

On 2026-10-15 (late night) the owner moved the site to two pages, Home and Record, with one shared
token set (brief log, last two sections). On 2026-10-17 the new Home became the site root and the Record
moved onto the new token set (review row S38); ADR-0019 records the routing. The ADRs marked "superseded
by the two-page direction" below describe the retired four-page site and do not guide new work.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-stack.md) | Astro static site on GitHub Pages | accepted; items 6–7 amended 2026-10-10 |
| [0002](0002-content-first-world-second.md) | The HTML content layer is the site; the world enhances it | accepted by practice 2026-10-10 (owner to confirm) |
| [0003](0003-direction-d-quiet-type.md) | Direction D: quiet type and one living object | accepted; per-page worlds shelved 2026-10-10; to be reviewed in the new ADR (the two-page direction asks for full fluid motion and a generous aura; quiet type holds) |
| [0004](0004-branches.md) | Work on dev; main holds only owner-approved releases | accepted |
| [0005](0005-objects.md) | One object per tab, scripted in Blender, lit to the render's standard | **superseded by the two-page direction (2026-10-15); a new ADR follows**; before that, item 1 accepted by practice and items 2–3 superseded by 0006 |
| [0006](0006-pre-rendered-objects.md) | Objects are pre-rendered Cycles frames; real time is only glue | accepted; real-time 3D on desktop declined 2026-10-11 (option a); item 5 (the droplet between tabs) **superseded by the two-page direction (2026-10-15); a new ADR follows** |
| [0007](0007-routing.md) | Every tab is a page; the browser navigates, and only the project sheet is scripted (a short melt overlaps the navigation) | **superseded by [0019](0019-two-page-routing.md)** (2026-10-17; the two-page direction of 2026-10-15) |
| [0008](0008-id-card-and-postcard.md) | The About ID card and the postcard are CSS 3D objects with a small spring loop | accepted 2026-10-10; amended 2026-10-10 and 2026-10-11 (postcards now spread through About); the owner kept the postcard on 2026-10-15; holds under the two-page direction (the cards move to Home) |
| [0009](0009-live-frames.md) | Live frames: one frame engine and one light, behind `?live` (would have amended 0006 items 4, 6) | rejected 2026-10-15 by the owner (pre-rendered kept, option a); code removed |
| [0010](0010-work-sections.md) | Work is one screen-tall section per project; one stage each, only the one in view moves | **superseded by the two-page direction (2026-10-15); a new ADR follows** |
| [0011](0011-scroll-rail.md) | The contents ladder replaces the native scrollbar where a page has sections | look chosen (concept B); items 3, 5, 7, 11 superseded by 0013; the dash look by its 2026-10-10 amendment |
| [0012](0012-embassies.md) | Embassies: the project view enters the product's world through world.json, the kit's light and real captures | **superseded by the two-page direction (2026-10-15); a new ADR follows**; `world.json` and `npm run worlds` stay as data until then |
| [0013](0013-one-rail-everywhere.md) | One rail on every page and in the project sheet; the bar never moves; Istanbul's time in the bar | accepted; the beads chosen 2026-10-11 and `?rail` removed in `45c80a6`; no native bar anywhere; holds under the two-page direction (the sheet it names goes with 0007) |
| [0014](0014-work-chapters.md) | Work shows each product's real screens in a platform frame, stepped in a pinned chapter; a line-up opens the page | **superseded by the two-page direction (2026-10-15); a new ADR follows**; the real screens stay as content |
| 0015 | One measured system: type scale, shared edges, spacing rhythm, screen frames, touch targets | reverted with the Home round 2026-10-11 (`956cb6f`); text at `1ad060e`; **to be re-done in the new token set** (2026-10-15, two-page direction): do not re-apply the old text or its numbers. The number stays taken |
| [0016](0016-graphite-and-the-palette-gate.md) | Graphite is the one live theme; every house pairing passes `npm run palette:gate` in verify and CI; a real Newsreader italic | theme accepted 2026-10-15 night (owner, round 2); technique decided; holds under the two-page direction (the new token set keeps the Graphite colours and the gate) |
| [0017](0017-one-scroll-source.md) | One scroll source and clock on the two-page Home; the desktop wheel smoothed by an own lerp (0.1 per frame), touch and inner scrollers native; every scroll-linked value reads it | technique decided 2026-10-16 (round two of `/lab/one/`) |
| [0018](0018-objects-on-home.md) | Objects on the two-page Home: the recorder is the Record's emblem above the Home strip, its tape becomes the spine; line twins of the objects come next | **proposed** 2026-10-16 (round three of `/lab/one/`); technique decided, the direction waits for the owner (spec v3 §13 questions 3 and 4) |
| [0019](0019-two-page-routing.md) | Two pages, Home (`/`) and the Record (`/record/`); a project opens over Home and keeps its address `/work/<slug>/`; `/work/`, `/about/` and `/lab/one/` redirect; the Record moves onto the new token set in its own language | accepted (technique) 2026-10-17; replaces 0007; the owner asked for the promotion (review row S38) |
