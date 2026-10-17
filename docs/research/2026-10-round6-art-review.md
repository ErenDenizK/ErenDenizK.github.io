# The engravings: art review (round 6)

Status: art review, read-only lane, 2026-10-17. Reviewer did not draw any piece.
Measured against `round6/engraving-guide.md` (sections cited as §). Rows: S20-S24, S27, S28, S32, S34,
S36, S48.

## Method

- Build: `scratchpad/wt/r6-work` at 790073d, `BASE_PATH=/ npm run build` (the first plain build came
  out under `/Portfolio/`, so every asset returned 404 on a root server), served by
  `node tests/serve.mjs dist 6511 /`. Headless Chromium only.
- Full opacity: every SVG rendered in ink #e8e3dd on #121214 at 1600 px wide, alone and layer by
  layer (`ar/full/*.png`, `*-L<layer>.png`). The eight first-screen layers were composited
  (`ar/signal-composite.png`, `ar/signal-phone-composite.png`).
- As shown: Home at 1440 x 900 and 390 x 844 (DPR 3, touch), every 0.6 view (`ar/page/`); 2x zooms of
  details (`ar/zoom/`); the same positions with the sheets and the copy hidden, to see where each
  scene's subject sits (`ar/bare/`); the three postcard backs turned, at 300, 900, 1800 and 3500 ms
  (`ar/backs/`).
- Motion: steady scroll positions through Work, 60 px steps, 1300 to 3500 at 1440 and 1300 to 3700 at
  390 (`ar/seq/`). Limitation: a screenshot costs 300-660 ms in this rig, so this is a position
  sequence, 60 ms after each step, not a true 50-100 ms time sequence. Layer lag and easing were not
  measured in time.
- Layer speeds read from `src/one/work/scripts/art.ts`: back 0.85, mid 1, front 1.15 (pointer
  parallax 4 / 10 / 18 px); phone takes the phone master, else the back layer only.

All files above are under `(session scratchpad) round6/ar/`.

## Grades at a glance

| # | Piece | File(s) | Grade | One line |
|---|---|---|---|---|
| 1 | Recto, temple in its precinct | `work/art/recto.svg`, `recto-phone.svg` | B- | Temple refined well; surroundings still half construction; the subject sits under the screen sheet. |
| 2 | English Prep, study window | `work/art/english-prep.svg` | B- | Accepted and well layered, but now out of the family's line; the desk runs through the title. |
| 3 | First-screen plate (Bostancı platform) | `art/signal/signal-*.svg` (8 + 8 phone) | C+ | The idea is right; the drawing is a perspective study, not a plate. |
| 4 | Metro back | `rest/art/pc-metro-platform.svg` | C+ | Right concept (cutaway), draws on well; figures and train are still symbols. |
| 5 | Park back | `rest/art/pc-park-through-lens.svg` | C+ | Walker gone (S22 done); trees are scalloped icons with blanket hatching. |
| 6 | Eat Map, market street | `work/art/eat-map.svg`, `eat-map-phone.svg` | C | A real step up from the alley; a sketch, not an engraving; layers carry no depth. |
| 7 | Record transport | `rest/art/record-{flange,takeup,mech}{,-phone}.svg` | C | Three parts float apart; the tape does not leave the mechanism. |
| 8 | Bostancı pier band | `rest/art/bostanci-pier.svg` | C- | Ruling with a black hole for the sun and a box ferry; invisible as shown; collides with Record. |
| 9 | How I work loom | `rest/art/loom.svg`, `loom-phone.svg` | C- | Still boxes; a visitor cannot name it as a loom. |
| 10 | Cat back | `rest/art/pc-cat-sunset-silhouette.svg` | D | Still a cartoon cat, and the sea is dashes: both are on the guide's avoid list. |
| L1 | Bosphorus panorama (lab only) | `art/series/bosphorus.svg` | C- | Gulls as "v", box ferry, template domes, a spiked disc sun. |
| L2 | Maiden's Tower (lab only) | `art/series/maidens-tower.svg` | C- | Boxy tower with a cone roof; the real lantern-domed form is missing. |
| L3 | Davutpaşa Orta Bahçe (lab only) | `art/series/davutpasa.svg` | D+ | Reads as a planter tray seen from a drone, trees as stamped blobs. |

