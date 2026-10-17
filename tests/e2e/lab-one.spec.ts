/* The two-page site's lab page, the shell and the person's part (src/pages/lab/one.astro; spec v2 §3.2,
   §3.5 to §3.7, §8): hidden like the other workbenches (noindex, out of the sitemap, linked from nowhere),
   no sideways scroll at the three check sizes and at 320 px, and a complete page in both still twins:
   reduced motion (nothing waits, every scene at rest, no fixed field) and no JavaScript (every part
   present, the postcards captioned, the card's front alone). Then, on desktop: the Bostancı photograph
   whole; the ported ID card (in chapter I between How I work and Path; turns by keyboard and by click, a
   drag swings it on its rope without turning it, a hover sways it and its lean bends the rope; the photo
   in depth, flat with ?photo=flat); the postcards (a hover puts the card on top and it stays there; the
   large view opens with focus on its labelled close, turns by its turn capsule and by a press made while
   it is still growing, draws its back, and returns by Escape, by the close and by Back); the Record strip in the Record's language; and scroll scenes
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

  test('the card hangs in chapter I, between How I work and Path, with no switch to move it', async ({ page }) => {
    await page.goto(PAGE + '?card=end');
    const order = await page.evaluate(() => ['#how', '#card', '#path', '#photos'].map((s) => document.querySelector(s)!.getBoundingClientRect().top));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    await expect(page.locator('.chapter.ch-1 #card')).toHaveCount(1);
  });

  test('the lanyard follows the card: a hover lean alone bends the rope', async ({ page }) => {
    await page.goto(PAGE);
    await page.locator('#card').evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(3200);
    const box = (await page.locator('#card .idc-card').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1500);
    const d0 = await page.locator('#card [data-rope-path]').getAttribute('d');
    await page.mouse.move(box.x + box.width * 0.95, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(900);
    expect(await page.locator('#card [data-rope-path]').getAttribute('d'), 'the lean moved the rope').not.toBe(d0);
  });

  test('the photo is in depth by default and flat with ?photo=flat', async ({ page }) => {
    await page.goto(PAGE);
    const relief = page.locator('#card .idc-relief');
    await relief.scrollIntoViewIfNeeded();
    await expect(relief).toHaveClass(/is-ready/);
    expect(await relief.evaluate((e) => getComputedStyle(e).display)).toBe('block');
    await page.goto(PAGE + '?photo=flat');
    expect(await page.locator('#card .idc-relief').evaluate((e) => getComputedStyle(e).display)).toBe('none');
    await expect(page.locator('#card .idc-photo img')).toBeVisible();
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
    /* the way out is the first thing a keyboard reaches; the turn capsule turns the card and the back draws */
    await expect(dlg.locator('[data-pv-close]')).toBeFocused();
    await dlg.locator('[data-pv-turn]').click();
    await expect(big).toHaveClass(/is-flipped/);
    await expect(big).toHaveClass(/is-drawn/);
    await expect(big.locator('.bk-plate svg')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dlg).not.toHaveAttribute('open', '');
    await expect(first.locator('.pc-open')).toBeFocused();
    await page.locator('[data-postcard="1"] .pc-open').click();
    await expect(dlg).toHaveAttribute('open', '');
    await page.goBack();
    await expect(dlg).not.toHaveAttribute('open', '');
    expect(new URL(page.url()).pathname).toMatch(/lab\/one\/$/);
    /* the labelled close closes, and after the first close it starts folded */
    await page.locator('[data-postcard="2"] .pc-open').click();
    await expect(dlg).toHaveAttribute('open', '');
    await expect(dlg.locator('[data-pv-caps]')).toHaveClass(/folded/);
    await dlg.locator('[data-pv-close]').click();
    await expect(dlg).not.toHaveAttribute('open', '');
  });

  test('a press while the large view is still growing is kept and turns the card when it lands', async ({ page }) => {
    await page.goto(PAGE);
    const first = page.locator('[data-postcard="0"]');
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await first.locator('.pc-open').click();
    const vp = page.viewportSize()!;
    await page.mouse.click(vp.width / 2, vp.height / 2);
    const big = page.locator('[data-pc-dialog] [data-big-card]');
    await expect(big).toHaveClass(/is-flipped/);
    /* round four: the press turns it once, never twice (its click is not a second request) */
    await page.waitForTimeout(1200);
    await expect(big).toHaveClass(/is-flipped/);
  });

  test('round four: a postcard press that lands before the large view\'s code loads is kept and opens it', async ({ page }) => {
    await page.goto(PAGE);
    const table = page.locator('[data-pc-table]');
    /* at the top of the page the person's part is far away, so its module has not loaded yet */
    await expect(table).toHaveAttribute('data-pc-early', '');
    await page.locator('[data-postcard="1"] .pc-open').evaluate((b) => (b as HTMLButtonElement).click());
    await table.scrollIntoViewIfNeeded();
    const dlg = page.locator('[data-pc-dialog]');
    await expect(dlg).toHaveAttribute('open', '');
    await expect(table).not.toHaveAttribute('data-pc-pending', /.*/);
    await dlg.locator('[data-pv-close]').click();
    await expect(dlg).not.toHaveAttribute('open', '');
  });

  test('round four: the table photographs are fetched at page load, before the chapter comes near', async ({ page }) => {
    await page.goto(PAGE);
    await expect.poll(() => page.locator('.pc-pic img').evaluateAll((els) => els.every((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0)), { timeout: 8000 }).toBe(true);
    await expect(page.locator('.pc-pic.is-in')).toHaveCount(3);
  });

  test('round four: the ID card has its grooved, turning surface on both faces (T27)', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('#card .idc-front .idc-cd')).toHaveCount(1);
    await expect(page.locator('#card .idc-back .idc-cd')).toHaveCount(1);
    expect(await page.locator('#card .idc-front .idc-tex').evaluate((e) => getComputedStyle(e, '::before').backgroundImage)).toMatch(/repeating-radial-gradient/);
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
    /* round four: the strip shows three rows, so its months link to their rows on the Record */
    for (const href of await strip.locator('a.ym').evaluateAll((els) => els.map((e) => e.getAttribute('href')))) expect(href).toMatch(/record\/#\S+/);
    /* round four (T26): a project name answers a hover (its underline draws) */
    const pj = strip.locator('.pj').first();
    await pj.scrollIntoViewIfNeeded();
    await pj.hover();
    await expect.poll(() => pj.evaluate((e) => getComputedStyle(e).backgroundSize)).toMatch(/^100%/);
    /* round four: at 1440 an essay's plate stands in the margin right of the content column */
    const plate = await strip.locator('.entry.has-thumb .e-thumb').boundingBox(), main = await strip.locator('.entry.has-thumb .e-main').boundingBox();
    expect(plate!.width).toBeGreaterThan(170);
    expect(plate!.x).toBeGreaterThan(main!.x + 600);
    expect(plate!.x + plate!.width).toBeLessThan(1440 - 48);
    /* spec v3 §8: the recorder stands above the chapter's title (weight 500, the sections' one role), its
       tape leaves it and becomes the spine at the head, and it never takes the spin loop on Home */
    expect(await strip.locator('.rs-title').evaluate((e) => getComputedStyle(e).fontWeight)).toBe('500');
    const obj = await strip.locator('.rs-obj').boundingBox(), title = await strip.locator('.rs-title').boundingBox();
    expect(obj!.y + obj!.height).toBeLessThanOrEqual(title!.y);
    await expect(strip.locator('.rs-media')).toHaveAttribute('data-spin', 'off');
    const tape = await strip.locator('.rs-tape').boundingBox(), body = await strip.locator('.rs-body').boundingBox();
    const spineX = await strip.locator('.rs-body').evaluate((e) => { const r = e.getBoundingClientRect(), b = getComputedStyle(e, '::before'); return r.left + parseFloat(b.left); });
    expect(Math.abs(tape!.x - spineX)).toBeLessThan(1.5);
    expect(Math.abs(tape!.y + tape!.height - body!.y)).toBeLessThan(1.5);
    /* the drawing never widens the page */
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
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

/* Review row T23 (the owner: no repetition): outside the brief, which names the projects on purpose, no
   sentence of five or more words appears twice in the page's visible text. Sentences are cut at . ! ? and
   at line ends; letter case and spacing are ignored. */
test('no sentence of five or more words is said twice outside the brief', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAGE + '?still');
  const text = await page.evaluate(() => {
    const brief = document.querySelector('#brief');
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main li, main figcaption, main blockquote')) {
      if (brief?.contains(el) || el.closest('template, [hidden], [aria-hidden="true"]')) continue;
      if (el.querySelector('p, li, h2, h3')) continue;
      out.push(el.innerText);
    }
    return out;
  });
  expect(text.length, 'text blocks read').toBeGreaterThan(20);
  const seen = new Map<string, number>();
  for (const block of text) for (const raw of block.split(/[.!?\n]+/)) {
    const t = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    if (t.split(' ').length >= 5) seen.set(t, (seen.get(t) ?? 0) + 1);
  }
  const twice = [...seen].filter(([, n]) => n > 1).map(([t]) => t);
  expect(twice, 'sentences said more than once').toEqual([]);
});

