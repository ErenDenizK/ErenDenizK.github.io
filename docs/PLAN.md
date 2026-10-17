# Plan

The one live plan and the one list of open questions for the owner. Update a line when it moves;
when a round closes, copy this file to `docs/history/` and start a fresh one. Closed plans:
[`docs/history/`](history/README.md). How work moves through the stations named below:
[`docs/WORKFLOW.md`](WORKFLOW.md).

## Where we are (2026-10-17)

- **The new Home is on `/lab/one/`** (hidden lab page, live on `dev` since PR #2). The live four-page
  site is unchanged until the owner approves the new Home. Work lands on `dev` through pull requests
  (CLAUDE.md).
- **The owner's review** of 2026-10-16 is the live tracker:
  [`docs/feedback/2026-10-16-lab-one-review.md`](feedback/2026-10-16-lab-one-review.md). Its Status
  column now uses open, partly, in work, built, closed, deferred, superseded, merged and waiting for
  the owner (row V20).
- **Round 2 done** (2026-10-16, PR #2): Robin's flight for Work, the live ID card ported, the Record
  strip, postcards on the card physics. 19 rows built, 13 partly
  (`docs/research/2026-10-round2-critique.md`).
- **Round 3 done** (2026-10-16, PR #3): the card in chapter I next to How I work (T1), the postcard
  back drawn from its photograph (T2), the photo in depth (T3), the lanyard on every motion (T10), the
  cutaway in "How it's made" (T11), two glass capsules and one exit language (T13-T15), the Record
  strip as a frontispiece whose tape becomes the spine (T20), the no-repeat test (T23)
  (`docs/research/2026-10-round3-critique.md`, ADR-0018 proposed).
- **Round 4 done** (2026-10-16, night; PR #4, 2026-10-17): the rail's hold-to-scrub and bloom
  (default `drop`) replace the panel (V6); one glass family (default A, V7); the name in Newsreader
  display at 48/34 px (V8); the postcard back on phones (V5); the CD-like card surface (T27); the
  achievements check (V2); coverage pass two (V10, rows V11-V26)
  (`docs/research/2026-10-round4-critique.md`, `docs/research/2026-10-coverage-pass-two.md`).
- **Round 5 running** (2026-10-17, night, while the owner sleeps): fix, finish and polish; no big
  changes to what the owner liked (drawings, colours, animations, glass, the card's place, the
  bloom `drop`). Lanes: polish (`wip/r5-polish`), Work leftovers (`wip/r5-work`) and the archivist
  (`wip/r5-docs`: rows V20-V22).
- Only headless Chromium has checked the motion so far. The iPhone check (V18) is owed by the owner.
- Live and kept on the four-page site: Work direction A with frames, About with the ID card and
  postcards, the Record with samples and the cassette recorder, the beads rail, pre-rendered objects.

## Route

Each phase is a set of tracks; each track moves through the stations of WORKFLOW §2. At most two
build tracks at a time.

| Phase | Track | Station | Next check |
|---|---|---|---|
| **A Two pages** | the new Home on `/lab/one/` (brief on the Bostancı plate, Work as frames in Robin's flight that open in place into Dia/Notion-style presentations, the person, photos as postcards, now, Record strip, contact); spec `docs/design/one-spec.md` | rounds 1-4 built 2026-10-16; round 5 (polish) running 2026-10-17 | the owner's morning picks (below) and the iPhone checklist (V18) |
| A | performance on real hardware | open: headless frame times are 2–4× heavier than the live pages (software GPU here) | the owner's iPhone; then trim layers if it stutters |
| A | review tracker rows (G, M, W, O, C, P, R, E, T, V) | rows partly or open move each round; V17 lists the unowned leftovers | each round's critique |
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
| 3 About | structure: keep "How I work", rework "who I am / where I study / photos", tidier writing like Home, light and aura back on the ground | superseded by the two-page Home (the person's part on `/lab/one/`) | |
| 3 | ID card: denser surface texture on both faces; the lanyard follows the card in mouse-follow mode | moved to the tracker (T10, T27: built on `/lab/one/`) | owner |
| 3 | photo prototype: postcard v2 (designed back and frame), click to enlarge, flip and swing there, at most a slight depth, a faster burn-in | moved to the tracker (P2-P5, T2, V5, V13, V24); the front frame (P4) is still open | owner |
| 4 Work | presentation pages: promise line, stepped real screens, chapters; the shared-element transition from card to project (the long version may be tried) | waiting | comps |
| 5 Content | first real Record entries; the monthly "now" line; copy pass | waiting on the owner's notes | |
| 6 Polish | phone and desktop pass, performance, accessibility, budgets | continuous | |
| always | clean-up station (WORKFLOW §5) at each round's end | | journal report |

## Open questions for the owner

### The morning list (2026-10-17)

The lead sends each question in Turkish with a short plain brief, a picture and a lab link (row
V16). The lab page is `https://erendenizk.github.io/lab/one/` (live on `dev`, not linked).

1. Rail bloom: `?bloom=drop` (default), `palm` or `fan`. Judge by feel: the press point gives, then
   opens outward (V6, V14). The chosen rail also goes to the opened project's rail.
2. Glass: `?glass=a` (default), `b`, `c` or `now` (today's glass). The lead keeps A as the default
   (V15); the owner may overrule.
3. The name: `?name=nr` (Newsreader display, default), `current`, `playfair` or `fraunces`; and the
   size, `?namesize=48` (default, 34 px on phones) or `60`; 48/34 is provisional (V25).
4. The project objects (V4, T8, ADR-0018 question 4): come back as line drawings, or stay off Home?
   Explained with pictures.
5. The tape as the Record's spine (ADR-0018 question 3): right?
6. The card photo: `?photo=layers` (default) or `flat` (T3).
7. Captions: `?cap=large` (default: only in the enlarged view) or `line` (one line under the photo).
8. The open's timing: `?open=900` (default) or `1400` ms.
9. The postcard back's lower text on phones: did "açılmış" mean spread out or washed out (V13)? A
   before and after picture goes with it.
10. The metro photograph: one dictated line for its back, or the signature alone?
11. ADR-0017 (one scroll source) and ADR-0018 (objects on Home): accept?

Answers owed in the same report: every turn of the session ran on the main model (V11);
HyperFrames renders HTML compositions to video files, so it fits the later per-app video round,
not the page (V12).

### Owner actions

- Set `dev` as the default branch on GitHub (Settings, Default branch). Commits on `dev` count on
  the profile only then.
- Turn on "Automatically delete head branches" (Settings, General, Pull Requests).
- Achievements (V2, `docs/research/2026-10-github-achievements.md`): check that PR #2 was opened by
  "ErenDenizK", not an app; that "Show Achievements" and "Include private contributions" are on;
  then wait until 2026-10-18 before looking for another cause.
- The five-minute iPhone checklist (V18): the recorder with and without `?spin=0`, the glass blur,
  both pulls, the rope on the first swing, the scroll feel. The results update T6, T10, T13, T15,
  M1 and M2.
- Delete the remote branch `claude/portfolio-site-design-n38jml` (Branches page); the proxy refuses
  deletes from here.
- Any other session or clone of this repo (Family chat, the owner's computer): re-sync to `dev`.

Older, still open: Recto logo (Penpot, Dengeli as one candidate); Eat Map screens, colours and mark
(Family / Eat Map chat); the first `main` release; ADR-0010 and ADR-0012 look checks (four-page
site only).

## Later

- Hand-written and school work in its own lighter format.
- A Turkish locale; a custom domain (`edk.dev` or similar); research on hosting and open-sourcing
  AI-built projects.
- (moved to round 3, row T3: the ID card photo in 2.5D)
