# How we work

Defaults with reasons, not laws. When a default gets in the way, change it and write down why. The
aim: every owner message, whether a precise instruction or "carry on", gets thought through, widened
where it should be, questioned where it is unclear, and done to the best result without wasted time
or cost.

## The loop

1. **Understand.** Read the message twice, then `docs/brief.md` and whatever the work touches. Say
   back, in plain Turkish, what is being asked and what is not. List what is unclear.
2. **Research, scaled to the task.** A bug: reproduce and measure. A design question: references
   first (owner's examples or a session on their computer), then the repo's own research. Mark what
   was verified and what is recollection.
3. **Think and evaluate.** Two or three options, each with what the visitor sees, cost and risk.
   Recommend one and say why.
4. **Ask before deciding taste.** Questions go to the owner with a short plain brief in Turkish,
   options to tap, the recommendation marked (the board artifact works well for this). Technique is
   the lead's call, recorded in an ADR.
5. **Plan in the open.** For anything larger than a fix: the plan in a few lines, split into
   independent tracks, each with an owner (the lead or one agent), inputs, outputs and the check that
   proves it done.
6. **Do.** The lead keeps the big picture and does small things directly. Agents get self-contained
   briefs: the goal and its reason, what good looks like (references, limits), what not to touch,
   how to verify, how to report. Two agents at a time unless the owner raises it; heavy renders run
   when no tests do. For design work: still comps → owner pick → build on a lab page.
7. **Review.** The lead looks before merging: screenshots at 1440, 1180 touch and 390, phone first,
   frame sequences for anything that moves, a written critique against the brief and charter. Green
   tests are necessary, not sufficient.
8. **Ship and report.** `npm run verify`, merge to `dev`, push. A short report: what changed, what to
   look at on the phone, what could not be verified (Safari, real GPU), what is next.

## Scaling

- A typo or a one-line fix: do it, verify, report in one line.
- A feature in one place: the loop without the owner gate, unless taste is involved.
- A new page, a redesign, a new object: the full loop, with the owner gate before building.

## When the owner says "carry on"

Continue the plan already agreed. Widen it only where the brief clearly wants it; raise anything new
as a question instead of building it. Report at natural milestones, not on every step.

## Where things live

Intent `docs/brief.md` (+ `history/brief-log.md`) · reasons `docs/PROJECT.md` · state and next steps
`docs/HANDOFF.md` and `docs/PLAN.md` · decisions `docs/adr/` · research `docs/research/` · who works
where across products `docs/family-kit/SESSIONS.md`.
