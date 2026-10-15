/* PART B's lab (src/one/work/, phase3 design-spec.md 3.3 and 8): Work on its scratch page /lab/one-work/
   and the static twin of each presentation at /lab/one/work/<slug>/. Hidden like every lab page; no
   horizontal overflow at the three widths; the still twin (no JavaScript, reduced motion) is a complete
   list whose links open complete pages; the open and close keep one history step and the focus. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, PROJECTS } from './helpers';

const LAB = 'lab/one-work/';
const page_ = (slug: string) => `lab/one/work/${slug}/`;
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

test('the lab pages are hidden: noindex and out of the sitemap', async ({ page, request }) => {
  for (const path of [LAB, ...PROJECTS.map(page_)]) {
    await page.goto(path + '?still');
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute('content', 'noindex');
  }
  const sitemap = await (await request.get('sitemap-0.xml')).text();
  expect(sitemap).not.toContain('/lab/');
});

for (const [label, size] of [['1440', desktop], ['1180', tablet], ['390', phone], ['320', { ...phone, viewport: { width: 320, height: 640 } }]] as const) {
  test.describe(`${label} px`, () => {
    test.use(size);
    test(`no horizontal overflow on the deck, in each open project and on each static page (${label})`, async ({ page }) => {
      const fails: string[] = [];
      await page.goto(LAB);
      for (const [k, slug] of PROJECTS.entries()) {
        await page.evaluate((k) => scrollTo({ top: document.querySelectorAll<HTMLElement>('.slot')[k].getBoundingClientRect().top + scrollY, behavior: 'instant' }), k);
        await page.waitForTimeout(500);
        if (await overflow(page) > 0) fails.push(`deck at ${slug}`);
        await page.locator(`.proj[data-k="${k}"] .btn`).click();
        await expect(page.locator('.layer h1')).toBeFocused();
        const lo = await page.evaluate(() => { const l = document.querySelector('.layer')!; return l.scrollWidth - l.clientWidth; });
        if (lo > 0 || await overflow(page) > 0) fails.push(`layer ${slug}`);
        await page.keyboard.press('Escape');
        await expect(page.locator('.layer')).toHaveCount(0);
      }
      for (const slug of PROJECTS) {
        await page.goto(page_(slug));
        if (await overflow(page) > 0) fails.push(`static ${slug}`);
      }
      expect(fails).toEqual([]);
    });
  });
}

test.describe('the still twin', () => {
  test.use({ ...desktop, javaScriptEnabled: false });
  test('without JavaScript Work is a complete list and every project opens a complete page', async ({ page }) => {
    await page.goto(LAB);
    const work = page.locator('#work');
    expect(await work.evaluate((e) => getComputedStyle(e).display)).not.toBe('grid');
    for (const slug of PROJECTS) {
      const slot = page.locator(`.slot#${slug}`);
      await expect(slot).toHaveAttribute('data-aura', /^#[0-9a-f]{6} #[0-9a-f]{6} #[0-9a-f]{6}$/);
      const proj = page.locator(`.proj[data-slug="${slug}"]`);
      await expect(proj.locator('.w-title')).toBeVisible();
      await expect(proj.locator('.w-promise')).toBeVisible();
      await expect(proj.locator('.btn')).toHaveAttribute('href', new RegExp(`/lab/one/work/${slug}/$`));
      expect(await proj.locator('.pr').count()).toBeGreaterThan(0);
    }
    await page.locator('.proj[data-slug="recto"] .btn').click();
    await expect(page).toHaveURL(/\/lab\/one\/work\/recto\/$/);
    await expect(page.locator('h1')).toHaveText('Recto');
    await expect(page.locator('.facts dt')).toHaveText(['Role', 'Runs on', 'Stack']);
    await expect(page.locator('.st')).toHaveCount(3);
    await expect(page.locator('.st-title').first()).toHaveText('Markup');
    await expect(page.locator('[data-close]')).toHaveAttribute('href', /\/lab\/one\/#recto$/);
    await expect(page.locator('.cap-go')).toHaveAttribute('href', 'https://erendenizk.github.io/recto/');
    /* unwritten sections stay hidden (Recto's why, learned and next are placeholders) */
    expect(await page.locator('body').innerText()).not.toMatch(/owner to|to confirm|to come/i);
    await expect(page.locator('.p-quote')).toHaveCount(0);
    /* Eat Map has no screens: its object, its facts, the note in place of the code link, no steps */
    await page.goto(page_('eat-map'));
    await expect(page.locator('.hero-obj')).toBeVisible();
    await expect(page.locator('.steps')).toHaveCount(0);
    await expect(page.locator('.cap-note')).toHaveText('Code not public yet');
  });
});

test.describe('reduced motion', () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: 'reduce' } });
  test('no pinned deck, and the open is immediate', async ({ page }) => {
    await page.goto(LAB);
    expect(await page.locator('#work').evaluate((e) => getComputedStyle(e).display)).not.toBe('grid');
    await page.locator('.proj[data-slug="english-prep"] .btn').click();
    await expect(page).toHaveURL(/\/lab\/one\/work\/english-prep\/$/);
    await expect(page.locator('.layer h1')).toBeFocused();
    await expect(page.locator('.layer .steps')).not.toHaveClass(/pinned/);
  });
});

for (const [label, size] of [['desktop', desktop], ['phone', phone]] as const) {
  test.describe(label, () => {
    test.use(size);
    test(`open and close keep one history step, the deck and the focus (${label})`, async ({ page }) => {
      await page.goto(LAB);
      await page.waitForTimeout(300);
      await page.evaluate(() => scrollTo({ top: document.querySelectorAll<HTMLElement>('.slot')[1].getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await page.waitForTimeout(600);
      const y0 = await page.evaluate(() => scrollY);
      await expect(page.locator('.proj[data-k="1"]')).toHaveAttribute('data-on', '');
      await expect(page.locator('.w-idx [data-idx]')).toHaveText('02');
      /* the texts' swap has played out (a click on a moving target makes Playwright scroll the page) */
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || (a.effect?.getTiming().iterations ?? 1) === Infinity));
      const hl = await page.evaluate(() => history.length);
      await page.locator('.proj[data-k="1"] .btn').click();
      await expect(page).toHaveURL(/\/lab\/one\/work\/english-prep\/$/);
      await expect(page.locator('.layer h1')).toBeFocused();
      await expect(page.locator('#main')).toHaveJSProperty('inert', true);
      expect(await page.evaluate(() => history.length)).toBe(hl + 1);
      /* Back closes it; Home did not move under the layer */
      await page.goBack();
      await expect(page.locator('.layer')).toHaveCount(0);
      await expect(page).toHaveURL(/\/lab\/one-work\/$/);
      await expect(page.locator('.proj[data-k="1"] .btn')).toBeFocused();
      expect(Math.abs(await page.evaluate(() => scrollY) - y0)).toBeLessThan(2);
      /* forward reopens it; the Close button takes the same step back */
      await page.goForward();
      await expect(page.locator('.layer h1')).toBeFocused();
      await page.locator('.layer [data-close]').click();
      await expect(page.locator('.layer')).toHaveCount(0);
      await expect(page).toHaveURL(/\/lab\/one-work\/$/);
      await expect(page.locator('#main')).toHaveJSProperty('inert', false);
    });
  });
}
