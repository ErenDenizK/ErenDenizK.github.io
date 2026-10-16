# Technical feasibility: the two-page design (Home with the Work cylinder, Record)

Status: research, 2026-10-15. Spikes and measurements by the research agent in
`scratchpad/phase3/tech/`. Nothing in the repo was edited. Verified = measured here or read from
the installed package or the npm registry; web sources are cited; "unverified" marks what could not
be checked from this machine (no WebKit, no real GPU, gsap.com not reachable).

Design under test (owner, 2026-10-15): two pages, Home and Record. Home is one long centred page:
a short brief, then Work, where project images sit on a slowly rotating, staggered cylinder (Robin
Noguier's curved WebGL carousel as the reference). A click grows the image fluidly, in place, into the
project presentation, which steps through the product (Dia, Notion Calendar). The background lives on
every scroll (Shopify Editions): colour grounds per section, the site's aura and grain, the aura taking
its colour from what is on screen. Slow animations; sections arrive one by one.

Facts of the current stack used below: Astro 7.3.8, static, GitHub Pages; every page is complete HTML
without JS (ADR-0002); cross-document view transitions between pages (ADR-0007); objects are
pre-rendered media drawn with `plus-lighter` (ADR-0006); a fixed grain tile (`global.css .grain`);
the aura today is the family kit's CSS light field (`docs/family-kit/light.css`, radial pigments that
cross-fade) plus the lab levels in `src/styles/lab-aura.css`; first-paint budget 200 KB per page
(`tests/budget.mjs`: HTML gzip + preloaded fonts + the page's module script gzip + CSS images + the
high-priority image). **Measured on the current build: Home 181.5 KB of 200 KB** (fonts 117.5, HTML
30.0, JS 17.8, images 16.2). So Home has 18.5 KB of headroom: any library must load after first paint
(a dynamic `import()` chunk is not counted by the budget script, and it should not be).

---

## 1. Libraries

### 1.1 Versions, licences and sizes

Versions from `npm view` on 2026-10-15. Sizes measured: each entry bundled with esbuild 0.28.2
(`--bundle --minify --format=esm`), only the named exports imported, gzip level 9 and brotli
(`scratchpad/phase3/tech/size/`). KiB (÷1024), as the budget script counts.

| Library | Version (published) | Licence | What was bundled | min | gzip | brotli |
|---|---|---|---|---|---|---|
| GSAP core | 3.15.0 (2026-04-13) | "Standard 'no charge' licence" (gsap.com/standard-license), not OSI | `gsap` | 69.0 | 27.0 | 24.4 |
| GSAP + ScrollTrigger | 3.15.0 | same | core + ScrollTrigger | 112.5 | 44.2 | 39.8 |
| GSAP + ScrollTrigger + Flip + SplitText | 3.15.0 | same | | 144.3 | 55.9 | 49.8 |
| GSAP Flip alone (needs core) | 3.15.0 | same | | 24.4 | 9.4 | 8.4 |
| Motion (vanilla) | 14.3.0 (2026-10-15, today; 14.0.0 2026-10-02) | MIT | `animate, scroll, inView, spring` | 70.0 | 26.4 | 24.0 |
| Motion mini | 14.3.0 | MIT | `motion/mini` `animate` (WAAPI only) | 8.2 | 3.3 | 3.0 |
| Lenis | 1.3.27 (2026-10-15) | MIT | `Lenis` | 18.3 | 5.3 | 4.7 |
| OGL | 1.0.11 (2025-01) | Unlicense | Renderer, Program, Mesh, Plane, Texture, Camera, Transform, Triangle | 51.7 | 14.7 | 12.4 |
| three.js | 0.186.1 (2026-09-24) | MIT | WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Mesh, TextureLoader | 518.2 | 130.1 | 107.4 |
| Raw WebGL (own code) | | ours | the living-background spike (one shader, one triangle) | about 2 KB of source | | |

**GSAP licence.** The npm `license` field is the URL of the Standard "no charge" licence; the package
ships no licence text. gsap.com did not resolve from this machine, so the wording was read through
secondary sources: since 3.13 (2025-04-30) every plugin (SplitText, MorphSVG, ScrollSmoother, Flip,
DrawSVG, ...) is free for commercial use; the restriction is a "Prohibited Uses" clause against tools
that let people build visual animations without code in competition with Webflow's builder; ownership
stays with Webflow. A personal portfolio is a permitted use. One third-party summary also mentions a
clause for products that charge end users a fee; it does not apply here. **Unverified on the primary
page**; read gsap.com/standard-license before adopting. The package does contain `MorphSVGPlugin.js`,
`SplitText.js`, `ScrollSmoother.js` and the rest (seen in `node_modules/gsap/`).

**Motion.** 14.x is two weeks old and 14.3.0 shipped today; pin an exact version at least two weeks
old (for example the newest 14.0.x or 13.x) if it is adopted. Its `scroll()` uses the native
ScrollTimeline where the browser has it, and falls back to a JS scroll listener.

