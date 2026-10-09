# Brief

The owner's intent, as stated in conversation on 2026-10-08. Every later decision cites a
section of this file. Change it only when the owner changes their mind, and date the change.

## 1. Who

Eren Deniz K. First-year Computer Engineering student at Yıldız Technical University,
Istanbul; passed the English prep year with AA (full marks). Learns the fundamentals on
their own (CS50 and similar courses, camps) and is drawn to the low level: processors,
embedded systems, the machine's own language. Ships products by directing AI agents, and
treats that as a second discipline worth getting good at. Aims to work abroad; a company
like Microsoft is the kind of target.

## 2. What the site is for

1. **Presentation first.** The page someone opens when Eren introduces themselves to an
   engineer they know, or applies somewhere. It has to make that first minute count.
2. **A public record, not a private archive.** An outside reader can see that a project
   started on a date, that it moved on months later, and that work is shared regularly.
   The record is evidence of steady, continuous work.
3. **A four-year project.** It will be used in earnest around the fifth year, grows level by
   level until then, and may be rebuilt once. It is never "finished"; the structure must make
   adding to it cheap.

## 3. Language and address

- English is the main language, including the log. Turkish may follow as a second locale.
- Address: `https://erendenizk.github.io/` on GitHub Pages. No custom domain for now.
  Hosting, private repositories and open-sourcing AI-built projects are separate research
  topics for later (see `docs/ROADMAP.md`).

## 4. Content

### 4.1 Projects

The three serious projects, all in active development and unfinished:

| Project | What it is | Repo |
|---|---|---|
| Recto | Browser-only PDF editor | `ErenDenizK/recto` (public) |
| English Prep | Study app for Turkish university English proficiency exams | `ErenDenizK/english-prep` (public) |
| Eat Map | iOS app built in Xcode; code not pushed yet | `ErenDenizK/eatmap` (private) |

Small school work (finals, assignments) may come later, in a separate group, labelled
honestly as AI-built or hand-written.

Each project has layered depth: a teaser ("here is a project, take a look"), then what it
is, then why it was made, how, and what was learned. The depth lives in the UI (expanding
panels, a pop-up, a focused view); a separate page is allowed but not required. Each project
may carry its own colour, such as Recto's lime aura opening Recto's preview.

### 4.2 About

A short introduction (YTU, Computer Engineering, year one, prep AA), personal photographs,
GitHub and LinkedIn. No CV yet.

### 4.3 Log

Regular entries (weekly or monthly, not daily posts) of varying length: what I did, why, what
I am building. Categories are open; the owner's first examples were personal, work and
school. The owner does not want to write Markdown: they dictate raw notes, and the agent
edits them into an entry and may add images or illustrations drawn in code. Length styles and
log design are to be explored.

## 5. Look and feel

- Not decided; to be explored with references and prototypes before anything is forced.
- Leanings: minimalism; transparent objects with light behind them; the colourful aura
  background shared by the owner's other apps. Glass is welcome, not mandatory.
- Ambition: "go all out", a masterpiece. The favoured idea is a world you can explore in
  3D with the mouse, divided into areas ("departments"), or a 2D imitation of one. Plain
  type can also be elegant; the aim is something unique.
- Low-level themes (processor, terminal, machine) are possible, not required. Judge them
  from prototypes.
- Desktop is the open-ended version with more control; the phone gets a lighter, more fixed
  version. Both matter, and the phone may well get more visits.

## 6. Way of working

- The agent leads: plans, research, agents, tooling and stack are its call. The owner gives
  direction, taste and final say, and answers questions.
- Step by step, no deadline. Build the foundation and the workflow first; a roadmap is
  valuable at every stage.
- The owner reviews on both phone and desktop.

## 7. Amendments

### 2026-10-08 (after the requirements research)

- **Character:** more social and brand-led than CV-like; the link that sits on a LinkedIn
  profile. Not a research site.
- **Look:** direction D (ADR-0003), but dark: a black ground, possibly aura, photographs or
  glass (none mandatory). More shaped, beautiful animation and effects than the D prototype.
