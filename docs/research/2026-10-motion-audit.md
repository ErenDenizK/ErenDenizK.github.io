# Motion-feel and rhythm audit of /lab/one/ (round 2 input)

Status: measured 2026-10-16 on `lane/review-plan` at 003f160 (worktree build, `node tests/serve.mjs dist 4731 /`).
Rows covered: M1, M2, M4, G5, G6, W6, O3 (and W7, O2 where the numbers touch them).
Author role: motion-feel and rhythm auditor (read-only). Nothing in the repo was changed.

## 0. Rig and its limits

- Headless Chromium 141 (Playwright 1.56.1, `chromium-1194`), no GPU: raster runs in software. Absolute
  frame times are worse than on a real laptop or phone. Read the numbers as **relative** (A/B ablations
  on the same rig, same run length). Noise between two identical baseline runs: fps 32.8 / 32.7,
  p90 83 / 100 ms, frames > 50 ms 91 / 72.
- CPU throttle 4x (`Emulation.setCPUThrottlingRate`) unless stated. Viewports 1440x900 (DPR 1) and
  390x844 (DPR 2, touch, mobile).
- "Steady 800 px/s scroll": a rAF loop sets `scrollTo(0, t * 0.8)` from wall time, so a missed frame
  shows as a jump, as a real input stream does. A second driver sends wheel notches (100 px, 8 per s).
- Chromium has `animation-timeline: scroll()`, so `src/one/scripts/scrub.ts` (the fallback writer) is
  idle in every run. Its cost on Firefox / iOS 18 is not measured here; by code reading it is one
  `--p` write per scene per frame, and there is only one scene (the plate).
- Probes and raw output (keep for round 2): `scratchpad/round2/probe/` (`scroll.mjs`, `oil.mjs`,
  `layer.mjs`, `layers.mjs`, `rhythm.mjs`, `res-*.json`, `trace-wide-4x-prog.json`,
  `frames-wide/` = 240 screencast frames of the steady scroll, `sheet-work-wide.jpg`,
  `sheet-screens-{wide,phone}.jpg`, `abl-{wide,phone}.txt`). Spike: `scratchpad/round2/spike/oil.html`.

## 1. Baseline: what a steady scroll costs today

| Run (4x CPU) | fps | p50 ms | p90 ms | p99 ms | frames > 50 ms | max jump px | long animation frames |
|---|---|---|---|---|---|---|---|
| 1440, prog. scroll | 32.8 | 33.4 | 83.4 | 233 | 91 | 213 | 98 |
| 1440, 1x CPU | 37.8 | 33.4 | 83.3 | 133 | 82 | 160 | 93 |
| 390, prog. scroll | (n/a) | 16.7 | 33.4 | 117 | 57 | 200 | 61 |
| 1440, `?still` (no motion at all) | 82 | 16.7 | 33.3 | | 9 | 107 | 9 |

Per section at 1440 (mean frame ms / frames > 50 ms): Work 52.7 / 34, the person's part 46.4 / 51.
The cost is not local to the deck: the whole page pays it.

Trace of the 11 s run at 1440 (main thread, ms summed): **UpdateLayoutTree 5,163 ms** (595 recalcs),
RasterTask 6,845 ms (all threads), FunctionCall 4,347, EventDispatch 3,112, Paint 362, Layout 303,
Layerize 363. 37 of the 595 style recalcs touched 600 to 672 elements (the whole document) and took
3,372 ms together (about 91 ms each). The deck's own frame function costs 95 ms in total.

The script that looks guilty in the long-animation-frame entries is the shell's
`classList.toggle('moved', scrollY > 8)` handler (2,889 ms over 170 calls). It is the victim: reading
`scrollY` forces the pending style recalc, so it pays for whatever dirtied the whole document.

## 2. Why it catches (M1, M2): causes, in order of weight

### 2.1 Whole-document style recalc during every aura cross-fade (largest)

`--a1 --a2 --a3 --n1` are `@property` colours with `inherits: true`, set on `:root`, with a 500 to
1100 ms transition (`field.css` line 9, `bus.ts setAura`). Every frame of a transition changes an
inherited value on the root, so every element recomputes style. `setAura` runs on each section change
(field.ts) and on every deck pin, unpin and project swap (deck.ts, `ms: 500`).

Ablation, CSS `:root { transition: none }` only:
- 1440: p90 83 to 50 ms, frames > 50 ms 91 to 58.
- 390: fps 75 to 95, frames > 50 ms 57 to **16**, long animation frames 61 to 10.

