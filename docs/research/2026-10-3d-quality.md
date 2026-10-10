# Research: how live 3D sites look premium and stay consistent (2026-10-09)

**Status:** current reference. The evidence base if real-time 3D returns on desktop (`docs/PLAN.md`
track 7).

Track 1 of `docs/history/plan-2026-10-craft-round.md`. Question: the owner judges the in-page objects of prototype E weaker than
their Cycles posters (brief §7, 2026-10-09: "lighting is the bar"). How do the best 3D sites look
premium, keep many objects consistent, and what should this site do?

Evidence grades: **E** verified from source code or a primary document read here; **P** primary
but indirect (a search summary of the primary page, a lesson outline); **F** forum or secondary
write-up; **M** memory, not re-checked. Most studio sites (Codrops, Awwwards, lusion.co, blogs) were
unreachable from the sandbox except through search summaries, so many studio claims are P or F.
GitHub source was read directly.

## 1. Short answer

The premium sites do not win by rendering harder. They win by **deciding in advance what the
camera may see and paying for that offline**: baked lighting, pre-rendered frames, video, splats,
textures packed with precomputed information, and a small number of real-time effects layered
on top. Lusion said this outright in September 2026: complex visuals come from "optimized
geometry, baked information, tightly packed textures, shaders and even images or image sequences
enhanced with depth" (P). For its Oryzo hero (2026), Lusion tested real-time PBR, found it "did not
quite reach the visual quality we were aiming for", rejected plain image sequences and video as
not interactive enough, and moved the offline render into the browser as Gaussian splats (P).

Consistency comes from **one of everything**: one light rig or one baked lighting source, one
material library or palette texture, one camera language, one tone mapper, one motion vocabulary.

For us, glass on a black ground is the worst case for real-time rendering (§2). The fitting
strategy is **pre-rendered Cycles frames as the hero and as most of the interaction**, composited
on the black ground. Real time stays for what frames cannot do cheaply: a short stylised morph,
the hover lean, and effects. §7 gives the recommendation and experiments.

## 2. Why our real-time objects fall short (diagnosis)

From `prototypes/e-dark/objects/compare-*.png` and the rig (E unless marked):

| Symptom in the comparison | Cause | Fixable in real time? |
|---|---|---|
| Not colour or exposure: posters and page already share Khronos PBR Neutral at exposure 1.0 (`common.py` maps `neutral` to "Khronos PBR Neutral"; `rig.js` uses `NeutralToneMapping`) | — | already matched |
| "edk" reads as grey brushed metal, not glass; no bright internal edges | Cycles traces 24 transmission bounces, so total internal reflection and the back faces catching the HDRI give glass its look. three.js transmission is one screen-space lookup of the *opaque* scene behind the object, and behind it here is only #0A0A0B. Nothing to refract means dark glass. | partly: backface pass, an environment visible to the transmission buffer only, a Cycles-baked matcap (§5.3) |
| Recto's stacked pages look opaque and over-saturated; Cycles shows layers through layers | three.js cannot show a transmissive surface through another transmissive surface; maintainers call this "a limitation of our current realtime approximation" (F, three.js forum). drei's MeshTransmissionMaterial can "see" other transmissive objects at the cost of an extra scene render per material (E, drei docs). | partly, at a per-object cost |
| Softer, thinner rim highlights, steppy contact shadow | finite shadow-map and buffer resolution, MSAA only at the edges | yes, with TAA/accumulation when still |

Conclusion: the gap is the glass itself, not the rig. The single biggest lever is to stop
asking a rasteriser to fake 24-bounce glass. Either show Cycles' pixels, or move the material away
from physically based transmission toward a look-up that was computed by Cycles.

## 3. Sites and studios

