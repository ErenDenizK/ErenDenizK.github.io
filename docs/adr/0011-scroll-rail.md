# ADR-0011: The contents ladder replaces the native scrollbar where a page has sections

**Status:** look chosen by the owner (brief §7, 2026-10-09 late: "Scroll rail: concept B, the
contents ladder"); technique decided by the agent (CLAUDE.md); the touch variant (item 12) added 2026-10-10 at the
owner's request (brief §7, "phone check": "bring the ladder to phones too") · **Rests on:** brief §7
(2026-10-09: "a custom thin rail, newly designed (not a copy of English Prep's)"),
`docs/research/2026-10-scroll-rail.md` (§2 rules, §4 B and its weaknesses, §5 checks), ADR-0002
(content is data; pages complete without JavaScript)

**Note 2026-10-10:** the owner wants one consistent custom scrollbar on every page, including the
project sheet; some pages still show the native bar (brief, "Look, motion and objects"). That
contradicts this ADR's no-rail cases (pages without sections, short pages, the sheet, year pages).
A revision follows (`docs/PLAN.md` track 3); until it lands, this ADR describes what is built.

**Amendment 2026-10-10 (later):** revised by [ADR-0013](0013-one-rail-everywhere.md): the rail is on every
page and in the project sheet (the ladder where there are sections, a plain track and thumb elsewhere),
project pages and the sheet get the ladder in place of their `.toc`, and the native bar stays only for
forced colours and no JavaScript. Items 3 (the project-page exception), 5, 7 and 11 and "Not done, on
purpose" are superseded; the rest stands.

## Decision

1. **What it is.** One dash per section, stacked 28 px apart at mid-height on the right edge. The
   current dash is the longest (28 px) and fills from the edge as you read through its section. The
   dashes behind you stay lit in their own section's colour, and the ones ahead are quiet. Hover (after
   a 120 ms intent delay) or keyboard focus opens a panel of section titles beside the dashes, with
   one line under them. Clicking a dash or a title goes to that section. Dragging along the dashes
   scrubs the page section by section: the pointer's place between two dashes maps to the same share
   of that section.
2. **Answering "how much is left"** (research §4 B, weakness 1), without becoming a scrollbar
   again. Each dash's resting length (8–20 px) is its section's share of the page. The fill shows how
   far you are within the current section, and the lit dashes show how much is behind you. The panel's
   last line says "About N min left" on essays (from the reading time) and "N% down the page" elsewhere.
3. **One source of truth on essays** (weakness 2). Wherever the rail is on, it *is* the contents list:
   the essay's own left-hand list (`.post-toc ol`) is hidden and the back link stays. Below 1240 px,
   where that list never showed, the rail is now the only contents list (on touch too, item 12). With no
   JavaScript and in forced colours, the page's own list is back. Project pages keep their sticky `.toc` and get no
   rail, for the same reason.