- **Structure:** a few tabs instead of everything stacked down one page.
- **Projects:** each project gets a real view of its own (a pop-up or an in-page focused view),
  not a small accordion, so a visitor can actually get to know it.
- **Objects:** instead of the processor, high-quality, high-resolution 3D objects that are
  more fun and still professional. An idea to explore: objects that appear as you move through
  the site, mini-game style, each tied to what that part is about.
- **Two kinds of work:** the AI-directed products are big productions and get the full
  presentation. Hand-written work (CS50, open-source contributions) is smaller and gets its own,
  lighter format, not the same concept. None exists yet.
- **AI note:** framed as a two-track education. School and courses build the engineering
  fundamentals by hand; projects built by directing AI build project discipline and product
  skill. Both matter, and the owner does not stay away from AI.
- **First log entries:** why I built this site; the two-track education; my university; the
  projects I am working on.
- **Language:** English only for now.
- **Photos:** one or two casual but clean photographs, not a formal portrait.
- **No CV** and no work-authorisation line for now.
- **Name:** the owner leaves the choice to the research (full surname recommended for
  findability); spelling to confirm.
- **Address:** keep the repo name only if the root address works without renaming; otherwise
  rename. No hurry.

### 2026-10-09

- **Name:** Eren Deniz Kuyucaklıoğlu, in full. The mark is "edk" (no logo); a domain such as
  edk.dev may follow.
- **Links:** GitHub and LinkedIn only. No email.
- **Photos:** the owner supplied two (`content/photos/`, metadata stripped): a selfie at the
  YTÜ gate in the rain, and the university's inner courtyard seen through a tinted lens. Use as placeholder, background
  or About material.
- **Objects:** one object per tab that changes into the next (owner: "very good"); objects
  that react to what you read may be tried; the collectible idea needs a concrete proposal.
  Objects must look as good in the page as in the Blender render: lighting is the bar. Each
  object may have its own animation and interaction so every part feels original and
  surprising, without breaking the whole.

### 2026-10-09 (after prototype E)

- **Colours:** accepted. Recto lime, English Prep sakura, Eat Map rose `#eb4f6b` (from the
  app), edk cool white-blue, Log blue, About gold.
- **Type:** pairing 2 (a serif display face for the name and titles, a clean sans for the
  interface). Pairing 4 was liked too, but is not right for this site.
- **About:** the glasses object does not work. The courtyard photo should carry About instead.
- **3D:** real-time 3D feels heavy. The owner wants it faked with very high-resolution
  pre-rendered images and video: a still appears first and fast, the moving version loads
  behind it, then plays at full resolution and quality without costing performance.
- **Fixes:** page transitions and navigation are a little buggy; some icons render as emoji on
  phones and break the design.
- **Content:** descriptions and project texts will be discussed at length later; no rush.
  Improving the presentation inside the projects themselves is much later; the portfolio
  comes first.
- **Owner's notes on E (later the same day):** the top navigation is troublesome, especially
  clicking Home. On wide screens the pop-up project views were good and the live 3D was not.
  On phones the rendered objects looked good, but projects opening as a drawer did not.
- **2.5D photo:** not now; the owner will send more photos when one suits it. The photos sent
  are full resolution.
- **Icons:** build them to the same quality bar as the objects, with a system or tool if one
  helps.

### 2026-10-09 (planning answers)

- **Release:** an early v0 at prototype F's level; video and the rest follow. `main` merges stay
  the owner's call.
- **Repo name:** rename to `ErenDenizK.github.io` just before the first release.
- **Stack:** ADR-0001 accepted.
- **Home object:** "edk" is good. Something more personal may be tried at any time, but not a
  processor.
- **Link previews:** home card split (name left, edk right) everywhere; About card shows the
  gate selfie. Favicon "e" at 16/32 px, "edk" from 48 px; warm off-white on black.
- **Log:** the index is titled "The record"; notes show in full in the list; project threads
  sit beside the log and inside each project's view; figures are geometric with at most one
  hand-drawn mark.
