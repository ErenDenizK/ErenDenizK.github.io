/* The contents ladder (ADR-0011): sections from the page, the native bar hidden without a shift only
   where the rail is drawn, keyboard reach and a visible focus ring, drag mapped section by section,
   contrast of every dash, the platform's own scrollbar back for forced colours and no JavaScript, and
   the touch ladder (the platform indicator hidden so it never overlaps, a sheet on tap). The essay's rail (replacing its contents list) is checked in fixtures.spec.ts. */
import { test, expect, type Page } from '@playwright/test';
import { desktop, tablet, phone, settle } from './helpers';

/* classic scrollbars (as on Windows, Linux, macOS "Always"), so a bar that comes and goes would move the page */
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

const rail = (page: Page) => page.evaluate(() => {
  const html = document.documentElement;
  const nav = document.querySelector<HTMLElement>('.rail');
  return {
    on: html.classList.contains('rail-on'),
    drawn: !!nav && !nav.hidden && getComputedStyle(nav).display !== 'none',
    bar: getComputedStyle(html).scrollbarWidth,
    labels: [...document.querySelectorAll('.rail-t')].map((t) => t.textContent),
    gutter: innerWidth - html.clientWidth,
    over: Math.max(html.scrollWidth, document.body.scrollWidth) - innerWidth,
  };
});

test.describe('desktop', () => {
  test.use(desktop);

  test('sections come from the page; short and unmarked pages get none', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    let r = await rail(page);
    expect(r).toMatchObject({ on: true, drawn: true, bar: 'none', gutter: 0, labels: ['Products I direct', 'Recto', 'English Prep', 'Eat Map'] });
    expect(r.over).toBeLessThanOrEqual(0);
    await page.goto('about/?still'); await settle(page, 300);
    r = await rail(page);
    expect(r).toMatchObject({ on: true, drawn: true, bar: 'none' });
    expect(r.labels).toHaveLength(3);
    expect(r.over).toBeLessThanOrEqual(0);
    for (const path of ['', 'record/', 'work/recto/', 'nope/']) {
      await page.goto(path + '?still'); await settle(page, 200);
      r = await rail(page);
      expect(r, `/${path}`).toMatchObject({ on: false, drawn: false, bar: 'auto' });
      if (path !== 'nope/') expect(r.gutter, `/${path} keeps the native bar`).toBeGreaterThan(0);
    }
  });

  test('the bar is hidden before first paint: no sideways shift', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__w = [] as number[];
      new MutationObserver(() => (window as any).__w.push(document.documentElement.clientWidth)).observe(document, { childList: true, subtree: true });
    });
    await page.goto('work/?still'); await settle(page, 300);
    const widths: number[] = await page.evaluate(() => (window as any).__w.filter((w: number) => w > 0));
    expect(new Set(widths).size, `client widths seen while loading: ${[...new Set(widths)]}`).toBe(1);
  });

  test('native scrolling is untouched: wheel over the rail and keys scroll the page', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const box = (await page.locator('.rail').boundingBox())!;
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    /* a fresh headless page can drop its very first wheel event before the compositor is ready */
    for (let i = 0; i < 3 && (await page.evaluate(() => scrollY)) < 300; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(500); }
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300);
    await page.mouse.move(700, 450);
    await page.keyboard.press('End'); await page.waitForTimeout(800);
    expect(await page.evaluate(() => Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight))).toBeLessThan(2);
    await expect(page.locator('.rail-i').last()).toHaveAttribute('aria-current', 'location');
  });

  test('every dash keeps 3:1 on the ground, Eat Map rose included', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const worst = await page.evaluate(() => {
      const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (s: string) => { const n = (s.match(/[\d.]+/g) || []).map(Number); return 0.2126 * lin(n[0]) + 0.7152 * lin(n[1]) + 0.0722 * lin(n[2]); };
      const cr = (s: string) => (lum(s) + 0.05) / (lum('rgb(10, 10, 11)') + 0.05);
      const out: [string, number][] = [];
      const probe = document.createElement('i');
      document.body.append(probe);
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--rail-idle');
      out.push(['idle', cr(getComputedStyle(probe).color)]);
      probe.remove();
      document.querySelectorAll<HTMLElement>('.rail-i').forEach((a) => {
        const t = a.querySelector('.rail-t')!.textContent!;
        out.push([t + ' lit', cr(a.style.getPropertyValue('--a'))], [t + ' behind', cr(a.style.getPropertyValue('--ar'))]);
      });
      return out.sort((x, y) => x[1] - y[1]);
    });
    expect(worst[0][1], worst.map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')).toBeGreaterThanOrEqual(3);
  });

  test('keyboard: the list is reachable, its focus is visible, and Enter goes there', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('work/?still'); await settle(page, 300);
    const first = page.locator('.rail-i').first();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      if (await first.evaluate((a) => a === document.activeElement)) break;
    }
    await expect(first).toBeFocused();
    const ring = await first.evaluate((a) => {
      const cs = getComputedStyle(a), r = a.getBoundingClientRect(), nav = a.closest('.rail')!;
      return { style: cs.outlineStyle, w: parseFloat(cs.outlineWidth), l: r.left, r: r.right, h: r.height, label: +getComputedStyle(a.querySelector('.rail-t')!).opacity, clip: getComputedStyle(nav).clipPath };
    });
    expect(ring.style).toBe('solid');
    expect(ring.w).toBeGreaterThanOrEqual(2);
    expect(ring.r).toBeLessThanOrEqual(1440);
    expect(ring.l).toBeGreaterThan(1440 - 400);
    expect(ring.h).toBeGreaterThanOrEqual(24);
    await page.waitForTimeout(300);
    expect(await first.evaluate((a) => +getComputedStyle(a.querySelector('.rail-t')!).opacity)).toBe(1);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.rail-i').nth(2)).toBeFocused();
    await page.keyboard.press('Enter');
    /* reduced motion: the jump is instant, and focus moves to the section */
    const at = await page.evaluate(() => ({ top: Math.round(document.getElementById('english-prep')!.getBoundingClientRect().top), ae: document.activeElement?.id }));
    expect(at.ae).toBe('english-prep');
    expect(at.top).toBeGreaterThan(60);
    expect(at.top).toBeLessThan(160);
    await page.waitForTimeout(100);
    await expect(page.locator('.rail-i').nth(2)).toHaveAttribute('aria-current', 'location');
  });

  test('a click on a dash goes to its section', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const b = (await page.locator('.rail-i').nth(3).boundingBox())!;
    await page.mouse.click(b.x + b.width - 20, b.y + b.height / 2);
    await expect.poll(() => page.evaluate(() => document.getElementById('eat-map')!.getBoundingClientRect().top), { timeout: 4000 }).toBeLessThan(160);
    await expect(page.locator('.rail-i').nth(3)).toHaveAttribute('aria-current', 'location');
  });

  test('drag scrubs section by section; Escape puts the page back', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const rows = await page.locator('.rail-i').evaluateAll((as) => as.map((a) => { const r = a.getBoundingClientRect(); return { x: r.right - 20, y: r.top, h: r.height }; }));
    await page.mouse.move(rows[0].x, rows[0].y + 4);
    await page.mouse.down();
    const sec = () => page.evaluate(() => [...document.querySelectorAll('.rail-i')].findIndex((a) => a.getAttribute('aria-current') === 'location'));
    for (const i of [1, 2, 3]) {
      await page.mouse.move(rows[i].x, rows[i].y + rows[i].h / 2, { steps: 6 });
      await page.waitForTimeout(120);
      expect(await sec(), `pointer over dash ${i}`).toBe(i);
      const f = await page.locator('.rail-i').nth(i).evaluate((a) => +a.style.getPropertyValue('--f'));
      if (i < 3) { expect(f).toBeGreaterThan(0.3); expect(f).toBeLessThan(0.7); }
    }
    await expect(page.locator('.rail')).toHaveClass(/is-drag/);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.mouse.up();
    expect(await sec()).toBe(0);
  });
});

