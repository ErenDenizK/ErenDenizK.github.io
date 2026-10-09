# Architecture decision records

One file per decision, numbered, never renumbered. Status is `proposed` until the owner
accepts it; a later ADR supersedes an earlier one instead of editing it.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-stack.md) | Astro static site on GitHub Pages | accepted |
| [0002](0002-content-first-world-second.md) | The HTML content layer is the site; the world enhances it | proposed |
| [0003](0003-direction-d-quiet-type.md) | Direction D: quiet type and one living object | accepted |
| [0004](0004-branches.md) | Work on dev; main holds only owner-approved releases | accepted |
| [0005](0005-objects.md) | One object per tab, scripted in Blender, lit to the render's standard | proposed |
| [0006](0006-pre-rendered-objects.md) | Objects are pre-rendered Cycles frames; real time is only glue | accepted |
| [0007](0007-routing.md) | Every tab is a page; the browser navigates, and only the project sheet is scripted (a short melt overlaps the navigation) | accepted |
| [0008](0008-id-card-and-postcard.md) | The About ID card and the postcard are CSS 3D objects with a small spring loop | proposed (look); technique decided |
| [0009](0009-live-frames.md) | Live frames: one frame engine and one light, behind `?live` (amends 0006 items 4, 6) | proposed |
