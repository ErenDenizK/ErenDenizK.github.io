# Coverage audit, pass two (row V10), 2026-10-16 night

Read-only. Sources: the session transcript (owner messages since 2026-10-15, extracted with python3 -I;
tool results, agent hand-backs, stop-hook text and pasted skill text skipped), `docs/feedback/2026-10-16-lab-one-review.md`,
`docs/history/brief-log.md`, `docs/brief.md`, `CLAUDE.md`, `docs/PLAN.md`, `docs/HANDOFF.md`,
`docs/journal/2026-10-16.md`, `docs/research/2026-10-round3-critique.md`, the round-4 script
`one-round-4-wf_e77c42f5-f2a.js`, and pass one (`scratchpad/coverage-audit.md`).

## Owner messages since 2026-10-15

| # | Time (UTC) | Topic | Pass one | Pass two |
|---|---|---|---|---|
| A | 10-15 10:19 | repo, authorship, Home CV-like, themes, postcards/darkroom/proof/depth, ID card, clean-up, way of working | not checked | checked |
| B | 10-15 11:03 | decision board 1 answers | not checked | checked |
| C | 10-15 11:36 (short) | ASD-STE100: decide yourself | not checked | checked |
| D | 10-15 17:12 | decision board 2: aura/grain, Graphite, sizes, italic, captions | not checked | checked |
| E | 10-15 21:05 | two pages | checked | re-checked |
| F | 10-15 21:21 | line, frames, clean-up (sent twice) | checked | re-checked |
| G | 10-16 09:15 | review of /lab/one/ (G, M, W, O, C, P, R, E, H, X) | checked | re-checked |
| H | 10-16 17:59 | review of round 2 (T1-T21) | checked | re-checked |
| I | 10-16 18:50 | model check; re-read the last prompts; nothing left as a note only | not checked | checked |
| J | 10-16 20:52 | answers and new points (V1-V10) | not checked | checked |

Classes as in pass one: a = owned by round-4 work; a-weak = open, no round-4 lane owns it; b = done or a
standing rule that is applied; c = noted only, nothing acts on it; d = misread or distorted.

## Message J (night, V rows), clause by clause

| # | Clause (short) | Where | Class |
|---|---|---|---|
| J1 | HyperFrames: wait, use later, one round per app at the end | V1 | b |
| J2 | "is HyperFrames for in-page animation or for turning them into video? I do not know" | nowhere; V1 closes T22 without the answer | c |
| J3 | in-page animation goes well | V1 | b |
| J4 | other badges: no rush; current ones did not show although PRs were merged | V2; person lane writes `achievements-check.md` | a |
| J5 | English Prep archived, old commits pulled, no action | V3 | b |
| J6 | "Record şeridi" (transcribed "Record Shared"): may not be bad, tests in the morning | V4 | b (note) |
| J7 | project-objects idea not understood; will test | V4: "explain with pictures in the next report"; no lane or integrator step in the round-4 script makes those pictures | a-weak |
| J8 | postcard-back drawings look good | V5 | b |
| J9 | "alttaki yazı bir tık daha açılmış" | V5 reads "spreads"; "açılmış" can also mean "became lighter/washed out" | d (possible) |
| J10 | owner never tested on the computer, maybe a phone problem; measure on phones too | V5; CTX of every round-4 agent | a |
| J11 | owner is away until 9-10; work must not stop; budget exists | V9 | a |
| J12 | rail opened panel very ugly (judged from the screenshot, not tried) | V6; T9 still "built" | a (status stale) |
| J13 | plain rail at the right is good | V6 | a |
| J14 | rail needs two more parts: hold-to-drag ("belki") or a click menu that is a showcase | V6; rail lane builds both | a |
| J15 | never a separate drawer/window | V6 | a |
| J16 | water drop / closed palm: "hissiyat olarak" (as a feeling) | V6 omits "as a feeling"; the rail lane names variants `drop|palm|fan`, which invites literal shapes | d (risk) |
| J17 | gradual edge blur, not in a window; above all on phones | V6 | a |
| J18 | "the page may not have much text at that moment anyway" | not recorded | ctx |
| J19 | fonts, taps, motion: expert, artistic, masterpiece, measure everything | V6; CTX | a |
| J20 | new glass looks good | CTX "liked: the new glass" | b |
| J21 | same or different glass for tab and capsules? refraction? GPU? test several versions; "not something I can just say change" | V7 | a |
| J22 | (implied by J20 + J21 + "no big changes") keep the liked glass until a version is chosen | the round-4 script tells the glass lane to make the study's pick the default | d (process) |
| J23 | father found the name typeface cheap; owner disagrees; review all refs; evaluate yourself | V8; type study; type lane keeps today's default unless the study clearly says ship | a |
| J24 | some questions unanswered; will answer in the morning after testing the published page | no consolidated question sheet; "published" also implies a deploy of lab/one for testing | a-weak |
| J25 | if nothing is left: research small improvements, no big changes; else iterate the rail | V9 | a |
| J26 | re-check that nothing turned into a note was left; gather everything | V10 (this file) | a |

