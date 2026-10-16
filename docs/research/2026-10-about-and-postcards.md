# Research: About as a personal page, and photographs as postcards (2026-10-11)

**Status:** partly superseded 2026-10-15 by the two-page direction: the About page goes and its material moves to Home; the postcard technique holds (ADR-0008). Before that: current, except the pile (§3), which the owner replaced on 2026-10-11 (afternoon) with postcards spread through the page; see ADR-0008, amendment "postcards through the page". Rests on the owner's words of 2026-10-11 (brief log): About is "soulless: plain
text and three photos"; postcards should be "more interactive"; "research what makes a photo frame
richer and more fun, and how photos are presented digitally". The direction at the end is what
`src/pages/about.astro` built; `PostcardPile.astro` is gone with the pile, and the postcards are
`src/components/Postcard.astro`. On 2026-10-11 (late) the owner said the postcard is not required:
photo presentation is reopened.

**How sure:** **V** = seen in a search result this session (link given). **R** = recollection of a
site the lead knows; direct fetches of personal sites were refused by this container's network
policy on 2026-10-11, so those lines are not re-checked and say only what is widely known. **D** =
the lead's own design reasoning.

## 1. What a photo frame can do (techniques)

| # | Technique | Where it is seen | Sure | Use here |
|---|---|---|---|---|
| 1 | **Top-card stack, flick to send to the back.** The top card follows the hand; a flick or a long pull sends it under the pile, the next rises. Threshold is tunable. | Framer "Polaroid stack" ([listing](https://www.framer.com/marketplace/components/polaroid-stack)), Motion's card-stack tutorial ([motion.dev](https://motion.dev/tutorials/react-card-stack)) | V | **Yes**: the pile's main gesture |
| 2 | **Scattered cards, drag anywhere, tilt from drag speed, spring back with slight overshoot; reduced motion respected.** | Framer "Draggable card" ([listing](https://www.framer.com/marketplace/components/draggable-card/)) | V | Partly: the drag tilts with speed; no free scatter (it reads as a toy and loses the photo) |
| 3 | **Fan / shuffle view** of a stack. | 21st.dev draggable photo stack ([page](https://21st.dev/@laziekiki/components/draggable-photo-stack.md)) | V | A small fan on hover only, so the pile shows it has depth |
| 4 | **Hover tilt with a moving glare** (pointer to CSS variables, `rotateX/Y`, a radial glare blended `screen`/`hard-light`, optional foil). | Simey's hover-tilt ([docs](https://hover-tilt.simey.me/bespoke/credit-cards/)), Framer GlareCard ([listing](https://www.framer.com/marketplace/components/glarecard/)) | V | **Yes**, the glare only; no rainbow foil on a photograph |
| 5 | **Release velocity seeds the spring; project where a throw is heading before deciding.** Bounce only after a gesture that carried momentum. | Practitioner guide after WWDC 2018 "Designing fluid interfaces" ([mirror](https://mcpservers.org/agent-skills/emilkowalski/apple-design)) | V (secondary) | **Yes**: the toss decides on the projected point, not the release point |
| 6 | **Postcard back anatomy:** message left, address and stamp right, a dividing line ("divided back"), postmark over the stamp. | Printer guides ([4OVER4](https://v2.4over4.com/guide/anatomy-of-a-postcard-key-parts-and-design)) | V | **Yes**: the back keeps that order; the address lines carry place and date |
| 7 | **Instant-print proportion:** 79 × 79 mm image on an 88 × 107 mm card, the border wider at the bottom. | Film specs ([JB Hi-Fi listing](https://www.jbhifi.com.au/products/polaroid-600-colour-film-3-pack-24-photos)) | V | No: a white mat on a black page is what the craft audit removed. The idea kept: a border that is not even, a little heavier at the foot, where the place is pressed |
| 8 | **Paper grain** with SVG `feTurbulence` or a tile, at low opacity (about 0.03 to 0.12); above that it reads as dirt. | CSS-Tricks ([article](https://css-tricks.com/?p=335760)) | V | The site's grain tile already covers the page; the back gets a faint fibre of the same tile, nothing more |
| 9 | **Light leaks** (lomography): over-exposed edges in warm colour. | [Wikipedia](https://en.wikipedia.org/wiki/Light_leak) | V | No as decoration. Its honest form: the light around the card takes the photograph's own colour (row 10) |
| 10 | **Ambient light from the picture:** the colour around a picture is sampled from it (artwork glow in music players, "ambient mode" in video players). | Common pattern | R | **Yes**: each photo's tone is measured at build time; the pool of light behind the pile changes as cards change |
| 11 | **Memories: one big lead image, a slow Ken Burns drift, grouped by place and time.** | Apple Photos coverage ([MacMost](https://macmost.com/using-photos-memories-on-your-mac.html), [Six Colors](https://sixcolors.com/post/2016/09/whats-new-in-photos-for-ios-10/)) | V | The grouping only: each card carries place, and date where known. No auto drift (it stutters, and motion on a photo fights the reader) |
| 12 | **Caption plate / EXIF line** under a photo (camera, lens, place). | Photo portfolios generally | R | Place and the owner's note only. EXIF is stripped on import (privacy), and a camera line would be invented |
| 13 | **Plain, content-first boards, no likes, attribution beside the image.** | Cosmos ([support](https://www.cosmos.so/support)), Are.na ([critique](https://ixd.prattsi.org/2025/02/design-critique-are-na-ios-app/)) | V | Quiet frame, words beside, never over, the photo |
| 14 | **Profile as a living page with galleries and side projects.** | Read.cv ([profiles](https://read.cv/about/profiles)) | V | Products woven into the About text, with their own wordmarks |
| 15 | **A dark, crafted personal site with sound, a dock and horizontal photo galleries.** | rauno.me ([review](https://uiuxshowcase.com/portfolio/rauno-freiberg/)) | V (secondary) | The bar: details that reward a second look; no sound (a portfolio opened in an office) |
| 16 | **Hand-set details on a personal page**: small facts, a "now" line, pull quotes, a few photos with notes. | joshwcomeau.com, paco.me, brianlovin.com, emilkowal.ski | R | Facts plate, now line, one pull quote |
| 17 | **Accessible stack:** a group with `aria-roledescription`, each card named "N of M", native buttons for previous/next, no auto-rotation. | W3C APG carousel ([pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)) | V | **Yes**: buttons before keys; arrows as a shortcut; a polite live caption |

## 2. What fails (and why it is left out)

- **Free scatter across the page** (row 2 taken to its end): fun once, then the photos sit crooked over
  the words. A pile keeps them in one place (D).
- **Holographic foil on a photograph** (row 4): it changes the photo's colours; the ID card already
  owns the foil (ADR-0008) (D).
- **Handwriting fonts**: on a dark, typographic site a script face reads as a greeting card. The note is
  set in the reading serif's italic, a little rotated, which is how a careful hand looks in print (D).
- **Auto-advancing slideshows**: APG asks for a stop button and they steal attention from reading (V,
  row 17).

## 3. Direction for this site

**A letter with postcards.** About reads like a short letter from Istanbul: the ID card and a warm
opening, then chapters that each carry one object of their own, so the page has a rhythm instead of a
column of text: a facts plate beside "Who I am", the **pile of postcards** as a wide band ("Photos"),
**two tracks** that run side by side and meet ("How I work"), one pull quote, the products in their
own wordmarks and colours, and **the year as a line** that ends in a lit "now" and a dashed "next".
Light is colour: the About gold for the page, and around the pile the colour of the photo on top.

**The pile** (one component, three postcards):

- Desktop with a mouse: the top card leans toward the pointer under a moving glare; the cards beneath
  fan out a little to show there are more. Drag the top card: it follows the hand and tilts with its
  speed; let go past a third of its width, or toss it, and it slides off and tucks under the pile
  (the decision uses the projected landing point, row 5); a short pull springs back. Click turns it over.
- Touch: swipe sideways to send the top card under (vertical scrolling stays native), tap to turn it.
- Everyone: "Previous", "Turn over" and "Next" buttons and an "N of 3" count; arrow keys inside the
  pile; the caption beside the pile (place and note) is a polite live region.
- The back: the note in italic serif, the owner's name, a perforated stamp cut from the same photo, a
  postmark ringing the place (and date when known), wavy cancellation lines, and the place written on
  address lines.
- Still twins: reduced motion gets no tilt, drag or slide (cards cross-fade); without JavaScript the
  three photographs stand in a row with their notes under them.
