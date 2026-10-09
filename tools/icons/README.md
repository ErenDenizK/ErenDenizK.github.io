# Icons

A small icon set drawn by code from one set of rules, the way `tools/objects/` builds the 3D
objects: the source is committed, the output is regenerated, nothing is drawn by hand in an
editor. Research and evidence: `docs/research/2026-10-icons.md`.

```
rules.mjs    the rules: Inter metrics, stroke per size and weight, optical-size table,
             pixel grid, primitives (polyline with fillets, rect, circle), ink measurement
icons.mjs    one entry per icon: draw(g) returns primitives built only from the rules
brands/      official brand drawings, vendored unchanged (see "Brand marks")
build.mjs    draws every icon at 16/20/24 in two weights, optical-centres it, optimises
             it with svgo, writes out/
out/svg/     <name>-<size>.svg (regular) and <name>-<size>-medium.svg
out/icons.json   rules, motion values and every SVG string, by name/size/weight
out/icons.js     ES module: icons map + icon(name, { size, weight }) helper
out/icons.css    alignment to the text and the motion recipes
out/report.json  per drawing: stroke, ink weight relative to a circle, ink offset, shift
```

## Running

```sh
cd tools/icons && npm install     # dev dependency: svgo 4.1.0 (never shipped)
node build.mjs                    # or: node build.mjs --deps <dir whose node_modules has svgo>
```

Output is deterministic (same input, same bytes). Without svgo the build still works and
prints a warning; the markup is then about 12% larger. The console prints the report table:
check it after any change.

## Rules

Every number below comes from `rules.mjs`; icons never pick their own.

1. **Sizes 16, 20, 24, each drawn at its natural size.** The drawing is recomputed per size,
   not scaled (Octicons and Heroicons draw 16 and 24 separately). Each size is paired with
   the text it sits beside: 16 with 15px UI text, 20 with 18px, 24 with 22px.
2. **Stroke = the Inter stem at the paired size and the label's weight**, rounded to 0.25px.
   Inter's "I" stem is 190/2048 em at 400 and 228.5/2048 em at 500, so:

   | | 16 | 20 | 24 |
   |---|---|---|---|
   | regular (beside Inter 400) | 1.5 | 1.75 | 2 |
   | medium (beside Inter 500, buttons) | 1.75 | 2 | 2.5 |

   Round caps, round joins, centred strokes, `currentColor`.
3. **Live area.** The outer stroke edge stays `margin` px from the canvas edge: 1 at 16, 1.5
   at 20, 2 at 24. Small sizes spend more of the canvas on the drawing (optical size).
   `H` is the live half-size measured to the stroke centre line, so a shape drawn to ±H
   ends exactly at the margin.
4. **Optical-size table** (`OPTICAL`): arrow span, arrowhead, chevron, cross and plus as
   fractions of the live area, slightly larger at 16 than at 24. Diagonal shapes (close,
   arrow-up-right) are drawn smaller than horizontal ones because diagonals read larger.
5. **Pixel grid.** The outer stroke edge of every axis-aligned feature lands on a 0.5px grid
   (a device pixel at 2x), measured from the centre so mirrored pairs stay mirrored. The
   centre axis is exact: a symmetric icon is never pushed off centre to reach the grid.
6. **Corners.** Shapes of 8px or more take a radius of one stroke width (min 1px); solid
   glyphs (play, pause) are filled *and* stroked with the same width, so their corners get
   the same round join as the outlines.
