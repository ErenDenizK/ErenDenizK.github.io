# Research: a family of distinct products with one origin (2026-10-09)

The question (brief §7, 2026-10-09, *Family vision*): Recto, English Prep, Eat Map, the portfolio
and its objects feel mismatched. The owner wants each to keep its own UI, motion, colour and
structure, and all of them to "meet at a shared place": *they all come from the same place, yet
each is original and different in its own way.* The owner worked hard on Recto's and English
Prep's UIs; they must not be flattened. This file gathers what companies, studios and individual
makers do at this point, what they share and what they let vary, the frameworks behind it, the
failure modes, and a list of candidate "shared origin" strategies. **It decides nothing**; a
separate synthesis pass decides, and taste questions go to the owner.

Evidence grades, as in `2026-10-craft-audit.md`:

- **E** verified: a primary document opened in this research (Apple HIG pages as JSON from
  developer.apple.com; `material-foundation/material-color-utilities` README on GitHub), or the
  owner's own repositories read on disk.
- **P** practitioner or press, read through search extracts of named pages (Pentagram, Dezeen,
  Creative Bloq, TechCrunch, MusicTech, Mastercard newsroom, Wikipedia and similar).
- **F** folklore: aggregators, community summaries, third-party "design kits".
- **M** measured: our own reading of the owner's repos (tokens, motion, fonts).
- **K** prior knowledge, not re-checked here.

**Reach.** The sandbox resolved only developer.apple.com and GitHub. Unreachable, so known only
through search extracts or not at all: m3.material.io, fluent2.microsoft.design,
spectrum.adobe.com, atlassian.design, teenage.engineering, panic.com, culturedcode.com,
iconfactory.com, pentagram.com, sagmeister.com, linear.app, vercel.com, raycast.com, rauno.me,
paco.me, brianlovin.com, emilkowal.ski, worrydream.com, sindresorhus.com, muji.com, nintendo.com,
supergiantgames.com, Wikipedia. Nothing on those sites was opened; every claim from them is P
or weaker. Nathan Curtis's token-naming article and the Aaker and Joachimsthaler paper were not
read in full. Eat Map's source is not on this machine; what is said about it comes from the brief
and the task statement.

---

## 1. Cases: what is shared, what varies

### 1.1 Platform families (one company, many first-party apps)

