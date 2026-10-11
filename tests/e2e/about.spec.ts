/* About as an "about me" article (brief, About, 2026-10-10 evening; made livelier 2026-10-11): the ID card
   opens the page, the chapters from content/site.json follow in the reading style and are the rail's
   rungs, each with its own object (facts, two tracks, a quote, the year), and the photographs are
   postcards spread through the page, each beside its chapter (2026-10-11), turned by a tap, a click or
   the keyboard (no buttons), picked up and tossed back by a mouse, with alt text, never drawn larger
   than their pixels, a still twin, and no text column squeezed on a phone. */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone } from './helpers';

const site = JSON.parse(fs.readFileSync(path.resolve('content/site.json'), 'utf8'));
type Ch = { id: string; title: string; photos?: { alt: string; note: string; place: string }[]; facts?: [string, string][]; tracks?: { lanes: unknown[]; meet: string }; quote?: string; timeline?: { state: string }[] };
const chapters: Ch[] = site.about.chapters;
const cardChs = chapters.filter((c) => c.photos?.length);
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
    /* copy decisions of 2026-10-11: neither abroad nor Microsoft; the prep year was skipped, not passed */
    const text = await page.locator('#main').innerText();
    expect(text).not.toMatch(/abroad|Microsoft|prep year\. I passed it|passed with AA/i);
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

  test('postcards stand beside their chapters, with alt text and no buttons', async ({ page }) => {
    await page.goto('about/?still');
    expect(cardChs.length, 'the photographs are spread over more than one chapter').toBeGreaterThan(1);
    await expect(page.locator('#main .pc')).toHaveCount(photoCount);
    await expect(page.locator('[data-pile], .pile-btn, .pile-turn, [data-pile-next]')).toHaveCount(0);
    for (const c of cardChs) {
      const pcs = page.locator(`#${c.id} .pc`);
      await expect(pcs).toHaveCount(c.photos!.length);
      expect(await pcs.locator('img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt))).toEqual(c.photos!.map((p) => p.alt));
      /* beside its chapter: it starts within the chapter's own box, level with its words */
      const sec = (await page.locator(`#${c.id}`).boundingBox())!;
      const words = (await page.locator(`#${c.id} .ch-body`).boundingBox())!;
      const card = (await pcs.first().locator('.pc-card').boundingBox())!;
      expect(card.y).toBeGreaterThanOrEqual(sec.y - 20);
      expect(card.y).toBeLessThan(words.y + words.height);
      expect(card.x, 'in the margin, right of the words').toBeGreaterThan(words.x + words.width);
    }
    /* the only controls a postcard has are its two faces */
    for (const pc of await page.locator('#main .pc').all()) await expect(pc.locator('button')).toHaveCount(2);
  });

  test('a click turns a postcard; Enter and Space turn it from the keyboard', async ({ page }) => {
    await page.goto('about/?still');
    const pc = page.locator(`#${cardChs[0].id} .pc`).first();
    await pc.scrollIntoViewIfNeeded();
    await pc.locator('.pc-card').click();
    await expect(pc).toHaveClass(/is-flipped/);
    await expect(pc.locator('.pc-front')).toHaveJSProperty('inert', true);
    await expect(pc.locator('.pc-back .pc-note')).toHaveText(cardChs[0].photos![0].note);
    await pc.locator('.pc-card').click();
    await expect(pc).not.toHaveClass(/is-flipped/);

    const front = pc.locator('.pc-front .pc-turn');
    await front.focus();
    await page.keyboard.press('Enter');
    await expect(pc).toHaveClass(/is-flipped/);
    await expect(pc.locator('.pc-back .pc-turn')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(pc).not.toHaveClass(/is-flipped/);
    await expect(front).toBeFocused();
    /* the face names the postcard for a screen reader */
    await expect(front).toHaveAttribute('aria-label', new RegExp(cardChs[0].photos![0].place));
  });

  test('a mouse picks a postcard up and it springs back to where it lay, unturned', async ({ page }) => {
    await page.goto('about/');
    const pc = page.locator(`#${cardChs[1].id} .pc`).first();
    await pc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const body = pc.locator('.pc-card');
    const b = (await body.boundingBox())!;
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down();
    await page.mouse.move(cx + 80, cy + 20, { steps: 6 });
    await expect(pc).toHaveClass(/is-held/);
    const held = (await body.boundingBox())!;
    expect(Math.abs(held.x - b.x), 'it follows the hand').toBeGreaterThan(10);
    expect(Math.abs(held.x - b.x), 'on a short band').toBeLessThan(90);
    await page.mouse.up();
    await expect.poll(() => body.evaluate((e) => e.style.transform), { timeout: 4000 }).toMatch(/translate3d\(0px, 0px, 0px\)/);
    await expect(pc).not.toHaveClass(/is-flipped/);
    /* a click turns it */
    await page.mouse.click(cx, cy);
    await expect(pc).toHaveClass(/is-flipped/);
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

  test('a tap turns a postcard; each one fits the screen', async ({ page }) => {
    await page.goto('about/?still');
    for (const pc of await page.locator('#main .pc').all()) {
      await pc.scrollIntoViewIfNeeded();
      const r = (await pc.locator('.pc-card').boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(390);
    }
    const pc = page.locator('#main .pc').first();
    await pc.scrollIntoViewIfNeeded();
    await pc.locator('.pc-card').tap();
    await expect(pc).toHaveClass(/is-flipped/);
  });
});

/* The phone bug of 2026-10-11 (the products' descriptions one word per line): no wrapped text in About
   may sit in a column narrower than 120 px, at the narrow widths phones have. */
for (const w of [320, 360, 390, 430]) {
  test(`no text column is squeezed at ${w} px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, hasTouch: true, isMobile: true, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('about/?still');
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('#main *')) {
        if (el.closest('.pc-back, .idc, [aria-hidden="true"]')) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join(' ').trim();
        if (own.split(/\s+/).length < 2) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
        if (r.height > lh * 1.6 && r.width < 120) out.push(`${el.className || el.tagName}: ${Math.round(r.width)} px "${own.slice(0, 30)}"`);
      }
      return out;
    });
    expect(bad).toEqual([]);
    /* the two tracks stand one under the other */
    const lanes = await page.locator('.tr-lane').evaluateAll((ls) => ls.map((l) => l.getBoundingClientRect()));
    expect(lanes[1].top).toBeGreaterThanOrEqual(lanes[0].bottom - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}

test('reduced motion: nothing is picked up or leans, and the turn is a crossfade', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  const pc = page.locator('#main .pc').first();
  await expect(pc).toHaveClass(/is-still/);
  await pc.scrollIntoViewIfNeeded();
  const body = pc.locator('.pc-card');
  const b = (await body.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 200, b.y + b.height / 2, { steps: 4 });
  await expect(pc).not.toHaveClass(/is-held/);
  await page.mouse.up();
  expect(await body.evaluate((e) => e.style.transform)).toBe('');
  await pc.locator('.pc-front .pc-turn').focus();
  await page.keyboard.press('Enter');
  await expect(pc).toHaveClass(/is-flipped/);
  await expect(pc.locator('.pc-back')).toHaveCSS('opacity', '1');
  await expect(pc.locator('.pc-front')).toHaveCSS('opacity', '0');
  expect(await body.evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  await ctx.close();
});

test('without JavaScript every chapter reads and each photograph stands with its place and note', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/');
  for (const c of chapters) await expect(page.locator(`#${c.id} h2`)).toBeVisible();
  for (const c of cardChs) {
    const pc = page.locator(`#${c.id} .pc`).first();
    await expect(pc.locator('.pc-front img')).toBeVisible();
    await expect(pc.locator('.pc-back')).toBeHidden();
    await expect(pc.locator('.pc-cap')).toContainText(c.photos![0].place);
    await expect(pc.locator('.pc-cap-note')).toHaveText(c.photos![0].note);
  }
  await expect(page.locator('#main .pc-turn:visible')).toHaveCount(0);
  await ctx.close();
});
