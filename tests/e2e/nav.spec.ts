/* The 21 navigation scenarios of prototype F's bug suite (prototypes/f/SPEC.md, "Bugs found in E"),
   ported to the multi-page site (ADR-0007). Every check is the same invariant: what is on screen
   matches the URL (helpers.ts, problems()). */
import { test, expect } from '@playwright/test';
import { desktop, phone, state, check, settle, tab, open } from './helpers';

test.describe('desktop', () => {
  test.use(desktop);

  test('S1 rapid tab switching (60 ms apart)', async ({ page }) => {
    await page.goto(''); await settle(page);
    for (const t of ['work', 'record', 'about', 'home', 'work', 'record'] as const) { await tab(page, t, { noWait: true }); await page.waitForTimeout(60); }
    await settle(page, 1500);
    await check(page, 'after 6 fast tab clicks');
  });

  test('S2 back-and-forth mid-transition (A-B-A)', async ({ page }) => {
    await page.goto(''); await settle(page);
    for (const gap of [40, 120, 200, 300]) {
      await tab(page, 'work', { noWait: true }); await page.waitForTimeout(gap); await tab(page, 'home', { noWait: true }); await settle(page, 1200);
      await check(page, `work then home after ${gap} ms`);
      await tab(page, 'record', { noWait: true }); await page.waitForTimeout(gap); await tab(page, 'work', { noWait: true }); await page.waitForTimeout(gap); await tab(page, 'record', { noWait: true }); await settle(page, 1200);
      await check(page, `record-work-record, ${gap} ms gaps`);
    }
  });

  test('S3 back/forward through tabs', async ({ page }) => {
    await page.goto(''); await settle(page);
    for (const t of ['work', 'record', 'about'] as const) { await tab(page, t); await settle(page, 700); }
    const want = ['record', 'work', ''];
    for (let i = 0; i < 3; i++) { await page.goBack(); await settle(page, 700); await check(page, `back ${i + 1}`, (s) => (s.path === want[i] ? [] : [`expected /${want[i]}`])); }
    for (let i = 0; i < 2; i++) { await page.goForward(); await settle(page, 700); await check(page, `forward ${i + 1}`); }
    await page.evaluate(() => { history.back(); setTimeout(() => history.back(), 50); });
    await settle(page, 1600);
    await check(page, 'two fast backs');
  });

  test('S4 deep links', async ({ page }) => {
    for (const [path, extra] of [
      ['work/recto/', null], ['work/eat-map/', null], ['about/#colophon', (s: any) => (s.y < 300 ? ['not scrolled to colophon'] : [])],
      ['work/', null], ['record/', null], ['nope/', (s: any) => (s.h1 === 'Nothing here' ? [] : ['not a 404'])],
      ['work/nope/', (s: any) => (s.h1 === 'Nothing here' ? [] : ['not a 404'])], ['', null],
    ] as const) {
      const r = await page.goto(path); await settle(page, 600);
      if (path.includes('nope')) expect(r?.status()).toBe(404);
      await check(page, 'load /' + path, extra as any);
    }
    /* a deep-linked project page: its close goes to Work, and Work's Back leaves to the project page */
    await page.goto('work/recto/'); await settle(page, 600);
    await page.click('#main .sheet-bar .close');
    await settle(page);
    await check(page, 'deep link then close', (s) => (s.path === 'work' ? [] : ['expected /work']));
  });

  for (const how of ['button', 'escape', 'back', 'backdrop'] as const) {
    test(`S5 open by click, close by ${how}`, async ({ page }) => {
      await page.goto(''); await settle(page);
      await tab(page, 'work'); await settle(page);
      await open(page, 'english-prep'); await settle(page);
      await check(page, 'opened english-prep', (s) => (s.open ? [] : ['no sheet']));
      if (how === 'button') await page.click('#focus .close');
      if (how === 'escape') await page.keyboard.press('Escape');
      if (how === 'back') await page.goBack();
      if (how === 'backdrop') await page.mouse.click(30, 500);
      await settle(page);
      await check(page, 'closed by ' + how, (s) => [
        ...(s.path === 'work' ? [] : ['expected /work']),
        ...(/english-prep/.test(s.ae) ? [] : [`focus not returned to the tile (${s.ae})`]),
      ]);
      await page.goBack(); await settle(page);
      await check(page, 'then Back once', (s) => (s.path === '' ? [] : ['expected / (an extra history entry?)']));
      await page.goForward(); await settle(page);
      await check(page, 'then Forward once', (s) => (s.path === 'work' ? [] : ['expected /work']));
    });
  }

  test('S6 prev/next and arrow keys', async ({ page }) => {
    await page.goto('work/'); await settle(page);
    await open(page, 'recto'); await settle(page);
    for (let i = 0; i < 3; i++) { await page.click('#focus .case-next a[rel="next"]'); await settle(page, 500); await check(page, `next ${i + 1}`); }
    for (let i = 0; i < 3; i++) { await page.click('#focus .case-next a[rel="next"]'); await page.waitForTimeout(60); }
    await settle(page, 900);
    await check(page, 'three fast nexts');
    const before = (await state(page)).dlgCase;
    await page.keyboard.press('ArrowRight'); await settle(page, 600);
    await check(page, 'ArrowRight', (s) => (s.dlgCase === before ? ['ArrowRight did nothing'] : []));
    await page.goBack(); await settle(page);
    await check(page, 'Back after stepping closes the sheet', (s) => (s.path === 'work' ? [] : ['expected /work']));
  });

  test('S7 double click on a tile', async ({ page }) => {
    await page.goto('work/'); await settle(page);
    await page.dblclick('#main a[data-p="recto"]'); await settle(page);
    await check(page, 'dblclick opens and stays open', (s) => (s.open ? [] : ['sheet closed itself']));
  });

  test('S8 interrupt the sheet', async ({ page }) => {
    await page.goto('work/'); await settle(page);
    await open(page, 'recto'); await page.waitForTimeout(80); await page.keyboard.press('Escape'); await settle(page);
    await check(page, 'Escape 80 ms after opening');
    await open(page, 'eat-map'); await page.waitForTimeout(80); await page.goBack(); await settle(page);
    await check(page, 'Back 80 ms after opening');
    await open(page, 'recto'); await settle(page); await page.click('#focus .close'); await page.waitForTimeout(60);
    await open(page, 'english-prep'); await settle(page, 1500);
    await check(page, 'reopen 60 ms after closing', (s) => (s.dlgCase === 'english-prep' ? [] : ['expected english-prep open']));
    await page.goto('work/'); await settle(page);
    await open(page, 'recto'); await settle(page);
    await page.evaluate(() => { history.back(); setTimeout(() => history.back(), 40); });
    await settle(page, 1600);
    await check(page, 'two fast backs from an open sheet');
  });

  test('S9 open, back, forward, close', async ({ page }) => {
    await page.goto(''); await settle(page);
    await tab(page, 'work'); await settle(page);
    await open(page, 'recto'); await settle(page);
    await page.goBack(); await settle(page);
    await page.goForward(); await settle(page);
    await check(page, 'forward reopens recto', (s) => (s.path === 'work/recto' ? [] : ['expected /work/recto']));
    await page.click('#focus .close'); await settle(page);
    await check(page, 'close after forward', (s) => (s.path === 'work' ? [] : ['expected /work']));
    await page.goBack(); await settle(page);
    await check(page, 'Back after that', (s) => (s.path === '' ? [] : ['expected /: duplicate history entry']));
  });

  test('S10 teaser on Home opens and returns to Home', async ({ page }) => {
    await page.goto(''); await settle(page);
    await open(page, 'eat-map'); await settle(page);
    await check(page, 'opened from home', (s) => (s.open ? [] : ['no sheet over Home']));
    await page.keyboard.press('Escape'); await settle(page);
    await check(page, 'closed', (s) => (s.path === '' ? [] : ['expected /']));
  });

  test('S11 scroll position per tab', async ({ page }) => {
    await page.goto(''); await settle(page);
    await tab(page, 'work'); await settle(page);
    await page.evaluate(() => scrollTo(0, 500)); await page.waitForTimeout(400);
    await tab(page, 'record'); await settle(page);
    await check(page, 'new tab starts at top', (s) => (s.y === 0 ? [] : ['y=' + s.y]));
    await page.goBack(); await settle(page);
    await check(page, 'Back restores Work scroll', (s) => (Math.abs(s.y - 500) <= 40 ? [] : [`y=${s.y}, expected 500`]));
  });

  test('S12 an anchored deep link leaks into nothing', async ({ page }) => {
    await page.goto(''); await settle(page);
    await page.goto('about/#colophon'); await page.waitForTimeout(150);
    await tab(page, 'work'); await settle(page);
    await check(page, 'work after about/#colophon', (s) => (s.y === 0 ? [] : ['scrolled to ' + s.y + ' on Work']));
  });

  test('S13 keyboard: a tab by Enter, then the skip link', async ({ page }) => {
    await page.goto(''); await settle(page);
    await page.focus('.tabs a[data-tab="record"]');
    await Promise.all([page.waitForURL(/\/record\/$/), page.keyboard.press('Enter')]); await settle(page);
    await check(page, 'Enter on the Record tab', (s) => (s.path === 'record' ? [] : ['expected /record']));
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.className)).toBe('skip');
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('main');
  });

  test('S15 reduced motion: rapid tabs and sheet', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto(''); await settle(page);
    for (const t of ['work', 'home', 'record', 'about'] as const) { await tab(page, t, { noWait: true }); await page.waitForTimeout(40); }
    await settle(page);
    await check(page, 'fast tabs, reduced motion');
    await tab(page, 'work'); await settle(page, 500);
    await open(page, 'recto'); await settle(page, 600);
    await check(page, 'sheet open, reduced motion', (s) => (s.open ? [] : ['no sheet']));
    await page.keyboard.press('Escape'); await settle(page, 600);
    await check(page, 'sheet closed, reduced motion', (s) => (s.path === 'work' ? [] : ['expected /work']));
    await ctx.close();
  });

  test('S16 hover sweep over tiles changes the object at most twice', async ({ page }) => {
    await page.goto('work/'); await settle(page, 1200);
    const c0 = await page.evaluate(() => (window as any).MediaStage.changes);
    const boxes = await page.evaluate(() => [...document.querySelectorAll('.tile')].map((t) => { const r = t.getBoundingClientRect(); return [r.left + 100, r.top + r.height / 2]; }));
    for (let k = 0; k < 2; k++) for (const [x, y] of k ? boxes.slice().reverse() : boxes) { await page.mouse.move(x, y, { steps: 3 }); await page.waitForTimeout(70); }
    await settle(page, 1200);
    const n = (await page.evaluate(() => (window as any).MediaStage.changes)) - c0;
    expect(n, 'object changes for a 70 ms-per-row sweep').toBeLessThanOrEqual(2);
  });
});

