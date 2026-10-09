# ADR-0011: Embassies are built from each product's world.json, the kit's light field and real captures

**Status:** technique decided by the agent (CLAUDE.md: "decide technique yourself and record it");
the look is proposed until the owner has seen it · **Rests on:** brief §7 (2026-10-09: "Embassies
(project views enter each app's own world inside the portfolio's frame)"; *Family vision*; *boost and
the family kit*), `docs/design/family.md` §2.5, §3.1, §3.2, `docs/family-kit/` (presentation.md,
world.schema.json, light.md, motion.md), ADR-0002, ADR-0006, ADR-0007, ADR-0010,
`research/2026-10-media.md` §7–8

## Decision

1. **Four bands in one article** (`components/ProjectCase.astro`), the same on the page and in the
   sheet: the porch on the house ground (object, title, facts, the way in, unchanged); a still
   threshold, 200 px (120 px on phones), a gradient from the house ground to transparent laid over
   the product's ground and light, so the light begins inside it; the embassy in the product's world;
   the foot (credits, the way out). A project without a `world.json` keeps the house ground.
2. **Data, never code.** `content/projects/<slug>/world.json` follows the kit's schema and is read by
   a content collection that names only what the embassy uses. `tests/worlds.mjs` (in `npm run
   verify`) validates every world against `world.schema.json`, runs `checkField()` on its light, checks
   its files and measures contrast through the light (body text 7:1, quiet text and links 4.5:1,
   the accent's label 4.5:1, against the brightest point of the field under its cap and an event's
   boost). Known gaps are listed by name in the test (Eat Map has no captures yet).
3. **Tokens are re-pointed, not restyled.** `lib/world.ts` turns a world into `--w-*` properties;
   `styles/embassy.css` points the house names (`--ink`, `--read`, `--rule`, `--p` ...) at them inside
   the bands, so the sections, the contents rail, the record rows and the links take the product's
   colours with no rules of their own. The accent appears only on the primary button (its gradient,
   label colour and radius) and as light; press and release use the world's springs through the kit's
   `toLinear()`.
4. **The light is the kit's field**, written at build time in `light.css` markup so it exists without
   JavaScript, inside a window-sized sticky layer (a size container: the sheet in the dialog, the
   window on the page) that stays behind the reading position, as each product's light stays behind
   its view. `scripts/embassy.ts` applies the kit's run rules (drift only while the band is on screen,
   the tab visible and motion welcome; reduced motion: each source in its first pigment; an event
   field brightens once on arrival and settles in its time). A world may give a source its own drift
   path (`drift.path`, English Prep's own keyframes in the field's `cqw/cqh`), which replaces the kit's
   generic one.
5. **Captures are content.** PNG masters sit in `content/projects/<slug>/captures/` as the kit names
   them; the frontmatter picks which to show (`captures`, `clip`); Astro's image pipeline derives AVIF
   and WebP widths (2x wide, 2x phone), all lazy, so first paint is unchanged. Masters are committed
   (the kit's contract); a re-shoot replaces files, never code. Phone captures share a row that scrolls
   inside itself on phones.
6. **One clip, one video.** The signature clip is a poster first; its `<video>` gets sources only when
   it is 60 % in view, motion is welcome and the tab is visible, plays once and rests on its poster,
   pauses out of view, and claims the page's one video slot from the object stage (`media.ts`
   `claimVideo`). A phone cut of the same gesture is chosen by the sources' `media`, still one element.
   `tools/captures/clip.mjs` encodes AV1 10-bit, HEVC `hvc1` and H.264 as the kit and ADR-0006 say.
7. **Type:** Newsreader for the maker (title, section heads, prose at 21 px, credits); the product's
   face for the product (its promise line at its own display size and tracking, captions, numbers,
   the button). No font files are added.

## Consequences

- The embassy CSS and the kit's `light.css` are global (the sheet shows a project's article over Work
  and Home), about 3 KB gzipped per page.
- A short world (Eat Map today) is at least one view tall, so its light is whole.
- The first build encodes every capture (minutes); Astro's asset cache makes later builds fast.
- Worlds made by an app's own session are taken as handed over and only adjusted where the embassy must:
  Recto's copy gives its WebGL aurora one pigment per source at the kit's recorded positions (checkField),
  sets the house Inter as the stack (Inter Recto is not on the site), leaves out its tertiary ink and
  uses a cap of .16 (its shipped Library aura's peak; the kit's .42 put body text under 4:1 over the
  lime core). Each change is written in the world's own `light.note`.
- A gradient is the button's fill only when it starts at the accent (English Prep's Sakura pair);
  Recto's gradient is its mark's, so its button keeps the one lime.
