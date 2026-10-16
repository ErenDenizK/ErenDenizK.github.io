# Round 3 audit of `/lab/one/` (2026-10-16)

Auditor, read-only. Build: detached worktree of `lane/review-r3` at a801fdb, `npm run build` exit 0
(24 pages), served with `node tests/serve.mjs dist 4821 /`. Headless Chromium (Playwright), not real
hardware; no WebKit is installed, so iOS Safari behaviour is a hypothesis where marked.
All measurements use `?card=lanes`, because T1 makes that placement the default.

Evidence (all under `(session scratchpad) round3/`):

- `d/walk-NNN.jpg`, `p/walk-NNN.jpg`: a still every half screen (1440 x 900; 390 x 844 touch).
  `d-s1.jpg`, `d-s2.jpg`, `p-s1.jpg`, `p-s2.jpg`: contact sheets. `d/*.json`, `p/*.json`: type, strip
  boxes, hit sizes, fill.
- `ui-d/`, `ui-p/`: the bar, the rail panel, the opened project (capsule, "How it's made"), with
  `ui.json` measurements. `cap-cmp.png`, `rail-cmp.png`, `how-cmp.jpg`: crops.
- `rec-lab/`, `rec-rec/`: the recorder at 390 x 844, DPR 3, isMobile, hasTouch, 24 frames each, with
  `info.json` (video state per frame). `rec-lab-sheet.jpg`, `rec-rec-sheet.jpg`, `rec-big.png`.
- `tools/`: `probe.mjs`, `ink.mjs`, `empty.py`, `ui.mjs`, `rec.mjs`, `stack.mjs`, `align.mjs`, `sheet.py`.

## 1. Work list: rows not closed and not built, plus weak "built" rows

Source: `docs/feedback/2026-10-16-lab-one-review.md`, `docs/research/2026-10-round2-critique.md`,
this audit's frames.

### 1.1 Round 3 rows (binding)

| Id | Task | Evidence today | Section here |
|---|---|---|---|
| T1 | `?card=lanes` becomes the default; drop the switch | `Rest.astro` default `end`; `One.astro` `pick('card', ['end','lanes'], 'end')`; the inline script moves `#card` | 2.6 (gap under the card) |
| T2 | Postcard-back study: grid, type scale, texture, a drawing per card | Critique P4: still reads as a postcard; only three of five hex values fit | not measured here (big view) |
| T3 | 2.5D card photo as a lab switch | Photo is one flat regraded image (`IdCard.astro`) | - |
| T4 | Remind the owner: default branch, delete head branches | note | - |
| T6 | Recorder phone render problem | Reproduced, see section 3 | 3 |
| T7 | Bottom edk cut off from the page | `d/walk-017..019.jpg`: 192 px empty band, then the edk alone (fill 0.10) | 2.4 (note only) |
| T8 | Study: role of 3D objects; fit the recorder in | Recorder is 280 px (136 px phone) in a corner of the strip head | 3, 2.4 |
| T9 | Rail jump panel grows from the rail edge, light blur | Desktop panel is 94 % opaque, blur invisible; phone sheet is 98 % opaque, no blur, floats 8 px left of the rail | 2.5 |
| T10 | Lanyard follows every card motion (hover sway, idle, entrance) | Not measured in motion here; `card3d.ts` | - |
| T11 | Replace the "How it's made" object | `how-cmp.jpg`: a tilted crop of Recto's pages grid, about 70 % black, four tiny white pages, hanging off the card | 2.5 |
| T13 | Capsule on the bar's glass, one baseline, one height | Different recipe from the tab bar; phone close icon shrinks to 12 px (bug) | 2.5 |
| T14 | Two capsules: close alone on the left | One capsule today | 2.5 |
| T15 | Clear exits from the photo view and the project layer | Close is one 44 px circle inside the action capsule; photo view has no visible exit | 2.5 |
| T19 | Critic checks every new piece frame by frame | process | - |
| T20 | Home Record strip born from the new language | Different left edges, weight 400 title vs 500 elsewhere, different row rhythm | 2.1, 2.3 |
| T21 | Continue the round-2 open rows | below | - |

