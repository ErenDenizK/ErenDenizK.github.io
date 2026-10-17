/* Home's rail (review row V6; src/one/scripts/bloom.ts, docs/design/rail-bloom.md): the beads
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
    await page.goto('');
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
    await page.goto('');
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
    await page.goto('');
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
    await page.goto('');
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
    await page.goto('');
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
    await page.goto('');
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
    await page.goto('');
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

test.describe('phone, no word twice', () => {
  test.use({ ...phone, deviceScaleFactor: 3 });

  /* round five (round-four critique §3): while a section's own title is on screen, the scrub's big name
     steps back and only the part and the number stay, so "Eat Map" never stands beside "Eat Map" */
  test('the scrub name gives way to the section\'s own title', async ({ page, context }) => {
    await page.goto('');
    await page.waitForTimeout(800);
    const cdp = await context.newCDPSession(page);
    const b = await col(page);
    const x = b.x + 22;
    let y = b.y + 6;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(450);
    await expect(page.locator('#rail')).toHaveClass(/is-scrub/);
    let echoes = 0;
    for (; y < b.y + b.height - 6; y += 10) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      await page.waitForTimeout(260);
      const s = await page.evaluate(() => {
        const tag = document.querySelector('.bl-tag')!;
        const name = (document.querySelector('.bl-tag-n')!.textContent ?? '').trim().toLowerCase();
        const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 64;
        const twin = [...document.querySelectorAll<HTMLElement>('[data-rail-sec] :is(h1, h2, h3)')].some((h) => {
          const t = (h.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
          const r = h.getBoundingClientRect();
          return (t === name || t.includes(name)) && r.bottom > bar && r.top < innerHeight && parseFloat(getComputedStyle(h).fontSize) >= 18;
        });
        return { name, twin, echo: tag.classList.contains('echo') };
      });
      if (!s.twin) continue;
      expect(s.echo, `"${s.name}" shown twice`).toBe(true);
      echoes++;
      /* the name steps back on a 180 ms fade: settled, it is gone (polled: under a full suite's load the fade
         can settle later than 260 ms; round six critique) */
      await expect.poll(() => page.evaluate(() => document.querySelector('.bl-tag')!.classList.contains('echo') ? +getComputedStyle(document.querySelector('.bl-tag-n')!).opacity : 0), { timeout: 1500 }).toBeLessThan(0.05);
    }
    expect(echoes).toBeGreaterThan(2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  });
});

