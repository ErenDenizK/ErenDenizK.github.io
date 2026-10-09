# ADR-0007: Every tab is a page; the browser navigates, and only the project sheet is scripted

**Status:** accepted 2026-10-09 by the owner, with a shorter melt that overlaps the navigation (item 3) · **Rests on:** brief §4.1, §7 (2026-10-09: "page transitions and
navigation are a little buggy", "the top navigation is troublesome, especially clicking Home");
ADR-0002 (content is HTML), ADR-0005 item 1 (one object per tab, changing into the next), ADR-0006
item 5 (the droplet change); `research/2026-10-ux-patterns.md` §1–2; `prototypes/f/SPEC.md`
("Navigation: one state machine", bugs B1–B13)

## Context

Prototype F was one document: four views, a hash router and a state machine, made reliable only after
21 navigation scenarios had found 13 bugs in E. The real site has a URL per tab (`/`, `/work/`,
`/log/`, `/about/`), per project (`/work/<slug>/`) and per log entry (`/log/<year>/<slug>/`), each of
which must be a complete page without JavaScript. Two things from F have to survive multi-page
navigation: the object changing from one tab into the next, and the project focus view opening
over Work (wide screens) or as a page of its own (phones).

Options considered:

1. **Astro `<ClientRouter />`** with `transition:persist` on the media stage: a client-side router
   that swaps pages in place. Keeps one live stage across tabs, so the droplet clips could run as
   one continuous sequence. But it brings back F's whole class of bugs (state that outlives a
   navigation, scripts that must re-run on `astro:page-load`, its own history and scroll handling,
   a dialog and pushState of our own competing with its popstate), and every page's script must be
   written for a document that is never reloaded.
2. **A small client router of our own** (fetch the next page, swap `<main>`): the same risks as 1,
   with code we would own for four years.
3. **Native navigation with cross-document view transitions** (`@view-transition { navigation:
   auto }`, Chrome 126+, Safari 18.2+): each tab is a fresh document; Back, Forward, scroll
   restoration and the back/forward cache are the browser's. Elements that share a
   `view-transition-name` (the bar, the tab indicator, the object stage) morph between pages; other
   browsers navigate instantly and completely.

## Decision

Option 3, with one scripted exception.

1. **Tabs are plain links.** A new tab is a new document, so the stale-view bugs of E (B1, B2, B10:
   a tab left blank or invisible after quick changes) cannot happen by construction. Clicking the
   tab you are on scrolls it to the top instead of reloading, unless another navigation was just
   started (then the latest click wins).
2. **The change is a cross-document view transition** (`src/styles/transitions.css`): the outgoing
   page fades in place (160 ms), the incoming page rises 12 px and moves 24 px toward the tab's
   direction (320 ms); the indicator slides on the ui spring; a project or entry page arrives from
   below. Direction comes from a `pagereveal` handler in the head (tab order, depth). Reduced
   motion turns cross-page animation off.
3. **The object changes through the droplet** (ADR-0006 item 5): a tab click starts the stage's
   `droplet.out`, sped up to about 350 ms, and navigates as soon as its first frame is on screen (at
   most 120 ms later), so the melt overlaps the page load (owner, 2026-10-09: barely felt, still
   readable); the view transition crossfades at the shared droplet and morphs its position; the new page shows only the glow until its `droplet.in` has a
   first frame (the poster comes back by itself after 1.6 s if it never does). The stage is a
   `plus-lighter` group, and so is its transition group, so the ground stays exact during the morph
   (media research §3.1). Back and Forward skip the melt (they do not go through a click) and
   simply crossfade.
4. **The project focus view is the one scripted state** (`src/scripts/sheet.ts`). On Work and Home,
   at 900 px and wider with JavaScript, a project link opens that project page's article in a
   native `<dialog>` over the page, pushes the project URL, morphs the title (a same-document view
   transition) and closes by button, Escape, backdrop or Back. It is F's state machine (closed,
   opening, open, closing; generation-guarded; the URL decides), reduced to two states of one
   document. A reload, a shared link or a phone shows `/work/<slug>/` as a page of its own, laid out
   like the sheet; on phones it has a labelled Back that returns through history when you came from
   Work or Home.
5. **Log entries open in place** on `/log/` with JavaScript; their title is a link to their page
   without it.
6. **Verification:** the 21 scenarios of F's suite run against the built site on every push
   (`tests/e2e/nav.spec.ts`), with the same invariant: what is on screen matches the URL.

## Consequences

- Every page is complete HTML; the script is about 9 KB gzipped and only enhances.
- Firefox (no cross-document view transitions yet) gets instant, correct navigation and no object
  morph across tabs; the droplet still melts before leaving.
- A tab change waits at most 120 ms for the melt to start. On a fast load the old page may be captured
  before the droplet is complete; the crossfade at the droplet covers the difference.
- The live stage does not persist across tabs, so a continuous droplet sequence (one video melting
  and re-forming across the navigation) is not possible here. If the owner wants it, option 1 is
  the way, with its costs.
- The desktop bar stays live above the sheet through a routed click (the page under a modal dialog
  is inert), as in F.
