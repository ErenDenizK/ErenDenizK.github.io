/* Work (src/one/work/, spec v2 §3.3 to §3.4): on its scratch page /lab/one-work/ and on /lab/one/, and
   the static twin of each presentation at /lab/one/work/<slug>/. Hidden like every lab page; no
   horizontal overflow at the four widths; the still twin (no JavaScript, reduced motion) is a complete
   list whose links open complete pages; the flight is a pure function of the scroll position (no pin
   but the last block's hold, the same picture on the way back); the open works from a frame in mid
   flight and keeps one history step and the focus (on the close, spec v3 §4.2); the opened project has its
   rail, its scrubbed steps, two glass capsules whose close folds, and the cutaway. Home's rail: lab-one-rail.spec.ts. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, PROJECTS } from './helpers';
import { BASE } from '../../playwright.config';

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
    test(`no horizontal overflow in the flight, in each open project and on each static page (${label})`, async ({ page }) => {
      const fails: string[] = [];
      await page.goto(LAB);
      for (const [k, slug] of PROJECTS.entries()) {
        await page.evaluate((k) => scrollTo({ top: document.querySelectorAll<HTMLElement>('.proj')[k].getBoundingClientRect().top + scrollY, behavior: 'instant' }), k);
        await page.waitForTimeout(500);
        if (await overflow(page) > 0) fails.push(`flight at ${slug}`);
        await page.locator(`.proj[data-k="${k}"] .btn`).click();
        await expect(page.locator('.layer .cap-x')).toBeFocused();
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
    await expect(page.locator('#work')).not.toHaveAttribute('data-live', '');
    await expect(page.locator('.fl-side').first()).toBeHidden();
    for (const slug of PROJECTS) {
      const proj = page.locator(`.proj#${slug}`);
      await expect(proj).toHaveAttribute('data-aura', /^#[0-9a-f]{6} #[0-9a-f]{6} #[0-9a-f]{6}$/);
      await expect(proj.locator('.w-title')).toBeVisible();
      await expect(proj.locator('.w-promise')).toBeVisible();
      await expect(proj.locator('.btn')).toHaveAttribute('href', new RegExp(`/lab/one/work/${slug}/$`));
      await expect(proj.locator('.fl-hero .pr')).toBeVisible();
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
  test('no flight, and the open is immediate', async ({ page }) => {
    await page.goto(LAB);
    await expect(page.locator('#work')).not.toHaveAttribute('data-live', '');
    expect(await page.locator('.proj#recto .fl-hero').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
    await page.locator('.proj[data-slug="english-prep"] .btn').click();
    await expect(page).toHaveURL(/\/lab\/one\/work\/english-prep\/$/);
    await expect(page.locator('.layer .cap-x')).toBeFocused();
    await expect(page.locator('.layer .steps')).not.toHaveClass(/pinned/);
  });
});

for (const [label, size] of [['desktop', desktop], ['phone', phone]] as const) {
  test.describe(label, () => {
    test.use(size);
    test(`open and close keep one history step, Home's place and the focus (${label})`, async ({ page }) => {
      await page.goto(LAB);
      await page.waitForTimeout(300);
      await page.evaluate(() => scrollTo({ top: document.querySelectorAll<HTMLElement>('.proj')[1].getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await page.waitForTimeout(600);
      const y0 = await page.evaluate(() => scrollY);
      const hl = await page.evaluate(() => history.length);
      await page.locator('.proj[data-k="1"] .btn').click();
      await expect(page).toHaveURL(/\/lab\/one\/work\/english-prep\/$/);
      await expect(page.locator('.layer .cap-x')).toBeFocused();
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
      await expect(page.locator('.layer .cap-x')).toBeFocused();
      await page.locator('.layer [data-close]').click();
      await expect(page.locator('.layer')).toHaveCount(0);
      await expect(page).toHaveURL(/\/lab\/one-work\/$/);
      await expect(page.locator('#main')).toHaveJSProperty('inert', false);
    });
  });
}

test.describe('the flight (desktop)', () => {
  test.use(desktop);
  /* the poses of the blocks the flight draws: a block more than 1.6 views away is off screen and is left as
     it was (flight.ts), so only the blocks within that window make the picture */
  const pose = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#work .proj')]
    .filter((p) => Math.abs(p.getBoundingClientRect().top / innerHeight) <= 1.6)
    .flatMap((p) => [...p.querySelectorAll<HTMLElement>('.fl-hero, .fl-side, .txt-in')]).map((e) => e.style.transform).join('|'));
  const at = (page: Page, slug: string, f: number) => page.evaluate(([s, f]) => scrollTo({ top: document.getElementById(s as string)!.getBoundingClientRect().top + scrollY + (f as number) * innerHeight, behavior: 'instant' }), [slug, f]);

  test('nothing is pinned but the last block, and every value follows the scroll position', async ({ page }) => {
    await page.goto('lab/one/');
    await expect(page.locator('#work')).toHaveAttribute('data-live', '');
    const sticky = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#work *')].filter((e) => getComputedStyle(e).position === 'sticky').map((e) => e.closest('.proj')?.id));
    expect(sticky).toEqual(['eat-map']);
    /* the same place gives the same picture, coming from above or from below (reversible, no timers) */
    await at(page, 'recto', 0.3); await page.waitForTimeout(900);
    const down = await pose(page);
    await at(page, 'english-prep', 0.4); await page.waitForTimeout(400);
    await at(page, 'recto', 0.3); await page.waitForTimeout(900);
    expect(await pose(page)).toBe(down);
    /* at rest the hero stands nearly flat and in colour; in flight it bends and greys */
    await at(page, 'recto', 0); await page.waitForTimeout(400);
    expect(+(await page.locator('#recto .pr-twin').evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(0.05);
    await at(page, 'recto', 0.6); await page.waitForTimeout(400);
    expect(+(await page.locator('#recto .pr-twin').evaluate((e) => getComputedStyle(e).opacity))).toBeGreaterThan(0.3);
    expect(await page.locator('#recto .fl-hero').evaluate((e) => e.style.transform)).toMatch(/rotateX\(-?[1-9]/);
  });

  test('the drawings load as layers, and the places of the last one light ahead of the torn edge', async ({ page }) => {
    await page.goto('lab/one/');
    for (const slug of PROJECTS) {
      await at(page, slug, 0);
      await expect(page.locator(`#${slug} .fl-art.live .fl-layer`)).toHaveCount(3);
    }
    const lit = () => page.locator('#eat-map .fl-stop').evaluateAll((g) => g.map((x) => +getComputedStyle(x).opacity));
    await at(page, 'eat-map', 0); await page.waitForTimeout(300);
    const before = await lit();
    await at(page, 'eat-map', 0.5); await page.waitForTimeout(300);
    const after = await lit();
    expect(after.reduce((a, b) => a + b)).toBeGreaterThan(before.reduce((a, b) => a + b));
  });

  test('a frame clicked in mid flight opens its project; the layer has its rail and scrubbed steps', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'recto', 0.25); await page.waitForTimeout(400);
    await page.locator('#recto .fl-hero').click({ force: true });
    await expect(page).toHaveURL(/\/lab\/one\/work\/recto\/$/);
    await expect(page.locator('.layer .cap-x')).toBeFocused();
    const rail = page.locator('.layer .rail.in-layer');
    await expect(rail).toBeVisible();
    /* Overview, Facts, one bead per step, How it's made, Next (Recto has no numbers and no quote yet) */
    await expect(rail.locator('.rail-m')).toHaveCount(2 + 3 + 2);
    const steps = page.locator('.layer .steps');
    await expect(steps).toHaveClass(/pinned/);
    /* halfway through the first boundary both screens show, the next one sliding over the last */
    const y = await steps.evaluate((s) => { const l = s.closest('.layer')!; return s.getBoundingClientRect().top + l.scrollTop + 0.5 * 0.7 * innerHeight; });
    await page.evaluate((y) => { document.querySelector('.layer')!.scrollTop = y; }, y);
    await page.waitForTimeout(300);
    const shots = await page.locator('.layer .st').evaluateAll((st) => st.map((e) => [getComputedStyle(e).visibility, new DOMMatrix(getComputedStyle(e.querySelector('.st-shot')!).transform).m42]));
    expect(shots[0][0]).toBe('visible');
    expect(shots[1][0]).toBe('visible');
    expect(shots[1][1]).toBeGreaterThan(20);
    expect(shots[1][1]).toBeLessThan(500);
    await page.keyboard.press('Escape');
    await expect(page.locator('.layer')).toHaveCount(0);
  });
});