### 1.2 Platform features (no bytes)

| Feature | Chrome | Safari | Firefox | Source |
|---|---|---|---|---|
| CSS scroll-driven animations (`animation-timeline: scroll()/view()`, named view timelines, `animation-range`) | 115 | **26.0** (Sept 2025) | behind a flag (one source: still flagged in 152) | WebKit "Features in Safari 26.0"; Chrome docs support table; buildmvpfast blog (unverified: Safari 26.4 runs them threaded, 26.5 fixed progress bugs) |
| Same-document View Transitions (`startViewTransition`) | 111 | 18.0 | **144** (Oct 2025) | web.dev "same-document view transitions are Baseline newly available" (2025-10-16) |
| `view-transition-class`, `view-transition-name: match-element`, `:active-view-transition` | yes | yes (part of the Baseline set, Interop 2025) | 144 | same web.dev post |
| Cross-document View Transitions (`@view-transition { navigation: auto }`) | 126 | 18.2 | not shipped (unverified) | Chrome docs; ADR-0007 |
| `@property` (animate a colour custom property) | yes | 16.4 | 128 | general knowledge, unverified here |

So on the owner's iPhone (Safari 26 or later), everything this design needs from CSS exists natively.
iPhones still on iOS 18 have view transitions but **no scroll-driven animations**: they need the JS
path or a still page (feature-detect with `CSS.supports('animation-timeline: view()')`).

### 1.3 Recommended stack (minimal)

1. **Astro 7 static, as today.** Nothing in the design needs a client router.
2. **Native CSS first**: scroll-driven animations for the cylinder's turn and the section arrivals
   (compositor-driven, no script per frame; measured below), `@property` colour tokens for the section
   grounds, same-document View Transitions for the expand, the existing cross-document transition for
   Home and Record.
3. **Own TypeScript glue** (a few KB): the JS fallback for the turn on browsers without scroll timelines,
   the expand state machine (pushState / popstate), the section colour observer, pausing.
4. **OGL, as a lazy, capability-gated chunk** (14.7 KB gzip), and only if the owner chooses the bent
   WebGL cylinder over the CSS one (section 2). One WebGL context for the cylinder and, if chosen,
   the background. three.js is 9x heavier for the same job.
5. **No GSAP, no Lenis, no Motion on the site.** Pinning is `position: sticky`; Flip is the View
   Transitions API (Baseline); springs already exist in `docs/family-kit/springs.js`; smooth-scroll
   libraries take the scroll, which ADR-0010 item 2 and ADR-0014 item 5 forbid for good reasons
   (Back restoration, keyboard paging, native momentum). If a JS animation library becomes necessary,
   `motion/mini` (3.3 KB, MIT) is the smallest that adds springs to WAAPI.
6. **GSAP is still the right tool offline**: HyperFrames compositions are GSAP timelines (section 5).
   There its size does not matter and its licence permits the use.

---

## 2. The cylinder carousel

### 2.1 What was built

Two plain-HTML spikes, eight real captures (Recto and English Prep screens, 960 px JPEG), a brief
section, a Work section of 8 × 70svh with a sticky 100svh stage, and an outro. The scroll position
inside Work maps to the ring's turn (one project per 45°) and a downward step per project (a helix:
the "staggered" look). The page scrolls natively; nothing takes the wheel or the touch.

- `spike/css-cylinder.html`: a `preserve-3d` ring, each panel `rotateY(i·45°) translateZ(R)`.
  `?drive=js`: a rAF reads `scrollY` and writes one transform (plus a 2.5° idle sine, period 12 s).
  `?drive=css`: `animation-timeline` on a named view timeline, `animation-range: contain 0% contain
  100%`; no script per frame. `?slices=6`: each image cut into 6 strips on their own facets, so the
  surface is curved (faceted) instead of flat cards.
