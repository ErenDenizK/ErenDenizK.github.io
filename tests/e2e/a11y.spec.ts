/* `page as any`: @axe-core/playwright types a newer Playwright than the one pinned here. */
/* axe on every route template (ADR-0001 item 6): no serious or critical violations. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { desktop, phone } from './helpers';

const ROUTES = ['', 'work/', 'work/recto/', 'log/', 'about/', 'nope/'];
for (const [size, opts] of [['desktop', desktop], ['phone', phone]] as const) {
  test.describe(size, () => {
    test.use(opts);
    for (const r of ROUTES) {
      test(`axe /${r}`, async ({ page }) => {
        await page.goto(r + '?still');
        const res = await new AxeBuilder({ page: page as any }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      });
    }
  });
}
test.describe('focus view', () => {
  test.use(desktop);
  test('axe with the sheet open', async ({ page }) => {
    await page.goto('work/?still');
    await page.click('#main a[data-p="recto"]');
    await page.waitForTimeout(1500);
    const res = await new AxeBuilder({ page: page as any }).include('#focus').analyze();
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
});
