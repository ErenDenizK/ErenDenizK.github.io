/* Home, direction A: the cinematic object stage (pages/index.astro, scripts/home.ts, styles/home.css;
   docs/research/2026-10-home-a.md). The first screen is one composed frame; the chapters follow in order,
   each a rail section; the glass stays pinned while they pass (desktop), changes into each product's own
   object and back, and the light and the page accent follow the chapter; phones get one column with the
   glass as an emblem and the way in within thumb reach; the still twins (reduced motion, no JavaScript)
   are complete pages. The pose that the reading position gives the glass is tested in stage.spec.ts. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, settle, PROJECTS } from './helpers';

const OBJ: Record<string, string> = { recto: 'recto', 'english-prep': 'englishprep', 'eat-map': 'eatmap' };
const centre = (page: Page, sel: string) => page.evaluate((sel) => {
  const r = document.querySelector(sel)!.getBoundingClientRect();
  scrollTo(0, scrollY + r.top + r.height / 2 - innerHeight / 2);
}, sel);
const stageBox = (page: Page) => page.evaluate(() => { const r = document.querySelector('.ha-stage .media')!.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }; });

test.describe('Home, desktop', () => {
  test.use(desktop);

  test('the first screen is one frame: the glass, the name, one vision line, Istanbul and its time, the way in', async ({ page }) => {
    await page.goto('?still'); await settle(page, 300);
    expect((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim()).toBe('Eren Deniz Kuyucaklıoğlu');
    const f = await page.evaluate(() => {
      const box = (s: string) => { const r = document.querySelector(s)!.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
      return { glass: box('.ha-stage .media'), n1: box('.ha-n1'), n2: box('.ha-n2'), vision: box('.ha-vision'), go: box('.ha-go .btn'), time: document.querySelector('.ha-time time')!.textContent, vh: innerHeight, vw: innerWidth };
    });
    for (const [k, b] of Object.entries({ n1: f.n1, n2: f.n2, vision: f.vision, go: f.go })) expect(b.b, `${k} is in the first screen`).toBeLessThanOrEqual(f.vh);
    expect(f.glass.t).toBeGreaterThan(60);
    expect(f.glass.b).toBeLessThanOrEqual(f.vh);
    expect(f.glass.r - f.glass.l, 'the glass is the hero, not a stamp').toBeGreaterThanOrEqual(500);
    /* the two lines of the name close in on the glass from above and below */
    expect(f.n1.b).toBeLessThan(f.glass.t + (f.glass.b - f.glass.t) * 0.5);
    expect(f.n2.t).toBeGreaterThan(f.glass.t + (f.glass.b - f.glass.t) * 0.5);
    expect(f.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    /* the vision line is the lead's draft until the owner writes one, and says so */
    await expect(page.locator('.ha-vision[data-draft] .sample')).toHaveText('draft');
  });

  test('chapters in order, each a rail section; each product by its wordmark, with a way in and its real screen', async ({ page }) => {
    await page.goto('?still'); await settle(page, 300);
    const secs = await page.$$eval('.ha [data-ch]', (els) => els.map((e) => (e as HTMLElement).dataset.railSec));
    expect(secs).toEqual(['Eren', 'Who', 'How I work', 'What I build', 'Recto', 'English Prep', 'Eat Map', 'The record', 'Next']);
    /* the lead product first (`featured`), then the others in their order */
    expect(await page.$$eval('.ha-prod', (els) => els.map((e) => e.id.replace('home-', '')))).toEqual(PROJECTS);
    for (const p of PROJECTS) {
      const sec = page.locator(`#home-${p}`);
      await expect(sec.locator('.ha-pname .wm')).toHaveAttribute('data-wordmark', p);
      await expect(sec.locator(`a.p-open[data-p="${p}"]`)).toHaveCount(1);
    }
    await expect(page.locator('#home-recto .fr-web .fr-url')).toHaveText('erendenizk.github.io/recto');
    await expect(page.locator('#home-recto .fr-web img')).toHaveAttribute('alt', /.+/);
    await expect(page.locator('#home-english-prep .fr-phone img')).toHaveCount(1);
    /* no screen is invented for a product without captures */
    await expect(page.locator('#home-eat-map figure')).toHaveCount(0);
    /* the record and the way on */
    expect(await page.locator('.ha-entries li').count()).toBeGreaterThan(0);
    await expect(page.locator('.ha-exit a.ha-door')).toHaveCount(2);
  });

  test('the glass stays pinned while the chapters pass, changes into each product and back; the light follows', async ({ page }) => {
    await page.goto(''); await settle(page, 1200);
    const at0 = await stageBox(page);
    for (const p of PROJECTS) {
      await centre(page, `#home-${p}`);
      await expect.poll(() => page.locator('.ha-stage .media').getAttribute('data-obj'), { timeout: 5000 }).toBe(OBJ[p]);
      expect(await stageBox(page), 'pinned in the same place').toEqual(at0);
      const want = await page.locator(`#home-${p}`).getAttribute('data-light');
      await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent').trim()), { timeout: 3000 }).toBe(want);
      /* on a desktop a product is a still: only edk's grid is fetched, for the scroll to turn */
      await page.waitForTimeout(600);
      await expect(page.locator('.ha-stage .m-layer:not(.leaving) .m-lean, .ha-stage .m-layer:not(.leaving) video:not(.m-drop)')).toHaveCount(0);
    }
    await centre(page, '.ha-exit');
    await expect.poll(() => page.locator('.ha-stage .media').getAttribute('data-obj'), { timeout: 5000 }).toBe('edk');
    expect(await stageBox(page)).toEqual(at0);
    /* the product's way in still opens the focus view over Home */
    await centre(page, '#home-english-prep');
    await page.click('#home-english-prep a.p-open');
    await expect(page.locator('#focus')).toHaveAttribute('open', '');
  });

  test('a fling through the page changes nothing on the way', async ({ page }) => {
    await page.goto(''); await settle(page, 1200);
    const c0 = await page.evaluate(() => (window as any).MediaStage.changes);
    /* through every product and back, 80 ms at each (a chapter must hold the middle for 280 ms); done in the
       page, so neither test latency nor a slow software renderer stretches the dwell */
    await page.evaluate(() => new Promise<void>((done) => {
      const ys = ['#home-recto', '#home-english-prep', '#home-eat-map', '.ha-record', '.ha-tracks'].map((s) => {
        const r = document.querySelector(s)!.getBoundingClientRect(); return scrollY + r.top + r.height / 2 - innerHeight / 2;
      });
      ys.push(0);
      const go = (i: number) => { scrollTo(0, ys[i]); if (i + 1 < ys.length) setTimeout(() => go(i + 1), 80); else done(); };
      go(0);
    }));
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as any).MediaStage.changes) - c0).toBe(0);
    await expect(page.locator('.ha-stage .media')).toHaveAttribute('data-obj', 'edk');
  });

  test('a press on the glass sends its ring of light and retires the hint', async ({ page }) => {
    await page.goto(''); await settle(page, 1200);
    await expect(page.locator('.ha-hint')).toBeVisible();
    const b = (await page.locator('.ha-stage .media').boundingBox())!;
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await expect(page.locator('.ha-ring')).toHaveClass(/go/);
    await expect(page.locator('.ha-hint')).toBeHidden();
    await page.reload(); await settle(page, 800);
    await expect(page.locator('.ha-hint'), 'shown until the first press only').toBeHidden();
  });
});

