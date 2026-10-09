# ADR-0011: The contents ladder replaces the native scrollbar where a page has sections

**Status:** look chosen by the owner (brief §7, 2026-10-09 late: "Scroll rail: concept B, the
contents ladder"); technique decided by the agent (CLAUDE.md) · **Rests on:** brief §7
(2026-10-09: "a custom thin rail, newly designed (not a copy of English Prep's)"),
`docs/research/2026-10-scroll-rail.md` (§2 rules, §4 B and its weaknesses, §5 checks), ADR-0002
(content is data; pages complete without JavaScript)

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
   where that list never showed, the rail is now the only contents list. With no JavaScript, on touch
   and in forced colours, the page's own list is back. Project pages keep their sticky `.toc` and get no
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
   `forced-colors: active`. The CSS that hides the bar (`scrollbar-width: none`, `::-webkit-scrollbar`)
   sits inside a media query that repeats both conditions, so forced colours bring the bar back even
   if the class stayed. If the script then finds the page too short, it removes the class. This is a
   one-time shift, and only on a page that barely scrolls.
8. **Still twins.** No JavaScript: no class, no rail, the native bar and the essay's own list. Touch and
   phones: the native indicator, and no rail element at all. Forced colours: as no JavaScript. Reduced
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

## Tests

`tests/e2e/rail.spec.ts` runs with classic scrollbars (`--hide-scrollbars` dropped), so a bar that
appeared and went would show up as a width change. It checks: the sections on Work and About;
unmarked and short pages keeping the native bar; a constant client width during load; the wheel over
the rail and End scrolling natively; 3:1 for every dash colour; the keyboard reaching the list with a
solid 2 px ring at least 24 px tall; Enter jumping instantly under reduced motion and moving focus;
a click going to its section; a drag landing mid-section on each dash and Escape restoring the
position; and forced colours, no JavaScript, tablet touch and phone keeping the platform's bar with
nothing sideways. `fixtures.spec.ts` covers the essay: the rail replacing the list, "min left", and
the list coming back without JavaScript.

## Not done, on purpose

- The focus sheet's own scroller keeps its thin native bar: a ladder of the sheet's sections would
  repeat its sticky `.toc` (the same duplication as item 3).
- The Record year archive pages get no rail: a year is one section.
