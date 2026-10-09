/* The screenshot matrix (CLAUDE.md: 1440x900, 1180x820 touch, 390x844; plus reduced motion and no
   JavaScript). Shots go to tests/shots/ (gitignored) to be looked at; every shot also asserts no
   horizontal overflow and no console errors. ?still keeps the media on posters so shots are stable. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, settle } from './helpers';

const OUT = 'tests/shots/';
const PAGES: [string, string][] = [['home', ''], ['work', 'work/'], ['log', 'log/'], ['about', 'about/'], ['recto', 'work/recto/'], ['eat-map', 'work/eat-map/'], ['404', 'nope/']];

async function shoot(page: Page, name: string, errors: string[]) {
  await page.screenshot({ path: `${OUT}${name}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), name + ' overflows').toBeLessThanOrEqual(0);
  expect(errors, name + ' console errors').toEqual([]);
}
function watch(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  /* the 404 page's own status is reported as a console error; that one is expected */
  page.on('console', (m) => { if (m.type() === 'error' && !(page.url().includes('/nope/') && /status of 404/.test(m.text()))) errors.push(m.text()); });
  return errors;
}

for (const [size, opts] of [['desktop', desktop], ['tablet', tablet], ['phone', phone]] as const) {
  test.describe(size, () => {
    test.use(opts);
    test(`pages at ${size}`, async ({ page }) => {
      const errors = watch(page);
      for (const [name, path] of PAGES) {
        await page.goto(path + '?still'); await settle(page, 600);
        await shoot(page, `${size}-${name}`, errors);
        if (['home', 'work', 'about', 'recto'].includes(name)) {
          await page.evaluate(() => scrollTo(0, innerHeight * 0.92)); await page.waitForTimeout(400);
          await shoot(page, `${size}-${name}-2`, errors);
        }
      }
    });
    if (size !== 'phone') test(`focus view at ${size}`, async ({ page }) => {
      const errors = watch(page);
      await page.goto('work/?still'); await settle(page, 600);
      await page.click('#main a[data-p="english-prep"]'); await settle(page, 1200);
      await shoot(page, `${size}-focus-english-prep`, errors);
      await page.evaluate(() => document.getElementById('sheet-scroll')!.scrollTo(0, 640)); await page.waitForTimeout(400);
      await shoot(page, `${size}-focus-english-prep-2`, errors);
    });
  });
}

test('reduced motion and no JavaScript', async ({ browser }) => {
  const baseURL = test.info().project.use.baseURL;
  for (const [label, o] of [['rm', { reducedMotion: 'reduce' as const }], ['nojs', { javaScriptEnabled: false }]] as const) {
    for (const [size, opts] of [['desktop', desktop], ['phone', phone]] as const) {
      const ctx = await browser.newContext({ ...opts, ...o, baseURL });
      const page = await ctx.newPage();
      const errors = watch(page);
      for (const [name, path] of PAGES.slice(0, 5)) {
        await page.goto(path); await settle(page, 600);
        await shoot(page, `${label}-${size}-${name}`, errors);
      }
      await ctx.close();
    }
  }
});
