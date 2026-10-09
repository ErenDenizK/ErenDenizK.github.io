# Family vision: Kept light

**Status:** proposal, 2026-10-09, not binding until the owner accepts (then an ADR records it) ·
**Rests on:** brief §7 (2026-10-09, *Family vision*, *Page character*, *Liveliness*);
`research/2026-10-product-family.md` (cases, strategies A–I), `research/2026-10-family-audit.md`
(DNA, rhymes C1–C10 clashes, untouchables), `research/2026-10-page-worlds.md` (concept D,
"embassies"; the lightness window and the single rig), `research/2026-10-readability.md`,
`research/2026-10-craft-audit.md` §4–5, ADR-0003, 0005, 0006, 0007 · **Not yet read:**
`research/2026-10-liveliness.md` (in progress); §3.5 below names what it may change.

The owner, in their words: instead of trapping every product in one design and breaking its variety,
each keeps its own UI, motion, colour, structure and details, and they meet at a shared place.
*"They all come from the same place, but each is original and different in its own way."* They worked
hard on Recto's and English Prep's UIs, Recto above all. This document never asks them to change
to match anything; the portfolio adapts first, and the apps only ever opt in.

![The board: the constants above, the four products side by side](../research/assets/2026-10-family-vision-board.webp)

---

## 1. Thesis

