# Illustrations

The log's figures, drawn by code from one set of rules, the way `tools/icons/` draws the icons:
the source is committed, the output is regenerated, nothing is drawn by hand in an editor.
Where figures go and how they are captioned: `docs/design/log.md` §7.

```
rules.mjs      the rules: colour tokens, the two widths, grid, strokes, arrowhead, radii,
               type roles, dots, hand-mark settings, a text-width estimate
kit.mjs        primitives built only from the rules: figure, text, box, arrow, timeline,
               bars, frame (annotated screenshot), hand.underline, hand.circle
drawings/      one module per figure: title, desc (alt text), caption, wide(), narrow(),
               optional plate() (a text-free thumbnail for the index)
build.mjs      draws every figure at both widths, optimises with svgo, writes out/
out/<name>-wide.svg, -narrow.svg   standalone files (carry their own <style>)
out/drawings.json                  inline strings by name (no <style>), plus caption and alt
out/illustrations.css              the stylesheet a page loads once
out/sheet.html                     contact sheet: every figure at both widths on the ground
```

Build-time only. Nothing here ships to the page except the SVG strings and the stylesheet it
writes; there is no runtime dependency.

## Running

```sh
cd tools/illustrations && npm install   # dev dependencies: perfect-freehand 1.2.3, svgo 4.1.0
node build.mjs                          # or: node build.mjs --deps <dir whose node_modules has them>
```

Output is deterministic: hand marks are seeded, so a rebuild is byte-identical. Without
perfect-freehand, hand marks fall back to plain strokes and the build warns; without svgo the
markup is about a fifth larger. The build prints a size per drawing and any warnings (a label
estimated wider than its box). Open `out/sheet.html` and look at it after any change.

## Rules

Every number comes from `rules.mjs`; a drawing never picks its own.

1. **Two widths, never one scaled.** Each figure is drawn at 720 (desktop, breaking out of
   the reading column) and 358 (a 390 phone minus 16 px gutters). The page shows the one that
   fits its container, so a 13 px label is always 13 px. The narrow drawing re-lays the
   figure out (rows become a column), it is not a crop.
2. **The site's tokens.** Every colour is a CSS variable with the token as fallback
   (`var(--ink-3, #8c877f)`), so an inline figure follows the page. Ground `#0a0a0b`; lines in
   `--ink-3`; boxes a 6 % wash with a hairline; text in `--ink`, `--ink-2`, `--ink-3`.
3. **One accent per figure**: the project the entry belongs to, or the Log's blue. It marks
   the one thing the text is about (one box, one bar, the current dot, the hand mark). Recto
   is drawn with its softer glow green, never `#bbed26` as a thin line (craft audit §5.3).
4. **Strokes follow the icons.** 1.5 px for lines and arrows (the 16 px icon stroke, Inter's
   stem beside 15 px text), 1 px hairlines for axes and frames, 2 px only for emphasis. Round
   caps and joins.
5. **Arrowheads are the 16 px icon's head**: two arms 5.25 px long at 45° to the shaft. An
   arrow stops 6 px short of the box it points at (`box().left/right/top/bottom` already
   include the gap). Corners on routed arrows are rounded by one grid step.
6. **An 8 px grid.** Box edges, gaps and rows sit on it; boxes 56 or 64 tall, radius 6.
7. **The site's type, at the site's sizes.** Inter through `--f-ui`: names 15/500, labels 13,
   notes 15. A figure never has a title of its own inside the drawing; the caption is in the
   page. No mono, no caps.
8. **Timelines tell the truth about time.** Solid up to the current item, dotted after; future
   items are hollow and undated unless the date is real. Done items are filled dots, the
   current one ringed.
9. **Charts are one series of real data**, labelled directly (no legend, no gridlines), bars at
   most four grid steps wide, one bar in the accent. Sample data is said to be sample in the
   caption and the title.
10. **Screenshots are real captures** in a rounded frame with a hairline. Notes sit outside the
    image, joined to the spot by a hairline leader and a dot; labels on one side keep three
    grid steps between them, and a pushed label gets a bent leader.
11. **One hand mark at most**, perfect-freehand, in the accent, to point at something (an
    underline under a word, a loose loop round a spot). Never to draw structure.
12. **Still.** No animation in the drawing; the page decides motion, and figures have none
    (log.md §7.3).
13. **Accessible.** `role="img"` with `<title>` (the figure's name) and `<desc>` (what it
    shows, written as content, not as look). Plates for the index are `aria-hidden`.
14. **Budget**: under 8 KB per inline drawing after svgo.

## Adding a figure

1. Ask whether it says something faster than a paragraph (log.md §7.1). If not, skip it.
2. Add `drawings/<name>.mjs` exporting `{ name, accent, title, desc, caption, wide(), narrow() }`
   where `wide()` and `narrow()` return `{ height, body }` and `body` is built only from
   `kit.mjs` primitives. Set `sample: true` for anything not real.
3. Use the facts the entry states, and nothing else; a drawing never adds a claim.
4. Build, read the warnings, open the sheet, look at both widths beside 19 px Newsreader text.
5. In the page: insert `drawings.json[name].wide` and `.narrow` inside one `<figure>` with the
   caption; load `illustrations.css` once. The prototype's markup:

```html
<figure class="fig" id="fig-entry-flow">
  <div class="fig-art"><div class="fig-w"><!-- wide --></div><div class="fig-n"><!-- narrow --></div></div>
  <figcaption class="meta">Every entry passes the same gate: nothing is published before I have read it.</figcaption>
</figure>
<!-- .fig { container-type: inline-size } and @container (min-width: 720px) shows .fig-w -->
```

## A worked example

```js
import { box, arrow } from '../kit.mjs'
export default {
  name: 'two-steps', accent: 'recto',
  title: 'Export is checked before download',
  desc: 'Two boxes: Export, then Re-open and check, with an arrow between them.',
  caption: 'Every export is opened again before the file is offered.',
  wide() {
    const a = box({ x: 0, y: 16, w: 200, h: 64, name: 'Export' })
    const b = box({ x: 256, y: 16, w: 200, h: 64, name: 'Re-open and check', emph: true })
    return { height: 96, body: [a, b, arrow({ points: [a.right, b.left], accent: true })] }
  },
  narrow() { /* the same two boxes stacked, arrow pointing down */ },
}
```

## Drawings now

| Name | Use | Real or sample |
|---|---|---|
| `entry-flow` | How a log entry is made (dictation, draft, review, published, a loop for changes); has a plate | real (CLAUDE.md "Log entries") |
| `levels` | The site's levels on a four-year line, Level 1 underlined by hand | real (docs/history/roadmap-2026-10-08.md, brief §2.3); only the start is dated |
| `sample-chart` | The bar primitive | sample data |
| `sample-frame` | The frame primitive on a capture of prototype F's log | real capture, contact sheet only |
