# ADR-0008: The About ID card and the postcard are CSS 3D objects with a small spring loop

**Status:** technique decided by the agent (CLAUDE.md: "decide technique yourself and record it");
the look is proposed until the owner has seen it · **Rests on:** brief §7 (2026-10-09 after v0: "About
photo: both a digital ID card like event badges on About, and postcards for photo entries later"; after
E: "the courtyard photo should carry About"), craft audit §1 P1.6, §4 and §5.1, media research §6,
ADR-0002 (content is data), ADR-0006 (real time is only glue)

## Context

The owner wants the gate selfie as a digital ID card on About, in the spirit of conference badges
(Vercel Ship, Config, GitHub Universe), and later postcards for photo entries in the record. Prototype E
framed the selfie as a print and the owner liked having the photo in a photo concept; the craft audit
removed E's bright paper mat and tilt because they broke the quiet page. The card has to bring back
E's liveliness without bringing back the scrapbook.

Options: a WebGL card (three.js or a physics library, as some event badges do), a canvas, or CSS 3D
transforms driven by a small script.

## Decision

1. **CSS 3D, no WebGL, no canvas.** Two faces in one grid cell, `backface-visibility: hidden`, the back
   pre-turned 180°. A pointer-driven radial glare (`screen`) and a hairline foil edge in the About gold
   (a conic gradient whose angle follows the turn) give the light; a faint rainbow of the laminate
   shows only where the glare falls. Nothing else is decorative: no mono caps, no barcode, no fake
   chip. The mark sits on the lanyard and, pressed without colour, on the back.
2. **One spring loop per card** (`src/scripts/card3d.ts`), asleep at rest, with the motion system's
   springs (audit §4.1): the swing keeps the object spring's ζ = 0.6 with a lower stiffness (k = 90)
   because it hangs; tilt uses the ui spring (ζ ≈ 0.87); the turn is near critical (ζ ≈ 0.84) so the
   card never wobbles past its face. The hanging card pivots on an anchor above the page; a drag sets
   the angle from the anchor to the hand and lets the strap stretch on a rubber band; release hands the
   measured velocity to the spring. The card twists a little with the swing's speed.
3. **Turning is a button on each face** (under the face's links), so click, Enter and Space all turn it
   and links never do. The hidden face is `inert`; focus follows to the new face's button. The front
   carries both links, so nothing needs the turn.
4. **Still twins.** Reduced motion: no swing, tilt or drag, the turn is a 150 ms crossfade. Touch (phones
   and tablets): tap to turn, no drag, no tilt. No JavaScript: the ID card shows its front (name, school,
   both links); a postcard shows both sides, one under the other.
5. **Content is data.** Every field of the ID card comes from `content/site.json` (`name`, `nameLines`,
   `mark`, `kicker`, `links`, `about.selfie`, `about.card`). The square photo is a crop of the graded
   selfie made by `tools/photos/grade.mjs`. A postcard takes its photograph, note, place and date as
   props.
6. **Composition.** On wide screens the card hangs over the courtyard, in the photo's half and clear of
   the text column, its lanyard running up under the bar; the courtyard still carries the page. On
   phones it follows the introduction in the page's flow. The selfie no longer appears a second time
   in the page body.
7. **The postcard is not public yet.** `src/components/Postcard.astro` is shown only on `/lab/postcard/`,
   which is linked from nowhere, `noindex`, and filtered out of the sitemap. Photo entries in the record
   will use it once the owner sends photographs for them.

## Consequences

- No new dependency; the script is a few KB and runs only on pages with a card.
- Masks punch the clip's slot out of the card, so the drop shadow is a separate blurred layer.
- Desktop first: the drag and tilt need a fine pointer. Tablets get the tap.
- Open taste questions for the owner: the back's line (a draft taken from the two-track framing), the
  "Issued Oct 2026" date, the lanyard's repeated mark, and whether postcards keep the About gold or take
  the record's blue.
