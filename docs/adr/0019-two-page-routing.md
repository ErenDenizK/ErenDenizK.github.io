# ADR-0019: Two pages, Home and the Record; a project opens over Home and keeps its own address

**Status:** accepted (technique), 2026-10-17. It replaces ADR-0007 (every tab a page, the project
sheet). The owner moved the site to two pages on 2026-10-15 and, on 2026-10-17, asked to drop the
four-page version and treat the new Home as the product (review row S38). · **Rests on:** brief log
2026-10-15 (late night) and 2026-10-17; ADR-0002 (content is HTML); ADR-0013 (one rail); ADR-0017 (one
scroll source); `docs/design/one-spec.md` §3, §7; `docs/design/record-language.md` §4.5, §5, §6.

## Context

ADR-0007 gave the live site four tab pages (`/`, `/work/`, `/record/`, `/about/`), a page per project
(`/work/<slug>/`) and a scripted sheet that showed a project over Work or Home. The two-page direction
replaces the tabs with Home and the Record and opens a project inside Home, in the same UI, with no
sheet, dialog or new window. The new Home was built on the hidden lab page `/lab/one/`; its projects
opened at `/lab/one/work/<slug>/`. Three things had to be decided when it became the site:

1. which addresses are pages, which are redirects, and which are canonical;
2. how the retired addresses keep working on GitHub Pages, which has no server redirects;
3. how the Record moves onto the new token set without losing what the owner loves.

## Decision

1. **Two pages, two tabs.** Home is the site root `/`; the Record is `/record/`. The bar's pill holds
   the two tabs. The change between them is a cross-document view transition (`@view-transition {
   navigation: auto }`, `src/one/base.css`); the bar, the mark's dot and the tab bed keep their names
   (`bar`, `mark-dot`, `tab-ind`) and travel across the change.
2. **A project opens over Home and has its own address.** On Home, Work opens a project as a layer over
   the page (`src/one/work/scripts/open.ts`) and the address bar shows `/work/<slug>/` (one history
   step; Close and Back return to Home's `#<slug>`). A direct visit, a reload or a shared link to
   `/work/<slug>/` gets the complete presentation as a static page without JavaScript
   (`src/pages/work/[slug].astro`, Presentation in page mode). These are the same frozen addresses the
   four-page site used, so old project links still land on the project. They are the canonical project
   URLs: indexed, in the sitemap, with their link-preview card (`content/projects/*.md` `og`).
3. **Retired addresses redirect.** `/work/` goes to Home's `#work`, `/about/` to Home's `#how` (the
   person's part), and the lab address `/lab/one/` to `/`. Each is a static page with a meta refresh at
   0 s, a plain link for a browser that ignores it, `noindex`, and a canonical line that names the new
   address (`src/one/Redirect.astro`). They are kept out of the sitemap (`astro.config.mjs`). Reason:
   GitHub Pages serves files only; this is the standard static redirect, and the canonical line moves
   the old URL's standing to the new one.
4. **The Record moves onto the new set in its own language.** The Record's index, year pages and
   entries use the two-page layout (`src/layouts/One.astro`: the bar with the Home/Record tab, the
   field, the grain, the rail) and `src/one/record/record.css`. Kept from the four-page Record: the
   recorder and its motion (`src/scripts/media.ts`, unchanged), the date spine and its marks by shape,
   the year strip, project colour as the only colour job, the reading rules (21 px / 1.55 at weight
   430, 28 em, 19 px on phones), the project light on entry pages, the foot with the writing note and
   the feed. New: the Home strip's frontispiece (the recorder in engraver C's exploded tape transport)
   and the tape that becomes one spine through every year. Entry addresses `/record/<year>/<slug>/`
   never change (log.md §6.1).
5. **The hand-over from the strip.** "The whole record" on Home names the strip's recorder `stage` on
   click; the Record's head names its recorder `stage` (record.css), so where cross-document view
   transitions exist the object flies from the strip into the Record's head (720 ms, plus-lighter);
   elsewhere it is a plain navigation. No droplet plays between the two pages (ADR-0006 item 5 stays
   superseded).
6. **One head for every page.** `src/one/Head.astro` prints the canonical URL, the card, the icons,
   the manifest, the feed and the sitemap links and the structured data, for the layout and for the
   static project pages. A `noindex` page prints no canonical line of its own.
7. **What goes.** The four-page pages (the old Home, `/work/`, `/about/`), the sheet, the embassy, the
   four-page layout, its components, scripts and styles, and the four-page lab workbenches go when
   nothing imports them. The record of what went and how to restore it is
   `docs/history/removed-2026-10-17.md`.

## Consequences

- The site has two documents and one layer. Only the layer is scripted; everything else is the
  browser's (Back, Forward, scroll restoration, the back/forward cache), as in ADR-0007's option 3.
- An old bookmark to `/work/` or `/about/` lands on the right part of Home after one quick redirect.
  A fragment on the old address (`/about/#colophon`) is not carried over; the colophon line about how
  the record is written now stands at `/record/#colophon`, and the entry pages link there.
- Tests that walked the four tabs and the sheet are retired with their pages; the two-page Home and the
  Record have their own specs (`tests/e2e/lab-one*.spec.ts`, which now open `/`, and
  `tests/e2e/record.spec.ts`).
- The rows of the Record's head and of the Home strip share their grammar but not yet their CSS (the
  strip's rules are scoped to its component). Sharing them is a refactor and waits for the owner's word
  (review rows S12, S49).
