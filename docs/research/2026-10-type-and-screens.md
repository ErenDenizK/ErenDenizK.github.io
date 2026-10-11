# Research: type, alignment and screens, measured (2026-10-11)

**Status:** current. Built into the site by [ADR-0015](../adr/0015-type-grid-screens.md); the "after"
column is the state that ADR leaves.

Brief (2026-10-11, night): "size the fonts and screenshots from the research already done (size, big
type), or from new research kept under control; nothing uncontrolled: design every detail, size,
alignment and interaction deliberately." This note measures what the site rendered before the change,
names the problems, and records the numbers the system was built from.

**Evidence grades** (as in `2026-10-readability.md`): **M** measured by us on the built site; **E** a
primary source opened earlier in this folder; **K** prior knowledge, not re-checked.

**Method (M).** A Playwright script (session scratchpad, `type/audit.mjs`, not kept) opened eight routes
(Home, Work, About, the Record, an essay, an entry, Recto's project page, the 404) with `?still`, scrolled
each through so lazy content rendered, and read from every visible element that holds text: computed
family, size, weight, line height, tracking, style and case; the x of its first line box (left edges);
every capture inside a frame (CSS size, share of the viewport, the device pixels it needs, the pixels of
the file the browser chose); and every link or button smaller than 44 px. Four sizes: 1440×900 at 1x,
1180×820 touch at 2x, 390×844 and 360×780 phones at 3x. Screens were shot at the top and at each
section, before and after, and compared side by side (`scratchpad/type/compare/`).

## 1. Type: what was rendered

| Window | Distinct text sizes across the site, before | After |
|---|---|---|
| 1440×900 | 27 | 15 |
| 1180×820 | 27 | 16 |
| 390×844 | 25 | 16 |
| 360×780 | 26 | 16 |

Before, at 1440 (M): 12, 13, 14, 15, 17, 19, 21, 22, 25, 26, 26.6, 27.4, 28, 30, 34, 36, 37.4, 40, 41.8,
48, 59.3, 72, 74.9, 112.3, 148.3, 158.4 px. The nine-step scale of the craft audit (§3.4) existed as
tokens, but most pages set their own sizes beside it:

1. **Neighbours that read as mistakes.** 25 / 26 / 26.6 / 27.4 / 28 px all played the same role (a
   display line under a heading: Home's vision and "meet" lines at 27.4, the pitch at 30, the clock at 28,
   facts and entry titles at 25, the Record's titles at 25, Home's record rows at 22). 33.5 / 34 / 36 /
   37.4 px likewise (the release name, the key line, the pull quote, Work's line-up names).
2. **Phone sizes written one by one.** 23 phone overrides (`font-size: 19px`, `20px`, `21px`, `26px` ...)
   instead of one rule, so a size changed on desktop did not follow on phones (the About quote: 37.4 on
   desktop, 26 on phones; the Record's release name 34 and 29).
3. **The reading size was right only in some places.** Newsreader 21 px at weight 430 (readability T1–T2)
   on About, the Record and entries; 21 px at weight 400 in a project's prose; 19 px at 400 in its
   decisions list; `.prose` itself still 19 px at 400 with a 35em (≈ 89 character) measure.
4. **Faux italic.** Only roman Newsreader is loaded (the subset has no italic file), yet About set the
   pull quote, the "what it teaches" lines and the next step of the year in `italic`: the browser slanted
   the roman (M: computed `italic`, no italic face in `@font-face`). The craft audit's rule was "no italic".
5. **Tracking by hand.** 14 letter-spacing values (−0.055 to +0.08em), several on the same role.
6. **14 px on Work's facts and captions, 13 px meta and 15 px UI beside it:** three adjacent sizes in one
   column.

## 2. Alignment: the edges

| Edge, x at 1440 | Before | After |
|---|---|---|
| Content edge E0 (Work, About, Record, entries) | 60 | 60 |
| Home's content edge | **56** | 60 |
| The bar's mark (letters) | 60 at 1440, **50** at 1180 (content at 46) | E0 at every width |
| The bar's last link (right edge) | 1384 (content 1380) | 1380 |
| About's reading column | 316 | 316 |
| The Record's rows | **160** | 316 |
| An entry's text (centred column) | **360**, back link at 124 | 316, back link at 60 |
| Phone bar's mark / content | **12** / 16 | 16 / 16 |

The 4 px on Home came from Home being full bleed (`--gut` padding) while every other page sat in the
centred 1320 px column; the bar used the gutter too and only lined up at 1440 because the mark's padding
happened to be 4 px. Three reading pages started their text at three different x values (160, 316, 360),
so moving from the Record to an entry to About shifted the column each time.

## 3. Screens: frames and pixels

Before (M; "file" is the width of the file the browser chose, "need" is CSS width × DPR):

| Where | Frame | CSS size | Share of window | Need → file |
|---|---|---|---|---|
| Home 1440 | browser | 340×212 | 24 % | 340 → 720 |
| Home 1440 | phone | 210×454 | 15 % | 210 → 390 |
| Work 1440 | browser | 801×501 | 56 % | 801 → 1080 |
| Work 1440 | phone beside browser | 206×446 | 14 % | 206 → 390 |
| Recto's page 1440 | capture (embassy) | 1008×630 | 70 % | 1008 → 1080 |
| Home 1180 | browser | 420×263 | 36 % of a 616 column | 840 → 1440 |
| Work 1180 | browser | 660×413 | 56 % | 1321 → 1440 |
| Home 390 | browser | 358×224 | 92 % | 1074 → 1080 |
| Work 390 | phone | 212×459 | 54 % | 636 → 780 |

Problems:

1. **Two frames for one thing.** Home drew its own browser frame (30 px bar, 7 px dots, the address
   without its pill, a shadow of its own) and phone frame (34 px outer corner, 29 px screen corner);
   Work drew 32 px, 9 px dots, the address in a pill, 30 / 25 px corners. The same product's screen
   looked different on two pages.
2. **Home's browser frame ignored its column.** At 1180 it stopped at 420 px in a 616 px column (68 %),
   so a 1440 px interface was shown at 29 % scale while 200 px of the column stayed empty.
3. **Sizes attributes did not match the boxes** (Home asked for 380 px where it drew 340; Work for 760
   where it drew 801; a phone beside a browser for 200 where alone it drew up to 300), so the browser
   sometimes chose one step too small (Work 1440 at 2x) or too large.
4. **No capture was drawn past its pixels** at any size (the layout sweep already guards this), and every
   master has room: a 1440×900@2x capture is 2880 px wide, enough for 1440 CSS px at 2x; a 390×844@2x
   phone capture is 780 px, enough for 390 CSS px at 2x or 260 at 3x (+15 % the sweep allows).
5. **Home at 1440 shows a 1440 px interface at 336 px wide (23 % scale): legible only as a picture.** The
   column beside the glass is that wide because the glass takes 585–705 px in the middle. This is a
   layout question for the owner (§6), not a size fix.

## 4. Targets and focus

Before, on touch (M): the tab pill's links were 40 px tall (38 on phones), the phone mark 42, the skip
link 35, the foot's links 16, a note's date link 18, project names in a row 30, the ID card's links 32,
an entry's back link 40 and its inline project and "How this is written" links 16. Focus styles were
consistent (one 2 px `--focus` outline, offset 3 px) with local offsets inside pills; they stay.

## 5. Sources for the numbers chosen

- **Reading size and measure:** 21 px Newsreader 430, 1.55, about 70 characters; 19 px on phones
  (`2026-10-readability.md` T1–T2, findings 8–11, E/P there). The scale is anchored on it.
- **Scale ratio:** 1.25 (major third) from a 17 px body gives 21.25 for the first step up, i.e. the
  reading size falls on the scale instead of beside it; on a 360 px phone the same steps compress to
  about 1.18 so the top of the scale fits the width (K: the usual fluid-scale practice, e.g. Utopia's
  min/max ratio pair; computed here, not copied).
- **Fixed pixels for reading, fluid for display:** small sizes rendered at fractional pixels shimmer
  between layouts and would break the brief's "21 px on desktop and tablet" (a fluid 19→21 is 20.5 at
  1180); display sizes look best when they scale with the window (K).
- **Tracking:** the craft audit's rule (§3.3): negative tracking grows with size and stops before
  counters close.
- **Targets:** 44 px on touch (Apple HIG, K; WCAG 2.5.5 AAA, K); WCAG 2.5.8 AA asks only 24 px, which the
  desktop pill already meets.

## 6. Open, for the owner (taste)

- Home's product screen at 1440 is 23 % of the interface's size (§3.5). Options: keep it as a picture
  beside the glass (now); let the frame bleed past the window's right edge so the screen is larger and
  cut; or show the phone screen where a product has one. A question, not a fix, because it changes the
  composition of direction A.
- The Record's rows now start on the shared reading edge, which leaves the dates alone in the index
  column with air before the spine. If the owner prefers the dates close to the spine, they can be set
  right-aligned in the same column without moving the edge.
