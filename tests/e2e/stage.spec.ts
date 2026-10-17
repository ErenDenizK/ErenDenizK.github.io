/* The Record's recorder in its head (site audit 2026-10-10 §3-4; ADR-0006 amendment of 2026-10-10;
   ADR-0019: the object the owner loves, unchanged on the two-page Record): it leans toward a pointer near
   it and not one across the page, returns to rest when the pointer leaves the window, re-aims after a
   scroll, settles on an exact frame without turning back, hops from the rest pose when pressed while
   leaning, and reduced motion keeps the still poster. (The four-page Home's edk object and its droplet
   between tabs went with that page; no droplet plays between the two pages.) The lean's state is read from the layer (media.ts, `_seq`), as yaw in
   degrees from the rest pose, so the checks hold for any grid density (2026-10-10: 2° or 1° columns). */
import { test, expect, type Page } from '@playwright/test';
import { desktop } from './helpers';

const lean = (page: Page) => page.evaluate(() => {
  const l = document.querySelector('.rh .media .m-layer:not(.leaving)') as any;
  const q = l?._seq;
  const deg = (u: number) => (u * (q.m.cols - 1) - q.m.center.col) * (q.m.stepDeg?.yaw ?? 2);
  return q?.ok ? { u: deg(q.cur.u), tu: deg(q.target.u), centre: 0, exact: q.drawn.exact, on: l.classList.contains('seq-on'), clip: l.classList.contains('clip-on') } : null;
});

test.describe('the recorder, desktop', () => {
  test.use(desktop);

  async function ready(page: Page) {
    await page.goto('record/');
    const box = (await page.locator('.rh .media').boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx + 40, cy);
    await expect.poll(() => lean(page), { timeout: 20_000 }).not.toBeNull();
    return { cx, cy };
  }

  test('leans toward a pointer near it, not toward one across the page; rests on an exact frame', async ({ page }) => {
    const { cx, cy } = await ready(page);
    await page.mouse.move(cx + 260, cy, { steps: 8 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeGreaterThan(4);
    /* it comes to rest on an exact cell, never turning back by more than a hair after the hand stops */
    const seen: number[] = [];
    for (let i = 0; i < 14; i++) { seen.push((await lean(page))!.u); await page.waitForTimeout(50); }
    const back = seen.slice(1).reduce((a, u, i) => a + Math.max(0, seen[i] - u), 0);
    expect(back, `poses after the stop: ${seen.map((u) => u.toFixed(2)).join(' ')}`).toBeLessThan(0.1);
    await expect.poll(async () => (await lean(page))!.exact, { timeout: 3000 }).toBe(true);
    /* the text column is far away: the object goes back to rest */
    await page.mouse.move(120, cy, { steps: 8 });
    await expect.poll(async () => { const s = (await lean(page))!; return s.u === s.centre && s.tu === s.centre; }, { timeout: 5000 }).toBe(true);
  });

  test('returns to rest when the pointer leaves the window, and re-aims after a scroll', async ({ page }) => {
    const { cx, cy } = await ready(page);
    await page.mouse.move(cx - 260, cy, { steps: 6 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-4);
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave')));
    await expect.poll(async () => { const s = (await lean(page))!; return s.u === s.centre; }, { timeout: 5000 }).toBe(true);
    /* back near, then the page scrolls under a pointer that does not move: the object is carried away
       from the pointer and leans less, and leans again when it comes back */
    await page.mouse.move(cx - 300, cy + 200, { steps: 4 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-10);
    await page.waitForTimeout(600);
    const near = (await lean(page))!.tu;
    await page.mouse.wheel(0, 400);
    await expect.poll(async () => (await lean(page))!.tu, { timeout: 5000 }).toBeGreaterThan(near + 4);
    await page.mouse.wheel(0, -400);
    await expect.poll(async () => (await lean(page))!.tu, { timeout: 5000 }).toBeLessThan(near + 1);
  });

  test('a press while leaning glides to the rest pose and hops from there', async ({ page }) => {
    const { cx, cy } = await ready(page);
    await page.mouse.move(cx - 150, cy, { steps: 6 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-3);
    await page.evaluate(() => {
      const l = document.querySelector('.rh .media .m-layer:not(.leaving)') as any;
      (window as any).__hopAt = null;
      new MutationObserver(() => { if (l.classList.contains('clip-on') && (window as any).__hopAt === null) (window as any).__hopAt = (l._seq.cur.u - 0.5) * 32; }).observe(l, { attributes: true, attributeFilter: ['class'] });
    });
    await page.mouse.click(cx - 150, cy);
    await expect.poll(() => page.evaluate(() => (window as any).__hopAt), { timeout: 10_000 }).not.toBeNull();
    const at = await page.evaluate(() => (window as any).__hopAt);
    expect(Math.abs(at), 'the clip starts at the rest pose (degrees)').toBeLessThan(0.6);
    /* after the hop the lean comes back from the rest pose */
    await expect.poll(async () => (await lean(page))!.clip, { timeout: 8000 }).toBe(false);
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-2);
  });
});

test('reduced motion: the recorder is the still poster, no float, no lean', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('record/');
  const box = (await page.locator('.rh .media').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2, { steps: 6 });
  await page.waitForTimeout(2500);
  const stage = page.locator('.rh .media');
  await expect(stage).not.toHaveClass(/floating/);
  expect(await stage.locator('.m-layer').evaluate((l) => l.getAnimations().length)).toBe(0);
  await expect(stage.locator('.m-lean, video')).toHaveCount(0);
  await expect(stage.locator('.m-poster')).toBeVisible();
  await ctx.close();
});