test('touch: the strap is a rope too (driven by the card, never by a hand), and the photo view closes from its capsule', async ({ browser }) => {
  const ctx = await browser.newContext(phone);
  const page = await ctx.newPage();
  await page.goto(PAGE);
  const card = page.locator('#card .idc');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-rope/);
  const first = page.locator('[data-postcard="0"] .pc-open');
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const dlg = page.locator('[data-pc-dialog]');
  await expect(dlg).toHaveAttribute('open', '');
  await dlg.locator('[data-pv-close]').click();
  await expect(dlg).not.toHaveAttribute('open', '');
  await ctx.close();
});

/* Round 6, row S10: on iPhone the recorder's contact shadow showed as a white square. The old file was a grey
   map on white, drawn with multiply; a blend that lands in a layer without the dark ground returns the
   white. The shadow is now black with alpha, drawn with normal blending: whatever layer it lands in, it
   has no light pixel to show. */
test('round six (S10): on a phone the recorder\'s shadow is black with alpha, with no blend mode', async ({ browser }) => {
  const ctx = await browser.newContext(phone);
  const page = await ctx.newPage();
  await page.goto(PAGE);
  const media = page.locator('#record .rs-media');
  await media.scrollIntoViewIfNeeded();
  const sh = media.locator('img.m-shadow');
  await expect(sh).toHaveAttribute('data-blend', 'normal');
  await expect.poll(() => sh.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
  const r = await sh.evaluate((i: HTMLImageElement) => {
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const g = c.getContext('2d')!; g.drawImage(i, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let rgb = 0, alpha = 0, edge = 0;
    for (let k = 0; k < d.length; k += 4) { rgb = Math.max(rgb, d[k], d[k + 1], d[k + 2]); alpha = Math.max(alpha, d[k + 3]); }
    for (let x = 0; x < c.width; x++) edge = Math.max(edge, d[x * 4 + 3]);   // the top row: the far floor
    return { blend: getComputedStyle(i).mixBlendMode, display: getComputedStyle(i).display, rgb, alpha, edge, file: i.currentSrc.split('/').pop() };
  });
  expect(r.file).toMatch(/^shadow-a\./);
  expect(r.blend).toBe('normal');
  expect(r.display).not.toBe('none');
  expect(r.rgb, 'no light pixel anywhere in the shadow').toBeLessThanOrEqual(2);
  expect(r.alpha, 'the shadow is there').toBeGreaterThan(100);
  expect(r.edge, 'the far floor is clear').toBeLessThanOrEqual(2);
  await ctx.close();
});

/* Round 4, rows V7 and V8: the name in its display instance (48 px desktop, two lines of 34 px on a phone,
   the bar mark in the same face) and the glass family, with today's settings behind lab switches. */
test.describe('the name and the glass (round 4)', () => {
  const nameOf = (page: Page) => page.locator('#brief .name').evaluate((h) => {
    const cs = getComputedStyle(h), r = document.createRange(); r.selectNodeContents(h);
    const tops = new Set([...r.getClientRects()].filter((x) => x.width > 0 && x.height < 80).map((x) => Math.round(x.top / 4)));
    return { face: cs.fontFamily, weight: cs.fontWeight, size: Math.round(parseFloat(cs.fontSize)), lines: tops.size,
      mark: getComputedStyle(document.querySelector('.mark')!).fontFamily };
  });

  test('desktop: the display instance at 48 px on one line, the mark in the same face; ?name and ?namesize switch it', async ({ page }) => {
    await page.setViewportSize(desktop.viewport);
    await page.goto(PAGE);
    await page.evaluate(() => document.fonts.ready);
    const n = await nameOf(page);
    expect(n.face).toMatch(/^"Newsreader Name"/);
    expect(n.mark).toMatch(/^"Newsreader Name"/);
    expect(n.weight).toBe('380');
    expect(Math.round(n.size)).toBe(48);
    expect(await page.evaluate(() => document.fonts.check('380 48px "Newsreader Name"', 'Kuyucaklıoğlu'))).toBe(true);
    await page.goto(PAGE + '?name=current');
    expect(await nameOf(page)).toMatchObject({ weight: '500', size: 42 });
    await page.goto(PAGE + '?name=fraunces');
    expect((await nameOf(page)).face).toMatch(/^"Fraunces Name"/);
    await page.goto(PAGE + '?namesize=60');
    expect(Math.round((await nameOf(page)).size)).toBe(60);
  });

  test('phone: the name in two lines of 34 px', async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.evaluate(() => document.fonts.ready);
    const n = await nameOf(page);
    expect(Math.round(n.size)).toBe(34);
    expect(n.lines).toBe(2);
    await ctx.close();
  });

  test('the glass family: aura rim and readable inactive label by default; ?glass=now restores round 3', async ({ page }) => {
    await page.setViewportSize(desktop.viewport);
    await page.goto(PAGE);
    const look = () => page.evaluate(() => {
      const t = document.querySelector('.tabs')!, off = document.querySelector('.tabs a:not([aria-current])')!;
      return { rim: getComputedStyle(t, '::before').display, blur: getComputedStyle(t).backdropFilter, off: getComputedStyle(off).color };
    });
    const a = await look();
    expect(a.rim).toBe('block');
    expect(a.blur).toContain('brightness(0.5)');
    expect(a.off).toBe('rgb(211, 207, 199)'); /* --ink-2 */
    await page.goto(PAGE + '?glass=now');
    const now = await look();
    expect(now.rim).toBe('none');
    expect(now.blur).toBe('blur(22px) saturate(1.5)');
    expect(now.off).toBe('rgb(161, 157, 150)'); /* --ink-3 */
  });
});

test('round four (V5): on a phone the postcard back\'s lower block stays tight and inside the card', async ({ browser }) => {
  const ctx = await browser.newContext({ ...phone, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  const first = page.locator('[data-postcard="0"] .pc-open');
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const dlg = page.locator('[data-pc-dialog]');
  await expect(dlg).toHaveAttribute('open', '');
  await page.waitForTimeout(900);
  await dlg.locator('[data-pv-turn]').click();
  await expect(dlg.locator('[data-big-card]')).toHaveClass(/is-flipped/);
  const m = await dlg.locator('.big-back').evaluate((back) => {
    const r = back.getBoundingClientRect();
    const em = (sel: string) => { const c = getComputedStyle(back.querySelector(sel)!); return parseFloat(c.letterSpacing) / parseFloat(c.fontSize); };
    const right = Math.max(...[...back.querySelectorAll('.bk-col dt, .bk-col dd, .bk-col .hex')].map((e) => e.getBoundingClientRect().right));
    return { dt: em('.bk-col dt'), micro: em('.bk-micro'), head: em('.bk-head .no'), over: right - (r.right - r.width * 0.08 + 1) };
  });
  expect(m.dt).toBeLessThanOrEqual(0.13);
  expect(m.micro).toBeLessThanOrEqual(0.21);
  expect(m.head).toBeLessThanOrEqual(0.13);
  expect(m.over).toBeLessThanOrEqual(0);
  await ctx.close();
});
