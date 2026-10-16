# Round 4 critique: integration and frame review of `/lab/one/` (2026-10-16, night)

Branch `wip/r4-rail` in `scratchpad/wt/r4-rail`, with `wip/r4-glass` and `wip/r4-person` merged (`--no-ff`).
Headless Chromium on software rendering. Desktop 1440 x 900; phone 390 x 844, DPR 3, touch. Timed sequences
use the DevTools animation clock slowed 10x (WAAPI and CSS); script-driven motion (card physics, the
scrub follow) runs at real speed, so its frame labels are approximate. Frames and sheets:
`scratchpad/round4/crit/` (`sheet-*.png`, one folder per sequence). Best 12: `scratchpad/round4/show/`.

## 1. Merge

- `wip/r4-glass`: clean merge.
- `wip/r4-person`: one conflict in `tests/e2e/lab-one.spec.ts`; both sides only added tests (the round-4
  name and glass block, the V5 postcard-back test). Kept both.
- `npm run check` 0 errors, 0 warnings, 1 hint; `npm run build:test` exit 0; lab-one specs 50 of 50 after
  the merge, before my fixes.

## 2. Fixes made in this pass

1. Scrub entry (V6, G6). The first move of a scrub sent the page to the held bead on the 70 ms follow:
   a hold on a far bead crossed about 2800 px in two frames, a cut. The follow now starts at a 260 ms time
   constant and relaxes to 70 ms in about 300 ms. Measured (desktop, headless, ~10 fps): the page now
   travels 0 to 2839 px over about 1 s of software frames instead of one frame; at 60 fps it is about
   0.5 s. Dragging after the first move keeps the 70 ms follow.
2. Focus ring on the rail column after Escape (V6, owner item 18 of the rail lane). The ring was a 2 px box
   with 12 px corners, cut open by the screen edge; in the close sequence it read as a window frame round
   the rail. It is now 1.5 px, half a capsule (22 px radius) docked to the edge, with the beads inside.
   The ring on a name is a 1.5 px capsule instead of a 6 px-corner box. Keyboard users still get a ring.
3. Docs: `docs/design/rail-bloom.md` (entry glide, rings, fan judgement), the review tracker's statuses.

## 3. Rail bloom: the variants judged (V6)

Sheets: `crit/sheet-bloom-{drop,palm,fan}-{d,p}.png`; close: `crit/sheet-close-drop-{d,p}*.png`.

- drop (default). The names leave the pressed point blurred and invisible for the first ~150 ms, then
  resolve in order outward; settled at ~650 ms with a soft ~20 px float into place. No name is ever
  drawn over another in any frame on either size. The pool of light and the arc read as one gesture from
  one point. Verdict: the best of the three, and it reads as a gesture rather than a menu. Kept as default.
- palm. From 215 to 280 ms on the phone the folded names stack on each other ("English Prep" over
  "Eat Map", "How I work" over "Card"). Alive, but those frames are defects by the G4 rule.
- fan. From 305 to 410 ms on the phone neighbours overlap too ("Eren" over "Recto", "English Prep" over
  "Eat Map"). The lane called fan's frames the cleanest; the integrator's frames do not agree. It also
  reads as a list appearing.
- Close: names fall back toward the point in ~200 ms, the veil returns over 380 ms; no frame defect.
- Veil: on desktop the blur and shade fade out from the rail to nothing at 76 % of the width; the left
  postcard stays sharp because it sits outside the mask, by design. Checked that nothing escapes the veil
  (hit test and a zoomed comparison: title and photographs at the same x are blurred equally). On the
  phone the whole width is blurred, strongest at the rail.
- Scrub (`crit/sheet-scrub-{d,p}*.png`): the page follows the thumb continuously through all ten
  sections, the name rolls in beside the thumb, release is still. Weak point: on the phone the scrub name
  can sit beside the section's own heading at the same height ("Eat Map" next to "Eat Map", move10);
  the halo keeps it readable, but it doubles the word for a moment.

## 4. Glass (V7)

