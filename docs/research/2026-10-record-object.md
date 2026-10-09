# Research: the Record's object (2026-10-09)

**Why:** brief §7 (2026-10-09, after seeing v0): "the microphone looks too simple; rethink it
from every angle." The family audit (C3) adds that the objects read as glossy, toy-like generic
symbols rather than crafted things in their subject's language. This file proposes three
concepts for the owner to choose from. It decides nothing.

**Method:** ten directions judged on paper, three modelled as headless-Blender scripts on the
shared rig (`rig.json`, ADR-0006) and rendered in Cycles at 600², 64 samples with denoising
(concept quality, not shipping quality). Three rounds of renders, each one looked at before the
next. Scripts: `tools/objects/record_a.py`, `record_b.py`, `record_c.py`, with shared finishes in
`record_kit.py` (brushed and spun metal, tape oxide, paper, ruled card stock).

![The shipped microphone beside concepts A, B and C, with close-ups and a 120 px read test](assets/2026-10-record-object.webp)

## What the object is about

The Record is the owner's public, dated log, written from voice notes, in three kinds (note,
entry, essay), kept up for four years. Three ideas compete for the object: **voice becoming
text**, **time piling up** and **a record of work kept in public**. The microphone has only the
first, and only as a symbol: a glass dome over a ribbed core, no engineering a sound engineer
would recognise. The page around it is becoming a warm reading room with a desk lamp
(`2026-10-page-worlds.md`, concept A), so the object should also feel at home on a desk.

## Ten directions

Judged on: reads at 120 px and at 520 px; fits the glass family and the one rig (front camera
nearly level, droplet morph at the end); has one or two named parts for a micro-interaction;
works in blue light; not a cliché; not toy-like.

| # | Direction | Says | Verdict |
|---|---|---|---|
| 1 | **Engineered valve microphone**: woven grille, visible diaphragm, glass body with the valve inside, spider mount, cable | voice | **Kept (A).** The safe step: keeps the meaning, adds real craft |
| 2 | **Open-reel tape deck**: two glass reels, one full, one just started | voice and time | **Kept (B).** Strongest outline; the tape is the four years |
| 3 | **Card-catalogue tray**: dated index cards, year dividers, one card drawn out | dated entries, the reading room | **Kept (C).** The only one that is about text |
| 4 | Waveform frozen in a glass slab, turning into lines of text | voice to text, exactly | Flat and abstract; at 120 px it is a chart. Too close to Recto's lined page. Its best idea moved onto C's card |
| 5 | Vinyl disc ("on the record") | the word "record" | A pun, and it says music, not words. A disc is a thin line from a near-level camera |
| 6 | Desk lamp over an open notebook | the reading room | The lamp is the room's light (CSS), not the subject. Two objects, competing with the page |
| 7 | Hourglass of letters | time | A cliché; letters vanish below 300 px |
| 8 | Typewriter key cluster | writing | Typing, not voice. Keycaps go toy-like fast |
| 9 | Rotary date stamp with bands of dates | dated, official | Fine craft, but says bureaucracy, and voice is gone |
| 10 | Wax-cylinder phonograph (the first voice recorder) | voice written as a groove | The best story on paper. Without the horn it reads as a rolling pin; with the horn it is the gramophone cliché |

## The three concepts

All three keep the family's language: clear glass lit by the accent backlight, Record blue only
where a meaning sits (glass, an LED, dividers), and a few material contrasts instead of a single
glossy body: brushed and spun steel, satin rubber, warm paper or tape oxide. Polished steel was
dropped after round 1: the studio environment is dark, so mirror steel rendered black.

### A. Valve microphone in a spider mount (`record_a.py`)

Woven steel grille with an anodised blue diaphragm visible through it, a thin glass body showing
the valve, its warm heater and two capacitors, a steel band with the on-air lamp, elastic cords
on two rings, a short desk stand and a right-angle plug whose cable runs off over the desk.

- **Parts:** `body`, `grille`, `band`, `capsule`, `valve`, `spine`, `mount`, `stand`, `cable`, `led`.
- **Micro-interaction:** the lamp goes on air, the heater warms up, and the microphone rocks once
  in its cords and settles: the spider soaking up a knock.
- **Render notes:** round 1's grille was too coarse and too opaque, and read as a glass-block
  lamp; round 2 used finer, thinner wire (44 rows, 96 columns) and closed the pole with a spun
  button, which removed a spike. Round 3 shortened the stand so the microphone fills more of the
  frame. Still the weakest at 120 px: tall and thin, the cage turns to noise.
- **Against:** it is still a microphone, the symbol the owner has already seen.

