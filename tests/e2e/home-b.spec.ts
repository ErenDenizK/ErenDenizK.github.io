/* Home, direction B, on its lab page /lab/home-b/ (docs/research/2026-10-home-b.md). The name composes
   itself once per visit and the family's colours cross it; the dot after it changes the site's light; the
   sky names Istanbul's phase of the day; the latest record entry says how long ago; the first scroll docks
   the name into the bar's mark; "Now building" is one pinned stage that steps through the products by
   the reading position; every effect has a still twin (reduced motion, no JavaScript, phones). */
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { desktop, phone, settle } from './helpers';

const site = JSON.parse(fs.readFileSync('content/site.json', 'utf8'));
/* direction B lives on a lab page while the live Home is direction A (lead, 2026-10-11) */
const B = 'lab/home-b/';
const accent = (page: Page) => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent').trim());
/* the letters' own animations (the dot may still pop on a composed arrival) */
const running = (page: Page) => page.evaluate(() => document.getAnimations().filter((a) => (a as any).effect?.target?.classList?.contains('ch')).length);

test.describe('Home B, desktop', () => {
  test.use(desktop);

  test('the hero: the name in letters, read whole; the vision from content; the edk stage', async ({ page }) => {
    await page.goto(B + '?still'); await settle(page, 300);
    const h1 = page.locator('#main h1');
    await expect(h1.locator('.vh')).toHaveText(site.name);
    expect(await h1.locator('.ch').count()).toBe(site.name.replace(/\s/g, '').length);
    expect(await h1.locator('.ch.ini .lc').allTextContents()).toEqual(['e', 'd', 'k']);
    await expect(h1.locator('.hb-letters')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.hb-v')).toHaveText(site.homeB.vision.text);
    await expect(page.locator('.media.stage[data-slot="home"]')).toHaveCount(1);
    await expect(page.locator('.media[data-slot="showcase"]')).toHaveCount(1);
    /* the first screen holds the name, the vision and "now" */
    const row = (await page.locator('.hb-row').boundingBox())!;
    expect(row.y + 120).toBeLessThan(900);
    /* the name fills the column without leaving the page */
    const n = (await page.locator('.hb-l2').boundingBox())!;
    expect(n.width).toBeGreaterThan(1000);
    expect(n.x + n.width).toBeLessThanOrEqual(1440);
  });

  test('the composition plays once per visit, and the second Home arrives composed', async ({ page }) => {
    await page.goto(B + '');
    await expect.poll(() => running(page)).toBeGreaterThan(0);
    await page.waitForTimeout(3600);
    await page.goto(B + '');
    expect(await page.evaluate(() => document.documentElement.classList.contains('hb-seen'))).toBe(true);
    expect(await running(page)).toBe(0);
  });

  test('the sky names the phase in Istanbul, the latest entry says how long ago', async ({ page }) => {
    await page.goto(B + '?still'); await settle(page, 300);
    const phases = Object.values(site.homeB.sky.phases).join('|');
    await expect(page.locator('[data-phase]')).toHaveText(new RegExp(`^(${phases}) in ${site.homeB.sky.place}$`));
    await expect(page.locator('.hb-skyline')).toHaveClass(/on/);
    await expect(page.locator('.hb-latest time[data-ago]')).toHaveText(/today|yesterday|ago/);
  });

  test('the dot changes the light of the whole site, and comes back round', async ({ page }) => {
    await page.goto(B + '?still'); await settle(page, 400);
    const btn = page.locator('.hb-dot-btn');
    await expect(btn).toHaveAccessibleName(site.homeB.index.light);
    const n = (await page.locator('.hb-hero').getAttribute('data-lights'))!.split('|').length;
    const seen = [await accent(page)];
    for (let i = 0; i < n; i++) { await btn.click(); seen.push(await accent(page)); }
    expect(new Set(seen.slice(0, n)).size).toBe(n);
    expect(seen[n]).toBe(seen[0]);
    /* the button sits on the dot */
    const d = (await page.locator('.hb-dot').boundingBox())!, b = (await btn.boundingBox())!;
    expect(Math.abs(d.x + d.width / 2 - (b.x + b.width / 2))).toBeLessThan(3);
  });

  test('the first scroll docks the name into the mark, and scrolling back sets it again', async ({ page }) => {
    await page.goto(B + '?'); await page.waitForTimeout(3600);
    const k = page.locator('.hb-name .ch.ini').nth(2);
    const mark = (await page.locator('.bar .mark').boundingBox())!;
    await page.evaluate(() => scrollTo(0, innerHeight * 0.3)); await page.waitForTimeout(250);
    const mid = (await k.boundingBox())!;
    await page.evaluate(() => scrollTo(0, innerHeight * 0.59)); await page.waitForTimeout(250);
    const end = (await k.boundingBox())!;
    expect(end.height).toBeLessThan(mid.height);
    expect(Math.abs(end.y + end.height / 2 - (mark.y + mark.height / 2))).toBeLessThan(30);
    expect(end.x).toBeLessThan(mark.x + mark.width);
    await page.evaluate(() => scrollTo(0, innerHeight)); await page.waitForTimeout(300);
    await expect(page.locator('.bar .mark')).toHaveCSS('opacity', '1');
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    expect(await k.evaluate((el) => el.style.transform)).toBe('');
  });

  test('now building: one pinned stage, the act follows the reading position, the light follows the act', async ({ page }) => {
    await page.goto(B + '?still'); await settle(page, 300);
    const g = await page.evaluate(() => { const s = document.querySelector<HTMLElement>('.hb-show')!; return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, n: s.querySelectorAll('.hb-act').length }; });
    expect(g.n).toBe(3);
    const order: string[] = [];
    for (let i = 0; i < g.n; i++) {
      await page.evaluate((y) => scrollTo(0, y), Math.round(g.top + (g.h - 900) * (i + 0.5) / g.n));
      await page.waitForTimeout(500);
      const on = page.locator('.hb-act.is-on');
      await expect(on).toHaveCount(1);
      order.push((await on.getAttribute('data-plate'))!);
      expect((await page.locator('.hb-show-stage').boundingBox())!.y).toBe(0);
      expect(await accent(page)).toBe(await on.getAttribute('data-light'));
      await expect(on.locator('.hb-pt .wm')).toBeVisible();
    }
    expect(order[0]).toBe('recto');   // `featured` leads
    expect(new Set(order).size).toBe(3);
    /* the index names every product and opens it */
    await page.locator('.hb-index a[data-p="english-prep"]').click();
    await expect(page.locator('#focus')).toHaveAttribute('open', '');
  });

  test('reduced motion: no composition, no docking, the light stands still', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto(B + ''); await settle(page, 500);
    expect(await running(page)).toBe(0);
    await page.evaluate(() => scrollTo(0, innerHeight * 0.4)); await page.waitForTimeout(300);
    expect(await page.locator('.hb-name .ch.ini').first().evaluate((el) => el.style.transform)).toBe('');
    await ctx.close();
  });

  test('without JavaScript: the whole page, the acts one under another, no dead control', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto(B + '');
    await page.waitForTimeout(3000);
    await expect(page.locator('.hb-dot-btn')).toHaveCount(0);
    for (const a of await page.locator('.hb-act').all()) await expect(a.locator('.hb-pt .wm')).toBeVisible();
    const ys = await page.locator('.hb-act').evaluateAll((as) => as.map((a) => a.getBoundingClientRect().top));
    expect(ys[1]).toBeGreaterThan(ys[0] + 300);
    await expect(page.locator('.hb-name .ch').last()).toHaveCSS('opacity', '1');
    await ctx.close();
  });
});

