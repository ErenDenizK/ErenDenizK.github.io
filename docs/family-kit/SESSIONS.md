# Sessions: who works where (from 2026-10-10)

> **Türkçe özet:** Çalışma artık ayrı sohbetlere bölündü. Her sohbetin kendi reposu ve kendi
> sınırı var. Aşağıdaki tabloda kim neye dokunur, yeni sohbete ne yapıştırılır ve sohbetler
> birbirine nasıl iş verir yazıyor.

Work on the owner's products is split into separate chats so no single context carries
everything. Each chat owns one area and reads the others' files without editing them.

## Ownership

| Chat | Repository and branch | Owns | Must not edit |
|---|---|---|---|
| **Portfolio** | `ErenDenizK/ErenDenizK.github.io`, `dev` (never `main`) | the whole site: `src/`, `content/`, `tests/`, `tools/`, `media/`, `docs/` except the two paths on the right | `docs/family-kit/`, `docs/design/family.md` |
| **Family (shared)** | same repository, `dev`, docs only | `docs/family-kit/`, `docs/design/family.md`, and copying the kit into each app's `docs/family/kit/` | site code, content, any other doc |
| **Recto** | `ErenDenizK/recto`, its session branch (never `develop` or `main`) | the app | other repositories |
| **English Prep** | `ErenDenizK/english-prep`, its session branch (never `test`, which is live, or `main`) | the app, including the handover rework | other repositories |
| **Eat Map** | Xcode project, outside GitHub for now | the app | n/a |

The Portfolio and Family chats share one branch that deploys on every push. Both pull before
they push, run `npm run verify` before pushing, and never rewrite history. A docs-only push by the
Family chat still deploys, and the site imports `light.css`, `springs.js` and `world.schema.json`
from this folder at build time, so a kit change can change the live site: the Family chat tells
the Portfolio chat (Open requests below) before changing those three files.

## Starting each chat

Paste the prompt for that chat into a new session on its repository.

- **Recto:** `docs/family/SESSION-PROMPT.md` on the branch `claude/portfolio-site-design-n38jml`.
  That branch is not merged into `develop`; start the session from it or merge it first.
- **English Prep:** read `docs/handover/CURRENT.md` first; it records the owner's decisions of
  2026-10-10 (the glass ban is lifted; no grain; `docs/app1-final.md` is history and a new
  roadmap follows; About may be redesigned from scratch). Then `docs/handover/AUDIT.md` and
  `docs/handover/CLAUDE.draft.md`, then `docs/family/SESSION-PROMPT.md`. All of them are on the
  branch `claude/portfolio-site-design-n38jml`, which is not merged into `test`.
- **Eat Map:** `PROMPT-TEMPLATE.md` in this folder, with the Eat Map note.
- **Family (shared):** the block below.

```text
You maintain the family kit "Kept light" for Eren Deniz Kuyucaklıoğlu's products, in the
portfolio repository (ErenDenizK/ErenDenizK.github.io, branch dev). Read CLAUDE.md,
docs/brief.md §7, docs/family-kit/SESSIONS.md, docs/family-kit/README.md and
docs/design/family.md. You edit only docs/family-kit/ and docs/design/family.md; the site
belongs to the Portfolio chat. Pull before you push and run `npm run verify` before every push,
because pushes to dev deploy the site. When the kit changes, copy it into each app's
docs/family/kit/ on that app's session branch, with a line saying which kit commit it is.
Never flatten an app's signature; family.md §2.3 outranks everything. Ask the owner about taste
with a short plain-language brief in Turkish; decide technique yourself and record it.
```

## How the chats hand work to each other

- **An app gives the portfolio** its presentation: `docs/family/world.json` (ground, inks,
  accent, captures, signature clip) and real captures, made with the app's own capture tool
  (Recto `tools/media/family/`, English Prep `tools/capture-portfolio.mjs`). The Portfolio chat
  copies them into `content/projects/<slug>/` when the owner says the app is presentable.
- **The portfolio asks an app** for something by writing it in this file under "Open requests",
  so the app's chat sees it the next time it reads the kit.
- **Logos and marks:** each app owns its mark. The portfolio shows the app's mark as given and
  never redraws it.

## Open requests

- From Portfolio to all apps: a presentable state, then fresh captures and the app's mark (or a
  3D version of it) for the project pages. The owner decides when each app is ready.
- From Portfolio to Eat Map: real colour values and the mark, from Xcode.
