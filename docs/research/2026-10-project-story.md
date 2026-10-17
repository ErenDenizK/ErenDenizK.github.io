# The project story: sections, variants and a How I made per project (rows S29, S30)

Status: research and proposal, read-only lane, 2026-10-17. Nothing here is built. Content is written
later on the owner's word (S42); this file decides the *shape* that content will fill, and how a
section that is not written yet stays hidden. Accepted ideas are refined, not replaced (S26): the open
animation, the hero, the facts row, the scrubbed stepper, the cutaway's engraved language, the next
print and the two capsules all stay.

Evidence labels: [M] measured or read in a file in this repo or the product repos; [V] verified on the
web in this lane; [R] recollection of well-known pages, not re-checked here.

Sources read: `docs/feedback/2026-10-16-lab-one-review.md` (all rows, Round 6 binding), the last
section of `docs/history/brief-log.md`, `src/one/work/` (Presentation, HowMade, Stepper, data.ts),
`content/projects/*.md` and `*/world.json`, `src/content.config.ts`, `docs/research/2026-10-reference-notes.md`
(§3.4-3.7, §8.5, §13.1-13.5), `docs/research/references/liked-sites.md`, `docs/research/2026-10-feature-parity.md`
(RN, AW rows), `docs/research/2026-10-requirements.md` §11-13, the reference figures
(`robin-case-study-sheet.webp`, `dia-dj04.webp`, `anime-dj10.webp`, `playdate-dj00.webp`), the round-6
engraving guide (`scratchpad/round6/engraving-guide.md`), and the product repos read-only
(`/home/user/recto/docs/VISION.md`, `ROADMAP.md`, `docs/adr/` (33 ADRs); `/home/user/english-prep/CHANGELOG.md`
(75 versions), `docs/adr/`, `docs/app1-final.md`).

---

## 1. Inventory: what the opened project shows today

### 1.1 Order of the layer (`Presentation.astro`) [M]

| # | Part | Data | Rail bead |
|---|---|---|---|
| 1 | Hero: front print, two side prints, the object; the signature clip after the open | `reel`, `captures`, `clip`, `object` | Overview |
| 2 | Head: meta line, wordmark title, promise (`summary`) | `status`, `version`, `started`, `summary` | (in Overview) |
| 3 | Facts: Role, Runs on, Stack | `role`, `runsOn`, `stack` | Facts |
| 4 | Outcome line | `what.text` | none |
| 5 | Steps (scrubbed stepper, one bead per step) | `reel[].caption` split at ":" | one per step |
| 6 | Numbers | `what.numbers` | Numbers |
| 7 | Why (one quote) | `why.quote` | Why |
| 8 | How it's made: the cutaway (isometric slabs from `how.layers`) | `how.items`, `how.layers` | How it's made |
| 9 | Next project print | the next model | Next |
| 10 | Capsules: close alone; live and code | `links`, `linksNote` | none |

The schema already has five story sections: `what`, `why`, `how`, `learned`, `next`; each takes
`text`, `items`, `quote` or `placeholder`. `learned` and `next` are in the schema but **the layer never
renders them**. A `placeholder` value is never printed (`shown()`, `tests/e2e/placeholders.spec.ts`).

### 1.2 What each project has [M]

| Field | Recto | English Prep | Eat Map |
|---|---|---|---|
| summary (promise) | yes | yes | yes ("An iOS app, built in Xcode." is a fact, not a promise) |
| facts | 3 | 3 | 3 |
| reel steps | 3 with captions | 3, no captions (phone frames) | none (no captures) |
| what.text | yes | yes | placeholder |
| numbers | none | 10 / 60 / 241 | none |
| why | placeholder | one quote | placeholder |
| how.items + layers | 6 items, 5 layers | 4 items, 4 layers | placeholder |
| learned, next | placeholder | placeholder | placeholder |
| world.json promise | "Nothing leaves this device." | "Ücretsiz. Hesapsız. İlerlemen kendi tarayıcında." | "Only the people here see your log ..." |
| Record entries with the slug | 4 (samples) | 2 (samples) | 1 (sample) |

