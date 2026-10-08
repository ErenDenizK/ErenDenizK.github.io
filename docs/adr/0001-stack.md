# ADR-0001: Astro static site, vanilla Three.js island, GitHub Pages

**Status:** proposed 2026-10-08 · **Rests on:** brief §2.3, §3, §4.3, §5;
`research/2026-10-stack.md`

## Context

A four-year site that grows by small additions, built by agents for an owner who does not
write code. It needs a dated log written from dictation, English with an optional Turkish
locale, an ambitious 3D layer on desktop and a light one on phones, free static hosting.

## Decision

1. **Astro** (7.x), static output. Log entries and project case studies are content
   collections (Markdown/MDX with typed frontmatter), so adding an entry never touches code.
   Built-in i18n (`/` English, `/tr/` later), RSS and sitemap.
2. **Three.js** (vanilla, `WebGPURenderer` + TSL with WebGL 2 fallback) for the world, loaded
   as a separate chunk after a capability gate. No React in the 3D layer.
3. **Motion:** CSS, scroll-driven animations and View Transitions first; GSAP only where a
   timeline is needed. Everything collapses under reduced motion.
4. **Assets in code:** procedural geometry, shaders, SVG components; headless Blender scripts
   if models are needed. Scripts are committed, generated files are reproducible.
5. **Hosting:** GitHub Pages via Actions, at `erendenizk.github.io` (requires the repo name
   `ErenDenizK.github.io` and a public repo or a paid plan).
6. **Gates in CI:** typecheck, build, Playwright screenshots at desktop/tablet/phone,
   axe, Lighthouse, size budget, link check.

## Consequences

Content pages ship near-zero JavaScript. The 3D world can be rewritten without touching
content, which matters if the site is rebuilt in year four. Astro majors arrive roughly
twice a year; versions are pinned and upgraded deliberately.
