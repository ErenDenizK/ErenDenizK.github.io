/* Nothing is squeezed, cut off, stacked or blown up, on every route at the widths people use (site audit
   2026-10-11). Twice the owner found on an iPhone a sentence set one word per line in a narrow grid column:
   a grid written for wide screens whose phone rule did not re-place every child, so text landed in the
   marker or icon column. This sweep reads the rendered page instead of the CSS, so any rule that causes it
   fails here. At each width, on each route (and in the project sheet opened from Home and from Work):
   - a block with four or more words that wraps is at least 120 px wide (35 % of the viewport on a
     phone); a short label on one line is narrow by design, not squeezed;
   - nothing scrolls sideways, and no text is cut off at the viewport's edge outside a scroller of its own;
   - no line of text overlaps a line of another element;
   - no image or video is drawn larger than its natural pixels allow at the device pixel ratio.
   Each page is scrolled through first so lazy content renders. ?still keeps the frames deterministic;
   motion never changes layout. */
import { test, expect, type Page } from '@playwright/test';
import { settle, fixture, PROJECTS, FIXTURE_ENTRIES } from './helpers';

/* The two-page site (ADR-0019). The record's rows and entry pages are swept on the fixture build (every
   kind and shape, whatever content/log holds), and its index and Recto's page there too, so their lists
   have rows. */
const ROUTES = ['', ...PROJECTS.map((p) => `work/${p}/`), 'record/', 'nope/',
  ...['record/', 'record/2026/', 'work/recto/', ...FIXTURE_ENTRIES.map((e) => `record/2026/${e}/`)].map(fixture)];

/* A stretch up to 15 % is not visible at 3x (a 780 px phone capture drawn 292 css px wide on a 430 phone).
   KNOWN_SOFT are masters captured at 1x: no markup can add pixels they do not have. TODO(captures):
   recapture English Prep's signature clip at 2x, as Recto's is, then empty this list. */
const STRETCH = 1.15;
const KNOWN_SOFT = ['english-prep-signature-390x844@1x', 'english-prep-signature-1440x900@1x'];

