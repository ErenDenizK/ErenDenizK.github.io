# Liked sites: detailed dossiers (2026-10-14)

> **Status:** first analysis, not decisions. Sixteen sites the owner liked or praised, each with the owner's note, a first analysis and the values read from the site's CSS and DOM. The Turkish edition with clips and frames is `begenilenler.html`; media in `img-dossiers/`, raw data and the sites' CSS in `data/dossiers/`. Anthony Fu and Jakub Krehel follow the system light/dark setting; their light themes were captured here.

### Shopify Editions, Renaissance

Ürün sunumu · https://www.shopify.com/editions/winter2026 · owner: **like** — "BAYILDIM, sunum aşırı güzel animasyonlar ve görseller mükemmel, hiçbir noktada sıkıcılarşmıyor harika bir kompozisyon harika bir akış renk okunabilirlik propozisyon animasyonlar harika bayıldım"

60 screens, 12 chapters, each in three beats (painting + one 194 px word, a torn-paper cut to a cream page with a script initial, real product screens) and a fixed I–XII index. Fluid type with clamp(), 12/14-column grids with subgrid, spring easing cubic-bezier(.34,1.56,.64,1) at 400–500 ms, view-transition and reduced-motion rules in the CSS. Heavy: 12 videos, two WebGL canvases, Lenis.

- **Fonts:** NeueMontreal 700; HWCigars 400; ImperialScript 400; Inter-Variable ?
- **Type scale:** 193.7 px NeueMontreal 700 lh 0.9 tr -5.81052px; 61.4 px NeueMontreal 700 lh 0.9 tr -1.22737px; 43.8 px HWCigars 400 lh 0.96 tr -2.18948px; 32 px NeueMontreal 700 lh 0.95 tr -0.96px; 27.9 px HWCigars 400 lh 0.97 tr -1.39737px; 20 px HWCigars 400 lh 0.97 tr -0.8px; 18 px NeueMontreal 700 lh 0.95 tr -0.36px
- **Text / ground colours:** rgb(144, 144, 131), rgb(92, 92, 78), rgb(0, 0, 0), rgb(247, 247, 238) / rgb(0, 0, 0), rgb(247, 247, 238), rgb(220, 220, 208), rgb(255, 255, 255)
- **Colour variables:** `--color-red-100: oklch(93.6% .032 17.717)`, `--color-red-200: oklch(88.5% .062 18.334)`, `--color-red-300: oklch(80.8% .114 19.571)`, `--color-red-400: oklch(70.4% .191 22.216)`, `--color-red-500: oklch(63.7% .237 25.331)`, `--color-red-600: oklch(57.7% .245 27.325)`, `--color-red-700: oklch(50.5% .213 27.518)`, `--color-red-800: oklch(44.4% .177 26.899)`, `--color-yellow-100: oklch(97.3% .071 103.193)`, `--color-yellow-200: oklch(94.5% .129 101.54)`
- **Layout:** root 16px; containers 100%, 75%, 80%, 66.666%; grid 5 cols · 80.4062px 80.4062px 80.4062px 80.4062px 80.4062px; 12 cols · 80.4062px 80.4062px 80.4062px 80.4062px 80.4062px 80.4062px ; gaps 10px 14.4px, 5px, 64px 14.4px, 4px; radii 3px, 2px, 12px, 8px
- **Motion:** durations .3s, 0s, .6s, 1s, 2s, .15s, 3s; easings ease, ease-in-out, ease-out, linear, ease-in, cubic-bezier(.34,1.56,.64,1); keyframes orbit-path, show-close-button, emoji-rise, line-fade, fade-in, stagger-fade-in, load-lines, slide
- **Platform:** reduced-motion rules 9, view-transition 15, scroll-timeline 0, container queries 2; libraries lenis, three; breakpoints (min-width:48.0625rem), (min-width:58.75rem), (hover:hover), (prefers-reduced-motion:no-preference), (min-width:67.5rem), (min-width:769px)
- **Media:** `img-dossiers/shopify-editions-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/shopify-editions.json`, CSS: `data/dossiers/css/shopify-editions/`.

### Dia (The Browser Company)

Ürün sunumu · https://www.diabrowser.com/ · owner: **like** — "BAYILDIM minimalist harika bir özet, ürünü harika tanıtıyor ve gösteriyor asla sıkıcı değil, animasyonlar ve genel sunum adım adım çok basit ve açıklayıcı ürünü güzel pazarlıyor"

Seven screens: promise and real browser window, a numbered 01–03 stepper with a changing visual, six work-situation cards, privacy, closing CTA; sticky download button. Exposure (205TF) display, ABC Oracle text, ABC Favorit Mono labels; fluid body clamp(15px,.85rem+.8vw,21px); 10 px root; 12×100 px grid; radii 20 px and pill; transitions 150–250 ms on cubic-bezier(.4,0,.2,1); hierarchy from one black at 85/70/60%.

