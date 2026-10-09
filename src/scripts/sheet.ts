/* The project focus view on wide screens (UX research §2; prototype F's sheet, prototypes/f/SPEC.md).
   Every project is a page, /work/<slug>/. With JavaScript and at least 900 px, a project link on Work
   or Home opens that page's article in a sheet over the current page instead: the URL becomes the
   project's (pushState), Back closes it, a reload shows the project page. Phones always go to the page.
   State machine: closed -> opening -> open -> closing, every phase interruptible and generation-guarded;
   the URL is the source of truth (popstate renders it). */
import { root, mq, reduce, rel, base } from './env';
import { api as Media, initMedia } from './media';

type St = { sheet?: 1; base?: string; k?: number };
const isProject = (path: string) => /^work\/[^/]+$/.test(rel(path));
const slugOf = (path: string) => rel(path).split('/')[1];
const pageBase = location.pathname;            // the page the sheet sits on (Home or Work)
const pageRel = rel(pageBase);
const enabled = pageRel === '' || pageRel === 'work';

const cache = new Map<string, Promise<HTMLElement | null>>();
function load(href: string): Promise<HTMLElement | null> {
  const u = new URL(href, location.href).pathname;
  if (!cache.has(u)) {
    cache.set(u, fetch(u, { credentials: 'same-origin' }).then((r) => (r.ok ? r.text() : null)).then((t) => {
      if (!t) return null;
      const doc = new DOMParser().parseFromString(t, 'text/html');
      return doc.querySelector('article.case') as HTMLElement | null;
    }).catch(() => { cache.delete(u); return null; }));
  }
  return cache.get(u)!;
}
const resolved = new Map<string, HTMLElement | null>();
function prefetch(href: string) { const u = new URL(href, location.href).pathname; load(u).then((a) => resolved.set(u, a)); }

