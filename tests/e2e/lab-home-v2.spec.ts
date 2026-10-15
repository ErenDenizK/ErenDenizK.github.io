/* The Home prototype V2 "Strips" (src/pages/lab/home-v2.astro): hidden like the other workbenches
   (noindex, out of the sitemap), its object switch works from the address, and its still twins are
   complete: with ?still, under reduced motion and without JavaScript nothing waits at opacity 0. */
import { test, expect } from '@playwright/test';
import { desktop, phone } from './helpers';

const hidden = (page: import('@playwright/test').Page) => page.evaluate(() =>
  [...document.querySelectorAll<HTMLElement>('.hv2 [data-a]')].filter((el) => +getComputedStyle(el).opacity < 1).length);

test.describe('desktop', () => {
  test.use(desktop);

  test('the V2 lab is hidden, and every project row opens its project', async ({ page, request }) => {
    await page.goto('lab/home-v2/?still');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('h1')).toHaveText('Eren Deniz Kuyucaklıoğlu');
    await expect(page.locator('.row.p-open')).toHaveCount(3);
    for (const id of ['recto', 'english-prep', 'eat-map']) await expect(page.locator(`.row[data-p="${id}"]`)).toHaveAttribute('href', new RegExp(`work/${id}/$`));
    expect(await hidden(page)).toBe(0);
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/lab/');
  });

  test('?obj= picks the object: none by default, the mark, or the live object', async ({ page }) => {
    await page.goto('lab/home-v2/?still');
    await expect(page.locator('.hv2-obj-mark')).toBeHidden();
    await expect(page.locator('.hv2-obj-small')).toBeHidden();
    await page.goto('lab/home-v2/?still&obj=mark');
    await expect(page.locator('.hv2-obj-mark')).toBeVisible();
    await page.goto('lab/home-v2/?still&obj=small');
    await expect(page.locator('.hv2-obj-small')).toBeVisible();
    /* the object never makes the intro taller: the Today strip starts at the same place */
    const top = () => page.locator('#h-today').evaluate((el) => Math.round(el.getBoundingClientRect().top + scrollY));
    const withObj = await top();
    await page.goto('lab/home-v2/?still&obj=none');
    expect(await top()).toBe(withObj);
  });

  test('the arrival settles: after it, nothing is hidden or moved', async ({ page }) => {
    await page.goto('lab/home-v2/');
    await expect(page.locator('html')).toHaveClass(/hv2-in/);
    await expect.poll(() => hidden(page), { timeout: 3000 }).toBe(0);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => (a as CSSAnimation).animationName?.startsWith('hv2') && a.playState === 'running').length)).toBe(0);
  });
});

test.describe('still twins', () => {
  test.use(desktop);
  test('reduced motion: no arrival', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('lab/home-v2/');
    await expect(page.locator('html')).not.toHaveClass(/hv2-in/);
    expect(await hidden(page)).toBe(0);
  });
});

test.describe('no JavaScript', () => {
  test.use({ ...desktop, javaScriptEnabled: false });
  test('every strip is there and visible', async ({ page }) => {
    await page.goto('lab/home-v2/');
    expect(await hidden(page)).toBe(0);
    expect(await page.locator('.strip').count()).toBeGreaterThanOrEqual(6);
    await expect(page.getByRole('link', { name: 'GitHub' }).last()).toBeVisible();
  });
});

test.describe('phone', () => {
  test.use(phone);
  test('one column, no sideways scroll, the name near the top', async ({ page }) => {
    await page.goto('lab/home-v2/?still');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    const box = (await page.locator('h1').boundingBox())!;
    expect(box.y).toBeLessThan(64 + 130);
    /* labels sit above their content below 768 px */
    const label = (await page.locator('#h-today').boundingBox())!;
    const body = (await page.locator('.hv2-lede').boundingBox())!;
    expect(label.y + label.height).toBeLessThanOrEqual(body.y);
  });
});
