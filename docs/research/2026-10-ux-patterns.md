# Research: tabs, project views, dark editorial, objects, motion (2026-10-08)

Only github.com, raw.githubusercontent.com and npm were reachable. Tags: **[V]** verified
(MDN browser-compat-data, cloned source, npm), **[S]** search extracts, **[R]** recollection.

## 0. Platform facts [V, MDN BCD]

| Feature | Chrome | Safari | Firefox |
|---|---|---|---|
| Same-document View Transitions | 111 | 18 | 144 |
| Cross-document `@view-transition` | 126 | 18.2 | no (Interop 2026 target [S]) |
| Scroll-driven animations | 115 | 26 | preview only |
| Navigation API | 102 | 26.2 | 147 |
| `@starting-style` | 117 | 17.5 | 129 |
| CSS `linear()` (springs) | 113 | 17.2 | 112 |
| `<dialog closedby>` | 134 | preview | 141 |

An in-page project view animates everywhere; route changes animate in Chrome and Safari only;
scroll-linked CSS is enhancement only. Versions [V, npm]: Astro 7.3.8, three 0.186.1, GSAP
3.15.0 (all plugins free), Motion 14.0.0 (too new to pin yet), Vaul unmaintained.

## 1. Tabs are routes

Every tab is a real URL (ADR-0002): its own title, OG card, indexable HTML, native Back.
Animate route changes with native cross-document transitions (zero JS, canvas restarts per
page) or Astro `<ClientRouter />` (`transition:persist` keeps one canvas alive; needed only for
an object that morphs across tabs).

- Semantics: `<nav aria-label="Primary">` links with `aria-current="page"`; not ARIA tabs.
- Desktop: floating segmented pill; one indicator with `view-transition-name` morphs between
  tabs with no JS.
- Phone: compact sticky top pill that hides on scroll down. No bottom bar: iOS 26 Safari's
  floating toolbar clips fixed bottom elements [S: Apple forums 800798, 801694].
- Tab clicks push history; slide direction follows tab order.
- Tabs: **Home · Work · Log · About**. Home is the trailer for the one-minute visitor: name and
  sentence, hero object (poster first), three project teasers, a now line with the latest
  entry, links. Now and colophon live in About.

## 2. Project focus view: a modal over a route

- Every project is a page `/work/<slug>/` laid out as a sheet; a direct visit or no JS renders
  it standalone, looking like the modal.
- With JS: a card click fetches the project's article, runs `startViewTransition()` with
  temporary `view-transition-name`s on the clicked card's media and title (Bramus's profiles
  demo [V]), opens a native `<dialog>` with `showModal()` (top layer, inert page, Escape, focus
  containment) and `pushState`s the project URL.
- Close by button, Escape, backdrop (manual; `closedby` not in Safari), swipe down on phones at
  scroll top, or Back; one close path (`history.back()` if we pushed, else go to `/work/`).
- Focus the sheet heading on open, return to the card on close; lock page scroll with
  `html:has(dialog[open])`; the sheet scrolls with `overscroll-behavior: contain`.
- Desktop: centred sheet ~`min(1120px, 92vw)` × 92dvh; page behind scales to 0.98 and dims; the
  project's colour lights the space behind; prev/next. Phone: full-height bottom sheet,
  `transform .5s cubic-bezier(.32,.72,0,1)` (Vaul's curve [V]).
- Inside: teaser (loop or poster, one-liner, status, version, role, dates, links) → what it
  is → why → how (decisions linked to ADRs) → learned → next; sticky section index.
- Reduced motion: fade ≤150 ms, no morph.
- Examples: App Store Today cards [R]; view-transitions.chrome.dev profiles [V]; Motion "Expand
  card" [S]; brianlovin.com list/detail routes [V]; bruno-simon.com as counter-example (no URL
  per modal, no reduced motion, 197 MB of assets [V]).

## 3. Dark editorial done well

References: Resend, Linear, Raycast, igloo.inc, lusion.co, rauno.me ([R]/[S]).

- One light per view: the aura is the spill of a lit object or the open project's colour, never
  a page-wide blob wallpaper. Each project owns a hue.
- Glass only where something sits behind it.
- Photos as prints: framed, natural or slightly cool, true blacks, never under text.
- Grain or dither on dark gradients (banding is the cheap-dark tell).
- Type: one display face used large and sparingly, a neutral text face, a mono for the record
  (dates, versions, status).
- Contrast: ground #0A0A0A–#111, body ~#E6E4E0 (not pure white), secondary ≥4.5:1; drop body
  weight a step and add slight tracking on dark.
- Avoid: purple–blue blobs, glowing bento grids, cursor spotlight, animated dot grids, glass
  everywhere, typewriters.

## 4. Discovered objects

- Bruno Simon's achievements are data saved to localStorage and several reward looking at
  content ("check every project") [V]: the game points at the work.
- Pattern: one hero object per tab tied to its subject, one persistent canvas morphing between
  shapes (morph targets, SDF blending or particle dissolve), 700–900 ms in sync with the route
  transition; per-tab AVIF posters as the still twin.
- Optional desktop play: drag to spin with inertia; each project opened adds its object to a
  shelf on About ("3 / 3 seen"); never gating or interrupting.
- Speed: HTML and posters first; gate on capability, reduced motion, Save-Data; load the
  renderer when idle or visible; prefetch the next tab's model on hover; cap DPR; pause when
  hidden. Phones: lighter object or poster.
- Budget: ~300–500 KB per model (meshopt, KTX2), <30k triangles [S].

## 5. Motion language

Continuity (shared elements), springs via CSS `linear()` and a damped spring in the render
loop, interruptible; one choreography per event (8–16 px rise, 30–60 ms stagger, 3–6 items);
object tilt ±4–6° to the cursor, no custom cursor; scroll-linked only for progress and object
parallax; no Lenis.

| Event | Timing |
|---|---|
| Hover / press | 120–180 ms |
| Tab change | 300–400 ms |
| Sheet open | ~500 ms |
| Object morph | 700–900 ms |
| Aura | still by default |

Reduced motion: opacity ≤150 ms, posters, no loops. Libraries: CSS first; GSAP only if
timelines or SplitText are needed; never two motion libraries.

## 6. Proposed IA

```
/                   Home   name + sentence · hero object · 3 project teasers · now + latest log · links
/work/              Work   products directed by me (3 tiles); later "By hand" in a lighter format
/work/<slug>/       Focus view (sheet page; opens as <dialog> with pushState)
/log/               Log    year-grouped: date · title · dek · length · project chip
/log/<yyyy>/<slug>/ Entry
/about/             About  intro, 1–2 photos, two-track education, links, now, colophon, shelf
/404, /rss.xml, /sitemap.xml
```

ADR to come: ClientRouter with a persistent canvas if the morphing object is accepted;
otherwise native cross-document transitions.
