# Plan: the craft round (2026-10-09)

The lead's working plan for the round after prototype E. `ROADMAP.md` stays the level view;
this file is the current round, its workstreams and who is on them. Update it as tracks land.

## Direction

The owner's verdict on prototype E's objects: good, but in-page 3D does not yet look as good
as the Blender render, and nothing on the site may feel cheap: fonts, motion or images
(brief §7, 2026-10-09). So this round raises the craft bar before Level 2 builds on it.

Three principles guide every track:

1. **Art direction over raw rendering.** Premium 3D sites mostly win by controlling light,
   framing and material, often by baking or pre-rendering, not by brute real-time power.
   Our dark ground makes pre-rendered frames composite seamlessly; use that.
2. **One system.** Type, motion, light and objects share tokens and one rhythm, so a new
   object or project never looks bolted on.
3. **Evidence before taste questions.** Each track ends with images or a page the owner can
   judge, and an ADR for the technique chosen.

## Workstreams

| # | Track | Output | Status |
|---|---|---|---|
| 1 | 3D quality research: how live 3D sites look premium and stay consistent | `research/2026-10-3d-quality.md` | done |
| 2 | 3D render bake-off: real-time vs pre-rendered sequence vs baked lighting, on edk and Recto | comparison images, sizes, a recommendation; ADR-0006 | done |
| 3 | Craft audit: type, motion, visuals of prototype E; premium type pairings with licences | `research/2026-10-craft-audit.md`, type specimen shots | done |
| 4 | Tools and skills for motion and drawing | `research/2026-10-tools.md` | done |
| 5 | Eat Map identity: colour from the owner's screenshot, object and poster re-lit | updated object, poster, accent | done |
| 6 | Synthesis: pick the 3D strategy, the type system and the motion system; prototype F | ADR-0006 accepted; prototype F published | done; video next |
| 8 | Icon system: a reproducible tool that draws every icon from one set of rules | `tools/icons/`, `research/2026-10-icons.md` | done |
| 9 | Media delivery research: still-to-video handoff, codecs, ground match, photos | `research/2026-10-media.md` | done |
| 10 | Production renders: lean grids, interaction and droplet clips for five objects | `media/objects/`, `tools/objects/frames.py` | running |
| 11 | Prototype F with video: wire the manifests into F's media stage | prototype F v2 | after 10 |
| 7 | Level 2 prep: repo rename, ADR acceptances, Astro scaffold | — | waiting on owner |

## Owner decisions (2026-10-09)

Colours accepted; type pairing 2; About drops the glasses for the courtyard photo; objects
become pre-rendered (still first, video behind it); fix transitions, navigation and emoji
icons on phones. Content waits. See brief §7.

## Open questions for the owner

- Eat Map: one line on what the app is, in their words; exact hex if it differs from `#eb4f6b`.

## Done this round

- Prototype E on the real Blender objects, rig lighting and Cycles posters (2026-10-09).
- Research: 3D quality, motion and drawing tools, craft audit with type pairings.
- Eat Map re-lit in the app's rose.

## Notes for later

- 2.5D About photo: two hand-cut layers (lens rim and fingers in front, courtyard behind)
  moved with CSS, or a Depth Anything V2 depth map (runs offline here, soft edges, ~1%
  parallax). Wait for a photo the owner picks for it (`research/2026-10-media.md`).
- iPhone checks for the owner once F has video: ground seam in a dark room, Low Power Mode,
  loop seam, every tab twice without a crash.
- Render bake-off; ADR-0006 accepted (pre-rendered objects).
- Icon generator (`tools/icons/`).
- Prototype F: 13 navigation bugs from E fixed, including the Home blank page.