- **Fonts:** ABC Oracle 300, 350, 400, 500, 700; Exposure VAR 300, 350, 400, 450, 500, 550, 600, 650, 700, 900; ABC Favorit Mono 400, 500, 700; ABC Oracle Triple 400; Exposure Variable 1 999; Quadrant Text Mono 400; SF Pro 400; Ammer Handwriting 400
- **Type scale:** 48 px Exposure VAR 500 lh 1.17 tr -2.4px; 38.8 px Exposure VAR 500 lh 1.1 tr -1.55172px; 24 px Exposure VAR 500 lh 1.25 tr -0.72px; 22 px ABC Oracle 400 lh 1.36 tr normal; 20 px ABC Oracle 350 lh 1.2 tr normal; 20 px ABC Oracle 350 lh 1.5 tr -0.4px; 16 px ABC Oracle 400 lh 1.25 tr normal
- **Text / ground colours:** rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.424) / rgb(251, 250, 246), rgb(255, 203, 48), rgb(255, 228, 140), rgb(0, 0, 0)
- **Colour variables:** `--black: #000000`, `--black-50: #00000080`, `--black-10: #0000001A`, `--black-8: rgba(0,0,0,0.08)`, `--header-background: #dddddd77`, `--white: #F8F8F8`, `--white-50: #F8F8F880`, `--white-10: #F8F8F81A`, `--red: #FA3D1D`, `--red-50: #FA3D1D80`
- **Layout:** root 10px; containers 100%, 760px, 286.72px, 1440px; grid 12 cols · 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px ; 10 cols · 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px; gaps 14px, 20px, 10px, normal 20px; radii 20px, 9999px, 12px, 16px
- **Motion:** durations .15s, .2s, .25s, .4s, 1s, .1s, .3s; easings linear, ease, cubic-bezier(.4,0,.2,1), ease-in-out, cubic-bezier(.77,0,.175,1), cubic-bezier(.22,1,.36,1); keyframes spin, marqueeL, marqueeR, marqueeU, marqueeD, diaMarqueeL, diaMarqueeR, pulse
- **Platform:** reduced-motion rules 5, view-transition 0, scroll-timeline 0, container queries 0; libraries three, nextjs; breakpoints (min-width:800px), (min-width:1000px), (min-width:600px), (prefers-reduced-motion:reduce), (min-width:900px), (min-width:1100px)
- **Media:** `img-dossiers/dia-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/dia.json`, CSS: `data/dossiers/css/dia/`.

### Anime.js

Ürün sunumu · https://animejs.com/ · owner: **like** — "çok güzel basit bir akış adım adım ürünü açıklıyor tek bir referans etrafında kendini çeşitlendiriyor güzel, biz de ürün showcaselerken kullanabiliriz"

One fixed stage (a coloured ring) whose content changes per feature, with the code that draws it beside it. DINish variable (slant, width, weight), Berkeley Mono, Digital-7; warm charcoal scale --hex-black/white-1…8; container queries; 100–125 ms ease-out UI; one glow colour per feature.

- **Fonts:** Mono 400; Digital-7 400; DIN 100 900
- **Type scale:** 52 px DIN 700 lh 0.87 tr normal; 52 px DIN 700 lh 0.95 tr -1.3px; 40 px DIN 800 lh 0.95 tr -0.5px; 20 px DIN 600 lh 1.25 tr normal; 16 px DIN 600 lh normal tr normal; 16 px Mono 400 lh normal tr normal; 16 px DIN 400 lh normal tr normal
- **Text / ground colours:** rgb(180, 177, 175), rgb(213, 211, 209), rgb(171, 178, 191), rgb(97, 174, 238) / rgb(37, 36, 35), rgb(48, 46, 45), rgb(183, 255, 84), rgb(53, 52, 50)
- **Colour variables:** `--hex-black-1: #252423`, `--hex-black-2: #252423`, `--hex-black-3: #252423`, `--hex-black-4: #262422`, `--hex-black-5: #262422`, `--hex-black-6: #262422`, `--hex-black-7: #262422`, `--hex-black-8: #262422`, `--hex-white-1: #f6f4f2`, `--hex-white-2: #cccac8`
- **Layout:** root 16px; containers 432px, 320px, 1500px, 336px; grid —; gaps normal 24px, 8px, 40px, 7px; radii 50%, 12px, 2px, 0px 12px 0px 0px
- **Motion:** durations .125s, .1s, 0s, .5s, .4s; easings ease-out, ease, linear; keyframes carbon-fade-in
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 4; libraries three; breakpoints (min-width:900px), (max-width:899px), (min-width:1200px), (min-width:1500px), (max-width:1199px), (min-height:64rem)
- **Media:** `img-dossiers/anime-js-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/anime-js.json`, CSS: `data/dossiers/css/anime-js/`.

### Notion Calendar

Ürün sunumu · https://www.notion.com/product/calendar · owner: **like** — "basit güzel akıcı anlatıyor"

Nine screens: two-word promise, four themes each with card features (short title, one line, real screen fragment). Custom Inter, Lyon Text; a design system (--tatami-*); 39 container queries, 14 scroll-timeline uses, 20 reduced-motion rules; 150–250 ms ease-in-out; radii 8–12 px.

