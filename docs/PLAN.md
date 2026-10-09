# Plan: the character round (2026-10-09, evening)

The lead's working plan. The previous round (craft: type, objects, icons, v0) is archived in
`plan-2026-10-craft-round.md`. `ROADMAP.md` stays the level view.

## Where we are

v0 is built (Astro, pre-rendered objects, tests, CI) and deploys from `dev`. The owner's verdict
after seeing it: the craft is right but the site lost E's **life** on desktop, repeats projects
on two pages, reads flat (every page black, the Record hard to read), and the apps, the
portfolio and the objects do not yet feel like one maker's work (brief §7, latest amendment).

## Direction

1. **Life before polish.** Desktop must feel alive again: response to the pointer, light that
   reacts, objects that move between states, no dead frames. The method is open (live 3D,
   richer rendered animation, relighting, a mix); phones should gain from it too.
2. **One origin, many characters.** Each app keeps its own UI, motion and colour; all meet at a
   shared origin the portfolio makes visible. Never flatten Recto's or English Prep's UI.
3. **Reading is a feature.** The Record must be easy and pleasant to read, through type,
   structure, colour and writing craft, not decoration.
4. **Controlled variety.** Each page gets its own light; any "separate world" idea is studied
   and shown before anything is built.

## Workstreams

| # | Track | Kind | Output | Status |
|---|---|---|---|---|
| A | Readability research + Record redesign proposal | research | `research/2026-10-readability.md` | running |
| B | Product-family research (how makers keep a shared origin) | research | `research/2026-10-product-family.md` | running |
| C | Family audit: DNA of Recto, English Prep, Eat Map, portfolio, objects | research | `research/2026-10-family-audit.md` | running |
| D | Liveliness: methods, constraints, proofs; recommendation to the owner | research + proofs | `research/2026-10-liveliness.md` | running |
| E | Page worlds: what a controlled "separate world" means; concepts + mood boards | research | `research/2026-10-page-worlds.md` | running |
| F | Custom scroll rail: research, 3–4 concepts, prototype page | design | `research/2026-10-scroll-rail.md` | running |
| G | Chrome: Log → Record (`/record/`), coloured "edk." dot, lit animated tabs, sheet overflow bug | build (`wip/chrome`) | site | running |
| H | Home showcase vs Work catalog | build (`wip/showcase`) | site | running |
| I | About digital ID card + reusable postcard | build (`wip/idcard`) | site | running |
| J | Object fixes: shadow layer, log LED and rings, edk lean, budgets | render | `media/objects/` | running |
| K | Synthesis: family vision document (after B + C), panel review | design | `design/family.md` | after B, C |
| L | Record redesign build (after A) | build | site | after A |
| M | Liveliness build (after D and the owner's choice) | build | site, ADR | after D |
| N | Rail build (after F and the owner's choice) | build | site | after F |
| O | Page-world prototype, only if the owner approves (after E) | prototype | — | after E |
| P | Phone pass | build | site | after desktop settles |

## How work flows

- Research agents write only their report. Build agents work in their own worktree on a local
  `wip/<topic>` branch; the lead reviews screenshots, runs `npm run verify`, merges into `dev`
  and pushes (which deploys).
- Taste goes to the owner as short option lists; technique is decided and recorded in ADRs.
- Every report ends with what could not be verified (real Safari, real iPhone, GPU timings).

## Open questions for the owner (asked as options when the evidence is ready)

- Liveliness architecture (after D).
- Family vision: which shared-origin strategy (after K).
- Page worlds: prototype one or not (after E).
- Rail concept (after F).
- Record redesign (after A and L's mock).

## Notes for later

- 2.5D About photo (two hand-cut layers or a depth map); wait for a photo the owner picks.
- A more personal home object may be tried later (never a processor).
- iPhone checks once phones are in scope: ground seam, Low Power Mode, loop seam, stability.
