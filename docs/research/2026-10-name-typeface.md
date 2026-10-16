# V8: the typeface of the name (type study, round 4)

Status: research, 2026-10-16. Read-only for the repo. Every number below is measured in this session
(Playwright on the built `dist/lab/one/`, Chromium, 1440x900 and 390x844 DPR 3 touch, reduced motion)
unless it is marked as a reference value from `docs/research/references/data/study3-anatomy/`.

Images (all in `(session scratchpad) round4/type/`):

- `sheet-glyphs.png`: "Kuyucaklıoğlu" at 96 px in all 13 settings, on the Graphite ground.
- `sheet-serif-1.png`: the real page top at 1440 and 390, settings 00 to 04.
- `sheet-serif-2.png`: settings 05 to 08 (EB Garamond, Cormorant, Gloock, Source Serif Display).
- `sheet-sans.png`: settings 00 and 09 to 12 (Inter Display, Geist, Bricolage, Commissioner).
- `sheet-phone-names.png`: the name at 390 DPR 3 (hairlines at true phone resolution).
- `shots/<id>-desk.png`, `shots/<id>-phone.png`: the single screenshots; `shots/measure.json`.
- `sheets/current-desk.png`, `sheets/current-phone.png`: the page as built today.

Method: each candidate is injected into the real built page (same aura, plate, hush, lede, rows,
bar); only `.brief .name` changes. Fonts come from npm `@fontsource*` 5.3.x, all OFL-1.1, Turkish
checked (ğ, ı, İ, ş render from the font, `document.fonts.check` true). Scripts:
`round4/type/scripts/` (`render.mjs`, `cands.mjs`, `sheet.mjs`, `kern.mjs`).

## 1. What the name is set in today

| Property | Value | Source |
|---|---|---|
| Element | `<h1 class="h2 name">` | `src/one/Brief.astro:20` |
| Face | Newsreader roman, self-hosted subset (latin + a 5-glyph TR file) | `src/one/base.css:10-12` |
| Axes in the shipped file | wght 400-500, opsz 16-72 | fontTools on `src/fonts/newsreader-latin.woff2` |
| Weight | 500 | `.h2`, `base.css:52` |
| Size | 42 px at 1440, 32 px at 390 (`--fs-h2`) | computed |
| Optical size | `auto`, so opsz = 42 (desktop) and 32 (phone) | computed |
| Tracking | -0.02 em (-0.84 px / -0.64 px) | computed |
| Line height | 1.1 | computed |
| Colour | `--ink` #e8e3dd on #121214 | computed |
| Ink width | 459 px of a 600 px column (desktop); 343 of 358 px (phone) | measured |
| Lede below | Inter 20 px (desktop) / 18 px (phone), three to five lines, `--ink-2` | computed |

The same token sets the Record title; the bar mark "edk" is Newsreader 500 at 24 px.

The craft audit of 2026-10-09 (`docs/research/2026-10-craft-audit.md` §3.1-3.2), which the owner
accepted as "pairing 2", recommended Newsreader at **opsz 60-72, weight 400, -0.022 em**. The build
drifted from it: weight 500, opsz 32-42, and the name became an ordinary `.h2`.

## 2. Why it can read cheap to a fresh eye

Ranked by how much each one contributes, judged on the screenshots.

1. **The wrong optical size.** At opsz 32-42 Newsreader draws its subhead design: lower stroke
   contrast, blunter serifs, a larger x-height and looser fit. Together with weight 500 this is the
   look of a news site or a blog headline. Compare rows 00 and 01 in `sheet-glyphs.png`: the same
   family at opsz 72 / 370 is a different voice.
2. **Too heavy for light on dark.** Light text on a dark ground looks heavier than its weight
   (irradiation). 500 on #121214 reads close to a semibold. Every loved reference sets its display
   serif at a light or regular weight: Antoine's Editorial New 200, Robin's Eksell 400, Shopify's
   HW Cigars 400, Dia's Exposure 500 at much higher contrast (study3-anatomy).
