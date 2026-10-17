/* Work, round 6 (src/one/work/): the horizontal flow (?work=flow, row S31), the objects preview
   (?objects=glass|line|none, S4), the How it's made plates per project (how.form, S29), the project
   story's hidden sections (S30) and the 1400 ms open (S8). On Home and the project pages (/work/<slug>/). */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone, PROJECTS } from './helpers';

const HOME = '';
const page_ = (slug: string) => `work/${slug}/`;
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
/** scroll so that project k's block top is at the top of the view (the flow puts project k in front) */
const toProject = (page: Page, k: number) => page.evaluate((k) => scrollTo({ top: document.querySelectorAll<HTMLElement>('.proj')[k].getBoundingClientRect().top + scrollY, behavior: 'instant' }), k);
/** the centre x of each project's hero sheet, in the view */
const heroes = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.fl-hero')].map((h) => { const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, vis: getComputedStyle(h.closest('.fl-stage')!).visibility }; }));

for (const [label, size] of [['1440', desktop], ['390', phone]] as const) {
  test.describe(`the flow at ${label}`, () => {
    test.use(size);
    test(`?work=flow turns the projects on a drum, keeps the blocks as anchors and opens a project (${label})`, async ({ page }) => {
      await page.goto(HOME + '?work=flow');
      await expect(page.locator('#work')).toHaveAttribute('data-flow', '');
      await expect(page.locator('.fl-flow > .fl-stage')).toHaveCount(PROJECTS.length);
      /* the blocks stay in order as spacers: the rail's beads and the anchors still read them */
      const tops = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.proj')].map((p) => p.getBoundingClientRect().top + scrollY));
      for (let k = 1; k < tops.length; k++) expect(tops[k]).toBeGreaterThan(tops[k - 1]);
      const vw = label === '1440' ? 1440 : 390;
      for (let k = 0; k < PROJECTS.length; k++) {
        await toProject(page, k);
        await page.waitForTimeout(400);
        const h = await heroes(page);
        expect(Math.abs(h[k].x - vw / 2), `project ${k} in front`).toBeLessThan(vw * 0.04);
        if (k + 1 < h.length && h[k + 1].vis === 'visible') expect(h[k + 1].x, 'the next comes from the right').toBeGreaterThan(vw / 2 + vw * 0.3);
        if (k > 0 && h[k - 1].vis === 'visible') expect(h[k - 1].x, 'the last leaves to the left').toBeLessThan(vw / 2 - vw * 0.3);
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      }
      /* the same picture on the way back: a pure function of the scroll position */
      await toProject(page, 1);
      await page.waitForTimeout(300);
      const a = await heroes(page);
      await toProject(page, 2); await page.waitForTimeout(300);
      await toProject(page, 1); await page.waitForTimeout(300);
      const b = await heroes(page);
      expect(b.map((x) => Math.round(x.x))).toEqual(a.map((x) => Math.round(x.x)));
      /* the open works from the flow and the close comes back to it */
      await page.locator('.fl-stage[data-k="1"] .btn').click();
      await expect(page.locator('.layer .cap-x')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.layer')).toHaveCount(0);
      await expect(page.locator('.fl-stage[data-k="1"] .fl-hero')).toBeVisible();
    });
  });
}

test.describe('the flow is a lab switch', () => {
  test.use(desktop);
  test('without ?work=flow the vertical flight is unchanged, and ?still keeps the list', async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator('.fl-flow')).toHaveCount(0);
    await expect(page.locator('.proj > .fl-stage')).toHaveCount(PROJECTS.length);
    await page.goto(HOME + '?work=flow&still');
    await expect(page.locator('.fl-flow')).toHaveCount(0);
    await expect(page.locator('#work')).not.toHaveAttribute('data-live', '');
  });
});

