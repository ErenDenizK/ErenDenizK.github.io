# Research: presenting About's photographs beyond the postcard (2026-10-11)

**Status:** current; three alternatives built and switchable on the live page (`/about/?photos=1|2|3`),
the postcard stays the default until the owner picks. Rests on the owner's words (brief log, 2026-10-11
evening): "try designs other than the postcard; it looks a little simple and cheap. I want a design that
would win a design award." Earlier research on the postcard itself: `2026-10-about-and-postcards.md`
(its table of techniques is not repeated here).

**How sure:** **V** = seen in a search result this session (link given). **R** = recollection of a
site or product the lead knows; direct fetches of most portfolio sites are refused by this container's
network, so those lines say only what is widely known. **D** = the lead's own design reasoning.
**M** = measured in this branch.

## 1. What award-level photo presentation does

| # | Pattern | Where | Sure | What it teaches |
|---|---|---|---|---|
| 1 | **Hover image reveal**: an image appears, follows or distorts under the pointer in a list or portfolio. | Awwwards inspiration: Thibaud Allie folio ([link](https://www.awwwards.com/inspiration/hover-image-reveal-thibaud-allie-portfolio)), Castor & Pollux ([link](https://www.awwwards.com/inspiration/hover-image-reveal-castor-pollux)), "image reveal" collections ([link](https://www.awwwards.com/inspiration/image-reveal)) | V | The reveal is the memorable moment; it must have a reason (here: a print developing, a loupe) or it is a trick |
| 2 | **Photography portfolio transitions**: the thumbnail grows into the full view, the page dims around it. | Awwwards, Mario Dragicevic portfolio ([link](https://www.awwwards.com/inspiration/photography-portfolio-transition-mario-dragicevic)) | V | A shared-element zoom (FLIP) keeps the eye on the photo; used in concept 2 |
| 3 | **WebGL displacement on hover**: one image melts into another through a displacement texture. | Codrops, "WebGL Distortion Hover Effects" ([article](https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/)); "Interactive WebGL Hover Effects" ([article](https://tympanus.net/codrops/?p=49069)) | V | Striking once; on a personal photo it changes the photograph for no reason. Rejected as decoration (§2) |
| 4 | **Fake 3D from a depth map**: a grey map (white near) shifts each pixel with the pointer, as Facebook's 3D photos did; the map may be painted by hand. Plain WebGL, no library. | Codrops, "How to Create a Fake 3D Image Effect with WebGL" ([article](https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/)); WebGL Fundamentals Q&A ([page](https://webglfundamentals.org/webgl/lessons/webgl-qna-drawing-2d-image-with-depth-map-to-achieve-pseudo-3d-effect.html)) | V | The basis of concept 3; the painted map is how it is done here (§4) |
| 5 | **Spatial Scenes (iOS 26)**: Photos separates subject from background with a generated depth map; the photo moves with the phone. | MacRumors ([how-to](https://www.macrumors.com/how-to/ios-3d-lock-screen-effect-spatial-scenes/)), AppleInsider ([tip](https://appleinsider.com/inside/ipados-26/tips/ios-26-how-to-view-2d-photos-as-3d-spatial-scenes-on-iphone)), Six Colors ([column](https://sixcolors.com/post/2026/06/i-keep-spacing-out-because-im-out-of-my-depth/)) | V | Depth is now an everyday photo feature, so a visitor reads it at once. Apple drives it by tilt; on the web tilt needs a permission prompt on iPhone, so concept 3 uses drag and scroll instead |
| 6 | **Portrait-mode refocus**: after the shot, tap a point and the focus plane moves there; aperture can be changed. | iPhone Photos editing | R | The tap that "pulls focus" in concept 3: a photographer's gesture, not a web effect |
| 7 | **Contact sheets**: the first print of a roll, marked with grease pencil; the photographer's choice made visible. | Magnum Contact Sheets, ICP exhibition ([page](https://www.icp.org/exhibitions/magnum-contact-sheets)), Magnum ([page](https://www.magnumphotos.com/?p=100478)) | V | Concept 2: the strip, the bracketed neighbours, the mark round the pick. Editors read sheets with a loupe (the loupe-mode in photo-culling tools comes from it: [forum](https://newsgroup.xnview.com/viewtopic.php?p=202474)) |
| 8 | **The darkroom print**: developer, stop, fix; the image appears in the developer tray in seconds, under a dim red safelight for black-and-white paper. | PetaPixel crash course ([article](https://petapixel.com/2018/03/06/make-bw-photo-print-darkroom-7-minute-crash-course/)), a college guide ([page](https://www.canterburycollege.ac.uk/news/developing-a-print-in-the-darkroom-a-simple-guide-for-beginners/)) | V | Concept 1. That highlights appear first is a design choice for a black page, not a claim about paper (on paper the dense shadows show first) |
| 9 | **Museum wall labels**: artist, title, date, medium, dimensions (height then width, or the support's size), a credit line; 70–80 words at most; near the work. | Museums & Galleries NSW ([guide](https://mgnsw.org.au/wp-content/uploads/2026/05/Exhibition-labelling.pdf)), STQRY ([guide](https://stqry.com/blog/museum-labels-guide/)), The Practical Art World ([examples](https://thepracticalartworld.com/2021/06/18/examples-of-artwork-labels/)) | V | Concept 3's label; concept 1's plate. Only true fields: the note as the title, the place, the photographer, the file's pixels (no camera line: EXIF is stripped and would be invented) |
| 10 | **Scroll-driven reveals**: `animation-timeline: view()` maps an element's passage through the window to an animation; Chrome 115+, Safari 18.4+; honour reduced motion. | CSSWG explainer ([page](https://drafts.csswg.org/scroll-animations-1/EXPLAINER.html)), a tutorial ([page](https://flaviocopes.com/css-scroll-driven-animations/)) | V | Concept 1 is driven by the photo's place in the window. Done in script (the WebGL needs the number), monotonic so a print never undevelops |
| 11 | **Cosmos, Are.na**: quiet boards, the image first, words beside. | Cosmos ([support](https://www.cosmos.so/support)), Are.na ([critique](https://ixd.prattsi.org/2025/02/design-critique-are-na-ios-app/)) | V | Words beside the photo, never over it, except where the over is the point (the safelight plate) |
| 12 | **Lomography, film culture online**: edge print, frame numbers, light leaks, the strip as a graphic. | lomography.com | R | Edge print and frame numbers carry "film" without a brand; light leaks were rejected in the earlier research (row 9 there) |
| 13 | **Ambient light from the picture** (artwork glow in players, "ambient mode" in video). | Common pattern | R | Concept 3's wall light; concept 2's enlarged view is lit by the photo's measured tone |

## 2. What was left out, and why

- **Displacement and liquid hovers** (row 3): they change the photograph to show off the code. A personal
  photo is evidence of a life; it should not melt (D).
- **Device tilt** (row 5): iPhone asks for permission (`DeviceOrientationEvent.requestPermission`) before
  a page may read it; a prompt on About is worse than no effect. Drag and scroll stand in (D, as the
  postcard's ADR-0008 amendment already decided).
- **Ken Burns drift, auto slideshows** (earlier research rows 11, 17): motion nobody asked for, next to
  reading text (D).
- **A gallery page or a lightbox carousel**: the owner asked for the photos to be spread through the page
  (2026-10-11 afternoon); every concept keeps one photo in its chapter's margin.
- **Heavy libraries** (three.js, GSAP): each concept is one small module (1.6–2.2 KB gzip, loaded only
  when it is chosen) and at most one WebGL 1 shader (M).

## 3. The three concepts

Each replaces the postcard in place, keeps the alt text, works by touch first, and has a still twin.
Light is colour in all three, differently: the safelight's red, the light table's warm white, the
photo's own light.

### 3.1 Darkroom (`?photos=1`)

The print **develops as it is scrolled into view**: black paper under a faint safelight; the developer
washes across it from one corner (alternating corners down the page), the highlights come up first, the
print is red-monochrome for a moment, then takes its colour; the liquid's edge refracts a little and
catches the light; a sheen slides off as it dries. How far it has come is set by where it stands in the
window and never goes back; what is drawn chases that with a short lag, so a quick scroll still shows it.
When done, the canvas hands over to the `<img>` (so the print is never softer than the file) and the
WebGL context is let go.

A **tap turns the enlarger off**: the print goes deep red under the safelight and its label is written
over it in light, letter by letter: the place in large Newsreader, the rest of the place in spaced
capitals, the note in italic, then "Frame 1932 × 2576 px" and "Light #569DE6" with a swatch: the colour
measured from the photo at build time. A second tap brings the light back. Enter and Space do the same;
the button reports `aria-pressed`.

Still twins: reduced motion or `?still` show the print developed, and the label crossfades in 180 ms;
without WebGL the print develops with a CSS filter; without JavaScript the postcard stands (the
alternatives exist only with the switch). Cost: one shader while developing, then none.

### 3.2 Proof (`?photos=2`)

A **strip of medium-format slide film on a light table**, the way a photographer chooses: the photograph
is the middle frame (6 × 4.5 is the photos' own 3 : 4); its neighbours, a stop under and a stop over, fade
out at either side; the film's edge print (frame numbers, "EDK 120") glows where the table's light comes
through; a grease-pencil box in the About gold is drawn round the pick when the strip comes into view.

A **loupe** lies on the strip. With a mouse it follows the pointer over the frame with a hand's lag and
returns to where it lay when the pointer leaves. On a phone it is **dragged by a finger** and stays where
it is left; only the loupe takes the touch (`touch-action: none` on it alone), so the page scrolls
everywhere else. Its lens shows the frame under its centre from the whole photograph (a new derivative at
the original's width), and never magnifies past that file's pixels at the screen's density (up to 2.4×;
about 1.9× on a 3× iPhone).

A **tap on the frame enlarges it**: a modal `<dialog>` (Escape, focus and the inert page are the
platform's); the frame flies out of the strip to the middle of the window (FLIP, 640 ms) while the page
goes dark and the photo's measured colour lights the room; its place, note and frame number stand
under it. A tap anywhere, Escape, the close button or a wheel sends it back.

Still twins: the loupe moves without lag and the view opens with a crossfade; the mark is drawn from the
start. Cost: no WebGL; the whole photograph (115–371 KB AVIF) loads only near the strip.

### 3.3 Depth (`?photos=3`)

The photograph as **a window**. A depth map per photo lets near things move against far ones: with a
mouse you look around by moving over it; on a phone by dragging sideways across it (`pan-y`, so vertical
drags still scroll), and the page's own scrolling moves the eye up and down as the photo passes, as
walking past a window does. A band of reflected light on the glass slides against the look; the photo's
own light, a blurred copy behind it, warms the wall more as it nears the middle of the window.

A **tap pulls focus**: the plane under the finger stays sharp, the others soften (a 16-tap golden-angle
disc, at most 6 device pixels), and a thin gold ring closes in where focus was set, as a camera shows it;
a second tap on the same plane opens it all sharp again. From the keyboard, Enter or Space steps through
near, far and all. A **museum label** stands under it: the note as the title in italic, the place, "Photograph
by" the owner, the file's pixels, the hint on the first one.

The depth maps (`tools/photos/depth.py`, 8–12 KB PNG each) are painted from planes read off each photo
(the sky, the ground to the horizon, the near things: the kitten and the wall; the billboard, mast and
platform; the lens's rim) and snapped to the photo's edges with a guided filter. No depth model could be
run here (the model host is out of this container's reach, checked 2026-10-11), so a new photo needs a
new recipe, or a model run elsewhere.

Still twins: reduced motion or `?still` shows the photograph still and sharp (no focus control);
without WebGL the whole photo moves a little behind its glass and focus is not offered. Cost: one shader
while the photo is near the window; the context is dropped when it scrolls away.

## 4. Measured (M)

- About's first paint: 192.6 KB of the 200 KB budget with all three templates in the page (HTML gzip
  44.7 KB, of which the templates are about 3 KB). The concept scripts are not in the first paint: each
  is a 1.6–2.2 KB gzip chunk loaded only by `?photos`.
- New files: three depth maps (31 KB together) and the whole photographs (AVIF 115–371 KB, WebP
  148–590 KB), loaded only by concept 2 (loupe, enlarged view).
- No horizontal overflow at 320–1920 px for any concept; no photograph drawn past its pixels at 3×
  (tests in `tests/e2e/about.spec.ts`); axe finds no serious or critical issue on any of them.

## 5. Recommendation

**Proof (2)**, with Darkroom (1) a close second.

- Proof is the only one that makes the photos **bigger** (the enlarged view) and lets a visitor **look
  closer** (the loupe), which is what a photo frame is for; its touch interaction is the cleanest (a
  finger on a real object, never fighting the scroll); it needs nothing per photo, so adding a fourth
  photo stays a content change (ADR-0002); and it costs no WebGL.
- Darkroom has the strongest first impression (the print appearing as you reach it, the label in light)
  but after that the print is a still photograph; its moment is once per visit.
- Depth is the most technically striking and the focus pull is a delight, but every new photo needs a
  painted depth map, and a careful look finds the paint's seams (the courtyard's lens rim). Not
  recommended as the default; it could return when a depth model can run in the build.

A combination is possible and cheap: Proof's strip whose frame **develops** the first time it comes
into view (Darkroom's shader on the pick only). If the owner picks one, the switch, the unpicked
components and their tests are removed, the hint strings move into `content/site.json`, the "Photos"
chapter's words ("as postcards... turn one over") are rewritten, and ADR-0008 gets an amendment.
