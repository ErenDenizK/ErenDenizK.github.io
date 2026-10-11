# Research: the rail, simpler (2026-10-11)

**Status:** proposal. Four looks are built behind a temporary switch (`?rail=a|b|c|d`) and the
recommendation (A, Beads) is the default until the owner chooses; ADR-0013's amendment of
2026-10-11 records it. Nothing here overrides the owner's choice. The earlier research,
`2026-10-scroll-rail.md`, stays the reference for the platform facts (hiding, iOS, forced colours)
and its §2 accessibility rules; this file only adds what the redesign needed.

**The ask** (owner, 2026-10-11, brief log): "No native scrollbar anywhere; custom everywhere. I
didn't like the new scrollbar: it isn't minimalist; design something simpler and aesthetic. It's
a very important element." With a sketch: on the left (marked with a tick) a small dot or pill,
a dot, a long thumb line, then three short dashes; on the right (marked with a question mark) a
ladder, a vertical line with ticks of varying length, the current one longer.

Evidence grades as in the earlier file: **E** verified here from a primary source, **P**
practitioner writing, **K** prior knowledge not re-checked this round, **M** measured on our own
build. The sandbox gave search extracts, not most pages, so much of §1 is K: it describes how
these products behave as commonly known, and should be read as design reference, not as fact.

---

## 1. How the best interfaces show "where am I"

| Reference | What it does | What we take | Grade |
|---|---|---|---|
| iOS / iPadOS scroll indicator | A thin dark-or-light capsule, no track at all; appears while scrolling, fades after; length is the share in view, and it shrinks (rubber-bands) at the ends. Long lists make it grabbable after a press. | No track is needed when the thumb is honest; motion should come from the scroll itself; the ends deserve care. | K; the indicator shows while tracking and fades after (E, UIScrollView docs extract) |
| macOS overlay scrollbars | A 7–8 px thumb, no track until hover, then the track appears and the thumb widens. "Always show" exists in System Settings because auto-hiding hurt some people. | Reveal on hover; do not make the thumb disappear. | K; the setting and why (P, Bailey) |
| Linear, Vercel, Stripe docs | No custom page scrollbar; the "on this page" list on the right carries the place, the current heading lit, a thin vertical line beside it. | The place in the document matters more than the share in view; titles belong to hover/focus. | K |
| Medium-style reading progress | One line that fills as you read, top edge or side. | A fill reads instantly, even peripherally; it says nothing about sections. | K |
| Instagram / stories progress | Segments, one per item, the past full, the current filling, the future empty. | Sections as gaps in one line: information without extra marks (concept D). | K |
| iOS page control (dots) | One dot per page; newer iOS stretches the current dot into a short capsule that fills with time, the others stay dots. | A current mark that becomes a line and fills: exactly the owner's sketch (concept A). | K |
| Teenage Engineering, instrument and watch scales | Rulers of evenly spaced ticks, major ticks longer, a needle; magnification near the pointer (the Apple Watch crown list, the macOS Dock). | A scale with a lens: precise, technical, still quiet (concept C). | K |
| Rauno Freiberg, Emil Kowalski (interface craft) | Small elements earn delight from motion that follows input with spring physics and no lag, and from doing less. | Springs for state changes; nothing animated that is not caused by the reader. | K |
| Craft, Arc, Things | Chrome that recedes while you read and wakes when touched. | An idle state quieter than the active one, never invisible. | K |

### What makes it feel premium

1. **One idea per element.** The current rail has three (track, thumb, ticks) at the same weight; the
   owner read that as "not minimalist". Each concept below keeps one idea and drops the rest.
2. **Proportion and alignment.** Everything on one axis (7 px from the edge), dimensions in whole
   pixels, gaps on a 4 px rhythm (4, 8), one thickness family (1, 2, 3, 4 px).
3. **Motion only from the reader.** The rail moves because the page moved: continuous values (thumb,
   needle, fill) follow the scroll on the same frame with no easing (an eased thumb lags and feels
   cheap); discrete changes (a new section) morph on the site's UI spring (`--spring-ui`, 480 ms).
4. **Quiet until asked.** Resting lines are decorative (`--rail-faint`, about 1.6:1) and wake while the
   page moves or the pointer is near; what tells the place (thumb, needle, current mark, fills) always
   keeps at least 3:1, so nothing a reader needs ever fades away (Bailey; WCAG 1.4.11).
