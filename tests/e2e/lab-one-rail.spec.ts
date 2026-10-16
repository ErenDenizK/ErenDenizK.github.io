/* Home's rail on /lab/one/ (review row V6; src/one/scripts/bloom.ts, docs/design/rail-bloom.md): the beads
   stay as on the live rail; a press held on the column scrubs the page with the section's name beside the
   thumb, and Escape puts the page back; a tap or Enter opens the names on one arc from the pressed point,
   with no panel, the current name lit; the keyboard moves through them and Escape closes; a name goes to its
   section. On the phone the names keep 44 px rows inside the screen and a held finger scrubs. Reduced
   motion opens the same names at once and still. The live site's rail is tested in rail.spec.ts. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, phone } from './helpers';

const at = (page: Page, id: string) => page.evaluate((s) => scrollTo({ top: document.getElementById(s)!.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }), id);
const col = async (page: Page) => (await page.locator('#rail .rail-btn').boundingBox())!;
/** the rows' boxes, their text boxes and their beads' centres */
const rows = (page: Page) => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#rail .rail-i')].map((a) => {
  const r = a.getBoundingClientRect(), t = a.querySelector('.rail-t')!.getBoundingClientRect(), d = a.querySelector('.bl-dot')!.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, h: r.height, left: t.left, right: t.right, dx: d.left + d.width / 2, dy: d.top + d.height / 2, on: a.classList.contains('on') };
}));