export function initSheet() {
  if (!enabled || !('showModal' in HTMLDialogElement.prototype)) return;
  /* every link that opens a project: Home's showcase and strip, the way in of each Work section */
  const projectLinks = () => [...document.querySelectorAll<HTMLAnchorElement>('a.p-open[data-p]')];

  /* ---- the dialog, built once ---- */
  const dlg = document.createElement('dialog');
  dlg.className = 'focus'; dlg.id = 'focus'; dlg.setAttribute('aria-labelledby', 'focus-title');
  dlg.innerHTML = `<div class="backlight" aria-hidden="true"></div><div class="sheet" id="sheet"><div class="sheet-scroll" id="sheet-scroll">
    <div class="sheet-bar"><p class="crumb meta"><span class="crumb-w">Work · </span><b id="crumb-n"></b></p>
    <button class="icon-btn close" type="button" aria-label="Close"></button></div><div class="case-slot"></div></div></div>`;
  const closeIcon = document.querySelector('template#tpl-close');
  dlg.querySelector('.close')!.append((closeIcon as HTMLTemplateElement | null)?.content.cloneNode(true) ?? document.createTextNode('Close'));
  document.body.appendChild(dlg);
  const sheetEl = dlg.querySelector<HTMLElement>('.sheet')!;
  const backlight = dlg.querySelector<HTMLElement>('.backlight')!;
  const scroller = dlg.querySelector<HTMLElement>('.sheet-scroll')!;
  const slot = dlg.querySelector<HTMLElement>('.case-slot')!;

  const S = { key: null as string | null, phase: 'closed', gen: 0, anims: [] as Animation[], vt: null as any, openedAt: 0, ourCloses: 0 };
  (window as any).__sheet = S;
  let keySeq = Date.now();
  let pendingBack = false, pendingBackT = 0;
  let queued: (() => void) | null = null;

  function fill(article: HTMLElement) {
    const c = article.cloneNode(true) as HTMLElement;
    /* the page's title is an h1; inside the sheet it is the dialog's heading, an h2 */
    const h1 = c.querySelector('h1.case-title');
    if (h1) { const h2 = document.createElement('h2'); for (const a of h1.getAttributeNames()) h2.setAttribute(a, h1.getAttribute(a)!); h2.innerHTML = h1.innerHTML; h1.replaceWith(h2); }
    slot.replaceChildren(c);
    for (const p of ['--p', '--p2', '--p3', '--pg']) { const v = c.style.getPropertyValue(p).trim(); if (v) dlg.style.setProperty(p, v); else dlg.style.removeProperty(p); }
    dlg.querySelector('#crumb-n')!.textContent = `${c.dataset.index} of ${c.dataset.total}`;
    initMedia(c);
    Media.refresh();
    scroller.scrollTop = 0;
    return c;
  }
  function stopMotion() {
    if (S.vt) { try { S.vt.skipTransition(); } catch {} S.vt = null; }
    S.anims.forEach((a) => { try { a.cancel(); } catch {} });
    S.anims = [];
  }
  function now() {
    const cs = getComputedStyle(sheetEl);
    return { opacity: +cs.opacity, transform: cs.transform === 'none' ? 'none' : cs.transform, back: +getComputedStyle(backlight).opacity };
  }

  async function open(slug: string, o: { how: 'push' | 'pop' | 'step'; src?: Element | null }) {
    const g = ++S.gen;
    const wasPhase = S.phase;
    const from = S.phase === 'closed' ? null : now();
    stopMotion();
    S.key = slug;
    S.phase = 'opening';
    const href = base + 'work/' + slug + '/';
    let article = resolved.get(href);
    if (article === undefined) article = await load(href);
    if (g !== S.gen) return;                        // closed or replaced while loading
    if (!article) { location.assign(href); return; } // no article: the page itself
    const c = fill(article);
    const h = c.querySelector<HTMLElement>('.case-title')!;
    const useVT = typeof (document as any).startViewTransition === 'function' && !reduce() && o.how === 'push' && wasPhase === 'closed' && o.src && (o.src as HTMLElement).getBoundingClientRect().width > 0;
    const show = () => {
      if (!dlg.open) dlg.showModal();
      scroller.scrollTop = 0;
      root.classList.add('sheet-open');
      h.focus({ preventScroll: true });
    };
    S.openedAt = performance.now();
    const opened = () => { if (g !== S.gen) return; S.phase = 'open'; S.anims = []; const m = c.querySelector('.media'); if (m) Media.arrive(m as HTMLElement); };
    for (const a of [c.querySelector<HTMLAnchorElement>('[rel="prev"]'), c.querySelector<HTMLAnchorElement>('[rel="next"]')]) if (a) prefetch(a.href);
    if (useVT) {
      const src = o.src as HTMLElement;
      src.style.viewTransitionName = 'ptitle';
      root.classList.add('vt-sheet');
      const vt = S.vt = (document as any).startViewTransition(() => {
        src.style.viewTransitionName = '';
        if (g !== S.gen) return;
        h.style.viewTransitionName = 'ptitle';
        sheetEl.style.viewTransitionName = 'sheet';
        show();
      });
      const clear = () => { h.style.viewTransitionName = ''; sheetEl.style.viewTransitionName = ''; src.style.viewTransitionName = ''; root.classList.remove('vt-sheet'); if (S.vt === vt) S.vt = null; };
      vt.finished.then(() => { clear(); opened(); }, () => { clear(); opened(); });
      return;
    }
    show();
    let start = from || { opacity: 0, transform: 'translateY(24px)', back: 0 };
    if (reduce()) start = { opacity: from ? from.opacity : 0, transform: 'none', back: from ? from.back : 0 };
    const d = reduce() ? 150 : 480;
    const a1 = sheetEl.animate([{ opacity: start.opacity, transform: start.transform }, { opacity: 1, transform: 'none' }], { duration: d, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
    const a2 = backlight.animate([{ opacity: start.back }, { opacity: 1 }], { duration: d, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
    S.anims = [a1, a2];
    a1.onfinish = opened;
    /* state never waits on a stalled frame */
    setTimeout(() => { if (g === S.gen && S.phase === 'opening') { S.anims.forEach((a) => { try { a.finish(); } catch {} }); opened(); } }, d + 500);
  }

  function close(o: { instant?: boolean } = {}) {
    if (!S.key && S.phase === 'closed') return;
    const g = ++S.gen;
    const key = S.key;
    const from = dlg.open ? now() : null;
    stopMotion();
    S.key = null;
    S.phase = 'closing';
    const done = () => {
      if (g !== S.gen || S.phase !== 'closing') return;
      S.anims.forEach((a) => { try { a.cancel(); } catch {} });
      S.anims = [];
      S.phase = 'closed';
      if (dlg.open) { S.ourCloses++; dlg.close(); }
      root.classList.remove('sheet-open');
      slot.querySelectorAll('video').forEach((v) => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch {} });
      Media.refresh();                             // the page's own objects may move again
      const target = key && document.querySelector<HTMLElement>(`#main [data-p="${key}"]`);
      const ae = document.activeElement;
      if (target && (!ae || ae === document.body || dlg.contains(ae))) target.focus({ preventScroll: true });
    };
    if (!from || o.instant) { done(); return; }
    const d = reduce() ? 150 : 320;
    const b1 = sheetEl.animate([{ opacity: from.opacity, transform: from.transform }, { opacity: 0, transform: reduce() ? 'none' : 'translateY(16px)' }], { duration: d, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    const b2 = backlight.animate([{ opacity: from.back }, { opacity: 0 }], { duration: d, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    S.anims = [b1, b2];
    b1.onfinish = done;
    setTimeout(done, d + 500);
  }

  async function stepTo(slug: string) {
    if (!S.key || slug === S.key) return;
    const g = ++S.gen;
    S.key = slug;
    const href = base + 'work/' + slug + '/';
    history.replaceState({ ...(history.state || {}), sheet: 1 }, '', href);
    document.title = titleFor(slug);
    let article = resolved.get(href);
    if (article === undefined) article = await load(href);
    if (g !== S.gen) return;
    if (!article) { location.assign(href); return; }
    const c = fill(article);
    S.phase = 'open';
    if (!reduce()) c.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
    c.querySelector<HTMLElement>('.case-title')!.focus({ preventScroll: true });
    for (const a of [c.querySelector<HTMLAnchorElement>('[rel="prev"]'), c.querySelector<HTMLAnchorElement>('[rel="next"]')]) if (a) prefetch(a.href);
  }

  const baseTitle = document.title;
  const siteName = baseTitle.includes(' · ') ? baseTitle.split(' · ').pop()! : baseTitle;
  function titleFor(slug: string) {
    const a = resolved.get(base + 'work/' + slug + '/');
    const link = document.querySelector<HTMLElement>(`[data-p="${slug}"]`);
    const named = link?.dataset.ptitle ? document.getElementById(link.dataset.ptitle) : link?.querySelector('.t-title');
    const t = a?.dataset.title || named?.textContent || slug;
    return `${t} · ${siteName}`;
  }

  /* Every way of closing asks here. History stays truthful: a sheet we pushed closes by going back
     to the entry under it. */
  function requestClose() {
    if (!S.key) return;
    const st: St = history.state || {};
    close();
    document.title = baseTitle;
    if (st.sheet) {
      pendingBack = true;
      clearTimeout(pendingBackT);
      pendingBackT = window.setTimeout(() => { pendingBack = false; flush(); }, 800);
      history.back();
    } else {
      history.replaceState({ k: st.k || ++keySeq }, '', pageBase);
    }
  }
  function flush() { if (queued) { const q = queued; queued = null; q(); } }

  /* The URL decides what is on screen. */
  function render(how: 'pop') {
    const path = location.pathname;
    const st: St = history.state || {};
    if (isProject(path) && st.sheet) {
      const slug = slugOf(path);
      document.title = titleFor(slug);
      if (S.key !== slug) open(slug, { how });
    } else if (rel(path) === pageRel) {
      document.title = baseTitle;
      if (S.key || S.phase !== 'closed') close();
    }
  }
  addEventListener('popstate', () => {
    pendingBack = false; clearTimeout(pendingBackT);
    render('pop');
    flush();
  });
  /* bfcache: the page comes back exactly as it was left; make sure it still matches the URL */
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const want = isProject(location.pathname) && (history.state || {}).sheet ? slugOf(location.pathname) : null;
    if (want !== S.key) { if (want) open(want, { how: 'pop' }); else close({ instant: true }); }
  });

  function go(a: HTMLAnchorElement) {
    const slug = slugOf(new URL(a.href).pathname);
    if (pendingBack) { queued = () => go(a); return; }
    if (S.key === slug) return;
    history.pushState({ sheet: 1, base: pageBase, k: ++keySeq } as St, '', a.href);
    document.title = titleFor(slug);
    /* the title that morphs into the sheet's: inside the link, or named by data-ptitle (Home's showcase button) */
    const src = a.dataset.ptitle ? document.getElementById(a.dataset.ptitle) : a.querySelector('.t-title');
    open(slug, { how: 'push', src });
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !mq.wide.matches) return;
    const a = (e.target as Element).closest?.('a') as HTMLAnchorElement | null;
    if (!a) return;
    if (a.matches('a.p-open[data-p]') && !dlg.contains(a)) { e.preventDefault(); go(a); return; }
    if (dlg.contains(a)) {
      if (a.matches('.case-next a[data-go]')) { e.preventDefault(); stepTo(a.dataset.go!); return; }
      const h = a.getAttribute('href') || '';
      if (h.startsWith('#')) { e.preventDefault(); slot.querySelector(h)?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); return; }
    }
  });
  for (const a of projectLinks()) {
    a.addEventListener('pointerenter', () => prefetch(a.href));
    a.addEventListener('focus', () => prefetch(a.href));
  }
  if (mq.wide.matches) (window as any).requestIdleCallback?.(() => projectLinks().forEach((a) => prefetch(a.href)));

  dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });
  dlg.addEventListener('close', () => {
    if (S.ourCloses > 0) { S.ourCloses--; return; }
    if (dlg.open || !S.key) return;
    requestClose();
  });
  document.addEventListener('keydown', (e) => {
    if (!S.key) return;
    if (e.key === 'Escape') { e.preventDefault(); requestClose(); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.altKey && !e.metaKey && !e.ctrlKey) {
      const a = slot.querySelector<HTMLAnchorElement>(e.key === 'ArrowRight' ? '[rel="next"]' : '[rel="prev"]');
      if (a) { e.preventDefault(); stepTo(a.dataset.go!); }
    }
  }, true);

  /* Backdrop: press and release outside the sheet, and not the second half of the opening double click. */
  let downOnBack = false;
  /* "outside the sheet": the backdrop, or, while the opening transition still holds the page, the root
     (its overlay lets pointer events through to the document, prototype F bug B4) */
  const outside = (t: EventTarget | null) => !!S.key && (t === dlg || t === backlight || t === root || t === document.body);
  document.addEventListener('pointerdown', (e) => {
    downOnBack = outside(e.target);
    if (downOnBack && S.vt) { try { S.vt.skipTransition(); } catch {} }
  }, true);
  /* The bar stays visible above the sheet and keeps working: a press on a tab, the mark or GitHub goes
     there (the page under a modal dialog is inert, so the dialog routes it). */
  function barLinkAt(x: number, y: number) {
    for (const l of document.querySelectorAll<HTMLAnchorElement>('.bar a')) {
      const r = l.getBoundingClientRect();
      if (r.width && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return l;
    }
    return null;
  }
  let proxied: HTMLAnchorElement | null = null;
  const clearProxy = () => { proxied?.classList.remove('hover-proxy'); proxied = null; dlg.classList.remove('proxy-hover'); };
  dlg.addEventListener('pointermove', (e) => {
    const a = outside(e.target) ? barLinkAt(e.clientX, e.clientY) : null;
    if (a === proxied) return;
    proxied?.classList.remove('hover-proxy');
    proxied = a;
    a?.classList.add('hover-proxy');
    dlg.classList.toggle('proxy-hover', !!a);
  });
  document.addEventListener('click', (e) => {
    if (!outside(e.target) || !downOnBack) return;
    const a = barLinkAt(e.clientX, e.clientY);
    if (a) {
      clearProxy();
      if (new URL(a.href).pathname === pageBase) requestClose();   // the page under the sheet: just close
      else location.assign(a.href);
      return;
    }
    if (performance.now() - S.openedAt < 400) return;
    requestClose();
  });
  dlg.querySelector('.close')!.addEventListener('click', requestClose);

  /* the table of contents follows the reading position */
  scroller.addEventListener('scroll', () => {
    const c = slot.firstElementChild;
    if (!c) return;
    const secs = c.querySelectorAll('.case-sec'), links = c.querySelectorAll('.toc a');
    const top = scroller.getBoundingClientRect().top + 140;
    let on = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < top) on = i; });
    links.forEach((b, i) => b.classList.toggle('on', i === on));
  }, { passive: true });
}