### 1.3 What this means

1. The layer is a **product page**, not a **project story**: it says what the product is and how it
   is layered, never why it exists, what problem it beat, what was decided against, or what the
   maker learned. That is the gap the owner names in S30 ("vision, why it was made; what else?").
2. **The three cutaways are one design** (S29): the same isometric slab stack, only the slab count
   and labels change. On Recto (round-3 capture `how-recto-d-60.png`) it is a dark card with a
   construction drawing; it does not belong to the temple of pages behind it.
3. **Eat Map's layer is almost empty**: hero object, head, facts, next. With every other section
   hidden it is honest but thin; it needs a short form designed to be short, not a long form with
   holes (W7 said the same for Work).
4. The product repos already hold most of the raw material (Recto's VISION thesis, principles and
   non-goals, 33 ADRs, a dated roadmap M0-M11; English Prep's 75-version changelog, 13 ADRs, the
   "competence without the labels" reader, the blind-review pipeline). None of it is on the page.
   It is **material for the owner**, not copy: the owner writes the words (S42, CLAUDE.md log rules).

---

## 2. How the references explain a product

| Reference | How it explains | What we take | Evidence |
|---|---|---|---|
| Dia | Promise and real window; a numbered 01-03 stepper with one changing visual; six situation cards ("Built for how you actually work"); privacy; closing CTA. One idea per block, one visual per idea. | The stepper (have it). **Situation cards**: who it is for, told as moments of use. **A privacy block** as its own beat. | [M] §13.1, `dia-dj04.webp` |
| Notion Calendar | Two-word promise; four *themes*, each an outcome heading, then a full-width feature card and two half cards with real screen fragments. | **Outcome headings** over feature names ("market the user", §3.4). Two levels: theme, then features. | [M] §13.2 |
| Stripe | Outcome headline, product cards with live mock UI, a **stats band**, customer stories. | The **numbers band** as proof, set big and calm. | [M] liked-sites |
| Anime.js | One fixed stage (a ring) that changes per feature, with the code that draws it beside it. | **One fixed stage, varied** (have it in the stepper); and "show the code" as a How I made form. | [M] `anime-dj10.webp` |
| Playdate | One-word chapters (The System, The Design, The Crank, The Season); a hero object; very large body type. Panic also tells the making-of separately in a podcast (origin, partner, the crank's invention, the SDK). | **One-word chapter titles** for our sections. The **making-of as its own voice**, separate from the product claims. | [M] liked-sites; [V] podcast.play.date s01e01, s01e04 |
| Robin Noguier | Hero with the big name; "About the project" eyebrow, then one serif statement ("We take fun seriously"), then long alternating image and text. | **The statement after the hero**: one line of vision, set large, before any detail. | [M] `robin-case-study-sheet.webp`, RN9 |
| Antoine Wodniack | Work as a showcase wall; captions as mono index codes; proof built into the layout. | Index codes for sections ("01 / Vision"), proof in the layout. | [M] §13.5 |
| Shopify Editions | Chapters in three beats: painting and one word, a torn-paper cut to a cream page, real screens. Fixed I-XII index. | **The three-beat chapter** (engraving, word, real screen) for the long form; the index is the rail. | [M] §13.6 |
| Hiring practice (NN/g survey of 204 managers, relayed) | Problem, your role, constraints, process including rejected ideas, outcome, lessons; 3-5 deep studies; scannable. | **Decisions with the rejected alternative**; **an honest role line** (built with agents: what the human did, requirements §13). | [M] `references/sources.md`; [V] secondary summaries only, the NN/g article itself was not reached |
| Well-regarded making-of pages: Apple "designed by" films, Basecamp's Shape Up pitch (problem, appetite, solution, rabbit holes, no-gos), Linear's changelog, Things' "behind the design" posts | A making-of is a narrative of constraints and refusals; a changelog is proof of continuous work. | **"What it refuses"** (no-gos) as a section; **a changelog drawn from the Record**. | [R] |

Five lessons that hold across all of them:

1. **Statement first, detail after.** One line of vision right after the hero (Robin, Notion, Dia).
2. **One idea per block, one picture per idea**; the block's heading is an outcome, not a feature name.
3. **Show it working** before telling how it is built (Dia, Anime.js).
4. **Proof as its own band**: numbers, a privacy claim the reader can check, a changelog.
5. **The making-of is a different voice** from the product pitch (Playdate's podcast, Apple's films):
   it belongs to the maker, so on this site it is the owner's first person, and visually it is a
   change of world (the engraving takes over), not one more card.

The owner's own negatives apply (`reference-notes` §3.6): "tells everything but gives no reason to
read; too technical" (Maxime Heckel) and "shows beautifully but explains badly" (Eduard Bodak). So the
story must be short per section and carried by pictures, and depth is opt-in.

---

## 3. Candidate sections

Each section: its job, where its content comes from, who writes it, its form, and its hide rule.
"Owner" means the owner writes the words later (S42). "Derived" means the build computes it from data
that already exists; it is never typed. Chapter words follow Playdate's one-word model.

| # | Section (chapter word) | Job | Content source | Who writes | Form | Hidden when |
|---|---|---|---|---|---|---|
| A | **Vision** | The one large statement after the hero: what the world looks like with this product. | Owner; Recto's VISION "one sentence" and world.json `promise` are material | Owner | One line, display face (Newsreader display, S3), 34-48 px, centred, over a quiet engraving fragment. Robin's "We take fun seriously" beat. | `vision` missing or placeholder. Falls back to nothing (the promise in the head is already there). |
| B | **Problem** | What was wrong before; why the existing tools fail. | Recto VISION "the thesis" (SaaS uploads, toolkits of forty tools); English Prep's "the app was preparing for the wrong shape of exam" | Owner | Two short paragraphs, or a two-column "before / now" (EP's own contrast form). | missing |
| C | **For** (who it is for) | The reader of the product, told as moments of use (Dia's cards), and "market the user". | EP CLAUDE.md "competence without the labels"; Recto principle 3 | Owner | 2-4 situation cards, each a short line and a real screen crop (Notion card form). On phones a horizontal snap row. | fewer than 2 cards |
| D | **Why** (why I made it) | The personal reason. The maker's voice. | EP's quote exists | Owner | The existing quote block, kept; may grow to 2-3 sentences. | missing (as today) |
| E | **Tour** (what it does, step by step) | Show it working. | `reel` captions (exists) | Owner (captions) | The scrubbed stepper (exists, kept). | no reel |
| F | **Decisions** (and trade-offs) | 3-5 choices, each with the alternative rejected and the reason. The strongest hiring signal and the place where "built with agents" becomes credible (the human's judgment). | Recto ADRs (e.g. engine stack, virtual document model, no motion library, compact phone edition); EP ADRs and the blind-review rule | Owner picks; the agent may list candidates from the ADRs for the owner to choose | Rows of "chose X / over Y / because Z", each with a small engraved glyph; on wide windows Y is struck through by a drawn line as it scrolls in. Each row links its ADR when public. | fewer than 2 rows |
| G | **Refuses** (no-gos / limits) | What it will not do, and why. Honest status as engineering maturity (requirements §12). | Recto VISION non-goals, principle 6 ("no accounts, quotas, upsell"), ADR-0033 (phones read-only); EP "no accounts, no backend, no analytics" | Owner | A short list set as a struck "no" column, or merged into F as the last rows. | missing |
| H | **How I made** (the making-of, S29) | How the maker and the agents built it: the method, not only the stack. | `how.items`, `how.layers` (exist) + a new `how.form` and `how.process` | Owner (items); form chosen by the lead with the owner | A per-project plate (section 6). | no `how.items` |
| I | **Numbers** | Proof band. | `what.numbers` (exists); some numbers are derivable (versions shipped, ADR count, test engines) but only when the build reads them from a source, never typed | Owner, or derived | Stripe band: 2-4 figures, large numerals, count up on scroll (reversible). | no numbers |
| J | **Check it** (proof the reader can do) | A claim the visitor can verify: Recto's "Check it yourself" (network panel), EP's local storage. | world.json `promise.evidence` | Owner | One line and a small engraved instruction plate; a link to the product's own About section. | missing |
| K | **Learned** | Decision, hindsight, change (requirements §11 deep layer). | Schema has it | Owner | 2-3 short paragraphs or "I'd do differently" rows. | placeholder (today all three) |
| L | **Next** | What comes next, from the roadmap. | Recto ROADMAP M9-M11; EP app1-final | Owner confirms | One line plus up to three milestones on a short horizontal track (the tape, S5, as the timeline language). | placeholder (today all three) |
| M | **Record** (changelog) | Continuous work shown as proof: the project's Record entries and releases. | Derived: log entries with `projects: [slug]`; `version` entries take the release look | Nobody new: comes from the Record | A short tape strip (the Record's language, S5): the latest 3-5 entries, newest first, "All in the Record" link. | fewer than 1 non-sample entry (samples drop with `SAMPLES=0`) |
| N | **Role** | Who did what, honestly (built with agents). | `role` (exists in facts) | Owner may expand | Stays in Facts; optional one-sentence expansion in H. | (in facts) |

Sections rejected for now: testimonials (none exist; inventing is forbidden), FAQ (Notion has one,
too much for three projects), press (none), a separate "stack" list (the cutaway already carries it;
buzzword lists are a red flag, requirements §11).

---

## 4. Variant structures

Screens are estimated at 1440 x 900; phones run about 1.3x longer. Today's layer is about 7 screens
for Recto and English Prep, about 2 for Eat Map. The owner said grow the content "not just to grow
it"; every variant below stays under 12 screens, and each section is short.

### 4.1 Rich: Recto

| Variant | Order | Length | Character |
|---|---|---|---|
| **R-A Chapters** (Shopify three beats) | Hero, head, facts / **Vision** / **Problem** / **Tour** / **Decisions** + **Refuses** / **How I made** / **Check it** / **Numbers** / **Record** / **Next** / next project | ~11 screens | Each chapter opens with one word over an engraving beat, then a real screen. Most artistic, longest. Risk: "tiring" (§3.6). |
| **R-B Dia line** | Hero / **Vision** / **Tour** / **For** (cards) / **Check it** (privacy beat) / **How I made** / **Decisions** / **Next** + **Record** / next project | ~9 screens | Product first, story second. Closest to the loved Dia; the making-of comes after the reader has seen it working. |
| **R-C Essay** | Hero / **Vision** / **Problem** / **Why** / **Decisions** / **How I made** / **Learned** / Tour last | ~8 screens | A written case study. Strongest for hiring, weakest as presentation; the product appears late. |

**Recommendation: R-B**, with R-A's chapter words and one engraving beat at two places only (Vision
and How I made). Reason: the owner loves Dia's "step by step, never boring" and Robin's statement
beat; R-B shows the product before the story, keeps one idea per block, and puts Recto's strongest
claim (nothing leaves the device) where the reader can check it. Decisions follows How I made because
the decisions read as the reasons behind the layers just drawn.