5. **Colour as light, sparingly.** Only the current mark carries the accent at full strength; the
   past keeps its section's light at a solved rest value (ADR-0011 item 10); the future is neutral.

### Accessibility norms kept (from `2026-10-scroll-rail.md` §2, unchanged)

- Never emulate scrolling: the rail reads the position and writes it only while dragged.
- The bar is not a tab stop; with sections it is a `nav` of real links (ADR-0011 item 9).
- 3:1 for what identifies the place (1.4.11); 24 px targets (2.5.8), 44 px on touch.
- Forced colours and no JavaScript keep the platform's bar; reduced motion: nothing grows or morphs,
  only colour changes.
- A W3C proposal (December 2025) for an overlay `scrollbar-style` asks auto-hiding bars to respect
  "Always show scrollbars"; CSS cannot read that setting today, which is one more reason the place
  indicator never hides (P, csswg-drafts #13218 extract).

## 2. No native bar anywhere: the audit

Measured on the build at 1440 × 900 and 390 × 844 with classic scrollbars (M), every element whose
overflow is `auto` or `scroll`, on all 18 routes and in the open sheet:

| Scroller | Before | Now |
|---|---|---|
| the page (`html`) | hidden by the rail classes | unchanged |
| the sheet (`.sheet-scroll`) | hidden by the rail classes; `scrollbar-width: thin` in `global.css` underneath | unchanged |
| the screens strip on Work (`.w-screens`, phones, two per page) and the English Prep shots row (`.shots-row`, phones), from `work.css` and `embassy.css` | `scrollbar-width: none` on their own | unchanged |
| the touch titles sheet when a phone on its side is short (`.rail-sheet`) | thin native bar | hidden |
| anything new (a code block in an entry, a long caption, a table) | native bar | hidden |

No route has another scroller today (the audit found exactly these); the risk is the future (entries are data, ADR-0002:
an entry with a code block would bring a native bar back). So the rule is general: while the rail is on,
`html.rail-on *` and `html.rail-touch *` get `scrollbar-width: none` and `::-webkit-scrollbar` is hidden,
behind the same media conditions as before (forced colours always bring the bars back; no JavaScript
never sets the classes). An inner scroller keeps scrolling with wheel, trackpad, touch and keys; its
content edge shows that there is more, as on iOS. iOS Safari before 18.2 still shows its indicator for
the page (ADR-0011 item 13): there is no switch there. Windows classic bars are the same Chromium /
Firefox `scrollbar-width` path and are covered by the classic-scrollbar tests.

## 3. Four concepts

All four share one engine (`scripts/rail.ts`), one axis 7 px from the right edge, mid-height, at most
`--rail-h` = min(44vh, 320 px) tall, inside the 16 px gutter on phones, the same behaviour (drag in
proportion, press goes there, Escape restores, wheel stays native, titles on hover/focus, the touch
sheet on tap) and the same section data. They differ only in what is drawn.

### A · Beads (the owner's sketch, recommended)

- **Geometry.** A short column centred on the axis, one mark per section, 8 px apart. Behind you: a
  4 px dot in the section's rest light. Ahead: an 8 × 2 px dash in `--rail-idle`. Current: a 3 × 40 px
  line (32 px on touch) in the section's rest light, filling from the top with its full accent as you
  read through it (at least 10 % so it is always lit). A page without sections is cut into its screens
  (2 to 6 beads), so the same column says "screen 2 of 4".
- **States.** Idle: as above. Hover (desktop, 120 ms intent): the dashes ahead lengthen to 10 px and
  lighten to `--ink-3`, the titles panel opens beside the column, centred on it. Drag: the pointer's place
  along the column is the place in the page. Touch: the column is the 44 px button; tap opens the titles.
- **Motion.** The fill follows the scroll on the frame. When the current section changes, the old line
  shrinks to a dot and the next dash grows into the line on `--spring-ui` (480 ms); colours cross-fade in
  200 ms. Reduced motion: shapes change at once, only colours fade.
- **Why it works.** It is the owner's own drawing; it is the smallest of the four (88 px tall for About's
  eight chapters); it answers "where am I, what is behind, what is ahead" without text; the morph is the
  one moment of delight and it is caused by the reader.
