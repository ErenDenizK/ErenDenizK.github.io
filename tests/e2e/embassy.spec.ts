/* The embassies (docs/design/family.md §3.1): porch, a still threshold, the product's world, the foot.
   Checks the world's tokens reach the page, the light moves only as the product's light moves (and only
   in view), the signature clip plays only in view and alone, and every still twin holds. The values
   themselves are checked against the family kit in tests/worlds.mjs. */
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { desktop, phone, settle } from './helpers';

const world = (slug: string) => JSON.parse(fs.readFileSync(`content/projects/${slug}/world.json`, 'utf8'));
const rgb = (hex: string) => `rgb(${hex.slice(1).match(/../g)!.map((x) => parseInt(x, 16)).join(', ')})`;
const centre = (page: Page, sel: string) => page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'center' }), sel);

test.describe('desktop', () => {
  test.use(desktop);

  test('each embassy carries its world', async ({ page }) => {
    for (const slug of ['recto', 'english-prep', 'eat-map']) {
      const w = world(slug);
      await page.goto(`work/${slug}/`); await settle(page, 300);
      const got = await page.evaluate(() => {
        const emb = document.querySelector('#main .emb') as HTMLElement;
        const th = document.querySelector('#main .emb-threshold') as HTMLElement;
        const prose = document.querySelector('#main .emb .prose, #main .emb-line') as HTMLElement;
        const field = document.querySelector('#main .kl-field') as HTMLElement;
        return {
          ground: getComputedStyle(emb).backgroundColor, threshold: th.getBoundingClientRect().height,
          ink: getComputedStyle(prose).color, cap: getComputedStyle(field).opacity,
          promise: document.querySelector('#main .emb-line')?.textContent, caps: document.querySelectorAll('#main .cap:not(.clip)').length,
          clips: document.querySelectorAll('#main [data-clip]').length, videos: document.querySelectorAll('#main .emb video').length,
        };
      });
      expect(got.ground, slug).toBe(rgb(w.ground.base));
      expect(got.threshold, slug).toBe(200);
      expect(got.ink, slug).toBe(rgb(w.ink.primary));
      expect(+got.cap, slug).toBeCloseTo(w.light.cap, 2);
      expect(got.promise, slug).toBe(w.promise.text);
      expect(got.videos, slug + ': at most one video').toBeLessThanOrEqual(1);
      if (slug === 'eat-map') { expect(got.caps).toBe(0); expect(got.clips).toBe(0); }   // hidden until captured
      else expect(got.caps).toBeGreaterThan(0);
    }
  });

  test('the light moves as the product moves it, only in view', async ({ page }) => {
    /* a short window, so the porch alone fills it and the band starts below the fold */
    await page.setViewportSize({ width: 1440, height: 560 });
    await page.goto('work/english-prep/'); await settle(page, 300);
    const running = () => page.$eval('#main .kl-field', (f) => (f as HTMLElement).dataset.klRunning);
    expect(await page.$eval('#main .emb', (e) => e.getBoundingClientRect().top > innerHeight), 'the band is below the fold').toBe(true);
    expect(await running(), 'drift is paused while the band is off screen').toBe('false');
    await centre(page, '#main .emb-promise'); await page.waitForTimeout(300);
    expect(await running(), 'English Prep drifts in view').toBe('true');
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    expect(await running()).toBe('false');
    for (const slug of ['recto', 'eat-map']) {
      await page.goto(`work/${slug}/`); await settle(page, 300);
      await centre(page, '#main .emb-promise'); await page.waitForTimeout(300);
      expect(await running(), `${slug} never drifts`).toBe('false');
    }
  });

  test('the signature clip plays in view, alone, and rests on its poster', async ({ page }) => {
    await page.goto('work/recto/'); await settle(page, 600);
    const v = '#main [data-clip] video';
    expect(await page.$eval(v, (x) => !!x.querySelector('source[src]')), 'no sources before it is in view').toBe(false);
    await centre(page, '#main [data-clip]');
    await expect.poll(() => page.$eval(v, (x) => !(x as HTMLVideoElement).paused), { timeout: 8000 }).toBe(true);
    expect(await page.evaluate(() => [...document.querySelectorAll('video')].filter((x) => !x.paused).length), 'one playing video').toBe(1);
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
    expect(await page.$eval(v, (x) => (x as HTMLVideoElement).paused), 'paused out of view').toBe(true);
  });

  test('the sheet carries the same embassy', async ({ page }) => {
    await page.goto('work/'); await settle(page, 600);
    await page.click('#main a[data-p="english-prep"]'); await settle(page, 1200);
    await page.evaluate(() => document.querySelector('#focus .emb-promise')!.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400);
    expect(await page.$eval('#focus .kl-field', (f) => (f as HTMLElement).dataset.klRunning)).toBe('true');
    expect(await page.$eval('#sheet-scroll', (s) => s.scrollWidth - s.clientWidth), 'no sideways scroll').toBeLessThanOrEqual(0);
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    expect(await page.evaluate(() => [...document.querySelectorAll('video')].filter((x) => !x.paused && x.closest('#focus')).length)).toBe(0);
  });
});

test.describe('phone', () => {
  test.use(phone);
  test('the threshold is shorter and nothing scrolls sideways', async ({ page }) => {
    for (const slug of ['recto', 'english-prep', 'eat-map']) {
      await page.goto(`work/${slug}/`); await settle(page, 300);
      expect(await page.$eval('#main .emb-threshold', (t) => t.getBoundingClientRect().height), slug).toBe(120);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), slug).toBeLessThanOrEqual(0);
      expect(await page.$eval('#main .case-main', (m) => m.getBoundingClientRect().right <= innerWidth), slug + ': the column fits').toBe(true);
    }
  });
});

test('reduced motion: the light is still and the clip stays a poster', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('work/english-prep/'); await settle(page, 300);
  await page.evaluate(() => document.querySelector('#main [data-clip]')!.scrollIntoView({ block: 'center' })); await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({
    still: (document.querySelector('#main .kl-field') as HTMLElement).dataset.klStill,
    running: (document.querySelector('#main .kl-field') as HTMLElement).dataset.klRunning,
    anim: getComputedStyle(document.querySelector('#main .kl-source')!).animationName,
    src: !!document.querySelector('#main [data-clip] source[src]'),
  }));
  expect(s).toEqual({ still: 'true', running: 'false', anim: 'none', src: false });
  await ctx.close();
});