7. **Gaps.** At least one stroke width of clear space between distinct parts (copy's two
   sheets, calendar's rings and header rule).
8. **Optical centring.** Icons that declare `optical` are first box-centred, then moved
   halfway toward the canvas centre from their ink centroid (measured on a 1/8px sample
   grid), snapped to 0.25px. This is what moves the play triangle right and the arrows
   away from their heads.
9. **Weight check.** `report.json` gives each drawing's ink area relative to a stroked
   circle on the full keyline. Line icons sit near 0.6, chevrons near 0.3 (by design, as in
   every reference set), enclosed shapes 1.2 to 1.5. A new icon far outside its family's
   range needs a reason.
10. **Alignment with the text.** In a flex row with `align-items: center`, an icon is centred
    on Inter's cap height with no correction, because Inter's content-area centre and
    cap-height centre are both 745/2048 em above the baseline (measured: within 0.05px at
    15px). Inline in running text, `.icon` uses `vertical-align: calc(0.3638em - size / 2)`.
    The status dot (`data-align="x"`) centres on the x-height instead. Beside a Newsreader
    title put `.on-serif` on the parent: Newsreader's content centre sits 0.1em below its
    cap centre.

## Using an icon

```js
import { icon } from '../tools/icons/out/icons.js'   // or inline the SVG at build time
icon('arrow-right', { size: 16, weight: 'medium' })
```

Give the `<svg>` the class `icon` and the data attributes from `icons.json`
(`data-name`, `data-align`, `data-animate`, `data-size`), keep `aria-hidden`, and put the
accessible name on the link or button (`aria-label` for icon-only buttons). Never write an
arrow or symbol as a Unicode character in the page (see the research note: ↗ U+2197 is an
emoji code point and the site's Inter subsets have no arrows at all, so iOS draws it with
Apple Color Emoji). For an icon after link text, write no space before the `<svg>` and give
it `margin-left: 0.18em`, so the underline does not run under a gap.

Sizes: 16 beside UI text (13 to 17px), 20 in round icon-only buttons (40px hit area), 24 for
titles and the LinkedIn bug.

## Motion

Read by `data-animate`; all of it is CSS in `out/icons.css`, transform and opacity only, and
every effect has a still twin under `prefers-reduced-motion` (instant change or a 120ms fade).

- `nudge`: 2px toward the direction on hover (1.5px diagonally for external links), 200ms,
  only under `@media (hover: hover)`.
- `flip`: chevron-down turns 180° when its control has `aria-expanded="true"`.
- `draw`: check strokes carry `pathLength="1"`; add `.is-drawing` to draw them on in 320ms
  (Apple's "Draw On"). Used for copy → copied.
- `replace:<other>`: wrap both icons in `.icon-swap`; toggling `.is-on` scales the outgoing
  one down and the incoming one up (Apple's "down-up" replace). Play ↔ pause, copy → check.
- `morph:<other>`: the menu's two lines are exactly as long as the close cross's diagonals,
  so `.is-open` turns them into the cross with a rotate and a translate, no scaling. The
  build fails if the lengths ever drift apart.

## Brand marks

Brand marks are never redrawn, distorted or recoloured beyond `currentColor` in the page ink.
The build scales them uniformly into the keyline (a circle mark to the outer edge of a
stroked circle) and centres them.

- **GitHub**: GitHub's own Octicons drawings `mark-github-16` and `-24`
  (`@primer/octicons` 19.40.0), vendored unchanged in `brands/`. GitHub allows the mark in
  white, black, or in few cases grey or green; the page ink `#e9e5de` on black is the white
  variant in practice.
- **LinkedIn: interim.** `brands/linkedin.svg` is Bootstrap Icons 1.13.2's redraw (MIT).
  LinkedIn asks for approved assets only and a minimum of 21px on screen, so the build only
  draws it at 24 (21px mark). Before the site ships, download the official [in] bug (white)
  from LinkedIn's brand site, replace `brands/linkedin.svg`, update `bounds` in `icons.mjs`
  and rebuild. `icons.json` marks it `"interim": true` until then.
- Prefer text links ("GitHub", "LinkedIn" + arrow-up-right) where a mark is not needed. That
  meets both brands' rules with nothing to get wrong, and is quieter.

## Adding an icon

1. Check that the site needs it and that no existing icon fits.
2. Add an entry to `ICONS` in `icons.mjs`. Build it from `g` only: `g.c`, `g.H`, `g.o`,
   `g.r`/`g.rs`, `g.snap`, and the primitives `line`, `rect`, `circle`. No literal pixel
   values except where a rule says so; reuse shapes from existing icons (an arrowhead is
   `arrowH`'s).
3. Set `optical` (axes to optical-centre, `''` if symmetric), `align` (`'x'` only for marks
   that read with lowercase) and `animate`.
4. Run the build. In the report: weight near its family, ink offset small after the shift.
5. Look at it: put it on a contact sheet beside 15px Inter text at 1x and 2x, on the dark
   ground and a light one, next to the same icon from Lucide or Phosphor (the sheet used
   for the first set is described in `docs/research/2026-10-icons.md` §5). Fix by changing the rule
   or the optical table, not one coordinate, unless the icon is genuinely an exception;
   then comment why.
6. A brand mark goes in `BRANDS` with its official file in `brands/`, its source and licence
   in a comment, its circle or square `bounds`, and its vendor minimum size.
