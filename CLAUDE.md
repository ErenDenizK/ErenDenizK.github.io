# Working on the portfolio

Eren Deniz K's personal site at `erendenizk.github.io`: presentation first, a public record
of continuous work, grown level by level over four years. Read `docs/brief.md` before any
work; it is the owner's intent and every decision cites it.

## Where things are

- `docs/brief.md`: what the owner wants. `docs/ROADMAP.md`: what is next.
- `docs/adr/`: decisions. Proposed ones are not binding until the owner accepts.
- `docs/research/`: dated research; it distinguishes verified facts from recollection.
  `2026-10-requirements.md` is what the site must contain and why.
- The site: `content/` (data), `src/` (Astro), `tests/`; how to run it and add content: `README.md`.

## Rules

- Work on `dev`. Never push to or merge into `main` (ADR-0004). Pushes to `dev` deploy the
  live site: run `npm run verify` before every push, and never push work in progress to `dev`.
  Agents work in their own git worktree outside the repo folder (for example under the
  session scratchpad) on a local `wip/<topic>` branch; the lead reviews and merges into `dev`.
- English for the site, docs and commits. The owner talks in Turkish, often by dictation:
  read through transcription errors and confirm names.
- Conventional Commits, lower-case subject, header at most 100 chars. Use the commit trailers
  the session gives you. Never write an AI model name into code, comments or docs.
- Content is data: a project or log entry never needs a code change (ADR-0002).
- Every effect has a still twin: reduced motion, no WebGL and phones get a complete page.
- Ask the owner about taste; decide technique yourself and record it in an ADR.
- For UI work, screenshot at 1440×900, 1180×820 (touch) and 390×844 and look before you
  report. Desktop comes first for now; phones still must not break.
- Never write symbols (arrows, ticks, crosses) as characters: use `tools/icons`. Objects are
  pre-rendered media (ADR-0006); the routing contract is ADR-0007.

## Log entries

The owner dictates raw notes (often Turkish). Write the entry in English in their voice,
keep their facts and claims exactly, ask before inventing detail, and show the draft before
publishing. Strip names and places of private people. Avoid the AI tells listed in
`docs/research/2026-10-requirements.md` §18.
