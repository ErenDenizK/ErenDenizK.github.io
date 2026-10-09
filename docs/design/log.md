# Log: information design (2026-10-09)

What the log is made of, how its index groups and scales, how entries are addressed and fed,
how figures are drawn, and what never appears. **Status: accepted 2026-10-09.** Owner's answers to §11: title "The record"; notes in full in
the list; threads beside the log and inside each project's view; at most one hand mark.

Rests on: brief §2.2 (public record, evidence of steady work), §2.3 (four years, cheap to add
to), §4.3 (dictated notes, open categories, figures drawn in code), §7 (English, dark,
brand-led; first entries); requirements §15–18 (abandonment, shape, AI disclosure, voice);
craft audit §3–4 (type and motion); ux-patterns §6 (routes); ADR-0002 (content is data).
Prototype: `prototypes/f-log/` (§10). Illustration kit: `tools/illustrations/` (§7).
Workflow: `.claude/skills/log-entry/SKILL.md` (§9).

## 0. Decisions in brief

1. **Three kinds**, chosen by length: a **note** (one to three sentences, no title), an
   **entry** (a few paragraphs, titled, opens in place in the index) and an **essay** (long,
   with figures, its own page). The kind is honest about the effort; a busy month still
   yields a note.
2. **Time lives in the structure**, never in counters: year groups, a date gutter, a quiet
   "updated". No streaks, no cadence promise, no "latest post" hero, no view counts.
3. **Every entry links to the projects it is about.** Those links draw **threads**: each
   project as a line of marks on one shared time axis, the evidence that a project moved over
   months (brief §2.2).
4. **The index stays one page** that reads at 4 entries and at 400: filters appear at 20,
   a year list at two years, older years fold at 100.
5. **Append-only in public.** Published text is not silently rewritten: additions are dated
   "Updated" notes, changed facts are marked "Correction". Typos are fixed quietly.