| Case | Shared (the origin) | Free per product | Mechanism | Grade |
|---|---|---|---|---|
| **Apple: HIG and Liquid Glass (2025–26)** | One *functional layer* material (Liquid Glass) for controls and navigation "that unifies the design language across Apple platforms"; system type for body copy; standard components and behaviours; icon grid and corner masks concentric with hardware; the *system* draws icon light (specular highlights, refraction, translucency) on layers the app supplies. | Accent colour (used "judiciously", on primary actions and status); a custom font "for headlines and subheadings"; voice and tone; the icon's artwork; content-layer colour; illustration and imagery. | Split into two layers: a shared *control* layer and a free *content* layer. HIG Branding: "consider moving [brand colour] into the content layer, where it scrolls beneath Liquid Glass controls and gets picked up dynamically." "Ensure branding always defers to content." "Resist the temptation to display your logo throughout your app." Icons: "the system applies visual effects that respond to the environment"; "avoid soft and feathered edges" so system light lands well. | E (HIG Branding, Materials, App icons, Color, Motion; Branding change log Sept 2026) |
| **Apple's own apps** | SF and SF Symbols, the glass control layer, system springs and haptics, icon construction. | Pro apps (Logic, Final Cut) keep dark, dense, tool-like UIs; consumer apps (Notes, Freeform, Journal) are bright and sparse; each has its own icon colour and metaphor. | Same physics and construction, different density and temperature per audience. | K |
| **Google Material 3 / M3 Expressive** | One colour *algorithm* (HCT space, tonal palettes, contrast-checked roles), one shape and motion system; tokens in three tiers (`ref` → `sys` → `comp`). | The seed: "static and dynamic color schemes from a single color or a core palette." A brand hue can be *harmonised* (hue-shifted toward the scheme) instead of replaced. Expressive variants rotate hue boldly; tonal-spot stays pastel. | The origin is a function, not a palette: same solver, different input. M3 Expressive: Google reports 46 studies, 18,000+ participants, key elements found "up to four times faster" (Google's own claim, not peer-reviewed). | E (MCU README: `blend` "harmonize", `scheme`, `hct`, `dislike`); P (Dezeen, Fast Company, Droid-Life); F (tier names) |
| **Microsoft Fluent 2 / M365** | Global palette tokens (context-free) → alias tokens (intent); *shared colours* aligned across the suite for reusable components (avatars, calendars, badges) and status. | Each M365 app has a dedicated brand colour (Word, Excel, Teams…); Microsoft warns against using it on large surfaces because it "can dilute a hierarchy". | One component layer, one brand ramp per product generated from one key colour. | P (search extract of fluent2.microsoft.design/color and /design-tokens) |
| **Adobe Spectrum 2 and app icons** | Spectrum components, dynamic contrast, brand colours used system-wide; icons rounded squares with two- or three-letter mnemonics. | Each app's colour. In June 2020 Adobe regrouped icon colours *by category* (all video apps one blue-violet, all photo apps one blue); users said apps became "even harder to distinguish". | Category colour beat product colour, and lost. | P (Creative Bloq, PetaPixel, DIY Photography, TechCrunch) |
| **Google Workspace icons (2020)** | Every icon carried all four Google colours. | Shape only. | TechCrunch: "each one contains all of them, which makes it harder to tell them apart"; later redesign softened colours and gave each a dominant hue. | P |
| **Atlassian** | Jira family: one blue, one flowing line; a 2025 icon system replaced 350+ icons drawn by separate product teams (24 px/2 px → 16 px/1.5 px). | Each Jira product's interior symbol (headset, bracket, check). | Fixed container, varied glyph. | P/F (third-party blog; atlassian.com blog extract) |

### 1.2 Hardware and industrial families

| Case | Shared | Free per product | Lesson | Grade |
|---|---|---|---|---|
| **Teenage Engineering** (OP-1, OP-1 field, Field series TX-6 / TP-7 / CM-15, OP-XY, EP-133, Pocket Operators) | Silver anodised aluminium on the Field series; Ulm-school pictography; a balance of "physical inputs, considered materials, and playful software"; lowercase-ish naming with code numbers. | Function and form entirely (mixer, recorder, mic, synth); screen personality: the EP-133 has "iconography and colours on the screen that create a vintage arcade feeling", the OP-1 field its own playful UI; the 2025 black finish was offered for some pieces and *withheld* from the OP-1 field. | One material + one naming system + a stance (play), many instruments. The family is curated, not uniform: a finish can skip a member. | P (read.cv interview with D. Möllerstedt, MusicTech, Gizmodo, Highsnobiety) |
| **Nothing** (phones, ear, headphone; CMF) | Ndot dot-matrix face (Colophon, with Seventy), NType 82; transparent backs showing internals; black/white with red; lowercase product grammar `phone (3)`, `ear (open)`. | Product form; the Glyph LED pattern per phone; CMF became a cheaper, louder sub-brand and was spun off (2025). | A typeface and a naming grammar carry the family more than any colour. When Ndot was dropped from parts of OS 3, fans read it as lost identity. | P/F (Seventy agency, fontsinuse, Nothing llms.txt, community forum) |
| **Braun under Dieter Rams** | "Weniger, aber besser"; logical ordering of controls; Ulm-school system thinking; 400+ products in one ethic. | Every product's form and function. | Principles before style; the family is a way of deciding. | P (Design Museum, Substack); K (single colour accent per product, e.g. a green or orange switch) |
| **Muji** | No logo on the product; "emptiness" (Kenya Hara: "because it is empty, there's a possibility for it to be filled"); an advisory board instead of a star designer. | Everything else. | Absence as signature; the origin is a stance and a quality bar. | P (Dezeen interview with Hara, Muji pages) |
| **Playdate (Panic × Teenage Engineering)** | — (a one-off collaboration) | Yellow, a crank, a 1-bit screen; custom sounds for docking the crank. | One or two loud signature moves are remembered first ("Yellow, and then… crank"). | P (Inverse, MacStories) |

### 1.3 Software makers with several products

| Case | Shared | Free per product | Grade |
|---|---|---|---|
| **Panic** (Transmit, Nova, Prompt, Playdate, Untitled Goose Game as publisher) | Craft level, humour in copy, the Panic name as endorser. | Each product has its own icon character, colour and personality; Playdate is hardware, Goose is someone else's game. | P (Wikipedia, Portland Monthly); K (per-app personality) |
| **The Iconfactory** (Tot, Wallaroo, Linea) | Icon and UI craft; reviewers praise Tot's colour dots as navigation. | Each app's palette, scale and metaphor. In July 2025 the studio said it had "too many apps" and sought new homes for side products. | P (MacStories, Iconfactory blog) |
| **Cultured Code** (Things) | A single product; two Apple Design Awards; signature control (Magic Plus). | — | P (App Store copy) |
| **Sindre Sorhus** (~50 small Mac apps) | Native SwiftUI conventions, single-purpose scope. No documented house style found. | Everything visual. | P/F (forum, catalogue counts) |
| **Linear** | A theme *generator*: from a few inputs (base, accent, contrast) in LCH, so any theme keeps perceptual consistency; moved HSL → LCH in the 2024 redesign. | The inputs. | P (changelog extract), K (the three inputs) |
| **Raycast extensions** | Every third-party extension must render through Raycast's own components (List, Detail, Form, Grid). | Icon, content, actions. | K: the strongest "shared container" case in software |

### 1.4 Identity systems that flex

| Case | Constant | Variable | Lesson | Grade |
|---|---|---|---|---|
| **MIT Media Lab (Pentagram, Bierut and Fay, 2014)** | A 7×7 grid; Helvetica; an "ML" monogram. | One glyph per research group (23), each built from its letters on the grid. | The previous (2011) algorithm made tens of thousands of variants that "all looked pretty much the same": variation the eye cannot read is not variety. Pentagram's system "establishes a fixed identity… but celebrates the diversity of activity". | P (Pentagram, It's Nice That, Dezeen, Gizmodo) |
| **Casa da Música (Sagmeister, 2007)** | The building's faceted silhouette as logo (6 profiles, 17 planes). | Colours: a tool samples a picture (e.g. a Beethoven portrait) and pours 17 colours into the planes. | Colour comes *from the content*, shape from the origin. | P (Sagmeister, Cooper Hewitt) |
| **Mastercard (2019)** | The interlocking circles alone (80%+ recognised them without the word, per the CMO); one short melody. | The melody is re-arranged per genre and culture (operatic, cinematic, playful, EDM; 100+ tracks). | One motif, many arrangements: the closest analogue to "one motion grammar, many tempos". | P (Mastercard newsroom, WARC, It's Nice That) |

### 1.5 Studios and labels (very different works, one hand)

| Case | Shared | Free per work | Grade |
|---|---|---|---|
| **Supergiant** (Bastion, Transistor, Pyre, Hades I–II) | Art director Jen Zee across every game; painted, saturated, character-forward art; a design-led team; K: one composer (Darren Korb) and one writer (Greg Kasavin) throughout, and recurring structure (narrated reaction, hub + runs). | Setting, references and palette per game: Transistor was "a love-letter to Waterhouse and Klimt", deliberately not cyberpunk; Hades mythic. | P (Wikipedia, MCV), K |
| **Studio Ghibli** | A background method (Kazuo Oga: "extracts the essence of important elements… then augments them") across directors (Miyazaki, Takahata, others). | Director, story, character design. | P (Animation Obsessive, nausicaa.net) |
| **Nintendo** | Craft and "fun first"; the publisher mark; a hardware family. | Art direction per franchise (Mario, Zelda's changing styles, Splatoon, Pikmin). | K (no source found stating it; inference) |
| **Annapurna Interactive** | Curation ("personal, emotional, and original"); one still logo before each game, which takes *the game's own opening theme* or silence. | Everything: Gorogoa, Outer Wilds, Telling Lies, Stray look nothing alike. The label's identity is its range. | P (Wikipedia, NME, avid.wiki) |

### 1.6 Fashion diffusion lines (when a family member is a weaker copy)

Diffusion lines fail when they become "soft copies of the main lines" with over-broad
distribution (D&G closed 2011 for overexposing the parent; Marc by Marc Jacobs folded 2015) and
survive when they either align exactly with the main identity or become a distinct alternative
(REDValentino, McQ, Emporio Armani with its own shows). P (nss magazine, imore.it).
**Lesson:** a sibling that is a lesser version of another sibling hurts both; a sibling with its
own reason to exist does not.

---

## 2. What is shared, by dimension

Across the cases above, which layer carries the family (●), which is left free (○), and which
is mixed (◐, part shared, part free):

| Dimension | Apple | Material | Fluent | TE | Nothing | MIT ML | Mastercard | Supergiant | Annapurna |
|---|---|---|---|---|---|---|---|---|---|
| Type | ◐ system body, custom display | ● | ● | ◐ | ● Ndot | ● Helvetica | ● | ○ | ○ |
| Colour logic | ● roles, accent rules | ● solver | ● ramps | ◐ | ● mono + red | ○ | ● | ○ | ○ |
| Colour value | ○ accent | ○ seed | ○ product colour | ◐ | ○ | ○ | ● | ○ | ○ |
| Material / light | ● glass + system light | ◐ | ◐ acrylic/mica | ● aluminium | ● transparency | ○ | ○ | ◐ painted | ○ |
| Motion physics | ● system springs | ● motion scheme | ● | ○ | ◐ | ○ | ◐ melody | ○ | ○ |
| Iconography / glyph | ● SF Symbols, icon grid | ● | ● | ● pictograms | ● dot | ● grid glyphs | — | ○ | ○ |
| Shape / radii | ● concentric | ● shape scale | ● | ◐ | ◐ | ● grid | ● circles | ○ | ○ |
| Sound | ◐ system sounds | ○ | ○ | ◐ | ◐ | ○ | ● sonic logo | ● composer | ◐ takes the game's |
| Voice / copy | ○ "your brand's voice" | ○ | ◐ | ● playful | ● lowercase | ○ | ○ | ● writer | ○ |
| Structure / navigation | ● standard patterns | ● | ● | ○ | ○ | ○ | ○ | ◐ | ○ |
| Signature interaction | ○ | ○ | ○ | ● each device its own | ● Glyph | ○ | ○ | ● each game its own | ○ |
| Maker's mark | ◐ in the store, not in the app | ○ | ○ | ● | ● | ● ML | ● | ● logo + credits | ● logo + curation |
| Process / quality bar | ● HIG | ● | ● | ● | ● | — | — | ● | ● curation |

Two patterns stand out:

1. **Big platform systems share the *control layer* and free the *content layer*.** Type, shape,
   motion and structure are shared so behaviour is learnable; colour value, imagery and voice
   are the product's own (Apple, Material, Fluent, Atlassian).
2. **Makers of very different works share *a hand*, not a kit.** Supergiant, Ghibli, Annapurna,
   TE and Panic share a person or method (art director, background method, curator, material,
   humour) and a mark; each work picks its own look. These are the closer analogues to a single
   maker with four products.

---

## 3. Frameworks

### 3.1 Brand architecture (Aaker and Joachimsthaler, 2000)

The *brand relationship spectrum* runs: **branded house** (one master brand, products are
descriptors: Google Maps) → **sub-brands** (adapt the master's associations) → **endorsed
brands** (independent, with a parent's endorsement: "by Panic", Annapurna's logo) → **house of
brands** (parent hidden: P&G, or VW hiding Bentley beside Škoda). It is a continuum, companies
sit at several points at once and move along it (Unilever moved toward endorsed in 2004). P.

For this maker: Recto, English Prep and Eat Map already have their own names, marks and
colours, which is the *endorsed* position. A branded house ("edk Recto") would rename and
flatten them; a house of brands would hide the maker the portfolio exists to show. The open
question is how visible the endorsement is, and where: on the product, or only in the
portfolio.

### 3.2 Constants and variables (Lorenz; van Nes)

Martin Lorenz (*Flexible Visual Systems*, 2021): an identity balances **constants** (which make
it recognisable) and **variables** (which let it adapt); each component can be either. Irene van
Nes (*Dynamic Identities*, 2012): six components (type, logo, colour, imagery, language, graphic
elements); "fixating on at least one recognisable component can leave room to play with the
others"; fixed shapes and spatial relationships can be filled with any texture or colour (early
MTV). P (Grafik, Eye magazine, TMU paper extracts).

Applied: pick **few** constants, make them strong, and leave the rest explicitly variable. The
failure in both directions is unstated choice: everything implicitly shared (homogenising) or
nothing stated (mismatch, which is the owner's complaint).

### 3.3 Family resemblance (Wittgenstein)

Members of a family need not share one feature; they are linked by "a network of overlapping
similarities" (games: some competitive, some not; some need skill, some luck). P (Wikipedia,
philosophy papers). No source applies it to design systems (search found none); the transfer is
ours:

- Membership by degree: a product belongs if it shares *enough* traits, not one mandatory one.
- A bridge member can connect two that share little directly. The portfolio itself can be that
  bridge: it holds traits of each product (their colours, their captures) and its own.
- Caution: pure family resemblance has no anchor and can read as mismatch to a stranger. The
  flexible-identity books add the anchor (one constant) that makes the network legible.

### 3.4 Principles vs systems

Practitioners separate **design principles / DNA** (how we decide: Rams' ten, Muji's emptiness,
TE's play, Apple's "defer to content") from a **design system** (what we ship: tokens,
components). Yesenia Perez-Cruz (Vox Media, Shopify): components become "one-size-fits-all
solutions that work everywhere but excel nowhere"; "sameness over cohesion" is the main failure
she sees; Vox's sites "lost some of their unique character" under one system. Another essay
argues teams build uniform interfaces "that did not commit to any of these design principles in
the first place". P.

Applied: a family of four, each with its own mature system (Recto `tokens.css` + materials,
English Prep `palette.mjs` + design system), is better served by shared *principles and a few
shared primitives* than by one shared component library.

### 3.5 Token tiers

Common shape: **global / reference / option** tokens (raw values: `--lime-300`) → **alias /
semantic / decision** tokens (intent: `--accent`) → **component** tokens. Material names them
`ref`, `sys`, `comp`; Fluent global and alias. "Primitives should be stabilised first, with
intent attached later." F/P. A family adds one tier on top or below: **family tokens** (the few
shared constants) that each product's own global tier references or copies. Material's
alternative is a *generator*: share the function (HCT solver, contrast targets), not the values.

Applied to this family (M): Recto already layers brand values once in layer 1 and semantics in
layer 2 (`tokens.css` header); English Prep solves colour against contrast targets
(`tools/palette.mjs`, WCAG 2 + APCA); Recto has `styles/apca.ts`. Both already share the
*method* of solved, measured colour, independently.

### 3.6 Personality and voice

Apple: "use your brand's unique voice and tone in all the written communication" (E). Nothing's
lowercase product grammar and TE's playfulness are voice as family glue (P). Mailchimp-style
"voice constant, tone varies by context" is the usual practitioner model (K). A voice can be
shared while visuals differ; it costs nothing at runtime and survives every redesign.

---

## 4. How individual makers present a body of work

| Maker | Site shell (constant) | How each work is shown | Signature | Grade |
|---|---|---|---|---|
| Rauno Freiberg | A desktop-like site: dock, interface sounds, horizontal galleries | Projects, experiments and photography each as its own item; a separate craft page of interaction studies; essay "Invisible Details of Interaction Design" | Sound + micro-interaction craft | P (uiuxshowcase, aggregator) |
| Emil Kowalski | Plain, quiet text site | Each interaction is a live demo page (e.g. a recreated "trash interaction"); libraries (Sonner, Vaul) are known by their *behaviour* | Motion restraint and feel | P/F |
| Brian Lovin | One site as many small tools: writing, stack, sites, HN reader, AMA, listening, changelog | Each section is its own utility | Breadth and constant shipping | P (brianlovin.com llms.txt) |
| Paco Coursey | Minimal, type-led | Short project list, polished details | "Crafting interfaces" | F/K |
| Bret Victor | worrydream.com: an index that is almost a catalogue | Each essay is its own interactive medium (Explorable Explanations, simulations) | The work's form is the argument | P/K |
| Tobias van Schneider | Built Semplice, a portfolio system for designers; essay "Where are our design heroes?" | Case studies in a shared frame | Editorial presentation | P/K |
| Jordan Singer, Mariusz Ciesla | Not reached; K only: personal sites lead with tools and prototypes they built, not a visual brand | — | — | K |

Pattern: **the shell is one voice; each work is shown in its own medium.** The maker's
signature is the *quality of detail* and the *form of presentation*, rarely a colour or logo
applied to the works. Bret Victor and Emil Kowalski show a work by letting you use it.

---

## 5. Pitfalls

| Pitfall | What it looks like | Evidence | Guard |
|---|---|---|---|
| **Homogenising** | One palette or icon recipe for all; products become hard to tell apart. | Google Workspace 2020 (all four colours in every icon); Adobe 2020 category colours; Vox sites under one system. | Each product keeps a *dominant* own colour and shape; share logic, not values. |
| **Variation the eye cannot read** | A generator with many outputs that look alike. | MIT Media Lab 2011 algorithm: tens of thousands of logos that "all looked pretty much the same". | Fewer, bolder variables; test by naming the product from a thumbnail. |
| **Logo-slapping** | The maker's mark stamped on every screen and object. | HIG: "resist the temptation to display your logo throughout your app"; "branding always defers to content"; Muji has no logo at all. | The mark lives at entry and exit points (the portfolio, an About, a credits line), not inside product UI. |
| **Over-tokenising** | A shared library forces each product's components into one shape; two mature systems get rewritten to match a third. | "Components… work everywhere but excel nowhere" (Perez-Cruz); "primitives first" advice. | Share 3–6 primitives or a function; never a component library across products. |
| **Category over identity** | Products grouped by type (all study apps one colour). | Adobe 2020. | Colour per product, never per category. |
| **Soft copy sibling** | One product looks like a cheaper version of another. | Diffusion lines (D&G, Marc by Marc Jacobs). | Each member needs its own reason and signature move. |
| **Shared effect as identity** | One showy effect (glass, aurora) on everything until it is wallpaper. | HIG: "Use Liquid Glass effects sparingly"; "Don't use Liquid Glass in the content layer"; Liquid Glass critiques on competing for attention. | Share the *physics* of the effect, ration where it appears. |
| **Retrofitting the products for the portfolio** | Changing Recto or English Prep to match the portfolio. | The brief forbids flattening them; it also says improving the in-product presentation is "much later". | The portfolio adapts to the products first; product changes are opt-in and later. |
| **Signature without substance** | Personal brand that is only visual. | Annapurna and Ghibli are known for curation and method, Rams for principles. | Pair any visual constant with a written principle. |

---

## 6. What the four already share and where they differ (M)

Read from the owner's repos on disk (`/home/user/recto`, `/home/user/english-prep`,
`/home/user/Portfolio`); Eat Map from the brief only.

