# Prompt: reference research on the owner's computer

Status: done 2026-10-12..14 on the owner's computer; results in
[`docs/research/2026-10-reference-research.md`](../research/2026-10-reference-research.md) and
[`docs/research/references/`](../research/references/README.md). Kept as written. Step 4's file name
collides with the older `docs/research/2026-10-references.md`, so the results took the new name; the
branch `wip/references` of step 5 never reached origin.

Run this in a Claude session **on the owner's computer** (the Claude desktop app, or
`claude remote-control` in a terminal inside a clone of this repo), because cloud sessions cannot open
outside websites. It needs a browser the session can drive (the desktop app's built-in browser or
Claude in Chrome). Paste everything below the line.

---

You are collecting design references for the portfolio at erendenizk.github.io (repo
ErenDenizK/ErenDenizK.github.io, branch dev). Read CLAUDE.md, docs/PROJECT.md, docs/brief.md and
docs/research/2026-10-quality-postmortem.md first: the last home round failed because it was designed
without seeing any real reference and leaned on size and effects. The site's character: dark, quiet,
precise, premium, light as colour, pre-rendered glass objects; restraint over spectacle.

Goal: real evidence of how the best pages achieve "wow" through craft, for three questions: (1) the
home page of a personal brand, (2) presenting a handful of photographs beautifully and without
gimmicks, (3) presenting software products with real screens.

1. Visit 20-30 pages: award winners (Awwwards Site of the Day/Year, FWA, CSS Design Awards, Godly,
   Siteinspire), admired personal sites (e.g. Rauno Freiberg, Paco Coursey, Emil Kowalski, Brian
   Lovin, Bruno Simon, Dennis Snellenberg), product pages (Apple, Linear, Vercel, Raycast, Things,
   Teenage Engineering), photography sites and editorial photo essays. Skip any that need a login.
2. For each, at 1440×900 and at a phone size (390×844): a screenshot of the first screen and one or two
   more at telling scroll positions; a short screen recording or frame sequence of the first 3 seconds
   and of one interaction if the tools allow it. Save under docs/research/references/<site-name>/ as
   compressed .webp (≤ 300 KB each), no personal data.
3. Measure what you can: the largest type size and the body size in px, line length, how much of the
   first screen the hero fills, how long the arrival motion lasts, the number of colours on screen.
4. Write docs/research/2026-10-references.md: one row per site (link, what creates the impression in
   the first 3 seconds, the measurements, what fits our character and what does not), then the 8-10
   techniques that would fit this site, each with its source sites.
5. Commit on a branch `wip/references` (Conventional Commits, lower-case) and push that branch only.
   Never push to dev or main. Ask the owner which sites they personally like most at the end.