| Site / studio | What they do | Why it looks good | Cost | How they stay consistent | Grade |
|---|---|---|---|---|---|
| **Bruno Simon, folio 2025** (source read) | three.js `WebGPURenderer` with TSL node materials. Nearly every surface uses one `MeshDefaultMaterial` built on Lambert: stylised core shadow by a smoothstep on N·L, received shadows caught and remapped to a per-time-of-day `shadowColor`, light bounce tinted by the terrain colour, fog. No tone mapping is set. Bloom has threshold 1, strength 0.25, so only emissive >1 blooms. | Art direction over physics: a coherent toy-world look that is cheap to shade and cannot drift toward "plastic PBR". | `static/` 197 MB in the repo across many GLBs (uncompressed plus `-compressed`). gltf-transform `etc1s` KTX2 textures and Draco. | **One material, one palette:** a 128×4 `palette.png` texture shared by most meshes, one directional light, one shadow colour, one fog. Two quality levels picked by mobile user agent: shadow map 2048 vs 512, bloom mips 5 vs 2, depth of field only on high. DPR capped at 2, MSAA only when DPR < 2. | E |
| **Three.js Journey, baked lessons** (Bruno Simon) | Model in Blender, keep only visible faces, UV unwrap, bake a Cycles render into one large texture, export, show it with `MeshBasicMaterial`, add only small real-time extras (portal shader, fireflies). The compositor's colour transform on the bake output is the step learners say matters most. | Cycles global illumination at the cost of a texture lookup; it looks the same on every GPU. | one or a few 2–4k textures | the lighting *is* the texture | P (lesson outline), F (forum) |
| **Lusion** (lusion.co, Oryzo 2026) | Older site: Houdini vertex animations, Redshift video blended with real-time three.js, cloth data stored as 11 keyframes for 66 frames in 16-bit integers, a frame counter encoded in the video to sync WebGL to it. Oryzo: offline desk scene moved to the web as Gaussian splats after real-time PBR and video were rejected. The mouse "lens" on lusion.co is a 2D displacement post pass on the WebGL layer only. | Offline light, real-time interaction; motion and depth do the selling. | splats are typically MB-scale (M); video small | one in-house pipeline per project; offline renderer as the source of truth | P (Commarts interview, Lusion blog, Codrops conference report), F |
| **igloo.inc** (Abeto with Bureaux, 2024) | three.js, three-mesh-bvh, Svelte, GSAP. Each portfolio item has its own ice block grown procedurally in Houdini/Blender; a custom VDB-to-browser exporter compresses volume data for the particles below the size of a typical image. Custom live-reload tools for shaders, textures and models. Started from greybox "previs" animations. | One material (ice) and one generator, so every block is unique but from the same family; heavy offline precomputation. | large but compressed; desktop-first | **one procedural generator + one material** for all items; previs fixes camera and timing before art | P (Awwwards case study via search), F |
| **Active Theory** | In-house browser editor that mirrors a Unity/Unreal pipeline; artists optimise and deploy assets, developers add shaders. Their ECD argues WebGL as mere decoration "becomes noise". | Tooling lets artists light and tune in the target renderer, not in a DCC that then mismatches. | — | one engine and editor across projects | F (job post, LBB 2026) |
| **14islands** (r3f-scroll-rig) | Progressive enhancement: semantic HTML and CSS lay out the page; proxy elements are tracked and WebGL is drawn in lockstep on one shared persistent canvas. | Content never depends on WebGL; 3D adds rather than replaces. | small library | one global canvas, layout from the DOM | P (14islands blog), F |
| **Unseen Studio** | three.js, troika-three-text for WebGL text, KTX2 textures, Draco GLB. | Crisp text and compressed textures keep the frame clean. | — | — | F (Awwwards via search) |
| **Garden Eight** | Polygon-explode menus and 3D page transitions in three.js; design and development as one process; Blender assets; Nuxt + headless CMS. | Transitions carry the 3D, not heavy realism. | — | one motion idea reused | F |
| **Locomotive**, **Resn** | Not verified in this round. From memory: scroll-led storytelling with restrained WebGL accents (Locomotive), playful bespoke WebGL campaigns (Resn). | — | — | — | M |
| **Apple product pages** (AirPods, iPhone) | Scroll drives a canvas that draws pre-rendered frames from an image sequence; elsewhere scroll-scrubbed video. The community method for scrub video is all-intra encoding (`-g 1`) so every frame is a keyframe. | It is the offline render, every pixel. The camera path is fixed, so there is nothing to get wrong. | hundreds of frames, lazy-loaded, sized per breakpoint | one render pipeline, one lighting setup per product family | P (CSS-Tricks rebuild), F (scrub-video write-ups); Apple's own code not verified |
| **Resend** | The 3D cube is a live Spline scene embedded through React, started from a Spline community file; materials and lighting tuned over time in the same file. | Simple geometry, one strong material, a designer can iterate in the target renderer. | the Spline runtime is heavy; reports of 3–5 MB and long script time; lazy-loading is the usual fix | one file, one designer | P (Spline blog), F |
| **Stripe** | WebGL animated mesh gradient (a tiny "minigl" wrapper), not 3D objects. | Colour and motion, almost no geometry. | small; battery complaints | one gradient system | F |
| **GitHub globe** | Antialias off, no textures, a few lights, custom halo shader that hides the aliased edge. | Art direction hides the cost-cutting. | small | one shader | P (GitHub blog) |
| **Linear, Vercel, Raycast, Rauno-style icons** | Not verified. From memory, mostly pre-rendered stills or video of Blender/C4D renders, with CSS or light WebGL for motion; Raycast's icon direction is an aluminium keycap with a red glow (P, Raycast blog). | Offline renders on a dark ground, tight palette. | KB-scale images | one renderer, one palette, one camera angle | M, P |

