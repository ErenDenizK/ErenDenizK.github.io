# Photos

The owner's own photographs. Metadata (EXIF, GPS) is stripped on import. Using a photo on the
site is a choice made with the owner; nothing here is shown just because it exists.

| File | What it shows | Notes |
|---|---|---|
| `eren-ytu-gate.jpg` | The owner, selfie at the YTÜ gate in the rain, thumbs up | About ID card, About link card |
| `park-through-lens.jpg` | YTÜ's inner courtyard through a tinted lens (name kept for history) | About, the pile of postcards (Photos) |
| `metro-platform.jpg` | Istanbul metro platform, a train in motion blur, warm light; strangers seen from behind | Not used (owner, 2026-10-11) |
| `metro-mirror-selfie.jpg` | The owner's reflection in a metro window, phone in hand, other passengers faint | Not used (owner, 2026-10-11) |
| `bostanci-rain-dusk.jpg` | Bostancı station platform in rain at blue hour, wet reflections, signal lights | A strong blue mood: fits the Record's blue light. About, the pile of postcards (Photos) |
| `cat-sunset-silhouette.jpg` | A tabby kitten silhouetted on a sea wall, sun low over the Marmara | Warm orange. About, the pile of postcards (Photos; the one cat photo in use) |
| `cat-sunset-face.jpg` | The same kitten facing the camera, green eyes, sunset over the sea | Warm orange. Not used: of the two cat photos only one is shown (owner, 2026-10-10) |

Each has a `-1000.webp` preview. About's postcards are made from the originals by
`tools/photos/postcards.mjs` (`npm run photos`) at the widths they are shown, never upscaled; the
script also measures each photo's light colour (`tone`) for the glow behind the pile, and writes the whole
photograph at its own width (`pc-<stem>-full`) for the loupe and enlarged view of the alternatives in
`docs/research/2026-10-photo-presentation.md`. Their depth maps are painted by `tools/photos/depth.py`. Added 2026-10-10 (owner: "use them where they fit; you don't
have to use them all").