| Trait | Recto | English Prep | Eat Map | Portfolio (now) |
|---|---|---|---|---|
| Accent | lime `#c8fb3d` (`--lime-300`) | sakura/cherry pair, iris, lagoon, apricot | rose `#eb4f6b` on warm burgundy | per-section colour (lime, sakura, rose, cool white-blue, blue, gold) on `#0a0a0b` |
| Atmosphere | aurora of four lights (teal, mint, lime) with P3 stops | three aurora clusters cycling cherry/iris/lagoon, one opacity cap | — (not checked) | aura and per-page light (brief) |
| Material | Glass Clear / Tinted / Solid (`ui/Surface`, generated `materials.css`) | lit planes, ≥ 82 % opaque glass chrome | glass capsule tab bar | one pre-rendered glass object per project |
| Motion | seven springs as `linear()` curves, critically damped core, per-token reduced motion | three derived springs (gentle, bouncy, pop) as `linear()`; 120 ms press, 380 ms release | iOS system springs (K) | cubic-bezier eases (`--ease-out`, `--ease-move`); no springs |
| Signature element | the morphing bottom capsule | articulated buttons, folio About, elastic scroll rail | glass capsule tab bar | edk. mark with colour-changing dot; objects |
| UI type | Inter (custom cut "Inter Recto") + "Recto Signature" face | Inter variable, role-based (ADR 006, `css/editorial.css`); older Source Sans 3 / Serif 4 faces still in `css/fonts.css` | SF (K) | Inter + Newsreader |
| Colour method | layered tokens, APCA module | solved against WCAG 2 + APCA in CI | — | — |
| Reduced-motion twin | yes, per token | yes, stationary colour pools | — | yes (CLAUDE.md rule) |

