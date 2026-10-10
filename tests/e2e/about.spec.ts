/* About as an "about me" article (brief, About, 2026-10-10 evening): the ID card opens the page, the
   chapters from content/site.json follow in the reading style and are the rail's rungs, and the
   photographs stand beside them as postcards with alt text, never drawn larger than their pixels. */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone } from './helpers';

const site = JSON.parse(fs.readFileSync(path.resolve('content/site.json'), 'utf8'));
const chapters: { id: string; title: string; photos?: { alt: string }[] }[] = site.about.chapters;
const photoCount = chapters.reduce((n, c) => n + (c.photos?.length ?? 0), 0);

/** Every image in the page at its drawn size, against the pixels of the file the browser chose. */
async function sizes(page: Page) {
  /* walk the page so lazy postcards load, then come back */
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('#main img')].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15_000 });
  return page.evaluate(async () => Promise.all([...document.querySelectorAll<HTMLImageElement>('#main img')].map(async (img) => {
    /* naturalWidth of a srcset image is density-corrected, so load the chosen file on its own */
    const probe = new Image();
    probe.src = img.currentSrc;
    await probe.decode();
    return { src: img.currentSrc.split('/').pop(), drawn: img.clientWidth, drawnH: img.clientHeight, px: probe.naturalWidth, pxH: probe.naturalHeight, dpr: devicePixelRatio };
  })));
}

test.describe('About, desktop', () => {
  test.use(desktop);

  test('the card opens the page; the chapters follow in order and are the rungs', async ({ page }) => {
    await page.goto('about/?still');
    await expect(page.locator('#main h1')).toHaveText(site.about.title);
    const card = page.locator('.ab-open .idc');
    await expect(card).toHaveCount(1);
    const box = (await page.locator('.idc-card').boundingBox())!;
    expect(box.y + box.height, 'the card is in the first screen').toBeLessThanOrEqual(900);
    /* the card stands beside the opening, not over its words */
    const intro = (await page.locator('.ab-intro').boundingBox())!;
    expect(box.x).toBeGreaterThan(intro.x + intro.width);

    const secs = page.locator('#main [data-rail-sec]');
    await expect(secs).toHaveCount(chapters.length);
    expect(await secs.evaluateAll((s) => s.map((e) => [e.id, (e as HTMLElement).dataset.railSec]))).toEqual(chapters.map((c) => [c.id, c.title]));
    for (const c of chapters) await expect(page.locator(`#${c.id} h2`)).toContainText(c.title);
    /* the colophon stays for the Record's "How this is written", outside the rungs */
    await expect(page.locator('#colophon')).toHaveCount(1);
    /* products and links come from the projects and site.json */
    await expect(page.locator('#products .ab-list a')).toHaveCount(3);
    await expect(page.locator('#links a[href="https://github.com/ErenDenizK"]')).toHaveCount(1);
    await expect(page.locator('#links a[href^="mailto:"]')).toHaveCount(0);
  });

  test('the reading column: Newsreader 21 px, about seventy characters a line', async ({ page }) => {
    await page.goto('about/?still');
    const r = await page.locator('#who .ch-body p').first().evaluate((p) => {
      const cs = getComputedStyle(p);
      const probe = document.createElement('span');
      probe.textContent = 'abcdefghijklmnopqrstuvwxyz'.repeat(4);
      p.append(probe);
      const ch = probe.getBoundingClientRect().width / 104;
      probe.remove();
      return { size: parseFloat(cs.fontSize), family: cs.fontFamily, perLine: p.clientWidth / ch };
    });
    expect(r.size).toBe(21);
    expect(r.family).toContain('Newsreader');
    expect(r.perLine).toBeGreaterThan(58);
    expect(r.perLine).toBeLessThan(80);
  });

  test('postcards carry alt text and turn over', async ({ page }) => {
    await page.goto('about/?still');
    const pcs = page.locator('#main .pc');
    await expect(pcs).toHaveCount(photoCount);
    const alts = await page.locator('#main .pc img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect(alts).toEqual(chapters.flatMap((c) => (c.photos ?? []).map((p) => p.alt)));
    for (const a of alts) expect(a.length).toBeGreaterThan(20);
    const first = pcs.first();
    await first.locator('.pc-front .pc-turn').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveClass(/is-flipped/);
    await expect(first.locator('.pc-back .pc-turn')).toBeFocused();
  });
});

/* rendered size <= natural size / DPR, for every photograph, at the three sizes we design for */
for (const [name, opts] of [['desktop 2x', { ...desktop, deviceScaleFactor: 2 }], ['tablet 2x', { ...tablet, deviceScaleFactor: 2 }], ['phone 3x', { ...phone, deviceScaleFactor: 3 }]] as const) {
  test(`no photograph is stretched (${name})`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...opts, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('about/?still');
    const all = await sizes(page);
    expect(all.length).toBe(photoCount + 1);   // the postcards and the card's photo
    for (const s of all) {
      expect(s.drawn * s.dpr, `${s.src}: drawn ${s.drawn} css px at ${s.dpr}x from ${s.px} px`).toBeLessThanOrEqual(s.px + 1);
      expect(s.drawnH * s.dpr, `${s.src}: height`).toBeLessThanOrEqual(s.pxH + 1);
    }
    await ctx.close();
  });
}

test.describe('About, phone', () => {
  test.use(phone);
  test('the card is in the first screen, then the words; nothing overflows', async ({ page }) => {
    await page.goto('about/?still');
    const card = (await page.locator('.idc-card').boundingBox())!;
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.y + card.height).toBeLessThanOrEqual(844);
    /* centred on the page */
    expect(Math.abs(card.x + card.width / 2 - 195)).toBeLessThanOrEqual(2);
    const h1 = (await page.locator('#main h1').boundingBox())!;
    expect(h1.y).toBeGreaterThan(card.y + card.height);
    await expect(page.locator('#main .pc')).toHaveCount(photoCount);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

test('without JavaScript every chapter reads and postcards show both sides', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  for (const c of chapters) await expect(page.locator(`#${c.id} h2`)).toBeVisible();
  await expect(page.locator('#main .pc-back').first()).toBeVisible();
  await ctx.close();
});