test('on Home every project link stays under the site base once', async ({ page }) => {
  await page.goto('lab/one/?still');
  for (const slug of PROJECTS) await expect(page.locator(`#${slug} .btn`)).toHaveAttribute('href', `${BASE}lab/one/work/${slug}/`);
});

test.describe('round 3: capsules and cutaway (desktop)', () => {
  test.use(desktop);
  const at = (page: Page, slug: string) => page.evaluate((s) => scrollTo({ top: document.getElementById(s)!.getBoundingClientRect().top + scrollY, behavior: 'instant' }), slug);

  test('the close is its own capsule, labelled first, folded after 4 s and on later opens; one height for both', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'recto'); await page.waitForTimeout(400);
    await page.locator('#recto .btn').click();
    await expect(page.locator('.layer.settled')).toHaveCount(1);
    const c = page.locator('.layer .cap-c'), a = page.locator('.layer .cap-a');
    await expect(page.locator('.layer .caps')).not.toHaveClass(/folded/);
    await expect(page.locator('.layer .cap-lb')).toBeVisible();
    await expect(page.locator('.layer .cap-kbd')).toHaveText('esc');
    /* two capsules, apart, on one line and one height (T13, T14) */
    await page.waitForTimeout(500);
    const [bc, ba] = [await c.boundingBox(), await a.boundingBox()];
    expect(Math.round(bc!.height)).toBe(Math.round(ba!.height));
    expect(Math.round(bc!.y)).toBe(Math.round(ba!.y));
    expect(ba!.x - (bc!.x + bc!.width)).toBeGreaterThanOrEqual(11);
    /* the cross never shrinks (the phone bug of round 2 squeezed it to 12 px) */
    expect((await page.locator('.layer .cap-x .icon').boundingBox())!.width).toBeGreaterThanOrEqual(19);
    await expect(page.locator('.layer .caps')).toHaveClass(/folded/, { timeout: 6000 });
    await page.waitForTimeout(400);
    expect(Math.round((await c.boundingBox())!.width)).toBe(Math.round(bc!.height));
    await page.keyboard.press('Escape');
    await expect(page.locator('.layer')).toHaveCount(0);
    await page.locator('#recto .btn').click();
    await expect(page.locator('.layer .caps')).toHaveClass(/folded/);
    await page.keyboard.press('Escape');
  });

  test('how it is made is the cutaway: one slab and one labelled entry per layer, every item kept', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'recto'); await page.waitForTimeout(400);
    await page.locator('#recto .btn').click();
    await expect(page.locator('.layer.settled')).toHaveCount(1);
    await expect(page.locator('.layer .how-crop')).toHaveCount(0);
    await expect(page.locator('.layer .cut .pl')).toHaveCount(5);
    await expect(page.locator('.layer .cut-i')).toHaveCount(5);
    await expect(page.locator('.layer .cut-i .cut-name').first()).toContainText('Browser tab');
    await expect(page.locator('.layer .cut-items li')).toHaveCount(6);
    /* the drawing follows the section's progress: closed and undrawn below the view, apart once in view */
    const hp = () => page.locator('.layer .cut').evaluate((e) => +getComputedStyle(e).getPropertyValue('--hp'));
    await page.evaluate(() => { const l = document.querySelector('.layer')!; const c = l.querySelector('.p-how')!; l.scrollTop = c.getBoundingClientRect().top + l.scrollTop - innerHeight; });
    await page.waitForTimeout(300);
    const low = await hp();
    await page.evaluate(() => { const l = document.querySelector('.layer')!; const c = l.querySelector('.p-how')!; l.scrollTop = c.getBoundingClientRect().top + l.scrollTop - 100; });
    await page.waitForTimeout(300);
    expect(low).toBeLessThan(0.2);
    expect(await hp()).toBeGreaterThan(0.8);
    await page.keyboard.press('Escape');
  });
});

test.describe('round 3: capsules on the phone', () => {
  test.use(phone);
  test('close at the left gutter, actions at the right one, one height', async ({ page }) => {
    await page.goto('lab/one/');
    await page.evaluate(() => scrollTo({ top: document.getElementById('recto')!.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.locator('#recto .btn').click();
    await expect(page.locator('.layer.settled')).toHaveCount(1);
    await page.waitForTimeout(600);
    const c = (await page.locator('.layer .cap-c').boundingBox())!, a = (await page.locator('.layer .cap-a').boundingBox())!;
    expect(Math.round(c.x)).toBe(16);
    expect(Math.round(390 - (a.x + a.width))).toBe(16);
    expect(Math.round(c.height)).toBe(Math.round(a.height));
    expect(c.height).toBeGreaterThanOrEqual(52);
    expect((await page.locator('.layer .cap-x .icon').boundingBox())!.width).toBeGreaterThanOrEqual(19);
  });
});
