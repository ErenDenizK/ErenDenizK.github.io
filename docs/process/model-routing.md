# Model routing for the agent line

**Status:** decided by the lead with the owner's brief, 2026-10-17; applies from round 7. Inputs: the
owner's routing report (2026-10-17, Opus 5.5 vs Sonnet 5.5 vs Haiku 5.5; vendor and independent
numbers) and six rounds of this project's own agent line. The owner's fixed rule: only 5.5 models.

## The rule

Opus decides the "what" and judges taste; Sonnet does the "how" from a settled spec; Haiku reads and
reports. Effort is `medium` everywhere unless a measured gain says otherwise; never `xhigh` or `max`.

| Station in WORKFLOW §2.1 | Model | Why, for this project |
|---|---|---|
| Lead (the main session) | Opus 5.5 | Judgment, the owner's taste, merges, final say. |
| Art director, design lead, engravers, art reviewer | Opus 5.5 | The engravings and compositions are the owner's top priority; creative, open-ended work is where Opus leads and where Sonnet may spend more tokens than Opus. |
| Frame-by-frame critic and integrator | Opus 5.5 | Review quality (more defects found, fewer false alarms) and risky merges across lanes. |
| Studies that decide (first screen, project stories, bug root causes, objects) | Opus 5.5 | Ambiguous problems; their mistakes multiply downstream. |
| Builders with a settled spec (rail, glass motion, card fixes, recorder fix, Work features, Record page build) | Sonnet 5.5 | Same pass rate as Opus on scoped work at about half the cost and faster. The spec, the file ownership and the critic carry the judgment. |
| Archivist, doc truth, tracker statuses, journal | Sonnet 5.5 | Scoped writing against clear rules. |
| Coverage passes and long reads of the transcript | Sonnet 5.5 | Large inputs exceed Haiku's 100K price step; needs care, not judgment. |
| Inventories, "where is X", file and asset lists, reading test or CI logs | Haiku 5.5 | Read-only, narrow, short reports; stay under 100K tokens. |

## Guards

- **Scope:** Sonnet was measured writing outside its folder more often than Opus. Every builder prompt
  names the files it owns; the Opus integrator checks `git diff --stat` per lane against that list and
  rejects stray edits.
- **Escalation:** a Sonnet builder that hits an unclear decision stops and reports; the lead or an Opus
  agent decides; the builder does not guess.
- **Briefs:** short and self-contained (objective, files in scope, files out of scope, output, done
  condition). Large handovers burn usage.
- **No mid-run switches:** a stage keeps its model; switching invalidates the cache.

## Measurement

Each round records, per agent: model, effort, tokens and duration (the workflow's usage report), and
the critic's defects found in that lane's work. `docs/process/agent-metrics.md` keeps the table. After
two rounds the lead compares Sonnet and Opus lanes on comparable tasks (defects per lane, rework,
cost) and moves the line where the numbers say so.

## Refactoring (the owner's question, 2026-10-17)

The lead's view: no large refactor while Home and Record still change every round, because moving
code under active features breaks them. Instead: (1) each lane may tidy the files it owns when it is
already changing them; (2) dead code goes at every clean-up station; (3) one consolidation pass
(shared tokens, duplicated scripts, the lab-era names) runs once Home and Record are stable and before
the optimisation round, with the owner's go. The lead raises it when that moment comes.
