# Round 6 bug hunt: S10, S2, S35

Base: `lane/review-r6` at f55bf5c, built with `npm run build`, served with `node tests/serve.mjs dist 6131 /`.
Chromium (Playwright), 390x844 DPR 3 touch (iPhone 13 profile) and 1440x900. Read-only: no code changed.
Screenshots and frame sheets: `(session scratchpad) round6/bugshots/`.
Probe scripts: `rec.mjs`, `rec2.mjs`, `glass.mjs`, `glass2.mjs`, `pv.mjs`, `pv2.mjs` in the same `round6/` folder.

## S10: the recorder is a white square with inverted colours on iPhone

### What the box is

The recorder is the only object on Home that has a contact shadow. `Media.astro` draws
`media/objects/recorder/shadow.{avif,webp}` as `img.m-shadow` with `mix-blend-mode: multiply`
(`src/one/media.css:11`, also `src/styles/global.css:258` for `/record/`). The shadow file is an
**opaque RGB image on a white ground**: 600x600, white (255) everywhere, the shadow down to 88
(manifest `shadow.blend: "multiply"`, `min: 0.343`). Multiply makes the white invisible. If the
multiply does not reach the dark ground, the white square shows. The object's stage (`plus-lighter`)
is then added on top of white. Most of it clips to white, and only where the shadow is dark does the
object's colour show. The result is a white square with a dark, tinted, negative-like silhouette:
"white square box, colours inverted".

Reproduced in Chromium by turning off only the shadow's blend (`.m-shadow { mix-blend-mode: normal }`)
or by isolating `.rs-obj`: `bugshots/rec-390-normal.png` (correct), `rec-390-multiply-off.png` and
`rec-390-isolated.png` (the white box). The owner's description matches these images.

### Why only on iOS (most likely cause)

WebKit blends a composited layer only against the content of its own backing store or CA isolation
group. It does not blend against content in a different composited layer. On this page:
- the field (`Field.astro`, fixed, `contain: strict; isolation: isolate`) is its own composited layer
  under `main`;
- on phones, `media.ts` gives the slot the float: a WAAPI `translate` animation on `.m-layer`
  (`floatLayer`). An accelerated animation composites `.m-layer`, and its blending ancestors
  (`.m-stage`, plus-lighter) need composited isolation;
- iOS composites more than desktop browsers do (overlap with the fixed field and the fixed grain, the
  scroll layers).

The shadow is then painted into a backing that does not hold the field or the pool. In that backing,
multiply over transparent pixels returns the source: the white square. The stage still adds itself over
the square. Chromium resolves blending across layers with render surfaces, so it never shows the bug.
This also explains why the Work objects (plus-lighter only, no shadow) do not show the fault on the same
phone: plus-lighter over transparent pixels draws the object as it is, and the object's own near-black
ground disappears into the dark page.

Codec and video were checked and ruled out for Home on phones. `data-spin="off"` keeps the slot on the
poster (no video element in the DOM: `vids: 0`). The press clip lists av1, then hevc (`hvc1.2.4`), then
h264, and `canPlayType` picks the first one the device plays. A video failure gives a black disc (ADR-0018
item 3), not a white square. The poster is black-ground, so it cannot paint white.

Not verified on a device: there is no WebKit in this container. To confirm, use Safari Web Inspector
(Layers tab) on the iPhone, or load a build that sets `.m-shadow { display: none }`. The
white box must then be gone.

### Fix (safe, no blend needed)

Encode the shadow as **black with alpha** and draw it with normal blending. For a grey multiply
factor `g`, the result is `g * B`. Source-over of black at alpha `1 - g` also gives
`B * (1 - (1 - g)) = g * B`, so the two are mathematically identical, and no blend mode or stacking
context can turn it into a white square.
1. `tools/objects/encode.py` §4 (the floor shadow, about line 615-651): write `shadow.{avif,webp}` as
   RGBA with RGB 0 and alpha `round((1 - m) * 255)`. Set the manifest to `shadow.blend: "normal"`.
   Re-encode the five objects that have a shadow (edk, recto, englishprep, eatmap, recorder).