test.describe('desktop', () => {
  test.use(desktop);

  test('the old sheet is gone; the column is one button over the beads', async ({ page }) => {
    await page.goto('lab/one/');
    await expect(page.locator('.rail-glass, .rail-veil')).toHaveCount(0);
    await expect(page.locator('html')).toHaveClass(/rail-bloom/);
    const b = await col(page);
    expect(Math.round(b.width)).toBe(44);
    expect(Math.round(1440 - (b.x + b.width))).toBe(0);
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
    /* closed, the names are not in the tab order */
    await expect(page.locator('#rail .rail-sheet')).toHaveCSS('visibility', 'hidden');
  });

  test('a click blooms the names from the pressed point on one arc; Escape closes; a name goes there', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'english-prep'); await page.waitForTimeout(600);
    const y0 = await page.evaluate(() => scrollY);
    const b = await col(page);
    const py = b.y + b.height * 0.6;
    await page.mouse.click(b.x + 22, py);
    await expect(page.locator('#rail')).toHaveClass(/is-bloom/);
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.bl-veil')).toHaveClass(/on/);
    expect(Math.abs(await page.evaluate(() => scrollY) - y0), 'a click never moves the page').toBeLessThan(2);
    await page.waitForTimeout(1200);
    const r = await rows(page);
    /* one row per section, each at least 36 px tall, in order, never overlapping, inside the view */
    expect(r.length).toBe(10);
    for (let i = 0; i < r.length; i++) {
      expect(r[i].h).toBeGreaterThanOrEqual(36);
      expect(r[i].top).toBeGreaterThanOrEqual(76);
      expect(r[i].bottom).toBeLessThanOrEqual(900);
      if (i) expect(r[i].top).toBeGreaterThanOrEqual(r[i - 1].bottom - 0.5);
    }
    /* the beads lie on one circle: deepest (furthest from the rail) at the press height, nearer the rail away from it */
    const deep = r.reduce((m, x) => (x.dx < m.dx ? x : m));
    expect(Math.abs(deep.dy - py)).toBeLessThan(48);
    expect(r[0].dx).toBeGreaterThan(deep.dx);
    expect(r[r.length - 1].dx).toBeGreaterThan(deep.dx);
    expect(Math.max(...r.map((x) => x.dx)), 'every bead stays clear of the rail column').toBeLessThan(1440 - 26);
    /* the current name is lit in its section's light */
    const lit = page.locator('#rail .rail-i.on .rail-t');
    await expect(lit).toHaveText('English Prep');
    expect(await lit.evaluate((e) => getComputedStyle(e).color)).not.toBe(await page.locator('#rail .rail-i:not(.on, .done) .rail-t').first().evaluate((e) => getComputedStyle(e).color));
    await page.keyboard.press('Escape');
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#rail')).not.toHaveClass(/is-bloom/);
    /* again, and a name goes to its section and closes */
    await page.mouse.click(b.x + 22, py);
    await page.waitForTimeout(900);
    await page.locator('#rail .rail-i', { hasText: 'Photos' }).click();
    await expect(page.locator('#rail')).not.toHaveClass(/is-bloom/);
    await expect.poll(() => page.evaluate(() => document.getElementById('photos')!.getBoundingClientRect().top)).toBeLessThan(400);
  });

  test('the veil closes it, and has no box: blurred and shaded on a gradient from the right edge', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'recto'); await page.waitForTimeout(500);
    const b = await col(page);
    await page.mouse.click(b.x + 22, b.y + b.height / 2);
    await page.waitForTimeout(800);
    const layers = await page.evaluate(() => [...document.querySelectorAll('.bl-veil > i')].map((e) => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { right: Math.round(innerWidth - r.right), w: r.width, blur: cs.backdropFilter, mask: cs.maskImage || (cs as any).webkitMaskImage };
    }));
    expect(layers.length).toBe(4);
    const px = layers.map((l) => parseFloat(/blur\(([\d.]+)px/.exec(l.blur)![1]));
    for (let i = 1; i < 4; i++) {
      expect(px[i], 'each layer blurs more').toBeGreaterThan(px[i - 1]);
      expect(layers[i].w, 'and reaches less far from the rail').toBeLessThan(layers[i - 1].w);
    }
    for (const l of layers) { expect(l.right).toBe(0); expect(l.mask).toContain('linear-gradient'); }
    await page.mouse.click(300, 450);
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('hold to scrub: the page follows, the name surfaces, the column spreads; Escape puts the page back', async ({ page }) => {
    await page.goto('lab/one/');
    await page.waitForTimeout(600);
    const b = await col(page);
    const x = b.x + 22;
    await page.mouse.move(x, b.y + b.height * 0.3);
    await page.mouse.down();
    await page.waitForTimeout(350);
    await expect(page.locator('#rail')).toHaveClass(/is-scrub/);
    await expect(page.locator('.bl-tag')).toHaveClass(/on/);
    /* the beads spread to one slot each */
    const pitch = await page.evaluate(() => { const m = [...document.querySelectorAll('#rail .rail-m')].map((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }); return m.slice(1).map((y, i) => y - m[i]); });
    /* the page follows the thumb, the current bead changes and morphs on its 480 ms spring: let it settle */
    await page.waitForTimeout(1400);
    const pitch2 = await page.evaluate(() => { const m = [...document.querySelectorAll('#rail .rail-m')].map((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }); return m.slice(1).map((y, i) => y - m[i]); });
    expect(Math.min(...pitch2)).toBeGreaterThan(Math.min(...pitch) - 0.5);
    expect(Math.max(...pitch2) - Math.min(...pitch2), 'one even slot per section').toBeLessThan(1.5);
    const y1 = await page.evaluate(() => scrollY);
    for (let i = 1; i <= 10; i++) { await page.mouse.move(x, b.y + b.height * 0.3 + i * 12); await page.waitForTimeout(30); }
    await page.waitForTimeout(400);
    const y2 = await page.evaluate(() => scrollY);
    expect(y2).toBeGreaterThan(y1 + 300);
    const name = await page.locator('.bl-tag-n').textContent();
    expect(name).toBe(await page.locator('#rail .rail-i.on .rail-t').textContent());
    await page.keyboard.press('Escape');
    await expect(page.locator('#rail')).not.toHaveClass(/is-scrub/);
    expect(Math.abs(await page.evaluate(() => scrollY))).toBeLessThan(2);
    await page.mouse.up();
    /* a held press released does not open the names */
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard: Enter opens with focus on the current name, arrows move, Escape returns to the column', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'eat-map'); await page.waitForTimeout(600);
    await page.locator('#rail .rail-btn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rail .rail-i:focus')).toHaveText('Eat Map');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#rail .rail-i:focus')).toHaveText('How I work');
    await page.keyboard.press('Home');
    await expect(page.locator('#rail .rail-i:focus')).toHaveText('Eren');
    await page.keyboard.press('Escape');
    await expect(page.locator('#rail .rail-btn')).toBeFocused();
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('phone', () => {
  test.use({ ...phone, deviceScaleFactor: 3 });

  test('a tap blooms 44 px rows that fit the screen, out of the thumb\'s column; the veil spans the width', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'photos'); await page.waitForTimeout(600);
    const b = await col(page);
    expect(Math.round(b.width)).toBe(44);
    await page.touchscreen.tap(b.x + 22, b.y + b.height * 0.6);
    await expect(page.locator('#rail')).toHaveClass(/is-bloom/);
    await page.waitForTimeout(1200);
    const r = await rows(page);
    for (const x of r) {
      expect(x.h).toBeGreaterThanOrEqual(44);
      expect(x.left).toBeGreaterThanOrEqual(16);
      expect(x.top).toBeGreaterThanOrEqual(76);
      expect(x.bottom).toBeLessThanOrEqual(844);
      expect(x.right, 'names never under the rail column').toBeLessThan(390 - 44);
    }
    expect(await page.locator('.bl-veil > i').first().evaluate((e) => Math.round(e.getBoundingClientRect().width))).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    /* a tap on the page closes it */
    await page.touchscreen.tap(60, 420);
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('a held finger scrubs; a swipe on the rail still scrolls natively', async ({ page, context }) => {
    await page.goto('lab/one/');
    await page.waitForTimeout(800);
    const cdp = await context.newCDPSession(page);
    const b = await col(page);
    const x = b.x + 22;
    let y = b.y + b.height * 0.3;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(450);
    await expect(page.locator('#rail')).toHaveClass(/is-scrub/);
    const y1 = await page.evaluate(() => scrollY);
    for (let i = 0; i < 10; i++) { y += 12; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await page.waitForTimeout(30); }
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(y1 + 300);
    await expect(page.locator('.bl-tag')).toHaveClass(/on/);
    /* the name sits above the finger, not under it */
    const tag = (await page.locator('.bl-tag-n').boundingBox())!;
    expect(tag.y + tag.height).toBeLessThan(y);
    /* and clear of the 44 px column, so the finger's target and the name never share pixels */
    expect(tag.x + tag.width).toBeLessThanOrEqual(b.x - 8);
    /* the person's part has no label that would repeat "Eren" */
    await expect(page.locator('.bl-tag-g')).not.toHaveText('Eren');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('#rail')).not.toHaveClass(/is-scrub/);
    await expect(page.locator('#rail .rail-btn')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('reduced motion', () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: 'reduce' } });
  test('the names appear at once and still', async ({ page }) => {
    await page.goto('lab/one/');
    await at(page, 'recto'); await page.waitForTimeout(400);
    const b = await col(page);
    await page.mouse.click(b.x + 22, b.y + b.height / 2);
    /* no scripted entrance (colour cross-fades of the stylesheet may run) */
    const anims = await page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)
      && ((a.effect as KeyframeEffect)?.target as Element | null)?.closest?.('#rail li')).length);
    expect(anims).toBe(0);
    await expect(page.locator('#rail .rail-i.on')).toBeVisible();
    expect(await page.locator('.bl-veil > i').first().evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  });
});
