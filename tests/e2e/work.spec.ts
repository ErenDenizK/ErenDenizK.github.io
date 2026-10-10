/* Work, the full catalogue (ADR-0014; docs/research/2026-10-work-page.md): the line-up opening, one chapter
   per product starting at a new screen, the product's name in its wordmark, real screens in frames that
   name the platform (a browser frame with the real address, phone frames for a phone-first product), the
   object as the emblem (or the picture, where there are no screens), the reel stepped by the reading
   position on wide windows, and every still twin: no script, reduced motion, short windows and phones. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, settle, PROJECTS } from './helpers';

const TITLES: Record<string, string> = { recto: 'Recto', 'english-prep': 'English Prep', 'eat-map': 'Eat Map' };

/** Where the page must be scrolled to show step k of a chapter's reel (the stage pins under the bar). */
const stepY = (page: Page, id: string, k: number) => page.evaluate(([id, k]) => {
  const a = document.getElementById(id as string)!;
  const st = a.querySelector<HTMLElement>('.w-stage')!;
  const n = a.querySelectorAll('.w-shot').length;
  const step = n > 1 ? (a.offsetHeight - st.offsetHeight) / (n - 1) : 0;
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'));
  return Math.round(a.getBoundingClientRect().top + scrollY - bar + (k as number) * step + 2);
}, [id, k] as const);
const reelState = (page: Page, id: string) => page.evaluate((id) => {
  const a = document.getElementById(id)!;
  return {
    on: [...a.querySelectorAll('.w-shot')].map((s) => s.classList.contains('is-on')),
    visible: [...a.querySelectorAll<HTMLElement>('.w-shot')].map((s) => getComputedStyle(s).visibility === 'visible' && +getComputedStyle(s).opacity > 0.5),
    current: [...a.querySelectorAll('.w-tick')].findIndex((t) => t.getAttribute('aria-current') === 'step'),
    stageTop: Math.round(a.querySelector('.w-stage')!.getBoundingClientRect().top),
  };
}, id);