3. **No hierarchy.** The name is the same size as a section heading, and only 2.1x the lede on
   desktop and 1.78x on the phone. The three to five grey lede lines under it outweigh one line of
   name. Reference ratios of largest text to body: Anthony Fu 36/16 = 2.25, Dia 48/22 = 2.2, Notion
   64/22 = 2.9 (phone 42/18 = 2.33), Robin 135/20 = 6.75 (phone 3.7). Ours is the lowest of all.
4. **Loose tracking for the size.** -0.02 em at 500 leaves "Kuyucaklıoğlu" evenly grey but slack.
   References track display type at -0.03 to -0.05 em (Dia -0.05, Shopify serif -0.05, Notion -0.033).
5. **A cramped phone line.** At 390 the name fills 343 of 358 px edge to edge at 32 px. A one-line name
   that touches both gutters reads as forced to fit. The plate's horizon line also crosses just under
   the descenders of y and ğ (`sheets/current-phone.png`, `sheet-phone-names.png`).
6. **The face is common.** Newsreader is a Google Fonts staple. Alone this is minor; at the subhead
   optical size it adds to the "default blog" impression.

Not the cause (measured):

- **The Turkish glyphs.** ğ and ı are drawn well in Newsreader at every size (`sheet-glyphs.png`).
- **The TR subset split.** ğ comes from a second file, so kerning across "oğl" cannot apply. Measured at
  100 px: o-g 0.00 px, g-l +0.95 px, ğ-l -0.55 px. The difference is below 1 px at 100 px, so it is not
  visible at 42 px. (A control pair, T-o, kerns -7.81 px, so kerning is on.)
- **Rendering.** `-webkit-font-smoothing: antialiased` is set; hairlines hold at DPR 3 for every serif
  shortlisted below (`sheet-phone-names.png`).

## 3. Candidates

All settings: desktop one line, the name may leave the 600 px column (`white-space: nowrap`,
negative inline margin); phone two lines ("Eren Deniz / Kuyucaklıoğlu"). Ink widths from
`shots/measure.json`.

| Id | Setting | Desk px / ink | Phone px / ink | Verdict |
|---|---|---|---|---|
| 00 | Current: Newsreader 500, opsz auto, -0.02 em | 42 / 459 | 32 / 343 (one line) | control |
| 01 | **Newsreader Display**: opsz 72, wght 370, -0.028 em | 60 / 652 | 44 / 265 | **ship** |
| 02 | Instrument Serif 400, -0.012 em | 68 / 576 | 50 / 236 | shortlist, no |
| 03 | **Fraunces**: opsz 72, wght 320, SOFT 40, WONK 0, -0.025 em | 60 / 617 | 44 / 252 | **lab** |
| 04 | **Playfair 2.0**: opsz 60, wght 380, -0.02 em | 58 / 582 | 42 / 234 | **lab** |
| 05 | EB Garamond 460, -0.012 em | 64 / 642 | 46 / 256 | shortlist, no |
| 06 | Cormorant Garamond 500, -0.008 em | 70 / 699 | 50 / 274 | no |
| 07 | Gloock 400, -0.022 em | 56 / 642 | 42 / 268 | no |
| 08 | Source Serif 4 Display: opsz 60, wght 380 | 58 / 578 | 42 / 233 | no |
| 09 | Inter Display: opsz 32, wght 540, -0.036 em | 54 / 564 | 40 / 232 | no |
| 10 | Geist 500, -0.042 em | 54 / 585 | 40 / 241 | no |
| 11 | Bricolage Grotesque: opsz 96, wdth 88, wght 480 | 56 / 453 | 42 / 192 | no |
| 12 | Commissioner (flared humanist): wght 380, FLAR 70 | 54 / 589 | 40 / 243 | shortlist, wildcard |

### Why and why not

