# Reference notes: every design statement, read against the two-page direction

**Status:** reference reading for phase 3, 2026-10-15 (late night). Read-only work. Every line of the
listed documents was read; HTML files were stripped to text with `python3 -I`; numbers inside tables
were read; a sample of the archive's frames (`final/img/`) was looked at to add [S] values.

**Sources read in full** (archive root `scratchpad/research-raw/`):
`CLAUDE.md`, `README.md`, `PARTS-README.txt`, `brief/criteria.md` (byte-identical to
`final/data/owner-criteria.tr.md`), `final/report.md`, `final/rapor.html`, `final/liked-sites.md`,
`final/begenilenler.html`, `reviews/2026-10-12-02-loved-sites/report.html` (report 01),
`reviews/2026-10-12-02-loved-sites/concepts.md` (byte-identical to `final/data/research-sources.md`),
`reviews/2026-10-14-03-home-and-work/report.html` (report 02) and its `manual.json`,
`reviews/2026-10-14-04-liked-dossiers/analysis.json` (same text as the dossiers' Turkish analysis),
`tools/picker/template.html`, `library/votes/picks/*.json` (31 files), `library/lists/*.json`
(the three `tr-*.json` description files, `blocked.json`, the structure of the English lists and
`prev.json`), and the repo digest `docs/research/2026-10-reference-research.md`.
Raw JSON consulted for the numbers section: `final/data/dossiers/{dia,notion-calendar,anthony-fu,
robin-noguier,antoine-wodniack,shopify-editions}.json`, `final/data/study4-home-pages/{anthony-fu,
dia-the-browser-company,notion-calendar,emil-kowalski}.json`,
`final/data/study5-work-transitions/robin-noguier.json`.

**Marks:** [M] measured (a number in the archive's JSON or CSS). [S] seen (in a capture; frames in
`final/img/` are 1200 px wide for a 1440 px viewport, so [S] pixel values are multiplied by 1.2; check:
Anthony Fu's column reads 327–873 in the frame, ×1.2 = 392–1048, which is the measured column).
[O] owner's words. [I] inference (the department's or ours; "ours" is said where it matters).

**Verdicts:** KEEP (holds as written), ADAPT (holds after a stated change), SUPERSEDED (the owner's
newer words replace it; the code names the newer line), CONFLICT (pulls against a newer line; a
resolution is proposed).

## 0. The owner's newest direction, as codes used below

From `docs/history/brief-log.md`, 2026-10-15 sections (newest wins), plus the task brief.

| Code | Line |
|---|---|
| N1 | Two pages only: Home and Record (a blog). One shared token set. All content stays; only the page system changes. |
| N2 | A redesign from scratch inside the same logic. Keep the cards (ID card, postcards/photos; reimplement as needed), keep the scroll rail ("scroll bar güzel"), a tab switches between the two pages. |
| N3 | Home runs top to bottom, everything centred: nothing shifts left or right. |
| N4 | Top: a short brief, simple and explanatory like Anthony Fu; the intro may summarise everything. |
| N5 | Work: each project is a photo frame or a set of frames, stacked or side by side, elegant motion; click and the "paper" grows and carries the visitor into the project inside the same UI; no new tab, no window that opens and closes; maybe a rotation; the other images and the project texts come with the photo (Robin Noguier, Antoine Wodniack). |
| N6 | The project presentation follows Dia's and Notion Calendar's measured layouts: step by step, explanatory, professional. |
| N7 | The rest (About material, photos, ID card, now, links, a pointer to the Record), reviewed. |
| N8 | No repetition: every fact lives in one right place; the intro summary is the only exception. |
| N9 | Full fluid motion everywhere; every object alive and professional; slow, rich animations; content arrives one by one while scrolling to the end; long animations are fine unless extremely long. |
| N10 | Shopify Editions is the most elegant reference in every respect (background liveliness, colour, animation): alive on every scroll. |
| N11 | Aura used generously; own illustrations; 2.5D layered backgrounds (2D art on several parallax layers); the pre-rendered 3D objects may be reused. |
| N12 | Desktop and phone may be different designs; both matter equally. |
| N13 | Fonts, colours, spacing and density in one proportion and order; the finest rules, audited. |
| N14 | Forget the old technical features for now; full creativity; copying one liked reference well is already good; show something soon. |
| N15 | Theme Graphite: dark only, no white pages. Aura, grain and noise are the concept; the aura colours the page from what it shows; the ground stays near-black. |
| N16 | The briefs inside the research HTML files (begenilenler.html, rapor.html, the review report.html files) are accepted brief. |
| E1–E6 | Earlier on 2026-10-15 and still standing: E1 no loading screens and no visitor lost on first open; E2 no 1-second limit on the arrival, the longer effects stay; E3 the Work transition may try the long version, chosen on a lab page; E4 largest text Home 48 px desktop / 34 px phone and other pages 80 / 45 px (ticked without a note: provisional); E5 load a real italic; E6 photo: click, it grows to a large view where it flips and swings; captions tested as one line or only in the enlarged view. Liked as is: the buttons, the clock, the scrollbar, the fonts. |

---

## 1. `research-raw/CLAUDE.md` (the department's rules)

- "Collect, review, measure, report, hand off; projects decide, this department advises." [O-framed]
  → KEEP: the archive is evidence; the owner's N-lines decide.
- Captures at 1440×900 and 390×844 (stills, first 3 s, scroll journey). [M] → KEEP: the same two
  widths are our check widths (plus 1180×820 from the repo rules).
- "Measure instead of guessing: fonts, type scale, line length, colours, motion durations and easings,
  libraries, scroll structure." → KEEP: matches N13 ("audited").
- "Taste is the owner's; technique and evidence are ours. Every claim says whether it was measured,
  seen, or reasoned." → KEEP: this file uses the same marks.
- "The owner's likes and notes are the strongest signal we have." → KEEP.
- "Restraint over spectacle: ... fast to understand, easy to read and pleasant to scroll, with richer
  motion and detail where the visitor has chosen to look deeper (Work, product pages)." →
  ADAPT (N9, N10): richness is now wanted everywhere ("alive on every scroll"), but "fast to understand,
  easy to read" stays. Read it as: rich motion, never at the cost of legibility or orientation.
- "Never pass GPU flags such as `--use-angle=d3d11` to Chrome: they break some sites' intros." → KEEP
  for any future capture of our own pages.
- Captures contain no personal data (emails, phones blurred). → KEEP for our screenshots too.
- Picker votes live in artifact `1CHkxD94pf1fYe2EB72J4k`, db `picks`. → Data pointer only; the 31
  votes are also exported in `library/votes/picks/` (read; see §10).

## 2. `research-raw/README.md` and `PARTS-README.txt`

- Six studies: 29 sites; 127-site picker (31 votes); anatomy of 12 loved sites; 13 CV-like home pages;
  14 gallery transitions; 16 liked-site dossiers. → Context only.
- `final/` is "the complete, self-contained result"; `reviews/` holds intermediate reports. → KEEP: the
  final reports and the two review HTML reports are the brief-bearing texts (N16).
- Tool list (`capture.py`, `anatomy.py`, `homeprobe.py`, `transprobe.py`, `dossier.py`). → KEEP as an
  idea: a probe that times our own Work transition against Robin's 1.38 s would make N13's audit real;
  not runnable here (outside sites unreachable; our own pages are reachable). [I]
- `library/captures/` is in the archive split parts but not needed for this reading. → no design load.

## 3. `brief/criteria.md` (owner's criteria, dated; Turkish)

### 3.1 Who we speak to (2026-10-12) [O]
- "İşe alan kişi (birincil) ... 'neden bu kişiyi işe alayım?' ... ne biliyor, ne yaptı, neye
  odaklanıyor. En hızlı yoldan." (The hirer first: why should I hire this person; what they know,
  made, focus on; by the fastest route.) → KEEP: N4's brief must answer this in the first screen.
- "Yeni tanışılan biri (ikincil, sosyal) ... 'ha bunlarla ilgileniyorsun, şunları yapmışsın,
  güzelmiş'." (Someone just met: oh, so this is what you're into, you've made these, nice.) → KEEP:
  served by N7 (photos, ID card, now) further down the same page.
- "İkisini de güzel bir sunumla yapmak." (Do both with a beautiful presentation.) → KEEP; N10 raises
  the bar.

### 3.2 Aesthetics and readability (2026-10-12) [O]
- "Okunabilir, göz yormayan metin ve sayfalar. Saf siyah-beyaz ikilisi göz yorabilir (Jakub Krehel
  notu); doygun, bağıran renkler de (Antoine Wodniack notu)." (Readable, eye-friendly; pure
  black-and-white can tire the eyes; so can saturated, shouting colour.) → KEEP with N15: near-black
  ground, text never pure white, aura colour never a saturated flat area.
- "Tekdüze olmamalı: düz metin ve düz fotoğraf dizisi değil." (Not monotonous: not a row of plain text
  and plain photos.) → KEEP: N5's frames and N11's layers answer it.
- "Nokta atışı anlatım: uzun ve süslü cümleler yok ('hayalleri gerçeğe dönüştürüyorum' gibi). Kısa,
  doğrudan, net, doğru." (Pinpoint wording; no ornate lines such as "I turn dreams into reality".) →
  KEEP for all copy.
- "Kaydırırken keyif vermeli; her kaydırmada 'devamında ne var?' merakı uyandırmalı." (Pleasant to
  scroll; every scroll raises "what comes next?") → KEEP; this is N9/N10 in the owner's earlier words.

### 3.3 Page jobs (2026-10-12) [O]
- Home: "olabildiğince sade ve açıklayıcı, biraz CV mantığında ... Anthony Fu ('ben buyum, bunları
  yapıyorum'), Louis Paquet'nin sadeliği ve netliği." (As simple and explanatory as possible, somewhat
  CV-like.) → ADAPT (N3, N4): it now applies to the top brief of Home only; Home as a whole now also
  holds Work and the rest.
- Work: "çok daha etkileşimli, animasyonlu, ürün odaklı ... sunum, akıcılık ve ince ayrıntılar önemli.
  Örnek: Robin Noguier'nin sunumdan içeriğe geçişi, Antoine Wodniack'ın iş sunumu." (Much more
  interactive, animated, product-focused; presentation, fluency, fine detail; Robin's
  presentation-to-content move, Antoine's work presentation.) → KEEP, now as Home's second section (N5).

### 3.4 Product presentation (2026-10-12) [O]
- "Ürün vizyonunu net ve güzel ifade etmek." (State the product vision clearly and beautifully.) →
  KEEP: one promise line per project.
- "Aşağı kaydırdıkça ürünün yaptıklarını adım adım, tek tek açıklamak: hızlı, yormadan, kafa
  karıştırmadan (Dia, Anime.js, Notion Calendar)." (Explain step by step while scrolling; fast, without
  tiring or confusing.) → KEEP = N6.
- "Kullanıcıyı pazarlamak ... 'bu ürünle sen bu işi artık şöyle yapan, daha iyi bir sen olacaksın'."
  (Market the user: with this product you become a better you.) → KEEP for every project headline.

### 3.5 14 October views ("görüş, karar değil") [O]
- "Üretim ve kararlar portfolyonun işi; departman toplar, ölçer, ilk analizi raporlar." → KEEP.
- Home: "tek sayfa simple olanlardaki netliği istiyorum" (I want the clarity of the simple one-page
  sites), Dia's "ben buyum"; "Uzun bir şey mi olmalı kısa bir şey mi olmalı? Emin değilim. Ama biraz
  daha derli toplu olmalı." (Long or short, not sure, but tidier.) → SUPERSEDED in part by N1/N3: Home
  is now long (brief + Work + rest); "derli toplu" (tidy) survives as N8 and N13.
- "Herhalde şerit şerit... düşünüyor olabilirim" (probably strip by strip) → ADAPT: strips survive as
  the rhythm of section 3 ("the rest"), centred, with the label above (Emil form), not in a left
  column (N3).
- "işler kısmı Work'e bir yönlendirme olabilir" (the works part could be a pointer to Work) →
  SUPERSEDED by N5: Work is on Home itself.
- Opening: "bence hiç uygun değil" for a big opening moment or a 1–2 s "hızlı vitrin sonra küçülme"
  (quick showcase then shrink); for the hirer "daha direkt bir şey olması daha iyi olabilir". → ADAPT
  (N9, E1, E2): no loader and no showcase that hides the content; slow, rich entrances of real content
  are now wanted. The brief text must be readable at once.
- Work: "yan yana ya da alt alta işler; tıklayınca görsel akıcı biçimde açılıp kendi sayfasına
  tamamlanıyor; yeni sayfa açılmış gibi hissettirmiyor. 'Work'e de öyle bir şey isterim muhtemelen.'"
  (Works side by side or stacked; on click the image opens fluidly and completes into its own page;
  it does not feel like a new page.) → KEEP = N5 (now "inside the same UI").
- "Açık tema düğmesi: 'galiba sitenin genel yapısına uymuyor'; bölüm bölüm farklı zemin olabilir;
  'burayı portfolyoya bırakmak da mantıklı olabilir'." (A light theme button probably does not fit;
  section grounds may differ.) → SUPERSEDED by N15: Graphite, no light theme. "Section grounds may
  differ" survives as the aura tinting each section (N15, N10).
