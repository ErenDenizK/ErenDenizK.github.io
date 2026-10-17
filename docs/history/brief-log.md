# Brief: decision log

Status: history. This is the original brief of 2026-10-08 and every dated amendment, verbatim
(only this header is new, and the newest amendment is appended at the end). What holds now is
consolidated, line by line and dated, in [`docs/brief.md`](../brief.md) under "Current intent";
where the two differ, `brief.md` wins. Citations elsewhere of the form "brief §N" refer to the
sections below. Add new amendments at the end, then update `brief.md`.

---

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
  topics for later (see `docs/ROADMAP.md`, now `docs/PLAN.md`).

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

### 2026-10-09 (late: boost and the family kit)

- **Boost:** unlimited use until 05:00 Istanbul on 10 October; after that, a safe, minimal mode
  until the owner widens it again.
- **Fonts:** each app keeps its own faces (family vision §2.5).
- **Family kit first:** prepare the shared design files and a ready prompt per app, so the owner
  can run each app's work in its own session.
- **Shared origin:** light, certainly; the dot maybe. `edk.` appears in apps only at exits.
- **Grain stays** in the portfolio. Recto's "grain ban" is a misrecording: the owner had asked to
  fix the glass object's wrong render and its banding, not to ban grain.
- **Scroll rail:** concept B, the contents ladder.

### 2026-10-10 (phone check)

- **Pace:** normal usage now; start low (a few agents at once), protect the weekly limit; the owner
  raises it when needed. When portfolio work waits on the owner, research for English Prep and
  Recto may move ahead (no code changes there).
- **Phone verdict:** everything looks good. Bugs: while scrolling, objects flash a white light
  (the still-to-video switch); phone objects are not lively enough; the owner wants turning,
  moving pre-rendered objects like prototype A's spinning letters.
