/* Record rows and entries read properly on phones however they are reached (owner's iPhone,
   2026-10-11): a release opened from Home, on Recto's project page, wrapped one word per line in the
   22 px spine column, because the project view's wide-screen grid for rows with a thumbnail outranked
   the phone grid. Every row's text column must span the list less its spine, on the Record, a year's
   page and an entry's own page, and nothing may scroll sideways. (The four-page project view and its
   rows went with ADR-0019; a project's page lists its entries as titles, lab-one-work.spec.ts.) The rows are the fixture build's
   (tests/fixtures/log), which gives every project rows of every shape whatever content/log holds. */
import { test, expect, type Page } from '@playwright/test';
import { phone, tablet, desktop, fixture } from './helpers';

async function rowsReadable(page: Page) {
  const rows = await page.locator('.spine > .entry').evaluateAll((els) => els.map((li) => {
    const list = li.parentElement!.getBoundingClientRect();
    const main = li.querySelector('.e-main')!.getBoundingClientRect();
    return { slug: (li as HTMLElement).dataset.slug, list: list.width, main: main.width };
  }));
  expect(rows.length).toBeGreaterThan(0);
  return rows;
}

test.describe('reading on a phone', () => {
  test.use({ ...phone, deviceScaleFactor: 3 });

  test('the record: every row uses the full column', async ({ page }) => {
    await page.goto(fixture('record/'));
    for (const r of await rowsReadable(page)) expect(r.main, r.slug).toBeGreaterThan(r.list - 40);
  });

  test('a year\'s page: every row uses the full column', async ({ page }) => {
    await page.goto(fixture('record/2026/'));
    for (const r of await rowsReadable(page)) expect(r.main, r.slug).toBeGreaterThan(r.list - 40);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });

  test('a release opened from the Record reads at full width', async ({ page }) => {
    await page.goto(fixture('record/'));
    const row = page.locator('.spine .entry.s-release').first();
    await row.scrollIntoViewIfNeeded();
    const w = await row.locator('.r-title, .r-name').first().evaluate((e) => e.getBoundingClientRect().width);
    expect(w).toBeGreaterThan(250);
    /* and its own page */
    await row.locator('.e-link').click();
    await expect(page).toHaveURL(/\/record\/\d{4}\//);
    const body = await page.locator('.post-body > p').first().evaluate((e) => e.getBoundingClientRect().width);
    expect(body).toBeGreaterThan(330);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
});

for (const [name, use] of [['tablet', tablet], ['desktop', desktop]] as const) {
  test(`reading, ${name}: Record rows keep their thumbnail beside the text`, async ({ page }) => {
    await page.setViewportSize(use.viewport);
    await page.goto(fixture('record/'));
    const r = page.locator('.spine .entry.has-thumb').first();
    const [m, t] = await Promise.all([r.locator('.e-main').boundingBox(), r.locator('.e-thumb').boundingBox()]);
    expect(m!.width).toBeGreaterThan(250);
    expect(t!.x).toBeGreaterThan(m!.x + m!.width - 1);
  });
}