### 4.2 Medium: English Prep

| Variant | Order | Length | Character |
|---|---|---|---|
| **E-A Lesson** (the product's own form) | Hero / **Vision** / **Problem vs Now** as an "X vs Y" contrast block / **For** / **Tour** / **Numbers** / **How I made** / **Why** / next | ~8 screens | The story is told in English Prep's own block vocabulary (contrast, pitfall, check). The page *is* a lesson about the product. |
| **E-B Compact Dia** | Hero / **Vision** / **Tour** / **Numbers** / **Why** / **How I made** / **Next** / next | ~6.5 screens | Today's layer plus Vision and Next. Least new work. |
| **E-C Maker's notebook** | Hero / **Why** first / **For** / **Tour** / **How I made** (the review loop) / **Decisions** / **Learned** / **Record** | ~8 screens | Personal: "I built it for myself and friends" leads. |

**Recommendation: E-A.** Reason: every structure should carry an idea (S40). English Prep teaches by
contrast ("Present Perfect vs Past Simple"); telling its own story as a contrast block ("Before: a
textbook that teaches what you already say / Now: the labels for what your ear already knows") is a
structure that *is* the product's idea. It also gives the medium project a distinct shape, so the three
layers do not read as one template. The archived state (V3) is shown honestly in the meta line and
in Next ("Archived; Session I complete" or what the owner says).

### 4.3 Short: Eat Map

| Variant | Order | Length | Character |
|---|---|---|---|
| **M-A Postcard** | Hero object / head / **Vision** as one line / **For** as a single sentence / **Refuses** ("Nothing is public") / capsules | ~2 screens | A short block designed short: one statement, one promise, one honest status. |
| **M-B Teaser** | Hero / head / facts / **Next** ("Code not public yet; coming ...") / next | ~1.5 screens | Today plus a Next line. |
| **M-C Map legend** | Hero / head / a single legend plate that holds Vision, For and the privacy promise as three map marks on the redrawn Eat Map engraving (S21) / next | ~2 screens | The text lives inside the drawing's legend; most artistic short form. |

**Recommendation: M-C once the new Eat Map engraving exists, M-A until then.** Reason: Eat Map has no
captures and no public code; its story must be short and must not leave a long empty scroll (W7).
The legend form makes the shortness a design choice: the map is the product's idea, the legend is the
map's own text block. The privacy line from world.json ("Only the people here see your log ...") is
the best single sentence the project has; the owner confirms it.

---

## 5. Hiding unwritten sections (ADR-0002, S42)

Rules, all already true for today's fields and extended to the new ones:

1. Every new field is optional in `content.config.ts` and accepts `{ placeholder: "..." }`. A
   placeholder is never printed; the section, its heading, its rail bead and its chapter word are all
   left out (`data.ts` sets the model field to undefined; the component renders nothing).
2. **Chapter numbers are computed after hiding**, so a hidden section never leaves "03" missing between
   "02" and "04". The rail beads are built from the rendered `[data-rail-sec]` only (already true).
3. A section with a minimum (cards: 2, decisions: 2, Record: 1 non-sample entry) is hidden below it,
   not shown half-full.
4. The engraving beat that opens a chapter belongs to the section and hides with it, so the layer never
   shows a drawing with no text after it.
5. `tests/e2e/placeholders.spec.ts` gains the new fields; the T23 repetition test runs over the new
   prose (no 5-word sentence repeated outside the brief).
6. The static twin (`/work/<slug>/`) uses the same rules; no JavaScript is needed to hide anything.

Proposed schema additions (for the builder, after the owner chooses a variant; no product name in code):

```yaml
vision:    text | placeholder
problem:   { text, before?, now? } | placeholder        # before/now drives E-A's contrast block
audience:  { cards: [{ line, capture? }] } | placeholder
decisions: [{ chose, over, because, adr? }] | placeholder
refuses:   { items: [...] } | placeholder
check:     { text, href? } | placeholder
how:       { items, layers, form: stack | column | loop | legend, process?: [{ step, by: me | agents | both }] }
story:     r-b | e-a | m-c | default                    # the order preset; content, not code
```

`story` names an order preset, so the code knows orders, not products. `how.form` names a plate form,
so the code knows forms, not products. Both keep ADR-0002: a new project picks a preset and a form in
its content file.

### 5.1 What the owner writes later (S42)

| Project | Owner writes | Owner confirms (material exists) |
|---|---|---|
| Recto | vision line; problem (2 short paragraphs); 2-4 "for" lines; why; learned; check-it line | decisions picked from the 33 ADRs; refuses from VISION non-goals; next from ROADMAP M9-M11; `how.process` |
| English Prep | vision line; before/now contrast; why (extend the quote, optional); learned | numbers (10/60/241, re-check); next / archived wording; the review loop's four stations |
| Eat Map | vision line; one "for" sentence; why; how items | the privacy promise from world.json; the "code not public yet" status |

The agent may prepare a short Turkish sheet for each project with the *material* (thesis, ADR titles,
roadmap lines) as bullet prompts, so the owner can dictate answers. The owner never reads the research.

---

## 6. How I made: one plate per project, born from its world (S29)

Shared ground (kept from the accepted cutaway): an engraved line plate, the list stays the accessible
content beside or under it, scrubbed by the section's progress (`--hp`, reversible), drawn and complete
at `--hp: 1` for reduced motion, no JavaScript, no scroll timelines. What changes: the *subject* of the
plate and its motion come from the product's world (`world.json` light behaviour, motion, signature,
and its engraving scene), and the plate leaves the dark card and stands on the project's engraved
ground, so it continues the scene behind it instead of sitting in a box.

Line craft follows the engraving guide §1.2-1.3: tapered contours, tone by hatching that follows form,
one focus with falloff. Each plate is a hand-drawn master per form with slots for the data (labels and
numbers placed by the build), not a free generator, because a generated isometric stack is exactly
the uniform CAD line the owner called cheap.

### 6.1 Recto: "The column, in section" (`how.form: column`)

- **Idea.** Recto's scene is a temple whose columns are stacks of paper. The How I made plate is one of
  those columns drawn as an architectural section (a cut through the drum stack), as in a treatise
  plate: each drum is a layer of the product. Capital: Browser tab (Vite, React 19, TypeScript). Shaft
  drums: Web Worker (PDFium in WebAssembly), Your files on the device (the CSP). Base: Export check
  (re-open and redaction re-read). Stylobate: Tests in three engines. Leaders run from each drum to its
  label in Recto's ink.
- **World.** Graphite ground, Recto's light behaviour is `event` (still at rest, it moves on arrival and
  success and settles within 5 s); signature: the one glass capsule that changes shape; motion: zero
  bounce for anything the user starts, smooth 530 ms, glide 680 ms.
