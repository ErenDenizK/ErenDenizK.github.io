# The log

One file per entry: `content/log/<year>/<slug>.md` (or `.mdx` for an essay with figures). Files
starting with `_` are ignored. Fields, kinds and rules: `docs/design/log.md` §3; the workflow from
dictation to a published entry: `.claude/skills/log-entry/SKILL.md`. Nothing is published without
the owner's OK on the exact draft.

```yaml
---
kind: entry                 # note | entry | essay
title: Two tracks           # entry and essay only; notes have no title
dek: One sentence that adds the reason, result or number.   # entry and essay only
date: 2026-10-05            # publication date; never changes
category: school            # one, open vocabulary: personal, work, school, ...
projects: [recto]           # slugs from content/projects (file names)
updated: []                 # appended: [{ date: 2026-11-02, note: "Added the result." }]
corrections: []             # appended: [{ date, was, now }]
figures: []                 # names from tools/illustrations/out/drawings.json
lead: entry-flow            # essay only: the figure whose plate shows in the index
version: 1.0.0-beta         # optional: a version shipped; the row takes the release look
key: "300 pages, no freeze" # optional: one pull-out line, only a number or fact the owner said
image: ./recto-worker.webp  # optional: path relative to this file; opens the page, thumbnail of essays and releases
imageAlt: What the image shows   # required with image
caption: One sentence on what to see in it.   # optional
next: Annotations are next. # optional: the owner's own next step, the page's closing line
help: edit                  # edit | more (the agent did more than edit; add helpNote)
---
Body in Markdown. In an .mdx essay a figure is <Figure name="entry-flow" />. A release keeps its
shipped items as the body's first list; the record shows the first three.
```
