# ADR-0002: The HTML content layer is the site; the world enhances it

**Status:** proposed 2026-10-08 · **Rests on:** brief §2.1, §4, §5;
`research/2026-10-references.md`

## Context

The owner wants an explorable world, yet the site's first job is presentation to people who
may give it one minute, on any device. Worlds rendered only in WebGL are slow to load, weak
on phones, invisible to search and hard to use with a keyboard or screen reader.

## Decision

1. Every project, log entry and the About exist as real HTML pages with their own URL, and
   work without JavaScript or WebGL.
2. The world (whichever concept is chosen) is a layer over the same data: it reads the same
   collections and opens the same content in panels. It never holds content of its own.
3. Desktop gets the open, explorable version; phones get a fixed, lighter one; reduced
   motion, Save-Data and missing WebGL get a still poster.
4. The concept is chosen from working prototypes, not descriptions (brief §5).

## Consequences

The site is useful from the first release even before the world exists, and the world can be
replaced without losing content or links.
