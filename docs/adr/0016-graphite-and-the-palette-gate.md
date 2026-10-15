# ADR-0016: Graphite theme and the palette gate

**Status:** accepted 2026-10-15 for the theme (owner, round 2: "Theme A, Graphite"); technique decided
by the lead (CLAUDE.md: "decide technique yourself and record it") · **Rests on:** brief, "Current
intent" (2026-10-15, night: Graphite; no white pages; aura, grain and noise are the concept; a real
italic), `docs/design/charter.md` §3.2, §4, §8, the Phase 1 reports of 2026-10-15 (theme lab,
inventory, objects on light, palette check), ADR-0006 (objects are drawn additively)

## Context

The live theme was a near-black ground (#0a0a0b) with an ink ladder that nobody had measured. The
palette check of 2026-10-15 measured it: 26 of 101 pairings missed their floor. The misses were APCA
misses: `--ink-3` labels at Lc 38, `--ink-2` sentences at Lc 60, `--ink-4` as text at 2.93:1, Record
links at Lc 63, Eat Map's rose as text at Lc 39. The ground was also repeated as a literal in nine
places (bars, sheet bar, frames, rail, theme-color meta, web manifest), so a theme could not move by
one token.

The theme lab (`/lab/themes/`) showed four candidates on the real pages. The owner chose A, Graphite:
one dark theme, softened. White tires the eyes and does not carry the aura.

## Decision

1. **Graphite is the live theme.** Tokens in `src/styles/global.css` `:root`:

   | Token | Value | Role, floor | Measured on #121214 |
   |---|---|---|---|
   | `--ground` | #121214 | every page | |
   | `--ground-deep` / `--raised` / `--raised-2` | #0d0d0f / #1a1a1d / #232327 | plates; frames and glass | |
   | `--ink` | #e8e3dd | titles, interface | 14.7:1, Lc 90 |
   | `--read` | #dedad2 | reading prose, body Lc 75 | 13.4:1, Lc 84 |
   | `--ink-2` | #d3cfc7 | decks, ledes, summaries, body Lc 75 | 12.1:1, Lc 77 |
   | `--ink-3` | #a19d96 | labels, label Lc 45 | 6.9:1, Lc 49 |
   | `--ink-4` | #827e78 | non-text only, Lc 30 and 3:1 | 4.6:1, Lc 33 |
   | `--log-ink` | #a8d3ff | links in the Record | 12.0:1, Lc 77 |

   The near-black and near-white literals become tokens: the bar bands and the sheet bar mix
   `--ground`; the pill, frames, rail panel, dims, hover ink (`--ink-hi`), selection (`--sel`) and the
   button label have their own tokens. The rail reads the ground from the stylesheet. The theme-color
   meta and the web manifest cannot read CSS, so they read `GROUND` in `src/lib/theme.ts`;
   `tests/e2e/lab-themes.spec.ts` fails when the two disagree.
2. **`--ink-2` is #d3cfc7, not the charter's first #c4bfb6.** Its sentences are 15-21 px and are measured
   at the body floor (Lc 75). #c4bfb6 is Lc 68 there and fails; #d3cfc7 is Lc 77 and passes. The charter
   now says the same. The cost: the step between `--ink`, `--read` and `--ink-2` is small (OKLCH L 0.92,
   0.89, 0.85), so secondary text separates by size and face as much as by colour.
3. **A product's colour as text has its own ink.** Content gains `accent.ink` and `accent.fill`. Eat Map
   sets #ff94a9 for text (Lc 61 as a 34 px release name) and #f2627b as its button fill under the dark
   label. Its glow, beads and wordmark keep #eb4f6b. Recto and English Prep need none.
4. **Light on every page.** `--glow-base` (11 %) is the base pool. About's gold pool rises from 10 % to it,
   hue unchanged (owner, 2026-10-15: About "too black, soulless"). Every aura and the grain stay.
5. **Objects keep their media.** The renders subtract #0a0a0b and the stage adds them with `plus-lighter`
   (ADR-0006). A subtracted ground is zero, so it adds nothing to any ground: on #121214 the object sits
   8 levels lighter in its darkest pixels and no box appears. No media is re-encoded.
6. **The palette gate.** `npm run palette:gate` runs in `npm run verify` and in CI after the worlds step.
   It fails on any pairing of the house theme below its floor (WCAG 2 and APCA). A miss inside a
   product's world is printed but does not fail: those colours come from the product's `world.json`,
   which belongs to the product and the Family chat. `npm run palette` without the flag still fails on
   them, so the report stays honest.
7. **A real italic.** `tools/fonts/subset.py` cuts Newsreader's italic from the same Fontsource package
   (OFL-1.1) to the roman's axes (wght 400-500, opsz 16-72) and ranges. It is not preloaded.

## Measurements (2026-10-15, Chromium, the built site)

- Palette: before, 26 of 101 pairings failed (23 house, 3 world). After, the house theme passes every
  floor: 101 of 104 pairings pass, and the 3 misses are inside worlds (Recto's and English Prep's
  `ink.secondary` at Lc 53 and 74.9 for 15 px summaries; Eat Map's button label at Lc 41 on #eb4f6b).
- Object edges (grain hidden, mean of a 4 px strip outside minus inside the media box, Home hero, Home
  plate, Work, Record, About; 1440 and 390 px): every step is within 1.1 levels of 255, the same as on
  #0a0a0b before. No seam.
- Italic: latin 85.5 KB, tr 5.5 KB. Only About downloads it today. First paint is unchanged except for
  the CSS: About 193.2 to 193.6 KB, Home 181.0 to 181.5 KB (limit 200 KB).
- Tests: the e2e specs for layout, stage, about, idcard, work, embassy, reading, lab-themes, nav,
  fixtures and rail pass (144 of 144); a11y and overflow pass (18 of 18).

## Consequences

- One theme, no switch: no `html[data-theme]` block and no head script. The lab page stays as the
  record of the four candidates.
- The three world misses wait for the Family chat and the products.
- The pre-rendered link-preview cards and icons (`tools/og/`) still show #0a0a0b; they change when
  they are rendered again.
- The 404 page has no light pool yet; the charter asks for one.
