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
  the deploy, research archive). Round 2 in progress: retired Record objects to `media/archive/`.

## Route

Each phase is a set of tracks; each track moves through the stations of WORKFLOW §2. At most two
build tracks at a time.

| Phase | Track | Station | Next check |
|---|---|---|---|
| 0 Housekeeping | branches: `main` + `dev` only | waiting on the owner | the owner deletes `claude/portfolio-site-design-n38jml` on GitHub (the proxy refuses deletes here) |
| 0 | commit authorship: owner as author, Claude as co-author | future commits done; past commits wait on Q1 | Q1 |
| 0 | retired objects to `media/archive/` | build | merge after verify |
| 0 | `?live` engine and ADR-0009 | waiting on Q4 | Q4 |
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

## Open questions for the owner (2026-10-15 batch)

Put to the owner as numbered questions with Turkish briefs (board artifact and chat):

1. Rewrite past commits to the owner's name (dev only; `main` is untouched; hashes change; other
   sessions must re-sync).
2. Contribution graph: GitHub counts commits only on the default branch (`main`): make `dev` the default
   branch, or the owner merges `dev` into `main` regularly.
3. Remove the never-used metro photos and the second cat photo from the repo (and, with Q1, from
   history).
4. Retire the `?live` engine (ADR-0009 rejected).
5. A LICENSE: code open (MIT), photos, renders and text all rights reserved.
6. The reference reports' 64 third-party screenshots (4 MB) into the public repo, so agents can see the
   references.
7. Agent pace: keep two at a time, or more in research and review stations.
8. Proposed CLAUDE.md changes (listed on the board): approve, change or drop each.
9. Reporting: a short chat summary at each milestone plus a board for decisions; anything else?

Older, still open: Recto logo (Penpot, Dengeli as one candidate); Eat Map screens, colours and mark
(Family / Eat Map chat); English Prep improvements; the first `main` release; ADR-0010 and ADR-0012
look checks.

## Later

- Hand-written and school work in its own lighter format.
- A Turkish locale; a custom domain (`edk.dev` or similar); research on hosting and open-sourcing
  AI-built projects.
- 2.5D photo, once the owner picks a photo that suits it.
