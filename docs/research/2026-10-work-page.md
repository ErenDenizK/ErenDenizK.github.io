# Research: the Work page (2026-10-10)

**Status:** current. Direction A ("the stage") is built on `wip/work` and recorded in ADR-0014;
directions B and C exist only as static mock screenshots for the owner to compare. The look is
proposed until the owner has seen it.

**Why:** brief, "Projects and Work" (2026-10-10, evening): "My projects page is a bit empty. There
are only three 3D objects and they don't really show what each app is. Do a comprehensive study of
how this page could be perfect." Earlier lines that still hold: Home is the showcase and Work the
full catalogue, no duplication (2026-10-09); each project starts within its own screen height,
with large objects (2026-10-09); project views enter each app's world (embassies, 2026-10-09);
objects alone are not enough: screenshots and the app's logo must be shown (2026-10-10).

**Sources and method.** The current page was built from `dev` (967fd88) and screenshotted at
1440 × 900, 1180 × 820 (touch) and 390 × 844 (**M**, measured). The reference pages in §2 could not
be opened from this session (the fetch tool had no DNS for them), so their techniques are
**recollection (R)**, written from memory of the pages as they were in 2024–26, not re-checked.
They are cited for well-known, durable patterns only; open them before quoting a detail.

## 1. Diagnosis: why the page feels empty

1. **The only picture of each product is a symbol the product does not use (M).** A green
   document with a paper clip, a pink speech bubble with "Aa", a red map pin. These are category
   icons (family.md §3.3 already calls them "toy-like 3D emoji"); none of them is Recto's capsule,
   English Prep's lessons or Eat Map's map. A visitor learns "a document app, a chat app, a map app".
2. **The real products are one click away and invisible here.** Recto and English Prep have
   sharp, recent captures (`content/projects/*/captures`, 2026-10-09) and a signature clip each; the
   page shows none of them. The sheet does, but a reader who does not open it never sees an app.
3. **The names are in the house's serif, not the products' voices (M).** Home sets every product
   in its wordmark (accepted 2026-10-09); Work sets them in Newsreader at 80 px, so on Work the three
   products look like three chapters of one book rather than three products.
4. **The same card three times.** Each section is object + serif title + lede + grey facts +
   lime/pink/rose button. Alternating sides does not change the rhythm; by the third section there
   is nothing new to look at.
5. **Text is small and low-contrast against a large, mostly empty field (M).** At 1440 the object
   is 480 px and the text column 31 em of 15–17 px grey; about half of every screen is dark ground
   with a faint pool of light.
6. **No opening.** The intro says "Products I direct" and a dek, then Recto. Nothing frames the
   three as one maker's body of work: the reader cannot see at a glance that there are three, what
   they are or which is furthest along.

In two lines: the page shows generic symbols instead of the products, and repeats one quiet card
three times. It needs the apps themselves (real UI, real names), and a rhythm that rewards scrolling.

## 2. What the best product pages do (R)

