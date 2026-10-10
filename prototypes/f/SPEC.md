# Prototype F: prototype E rebuilt to the owner's verdict

**Status:** history (2026-10-10). Prototype F's spec; ADR-0007 still cites it. "`docs/brief.md` §7"
now means `docs/history/brief-log.md` §7. The Istanbul clock removed here (P1.4) is wanted back
(owner, 2026-10-10). Session scratchpad paths cited here were scratch, not kept.

Read first: `docs/brief.md` §7 (2026-10-09 after prototype E), `docs/research/2026-10-craft-audit.md`
(type, motion, the P1 list), `docs/research/2026-10-media.md` (§8 rules for pre-rendered media),
`tools/icons/README.md` (the icon set), `prototypes/e-dark/SPEC.md`, `prototypes/CONTENT.md`.

`index.html` is one self-contained file (584 KB): no doctype/html/head/body tags, `<title>` first,
images inlined as data URIs, a deliberate single dark theme. Fonts come from Google Fonts with
metric-matched local fallbacks. No three.js, no external script.

Source and tooling (session scratchpad, `proto-f/`): `src.html` (editable source), `build.py`
(inlines MEDIA, photos, grain and the used icons), `assets.cjs` (sharp: subtracted posters,
graded courtyard, selfie crop, grain), `bugs.mjs` (navigation bug harness, runs against E and F),
`shoot.mjs` + `lib.mjs` (screenshots; Google Fonts answered from the local `@fontsource-variable`
files).

## What changed from E

| Area | E | F |
|---|---|---|
| Type | Schibsted Grotesk + Newsreader + Geist Mono caps, 24 sizes | Pairing 2: Newsreader (display: name, titles, project names, entry titles; reading: log and case prose), Inter (interface and ledes). The audit's nine-step scale (`--t-meta` … `--t-name`), tracking per §3.3, no mono, no caps, no italic |
| Decoration (P1.4) | glowing dots, kicker dashes, Istanbul clock, "Fig." captions, six numbering systems, gradient surname, italic flourish | all removed; meta lines are 13px Inter sentence case in `--ink-3` with tabular figures |
| First screen (P1.5) | teaser titles cut at the fold | hero has no min-height; the three project names sit at y≈745 of 900 (1440×900), y≈730 of 820 (1180×820); on 390×844 the first project name is in view |
| Motion (P1.7, P1.8) | springs ζ 0.28–0.59; morph on raw hover; idle bob | `--spring-ui` (k300 c30, ζ≈0.87) and `--spring-object` (k180 c16, ζ≈0.60) as `linear()`; 150 ms hover intent; a change is never restarted before its midpoint (360 ms), the latest request waits; no idle motion |
| One event, one family (P2.3) | 340/420/520/600/800 ms | tab change: out 160 ms ease-in, in 320 ms ease-out (rise 12 px, 24 px toward the tab direction), indicator on the ui spring; object change 720 ms (out 360 + in 480 from 240 ms) |
| Nav pill (P2.4) | fill + ring + glowing underline + saturate | one flat fill, no ring or underline |
| Focus sheet (P2.5, P2.6) | three bordered circles; stage in a box; whole tile morphed into the sheet | close button only; prev/next at the end and on the arrow keys; the stage bleeds into the sheet (sheet ground = page ground); only the project title morphs (view transition), the sheet rises 24 px and fades |
| Phone focus view | bottom drawer | full-screen page of its own (owner, 2026-10-09): poster on top, own scroll, a labelled Back ("Work" or "Home") top left; system Back and the iOS edge swipe close it through history |
| Primary action (P2.7) | GitHub and LinkedIn buttons | one solid "See the work", quiet text links "GitHub" and "LinkedIn" (placeholder) |
| About (P1.6, brief §7) | glasses object, paper mats, tilt | the courtyard carries About: graded into the ground, bleeding to the right edge (phone: full width on top), no mat, no tilt; the gate selfie stays as a smaller 4:5 photo; tracks are hairline columns, not cards |
| Objects | real-time three.js stage | pre-rendered media stage (below), posters only for now |
| Icons | Unicode ↗ → ← as characters, plus a few hand SVGs | the generated set from `tools/icons/out` inlined at build; no symbol characters anywhere |
| Accents | as E | Recto `#bbed26` (glows use `#a6d873`, audit §5.3), English Prep `#efb1cb` (iris, lagoon), Eat Map `#eb4f6b` with pink `#ec5794` and wine `#4a1626` glows, edk `#c9d4ff`, Log `#8fb8ff`, About gold `#f3b886` |