Sheets: `crit/sheet-glass-tab-{d,p}.png`, `crit/sheet-glass-caps-{d,p}.png`.

- A (default): the 1 px rim takes the section's light (blue over the brief, green over Work, amber over
  Photos) and the body stays minimal; the inactive label is `--ink-2` and reads. This is what V7 asked:
  the tab's living light and the capsules' minimal body in one family. The change from `now` is small,
  which also respects "no big changes".
- B (SVG rim) and C (WebGL rim) are almost indistinguishable from A in headless frames; their value can
  only be judged on a real GPU and Safari.
- now: no rim, a dimmer inactive label.
- Verdict: A as default is right. The coverage row J22 ("keep today's glass until the owner picks") is the
  audit's inference, not the owner's words; it goes to the owner as a question, and `now` is one word away.

## 5. The name (V8)

Sheets: `crit/sheet-name-{d,p}.png`.

- Newsreader display (opsz 72, weight 380) at 48 px: high contrast, light, personal, not a product
  wordmark. `current` (text cut at weight 500) looks like bolded body text, which is the likely source of
  "cheap". Playfair reads as fashion; Fraunces is soft and quirky. 60 px is strong but over the owner's
  provisional cap. Phone: two lines, "Eren Deniz / Kuyucaklıoğlu", balanced.
- Verdict: the default is right; the owner decides face and size on the lab page.

## 6. Card, postcards, steady scroll

- ID card (`crit/sheet-card-{d-hover,d-turn,p}.png`): hover sway and rope follow; the grooved CD surface
  (T27) shows on both faces. On the phone turn, one frame at ~170 ms shows the card edge-on beside a dark
  soft rectangle (its shadow); it passes in one frame.
- Postcards (`crit/sheet-pc-*.png`): open, turn and close are continuous. The back's line drawing draws in
  over ~500 ms, then the stamp photo arrives; the lower block on the phone is tight and inside the card (V5).
- Steady scroll (`crit/sheet-scroll-{d,p}{1,2}.png`, a frame every ~120 px of the whole page): continuous,
  no stepped jump, no grey plates. Weak points that remain: the Eat Map hold is about one viewport of the
  same pin (W7 is satisfied, but it is the least alive stretch); a dark band with only the recorder between
  Photos and the Record strip, and the band before edk at the foot (E1, T7).

## 7. Rows

| Row | Evidence | Verdict |
|---|---|---|
| V1, V3 | owner decisions | closed (unchanged) |
| V2 | `round4/achievements-check.md` | built: report; the owner checks the account settings |
| V4 | none | open: the objects options still need pictures for the owner |
| V5 | spec at 390 DPR 3; `sheet-pc-p-turn.png` | built |
| V6 | bloom, close and scrub sheets above; two fixes | built; owner judges variants |
| V7 | glass sheets | built; default A, owner picks |
| V8 | name sheets | built; default Newsreader display 48/34, owner decides |
| V9 | this round | in work |
| V10 | `round4/coverage2.md` | built |
| T9 | rejected by the owner (J12) | superseded by V6 |
| T22, T25 | V1, V3 | closed |
| T24 | V2 | open, deferred |
| T26 | person area: every element answers with motion (lane inventory, frames) | open: Work, layer and bar not listed |
| T27 | `sheet-card-*`, lane `card-cd2-*` | built |
| T19, T21 | standing rows; this review | open |
| G2-G8, M1, M2, M5 | scroll sheets: continuous, no stepped jumps | open (real hardware unchecked) |
| P4, E1, R2 | no lane this round | open |

## 8. Still owed

- A real iPhone: the hold in Safari, four blur layers at DPR 3, the glass B fallback and contrast, T6, T15.
- Frame cost of the veil fade (93 ms desktop, 40 ms phone, software) on real hardware.
- The owner's picks: bloom variant, glass version, name face and size; whether `now` stays default (J22).
- P4 (postcard front frame), E1 (empty bands), the hard-coded "Close" label, V4 pictures, T26 outside the
  person area.