2. `src/one/media.css:11` and `src/styles/global.css:258`: `.media .m-shadow { mix-blend-mode: normal; }`.
   Better: read the blend from the manifest, so an old multiply file never meets a normal rule.
Measured: a hand-made alpha version of the recorder's shadow (7.8 KB webp q90), drawn with
`mix-blend-mode: normal`, against the current multiply render at 390 DPR 3: max difference 2 levels,
mean 0.18 (`bugshots/rec-390-alpha.png` vs `rec-390-normal.png`). Even with `.rs-obj` isolated
(`rec-390-alpha-isolated.png`), no white box appears.

Fallback, until the files are re-encoded: hide the contact shadow on WebKit touch devices only:
`@supports (-webkit-touch-callout: none) { .media .m-shadow { display: none; } }`. This loses the
shadow on iOS and nothing else. The poster, float and press clip stay.

Second safeguard for the stage itself, in case a future change isolates it: the ground pool
(`.rs-pool`) is already near-black where the poster's square lies. Keep the recorder's poster
corners at exactly 0 (they are: `getpixel(2,2) = (0,0,0)`).

## S2: the glass reads green over the brief and Bostancı

Every glass object reads `--a1` from `:root` (`glass.css` lines 22-36: rim foot, caustic, body glow,
bed). `setAura` in `src/one/scripts/bus.ts` writes `--a1` there. `field.ts` picks the section whose box
crosses the middle 10 % band, from the elements that carry `data-aura`.

Measured `--a1` per position (390 and 1440 give the same result):

| position | `--a1` | glass |
|---|---|---|
| top (brief) | `#6f8cff` | blue |
| Bostancı, reached from the brief | `#6f8cff` | blue |
| Bostancı, reached by scrolling up from Recto | `#a6d873` | **green** (`bugshots/glass-390-back-from-recto.png`: rim, bed, bar dot and field all lime) |
| Bostancı, reached from English Prep | `#efb1cb` | pink |

**Cause:** `#bostanci` (`src/one/Bostanci.astro:27`) and the `#work` wrapper have no `data-aura`. While
Bostancı fills the middle band, the band holds no aura section, so `pick()` keeps `current`, which is
the last section passed. Coming back up from Work, that is Recto, the first project, whose a1 is
`#a6d873`. A second, weaker cause applies even on the way down: while the brief is current, `--n1`
(the next section's first pigment, field pool p4 at 18 % at the lower edge) is Recto's lime,
because the next `data-aura` after the brief is `#recto`. On a phone, the lower part of the field under
Bostancı is green-tinted. The page shows a blue photograph in a green-edged field, and the glass blurs
and saturates that field (`--glass-blur: blur(24px) saturate(1.8)`).

**Fix:** give Bostancı the brief's set, as the brief does:
`<section class="bost" id="bostanci" data-scene data-aura={auraAttr(SETS.brief)} style={auraVars(SETS.brief)} ...>`
(import `SETS, auraAttr, auraVars` from `./aura.mjs`). Then the band always finds blue over the
photograph, from either direction. `--n1` while in the brief becomes the brief's blue (the next aura
section is now Bostancı), and the lime hint moves to Bostancı's lower edge, where Work begins. If the
owner wants the photograph to have its own light, use its own blue-hour set (for example
`['#5b7fe0', '#8fa6ff', '#2c3f8f']`) through the same attribute. Check that the palette gate covers the
new attribute (`npm run palette:gate`).

## S35: the photo view's close animation does not play

**Cause (reproduced, deterministic in Chromium): `hide()` runs twice for every close by button, Esc or
a click on the dark space, and the second run skips the first run's view transition.**

