/* The rail: one custom scrollbar on every page and in the project sheet (owner, 2026-10-10: "one fixed,
   consistent custom scrollbar on every page and in every window"; ADR-0013, which revises ADR-0011, and its
   amendment of the same day: "Does each page have its own different scrollbar? One is a line, another is a
   ladder?"). One bar everywhere: a 2 px track mid-height on the right edge and a thumb the share in view.
   A scroller with sections adds only marks on that same track (brief §7, concept B's strengths: research
   docs/research/2026-10-scroll-rail.md §4 B): one tick per section where the thumb's top is when the
   section begins, the ticks behind you lit in their section's colour, the current one in its full accent
   and a little longer, the ones ahead quiet, and the thumb in the current section's light. On desktop,
   hover or focus opens the titles beside the marks; a click goes there. A scroller without sections, or
   whose titles would not fit beside the track, is the same bar without marks. On both, a drag on the
   thumb follows the pointer in proportion and a press on the track goes there.

   Scrolling is never taken over: the rail reads the scroll position and writes it only while dragged. The
   head script hides the native bar on every page before first paint (html.rail-on for a fine pointer,
   html.rail-touch otherwise, never in forced colours; layouts/Base.astro), so the page never shifts
   sideways between pages; without JavaScript and in forced colours the platform's own scrollbar stays.
   Touch (ADR-0011 item 12): the same bar inside the right gutter; with sections it is one 44 px button
   and a tap opens the titles as a small sheet beside it; without, it is only drawn (no drag on touch).
   Sections are data in the markup: [data-rail-sec] (the label, or the element's text) and the h2s with
   ids inside [data-rail-heads]; [data-rail-accent] gives the colour. The project sheet has its own rail
   bound to its scroller (scripts/sheet.ts), its sections the marks. */
import { root, reduce, mq } from './env';

const READ = 0.3;          // the reading line: a section is current once its top passes 30% of the view
const ROW = 28;            // one title per 28 px row at least; each row is a link at least 24 px tall (WCAG 2.5.8)
const TMARK = 8;           // touch: the least room one mark needs on the track (a 2 px tick and its gap)
const DRAG = 4;            // pointer travel before a press on a title becomes a drag
const MIN_THUMB = 24;      // the shortest thumb
const GROUND: RGB = [10, 10, 11];
const PAST = 4.5;          // contrast the lit marks behind you keep against the ground (≥ 3:1, 1.4.11)
type RGB = [number, number, number];
type Mode = 'rungs' | 'plain' | 'none';

interface Sec { el: HTMLElement; label: string; a: string; ar: string; top: number; start: number; end: number }

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
}
export interface Rail { measure(): void; destroy(): void; mode(): Mode }