P2 items taken: P2.3, P2.4, P2.5, P2.6, P2.7, P2.8, plus P3 (one hover effect per element, reduced
motion keeps ≤150 ms crossfades). Not taken: P2.1 (no longer relevant: Schibsted is gone), P2.2
self-hosting (the artifact contract allows only Google Fonts; metric-matched fallbacks are in
place, self-hosted subsets belong to Level 2).

## Type

Loaded with one stylesheet:
`https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&family=Newsreader:opsz,wght@6..72,400..500&display=swap`.
`font-optical-sizing: auto` puts Newsreader at opsz 72 for the name and titles and at its text
size for the log prose. Fallbacks: `Inter Fallback` = local Arial/Liberation Sans with
`size-adjust: 105%`, `ascent-override: 92%`, `descent-override: 23%`; `Newsreader Fallback` = local
Times New Roman/Liberation Serif, `size-adjust: 100.5%`, `ascent-override: 73%`,
`descent-override: 26.4%` (measured average widths and vertical metrics with fontTools on the
Fontsource files).

| Token | Size / line-height | Face | Use |
|---|---|---|---|
| `--t-meta` | 13 / 1.35 | Inter | labels, dates, status |
| `--t-ui` | 15 / 1.45 | Inter | nav, buttons, deks |
| `--t-body` | 17 / 1.6 | Inter | interface paragraphs |
| `--t-read` | 19 / 1.6 | Newsreader | log and case prose |
| `--t-lede` | clamp(21, 1.85vw, 27) / 1.34 | Inter | hero and view ledes |
| `--t-h3` | 25 / 1.2 | Newsreader | entry titles, section titles |
| `--t-h2` | clamp(36, 3.4vw, 48) / 1.05 | Newsreader | year, numbers |
| `--t-title` | clamp(46, 5.2vw, 80) / 0.96 | Newsreader | view titles, project names |
| `--t-name` | clamp(52, 7.8vw, 122) / 0.92 | Newsreader | the name only |

## Navigation: one state machine

The URL is the only source of truth. `parse(hash)` turns it into `{view, project, entry, anchor}`;
`render(state, how)` makes the screen match it; `how` is `init`, `push`, `replace` or `pop`.

- Every in-page link is intercepted (`a[href^="#"]`, plain left click) and goes through
  `navigate()`, which pushes or replaces one history entry and calls `render()`. `popstate` and
  `hashchange` both call `render()` only when the parsed state differs from what is on screen, so a
  typed hash works and nothing renders twice.
- Each pushed entry carries `{k, f, base, sheet}`. `k` keys the scroll memory (Back and Forward
  restore the position; `history.scrollRestoration = 'manual'`); `base` is the view a project
  sheet sits on (Home or Work).
- Opening a project pushes `#work/<p>`. Prev/next and ←/→ replace it. Closing (button, Escape,
  backdrop, phone Back) goes back one entry when the sheet was pushed by us, and replaces the URL
  with the base when it was a deep link. Navigations that arrive while that Back is in flight are
  queued and applied after `popstate`.
- Unknown routes are made truthful on load: `#nope` becomes `#home`, `#work/nope` becomes `#work`.
- Clicking the active tab scrolls it to the top.
- Desktop: the bar stays visible and live above an open project. The sheet sits below it; a press
  on a tab, the mark or the GitHub link is routed by the dialog (the page under a modal is inert),
  with a hover proxy so the tab lights up and the cursor shows it is clickable.

