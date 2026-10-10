/* The rail (ADR-0011, revised by ADR-0013): one custom scrollbar on every page and in the project sheet.
   One bar everywhere (the same track and thumb with sections, without them and in the sheet); sections
   from the page add marks and titles, a page without them gets the bar alone; the native bar hidden on
   every page without a shift, so the bar never moves between pages; keyboard reach and a visible focus
   ring, the thumb's drag, contrast of every mark, the platform's own scrollbar back for forced colours and
   no JavaScript, touch (the platform indicator hidden so it never overlaps, a sheet on tap), the sheet's own rail, and the Istanbul clock in the bar. The
   essay's rail (replacing its contents list) is checked in fixtures.spec.ts. */
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
    plain: (() => { const p = document.querySelector<HTMLElement>('.rail-plain:not(.in-sheet)'); return !!p && !p.hidden && getComputedStyle(p).display !== 'none'; })(),
    bar: getComputedStyle(html).scrollbarWidth,
    labels: [...document.querySelectorAll('.rail-t')].map((t) => t.textContent),
    gutter: innerWidth - html.clientWidth,
    over: Math.max(html.scrollWidth, document.body.scrollWidth) - innerWidth,
  };
});

test.describe('desktop', () => {
  test.use(desktop);

  test('sections come from the page; pages without them get the plain variant', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    let r = await rail(page);
    expect(r).toMatchObject({ on: true, drawn: true, plain: false, bar: 'none', gutter: 0, labels: ['Products I direct', 'Recto', 'English Prep', 'Eat Map'] });
    expect(r.over).toBeLessThanOrEqual(0);
    await page.goto('about/?still'); await settle(page, 300);
    r = await rail(page);
    expect(r).toMatchObject({ on: true, drawn: true, bar: 'none' });
    expect(r.labels.length).toBeGreaterThanOrEqual(3);
    expect(r.over).toBeLessThanOrEqual(0);
    /* a project page: its porch and sections are the rungs, and its own contents list steps aside */
    await page.goto('work/recto/?still'); await settle(page, 300);
    r = await rail(page);
    expect(r).toMatchObject({ on: true, drawn: true, bar: 'none', gutter: 0 });
    expect(r.labels[0]).toBe('Recto');
    expect(r.labels.length).toBeGreaterThanOrEqual(3);
    await expect(page.locator('#main .toc')).toBeHidden();
  });

  test('every route has the rail and no native bar', async ({ page }) => {
    for (const path of ['', 'work/', 'record/', 'about/', 'work/recto/', 'work/english-prep/', 'work/eat-map/', 'record/2026/', 'lab/postcard/']) {
      await page.goto(path + '?still'); await settle(page, 200);
      const r = await rail(page);
      expect(r, `/${path}`).toMatchObject({ on: true, bar: 'none', gutter: 0 });
      expect(r.drawn !== r.plain, `/${path}: the ladder or the plain variant, exactly one`).toBe(true);
      expect(r.over, `/${path}`).toBeLessThanOrEqual(0);
    }
    /* a page that does not scroll has nothing to show, and still no native bar */
    await page.goto('nope/?still'); await settle(page, 200);
    expect(await rail(page)).toMatchObject({ on: true, bar: 'none', gutter: 0 });
  });

  test('the plain variant: a thumb that follows the page, a drag that scrubs it, Escape puts it back', async ({ page }) => {
    await page.goto('?still'); await settle(page, 300);
    expect(await rail(page)).toMatchObject({ drawn: false, plain: true });
    const geo = () => page.evaluate(() => {
      const t = document.querySelector('.rail-plain .rail-track')!.getBoundingClientRect(), h = document.querySelector('.rail-plain .rail-thumb')!.getBoundingClientRect();
      return { tTop: t.top, tBot: t.bottom, top: h.top, bot: h.bottom, x: (h.left + h.right) / 2, y: scrollY, max: document.documentElement.scrollHeight - innerHeight };
    });
    let g = await geo();
    expect(g.top).toBeCloseTo(g.tTop, 0);
    expect(g.bot - g.top, 'the thumb is the share in view').toBeGreaterThanOrEqual(24);
    /* the wheel over the column scrolls the page natively, and the thumb follows */
    await page.mouse.move(1440 - 14, (g.tTop + g.tBot) / 2);
    for (let i = 0; i < 3 && (await page.evaluate(() => scrollY)) < 200; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(400); }
    await page.keyboard.press('End'); await page.waitForTimeout(600);
    g = await geo();
    expect(g.bot).toBeCloseTo(g.tBot, 0);
    /* drag the thumb back up to the top; Escape restores where the drag began */
    await page.mouse.move(g.x, (g.top + g.bot) / 2);
    await page.mouse.down();
    await page.mouse.move(g.x, g.tTop - 40, { steps: 8 });
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(g.max, -1);
    await page.mouse.up();
    /* a press on the track goes there */
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.click(g.x, g.tTop + 2);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(g.max * 0.25);
  });

  test('the bar never moves between pages', async ({ page }) => {
    const at: Record<string, number[]> = {};
    for (const path of ['', 'work/', 'record/', 'about/', 'work/recto/', 'record/2026/', 'nope/']) {
      await page.goto(path + '?still'); await settle(page, 200);
      at['/' + path] = await page.evaluate(() => [document.documentElement.clientWidth, ...['.mark', '.tabs', '.bar-end a[rel="me"]'].map((q) => Math.round(document.querySelector(q)!.getBoundingClientRect().left))]);
    }
    expect(new Set(Object.values(at).map((v) => v.join(','))).size, JSON.stringify(at)).toBe(1);
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

  test('with sections the thumb drags the same way; Escape puts the page back', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    const g = await page.evaluate(() => {
      const t = document.querySelector('nav.rail .rail-track')!.getBoundingClientRect(), h = document.querySelector('nav.rail .rail-thumb')!.getBoundingClientRect();
      return { x: (t.left + t.right) / 2, tTop: t.top, tBot: t.bottom, mid: (h.top + h.bottom) / 2, max: document.documentElement.scrollHeight - innerHeight };
    });
    const sec = () => page.evaluate(() => [...document.querySelectorAll('.rail-i')].findIndex((a) => a.getAttribute('aria-current') === 'location'));
    await page.mouse.move(g.x, g.mid);
    await page.mouse.down();
    await page.mouse.move(g.x, g.tBot + 40, { steps: 8 });
    await page.waitForTimeout(120);
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(g.max, -1);
    expect(await sec()).toBe(3);
    await expect(page.locator('.rail')).toHaveClass(/is-drag/);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.mouse.up();
    expect(await sec()).toBe(0);
    /* a press on the track between the titles goes there */
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.click(g.x, g.tBot - 2);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(g.max * 0.75);
  });
});

