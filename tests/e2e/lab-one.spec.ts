/* The two-page site's lab page, PART A (src/pages/lab/one.astro; design spec §7.3, §8): hidden like the
   other workbenches (noindex, out of the sitemap, linked from nowhere), no sideways scroll at the three
   check sizes and at 320 px, and a complete page in both still twins: reduced motion (nothing waits to
   arrive, no fixed field) and no JavaScript (every part present, the postcards captioned, the card's
   front alone). The person's interactive parts are checked once on desktop: the ID card turns, a
   postcard opens into the large view and returns by Escape and by Back. PART B's Work has its own spec. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone } from './helpers';

const PAGE = 'lab/one/';
/* every strip of the person's part, by its rail label (the page's index, spec §5) */
const STRIPS = ['About', 'How I work', 'Path', 'Photos', 'Now', 'Record', 'Contact'];

async function complete(page: Page) {
  await expect(page.locator('h1')).toHaveText('Eren Deniz Kuyucaklıoğlu');
  await expect(page.locator('#brief .lede')).toBeVisible();
  await expect(page.locator('#brief .row')).toHaveCount(3);
  await expect(page.locator('#work[data-part="work"]')).toHaveCount(1);
  const labels = await page.locator('[data-rail-sec]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.railSec));
  for (const s of STRIPS) expect(labels, `strip ${s}`).toContain(s);
  await expect(page.locator('#contact a[href*="github.com"]')).toHaveCount(1);
  await expect(page.locator('footer.foot')).toBeVisible();
}

/** What is still hidden for good: an arriving element left at opacity 0, after scrolling everything in. */
async function hiddenAfterScroll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
  return page.locator('[data-arrive]').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity < 0.99).map((e) => e.className));
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
    for (const q of ['', '?still']) {
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
  test('reduced motion: a complete page, nothing waits to arrive, no fixed field', async ({ browser }) => {
    for (const opts of [desktop, phone]) {
      const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await expect(page.locator('html')).toHaveClass(/\bstill\b/);
      await complete(page);
      expect(await page.locator('.field .pools').evaluate((e) => getComputedStyle(e).display)).toBe('none');
      expect(await hiddenAfterScroll(page)).toEqual([]);
      /* the card turns by a crossfade: no 3D turn */
      await page.locator('#about [data-turn]').click();
      await expect(page.locator('#about [data-turn]')).toHaveAttribute('aria-pressed', 'true');
      expect(await page.locator('#about [data-card]').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
      await ctx.close();
    }
  });

  test('no JavaScript: a complete page, postcards captioned, the card front alone', async ({ browser }) => {
    for (const opts of [desktop, phone]) {
      const ctx = await browser.newContext({ ...opts, javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await complete(page);
      expect(await page.locator('[data-arrive]').evaluateAll((els) => els.filter((e) => +getComputedStyle(e).opacity < 0.99).length)).toBe(0);
      await expect(page.locator('#about .front')).toBeVisible();
      await expect(page.locator('#about .back')).toBeHidden();
      await expect(page.locator('#about [data-turn]')).toBeHidden();
      const caps = page.locator('#photos .pc-cap');
      expect(await caps.count()).toBeGreaterThan(0);
      for (const c of await caps.all()) await expect(c).toBeVisible();
      await ctx.close();
    }
  });
});

test.describe('the person\'s part, desktop', () => {
  test.use(desktop);

  test('the ID card turns over and back', async ({ page }) => {
    await page.goto(PAGE);
    const turn = page.locator('#about [data-turn]');
    await turn.scrollIntoViewIfNeeded();
    await turn.click();
    await expect(turn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#about [data-face="back"]')).toHaveAttribute('aria-hidden', 'false');
    await turn.press('Enter');
    await expect(turn).toHaveAttribute('aria-pressed', 'false');
  });

  test('a postcard opens into the large view, turns, and returns by Escape and by Back', async ({ page }) => {
    await page.goto(PAGE);
    const first = page.locator('[data-postcard="0"] .pc-open');
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await first.click();
    const dlg = page.locator('[data-pc-dialog]');
    await expect(dlg).toHaveAttribute('open', '');
    const card = dlg.locator('[data-big-card]');
    await expect(card).toBeVisible();
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');
    await expect(first).toBeFocused();
    await page.locator('[data-postcard="1"] .pc-open').click();
    await expect(dlg).toHaveAttribute('open', '');
    await page.goBack();
    await expect(dlg).not.toHaveAttribute('open', '');
    expect(new URL(page.url()).pathname).toMatch(/lab\/one\/$/);
  });
});