**Transitions.** `setView()` cancels everything the previous call started, synchronously, reads the
current opacity of the incoming and outgoing views before cancelling (so A-B-A reverses from where
the eye is), hides every other view at once, fades the outgoing view in place (out of flow,
160 ms) and raises the incoming one (320 ms). A generation counter guards the only completion
callback. No `finish()`, no timers, no promise that hides a view later. Scroll resets or restores
before the incoming view paints. The sheet has the same shape: `closed → opening → open → closing`,
each phase starts from the current computed transform and opacity, and every async callback checks
the generation. The sheet opening uses a same-document View Transition (title morph) only when no
other motion is running; anything that interrupts it calls `skipTransition()`, and the update
callback does nothing if the sheet was closed meanwhile. `::view-transition { pointer-events: none }`
keeps the page clickable during the morph. Without View Transitions (or with `?novt`), the same
rise-and-fade runs on WAAPI. Reduced motion: 150 ms crossfades, no transforms, no morph.

**Focus.** Tab change by click, key or history: the view's `h1` (tabindex -1). Sheet: its `h2`.
Close: back to the tile or teaser it came from; after navigating elsewhere from the sheet, the new
view's `h1`.

## Bugs found in E and their status in F

Found with `bugs.mjs` (21 scenarios, desktop 1440×900 and phone 390×844, Chromium) on E with
`?nogl` (the routing code is the same with WebGL; a WebGL run under software GL stalled the main
thread and was not used for verdicts), then confirmed by reading the code.

| # | Bug in E | Cause | F |
|---|---|---|---|
| B1 | **Returning to a tab you left two or more changes earlier shows a blank page.** Home → Work → Log → Home: Home is invisible (opacity 0, shifted 56 px). This is the owner's "Home tab causes trouble": Home is the tab people return to. Reproduced on desktop and phone, by tabs, Back/Forward and the edk mark | `showView` calls `finish()` on the previous animations, including an exit animation that its own `.finished.then()` had already cancelled; finishing it re-applies its `fill: forwards` end state (opacity 0, translateX) to a view that is now incoming, permanently | fixed: animations are only cancelled, never finished; one generation-guarded completion; S3, S5, S17 pass |
| B2 | A-B-A within ~40 ms (double tap on tabs, quick back) leaves no view visible | the exit animation's async `finished.then()` hides the view after it has already become the incoming one | fixed (S2, S17 burst) |
| B3 | Unknown hash (`#nope`) shows Home but no tab is current and the indicator is missing | the router returns early for unknown routes | fixed: canonicalised to `#home` (S4) |
| B4 | During the open/close view transition, clicks are swallowed by the transition overlay and focus drops to `<body>`; a backdrop click in that window does nothing | `::view-transition` overlay is hit-tested as `<html>` | fixed: `pointer-events: none` on the overlay, any interruption skips the transition (S5 backdrop, S8) |
| B5 | Back then Forward quickly to a project, or two fast Backs from an open project: the sheet stays open while the URL says `#work`, `html.sheet-open` stays, history gains a duplicate entry | the `close` event of the previous close fires late and is taken for a platform close of the new sheet; `pushed`/`asked` flags with an 800 ms timer | fixed: closes we make are counted and ignored; the platform-close path only runs when the dialog is really closed and a project is shown (S8, S9) |
| B6 | Clicking Home (or any tab) while a project is open does nothing useful: the bar is under the modal, so the click hits the backdrop and only closes the sheet | modal dialog makes the page inert | fixed on desktop: the bar stays visible and its links are routed (S17); phone: Back is labelled, then the pill |
| B7 | No keyboard prev/next in the project view | not implemented | ←/→ step projects (S6) |
| B8 | Back does not restore the scroll position of the tab you return to | every view change scrolls to 0 | restored per history entry (S11) |
| B9 | Deep-link timers leak: `#log/<entry>` (460 ms) and `#about/colophon` (420 ms) scroll whatever tab you switched to meanwhile | `setTimeout` scrolls never cancelled | no timers; the scroll happens synchronously after layout (S12) |
| B10 | Reduced motion: fast tab clicks leave two views visible or one at opacity 0 | same as B1/B2 | fixed (S15) |
| B11 | Hovering down the Work list starts a 640 ms morph per row (audit P1.7) | raw `pointerenter` | 150 ms intent + midpoint rule: a 70 ms-per-row sweep makes 2 changes (S16) |
| B12 | `pushed = true` is set by any click on a project link, including ctrl/middle-clicks that open a new tab; the next close then calls `history.back()` and leaves the page | capture-phase click flag | links are only intercepted for plain left clicks; history state, not a flag, decides how to close |
| B13 | Double-clicking a tile can close the sheet it just opened (second click lands on the backdrop) | no guard | backdrop closes need press and release on the backdrop and ≥400 ms after opening (S7) |

