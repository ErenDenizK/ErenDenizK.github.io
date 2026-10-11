# Home hero object: concept study (2026-10-11)

**Status:** scratch study for the lead; nothing in the repo changed. Renders in `out/` (1200, 360,
120 px) and `sheet.webp`. The look is the owner's to judge; technique notes are the agent's.
**Ask (owner, 2026-10-11):** "edk" next to the name is too simple a move; a flashier, cooler, more
innovative object; something mascot-like could make sense, but evaluate it.
**Fixed constraints:** pre-rendered Cycles glass on #0A0A0B (ADR-0006), the house rig
(`tools/objects/rig.json`), a pinned object that turns on a 1° lean grid (33 × 3), morphs through the
shared droplet into each product's object (ADR-0007), plays a tap clip, and loops a spin on phones.
"Never a processor" (brief, 2026-10-09). Brand: quiet, dark, premium, light as colour.

Scores are 1-5 against: **B**rand fit, **M**emorability, **P**remium (not cute-cheap), **A**nimation
potential in the existing pipeline, **C**ost (5 = cheapest).

## The concepts

### 1. Kedi, the glass cat (mascot) — rendered
A seated cat in clear crystal, in the register of a Lalique or Baccarat figurine rather than a cartoon:
one fused, smooth body, no fur, no outline, two almond slits of edk light for eyes, the tail wrapped
round the paws. Beside it lies a small glowing bead: the period of "edk.". It says the person behind
the site, not the CV: the owner photographs Istanbul's cats (the kitten at sunset on About), and an
Istanbul engineer with a cat is a true, specific, warm fact that no other portfolio can claim.
**Scroll:** the lean grid turns the whole figure (a seated cat reads beautifully at ±16°; the head
can follow the reader with a separate head-yaw axis later). **Morph:** the cat stays a cat; the bead
is what changes: per chapter the cat bats the bead and it grows into the product object (or the cat
itself melts into the droplet, which works but is less charming). **Tap:** the ears flick, the head
tilts, a paw bats the bead (the rendered "play" pose is that clip's key). **120 px:** reads instantly
as a cat by silhouette alone (ears + tail), the strongest small-size read of all ten. **Risks:**
cute, "cat site", and a cat is a pet, not a profession; mitigated by crystal not plush, by
restraint in motion (cats are dignified: slow blinks, not waving), and by the bead tying it to the
mark. B4 M5 P4 A4 C3.

### 2. Dot, the living period of "edk." (mascot) — rendered
The edk letters stay, and the period after the k is alive: a small clear-glass droplet with a soft
edk-blue core and two tiny white eyes. It is the agent: the owner writes the letters by hand and
directs the dot. **Scroll:** the letters lean on the grid as now; the dot looks at the reader, then
toward the text. **Morph:** native: the pipeline already ends every object in the shared glass
droplet, so here the droplet is the character, and every product chapter is literally "the dot turns
into Recto". **Tap:** the dot hops along e-d-k (the existing letter hop) and lands with a squash.
**120 px:** the letters become a smudge and the dot is a few pixels; it relies on motion to read.
**Risks:** the letters still dominate the poster, so the owner may see "edk again with a ball";
eyes on a blob drift toward app-store mascot (Duolingo/Clippy) if overplayed. B5 M3 P3 A5 C5.

### 3. The Conductor, a glass pawn directing three agents (mascot) — rendered
A chess pawn turned into a figure: a glass body with a visor of edk light, one arm holding a thin
steel baton, and three small glass "agents" orbiting it in the product accents (lime, sakura, rose).
It is the most literal picture of "builds products by directing agents" (and a pawn is a first-year
who intends to cross the board). **Scroll:** the agents orbit with scroll, the pawn turns on the grid.
**Morph:** the agent of the chapter's colour flies in front and grows into that product. **Tap:** a
downbeat: baton up, the agents swing into an arc. **120 px:** a blob with coloured dots. **Risks:**
reads as a generic robot / Mii / Web3 avatar; "AI agents" as imagery dates fast; the product colours
compete with the chapter light. B3 M3 P2 A4 C3.

### 4. Triplet, the edk block (monogram evolved) — rendered
One solid of glass that is an **e** from the front, a **d** from the side and a **k** from above (the
intersection of the three extruded letters; Hofstadter's GEB cover idea). It is the most engineer's
idea of the ten: a single object that encodes three projections, a little puzzle that rewards a second
look, and turning, which the stage already does, is the reveal. **Scroll:** the chapters rotate it a
quarter turn at a time: e (who), d (how), k from above, its shadow (what). **Morph:** from any face it
melts to the droplet as the letters do now. **Tap:** a fast quarter turn and back. **120 px:** a face-on
letter reads; a three-quarter view is an abstract crystal. **Risks:** in between the faces it is a
jumble (see `triplet-q`), and glass multiplies the jumble; the 1° grid (±16°) never shows another
face, so the reveal needs extra rendered turns. B4 M4 P4 A3 C4.

### 5. Armillary, a kinetic glass gyroscope (abstract sculpture)
Three nested glass rings, faintly tinted lime, sakura and rose, around a clear core sphere of edk light,
each ring on its own axis. Balance, orbit, a system kept in motion: the agents as rings, the owner as
the still core. **Scroll:** the rings precess at different rates (a beautiful scrub). **Morph:** the
rings close into the droplet. **Tap:** they spin up and settle. **120 px:** a clean circle with a glow,
reads as "a logo". **Risks:** generic tech-sculpture (crypto, quantum, Apple's Vision Pro-era globes);
says little about this person. B3 M2 P5 A5 C4.

### 6. One-line edk, a continuous glass stroke (monogram evolved)
"edk" drawn as a single unbroken glass tube, like a neon sign or a calligrapher's one stroke, the
period a bead at the end. **Scroll:** it turns on the grid as now. **Tap/arrival:** it draws itself
(a write-on clip). **Morph:** the stroke unspools and re-knots into each product's outline. **120 px:**
a thin squiggle; weak. **Risks:** neon-sign cliché, and it is still "edk", which is what the owner
found too simple. B4 M2 P4 A4 C4.

### 7. A glass hand (directing / by hand)
A relaxed glass hand, palm up, small agent spheres resting on the fingertips: "by hand" and "with
agents" in one gesture. **Scroll:** the hand turns; the spheres lift. **Tap:** the fingers flick and
the spheres rise. **Risks:** uncanny, heavy to model and animate well, religious or stock-photo
connotations ("hand holding a glowing orb" is the most generic AI image there is). B3 M3 P2 A2 C1.

### 8. Çay bardağı, the Istanbul tea glass (wildcard)
The tulip-shaped Turkish tea glass on its saucer, amber tea glowing in Cycles, a sugar cube, the edk
mark etched on the side. Real glass, so the house style is at its most natural, and it is unmistakably
Istanbul and late-night studying. **Tap:** the cube drops, the tea swirls (a fluid bake: expensive).
**Morph:** the tea's colour turns into each product's light. **Risks:** reads as a café brand; nothing
about engineering; amber fights the cool palette. B2 M4 P4 A3 C3.

### 9. Lantern of light (wildcard)
A glass lantern whose flame is pure light that takes each chapter's colour ("light as colour" made
literal). **Risks:** abstract, a little sentimental, close to a generic "idea bulb". B3 M2 P4 A4 C4.

### 10. Pairing: Kedi carries the dot (recommended direction)
Concepts 1 + 2 together: the crystal cat is the companion on the first screen; the glowing bead by its
paws is the period of "edk." and the agent that becomes each product. The mark is kept as type (the
"edk." in the bar and under the name), and the object stops repeating it. See "Recommendation".

## Scores

| # | concept | B | M | P | A | C | sum |
|---|---|---|---|---|---|---|---|
| 1 | Kedi, glass cat | 4 | 5 | 4 | 4 | 3 | 20 |
| 2 | Dot, living period | 5 | 3 | 3 | 5 | 5 | 21 |
| 3 | Conductor pawn | 3 | 3 | 2 | 4 | 3 | 15 |
| 4 | Triplet block | 4 | 4 | 4 | 3 | 4 | 19 |
| 5 | Armillary | 3 | 2 | 5 | 5 | 4 | 19 |
| 6 | One-line edk | 4 | 2 | 4 | 4 | 4 | 18 |
| 7 | Glass hand | 3 | 3 | 2 | 2 | 1 | 11 |
| 8 | Tea glass | 2 | 4 | 4 | 3 | 3 | 16 |
| 9 | Lantern | 3 | 2 | 4 | 4 | 4 | 17 |
| 10 | Kedi + dot | 5 | 5 | 4 | 5 | 3 | 22 |

Rendered: 1, 2, 3 (two poses each) and 4 (four views: e, d, k and three-quarter).

## What the renders showed (house rig, 1200², 64 spp + OIDN, 2.3-5.4 min each on 4 shared cores)

- **Kedi** works best of the four. Built as one fused crystal body (a pear of revolution, head, ears,
  tail; voxel remesh + smoothing), it reads at once as a cat, at 120 px too, and in clear glass with the
  house backlight it looks like a crystal figurine, not a toy. The first build (stacked ellipsoids) had
  a refraction band at the waist and read as a snowman; the pear body fixed it. The study model is rough:
  the front legs melt into the body, the ears are plain cones, the face is unmodelled. Production needs
  one proper modelling pass (defined legs, hollowed ears, a carved muzzle, eye shape), not a new idea.
- **Dot** is the best pipeline fit and the weakest image: the letters dominate, the dot reads as a
  ball bearing at rest, and through glass its core magnifies into an eyeball. It needs motion to live.
- **Conductor** came out as predicted: a milky robot / Mii; the visor and agents help, but it looks like
  a generic AI avatar. Dropped.
- **Triplet** genuinely works: the d and the k read cleanly from their faces, the e reads with interior
  clutter; the three-quarter view is an abstract crystal. Premium and clever, but it is still letters,
  which is what the owner called too simple, and the reveal needs whole quarter turns.

## Recommendation: Kedi carries the dot

The crystal cat as Home's object, with the glowing bead (the period of "edk.") at its paws. The mark
stays as type in the bar and beside the name; the object stops repeating it and starts saying something
true about the person: an Istanbul engineer who photographs the city's cats, warm but exact. A cat is
the one mascot that is not a cartoon by default: it has a 3,000-year history as a glass, bronze and
crystal figurine (Bastet, Lalique, Baccarat), and its personality lives in small motion (a head tilt, an
ear flick, a slow blink), which is exactly the scale of motion this site allows. The bead gives it a
job: it is the agent the owner directs, and each product grows out of it.

**Guardrails so it stays premium:** clear crystal only (no tint, no fur, no outline, no mouth); eyes are
two slits of edk light, never cartoon pupils; motion is cat-like and slow (no waving, no jumping at
the reader); the hop clip becomes "the bat"; one cat, never a costume per product.

**If the owner finds a cat too cute:** Triplet is the strongest non-mascot (monogram evolved).

## Production plan (existing pipeline: frames.py stages, encode.py unchanged)

The cat is parametric (head yaw/pitch/roll, paw, tail curve, ear angle, bead position), so every pose
is a rebuild of one script: `tools/objects/kedi.py` like the others, with a `pose(t)` the clip, spin
and grid stages call. Rebuilding (remesh) costs about 3 s a frame. Cost scale, measured: this study's cat
renders about 2.2× slower per sample-pixel than edk (169-196 s at 1200²/64 spp against edk's poster,
159 s at 128 spp), so a grid frame (1040², 32 spp) is about 60 s against edk's 28 s.

| stage | what | frames | render hours |
|---|---|---|---|
| modelling pass | legs, ears, muzzle, eyes; 3 pose stills for the owner | 3 × 1200² | 0.3 (+ about half a day of agent work) |
| poster | rest pose, 128 spp | 1 | 0.1 |
| grid | 33 × 3 lean grid at 1°; the head also follows the reader a little (head yaw = 0.4 × body yaw) so the grid feels alive | 99 | 1.7 |
| clip ("the bat") | ear flick, head tilts to the bead, paw bats it, bead rolls out and back, rest → rest | 45 | 0.75 |
| droplet | the cat melts into the shared droplet (glass melting reads well; the bead joins last) | 24 | 0.4 |
| spin (phones) | the cat turns 360° on its base, tail sweeping, one slow blink at the end; at 640² like the recorder | 72 | 0.5 |
| shadow + normal | rest shadow; normals for the live tier | 1 + 99 | 0.1 |
| **total** | | | **about 3.9 render hours** (plus 0.5 h of reruns/margin: plan 4.5) |

Morph into the products is the existing route: the cat → droplet → product clips per chapter (ADR-0007);
nothing new on the page. A later, richer version (the bead grows into the product while the cat watches)
is a second clip per product (about 0.5 h each) and can wait.

## Files

- `concepts.py`: the four concepts, parametric poses, house rig via `tools/objects/common.py` (read only).
- `out/<concept>-<pose>-poster.webp` (1200), `-360.webp`, `-120.webp`; `sheet.webp`: the contact sheet
  with the current edk poster.
- `sheet.py`: makes the sizes and the sheet.