- **Fonts:** NotionInter 400, 500, 600, 700; Lyon Text 400, 600; Noto Sans Hebrew 100 900; Permanent Marker 400; iA Writer Mono 400, 600; Noto Sans Arabic 100 900
- **Type scale:** 64 px NotionInter 700 lh 1 tr -2.12501px; 42 px NotionInter 700 lh 1.14 tr -1.5px; 42 px NotionInter 600 lh 1.14 tr -1.5px; 22 px NotionInter 500 lh 1.27 tr -0.25px; 18 px NotionInter 700 lh 1.56 tr -0.125px; 16 px NotionInter 600 lh 1.5 tr normal; 16 px NotionInter 500 lh 1.5 tr normal
- **Text / ground colours:** rgba(0, 0, 0, 0.898), rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.54), rgb(25, 25, 24) / rgb(255, 255, 255), rgb(246, 245, 244), rgb(242, 249, 255), rgb(254, 243, 241)
- **Colour variables:** `--tile-border-color: #19a0ea`, `--tile-background-color: #e1f9ff`, `--tatami-color-gray-100: #f9f9f8`, `--tatami-color-gray-200: #f6f5f4`, `--tatami-color-gray-300: #dfdcd9`, `--tatami-color-gray-400: #a39e98`, `--tatami-color-gray-500: #78736f`, `--tatami-color-gray-600: #615d59`, `--tatami-color-gray-700: #494744`, `--tatami-color-gray-800: #31302e`
- **Layout:** root 16px; containers 512px, calc(100% + 64px), 100%, 800px; grid 1 cols · 1440px; 3 cols · 476.891px 406.203px 476.906px; gaps 0px 8px, 30px, 8px, 16px; radii 12px, 8px, 6.5px, 4px
- **Motion:** durations .2s, 150ms, .25s, 250ms, .15s, .1s, 0s; easings ease-in-out, linear, ease-out, ease-in, ease, cubic-bezier(.645,.045,.355,1); keyframes fadeIn, fadeOut, scaleIn, scaleOut, popIn, rotate, globalNavigation-module-scss-module__HWB10a__navShadowScrolled, globalNavigation-module-scss-module__HWB10a__fadeIn
- **Platform:** reduced-motion rules 20, view-transition 0, scroll-timeline 14, container queries 39; libraries nextjs; breakpoints (min-width:600px), (min-width:840px), (min-width:1080px), (min-width:1280px), (min-width:1440px), (min-width:600px) and (min-width:600px)
- **Media:** `img-dossiers/notion-calendar-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/notion-calendar.json`, CSS: `data/dossiers/css/notion-calendar/`.

### Stripe

Ürün sunumu · https://stripe.com/ · owner: **like** — "—"

17 screens: outcome headline and logo strip, product cards with mock UI, a stats band, customer stories. One family (Söhne variable, mostly weight 300), hierarchy by size only; 12×88 px grid, 1266 px container; cubic-bezier(.25,1,.5,1) at 300 ms; 91 reduced-motion rules, container queries, scroll timelines; radii 4–6 px.

- **Fonts:** sohne-var 1 1000; SourceCodePro 500
- **Type scale:** 56 px sohne-var 300 lh 1.03 tr -1.4px; 48 px sohne-var 300 lh 1.15 tr -0.96px; 48 px sohne-var 300 lh 1.03 tr -0.96px; 48 px sohne-var 300 lh 1 tr -0.96px; 32 px sohne-var 300 lh 1.1 tr -0.64px; 26 px sohne-var 300 lh 1.12 tr -0.26px; 26 px sohne-var 400 lh 1.15 tr -0.78px
- **Text / ground colours:** rgb(80, 97, 122), rgb(100, 116, 141), rgb(6, 27, 49), rgb(83, 58, 253) / rgb(255, 255, 255), rgb(229, 237, 245), rgb(13, 23, 56), rgb(248, 250, 253)
- **Colour variables:** `--suite-color: #ea2261`, `--stop-color: #da56ed`, `--stats-color: #fcfdfe`, `--stats-border-color: #8586c2`, `--stats-option-selected-background: #4b45bc`, `--stats-option-active-background: rgba(252,253,254,.1)`
- **Layout:** root 16px; containers 400px, 1266px, 817.778px, 100%; grid 12 cols · 88px 88px 88px 88px 88px 88px 88px 88px 88px 88px 88px 88px; 3 cols · 17px 19px 189px; gaps 8px, 16px, 32px, 4px; radii 4px, 6px, 5px, 8px
- **Motion:** durations .3s, 0s, .15s, .5s, .2s, .25s, .4s; easings linear, cubic-bezier(.25,1,.5,1), ease, ease-in-out, cubic-bezier(.4,0,.2,1), ease-out; keyframes nav-hover-arrow-in, nav-hover-arrow-out, detect-scroll, navigation-menu-delay-reset, bento-overlay-gradient-opacity-animation, bento-dialog-reveal-fade-in-up, agentic-commerce-graphic-border-spin, book-of-the-week-fade-in
- **Platform:** reduced-motion rules 91, view-transition 0, scroll-timeline 7, container queries 11; libraries three, nextjs; breakpoints (min-width:640px), (min-width:940px), (prefers-reduced-motion:no-preference), (max-width:639px), (prefers-reduced-motion:reduce), (max-width:939px)
- **Media:** `img-dossiers/stripe-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/stripe.json`, CSS: `data/dossiers/css/stripe/`.

### Arc

Ürün sunumu · https://arc.net/ · owner: **like** — "bence biraz daha sönük ama minimalist ok"

Seven screens; a band pointing to Dia; rounded Marlin Soft headlines on cream #fffcec; shares Exposure/ABC Oracle with Dia; a primary1…12 colour scale; SVG filters and clip-path masks; 100–200 ms transitions.

