# The project, and why it is the way it is

A primer for anyone (person or agent) starting work on the portfolio. `docs/brief.md` says what the
owner wants; the ADRs say what was decided. This file says **why**, so a new session can extend a
decision instead of re-arguing it or undoing it by accident. Each reason names its source.

## What it is

Eren Deniz Kuyucaklıoğlu's (they/them) personal site at `erendenizk.github.io`. A first-year Computer
Engineering student at Yıldız Technical University in Istanbul who builds products by directing AI
agents and learns the fundamentals by hand. The site is the link they give an engineer or an
employer: **presentation first**, then **a public record** that shows steady work over four years.

## The decisions that shape everything, with their reasons

| Decision | Why | Source |
|---|---|---|
| Dark, quiet, minimal; colour arrives as light, never as paint | The owner's taste from the first round ("minimal, elegant, unique"); it lets each product's own colour carry meaning | brief; ADR-0003 |
| **Restraint over spectacle** | The rejected home round (2026-10-11): oversized type and effects read as "contrived, not professional". "Wow" here means craft and precision, not size | postmortem |
| Pages have jobs: Home presents the brand and vision, Work shows the products, About introduces the person, Record is the log | The owner found About drawing more attention than Home; each page needs one job | brief 2026-10-10 |
| Content is data (`content/`); a project or entry never needs code | The site must stay cheap to grow for four years | ADR-0002 |
| Glass objects are **pre-rendered** (Blender Cycles), not real-time 3D | Real-time glass looked like blue plastic in a side-by-side and costs GPU and battery; pre-rendered looks like the real thing | ADR-0006; research/2026-10-realtime-3d |
| Objects use a 1° pose grid, exact frames, whole device pixels | The "2.5D, blurry, stuttering" look came from blended 2° frames and sub-pixel scaling; measured and fixed | ADR-0006 amendments |
| Every effect has a still twin (reduced motion, no JS, no WebGL, phones) | Accessibility and robustness; a page must be complete without the effect | CLAUDE.md |
| One custom scrollbar (the beads) everywhere, never the native bar | Owner's request; a consistent element of identity | ADR-0013 |
| Real screenshots in platform frames on Work; the products keep their own wordmarks and colours | "Three objects don't show what the apps are"; each product keeps its character | ADR-0014; family kit |
| The apps share an origin but are never flattened into one style | The owner: each keeps its differences and meets the others at a common point | docs/design/family.md |
| `dev` deploys; only the owner merges into `main` | The owner publishes from the development branch and releases by hand; same rule in every repo | ADR-0004; family-kit/SESSIONS.md |
| Facts come from the owner only; drafts are marked; no invented achievements | The site is evidence; one invented claim costs its credibility | brief; log-entry skill |
| No email, no strangers' faces, photo metadata stripped | Privacy (KVKK and plain decency) | brief |

## What is live (2026-10-11)

Home (the pre-round version), Work with real screens, About as a letter with postcards, the Record
with sample entries and the cassette-recorder object, the beads rail, sharp objects with phone spin
loops, the ID card with its entrance, the Istanbul clock. Open: Home's new direction and hero object,
the photo presentation, the measured type system (to re-apply), real content. See `docs/HANDOFF.md`.

## What we learned (not rules; reasons)

- **Taste needs references.** Words like "wow" or "premium" mean nothing to an agent until they are
  tied to pages the owner likes and limits we can measure. This environment cannot browse outside
  sites; references come from the owner or from a session on the owner's computer.
- **Show still frames before building.** A wrong direction found in a sketch costs minutes; found in
  shipped code it costs a day and the owner's trust.
- **Green tests are not quality.** Tests prove structure; the lead still has to look, phone first.
- **The owner's iPhone is the truth for Safari.** Headless Chromium misses what breaks there.
- **Measure before arguing.** The blur, the stutter, the 3D choice and the layout bugs were all
  settled by measurement, and those were the rounds that went well.
- **Fewer, better agents.** Parallel builders produced volume; one focused lead with a clear brief
  produced the work the owner kept.

## Glossary

Words the docs use without defining them.

| Term | Meaning | Where |
|---|---|---|
| **Embassy** | A project view that enters the product's own world (its ground, light, colours and real screens) inside the portfolio's frame | ADR-0012 |
| **`world.json`** | A product's world as data (`content/projects/<slug>/world.json`), following the family kit's `world.schema.json`; `npm run worlds` checks it | ADR-0012 |
| **Droplet** | The shared glass droplet every object melts into and out of when the tab changes, so one clip per object covers every pair | ADR-0006 item 5, ADR-0007 |
| **Lean grid** | The pre-rendered stills an object leans through as the pointer or the phone moves (33 yaw × 3 pitch at 1°) | ADR-0006 |
| **The beads** | The one custom scrollbar on every page and in the project sheet, from the owner's sketch | ADR-0013 |
| **Lab page** | A hidden workbench under `src/pages/lab/` (noindex, not linked, out of the sitemap); new designs go there before they replace a live page | ADR-0008; postmortem |
| **`?live`** | A URL switch that turns on the live-frame engine (ADR-0009, proposed); off by default, its fate is with the owner | ADR-0009 |
| **The board** | The claude.ai artifact "Portfolyo Tahtası", where the owner answers questions; it keeps every answer in its own database | `docs/HANDOFF.md` |
| **The department** | The separate session on the owner's computer that collected and measured the reference study (2026-10-12..14); it reports, the portfolio decides | `docs/research/2026-10-reference-research.md` |