/** The page's rail (every page). The project sheet makes its own with createRail (scripts/sheet.ts). */
export function initRail() {
  const main = document.getElementById('main');
  if (!main) return;
  const sections = [...main.querySelectorAll<HTMLElement>('[data-rail-sec], [data-rail-heads] h2[id]')];
  const minutes = +(main.querySelector<HTMLElement>('[data-rail-minutes]')?.dataset.railMinutes ?? 0);
  const rail = createRail({
    host: main.parentElement!, before: main, sections, content: main, flat: root, id: 'rail', minutes,
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

  /* ---------- the bar: one track and one thumb, built the same for both variants (ADR-0013 amendment) ---------- */
  const bar = () => {
    const track = document.createElement('div');
    track.className = 'rail-track';
    const thumb = document.createElement('i');
    thumb.className = 'rail-thumb';
    track.append(thumb);
    return { track, thumb };
  };

  /* ---------- with sections: the same bar, its marks on the track and the titles beside it ---------- */
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
  /* touch: the bar is one button (its marks are drawn on the track, the titles wait in the sheet) */
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
  const ladderBar = bar();
  ladderBar.track.setAttribute('aria-hidden', 'true');
  nav.append(hit, sheet, ladderBar.track, btn);

  /* ---------- without sections: the bar alone. It is what the native scrollbar was, so like it it stays out
     of the tab order and the accessibility tree: the keyboard scrolls the page itself. ---------- */
  const plain = document.createElement('div');
  plain.className = 'rail-plain' + (o.extraClass ? ' ' + o.extraClass : '');
  plain.hidden = true;
  plain.setAttribute('aria-hidden', 'true');
  const plainBar = bar();
  plain.append(plainBar.track);
  o.host.insertBefore(plain, o.before ?? null);
  const active = () => (mode === 'rungs' ? ladderBar : plainBar);

  const pageAccent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ddd6cb';
  const secs: Sec[] = o.sections.map((s, i) => {
    if (!s.id) s.id = o.id + '-s-' + i;
    const accent = s.closest<HTMLElement>('[data-rail-accent]')?.dataset.railAccent || pageAccent;
    const rgb = resolve(accent, o.host);
    return { el: s, label: (s.dataset.railSec || s.textContent || '').trim(), a: css(rgb), ar: css(rest(rgb)), top: 0, start: 0, end: 0 };
  });
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
    const m = document.createElement('i');
    m.className = 'rail-m';
    m.style.setProperty('--a', s.a);
    m.style.setProperty('--ar', s.ar);
    ladderBar.track.append(m);
    marks.push(m);
    return a;
  });
  /* the titles are only built where there are sections to mark */
  if (secs.length >= 2) o.host.insertBefore(nav, plain);

  let vh = 0, max = 0, cur = -1, raf = 0, mode: Mode = 'none', trackH = 0, thumbH = 0;

  function measure() {
    if (!qualifies() || !(root.classList.contains('rail-on') || root.classList.contains('rail-touch'))) { setMode('none'); return; }
    vh = viewH();
    const sh = fullH();
    max = Math.max(0, sh - vh);
    if (!vh) { setMode('none'); return; }       // not laid out (a closed dialog)
    /* the marks get a row each beside the track (on touch only a mark: the open sheet scrolls itself) */
    const barH = Math.min(innerHeight * 0.44, 320);   // --rail-h, the same for both variants
    const fits = secs.length >= 2 && max > vh * 0.25 && secs.length * (touch() ? TMARK : ROW) <= barH;
    setMode(fits ? 'rungs' : max > 8 ? 'plain' : 'none');
    if (mode === 'none') return;
    const { track, thumb } = active();
    trackH = track.clientHeight;
    thumbH = Math.max(MIN_THUMB, Math.round(trackH * vh / sh));
    thumb.style.height = thumbH + 'px';
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
      /* a mark sits where the thumb's top is when its section begins; its row is level with it, pushed
         apart to one row where marks crowd and kept within half a row of the track's ends */
      const room = Math.max(0, trackH - thumbH);
      const ys = secs.map((s) => (max ? Math.round(room * s.start / max) : 0));
      ys.forEach((y, i) => marks[i].style.setProperty('--y', y + 'px'));
      const c = ys.map((y) => y + 1);
      for (let i = 1; i < c.length; i++) c[i] = Math.max(c[i], c[i - 1] + ROW);
      if (c[c.length - 1] > trackH) {
        c[c.length - 1] = trackH;
        for (let i = c.length - 2; i >= 0; i--) c[i] = Math.min(c[i], c[i + 1] - ROW);
      }
      /* the list starts half a row above the track: row i's top in the list is c[i] */
      c.forEach((ci, i) => (links[i].parentElement as HTMLElement).style.setProperty('--mt', Math.max(0, Math.round(ci - (i ? c[i - 1] + ROW : 0))) + 'px'));
      list.style.setProperty('--lh', trackH + ROW + 'px');
    }
    cur = -1;
    update();
  }

  function setMode(m: Mode) {
    if (m !== 'rungs') setOpen(false);
    mode = m;
    nav.hidden = m !== 'rungs';
    plain.hidden = m !== 'plain';
    /* a scroller with sections showing the bar alone gets its own contents list back */
    o.flat.classList.toggle('rail-flat', secs.length >= 2 && m !== 'rungs');
  }

  function update() {
    raf = 0;
    if (mode === 'none') return;
    const y = Math.min(max, Math.max(0, getY()));
    active().thumb.style.transform = `translateY(${max ? Math.round((trackH - thumbH) * y / max) : 0}px)`;
    if (mode !== 'rungs') return;
    let i = 0;
    secs.forEach((s, j) => { if (s.start <= y + 0.5) i = j; });
    if (y >= max - 1) i = secs.length - 1;
    if (i !== cur) {
      cur = i;
      links.forEach((a, j) => {
        a.classList.toggle('on', j === i);
        a.classList.toggle('done', j < i);
        if (j === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        marks[j].classList.toggle('on', j === i);
        marks[j].classList.toggle('done', j < i);
      });
      /* the thumb carries the current section's light */
      nav.style.setProperty('--thumb', secs[i].a);
      btn.setAttribute('aria-label', `On this page: ${secs[i].label}, ${i + 1} of ${secs.length}`);
    }
    const p = max ? y / max : 1;
    foot.textContent = o.minutes
      ? (p >= 0.99 ? 'At the end' : `About ${Math.max(1, Math.ceil(o.minutes * (1 - p)))} min left`)
      : `${Math.round(p * 100)}% down the page`;
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

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
  nav.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    clearTimeout(closeT);
    openT = window.setTimeout(() => setOpen(true), 120);
  });
  nav.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;   // a lifted finger leaves too: touch closes by tap only
    clearTimeout(openT);
    if (drag) return;
    closeT = window.setTimeout(() => setOpen(false), 280);
  });

  /* ---------- drag: one behaviour for both variants, as a scrollbar's. A press on the thumb holds it where
     it was taken and a drag follows the pointer in proportion; a press on the track goes there (smooth, or
     instant under reduced motion) and a drag continues from there; a click on a title goes to its
     section. Escape during a drag puts the page back. ---------- */
  let drag: { id: number; y0: number; s0: number; on: boolean; host: HTMLElement; grab: number } | null = null;
  let swallow = false;
  const fromTrack = (clientY: number, grab: number) => {
    const r = active().track.getBoundingClientRect();
    const room = Math.max(1, trackH - thumbH);
    return Math.min(max, Math.max(0, (clientY - r.top - grab) / room * max));
  };
  const press = (host: HTMLElement) => (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === 'touch' || mode === 'none') return;
    const t = active().thumb.getBoundingClientRect();
    const onThumb = e.clientY >= t.top - 2 && e.clientY <= t.bottom + 2;
    const onTitle = !!(e.target as Element).closest('a.rail-i');
    if (host === nav && !onTitle && e.target !== hit) return;   // the panel around the titles is not the track
    drag = { id: e.pointerId, y0: e.clientY, s0: getY(), on: false, host, grab: onThumb ? e.clientY - t.top : thumbH / 2 };
    if (onTitle) return;             // a title: a click goes to its section, a drag still scrubs
    e.preventDefault();
    host.setPointerCapture(e.pointerId);
    host.classList.add('is-drag');
    if (!onThumb) setY(fromTrack(e.clientY, drag.grab), reduce() ? 'instant' : 'smooth');
  };
  nav.addEventListener('pointerdown', press(nav));
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
    setY(fromTrack(e.clientY, drag.grab), 'instant');
  };
  nav.addEventListener('pointermove', move);
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

  /* a rail inside the sheet sits beside its scroller, not in it: the wheel over the rail goes to the
     scroller, as it would over a native bar (the page's rail needs nothing: the page is the scroller) */
  if (el) for (const t of [nav, plain]) t.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
    el.scrollBy({ top: e.deltaY * k, behavior: 'instant' });
  }, { passive: false, signal: ac.signal });

  target.addEventListener('scroll', schedule, passive);
  addEventListener('resize', measure, passive);
  addEventListener('load', measure, sig);
  document.fonts?.ready.then(() => { if (!ac.signal.aborted) measure(); });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => measure()) : null;
  ro?.observe(o.content);
  if (el) ro?.observe(el);
  measure();

  return {
    measure,
    mode: () => mode,
    destroy() {
      ac.abort();
      ro?.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(openT); clearTimeout(closeT);
      if (drag) root.classList.remove('rail-grab');
      o.flat.classList.remove('rail-flat');
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
function rest(c: RGB): RGB {
  if (contrast(c, GROUND) <= PAST) return c;
  const [L, A, B] = toLab(c);
  let lo = 0, hi = L;
  for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (contrast(fromLab([m, A, B]), GROUND) >= PAST) hi = m; else lo = m; }
  return fromLab([hi, A, B]);
}
