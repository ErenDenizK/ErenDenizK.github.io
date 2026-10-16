# Design spec: the two-page site (Home and Record), round one

**Status:** binding brief for the builders of PART A (shell) and PART B (Work), 2026-10-15, late
night. Written by the design lead from the owner's direction (brief log, 2026-10-15, the last two
sections), `docs/research/2026-10-reference-notes.md`, `docs/research/2026-10-motion-frames.md`, `docs/research/2026-10-two-page-tech.md`,
`phase3/cleanup.md`, the content in `content/`, and the postmortem
`docs/research/2026-10-quality-postmortem.md`. Where this file and an older doc disagree, this file
wins for the lab page `/lab/one/`. Nothing here goes to a live page before the owner has tried the
lab page (charter §7).

**Comps** (the target; look at them before you build): `phase3/comps/`
- `first-1440.png`, `first-390.png`: Home, first screen.
- `work-1440.png`, `work-390.png`: Work, the deck settled on Recto.
- `open-1440.png`, `open-390.png`: Recto open, the first screen of the presentation.
- The HTML sources (`first.html`, `work.html`, `open.html`) use the draft tokens
  `comps/one-tokens.css` and `comps/base.css`. Copy values from there, not from the PNGs.
- Comps are stills. Motion is in section 4. The comps use flat CSS for the aura; the build uses the
  field in section 2.6.

**Marks:** [O] the owner's words, [M] measured (reference notes and frames study), [D] decided here.

---

## 1. Concept

1. **Feel.** The site feels like Istanbul at blue hour: a near-black, grained ground. Coloured light
   gathers around what you look at, and the page moves gently under the scroll, like reflections
   on a wet station platform. Everything sits on one centred axis.
2. **Art direction: the owner's photographs become the paintings.** Shopify Editions makes its
   chapters from paintings and their line-engraving twins [M]. We make ours from the owner's own
   photos. Each photo becomes a 2.5D plate: its traced line twin (made by a tool, section 7.4),
   construction lines drawn by hand in SVG over it, and the aura as light. The brief stands on the
   Bostancı platform at dusk (`bostanci-rain-dusk.jpg`), cropped so that the rails meet at a
   vanishing point on the page axis. A red signal light sits at that point. It is the seed of the
   one portal into Work (section 4.6).
   - Why this and not hand-drawn figures: figures drawn by agents risk the owner's "cheap,
     unpolished" and "average" verdicts (Scout Motors, Craig Mod, Chungi Yoo) [O]. A trace of a
     real photo is the owner's own, specific to Istanbul, and repeatable. Geometric lines cannot look
     amateur. The glass objects already exist and are polished.
3. **Work is a table of prints.** Each project is a small stack of prints. A print is a real screen
   on a mount of the project's own dark paper (its `world.json` `ground.frame`). The project's glass
   object floats behind the stack, and real UI fragments cut from its captures float in front of it.
   Click a print: the paper grows into the page of the project, the screen comes to the front, and
   the other prints and the texts come with it [O].
4. **The aura is generous, moving and meaningful.** It is edk blue-hour blue for the brief, each
   project's three world pigments in Work, the warm sunset gold for the person, and the Record blue
   at the Record pointer. It is always light (additive pools), never a flat paint field. Text keeps a
   measured quiet zone (section 2.6).
5. **Tempo.** Scene tails are slow (700 to 1400 ms) and responses are instant (at most 160 ms to
   the first visible change). Nothing waits, nothing is gated, nothing takes the scroll. Only one
   slow light loop never settles: the aura drift. Every scene has a still twin that is a complete
   page.

---

## 2. Token set: `src/one/tokens.css`

New file. It inherits nothing from `src/styles/global.css` except the Graphite values and the
measured inks of charter §4. Draft with exact values: `phase3/comps/one-tokens.css`. The tables
below are the reasons and the parts the draft does not carry.

### 2.1 Faces

| Role | Face | Weights | Loading |
|---|---|---|---|
| Serif voice: the name, headings, promises, the quote, Record reading | Newsreader (roman) | 400, 500 | preloaded (latin + tr subsets) |
| Third voice: one phrase per screen at most (the quote, a postcard note) | Newsreader real italic | 400, 500 | loaded on first use, never preloaded |
| Sans voice: body, labels, UI | Inter | 400, 500, 600 | preloaded |
| Product wordmarks (Work and the presentation titles only) | Recto: Funnel Display 600, -0.03 em; English Prep: Inter 600, -0.055 em, lower case, sakura dot; Eat Map: Nunito 800, -0.025 em | from each project's `wordmark` field | declared by PART B, `font-display: swap`, not preloaded |

No mono face (it would cost about 20 KB of first paint). Labels are Inter 500, upper case,
+0.06 em [D].

### 2.2 Type scale (desktop 1440 / phone 390; fluid between, clamp values in the draft)

| Token | Desktop | Phone | Line height | Tracking | Face, weight | Use |
|---|---|---|---|---|---|---|
| `--fs-cap` | 12 | 12 | 1.2 | +0.08 em, upper | Inter 500 | captions inside a print or figure only |
| `--fs-label` | 13 | 13 | 1.2 | +0.06 em, upper | Inter 500 | labels, dates, meta |
| `--fs-small` | 15 | 14 | 1.5 | 0 | Inter 400/500 | chips, buttons, facts |
| `--fs-body` | 17 | 16 | 1.65 | 0 | Inter 400 | body |
| `--fs-lede` | 20 | 18 | 1.55 | -0.005 em | Inter 400 | the brief's lede, promises in an open project |
| `--fs-h4` | 24 | 20 | 1.3 | -0.01 em | Inter 500 | step titles, card titles |
| `--fs-h3` | 29 | 24 | 1.25 | -0.012 em | Newsreader 400 | outcome lines, the quote, "Now" |
| `--fs-h2` | 42 | 32 | 1.1 | -0.02 em | Newsreader 500 | the name; the Record title |
| `--fs-title` | 72 | 44 | 1.0 | wordmark's own | wordmark face | project titles in Work and in an open project only |

- The ratio above body is 1.2 per step (17, 20, 24, 29, 35, 42; 51 and 61 are not used) [D]. Phone
  display type falls to 0.61 of desktop, headings to 0.76 to 0.83: inside the measured 0.4 to 0.7
  band [M], kept a little larger because the owner shares the site on a phone [O].
- Caps [O, provisional]: brief and the rest at most 48 / 34 px: we use 42 / 32. Work and the open
  project at most 80 / 45 px: we use 72 / 44.
- At most 6 sizes in one viewport, all 9 on the page.
- `text-wrap: balance` on every heading and promise; `pretty` on body.

