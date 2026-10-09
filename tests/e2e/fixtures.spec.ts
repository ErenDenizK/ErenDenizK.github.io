/* The log's templates, on a build with fixture entries (tests/fixtures/log; never published):
   the three kinds in the index, entries opening in place, threads beside the log and inside a
   project's view, entry and essay pages, the Atom feed's permanent ids (docs/design/log.md). */
import { test, expect } from '@playwright/test';
import { desktop, phone } from './helpers';

test.describe('log with entries', () => {
  test.use(desktop);

  test('index: kinds, year group, open in place, threads', async ({ page }) => {
    await page.goto('log/');
    await expect(page.locator('#log-count')).toHaveText('4 entries since Sep 2026');
    await expect(page.locator('.ygroup[data-year="2026"] .entry')).toHaveCount(4);
    await expect(page.locator('.entry[data-kind="note"] .n-text').first()).toContainText('Second fixture note');
    const row = page.locator('.entry[data-kind="entry"] a.e-row');
    await row.click();
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.entry[data-kind="entry"] .e-body .prose')).toBeVisible();
    expect(new URL(page.url()).pathname).toMatch(/\/log\/$/);
    await expect(page.locator('.entry[data-kind="essay"] a.e-link')).toHaveAttribute('href', /\/log\/2026\/fixture-essay\/$/);
    await expect(page.locator('.entry[data-kind="essay"] .e-plate svg')).toHaveCount(1);
    await expect(page.locator('#threads .thread')).toHaveCount(1);
    await expect(page.locator('#threads .thread .t-c')).toHaveText('4 since Sep 2026');
    await page.locator('#threads .thread').click();
    await expect(page).toHaveURL(/\?project=recto/);
    await expect(page.locator('.entry:not([hidden])')).toHaveCount(4);
  });

  test('a project lists its entries and its thread', async ({ page }) => {
    await page.goto('work/recto/');
    await expect(page.locator('#in-the-log .entries .entry')).toHaveCount(4);
    await expect(page.locator('#in-the-log .thread')).toHaveCount(1);
    await page.goto('work/english-prep/');
    await expect(page.locator('#in-the-log .entries .entry')).toHaveCount(1);
    await expect(page.locator('#in-the-log .thread')).toHaveCount(0);
  });

  test('entry, note and essay pages', async ({ page }) => {
    await page.goto('log/2026/fixture-entry/');
    await expect(page.locator('h1.post-title')).toHaveText('Fixture entry');
    await expect(page.locator('.post-foot')).toContainText('Updated 2 Oct 2026');
    await page.goto('log/2026/n-2026-09-12/');
    await expect(page).toHaveTitle(/^Note, 12 Sep 2026 · /);
    await page.goto('log/2026/fixture-essay/');
    await expect(page.locator('.post-toc ol a')).toHaveCount(2);
    await expect(page.locator('figure.fig#fig-entry-flow svg')).toHaveCount(2);
    expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain('BlogPosting');
    await page.goto('log/2026/');
    await expect(page.locator('.entry')).toHaveCount(4);
  });

  test('Atom feed with permanent tag ids', async ({ request }) => {
    const r = await request.get('log/feed.xml');
    expect(r.ok()).toBe(true);
    const xml = await r.text();
    expect(xml.match(/<entry>/g)?.length).toBe(4);
    expect(xml).toContain('<id>tag:erendenizk.github.io,2026-10-06:log/fixture-essay</id>');
    expect(xml).toContain('<title>Note, 12 Sep 2026</title>');
  });

  test('without JavaScript an entry title is a link to its page', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('log/');
    await page.click('.entry[data-kind="entry"] a.e-row');
    await expect(page).toHaveURL(/\/log\/2026\/fixture-entry\/$/);
    await ctx.close();
  });
});

test.describe('log on a phone', () => {
  test.use(phone);
  test('no horizontal overflow', async ({ page }) => {
    for (const p of ['log/', 'log/2026/fixture-essay/', 'work/recto/']) {
      await page.goto(p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), p).toBeLessThanOrEqual(0);
    }
  });
});
