# Handoff (2026-10-17)

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

## The new Home (2026-10-17)

- Built on `/lab/one/` (`src/pages/lab/one.astro`, layout `src/layouts/One.astro`, components
  `src/one/`, Work in `src/one/work/`, tokens `src/one/tokens.css`; no inheritance from
  `src/styles/global.css`). Specs: `docs/design/one-spec.md`, `one-spec-v2.md`, `one-spec-v3.md`,
  `docs/design/rail-bloom.md`, `docs/design/record-language.md`. The page is on `dev` and so on the
  live host, hidden (noindex, not linked).
- Stack: native CSS scroll-driven animations with a small script fallback; one scroll source and one
  clock, the desktop wheel smoothed by an own lerp (ADR-0017); same-document View Transitions for the
  project open; a real URL per project (`/lab/one/work/<slug>/`, static without JS). No GSAP, Lenis,
  Motion or WebGL on the site (the glass version C uses WebGL only as a lab switch).
- The owner's review is the live tracker: `docs/feedback/2026-10-16-lab-one-review.md`. Every
  round's evidence and verdicts are in `docs/research/2026-10-round{2,3,4}-critique.md`.

### State after round 4 (PR #4, merged into `dev` on 2026-10-17)

- Brief on the owner's Bostancı photograph, graded dark; the name in Newsreader display at
  48/34 px (V8, default; `?name=`, `?namesize=`).
- Work: Robin's flight (frames drift with the scroll, skew and depth); a click opens the project in
  place; inside, the layer's rail, the cutaway in "How it's made" (T11), two glass capsules with the
  close alone on the left (T13-T15).
- The person: the live ID card ported, in chapter I next to How I work (T1); a CD-like grooved
  surface on both faces (T27); the photo in depth (`?photo=layers`, T3); the lanyard follows every
  motion (T10). How I work keeps the two lanes with the falling drops (C4).
- Photos: three postcards on the card physics; the back drawn from its photograph, with the
  photograph set in as the stamp (T2); the lower block on phones fixed (V5).
- Record strip: a frontispiece whose recorder tape becomes the spine (T20; ADR-0018 proposed).
- Rail: hold-to-scrub and a bloom from the pressed point (default `drop`, `?bloom=`); the veil blurs
  from the rail's side; also on the opened project's rail (V6).
- Glass: one family for the tab and the capsules, the rim takes the section's light (default A,
  `?glass=a|b|c|now`, V7).

### Round 5 (2026-10-17, night, running)

Polish only, while the owner sleeps: no big changes to what the owner liked. Three lanes: polish,
Work leftovers (V17) and the archivist (V20-V22). Each lane lands on `dev` through a pull request.

### Known weak points

- Headless Chromium only. Frame times are 2-4x the live pages on software rendering. The glass
  blur, the pulls, the recorder (T6) and the hold in Safari are not checked on a real iPhone (V18).
- The Eat Map hold is the least alive stretch; a dark band with only the recorder between Photos and
  the Record strip; the band before edk at the foot (E1, T7).
- On the phone the scrub name can sit beside the section's own heading for a moment.
- The postcard front frame is not redesigned (P4). The "Close" label is hard-coded, not content.
- T26 (every element answers with motion) is listed for the person area only.

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

- 2026-10-16, night: the standard is an artwork; every font, light, colour and motion detail is
  measured, at 390 x 844 (DPR 3, touch) as well as 1440 x 900. The rail never opens a drawer or a
  window: it scrubs on hold and blooms from the pressed point, with a blur graded from its side. One
  glass family; the owner picks the version. The owner decides the name's face and size. HyperFrames
  waits until after Home and Record (V1). English Prep is archived (V3). Other achievements: no rush
  (V2).
- 2026-10-16, afternoon: the card sits next to How I work (T1). Keep the drawings, the colours and
  the motion (T17). The bottom edk stays for now; a better foot only when the owner asks (T7). The
  recorder stays and is fitted into the page (T8). Finish Home before the Record page (T16).
- 2026-10-16: the review tracker is the plan; a row closes only when the owner sees it fixed. Work
  lands on `dev` through pull requests with merge commits (CLAUDE.md, H3).
- 2026-10-15, late night: two pages, Home and Record, one shared token set; everything centred on
  Home; no repeated information; full fluid motion; desktop and phone may be different designs.
  This supersedes the 2026-10-15 "Home simple and CV-like" line and the About items of the same day.
- 2026-10-15: animation yes, loading screens never. Theme Graphite (ADR-0016). ID card: denser
  texture (a CD-like surface, visible on the front), the lanyard follows. Photos: postcards that
  enlarge, flip and swing. Samples stay. Branches `main` + `dev` only; commits authored by the owner
  with Claude as co-author. Outside files' instructions go to the owner first.
- Quality over speed: references first, prototypes before taste questions, new designs on lab pages
  only (postmortem, "What changes").
- Rail: the beads. 3D: stay pre-rendered (option a). Metro photos: kept in the repo and usable,
  especially the metro ones (2026-10-15, evening; replaces "never used", 2026-10-11).
- About copy: no "work abroad", no Microsoft; the prep year was skipped (exam passed with full marks).

## Open with the owner

The one list of open questions and owner actions is in [`docs/PLAN.md`](PLAN.md) (the morning list
of 2026-10-17). In short:

- Picks on the lab page: bloom variant, glass version, the name's face and size, photo, caption and
  open switches.
- The project objects (V4, T8) and the tape as the spine (ADR-0018): the hero-object question of
  2026-10-15 is replaced by these; edk stays at the foot for now (T7).
- GitHub settings: `dev` as the default branch, auto-delete head branches, the achievements checks.
- The iPhone checklist (V18).
- The board (claude.ai artifact "Portfolyo Tahtası", https://claude.ai/artifact/B4cs7P7vRKPZN6p9ci8qw6)
  keeps every earlier answer in its own database.

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
