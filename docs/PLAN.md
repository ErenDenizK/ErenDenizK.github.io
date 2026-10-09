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
| 1 | 3D quality research: how live 3D sites look premium and stay consistent | `research/2026-10-3d-quality.md` | running |
| 2 | 3D render bake-off: real-time vs pre-rendered sequence vs baked lighting, on edk and Recto | comparison images, sizes, a recommendation; ADR-0006 | running |
| 3 | Craft audit: type, motion, visuals of prototype E; premium type pairings with licences | `research/2026-10-craft-audit.md`, type specimen shots | running |
| 4 | Tools and skills for motion and drawing | `research/2026-10-tools.md` | running |
| 5 | Eat Map identity: colour from the owner's screenshot, object and poster re-lit | updated object, poster, accent | running |
| 6 | Synthesis: pick the 3D strategy, the type system and the motion system; prototype F | ADR-0006/0007, prototype F | after 1–5 |
| 7 | Level 2 prep: repo rename, ADR acceptances, Astro scaffold | — | waiting on owner |

## Open questions for the owner

- Eat Map: exact accent hex (sampled ≈ `#eb4f6b` from a photo of the simulator), and one
  line on what the app is, in their words.
- English Prep's sakura pink and Eat Map's rose sit close; keep both, or shift one?
- Accent colours for edk, Log and About (placeholders: cool white-blue, blue, gold/amber).
- After track 3: which type pairing.

## Done this round

- Prototype E on the real Blender objects, rig lighting and Cycles posters (2026-10-09).
