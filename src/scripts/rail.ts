/* The rail: one custom scrollbar on every page and in the project sheet (ADR-0013, revising ADR-0011; its
   amendments of 2026-10-10 and 2026-10-11). The owner, 2026-10-11: "No native scrollbar anywhere; custom
   everywhere. [...] design something simpler and aesthetic", and then chose the beads, their own sketch
   (ADR-0013 amendment 2026-10-11, later; research docs/research/2026-10-rail-design.md §3 A):

   one mark per section in a short column, the sections behind you small dots, the ones ahead short dashes,
   the current one a long line that fills as you read it and morphs on the UI spring when the section
   changes. A page without sections is split into its screens (2 to 6 beads).

   Scrolling is never taken over (the rail reads the scroll position and writes it only while dragged); a
   drag follows the pointer along the column in proportion, a press goes there, Escape during a drag puts the
   page back; on desktop hover or focus opens the section titles beside the beads; on touch a scroller with
   sections is one 44 px button whose tap opens the titles as a small sheet, and without sections the rail is
   only drawn. The native bar is hidden on every page before first paint (html.rail-on for a fine pointer,
   html.rail-touch otherwise, never in forced colours), so the page never shifts sideways; without
   JavaScript and in forced colours the platform's own scrollbar stays. Sections are data in the markup:
   [data-rail-sec] (the label, or the element's text) and the h2s with ids inside [data-rail-heads];
   [data-rail-accent] gives the colour. The project sheet has its own rail (scripts/sheet.ts). */
import { root, reduce, mq } from './env';

const READ = 0.3;          // the reading line: a section is current once its top passes 30% of the view
const ROW = 28;            // one title per 28 px row at least; each row is a link at least 24 px tall (WCAG 2.5.8)
const TMARK = 8;           // touch: the least room one mark needs on the column
const DRAG = 4;            // pointer travel before a press on a title becomes a drag
const SCREENS = [2, 6];    // a page without sections gets one bead per screen, between these
const PAST = 4.5;          // contrast the lit marks behind you keep against the ground (≥ 3:1, 1.4.11)
type RGB = [number, number, number];
type Mode = 'rungs' | 'plain' | 'none';

interface Sec { el: HTMLElement; label: string; a: string; ar: string; top: number; start: number; end: number; g?: string }
/** what a bead stands for: a section, or (a page without sections) a stretch of the page */
interface Unit { start: number; end: number; m: HTMLElement }

export interface RailOpts {
  /** the element that scrolls; omitted for the page itself */
  scroller?: HTMLElement;
  /** where the rail is placed: the nav goes into `host`, before `before` */
  host: Element;
  before?: Element | null;
  sections: HTMLElement[];
  /** element observed for size changes (the page's main, the sheet's article) */
  content: Element;
  /** element that carries .rail-flat while a scroller with sections shows the plain variant (its own
      contents list comes back then: ADR-0011 item 3) */
  flat: Element;
  /** prefix for the ids the rail creates */
  id: string;
  /** distance to keep above a section the rail goes to (the bars over the scroller) */
  offset: () => number;
  minutes?: number;
  extraClass?: string;
  /** Opt-in, off by default so the live site keeps its hover panel and drag. With it, the rail with sections
      only draws and measures; `ext` gets the parts and takes every pointer and key on the column (the
      two-page Home's hold-to-scrub and bloom, src/one/scripts/bloom.ts, review row V6). The rail without
      sections keeps its own drag. */
  ext?: (api: RailApi) => { destroy(): void; mode?(m: Mode): void };
}
export interface Rail { measure(): void; destroy(): void; mode(): Mode }
/** What a rail hands to its `ext`: its elements and its state, read live. */
export interface RailApi {
  nav: HTMLElement; btn: HTMLButtonElement; list: HTMLOListElement; links: HTMLAnchorElement[]; marks: HTMLElement[]; track: HTMLElement;
  secs: { el: HTMLElement; label: string; a: string; ar: string }[];
  /** the current section, the scroll position, its largest value and each section's start in scroll space */
  cur(): number; y(): number; max(): number; start(i: number): number;
  setY(top: number, behavior: ScrollBehavior): void;
  /** go to a section (smooth, or instant under reduced motion); a keyboard press moves focus there too */
  go(i: number, keyboard: boolean): void;
}

