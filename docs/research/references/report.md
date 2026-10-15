# Reference research: complete findings (2026-10-12 to 2026-10-14)

> **Status:** final. The complete record of the design research done for Eren Deniz Kuyucaklıoğlu's
> portfolio on the owner's computer: what was studied, what was measured, what the owner liked and
> why, what research says, and the conclusions that follow. It is evidence for the portfolio's
> development, not a decision. The Turkish edition of the same report is `rapor.html`; images are in
> `img/`, measurements in `data/`.

**How sure:** **M** = measured in Chrome by script. **O** = the owner's own words (picker notes or
dictation). **R** = research with sources (`data/research-sources.md`). **D** = the reviewer's reasoning.

## Summary

1. **Five studies in three days.**
   - 29 sites were measured first.
   - Three agents then gathered award winners and widely praised sites into a 127-site picker, where the owner voted on and annotated 31.
   - The 12 most loved sites were taken apart end to end.
   - Separately, the study measured CV-like home pages (13) and gallery-to-page transitions (14 galleries probed).
2. **The owner's taste.**
   - Hiring comes first.
   - Home is short, direct and CV-like, with no intro showpiece.
   - Work is rich, interactive and product-like.
   - Products are explained step by step, and by selling the user.
   - Loved most: Shopify Editions and Dia.
3. **The loved product pages share one skeleton (M):** a promise line, one idea per section and a fixed index. Motion is short and consistent (UI 150–300 ms, scenes 400–1000 ms). Text and ground are never pure black or pure white.
4. **CV-like personal home pages (M)** are 1.1–2.8 screens long, set in one narrow column (600–670 px), and always in the same order: name and role, today, work, writing, now, links.
5. **The Work transition the owner described** ("the image flows into its own page") is Robin Noguier's (M). It is a shared-element transition: 1.4 s to open, 1.6 s back, with no page reload.
6. **Liked-site dossiers.** Each of the 16 sites the owner liked or praised has a detailed dossier (`liked-sites.md`, Turkish `begenilenler.html`): a first analysis, short clips, the page flow, and values read from its CSS (fonts, type scale, colours and variables, layout, spacing, radii, effects, motion durations and easings, breakpoints).
7. **Research (R).** A recruiter's first scan takes about 7.4 s, and 74% of viewing time is spent in the first two screens. "Make the user awesome" comes from Kathy Sierra.

## Method

- **Viewports:** desktop 1440×900 at 1×; phone 390×844 at 2× with an iPhone user agent (Chromium, not real Safari). Playwright drove the installed Chrome on the owner's computer.
- **Captures:**
  - the first screen and telling scroll positions
  - the first 3 s after first paint (10 fps) and a wheel-scroll recording
  - for the 12 loved sites, the whole page scrolled stop by stop
  - for 4 galleries, the transition recorded from the click onwards
- **Measures:**
  - fonts actually loaded, and the full type scale (size, weight, line height, tracking)
  - line length
  - colours and CSS colour variables
  - every transition and animation with its duration and easing
  - libraries (GSAP, Lenis, Three.js…)
  - page length and section structure
  - words on the first screen
  - arrival time (when frames stop changing) and colour clusters on screen
- **Privacy:** emails, phone numbers and "mail me" lines were blurred in the page before capture, and scrubbed from the measurement files. No logins, no form submissions, no cookie consent (banners were only hidden).

## The owner's criteria (O)

From the owner's dictation of 2026-10-12 and the picker notes; the 2026-10-14 items are the owner's
views in their own hedged words, not decisions. Decisions are made later, in the portfolio project.
The full dated text (Turkish) is `data/owner-criteria.tr.md`.

1. **Hiring first.** Home answers "why hire this person?" at first glance: what they know, what they
   built, what they focus on. Second reader: someone the owner just met ("so this is what you do").
2. **Readable and direct.** No fluffy self-description; short, exact sentences. Not monotonous; it
   should not tire the eyes; every scroll should make you curious about the next.
3. **Home simple and CV-like; Work rich.** Home is simple and explanatory; Work is interactive,
   animated and product-like, because the visitor has chosen to look deeper (2026-10-12).
4. **Products are sold step by step, and through the user.** Present what the user can now do, not
   only what the product does (Dia: "More than a browser. A better workday.").
5. **2026-10-14 views (not decisions):**
   - Home: "I want the clarity of the simple one-page sites" plus Dia's "this is me". The owner is
     "not sure whether it should be long or short, but it should be more compact". It might be built "strip by strip, I think",
     and the work section could redirect to Work.
   - On a big opening moment, or even a 1–2 s showcase that shrinks away: "I don't think it fits at all". For
     a recruiter, "something more direct might be better".
   - Work: on click the image opens smoothly and completes into its own page, without feeling like a new
     page. "I'd probably want something like that for Work" (Robin Noguier was mentioned).
   - Light-theme toggle: "probably doesn't fit the site's structure"; different section grounds are
     possible; "leaving this to the portfolio might make sense".
   - A short "now" section: "could be, of course".

## The owner's votes (O)

31 sites marked in the picker: 15 liked, 16 disliked. Notes are the owner's own words, in Turkish, unedited.