test.describe('desktop', () => {
  test.use(desktop);

  test('the opening lines the products up by their wordmarks', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const items = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('.w-lineup li a')].map((a) => ({
      href: a.getAttribute('href'), name: a.querySelector('.wm')?.textContent, face: getComputedStyle(a.querySelector('.wm')!).fontFamily,
      top: Math.round(a.getBoundingClientRect().top),
    })));
    expect(items.map((x) => x.href)).toEqual(PROJECTS.map((p) => `#${p}`));
    expect(items.map((x) => x.name)).toEqual(PROJECTS.map((p) => TITLES[p]));
    expect(new Set(items.map((x) => x.face)).size, 'each product in its own face').toBe(3);
    for (const x of items) expect(x.top, 'the line-up is in the first screen').toBeLessThan(900);
    /* and the first chapter begins in the first screen too */
    const first = await page.evaluate(() => Math.round(document.querySelector('.w-proj')!.getBoundingClientRect().top));
    expect(first).toBeLessThan(900);
  });

  test('each chapter says what the product is: wordmark, real screens in a platform frame, facts, one way in', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const r = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.w-proj')].map((a) => ({
      id: a.id,
      h2: a.querySelector('h2.w-title')?.textContent?.trim(),
      wordmark: !!a.querySelector('h2.w-title .wm[data-wordmark]'),
      urls: [...a.querySelectorAll('.fr-url')].map((u) => u.textContent),
      webFrames: a.querySelectorAll('.fr-web img').length,
      phoneFrames: a.querySelectorAll('.fr-phone img').length,
      captions: [...a.querySelectorAll('.w-cap-t')].map((c) => c.textContent?.trim() ?? ''),
      alts: [...a.querySelectorAll('.w-reel img')].every((i) => (i.getAttribute('alt') ?? '').length > 10),
      emblem: !!a.querySelector('.media.w-emblem'), hero: !!a.querySelector('.media.w-hero'),
      facts: [...a.querySelectorAll('.w-facts dt')].map((d) => d.textContent),
      ways: a.querySelectorAll('a.p-open[data-p]').length,
    })));
    const by = Object.fromEntries(r.map((x) => [x.id, x]));
    for (const p of PROJECTS) {
      expect(by[p].h2, `${p}: the heading is the product's name`).toBe(TITLES[p]);
      expect(by[p].wordmark, `${p}: set in its wordmark`).toBe(true);
      expect(by[p].ways, `${p}: one way into the full story`).toBe(1);
      expect(by[p].facts, `${p}: status and platform`).toEqual(expect.arrayContaining(['Status', 'Runs on', 'Stack']));
    }
    /* web products: a browser frame carrying their real address, captioned screens with alt text */
    for (const p of ['recto', 'english-prep']) {
      expect(by[p].urls.length, `${p}: browser frames`).toBeGreaterThanOrEqual(2);
      expect(new Set(by[p].urls), `${p}: the frame shows the product's own address`).toEqual(new Set([`erendenizk.github.io/${p}`]));
      expect(by[p].captions.every((c) => c.length > 10), `${p}: every screen is captioned`).toBe(true);
      expect(by[p].alts, `${p}: every screen has alt text`).toBe(true);
      expect(by[p].emblem, `${p}: the object stands beside the name as an emblem`).toBe(true);
    }
    expect(by['english-prep'].phoneFrames, 'the phone-first product shows phone screens too').toBeGreaterThanOrEqual(2);
    expect(by.recto.phoneFrames, 'Recto has no phone captures, so no phone frame').toBe(0);
    /* Eat Map: honest, no made-up screens; its object is the picture */
    expect(by['eat-map'].webFrames + by['eat-map'].phoneFrames, 'Eat Map shows no screens it does not have').toBe(0);
    expect(by['eat-map'].hero && !by['eat-map'].emblem, 'Eat Map: the object is the picture').toBe(true);
  });

  test('the reel steps with the reading position while the stage stays pinned; ticks go to a step', async ({ page }) => {
    await page.goto('work/'); await settle(page, 600);
    expect(await page.evaluate(() => document.documentElement.classList.contains('reel-on'))).toBe(true);
    const bar = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')));
    for (const id of ['recto', 'english-prep']) {
      const n = await page.locator(`#${id} .w-shot`).count();
      for (let k = 0; k < n; k++) {
        await page.evaluate((y) => scrollTo(0, y), await stepY(page, id, k)); await settle(page, 700);
        const s = await reelState(page, id);
        expect(s.on.indexOf(true), `${id}: step ${k} shown`).toBe(k);
        expect(s.on.filter(Boolean).length, `${id}: one step at a time`).toBe(1);
        expect(s.visible.filter(Boolean).length, `${id}: one frame visible`).toBe(1);
        expect(s.current, `${id}: the tick follows`).toBe(k);
        expect(Math.abs(s.stageTop - bar), `${id}: the stage stays pinned under the bar`).toBeLessThanOrEqual(2);
      }
    }
    /* a tick scrolls the page to its step (the browser keeps the scroll) */
    await page.evaluate((y) => scrollTo(0, y), await stepY(page, 'recto', 0)); await settle(page, 500);
    const y0 = await page.evaluate(() => scrollY);
    await page.locator('#recto .w-tick').nth(2).click(); await settle(page, 1400);
    expect(await page.evaluate(() => scrollY), 'the tick moved the page').toBeGreaterThan(y0);
    expect((await reelState(page, 'recto')).on.indexOf(true)).toBe(2);
    /* every chapter starts at a new screen: none begins before the previous one ends */
    const boxes = await page.evaluate(() => [...document.querySelectorAll('.w-proj')].map((a) => { const r = a.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY, r.height]; }));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i][0]).toBeGreaterThanOrEqual(boxes[i - 1][1] - 1);
    for (const b of boxes) expect(b[2], 'each chapter at least a window tall').toBeGreaterThanOrEqual(900 - bar - 1);
  });

  test('the signature clip plays once its step is shown, alone; reduced motion keeps its poster', async ({ page, browser }) => {
    await page.goto('work/'); await settle(page, 600);
    const k = await page.evaluate(() => [...document.querySelectorAll('#recto .w-shot')].findIndex((s) => s.classList.contains('is-clip')));
    expect(k, 'Recto\'s reel has its clip').toBeGreaterThan(0);
    expect(await page.evaluate(() => !!document.querySelector('#recto video.w-clip source[src]')), 'no sources before the step').toBe(false);
    await page.evaluate((y) => scrollTo(0, y), await stepY(page, 'recto', k)); await settle(page, 1500);
    const r = await page.evaluate(() => ({
      src: !!document.querySelector('#recto video.w-clip source[src]'),
      playing: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
    }));
    expect(r.src, 'the clip loads when its step is shown').toBe(true);
    expect(r.playing, 'at most one video on the page').toBeLessThanOrEqual(1);

    const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce' });
    const p2 = await ctx.newPage();
    await p2.goto(page.url().replace(/#.*$/, '')); await settle(p2, 600);
    await p2.evaluate((y) => scrollTo(0, y), await stepY(p2, 'recto', k)); await settle(p2, 900);
    const s = await reelState(p2, 'recto');
    expect(s.on.indexOf(true), 'reduced motion: the steps still swap').toBe(k);
    expect(await p2.evaluate(() => getComputedStyle(document.querySelector('#recto .w-shot')!).transitionDuration.split(',').every((d) => parseFloat(d) === 0)), 'without a fade').toBe(true);
    expect(await p2.evaluate(() => !!document.querySelector('#recto video.w-clip source[src]')), 'reduced motion: the poster only').toBe(false);
    await ctx.close();
  });

  test('without JavaScript every screen is a framed figure in a list, and nothing is hidden', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(new URL('work/', test.info().project.use.baseURL).href); await p.waitForLoadState('load');
    const r = await p.evaluate(() => ({
      on: document.documentElement.classList.contains('reel-on'),
      hidden: [...document.querySelectorAll<HTMLElement>('.w-shot')].filter((s) => getComputedStyle(s).visibility !== 'visible' || +getComputedStyle(s).opacity < 1).length,
      ticks: [...document.querySelectorAll<HTMLElement>('.w-ticks')].filter((t) => t.offsetParent !== null).length,
      tall: [...document.querySelectorAll<HTMLElement>('.w-proj')].every((a) => a.offsetHeight >= innerHeight - 90),
    }));
    expect(r.on, 'the inline check needs JavaScript').toBe(false);
    expect(r.hidden, 'every screen shows').toBe(0);
    expect(r.ticks, 'no ticks without the script').toBe(0);
    expect(r.tall, 'chapters still start at a new screen').toBe(true);
    await ctx.close();
  });

  test('opening a chapter\'s project shows the sheet titled by the wordmark', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    await page.locator('#english-prep a.p-open').click(); await settle(page, 1200);
    const t = await page.evaluate(() => {
      const h = document.querySelector('#focus .case-title');
      return { text: h?.textContent?.trim(), wm: !!h?.querySelector('.wm[data-wordmark="english-prep"]') };
    });
    expect(t).toEqual({ text: 'English Prep', wm: true });
  });
});

