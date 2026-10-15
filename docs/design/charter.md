# Design charter

**Status:** proposed 2026-10-15; technique by the lead, taste lines wait on the owner. Postmortem
step 2 (`docs/research/2026-10-quality-postmortem.md`, "What changes" 2). Every design brief quotes
this file. Comps and lab pages are checked against it (`docs/WORKFLOW.md` §2).
Round 2 (the owner's answers, 2026-10-15 night, `docs/history/brief-log.md`): theme Graphite,
live since ADR-0016; no 1 s arrival limit; a real italic; captions and the Work transition go to
lab pages; Home's size lines stay provisional until Home's prototypes.

- **Kinds.** [T] is taste: it waits for the owner's yes or no (a Turkish summary goes with the
  gate-1 comps). [L] is technique: the lead decides it, and it holds now.
- **Sources.** O the owner (date), M a measurement, R research, LC the lead's choice. `ref` is
  `docs/research/2026-10-reference-research.md`; `read` is `docs/research/2026-10-readability.md`.
  `themes`, `inventory`, "objects on light" and "palette check" are the Phase 1 reports of
  2026-10-15; the lead files them under `docs/research/` when this charter merges.
- Where this file and ADR-0015 (text at `1ad060e`) disagree, this file wins.

## 1. Character

1. Presentation first: the page opened when the owner introduces themselves; the first minute
   counts. (O 2026-10-08)
2. Quiet, minimal, elegant, ours: light is the subject; grain stays; never flashy, never ugly.
   (O 2026-10-08, 10-09, 10-15)
3. Pinpoint wording: short, direct, correct; no ornate self-description. (O 2026-10-12, `ref` §2.2)
4. Alive, never loud: things arrive in sequence and settle; no loading screen; the visitor never
   waits and never gets lost. (O 2026-10-09, 10-15)
5. Controlled: every size, alignment and interaction is chosen and measured; nothing
   uncontrolled. (O 2026-10-11 night)

## 2. Page roles and density

| Page | Role | Density | Kind, source |
|---|---|---|---|
| Home | Simple and CV-like: who, what, where it leads. A clear brief for a friend or an employer. | Lowest. One column, strips with a small label each, constant gaps. | [T] O 2026-10-15; `ref` §4.1 |
| Work | The catalogue; product-led; more motion. | High. One chapter per product (ADR-0010, 0014). | [L] O 2026-10-12, 10-15 |
| Project view | Presentation: promise line, stepped real screens, chapters, proof. | High; one stage at a time. | [L] `ref` §4.2 |
| About | The long story; the ID card; photos; "How I work" kept. | Medium; reading with light on the ground. | [L] O 2026-10-15 |
| Record | Reading: dated entries. | Medium; one column, nothing beside it. | [L] `read` L1 |

One language [L]: every page shares the tokens (sections 3-5), the type pair (Newsreader display
and reading, Inter interface; no third family, so labels stay Inter), the light (product colours
as glow, section 4), the bar, clock, buttons and beads rail (liked as is, O 2026-10-15) and the
motion grammar (section 5). A fuller page adds sections, media and motion. It never adds new
sizes, colours or curves. Home's largest line is smaller than a Work title, but it uses the same
face, weight and tracking, so Home reads as the quiet page of the same site. The page probe checks
the shared frame (section 8).

## 3. Type, layout and spacing per width

Widths 390, 768, 1180, 1440 px. Screenshots stay at the three sizes in CLAUDE.md; the probe adds 768.

### 3.1 Sizes (px)

