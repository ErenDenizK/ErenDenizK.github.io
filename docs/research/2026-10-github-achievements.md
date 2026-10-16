# GitHub achievements through real work

**Status:** research, 2026-10-16. Sources are community guides, not GitHub's own documentation
(GitHub publishes no threshold list); every threshold is unverified until a badge appears on the
owner's profile. The owner's rule: earn achievements only through real work, never fake
("yalandan değil, gerçek çalışarak").

## The achievements and an honest route to each

| Achievement | What earns it (community guides) | Real-work route here | Verdict |
|---|---|---|---|
| Pull Shark | merged pull requests (tiers about 2 / 16 / 128 / 1024) | every lane lands on `dev` through its own PR (PRC-17 in Recto; same rule here) | yes, follows from the PR flow |
| YOLO | merge your own PR without a review | the lead merges a lane PR after `npm run verify`, with no review requested | yes, the first lane PR |
| Pair Extraordinaire | a merged PR with co-authored commits (tiers about 1 / 10 / 24 / 48) | every commit already carries the `Co-Authored-By` trailer; it counts if the co-author address maps to a GitHub account | likely; confirm after the first merged PR |
| Quickdraw | close an issue or PR within 5 minutes of opening it | only when a real, small issue is fixed that fast; never open-and-close for the badge | only if it happens by itself |
| Starstruck | other people star a public repo (16 / 128 / 512 / 4096) | earned by Recto and English Prep being worth starring; a README with screenshots and a live link helps | depends on others |
| Galaxy Brain | accepted answers in Discussions Q&A | answer real questions in other projects' Discussions (Astro, PDFium tooling) where the owner knows the answer | possible, real effort |
| Public Sponsor | sponsor someone through GitHub Sponsors | a real sponsorship of a tool the projects use | the owner's choice (money) |
| Heart On Your Sleeve, Open Sourcerer and others | newer or event badges; rules vary | none planned | check the profile |

## What the portfolio changes

1. **Pull requests (owner, 2026-10-16: "PR yapacak mıyız? Evet yapacağız").** Each lane is a
   short-lived branch `lane/<topic>`. The lead pushes it, opens a PR into `dev`, waits for CI, and
   merges it with a merge commit (never squash, so every commit stays in the default branch's history
   and on the contribution graph). The branch is deleted after the merge.
2. **Owner actions:** in GitHub Settings, set `dev` as the default branch (contributions count only on
   the default branch) and turn on "Automatically delete head branches" (the proxy here refuses branch
   deletion, so GitHub deletes merged lane branches).
3. **English Prep** may adopt the same flow in its own chat; Recto already did (PRC-17).