### 1.2 Earlier rows still open or partly done

| Id | State | What remains (evidence) |
|---|---|---|
| G2, G3 | open | Cheap spots found in this audit: phone close icon 12 px; text reading through the bar and the capsule on phones (`crop-bar.jpg`, `cap-cmp.png`); empty bands (section 2.4); the "How it's made" crop; the rail foot larger than its rows |
| G4, M5, T19 | open | Frame review continues; open snapshot pause of 0.35-0.4 s (critique weak point 2) |
| G5 | this audit | Section 2 |
| G6 | open | Lazy postcards and side frames grey for seconds after a jump (critique 4) |
| G7, G8 | partly | `docs/research/2026-10-feature-parity.md` exists now (status: analysis); needs a plan column per feature and a decision |
| M1, M2 | partly | Motion audit: style recalc on aura cross-fades, document-size layers; real hardware still unchecked |
| C2 | partly | Texture and hover sway exist; "livelier photo" is a regrade only (T3); shake barely moves (critique) |
| C3 | partly | Closed by T1 once the default changes |
| P4 | partly | T2 |
| R2 | partly | `docs/design/record-language.md` is in the repo (status: analysis); recorder does not turn with the scroll; hand-over to `/record/` not wired |
| E1 | partly | Empty bands remain, see 2.4 |
| H2, H3 | open | Achievement plan; PR rule (in CLAUDE.md now) |

### 1.3 "Built" rows the critique called weak

| Id | Weakness |
|---|---|
| W3, O1 | Open still waits for the page snapshot (0.35-0.4 s headless) after the 120 ms press |
| W4 | Drawings are temple, study, night alley, not the spec's night street and city plan (owner liked them: T17; keep) |
| O3 | White document pages inside Recto's clip and steps: the brightest thing on a Graphite page |
| P2 | Postcards grey and blurred for about 5 s after a jump (lazy images) |
| R1 | Hand-over to the Record page not wired; the owner now says it feels pasted (T20) |
| C1 | Fast shake barely moves the card in the recording |

## 2. Token and rhythm audit (G5)

### 2.1 Type in use, per strip (computed, 1440 / 390)

Token scale (`src/one/tokens.css`): cap 12, label 13, small 14-15, body 16-17, lede 18-20, h4 20-24,
h3 24-29, h2 32-42, title 44-72. Charter: 13 px smallest readable; 11-12 px only for labels in a figure;
Record prose 21 / 19 px, weight 430, line height 1.55.

| Strip | Sizes used at 1440 (px) | Off-token or mixed |
|---|---|---|
| Bar | 24 serif mark, 15 tabs, 13 clock | tabs at a raw 15 px, not `--fs-small` |
| Brief | 42 h2, 20 lede, 17 rows, 15 chips, 13 labels | 5 sizes; fine |
| Bostanci | 29 italic caption, 13 place | fine |
| Work | 72 wordmarks, 17 promise, 15 button, 13 meta, 12 frame caption and tags | the product wordmarks (72) are 1.7x the owner's name (42): intended? |
| How I work | 42, 29 (lane names, "Both matter", quote), 17 sans list, 17 serif italic, 13 | 5 sizes; two families at 17 |
| Card (lanes) | 102 emboss, 28.2, 24, 22.2, 13.8, 12.9, 12, 11.7, 7.2 | scaled object, 7.2 px microprint (decoration; acceptable only if aria-hidden), 13.8 / 12.9 near-duplicates |
| Path | 29 heading, 17 serif rows, 13 dates | heading is h3 while sibling chapter heads are h2 |
| Photos | 42, 17 lede, 17 serif italic captions (14 on phone), 13 hint, 12 numbers | fine |
| Record strip | 42 title at weight **400**, 24 year, 24 essay title, 21 / 430 notes, 17 dek, 15 link, 13 meta, 12 months | title weight differs from How I work and Photos (500); two title sizes in one list (24 essay, 21 note) |
| Footer | 15 made, 13 licence | fine |

