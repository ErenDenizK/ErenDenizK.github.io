# The rail's hold-to-scrub and bloom (lab Home)

Status: built on `/lab/one/` (round 4, review row V6). It replaces the round-3 sheet (T9), which the
owner rejected on 2026-10-16: "never a separate drawer or window". Code: `src/one/scripts/bloom.ts`,
`src/one/rail.css`; the shared `src/scripts/rail.ts` only gained an opt-in `ext` hook, so the live
site's rail does not change. Tests: `tests/e2e/lab-one-rail.spec.ts`.

## 1. What the owner asked for (V6)

- The plain rail at the right stays as it is.
- Press and hold to drag (scrub).
- A click is a showcase, not a panel: it grows or reveals from the point pressed, like a water drop
  pressed flat that spreads lower and wider, or a closed palm whose fingers open. These are feelings,
  not shapes to draw (coverage pass V14): no drop or hand is drawn.
- The background blur is gradual and natural from the side, never a box, so the text and the pressed
  rail come forward. Above all on phones.

## 2. The two gestures

### 2.1 Hold to scrub

1. A press on the column waits. Held still for 240 ms (mouse) or 320 ms (finger), or moved 4 px with a
   mouse, it becomes a scrub. A finger that moves 10 px before the hold ends is a swipe: the platform
   scrolls the page as usual (the column keeps `touch-action: pan-y`; a non-passive `touchmove` stops
   the scroll only once the scrub has started).
2. The column breathes open: every bead gets one even slot (`--slot`, 26 to 36 px; 32 px on both test
   sizes), on the beads' own spring. The current bead becomes a dot, so the thumb is the only line.
3. A thumb (5 x 26 px, the section's light, a two-step glow) stays exactly under the pointer.
4. The page follows the thumb on a first-order ease with a 70 ms time constant (no ease under reduced
   motion). The first move of a scrub (the page going to the held bead) starts at 260 ms and relaxes to
   70 ms in about 300 ms, so taking the page reads as a glide, not a cut (integrator, round 4: at 70 ms a
   hold on a far bead crossed 2800 px in two frames).
5. Mapping: bead j's centre is section j's start; between two beads the page moves linearly; half a slot
   below the last bead reaches the end. Each bead is a soft detent: the mapping is flattened with
   `d - (0.7 / 2π) sin(2π d)`, which is continuous and monotonic and leaves 30 % speed at a bead. It
   never snaps.
6. The section's name surfaces beside the thumb: Newsreader 30 px (28 px on touch), the part's name
   above it in 10.5 px capitals, letter-spacing 0.16em. On touch the name sits 52 px above the finger,
   because the finger covers what is below its tip. Each change rolls the name 9 px in the direction of
   travel (220 ms), swells the passed bead (280 ms) and, where the platform allows it, vibrates for 5 ms.
7. The veil is lighter than the bloom's: only the two narrow blur layers (on touch 62 % and 44 % of the
   width) at 80 % and the shade at 55 %, because the reader watches the page arrive. The name has a close
   halo of ground under its light. On touch it keeps 12 px clear of the 44 px column, and no focus ring is
   drawn round the column while the thumb or the names are out (the ring read as a box).
8. The part's name is shown only where it adds something: "Work" over a project, "The record" over Now.
   The person's part has no heading on the page and would repeat "Eren", so it has none.
9. Release leaves the page where it is. Escape puts it back where the press started.

A resting mouse over the column shows only the bead's name, 13 px Inter, with a halo of ground.

### 2.2 Tap to bloom

A short press (or Enter or Space on the column, which is a button) opens the names.

Layout, measured:

| | fine pointer | touch |
|---|---|---|
| row pitch | 40 px | 46 px (44 px target and more) |
| gap between the page's parts | 14 px | 10 px |
| name | Newsreader 400, 23 px, -0.006em | 22 px |
| arc depth at the press point | 76 px from the rail axis | 60 px |
| least radius | 640 px | 560 px |
| bead to name | 16 px | 14 px |
| top and bottom room | 92 / 32 px | 84 / 28 px |

- The pressed section's name stands at the press height; the others stand above and below it. The
  whole block moves, if needed, to fit between the bar and the bottom.
- The beads lie on one circle. It is deepest at the press point and curves back toward the rail above
  and below. The radius is the larger of the least radius and `(f² + s²) / 2s`, where f is the farthest
  row's distance and s is depth minus 24 px (20 px on touch), so no bead comes nearer the rail column.
- Each name carries its own bead in the rail's three shapes: ahead a dash, behind a dot in its light,
  current a lit line. The current name is drawn in its section's light (each accent is at least 5.5:1
  on the ground) with a soft glow. Names behind are `--ink-2`, names ahead `--ink-3`.
