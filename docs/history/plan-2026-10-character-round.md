# Plan: the character round (2026-10-09, evening)

Status: closed 2026-10-10. Replaced by the clean restart; the live plan is
[`docs/PLAN.md`](../PLAN.md). References below to `ROADMAP.md` are to a file since removed.

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
| A | Readability research + Record redesign proposal | research | `research/2026-10-readability.md` | done |
| B | Product-family research (how makers keep a shared origin) | research | `research/2026-10-product-family.md` | done |
| C | Family audit: DNA of Recto, English Prep, Eat Map, portfolio, objects | research | `research/2026-10-family-audit.md` | done |
| D | Liveliness: methods, constraints, proofs; recommendation to the owner | research + proofs | `research/2026-10-liveliness.md` | done |
| E | Page worlds: what a controlled "separate world" means; concepts + mood boards | research | `research/2026-10-page-worlds.md` | done |
| F | Custom scroll rail: research, 3–4 concepts, prototype page | design | `research/2026-10-scroll-rail.md` | done |
| G | Chrome: Log → Record (`/record/`), coloured "edk." dot, lit animated tabs, sheet overflow bug | build (`wip/chrome`) | site | done |
| H | Home showcase vs Work catalog | build (`wip/showcase`) | site | done |
| I | About digital ID card + reusable postcard | build (`wip/idcard`) | site | done |
| J | Object fixes: shadow layer, log LED and rings, edk lean, budgets | render | `media/objects/` | done |
| K | Synthesis: family vision document (after B + C), panel review | design | `design/family.md` | done |
| L | Record redesign build | build | site | done |
| M | Live frame engine behind `?live` (ADR-0009 proposed) | build | site | done; owner A/B |
| N | Rail build: concept B, the contents ladder (ADR-0011) | build (`wip/rail`) | site | done |
| O | Page-world prototype, only if the owner approves (after E) | prototype | — | after E |
| Q | Work as one tall section per project (ADR-0010) | build | site | done |
| R | Home product plate + wordmarks | build | site | done |
| S | Record object: C2 in production (H2 as alternative) | render | `media/objects/record/` | done; owner tests |
| T | Recto logo: new search in Penpot, Dengeli as a candidate | design | — | needs owner references |
| U | Family kit (`docs/family-kit/`) and app handoffs with session prompts (English Prep, Recto) | design | kit + app branches | done |
| V | Embassies in project views (ADR-0012) | build | site | done |
| W | Fix: presses during an arriving page transition | build | site | done |
| P | Phone pass | build | site | after desktop settles |

## How work flows

- Research agents write only their report. Build agents work in their own worktree on a local
  `wip/<topic>` branch; the lead reviews screenshots, runs `npm run verify`, merges into `dev`
  and pushes (which deploys).
- Taste goes to the owner as short option lists; technique is decided and recorded in ADRs.
- Every report ends with what could not be verified (real Safari, real iPhone, GPU timings).

## Open questions for the owner

- `?live` A/B on a real desktop: make it the default?
- Record object: keep C2 or switch to H2 after seeing it live.
- Credits line wording (kit options) and whether the outlined mark may be used.
- Eat Map's real colour values and mark from Xcode.
- Recto logo: references and sketches; Penpot connector at claude.ai/customize/connectors.
- "One house, four rooms" prototype: when.

## Notes for later

- 2.5D About photo (two hand-cut layers or a depth map); wait for a photo the owner picks.
- A more personal home object may be tried later (never a processor).
- iPhone checks once phones are in scope: ground seam, Low Power Mode, loop seam, stability.