Already latent across the owner's work, without having been planned: **aurora light behind
glass, spring-derived motion, Inter, measured contrast, and a still twin for every effect.**
Already distinct: accent hue, signature control, density and structure, audience and tone. The
portfolio is the member that differs most from the latent origin (eases, not springs).

---

## 7. Candidate shared-origin strategies (not decided)

Each candidate names what would be shared, what stays free, precedents, cost to the four
products, and risk. They combine; most families above use two or three.

**A. One light.** A shared *atmosphere model*: an aurora of a few coloured lights behind glass,
with one set of rules (number of lights, drift and colour-cycle ranges, an opacity cap, P3
stops, a stationary twin for reduced motion, pause when hidden). Each product supplies its own
pigments. *Precedent:* Apple's system light on app-supplied icon layers; TE's one aluminium;
Casa da Música (shape fixed, colour from content). *Fit:* Recto and English Prep already have
it; Eat Map's burgundy/rose would need one. *Cost:* low for the portfolio, none for products
unless they opt in. *Risk:* aurora as wallpaper; needs rationing.

**B. One motion grammar.** A family of named springs (e.g. press, quick, smooth, glide, pop),
written as `linear()` from one spring function, with the same reduced-motion rule per token.
Each product chooses its tempo and which presets it uses (Recto calm and tool-like, English Prep
bouncier). *Precedent:* Mastercard's one melody in many arrangements; Apple system springs; M3
Expressive motion scheme. *Fit:* Recto and English Prep already derive springs this way; the
portfolio would move from eases to springs. *Cost:* portfolio only. *Risk:* invisible to most
visitors unless paired with a signature interaction.

