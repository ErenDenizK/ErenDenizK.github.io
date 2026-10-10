# ADR-0013: One rail on every page and in the project sheet; the bar never moves

**Status:** asked for by the owner (brief, "Look, motion and objects", 2026-10-10: "one consistent
custom scrollbar on every page and in the project sheet"; on iPhone "only the custom one should show");
technique decided by the agent (CLAUDE.md); the look of the plain variant (item 2) is proposed until the
owner has seen it · **Supersedes** ADR-0011 items 3 (the project-page exception), 5, 7 and 11 and its
"Not done, on purpose"; everything else in ADR-0011 stands · **Rests on:** ADR-0011,
`docs/research/2026-10-site-audit.md` §2 (scrollbar map, B6, B7, B8, B11, B12, B13), §7 (the clock),
`docs/PLAN.md` tracks 3 and 4, ADR-0007 (the sheet; cross-document view transitions)

**Amendment 2026-10-10 (later): one look, not two.** The owner on a phone: "Does each page have its own
different scrollbar? One is a line, another is a ladder?" Verified at 390 × 844: Home and the Record drew
the plain variant (a vertical line with a thumb) and About the ladder (three short floating dashes at a
different place). Item 2's "two variants of one rail" were two different objects; the owner wants one fixed,
consistent scrollbar everywhere. Revised (technique decided by the agent; the look is proposed until the
owner has seen it):

- **One bar.** Every scroller that overflows draws the same thing on desktop, tablet and phone, on the page
  and in the sheet: a 2 px track, 6 px from the right edge (of the window, or of the sheet), `--rail-h` =
  `min(44vh, 320px)` tall at mid-height, quiet (`--rail-idle` at 45 %), with a thumb on it that is the share
  in view (at least 24 px), in the accent. On touch the 6 px place sits inside the 16 px gutter (inset by
  the safe area). The ladder's own column of dashes, its stacking 28 px apart and its per-section dash
  lengths (ADR-0011 items 1 and 2, the dash parts) are gone.
- **Sections add marks, never another object.** A tick on the track's left side per section (5 px; the
  current one 8 px; 2 px tall), placed where the thumb's top is when that section begins, so the thumb
  reaches a mark as its section starts. The ticks behind you keep their section's light at the solved
  rest value (ADR-0011 item 10), the current one is its full accent, the ones ahead `--rail-idle`, and the
  thumb takes the current section's accent. On desktop, hover (120 ms) or focus opens the titles in a
  panel beside the track, each row level with its mark (pushed apart to 28 px where marks crowd, at most
  half a row past the track's ends), with the same last line; a title goes to its section; the nav, its
  links, `aria-current` and the arrow keys are ADR-0011 item 9 unchanged. On touch the bar with marks is
  one 44 px button over the track and a tap opens the titles as the small sheet of ADR-0011 item 12.
- **One behaviour.** With or without marks, a press on the thumb holds it where it was taken and a drag
  follows the pointer in proportion, a press on the track goes there (smooth, instant under reduced
  motion), Escape during a drag puts the page back. The ladder's section-by-section scrub is replaced by
  this proportional drag; a drag that starts on a title scrubs the same way.
- **When titles show.** A scroller with two or more sections shows marks and titles when they fit beside
  the track (sections × 28 px ≤ `--rail-h`, on touch sections × 8 px) and more than a quarter of a window
  scrolls; otherwise it draws the bar alone and its own contents list comes back (`.rail-flat`), as before.
- The touch button now covers a 44 × `--rail-h` strip of the right edge at mid-height (it was
  44 × (sections × 10 + 28) px): a link reaching into that strip there is the known cost, as in ADR-0011
  item 12. Reduced motion: the thumb and the current mark do not grow, only brighten.
  `tests/e2e/rail.spec.ts` asserts the same track size, place, colour and thumb on About, Home and in the
  sheet, at 1440 × 900 and 390 × 844.

## Context

ADR-0011 put the contents ladder only on pages with sections and kept the native bar everywhere else
(Home, project pages, the Record with one year, year pages, notes, the lab, 404) and in the sheet's
scroller, which showed a thin native bar. Three consequences the owner and the audit found: two kinds of
scrollbar on one site (B8); the bar and every centred element jumping 15 px sideways between a ladder page
and a native-bar page wherever scrollbars take space (Windows, Linux, macOS "Always"), animated by the
bar's view transition (B6); and on iOS 18.2+, where a ladder page turns Safari's indicator off for the rest
of the tab (ADR-0011 item 13), every later page without a ladder had no indicator at all.

## Decision

1. **Every page has the rail.** The head script (`layouts/Base.astro`) sets `html.rail-on` (fine pointer)
   or `html.rail-touch` (any other pointer) on every page before first paint, unless forced colours are
   active. There is no opt-in any more: the `rail` prop and `data-rail` are gone. Sections stay data in the
   markup (ADR-0011 item 4), so whether a page gets rungs is decided by its content, never by code.
2. **Two variants of one rail** (`scripts/rail.ts`, `createRail`). A scroller with two or more sections whose
   ladder fits (ADR-0011 items 1, 2 and 5's height rule: sections × 28 px + 160 px, on touch sections × 10 +
   28 + 160 px, and more than a quarter of a window to scroll) gets the **ladder**: the rungs, exactly as
   ADR-0011 defines them. Any other scroller that overflows gets the **plain variant**: the same column
   (44 px wide at mid-height on the right edge) with a 2 px track ending where the dashes end and no rungs;
   the track is `--rail-idle` at 45 % (decorative), the thumb is the page accent (every accent is at least
   5.5:1 on the ground, 1.4.11), `min(44vh, 320px)` long in all, the thumb the share of the page in view
   (at least 24 px). A scroller that does not overflow draws nothing, and still has no native bar. Today the
   plain variant is on Home, the Record while it has one year, the year archive, notes and entries without
   h2s, and the lab page; the 404 page does not scroll at 1440 × 900.
   - *Desktop:* a press on the thumb holds it where it was taken and a drag follows the pointer in
     proportion (instant writes, as ADR-0011 item 6); a press on the track goes there (smooth, instant under
     reduced motion) and a drag continues from there; Escape during a drag puts the page back. Hover and
     dragging thicken the thumb to 4 px; under reduced motion it only brightens. The wheel over it scrolls
     the page natively (the column is not a scroller).
   - *Like the native bar it replaces*, the plain variant is not in the tab order and is `aria-hidden`: it
     carries no information the page does not, and the keyboard (arrows, Page keys, Space, Home, End)
     scrolls the page itself.
   - *Touch:* drawn inside the right gutter (2 px, 4 px from the edge, inset by the safe area) and never
     takes the pointer (ADR-0011 item 12: no drag on touch); scrolling is the platform's.
3. **Project pages and the sheet get the ladder; their contents list becomes the rungs.** A project's porch
   (`.case-top`, labelled with the project's name) and each written section are `[data-rail-sec]` in
   `components/ProjectCase.astro`, coloured by the project's accent. Where the ladder is drawn the case's
   sticky `.toc` is hidden and the body takes one column (the same one-source-of-truth rule as the essay
   list, ADR-0011 item 3); with no JavaScript, in forced colours, or when the scroller falls back to the
   plain variant (`.rail-flat` on `html`, or on the sheet's `.sheet`), the `.toc` is back.
   - *The sheet* (`scripts/sheet.ts`) builds its own rail bound to `.sheet-scroll` every time it is filled
     (opening, or stepping to the next project), measures it once the dialog is shown, and removes it on
     close. It sits in `.sheet`, at the sheet's right edge beside the scroller, because the page under a
     modal dialog is inert. The page's rail is hidden while the sheet is open. Going to a section keeps the
     sheet's own bar clear (its height + 16 px). The wheel over the sheet's rail is handed to the sheet's
     scroller (the rail is beside it, not in it, so the wheel would otherwise reach the locked page).
   - Only the page's rail carries `view-transition-name: rail`; the sheet's rail has none, so the sheet's
     same-document view transition never meets the name twice.
4. **The native bar stays only for forced colours and no JavaScript**, on every page alike. Its
   `scrollbar-width: none` (and `::-webkit-scrollbar` for other engines) sits behind the same media
   conditions as ADR-0011 item 7, for the root and for `.sheet-scroll`.
5. **The bar never moves between pages.** With the native bar hidden on every page from first paint, every
   page has the full window width, so the bar, the tab pill and GitHub sit at the same x everywhere (the
   pill measured at 554 px on every route at 1440, classic scrollbars). `scrollbar-gutter: stable` stays on
   `html` for no JavaScript and forced colours, where every page has the native bar and the gutter is
   likewise the same everywhere. ADR-0011 item 7's "one-time shift on a page that barely scrolls" is gone:
   a short page now keeps the classes and draws the plain variant or nothing.
6. **iOS Safari, consistently** (ADR-0011 item 13 stands). Because every page sets the root's
   `scrollbar-width: none` before first paint, the indicator is off on every page of the tab, not only after
   a ladder page; and because every page that scrolls now draws a rail (the plain variant when it has no
   rungs or they do not fit), no page is left without an indicator. Before iOS 18.2 the platform indicator
   still shows beside the rail, as before.
7. **Unchanged from ADR-0011:** native scrolling untouched (item 6), still twins and reduced motion (item 8),
   keyboard and screen readers for the ladder (item 9), contrast and targets (item 10), the touch ladder and
   its sheet (item 12).

### Alongside: the band under the bar, and Istanbul's time

8. **A quiet band under the bar** (audit B7, B11). Text scrolling under the transparent bar collided with
   the mark, the tabs and GitHub. `.bar::after` lays the ground (96 % at the top, 92 % down to the pill's
   lower edge, then a fade over the last third of `--bar-h` + 32 px) under the bar once the page has moved
   (`html.scrolled`, set by `scripts/site.ts` past 4 px), while the sheet is open, and always without
   JavaScript. At the top of a page it is not drawn, so About's photograph keeps its light. The sheet's own
   bar is 95 % ground plus its blur, so the case no longer shows through it.
9. **"Istanbul HH:MM" in the bar** (track 4; prototype E's place: the right of the bar, before GitHub). The
   time is Istanbul's own (`Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle:
   'h23', timeZone: 'Europe/Istanbul' })`), 15 px Inter, the place in `--ink-3` and the digits in `--ink-2`,
   tabular figures. A small inline script right after the element writes the first value while the bar is
   parsed, so the first paint already has it and nothing moves; `scripts/clock.ts` keeps it on the minute
   and catches up when the tab returns. Without JavaScript only "Istanbul" shows (an empty `<time>` is not
   drawn): a build-time time would be wrong. Screen readers hear "Local time in Istanbul 14:05"; it is not a
   live region. Phones (below 900 px) hide it with the rest of the bar's right end: the bar holds the mark
   and four tabs and nothing more fits without crowding. At 900 px it keeps 54 px clear of the pill.

## Tests

`tests/e2e/rail.spec.ts` (classic scrollbars): the rungs on Work, About and a project page with its `.toc`
hidden; every route with the ladder or the plain variant, no native bar and no sideways overflow; the plain
thumb following the page, its drag, Escape and a track press; the mark, the pill and GitHub at the same x
and the same client width on every route; the sheet's own ladder (its sections, no native bar or `.toc`,
the wheel over it scrolling the sheet, a rung going to its section, the page's rail back on close) on
desktop and as the slim ladder on touch; the clock's format, Istanbul's time from a browser in another
zone, its place before GitHub, tabular figures, no placeholder ever written, "Istanbul" alone without
JavaScript and hidden on phones. ADR-0011's tests stand.

## Not verified

- A real iPhone (the indicator off on every page, from WebKit's source as in ADR-0011 item 13) and real
  Windows scrollbars (the width checks run in Chromium with classic scrollbars on Linux).