Pattern across the table: the sites that look most "rendered" (Apple, Linear-style icons, Lusion's
Oryzo) ship pixels from an offline renderer. The sites that run fully real-time (Bruno Simon,
Garden Eight, Stripe) choose a *stylised* look the GPU can hit exactly, instead of chasing
photoreal glass.

## 4. Consistency mechanisms

| Mechanism | Who | What it buys us |
|---|---|---|
| One lighting source of truth | Bruno (one light, one shadow colour); bakes; our `rig.json` → Cycles and three.js | Every object lit alike; we already have it |
| One material library or palette texture | Bruno's `palette.png`; igloo's one ice; matcap families | Objects read as a set; colour changes are data |
| One camera language | Apple (fixed paths); our `RIG.camera` fov 24° | Same lens, height and framing for all objects |
| One tone mapper end to end | Khronos PBR Neutral was designed to keep base colour, hue and saturation under grey lighting (E, Khronos press release); AgX desaturates by design (F) | Brand accents (lime, sakura, rose) survive; keep Neutral |
| One motion vocabulary | Garden Eight, Lusion | Morphs and micro-interactions feel like one hand |
| Previs before art | igloo/Abeto | Timing and camera decided before expensive renders |
| Side-by-side review against a reference | our `compare.mjs`; Active Theory's in-engine editor | Drift is caught before shipping |

## 5. Techniques

### 5.1 Comparison table

