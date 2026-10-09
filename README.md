# erendenizk.github.io

The personal site of Eren Deniz Kuyucaklıoğlu: the products I direct, a dated record of the work,
and who I am. A four-year project that grows level by level ([brief](docs/brief.md),
[roadmap](docs/ROADMAP.md)).

Astro 7 (static), on GitHub Pages. Every page is complete HTML without JavaScript; a small script
adds the moving objects, the project sheet and the transitions. Decisions are in
[docs/adr/](docs/adr/), research in [docs/research/](docs/research/).

## Run it

Node 22.12 or later.

```sh
npm ci
npm run dev           # http://localhost:4321/
npm run build         # dist/ (base "/" locally; on GitHub, the repository name decides)
npm run check         # types and content schemas
npm run verify        # check, test builds, size budget and every browser test
```

The browser tests need Playwright's Chromium (`npx playwright install chromium`, or set
`PLAYWRIGHT_BROWSERS_PATH`). `npm run build:test` builds the site under `/Portfolio/` (as Pages
serves it before the rename) and a second copy with fixture log entries; `npm test` serves both like
Pages and runs the navigation suite, the log templates, axe, and the screenshot matrix (written to
`tests/shots/`). `npm run budget` checks first paint (at most 200 KB per page).

## Where things are

```
content/               everything a visitor reads: data, not code (ADR-0002)
  site.json            name, links, the lines on Home, Work, Record and About
  projects/<slug>.md   one file per project
  log/<year>/<slug>.md one file per entry of the record, served under /record/ (none published yet)
  photos/              the owner's originals
media/objects/<name>/  pre-rendered objects and their manifest.json (tools/objects, ADR-0006)
src/
  content.config.ts    the schemas: a bad field fails the build
  pages/               routes: /, /work/, /work/<slug>/, /record/, /record/<year>/<slug>/, /about/, 404, feed;
                       lab/ holds hidden component workbenches (noindex, not in the sitemap)
  components/          Media (the object stage), ProjectCase, LogRow, Figure, Icon, IdCard, Postcard, ...
  scripts/             media.ts (stage), sheet.ts (project sheet), log.ts, card3d.ts (cards), site.ts
  styles/              global.css (tokens and layout), log.css, transitions.css
  fonts/               subset Newsreader and Inter (tools/fonts/subset.py)
  assets/photos/       graded photos (tools/photos/grade.mjs)
tools/                 generators: icons, link-preview cards and favicons, objects, illustrations, fonts
tests/                 Playwright suites, the Pages-like server, the size budget, log fixtures
```

## Adding content

Nothing here needs a code change. Run `npm run dev` and look at the page, then `npm run check`.

### A project

Copy `content/projects/recto.md` to `content/projects/<slug>.md`; the file name is the address
(`/work/<slug>/`). The fields:

| Field | What |
|---|---|
| `title`, `order` | name, and position on Work and Home |
| `featured` | `true` puts the project at the head of Home's showcase (the first marked one, by `order`); without one, the project with the latest record entry leads, then the first by `order` |
| `group` | `directed` (built by directing agents, the default) or `by-hand` |
| `status` | `Live`, `Public beta`, `In development`, `Paused` or `Archived` |
| `version`, `started` (`YYYY-MM`), `role`, `runsOn`, `stack` | the facts row |
| `accent` | `{ color, glow?, p2?, p3? }`: the project's light |
| `object` | the object in `media/objects/<object>/`; until it is rendered, add a poster to `src/assets/objects/<object>-poster.webp` |
| `og` | link-preview card in `tools/og/out/<og>.jpg` (defaults to the home card) |
| `summary` | the one line on Home and Work (the pitch when it leads Home's showcase; `what.text` and `what.numbers` follow it there) |
| `links` | `[{ label, href, kind: live \| code \| other }]` |
| `what`, `why`, `how`, `learned`, `next` | each `{ text }`, `{ items: [...] }`, `{ quote }`, `{ numbers: [...] }` or `{ placeholder }` |
| `draft` | `true` keeps it out of the build (it still shows in `npm run dev`) |

Anything the owner has not written yet is `{ placeholder: "owner to write" }` (or
`summaryPlaceholder`): it stays in the content and is left out of the site entirely; writing the
text is all it takes for it to appear. A test fails the build if a placeholder ever shows.

### A log entry

The owner dictates; an agent drafts; nothing is published without the owner's OK on the exact
draft. The workflow is the `log-entry` skill (`.claude/skills/log-entry/SKILL.md`); the design is
[docs/design/log.md](docs/design/log.md). The file is `content/log/<year>/<slug>.md` and its page is `/record/<year>/<slug>/`; the fields are
in `content/log/_README.md`. Three kinds: `note` (one to three sentences, no title), `entry` (a few
paragraphs, opens in place), `essay` (long, its own page; use `.mdx` and `<Figure name="..." />`
for drawings from `tools/illustrations`). The slug never changes once published.

### Photos, icons, previews

- Photos: put the original in `content/photos/`, add it to `tools/photos/grade.mjs`, run
  `npm run photos`.
- Icons: `tools/icons` (inlined at build by `src/components/Icon.astro`).
- Link previews and favicons: `tools/og` writes `tools/og/out/`; the build publishes the cards under
  content-hashed names and packs `favicon.ico`. The favicon choice is `ICONS` in `src/lib/files.mjs`.

## Releases

Work happens on `dev`; CI (`.github/workflows/ci.yml`) runs every gate on each push. The site
deploys from `main` only (`.github/workflows/deploy.yml`), and only the owner merges into `main`
(ADR-0004).