No piece reaches A. The owner's bar ("a masterpiece", S24, S40) is not met by any piece yet; Recto and
English Prep come closest, and both are the ones the owner already called good.

## The set as a whole (coherence)

1. Three line families are on the page at once (§1.2, §2.9 "one weight scale"):
   - uniform 1 px non-scaling strokes: English Prep, park back;
   - tapered fills ("burin"): Recto, Eat Map, metro, cat, record, loom, first screen;
   - ruling-only plates: pier band, cat sky and sea, Bosphorus, Maiden's Tower.
   Next to Recto, English Prep now reads as CAD; next to the metro back, the park back reads as a
   different hand. Decide the one family (tapered fills) and bring English Prep and the park into it
   without changing their composition (S26: refine, not replace).
2. The tapered fills are too thin to show their taper as shown. At `--art-o` .16 and 0.62-0.95 scale the
   swell of a contour is under one device pixel, so the gain over strokes is mostly lost on the page.
   Accent contours (§1.2, up to 2.2 px at the swell, at display size) are not present anywhere.
3. Light: no common source. Recto is back-lit by the glory; Eat Map is lit from the doorway; the series
   and the cat put the sun in the picture. Hatching on the shadow side is either absent or the same
   45 degree set on every mass, so the "upper left at 40 degrees" rule (§1.3) is not visible in any piece.
4. Construction left in (§1.5, §1.10): first-screen rays, circle and axis; Recto court grid and the long
   verticals from the cypress bases; the first-screen tree contour scribbles.