| Technique | What it is | Looks | Size / performance | Consistency | Fit for us |
|---|---|---|---|---|---|
| **Real-time PBR + transmission** (now) | glTF materials, HDRI, `MeshPhysicalMaterial` transmission | good for opaque metal or plastic; weak for thick, layered glass on black (§2) | GLB 35–76 KB; transmission adds a scene pass; phones struggle | rig shared | keep only for morphs and effects, not as the hero |
| **MeshTransmissionMaterial** (drei) | Physical material plus its own buffer, `samples` (default 6), optional `backside` pass, chromatic aberration, `resolution` | closer: sees other glass, backside thickness | one extra scene render per material, two with backside; low `resolution` (even 32² when rough) is the stated speed-up (E) | — | R3F-only as packaged; port the idea (backside and buffer) to vanilla if needed |
| **Custom refraction shader** (Maxime Heckel; Jesper Vos multiside) | FBO of the background, back-face normals pass, then front faces refract per channel with N samples for dispersion | stylised, crisp, controllable | 2–3 passes; cheap on desktop | one shader for all glass | good for the morph droplet; still needs something behind the glass |
| **Baked lightmap / single baked texture** | Cycles bake into UV textures shown unlit | Cycles GI, identical on all GPUs | 1–4 textures of 1–4k; KTX2 helps | the bake is the lighting | poor for glass (refraction is view-dependent and cannot be baked to UVs); good for opaque parts such as the plate, pin base and microphone grille |
| **Matcap** | texture of a lit sphere indexed by view-space normal | instantly "studio"; highlights follow the camera | one 256–1024² texture; very cheap, fine on phones | one matcap family = one light for every object; tint by `color` | **strong for the real-time layer** if the matcaps are rendered *by Cycles with our rig and glass material* (§5.3) |
| **Pre-rendered frames: turntable, state clips, angle grid** | Cycles frames delivered as all-intra video, WebP/AVIF sequence or sprite | identical to the poster by definition | 36-frame turntable: mp4 88 KB / sprite 179 KB (our own test, E); interaction is a texture swap; works on any phone | perfect: one renderer, one rig, one camera | **best fit for heroes and micro-interactions** |
| **Hybrid** (pre-rendered base + real-time layer) | frames for the object, WebGL or CSS for light sweeps, particles, depth-based relighting, displacement | offline quality with live response | frames + small shader | as frames | **recommended** |
| **Depth-enhanced images** | render a depth or normal pass with the frame; relight or parallax it in a shader (Codrops, Aug 2026: normals from depth gradients, ray-marched soft shadows) | adds live light to a still | +1 texture per frame or state | as frames | good for the hover "lean" and a light sweep without re-rendering |
| **Gaussian splats** | offline scene to splats, real-time view changes | photoreal for diffuse and soft gloss | MB-scale; view-dependent glass is a weak spot for splats (M) | as the offline scene | not now: too heavy for a static site and wrong for refractive glass |
| **Octahedral impostors / angle grids** | object rendered from many angles into an atlas, blended per view | free viewing angle from pre-rendered frames | grid × frame size; seams at fold edges (F) | as frames | a small hemi-grid (e.g. 7×3 views) is enough for a lean of ±15° |
| **Houdini or Blender VAT** | simulation baked into vertex animation textures, replayed on the GPU | offline motion, real-time shading | 1–2 textures + mesh | — | good for a real-time morph if the shading is solved (matcap) |
| **MSDF / troika text** | WebGL text from distance fields | crisp text in 3D | small | — | only if text must live in 3D; our text is HTML (ADR-0002) |

### 5.2 Rendering hygiene (applies to any real-time layer)

- **Tone mapping and colour:** keep Khronos PBR Neutral on both sides (already done). AgX is
  safer for blown highlights but desaturates accents (F); ACES shifts hues. Textures sRGB, maths
  linear, output sRGB. Post chains in 8-bit buffers band in dark gradients; pmndrs postprocessing
  notes linear needs ≥12 bits per channel (P), so use half-float targets and add grain as dither.
- **Bloom:** threshold ≥ 1 on HDR values so only emissive or specular peaks bloom (Bruno: 1 /
  0.25, E). A low threshold greys the #0A0A0B ground.
- **Anti-aliasing:** MSAA, or SMAA as the last pass; for still objects use TAA or accumulation
  of jittered frames (three.js TAA example: accumulates when nothing moves, P), which also
  softens shadows toward the poster.
- **DPR:** cap at 2 on desktop (Bruno, E) and about 1.5 on phones (F); lower DPR while the camera
  moves and step it by measured frame rate rather than a fixed rule (F, three.js forum).
- **Frame budget:** 16.7 ms at 60 Hz; stop rendering when nothing moves (render on demand). Our
  objects are 5–12k triangles, so the cost is fill rate and passes, not geometry.
