/* The one script. Pages are complete without it (ADR-0002); it adds the moving media, the focus view
   on wide screens, entries opening in place, filters, and a few comforts. Navigation between tabs is
   the browser's own (ADR-0007). */
import { root, mq, reduce, rel } from './env';
import { initMedia } from './media';
import { initSheet } from './sheet';
import { initLog } from './log';

const fine = () => root.classList.toggle('fine', mq.fine.matches);
fine(); mq.fine.addEventListener?.('change', fine);

let leavingAt = -1e9;
let pendingNav: string | null = null;
initMedia();
initSheet();
initLog();

/* Work: the object follows the project you dwell on (150 ms hover intent), focus, or read on touch. */
const workSlot = document.querySelector<HTMLElement>('.media[data-slot="work"]');
if (workSlot) {
  const MediaStage = (window as any).MediaStage;
  const tiles = [...document.querySelectorAll<HTMLAnchorElement>('.tile[data-obj]')];
  const setProject = (t: HTMLAnchorElement) => {
    tiles.forEach((x) => x.classList.toggle('is-current', x === t));
    MediaStage.show(workSlot, t.dataset.obj!, { light: t.dataset.light });
  };
  let hoverT = 0;
  for (const t of tiles) {
    t.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(hoverT);
      hoverT = window.setTimeout(() => { setProject(t); MediaStage.play(workSlot, 'interact'); }, 150);
    });
    t.addEventListener('pointerleave', () => clearTimeout(hoverT));
    t.addEventListener('focus', () => { if (!root.classList.contains('sheet-open')) setProject(t); });
  }
  if ('IntersectionObserver' in window) {
    const reading = new Map<Element, number>();
    const rio = new IntersectionObserver((es) => {
      es.forEach((e) => reading.set(e.target, e.intersectionRatio));
      if (mq.fine.matches || root.classList.contains('sheet-open') || !workSlot.offsetParent) return;
      let best: HTMLAnchorElement | null = null, bestR = 0;
      reading.forEach((r, el) => { if (r > bestR) { bestR = r; best = el as HTMLAnchorElement; } });
      if (best && bestR > 0.5) setProject(best);
    }, { threshold: [0, 0.5, 0.75, 1], rootMargin: '-30% 0px -30% 0px' });
    tiles.forEach((t) => rio.observe(t));
  }
}

/* Tab changes melt the object into the droplet (ADR-0006 item 5, ADR-0007): the click starts the stage's
   short droplet.out and navigates as soon as it is on screen (at most 120 ms later); the melt plays on
   while the next page loads. A later click wins. Pages are prefetched on hover. */
const TAB_PAGES = new Set(['', 'work', 'log', 'about']);
addEventListener('pageshow', () => { pendingNav = null; });
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || a.target || a.origin !== location.origin || a.pathname === location.pathname || a.closest('dialog')) return;
  if (!TAB_PAGES.has(rel(a.pathname)) || root.classList.contains('sheet-open')) return;
  const MediaStage = (window as any).MediaStage;
  if (!MediaStage || !document.querySelector('.media.stage')) { try { sessionStorage.setItem('edk-droplet', String(Date.now())); } catch {} return; }
  e.preventDefault();
  leavingAt = performance.now();
  const href = a.href;
  if (pendingNav) { pendingNav = href; location.assign(href); return; }
  pendingNav = href;
  MediaStage.leave().then(() => { if (pendingNav === href) location.assign(href); });
});
const prefetched = new Set<string>();
document.querySelectorAll<HTMLAnchorElement>('.tabs a, .mark').forEach((a) => a.addEventListener('pointerenter', () => {
  if (prefetched.has(a.href) || a.pathname === location.pathname) return;
  prefetched.add(a.href);
  const l = document.createElement('link'); l.rel = 'prefetch'; l.href = a.href; document.head.appendChild(l);
}));

/* The tab you are on: back to its top instead of reloading the page. Unless another navigation was
   just started from this page: then this click is the latest intent and must win, so it navigates. */
addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || e.defaultPrevented || a.origin !== location.origin) return;
  if (pendingNav) pendingNav = a.href;                  // a later click wins over a navigation still melting
  if (a.pathname !== location.pathname) leavingAt = performance.now();
});
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest?.('.tabs a, .mark') as HTMLAnchorElement | null;
  if (!a || root.classList.contains('sheet-open')) return;
  if (performance.now() - leavingAt < 3000) return;
  if (new URL(a.href).pathname === location.pathname && !location.hash) {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
  }
});

/* Project page: Back says where it goes. Coming from Home or Work on this site, it goes back in
   history (scroll and all); otherwise it is a plain link to Work. Arrow keys step projects. */
if (rel(location.pathname).startsWith('work/')) {
  let from: URL | null = null;
  try { from = document.referrer ? new URL(document.referrer) : null; } catch {}
  const fromHere = from && from.origin === location.origin ? rel(from.pathname) : null;
  if (fromHere === '' || fromHere === 'work') {
    const label = fromHere === '' ? 'Home' : 'Work';
    document.querySelectorAll<HTMLAnchorElement>('[data-back]').forEach((a) => {
      a.querySelector('.back-l')?.replaceChildren(label);
      if (a.classList.contains('back')) a.setAttribute('aria-label', 'Back to ' + label);
      a.addEventListener('click', (e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (history.length > 1) { e.preventDefault(); history.back(); }
      });
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey || root.classList.contains('sheet-open')) return;
    const t = e.target as HTMLElement;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const a = document.querySelector<HTMLAnchorElement>(e.key === 'ArrowRight' ? '.case-next [rel="next"]' : e.key === 'ArrowLeft' ? '.case-next [rel="prev"]' : '_');
    if (a) location.assign(a.href);
  });
  /* the table of contents follows the reading position */
  const links = [...document.querySelectorAll('.toc a')];
  const secs = [...document.querySelectorAll('.case-sec')];
  if (links.length) addEventListener('scroll', () => {
    let on = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 160) on = i; });
    links.forEach((b, i) => b.classList.toggle('on', i === on));
  }, { passive: true });
}

/* Phones: the bar tucks away while you scroll down and returns when you scroll up. */
const bar = document.getElementById('bar');
if (bar) {
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!mq.wide.matches && !root.classList.contains('sheet-open')) {
      if (y > lastY + 6 && y > 90) bar.classList.add('tucked');
      else if (y < lastY - 6 || y < 40) bar.classList.remove('tucked');
    }
    lastY = y;
  }, { passive: true });
  bar.addEventListener('focusin', () => bar.classList.remove('tucked'));
}

/* Copy link on entry pages. */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => {
  if (!navigator.clipboard) return;
  b.hidden = false;
  b.addEventListener('click', () => {
    navigator.clipboard.writeText(b.dataset.copy!).then(() => {
      b.classList.add('copied');
      b.querySelector('.copy-l')!.textContent = 'Copied';
      setTimeout(() => { b.classList.remove('copied'); b.querySelector('.copy-l')!.textContent = 'Copy link'; }, 1800);
    }).catch(() => {});
  });
});

/* Essay pages: the contents list follows the reading position. */
{
  const links = [...document.querySelectorAll('.post-toc ol a')];
  const heads = links.map((a) => document.getElementById(decodeURIComponent((a.getAttribute('href') || '').slice(1)))).filter(Boolean) as HTMLElement[];
  if (heads.length) addEventListener('scroll', () => {
    let on = -1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 160) on = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === on));
  }, { passive: true });
}