Eren's products already share a hand they were never told to share: each sits on a dark ground of
its own temperature, lets its one colour arrive as **light** rather than paint, and makes the same
quiet promise that what is yours stays with you (*Nothing leaves this device. · İlerlemen kendi
tarayıcında. · Nothing is public.*). The family is that hand made explicit, not a kit laid over
four products. We share **few, bold, visible constants** (a dark ground with its own warmth, one
light per product, one accent with one job, and the maker's dot) and **a method you feel rather
than see** (one spring grammar played at each product's tempo, one voice, one quality charter);
everything else (hue, material, type, structure, signature interaction, language) stays each
product's own and is listed as untouchable. The portfolio is the **house** where they meet; each
project view is that product's **embassy**, where its own ground, light and real captures take
over inside a frame the house keeps.

**The name: Kept light.** Two true things about this maker in two words. *Light*: in all four
products colour enters as light on a dark ground, never as wallpaper. *Kept*: every product keeps
what belongs to the user (local files, progress in the browser, a private circle), and the maker
keeps their promises with proof (Recto's "proof before promise", English Prep's solved contrast,
the Record's real dates). It also describes the portfolio itself: a dark house where each
product's light is kept. Used internally and, if the owner likes it, once in a credits line;
never as a logo.

---

## 2. Constants and variables

### 2.1 The rule of few

The research is blunt (MIT Media Lab 2011, Adobe 2020, Google Workspace 2020, Vox): many subtle
constants read as sameness, and variety the eye cannot read is not variety. So: **three constants
you see, three you feel, and nothing else shared.** Test for every proposed constant: a stranger
shown a 64 px greyscale thumbnail of any screen must still name the product (variety is readable);
shown four screens side by side, they should guess "same maker" (the origin is readable).

**Seen (V1–V3), felt (F1–F3):**

| # | Constant | The rule | Why this one |
|---|---|---|---|
| V1 | **Dark ground, own temperature; colour arrives as light** | Ground is near-black (OKLCH L ≤ 0.20) and tinted toward the product's own hue, never pure `#000`, never a mid-tone. Each product has exactly **one light field** (aurora, glow, pool) in its own pigments, behind content, never on it; it has a still twin and pauses when hidden. Large surfaces are never painted in the accent. | True in all four today (audit §3.1); the owner named it first (brief §5). |
| V2 | **One accent, one job** | Each product has one accent and gives it one job, stated in a sentence. Other colours may exist (English Prep's iris, lagoon, apricot) but have named roles below the accent. | Already true (audit §3.2); keeps colour meaningful. |
| V3 | **The maker's dot** | A lowercase name may end in a period set in the product's colour (`edk.`, `ep.`). In the house, the dot of `edk.` takes the light of the room you are in. The endorsement anywhere outside the house is `edk.` with its dot in the host's colour, at entry and exit points only (About, credits, press kit), never inside working UI. | The owner liked it twice (E's dot, `ep.`); one typographic gesture, cheap, unmistakable. |
| F1 | **One spring grammar, own tempo** | Four named springs: **press, settle, glide, pop**, all from one spring function (mass 1, stiffness k, damping c), exported as `linear()`. Each product sets its own k and c and decides whether it uses pop at all. Rest is still; motion answers an action or a change of place; ambient light is the only thing allowed to drift, ≥ 9 s cycles, paused when hidden. | Recto and English Prep already derive springs (research §6); Mastercard's one melody in many arrangements. |
| F2 | **One voice, one promise line** | Plain, specific, first person or direct address, no hype, sentence case. Each product carries **one promise line** about what stays with the user, written in its own language and register, never translated from another. | Shared value in all three products (audit §3.6); survives every redesign. |
| F3 | **One quality charter** | §2.4. Already practised in all three repos; written once. | The origin people trust (Rams, Ghibli, Supergiant). |

Rejected as constants (and why): **glass** (English Prep removed it by decision, C6), **one
typeface** (Recto's Inter Recto and the portfolio's Newsreader are character, C1), **one motion
curve or duration** (C7), **one icon style**, **one navigation pattern** (all are capsules today
by coincidence; nothing requires it), **grain** (Recto bans it, C5).

### 2.2 The four products across the constants

Concrete values where they exist; *(est.)* for Eat Map until read from Xcode.

| | Recto | English Prep | Eat Map *(est.)* | Portfolio (the house) |
|---|---|---|---|---|
| **V1 ground** | cool graphite `#08090c` (hue 265) | plum `#141216` | wine `#4a1626` → near-black, rose glow | neutral `#0a0a0b`, room temperatures within L 0.13–0.165 (page worlds §4) |
| **V1 light** | lime aurora teal `#1f9996` → mint `#58da98` → lime `#bbed26` → lemon `#faee40`; still at rest, moves on events, settles ≤ 5 s, never within 64 px of a page | three clusters cherry `#a04278`, iris `#6350a5`, lagoon `#28798a`; 9.75/11.75/13.75 s drift; one parent cap .42 dark | rose glow `#ec5794` lower right, static | one pool per room in its colour (edk `#c9d4ff`, Record `#8fb8ff`, About `#f3b886`, project colours on Work) |
| **V2 accent → job** | lime `#c8fb3d` → "the armed tool and the one primary action"; always touches ink `#08090c`; never on the page | Sakura pair `#ed96b4` → `#dca2d8` → "the one primary action, and *correct*" (with check mark and the word *Doğru*) | rose `#eb4f6b` → "where you are and what you add" (selected tab, compose) | off-white pill `#e9e5de` → "the next step"; each world's colour is light, not a button, except inside an embassy |
| **V3 dot** | none in the product; the R is Recto's sign (brand rules forbid effects) | `ep.` Sakura dot `#efb1cb` (exists) | owner to name the mark | `edk.` dot takes the current room's light |
| **F1 press** | 300 ms, ζ 1, scale .97 mouse / .94 touch | 120 ms inner compression | system highlight | k 600 c 49 (ζ 1.0), scale .98 |
| **F1 settle** | smooth 530 ms, zero bounce | 380 ms continuous release | system `.smooth` | ui k 300 c 30 (ζ .87, ≈ 450 ms) |
| **F1 glide** | glide 680 ms; View Transitions 240 ms | route 360 ms over 12 px; scene 560 ms | push navigation | k 170 c 26 (ζ 1.0): sheet, room change |
| **F1 pop** | pop 410 ms (b .25), success only | answer pop and shake | system `.bouncy` on compose | object k 180 c 16 (ζ .60), objects only |
| **F2 promise** | "Nothing leaves this device." | "Ücretsiz. Hesapsız. İlerlemen kendi tarayıcında." | "Only the people here see your log … Nothing is public." | proposed: "Everything here is real: real dates, real screens." |
| **F2 register** | English + Turkish *siz*, terse | Turkish *sen*, warm, "refine, not teach" | English, private, plain | English, first person |

### 2.3 What each product keeps as untouchable

This list outranks everything else in this document. If a family idea touches a row here, the
idea loses.

| Product | Untouchable (never changed for the family) |
|---|---|
| **Recto** | One lime `#c8fb3d`, touching ink, one fill per view, never on the page · the white page as the brightest thing · the morphing glass capsule (dock ⇄ palette ⇄ pages ⇄ compare ⇄ locked) · glass M1–M5 and its rules · the lime aurora, still at rest · zero-bounce springs, idle frames = 0 · the "Dengeli" R and its mint `#69EAA3` → lime `#CBFF5F` → yellow-lime `#EDFA6D` gradient at 46.75°, and the brand doc's usage rules · Inter Recto, sentence case, Phosphor outline → fill · no grain, no noise, no raster texture (Q-1) · A-1…A-24 |
| **English Prep** | Plum ground and Sakura / periwinkle answer semantics with words and marks · the living three-cluster aurora under one parent cap · no glass, opaque cards · Inter reading 18/30 in a ~600 px column · `ep.` with the Sakura dot · the 120 ms press and 380 ms release · v0.72 route choreography (ADR 013) · the folio About · the rail · Turkish *sen* voice · settled navigation (two peers in the capsule, Profil in the header) · no build step, no `innerHTML` |
| **Eat Map** | Native SwiftUI and iOS conventions · Liquid Glass capsule tab bar with the avatar pill and the round compose button · rose `#eb4f6b` on wine · the "Circle" privacy voice |
| **Portfolio** | Black ground · Newsreader for the name and titles (pairing 2) · per-world colours accepted 2026-10-09 · pre-rendered Cycles objects (ADR-0006), one rig, one droplet · every tab a page (ADR-0007) |

### 2.4 The quality charter (F3)

One page, linked from the house's footer ("How these are made") and, if the owner agrees, from
each app's About. Every rule is already practised somewhere in the family:

1. **Every effect has a still twin**: reduced motion, no WebGL, Low Power Mode and phones get a
   complete product.
2. **Contrast is solved, not chosen**: WCAG 2 enforced, APCA supplementary, measured through the
   real material (glass, aurora envelope) in CI.
3. **Real, never mock**: product images are real captures of the shipping build; no fake device
   bezels, no stock, no invented metrics.
4. **No characters as icons**: no emoji or Unicode arrows; icons are drawn to a contract.
5. **Rest is still**: no idle loops on controls; ambient light alone may drift, and pauses when
   hidden.
6. **Decisions are written**: ADRs and specs, cited in code comments.
7. **Seen before shipped**: screenshots at 1440×900, 1180×820 touch and 390×844 for every UI change.
8. **The promise is proven**: every privacy line links to its evidence.

---

## 3. How the portfolio expresses the family

### 3.1 The house and its embassies

The house (Home, Work, Record, About) speaks the portfolio's own language: neutral black, warm
ink, Newsreader titles, glass objects, the droplet. Rooms vary within the page-worlds variance
budget. **Only the project view hands over.** It becomes the product's embassy in three bands:

1. **The porch (house ground).** Object poster and clip, product name in Newsreader, one-line
   promise, facts (status, platform, started, last moved) in Inter meta, the primary button. The
   object stays on the house ground because its frames are ground-subtracted for `#0a0a0b`
   (page worlds §3); no re-render is needed.
2. **The threshold (≈ 160 px).** The ground crossfades from the house to the product's own ground
   token as you scroll (a static gradient, not a scroll animation; Alexander's entrance
   transition). The product's light field appears here: Recto's still mint-lime aurora, English
   Prep's three pools (static in the embassy, its own reduced-motion twin), Eat Map's rose glow.
3. **The embassy (product ground).** Real captures, one signature-interaction clip, the case study
   (what, why, how, learned, next) and the project's Record thread. Ink and accent switch to the
   product's tokens, **copied from the product's own token file, never redrawn** (a generated
   `content/projects/<slug>/tokens.json` checked against the source repo in CI where reachable).

What the house keeps around every embassy: the sheet frame and close control, the bar, Newsreader
for the product name and section heads, Inter for meta, the case-study order, the sheet's glide.
The visitor always knows they are on Eren's site looking into another house.

**Per embassy:**

| | Recto | English Prep | Eat Map |
|---|---|---|---|
| Ground → ink | `#08090c` → `#e8e9ec` | `#141216` → `#eee9ed` | wine → white *(est.)* |
| Light | mint → lime, still | cherry / iris / lagoon pools, still | rose glow |
| Primary button | "Open Recto" in `#c8fb3d` with `#08090c` label, radius 999 | "Open English Prep" in the Sakura pair with `#301b27` ink, radius 8 | "Coming to the App Store" or none; rose ring |
| Captures | Library, Markup with the capsule palette, Pages grid; 1440×900 and 1180×820 | Eğitim, an answered question, the folio; 1440×900 and 390×844 (mobile first) | the simulator screens at 3× phone, from Xcode, not a photo |
| Signature clip (≤ 8 s, poster first) | the capsule morphing dock → palette → pages | an answer: press, release, Sakura *Doğru* | the Liquid Glass tab moving to the avatar pill, then compose |
| Promise line shown as | the product's own English line | the product's own Turkish line, with an English gloss in meta | the product's own line |

### 3.2 Real captures are first-class content

Captures replace mock UI everywhere in project views (clash C8). Rules: shot from the shipping
build with a script kept in the product's repo (Recto and English Prep already shoot themselves);
2× wide and 3× phone WebP/AVIF; the product's own corner radius, no bezels, no tilt, no hover
lift; a 1 px `rgba(255,255,255,.06)` hairline; video as AV1 → HEVC → H.264 with a poster first,
as ADR-0006; reduced motion and Save-Data show the poster. A capture older than the product's last
release shows its date in meta, so the record stays honest.

### 3.3 The objects speak each product's language

The audit's verdict (C3, craft audit §5.2): the objects read as toy-like 3D emoji, painted in
saturated colour, using generic symbols (file, speech bubble, pin) that the products themselves
never use, and Recto's brand plan explicitly dropped the generic file icon. **The new brief keeps
ADR-0006 whole**: one rig (`tools/objects/rig.json`, warm key `#fff4e8` upper left front, rim in
the page colour from behind right), one shared droplet, the lean grid, one interaction clip, the
poster first. What changes is *what* is rendered and *how colour arrives*.

**Rules for every object:**

1. **Derived, not symbolic.** Each object is built from something the product actually owns: its
   mark, its signature component or its own interaction. Never a category icon.
2. **Colour as light, not paint.** Clear or lightly tinted glass and satin materials; the
   product's colour enters as internal light, caustics and the rim. No glossy painted bodies.
3. **The interaction clip plays at the product's tempo** (F1): Recto's clip never overshoots;
   English Prep's has the press-and-release feel; Eat Map's follows iOS springs; only edk uses the
   object spring's overshoot.
4. **Thumbnail test.** At 64 px, greyscale, each object is named correctly and no two share a
   silhouette.
5. **The mark's owner signs off.** Where an object is built from a mark the owner designed (the R),
   it is shown to them as a still before any overnight render.

**Object briefs:**

| Object | Form | Material and light | Interaction clip | Droplet |
|---|---|---|---|---|
| **edk** (Home) | The letters `edk.` in clear glass as now, plus the **dot as a small glass sphere** | Letters neutral clear glass, cool `#c9d4ff` rim. The dot is clear and highly refractive; it is rendered once clear and once per room light (six short dot-only passes composited on the letters), or lit by the CSS pool behind it, so the colour-changing dot of E becomes physical | the dot rolls a few millimetres and the letters lean after it (object spring, ζ .60, one overshoot) | the dot is the last thing to melt and the first to form |
| **Recto**, option R (needs the owner's OK as the mark's author) | The **"Dengeli" R** extruded from its two polygons (`recto-mark.svg`), about 12 % of its height deep, the diagonal notch kept as a true gap | Thick glass with the brand gradient as **internal light** graded along the mark's 46.75° axis, mint low-left to yellow-lime top-right; faces stay clear so the gradient reads as light inside glass; no outline, no bevel effects | the leg, cut by the notch, turns up and right like a page corner (the brand doc's own reading of the mark) and settles with zero bounce (Recto's glide, 680 ms) | the R loses its chamfer first |
| **Recto**, option P (respects the brand doc's "no effects on the mark") | **A white page resting on a glass capsule**: the capsule is the dock's shape (radius 999), the page is the brightest thing | Capsule in Recto's M2 glass; a lime under-light `#c8fb3d` beneath it, as the armed tool's under-light in the app; page matte white | the capsule morphs wider and the page lifts (the capsule morph, Recto's signature) | the capsule rounds into the droplet |
| **English Prep** | **The folio**: three thin leaves fanned slightly, as on its About (Oku · Uygula · Geri dön), with `ep.` embossed on the top leaf and its **dot as a Sakura glass bead** | Leaves in satin plum card (`#1d1a20` family; English Prep chose opaque, so no glass leaves), each leaf's edge lit by one of its pigments: cherry, iris, lagoon. The bead is the only glass: the family's dot | the leaves fan and close (stack 860 ms, angle 680 ms, its own folio values), the bead catches the light on release | the bead melts last |
| **Eat Map** (values to confirm in Xcode; if the app has an icon, derive from it instead) | **A round tile of smoked wine glass** engraved with a few street lines, one **rose bead** standing on it as the place, three small clear beads in a ring around it as the circle | Wine-tinted glass on the house ground (the object does not sit on the wine ground, page worlds §3); rose `#eb4f6b` as the bead's internal light and the tile's rim | the rose bead drops onto the tile and a ring of light passes through the three circle beads (iOS-like spring, slight settle) | the tile's rim closes into the droplet |
| **Record** (house, not a product) | Keep the microphone idea for now; same rules: clear glass, `#8fb8ff` as light and rim, not a painted blue body | | | |

Cost: one overnight render each; order Recto, English Prep, edk dot, Eat Map (Eat waits for real
values). Until a new object ships, the old one stays; nothing goes blank.

### 3.4 The portfolio's own changes

| Change | From → to | Why |
|---|---|---|
| **Grain** | full-page tile → **removed**. If a light pool bands on a measured screen, a 2 % blue-noise dither *inside that pool only*, invisible at 1× | Recto's Q-1 and the owner's "grainy" verdict (C5); the house must not carry the one texture a member rejected |
| **Motion** | `--d-1…5` + cubic eases → the four springs of §2.2 as `linear()`, durations derived. Crossfades for opacity stay eased ≤ 160 ms | F1; the portfolio is the one member without springs (research §6) |
| **Recto colour** | one `--recto` `#bbed26` for everything → `--recto-light` `#bbed26` (glow, spine mark) and `--recto-action` `#c8fb3d` with `#08090c` label (buttons) | C4: lime touches ink, as in Recto |
| **Ink temperature** | warm `#e9e5de` → keep in the house; embassies switch to the product's ink (owner question 4 offers a neutral nudge) | C2: a warm house is character; the clash only shows when a product sits inside it, which the embassy solves |
| **The dot** | static → takes the room's light on every page (G track), and the product's colour inside an embassy | V3 |
| **Credits** | none → footer line "Kept light · how these are made" linking the charter | F3 |
| **Objects** | painted symbols → §3.3 | C3 |

### 3.5 What the liveliness study may change

Brief §7 asks for life on desktop; the study is still running. This vision constrains it in only
three ways: liveliness answers the pointer and changes of place (F1 "rest is still" applies to UI,
not to an object responding to a hand); it never animates reading text (readability M1); and
whatever method wins (live, rendered, mixed) must keep each object's clip at its product's tempo.
If the study recommends live 3D for objects, §3.3's forms and materials carry over unchanged.

---

## 4. How the apps can show the origin later (opt-in, case by case, owner's OK each time)

Nothing in this section is scheduled. The brief says improving the in-product presentation is
"much later"; each move below is small, reversible and lives at an entry or exit point, never in
the working UI (HIG: "resist the temptation to display your logo throughout your app").

### 4.1 Shared patterns

- **The credits line.** One line at the foot of the product's About: "Made by `edk.`" (or
  "`edk.` tarafından yapıldı"), the dot in the product's accent, linking to the portfolio's
  project view. Product's own type; the house's serif never enters an app.
- **Presentation assets in one format.** Social card 1200×630 on the product's ground with its own
  mark left and `edk.` small bottom right; captures at the family sizes (§3.2); a press folder
  with the mark files, captures and the promise line.
- **The charter link.** "How this is made" in About points to the charter plus the product's own
  quality bar (Recto Q-1…Q-14, English Prep's `npm run color`).

### 4.2 Per app: the smallest, highest-value moves

| App | Moves, in order of value | Must never change |
|---|---|---|
| **Recto** | 1. About v2 (waiting on drop D4) ends with the credits line, lime dot. 2. Social card and press kit in the family format, made by the existing `tools/media` pipeline. 3. Its object (§3.3) offered as About hero art, only if the owner likes it. | Everything in §2.3's Recto row; the mark's usage rules; no dot added to the "recto" wordmark unless the owner, as its designer, wants one |
| **English Prep** | 1. The folio About gets the credits line, Sakura dot (`ep.` and `edk.` then rhyme on one screen). 2. Its captures (already real 3×/2× WebPs) shared with the portfolio's embassy from one source. 3. Charter link beside the existing "how it is built" disclosures. | Everything in §2.3's English Prep row; the CHANGELOG `x` stays 0; no new runtime dependency; `test` is live, so any move passes `npm run check` and `verify` first |
| **Eat Map** | 1. A "Made by edk." row in its settings/about, system type, rose dot. 2. App Store screenshots and app icon in the family format, when it goes public. | Everything in §2.3's Eat Map row; no web-style chrome in a native app |
| **Portfolio** | It is the house: all of §3. | §2.3's portfolio row |

---

## 5. Panel critique of this draft

Six lenses read the first draft. Each objection is the strongest one that lens raised; the answer
is what changed or why it stands.

**Art director.** *"'Dark ground plus coloured light' is what every dark-mode product on earth
does. It is not an origin; it is a genre. Your visible constants are too generic to be anyone's."*
Answer: true of V1 alone, which is why it is never alone. The origin is the combination: a ground
tinted to each product's own temperature (not neutral dark mode), light that is *still at rest*
and answers events, and the coloured dot. The **objects** carry the rest of the burden: one rig,
one droplet, colour as internal light, each derived from the product's own mark. That is
something only this maker has. Added the thumbnail test so "generic" is checked, not argued.

**Brand strategist.** *"The endorsement is too weak. If `edk.` only appears in About pages, no one
using Recto will ever know Eren made it; you've built a house of brands for someone whose whole
goal is to be seen."* Answer: the portfolio is where being seen happens; it is the link on
LinkedIn (brief §7). Inside a product, a visible maker's mark costs the product its own presence
(the HIG, Muji). The endorsed position is deliberate: products carry the credits line at exits,
the house carries the products at full volume. Owner question 2 offers a stronger option if they
want it.

**UX and retention.** *"The embassy makes the visitor cross four visual languages in one visit.
A recruiter opening two projects in a row sees two different sites and loses the thread. And a
sheet that changes ground halfway may feel like a bug."* Answer: only one embassy is ever on
screen; the porch and the frame (close control, bar, Newsreader title, case-study order) are
identical in all of them, so the thread is the frame. The threshold is a static gradient tied to
scroll position, never a timed animation, and it starts below the porch's facts, so the first
screen of every project view is the house. Retention comes from the captures: a visitor meets the
product the owner worked on, not a symbol (C8). Delight comes from the signature clip, which is
the product's own best moment.

**Motion designer.** *"Four named springs with per-product values is a naming convention, not a
grammar. Recto's press at 300 ms and English Prep's at 120 ms have nothing in common but a
word."* Answer: agreed that names alone are thin, so the grammar is three rules plus the names:
one spring function (no hand-drawn béziers for movement), rest is still (only ambient light may
drift, ≥ 9 s, paused when hidden), and every token has a reduced-motion twin. The tempos differ on
purpose; Mastercard's melody is recognisable in an opera and in EDM because the *intervals* hold,
here the *roles* hold (press answers the finger, settle ends every move, glide carries you between
places, pop is rare). The portfolio adopting springs is the only real change, and it is cheap.

**Accessibility and engineering.** *"Embassies import three palettes the house never tested;
copied tokens will drift from the source; per-room dot renders multiply the object budget; and
removing grain may bring back banding in the light pools."* Answer: embassy tokens are generated
from each product's own token file and checked against the source in CI where the repo is
reachable, and every embassy ink/ground pair goes through the house's contrast check (WCAG 2 ≥ 7:1
for prose, APCA supplementary). The dot passes are dot-only crops (a few hundred KB, desktop only;
phones get the poster with a CSS-lit dot). Banding is measured, not assumed: the dither is a
fallback inside a pool, never a page layer. Every embassy band has a still twin: the light is
static there even for English Prep.

**Product owner's ear (the owner's own words as a lens).** *"Will this flatten Recto?"* Answer:
§2.3 outranks the document, §4 is opt-in per move, and no constant requires Recto to change a
single token. The one place Recto's brand is touched (the R as an object) is offered as an option
with a safer twin and their sign-off first.

---

## 6. Decisions for the owner, and adoption

### 6.1 Questions (recommended option first)

1. **What should a stranger notice first as "the same maker"?**
   a. The objects: one glass language, each built from its product's own mark *(recommended)*.
   b. The light: the same still-at-rest coloured light on every product's dark ground.
   c. The dot: `edk.` and its coloured period, everywhere the maker appears.
2. **Where may `edk.` appear outside the portfolio?**
   a. Only at exits: a credits line in each app's About, press kits, social cards *(recommended)*.
   b. Nowhere in the apps; the portfolio alone shows the family.
   c. Also a small mark inside each app's main UI (not recommended: logo-slapping).
3. **Recto's object.**
   a. The "Dengeli" R in glass, its gradient as light inside, the leg turning like a page; you
      approve a still first *(recommended)*.
   b. A white page on a glass capsule with lime under-light (leaves your mark untouched).
   c. Keep a document object, re-made in clear glass with lime as light.
4. **The house's texture and ink.**
   a. Remove the grain; keep the warm ink in the house; embassies use each product's ink
      *(recommended)*.
   b. Remove the grain and nudge the ink to neutral (`#e7e5e1`) so products sit closer to it.
   c. Keep both as they are.
5. **How far does a project view hand over to the product?**
   a. Porch, threshold, embassy: the house's head, then the product's own ground, light,
      captures and clip *(recommended)*.
   b. The whole sheet in the product's world from the first pixel.
   c. The house's look throughout, with real captures only.

Also needed, not taste: Eat Map's real ground, light and accent values, its mark (if any) and
whether it has a light theme, read from the Xcode project.

### 6.2 Phased adoption

| Phase | What | Where | Gate |
|---|---|---|---|
| 0 | The owner answers §6.1; an ADR ("family: Kept light") records the constants, the untouchables and the charter | docs | owner |
| 1 | House changes that need no new media: grain removed, springs, `--recto-action`, the dot taking the room's light, charter page, credits line | portfolio | `npm run verify`, three screenshot sizes |
| 2 | Objects re-made one at a time (Recto, English Prep, edk dot, Eat Map), each shown as a still first, then rendered; old objects stay until replaced | `tools/objects`, `media/objects` | owner sees each still; thumbnail test; seam check |
| 3 | Embassies: token import, captures and one clip per product, porch/threshold/embassy; starts when project texts are written (brief §7) | portfolio project views | contrast per embassy; reduced motion; phone pass |
| 4 | Apps, opt-in, one move at a time from §4.2, each a separate yes from the owner and done in that app's repo under its own rules | Recto, English Prep, Eat Map | owner, per move |
| 5 | Yearly review of this document against the four-year arc (brief §2.3): a new product joins by filling one column of §2.2 and one row of §2.3 | docs | — |

---

## Türkçe özet (sahip için)

- **Tez:** Ürünlerin zaten ortak bir eli var: her biri kendi sıcaklığında koyu bir zeminde duruyor,
  rengini boya olarak değil ışık olarak getiriyor ve aynı sözü veriyor: senin olan sende kalır.
  Aile bu eli görünür kılmak; dört ürünün üstüne tek bir tasarım giydirmek değil.
- **Ortak kaynağın adı: "Kept light" (saklanan ışık).** Işık: her üründe renk karanlıkta ışık olarak
  geliyor. Saklanan: her ürün kullanıcının şeyini kendinde tutuyor ve verilen sözler kanıtla tutuluyor.
- **Görünen üç sabit:** kendi sıcaklığında koyu zemin ve tek bir ışık alanı; tek vurgu rengi, tek
  görev; `edk.` noktası (bulunduğun yerin rengini alır, `ep.` ile kafiyeli).
- **Hissedilen üç sabit:** aynı dört yay (press, settle, glide, pop) ama her ürün kendi temposunda;
  tek ses ve her ürünün kendi dilinde tek bir söz cümlesi; tek kalite tüzüğü.
- **Dokunulmazlar:** Recto'nun limonu, kapsülü, camı, R işareti ve sıfır sekmeli hareketi; English
  Prep'in mürdüm zemini, Sakura cevapları, yaşayan aurorası, camsızlığı ve *sen* sesi; Eat Map'in
  yerel iOS camı ve gülü. Bu liste belgedeki her şeyden önce gelir.
- **Portföy ev, proje görünümleri elçilik:** önce evin zemininde nesne ve bilgiler, sonra zemin
  ürünün kendi rengine geçer; orada gerçek ekran görüntüleri ve ürünün imza hareketinin kısa videosu.
- **Nesneler:** oyuncak gibi genel semboller yerine ürünün kendisinden türer: Recto için "Dengeli" R
  camda ve içinde gradyan ışığı (önce senin onayın), English Prep için üç yapraklı folio ve Sakura
  boncuk, Eat Map için şarap rengi cam harita ve gül boncuk. Aynı ışık düzeni, aynı damla.
- **Portföyde değişecekler:** gren kalkar (Recto'da yasak), hareket yaylara geçer, Recto düğmesi
  gerçek `#c8fb3d` olur, nokta her sayfanın ışığını alır.
- **Uygulamalar:** sonra, tek tek ve yalnızca senin onayınla: About sonunda "Made by edk." satırı,
  ortak biçimde tanıtım görselleri. Uygulamaların çalışan arayüzüne hiçbir işaret girmez.
- **Senin kararların:** ilk ne fark edilsin; `edk.` uygulamalarda nerede görünsün; Recto nesnesi;
  gren ve mürekkep; proje görünümü ürüne ne kadar devredilsin. Eat Map'in gerçek renk değerleri de
  Xcode'dan gerekiyor.
