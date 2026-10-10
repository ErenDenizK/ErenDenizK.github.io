/* The ID card on About and the postcard (ADR-0008): both turn over by keyboard and by pointer, the
   hidden face is never reachable, the front links work without turning, a drag swings the card on its
   rope without turning it, a fling spins it and it settles on one face, which becomes the live one, and
   the still twins hold (touch, reduced motion, no JavaScript). */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone } from './helpers';

const flipped = (page: Page, sel = '.idc') => page.locator(sel).first().evaluate((e) => e.classList.contains('is-flipped'));
const inert = (page: Page, sel: string) => page.locator(sel).first().evaluate((e) => (e as HTMLElement).inert);
const swing = (page: Page) => page.locator('.idc-swing').evaluate((e) => getComputedStyle(e).transform);
const atRest = (t: string) => {
  if (t === 'none') return true;
  const m = /^matrix\(([^)]+)\)$/.exec(t);
  if (!m) return false;
  const [a, b, , , e, f] = m[1].split(',').map(Number);
  return Math.abs(a - 1) < 1e-3 && Math.abs(b) < 1e-3 && Math.abs(e) < 0.5 && Math.abs(f) < 0.5;
};
/** the card's turn about its vertical axis, from its inline transform */
const yaw = (page: Page) => page.locator('.idc-card').evaluate((e) => +(/rotateY\((-?[\d.]+)deg\)/.exec((e as HTMLElement).style.transform)?.[1] ?? 0));
const ropeD = (page: Page) => page.locator('[data-rope-path]').getAttribute('d');

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

    await expect(page.locator('.idc')).toHaveClass(/is-rope/);
    const d0 = await ropeD(page);
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 140, cy + 20, { steps: 10 });
    expect(atRest(await swing(page)), 'the card follows the hand').toBe(false);
    expect(await ropeD(page), 'the rope follows the card').not.toBe(d0);
    await page.mouse.up();
    expect(await flipped(page), 'a drag is not a click').toBe(false);
    await page.mouse.move(10, 10);
    await expect.poll(async () => atRest(await swing(page)), { timeout: 5000, message: 'the card swings back to rest' }).toBe(true);
  });

  test('a fling spins it; it settles on one face, and that face is the live one', async ({ page }) => {
    await page.goto('about/');
    await page.waitForTimeout(1600);
    const box = (await page.locator('.idc-card').boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height * 0.5;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 160, cy, { steps: 8 });
    await page.waitForTimeout(80);
    /* big, quick steps: a headless page delivers few events, and the throw is measured between them */
    for (let i = 1; i <= 3; i++) await page.mouse.move(cx - 160 + i * 150, cy);
    await page.mouse.up();
    expect(await flipped(page), 'a fling is not a click').toBe(false);
    await expect.poll(async () => Math.abs(await yaw(page)), { timeout: 1500, message: 'the card spins' }).toBeGreaterThan(90);
    await page.mouse.move(10, 10);
    await expect.poll(async () => { const t = await swing(page); return atRest(t) || t; }, { timeout: 8000, message: 'the card comes to rest' }).toBe(true);
    await expect.poll(async () => [0, 180].includes((((await yaw(page)) % 360) + 360) % 360), { timeout: 4000, message: 'it faces front or back' }).toBe(true);
    const back = (((await yaw(page)) % 360) + 360) % 360 === 180;
    expect(await flipped(page), 'the face it settled on is the live one').toBe(back);
    expect(await inert(page, back ? '.idc-front' : '.idc-back')).toBe(true);
    expect(await inert(page, back ? '.idc-back' : '.idc-front')).toBe(false);
    /* and the keyboard still turns it from there */
    await page.locator(back ? '.idc-back .idc-turn' : '.idc-front .idc-turn').focus();
    await page.keyboard.press('Enter');
    expect(await flipped(page)).toBe(!back);
  });
});

/* Calm (brief 2026-10-10: "extreme input gets extreme reactions"; ADR-0008 amendment of 2026-10-10):
   the rope can be taken, the strap gives at most a few px however hard it is pulled, the turn never
   runs faster than about 720°/s, and a straight yank does not leave the card hanging in mid-air. */
