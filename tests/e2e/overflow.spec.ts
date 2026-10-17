/* Nothing scrolls sideways (brief §7, 2026-10-09 after v0: "the focus view must not scroll sideways"):
   every page of the two-page site at every size (ADR-0019), and a project opened as a layer over Home. The
   layer is also pushed sideways, since a clipped scroller with hidden content could still be scrolled by
   script or a trackpad. */
import { test, expect } from '@playwright/test';
import { desktop, tablet, phone, settle, PROJECTS } from './helpers';

const PAGES = ['', 'record/', 'record/2026/', ...PROJECTS.map((p) => `work/${p}/`), 'nope/'];

for (const [size, opts] of [['desktop', desktop], ['tablet', tablet], ['phone', phone]] as const) {
  test.describe(size, () => {
    test.use(opts);
    test(`no page scrolls sideways at ${size}`, async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(path + '?still'); await settle(page, 300);
        const over = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
        expect(over, `/${path} overflows by ${over}px`).toBeLessThanOrEqual(0);
      }
    });
    test(`an opened project does not scroll sideways at ${size}`, async ({ page }) => {
      for (const [k, slug] of PROJECTS.entries()) {
        await page.goto('?still'); await settle(page, 400);
        await page.locator(`.proj[data-k="${k}"] .btn`).click();
        await expect(page.locator('.layer')).toHaveCount(1);
        await settle(page, 1700);
        const r = await page.evaluate(() => {
          const s = document.querySelector<HTMLElement>('.layer')!;
          s.scrollLeft = 200;
          return { over: s.scrollWidth - s.clientWidth, left: s.scrollLeft, doc: document.documentElement.scrollWidth - innerWidth };
        });
        expect(r.over, `${slug}: the layer's content is ${r.over}px wider than the layer`).toBeLessThanOrEqual(0);
        expect(r.left, `${slug}: the layer scrolled sideways`).toBe(0);
        expect(r.doc, `${slug}: Home behind the layer overflows`).toBeLessThanOrEqual(0);
      }
    });
  });
}