### 2.2 The field forces document-size layers

Four pools, `mix-blend-mode: plus-lighter`, scaled 1.9x to 3.1x, with an infinite drift; and the glass
objects in `main` blend `plus-lighter` against the field through a main that is no stacking context.
Every content box that overlaps an animated, blended fixed layer must be composited ("Overlap"):

| Largest drawing layers at scroll 1,500 | 1440 | 390 |
|---|---|---|
| `#document` (root scroller, twice) | 1440 x 9556, 10.6 viewports each | 390 x 10482, 12.4 each |
| `div.plates` (Overlap: squashes the page after it) | 1440 x 9556, **10.6 viewports** | 12.4 viewports |
| `section.rest` (Overlap) | 4.3 viewports | 6.1 viewports |
| pool `<i>` layers (scaled) | 1.3, 0.8, 0.7, 0.6 | 1.9, 1.2, 1.1 |
| sticky `.txt`, `.w-chrome` (full view each) | 1.3, 1.0 | 1.7 |

Total drawing layer area: 34.8 to 51.2 viewports at 1440 (44 to 73 layers), 44.7 to 65.6 viewports at
390 (39 to 57 layers). At DPR 2 a phone has to keep tiles for a 10,000 px tall overlap layer.

Ablation, drift off + blend off + no root transition ("fixA"):
- 1440: fps 32.8 to **58.8**, p90 83 to 50 ms, frames > 50 ms 91 to 37, long frames 98 to 29.
- 390: frames > 50 ms 57 to **6**, p90 33.4 to **16.8** ms.
Each alone gives less (drift off 1440: 42 fps; blend off: 33.6 fps): the cost is the combination.
Grain off and backdrop-filter off change nothing (32.7 / 32.4 fps). Removing Work entirely gives only
38.2 fps: the deck's JavaScript is not the cause of the jank; its **design** is (2.4).

### 2.3 Wheel input arrives in steps (the "catch" a person feels even at 60 fps)

Wheel notches of 100 px at 8 per s, per-frame scroll delta:

| Page, 4x CPU | frames with no movement while scrolling | largest step | step variation (sd / mean) | p90 frame |
|---|---|---|---|---|
| /lab/one/ today | **71 %** | 100 px | 1.56 | 167 ms |
| spike, native scroll | 89 % | 100 px | 2.84 | 16.7 ms |
| spike, own lerp (0.1) | **0 %** | 19 px | 0.35 | 16.7 ms |
| spike, Lenis 1.3.27 (lerp 0.1) | 4 % | 22 px | 0.41 | 16.7 ms |
| spike, own lerp + CSS view timelines | 0 % | 26 px | 0.36 | 16.7 ms |

Even a page with no jank moves in 100 px jumps with a 7-frame pause between them on a notched wheel.
That is the opposite of "floating on a pond". (A trackpad sends finer deltas; the jump is smaller but
still unsmoothed.)

### 2.4 The deck: dead scroll and stepped state (W1, W5, W6, W7, G6)

Frame-difference test on the 240 screencast frames (1440): a frame pair counts as "dead" when the
screen under the bar changes by less than 1.2 grey levels on average while the page moved.

- **25 % of the whole page's scroll distance and 41 % of Work's (about 2,000 of 4,860 px) shows no
  visible change.** Dead spans over 120 px: 1,408 to 1,768 (Recto, 360 px), 2,075 to 2,248, 2,488 to 2,622, 2,822 to 3,288
  (English Prep, 466 px), **3,582 to 4,622 (Eat Map, 1,040 px: one still image for more than a
  screen, W7).**
- Clock 2 (texts, index, light) waits for the scroll to settle (200 ms timer, 120 ms after
  `scrollend`). During a continuous scroll it never fires: English Prep crosses its whole slot with **no
  title on screen** (frames at 2,008 to 3,382 px show an empty text area), then the text swaps in only
  when the hand stops. Input with no response, then a response with no input: both break G6.
- The shuffle switches `z-index` at the rounded position, so the front print pops between frames
  (frames at 2,248 / 2,408 / 2,342 alternate the front image).
- The pinned stage keeps three full-view sticky layers alive for 4,860 px, and the light is held by
  `hold('work')`, so the aura cross-fade (2.1) fires at pin, unpin and every swap.
- Work is 4,860 px for three projects: 1.8 screens each at 1440, 1.7 at 390.

### 2.5 One-shot reveals are not reversible (M4)