| Site | Vote | Note |
|---|---|---|
| Anime.js | like | çok güzel basit bir akış adım adım ürünü açıklıyor tek bir referans etrafında kendini çeşitlendiriyor güzel, biz de ürün showcaselerken kullanabiliriz |
| Anthony Fu | like | çok temiz kendini açıklıyor ben buyum bunları yapıyorum harika |
| Antoine Wodniack | like | renk göz yoruyor ama animasyon yazı ve font, work'ün sunuluş biçimi baya güzel bir showcase |
| Arc | like | bence biraz daha sönük ama minimalist ok |
| Dia (The Browser Company) | like | BAYILDIM minimalist harika bir özet, ürünü harika tanıtıyor ve gösteriyor asla sıkıcı değil, animasyonlar ve genel sunum adım adım çok basit ve açıklayıcı ürünü güzel pazarlıyor |
| Exat (Hot Type) | like | çok güzel ama bizimle alakası pek yok |
| Jakub Krehel | like | ilk sayfa çok sade spark diyebileceğim bir hissi yok ama işleri projeleri ve yazılarının içeriği ve sunumu baya güzel ve ilham verici, sadece tek siyah beyaz bence göz yorucu |
| Jhey Tompkins | like | hiçbir şey içermiyor ama sadelik ve şıklık var nötr'üm ama hitap etmiyor |
| Mathis Biabiany | like | yavaş ve kötü optimizasyon ama arka planda yaptığı ve özellikle 3d işleri inanılmaz iyi duruyor ama bizlik bir yanı şuan yok |
| Maxime Heckel | like | çok bir havası yok, tüm işlerini sunuyor ve güzel güzel açıklıyor ama üzerine çok da okumak için bir sebep vermiyro çok teknik kalıyor |
| Notion Calendar | like | basit güzel akıcı anlatıyor |
| Playdate (Panic) | like | renk tasarım canlı göze çarpıyor bakması stili güzel |
| Robin Noguier | like | ilk sunum ve sunumdan içeriğe geçişi çok akıcı bayıldım, ama birkaç şeyi sunuyor ama kendisini sunmuyor, portfolyo'nun kendisi için değil ancak work kısmında iş görebilir |
| Shopify Editions, Renaissance | like | BAYILDIM, sunum aşırı güzel animasyonlar ve görseller mükemmel, hiçbir noktada sıkıcılarşmıyor harika bir kompozisyon harika bir akış renk okunabilirlik propozisyon animasyonlar harika bayıldım |
| Stripe | like | — |
| Bruno Simon | dislike | kötü |
| Bézier | dislike | bize hitap etmiyor |
| Chungi Yoo | dislike | avaraj |
| Cowboy | dislike | bize hitap etmiyor |
| Craig Mod | dislike | okunaksız ve ucuz |
| Cyd Stumpel | dislike | konsept güzel ama eski kaldı pek modern değil |
| Daylight Computer | dislike | yorucu uzun uzun, hızlı ve açık değil |
| Eduard Bodak | dislike | güzel gösteriyor ama iyi açıklamıyor |
| Frank Chimero | dislike | oki ama bizlik değil vasat |
| Henry Heffernan | dislike | ok ama bizle alakası yok |
| Jesse Zhou | dislike | evet uzun sürüyor vakit alıyor |
| Josh W. Comeau | dislike | göz alıcı bir tarafı yok |
| Louis Paquet | dislike | basitliği güzel her şey açık ve net, ama işlerini görebilmek için teker teker yüksek bütçeli sayfalar açmak optimal bir yol değil |
| Lynn Fisher | dislike | — |
| Merouane Bali | dislike | bu yoldan vazgeçtim güzel ama çok bir hiring ya da pazarlama noktası yok, sanırsam kendini iyi hızlı efektif ve modern pazarlama tanıtma çok önemli |
| Scout Motors | dislike | render'ları kötü ucuz ve cilasız hissettiriyor |

## Research (R)

- Recruiters' first résumé screen: about 7.4 s (Ladders eye-tracking, 2018; industry study).
- 57% of viewing time is above the fold and 74% within the first two screens (NN/g 2018). Full-screen
  heroes can make a page look finished ("illusion of completeness"): let the next section peek in.
- Hiring managers want 3–5 deep case studies: problem, role, constraints, decisions, result (NN/g
  survey of 204 managers, UX roles).