test.describe('Home B, phone', () => {
  test.use(phone);

  test('the name stacks, the object stays beside it, nothing leaves the page', async ({ page }) => {
    await page.goto(B + '?still'); await settle(page, 400);
    const l1 = await page.locator('.hb-l1 .hb-w').evaluateAll((ws) => ws.map((w) => w.getBoundingClientRect().top));
    expect(l1[1]).toBeGreaterThan(l1[0] + 40);
    const l2 = (await page.locator('.hb-l2').boundingBox())!;
    expect(l2.x + l2.width).toBeLessThanOrEqual(390);
    expect(l2.width).toBeGreaterThan(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const row = (await page.locator('.hb-v').boundingBox())!;
    expect(row.y).toBeLessThan(844);
  });

  test('a touch on the name sends the colours through it; the stage pins on a phone too', async ({ page }) => {
    await page.goto(B + '?'); await page.waitForTimeout(3600);
    const n = (await page.locator('.hb-l2').boundingBox())!;
    await page.touchscreen.tap(n.x + 60, n.y + n.height / 2);
    await expect(page.locator('.hb-name')).toHaveClass(/sweep/);
    const top = await page.evaluate(() => { const s = document.querySelector<HTMLElement>('.hb-show')!; return s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.5; });
    await page.evaluate((y) => scrollTo(0, y), Math.round(top)); await page.waitForTimeout(600);
    expect((await page.locator('.hb-show-stage').boundingBox())!.y).toBe(0);
    await expect(page.locator('.hb-act.is-on')).toHaveAttribute('data-plate', 'english-prep');
    /* the bar stays while the name docks, so the mark is there to receive it */
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.mouse.wheel(0, 200);
    await page.evaluate(() => scrollTo(0, 260)); await page.waitForTimeout(300);
    await expect(page.locator('#bar')).not.toHaveClass(/tucked/);
  });
});
