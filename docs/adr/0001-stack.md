# ADR-0001: Astro static site on GitHub Pages

**Status:** accepted 2026-10-09 (item 2 amended the same day after ADR-0006; items 6 and 7 amended 2026-10-10) · **Rests on:** brief §2.3, §3, §4.3, §5;
`research/2026-10-stack.md`

## Context

A four-year site that grows by small additions, built by agents for an owner who does not
write code. It needs a dated log written from dictation, English with an optional Turkish
locale, an ambitious 3D layer on desktop and a light one on phones, free static hosting.

## Decision

1. **Astro** (7.x), static output. Log entries and project case studies are content
   collections (Markdown/MDX with typed frontmatter), so adding an entry never touches code.
   Built-in i18n (`/` English, `/tr/` later), RSS and sitemap.
2. **Objects are media, not a renderer** (ADR-0006): pre-rendered Cycles stills and video
   in a small media stage. No three.js and no framework runtime on the main path. Three.js
   stays available for later experiments as a separate, capability-gated chunk.
3. **Motion:** CSS, scroll-driven animations and View Transitions first; GSAP only where a
   timeline is needed. Everything collapses under reduced motion.
4. **Assets in code:** procedural geometry, shaders, SVG components; headless Blender scripts
   if models are needed. Scripts are committed, generated files are reproducible.
5. **Hosting:** GitHub Pages via Actions, at `erendenizk.github.io` (requires the repo name
   `ErenDenizK.github.io` and a public repo or a paid plan).
6. **Gates in CI:** typecheck, build, Playwright screenshots at desktop/tablet/phone,
   axe, Lighthouse, size budget, link check.
   *Amended 2026-10-10:* CI (`.github/workflows/ci.yml`) runs the type and schema check, the test
   builds, the size budget and Playwright (navigation, axe, screenshots). Lighthouse and the link
   check are not built.

7. **Release:** the site deploys from `main` only, which the owner merges by hand
   (ADR-0004). An early v0 goes live once the content site works at prototype F's level; the
   repo is renamed `ErenDenizK.github.io` just before that first release. Until then the
   build takes its base path from configuration.
   *Amended 2026-10-10:* superseded by the ADR-0004 amendment: the owner publishes from `dev`
   during the build-up, and `main` is still the initial commit. The repo is already renamed
   `ErenDenizK.github.io` and public, so the live base path is `/`.

## Consequences

Content pages ship near-zero JavaScript. The object layer can be rewritten without touching
content, which matters if the site is rebuilt in year four. Astro majors arrive roughly
twice a year; versions are pinned and upgraded deliberately.