- **Fonts:** ABC Favorit Mono 400, 500, 700; Marlin Soft SQ 400, 500, 700, 900; Marlin Soft Basic 400; ABC Oracle 350, 400; Exposure VAR 650, 700, 750; Sohne Breit Extrafett 900; Sohne Breit 400, 700; Space Mono 400, 700
- **Type scale:** 45.5 px Marlin Soft SQ 700 lh 0.93 tr -1.8204px; 40 px Marlin Soft SQ 700 lh 0.98 tr -1.6px; 36 px Exposure VAR 700 lh 1 tr -0.72px; 28 px Marlin Soft SQ 700 lh 1.07 tr -1.4px; 28 px Marlin Soft SQ 700 lh 1.1 tr -1.4px; 24 px ABC Oracle 400 lh 1.2 tr normal; 20 px ABC Oracle 400 lh 1.2 tr normal
- **Text / ground colours:** rgb(49, 57, 251), rgb(105, 105, 105), rgb(255, 252, 236), rgb(255, 250, 221) / rgb(255, 252, 236), rgb(255, 255, 255), rgb(49, 57, 251)
- **Colour variables:** `--colors-primary1: rgb(255, 234, 231)`, `--colors-primary2: rgb(255, 201, 195)`, `--colors-primary3: rgb(252, 163, 159)`, `--colors-primary4: rgb(252, 130, 121)`, `--colors-primary5: rgb(253, 105, 88)`, `--colors-primary6: rgb(250, 69, 49)`, `--colors-primary7: rgb(207, 56, 40)`, `--colors-primary8: rgb(162, 43, 31)`, `--colors-primary9: rgb(116, 30, 21)`, `--colors-primary10: rgb(71, 17, 12)`
- **Layout:** root 16px; containers 900px, 340px, 250px, 1440px; grid —; gaps 12px, 16px, 8px, 6px; radii 8px, 10px, 22px, 4px
- **Motion:** durations 0.2s, 150ms, 0.1s, 0.15s, .1s; easings linear, ease-out, ease, ease-in-out; keyframes k-lFWJD, scroll
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 0; libraries nextjs; breakpoints (min-width: 800px), screen and (min-width: 30em), (max-width: 600px), screen and (min-width: 650px), screen and (min-width: 800px), screen and (min-width: 1000px)
- **Media:** `img-dossiers/arc-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/arc.json`, CSS: `data/dossiers/css/arc/`.

### Playdate (Panic)

Ürün sunumu · https://play.date/ · owner: **like** — "renk tasarım canlı göze çarpıyor bakması stili güzel"

17 screens with one-word chapters (The System, The Design, The Crank, The Season). Roobert only; Display-P3 yellow and purple; role variables (--accent, --page-bg); 10 px root, 800 px container; very large body (28.5 px); 100 ms transitions; reduced-motion rules.

- **Fonts:** Roobert 300, 400, 500, 700, 800
- **Type scale:** 68.4 px Roobert 800 lh 1 tr normal; 57 px Roobert 700 lh 1.1 tr normal; 51.3 px Roobert 800 lh normal tr normal; 50.7 px Roobert 700 lh normal tr normal; 39.9 px Roobert 700 lh normal tr normal; 34.2 px Roobert 700 lh normal tr normal; 34.2 px Roobert 700 lh 1.3 tr normal
- **Text / ground colours:** color(display-p3 0.192 0.184 0.157), color(display-p3 1 1 1), color(display-p3 0 0 0), color(display-p3 0.694 0.686 0.659) / color(display-p3 0.478 0.502 0.522), color(display-p3 1 0.784 0.2), color(display-p3 0.129 0.133 0.137), color(display-p3 0.424 0 1)
- **Colour variables:** `--subtler: rgba(0,0,0,.25)`, `--black: color(display-p3 0 0 0)`, `--darkest-gray: #1d1c18`, `--psd-darkest-gray: color(display-p3 0.129 0.133 0.137)`, `--screen-black: color(display-p3 0.192 0.184 0.157)`, `--dark-gray: color(display-p3 0.341 0.333 0.306)`, `--mid-gray: color(display-p3 0.492 0.480 0.457)`, `--psd-dark-gray: color(display-p3 0.478 0.502 0.522)`, `--psd-mid-gray: color(display-p3 0.392 0.404 0.424)`, `--screen-white: color(display-p3 0.694 0.686 0.659)`
- **Layout:** root 10px; containers 800px, 1100px, 1070px, 1440px; grid 2 cols · 192.375px 288.562px; 1 cols · 600px; gaps 2.74312px, 10.9725px, 10px, 50px; radii 2.85px, 1.8525px, 50%, 21.945px
- **Motion:** durations .1s, 250ms, 300ms, 150ms, 200ms, 10s, 5000ms; easings linear, ease-in-out, ease-out, ease; keyframes blobble, pulse, catalogGamesBannerScroll
- **Platform:** reduced-motion rules 3, view-transition 0, scroll-timeline 0, container queries 0; libraries three; breakpoints screen and (min-width: 670px), screen and (min-width: 240px), screen and (min-width: 1100px), (min-width: 670px), (min-width: 1100px), (prefers-reduced-motion: no-preference)
- **Media:** `img-dossiers/playdate-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/playdate.json`, CSS: `data/dossiers/css/playdate/`.

### Exat (Hot Type)

Tür dışı · https://exat.hottype.co/ · owner: **like** — "çok güzel ama bizimle alakası pek yok"

Type-specimen poster flow up to 654 px letters; Exat / Exat Condensed; GSAP + ScrollTrigger + Lenis; 40-column grid; viewport-scaled root font. Liked for boldness, owner notes it is unrelated to the portfolio.

