# Agent metrics

One row per agent per round, from round 7 (`docs/process/model-routing.md`). Rounds 1–6 ran every
agent on Opus 5.5; their totals are kept for comparison.

| Round | Agents | Model | Subagent tokens | Wall time | Notes |
|---|---|---|---|---|---|
| 1 (2026-10-15) | 7 | Opus 5.5 | 2.61 M | 3.3 h | first build of /lab/one/ |
| 2 (2026-10-16) | 8 | Opus 5.5 | 2.55 M | 3.2 h | owner review round 1 |
| 3 (2026-10-16) | 7 | Opus 5.5 | 2.07 M | 2.6 h | |
| 4 (2026-10-16/17) | 7 | Opus 5.5 | 0.65 M after a resume (first run lost to a restart) | 1.0 h | |
| 5 (2026-10-17) | 4 | Opus 5.5 | 0.21 M after a resume | 0.7 h | |

Per-agent columns from round 7: round, agent label, model, effort, tokens, minutes, critic defects
found in its work, rework needed (yes/no).