4. **Sections are data.** A page opts in at build time (`<Base rail>` → `<html data-rail>`) and marks
   its sections: `[data-rail-sec]` (label, or the element's text) and the `h2[id]` inside
   `[data-rail-heads]`. `[data-rail-accent]` gives the colour, which is inherited by closest ancestor;
   the page accent is the fallback. Work: the intro plus one per project in its accent colour. Essays:
   the head plus each h2. About: introduction, the two tracks, the colophon. Record: one per year,
   only once there are two years. A new project, heading or year needs no code (ADR-0002).
5. **Silence.** No rail with fewer than two sections, with overflow under a quarter of the window,
   or when the ladder would not fit the window's height (sections × 28 px + 160 px). The native bar
   then comes back.
6. **Native scrolling untouched** (research §2). The rail reads `scrollY` (one passive listener and
   one rAF write) and writes it only while dragged (`scrollTo(…, 'instant')`). Escape during a drag
   puts the page back. Wheel, momentum, keys, find and anchors stay the browser's own.
7. **Hiding the bar without a shift.** The head script adds `html.rail-on` before first paint, only
   on a page with `data-rail` and only for `(hover: hover) and (pointer: fine)` without
   `forced-colors: active` (any other pointer gets `html.rail-touch`, item 12, also before first paint). The CSS that hides the bar (`scrollbar-width: none`, `::-webkit-scrollbar`)
   sits inside a media query that repeats both conditions, so forced colours bring the bar back even
   if the class stayed. If the script then finds the page too short, it removes the class. This is a
   one-time shift, and only on a page that barely scrolls.
8. **Still twins.** No JavaScript: no class, no rail, the native bar and the essay's own list. Touch and
   phones: the slim ladder of item 12 in place of the platform's indicator. Forced colours: as no JavaScript,
   on every device. Reduced
   motion: section jumps are instant. The panel cross-fades instead of being revealed, and the dashes
   change only colour, never width.
9. **Keyboard and screen readers.** The rail is a `nav` labelled "On this page", placed before `main`
   (where the essay's list was), with one real link per section. `aria-current="location"` marks the
   current one. Focus opens the panel, so the 2 px focus ring (inset, never clipped by the window
   edge) sits on a visible title. Up/Down/Home/End move between the links. Enter goes to the section
   and moves focus there. The panel's last line is `aria-hidden` (it changes as you scroll).
10. **Contrast (1.4.11) and targets (2.5.8).** Quiet dashes are `--rail-idle` `#6a665f`, 3.5:1 on
    the ground. Current dashes use the full accent: every accent is at least 5.5:1, the Eat Map rose
    included. A lit dash behind you keeps its accent's hue and chroma and lowers only its OKLab
    lightness, down to 4.5:1. So the rose keeps nearly all of itself and the lime steps further down,
    which is the "brighter rest value" the research asked for, solved per accent at run time rather
    than kept in a table. A hairline of ground around each dash keeps it legible over the About
    photograph. Each row is a 28 px link, and the column takes the pointer 44 px wide.
11. **Hidden while the project sheet is open** (`html.sheet-open`). The rail carries its own
    view-transition name, so it stays in place across tab changes.

12. **Touch: the slim ladder** (phones and tablets, any pointer without hover). The head script sets
    `html.rail-touch` instead of `rail-on`. Scrolling stays the page's own (momentum, the collapsing address
    bar, pull to refresh, find, scroll restoration and every native gesture), but the platform's scroll
    indicator is hidden the same way as on desktop (2026-10-10, owner on an iPhone: Safari's indicator drew
    over the ladder at the right edge; "only the custom ladder should remain"). See item 13 for what iOS
    honours. Closed, the ladder is one 44 px wide button at mid-height on the right
    edge (inset by `env(safe-area-inset-right)`), drawing one short dash per section: 4–10 px by the
    section's share of the page, the current one 12 px and filling, the ones behind lit as on desktop. The
    dashes sit inside the 16 px page gutter, so nothing covers the reading column, and `touch-action: pan-y`
    lets a swipe that starts on the button scroll the page. Its label names the current section ("On this
    page: Recto, 2 of 4"). A tap opens the titles as a small sheet beside it (44 px rows, the current one
    marked by its accent, the same last line as item 2); a title goes to its section and closes the sheet,
    as do a tap outside, Escape and the button again. No hover and no drag on touch: a lifted finger's
    `pointerleave` is ignored. The silence rules of item 5 hold, but the height check counts the closed
    ladder (sections × 10 + 28 px), and the open sheet scrolls itself when a phone on its side is shorter
    than its rows: on iOS the ladder must not disappear after the indicator has been hidden (item 13).
    The button covers a 44 × (sections × 10 + 28) px strip of the right edge at mid-height; a link that
    reaches into that strip there is the known cost.

13. **What iOS Safari honours for the page's own scroller** (researched 2026-10-10). The root scroller is a
    UIKit scroll view in the browser process, and WebKit turns its indicators off only from the root
    element's `scrollbar-width: none` (`WKWebViewIOS.mm`, `_updateScrollViewForTransaction`, reading
    `LocalFrameView::scrollbarWidthStyle()`, which takes the document element's style). This shipped with
    "Implement scrollbar-width for iOS" (WebKit bug 277167, landed 1 August 2024) and Safari 18.2, which
    added `scrollbar-width`; the code is unchanged in WebKit as of October 2026 (the Safari 26 line, read
    from source, not tested on a device). `::-webkit-scrollbar { display: none }` hides
    overflow scrollers on iOS but never the root (bug 236586, still open), so it stays only for other
    engines. On iOS before 18.2 the indicator still shows and can overlap the ladder; there is no
    supported switch there. Two consequences, both from the same WebKit code: the indicator is turned off
    once and, as the code reads, never turned back on for that tab, even on a later page without a rail
    or after the class goes (to confirm on the owner's iPhone; hence the height rule in item 12); and the class must be on `html`, not `body`. Moving the page's
    scrolling into a container element (the other way to hide the indicator) was rejected: the address
    bar, pull to refresh, scroll restoration, the status-bar tap to the top, find in page, anchors and the
    cross-document view transitions all assume the root scroller, and the rail itself reads `scrollY`.

## Tests

`tests/e2e/rail.spec.ts` runs with classic scrollbars (`--hide-scrollbars` dropped), so a bar that
appeared and went would show up as a width change. It checks: the sections on Work and About;
unmarked and short pages keeping the native bar; a constant client width during load; the wheel over
the rail and End scrolling natively; 3:1 for every dash colour; the keyboard reaching the list with a
solid 2 px ring at least 24 px tall; Enter jumping instantly under reduced motion and moving focus;
a click going to its section; a drag landing mid-section on each dash and Escape restoring the
position; forced colours and no JavaScript keeping the platform's bar, on desktop and on a phone; and on
tablet and phone touch: the platform's indicator hidden through the root's `scrollbar-width` from
before first paint (a constant client width with classic bars) and the ladder kept on a phone turned on
its side, with its sheet inside the window, the ladder drawn as a 44 px button flush with the
edge, its dashes inside the gutter, the last dash current at the end of the page, a tap opening the
sheet (which stays open after the finger lifts) with 44 px rows, a title going to its section and
closing it, and a tap outside closing it; nothing sideways. `fixtures.spec.ts` covers the essay: the rail replacing the list, "min left", and
the list coming back without JavaScript.

## Not done, on purpose

- The focus sheet's own scroller keeps its thin native bar: a ladder of the sheet's sections would
  repeat its sticky `.toc` (the same duplication as item 3).
- The Record year archive pages get no rail: a year is one section.