- **Fonts:** Exat Variable ?; Exat 200, 300, 400, 500, 700, 800, 900; Exat Wide 200, 300, 400, 500, 700, 800, 900; Exat Condensed 200, 300, 400, 500, 700, 800, 900
- **Type scale:** 654.1 px Exat Variable 400 lh 0.78 tr -26.1651px; 300 px Exat 500 lh 0.94 tr -20.9987px; 110 px Exat 500 lh 0.87 tr normal; 110 px Exat 500 lh 0.9 tr -2.19986px; 106 px Exat 500 lh 0.88 tr -2.11986px; 90 px Exat 500 lh 1 tr -3.59977px; 72 px Exat 500 lh 1 tr -0.719954px
- **Text / ground colours:** rgb(28, 29, 30), rgb(238, 239, 235), rgb(255, 152, 251), rgb(255, 11, 0) / rgb(238, 239, 235), rgb(28, 29, 30), rgb(255, 98, 0), rgb(255, 206, 46)
- **Colour variables:** `--blue-03: #0000cb`, `--blue-02: #2546ff`, `--blue-01: #5c92ff`, `--yellow-01: #ffce2e`, `--yellow-02: #ffae00`, `--orange-01: #ff6200`, `--red-01: #ff0b00`, `--pink: #ff98fb`, `--green: #1c7511`, `--black: #1c1d1e`
- **Layout:** root 99.9936px; containers 100%, 1439.91px, 1349.91px, 689.956px; grid 40 cols · 34.9688px 34.9688px 34.9688px 34.9844px 34.9688px 34.9688px ; 7 cols · 206.281px 206.281px 206.281px 206.297px 206.281px 206.281px ; gaps 19.9987px, 39.9974px, 32.9979px, 9.99936px; radii 50%
- **Motion:** durations 200ms, 300ms, 150ms, 1s, 500ms, 800ms, .2s; easings ease, linear, ease-out, cubic-bezier(0.84, 0.01, 0.18, 1); keyframes fadeInOut, splide-loading, ss-valueIn, ss-valueOut, zoom-start
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 0; libraries gsap, ScrollTrigger, lenis; breakpoints screen and (max-width: 768px)and (orientation: portrait), screen and (min-width: 1441px), screen and (-ms-high-contrast:none), screen and (min-width: 768px), screen and (max-width: 768px) and (orientation: portrait)
- **Media:** `img-dossiers/exat-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/exat.json`, CSS: `data/dossiers/css/exat/`.

### Anthony Fu

Portfolyo · ana sayfa · https://antfu.me/ · owner: **like** — "çok temiz kendini açıklıyor ben buyum bunları yapıyorum harika"

1.4 screens: name, one line, 'Working at / Creator of / Core team of / Maintaining' rows with logos, short paragraphs; lines fade in 90 ms apart. Inter, DM Mono, Roboto Condensed, Bad Script; 656 px column; 150–200 ms on cubic-bezier(.4,0,.2,1); view-transition and reduced-motion rules; follows the system light/dark setting.

- **Fonts:** Roboto Condensed 400; Inter 400; DM Mono 400; Bad Script 400
- **Type scale:** 36 px Inter 800 lh 1.11 tr normal; 16.8 px ui-serif 400 lh 1.75 tr normal; 16 px Inter 400 lh 1.5 tr normal; 16 px Inter 400 lh 1.75 tr normal; 16 px Roboto Condensed 400 lh 1 tr normal; 16 px DM Mono 400 lh 1.75 tr normal; 14 px Inter 400 lh 1.43 tr normal
- **Text / ground colours:** rgb(85, 85, 85), rgb(0, 0, 0), rgb(136, 136, 136), rgb(55, 65, 81) / 
- **Colour variables:** `--color-note: #2f81f7`, `--color-tip: #3fb950`, `--color-warning: #d29922`, `--color-severe: #db6d28`, `--color-caution: #f85149`, `--twoslash-border-color: #8888`, `--twoslash-highlighted-border: #c37d0d50`, `--twoslash-highlighted-bg: #c37d0d20`, `--twoslash-popup-bg: #191919`, `--twoslash-popup-shadow: #00000014 0px 1px 4px`
- **Layout:** root 16px; containers 656.094px; grid 2 cols · 842.938px 533.062px; 11 cols · 33.75px 61.4375px 39.25px 71.625px 19.1875px 19.1875px 19.18; gaps 4px, 8px, 19.2px; radii 4px, 2px, 9999px
- **Motion:** durations .15s, .2s, .5s, .3s, 1s, .4s, 10s; easings cubic-bezier(.4,0,.2,1), ease, ease-in-out, ease-out, cubic-bezier(0,0,.2,1), linear; keyframes grow-69a3f4dd, slide-enter
- **Platform:** reduced-motion rules 3, view-transition 6, scroll-timeline 0, container queries 0; libraries —; breakpoints (width>=1024px), (width>=1280px), (width>=768px), print, (width>=640px), (prefers-reduced-motion)
- **Media:** `img-dossiers/anthony-fu-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/anthony-fu.json`, CSS: `data/dossiers/css/anthony-fu/`.

### Louis Paquet

Portfolyo · ana sayfa · https://louispaquet.com/ · owner: **dislike** — "basitliği güzel her şey açık ve net, ama işlerini görebilmek için teker teker yüksek bütçeli sayfalar açmak optimal bir yol değil"

2.6 screens: label column (About, Latest work, Courses) and content column, everything 18 px Inter 650, 100 px between sections, one-line work rows with arrows, fixed contact. Variables --grid-columns 6, --grid-margin 1.5rem; 18 px root; one breakpoint at 1024 px. Work links open clients' live sites in new tabs.

