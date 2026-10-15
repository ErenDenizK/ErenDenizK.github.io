# ADR-0004: Work on dev; main holds only owner-approved releases

**Status:** accepted 2026-10-08 by the owner

## Decision

1. All work happens on `dev` (agents commit and push there).
2. `main` changes only when the owner decides a release (v1 and later) and merges it by hand.
   Agents never push to `main` or merge into it.
3. The public site deploys from `main`, so nothing reaches visitors without the owner's merge.
   A preview of `dev` may be built separately for review.

## Amendment 2026-10-09

The owner chose to publish from `dev` during the build-up, so pushes to `dev` deploy the site.
Agents still never push to or merge into `main`. Because every push to `dev` is now live, a
push must pass the local gates (`npm run verify`) first, and work in progress stays on topic
branches or in scratch until it does.

## Note 2026-10-15: dev deploys only after CI passes

Technique only; the branch policy above does not change. Until now `deploy.yml` ran on every push
to `dev` beside CI and did not wait for it, so a red push still went live. Now CI calls the deploy
workflow as its last job (`needs: check`, pushes to `dev` only), so a push to `dev` reaches the site
only when every gate in CI passed on that commit. One workflow is used rather than `workflow_run`,
which only fires from the workflow file on the default branch. A push to `main` (the owner's merge)
and a manual run still deploy directly. `npm run verify` before every push stays the rule: CI is
the backstop, not the first check. A newer push to `dev` cancels the older CI run, its deploy
included, and deploys in its place.
