# The engravings: art direction and briefs (round 6)

Status: art-direction guide for the engraving line (rows S20-S24, S27, S28, S32, S34, S36).
Author: the engravings' art director (read-only lane), 2026-10-17. Evidence is from `lane/review-r6`
(f55bf5c), built and served on port 6111, captured at 1440 x 900 and 390 x 844 (DPR 3, touch).
Headless Chromium only. Every piece was rendered at full opacity, layer by layer, on `--ground`
(#121214) in `ink` (#e8e3dd), and then captured as the page shows it.

"The engravings" is the owner's name for the line drawings (S43). The owner's standard applies:
an artistic page; every structure carries an idea; accepted ideas are refined, not replaced (S26);
the moving drawings are liked more than the fixed ones (S20).

---

## 0. Audit of what exists

| Piece | File | Where | Strength | Verdict |
|---|---|---|---|---|
| Recto, temple of pages | `src/one/work/art/recto.svg` (45 KB, 3 layers) | behind Recto | `--art-o` .16 in the project hue | Keep the temple (owner: good). The surroundings are a CAD floor grid, dotted rays and concentric arcs: construction, not a place. Phone gets only `#back`, which is the floor grid alone, so on the phone there is no temple. |
| English Prep, study window | `src/one/work/art/english-prep.svg` (40 KB) | behind English Prep | .16 | Keep (owner: good). Weak points: outline-only objects, no tone, the desk runs through the title and copy. |
| Eat Map, night alley | `src/one/work/art/eat-map.svg` (70 KB) | behind Eat Map | .16 | Redraw (S21). The perspective is wrong: the window rectangles on the side walls do not converge on the vanishing point, so the walls read as flat panels. Signs, bowls with steam squiggles, map pins and lanterns are clip-art icons. Every line has the same weight and the same density from edge to edge. |
| The machine, a processor die | `src/one/rest/art/circuit.svg` (41 KB) | behind Path (and seen while How I work and the card pass), 6 % with a radial mask | .06 | Replace (S28). A floor plan of boxes in boxes: no subject a visitor can name, no depth, no light. |
| Istanbul band | `src/one/rest/art/istanbul.svg` (53 KB) | under the postcards, 8 % | .08 | Replace with a member of the Istanbul series (S34). Generic mosques made of the same template twice, houses as boxes, a clip-art ferry, a toy bridge. |
| Park through the lens | `pc-park-through-lens.svg` (18 KB) | postcard 1 back | burnished gold | Keep the lens and the trees' massing; remove or replace the walker (S22): a stick figure, the only figure in the series drawn as a symbol. |
| Metro platform | `pc-metro-platform.svg` (8 KB) | postcard 2 back | gold | Redraw (S23). It is a trace of the photograph, and the photograph is already on the same back as the stamp, so the drawing repeats it at a lower quality. The figures are filled with straight parallel lines that ignore the body; the perspective rays are left in as decoration. |
| Cat on the sea wall | `pc-cat-sunset-silhouette.svg` (9 KB) | postcard 3 back | copper | Redraw (S23). The cat is a cartoon (round eyes, smile lines, vertical bar fill); the sun is three concentric circles and a stick; the sea is dashes. It reads as an icon, not as a plate. |
| First-screen plate | `src/one/Plate.astro` (construction circles, a horizon, a red point) | behind the brief | low | Not an engraving yet. The first screen at both sizes is text on an empty ground with a strip of the Bostancı photo at the bottom (S32). |
| Record | none | behind the Record strip | n/a | Missing (S27). Only reel rings. |

The common cause of "cheap" in every piece the owner rejected:

1. One stroke width everywhere (`stroke-width="1"` with `vector-effect: non-scaling-stroke`). A burin
   line swells and tapers; a uniform line reads as CAD or as an auto-trace.
2. Tone is missing. Objects are outlines. Where tone exists it is straight parallel lines laid over a
   shape without following its form (metro figures, cat).
3. Shapes are symbols (a circle for the sun, rectangles for windows, a pin icon), not observed forms.
4. Density is even from edge to edge, so there is no focal point and no breathing space, and two
   scenes that meet cannot hand over (S20).
5. Construction lines (dotted rays, grids, arcs) are left in as ornament.

The motion collision (S20) has a second, mechanical cause, measured in the build:
`work.css` gives the short block `.proj[data-short] .fl-art { top: -24% }`, and Eat Map is the short
block. Its alley is lifted about 250 px into English Prep's block at 1440, and the hold then raises it
another 18 % of the view (`flight.ts`, HOLD_RISE). At 1440 the art box is `max(1520px, 106vw)` by
1/1.6 = about 954 px high, in blocks of 855 px, and both drawings are full-bleed to their edges. In
the frame at the English Prep to Eat Map handover the desk, the lamp and the alley's windows lie on
top of each other across the title "english prep." (capture `page-d-006.png`).

---

## 1. Style rules

### 1.1 What makes a master's plate, not a trace

A plate reads as engraved when three things are true at once: the line has a body (it swells and
tapers), tone is built from lines that follow the form, and the composition has a focus with a
falloff to the edges. A trace has none of these. References to study (public-domain plates):
Dürer's engravings (contour hatching on cylinders), Goltzius and Mellan (swelling single lines),
Piranesi's Vedute di Roma (architecture, staffage, sky, cross-hatched shadow), the plates of
Diderot and d'Alembert's Encyclopédie (machines and workshops, exploded views), Gustave Doré's
London (night streets), Thomas Allom's "Constantinople and the Scenery of the Seven Churches of
Asia Minor" (1838, Istanbul views drawn for steel engraving), banknote and stamp engraving
(guilloche and line-tone portraits; the ID card's rosette is already in this family).

### 1.2 Line weights (in CSS px at the size the plate is shown)

| Role | Weight | Notes |
|---|---|---|
| Hairline: sky ruling, far detail, light-side hatching | 0.5-0.7 | never below 0.5 px at DPR 1 |
| Fine: mid-ground detail, hatching in half-tone | 0.8-1.0 | |
| Contour: the edge of a form | 1.0-1.6, tapered | heavier on the shadow side, thinner toward the light |
| Accent: the focal subject's shadow-side contour | up to 2.2 at the swell | at most 5 % of all line length |

Every line longer than about 12 px is a tapered shape (a filled outline whose width goes from about
30 % at each end to 100 % in its body), not a stroke. Lines that end in another line end thin, never
blunt. Weights are set for the size the plate is shown at, not the file size: a plate shown at 0.62
scale on the phone (950 px art box) needs its own phone master or weights that survive the scale.

### 1.3 Tone: hatching, cross-hatching, stippling

- One light source per scene, from the upper left at about 40 degrees, the same in every scene of the
  series. Shadow sides and cast shadows are hatched; the lit side is the ground (no line).
- Four tones only: ground (light), single hatching (about 25 % ink cover), cross-hatching at 45-60
  degrees to the first set (about 45 %), and a third set or a denser cross (about 65 %, used only in
  the deepest shadow near the focus).
- Hatching follows the form: curved on columns, domes, trunks, bodies (contour hatching); straight and
  aligned with the vanishing direction on planar walls; horizontal ruling for still water and skies.
- Spacing: 3-4 px for the darkest set, 5-7 px for the half-tone, never under 2.5 px (moiré on the
  phone and in the raster bake).
- Stippling (dots, or the engraver's dot-and-lozenge between crossed lines) is for transitions only:
  the turn of a dome, a cloud's edge, skin, foliage in light. Not for whole areas.
- Water: horizontal broken ruling whose gaps widen toward the light road; reflections as vertical
  breaks in the ruling, not as drawn shapes.
- Skies: either empty ground or fine horizontal ruling that thins toward the top. Clouds by
  leaving the ruling out, with a stippled edge. Never outlined clouds.

### 1.4 Detail density and focus

- Each plate has one focal point. Detail density (line length per area) peaks there and falls
  toward the edges of the box. The outer 18 % at the top and bottom of a project scene holds at most
  one continuing line (see 1.8).
- Text keeps a clear zone: no hatching and no contour crosses the title, the one-line description or
  the button. Measured as: ink cover under each text box's bounding box plus 24 px is under 3 % at
  display size. Engravers kept a cartouche clear; we keep the text's.
- Detail must be real: each window has a reveal and a sill; each column has entasis and fluting;
  each tree has masses of foliage with a lit and a shadow side. If a part cannot be drawn with that
  care at that size, leave it out (simplify by omission in the light), never by turning it into a
  geometric primitive.

### 1.5 Perspective

- Architecture is constructed, not eyeballed: a real camera (eye height, focal length, vanishing
  points) and real geometry. Two-point perspective for streets and buildings seen at a corner; one-
  point only for a deliberate axial view (the temple). All orthogonals meet at their vanishing
  point within 2 px; the reviewer checks this with an overlay.
- Atmospheric perspective by weight: far forms in hairline with little hatching, near forms with full
  tone.
- Construction lines never stay in the final plate.

### 1.6 How a subject is simplified

Keep the silhouette, the structure (how it stands up) and the one detail that names it (the Maiden's
Tower's lantern, the temple's paper-stack columns, the barracks' arcades). Drop surface texture in
the light, repeated small parts beyond three repetitions (draw three windows fully, suggest the rest
with the reveal shadow only), and anything that would need text. No lettering inside a plate, no
signs with words, no symbols (the repo rule: symbols come from `tools/icons`). Figures (staffage)
are small, massed with hatching, gestural, after Piranesi: a body is a shape with a lit and a shadow
side, never limbs drawn as single lines.

### 1.7 Motion layers

- Three layers per scene, as now: `#back` (sky, far city, the deepest tone; moves at 0.85), `#mid`
  (the subject; moves with the page, stays painted), `#front` (framing elements close to the eye:
  a branch, an awning, a column edge, a lantern; 1.15 with pointer parallax).
- The split follows depth in the picture, not object type. A layer must read alone at its strength:
  the reviewer checks each layer render alone (as done in this audit).
- The phone takes one layer today (`art.ts`: back only). This lost the temple and the alley on the
  phone. Rule: every scene has a phone master (390 px column, portrait-leaning, about 950 x 1300
  user units), single layer, that holds the subject. Desktop and phone may be different designs.
- Draw-on: the Shopify line reveal (stroke 3 s, cubic-bezier(.34,.22,.47,.84)) is allowed only for
  the first-screen plate and the postcard backs (they already draw on by path length). Tapered lines
  are fills, so a draw-on uses a mask along a hidden centre path, not `stroke-dashoffset` on the fill.

### 1.8 How a scene hands over to the next

- A scene's ink fades to zero over the top and bottom 18 % of its box (in the drawing itself, not
  only a CSS mask), except one handover thread.
- The handover thread is one line or one form that two neighbouring scenes share and that carries an
  idea: the horizon line, a cable, a shelf edge, the tape. Recto to English Prep: the temple's
  stylobate line becomes the wainscot rail of the study. English Prep to Eat Map: the window's
  Bosphorus water line becomes the alley's kerb or the shoreline under the fish market.
- At any scroll position at most two scenes are visible, and in their overlap their summed ink
  cover is not more than the denser one's alone. Measured on a frame sequence (50-100 ms) of a
  steady scroll through each handover at 1440 and 390.
- The layout fix is mechanical and belongs to the Work builder: remove the -24 % lift of the short
  block's drawing (compose Eat Map's places low in its own box instead), and keep each art box's
  vertical overflow under 10 % of the block.

### 1.9 Opacity on the Graphite ground

The owner finds today's strengths very elegant. Keep the ladder and tie it to layers:

| Use | Strength (ink alpha) |
|---|---|
| Project scene, `#back` | .10-.12 |
| Project scene, `#mid` (subject) | .16 (today's `--art-o`) |
| Project scene, `#front` | .18-.20 |
| Ambient bands (How I work, Record, under the postcards) | .06-.09 |
| First-screen plate | .14-.22 (it is the picture, not a texture) |
| Postcard backs | as today (burnished metal on the back's ground) |

Ink is the project hue mixed into `--ink` (`--art-ink`, 72 % hue) for project scenes and `--ink` for
the rest. Strength is baked into the strokes (`art.ts`), not set as a group opacity. The tonal
range comes from line density, never from mixing several opacities in one layer.

### 1.10 Production and checks

- Drawn by code, deterministic, seeded, in `tools/illustrations/` (a new `engrave/` kit beside the
  postcard primitives). Needed primitives: a tapered line (offset of a centre path by a width
  profile, output as a fill), a hatch fill clipped to a shape with a direction field and a
  spacing-from-tone map, cross-hatch, dot-and-lozenge stipple (Poisson disc with a density map), and
  a small 3D projector with hidden-line removal for architecture (boxes, prisms, arches, domes
  placed in 3D, projected by one camera; face shading drives hatch tone). Blender is not installed in
  this container, so the projector is the way to get correct perspective here.
- No photo edge-detection (`line-twin.py`) for any engraving that is shown as a drawing. A photo may be
  used only as a reference for proportions, by the illustrator's eye.
- Size budget: project scene desktop master at most 140 KB raw and 45 KB gzip; phone master at most
  70 KB raw; ambient bands at most 90 KB raw; postcard back drawings at most 30 KB; first-screen
  plate at most 180 KB raw for desktop and 100 KB for phone. Tapered fills cost more bytes than
  strokes: round to whole units at display scale and merge each layer's fills into one path.
- Review loop per piece: the illustrator delivers the full-opacity render of each layer, the
  composite, the page capture at 1440 and 390, and a frame sequence of its handover. The reviewer
  answers four questions: does it read as a plate (weights, tone, focus)? Is the perspective right
  (overlay)? Is the text's clear zone clean? Does the handover stay within one scene's density?

What to avoid everywhere: uniform weight; outline-only objects; icons (pins, steam squiggles,
bowls, hearts, gears); edge-detected traces; CAD grids and dotted construction left in; mirrored
symmetric copies; concentric circles as a sun; full density to the box edge; text or letters
inside a plate; more than one light source; hatching that ignores form.

---

## 2. Briefs

Each brief gives the subject, the composition, the layers, the size budget and what to avoid. "Ask"
marks a point for the owner (S44).

### 2.1 Eat Map scene (S21)

- Idea: the map becomes the street. Eat Map turns places to eat into points on a map; the plate
  shows a plan that rises into the street it describes.
- Subject: an Istanbul eating street at dusk, after the Kadıköy market streets (Güneşlibahçe Sokak):
  awnings, fish on ice in crates, a lokanta window with trays, a simit cart, hanging bulbs on a
  cable, wet cobbles. Ask: Kadıköy, or another street the owner eats in.
- Composition, desktop: two-point perspective, eye height 1.6 m, the street turning away to the
  right; the lower third is a cadastral plan in the manner of the Pervititch insurance maps of
  Istanbul (blocks hatched by type) that folds up into the street's ground plane at a kerb line. The
  three "places" (today's pins and their route line, which the flight animates) become three lit
  doorways or lamps in the street and three plan marks on the map, joined by the route. The focus is
  the nearest lit doorway, low and left of centre, clear of the title zone.
- Composition, phone: portrait; the street climbs up the screen (a steep street with steps, common in
  Kadıköy and Cihangir), the plan at the bottom, the route rising through it.
- Layers: back, far street and roofs with chimneys and a minaret in hairline; mid, the street fronts,
  awnings, crates, the cart, the plan; front, a hanging bulb cable and an awning's edge at the top.
- Handover: its top edge takes English Prep's water line as the far shoreline at the end of the
  street (the market streets run down to the pier).
- Budget: 140 KB raw desktop, 70 KB phone.
- Avoid: neon, cyberpunk signs, letters on signs, pin icons, bowls with steam squiggles, a one-point
  corridor of flat rectangles, lanterns as wire globes.

### 2.2 Recto surroundings (S36)

- Keep the temple exactly as the owner liked it (columns as paper stacks, the light table inside,
  sheets in the air). Refine the line: tapered contours, entasis, tone on the shadow side of each
  column (contour hatching), a cast shadow of the portico on the cella wall.
- Idea for the surroundings: a temenos, a sacred precinct with a wall. Recto runs entirely in the
  browser and uploads nothing: the files stay inside the wall.
- Composition: the temple centred (the axial one-point view stays: it is the one place where
  symmetry carries the idea). Around it a low precinct wall with a gate in front, two stoa wings at
  the sides receding to the vanishing point (their colonnades as shelves of bound volumes), two or
  three cypresses, a paved court (stone joints in perspective, replacing the CAD grid), a far line
  of hills in hairline. The sheets in the air stay but become a few large, well-drawn folios with
  curl and shadow, plus fine distant ones. The concentric arcs become an engraved sky: fine
  horizontal ruling with a radiating glory behind the pediment, the classical engraver's sunburst.
- Phone: the temple and the gate fill the column; the stoas drop out. The temple must be in the
  phone master (today the phone shows only the floor grid).
- Layers: back, sky ruling and hills; mid, temple, stoas, court; front, the precinct gate posts and
  two folios close to the eye.
- Handover: the stylobate line continues as English Prep's wainscot rail.
- Budget: 140 KB raw desktop, 70 KB phone.
- Avoid: the CAD floor grid, dotted rays, corner registration marks, more sheets than the eye can
  read, filling every gap.

### 2.3 Park walker (S22)

- Recommendation: remove the walker. The plate is about the lens: the courtyard inside it is drawn in
  full and continues outside in dashes. A single small figure takes the eye off that idea.
- If the owner wants a figure: two distant students as Piranesi staffage, about 22-26 px tall on the
  desktop card, massed with hatching (a coat with a lit and a shadow side, a bag), walking on the
  diagonal path, in the mid-ground under the trees. Not a realistic portrait (the owner said a fully
  realistic man may be too much).
- Also refine the trees: foliage masses with contour hatching that turns with each mass, trunks
  with tapered contours; the fingers at the left edge as tone, not as two hatched blobs.
- Budget: 22 KB. Avoid: limbs as single lines, a round head on a stick, a figure in the clear centre.

### 2.4 Metro back (S23)

- Idea: the back shows what the photograph cannot. The photograph (a stamp on the same back) shows
  the platform; the engraving shows the station as an Encyclopédie cutaway: the street, the stairs
  and the ticket hall above, the platform and the train below, in one section.
- Composition: a vertical section, slightly oblique (a two-point view from below street level),
  street life tiny at the top, the train's car in the lower half with its doors open, two figures on
  the platform massed with hatching (one with the red bag of the photo: its single colour accent
  stays, as the owner liked the colour detail on the backs). The tunnel's vault in contour hatching.
- Ask: which line and station (the photo's train has the old Istanbul metro livery); the drawing can
  then show the real station form.
- Budget: 30 KB (the back draws on by path length: keep each path's length meaningful).
- Avoid: tracing the photograph, perspective rays left as decoration, motion streaks as straight
  lines, figures filled with parallel bars.

### 2.5 Cat back (S23)

- Idea: the sea wall at sunset as a classical sea view, with the cat as the small living point of it.
- Composition: the Marmara horizon low, the Princes' Islands as hairline silhouettes on it, the sun
  as the engraver's burst (fine radiating lines and a ruled disc, not circles), its road on the
  water as widening gaps in horizontal ruling, the sea wall's boulders in the foreground in
  cross-hatched shadow. The cat sits on the wall at a third of the width, small (a fifth of the
  plate height), seen against the light: a silhouette built from fine hatching that follows the
  fur (curved over the back, short strokes at the ears), with a thin lit rim from the sun.
- Ask: where the photo was taken (Bostancı or Moda shore?), so the islands' outline is right.
- Budget: 30 KB. Avoid: cartoon eyes and smile lines, vertical bar fill, concentric-circle sun,
  dashes as water, a cat larger than the sea.

### 2.6 How I work background (S28)

- The current "machine" (a processor die) is replaced.
- Idea: the Jacquard loom. Weaving by hand and weaving by a programmed machine meet in the same
  cloth, and the loom's punched cards are the ancestor of programming (the brief: "the machine's own
  language"). It is a subject a visitor can name, and it is native to engraving (the Encyclopédie's
  weaving plates).
- Composition: a frontal elevation of a Jacquard loom, wide (1600 x 600 band), the warp threads as
  long fine verticals that align with the two lanes of How I work (left lane: the weaver's hand and
  shuttle; right lane: the card chain of the Jacquard head), the drops of the lanes falling along
  warp threads. The woven cloth at the bottom carries a small pattern where the two meet ("Both
  matter."). Tone by hatching on the timber frame; the card chain in fine stipple.
- Alternative if the owner prefers landscape: a confluence of two rivers seen from above as an old
  survey plate (two streams, one natural, one canal, joining). Ask the owner to choose.
- Layers: one ambient layer (it moves with `--sp`, as now), strength .06-.08; on the phone a vertical
  crop: the warp and the card chain only.
- Budget: 90 KB raw. Avoid: boxes in boxes, circuit traces, any floor plan, gears as icons.

### 2.7 Record scene (S27)

- Idea: the record is a tape that keeps everything. The tape spine stays (S5); the scene is where
  the tape comes from.
- Subject: an exploded engraving of a tape transport, in the Encyclopédie manner: two reels, the
  capstan and pinch roller, guide posts and the head, drawn with section hatching, the tape leaving
  the mechanism and becoming the strip's timeline spine. The loved recorder object stays the one
  rendered object (T8, V4: the objects study); the engraving is its line family, behind and above it.
- Composition: desktop, the mechanism upper left of the strip, under the title's clear zone, the
  tape's path curving down into the spine; the reel rings that exist now become the reels' engraved
  flanges. Phone: the reels at the top, the tape falling straight into the spine.
- Layers: back, the reel flanges in fine contour hatching (.06); mid, the mechanism (.09); the tape
  itself is the existing spine element, not part of the drawing.
- Handover: from the postcards' Istanbul band, the ferry's wake or the horizon becomes the tape.
- Budget: 90 KB raw desktop, 50 KB phone. Avoid: a cassette icon, a second rendered object, text.

### 2.8 The first-screen plate (S32)

- Model: Shopify Editions, the Renaissance edition (`docs/research/references/clips/shopify-editions/
  clip-arrival.webp`, `img/shopify-dj00.webp`): a full-bleed picture with the text framed in its calm
  centre; the picture is the first impression. The content and layout of the brief stay (G1, S42).
- Idea: the person in their city. The brief says Istanbul and YTU; the plate shows Istanbul, and the
  Bostancı photograph is a window cut into the engraving (a photograph printed into the plate).
- Desktop composition (1440 x 900): a wide Bosphorus panorama as the lower 40 % (the Asian shore and
  the Maiden's Tower at the left third, the historic peninsula skyline far right in hairline, a
  ferry and gulls); the upper 60 % is an engraved sky of fine horizontal ruling that thins upward,
  with a clear cartouche-shaped zone where the name and the brief sit. The construction circle of
  today's plate becomes the sun's ruled disc behind the name (an idea carried, not replaced). The
  Bostancı photo sits low centre as a vertical window in the plate with a plate mark, its top edge
  peeking above the fold, so scrolling reveals it out of the engraving (and the line-twin crossfade
  can turn the engraved window into the photo).
- Phone composition (390 x 844): portrait. The Maiden's Tower is the vertical subject: it stands in
  the lower half on its rock, the water ruling around it, the Asian shore as a thin band behind; the
  name and the brief above in the sky zone. Not a crop of the desktop plate.
- Layers: back, sky ruling and the far skyline (moves slowest); mid, the shore and the tower; front,
  water ruling and a gull or two close to the eye; pointer parallax on desktop; a 3 s draw-on at
  arrival, with every entrance finishing; a still twin.
- Budget: 180 KB raw desktop, 100 KB phone.
- Avoid: a skyline strip of template mosques, clip-art ferry, filling the text zone, more than one
  focal point, a cropped photo strip at the bottom (P1).

### 2.9 The Istanbul series (S34)

One series, one light (upper left, late afternoon from the Asian side), one weight scale, so any
two plates can sit next to each other. Each plate is a long-term piece; it serves the page where it
fits. The order to make them:

1. The Bosphorus panorama (first screen, desktop; 2.8).
2. The Maiden's Tower (first screen, phone; 2.8). Facts to draw right: a small island off Salacak,
   Üsküdar; a square stone base with a terrace and a tall tower with a lantern-domed top; the
   present form dates from the 18th century with later changes, restored 2021-2023. Ask for the
   owner's photos for the post-restoration details.
3. Under the postcards (replacing `istanbul.svg`): Bostancı pier and ferry at dusk, matching the
   photographs' places (Bostancı, the Marmara shore), with the Princes' Islands far out.
4. Galata Tower and the Golden Horn from Karaköy, for the Record page or a later band.
5. Rumeli Hisarı and the Fatih Sultan Mehmet Bridge, for a long horizontal band.
6. Haydarpaşa station from the water, a strong silhouette (the station of departures).
7. A vapur (city ferry) in detail, as a small recurring plate (end-of-page or 404).

Ask the owner which places are theirs (the owner said "different places of Istanbul"): the plates
should be places the owner lives in, not a tourist list. Budget: 120 KB raw per band plate.
Avoid: template domes copied twice, minarets as sticks, the bridges as toy curves, gulls as "v".

### 2.10 YTU Davutpaşa campus (S34)

- Where: behind the ID card (YTU is on the card) and behind Path's "First term at YTÜ".
- From knowledge (to be checked against photos): the campus holds the Davutpaşa barracks (Davutpaşa
  Kışlası), an Ottoman barracks of the 1820s-30s, restored and used by the university as a cultural
  and congress building: a long two-storey façade with rows of arched windows, a courtyard, and a
  central gate. The campus entrance is a large concrete gate structure; the repo holds one photo of it
  (`content/photos/eren-ytu-gate.jpg`: a long cantilevered concrete lintel over wide steps, trees
  behind). There is green space with mature trees and paths (the park postcard is taken there).
- Composition: desktop band, the barracks' arcaded façade in two-point perspective from the
  courtyard corner, trees in front at the right; the concrete gate as a second plate (modern
  brutalist forms are excellent engraving subjects: the board-formed concrete as fine horizontal
  hatching). Phone: the gate in portrait, steps rising.
- Needs the owner's reference photos (marked, required before drawing): the barracks façade and its
  courtyard (several angles, daylight), the gate from the front and from the steps, any other campus
  building the owner finds elegant, and the trees by the park path. Without them only the gate can be
  drawn honestly.
- Budget: 120 KB raw per plate. Avoid: inventing façade details, a generic Ottoman building,
  drawing from the selfie's blurred background beyond the gate's mass.

### 2.11 Motion separation of the project scenes (S20)

- Goal: the moving scenes stay (the owner prefers them); they never pile up. Controlled sharing only
  at the handover thread.
- Drawing side (illustrators): each scene's ink falls off over the top and bottom 18 % of its box;
  one handover thread per pair (Recto stylobate to English Prep wainscot; English Prep window water to
  Eat Map shoreline); the front layer carries nothing in the outer 25 % of the box height, because
  it moves fastest (1.15) and is the first to collide.
- Layout side (Work builder, not this lane): remove `.proj[data-short] .fl-art { top: -24% }` and
  compose Eat Map's places low in its own drawing instead; keep each art box within 10 % vertical
  overflow of its block; check the hold rise (18 % of the view) against the scene above.
- Acceptance: a steady-scroll frame sequence (50-100 ms) through both handovers at 1440 x 900 and
  390 x 844 (DPR 3). In no frame do two scenes' subjects overlap; the summed ink cover in the overlap
  band is not more than the denser scene alone; the handover thread is continuous across the frames.

---

## 3. Questions for the owner (S44), to be asked in Turkish with a short brief

1. Davutpaşa: reference photos of the barracks, its courtyard, the gate, and any building the owner
   finds elegant (required).
2. Istanbul: which places are the owner's own; photos of the Maiden's Tower after the restoration
   if the owner has them.
3. Eat Map: which street (Kadıköy market, or another).
4. Metro photo: which line and station. Cat photo: which shore.
5. Park postcard: remove the walker (recommended), or two small massed figures.
6. How I work: the Jacquard loom (recommended) or the river confluence.

## 4. Line of work (suggested)

One art director (this guide), one illustrator per piece in parallel (the files do not overlap), one
reviewer who did not draw the piece, and one Work builder for the layout fix in 2.11. The kit
(1.10) is built first, by one builder, and every illustrator uses it; a piece is not reviewed until
its layer renders, page captures and handover frames exist. Order: kit; motion separation and the
Eat Map scene (S20, S21); first-screen plate (S32); metro and cat backs (S23); Recto surroundings
(S36); How I work band (S28); Record scene (S27); park walker (S22); then the Istanbul and Davutpaşa
series as photos arrive.
