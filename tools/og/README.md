# Link-preview cards and icons

Renders the 1200 × 630 Open Graph cards and the "edk" icon candidates from data, in the site's
own type and with its own object renders. This is dev tooling: nothing in this folder ships with
the site, and the site gains no runtime dependency. Research and reasoning:
`docs/research/2026-10-link-previews.md`.

```
cards.json   the data: site tokens and one entry per card (layout, text, object, accent, og text)
card.html    the card page: layouts home, center, project, log, about
icon.html    the icon page: candidates wordmark, letter, inverse, blue
sheet.html   contact-sheet views: one card at every size, chat sizes, feed posts, icons
build.mjs    renders cards (JPEG + WebP, each under 200 KB) and icons (PNG + ICO) to out/
sheet.mjs    renders contact sheets to out/sheets/ (and copies three to docs with --docs)
fonts.mjs    @font-face rules for the local @fontsource files
serve.mjs    a static server for the render pages (the canvas cannot read file:// images)
lib.mjs      in-browser JPEG/WebP encoder with a byte budget
```

## Running

```sh
cd tools/og && npm install            # dev only: @fontsource-variable/{newsreader,inter} 5.3.0
node build.mjs                        # cards and icons -> out/
node sheet.mjs --variants             # contact sheets -> out/sheets/
```

`--fonts <dir>` points at another directory whose `node_modules` has the two Fontsource
packages (default: this folder). Playwright comes from `PLAYWRIGHT_PATH` or
`/opt/node-tools/node_modules`. Other flags: `build.mjs --only recto,about`, `--no-icons`,
`--png` (also keep the lossless screenshot); `sheet.mjs --docs` copies the chat, posts and icons
overviews to `docs/research/assets/2026-10-og-*.webp`.

A new project or log entry is a new object in `cards.json`, never a code change (ADR-0002).
In Level 2 the site build should produce this file from the content collections and call
`build.mjs`, then write versioned names (`og/recto.v2.jpg`) so platform caches see a new URL.

## Output

| File | What |
|---|---|
| `out/<id>.jpg` | the `og:image` (JPEG: LinkedIn lists JPG/PNG/GIF only). 45–155 KB at q90 |
| `out/<id>.webp` | the same, for the site's own use (e.g. a share sheet preview) |
| `out/icons/<variant>-favicon-{16,32,48}.png`, `-favicon.ico` | favicon tiles (rounded, own ground) |
| `out/icons/<variant>-apple-touch-icon-180.png` | opaque, full-bleed; iOS rounds it |
| `out/icons/<variant>-icon-{192,512}.png`, `-maskable-512.png` | manifest icons; maskable keeps the mark in the 80 % circle |
| `out/sheets/<id>.jpg` | each card at full size, in 300/260 px chat bubbles, at 400 px, as a 160 px thumbnail, as a 96 px square crop, and in large- and small-card feed-post frames |
| `out/sheets/overview-*.webp` | grid (half size), chat sizes, feed posts, icons |

`home-centered` is marked `"variant": true`: an alternative home card for the owner to compare,
skipped by `sheet.mjs` unless `--variants` is passed.

## Rules the layouts follow

- Type roles from the craft audit (§3.2): Newsreader at opsz 72, weight 400, −0.022em for names
  and titles; Inter for status, lines and bylines. Sentence case, no mono, no caps, no italic,
  no numbering, no dots, rules or badges (craft audit §1 P1.4).
- Sizes are set for the preview, not the page: titles 96–156 px and the name 84–112 px (about
  24 px in a 300 px chat bubble), lines 30–32 px, bylines 26 px. Titles shrink to fit their
  column (`fit()` measures the text with a Range).
- Margins 80 px left and right, 64 px top and bottom; the object's box stays inside them.
- Objects are fitted by their lit area, measured from the poster, so every render sits the same
  size whatever its framing. Ground-subtracted posters are drawn with `plus-lighter` over
  `#0a0a0b`, exactly as the site composites them; the light around the object is a CSS radial in
  the project's accent at 13 %/5 %, as on the site.
- The About photo is graded in CSS (default brightness 0.62, saturation 0.82, slight warm;
  `photoFilter` overrides it) and faded into the ground to the left and top, and to the right
  where it does not reach the edge. `photoFit` places it by a focus point instead of
  object-fit: `{ focus: [x, y] as fractions of the image, at: [x, y] in card px, height }`;
  `photoWidth` sets the panel and `textWidth` the column the name is fitted to.
- A fixed-seed grain at 5 % overlay dithers the dark gradients so JPEG and WebP do not band.
- The mark is set in type: Newsreader "edk" (or "e"), heavier and looser at 48 px and below,
  ink box centred and nudged 2 % down so the x-height reads as centred.

## Owner's choices (October 2026)

- Home card: the split layout (`home`: name left, object right). `home-centered` stays only as a
  variant for comparison.
- Favicon: "e" at 16 and 32 px, "edk" from 48 px up.
- Icon colour: warm off-white mark on black.
- About card: the gate selfie (`content/photos/eren-ytu-gate.jpg`) on the right, graded into
  `#0a0a0b`, with the face kept inside the centre 630 × 630 square so square crops still show
  it; the name in Newsreader, a small "About" label and the line as before. It replaced the
  courtyard photo so the preview carries a face.

## Known gaps

- No SVG favicon yet: it needs the glyphs as outlines (fontTools or opentype.js); the sandbox
  had neither. The ICO plus PNGs cover every browser.
- The mock frames are generic; real-device checks (LinkedIn Post Inspector, WhatsApp to self,
  iMessage, Slack) need the site to be live.
- Sample text: the log entry and every `sample.postText` are placeholders, as in
  `prototypes/CONTENT.md`; Eat Map's line waits for the owner.
