# ADR-0005: One object per tab, scripted in Blender, lit to the render's standard

**Status:** proposed 2026-10-09; items 2–3 amended by ADR-0006 · **Rests on:** brief §7 (2026-10-09);
`research/2026-10-3d-objects.md`, `research/2026-10-ux-patterns.md` §4

## Decision

1. Each tab has a hero object; switching tabs turns one object into the next. Each project has
   its own object, shown in its focus view and on Work.
2. Every object is a committed headless-Blender script (`tools/objects/`) producing a meshopt
   GLB for real-time desktop, a Cycles poster and a short turntable, which is the twin for
   phones, reduced motion and no WebGL.
3. Quality bar: the real-time object must read like its Cycles render. Lighting (an HDRI
   environment, key, rim in the section's colour, contact shadow, tone mapping) is reviewed
   side by side with the poster before an object ships.
4. Each object gets one interaction of its own (for example pages fanning out, a pin dropping),
   built from shared motion tokens so the whole stays one family.
5. Objects never block content: HTML and posters paint first; the renderer loads after first
   paint, gated on capability, reduced motion and Save-Data.
