/* About as an "about me" article (brief, About, 2026-10-10 evening; made livelier 2026-10-11): the ID card
   opens the page, the chapters from content/site.json follow in the reading style and are the rail's
   rungs, each with its own object (facts, the pile, two tracks, a quote, the year), and the photographs
   lie in a pile of postcards that turns, shuffles and is dragged aside, by hand or by keyboard, with
   alt text, never drawn larger than their pixels, and a still twin. */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone } from './helpers';

const site = JSON.parse(fs.readFileSync(path.resolve('content/site.json'), 'utf8'));
type Ch = { id: string; title: string; photos?: { alt: string; note: string; place: string }[]; facts?: [string, string][]; tracks?: { lanes: unknown[]; meet: string }; quote?: string; timeline?: { state: string }[] };
const chapters: Ch[] = site.about.chapters;
const pileCh = chapters.find((c) => (c.photos?.length ?? 0) > 1)!;
const pics = pileCh.photos!;
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

  test('each chapter carries its own object: facts, two tracks, a quote, the year', async ({ page }) => {
    await page.goto('about/?still');
    for (const c of chapters) {
      if (c.facts) await expect(page.locator(`#${c.id} .facts dt`)).toHaveText(c.facts.map(([k]) => k));
      if (c.tracks) {
        await expect(page.locator(`#${c.id} .tr-lane`)).toHaveCount(2);
        await expect(page.locator(`#${c.id} .tr-end`)).toHaveText(c.tracks.meet);
      }
      if (c.quote) await expect(page.locator(`#${c.id} blockquote`)).toHaveText(c.quote);
      if (c.timeline) {
        await expect(page.locator(`#${c.id} .tl-step`)).toHaveCount(c.timeline.length);
        await expect(page.locator(`#${c.id} .tl-step[aria-current="step"]`)).toHaveCount(c.timeline.filter((t) => t.state === 'now').length);
      }
    }
    /* the now line under the opening, from site.json */
    await expect(page.locator('.ab-now')).toContainText(site.now.text);
    /* products in their own colours, with their status */
    await expect(page.locator('#products .ab-status')).toHaveCount(3);
  });

  test('the pile: alt text, keyboard turn, previous and next, a live caption', async ({ page }) => {
    await page.goto('about/?still');
    const pile = page.locator(`#${pileCh.id} [data-pile]`);
    await expect(pile).toHaveClass(/is-live/);
    const pcs = pile.locator('.pc');
    await expect(pcs).toHaveCount(photoCount);
    const alts = await pile.locator('.pc img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect(alts).toEqual(pics.map((p) => p.alt));
    for (const a of alts) expect(a.length).toBeGreaterThan(20);
    /* only the top card can be reached */
    expect(await pile.locator('[data-pile-card]').evaluateAll((cs) => cs.map((c) => (c as HTMLElement).inert))).toEqual(pics.map((_, i) => i !== 0));
    await expect(pile.locator('[data-pile-place]')).toHaveText(pics[0].place);

    /* turn with the keyboard: Enter on the face, focus follows to the back */
    const first = pcs.first();
    await first.locator('.pc-front .pc-turn').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveClass(/is-flipped/);
    await expect(first.locator('.pc-back .pc-turn')).toBeFocused();
    await expect(pile.locator('[data-pile-turn]')).toHaveAttribute('aria-pressed', 'true');

    /* the arrow keys inside the pile: the next card rises, put away face up; focus stays on the top card */
    await page.keyboard.press('ArrowRight');
    await expect(pile.locator('[data-pile-n]')).toHaveText('02');
    await expect(pile.locator('[data-pile-note]')).toHaveText(pics[1].note);
    await expect(pile.locator('[data-pile-live]')).toContainText(pics[1].place);
    await expect(first).not.toHaveClass(/is-flipped/);
    await expect(pcs.nth(1).locator('.pc-front .pc-turn')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(pile.locator('[data-pile-n]')).toHaveText('01');

    /* the buttons do the same, and go round */
    const next = pile.locator('[data-pile-next]');
    for (let i = 0; i < pics.length; i++) await next.click();
    await expect(pile.locator('[data-pile-n]')).toHaveText('01');
    await pile.locator('[data-pile-prev]').click();
    await expect(pile.locator('[data-pile-n]')).toHaveText(String(pics.length).padStart(2, '0'));
    await pile.locator('[data-pile-turn]').click();
    await expect(pcs.nth(pics.length - 1)).toHaveClass(/is-flipped/);
  });

  test('the pile: a throw puts the top card under, a short pull springs back, a click turns', async ({ page }) => {
    await page.goto('about/');
    const pile = page.locator(`#${pileCh.id} [data-pile]`);
    const stage = pile.locator('[data-pile-stage]');
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);   // the pile is dealt as it comes into view
    const b = (await stage.boundingBox())!;
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    /* a short pull: back to its place, still the first card, not turned */
    await page.mouse.move(cx, cy); await page.mouse.down();
    await page.mouse.move(cx + 30, cy, { steps: 5 }); await page.waitForTimeout(200); await page.mouse.up();
    await page.waitForTimeout(900);
    await expect(pile.locator('[data-pile-n]')).toHaveText('01');
    await expect(pile.locator('.pc.is-flipped')).toHaveCount(0);
    /* a throw */
    await page.mouse.move(cx, cy); await page.mouse.down();
    await page.mouse.move(cx + 60, cy, { steps: 3 }); await page.mouse.move(cx + 240, cy + 10, { steps: 3 }); await page.mouse.up();
    await expect(pile.locator('[data-pile-n]')).toHaveText('02');
    await expect(pile.locator('.pc.is-flipped')).toHaveCount(0);
    await page.waitForTimeout(1500);
    /* the card that went under is back inside the pile, below the others */
    const z = await pile.locator('[data-pile-card]').evaluateAll((cs) => cs.map((c) => +(c as HTMLElement).style.zIndex));
    expect(z[0]).toBe(Math.min(...z));
    /* a click turns the new top card */
    await page.mouse.click(cx, cy);
    await expect(pile.locator('.pc').nth(1)).toHaveClass(/is-flipped/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
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

  test('a tap turns the top postcard; the pile and its controls fit the screen', async ({ page }) => {
    await page.goto('about/?still');
    const pile = page.locator(`#${pileCh.id} [data-pile]`);
    const stage = pile.locator('[data-pile-stage]');
    await stage.scrollIntoViewIfNeeded();
    await stage.tap();
    await expect(pile.locator('.pc').first()).toHaveClass(/is-flipped/);
    for (const sel of ['[data-pile-prev]', '[data-pile-next]', '[data-pile-turn]']) {
      const r = (await pile.locator(sel).boundingBox())!;
      expect(r.height, sel).toBeGreaterThanOrEqual(44);
      expect(r.x + r.width, sel).toBeLessThanOrEqual(390);
    }
    const r = (await stage.boundingBox())!;
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.x + r.width).toBeLessThanOrEqual(390);
  });
});

test('reduced motion: the pile changes at once, nothing tilts or is dragged', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  const pile = page.locator(`#${pileCh.id} [data-pile]`);
  await expect(pile).toHaveClass(/is-still/);
  const stage = pile.locator('[data-pile-stage]');
  await stage.scrollIntoViewIfNeeded();
  const b = (await stage.boundingBox())!;
  /* a drag does nothing */
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 300, b.y + b.height / 2, { steps: 4 }); await page.mouse.up();
  await expect(pile.locator('[data-pile-n]')).toHaveText('01');
  /* the order changes at once, and no card body is turned in 3D */
  await pile.locator('[data-pile-next]').click();
  await expect(pile.locator('[data-pile-n]')).toHaveText('02');
  const t = await pile.locator('[data-card-body]').evaluateAll((bs) => bs.map((x) => (x as HTMLElement).style.transform));
  expect(t.every((x) => x === '')).toBe(true);
  /* the turn is a crossfade: the back shows without a rotation */
  await pile.locator('[data-pile-turn]').click();
  await expect(pile.locator('.pc').nth(1).locator('.pc-back')).toHaveCSS('opacity', '1');
  await ctx.close();
});

test('without JavaScript every chapter reads and the photographs stand with their notes', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  for (const c of chapters) await expect(page.locator(`#${c.id} h2`)).toBeVisible();
  /* the pile stands as a row: every photograph with its note under it, no controls */
  const figs = page.locator(`#${pileCh.id} .pile-fig`);
  await expect(figs).toHaveCount(pics.length);
  for (let i = 0; i < pics.length; i++) {
    await expect(figs.nth(i)).toBeVisible();
    await expect(figs.nth(i)).toContainText(pics[i].note);
    await expect(page.locator(`#${pileCh.id} .pc-front img`).nth(i)).toBeVisible();
  }
  await expect(page.locator(`#${pileCh.id} .pile-bar`)).toBeHidden();
  await ctx.close();
});
