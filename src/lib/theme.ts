/** The page ground (--ground in src/styles/global.css) for the places that cannot read a CSS variable:
    the theme-color meta (layouts/Base.astro) and the web manifest (pages/manifest.webmanifest.ts).
    tests/e2e/lab-themes.spec.ts fails when this and the stylesheet disagree (ADR-0016). */
export const GROUND = '#121214';
