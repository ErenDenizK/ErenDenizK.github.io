# ADR-0018: Objects on the two-page Home: the recorder as the Record's emblem, line twins next

**Status:** proposed, 2026-10-16 (round three of `/lab/one/`). The technique below is decided; the
direction (the recorder as emblem, its tape as the spine, line twins as the next step) waits for the
owner's answer to spec v3 §13 questions 3 and 4. The lead adds the row to `docs/adr/README.md` when
the lanes merge.

## Context

ADR-0005 (one object per tab) and ADR-0006 item 5 (the droplet between tabs) are superseded by the
two-page direction. ADR-0006 otherwise holds: objects are pre-rendered Cycles frames (the owner kept
pre-rendering on 2026-10-11, option a). Round two took the glass objects out of Work (spec v2 W5,
"no piling"); only the recorder (the Record strip) and the edk mark (the footer) stayed on Home.

The owner's review of round two (rows T6, T8, T20) says: the role of the 3D objects is unclear, the
recorder sits in a corner of a strip that looks pasted, and on the phone the recorder shows a render
problem. The round-three objects study (`round3/objects.md`) weighed four options:

1. Glass in each Work scene: reads as a sticker on a pencil drawing and returns the piling W5 removed.
2. The recorder as the Record's emblem, its tape becoming the spine, in its own reel drawing.
3. Line twins: each object's line drawing exported from its own Blender model, placed in the scenes.
4. A new family of glass objects: the highest cost and taste risk, and it brings objects back to Work.

## Decision

1. **Option 2 now.** On Home the recorder is the emblem of the Record strip, not a corner ornament:
   300 px centred above the chapter's title on desktop, 176 px at the right on phones, standing on a
   dark local ground in a reel drawing, with its tape leaving it under the left reel and running on as
   the spine. The design is in `docs/design/record-language.md` §6 and spec v3 §8. No new renders: the
   poster, the lean grid and the press clip already ship.
2. **The ground under a glass object is dark.** The stage is additive (`plus-lighter`), so an object
   can never be darker than what lies under it. Wherever an object stands on the aura or on a drawing,
   it gets a local radial ground (`rgb(13 13 15 / 0.92)` at the centre, transparent at 1.7 times the
   object), and no ancestor of `.m-stage` may create a stacking context (no `z-index` on the slot or its
   wrappers, no transform, filter, opacity below 1, mask or containment). Reason: a stacking context
   isolates the blend and the poster's black square shows (measured in the round-three comp).
   Drawings are cut out of the object's circle, so no line crosses the glass.
3. **Phones stay on the poster on Home** until the owner's device check (spec v3 §13 question 5):
   `<Media spin="off">` writes `data-spin="off"` and `media.ts` gives that slot no spin loop. The float
   and the press clip remain. Reason: the edge-on spin frames read as a flicker at 176 px, and iOS
   Safari may composite a playing video outside its blend, which draws the video's black ground as a
   dark disc on the aura. The `/record/` page keeps its spin.
4. **The object turns with the scroll on desktop.** `<Media lean="scroll">` writes `data-lean="scroll"`;
   while no pointer is near, `media.ts` aims the existing lean grid from the slot's place in the window
   (frontal at the middle, about 10 degrees of yaw at either edge). It is a function of position, so it
   plays backwards on the way up, and the rest pose settles on an exact frame as the pointer lean does.
5. **Option 3 is the next objects step**, in its own lane: export the recorder's line twin from its
   Blender model (Grease Pencil Line Art to SVG, a script in `tools/objects/`), and let it replace the
   strip's reel rings, so the drawing and the glass are one thing in two forms. Later, line twins of
   Recto, English Prep and Eat Map may enter their own scenes as one more drawn layer; glass shows only
   where a chapter opens. Estimated cost: about half a day of tooling and minutes of render per object;
   no new Cycles hours. Not done in round three: the decision came with the round's spec, and the
   strip's comp drawing is enough to judge the direction.
6. **The edk stays in the footer** (row T7). No glass returns to Work. Option 1 and option 4 are
   rejected for the reasons in the context.

## Consequences

- One object carries the lower half of Home, and it now has a job: it writes the line the Record is
  made of. The project objects are absent from Home until option 3 lands or the owner says otherwise.
- `Media.astro` and `media.ts` gain two opt-in attributes; every other slot, and the live site, keep
  their behaviour.
- Any later placement of a glass object on Home must follow item 2 (dark local ground, no isolating
  ancestor), and is checked with a stacking walk such as `round3/tools/stack.mjs`.
- The hand-over to the Record page names the strip's stage `stage` on the click of "The whole record",
  the name the Record page gives its recorder, so the object flies between the pages where cross-
  document view transitions exist. record-language §3 lists defects of that path on the live page
  (the droplet-out square, a bright arrival frame); the strip sets no `.stage` class, so no droplet
  plays from Home.
