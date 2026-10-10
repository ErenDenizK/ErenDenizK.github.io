# Study: should desktop go back to real-time 3D? (2026-10-10)

> **Status:** current (2026-10-10): stutter diagnosis and real-time 3D study; the owner decides (PLAN track 7). Scratchpad paths cited below are scratch, not kept.

## Özet (sahibi için, sade dil)

1. Takılma hissi gerçek ve ölçtük. Ana neden 3D olmaması değil: boşta dönen video, 2 derecelik
   fotoğraflar arasında **karıştırılarak** üretilmiş. Saniyede ~4 kez netleşip bulanıklaşıyor
   (kenarlar çift görünüyor), göz bunu "minik sıçramalar" olarak algılıyor.
2. Ek nedenler: video saniyede 30 kare; imleci bırakınca nesne kendi kendine küçük bir adım daha
   atıyor, ~1 sn sonra keskinleşiyor, 4 sn sonra başka bir pozdan videoya geri dönüyor.
3. Gerçek zamanlı 3D, akıcılık sorununu çözer ama camı yine "mavi plastik" gibi gösterir
   (aynı nesnede yan yana çektik). Sayfaya ~210 KB ek kod ve ekran kartına sürekli yük getirir.
4. Güçlü bir masaüstünde (ör. M1 veya Iris Xe) tek nesne 60 fps dönebilir (tahmin); fan ve pil
   etkisi videoya göre belirgin şekilde daha fazla olur (tahmin).
5. Önerimiz: şimdilik önceden render edilmiş görüntüde kalmak, takılmanın nedenlerini düzeltmek
   (karıştırılmış videoyu kaldırmak, hazır "canlı motor"u varsayılan yapmak, eğilme ızgarasını sıklaştırmak).
6. Maliyeti: birkaç gün kod, bir gece render, nesne başına ~0.3–0.5 MB daha fazla indirme.
7. Gerçek zamanlı 3D'yi tek nesnede (edk) ayrı bir deney olarak tutabiliriz; özel bir cam
   gölgelendirici ile Cycles'a yaklaşma şansı var ama bu araştırma işi, garanti değil.
8. Senden iki bilgi lazım: hangi bilgisayar ve tarayıcıda baktın, adresin sonunda `?live` var mıydı?

Evidence marks used throughout: **[M]** measured here in this container, **[C]** cited (source
linked or read in code), **[E]** estimate (reasoning shown, not measured). Browser numbers come from
headless Chromium 1194 (Playwright 1.56.1) on 4 CPU cores with **no GPU**: WebGL runs on
SwiftShader (`ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))`), a software
rasteriser. CPU-side JavaScript times are meaningful; GPU and frame-rate numbers are not
representative of any laptop or phone, and are used only as relative costs.

## 1. Why the current objects stutter

### 1.1 What is shipped (default path, no `?live`) [M]

`ffprobe -count_frames` on `media/objects/*/` and the manifests:

| Media | Frames | Rate | Duration | Made from | edk AV1 / H.264 |
|---|---|---|---|---|---|
| Lean grid | 17 yaw × 3 pitch = 51 stills, at 2° yaw / 4° pitch | (scrubbed) | | Cycles | half 205 KB, full 524 KB (AVIF) |
| Idle loop (desktop and phone) | 180 | 30 fps | 6 s | **bilinear blends of grid frames** (`encode.py` 656–675) | 203 / 255 KB |
| Spin loop (edk only, phones) | 120 (78 rendered) | 30 fps | 4 s | Cycles | 281 / 230 KB |
| Interaction clip | 30 (edk), 42–45 (others) | 30 fps | 1.0–1.5 s | Cycles | 82 / 108 KB |
| Droplet out / in | 24 each | 60 fps, played at 0.4/0.35 speed-up | 0.35 s on screen | Cycles | 86 + 84 KB |

All six objects follow the same pattern (Recto, English Prep, Eat Map, Record, Log: idle 180
frames at 30 fps, interaction 42–45 frames at 30 fps, droplets 24 frames).

### 1.2 Causes, strongest first

