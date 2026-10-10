# Log: information design (2026-10-09)

What the log is made of, how its index groups and scales, how entries are addressed and fed,
how figures are drawn, and what never appears. **Status: accepted 2026-10-09.** Owner's answers to §11: title "The record"; notes in full in
the list; threads beside the log and inside each project's view; at most one hand mark.
**Amended 2026-10-09 (Record redesign), accepted by the owner:** the readability research
(`research/2026-10-readability.md` §8–§11) replaces the threads beside the log with a date spine and
a year strip, adds a release look, a project light on entry pages and 21 px reading text, and cuts the
controls to at most one row of links. The changed sections are marked "amended 2026-10-09"; §12 lists
them in one place.

**Name on the site (brief §7, 2026-10-09, after v0):** visitors see the log as the Record: the
nav tab says "Record", the index is "The record" and every address lives under `/record/`
(index, year archives, entries, `/record/feed.xml`). "Log" remains the internal name: the
content collection, `content/log/`, this document and the code that renders it.

Rests on: brief §2.2 (public record, evidence of steady work), §2.3 (four years, cheap to add
to), §4.3 (dictated notes, open categories, figures drawn in code), §7 (English, dark,
brand-led; first entries); requirements §15–18 (abandonment, shape, AI disclosure, voice);
craft audit §3–4 (type and motion); ux-patterns §6 (routes); ADR-0002 (content is data).
Prototype: `prototypes/f-log/` (§10). Illustration kit: `tools/illustrations/` (§7).
Workflow: `.claude/skills/log-entry/SKILL.md` (§9).

## 0. Decisions in brief

1. **Three kinds**, chosen by length: a **note** (one to three sentences, no title, read whole
   in the index), an **entry** (a few paragraphs, titled, its own page) and an **essay** (long,
   with figures, its own page). An entry with a `version` is a **release** and looks like one.
   The kind is honest about the effort; a busy month still yields a note. *(amended 2026-10-09:
   entries no longer open in place.)*
2. **Time lives in the structure**, never in counters: year groups, a date gutter, a quiet
   "updated". No streaks, no cadence promise, no "latest post" hero, no view counts.
3. **Every entry links to the projects it is about.** On the Record each row hangs a mark in its
   project's colour on one **date spine**, under a **year strip** of the months; reading down
   the spine shows which project moved when (brief §2.2). A project's own **thread** lives in its
   view. *(amended 2026-10-09.)*
4. **The index stays one page** that reads at 4 entries and at 400: no controls until about 40
   entries, then one row of project links; older years fold at 100. *(amended 2026-10-09.)*
5. **Append-only in public.** Published text is not silently rewritten: additions are dated
   "Updated" notes, changed facts are marked "Correction". Typos are fixed quietly.
6. **Stable addresses**: `/record/<year>/<slug>/` for every kind, the slug frozen at publish;
   one Atom feed with full content and permanent ids.
7. **Figures are drawn by one kit** in F's language (icon strokes, the site's type, one
   accent), at two widths so text never shrinks, still by default.
8. **The owner never writes Markdown**: the agent drafts from dictation, the owner reads every
   draft, nothing is published without their OK.

## 1. References and evidence

The research sandbox could not open most live sites (DNS failures on linear.app,
simonwillison.net, maggieappleton.com, gwern.net, jvns.ca). Where a site's source is public,
it was cloned and read instead; otherwise search extracts were used. Grades as in
`research/2026-10-requirements.md`: **E** primary document, **P** named practitioner,
**F** secondary source or folklore, **M** measured by us (here: read in the site's own source
repository; repos can lag the live site).