| Measure | 390 | 768 | 1180 | 1440 | Kind, source |
|---|---|---|---|---|---|
| Largest text, Home | 34 | 39 | 45 | 48 | [T] provisional (O 2026-10-15 night: ticked without a note); fixed only after the Home prototypes. Home was rejected as "too big" (O 2026-10-11 late); liked sites' largest median 48 [34-64], phone 35 (M, `ref` §3.1); CV homes 16-42 (M, `ref` §3.3) |
| Largest text, Work, project, About | 45 | 58 | 71 | 80 | [T] provisional (O 2026-10-15 night, same). ADR-0015 step t-7, today's page-title size. The research proposes 64 (`ref` §5.3; quiet pages cap at 36-64, M, §3.2). The owner sees both in the comps. |
| Largest text, Record | 34 | 41 | 48 | 52 | [L] ADR-0015 step t-5 (index and entry titles) |
| Hard cap for any text | 48 | 64 | 80 | 80 | [T] nothing set as a poster (`ref` §7). A non-text mark (a wordmark image, an object) may be larger. |
| Interface body, Inter | 16 | 16 | 17 | 17 | [L] ADR-0015; the library floor is 16 (M, `ref` §3.1) |
| Reading, Newsreader 430 | 19 | 19 | 21 | 21 | [L] O 2026-10-09 (21 px); `read` T1-T2 |
| Line height: reading / body | 1.55 | 1.55 | 1.55 | 1.55 | [L] `read` T1; liked range 1.5-1.75 (M) |
| Smallest readable text | 13 | 13 | 13 | 13 | [L] APCA has no row for 400 weight below 13 px (M, palette check). 11-12 px only for figure labels inside a frame. |
| Gutter, `clamp(16px, 3.9vw, 56px)` | 16 | 30 | 46 | 56 | [L] as built (inventory §4.1) |

Fluid display sizes are linear from 360 to 1440 px (`clamp()`). Reading and body sizes are fixed px
with one switch at 900 px. Reason: crisp text and one switch, as ADR-0015 measured. [L]

### 3.2 Scale, voices and lines

- **Scale** [L]: ADR-0015's steps from micro to t-7 (12 to 80 px wide, ratio 1.25 from 17 px).
  Steps t-9 (127) and t-10 (158) are removed. A new size is an amendment here, not a literal.
- **Three voices** [L]: display (Newsreader 400-500), text (Newsreader 430 for reading, Inter 400
  for interface), labels (Inter 13 px, 500, +0.005em). At least three levels on every page: a flat
  page reads as dull (O, Jakub and Arc notes, `ref` §4.1).
- **Tracking** [L]: display -0.02 to -0.035em, body 0, labels +0.005em. Tokens only (18 literal
  values today, inventory §3.5). `ref` §3.2 measured -0.02 to -0.05em.
- **Italic** [L, O 2026-10-15 night "load a real italic"]: Newsreader's own italic, cut like the
  roman (`tools/fonts/subset.py`, latin 85.5 KB and tr 5.5 KB). It is not preloaded: no first
  screen sets italic, and a page downloads it only when it shows italic text (today About).
  The browser never slants the roman (section 7, faux italic).
- **Line length** [L]: reading prose 28em, about 66-72 characters (O 2026-10-09 "about 70";
  `read` T1, M). Interface sentences at most 34em; ledes at most 30em. On phones never under 35
  characters, so no text sits beside an image below 600 px (`ref` §4.3, Saul Leiter at 12, M).
- **Distinct sizes** [L]: at most 14 across the site at one window width (ADR-0015 guard), and at
  most 6 in one viewport. Reason: hierarchy reads from few steps.

### 3.3 Columns and spacing

| Measure | 390 | 768 | 1180 | 1440 | Kind, source |
|---|---|---|---|---|---|
| Home text column, max | full | 640 | 680 | 680 | [T] CV homes run one 600-670 column (M, `ref` §3.3) |
| Reading column | full | 532 | 588 | 588 | [L] 28em of the reading size |
| Index column + gap (E1) | folded | folded | folded | 200 + 56 | [L] ADR-0015 item 3; folds below 1240 |
| Page max width | | | 1320 | 1320 | [L] as built |
| Figure breakout in reading | full | full | 720 | 720 | [L] `read` L3 |
| Gap between Home strips | 64 | 64 | 96 | 96 | [L] constant within a site (M, `ref` §3.3: 56-144) |
| Gap between chapters (About, project) | 80 | 96 | 128 | 128 | [L] scale steps; Work chapters stay one screen tall (ADR-0010) |

