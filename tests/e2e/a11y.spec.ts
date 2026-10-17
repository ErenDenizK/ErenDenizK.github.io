/* `page as any`: @axe-core/playwright types a newer Playwright than the one pinned here. */
/* axe on every route template (ADR-0001 item 6): no serious or critical violations. */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { desktop, phone } from './helpers';

/* the two-page site (ADR-0019): Home, a project's page, the Record, a year, the 404 */
const ROUTES = ['', 'work/recto/', 'record/', 'record/2026/', 'nope/'];
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
test.describe('an opened project', () => {
  test.use(desktop);
  test('axe with a project open over Home', async ({ page }) => {
    await page.goto('?still');
    await page.locator('.proj[data-k="0"] .btn').click();
    await expect(page.locator('.layer')).toHaveCount(1);
    await page.waitForTimeout(1800);
    const res = await new AxeBuilder({ page: page as any }).include('.layer').analyze();
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
});
