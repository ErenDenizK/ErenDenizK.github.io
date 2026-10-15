# Research: the owner's reference study (2026-10-12 to 2026-10-14)

**Status:** digest of the owner's reference research 2026-10-12..14; evidence, not decisions. Written
2026-10-15 from the archive the owner sent in five zip parts (the department's own name for it: "Reference
research archive"); its text and data are in [`references/`](references/README.md). This is postmortem step 1 ("References first") done; the design charter
(postmortem step 2) is still to be written from it. Nothing here changes the brief: where the research
leans away from a brief line, the line stands until the owner says otherwise, and the question is listed
at the end.

The research was done on the owner's own computer by a separate session (the "department"), because this
environment cannot reach outside sites (postmortem cause 2). The owner framed it on 2026-10-14:
"Üretim ve kararlar portfolyonun işi; departman toplar, ölçer, ilk analizi raporlar" (production and
decisions belong to the portfolio; the department collects, measures and reports a first analysis).

How claims are marked:

- **[M] measured**: a number in the archive's JSON, produced by its capture tools.
- **[S] seen**: something a reader of this digest looked at in a capture.
- **[O] owner said**: the owner's words, Turkish as written, with an English gloss.
- **[R] outside research**: a study or practitioner the archive cites, with its own confidence.
- **[I] interpretation**: the department's reasoning, or ours where it says "ours".

## 1. What was studied

Six studies, all with Playwright driving Chrome on the owner's Windows machine. Desktop 1440×900 at 1×,
phone 390×844 at 2× with an iPhone user agent (Chrome emulation, not Safari). Emails and phone numbers were
blurred before capture.

| # | Study (date) | What | Size |
|---|---|---|---|
| 1 | 29 sites, first measurements (10-12) | personal brands, product pages, photography; first paint, settle time, length, type, palette, media share | 29 sites [M] |
| 2 | Picker (10-12) | three agent lists of award and praised sites, shown in a like/dislike picker; the owner voted with notes | 127 sites, 31 votes: 15 like, 16 dislike, cast in about 28 minutes [M] |
| 3 | Anatomy of the loved sites (10-12) | fonts, type scale, colours, transitions, libraries, scroll journey | 12 loved sites plus Robin Noguier [M] |
| 4 | CV-like home pages (10-14) | length, sections, gaps, column, first-screen words, a "hiring checklist" of where name, role, projects, contact and now appear | 13 home pages, 9 in the report's table [M] |
| 5 | Work transitions (10-14) | click a gallery tile, record at high frame rate, measure settle, check same document and View Transitions use, go back | 14 galleries probed, 3 usable [M] |
| 6 | Liked-site dossiers (10-14) | each liked site's CSS parsed (fonts, variables, keyframes, easings), arrival, scroll and hover clips | 16 sites [M] |

Outputs: an English report ([`references/report.md`](references/report.md)), a Turkish report
([`references/rapor.html`](references/rapor.html)), dossier reports in both languages
([`references/liked-sites.md`](references/liked-sites.md),
[`references/begenilenler.html`](references/begenilenler.html)), the owner's criteria
([`references/criteria.tr.md`](references/criteria.tr.md), dated 2026-10-12 and 2026-10-14), a sources
file with confidence marks ([`references/sources.md`](references/sources.md)), all JSON, about 1,800 images and the tools. 111 MB in all, most of it captures.

**Limits that apply to everything** (from the archive and from reading its tools):

- Phone numbers are Chrome emulation. Safari behaviour, including view transitions, is unmeasured.
- Every library capture emulated `prefers-color-scheme: dark`, so dark-ground shares run high [M].
- Settle time comes from an 8-second window; 79 of 127 sites were still moving at 8 s [M]. Gated or
  scroll-jacked sites report a page height of exactly 1 screen [M].
- CSS numbers understate motion on sites that animate in JavaScript or WebGL (Robin Noguier, Mathis
  Biabiany, Antoine Wodniack's scroll, Shopify's WebGL) [I].
- The dossiers do not measure line length; the Study 2 captures do (`lineChars`, median characters per
  line of body paragraphs) [M]. Line lengths quoted from dossiers are a digest reader's counts from one line
  per screenshot [S].
- Likes are mostly product pages (8 of 15), dislikes mostly portfolios (11 of 16) [M]. Samples are small
  and the quartiles overlap on every measure: read directions, not thresholds.
- Some picker first frames were intro or gate screens (Merouane Bali "Enter", Jesse Zhou "START", Henry
  Heffernan's boot box) [S]; a few votes may have been cast on that frame.
- The arc.net capture shows "Meet Dia, the next evolution of Arc" [S], so the Arc like may be partly a
  vote for Dia.
- The English report alone misses most project-page guidance (it lists 3 of the 8 shared patterns); the
  Turkish one drops the full Study 1 reasoning, the photography detail and the 64/40 px type cap. Both
  editions were read.

**Spot checks made for this digest** against the raw JSON (all matched):

1. Votes: 15 like, 16 dislike; Louis Paquet is `dislike` ([`references/data/picker/votes.json`](references/data/picker/votes.json)).
2. Robin Noguier transition: `open.settleS` 1.38, `back.settleS` 1.63, `sameDocument` true,
   `viewTransitions` 0 ([`references/data/study5-work-transitions/robin-noguier.json`](references/data/study5-work-transitions/robin-noguier.json)).
3. Dia text colours include `rgba(0,0,0,.85)`, `.7`, `.6` (also `.424` to `.55`) ([`references/data/study3-anatomy/`](references/data/study3-anatomy/)).
4. Anthony Fu: `slide-enter` 1000 ms with delays 90, 180, 270 … 630 ms, linear ([`references/data/study3-anatomy/`](references/data/study3-anatomy/)).
5. Antoine Wodniack: `bodyBg` rgb(244,12,63), `htmlBg` rgb(22,0,0) ([`references/data/study3-anatomy/`](references/data/study3-anatomy/)).
6. Jakub Krehel ground rgb(12,12,12) = #0c0c0c ([`references/data/study3-anatomy/`](references/data/study3-anatomy/)).
7. Shopify Editions `docScreens` 60.1 desktop, 65.6 phone ([`references/data/dossiers/shopify-editions.json`](references/data/dossiers/shopify-editions.json)).
8. `lineChars` exists in the library captures (132 `measurements.json` files, kept off the repo), which settles a
   disagreement between two digests about whether line length was measured.
9. The sources file holds the NN/g light-mode finding (Budiu 2020) that the final report omits.
10. "yedek", the fourth question the owner left unanswered, appears only in the criteria file. Report 02
    asks three questions (project link, long version, glass object); nothing explains the fourth.

## 2. The owner's taste, as evidenced

### 2.1 Who the site speaks to [O, 2026-10-12]

1. The hirer first: the Home page answers "neden bu kişiyi işe alayım?" (why should I hire this person?):
   what they know, what they made, what they focus on, "en hızlı yoldan" (by the fastest route).
2. Second, someone just met: "ha bunlarla ilgileniyorsun, şunları yapmışsın, güzelmiş" (oh, so this is
   what you're into, you've made these, nice).
3. Both through a good presentation.

### 2.2 Aesthetics [O, 2026-10-12]

- Text that does not tire the eyes. Pure black and white together can tire them (Jakub note); so can
  saturated, shouting colour (Antoine note).
- "Tekdüze olmamalı" (not monotonous): not a row of plain text and plain photos.
- "Nokta atışı anlatım" (pinpoint wording): no long ornate sentences such as "hayalleri gerçeğe
  dönüştürüyorum" (I turn dreams into reality). Short, direct, clear, correct.
- Every scroll should raise "devamında ne var?" (what comes next?).

### 2.3 Page jobs [O, 2026-10-12, then views of 2026-10-14 marked "görüş, karar değil"]

- **Home**: "olabildiğince sade ve açıklayıcı, biraz CV mantığında" (as simple and explanatory as
  possible, somewhat CV-like). Models: Anthony Fu ("ben buyum, bunları yapıyorum", this is me, I do
  these) and Louis Paquet's simplicity. On 10-14: "tek sayfa simple olanlardaki netliği istiyorum" (I want
  the clarity of the simple one-page sites), plus Dia's "ben buyum". "Uzun bir şey mi olmalı kısa bir şey
  mi olmalı? Emin değilim. Ama biraz daha derli toplu olmalı." (Long or short? Not sure. But tidier.)
  "Herhalde şerit şerit... düşünüyor olabilirim" (probably strip by strip). The works section "Work'e bir
  yönlendirme olabilir" (could be a pointer to Work).
- **Opening moment** [10-14]: a big opening, or a 1–2 s "hızlı vitrin sonra küçülme" (quick showcase then
  shrink), "bence hiç uygun değil" (doesn't fit at all); for the hirer "daha direkt bir şey olması daha iyi
  olabilir" (something more direct may be better).
- **Work**: "çok daha etkileşimli, animasyonlu, ürün odaklı" (much more interactive, animated,
  product-focused). The visitor who gets here already knows you and wants to understand the work. On
  10-14: works side by side or stacked; on click the image opens fluidly and completes into its own page,
  "yeni sayfa açılmış gibi hissettirmiyor" (it doesn't feel like a new page). "Work'e de öyle bir şey
  isterim muhtemelen" (I'd probably want something like that for Work), naming Robin Noguier.
- **Products**: state the vision; explain step by step as the visitor scrolls, fast and without confusion
  (Dia, Anime.js, Notion Calendar). "Kullanıcıyı pazarlamak" (market the user): with this product you
  become a better you who now does this job like that.
- **Light-theme button** [10-14]: "galiba sitenin genel yapısına uymuyor" (probably doesn't fit the site);
  grounds could differ section by section; "burayı portfolyoya bırakmak da mantıklı olabilir" (it may make
  sense to leave this to the portfolio).
- **A "Şu sıralar" (now) section** [10-14]: "olabilir tabii ki de" (could be, of course), depending on the
  measurements.

### 2.4 Loves and likes [O, picker notes 2026-10-12]

The vote was binary, but the notes carry a finer scale [I]:

| Level | Sites and the owner's words |
|---|---|
| Loved ("BAYILDIM") | **Shopify Editions, Renaissance**: "hiçbir noktada sıkıcılaşmıyor harika bir kompozisyon harika bir akış" (never gets boring at any point, great composition, great flow). **Dia**: "minimalist harika bir özet … adım adım çok basit ve açıklayıcı ürünü güzel pazarlıyor" (minimalist, a great summary … step by step, very simple and explanatory, markets the product well). **Robin Noguier**, for the transition only: "sunumdan içeriğe geçişi çok akıcı bayıldım, ama … kendisini sunmuyor … work kısmında iş görebilir" (the move from presentation to content is very fluid, loved it, but he doesn't present himself; could serve in Work) |
| Liked, no reservation | **Anime.js**: "adım adım ürünü açıklıyor tek bir referans etrafında kendini çeşitlendiriyor … biz de ürün showcaselerken kullanabiliriz" (explains step by step, varies itself around one reference; we could use it for product showcases). **Anthony Fu**: "çok temiz kendini açıklıyor ben buyum bunları yapıyorum harika". **Notion Calendar**: "basit güzel akıcı anlatıyor" (tells it simply, nicely, fluently). **Playdate**: "renk tasarım canlı göze çarpıyor". **Stripe**: no note |
| Liked, with a named flaw | **Antoine Wodniack**: "renk göz yoruyor ama … work'ün sunuluş biçimi baya güzel bir showcase" (the colour tires the eyes, but the way the work is presented is a fine showcase). **Jakub Krehel**: "ilk sayfa çok sade spark diyebileceğim bir hissi yok … sadece tek siyah beyaz bence göz yorucu" (first page very plain, no spark … the single black-and-white tires the eyes). **Arc**: "biraz daha sönük ama minimalist ok" (a bit dull, but minimal, ok). **Mathis Biabiany**: "yavaş ve kötü optimizasyon … 3d işleri inanılmaz iyi duruyor ama bizlik bir yanı şuan yok" (slow, badly optimised … the 3D work looks incredible, but nothing "us" about it). **Maxime Heckel**: "okumak için bir sebep vermiyor çok teknik kalıyor" (gives no reason to read on, stays too technical) |
| Liked as "beautiful, not ours" | **Exat**: "çok güzel ama bizimle alakası pek yok". **Jhey Tompkins**: "hiçbir şey içermiyor ama sadelik ve şıklık var … hitap etmiyor" (contains nothing, but simple and elegant … doesn't speak to me) |

### 2.5 Dislikes [O]

| Kind | Sites and the owner's words |
|---|---|
| Disliked despite praise | **Louis Paquet**: "basitliği güzel her şey açık ve net, ama işlerini görebilmek için teker teker yüksek bütçeli sayfalar açmak optimal bir yol değil" (the simplicity is nice, everything clear, but opening heavy pages one by one to see the work is not optimal). **Merouane Bali**: "çok bir hiring ya da pazarlama noktası yok, sanırsam kendini iyi hızlı efektif ve modern pazarlama tanıtma çok önemli" (no real hiring or marketing point; presenting yourself well, fast, effectively and modernly matters a lot). **Eduard Bodak**: "güzel gösteriyor ama iyi açıklamıyor" (shows nicely, explains badly) |
| Slow, drawn out | Daylight "yorucu uzun uzun, hızlı ve açık değil"; Jesse Zhou "uzun sürüyor vakit alıyor" |
| Cheap, illegible, dated | Craig Mod "okunaksız ve ucuz"; Scout Motors "render'ları kötü ucuz ve cilasız"; Cyd Stumpel "eski kaldı pek modern değil" |
| Nothing eye-catching | Josh Comeau "göz alıcı bir tarafı yok"; Frank Chimero "bizlik değil vasat"; Chungi "avaraj" |
| Not our genre | Bézier, Cowboy "bize hitap etmiyor"; Henry Heffernan "bizle alakası yok"; Bruno Simon "kötü"; Lynn Fisher (no note) |

### 2.6 The patterns behind the notes [I, from the notes above]

- The owner dislikes **too little** (no spark, no reason, no self: Jakub, Maxime, Jhey, Arc) and **too
  much or too slow** (saturated colour, heavy loads, gates, external hops: Antoine, Mathis, Louis, Jesse
  Zhou, Daylight). The loves sit between: restrained ink, one strong meaningful moment per section, real
  proof, fast.
- Praise attaches to **flow** ("akış", "akıcı") and to **explaining step by step** ("adım adım"). Words
  for spectacle never appear as praise on their own.
- Seven notes judge "us / not us" ("biz", "bizlik", "bize"): the owner reads every site against an
  identity, not against a general idea of good.
- Home and Work are separated cleanly: Home wants Anthony Fu and Dia clarity; Work may carry Robin and
  Antoine showcase motion.
- What separates liked from disliked first screens [S, all 31 viewed]: a liked first screen says what the
  thing is in one line and shows it (a real product window under one headline; a dense self-introduction;
  one bold idea in one dominant colour). A disliked one withholds (a gate, empty black, a lone object),
  decorates (stickers, ornate type, laurels) or lists without showing (Louis Paquet).

## 3. Measured norms

### 3.1 The library and the votes [M, desktop medians, quartiles in brackets]

| Measure | All 127 | Liked (15) | Disliked (16) | Portfolios (20) |
|---|---|---|---|---|
| Body text | 16 px [14–19] | 16 [16–18] | 16 [16–18] | 16 |
| Line length (`lineChars`) | 41 ch [33–58] | 38.5 | 40 | 40 |
| Largest text, first screen | 52 px [29–76] | 48 [34–64] | 60 [21–93] | 45 |
| First paint | 2.2 s | 2.17 s | 2.08 s | 2.12 s |
| Settle | 4.35 s | 2.75 s | 3.08 s | 2.85 s |
| Page height | 6.8 screens | 9.4 | 3.6 | 1.65 |
| First-screen media | 2 % | 51 % | 5 % | 3.5 % |
| Strong colours (chromatic clusters) | 1 | 3 | 1 | 0.5 |
| Dark first screen | 50 % | 47 % | 69 % | 60 % |
| Height exactly 1 screen (gate or scroll-jack) | | 2 of 15 | 7 of 16 | |

Phone: body 16 px in every group; line length 33 ch; largest text 35 px [M].

What separates taste here [I]: page length, first-screen media and colour count go with likes, but that is
mostly the product-page share among likes. Speed, body size and line length do not separate likes from
dislikes at all. Two liked sites have the slowest first paint in the set (Exat 9.87 s, Anime.js 9.29 s)
[M]. So the owner's "slow" complaints are about gates, intro sequences and long heavy pages, not page-load
time, and a single load metric will not catch them.

### 3.2 The loved and liked sites [M unless marked]

| Site | Verdict | Screens | Body px / lh | Largest display | Ground and text | Main motion |
|---|---|---|---|---|---|---|
| Shopify Editions | loved | 60.1 | serif 28 and 20, lh 0.97 | 194 px chapter word | black and cream #f7f7ee; text olive greys #909083, #5c5c4e | colour 150 ms, opacity 300 ms on (.4,0,.2,1); cards 400–500 ms on (.34,1.56,.64,1) |
| Dia | loved | 7.0 | 20 / 1.5, fluid 15–21 | 48 px text; a ~200 px "DIA" wordmark that is not text [S] | #fbfaf6; one black at .85 / .70 / .60; large yellow hero [S] | 150–300 ms, one curve (.4,0,.2,1); no load animation |
| Anime.js | liked | 23.5 | 20 / 1.25 | 52 | warm charcoal #252423; text #b4b1af, #d5d3d1; one accent per feature | 100–125 ms UI; 500 ms ease-out |
| Notion Calendar | liked | 9.4 | 16 / 1.5 | 64 | white and #f6f5f4; one black at .90 / .54 | 150–250 ms; entrance scale .975→1; 20 reduced-motion rules |
| Stripe | liked | 16.9 | 16–18 / 1.4 | 56 | white; navy greys #50617a; violet accent | 300 ms (.25,1,.5,1); reveals 600–800 ms; 91 reduced-motion rules |
| Anthony Fu | liked, Home model | 1.4 | 16 / 1.75 | 36 | near black (dark) or white (light) | lines enter 90 ms apart, 1 s each; UI 150–200 ms |
| Jakub Krehel | liked content | 2.6 | 16 everywhere | 16 | #0c0c0c | 200–300 ms (0,0,.2,1) |
| Maxime Heckel | liked, "too technical" | 6.4 | 16 / 1.75 | 24 | one hue in oklch, ground L≈.15, text L≈.67 / .77 / .94 | 150–250 ms |
| Robin Noguier | liked for Work | 1 (carousel) | 20 / 1.6 | 135 | per project: #3d6681, white with salmon [S] | open 1.38 s, back 1.63 s, in JS |
| Antoine Wodniack | liked, colour tiring | 24.4 | thin serif 20–36 | 138 | #f40c3f over most of the area; Work on #160000 | 0.8–1 s on (.23,1,.32,1) and (.86,0,.07,1); 34 videos |
| Mathis Biabiany | liked work, "slow" | 13.7 | 15.8 / 1.55 | 190 | cream #f3f1ea, #141414 | 180–450 ms; 5 videos and real-time 3D on load |
| Louis Paquet | **disliked** | 2.6 | 18 / 1.2 everything | 18 | #1f1f1f on #e0deda | fades 0.3–1 s |

What recurs across them [I, from the table]:

- **Body** 16 px is the floor where people read; the two loves go to 20 px. Reading line height 1.5–1.75.
- **Display**: quiet pages cap headings at 36–64 px. Only art-directed pages go past 100 px, and every
  portfolio with a giant name drew an owner complaint (Mathis slow, Antoine colour, Robin no self).
- **Tracking** on large display type: -0.02 to -0.05 em.
- **Line length**: liked reading lines run about 44–67 characters [S]; the long ones (Anthony Fu ~79,
  Jhey ~74, Jakub ~88) are the pages the owner found plain.
- **Colour**: one ink at three or four opacities or lightnesses, plus at most one accent at a time. The
  strongest pages never set text in pure black or pure white.
- **Motion**: UI 150–300 ms almost everywhere; entrances 400–1000 ms; `cubic-bezier(.4,0,.2,1)` is the
  most shared curve; entrances decelerate ((.22,1,.36,1), (.25,1,.5,1), (.23,1,.32,1),
  (.165,.84,.44,1)). Only Shopify overshoots.
- **Reduced motion**: the best-built pages have many rules (Stripe 91, Notion 20, Mathis 17); Anime.js,
  Antoine, Robin, Arc, Exat and Louis have none in CSS.
- **Orientation on long pages**: Shopify's fixed I–XII index with an active item, Anime.js's lit ring
  segment, Dia's numbered steps, Robin's dot index.

### 3.3 CV-like home pages, Study 4 [M]

| Site | Screens desk / phone | Sections | Gap px | Column px | First-screen words | Largest px | Vote |
|---|---|---|---|---|---|---|---|
| Anthony Fu | 1.4 / 2.0 | 4 | 65 | 656 | 160 | 36 | like |
| Lee Robinson | 1.4 / 1.9 | 3 | 56–61 | 600 | 121 | 42 | none |
| Guillermo Rauch | 1.1 / 1.1 | 3 | 47–284 | 624 | 143 | 18 | none |
| Paco Coursey | 1.6 / 1.9 | 4 | 64–68 | 640 | 103 | 16 | none |
| Brian Lovin | 1.7 / 2.6 | 3 | 64–179 | 640 | 48 | 24 | none |
| Louis Paquet | 2.6 / 3.3 | 4 | 100 | 444 | 67 | 18 | dislike |
| Jakub Krehel | 2.6 / 2.7 | 5 | 64–188 | 660 | 161 | 16 | like |
| Emil Kowalski | 2.8 / 2.7 | 7 | 116–144 | 668 | 101 | 16 | none |
| Dia (product) | 7.4 / 8.7 | 10 | 101–1521 | full | 20 | 48 | loved |

Only one of the eight personal home pages (Anthony Fu) was liked without reservation, and five were never
voted on. The strip numbers describe a genre, not a measured preference [I].

## 4. Findings per question

### 4.1 Home

- **Answer the hiring question in the first two screens.** [O] plus [R]: NN/g 2018, 57 % of viewing
  time above the fold, 74 % in the first two screens (high confidence); a recruiter's first résumé scan
  about 7.4 s (Ladders 2018, magnitude only, sample size unknown). Strong.
- **Short and built in strips** [M, Study 4]: 1.1–2.8 screens, 3–7 sections, each a small grey label plus
  content, a constant gap within a site, one column of 600–670 px, 50–160 words on the first screen, the
  largest type 16–42 px ("büyüklük yok, düzen var", no size, but order). Two strip forms [S]: the label in
  a left column (Louis Paquet) or above the content (Emil Kowalski). Medium: measured, but on sites the
  department chose.
- **A stable order** [M, 8 sites]: name and role (within the first 130 px) → today (one or two sentences:
  where you are, what you do) → work (a name and one sentence per row) → writing (a dated list; here the
  Record) → now or personal (optional) → links.
- **Anthony Fu's structural rows** [S, I]: "Working at / Creator of / Core team of / Maintaining", each
  followed by small project chips. For this site the department sketched "Studying at YTU", "Building
  Recto, English Prep, Eat Map", "Focused on …". The same screenshot carries Anthony's line "Dreaming up
  cool ideas and making them come true is where my passion lies" [S], exactly the kind of sentence the
  owner bans: copy the structure, not the prose.
- **Simple is not one size** [I, Turkish report]: at least three levels (heading, text, label) and "bir
  parça ışık" (a bit of light). The owner's Jakub and Arc notes are the evidence that a flat page reads
  as dull.
- **Short and long versions** [M]: Lee Robinson's "Default / Long" tabs show about 1,000 or about 5,400
  characters on the same page. The department proposes the long story lives on About instead [I].
- **Dia's role** [I]: Dia has 20 words on its first screen, right for a product and not enough for a
  person. The owner's Home combines Dia's "ben buyum" frame with the clarity of the CV pages.
- **No full-screen hero** [R, NN/g "illusion of completeness", 6 of 8 users missed content under a
  full-viewport hero]: the next section should show above the fold.
- **No opening show** [O + M]: none of the liked simple sites has an intro; at most lines fade in within
  about 1 s (Anthony Fu: 90 ms apart, 1 s each). Calm personal sites settle in 0–1.8 s; award-style ones
  take 3–12 s.
- **Report 02's draft Home** [I, for discussion]: 1.5–2.5 screens; the name and one sentence with 20–40
  words on the first screen and type at most 40–48 px, the glass object small and calm beside it; Today
  (two sentences); structural rows with the label on the left; three project rows, each one sentence and a
  small screen, linking to the project in Work and peeking above the fold; the 2–3 newest Record titles,
  dated; GitHub and LinkedIn. One column of 640–680 px, constant 96–128 px gaps, small mono grey labels,
  a ground that is not pure black.

### 4.2 Work and project presentation

**The gallery** [O + I]: side by side or stacked, big cards with real, possibly moving screens. Work must
be seen inside the site: Louis Paquet's dislike is about leaving the site to see the work.

**The transition** [M, Study 5]. Three methods were found among the 3 usable galleries (the reports say 4
were recorded cleanly; the fourth candidates in the frames are failures [S]):

| Site | Method | Open | Back | Same document | View Transitions API |
|---|---|---|---|---|---|
| Robin Noguier | shared element: the clicked image never disappears | 1.38 s | 1.63 s | yes | no |
| basement.studio | the tile visual stays, the page rebuilds around it | 1.71 s | 4.47 s | yes | no |
| 14islands | fade to white, then the new page builds | 2.87 s | 4.49 s | yes | no |

Robin frame by frame [S]: the blue ground is wiped by grey from the left as a hard vertical edge; the
title "Fun" turns black and stays near its place; the curved image flattens to a rectangle and slides into
its spot on the project page; the header swaps quietly to "← BACK HOME"; no blank frame at any point. Back
is a horizontal curtain, and the carousel reopens on the same project ("geldiğin yere dönüyorsun", you
return to where you came from). Why it does not feel like a new page [I]: the clicked object, the title
and the place on screen all survive; only the ground and the chrome change, by a directional wipe.

The department's implementation path [I]: the site already navigates with cross-document view transitions
(ADR-0007 option 3), so the Work card image and the project page's hero can share a `view-transition-name`
and the browser morphs one into the other, with no client router. Unsupported browsers navigate at once
and reduced motion turns it off, which is the still twin. The project dialog of ADR-0007 item 4 needs the
same name on its hero for wide screens. Report 02 proposes 450–700 ms on desktop and 300–400 ms (or a
plain slide) on phones, the reverse on Back, returning to the same card. The support figures it quotes
(Chrome 126+, Safari 18.2+) have no source inside the archive; ADR-0007 already states the same figures.

**Inside a project page** [I, mostly in the Turkish report, from Study 3]:

- **A promise line** that says what the reader gains (Dia, Stripe, Notion, Shopify).
- **Dia's numbered steps**: 01–03, a short sentence on the left, the real screen on the right; the active
  step dark with a rule, the others pale [S].
- **Anime.js's fixed stage**: the eye stays on one place while the content changes; one accent colour per
  feature, a lit ring segment as progress; "show plus short code" for an engineer reader [S].
- **Notion's two levels**: an outcome heading ("what it gives you") over cards of a short title, one line
  and a real screen fragment ("how it was built"). Maps onto the hiring-manager case structure.
- **Shopify's rhythm**: each chapter opens with its own picture and one word, then a quiet page, with a
  fixed numbered index; three beats repeat, so a 60-screen page never feels long.
- **Playdate's one-word chapter names** for the parts of a product ("The System.", "The Design.") [S].
- **Antoine's live screens** with tiny mono captions, and proof (awards, numbers) built into the layout
  rather than a badge row [S].
- **Volume** [R, NN/g survey of 204 UX hiring managers]: 3–5 deep case studies covering problem, role,
  constraints, process with rejected ideas, impact, lessons. A UX sample, so directional for an engineer.

### 4.3 Photography

Study 1 only, in the English report; the owner voted on no photography site [M]. The department's rule [I]:
"large, still, a one-line factual caption, a dissolve only if there are several"; no hover distortion, no
reveal tricks, none of the eight photo sites uses them. Examples [M, S]: Rinko Kawauchi (one photo over
about two thirds of the screen, a 14 px serif menu, a slow cross-fade), Cereal and Vivian Maier on phones
(one frame per row, a short caption), Gradogna's photo essay (place name and coordinates as caption), Alec
Soth (a first-person sentence opens the page). Anti-patterns: hijacked horizontal scroll (Gradogna), loaders,
text squeezed beside an image on phones (Saul Leiter at 12 characters a line). Thin on owner evidence, but
consistent with the owner's 2026-10-11 rejection of the photo concepts as "a gimmick".

### 4.4 About

The research says little directly. What touches About [I]: the long story belongs here rather than on Home
(report 02's proposal against Lee Robinson's toggle); the second reader, someone just met, is served by it;
Jhey Tompkins' live "now" lines (place, local time) echo the brief's Istanbul clock [S].

### 4.5 Type, colour and motion

| Domain | What the evidence supports | Strength |
|---|---|---|
| Largest line | ≤ 64 px desktop, ≤ 40 px phone for text (Linear, Vercel, Raycast at 64 [M]; CV homes 16–42 px [M]) | medium: product sites, and Dia's ~200 px non-text wordmark [S] shows big display marks are tolerated when calm |
| Body | three ranges are on record: 15–18 px (Study 1), 15–20 px (conclusions), 17–20 px (sources file); loves at 20 px | the charter must pick |
| Line length | 35–60 ch (Study 1) or 50–75 ch (conclusions, Baymard [R]); liked reading lines ~44–67 [S]; library median 41 [M] | overlap at 50–60; the charter must pick |
| Type voices | three: display, text, small mono labels (upper-case, tracked about 0.1 em; Dia 13 px) [M] | medium |
| Hierarchy | one ink at several opacities: Dia .85 / .70 / .60 [M]; proposed for a dark ground: white at 92 / 70 / 50 % [I, Turkish only]; Material 87 / 60 % [R] | strong as a pattern |
| Grounds | soft black #1a1a1a–#1c1c1c for text pages (Paco, Rauch, Lee [M]); near-true black #000–#0a0a0a where light is the subject (Linear, Vercel, Apple [M]); never pure black or white for text | strong for text; the split by page is [I] |
| Accent | one per screen; product colours one at a time, as light; no saturated colour over large areas (Antoine [O + M]) | strong; softened by Dia's yellow hero [S] |
| UI motion | 150–300 ms [M, nearly every site] | strong |
| Scene motion | 400–1000 ms [M]; one or two curves per site | strong as description |
| Arrival | ≤ about 1 s and it finishes; no loader or counter [O + M] | strong |
| Work transition | shared element; the model takes 1.4 s open, 1.6 s back [M]; report 02 proposes 450–700 ms | the duration is open |

## 5. Where the research meets the brief, the ADRs and the postmortem

### 5.1 Agrees

- **Restraint over spectacle** (PROJECT.md line 19; postmortem cause 1). The research measured it: giant
  names drew complaints, calm personal sites settle in under 2 s, and the owner rejected any opening show
  [O, M]. Study 1 calls posters of names "the exact excess of the rejected Home" [I].
- **Dark, quiet, colour as light** (brief line 134; PROJECT line 18). One ink at a few tones plus one accent
  at a time is the loved pattern [M]. The site already uses warm off-white ink (`--ink` #e9e5de) in four
  tones, never pure white (`src/styles/global.css`).
- **Work with real screens in platform frames, stepped one at a time** (ADR-0014). This is Dia's stepper
  and Anime.js's fixed stage in substance; Study 1 calls real screens at true size, untilted, "ADR-0014
  done well" [I].
- **Native navigation with cross-document view transitions** (ADR-0007 option 3) is exactly the path the
  department proposes for the Work transition [I].
- **Every effect has a still twin** (CLAUDE.md): the best-built loved sites carry many reduced-motion rules
  [M].
- **Unwritten sections hidden** (brief line 158) and **no invented facts** (PROJECT): matched by the
  owner's "nokta atışı" rule and the ban on fluffy lines [O].
- **The Record as a dated list** (brief lines 103–120): Study 4 puts "writing, a dated list" fourth in the
  stable Home order, and technique 10 calls an exact dated list a brand statement [M, I].
- **Reading text at 21 px, about 70 characters** for Record pages (brief line 112; `log.css` 21 px, 28em):
  inside the liked range, at its top [M].
- **Motion tokens** 120–720 ms and the ADR-0007 timings (160 ms out, 320 ms in) sit in the measured bands
  [M].
- **Each project may carry its own colour** (brief line 85): Anime.js's one accent per feature and Robin's
  per-project ground [S].
- **Pages have jobs** (PROJECT line 20): the owner now draws the Home/Work line even more sharply [O].
- **Postmortem "What changes" 1** (references first) is now done; its step 2 (the charter) has its inputs.

### 5.2 Extends

- **The design charter** (postmortem step 2, never written): this study supplies limits per width (largest
  line, body, line length, motion bands, curve count, palette ladder), the liked references and the reasons.
- **Home's form**: the brief says what Home should convey (lines 45–55); the research adds a measured shape
  (strips, order, length, a first-screen word budget, peek-in).
- **The Work transition**: ADR-0007 morphs the bar, the tab indicator and the object stage; the research
  adds a shared element from the clicked card to the project hero, which the site does not do yet
  (`view-transition-name` is set today on `bar`, `stage`, `tab-ind`, `rail`, `mark-dot` only).
- **Project pages**: brief line 84 asks for layered depth (teaser, what, why, how, learned); the research
  gives forms for each layer (promise line, numbered steps, theme then cards, proof in the layout).
- **A now section**: the site already has one (`site.json` `now`, "Now, October 2026") and the owner says
  it "could be"; the research gives its compact form (Emil's two-sentence "Today", y≈285 px) [M].
- **Orientation on long pages**: the beads rail (ADR-0013) already exists; the research offers the fixed
  index with an active item as the pattern it could grow toward [I].
- **Photography**: gives a direction for the reopened photo question (large, still, factual caption).

### 5.3 Contradicts or pulls against

- **Home's character.** Brief line 30 (2026-10-08): "more social and brand-led than CV-like". Brief lines
  45–48 (2026-10-09/10): Home presents a product, an identity, a brand; a showcase with a hand-picked
  featured project and an owner-written pitch line. The criteria (2026-10-12) say "biraz CV mantığında"
  (somewhat CV-like), strip-built, the works section possibly a pointer to Work. The criteria are newer,
  but they live in the research archive and the 10-14 part is marked "görüş, karar değil". Not settled:
  ask.
- **The edk object on Home.** Brief line 53 says edk is good as Home's object; the 2026-10-11 night log says
  edk alone is "too simple a move", a better hero object is open. The research's simple Home has no large
  visual at all; report 02 proposes the glass object small and calm, "like a signature". Ask.
- **Display size.** The live Home name is `clamp(52px, 7.8vw, 122px)` on desktop and up to 64 px on phones;
  page titles reach 80 px (`global.css`). The research caps the largest text line at 64 / 40 px and found
  every giant-name portfolio drew a complaint. This is a technique and charter question, not taste, but the
  owner should see the comp before it changes.
- **Ground.** The site's `--ground` is #0a0a0b, near-true black everywhere. The research separates soft black
  #1a1a1a for text pages from near-true black where light is the subject. The owner's own words favour
  softening ("saf siyah-beyaz ikilisi göz yorabilir"); whether to soften is report 01's unanswered question.
- **Light theme.** The brief (2026-10-08) and the requirements override say dark only. The owner leans the
  same way [O, 10-14]. The research's own sources file holds the NN/g finding that light mode reads better
  for most people and recommends a toggle [R], which the final report leaves out. The owner should hear it
  once, plainly, before the toggle is closed.
- **Real-time 3D.** Brief lines 144–146 still say desktop "may return" to real-time 3D; the log closed that
  on 2026-10-11 (option a). The research adds evidence for the decision: Mathis Biabiany's real-time 3D was
  "slow" [O], and Study 1's light and glass techniques assume the pre-rendered object. The brief line is
  stale, not the research.
- **Postcards** (brief line 74: hover, flip): the photography findings say no hover tricks, and the owner
  dropped the postcard requirement on 2026-10-11. Brief line stale.
- **Desktop or phone first.** Brief line 176 and CLAUDE.md say desktop first; the postmortem and WORKFLOW say
  phone first, and the owner tested on the phone only on 2026-10-11. The research measured both widths
  equally and cannot settle it. Ask.
- **The 1000 ms ceiling against the model transition.** The research's own conclusions cap scene motion at
  1000 ms, while the transition the owner loved runs 1.38 s and 1.63 s [M]. Report 02's 450–700 ms is a
  proposal, untested against the owner's eye.
- **Postmortem item 6** keeps anything scroll-linked or pinned off a page until the owner has tried it on a
  lab page. Several research patterns (fixed stage, sticky index, scroll-stepped steps) are exactly that:
  each goes to a lab page first.

## 6. Techniques that fit this site

Each with its source sites. "Fits" is our interpretation against the brief and the postmortem.

| Technique | Where | Source sites |
|---|---|---|
| Label plus proof rows under the name and one sentence | Home | Anthony Fu [S]; report 02 draft |
| Strips: a small mono label, content, constant gaps, one 600–680 px column | Home | Louis Paquet (left label), Emil Kowalski (label above) [S, M] |
| A two-sentence "Today" or now block | Home | Emil Kowalski, Paco Coursey [M] |
| The newest 2–3 Record titles, dated, aligned | Home | Rauch, Lee, Emil (Study 1 technique 10) [M] |
| Next section peeking above the fold, no full-screen hero | Home | NN/g [R]; all calm personal sites [M] |
| Lines fading in 90 ms apart as the only arrival motion, finished in about 1 s | Home | Anthony Fu [M] |
| Shared-element open from the Work card to the project hero, reversed on Back | Work | Robin Noguier [M, S]; ADR-0007 mechanism |
| Ground shifting to the project's own light colour during the open | Work | Robin Noguier [S] |
| A promise line that states what the user now does | project page | Dia, Notion, Stripe [S] |
| Numbered steps with the active step lit and a real screen beside it | project page | Dia [S]; ADR-0014 already steps screens |
| One fixed stage, content swapped per step, one accent at a time | project page | Anime.js [S] |
| Outcome heading over "how it was built" cards | project page | Notion Calendar [S] |
| One-word chapter names for the parts of a product | project page | Playdate [S] |
| Proof built into the layout (figures, versions, real numbers) | project page | Stripe's figures band, Antoine's awards grid [S] |
| A fixed index with an active item on long pages | Work, long project pages | Shopify (I–XII), Anime.js ring, Robin's dots [S]; the beads rail is the seed |
| Live screens with tiny mono captions | Work | Antoine Wodniack [S] |
| One ink in three or four tones; one accent per screen | everywhere | Dia, Notion, Maxime [M] |
| Soft black for text pages, deeper black only behind lit objects | everywhere | Paco, Rauch, Lee vs Linear, Vercel [M] |
| UI 150–300 ms on (.4,0,.2,1); entrances on one decelerating curve; small amplitude (scale .975→1, a 10 px rise) | everywhere | Dia, Notion, Stripe, Anthony Fu [M] |
| Many reduced-motion rules, container queries, scroll timelines in CSS | everywhere | Stripe, Notion [M] |
| A photo large and still, a one-line factual caption | photos | Rinko Kawauchi, Cereal (Study 1) [S] |

Tools worth reusing later [I]: `capture.py` (its measuring code could check our pages against these
medians), `homeprobe.py` (the hiring checklist, run on our Home) and `transprobe.py` (to time our Work
transition against Robin's). They need Playwright and network access to outside sites only for the
reference side.

## 7. Not to do

- An intro show, a loader, a counter, or a quick showcase that then shrinks [O + M].
- A name set as a poster (Dennis Snellenberg 216 px, Olha Lazarieva 225 px) [M]: "the exact excess of the
  rejected Home" [I].
- Rotating type, marquees, anything that never settles [I].
- Hijacked horizontal scroll [I, Study 1].
- Cartoon or many-colour palettes; saturated colour over large areas [O, Antoine].
- Pure black text on pure white or the reverse [O, Jakub].
- One size and one weight for a whole page [O, Jakub "spark yok"; M].
- Tilted perspective screens, floating phones, blur on product screens [I].
- On phones, text squeezed beside an image [M, Saul Leiter at 12 ch].
- Sending the visitor to heavy external pages one by one to see the work [O, Louis Paquet].
- A transition that feels like a new page opened (fade to white) [O + S, 14islands].
- Fluffy self-description [O]; and do not copy Anthony Fu's bio line with the structure.
- The Robin pattern on Home [O].
- A gate, an "Enter" button, or an empty first screen [S, 7 of 16 dislikes].
- Logo walls and long marketing density [I].
- Misattributing "people buy better versions of themselves": it is Zander Nethercutt, not Samuel Hulick [R].
- Reusing the sources file's sample content ("Istanbul", "a free study room on campus") as facts: they are
  illustrations, not the owner's words.

## 8. Open questions for the owner

1. **Home: CV-like strips or a brand showcase?** The brief's showcase (featured project, pitch line, edk
   object) against the criteria's "biraz CV mantığında", strip by strip, with works as a pointer to Work.
2. **How visible are projects on Home?** One featured project with a link, three one-line rows, or a short
   summary and a link. Where do Home project rows lead: the project inside Work (report 02's proposal) or
   the top of Work?
3. **Home length**: the owner is "not sure". 1.1–2.8 screens is the measured range of the genre.
4. **The long story**: Lee Robinson's Short/Long switch on Home, or the long version on About (report 02's
   proposal)?
5. **The glass object on Home**: small and calm "like a signature", a new hero object (open since
   2026-10-11), or nothing?
6. **Soften the ground?** Near-true black today; soft black for text pages is the research's suggestion
   and fits the owner's eye-strain words.
7. **Light theme**: close it, with the NN/g finding heard once, or keep section-by-section grounds as the
   only variety?
8. **A Shopify-like opening per project in Work**: does "no opening moment" also cover each project's
   chapter opening, or only the site's arrival? (Ambiguous in the 10-14 note.)
9. **The Work transition's length**: the loved model is 1.4–1.6 s; the research proposes 450–700 ms. Decided
   by a lab page the owner tries on the iPhone.
10. **Desktop first or phone first** for the next round.
11. **What "yedek" meant** in the four unanswered questions.
12. **Which product numbers count as proof** for first-year projects in active development (versions,
    question counts, users)?

Technique, not taste (the lead decides and records in an ADR or the charter): the body size and line length
to fix from the three ranges on record, the display cap per width, the motion bands and curves, and how the
shared-element names are wired.