- Body 15–25 px, 50–75 characters per line; on dark grounds avoid pure black and pure white
  (Material: #121212, text at 87%).
- "Make the user awesome" (Kathy Sierra); "show the fireball-throwing Mario, not the flower" (Samuel
  Hulick); "people buy better versions of themselves" (Zander Nethercutt).

## Study 1: 29 sites, first measurements (M, 2026-10-12)

Personal brands, product pages and photography sites, each captured at desktop and phone size; overview image `img/study1-29-sites.webp`; per-site measurements in `data/study1-29-sites/`. "Fits" and "does not fit" are the reviewer's judgement against the portfolio's character (dark, quiet, precise, premium, light as colour, pre-rendered glass, restraint over spectacle).

### Personal brand: the home page of a person

Measures read desktop / phone. **Type:** largest visible type and body size in px. **Line:** median
characters per line of body paragraphs. **Fill:** share of the first screen that is not the background
colour. **Media:** share of the first screen covered by images, video or canvas. **Tones / acc.:**
colour clusters covering at least 1% of the screen / saturated accents. **Arrival:** how long the entrance motion lasts
after first paint ("loop" means something keeps moving: video, marquee, WebGL).

| Site | First 3 seconds: what makes the impression | Measures | Fits us | Does not fit |
|---|---|---|---|---|
| [rauno.me](https://rauno.me/) (Rauno Freiberg) | A sentence-long bio in a white card; a yellow disc grows behind it; to the right, huge single letters ("D", "Craft") on cards in a sideways strip. | Type 720 (letter cards); bio ≈28 / 14 body. Fill 57% / 23%. Tones 5, acc. 1 (yellow). Arrival ≈1.6 s / 2.0 s. | One confident accent; the bio is the hero; the motion is short and finishes. | Poster-scale letters and a bright yellow disc are louder than our quiet dark; light ground. |
| [paco.me](https://paco.me/) (Paco Coursey) | Nothing but text on #1a1a1a: name, a one-line italic serif phrase, three short columns. It fades in top to bottom in under a second. | Type 17 / 17; body 16. Line 35 / 29 ch. Fill 4% / 8%. Tones 3, acc. 0. Arrival ≈0.7–1.0 s (stagger). | Exactly our temperature: soft black, two type voices (sans plus one serif italic phrase), a stagger that settles in 1 s. | Too bare for a presentation-first page; no object, no light. |
| [emilkowal.ski](https://emilkowal.ski/) (Emil Kowalski) | A white page with one column of 16 px text. No motion at all. | Type 16 / 16. Line 29 / 24 ch. Fill 2% / 8%. Tones 1, acc. 0. Arrival 0 s. | Proof that a list of real work, plainly set, reads as confident. | No brand moment; light ground. |
| [brianlovin.com](https://brianlovin.com/) (Brian Lovin) | Avatar, name, one sentence, then lists of writing and projects on pure black; the avatar fades in. | Type 24 / 24; body 20. Fill 3% / 10%. Tones 1, acc. 0. Arrival ≈1 s. | Black ground with grey-on-white hierarchy (title white, description grey) in one line per item. | Generic; nothing to remember after closing it. |
| [rauchg.com](https://rauchg.com/) (Guillermo Rauch) | A dated list of essays with years at the left and view counts at the right, on #1c1c1c. Static. | Type 18 / 16; body 14. Fill 2% / 7%. Tones 2, acc. 0. Arrival 0 s. | The year-column list is the cleanest "public record" index seen. | A Home made only of this would not present a brand. |
| [antfu.me](https://antfu.me/) (Anthony Fu) | Text on near-black fades in by lines; faint generative branch lines draw themselves at the edges. | Type 36 / 36; body 16. Line 79 / 40 ch. Fill 8% / 16%. Tones 5, acc. 0. Arrival ≈1.2–1.8 s. | A living background that stays at the edge and below 10% contrast; the text never competes with it. | Line length 79 ch on desktop is too long; many inline icons get busy. |
| [leerob.com](https://leerob.com/) (Lee Robinson) | Serif text on warm black (#1b1a19) at the left, a tall colourful illustration at the right. Static. | Type 47 / 39; body 17. Line 56 / 37 ch. Fill 35% / 13%. Media 25%. Tones 11, acc. 7. Arrival 0 s. | Warm soft black, a serif at 17 px, 56-character lines; a two-column first screen with one picture. | The illustration is many colours; ours would be one glass object in one light. |
| [dennissnellenberg.com](https://dennissnellenberg.com/) (Awwwards winner) | A 2 s "Hello" in many languages, then a large portrait with the name as a 216 px marquee running along the bottom. | Type 216 / 144; body 17. Fill 31% / 64%. Tones 8, acc. 1. Arrival ≈2 s loader + loop (marquee). | The portrait is calm and well lit; small labels ("Located in the Netherlands") are precise. | The preloader, the name as a moving poster, the size: the exact excess of the rejected Home. |
| [gianlucagradogna.com](https://gianlucagradogna.com/) (Awwwards winner) | A 0–100 counter for ≈3 s, then a white card ("Crafting Narrative Through Design.") over dark photographs; scroll swaps to large project cards. | Type 48 / 29; body 24 / 22. Fill 86% / 69%. Media 25% / 43%. Tones 6, acc. 1. Arrival ≈3 s loader + loop. | Small type over big imagery; one white card as the only light element. | Counter loader; crowded collage; never settles. |
| [matthieugivelet.com](https://matthieugivelet.com/) (Awwwards winner) | A percentage loader (≈3 s), then the first name in 52 px with a small image set inside the word, a subtitle, a hairline, project images on scroll. | Type 52 / 27; body 22 / 13. Fill 12% / 18%. Media 11% / 14%. Tones 6, acc. 0. Arrival ≈3 s loader + loop (the inset image changes). | Name at a moderate size with one object inside it: a "mark" moment without size. Hairlines and bracketed labels ("[Approach]") are precise. | Loader; light ground. |
| [olhalazarieva.com](https://www.olhalazarieva.com/) (Awwwards winner) | A long loader (≈5 s), then a ring of 3D text rotating on a white page; later a 225 px name. | Type 225 / 112; body 20. Fill 22% / 31%. Tones 7, acc. 0. Arrival ≈5 s loader + loop. | — | Rotating kinetic type and a long wait; the opposite of quiet. |
| [bruno-simon.com](https://bruno-simon.com/) (Awwwards SOTY) | A glowing ring on a purple-black grid; a small toy world builds itself inside it; "click to start". | No HTML text; media 100%. Tones 4 / 12, acc. 3 / 12. Arrival ≈2–3 s build + loop. | Light as the first event: the ring glows before anything else appears. | A game; many colours; heavy; the content is behind an interaction. |
| [lusion.co](https://lusion.co/) (studio, Awwwards SOTY) | A 000-to-100 counter with a thin bar on black for more than 3 s; then a light page with a dark 3D field of blue and white objects in a rounded frame. | Type 36 / 23; body 13 / 10. Fill 67% / 76%. Tones 12, acc. 5. Arrival >3 s loader + loop. | The 3D sits inside a framed card with margins, not edge to edge: the object is presented, not dumped. | Loader; light ground; 10 px body on phones. |
| [igloo.inc](https://www.igloo.inc/) (Awwwards SOTY 2024) | Points and lines assemble into an igloo of ice in ≈2 s, then it sits lit in a grey-blue landscape; small monospace text in the corners. | No HTML text in first screen; fill 85%. Tones 8, acc. 0. Arrival ≈2 s / 7 s (+ loop). | Glass/ice lit from inside, one object, almost monochrome: the closest thing to our "pre-rendered glass, light as colour". | Full-bleed landscape and WebGL weight; monospace corner text is a cliché now. |

### Photographs: a few, beautifully, without gimmicks

| Site | First 3 seconds | Measures | Fits us | Does not fit |
|---|---|---|---|---|
| [rinkokawauchi.com](http://rinkokawauchi.com/en/) (Rinko Kawauchi) | One photograph fills two thirds of the screen; a 14 px serif menu sits at the left; the image cross-fades slowly to the next. | Type 14 / 15. Media 68% / 24%. Fill 72% / 26%. Tones 7, acc. 2. Arrival: none, slow cross-fade loop. | The photograph is the page; type is tiny and out of its way; the change between images is a slow dissolve, nothing else. | Phone shows the image small in a blank screen; light ground. |
| [readcereal.com](https://readcereal.com/) (Cereal) | A cream page with an index grid of small, equal photographs with numbers and titles; grey placeholders fade to images. | Type 12 / 14; body 12. Media 28% / 61%. Fill 29% / 58%. Tones 14, acc. 3. Arrival ≈1.5–2 s (image load) + loop. | Small consistent frames, an index number and a one-line title under each: calm editorial order. | 12 px body; 160-character line in the header block; too many images for our few. |
| [gianlucagradogna.com/through-this-lens](https://gianlucagradogna.com/through-this-lens) | Counter loader; then "Through this lens" in a 90 px serif with a small photo set between the words; scrolling moves sideways to one large photo per "chapter" with place and coordinates. | Type 90 / 41; body 14. Line 47 / 52 ch. Media 6% / 9%. Fill 8% / 11%. Tones 3, acc. 1. Arrival ≈3 s loader + loop. | Chapters with a place name, coordinates and one photo each: a photo essay structure with captions as small facts. | Vertical wheel turned into horizontal movement; the loader. |
| [vivianmaier.com](https://www.vivianmaier.com/) (archive) | A dense grid of black-and-white photographs, edge to edge, beside a brown sidebar. Static. | Type 12 / 15; body 10. Fill 85% / 67%. Tones 10, acc. 1. Arrival 0. Slow (first paint 14 s / 26 s that run). | On phones: one photo per row with a small caption under it ("Street 1") is clean and readable. | Desktop grid crowds the photographs; brown chrome. |
| [saulleiterfoundation.org](https://www.saulleiterfoundation.org/) | A black-and-white self-portrait at the left, a paragraph at the right; sections alternate photo and text on scroll; ≈1 s fade-in. | Type 29 / 23; body 15. Line 44 / 12 ch. Fill 36% / 14%. Tones 10, acc. 0. Arrival ≈1.1 s. | Photo and short text side by side with generous margins; the fade is short. | Phone squeezes the text into a 12-character column beside the photo: a clear phone anti-pattern. |
| [alecsoth.com](https://alecsoth.com/) (Alec Soth) | An orange band with a short first-person line, then a plain list of exhibitions with installation photographs. | Type 38 / 31; body 14. Line 94 / 43 ch. Media 38% / 43%. Fill 70%. Tones 14, acc. 5. Arrival: none (embeds load). | A first-person sentence as the opening; photographs shown in their real context (on the wall). | Orange band and 94-character lines; feels unfinished on load (grey placeholders). |
| [theatlantic.com/photo](https://www.theatlantic.com/photo/) (In Focus, phone only) | Title "Photography" in a serif, then one large photo per story with a serif headline and a dated byline. Desktop was refused by the site's bot protection (403). | Type 44; body 18. Line 42 ch. Fill 26%. Tones 7. Arrival: none. | One photo, headline, date, in that order: the editorial photo-story rhythm. | Advertising and newspaper chrome. |

### Software products with real screens

| Site | First 3 seconds | Measures | Fits us | Does not fit |
|---|---|---|---|---|
| [linear.app](https://linear.app/) | The headline sharpens out of a blur in ≈1 s on #08090a; below it the real app window, dark, at full content width, edge lit by a faint grey highlight. | Type 64 / 38; body 15. Line — / 50 ch. Fill 18% / 17%. Tones 5, acc. 0. Arrival ≈1 s / 2.2 s. | A real screen as the hero, at true size, in the page's own dark; zero accent colours; type at 64 px max. | Very long page (11 screens); logo wall. |
| [vercel.com](https://vercel.com/) | A black triangle glows from behind out of pure black in ≈0.9 s; headline left, three short lines right. | Type 64 / 48; body 14. Fill 13% / 20%. Tones 6, acc. 0. Arrival ≈0.9 s (+ subtle glow loop on phone). | Light as the event: one dark object made visible only by the light behind it. Exactly our language. | Logo wall; marketing density further down. |
| [raycast.com](https://www.raycast.com/) | Headline fades in first, then a red, glassy shard shape blooms behind it (≈2 s); further down the real launcher window sits in a macOS menu-bar frame lit in red. | Type 64 / 36; body 14. Line 32 / 29 ch. Fill 34% / 36%. Tones 8–12, acc. 6–8. Arrival ≈2.2 s. | Glass and coloured light carrying the brand; the product screen framed in its real OS context. | The red bloom is large (≈45% of the screen); more saturated than our "light, not paint". |
| [apple.com/macbook-pro](https://www.apple.com/macbook-pro/) | The laptop's silver edge appears out of black as light sweeps across it (≈1 s); small headline lower left. (Visited from Turkey: a region banner sits on top.) | Type 80 / 48; body 12 (legal notes) – 17. Fill 28% / 42%. Tones 7, acc. 0. Arrival ≈1 s + video loops. | The product lit as a sculpture on black; the headline is small and off to the side. | 47 screens long; the hero motion plays only once per load. |
| [apple.com/final-cut-pro](https://www.apple.com/final-cut-pro/) | A strong red film still plays on the real app interface, shown on Mac, iPad and a display; "Reel intelligence." in 80 px below. | Type 80 / 40; body 17. Line 52 / 33 ch. Fill 34% / 57%. Tones 9, acc. 4. Arrival ≈5–6 s (video). | Real screens in device frames, at several sizes, as one composition; the app icon above the name. | Video-first; colour comes from the content, not from light. |
| [culturedcode.com/things](https://culturedcode.com/things/) | The app icon and the name fade in centred on pale grey; on scroll, real screens appear tilted in a soft perspective. | Type 24 / 20; body 18. Line 35 / 19 ch. Media 22% / 38%. Fill 4% / 14%. Tones 3, acc. 2. Arrival ≈1 s. | The app icon as the hero (like our product plates); real screens, in perspective, quiet; small headline. | Light ground; the tilted 3D screens are a familiar App Store trope. |
| [teenage.engineering/products/op-1](https://teenage.engineering/products/op-1) | "the beauty of evolution." in a light 53 px, and below it a photograph of the device at true colour on grey; scrolling moves down the device, key by key, very large. Instant. | Type 53 / 29; body 19 / 7. Fill 27% / 48%. Tones 9, acc. 0. Arrival ≈0.4 s. | A photographed object on a plain ground; scrolling brings the detail closer instead of adding effects. Our pre-rendered objects could do this. | 7 px labels on phones; light grey ground. |
| [family.co](https://family.co/) | A white page; the headline slides in, then many colourful illustrated characters pop in around it (≈1.8 s). Real phone screens follow on scroll. | Type 68 / 44; body 17. Line 56 / 37 ch. Fill 19% / 24%. Tones 9, acc. 6. Arrival ≈1.8 s. | Spring-tuned micro-motion that feels physical; real screens in a clean grid. | Cartoon illustration and many colours. |

### What fits this site: ten techniques, with their sources

1. **Cap the display type; let the object or the screen be the large thing.** The products the
   owner's site resembles top out at **64 px** on desktop (Linear, Vercel, Raycast) and **36–48 px** on
   phones; Apple goes to 80 px only for a three-word line. The calmest personal sites use 16–24 px
   (Paco, Emil, Brian, Rauch) and the finest crafted ones 36–52 px (Anthony Fu, Lee Robinson, Matthieu
   Givelet). Names at 144–720 px (Dennis Snellenberg, Olha Lazarieva, Rauno's cards) are the spectacle
   end and match what the owner rejected. Proposal for the charter: **≤ 64 px desktop, ≤ 40 px phone** for
   the largest line.
2. **Light is the entrance.** The memorable first second on the best dark pages is a light coming up,
   not something moving in: Vercel's triangle lit from behind (0.9 s), the MacBook's edge lit by a sweep (≈1 s),
   Igloo's ice lit from inside, Bruno Simon's glowing ring before the world appears. For us: the glass
   object starts dark and its light rises once, then stays still.
3. **Arrival under about one second, and it must finish.** Paco (stagger, ≈0.7–1 s), Linear (blur to sharp,
   ≈1 s), Vercel (≈0.9 s), Things (≈1 s), Saul Leiter (≈1.1 s). Every loader seen (Lusion, Gradogna,
   Matthieu, Olha, Dennis) costs **2–5 s** before anything, and every site that "never settles"
   (marquees, rotating text) feels busy. Our pre-rendered frames load progressively; no loader, no counter.
4. **One accent per screen.** Linear, Vercel, Apple MacBook, Paco, Emil, Brian and Rauch show **zero** saturated
   clusters; Rauno and Raycast use exactly one colour. Our product colours (Recto lime, English Prep
   sakura, Eat Map rose) should appear one at a time, as light, never side by side as paint.
5. **Soft black for text, true black where light is the subject.** Text-led sites sit on #1a1a1a (Paco),
   #1c1c1c (Rauch), #1b1a19 (Lee); light-led product heroes sit on #000–#0a0a0a (Vercel, Apple,
   Linear, Raycast). Our black ground can do both: soft black for About and Record, deeper black
   behind the glass.
6. **Real screens at true size, in the page's own dark, with one faint edge light.** Linear shows the app
   window full width directly under the headline; Raycast puts the launcher inside a real macOS menu bar;
   Apple Final Cut Pro composes Mac, iPad and display as one picture; Things leads with the app icon. This
   is ADR-0014 done well: no tilt, no floating phones, no blur, and the screen is crisp at device pixels.
7. **A photograph is presented by taking things away.** Rinko Kawauchi: one image covering about two thirds of the first
   screen, 14 px serif type, a slow dissolve between images. Cereal and Vivian Maier on phones: one frame
   per row, a short caption (number or place, year) under it. Gradogna's photo essay: a place name and
   coordinates as the caption. No hover distortion, no reveal tricks anywhere among the photo sites. For the few
   photos: large, still, a one-line factual caption, a dissolve only if there are several.
8. **Body 15–18 px, lines of 35–60 characters.** Paco 16 px / 35 ch, Linear 15 px / 50 ch (phone), Lee 17 px /
   56 ch, Family 17 px / 56 ch, Apple 17 px, Things 18 px. Anthony Fu (79 ch) and Alec Soth (94 ch) feel worse for
   it. Home's text can sit at 16–17 px with lines ≤ 60 ch; the Record keeps its 21 px reading size.
9. **Scroll brings the object closer, not more effects.** Teenage Engineering's OP-1 page scrolls down a
   photograph of the device until single keys fill the screen; Apple does the same with chips and
   edges. Our pre-rendered objects already have exact frames: a scroll that moves the camera nearer to
   the glass (still frames, no scroll-jacking) is the craft version of "wow".
10. **A dated list is a brand statement when it is exact.** Rauch's essays with years in a left column and
    counts at the right, Lee's posts with right-aligned dates, Emil's one-line descriptions under
    each title. For "a public record of continuous work", a precise, aligned, dated index on Home is
    stronger evidence than a slogan.

**What the references argue against** (the rejected round, confirmed by real pages): names as posters
(Dennis, Olha), loaders and counters (Lusion, Gradogna, Matthieu, Olha), horizontal scroll hijacking
(Gradogna's photo essay), kinetic rotating type (Olha), cartoon colour (Family, Bruno Simon), phone layouts
that squeeze text beside an image (Saul Leiter, 12 characters per line).

## Study 2: the 127-site picker (2026-10-12)

Three agents searched in parallel:

- **Award winners:**
  - Awwwards Sites of the Year and Sites of the Month, plus the 2025 annual awards
  - CSS Design Awards Website of the Year, 2024–2025
  - Webby Awards: Best Home Page and Best Visual Design
- **Widely praised product and brand pages,** including the sites of Apple Design Award winners and finalists from 2023 to 2026.
- **Celebrated portfolios and studios.**

Every URL was checked live.

- **Counts:** 98 new sites plus the 29 from Study 1, 127 in all: 54 product, 30 portfolio, 17 editorial and photography, 16 studio, 10 brand.
- **Dropped:** Locomotive, Reuters Graphics, FOLLOW.ART, Cartier and Nothing were blocked by bot checks or region pop-ups. FWA refused the automated browser, so none of its winners are included.
- **Weaker evidence:** some entries rest only on a gallery feature (Framer, Superhuman, Ramp, Polestar, Pentagram, Collins).
- **The picker:** the owner viewed each site's desktop, scroll, phone and first-3-seconds images and voted on 31 (https://claude.ai/artifact/1CHkxD94pf1fYe2EB72J4k).

Overviews: `img/picker-product.webp`, `img/picker-portfolio.webp`, `img/picker-studio.webp`,
`img/picker-brand.webp`, `img/picker-editorial.webp`. Lists and sources: `data/picker/`.

## Study 3: anatomy of the loved sites (M, 2026-10-12)

| Site | Type voices | Type scale (px) | Colour | Motion |
|---|---|---|---|---|
| Shopify Editions | Neue Montreal 700 (chapter word), HW Cigars serif (text), Imperial Script (initial), Inter (UI) | 194 / 61 / 44 / 32 / 28 / 20 / 17 / 14 | black painted chapters alternate with `#f7f7ee` pages; body text `#909083` / `#5c5c4e`, never pure black | cards 400–500 ms `cubic-bezier(.34,1.56,.64,1)`; UI 150 ms; Lenis |
| Dia | Exposure (display), ABC Oracle (text), ABC Favorit Mono (labels, 13 px, +1.3 px) | 48 / 39 / 24 / 20 / 16 / 14 / 13; body 20/1.5 | `#fbfaf6`; one black at 85 / 70 / 60% opacity; one yellow accent | 200–300 ms, one curve `cubic-bezier(.4,0,.2,1)`; no intro |
| Anime.js | DIN + mono | 52 / 40 / 20 / 16 / 14 / 12 | warm charcoal `#252423`, text `#d5d3d1` / `#b4b1af`; one accent colour per feature | the page is the demo; UI 125–500 ms |
| Notion Calendar | Inter (custom cut), Lyon Text for one quote | 64 / 42 / 22 / 18 / 16 | white and `#f6f5f4` bands; text at 90% black | 200 ms; almost no scene motion |
| Antoine Wodniack | Bigger Display 700, Editorial New 200, Fraktion Mono | 138 / 105 / 36 / 32 / 20 | saturated `#f40c3f` on most of the screen (the eye strain) | 0.8–1 s `cubic-bezier(.23,1,.32,1)`, clip-path reveals; Lenis |
| Anthony Fu | Inter 800 / 400, DM Mono | 36 / 16 | `#bbb` text on near black | lines appear 90 ms apart, 1 s each |
| Jakub Krehel | system UI only | everything 16 | `#0c0c0c`, light-grey text | none; the tiredness is monotony (one size, one weight), not pure black and white (D) |

Shared patterns (M, D):

1. A promise line first; one idea per section; a fixed index on long pages (Shopify I–XII, Dia
   01–03); a fixed stage with changing content (Anime.js, Dia).
2. Three type voices (display, text, mono labels); hierarchy from size and opacity, not new colours.
3. Softened contrast; short, consistent motion (UI 150–300 ms, scenes 400–1000 ms; one or two curves).

Images: `img/shopify-*.webp`, `img/dia-*.webp`, `img/anime-*.webp`, `img/notion-*.webp`, `img/antoine-*.webp`, `img/antfu-*.webp`, `img/jakub-*.webp`, `img/robin-case-study*.webp`. Full per-site anatomy: `data/study3-anatomy/`.

## Study 4: home pages that read like a CV (M, 2026-10-14)

| Site | Desktop | Phone | Sections | Gap between sections | Text column | Words on first screen | Largest type |
|---|---|---|---|---|---|---|---|
| Anthony Fu | 1.4 screens | 2.0 | 4 | 65 px | 656 px | 160 | 36 px |
| Lee Robinson | 1.4 | 1.9 | 3 | 58 px | 600 px | 121 | 42 px |
| Guillermo Rauch | 1.1 | 1.1 | 3 | 165 px | 624 px | 143 | 18 px |
| Paco Coursey | 1.6 | 1.9 | 4 | 68 px | 640 px | 103 | 16 px |
| Brian Lovin | 1.7 | 2.6 | 3 | 121 px | 640 px | 48 | 24 px |
| Louis Paquet | 2.6 | 3.3 | 4 | 100 px | 444 px | 67 | 18 px |
| Jakub Krehel | 2.6 | 2.7 | 5 | 116 px | 660 px | 161 | 16 px |
| Emil Kowalski | 2.8 | 2.7 | 7 | 128 px | 668 px | 101 | 16 px |
| Dia (product) | 7.4 | 8.7 | 10 | 531 px | full width | 20 | 39 px |

- **All follow one order:** name and role (one line) → today (where they work, in one or two
  sentences) → work → writing → now / personal (optional) → links.
- **Strips:** a small grey label plus content, with a constant gap. Louis Paquet puts the label in a left column and the
  content in a column starting at one third of the width. Emil Kowalski puts the label above.
- **Short or long:** Lee Robinson offers a "Default / Long" switch on the same page: about 1,000 versus
  about 5,400 characters (a childhood story with photos).
- **Now:** Emil's "Today" (two sentences under the name) is the compact form; Paco's "Now" is three
  paragraphs at the end.
- Louis Paquet's work links open the clients' live sites in new tabs. This is the "heavy pages one by
  one" the owner disliked.

Images: `img/louis-first.webp`, `img/full-*.webp`, `img/phone-*.webp`, `img/lee-default.webp`, `img/lee-long.webp`.

## Study 5: Work, image-into-page transitions (M, 2026-10-14)

Of 14 galleries probed, four recorded cleanly. All stay in one document (no reload) and none uses
the View Transitions API; each uses its own JS or WebGL.

- **Robin Noguier (shared element):** the curved WebGL image flattens and slides into its place on the
  project page; the ground colour wipes; the title stays. Open 1.4 s, back 1.6 s (a horizontal
  wipe back to the same project).
- **basement.studio:** the tile's visual stays in place while the page changes around it (client, year, type
  on the left; "More projects" below). 1.7 s.
- **14islands:** a liquid reveal on hover, then a fade to white. 2.9 s. It feels like a new page; not
  what the owner described.

Fit with the portfolio's architecture (D): ADR-0007 already uses cross-document view transitions. Giving the Work tile's
image and the project page's hero the same `view-transition-name` produces the Robin effect without
a client router; browsers without support navigate instantly, and reduced motion turns it off. The
project dialog of ADR-0007 item 4 needs the same name on its hero for wide screens.

Images: `img/robin-noguier-*.webp`, `img/basement-studio-*.webp`, `img/14islands-*.webp` (frame sheets and animations).

## Conclusions: what the research says about the portfolio

These are the first analysis, not decisions; each lists its basis. The owner re-evaluates them in the portfolio project.

| Conclusion | Basis |
|---|---|
| Home answers the hiring question: who, where, what they build, what they focus on; proof (the work) is visible within the first two screens. | O; 7.4 s scan (R); 74% of attention in two screens (R) |
| Home is short and built from strips: 1.1–2.8 screens, 3–7 sections, each a small label plus content, constant gaps, one narrow column (600–670 px). | Study 4 (M) |
| The order is stable: name and role → today (one or two sentences) → work → writing → now (optional, short) → links. | Study 4 (M) |
| No intro showpiece: none of the liked simple sites has an intro or loader; at most lines fade in within 1 s. Most disliked sites cost 2–5 s of loading. | Studies 1, 3 (M); O (2026-10-14 view) |
| Language is direct: short, exact sentences; headings carry the message on their own. | O; Ladders, NN/g (R) |
| Eyes do not tire: no pure black or white ground or text; hierarchy from size, weight and the opacities of one colour; body 15–20 px, lines 50–75 characters; no saturated colour over large areas; monotony (one size, one weight) tires. | Study 3 (M); Material, Baymard (R) |
| Work is rich and continuous: a gallery with real, moving screens; the clicked image flows into its own page (shared element) and reverses on Back; it never feels like a new page. | O; Study 5 (M) |
| Products are explained step by step and through the user: a promise line, one idea and one real screen per section, a fixed index; headlines say what the user can now do. | Dia, Notion, Anime.js (M); Sierra, Hulick (R) |
| Motion is measured: UI 150–300 ms, scenes 400–1000 ms, one or two easing curves per site, a still version of every effect. | Study 3 (M) |
| The light-theme toggle is open: the owner thinks it "probably" does not fit the black ground with objects; section grounds may differ; left to the portfolio. | O (2026-10-14 view) |

## Limits

- Phone captures are Chrome emulating an iPhone, not real Safari.
- Timings depend on the network; looping pages differed by up to ±1 s between runs. The figures are
  for comparing sites, not specifications.
- WebGL sites may arrive more slowly in headless Chrome than on a real GPU.
- GPU launch flags used on 2026-10-12 broke some sites' intros (found on Shopify Editions); they were
  removed and the 12 loved sites were re-measured. Some picker first screens may still show an intro
  frame for that reason.
- Four of the 14 galleries recorded cleanly. On the others, the click hit an overlay or the project led to an external site.
- Some research sources are summaries or industry studies (Ladders 7.4 s); their confidence is in
  `data/research-sources.md`.

## Files

- `rapor.html`: this report in Turkish (owner-facing), with images from `img/`. `report.md`: this file.
- `liked-sites.md` / `begenilenler.html`: the 16 liked-site dossiers (English / Turkish); clips and frames in `img-dossiers/`, raw data and each site's CSS in `data/dossiers/`.
- `data/study1-29-sites/`: Study 1 measurements per site.
- `data/picker/`: the 127 sites and their sources (`sites_all.json`, `awards.json`, `products.json`, `portfolios.json`), the dropped sites (`blocked.json`), and the owner's 31 votes and notes (`votes.json`).
- `data/study3-anatomy/`: anatomy of the loved sites (fonts, type scale, colours, transitions, scroll stops).
- `data/study4-home-pages/`: section structure and first-screen inventory of 13 home pages.
- `data/study5-work-transitions/`: transition probes, successful and failed.
- `data/research-sources.md`: the research notes with sources. `data/owner-criteria.tr.md`: the owner's criteria as dictated, dated (Turkish).
- **Published:** this report (Turkish) https://claude.ai/artifact/5vVohMohG5zLmSrh456jjB; liked-site dossiers https://claude.ai/artifact/V1SZ4t9nfRH7TuxVw3tdva; Loved sites https://claude.ai/artifact/4wVp8Z7iviqCMTkUfhzSZM; Home and Work https://claude.ai/artifact/SqC8mBKtvbK4hdF1cL48dV; Picker https://claude.ai/artifact/1CHkxD94pf1fYe2EB72J4k.
- **Tools and raw captures** (all 127 sites, journeys, recordings) are archived in the design review workspace on the owner's computer (`reference-research/`; tools in `tools/`, captures in `library/captures/`).
