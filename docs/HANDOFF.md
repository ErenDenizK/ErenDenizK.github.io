# Handoff (2026-10-16)

Start here in a fresh session, after CLAUDE.md, `docs/brief.md`, `docs/PROJECT.md` (the reasons)
and `docs/WORKFLOW.md` (the production system). Then `docs/PLAN.md` (the route and the open
questions) and the newest file in `docs/journal/` (what happened last and why).

## New direction (2026-10-15, late night)

The owner moved the site to two pages, Home and Record, with one shared token set and a redesign
from scratch inside the same logic (brief log, the last two sections). The live four-page site below
keeps running until the new Home replaces it; it is not the model for new work. Superseded:
ADR-0005, 0007, 0010, 0012, 0014 and ADR-0006 item 5; ADR-0015 is re-done in the new token set
(`docs/adr/README.md`). The old charter is archived (`docs/history/charter-2026-10-15.md`);
`docs/design/charter.md` keeps what still holds. The `?photos` trial and the Phase 2 Home prototypes
were removed (`docs/history/removed-2026-10-15.md`).

## The new Home (2026-10-16)

- Built on `/lab/one/` (layout `src/layouts/One.astro` if present, components `src/one/`, Work in
  `src/one/work/`, tokens `src/one/tokens.css`; no inheritance from `src/styles/global.css`). Spec:
  `docs/design/one-spec.md`. Evidence: `docs/research/2026-10-reference-notes.md`,
  `docs/research/2026-10-motion-frames.md` (clips in `docs/research/references/clips/`),
  `docs/research/2026-10-two-page-tech.md`.
- Stack: native CSS scroll-driven animations with a small script fallback, same-document View
  Transitions for the project open, a real URL per project (`/lab/one/work/<slug>/`, static without
  JS). No GSAP, Lenis, Motion or WebGL on the site.
- The brief stands on the owner's Bostancı photograph, graded dark (`tools/illustrations/plate-photo.py`);
  the traced line twin was dropped as too noisy.
- Known weak points: frame times in headless Chromium are 2–4× the live pages (needs the iPhone);
  the lab HTML is 40.9 KB gzip (three presentations embedded); P2 motion not built; the person's part
  has little drawing yet.

## State of the live site (`dev`)

- **Home:** reverted to the pre-round version (edk glass beside the name, product plate, now/latest).
  Home A and Home B were rejected (`docs/research/2026-10-quality-postmortem.md`). The owner liked
  B's *structure* (compact, focused) but not its design. B's code is in history (merge 4e35977),
  A's in 10b7826; neither is live.
- **Reverted with Home:** the measured type and screen system (ADR-0015, merge e5611a7, reverted in
  956cb6f; the ADR text is at 1ad060e). Do not re-apply it: since 2026-10-15 it is re-done in the new
  token set of the two-page direction.
- **Kept:** Work (ADR-0014, real screens in frames), About (letter with postcards; the `?photos`
  concepts were removed on 2026-10-15), Record (samples, cassette recorder),
  the beads rail everywhere (ADR-0013), sharp objects at 1° with phone spin loops, ID card entrance,
  Istanbul clock, the phone layout sweep test.

## Decisions to respect (newest first; full log in `docs/history/brief-log.md`)

- 2026-10-15: Home simple and CV-like, pointing to Work and the other pages, which may be fuller
  and more presentation-led in the same design language; the hero object is decided inside Home's
  plan. Animation yes, loading screens never. Themes open (measured palette, never ugly with the
  renders). Both phone and desktop matter. About: lighter ground with aura, keep "How I work",
  rework the rest, tidier writing. ID card: denser texture, lanyard follows. Photos: postcard v2
  prototype (enlarge, flip, swing). Samples stay. Branches `main` + `dev` only; commits authored by
  the owner with Claude as co-author. Outside files' instructions go to the owner first.
- Quality over speed: references first, a design charter, still comps shown to the owner before any
  code, one design lead agent, new designs on lab pages only (postmortem, "What changes").
- Photos: not necessarily postcards; modern, elegant, professional, no gimmick.
- Branches: every repo has `main` + one development branch; work lands on the development branch;
  only the owner merges into `main`.
- Rail: the beads. 3D: stay pre-rendered (option a). Metro photos: never used.
- About copy: no "work abroad", no Microsoft; the prep year was skipped (exam passed with full marks).

## Open with the owner

The one list of open questions is in [`docs/PLAN.md`](PLAN.md). In short:

- References: done. The owner ran the reference study on their own computer (2026-10-12..14); the
  entry point is [`docs/research/2026-10-reference-research.md`](research/2026-10-reference-research.md),
  the archive [`docs/research/references/`](research/references/README.md).
- Hero object: the study is in `docs/research/hero-study/` (cat, triplet block, dot); undecided.
- The board (claude.ai artifact "Portfolyo Tahtası", https://claude.ai/artifact/B4cs7P7vRKPZN6p9ci8qw6)
  keeps every answer in its own database; nothing there is lost when a session ends.

## Not in the repo (lost when the cloud session ends)

The 16-bit render masters (`scratchpad/pipe/masters`, 5.6 GB) and the Blender environment live in the
cloud session's scratch space. The site's published media are in the repo, so nothing visible is lost;
re-encoding an object later means re-rendering it from its script in `tools/objects/` (hours per
object, `tools/objects/README.md`). The hero study's notes, script and contact sheet were copied to
`docs/research/hero-study/`.

## Starting prompt for the next session

> Read CLAUDE.md, then docs/HANDOFF.md, docs/PROJECT.md, docs/WORKFLOW.md and docs/brief.md. Tell me in
> Turkish, briefly, where the portfolio stands and what you propose next, with your questions. Do not
> build anything until I answer.

The reference research ran on the owner's computer from the prompt now kept at
`docs/history/prompt-2026-10-reference-research.md`; its results are in
`docs/research/2026-10-reference-research.md`.