`arrive.ts` adds `.in` once, unobserves, and removes `data-arrive` after the transition. Scrolling back
up shows nothing; scrolling down again shows nothing. Only one scroll-scrubbed scene exists on the
whole page (the plate). Text never "shapes with the motion".

### 2.6 The opened project (O2, O3)

- Steps on wide windows change in **time**, at thresholds: over 2,520 px of steps the active step changed
  twice (step 0 held for 1,642 px, then 1 at 1,642, then 2 at 2,442), each a 500 ms opacity and
  24 px transform transition. That is exactly the owner's "scroll a bit, nothing, then it jumps".
- The layer has no rail (`html.layer-open #rail { display: none }`).
- Open (view transition) at 4x: in the 2.5 s after the click, 47 frames, p90 200 ms, max **600 ms**,
  20 frames over 50 ms. The open is liked (O1, W3): keep its choreography, but take the cost out
  (snapshot fewer groups, pause the field and the deck before `startViewTransition`, not after).
- Layer scroll at 4x: p50 33 ms, p90 50 ms, 17 frames over 50 ms in 4.8 s.

## 3. The "oil" technique for round 2 (decision, with the spike as evidence)

Decision (technique; record it in the new Home motion ADR, which also retires the "no Lenis" line of
`docs/research/2026-10-two-page-tech.md` §1.3 item 5; its reasons came from ADR-0010/0014, both
superseded, and they still hold, see "what stays native"):

1. **Desktop (hover + fine pointer, motion welcome): inertial wheel smoothing with Lenis 1.3.27**
   (MIT, 18.3 KB min, 5.3 KB gzip measured; pinned exact version, older than two weeks by the time it
   ships, or vendor the file). Options: `lerp: 0.1`, `smoothWheel: true`, `syncTouch: false`,
   `autoRaf: false` (driven by the one ticker), `anchors: true`, `prevent` for nested scrollers.
   The opened layer gets its own instance (`wrapper: .layer`, `content: .pres`), created on open,
   destroyed on close. Why Lenis over the 30-line own lerp in the spike: both measure the same (0 % vs
   4 % still frames, 19 vs 22 px max step), but Lenis already solves trackpad deltas, nested scrollers,
   `scrollTo` for the rail and anchors, stop/start for dialogs, and Safari quirks. The own lerp
   (`spike/oil.html`, `?smooth=lerp`) is the fallback if the owner refuses a dependency.
2. **Touch: native momentum.** No smoothing on touch (`syncTouch: false`); iOS momentum is already
   the "pond". Phones get the same scroll-linked motion from the same source.
3. **What stays native:** the document still scrolls (Lenis moves `scrollY`), so Back restoration,
   anchors, keyboard paging, find-in-page, the rail and the scrollbar all keep working; reduced motion
   and `?still` load no smoothing at all.
