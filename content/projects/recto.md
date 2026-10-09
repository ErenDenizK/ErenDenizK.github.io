---
title: Recto
order: 1
featured: true
teaserMeta: Public beta
status: Public beta
version: 1.0.0-beta
role: Direction, specs, review; built with AI agents
started: 2026-09
runsOn: Desktop and tablet browsers; phones read-only
stack: Web · WebAssembly · PDFium
accent: { color: "#bbed26", glow: "#a6d873" }
object: recto
og: recto
summary: A PDF editor that runs entirely in your browser. Nothing is uploaded.
links:
  - { label: Open Recto, href: "https://erendenizk.github.io/recto/", kind: live }
  - { label: Code, href: "https://github.com/ErenDenizK/recto", kind: code }
what:
  text: Open many PDFs, arrange their pages on one light table, annotate, fill, redact, edit text, recognise scans, compare, sign.
why:
  placeholder: owner to write
how:
  items:
    - PDFium, compiled to WebAssembly, runs in a Web Worker.
    - Vite, React 19 and TypeScript.
    - A Content Security Policy limits connections to its own origin.
    - Every export is re-opened and checked before download.
    - Redaction removes the content under each mark, then re-reads the output.
    - End-to-end tests run in Chromium, Firefox and WebKit.
learned:
  placeholder: owner to write
next:
  placeholder: from the roadmap, owner to confirm
---
