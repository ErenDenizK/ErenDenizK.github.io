/* The record's templates, on a build with fixture entries (tests/fixtures/log; never published):
   every row shape on the date spine, the year strip, no controls below forty entries, a project's
   own thread in its view, entry, release and essay pages with their project light, key line, image and
   "Next:" line, and the Atom feed's permanent ids (docs/design/log.md, amended 2026-10-09). */
import { test, expect } from '@playwright/test';
import { desktop, phone } from './helpers';

test.describe('record with entries', () => {
  test.use(desktop);

  test('index: row shapes on the spine, year strip, no controls', async ({ page }) => {
    await page.goto('record/');
    await expect(page.locator('#log-count')).toHaveText('7 entries since Jul 2026');
    const rows = page.locator('.ygroup[data-year="2026"] .entries.spine > .entry');
    await expect(rows).toHaveCount(7);
    for (const [shape, n] of [['note', 3], ['entry', 2], ['release', 1], ['essay', 1]] as const) {
      await expect(page.locator(`.entry[data-shape="${shape}"]`), shape).toHaveCount(n);
    }
    /* a note reads whole, its date is its link */
    await expect(page.locator('.entry[data-shape="note"] .n-text').first()).toContainText('Second fixture note');
    await expect(page.locator('.entry[data-shape="note"] a.e-date').first()).toHaveAttribute('href', /\/record\/2026\/n-2026-10-01\/$/);
    /* an entry's title links to its page; its project names link to the projects */
    const entry = page.locator('#fixture-entry');
    await expect(entry.locator('a.e-link')).toHaveAttribute('href', /\/record\/2026\/fixture-entry\/$/);
    await expect(entry.locator('.e-meta a.pj')).toHaveText(['Recto', 'English Prep']);
    await expect(entry.locator('.e-meta a.pj').first()).toHaveAttribute('href', /\/work\/recto\/$/);
    /* a release: the version large, three of its four items, a thumbnail */
    const rel = page.locator('#fixture-release');
    await expect(rel.locator('.r-name')).toHaveText('Recto 1.0.0-beta');
    await expect(rel.locator('.r-items li')).toHaveText(['First shipped item, in the list on the index', 'Second shipped item, with a link stripped in the list', 'Third shipped item']);
    await expect(rel.locator('.e-thumb img')).toHaveCount(1);
    /* an essay: reading time and a 16:10 image plate */
    const essay = page.locator('#fixture-essay');
    await expect(essay.locator('.e-meta')).toContainText('1 min read');
    const box = await essay.locator('.e-thumb').boundingBox();
    expect(Math.abs(box!.width / box!.height - 1.6)).toBeLessThan(0.02);
    /* marks take their project's colour; no project is Record blue */
    const fill = (sel: string) => page.locator(`${sel} .e-mark`).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await fill('#n-2026-08-27')).toBe('rgb(143, 184, 255)');
    expect(await fill('#fixture-release')).toBe('rgb(166, 216, 115)');
    expect(await page.locator('#fixture-entry .e-mark').evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('conic-gradient');
    /* the year strip: twelve months; months with entries are anchors to their top row */
    await expect(page.locator('.ystrip .ym')).toHaveCount(12);
    await expect(page.locator('.ystrip a.ym')).toHaveCount(4);
    await expect(page.locator('.ystrip a.ym').last()).toHaveAttribute('href', '#fixture-essay');
    await expect(page.locator('.ystrip a.ym[aria-label^="September"] .ym-ticks i')).toHaveCount(3);
    /* no controls below forty entries; the writing note sits at the foot */
    await expect(page.locator('#rec-projects, .filters, .threads, button')).toHaveCount(0);
    await expect(page.locator('.rec-foot')).toContainText('I dictate the notes');
    /* the first entry shows on the first screen */
    expect((await rows.first().boundingBox())!.y).toBeLessThan(900 - 120);
    await rows.nth(2).locator('a.e-link').click();
    await expect(page).toHaveURL(/\/record\/2026\/fixture-release\/$/);
  });

  test('a project lists its entries and its thread', async ({ page }) => {
    await page.goto('work/recto/');
    await expect(page.locator('#in-the-record .entries .entry')).toHaveCount(5);
    await expect(page.locator('#in-the-record .thread')).toHaveCount(1);
    await expect(page.locator('#in-the-record .thread .t-c')).toHaveText('5 since Sep 2026');
    await page.goto('work/english-prep/');
    await expect(page.locator('#in-the-record .entries .entry')).toHaveCount(1);
    await expect(page.locator('#in-the-record .thread')).toHaveCount(0);
  });

  test('entry, release, note and essay pages', async ({ page }) => {
    await page.goto('record/2026/fixture-entry/');
    await expect(page.locator('h1.post-title')).toHaveText('Fixture entry');
    await expect(page.locator('.post-foot')).toContainText('Updated 2 Oct 2026');
    await expect(page.locator('.post-next')).toHaveText('Next: The fixture entry\'s next step.');
    /* the reading column: Newsreader 21 px at 430, about seventy characters a line */
    const p = page.locator('.post-body p').first();
    expect(await p.evaluate((el) => { const s = getComputedStyle(el); return [s.fontSize, s.fontWeight]; })).toEqual(['21px', '430']);
    const w = (await p.boundingBox())!.width;
    expect(w).toBeGreaterThan(560); expect(w).toBeLessThanOrEqual(600);
    await expect(page.locator('.post-light')).toHaveCount(1);

    await page.goto('record/2026/fixture-release/');
    await expect(page.locator('h1.post-title.is-version')).toHaveText('Recto 1.0.0-beta');
    await expect(page.locator('.post-key')).toHaveText('Fixture: 4 items, 3 shown');
    await expect(page.locator('.post-fig img')).toHaveAttribute('alt', /Recto page/);
    await expect(page.locator('.post-body li')).toHaveCount(4);
    /* the key line and the image follow the first paragraph on screen */
    const y = async (sel: string) => (await page.locator(sel).first().boundingBox())!.y;
    expect(await y('.post-body p')).toBeLessThan(await y('.post-key'));
    expect(await y('.post-key')).toBeLessThan(await y('.post-fig'));
    expect(await y('.post-fig')).toBeLessThan(await y('.post-body ul'));

    await page.goto('record/2026/fixture-plain/');
    expect(await page.locator('.post-light').evaluate((el) => getComputedStyle(el).getPropertyValue('--p').trim().toLowerCase())).toBe('#8fb8ff');
    await expect(page.locator('.post-next')).toHaveCount(0);

    await page.goto('record/2026/n-2026-09-12/');
    await expect(page).toHaveTitle(/^Note, 12 Sep 2026 · /);

    await page.goto('record/2026/fixture-essay/');
    await expect(page.locator('.post-toc ol a')).toHaveCount(2);
    await expect(page.locator('figure.fig#fig-entry-flow svg')).toHaveCount(2);
    await expect(page.locator('.post-body a[href="https://example.com/"]')).toHaveCSS('color', 'rgb(143, 184, 255)');
    expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain('BlogPosting');

    await page.goto('record/2026/');
    await expect(page.locator('.entry')).toHaveCount(7);
  });

  test('Atom feed with permanent tag ids', async ({ request }) => {
    const r = await request.get('record/feed.xml');
    expect(r.ok()).toBe(true);
    const xml = await r.text();
    expect(xml.match(/<entry>/g)?.length).toBe(7);
    expect(xml).toContain('<id>tag:erendenizk.github.io,2026-10-06:record/fixture-essay</id>');
    expect(xml).toContain('<title>Note, 12 Sep 2026</title>');
    expect(xml).toContain('&lt;strong&gt;Next:&lt;/strong&gt; A fixture next step.');
  });

  test('without JavaScript every row still links', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('record/');
    await page.click('#fixture-entry a.e-link');
    await expect(page).toHaveURL(/\/record\/2026\/fixture-entry\/$/);
    await ctx.close();
  });
});