- "'Şu sıralar' bölümü: 'olabilir tabii ki de'" (a "now" section: could be, of course). → KEEP inside
  N7 (monthly "now" line, owner-fed).
- The four unanswered questions (project link, long story, glass object, "yedek"). → "yedek" dropped
  by the owner (2026-10-15); the other three are answered or reframed below (§9).

### 3.6 Negative patterns from the notes (2026-10-12; table) [O, condensed by the department]
| Pattern | Sites | Verdict for the new direction |
|---|---|---|
| Slow, long, tiring; not fast and clear | Daylight, Jesse Zhou, Mathis (slow) | KEEP as a limit: slow motion is wanted (N9), slow loading and gates are not (E1). |
| Opening heavy pages one by one to see the work | Louis Paquet | KEEP: N5 opens projects in place. |
| Shows beautifully but explains badly | Eduard Bodak | KEEP: N6 is the cure. |
| Tells everything but gives no reason to read; too technical | Maxime Heckel | KEEP: promise line + "market the user". |
| Presents the product, not the self | Robin Noguier | KEEP: Robin is for the Work section, the brief comes first (N4). |
| Beautiful but no hiring or marketing point | Merouane Bali | KEEP. |
| Cheap, unpolished visuals or illegible | Scout Motors, Craig Mod | KEEP: own illustrations (N11) must be finished, not sketchy. |
| Dated, not modern | Cyd Stumpel | KEEP. |
| Nothing eye-catching | Josh Comeau, Frank Chimero | KEEP: N10/N11 answer it. |
| Not our genre | Bézier, Cowboy, Henry Heffernan, Exat | KEEP. |
| Game-like, bad | Bruno Simon | KEEP: no game navigation. |

### 3.7 Most loved (2026-10-12) [O]
- Shopify Editions: "BAYILDIM" ... presentation, animation, visuals, composition, flow, colour,
  readability, proportions; never boring. → KEEP and raised: N10 names it the most elegant reference.
- Dia: "BAYILDIM" ... minimalist, great summary, step by step, simple, explanatory, markets well. →
  KEEP = N6.
- Anime.js: simple flow; varies itself around one element; usable for a product showcase. → KEEP as
  the "fixed stage" idea inside a project.
- Notion Calendar: simple, beautiful, fluent. → KEEP = N6.
- Robin Noguier: the first presentation and the move into content are very fluid (for Work). → KEEP = N5.
- Antoine Wodniack: animation, type, font and work presentation are a fine showcase (colour tires). →
  KEEP = N5, without the saturated ground.
- Anthony Fu: very clean, explains himself. → KEEP = N4.
- Jakub Krehel: content and presentation of works and writing inspiring; first page dull. → KEEP for
  the Record's list pages.
- Playdate (lively colour), Stripe, Arc (a bit dull but minimal), Mathis Biabiany (3D incredible but
  slow). → Secondary references.

## 4. `final/report.md` (English final report)

### 4.1 Header and Summary
- "It is evidence for the portfolio's development, not a decision." → KEEP; N16 makes the HTML
  briefs binding; this Markdown edition carries the same findings.
- Summary 2: "Home is short, direct and CV-like, with no intro showpiece. Work is rich ... Products are
  explained step by step, and by selling the user. Loved most: Shopify Editions and Dia." → ADAPT: Home
  is no longer short (N1/N5); "direct" applies to the brief; the rest KEEP.
- Summary 3 [M]: loved product pages share "a promise line, one idea per section and a fixed index.
  Motion is short and consistent (UI 150–300 ms, scenes 400–1000 ms). Text and ground are never pure
  black or pure white." → KEEP the skeleton and the UI band; SUPERSEDED the 1000 ms scene ceiling by
  N9/E2/E3; ADAPT "never pure black ground": N15 keeps a near-black ground, so it must be lifted off
  #000 and tinted by the aura and grain.
- Summary 4 [M]: CV-like personal home pages are "1.1–2.8 screens long, set in one narrow column
  (600–670 px), and always in the same order: name and role, today, work, writing, now, links." →
  ADAPT: the order KEEPs (brief → Work → rest with now, links, Record pointer); the column KEEPs for
  the brief text; the length is SUPERSEDED (Home now holds Work).
- Summary 5 [M]: Robin's shared-element transition: "1.4 s to open, 1.6 s back, with no page reload."
  → KEEP as the model duration (E3 allows the long version).
- Summary 7 [R]: recruiter first scan ~7.4 s; 74 % of viewing time in the first two screens; "make the
  user awesome" (Kathy Sierra). → KEEP: the brief plus the first Work frame must sit in the first two
  screens.

### 4.2 Method [M]
- Desktop 1440×900 at 1×; phone 390×844 at 2×, iPhone user agent, Chromium not Safari. → KEEP the
  caveat: Safari behaviour of any effect we copy is unmeasured.
- Measures: fonts loaded, type scale, line length, colours and variables, every transition with its
  duration and easing, libraries, page length, words on first screen, arrival time, colour clusters. →
  KEEP as the audit list for N13.

### 4.3 The owner's criteria (O) — same as §3; nothing new. Items 1–5 → see §3 verdicts.

### 4.4 The owner's votes (O) — the 31 notes, verbatim; quoted with glosses in §10.

### 4.5 Research (R)
- 7.4 s recruiter scan (Ladders 2018; magnitude only). → KEEP: the brief's first line names who and what.
- 57 % above the fold, 74 % within two screens (NN/g 2018); full-screen heroes cause the "illusion of
  completeness": "let the next section peek in." → KEEP: the first Work frame peeks above the fold on
  both widths; no full-viewport hero that looks finished.
- 3–5 deep case studies: problem, role, constraints, decisions, result (NN/g, 204 UX managers). → KEEP:
  the content of each opened project (N6 is the form, this is the content).