test.describe('Home, tablet', () => {
  test.use(tablet);
  test('the glass stands right of one text column; nothing of the text runs under it', async ({ page }) => {
    await page.goto('?still'); await settle(page, 300);
    const r = await page.evaluate(() => {
      const g = document.querySelector('.ha-stage .media')!.getBoundingClientRect();
      const texts = [...document.querySelectorAll('.ha-l, .ha-r, .ha-head')].map((e) => e.getBoundingClientRect().right);
      return { gl: g.left, right: Math.max(...texts), over: document.documentElement.scrollWidth - innerWidth };
    });
    expect(r.right).toBeLessThanOrEqual(r.gl + 60);
    expect(r.over).toBeLessThanOrEqual(0);
  });
});

test.describe('Home, phone', () => {
  test.use(phone);
  test('one column: the glass heads it, becomes an emblem as the story starts, and the way in is in thumb reach', async ({ page }) => {
    await page.goto(''); await settle(page, 1000);
    await expect(page.locator('html')).toHaveClass(/ha-pin/);
    const go = (await page.locator('.ha-go .btn').boundingBox())!;
    expect(go.y, 'See the work sits in the lower part of the first screen').toBeGreaterThan(844 * 0.7);
    expect(go.y + go.height).toBeLessThanOrEqual(844);
    const w0 = (await page.locator('.ha-stage .media').boundingBox())!.width;
    await page.evaluate(() => scrollTo(0, innerHeight * 1.2)); await page.waitForTimeout(500);
    const em = (await page.locator('.ha-stage .media').boundingBox())!;
    expect(em.width, 'the emblem').toBeLessThan(w0 * 0.6);
    expect(em.y + em.height / 2).toBeLessThan(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    /* each product's way in can be reached and tapped (a phone opens the project page) */
    await page.locator('#home-recto a.p-open').scrollIntoViewIfNeeded();
    await page.tap('#home-recto a.p-open');
    await page.waitForURL(/\/work\/recto\/$/);
  });
});

test('reduced motion: every chapter shows at once, no entrance, posters, no emblem on a phone', async ({ browser }) => {
  const baseURL = test.info().project.use.baseURL;
  for (const size of [desktop, phone]) {
    const ctx = await browser.newContext({ ...size, reducedMotion: 'reduce', baseURL });
    const page = await ctx.newPage();
    await page.goto(''); await settle(page, 800);
    await expect(page.locator('html')).not.toHaveClass(/ha-pin|ha-motion/);
    expect(await page.$$eval('.ha-rv, .ha-in', (els) => els.every((e) => getComputedStyle(e).opacity === '1' && getComputedStyle(e).animationName === 'none'))).toBe(true);
    await expect(page.locator('.ha-stage .m-lean, .ha-stage video')).toHaveCount(0);
    await ctx.close();
  }
});

test('no JavaScript: a complete page, each product with its own still beside its text', async ({ browser }) => {
  const baseURL = test.info().project.use.baseURL;
  for (const size of [desktop, phone]) {
    const ctx = await browser.newContext({ ...size, javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto(''); await settle(page, 300);
    for (const p of PROJECTS) await expect(page.locator(`#home-${p} .ha-still`)).toBeVisible();
    expect(await page.$$eval('.ha-rv', (els) => els.every((e) => getComputedStyle(e).opacity === '1'))).toBe(true);
    await expect(page.locator('.ha-stage .m-poster')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  }
});