- **Fonts:** Inter 100 900
- **Type scale:** 18 px Inter 650 lh 1.2 tr normal; 18 px Inter 650 lh 1.2 tr normal
- **Text / ground colours:** rgb(31, 31, 31) / 
- **Colour variables:** `--color-black: #1f1f1f`, `--color-white: #E0DEDA`, `--color-red: #8B2635`, `--color-green: #D3EFBD`
- **Layout:** root 18px; containers ; grid 3 cols · 450px 450px 450px; 3 cols · 444px 444px 444px; gaps 16px, 18px, 100px 27px, 13.5px; radii 50%
- **Motion:** durations .5s, 1s, .3s; easings ease-out, cubic-bezier(.215, .61, .355, 1); keyframes —
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 0; libraries —; breakpoints screen and (min-width: 1024px), screen and (max-width: 1023px), (prefers-color-scheme: light)
- **Media:** `img-dossiers/louis-paquet-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/louis-paquet.json`, CSS: `data/dossiers/css/louis-paquet/`.

### Jakub Krehel

Portfolyo · içerik · https://jakub.kr/ · owner: **like** — "ilk sayfa çok sade spark diyebileceğim bir hissi yok ama işleri projeleri ve yazılarının içeriği ve sunumu baya güzel ve ilham verici, sadece tek siyah beyaz bence göz yorucu"

2.6 screens, everything 16 px: name and role, two sentences, projects (name + one line), writing list, newsletter. The liked part is the content; the first page reads flat (one size, one weight). System UI text, Open Runde / Heldane / Libre Baskerville in posts; lab() colours; 692 px container; follows system light/dark.

- **Fonts:** openRunde 500, 600; heldane 400; libreBaskerville 400
- **Type scale:** 16 px ui-sans-serif 500 lh 1.38 tr normal; 16 px ui-sans-serif 450 lh 1.38 tr normal; 16 px ui-sans-serif 400 lh 1.63 tr normal; 16 px ui-sans-serif 450 lh 1.63 tr normal; 16 px ui-sans-serif 500 lh 1.63 tr normal
- **Text / ground colours:** lab(46.64 0 0), lab(12.304 -0.00000745058 0), lab(98.956 0.0000298023 -0.0000119209) / rgb(252, 252, 252), lab(100 0 0)
- **Colour variables:** `--color-red-50: lab(96.5005% 4.18508 1.52328)`, `--color-red-100: lab(92.243% 10.2865 3.83865)`, `--color-red-200: lab(86.017% 19.8815 7.75869)`, `--color-red-500: lab(55.4814% 75.0732 48.8528)`, `--color-red-600: lab(48.4493% 77.4328 61.5452)`, `--color-red-900: lab(28.5139% 44.5539 29.0463)`, `--color-red-950: lab(13.003% 29.04 16.7519)`, `--color-orange-50: lab(97.7008% 1.53735 5.90649)`, `--color-orange-100: lab(94.7127% 3.58394 14.3151)`, `--color-orange-200: lab(88.4871% 9.94918 28.8378)`
- **Layout:** root 16px; containers 692px; grid —; gaps 12px, 8px, 24px; radii 16px, 8px, 5px, 3.35544e+07px
- **Motion:** durations .15s, .2s, .01ms, 3s, .3s, .5s, 0s; easings ease, linear, ease-out, ease-in, ease-in-out, cubic-bezier(.4, 0, .2, 1); keyframes enter, viewfinder-focus, viewfinder-scan, spin, pulse
- **Platform:** reduced-motion rules 4, view-transition 0, scroll-timeline 0, container queries 0; libraries nextjs; breakpoints (prefers-color-scheme:dark), (min-width:40rem), (min-width:48rem), (hover:hover), (prefers-reduced-motion:reduce), (min-width:64rem)
- **Media:** `img-dossiers/jakub-krehel-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/jakub-krehel.json`, CSS: `data/dossiers/css/jakub-krehel/`.

### Jhey Tompkins

Portfolyo · https://jhey.dev/ · owner: **like** — "hiçbir şey içermiyor ama sadelik ve şıklık var nötr'üm ama hitap etmiyor"

One screen: serif 'Making your ideas click', short intro, signature, link list. DM Serif Text, Inter 300, Doto; built with Astro (its view-transition keyframes present); grayscale images; subtle link hovers.

- **Fonts:** DM Serif Text-06c75f9b58f80d38 400; Doto-bb558af012af430a 400; Inter-280267e3536fdc11 400
- **Type scale:** 58.1 px DM Serif Text-06c7 600 lh 1 tr normal; 16 px Inter-280267e3536f 300 lh 1.5 tr normal; 14 px Doto-bb558af012af4 600 lh 1.43 tr normal
- **Text / ground colours:** color(srgb 0.4 0.4 0.4), oklch(0.704 0.191 22.216) / rgb(255, 255, 255)
- **Colour variables:** `--color-red-400: oklch(70.4% .191 22.216)`, `--color-red-500: oklch(63.7% .237 25.331)`, `--color-gray-300: oklch(87.2% .01 258.338)`, `--color-gray-800: oklch(27.8% .033 256.848)`, `--color-neutral-300: oklch(87% 0 0)`, `--color-neutral-700: oklch(37.1% 0 0)`, `--color-black: #000`, `--color-white: #fff`
- **Layout:** root 16px; containers 1392px; grid 1 cols · 20px; 1 cols · 40px; gaps 8px; radii 6px
- **Motion:** durations 1s, .2s, .15s, .35s; easings ease, ease-in, linear, ease-out, ease-in-out, cubic-bezier(.4,0,.2,1); keyframes marquee, reveal, fill, draw, blink, spin, astroFadeInOut, astroFadeIn
- **Platform:** reduced-motion rules 4, view-transition 3, scroll-timeline 0, container queries 1; libraries —; breakpoints (prefers-reduced-motion:no-preference), (min-width:968px), (min-width:40rem), (min-width:48rem), (min-width:80rem), (min-width:96rem)
- **Media:** `img-dossiers/jhey-tompkins-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/jhey-tompkins.json`, CSS: `data/dossiers/css/jhey-tompkins/`.