- **First frame:** HTML and poster paint first; the canvas fades in only after its first frame
  matches the poster (ADR-0005 §5). Swap with a crossfade of 150–250 ms, never a pop.

### 5.3 The Cycles-baked matcap (proposed, untested here)

A matcap is a picture of a lit sphere. Render that sphere **in Cycles, with our rig, HDRI and
the object's glass material, on the #0A0A0B ground**, one per material (clear glass, lime glass,
sakura glass, rose glass, chrome clip, cream bars). In real time each mesh then looks up its
Cycles response by view normal, plus a fresnel rim and, optionally, a cheap backface or thickness
term. It will not refract the object's own interior, but it carries Cycles' highlights, edge
brightness and tint into every frame. It costs one texture per material and is cheap enough for
phones. This is the most promising way to make real-time *morphs* sit next to pre-rendered heroes
without a visible jump.

### 5.4 Pre-rendered frames on a black ground: practical notes

- **No alpha needed:** render on black (or the exact ground) and composite with
  `mix-blend-mode: screen` (or `plus-lighter`). On a dark ground this acts as additive alpha, so a
  coloured project glow behind the object still shows through. Shadows are darker than the ground,
  so they cannot be screened: draw the contact shadow as a separate layer (a pre-rendered
  shadow-only frame with `multiply`, or a CSS radial gradient). Alternatively, render the glow into
  the frame and match the ground exactly. (Technique reasoning; M for blend-mode support details.)
- **Ground matching:** 8-bit video in limited-range BT.709 can lift or crush #0A0A0B differently
  per browser (M). Prefer WebP/AVIF sequences for exact pixels, or test video black levels in
  Chromium, WebKit and Firefox and add a 1–2% grain overlay to hide seams. AVIF supports 4:4:4,
  which keeps lime and rose edges clean; 4:2:0 H.264 smears saturated edges (M).
- **Scrubbing:** for pointer or scroll scrub use an image sequence drawn to a canvas, or
  all-intra video (`-g 1`); normal GOPs stutter when seeking (F). Play forward-only state clips
  (pages fanning out) as normal short video or sequences.
- **Named-part interaction on pixels:** render an object-index or Cryptomatte pass per state as a
  tiny ID map (PNG, nearest-neighbour). Hit-testing the pointer against it tells which named part
  (the clip, the top page, the pin) is under the cursor, with no 3D at all. The same pass gives
  outlines or highlight masks.
- **Pointer lean:** a hemi-grid of angles (e.g. 7 yaw × 3 pitch = 21 frames) crossfaded
  bilinearly gives the "object leans toward what you read" effect from the brief at about the size
  of a short turntable.

## 6. Fit against our constraints

| Constraint | Real-time PBR (now) | Pre-rendered frames | Hybrid frames + real-time layer | Matcap real-time |
|---|---|---|---|---|
| Looks like the Cycles poster | no for glass (§2) | yes, by definition | yes | close, not exact |
| Static GitHub Pages | yes | yes (files only) | yes | yes |
| Phone gets a complete still | poster fallback | poster *is* frame 0; short clips can play on phones too | same | could even run on phones |
| Content first, light first paint | renderer after paint | images lazy-load; no WebGL needed | WebGL optional | small |
| Objects morph between tabs | free but looks unlike the hero | pairwise clips grow as n²; a shared middle state keeps it at 2 clips per object | pre-rendered or real-time morph through a shared middle state | yes |
| Micro-interactions on named parts | free (raycast) | ID maps + state clips; fixed choreography | same, plus live light | free |
| One system, consistent | rig shared, glass differs | one renderer | one renderer + one shader | one matcap family |
| Authoring cost per new object | low | one Cycles batch per object (minutes on CPU here: poster ≈ 105 s, 36-frame turntable ≈ 150 s, E) | same + ID pass | one matcap render per material |

## 7. Recommendation

**Strategy: "Cycles pixels, real-time glue."** This refines ADR-0005 §2–3 rather than replacing
it: the Blender script stays the single source; what changes is that frames become the primary
in-page form and the GLB becomes secondary.

