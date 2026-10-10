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
| [0006](0006-pre-rendered-objects.md) | Objects are pre-rendered Cycles frames; real time is only glue | accepted; under review 2026-10-10 (real-time 3D on desktop) |
| [0007](0007-routing.md) | Every tab is a page; the browser navigates, and only the project sheet is scripted (a short melt overlaps the navigation) | accepted; item 5 and `/log/` URLs superseded by `design/log.md` |
| [0008](0008-id-card-and-postcard.md) | The About ID card and the postcard are CSS 3D objects with a small spring loop | accepted 2026-10-10; item 7 (composition) open |
| [0009](0009-live-frames.md) | Live frames: one frame engine and one light, behind `?live` (amends 0006 items 4, 6) | proposed; parked until the real-time 3D decision |
| [0010](0010-work-sections.md) | Work is one screen-tall section per project; one stage each, only the one in view moves | proposed (look); technique decided |
| [0011](0011-scroll-rail.md) | The contents ladder replaces the native scrollbar where a page has sections | look chosen (concept B); revision pending 2026-10-10 (one scrollbar everywhere) |
| [0012](0012-embassies.md) | Embassies: the project view enters the product's world through world.json, the kit's light and real captures | proposed (look); technique decided |
