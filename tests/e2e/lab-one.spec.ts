/* The two-page site's lab page, the shell and the person's part (src/pages/lab/one.astro; spec v2 §3.2,
   §3.5 to §3.7, §8): hidden like the other workbenches (noindex, out of the sitemap, linked from nowhere),
   no sideways scroll at the three check sizes and at 320 px, and a complete page in both still twins:
   reduced motion (nothing waits, every scene at rest, no fixed field) and no JavaScript (every part
   present, the postcards captioned, the card's front alone). Then, on desktop: the Bostancı photograph
   whole; the ported ID card (turns by keyboard and by click, a drag swings it on its rope without turning
   it, a hover sways it); the postcards (a hover puts the card on top and it stays there; the large view
   turns and returns by Escape and by Back); the Record strip in the Record's language; and scroll scenes
   that are pure functions of position (the same place shows the same frame on the way down and back up).
   PART B's Work has its own spec. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone } from './helpers';

const PAGE = 'lab/one/';
/* every part of the person's chapters, by its rail label (the page's index, spec v2 §3.1) */
const STRIPS = ['How I work', 'Path', 'Photos', 'Record', 'Now', 'Card'];

async function complete(page: Page) {
  await expect(page.locator('h1')).toHaveText('Eren Deniz Kuyucaklıoğlu');
  await expect(page.locator('#brief .lede')).toBeVisible();
  await expect(page.locator('#brief .row')).toHaveCount(3);
  await expect(page.locator('#bostanci img')).toBeVisible();
  await expect(page.locator('#work[data-part="work"]')).toHaveCount(1);
  const labels = await page.locator('[data-rail-sec]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.railSec));
  for (const s of STRIPS) expect(labels, `strip ${s}`).toContain(s);
  /* the card is the one place of the links: no Contact strip, GitHub once on the card's front */
  await expect(page.locator('#contact')).toHaveCount(0);
  await expect(page.locator('#card .idc-front a[href="https://github.com/ErenDenizK"]')).toHaveCount(1);
  await expect(page.locator('#record .entry')).toHaveCount(3);
  await expect(page.locator('#record .ystrip')).toHaveCount(1);
  await expect(page.locator('footer.foot')).toBeVisible();
}

/** What is still hidden for good after scrolling everything in: an arriving element or a scene's text
    left below full opacity. */
async function hiddenAfterScroll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
  return page.locator('[data-arrive], [data-rise], [data-lines], .pc-open, .stop .what').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity < 0.99).map((e) => e.className || e.tagName));
}

test('the lab page is hidden: noindex, out of the sitemap, linked from nowhere', async ({ page, request }) => {
  await page.goto(PAGE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  const map = await (await request.get('sitemap-0.xml')).text();
  expect(map).not.toContain('/lab/');
  for (const p of ['', 'record/', 'about/', 'work/']) {
    await page.goto(p + '?still');
    expect(await page.locator('a[href*="lab/one"]').count(), `/${p} links to the lab`).toBe(0);
  }
});

for (const [size, opts] of [['desktop', desktop], ['tablet', tablet], ['phone', phone], ['320', { ...phone, viewport: { width: 320, height: 640 } }]] as const) {
  test(`no sideways scroll at ${size}`, async ({ browser }) => {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    for (const q of ['', '?still', '?photo=flat']) {
      await page.goto(PAGE + q);
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth, iw: innerWidth, cw: document.documentElement.clientWidth }));
      expect(r.over, `${q || 'motion'}: page is ${r.over}px wider than the view`).toBeLessThanOrEqual(0);
      expect(r.iw, `${q || 'motion'}: the layout viewport widened`).toBe(r.cw);
    }
    await ctx.close();
  });
}

