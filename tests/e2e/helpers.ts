import { expect, type Page } from '@playwright/test';

export const desktop = { viewport: { width: 1440, height: 900 } };
export const tablet = { viewport: { width: 1180, height: 820 }, hasTouch: true };
export const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
export const PROJECTS = ['recto', 'english-prep', 'eat-map'];
export const TABS = { home: '', work: 'work', record: 'record', about: 'about' } as const;

/** What is on screen, read in the page. */
export async function state(page: Page) {
  return page.evaluate(() => {
    const base = document.documentElement.dataset.base || '/';
    let p = location.pathname;
    if (p.startsWith(base)) p = p.slice(base.length);
    const d = (el: Element | null) => !el ? 'null' : el === document.body ? 'body'
      : el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ((el as HTMLElement).dataset?.p ? '[' + (el as HTMLElement).dataset.p + ']' : '') + (typeof (el as HTMLElement).className === 'string' && (el as HTMLElement).className ? '.' + (el as HTMLElement).className.split(' ')[0] : '');
    const dlg = document.getElementById('focus') as HTMLDialogElement | null;
    const main = document.getElementById('main')!;
    const cs = getComputedStyle(main);
    return {
      path: p.replace(/^\/+|\/+$/g, ''),
      hash: location.hash,
      cur: (document.querySelector('.tabs a[aria-current="page"]') as HTMLElement | null)?.dataset.tab ?? null,
      open: !!dlg?.open,
      dlgCase: dlg?.open ? (dlg.querySelector('.case') as HTMLElement | null)?.dataset.case ?? null : null,
      pageCase: (main.querySelector('article.case') as HTMLElement | null)?.dataset.case ?? null,
      mainOp: +cs.opacity, mainTf: cs.transform === 'none' ? '' : cs.transform,
      h1: main.querySelector('h1')?.textContent?.trim() ?? '',
      sheetCls: document.documentElement.classList.contains('sheet-open'),
      y: Math.round(scrollY), ae: d(document.activeElement), hl: history.length,
      title: document.title,
    };
  });
}
export type State = Awaited<ReturnType<typeof state>>;

/** The invariant: what is on screen matches the URL. */
export function problems(s: State): string[] {
  const e: string[] = [];
  const parts = s.path.split('/').filter(Boolean);
  const tab = parts[0] ?? '';
  const known = ['', 'work', 'record', 'about'];
  if (parts[0] === 'work' && parts[1]) {
    const slug = parts[1];
    if (!PROJECTS.includes(slug)) { if (s.h1 !== 'Nothing here') e.push('unknown project not a 404'); return e; }
    if (s.open) { if (s.dlgCase !== slug) e.push(`sheet shows ${s.dlgCase}, URL says ${slug}`); }
    else if (s.pageCase !== slug) e.push(`neither a sheet nor the page for ${slug} (page shows ${s.pageCase})`);
    if (s.open !== s.sheetCls) e.push('html.sheet-open out of step with the dialog');
    return e;
  }
  if (!known.includes(tab) || parts.length > (tab === 'record' ? 3 : 1)) { if (s.h1 !== 'Nothing here') e.push('unknown route not a 404: ' + s.path); return e; }
  if (s.open) e.push('sheet open but URL is ' + s.path);
  if (s.sheetCls) e.push('html.sheet-open left behind');
  const want = tab === '' ? 'home' : tab;
  if (s.cur !== want) e.push(`tab indicator on ${s.cur}, URL tab ${want}`);
  if (s.mainOp < 0.99) e.push('main opacity ' + s.mainOp);
  if (s.mainTf) e.push('main stuck transform ' + s.mainTf);
  return e;
}

export async function settle(page: Page, ms = 900) {
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(ms);
}
/** The state must converge to the URL within 2.5 s (prototype F's stress rule: nothing is left wrong,
    though a slow machine may take longer to get there). */
const stateSafe = async (page: Page) => {
  for (let i = 0; ; i++) {
    try { return await state(page); } catch (e) { if (i >= 8) throw e; await page.waitForTimeout(250); }   // a navigation was in flight
  }
};
export async function check(page: Page, label: string, extra?: (s: State) => string[]) {
  let s = await stateSafe(page);
  let errs = [...problems(s), ...(extra ? extra(s) : [])];
  for (let t = 0; errs.length && t < 10; t++) {
    await page.waitForTimeout(250);
    s = await stateSafe(page);
    errs = [...problems(s), ...(extra ? extra(s) : [])];
  }
  expect(errs, `${label} @ /${s.path}${s.hash}: ${errs.join('; ')}`).toEqual([]);
  return s;
}
/** Click a tab even while a navigation is in flight (the element may be replaced under us). */
export async function tab(page: Page, t: keyof typeof TABS, opts: { tap?: boolean; noWait?: boolean } = {}) {
  const sel = `.tabs a[data-tab="${t}"]`;
  if (opts.noWait) {
    /* a click that falls into the moment a document is swapped is lost; click again, as a person would */
    for (let i = 0; i < 5; i++) {
      const ok = await page.evaluate((s) => { const a = document.querySelector(s) as HTMLElement | null; a?.click(); return !!a; }, sel).catch(() => false);
      if (ok) return;
      await page.waitForTimeout(50);
    }
    return;
  }
  /* a tab change waits for the object's droplet first (ADR-0006 item 5): wait for the new page */
  const target = await page.$eval(sel, (a) => (a as HTMLAnchorElement).href);
  const leaves = new URL(target).pathname !== new URL(page.url()).pathname;
  const nav = leaves ? page.waitForURL(target, { waitUntil: 'load' }) : Promise.resolve();
  if (opts.tap) await page.tap(sel); else await page.click(sel);
  await nav;
}
export async function open(page: Page, slug: string, how: 'click' | 'tap' = 'click') {
  const sel = `#main a[data-p="${slug}"]`;
  if (how === 'tap') await page.tap(sel); else await page.click(sel);
}