1. **Hero objects: pre-rendered.** Each object ships its Cycles poster plus (a) an idle loop or
   small turntable arc, (b) a pointer-lean angle grid, (c) one state clip per micro-interaction
   (pages fan out, the pin drops, the lenses flare), and (d) an ID map per state for named-part
   hit-testing. Deliver as AVIF or WebP sequences, or all-intra video where it measures smaller,
   composited on the ground with `screen` and a separate shadow layer. Budget target: ≤ 400 KB per
   object at desktop size, ≤ 150 KB at phone size, loaded after first paint and only for the
   visible tab.
2. **Transitions: hub-and-spoke morph.** Every object morphs into and out of one shared middle
   state (the "glass droplet" from the prototype E spec). Pre-render `object → droplet` and
   `droplet → object` in Cycles: 2 clips per object, so 12 clips for 6 objects, and any tab change
   is out-clip + in-clip (~400 ms each). If a live morph is wanted (interruptible, or following the
   pointer), use a real-time droplet with the Cycles-baked matcap (§5.3) only *during* the motion,
   where motion hides the fidelity gap, and land on Cycles frames at both ends.
3. **Interaction layer: light, not geometry.** Live response comes from a thin WebGL or CSS
   layer over the frames: a light sweep or specular glint driven by the pointer (depth or normal
   pass relighting), the project-colour glow, grain, a subtle displacement. Keep a single
   persistent canvas (14islands pattern) and render on demand.
4. **Phones:** the poster first, as now. Phones can afford the same frames: offer state clips on
   tap and the idle loop when not under reduced motion or Save-Data, at phone resolution. No WebGL
   on phones unless an experiment proves the matcap morph is smooth. Reduced motion: posters plus
   a ≤150 ms crossfade between them (UX research §4).
5. **Keep the real-time GLB path** as a progressive extra on capable desktops, and as the place
   to try ideas, but never as the only route to the look. Apply §5.2 hygiene wherever it is used.
6. **System rules for consistency** (to write into ADR-0006): one rig (`rig.json`), one camera
   (fov 24°, same height and fill), Khronos PBR Neutral everywhere, one glass material family with
   per-project tint only, one shared middle state, shared motion tokens for clip durations and
   easing, and a `compare.mjs` side-by-side review before any object ships.

### Experiments (for track 2 and prototype F)

| # | Experiment | Pass criterion |
|---|---|---|
| X1 | edk and Recto, three ways: current real-time; pointer-scrubbed Cycles sequence; real-time with Cycles-baked matcaps. Same viewport, owner judges blind. | owner prefers the frames or the matcap; sizes recorded |
| X2 | Angle grid for the lean: 7×3 and 5×3, AVIF vs WebP vs all-intra mp4, bilinear crossfade on canvas | no visible stepping at 1440×900; ≤ 250 KB |
| X3 | ID-map hit-testing on Recto (clip, top page, stack) driving a state clip | correct part at every pixel; works by touch at 1180×820 |
| X4 | Hub morph: render edk → droplet → recto in Cycles; compare with a real-time matcap droplet | no visible jump at either end; clip ≤ 150 KB |
| X5 | Compositing: `screen` over the ground and a project glow, shadow as a separate layer; check black level and banding in Chromium, WebKit and Firefox, with and without grain | no visible seam or halo on #0A0A0B |
| X6 | Real-time hygiene on the current rig: TAA or accumulation when still, half-float targets, bloom threshold ≥ 1, DPR caps | measurably closer to the poster in `compare.mjs` |

## Sources

Read directly (E): `brunosimon/folio-2025` on GitHub (`sources/Game/Rendering.js`, `Materials.js`,
`Materials/MeshDefaultMaterial.js`, `Ligthing.js`, `Quality.js`, `Viewport.js`,
`scripts/compress.js`, `static/palette.png`); drei MeshTransmissionMaterial docs
(`pmndrs/drei` `docs/shaders/mesh-transmission-material.mdx`); three.js
`tonemapping_pars_fragment.glsl.js` (AgX, Neutral); this repo's `tools/objects/common.py`,
`prototypes/e-dark/objects/rig.js` and `compare-*.png`; `research/2026-10-3d-objects.md`.