**1. The idle loop is a crossfade, not motion [M].** The idle is a figure-of-eight through the
grid (yaw ±8°, pitch ±3°), and each of its 180 frames is a weighted sum of the four nearest grid
renders. A blend of two poses 2° apart does not show an in-between pose: it shows both poses at
once, the edges doubled, and then the next pose sharpens up. Measured on the decoded edk idle
(H.264, every frame):

- Edge sharpness (Laplacian variance over object pixels) swings between 161 and 645, a **4:1
  pulse**, with 31 local minima in 6 s. The real-rendered spin varies only 2:1, the interaction
  clip 1.3:1.
- The pulse follows the blend weight: correlation 0.88 between sharpness and the largest of the
  four weights. Only **8 of 180 frames** have one pose at ≥ 90 % weight; the median frame is a
  53/47 mix.
- The nearest pose changes 24 times per loop, **4 times per second**. Peak yaw speed is 8.4°/s,
  so the object reaches a new rendered pose about every 7 video frames and blurs in between.

The eye tracks a slowly moving object (smooth pursuit) and expects edges to slide; here they
fade between fixed positions about four times a second. That reads exactly as "tiny stuttering
movements". Recto (68–325) and Record (77–373) show the same 4–5:1 pulse.

![idle frames 0, 1, 3: the k's arm doubles as the blend moves away from an exact pose](../3dperf/stutter/idle-ghosting.png)
![sharpness per frame: idle (blue) pulses, spin (green) does not](../3dperf/stutter/sharpness.png)

**2. The lean is the same crossfade, driven by the hand [C, code].** `media.ts` `draw()` sums
the four nearest **half-size** frames with `lighter`; moving the pointer across half the window
sweeps about 8 grid cells, so the same sharp/ghost pulse appears under the hand, plus softness:
on a DPR 2 screen the 404 px half frame is drawn about 1.8× enlarged. The bake-off measured the
error of a 2° midpoint blend at MAE 14.6 levels against the true pose (render bake-off, grid
density table).

**3. The object moves by itself after the hand stops [M + code].** 300 ms after the last
pointer move, `tick()` snaps the target to the nearest grid cell (up to 1° yaw or 2° pitch) and
the follow spring travels there; then the full-size frame replaces the half-size blend.
Measured at 1440×900 DPR 2: the canvas kept redrawing for 41–958 ms after the pointer rested,
and the first full-size frame appeared **958 ms** after rest, a visible sharpness step. After
**4.48 s** the layer drops `seq-on` and hands back to the idle video, which is at whatever pose
its loop has reached (the liveliness study measured jumps of 8–12° into the lean and 24.4° back
to the idle, crossfaded over 200 ms).

**4. 30 fps on 60/120/144 Hz screens [M + C].** Chromium presented the idle at one new frame
per callback with a 33 ms media step [M]; each frame is held for 2 refreshes on 60 Hz, 4 on
120 Hz, and an uneven 5/5/4 pattern on 144 Hz (judder). The lean canvas, by contrast, updates at
display rate, so switching between them also changes the motion cadence.

**5. Hidden work [M].** While the lean canvas is shown, the idle video keeps playing underneath
at opacity 0 (`totalVideoFrames` kept rising through the lean phase). On a real machine this is
hardware decode and cheap, but on Chrome for M1/M2 Macs AV1 is decoded in software (no AV1 block
before M3 [C, render bake-off]); it competes with the page for CPU. Not a cause by itself.

**6. Interaction and droplet clips [C, liveliness study].** The interaction clip starts at the
centre pose whatever the lean (a ~2° jump at start and end) and cannot reverse; droplets play at
~69 fps effective rate, so a 60 Hz screen drops about one frame in eight during the 350 ms melt
(minor).

Headless frame pacing while the pointer circled (rAF p50 100–183 ms) is starved by software
AV1 decode plus SwiftShader and says nothing about a real desktop; it is reported only so it is
not mistaken for a finding. Not measurable here: what the owner's display refresh rate, browser
and GPU actually do. **The live frame engine (ADR-0009, `?live`) already removes causes 3–6**:
one WebGL2 canvas, no idle video, float as a sub-pixel move of an exact frame (no ghosting),
springs instead of mode switches. It still blends half-size frames while leaning (cause 2).

## 2. Real-time proof: edk in three.js

### 2.1 What was built [M]

`scratchpad/3dperf/rt/` (served by `3dperf/serve.mjs`):

- **Model:** `edk.glb`, the committed meshopt GLB from `tools/objects/edk.py` (34.6 KB; 6,044
  triangles; `KHR_materials_transmission` + `volume` + `clearcoat`). A fresh export from the
  current master with the Blender 5.2 venv (`edk.py --no-render`) gives the same geometry
  (34.6 KB, stage camera within 2 %).
- **Renderer:** three.js **0.180.0** (pinned, the copy already installed offline in
  `obj3d/node`), `WebGLRenderer` with MSAA, `MeshPhysicalMaterial` transmission/thickness/IOR
  from the GLB, double-sided glass for back faces.
- **Light:** `prototypes/e-dark/objects/rig.js` copied unchanged: the poster's studio HDRI
  (embedded, PMREM-filtered), warm key, accent rim, Khronos PBR Neutral tone mapping, a backlight
  plane seen only by the transmission buffer, VSM key shadow and a blurred contact shadow
  (`?shadow=0` drops both).
- **Motion:** pointer lean ±16° yaw / ±4° pitch (the grid's arc) on ADR-0009's spring (k 70,
  ζ 0.72), rendering only while the spring moves.

### 2.2 Payload [M]

| Asset | Raw | gzip -9 | brotli 11 |
|---|---|---|---|
| JS bundle (three core + module, GLTFLoader, meshopt decoder, rig.js, page), esbuild minified | 791 KB | **210 KB** | 172 KB |
| of which three.js alone (`three.core.min.js` + `three.module.min.js`, r180) | 720 KB | 179 KB | |
| WebGPU build instead (`three.webgpu.min.js` + core) | 961 KB | ~260 KB | |
| edk.glb | 34.6 KB | 21.8 KB | 20.4 KB |
| HDRI (embedded in rig.js as base64; `studio.hdr` is 10.7 KB) | in the bundle | | |

three.js does not tree-shake much: the r180 split build costs more than the ~142 KB the
bake-off recorded for r170 E. For comparison, the shipped Home fetches **782 KB** of object media
in its first 5 s (two objects: posters, edk and Recto lean grids, the edk idle) [M].

### 2.3 Time to first visible object [M, local server, SwiftShader]

| Stage | Real time (DPR 1 / 2, shadows on) | Shipped site (DPR 2) |
|---|---|---|
| First paint of the object | first WebGL frame **1.0–1.4 s / 1.6–3.5 s** after navigation | poster is the LCP: **~300 ms** (FCP ~200 ms) |
| Of which: module evaluated | 38–68 ms | |
| Rig (HDR decode + PMREM) ready | 105–190 ms | |
| GLB loaded and parsed | 130–340 ms | |
| First frame (shader compile + raster) | the rest; dominated by SwiftShader raster here | |
| Interactive | same as first frame | lean grid ready ~550 ms, idle video ~780 ms |

On a real GPU the first frame would be dominated by compiling about 11 shader programs
(MeshPhysical with transmission is the largest); **[E] 100–400 ms** on a desktop, longer on
first visit on Windows (ANGLE/D3D) and on phones. Over a network, the 210 KB of JS is the gate:
**[E] ~0.3 s on fast broadband, 1–2 s on a 4G phone**. Either way it must sit behind a poster,
as ADR-0005 item 5 already required.

### 2.4 Frame cost [M, SwiftShader; relative only]

40 frames of the lean in motion, 600×600 CSS canvas, median of 3 page loads:

| Setting | JS submit per frame (real CPU cost) | Submit + wait for SwiftShader | Draw calls |
|---|---|---|---|
| DPR 2 (1200²), shadows on | 1.7–2.6 ms | 1.1–1.65 s | 10 |
| DPR 1 (600²), shadows on | 1.6–1.8 ms | 0.53–0.55 s | 10 |
| DPR 2, shadows off | 1.1–1.3 ms | 0.76–0.87 s | 9 |
| DPR 1, shadows off | 1.1 ms | 0.26–0.33 s | 9 |

The JS cost (~1–2.6 ms) is fine on any desktop. For relative scale on the same software
renderer: the frame engine proof drew a 1040² canvas in 117–150 ms and prototype E's full scene
took 3.6 s (liveliness study §4), so real-time glass costs **~5–10× the frame engine per frame**
here, and E's whole-page scene was another ~3× on top.

### 2.5 Look [M]

![Shipped Cycles poster (left) vs real time (right), centre pose](../3dperf/rt/compare-centre.png)
![Cycles grid frame at yaw +8 (left) vs real time at yaw +8 (right)](../3dperf/rt/compare-yaw8.png)

Seen: the real-time letters read as **solid frosted blue plastic or anodised metal**: bright,
even faces, no see-through, no inner edges refracted through the front, no total internal
reflection, no bright caustic-like streaks on the k and d stems. The Cycles frames read as
clear thick glass. Scores against the shipped media: MAE 47.5 levels / SSIM 0.90 (centre vs
poster), MAE 40.7 / SSIM 0.70 (yaw +8 vs grid); **these mix material and framing** (the shipped
poster frames the letters differently from the GLB's stage camera, and a 2D box alignment cannot
undo a perspective difference), so the trustworthy quality number remains the bake-off's
matched-camera result: **edk SSIM 0.49, Recto 0.82** against Cycles, and a tuned ceiling that
does not close the gap [C, render bake-off].

### 2.6 Why it cannot look like Cycles, from the code [C]

three.js r180 `WebGLRenderer.renderTransmissionPass`
(<https://github.com/mrdoob/three.js/blob/r180/src/renderers/WebGLRenderer.js>, lines 1849–1960
in the installed copy) renders, **every frame**: the background and **opaque objects only** into
a viewport-sized, 4× MSAA, half-float render target; resolves it and builds a mip chain; then
renders the **back faces** of double-sided transmissive meshes into the same target, resolves and
mips again; only then the main pass, where each glass pixel samples that buffer once, offset by
thickness and IOR. So:

- glass sees opaque things and its own back faces, **never other glass and never itself twice**;
  there is no multi-bounce path and no internal reflection (forum confirmation:
  <https://discourse.threejs.org/t/multi-layered-transmission/43634>,
  <https://discourse.threejs.org/t/objects-with-transmission-not-showing-objects-behind/47113>);
- the scene is drawn about **2–3 times per frame** plus two MSAA resolves and two mip chains,
  and the per-pixel physical shader is the heaviest built-in material (three.js docs:
  <https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial>; cost scales with the screen
  area of glass: <https://discourse.threejs.org/t/meshtransmissionmaterial-poor-performances-urgent/68566>,
  <https://drei.docs.pmnd.rs/shaders/mesh-transmission-material>);
- toggling `material.side` for the back-face pass sets `needsUpdate` twice per frame per glass
  mesh, a small CPU cost seen in the 1–2.6 ms submit time.

## 3. Comparison for the owner

| | Pre-rendered today | Pre-rendered, stutter fixed (option a) | Hybrid (b) | Full real time (c) |
|---|---|---|---|---|
| **Extra payload, desktop, edk** | 782 KB Home media (2 objects) [M] | +0.3–0.5 MB per object for a 1° yaw grid and a real-rendered idle [E, from §4] | today's poster + 210 KB JS + 22 KB GLB [M], grid optional | 210 KB JS + 22 KB GLB per first object, ~20–40 KB per further GLB [M/C] |
| **First visible object** | ~300 ms poster [M] | same | same poster; real time takes over after idle, [E] 0.5–2 s | needs a poster anyway; WebGL frame [E] 0.3–2 s after it |
| **Smoothness** | 30 fps clips, 4 Hz sharp/ghost pulse, mode switches [M] | display rate (engine), exact frames at rest, ghosting halved or gone [E] | display rate, any angle; a visible material change at the handoff | display rate, any angle, true per-part physics |
| **Input latency** | lean starts next frame; clip 190 ms+ (fetch) [C, liveliness] | next frame; state axes reversible [C, ADR-0009] | next frame once live | next frame |
| **Glass quality** | Cycles: refraction through layers, TIR, caustic-like highlights, denoised, no noise | same | Cycles at rest, plastic-looking glass in motion (SSIM 0.49 edk) | plastic-looking glass always; no glass-behind-glass [C] |
| **Battery / heat** | hardware video decode, [E] ~0.1–0.3 W; idle loop never stops today | engine stops after 60 s without input; [E] lower than today | as (c) while live | continuous full-canvas rendering while visible, [E] 1–3 W on an integrated GPU, fans on thin Windows laptops |
| **Intel Iris Xe (~2.1 TFLOPS, Time Spy GPU ~1,560 [C])** | fine | fine | [E] 60 fps for one object at 1200², 3–8 ms/frame; tuned D look (SSAA ×4 ≈ 3.2× cost [C bake-off]) would miss 60 fps | same as hybrid |
| **Apple M1/M2 (~2.2× Iris Xe in Steel Nomad Lite [C])** | fine (HEVC on Safari) | fine | [E] 60 fps, 2–5 ms/frame; 120 Hz ProMotion at DPR 2 is tighter | same |
| **Discrete GPU** | fine | fine | trivial | trivial |
| **Phones** | poster, spin/idle video; Low Power Mode refuses `play()` | engine gives life without video (ADR-0009 phone tier) | not offered | owner already rejected ("feels heavy"); thermal throttling within minutes [E] |
| **Safari** | AV1 only on M3/A17 Pro+, HEVC otherwise [C bake-off] | same | WebGL2 fine; WebGPU since Safari 26 (Sept 2025) [C] | same |
| **Firefox** | ignores colour tags; works | works | WebGL2 fine; WebGPU only on Windows since 141 (July 2025) [C] | same |
| **Reduced motion / no WebGL** | poster only | poster only (engine tier "still") | poster only | poster only (needs the full pre-rendered poster pipeline anyway) |
| **Cost to build** | done | 2–4 days code + one night of renders | 1–2 weeks + handoff tuning per object | 2–4 weeks for six objects, plus a new look the owner must accept |

Sources for the cited GPU and browser rows: Notebookcheck Iris Xe G7 96EU
(<https://www.notebookcheck.org/Intel-Iris-Xe-G7-96EUs.553987.0.html>, Time Spy Graphics median
1,562); NanoReview Iris Xe vs M1 8-core
(<https://nanoreview.net/ru/gpu-compare/intel-iris-xe-graphics-g7-96eu-vs-apple-m1-gpu-8-core>,
2.2× in Steel Nomad Lite); WebKit's Safari 26 WebGPU announcement as relayed at
<https://discuss.privacyguides.net/t/news-from-wwdc25-webkit-in-safari-26-beta/28226.md>;
Mozilla's Firefox 141 WebGPU post as relayed at
<https://simonwillison.net/2025/Jul/16/webgpu-firefox> and
<https://linuxiac.com/webgpu-lands-in-firefox-141-on-windows-eyes-linux-and-macos-next/>.

How the GPU estimates were made [E]: at 1200² about 30 % of pixels are glass; front and back
faces give ~0.9 M physical-shader invocations per frame at a few hundred operations each
(~0.3–0.5 GFLOP), plus ~40–60 MB of render-target traffic (MSAA half-float resolve, two mip
chains, shadow and contact-shadow passes). At a realistic 20–30 % of peak ALU and 40–60 GB/s
of shared memory bandwidth, that is 2–8 ms on Iris Xe or M1. WebGPU would not change the
look (same algorithm in `WebGPURenderer`) and costs ~50 KB more JS.

## 4. Options

### (a) Keep pre-rendered, fix the stutter (recommended now)

What the visitor sees: the same Cycles glass, moving at display rate, never ghosting at rest,
no jumps between idle, lean and clip.

1. **Make the live engine the default on desktop** (ADR-0009 is built behind `?live`, 10 KB
   gzip): removes the idle video, the 4.5 s hand-back, the hidden decode and the clip jumps.
   Owner A/B first. Cost: 1 day plus a real-device check of the watchdog.
2. **No blended idle.** At rest the engine floats an exact frame (sub-pixel move, no ghost). If
   the owner wants the object to turn while idle, render that turn in Cycles like edk's spin
   (180 real frames ≈ 75 min edk, 30 fps; [E] 300–420 KB AV1) instead of blending the grid.
3. **Halve the grid step in yaw** (1°: 33 × 3 = 99 frames): +48 renders (edk ≈ 20 min, Recto
   ≈ 63 min [C, bake-off per-frame times]); bytes about double (edk full 524 KB → ~1 MB, half
   205 → ~400 KB [E]); the midpoint ghost falls from MAE 14.6 toward ~8 [E, extrapolated from
   the 2°/4°/8° series]. Optionally render 1° only for the middle pitch row (+16 frames).
4. **Gentler settle:** snap to the nearest cell only when the spring is already within a
   quarter cell, and preload the full-size frames of the current row so the sharpness step at
   rest disappears (the decode LRU already allows 30).
5. **60 fps interaction clips** (render ×2, [E] +40–60 % bytes) if 30 fps judder is still seen
   after 1–4.
6. Later, research: depth/normal-guided warping of the nearest frame instead of crossfading
   (the normal pass already exists); good for ≤ 1° offsets, unproven on glass.

Risks: more bytes per object; a night of renders per change; the arc stays ±16°.

### (b) Hybrid: poster first, real time takes over on capable desktops

What the visitor sees: the Cycles poster, then after ~1 s the object switches to real-time
glass that turns freely. The switch is visible: the material changes from clear glass to
frosted plastic (SSIM 0.49 between the two looks on edk, matched camera [C]). The liveliness
study already rejected handing Cycles to real time for this reason, and the eye notices most
exactly when motion stops. Cost: 1–2 weeks (loader, capability gate, the existing tier and
watchdog, per-object tuning from bake-off D). Variant: make the real-time look the one look on
desktop (poster rendered by three.js, so no handoff), which gives up the Cycles quality the brief
sets as the bar.

### (c) Full real time

What the visitor sees: free rotation, true per-part physics (E's letter hops, the pin's
bounce), plastic-looking glass, and on phones either the same (rejected by the owner, brief
2026-10-09) or pre-rendered media anyway, so the Blender pipeline stays. Cost: 2–4 weeks; risks:
fans and battery on laptops, shader-compile hitches on first visit, Safari/Firefox WebGPU still
young, ADR-0006 reversed.

### (d) Experiment worth one object: custom glass shader for edk

Extruded letters are simple enough to ray-march as a signed distance field in one fragment
shader, with real refraction in and out, a few internal bounces and total internal reflection,
lit by the same HDRI. That is the only real-time route that could approach the Cycles look for
edk. [E] 1–2 weeks of research, uncertain result, GPU cost likely above three.js transmission;
not for Recto's layered pages. Worth a scratch prototype only if the owner wants free rotation
of the Home mark badly enough.

### Recommendation

**(a), in the order above, then decide on (d) with the owner.** The stutter has measurable
causes inside the pre-rendered pipeline (crossfaded idle and lean, 30 fps, mode switches,
the settle snap), and the engine that removes most of them already exists behind a flag.
Real-time 3D would fix smoothness but would bring back the look the owner rejected, and it adds
210 KB of JS and continuous GPU load. Before any work: ask the owner which machine and browser
they saw the stutter on (refresh rate matters), and whether `?live` was on.

## Files (session scratch, not committed)

`scratchpad/3dperf/`: `serve.mjs` (range server: `/Portfolio/` = repo `dist/`, `/3d/` = this
folder); `stutter/clips.py` + `clips.json` (per-frame sharpness and motion), `idle-ghosting.png`,
`sharpness.png`, `site.mjs` + `analyze.mjs` + `site-{1,2}x.json` (shipped Home timeline),
`load.mjs` (first paint and bytes); `rt/` (`main.js`, `index.html`, `rig.js`, `edk.glb`,
`dist/main.js` built with esbuild from three 0.180.0), `rt-measure.mjs` + `rt-measure.json`
(load and frame times, 4 settings × 3 runs), `compare.py`, `rt/compare-*.png`, `rt/shot-*.png`;
`glb/edk.glb` (fresh export from the current master). Repo untouched.
