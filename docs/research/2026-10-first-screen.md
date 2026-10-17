# First screen: diagnosis, three compositions, travel (rows S32, S33)

**Status:** proposal, 2026-10-17. Read-only lane. Nothing in the repo changed. The comps are HTML
mock-ups made in a scratch folder. They copy the lab-one tokens by value. They are not production code.
Headless Chromium only.

Files (all under `(session scratchpad) round6/first/`):

- `now/now-1440.png`, `now/now-390.png`: today's first screen. `now/arrival-*-sheet.png`: today's
  arrival, frames 300 ms apart.
- `ref/`: Renaissance contact sheets (`clip-arrival-sheet.png`, `clip-scroll-sheet.png`) and the single
  arrival frames `arr-06/14/24/33.png`.
- `comps/a-signal.html`, `comps/b-diptych.html`, `comps/c-cabinet.html`: the three comps. Open with
  `?settled` for the end state or `?still` for the still twin. They are built from `*.src.html` by
  `round6/tools/build_comps.py`. The engraving comes from `round6/tools/bost_engrave.py`, which writes
  `comps/bost-engraving.svg`.
- `comps/{a,b,c}-1440.png`, `comps/{a,b,c}-390.png` (DPR 3): the settled first screens.
  `comps/phones-abc.png`: the three phone screens side by side.
- `comps/{a,b,c}-arrival-1440.png`, `-390.png`: the arrival, frames 400 ms apart. The 100 ms frames are
  in `comps/frames/` (`A-1440-a00.png` to `a43`, and the same for B and C). Each frame was taken on a
  seeked animation clock, so the frame times are exact.
- `comps/a-handover-1440.png`, `-390.png`: comp A's handover into Work. Scroll stops at 0, 0.15 ... 1.2
  screens.
- `comps/a-travel-1440.png`, `-390.png`: S33 travel from the "English Prep" chip, frames 160 ms apart.
  The 80 ms frames are in `comps/frames/A-*-t*.png`.

## 1. Diagnosis of today's first screen

Measured on `/lab/one/` at f55bf5c (1440 x 900 and 390 x 844, DPR 3):

1. **We built the first 2.9 s of Renaissance and stopped there.** Renaissance's arrival is a
   construction drawing on black that resolves into a painting (`2026-10-motion-frames.md` §1.1). Our
   brief keeps the construction drawing (Plate.astro: circle, horizon, two diagonals, the red signal)
   but has no picture for it to resolve into. The owner sees "only text, little drawing".
2. **The drawing cannot be seen.** The plate draws at `opacity: 0.1`, so the arrival frames show almost
   no change between 0 and 3 s (`now/arrival-1440-sheet.png`). Against the "every animation visible"
   standard, this arrival does not exist.
3. **The photograph is at the wrong place.** Bostancı starts at y 656 on desktop and y 600 on the phone.
   The first screen shows only its sky (a flat blue band), and the photograph develops from grey. This
   is "a tiny bit of Bostancı at the bottom".
4. **The construction drawing was always this photograph's perspective.** In `line-twin/plates.json` the
   plate's signal is the photograph's red signal (photo x 557, y 1522). The diagonals of Plate.astro
   are the platform lines that run to that light. So the accepted idea is already there and only needs
   its picture. The new composition refines the plate. It does not replace it (S26).

## 2. What makes Renaissance's first screen strike (frame by frame)

From the arrival clip (34 frames, 0-2.9 s), the scroll clip and the settled frame `shopify-dj00`:

| Part | What it does | Why it works | What we take |
|---|---|---|---|
| Layered collage | Full-bleed painting with 4 depth layers: ground (forest, sky), two figures, foreground props (skateboard, bag), the title frame. Pointer parallax of 25-50 px. Nearer layers move more. | Depth without 3D. Every layer is a separate thing to discover. | The engraving and the photograph as two depth layers. Props only where they carry content. |
| Centred title frame | A thin hairline rectangle (about 280 x 390 px at 1200 px wide) in the centre holds the title, the promise and the index. No panel, no blur. | One calm, ruled object over a busy picture. The frame is a "plate" inside the painting. | A hairline frame for the brief. It crosses the edge between colour and engraving. |
| Index | I-XII chapter list, right-aligned roman numerals. On scroll the list flies one item at a time along a curve to the bottom-left corner and stays there as a fixed index. | The table of contents is a character that travels. It becomes the navigation. | Our index already exists: the rail. The three project chips fly into the rail beads on scroll and on click (S33). |
| Props | Pink skateboard, pink bag, coffee cup: modern objects in an old painting. The skateboard turns 180 degrees in the first 0.7 screens of scroll. | Wit and colour accents on a muted picture. | Project colours as the only saturated accents. In comp A, the signal changes from red to Recto's green. |
| Arrival | 0-330 ms black and the first strokes. 330-500 ms title readable. 500-2,900 ms construction lines (arcs, diagonals, golden rectangles) at about 8-12 % white. 1,500 ms the frame closes. 2,900 ms the painting resolves from coloured noise. | The text is never hidden. The picture is the reward for waiting, and the waiting is visibly busy. | The same order, but with lines that can be seen (22-42 %), and a resolve that grows from the signal. |
| Handover | The spark between the hands becomes a ring. The ring covers the screen and turns the painting into its line engraving, and the next chapter resolves from it. | The line twin marks a chapter change (motion frames §8.3). | The photograph drains back into the signal. The engraving keeps its floor, and Recto's temple rises on the same vanishing point. |

