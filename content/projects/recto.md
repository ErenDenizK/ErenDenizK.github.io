---
title: Recto
order: 1
featured: true
status: Public beta
version: 1.0.0-beta
role: Direction, specs, review; built with AI agents
started: 2026-09
runsOn: Desktop and tablet browsers; phones read-only
stack: Web · WebAssembly · PDFium
accent: { color: "#bbed26", glow: "#a6d873" }
wordmark: { face: Funnel Display, weight: 600, tracking: -0.03 }
object: recto
og: recto
summary: A PDF editor that runs entirely in your browser. Nothing is uploaded.
links:
  - { label: Open Recto, href: "https://erendenizk.github.io/recto/", kind: live }
  - { label: Code, href: "https://github.com/ErenDenizK/recto", kind: code }
captures:
  - { id: library }
  - { id: markup-palette }
  - { id: light-table }
clip: { id: capsule-morph }
reel:
  - { id: markup-palette, caption: "Markup: the capsule becomes the palette over the sample document." }
  - { id: library, caption: "The Library: every document starts here, and nothing leaves the device." }
  - { id: capsule-morph, caption: "One glass capsule changes shape: dock, Markup palette, Pages bar." }
what:
  text: Open many PDFs, arrange their pages on one light table, annotate, fill, redact, edit text, recognise scans, compare, sign.
why:
  placeholder: owner to write
how:
  form: column
  items:
    - PDFium, compiled to WebAssembly, runs in a Web Worker.
    - Vite, React 19 and TypeScript.
    - A Content Security Policy limits connections to its own origin.
    - Every export is re-opened and checked before download.
    - Redaction removes the content under each mark, then re-reads the output.
    - End-to-end tests run in Chromium, Firefox and WebKit.
  layers:
    - name: "Browser tab"
      items: [1]
    - name: "Web Worker"
      items: [0]
    - name: "Your files, on the device"
      items: [2]
    - name: "Export check"
      items: [3, 4]
    - name: "Tests in three engines"
      items: [5]
learned:
  placeholder: owner to write
next:
  placeholder: from the roadmap, owner to confirm
story: dia
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
reads only the front matter. The owner writes the words (S42); these lines only collect what the
product's own files already say, so nothing is invented.

vision (from recto/docs/VISION.md, "One sentence"): a free, open-source PDF editor that runs entirely
in the browser, never uploads a file, and treats PDF editing as one document workspace rather than a
grid of tools.
problem (VISION, "The thesis"): hosted services upload every file and gate the free tier; open-source
toolkits are a homepage of single-purpose tools (pick, upload, download, repeat).
decisions, candidates (ADR titles in recto/docs/adr/): the engine stack (PDFium in WebAssembly); the
virtual document model; no motion library; the compact read-only phone edition (ADR 0033).
refuses (VISION principles and non-goals): no server for anything the browser cannot do; no
accounts, quotas or upsell; phones read only.
check (world.json promise): "Nothing leaves this device." The network panel shows it.
how.process, to confirm: spec, agents build, I review, tests in three engines, ship.
-->
