# Plan

The one live plan and the one list of open questions for the owner. Update a line when it moves;
when a round closes, copy this file to `docs/history/` and start a fresh one. Closed plans:
[`docs/history/`](history/README.md). How work moves through the stations named below:
[`docs/WORKFLOW.md`](WORKFLOW.md).

## Where we are (2026-10-15)

- The reference study is done and digested
  ([`docs/research/2026-10-reference-research.md`](research/2026-10-reference-research.md)); the owner
  answered the first round of questions on 2026-10-15 (brief log, same date).
- Home is the pre-round version; ADR-0015 (measured type and screens) waits to be re-applied.
- Live and kept: Work direction A with frames, About with the ID card and postcards, the Record with
  samples and the cassette recorder, the beads rail, pre-rendered objects.
- Repo clean-up round 1 is on `dev` (docs truth, samples out of feed and sitemap, dead weight, CI gates
  the deploy, research archive). Round 2: the retired Record objects (microphone, card file) moved
  to `media/archive/` with a README of why, 2026-10-15.

## Route

Each phase is a set of tracks; each track moves through the stations of WORKFLOW §2. At most two
build tracks at a time.

| Phase | Track | Station | Next check |
|---|---|---|---|
| 0 Housekeeping | branches: `main` + `dev` only | waiting on the owner | the owner deletes `claude/portfolio-site-design-n38jml` on GitHub (the proxy refuses deletes here) |
| 0 | commit authorship: owner as author, Claude as signed committer | done 2026-10-15: past commits rewritten (trees and dates kept), cited hashes remapped | the owner sets `dev` as the default branch on GitHub |
| 0 | licenses: MIT for code, content all rights reserved | done 2026-10-15 | |
| 0 | research figures in `docs/research/references/img/` | done 2026-10-15 | |
| 0 | CLAUDE.md: the approved rules of 2026-10-15 | done 2026-10-15 | |
| 0 | test S18 in `nav.spec.ts` failed once under full-suite load (passed 12 of 12 alone) | open | make it robust or explain it |
| 0 | retired objects to `media/archive/` | done 2026-10-15 | |
| 0 | `?live` engine and ADR-0009 | done 2026-10-15: engine removed, ADR-0009 rejected | |
| 1 Foundations | design charter (`docs/design/charter.md`): limits per width, type scale, motion language (sequenced reveals, no loaders) | research done, plan | the owner reads a one-page Turkish summary |
| 1 | colour system: measured palette for every pairing; soft grounds; theme study (refined dark, light, hybrid, a few colour themes) shown with the real objects and renders | research | comps of themes with objects, owner gate 1 |
| 1 | measuring tools: a palette checker (WCAG 2 and APCA) and a page probe against the charter | plan | tools run in `npm run verify` |
| 2 Home | Home planned strip by strip, top to bottom: what each strip says, how it is shown, where it links; the object decided inside the plan | plan | an outline and copy draft from the owner's facts, then comps |
| 2 | re-apply ADR-0015 to the chosen Home | waiting on Home | |
| 3 About | structure: keep "How I work", rework "who I am / where I study / photos", tidier writing like Home, light and aura back on the ground | waiting on Phase 1 | comps |
| 3 | ID card: denser surface texture on both faces; the lanyard follows the card in mouse-follow mode | plan | lab page |
| 3 | photo prototype: postcard v2 (designed back and frame), click to enlarge, flip and swing there, at most a slight depth, a faster burn-in; replaces the `?photos` concepts | plan | lab page, owner gate 2 |
| 4 Work | presentation pages: promise line, stepped real screens, chapters; the shared-element transition from card to project (the long version may be tried) | waiting | comps |
| 5 Content | first real Record entries; the monthly "now" line; copy pass | waiting on the owner's notes | |
| 6 Polish | phone and desktop pass, performance, accessibility, budgets | continuous | |
| always | clean-up station (WORKFLOW §5) at each round's end | | journal report |

## Open questions for the owner

The 2026-10-15 batch is answered (brief log, 2026-10-15, evening). Owner actions left:

- Set `dev` as the default branch on GitHub (Settings, Default branch).
- Delete the remote branch `claude/portfolio-site-design-n38jml` (Branches page); the proxy refuses
  deletes from here.
- Any other session or clone of this repo (Family chat, the owner's computer): re-sync to the
  rewritten `dev` (`git fetch && git reset --hard origin/dev` on a clean tree).

Older, still open: Recto logo (Penpot, Dengeli as one candidate); Eat Map screens, colours and mark
(Family / Eat Map chat); English Prep improvements; the first `main` release; ADR-0010 and ADR-0012
look checks.

## Later

- Hand-written and school work in its own lighter format.
- A Turkish locale; a custom domain (`edk.dev` or similar); research on hosting and open-sourcing
  AI-built projects.
- 2.5D photo, once the owner picks a photo that suits it.
