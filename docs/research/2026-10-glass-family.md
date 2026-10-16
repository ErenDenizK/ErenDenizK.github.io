# Glass study (round 4, row V7)

Status: research, 2026-10-16. Read-only against `lane/review-r3` (cac4614). Measured in headless
Chromium (software compositor, SwiftShader WebGL) at 1440x900 (DPR 1) and 390x844 (DPR 3, touch).
Images: `round4/glass-img/`. Prototype sources and raw numbers: `round4/glass-proto/`.

## 1. What exists now

There is already one recipe. `src/one/tokens.css` defines `--glass-bg` (rgb 30 30 34 / 0.62),
`--glass-blur` (blur 22px, saturate 1.5), `--glass-edge` (1 px inset ring at 7 % white plus a 1 px
top line at 5 %) and `--glass-shadow`. The tab pill (`src/one/Bar.astro .tabs`), the layer capsules
(`src/one/work/work.css .glass`, `.cursor-x`) and the photo view capsules
(`src/one/rest/Postcards.astro .pv-glass`, `.pv-cursor`) all use it. The difference the owner sees
comes from three facts, not from two recipes:

1. The tab has the active bed `.ind`: 8 % white with a radial `--a1` glow at 34 % rising from below.
   `--a1` cross-fades with the section (`field.css`), so the tab's light changes with the aura. The
   capsules have no such light; their only colour is the lime fill of the primary action.
2. The tab sits at the top, over the field's brightest pool (p1 at y -6 %). Its backdrop is aura
   colour. Once the page moves, the bar band (`.bar::before`) darkens the area, and the tab sits on
   flat ground (see `live-tab-sheet.png`: rows 1-3 are scrolled, row 4 is the top).
3. The capsules sit over real content (screenshots, white PDF pages, photos), so they are the ones
   that must survive light backgrounds.

### Measured defect in the current recipe

Over a white page (Recto's PDF in the project page, the Bostanci photo's sky) the current glass
lands at about 110/255 grey. Label contrast there (`contrast.py`, median glass colour beside the
label):

| Label colour | Current, white behind | Target |
|---|---|---|
| `--ink` (active tab, capsule labels) | 3.9:1 | 4.5:1 |
| `--ink-2` (Close label) | 3.2:1 | 4.5:1 |
| `--ink-3` (inactive tab "Record") | 1.9:1 | 4.5:1 |

The inactive tab label nearly disappears over white (`cmp-d-tab.png`, row 2, column 1). Over dark
content all labels are above 5.7:1.

