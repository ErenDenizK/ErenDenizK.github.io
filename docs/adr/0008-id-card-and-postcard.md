# ADR-0008: The About ID card and the postcard are CSS 3D objects with a small spring loop

**Status:** accepted 2026-10-10 (owner: "very good"; the rope was asked for and built). Items 7 and 8 were
amended 2026-10-10 evening (About as an article; postcards in public). The desktop card was made
calmer on 2026-10-10 (amendment below; the owner's look check is pending). Technique decided by the agent (CLAUDE.md) · **Rests on:** brief §7 (2026-10-09 after v0: "About
photo: both a digital ID card like event badges on About, and postcards for photo entries later"; after
E: "the courtyard photo should carry About"; 2026-10-10: "ID card: very good; on desktop more interactive:
pull it by its lanyard, swing and spin it, like GitHub's event badges; the phone's simple flip is fine"),
craft audit §1 P1.6, §4 and §5.1, media research §6,
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
2. **One loop per card** (`src/scripts/card3d.ts`), asleep at rest, with the motion system's springs
   (audit §4.1): tilt uses the ui spring (ζ ≈ 0.87); a button turn is near critical (ζ ≈ 0.84) so the
   card never wobbles past its face. The postcard uses only these.
3. **The hanging card is a rope and a body (amended 2026-10-10).** On wide screens with a mouse and
   motion welcome, the lanyard is a Verlet rope of ten segments from the anchor above the page to the
   clip, drawn as one SVG path (an edge stroke, the band, and the mark repeated along it on a
   `textPath`), with a fixed 240 Hz step. The clip is the rope's heavy last point: gravity pulls it,
   the segment constraints and a long-range limit from the anchor hold it (the rope sags when slack and
   never creeps longer than 2 %), and only its swing across the rope is damped, to ζ ≈ 0.6 (the object
   spring's damping), so a fall along the rope is not. The card hangs from the clip and follows the
   rope's last segment on a spring (ζ ≈ 0.7). A hand can take the card (the grab point stays under the
   hand as the card turns) or the rope (the nearest rope point is pinned to the hand and the card
   dangles from it). Pulling past the rope's length stretches it on a rubber band. Letting go hands
   the hand's velocity (measured between events, because browsers coalesce them) to what it held, and
   its sideways speed to a spin about the vertical axis; the spin runs down on friction and, below
   240°/s, lands on the nearest face on a ζ = 0.6 spring. The face it lands on becomes the live one
   (the other is inert; focus follows if it was on the card). The card's area is clamped: it never
   moves into the text column, off the page, or more than a little under the bar, and its rotation is
   limited so its lower corner stays inside too. The loop runs only while something moves and reads
   layout only on a resize or when a hand takes the card. CSS 3D and SVG were enough; WebGL (as the
   Vercel and GitHub badges use) would add a dependency and a still twin for no visible gain at this
   size.
4. **Turning is a button on each face** (under the face's links), so click, Enter and Space all turn it
   and links never do. The hidden face is `inert`; focus follows to the new face's button. The front
   carries both links, so nothing needs the turn.
5. **Still twins.** Reduced motion: no rope, swing, tilt or drag (the woven strap stands still), and the
   turn is a 150 ms crossfade. Touch (phones and tablets): the still strap, tap to turn, no drag, no tilt. No JavaScript: the ID card shows its front (name, school,
   both links); a postcard shows both sides, one under the other.
6. **Content is data.** Every field of the ID card comes from `content/site.json` (`name`, `nameLines`,
   `mark`, `kicker`, `links`, `about.selfie`, `about.card`). The square photo is a crop of the graded
   selfie made by `tools/photos/grade.mjs`. A postcard takes its photograph, note, place and date as
   props.
7. **Composition.** On wide screens the card hangs over the courtyard, in the photo's half and clear of
   the text column, its lanyard running up under the bar; the courtyard still carries the page. On
   phones it follows the introduction in the page's flow. The selfie no longer appears a second time
   in the page body.
8. **The postcard is not public yet.** `src/components/Postcard.astro` is shown only on `/lab/postcard/`,
   which is linked from nowhere, `noindex`, and filtered out of the sitemap. Photo entries in the record
   will use it once the owner sends photographs for them.

## Amendment 2026-10-10: calmer, and the rope can be taken

The owner (brief, 2026-10-10): "playable and good but goes wild; extreme input gets extreme
reactions". Every reaction now saturates instead of growing with the input (`card3d.ts`):

| | Before | After |
|---|---|---|
| Throw (release speed) | clamped at 3000 px/s per axis | 1200 px/s, direction kept |
| Spin | `tw·4 + vx·0.7`, up to about 1900°/s, friction 1.4/s (about 3 turns) | only for a quick, mostly sideways throw (over 600 px/s, 1.5x its vertical part); capped at 720°/s, also for button turns; friction 2.5/s (half a turn to a turn) |
| Twist while held | ±28° | ±12°; the swing's twist ±10° (was ±22°) |
| Strap stretch | a box around the rest: a sideways pull stretched it 30-47 % | at most 8 px past its length in any direction, on a soft limit (the hand slips past); a rope point held mid-strap is held within its length too |
| Swing | clamp at 1 rad (57°) | soft limit, saturating at 0.52 rad (30°) |
| Walls | velocity killed at the limit | a spring over the last 40 px (900/s²), then a bounce (restitution 0.3) |
| Damping | swing ζ 0.6, card on the rope ζ 0.7, landing ζ 0.6 | 0.9, 0.9, 0.75 |
| Slack rope | constraints pushed as well as pulled: a straight yank left the card propped in mid-air on its own strap | a rope pulls and never pushes |

The rope's hit stroke (`[data-rope-hit]`) was looked up inside the `<defs>`, so pressing the rope
did nothing (audit B1); it now takes the nearest rope point.

Measured at 1440×900 in headless Chromium (`card.mjs` in the session scratch; each scenario on a fresh
page; turn speed over 50 ms windows of rAF time): a hard fling turned at 611-713°/s for 221-232° in
all (before: up to 2313°/s and 584-1465°), the swing peaked at 11-20° (26-33°), the rope grew by
8-12 px measured along its curve (38-99 px), and the card settled within 1 px and 0.5° in 1.7-3.0 s
(3.1-3.9 s). Settle times vary with headless frame pacing (the loop clamps a frame at 50 ms); on a
60 Hz screen they sit at the low end. A straight pull and yank settles in 0.4-0.9 s (before: stuck).

## Amendment 2026-10-10 (evening): About as an article, postcards in public

The owner (brief, About, 2026-10-10 evening): "an about-me article; more photos, in the postcard style;
the ID card keeps the current photo". Items 7 and 8 change:

- **Composition (item 7).** The courtyard no longer carries the page. About opens with the card beside a
  short introduction (wide screens: the card in the margin column, its room to swing running from the end
  of the introduction to the page's edge, `.about-badge`); on phones the card comes first, centred, in the
  first screen, and the heading follows. Chapters follow in the Record's reading style, and they are the
  rail's rungs (ADR-0013). The gate selfie still appears only on the card.
- **Postcards (item 8).** `Postcard.astro` is now used on About: one postcard stands in a chapter's margin,
  two or three form a row. Photos, notes and places are content (`about.chapters[].photos` in
  `content/site.json`); a date is optional and left out where it is not known (the postmark then rings
  the place alone). `tools/photos/postcards.mjs` resizes the full-resolution originals to 480, 760 and
  1080 px (never past the original), with no metadata; each placement's `sizes` matches its drawn width,
  so a 3x phone and a 2x desktop never stretch a file (tested in `tests/e2e/about.spec.ts`). The card's
  photo gained a 960 px file for 3x phones for the same reason.
- The postcard workbench (`/lab/postcard/`) stays as a hidden test page.

## Consequences

- No new dependency; the script is a few KB and runs only on pages with a card.
- Masks punch the clip's slot out of the card, so the drop shadow is a separate blurred layer.
- Desktop first: the rope, drag, fling and tilt need a fine pointer. Tablets and phones get the tap,
  as the owner asked.
- Open taste questions for the owner: the back's line (a draft taken from the two-track framing), the
  "Issued Oct 2026" date, the lanyard's repeated mark, and whether postcards keep the About gold or take
  the record's blue.