- **v0 decisions:** the droplet tab change is shortened and overlapped with navigation;
  unwritten sections are hidden until written (no visible placeholders); LinkedIn:
  `https://www.linkedin.com/in/eren-d-kuyucakl%C4%B1o%C4%9Flu-7037b433a`.

### 2026-10-09 (after seeing v0 and the prototypes again)

- **Publishing:** the owner publishes from `dev` during the build-up (ADR-0004 amendment).
- **Desktop first:** the owner tests desktop until it is right, then phones.
- **Liveliness:** the owner misses prototype E's live, interactive animation on desktop; it gave
  character. The goal is liveliness and interactivity, not 3D for its own sake: the best method
  wins (live 3D, rendered animation that phones can also play, or a mix). Analyse constraints
  and methods over several rounds and report back before deciding.
- **E's details were better:** the colour-changing dot in "edk." and the lit, coloured,
  animated tabs felt alive (the light's position was not elegant, but having it is good).
- **Home vs Work:** no duplication. Home is a showcase; Work is the full catalog.
- **Page character:** light atmosphere per page, yes. "Separate worlds" per page only in a
  controlled way that keeps the whole; think it through, present findings, prototype only if
  the owner approves, and only for a big change.
- **About photo:** both a digital ID card (like event badges) on About and postcards (from E's
  framed photo; hover, flip) for photo entries later.
- **Scrollbar:** a custom thin rail, newly designed (not a copy of English Prep's, which did not
  turn out as the owner imagined). The focus view must not scroll sideways.
- **Record:** the nav says "Record", not "Log". The record page has too many controls, the thread
  toggles feel odd, and plain black-and-white reading is neither fun nor easy.
- **Readability:** research how to make text easier to read on screens today, given short
  attention: technique, style, engineering and writing craft.
- **Family vision:** the apps (Recto, English Prep, Eat Map), the portfolio and the objects feel
  mismatched. Write a design vision first: each keeps its own character (UI, motion, colour,
  structure) but all meet at a shared origin. Research how developers and companies do this.
  The owner worked hard on Recto's and English Prep's UIs; do not flatten them.
- **Record redesign (from the readability research):** a date spine with project-coloured marks
  and a year strip instead of thread toggles (per-project threads move into project views); a
  release look for entries with a version; a faint project-coloured light on reading pages;
  reading text at 21 px with lines of about 70 characters.
- **Page worlds:** "one house, four rooms" is approved for a prototype later, after a few more
  rounds. Embassies (project views enter each app's own world inside the portfolio's frame) go
  into the family vision.
- **Family vision:** no rush. Open question: per-product typefaces may add character or break the
  shared origin; keep researching.
- **Record object:** the microphone looks too simple; rethink it from every angle.
- **Showcase:** the lead project is chosen by hand (`featured`, Recto now) and sold by a
  separate Home-only pitch line the owner writes. The Work catalog table is disliked: Work should
  be a page that grows downward, each project starting within its own screen height, with large
  objects (small objects packed together looked bad).
- **Record object, round 2:** "detailed" meant looking better to the eye, not fine engineering
  detail. A (valve microphone) is too much and does not fit the others. C (card catalogue) looks
  very good. B (tape deck) makes sense but its design is a little empty; another round.
- **Liveliness:** go ahead with the frame engine behind `?live`; the object floats gently when
  untouched.
- **Home hierarchy:** the showcase project is larger than "edk", so at first glance it is unclear
  which is the owner and which is a project. Idea: set each product's name in its own display
  face (e.g. Recto in pairing 4's face) so projects read as products. Recto will later get a
  professional logo; the owner asks what tools could make 2D logo work strong.
- **Record object:** ship C2 (the simpler card file) to test; the owner leans to H2 (recorder
  with the voice-to-writing line) and may switch after seeing C2 live.
- **Home:** the product plate (variant A) and the wordmarks (Recto in Funnel Display, English
  Prep's own `english prep.`, Eat Map in Nunito) are accepted.
- **Recto logo:** a new search with Dengeli as one candidate, worked in Penpot together.