Sequence in `src/one/scripts/postcards.ts`:
1. `hide()` (button, Esc or dark space) starts view transition A. Its update callback sets
   `open = null`, but only later, after the old state is captured.
2. Still synchronously, `hide()` calls `history.back()` (line 256), because `show()` pushed a step.
3. `popstate` arrives 1-21 ms later, before A's update callback runs. The handler
   `addEventListener('popstate', () => { if (open) hide(true); })` (line 293) still finds `open` set and
   calls `hide(true)` again.
4. The second `hide` runs `busy.skipTransition()` on A and starts transition B.
5. A's update callback runs (the dialog closes, the table card returns). A's skipped `finished` fires
   `done()`, which removes `is-hero` from the table card and sets `busy = null`, which overwrites B.
6. B captures the old state after the view is already closed, with no element named `pc-hero`.
   B animates only root, bar, rail, tab-ind and mark-dot. The card morph is gone.

Evidence (`pv.mjs`, 40 closes in 5 modes at 390 and 1440): every close by button (slow and fast), Esc and
dark space started **2** transitions. The first was skipped 1-21 ms after its start (`ready` rejected),
and exactly one `popstate` came. `pv2.mjs` lists the groups of the surviving transition:
`rail mark-dot tab-ind bar root`, and no `pc-hero`. The frame sheets
`bugshots/pv-390-close-sheet.png` and `pv-1440-close-sheet.png` (60 ms apart) show the view gone in the
first frame. At 390 the card's slot is empty, then the card fades into place, with no shrink.

Why the owner sees it only "sometimes": the result depends on whether `popstate` arrives before or after
transition A's update callback. On iOS Safari the history and transition timings differ, so on some
closes the popstate comes after `open = null` and the morph plays. Closing with the system back gesture
(`hide(true)` from popstate) does not re-enter, so it plays every time. The open has the same class of
problem: the `finished.finally` handlers of a skipped transition still run later.
- A skipped close's `done()` clears `busy` and moves focus to the table card while a new open runs.
- A skipped open's handler runs `named()` and `settle()` after a close started (it can call `hide()`
  again through `closeQ`, or `turnCard()`).
- `vt()` removes `html.pc-vt` when any transition finishes, including a skipped one, so a running
  transition loses its 640 ms timing in the middle (the groups go back to the 900 ms default).

**Fix (keep both animations as they are; only make the state machine re-entrant):**
1. Make `hide()` idempotent. Take `open` at the start, in the synchronous part:
   `const pc = open; if (!pc) return; open = null; opening = false;` and delete `open = null` from the
   update callback. The popstate from the page's own `history.back()` then finds nothing open and
   does nothing. A real back gesture during the open still closes. Check the readers of `open` (table
   card click guard, touchstart, pointermove): all of them should treat a closing view as not open.
2. Give each transition a token, and let only the newest run its tail:
   `let gen = 0;` in `show` and `hide`, `const my = ++gen;`, and in every `finished.finally`:
   `if (my !== gen) return;` before `busy = null`, `named()`, `settle()`, `done()` (focus, `is-hero`).
3. In `vt()`, count active transitions:
   `live++; html.classList.add('pc-vt'); t.finished.finally(() => { if (--live === 0) html.classList.remove('pc-vt'); });`.
4. Optional: call `history.back()` after the close transition's `ready` (or `finished`), not
   synchronously. This removes the ordering dependency for good.
5. Test: add an e2e check in the lab-one specs that records `document.startViewTransition` calls on a
   close by button and by Esc. The check expects exactly one transition, not skipped, whose `ready`
   lists `::view-transition-group(pc-hero)`. Run it with fast (300 ms) and slow (1500 ms) holds.

The rapid case (close pressed 60 ms after open) is handled correctly: the press is queued as
`closeQ` while the snapshot covers the page, and the view stays open until the card has settled. In
that case the probe saw `dlgOpenAfter=true` in half the runs, because the probe's press was taken as a
turn on the card. That is the round-five rule, not this bug.