## Message I (evening)

| # | Clause | Where | Class |
|---|---|---|---|
| I1 | "my project shows the small model; did I send the last prompt on it by mistake? check which model the last sessions used" | never answered in chat. Transcript fact: every assistant turn since 2026-10-08 carries the same main-model id (2,000+ turns); no small-model turn exists in this session | c |
| I2 | re-read the last three prompts and my explanations; go over each, not only note | pass one covered four messages (E-H); A-D and I-J were not checked until now | b (with this pass) |
| I3 | work on many branches with agents | done (coverage agent) | b |

## Messages A-D (2026-10-15, not in pass one)

| # | Clause | Where | Class |
|---|---|---|---|
| A1 | only `main` and `dev` | brief, CLAUDE.md | b |
| A2 | all commits, past and future, in the owner's name, honest co-authorship | brief; H1 closed | b |
| A3 | Home simple, CV-like; other pages fuller | superseded by E (two pages); HANDOFF still lists it under "Decisions to respect" | b (stale doc) |
| A4 | home object: edk, a hero object or none; decide while planning | T7, T8; HANDOFF still says "hero object: undecided" (hero study) | b (stale doc) |
| A5 | theme button with 3-5 themes; measured palette, no pure black/white | brief; D chose Graphite | b |
| A6 | Work transition: try the long version; animation yes, loading screens never, visitor never lost, not five buttons at once | brief lines (2026-10-15) | b |
| A7 | manual updates; "now" section updated monthly by hand | brief; PLAN phase 5 | b |
| A8 | sample records stay until the owner says | brief line 179 | b |
| A9 | delete photo trials and the real-time engine; archive old objects, never lose them | removed-2026-10-15.md; media/archive | b |
| A10 | postcard: click, comes to a big view (Proof's growth), flip and swing there | brief; P2, P3 | b |
| A11 | postcard back looks cheap; wants graphic design on back and frame | P4 partly: the front frame not redesigned; no round-4 lane owns P4 | a-weak |
| A12 | darkroom burn-in nice but "too slow"; the small colour detail liked; the click caption ugly | burn-in exists in `Postcards.astro`; nobody checked its speed against "too slow" | c |
| A13 | Proof: nothing liked | not used | b |
| A14 | depth: only a slight, unbreakable depth in the enlarged view | brief; `.big-stage` perspective | b |
| A15 | ID card surface textured "like a CD surface", denser, visible on the front | brief line 60; T27 says only "denser"; the person lane prompt drops the CD/front wording | a (detail lost) |
| A16 | in mouse-follow the rope does not move | T10 built | b |
| A17 | ground too black, no aura, soulless; who-I-am/photos part empty | aura and drawings now; E1 partly | a-weak (E1) |
| A18 | consult the owner on hard limits in other files | CLAUDE.md, brief | b |
| A19 | wish: dictation in artifacts; "do not bother if it is a lot of work" | nowhere | c (low; note only) |
| A20 | regular clean-up, ADRs, CLAUDE.md review; ask before new rules | CLAUDE.md, WORKFLOW §5 | b |
| A21 | buttons, clock, scrollbar, fonts are good | brief; clock lives in `Bar.astro` | b |
| A22 | phone and desktop both matter | brief, CLAUDE.md; brief line 270 "Desktop first" (2026-10-09) still stands unannotated | b (stale line) |
| B3 | metro photos and the second cat stay; metro especially usable; more photos later | brief log; HANDOFF still says "Metro photos: never used" | b (stale doc) |
| B7-B9 | agent pace; CLAUDE.md rules; STE for docs | CLAUDE.md | b |
| C1 | ASD-STE100: weigh it, decide | CLAUDE.md (without the restricted dictionary) | b |
| D1 | aura + grain + noise are the concept; black ground stays | brief | b |
| D2 | Graphite; no white | brief, ADR-0016 | b |
| D3 | Home largest text 48 desktop / 34 phone, other pages 80/45 (no note: provisional) | brief log only; the type study (V8) is not told that the name's size is a provisional answer | c |
| D4 | real italic | tokens | b |
| D5 | captions: test one-line vs enlarged-only ("a or c") | `?cap=line|large` on lab; never put to the owner as a pick | a-weak (J24) |
| D6 | taste is never asked without something to look at | brief; relevant to J7 | b |

## Messages E-H: changes since pass one

- E7 "no windows that open and close" vs T9: the round-3 rail build became a full-height sheet on phones
  and a panel on desktop (critique T9). That contradicted E7 and the T9 wording ("instead of a small
  window"). The owner rejected it (J12). Class d for the round-3 build; V6 now owns it.
- Pass one's c items: T22 closed by V1; T23 built; T24 deferred by V2 (status still "open"); T25 closed by
  V3 (status still "open"); T26 and T27 owned only for the person area (see below).
- Pass one's a-weak rows G2, G3, G6, G7, G8, M1, M2, E1 plus G4/M5, G5, P4, R2: the tracker says they
  "must be owned by a lane in every round". In round 4 only the person lane touches them, and only
  inside `src/one/rest/`. Nobody owns: the Work-side grey prints after a rail jump (G2/G6), the 1.6-2 s
  wait between "Take a look" and the layer (G4/M5), the Eat Map hold of spec 9.2 (G5), the parity
  matrix's plan column (G7/G8), the postcard front frame (P4), the empty band before edk (E1),
  silent elements in Work, the opened project and the bar (T26 outside the person area), the
  hard-coded "Close" label (critique weak point 10, against "content is data").

## Rows marked built whose evidence is weak

| Row | Why weak |
|---|---|
| T9 | The owner rejected the panel (J12). It must not stay "built"; superseded by V6. |
| T6 | "Fixed in headless" only; the owner reported a phone render bug; the iPhone check of `?spin=0` is owed. |
| T15 | The owner's measure is people noticing the exit (they got stuck in real tests); evidence is frames only. |
| T13 | Headless often renders the text sharp behind the glass (the blur not drawn); glass not proven. |
| T10 | The owner's named case is the phone's first swing; the critique says that swing "itself is small". |
| T3 | Depth "subtle at rest, shows only in the lean"; the owner's complaint was flatness at rest; not seen by the owner. |
| T2 | Built, but V5 found the phone text fault the critique missed; phone measurements were not part of its evidence. |
| T20 | Spine drawn later than spec 8.2; right half of the rows bare at 1440 (critique weak point 6). |
| T8 | Study delivered, but the owner did not understand the options (J7); not accepted. |
| P2, P3 | Critique weak points 2 and 9: grey postcards after a jump; a press during the open can turn the card twice. "Catches" was the owner's word. |
| R1 | Superseded by T20 (the strip was redone); keep one row. |
| M3, M4, W2, O3 | Headless only (about 10 fps for blurred layers); M1/M2 stay partly; real hardware unchecked. |
| O2 | The layer's rail is a second rail; V6 changes the main rail only, so the two may drift apart. |

## Stale doc lines

- Review file: T22 and T25 "open" (closed by V1, V3); T24 "open" (deferred by V2); T9 "built" (rejected);
  the status vocabulary has no "partly", but the round-4 CTX and the critique use it for G2-G8, M1, M2,
  C2, P4, R2, E1, which the table shows as "open".
- Brief log: no entry for message I (10-16 evening) or J (10-16 night); V1-V10 exist only in the tracker.
- `docs/brief.md`: no 2026-10-16 lines for the card's place (T1), the rail bloom (no drawer or window,
  edge blur), one glass family, the masterpiece and measure-on-phone standard, HyperFrames deferred,
  English Prep archived; line 270 "Desktop first" (2026-10-09) not marked as superseded by 2026-10-15/16.
- `docs/PLAN.md`: "Where we are" stops at round 2 (round 3 merged as PR #3; round 4 running); "Home is
  the pre-round version; ADR-0015 waits to be re-applied" contradicts "superseded"; Phase 3 rows (ID card
  texture, photo prototype) duplicate T27/P rows and say "plan"; open questions miss the morning picks
  and still list "English Prep improvements" (archived, V3).
- `docs/HANDOFF.md`: no round 2-4 state; "Decisions to respect" leads with the superseded CV-like Home and
  About items; "Metro photos: never used" contradicts B3; "Hero object: undecided" superseded by T7/T8 and
  ADR-0018; "known weak points: P2 motion not built; little drawing" is out of date.
- `docs/journal/2026-10-16.md`: holds only the night of 10-15; rounds 2-3 and the owner's three 10-16
  messages are not journalled.
- CLAUDE.md: nothing wrong. A possible rule change (screenshot the phone at DPR 3, touch) needs the
  owner's comment first; propose, do not edit.

## Proposed new rows (for the tracker, after V10)

| Id | Source | What it means for the work | Kind |
|---|---|---|---|
| V11 | I1 | Answer the owner's model question in the morning report: every turn of this session ran on the same main model; no turn ran on the small one. | note (answer owed) |
| V12 | J2 | One-line answer: HyperFrames renders HTML compositions to video files; in-page motion stays CSS and scripts. So it fits the later per-app video round, not the page. | note (answer owed) |
| V13 | J9 | The postcard back's lower text on phones: check both readings of "açılmış" (spacing spread and colour washed out) at 390 DPR 3; show the before/after picture and ask which was meant. | task |
| V14 | J16, O2 | Judge the bloom variants by feel (the press point gives, then spreads wider; things open outwards), not by drawing a drop or a palm. Apply the chosen rail to the opened project's rail too, so there is one rail. | task |
| V15 | J20-J22 | Keep today's glass as the default until the owner picks; every version only as a `?glass=` switch. Same rule as the typeface. | decided (process) |
| V16 | J24, J7, D5 | One morning question sheet, Turkish, each with a picture and a lab link: rail variants, glass versions, name typefaces, project objects (V4, with drawings), tape-as-spine, `?photo=flat|layers`, `?cap=line|large`, `?open`, ADR-0017/0018. Make sure the lab page is reachable on the owner's phone ("published"). | task |
| V17 | G-rows rule | Give the unowned leftovers an owner this round (a small Work-leftovers lane or the integrator): Work grey prints after a jump, the 1.6-2 s open wait, the Eat Map hold (spec 9.2), the parity plan column, the postcard front frame, the band before edk, silent elements outside the person area, the "Close" label as content. | task |
| V18 | T6, T10, T13, T15, M1, M2 | A five-minute iPhone checklist for the owner (recorder `?spin`, glass blur, both pulls, rope on the first swing, scroll feel), with what "good" looks like; results update those rows. | task (owner) |
| V19 | T15 | T15 counts as done only after two or three people find both exits unaided, as in the owner's own test. | note |
| V20 | doc truth | Tracker statuses: T22 closed (V1), T25 closed (V3), T24 deferred (V2), T9 superseded by V6, T8 "waiting for the owner" (V4), R1 merged into T20; add "partly" to the status values and use it. | task |
| V21 | I, J | Brief log entries for 2026-10-16 evening and night; brief.md lines for T1, V6, V7, the masterpiece and phone-measurement standard, V1, V3; mark the 2026-10-09 "Desktop first" line superseded. | task |
| V22 | doc truth | Refresh PLAN (where we are, phases 3 rows, morning questions, drop English Prep item), HANDOFF (round 2-4 state, metro photos, hero object, decisions) and the 10-16 journal. | task |
| V23 | A15 | T27 wording: "a CD-like surface or similar; density, not realism; visible on the front too" (brief line 60), passed to whoever builds it. | task |
| V24 | A12 | Check the postcard burn-in against "too slow"; keep the small colour detail the owner liked. | task |
| V25 | D3, V8 | Give the type study the provisional 48/34 px answer: the name's size and weight, not only the face, may be what reads cheap; include size in the switch. | note |
| V26 | A19 | Dictation inside artifacts: the owner said not to bother if heavy; keep as a note, no work. | note |

Counts (all clauses in A-J, re-checked E-H rows included): misread or at risk 4 (J9, J16, J22, the T9
build vs E7); noted only 6 (J2, I1, A12, A19, D3, plus the V4 pictures with no step: J7 is a-weak);
a-weak 6 groups (J7, J24, A11/P4, A17/E1, D5, the G/M leftovers in V17); stale doc lines in 6 files.