test.describe('reduced motion', () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: 'reduce' } });
  test('the names appear at once and still', async ({ page }) => {
    await page.goto('');
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

/* Round six (review rows S1, S13, S14, S33; docs/design/rail-bloom.md §8). */
/** [ms, scrollY] sampled every animation frame for `ms` */
const samples = (page: Page, ms: number) => page.evaluate((d) => new Promise<[number, number][]>((res) => {
  const out: [number, number][] = [], t0 = performance.now();
  const f = () => { const t = performance.now() - t0; out.push([t, Math.round(scrollY)]); if (t < d) requestAnimationFrame(f); else res(out); };
  requestAnimationFrame(f);
}), ms);
/** a travel, not a jump: frames stand between the start and the end (headless software rendering draws the
    scroll scenes slowly, so few), and the page takes more than half a second from leaving to arriving */
const travelled = (s: [number, number][], a: number, b: number) => {
  const mid = s.filter(([, y]) => y > Math.min(a, b) + 20 && y < Math.max(a, b) - 20);
  const left = s.find(([, y]) => Math.abs(y - a) > 20)?.[0] ?? 0;
  const came = s.find(([, y]) => Math.abs(y - b) < 20)?.[0] ?? 0;
  return { frames: new Set(mid.map(([, y]) => y)).size, ms: came - left };
};

for (const [name, vp] of [['desktop', desktop], ['phone', { ...phone, deviceScaleFactor: 3 }]] as const) {
  test.describe(`round six, ${name}`, () => {
    test.use(vp);
    const tap = async (page: Page, x: number, y: number) => { if (name === 'phone') await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };

    test('the beads leave the rail and become the names\' markers, every name one pitch apart; they go back on close', async ({ page }) => {
      await page.goto('');
      await at(page, 'english-prep'); await page.waitForTimeout(600);
      const b = await col(page);
      await tap(page, b.x + 22, b.y + b.height * 0.55);
      /* frozen at the start: each name's dot stands exactly on its bead (the bead is hidden that same frame) */
      const start = await page.evaluate(() => {
        const mine = document.getAnimations().filter((a) => ((a.effect as KeyframeEffect)?.target as Element | null)?.closest?.('#rail'));
        mine.forEach((a) => { a.pause(); a.currentTime = 0; });
        (window as unknown as { __mine: Animation[] }).__mine = mine;
        const marks = [...document.querySelectorAll<HTMLElement>('#rail .rail-m')];
        return [...document.querySelectorAll<HTMLElement>('#rail .bl-dot')].map((d, j) => {
          const r = d.getBoundingClientRect(), m = marks[j].getBoundingClientRect();
          return { dx: Math.abs(r.left + r.width / 2 - (m.left + m.width / 2)), dy: Math.abs(r.top + r.height / 2 - (m.top + m.height / 2)), op: getComputedStyle(marks[j]).opacity };
        });
      });
      for (const s of start) { expect(s.dx).toBeLessThan(1.5); expect(s.dy).toBeLessThan(1.5); expect(s.op).toBe('0'); }
      await page.evaluate(() => (window as unknown as { __mine: Animation[] }).__mine.forEach((a) => a.play()));
      await page.waitForTimeout(1300);
      /* settled: none on the rail; the rows on one even pitch (S13) */
      expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#rail .rail-m')].every((m) => getComputedStyle(m).opacity === '0'))).toBe(true);
      const r = await rows(page);
      const steps = r.slice(1).map((x, i) => x.top - r[i].top);
      for (const s of steps) expect(Math.abs(s - steps[0])).toBeLessThan(0.6);
      /* the parts still read: the arc line breaks between them */
      expect(await page.locator('.bl-arc mask rect[fill="#000"]').count()).toBeGreaterThanOrEqual(2);
      await page.keyboard.press('Escape');
      await expect(page.locator('#rail')).not.toHaveClass(/is-bloom/);
      expect(await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('#rail .rail-m')].every((m) => getComputedStyle(m).opacity === '1'))).toBe(true);
    });

    test('a name is pressed, carried home and the page travels there, not jumps', async ({ page }) => {
      await page.goto('');
      await at(page, 'english-prep'); await page.waitForTimeout(600);
      const b = await col(page);
      await tap(page, b.x + 22, b.y + b.height * 0.55);
      await page.waitForTimeout(1200);
      const y0 = await page.evaluate(() => scrollY);
      const lab = page.locator('#rail .rail-i', { hasText: 'Photos' });
      const lb = (await lab.boundingBox())!;
      const [ys] = await Promise.all([samples(page, 2200), tap(page, lb.x + lb.width - 40, lb.y + lb.height / 2)]);
      const target = await page.evaluate(() => scrollY);
      expect(target).toBeGreaterThan(y0 + 1000);
      const tr = travelled(ys, y0, target);
      expect(tr.frames, 'the page passes through the sections between').toBeGreaterThanOrEqual(3);
      expect(tr.ms).toBeGreaterThan(500);
      await expect.poll(() => page.evaluate(() => document.getElementById('photos')!.getBoundingClientRect().top)).toBeLessThan(200);
      await expect(page.locator('#rail')).not.toHaveClass(/is-bloom/);
      await expect(page.locator('#rail .rail-i.is-press')).toHaveCount(0);
    });

    test('the brief\'s project links travel the page to the project', async ({ page }) => {
      await page.goto('');
      await page.waitForTimeout(800);
      const chip = page.locator('#brief a.chip[href="#eat-map"]');
      const cb = (await chip.boundingBox())!;
      const [ys] = await Promise.all([samples(page, 2400), tap(page, cb.x + cb.width / 2, cb.y + cb.height / 2)]);
      const end = await page.evaluate(() => scrollY);
      expect(end).toBeGreaterThan(1500);
      const tr = travelled(ys, 0, end);
      expect(tr.frames, 'no jump: the page passes through Bostancı, Recto and English Prep').toBeGreaterThanOrEqual(3);
      expect(tr.ms).toBeGreaterThan(500);
      const top = await page.evaluate(() => document.getElementById('eat-map')!.getBoundingClientRect().top);
      expect(top).toBeGreaterThan(0);
      expect(top).toBeLessThan(160);
      expect(await page.evaluate(() => location.hash)).toBe('#eat-map');
      /* the dot that flew into the rail is gone again */
      await expect(page.locator('.bl-fly')).toHaveCount(0);
    });
  });
}

test.describe('round six, reduced motion', () => {
  test.use({ ...desktop, contextOptions: { reducedMotion: 'reduce' } });
  test('the brief\'s links go at once', async ({ page }) => {
    await page.goto('');
    await page.waitForTimeout(400);
    await page.locator('#brief a.chip[href="#english-prep"]').click();
    await page.waitForTimeout(50);
    const top = await page.evaluate(() => document.getElementById('english-prep')!.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(160);
    await expect(page.locator('.bl-fly')).toHaveCount(0);
  });
});
