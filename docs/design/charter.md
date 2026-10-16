# Design charter: what holds for the two-page site

**Status:** 2026-10-15, late night. The owner moved the site to two pages, Home and Record, with one
shared token set and a redesign from scratch inside the same logic (brief log, 2026-10-15, the last
two sections). The charter of the four-page site is archived in
[`docs/history/charter-2026-10-15.md`](../history/charter-2026-10-15.md); its page numbers are not
inherited. This file keeps only the points that still hold: the owner's answers and the rules that do
not depend on the old page structure. The new token set and its numbers are written here when the new
Home is designed; until then, a number that is not in this file is open.

Sources: O is the owner (date, `docs/history/brief-log.md`); M is a measurement; R is research. The
section numbers match the archived charter, so code comments that cite "charter §4" still point at
the right rule.

## 1. Character

- Presentation first: the page someone opens when the owner introduces themselves; the first minute
  counts. (O 2026-10-08)
- Pinpoint wording: short, direct, correct; no ornate self-description. (O 2026-10-12)
- Controlled: every size, alignment and interaction is chosen and measured. (O 2026-10-11, night)
- Nothing too big: the Home round of 2026-10-11 was rejected because everything was too big and
  contrived. Rich motion is wanted now; oversized type is still not. (O 2026-10-11, late; 2026-10-15)

## 3. Type and reading

- **A real italic** (O 2026-10-15, night): Newsreader's own italic, never a slanted roman
  (`tools/fonts/subset.py`; ADR-0016). It is not preloaded; a page downloads it only when it shows
  italic text.
- **Record reading rules** (O 2026-10-09; `docs/design/log.md` §12.1; `docs/research/2026-10-readability.md`):
  reading prose at 21 px on wide screens and 19 px on phones, line height 1.55, weight 430, at most
  28em (about 70 characters). Reading text never moves: no fades per paragraph and no scroll-linked
  effects inside a reading column (`readability` M1). These rules apply to Record entries. The Home
  presentation may set its own sizes in the new token set.
- **Smallest readable text: 13 px** for 400-weight text on the Graphite ground (M: APCA has no row for
  400 weight below 13 px). 11-12 px only for labels inside a figure.
- **Touch targets: 44 px** on touch screens.

## 4. Colour