5. Symbols still in the set (§1.6): the doorway silhouette (Eat Map), bulbs as circles on stalks, map
   rings, the cat, round-headed figures (metro), cloud-scallop trees (park), "v" gulls and box ferries
   (pier, Bosphorus), the zig-zag spring (record), spiked disc suns (Bosphorus, Maiden's Tower).

## Motion and depth (S20, S48)

- Separation at 1440, positions 1300-3500: no frame shows two subjects on top of each other; the S20
  pile-up is fixed. Recto to English Prep leaves a clean gap of about 100 px (y 1420). English Prep to
  Eat Map does not hand over, it butts: at y 2140-2200 the desk's drawers end and Eat Map's building
  tops begin on the same horizontal, a visible splice line, with no shared thread (§1.8). Eat Map's
  verticals run to the top edge of its box (no 18 % falloff).
- Separation at 390: clean in every position; each scene shows alone.
- Depth: the layer split makes almost no parallax in two of three scenes.
  - Recto: back is a faint sky band and glory, front is two small folios; the temple, stoas, cypresses
    and court are all mid. Depth reads as one sheet.
  - Eat Map: back is a 100 px strip of far water and a minaret; front is the bulb cable only; 95 % of
    the ink is in mid. Depth reads as one sheet.
  - English Prep: the only scene whose split follows depth (wall and window back, desk mid, branch front).
    It is also the only one that reads as moving in depth. Copy its split.
  - Speeds 0.85 / 1 / 1.15 with 4 / 10 / 18 px pointer parallax are gentle; with the layers above they
    produce little visible depth. After the layers are re-split, try 0.8 / 1 / 1.25 and front 24 px, and
    measure for stutter (S15: visible and joyful as long as it does not stutter).
- Phone: English Prep has no phone master, so the phone shows the back layer only: the window survives,
  the desk is gone. Recto and Eat Map phone masters work as single layers.
- Composition against the moving objects: the focal subject of each project scene sits under the flying
  screenshot sheet. At 1440, y 900, the temple is wholly behind the Recto sheet; on the phone the
  temple sits behind the sheet at the top of the block. As shown, Recto's scene reads as cypresses and
  folios only. The English Prep window is also behind its sheet at y 1420. Either place the subject
  where the sheet is not at rest (to its side or below), or let the sheet's travel reveal it.
- Rest of the page: the pier band's water ruling runs across the Record take-up reel at y 6300 (two
  scenes' ink summed, §1.8). The loom moves with `--sp`; no collision.

## Piece by piece

### 1. Recto, temple in its precinct: B-

What works: the temple (paper-stack columns with contour hatching, the light table, the pediment folio)
is the best drawing on the site. The glory behind the pediment is a good engraver's device. The stoas
with shelves of bound volumes carry the "files stay inside the wall" idea.

Faults:
- The court is still a CAD grid, and three long verticals drop from the cypress bases to the bottom of
  the box (x about 405, 475, 1125 of 1600): construction left in.
- The sky ruling is cut as two rectangles with hard vertical edges at x about 430 and 1170. It reads as
  two hatched panels, not a sky.
- Cypresses are symmetric lens outlines filled with horizontal ruling that ignores the form (§1.3).
- The centre of the court is an empty black rectangle; on the phone master it is framed by two long
  verticals, so the text's clear zone is drawn as a box (a void with edges).
- No precinct wall or gate (§2.2). The temenos idea is told only by the stoas.
- The left folio overlaps the left cypress; the large folios have no cast shadow.
- Layers do not follow depth (see Motion).

Fix list:
1. Replace the court grid with stone joints in perspective that thin toward the temple, and delete the
   three verticals.
2. Let the sky ruling fade out at its ends with a stippled edge; no vertical cut.
3. Cypresses: tapered silhouette with an irregular flame edge; contour hatching that curves round the
   column of foliage, darker on the right (shadow side).
4. Draw the low precinct wall with its gate in front, in front layer; put the court's clear zone inside
   the wall, so the void becomes a place (the court), not a box.
5. Move the cypresses, stoas and wall to front and back by depth: stoas back, temple mid, wall, gate posts
   and two near folios front.
6. Lift the temple so that at rest it shows above or beside the Recto sheet at 1440 and on the phone,
   or confirm with the Work builder where the sheet rests and compose around it.
7. Give each large folio a cast shadow and a curl with contour hatching.

### 2. English Prep, study window: B-

What works: the owner likes it; the composition is calm; the layer split is by depth and reads in
motion; the window's Bosphorus is the natural handover line.

Faults:
- Uniform 1 px non-scaling strokes: out of family next to every other scene.
- Steam squiggles on the tea glass, dashed water in the window, dashed lamp rays, flower icons on the
  branch: all on the avoid list (§1.10 end).
- At 1440 (y 2140) the desk and the open book lie straight across "english prep." and its description;
  the text clear zone is violated (§1.4: under 3 % ink under each text box plus 24 px).
- No phone master: the phone loses the desk.

Fix list (refine only, keep every object and its place):
1. Convert to tapered fills at the family's weights; heavier contour on the shadow side of desk, lamp
   and window frame.
2. Water in the window: horizontal broken ruling with widening gaps toward the light; no dashes.
3. Delete the steam; delete the dashed lamp rays (let a hatched cone of shadow under the lamp say it).
4. Blossoms: five-petal forms with a hatched shadow side, not outline flowers.
5. Clear the title zone: drop the desk below the description, or open the book's centre behind the
   title; measure the cover.
6. Draw a phone master (window over desk, portrait).
7. Make the window's water line the handover thread to Eat Map's top (§1.8).

### 3. First-screen plate, Bostancı platform: C+

What works: the idea (the engraving continues the photograph in its own camera, the photograph laid in
as a print with crop marks) is strong and is the right answer to S32. The canopy edge at the right seam
continues the photograph's canopy within a few pixels. Rain as fine dashes is quiet and good.

Faults:
- It is drawn as a perspective study: uniform hairlines, long rays to the vanishing point, the
  construction circle and the vertical axis, all kept as ornament (§1.5, §1.10).
- At the left seam the engraved rails do not continue the photograph's rails: the photo's track edge
  enters the seam steeply, the engraved rails leave it at a shallow angle (zoom `first1440-0.png`).
- The houses on the left are hatched boxes; the tree line is a contour scribble like a topographic
  map; a ballast band reads as a road.
- The sky ruling ends in hard rectangles at the left and right.
- Lines cross the caption "Bostancı station in the rain, at blue hour." at 1440, and cross the brief
  copy on the phone.
- On the phone the plate is visible only below the photograph, behind the brief text, so the first
  screen at 390 shows no engraving above the fold.

Fix list:
1. Keep the circle (it carries the Plate idea) but draw it as a ruled disc of light, not a hairline;
   delete the free rays and the axis.
2. Re-project the rails, platform edges and tactile strips from the photograph's camera so every line
   meets its photographic twin at the seam within 2 px; check with an overlay.
3. Houses: real façades of the Bostancı side (balconies, roof lines, a few lit windows by omission in
   ruling), in hairline far, tone by ruling.
4. Trees: foliage masses with lit and shadow sides, contour-hatched.
5. Fade the sky ruling at its ends; keep it out of the caption box plus 24 px.
6. Phone: give the plate a part above the photograph (wires and the catenary mast continuing upward)
   so the engraving frames the name.

### 4. Metro back: C+

What works: the Encyclopédie cutaway is now the idea (§2.4); the street, the hall and the platform are in
one section; the red bag is the single colour accent; the draw-on runs contours then tone, as intended,
and finishes by 1.8 s.

Faults:
- The figures are outlines with round heads, a symbol of a person (§1.6).
- The train's front shows two circles side by side as wheels, which is wrong in a head-on view; the
  front is cartoon-like.
- Turnstiles are boxes; the earth around the section is one uniform set of 45 degree bars.
- Two cameras: the halls are frontal, the train is oblique.

Fix list:
1. Figures as Piranesi staffage: massed coats with a lit and a shadow side, no head outline.
2. Redraw the car front from the real livery (ask the owner, §3 Q4): headlights, the coupler, the
   skirt; wheels hidden by the skirt.
3. One camera for the whole section; slight two-point from below street level as briefed.
4. Earth hatching with varied length and a second set near the vault; contour hatching on the vault.

### 5. Park back: C+

What works: the walker is removed (S22); the lens idea reads; the fingers and the lens rim frame it.

Faults: tree crowns are cloud-scallop outlines with the same straight hatching laid over every mass;
grass as "///" ticks; ground as dashes; uniform stroke; the stamp on the back covers the right-hand
trees.

Fix list:
1. Foliage masses with irregular edges, contour hatching that turns with each mass, shadow under each.
2. Ground: ruling that follows the lawn's perspective; no ticks.
3. Tapered strokes at the family's weights.
4. Leave the stamp's corner empty in the drawing, or move the tree group left.

### 6. Eat Map, market street: C

What works: a real street now (awnings, bay windows on corbels, shutters, steps, a cable of bulbs, a
far minaret); the plan below the kerb is present; the route animates over the plan; nothing pins or
neon remains. S21's "very low quality" has moved to "a competent sketch".

Faults:
- Line quality: many forms are made of several near-parallel scribbled strokes. It reads as a pen
  sketch, not a burin plate (§1.1).
- Perspective is mixed: the left block is frontal (one-point), the centre and right blocks recede to
  different vanishing points. Check with an overlay (§1.5).
- The doorway figure is a head-and-shoulders silhouette icon; the steps are a bright grid like a
  keyboard; bulbs are circles on stalks.
- The plan reads as a row of hatched rectangles, and a black void splits it in two; the "plan rises into
  the street" idea is not legible.
- No falloff at the top: building edges run to the top of the box, so the scene butts against English
  Prep's desk with a seam.
- Layers: back and front are almost empty (see Motion).
- Phone master: an enlarged crop of the desktop at heavy weights, the stair is one thick zig-zag
  polyline, and the middle third is empty.

Fix list:
1. Re-draw with single, tapered contours; hatching only for tone, after §1.3.
2. One two-point camera for the street (eye 1.6 m, street turning right); re-project the left block.
3. Doorway: a lit interior by omission (no ink inside the door) with a hatched figure at most; steps
   as treads and risers with shadow under each nosing; bulbs as glass with a light core by omission.
4. Plan: Pervititch blocks with parcel lines and hatch by building type, continuous across the box, and
   fold it into the street's ground plane at the kerb line.
5. Fade the top 18 %; take English Prep's water line as the far shoreline at the street's end.
6. Re-split: far roofs, minaret and sea back; fronts and plan mid; awning edge, cable and a near crate
   front.
7. Phone master: compose the climbing street as briefed (§2.1), with steps drawn as steps.
8. Route places: three lit doorways in the street joined to three plan marks; the pink rings read as UI.

### 7. Record transport: C

What works: concentric ruling for the tape pack is a legitimate use; the reel flanges with spokes read
as reels; strength is right for an ambient band.

Faults: the large flange's tone changes across a straight diagonal (a crude light split); the mechanism
is a box on a bar between two spools; the pinch-roller arm ends in a zig-zag spring icon; the reel,
the take-up and the mechanism float apart and do not meet the recorder object or the tape spine (§2.7:
"the tape leaving the mechanism and becoming the strip's spine"); the take-up reel overlaps the
flange; the pier band's ruling crosses the take-up.

Fix list:
1. One mechanism: two reels, guides, head, capstan and pinch roller on one deck plate, exploded only
   along one axis, with section hatching on cut parts.
2. Draw the tape path from the supply reel through the guides to the spine's start point, so the spine
   is the tape.
3. Shade the flange by contour hatching round the hub, darker on the shadow side; no diagonal split.
4. Replace the spring with a real torsion spring or omit it.
5. Clear the pier band's ruling out of the reels' box (with the Postcards builder) or end it before the
   Record section.

### 8. Bostancı pier band: C-

Faults: almost all ink is sky and water ruling; the sun is a reserved black ellipse that reads as a
hole; the ferry is stacked boxes; the islands are one wavy line; the pier house is small at the far
left; as shown it is invisible behind the postcards except the pier; its ruling runs into the Record
scene.

Fix list:
1. Make the pier and a vapur at the quay the subject, at a third of the width, drawn from the photos'
   places (§2.9 item 3); the vapur with its real deck, funnel and wheelhouse.
2. Sun: ruled disc with a stippled edge and a light road of widening gaps on the water.
3. Princes' Islands in hairline with correct outlines (ask the owner, §3 Q4).
4. Keep the subject where the cards do not rest (the band's lower left or right).
5. Stop the ruling before the Record section (see 7).

### 9. How I work loom: C-

What works: the lanes' corner meets the shuttle, a good link between the layout and the picture.

Faults: still rectangles and bars, the exact S28 complaint; the Jacquard head is a box, the card chain a
ladder; the centre of the band is empty; no warp threads aligned with the two lanes; no woven cloth
where the lanes meet ("Both matter."); back layer near empty.

Fix list:
1. A true frontal elevation of a Jacquard loom after the Encyclopédie weaving plates: frame posts with
   timber grain hatching, the Jacquard head with its card cylinder and a hanging card chain with
   visible punched holes, the harness cords fanning down, the warp as long fine verticals.
2. Run warp threads behind both lanes; let each lane's drop fall along a warp thread.
3. Weave a small cloth with a pattern under "Both matter." where the two lanes meet.
4. Phone: the warp and the card chain only, as briefed.

### 10. Cat back: D

Faults: a cartoon cat outline with whiskers drawn on a back view; sky and sea as dashes; the sea wall a
flat slab with no boulders; islands as tiny bumps. Every one of these is named in §2.5 "avoid".

Fix list: draw the brief as written (§2.5): horizon low, islands in hairline, sun as a ruled burst,
light road in ruling, cross-hatched boulders, the cat small, a silhouette built from fur-following
hatching with a lit rim, no eyes, no whiskers.

### L1-L3. The lab series (not on Home)

- Bosphorus, C-: gulls as "v", a stepped box ferry, template domes, a spiked disc sun, a boxy tower. Keep
  the ruled sky and the light road; redraw every built form from references.
- Maiden's Tower, C-: a box tower with a cone roof. The real form (stone base with terrace, tall tower,
  lantern-domed top) is the one detail that names it (§1.6). Needs post-restoration photos.
- Davutpaşa Orta Bahçe, D+: a high aerial box with trees as identical scribble blobs; it reads as a planter
  tray. The owner asked for the courtyard as students know it (S46): an eye-level view inside the
  courtyard toward the arcades, trees in front, from the five references.

## What to do first (order by owner impact)

1. Cat back (D): redraw.
2. Loom (C-): redraw as a real loom.
3. Eat Map: line quality, camera, layer re-split, top falloff and handover thread.
4. First-screen plate: rails meet at the seams, construction out, houses and trees real.
5. Recto: court, sky ends, wall and gate, layer re-split, subject out from under the sheet.
6. English Prep: family weights, avoid-list items, title clear zone, phone master.
7. Record transport and pier band together (one mechanism; the band stops before it).
8. Metro and park backs: figures and trees.

## Checks the next review needs

- A true time sequence (50-100 ms) of each handover: use a screencast (CDP `Page.startScreencast`) or
  video recording, not one screenshot per step.
- A perspective overlay for Eat Map, Recto stoas and the first-screen seams.
- Ink cover under each text box plus 24 px, measured on the as-shown capture.
