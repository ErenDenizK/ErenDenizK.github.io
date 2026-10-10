# Research: reading on screens, and a Record people enjoy reading (2026-10-09)

**Status:** current. Built into the Record; Part D feeds the log-entry skill.

Brief §7 (2026-10-09, after seeing v0): research how to make text easier to read on screens
today, given short attention, across technique, style, engineering and writing; and fix the
Record, which has too many controls, odd thread toggles and plain black-and-white reading that
is neither fun nor easy. Part A is general. Part B applies it to this site. Part C is a
critique and redesign of the Record and its entries. Part D is a checklist the log-entry skill
can adopt.

**Evidence grades.** **E** verified: primary source opened in this research. **P**
primary-indirect: the primary's own abstract, figures or wording, seen through a search
extract. **F** forum or secondary: blogs, vendors, summaries. **K** memory: prior knowledge
not re-checked (the caller's "M"; renamed because this folder uses M for measured, see
`2026-10-craft-audit.md`). **M** measured by us on the repo's own files and shots.

**Limits.** The sandbox could not open nngroup.com, practicaltypography.com, gov.uk, gwern.net,
ia.net, distill.pub, readwise.io, pmc.ncbi.nlm.nih.gov, web.dev, MDN or Wikipedia (DNS
failures). Only GitHub was reachable, so Tufte CSS was read in source (E) and everything else
comes from search extracts (P or F). No numbers below were measured on live third-party sites.
No reader study of our own was run.

---

## 0. The answer in brief

1. **Attention has not collapsed; the reader is triaging.** The 8-second goldfish is a myth
   (§2). People scan first and then commit to reading what earns it (NN/g's "commitment"
   pattern). Design for both passes: a scan that pays off in ten seconds, and a column that
   rewards the reader who stays.
2. **Most of the gain is in the writing.** Lead with the result, one idea per paragraph,
   concrete nouns and numbers, headings that carry information. Type can make reading
   comfortable; it cannot make a vague paragraph worth reading.
3. **Type: big enough, short enough lines, enough air.** On this site the reading face is
   too small for what it is: Newsreader at 19 px has an 8.1 px x-height, smaller than Inter
   at 15 px (M), and the column runs to ~89 characters a line (M). Raise it to 21 px, cut the
   measure to ~65–72 characters.
4. **Dark is the harder polarity, so compensate.** Dark text on light reads slightly better on
   average (P); the brief wants black. Keep warm off-white below pure white, add size, a touch
   of weight and line height, and avoid hairline details.
5. **Colour and image are wayfinding, not decoration.** One colour per project, used the same
   way everywhere, lets a scanner see "Recto, Recto, English Prep" without reading. Figures
   are rest points; irrelevant "seductive" images hurt comprehension (P, meta-analyses).
6. **Controls cost reading.** Every filter, chip and toggle is something to parse before the
   first sentence. A personal log of under a hundred entries needs none of them.
7. **Motion belongs to navigation, not to text.** Text that animates while you read it is
   slower to read; scroll-jacking breaks the one control readers trust.

---

## A. What is known

### 1. Findings, graded

