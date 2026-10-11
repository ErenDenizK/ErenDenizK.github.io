/* The type system holds (ADR-0015; docs/research/2026-10-type-and-screens.md). Two checks:
   - in the source, no stylesheet sets a font size in pixels outside the token block of global.css; the
     objects that scale with their own box (the ID card, postcards, photo studies) are outside the system;
   - on every route, at a wide and a phone size, every rendered text size is one of the scale's tokens as
     the browser resolves them at that size. Words fitted to their column (Home's name and big words on narrow windows, a wordmark sized to
     its measure) and a product's own face in its embassy are the documented exceptions. */
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { settle, PROJECTS } from './helpers';

/* objects sized by their own box, and the lab page's own styles (an unlinked study, left to its author) */
const EXEMPT_FILES = /(Postcard|IdCard)\.astro$|components[\\/]photo[\\/]|pages[\\/]lab[\\/]|home-b\.css$/;
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]);
}

test('no stylesheet sets a pixel font size outside the tokens', () => {
  const bad: string[] = [];
  for (const f of files('src').filter((f) => /\.(css|astro)$/.test(f) && !EXEMPT_FILES.test(f))) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (/^\s*--[\w-]+:/.test(line) || /--t-[\w-]+:/.test(line)) return;   /* a token's own definition */
      const m = line.match(/font(-size)?\s*:[^;}]*?\b\d+(\.\d+)?px/);
      if (m && !/calc\(\(100(cqi|vw)/.test(line)) bad.push(`${f}:${i + 1}: ${line.trim().slice(0, 90)}`);
    });
  }
  expect(bad).toEqual([]);
});

const ROUTES = ['', 'work/', 'about/', 'record/', 'record/2026/sample-essay-agents/', 'record/2026/sample-note-quiz/', `work/${PROJECTS[0]}/`, 'nope/'];
const SIZES = [
  ['1440', { viewport: { width: 1440, height: 900 } }],
  ['390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
] as const;

for (const [label, opts] of SIZES) {
  test.describe(`at ${label}`, () => {
    test.use(opts);
    test('every rendered text size is a step of the scale', async ({ page }) => {
      const off: string[] = [];
      let all = new Set<number>();
      for (const r of ROUTES) {
        await page.goto(r + '?still'); await settle(page, 300);
        const res = await page.evaluate(() => {
          const TOKENS = ['--t-micro', '--t-meta', '--t-ui', '--t-tab', '--t-body', '--t-read', '--t-2', '--t-3', '--t-4', '--t-5', '--t-6', '--t-7', '--t-9', '--t-10'];
          const probe = document.createElement('span'); document.body.append(probe);
          const scale = new Set(TOKENS.map((t) => { probe.style.fontSize = `var(${t})`; return Math.round(parseFloat(getComputedStyle(probe).fontSize) * 10) / 10; }));
          probe.remove();
          const skip = '.pc, .idc, .wm, .ha-word, .emb-promise, .sample, .vh, script, style, svg, noscript, .ph-study';
          const seen = new Set<number>(); const bad: string[] = [];
          for (const el of document.querySelectorAll('body *')) {
            if (el.closest(skip) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue!.trim())) continue;
            const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
            const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10;
            seen.add(px);
            if (!scale.has(px)) bad.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className || ''} ${px}px`);
          }
          return { seen: [...seen], bad: [...new Set(bad)].slice(0, 6) };
        });
        res.seen.forEach((s) => all.add(s));
        off.push(...res.bad.map((b) => `/${r}: ${b}`));
      }
      expect(off).toEqual([]);
      /* the whole site at one window size uses at most these many sizes (27 before the system) */
      expect(all.size).toBeLessThanOrEqual(14);
    });
  });
}

/* The two edges (ADR-0015 item 3): at 1440 the bar's mark, every page's opening and the reading column
   start on E0 and E1 on every page. Measured from the text's first line box, not from a box's padding. */
test.describe('edges at 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('the mark, the openings and the reading column share E0 and E1', async ({ page }) => {
    const x = (sel: string) => page.evaluate((s) => {
      const el = document.querySelector(s); if (!el) return null;
      const r = document.createRange(); r.selectNodeContents(el);
      return Math.round(r.getClientRects()[0].left);
    }, sel);
    const cases: [string, string, number][] = [
      ['', '.ha-meta', 60], ['work/', '.vhead .meta', 60], ['about/', '.ab-intro .meta', 60], ['record/', '.rec-title', 60],
      ['about/', '.ch-body p', 316], ['record/', '.spine .e-main', 316], ['record/2026/sample-essay-agents/', '.post-head .meta', 316],
      ['record/2026/sample-essay-agents/', '.post-toc .post-back', 60],
    ];
    for (const [r, sel, want] of cases) {
      await page.goto(r + '?still'); await settle(page, 200);
      const mark = await x('.mark');
      expect(Math.abs((mark ?? 0) - 60), `/${r} mark`).toBeLessThanOrEqual(2);
      expect(Math.abs((await x(sel) ?? 0) - want), `/${r} ${sel}`).toBeLessThanOrEqual(3);
    }
  });
});

/* The bar fits at 320 and 360: the mark on one line, the tabs inside the right edge. */
for (const w of [320, 360]) {
  test.describe(`bar at ${w}`, () => {
    test.use({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true });
    test('the mark stays on one line and the tabs stay inside E0', async ({ page }) => {
      await page.goto('work/?still'); await settle(page, 200);
      const m = await page.evaluate(() => {
        /* the dot sits on the letters' line, not under them */
        const mk = document.querySelector('.mark')!; const txt = [...mk.childNodes].find((n) => n.nodeType === 3 && n.nodeValue!.trim())!;
        const r = document.createRange(); r.selectNodeContents(txt); const t = r.getClientRects()[0];
        const d = mk.querySelector('.dot')!.getBoundingClientRect();
        const lines = d.top >= t.top - 1 && d.bottom <= t.bottom + 1 ? 1 : 2;
        const gut = parseFloat(getComputedStyle(document.querySelector('.bar')!).paddingRight);
        return { lines, right: document.querySelector('.tabs')!.getBoundingClientRect().right, edge: innerWidth - gut };
      });
      expect(m.lines).toBe(1);
      expect(m.right).toBeLessThanOrEqual(m.edge + 0.5);
    });
  });
}