**C. One colour logic, own seed.** Share the *solver*, not the colours: each product's hue
generates its ramp under the same contrast targets (WCAG 2 + APCA) and the same dark-ground
rules; optionally harmonise hues slightly toward a shared temperature. *Precedent:* Material
dynamic colour and harmonise; Linear's few-input theme generator; Fluent brand ramps. *Fit:*
both products already solve colour against contrast. *Cost:* a shared script or spec. *Risk:*
harmonising too far pulls lime and rose toward each other (homogenising).

**D. One object language.** Each product is represented by one pre-rendered glass object made
with the same rig, lens, light and material, in its own form and colour (ADR-0005, ADR-0006).
*Precedent:* igloo.inc's one ice material for every item (`2026-10-3d-quality.md`); MIT Media
Lab's one grid, one glyph per group; Apple's layered icons under one system light. *Fit:* the
portfolio already does this; it could also become the products' icon/hero art later. *Cost:*
render pipeline exists. *Risk:* objects that resemble each other too closely (MIT 2011).

**E. One voice.** A short written voice: plain, specific, first person, no hype; one naming
grammar (lowercase? a period?) for product names and the mark. Tone varies per product (study
app warmer, editor terse). *Precedent:* Nothing's lowercase grammar; TE's playfulness; HIG's
voice guidance; Supergiant's one writer. *Cost:* copy edits only. *Risk:* low; weak alone.