### B. Open-reel tape deck (`record_b.py`)

A smoked glass faceplate in a brushed steel plinth, two reels with clear glass flanges on spun
hubs, standing proud of the plate. The left reel is full and the right one has just started: the
tape still to be recorded is the years ahead. The tape runs round two steel guides under a
brushed head cover with the record lamp.

- **Parts:** `deck`, `plinth`, `reel_left`, `reel_right`, `pack_left`, `pack_right`, `tape`,
  `guides`, `heads`, `led`.
- **Micro-interaction:** the record lamp lights, both reels turn (the flange windows show the
  turn), and a little tape moves across: `pack_left` shrinks a hair and `pack_right` grows by
  the same amount, then everything comes to rest. Each new entry could add a turn, so the
  object really is the record.
- **Render notes:** round 1's pale faceplate read as painted plastic; smoked glass with an
  absorbing volume (rounds 2–3) keeps the plate dark, so the blue arrives as light through glass
  and the reels stand out. Raising the reels above the plate's top edge broke the rectangle and
  gave the outline that reads at 120 px. The hubs and lobes needed satin steel to stop rendering
  black.
- **Against:** reel-to-reel is retro. It reads as a working tool, not nostalgia, because it is
  clean and engineered, but the owner should judge that.

### C. Card-catalogue tray (`record_c.py`)

A clear glass drawer of index cards on a catalogue rod, with a steel label holder and pull, four
blue glass year dividers, and a steel follower at the back. The front card is half drawn out: a
dated heading, and on its first rule a short waveform that turns into handwriting. It is the
only concept that shows a voice note becoming an entry.

- **Parts:** `tray`, `cards`, `dividers`, `card`, `rod`, `plate`, `follower`.
- **Micro-interaction:** the drawn card lifts out of the stack, tips slightly toward the viewer,
  and drops back. With the three kinds of entry: a note lifts a little, an essay all the way.
- **Render notes:** round 1's writing was even bars that read as interface placeholders; rounds
  2–3 split it into words of uneven length on a wandering baseline. The year tabs were raised so
  they show above the stack. The close-up (waveform into writing) is the best single image in
  the set.
- **Against:** at 120 px it is "a box with a card", close to a generic archive icon; the
  waveform only reads from about 300 px.

## Recommendation

**B, the tape deck.** It is the only concept that holds both halves of the Record: the dictated
voice (a recorder) and the years piling up (a full reel and an empty one). It has the clearest
outline of the four at 120 px (two circles on a plate), its interaction is both natural and
meaningful (reels turn, tape moves from past to future), and its glass reels give the backlight
something to pass through. Two things could come across from C: the waveform-into-writing
motif as a small screen-printed mark on the faceplate, and year marks on the tape pack's edge.

C is the alternative if the owner wants the reading room more than the voice; A if the
microphone should stay and only gain craft.

## Before it ships (not done here: the owner chooses first)

- Add the chosen object's clip to `frames.py` (`CLIPS`) and its row to `tools/objects/README.md`,
  rename it to `record.py` (replacing `log.py`) and run the full pipeline at 1200² and 128
  samples.
- Check the droplet morph from the chosen outline. B and C are wider than they are tall, so the
  droplet grows out of a wider footprint than the microphone did.
- Check the warm reading-room ground and the blue object together on a phone in a dark room
  (`2026-10-page-worlds.md`).

## Round 2 (2026-10-09, after the owner's verdict)

**Why:** brief §7, "Record object, round 2": "detailed" meant looking better to the eye, not
fine engineering detail. A is overdone and does not fit the others; C looks very good; B makes
sense but is a little empty. So this round simplifies C as the lead, redesigns B to be fuller
with fewer parts, and tries one hybrid. A is dropped.

**Method:** as round 1 (shared rig, Cycles 600², 64 samples, denoised), but every candidate is
judged on a board beside the four shipped posters (edk, Recto, English Prep, Eat Map, with their
ground and shadow added back), not beside the other concepts. Scripts:
`tools/objects/record_c2.py`, `record_b2.py` and `record_h2.py` (the hybrid, a flag on
`record_b2.py` so the two cannot drift). Each exposes its tuning as environment variables
(`C2_*`, `B2_*`) so the variants below can be re-rendered; the defaults are the chosen ones.

![C2, B2 and H2, each in a row with the four shipped objects, a 120 px line-up and close-ups](assets/2026-10-record-object-r2.webp)

### What the family asks for