/* One bar (ADR-0013 amendment, 2026-10-10: "One is a line, another is a ladder?"): the track and thumb have
   the same size, place and look on a page with sections, a page without them and in the sheet, on desktop
   and on a phone; sections only add marks on that track. */
const bar = (page: Page, sel: string, box: string) => page.evaluate(([sel, box]) => {
  const t = document.querySelector<HTMLElement>(sel + ' .rail-track')!, h = t.querySelector<HTMLElement>('.rail-thumb')!;
  const r = t.getBoundingClientRect(), c = box ? document.querySelector(box)!.getBoundingClientRect() : { right: document.documentElement.clientWidth, top: 0, bottom: innerHeight };
  const cs = getComputedStyle(t), hs = getComputedStyle(h);
  return { w: r.width, h: Math.round(r.height), right: Math.round(c.right - r.right), mid: Math.round((r.top + r.bottom) / 2 - (c.top + c.bottom) / 2),
    track: cs.backgroundColor, thumbW: h.getBoundingClientRect().width, radius: hs.borderRadius, marks: t.querySelectorAll('.rail-m').length };
}, [sel, box] as const);
for (const [size, opts] of [['desktop', desktop], ['phone', phone]] as const) {
  test(`one bar (${size}): the same track and thumb with sections, without them and in the sheet or project page`, async ({ browser }) => {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto('about/?still'); await settle(page, 300);
    const secs = await bar(page, 'nav.rail:not(.in-sheet)', '');
    await page.goto('?still'); await settle(page, 300);
    const flat = await bar(page, '.rail-plain:not(.in-sheet)', '');
    /* the sheet on desktop; a phone opens the project as its own page */
    let inSheet;
    if (size === 'phone') {
      await page.goto('work/recto/?still'); await settle(page, 300);
      inSheet = await bar(page, 'nav.rail:not(.in-sheet)', '');
    } else {
      await page.goto('work/?still'); await settle(page, 300);
      await page.click('#main a[data-p="recto"]');
      await expect(page.locator('dialog .rail.in-sheet .rail-track')).toBeVisible();
      await settle(page, 600);
      inSheet = await bar(page, 'dialog .rail.in-sheet', 'dialog .sheet');
    }
    expect(secs.marks, 'sections add marks').toBeGreaterThanOrEqual(3);
    expect(flat.marks, 'no sections, no marks').toBe(0);
    for (const r of [secs, flat, inSheet]) {
      expect(r).toMatchObject({ w: 2, right: 6, track: flat.track, thumbW: 2, radius: flat.radius });
      expect(Math.abs(r.mid), 'mid-height').toBeLessThanOrEqual(1);
    }
    expect(secs.h).toBe(flat.h);
    expect(secs.h).toBe(Math.round(Math.min(opts.viewport.height * 0.44, 320)));
    await ctx.close();
  });
}

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