**F. One maker's mark, endorsed.** "edk." with the colour-changing dot as the endorsement:
the dot takes each product's colour; it appears in the portfolio, product About pages and
credits, not in product UI. *Precedent:* Annapurna's still logo carrying each game's own theme;
Mastercard's symbol; Jira's fixed container with interior symbol; Panic as endorser. *Fit:* the
owner liked the colour-changing dot (brief, 2026-10-09). *Cost:* tiny. *Risk:* logo-slapping if
it spreads into product UI.

**G. One presentation format.** Every product gets the same *frame* in the portfolio: object,
real captures at fixed device sizes, a short story, its record thread, facts; inside the frame
the product's own colours, motion and a live or recorded signature interaction. *Precedent:*
Raycast's shared container; Apple product pages from one render pipeline; Bret Victor and Emil
Kowalski showing work by letting you use it; English Prep's folio of real captures. *Fit:* the
focused project view already exists. *Cost:* portfolio only. *Risk:* the frame dominates the
works if over-designed.

**H. One quality bar and method.** A written family charter: every effect has a still twin;
contrast measured; real captures, never mockups; specs cited in code; screenshots at three
sizes. Shown to visitors as a short "how these are made" note. *Precedent:* Rams, Muji's
advisory board, Supergiant, Ghibli's background method, Nintendo (K). *Fit:* already practised
in all three repos. *Cost:* a document. *Risk:* invisible on its own; it is the origin people
trust, not the one they see.

