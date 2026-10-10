# Plan

The one live plan, written from the owner's 2026-10-10 direction (the clean restart, brief
"Current intent"). It replaces `ROADMAP.md` and the round plans, which are in `docs/history/`.
Update a track's status when it moves; when a round closes, copy this file to `docs/history/`
and start a fresh one.

## Where we are (2026-10-10)

v0 is live from `dev`: Home, Work with embassies, About with the ID card, the Record (sample
entries only), pre-rendered objects, the contents-ladder rail on pages with sections, CI and
`npm run verify`. The owner liked none of the recent Home/About designs and asked for a clean
start: a fresh situation analysis, corrected docs, an evaluation board and regular reports.
Every track below is reviewed for its purpose, its reason and a designer's discipline.

## Tracks

| # | Track | What the owner asked (brief, 2026-10-10) | Status |
|---|---|---|---|
| 1 | Home as brand and vision | keep the simple layout; present a product, an identity, a brand, the vision; flashier, not busier | open |
| 2 | About as a mini CV | the ID card with written descriptions under it; detailed, CV-style; quieter than now | open |
| 3 | One scrollbar everywhere | one custom scrollbar on every page and in the project sheet; no native bar left (ADR-0011 revision first) | open |
| 4 | Istanbul + clock | bring the detail back (`content/site.json` already has `about.kicker` "About · Istanbul") | open |
| 5 | ID card calmer | keep it playable; damp extreme input so it no longer goes wild | open |
| 6 | edk object bug | find and fix where it glitches and looks unclean | open |
| 7 | Object stutter and real-time 3D | measure the pre-rendered stutter vs a real-time desktop tier; report the performance difference to the owner, who decides (ADR-0006 under review) | open: study first |
| 8 | Record object redesign | try H2 (the recorder) again or a tape/cassette player | open |
| 9 | Photo placement | high-resolution derivatives only; one cat photo, never both; About first, Home possible | open |
| 10 | Screenshots and logos | app captures and app logos (or 3D logos) beside the objects, once the apps are presentable in their own chats | open: waits on the app chats |
| 11 | Copy and slogans | improve wording | open: last |
| 12 | Phone pass | after desktop settles; phones must not break meanwhile | open: after desktop |
| 13 | Sample Record entries | note, entry, release, essay for testing, tagged `sample`, `SAMPLES=0` drops them | done 2026-10-10 |
| 14 | Docs clean-up | brief consolidated, plans archived, ADR statuses corrected | done 2026-10-10 |

## How work flows

- Start with a few agents at a time. Build agents work in their own worktree on a local
  `wip/<topic>` branch; the lead reviews screenshots, runs `npm run verify`, merges into `dev`
  and pushes (which deploys).
- Evaluation board: each track is judged against the owner's words above, with screenshots at
  the three CLAUDE.md sizes, before it is shown to the owner.
- Regular reports to the owner: short, plain, in Turkish, ending with what could not be
  verified (real Safari, real iPhone, GPU timings).
- Taste goes to the owner as short option lists; technique is decided and recorded in ADRs.

## Open questions for the owner

- "Mini CV": a CV-style About only, or also a downloadable document?
- Real-time 3D on desktop: decided after the track 7 report.
- Record object: H2 again or a tape/cassette player (shown as options).
- Look checks on ADR-0010 (Work sections) and ADR-0012 (embassies), still proposed.
- ADR-0002 (content first) and ADR-0009 (`?live`): accept, or leave parked behind track 7.
- Eat Map's real colour values and mark from Xcode (Family/Eat Map chat).
- Recto logo: references and sketches (Penpot, Dengeli as one candidate).

## Later

- First real Record entries (why this site, the two-track education, the university, the
  projects); the sample entries go when they arrive.
- Hand-written and school work in its own lighter format.
- A Turkish locale; a custom domain (`edk.dev` or similar); research on hosting and
  open-sourcing AI-built projects.
- 2.5D photo, once the owner picks a photo that suits it.