- **Costs.** It is not a proportional scrollbar: the column does not show how much of the page is in
  view, and a long section and a short one look the same until current. Dragging along an 88 px column is
  coarse on a long page (the page's own scrolling stays the precise tool).

### B · Hairline

- **Geometry.** One 1 px line, `--rail-h` tall, and a 2 px segment on it, the share in view (at least
  24 px), in the accent (the current section's on a page with sections). No marks.
- **States.** The line rests at 45 % of `--rail-idle` and wakes to 78 % while the page moves or the
  pointer is near, settling 1.1 s after; the segment never fades. Hover and drag widen the segment to
  4 px. Titles on hover, each level with where its section starts.
- **Motion.** Segment on the frame; the line's wake in 120 ms, its rest in 480 ms.
- **Why.** The most minimal, the closest to iOS; honest proportional thumb. **Cost:** sections become
  invisible until hover; it is close to the bar the owner just rejected (minus its ticks), so it risks
  reading as "the same, thinner".

### C · Scale

- **Geometry.** 1 px ticks every 6 px, 4 px long (3 px on touch), right-aligned on the axis; a 16 × 2 px
  needle (10 px on touch) in the accent where you are; ticks within a Gaussian lens (11 px radius) lengthen
  up to 13 px (9 px on touch) and take the accent's light. A section's first tick is 8 px (6 px on touch),
  in its light behind you and its accent when current.
- **States.** Ticks rest faint and wake as in B; hover brightens the needle; titles on hover.
- **Motion.** The lens is continuous: it glides between ticks as the page moves, like a loupe over a
  ruler. Nothing is eased.
- **Why.** The owner's ladder with the "current one longer", made precise; technical, instrument-like.
  **Cost:** the busiest of the four (about 50 ticks); at a glance it is texture, not a shape.

### D · Segments

- **Geometry.** The 2 px line broken into one segment per section, each as long as its section's stretch
  of scrolling (at least 8 px, 4 px gaps). Behind you a segment is full in its section's light; the current
  one fills with its accent to where you are; ahead they rest faint. A page without sections is one segment
  (a vertical reading progress).
- **States.** Faint parts wake while moving; hover and drag widen segments to 4 px; titles on hover, each
  level with its segment's start.
- **Motion.** Fills follow the scroll on the frame.
- **Why.** Proportional and sectioned in one line, no extra marks. **Cost:** a progress bar rather than a
  position; on a phone the gaps between short sections are small.

## 4. Recommendation

**A, Beads.** The owner drew it and marked it with a tick; the ladder (C) was the one with a question
mark. It is the simplest shape that still carries the site's sections (the record of continuous work is
organised by sections and years), and its single moment of motion is the kind the brief asks for: quiet,
caused by the reader, premium in its detail. B is the fallback if the owner wants the platform-like
minimum; C and D are there to show the range.

Try it: any page with `?rail=b` (or `a`, `c`, `d`) switches the look for the tab, and four small links in
the bottom-left corner switch between them. The switch is temporary and goes when the owner chooses.

## 5. What was measured (M)

Screenshots and frame sequences of all four at 1440 × 900, 1180 × 820 touch and 390 × 844 on Home, About,
an essay entry and the project sheet (desktop sheet; the project page on phones) are in the session
scratchpad (`scratchpad/rail4/`, not kept). `tests/e2e/rail.spec.ts` runs each look's drag, Escape and
"same rail everywhere" checks, and the "no native bar anywhere" audit on ten routes and the sheet.

## 6. Not verified

- A real iPhone and real Windows: as in ADR-0013, from WebKit's source and Chromium with classic bars.
- The look on the owner's phone in daylight: the fills' and dots' sizes were chosen on screenshots at 2×.

Sources (search extracts): [Eric Bailey, "Don't use custom CSS scrollbars"](https://ericwbailey.website/published/dont-use-custom-css-scrollbars/);
[Jim Nielsen's notes on it](https://notes.jim-nielsen.com/n/2023-05-15-0834);
[csswg-drafts #13218, scrollbar-style for overlay scrollbars](https://lists.w3.org/Archives/Public/public-css-archive/2025Dec/0298.html);
[UIScrollView reference (indicator shows while tracking, fades after)](https://docs.creolabs.com/classes/UIScrollView.html);
[Apple Developer Forums on indicator customisation](https://developer.apple.com/forums/thread/719910).