- Body 15–25 px, 50–75 characters per line; on dark grounds avoid pure black and pure white (Material
  #121212, text at 87 %). → KEEP for text; N15 sets the ground near-black.
- Sierra, Hulick ("show the fireball-throwing Mario, not the flower"), Nethercutt ("people buy better
  versions of themselves"). → KEEP for project copy; attribute the last line to Nethercutt.

### 4.6 Study 1: 29 sites (M, with the department's "fits / does not fit")
Personal brands, line by line:
- rauno.me: bio as the hero; one confident accent; motion finishes (≈1.6 s); poster letters too loud.
  → KEEP "bio as hero" for N4; drop the poster scale.
- paco.me: text on #1a1a1a, two voices (sans + one serif italic phrase), stagger ≈0.7–1 s. → KEEP the
  two-voice idea and E5's real italic; ADAPT the stagger (N9 allows slower).
- emilkowal.ski: one column of 16 px; plain list reads confident. → KEEP for Record lists.
- brianlovin.com: title white, description grey, one line per item. → KEEP for Record rows.
- rauchg.com: year column at left, counts at right on #1c1c1c. → KEEP for the Record index ("a dated
  list is a brand statement"); ADAPT the year column to a centred layout on Home (N3).
- antfu.me: "a living background that stays at the edge and below 10 % contrast; the text never
  competes with it"; 79 ch desktop too long; many inline icons busy. → KEEP the edge-living background
  as the minimum for N11; ADAPT line length to ≤ 65 ch.
- leerob.com: warm soft black #1b1a19, serif 17 px, 56 ch, one illustration at right. → KEEP the idea
  of own illustration next to text (N11); ADAPT: centred, and the illustration in the aura layers.
- dennissnellenberg.com: 2 s "Hello" loader, 216 px marquee name. → KEEP as a "do not": loader, name
  as a moving poster.
- gianlucagradogna.com: counter loader ≈3 s; one white card over dark photos. → KEEP "do not" for the
  loader; "small type over big imagery" is usable in Work frames.
- matthieugivelet.com: name at 52 px with one image set inside the word; hairlines and bracketed
  labels. → ADAPT: an object inside the name is a possible brief signature (the edk mark question).
- olhalazarieva.com: 5 s loader, rotating 3D text. → "do not".
- bruno-simon.com: light as the first event; a game. → KEEP "light as the first event" for the aura's
  arrival; "do not" for the game.
- lusion.co: 3D inside a framed card with margins, not edge to edge. → KEEP: objects are presented in
  frames (fits N5's photo frames).
- igloo.inc: glass lit from inside, one object, almost monochrome. → KEEP as the look of a reused
  pre-rendered object (N11).
Photographs:
- Rinko Kawauchi: one photo over two thirds of the screen, 14 px serif menu, slow cross-fade. → KEEP
  for the enlarged photo view (E6).
- Cereal / Vivian Maier on phones: one frame per row, short caption. → KEEP for the phone photo list.
- Gradogna photo essay: place name and coordinates as caption; hijacked horizontal scroll. → KEEP the
  caption idea only if the owner's captions are factual; "do not" for scroll hijack.
- Saul Leiter: phone squeezes text to 12 ch beside a photo. → "do not" on phones (N12: design the phone
  separately).
- Alec Soth: first-person sentence opens the page; 94 ch lines. → the opening sentence idea fits N4.
- The Atlantic: photo, headline, date. → KEEP for Record entries with a photo.
Products:
- Linear: headline sharpens from blur ≈1 s; real app window at full width; zero accents; 64 px max. →
  KEEP "real screen as hero" inside an opened project.
- Vercel: object lit from behind out of black ≈0.9 s. → KEEP: aura as light behind the object.
- Raycast: glass and coloured light carry the brand; red bloom ≈45 % of the screen. → ADAPT (N11
  wants a generous aura): a large bloom is now allowed if it is light, not flat saturated paint.
- Apple MacBook Pro: product lit as a sculpture; small headline. → KEEP for object frames.
- Apple Final Cut Pro: real screens on Mac, iPad, display as one composition. → KEEP for a project's
  multi-device step.
- Things: app icon as hero; tilted screens are a trope. → KEEP the icon-as-hero for the project frame's
  first state; "do not" tilt the screens themselves (a rotated paper/frame is different, N5).
- Teenage Engineering OP-1: scroll brings the photographed object closer. → KEEP: a scroll-linked
  push-in on a frame or object is in line with N9.
- family.co: spring micro-motion that feels physical; cartoon colour. → KEEP springs; "do not" cartoon.
Ten techniques:
1. "≤ 64 px desktop, ≤ 40 px phone for the largest line." → SUPERSEDED by E4 (Home 48/34, others
   80/45, provisional) and by N5 (project names in frames may be larger, like Robin's 135 px). Keep a cap
   for running text headings.
2. "Light is the entrance ... the glass object starts dark and its light rises once, then stays still."
   → ADAPT (N9, N11): the aura's light rises first, then keeps a slow living drift ("alive").
3. "Arrival under about one second, and it must finish ... no loader, no counter." → SUPERSEDED in
   duration by E2; KEEP "no loader, no counter" and "it must finish" for each entrance.
4. "One accent per screen ... product colours one at a time, as light, never side by side as paint." →
   KEEP: the aura takes the hue of the project in view (N15).
5. "Soft black for text, true black where light is the subject." → ADAPT (N15): one near-black ground
   everywhere, lifted where text sits by the aura and grain.
6. "Real screens at true size, in the page's own dark, with one faint edge light ... no tilt, no
   floating phones, no blur." → KEEP inside the opened project. CONFLICT-minor with N5 "maybe a
   rotation": the rotation belongs to the frame/paper during the open, not to the screen at rest.
7. "A photograph is presented by taking things away ... large, still, a one-line factual caption, a
   dissolve only if there are several." → ADAPT (E6): the postcard flips and swings in the enlarged view;
   at rest it stays still.
8. "Body 15–18 px, lines of 35–60 characters ... Record keeps its 21 px reading size." → KEEP (see §13).
9. "Scroll brings the object closer, not more effects." → KEEP as one of the scroll behaviours.
10. "A dated list is a brand statement when it is exact." → KEEP for the Record and for the Record
   pointer on Home.
- "What the references argue against": names as posters, loaders, scroll hijack, kinetic rotating
  type, cartoon colour, squeezed phone layouts. → KEEP all as "do not". Rotating type ≠ a rotating
  frame (N5 allows the latter).

### 4.7 Study 2: the picker (counts) → no design load beyond the votes (§10).

### 4.8 Study 3: anatomy table [M]
| Site | Measured | Verdict |
|---|---|---|
| Shopify Editions | four voices (Neue Montreal 700 chapter word, HW Cigars serif text, Imperial Script initial, Inter UI); 194/61/44/32/28/20/17/14 px; black chapters alternate with #f7f7ee pages; body #909083/#5c5c4e; cards 400–500 ms on (.34,1.56,.64,1); UI 150 ms; Lenis | KEEP the rhythm and the spring; ADAPT colours to Graphite (no cream pages, N15): the "page change" becomes an aura change. |
| Dia | Exposure display, ABC Oracle text, ABC Favorit Mono labels 13 px +1.3 px; 48/39/24/20/16/14/13; body 20/1.5; #fbfaf6; one black at 85/70/60 %; one yellow; 200–300 ms one curve (.4,0,.2,1); no intro | KEEP structure, sizes and the opacity ladder; invert to white on near-black. |
| Anime.js | DIN + mono; 52/40/20/16/14/12; #252423, #d5d3d1/#b4b1af; one accent per feature; UI 125–500 ms | KEEP one accent per project. |
| Notion Calendar | Inter custom, Lyon Text for one quote; 64/42/22/18/16; white and #f6f5f4 bands; text 90 % black; 200 ms | KEEP the two-level layout; invert the bands to two near-black tones. |
| Antoine Wodniack | Bigger Display 700, Editorial New 200, Fraktion Mono; 138/105/36/32/20; #f40c3f; 0.8–1 s (.23,1,.32,1), clip-path reveals; Lenis | KEEP the bold/thin contrast and clip-path reveals; drop the red ground. |
| Anthony Fu | Inter 800/400, DM Mono; 36/16; #bbb on near-black; lines 90 ms apart, 1 s each | KEEP for N4. |
| Jakub Krehel | system UI, everything 16 px; #0c0c0c | KEEP as the warning: one size and one weight reads dull. |
- Shared patterns: promise line, one idea per section, fixed index (Shopify I–XII, Dia 01–03), fixed
  stage; three type voices; hierarchy from size and opacity; softened contrast; short consistent motion
  with one or two curves. → KEEP all except "short" (N9: slower is allowed; consistent stays).

### 4.9 Study 4: CV-like home pages [M] (table read in full)
Anthony Fu 1.4/2.0 screens, 4 sections, gap 65 px, column 656 px, 160 first-screen words, largest
36 px; Lee Robinson 1.4/1.9, 3, 58, 600, 121, 42; Rauch 1.1/1.1, 3, 165, 624, 143, 18; Paco 1.6/1.9,
4, 68, 640, 103, 16; Brian Lovin 1.7/2.6, 3, 121, 640, 48, 24; Louis Paquet 2.6/3.3, 4, 100, 444, 67,
18; Jakub 2.6/2.7, 5, 116, 660, 161, 16; Emil 2.8/2.7, 7, 128, 668, 101, 16; Dia 7.4/8.7, 10, 531,
full, 20, 39.
- "All follow one order: name and role → today → work → writing → now / personal → links." → KEEP as
  the order inside Home (brief = name, role, today; Work; rest = now, links, Record pointer).
- Strips: "a small grey label plus content, with a constant gap. Louis Paquet puts the label in a left
  column ... Emil Kowalski puts the label above." → KEEP Emil's form; CONFLICT Louis's left column
  with N3 (centred). Resolution: label above, centred.
- Lee Robinson "Default / Long" switch: ~1,000 vs ~5,400 characters on the same page. → ADAPT, now
  favoured: with no About page (N1), the long story can open in place under the short one, which also
  satisfies N8 (one place) and N9 (in-place growth).
- Emil's "Today" (two sentences under the name) vs Paco's "Now" (three paragraphs at the end). → KEEP
  Emil's form for the brief's "today" line and a short dated "now" in the rest; N8 forbids saying the
  same thing in both: "today" = role/where; "now" = what this month.
- Louis Paquet's links open clients' sites in new tabs = the disliked "heavy pages one by one". → KEEP
  as "do not".

### 4.10 Study 5: Work transitions [M]
- Four of 14 recorded cleanly; all same-document; none uses the View Transitions API; each uses its
  own JS or WebGL. → KEEP: same-document is now the natural fit (N1: projects open inside Home).
- Robin: "the curved WebGL image flattens and slides into its place on the project page; the ground
  colour wipes; the title stays. Open 1.4 s, back 1.6 s (a horizontal wipe back to the same project)." →
  KEEP = N5 model.
- basement.studio: the tile's visual stays in place while the page changes around it; 1.7 s. → KEEP as
  the alternative where the frame stays and the content builds around it ("the texts come with it").
- 14islands: liquid hover, fade to white, 2.9 s, feels like a new page. → "do not" (also N15: no white).
- "ADR-0007 already uses cross-document view transitions ... same `view-transition-name` ... produces
  the Robin effect without a client router." → ADAPT: with two pages and in-place projects, the
  mechanism becomes a same-document shared-element morph (`document.startViewTransition` or a FLIP
  animation). Cross-document transitions stay only for the Home↔Record tab. [I, ours]

### 4.11 Conclusions table (first analysis) — verdicts
| Conclusion | Verdict |
|---|---|
| Home answers the hiring question; proof within two screens. | KEEP. |
| Home is short, strips, 1.1–2.8 screens, 3–7 sections, 600–670 px column. | SUPERSEDED for length (N1, N5); KEEP strips and column for the brief and the rest. |
| The order is stable (name/role → today → work → writing → now → links). | KEEP. |
| No intro showpiece; at most lines fade in within 1 s. | ADAPT: no loader or showpiece (E1); entrances may be slower (E2, N9). |
| Language is direct; headings carry the message. | KEEP. |
| Eyes do not tire: no pure black/white; one colour's opacities; body 15–20 px; lines 50–75 ch; no saturated large areas; monotony tires. | KEEP; ground per N15. |
| Work is rich and continuous; the clicked image flows into its own page and reverses on Back. | KEEP = N5. |
| Products step by step and through the user: promise, one idea and one real screen per section, fixed index. | KEEP = N6. |
| Motion is measured: UI 150–300 ms, scenes 400–1000 ms, one or two curves, a still version of every effect. | ADAPT: UI band KEEP; scene band widened (N9, E2); still twin KEEP (repo rule). |
| The light-theme toggle is open. | SUPERSEDED by N15. |

### 4.12 Limits and Files
- Phone = Chrome emulation; timings ±1 s; WebGL slower headless; GPU flags broke Shopify's intro. →
  KEEP as caveats: our timings must be tuned on the owner's real devices.

## 5. `final/rapor.html` (Turkish final report; accepted brief, N16)

Same studies as report.md. Lines that the English edition lacks or states differently:
- Owner criteria cards 1–10 (İşe alım, Tanışma, Okunabilir estetik, Merak, Sayfa görevleri, Ürün
  vizyonu, Açılış anına mesafeli, Ana sayfa derli toplu, Work geçişi, Açık tema düğmesi). → see §3.
- Research card: "Tam ekran bir açılış ... bir çalışmada 8 kişiden 6'sı aşağıdaki içeriği kaçırdı.
  Çözüm: sonraki bölüm ilk ekranın altından görünsün." (6 of 8 missed the content under a full-screen
  opening; let the next section show.) → KEEP.
- Research card: "Sevdiğin sitelerde gövde metni 14–20 px arasında (Playdate 28,5 px ile istisna)." →
  KEEP.
- Study 1 table adds "Tür" and arrival per site; the "on teknik" list in Turkish (same ten) → §4.6.
- Shopify "Neden işe yarıyor": "Ritim: her bölüm aynı üç vuruşla geliyor: tablo ve tek kelime, kısa
  vaat, gerçek ekran. Tahmin edilebilir yapı, değişen görsel." (Rhythm: three beats, predictable
  structure, changing visual.) "Yön bulma: solda sabit I–XII dizini ... Daylight'ta ... bu dizinin
  yokluğu." "Başlıklar sonuç söylüyor ... Özellik adı değil, okurun kazancı." → KEEP all three.
- Shopify "Çıkarım": "Work için bölüm ritmi: her proje kendi 'tablosuyla' (bizde: cam nesne ve ürün
  rengi ışığı) açılsın, sonra sakin bir içerik sayfası gelsin." (Each project opens with its own
  "painting": the object and the product's light, then a calm content page.) → KEEP and ADAPT: the
  "painting" is now the project's frame plus its 2.5D illustration layers (N11); "calm content page" =
  the Dia/Notion presentation (N6).
- "Uzun sayfada sabit, numaralı dizin: bizdeki boncuk kaydırma çubuğu (ADR-0013) zaten bunun tohumu."
  (A fixed numbered index; our beads rail is its seed.) → KEEP = N2 ("scroll bar güzel").
- "Gövde metninde saf beyaz yerine sıcak gri." (Warm grey instead of pure white for body text.) → KEEP.
- Dia "Çıkarım": "Her proje sayfasında 'Dia adımları': 3 numaralı adım, solda kısa cümle, sağda gerçek
  ekran." (Three numbered steps, short sentence left, real screen right.) → KEEP for desktop inside an
  opened project; CONFLICT-minor with N3 (centred). Resolution [I]: the open project is its own state;
  centre the section heading and the two-column block on the page axis, both columns equal distance
  from the centre; on phones stack (Dia's phone layout stacks).
- "Bir kişinin vaat cümlesi de bir kazanç cümlesi olabilir: okurun onunla ne kazandığı." (A person's
  promise line can be a gain line.) → KEEP for N4.
- "Yazı hiyerarşisini tek rengin opaklıklarıyla kur: bizim koyu zeminde beyazın %92 / %70 / %50'si."
  (Hierarchy as one colour's opacities: white at 92/70/50 % on our dark ground.) → KEEP (Turkish-only
  proposal; see §13 for Dia's own dark ladder 100/80/60/40).
- Anime.js "Çıkarım": "Work'te tek sabit sahne: cam nesne yerinde kalsın, proje değiştikçe ışığı ve
  içindeki ekran değişsin." "Ürün renkleri işaret olarak (Recto limon, English Prep sakura, Eat Map
  gül): bölüm değiştikçe ışık rengi değişsin, bir anda tek renk." "Teknik bir proje için 'göster + kısa
  kod' ikilisi." → ADAPT the fixed stage (N5 uses frames that move, not one fixed object); KEEP product
  colours as aura hue, one at a time (N15); KEEP "show + short code" for an engineering step.
- Notion "Çıkarım": "Proje sayfasında iki seviye: 'ne kazandırır' başlığı, altında 'nasıl yapıldı'
  kartları ... vaka yapısına (sorun, rol, kararlar, sonuç) da birebir oturur." → KEEP = N6.
- Robin "Çıkarım": "Work'te proje kartından proje sayfasına ortak öğe geçişi ... View Transitions ile
  WebGL'siz yapılabilir; hareket azaltma tercihinde düz geçiş." "Sahibin uyarısı geçerli: bu bir Work
  deseni. Ana sayfada kişi önce gelir." → KEEP both (Work is below the brief on Home).
- Antoine "Neden": "Yazı karşıtlığı: çok kalın ve çok ince yan yana"; "İşler küçük resim değil, gerçek
  ekranlar halinde hareket ediyor"; "Ödüller bir liste değil, sayfanın parçası: kanıt tasarıma
  işlenmiş." → KEEP all three. "Çıkarım": bold/thin contrast with our serif/sans pair, "ama doygun zemin
  rengi yok: renk ışık olarak kalsın"; "projeler hareketli gerçek ekranlarla görünsün". → KEEP.
- Anthony/Jakub "Çıkarım": "Ana sayfada Anthony tarzı yapısal satırlar: 'Studying at YTU', 'Building
  Recto, English Prep, Eat Map', 'Focused on ...'. Etiket + kanıt." "Sade olmak tek boyut demek değil:
  en az üç seviye (başlık, metin, etiket) ve bir parça ışık." → KEEP for N4; the YTU and project names
  must be checked against `content/` before use (department wording, not owner copy).
- Stripe: one family, 300 weight, size-only hierarchy (56/48/32/26/22/18/16); (.25,1,.5,1) 300 ms;
  proof band of numbers. → KEEP the proof band idea per project.
- Arc: points to Dia on its own site: "ürün geçişi anlatımın parçası". → no load.
- Playdate: one font, body 28.5 px, Display-P3 yellow and purple. → ADAPT: P3 colour for the aura is
  allowed where supported [I].
- Mathis: name 190 px; "tıkla aç" label; slow from WebGL + 5 videos at once. → "do not" load heavy
  media on arrival; lazy-load frames.
- Maxime: largest 24 px; no promise line. → "do not".
- Eight common patterns (Vaat cümlesi; Bölüm başına tek fikir; Sabit dizin; Sabit sahne, değişen
  içerik; Gerçek ekran, kanıtla birlikte; Üç sesli yazı sistemi — "Etiketler küçük, BÜYÜK HARF, harf
  aralıklı"; Yumuşatılmış karşıtlık; Kısa ve tutarlı hareket — "Hareket bir şey açıklamak için var").
  → KEEP 1–7; ADAPT 8 (consistent and explanatory, but no longer short: N9).
- Study 4 reading: "metni tek bir dar sütunda (600–670 px, yaklaşık 65–75 karakter) ve ortada
  duruyor ... büyüklük yok, düzen var." (One narrow centred column; no size, but order.) → KEEP for the
  brief; it matches N3.
- "Sahibin tarif ettiği ana sayfa ikisinin birleşimi: Dia'nın 'ben buyum' çerçevesi ve sade sitelerin
  CV netliği." → KEEP for the brief.
- Order cards 1–6 with examples ("I work on the Web team at Linear"; "Çoğunda sayfanın ilk 130
  pikselinde") → KEEP: name in the first ~130 px [M].
- Strips: "Hepsi tek renk zemin; sınırlar çizgiyle değil boşlukla çiziliyor." (Borders by space, not
  lines.) → KEEP.
- Lee Robinson: "kısa hal işe alan kişiye, uzun hal tanışma okuruna hitap ediyor; aynı ihtiyacı bir
  About sayfası da karşılayabilir." → ADAPT: no About page (N1), so the in-place long version wins.
- Work transitions: "Desteği: Chrome 126+, Safari 18.2+ ... hareket azaltma tercihinde de geçiş
  kapanır. Bu, sitenin 'her efektin durağan ikizi' kuralına uyuyor." → KEEP the still twin; the
  version figures are unsourced (digest note).
- Saptamalar (conclusions) → same as §4.11.

## 6. `final/liked-sites.md` and `final/begenilenler.html` (16 dossiers; accepted brief, N16)

Per site: owner note (quoted in §10), structure, why it works, caution ("Dikkat"), technique, CSS values.
Only the design-bearing lines; numbers go to §13.
- **Shopify Editions.** 60.1 / 65.6 screens; 12 chapters in three beats; fixed I–XII index; clamp()
  type; 12/14-column grids with subgrid; spring at 400–500 ms; view-transition (15) and reduced-motion
  (9) rules; "Köşeler 2–3 px: neredeyse keskin" (corners nearly sharp); backdrop blur 8 px; 4 fixed,
  4 sticky elements. Caution: "Ağır bir sayfa: 12 video, iki WebGL tuvali, Lenis ... 150'den fazla
  video ... Rönesans tabloları bu sayıya özgü bir sanat yönetimi." → KEEP rhythm, index, spring,
  fluid type; ADAPT "art direction specific to the issue" into our own illustrations (N11), with a
  weight budget (lazy media).
- **Dia.** 7 / 7.8 screens; promise + real browser window; 01–03 stepper "etkin olan koyu, diğerleri
  soluk, sağdaki görsel adıma göre değişiyor"; six work-situation cards; privacy; closing CTA; sticky
  download button bottom centre. Caution: "Kırık beyaz zemin (#fbfaf6) ve sarı vurgu ürünün kendi
  kimliği; gece kullanımı için tasarlanmamış." → KEEP layout; ADAPT colours (N15). Technique: 10 px
  root; 12 × 100 px grid; 760 px text container; radius 20 px and pill; backdrop blur 12 px; 150–250 ms
  on (.4,0,.2,1); edge effects on (.77,0,.175,1) and (.22,1,.36,1); keyframes chroma-sweep and
  page-enter; reduced-motion support. → KEEP.
- **Anime.js.** 23.5 screens; one fixed ring; code beside it; "Her özellik kendi vurgu renginde
  parlıyor (drop-shadow ile ...)"; no reduced-motion rules found. → KEEP glow per accent (aura), ADAPT
  with a still twin.
- **Notion Calendar.** 9.4 / 12.1 screens; "It's time." 64 px + real app video; four themes, each with
  cards (short title + one sentence + screen fragment); integrations; FAQ. Caution: "Kurumsal bir
  tasarım sisteminin ('tatami') parçası; tek başına bir kişilik değil." → KEEP the layout, add the
  personality from our aura and illustrations. Technique: radii 8–12 px; 39 container queries; 14
  scroll-timelines; 20 reduced-motion rules; 150–250 ms ease-in-out; breakpoints 600/840/1080/1280/1440.
  → KEEP (scroll-timelines are the CSS way to do N9's scroll-driven arrivals).
- **Stripe.** 16.9 / 24.1 screens; outcome headline; mock UI cards; numbers band; Söhne 300;
  (.25,1,.5,1) 300 ms; 91 reduced-motion rules; clip-path panels. Caution: corporate density. → KEEP the
  numbers band; "do not" corporate density.
- **Arc.** 6.8 / 4.4 screens; Marlin Soft on #fffcec; space scale 4–72 px. → space scale idea KEEP
  (4/8/12/16/24/32/40/48/56/64/72).
- **Playdate.** 17.1 / 12.1; one-word chapters ("The System.", "The Design."); P3 colour; 28.5 px body
  ("Gövde çok iri; uzun metinde ekran çabuk doluyor"). → KEEP one-word chapter names for project steps;
  "do not" a 28 px body.
- **Exat.** Poster letters to 654 px; GSAP + ScrollTrigger + Lenis; "yalnızca tipografik cesaret ve
  renk blokları için başvuru". → reference only.
- **Anthony Fu.** 1.4 / 2 screens; name 36 px; "Working at / Creator of / Core team of / Maintaining"
  rows with logos; lines 90 ms apart; "kenarda soluk, kendini çizen dallar" (faint self-drawing branches
  at the edge). Caution: 79 ch line; many inline icons. → KEEP rows, stagger, edge art; ADAPT line ≤ 65 ch.
- **Louis Paquet (disliked).** Label column + content column, all 18 px Inter 650, 100 px between
  sections; work links to clients' sites in new tabs. → KEEP the 100 px rhythm idea; CONFLICT left
  labels with N3; "do not" external hops.
- **Jakub Krehel.** 2.6 screens, everything 16 px; section gaps 64–128 px; radius 16 px. Caution:
  monotony. → KEEP for the Record list density, with at least three type levels.
- **Jhey Tompkins.** One screen; serif 58 px headline; signature; links; grayscale images; "İçerik yok
  denecek kadar az; sahibine 'hitap etmiyor'." → "do not" an empty home.
- **Maxime Heckel.** Dense dated list; oklch tokens (one hue 262); spacing --space-0…11 (0–80 px);
  radius 4–16 px; page view-transitions. Caution: no promise line. → KEEP the token method (oklch, one
  hue, ladder) for Graphite.
- **Robin Noguier.** One-screen WebGL carousel; one-word names 135 px; one line; "Open case study";
  shared-element open 1.4 s / back 1.6 s; clip-path curtains; styles in JS. Caution: "Görünen her şey
  WebGL; erişilebilirlik ve telefon davranışı sınırlı." → KEEP the motion; ADAPT to DOM/CSS so text stays
  real text and the phone works.
- **Antoine Wodniack.** 24.4 / 22.8 screens; giant tracked "CREATIVE · DEVELOPER" (216 px); thin serif
  intro; awards built into the page; "WORK harflerinden bir duvar önünde süzülen gerçek proje
  ekranları"; closing "Coding my way since 1987". Caution: saturated #f40c3f; no reduced-motion rules;
  34 videos. Technique: --strip-gap 25 px; easings (.86,0,.07,1) masks, (.23,1,.32,1) and (.19,1,.22,1)
  decelerations, (1,0,0,1) hard; 0.6–1 s; heavy clip-path. → KEEP the floating frames over a typographic
  wall (a 2.5D layer idea for N5/N11), the mask reveals and the easings; drop the red.
- **Mathis Biabiany.** Giant name; free collage of video project cards; "click to open the project";
  cream #f3f1ea; --pm-gutter clamp(20px, 5.2vw, 100px); 17 reduced-motion rules; radius 20 px. Caution:
  slow load. → KEEP the collage idea for "stacked or side by side" frames; KEEP the fluid gutter.

## 7. Report 01: `reviews/2026-10-12-02-loved-sites/report.html` (accepted brief, N16)

- Kısa sonuç: "'Ana sayfa sade ve CV gibi, kanıt hemen görünsün' kararın tam bu veriye denk düşüyor."
  → KEEP for the brief + first Work frame.
- "Göz yorgunluğu saf siyah-beyazdan çok tekdüzelikten geliyor ... Sevdiğin siteler zemini hafif renkli
  tutuyor ve hiyerarşiyi boyut, ağırlık ve opaklıkla kuruyor." (Eye strain comes more from monotony;
  loved sites keep the ground slightly tinted.) → KEEP: N15's aura-tinted near-black is exactly a
  "slightly tinted ground".
- "Dia, Notion, Stripe ve Anime.js'te yükleme ekranı yok; Shopify'ın yalnızca kısa bir açılış çerçevesi
  var." → KEEP: no loader.
- "Work için en güçlü fikir Robin Noguier'de: tıkladığın görsel kaybolmuyor." → KEEP = N5.
- "Bundan sonra her tasarım bu ölçütlere göre değerlendirilecek." → KEEP (§3 criteria).
- Site sections (Shopify, Dia, Anime.js, Notion, Robin, Antoine, Anthony/Jakub, the five short ones):
  same text as rapor.html with "Bize ne alınır" instead of "Çıkarım" → verdicts as in §5.
- **Bizim siteye çeviri (the skeleton offered for approval; now accepted brief):**
  - "Ana sayfa · 7 saniye kuralı: Sade, CV gibi, kanıt ilk iki ekranda." → KEEP.
  - "Kim ve ne: ad + tek cümlelik kazanç cümlesi. Yazı en fazla 48–64 px." → KEEP; E4 sets 48 px.
  - "Yapısal satırlar (Anthony Fu): okul, odak, yaptıkların; etiket + kanıt." → KEEP.
  - "Öne çıkan proje(ler): her biri tek cümle, gerçek ekran, Work'e geçiş. Bu bölüm ilk ekranın altından
    görünsün (sahte zemin olmasın)." → ADAPT: the projects are the Work section itself; the first frame
    peeks above the fold; N8 forbids listing the projects twice (rows in the brief AND frames in Work).
    Resolution: the brief names the projects in one structural row only (allowed as "intro summary"),
    the frames carry everything else.
  - "Şu sıralar (now): 3–5 satır, tarihli. Tanışma okuru için." → KEEP in the rest (N7).
  - "Bağlantılar: GitHub, LinkedIn." → KEEP in the rest (N7).
  - Work: "Sabit sahne: cam nesne yerinde; proje değiştikçe ışık rengi ve içindeki ekran değişir." →
    ADAPT (N5 frames). "Ortak öğe geçişi karttan proje sayfasına (Robin)." → KEEP. "Proje sayfası: vaat,
    sonra 3 numaralı adım + gerçek ekran (Dia), sonra nasıl yapıldı kartları (Notion): sorun, rol,
    kararlar, sonuç." → KEEP = N6, the exact order of an opened project. "Uzun sayfada sabit dizin
    (Shopify; bizde boncuklar)." → KEEP = N2 rail. "Hareket: arayüz 150–300 ms, sahne 400–800 ms; iki
    eğri; her efektin durağan ikizi." → ADAPT scene band (N9, E3); KEEP two curves and still twin.
  - "Proje başlığı formülü: Kullanıcı artık ne yapabiliyor + kısa 'nasıl' ... '[Kullanıcı] artık
    [şunu] [şu kolaylıkla] yapıyor.' Gerçek cümleleri sen yazacaksın; projelerin hakkında iddia
    uydurmuyorum." (The user can now do X + a short how; the owner writes the real lines.) → KEEP; we
    write no claims; placeholders are hidden, not shown (repo rule).
- **Sorular (taste questions of 2026-10-12)** and their status now:
  - "Ana sayfada projeler ne kadar görünsün? (a) tek proje + Work bağlantısı, (b) üç projenin küçük
    satırı, (c) kısa özet ve Work bağlantısı." → SUPERSEDED by N5: all projects as frames on Home.
  - "Koyu zemin aynen kalsın mı ... koyu kalsın ama saf siyah yerine #111–#1a1a1a, metin saf beyaz
    değil. İstersen bir açık tema düğmesi de olabilir." → ADAPT: N15 keeps near-black with aura; the
    #111–#1a1a1a band is the upper limit for text-bearing surfaces [I]; light theme SUPERSEDED.
  - "'Şu sıralar' bölümü olsun mu? ... Record ile çakışmaması için yalnızca kısa satırlar." → KEEP,
    and N8 confirms "no overlap with the Record".
  - "Work'te Shopify'ın 'bölüm açılışı' fikri hoşuna gider mi? Her proje kendi büyük açılış anıyla gelir
    (cam nesne + ürün rengi ışığı + tek kelime), sonra sakin içerik sayfası." → KEEP now (N10, N9): each
    project gets its chapter opening as the paper grows.

## 8. `reviews/2026-10-12-02-loved-sites/concepts.md` (= `final/data/research-sources.md`)

### 8.1 Hiring
- [S] 7.4 s scan; simple layouts with clear sections and headings, F/E patterns, bold titles and
  bulleted accomplishments did well; clutter, little white space, multiple columns, long sentences did
  badly; job titles looked at most; an overview at the top. → KEEP: the brief opens with name, role and
  one overview line.
- [V] F-pattern and layer-cake scanning; key points in the first two paragraphs; headings start with
  the most informative words. → KEEP for project headings.
- [V] 204 hiring managers: problem, role, constraints, process incl. rejected ideas, impact, lessons;
  3–5 deep case studies. → KEEP as the content of N6 steps.
- [S] HackerRank 2018: GitHub/project work is an important indicator (84 % of founders). → KEEP: links
  to code from each project.
- [S] Linear/Vercel design-engineer postings ask for visible craft, polish, accessibility, performance.
  → KEEP: the motion must also be fast and accessible (N13).
- [V] Emil Kowalski: posting small UI recreations led to offers. → KEEP as a Record content idea.
- Practitioner basics: title and stack visible without scrolling; projects before a long bio; one-liner,
  stack, live link, code link per project. → KEEP.
- "What it means": 7 s order (who and what; 2–3 focus keywords; proof); write for layer-cake scanners;
  each project a mini case study; small polished pieces count more. → KEEP.

### 8.2 Social card
- /now pages (Sivers 2015); IndieWeb "home on the web"; /about, /now, /uses, /colophon small pages. →
  ADAPT: two pages only (N1); these become sub-sections of "the rest".
- "proof first, then personality: a short 'Now / currently into' strip, tools, interests, location
  (Istanbul) and contact." → KEEP the order; "Istanbul" is a sample, not an owner fact (digest §7).
- Compact dated Now block, 3–5 lines; interest chips; one canonical URL. → KEEP (chips fit the
  Anthony Fu row style).

### 8.3 Aesthetics and readability
- Baymard 50–75 ch; Butterick 15–25 px; WCAG 4.5:1 body, 3:1 large text. → KEEP (N13 audit).
- [V] NN/g 2020: light mode reads better for normal vision; "offer a toggle". → SUPERSEDED by N15 (the
  owner heard it and chose Graphite on 2026-10-15).
- [S] Material #121212 and 87 % / 60 % white; pure white "vibrates"; saturated colours vibrate on dark.
  → KEEP: text white at ≤ 92 %; aura hues desaturated where text sits.
- [S] Halation on bright text on black (astigmatism). → KEEP: slightly heavier weights on dark, no pure
  white body.
- [V] NN/g scroll: 57 / 74 / 81 % in screens 1 / 2 / 3; "give people a reason to scroll". → KEEP.
- [V] Illusion of completeness: 6 of 8 users missed content under a full-viewport hero. → KEEP.
- [V] Progressive disclosure: core first, detail one obvious step away, at most two levels. → KEEP:
  frame (level 1) → opened project (level 2); no third level.
- [S] Scrollytelling (CHI 2026, N=454): higher engagement, lower load, same comprehension. → KEEP: N9's
  scroll-driven story has evidence for engagement, not for understanding; the text must still carry it.
- "Suggested type settings: body 17–20 px, max-width ~65ch, line-height 1.5–1.6." → KEEP.
- "Suggested dark colours: #111–#1a1a1a ground; body #e6e6e6 or white ~87 %; secondary 60–70 %;
  desaturate accents; slightly heavier weights on dark." → ADAPT ground per N15; KEEP the rest.
- "Don't let the hero fill the full viewport ... motion only when it demonstrates something, honour
  prefers-reduced-motion." → ADAPT "only when it demonstrates" (N9 wants motion everywhere); KEEP
  reduced motion.

### 8.4 Marketing the user
- Sierra (make users awesome; the ideal-review test); Hulick (Mario, not the flower); Nethercutt (the
  "better versions" line; not Hulick); JTBD milkshake; Before–After–Bridge; Apple "1,000 songs in your
  pocket"; Dia "More than a browser. A better workday." and second-person action headings. → KEEP all
  as copy method.
- Notion Calendar: "All of your commitments, now in one place", outcome lines next to feature labels. →
  KEEP: theme heading = outcome, card title = feature (N6).
- "Write each project's headline as what the user can now do, then the tech ... run Sierra's test ...
  add one 'how' line for engineers ... apply the same idea to yourself ... Before → After → Bridge as the
  case-study skeleton." → KEEP. The sample "free study room in 5 seconds" is an illustration, not a fact.

### 8.5 Product storytelling
- Dia anatomy [V]: hero promise + CTA + trailer; "Dia reads between the tabs" 3 numbered capabilities;
  "Built for how you actually work" 6 cards; privacy mock; closing CTA. "Pattern: short headline, one
  line of copy, one product visual per feature." → KEEP = N6.
- Notion anatomy [V]: "It's time." + looping video; four themed sections, sub-features with short title
  + screenshot; integrations; CTA; FAQ. → KEEP = N6.
- Anime.js [V]: ~9 feature sections; code snippets; bundle-size proof (24.5 KB). → KEEP proof idea.
- Stripe [V]: Web Animations API, IntersectionObserver to start animations on view, prefers-reduced-
  motion; the globe at 60 fps with a static fallback, pausing while scrolling, 60k → 20k dots. → KEEP as
  performance practice for N9/N11 (pause off-screen layers, static fallback).
- Shopify [V]: 150+ updates in 12 sections; one-word heading + tagline; sticky category nav; in-house;
  150+ videos; Hydrogen; [S] CRT shader, R3F, React Spring; [S] View Transitions and CSS scroll-driven
  animations; aggressive asset compression. → KEEP view transitions + scroll-driven CSS + compression as
  the technical route to N10 without a heavy framework.
- Common principles 1–6 (promise + one sentence + one CTA; one idea per block; show the product
  working; proof bands; functional, viewport-triggered, cheap motion that respects reduced motion;
  long pages organised by sticky nav or numbered sections). → KEEP 1–4 and 6; ADAPT 5 (motion is also
  atmosphere now, N10; still cheap and reduced-motion safe).
- "Structure the home page like a mini product page: hero, featured projects with live visuals, skills
  strip, Now, contact." → KEEP: it matches N3–N7 closely.
- "Two-level progressive disclosure (card, then case study) beats one very long scroll." → KEEP: the
  frame opens in place; the Home scroll stays navigable.

## 9. Report 02: `reviews/2026-10-14-03-home-and-work/report.html` (accepted brief, N16)

- Kısa cevaplar: "uzun mu, kısa mı? Kısa ... 1,1 ile 2,8 ekran" → SUPERSEDED (N1/N5). "şerit şerit mi?
  Evet. 3 ila 7 bölüm ... boşluk her sitede kendi içinde sabit (58–165 px)." → KEEP for the rest.
  "'şu sıralar' olsun mu? Evet, ama kısa ... Emil'in 'Today' bölümü: iki cümle, ismin hemen altında." →
  KEEP. "açılış gösterisi? Yok" → ADAPT (E1/E2). "Work geçişi? Robin Noguier türü 'ortak öğe' geçişi
  ... ADR-0007 ... yeni bir yönlendirici gerekmiyor." → KEEP the effect; ADAPT the mechanism to
  same-document (§4.10). "açık tema? düğme yok." → KEEP (N15).
- Measurements table → §4.9 (same values).
- "Senin ana sayfan için ikisinin birleşimi" (Dia frame + CV clarity) → KEEP for the brief.
- Order cards and strips → §4.9.
- "Bizim için anlamı: ana sayfayı CV kısalığında tutup 'uzun hali' tanışma okuruna ayırabiliriz. Bu,
  About sayfasıyla çakışabilir" → ADAPT: no About page; the long version opens in place (N1, N8).
- Work transitions (Robin 1.4/1.6 s; basement 1.7 s; 14islands 2.9 s) → §4.10.
- **Öneri — Ana sayfa · 1,5–2,5 ekran: "Dia çerçevesi + CV şeritleri"** (accepted brief, now read as the
  top brief and the rest):
  - "Vaat: adın ve tek cümle ... İlk ekranda 20–40 kelime; yazı en fazla 40–48 px. Yanında sitenin cam
    nesnesi, küçük ve sakin; açılış gösterisi yok." → KEEP 20–40 words and 40–48 px (E4 48 px);
    CONFLICT "yanında" (beside) with N3: put the object or illustration centred above/behind the name,
    or in the aura layers (N11). The object choice stays open (owner: decide while seeing it).
  - "Bugün: iki cümle: YTÜ Bilgisayar Mühendisliği birinci sınıf, şu an üzerinde çalıştığın şey." →
    KEEP form; facts from `content/` only.
  - "Yapısal satırlar: 'Building · Recto, English Prep, Eat Map', 'Learning · …', 'Focused on · …'.
    Etiket solda, içerik sağda (Louis'den)." → KEEP the rows; CONFLICT "label left" with N3: centre each
    row as "label · chips" on one centred line, or label above.
  - "İşler: üç proje, her biri tek satır + tek cümle + küçük ekran; satır Work'teki proje sayfasına
    götürür. Burası ilk ekranın altından görünsün." → SUPERSEDED by N5 (frames instead of rows) and N8
    (no second list); KEEP "peeks under the first screen".
  - "Kayıt: Record'dan son 2–3 başlık, tarihli." → KEEP as the Record pointer in the rest (N7); N8 is
    respected because the titles live on the Record page, and Home shows only a pointer.
  - "Bağlantılar: GitHub, LinkedIn." → KEEP.
  - "Ölçüler: tek sütun 640–680 px; bölüm arası sabit (96–128 px); etiketler küçük, mono, gri; zemin
    saf siyah değil." → KEEP column and gaps for the brief and the rest; ground per N15.
- **Öneri — Work: "Galeri + ortak öğe geçişi"**:
  - "Galeri: projeler yan yana ya da alt alta büyük kartlar; her kartta gerçek ekran (hareketli olabilir)."
    → KEEP = N5 (cards become photo frames or sets).
  - "Geçiş: kartın görseli proje sayfasının üstündeki görsele dönüşür; başlık yerinde kalır, zemin
    projenin ışık rengine kayar. Süre 450–700 ms (Robin 1,4 sn, ama onda WebGL düzleşmesi de var)." →
    KEEP the choreography; SUPERSEDED the duration by E3 (the long version may be tried; Robin's
    1.4 s is the reference); "zemin projenin ışık rengine kayar" = N15's aura taking the project's hue.
  - "Dönüş: geri tuşunda tersi; galeride aynı karta dönülür." → KEEP (Back returns to the same frame and
    scroll position).
  - "Proje sayfası: vaat, 3 numaralı adım (Dia), 'nasıl yapıldı' kartları (Notion)." → KEEP = N6.
  - "Telefonda: aynı geçiş daha kısa (300–400 ms) ya da sade kayma." → ADAPT (N12): the phone may get
    its own transition; not necessarily shorter, but it must not stutter on a phone GPU.
- **Ana sayfa taslağı** (layout only): "Eren Deniz K." / one sentence / Bugün / Yapıyorum (Recto,
  English Prep, Eat Map — "tek cümle: kullanıcı artık ne yapabiliyor") / Öğreniyorum ("işlemciler,
  gömülü sistemler…") / Kayıt (two dated titles) / Bağlantılar. "Gerçek cümleleri sen yazacaksın." →
  KEEP as the order of the brief and rest; the "Yapıyorum" block is replaced by the Work frames (N5, N8);
  "Öğreniyorum" topics are department samples until confirmed in `content/`.
- **Tartışalım** (and the answer now):
  - "Ana sayfadaki proje satırları tıklanınca nereye gitsin? (a) Work'te o projenin sayfasına ... Öneri:
    (a)" → SUPERSEDED: the project opens in place on Home (N5).
  - "'Uzun hali' ana sayfada mı, About'ta mı? ... Öneri: About'ta kalsın" → SUPERSEDED by N1 (no
    About page): the long story becomes an in-place expansion in the rest (Lee Robinson form).
  - "Cam nesne ana sayfada kalsın mı? ... Öneri: küçük, sağ tarafta, sakin; vaat cümlesinin yanında bir
    imza gibi. Work'te ise sahnenin merkezi." → CONFLICT "sağ tarafta" with N3; ADAPT: small and centred
    as a signature, or dissolved into the 2.5D aura layers (N11). Open, decided on a comp.
- `manual.json`: click recipes for Louis Paquet and Exo Ape probes. → no design load.

## 10. `tools/picker/template.html` and the owner's 31 notes

- Picker lede: "Beğendiklerini ve beğenmediklerini işaretle; istersen bir iki kelimelik not bırak." The
  note field placeholder: "not (isteğe bağlı): neyi sevdin, neyi sevmedin". Views: desktop, scroll,
  phone, first 3 s. → The notes below were written as short spontaneous reactions to these four views;
  read them as taste signals, not specifications [I].
- The template itself holds no owner notes; the notes are in `library/votes/picks/*.json` (31 files,
  identical to the report tables). Verbatim, with gloss and meaning now:

| Site | Vote | Owner note (verbatim) | Gloss | Meaning for the new direction |
|---|---|---|---|---|
| Anime.js | like | "çok güzel basit bir akış adım adım ürünü açıklıyor tek bir referans etrafında kendini çeşitlendiriyor güzel, biz de ürün showcaselerken kullanabiliriz" | very nice simple flow, explains the product step by step, varies itself around one reference; we can use it when showcasing products | step-by-step project body; one recurring element per project |
| Anthony Fu | like | "çok temiz kendini açıklıyor ben buyum bunları yapıyorum harika" | very clean, explains himself: this is me, I do these, great | N4 brief |
| Antoine Wodniack | like | "renk göz yoruyor ama animasyon yazı ve font, work'ün sunuluş biçimi baya güzel bir showcase" | the colour tires the eyes, but animation, type and font, the way Work is presented, a fine showcase | N5 frames; no saturated ground |
| Arc | like | "bence biraz daha sönük ama minimalist ok" | a bit dull I think, but minimal, ok | minimal is not enough alone |
| Dia | like | "BAYILDIM minimalist harika bir özet, ürünü harika tanıtıyor ve gösteriyor asla sıkıcı değil, animasyonlar ve genel sunum adım adım çok basit ve açıklayıcı ürünü güzel pazarlıyor" | LOVED IT: minimalist, a great summary, introduces and shows the product greatly, never boring; animations and overall presentation step by step, very simple and explanatory, markets the product well | N6 |
| Exat | like | "çok güzel ama bizimle alakası pek yok" | very beautiful but not much to do with us | reference only |
| Jakub Krehel | like | "ilk sayfa çok sade spark diyebileceğim bir hissi yok ama işleri projeleri ve yazılarının içeriği ve sunumu baya güzel ve ilham verici, sadece tek siyah beyaz bence göz yorucu" | first page very plain, no feeling I'd call a spark, but the content and presentation of works, projects and writing are quite good and inspiring; only the single black-and-white tires the eyes | Record content model; avoid flat black/white |
| Jhey Tompkins | like | "hiçbir şey içermiyor ama sadelik ve şıklık var nötr'üm ama hitap etmiyor" | contains nothing, but has simplicity and elegance; I'm neutral, it doesn't speak to me | elegance needs content |
| Mathis Biabiany | like | "yavaş ve kötü optimizasyon ama arka planda yaptığı ve özellikle 3d işleri inanılmaz iyi duruyor ama bizlik bir yanı şuan yok" | slow and badly optimised, but what he does in the background and especially the 3D work looks incredible; nothing "us" about it now | living background yes (N10/N11); weight budget |
| Maxime Heckel | like | "çok bir havası yok, tüm işlerini sunuyor ve güzel güzel açıklıyor ama üzerine çok da okumak için bir sebep vermiyro çok teknik kalıyor" | not much atmosphere; presents all his work and explains it nicely, but gives no real reason to read further; stays very technical | promise lines; atmosphere |
| Notion Calendar | like | "basit güzel akıcı anlatıyor" | tells it simply, beautifully, fluently | N6 |
| Playdate | like | "renk tasarım canlı göze çarpıyor bakması stili güzel" | colour and design lively, eye-catching, nice to look at, nice style | lively colour as aura |
| Robin Noguier | like | "ilk sunum ve sunumdan içeriğe geçişi çok akıcı bayıldım, ama birkaç şeyi sunuyor ama kendisini sunmuyor, portfolyo'nun kendisi için değil ancak work kısmında iş görebilir" | the first presentation and the move from presentation to content are very fluid, loved it; but it presents a few things, not himself; not for the portfolio itself but can work for the Work part | N5 |
| Shopify Editions | like | "BAYILDIM, sunum aşırı güzel animasyonlar ve görseller mükemmel, hiçbir noktada sıkıcılarşmıyor harika bir kompozisyon harika bir akış renk okunabilirlik propozisyon animasyonlar harika bayıldım" | LOVED IT: presentation extremely beautiful, animations and visuals perfect, never gets boring at any point, great composition, great flow, colour, readability, proportion, animations great, loved it | N10 |
| Stripe | like | (no note) | — | proof band |
| Bruno Simon | dislike | "kötü" | bad | no game |
| Bézier | dislike | "bize hitap etmiyor" | doesn't speak to us | — |
| Chungi Yoo | dislike | "avaraj" | average | own illustrations must rise above "average" |
| Cowboy | dislike | "bize hitap etmiyor" | doesn't speak to us | — |
| Craig Mod | dislike | "okunaksız ve ucuz" | illegible and cheap | legibility first |
| Cyd Stumpel | dislike | "konsept güzel ama eski kaldı pek modern değil" | nice concept but dated, not very modern | modern finish |
| Daylight Computer | dislike | "yorucu uzun uzun, hızlı ve açık değil" | tiring, drawn out, not fast and clear | slow motion yes, slow content no |
| Eduard Bodak | dislike | "güzel gösteriyor ama iyi açıklamıyor" | shows nicely but doesn't explain well | N6 |
| Frank Chimero | dislike | "oki ama bizlik değil vasat" | ok but not us, mediocre | — |
| Henry Heffernan | dislike | "ok ama bizle alakası yok" | ok but nothing to do with us | — |
| Jesse Zhou | dislike | "evet uzun sürüyor vakit alıyor" | yes, it takes long, takes time | no gate, no intro wait |
| Josh W. Comeau | dislike | "göz alıcı bir tarafı yok" | nothing eye-catching | N10/N11 |
| Louis Paquet | dislike | "basitliği güzel her şey açık ve net, ama işlerini görebilmek için teker teker yüksek bütçeli sayfalar açmak optimal bir yol değil" | simplicity nice, everything clear, but opening heavy pages one by one to see the work is not optimal | N5 in place |
| Lynn Fisher | dislike | (no note) | — | — |
| Merouane Bali | dislike | "bu yoldan vazgeçtim güzel ama çok bir hiring ya da pazarlama noktası yok, sanırsam kendini iyi hızlı efektif ve modern pazarlama tanıtma çok önemli" | I gave up on this path; nice but no real hiring or marketing point; I think presenting yourself well, fast, effectively and modernly matters a lot | brief first |
| Scout Motors | dislike | "render'ları kötü ucuz ve cilasız hissettiriyor" | its renders are bad, feel cheap and unpolished | reused 3D renders must be top quality or not used |

## 11. `library/lists/` (Turkish descriptions used in the picker)

The descriptions are the department's one-line summaries, not owner words. Lines that bear on the new
direction:
- tr-awards `shopify-editions-the-renaissance-edition`: "Webby 2026 En İyi Ana Sayfa; Awwwards Ayın
  Sitesi — Shopify'ın ürün güncellemeleri, dev ölçekte Rönesans tarzı bir galeri olarak sunuluyor." →
  KEEP: "a gallery at giant scale" is the right reading of N10.
- tr-awards `antoine-wodniack`: "Webby 2025 En İyi Ana Sayfa; CSSDA 2024 En İyi Portfolyo — Çarpıcı
  tipografik WebGL ve net, yüksek kontrastlı düzen." → KEEP for N5.
- tr-awards `anime-js`: "kesin, oyunbaz, kodla sürülen hareket". → context.
- tr-awards `merouane-bali`: "Tek bir sade girişle açılan, sürükleyici WebGL dünyası" → disliked: no gate.
- tr-portfolios `robin-noguier`: "WebGL proje karuseli ve sinematik geçişlerle çok örnek gösterilen bir
  portfolyo; 2026 Awwwards jüri üyesi." → KEEP.
- tr-portfolios `mathis-biabiany`: "Siyah, mavi ve camgöbeği; karanlıkta ışıkla çalışan gerçek zamanlı
  3B portfolyo." → note: the description says dark, the capture showed cream (#f3f1ea); treat the
  capture as the fact.
- tr-portfolios `exo-ape`: "Cilalı, premium hareketli siteler; cam nesne görselleri bizim için doğrudan
  ilgili." → a lead for glass-object frames (not voted; transition probe failed).
- tr-portfolios `aristide-benoist`: "Tipografi öncülüğünde hareket ve yumuşak görsel geçişlerde ölçüt
  sayılan WebGL portfolyosu." → an extra transition reference (not voted).
- tr-portfolios `basement-studio`: "Koyu, teknik, geliştirici kültürüne yakın estetik." → its transition
  (frame stays, page builds around) is an N5 option.
- tr-portfolios `the-pudding`: "Özel kaydırmalı anlatımlarla görsel deneme yayıncılığının ölçütü." → a
  scrollytelling reference for N9 (not voted).
- tr-products `dia-the-browser-company`: "Yumuşak renk geçişleri ve ölçülü tipografiyle sakin, editoryal".
  `notion-calendar`: "Kesin arayüz görüntüleriyle sade bir takvim ürün sayfası." `stripe`: "hareketli
  renk geçişi, yoğun ama zarif ürün anlatımı." `playdate-panic`: "kola odaklı, çizimli ve sevimli". →
  context; Stripe's moving gradient is another living-ground precedent (N10).
- tr-products `claude-anthropic`: "sıcak, kâğıt tonlu, serif ve elle çizim" and `granola`: "Defter kâğıdı
  estetiği" → own-illustration precedents (not voted).
- tr-products `ia-writer`: "metin merkezli sade tasarımın dersi gibi" → a Record reading reference.
- `blocked.json`: locomotive, reuters-graphics, nothing, follow-art, cartier-watches-wonders-2024
  (unreachable). `prev.json`: the 29 Study 1 sites with their Turkish one-liners (as in §4.6).

## 12. Repo digest `docs/research/2026-10-reference-research.md` (2026-10-15)

- Status: "Nothing here changes the brief ... the question is listed at the end." → KEEP the stance;
  the owner has since answered most questions (below).
- §1 limits: phone = emulation; every capture emulated `prefers-color-scheme: dark`; 79 of 127 still
  moving at 8 s; CSS understates JS/WebGL motion (Robin, Mathis, Antoine, Shopify); likes mostly product
  pages; intro/gate frames may have drawn some votes; the Arc like may be partly a vote for Dia. → KEEP
  as caveats.
- §1 spot checks: Robin open.settleS 1.38, back 1.63, sameDocument true, viewTransitions 0; Dia
  .85/.7/.6 (also .424–.55); Anthony slide-enter 1000 ms, delays 90…, linear; Antoine body #f40c3f, html
  #160000; Jakub #0c0c0c; Shopify 60.1 / 65.6 screens. → KEEP (re-confirmed in this reading).
- §2.1–2.5 taste: same as §3 and §10 here. → KEEP.
- §2.6 patterns: "The owner dislikes too little ... and too much or too slow ... The loves sit between:
  restrained ink, one strong meaningful moment per section, real proof, fast." "Praise attaches to flow
  ('akış', 'akıcı') and to explaining step by step ('adım adım')." "Seven notes judge 'us / not us'."
  "Home and Work are separated cleanly." "A liked first screen says what the thing is in one line and
  shows it." → KEEP all except "Home and Work separated": SUPERSEDED by N1/N5 (same page, still in
  order: person first, work second).
- §3.1 medians [M]: body 16 px (all groups); line 41 ch median (38.5 liked); largest first-screen text
  52 px (48 liked); settle 2.75 s liked; liked page height 9.4 screens; liked first-screen media 51 %;
  liked strong colours 3; dark first screen 47 % liked. "Speed, body size and line length do not
  separate likes from dislikes ... the owner's 'slow' complaints are about gates, intro sequences and
  long heavy pages, not page-load time." → KEEP: liked pages are long (9.4 screens) and image-rich
  (51 % media) — this supports N1/N5 over the CV-short Home.
- §3.2 loved-site table → numbers in §13.
- §3.2 recurring: body 16 floor, loves at 20; display 36–64 on quiet pages; tracking -0.02 to -0.05 em;
  liked lines ~44–67 ch; one ink at 3–4 opacities + one accent; UI 150–300 ms, entrances 400–1000 ms,
  (.4,0,.2,1) most shared, decelerating entrances, only Shopify overshoots; many reduced-motion rules
  on the best-built; orientation devices (Shopify index, Anime ring, Dia steps, Robin dots). → KEEP;
  entrance band widened (N9).
- §3.3 Study 4 table (gap ranges 56–61, 47–284, 64–68, 64–179, 100, 64–188, 116–144, Dia 101–1521) and
  "Only one of the eight personal home pages (Anthony Fu) was liked without reservation ... The strip
  numbers describe a genre, not a measured preference." → KEEP the caution: the CV shape was never a
  measured preference, which makes N1's long Home safe.
- §4.1 Home findings (hiring in two screens; strips; stable order; Anthony rows "copy the structure,
  not the prose" — his "Dreaming up cool ideas ..." line is the banned kind; simple ≠ one size; Lee's
  Short/Long; Dia's 20 words; no full-screen hero; no opening show; report 02's draft). → KEEP, with the
  ADAPTs already given (§4.9, §9).
- §4.2 Work: gallery inside the site; transition table (Robin 1.38/1.63; basement 1.71/4.47; 14islands
  2.87/4.49; all same-document; none uses VT API); Robin frame by frame: "the blue ground is wiped by
  grey from the left as a hard vertical edge; the title 'Fun' turns black and stays near its place; the
  curved image flattens to a rectangle and slides into its spot; the header swaps quietly to '← BACK
  HOME'; no blank frame at any point. Back is a horizontal curtain ... 'geldiğin yere dönüyorsun'." "Why
  it does not feel like a new page: the clicked object, the title and the place on screen all survive;
  only the ground and the chrome change, by a directional wipe." → KEEP: this is the spec of N5's open.
  The ADR-0007 cross-document path → ADAPT to same-document (§4.10).
- §4.2 inside a project: promise; Dia steps ("the active step dark with a rule, the others pale");
  Anime.js fixed stage, one accent per feature, lit ring segment as progress; Notion two levels;
  Shopify rhythm; Playdate one-word chapter names; Antoine live screens with tiny mono captions and
  proof in the layout; 3–5 deep case studies. → KEEP all (N6).
- §4.3 Photography: large, still, factual caption, dissolve; no hover distortion. → ADAPT (E6): the
  owner now wants the postcard to grow, flip and swing in the enlarged view.
- §4.4 About: long story on About; Jhey's live "now" lines echo the Istanbul clock. → ADAPT: About
  material moves into Home's rest (N1, N7); the clock is liked as is.
- §4.5 domain table: largest line ≤ 64/40; body ranges; line-length ranges; three voices; one ink at
  several opacities (Dia .85/.70/.60; dark 92/70/50; Material 87/60); grounds soft black vs near-black;
  one accent; UI 150–300; scenes 400–1000; arrival ≤ 1 s; Work transition 1.4/1.6 s vs 450–700 ms. →
  KEEP / SUPERSEDED as: largest line → E4; arrival → E2; transition → E3; ground → N15.
- §5.1 "Agrees" (restraint; dark colour as light; real screens stepped; native VT; still twins;
  unwritten hidden; Record dated list; Record 21 px / 28 em; motion tokens 120–720 ms; per-project
  colour; pages have jobs). → KEEP except "restraint" (ADAPT, N9/N10) and the 720 ms token ceiling
  (SUPERSEDED, E2/E3).
- §5.2 "Extends" (charter limits; Home shape; shared element from card to project hero, not done yet:
  `view-transition-name` today only on `bar`, `stage`, `tab-ind`, `rail`, `mark-dot`; project layers;
  now section; orientation via the beads rail; photography). → KEEP as build notes; N14 says not to be
  bound by the old features, but the rail stays (N2).
- §5.3 "Contradicts" and the status now:
  - Home character (brand showcase vs CV strips) → resolved by N3–N7.
  - edk object on Home → open; see §9.
  - Display size (live Home 52–122 px; research cap 64/40) → E4 provisional 48/34 for Home.
  - Ground #0a0a0b vs soft black → N15: near-black stays, the aura colours it.
  - Light theme → closed (N15).
  - Real-time 3D → closed; pre-rendered objects may be reused (N11).
  - "Postcards (brief line 74: hover, flip): ... the owner dropped the postcard requirement on
    2026-10-11. Brief line stale." → SUPERSEDED by the owner's 2026-10-15 lines: the postcard is still
    the right concept; keep the cards (N2, E6).
  - Desktop or phone first → N12: both, may differ.
  - The 1000 ms ceiling vs Robin's 1.38/1.63 s → resolved by E2/E3.
  - Postmortem item 6 (scroll-linked or pinned things go to a lab page first) → KEEP as process: N9
    effects are tried on lab pages before they reach the live page (repo rule).
- §6 techniques table → KEEP all rows except "Label plus proof rows ... Louis Paquet (left label)"
  (ADAPT: centred) and "Lines fading in 90 ms apart ... finished in about 1 s" (ADAPT: slower allowed).
- §7 "Not to do" list → KEEP all, with two notes: "Tilted perspective screens, floating phones" stays a
  "do not" for screens at rest, while a rotated paper during the open is allowed (N5); "The Robin
  pattern on Home" is SUPERSEDED — Work is on Home now, but below the brief (the owner's original worry
  was "kendisini sunmuyor", which the brief answers).
- §8 open questions 1–12 → 1–3 answered by N1–N7; 4 by N1 (long story in place); 5 open (decide on a
  comp; N11 widens the options); 6 and 7 answered by N15; 8 answered by N9/N10 (each project may have
  its opening); 9 by E3 (long version on a lab page); 10 by N12; 11 dropped; 12 still open (which
  product numbers count as proof).

---

## 13. Design numbers to use

Px values are CSS px at a 1440×900 viewport unless marked "phone" (390×844). [M] numbers come from the
JSON named in the header. [S] numbers come from the frames, ×1.2 (see the header). Em values are
computed from the measured px [I-calc].

### 13.1 Project presentation: Dia

**Page and grid**
- Root font 10 px [M]; grid 12 × 100 px columns [M] (gap 20 px [M] → 1420 px span [I-calc]); outer
  container 1440 px [M]; text container 760 px [M]; step description max-width 286.72 px, three
  instances = the three steps [M + I].
- Page length 7.0 screens desktop, 7.8 phone [M]; 10 sections [M]; first screen 20 words desktop,
  22 phone [M].
- Section gaps desktop (Study 4) [M]: 631 (hero → download row), 101, 1521 (steps section → cards
  heading; the steps block is long), 161, 531, 531, 572, 220, 352. Phone: 552, 108, 334, 354, 354, 80,
  141, 322, 508, 509, 315, 333, 569, 170, 153.
- Vertical spacing tokens most used [M]: 30, 20, 10, 40, 8, 120 (×4), 100 (×3), 80, 70, 150 px.
  Horizontal [M]: 16, 5, 20, 30, 12, 24, 70 px.

**Type** (family, px / line-height / tracking) [M]
- H1 promise: Exposure 500, 38.8 / 1.1 / -1.55 px (-0.04 em); phone 28 / 1.1 / -1.12 px.
- H2 section: Exposure 500, 48 / 1.17 / -2.4 px (-0.05 em); phone 32 / 1.19 / -1.6 px.
- H3 step title: Exposure 500, 24 / 1.25 / -0.72 px (-0.03 em); phone 24 / 1.25 / -0.96 px.
- Card body (feature text): ABC Oracle 350, 20 / 1.5 / -0.4 px; phone 16 / 1.5 / -0.32 px.
- Lead/long text: ABC Oracle 400, 22 / 1.36.
- Step description: ABC Oracle 400, 14 / 1.43 desktop; 16 / 1.5 phone.
- Fluid body rule: clamp(15px, .85rem + .8vw, 21px) = 20 px at 1440 [M + I-calc].
- Label pill in cards: ABC Oracle 400, 12 / 2.5 / +0.72 px (0.06 em), uppercase [M].
- Mono labels: ABC Favorit Mono 400, 13 / 1.23–1.31 / +1.3 px (0.1 em), uppercase [M]; step numbers
  "01–03" Favorit Mono 11 / 1.27 [M].
- Largest text 48 px; a ~200 px "DIA" wordmark in the hero is an image, not text [S, digest].

**Step layout ("Dia reads between the tabs")** [S unless marked]
- Heading centred, 48 px; about 70–100 px from heading to the first step and to the top of the visual.
- Left column: starts at ~54 px from the viewport edge; step text block ~287 px wide [M]; vertical
  pitch ~162 px from step 01 to 02 when 01 is open (title + 4-line description), ~92 px between closed
  steps.
- Active step: full ink, a 2 px dark vertical rule at its left, spanning the step block; inactive
  steps: title only, pale (text colours .424–.45 exist in the CSS [M]); the visual on the right changes
  per step.
- Right visual: a real browser window ~756 px wide (≈ x 576–1332), radius ~12 px, light frame, soft
  drop shadow (`--filter-shadow: drop-shadow(0 1px 2px rgba(0,0,0,.05)) drop-shadow(0 12px 30px
  rgba(0,0,0,.08))` [M]).
- Phone: the steps stack: label 12 px "01", title 24 px, body 16 px, ~354 px between steps [M Study 4].

**Card layout ("Built for how you actually work")** [S unless marked]
- Six cards in three rows of two [M Study 4]; widths unequal in the first row: ~700 px (left) + ~460 px
  with a ~20 px gap [S; gap 20 px M]; whether later rows swap the wide side was not seen.
- Radius 20 px (57 uses) [M]; 1 px hairline border (`--stroke-medium` .12 alpha in the light set [M]).
- Inside: ~32 px padding; a small uppercase label pill (12 px, +0.06 em) at top; 20 / 1.5 text; a
  product-window crop bleeding out of the bottom edge.
- Row pitch ≈ 651 px (120 px text block + 531 px gap/visual) [M Study 4].

**Colour ladders** [M] (CSS variables)
- Light context: primary rgba(0,0,0,.85); secondary .60; tertiary .45; quaternary .20; text measured at
  .85 (1045 uses), .70 (932), .60 (739), .424 (147). Fills: primary .90, secondary .08, hover .12,
  tertiary .04. Strokes: light .06, medium .12.
- Dark context (the same token names, white): primary #FFFFFF; secondary rgba(255,255,255,.80);
  tertiary .60; quaternary .40; fill-secondary .20, hover .25, fill-tertiary .10; stroke-light .10,
  stroke-medium .20; primary-50 .50, primary-10 .10. → the ready-made dark ladder for Graphite [I].
- Ground #FBFAF6; accent yellow rgb(255,203,48) and rgb(255,228,140); --soft rgba(60,60,67,.78).
- Gradients as named pairs at 180° with the switch at 60 % (e.g. `#FFF1AC 60% → #FF6F3C`) [M] → a model
  for aura gradients per project [I].

**Motion** [M]
- Most transitions: color/background/border 200 ms cubic-bezier(.4,0,.2,1) (118 uses); "all" 300 ms
  (.4,0,.2,1); opacity 200 ms (.4,0,.2,1); box-shadow 300 ms; one opacity 1 s cubic-bezier(0,0,.2,1);
  transform + shadow 220 ms cubic-bezier(.22,1,.36,1); transform 200 ms (.215,.61,.355,1).
- Durations used: .15 (16), .2 (8), .25 (6), .4 (3), 1 s (2), and single uses of .85, .9, 1.1, 1.2,
  1.25 s.
- Curves: (.4,0,.2,1) main; (.77,0,.175,1) ×6 and (.87,0,.13,1) ×3 for edge/sweep effects;
  (.22,1,.36,1) ×4 decelerating.
- Keyframes: `pulse` from opacity 0, scale .5, blur 2px to 1/1/0; `chroma-sweep` background-position
  100%→0 with blur 1px→0; `page-enter` opacity 0→1. No load animation. Reduced-motion rules: 5.
- Chrome: header/pill backdrop blur 12 px; sticky download button 443 × 56 px pill, bottom centre.

### 13.2 Project presentation: Notion Calendar

**Page and grid**
- Root 16 px [M]; content column x 208–1198 = 990 px at 1440 [M Study 4] (frames: feature card ~1022 px
  wide [S]); layout grid "7 cols: 64 px gutter · 1252 px content · 64 px gutter" [M]; card text
  max-width 512 px (18 uses) [M]; other containers 800, 750 px [M].
- Page 9.4 screens desktop, 12.1 phone [M]; first screen 23 words (phone 15) [M].
- Section gaps desktop [M]: hero 206 (nav → hero), 116 (hero → CTA), 976 (CTA → first card: the hero
  video), then card-row gaps 626, 478, 794, 620, 658, 681, 437, 123, 281, 330, 208, 258. Phone: 629,
  288, 371, 371, 371, 671, 286, 306, 606, 293, 106, 107, 406, then ~110 between integration rows.
- Spacing tokens [M]: 24 px (65 uses), 5, 3, 10, 14.94, 8, 4, 16, 64 px vertical; 32 px (40 uses),
  8, 16, 14 px horizontal. Gaps: "0 8px" (23), 30 px (20), 24 px [M].

**Type** [M]
- H1: NotionInter 700, 64 / 1.0 / -2.125 px (-0.033 em); phone 42 / 1.14 / -1.5 px.
- Theme heading (H2, the outcome line): 700, 42 / 1.14 / -1.5 px (-0.036 em); phone 32 / 1.25 /
  -0.75 px.
- Lead: 500, 22 / 1.27 / -0.25 px; phone 18 / 1.56.
- Card title (the feature): 700, 18 / 1.56 / -0.125 px (same on phone).
- Body: 400, 16 / 1.5 (2154 characters at this size: the reading size) [M].
- Small: 500/400, 14 / 1.43; micro label 500, 12 / 1.33 / +0.125 px.
- Quote: Lyon Text 400, 16 / 1.5 (one serif voice for one quotation).
- Fluid: clamp(24px, 7vw, 28px), clamp(64px, 18vw, 72px), clamp(100px, 8.54vw + 57.3px, 141px) [M].

**Two-level layout** [S unless marked]
- Theme heading (outcome) centred or left on the column, then one full-width feature card, then 2-up
  cards; then the next theme.
- Full-width feature card: ~1022 px wide; ground one step off the page (#f6f5f4 on #fff [M]); radius
  12 px [M]; padding ~32 px [S; spacingX 32 px M]; icon ~20 px in one blue; title 18/700; one-line body
  16/1.5; then a real screen fragment ~965 px wide that bleeds off the card's left and bottom edges.
- 2-up cards: each ~500 px wide [S] (text ≤ 512 px [M]), gap ~24 px [S, M], height ~532 px [S]; same
  inner structure; the screen fragment sits in the lower half and is cropped by the card.
- Radii in use [M]: 12 px (42), 8 px (31), 6.5 px tiles (17), 4 px (5); tatami scale 4/5/6/8/10/12/14/16 px.
- Shadows [M]: `0 4px 18px rgba(0,0,0,.04), 0 2.025px 7.85px rgba(0,0,0,.027)`; a near-invisible
  layered shadow `0 .175px 1.04px .01, 0 .8px 2.9px .02 ...`.

**Colour** [M]
- Text rgba(0,0,0,.898) (2927 uses), .95 (441), .54 muted (88), rgb(25,25,24); link rgb(0,117,222).
- Grounds: #fff (13837), #f6f5f4 (4668), tinted tiles #f2f9ff, #fef3f1, #fff5e0 (65 each).
- Grey ramp: #f9f9f8, #f6f5f4, #dfdcd9, #a39e98, #78736f, #615d59, #494744, #31302e, #191918.
  → ladder for Graphite [I]: text 90 % / muted 54 %; two ground steps a few % apart; pastel tints at
  ~3–5 % for the per-project aura on cards.

**Motion** [M]
- Durations: .2 s (31), 150 ms (25), .25 s (23), 250 ms (22), .15 s (18), .1 s (13), .4 s (7), 1 s (6),
  160 ms (4).
- Transitions: background-color 200 ms cubic-bezier(.42,0,1,1); text-decoration 200 ms; background +
  border 150 ms ease-in-out; opacity + transform 250 ms linear (17 uses; scroll-driven) [M + I].
- Keyframes: fadeIn; scaleIn .975 → 1; popIn opacity 0, scale .75 → 1; slideDown -10 px → 0; annotation
  enter translateY(spacing-4) → 0; pulse .9 → 1 with a 16 px ring.
- 14 scroll-timeline uses; 39 container queries; 20 reduced-motion rules; breakpoints 600 / 840 /
  1080 / 1280 / 1440 [M].

### 13.3 The brief: Anthony Fu

- Column 656 px, centred (x 392–1048 at 1440) [M]; `--prose-max-width: 65ch` [M]; doc 1230 px =
  1.4 screens desktop, 2.0 phone [M].
- Vertical positions [M]: nav y 33; name y 130; role line y 202; affiliation and proof rows y 250;
  contact y 253 (desktop, first screen); sections: 4, gaps 73 / 65 / 65 px; median block gap 20 px.
- First screen 160 words desktop, 106 phone [M].
- Type [M]: name Inter 800, 36 / 1.11 (same on phone); body Inter 400, 16 / 1.75; nav 16 / 1.5; chips
  Roboto Condensed 400, 16 / 1.0; mono DM Mono 16 / 1.75; small 14 / 1.43; a serif italic title
  ui-serif 16.8 / 1.75 for one podcast name.
- Rows [S + M]: "Working at / Creator of / Core team of / Maintaining" + chips with a logo; chip radius
  4 px (17 uses) [M], horizontal padding ~6 px (28 uses) [M], gap 4 px (14 uses) [M]; four rows ≈ 25 px
  pitch [S]; a faint chip ground [S].
- Colour (dark theme variables) [M]: --c-bg #050505; --fg #bbb (body); --fg-deep #ddd (links, emphasis);
  --fg-light #888 (muted); --fg-deeper #000 (light theme only). Scrollbar #111 / #222.
- Motion [M]: `slide-enter` opacity 0 + translate 0 10px → 1 / 0, 1000 ms, linear; `--enter-step: 90ms`;
  measured delays 90, 180 … 1260 ms (15 items) → the last line is still for ~2.3 s after first paint
  [I-calc]; edge art `grow` stroke-dasharray 0 → 350 over 10 s, infinite; edge art below 10 % contrast
  [M Study 1]; UI 150–200 ms cubic-bezier(.4,0,.2,1); view-transition rules 6; reduced-motion rules 3.
- Use [I]: keep the column (≤ 65 ch), the 36 px name (E4 allows up to 48 px), the 90 ms stagger with a
  10 px rise; slow it to 1.2–1.6 s per line if N9 asks, but keep the text readable from the first frame.

### 13.4 Work frames: Robin Noguier

- Carousel: one screen; scroll turns the carousel, not the page [M: docScreens 1]; ground black under a
  per-project colour (#3d6681 for "Fun") [M].
- Left text block [S + M]: left margin 90 px (spacingX 90 px, 8 uses) [M]; title "Fun" at y ~250–370;
  text container 580 px [M]; name eksell 135 / 1.0 (phone 58.5 / 1.1) [M]; description silka 20 / 1.6
  (phone 16 / 1.6), colour rgb(213,222,221) [M]; CTA "OPEN CASE STUDY" 16 / 1.5, 700, uppercase, +2 px
  (0.125 em) [M]; small labels 14 / 1.5, 700, +2 px; header labels top-left/top-right at y ~44 [S].
- Frame [S]: a WebGL image plane ~590 × 450 px at x ~690–1280, curved like a page bending away, top
  edge tilted; the next project's frame peeks below it (y ≥ ~690); a dot index of 8–9 dots at x ~1344,
  y ~310–590, active dot elongated; a small thumbnail preview 240 × 140 px bottom-left (x 90).
- Open transition [M]: same document, settle 1.38 s, 426 frames recorded; Back 1.63 s.
- Open choreography [S, frames]: (1) the ground is wiped from the left by the project page's light grey
  as a hard vertical edge; (2) the title stays near its place and turns dark, then moves to the left-centre
  (x ~90, y ~400); (3) the curved plane flattens and slides to the hero slot: ~660 × 410 px, right of
  the title, vertically centred; (4) the header changes to "← BACK HOME"; (5) a round scroll cue appears
  below; no blank frame. Back: a horizontal curtain; the carousel reopens on the same project.
- CSS motion is tiny (.1 s and .2 s only; the rest is JS/WebGL) [M]; radius 4 px [M]; no reduced-motion
  rules [M].

### 13.5 Work frames: Antoine Wodniack

- Page 24.4 screens desktop, 22.8 phone [M]; ground #f40c3f (86208 samples) over #160000 (3098) [M];
  Work section: a wall of tracked display letters (W, O, R, K rows) in red on #160000, with floating
  live project screens in front of and behind the letters [S].
- Floating frame [S]: ~620 × 349 px (16:9) at the centre (x ~534–1154); a second frame cut by the left
  edge; frames and letters overlap at different depths (2.5D); under each frame a caption row:
  project name left, an index code right, mono uppercase in the accent [S]; type for these captions:
  Fraktion Mono 700, 11 / 1.0 / +1.65 px (0.15 em), 68 instances [M].
- Type [M]: display Bigger Display 700, 138 / 0.82 / -0.4 px uppercase (phone 56–64); hero letters
  216 px tracked; thin serif Editorial New 200 at 36 / 1.13, 32 / 1.5 (intro), 20 / 2.4 (small lines),
  phone 24 / 1.5; labels Fraktion Mono 700, 12 / 2.0 / +1.2 px (0.1 em); 14 / 1.0 / +0.7 px.
- 3D variables [M]: --rx, --ry, --rz, --z (-1000vw), --depth 1rem, --s, --progress, --strip-gap 25 px,
  --strip-width 1px, --amplitude 75 %, --size 64rem → frames rotate and move in depth with scroll
  progress [I].
- Motion [M]: translate + scale 1 s cubic-bezier(.23,1,.32,1) (10 uses); clip-path 0.8 s
  cubic-bezier(.86,0,.07,1) (10) and 0.6 s; scale 0.6 / 0.8 s cubic-bezier(.55,.055,.675,.19) (ease-in,
  for exits); scale 1 s and 1.2 s (.23,1,.32,1); scale 0.5 s (.215,.61,.355,1); hover scale + opacity
  0.2 s; durations also 1.8 s, 2 s, 10 s (rotate loop); hero `s-hero-move-to-right` 1000 ms at load;
  `vanish` mask-position sweep; CTA characters roll up/down with (.215,.61,.355,1) then
  (.645,.045,.355,1). Lenis smooth scroll; no reduced-motion rules (a gap we must not copy).

### 13.6 Rhythm, grounds and motion: Shopify Editions

**Rhythm** [M unless marked]
- 60.1 screens desktop, 65.6 phone; 12 chapters ≈ 5 screens each on average [I-calc]; measured chapter
  starts (desktop scroll stops): Sidekick y 675, Agentic 9450, Online 12150, Retail 18225 → chapters
  run 2700–8775 px (4–13 screens).
- Three beats per chapter [S]: (1) a full-bleed painting with one word at 194 px (phone 72 px), left
  edge on the text column (~288 px), lower third; sparkles and a starfield over the painting; (2) a
  torn-paper edge into a cream page; serif heading 44 px with a script initial (Imperial Script) ~110 px;
  bold sans label 14 px; serif body 28 px in a ~560 px column; one small "Read help doc" chip; (3) real
  product cards fanning in with a spring, tilted a few degrees, mixed with floating 3D objects
  (skateboard, wheel) and small UI chips with real numbers.
- Sub-feature headings every ~675–2025 px (1–3 screens) [M stops].
- Persistent layers: the site title "The Renaissance Edition" (32 px) and the H1 "Shopify Editions
  Winter '26" (14 px) are present at every stop [M] → a fixed top-left mark; fixed index bottom-left
  [S]: 12 items, Roman numerals I–XII right-aligned, item text NeueMontreal 700 ~18 / 0.95 [M], pitch
  ~17 px [S], active item full ink with a dotted leader to its numeral, the others ~40 % [S].

**Grid and spacing** [M]
- 12 columns × 80.4 px with 14.4 px gaps (= 1123 px [I-calc]); 5-column sub-grids × 80.4 px (130 uses);
  14-column subgrid (12); containers 100 %, 75 %, 80 %, 66.666 %, 1680, 1100, 640 px.
- Gaps: "10px 14.4px" (137), 5 px (75), "64px 14.4px" (25). Vertical spacing: 10, 8, 3, 15 px small;
  40 (29), 60 (27), 80 (13), 99 (8), 130 (8), 100 (5) px between blocks.
- Radii: 3 px (118), 2 px (59), 12 px (14), 8 px (13) → nearly sharp cards; backdrop blur 8 px; 4 fixed
  and 4 sticky elements.

**Fluid type** [M; values at 1440 computed I-calc]
- Chapter word: clamp(7.5rem, 35.79px + 10.96vw, 13.75rem) → 193.7 px at 1440 (NeueMontreal 700,
  lh 0.9, -0.03 em); phone 72 px (lh 0.9, -2.16 px).
- clamp(4.375rem, 48.1px + 2.85vw, 6rem) → 89.2 px; clamp(3.375rem, 45.58px + 1.1vw, 4rem) → 61.4 px
  ("Introducing Tinker", lh 0.9, -0.02 em; phone 54 px); clamp(2rem, 18.53px + 1.75vw, 3rem) → 43.8 px
  (serif section heading HW Cigars 400, lh 0.96, -0.05 em; phone 28 px); drop cap clamp(6rem, 75.79px +
  2.63vw, 7.5rem) → 113.7 px.
- Serif body 27.9 / 0.97 / -0.05 em and 20 / 0.97 / -0.04 em (phone 24 and 20); sans titles 32 / 0.95 /
  -0.03 em; labels 18 and 14 px NeueMontreal 700; UI Inter 13–14 px; legal 10–11 px.

**Grounds and colour** [M]
- Ground samples: black 77946, cream #f7f7ee 22229, #dcdcd0 5174 → black ≈ 74 % of the page area
  [I-calc]; text on cream: #909083 (14484), #5c5c4e (5568), #292919 (2474); on black: #f7f7ee.
- For Graphite [I]: keep the black-dominant ratio; replace the cream pages with lit "paper" surfaces
  (#14–#1c range plus aura) so the page never turns white (N15); olive-grey text tones on a warm
  near-black are the closest translation of #909083/#5c5c4e.

**Motion** [M]
- UI: color/background/border 150 ms cubic-bezier(.4,0,.2,1) (189 uses); opacity 300 ms (.4,0,.2,1)
  (147).
- Springs: transform 400 ms and 500 ms cubic-bezier(.34,1.56,.64,1) (20 each; the card fan-in, fired
  at load as paired 400/500 transitions); opacity + scale 300 ms spring; grid-template-rows + opacity
  300 ms spring (accordions).
- Line drawing: stroke-dashoffset 3 s cubic-bezier(.34,.22,.47,.84) (39 uses); `line-fade` stroke
  alpha .75 → .15.
- Keyframes: `timeline-start` opacity 0, translate 0 75cqw, rotateX -90°, scale 1.5 → identity (a card
  flipping up into place); `nav-item-in`; `media-entrance` fade; `stagger-fade-in`; `orbit-path`
  (orbiting dots with z-index swap at 58 % and 92 %); `emoji-rise` -200 px with fade.
- Durations also .6, .7, .75 s, 1, 2, 3, 5 s; Lenis smooth scroll; view-transition names `navigation`,
  `video-modal-background`, `video-container`, `video-close-button` (the video opens as a shared
  element); 9 reduced-motion rules; forced-colors rules; 12 videos; 2 WebGL canvases.

### 13.7 Cross-reference: phone vs desktop ratios [M]
- Largest heading phone/desktop: Shopify 72/194 = 0.37; Robin 58.5/135 = 0.43; Antoine 56–64/138 =
  0.41–0.46; Notion 42/64 = 0.66; Dia 28/38.8 = 0.72 (H1), 32/48 = 0.67 (H2). → display type drops to
  ~0.4 on phones, text headings to ~0.67; body stays 16 px on phones everywhere [M digest §3.1].

### 13.8 Synthesis for the new two-page direction [I, ours; numbers from above]
- Brief (N4): one centred 640–680 px column; name 36–48 px; body 16–17 / 1.6–1.75, ≤ 65 ch; four
  structural rows with chips (radius 4–6 px); 20–40 words before the first Work frame peeks in; lines
  stagger 90 ms apart with a 10 px rise.
- Work frames (N5): frames ~590–660 px wide on desktop (Robin's carousel and hero, Antoine's 620 px),
  stacked or overlapping at 2–3 depths, a 1–3° rotation at rest at most; one-word project name 80–135 px
  (E4 provisional 80 px cap for "other pages"); mono caption 11–12 px, +0.1–0.15 em, under each frame;
  open in place in 1.2–1.6 s (Robin 1.38 / 1.63 s), ground wipe in the project's aura hue, title stays,
  frame flattens into the hero slot, Back reverses to the same frame.
- Opened project (N6): Notion's 990–1020 px centred column of cards (radius 12 px, padding 32 px,
  2-up 500 px + 24 px gap) carrying Dia's 01–03 stepper (step text ~287 px, visual ~756 px, active
  rule 2 px, inactive at ~45 %); outcome heading 42 px / feature title 18–24 px / body 16–20 / 1.5;
  label mono 12–13 px +0.1 em.
- Grounds and ink (N15): near-black ground with aura and grain; text white at 92 / 70 / 50 % (report 01)
  or Dia's dark set 100 / 80 / 60 / 40 % — pick one ladder; fills 10 / 20 %; strokes 10 / 20 %; one
  project hue at a time.
- Motion (N9, N10): UI 150–300 ms on cubic-bezier(.4,0,.2,1); entrances 0.8–1.2 s on (.23,1,.32,1) or
  (.22,1,.36,1); card springs 400–500 ms on (.34,1.56,.64,1); mask reveals 0.6–0.8 s on (.86,0,.07,1);
  line drawing 3 s; every entrance finishes; reduced motion gives the still page.
