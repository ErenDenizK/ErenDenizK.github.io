/* The live frame engine behind ?live (ADR-0009, proposed): it boots and draws the Home object, the
   showcase's state axis reverses, reduced motion keeps the still, a software renderer without
   ?live=force falls back to the still, and without the flag the Home stage is exactly the current one
   (no engine loaded, no canvas, the idle loop as before). Headless Chromium renders WebGL2 on
   SwiftShader, a software renderer, so the booting tests force the engine past that gate. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone } from './helpers';

const SW = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
test.use({ launchOptions: SW });
const report = (page: Page) => page.evaluate(() => (window as any).__live?.report?.() ?? null);
const engineRequested = (page: Page) => page.evaluate(() => performance.getEntriesByType('resource').some((e) => /\/engine\.[\w-]+\.js$/.test(e.name)));

test.describe('live frames, desktop', () => {
  test.use({ ...desktop });

  test('?live boots the engine on the Home stage and draws exact frames', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('?live=force&watchdog=0');
    const stage = page.locator('.media.stage');
    await expect(stage.locator('.m-layer.live-on canvas')).toHaveCount(1, { timeout: 30_000 });
    await expect(stage).toHaveClass(/live-on/);
    await expect.poll(async () => (await report(page))?.home?.have?.grid, { timeout: 30_000 }).toBe(true);
    const r = await report(page);
    expect(r.home.tier).toBe('full');
    expect(r.home.state).toBe('run');
    expect(r.home.frames).toBeGreaterThan(0);
    expect(r.home.memoryMB).toBeLessThanOrEqual(60);
    /* no idle video and no Canvas2D lean on a live slot */
    await expect(stage.locator('video.m-idle, .m-lean')).toHaveCount(0);
    /* the pointer leans the object; at rest it settles on an exact frame */
    await page.mouse.move(1400, 450, { steps: 6 });
    await expect.poll(async () => (await report(page)).home.yaw, { timeout: 20_000 }).toBeGreaterThan(4);
    await expect.poll(async () => (await report(page)).home.exact, { timeout: 20_000 }).toBe(true);
    /* the flag is remembered: the next page view without the query is live too */
    expect(await page.evaluate(() => localStorage.getItem('edk-live'))).toBe('1');
    await expect(page.locator('.live-chip')).toContainText('Live frames');
    expect(errors).toEqual([]);
  });

  test('the showcase fan is a state axis that reverses on leave', async ({ page }) => {
    await page.goto('?live=force&watchdog=0&float=0');
    const slot = page.locator('.media[data-slot="showcase"]');
    await slot.scrollIntoViewIfNeeded();
    await page.mouse.move(700, 890);
    await expect.poll(async () => (await report(page))?.showcase?.have?.clip, { timeout: 40_000 }).toBe(true);
    const b = (await slot.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
    await expect.poll(async () => (await report(page)).showcase.axis, { timeout: 20_000 }).toBeGreaterThan(0.95);
    await page.mouse.move(b.x + b.width * 1.6, b.y + b.height / 2, { steps: 2 });
    await expect.poll(async () => (await report(page)).showcase.axis, { timeout: 20_000 }).toBe(0);
  });

  test('a software renderer without force falls back to the still', async ({ page }) => {
    await page.goto('?live');
    await expect.poll(async () => (await report(page))?.home?.state, { timeout: 30_000 }).toBe('still');
    expect((await report(page)).home.reason).toBe('software renderer');
    await expect(page.locator('.media.stage canvas')).toHaveCount(0);
    await expect(page.locator('.media.stage .m-poster')).toBeVisible();
    await page.goto('?live=0');
    expect(await page.evaluate(() => localStorage.getItem('edk-live'))).toBeNull();
  });
});

test('live frames, reduced motion: no engine slot, the poster stays', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('?live=force');
  await expect.poll(async () => (await report(page))?.still?.page, { timeout: 20_000 }).toBe('reduced motion');
  await page.waitForTimeout(1500);
  await expect(page.locator('.media canvas')).toHaveCount(0);
  await expect(page.locator('.media.stage .m-poster')).toBeVisible();
  await expect(page.locator('.media video')).toHaveCount(0);
  await expect(page.locator('.live-chip')).toContainText('reduced motion');
  await ctx.close();
});

test.describe('live frames, phone', () => {
  test.use({ ...phone });

  test('a phone gets the phone tier: the rest frame, its normals, a few KB', async ({ page }) => {
    await page.goto('?live=force&watchdog=0');
    await expect.poll(async () => (await report(page))?.home?.state, { timeout: 30_000 }).toBe('run');
    const r = await report(page);
    expect(r.home.tier).toBe('phone');
    expect(r.home.bytes).toBeLessThan(40_000);
    expect(r.home.memoryMB).toBeLessThanOrEqual(4);
  });
});

test.describe('default path', () => {
  test.use({ ...desktop });

  test('without the flag the Home stage is the current one and the engine is never loaded', async ({ page }) => {
    await page.goto('');
    await page.mouse.move(1300, 400, { steps: 4 });
    /* the current stage enhances as before: the Canvas2D lean on pointer move */
    await page.waitForTimeout(3000);
    await page.mouse.move(200, 400, { steps: 6 });
    await expect(page.locator('.media.stage .m-lean canvas')).toHaveCount(1, { timeout: 20_000 });
    await expect(page.locator('.m-live, .live-chip')).toHaveCount(0);
    expect(await engineRequested(page)).toBe(false);
    expect(await report(page)).toBeNull();
  });
});
