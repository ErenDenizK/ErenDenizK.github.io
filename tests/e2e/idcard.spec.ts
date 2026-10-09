/* The ID card on About and the postcard (ADR-0008): both turn over by keyboard and by pointer, the
   hidden face is never reachable, the front links work without turning, a drag swings the card without
   turning it, and the still twins hold (touch, reduced motion, no JavaScript). */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone } from './helpers';

const flipped = (page: Page, sel = '.idc') => page.locator(sel).first().evaluate((e) => e.classList.contains('is-flipped'));
const inert = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => (e as HTMLElement).inert);
const swing = (page: Page) => page.locator('.idc-swing').evaluate((e) => getComputedStyle(e).transform);
const atRest = (t: string) => t === 'none' || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t) || /^matrix\(1, -?0, -?0, 1, 0, 0\)$/.test(t);

test.describe('ID card, desktop', () => {
  test.use(desktop);

  test('turns over with the keyboard, and only the visible face is reachable', async ({ page }) => {
    await page.goto('about/?still');
    await expect(page.locator('.idc')).toHaveClass(/is-live/);
    expect(await flipped(page)).toBe(false);
    expect(await inert(page, '.idc-back')).toBe(true);
    /* the front's links work without turning the card */
    const front = page.locator('.idc-front a');
    await expect(front).toHaveCount(2);
    await expect(front.first()).toHaveAttribute('href', 'https://github.com/ErenDenizK');
    await expect(front.nth(1)).toHaveAttribute('href', /linkedin\.com\/in\//);

    await page.locator('.idc-front .idc-turn').focus();
    await page.keyboard.press('Enter');
    expect(await flipped(page)).toBe(true);
    expect(await inert(page, '.idc-front')).toBe(true);
    expect(await inert(page, '.idc-back')).toBe(false);
    await expect(page.locator('.idc-back .idc-turn')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.idc-back .idc-links a').first()).toBeFocused();

    await page.locator('.idc-back .idc-turn').focus();
    await page.keyboard.press('Space');
    expect(await flipped(page)).toBe(false);
    await expect(page.locator('.idc-front .idc-turn')).toBeFocused();
  });

  test('turns over on click; a drag swings it and does not turn it', async ({ page }) => {
    await page.goto('about/');
    await page.waitForTimeout(1600);
    const box = (await page.locator('.idc-card').boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height * 0.45;

    await page.mouse.click(cx, cy);
    expect(await flipped(page)).toBe(true);
    await page.waitForTimeout(700);
    await page.mouse.click(cx, cy);
    expect(await flipped(page)).toBe(false);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(1200);

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 140, cy + 20, { steps: 10 });
    expect(atRest(await swing(page)), 'the card follows the hand').toBe(false);
    await page.mouse.up();
    expect(await flipped(page), 'a drag is not a click').toBe(false);
    await page.mouse.move(10, 10);
    await expect.poll(async () => atRest(await swing(page)), { timeout: 5000, message: 'the card swings back to rest' }).toBe(true);
  });
});

test.describe('ID card, phone', () => {
  test.use(phone);
  test('tap turns it over; touch never drags; nothing overflows', async ({ page }) => {
    await page.goto('about/?still');
    const turn = page.locator('.idc-front .idc-turn');
    await turn.scrollIntoViewIfNeeded();
    await turn.tap();
    expect(await flipped(page)).toBe(true);
    await page.locator('.idc-back .idc-turn').tap();
    expect(await flipped(page)).toBe(false);
    expect(atRest(await swing(page))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test('reduced motion: the card hangs still and the turn is a crossfade', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  await page.locator('.idc-front .idc-turn').click();
  expect(await flipped(page)).toBe(true);
  expect(await page.locator('.idc-card').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  await expect.poll(() => page.locator('.idc-back').evaluate((e) => +getComputedStyle(e).opacity)).toBe(1);
  await expect.poll(() => page.locator('.idc-front').evaluate((e) => +getComputedStyle(e).opacity)).toBe(0);
  await ctx.close();
});

test('without JavaScript the front stands alone, links included; postcards show both sides', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  await expect(page.locator('.idc-front')).toBeVisible();
  await expect(page.locator('.idc-front a:visible')).toHaveCount(2);
  await expect(page.locator('.idc-back')).toBeHidden();
  await expect(page.locator('.idc-turn:visible')).toHaveCount(0);
  await page.goto('lab/postcard/');
  await expect(page.locator('.pc-back').first()).toBeVisible();
  await ctx.close();
});

test.describe('postcard workbench', () => {
  test.use(desktop);
  test('turns over by keyboard and pointer, and stays out of the sitemap', async ({ page, request }) => {
    await page.goto('lab/postcard/?still');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    const pc = '.pc >> nth=0';
    await page.locator('.pc').first().locator('.pc-front .pc-turn').focus();
    await page.keyboard.press('Enter');
    expect(await flipped(page, '.pc')).toBe(true);
    await expect(page.locator('.pc').first().locator('.pc-back .pc-turn')).toBeFocused();
    await page.waitForTimeout(600);
    await page.locator(pc).click();
    expect(await flipped(page, '.pc')).toBe(false);
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/lab/');
  });
});
