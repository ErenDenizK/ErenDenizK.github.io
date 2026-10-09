# ADR-0010: Work is one screen-tall section per project, with one stage each and only the one in view moving

**Status:** technique decided by the agent (CLAUDE.md: "decide technique yourself and record it");
the look is proposed until the owner has seen it · **Rests on:** brief §7 (2026-10-09 after v0:
"Work should be a page that grows downward, each project starting within its own screen height,
with large objects (small objects packed together looked bad)"; "Home is a showcase; Work is the
full catalog"), ADR-0006 (pre-rendered objects, at most one video), ADR-0007 (routing, the droplet,
the focus view), `docs/design/family.md` §3.1 (the porch)

## Decision

1. **Structure.** A short intro states the role once (the old Role column is gone), then each
   project is an `article.w-proj`: `min-height: calc(100svh - bar)`, content-driven so nothing
   clips. The object is large (up to 640 px, capped by the window height) and the sides alternate.
   Each section holds the porch of family.md §3.1 (object, title, summary, what, labelled facts,
   one way in, links out), so a threshold and an embassy can later grow under it. Groups follow
   the two kinds of work; "By hand" shows only when it has entries, in a lighter variant.
2. **No scroll snapping.** `scroll-snap-type: y proximity` was considered and left out. Chrome's
   proximity range re-targets the end of trackpad momentum, keyboard paging and programmatic
   scrolls (Back restoring a position, anchors), which the native-feel rule forbids. Sections
   already start one screen apart because each is one screen tall.
3. **One stage per section, one in motion.** Each section has its own `Media` slot marked
   `data-solo`. `scripts/site.ts` treats the section crossing the middle of the window as the one in
   view. Its slot gets `MediaStage.focus()` and becomes the only one past its poster (idle loop, lean,
   interaction clip). Every other solo slot keeps its still and gives back its videos and decoded
   lean frames straight away (`shed`). The same happens when a solo slot leaves the screen. Posters
   load lazily, except the first, which has high priority. At most one video plays (the stage's
   existing rule).
4. **The stage moves.** The `.stage` class carries the view-transition name, which has to be unique,
   and it marks the object that melts on a tab change. It moves to the section in view, so the
   droplet starts from the object the reader is looking at. When the page arrives by droplet, the
   solo slot nearest the middle of the window takes it.
5. **The accent follows the section in view**, through `setAccent`. Above the first section it
   stays Work's own neutral.

## Consequences

- Three large posters replace one large and three small. Only the first is fetched up front, and
  only one object moves at a time.
- Tests: S16 now checks this rule. A fast scroll swaps no objects, at most one video plays, only the
  section in view holds decoders, there is exactly one stage, and the accent matches.
