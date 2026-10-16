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
   motion).
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
| `fan` | each name unfolds from the press point outward like a paper fold (rotateX 84 deg to 0, settle spring, 48 ms apart). | Cleanest frames, but it reads as a list appearing, not as something growing from the point. |

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
- Reduced motion or `?still`: the names and the veil appear at once and still; the scrub follows the
  pointer without the ease; no swell, no roll.
- Without JavaScript or in forced colours there is no rail; the platform's scrollbar stays (ADR-0013).

## 6. Open

- Safari on a real iPhone: the hold under `touch-action: pan-y`, the vibration (iOS has none), and the
  blur layers' cost at DPR 3.
- The owner judges the three entrances on the published lab page.