test.describe('ID card, calm', () => {
  test.use(desktop);
  const ropeLen = (page: Page) => page.locator('[data-rope-path]').evaluate((p) => (p as SVGPathElement).getTotalLength());

  test('the rope can be pulled, and it barely stretches', async ({ page }) => {
    await page.goto('about/');
    await page.waitForTimeout(2500);
    await expect(page.locator('.idc')).toHaveClass(/is-rope/);
    const L0 = await ropeLen(page);
    const rb = (await page.locator('[data-rope-path]').boundingBox())!;
    const d0 = await ropeD(page);
    await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height * 0.75);
    await page.mouse.down();
    await page.mouse.move(120, 860, { steps: 20 });
    expect(await ropeD(page), 'the rope follows the hand').not.toBe(d0);
    expect(atRest(await swing(page)), 'the card dangles from it').toBe(false);
    expect(await ropeLen(page) - L0, 'the strap gives only a little').toBeLessThan(14);
    await page.mouse.up();
    /* the card itself, pulled far down and away */
    await page.mouse.move(10, 10);
    await expect.poll(async () => atRest(await swing(page)), { timeout: 6000 }).toBe(true);
    const box = (await page.locator('.idc-card').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 300, box.y + 900, { steps: 20 });
    expect(await ropeLen(page) - L0).toBeLessThan(14);
    await page.mouse.up();
  });

  test('a hard fling turns at most about 720°/s and a yank does not prop the card up', async ({ page }) => {
    await page.goto('about/');
    await page.waitForTimeout(1600);
    const box = (await page.locator('.idc-card').boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.evaluate(() => {
      const body = document.querySelector('[data-card-body]') as HTMLElement;
      const log: [number, number][] = ((window as any).__yaw = []);
      const f = (t: number) => { log.push([t, +(/rotateY\((-?[\d.]+)deg\)/.exec(body.style.transform)?.[1] ?? 0)]); requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) { await page.mouse.move(cx - 120 * i, cy); await page.waitForTimeout(10); }
    await page.mouse.up();
    await page.waitForTimeout(2500);
    const peak = await page.evaluate(() => {
      const r = (window as any).__yaw as [number, number][];
      let max = 0;
      for (let i = 1; i < r.length; i++) {
        let j = i; while (j > 0 && r[i][0] - r[j][0] < 50) j--;
        /* per-frame steps wrapped to ±180°: at rest the angle is renormalised by whole turns */
        let a = 0; for (let k = j + 1; k <= i; k++) a += ((r[k][1] - r[k - 1][1]) % 360 + 540) % 360 - 180;
        if (r[i][0] - r[j][0] >= 30) max = Math.max(max, Math.abs(a) / ((r[i][0] - r[j][0]) / 1000));
      }
      return max;
    });
    expect(peak, 'turn speed over 50 ms windows').toBeLessThan(800);
    /* a straight yank upward: the card falls back onto its strap */
    await page.mouse.move(10, 10);
    await expect.poll(async () => atRest(await swing(page)), { timeout: 8000 }).toBe(true);
    const b2 = (await page.locator('.idc-card').boundingBox())!;
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2);
    await page.mouse.down();
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2 + 500, { steps: 15 });
    await page.waitForTimeout(150);
    await page.mouse.move(b2.x + b2.width / 2, 5, { steps: 2 });
    await page.mouse.up();
    await page.mouse.move(10, 10);
    await expect.poll(async () => atRest(await swing(page)), { timeout: 5000, message: 'the card hangs on its strap again' }).toBe(true);
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
    /* phones keep the still strap: no rope, no physics */
    await expect(page.locator('.idc')).not.toHaveClass(/is-rope/);
    await expect(page.locator('.idc-strap')).toBeVisible();
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
  await expect(page.locator('.idc')).not.toHaveClass(/is-rope/);
  expect(atRest(await swing(page))).toBe(true);
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
