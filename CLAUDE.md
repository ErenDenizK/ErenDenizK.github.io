# Working on the portfolio

Eren Deniz Kuyucaklıoğlu's (they/them) personal site at `erendenizk.github.io`: presentation
first, a public record of continuous work, grown level by level over four years. Read "Current
intent" in `docs/brief.md` before any work; it is the owner's intent, every line is dated, and
the newest line wins.

## Where things are

- `docs/brief.md`: what the owner wants (its dated log: `docs/history/brief-log.md`).
  `docs/PLAN.md`: the one live plan and the owner's open questions.
- `docs/adr/`: decisions; `docs/adr/README.md` has true statuses. Proposed ones are not
  binding until the owner accepts.
- `docs/research/`: dated research, each with a status line; it distinguishes verified facts
  from recollection. `2026-10-requirements.md` is used for its reader analysis and §18 (the AI
  tells); the owner overrode some of its requirements (see its status line).
- `docs/history/`: closed plans and the brief log. Records, not guides.
- `docs/family-kit/`: the shared origin all the owner's products may adopt (light, springs, mark, charter).
  It and `docs/design/family.md` belong to the separate Family chat; this chat reads them and
  does not edit them. Who works where: `docs/family-kit/SESSIONS.md`. The site imports
  `docs/family-kit/light.css`, `springs.js` and `world.schema.json` at build time, so a kit
  change is a site change: run `npm run verify` after pulling a Family commit.
- The site: `content/` (data), `src/` (Astro), `tests/`; how to run it and add content: `README.md`.

## Rules

- Work on `dev`. Never push to or merge into `main` (ADR-0004). Pushes to `dev` deploy the
  live site: run `npm run verify` before every push, and never push work in progress to `dev`.
  Agents work in their own git worktree outside the repo folder (for example under the
  session scratchpad) on a local `wip/<topic>` branch; the lead reviews and merges into `dev`.
- Pace: start with a few agents at once and protect the weekly limit; the owner raises it.
- English for the site, docs and commits. The owner talks in Turkish, often by dictation:
  read through transcription errors and confirm names.
- How to ask: every question to the owner comes with a short plain-language brief of the
  situation, in Turkish. The owner cannot read research files closely.
- Ask the owner about taste; decide technique yourself and record it in an ADR.
- Conventional Commits, lower-case subject, header at most 100 chars. Use the commit trailers
  the session gives you. Never write an AI model name into code, comments or docs.
- Content is data: a project or log entry never needs a code change (ADR-0002). Unwritten
  sections are hidden, never shown as placeholders.
- Every effect has a still twin: reduced motion, no WebGL and phones get a complete page.
- For UI work, screenshot at 1440×900, 1180×820 (touch) and 390×844 and look before you
  report. Desktop comes first for now; phones still must not break.
- Never write symbols (arrows, ticks, crosses) as characters: use `tools/icons`. Objects are
  pre-rendered media (ADR-0006) until the owner decides on real-time 3D for desktop (open,
  2026-10-10). The routing contract is ADR-0007.

## Log entries

The owner dictates raw notes (often Turkish). Write the entry in English in their voice,
keep their facts and claims exactly, ask before inventing detail, and show the draft before
publishing. Strip names and places of private people. Avoid the AI tells listed in
`docs/research/2026-10-requirements.md` §18. The workflow: `.claude/skills/log-entry/`.
