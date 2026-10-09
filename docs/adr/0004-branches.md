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
