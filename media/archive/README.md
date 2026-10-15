# The archive

Retired designs, kept for their lessons: what each one was, what the owner liked or disliked
about it, and why it was retired. The owner asked on 2026-10-15 that retired objects be archived,
not deleted, because that record has value.

Nothing here is part of the site. The build publishes only `media/objects/<name>/` folders a page
names (`src/lib/files.mjs`), and this folder is outside `media/objects/`, so no page loads it, the
build never copies it, and it is not in `dist/`. To bring a design back, move its folder into
`media/objects/` and name it in a page or a project's `object` field.

The owner's words below are quoted as `docs/history/brief-log.md` records them (in English; the
owner speaks Turkish). Dates are the commit dates (UTC) from `git log`.

## objects/log/: the microphone, the Record's first object

**What it was.** A glass studio microphone: a glass capsule head over a metal core, a steel band,
neck, stem and base, and a small LED in the accent colour (`#8fb8ff`). The idea came from
Prototype E: "Log: a glass microphone (the log is dictated); a soft waveform pulse"
(`prototypes/e-dark/SPEC.md`, "Objects"). Its interaction (clip `on-air`): the LED, dim and blue
at rest, goes on air while three soft accent rings ripple out round the head
(`tools/objects/README.md`).

**Made.** Modelled and rendered with the first six Blender objects on 2026-10-09 (`088053f`);
pre-rendered for the site the same day (`e05db4e`) and re-rendered with a floor shadow and a
dimmer LED (`81be1c0`). It was the object of v0's Log page, which became the Record page the
same day (`647a1cd`).

**What the owner said.** After seeing v0, 2026-10-09: "the microphone looks too simple; rethink
it from every angle." The Record object research (`docs/research/2026-10-record-object.md`)
spelled out why: of the Record's three ideas (voice becoming text, time piling up, a record of
work kept in public) the microphone has only the first, "and only as a symbol: a glass dome over a
ribbed core, no engineering a sound engineer would recognise". The family audit
(`docs/research/2026-10-family-audit.md`, C3) found the objects "glossy, saturated, toy-like",
"a blue microphone" among them.

**Retired.** 2026-10-09, when the card file replaced it on the Record page (`52fa9ae`).

**Lessons.**
- A symbol is not enough: an object should be a crafted thing in its subject's language, and
  should carry more of the subject than one idea.
- Its outline was tall and thin (aspect 0.59, where the family runs 0.79–1.17), a poor footprint
  for the droplet morph (research, round 2).
- An LED resting bright on an accent-lit body is already near white, so going on air barely
  shows; it rests dim now (comment in `tools/objects/log.py`).

**Renders with.** `tools/objects/log.py` (the model), then `tools/objects/frames.py log` and
`tools/objects/encode.py log`, which writes back into this folder.

**Contents.** 1.7 MB: posters at 600 and 1200 px (AVIF, WebP), the contact shadow, the lean
grid in two tiers (`lean/half`, `lean/full`), the interaction, droplet and idle clips in AV1,
HEVC and H.264, and `manifest.json`.

## objects/record/: the card file, the Record's second object

**What it was.** A glass card file: a thick clear glass tray, a short stack of thick cards, three
blue glass year dividers with large tabs, and one card drawn high out of the back of the stack,
facing the viewer. On it a bold waveform turns into looped handwriting: a voice note becoming an
entry. Record blue arrives as light, in the dividers and a soft glow in the tray's floor. Its
interaction (clip `lift`, 42 frames): the drawn card lifts all the way out, tips 11° toward the
viewer and drops back with a small settle; its rising frames are a state axis, so a note could
lift it a little and an essay all the way (`tools/objects/README.md`).

**Made.** Concept C of the Record object research, round 1, 2026-10-09: a card-catalogue tray,
"the only one that is about text". Round 2 the same day simplified it to C2 (`da5b43d`), which
shipped on 2026-10-09 (`52fa9ae`), was encoded lighter for the phone and desktop budgets
(`cda66ed`, 2026-10-10), enlarged on the page (`3655781`) and given posters at each slot's width
(`bfacb2e`).

**What the owner said.**
- On round 1, 2026-10-09: "'detailed' meant looking better to the eye, not fine engineering
  detail. A (valve microphone) is too much and does not fit the others. C (card catalogue) looks
  very good. B (tape deck) makes sense but its design is a little empty."
- Then: "ship C2 (the simpler card file) to test; the owner leans to H2 (recorder with the
  voice-to-writing line) and may switch after seeing C2 live."
- Phone check, 2026-10-10: "Record: the object looks too small."
- Clean restart, 2026-10-10: "Record object: the design is disliked; try H2 again or a
  tape/cassette player."
- Evening, 2026-10-10: "a tape / voice recorder, but different from the earlier ones; or try the
  earlier alternative." The research records the standing notes for that round as "not round 1's
  level of fine detail, C very nice, tape a bit empty."

**Retired.** 2026-10-10, when the pocket cassette recorder (`media/objects/recorder/`) took the
Record page (`7a05b2c`, `883e082`). The owner accepted it on 2026-10-11: "the cassette recorder
is OK."

**Lessons** (from the research, rounds 1 and 2).
- What the owner liked: the glass tray, the blue year dividers and the drawn card. What was too
  much: round 1's detail (about 70 cards, a rod, a knob, a label holder, a pull, a follower),
  "correct, and noise at 120 px".
- The family's level: one bold mass, one colour arriving through glass, a few large secondary
  shapes, nothing smaller than about 3 % of the frame.
- Drawn from the front, the card hid the dividers and left "a card on a box"; drawn from the back
  it gave three readable layers (tray, years, the entry).
- In Cycles without caustics a clear glass wall casts a solid shadow; the stack inside rendered as
  a grey slab until the tray stopped casting one.
- A near-square footprint (aspect 1.02) suits the droplet.
- Against it from the start: at 120 px it is "a box with a card", close to a generic archive
  icon, and the waveform only reads from about 300 px (round 1).

**Renders with.** `tools/objects/record.py` (C2's chosen defaults fixed; the round's variants are
`tools/objects/concepts/record_c2.py`, shared finishes in `tools/objects/record_kit.py`), then
`tools/objects/frames.py record` and `tools/objects/encode.py record`, which writes back into this
folder.

**Contents.** 3.1 MB: posters at 320 to 1200 px (AVIF, WebP), the contact shadow, the lean grid
in two tiers, the interaction, droplet and idle clips in AV1, HEVC and H.264, the live engine's
normal and clip stills (`live/`), and `manifest.json`.

## Concepts that never shipped

The other Record concepts (A, the valve microphone; B and B2, the tape decks; H2, the recorder
that writes; round 4's concepts 1 and 3) have no media here. Their renders and verdicts are in
`docs/research/2026-10-record-object.md` and its images in `docs/research/assets/`; their scripts,
where they were committed, are in `tools/objects/concepts/`.