test.describe('fit', () => {
  for (const [w, h] of [[1440, 900], [1440, 790], [1280, 720], [1000, 700]] as const) {
    test(`${w}x${h}: a pinned chapter's text always fits its stage, or the chapter is not pinned`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(new URL('work/?still', test.info().project.use.baseURL).href); await settle(p, 600);
      const r = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>('.w-proj.has-reel')].map((a) => {
        const st = a.querySelector<HTMLElement>('.w-stage')!, cs = getComputedStyle(st);
        return { id: a.id, pinned: !a.classList.contains('no-pin'), text: a.querySelector<HTMLElement>('.w-text')!.offsetHeight,
          room: st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom), ticks: !a.querySelector('.w-ticks')!.hasAttribute('hidden') };
      }));
      for (const c of r) {
        if (c.pinned) expect(c.text, `${c.id} fits`).toBeLessThanOrEqual(c.room + 1);
        expect(c.ticks, `${c.id}: ticks only while pinned`).toBe(c.pinned);
      }
      if (w === 1440 && h === 900) expect(r.every((c) => c.pinned), 'every reel pins at 1440 x 900').toBe(true);
      expect(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      await ctx.close();
    });
  }
});

test.describe('tablet', () => {
  test.use(tablet);
  test('1180 x 820, touch: the reels pin and step', async ({ page }) => {
    await page.goto('work/'); await settle(page, 600);
    expect(await page.evaluate(() => [...document.querySelectorAll('.w-proj.has-reel')].every((a) => !a.classList.contains('no-pin')))).toBe(true);
    await page.evaluate((y) => scrollTo(0, y), await stepY(page, 'english-prep', 1)); await settle(page, 700);
    expect((await reelState(page, 'english-prep')).on.indexOf(true)).toBe(1);
  });
});

test.describe('phone', () => {
  test.use(phone);
  test('nothing pins; the screens are a row that scrolls inside itself, phone screens for the phone-first product', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const r = await page.evaluate(() => {
      const row = (id: string) => document.querySelector<HTMLElement>(`#${id} .w-screens`)!;
      return {
        on: document.documentElement.classList.contains('reel-on'),
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        rectoScrolls: row('recto').scrollWidth > row('recto').clientWidth,
        epWeb: [...document.querySelectorAll<HTMLElement>('#english-prep .fr-web')].filter((f) => f.offsetParent !== null).length,
        epPhone: [...document.querySelectorAll<HTMLElement>('#english-prep .fr-phone')].filter((f) => f.offsetParent !== null).length,
        sticky: [...document.querySelectorAll<HTMLElement>('.w-stage')].some((s) => getComputedStyle(s).position === 'sticky'),
        order: (() => { const a = document.getElementById('recto')!; const y = (s: string) => a.querySelector(s)!.getBoundingClientRect().top; return y('.w-title') < y('.w-sum') && y('.w-sum') < y('.w-reel') && y('.w-reel') < y('.w-facts'); })(),
      };
    });
    expect(r.on).toBe(false);
    expect(r.pageOverflow, 'the page never scrolls sideways').toBe(0);
    expect(r.rectoScrolls, 'the screens row scrolls inside itself').toBe(true);
    expect(r.epWeb, 'English Prep shows its phone screens on a phone').toBe(0);
    expect(r.epPhone).toBeGreaterThanOrEqual(3);
    expect(r.sticky, 'nothing pins on a phone').toBe(false);
    expect(r.order, 'name, what it is, the screens, then the facts').toBe(true);
  });
});