test.describe('still twins', () => {
  test('reduced motion: a complete page, every scene at rest, no fixed field', async ({ browser }) => {
    for (const opts of [desktop, phone]) {
      const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await expect(page.locator('html')).toHaveClass(/\bstill\b/);
      await complete(page);
      expect(await page.locator('.field .pools').evaluate((e) => getComputedStyle(e).display)).toBe('none');
      expect(await page.locator('[data-scene]').evaluateAll((els) => els.map((e) => getComputedStyle(e).getPropertyValue('--sp').trim()).filter((v) => v !== '1'))).toEqual([]);
      expect(await hiddenAfterScroll(page)).toEqual([]);
      /* the card turns by a crossfade: no 3D turn */
      const turn = page.locator('#card .idc-front .idc-turn');
      await turn.click();
      await expect(page.locator('#card .idc')).toHaveClass(/is-flipped/);
      expect(await page.locator('#card .idc-card').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
      await ctx.close();
    }
  });

  test('no JavaScript: a complete page, postcards captioned, the card front alone', async ({ browser }) => {
    for (const opts of [desktop, phone]) {
      const ctx = await browser.newContext({ ...opts, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await complete(page);
      expect(await page.locator('[data-arrive], [data-rise], [data-lines]').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity < 0.99).length)).toBe(0);
      await expect(page.locator('#card .idc-front')).toBeVisible();
      await expect(page.locator('#card .idc-back')).toBeHidden();
      await expect(page.locator('#card .idc-turn').first()).toBeHidden();
      const caps = page.locator('#photos .pc-cap');
      expect(await caps.count()).toBeGreaterThan(0);
      for (const c of await caps.all()) await expect(c).toBeVisible();
      await ctx.close();
    }
  });
});

test.describe('the person\'s part, desktop', () => {
  test.use(desktop);

  test('the Bostancı photograph is shown whole and vertical, at least 700 px tall', async ({ page }) => {
    await page.goto(PAGE);
    const img = page.locator('#bostanci img');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    const r = await img.evaluate((e: HTMLImageElement) => ({ w: e.offsetWidth, h: e.offsetHeight, nw: e.naturalWidth, nh: e.naturalHeight }));
    expect(r.h).toBeGreaterThan(700);
    expect(r.h).toBeGreaterThan(r.w);
    expect(Math.abs(r.w / r.h - r.nw / r.nh), 'not cropped').toBeLessThan(0.01);
  });

  test('the ID card turns over with the keyboard and on click, and only the visible face is reachable', async ({ page }) => {
    await page.goto(PAGE);
    const card = page.locator('#card .idc');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-live/);
    expect(await page.locator('#card .idc-back').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
    await page.locator('#card .idc-front .idc-turn').focus();
    await page.keyboard.press('Enter');
    await expect(card).toHaveClass(/is-flipped/);
    await expect(page.locator('#card .idc-back .idc-turn')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(card).not.toHaveClass(/is-flipped/);
  });

  test('a drag swings the card on its rope and does not turn it; a hover sways it', async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('#card').evaluate((e) => e.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(2600);
    const card = page.locator('#card .idc');
    await expect(card).toHaveClass(/is-rope/);
    const swing = () => page.locator('#card .idc-swing').evaluate((e) => (e as HTMLElement).style.transform);
    const box = (await page.locator('#card .idc-card').boundingBox())!;
    /* hover: one push of the rope, then it settles */
    await page.mouse.move(box.x - 120, box.y + box.height / 2);
    await page.mouse.move(box.x + 40, box.y + box.height / 2, { steps: 4 });
    await expect.poll(async () => /rotate\((-?[\d.]+)rad\)/.exec(await swing())?.[1] ?? '0', { timeout: 2000 }).not.toBe('0.0000');
    await page.mouse.move(10, 10);
    await page.waitForTimeout(1500);
    const cx = box.x + box.width / 2, cy = box.y + box.height * 0.45;
    const d0 = await page.locator('#card [data-rope-path]').getAttribute('d');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 140, cy + 20, { steps: 10 });
    expect(await page.locator('#card [data-rope-path]').getAttribute('d'), 'the rope follows the card').not.toBe(d0);
    await page.mouse.up();
    await expect(card, 'a drag is not a click').not.toHaveClass(/is-flipped/);
  });

  test('a hovered postcard ends on top and stays there; the large view turns and returns by Escape and by Back', async ({ page }) => {
    await page.goto(PAGE);
    const first = page.locator('[data-postcard="0"]');
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const z = (i: number) => page.locator(`[data-postcard="${i}"]`).evaluate((e) => +(e as HTMLElement).style.getPropertyValue('--z'));
    expect(await z(0)).toBeLessThan(await z(1));
    const b = (await first.boundingBox())!;
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2);
    await expect.poll(() => z(0)).toBe(3);
    await page.mouse.move(b.x + b.width * 0.3, b.y - 200);
    await page.waitForTimeout(600);
    expect(await z(0), 'the last card touched stays on top').toBe(3);

    await first.locator('.pc-open').click();
    const dlg = page.locator('[data-pc-dialog]');
    await expect(dlg).toHaveAttribute('open', '');
    const big = dlg.locator('[data-big-card]');
    await expect(big).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(big).toHaveClass(/is-flipped/);
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');
    await expect(first.locator('.pc-open')).toBeFocused();
    await page.locator('[data-postcard="1"] .pc-open').click();
    await expect(dlg).toHaveAttribute('open', '');
    await page.goBack();
    await expect(dlg).not.toHaveAttribute('open', '');
    expect(new URL(page.url()).pathname).toMatch(/lab\/one\/$/);
  });

  test('the Record strip speaks the Record\'s language: marks on a spine, a year strip, serif titles, no pills', async ({ page }) => {
    await page.goto(PAGE);
    const strip = page.locator('#record');
    await strip.scrollIntoViewIfNeeded();
    await expect(strip.locator('.entry .e-mark')).toHaveCount(3);
    await expect(strip.locator('.ym')).toHaveCount(12);
    await expect(strip.locator('.rs-now')).toContainText(/\S/);
    expect(await strip.locator('.rs-title').evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/Newsreader/);
    await expect(strip.locator('.btn')).toHaveCount(0);
    await expect(strip.locator('a.rs-all')).toHaveAttribute('href', /record\/$/);
  });

  test('scroll scenes are functions of position: the same place shows the same frame on the way back', async ({ page }) => {
    await page.goto(PAGE);
    const y = await page.locator('#how').evaluate((e) => e.getBoundingClientRect().top + scrollY - innerHeight * 0.6);
    const read = () => page.evaluate(() => {
      const s = document.querySelector<HTMLElement>('#how')!;
      return [getComputedStyle(s).getPropertyValue('--sp').trim(), getComputedStyle(document.querySelector('#how .tr-lane')!, '::before').transform];
    });
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(300);
    const a = await read();
    expect(+a[0]).toBeGreaterThan(0);
    expect(+a[0]).toBeLessThan(1);
    await page.evaluate((v) => scrollTo(0, v + 900), y);
    await page.waitForTimeout(300);
    const mid = await read();
    expect(mid[0]).not.toBe(a[0]);
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(300);
    expect(await read()).toEqual(a);
  });
});
