# Why the home round failed (2026-10-11)

> **Status:** current. The lead's own analysis after the owner rejected Home A and Home B ("everything
> too big, not professional, contrived, many bugs on the phone, ugly") and the photo concepts ("a
> gimmick"). Home was reverted to its previous version the same day. Update 2026-10-15: "What changes"
> item 1 is done (the owner's reference study, 2026-10-12..14, `2026-10-reference-research.md`); ADR-0015
> was reverted with Home in `0f4a33a` (text at `16136f3`).

## What happened

In one evening the lead ran five agents in parallel: an award research agent, two builders that each
wrote a full new Home straight into code (A, "cinematic object stage"; B, "living editorial index"), a
photo-presentation agent, and a 3D hero study. A was merged to the live site before the owner saw it;
B went to a lab page. The owner preferred B's structure (compact, focused) and rejected both designs.

## Causes, in order of weight

1. **The lead's prompts asked for excess.** The owner said "woaaww" and "design award". The lead
   translated that into instructions such as "monumental, kinetic name", "go all out", "big confident
   typography", "one signature interaction people remember". The brief says the opposite: Direction D,
   quiet, minimal, elegant, premium, "simple layout is good, just not flashy". Nothing in the builder
   prompts set limits (maximum display size per width, density, motion amplitude). The builders did
   what they were told. "Everything is too big" was written into the prompt.
2. **Design was done without seeing any design.** This environment cannot reach outside websites (the
   network policy blocks every host but GitHub; verified 2026-10-11 against awwwards.com, linear.app
   and apple.com). The research agent said so plainly: its "award analysis" came from search snippets
   and memory. The builders never saw a single reference either. "Award-level" was attempted blind,
   from recollection of what such sites are like, which produces imitation of the clichés (huge serif
   names, colour sweeps, docking letters) rather than the craft.
3. **No design stage before code.** Each round went brief → full build → owner sees it on the live
   site. There were no still comps, no two-or-three frames to choose from, no owner gate before
   building. Mistakes in direction were discovered only after hours of build, on the phone, in
   production.
4. **The lead's review was too shallow.** The lead looked at two or three screenshots per concept,
   mostly desktop, judged them "strong", and merged on green tests. It did not critique against
   written criteria, did not drive the phone flows frame by frame, and trusted agent self-reports.
   Tests prove structure (no overflow, no stretched image, a rail on every page), not taste.
5. **The phone is not really tested.** The owner looks on an iPhone (Safari); every check here runs
   in headless Chromium. WebKit is not installed and cannot be downloaded (network). Scroll-linked
   choreography, pinned sections, docking letters and video loops are exactly the things that break
   in iOS Safari, and none of it was seen on a real device before the owner saw it.
6. **No written taste.** The brief records what the owner wants, not what it looks like. There is no
   design charter with concrete limits and liked references, so every agent re-interprets "premium".
   The measured type system (ADR-0015) arrived after the builders, not before them.
7. **Speed and volume over quality.** Five agents at once, merges to the live site within the hour,
   long-running renders loading the machine. Throughput looked like progress; the owner received a
   stream of half-right things to judge on a phone.
8. **A very long session.** Over three days the context grew past what can be held at once; earlier
   constraints (quiet, restraint, "never flashy") were present in the docs but faded from the prompts.

What was not the cause: the owner's prompts. "Woaaww" without references is a normal client brief. It
was the lead's job to turn it into concrete constraints and to ask for references, and the lead did
neither, although the owner had said "ask everything, assume nothing".

## What changes

1. **References first.** Either the owner widens the environment's network access (cloud environment
   settings → Network access) so agents can study real sites, or the owner sends 5–10 screenshots or
   links of pages they like and 3 they dislike. No "award" work starts blind again.
2. **A design charter** (`docs/design/charter.md`, after the references): concrete limits per width
   (largest type size, line length, density, motion amplitude and duration), what premium means here,
   the liked references and why. Every design prompt quotes it.
3. **Comps before code.** Two or three still frames at phone and desktop size, shown to the owner;
   building starts only after a pick. One design lead agent iterating, not parallel builders.
4. **The lead reviews against the charter**, phone first, with frame sequences of every interaction,
   and writes the critique down before merging.
5. **New designs never replace a live page before the owner approves**: they go to a lab page first.
6. **Phone truth:** the owner's iPhone remains the only Safari test; anything scroll-linked or
   pinned is kept out of a page until the owner has tried it on the lab page.
7. **Fewer agents, slower merges.** Two at a time unless the owner raises it; renders run when no
   tests do.
8. **A clean session** with a short handoff (`docs/HANDOFF.md`) so the next context starts from the
   decisions, not from three days of history.