Seen side by side, the shipped objects share one level of abstraction: one bold mass, one
colour arriving through glass, a few large secondary shapes (the clip, the lines, the dots, the
plate), nothing smaller than about 3 % of the frame. Round 1's C had about 70 cards, a rod, a
knob, a label holder, a pull and a follower: correct, and noise at 120 px. Round 2 removes
everything that is not one of C's three loved ideas.

### C2. The card file, simplified (`record_c2.py`) — the lead

- **Kept:** the glass tray, the blue glass year dividers, the drawn card with the waveform
  turning into handwriting.
- **Removed:** the rod and knob, the label holder and pull, the follower, the ruled-card
  hairlines' density, 60 of the 70 cards. The stack is now ten thick cards and three dividers.
- **Bolder:** a rounder glass tray with large fillets; cards with
  real thickness; dividers with large tabs set left, centre and right so all three years show;
  the drawn card a third taller than the stack.
- **The card moved to the back.** Round 2's first render drew it from the front, as round 1 did:
  it hid the dividers and the stack and left "a card on a box". Drawn from the back it stands
  above the stack, fully frontal, and the three blue tabs sit in front of it: three readable
  layers (tray, years, the entry) instead of one.
- **Handwriting that reads as writing.** Round 1's words were dashes; round 2 draws looped
  cursive (a prolate cycloid with letters of uneven size and a pen lift between words), bold
  enough to survive the poster. Line one: nine waveform bars that calm into the cursive.
- **Light:** Record blue is the dividers and a faint glow panel in the tray's floor. The tray no
  longer casts a shadow (Cycles without caustics made the clear wall throw a solid shadow, so the
  stack inside rendered dark grey: the "grey slab" of the first two renders).
- **Rejected variants:** soft-frost tray (softer, but the clear tray matches edk's glass better);
  the stack in frosted glass so the drawn card is the only paper (the family's single-hue look,
  but the stack became one blue block and stopped reading as cards); a divider at the very front
  (a blue folder, not a card file).
- **Camera and droplet:** turned −15° instead of −28°, depth reduced, so the footprint is almost
  square: 390 × 382 px of the 600 px poster (aspect 1.02). The shipped objects run 0.79–1.17
  (edk's word aside) and the microphone was 0.59, so C2 is closer to the family's average than
  the object it replaces and the droplet grows from a compact, centred outline.
- **At 120 px:** a glass file with three blue tabs and a written card; the writing becomes
  texture but the blue waveform bars still show. It holds its own beside Recto's page without
  copying it (a stack of cards seen from the front, not a sheet).

### B2. The recorder, fuller (`record_b2.py`)

- **New form:** a solid smoked-glass desk body with a face sloping back 20°, the two reels lying
  on the slope and standing above its top edge, so the outline is a wedge crowned by two discs.
- **Fewer, fuller parts:** each reel is one thick clear glass disc with a glass hub; inside it
  the wound tape is blue glass lit from within, in bands, so the pack reads as wound tape; one
  straight run of tape between the packs; the warm record lamp on the front edge as the only
  warm light. Gone: the plinth, the guides, the heads cover, the lobed hold-downs, the flange
  windows.
- **Iterations:** the first body (an upright frosted slab) with a head and lamp centred under the
  reels read as a **face**, two eyes and a mouth: toy-like, exactly what the brief forbids. The
  head went, the lamp moved to the corner, and the bright metal hubs (pupils) became glass. A
  light panel inside the body (a light table) was tried and dropped: it read as a screen and
  washed out the packs. Clear coat removed from the body: the slope mirrored the key softbox as
  a white sheet.
- **At 120 px:** reads at once as a tape recorder; still the widest outline (aspect 1.49), so it
  sits smaller in the frame than its neighbours, and two equal discs keep a faint face reading.

### H2. Hybrid (`record_h2.py`)

B2 with the card's motif along its front edge: the waveform turning into looped handwriting,
drawn in blue light. It is the best single idea of the round in close-up (the recorder writes),
but the caption vanishes below about 300 px, so at the sizes the object mostly lives at H2 is
B2. Worth keeping as a detail for B if B is chosen; not a third direction.

### Recommendation (round 2)

**C2.** It is the one the owner already liked, now at the family's level: three bold layers,
one colour arriving as light, a near-square footprint that suits the droplet, and the only
object that shows what the Record is (a dated file of written entries, one drawn from a spoken
note). B2 is no longer empty and is a good second; if the owner prefers the voice half, ship B2
with H2's front-edge caption.

**Before it ships** (unchanged from round 1, plus): the owner sees C2 as a still first; the
interaction (the drawn card lifts further, tips toward the viewer and settles; a note lifts a
little, an essay all the way) goes into `frames.py`; full 1200² at 128 samples.
