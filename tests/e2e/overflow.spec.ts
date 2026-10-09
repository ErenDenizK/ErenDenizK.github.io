/* Nothing scrolls sideways (brief §7, 2026-10-09 after v0: "the focus view must not scroll sideways"):
   every page at every size, and the project sheet's own scroller at the two sheet sizes. The sheet is
   also pushed sideways, since a clipped scroller with hidden content could still be scrolled by script
   or a trackpad. */
import { test, expect } from '@playwright/test';
import { desktop, tablet, phone, settle, PROJECTS } from './helpers';

const PAGES = ['', 'work/', 'record/', 'about/', ...PROJECTS.map((p) => `work/${p}/`), 'nope/'];

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
    if (size !== 'phone') test(`the sheet does not scroll sideways at ${size}`, async ({ page }) => {
      for (const slug of PROJECTS) {
        await page.goto('work/?still'); await settle(page, 400);
        await page.click(`#main a[data-p="${slug}"]`);
        await expect(page.locator('#focus')).toHaveAttribute('open', '');
        await settle(page, 700);
        const r = await page.evaluate(() => {
          const s = document.getElementById('sheet-scroll')!;
          s.scrollLeft = 200;
          return { over: s.scrollWidth - s.clientWidth, left: s.scrollLeft, doc: document.documentElement.scrollWidth - innerWidth };
        });
        expect(r.over, `${slug}: sheet content is ${r.over}px wider than the sheet`).toBeLessThanOrEqual(0);
        expect(r.left, `${slug}: sheet scrolled sideways`).toBe(0);
        expect(r.doc, `${slug}: page behind the sheet overflows`).toBeLessThanOrEqual(0);
      }
    });
  });
}