const phone = (w: number) => ({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const SIZES = [
  ['320', phone(320)], ['360', phone(360)], ['390', phone(390)], ['430', phone(430)],
  ['768', { viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 2 }],
  ['1180', { viewport: { width: 1180, height: 820 }, hasTouch: true, deviceScaleFactor: 2 }],
] as const;

/** Scroll the page (or the open sheet) to the end in steps, wait for images, come back to the top. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const dlg = document.getElementById('focus') as HTMLDialogElement | null;
    const sc: { scrollTop: number; scrollHeight: number; clientHeight: number } =
      dlg?.open ? document.getElementById('sheet-scroll')! : document.scrollingElement!;
    for (let y = 0; y < sc.scrollHeight - sc.clientHeight; y += sc.clientHeight * 0.8) { sc.scrollTop = y; await pause(60); }
    sc.scrollTop = sc.scrollHeight; await pause(150);
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 1500); })));
    sc.scrollTop = 0; await pause(100);
  });
}

/** Everything wrong with the page as rendered, one line each. */
async function audit(page: Page, phoneSize: boolean): Promise<string[]> {
  return page.evaluate(async ({ phoneSize, KNOWN_SOFT, STRETCH }) => {
    const vw = document.documentElement.clientWidth, dpr = devicePixelRatio;
    const dlg = document.getElementById('focus') as HTMLDialogElement | null;
    const scope: Element = dlg?.open ? dlg : document.body;
    const out: string[] = [];
    const name = (el: Element) => {
      const h = el as HTMLElement;
      const cls = typeof h.className === 'string' && h.className.trim() ? '.' + h.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      const parent = el.parentElement && el.parentElement !== document.body ? el.parentElement : null;
      const pc = parent && typeof parent.className === 'string' && parent.className.trim() ? parent.className.trim().split(/\s+/)[0] : parent?.tagName.toLowerCase();
      return `${pc ? pc + ' > ' : ''}${el.tagName.toLowerCase()}${h.id ? '#' + h.id : ''}${cls}`;
    };
    const seen = (el: Element) => (el as HTMLElement).checkVisibility?.({ opacityProperty: true, visibilityProperty: true } as any) ?? true;
    const srOnly = (el: Element) => { const r = el.getBoundingClientRect(); return r.width <= 2 || r.height <= 2; };
    const blockOf = (n: Node): Element | null => {
      for (let e = n.parentElement; e; e = e.parentElement) { if (!getComputedStyle(e).display.startsWith('inline') || e.tagName === 'svg') return e; }
      return null;
    };
    const words = (s: string) => s.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    /* a horizontal scroller of its own (a row of screens): its content may extend past the viewport */
    const inScroller = (el: Element) => {
      for (let e = el.parentElement; e && e !== scope.parentElement; e = e.parentElement) {
        const ox = getComputedStyle(e).overflowX; if (ox === 'auto' || ox === 'scroll') return true;
      }
      return false;
    };
    const fixedish = (el: Element) => { for (let e: Element | null = el; e; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };

    /* sideways scroll */
    const over = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth;
    if (over > 0) out.push(`the page scrolls sideways by ${over}px`);

    /* the text nodes, grouped into the block that lays them out */
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.nodeValue!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const blocks = new Map<Element, DOMRect[]>();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement!;
      if (!p || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE'].includes(p.tagName) || !seen(p) || srOnly(p)) continue;
      if (dlg && !dlg.open && dlg.contains(p)) continue;
      const b = blockOf(n); if (!b || srOnly(b)) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      const rects = [...r.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
      if (!rects.length) continue;
      if (!blocks.has(b)) blocks.set(b, []);
      blocks.get(b)!.push(...rects);
    }

    const min = phoneSize ? Math.max(120, vw * 0.35) : 120;
    for (const [b, rects] of blocks) {
      const text = (b as HTMLElement).innerText ?? b.textContent ?? '';
      const w = b.getBoundingClientRect().width;
      const lines = new Set(rects.map((x) => Math.round(x.top))).size;
      if (words(text) >= 4 && w < min && lines > 1) out.push(`squeezed: ${name(b)} is ${Math.round(w)}px wide for "${text.trim().slice(0, 40)}"`);
      if (!inScroller(b)) for (const r of rects) if (r.right > vw + 1 || r.left < -1) { out.push(`cut off: ${name(b)} runs to ${Math.round(r.left)}..${Math.round(r.right)}px ("${text.trim().slice(0, 30)}")`); break; }
    }

    /* text over text: compare lines of different blocks, neither inside the other, both in the flow */
    const list = [...blocks].filter(([b]) => !fixedish(b));
    const hits = new Set<string>();
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const [a, ra] = list[i], [b, rb] = list[j];
      if (a.contains(b) || b.contains(a)) continue;
      found: for (const x of ra) for (const y of rb) {
        const ix = Math.min(x.right, y.right) - Math.max(x.left, y.left), iy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (ix > 2 && iy > Math.min(x.height, y.height) * 0.3) { hits.add(`overlap: ${name(a)} and ${name(b)}`); break found; }
      }
    }
    out.push(...hits);

    /* images and videos drawn past their pixels */
    for (const m of scope.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video')) {
      if (!seen(m) || srOnly(m)) continue;
      if (m.classList.contains('m-shadow')) continue;   // a blurred contact shadow: no detail to lose
      if (KNOWN_SOFT.some((k) => (m.currentSrc || '').includes(k))) continue;
      /* naturalWidth of a srcset image is already divided by its density, so read the file's own pixels */
      let nw = 0, nh = 0;
      if (m instanceof HTMLVideoElement) { nw = m.videoWidth; nh = m.videoHeight; }
      else if (m.currentSrc && !m.currentSrc.endsWith('.svg')) {
        const i = new Image(); i.src = m.currentSrc;
        await i.decode().catch(() => {}); nw = i.naturalWidth; nh = i.naturalHeight;
      }
      if (!nw || !nh) continue;
      const r = m.getBoundingClientRect();
      const fit = getComputedStyle(m).objectFit;
      const s = fit === 'cover' ? Math.max(r.width / nw, r.height / nh) : fit === 'contain' || m instanceof HTMLVideoElement ? Math.min(r.width / nw, r.height / nh)
        : fit === 'none' ? 1 / dpr : Math.max(r.width / nw, r.height / nh);
      if (s * dpr > STRETCH) out.push(`upscaled: ${name(m)} ${(m as HTMLImageElement).currentSrc?.split('/').pop() || (m as HTMLVideoElement).currentSrc?.split('/').pop()} ${nw}x${nh} drawn at ${Math.round(r.width)}x${Math.round(r.height)} css px (x${dpr}, ${(s * dpr).toFixed(2)}x)`);
    }
    return out;
  }, { phoneSize, KNOWN_SOFT, STRETCH });
}

for (const [label, size] of SIZES) {
  test.describe(`${label} px`, () => {
    test.use(size);
    test(`every route lays out cleanly at ${label} px`, async ({ page }) => {
      test.setTimeout(240_000);
      const isPhone = 'isMobile' in size;
      const fails: string[] = [];
      for (const path of ROUTES) {
        await page.goto(path + '?still'); await settle(page, 250);
        await scrollThrough(page);
        for (const f of await audit(page, isPhone)) fails.push(`${label} ${path.startsWith('http') ? path : '/' + path}: ${f}`);
      }
      /* each project opened as a layer over Home (the project's own page is swept above) */
      for (const [k, slug] of PROJECTS.entries()) {
        await page.goto('?still'); await settle(page, 300);
        await page.locator(`.proj[data-k="${k}"] .btn`).click();
        await settle(page, 1700);
        for (const f of await audit(page, isPhone)) fails.push(`${label} layer ${slug} over Home: ${f}`);
      }
      expect(fails, fails.join('\n')).toEqual([]);
    });
  });
}
