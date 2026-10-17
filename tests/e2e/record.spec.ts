/* The two-page site's routing and the Record on the new token set (ADR-0019; record-language §5, §6;
   review row S38). The retired four-page addresses redirect to the right part of Home; the project pages
   are canonical; the sitemap holds only real pages. The Record: the bar with the Home/Record tab (Record
   current), the frontispiece (the recorder in its engraving, the tape), the spine and the year strip, the
   foot with the colophon and the feed, the recorder named `stage` for the flight from the Home strip,
   the arrival that settles in about three seconds, the still twins, and no sideways scroll. The rows'
   shapes are checked on the fixture build (fixtures.spec.ts), the recorder's lean in stage.spec.ts. */
import { test, expect } from '@playwright/test';
import { desktop, phone, PROJECTS } from './helpers';
import { BASE } from '../../playwright.config';

test.describe('routing', () => {
  for (const [from, to] of [['work/', `${BASE}#work`], ['about/', `${BASE}#how`], ['lab/one/', BASE]] as const) {
    test(`/${from} redirects to ${to}`, async ({ page, request }) => {
      const html = await (await request.get(from)).text();
      expect(html).toContain(`<meta name="robots" content="noindex">`);
      expect(html).toContain(`http-equiv="refresh" content="0; url=${to}"`);
      expect(html).toMatch(new RegExp(`<a href="${to.replace(/[#/]/g, (c) => '\\' + c)}"`));
      await page.goto(from);
      await page.waitForURL((u) => u.pathname === BASE);
      expect(new URL(page.url()).hash).toBe(to.slice(BASE.length));
    });
  }

  test('the anchors the redirects name exist on Home', async ({ page }) => {
    await page.goto('?still');
    await expect(page.locator('#work')).toHaveCount(1);
    await expect(page.locator('#how')).toHaveCount(1);
  });

  test('the sitemap holds Home, the Record, its years and the project pages; robots names it', async ({ request }) => {
    const map = await (await request.get('sitemap-0.xml')).text();
    const locs = [...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(locs).toContain(BASE);
    expect(locs).toContain(`${BASE}record/`);
    for (const p of PROJECTS) expect(locs).toContain(`${BASE}work/${p}/`);
    expect(locs, 'the retired /work/').not.toContain(`${BASE}work/`);
    for (const gone of ['about/', 'lab/', 'guil/']) expect(locs.filter((l) => l.startsWith(BASE + gone)), gone).toEqual([]);
    const robots = await (await request.get('robots.txt')).text();
    expect(robots).toMatch(/Sitemap: .*sitemap-index\.xml/);
  });

  test('a project page is canonical, with its card and the feed', async ({ page }) => {
    for (const p of PROJECTS) {
      await page.goto(`work/${p}/?still`);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/work/${p}/$`));
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/[\w-]+\.[\w]+\.jpg$/);
      await expect(page.locator('link[rel="alternate"][type="application/atom+xml"]')).toHaveCount(1);
    }
  });

  test('the 404 offers the two pages and is not indexed', async ({ page }) => {
    await page.goto('nope/');
    await expect(page.locator('h1')).toHaveText('Nothing here');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('.nf-links a')).toHaveCount(2);
    await expect(page.locator('.nf-links a').first()).toHaveAttribute('href', BASE);
    await expect(page.locator('.nf-links a').last()).toHaveAttribute('href', `${BASE}record/`);
    await expect(page.locator('a[href$="/about/"], a[href$="/work/"]')).toHaveCount(0);
  });
});

test.describe('the Record, desktop', () => {
  test.use(desktop);

  test('the bar, the head, the spine, the foot; the recorder is the stage', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('record/');
    await expect(page.locator('.tabs a[aria-current="page"]')).toHaveAttribute('data-tab', 'record');
    await expect(page.locator('.tabs a[data-tab="home"]')).toHaveAttribute('href', BASE);
    await expect(page.locator('h1')).toHaveText('The record');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/record\/$/);
    await expect(page.locator('.rh .media[data-obj="recorder"] .m-poster')).toBeVisible();
    expect(await page.locator('.rh .m-stage').evaluate((e) => getComputedStyle(e).viewTransitionName)).toBe('stage');
    await expect(page.locator('.rh-eng.wide img')).toHaveCount(3);
    await expect(page.locator('.rh-eng.wide')).toBeVisible();
    await expect(page.locator('.ygroup')).not.toHaveCount(0);
    await expect(page.locator('.ystrip').first().locator('.ym')).toHaveCount(12);
    await expect(page.locator('#colophon')).toHaveText('How this is written');
    await expect(page.locator('.rec-foot a[href$="record/feed.xml"]')).toHaveCount(1);
    await expect(page.locator('footer.foot')).toHaveCount(1);
    /* the field takes the Record's light */
    await expect(page.locator('[data-aura]').first()).toHaveAttribute('data-aura', '#8fb8ff #6f8cff #6fc9cf');
    /* the tape ends where the spine begins: both at the spine's x */
    const tape = await page.locator('.rh-tape').boundingBox();
    const lead = await page.locator('.rec-lead').evaluate((e) => { const r = e.getBoundingClientRect(); return r.left + parseFloat(getComputedStyle(e, '::before').left); });
    expect(Math.abs(tape!.x - lead)).toBeLessThan(2);
    /* the head and the first entry are on the first screen */
    expect((await page.locator('.spine > .entry').first().boundingBox())!.y).toBeLessThan(900 - 100);
    expect(errors).toEqual([]);
  });

  test('the arrival settles within three seconds, then the page is still', async ({ page }) => {
    await page.goto('record/');
    await expect(page.locator('html')).toHaveClass(/rec-in/);
    const at = () => page.evaluate(() => ({
      title: +getComputedStyle(document.querySelector('.rh-title')!).opacity,
      mark: +getComputedStyle(document.querySelector('.spine > .entry .e-mark')!).opacity,
      tape: parseFloat(getComputedStyle(document.querySelector('.rh-tape path')!).strokeDashoffset),
      turn: getComputedStyle(document.querySelector('.rh-eng.wide .rh-turn')!).transform,
    }));
    await page.waitForTimeout(3200);
    const s = await at();
    expect(s.title).toBe(1);
    expect(s.mark).toBe(1);
    expect(s.tape).toBeLessThan(0.5);
    expect(s.turn).toBe('none');
  });

  test('without JavaScript and under reduced motion everything is drawn at once', async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    for (const o of [{ javaScriptEnabled: false }, { reducedMotion: 'reduce' as const }]) {
      const ctx = await browser.newContext({ ...desktop, ...o, baseURL });
      const page = await ctx.newPage();
      await page.goto('record/');
      await page.waitForTimeout(150);
      const s = await page.evaluate(() => ({
        title: +getComputedStyle(document.querySelector('.rh-title')!).opacity,
        mark: +getComputedStyle(document.querySelector('.spine > .entry .e-mark')!).opacity,
        line: getComputedStyle(document.querySelector('.ygroup')!, '::before').transform,
        me: +getComputedStyle(document.querySelector('.rh-eng.wide .rh-me')!).opacity,
      }));
      expect(s, JSON.stringify(o)).toEqual({ title: 1, mark: 1, line: 'none', me: 1 });
      await expect(page.locator('.spine > .entry a').first()).toBeVisible();
      await ctx.close();
    }
  });

  test('a year\'s page keeps the head and hides the doubled year heading', async ({ page }) => {
    await page.goto('record/2026/');
    await expect(page.locator('h1')).toHaveText('2026');
    await expect(page.locator('.rh-back')).toHaveAttribute('href', `${BASE}record/`);
    const h2 = await page.locator('.y-label h2').first().boundingBox();
    expect(h2!.width).toBeLessThanOrEqual(1);
    await expect(page.locator('.spine > .entry')).not.toHaveCount(0);
  });

  test('an entry page: the tab, the back link, the colophon link, the project link', async ({ page }) => {
    await page.goto('record/');
    const href = await page.locator('.spine > .entry a.e-link, .spine > .entry a.e-date').first().getAttribute('href');
    await page.goto(href!);
    await expect(page.locator('.tabs a[aria-current="page"]')).toHaveAttribute('data-tab', 'record');
    await expect(page.locator('.post-back').first()).toHaveAttribute('href', `${BASE}record/`);
    await expect(page.locator('.post-meta-row a[href$="record/#colophon"]')).toHaveCount(1);
    for (const a of await page.locator('.post-head a.pj').all()) await expect(a).toHaveAttribute('href', new RegExp(`${BASE}work/[\\w-]+/$`));
    await expect(page.locator('a[href*="/about/"]')).toHaveCount(0);
  });
});

for (const [label, opts] of [['phone', { ...phone, deviceScaleFactor: 3 }], ['desktop', desktop]] as const) {
  test(`the Record's pages never scroll sideways (${label})`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...opts, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    for (const p of ['record/', 'record/2026/', 'nope/']) {
      await page.goto(p);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), p).toBeLessThanOrEqual(0);
    }
    if (label === 'phone') {
      await page.goto('record/');
      /* the phone's own composition: the recorder at the right, the head on the spine at the left */
      const obj = (await page.locator('.rh .media').boundingBox())!;
      expect(obj.x + obj.width).toBeGreaterThan(390 - 40);
      await expect(page.locator('.rh-eng.narrow')).toBeVisible();
      await expect(page.locator('.rh-eng.wide')).toBeHidden();
      expect(await page.locator('.rh-title').evaluate((e) => getComputedStyle(e).textAlign)).toMatch(/^(start|left)$/);
    }
    await ctx.close();
  });
}
