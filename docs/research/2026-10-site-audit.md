# Site audit: erendenizk.github.io (dev @ 2ed9c0c), 2026-10-10

> **Status:** current (2026-10-10): the clean-restart audit of every page; drives docs/PLAN.md tracks 1-9. Scratchpad paths cited below are scratch, not kept.

Method: built `dev` in a throwaway worktree, served with `tests/serve.mjs`, drove Chromium 1194
(Playwright) at 1440×900 (fine pointer, classic scrollbars, `--hide-scrollbars` dropped),
1180×820 with touch, and 390×844 touch/mobile. Media measured offline with ffprobe/ffmpeg +
numpy. Scripts: `scratchpad/audit/tools/`. Shots: `scratchpad/audit/shots/` (`d-` desktop,
`t-` tablet, `p-` phone; `-full` = whole page at half scale; `-sheet` = project sheet open;
`-sheet-scrolled`).

Grades: **V** verified here (measured, reproduced or read in the shot), **C** verified by reading
code only, **S** suspected (needs a real device or the owner's eye).

Routes (from `src/pages`): `/`, `/about/`, `/work/`, `/work/recto/`, `/work/english-prep/`,
`/work/eat-map/`, `/record/` (no entries, so no `/record/<year>/<slug>/`), `/lab/postcard/`,
`/404`, plus `feed.xml`, `manifest.webmanifest`, `robots.txt`. Console: **no errors or warnings on any
route at any size (V)**. The only one is the expected 404 on the 404 page. No horizontal overflow
anywhere (V). Keyboard focus shows a solid 2 px ring on every stop on Home (V).

---

## 1. Pages

### Home `/` (`src/pages/index.astro`)
**Purpose:** in ten seconds, say who this is and what they build, and send the visitor into the work.
Per the owner (2026-10-10), Home should carry the **brand and identity and the vision**, keep its simple layout,
and not be outshone by About.
**Verdict: the layout is clean, but the first screen has nothing a visitor remembers.** It reads as a name, a bio
sentence and a logo. The owner is right that About wins: About has the face, a photo, a warm light and a toy, and
Home has text and a mark that the bar already shows (shots `d-home.webp`, `d-about.webp`).

Issues:
- **No vision line (V).** The lede (`site.json` `lede`, `index.astro:212`) is a bio ("I study… I'm drawn to the
  low level…"). That is the same material as About's ledes, so Home's message is About's, only weaker. Home needs one
  brand or vision statement written by the owner (the two-track thesis is the obvious candidate) instead of the
  bio. About can keep the bio. *(Owner text; do not invent it.)*
- **The edk glass letters repeat the bar mark (V).** `index.astro:219`. The hero object is a logo shown twice. If Home
  is the brand page, the object has to *mean* the brand. Today it is also the source of most of the "jerky" reports (§3).
- **Hierarchy is right, but it has no signature.** The 122 px name (`--t-name`, `global.css:53`) is good. Nothing on
  the screen is personal or alive at rest: the idle loop is a slow ±8° sway.
- **"The log" label (V).** `index.astro:276` says "The log", while the nav and the brief say "Record" (brief §7,
  2026-10-09: "the nav says Record, not Log").
- **Now/log row duplicates About's Now box and the Record empty state (V).** `index.astro:263-281`.
- **Phone (V, `p-home-full.webp`):** the object drops below the links at 210 px (`global.css:454`), with about 200 px of
  empty band around it. It reads like a stray logo between the hero and "Work". Either drop it on phones, or give it
  a reason to be there.
- **The Recto plate is the strongest block on the site (V).** Keep it.

### About `/about/` (`src/pages/about.astro`)
**Purpose (owner, 2026-10-10):** introduce the person directly, as a mini CV: the ID card, then written descriptions below.
**Verdict: the first screen is excellent, and that is why it upstages Home. Below the fold it stops being a CV and turns into a table plus a colophon.**

Issues:
- **The hero repeats itself (V).** Ledes (`site.json` `about.ledes`) and the facts table (`about.astro:326-330`)
  give the same five facts: school, year, prep AA, low level, Istanbul. A mini CV wants the card first,
  then *sections*: Education (YTÜ, prep AA), What I build (the three products, linked), How I work (the two tracks), By hand
  (CS50, camps: owner to confirm), Elsewhere. Each should be a short written paragraph, not a key/value grid.
- **The facts table is a 1320 px wide two-column grid with 13 px labels at the far left (V, `d-about-full.webp`).** The
  values start at x≈500, so the eye travels across empty space. As written CV rows, cap them at the reading measure.
- **"How this site is made" belongs to the Record or a footer, not to a CV (V).** `about.astro:348-357`.
- **Phone (V, `p-about-full.webp`):** the order is photo (64 svh), then the text, then the card, so the card, the "ID",
  arrives at screen two. For a mini CV the card should come first, or at least right after the name.
- **Card hint on phones (C):** `IdCard.astro:242-245` correctly shows "Tap to turn it over" when there is no `.fine`
  pointer (V on tablet: `t-about.webp`).
- Courtyard photo: see §6 (fine).
- **Note for the lead:** the flow study (`docs/research/2026-10-portfolio-flow.md` §4 fork 1A) recommends moving the
  card to Home. The owner's 2026-10-10 feedback keeps the card on About as the CV's ID. These conflict, so the
  owner has to choose one before anyone builds Home or About.

### Work `/work/` (`src/pages/work/index.astro`)
**Purpose:** the full catalogue, one product per screen, each opening its own view.
**Verdict: works.** The large objects and per-product light are the best realisation of the brief on the site.
- **Content runs under a transparent bar (V, `raw/d-work-scrolled.png`).** Text such as "A PDF editor…" and "browser."
  slides behind the tab pill and the GitHub link. The scrim (`global.css:128-129`) fades from 0.9 to 0 over 96 px, so
  text at y 0–60 stays legible and collides with the nav. The same happens on About when scrolled (the card hint
  crosses the pill) and under the open sheet (`d-work-sheet-scrolled.webp`, where the page text overlaps the `edk.` mark).
  Fix: a stronger scrim over the first 64 px, or a blurred pill-height band.
- The `01 of 03` counters are fine. The intro dek is fine.

### Project pages `/work/<slug>/` and the sheet
**Purpose:** get to know one product: what it is, why, how, and what is next, with real captures.
**Verdict: the content is rich and the captures are sharp (V).** The standalone page is drawn as a "sheet page" with an
X and "Work · 1 of 3" (`d-recto-cap.png`).
- **The sheet uses the platform scrollbar, not the ladder (V, C).** See §2.
- **Text scrolls visibly behind the sheet's own header strip (V, `raw/d-recto-cap.png`).** The "text, recognise
  scans…" line shows through at y≈150 under the sticky `.sheet-bar`. The bar needs an opaque or blurred fill.
- **Lazy captures paint as empty grey frames until they load (V, `d-recto-full.webp`).** That is normal for
  `loading=lazy`, but on a fast scroll the frames read as missing images. A low-quality placeholder colour or LQIP
  from the poster would help.
- English Prep's signature poster for phones is the 390×844 @1x file shown at 281 CSS px on a 3× phone (2.16×
  upscale, V). The desktop @1x poster is 1.1× upscaled. Both are captures, not photos; low priority.

### Record `/record/` (`src/pages/record/index.astro`)
**Purpose:** proof of continuous work.
**Verdict: an honest empty state with a well-made legend (V, `d-record.webp`).** The card-file object is still small,
as the owner noted. At 1440×900 the page is 1026 px tall, so it scrolls 126 px and shows the native scrollbar for
almost nothing (see §2).

### 404, `/lab/postcard/`
404: clear, four ways out, fine (V). Postcard lab: a test page. It upscales `eren-ytu-gate-1000.webp` 1.3× on a
2× screen (V). It is a lab page, so this is fine, but do not ship that derivative in a real entry.

---

## 2. Scrollbar map (1440×900 fine pointer; touch = 1180×820 and 390×844)

The head script (`layouts/Base.astro:101`) sets `rail-on` (fine pointer) or `rail-touch` only when the page was
built with `<Base rail>`. `rail.css:7-9, 98-100` then hides the native bar. `rail.ts:37` removes the classes
again when there are fewer than 2 sections, and `rail.ts:105` does the same when the page barely overflows or the ladder does not fit.

| Route / state | 1440 (fine) | Touch (tablet/phone) | Why (code) |
|---|---|---|---|
| `/` Home | **native bar** (15 px classic) | native indicator | `index.astro:206` has no `rail` prop |
| `/about/` | ladder (3 dashes), native hidden | slim ladder | `about.astro:301` `rail` |
| `/work/` | ladder (4), native hidden | slim ladder | `work/index.astro:48` `rail` |
| `/work/<slug>/` standalone | **native bar** | native indicator | `work/[slug].astro` no rail. ADR-0011 item 3 says on purpose (sticky `.toc` instead) |
| Project **sheet** over Home/Work | **native thin bar on `.sheet-scroll`**, page ladder hidden | same (sheet opens at ≥900 px, so tablet too) | `global.css:341` `scrollbar-width: thin`; `rail.css:30` hides the rail while `sheet-open`; ADR-0011 "Not done, on purpose" |
| `/record/` | **native bar** (scrolls only 126 px) | native | `record/index.astro:23` rail only with >1 year |
| record entry | ladder only for essays with h2s | same | `[slug].astro:36` `rail={toc.length > 0}` |
| `/lab/postcard/`, 404 | native | native | no rail |
| No JS / forced colours | native everywhere | native | by design |

Consequences:
- **The bar jumps sideways on every tab change between ladder and non-ladder pages, with classic scrollbars (V).**
  The tab pill is at x 547–878 on Home, Record and project pages, and at 554–886 on About and Work. GitHub moves 15 px.
  `html { scrollbar-gutter: stable }` (`global.css:70`) is cancelled by `scrollbar-width: none` on rail pages. The bar
  carries `view-transition-name: bar` (`transitions.css:9`), so the jump is animated on every navigation. It is invisible
  on macOS overlay scrollbars and visible on Windows/Linux. Fix: give every page the rail (a two-section minimum is easy:
  Home has hero, Work, Now), or keep the gutter on rail pages too.
- **The owner's "the sheet has no ladder" is correct and intended by ADR-0011.** The reasoning there ("would repeat
  its sticky `.toc`") is weak. The sheet already *has* a contents list (`.toc`), so the ladder could *replace* it, the
  same way ADR-0011 item 3 replaces the essay list. Then the ladder is the one scrollbar everywhere.
- **iOS (S, from ADR-0011 item 13's reading of WebKit):** after any ladder page hides Safari's indicator, it stays
  off for the tab. Home and project pages then have **no indicator at all**. Another reason to give every page the ladder.

---

## 3. Why the objects look jerky ("tiny stuttering movements")

Every object ships as a poster, a 30 fps idle loop (180 frames, 6 s, 1040²), a 17×3 lean grid (2° yaw and 4° pitch
steps, half and full tiers), a 30-frame hop clip, a 24-frame 60 fps droplet, and for edk a 120-frame spin used on
phones and tablets. Causes, most visible first:

1. **The lean grid is coarse and is blended, not interpolated (V, C).** `media.ts:357-383` adds the four nearest
   frames with `lighter` (a cross-dissolve). Adjacent edk columns differ by a **mean absolute difference of 8.3 grey
   levels**. For comparison, consecutive idle-video frames differ by 1.4. Edge centroids move **≈11.5 source px per
   2° column, about 10 device px on a 470 px slot at 2×** (Recto: 4.5 px source, 4 device px). Between columns
   you see a double image that sharpens at every column and softens in between, a periodic "tick". The mapping
   (`media.ts:530`, `u = 0.5 + mx·0.7`, `mx` normalised by half the window) passes one column per about 32 px of
   pointer travel, so a normal hand movement ticks several times a second. Fix: render the lean at 1° or finer (34+
   columns) only for the yaw row, or drive the lean from a short scrubbed video and seek it, or apply optical-flow
   warping between columns.
2. **The image goes soft while moving and sharp at rest (C).** While moving, half-size frames (edk 404×190) are
   stretched into a full-size 808×380 canvas. At rest, `loadFull` swaps in the full frame (`media.ts:368-371,
   384-395`). You see a sharpness pop each time the pointer stops.
3. **The object moves by itself after you stop (V).** 300 ms after the last pointer move, the target snaps to the
   nearest whole column (`media.ts:540-546`). Measured: the pointer stopped at column 3.33 and the object kept turning
   to 3.00 over the next ≈400 ms. That is a 0.66° turn nobody asked for.
4. **Lean and idle hand over at different poses (V).** The idle loop sways ±8°: matching its frames to the lean
   grid gives columns 4…12 over the loop. The lean starts at the centre or its last pose and fades in over 200 ms
   (`global.css:225-226, 230`). After 4.2 s at rest it fades back to the video at whatever pose the video has reached
   (`media.ts:547-550`). Both directions crossfade between poses up to 8–16° apart, so you get a ghosted jump. The idle
   video also keeps decoding under the lean at opacity 0.
5. **Every idle loop has a seam (V).** The last-to-first frame jump is the largest step in each loop: edk 3.62
   against a median of 1.44 and a maximum of 2.57 (2.5×), English Prep 4.2×, Log 4.1×, Record 2.9×, Recto 2.6×,
   Eat Map 2.3×. That is one visible hitch every 6 s on every object. Fix at render time (`tools/objects`): make frame
   180 equal frame 0 and drop the duplicate, or crossfade the last 6 frames into the first.
6. **30 fps content, and a fast spin (V for the numbers, S for how it looks).** The idle sways only 0.18–0.35 source px
   per frame, which looks smooth enough at 60 Hz. The **phone/tablet spin** reaches **29.6 source px per frame (≈6 CSS px
   per frame on a 210 px slot) and holds 43 identical frames**, so the letters snap round and stop. Without motion blur
   at 30 fps this strobes. Render the spin at 60 fps or with motion blur. On 120 Hz phones each 30 fps frame lasts 4
   refreshes; on 144 Hz monitors the cadence is uneven (5/5/5/5/4) (S).
7. **The droplet plays at a non-integer rate (C).** `media.ts:473` sets `playbackRate = 0.4 / 0.35 = 1.143` on a 60 fps
   clip, which is 68.6 fps content on a 60 Hz display. About one frame in seven is dropped, unevenly, during the melt.
   Render the melt at its real duration (0.35 s) and play it at 1.0.
8. **The hop clip ignores the lean pose (V).** See bug B4.
9. **Decode (S).** The videos are 1040² AV1 10-bit (`av01.0.08M.10`). Machines without hardware AV1 decode in software,
   and the video is composited through `mix-blend-mode: plus-lighter` plus a radial mask (`global.css:213-218`), which
   rules out the overlay fast path. Dropped frames are possible on older laptops. Not measured; check
   `video.getVideoPlaybackQuality()` on the owner's machine.

---

## 4. The edk object: reproduced behaviour (Home, 1440, fine pointer)

Traced the layer classes, the video state and the lean pose every frame (`tools/edk.mjs`). No script errors. What
looks "buggy":

- **It follows the pointer everywhere on the page (V).** It leans whenever the mouse moves anywhere, including while
  you reach for "See the work" (`media.ts:519-537`). On desktop it is almost always in lean mode, so the idle loop is
  rarely seen.
- **It stays turned when the pointer leaves (V).** Moving to the top-left corner and out leaves it at u = 0 (−16°)
  until 4.2 s pass with no movement. There is no `pointerleave`/`blur` reset.
- **The hop jumps between poses (V).** A click while leaning starts the clip at rest pose: the layer is `seq-on clip-on`
  at u = 0. The object jumps from −16° to centre, hops, then jumps back to −16° when the clip ends, because `seq-on` is
  still set (`media.ts:414-433`).
- **A frozen lean after scrolling (V).** Wheel-scroll it away and back without moving the mouse: it returns showing the
  stale lean frame, with the idle video playing invisibly beneath.
- **Idle↔lean ghost jump and loop seam:** §3.4 and §3.5.
- Rapid moves, double click, and Back from Work (bfcache) behaved correctly (V).
- Phones/tablets: the spin loop replaces the idle (`media.ts:59`). The 1180 touch shot caught the `k` mid-turn
  (`t-home.webp`).

---

## 5. ID card (desktop rope, pull, fling, spin): numbers (About, 1440, `tools/card.mjs`)

| Scenario | Peak yaw speed | Total spin | Swing angle | Clip offset (x, y) | Rope length vs rest | Settles after |
|---|---|---|---|---|---|---|
| Fast fling left (about 700 px in a few events) | **6022°/s** (≈96° per frame) | 760° | 24.7° | 178, 72 px (at the limits) | **1.47×** (209 → 308 px) | 4.9 s |
| Moderate drag right (200 px) | 123°/s | 52° | 27.1° | 156, 72 | 1.18× | 5.6 s |
| Pull down 600 px, yank up | – | 0 | 0.6° | 0, 72 | 1.30× | 1.3 s |
| Eight clicks | 2883–4277°/s | 370–411° | 0 | – | 1.0 | 1.0 s |

From the code (`card3d.ts`): the release spin is `fl.v = tw.x·4 + clamp(vx·0.7, ±1800)`, up to **≈1912°/s
(5.3 rev/s)** (`:411`). Friction is 1.4/s (`:45`), so it takes 1.5 s to fall to the 240°/s landing threshold and
covers ≈1200° (3.3 turns). The measured peak is higher because the twist spring (`tw`, ±28°, `:398`) and the landing
spring add on top. Release velocity is clamped at ±3000 px/s (`:406-407`). The swing clamp is ±1 rad (57°) (`:269`). The
sideways room is up to 1.3 card widths, about 400 px (`:118`). Hitting a limit **kills the velocity outright**
(`:189-190`), which reads as an invisible wall. Pulling the card rubber-bands up to 80 px past the rope's length
(`:120`, `holdTarget`), and **the strap visibly stretches 30–47%**.

**Bug B1 (V): the rope cannot be grabbed.** The rope shows a grab cursor (`IdCard.astro:132`), but
`card3d.ts:365` looks for `[data-rope-hit]` inside `ropePath.parentElement`, which is the `<defs>`
(`IdCard.astro:29-36`). The hit `<use>` sits outside it, so no listener is attached. Pressing the rope does nothing.
If fixed as written, a rope point pinned mid-strap has **no distance limit** (`:387`, only `y ≥ 4`), so the strap
would stretch without bound (C). Clamp the pinned point to `i·segLen·1.02` from the anchor.

Suggested limits:
- Spin: cap `|fl.v|` at **720°/s** (2 rev/s, ≤12° per frame at 60 Hz, below the wagon-wheel effect). Raise friction to
  **2.5/s**, so a full fling makes ½ to 1 turn. Only spin when `|vx| > 600 px/s` and the throw is mostly horizontal.
- Release velocity clamp: 3000 → **1200 px/s**. Twist while held: ±28° → **±12°**.
- Strap stretch: `lim.down` 80 → **≈8 px (≤4%)**. A lanyard does not stretch; let the card stop and the hand slip
  past it instead.
- Swing clamp: 1 rad → **0.5 rad (≈30°)**. Measured swing peaks are already 25–27°.
- Walls: replace the velocity kill with a soft bounce (restitution about 0.3), or a spring that ramps up over the last 40 px.
- Settle time is 5–5.6 s. Raise the swing damping from ζ 0.6 to **0.8** (`:130`) for about 2.5 s.

---

## 6. Photos (high-res originals in `content/photos/`)

Every `<img>` on every route at 1440@2×, 1180@2× and 390@3× was compared against its decoded file (`tools/imgs2.mjs`).
**No photo is stretched badly (V).**
- About courtyard: the 1350×2000 derivative covers 864 CSS px on a 2× screen, a **1.28× upscale**. The original is only
  1500×2000 (`park-through-lens.jpg`), so even the best possible file would be 1.15×. Acceptable; it is a dark,
  vignetted background.
- ID card photo: 640² file, 1.23× upscaled on a 3× phone (262 CSS px). The original is 2000×1500, so an 800 px
  derivative would remove it (`src/assets/photos/gate-card-*`).
- The only larger upscales are the blurred contact shadows (600² at 1.3–2.1×, which does not matter) and the lab postcard (1.3×).
- `content/photos/*-1000.webp` (750–1000 px) are used only by the lab page. Do not use them for large displays; build from the JPGs.
- The phone About photo shows a dark-red soft blob at the top left (`p-about.webp`) (S). It is probably part of the
  photograph (lens tint) at the phone crop (`global.css:460`, `object-position: 52% 40%`). Worth one look by the owner.

---

## 7. The Istanbul clock (git history)

- **Where it was:** prototype D (`prototypes/d-quiet/index.html:393`, script `:641-644`, "Istanbul clock, a small fact
  of place") and prototype E, at the right end of the top bar: `<p class="clock mono">Istanbul <b id="clock">--:--</b></p>`
  (`prototypes/e-dark/index.html:583`, styles `:141-142`, hidden on phones `:489`, script `:1057-1060` using
  `Intl.DateTimeFormat('en-GB', {hour, minute, timeZone: 'Europe/Istanbul'})`). Commits `b74eb6b` (D) and `3bb99ae` (E).
- **Why it went:** the craft audit (`docs/research/2026-10-craft-audit.md:62`, P1.4 "Decoration that reads as template")
  removed it with the mono caps and glowing dots: *"a 2023–25 folio trope; it changes every visit and says nothing about
  the work."* Prototype F's spec lists it as removed (`prototypes/f/SPEC.md:22`). It never reached the Astro site.
- **Assessment:** the audit's real target was the tracked mono caps it was set in. Since 2026-10-08 the brief says the
  site is "more social and brand-led than CV-like", and a place-and-time detail suits that. To bring it back: in the
  bar's right cluster before GitHub (desktop only), or on the ID card's back, in 13 px Inter with tabular figures,
  sentence case ("Istanbul 14:05"). Update it once a minute and give it `aria-hidden` or a plain label. Ask the owner which place.

---

## 8. Bugs, ranked

| # | Sev | Bug | Repro | Cause |
|---|---|---|---|---|
| B1 | High | The rope shows a grab cursor and cannot be pulled (V) | About, 1440: press the strap below the bar and drag. Nothing happens | `card3d.ts:365` searches `<defs>` (`IdCard.astro:29-36`); the hit `<use>` (`:43`) is outside it |
| B2 | High | Object stutter: lean ticks, the soft-to-sharp pop, self-settle, ghosted idle↔lean jumps (V) | Home or Work, 1440: move the mouse slowly, stop, wait 4 s | §3.1–3.4, `media.ts:357-411, 528-551` |
| B3 | High | Loop seam on all six idle loops, every 6 s (V) | Watch any object for 12 s | Render/encode (`tools/objects`); seam 2.3–4.2× the median step |
| B4 | Med | A hop while leaning jumps −16° to centre and back (V) | Home: move the mouse far left, click edk | `media.ts:414-433` keeps `seq-on` and ignores the pose |
| B5 | Med | The card overreacts: 6000°/s spin, strap stretch up to 1.47×, dead stops at walls (V) | About: fast fling | §5 constants |
| B6 | Med | Bar jumps 7–15 px sideways between ladder and non-ladder pages, animated by the view transition (V, classic scrollbars) | Home → About on Windows/Linux | `rail.css:8` removes the gutter that `global.css:70` reserves |
| B7 | Med | Content collides with the nav under the transparent bar (V) | Work/About: scroll 600 px | `global.css:128-129` scrim too weak |
| B8 | Med | Mixed scrollbars: the ladder on 2 routes, native on 5 plus the sheet (V) | §2 | `rail` opt-in per page |
| B9 | Low | Edk stays turned after the pointer leaves; stale lean after a wheel scroll (V) | Move to a corner, or scroll without moving | No leave/scroll reset in `media.ts:512-552` |
| B10 | Low | Droplet melt at 1.143× on a 60 fps clip drops frames (C) | Tab change from Home | `media.ts:473` |
| B11 | Low | Sheet header lets scrolled text show through (V) | Open the Recto sheet, scroll | `.sheet-bar` fill |
| B12 | Low | Home says "The log", the nav says "Record" (V) | Home, bottom | `index.astro:276` |
| B13 | Low | `/record/` scrolls 126 px at 900 px tall, so the native bar shows for nothing (V) | `/record/` at 1440×900 | Page height 1026 |
| B14 | Low | The card photo derivative caps at 640 px, 1.23× on 3× phones (V) | About on a phone | `src/assets/photos/gate-card-640` |

## 9. Hierarchy, type, spacing, copy: other notes
- The type system is coherent: Newsreader for display, Inter for the interface, one scale (`global.css:49-56`). No stray sizes seen.
- About's track lists repeat Work, and the facts table repeats the ledes. Cut both for the mini CV.
- Footer: "Grown level by level, updated 10 Oct 2026" is good and on brief.
- Transitions: cross-document view transitions and the droplet behaved without errors. The bar shift (B6) is the
  only visible glitch found in navigation.
- Phones: nothing breaks. Touch ladder and tap-to-turn both work. The bar tucks on scroll down.