- **Scales** [L], tokens only (inventory §4: 43 gaps, about 17 radii, about 12 shadows today).
  Spacing 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128 px (ADR-0015 item 4, plus 80 for phone
  chapters). Radii 4 (focus), 8, 12 (frames), 22 (sheets), pill, circle. Shadows: near, raised,
  frame. Touch targets 44 px everywhere (ADR-0015 item 6).

### 3.4 Density limits

- Home first screen [T]: name and role in the top 130 px of content (M, 8 sites, `ref` §4.1); 40-120 words; at most two
  buttons, below the line that says what the site is; the next strip shows above the fold.
  (O 2026-10-15 "not five buttons at once"; `ref` §4.1: 50-160 words, M; full-screen heroes hide
  the rest, R)
- Home length 1.5-2.5 screens [T]: the genre runs 1.1-2.8 (M, `ref` §3.3); the owner is not sure.
- Per viewport, every page [L]: one hero object; one ambient loop (section 5); one accent colour.
  Entrances and state changes are not limited by this line; they settle.

## 4. Colour

- **Ground ladder** [L]. All grounds are tokens; the near-black literals of inventory §1.2 are
  tokens since ADR-0016. Live values (`src/styles/global.css`):

  | Token | Value | Use | Reason |
  |---|---|---|---|
  | `--ground-deep` | #0d0d0f | object stage centre, optional | light still reads as the subject |
  | `--ground` | #121214 | every page | off pure black (R, `themes` §3-4); the safest soft black for the objects: 0.3-4.9 % of object pixels clip, against 0.4-8 % on #1a1a1a (M, objects on light §3.1) |
  | `--raised` | #1a1a1d | sheet, cards, frames | depth by a lighter plane (R, Material) |
  | `--raised-2` | #232327 | pill, hover beds | one more step, no more |

  Pure black (#000) is never a ground for text. Pure white (#fff) is never text. (O 2026-10-12, Jakub
  note, `ref` §7; O 2026-10-15 "need not be pure"; `ref` §3.2: the strongest pages never do it.)
- **Ink by role** [L]. One warm ink in five tones, live since ADR-0016, measured on #121214 (M,
  2026-10-15, WCAG 2 and APCA 0.0.98G, the formulas of the palette check). Every value also passes
  its floor on `--raised` and `--raised-2`. They are candidate A of the theme lab
  (`src/styles/lab-themes.css`). `--ink-2` is the lab's #d3cfc7, not the earlier #c4bfb6: its
  sentences (decks, ledes, 15 px summaries) are measured at the body floor in the palette check,
  and #c4bfb6 is Lc 68 there (M, ADR-0016).

  | Token | Role | Floor | Value | Measured |
  |---|---|---|---|---|
  | `--ink` | titles, interface | APCA Lc 75, at most about Lc 90 | #e8e3dd | 14.7:1, Lc 90 |
  | `--read` | reading prose | Lc 75 | #dedad2 | 13.4:1, Lc 84 |
  | `--ink-2` | secondary sentences: decks, ledes, summaries | Lc 75 | #d3cfc7 | 12.1:1, Lc 77 |
  | `--ink-3` | labels, dates, captions | Lc 45 | #a19d96 | 6.9:1, Lc 49 |
  | `--ink-4` | non-text only: rules, underlines, idle marks | Lc 30, 3:1 | #827e78 | 4.6:1, Lc 33 |

  Lc 90 is APCA's advisory maximum on dark (R, `themes` §3). Long prose uses `--read`, not
  `--ink`. Before ADR-0016, ink-3 was Lc 38 and ink-4 was text at 2.93:1 (M, inventory §1.4). The
  step between `--ink`, `--read` and `--ink-2` is small (OKLCH L 0.92, 0.89, 0.85): secondary
  sentences separate by size and face as much as by colour (`themes` §A).