**I. Shared fundamentals.** Same UI face (Inter), focus ring, touch targets and accessibility
contract. *Fit:* largely true already. *Cost:* small. *Risk:* reads as platform default, gives
no identity.

Combination sketch (for the synthesis pass to weigh, not a recommendation): visible constants
from A or D, plus F; method constants from B, C, H; G as the meeting place. What stays free in
every combination: accent hue, signature control, structure, density, tone.

---

## 8. Questions for the owner (taste, not technique)

1. Where should the shared origin be *visible*: only in the portfolio, or also inside the
   products (an About line, an icon style, the dot)?
2. Which one constant should a stranger notice first: the light (aurora behind glass), the
   objects, or the mark?
3. Should the portfolio adopt one product's motion character, or have its own?
4. Is Eat Map's warm burgundy part of the family atmosphere, or the member that stays apart?

---

## Sources

Opened (E): Apple Human Interface Guidelines, Branding, Materials, App icons, Color and Motion
(developer.apple.com/tutorials/data/design/human-interface-guidelines/*.json, read 2026-10-09;
Branding change log "September 9, 2026: Refined guidance for using brand color").
material-foundation/material-color-utilities README on GitHub. The owner's repositories:
`recto/apps/web/src/styles/{tokens,motion,fonts}.css`, `english-prep/css/style.css`,
`english-prep/CLAUDE.md`, `Portfolio/src/styles/global.css`, `Portfolio/docs/brief.md`.

Through search extracts (P/F): createwithswift.com and pxlnv.com on Liquid Glass; uxdesign.cc
critique of Liquid Glass; developer.android.com Wear OS colour system; Dezeen, Fast Company,
Droid-Life on M3 Expressive; fluent2.microsoft.design/color and /design-tokens; SD Times on
Fluent 2; Creative Bloq and TechCrunch on Spectrum 2; Creative Bloq, PetaPixel, DIY Photography
on Adobe's 2020 icons; TechCrunch "Google's new logos are bad" (2020), Birchtree, TechRepublic on
Workspace icons; atlassian.com blog "Behind the screens: building Atlassian's new icon system";
read.cv interview with David Möllerstedt, Highsnobiety, Gizmodo, MusicTech on Teenage
Engineering; Seventy agency, fontsinuse, nothing.tech llms.txt, nothing.community on Nothing;
Design Museum on Rams; Dezeen interview with Kenya Hara; Inverse, MacStories on Playdate;
Wikipedia and Portland Monthly on Panic; MacStories and blog.iconfactory.com on The Iconfactory;
App Store listing for Things 3; Softpedia and Mac Power Users on Sindre Sorhus; linear.app
changelog 2020-12-04 and 2024-03-20 on Linear themes; Pentagram, It's Nice That, Dezeen,
Gizmodo on MIT Media Lab; sagmeister.com and Cooper Hewitt on Casa da Música; Mastercard
newsroom, WARC, exchange4media on the symbol and sonic brand; Wikipedia and MCV on Jen Zee and
Supergiant; Animation Obsessive and nausicaa.net on Kazuo Oga; Wikipedia, NME, avid.wiki on
Annapurna Interactive; nss magazine and imore.it on diffusion lines; Aaker and Joachimsthaler
(2000) via Nova SBE excerpt, WARC, Branding Strategy Insider, Vivaldi; Grafik on Martin Lorenz;
Eye magazine and TMU Pressbooks on Irene van Nes; Wikipedia and philosophy papers on family
resemblance; Yesenia Perez-Cruz (Substack), uxdesign.cc on uniformisation; alwaystwisted.com,
smart-interface-design-patterns.com on token naming; uiuxshowcase and aggregators on Rauno
Freiberg; community summaries on Emil Kowalski; brianlovin.com llms.txt; worrydream.com
ExplorableExplanations; Tobias van Schneider via guochen.substack.com.
