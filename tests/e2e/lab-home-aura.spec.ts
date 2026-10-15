/* The page light and the column of the three Home prototypes (src/styles/lab-aura.css): ?aura= and ?col=
   switch them, the panel's links do the same without JavaScript (by their #targets), the default is lit,
   and no level or column makes a phone scroll sideways. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone } from './helpers';

const PAGES = [
  { v: 'v1', root: '#v1', q: '?panel=0', col: 'centre', cols: ['left', 'centre'] },
  { v: 'v2', root: '#hv2', q: '?', col: 'centre', cols: ['left', 'centre'] },
  { v: 'v3', root: '#h3', q: '?', col: 'split', cols: ['split', 'left', 'centre'] },
];
/** The light level in effect (from the level's own token) and whether the old pool or the new one shows. */
const light = (page: Page, root: string) => page.evaluate((r) => {
  const el = document.querySelector<HTMLElement>(r)!;
  const e1 = getComputedStyle(el).getPropertyValue('--ha-e1').trim();
  const pools = [...el.querySelectorAll('.ha-p')].filter((p) => getComputedStyle(p).display !== 'none').length;
  return { level: e1 === '20%' ? 'lit' : e1 === '30%' ? 'rich' : 'live', pools, col: el.dataset.col };
}, root);

for (const { v, root, q, col, cols } of PAGES) {
  test.describe(`home ${v}`, () => {
    test.use(desktop);

    test('lit by default; ?aura and ?col switch the light and the column', async ({ page }) => {
      await page.goto(`lab/home-${v}/${q}`);
      expect(await light(page, root)).toMatchObject({ level: 'lit', col });
      expect((await light(page, root)).pools).toBeGreaterThanOrEqual(3);
      await page.goto(`lab/home-${v}/${q}&aura=live&col=left`);
      expect(await light(page, root)).toMatchObject({ level: 'live', pools: 0, col: 'left' });
      await page.goto(`lab/home-${v}/${q}&aura=rich`);
      expect((await light(page, root)).level).toBe('rich');
    });

    test('without JavaScript the panel links still switch, by their #targets', async ({ browser }) => {
      const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(`lab/home-${v}/`);
      expect((await light(page, root)).level).toBe('lit');
      const rich = page.locator('a[href$="#aura-rich"]');
      await expect(rich).toHaveCount(1);
      await page.goto(`lab/home-${v}/` + (await rich.getAttribute('href')));
      expect((await light(page, root)).level).toBe('rich');
      for (const c of cols) await expect(page.locator(`a[href$="#col-${c}"]`)).toHaveCount(1);
      await ctx.close();
    });
  });

  test.describe(`home ${v} on a phone`, () => {
    test.use(phone);

    test('no level and no column scrolls sideways', async ({ page }) => {
      for (const a of ['live', 'lit', 'rich']) for (const c of cols) {
        await page.goto(`lab/home-${v}/${q}&aura=${a}&col=${c}`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${a} ${c}`).toBeLessThanOrEqual(0);
      }
    });
  });
}