- **01 Newsreader Display.** For: it fixes causes 1-5 and keeps one serif voice across the page (the
  mark, h3 lines, the Record reading face, the postcard notes are all Newsreader). At opsz 72 the
  contrast rises, the serifs sharpen and the fit tightens: the closest open match to the refinement of
  Dia's Exposure and Notion's Lyon. The owner's "elegant and personal" is kept because the face stays;
  the father's "cheap" is answered because the setting changes. It is also the craft audit's original
  recommendation, which the build did not follow. Against: a reader who disliked "the font" may still
  recognise it. Cost: a name-only static instance (opsz 72, wght 370, the 27 glyphs of the name and
  "edk") is 3.1 KB woff2; or re-subset the shared file with wght 350-500 (today 400-500).
- **04 Playfair 2.0** (the opsz version, not Playfair Display). For: the most "elegant" to a fresh eye:
  high contrast, wide, calm, classical-editorial; ğ and k are handsome; hairlines hold at 390 DPR 3.
  Against: the name of Playfair Display carries a template association (wedding and restaurant
  sites), although the 2.0 drawing is finer; it is wide (582 px at 58 px) and a second serif family
  next to Newsreader, so the mark and h3 lines would differ from the name. 3.6 KB as a name instance.
- **03 Fraunces.** For: the most personal of the serifs: soft wedges, a lively k and y, warmth without
  whimsy at SOFT 40 / WONK 0; the nearest open relative of Robin's Eksell and Shopify's serif mood.
  Against: Fraunces was the indie-startup serif of 2020-23; above opsz 72 its hairlines vanish on dark
  (craft audit), so it must stay at 72. 3.6 KB as a name instance.
- **02 Instrument Serif.** For: condensed, fashionable, near Shopify's HW Cigars. Against: one weight,
  and its display use is the 2024-26 landing-page cliché; it reads "product launch", the opposite of
  what the owner asked.
- **05 EB Garamond.** For: warm, old-style, personal. Against: bookish and academic; small x-height
  makes it look smaller than its size; less modern than the rest of the page.
- **12 Commissioner, flared.** For: an Optima-like humanist sans: calm, personal, not product-like; a
  real third path. Against: it drops the serif voice the owner chose (pairing 2) and sits close to
  Inter, so the name and the lede lose their contrast.
- **06 Cormorant**: calligraphic and fine, but wedding-invitation in tone and fragile below 500 on dark.
  **07 Gloock**: a fat face; too loud for the owner's restraint. **08 Source Serif Display**: spindly
  and cool on dark. **09 Inter Display**, **10 Geist**: product faces (Inter is already the lede; Geist
  is the Vercel template look); the owner said "not product-like". **11 Bricolage**: quirky, reads Gen-Z
  startup.

## 4. Recommendation

Put three settings on a lab switch on `/lab/one/` (for example `?name=current|nr|playfair|fraunces`),
with the current setting as the control, and let the owner (and the father) choose on the phone and the
desktop:

1. **01 Newsreader Display. Ship this one.** It removes every measured cause and keeps the page one voice.
2. **04 Playfair 2.0.** The choice if the owner wants the name in a face of its own.
3. **03 Fraunces.** The choice if the owner wants more warmth and character.

Setting for 01, to be written into the charter before use:

- A separate token and class for the name (`--fs-name`), not `.h2`; `.h2` stays for the Record title.
- `font-optical-sizing: none; font-variation-settings: "opsz" 72;` weight 370 at 1440, 380 at 390
  (the phone's smaller size needs a little more stroke); tracking -0.028 em desktop, -0.022 em phone;
  line height 1.0.
- Size 60 px at 1440 (research cap 64), 40-42 px at 390 in two balanced lines "Eren Deniz /
  Kuyucaklıoğlu" (research phone cap 40; a two-line name may take 42). Name-to-lede ratio becomes 3.0
  (desktop) and 2.3 (phone), Notion's proportion.
- On desktop the name may be wider than the 600 px text column (652 px ink); centre it on the page axis.
- On the phone, move or fade the plate's horizon line so it does not cross the name.
- The bar mark "edk" moves to the same instance, so the mark and the name stay one hand.
- Ship the name as a static instance of 3.1 KB, preloaded (or inlined), so the name never swaps.

Phone and desktop differ here by design (one line against two), as the owner allowed on 2026-10-15.