6. **Stable addresses**: `/log/<year>/<slug>/` for every kind, the slug frozen at publish;
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
| Figures | at most one image, no caption | at most one figure | any, from the kit (§7) |
| Reading time | no | no | yes, rounded minutes at 230 words per minute |
| Where it is read | in the index, whole | opens in place in the index | its own page |
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
help: edit                  # edit (default) | more: the agent did more than edit (§3.9)
---
Body in Markdown.
```

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
project's colour (text only, no dots or glows, audit P1.4), feed the threads (§5.4), and make
the project's focus view list its entries under "In the log" (newest first, the same rows).

### 3.9 Disclosure

One site-wide note, already in F's Log header and colophon: "I dictate the notes, often in
Turkish; an agent edits them into English and I read every draft before it goes up." A
per-entry line appears only when the agent did more than edit (`help: more`, e.g. it
researched facts or wrote a section from scratch): "Written with more help than usual: …"
(requirements §18).

## 4. How the kinds look different

All three share the row grid F already has: a 5rem date gutter, the content column, and a
right column for the kind. They differ in type and weight, so a reader scanning 400 rows sees
the shape of the record.

| | Note | Entry | Essay |
|---|---|---|---|
| Row | the text itself, Newsreader 19/1.5 (`--t-read`), `--read` colour, ≤32em | title Newsreader 25 (`--t-h3`), dek Inter 15 `--ink-2` | as entry, plus a 96 × 56 plate of its lead figure on desktop |
| Meta line | projects · category | projects · category · Updated | projects · category |
| Right column | "Note" | "Entry" + chevron (opens in place) | "Essay · 2 min" + arrow (goes to its page) |
| Permalink | the date is the link | "Link to this entry" inside the open body | the row is the link |
| Page | the note alone, date as title | title, dek, body, updates | title at `--t-title`, dek as lede, body with figures breaking out to 720 px, contents list beside it from 1240 px, foot with published/updated, copy link, older/newer |

A note reads as a sentence, an entry as a headline, an essay as a headline with a picture.
No kind gets a badge, an icon or a colour of its own.

## 5. The index: grouping and scale

### 5.1 Order and year groups

Newest first. One group per year: the year in Newsreader at `--t-h2`, the count beside it in
meta ("8 entries"). Rows inside a group are separated by hairlines. No month headings: the date
gutter already carries the month, and month headings over a sparse month would advertise the
gap.

### 5.2 At 4, 40 and 400 entries

| Entries | What the reader gets |
|---|---|
| 1–19 | The header, one or two year groups, every row. No filters, no year list. Threads appear for any project that qualifies (§5.4); otherwise one line says when they will. |
| 20–99 | Filters appear above the list (§5.3). With two or more years, a year list in the aside (desktop) or a row of year chips (phone). |
| 100 and more | The two most recent years stay open. Older years show their first three rows and "All 96 entries from 2027"; each year also has its own archive page, `/log/2027/`. Threads switch from one mark per entry to one tick per month when they span more than 18 months. |

The prototype's "preview the index at 8 / 40 / 400" control demonstrates all three with
simulated rows (§10).

### 5.3 Filters

- **Kind**: All · Notes · Entries · Essays, with counts, as one segmented control.
- **Category**: one chip per category with three or more entries; one at a time.
- **Project**: the threads are the project filter (press a thread; press again to clear).
- A live line states the result in words, "Showing 15 essays in Recto", with "Show
  everything".
- On the real site, filters are query parameters (`/log/?kind=essay&project=recto`) applied
  by a small script over the complete list; without JavaScript the full list shows.

### 5.4 Threads

A thread is a project drawn over time, the one view that answers "did this move on months
later?" (brief §2.2).

- One row per project: its name in its colour, "111 since Sep 2026", and a line on an axis
  shared by all threads, from the first entry of the log to the latest.
- Up to 18 months of span: one mark per entry, small for a note, larger for an entry, a ring
  for an essay. Longer: one tick per month, taller for busier months (up to four steps).
- The line runs from the project's first entry to its latest, and stops there. Nothing is
  drawn after it: a pause shows as a gap between marks, honestly, but the design never labels
  a project "inactive" or counts days since.
- A thread appears once a project has **three entries in at least two different months**;
  until then the row would be a dot, not a thread.
- Pressing a thread filters the list to that project. The project's focus view repeats its
  thread above "In the log".
- Desktop: in the sticky aside under the Log object. Phone: after the list.
- On the real site threads are drawn at build with the kit (`timeline`-style marks), with a
  small script only for the filter; the prototype draws them at runtime because its preview
  rows are simulated.

### 5.5 Home

F's Home already has "Latest in the log" as a quiet half of the "Now" row: date, title, dek.
It stays a link, never a hero, and never says how long ago (requirements §16).

### 5.6 Phone

The same list in one column: date and kind on one line, then the title or note text full
width, then the meta line. The Log object shrinks to F's small poster beside the title.
Filters wrap; the kind control spans the width. Threads follow the list. Essay plates are
hidden.

## 6. Permalinks, feeds and machine-readable data

### 6.1 Addresses

- `/log/` the index; `/log/<year>/` an archive page per year; `/log/<year>/<slug>/` every
  entry of every kind.
- The slug is frozen at first publish. Editing a title never changes it. If an address must
  ever move, the old one redirects (a `redirects` list in the content; on GitHub Pages a
  static page with `<meta http-equiv="refresh">` and a canonical link).
- Inside an essay: section anchors from the heading (`#a-second-section`) and figure anchors
  (`#fig-entry-flow`). An entry opened in place in the index has the same address as its page.
- In the index, notes are their own links: the date is the permalink.

### 6.2 Feeds

- One Atom feed, `/log/feed.xml`, every kind, newest 50 entries, **full content** (figures as
  inline SVG are replaced by their alt text and a link, since feed readers strip SVG).
- Linked from the Log header ("Atom feed") and every page's `<head>`
  (`<link rel="alternate" type="application/atom+xml">`).
- Later, when a project has a thread: `/work/<slug>/feed.xml` with only its entries.

### 6.3 Feed identity

- `atom:id` is a tag URI fixed at publish, never derived from the current URL:
  `tag:erendenizk.github.io,2026-10-08:log/why-this-site`. A domain change (edk.dev, brief §7)
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
| Kind badges, coloured category pills, glowing dots | Audit P1.4; the kinds differ by type and weight. |
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
- Source in the session scratchpad `proto-log/`: `src.html` (made once from F's `src.html` by
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