test.describe('record on a phone', () => {
  test.use(phone);
  test('no horizontal overflow; reading text at 19 px; thumbnails above the text', async ({ page }) => {
    for (const p of ['record/', 'record/2026/fixture-essay/', 'record/2026/fixture-release/', 'work/recto/']) {
      await page.goto(p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), p).toBeLessThanOrEqual(0);
    }
    await page.goto('record/2026/fixture-essay/');
    await expect(page.locator('.post-body p').first()).toHaveCSS('font-size', '19px');
    await page.goto('record/');
    const essay = page.locator('#fixture-essay');
    expect((await essay.locator('.e-thumb').boundingBox())!.y).toBeLessThan((await essay.locator('.e-title').boundingBox())!.y);
  });
});

/* The contents ladder on an essay (ADR-0011): one source of truth. Where the rail is on it is the
   contents list, and the page's own list steps aside; without JavaScript the page's list is back. */
test.describe('essay rail', () => {
  test.use(desktop);
  test('the rail replaces the contents list and says how much is left', async ({ page }) => {
    await page.goto('record/2026/fixture-essay/?still');
    await expect(page.locator('.rail .rail-t')).toHaveText(['Fixture essay', 'A figure in the flow', 'A second section']);
    await expect(page.locator('.post-toc ol')).toBeHidden();
    await expect(page.locator('.post-toc .post-back')).toBeVisible();
    await expect(page.locator('.rail-foot')).toHaveText('About 1 min left');
    await page.keyboard.press('End'); await page.waitForTimeout(600);
    await expect(page.locator('.rail-foot')).toHaveText('At the end');
    await expect(page.locator('.rail-i.done')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
  test('without JavaScript the page keeps its own list and the native bar', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto('record/2026/fixture-essay/');
    await expect(page.locator('.post-toc ol a')).toHaveCount(2);
    await expect(page.locator('.post-toc ol')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarWidth)).toBe('auto');
    await expect(page.locator('.rail')).toHaveCount(0);
    await ctx.close();
  });
});