for (const [label, size] of [['1440', desktop], ['390', phone]] as const) {
  test.describe(`the objects preview at ${label}`, () => {
    test.use(size);
    test(`?objects=glass|line shows the object beside each print; none fetches nothing (${label})`, async ({ page }) => {
      const asked: string[] = [];
      page.on('request', (r) => { if (/-line\.svg|-glass|objects\/[a-z]+-glass/.test(r.url())) asked.push(r.url()); });
      await page.goto(HOME);
      await expect(page.locator('.fl-obj').first()).toBeHidden();
      await page.waitForTimeout(300);
      expect(asked, 'nothing of the preview is fetched while it is off').toEqual([]);

      await page.goto(HOME + '?objects=glass');
      await toProject(page, 0); await page.waitForTimeout(500);
      const g = page.locator('.proj[data-k="0"] .fl-obj');
      await expect(g).toBeVisible();
      await expect(g.locator('.fl-obj-glass img')).toBeVisible();
      await expect(g.locator('.fl-obj-line')).toBeHidden();
      expect(await g.locator('.fl-obj-glass img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);

      await page.goto(HOME + '?objects=line');
      await toProject(page, 0); await page.waitForTimeout(500);
      await expect(page.locator('.proj[data-k="0"] .fl-obj-line')).toBeVisible();
      await expect(page.locator('.proj[data-k="0"] .fl-obj-glass')).toBeHidden();
      /* a project without screens: its print's object becomes the twin */
      const short = page.locator('.proj[data-short] .obj-line');
      if (await short.count()) await expect(short).toBeVisible();
      expect(await overflow(page)).toBeLessThanOrEqual(0);
    });
  });
}

test.describe('how it is made, per project', () => {
  test.use(desktop);
  test('each project draws its own plate; the stack stays the default form', async ({ page }) => {
    await page.goto(page_('recto') + '?still');
    await expect(page.locator('.p-how .hm-column')).toHaveCount(1);
    /* one part of the column per layer, and every entry of how is still in the list */
    await expect(page.locator('.hm-column .hm-part')).toHaveCount(5);
    await expect(page.locator('.hm-column .hm-i')).toHaveCount(5);
    await expect(page.locator('.hm-column .hm-items li')).toHaveCount(6);
    await page.goto(page_('english-prep') + '?still');
    await expect(page.locator('.p-how .hm-loop')).toHaveCount(1);
    await expect(page.locator('.hm-loop .hm-st')).toHaveCount(4);
    await expect(page.locator('.p-how .cut')).toHaveCount(0);
    /* Eat Map's how is unwritten: no section at all */
    await page.goto(page_('eat-map') + '?still');
    await expect(page.locator('.p-how')).toHaveCount(0);
  });

  test('the plates move with the scroll and stand finished at rest', async ({ page }) => {
    await page.goto(page_('english-prep'));
    const hp = () => page.locator('.hm-loop').evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--hp')));
    const top = await page.locator('.hm-loop').evaluate((e) => e.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo({ top: y - innerHeight + 40, behavior: 'instant' }), top);
    await page.waitForTimeout(200);
    const early = await hp();
    await page.evaluate((y) => scrollTo({ top: y - 80, behavior: 'instant' }), top);
    await page.waitForTimeout(200);
    const late = await hp();
    expect(early).toBeLessThan(0.3);
    expect(late).toBeGreaterThan(0.9);
  });
});

test.describe('the project story', () => {
  test.use(desktop);
  test('unwritten story sections leave no heading, bead or number', async ({ page }) => {
    for (const slug of PROJECTS) {
      await page.goto(page_(slug) + '?still');
      await expect(page.locator('.sy'), slug).toHaveCount(0);
      await expect(page.locator('.sy-n'), slug).toHaveCount(0);
      for (const w of ['Vision', 'Problem', 'Decisions', 'Refuses', 'Check it', 'Learned', 'Ahead']) {
        await expect(page.locator(`[data-rail-sec="${w}"]`), `${slug} ${w}`).toHaveCount(0);
      }
    }
  });
});

test.describe('the open tempo', () => {
  test.use(desktop);
  test('the open takes 1400 ms by default and 900 ms with ?open=900', async ({ page }) => {
    for (const [q, k] of [['', '1.55'], ['?open=900', '1']] as const) {
      await page.goto(HOME + q);
      await toProject(page, 0); await page.waitForTimeout(400);
      await page.locator('.proj[data-k="0"] .btn').click();
      await expect(page.locator('.layer')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--vt-k'))).toBe(k);
      await page.keyboard.press('Escape');
      await expect(page.locator('.layer')).toHaveCount(0);
    }
  });
});
