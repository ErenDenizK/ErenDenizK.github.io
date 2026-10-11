# ADR-0015: One measured system for type, the grid, spacing and screens

**Status:** technique decided by the agent (CLAUDE.md: "decide technique yourself and record it"); the
sizes it changes are visible, so the look is proposed until the owner has seen the before/after shots ·
**Amends** the craft audit's scale (`docs/research/2026-10-craft-audit.md` §3.4) and ADR-0014 item 3
(Home's frames are Work's frames) · **Rests on:** brief, 2026-10-11 night ("size the fonts and
screenshots from the research ... nothing uncontrolled"); 2026-10-09 ("reading text at 21 px, lines of
about 70 characters"); `docs/research/2026-10-readability.md` T1–T6; `docs/research/2026-10-type-and-screens.md`
(the measured inventory this decision answers)

## Decision

1. **One modular scale, the only sizes the site sets** (`src/styles/global.css`, `:root`). Ratio 1.25 on
   wide windows from a 17 px body, so the reading size is the first step up; on phones the steps compress
   to about 1.18.

   | Token | Phone (360) | Wide (1440) | Leading | Tracking | Role |
   |---|---|---|---|---|---|
   | `--t-micro` | 11 | 12 | 1.2 | +0.01em | figure labels: months, a frame's address |
   | `--t-meta` | 13 | 13 | 1.35 | +0.005em | labels, dates, status |
   | `--t-ui` | 15 | 15 | 1.45 | 0 | controls, notes, captions (the interface half-step) |
   | `--t-tab` | 14 | 15 | 1 | 0 | the tab pill only, so four tabs fit at 320 px |
   | `--t-body` | 16 | 17 | 1.55 | 0 | interface paragraphs |
   | `--t-read` | 19 | 21 | 1.55 | 0 | reading prose, Newsreader 430, measure 28em |
   | `--t-2` | 22 | 26 | 1.22 (a lede 1.34) | −0.012em | sub-heads, entry titles, ledes, display lines |
   | `--t-3` | 26 | 33 | 1.16 | −0.015em | the pitch, the key line, a release name, line-up names |
   | `--t-4` | 30 | 42 | 1.06 | −0.02em | section heads, numbers, the pull quote |
   | `--t-5` | 34 | 52 | 1.04 | −0.02em | index titles (the Record, an entry), Home's doors |
   | `--t-6` | 40 | 65 | 1 | −0.02em | a wordmark in a short window |
   | `--t-7` | 44 | 80 | 0.96 | −0.02em | page titles, project wordmarks |
   | `--t-9` | 56 | 127 | 0.92 | −0.03em | About's greeting |
   | `--t-10` | 58 | 158 | 0.86 | −0.035em | Home's big words |

   Text you read (micro to read) is fixed pixels, one value below 900 px and one from 900 px: crisp, and
   21 px holds exactly on desktop and tablet. Display steps (2 and up) are fluid, linear from the phone
   value at 360 px to the wide value at 1440 px (`clamp()`). Role names (`--t-lede`, `--t-h3`, `--t-h2`,
   `--t-title`, `--t-name`) are aliases of steps.
2. **Exceptions, named.** Words fitted to their column take `min(fit, step)`: Home's name (10.3vw wide,
   9.6vw at 900–1239, 13.8vw on phones, never above `--t-10`) and a wordmark sized by its length (Work).
   A product's own face inside its embassy keeps its world.json size. Objects that scale with their own
   box (the ID card, postcards, the photo studies) use container units. No italic anywhere: only roman
   Newsreader is loaded and a synthesised slant is not the face.
3. **One grid, two edges.** E0, the content edge, is the gutter (`clamp(16px, 3.9vw, 56px)`) or the
   centred 1320 px column's edge on wider windows; the bar's mark and last link, Home and every other page
   line up on it (Home pads to `max(gutter, (100vw − 1320px) / 2)`). E1, the reading edge, is one index
   column (`--index: 200px`) and its gap (`--igap: 56px`) past E0: About's chapters, the Record's rows and
   an entry's text start there (316 px at 1440); chapter heads, dates and the contents list sit in the
   index column on E0. Below 1241 px the index folds away on About and entries; the Record keeps a 100 px
   date column.
4. **One spacing rhythm.** `--s-1` … `--s-10`: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Section and
   chapter spacing, headers and the foot take these steps.
5. **Screens.** One browser frame and one phone frame (`.fr-web`, `.fr-phone`, global.css) on Home and on
   Work: a 32 px bar (26 on phones) with the product's real address, 12 px window corner, a 30 px phone rim
   corner with a 5 px rim (screen corner 25 px), one frame shadow token and the project's light. A browser
   frame fills the column it stands in. A phone beside a browser is 27 % of its width, the real ratio of a
   390 px phone to a 1440 px window; a phone alone is `min(300px, 66 %)` of its column (on phones
   `min(62vw, 240px)`). Never drawn past the file's pixels at the device's ratio (the layout sweep allows
   15 %); every `sizes` attribute states the box actually drawn. Embassy captures stay bare (family.md
   §3.2) with the product's own corner.
6. **Targets and focus.** On touch every target is at least 44 px: the tab pill's links (the pill grows
   to 48 px), the mark, the skip link, the foot's links, the back link; where growing the box would move
   the layout (a note's date, a project name in a row or a meta line, the ID card's links) padding or a
   pseudo-element grows the target and the line stays. Focus stays one 2 px `--focus` outline.
7. **Guarded by tests.** `tests/e2e/type.spec.ts` fails when a stylesheet sets a pixel font size outside
   the token block, when a rendered size on any route is not a token as resolved at that window (1440 and
   390), or when the site uses more than 14 sizes at one window. The layout sweep keeps the squeeze,
   overlap and pixel checks.

## Consequences

- Distinct text sizes at one window size fell from 25–27 to 15–16 (research §1); every page's left edges
  are E0 and E1.
- Adding a page or a section means choosing steps, not sizes; a new size is an amendment here.
- Home's product screen at 1440 stays small (23 % of the interface's size) until the owner decides how
  direction A should give it room (research §6).
