# Prototype E: dark D with tabs, focus views and objects

Read first: `docs/brief.md` (all amendments), `docs/adr/0003`, `0005`,
`docs/research/2026-10-requirements.md`, `2026-10-ux-patterns.md`, `2026-10-3d-objects.md`,
and `prototypes/d-quiet/index.html` (the chosen direction's feeling).

## Content
`prototypes/CONTENT.md`, with these changes: the name is **Eren Deniz Kuyucaklıoğlu**; the
mark is lowercase **edk**; links are GitHub (https://github.com/ErenDenizK) and LinkedIn
(placeholder, no URL); no email. Photos: `content/photos/eren-ytu-gate-1000.webp` and
`park-through-lens-1000.webp` (embed as data URIs). Log entries are samples on these topics:
why I built this site; two-track education (fundamentals by hand at school and in courses;
products by directing AI agents); my university; what I'm working on. Tag every one "sample".

## Structure (hash routes stand in for real routes in a single-file prototype)
- Tabs: Home `#home` · Work `#work` · Log `#log` · About `#about`. Desktop: a floating pill
  at the top with a sliding indicator. Phone: a compact sticky top pill. Tab changes slide in
  the direction of the tab order (~350 ms).
- Home: name + one concrete sentence, the hero object, three project teasers, a now line and
  the latest entry, links.
- Work: three large project tiles; each opens a **focus view**: a sheet that grows from the
  tile (desktop: centred ~min(1120px,92vw) × 92dvh with the project's colour lighting the space
  behind; phone: full-height bottom sheet, swipe down to close). URL `#work/recto` etc. Inside:
  teaser → what it is → why → how (decisions) → learned → next, with status, version, role,
  dates, links. Close by button, Escape, backdrop, Back.
- Log: year-grouped list (date · title · dek · length tag); entries open in place or as a view.
- About: intro, the two photos, two-track education, links, now, a short note on how the
  site and log are made.

## Look
Dark: ground about #0A0A0B, warm off-white text (not pure white), one light per view, grain on
gradients, glass only where something is behind it. Typography in the spirit of D but tuned for
dark. Project colours: Recto lime #bbed26, English Prep sakura #efb1cb with iris and lagoon,
Eat Map warm amber (placeholder). Avoid the dark-template tells in the UX research §3.

## Objects (A: one per tab, changing into the next)
- Home: a glass extruded lowercase "edk".
- Work: the project's own object, changing as you hover or open a tile:
  Recto: glass page stack with a folded corner and clip (fan out on hover);
  English Prep: a sakura glass speech bubble with "Aa" (gentle pop);
  Eat Map: a warm glass map pin over a small plate (pin drops).
- Log: a glass microphone (the log is dictated); a soft waveform pulse.
- About: a pair of round glasses (the owner wears round glasses; ties to the lens photo);
  a light flare across the lenses.
- Transition between tabs ~800 ms (e.g. the current object melts to a glass droplet and
  re-forms), synced with the tab slide.
- C, lightly: the object leans toward whatever the reader hovers or reads.
- Lighting is the quality bar (ADR-0005 §3): HDRI environment via PMREM, key light, a rim in
  the section's colour, contact shadow, ACES/AgX tone mapping, no bloom washing the ground.
- Phones and reduced motion: posters, no loop. If WebGL fails: posters.

## Rules
Single self-contained HTML (`<title>` and `<style>` first, no doctype/html/head/body tags),
three.js from `https://cdn.jsdelivr.net/npm/three@0.170.0/` via an import map (jsDelivr is
blocked in this sandbox; for local tests serve the npm package under the same URLs), assets as
data URIs. Works at 1440×900, 1180×820 touch, 390×844. Everything readable is visible at rest.
Keyboard focus visible. Corner tag "Prototype E — Dark D".
