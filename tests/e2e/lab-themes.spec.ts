/* The theme lab (src/pages/lab/themes.astro): hidden like the other workbenches (noindex, out of the
   sitemap), and its switcher changes the candidate on that page only. The colours themselves are
   measured by npm run palette:lab, not here. */
import { test, expect } from '@playwright/test';
import { desktop } from './helpers';

test.use(desktop);

const ground = (page: import('@playwright/test').Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('the theme lab is hidden, starts on A, and its switcher changes the candidate', async ({ page, request }) => {
  await page.goto('lab/themes/?still');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('#lab-t')).toHaveAttribute('data-t', 'a');
  expect(await ground(page)).toBe('rgb(18, 18, 20)');
  await page.getByRole('button', { name: /Paper/ }).click();
  await expect(page.locator('#lab-t')).toHaveAttribute('data-t', 'b');
  await expect(page.getByRole('button', { name: /Paper/ })).toHaveAttribute('aria-pressed', 'true');
  expect(await ground(page)).toBe('rgb(242, 239, 232)');
  /* D cycles its moods with one button that names the current and the next */
  await page.getByRole('button', { name: /Moods/ }).click();
  const mood = page.locator('[data-mood]');
  await expect(mood).toBeVisible();
  await mood.click();
  await expect(page.locator('#lab-t')).toHaveAttribute('data-t', 'd-ink');
  await expect(mood).toHaveText('Mood: Ink blue. Next: Umber');
  const sitemap = await (await request.get('sitemap-0.xml')).text();
  expect(sitemap).not.toContain('/lab/');
});

test('a live page never carries the lab candidates', async ({ page }) => {
  await page.goto('?still');
  expect(await page.locator('#lab-t').count()).toBe(0);
  expect(await ground(page)).toBe('rgb(10, 10, 11)');
});