/** The page's rail (every page). The project sheet makes its own with createRail (scripts/sheet.ts). */
export function initRail(opts: { ext?: RailOpts['ext'] } = {}) {
  const main = document.getElementById('main');
  if (!main) return;
  const sections = [...main.querySelectorAll<HTMLElement>('[data-rail-sec], [data-rail-heads] h2[id]')];
  const minutes = +(main.querySelector<HTMLElement>('[data-rail-minutes]')?.dataset.railMinutes ?? 0);
  const rail = createRail({
    host: main.parentElement!, before: main, sections, content: main, flat: root, id: 'rail', minutes, ext: opts.ext,
    offset: () => (parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) || 84) + 24,
  });
  /* the pointer or forced colours changed: the classes the head script set follow (the sheet's rail reads them too) */
  const recheck = () => {
    if (qualifies()) { root.classList.toggle('rail-on', !touch()); root.classList.toggle('rail-touch', touch()); } else off();
    rail.measure();
  };
  mq.fine.addEventListener?.('change', recheck);
  forced.addEventListener?.('change', recheck);
}

export function createRail(o: RailOpts): Rail {
  const ac = new AbortController();
  const sig = { signal: ac.signal };
  const passive = { passive: true, signal: ac.signal };
  const el = o.scroller;
  const target: EventTarget = el ?? window;
  const getY = () => (el ? el.scrollTop : scrollY);
  const setY = (top: number, behavior: ScrollBehavior) => (el ?? window).scrollTo({ top, behavior });
  const viewH = () => (el ? el.clientHeight : innerHeight);
  const fullH = () => (el ? el.scrollHeight : document.documentElement.scrollHeight);
  const originY = () => (el ? el.getBoundingClientRect().top - el.scrollTop : -scrollY);

  /* the column the beads sit in */
  const column = () => {
    const track = document.createElement('div');
    track.className = 'rail-track';
    track.setAttribute('aria-hidden', 'true');
    return track;
  };

  /* ---------- with sections: the beads and the titles beside them ---------- */
  const nav = document.createElement('nav');
  nav.className = 'rail' + (o.extraClass ? ' ' + o.extraClass : '');
  nav.id = o.id;
  nav.hidden = true;
  nav.setAttribute('aria-label', 'On this page');
  const list = document.createElement('ol');
  list.className = 'rail-list';
  const foot = document.createElement('p');
  foot.className = 'rail-foot meta';
  foot.setAttribute('aria-hidden', 'true');
  /* touch: the column is one button (its beads are drawn, the titles wait in the sheet) */
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rail-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', o.id + '-sheet');
  const sheet = document.createElement('div');
  sheet.className = 'rail-sheet';
  sheet.id = o.id + '-sheet';
  sheet.append(list, foot);
  const hit = document.createElement('div');
  hit.className = 'rail-track-hit';
  hit.setAttribute('aria-hidden', 'true');
  const ladder = column();
  nav.append(hit, sheet, ladder, btn);

  /* ---------- without sections: the beads alone, one per screen. It is what the native scrollbar was, so
     like it it stays out of the tab order and the accessibility tree: the keyboard scrolls the page. ---------- */
  const plain = document.createElement('div');
  plain.className = 'rail-plain' + (o.extraClass ? ' ' + o.extraClass : '');
  plain.hidden = true;
  plain.setAttribute('aria-hidden', 'true');
  const plainCol = column();
  plain.append(plainCol);
  o.host.insertBefore(plain, o.before ?? null);
  const track = () => (mode === 'rungs' ? ladder : plainCol);
  const box = () => (mode === 'rungs' ? nav : plain);

  const pageAccent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ddd6cb';
  const pageRGB = resolve(pageAccent, o.host);
  const secs: Sec[] = o.sections.map((s, i) => {
    if (!s.id) s.id = o.id + '-s-' + i;
    const accent = s.closest<HTMLElement>('[data-rail-accent]')?.dataset.railAccent || pageAccent;
    const rgb = resolve(accent, o.host);
    return { el: s, label: (s.dataset.railSec || s.textContent || '').trim(), a: css(rgb), ar: css(rest(rgb)), top: 0, start: 0, end: 0 };
  });
  const mark = (a: string, ar: string) => {
    const m = document.createElement('i');
    m.className = 'rail-m';
    m.style.setProperty('--a', a);
    m.style.setProperty('--ar', ar);
    return m;
  };
  const marks: HTMLElement[] = [];
  const links = secs.map((s, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'rail-i';
    a.href = '#' + s.el.id;
    a.dataset.i = String(i);
    a.style.setProperty('--a', s.a);
    a.style.setProperty('--ar', s.ar);
    const t = document.createElement('span');
    t.className = 'rail-t';
    t.textContent = s.label;
    a.append(t);
    li.append(a);
    list.append(li);
    const m = mark(s.a, s.ar);
    ladder.append(m);
    marks.push(m);
    return a;
  });
  /* the titles are only built where there are sections to mark */
  if (secs.length >= 2) o.host.insertBefore(nav, plain);
  const screens: HTMLElement[] = [];

  let vh = 0, max = 0, cur = -1, raf = 0, mode: Mode = 'none';
  let units: Unit[] = [];
  /* touch: the pictures that could pass under the column (a strip of screens bleeds to the window's edge on a
     phone); while one does, the beads step aside, as the platform's indicator fades, so they never sit on it */
  let media: HTMLElement[] = [];

  function measure() {
    if (!qualifies() || !(root.classList.contains('rail-on') || root.classList.contains('rail-touch'))) { setMode('none'); return; }
    vh = viewH();
    const sh = fullH();
    max = Math.max(0, sh - vh);
    if (!vh) { setMode('none'); return; }       // not laid out (a closed dialog)
    /* the beads get a title row each beside the column (on touch only a bead: the open sheet scrolls itself) */
    const barH = Math.min(innerHeight * 0.44, 320);   // --rail-h
    const fits = secs.length >= 2 && max > vh * 0.25 && secs.length * (touch() ? TMARK : ROW) <= barH;
    setMode(fits ? 'rungs' : max > 8 ? 'plain' : 'none');
    if (mode === 'none') return;
    /* pictures, and any strip that scrolls sideways (its captions travel under the column with it) */
    media = touch() ? [...o.content.querySelectorAll<HTMLElement>('*')].filter((e) => /^(IMG|VIDEO|CANVAS)$/.test(e.tagName)
      || (e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(e).overflowX))) : [];

    if (mode === 'rungs') {
      const y0 = originY();
      secs.forEach((s) => { s.top = s.el.getBoundingClientRect().top - y0; });
      /* where each section starts in scroll space: when its top reaches the reading line. Sections the page
         cannot scroll that far share out the last stretch, so the last one still becomes current. */
      let last = 0;
      secs.forEach((s, i) => { s.start = i === 0 ? 0 : Math.max(last, s.top - READ * vh); if (s.start < max) last = s.start; });
      const late = secs.filter((s, i) => i > 0 && s.start >= max);
      if (late.length) {
        const from = secs[secs.length - late.length - 1].start;
        late.forEach((s, j) => { s.start = from + (max - from) * (j + 1) / (late.length + 1); });
      }
      secs.forEach((s, i) => { s.end = i + 1 < secs.length ? secs[i + 1].start : max; });
      units = secs.map((s, i) => ({ start: s.start, end: s.end, m: marks[i] }));
    } else {
      /* no sections: the page in screens, one bead each, in the page's own light */
      const n = Math.max(SCREENS[0], Math.min(SCREENS[1], Math.round(sh / vh)));
      const a = css(pageRGB), ar = css(rest(pageRGB));
      while (screens.length < n) screens.push(mark(a, ar));
      screens.forEach((m, i) => { if (i < n) { if (m.parentElement !== plainCol) plainCol.append(m); } else m.remove(); });
      units = screens.slice(0, n).map((m, i) => ({ start: max * i / n, end: max * (i + 1) / n, m }));
    }

    if (mode === 'rungs') titles(barH);
    cur = -1;
    update();
  }

  /* the titles beside the beads: the column is centred on the bar, so are the rows, one ROW apart */
  function titles(barH: number) {
    const n = units.length;
    const first = barH / 2 - (n - 1) / 2 * ROW;
    sheet.style.setProperty('--st', Math.round(first - ROW / 2) + 'px');
    links.forEach((a) => (a.parentElement as HTMLElement).style.setProperty('--mt', '0px'));
  }

  function setMode(m: Mode) {
    if (m !== 'rungs') setOpen(false);
    const was = mode;
    mode = m;
    if (m !== was) extH?.mode?.(m);
    nav.hidden = m !== 'rungs';
    plain.hidden = m !== 'plain';
    /* a scroller with sections showing the beads of its screens gets its own contents list back */
    o.flat.classList.toggle('rail-flat', secs.length >= 2 && m !== 'rungs');
  }

  function update() {
    raf = 0;
    if (mode === 'none') return;
    const y = Math.min(max, Math.max(0, getY()));
    const p = max ? y / max : 1;
    /* the current bead, and how far into it */
    let i = 0;
    units.forEach((u, j) => { if (u.start <= y + 0.5) i = j; });
    if (y >= max - 1) i = units.length - 1;
    if (units.length) {
      const u = units[i];
      const f = u.end > u.start ? Math.min(1, Math.max(0, (y - u.start) / (u.end - u.start))) : 1;
      units.forEach((v, j) => v.m.style.setProperty('--f', j < i ? '1' : j > i ? '0' : (y >= max - 1 ? 1 : f).toFixed(3)));
    }
    if (i !== cur) {
      cur = i;
      units.forEach((u, j) => { u.m.classList.toggle('on', j === i); u.m.classList.toggle('done', j < i); });
      if (mode === 'rungs') {
        links.forEach((a, j) => {
          a.classList.toggle('on', j === i);
          a.classList.toggle('done', j < i);
          if (j === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        btn.setAttribute('aria-label', `On this page: ${secs[i].label}, ${i + 1} of ${secs.length}`);
      }
    }
    clear();
    if (mode !== 'rungs') return;
    foot.textContent = o.minutes
      ? (p >= 0.99 ? 'At the end' : `About ${Math.max(1, Math.ceil(o.minutes * (1 - p)))} min left`)
      : `${Math.round(p * 100)}% down the page`;
  }
  function clear() {
    if (!media.length) { box().classList.remove('is-over'); return; }
    const r = track().getBoundingClientRect(), m = 4;
    const over = media.some((e) => {
      const q = e.getBoundingClientRect();
      return q.width > 0 && q.right > r.left - m && q.left < r.right + m && q.bottom > r.top - m && q.top < r.bottom + m;
    });
    box().classList.toggle('is-over', over);
  }
  /* awake while the scroller moves (the dashes ahead brighten a touch), resting a second after */
  let liveT = 0;
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
    const b = box();
    b.classList.add('is-live');
    clearTimeout(liveT);
    liveT = window.setTimeout(() => b.classList.remove('is-live'), 1100);
  };

  /* going to a section: smooth, or instant under reduced motion; a keyboard press also moves focus there */
  function go(i: number, keyboard: boolean) {
    const s = secs[i].el;
    const margin = parseFloat(getComputedStyle(s).scrollMarginTop) || 0;
    const top = i === 0 ? 0 : Math.max(0, s.getBoundingClientRect().top - originY() - Math.max(margin, o.offset()));
    setY(top, reduce() ? 'instant' : 'smooth');
    if (keyboard) {
      if (!s.hasAttribute('tabindex')) s.setAttribute('tabindex', '-1');
      s.focus({ preventScroll: true });
    }
  }

  /* ---------- hover: the titles open after a short intent delay and close a little after leaving ---------- */
  let openT = 0, closeT = 0;
  function setOpen(v: boolean) { nav.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', String(v)); }
  if (!o.ext) nav.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    clearTimeout(closeT);
    openT = window.setTimeout(() => setOpen(true), 120);
  });
  if (!o.ext) nav.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;   // a lifted finger leaves too: touch closes by tap only
    clearTimeout(openT);
    if (drag) return;
    closeT = window.setTimeout(() => setOpen(false), 280);
  });

  /* ---------- drag, as a scrollbar's: the pointer's place along the column (its full height, which stays
     the same while the beads morph) is the place in the page. A press goes there (smooth, or instant under
     reduced motion) and a drag continues from there; a click on a title goes to its section. Escape during
     a drag puts the page back. ---------- */
  let drag: { id: number; y0: number; s0: number; on: boolean; host: HTMLElement } | null = null;
  let swallow = false;
  const fromTrack = (clientY: number) => {
    const r = track().getBoundingClientRect();
    return Math.min(max, Math.max(0, (clientY - r.top) / Math.max(1, r.height) * max));
  };
  const press = (host: HTMLElement) => (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === 'touch' || mode === 'none') return;
    const onTitle = !!(e.target as Element).closest('a.rail-i');
    if (host === nav && !onTitle && e.target !== hit) return;   // the panel around the titles is not the column
    drag = { id: e.pointerId, y0: e.clientY, s0: getY(), on: false, host };
    if (onTitle) return;             // a title: a click goes to its section, a drag still scrubs
    e.preventDefault();
    host.setPointerCapture(e.pointerId);
    host.classList.add('is-drag');
    setY(fromTrack(e.clientY), reduce() ? 'instant' : 'smooth');
  };
  if (!o.ext) nav.addEventListener('pointerdown', press(nav));
  plain.addEventListener('pointerdown', press(plain));
  const move = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      if (Math.abs(e.clientY - drag.y0) < DRAG) return;
      drag.on = true;
      if (!drag.host.hasPointerCapture(e.pointerId)) drag.host.setPointerCapture(e.pointerId);
      drag.host.classList.add('is-drag');
      if (drag.host === nav) setOpen(true);
      root.classList.add('rail-grab');
      getSelection()?.removeAllRanges();
    }
    e.preventDefault();
    setY(fromTrack(e.clientY), 'instant');
  };
  if (!o.ext) nav.addEventListener('pointermove', move);
  plain.addEventListener('pointermove', move);
  const end = (e?: Event) => {
    if (!drag) return;
    const was = drag.on;
    drag = null;
    plain.classList.remove('is-drag');
    nav.classList.remove('is-drag');
    if (!was) return;
    swallow = true;
    setTimeout(() => { swallow = false; }, 0);
    root.classList.remove('rail-grab');
    if (e && e.type === 'pointerup' && !nav.matches(':hover')) setOpen(false);
  };
  for (const t of [nav, plain]) for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) t.addEventListener(ev, end);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drag) { const s0 = drag.s0; end(); setY(s0, 'instant'); }
  }, sig);
  nav.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------- click, Enter and the arrow keys ---------- */
  if (!o.ext) {
    nav.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a.rail-i');
      if (swallow) { e.preventDefault(); return; }
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      go(+a.dataset.i!, e.detail === 0);
      if (touch()) setOpen(false);
    });
    /* touch: the button opens and closes the sheet; a tap outside or Escape closes it */
    btn.addEventListener('click', () => {
      const v = !nav.classList.contains('is-open');
      setOpen(v);
      if (v && btn.matches(':focus-visible')) links[Math.max(0, cur)].focus();
    });
    document.addEventListener('pointerdown', (e) => {
      if (nav.classList.contains('is-open') && touch() && !nav.contains(e.target as Node)) setOpen(false);
    }, passive);
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && touch() && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    }, sig);
    nav.addEventListener('keydown', (e) => {
      const i = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (i < 0) return;
      const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -2;
      if (to === -2) return;
      e.preventDefault();
      links[Math.max(0, Math.min(links.length - 1, to))].focus();
    });
  }

  /* a rail inside the sheet sits beside its scroller, not in it: the wheel over the rail goes to the
     scroller, as it would over a native bar (the page's rail needs nothing: the page is the scroller) */
  if (el) for (const t of [nav, plain]) t.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
    el.scrollBy({ top: e.deltaY * k, behavior: 'instant' });
  }, { passive: false, signal: ac.signal });

  target.addEventListener('scroll', schedule, passive);
  /* an inner strip scrolled sideways can bring a picture under the column (touch only) */
  document.addEventListener('scroll', (e) => { if (media.length && e.target !== target && e.target !== document) { if (!raf) raf = requestAnimationFrame(update); } }, { passive: true, capture: true, signal: ac.signal });
  addEventListener('resize', measure, passive);
  addEventListener('load', measure, sig);
  document.fonts?.ready.then(() => { if (!ac.signal.aborted) measure(); });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => measure()) : null;
  ro?.observe(o.content);
  if (el) ro?.observe(el);
  /* the opt-in interaction: it gets the parts once they exist */
  const extH = o.ext?.({
    nav, btn, list, links, marks, track: ladder, secs,
    cur: () => cur, y: getY, max: () => max, start: (i) => secs[i]?.start ?? 0, setY, go,
  });
  measure();

  return {
    measure,
    mode: () => mode,
    destroy() {
      ac.abort();
      ro?.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(openT); clearTimeout(closeT); clearTimeout(liveT);
      if (drag) root.classList.remove('rail-grab');
      o.flat.classList.remove('rail-flat');
      extH?.destroy();
      nav.remove(); plain.remove();
    },
  };
}

