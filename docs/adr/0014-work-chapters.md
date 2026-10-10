# ADR-0014: Work shows each product's real screens in a platform frame, stepped in a pinned chapter

**Status:** technique decided by the agent (CLAUDE.md: "decide technique yourself and record it"); the
look is proposed until the owner has seen it (direction A of `docs/research/2026-10-work-page.md`, with
B and C as mock screenshots beside it) · **Amends** ADR-0010 items 1 and 3 (a chapter may be taller than
one screen; the object is an emblem where real screens exist) · **Rests on:** brief, "Projects and Work"
(2026-10-10, evening: "Work feels empty: three objects do not show what each app is"; 2026-10-10: "objects
alone are not enough: app screenshots and the app logo must be shown"; 2026-10-09: "each project starting
within its own screen height, with large objects"; "Home is a showcase, Work the full catalogue"),
ADR-0002 (content is data), ADR-0006 (one video), ADR-0007 (the sheet), ADR-0012 (captures are content),
`docs/design/family.md` §3.2

## Decision

1. **An opening that lines the products up** (`.w-lineup` in `pages/work/index.astro`): under the title
   and dek, one column per directed product with its number, its wordmark, its summary and its status and
   platform, each a link to its chapter. Type only; Home's strip keeps the thumbnails.
2. **One chapter per product, each starting at a new screen** (`article.w-proj`). Its stage holds the text
   column (the object as the product's emblem, the index, the name in its wordmark sized to the column by
   its length, the summary, `what.text`, `what.numbers`, a ruled facts sheet: Status, Version, Since, Last
   entry, Runs on, Stack; "Take a look", the live link and Code) beside the picture column. Sides alternate.
3. **Real screens in a frame that names the platform** (`components/Reel.astro`). A wide capture sits in
   a browser frame whose quiet bar carries the product's real address (its live link without the scheme);
   a phone capture sits in a slim dark rim with the screen's own corner and no drawn hardware; a step may
   pair both (English Prep, phone first). Inside the embassy captures stay bare, as family.md §3.2 says:
   the frames are Work's alone, because only Work has to say "this is a web app" without words.
4. **The reel is data.** The project's `reel` field names two to four steps (`{ id, phone?, caption? }`,
   ids from `world.json`; a signature clip may be a step); left out, the first three wide captures are the
   reel; with no captures (Eat Map today) the object is the picture, large, and no screen is invented.
   A new capture, logo or project needs no code.
5. **The reel steps by the reading position, never by taking the scroll** (`scripts/reel.ts`). On windows
   at least 900 px wide and 640 px tall (`html.reel-on`, set by an inline script before the chapters paint
   so nothing reflows), a chapter is one stage tall plus 62 % of a window per extra step; its stage is
   sticky under the bar; the step shown is the one the scroll has reached, switching at half a step, with
   a 420 ms crossfade. Ticks under the frame are buttons that scroll the page to a step, so Back, keyboard
   paging and scroll restoration stay the browser's (ADR-0010 item 2).
6. **Isolation.** The stage is a stacking context (isolated, and sticky when pinned); the window-wide ground
   and the project's light are painted inside it at `z-index: -1`, so the blended object and its multiply
   shadow compose over the ground everywhere, including where the emblem reaches past the column and when
   grid order puts the picture first (both were found as bugs while building).
7. **Fit, or do not pin.** Short windows get a compact text column (from 860 px tall) and the emblem
   beside the name (from 760 px). If a chapter's text is still taller than its stage, the script marks it
   `no-pin`: its screens show as a list beside the text, which stays in view on its own (sticky). Measured:
   every chapter pins at 1440 × 900, 1440 × 790, 1280 × 720, 1180 × 820 and 1366 × 640; English Prep
   unpins at 1000 × 700.
8. **One video.** A clip step gets its sources only while it is the step shown, in view, with motion
   welcome and the tab visible; it plays once and rests on its poster, claiming the page's one video slot
   from the object stage (`media.ts claimVideo`). Leaving the step pauses it and gives the slot back.
9. **Still twins.** No JavaScript: every screen is a framed, captioned figure in a list and the text column
   is sticky beside it (the chapter is still at least a window tall). Reduced motion: the steps swap
   without a fade and clips keep their posters. Forced colours: no pinning. Phones (below 900 px): nothing
   pins; the emblem stands beside the name, then the summary, then the screens as a row that scrolls inside
   itself with snap points (phone screens only, for a phone-first product), then the facts and the way in.
10. **The sheet's porch is titled by the wordmark** (`components/ProjectCase.astro`), so the title that
    morphs from a chapter into the sheet keeps its face.

## Consequences

- At 1440 × 900 Work is about 5,400 px tall (it was about 3,000): Recto's and English Prep's chapters are
  about 2.2 windows each. Only the first screen counts toward the first-paint budget; captures are lazy.
- The objects remain the house's brand element (ADR-0006 unchanged); when a product hands over a real logo
  (`wordmark.image`) or a new object, the chapter takes it as data.
- The rail is unchanged: each chapter is one rung, as before.
- ADR-0010's "one screen-tall section" now reads "a chapter that starts at a new screen"; its media rules
  (one stage per chapter, only the one in view moves) stand.

## Tests

`tests/e2e/work.spec.ts`: the line-up (order, wordmarks, faces, in the first screen); each chapter's name,
wordmark, frames with the real address, captions and alt text, the emblem, facts and one way in; Eat Map
without screens; stepping, one frame at a time, the pinned stage, the ticks, chapters never overlapping;
the clip loading only on its step, one video, reduced motion without fades or video; no JavaScript; the
fit rule at four window sizes; the tablet; phones (no pinning, the inner row, phone frames, order). ADR-0010's
S16 (`nav.spec.ts`) still holds.
