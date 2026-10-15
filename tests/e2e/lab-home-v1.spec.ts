/* The Home prototype V1 (src/pages/lab/home-v1.astro): hidden like the other workbenches (noindex, out of
   the sitemap, linked from no page), complete without its arrival, and its object switch keeps exactly
   one object option in the page. */
import { test, expect } from '@playwright/test';
import { desktop, phone } from './helpers';

test.describe('desktop', () => {
  test.use(desktop);

  test('home v1 is hidden: noindex, out of the sitemap, not linked from Home', async ({ page, request }) => {
    await page.goto('lab/home-v1/?still');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/lab/');
    await page.goto('?still');
    expect(await page.locator('a[href*="lab/"]').count()).toBe(0);
  });

  test('the object switch keeps one option; ?still shows everything at rest', async ({ page }) => {
    for (const [q, opt] of [['', 'mark'], ['obj=none', null], ['obj=small', 'small']] as const) {
      await page.goto(`lab/home-v1/?still&${q}`);
      await expect(page.locator('#v1')).toHaveAttribute('data-obj', q ? q.slice(4) : 'mark');
      expect(await page.locator('.v1-opt').count()).toBe(opt ? 1 : 0);
      if (opt) await expect(page.locator(`.v1-opt[data-opt="${opt}"]`)).toHaveCount(1);
    }
    await expect(page.locator('#v1')).not.toHaveClass(/\barrive\b/);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('#v1 [data-step]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
    expect(hidden).toBe(0);
    /* every project row and chip opens its project view */
    await expect(page.locator('#v1 a.p-open[data-p]')).toHaveCount(6);
  });

  test('the arrival settles: every step is fully visible after 1.5 s', async ({ page }) => {
    await page.goto('lab/home-v1/');
    await expect(page.locator('#v1')).toHaveClass(/\barrive\b/);
    await page.waitForTimeout(1500);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('#v1 [data-step]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
    expect(hidden).toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ ...desktop, javaScriptEnabled: false });

  test('the page is complete: the default object, every step visible, no arrival', async ({ page }) => {
    await page.goto('lab/home-v1/');
    await expect(page.locator('#v1')).toHaveAttribute('data-obj', 'mark');
    await expect(page.locator('#v1')).not.toHaveClass(/\barrive\b/);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('#v1 [data-step]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
    expect(hidden).toBe(0);
    await expect(page.locator('.v1-mark')).toBeVisible();
  });
});

test.describe('phone', () => {
  test.use(phone);

  test('no horizontal overflow and the name is one line at 390 px', async ({ page }) => {
    await page.goto('lab/home-v1/?still');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const h = await page.locator('#v1 h1').evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(h).toBeLessThan(1.5);
  });
});