4. **One scroll-progress source.** The document's scroll position (smoothed on desktop by 1) is the
   only input. CSS `scroll()` / `view()` timelines read it where supported (Chromium 115+, Safari 26);
   elsewhere **one** ticker (the shell's rAF, the same one that calls `lenis.raf`) reads `scrollY`
   once per frame and writes every scroll-linked value. No module adds its own scroll listener or
   rAF loop for scroll-linked motion; the deck's, the stepper's and scrub.ts's listeners fold into it.
5. **Lerp and easing.** Wheel lerp 0.1 per 60 Hz frame, frame-rate independent
   (`k = 1 - 0.9^(dt / 16.67)`): 95 % settled in about 470 ms after the last notch. Smoothed velocity
   for skew and lag: `v += (v_raw - v) * (1 - 0.85^(dt / 16.67))`, skew = `clamp(v * 0.06, -6, 6)` deg.
   Scroll-scrubbed keyframes stay linear in the timeline and put the curve in the keyframes
   (`--ease-out` / `--ease-soft` per segment); no `steps()`, no thresholds.
6. **Text that slides and shapes with the scroll, reversibly.** Split each heading and lede into
   measured lines after fonts load (recompute on resize). Each line is a mask (`overflow: clip`,
   `padding-bottom: 0.08em` for descenders) holding one span. The span's `translateY` (110 % to 0)
   and `skewY` (4 deg to 0) are a pure function of the line's position in the view, offset per line
   (range start + line index x 6 % of the range). Scrolling up plays it backwards because nothing is
   remembered. CSS form: `animation-timeline: view(); animation-range: entry calc(10% + var(--i) * 6%)
   cover 40%`. Body paragraphs move as one block with opacity 0.4 to 1 and 16 px rise: never per word.
7. **Work as flight (W2), no pin.** Frames are in document flow and fly past: each frame's
   transform = f(its position in the view): vertical lead or lag by depth (0.82 to 1.18), a few
   degrees of turn that reverses through the centre, scale 0.88 to 1 at the centre, horizontal sway,
   skew from velocity. The spike holds 60 fps at 4x CPU on this rig with six 1440 px frames and split
   text (p90 16.7 ms, 4 frames over 33 ms in 6 s). The project's light follows the scroll by
   cross-fading two stacked pool sets by opacity, never by `setAura` transitions on `:root`.

## 4. Token and rhythm audit (G5)

### 4.1 Type scale in use

The scale defines 9 sizes (12, 13, 14-15, 16-17, 18-20, 20-24, 24-29, 32-42, 44-72). The page shows
19 size/face/weight combinations at 1440 and 20 at 390.

Off the scale:
- ID card: 27.6 / 23.9 px name, 12.6 / **10.9** px and 11.7 / **10.1** px detail text, 22.2 / 19.2 px
  mark. Text under 12 px on the phone is below the scale's floor (`--fs-cap` 12 px). When the previous
  card is ported (C2), keep its object type but set a 12 px floor on the phone.
- The lanyard pattern "edk edk": 35.1 / 32.9 px serif, decoration; mark it `aria-hidden` and keep it
  out of the type audit.
- `.btn` and `.tabs a`: hard-coded `15px` (base.css, Bar.astro), `.pr-cap` 11 px (work.css): use
  `--fs-small` / `--fs-cap`.

At most four text sizes per screen were seen in the brief, Work and Record screens; How I work shows
five (24, 17 medium, 15, 13, 12).

### 4.2 Spacing between strips

| Gap above (ink to ink) | 1440 | 390 |
|---|---|---|
| Brief to Work | 168 | 175 |
| Work to the person's part | the Work grid ends 900+ px of brown ground before the card (screen at 5,400: one lanyard on an empty screen) | same, screen at 6,064 |
| ID card to How I work to Path to Photos to Now to Record to Contact | 126, 112, 112, 104, 112, 112 | 82, 72, 72, 78, 72, 72 |
| Contact to the footer | 145 | 142 |

Every strip of the person's part gets the same gap whatever its weight: Now is 68 px tall, Contact 100,
Path 190, Photos 457, but each sits 112 px from the next. The part reads as a list of seven thin
strips. Work's three projects take 4,860 px; the whole person's part takes 3,838 px.

### 4.3 Fill against empty per screen

Measure: share of 16 px blocks with luminance sd > 7 or a mean more than 14 grey levels from the
screen's median (text, images, lines; the aura gradients mostly do not count).

| Screen (top px) | 1440 | | 390 |
|---|---|---|---|
| 0 brief | 35 % | 0 | 61 % |
| 1-3 Work, Recto / English Prep | 26, 24, 20 % | 1-3 | 63, 50, 38 % |
| 4-5 Eat Map (the same frame twice) | 18, 18 % | 4-5 | 23, 23 % |
| 6 after Work (lanyard only) | 19 % | 6 | 49 % (card) |
| 7 card / How I work | 34 % | 7-8 | 36, 30 % |
| 8 path + photos | 53 % | 9-10 photos | 85, 97 % |
| 9 Now + Record | 44 % (small text on a wide empty ground) | 11 | 31 % |
| 10 contact + footer | 20 % | 12 | 44 % |

Median 24 % at 1440: the desktop is under-filled on 7 of 11 screens. The phone swings from 23 % to 97 %:
the photos fill two whole screens, Eat Map two near-empty ones.

### 4.4 Corrections (concrete)

1. Work: about 0.9 to 1.1 screens of scroll per project with motion over the whole distance; Eat Map
   (no screens) at most 0.6 screen, carried by its object, its drawing and moving text (W7).
2. Remove the empty band between Work and the person's part: the last Work frame flies out while
   the tear and the card come in (overlap of at least 0.3 screen), no screen under 25 % fill.
3. Group the person's part into three chapters (the person: card + How I work; the life: path +
   photos; the signal: Now + Record + contact). `--part-gap` (168 / 112) between chapters,
   `--s-7` to `--s-8` (48 to 72) inside a chapter. One chapter at least one screen on desktop,
   filled by its line drawing (E1, W4) behind the text, not by a wider gap.
4. Target fill per screen: 30 to 55 % at 1440, 35 to 70 % at 390; nothing below 25 % unless the screen
   is a deliberate art frame (a drawing that moves with the scroll); nothing above 75 % on the phone
   (photos: one large vertical image per screen, P1).