test.describe('phone', () => {
  test.use(phone);

  test('S14 phone: pill nav and project pages', async ({ page }) => {
    await page.goto(''); await settle(page);
    for (const t of ['work', 'record', 'about', 'home'] as const) { await tab(page, t, { tap: true }); await settle(page, 700); await check(page, 'tap ' + t); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await tab(page, 'work', { tap: true }); await settle(page);
    await page.evaluate(() => scrollTo(0, 400)); await page.waitForTimeout(500);
    await page.locator('#main a[data-p="recto"]').scrollIntoViewIfNeeded();
    const y0 = await page.evaluate(() => scrollY);
    await open(page, 'recto', 'tap'); await settle(page);
    await check(page, 'tap tile opens the project page', (s) => (s.pageCase === 'recto' && !s.open ? [] : ['expected the project page']));
    expect(await page.textContent('.sheet-bar .back')).toContain('Work');
    await page.tap('.sheet-bar .back'); await settle(page);
    await check(page, 'Back button', (s) => [...(s.path === 'work' ? [] : ['expected /work']), ...(Math.abs(s.y - y0) <= 40 ? [] : [`scroll ${s.y}, was ${y0}`])]);
    await open(page, 'eat-map', 'tap'); await settle(page);
    await page.goBack(); await settle(page);
    await check(page, 'system Back closes the project', (s) => (s.path === 'work' ? [] : ['expected /work']));
  });
});

for (const [label, size] of [['desktop', desktop], ['phone', phone]] as const) {
  test.describe(label, () => {
    test.use(size);
    test(`S17 the Home tab (${label})`, async ({ page }) => {
      const isPhone = label === 'phone';
      const go = async (t: 'home' | 'work' | 'record' | 'about') => {
        if (isPhone && (await page.evaluate(() => scrollY > 0))) { await page.evaluate(() => scrollBy(0, -60)); await page.waitForTimeout(450); }
        await tab(page, t, { tap: isPhone });
      };
      await page.goto(''); await settle(page);
      for (const t of ['work', 'record', 'about'] as const) { await go(t); await settle(page, 700); await go('home'); await settle(page, 700); await check(page, 'Home from ' + t); }
      for (const t of ['work', 'record', 'about', 'work'] as const) { await go(t); await settle(page, 600); }
      await go('home'); await settle(page, 700);
      await check(page, 'Home after visiting four tabs');
      for (let i = 0; i < 5; i++) { await tab(page, i % 2 ? 'home' : 'work', { noWait: true }); await page.waitForTimeout(90); }
      await tab(page, 'home', { noWait: true }); await settle(page, 1200);
      await check(page, 'Home in a burst of clicks', (s) => (s.path === '' ? [] : ['ended on /' + s.path]));
      await go('work'); await settle(page, 700);
      if (!isPhone) { await page.hover('#main a[data-p="eat-map"]'); await page.waitForTimeout(300); }
      await go('home'); await settle(page, 700);
      await check(page, 'Home during an object change');
      await go('record'); await settle(page, 600);
      await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(300);
      await go('home'); await settle(page, 700);
      await check(page, 'Home after scrolling Log', (s) => (s.y === 0 ? [] : ['y=' + s.y]));
      await page.evaluate(() => scrollTo(0, 500)); await page.waitForTimeout(300);
      await go('home'); await page.waitForTimeout(900);
      await check(page, 'Home while on Home (scrolled)', (s) => (s.y <= 5 ? [] : ['stayed at y=' + s.y]));
      await go('work'); await settle(page, 700);
      await open(page, 'recto', isPhone ? 'tap' : 'click'); await settle(page);
      if (!isPhone) {
        const r = await page.evaluate(() => { const b = document.querySelector('.tabs a[data-tab="home"]')!.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
        await page.mouse.click(r[0], r[1]);
      } else {
        await page.tap('.sheet-bar .back'); await settle(page, 700);
        await go('home');
      }
      await settle(page, 1000);
      await check(page, 'Home from inside a project', (s) => (s.path === '' ? [] : ['ended on /' + s.path]));
      await page.goBack(); await settle(page, 1000);
      await check(page, 'then Back');
      if (isPhone && (await page.isVisible('.sheet-bar .back'))) { await page.tap('.sheet-bar .back'); await settle(page, 700); await page.tap('.mark'); }
      else {
        const r = await page.evaluate(() => { const b = document.querySelector('.mark')!.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
        await page.mouse.click(r[0], r[1]);
      }
      await settle(page, 1000);
      await check(page, 'the edk mark goes Home', (s) => (s.path === '' ? [] : ['ended on /' + s.path]));
    });
  });
}