- A 1 px arc line at 16 % ink, faded at both ends, draws from the press point outward.

The veil (no box):

- Four `backdrop-filter` layers, each anchored to the right edge, each stronger and narrower: 2 px over
  the full width `--bw`, 5 px over 78 %, 10 px over 56 %, 18 px over 36 %, each masked to fade out
  toward the left. `--bw` is `min(1040px, 76vw)` on desktop and the full width on touch.
- A shade on the same gradient: 80 % ground at the rail, 66 %, 36 %, 10 %, then nothing at `--bw`.
- The fade is on each layer, never on the veil. An ancestor below full opacity is a backdrop root
  (Filter Effects 2), so a fading parent made the blur appear only at the end of the fade, all at once.
- The aura field pauses while the names are open: it is under the blur, and held still the blur is drawn
  once instead of every frame.

Closing: Escape, a tap on the page, a swipe to the right, the wheel, the page moving 48 px, a press on
the column, or a name. The names leave in 200 ms (a chosen name in 340 ms); the page comes back over
380 ms.

## 3. Three entrances, judged frame by frame

Frame sheets every 50 ms (timeline slowed through the DevTools protocol) at 1440 x 900 and 390 x 844.

| | motion | judgement |
|---|---|---|
| `drop` (default) | each name leaves the press point (all the way from the rail, 70 % of the press height), from 0.5 scale and 10 px blur, on the glide spring (760 ms), its delay growing with its distance from the pressed row (40 + 30 d^0.85 ms); its colour brightens from `--ink-4`. A pool of the section's light spreads from the point, lower and wider (scale 2.6 x 4.4, 900 ms). | Reads as one gesture from one point; the light carries the "drop". No name overlaps another once visible. Chosen. |
| `palm` | every name starts folded onto the pressed one and swings open around the arc's centre on the pop spring (820 ms, 9.6 % overshoot), outer names last. | The most alive, but for about 150 ms the folded names are drawn over each other; legible only at full speed. |
| `fan` | each name unfolds from the press point outward like a paper fold (rotateX 84 deg to 0, settle spring, 48 ms apart). | It reads as a list appearing, not as something growing from the point. The integrator's frames (round 4) also show neighbouring names drawn over each other for about 100 ms on the phone, while they unfold. |

Switch with `?bloom=drop|palm|fan`.

## 4. Cost (headless, software rendering; a real GPU will be cheaper)

- Open and settled: 16.5 ms per frame at 1440 x 900, the same as the page without the bloom.
- During the 460 ms fade at 1440 x 900: about 10 frames, mean 93 ms. At 390 x 844 (DPR 3): mean 40 ms.
  The cost is the four blur layers being redrawn while their opacity changes. Each layer covers only
  its masked width (2.5 views of area in all). This must be measured again on a real phone.

## 5. Accessibility and still twins

- The column is a `button` with `aria-expanded` and the rail's label ("On this page: Recto, 2 of 10").
  The names stay the rail's own links in its `nav`; closed, they are hidden and out of the tab order.
- Enter or Space opens with focus on the current name; Up, Down, Home and End move; Escape closes and
  returns focus to the column; Tab out of the names closes them.
- Focus rings are 1.5 px in `--focus`: on a name a capsule round the row; on the column half a capsule
  docked to the screen's edge with the beads inside it (round 4: the 12 px corners read as a window frame).
- Reduced motion or `?still`: the names and the veil appear at once and still; the scrub follows the
  pointer without the ease; no swell, no roll.
- Without JavaScript or in forced colours there is no rail; the platform's scrollbar stays (ADR-0013).

## 6. Round five (review row V14 and the round-four critique)

- The give. The owner's words for the tap are a feeling: "the press point gives, then spreads wider,
  things open outward". Round four drew the spread (the names leave the point, the pool of light grows
  lower and wider) but nothing gave. Now, while a press is down, the beads round the press point sink up to
  3 px toward the screen's edge and shrink to 70 %, most at the point and fading over about 18 px
  (`--g`, a Gaussian of the distance). The press takes 90 ms to sink and the beads come back in 160 ms. A
  tap then blooms out of that dimple, a hold becomes the scrub, a swipe lets the beads go. Reduced motion:
  no give.
- `drop` stays the default. Its frames still show no name over another; with the give, the gesture
  reads as press, give, spread.
- No word twice. While a section's own title is in view, the big name beside the scrub thumb steps
  back (180 ms) and the tag keeps only its part and the section's number, "Work · 04 / 10", where the
  name's foot was. A title is a leaf element of 18 px type or more inside the section whose text is the
  name, contains it or is contained in it ("The record" for "Record"). The name's roll fades through
  `filter: opacity()`, which multiplies with the CSS opacity, so a name that has given way never flashes
  back in for the roll. Test: `lab-one-rail.spec.ts`, "phone, no word twice".
