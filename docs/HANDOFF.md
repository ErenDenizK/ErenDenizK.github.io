# Handoff (2026-10-11)

Start here in a fresh session, after CLAUDE.md, `docs/brief.md`, `docs/PROJECT.md` (the reasons)
and `docs/WORKFLOW.md` (how we work).

## State of the live site (`dev`)

- **Home:** reverted to the pre-round version (edk glass beside the name, product plate, now/latest).
  Home A and Home B were rejected (`docs/research/2026-10-quality-postmortem.md`). The owner liked
  B's *structure* (compact, focused) but not its design. B's code is in history (merge 7d33e48),
  A's in b107e51; neither is live.
- **Reverted with Home:** the measured type and screen system (ADR-0015, merge 6d26667, reverted in
  0f4a33a; the ADR text is at 16136f3). It was not
  rejected; it was undone only because it was built on Home A. Re-apply it to the restored Home
  (revert the revert of 6d26667 and resolve the Home parts) once Home's direction is set.
- **Kept:** Work (ADR-0014, real screens in frames), About (letter with postcards; photo concepts
  behind `?photos=1|2|3`, which the owner calls gimmicks), Record (samples, cassette recorder),
  the beads rail everywhere (ADR-0013), sharp objects at 1° with phone spin loops, ID card entrance,
  Istanbul clock, the phone layout sweep test.

## Decisions to respect (newest first; full log in `docs/history/brief-log.md`)

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
