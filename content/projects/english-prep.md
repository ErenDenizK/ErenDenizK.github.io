---
title: English Prep
order: 2
status: In development
version: "0.75"
role: Direction, specs, review; built with AI agents
started: 2026-09
runsOn: The web, phone first
stack: Web · No build step · 241 questions
accent: { color: "#efb1cb", p2: "#9a9cf0", p3: "#6fc9cf" }
wordmark: { face: Inter, weight: 600, tracking: -0.055, case: lower, color: "#eee9ed", dot: "#efb1cb" }
object: englishprep
og: english-prep
summary: A study space for Turkish university English proficiency exams.
links:
  - { label: Open English Prep, href: "https://erendenizk.github.io/english-prep/", kind: live }
  - { label: Code, href: "https://github.com/ErenDenizK/english-prep", kind: code }
captures:
  - { id: home }
  - { id: lesson-phone }
  - { id: question-phone }
  - { id: results-phone }
  - { id: about }
clip: { id: signature, phone: signature-phone }
reel:
  - { id: home, phone: home-phone }
  - { id: lesson, phone: lesson-phone }
  - { id: question, phone: question-phone }
what:
  text: Article-led lessons, each a contrast (“Present Perfect vs Past Simple”), then paragraph-cloze tests with explained feedback. Built for learners who already speak English and lack the labels.
  numbers:
    - { value: "10", label: topics }
    - { value: "60", label: lessons }
    - { value: "241", label: questions }
why:
  quote: I built it for myself and friends sitting the exam.
how:
  form: loop
  items:
    - "No build step: plain HTML, CSS and ES modules."
    - Zero runtime dependencies, and no innerHTML.
    - Everything is stored in the learner's own browser.
    - Content is validated in CI; questions are reviewed blind.
  layers:
    - name: "Static files"
      items: [0]
    - name: "The page"
      items: [1]
    - name: "The learner's browser storage"
      items: [2]
    - name: "CI validation and blind review"
      items: [3]
learned:
  placeholder: owner to write
next:
  placeholder: from the roadmap, owner to confirm
story: lesson
vision:
  placeholder: owner to write
problem:
  placeholder: owner to write
audience:
  placeholder: owner to write
decisions:
  placeholder: owner to pick from the material in the comment below
refuses:
  placeholder: owner to confirm
check:
  placeholder: owner to confirm
---
<!-- Draft material for the project story (round 6, rows S29 and S30). Never rendered: the build
reads only the front matter. The owner writes the words (S42).

vision / problem (english-prep CLAUDE.md, "Who this is for"): a learner with a real English base and
no academic foundation: competence without the labels. The app refines; it does not teach from zero.
problem as before / now (the lesson form): before, a textbook that teaches what you already say; now,
the labels for what your ear already knows. Owner's words needed.
check (world.json promise): free, no account, progress stays in your own browser.
how.process, to confirm (the content pipeline): write, blind review, solve by hand, ship.
next: archived; Session I complete (owner to confirm the wording).
-->
