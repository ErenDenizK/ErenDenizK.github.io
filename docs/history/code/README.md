# Archived code

Archived 2026-10-15: superseded by the two-page direction (brief log, 2026-10-15, late night).

Code that left `src/` but is kept as readable files, because the owner said a part of it may
return. It is a record, not a module: nothing imports it, the build never sees it, and
`tsconfig.json` excludes this folder, so `npm run check` does not type-check it. The relative
imports inside the files point at their old places in `src/`. To reuse a part, copy it into the
new code and rewrite its imports.

Code that was plainly dead was deleted instead; its list, its reasons and the command that
restores each file are in [`../removed-2026-10-15.md`](../removed-2026-10-15.md).

| Folder | What it was | Why it is kept |
|---|---|---|
| `photo-darkroom/` | Concept 1 of the `?photos` trial (2026-10-11): the print "develops" in WebGL as it scrolls into view; a tap shows its label in light. Files: `Darkroom.astro` (was `src/components/photo/`), `darkroom.ts` and `gl.ts` (were `src/scripts/photos/`), `types.ts` (the shared props). Research: `docs/research/2026-10-photo-presentation.md` §3.1. | The owner, 2026-10-15: "Darkroom's burn-in may return, much faster, with its small coloured detail; never Darkroom's caption." The burn-in shader (`FRAG` in `darkroom.ts`) is the part to reuse. |