| # | Finding | Evidence | Grade | What it means for design |
|---|---|---|---|---|
| 1 | Paper beats screens slightly for comprehension of informational text: Delgado et al. 2018, 54 studies, g = −0.21; larger under time pressure and for expository text; larger when the screen text had to be scrolled. Clinton 2019, 33 studies, g ≈ −0.25; screen readers overestimate their understanding. Li & Yan 2024: no difference under ~1,000 words. | meta-analyses via extracts | P (Delgado), F (Clinton, Li & Yan figures) | Short pieces lose little on screen. Long ones need pacing: sections, figures, a visible structure, no time pressure cues. |
| 2 | People scan first: in Nielsen's 1997 test 79% scanned any new page, 16% read word by word. Later eye-tracking (2006, revisited 2017) named patterns: **F** (the first lines and the left edge, a symptom of unformatted text), **layer-cake** (eyes hop heading to heading), **spotted** (hunting for a word, number, link), **commitment** (reading everything when motivated). | NN/g via secondary summaries | F | The F-pattern is a failure mode, not a goal. Give layer-cake readers headings that inform, spotted readers numbers and names that stand out, and committed readers an uninterrupted column. |
| 3 | On an average page visit people have time to read at most ~28% of the words, more likely 20% (Nielsen 2008, from Weinreich et al.'s logs: 25 s + 4.4 s per 100 words). A time model, not eye-tracking. | Nielsen column via extracts | P | The first 20% of any page must carry the point. |
| 4 | Article readers scroll through ~60% on average, ~10% never scroll; shares and full reads correlate weakly (Chartbeat/Slate 2013). | press coverage | F | Put the result high. Do not rely on an ending. |
| 5 | Average silent reading: **238 wpm** for English non-fiction, 260 for fiction, most adults 175–300 (Brysbaert 2019, 190 studies, 18,573 readers). | paper abstract via extracts | P | Use 230–240 wpm for reading time (log.md already uses 230). |
| 6 | Screen attention: average time on one screen before switching fell from ~150 s (2004) to ~47 s since ~2016, median 40 s (Gloria Mark). It measures switching between screens at work, not a biological limit. | UC Newsroom, interview transcripts | F | Readers are interrupted. Make re-entry easy: headings, short paragraphs, a stable column, anchors. |
| 7 | Deep reading is a trained habit that skimming erodes; Wolf argues for a "biliterate" reader who can do both (Reader, Come Home, 2018). | reviews and summaries | F | Design should invite a switch from skim to deep: a calm column with nothing moving once someone commits. |
| 8 | Line length: long lines (~95–100 cpl) are read faster on screen with equal comprehension, but readers prefer and rate easier ~45–72 cpl (Dyson & Kipping; Dyson 2004 review; Shaikh & Chaparro 2005). | conference abstracts, summaries | P/F | No single optimum. Speed is not the goal on a personal log; comfort and preference are. 60–75 cpl. |
| 9 | Size: reading speed is flat over a wide "fluent range" of x-heights (~0.2°–2°, about 1.4–14 mm at 40 cm); below the critical print size speed drops (Legge & Bigelow 2011). X-height, not nominal size, is what the eye sees. | review via extracts | P | Compare faces by x-height in px. Serif text faces with small x-heights need a larger nominal size. |
| 10 | Line height for body text 120–145% of size; body 15–25 px on the web; 45–90 characters a line (Butterick). | summary page via extracts | P | The site's 1.6 sits slightly loose of this range; fine for a dark ground (see 11). |
| 11 | Polarity: dark text on light is better for proofreading and acuity in both young and older adults (Piepenbrock, Mayr, Buchner et al., Düsseldorf, 2013–14). Mixed later results (a 2024 n=30 study found faster reading in negative polarity); light-on-dark may help some low-vision readers with cloudy media; halation for astigmatic readers is widely repeated but weakly sourced. | papers via extracts; blogs | P (Düsseldorf), F (rest) | A dark site reads slightly worse on average. Compensate with size, weight, spacing and non-pure-white ink; never thin strokes. |
| 12 | Fonts: the fastest font differs by person; best vs worst font was 35% faster with equal comprehension; people's favourite was seldom their fastest (Wallace et al., ACM TOCHI 2022, ~386 crowd readers, 16 fonts). | abstract via extracts | P | Taste is not a test of legibility; neither is one font "the readable one". Pick a well-made text face and give it size. |
| 13 | Good typography improves mood and makes reading time feel shorter, even when speed and comprehension do not change (Larson & Picard 2005, Microsoft/MIT, n=20). Earlier tests found OpenType refinements changed no performance measure. | paper via extracts | P (small n) | Craft is justified by how reading feels, not only by wpm. This is the "fun" lever. |
| 14 | Seductive details (interesting but irrelevant images, anecdotes) reduce learning: Rey 2012, 39 effects; Sundararajan & Adesope 2020, 58 studies, g = −0.33, worse for static images. | meta-analyses via extracts | P | Every image must carry information the text refers to. Decoration in the reading column costs comprehension. |
| 15 | Paging vs scrolling: little speed difference; paging gave better whole-text representation and recall in some studies (Piolat et al. 1998; a Norwegian smartphone study). | secondary | F | Long pieces benefit from felt structure: sections, figures, a contents list that marks progress. |
| 16 | Mobile comprehension equals desktop for ordinary text (NN/g 2016, n=276); difficult text is read more slowly on phones. The older "half on mobile" claim came from a 2010 Alberta study. | NN/g via extracts | P | Do not shorten the content for phones; shorten the chrome. |
| 17 | Dyslexia: larger text and larger character spacing speed reading for readers with and without dyslexia (Rello & Baeza-Yates 2016–17, eye-tracking, n=92); extra-large letter spacing doubled accuracy for dyslexic children (Zorzi et al. PNAS 2012, n=74); italics hurt; letter spacing helps only with matching word spacing. | papers via extracts | P | Generous size and spacing help everyone; avoid italic passages, justified text and tight tracking in body text. |
| 18 | Justified vs ragged: justified hyphenated text read slightly faster but recalled slightly worse in one study (Veytsman & Akhmadeeva); dyslexia bodies advise ragged right because of uneven spacing and rivers. | TUGboat, charities | F | Ragged right on the web, where line-breaking is worse than TeX's. |
| 19 | Readability formulas count syllables and sentence length; they ignore content, order, headings and layout, punish bulleted lists, and are easily gamed (Redish 2000; Redish & Jarrett; Schriver). | records and summaries | F | Use a formula as a smoke alarm for very long sentences, never as a target. |
| 20 | Plain language: GOV.UK advised splitting sentences over 25 words (2014); other UK bodies aim for an average of 15–20. | GDS blog | P | Average ~15–18 words, vary length, cap at ~30. |
| 21 | Front-loading: the inverted pyramid suits the web because readers scroll only when they expect the page to pay off (NN/g). | NN/g via extracts | P | Title says what happened; the dek says the result; the first sentence says what changed. |
| 22 | Scroll-triggered or parallax motion: users scroll faster and stop more abruptly (thesis, n=25); scroll-jacking breaks expected scrolling; WCAG 2.3.3 asks that interaction-triggered motion can be turned off (vestibular disorders). | W3C Understanding doc; thesis; blogs | P (W3C), F (rest) | Text never animates as it enters; no scroll-linked movement in the reading column. |
| 23 | Snow Fall-style multimedia: critics argued readers clicked parts instead of reading, and the 17,000-word text had no links. The Pudding reveals findings step by step, then lets readers explore. | criticism, Pudding process notes | F | A visual earns its place where the text points at it, and the reader controls the pace. |

### 2. Myths

| Claim | What is true | Grade |
|---|---|---|
| "Attention span is 8 seconds, shorter than a goldfish." | Traced to a 2015 Microsoft Canada marketing report citing "Statistic Brain"; the BBC found no research behind it; attention researchers (Posner) see no evidence of change; nobody can measure a goldfish's attention span. | F |
| "People don't read online." | They scan, then commit when the page earns it (finding 2). A good opening converts scanners to readers. | F |
| "Design for the F-pattern." | The F-pattern is what happens to unformatted walls of text. The aim is to replace it with layer-cake and spotted reading. | F |
| "Bionic Reading makes you read faster." | Readwise's test of 2,074 readers found no speed gain (2.6 wpm slower, not significant); the positive study is n=60 EFL learners. No peer-reviewed support for general readers. | F/P |
| "Dyslexia fonts help." | OpenDyslexic (Wery & Diliberto 2017) and Dyslexie (Kuster et al. 2017, n=170) gave no gain in speed or accuracy; spacing, not letter shape, mattered. | P |
| "Hard-to-read fonts help memory" (disfluency, Sans Forgetica). | The 2011 effect failed to replicate in several labs; Sans Forgetica showed no benefit, or worse recall, in independent tests. | P |
| "Dark mode is easier on the eyes." | On average the opposite for reading performance (finding 11); it may suit dark rooms, some low-vision readers and preference. | P/F |
| "Serif is for print, sans for screens." | At current pixel densities there is no reliable difference; x-height, spacing and size matter more. | K |
| "A higher readability score means readable." | See finding 19. | F |
| "Reading-time labels raise engagement 30–40%." | Vendor claims without method; one university newspaper saw no change. | F |
| "Mobile halves comprehension." | 2010 result; NN/g 2016 found parity for ordinary text. | P |
| "Everything must be above the fold." | People scroll when the top promises something. The fold is where the promise must be, not all content. | F |

### 3. Craft references: what each teaches

| Reference | What it does | Take | Leave | Grade |
|---|---|---|---|---|
| Butterick, Practical Typography | Body text first: 15–25 px, 120–145% leading, 45–90 cpl; spacing and restraint over effects. | The numbers as a frame; "body text is most of the page". | Rule-lists as dogma. | P |
| Bringhurst, Elements of Typographic Style | 45–75 cpl, 66 ideal for single columns; "typography exists to honour content". | 66 cpl as the target. | Print-only details. | K |
| iA, "Responsive typography: the basics" | Letter size depends on reading distance; adaptive layouts with few breakpoints beat liquid ones because measure stays controlled. | Fixed measure per breakpoint; larger type on desktop because it is further away. | — | P |
| Medium / Substack | One centred column ~680–700 px, serif body ~20–21 px, few controls, title, dek, author, date. | Single column, big body text, nothing beside it while reading. | Claps, follow prompts, paywalls. | K |
| Safari Reader, Pocket, Readwise Reader | Strip chrome; user picks size, face, theme; generous margins. | Proof that a reading view is mostly subtraction. | User type controls: a control the page should not need. | K |
| Tufte CSS | Sidenotes float right at 50% width into the margin above 760 px; below it they hide behind a numbered label toggling a checkbox. | Sidenotes for essays, with the narrow fallback. | Its ET Book palette. | E |
| Gwern | Sidenotes beat endnotes because notes are seen without jumping; static sidenotes for most sites, sidenotes.js for heavy use. Created/modified dates per page. | Static sidenotes at build; dates. | Status and certainty labels (log.md §8). | P |
| Distill.pub | Figures as the argument, margin figures, hover citations; "research debt": explanation is work. | A figure the text is built around. | Interactive explorables for a weekly log. | P/K |
| The Pudding | Visual essays; walk the reader through the finding, then let them explore. | One drawn finding per essay at most. | Scrollytelling builds of days to months. | F |
| NYT / Guardian long-form | Large lead image, wide breakouts, pull quotes, section breaks every few screens. | Rhythm: a change of texture every 400–600 words. | Autoplay video, scroll-jacking. | K |
| Stripe Press | Book-like digital pages: generous margins, big serif, restrained colour, one accent per title. | Each "title" (here: project) owns a colour; calm pages. | — | K |
| Craig Mod; Robin Rendle | Margins as kindness; "prioritise the text over the font". | Space as the main material. | — | F |
| Maggie Appleton | Hand-drawn illustration as the hook; notes of varied length. | Varied entry lengths with a visual on the long ones. | Garden metaphor (log.md §1). | K |
| Julia Evans | A comic that gives a 15-minute post's ideas in 30 seconds. | The figure test already in log.md §7.1. | — | P |

### 4. Engineering

| Technique | State and evidence | Use here |
|---|---|---|
| Fluid type with `clamp()` | Standard; iA warns that fully liquid sizing loses control of measure. | Two or three fixed reading sizes by breakpoint, not a vw slope, for prose. |
| Font loading without shift | `font-display: swap` plus metric-matched fallbacks (`size-adjust`, `ascent-override`) keep CLS near zero (K); the site already does this. | Keep. |
| `text-wrap: pretty` / `balance` | Chromium 117+ adjusts the last four lines; Safari's version (2025) improves the whole rag; Firefox lacked `pretty` in early 2026 (F). Progressive enhancement. | `pretty` on prose, `balance` on titles and deks (already). |
| `hanging-punctuation` | Safari only (K). Harmless elsewhere. | `first allow-end` on prose and pull quotes. |
| Hyphenation `hyphens: auto` | Needs `lang`; uneven quality; helps narrow phone columns. | Phones only, prose only, `hyphenate-limit-chars: 7 3 3` where supported. |
| OpenType | Tabular figures for dates and counts; old-style figures in serif prose; real quotes and apostrophes. The Fontsource builds drop stylistic sets (craft audit §2.1, M). | `tnum` in meta, `onum` in prose if Newsreader's subset keeps it (check). Smart quotes at build. |
| Reading progress bar | No evidence of benefit; log.md §8 bans it. | An essay's contents list marks the current section instead (already). |
| Reading time | Readers like knowing the cost (K); engagement claims unproven (§2). | Essays only, from 238 wpm. |
| Sidenotes vs footnotes | Sidenotes keep the eye in place (Gwern, Tufte). | Static sidenotes for essays above ~1200 px; inline toggles below. |
| Anchors and contents | Re-entry after interruption (finding 6). | Heading anchors; contents beside essays from 1240 px (already). |
| Scroll-driven reveals | Slower reading, vestibular cost, WCAG 2.3.3 (finding 22). | None in the reading column. A figure may draw once when it enters on desktop only if a still twin is identical; default still (log.md §7.3). |
| Images as rest points | Breaks of texture help long reads (K); irrelevant images hurt (finding 14). | A figure or screenshot every ~400–600 words in essays, each referred to by the text. |
| Audio / TTS | Helps some readers and dyslexic readers (K); browser TTS exists. Recorded audio is costly. | Later: the owner's own voice note on essays could be a genuine, on-brand extra (they dictate anyway). Not now. |
| TL;DR / summary | Front-loading works (finding 21). A labelled "TL;DR" reads as template. | The dek is the summary. Essays over ~1,200 words may open with a two-line "In short". |

### 5. Writing craft

| Practice | Source | Grade | Rule |
|---|---|---|---|
| Inverted pyramid / BLUF | journalism; military writing; NN/g | P/K | Say the result first. Background after. |
| Front-load sentences and headings | NN/g scanning work | F | The first two or three words of a heading or paragraph carry the subject: "PDFium now runs in a worker", not "After a lot of thinking, I…". |
| Plain words, short sentences | GOV.UK, plainlanguage.gov | P | Average ~15–18 words; one idea per sentence; everyday words; active voice when the doer matters. |
| Concrete detail | Housel ("a great story can be three lines"); weeknotes guides | F | A number, a name of a thing, a screenshot, a before/after. "Export went from 9 s to 2 s", not "export is much faster". |
| Headings as information | NN/g; GOV.UK | F | In essays, headings are statements, sentence case. Never "Introduction", "Thoughts". |
| Write simply, read aloud | Paul Graham, "Write Simply"; Chapin's counterpoint: plainness alone is dull | F | Simple, but with the owner's own turns of phrase and occasional colour. |
| Voice and humour | Housel writes "for an audience of one"; Turnbull: weeknotes should be personal | F | Humour only when the owner made the joke. Hesitations and dead ends stay; they are what makes a record believable. |
| Weeknotes that get read | Turnbull; dxw playbook; 30-minute method | F | Short (~150 words is a fine target), personal, honest about what did not work, one image if there is one, not a list of everything done. |
| Newsletter retention | Lenny Rachitsky: one deep post a week, 10–20 h each; Benedict Evans: a recurring shape readers learn (K) | F/K | A recurring shape lowers reading effort: readers learn where the result and the next step sit. |

### 6. What makes reading feel good

Evidence here is thinner (Larson & Picard is the one controlled study, n=20); the rest is
practice. **Rhythm**: alternate long and short paragraphs and sentences; a figure or a pull-out
number every few screens. **Variety of entry shapes**: a list where every row looks the same
reads as a database; notes, entries, essays, releases and photos that look different read as a
life. **Colour as wayfinding**: one colour per subject, used consistently, so the eye groups
without reading. **Visible progress, honestly**: the date spine and the "next" line show the
story moving. **Micro-rewards that do not interrupt**: a link underline that warms on hover, a
copied-link tick, a figure label that highlights on hover; nothing that moves text.
**Ending well**: a concrete next step is a reason to come back without a cadence promise.

---

## B. Rulebook for this site, ranked

Ranked by expected effect on reading. "Now" is what the site does today (M, `src/styles`).

### Type

| Rank | Rule | Now | Why |
|---|---|---|---|
| T1 | Reading prose (log, case studies) in Newsreader **21 px on desktop and tablet, 19 px on phones**, line-height **1.55**, measure **≈ 66–72 characters** (`max-width: 28em` at 21 px). | 19 px, 1.6, `max-width: 35em` = ≈ 89 cpl (M); 18 px on phones. | Newsreader's x-height is 0.426 em: 8.1 px at 19 px, below Inter's 8.2 px at 15 px (M). The reading text looks smaller than the interface. 21 px gives 8.9 px; 28em gives ~71 cpl (M, average advance 0.393 em). Findings 8–10. |
| T2 | Weight **430–450** for prose on the dark ground (the narrowed axis keeps 400–500). | 400. | Light-on-dark thins strokes visually (finding 11). Check rendering at 1x and 2x. |
| T3 | Ink: prose stays `--read` #dcd7ce (13.8:1, M). Nothing that must be read uses `--ink-4` (2.9:1, M): counts in the filter control do today. | mostly fine | WCAG 4.5:1 minimum; 7:1 target for prose. |
| T4 | Paragraph spacing **1em**, no indents; first paragraph of an entry may be the dek-sized lede only on essays. | 0.9em | Clear chunking aids scanning (finding 2). |
| T5 | Ragged right; `text-wrap: pretty`; `hyphens: auto` on phones only; `hanging-punctuation`; real quotes; old-style figures in prose, tabular in meta. | partly | Findings 17–18; §4. |
| T6 | No italic paragraphs, no letter-spaced body, no all-caps beyond two-word labels. | holds | Finding 17; craft audit §1. |

### Layout

| Rank | Rule | Why |
|---|---|---|
| L1 | While reading, **one column and nothing beside it** except a contents list or sidenotes. No sticky object, no aside lists. | Commitment pattern; Medium/Reader; finding 14. |
| L2 | The first entry (or the first sentence of an entry) **within the first screen** at 1440×900 and 390×844. | Findings 3–4, 21. |
| L3 | Figures break out to ≤ 720 px and come every ~400–600 words in essays, each referred to in the text. | Findings 14–15. |
| L4 | Anchors on headings and entries; an essay's contents list marks the current section. | Finding 6. |
| L5 | Same content on phones; less chrome, not less text. | Finding 16. |

### Colour

| Rank | Rule | Why |
|---|---|---|
| C1 | **Project colour is wayfinding**: a mark on the date spine, the project name, a link underline and a faint light at the top of the entry page. The same colour does the same job on every page. | §6; brief §4.1 colours per project. |
| C2 | The **Log blue** (#8fb8ff, 9.9:1, M) is the Record's own light and its link colour in prose; entries without a project use it. | Brief §7: Log blue accepted; it is barely used today. |
| C3 | Colour never carries meaning alone: the project name is always written. | WCAG 1.4.1. |
| C4 | No coloured category pills, no kind badges (log.md §8 stands). Category is text. | Restraint keeps colour meaningful. |

### Motion

| Rank | Rule | Why |
|---|---|---|
| M1 | Text never animates in or moves while being read. No fade-up per paragraph, no scroll-linked effects in the column. | Finding 22. |
| M2 | Motion is for arrival: the page's light and object settle on navigation (craft audit §4 tokens), then stop. | Brief §7 liveliness, kept out of the column. |
| M3 | Hover rewards are colour and underline only, ≤ 120 ms. | §6. |

### Structure

| Rank | Rule | Why |
|---|---|---|
| S1 | Every entry has a **recurring shape**: title (what happened), dek (result or number), body (what, why), a **Next** line. | §5 newsletter shape; finding 21. |
| S2 | Kinds look different by shape and image, never by badge. Add a **release** variant of entry (a version shipped) and later **photo** entries as postcards (brief §7). | §6 variety; brief §7 postcards. |
| S3 | Controls appear only when the content needs them, and the Record needs at most one. | Part C. |

### Writing

| Rank | Rule |
|---|---|
| W1 | Result first: the dek states the outcome or number; the first sentence states what changed. |
| W2 | One idea per paragraph; paragraphs of 1–4 sentences; vary length. |
| W3 | Concrete: at least one number, named thing or image per entry, all from the owner's notes. |
| W4 | Sentences average 15–18 words; split anything over ~30. |
| W5 | Headings only in essays, written as statements. |
| W6 | The owner's voice: their hesitations, dead ends and jokes stay; no invented colour (requirements §18). |
| W7 | End on the next step or where the content ends; never a moral. |

---

## C. The Record: critique and redesign

### 7. What is wrong today (seen in `tests/shots/*-log.png` and `prototypes/f-log/shots/`)

The live v0 has no entries yet, so the owner judged prototype F-log and the v0 page together.

| # | Problem | Where | Effect |
|---|---|---|---|
| 1 | **The first entry starts at y ≈ 600 of 900** on desktop and below the fold on phones: count line, 80 px title, two-line lede, disclosure note, then the year heading. With filters (≥ 20 entries) it drops further. | `desktop-log.png`, `phone-log.png` (M) | The page talks about itself before showing the record. |
| 2 | **Up to eight kinds of control**: kind segmented control with counts, category chips, "Show everything", threads that filter on press, years list, "Atom feed", "How this site is made", and the prototype's scale preview; entries also toggle open in place with a chevron. | `desktop-scale400-filtered.png` (M) | Parsing before reading; the owner's "too many controls". |
| 3 | **Threads are a hidden control.** They look like a chart, act as a filter, and toggle on a second press; the dim state of the other threads is the only feedback. A reader cannot guess any of that. The aside also places them beside, not inside, the record they describe. | `ThreadRow.astro`, `log.ts` | The owner's "odd thread toggles". |
| 4 | **Every row looks the same**: grey date, serif title, grey dek, grey meta, grey kind label, hairline. Notes differ only by size. | `desktop-log-open.png` | A database, not a story; nothing to scan for. |
| 5 | **Black and white with a whisper of colour**: project names at 72% colour mix, 13 px. Log blue appears only in the object. | `log.css` `.pj` | No wayfinding; "plain black-and-white". |
| 6 | **Reading text is small and long**: 19 px Newsreader (8.1 px x-height) at up to ~89 characters a line, on black. | `global.css` `.prose` (M) | Harder than it needs to be (T1–T2). |
| 7 | **Entries open in place**, so a 700-word entry is read inside a list, indented under a 5 rem gutter, next to an aside, with the next row's title below. | `desktop-log-open.png` | Two reading modes for one kind; no calm page. |
| 8 | **The aside competes**: object, threads and years stacked beside the list; on long pages it is empty after the first screen. | `desktop-scale400.png` | Divided attention (L1). |
| 9 | **Five grey levels** on one row (ink, read, ink-2, ink-3, ink-4) carry hierarchy almost alone. | tokens (M) | Low contrast steps look flat on black. |

### 8. Proposal: the Record as one coloured timeline

**Idea.** The record *is* a thread: one vertical **date spine** down the left of the list, a
mark per entry in its project's colour (Log blue when it has none). Reading down the spine
shows which project moved when, the job threads were doing, without a widget or a toggle. A
small **year strip** at the top gives the at-a-glance proof of steady work (brief §2.2).
Everything else is subtraction.

**Page, top to bottom (desktop 1440×900):**

1. **Header, ≤ 220 px.** "The record" at `--t-h2` (not `--t-title`), one-line dek, a quiet
   meta line "14 entries since Sep 2026". The Log object shrinks to the small poster beside the
   title (as on phones today). A faint Log-blue light behind the header, per-page atmosphere
   (brief §7).
2. **Year strip.** A 12-column band for the current year (months), each entry a short tick in
   its project colour, stacked when a month is busy; labels "Jan … Dec" in meta. It is a
   picture, not a control; each month is a plain anchor to its first entry. Past years get the
   same strip in their year heading. Gaps show honestly; nothing counts them (log.md §2.3).
3. **The list** in one column of ~720 px, centred-left, no aside. A sticky year label rides in
   the gutter.
4. **Foot**: "Atom feed" and "How this is written" (the disclosure moves here and to each
   entry foot; it is not the first thing a visitor reads).

**Rows by kind** (shape, not badges):

| Kind | Row |
|---|---|
| Note | The text itself at reading size, in full; date is the link; project mark on the spine. |
| Entry | Title (Newsreader 25), dek (Inter 17, `--ink-2`), meta (project in colour · category). The whole row links to the entry page. **No in-place opening.** |
| Release (entry with `version`) | Version set large in the project colour ("Recto 1.0.0-beta"), one-line dek, up to three short items, optional screenshot thumbnail. The rows readers will look for. |
| Essay | Title, dek, "6 min", and a 16:10 plate of its lead figure or screenshot to the right on desktop, above on phones (phones currently hide it; show it). |
| Photo (later) | A postcard thumbnail with a one-line caption (brief §7, postcards). |

**Controls, cut to the minimum:**

| Control now | Fate | Replacement |
|---|---|---|
| Kind filter (All/Notes/Entries/Essays + counts) | Remove | Kinds are visible by shape. |
| Category chips | Remove | Category stays as text in the meta line. Outside readers do not filter a personal log by "school". |
| Threads (press to filter, press again to clear) | Remove from the Record | The spine and year strip show the same thing. The per-project thread stays in each project's view above "In the log", where it is read, not pressed. |
| Years list in the aside | Remove | Sticky year label; year strips are anchors; at 100+ entries the year archive pages (log.md §5.2). |
| "Show everything", live filter line | Remove | Nothing to reset. |
| Open-in-place chevron | Remove | Every entry is a link to its own page; notes need no opening. |
| Project filter | **Keep one, from ~40 entries**: a single line of project names in their colours ("Recto · English Prep · Eat Map · Everything"), each a link to `?project=` (no toggling; "Everything" clears). | Answers the one question an outside reader asks: "show me Recto over time". |

Result: zero controls until about forty entries, then one row of links.

**Colour and imagery (making it easier and more fun):**

- The spine marks, the project name and the release version use the project colour; prose
  links use Log blue. Colour does one job: "which project".
- The entry page gets a faint light in its project's colour at the top (as Recto's lime aura
  opens Recto's preview, brief §4.1), ≤ 16% mix (craft audit P2.5), still under reduced motion.
- Every entry may carry one real image: a screenshot, a kit figure, or a photo; releases
  almost always should. Imagery in the list is a thumbnail, never a header banner.
- Small rewards: the spine mark of the hovered row brightens; a copied-link tick; nothing
  moves text.

### 9. The entry page

| Element | Spec |
|---|---|
| Top | Back link "The record"; meta line: date · project (in colour) · category; title (`--t-title` for essays, `--t-h2` for entries); dek as lede (Inter 21–27). |
| Light | Project-coloured light behind the header, fading by ~400 px; Log blue if no project. |
| Body | Newsreader 21 px / 1.55, weight 430–450, `max-width: 28em` (~71 cpl); 19 px on phones; paragraphs 1em apart; ragged, `pretty`. |
| Key number (optional) | One pull-out line in the project colour when the entry has a headline number ("2 s export, was 9 s"), set in the display face. At most one per entry. |
| Figure | Breaks out to 720 px; caption one sentence; referred to by the text. |
| Next | A final line in meta style: "**Next:** …" from the owner's notes; omitted if they gave none. |
| Foot | Published / Updated, "How this is written", Copy link, Older / Newer (keep). |
| Essays only | Contents list from 1240 px marking the current section; reading time; static sidenotes from ~1200 px, inline toggles below. |

### 10. Entry template the dictated notes can fill

The agent maps the owner's notes onto these slots; empty slots are dropped, never invented.
No visible headings on notes and entries (log.md §3.1); the slots shape the order.

```yaml
kind: entry                 # note | entry | essay
title: Recto runs PDFium in a worker     # what happened, ≤ 60 chars
dek: Opening a 300-page PDF no longer freezes the tab.  # result or number, one sentence
version: 1.0.0-beta         # optional: makes the row a release
projects: [recto]
category: work
key: "300 pages, no freeze" # optional pull-out line, only a number or fact the owner said
image: shots/recto-worker.webp   # optional: screenshot, kit figure or photo
next: Annotations are next. # optional: the owner's own next step
```

Body order, each a short paragraph (1–4 sentences):

1. **What happened**, first sentence front-loaded with the subject.
2. **Why it mattered or why I did it**, in the owner's words.
3. **How, or what was hard**, with one concrete detail; a dead end if they mentioned one.
4. Optional: **what I learned**, only if the owner said it, never as a moral.

Notes: one to three sentences, still front-loaded, one concrete thing. Essays: the same
order, scaled up, with statement headings and a figure every ~400–600 words.

### 11. What this changes in `docs/design/log.md`

Proposed amendments for the owner to accept (taste questions in §13): §4 rows (no in-place
opening; release variant; essay plates on phones), §5.3 filters (one project link row from
~40), §5.4 threads (off the Record; spine and year strip instead; kept in project views),
§7.3 colour (project light on entry pages), the type tokens in `global.css` (T1–T2). Content
fields add optional `version`, `key`, `image`, `next` (ADR-0002: content stays data).

---

## D. Checklist for the log-entry skill

For `.claude/skills/log-entry/SKILL.md` to adopt as "Readability checks" (not edited here):

- [ ] **Title** says what happened, front-loaded, ≤ 60 characters, sentence case.
- [ ] **Dek** gives the result, reason or number, in one sentence; it is the entry's summary.
- [ ] **First sentence** names the subject in its first few words and says what changed.
- [ ] **One idea per paragraph**, 1–4 sentences each; paragraph lengths vary.
- [ ] **Sentences** average ~15–18 words; none over ~30 without a reason.
- [ ] **Plain words**: the everyday word over the formal one; terms glossed once if an outside
      engineer might not know them.
- [ ] **At least one concrete thing** from the owner's notes: a number, a named feature, a
      before/after, a screenshot. If there is none, ask; never invent.
- [ ] **Order**: what happened, why, how or what was hard, (learned), next.
- [ ] **Next line** only if the owner gave a next step.
- [ ] **Key line** only for a number or fact the owner stated.
- [ ] **Image** only if it shows something the text refers to; caption says what to see.
- [ ] **Release**: if a version shipped, set `version` and keep the list to three items.
- [ ] **Voice**: one of the owner's own sentences kept; their dead ends and jokes kept; no
      added humour, moral or uplift.
- [ ] **Read aloud once**; cut any sentence that only restates the one before.
- [ ] **Scan test**: reading only title, dek and first sentence tells an outsider what
      happened.

---

## 12. Open technical checks before building

1. Render Newsreader 21 px at weights 400, 430, 450 on #0a0a0b at 1x and 2x; pick by eye.
2. Confirm the subset keeps `onum` and the ligatures; if not, re-subset (craft audit §3.5).
3. Year strip and spine drawn at build (SVG, percent positions, like `ThreadRow`), no runtime.
4. Screenshot at 1440×900, 1180×820 and 390×844 with real first entries (CLAUDE.md).

## 13. Questions for the owner (taste)

1. **Threads.** (a) Spine and year strip on the Record, threads only in project views
   (recommended); (b) keep threads in the aside but non-interactive; (c) remove all time
   graphics.
2. **Entries.** (a) Every entry opens its own page (recommended); (b) keep opening in place.
3. **Releases.** (a) A release look for entries with a version (recommended); (b) all entries
   alike.
4. **Colour on entry pages.** (a) A faint light in the project's colour (recommended); (b)
   Log blue everywhere; (c) none.
5. **Reading size.** Approve 21 px prose after seeing a side-by-side with today's 19 px.

## Sources

Search extracts unless marked. Opened: Tufte CSS source.

- Delgado et al. 2018, Educ. Res. Rev.: https://www.uv.es/lasalgon/papers/Delgado%202018%20dont%20throw%20away%20your%20printed%20books.pdf ; summary https://www.edtech.tum.de/?p=2157
- Clinton 2019 and Li & Yan 2024 (secondary): https://observatory.tec.mx/edu-news/meta-analysis-reading-onpaper-improves-reading-comprehension/
- NN/g scanning patterns (secondary): https://www.uxpin.com/studio/blog/website-design-for-scannability/ ; https://guides.libraries.wm.edu/writing-for-web/how-we-read-online
- Nielsen 2008, How little do users read: https://www.nngroup.com/articles/how-little-do-users-read/ ; PDF copy https://faculty.washington.edu/farkas/TC510-Fall2011/NielsenHowLittleDoUsersReadDF.pdf
- Chartbeat/Slate 2013: https://www.slate.com/articles/technology/technology/2013/06/how_people_read_online_why_you_won_t_finish_this_article.html
- Brysbaert 2019: https://www.Gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf ; https://www.bps.org.uk/research-digest/most-comprehensive-review-date-finds-average-persons-reading-speed-slower
- Gloria Mark: https://www.universityofcalifornia.edu/news/how-sharpen-your-attention-and-meet-your-goals-2024
- Goldfish myth: https://internet.psych.wisc.edu/wp-content/uploads/532-Master/532-UnitPages/Unit-09/Goldfish_MythBusting.pdf ; https://medium.com/write-rise/the-attention-span-stat-everyone-keeps-getting-wrong-91c418793ccc
- Maryanne Wolf: https://www.centerfordyslexia.ucla.edu/?p=8197 ; https://mobilesyrup.com/2018/08/27/technology-reading-brain-neuroscientist/
- Line length: https://portfolio.erau.edu/en/publications/the-effects-of-line-length-on-reading-performance-of-online-news-/ ; https://journals.uc.edu/index.php/vl/article/view/5671
- Legge & Bigelow 2011: https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264
- Butterick: https://practicaltypography.com/summary-of-key-rules.html
- Polarity: https://docserv.uni-duesseldorf.de/servlets/DerivateServlet/Derivate-31413 ; https://www.jhsmr.org/index.php/jhsmr/article/view/1095 ; https://a11ywithdiana.substack.com/p/and
- Wallace et al. 2022: https://research.adobe.com/publication/towards-individuated-reading-experiences-different-fonts-increase-reading-speed-for-different-individuals ; https://jeffhuang.com/papers/Readability_TOCHI22.pdf
- Larson & Picard: https://www.media.mit.edu/publications/the-aesthetics-of-reading-2 ; https://blog.jim-nielsen.com/2013/science-of-typography/
- Seductive details: https://www.learningscientists.org/blog/2019/6/20-1 ; https://news.wsu.edu/?p=201521
- Paging vs scrolling: https://blog.oup.com/2010/04/scroll-book/ ; https://www.humanfactors.com/newsletters/paging_vs_scrolling.asp
- Mobile comprehension: https://www.nngroup.com/articles/mobile-content/
- Dyslexia: https://repositori.upf.edu/items/e0ca6f40-a0fa-490f-9d03-53d043270deb ; https://pmc.ncbi.nlm.nih.gov/articles/PMC3396504 ; https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/ ; https://link.springer.com/10.1007/s11881-020-00194-x
- Justification: https://TUG.org/TUGboat/tb38-2/tb119veytsman-justify.pdf
- Readability formulas: https://www.noslangues-ourlanguages.gc.ca/en/blogue-blog/readability-formulas-eng ; https://effortmark.co.uk/?p=3586
- GOV.UK sentence length: https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/
- Inverted pyramid: https://www.nngroup.com/articles/inverted-pyramid/
- Motion: https://w3c.github.io/wcag/understanding/animation-from-interactions.html ; https://docs.lib.purdue.edu/open_access_theses/1616 ; https://robinrendle.com/notes/scrolljacking
- Snow Fall and The Pudding: https://contently.com/2013/06/09/the-firestorm-after-the-snow-fall/ ; https://www.storybench.org/?p=8613 ; https://pudding.cool/process/how-to-implement-scrollytelling
- Bionic Reading: https://blog.readwise.io/bionic-reading-results/ ; https://journals.razi.ac.ir/article_3914.html
- Disfluency and Sans Forgetica: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9733772/ ; https://www.bps.org.uk/research-digest/hard-read-font-was-designed-boost-memory-it-might-not-actually-work
- Reading time: https://parse.ly/reader-engagement-data-makes-the-case-for-long-form-content-at-lehigh-university/ ; https://martech.org/estimated-reading-times-increase-engagement/
- text-wrap: https://blog.logrocket.com/css-text-wrap-balance-vs-text-wrap-pretty/ ; https://webkit.org/?p=16547
- Tufte CSS (opened): https://raw.githubusercontent.com/edwardtufte/tufte-css/gh-pages/tufte.css
- Gwern sidenotes: https://gwern.net/sidenotes
- iA: https://ia.net/topics/responsive-typography-the-basics
- Craig Mod, Robin Rendle: https://buttondown.com/adventures/archive/take-care-of-the-margins/ ; https://adactio.com/links/10300
- Distill: https://distill.pub/2017/research-debt/
- Writing: https://sashachapin.substack.com/p/paul-graham-isnt-a-simple-writer ; https://howiwrite.substack.com/p/morgan-housel-how-to-master-writing ; https://www.entrepreneur.com/starting-a-business/how-this-newsletter-writer-got-more-than-300000/447172
- Weeknotes: https://promo.cymru/?p=18762 ; https://playbook.dxw.com/guides/week-notes ; https://medium.com/wethecatalysts/weeknotes-how-to-write-one-in-30-minutes-ef3eef0e41f7
- Measured (M): `src/fonts/*.woff2` (fontTools: x-height, average advance), `src/styles/global.css` and `log.css` tokens (WCAG contrast on #0a0a0b), `tests/shots/*-log.png`, `prototypes/f-log/shots/`.
