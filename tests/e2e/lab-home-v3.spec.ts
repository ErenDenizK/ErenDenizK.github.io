/* The Home prototype V3 (src/pages/lab/home-v3.astro): hidden like the other workbenches (noindex, out
   of the sitemap), its options switch by query, and its still twins (no JavaScript, reduced motion,
   ?still) show the whole page at once. */
import { test, expect } from '@playwright/test';
import { desktop, phone } from './helpers';

const PATH = 'lab/home-v3/';
/* every element of the arrival sequence, as the visitor sees it now */
const steps = (page: import('@playwright/test').Page) => page.evaluate(() =>
  [...document.querySelectorAll<HTMLElement>('.h3 [data-s]')].filter((el) => el.offsetParent).map((el) => +getComputedStyle(el).opacity));

test.describe('desktop', () => {
  test.use(desktop);

  test('the V3 lab is hidden and its object and statement switch by query', async ({ page, request }) => {
    await page.goto(PATH);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/lab/');
    /* defaults: the edk object and statement A, the live ID-card line */
    await expect(page.locator('.h3-o-mark')).toBeVisible();
    await expect(page.locator('.h3-o-small')).toBeHidden();
    await expect(page.locator('.h3-st:visible')).toHaveText('Fundamentals by hand, products by directing agents.');
    await page.goto(PATH + '?obj=small&st=b');
    await expect(page.locator('.h3-o-small img')).toBeVisible();
    await expect(page.locator('.h3-o-mark')).toBeHidden();
    await expect(page.locator('.h3-st:visible')).toHaveAttribute('data-st', 'b');
    await page.goto(PATH + '?obj=none&samples=0');
    await expect(page.locator('.h3-obj')).toBeHidden();
    await expect(page.locator('.h3-rec')).toBeHidden();
    await expect(page.locator('.h3-rec-alt')).toBeVisible();
    /* the panel keeps the other options when one changes */
    await expect(page.locator('.h3-lab a[data-k="st"][data-v="c"]')).toHaveAttribute('href', /obj=none/);
  });

  test('the arrival settles, and every project row opens its project', async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator('html')).toHaveClass(/h3-go/);
    await expect.poll(async () => Math.min(...(await steps(page))), { timeout: 3000 }).toBe(1);
    await expect(page.locator('html')).not.toHaveClass(/h3-go/, { timeout: 3000 });
    const hrefs = await page.locator('.h3-row').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).pathname));
    expect(hrefs).toEqual(['/Portfolio/work/recto/', '/Portfolio/work/english-prep/', '/Portfolio/work/eat-map/']);
  });
});

test.describe('still twins', () => {
  test.use(phone);

  test('reduced motion: no arrival, everything at rest from the first frame', async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(PATH);
    await expect(page.locator('html')).not.toHaveClass(/h3-go/);
    expect(Math.min(...(await steps(page)))).toBe(1);
    await ctx.close();
  });

  test('without JavaScript the page is complete and nothing is hidden', async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(PATH);
    expect(Math.min(...(await steps(page)))).toBe(1);
    await expect(page.locator('.h3-o-mark .m-poster')).toBeVisible();
    await expect(page.locator('.h3-row')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await ctx.close();
  });
});
