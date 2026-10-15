# Architecture decision records

One file per decision, numbered, never renumbered. Status is `proposed` until the owner
accepts it; a later ADR supersedes an earlier one instead of editing it. Dated amendment
and note lines inside an ADR record facts that moved (2026-10-10 tidy).

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-stack.md) | Astro static site on GitHub Pages | accepted; items 6–7 amended 2026-10-10 |
| [0002](0002-content-first-world-second.md) | The HTML content layer is the site; the world enhances it | accepted by practice 2026-10-10 (owner to confirm) |
| [0003](0003-direction-d-quiet-type.md) | Direction D: quiet type and one living object | accepted; per-page worlds shelved 2026-10-10 |
| [0004](0004-branches.md) | Work on dev; main holds only owner-approved releases | accepted |
| [0005](0005-objects.md) | One object per tab, scripted in Blender, lit to the render's standard | item 1 accepted by practice; items 2–3 superseded by 0006 |
| [0006](0006-pre-rendered-objects.md) | Objects are pre-rendered Cycles frames; real time is only glue | accepted; real-time 3D on desktop declined 2026-10-11 (option a) |
| [0007](0007-routing.md) | Every tab is a page; the browser navigates, and only the project sheet is scripted (a short melt overlaps the navigation) | accepted; item 5 and `/log/` URLs superseded by `design/log.md` |
| [0008](0008-id-card-and-postcard.md) | The About ID card and the postcard are CSS 3D objects with a small spring loop | accepted 2026-10-10; amended 2026-10-10 and 2026-10-11 (postcards now spread through About); how photos are presented is reopened (owner, 2026-10-11 late: the postcard is not required) |
| [0009](0009-live-frames.md) | Live frames: one frame engine and one light, behind `?live` (amends 0006 items 4, 6) | proposed; parked until the real-time 3D decision; since 2026-10-11 `?live` lasts one page load and phones need `?live=force` |
| [0010](0010-work-sections.md) | Work is one screen-tall section per project; one stage each, only the one in view moves | proposed (look); technique decided; items 1 and 3 amended by 0014 |
| [0011](0011-scroll-rail.md) | The contents ladder replaces the native scrollbar where a page has sections | look chosen (concept B); items 3, 5, 7, 11 superseded by 0013; the dash look by its 2026-10-10 amendment |
| [0012](0012-embassies.md) | Embassies: the project view enters the product's world through world.json, the kit's light and real captures | proposed (look); technique decided |
| [0013](0013-one-rail-everywhere.md) | One rail on every page and in the project sheet; the bar never moves; Istanbul's time in the bar | accepted; the beads chosen 2026-10-11 and `?rail` removed in `01d8412`; no native bar anywhere |
| [0014](0014-work-chapters.md) | Work shows each product's real screens in a platform frame, stepped in a pinned chapter; a line-up opens the page | accepted 2026-10-11 (direction A, frames kept) |
| 0015 | One measured system: type scale, shared edges, spacing rhythm, screen frames, touch targets | reverted with the Home round 2026-10-11 (`0f4a33a`); text at `16136f3`; to be re-applied after Home's direction. The number stays taken |
