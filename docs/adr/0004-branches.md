# ADR-0004: Work on dev; main holds only owner-approved releases

**Status:** accepted 2026-10-08 by the owner

## Decision

1. All work happens on `dev` (agents commit and push there).
2. `main` changes only when the owner decides a release (v1 and later) and merges it by hand.
   Agents never push to `main` or merge into it.
3. The public site deploys from `main`, so nothing reaches visitors without the owner's merge.
   A preview of `dev` may be built separately for review.