### Maxime Heckel

Portfolyo · içerik · https://blog.maximeheckel.com/ · owner: **like** — "çok bir havası yok, tüm işlerini sunuyor ve güzel güzel açıklıyor ama üzerine çok da okumak için bir sebep vermiyro çok teknik kalıyor"

Six screens: a blue WebGL infinity sign and two paragraphs, then a dense dated list by year. Largest type 24 px; Inter, Departure Mono, Fira Code; spacing and radius scales as variables (--space-0…11, --border-radius-0…3); oklch colours; page transitions via view transitions.

- **Fonts:** KaTeX_Size4 400; FiraCode ?; KaTeX_Size3 400; KaTeX_Fraktur 400, 700; KaTeX_SansSerif 400, 700; KaTeX_Main 400, 700; KaTeX_Caligraphic 400, 700; KaTeX_Size2 400
- **Type scale:** 24 px inter 510 lh 1.2 tr -0.528px; 16 px inter 500 lh 1.75 tr -0.25px; 16 px inter 560 lh 1.75 tr 0.3px; 16 px inter 500 lh 1.75 tr 0.3px; 14 px inter 560 lh 1.75 tr 0.3px; 14 px DepartureMono 560 lh 1.75 tr -1px; 14 px inter 500 lh 1.75 tr 0.3px
- **Text / ground colours:** oklch(0.6665 0.04 262.04), oklch(0.7716 0.028 262.04), oklch(0.9366 0.027 262.04) / oklch(0.1468 0.01 262.04), oklch(0.1292 0.005 262.04), oklch(0.1468 0.01 262.04 / 0.9)
- **Colour variables:** `--white: oklch(100% 0 0)`, `--gray-000: oklch(12.92% 0.005 var(--base-hue))`, `--gray-100: oklch(14.68% 0.01 var(--base-hue))`, `--gray-200: oklch(16.75% 0.011 var(--base-hue))`, `--gray-300: oklch(17.8% 0.012 var(--base-hue))`, `--gray-400: oklch(24.84% 0.018 var(--base-hue))`, `--gray-500: oklch(28.69% 0.023 var(--base-hue))`, `--gray-600: oklch(35.33% 0.028 var(--base-hue))`, `--gray-700: oklch(41.6% 0.035 var(--base-hue))`, `--gray-800: oklch(48.49% 0.042 var(--base-hue))`
- **Layout:** root 16px; containers ; grid 6 cols · 85.1562px 85.1562px 85.1562px 85.1562px 85.1562px 85.1562px; 3 cols · 0px 1440px 0px; gaps normal 24px, 8px normal, 4px, normal 8px; radii 12px, 0px 0px 4px 4px
- **Motion:** durations 0.3s, 10s, 0.5s, 150ms, 2100ms, .2s, .18s; easings linear, ease, ease-in-out, ease-out, cubic-bezier(0.2, 0.85, 0.32, 1.2); keyframes fade-in, page-view-transition-fade-out, page-view-transition-fade-in, k-ksbDlz, k-kLbiSv, k-juXKYz, k-cBVbyC, k-fRsylC
- **Platform:** reduced-motion rules 1, view-transition 6, scroll-timeline 0, container queries 0; libraries three, nextjs; breakpoints (hover: hover) and (pointer: fine), (max-width: 960px), (min-width: 640px), (max-width: 750px), (max-width: 600px), (prefers-reduced-motion:reduce)
- **Media:** `img-dossiers/maxime-heckel-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/maxime-heckel.json`, CSS: `data/dossiers/css/maxime-heckel/`.

### Robin Noguier

Portfolyo · Work · https://www.robin-noguier.com/ · owner: **like** — "ilk sunum ve sunumdan içeriğe geçişi çok akıcı bayıldım, ama birkaç şeyi sunuyor ama kendisini sunmuyor, portfolyo'nun kendisi için değil ancak work kısmında iş görebilir"

Single-screen WebGL carousel; one-word project names (135 px), one line, 'Open case study'. Shared-element transition into the project page (1.4 s open, 1.6 s back, no reload). Eksell Display + Silka; clip-path curtains; styles live in JS, so little readable CSS.

- **Fonts:** silka_rm 400, 700; eksell_rm_large normal; eksell_rm_small normal
- **Type scale:** 135 px eksell_rm_large 400 lh 1 tr normal; 20 px silka_rm 400 lh 1.6 tr normal; 16 px silka_rm 700 lh 1.5 tr 2px; 14 px silka_rm 700 lh 1.5 tr 2px
- **Text / ground colours:** rgb(255, 255, 255), rgb(213, 222, 221), rgba(0, 0, 0, 0) / rgb(0, 0, 0), rgb(61, 102, 129)
- **Layout:** root 16px; containers 580px; grid —; gaps —; radii 4px
- **Motion:** durations .1s, 0.2s; easings linear, ease-out, ease-in-out; keyframes —
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 0; libraries nextjs; breakpoints all and (min-height:625px), all and (orientation:landscape) and (max-device-width:375px), all and (orientation:landscape), (hover:hover)
- **Media:** `img-dossiers/robin-noguier-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/robin-noguier.json`, CSS: `data/dossiers/css/robin-noguier/`.

### Antoine Wodniack

Portfolyo · Work · https://wodniack.dev/ · owner: **like** — "renk göz yoruyor ama animasyon yazı ve font, work'ün sunuluş biçimi baya güzel bir showcase"