- **Theme: Graphite** (O 2026-10-15, night; ADR-0016): one dark theme. No white pages and no theme
  switch: white tires the eyes and does not carry the aura. The ground stays near-black. Pure black
  (#000) is never a ground for text, pure white (#fff) is never text. (O 2026-10-12, 2026-10-15)
- **Aura, grain and noise are the concept** (O 2026-10-15, night): the aura colours the page from what
  the page shows; the grain eases reading. The two-page direction asks for the aura to be used in a
  modern, generous way, not a timid one (O 2026-10-15, late night).
- **The Graphite values** are live on `:root` in `src/styles/global.css` and the new token set keeps
  them (measured on #121214, WCAG 2 and APCA 0.0.98G):

  | Token | Role | Floor | Value | Measured |
  |---|---|---|---|---|
  | `--ground-deep` | object stage centre | | #0d0d0f | |
  | `--ground` | every page | | #121214 | |
  | `--raised` | cards, frames | | #1a1a1d | |
  | `--raised-2` | one more step | | #232327 | |
  | `--ink` | titles, interface | Lc 75, at most about Lc 90 | #e8e3dd | 14.7:1, Lc 90 |
  | `--read` | reading prose | Lc 75 | #dedad2 | 13.4:1, Lc 84 |
  | `--ink-2` | secondary sentences | Lc 75 | #d3cfc7 | 12.1:1, Lc 77 |
  | `--ink-3` | labels, dates, captions | Lc 45 | #a19d96 | 6.9:1, Lc 49 |
  | `--ink-4` | non-text only: rules, idle marks | Lc 30, 3:1 | #827e78 | 4.6:1, Lc 33 |

- **Contrast floors**: a pair passes only when both WCAG 2 and APCA pass: body Lc 75 and 4.5:1; large
  Lc 60 and 3:1; label Lc 45 and 4.5:1; non-text Lc 30 and 3:1. Reason: WCAG 2 overrates contrast on
  dark grounds. A colour or a tone is never guessed. (O 2026-10-15; M)
- **Product colours are light**, and a colour that must be ink on a ground gets its own measured ink
  (`accent.ink` and `accent.fill` in the product's content; Eat Map rose is never small text).
- Open for the new token set: how many product lights may show in one viewport, and how large a
  saturated field may be. The archived charter limited both; the owner's Shopify Editions reference
  and "a generous aura" may change that.

## 5. Motion

- **No loading screen**, intro show, counter or gate; the visitor never waits and never gets lost;
  not five buttons at once before the site has said what it is. (O 2026-10-15)
- **No one-second limit on the arrival**; the longer effects stay. (O 2026-10-15, night)
- **Slow, rich motion** that brings content in one by one while the visitor scrolls; every object
  alive; the Work transition grows the photo into the project inside the same UI, with no new tab and
  no window that opens and closes. (O 2026-10-15, late night) The durations and curves are written
  here with the new token set.
- **Still twins**: reduced motion, no JavaScript, no WebGL and phones each get a complete page
  (CLAUDE.md). Under reduced motion nothing moves; an object the visitor drives jumps to its end
  state, and a button gives every action. Nothing depends on hover.
- Extreme input never gives an extreme reaction: speed and angle are clamped. (O 2026-10-10)

## 6. Objects, cards and photos

- **Objects stay pre-rendered** (O 2026-10-11, option a; ADR-0006) and are drawn additively on a dark
  ground. They may be reused; 2.5D layered illustration may be the better tool (O 2026-10-15, late
  night).
- **The cards stay**: the ID card and the postcard, reimplemented as needed (O 2026-10-15; ADR-0008).
  Postcard v2: a designed back and frame; a click opens a large view where the card flips and swings,
  with at most a slight depth that cannot break; Darkroom's burn-in may return, much faster; never
  Darkroom's caption or anything from Proof. (O 2026-10-15)
- **Photo captions: to test** a one-line caption under the photo and a caption shown only in the
  enlarged view. (O 2026-10-15, night)
- Photos are never stretched past their pixels; one cat photo, never both (O 2026-10-10). The metro
  photos stay in the repo and may be used when needed (O 2026-10-15, evening; this replaces "never
  used" of 2026-10-11).

- **Numbers of the person's part** (spec v2 §2.2, §2.5, §2.6; lab page only until the owner accepts):
  `--chapter-gap` 168 px desktop and 112 px phone between the person's chapters, `--in-chapter` 72 px
  and 48 px inside one. The Record's grid keeps its numbers under new names: `--rec-gutter` 64,
  `--rec-spine` 36 (22 on phones), `--rec-col` 680, `--rec-thumb` 244, `--rec-w` 1060 px. The ID card
  and the postcards are one family: `--gold-ink` rgb(243 184 134), `--foil` (the live card's conic
  gradient #f3b886, #f6dcc4, #c9d4ff, #efb1cb), the guilloché at 0.07 behind the card and 0.11 on a
  card face. Line-art textures stand at 0.06 to 0.08 behind text-free areas. Reason: the review asked
  for chapters instead of equal strips (G5), the Record's own language on Home (R1), and denser texture
  (C2, E1).

## 7. Never

- A loading screen; a name set as a poster; everything too big. (O 2026-10-11, 2026-10-15)
- Pure black with pure white; a guessed colour; a white page. (O 2026-10-12, 2026-10-15)
- Ornate self-description. (O 2026-10-12)
- A native scrollbar anywhere: the beads rail stays (O 2026-10-11, 2026-10-15; ADR-0013); emoji as
  icons; symbols typed as characters (CLAUDE.md).
- Faux italic; stretched images; both cat photos. (O 2026-10-10, 2026-10-15)
- The same fact in two or three places on a page; the intro summary is the one exception.
  (O 2026-10-15, late night)
- A new design on a live page before the owner has tried it on a lab page. (postmortem, "What changes" 5)

## 8. How to check

- **`npm run palette`** reads the `:root` tokens, composites translucent layers on their ground, and
  fails when a pairing in its PAIRS table is below its floor (section 4). `npm run verify` and CI run
  it as `npm run palette:gate` (ADR-0016). New tokens get their PAIRS rows when they are added.
- A page probe (sizes, characters per line, overflow, touch targets, image scale, arrival, reduced
  motion, computed text colours) is still to be built; its limits come from the new token set.
- The tools cannot check taste: the critic reviews screenshots and motion frames against the owner's
  words and this file, and the owner tries each lab page on the iPhone and a computer.
