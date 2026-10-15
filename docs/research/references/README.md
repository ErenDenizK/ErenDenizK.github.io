# Reference research archive (2026-10-12 to 2026-10-14)

Status: history (evidence). The reference study the owner ran on their own computer, from the prompt
now kept at `docs/history/prompt-2026-10-reference-research.md`. Its views are evidence, not
decisions: nothing here changes `docs/brief.md` until the owner decides. Start with the digest,
[`../2026-10-reference-research.md`](../2026-10-reference-research.md), which reads this archive
against the brief and says what is measured and what is opinion.

These files are copied unchanged from the owner's archive (`reference-research/`, five zip parts).
They describe and quote third-party sites for research commentary only.

## Files

| File | What it is |
|---|---|
| `report.md` | The final report in English: summary, method, the owner's criteria and votes, research with sources, Studies 1 to 5, conclusions, limits |
| `rapor.html` | The same report in Turkish, the owner-facing edition. The two editions diverge in places; quote the one you mean |
| `liked-sites.md` | Study 6 in English: the 16 liked-site dossiers (the owner's note, a first analysis, values read from each site's CSS and DOM) |
| `begenilenler.html` | Study 6 in Turkish, with clips and frames (not kept here, see below) |
| `criteria.tr.md` | The owner's evaluation criteria as dictated, dated, in Turkish (the archive's `brief/criteria.md`; identical to its `final/data/owner-criteria.tr.md`) |
| `sources.md` | The research notes with sources and confidence labels (the archive's `final/data/research-sources.md`) |
| `data/picker/` | Study 2: the 127-site list (`sites_all.json`) and where each site came from (`awards.json`, `products.json`, `portfolios.json`), the dropped sites (`blocked.json`), and the owner's 31 votes and notes in their own words (`votes.json`) |
| `data/study1-29-sites/` | Study 1 measurements, one file per site |
| `data/study3-anatomy/` | Study 3: fonts, type scale, colours, transitions and scroll stops of the loved sites |
| `data/study4-home-pages/` | Study 4: section structure and first-screen inventory of 13 home pages |
| `data/study5-work-transitions/` | Study 5: gallery-to-page transition probes, successful and failed |
| `data/dossiers/*.json` | Study 6: the 16 dossiers' raw data |

The reports cite paths as they were in the archive: `data/owner-criteria.tr.md` is `criteria.tr.md`
here, `data/research-sources.md` is `sources.md`, and `data/dossiers/css/` was not copied.

## The six studies

1. **29 sites, first measurements** (2026-10-12): personal brands, product pages, photography.
2. **The 127-site picker** (2026-10-12): award winners and widely praised sites gathered by three
   agents; the owner voted on and annotated 31. Picker: https://claude.ai/artifact/1CHkxD94pf1fYe2EB72J4k
3. **Anatomy of the 12 loved sites** (2026-10-12): fonts, type scale, colours, motion, libraries, the
   scroll journey.
4. **CV-like home pages** (2026-10-14): structure, length, order and density of 13 home pages.
5. **Work transitions** (2026-10-14): gallery-to-page transitions recorded frame by frame (14
   galleries probed; three changed URL and are described).
6. **Liked-site dossiers** (2026-10-14): 16 sites the owner liked or praised.

## Method and limits

Playwright drove the installed Chrome on the owner's computer: desktop 1440×900 at 1×, phone 390×844
at 2× with an iPhone user agent. Captures were the first screen and telling scroll positions, the
first 3 s after first paint, a wheel-scroll recording, and for the loved sites the whole page stop by
stop; measures were loaded fonts and the type scale, line length, colours and CSS variables, every
transition with its duration and easing, libraries, page length and sections, first-screen words, and
arrival time. The report labels each claim: **M** measured, **O** the owner's words, **R** research
with sources, **D** the reviewer's reasoning.

Limits (the report's own, in short): phone captures are Chrome emulating an iPhone, not real Safari;
timings depend on the network (up to ±1 s on looping pages) and compare sites rather than set specs;
WebGL sites may arrive slower in headless Chrome; GPU flags on 2026-10-12 broke some intros until they
were removed and the loved sites re-measured; some research sources are summaries or industry studies.
Two lines in `sources.md` are the research agent's illustrations, not facts about the owner: the
location "(Istanbul)" in the hiring section and the "free study room" headline example.

Privacy: the capture tools blurred emails, phone numbers and contact lines before capturing and
scrubbed them from the JSON; a regex sweep of these files before committing found none.

## Images

`img/` holds the 64 report figures (4.1 MB), added on 2026-10-15 with the owner's agreement so
agents can see the references. They are third-party screenshots, kept for research and commentary
only (`LICENSE-CONTENT.md`). The links in `report.md` and `rapor.html` resolve to them.

## What is not here

- **Dossier images.** `img-dossiers/` (dossier clips and frames, 11 MB) stays in the owner's archive.
  The dossier reports' image links therefore do not resolve here. Read them in the published
  dossiers: https://claude.ai/artifact/V1SZ4t9nfRH7TuxVw3tdva. The report is also published:
  https://claude.ai/artifact/5vVohMohG5zLmSrh456jjB.
- **Raw captures** of all 127 sites (`library/captures/`), the intermediate reports and every scroll
  frame (`reviews/`; their JSON matches `data/`), and the sites' stylesheets (`data/dossiers/css/`,
  third-party code). They stay in the owner's archive, off the repo.
- **Study 1's raw files**, which the archive places on a local `wip/references` branch of the owner's
  clone under `docs/research/design-review/`; that branch never reached origin. `data/study1-29-sites/`
  covers the measurements.
- **The tools**, kept in the owner's archive (`tools/`; Python with Playwright and Pillow, written for
  Windows and the installed Chrome): `capture.py` (stills, first-3-seconds and scroll recordings,
  measurements), `anatomy.py` (fonts, type scale, colours, transitions, libraries, scroll journey),
  `homeprobe.py` (home-page structure and first-screen inventory), `transprobe.py` (gallery-to-page
  transitions), `dossier.py` and `dossier_report.py` (the liked-site dossiers and their reports),
  `sheet.py` (contact sheets), `picker/` (the like/dislike picker page), `discovery/` (helpers for
  award galleries) and `keep-awake.ps1`. Bring one in under `tools/research/` only when it is run on
  this site's own pages.