test.describe('the platform scrollbar stays', () => {
  test('forced colours: no rail, native bar', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, forcedColors: 'active' });
    const page = await ctx.newPage();
    await page.goto('work/?still'); await settle(page, 300);
    const r = await rail(page);
    expect(r).toMatchObject({ on: false, drawn: false, bar: 'auto' });
    expect(r.gutter).toBeGreaterThan(0);
    await ctx.close();
  });
  test('no JavaScript: no rail, native bar', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('work/?still'); await settle(page, 300);
    const r = await rail(page);
    expect(r).toMatchObject({ on: false, drawn: false, bar: 'auto' });
    expect(r.gutter).toBeGreaterThan(0);
    await ctx.close();
  });
  test('touch with forced colours or no JavaScript: no ladder, native indicator', async ({ browser }) => {
    for (const extra of [{ forcedColors: 'active' as const }, { javaScriptEnabled: false }]) {
      const ctx = await browser.newContext({ ...phone, ...extra });
      const page = await ctx.newPage();
      await page.goto('work/?still'); await settle(page, 300);
      expect(await rail(page), JSON.stringify(extra)).toMatchObject({ on: false, drawn: false, bar: 'auto' });
      expect(await page.evaluate(() => document.documentElement.classList.contains('rail-touch'))).toBe(false);
      await ctx.close();
    }
  });
});

/* Touch (ADR-0011 item 12): native scrolling stays and the platform's indicator is hidden through the root's
   scrollbar-width (the one switch iOS Safari reads for the page scroller), so it never draws over the ladder;
   a slim ladder sits inside the right gutter as one 44 px button; a tap opens the titles as a small sheet, a
   title goes there and closes it. */
