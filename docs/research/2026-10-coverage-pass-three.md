# Coverage audit, pass three (row S37), 2026-10-17

Read-only. Sources: the session transcript (every owner message since 2026-10-15, extracted with
`python3 -I`; tool results, agent hand-backs and pasted skill text skipped), the tracker
`docs/feedback/2026-10-16-lab-one-review.md` (rows G..S50), `docs/history/brief-log.md` (last
sections), `docs/brief.md`, `docs/PLAN.md`, `docs/HANDOFF.md`, `docs/journal/2026-10-17.md`,
`docs/research/2026-10-coverage-pass-two.md`, `docs/research/2026-10-feature-parity.md`, the round-6
lane briefs in this scratchpad (`engraving-guide.md`, `first-screen.md`, `project-story.md`) and the
code of `/lab/one/` where a claim needed a check.

## Owner messages read

| # | Time (UTC) | Topic | This pass |
|---|---|---|---|
| A | 10-15 10:19 | repo, authorship, Home, themes, postcards, ID card, About, clean-up | re-read |
| B | 10-15 11:03 | decision board 1 | re-read |
| C | 10-15 11:36 | ASD-STE100 | re-read |
| D | 10-15 17:12 | decision board 2 | re-read |
| E | 10-15 21:05 | two pages | re-read |
| F | 10-15 21:21 | line, frames, clean-up, "cylinder" | re-read |
| G | 10-16 09:15 | review of `/lab/one/` | re-read |
| H | 10-16 17:59 | review of round 2 | re-read |
| I | 10-16 18:50 | model check | re-read (closed: V11) |
| J | 10-16 20:52 | answers and new points | re-read |
| K | 10-17 10:55 | morning-sheet answers and the long brief (S1-S45) | clause by clause |
| L | 10-17 11:23 | addition: mobile, swipe close, engravings in motion, performance, Davutpaşa, a question | clause by clause |

Classes: a = owned by an S row or a round-6 lane; b = done or a standing rule applied; c = noted only,
nothing acts on it; d = misread or changed in the tracker; ans = an answer to the owner is owed.

## Message K (10-17 morning), clauses not fully covered