Via search summaries (P/F):
- Lusion: Commarts interview <https://www.commarts.com/webpicks/lusion>; Awwwards case study
  <https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html>;
  Oryzo BTS part 2 <https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics>, part 3
  <https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations>; Codrops conference
  report <https://tympanus.net/codrops/2026/09/10/inside-the-first-three-js-conference-in-paris/>;
  three.js forum on the mouse effect <https://discourse.threejs.org/t/mouse-effet-at-the-top-of-three-js-like-on-https-lusion-co/57385>
- igloo.inc: <https://www.awwwards.com/igloo-inc-case-study.html>;
  <https://discourse.threejs.org/t/landing-site-igloo-inc/67249>
- Bruno Simon: <https://www.awwwards.com/brunos-portfolio-case-study.html>; Three.js Journey
  <https://www.threejs-journey.com/lessons/creating-a-scene-in-blender>
- Active Theory: <https://realtimevfx.com/t/full-time-remote-web-3d-artist-active-theory/18892>,
  <https://lbbonline.com/news/Craft-Matters-by-Active-Theory>
- 14islands: <https://14islands.com/blog/progressive-enhancement-with-webgl-and-react>
- Unseen Studio: <https://awwwards.com/unseen-studio-by-unseen-studio-wins-sotm-february-2023.html>
- Garden Eight: <https://daily.dev/posts/the-art-of-continuous-transformation-how-garden-eight-blends-integrity-with-play-q5u7qqkxq>
- Apple-style sequences: <https://css-tricks.com/?p=308477>; scrub video
  <https://muffinman.io/blog/scrubbing-videos-using-javascript/>,
  <https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix>
- Resend / Spline: <https://blog.spline.design/how-resend-uses-spline-for-3d-design>; Spline weight
  <https://webdesign.tutsplus.com/how-to-optimize-spline-3d-scenes-for-speed-and-core-web-vitals--cms-108749a>
- GitHub globe: <https://github.blog/engineering/how-we-built-the-github-globe>
- Raycast: <https://www.raycast.com/blog/launch-week-summary>
- Glass: Maxime Heckel <https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/>;
  multiside refraction <https://tympanus.net/codrops/?p=44326>; Volatile Nexus
  <https://tympanus.net/codrops/?p=120121>; transmission limits
  <https://discourse.threejs.org/t/objects-with-transmission-not-showing-objects-behind/47113>,
  <https://discourse.threejs.org/t/multi-layered-transmission/43634>
- Depth relighting: <https://tympanus.net/codrops/2026/08/19/relighting-images-with-depth-maps-and-three-js/>
- VAT: <https://tympanus.net/codrops/2026/09/19/crumbled-paper-houdini-vat-threejs/>
- Impostors: <https://discourse.threejs.org/t/octahedral-impostors-for-three-js/80318>
- Tone mapping: Khronos PBR Neutral <https://www.khronos.org/news/press/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products>;
  AgX in three.js <https://discourse.threejs.org/t/is-agx-tonemapping-implemented-correctly/60609>
- Post and performance: pmndrs postprocessing <https://github.com/pmndrs/postprocessing>; three.js
  TAA <https://threejs.org/examples/webgl_postprocessing_taa.html>; drei adaptive DPR
  <https://drei.docs.pmnd.rs/performances/adaptive-dpr>; DPR discussion
  <https://discourse.threejs.org/t/hidpi-fractional-scaling-performance-pitfalls-and-best-practices/87114>
- Matcaps: <https://threejs.org/docs/pages/MeshMatcapMaterial.html>;
  <https://unpkg.com/mesh-baked-material@1.0.4/README.md>