- **ID card:** very good. On desktop it should be more interactive: pull it by its lanyard, swing
  and spin it (like GitHub's event badges). The phone's simple flip is fine.
- **Scroll rail:** bring the ladder to phones too.
- **Home:** has nothing visual of the owner, only "edk"; how to add identity is open (with the
  four-rooms findings).
- **Record:** the object looks too small.
- **Photos:** five more (metro platform, metro mirror selfie, Bostancı in rain, two kitten sunsets)
  in `content/photos/`, to use where they fit.
- **How to ask (2026-10-10):** the owner cannot read the research files closely; every question
  comes with a short plain brief of the situation first.
- **English Prep handover is weaker than Recto's:** sessions there hallucinate more; be careful;
  Recto's documentation is the model.
- **iPhone:** the phone ladder and Safari's own scroll indicator overlap; only the custom ladder
  should remain.
- **Home vs About:** About introduces the owner better than Home and feels like the real front
  page; re-evaluate the two as a flow, or make Home far more striking.
- **Page worlds, more radical:** each page should feel different in system and setup, not only
  light or sliding text (examples given only to illustrate: a workbench, a photo album), while the
  site stays one whole.
- **Owner on English Prep's docs (2026-10-10):** "terrible": most rules were added to fix one
  broken version; English Prep is not against glass or grain. It needs a thorough rework, more
  than Recto. Both apps' About pages may change: Recto mostly needs a presentation refresh,
  English Prep probably needs larger app-level improvements.
- **Family frame accepted** (six shared things; fonts, glass, structure and signature
  interactions stay each app's own). **Credits line:** "Made by edk." / "Yapan: edk.".
- **Home/About round 1 rejected (2026-10-10):** F1's Home is good but its About is bad; F3 is
  not bad. Needs much better design work: a comprehensive study of the portfolio's whole flow,
  presentation, story and design, thought through in detail.
- **Radical per-page systems:** all three proposals were ugly and broke the site's unity. Shelved
  for now.
- **English Prep decisions (2026-10-10):** the glass ban is lifted (measure readability, never
  harm the UI, experiment in a separate setup first); no grain; `app1-final.md` is history and a
  new roadmap follows; adopt the handover drafts all at once; About may be redesigned from
  scratch when English Prep is reworked.

### 2026-10-10 (clean restart)

The owner's words, translated from Turkish.

- **Sessions:** work is split into separate chats; this chat focuses only on the portfolio.
- **Home and About:** none of the recent Home/About designs were liked. Home's layout is good
  because it is as simple as possible, just not flashy enough; About draws too much attention.
  The owner likes About's system: the ID card plus written descriptions under it.
- **Home** should be a better introduction: it presents a product, an identity, a brand, and
  conveys the vision. **About** introduces the owner directly: detailed information in a mini-CV
  style. (Whether "mini CV" also means a downloadable document is open; ask.)
- **Objects:** the pre-rendered 3D objects do not look good: they stutter in tiny movements.
  Desktop may return to real-time 3D once the performance difference is reported to the owner,
  who will plan from it.
- **Beyond objects:** 3D objects alone are not enough: app screenshots and the app logo (or a 3D
  app logo designed for it) must be shown; the apps first need to become more presentable (their
  own chats).
- **Scrollbar:** one consistent custom scrollbar on every page and in the project sheet (the
  second window); some pages still show the native bar.
- **Sample Record entries** (note, entry, release, essay) for testing (done 2026-10-10, tagged
  `sample`, dropped with `SAMPLES=0`).
- **Record object:** the design is disliked; try H2 again or a tape/cassette player.
- **Discipline:** review everything with its purpose, its reason and a designer's discipline.
- **edk object:** buggy at times and not clean.
- **ID card:** the desktop card is playable and good but goes wild; it should be calmer; extreme
  input gets extreme reactions.
- **Istanbul + clock:** the detail should come back; the owner liked it.
- **Copy and slogans** can improve, as the last step.
- **Photos** are high resolution: never stretch a low-resolution derivative across a large area.
  More photos will come. Of the two cat photos use one, never both. Photos may be placed in
  different spots (a photo card, the ID card, ...); About fits best, Home is possible.
- **Clean head:** start fresh: discard earlier rounds, a fresh situation analysis, fix wrong
  CLAUDE.md, ADRs and docs; an evaluation board; regular reports.

### 2026-10-10 (answers after the board, evening)

- **Objects look blurry**, "like 2.5D", as if bugged, probably from frame handling or pointer
  tracking. Measure it if possible.
- **"Mini CV"** means an "about me" article: who I am, I study here, how I work, what I do at
  school, my software side. **Home stays as it is for now.**
- **About** may have more photos, in the postcard style ("that looks nice").
- **ID card photo:** keep the current one; a better one (from LinkedIn) may replace it later.
- **Strangers in the metro photos:** hardly visible anyway. Test a second method: a stylised
  censor, e.g. white-pen blocks over faces (an example, not an instruction), never plain black;
  make the censor itself eye-catching, and edit me a little (brighter) so I stand out; a
  hacker-like or "criminal" aesthetic.
- **Istanbul clock:** fine where it is.
- **Record object:** a tape / voice recorder, but different from the earlier ones; or try the
  earlier alternative.
- **Copy:** the owner does not want to answer the vision/why-YTU questions. Vision is along the
  lines of "I direct and optimise multiple agents"; the lead may draft it from what the owner has
  said before. Nothing much learned by hand yet besides school and CS50 projects. Next: keep
  studying, grow through CS50 and similar courses, and build projects at the same time.
- **Scrollbar on the phone:** does each page have a different bar (a line on one, a ladder on
  another)? Unclear to the owner.
- **Work** (the projects page) feels empty: just three 3D objects that do not show what each app
  is. Do a comprehensive study of how this page could be perfect, as a design expert whose most
  important showcase this is; push it from every angle; ask anything needed.
- Everything else was tested and is fine.

### 2026-10-11 (board round 2 and a phone check)

- **3D:** stay pre-rendered and fix it (option a). The sharpness fix is OK; the cassette recorder is OK.
- **Work:** direction A, the stage. Frames: keep (Work framed, inside the project view bare); the
  owner asked for a clearer explanation. "Side by side, really?" (they look on a phone, where the
  line-up stacks).
- **Metro photos:** do not use them. The censor concepts did not convince; the scribble overpowered the
  owner. The owner asks whether not using them at all is right, ethically.
- **About:** "soulless: plain text and three photos." Make a lively, uplifting about-me, a design
  masterpiece. Copy: do not quote the owner directly ("I said it casually"); write a fitting line in
  the lead's own words for now.
- **Postcards:** more interactive; research what makes a photo frame richer and more fun; study how
  photos are presented digitally and improve.
- **Scrollbar:** never a native bar anywhere; custom everywhere. The new bar is not minimal enough:
  design a simpler, aesthetic one, very professionally; an important element, one of the best things
  the lead designs. (The owner sent a sketch: dots and short dashes beside a thumb line, and a
  ladder of ticks of varying length.)
- **Home:** visual improvement should still happen; wait a little longer.
- **Bugs on the phone:** reading vertically, a page breaks (a release entry opened over Home wrapped one
  word per line, with a line through the text; a "Live frames: starting / Turn off" toast showed).
- **About's card shows its back on first open** (an animation or render bug). Inspiration: let the card
  move naturally as the page opens, a small swing or turn, so the visitor notices it moves.
- **Way of working:** "Read the tasks and answers fully, assign agents across branches, set up the
  system: you are the boss of this work."

### 2026-10-11, afternoon (board round 3)

- **Rail:** look A, the beads (the owner's sketch).
- **Copy:** neither "work abroad" nor "a company like Microsoft" on the page.
- **Correction of a fact:** the owner did **not** do the English prep year: they skipped YTÜ's prep by
  passing its exam with full marks. Order: English Prep (the app) first, then Recto.
- **About** is good. Postcards: not gathered in one place but spread through the page; a more
  elegant back; switching and turning by buttons is bad: more interactivity by tapping and clicking.
- **Bugs:** the Record fix worked, but About has the same problem (text squeezed into a narrow
  column on the phone). The owner asks what causes it.
- **Objects:** edk looks great on the phone; give the other objects the same kind of interaction.
- **Record samples** are good. Home: improvement later. Tested on the phone only.

### 2026-10-11, evening

- **Postcards:** try other designs beyond the postcard; it looks a little simple and cheap. "I want a
  design that would win a design award."
- **All other pages are good;** every improvement is great. Content work starts soon.
- **Home feels very empty.** It must be a stunning opening page with a "woaaww" effect, a design
  marvel. Run several strong agents: analyse award-winning pages, research similar examples, measure
  the page, try everything possible. It is the first page, so the most important one.
- **Branches in every project:** two branches, `main` and a development branch (dev/develop/test).
  All development happens on the development branch; the owner merges into `main` by hand; publishing
  from the development branch is fine. Docs that said otherwise were wrong (fixed in
  `docs/family-kit/SESSIONS.md` and the app session prompts).
- **Other projects:** brief what has been done so far and what is wanted in this project and the
  others; ask every question, assume nothing. "A design-award feel on every page: go all out."

### 2026-10-11, night (Home A seen)

- **Hero object:** just "edk" beside the name on Home is too simple a move for a flashier, cooler
  site. What better 3D object could stand there? Think more innovatively; something mascot-like could
  make a lot of sense, but evaluate it. A photo of the owner is available later if wanted.
- **Measured type and screens:** size the fonts and screenshots from the research already done (size,
  big type), or from new research kept under control; nothing uncontrolled: design every detail,
  size, alignment and interaction deliberately. Fold this into the current work.

### 2026-10-11, late (rejection of the home round)

- **Home B preferred to A** for its structure: more compact, more focused. But as design both are
  very bad: everything too big, not professional, contrived; technically problematic, many bugs on the
  phone; not elegant, quite ugly. "A major error." Revert Home to the previous version.
- **Before any new task:** a detailed analysis of why the output was this bad (the owner's prompts?
  insufficient research? the lead's reviews and reading? the documentation?).
- **Photos:** the postcard concept is not required. Wanted: a modern, innovative, elegant,
  professional way to present the photos, beautiful in every respect; not a simple gimmick.
- **Session:** the owner wants to compact and start clean, and asks whether answers would be lost.

### 2026-10-15 (after reading the reference-study summary; dictated, in Turkish)

- **Branches:** only `main` and `dev` exist. `dev` is where all development happens; `main` is the
  owner's own manual pull from `dev`, rarely touched. Treat the repo as `dev` only; no other remote
  branches.
- **Commit authorship:** every commit, past and future, carries the owner's name. Nothing is hidden:
  a commit can show Claude as co-author or say in its message that Claude made it. The point is not to
  deceive; the owner does not write the code, but directs the agents, assigns the work and works on
  all of it, and wants that activity visible on GitHub for hiring and their name on the project.
- **Home:** simpler and CV-like, as in the simple examples studied; still a showcase in the sense that
  it points to the projects, Work and the other pages. Home is clear and plain for the first look (a
  friend or an employer gets a clear brief); once that first test is passed, the other pages can be
  fuller, denser, more professional and presentation-led, because they have other jobs. This does not
  break the design system: one design language, already settled, shaped for this; the pages stay
  visibly born from the same place, not independent pages. The lead decides how.
- **Home object:** still undecided. Decide while planning Home step by step, top to bottom (what it
  says, how it is shown): edk as a signature, a hero object, or none. Planning is the lead's job,
  using agents on the liked examples.
- **Themes:** if light reads more comfortably, consider it; or a theme button that cycles 3–5 colour
  themes (seen in another project); or a hybrid. Left to research and the lead's judgement, but the
  site must never look ugly, and the owner fears a light theme could make the colours, the 3D objects
  and the renders look ugly. Black need not be pure black, white need not be pure white. The whole
  palette, text included, is studied for every detail: measured, by the rules, colours that support
  each other with good contrast, never guessed.
- **Motion:** the Work transition can try the long version; Work is the presentation part. The owner
  is for animation in every respect: elements that appear in sequence are easier to read than a page
  that lands all at once. Against loading screens, and against the visitor getting lost (waiting, or
  five buttons at once before you know what the site is), above all on Home's first open.
- **Now:** a monthly "now" line is fine: the owner tells the lead, the lead updates it. The long story
  stays on About; About needs work in every respect.
- **Samples** stay until the owner says they are old.
- **Retired objects** (the old Record objects): never deleted outright; archive them, because they
  carry value: why they were liked or not.
- **Photo concepts** (tested 2026-10-15): the postcard (two-sided, flippable) is still the right
  concept; what failed is the graphic design of the back and perhaps the frame, which felt simple and
  cheap. New idea: click a photo, it grows to a large view (as in Proof), and there it can be flipped
  and swung interactively, even more freely. Darkroom: the burn-in opening is nice but far too slow,
  and the small coloured detail is liked; the caption that opens on click ("YTÜ … light … frame") looks
  very bad. Proof: nothing liked at all (the frame, the loupe). Depth: a gimmick that may break and not
  everyone will like; at most a slight, unbreakable depth in the enlarged view. Work on a new prototype
  that combines the liked parts.
- **ID card:** the surface wants a denser texture (a CD surface, or anything that makes the object feel
  more real; realism is not the point, density is); it shows on the back, not on the front. In
  mouse-follow mode the card turns while the lanyard above it stays still, which does not look
  elegant; try another way.
- **About:** the ground is too black and too empty; with the photos split into cards there is almost no
  visible light or aura, so the page feels soulless. The "who I am / where I study / photos" sections
  are not liked; the "How I work" part is clever and a good structure. The owner will go over all the
  text by hand. Wanted: tidier, better writing, as on Home.
- **Liked as is:** the buttons, the clock, the scrollbar, the fonts. The presentation part should be
  more controlled.
- **Platforms:** both matter. A phone when the owner shares the site in person; a computer when an
  employer or a teacher opens it, where the hardware allows more.
- **"yedek"** (one of the four questions of 2026-10-14): the owner does not remember; dropped.
- **Docs and outside files:** the owner does not read every document or shared file. Any important
  decision, hard limit, or instruction found in a file (for example a prompt another AI wrote into the
  research archive: "the page will be like this") goes to the owner before it is followed; the owner's
  own briefs and words come first.
- **Way of working:** a professional production system: plan, list and examine every detail, widen
  the scope where it should be, chart a route, run a multi-agent system fit for the purpose, work from
  planned logs and reports so context does not rot, refresh what is stale, archive what is unneeded,
  keep docs and CLAUDE.md reviewed regularly; consult the owner before adding a rule to CLAUDE.md.
  Turn the owner's dictation into clean bullet points and improve on it. Present the important
  questions with explanations so the owner can answer well.

### 2026-10-15, evening (answers on the decision board)

1. Rewrite the past commits to the owner's name now (A).
2. The owner makes `dev` the default branch on GitHub, so the commits count on the profile (A).
3. The metro photos and the second cat photo stay in the repo: they can be used when needed,
   especially the metro ones; more photos will be uploaded over time.
4. Retire the `?live` engine; ADR-0009 is rejected (A).
5. License: code under MIT; photos, renders and text all rights reserved (A).
6. The research reports' screenshots go into the repo so agents can see the references (A).
7. Agents: start with up to four in research and review and two for builders. Not a hard rule:
   the owner watches the usage limit and may lift the limits; the lead runs more when the gain is
   clear. Control and optimisation stay with the lead.
8. CLAUDE.md rules 1–7 approved. Rule 8 (dictation turned into a list and shown first) changed:
   the owner asked whether reading a message twice causes context rot; re-evaluate it; the owner
   only wanted the emphasis and a check.
9. Reports as proposed (a short chat summary per milestone, a board for decisions, a lab link to
   try). Use the documentation standard written for aircraft manuals (Simplified Technical
   English) in places the owner does not need to read; questions to the owner keep their plain
   explanations.

### 2026-10-15, night (answers on the decision board, round 2)

- **Aura, grain and noise are the concept.** The aura makes the ground beautiful; the grain gives a
  slightly rough, natural texture that eases reading, above all in some parts. The page's colour
  comes from the aura, and the aura comes from what the page shows. The black ground stays. This is
  good as it is.
- **Theme: A, Graphite.** White tires the eyes; the hybrid's switch to white, and an aura on white,
  have problems; "we may be happier without white".
- **Process:** the owner did not expect the theme question first, and some questions were asked
  without showing anything. Home needs more prototyping and better examples before its questions.
- Some answers were ticked only so the copy button would work; the notes are what count.
  Answers without a note are provisional.
1. Theme A (Graphite).
2. Home's largest text 48 px desktop / 34 px phone (ticked, no note: provisional).
3. Other pages' largest text 80 px desktop / 45 px phone (ticked, no note: provisional).
4. Home's shape: not understood; Home needs prototypes, modelled on the minimal, simple, direct
   examples.
5. Home object: decide in the plan, seeing it.
6. No 1-second limit on the arrival; the longer effects stay.
7. The Work transition: choose on a lab page, basing the options on the liked examples.
8. Load a real italic.
9. Photo captions: test a one-line caption and a caption shown only in the enlarged view.

### 2026-10-15, late night (new direction: two pages)

Dictated, Turkish. Condensed; the owner's words in quotes.

1. All content stays the same; only the page system changes. Two pages only: **Home** and
   **Record** ("ana ve blog gibi"). Both run on one shared set of design tokens.
2. Think of it as a redesign from scratch, inside the same logic: keep some mechanisms, above all
   the cards. The aura stays.
3. Home is sequential, top to bottom, and **everything is centred**: nothing shifts left or right.
4. **Top of Home:** a short brief, simple and explanatory like Anthony Fu, "like the current B
   example".
5. **Then Work**, scrolling down: modelled on Robin Noguier and Antoine Wodniack, more interactive.
   The visitor scrolls quickly through the projects, frame by frame. Images may come in when a
   project is clicked, or move side by side; not aligned in threes, each different, "as if inside
   a rotating cylinder". On click the image grows with an animation into the project's
   presentation. Presentations follow Dia and Notion (the examples in the design documents),
   presented professionally.
6. **Then the rest**, reviewed.
7. **Full fluid motion everywhere:** no windows that open and close; every object very alive and
   professional.
8. The visitor sees everything important at first sight and discovers the details slowly while
   scrolling down; less confusion between horizontal pages; everything vertical and fixed; one
   page feels much fuller.
9. Fonts, colours, spacing and density keep one proportion and order on desktop and phone; every
   detail follows the finest design rules and is audited.
10. The owner favours slow animations and content loading in one by one while scrolling to the
    end. Long animations are fine unless extremely long: "doldur her yere" (fill them in
    everywhere). Show motion-design mastery; install HyperFrames or an alternative if needed to
    build the animations, presentations and motion graphics.
11. Background liveliness and colour: Shopify (Editions) is very valuable: alive on every scroll,
    every page innovative. The five examples named (Anthony Fu, Robin Noguier, Antoine Wodniack,
    Dia / Notion, Shopify) are "top tier".
12. Forget the old technical features for now; keep full creativity and design expertise; the
    needed assets can be adapted later. With a clean head, make a fully original work that shows
    the craft: every feature, from scrolling to clicks, thought through, interactive and animated.
13. First make sure everything is examined in full; ask the questions; evaluate this idea
    objectively against the research.

### 2026-10-15, late night (second message: the line, frames, clean-up)

Dictated, Turkish; the message was sent twice. Condensed.

1. Run many agents when needed, in a controlled way. About a day and a half of the weekly limit
   is left; work only on this project.
2. Check the old files, docs, helper guidance and CLAUDE.md: old design tokens there must not get
   in the way of the new direction. Shared assets stay: the ID card and the photos (reimplemented
   if needed). The scroll bar is good. A tab switches between the two pages.
3. Nothing repeats two or three times anywhere on the page; every piece of information sits in its
   one right place. The opening intro may summarise everything.
4. Use the aura in a modern way, not a limited one. Lots of design and drawing, own illustrations;
   the 3D models exist, but 2D art on several layers (2.5D backgrounds) over the simplicity may be
   better and more elegant.
5. The cylinder was misunderstood. Think of each project as a photo frame or a set of photo
   frames, elegantly animated, stacked or side by side. Click: the paper grows and takes the
   visitor into the project inside the same UI, without a new tab; more interactive, maybe a
   rotation; while the photo comes to the front, the other images and the project texts come with
   it. Antoine Wodniack and Robin Noguier have this.
6. Project presentations: Notion and Dia have measured sizes and layouts, written in the research.
   Read the reference documents in full, write an explanation of every line, read every HTML file
   (they hold a lot of brief) and accept those briefs.
7. Shopify is the most elegant in every respect. The videos should be in the research; evaluate
   them, frame by frame if needed; ask for them if missing.
8. Build the production line yourself (agents, methods), so the work sits in a system; clean the
   old troublesome things for the new line.
9. Do not ask about every small decision; show something faster. Ask only when the owner's
   decisions leave a gap. The project slowed down circling failed prototypes; copying even one of
   the liked references well would give a good result; be creative.
10. Desktop and phone may be different designs; do not force one scheme on both.

### 2026-10-16 (review of `/lab/one/`)

Dictated, Turkish. Every sentence is an item in `docs/feedback/2026-10-16-lab-one-review.md`
(ids G, M, W, O, C, P, R, E, H, X); this is the short form.

1. The first screen is acceptable, simple and nice. The order of the parts is right; their
   presentation fails. Nothing may look cheap. Treat it as an art project: every frame flawless.
2. Scrolling catches because the design is wrong, not because of durations. Motion must feel
   oiled, polished, floating, as on a pond. Every scroll animates, also in reverse; text slides
   and shapes itself with the scroll; every interaction gets a visible response, never an empty
   wait (long animations are fine).
3. Work: no long rotating deck and no page swap while scrolling; Robin's flow, frames flying in
   the air while scrolling; the click open is good, keep it. Small line drawings behind each
   project (a temple, a small cyberpunk scene) beside the aura. Less piling (objects, pages).
   Eat Map must not be a long empty scroll.
4. Opened project: needs the scroll bar; scrolling inside must animate continuously.
5. ID card: the new one is buggy in every way; take the previous loved version exactly and add
   texture, a livelier photo and a hover sway of card and rope. Its place in the order is open.
6. How I work: more readable now, but the previous two-lane design with falling drops was far
   more elegant; bring it back.
7. Photos: picking up and turning catches; letting go has no animation; reimagine the postcard
   from scratch (modern, an artwork, especially the back and the frame), not a stock postcard;
   hovering a photo should pick it up and place it on top, not pass through the others.
8. The Bostancı plate shows almost nothing; use the large, uncropped, vertical photo or nothing.
9. The Record strip must follow the Record page's design language; the owner likes the Record
   page a lot (its 3D object, its animations). Define that language.
10. Still empty in places: textures and drawings in the background.
11. Before the Record: audit tokens, fill and space ratios, and motion. Read Shopify and the
    others again and list every feature they have against ours, for the same fullness.
12. GitHub: chase every achievement through real work; adopt Recto's pull-request decision
    (PRC-17) here and elsewhere if needed.
13. Keep everything in a file as a plan; work until all of it is clean in the owner's eyes.

### 2026-10-16, afternoon (review of round two)

Dictated, Turkish. Every point is a row T1–T21 in `docs/feedback/2026-10-16-lab-one-review.md`.
Short form: the card's place next to How I work (`?card=lanes`) is right; the postcard back needs its
own study (fill, type, texture, maybe drawings); the card photo feels flat (try 2.5D); the
recorder has a phone render bug; the bottom edk stays for now but is cut off (later, on request);
think about the role of 3D objects on the new page and fit the loved recorder into it; the rail's
jump panel should grow from the side with a light blur; the lanyard must react to every card
motion; the "How it's made" object needs a better design; the opened project's bottom bar must be
aligned glass, with the close apart on the left; leaving an enlarged photo or an opened project
must be clearer (users got stuck), without an ugly big button; the Home Record strip feels pasted
from outside the new language; the drawings, colours and animations are very good; continue the
listed next steps. The owner will do the GitHub settings at the computer; remind at the next gap.

### 2026-10-16, evening (model check and re-reading)

Dictated, Turkish. Condensed; recorded on 2026-10-17 from the coverage pass two
(`docs/research/2026-10-coverage-pass-two.md`, message I).

1. The owner's project view shows the small model. Did the last prompt go to it by mistake? Check
   which model the last sessions used.
2. Re-read the last three prompts and the owner's explanations; go over each point, do not only
   note it.
3. Work on many branches with agents.

Answer (lead, for the morning report, row V11): the session transcript shows the same main model on
every assistant turn since 2026-10-08; no turn ran on the small model.

### 2026-10-16, night (answers and new points)

Dictated, Turkish. Every point is a row V1-V10 in `docs/feedback/2026-10-16-lab-one-review.md`.
Condensed; the owner's words in quotes.

1. HyperFrames: wait. It will certainly be used later, maybe one round per app once everything is
   done. In-page animation goes well. The owner does not know whether HyperFrames is for in-page
   animation or for turning it into video.
2. Other achievements: no rush. The current ones have not appeared although the PRs were merged;
   unclear why.
3. English Prep is archived; its old commits are pulled; no change there for now.
4. The tape-as-spine Record idea may not be bad; the owner tests it in the morning. The
   project-objects idea was not clear.
5. The postcard-back drawings look good. "Alttaki yazı bir tık daha açılmış" (the text at the
   bottom spread, or washed out, a little); the owner never tested on the computer, so maybe a phone
   problem: measure on the phone too.
6. The owner is away until about 9-10 in the morning; the work must not stop.
7. The rail's opened panel looks very ugly in the screenshot. The plain rail at the right is good.
   The rail needs two more parts: press and hold to drag, and a menu on click that is a showcase.
   Never a separate drawer or window. A click should feel, "hissiyat olarak" (as a feeling), like
   touching something alive that grows or reveals from that point: a pressed water drop that
   spreads lower and wider; a closed palm whose fingers open. The background blur is gradual and
   natural from the side, not inside a window, to bring the text and the pressed rail forward; above
   all on phones. The page may not have much text at that moment anyway.
8. Fonts, taps and motion must be expert, professional and artistic, not a technical feature: every
   light, colour and motion detail matters; a masterpiece; creative, meticulous, measured.
9. The new glass looks good. Same glass or different for the bottom capsules and the top
   Home/Record tab? Real refraction, or would it hurt performance; the GPU on capable devices? The
   top one's light changes with the aura and feels more like glass; the bottom ones are nicely
   minimal. Let each take the best of the other; test several versions: "not something I can just
   say change".
10. The owner's father found the name's typeface at the top cheap. The owner thinks it is elegant
    and personal, not product-like. Review all references, portfolios and research again; evaluate
    candidate typefaces yourself, why and why not; follow the research and the lead's view.
11. Some questions are still unanswered; the owner answers in the morning after testing the
    published page.
12. Keep working through the night: open work first; if nothing is left, research small
    improvements (no big changes); otherwise iterate the rail. Check again that nothing that turned
    into a note in earlier messages was left undone; gather everything.
