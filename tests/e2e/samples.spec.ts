/* Sample entries (sample: true) test the record's design and are not record: tagged "Sample" in the list,
   left out of the feed and the sitemap, noindex, and not marked up as articles. Whether they are on the
   site at all is the owner's call (SAMPLES=0), so with none built this has nothing to check. */
import { test, expect } from '@playwright/test';

test('samples stay out of the feed, the sitemap and search', async ({ page, request }) => {
  await page.goto('record/');
  const paths = await page.locator('.entry').evaluateAll((els) => els
    .filter((li) => [...li.querySelectorAll('.e-meta span')].some((s) => s.textContent?.trim() === 'Sample'))
    .map((li) => new URL(li.querySelector<HTMLAnchorElement>('a.e-link, a.e-date')!.href).pathname));
  const feed = await (await request.get('record/feed.xml')).text();
  const sitemap = await (await request.get('sitemap-0.xml')).text();
  for (const p of paths) {
    expect(feed, p).not.toContain(p);
    expect(sitemap, p).not.toContain(p);
    await page.goto(p);
    await expect(page.locator('meta[name="robots"]'), p).toHaveAttribute('content', 'noindex');
    expect(await page.locator('script[type="application/ld+json"]').textContent(), p).not.toContain('BlogPosting');
  }
});