test.describe('touch: the slim ladder', () => {
  for (const [size, opts] of [['tablet', tablet], ['phone', phone]] as const) {
    test(`touch (${size}): no platform indicator, a ladder in the gutter, a sheet on tap`, async ({ browser }) => {
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      for (const path of ['work/', 'about/']) {
        await page.goto(path + '?still'); await settle(page, 300);
        const r = await rail(page);
        expect(r, `/${path}`).toMatchObject({ on: false, drawn: true, bar: 'none', gutter: 0 });
        expect(r.over).toBeLessThanOrEqual(0);
        const g = await page.evaluate(() => {
          const b = document.querySelector<HTMLElement>('.rail-btn')!.getBoundingClientRect();
          const marks = [...document.querySelectorAll<HTMLElement>('.rail-m')].map((m) => m.getBoundingClientRect());
          const W = document.documentElement.clientWidth;
          const gut = parseFloat(getComputedStyle(document.querySelector('.page')!).paddingRight) || 16;
          return { w: b.width, h: b.height, right: W - b.right, inGutter: marks.every((m) => m.left >= W - gut), sheet: getComputedStyle(document.querySelector('.rail-sheet')!).display };
        });
        expect(g.w, 'a 44 px target').toBeGreaterThanOrEqual(44);
        expect(g.h).toBeGreaterThanOrEqual(44);
        expect(g.right).toBeLessThanOrEqual(1);
        expect(g.inGutter, 'the dashes stay out of the reading column').toBe(true);
        expect(g.sheet, 'closed until tapped').toBe('none');
      }
      /* scrolling stays native and the ladder follows it */
      await page.goto('work/?still'); await settle(page, 300);
      const n = await page.locator('.rail-m').count();
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      await expect(page.locator('.rail-m').nth(n - 1)).toHaveClass(/\bon\b/);
      await expect(page.locator('.rail-btn')).toHaveAttribute('aria-label', new RegExp(`${n} of ${n}`));
      /* tap: the sheet opens with 44 px rows; a title goes to its section and closes the sheet */
      await page.tap('.rail-btn');
      await expect(page.locator('.rail-btn')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.rail-sheet')).toBeVisible();
      await page.waitForTimeout(500);   // and it stays open after the finger lifts
      await expect(page.locator('.rail-sheet')).toBeVisible();
      const rows = await page.locator('.rail-i').evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height));
      expect(Math.min(...rows)).toBeGreaterThanOrEqual(44);
      const sheetBox = await page.locator('.rail-sheet').boundingBox();
      expect(sheetBox!.x).toBeGreaterThanOrEqual(0);
      await page.locator('.rail-i').nth(1).tap();
      await expect(page.locator('.rail-btn')).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(() => page.evaluate(() => {
        const id = document.querySelectorAll<HTMLAnchorElement>('.rail-i')[1].hash.slice(1);
        return Math.round(document.getElementById(id)!.getBoundingClientRect().top);
      }), { timeout: 3000 }).toBeLessThan(200);
      /* a tap outside closes it */
      await page.tap('.rail-btn');
      await expect(page.locator('.rail-sheet')).toBeVisible();
      await page.touchscreen.tap(40, 420);
      await expect(page.locator('.rail-sheet')).toBeHidden();
      await ctx.close();
    });
  }
});

/* the bar is hidden before first paint on touch too (classic bars here, so a late hide would narrow the page),
   and a phone on its side keeps the ladder: iOS does not bring its indicator back once it is hidden */
test.describe('touch: hidden from the start, kept on its side', () => {
  test('tablet: constant client width during load', async ({ browser }) => {
    const ctx = await browser.newContext(tablet);
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      const w: number[] = [];
      (window as unknown as { __w: number[] }).__w = w;
      const tick = () => { if (document.documentElement) w.push(document.documentElement.clientWidth); if (w.length < 120) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.goto('work/?still'); await settle(page, 600);
    const w = await page.evaluate(() => (window as unknown as { __w: number[] }).__w);
    expect(new Set(w).size, `widths seen: ${[...new Set(w)].join(', ')}`).toBe(1);
    expect(w[0]).toBe(1180);
    await ctx.close();
  });
  test('phone turned on its side: the ladder stays, its sheet fits', async ({ browser }) => {
    const ctx = await browser.newContext({ ...phone });
    const page = await ctx.newPage();
    await page.goto('work/?still'); await settle(page, 300);
    await page.setViewportSize({ width: 844, height: 320 });
    await settle(page, 300);
    expect(await rail(page)).toMatchObject({ drawn: true, bar: 'none' });
    await page.tap('.rail-btn');
    const box = await page.locator('.rail-sheet').boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(320);
    await ctx.close();
  });
});