/* The project sheet has its own rail, bound to its scroller; its sections are the rungs and its own
   contents list steps aside (ADR-0013 item 3); no native bar inside it. */
test.describe('the sheet', () => {
  test.use(desktop);
  test('its own ladder: the sheet\'s sections, its scroller, its wheel', async ({ page }) => {
    await page.goto('work/?still'); await settle(page, 300);
    await page.click('#main a[data-p="english-prep"]');
    await expect(page.locator('dialog .rail.in-sheet')).toBeVisible();
    await settle(page, 600);
    const r = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>('dialog .rail.in-sheet')!, sc = document.getElementById('sheet-scroll')!;
      const page = document.querySelector<HTMLElement>('nav.rail:not(.in-sheet)');
      return {
        labels: [...nav.querySelectorAll('.rail-t')].map((t) => t.textContent),
        bar: getComputedStyle(sc).scrollbarWidth, gutter: sc.offsetWidth - sc.clientWidth,
        toc: getComputedStyle(document.querySelector('dialog .toc')!).display,
        inSheet: document.getElementById('sheet')!.contains(nav),
        pageRail: page ? getComputedStyle(page).visibility : 'none',
      };
    });
    expect(r.labels[0]).toBe('English Prep');
    expect(r.labels).toContain('What it is');
    expect(r).toMatchObject({ bar: 'none', gutter: 0, toc: 'none', inSheet: true, pageRail: 'hidden' });
    /* reading down the sheet moves the ladder; the wheel over the ladder scrolls the sheet */
    const box = (await page.locator('dialog .rail.in-sheet').boundingBox())!;
    await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => document.getElementById('sheet-scroll')!.scrollTop)).toBeGreaterThan(300);
    await page.evaluate(() => { const s = document.getElementById('sheet-scroll')!; s.scrollTo(0, s.scrollHeight); });
    await expect(page.locator('dialog .rail-i').last()).toHaveAttribute('aria-current', 'location');
    /* a click on a rung goes to that section inside the sheet */
    await page.evaluate(() => document.getElementById('sheet-scroll')!.scrollTo(0, 0));
    await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2); await page.waitForTimeout(400);
    await page.locator('dialog .rail-i').nth(1).click();
    await expect.poll(() => page.evaluate(() => {
      const a = document.querySelectorAll<HTMLAnchorElement>('dialog .rail-i')[1], t = document.getElementById(a.hash.slice(1))!;
      return Math.round(t.getBoundingClientRect().top - document.getElementById('sheet-scroll')!.getBoundingClientRect().top);
    }), { timeout: 4000 }).toBeLessThan(140);
    /* closing the sheet takes its rail away and gives the page its own back */
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog .rail')).toHaveCount(0);
    await expect(page.locator('nav.rail:not(.in-sheet)')).toBeVisible();
  });
  test('touch: the sheet has the slim ladder', async ({ browser }) => {
    const ctx = await browser.newContext(tablet);
    const page = await ctx.newPage();
    await page.goto('work/?still'); await settle(page, 300);
    await page.tap('#main a[data-p="recto"]');
    await expect(page.locator('dialog .rail.in-sheet .rail-btn')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('sheet-scroll')!).scrollbarWidth)).toBe('none');
    await page.tap('dialog .rail-btn');
    await expect(page.locator('dialog .rail-sheet')).toBeVisible();
    await ctx.close();
  });
});