- `spike/gl-cylinder.html`: OGL, one canvas in the sticky stage; each project a 32×1-segment plane
  bent onto the cylinder in the vertex shader (`theta = angle + x / R`), shaded by `cos(theta)`, and
  bowed in proportion to the smoothed scroll velocity (Robin's look). `?dpr=` caps the canvas.

Screenshots: `scratchpad/phase3/tech/shots/` (`phone-*.png` at 390×844 DPR 3, `desktop-*.png` at
1440×900). The WebGL one at 1440 shows the real bend and the falloff of light at the sides; the CSS
slices version reads as curved at phone size, with faint facet edges up close.

### 2.2 How it was measured

`measure.mjs`: Playwright 1.56 Chromium headless shell (build 1194), CPU throttled 4× through
`Emulation.setCPUThrottlingRate`, WebGL through ANGLE on **SwiftShader (software)**, a synthetic scroll
gesture (`Input.synthesizeScrollGesture`, about 4,900 px at 1,000 px/s) while a trace records. Output:
compositor frames per second (viz `DrawAndSwap`), main-thread rAF intervals, the page's own update time
per frame, and the busy share of the renderer main thread and the GPU threads. Two runs each; the
machine was shared with other agents (load about 3.8 on 4 cores), so treat ±20 % as noise.

Caveat that decides how to read the numbers: **the throttle slows only the main thread; the "GPU" here
is the CPU running SwiftShader.** Main-thread numbers say something about a phone. GPU-bound numbers
say only "cost grows with pixels"; an iPhone GPU fills pixels far faster, so they cannot predict iPhone
frame rates. (A first phone run used a touch gesture, which does not scroll in the headless shell; it
was discarded and rerun with the default gesture source. `results-cylinder.jsonl` phone lines are those
discarded runs; `results-phone-v2.txt` holds the valid ones.)

### 2.3 Results

Phone, 390×844 at DPR 3, CPU 4× (two runs):

| Variant | frames/s | rAF p95 (ms) | rAF > 25 ms | own update p95 (ms) | main busy | GPU busy (SwiftShader) |
|---|---|---|---|---|---|---|
| CSS, JS-driven, flat | 51 / 60 | 16.8 | 2-3 % | 1.1-1.2 | 25-32 % | 9-10 % |
| CSS, JS-driven, 6 slices | 51 / 59 | 33.3 | 7-9 % | 1.1-1.2 | 29-36 % | 11-15 % |
| CSS, scroll-driven, flat | 45 / 48 | 16.8 | 0 % | none (no script) | 21 % | 8-11 % |
| CSS, scroll-driven, 6 slices | 40 / 43 | 16.8 | 0-3 % | none | 18-22 % | 9-13 % |
| WebGL, DPR 1 | 51 / 35 | 16.8 / 150 | 3 / 55 % | 2.6 / 4.9 | 19-26 % | 14 / 96 % |
| WebGL, DPR 2 | 29 / 21 | 83 / 367 | 53 / 71 % | 3.0 / 5.1 | 10-11 % | 84-94 % |
| WebGL, DPR 3, 64 segments | 16 / 10 | 300 / 1450 | 55 / 85 % | 2.4 / 4.7 | 5 % | 84-92 % |

Desktop, 1440×900 at DPR 1, CPU 4× (three runs):

| Variant | frames/s | rAF p50 / p95 (ms) | GPU busy |
|---|---|---|---|
| CSS, JS-driven, flat | 28-34 | 33 / 100-117 | 79-88 % |
| CSS, JS-driven, 6 slices | 54 | 17 / 33 | 14 % |
| CSS, scroll-driven, flat | 27 | 17 / 50 | 69 % |
| CSS, scroll-driven, 6 slices | 38-44 | 17 / 17 | 11-13 % |
| WebGL, DPR 1 | 20-23 | 50-67 / 350-417 | 87-100 % |
| WebGL, DPR 2 | 19-21 | 50-67 / 400-550 | 87-99 % |

(The flat CSS panels cost more GPU than the sliced ones at 1440 in every run; not explained. A likely
cause is re-rasterisation of large 3D-transformed layers as their scale changes; the slices are smaller
tiles. Check on the iPhone rather than trust it.)

**Reading.** On the main thread, which is what a phone's CPU feels, every variant is cheap: the turn
costs 1.1-1.2 ms per frame in JS-driven CSS, 2.4-5 ms in WebGL (uniforms + draw calls, at 4× throttle),
and nothing in scroll-driven CSS, which Chromium runs on the compositor thread (the main thread stays
idle and the turn cannot lag the scroll by a frame). The WebGL cost that collapses frame rates here is
pixel fill in software; on a real GPU it is the battery and heat cost of redrawing a full-screen canvas
every frame, which is why the canvas must stop drawing when nothing moves (section 4.3).

Memory (computed, not measured): CSS panels are composited layers, about 1.8 MB each on the phone
(281×176 CSS px at DPR 3) and 2.9 MB at 1440 (760×475 at DPR 2), 14-23 MB for eight. WebGL: eight
960×600 textures with mipmaps, about 25 MB, plus the canvas buffers (about 10-16 MB at DPR 2 on a phone).
Both are inside iOS limits, but WebKit's per-tab memory limit is the real risk (section 6).

### 2.4 Which one, and how it behaves

- **Look.** Only WebGL bends an image and lets it bow with speed (Robin's look). CSS gives flat cards on
  a ring, or a faceted curve with slices (six facets read as curved on a phone; edges show on desktop).
- **Phones.** Both work. The CSS scroll-driven version is the safest on a phone: no script per frame,
  the compositor owns it, and it degrades to a still list with no work. WebGL at DPR ≥ 2 must be capped
  (DPR 2 is enough for moving images) and must draw only while the stage is on screen and moving.
- **Recommendation.** Put both in one lab page and let the owner choose on the iPhone. Build the CSS
  scroll-driven cylinder first: it is also the fallback the WebGL one needs (no WebGL, context lost,
  reduced motion, Low Power Mode, iOS 18). If the owner wants the bend, add the WebGL layer as an
  enhancement that draws the same DOM images (the DOM keeps layout, links, `alt`, focus; the canvas
  draws over it and hides the DOM images only after its first frame).
- **Vertical scroll drives the turn; no touch drag on phones.** A horizontal drag on a phone fights the
  vertical scroll and Safari's edge swipe for Back. On desktop a pointer drag may add to the turn, with
  `touch-action: pan-y` so a touch never gets caught. Never `preventDefault` on wheel or touch, no
  scroll snapping (ADR-0010 item 2), no smooth-scroll library.
- **Avoid hijacked scroll**: the turn is a pure function of the native scroll position inside a sticky
  stage. The Work section is as tall as its projects (here 70svh each), so the visitor can always scroll
  past it at native speed; Back restores the position and the turn follows by construction.
- **Keyboard.** The projects are a list of links in DOM order. Focus on a card scrolls the page to that
  card's position (`scrollIntoView` to the matching offset), so the ring turns to it; Page keys, Space
  and arrows scroll natively. Enter opens it (section 3).
- **Reduced motion.** No idle drift, no velocity bow, no turn: the projects become a plain vertical list
  of still images (or the ring with steps and no interpolation, if the owner prefers it; to be shown).
  No JS: the same list, complete. No WebGL: the CSS version.

---

## 3. Expand in place with a real URL per project

**Spike:** `spike/expand.html` + `spike/work/recto.html` (the static twin), checked by
`check-expand.mjs` at 390×844 and 1440×900 in Chromium:

- Click: `document.startViewTransition()` morphs the card image (`view-transition-name: shot`) into
  the presentation's hero; `history.pushState({ slug, y }, '', '/work/recto/')`; focus moves to the
  title. Result: URL `/work/recto.html`, Home's `scrollY` unchanged (1150 on the phone, 1240 on desktop).
- Back (`popstate`): the reverse morph, focus returns to the card, `scrollY` still 1150 / 1240. Escape
  and the close link call `history.back()`, so every way out is one history step.
- Direct visit or reload of the project URL: the server serves the static project page (complete HTML,
  no JS needed). Forward after reloading Home reopened the layer from the history state.
- Found: with `history.scrollRestoration = 'manual'`, a reload of Home went to 0. Keep `auto` and do
  not touch it; the presentation is a fixed layer with its own scroller, so Home underneath never moves
  and needs no restoring. Also found: the default cross-fade of the old and new snapshots shows two
  images when their `object-fit` boxes differ (`shots/expand-desktop-mid.png`); give the group one
  image (`::view-transition-old(shot) { display: none }` or `animation: none` on old, and
  `object-fit: cover; height: 100%` on new).

**Design of the real thing.**

1. **Same-document View Transitions** for the expand (Baseline since Oct 2025: Chrome 111, Safari 18,
   Firefox 144). No library. GSAP Flip (9.4 KB + 27 KB core) or a hand FLIP (measure `getBoundingClientRect`,
   invert with a transform, play with WAAPI) only if a step of the presentation needs a morph that view
   transitions cannot do (a morph that must be interruptible mid-way: view transitions are not
   interruptible; a second click waits or skips with `transition.skipTransition()`).
2. **The presentation is a layer over Home**, not a new document: `position: fixed`, its own scroller,
   `overscroll-behavior: contain`, Home under it `inert`. This keeps Home's scroll and the cylinder's
   pose exact, and it fits "no windows that open and close": nothing slides in from outside; the image
   itself becomes the page. It is today's sheet (ADR-0007 item 4) without the dialog chrome, on phones too.
3. **URL**: `/work/<slug>/` as today, so every shared link keeps working. `pushState` on open, `popstate`
   decides open/closed (the URL decides, as ADR-0007's state machine already does).
4. **Direct visit** renders the presentation statically at `/work/<slug>/` (the existing project page,
   rebuilt to the new presentation), with a link back to `/#<slug>`. With JS it may optionally render
   Home under it and open the layer, but the static page must be complete without that.
5. **Safari edge swipe.** On iOS a swipe from the left edge plays Safari's own animation and then fires
   `popstate`; running the reverse view transition on top gives a double animation. Skip the transition
   when `event.hasUAVisualTransition` is true (Chrome 123; Safari support **unverified**: test it, item 3 in
   section 6.3).

---

## 4. The living background

### 4.1 Spike

`spike/bg.html`: five sections with their own colour triples (brief, Recto lime, English Prep sakura +
lagoon, Eat Map rose, Record blue). An IntersectionObserver on the middle 10 % of the window picks the
section in view.

- `?mode=css`: three pools (`90vmax` circles, radial gradients), each on its own transform-only CSS
  animation (23, 31, 37 s); their colours are `@property` colours that transition over 1.6 s.
- `?mode=gl&scale=`: one full-screen fragment shader (domain-warped value noise, 4 octaves, three colour
  pools mixed into the ground), its colours eased toward the section's colours each frame, drawn at a
  share of the CSS size and stretched by CSS. Raw WebGL, about 2 KB of code.
- Both: a grain tile above (SVG `feTurbulence` here; the site's `grain.png` in reality); animation
  pauses when the tab is hidden; reduced motion stops the drift.

### 4.2 Results (phone 390×844 DPR 3, CPU 4×, two runs)

| Variant | pixels shaded or blended per frame | frames/s | rAF p95 | own update p95 | GPU busy |
|---|---|---|---|---|---|
| none (ground + grain) | | 38 / 48 | 16.7 | | 6-9 % |
| CSS pools | 3 layers of 2280² px = 15.6 Mpx of layer textures (about 62 MB), blended over a 3 Mpx screen | 23 / 28 | 16.8 (first raster stalls 533-650 ms) | none | 85-86 % |
| WebGL, ¼ size | 98×211 = 0.02 Mpx shaded + one upscale | 41 / 47 | 16.8 / 50 | 1.9-2.3 ms | 16 / 58 % |
| WebGL, ½ size | 0.08 Mpx | 26 / 29 | 50-67 | 1.1-1.5 ms | 74-102 % |
| WebGL, full CSS size | 0.33 Mpx (DPR 3 native would be 3 Mpx) | 13 / 14 | 150-167 | 1.7-4 ms | 80-96 % |

Desktop 1440×900 (one run): the software GPU is the limit for every full-screen variant (none 38
frames/s; CSS 20; WebGL ¼ 18; ½ 14; full 6).

**Reading.** A smooth gradient field does not need resolution: a quarter-size canvas looks the same
once the grain sits on top, and it shades 150× fewer pixels than the screen. The CSS pools are not free
either: as written (huge `90vmax` layers) they hold about 62 MB of layer textures on a DPR 3 phone and
stall the first frame while they rasterise. Both are acceptable on a real iPhone GPU if built small;
neither should redraw when nothing changes.

### 4.3 Recommendation

- **Keep the aura in CSS and the family kit's light field**, extended: the section's colour comes from
  data (each project's `accent` / `world.json` light, which already exists), set as `@property` colours
  on the root when the section in view changes, and the pools cross-fade to it. Make pools small
  elements scaled up (the gradient is smooth), not `90vmax` layers. This keeps the no-JS and no-WebGL
  page identical in look, costs no library, and is the same concept the owner already approved
  (aura + grain, 2026-10-15 night). The light field is the Family chat's file: changes to `light.css`
  or `light.md` go through that chat (CLAUDE.md).
- **WebGL mesh gradient only as the second option**, if the owner finds the CSS pools too still:
  quarter-size canvas, `powerPreference: 'low-power'`, `antialias: false`, sharing the cylinder's
  context if both are WebGL, about 2 KB of own code (no library).
- **Battery and heat** (not measurable here): the cost on a phone is the number of frames drawn, not
  their difficulty. Rules: draw only while the page scrolls or a colour eases, then stop; the idle drift
  runs at most at the frame rate the eye needs for a 20-30 s cycle (a WebGL drift can draw at 30 fps or
  lower; a CSS transform animation costs only composition); pause on `visibilitychange`, when the
  background is covered by the presentation layer, under reduced motion (one still colour field), and
  with Save-Data. Low Power Mode caps rAF at 30 fps in iOS Safari (WebKit bug 215745, "as designed");
  treat that as a hint to switch to the still field.
- **Grain on top, unchanged**: a fixed tile above the background and under the content (today
  `z-index: 25` over everything, which also covers the background). It costs one composited layer.

---

## 5. Motion graphics production

### 5.1 HyperFrames, tried here

`hyperframes` 0.8.162 (npm, Apache-2.0, HeyGen, `github.com/heygen-com/hyperframes`): "create, preview,
and render HTML video compositions". A composition is an HTML file with a root
`data-composition-id`, `data-width`, `data-height`, timed elements (`data-start`, `data-duration`), and
paused GSAP timelines registered on `window.__timelines`; the runtime seeks the timeline frame by frame,
**headless Chrome (Puppeteer) screenshots each frame, FFmpeg encodes**. Outputs: MP4, WebM and MOV with
alpha, GIF, PNG sequence, HLS. It needs Node ≥ 22, FFmpeg and Chrome Headless Shell; a GPU is optional
(`--no-browser-gpu` uses SwiftShader). Install: 77 packages, 124 MB.

Run here: `npx hyperframes --help` works. `doctor` found FFmpeg 6.1.1 at `/usr/bin/ffmpeg` (the
Playwright build in `/opt/pw-browsers/ffmpeg-1011` has only VP8 and PNG and cannot make MP4) and wanted
Chrome; `PRODUCER_HEADLESS_SHELL_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
supplies Playwright's. Its hard guard refuses to render with under 1 GB free disk (this disk had 0.7 GB),
so the render ran on `/dev/shm` with `TMPDIR` pointed there (cleaned afterwards). A 3-second, 1280×800,
30 fps composition (two real Recto captures, a fade-and-rise, a moving glow, a line of type; GSAP 3.15
loaded locally): **90 frames rendered in 8.1 s** (capture 4.4 s, encode 2.9 s, 2 workers, software GPU),
H.264 High, yuv420p, BT.709, limited range, 378 KB at its default quality (CRF 16). Re-encoded for the web:
H.264 CRF 26 102 KB; AV1 (SVT 1.7) CRF 38 10-bit 48 KB; H.264 at 640 px wide 32 KB. Files:
`scratchpad/phase3/tech/hf/out/`, frames in `shots/hf-frame-*.png`.

Cautions: telemetry is on by default (`DO_NOT_TRACK=1` or `hyperframes telemetry disable`); `publish`
and `cloud` upload to HeyGen (never use them for unreleased work); the CLI advertises a desktop app and
AI features (TTS, transcription) that are not needed. The tool is young (0.8.x, near-daily releases):
pin a version, and keep the encode step ours (the repo's existing AV1 → HEVC → H.264 ladder, sRGB tag,
`+faststart`, ADR-0006 item 2), feeding it HyperFrames' PNG sequence or its CRF 16 master.

### 5.2 Alternatives

| Tool | Licence | Fit |
|---|---|---|
| Remotion 4.0.535 | Remotion licence: free for individuals, non-profits and companies up to 3 people; paid company licence from 4 (remotion.dev/license) | The owner qualifies for free use. React compositions, mature, same headless-Chrome + FFmpeg model. Heavier (React) than HyperFrames' plain HTML. |
| Motion Canvas 3.17.2 (2025-02) | MIT | Code-driven canvas animations with an editor; good for diagrams; releases have slowed. |
| Theatre.js 0.7.2 (2024-05) | core Apache-2.0, studio AGPL-3.0 | A keyframe editor for live web animation; no release in 2 years: avoid. |
| Live in-browser (CSS, WAAPI, OGL) | | For anything the visitor touches. |
| Real screen recordings (`npm run clip`) | | Already in the repo: the product's own UI, honest by construction. |

**Recommendation:** HyperFrames (or Remotion, both free for this owner) offline, for composed loops;
the repo's own encoder for delivery. HyperFrames suits an agent workflow (plain HTML, GSAP the agents
already know, a `lint` and `snapshot` step to check frames).

### 5.3 Pre-rendered video or live animation

- **Pre-rendered video**: the product demo loops inside a presentation (a sequence of real screens,
  type over them, a cursor doing the gesture), the hero moment of each product, anything composed with
  many layers, blur or text animation that would cost the phone more live than as decoded video. Video
  decode is hardware on every iPhone; it is the cheapest motion per pixel.
- **Live DOM / CSS / WebGL**: everything that answers the visitor: the cylinder's turn, the expand, the
  section colours, scroll-linked steps of the presentation (Dia / Notion Calendar step through on scroll:
  each step is DOM with its still capture, the motion between steps a CSS or view transition), hover and
  press states, and all text that must be readable, selectable and translated later.
- **Per step, both**: the step's still capture first (it is also the reduced-motion and Low Power twin),
  its loop on top when it is in view and playback is allowed.

### 5.4 Video budget on phones

Reference, the repo's own signature clips (`content/projects/*/captures/`): English Prep phone cut
390×844 133-210 KB (AV1 135, HEVC 133, H.264 210); English Prep desktop 233-575 KB; Recto desktop
(2x) 462-596 KB.

Proposed budget (owner to confirm): a phone loop at most 6-8 s, at most 300 KB in its best codec
(H.264 fallback at most 450 KB); a desktop loop at most 600 KB; at most one playing at a time; nothing
before the presentation opens (posters only on Home; the cylinder uses stills, 40-80 KB AVIF each, lazy
after the first); about 1.5 MB per opened presentation on a phone. AV1 decodes in hardware only on newer
iPhones (15 Pro and later, unverified), so HEVC must stay second in the ladder, as it is.

---

## 6. iPhone Safari risks and the lab test plan

### 6.1 Risks this machine cannot test

1. **Scroll-linked motion.** Scroll-driven CSS needs Safari 26; iOS 18 gets the JS path (a rAF reading
   `scrollY` can lag Safari's threaded scroll by a frame: visible as a shiver of the pinned ring).
   Safari's address bar collapses and changes `innerHeight` during scroll: size the sticky stage with
   `svh`, never with `innerHeight`, and do not relayout on `resize` mid-scroll.
2. **Pinned sections.** `position: sticky` is safe; JS pinning (ScrollTrigger `pin`, `normalizeScroll`)
   is the classic iOS jitter source and is not proposed.
3. **3D in WebKit.** `overflow: hidden`, `filter`, `opacity < 1` or `mix-blend-mode` on an element that
   has `transform-style: preserve-3d` flattens it; keep the ring free of those (the stage may clip).
   Large 3D-transformed layers and many composited layers raise memory: WebKit kills a tab that crosses
   its per-tab limit (the page reloads; observed on older iPhones around 1-1.5 GB, unverified).
   `plus-lighter` media inside a 3D ring is untested in WebKit.
4. **WebGL context loss**: on backgrounding, memory pressure, or too many contexts. Handle
   `webglcontextlost` (prevent default, show the CSS fallback) and `webglcontextrestored` (rebuild
   textures). Use one context for the whole page.
5. **Low Power Mode**: rAF capped at 30 fps (WebKit bug 215745); `video.play()` may be refused (the repo
   already treats a rejected `play()` as poster-only, ADR-0006 item 6). There is no API that reports
   Low Power Mode; infer it from a measured rAF near 30 fps or a rejected `play()`.
6. **Autoplay**: allowed for `muted playsinline` video without audio; one at a time; a `play()` promise
   that rejects must leave the poster.
7. **View transitions in Safari**: same-document since 18.0; snapshots of large images cost memory on a
   phone; the edge-swipe double animation (section 3, item 5) is the most likely visible bug.
8. **Thermal**: a full-screen canvas redrawn at 60 fps for minutes warms an iPhone; the stop-when-still
   rule in 4.3 is the fix, and it can only be felt on the device.
9. **Reduced motion and Save-Data** work in Safari; Safari has no Save-Data header (unverified), so
   respect `prefers-reduced-data` where present and Low Power as above.

### 6.2 Lab page

`src/pages/lab/work-motion.astro` (noindex, unlinked, out of the sitemap, as the lab rule says) with:
the brief, the cylinder, one expandable project (`/lab/work-motion/recto/` as its URL) and the five
colour sections; a small panel of links: `?cyl=css|css6|gl&dpr=1|2`, `?bg=css|gl&scale=0.25`; and a HUD
(toggled by `?hud=1`) showing the median and worst frame interval over the last 2 s, frames over 25 ms,
WebGL context state (live / lost / restored / none), `prefers-reduced-motion`, and whether the last
`play()` was refused. The owner sends a screenshot of the HUD after each step.

### 6.3 Steps for the owner on the iPhone

1. Open the lab with `?cyl=css`, scroll Work quickly down and up three times. Note the HUD and whether
   the ring ever shivers or jumps. Repeat with `css6` and `gl` (`dpr=2`). Say which one looks right.
2. Scroll slowly so the address bar hides and shows. The ring and the colour must not jump.
3. Tap a project. Then close it three ways: the close link, a swipe from the left edge, and Back in the
   toolbar. Each time: one smooth animation, the same card in front, the same place on the page.
4. Copy the project's URL and open it in a new tab: the presentation must appear complete.
5. Leave the page open, lock the phone for 30 s, unlock; then switch to another app and back. The
   cylinder must still draw (HUD: context live or restored).
6. Turn on Low Power Mode (Control Centre). Reload. The HUD should show about 33 ms frames; the
   presentation's video should show its still. Say whether the page still feels alive enough.
7. Settings > Accessibility > Motion > Reduce Motion on. Reload: no drift, no turn, a still list;
   everything must still be reachable.
8. Rotate the phone in Work and in an open presentation.
9. Stay on Home with `?bg=gl` for 3 minutes, then with `?bg=css` for 3 minutes: say whether the phone
   gets warm in either.
10. If a Mac is available: Safari > Develop > [the iPhone] > Timelines, record step 1, and send the
    export (this gives real frame times and memory).

---

## 7. Decisions this design would supersede or change (list only; nothing edited)

**ADRs**

- **ADR-0007** (every tab is a page; four tabs; the sheet as a `<dialog>` at ≥ 900 px; phones get the
  project page): two pages; the project expands in place on every width; `/work/` and `/about/` go
  (GitHub Pages has no redirects: a meta-refresh page per old URL); the 21 navigation scenarios
  (`tests/e2e/nav.spec.ts`) need rewriting. Item 3 (the droplet melt between tabs) changes with it.
- **ADR-0010** (Work: one screen-tall section per project, one stage in motion) and **ADR-0014** (Work
  chapters, pinned reels in platform frames, the line-up): replaced by the Work cylinder on Home and the
  stepped presentation.
- **ADR-0012** (embassies: four bands in one article): the presentation becomes a stepped walk through
  the product; the world data (`world.json`, the kit's light) can stay, the band structure changes.
- **ADR-0003** (direction D: one signature object) and **ADR-0005** item 1 (one object per tab, changing
  into the next): open if the new Home has no object or not one per page.
- **ADR-0006**: items 5 (droplet tab change) and 6 (tiers per page) change; item 7 and the 2026-10-11
  decline of real-time 3D are about objects, but a WebGL cylinder or background is real-time rendering
  on the main page: a new ADR has to say that this is images and light, not objects.
- **ADR-0001** item 2 ("no three.js and no framework runtime on the main path; three.js as a separate,
  capability-gated chunk"): amend to OGL (or raw WebGL) as the capability-gated chunk. Item 3 (CSS,
  scroll-driven, View Transitions first; GSAP only where a timeline is needed) stays as is.
- **ADR-0002** items 1 and 3: About as its own page goes; "phones get a fixed, lighter one" conflicts with
  the owner's equal phone and desktop. Item 1 for projects and entries stays (static project pages).
- **ADR-0008** (About ID card and postcards): needs a new home if About is removed.
- **ADR-0011 / ADR-0013** (the rail on every page and in the sheet): stays, but must work inside the
  presentation layer and with Home's new sections.
- **ADR-0016** (graphite is the one live theme; the palette gate): colour grounds per section mean text
  sits on several grounds and a moving aura; the gate must measure every section ground at the aura's
  brightest point.
- **ADR-0009** (rejected live frames): unaffected, but cite it so a reader does not take the WebGL
  cylinder for its return.

**CLAUDE.md and other rules**

- "Objects are pre-rendered media (ADR-0006) ... The routing contract is ADR-0007": both references
  change.
- "Every effect has a still twin: reduced motion, no JS, no WebGL and phones get a complete page":
  stays and becomes the main constraint; phones get the full effect, not a lighter one (ADR-0002 item 3).
- The size budget (`tests/budget.mjs`, 200 KB first paint): keep, and add a second budget for what loads
  after first paint (the WebGL chunk, the cylinder stills, a presentation's video), which today is
  unchecked.
- `docs/family-kit/light.css` / `springs.js`: the per-section aura colour probably needs a kit change;
  that is the Family chat's file, not this chat's.
- `README.md` routes and "Where things are" (Work, About pages, `sheet.ts`, `reel.ts`, `card3d.ts`).
- Brief lines this design overrides (newest wins, but the brief log should record it): "Home is simple
  and CV-like" (2026-10-15, same day, earlier); "Home is a showcase, Work the full catalogue" (2026-10-09);
  "Work is a page that grows downward, each project starting within its own screen height" (2026-10-09);
  "One object per tab that changes into the next" (2026-10-09); "radical per-page worlds shelved"
  (2026-10-10) may be read against per-section grounds. "No loading screen" (2026-10-15) stays and rules
  out gating first paint on WebGL or video.

---

## Files

- Spikes: `scratchpad/phase3/tech/spike/` (`css-cylinder.html`, `gl-cylinder.html`, `bg.html`,
  `expand.html`, `work/recto.html`, `ogl.mjs`, `img/`).
- Harness and checks: `scratchpad/phase3/tech/measure.mjs`, `check-expand.mjs`, `check-css.mjs`.
- Raw results: `results-phone-v2.txt` (phone, valid), `results-cylinder.jsonl` and
  `results-cylinder-repeat.txt` (desktop lines valid; first phone lines did not scroll), `results-bg.jsonl`
  (desktop lines valid).
- Bundle sizes: `scratchpad/phase3/tech/size/`.
- HyperFrames: `scratchpad/phase3/tech/hf/demo/index.html`, `hf/out/*.mp4` (its `node_modules` were
  removed afterwards for disk space; reinstall with `npm install hyperframes@0.8.162`).
- Screenshots: `scratchpad/phase3/tech/shots/`.

## Sources

- WebKit, "WebKit Features in Safari 26.0": https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- WebKit, "A guide to Scroll-driven Animations with just CSS": https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/
- Chrome for Developers, scroll-driven animations: https://developer.chrome.com/docs/css-ui/scroll-driven-animations
- buildmvpfast, "CSS scroll-driven animations go cross-browser" (secondary; Safari 26.4/26.5 claims unverified): https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026
- web.dev, "Same-document view transitions are now Baseline newly available" (2025-10-16): https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
- Chrome for Developers, cross-document view transitions: https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- Webflow, "GSAP becomes free": https://webflow.com/blog/gsap-becomes-free ; GSAP Standard License (not reachable from here): https://gsap.com/standard-license ; mirror of the 2025 text: https://open.windriver.com/info/uni-license-list/licenses/gsap-standard-no-charge-2025.html
- Remotion licence: https://www.remotion.dev/docs/license/faq and https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- HyperFrames overviews (secondary): https://themenonlab.blog/blog/heygen-hyperframes-video-as-code , https://silenceper.com/en/article/2026-05-02-hyperframes-html-video-rendering/ ; primary facts from the installed CLI 0.8.162 (`--help`, `docs`, `doctor`, the render above)
- WebKit bug 215745 (rAF at 30 fps in Low Power Mode, as designed): https://bugs.webkit.org/show_bug.cgi?id=215745
- Lenis README (installed 1.3.27): Safari capped at 60 fps, 30 fps in Low Power Mode; `syncTouch` unstable on iOS < 16
- Motion changelog: https://motion.dev/changelog (14.x notes not found by search; versions from npm)
