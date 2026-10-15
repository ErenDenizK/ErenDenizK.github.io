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
  /* a switch reloads with ?t= (the rail resolves its colours when it starts), in the same place, with the
     same button focused */
  await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
  await page.getByRole('button', { name: /Paper/ }).click();
  await page.waitForURL(/[?&]t=b\b/);
  await expect(page.locator('#lab-t')).toHaveAttribute('data-t', 'b');
  await expect(page.getByRole('button', { name: /Paper/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Paper/ })).toBeFocused();
  expect(await ground(page)).toBe('rgb(242, 239, 232)');
  expect(Math.abs((await page.evaluate(() => scrollY)) - 300)).toBeLessThan(2);
  /* the Work bead is lit in the paper candidate's Recto ink, not in the graphite one it started with */
  await expect.poll(() => page.evaluate(() => (document.querySelectorAll<HTMLElement>('#rail .rail-m')[2]?.style.getPropertyValue('--a') ?? ''))).toBe('rgb(85 116 8)');
  /* D cycles its moods with one button that names the current and the next */
  await page.getByRole('button', { name: /Moods/ }).click();
  await page.waitForURL(/[?&]t=d\b/);
  const mood = page.locator('[data-mood]');
  await expect(mood).toBeVisible();
  await mood.click();
  await page.waitForURL(/[?&]t=d-ink\b/);
  await expect(page.locator('#lab-t')).toHaveAttribute('data-t', 'd-ink');
  await expect(mood).toHaveText('Mood: Ink blue. Next: Umber');
  await expect(mood).toBeFocused();
  const sitemap = await (await request.get('sitemap-0.xml')).text();
  expect(sitemap).not.toContain('/lab/');
});

/* The live theme is Graphite (ADR-0016): the ground is #121214 in the stylesheet, and the theme-color meta
   and the web manifest (src/lib/theme.ts, which cannot read the stylesheet) say the same. */
test('a live page never carries the lab candidates, and its ground is Graphite everywhere', async ({ page, request }) => {
  await page.goto('?still');
  expect(await page.locator('#lab-t').count()).toBe(0);
  expect(await ground(page)).toBe('rgb(18, 18, 20)');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe('rgb(18, 18, 20)');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121214');
  const manifest = await (await request.get('manifest.webmanifest')).json();
  expect([manifest.theme_color, manifest.background_color]).toEqual(['#121214', '#121214']);
});