| Technique | Where (R) | What it buys | Fit here |
|---|---|---|---|
| **Real UI, large, in a platform frame** | Linear, Raycast, Arc launch pages, Things: the app's own window, often with its window chrome, at 60–80 % of the viewport width, lit from behind | The reader sees the product in the first second; the chrome says "this is a Mac / web app" without a word | Yes. A thin browser frame for the web apps (the URL in it is the real address), a slim phone frame for phone views. Family.md §3.2's "no bezels" stays the rule inside the embassy |
| **Sticky media, changing captions** | Apple product pages, Stripe, Linear's feature sections: the picture stays while the text (or the picture) steps through 2–4 states as you scroll | One frame tells a short story without making the page long; scrolling stays native | Yes, as a capture reel: 2–3 captures crossfade on the scroll position, the caption under the frame says what each shows |
| **The product name as a logo, not a heading** | Every product page; Things, Raycast lead with the app icon + name | Products read as products, distinct from the author | Yes: the wordmarks already exist (Funnel Display, `english prep.`, Nunito) |
| **The app icon as the brand object** | Things, Raycast, App Store pages: a large, lit icon beside the name | A memorable mark next to the name | The glass objects take this role: an emblem beside the wordmark, not the whole picture. When a real logo or 3D logo arrives it replaces them through data |
| **Facts as a short, ruled spec line** | Teenage Engineering product pages, Apple "tech specs", Read.cv project rows | Credibility in a glance: status, platform, stack, since | Yes: Status, Runs on, Stack, Since, Version, in one ruled row |
| **Numbers as type** | Vercel, Linear ("x faster"), Apple | A product's scale in one look | Only real numbers (English Prep's 10 / 60 / 241). Never invent one |
| **Motion of the real UI** | Raycast, Arc: short loops of the app doing its one thing | Proof it works; life without decoration | Yes, a reel step can be the signature clip; plays once, rests on its poster |
| **A line-up opening** | Teenage Engineering's product index, Apple's "which is right for you" row | The whole family at once; the reader picks | Yes, as type: three wordmarks with one line each, linking down |
| **Restraint** | Rauno Freiberg, Paco Coursey: one idea per screen, generous space, small precise type | Calm, premium | The house language already is this; keep one accent per product with one job |
| **Explorable worlds** | Bruno Simon | Delight | No: heavy, and it hides the products behind a game |

Mapped to the site's rules: native scrolling only (no scroll-jacking, ADR-0010 item 2); every
effect has a still twin; content is data; unwritten text hidden; one video at a time (ADR-0006);
objects stay pre-rendered (ADR-0006) until the owner decides on real-time 3D.

## 3. Principles for Work

1. **Show the product, then name it, then prove it.** Real UI first in the eye's path, the wordmark
   beside it, the facts under it.
2. **The object is the emblem.** It stands beside the name as an app icon would, lit in the
   product's colour; it is the main picture only where no real screens exist yet (Eat Map).
3. **Frames say the platform.** Browser frame for a web app (with its real URL), phone frame for a
   phone view; a phone-first web app shows both.
4. **One frame, a short story.** Two or three captures in one frame, swapped by the reading
   position, each with a one-line caption. Scroll stays the browser's.
5. **Every product looks different on purpose.** Different frames, sides, numbers, colour; the
   wordmarks carry each product's own voice.
6. **Honest.** No fake screens (Eat Map shows its object, status and platform only); no placeholder
   text; every caption and fact is data from `content/`.
7. **Home is the showcase, Work the catalogue.** Home keeps its plate; Work adds what Home does not
   have: the real UI, the full facts, all three at full size.

## 4. Three directions

### A. The stage (recommended, built)