| # | Clause (short) | Where | Class |
|---|---|---|---|
| K1 | Recorder white box: "Pre-renderlamadık mı acaba? Ya da fotoğraf olduğu için mi?" | S10 owns the fix; the question itself is not answered | ans |
| K2 | Rail answer 1: "senin fikrin nedir paylaş tartışalım değerlendirelim" | S1 holds the lead's view in the tracker only; the owner asked to discuss it | ans |
| K3 | Objects answer 4: only one picture (option 1) was in the sheet; "!!!!!!" | S4 and the objects-preview lane; the sheet defect itself has no fix | a (process gap) |
| K4 | Answer 8: the owner picked "açılış 900 ms", then said the long one "baya şıktı sanki" and saw no difference between the options | S8 sets 1400 ms as default and closes the row: this overrides the owner's explicit pick | d |
| K5 | Answer 8: "aradaki farkları anlamadım ve göremedim" | nowhere: the A/B options were not visible enough to judge | c (process) |
| K6 | "iPhone: dikte edeceğim promptta" | S9 open; message L says no extra mobile notes are coming | b (status stale) |
| K7 | Engravings: "iyi kontrol edilmesi, denetlenmesi lazım ... bunları ben de yapabilirim" | S24 has a reviewer; no owner checkpoint | c |
| K8 | Istanbul series: "İstanbul, Boğaz, Kızadası" | S34 and the engraving guide read "Maiden's Tower"; "Kızadası" may be Kız Kulesi or Kızıl Adalar (the Princes' Islands); not confirmed | d (possible) |
| K9 | Davutpaşa and Istanbul as "sayfaya konulabilecek teknik çizimler" | engraving guide 2.9/2.10 places them; 2.10 was written before message L and draws the gate, not the Orta Bahçe | a (guide stale vs S46) |
| K10 | Horizontal flow "silindir gibi canlı" | S31; message F (10-15) already said "silindir şekli dediğimde bu değildi" and pointed at the reference videos; no lane brief links the two | c |
| K11 | "Bana soruların varsa hepsini sor" | S44 asks only about drawing needs; no consolidated round-6 sheet | a-weak |
| K12 | "eski versiyonu ... ikinci planı atıp birinci ürün buymuş gibi" | S38; brief.md line 32 still says Home replaces the live pages "after the owner approves it", and there are no 2026-10-17 lines in brief.md | b (stale doc) |
| K13 | "Hiçbir şey baştan sağlam olmamalı" (read as "baştan savma": nothing sloppy) | S40 | b |
| K14 | "Projedeki dosyalarına kontrolünü yapmayı unutma ... Claude MD ... eski şeyler" | S45 | a |

All other clauses of K map to S1-S45 (checked one by one): S2-S7, S10-S36, S38-S43, S45.

## Message L (10-17 addition)

| # | Clause (short) | Where | Class |
|---|---|---|---|
| L1 | No extra mobile notes; the brief holds them | S9 not closed; V18 (iPhone checklist) not updated | b (status stale) |
| L2 | Swipe-to-close not noticed, catches | S47 | a |
| L3 | Engravings move and have layers: check them in motion | S48 | a |
| L4 | Performance: small steps at every stage; "arka planda denetlenebilir" | S49 decides the rule; nobody owns the per-round measurement | a-weak |
| L5 | "this prompt does not go before the others; information" | header of the S46-S50 table | b |
| L6 | Question: does sending a second prompt while Claude Code works disrupt the system or the multi-agent structure? | nowhere | ans |
| L7 | Davutpaşa: five photos, the Orta Bahçe is meant, aerial and facade views | S46; photos in `docs/research/references/davutpasa/` (five files present) | a |
| L8 | Likes the workflow; keep improving project and workflow | S50 | b |

L is not in `docs/history/brief-log.md` (the 10-17 entry covers only K).

## Earlier rounds: items open, partly or noted, not covered by S1-S45 or a round-6 lane

| Item | Source | State | Gap |
|---|---|---|---|
| About content on Home | A ("the long story stays here"), E (brief line 15: "all content stays; only the page system changes") | `/lab/one/` renders `about.card`, `selfie`, `postcard`, `colophon` and the chapters `photos`, `work`, `next`; it does not render `about.opening` or the chapters `who`, `study`, `school`, `products`, `links` | S38 retires `/about/` with a redirect: that text would leave the site. S42 (content later) does not allow losing it. |
| G5 token and rhythm audit "before the Record" | G | partly; the last audit is round 3 | S38 starts the Record page now, after round 6 changes the first screen, the engravings and the glass motion |
| G7/G8 parity matrix | G; V17 remainder | the matrix measures the lab at `003f160` (round 2); no plan/status column | not owned in round 6; the Record page has no parity list |
| T26/V17 top bar | G6 | "the top bar not yet listed" | S15 covers glass buttons; the name, clock and any non-glass control in the bar are not listed |
| A6 first-screen constraints | A (10-15) | brief | no loading screen, the visitor is never lost, never five buttons at once; the first-screen brief does not restate them |
| A8 sample records stay | A | brief | the Record page lane must keep them until the owner says |
| T4 owner GitHub settings | H ("bir sonraki boşlukta tekrar hatırlat") | PLAN, HANDOFF, journal 10-17 list them; tracker row "open" | the reminder must be in the next report |
| S20 "the moving ones are better than the fixed ones" | K | S48 reviews motion | no decision on which still engravings (postcard backs, bands) get layers |

## Stale tracker statuses

V4 open (answered by S4, S5); V9 "in work" (night over); V15 open (S2 chose A); V16 open (answered
10-17); V25 open (S3 chose the Newsreader display cut); S9 open (L1); H2 open (deferred with T24, V2);
V18 open (the owner's mobile findings came as S10, S35, S47 and S12/S49; the iPhone glass blur and the
scroll feel are still unchecked); V19 open (now tied to S47).

## Proposed rows (after S50)

| Id | Source | What it means for the work | Kind |
|---|---|---|---|
| S51 | K1 | Answer in Turkish with the S10 fix: the recorder is pre-rendered media (ADR-0006), not a live 3D model; say what caused the white box on the phone (the measured cause, not a guess) and that it was not a photo. | ans |
| S52 | L6 | Answer in Turkish: a message sent while the lead works waits until the lead's current step ends; running agents are not interrupted and their work is not lost. The only risk is a change of priority, which the owner already marks ("bilgi eklemesi"). Short addenda are fine. | ans |
| S53 | K2, S1 | Give the lead's view on S1 to the owner as asked ("tartışalım"): a frame strip at 390 and 1440 of the beads leaving the rail and becoming the markers, and the one open choice (bead travel path and timing). | ans |
| S54 | K4 | The owner picked 900 ms; S8 set 1400 ms. Put it back to the owner with a side-by-side clip (900 vs 1400, phone and desktop) and keep 900 ms until the owner says otherwise, or record that the lead chose 1400 ms and why. Reopen S8 until then. | owner question |
| S55 | K3, K5 | Question sheets: every option has its own picture or clip; differences must be visible at phone size (side by side, same frame); a second agent checks the sheet against its options before it is sent. | task (process) |
| S56 | K11, S44 | One round-6 question sheet in Turkish, with pictures: S54, S57, the metro line and station for the metro engraving (engraving guide), the Istanbul places list, the objects pick after S4's preview, S31 (horizontal or vertical) after the build, the first-screen options (S32), the Record scene (S27). | task |
| S57 | K8 | Confirm "Kızadası": Kız Kulesi (Maiden's Tower), Kızıl Adalar (the Princes' Islands), or both. The Istanbul series waits on the answer for that member only. | owner question |
| S58 | K9, S46 | Update engraving guide 2.10: the subject is the Orta Bahçe (rectangular barracks around a tree-lined courtyard, from the five photos), not the gate; re-place it if the courtyard needs a wider band than "behind the ID card". | task |
| S59 | K7 | Owner checkpoint for the engravings: a still sheet and a motion strip per engraving at 390 and 1440, sent before it merges into `dev`, because the owner offered to check details. | task |
| S60 | K10, F | The horizontal flow lane (S31) starts from the owner's earlier "cylinder" (message F: frames in a row, the paper grows into the project; "silindir şekli dediğimde bu değildi") and the Robin and Wodniack clips; say in the report whether the build matches that meaning. | note |
| S61 | A, E, S38 | Content parity before promotion: list every content field of the live `/`, `/about/`, `/work/` and project pages and where it lives on Home or Record. `about.opening` and the chapters who, study, school, products and links have no place on `/lab/one/` today. Place them (hidden is allowed only for unwritten text) or ask the owner; never drop content with a redirect. | task |
| S62 | G5 | Re-run the token, fill and rhythm audit on the round-6 page before the Record page build starts, and give the Record page the same numbers. | task |
| S63 | G7, G8, V17 | Refresh the parity matrix against today's lab: a status column for the 15 ranked features; a Record-page section from the references before that build. | task |
| S64 | T26, V17 | Finish the motion inventory for the top bar (name, clock, tab, any control) and the brief's links (S33); S15 covers glass buttons only. | task |
| S65 | A6 | Pass to the first-screen lane: no loading screen, the visitor is never lost, never five buttons at once on arrival; elements appear in order. | note |
| S66 | L4, S49 | A performance check in every integration: long frames and dropped frames at 390 (touch, 4x CPU throttle) and 1440 for the scroll, the bloom, the card, the project open and the photo view; a regression blocks the merge; small fixes go in the same round. | task |
| S67 | K12, L | Docs: brief.md "Current intent" lines for 2026-10-17 (lab one is the product and the owner approved promotion; S12 revised by S49; S26 refine, not replace; S40; S42; S43 the engravings; S39 pace); a brief-log entry for message L (S46-S50 and S52's question). | task |
| S68 | stale statuses | Close V4, V9, V15, V16, V25 and S9; H2 deferred; V18 reduced to the iPhone glass blur, the scroll feel and the recorder after S10; V19 joined to S47. | task |
| S69 | T4 | Remind the owner in the next report: `dev` as the default branch and "Automatically delete head branches" (still undone on 10-17; the badges depend on the first). | note |
| S70 | A8, R2 | The Record page lane keeps the sample records until the owner says, and the recorder object and its motion. | note |
| S71 | K (S20) | Decide which still engravings (postcard backs, ambient bands) get layered motion, because the owner prefers the moving ones; record the choice in the engraving guide. | task |

Counts: 12 messages read; message K: 14 clauses outside a clean S-row match (3 answers owed, 2 misread
or changed, 3 noted only); message L: 8 clauses (1 answer owed, 1 measurement unowned); earlier rounds:
8 gaps; stale statuses: 10 rows; 21 proposed rows (S51-S71).