24 screens: giant tracked 'CREATIVE · DEVELOPER', thin serif intro, awards built into the page, a WORK letter wall with floating live project screens. Bigger Display 700 vs PP Editorial New 200 and PP Fraktion Mono; easings .86,0,.07,1 / .23,1,.32,1 / .19,1,.22,1 at 0.6–1 s; heavy clip-path; Lenis. Saturated #f40c3f ground over most of the screen (the eye strain the owner noted).

- **Fonts:** Fraktion Mono 400, 700; Editorial New 200, 400; Bigger Display 700
- **Type scale:** 138 px Bigger Display 700 lh 0.82 tr -0.4px; 105 px Bigger Display 700 lh 0.82 tr -0.4px; 36 px Editorial New 200 lh 1.13 tr -0.4px; 32 px Editorial New 200 lh 1.5 tr -0.4px; 20 px Editorial New 200 lh 2.4 tr -0.4px; 20 px Editorial New 400 lh 2.4 tr -0.4px; 20 px Editorial New 200 lh 1.3 tr -0.4px
- **Text / ground colours:** rgb(22, 0, 0), rgb(244, 12, 63) / rgb(244, 12, 63), rgb(22, 0, 0)
- **Colour variables:** `--color-primary: #fff2ed`, `--color-secondary: #160000`, `--color-shadow: #4d4040`
- **Layout:** root 16px; containers ; grid 4 cols · 157px 157px 157px 157px; gaps —; radii 15984px
- **Motion:** durations 1s, .6s, .3s, .8s, 2s, .1s, 10s; easings linear, cubic-bezier(.86,0,.07,1), cubic-bezier(1,0,0,1), cubic-bezier(.23,1,.32,1), cubic-bezier(.55,.055,.675,.19), cubic-bezier(.215,.61,.355,1); keyframes site-head-caret, blink-in, s-hero-move-to-left, s-hero-move-to-right, s-hero-move-to-top, s-hero-move-to-bottom, rotate, vanish
- **Platform:** reduced-motion rules 0, view-transition 0, scroll-timeline 0, container queries 0; libraries lenis; breakpoints only screen and (max-width: 767px) and (orientation: landscape),only screen and (max-width: 576px), only screen and (max-width: 767px), only screen and (max-width: 987px), only screen and (max-width: 1080px), only screen and (max-width: 1280px), only screen and (max-width:400px)
- **Media:** `img-dossiers/antoine-wodniack-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/antoine-wodniack.json`, CSS: `data/dossiers/css/antoine-wodniack/`.

### Mathis Biabiany

Portfolyo · Work · https://www.mathis-biabiany.fr/ · owner: **like** — "yavaş ve kötü optimizasyon ama arka planda yaptığı ve özellikle 3d işleri inanılmaz iyi duruyor ama bizlik bir yanı şuan yok"

13 screens: giant name, then project cards with video scattered in a free collage, 'click to open the project', Projects / Labs. Fustat only; fluid gutters and nav type with clamp(); easings .22,1,.36,1 and .165,.84,.44,1 at 0.2–0.45 s; 17 reduced-motion rules; slow because video and real-time 3D load together.

- **Fonts:** Fustat 500
- **Type scale:** 190.5 px Fustat 700 lh 0.9 tr -6.66792px; 112.3 px Fustat 700 lh 1 tr -3.3696px; 90 px Fustat 500 lh 1 tr -2.7px; 30 px Fustat 700 lh 1.1 tr -0.89856px; 16 px Fustat 500 lh normal tr normal; 15.8 px Fustat 500 lh 1.55 tr -0.1584px; 15.8 px Fustat 500 lh 1 tr -0.1584px
- **Text / ground colours:** rgb(20, 20, 20), rgba(20, 20, 20, 0.42), rgb(255, 255, 255), rgb(243, 241, 234) / rgb(243, 241, 234), rgba(20, 20, 20, 0.08), rgb(242, 237, 227), rgba(0, 0, 0, 0.28)
- **Colour variables:** `--pm-bg: #f3f1ea`, `--pm-text: #141414`, `--pm-muted: hsla(0,0%,8%,.42)`, `--pm-faint: hsla(0,0%,8%,.12)`, `--pd-bg: #f3f1ea`, `--pd-text: #141414`, `--pd-muted: hsla(0,0%,8%,.42)`
- **Layout:** root 16px; containers 100%, 374.4px; grid 1 cols · 1290.25px; 1 cols · 46px; gaps 7.8px, 54px, 29.52px, 86.4px; radii 20px, 999px, 50%, 2.46px / 2.47px
- **Motion:** durations .25s, .2s, .35s, .3s, .4s, .45s, .18s; easings ease, cubic-bezier(.22,1,.36,1), cubic-bezier(0.165, 0.84, 0.44, 1), cubic-bezier(.65,0,.35,1), cubic-bezier(.76,0,.24,1), cubic-bezier(.4,0,.6,1); keyframes pm-about-pile-in, pm-menu-content-in, pm-sound-bar-377bdc33, orientation-lock-nudge-4f7d0042, mask-exit-attn
- **Platform:** reduced-motion rules 17, view-transition 0, scroll-timeline 0, container queries 0; libraries three; breakpoints (prefers-reduced-motion:reduce), (hover:hover)and (pointer:fine), (hover:none), (max-width:620px), (prefers-reduced-motion: reduce), (min-width:741px)
- **Media:** `img-dossiers/mathis-biabiany-*` (arrival and scroll clips, hovers, frames). Data: `data/dossiers/mathis-biabiany.json`, CSS: `data/dossiers/css/mathis-biabiany/`.
