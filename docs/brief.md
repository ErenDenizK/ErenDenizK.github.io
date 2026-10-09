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