Found in F during this round and fixed: reopening a project kept the previous project's scroll
position (`scrollTop = 0` ran while the dialog was `display: none`); a sheet closed before its view
transition's update callback ran was reopened by that callback; focus went to a teaser after
navigating Home from inside a project.

**Final runs (default Chromium launch):** E passes 6 of 21 scenarios (S1, S7, S10, S13, S15, S16);
every Home scenario fails on desktop and phone. F passes 21 of 21. Logs in the scratchpad's
`proto-f/`: `e-bugs-final.log`, `e-bugs-home.log`, `f-bugs-4.log`.

**Stress run:** F under software GPU compositing (`GPU=1`, about 10 fps, where WAAPI animations and
a view transition's first frame stay pending for a second or more): 18 of 21 at the normal
settle times (`f-bugs-gpu2.log`). The three failures read the page mid-transition. With settle
times tripled (`SLOW=3`) all three pass, so the state converges and none is left wrong. To make
that hold on any device, state never waits on an animation: the outgoing view, the sheet close and
the sheet open each have a generation-guarded watchdog that completes them if the frame never
comes.

**Media loader check:** a throwaway VP9 loop made from the Recto poster and injected with
`window.MEDIA_OVERRIDE` started only after load and idle, swapped in on its first painted frame,
played one at a time (Home's loop paused and was released when Work's started), released its
decoders when the view was left, and was never requested under reduced motion. The ground
around the playing video stayed seamless.

## Non-ASCII characters in E's source

Grep of `prototypes/e-dark/index.html` source outside data URIs:

| Char | Code point | Count | Role in E | F |
|---|---|---|---|---|
| → | U+2192 RIGHTWARDS ARROW | 7 | icon ("All work →", "Open the project →", "Next →") | inline SVG `arrow-right` |
| ↗ | U+2197 NORTH EAST ARROW | 6 | icon on external links; an emoji code point, drawn by Apple Color Emoji on iOS | inline SVG `arrow-up-right` |
| ← | U+2190 LEFTWARDS ARROW | 3 | icon ("← Previous") | inline SVG `arrow-left` |
| · | U+00B7 MIDDLE DOT | 40 | separator in text | kept as text (not an emoji code point) |
| ı ğ ü | U+0131, U+011F, U+00FC | 29 | Turkish letters | kept |
| “ ” — | U+201C, U+201D, U+2014 | 5 | punctuation | kept (no em dash in F copy) |

E's CSS also drew a ◇ diamond with `::before` on placeholders and glowing `●` dots as elements;
both are gone. F's output contains no arrow or symbol characters outside comments; `body` also sets
`font-variant-emoji: text` as a second line of defence.

## Icons

Inlined at build from `tools/icons/out/icons.json` with their `data-name`, `data-align`,
`data-animate` and `data-size`; `tools/icons/out/icons.css` is inlined as-is (alignment, hover
nudge, chevron flip, reduced-motion guards). Swapping the set means rebuilding `tools/icons` and F.
In the source an icon is a token: `<!--icon:NAME/SIZE[/medium]-->`.

| Name | Sizes used | Where |
|---|---|---|
| `arrow-right` | 16, 16 medium, 20 | "See the work", "All work", teaser names (20, `.on-serif`), tile buttons (20), "Next" |
| `arrow-left` | 16 | "Previous" in the project view |
| `arrow-up-right` | 16, 16 medium | external links: GitHub, Code, Open Recto, Open English Prep |
| `back` | 20 | phone project page, top left |
| `close` | 20 | desktop project view |
| `chevron-down` | 16 | log entries (rotates when open) |
| `github` | 16 | the bar only, where a mark is wanted |

Available and unused: `chevron-right`, `chevron-left`, `menu`, `plus`, `check`, `copy`,
`calendar`, `clock`, `play`, `pause`, `dot`, `linkedin` (interim bug; LinkedIn is a text link).

## Objects: the media stage and the MEDIA manifest

F has no real-time 3D. Each object slot (`.media[data-slot][data-obj]`: Home, Work, Log, and one
per project view) shows its still at once and upgrades only when moving media can play. Today
every entry has a poster only; the render pipeline fills the rest without code changes.

```js
const MEDIA = {
  recto: {
    light: '#a6d873',                    // the CSS glow around the object (media carries no glow, §8.5)
    poster: {                            // the still: complete on its own, frame 0 of the subtracted master
      src: 'media/recto-1200.avif',      // F inlines a WebP data URI
      small: 'media/recto-300.avif',     // thumbnails (phone tiles, log header)
      w: 1200, h: 1200,
      ground: 'subtracted'               // encoded with the ground (10,10,11) subtracted; drawn with plus-lighter
    },
    idle: {                              // seamless loop, 6-10 s, frame N excluded, seam on a rest pose
      sources: [                         // first playable wins; order and codecs strings are required
        { src: 'media/recto-1600.av1.mp4',  type: 'video/mp4; codecs="av01.0.12M.10"' },
        { src: 'media/recto-1600.hevc.mp4', type: 'video/mp4; codecs="hvc1.2.4.L153.B0"' },
        { src: 'media/recto-1600.h264.mp4', type: 'video/mp4; codecs="avc1.640033"' }
      ],
      small: [ /* same three at 800 px, used below 900 px wide */ ]
    },
    lean: {                              // pointer lean: a hemi-grid of angles, desktop fine pointer only
      frames: ['media/recto-lean-00.avif' /* … row-major, cols × rows */],
      cols: 7, rows: 3, w: 1200, h: 1200 // (a single sprite sheet is preferred by §7; F's loader takes frames)
    },
    clips: {                             // play once over the idle state, then hand back
      enter: { sources: [/* … */] },     // hover intent on its Work tile
      tap:   { sources: [/* … */] }      // a press on the object
    },
    transitions: {                       // hub morph through the shared droplet (3d-quality §7.2)
      in:  { sources: [/* droplet → object */] },
      out: { sources: [/* object → droplet */] }
    }
  }
}
```

Loader contract (implemented in `Media` in `index.html`; `docs/research/2026-10-media.md` §8):

1. The poster paints first; `light` sets the CSS glow. Missing fields mean "stay a still".
2. No `src` is set until the page has loaded and gone idle, the slot is on screen and its view is
   shown, the tab is visible, reduced motion is off and Save-Data (or a 2g connection) is off;
   `?still` forces stills.
3. Video is `muted`, `playsinline`, `loop` (idle), `disablepictureinpicture`, `aria-hidden`; the
   source is the first whose `type` passes `canPlayType`. `play()` is called at once (iOS fetches
   nothing before it); if it rejects (Low Power Mode, policy) the still stays, silently, with no
   play button.
4. The swap happens on the first `requestVideoFrameCallback` (fallback: `playing` + two frames) with
   a 200 ms opacity crossfade over the still.
5. At most one video plays on the page; a slot that leaves the viewport pauses, a hidden document
   pauses everything, and a slot whose view is hidden releases its decoder
   (`removeAttribute('src'); load()`).
6. Compositing: every still, video and canvas has `mix-blend-mode: plus-lighter` and is encoded
   ground-subtracted, so the ground is exact. `.media` and its layers never form a stacking context;
   morph scale and opacity animate the blended elements themselves, and the pointer parallax uses
   the separate `translate` property. Every element that fades or moves around blended media
   paints `background: var(--ground)` itself: `.view`, `.case`, `.sheet`, `.stagecol .sticky`.
   For that reason the page has no wide aura behind the content any more: light is the CSS glow
   around each object (and a gold glow beside the courtyard), and a static grain covers the page.
7. Object changes inside a slot (Work hover intent, focus, the tile being read on touch) crossfade
   the old layer out (360 ms) and the new one in (480 ms from 240 ms); a request inside the first
   half waits for the midpoint. `transitions` clips are part of the contract but not yet played by
   F's loader (no clips exist to test against); until then changes are crossfades.
8. Life without a loop: one slow light sweep across the object when it arrives (masked by the
   poster's own luminance) and, on desktop, a glint and a ≤6 px parallax that follow the pointer
   on the ui spring. Nothing idles. Reduced motion: none of it.

The posters are the E Cycles posters with the ground subtracted by `assets.cjs` (8-bit, an
interim until the pipeline's 16-bit masters exist); their ground now decodes to exact 0,0,0.

## Photos

- Courtyard (`content/photos/park-through-lens.jpg`): cropped 150 px off the left (the brightest
  finger), graded in linear light (exposure down, saturation −15 %, slight warm split), a vignette
  that reaches the ground, clamped to never fall below `#0a0a0b`, σ 0.6 dither, then encoded:
  AVIF 750/1000/1500 (76/124/217 KB) and WebP 750/1000/1500 (117/186/302 KB) in the scratchpad's
  `proto-f/assets/`. F inlines the 1000 WebP. Level 2 markup: `<picture>` with the AVIF then WebP
  `srcset`. Alt text corrected to the inner courtyard. No Ken Burns, no 2.5D.
- Gate selfie: 4:5 crop around the face and thumb, 720 px WebP (29 KB), 4 px radius, hairline,
  caption in meta style.

## Size

584 KB total: posters ≈ 160 KB (five 1200 px plus five 300 px thumbnails, base64), courtyard
≈ 248 KB, selfie ≈ 38 KB, grain ≈ 28 KB, icons ≈ 9 KB, markup, CSS and JS ≈ 100 KB. Fonts load
from Google (≈ 120 KB as subset by Google).

## Screenshots (`shots/`)

`{desktop,tablet,phone}-{home,work,log,about}[-2|-3].png`, `*-log-open.png`,
`*-focus-recto[-2].png`, `*-focus-eatmap[-2].png`, the flow `flow-1-tab-mid` (120 ms into a tab
change), `flow-2-morph-mid` (hover-intent crossfade), `flow-3-hover-prep`, `flow-4-opening`
(title morph), `flow-5-open-home-hover` (bar live above the sheet), `flow-6-home-from-sheet`, and
`rm-{desktop,phone}-home.png` (reduced motion).

## Open issues

- Real devices: `plus-lighter` over posters (and later video) on iPhone Safari, the ground seam in
  a dark room, the View Transition with a top-layer dialog in Safari 18, and the iOS edge-swipe
  Back on the full-screen project page are unverified (Chromium only here).
- The hover proxy for the bar above a desktop sheet is a workaround for the inert page under a
  modal; keyboard users reach other tabs after Escape. An alternative is a non-modal dialog with
  its own focus trap; judge after the owner tries it.
- Lean sequences, clips and transition clips are implemented in the loader but untested (no
  media yet); `transitions` are not played yet.
- The courtyard caption is hidden on phones (it collided with the bar); the alt text remains.
- Eat Map: description, version and start date are still placeholders (CONTENT.md).
- Self-hosted font subsets (audit §3.5) wait for Level 2; Google Fonts is the only allowed host in
  a published artifact.