5. Record strip on desktop: one composed object (the Record's language, R1) with the three entries as
   one block, not three centred lines on 1440 px of ground.
6. Type: 12 px floor on the phone everywhere, including the ID card; no hard-coded `15px` / `11px`; at
   most four sizes per screen (How I work: drop 15 or 12).
7. Tokens to add (write them in the charter first): `--lerp-wheel: 0.1`, `--vel-skew: 0.06`,
   `--skew-max: 6deg`, `--line-stagger: 6%`, `--line-rise: 110%`, `--fly-depth: 0.82 1.18`,
   `--fly-turn: 5deg`, `--fly-scale: 0.88`. Retire `--ease-reel` (the deck) and `--step` for
   scroll-linked work (stagger lives in ranges now, not in delays).

## 5. Motion contract (round 2; builders follow it, the critic checks it)

```
SOURCE
 1. One scroll source: the document scroll position. Desktop smooths the wheel with Lenis 1.3.27
    (lerp 0.1, syncTouch false, autoRaf false); touch scrolls natively; still/reduced loads nothing.
 2. One ticker: the shell's rAF calls lenis.raf(t), reads scrollY once, writes every scroll-linked
    value. No other scroll listener or rAF loop for scroll-linked motion. It sleeps when the scroll
    and the smoothed velocity are at rest.
 3. CSS scroll()/view() timelines first; the ticker writes the same values where they are missing.
 4. Layout is read on resize, font load and content change only, never per frame.
CONTINUITY (G6, M4, O3)
 5. Every scroll-linked value is a pure function of position (and smoothed velocity). No thresholds,
    no timers, no "settle then swap", no classes toggled by scroll to start transitions.
 6. Reversible: scrolling back plays it backwards. No one-shot reveals below the brief.
 7. No dead scroll: no span over 120 px of scroll where the screen does not change (frame test).
 8. Clicks answer within one frame (press state) and animate the whole way; no empty wait.
 9. Text: measured lines in masks; per-line offset 6 % of the range; rise 110 % + skew 4deg to 0.
10. Work: no pin, no shuffle, no page swap inside a project. Frames fly in document flow (depth
    0.82-1.18, turn <= 5deg, scale 0.88-1, skew from velocity <= 6deg). Click open stays.
11. Opened project: its own Lenis instance and the rail; steps cross-fade/slide by scroll progress.
COST
12. Never transition or per-frame write an inherited custom property on :root/html/body. Aura
    changes = opacity cross-fade of two pool sets inside .field; per-frame vars use @property
    inherits:false on the smallest element.
13. Animate transform and opacity only. No filter, blur, clip-path or mask animation on large boxes.
14. No mix-blend-mode that reaches the fixed field: blend only inside an isolated section
    (isolation: isolate) or bake the light into the media.
15. Layer budget per viewport: <= 12 drawing layers besides the root; total drawing-layer area
    <= 8 viewports at any scroll position; no layer taller than 2 viewports except the root.
    will-change only on elements within 1 screen of the view, removed after.
16. backdrop-filter on at most two small elements (bar, capsule). Field: one fixed layer, pools
    inside, drift on transform, paused when hidden, when a layer opens and in still twins.
17. View transition: pause the field and the ticker before startViewTransition; <= 8 named groups.
BUDGET (this rig: headless Chromium, software raster, 4x CPU; steady 800 px/s, 1440 and 390)
18. p90 frame <= 50 ms at 1440 and <= 20 ms at 390; frames > 50 ms <= 20 (1440) and <= 8 (390)
    per full-page scroll. Today: 83-100 / 91 and 33 / 57. fixA ablation reaches 50 / 37 and 17 / 6.
19. Wheel test (100 px notches, 8/s): 0 % still frames while scrolling, max step <= 30 px.
STILL TWINS
20. Reduced motion, ?still, no JS: no smoothing, no ticker, a complete static page (frames at rest).
```

## 6. Method notes for the critic

- Re-run `probe/scroll.mjs` (`node scroll.mjs <wide|phone> 4 <out> 800 prog [1]`; the last `1` also
  records screencast frames) and `probe/oil.mjs <url> 4 wide` after each build. Add `CSS="..."` and
  `TAG=` to ablate. The dead-scroll test is `probe/dead.py <frames-dir>`: frame pairs
  with a different offset and a mean grey difference under 1.2.
- Test on a real device before claiming the budget: these numbers come from software raster.
