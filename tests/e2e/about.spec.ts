/* About as an "about me" article (brief, About, 2026-10-10 evening; made livelier 2026-10-11): the ID card
   opens the page, the chapters from content/site.json follow in the reading style and are the rail's
   rungs, each with its own object (facts, two tracks, a quote, the year), and the photographs are
   postcards spread through the page, each beside its chapter (2026-10-11), turned by a tap, a click or
   the keyboard (no buttons), picked up and tossed back by a mouse, with alt text, never drawn larger
   than their pixels, a still twin, and no text column squeezed on a phone. */
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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

/* The three alternatives to the postcard (2026-10-11 evening: "a design that would win a design award";
   docs/research/2026-10-photo-presentation.md), switchable with ?photos=1|2|3 until the owner picks:
   Darkroom (the print develops as it comes into view; a tap shows its label in light), Proof (a strip
   on a light table, a loupe, a tap enlarges the frame) and Depth (a window with a painted depth map;
   look around, tap to pull focus). Each stands where the postcard stood, keeps the alt text, never
   draws a photograph larger than its pixels, and has its still twin. */
const LOOKS = [['1', '.dk'], ['2', '.pf'], ['3', '.dp']] as const;

test.describe('About photo alternatives, desktop', () => {
  test.use(desktop);

  for (const [n, sel] of LOOKS) {
    test(`?photos=${n} puts ${sel} where each postcard stood, with its alt text and the switch`, async ({ page }) => {
      await page.goto(`about/?photos=${n}&still`);
      await expect(page.locator('#main .pc')).toHaveCount(0);
      await expect(page.locator(`#main ${sel}`)).toHaveCount(photoCount);
      for (const c of cardChs) {
        const fig = page.locator(`#${c.id} ${sel}`).first();
        expect(await fig.locator('img').first().getAttribute('alt')).toBe(c.photos![0].alt);
        const words = (await page.locator(`#${c.id} .ch-body`).boundingBox())!;
        const box = (await fig.boundingBox())!;
        expect(box.x, 'in the margin, right of the words').toBeGreaterThan(words.x + words.width);
      }
      const sw = page.locator('.photo-switch a');
      await expect(sw).toHaveCount(4);
      await expect(page.locator('.photo-switch a[aria-current]')).toHaveText(['Postcard', 'Darkroom', 'Proof', 'Depth'][+n]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    });
  }

  test('the default page has no switch, and the alternatives wait inert in templates', async ({ page }) => {
    await page.goto('about/?still');
    await expect(page.locator('.photo-switch')).toHaveCount(0);
    await expect(page.locator('#main .dk, #main .pf, #main .dp')).toHaveCount(0);
    expect(await page.locator('#main [data-photo] template').count()).toBe(photoCount * 3);
  });

  test('Darkroom: the print develops in view; a click shows its label in light, and takes it away', async ({ page }) => {
    await page.goto('about/?photos=1');
    const dk = page.locator(`#${cardChs[1].id} .dk`);
    await dk.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await expect(dk).toHaveClass(/is-developed/, { timeout: 10_000 });
    const hit = dk.locator('.dk-hit');
    await expect(hit).toHaveAttribute('aria-pressed', 'false');
    await hit.click();
    await expect(dk).toHaveClass(/is-safe/);
    await expect(hit).toHaveAttribute('aria-pressed', 'true');
    await expect(dk.locator('.dk-plate')).toHaveCSS('opacity', '1', { timeout: 3000 });
    await expect(dk.locator('.dk-place .vh')).toHaveText(cardChs[1].photos![0].place.split(',')[0]);
    await expect(dk.locator('.dk-note')).toHaveText(cardChs[1].photos![0].note);
    await hit.focus();
    await page.keyboard.press('Enter');
    await expect(dk).not.toHaveClass(/is-safe/);
  });

  test('Proof: the loupe follows a mouse and magnifies within the pixels; a click enlarges, Escape closes', async ({ page }) => {
    await page.goto('about/?photos=2');
    const pf = page.locator(`#${cardChs[1].id} .pf`);
    await pf.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await expect(pf).toHaveClass(/is-seen/);
    const fr = (await pf.locator('.pf-frame--pick').boundingBox())!;
    const loupe = pf.locator('.pf-loupe');
    const at0 = (await loupe.boundingBox())!;
    await page.mouse.move(fr.x + fr.width * 0.3, fr.y + fr.height * 0.3, { steps: 6 });
    await expect(pf).toHaveClass(/is-follow/);
    await expect.poll(async () => { const b = (await loupe.boundingBox())!; return Math.hypot(b.x + b.width / 2 - (fr.x + fr.width * 0.3), b.y + b.height / 2 - (fr.y + fr.height * 0.3)); }, { timeout: 3000 }).toBeLessThan(3);
    expect(Math.abs(at0.x - (await loupe.boundingBox())!.x)).toBeGreaterThan(20);
    /* the lens's picture is never drawn larger than the file's pixels */
    const mag = pf.locator('.pf-mag img');
    await page.waitForFunction((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0, await mag.elementHandle(), { timeout: 15_000 });
    const m = await mag.evaluate((i: HTMLImageElement) => ({ drawn: i.getBoundingClientRect().width, px: i.naturalWidth, dpr: devicePixelRatio }));
    expect(m.drawn * m.dpr).toBeLessThanOrEqual(m.px + 1);
    expect(m.drawn, 'it magnifies').toBeGreaterThan(fr.width * 1.2);
    /* a click enlarges the frame in a modal dialog; Escape closes it and gives the focus back */
    await page.mouse.click(fr.x + fr.width * 0.3, fr.y + fr.height * 0.3);
    const dlg = pf.locator('.pf-dlg');
    await expect(dlg).toHaveJSProperty('open', true);
    await expect(dlg.locator('.pf-dlg-note')).toHaveText(cardChs[1].photos![0].note);
    await page.waitForTimeout(700);
    const big = (await dlg.locator('.pf-dlg-pic').boundingBox())!;
    expect(big.width).toBeGreaterThan(fr.width);
    const nat = await dlg.locator('img').evaluate((i: HTMLImageElement) => +i.getAttribute('width')!);
    expect(big.width).toBeLessThanOrEqual(nat + 1);
    await page.keyboard.press('Escape');
    await expect(dlg).toHaveJSProperty('open', false, { timeout: 3000 });
    await expect(pf.locator('.pf-open')).toBeFocused();
    /* leaving the strip sends the loupe back to where it lay */
    await page.mouse.move(5, 450, { steps: 4 });
    await expect(pf).not.toHaveClass(/is-follow/);
    await expect.poll(async () => Math.abs((await loupe.boundingBox())!.x - at0.x), { timeout: 3000 }).toBeLessThan(2);
  });

  test('Depth: moving over the photo moves the eye; a click pulls focus and shows where', async ({ page }) => {
    await page.goto('about/?photos=3');
    const dp = page.locator(`#${cardChs[1].id} .dp`);
    await dp.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await expect(dp).toHaveClass(/is-live/);
    const pic = (await dp.locator('.dp-pic').boundingBox())!;
    await page.mouse.move(pic.x + pic.width - 4, pic.y + pic.height / 2, { steps: 5 });
    await expect.poll(() => dp.evaluate((e) => +getComputedStyle(e).getPropertyValue('--lx')), { timeout: 3000 }).toBeGreaterThan(0.5);
    await page.mouse.click(pic.x + pic.width / 2, pic.y + pic.height * 0.9);
    await expect(dp.locator('.dp-ring')).toHaveClass(/is-on/);
    await expect(dp.locator('.dp-label')).toContainText(cardChs[1].photos![0].note);
    await expect(dp.locator('.dp-label')).toContainText(cardChs[1].photos![0].place);
  });
});

for (const [n, sel] of LOOKS) {
  test(`?photos=${n}: no photograph is stretched (phone 3x)`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone, deviceScaleFactor: 3, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto(`about/?photos=${n}&still`);
    await expect(page.locator(`#main ${sel}`)).toHaveCount(photoCount);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    });
    /* every photograph drawn on the page (the enlarged view's is not drawn until it opens) */
    const q = `#main ${sel} img:not(.pf-dlg img)`;
    await page.waitForFunction((s) => [...document.querySelectorAll<HTMLImageElement>(s)].every((i) => !i.getBoundingClientRect().width || (i.complete && i.naturalWidth > 0)), q, { timeout: 20_000 });
    const all = await page.evaluate(async (s) => Promise.all([...document.querySelectorAll<HTMLImageElement>(s)].filter((i) => i.getBoundingClientRect().width).map(async (img) => {
      const probe = new Image();
      probe.src = img.currentSrc;
      await probe.decode();
      return { src: img.currentSrc.split('/').pop(), drawn: img.getBoundingClientRect().width, px: probe.naturalWidth, dpr: devicePixelRatio };
    })), q);
    expect(all.length).toBeGreaterThanOrEqual(photoCount);
    for (const s of all) expect(s.drawn * s.dpr, `${s.src}: drawn ${s.drawn} css px at ${s.dpr}x from ${s.px} px`).toBeLessThanOrEqual(s.px + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}

test.describe('About photo alternatives, phone', () => {
  test.use(phone);

  test('Darkroom: a tap shows the label', async ({ page }) => {
    await page.goto('about/?photos=1&still');
    const dk = page.locator('#main .dk').first();
    await dk.scrollIntoViewIfNeeded();
    await expect(dk).toHaveClass(/is-developed/);
    await dk.locator('.dk-hit').tap();
    await expect(dk).toHaveClass(/is-safe/);
  });

  test('Proof: a finger drags the loupe without scrolling the page; a tap enlarges the frame', async ({ page }) => {
    await page.goto('about/?photos=2');
    const pf = page.locator('#main .pf').first();
    await pf.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    const lb = (await pf.locator('.pf-loupe').boundingBox())!;
    const y0 = await page.evaluate(() => scrollY);
    const cdp = await page.context().newCDPSession(page);
    const cx = lb.x + lb.width / 2, cy = lb.y + lb.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - i * 12, y: cy - i * 16 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(200);
    const lb2 = (await pf.locator('.pf-loupe').boundingBox())!;
    expect(lb.y - lb2.y, 'the loupe moved with the finger').toBeGreaterThan(60);
    expect(Math.abs((await page.evaluate(() => scrollY)) - y0), 'the page did not scroll').toBeLessThanOrEqual(1);
    const fr = (await pf.locator('.pf-frame--pick').boundingBox())!;
    await page.touchscreen.tap(fr.x + fr.width * 0.75, fr.y + fr.height * 0.85);
    await expect(pf.locator('.pf-dlg')).toHaveJSProperty('open', true);
    const big = (await pf.locator('.pf-dlg-pic').boundingBox())!;
    expect(big.x).toBeGreaterThanOrEqual(0);
    expect(big.x + big.width).toBeLessThanOrEqual(390);
    await page.touchscreen.tap(195, 60);
    await expect(pf.locator('.pf-dlg')).toHaveJSProperty('open', false, { timeout: 3000 });
  });

  test('Depth: a tap pulls focus; the label stands under the photo', async ({ page }) => {
    await page.goto('about/?photos=3');
    const dp = page.locator('#main .dp').first();
    await dp.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const pic = (await dp.locator('.dp-pic').boundingBox())!;
    await page.touchscreen.tap(pic.x + pic.width / 2, pic.y + pic.height * 0.8);
    await expect(dp.locator('.dp-ring')).toHaveClass(/is-on/);
    const lab = (await dp.locator('.dp-label').boundingBox())!;
    expect(lab.y).toBeGreaterThan(pic.y + pic.height);
  });
});

test('photo alternatives, reduced motion: developed at once, the loupe without lag, depth still and sharp', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/?photos=1');
  const dk = page.locator('#main .dk').first();
  await expect(dk).toHaveClass(/is-developed/);
  await expect(dk).not.toHaveClass(/is-live/);
  await expect(dk.locator('img')).toHaveCSS('opacity', '1');
  await page.goto('about/?photos=3');
  const dp = page.locator('#main .dp').first();
  await expect(dp).not.toHaveClass(/is-live/);
  await expect(dp.locator('.dp-hit')).toBeHidden();
  await page.goto('about/?photos=2');
  const pf = page.locator('#main .pf').first();
  await expect(pf).toHaveClass(/is-seen/);
  await pf.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const fr = (await pf.locator('.pf-frame--pick').boundingBox())!;
  await page.mouse.move(fr.x + 40, fr.y + 40);
  const lb = (await pf.locator('.pf-loupe').boundingBox())!;
  expect(Math.hypot(lb.x + lb.width / 2 - fr.x - 40, lb.y + lb.height / 2 - fr.y - 40)).toBeLessThan(2);
  await ctx.close();
});

test('without JavaScript, ?photos still shows the postcards with their captions', async ({ browser }) => {
  const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  await page.goto('about/?photos=2');
  await expect(page.locator('#main .pc')).toHaveCount(photoCount);
  await expect(page.locator('#main .pf')).toHaveCount(0);
  await expect(page.locator('#main .pc-cap-note').first()).toBeVisible();
  await ctx.close();
});

/* axe on each alternative (a11y.spec.ts covers the default page): no serious or critical violations */
for (const [n] of LOOKS) {
  test(`axe /about/?photos=${n}`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto(`about/?photos=${n}&still`);
    const res = await new AxeBuilder({ page: page as any }).include('#main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((x) => x.target.join(' ')).join(' | ')}`)).toEqual([]);
    await ctx.close();
  });
}
