# The Record's design language, and the Home Record strip (rows R1, R2)

Status: analysis for round 2, 2026-10-16. Read-only study of the live Record on `lane/review-plan`
(003f160), built and served locally (port 4721). Sources: `src/pages/record/index.astro`,
`src/pages/record/[year]/*`, `src/components/LogList.astro`, `LogRow.astro`, `YearStrip.astro`,
`Media.astro`, `src/scripts/media.ts`, `src/styles/log.css`, `src/styles/global.css` (bar, tabs, media
stage, accent), `src/styles/transitions.css`, `media/objects/recorder/manifest.json`, `docs/design/log.md`.

Evidence (all under `(session scratchpad) round2/`):

- Stills: `rec-shots/{d,p}-{index,index-full,year,note,entry,release,essay,essay-full}.png`
  (d = 1440x900, p = 390x844 at 2x, touch). No console errors at either size.
- The current lab strip for contrast: `rec-shots/lab-strip-{d,p}.png`.
- Motion, from a recorded 1440x900 session (`rec-video/*.webm`) cut into frame sheets:
  `arr-v.png` (Home to Record by the tab, 10 fps), `lean-v.png` (pointer across the object, 4 fps),
  `press-v.png` (press on the object, 5 fps), `leave-v.png` (Record to Home, 10 fps),
  `row-sheet.png` (row at rest and on hover).

---

## 1. What the owner loves, measured

The owner named "its 3D object and its animations". The frame sheets show what that means. Almost all
the Record's motion lives in the object and in the chrome. The list itself is still.

| Motion | What happens (measured in code and frames) | Source |
|---|---|---|
| Arrival by the tab | The previous page's object flies to the Record's header slot as one view-transition group (`stage`, 720 ms, `--ease-move`, plus-lighter), and melts into the recorder. In `arr-v.png` the `edk` letters slide up and right, a small recorder appears at about 300 ms, and it settles by about 900 ms. | `transitions.css` l.41, `media.ts` droplet |
| Page cross-fade | Old root fades out in 160 ms; the new root rises 12 px over 320 ms. | `transitions.css` l.14-15 |
| Droplet | The object melts into a droplet when you leave (24 frames, 400 ms) and grows back from one when you arrive. | manifest `droplet`, `media.ts` l.727+ |
| Light sweep | One slow band of light crosses the object on arrival (1800 ms). | `global.css` `m-sweep` |
| Float | The object bobs up and down by 0.55 % of its slot (about 2 px at 320 px), a 6.98 s sine, quantised to whole device pixels so it never blurs. | `media.ts` `bobFrames` |
| Lean (desktop, fine pointer) | Exact pre-rendered frames from a 33 x 3 grid (yaw -16 to +16 deg in 1 deg steps; pitch -4, 0, +4). A spring with damping 0.9 settles in about 300 ms. Only a pointer near the object moves it. When the pointer leaves, the object returns to rest. | manifest `lean`, `media.ts` `follow` |
| Press | It glides to the rest pose, then plays the interaction clip (the reels turn, the light pulses), then returns to the lean. | manifest `clips`, `media.ts` `play` |
| Glint | A soft highlight follows the pointer. A luminance mask keeps it on the object's own light. | `global.css` `.m-glint` |
| Tab and accent | The active pill's light is tinted by `--accent`, a registered colour. On the Record the accent is the Record blue `#8fb8ff`. The colour glides over 720 ms instead of jumping. The pill indicator slides between tabs (450 ms, `--spring-ui`), and its lens leans toward the tab under the pointer. | `global.css` l.506-561 |
| Row hover | The row's mark grows to 1.3x (120 ms). The title brightens to `--ink-hi`. Text never moves. | `log.css` l.288, 300 |
| Entry page | A faint wash of the project's colour at the top (at most 14 %), gone by about 600 px. It is still. | `log.css` `.post-light` |