| Reference | What it does (grade) | Taken | Left |
|---|---|---|---|
| Simon Willison's weblog (`simonw/simonwillisonblog`) | Five content types: entries, link posts, quotations, **notes** (added 2025-03) and "beats". A note's title is optional; without one its page title is "Note on <date>" (`templates/note.html`) (M). Entries can carry **dated updates** appended below the body (`entry_updates.html`) (M). **Series**: an entry shows "Part of series" with the ordered list and its own Atom feed (M). Beats are slim timeline events, including releases and "TIL updated" (`models.py`) (M). Date-based URLs (M). | Untitled notes with a date title; dated updates under the body; a project thread works like his series; a feed per thread later. | Five types are more than one person dictating weekly needs. |
| Simon Willison's TILs | The bar is "did I just learn something?"; they "drop the barrier to publishing to almost nothing" (P, his 2021 post via search). | The note kind: a low bar keeps the record continuous (requirements §16). | A separate TIL site. |
| Maggie Appleton's garden (`MaggieAppleton/maggieappleton.com-V3`) | Essays, notes, patterns, talks and "smidgeons" (short posts), each with `startDate` and `updated`, shown as "Planted" and "Last tended" with **relative** dates; growth stages seedling / budding / evergreen with written definitions; optional `version` and `versionSummary` (M). | Separate published and updated dates; a version note when an essay is substantially revised. | The garden metaphor and growth stages (an editorial register; brief §7 asks for brand-led, not a research site); relative dates ("3 days ago") that age silently in screenshots and caches. |
| Brian Lovin (`brianlovin/briOS`) | TIL feed shows **whole entries inline** in a two-column grid, a 140–180 px date gutter beside the content; separate RSS for writing and TILs; likes and a live activity stream (M). | Notes are read inline in the index; the date gutter (F already has 5rem). | Likes, live activity, any count of reader behaviour (§8). |
| Paco Coursey (`pacocoursey/paco`, older version) | Post list: numeric date, title, description, "Show more" in steps of three; small CSS doodles drawn in code (M). | Title + one-line dek rows; drawings made in code. | Paginating by three: the index should show the record, not hide it. |
| Jonas Smolka (`jsmolka.github.io`) | Index grouped by year (`GroupByPublishDate "2006"`), title and date per row; an age shortcode (M). Also in our earlier survey (requirements §17). | Year groups with the year once per group. | — |
| Linear changelog | Dated posts with no version numbers; a headline feature (title, image or video, a few paragraphs on the problem), then grouped lists of small "Fixes & improvements" (F: Linear's 2022 post title and secondary descriptions). | The anatomy of a project-update entry: one headline change explained, then a short list. | Marketing cadence. |
| Keep a Changelog | Written for people, newest first, every version dated, changes grouped by type, linkable (F, via mirrors). | Newest first, everything dated and linkable. | The six change types (a log is not a release note). |
| Weeknotes (Giles Turnbull; public.digital) | No fixed template; written informally; one team's rule is "don't skip two weeks in a row" (F, secondary). | Informal voice, no template for notes. | Any cadence rule shown to readers (requirements §16). |
| Gwern | Per-page created and modified dates, a completion status (notes, draft, finished) and a certainty rating in estimative words (F, secondary). | Published and modified dates on every page. | Status and certainty labels: right for a research archive, wrong for this site's register (brief §7). |
| Julia Evans | Comics summarise: a reader who needed 15 minutes for a post got its main ideas from the comic in 30 seconds; drawn with simple tools by someone who "only draws stick figures" (P, her posts via search). | A figure earns its place when it is faster than the paragraph it replaces (§7.1). | Hand-lettered zine style: the site's drawings use its own type. |
| Rauno Freiberg | An OS-style portfolio, interaction-first craft writing (F, profiles). | One considered interaction per element (already F's rule). | Nothing structural for a log. |
| "Cool URIs don't change" (Berners-Lee 1998) and successors | Keep permalinks working; do not change a slug when a title changes; keep feed ids stable; redirect when something must move (P: Jim Nielsen 2024, Liip, Stefan Judis, via search). | §6 in full. | ID-first URLs (`/123/slug`): need server routing that GitHub Pages lacks. |
| Atom (RFC 4287) | Defines `atom:id`, `atom:published` and `atom:updated` per entry (E: the RFC's contents). Their usual reading, id permanent, published fixed, updated on significant change, is K (not re-checked). | §6.3. | — |
| Our own requirements research | Abandonment risk is the visible date trail, not inactivity (P); year headers with short dates (M); three lengths (P); disclosure lowers trust, one site-wide note is the norm (E: Nakano et al. 2025); the AI tells to avoid (F) (requirements §15–18). | All of it. | — |

## 2. Principles

1. **A record, not a feed.** The log exists to show continuous work over four years (brief
   §2.2). Its design optimises for an outside reader scanning months of it in a minute, and
   for the second visitor who reads one entry carefully.
2. **Length is honest.** The kind matches the effort. A note is not padded into an entry; an
   essay is not split to look busy.
3. **Time is shown by structure.** Dates, year groups and threads carry time. Nothing counts
   days, weeks or readers.
4. **Append-only in public.** A reader who linked to an entry can trust it still says what it
   said, plus what was added, with dates.
5. **One system with F.** The log uses F's type roles, scale, colours, icons and motion; it
   adds no new face, no new size, no new easing.

## 3. Entry kinds and their anatomy

### 3.1 The three kinds

| | Note | Entry | Essay |
|---|---|---|---|
| Length | 1–3 sentences, at most ~60 words | 2–6 paragraphs, ~120–700 words | more than ~700 words, or any piece with figures or sections |
| Title | none (page and feed title: "Note, 6 Oct 2026") | required | required |
| Dek (one-line summary) | none | required | required |
| Section headings | never | never | allowed, sentence case |
| Figures | none (amended 2026-10-09; photo entries come later as postcards) | at most one figure or one `image` | any, from the kit (§7), and one `image` |
| Reading time | no | no | yes, rounded minutes at 230 words per minute |
| Where it is read | in the index, whole | its own page (amended 2026-10-09; it no longer opens in place) | its own page |
| Own URL | yes | yes | yes |

The agent proposes the kind from the dictated notes and the owner can change it. A note that
grows past three sentences becomes an entry; an entry that needs a figure or a heading becomes
an essay.

### 3.2 Fields (content as data, ADR-0002)

One file per entry, `content/log/<year>/<slug>.md`, written by the agent, never by hand:

```yaml
kind: entry                 # note | entry | essay
title: Two tracks           # entry and essay only
dek: Fundamentals by hand at school; products by directing agents.
date: 2026-10-05            # publication date; never changes
updated: []                 # appended: [{ date: 2026-11-02, note: "Added the CS50 result." }]
corrections: []             # appended: [{ date, was, now }]
category: school            # one, open vocabulary (§3.6)
projects: []                # 0..n project slugs: recto | englishprep | eatmap | ...
figures: []                 # names from tools/illustrations/drawings, or image files
lead: entry-flow            # essay only: the figure whose plate shows in the index
version: 1.0.0-beta         # optional: a version shipped; the row takes the release look (§4)
key: "300 pages, no freeze" # optional: one pull-out line, a number or fact the owner said
image: ./recto-worker.webp  # optional: one real image, relative to the file; alt in imageAlt
imageAlt: The worker settings panel.  # required with image
caption: One sentence on what to see. # optional
next: Annotations are next. # optional: the owner's own next step, the page's last line
help: edit                  # edit (default) | more: the agent did more than edit (§3.9)
---
Body in Markdown.
```

`version`, `key`, `image` and `next` were added on 2026-10-09 (readability research §10); a note
takes none of them. An empty slot is dropped, never invented.

The slug is derived from the title at first publish (`two-tracks`), or `n-<yyyy>-<mm>-<dd>`
for a note, then frozen (§6.1).

### 3.3 Titles

- Say what happened or what the piece is about, in plain words, sentence case: "Two tracks",
  "Recto runs PDFium in a worker", "English Prep 0.75".
- At most ~60 characters; one line at 1440 and two at most on a phone.
- A version is written as the product does: "English Prep 0.75", "Recto 1.0.0-beta".
- Never: "Weekly update #12", a question asked only to be answered ("What did I learn?"),
  a colon-subtitle formula, emoji, all caps, clickbait, "journey".
- The dek is one sentence that adds what the title cannot: the reason, the result or the
  number. It never repeats the title.

### 3.4 Dates and reading time

- In the index: day and month ("8 Oct") in the date gutter; the year is the group heading.
- On an entry or essay page: "8 October 2026" at the top; "Published 8 Oct 2026 · Updated
  9 Oct 2026" at the foot. Always absolute dates, never "3 days ago".
- `datetime` attributes carry the ISO date. Tabular figures.
- Reading time only on essays, computed at build from the text ("2 min read"). Never on notes
  or entries, never a word count.

### 3.5 Updates

When something is added after publishing (a follow-up result, a link to what came next), the
agent appends a dated block at the end: **"Updated 9 Nov 2026.** …" The text above stays as
published. The index row shows "Updated 9 Nov" in its meta line; the feed's `updated` changes
(§6.3). A later development that deserves its own reading is a new entry linked from the
update, not an edit.

### 3.6 Corrections and removals

- **Typos, grammar, broken links:** fixed silently. They change no claim.
- **A changed fact or claim:** a **"Correction, 2 Oct 2026."** block at the top of the body
  says what it said (struck through, `<del>`) and what it says now (`<ins>`). The owner
  confirms every correction.
- **Privacy:** if an entry exposes a private person or anything the owner wants gone, it is
  removed outright and its URL returns a short "Removed on <date>" page. Privacy outranks
  append-only.

### 3.7 Categories

Open vocabulary (brief §4.3); the first are **personal**, **work** and **school**. Exactly one
per entry, lowercase in data, sentence case on screen ("School"). A new category may be
created any time; it appears as a filter chip only once it holds three entries, so a one-off
does not clutter the index. Categories are not tags: there is no tag cloud.

### 3.8 Project links

`projects` lists the projects an entry is about. They show in the entry's meta line in the
project's colour as links to the project (text, no glows, audit P1.4), colour the row's mark on the
date spine and its tick in the year strip (§5.4), and make the project's focus view list its entries
under "In the record" (newest first, the same rows, on a spine), below that project's thread.
*(amended 2026-10-09.)*

### 3.9 Disclosure

One site-wide note, at the foot of the Record (amended 2026-10-09: it moved from the header) and
in the colophon: "I dictate the notes, often in
Turkish; an agent edits them into English and I read every draft before it goes up." A
per-entry line appears only when the agent did more than edit (`help: more`, e.g. it
researched facts or wrote a section from scratch): "Written with more help than usual: …"
(requirements §18).

## 4. How the kinds look different (amended 2026-10-09)

Rows differ by shape and image, never by badge (readability research S2, §8). They share one grid: a
64 px date gutter, the spine with the row's mark, the content column (≤ 680 px), and on essays and
releases a 16:10 thumbnail column.

| | Note | Entry | Release (entry with `version`) | Essay |
|---|---|---|---|---|
| Row | the text itself in full, Newsreader 21/1.5 at 430, ≤ 28em | title Newsreader 25 (`--t-h3`), dek Inter 17 `--ink-2` | "Recto 1.0.0-beta" in Newsreader 34 in the project's colour, the dek, the body's first three list items | as entry, plus a 16:10 thumbnail (the `image`, else the lead figure's plate) to the right; above the text on phones |
| Meta line | projects (in colour, linked) · category | projects · category · Updated | projects · category | projects · category · "6 min read" |
| Mark on the spine | small dot | dot | ringed dot | ring |
| Link | the date is the permalink | the title's link covers the row; project names link to the project | as entry | as entry |
| Page | the note alone at 27 px, date as title | title (`--t-h2`), dek, key line, image, body, Next, foot | as entry, the title in the project's colour | title at `--t-title`, contents list beside it from 1240 px |

A note reads as a sentence, an entry as a headline, a release as a version, an essay as a headline
with a picture. Every titled kind has its own page; nothing opens in place. Hovering a row brightens
its mark; nothing moves text.

## 5. The index: grouping and scale

### 5.1 Order and year groups

Newest first. One group per year: the year in Newsreader at `--t-h3` in the gutter with its count
("8 entries"), and the year's strip (§5.4) over the content column. Rows hang on the date spine and
are separated by hairlines. No month headings: the date gutter and the strip carry the month.
*(amended 2026-10-09.)*

### 5.2 At 4, 40 and 400 entries

| Entries | What the reader gets |
|---|---|
| 1–39 | The header, the year groups with their strips, every row on the spine. No controls. |
| 40–99 | One row of project links above the list (§5.3). Each year keeps its strip; the strips are the year list. |
| 100 and more | The two most recent years stay open. Older years show their first three rows and "All 96 entries from 2027"; each year also has its own archive page, `/record/2027/`. A month with more than six entries shows six ticks and "+n". |

*(amended 2026-10-09: the filters at 20 and the aside's year list are gone.)*

The prototype's "preview the index at 8 / 40 / 400" control demonstrates all three with
simulated rows (§10).

### 5.3 Controls (amended 2026-10-09)

Zero controls until about forty entries (`PROJECT_LINKS_FROM` in `src/lib/site.ts`), then one:

- **Project links**: one line of project names in their colours and "Everything", each a plain link
  to `/record/?project=<slug>` (no toggling; "Everything" clears). A small script hides the other
  rows; without JavaScript the full list shows.
- Removed: the kind filter with counts, category chips, "Show everything" and the live filter line,
  threads as a filter, the aside's year list, opening entries in place. Kinds are visible by shape;
  categories stay as text in the meta line.

### 5.4 Date spine, year strip and threads (amended 2026-10-09)

- **Date spine**: one hairline down the list; each row's mark sits on it in its project's colour
  (Log blue `--log` without one; an entry about two or three projects shares the mark in hard-edged
  slices). Mark shapes follow §4. No glow.
- **Year strip**: at the head of each year, twelve month columns on a hairline; each entry is a
  short tick in its project's colour, stacked when a month is busy (a note's tick is half width, a
  release's thicker). Month labels in meta. It is a picture, not a control: a month with entries is
  a plain anchor to its top row; an empty month is a gap, shown honestly and never counted (§2.3).
- Both are drawn at build in HTML and CSS (`YearStrip.astro`, `LogRow.astro`); no script.
- **Threads** leave the Record. A project's view repeats its thread above "In the record", read, not
  pressed: one row with its name, "5 since Sep 2026", and marks on the project's own time axis
  (notes small, entries larger, essays ringed; one tick per month past 18 months). It appears once
  the project has three entries in at least two months (`threads()` in `src/lib/site.ts`).

### 5.5 Home

F's Home already has "Latest in the log" as a quiet half of the "Now" row: date, title, dek.
It stays a link, never a hero, and never says how long ago (requirements §16).

### 5.6 Phone

The same list in one column: the spine at the left edge, the date above each row, then the
thumbnail (essays and releases, full width), then the title or note text and the meta line. The
year strip spans the width. The Log object is small beside the title. Reading text drops to 19 px.
*(amended 2026-10-09: essay plates now show on phones.)*

## 6. Permalinks, feeds and machine-readable data

### 6.1 Addresses

- `/record/` the index; `/record/<year>/` an archive page per year; `/record/<year>/<slug>/` every
  entry of every kind.
- The slug is frozen at first publish. Editing a title never changes it. If an address must
  ever move, the old one redirects (a `redirects` list in the content; on GitHub Pages a
  static page with `<meta http-equiv="refresh">` and a canonical link).
- Inside an essay: section anchors from the heading (`#a-second-section`) and figure anchors
  (`#fig-entry-flow`). An entry opened in place in the index has the same address as its page.
- In the index, notes are their own links: the date is the permalink.

### 6.2 Feeds

- One Atom feed, `/record/feed.xml`, every kind, newest 50 entries, **full content** (figures as
  inline SVG are replaced by their alt text and a link, since feed readers strip SVG).
- Linked from the record's foot ("Atom feed") and every page's `<head>`
  (`<link rel="alternate" type="application/atom+xml">`).
- Later, when a project has a thread: `/work/<slug>/feed.xml` with only its entries.

### 6.3 Feed identity

- `atom:id` is a tag URI fixed at publish, never derived from the current URL:
  `tag:erendenizk.github.io,2026-10-08:record/why-this-site`. A domain change (edk.dev, brief §7)
  then does not make every reader see the whole log as new.
- `atom:published` is `date`; `atom:updated` is the latest of `updated[]` and
  `corrections[]`, or `date`.
- An untitled note's feed title is "Note, 6 Oct 2026".

### 6.4 Other metadata

- `BlogPosting` JSON-LD on entry and essay pages (`datePublished`, `dateModified`, `author`
  pointing at the site's `Person`); none on notes.
- Open Graph: essays and entries get their own 1200 × 630 card (title in Newsreader on the
  ground, the lead figure's plate for essays); notes share the Log card (requirements §20).
- Every entry is in `sitemap.xml` with `lastmod`.

## 7. Figures and illustrations

### 7.1 When a figure earns its place

A figure is used when it says something faster than a paragraph could (the Julia Evans test):
a flow of steps, a structure, a change over time, a measured number, a real screenshot. Not as
decoration, not as a header image, not on a note.

### 7.2 What is allowed

| Kind | Source | Rule |
|---|---|---|
| Diagram (boxes and arrows) | `tools/illustrations` `box`, `arrow` | at most ~6 boxes; one box in the accent, the one the text is about |
| Timeline | `timeline` | solid up to now, dotted after; future items undated unless the date is real |
| Chart | `bars` | real data only, one series, labelled directly, one bar in the accent; sample data says so in the caption |
| Annotated screenshot | `frame` | a real capture, cropped, notes outside the image on hairline leaders |
| Hand mark | `hand.underline`, `hand.circle` (perfect-freehand) | one per figure at most, to point, never to structure |
| Photograph | file | as craft audit §5.1: graded into the ground, no mat, no tilt; no private people |

Never: AI-generated images, stock photos, emoji, rough.js sketch style (taste question §11),
3D renders inside an entry (the objects belong to the tabs).

### 7.3 Conventions

- **Caption**: one sentence in meta style under the figure, saying what to see in it. No
  "Fig. 1" (audit P1.4). Number figures only when the text refers to more than one.
- **Alt text**: the figure's `desc`, describing the content, not the look ("Four steps from
  left to right …").
- **Width**: up to 720 px, breaking out of the 680 px reading column on desktop; never full
  bleed. Two drawings per figure (720 and 358 wide); the page shows the one that fits, so a
  13 px label is never scaled to 7 px.
- **Colour**: the project the entry belongs to, or the Log's blue; everything else in the
  page's inks.
- **Project light** *(amended 2026-10-09)*: an entry's page opens under a faint light in its
  project's colour (Log blue without one): a radial wash of at most 14% mix at the top, gone by
  ~400–600 px, still under reduced motion. The page accent (the mark's dot, the tab light) takes the
  same colour. Prose links are Log blue on every entry page.
- **Motion**: none. Figures are still; no draw-on-scroll, no fade-up (audit §4.3). A future
  enhancement may highlight a labelled part on hover, with a still twin.
- **Budget**: each inline SVG under 8 KB after svgo (the prototype's are 1.8 to 2.5 KB);
  screenshots AVIF under 150 KB.

The kit's rules, primitives and build are in `tools/illustrations/README.md`.

## 8. What never appears

| Never | Why |
|---|---|
| Streak counters, "X weeks in a row", activity heatmaps of posting | They turn a pause into a visible failure, the exact abandonment signal requirements §16 warns about, and reward posting over work. Threads show continuity without scoring it. |
| "Weekly", "every Friday", "new posts every …" | A cadence promise becomes a broken promise (requirements §16; brief §4.3 already says weekly *or* monthly). |
| "Latest post: <date>" as a hero, "x days ago" | Advertises the gap; relative dates age silently. |
| View counts, likes, reactions, "popular", read counts | Reader metrics are not evidence of work; they need analytics consent under KVKK (requirements §19) and read as vanity at low numbers. |
| Comments | No moderation capacity; replies go to GitHub or LinkedIn. |
| Share-button rows, newsletter pop-ups | Template signals; one "Copy link" on essays is enough. |
| Tag clouds, word counts, reading-progress bars | Noise; reading time on essays only. |
| Growth stages, certainty or "epistemic status" labels | A research-archive register; brief §7 asks for brand-led. |
| Kind badges, coloured category pills, glowing dots | Audit P1.4; the kinds differ by shape. The spine marks are flat project colour, never glowing. |
| Names, faces or places of private people | CLAUDE.md, requirements §9. |
| AI tells in the prose: dense em dashes, "it's not X, it's Y", reflexive triplets, "delve", "journey", uplifting endings, uniform paragraphs, headings on a note | Requirements §18. |

## 9. How an entry is made

Dictation (often Turkish) → the agent drafts in English, in the owner's voice, keeping their
facts exactly → the owner reads the draft and asks for changes → only on the owner's OK is it
published. The steps, the voice rules, the privacy rule and the checks are in the project
skill `.claude/skills/log-entry/SKILL.md`. Its figure is the first drawing in the kit
(`entry-flow`), and it is the lead figure of the sample essay in the prototype.

## 10. Prototype F-log

`prototypes/f-log/index.html` is prototype F (every other tab unchanged) with the Log tab
built to this document. Same artifact contract: one self-contained file, `<title>` first, no
doctype/html/head/body, dark single theme, fonts from Google Fonts with F's metric-matched
fallbacks. It opens on the Log tab.

- **Index**: eight sample entries of the three kinds (titles are the four first entries of
  brief §7; bodies are neutral placeholders marked "sample"), one year group, a Recto thread
  (the only project with three entries in two months), an entry with a correction and one with
  an update.
- **Scale preview** (prototype-only, dashed box): 8 samples, 40 or 400 rows. Simulated rows
  are labelled "Simulated", dated after the samples and up to 2030, and include a project that
  pauses for a year so the thread's gap can be judged.
- **Essay page** `#log/why-this-site`: the sample essay with two figures from the kit
  (`entry-flow`, `levels`), contents list, update block, copy link, older/newer.
- Router: F's state machine with one more view (`post`) that belongs to the Log tab; Back and
  Forward, scroll memory and focus behave as in F.
- Source in the session scratchpad `proto-log/` (scratch, not kept): `src.html` (made once from F's `src.html` by
  `make-src.py` and `parts/`), `build.py` (renders the sample entries from data, inlines
  drawings, icons, media), `shoot.mjs`, `nav.mjs`.
- Shots in `prototypes/f-log/shots/`: `{desktop,tablet,phone}-log[-2|-3]`, `-log-open`,
  `-scale400`, `-scale400-filtered`, `-scale40`, `-post`, `-post-fig1`, `-post-fig2`,
  `-post-end`, `phone-scale400-threads`, `rm-{desktop,phone}-log`. No horizontal overflow and
  no console errors at any size.

Known limits: threads are drawn at runtime here (build time on the real site); filters are
in-page state, not in the URL; the "Atom feed" link is a placeholder; on phones at 400 entries
the threads sit far below the list (a "Threads" chip beside the years could jump there).

## 11. Questions for the owner (taste)

1. **The index's title.** (a) "The record" as in F; (b) "Log"; (c) "Notes and entries";
   (d) "Work log".
2. **Notes in the list.** (a) whole text inline, as prototyped; (b) first line only, tap to
   read; (c) notes in a separate stream beside entries.
3. **Threads.** (a) in the aside as prototyped; (b) at the top of the Log, above the list;
   (c) only inside each project's view; (d) both (a) and (c).
4. **Hand marks in figures.** (a) one perfect-freehand underline or circle allowed, as in the
   levels figure; (b) none, everything geometric; (c) a rough.js sketch style for whole
   diagrams.

## 12. Amendments of 2026-10-09 (Record redesign)

Accepted by the owner on 2026-10-09 (brief §7, "Record redesign"), from
`research/2026-10-readability.md` §8–§11 and its answers to §13: (1) spine and year strip,
threads only in project views; (2) every entry opens its own page; (3) a release look; (4) a faint
project light on entry pages; (5) 21 px reading text.

| Section | Change |
|---|---|
| §0, §3.1 | Entries open their own page; a release is an entry with a `version`. |
| §3.2 | New optional fields `version`, `key`, `image` (+ `imageAlt`, `caption`), `next`. |
| §3.8, §3.9 | Project names link to projects and colour the marks; the writing note moves to the foot. |
| §4 | Rows by shape: note, entry, release, essay with a 16:10 thumbnail (also on phones). |
| §5.1–§5.4, §5.6 | Date spine and year strips; no controls until ~40 entries, then one row of project links; threads only in project views. |
| §7.3 | Project light at the top of entry pages; links in Log blue. |
| Header | "The record" at `--t-h2`, a one-line dek and a count, the Log object small beside it: at most ~220 px, so the first entry shows on the first screen at 1440×900. |

### 12.1 Reading type

- Entry pages and notes in the list: Newsreader **21 px / 1.55** (notes in the list 1.5),
  `max-width: 28em` (≈ 588 px, about 70 characters), **19 px on phones** with `hyphens: auto`.
  Paragraphs 1em apart, ragged right, `text-wrap: pretty`, `hanging-punctuation`. Scoped to the
  Record (`.read`, `.n-text`); `--t-read` and `.prose` elsewhere are unchanged.
- **Weight 430**, chosen by eye from 400, 430 and 450 side by side on `--ground` at 1x and 2x
  (readability research §12.1; `research/assets/2026-10-readability-weights-{1x,2x}.webp`). 400 looks
  thin on black at 1x, the halation the research warns about; 450 starts to read as bold beside the
  Inter interface and blurs the difference from `<strong>` (500); 430 holds the strokes without
  changing the face's colour.
- Open check (§12.2 of the research): the self-hosted Newsreader subset keeps `liga`, `pnum` and
  `tnum` but not `onum`, so prose figures stay lining. Re-subsetting with `onum` is a follow-up in
  `tools/fonts`.

### 12.2 Entry page

Back link; meta (date · kind · category · projects in colour); for a release whose title is not
the version, the version line in colour; title (`--t-h2` for entries and releases, `--t-title` for
essays; a release titled as its version is set in the project's colour); dek as lede. Then the
reading flow: the body's first paragraph, the **key line** (display face, project colour, a 2 px
rule at its left; at most one), the **image** at 720 px with a one-sentence caption, the rest of the
body, and **"Next:"** in the UI face. The key line and the image follow the first paragraph on screen
(CSS `order`), so the first sentence stays on the first screen; in the document they come before the
body. Foot unchanged.

### 12.3 Empty record

With no entries the page keeps its frame: the header ("No entries yet"), this year's strip with
nothing on it, a dashed spine, the line from `site.json` at reading size, the four marks with what
each will mean, and the project colours named. Nothing is invented to fill it.
