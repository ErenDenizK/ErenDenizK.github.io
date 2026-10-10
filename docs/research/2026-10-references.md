# Research: design references (2026-10-08)

**Status:** history. Early references for the first prototypes.

The researcher's fetch tool reached only github.com, so liveness is marked:
**[GH]** repo opened, **[S]** described live in 2025–26 sources, **[K]** prior knowledge,
not re-checked. Open [K] links in a browser before citing them.

## 1. Explorable 3D worlds

- **bruno-simon.com** [GH, S] — 2025 rebuild; achievements and secrets give people a reason
  to explore. MIT, Blender files included (`brunosimon/folio-2025`). Three.js WebGPU + TSL,
  glTF-Transform, KTX2. Heavy; steal the pipeline, not the car.
- **henryheffernan.com** [GH] — 3D desk; zoom into the monitor and a usable 2D "OS" runs
  inside it. A 3D shell around a normal UI. Weak on phones; widely copied.
- **messenger.abeto.co** [S] — tiny planet walkable in ~30 s. Diorama scale gives a world
  feel without a big map. Runs well on mobile.
- **igloo.inc** [S] — Awwwards SOTY 2024; icy refraction, very fast loading. The bar for
  performance.
- **jesse-zhou.com** [S/K] — walk-in ramen shop; departments are props in one cosy diorama;
  got the author engineering offers.
- **Thibault Introvigne** [S] — Awwwards HM Dec 2025; current student-level benchmark.
- **Room portfolios** [S] — one baked room, 4–6 camera stops, each opens a panel. Cheap and
  proven; needs a strong twist.

## 2. 2D / 2.5D spatial

- **os.ryo.lu** [S] — desktop OS in the browser; windows as "panels instead of pages".
- **rauno.me** [S] — dock, sound, a "craft" page of interaction studies.
- **Infinite canvas pattern** [S] — cards on a pannable grid, viewport culling, seeded
  layout; DOM only. Needs a list view and keyboard focus.

## 3. Minimal, one signature move

- **brittanychiang.com** [K] — two columns, sticky nav, cursor spotlight. Cloned a lot.
- **joshwcomeau.com** [S] — interactive widgets in posts; the model for the "how it works"
  layer of a case study.
- **paco.me, emilkowal.ski** [K] — tiny, calm, one delightful detail.

## 4. Glass, refraction, light, aura

- **Maxime Heckel, refraction and dispersion** [S] — step-by-step glass-with-light shaders.
- **lusion.co** [S] — soft light and physics; quality bar.
- **Stripe-style mesh gradient** [S] — cheap animated aura in ~1 KB of shader.
- **The owner's own auras** — English Prep (3 clusters × 3 pigments, one opacity cap,
  reduced-motion pools) and Recto ADR-0025 (in-house fbm shader at 1/8 size, still by
  default, motion as an event).

## 5. Low-level themes that stay tasteful

- **visual6502.org/JSSim** [S] — a real 6502 die, polygons lit by logic state.
- **ciechanow.ski** [K] — explorable explanations of hardware; draggable diagrams.
- **cpu.land** [K] — long-form CPU explainer; tone for long log entries.
- **"CircuitOS"-style GitHub portfolios** [S] — anti-reference: literal breadboards and
  IC-shaped cards are where hardware theming becomes costume.

## 6. Logs, journals, "now"

- **til.simonwillison.net** + weeknotes [S] — short / medium / long tiers from a repo.
- **maggieappleton.com** [K] — seedling / budding / evergreen notes with dates.
- **sive.rs/now** [S] — a dated "now" page.
- **Product changelogs** (Linear style) [K] — versioned, dated entries with one image.

## Galleries

Awwwards (Portfolio, Three.js, WebGL collections), Codrops, three.js forum Showcase, GitHub
topics `3d-portfolio` / `threejs-portfolio`, godly.website, siteinspire.

## Concept directions (researcher's synthesis)

- **A. The Die** — the site as a CPU floorplan under a glass lid with aura light leaking out;
  zoom package → die → blocks (cores = projects, cache = log, control unit = about, I/O =
  contact). Personal and cheap (SVG/DOM + optional WebGL); risks clip-art if drawn badly.
  Phone: fixed mini-map + stacked glass cards + bottom sheets.
- **B. Glass Lab** — one lit 3D diorama; each department a glass object with coloured light
  behind it. Strongest first impression; GPU-hungry, Blender work, template risk. Phone:
  fixed camera, swipe between stations, cheaper glass.
- **C. Workbench Canvas** — 2D pannable zones of frosted cards over aura fields; log as a
  timeline strip. Cheapest, accessible, grows naturally; can feel aimless. Phone: snapping
  zones.
- **D. Quiet type + one living object** — editorial site, one glass object reacting to the
  cursor, projects expanding in place. Fastest, most recruiter-proof; less "world".

Suggested synthesis: D as the always-working HTML content layer, progressively enhanced on
desktop into A or B over the same data; phones get the fixed version.
