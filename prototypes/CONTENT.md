# Shared prototype content

Every prototype uses exactly this content so they can be compared on form alone. Do not
invent facts. Anything marked PLACEHOLDER must look like a placeholder (e.g. a "sample"
tag), never like a real claim.

## Identity
- Name: Eren Deniz K. (PLACEHOLDER: full surname to confirm with the owner — show "Eren Deniz K.")
- Line: Computer Engineering, Yıldız Technical University, Istanbul. First year.
- Interests: low-level systems — processors, embedded, the machine's own language.
- Builds products by directing AI agents, and treats that as a discipline of its own.
- Prep year: passed the English proficiency exam with AA (full marks).
- Links: GitHub https://github.com/ErenDenizK · LinkedIn (PLACEHOLDER, no URL yet)

## Projects (all in active development)

### Recto — accent: lime #bbed26
- Teaser: A PDF editor that runs entirely in your browser. Nothing is uploaded.
- Overview: Open many PDFs, arrange their pages on one light table, annotate, fill, redact,
  edit text, recognise scans, compare, sign. Public beta (1.0.0-beta).
- How: PDFium compiled to WebAssembly in a Web Worker; Vite, React 19, TypeScript; CSP limits
  connections to its own origin; every export is re-opened and checked before download;
  redaction removes the content under each mark and re-reads the output. E2E tests in
  Chromium, Firefox and WebKit.
- Why / learned: PLACEHOLDER (owner to write).
- Started: September 2026. Live: https://erendenizk.github.io/recto/ · Code: https://github.com/ErenDenizK/recto

### English Prep — accent: sakura pink #efb1cb (deep #922e55), with iris and lagoon
- Teaser: A study space for Turkish university English proficiency exams.
- Overview: Article-led lessons, each a contrast ("Present Perfect vs Past Simple"), then
  paragraph-cloze tests with explained feedback. 10 topics, 60 lessons, 241 questions.
  Built for learners who already speak English and lack the labels.
- How: No build step: plain HTML, CSS and ES modules; zero runtime dependencies; no
  innerHTML; everything stored in the learner's own browser; content validated in CI;
  questions reviewed blind. Version 0.75.
- Why / learned: "I built it for myself and friends sitting the exam." Learned: PLACEHOLDER.
- Started: September 2026. Live: https://erendenizk.github.io/english-prep/ · Code: https://github.com/ErenDenizK/english-prep

### Eat Map — accent: PLACEHOLDER (pick a warm one)
- Teaser: An iOS app, built in Xcode. PLACEHOLDER description.
- Status: in development, code not public yet.

## Log (ALL SAMPLE ENTRIES — tag them "sample")
- 2026-10-08 · short · "Starting this site" — Why a portfolio that grows for four years.
- 2026-10-04 · medium · "English Prep v0.75" — What changed and why.
- 2026-09-26 · long · "Why Recto runs PDFium in a worker" — An explainer.
- 2026-09-15 · short · "CS50, week 4: memory" — Notes on pointers.

Site copy is first person ("I build…").

## Rules for every prototype
- English UI. Must be one self-contained HTML file: `<title>` and `<style>` first, NO
  `<!doctype>`, `<html>`, `<head>` or `<body>` tags (a publisher wraps it). Inline all CSS/JS.
- External scripts only from cdn.jsdelivr.net/npm/ or cdnjs with an exact pinned version
  (e.g. three@0.170.0 via an import map to cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js).
  Fonts only from Google Fonts with fallbacks. No images from other hosts (draw in code).
- Colours as tokens on :root; set body background explicitly. Single-theme dark is allowed
  if deliberate (then set color-scheme: dark on :root and every colour explicitly).
- Works at 1440×900, 1180×820 touch and 390×844 phone; no horizontal scroll; 16px gutter.
- prefers-reduced-motion gives a complete still version. If WebGL fails, a still fallback.
- Everything readable is visible at rest; no content waiting at opacity 0.
- Keyboard focus visible; links are real <a href>.
- A small corner tag reads "Prototype A/B/C/D — <name>".
