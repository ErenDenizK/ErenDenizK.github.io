# Plan

The one live plan and the one list of open questions for the owner. Update a line when it moves;
when a round closes, copy this file to `docs/history/` and start a fresh one. Closed plans:
[`docs/history/`](history/README.md). How work moves through the stations named below:
[`docs/WORKFLOW.md`](WORKFLOW.md).

## Where we are (2026-10-16)

- **The owner reviewed `/lab/one/`** (2026-10-16): every point is a row in
  [`docs/feedback/2026-10-16-lab-one-review.md`](feedback/2026-10-16-lab-one-review.md); round 2 works
  through it. Work now lands on `dev` through pull requests (CLAUDE.md).

- **The new Home is on `/lab/one/`** (2026-10-16): built by the two-page line; the live site is
  unchanged until the owner approves it.


- **New direction (late night):** two pages, Home and Record, one shared token set (brief log, last
  two sections). Phases 1 (charter row), 2, 3 (About structure) and 4 below were planned for the
  four-page site and are superseded; the lead writes the new route. Still useful from them: the ID
  card texture and lanyard, postcard v2, the palette gate, the content phase. The archivist's
  clean-up of 2026-10-15 removed the Home prototypes and the `?photos` trial
  (`docs/history/removed-2026-10-15.md`) and archived the charter (`docs/history/charter-2026-10-15.md`).

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
| **A Two pages** | the new Home on `/lab/one/` (brief on the Bostancı plate, Work as a deck of prints that opens in place into Dia/Notion-style presentations, the person, photos as postcards, now, Record strip, contact); spec `docs/design/one-spec.md` | built 2026-10-16 (two-page line, WORKFLOW §2.1); verify green | owner tries `/lab/one/` on the iPhone and desktop; switches `?open=900\|1400`, `?cap=line\|large`, `?still` |
| A | performance on real hardware | open: headless frame times are 2–4× heavier than the live pages (software GPU here) | the owner's iPhone; then trim layers if it stutters |
| A | P2 motion: tear in motion, index flight, pointer parallax, scroll-linked colour, `?work=drift` | plan | after the owner's first look |
| A | Record page in the new tokens; the tab between the two pages | plan | after Home is approved |
| A | ship: the new Home replaces `/`; `/work/`, `/about/` and project URLs redirect into Home; a new routing ADR replaces ADR-0007; tests rewritten | plan | owner approval |
| 0 Housekeeping | branches: `main` + `dev` only | waiting on the owner | the owner deletes `claude/portfolio-site-design-n38jml` on GitHub (the proxy refuses deletes here) |
| 0 | commit authorship: owner as author, Claude as signed committer | done 2026-10-15: past commits rewritten (trees and dates kept), cited hashes remapped | the owner sets `dev` as the default branch on GitHub |
| 0 | licenses: MIT for code, content all rights reserved | done 2026-10-15 | |
| 0 | research figures in `docs/research/references/img/` | done 2026-10-15 | |
| 0 | CLAUDE.md: the approved rules of 2026-10-15 | done 2026-10-15 | |
| 0 | test S18 in `nav.spec.ts` | done 2026-10-15: three timing races in the test fixed; 80 of 80 under heavy load | |
| 0 | retired objects to `media/archive/` | done 2026-10-15 | |
| 0 | `?live` engine and ADR-0009 | done 2026-10-15: engine removed, ADR-0009 rejected | |
| 1 Foundations | design charter (`docs/design/charter.md`) | archived 2026-10-15 (two-page direction); `docs/design/charter.md` keeps what holds | the new token set |
| 1 | colour system: Graphite chosen and live (ADR-0016); the house theme passes every floor | done 2026-10-15 | 3 product-world pairings left to the Family chat; OG cards still on #0a0a0b (re-render) |
| 1 | measuring tools: `npm run palette:gate` in verify and CI | done 2026-10-15 | a page probe against the charter |
| 2 Home | three prototypes on lab pages: `/lab/home-v1/` Index, `/lab/home-v2/` Strips, `/lab/home-v3/` Statement, with `?aura=` and `?col=` and object switches | superseded 2026-10-15 by the two-page direction; lab pages removed | |
| 2 | re-apply ADR-0015 to the chosen Home | superseded 2026-10-15: re-done in the new token set | |
| 3 About | structure: keep "How I work", rework "who I am / where I study / photos", tidier writing like Home, light and aura back on the ground | waiting on Phase 1 | comps |
| 3 | ID card: denser surface texture on both faces; the lanyard follows the card in mouse-follow mode | plan | lab page |
| 3 | photo prototype: postcard v2 (designed back and frame), click to enlarge, flip and swing there, at most a slight depth, a faster burn-in (`docs/history/code/photo-darkroom/`); the `?photos` concepts are removed | plan | lab page, owner gate 2 |
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