### 2.3 Space, columns, radii, depth

- Space: `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-5` 24, `--s-6` 32, `--s-7` 48,
  `--s-8` 72, `--s-9` 112, `--s-10` 168 px. Beyond 32 the steps grow by 1.5. Gap between strips:
  `--s-9` desktop, `--s-8` phone. Gap between the three parts (brief, Work, the rest): `--s-10` /
  `--s-9`. Borders are space, not lines [M].
- Gutter `--gut`: 16 px at 390 to 48 px at 1440.
- Columns, all centred on the page axis: `--w-text` 600 px (the brief and the rest; body text also
  at most 34 em, about 60 to 68 characters); `--w-wide` 1040 px (cards in a presentation;
  Notion 990 to 1022 [M]); `--w-stage` 1200 px; `--w-print` min(52 vw, 720 px) desktop,
  100 vw - 72 px phone. Hero screen in an open project: 800 px (Dia's window is 756 [M]).
- Radii: `--r-print` 3 (paper is nearly sharp; Shopify 2 to 3 [M]), `--r-chip` 6, `--r-screen` 10,
  `--r-card` 16, `--r-pill` 999.
- Depth on dark is a lighter plane plus a hairline plus a shadow, never a glow box alone:
  `--e-card` (inset hairline at 8 % ink plus a 4 % top light), `--e-print` (two shadows),
  `--e-lift` (the lifted print and the hero screen). Values in the draft.
- z-index map (shared by A and B): field 0, plates 1, grain 5, content 10, layer 50, bar 60,
  rail 61, capsule 62, enlarged postcard 70.

### 2.4 Colour

Grounds and inks (inherited, measured on each ground by the palette tool, WCAG 2 / APCA Lc):

| Token | Value | ink | ink-2 | ink-3 |
|---|---|---|---|---|
| `--ground` | #121214 | 14.7 / 90 | 12.1 / 77 | 6.9 / 49 |
| `--paper` (new: the person part, after the tear) | #17171a | 14.0 / 89 | 11.5 / 77 | 6.6 / 48 |
| Recto paper (`world.ground.frame`) | #17191e | 13.8 / 89 | 11.3 / 76 | 6.5 / 48 |
| English Prep paper | #1d1a20 | | 11.1 / 76 | 6.4 / 48 |
| Eat Map paper | #261116 | | 11.5 / 77 | 6.6 / 48 |

Floors (charter §4): body Lc 75 and 4.5:1; large Lc 60 and 3:1; label Lc 45 and 4.5:1; non-text
Lc 30 and 3:1. All rows above pass [M, measured with `tools/palette/color.mjs`].

- Ink ladder: `--ink` #e8e3dd (titles, UI), `--read` #dedad2 (Record prose), `--ink-2` #d3cfc7
  (body, lede), `--ink-3` #a19d96 (labels, inactive steps), `--ink-4` #827e78 (non-text only).
  This is Dia's dark ladder 100 / 80 / 60 / 40 [M] expressed as solid measured colours.
- Fills (on ink): `--fill-1` 4 %, `--fill-2` 7 %, `--fill-3` 10 %. Lines: `--line-1` 8 %,
  `--line-2` 14 %, `--line-3` 22 %.
- Product colours are light, as before. Where a product colour carries text it uses the product's
  measured ink: Recto's primary button is #08090c on #bbed26 (14.5:1, Lc 85 [M]); Eat Map rose is
  never small text (`accent.ink` #ff94a9).
- No white area larger than a product's own screen. No #000 ground under text, no #fff text.

### 2.5 Aura sets (three pigments each)

| Part | a1 | a2 | a3 | Source |
|---|---|---|---|---|
| Brief (blue hour) | #6f8cff | #9a9cf0 | #3a4fb8 | edk / Bostancı dusk [D] |
| Recto | #a6d873 | #58da98 | #1f9996 | `world.json` light |
| English Prep | #efb1cb | #6350a5 | #28798a | `world.json` light |
| Eat Map | #ec5794 | #eb4f6b | #4a1626 | `world.json` light |
| The person (sunset gold) | #f3b886 | #e8955a | #8a4a2e | `--about`, the Marmara sunset [D] |
| Record pointer and Record page | #8fb8ff | #6f8cff | #6fc9cf | `--log` |

PART A reads the project sets from `world.json` at build time; it does not copy them by hand.

### 2.6 Aura and grain parameters

- **Field:** one fixed layer under the content. Three pools: elliptical radial gradients, built as
  small elements (about 512 px) scaled up by `transform`, never as 90 vmax layers (they cost
  about 62 MB of layer memory on a phone [M, tech §4.2]). Blend: `plus-lighter` on the ground.
- **Strength:** pool centre alpha up to `--aura-open` 0.32 where no text sits (behind prints, at the
  edges, in the margins). Under a text block the lift is at most `--aura-quiet` 0.08 additive. At
  0.08 every ink keeps its floor: ink-2 Lc 75 to 76, ink-3 Lc 47 to 48 [M, all six sets measured].
  At 0.16 the labels fail. So:
- **Hush:** every text block that can sit over a strong pool carries a hush: a radial gradient of
  the ground at 62 % behind its box, feathered 80 to 140 px (`.hush` in the comps). The palette
  gate measures text on "ground + aura at 0.08" for each set (new PAIRS rows, section 8).
- **Drift (the one ambient loop):** pools translate within ±6 vmax and scale 0.9 to 1.1 on
  transform-only CSS animations, periods 23, 31 and 37 s, independent phases. Paused when the tab is
  hidden, when the layer is open, and under reduced motion.
- **Colour change:** the pigments are `@property` colours (`<color>`). Between sections: scroll-linked
  over 0.6 vh. At a Work settle: 500 ms on `--ease-ui`. The ground lightness never changes [M].
- **Grain:** the existing 128 px tile (`src/assets/photos/grain.png`), fixed, above the field and the
  plates, under the content. Prints carry their own 96 px grain on the mount (paper fibre). The grain
  is static: no animated noise (battery).
- **Signal light:** a 6 px point at the vanishing point, #ff6b6b with a 14 px glow, alpha 0.8.

### 2.7 Motion tokens

| Token | Value | Use | Source |
|---|---|---|---|
| `--t-press` | 120 ms | press scale, the lift before an open | |
| `--t-quick` | 160 ms | title out, link colour | Robin 170 [M] |
| `--t-ui` | 300 ms | UI states, accordions | Shopify 300, Dia 300 [M] |
| `--t-swap` | 500 ms | aura crossfade at a settle | Robin 500 [M] |
| `--t-reveal` | 700 ms | text arriving | Anthony Fu 1000, shortened [M] |
| `--t-move` | 900 ms | prints and frames arriving | Antoine 1 s [M] |
| `--t-open` | 900 ms (lab switch: 1400) | the paper grows | Robin 1.38 s [M] |
| `--t-close` | 800 ms | the paper returns | |
| `--t-draw` | 2400 ms | line drawing at arrival | Shopify 3 s [M] |
| `--step` | 90 ms (phone 75) | stagger | Anthony Fu 90 [M] |
| `--ease-ui` | cubic-bezier(.4, 0, .2, 1) | UI, colour | the most shared curve [M] |
| `--ease-out` | cubic-bezier(.22, 1, .36, 1) | text reveals | Dia [M] |
| `--ease-soft` | cubic-bezier(.23, 1, .32, 1) | prints, frames | Antoine [M] |
| `--ease-path` | cubic-bezier(.77, 0, .175, 1) | shared-element paths (open, close) | Dia edge sweep [M] |
| `--ease-exit` | cubic-bezier(.55, .055, .675, .19) | things leaving | Antoine exits [M] |
| `--ease-settle` | cubic-bezier(.34, 1.56, .64, 1) | the one overshoot: cards and prints only | Shopify cards [M] |
| `--ease-draw` | cubic-bezier(.34, .22, .47, .84) | line drawing | Shopify [M] |

- The old house curves and `--d-1` to `--d-5` are not used.
- The ID card and postcard physics keep `docs/family-kit/springs.js` (the Family's file: read it,
  never fork it). Print the CSS `linear()` strings from it at build time. The overshoot of
  `--ease-settle` is the CSS twin of the kit's `pop` role; if the two disagree, tell the lead.

---

## 3. Layout of Home

All content is centred on the page axis. Desktop and phone differ where noted [O].

### 3.1 The bar (both pages)

- Desktop: height 76 px. Left: the mark "edk" (Newsreader 500, 24 px) plus a 6 px dot in the current
  aura a1 (colour change 500 ms). Centre: the tab pill with two tabs, Home and Record, in the existing
  lens look (glass 62 %, blur 16 px, inset hairline 7 %, active bed 8 %, 40 px tall tabs, 20 px side
  padding). Right: "Istanbul 21:30" (13 px, Inter 500, tabular; the time in ink-2).
- Phone: height 64 px; the same three parts; the clock shows only "21:30"; tabs 16 px side padding.
- No GitHub link in the bar: links live in Contact (one place).
- The quiet band under the bar (a ground gradient) appears once the page has moved.
- The tab change is a cross-document View Transition; the active bed slides (`view-transition-name:
  tab-ind`).

### 3.2 The brief (PART A)

Desktop (comp `first-1440.png`):
- Column `--w-text` 600 px. The name's top at y 196.
- H1 the name (`--fs-h2`, Newsreader 500): "Eren Deniz Kuyucaklıoğlu" (`site.name`), one line.
- Lede (`--fs-lede`, ink-2, at most 34 em): `site.lede`, 3 lines. 24 px under the name.
- Three structural rows, 48 px under the lede, 16 px apart, each one centred line: label then value.
  - **Studying**: "Yıldız Technical University, first year" (`kicker.school`, `kicker.year`).
    The lede already says the subject, so the row does not repeat it.
  - **Building**: three chips (Recto, English Prep, Eat Map), each with a 7 px dot in its colour.
    Each chip is a link to `#<slug>`: it scrolls to that project in Work.
  - **Writing**: "The record" (`site.log.title`), a link to the Record tab, then "· last entry
    {dayMon}" from the newest entry. Hidden while the Record is empty.
- About 50 words before Work, inside the 20 to 40 word lede band plus rows [M].
- The Work label and the top of the first stack peek in at y 700 to 900: the next part is
  visible above the fold [M: illusion of completeness].
- The plate behind: the line twin at 20 % ink, masked to the lower half (it begins under the rows);
  its vanishing point on the axis at y 560, the signal light there; the construction drawing at
  10 % (a circle r 430 around the vanishing point, a dotted inner circle r 266, the horizon at
  y 560, the axis as a dotted line, two sight lines to the lower corners, a bracket over the name).
  The Recto lime begins to bleed in at the bottom edge: the aura shows what comes next.

Phone (comp `first-390.png`):
- Name 32 px on one line (it fits at 390), lede 18 px in 5 lines, rows as label above value.
- The Studying value uses `kicker.schoolShort` ("YTU, first year") so it stays on one line.
- The plate is the same twin at 900 px wide, the vanishing point at y 600.
- The Work label at y 720 and the top of the first print at y 744.

### 3.3 Work (PART B)

#### 3.3.1 The deck (default on both widths)

Desktop (comp `work-1440.png`):
- `#work` is a tall section with a sticky stage (`position: sticky; top: 0; height: 100svh`).
  Its height is the sum of the project slots plus one stage. Slot length: (1 + 0.35 × (prints − 1))
  × 100 svh. Recto and English Prep have 3 prints (1.7 screens each), Eat Map 1 (1 screen):
  4.4 screens plus the stage.
- Stage, top to bottom: the index label "Work 01 / 03" at y 92 (the current number in ink); the
  stack, its top at y 134; under it the meta label ("Public beta · 1.0.0-beta", from `status` and
  `version`), the title (`--fs-title`, the wordmark face), the promise (`summary`, Inter 17, ink-2,
  balanced on 2 lines) and one button "Take a look" (`site.work.cta`).
- The stack: the front print 672 px wide at -1.6°; behind it the next two prints at +4.2° (offset
  +70 px, -18 px) and -6.5° (offset -84 px, -6 px), dimmed (brightness 0.62 / 0.5, saturation
  0.55 / 0.4). A print: mount 12 px on three sides and 34 px at the bottom, the mount in the
  project's paper colour with its own grain; the screen inside at 16:10; the caption on the mount
  bottom (`--fs-cap` at 11 px: "Recto · The Library" left, "1 / 3" right).
- 2.5D props: the project's glass object (poster, then its idle loop) behind the stack at the upper
  right, about 400 px, `plus-lighter`, partly hidden by the prints. In front: up to two UI fragments
  cut from the project's own captures (Recto: the Markup capsule and the page counter), with their
  own shadow, overlapping the stack edge. PART B makes these crops with a small tool from the
  captures, and lists them in the project's content as data (`props: [{ capture, crop, at }]`).
- The ground: the project's aura set at full strength around the stack; the hush behind the text.
- The next project's first print peeks at the bottom edge, dimmed.

Phone (comp `work-390.png`):
- The same stage. Prints are 100 vw − 72 px wide and the screen is cropped square (1:1). Each
  capture gets a focal point in content (`focus: [x, y]`, default the centre). A desktop screen at
  phone width is too small to read whole; a square crop of its key part reads well.
- Rotations at most ±3.5°; one UI prop; the object at 200 px at the upper right; no rotateX.
- Text block at y 500: meta, title 44 px, promise, the button.

#### 3.3.2 The drift (lab switch `?work=drift`, desktop only)

- No pinned stage. Each project is a block of 140 svh. Its prints float side by side around the
  centred title, at three depths (0.8×, 1×, 1.25× of page speed), each turned a little in 3D
  (rotateY ±8°, rotate ±3°). The glass object and the props sit between the depths. Antoine
  Wodniack's drift [M], without the letter wall and without the red.
- Same title block, same open. Phone always uses the deck.

#### 3.3.3 Eat Map has no screens

- Its set is one print. The print shows the glass pin object (its poster, then its spin loop) on the
  wine paper (#261116), lit by the rose aura. The caption reads "Eat Map · iOS".
- The presentation is one screen: the object large and turning (spin loop), the head (meta
  "In development · private", the title in Nunito 800, the promise `summary`), the facts row, and
  the line "Code not public yet" (`linksNote`) in the capsule where the Code button would be.
  No steps, no cards. Unwritten sections stay hidden.

#### 3.3.4 The open project (the presentation)

The presentation is a layer over Home (`position: fixed; inset: 0`), with its own scroller and
`overscroll-behavior: contain`. Home under it is `inert` and does not move. The layer's ground is
the project's paper colour plus its aura plus the grain.

First screen, desktop (comp `open-1440.png`):
- Hero screen 800 px wide at y 96, radius 10, `--e-lift` plus a glow in a1. It is the front print's
  screen, now flat (0°). The signature clip plays in it when the open has settled (muted, inline,
  one video at a time; poster first; the existing AV1 → HEVC → H.264 ladder).
- The other prints of the set flank the hero, left at -6° and right at +5°, partly off the axis,
  dimmed to 0.6. They are the screens of the steps below; on scroll they fly to their step slots.
- Under the hero: the meta label ("Public beta · 1.0.0-beta · Since Sep 2026": `status`, `version`,
  `started`), the title 72 px, the promise (`summary` at `--fs-lede`, ink-2, 2 lines).
- The capsule, fixed at the bottom centre, 24 px from the edge (Dia's sticky pill [M]): Close
  (44 px, icon `close-20-medium`), the live link in the product colour with its measured ink ("Open
  Recto", icon `arrow-up-right-16-medium`), and "Code". Labels from `links`.

First screen, phone (comp `open-390.png`):
- Hero full width (358 px) at y 76; no flanking prints; the head at y 340; then the facts row as a
  centred 2-column grid (Role, Runs on, Stack); the capsule at the bottom.

The parts of a presentation, in this order (Dia and Notion; content from the project file; any
part without data is hidden):
1. **Hero and head** (above).
2. **Facts row:** Role (`role`), Runs on (`runsOn`), Stack (`stack`). Desktop: three centred
   columns in `--w-wide`. Phone: the 2-column grid.
3. **Steps** (Dia): the outcome line first: `what.text` in `--fs-h3` Newsreader, centred, at most
   3 lines in 760 px. Then one step per `reel` item. Step title = the caption text before the
   colon; step body = the text after it. A reel item without a caption shows its screen and its
   number only (and the lead asks the owner for the line: content, no code).
   - Desktop: a pinned centred stepper. At the top, the index row "01 Markup · 02 The Library ·
     03 One capsule" (`--fs-label`; active in ink with a 2 px rule under it; inactive in ink-3).
     The screen (880 px, 16:10) in the middle; the step title (`--fs-h4`) and body (`--fs-body`,
     ink-2, at most 36 em) centred under it. Each step holds 90 svh of scroll. When the next step's
     threshold crosses 50 % of the view, the change plays in time (not scrubbed): the old screen
     moves up 24 px and fades out, the new one comes in from 24 px below over 500 ms on
     `--ease-soft`, the text swaps in 300 ms. This is Dia's pinned accordion turned onto the
     centre axis [M].
   - Phone: no pin. Per step: the screen first, then "01", the title and the body (Dia phone [M]).
     English Prep uses its phone captures here (`phone` in `reel`).
4. **Numbers band** (if `what.numbers`): the values in `--fs-h2` Newsreader, the labels as labels,
   one centred row (English Prep: 10 topics, 60 lessons, 241 questions).
5. **Why** (if `why.quote`): the quote in `--fs-h3` real italic, centred.
6. **How it's made** (Notion's second level, if `how.items`): the label "How it's made", then one
   wide card (`--w-wide`, radius 16, padding 32, `--e-card`, ground one step above the paper)
   holding the items as a two-column list (one column on phones), with a capture crop bleeding
   out of the card's lower edge.
7. **Next project:** the next project's front print peeks at the bottom. Click: the layer closes
   onto that print and opens it (one continuous move).

URLs: every project has a real URL. In the lab: `/lab/one/work/<slug>/`; later on the live site:
`/work/<slug>/` (the old project URLs, so CV links keep working). Open does
`history.pushState({ p: slug }, '', url)`. A direct visit gets a static page with the same
presentation (complete without JS) and a close link to `/lab/one/#<slug>`. `/lab/one/#<slug>`
scrolls Home to that project without opening it.

Close: the Close button, Escape, the browser Back and the iOS edge swipe. All four use one history
step. Focus goes back to the print's button, and the deck stands on the same project.

### 3.4 The rest (PART A)

The ground changes once, by the tear (section 4.7), from the night ground to `--paper`. The aura
turns sunset gold. Each strip: a label above (Emil Kowalski form [M]), then one container, centred;
`--s-9` between strips (phone `--s-8`).

1. **ID card** (label "About"). The card hangs from the torn paper edge on its lanyard, centred.
   Reimplement it with the owner's notes [O]: the back gets a denser surface (a CD-like
   interference sheen: conic gradient plus grain, moving with the tilt); the lanyard and the card
   move as one pendulum that pivots at the anchor (never the card turning under a still strap).
   Front: the photo (`eren-ytu-gate`), the name, "Computer Engineering · Yıldız Technical
   University", the year, "Issued Oct 2026". Back: `about.card.back`. The front carries no links
   (they live in Contact). One hint line under it (`about.card.hint`).
2. **How I work.** The two lanes (`about.chapters[work].tracks`). Desktop: two cards of 400 px,
   mirrored about the axis with 120 px between them, a thin centred line between them that meets
   at "Both matter." (`meet`). Each lane: label, three items, then "What it teaches" (`teaches`) and
   its `gives` line. Under them the quote (`quote`) in `--fs-h3` real italic. Phone: the lanes stacked,
   joined by one vertical line on the axis.
3. **Path.** The timeline (`about.chapters[next].timeline`, 5 stops). Desktop: one horizontal
   line across `--w-wide`, 5 stops, the "now" stop lit gold, under each stop the when (label) and
   the what (`--fs-small`). Phone: a vertical line on the axis, each stop's text centred under its
   dot. This is the one place of "skipped the prep year".
4. **Photos.** Three postcards on the paper "table": `park-through-lens` (with its note and place),
   `metro-platform`, `cat-sunset-silhouette`. Desktop: a centred fan, about 300 px wide each (the
   landscape metro photo 360 px), at -5°, +2°, -2°, overlapping by 12 %. Phone: one under the other
   at 80 vw, ±2°. Click or tap: the postcard grows (shared element) to the large view, centred,
   height min(76 svh, 820 px), over the ground dimmed to 70 %. There a click turns it over (700 ms,
   the kit's settle spring), a mouse drag swings it (clamped ±18°, springs back), a tap on a phone
   turns it, and Escape, Back or a click outside returns it to its place. The photo in the large
   view develops from its line twin to colour in 600 ms (Darkroom's burn-in, much faster [O]).
   The postcard's back is designed new: the divided back, the stamp cut from the photo, the postmark
   in gold ink, the note in real italic.
5. **Now.** The label "Now, October 2026" (`now.label`) and the text (`now.text`) in `--fs-h3`,
   centred, at most 2 lines. The one place for "this month".
6. **Record.** The label "Record". The three newest entries as centred rows: date (label), title
   (`--fs-body` 500), kind. Each row links to its entry. Then "All entries" (link to the Record tab).
   The aura turns Record blue under this strip. Hidden while the Record is empty.
7. **Contact.** Two large pills, centred: GitHub (icon `github-20`) and LinkedIn (`linkedin-24`).
   The one place for the links.
8. **Footer.** The edk glass object (poster, then idle loop), 240 px, centred on its shadow, in
   the gold aura: the page ends with the signature (a bookend [M]). Under it the colophon line
   "The site …" (`about.colophon[1]`), then "© 2026 Eren Deniz Kuyucaklıoğlu. Code MIT; photos,
   renders and text all rights reserved." (owner, 2026-10-15 evening, item 5).

### 3.5 Every fact and its one place

The brief may summarise (the owner's exception); everything else appears once.

| Fact | Its one place | Also, as summary only |
|---|---|---|
| Full name | Brief H1 | ID card front (the card is the identity object) |
| Mark "edk" | Bar | Footer object (as art, not text) |
| Studies Computer Engineering | Brief lede | ID card front |
| Yıldız Technical University, first year | ID card front | Brief row "Studying" |
| Istanbul | Brief lede | Bar clock ("Istanbul" as the clock's place) |
| Builds products by directing AI agents | Brief lede | |
| Drawn to the low level | Brief lede | |
| Two tracks: by hand / with agents, what each teaches | How I work | |
| The quote "I don't stay away from AI …" | How I work | |
| CS50 and school code | How I work, the "By hand" lane | |
| Skipped the prep year with full marks | Path | |
| Started English Prep, then Recto; first term; next | Path | |
| Each project's name and promise | Work (the same element travels into the presentation) | Brief "Building" chips (names only) |
| Status, version, start | Work meta label (travels into the presentation) | |
| Role, runs on, stack | Presentation facts row | |
| Features, steps, numbers, why, how | Presentation | |
| Live and code links of a project | Presentation capsule | |
| This month | Now | |
| Newest entries | Record strip (pointer); the entries live on the Record page | Brief "Writing" row (last date only) |
| GitHub, LinkedIn | Contact | |
| How the site is made | Footer colophon | |
| How the Record is written | Record page (its colophon) | |
| Photos | Postcards (three) and the brief plate (Bostancı); each photo in one place | |
| Owner's portrait | ID card (gate selfie) | |

Removed from the old About because they repeat: "Who I am" (= lede), "Where I study" text and facts
(= ID card, Path), "At school, by hand" (= the By hand lane; its "not much to show yet" is
unwritten and hidden), "The products" (= Work), the separate links list (= Contact), the selfie
caption (= ID card).

---

## 4. Motion choreography

Rules for every motion: native vertical scroll only (no wheel or touch capture, no smooth-scroll
library, no mandatory snap). Text is readable from first paint at its rest place or within 1.2 s.
Body text moves only at page speed, or it is pinned. Everything settles within 1.5 s of the last
input, except the aura drift and a playing video. One scrubbed scene and one turning prop per
viewport. Every motion here has a reduced-motion twin (section 4.11).

### 4.1 Arrival (Compose)

Desktop, from first paint:

| t (ms) | What |
|---|---|
| 0 | Ground, grain, bar and the name are present. The field is at 0. |
| 0–1200 | The aura blooms to rest, `--ease-out`. |
| 0–2400 | The construction lines draw (`stroke-dashoffset`), `--ease-draw`, 8 % to 10 % ink. |
| 180, 270, 360, 450 | The lede, then the three rows, fade in and rise 10 px, `--t-reveal`, `--ease-out`. |
| 300–2700 | The line twin reveals outward from the vanishing point (a radial mask from 0 to 150 %), `--ease-draw`. |
| 540 | The Work label. |
| 620–1520 | The first stack rises 24 px into its peek place, `--t-move`, `--ease-soft`; the prints settle with `--ease-settle` 60 ms apart. |
| 2400 | The signal light fades in (300 ms). Then only the aura drift moves. |

Phone: the same order; `--step` 75 ms; rise 8 px; the line twin is the phone crop.
No loader, no hidden content: without the animation everything is in place.

### 4.2 Arrive one by one (scroll reveal)

- Trigger: an element's top passes 85 % of the view; it plays once.
- Text: opacity 0 → 1 and a 12 px rise, `--t-reveal`, `--ease-out`. Images, prints, cards: a 24 px
  rise and scale 0.97 → 1, `--t-move`, `--ease-soft`; an image may come in from a 2 px blur while
  it decodes (Dia). Siblings `--step` apart, at most 4 per group.
- Phone: 500 to 600 ms, 16 px, 75 ms apart.
- Never inside a Record reading column (charter §3).

### 4.3 Layers and parallax (the 2.5D plates)

| Layer | Speed | Content |
|---|---|---|
| L0 | fixed | ground, field, grain |
| L1 far | pinned for 1 to 1.5 vh, then 1× | the line twin, the construction lines |
| L2 mid | 0.6× | the glass objects, the colour plate of the portal |
| L4 text | 1× | all reading text and buttons |
| L5 props | 1.25× (at most 1.5×) | UI fragments, chips, the ID card's anchor |

- A prop may turn with scroll: at most ±4° (UI fragments in Work), one turning prop per viewport.
- Pointer parallax (desktop, fine pointer): L1 4 px, L2 10 px, L5 18 px at 1440, smoothing time
  constant 100 ms, settled by 330 ms [M, halved for a calmer page].
- Phone: L1 pinned 0.6 vh and L5 at 1.15× only; no pointer or device-tilt parallax.

### 4.4 The aura follows the content

- The field takes the set of the section whose box crosses the middle of the view (an
  IntersectionObserver on a 10 % middle band).
- Between sections the pigments mix, scroll-linked, over 0.6 vh. At a Work settle: a 500 ms
  crossfade. The mark's dot and the rail's active bead take a1.
- Inside an open project the layer has its own aura; the field pauses.

### 4.5 The deck (Work), two clocks (Robin [M])

Clock 1, scroll-linked, 1:1, for geometry. In a project's slot, with p from 0 to 1:
- p 0 to 0.25, **arrive:** the set rises from 60 vh below as a fan (turns ±10° settling to the
  rest turns), `--ease-soft` over the range; the glass object comes at 0.6×; the props at 1.25×.
  The previous set lifts away: up 70 vh, +6°, scale 0.92, opacity to 0, at 1.25×, `--ease-exit`.
- p 0.25 to 0.9, **shuffle:** one print per 0.35 × 100 svh: the front print slides out to the right
  (40 % of its width, +8°) and tucks behind; the next print comes forward and gains colour (dimmed
  0.62 to 1 over the last half of its move). The caption counter changes.
- Phone: the same, with half the angles and no tuck to the side (the front print lifts 16 px and
  goes behind).

Clock 2, time-based, played once when the scroll settles (`scrollend` + 120 ms, or 200 ms without
movement) on a different project: the old meta, title and promise go out (`--t-quick`, rise -8 px);
the aura crossfades (`--t-swap`); the new texts come in (260 ms, delay 140 ms, `--step` apart); the
index number and the rail bead move (`--t-ui`, `--ease-ui`). The swap never plays while the visitor
is still scrolling fast.

Focus and keys: each project's button is in DOM order. Focus on it scrolls the page to that
project's settle point. Enter or Space opens.

### 4.6 The portal, once (Brief to Work)

- At 0.55 to 0.95 vh of scroll the signal light grows into a ring of grain and sparks (a radial
  mask plus a sprite ring, no WebGL) from 8 vw to cover the view. Inside the ring the plate shows
  the Bostancı photograph in colour (darkened to 55 %, saturation 0.7) for a moment, then resolves
  to the Work ground in the Recto aura over the next 0.25 vh.
- Phone: the same ring over 0.3 vh.
- Priority 2 (after the core is shown to the owner).

### 4.7 The tear (Work to the rest)

- The `--paper` sheet has a torn top edge drawn in our grain with a faint light fibre line
  (`--line-2`). It scrolls up at 1× over the pinned last Work scene; its edge travels 1.2 to
  1.5 vh [M: Shopify 1.45]. The rail beads switch their ink as the edge passes them.
- The ID card's lanyard hangs from this edge: as the edge rises, the card drops into view and
  swings to rest (the kit's settle spring, clamped).
- Phone: travel 1 vh.

### 4.8 Open and close (the paper grows)

Mechanism: same-document View Transitions (`document.startViewTransition`). Shared names per
project: `paper` (the print mount → the layer ground), `shot` (the front screen → the hero), `meta`,
`title`, `promise`, `side-1`, `side-2` (the other prints → the flanking slots), `obj` (the glass
object, desktop). Old snapshots of `shot` are hidden (`::view-transition-old(shot) { display: none }`)
and the new one is `object-fit: cover` (tech §3).

Open, desktop, `--t-open` 900 ms (the lab switch `?open=1400` multiplies every time by 1.55):

| t (ms) | What |
|---|---|
| 0 | Click, Enter or Space. The front print lifts: scale 1.02, `--t-press`. Then the transition starts. The URL changes. |
| 0–900 | `paper` grows from the print's box (with its -1.6° turn) to the full view (0°), `--ease-path`. The mount becomes the page: "the paper grows" [O]. |
| 0–900 | `shot` moves and grows to the hero box, `--ease-path`. It is never hidden. |
| 0–700 | The project's aura floods outward from the print's box (the layer's light, radial mask), `--ease-out`. |
| 0–700 | `meta`, `title`, `promise` travel from under the stack to the head, `--ease-path`. |
| 100–1000 | `side-1`, `side-2` fly from behind the hero to their flanking places, 70 ms apart, `--ease-soft`, each from its stack turn to its new turn. |
| 500 → | The facts row and the first parts arrive (4.2). At the end, focus moves to the title (the layer's h1). |
| settled + 300 | The signature clip starts in the hero (if playback is allowed). |

Close, `--t-close` 800 ms: the non-shared content fades out (200 ms), then the shared elements go
back to the stack (the same names, reversed), the aura contracts to the print (600 ms), and the
other prints tuck back in with `--ease-settle`. The deck stands on the same project. No frame where
everything is covered.

- Phone: the same names; `--t-open` 650 ms and close 600 ms; no `side-*` (on phones the other
  prints fade in 200 ms in the steps instead); the system Back gesture closes.
- iOS edge swipe: skip the reverse transition when `event.hasUAVisualTransition` is true.
- A second click during a transition calls `skipTransition()`; nothing queues.
- No View Transitions support: an instant state change with a 150 ms crossfade of the layer.

### 4.9 Hover and press

- A print (fine pointer): lift 4 px, scale at most 1.02, saturation +10 %, 200 ms in and 300 ms out,
  `--ease-out`; the fan of the stack opens 4° wider. Links: colour and underline in 150 ms.
- Touch: a press state (scale 0.98, `--t-press`); no content only on hover.
- The capsule buttons and tabs: background change 150 ms, `--ease-ui`.

### 4.10 Ambient

- One loop: the aura drift (2.6). Muted video plays only in an open presentation, one at a time,
  and only while on screen.

### 4.11 Still twins

- **Reduced motion:** no pin, no parallax, no drawing, no portal, no tear motion, no drift.
  The deck becomes a vertical list: each project is its stack at rest (prints side by side,
  untilted), then its text block. The aura pools are placed inside each section (absolute, not
  fixed), so the colour follows the content with no animation. The open is an instant change (or a
  150 ms crossfade). The ID card and postcards turn by a crossfade; a drag jumps to the end state.
- **No JavaScript:** the same list layout as reduced motion where CSS scroll timelines are missing;
  where the browser has them, the CSS-driven scenes still run (they are CSS). Every "Take a look" is
  a real link to the project's static page, so the open still works (a cross-document View
  Transition with the same names gives the morph in Chrome). The postcards show the front with the
  place and note under it. The ID card shows the front.
- **No WebGL:** nothing in this round uses WebGL.
- **Phones:** the full design of section 3, not a lighter page.

---

## 5. The bar and the rail

- Bar: section 3.1. The mark links to Home; the clock is `scripts/clock.ts` unchanged.
- Rail: the beads (`src/scripts/rail.ts`, `src/styles/rail.css`, ADR-0013), unchanged in look.
  It is the index of Home: "Eren", "Recto", "English Prep", "Eat Map", "About", "How I work",
  "Path", "Photos", "Now", "Record", "Contact". Each section carries `data-rail-sec` and
  `data-rail-accent` (its a1). The active bead glows in a1.
- In an open project the page rail hides; PART B creates the layer's own rail with
  `createRail({ scroller: layer, … })`, listing the presentation's parts.
- Priority 2: the index flight. Between 0.25 and 0.7 vh the "Building" chips of the brief fly
  to their rail beads, scroll-linked, 0.03 vh apart [M: Shopify's index]. Desktop only.

---

## 6. The Record page (built later; same tokens)

- Same bar, same field (Record blue set), same grain, same rail.
- Head: "The record" in `--fs-h2`, the dek (`log.dek`) in `--fs-lede`, centred in `--w-text`.
- The list: centred rows in `--w-text`: date (label), title (`--fs-body` 500), kind and project
  dots. Year headings as labels.
- An entry: the charter's reading rules (Newsreader 21 / 19 px, line height 1.55, weight 430, at
  most 28 em). No motion inside the reading column. Its colophon is `log.writingNote`.
- A plate may come later (the metro mirror photo as a line twin is a candidate); not in round one.

---

## 7. Stack, budgets and files

### 7.1 Decision

- Astro 7, static, as today. No client router.
- **No GSAP, Lenis, Motion, three.js or OGL on the site.** Native CSS first: scroll-driven
  animations (`animation-timeline: view()` and named view timelines), `position: sticky`,
  `@property` colours, same-document View Transitions, the existing cross-document transition for
  the tabs. Reasons: compositor-driven scroll scenes cost 0 ms of script per frame [M, tech §2.3];
  Back, keys and momentum stay native; first paint stays inside the budget.
- **One scroll driver for browsers without scroll timelines** (Firefox, iOS 18): `scrub.ts`, about
  2 KB. Every scene is written once, as CSS keyframes. Where `CSS.supports('animation-timeline:
  view()')` is true, the timeline drives them. Elsewhere the driver pauses the animation and sets
  `animation-delay: calc(var(--p) * -1s)` from a rAF that reads the scene's progress (one style write
  per scene per frame, only while the scene is on screen).
- Springs: `docs/family-kit/springs.js` at build time (CSS `linear()`), and its JS solver for the ID
  card and postcard drags.
- Offline tools: `potrace` and Python (numpy, Pillow) for the line twins; HyperFrames is not needed
  in round one (the existing signature clips serve).

### 7.2 Budgets

| Item | Budget |
|---|---|
| First paint (tests/budget.mjs) | ≤ 190 KB of the 200 KB limit |
| Preloaded fonts | Inter latin + tr, Newsreader latin + tr: 120.8 KiB (measured file sizes) |
| HTML with inline CSS (gzip) | ≤ 30 KB |
| PART A script (gzip, first paint) | ≤ 10 KB |
| Grain tile + first print still | ≤ 25 KB |
| Line twin plates (after first paint; AVIF or WebP with alpha, 1440 and 900 wide) | ≤ 60 KB each |
| PART B chunk (dynamic import when Work is within 1.5 screens, or on idle) | ≤ 16 KB gzip |
| Each print still (AVIF, 680 w and 1360 w; phone 320 w and 640 w) | ≤ 70 KB at 1360 w |
| Home before any open, after load | ≤ 900 KB desktop, ≤ 700 KB phone |
| One open presentation on a phone (stills + one clip) | ≤ 1.5 MB |
| Video loop | phone ≤ 300 KB best codec (H.264 ≤ 450 KB); desktop ≤ 600 KB |

### 7.3 Files

PART A (shell):
- `src/layouts/One.astro`: the document, fonts, `tokens.css` and `base.css`, the bar, the field,
  the grain, the rail hookup, `<slot />`, and the still-twin classes (`html.js`, `html.still`).
- `src/pages/lab/one.astro`: noindex, not linked, out of the sitemap (check the sitemap filter in
  `astro.config` covers `/lab/`). It places Brief, `<Work projects={projects} base={base} />`,
  the rest and the footer.
- `src/one/tokens.css`, `src/one/base.css` (reset, type roles, chips, buttons, hush, grain),
  `src/one/field.css`.
- `src/one/Bar.astro`, `Field.astro` (pools, grain, plates), `Plate.astro`, `Brief.astro`,
  `rest/IdCard.astro`, `rest/Tracks.astro`, `rest/Path.astro`, `rest/Postcards.astro`
  (plus the large view), `rest/Now.astro`, `rest/RecordPointer.astro`, `rest/Contact.astro`,
  `Foot.astro`. Reuse logic from `src/scripts/card3d.ts`, `postcard.ts`, `clock.ts`, `rail.ts`;
  copy into `src/one/scripts/` only what changes.
- `src/one/scripts/shell.ts` (entry), `bus.ts` (the interface, 7.5), `field.ts`, `scrub.ts`,
  `arrive.ts`, `tear.ts`, `portal.ts` (P2).
- `tools/illustrations/line-twin.py` (see 7.4) and its outputs in `media/plates/bostanci/`.
- `tests/e2e/lab-one.spec.ts`.

PART B (Work):
- `src/one/work/Work.astro` (the root), `Deck.astro`, `Print.astro`, `Presentation.astro`,
  `Stepper.astro`, `work.css`.
- `src/one/scripts/work/deck.ts`, `open.ts`, `stepper.ts`.
- `src/pages/lab/one/work/[slug].astro`: the static twin of each open presentation.
- `tools/captures/props.mjs` (UI fragment crops) and the new content fields `props` and `focus`
  (data, schema in `src/content.config.ts`).
- `tests/e2e/lab-one-work.spec.ts`.

### 7.4 The line twin tool

Spike: `phase3/tools-lt/linetwin2.py` (run with `python3 -I`). Steps: crop, median 5, upscale
1.6×, Gaussian blur, gradient magnitude, non-maximum suppression, threshold at the 90th
percentile, dilate 3, then `potrace`. The Bostancı crop is x 0 to 1160, y 700 to 2576 (the
vanishing point lands on the crop's centre axis). The SVG output is too heavy (189 KB gzip): ship
the bitmap as ink-coloured alpha AVIF/WebP at 1440 and 900 px wide. PART A cleans the result:
remove the speckles in the station area, keep the rails, the catenary and the platform edges.
The traced figure under the umbrella is not identifiable in line form; keep it (it gives scale).

### 7.5 The A/B interface

PART A owns the page; PART B owns one slot. PART B touches no file of PART A, and the reverse.

```astro
<!-- src/pages/lab/one.astro (A) -->
<Work projects={projects} base="/lab/one/" />   <!-- projects: getProjects(), sorted by order -->
```

- PART B renders `<section id="work" data-part="work">` and, inside it, one element per project
  with `id={slug}`, `data-rail-sec={title}`, `data-rail-accent={a1}` and
  `data-aura="a1 a2 a3"`. PART A's rail and field read these attributes.
- `src/one/scripts/bus.ts` (A) exports:
  - `setAura(pigments: [string, string, string], o?: { ms?: number }): void`
  - `hold(owner: string): void` and `release(owner: string): void`: while held, A's section
    observer does not change the aura (B holds it while the deck is pinned).
  - `pauseField(paused: boolean): void`
  - `motion(): 'full' | 'reduced'` (reduced motion or `?still`)
  - events on `document`: `one:layer-open` `{ slug }` and `one:layer-close` `{ slug }`. A answers:
    pauses the field, sets `inert` on `#main`, hides the page rail; and the reverse.
- Z-index map, tokens and fonts: section 2. B declares the wordmark faces in `work.css`.
- Order of work: A lands the layout, tokens, bar, field and an empty Work slot first (one commit),
  so that B builds into the real page. Until then B uses its own scratch lab page.

### 7.6 Priorities

- **P1 (the first lab show):** A: tokens, bar, field and grain, the brief with its plate and arrival,
  the rest (ID card front and back, tracks, path, postcards with the large view and turn, now,
  Record pointer, contact, footer), the tear as a static edge, reduced-motion and no-JS twins.
  B: the deck on both widths, open and close with URLs, the presentation for all three projects
  (stepper on desktop as time-based steps, linear on the phone), the static project pages.
- **P2:** the portal, the tear in motion, the index flight, the drift switch, pointer parallax,
  the burn-in of the large postcard view, the CD sheen of the card back.

---

## 8. Limits a critic will test, and the checklist

### 8.1 Limits

- **Type:** largest text on the brief and the rest 42 px desktop / 32 px phone; in Work and an
  open project 72 / 44 px. Body at least 16 px. Labels at least 13 px; 11 to 12 px only for
  captions inside a print or figure. At most 6 font sizes in one viewport.
- **Line length:** body at most 70 characters (target 55 to 68); lede at most 64; Record at most
  28 em.
- **Contrast:** `npm run palette:gate` passes, with new PAIRS rows: ink, ink-2 and ink-3 on
  `--paper`, on each project paper, and on "ground + each aura set at 0.08 additive"; the product
  buttons with their inks. Every text block over a pool carries the hush.
- **Frames:** Chromium headless shell, CPU 4× throttle, the whole Home scrolled with
  `Input.synthesizeScrollGesture` at 1000 px/s, desktop 1440×900 and phone 390×844 at DPR 3:
  main-thread rAF interval p95 ≤ 16.8 ms, frames over 25 ms ≤ 3 %, own script per frame
  p95 ≤ 2 ms. GPU numbers are not gated (software GPU). Harness: `phase3/tech/measure.mjs`.
- **Bytes:** section 7.2; `npm run budget` passes.
- **Durations:** first visible response to any input ≤ 160 ms; UI ≤ 300 ms; reveals 500 to 900 ms;
  open 900 ms (1400 with the switch); close 800 ms; arrival text complete ≤ 1.2 s, arrival
  complete ≤ 2.8 s; after the last input, motion stops within 1.5 s (except the drift and video).
- **Overflow:** none at 390, 1180 and 1440 (and none at 320).
- **Targets:** at least 44 px on touch; at least 24 px with a pointer.
- **Never:** a loader or gate; `preventDefault` on wheel, touch or keys that scroll; a smooth-scroll
  library; mandatory scroll snap; a white area larger than a product screen; #000 under text or
  #fff as text; faux italic; typed symbols or emoji (icons from `tools/icons`); the same sentence
  in two places (the brief excepted).

### 8.2 Checklist (the critic signs each line; screenshots at 1440×900, 1180×820 touch, 390×844)

1. The first screen matches `first-*.png` in structure: name, lede, three rows, the Work peek.
2. Everything is centred on the page axis; nothing sits in a left column.
3. Each fact is in its one place (table 3.5); a script finds no repeated sentence of 5 words or
   more outside the brief.
4. The aura changes with the section and the project; text over it keeps the hush.
5. The deck on desktop and on the phone matches `work-*.png`; scrolling turns the prints frame by
   frame; the title swaps only after the scroll settles.
6. Open: the print's paper grows into the page, the screen is never hidden, the other prints and
   the texts come with it; the URL changes; Back, Escape, Close and the edge swipe all return to
   the same project; a reload of the project URL shows the complete page.
7. The open presentation matches `open-*.png`; its steps follow the reel; unwritten parts are
   hidden.
8. The ID card's lanyard moves with the card; its back has the denser surface.
9. The postcards grow to the large view, turn and swing, and return to their place.
10. Reduced motion: no pin, no parallax, no drift; everything reachable; the open is instant.
11. No JS: a complete page; every project opens through its link.
12. Section 8.1 limits pass: palette gate, budget, frame harness, overflow, targets.
13. Frame sequences of the arrival, a deck scroll, an open and a close, at both widths, are in the
    report (one frame per 100 ms).

---

## 9. Open taste points (lab switches, not questions)

1. `?work=deck|drift`: Work stacked (the deck) or side by side (the drift), desktop. The owner
   said "stacked or side by side" [O]. Default: deck.
2. `?cap=line|large`: the postcard caption as one line under the card, or only in the large view.
   The owner asked to test both [O]. Default: large.
3. `?open=900|1400`: the open tempo. The owner: "choose on a lab page" [O]. Default: 900.

Decided here and visible on the lab page (the owner may still overrule them): no glass object on
the first screen (the edk object closes the page instead); the Bostancı platform as the brief's
plate; no GitHub in the bar; the order of the rest; Eat Map shown by its object.