- **Motion.** As the section scrolls in, the drums stack from the base up, each a sheet-thin slab that
  thickens into a drum (pages stacking), on Recto's smooth curve, zero bounce. The Export check drum
  shows a sheet that drops through the column and rises back ("re-opened before download"). When the
  capital lands, the lime light makes one event pulse under the column and settles (Recto's own light
  rule), the only colour in the plate. Reverse scroll unstacks.
- **Phone.** The column stands alone at the top, 280 px tall, numbered drums; the list follows, 1-5.
- **Process strip (optional, `how.process`).** Under the column, a thin frieze in the temple's
  entablature language: spec, agents build, I review, tests in three engines, ship; each metope marked
  "me", "agents" or "both". This is where "built with agents" becomes concrete.

### 6.2 English Prep: "The review loop on the desk" (`how.form: loop`)

- **Idea.** What is special about how English Prep was made is not its stack (four lines) but its
  content pipeline: lesson author, question author, a blind reviewer who never sees the key, and a
  person who solves each item cold (`npm run solve`). The plate draws this as the clock from its own
  study-window engraving, enlarged: four stations on the dial (Write, Blind review, Solve by hand,
  Ship), the hand sweeping with the scroll. At each station a small item card on the desk changes: the
  key visible, the key covered, a pencil mark "b?" (the solver's "another option is defensible"), the
  stamped version. The four static layers (static files, the page, browser storage, CI) sit as the
  four books under the tea glass, labelled with leaders.
- **World.** Sakura, iris and lagoon pigments that drift and cycle (13.5/15.75/18 s cycles); the press
  compresses to .945 in 120 ms and releases over 380 ms; editorial Inter; contrast as the teaching form.
- **Motion.** The hand's sweep is scrubbed. As it reaches each station, that station's numeral takes the
  next pigment of the aura cycle (cherry, iris, lagoon, cherry) and the item card does English Prep's own
  press-and-release (.945 to 1.035 to 1). The blind station's cover slides over the key like a page.
  Reverse scroll runs the hand back.
- **Phone.** The dial at 260 px, stations as numbered ticks; the four books become a short list below.
- **Why not the slab stack.** EP's four layers are thin as architecture; the review loop is the part a
  hiring reader cannot see anywhere else, and it is the real human work (requirements §13).

### 6.3 Eat Map: "The legend of the map" (`how.form: legend`)

- **Idea.** Eat Map turns places to eat into points on a map. Its plate is a cartographic legend in the
  manner of the Pervititch insurance plans of Istanbul that the new Eat Map engraving uses (guide §2.1):
  a small framed key with three hatched symbols, each a step of how it was made (for example spec,
  build in Xcode, try on device with the circle of friends), joined on a little plan by the route line
  the Work flight already animates.
- **World.** Wine ground, rose light, light behaviour `still`; iOS springs (settle 0.5 s no bounce, pop
  0.5 s bounce 0.3 for one small glyph); the privacy promise.
- **Motion.** The legend frame draws, then the route traces from symbol to symbol on the settle curve;
  when it reaches the last symbol a single rose point pops (the iOS pop, the only bounce, for one glyph).
  The light stays still, as the product's does.
- **Content.** All owner-written; today `how` is a placeholder, so the plate is hidden. Until it exists,
  the short form (M-A) carries the layer. A legend needs only three items, which fits a short project.
- **Phone.** The legend fills the width; the route runs down instead of across.

### 6.4 The default form for a new project

`how.form: stack` keeps today's isometric cutaway, redrawn in tapered line, as the fallback for any
project that has layers and no form of its own. So the accepted idea stays in the system, and each of
the three current projects gets its own plate.

### 6.5 Checks for the builder

Frame sequences at 50-100 ms, 1440 x 900 and 390 x 844 (DPR 3, touch), forward and backward through the
section; reduced motion shows the finished plate; the list is read in order by a screen reader; no
plate wider than the column on phones; the plate's ink and the event light pass `palette:gate`.

---

## 7. Questions for the owner (to ask in Turkish, each with a short brief and a picture)

1. **Order per project.** Recto: product first, then the story (R-B)? English Prep: told as one of its
   own "X vs Y" lessons (E-A)? Eat Map: a short block where the text is the map's legend (M-C)?
2. **How I made.** Recto as one paper column cut open; English Prep as the clock with the review loop;
   Eat Map as a map legend. Do these three subjects feel right?
3. **Decisions.** Should the page show "I chose X over Y because Z" rows (the strongest hiring signal),
   picked by the owner from the ADRs?
4. **"Built with agents".** Show a thin strip of who did each step (me / agents / both)?
5. **The Record on the project.** Show the latest Record entries for that project at the end of the
   layer (no new writing needed)?

## 8. Risks

- Length: the owner's earlier note says "derli toplu" (tidy). Every section is one idea and short; the
  rich variant stays under ~9 screens.
- Repetition: promise, vision and summary can say the same thing; the T23 test and a rule "vision says
  the future, the promise says the guarantee, the summary says what it is".
- Invented facts: forbidden. Agents may only list material from the repos; the owner writes.
- AI tells (requirements §18) in any draft the owner dictates: the log-entry rules apply to this prose.
- Optimisation and refactoring are not in scope (S12); the new forms are built as new parts, not as a
  rewrite of `Presentation.astro`.

Sources (web, this lane): [podcast.play.date s01e01](https://podcast.play.date/episodes/s01e01/transcript/),
[s01e04](https://podcast.play.date/episodes/s01e04/transcript/),
[Ulster IXD301 summary of NN/g portfolio advice](https://blogs.ulster.ac.uk/bethbuchanan/2021/10/04/ixd301-week-2-the-neilson-norman-groups-portfolio-advice),
[Lyssna, UX portfolio](https://www.lyssna.com/blog/ux-designer-portfolio/).