Line heights at 17 px body: 1.40 (brief rows), 1.45 (lanes list), 1.50 (record dek), 1.55 (Work
promise), 1.60 (How and Photos ledes): five values for one size.

Corrections:

1. Section heads: one role. How I work, Photos, The record at `--fs-h2` weight 500 (the record is 400 now:
   set `.rs-title` to 500, or set all three to 400; one choice). Path is a chapter sibling: either h2 like
   the others or make it visibly a sub-head of chapter I (keep h3 29 px, but then align it with How
   I work's lane titles, not with a third left edge).
2. Body line height: two values only, 1.5 for lists and short rows, 1.6 for ledes. Today 1.40, 1.45, 1.50,
   1.55, 1.60.
3. Lists at 17 px: one family. How I work's lanes are Inter, Path's rows are Newsreader. Pick serif for
   both (Path's look is the warmer one) or sans for both.
4. Record strip: one entry-title size (21 / 430, the charter's Record prose) for notes and essays; let the
   essay differ by its mark and dek, not by 24 vs 21.
5. Tabs and capsule labels: `--fs-small` everywhere (tabs are a raw 15 px; capsule uses the token and
   becomes 14 on phones, the tabs stay 15: a 1 px mismatch between the two glass pieces on phones).
6. Rail foot ("30% down the page"): 17 px at 1440 and 16 px on phones, larger than the rows (14 / 15).
   Its `.meta` class has no rule outside the Record strip. Set it to 13 px `--ink-3`.
7. Card: round the scaled sizes to two steps (the 13.8 and 12.9 pair reads as an error at 2x zoom).

### 2.2 Spacing between and inside strips (measured boxes, document px)

| Gap | 1440 | 390 | Token |
|---|---|---|---|
| Brief ink end to Bostanci photo top | 206 | 207 | brief `min-height` 690 / 700 plus 44 / 32 margin: not a token |
| Bostanci to Work | 0 (frames overlap by design) | 7 | - |
| Eat Map block end to tear | 1350 px block for one frame and three lines | 1182 | W7 says short |
| Chapter gap (How to card, card to Path, Path to Photos, Photos to Record) | 168 | 112 | `--chapter-gap` holds |
| Inside How I work | heading-lede 24, lede-lanes 48, lanes-"Both matter" about 30, to quote 64 | similar | mixed: 24 / 30 / 48 / 64 |
| Record to footer | 0 box, 112 padding | same | `--s-9` |
| Footer bottom padding | 72 | 72 | `--s-8` |

The chapter gap is consistent, but on screen the gaps read larger than 168 because a chapter box carries
its own empty area: the card slot is 773 px tall for a 515 px card (258 px of air under it, plus the 168 px
gap, plus Path's own top), so the eye sees about 560 px of nothing between the card and "Path"
(`d/walk-012.jpg`).

Corrections:

1. Card chapter: size the slot to the card plus its swing allowance (about 560 px at 1440, not 773), and
   cut the gap to Path to `--in-chapter` (72 / 48): with T1 the card belongs to chapter I, so the rhythm
   inside chapter I is the in-chapter gap, not the chapter gap.
2. Inside How I work use the in-chapter scale only: heading to lede 24 (`--s-5`), lede to figure 48
   (`--s-7`), figure to "Both matter" 48, to the quote 48. Today 24 / 48 / 30 / 64.
3. Brief: replace the 690 / 700 px `min-height` plus 44 / 32 px margin with one token pair, for example
   padding-bottom `--s-9` (112) on desktop and `--s-8` (72) on phones; the measured air of 206 px over a
   screen whose fill is 0.18 makes the first scroll show the photo's top only (`d/walk-000.jpg`).
4. Eat Map: the 1350 px block (1182 on phones) carries the tear and How I work behind it; fine for M3,
   but the frame itself sits on 7-9 % fill for two half-screens (`d/walk-007..008`). Shorten the hold by
   about 300 px or let the drawing (night alley) rise into the empty upper half.

### 2.3 Alignment drift

Horizontal axes at 1440 (left edge of the ink, `tools/align.mjs`):

| Piece | Left edge or axis |
|---|---|
| Brief, Work, How I work head, Photos head, footer | centre 720 |
| How I work lanes | 340 (text 368) |
| Quote | 368 |
| "Both matter" node | 344 |
| Path heading | 328 |
| Record strip: year | 190; title, dek, rows | 289-290 |
| Bostanci caption | right edge 383, beside a photo whose left edge is 431 (48 px apart) |

Five left edges in the person's part (190, 289, 328, 340, 368) inside 180 px. The Record strip is the
one that looks pasted (T20): its content column starts 50 px left of How I work's.

Corrections:

1. One left edge for the person's part at 1440: 340 (the 760 px column of How I work). Path heading:
   328 to 340 (its 26 px padding-left comes from the phone rule; drop it on desktop). Quote: 368 is
   right (it hangs on the lane's text edge after the 2 px rule); keep the rule at 340.
2. Record strip: change `--rec-w` from 1060 to 960 so the gutter plus spine (100) sits at 240-340 and the
   content column starts at 340, on the same edge as How I work. The year and dates then hang in the
   margin, which is the Record's own idea.
3. Phones: brief and Work are centred, the person's part is left (16). Acceptable as two designs, but the
   chapter heads (How I work, Photos, The record) should then all be left; today they are, keep it.
4. Vertical centres in the bar: mark, tabs and clock share centre y 38 (desktop) and 32 (phone) within
   0.5 px. Good. Capsule: all three items centre at 850 (desktop) / 801.5-802 (phone). Good; the owner's
   "not aligned" comes from the shrunken close icon on phones and from the different recipe (2.5), not
   from the boxes.

### 2.4 Fill and empty space, every half screen

Fill = share of 24 px cells with visible content (pixel deviation > 7 or brightness > 70, the bar
excluded); band = the tallest run of empty rows. Grades: A rich, B good, C thin, D empty.

| # | y 1440 | Fill | Band | Grade | Note |
|---|---|---|---|---|---|
| 0 | 0 | 0.18 | 168 | B | brief; the photo's top shows at the bottom edge |
| 1 | 450 | 0.29 | 144 | B | photo develops |
| 2 | 900 | 0.31 | 24 | A | photo and caption |
| 3 | 1350 | 0.20 | 48 | A | Recto flies in |
| 4 | 1800 | 0.18 | 24 | A | Recto text |
| 5 | 2250 | 0.18 | 24 | A | English Prep |
| 6 | 2700 | 0.10 | 120 | B | |
| 7 | 3150 | 0.09 | 72 | B | Eat Map frame |
| 8 | 3600 | 0.07 | 192 | C | Eat Map hold, the tear rises; upper half empty |
| 9 | 4050 | 0.11 | 168 | C | How I work head alone in the upper half |
| 10 | 4500 | 0.11 | 216 | C | quote then about 420 px of empty paper before the lanyard |
| 11 | 4950 | 0.12 | 192 | C | lanyard alone, card enters |
| 12 | 5400 | 0.13 | 168 | C | card at the top, about 560 px of nothing to "Path" |
| 13 | 5850 | 0.10 | 168 | B | Path |
| 14 | 6300 | 0.36 | 96 | A | photos |
| 15 | 6750 | 0.31 | 144 | A | photos and Record head |
| 16 | 7200 | 0.20 | 48 | A | Record rows |
| 17 | 7650 | 0.11 | 192 | C | "The whole record", then empty |
| 18-19 | 7905 (end) | 0.10 | 192 | C | edk alone (T7) |

Phone (390 x 844, half screen 422): grades A or B everywhere except #6-8 (y 2532-3376, Eat Map hold:
fill 0.18-0.21, bands 168-288 px, C), and #19-21 (end, band 216, C). The phone is fuller than the
desktop because the columns fill its width.

Desktop: 7 of 20 half-screens are C, all between Eat Map and Path, and at the end. Corrections:

1. Eat Map hold (#8): let the night-alley drawing rise into the upper half (the drawings are the owner's
   favourite, T17), or shorten the hold by 300 px.
2. How I work to the card (#9-11): the empty band after the quote is the card's lanyard drop zone. Start
   the lanyard 200 px higher, or put the card beside the lanes on desktop (two columns: lanes 340-880,
   card 940-1240); that also fixes #12, since the card no longer needs its own screen.
3. Card to Path (#12): see 2.2 item 1.
4. End (#17-19): T7 says no edk work now; the 192 px band before it is the strip's tail plus the footer's
   112 px top padding. Cut the footer top to `--s-8` (72).

### 2.5 Radii, glass recipes, hit sizes and states

Glass recipes in use (computed):

| Piece | Background | Blur | Edge | Shadow | Radius | Padding / item height | Label |
|---|---|---|---|---|---|---|---|
| Home / Record tabs (the reference, T13) | rgb(30 30 34 / 0.62) | 16 px | inset 1 px white 0.07 | 0 12 40 -16 black 0.7 | pill | 4 px / 40 px | 15 px, gap 2 |
| Opened project capsule | rgb(28 30 34 / 0.72) | 16 px | inset 1 px white 0.08 | 0 16 40 -12 black 0.8 | pill | 4 px / 44 px | 15 (14 phone), gap 4 |
| Rail panel, desktop | rgb(26 26 29 / 0.94) | 16 px (invisible at 0.94) | inset 1 px ink 0.08 | -24 0 60 -24 black | 14 0 0 14 | rows 28 px | 14 px rows, 17 px foot |
| Rail sheet, phone | rgb(26 26 29 / 0.98), no blur | none | inset 1 px ink 0.08 | 0 12 40 -12 black | 14 | rows 44 px | 15 px rows, 16 px foot |

Defects:

- **Phone close icon is 12 px** (`cap-cmp.png`, `how-cmp.jpg`). `work.css` phone rule
  `.capsule :is(a, .cap-note) { padding: 0 16px; }` comes after `.capsule .cap-x { width: 44px; padding: 0 }`
  with the same specificity, so the 44 px close button gets 16 px side padding and the 20 px icon is
  squeezed to a 12 px content box. Fix: `.capsule .cap-x { padding: 0 !important }` or move the phone
  padding rule to `:is(.cap-go, .cap-code, .cap-note)`.
- Phone: serif body text reads through the capsule and through the bar band (`cap-cmp.png`,
  `crop-bar.jpg`): 0.72 / 0.62 over a 16 px blur is too thin over large text.
- The capsule's lime "Open Recto" fill is a solid button inside glass: the capsule reads as a button row,
  not as glass. With T14, the close capsule should be the bar's exact glass; the action capsule the same
  glass with the product fill only on the primary action.
- Desktop rail panel at 0.94 hides the blur; phone sheet has no blur and no tie to the rail.

Corrections (one glass token set for all three):

1. Write the bar's recipe as tokens: `--glass-bg: rgb(30 30 34 / 0.62)`, `--glass-blur: blur(20px)
   saturate(1.4)`, `--glass-edge: inset 0 0 0 1px rgb(255 255 255 / 0.07)`, `--glass-shadow: 0 12px 40px
   -16px rgb(0 0 0 / 0.7)`, `--glass-pad: 4px`, item height 40 px desktop, 44 px touch. Raise the blur
   from 16 to 20-24 px plus saturate, which fixes text reading through without raising the opacity (the
   owner liked the tab's look).
2. Capsule (T13, T14): two capsules, both on these tokens; close capsule 48 x 48 outer (40 item + 4 + 4)
   on desktop, 52 x 52 on touch, at the left; action capsule at the same height, 12 px apart, centred
   pair. Labels `--fs-small` on both and on the tabs.
3. Rail panel (T9): grow from the rail's edge (clip-path or scale-x from the right edge, 300-480 ms
   `--ease-out`), on the glass tokens, plus a page veil `backdrop-filter: blur(6px)` with ink 0.04 over
   the rest of the page while open. Rows: desktop 28 px is fine for a fine pointer; phone keeps 44 px. Foot
   at 13 px `--ink-3`.
4. Radii in use: 1, 1.5, 2, 3, 4, 6, 8, 12, 14, 26 px, plus 2.4 / 5 / 8 cqi on the card, plus the tokens
   3 / 6 / 10 / 16 / pill. Raw values to fold: rail 14 and 12 (make one `--r-panel: 14px`), focus 4 and 8
   (one `--r-focus: 6px`), phone frame 26 (token `--r-phone`), postcard 4 / 2 / 6 / 12 (map to
   `--r-print` 3 and `--r-chip` 6).

Hit sizes (rendered boxes; touch floor 44, desktop floor 24):

| Element | 1440 | 390 touch | Verdict |
|---|---|---|---|
| Tabs Home / Record | 82 x 40, 91 x 40 | 74 x 40, 83 x 40 | phone below 44: raise to 44 on `(pointer: coarse)` (outer capsule 52) |
| Brief "The record" link | 87 x 20 | 82 x 20 | below 24 / 44; pad the link (`padding-block: 12px; margin-block: -12px`) |
| Chips | 32 tall | 44 | good |
| Take a look | 120 x 44 | 115 x 44 (Recto measured 52 mid-scrub) | good |
| Card links on the face (GitHub, LinkedIn) | 75 x 32 | 71 x 32 | below 44 on touch |
| Record strip: note date links ("8 Oct, note") | 64 x 18 | 336 x 18 | below 24 / 44 |
| Record strip: project links ("Recto") | 36 x 16 | 36 x 16 | below; on touch these sit inside the row link's ::after, so a tap is ambiguous |
| Record strip: month bars | 57 x 59 | 30 x 59 | phone width below 44 |
| The whole record | 249 x 44 | 163 x 44 | good |
| Rail rows | 202 x 28 | 183 x 44 | good per pointer |
| Capsule items | 44 tall | 44 tall | good, but see the 12 px icon |

States missing: `.mark` has no hover or pressed state; tabs, `.rs-all`, card links and the capsule have
hover but no `:active` press (the chips and buttons scale 0.98 on press; use the same 120 ms press
everywhere, G6); `.pj` project links have no hover; month bars only recolour their label. Focus rings
use radius 4 in `base.css` and 8 in the rail and Record strip.

### 2.6 Motion tokens (short)

`--ease-reel` is commented "the deck reel in Work (draft)"; the deck is gone (W1): remove it. Durations
are on tokens; the capsule and bar transitions use raw 150 ms where `--t-quick` is 160 ms: one value.

## 3. Recorder on phones (T6)

Rig: 390 x 844, DPR 3, isMobile, hasTouch; scrolled down like a visitor, then 24 frames over about 7 s.
`/lab/one/?card=lanes` and `/record/`.

What plays: on both pages `src/scripts/media.ts` picks the phone path (`loopOf`: not `desktopTier()`, the
manifest has `spin`), so the stage plays `spin.av1.mp4` (640 x 640, 4 s turntable, 360 degrees, hold from
frame 72) with the bob float. Lab slot 136 x 136 at x 254-390; Record slot 164 x 164 at x 228-392.
Video readyState 4 in every frame, no console errors. Stacking: no ancestor isolates the stage on either
page (`tools/stack.mjs`), so plus-lighter reaches the real field in Chromium.

Defect (seen in `rec-lab-sheet.jpg`, `rec-big.png`, frames f02, f09, f13, f20):

1. **The object is see-through and milky on Home.** The stage is additive (`mix-blend-mode:
   plus-lighter` on `.m-stage`, the poster, the video). On `/record/` the ground is near-black, so
   additive equals normal and the object looks solid. On Home the strip stands on the bright Record aura
   (pixel level about 55-65 of 255 at the object, against about 25 on `/record/`) and on the Istanbul
   line-art plate: the object cannot be darker than what is under it, so its dark faces, the reel rings and
   the shading lift to the aura's blue, and the ferry drawing's lines show through the body (clearest in
   the edge-on spin frames, f09, f20: the ship's lines cross the slab).
2. **The video lifts a disc around it.** With the video on, the ground around the object is 2-3 levels
   brighter than with the poster (f00 vs f02 luminance profiles): the spin's subtracted ground is not
   exactly zero after AV1 coding; under the radial mask it adds a faint disc. Invisible on near-black, faint
   but present on the aura.
3. **The multiply shadow is cut by the screen edge.** `.rs-obj` on phones has `margin: -36px -16px -40px
   0`, so the slot ends at x 390, past the 16 px gutter. The shadow (`.m-shadow`, multiply) and the glow
   (`.m-glow`, inset -34 %) run to the viewport's edge and stop there (main clips sideways); the rail's
   beads at x about 372-384 sit on the object's lower right.
4. The turntable at 136 px: the edge-on frames (a 20 px sliver) and the dark back face read as a flicker
   at this size. On `/record/` at 164 px on black the same frames read as a turn.

Likely real-device cause to verify on the iPhone (not reproducible here, no WebKit): iOS Safari
composites a playing `<video>` in its own layer, and `mix-blend-mode` on such a layer (here also under
`mask-image`) is known to fall back to normal blending. Then the video's black ground draws as a dark disc
behind the object. On `/record/` that disc is near the ground colour and invisible; on Home, over the blue
aura, it is a visible dark circle that appears when the spin starts and goes away when the poster shows.
This matches "a small render problem on mobile" that only the Home strip shows. Check: on the iPhone,
compare `/lab/one/` with `/lab/one/?spin=0` (poster only, no video).

Where in the code:

- `src/one/media.css`: the stage block ported unchanged from the live site; it assumes a near-black
  ground (additive object, multiply shadow).
- `src/one/rest/RecordStrip.astro`: `.rs-obj` phone margin `-36px -16px -40px 0` (object at the screen
  edge); `.rs-pool` adds more light under the object.
- `src/scripts/media.ts`: `loopOf` sends every non-desktop slot to the spin; no check for the ground the
  slot stands on.
- `src/one/rest/Rest.astro` and `RecordStrip.astro`: the Record aura and the Istanbul plate are bright
  where the object stands.

Fix options (for the builder): (a) give the recorder a dark local ground on Home: a radial `--ground-deep`
pool under `.rs-obj` (opaque centre at about 0.9, fading by 60 % radius), so additive works as on
`/record/`; this also hides the video disc and a WebKit black square; (b) on phones in the Home strip
play the poster with the bob only (`data-nospin` or `?spin=0` per slot) until the device check; (c) move
the slot inside the gutter (`margin-right: 0`, width 148) so the shadow and glow end before the edge and
the rail; (d) keep the plate's drawing out of the object's circle (mask the plate there).

## 4. Correction list, ordered (numbers above)

1. Phone close icon 12 px: fix the padding rule (2.5).
2. Recorder on Home: dark local ground, inside the gutter, poster-only on phones until verified (3).
3. One glass token set; two capsules (T13, T14); rail panel grows from the edge with a veil (T9) (2.5).
4. Card default in chapter I (T1); card slot 773 to about 560 px; card-to-Path gap 168 to 72 (2.2).
5. Record strip on the 340 px edge (`--rec-w` 960), title weight 500, one entry-title size (2.1, 2.3).
6. One left edge (340) for the person's part; Path heading 328 to 340 (2.3).
7. In-chapter rhythm in How I work: 24 / 48 / 48 / 48 (2.2).
8. Body line heights to 1.5 and 1.6; lists one family (2.1).
9. Hit sizes: tabs 44 on touch, brief Record link padded, card face links 44, Record strip date and
   project links padded or folded into the row link (2.5).
10. Press state (120 ms, scale 0.98) on tabs, mark, `.rs-all`, card links, capsule (2.5).
11. Rail foot 13 px `--ink-3` (2.1).
12. Fill: drawings into the Eat Map hold's empty half; footer top 112 to 72 (2.4).
13. Remove `--ease-reel`; one quick duration (2.6).