## 3. The engraving plate for the first screen

The comps use a new constructed engraving of the Bostancı platform, made by
`round6/tools/bost_engrave.py`. It is not traced from the photograph: S23 rejects traced drawings that
"imitate the photo at low quality". The engraving is built in the photograph's own pixel space
(1932 x 2576), so every line meets the photograph exactly at its edge. It extends to x -2700 and to
x 4630 and down to y 4200, so it can continue the photograph to both edges of a wide screen and below it
on a phone.

- **Vanishing point (548, 1650):** the platform's true vanishing point. The red signal sits just above
  it at (557, 1522), true to the photograph. The construction circle (the existing plate's circle) is
  centred on it.
- **Groups, drawn in this order:** scaffold (circle, horizon, axis, diagonals), ground (rails, sleepers,
  platform edge, tactile strips, tile rows, wet reflections), horizon (buildings, engraved tree
  clusters), structure (catenary pylon with lattice, gantry, shelter roof, billboard frame, bench,
  station sign, masts), wires, sky (broken engraver's lines), rain, light (lamp and signal rays).
- **Privacy:** the person with the umbrella is not drawn. The billboard is drawn as an empty frame,
  because the advertisement shows a stranger's face. In the photograph, the face is large on the right
  of the hero (owner question 3).
- **Comp quality only.** The final plate belongs to the engraving line (S24). It needs hatching depth,
  line weight by distance, and a reviewer. The comp proves the geometry and the seam. It is not the
  finished art.

## 4. Three compositions

Every comp keeps the brief's text unchanged: name, lede, Studying, Building with the three chips,
Writing. Every comp keeps the photograph whole and vertical (review row P1): it is never cropped by the
viewport, except in comp C, where this is a stated defect. Each comp has a still twin: with reduced motion
or `?still`, everything shows at once.

### A. The signal (recommended)

**Desktop** (`comps/a-1440.png`): the photograph is whole, 3:4, and the full screen height (675 x 900).
It is placed so that its vanishing point is on the page axis (left = 50vw - 548/2576 of its height). The
engraving continues it to both edges, and its lines meet the photograph exactly at the frame: rails
under the left half, the shelter roof and the billboard frame off to the right. A hairline title frame
(640 px, the Renaissance frame) holds the brief. It is centred on the axis and crosses from line into
colour. A thin line hangs from the frame's lower edge down to the red signal. The sky of the photograph
is deepened toward the top (a dusk gradient: 72 % at the top, 12 % at 60 %), so the lede reads on it.
Glass A sits on the photograph's sky, so it has something to refract. The section reads blue (S2).

**Phone** (`comps/a-390.png`): the photograph is whole at full width (390 x 520, under the bar). The name
(two lines, 34 px) stands in the photograph's sky. The lede and the rows follow below on the
platform's engraved continuation, quietened to 13 % under the text. All rows fit in 844 px. The Writing
row ends at about y 825.

**Arrival** (`comps/a-arrival-*.png`; 100 ms frames in `comps/frames/A-*-a*.png`):

| t (ms) | Desktop and phone |
|---|---|
| 0 | Dark ground. The scaffold starts to draw from the vanishing point (stroke draw, 1.4 s). |
| 300-1000 | The name sharpens in (blur 4 px to 0, letter-spacing 0.02em to normal, 700 ms). The lede at 520 ms, the rows at 680/800/920 ms (rise 12 px, 900 ms). The text is readable by 0.9 s (Renaissance: 0.5 s). |
| 300-4000 | The engraving radiates out of the vanishing point, one group after another. Each group is a radial mask that grows from the vanishing point (one animated mask per layer, not one animation per path). Ground 300 ms, horizon 700 ms, structure 900 ms, wires 1200 ms, sky 1500 ms, rain 1800 ms, light 2200 ms. |
| 900-2300 | Desktop: the hairline frame draws (top edge outward from the centre, then the sides down). |
| 2300 | The signal lights (spring scale from 0, 600 ms). |
| 2400-4600 | The photograph resolves from the signal: a circle clip grows from the signal to 150 % (2200 ms, cubic-bezier(.6, 0, .3, 1)). It arrives as a dark grey print. |
| 3500-5100 | The print develops to colour (grey and dim layers fade, 1600 ms). This is the same development the Bostancı frame already uses. |
| after | Desktop: pointer parallax. The engraving moves up to 14 px and the photograph 6 px, smoothed (factor 0.2 a frame, settled by about 300 ms). |

**Handover into Work** (`comps/a-handover-1440.png`). The first screen is pinned for 1.2 screens. Each
value below is a pure function of scroll, so it reverses on the way back up:

| Scroll (screens) | What happens |
|---|---|
| 0.04-0.34 | The frame, the lede and the rows lift 48 px and fade. |
| 0.08-0.50 | The name shrinks to half size and travels to the `edk.` mark, which glows as it arrives (a bookend: the full name folds into the initials). |
| 0.15-0.50 | The three chips' dots fly to their rail beads (the Renaissance index flight). In the comp this is built for the click only (S33). The scroll version is the same flight bound to scroll. |
| 0.25-0.75 | The colour drains back into the signal: the circle clip shrinks to the signal. This is the arrival in reverse, and the Renaissance portal turned inward. |
| 0.70-0.82 | The signal changes from red to Recto's green: the line is clear, the page departs. |
| 0.50-0.95 | The platform's structure, wires, horizon, sky and rain fade. The floor and the scaffold stay. |
| 0.62-1.15 | Recto's temple (the existing `recto.svg`, which the owner likes) rises from the horizon onto the same vanishing point. Its floor grid continues the platform's floor. Recto's name arrives on it. |

The production handover lands on Recto's real Work composition: the print, the title and Take a look.
The comp shows only the temple and the name.

**Why A:** it is the most direct translation of Renaissance (construction, then picture, centred frame,
an index that travels). It keeps every accepted idea: the plate, the signal, the axis, the Bostancı
photograph whole, its development, and the engravings. It gives the photograph the whole first screen
without cropping it. The idea the page then carries, "a photograph and its engraving are the same
place", is the one the engravings in Work, the postcards and the Record need. The signal turning green
links the brief to Recto with no added object.

**Risks:** the text is over the seam (line on the left, colour on the right). It needs the frame's hush
and the dusk gradient (both in the comp). Contrast must be measured with the palette gate before the
build. The billboard face is large (owner question 3). The engraving's alignment depends on the photo's
geometry, so the photograph file must not be re-cropped.

### B. The diptych

**Desktop** (`comps/b-1440.png`): the name at 60 px in two lines, the lede and the rows, all
left-aligned at x 120. The photograph is whole at the right like a hung print (561 x 750, top 98), with
a deep shadow and a blue glow. Its engraving runs out of the print, under the words, to the left edge.
A thin red rule runs from the rows to the signal inside the photograph. The caption is under the print.
**Phone** (`comps/b-390.png`): the photograph as a print turned 2 degrees, at the top right. The name
overlaps its lower edge in a gradient. The lede and the rows are left-aligned below.

**Arrival:** the same clock as A (`comps/b-arrival-*.png`). **Handover:** the print slides right and
turns 4 degrees, as if handed on, while the words leave to the left. The rule from the rows extends to
the first Work print.

**For:** the strongest reading order (name first, then picture), and the most editorial. **Against:** it
breaks G1 (the owner accepted the centred brief and its layout). It is less Renaissance (no centred
frame, no index character). The photograph is smaller than in A.

### C. The cabinet

**Desktop** (`comps/c-1440.png`): the Renaissance structure in full. A full-bleed engraved ground (line
only), a centred hairline frame with the brief set as an index (Recto I, English Prep II, Eat Map III),
and cut-out props in front: the Recto temple top left (green), the English Prep window right (pink), the
Eat Map alley bottom right (red). The Bostancı photograph is a tall print, turned 5 degrees, at the
lower left. The pointer parallax is strongest on the props (up to 52 px). **Phone** (`comps/c-390.png`):
the frame fills the width; the props and the print peek in at the edges.

**For:** the closest to Renaissance's collage, and the props preview each project. **Against:** it is
heaped, which the owner rejected in W5 ("piled up"). The print is cut by the viewport, which breaks P1.
The props repeat what Work shows a screen later (the no-repetition rule, T23). The chips become a list,
which changes the brief's content form.

### Recommendation

**A, the signal**, with one element from C: on desktop, each chip's hover lights its project's colour in
the engraving. The Recto chip turns the signal green for a moment, English Prep tints the wet reflections
pink, and Eat Map warms the lamp red. The props then live inside the picture, not on top of it.

## 5. S33: the animated travel of the brief's project links

Today the chips are plain `#id` anchors, and the root has no smooth scrolling, so the page cuts. The
rail uses native `behavior: 'smooth'`, whose duration the browser chooses (the owner, S14: "scrolls
slowly"). Specification (built and measured in comp A, `comps/comp.js` `travel()` and `flyDot()`):

1. **Press:** the chip compresses to 0.94 in 120 ms, then springs back (cubic-bezier(.34, 1.4, .64, 1),
   500 ms). This waits on the S15 liquid-glass press, which should replace it.
2. **The index flight (0-620 ms):** a copy of the chip's coloured dot leaves the chip. It flies on an
   arc (80 px lift, grows to 1.8x at mid-flight) to the project's rail bead. The bead takes the project
   colour and widens (16 px). The rail acknowledges the choice, which S14 asks for too.
3. **Travel (starts at 260 ms):** one shared function, `travel(y)`, for the brief's chips, the rail
   bloom labels and any in-page link. It writes `scrollTo` every frame, so every scroll-linked scene
   plays on the way (the handover, the Work prints): the page is travelled through, not cut.
   - Duration: `clamp(520 + 380 * log2(1 + |d| / vh), 900, 2000)` ms. At 1440 x 900 this gives Recto
     1,407 px in 1.05 s, English Prep 2,262 px in 1.21 s, and Eat Map 3,117 px in 1.34 s. On the phone
     (844 px): Recto 1,226 px in 1.0 s, Eat Map 3,041 px in 1.36 s.
   - Curve: cubic-bezier(.55, 0, .12, 1): a slow launch, a long cruise and a soft landing. There is no
     overshoot of the scroll position.
   - On the page, `travel()` goes through `ticker.ts`: it sets the smoother's target and position, so
     the wheel smoothing and the travel do not fight.
   - Any wheel, touch or key input stops the travel at once, and the page stays where it is.
4. **Landing:** the project's title settles (rises from 14 px, spring, 700 ms). Focus moves to the
   heading (`preventScroll`), and the hash is set with `history.replaceState`, so Back keeps working
   as today.
5. **Still twin:** with reduced motion or `?still`, the page jumps at once and focus moves. Without JS,
   the plain anchor still works.
6. **Measured in the comp** (`comps/a-travel-1440.png`): from the chip, the page passed through the
   handover (the colour drained, the temple rose, Recto came and went) and landed on English Prep at
   y 1980 = the section top, hash `#english-prep`, in about 1.16 s plus 260 ms.

## 6. Build notes for the lane that builds A

- New component `Hero.astro` (or `Brief.astro` grows): it holds the engraving, the photograph and the
  frame. `Plate.astro`'s circle, axis, diagonals and signal become the engraving's scaffold group (same
  geometry, moved to the true vanishing point). `Bostanci.astro` leaves the flow: the photograph is in
  the hero now. Its caption ("Bostancı, rain, dusk" and the note) moves to the frame's corner or below
  the photograph on phones.
- The engraving ships as one inline SVG per group, or as pre-rendered alpha WebP layers (the
  `line-twin/render.mjs` path) if the inline size is too large. The comp's SVG is 164 KB unminified.
- The arrival uses one animated mask per group (`@property --r` radial mask), never per-path dashes,
  except for the scaffold (8 paths). The handover is scroll-driven where `animation-timeline: scroll()`
  exists, and `scrub.ts` elsewhere, as for the plate today.
- Photograph: use `pc-bostanci-rain-dusk` at 1080/full width. The hero is the LCP image, so it is
  eager with `fetchpriority=high`. The circle reveal must not hide the LCP from the measure. Show the
  grey print at once and animate only the mask over the colour layer.
- Tests: the first-screen screenshot at 1440 and 390, a frame test that the photograph is never cropped
  (its box equals its 3:4 aspect and lies inside the viewport on desktop), the still twin, and the
  travel landing (scrollY equals the section top, focus on the heading).

## 7. Questions for the owner (to be asked in Turkish, with pictures)

1. A, B or C, from the three screenshot pairs. The lead recommends A.
2. In A the brief stays centred and keeps its text. Is the hairline frame wanted, or should the text
   stand free on the picture?
3. The billboard in the Bostancı photograph shows a stranger's face. In the hero it becomes large and
   sharp. Should we keep it, darken it, or blur only the face?
4. The signal turning from red to Recto's green on the way into Work: is this joke wanted?