Rows do not reveal, fade or rise on scroll. Figures are still on purpose (`log.md` §7.3: "no
draw-on-scroll, no fade-up"). The list is a calm, dense document. The object and the chrome supply
the life. That contrast between a precise still document and one living object is the core of the
language. Copy that contrast, not just the parts.

## 2. The language as rules

### 2.1 Type

- Three roles, never more. **Display** (Newsreader 400) for the page title, the year, entry titles and
  the release name. **Reading** (Newsreader 430, 21/1.5, 19 px on phones, at most 28 em) for a note's
  text, which is printed whole. **UI** (Inter 400/500) for the dek, the dates, the meta line and the
  month labels.
- Sizes on the index (old tokens): title 48 (`--t-h2` at 1440), year 25, entry title 25/1.2, release
  name 34/1.08 (29 on phones), note 21, dek 17/1.5, meta 13/1.35 with tabular figures, months 12
  (11 on phones).
- A note looks like a sentence, an entry like a headline, a release like a version number, and an
  essay like a headline with a picture. The kinds differ by **shape**, never by a badge or a label.
  The lab strip breaks this rule: it prints "NOTE", "ESSAY" in capitals.
- Never uppercase labels, never tracking, never all-sans titles. The Record's titles are serif and
  sentence case. The lab strip's titles are Inter 500, centred, and that is the main reason it does
  not read as the Record (R1).

### 2.2 Colour

- Graphite ground `#121214`. Inks: `--ink` `#e8e3dd`, `--read` `#dedad2` (note text), `--ink-2`
  `#d3cfc7` (dek), `--ink-3` `#a19d96` (dates, meta, months), `--ink-4` (non-text only).
- **Colour does one job: "which project".** Recto `#bbed26`, English Prep `#efb1cb`, Eat Map
  `#eb4f6b`; the Record blue `--log` `#8fb8ff` for an entry about none. Colour appears only on:
  the spine mark, the year-strip tick, the project name in the meta line (measured ink, weight 500),
  the release name, the release bullets, and the key line and wash on an entry page.
- An entry about two or three projects shares its mark in hard-edged conic slices (`markFill`).
- The page light is Record blue: one radial pool behind the header (`--glow-base` 11 %) and the
  object's glow. There is no other tint and no glow on marks (`log.md` §8).

### 2.3 The date spine and the year strip

- **Columns** (desktop): a 64 px date gutter, a 36 px spine column, a content column of at most
  680 px, and a 244 px thumbnail column on essays and releases. Rows have 26 px padding top and
  bottom. A `--rule` hairline separates rows; it starts at the content column, not at the gutter.
- **Spine**: one 1 px line in `--rule-2`, centred in the spine column, fading out over its last 48 px.
  Each mark has a 4 px ring of ground colour (`box-shadow 0 0 0 4px var(--ground)`), so it cuts the
  line instead of sitting on top of it.
- **Marks by kind**: a note is an 8 px dot. An entry is an 11 px dot. An essay is a 13 px ring with a
  hole of about 3.6 px (radial mask). A release is a 10 px dot inside a ring: 2.5 px of ground, then a
  1.5 px ring in the project colour at 80 %. Each mark sits on the first baseline of its row
  (`--mark-y`).
- **Year strip**: twelve equal month columns over the content column (at most 680 px). Each column
  has 40 px for ticks above a `--rule-2` baseline and a 12 px month label below it. One tick per
  entry: 4 px tall, radius 2, in the project colour, stacked from the baseline up with a 3 px gap. A
  note's tick is 45 % wide; a release's tick is 6 px tall. More than six in a month shows "+n". A month
  with entries is an anchor to its top row; an empty month is an honest gap.
- The year itself (display face, 25 px) and its count ("8 entries", meta) sit in the gutter, level
  with the strip's baseline.
- Phone: the gutter goes to 0 and the spine column is 22 px at the left edge. The date sits above
  each row. The thumbnail runs full width above the text. The strip spans the width and the year
  and its count sit on one line above it.

### 2.4 Light and object

- The recorder (`media/objects/recorder`) is a glass cassette recorder, pre-rendered, ground-subtracted
  and drawn with plus-lighter over a Record-blue glow. It sits at the right of the header at 320 px
  (176 px on phones). Negative margins keep the header at about 220 px, so the first entry is on the
  first screen at 1440x900.
- The object is the only 3D thing on the page and it is never cropped. Every effect has a still twin:
  the poster is complete in the HTML.

### 2.5 Motion

- **One living object, a still document.** Text never moves on hover. Feedback is a mark that grows,
  an ink that brightens, or a colour that glides.
- Durations from the old set: 120 (hover), 200, 320 (page in), 480, 720 (accent glide, stage morph).
  Curves: `--ease-out` (0.2, 0.7, 0.1, 1), `--ease-move` (0.65, 0, 0.35, 1), `--spring-ui` (450 ms,
  damping about 0.87), `--spring-object` (750 ms, damping about 0.6).
- Continuity between pages: the stage, the mark's dot, the tab indicator and the bar are named
  view-transition groups, so they travel across the page change while the content cross-fades.
- Pixel discipline: bitmaps move only in whole device pixels at rest. There is no sub-pixel parallax
  on the object, and the lean shows exact frames.

### 2.6 Density

- The index is dense and calm: about 140 px per note row and about 190 px per titled row at 1440.
  Content occupies about 75 % of the 1060 px record width; the right side is the object's light. No
  boxes or cards; only hairlines and one line of colour.
- One row of controls at most (project links from 40 entries). The writing note and the feed sit at
  the foot, not the head.

### 2.7 What makes it feel loved

1. One object with real craft (glass, exact frames, a droplet between pages) that answers the hand.
2. Precision in small things: marks that cut the spine, ticks that stack by kind, tabular dates,
   colour that means one thing.
3. Honesty: empty months show as gaps, sample entries say "Sample", there are no counters or streaks.
4. Colour that travels: the tab light and the dot glide to the Record blue; the entry page takes its
   project's light.

## 3. Defects found on the live Record (fix before porting)

1. **The year archive page is broken** (`d-year.png`, `p-year.png`).
   `src/pages/record/[year]/index.astro` wraps the list in `<div class="inner">` without the `rec`
   class. So `--gutter`, `--spine-w` and `--spine-x` are undefined. On desktop the spine sits at the
   page edge and the marks float in the middle of the row (x about 280 to 440 px), and rows with and
   without a thumbnail start at different x positions. On phones the marks overlap the dates. The year
   also shows twice (the page title "2026" and the group head "2026"). Fix: add `rec` to the wrapper
   and hide the group's `.y-label` heading on the archive page, or drop the page title.
2. **The droplet-out frame shows a dark square** (`leave-v.png`, frames 6-7, about 100 to 200 ms after
   the Home click). A dark square plate shows behind the recorder. The cause is likely that the
   leaving stage, or the droplet video, is drawn for one or two frames before its plus-lighter group
   applies. Check this frame by frame (G4) before the Record's object is reused anywhere.
3. **One bright frame on arrival** (`arr-v.png`, row 4, centre): the recorder is visibly brighter for
   one 100 ms sample. This is probably the poster and the droplet-in clip adding up (both plus-lighter)
   during the crossfade. Verify it at 60 fps before reuse.

## 4. The Home Record strip, in the Record's language

### 4.1 What is wrong now (R1)

The lab strip (`RecordPointer.astro`, `lab-strip-d.png`) is three centred Inter lines under
uppercase labels ("8 OCT · NOTE · SAMPLE"), a pill button and a blue aura. It has no spine, no marks,
no project colour, no year strip, no serif, no object, and kind is shown by a word. None of the
Record's grammar is present, so it reads as a generic "latest posts" block.

### 4.2 What it shows

A **cut of the Record itself**: the same grid, marks, type and colours, at Home scale. In order:

1. **Head, left-aligned to the strip's content column**: the title "The record" in Newsreader at the
   new `--fs-h2`, and on the same baseline at the right, the count in meta ("8 entries since Sep
   2026", from the index's `count` string). The recorder object sits at the right of the head
   (desktop 280 px; phone 152 px at the head's right, overlapping as on the Record).
2. **This year's strip**: the real `YearStrip` of the newest year, full width of the content column
   (at most 680 px). Every tick, for the whole year, not just the three rows shown below. This is the
   "four years of continuous work" picture in one line, and it is the Record's most distinctive mark.
3. **The newest rows on the spine**: the three newest entries, rendered by `LogRow` in `compact` mode
   (no ids, so no duplicate anchors). A note shows its full sentence at 21 px reading size (cut to
   two lines on Home with `line-clamp: 2`; the Record shows it whole). An entry shows title and dek.
   A release shows the version in its project colour. Thumbnails are dropped on Home except for a
   release or an essay that is the first row.
4. **The hand-over line**: the spine does not end. It continues below the last row as a dashed line
   (the empty-record style, `repeating-linear-gradient` 4 px on, 5 px off) for about 72 px. Then comes
   a quiet link on the spine column: a small open ring mark, and "The whole record" in UI 15/500 with
   the `arrow-right` icon from `tools/icons`. No pill button.

Remove: the uppercase labels, the centring, "All entries" as a pill, and kind words. Keep "Sample"
in the meta line (honesty rule). Show project names in colour in the meta line.

### 4.3 Layout

- Desktop (1440): the strip is a 1060 px band (the Record's `--rec-w`), left edge on the page's
  content axis. Columns as on the Record: 64 px gutter (dates), 36 px spine, content at most 680 px,
  object on the right in the free space. The head stays within about 220 px. The whole strip is about
  760 to 820 px tall, one screen at 900 px.
- Phone (390): the Record's phone grid: a 22 px spine column at the left gutter, the date above each
  row, the strip full width (11 px months), the object at the head's right at 152 px. Three rows are
  about 520 px. This is a different composition from desktop, which is allowed and wanted.
- Ground: the strip sits on the plain ground with the Record-blue pool behind the object only
  (`--glow-base`). Do not put a full-section blue aura under the text. Text stands on at most
  `--aura-quiet`.

### 4.4 How it moves (scroll-linked, reversible, never an empty wait)

The Record page itself stays still in its reading column. The Home strip is not a reading column, so
it can carry G6 and M4 motion. Every scene below is a CSS keyframe on a view timeline (`scrub.ts`
fallback) and runs backwards on the way up. Progress `p` is the strip's `view()` timeline,
`entry 0%` to `cover 50%`.

1. **The spine draws** (`p` 0 to 0.55): the spine's `scale: 1 0` to `1 1`, origin top, linear in
   `p`. The dashed tail draws last (`p` 0.55 to 0.7). This is the continuous line the eye follows, the
   "oiled" feel.
2. **Marks land on the spine** as the drawing line reaches them. Each mark goes from `scale 0.4,
   opacity 0` to `1, 1`, mapped to a 0.08-wide window of `p` at its row's offset. Use `--ease-out`
   inside the window. The mark keeps its 4 px ground ring, so it cuts the line the moment it appears.
3. **Rows follow their marks**: each row's text goes from `opacity 0.0, translate 0 var(--rise)`
   (12 px; 8 on phones) to rest, in the same window shifted by +0.03. The date leads the text by 0.02.
   No blur, no skew: the Record's text does not distort.
4. **The year strip fills by month** (`p` 0.1 to 0.5): month by month from January, each column's
   ticks rise from the baseline (`scale: 1 0` to `1 1`, origin bottom). An empty month stays empty.
   The months carry the scroll from left to right, while the spine carries it from top to bottom.
5. **The recorder turns with the scroll** (desktop): use the existing lean grid as a scrubbed
   sequence. Map `p` 0 to 1 to yaw -12 deg to +12 deg on pitch row 1 (25 exact frames). The draw
   stays on exact frames with the existing short dissolve (`snapT`), so the object is always as sharp
   as the poster. When the scroll stops, the float resumes. A pointer near the object takes over with
   the normal lean, and a press plays the interaction clip, exactly as on the Record. Cost: the half
   tier is 796 KB for all 99 frames; load only row 1 (33 frames, about 265 KB) once the strip is one
   screen away.
   Phone: keep the float and the spin loop (the media tiers already do this). Do not scrub video
   `currentTime`, because it stutters on iOS.
6. **Light**: the Record-blue pool behind the object gains from 0 to `--glow-base` over `p` 0 to 0.4.
   The bar's dot and the field's pigments glide to the Record set as the strip reaches the middle of
   the window (the existing `data-rail-accent` and `@property` glide, 500 to 720 ms).
7. **Hover** (desktop), the Record's own: the mark grows 1.3x in 120 ms, the title brightens to
   `--ink-hi`, the thumbnail brightens to 1.06. Add one Home-only touch: the matching tick in the
   year strip brightens and grows to 1.15 at the same time. This links the row to its month, and the
   text does not move. Touch: the press state is the same, held while the finger is down.

Reduced motion, no JS, and no scroll timeline with the driver off: the strip renders complete and
still (spine drawn, marks and ticks present, object poster).

### 4.5 Hand-over to the Record page, with the tab

The aim: one continuous object and one continuous line, so the Record feels like the strip, opened.

- **Shared view-transition names** (cross-document, `@view-transition { navigation: auto }` is already
  in both `src/one/base.css` and `transitions.css`):
  - the strip's recorder `.m-stage` and the Record's header recorder: `stage`. The object flies from
    the strip to the Record's header (720 ms, `--ease-move`, plus-lighter), as it does today between
    tabs;
  - the strip's year strip and the Record's first year strip: `ystrip-<year>`;
  - each of the three strip rows and the same rows on the Record: `rec-row-<slug>`. Use `compact`
    LogRow on Home with a `data-vt` name, and name the matching rows on the Record only for the
    newest three, because names must be unique;
  - the bar, the mark's dot and the tab indicator keep their existing names (`bar`, `mark-dot`,
    `tab-ind`).
- **What triggers it**: "The whole record" link, any strip row's month tick, and the **Record tab**
  all navigate with the same transition. A row link goes to the entry page instead. There the root
  cross-fade (`deeper`, 420 ms rise of 24 px) applies, and the project light fades in.
- **Scroll position**: the Record page opens at the top. Because the strip's three rows equal the
  Record's first three rows, the named groups move from where they were on Home to where they sit on
  the Record. Nothing jumps and nothing reloads in view.
- **The tab between the two pages**: the pill has two tabs, Home and Record. When the strip is in view
  on Home, the Record tab gets a "near" state: its lens (the `.ind::after` light) leans toward it by
  22 %, as the live pill does on hover, and its label goes to `--ink-2`. On click the indicator slides
  to Record (450 ms, `--spring-ui`), the accent glides to `#8fb8ff`, and the droplet plays only if the
  recorder is not on screen (when it is on screen, the `stage` morph carries the object instead). Back
  from the Record: the reverse morph, and the Home opens at the strip if it came from there
  (`sessionStorage` key with the scroll offset, restored before first paint).
- **Without view transitions** (Firefox today): a normal navigation with the Record's own arrival
  (droplet in, sweep). This is acceptable.

### 4.6 Acceptance checks for the builder

- At 1440x900 and 390x844, a screenshot of the strip next to `d-index.png` / `p-index.png` must read as
  the same system: serif titles, coloured marks on a spine, a year strip, the recorder.
- Frame sheets at 60 fps of: the strip's scroll in both directions (no stepped jumps), the object
  scrub (every frame sharp), the tab click (no dark square, no bright frame; see §3), and Back.
- No text placed on more than `--aura-quiet` light. No uppercase labels. No kind words.

## 5. Moving the Record onto the new token set without losing it

`docs/design/one-spec.md` §6 plans the Record page as "centred rows in `--w-text`: date (label), title
(`--fs-body` 500), kind and project dots. Year headings as labels." **That is the lab strip's
language, which the owner rejected (R1).** Do not build §6 as written. Amend it with the owner first
(this is taste, so ask), with this proposal:

1. **Keep, unchanged in meaning**: the three kinds and their shapes; the spine and its four marks
   (sizes, the ground ring, conic slices); the year strip (twelve columns, stacked ticks, note at 45 %,
   release 6 px, +n after six, honest gaps); project colour as the only colour job; serif titles;
   reading type 21/19 px, 1.5 to 1.55, weight 430, at most 28 em; left-aligned columns (not centred);
   the recorder at the head with all its tiers; the project light on entry pages; the foot with the
   writing note and the feed; no counters.
2. **Map to new tokens**:
   - title `--t-h2` (36 to 48) to `--fs-h2` (32 to 42);
   - entry title and year `--t-h3` 25 to `--fs-h4` (20 to 24) or `--fs-h3` (24 to 29). Choose by
     screenshot: 25 px sits between them. Prefer `--fs-h3` at desktop for the release name (34 to
     `--fs-h3` would shrink the release look, so give the release name `--fs-h2` at its low end,
     32 px);
   - dek `--t-body` 17 to `--fs-body`; meta 13 to `--fs-label` 13; months 12 to `--fs-cap` 12;
   - `--rule` / `--rule-2` to `--line-1` / `--line-2` (0.08 / 0.14 against 0.10 / 0.18). The spine
     and the strip's baseline lose contrast, so use `--line-3` (0.22) for the spine, or measure first;
   - `--wash` to `--fill-1`; `--d-1..5` to `--t-press` 120, `--t-quick` 160, `--t-ui` 300,
     `--t-swap` 500, `--t-move` 900. The accent glide 720 ms has no exact token; use `--t-reveal`
     700;
   - `--ease-out` (old 0.2, 0.7, 0.1, 1) to the new `--ease-out` (0.22, 1, 0.36, 1). The new curve is
     softer at the end. That is fine for hover, but the stage morph must stay on a symmetric curve
     (`--ease-path`);
   - `--spring-ui` and `--spring-object` from `docs/family-kit/springs.js` at build time.
   - `--log`, `--log-ink` and the project colours already exist as the `record` aura set and in
     `world.json`. Keep `--log-ink` `#a8d3ff` for prose links; it is measured.
3. **The geometry is not a token**: 64 / 36 / 680 / 244 px and 22 px on phones are the Record's grid.
   Give them names in the new set (`--rec-gutter`, `--rec-spine`, `--rec-col`, `--rec-thumb`) and record
   the numbers in the charter before use, as `CLAUDE.md` requires for the new token set.
4. **The object stage needs its CSS.** `src/one/` has no `.media` rules. Port the stage block of
   `global.css` (about lines 248 to 312: `.media`, `.m-stage`, `.m-glow`, `.m-layer` states, the
   lean wrapper, `.m-glint`, the sweep, the droplet classes) into a shared `media.css` used by both
   layouts. Also port the `stage` view-transition group rule (plus-lighter, 720 ms). `media.ts` reads
   no tokens apart from `--light`, so it moves unchanged.
5. **The bar**: the new bar uses `--a1` for the dot and has the lens look. On the Record, `--a1` must
   be `#8fb8ff`, so the tab light and the dot keep the colour glide the owner liked.
6. **The field and the grain**: the new Home field is an aura with three pigments. On the Record, keep
   it to the one pool behind the header (as today, about 11 %). A full aura under a reading column
   breaks the `--aura-quiet` rule and the calm of the list.
7. **Fix §3's defects first** (year page, the droplet-out square, the bright arrival frame) on the live
   page, so the port starts from a clean baseline. Port only after frame sheets match the
   before/after screenshots in this file.
