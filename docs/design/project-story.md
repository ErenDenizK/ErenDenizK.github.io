# The project story (rows S29, S30)

**Status:** built on `/lab/one/` on 2026-10-17 (round 6). The shapes are built; the words wait for the
owner (S42). The study behind it (sections A to N, three variants per project, references) is the
round-6 project-story study; this file records what the build does.

## 1. Sections

Each section is optional in `content/projects/<slug>.md` and takes `{ placeholder: ... }` until the
owner writes it. An unwritten section is not rendered at all: no heading, no rail bead, no chapter
number. Draft material for the owner sits in an HTML comment in the project file's body, which the
build never renders.

| Field | Chapter word | Form | Shown when |
|---|---|---|---|
| `vision` | Vision | one large line in the name's display face, right after the hero | written |
| `problem` | Problem | two short paragraphs; in the lesson order a "before vs now" contrast block | text, or before and now |
| `audience` | For | two to four short cards, moments of use | two cards or more |
| tour (`what.text`, `reel`) | (none) | the outcome line and the scrubbed steps (unchanged) | either exists |
| `what.numbers` | (none) | the numbers band (unchanged) | exists |
| `why.quote` | (none) | the quote (unchanged) | exists |
| `how` | How it's made | the plate named by `how.form` (section 3) | items exist |
| `decisions` | Decisions | rows of chose / over (struck) / because | two rows or more |
| `refuses` | Refuses | a short "No" column | one item or more |
| `check` | Check it | one claim the reader can verify, with a link | written |
| `learned` | Learned | prose | written |
| `next` | Ahead | prose (the project's own next step; "Next" stays the next project) | written |
| (derived) | Record | the latest five real Record entries with the project's slug, on a dashed tape | one real entry (samples never count) |

The chapter index ("01 / Vision") is counted after hiding, over the sections that carry a heading,
and shows only when two or more of them are on the page. So a lone "How it's made" keeps its plain
label.

## 2. Orders

`story` names an order, never a product (ADR-0002):

- `default`: vision, tour, numbers, why, how, decisions, refuses, check, learned, ahead, record.
- `dia` (Recto): product first, then the story: vision, tour, audience, check, how, decisions,
  refuses, numbers, why, learned, ahead, record.
- `lesson` (English Prep): told as one of the product's own contrast lessons: vision, problem (before
  vs now), audience, tour, numbers, how, why, learned, ahead, record.
- `legend` (Eat Map): a short form: vision, audience, refuses, check, how, ahead. Its full form (the text
  as the new engraving's map key) waits for the new Eat Map engraving.

## 3. How it's made plates (`how.form`)

- `stack`: the isometric cutaway; the default for any project.
- `column` (Recto): one column of the temple in section. The layers become its parts, top down: capital,
  drums, base, stylobate (three steps: three test engines). The parts land from the stylobate up with no
  bounce; a sheet drops through the shaft into the base; the light pulses once under the column and
  settles.
- `loop` (English Prep): the study's clock as a dial. Stations are `how.process` steps when the owner
  confirms them, else the layers. The hand sweeps with the scroll; each station lights in the next
  aura pigment and presses (0.945, 1.035, 1).
- `legend` (Eat Map): a framed map key, the route tracing its symbols, one pop at the end. Hidden while
  `how` is unwritten.

All motion is a function of `--hp`, the section's view progress (`animation-timeline: view()`); without
it, under reduced motion and without JavaScript the plate stands finished. The plates are drawn at build
time with `src/one/work/engrave.ts`: tapered cuts and clipped hatching, never a uniform stroke.

## 4. What the owner writes (S42)

- Recto: vision, problem, audience lines, check line, learned; pick decisions from the ADRs and confirm
  refuses, next and `how.process` (material in the comment in `content/projects/recto.md`).
- English Prep: vision, before and now, learned; confirm the four review-loop stations as `how.process`.
- Eat Map: vision, one audience line, the how items, the privacy line from its world.json.