- **Contrast floors** [L]. A pair passes only when both WCAG 2 and APCA pass: body Lc 75 and 4.5:1;
  large Lc 60 and 3:1 (WCAG-large); label Lc 45 and 4.5:1; non-text Lc 30 and 3:1. Reason: WCAG 2
  overrates contrast on dark grounds (M: ink-3 is 5.55:1 but Lc 38). The label floor is this
  project's choice, not APCA's: APCA Bronze puts Lc 45 at headlines and Lc 30 at incidental text,
  and its font table asks more for 13 px. Labels stay short, so they are spot-read, not read. Source of truth:
  `npm run palette` (`tools/palette/`), every pair in its PAIRS table.
- **One accent at a time** [L]. The page accent leads (edk blue Home, Log blue Record, gold About);
  on Work the product in view takes over. Never two product colours lit in one viewport. (`ref` §3.2,
  M; `read` C1)
- **Product colours are light** [L]. Glow, marks, rules, large ink. One source per product
  (`content/projects/*.md`), generated into tokens; today Recto has three greens and English Prep
  two pinks (inventory §1.3). Eat Map rose (Lc 39) is never small text. A colour that must be ink
  on a ground gets its own measured ink: `accent.ink` and `accent.fill` in the product's content
  (Eat Map: text #ff94a9, button fill #f2627b; its glow, beads and wordmark keep #eb4f6b); Record
  links use `--log-ink` #a8d3ff (ADR-0016).
- **No large saturated fields** [L] outside a product's own embassy (O, Antoine note, `ref` §2.4).
- **Every page has light** [L]. The aura colours each page from what the page shows; the grain
  stays and eases reading; the ground stays black-ish (O 2026-10-15 night: aura, grain and noise
  are the concept). One glow scale of three tokens replaces the 10-15 % literals (inventory §2).
  The base step is live: `--glow-base` 11 % (Home object, Home plate, Record head, About). Every
  house page carries at least the base pool. Reason: About is "too black, too empty, soulless"
  (O 2026-10-15); its gold pool rose from 10 % to the base. The 404 page has no pool yet.
- **Theme** [T, decided]: A Graphite, one dark theme (O 2026-10-15 night: "white tires the eyes";
  an aura on white does not work). No white pages and no theme switch. The tokens live on `:root`
  in `src/styles/global.css`; the theme-color meta and the web manifest read the ground from
  `src/lib/theme.ts`, and a test keeps the two equal (ADR-0016). The lab page `/lab/themes/` stays
  as the record of the four candidates (B Paper, C Hybrid and D Moods are closed). Objects stay
  on dark (section 6).

## 5. Motion

| Motion | Duration | Curve | Kind, source |
|---|---|---|---|
| Press, hover (colour, underline) | 120 ms | `--ease-out` | [L] `read` M3; UI 150-300 measured (M, `ref` §3.2) |
| State change (tabs, toggles, panels) | 200-320 ms | `--ease-out`; springs only as below | [L] as built (`--d-2`, `--d-3`) |
| Element entrance | 320-480 ms | `--ease-out` | [L] the short end of the measured 400-1000 (M), so a sequence stays short |
| Page change, same depth | out 160, in 320 ms | `--ease-in` out, `--ease-out` in | [L] ADR-0007 |
| Page change, deeper / back | 420 / 240 ms | same | [L] ADR-0007 |
| Moving across the screen (stage, accent glide) | 480-720 ms | `--ease-move` | [L] as built |
| Work card to project (shared element) | test band 450-1400 ms on phone and desktop; Back mirrors it | `--ease-move` | [T] O 2026-10-15 allows the long version; O 2026-10-15 night: chosen on a lab page, from options based on the liked examples. The loved model (Robin Noguier) is a shared element that never disappears, 1.38 s open, 1.63 s back (M, `ref` §4.2); the lab shows it beside the other methods of `ref` §4.2 and a short version. The owner picks one per platform. |

- **Curves** [L]: two for what the visitor sees arrive and move, `--ease-out` (0.2, 0.7, 0.1, 1)
  and `--ease-move` (0.65, 0, 0.35, 1). `--ease-in` (0.4, 0, 1, 1) is only for exits. Five literal
  curves go (inventory §5.1). Sites the owner liked use one or two curves (M, `ref` §3.2).
- **Springs** [L]: only for the tab indicator and objects the visitor drives (ID card, postcard,
  object lean). A `linear()` spring plays only at the duration it was solved for: `--spring-ui`
  runs 510 ms, the kit's value, not 320, 450 or 480 (inventory §5.2). Extreme input never gives
  an extreme reaction: speed and angle are clamped (O 2026-10-10).
- **Sequenced arrival** [T]: on arrival, the first screen's blocks enter in reading order, 70 ms
  apart, each 400 ms, rising at most 12 px from opacity 0. At most 6 steps; the rest arrive with the
  last step. In a reading column the sequence ends at the heading; the prose is there at first
  paint. Sources: O 2026-10-15 ("elements that appear in sequence read better"); Anthony Fu, 90
  ms apart (M, `ref` §3.2).
- **No arrival limit** [T, decided]: the owner set no 1 s limit; the longer effects stay (the
  poster fallback 1400-1600 ms, the glint sweep 1800 ms, the ID card twist 1300 ms; inventory §5)
  (O 2026-10-15 night). The 1000 ms of `ref` §4.1 was the research's proposal. Fixed [L]: arrival
  never blocks reading; no loading screen, intro or counter (O 2026-10-15). The first step starts
  at 0 ms. Text is in the HTML, readable and clickable during the stagger. An element hidden for
  its entrance shows by itself within 1000 ms if its script fails.
- **Reading text never moves** [L]. No per-paragraph fades and no scroll-linked effects inside a
  reading column (`read` M1). A Work or project chapter may reveal once as it scrolls in, at most
  720 ms (the top of the moving band), on a lab page first (postmortem item 6: scroll-linked work
  is tried on the iPhone).
- **Ambient loops** [L]: two kinds only. A light loop (a glow that breathes, a slow drift): a period
  of 5 s or more, at most one per viewport. Reason: a faster loop pulls the eye like a
  notification. An object's own idle motion (pre-rendered, O 2026-10-09 "each may have its own
  animation", O 2026-10-10 phones). Both pause when hidden. Text and screens never loop. Anything
  else settles. Today About runs four light loops, one at 2.8 s (inventory §5); they reduce to one.
- **Amplitude** [L]: rise 12 px (24 px deeper), scale 0.97-1.03, no rotation of type or screens.
- **Still twins** [L]: reduced motion, no JS, no WebGL and phones each get a complete page
  (CLAUDE.md).
  - Reduced motion: every duration is 150 ms or less and nothing moves; loops stop on a still frame.
    The Work transition becomes a cross-fade. Every duration is a token, so one block can cap them
    all; the literal 200 ms transitions move onto tokens (inventory §5.1).
  - Objects the visitor drives (ID card, postcard): under reduced motion they jump to the end
    state. A button gives every action (flip, open, close), so touch and keyboard lose nothing.
  - Nothing depends on hover: on touch, a hover effect has a tap or a still state.

## 6. Objects, screens and photos

- **Objects** [L]: pre-rendered (ADR-0006), drawn additively on a dark ground. A light ground
  washes them out: 96-100 % of object pixels clip on #f4f1ea (M, objects on light §3.1). On a light
  page an object sits only in a dark tile with `overflow: hidden`, or in a full-bleed dark band;
  never in a dark halo fading into paper (it reads as a burn mark). No blend trick is used.
- **Object sizes** (drawn box, px; never past the render's pixels at the device ratio, the 2026-10-10
  sharpness fix):

  | Place | 390 | 768 | 1180 | 1440 | Kind |
  |---|---|---|---|---|---|
  | Home object, if any | 160 | 200 | 240 | 280 | [T] small and calm, "like a signature" (`ref` §4.1); today edk is 470 |
  | Work hero | 360 | 420 | 520 | 600 | [L] as built (ADR-0014) |
  | Project view | 320 | 360 | 400 | 420 | [L] as built |
  | Record object | 176 | 240 | 280 | 320 | [L] as built |
  | Thumbnails | 76 | 96 | 96 | 96 | [L] as built |

- **Screens** [L]: real screens, true aspect, untilted, in the one browser frame and the one phone
  frame (ADR-0014; ADR-0015 item 5); never past the file's pixels (15 % slack).
- **Photos** [L]: still on the page; no hover distortion (`ref` §4.3). The only reveal is the
  postcard v2 burn-in below. Never stretched past their pixels (O 2026-10-10). One cat photo, never
  both. On phones one photo per row.
- **Photo caption** [T, to test]: two options go to a lab page, a one-line factual caption under
  the photo (place, date, what it shows; `ref` §4.3) and a caption shown only in the enlarged view
  (O 2026-10-15 night). The owner rejected Darkroom's click caption (O 2026-10-15).
- **Postcard v2** [L, direction approved by O 2026-10-15]: the two-sided postcard with a designed
  back and frame. A click opens a large view (at most 90 % of the viewport; LC: the page stays
  visible at the edges, so the visitor is never lost). There the card flips and swings freely,
  with at most a slight depth that cannot break. Darkroom's burn-in may return, much faster, with
  its small coloured detail; never Darkroom's caption or anything from Proof. Lab page first.

## 7. Never

From the owner's words (O), the postmortem (P) and the research's "not to do" list (`ref` §7,
adopted by the lead as technique):

- A loading screen, intro show, counter, gate or empty first screen; five buttons before the site
  has said what it is. (O 2026-10-15; `ref` §7)
- A name set as a poster; everything too big; a brief that asks for "monumental" or "go all out".
  (O 2026-10-11; P cause 1)
- Pure black with pure white; saturated colour over large areas; a colour or tone that was
  guessed; a theme that spoils the objects and renders. (O 2026-10-12, 10-15)
- Ornate self-description ("I turn dreams into reality"). (O 2026-10-12)
- Rotating text, marquees, anything that never settles; hijacked horizontal scroll; a transition
  that feels like a new page opened (a fade to white). (`ref` §7)
- Tilted screens, floating phones, stretched images, faux italic, both cat photos. (`ref` §7;
  O 2026-10-10)
- A native scrollbar anywhere; emoji as icons; symbols typed as characters. (O 2026-10-09, 10-11)
- A literal colour, size, gap or duration beside the tokens. (LC, from O 2026-10-11 night,
  "controlled")
- A new design on a live page before the owner approves it on a lab page. (P "What changes" 5)

## 8. How to check

Two tools prove the numbers; both join `npm run verify` (PLAN, Phase 1, measuring tools).
**`npm run palette`** reads the `:root` tokens and every theme block, composites translucent
layers on their ground, and fails when a PAIRS row is below its floor (section 4). `verify` and CI
run it as `npm run palette:gate` (ADR-0016): the house theme fails the run; a miss inside a
product's world (its `world.json`) is reported for the Family chat and the product.

**Page probe** (to build). It runs every route at 390x844, 768x1024, 1180x820 (touch) and 1440x900,
in normal and in reduced motion. It fails on:

| Check | Limit |
|---|---|
| Largest rendered text size | the cap for the page role and width (3.1) |
| Distinct text sizes | 14 across all routes at one width; 6 in one viewport; each one a token |
| Body and reading size, line height | 3.1 values |
| Characters per line in reading prose | 60-75 from 768 up; 35 or more on phones |
| Home first screen | words 40-120; at most two buttons; the next strip's top above the fold |
| Horizontal overflow; touch targets | none; 44 px on touch |
| Images and media | drawn at most 1.15x the file's pixels |
| Arrival | text readable and clickable from first paint; infinite animations are light loops or object idle motion only; with the script blocked, no element in the first viewport at opacity 0 after 1000 ms (section 5) |
| One language | the bar, gutter, ground token, label style and rail are the same on every route |
| Reduced motion | no animation longer than 150 ms; no movement |
| Computed text colours | each text node's colour on its ground meets its role's floor |
| Literals | no font size, colour or duration outside the tokens |

The tools cannot check taste: the critic reviews screenshots and motion frames against this
charter, and the owner tries each lab page on the iPhone and a computer (WORKFLOW §2).