- One rail. The opened project's layer already builds its rail with the same `bloom()` (`open.ts`, round
  four), so the give, the scrub, the tag and the bloom are the same there; this round changed only
  `bloom.ts` and `rail.css`. The layer passes no parts (`bloom(() => undefined)`), so its names have no
  gaps between groups and its tag no part line. A hook for the layer's parts (Overview and Facts, the
  steps, How it's made and Next) would be one argument in `open.ts`, which belongs to the Work lane:
  noted for it, not done here.

## 7. Round six (review rows S1, S13, S14, S33; owner 2026-10-17)

The owner chose `drop` and asked for three refinements. The accepted ideas stay; only their missing parts
were added. Code: `bloom.ts`, `rail.css`, the new `src/one/scripts/travel.ts`; `rail.ts` only gained
`top(i)` in the `ext` API (where `go(i)` lands). Tests: `lab-one-rail.spec.ts`, "round six".

- Born from the rail (S1). In `drop` the beads themselves travel. Each name's dot starts exactly on its
  bead, in the bead's shape (scaled from the dot's line, dot or dash), and the bead is hidden in the same
  frame, so no bead stays on the rail. The path follows the bloom: the dot leaves the rail sideways first,
  then glides along the arc to its row (16 sampled keyframes, `cubic-bezier(.22, 1, .36, 1)`, 680 ms,
  delay 30 + 34 d^0.85 ms by distance d from the pressed row). The name grows out of its own dot, leftward
  and unblurring, from 40 % of the dot's trip (520 ms). On close the names go back into their dots
  (200 ms) and the dots travel home along the same path (440 ms, `cubic-bezier(.45, 0, .2, 1)`); each
  bead shows again on the frame its dot lands. `palm` and `fan` keep the round-four motion and leave the
  beads on the rail. Still twin: the beads are hidden while the names are open, with no travel.
- Equal rhythm (S13). Every name is exactly one pitch apart (40 px fine, 46 px touch). The 14 / 10 px gaps
  between the page's parts made pitches of 40 and 54 px side by side, which read as careless. The parts
  now show as 12 px breaks in the arc line (an SVG mask), so the rhythm is even and the parts still read.
  The arc's gradient and mask ids are unique per rail, so Home's rail and a project's rail never share one.
- The chosen name (S14). Press: the name gives (0.96, 4 px toward its dot) and takes its section's light,
  its dot grows into the lit line with a ring of light leaving it (560 ms), and the other names step back
  to 42 %. The close starts once the press has been seen for 150 ms. The other names leave first; after
  110 ms the chosen row rides home along the arc with its dot (640 ms), the name drawing into the dot,
  and the dot lands on its bead, which swells once in the section's light. The page starts to travel
  180 ms after the close starts, so the veil clears over a page already moving.
- Travel (S14, S33). One function, `travel()`: the page is scrolled frame by frame, so every scroll scene
  on the way plays. Duration clamp(480 + 340 log2(1 + d / vh), 760, 1600) ms; curve
  `cubic-bezier(.55, 0, .12, 1)`; the target is read again every frame; a wheel, a touch, a key or a press
  stops it. Its clock is the document timeline, so a slowed timeline slows it with the CSS motion (the
  frame sequences depend on this). Reduced motion: the page goes at once.
- The brief's project links (S33). The chip gives (0.93, 560 ms spring), a copy of its dot flies on an
  arc into the project's bead on the rail (680 ms), the bead swells in the project's colour, and the page
  travels there from 260 ms, landing where the rail's name would land. The hash follows with
  `replaceState`; a keyboard press moves focus to the project. Without JavaScript the chip is the anchor.
- Measured (headless Chromium, software rendering, frame sequences 50 ms apart at 1440 x 900 and 390 x 844,
  DPR 3): no name is drawn over another in the entrance; the rail is empty from the first frame; English
  Prep to Photos travels 3,860 px in 1.3 s; the brief's English Prep chip lands on the section at both sizes.
  Frame intervals during a full chip travel: median 67 ms at 1440, 33 ms at 390, because the software
  renderer draws the scroll scenes slowly. This must be measured on a real phone (S49).

## 8. Open

- Safari on a real iPhone: the hold under `touch-action: pan-y`, the vibration (iOS has none), and the
  blur layers' cost at DPR 3.
- The owner judges the three entrances on the published lab page.
- The owner judges the travel's pace (S14 said the old one was slow) and whether the chip's dot flight
  should stay once the liquid-glass press (S15) exists.