const forced = matchMedia('(forced-colors: active)');
const qualifies = () => !forced.matches;
const touch = () => !mq.fine.matches;
function off() { root.classList.remove('rail-on', 'rail-touch'); }

/* ---------- colour: every lit mark keeps ≥ 3:1 on the ground (research §5: Eat Map rose at a fixed
   rest opacity fell to 2.4:1). The marks behind you keep each accent's hue and chroma and lower only its
   OKLab lightness, as far as PAST allows: a dark accent (rose) keeps nearly all of itself, a bright one
   (lime) steps further down. ---------- */
function resolve(value: string, host: Element): RGB {
  const probe = document.createElement('span');
  probe.style.color = value;
  host.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  const n = (c.match(/-?[\d.]+/g) || []).map(Number);
  if (/^color\(srgb/.test(c)) return [n[0] * 255, n[1] * 255, n[2] * 255];
  return n.length >= 3 ? [n[0], n[1], n[2]] : [221, 214, 203];
}
const css = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(' ')})`;
const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const gam = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const lum = (c: RGB) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
export const contrast = (a: RGB, b: RGB) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function toLab(c: RGB): RGB {
  const [r, g, b] = c.map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function fromLab([L, A, B]: RGB): RGB {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return rgb.map((v) => Math.min(255, Math.max(0, gam(v)))) as RGB;
}
/** the page ground (--ground, global.css), read once from the stylesheet so a theme change needs no edit here */
let ground: RGB | null = null;
const GROUND = (): RGB => (ground ??= resolve('var(--ground)', document.body));
function rest(c: RGB): RGB {
  const GR = GROUND();
  if (contrast(c, GR) <= PAST) return c;
  const [L, A, B] = toLab(c);
  let lo = 0, hi = L;
  for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (contrast(fromLab([m, A, B]), GR) >= PAST) hi = m; else lo = m; }
  return fromLab([hi, A, B]);
}
