/* The Home object on the default path (site audit 2026-10-10 §3-4; ADR-0006 amendment of 2026-10-10):
   it leans toward a pointer near it and not one across the page, returns to rest when the pointer
   leaves the window, re-aims after a scroll, settles on an exact frame without turning back, hops
   from the rest pose when pressed while leaning, the droplet plays at its own rate, and reduced
   motion keeps the still poster. The lean's state is read from the layer (media.ts, `_seq`), as yaw in
   degrees from the rest pose, so the checks hold for any grid density (2026-10-10: 2° or 1° columns). */
import { test, expect, type Page } from '@playwright/test';
import { desktop } from './helpers';

const lean = (page: Page) => page.evaluate(() => {
  const l = document.querySelector('.media.stage .m-layer:not(.leaving)') as any;
  const q = l?._seq;
  const deg = (u: number) => (u * (q.m.cols - 1) - q.m.center.col) * (q.m.stepDeg?.yaw ?? 2);
  return q?.ok ? { u: deg(q.cur.u), tu: deg(q.target.u), centre: 0, exact: q.drawn.exact, on: l.classList.contains('seq-on'), clip: l.classList.contains('clip-on') } : null;
});

test.describe('Home object, desktop', () => {
  test.use(desktop);

  async function ready(page: Page) {
    await page.goto('');
    const box = (await page.locator('.media.stage').boundingBox())!;
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
    /* the pointer leaves: the object goes back to rest (the glass is 600-705 px wide on Home now, so no point
       of a 1440 window is beyond its 1.8-width reach) */
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave')));
    await expect.poll(async () => { const s = (await lean(page))!; return s.u === s.centre && s.tu === s.centre; }, { timeout: 5000 }).toBe(true);
  });

  test('returns to rest when the pointer leaves the window; the reading position turns it on its grid', async ({ page }) => {
    const { cx, cy } = await ready(page);
    await page.mouse.move(cx - 260, cy, { steps: 6 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-4);
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave')));
    await expect.poll(async () => { const s = (await lean(page))!; return s.u === s.centre; }, { timeout: 5000 }).toBe(true);
    /* Home's scroll story (scripts/home.ts): the glass is pinned and the reading position poses it. The two
       tracks turn it from one lane (left) to the other (right) as the chapter passes; back at the top it rests. */
    const at = (sel: string, f: number) => page.evaluate(([sel, f]) => { const r = document.querySelector(sel as string)!.getBoundingClientRect(); scrollTo(0, scrollY + r.top + r.height * (f as number) - innerHeight / 2); }, [sel, f] as const);
    await at('.ha-tracks', 0.15);
    await expect.poll(async () => (await lean(page))!.tu, { timeout: 5000 }).toBeLessThan(-6);
    await at('.ha-tracks', 0.85);
    await expect.poll(async () => (await lean(page))!.tu, { timeout: 5000 }).toBeGreaterThan(6);
    /* it settles on an exact frame once the page stops */
    await expect.poll(async () => (await lean(page))!.exact, { timeout: 4000 }).toBe(true);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(async () => { const s = (await lean(page))!; return Math.abs(s.u) < 0.01 && Math.abs(s.tu) < 0.01; }, { timeout: 5000 }).toBe(true);
  });

  test('a press while leaning glides to the rest pose and hops from there', async ({ page }) => {
    const { cx, cy } = await ready(page);
    await page.mouse.move(cx - 300, cy, { steps: 6 });
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-3);
    await page.evaluate(() => {
      const l = document.querySelector('.media.stage .m-layer:not(.leaving)') as any;
      (window as any).__hopAt = null;
      new MutationObserver(() => { if (l.classList.contains('clip-on') && (window as any).__hopAt === null) (window as any).__hopAt = (l._seq.cur.u - 0.5) * 32; }).observe(l, { attributes: true, attributeFilter: ['class'] });
    });
    await page.mouse.click(cx - 300, cy);
    await expect.poll(() => page.evaluate(() => (window as any).__hopAt), { timeout: 10_000 }).not.toBeNull();
    const at = await page.evaluate(() => (window as any).__hopAt);
    expect(Math.abs(at), 'the clip starts at the rest pose (degrees)').toBeLessThan(0.6);
    /* after the hop the lean comes back from the rest pose */
    await expect.poll(async () => (await lean(page))!.clip, { timeout: 8000 }).toBe(false);
    await expect.poll(async () => (await lean(page))!.u, { timeout: 5000 }).toBeLessThan(-2);
  });

  test('the droplet melt plays at its own rate', async ({ page }) => {
    await page.goto('');
    /* the manifest is in once the lean has started loading */
    await expect.poll(() => page.evaluate(() => !!(document.querySelector('.media.stage .m-layer') as any)?._seq), { timeout: 20_000 }).toBe(true);
    await page.evaluate(() => (window as any).MediaStage.leave());
    await expect.poll(() => page.evaluate(() => (document.querySelector('.media.stage video.m-drop') as HTMLVideoElement | null)?.playbackRate ?? null), { timeout: 10_000 }).toBe(1);
  });
});

test('reduced motion: the Home object is the still poster, no float, no lean', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('');
  await page.mouse.move(1200, 380, { steps: 6 });
  await page.waitForTimeout(2500);
  const stage = page.locator('.media.stage');
  await expect(stage).not.toHaveClass(/floating/);
  expect(await stage.locator('.m-layer').evaluate((l) => l.getAnimations().length)).toBe(0);
  await expect(stage.locator('.m-lean, video')).toHaveCount(0);
  await expect(stage.locator('.m-poster')).toBeVisible();
  await ctx.close();
});