/* Istanbul and its time (brief, 2026-10-10): "Istanbul HH:MM" in Istanbul's own time, written before first
   paint so nothing shifts; without JavaScript only the place; hidden on phones. */
test.describe('the Istanbul clock', () => {
  const istanbul = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Istanbul' }).format(new Date());
  test('desktop: "Istanbul HH:MM" before GitHub, tabular, in Istanbul time', async ({ browser }) => {
    /* a browser in another time zone still shows Istanbul's time */
    const ctx = await browser.newContext({ ...desktop, timezoneId: 'America/Los_Angeles' });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      (window as any).__clock = [] as string[];
      new MutationObserver(() => { const t = document.querySelector('.clock time'); if (t?.textContent) (window as any).__clock.push(t.textContent); }).observe(document, { childList: true, subtree: true, characterData: true });
    });
    const before = istanbul();
    await page.goto('?still'); await settle(page, 200);
    const c = await page.evaluate(() => {
      const p = document.querySelector<HTMLElement>('.bar-end .clock')!, t = p.querySelector('time')!;
      const gh = document.querySelector('.bar-end a[rel="me"]')!;
      return { seen: [...p.childNodes].filter((n) => !(n instanceof Element && n.classList.contains('vh'))).map((n) => n.textContent).join('').trim(), time: t.textContent, dt: t.dateTime, num: getComputedStyle(t).fontVariantNumeric,
        before: !!(p.compareDocumentPosition(gh) & Node.DOCUMENT_POSITION_FOLLOWING), early: (window as any).__clock as string[], r: Math.round(p.getBoundingClientRect().right), g: Math.round(gh.getBoundingClientRect().left) };
    });
    expect(c.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect([before, istanbul()]).toContain(c.time);
    expect(c.seen).toBe(`Istanbul ${c.time}`);
    expect(c.dt).toBe(c.time);
    expect(c.num).toContain('tabular-nums');
    expect(c.before && c.r < c.g, 'the clock sits before GitHub').toBe(true);
    /* written by the bar itself as it is parsed: no placeholder value ever reaches the screen */
    expect(c.early.every((v) => v === c.time || v === istanbul())).toBe(true);
    await ctx.close();
  });
  test('no JavaScript: just "Istanbul"; phones: hidden', async ({ browser }) => {
    const ctx = await browser.newContext({ ...desktop, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('');
    expect(await page.locator('.bar-end .clock').evaluate((p) => [...p.childNodes].filter((n) => !(n instanceof Element && n.classList.contains('vh')) && !(n instanceof HTMLElement && getComputedStyle(n).display === 'none')).map((n) => n.textContent).join('').trim())).toBe('Istanbul');
    await ctx.close();
    const ctx2 = await browser.newContext(phone);
    const p2 = await ctx2.newPage();
    await p2.goto('?still');
    await expect(p2.locator('.clock')).toBeHidden();
    await ctx2.close();
  });
});