A second, smaller fact: on the static project page (`/lab/one/work/recto/`) `--a1` stays at the
house blue (#6f8cff), so any aura-lit glass there is blue, not Recto's green. Inside the home layer
the field sets the project's pigments (the green rim in `zoom-live-p.png`, row 2). The builder should
set the project's set on the static page too, or the family's light is wrong there.

## 2. The family (what each takes from the other)

- From the capsules: the minimal dark body, one height, no extra chrome.
- From the tab: the aura-coloured light, but moved from one bed to every glass object, and made
  physical: light enters from above (a white rim and a faint specular band inside the top edge) and
  gathers at the lower inner edge in the current aura (a 1 px aura rim and a soft caustic).
- New: the body is lighter, and the backdrop is dimmed before the tint. Dark content barely changes;
  white content lands near 85/255, so every label passes.

## 3. The three versions

All three share the tokens below and were tested as `html[data-glass=A|B|C]` switches, first in
`proto.html` over real screenshot strips (scrolling, so the glass passes over aura, white PDF, photos
and large display type), then injected into the built live page (home top, home moved, project page,
photo view).

### A: CSS only, refined

- Body `rgb(22 22 26 / 0.56)`, backdrop `blur(24px) saturate(1.8) brightness(0.5)`.
- Rim: a 1 px ring cut by a mask from a vertical gradient: 17 % white at the top, 3.5 % on the sides,
  `--a1` at 42 % at the bottom. No border, no layout change.
- Light: `--g-caustic` (inset shadow, `--a1` 34 %, inside the lower edge), `--g-spec` (inset, 7 % white,
  inside the upper edge), a faint `--a1` 15 % radial glow in the body, the tab bed at 36 %.
- Separation: a 0.5 px dark hairline outside and a softer two-step drop shadow.
- Capsule hover beds take the tab bed's aura light, so a pressed capsule item reads like the tab.
- Inactive tab label becomes `--ink-2`: over white `--ink-3` cannot reach 3:1 on any glass light
  enough to read as glass (2.8:1 measured with A); the bed and `--ink` still mark the current page.
- `prefers-reduced-transparency`: near-opaque body, no blur. `forced-colors`: rim removed.

Calibration note: in Chromium the blurred, dimmed backdrop does not follow simple arithmetic
(`brightness(0.5)` alone gives 128 over white, but after `blur(24px)` it gives 165). The body alpha was
therefore found by a sweep over white (`cal.html`): 0.56 with brightness 0.5 gives 85/255. This must be
re-checked in Safari on a real phone, where the compositor differs.

### B: A + SVG displacement rim

`glass-b.js` draws one displacement map per object on a 2D canvas (inward pill normal in R/G, scaled
by (1 - d/14)^2 inside a 14 px rim band, neutral 128 elsewhere), feeds it through `feImage` into
`feDisplacementMap` (scale 40), and sets `backdrop-filter: url(#lens) blur(12px) ...`. A
ResizeObserver redraws the map when a capsule folds. The blur must drop to about 12 px or the bend is
invisible; that lets more of the content read through. `feTurbulence` was considered and rejected: it
gives a frosted wobble, not a lens edge, and adds a per-pixel noise pass.

Result: the bend shows only where a hard edge crosses the rim (the "Recto" letters in `zoom.png`,
row 3, right). Over the aura, photos and flat ground it looks the same as A.

### C: WebGL lens

`glass-c.js`, two modes:

- full (prototype only): one viewport canvas draws the whole glass from a known background texture:
  pre-blurred and sharp copies of the strip, a rim refraction with a small chromatic split (1.0 / 1.08 /
  1.16), tint, aura rim, caustic and specular. It is the most convincing glass (`zoom.png`, row 4)
  and it also blurs display type completely. It cannot ship on the live page: WebGL cannot read DOM
  pixels. It could only refract what the shader draws itself (the field's pools, which are analytic).
- light (live page): A stays as the body; one small canvas per object adds the caustic and the
  specular arc with `plus-lighter`. Gated on WebGL without a major performance caveat and not a
  software renderer (the measurements force it on).

Result: in light mode the visible gain over A is small once A carries the caustic in CSS
(`zoom-live-p.png`, columns 2 and 3).

## 4. Measurements

### Label contrast over white (desktop / phone)

| | `--ink` | `--ink-2` | `--ink-3` |
|---|---|---|---|
| current | 3.9 / 4.0 | 3.2 / 3.3 | 1.9 / 1.9 |
| A | 5.8 / 6.2 (caps 5.7 / 6.8) | 4.8 / 5.1 (caps 4.7 / 5.6) | 2.8 / 2.9 |
| B | 6.2 / 7.4 | 5.1 / 6.1 | 2.9 / 3.5 |
| C full | 6.6 / 6.7 | 5.4 / 5.5 | 3.1 / 3.2 |

Over the aura (dark), the A body reads (23 25 40) against the current (33 36 53): the aura comes
through about 25 % dimmer. The rim, caustic and glow carry the light instead; in the images A reads
as more lit, not less.

### Frame cost, 3 s scripted scroll, CPU throttled 4x (trace: viz `DirectRenderer::DrawFrame`, renderer
`ProxyMain::BeginMainFrame`), final A

| | Draw mean / p95 (ms) | Main mean / p95 (ms) | Frames |
|---|---|---|---|
| 1440 proto, current | 9.31 / 12.71 | 3.13 / 4.82 | 178 |
| 1440 proto, A | 9.06 / 12.45 | 2.93 / 4.42 | 180 |
| 1440 live, current | 32.44 / 53.13 | 7.72 / 14.46 | 89 |
| 1440 live, A | 32.55 / 50.82 | 8.14 / 16.16 | 88 |
| 390 proto, current | 4.92 / 6.65 | 3.03 / 4.43 | 179 |
| 390 proto, A | 5.23 / 7.21 | 3.13 / 4.97 | 178 |
| 390 live, current | 12.27 / 31.36 | 10.18 / 20.43 | 161 |
| 390 live, A | 12.45 / 31.11 | 10.94 / 25.21 | 158 |

First pass, all versions (before the CSS caustic was added; `trace-summary.txt`):

| | 1440 proto draw / main | 390 proto draw / main | 390 live frames, main mean |
|---|---|---|---|
| B | 9.17 / 3.40 | 5.01 / 3.09 | 153, 11.50 |
| C | 13.01 / 25.75 (115 frames) | 3.52 / 55.98 (57 frames) | 136, 25.20 |

Reading: A and B cost the same as the current glass within noise. C costs 2 to 5 times the main
thread in software WebGL (C full at DPR 3: 18 fps). On a real GPU C light would be cheaper, but it
still adds one WebGL context per object and a rAF loop. The 1440 live page itself draws at about
32 ms per frame in software, independent of glass; that is a separate finding for the motion lane
(the software compositor exaggerates it; check on a real GPU before acting). rAF-only numbers are in
`perf.json`.

### Weight (gzip -9)

| | Raw | Gzip |
|---|---|---|
| A, `glass.css` (includes the B and C hooks) | 4.9 KB | 1.9 KB |
| B, `glass-b.js` | 3.0 KB | 1.4 KB |
| C, `glass-c.js` | 9.7 KB | 3.8 KB |

Production A is smaller: it replaces the four `--glass-*` tokens and adds one `::before` rule.

## 5. Browser support (from knowledge, not tested here; uncertain items marked)

- `backdrop-filter` with blur/saturate/brightness: Chrome/Edge, Firefox (103+), Safari (unprefixed
  from 18; the `-webkit-` form earlier). Safe.
- `backdrop-filter: url(#svg-filter)`: renders in Chromium only. Safari and Firefox do not apply it
  (uncertain whether they drop the whole declaration or only the url(); B keeps a separate
  `-webkit-backdrop-filter` with the A chain, and the script gates on `userAgentData` Chromium brands).
  The owner's iPhone would never see B.
- `color-mix(in oklab, ...)`: Safari 16.2+, Chrome 111+, Firefox 113+. Safe.
- `mask-composite: exclude` (standard) with `-webkit-mask-composite: xor`: both are written. Safe.
- `prefers-reduced-transparency`: Chromium 118+; Safari and Firefox support uncertain (Firefox behind a
  flag as far as known). Harmless where unsupported.
- 0.5 px box-shadow spread: drawn as a hairline on DPR 2-3; on DPR 1 Chromium rounds it (it read as
  1 px in the 1440 shots). Uncertain on Safari DPR 1.
- WebGL `failIfMajorPerformanceCaveat` and `WEBGL_debug_renderer_info`: Safari masks the renderer
  string (uncertain since Safari 17), so a GPU gate on iOS is weak.
- The blur-then-brightness result differs between compositors (section 3, A). Uncertain on Safari:
  measure on the phone.

## 6. Recommendation: A

A takes the tab's aura light and the capsules' minimal body into one family, fixes the white-content
contrast (inactive tab from 1.9:1 to readable `--ink-2` at 4.8:1; capsule labels from 3.9 to 5.7:1),
and costs nothing measurable. B's refraction is visible only on hard edges, only in Chromium, and
needs a weaker blur. C's real refraction cannot see the DOM; its light mode is nearly matched by A's
CSS caustic. Keep B and C as lab switches (`?glass=B|C`) for the owner to judge on a real device, not
as the shipped default.

Proposed tokens (replace the four `--glass-*` values in `src/one/tokens.css`; keep `--glass-pad`,
`--glass-item`, `--glass-gap`):

```css
--glass-bg: rgb(22 22 26 / 0.56);
--glass-blur: blur(24px) saturate(1.8) brightness(0.5);
--glass-rim: linear-gradient(180deg, rgb(255 255 255 / 0.17) 0%, rgb(255 255 255 / 0.035) 34%,
  rgb(255 255 255 / 0.035) 62%, color-mix(in oklab, var(--a1) 42%, transparent) 100%);
--glass-glow: color-mix(in oklab, var(--a1) 15%, transparent);      /* body */
--glass-glow-on: color-mix(in oklab, var(--a1) 36%, transparent);   /* active tab bed, hover beds 24 % */
--glass-edge: inset 0 -9px 12px -9px color-mix(in oklab, var(--a1) 34%, transparent),
  inset 0 8px 10px -9px rgb(255 255 255 / 0.07), 0 0 0 0.5px rgb(0 0 0 / 0.38);
--glass-shadow: 0 1px 2px rgb(0 0 0 / 0.22), 0 12px 32px -14px rgb(0 0 0 / 0.66);
```

Build notes for the lane that ships it:

1. One shared rule (or a `.glass-obj` utility) for `.tabs`, `.glass`, `.pv-glass`, `.cursor-x`,
   `.pv-cursor`: background `radial-gradient(70% 110% at 50% 150%, var(--glass-glow), transparent 72%),
   var(--glass-bg)`; the rim as a masked `::before` (see `glass-proto/glass.css`). Postcards.astro
   repeats the old values as `var()` fallbacks; update or drop them.
2. Inactive tab label `--ink-2`.
3. Set the project's aura set on the static project page so the rim is the project's colour.
4. Check the tab after the page moves: the band flattens it. A slightly lower band opacity behind the
   tab (or a band that starts below the pill) would keep the aura behind the glass; that is a taste
   question for the owner.
5. Re-measure contrast and the dimmed backdrop in Safari on a real phone.

## Images

- `live-tab-sheet.png`: current tab at four scroll depths, 1440 and 390.
- `live-home-top-d.png`, `live-project-d.png`, `live-caps-p.png`: current state.
- `cmp-d-tab.png`, `cmp-d-caps.png`, `cmp-p-tab.png`, `cmp-p-caps.png`: prototype over screenshots;
  columns current, A, B, C full; rows aura, tab over white, capsules over white.
- `zoom.png`: phone tab over the aura (left) and desktop tab over the "Recto" display type (right);
  rows current, A, B, C full.
- `live-d.png`, `live-p.png`: injected into the live page; columns current, A, B, C light; rows home
  top, home moved, project capsules, project capsules over light content, photo view capsules.
- `zoom-live-p.png`: phone, live; columns current, A, C light.
- `d-home-full-A.png`, `d-project-full-A.png`, `p-project-full-A.png`, `p-photo-full-A.png`: A in place.