- **Opening.** Kicker, "Products I direct", the dek, then a **line-up**: three columns, each a
  wordmark at 34 px, its one line, its status and platform, a hairline in its colour on top; each
  links to its chapter. It is an index, typographic, with no objects (Home's strip uses thumbnails).
- **Chapters.** Each product is one chapter that starts at a new screen. On wide screens its
  content is a pinned stage one window tall: the text column (the object as emblem, the wordmark at
  up to 76 px, the one-liner, numbers if any, a ruled spec row, "Take a look", Open, Code) beside the
  media column (the frame). The chapter is taller than one window by about 70 % of a window per extra
  capture; scrolling through it steps the reel. Sides alternate.
- **The reel.** A browser frame with the real URL holds 2–3 captures and the signature clip; the
  caption row under it shows "01 / 03", the caption, and one tick per step (buttons that scroll to
  that step). A phone-first product (English Prep) adds a phone frame overlapping the browser
  frame's lower corner, stepping with it.
- **Eat Map.** No screens exist: the object is the picture, large, with its rose light; the text
  column has the wordmark, the one-liner, status and platform. No promises of screens.
- **Light.** The product's pool behind the frame, and the frame's own under-glow in its colour.
- **Phones.** Nothing pins. Emblem and wordmark on one row, the one-liner, the reel as a
  horizontal, snapping row of frames inside its own scroller (the page never scrolls sideways),
  phone captures in phone frames, then facts and the way in.
- **Still twin.** Without JavaScript the reel is a vertical list of frames with their captions;
  under reduced motion the steps swap without a fade and the clip shows its poster.
- **Why recommended:** it answers "what is each app" in one glance with the real UI, keeps the
  objects as the house's brand element, gives the page a rhythm (each chapter moves differently)
  without taking over scrolling, and grows by data alone: a new capture, logo or project needs no code.
- **Costs:** a chapter is about 2.4 windows tall at 1440 × 900 (one plus 70 % per extra step); the
  sticky stage needs a window at least 640 px tall, below which it falls back to the phone layout's
  stacked frames.

### B. The spread (alternative, mock only)

Each product is a full-bleed band in **its own world** (the embassy's ground and light pulled up to
Work): a giant wordmark top-left, the hero capture bare and huge, bleeding off the right edge, a
ruled spec row underneath, the object small beside the name. Static; the reel becomes a row of
three thumbnails. Strongest "each app is its own world" message, the most editorial. Costs: three
different grounds on one page break the house's unity (the owner shelved radical per-page systems,
2026-10-10); it duplicates the sheet's embassy, so opening a project feels like more of the same.

### C. The bench (alternative, mock only)

Each product is a bento grid: one large tile with the browser capture, a tall tile with the phone
captures, a tile with the object, a tile with the numbers, one with the promise line, one with the
facts. Everything at once, Apple-keynote style. Costs: dense and busy against "quiet, minimal";
tiles shrink the captures; the grid looks the same for every product, so the third repeats the
first; Eat Map's grid would be mostly empty.

## 5. What each project can show today

| | Recto | English Prep | Eat Map |
|---|---|---|---|
| Name | Funnel Display wordmark, lime | `english prep.` with the Sakura dot | Nunito wordmark, rose |
| Real UI | Library, Markup palette, light table (1440 × 900 and 1180 × 820 @2x); the capsule clip | Home, lesson, question, results, about (wide and phone @2x); the answer clip (wide and phone) | none |
| Frame | browser (`erendenizk.github.io/recto`) | browser + phone | none: the object |
| Numbers | none written | 10 topics, 60 lessons, 241 questions | none |
| Facts | Public beta, 1.0.0-beta, Sep 2026, browsers (phones read-only), Web · WebAssembly · PDFium | In development, 0.75, Sep 2026, the web (phone first), Web · No build step | In development (private), iOS, iOS · Xcode |

## 6. What waits on the apps

- **Logos.** Recto's professional logo (the Dengeli search) and any English Prep or Eat Map logo:
  they go in `src/assets/wordmarks/` and the project's `wordmark.image` (already supported), or as a
  new object render. Until then the glass objects are the emblems.
- **Eat Map's screens.** Simulator captures at 3× and its signature clip (presentation.md §3); once
  `world.json` lists them and the project's `reel` names them, the chapter becomes a phone-frame reel
  with no code change.
- **Recto's phone edition.** A 390 × 844 capture of the compact edition would let Recto show a phone
  frame too.
- **Fresh captures** after the apps' presentation refresh (their own chats): a re-shoot replaces the
  files; captions come from `world.json` or the project's `reel`.
- **Copy:** Eat Map's one-liner ("An iOS app, built in Xcode.") says almost nothing; the owner's
  real description would carry the chapter.

## 7. Questions for the owner

1. Browser and phone frames around the screenshots on Work (inside the project view they stay
   bare), or bare screenshots everywhere?
2. The emblem: keep the current glass objects beside the names until real logos exist, or hide
   them on Work once a real logo arrives?
3. Eat Map: show only the object and the facts until real screens exist (as built), or leave it
   off Work until then?
