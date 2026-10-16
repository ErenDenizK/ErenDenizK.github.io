# ADR-0017: One scroll source and one clock on Home; the wheel is smoothed on desktop

**Status:** accepted (technique), 2026-10-16. Lab page `/lab/one/` only. The lead adds the row to
`docs/adr/README.md` when the lanes merge (the number may move if another lane took 0017).

## Context

The owner's review of 2026-10-16 (rows M1, M2, G6) says the lab Home catches while scrolling and does
not feel "oiled", "as on a pond". The round-two motion audit measured four causes: a pinned deck with
dead scroll, timed swaps, a root-wide style recalculation per frame, and stepped wheel input (100 px
jumps per notch). Round one §7.1 and §8.1 said "no smooth-scroll library". Spec v2 §7 rule 1 asks for
wheel smoothing on desktop (Lenis, or an own lerp as the fallback) and rule 2 for one clock.

## Decision

1. `src/one/scripts/ticker.ts` is the page's one scroll source and one clock. Every scroll-linked value
   on Home subscribes to its frame (position, smoothed velocity, view size). No other scroll-linked
   requestAnimationFrame loop exists. It sleeps when the page and the velocity are still.
2. On desktop (fine pointer, motion welcome) the wheel is smoothed by an own lerp of 0.1 per 60 Hz frame
   (`k = 1 - 0.9^(dt / 16.67)`), written with `scrollTo`. It is about 60 lines and needs no
   dependency, so Lenis is not added. Reason: the behaviour is the same (Lenis moves the real scroll
   position the same way), the project adds no runtime dependency for what fits in one file, and the
   own code knows our inner scrollers and the layer.
3. The wheel stays native when it falls on an inner scroller that can still scroll that way, with Ctrl
   (zoom), when it is mostly horizontal, and on touch (native momentum).
4. An opened project (the layer) gets its own smoother on the same clock. The page's subscribers and
   smoothing pause while the layer is open and before a view transition starts (spec v2 rule 17).
5. Velocity: a raw value clamped to 4000 px/s, and a jump of more than 40 % of a view in one frame (a
   key, an anchor, the rail) counts as no speed, so a jump never skews the frames.
6. Reduced motion and `?still`: no smoothing and no loop. Subscribers are called once on load and on
   resize.

## Consequences

- Back, anchors, the keyboard, find-in-page and the rail still meet a real scroll position, because the
  smoothing writes the real position. The reasons of round one §7.1 hold.
- Every scroll-linked scene can be a pure function of position and velocity (spec v2 rule 5). Work's
  flight (`src/one/work/scripts/flight.ts`) and the CSS scrub fallback (`scrub.ts`) use it now; the
  other lanes subscribe with `onFrame`.
- The smoothing must be confirmed on the owner's own hardware; headless numbers come from a software
  rasteriser.
