/* The rail: one custom scrollbar on every page and in the project sheet (owner, 2026-10-10: "one fixed,
   consistent custom scrollbar on every page and in every window"; ADR-0013, which revises ADR-0011).
   A scroller with sections gets the contents ladder (brief §7, 2026-10-09 late: concept B; research
   docs/research/2026-10-scroll-rail.md §4 B): one dash per section at the right edge, the current dash
   filling as you read through its section, the dashes behind you lit in their own section's colour, the
   ones ahead quiet, each dash's length its section's share of the page. Hover opens the titles; a click
   goes there; a drag along the dashes scrubs section by section. A scroller without sections, or whose
   ladder would not fit, gets the plain variant: the same column with a track and a thumb and no rungs
   (ADR-0013 item 2); a drag on it scrubs the page in proportion, a press on the track goes there.

   Scrolling is never taken over: the rail reads the scroll position and writes it only while dragged. The
   head script hides the native bar on every page before first paint (html.rail-on for a fine pointer,
   html.rail-touch otherwise, never in forced colours; layouts/Base.astro), so the page never shifts
   sideways between pages; without JavaScript and in forced colours the platform's own scrollbar stays.
   Touch (ADR-0011 item 12): the ladder is a slim column of short dashes inside the right gutter, drawn
   by one 44 px button; a tap opens the titles as a small sheet beside it. The plain variant on touch is
   only drawn (no drag on touch). Sections are data in the markup: [data-rail-sec] (the label, or the
   element's text) and the h2s with ids inside [data-rail-heads]; [data-rail-accent] gives the colour.
   The project sheet has its own rail bound to its scroller (scripts/sheet.ts), its sections the rungs. */
import { root, reduce, mq } from './env';

const READ = 0.3;          // the reading line: a section is current once its top passes 30% of the view
const ROW = 28;            // one dash per 28 px row; each row is a link at least 24 px tall (WCAG 2.5.8)
const TMARK = 10;          // touch: one 2 px dash and its 8 px gap per section in the closed ladder
const DRAG = 4;            // pointer travel before a press becomes a scrub
const MIN_THUMB = 24;      // the plain variant's shortest thumb
const GROUND: RGB = [10, 10, 11];
const PAST = 4.5;          // contrast the lit dashes behind you keep against the ground (≥ 3:1, 1.4.11)
type RGB = [number, number, number];
type Mode = 'rungs' | 'plain' | 'none';

interface Sec { el: HTMLElement; label: string; a: string; ar: string; top: number; start: number; end: number; w: number }

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

  /* ---------- the ladder (rungs) ---------- */
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
  /* touch: the ladder is one button (its dashes are drawn, the titles wait in the sheet) */
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rail-btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', o.id + '-sheet');
  const sheet = document.createElement('div');
  sheet.className = 'rail-sheet';
  sheet.id = o.id + '-sheet';
  sheet.append(list, foot);
  nav.append(sheet, btn);

  /* ---------- the plain variant: a track and a thumb, no rungs (ADR-0013 item 2). It is what the native
     scrollbar was, so like it it stays out of the tab order and the accessibility tree: the keyboard
     scrolls the page itself. ---------- */
  const plain = document.createElement('div');
  plain.className = 'rail-plain' + (o.extraClass ? ' ' + o.extraClass : '');
  plain.hidden = true;
  plain.setAttribute('aria-hidden', 'true');
  const track = document.createElement('div');
  track.className = 'rail-track';
  const thumb = document.createElement('i');
  thumb.className = 'rail-thumb';
  track.append(thumb);
  plain.append(track);
  o.host.insertBefore(plain, o.before ?? null);

  const pageAccent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ddd6cb';
  const secs: Sec[] = o.sections.map((s, i) => {
    if (!s.id) s.id = o.id + '-s-' + i;
    const accent = s.closest<HTMLElement>('[data-rail-accent]')?.dataset.railAccent || pageAccent;
    const rgb = resolve(accent, o.host);
    return { el: s, label: (s.dataset.railSec || s.textContent || '').trim(), a: css(rgb), ar: css(rest(rgb)), top: 0, start: 0, end: 0, w: 12 };
  });
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
    const d = document.createElement('span');
    d.className = 'rail-d';
    d.setAttribute('aria-hidden', 'true');
    d.append(document.createElement('i'));
    a.append(t, d);
    li.append(a);
    list.append(li);
    const m = document.createElement('i');
    m.className = 'rail-m';
    m.style.setProperty('--a', s.a);
    m.style.setProperty('--ar', s.ar);
    btn.append(m);
    return a;
  });
  const marks = [...btn.querySelectorAll<HTMLElement>('.rail-m')];
  /* the ladder is only built where there are rungs to draw */
  if (secs.length >= 2) o.host.insertBefore(nav, plain);

  let vh = 0, max = 0, cur = -1, raf = 0, mode: Mode = 'none', trackH = 0, thumbH = 0;

  function measure() {
    if (!qualifies() || !(root.classList.contains('rail-on') || root.classList.contains('rail-touch'))) { setMode('none'); return; }
    vh = viewH();
    const sh = fullH();
    max = Math.max(0, sh - vh);
    if (!vh) { setMode('none'); return; }       // not laid out (a closed dialog)
    /* touch: the closed ladder is what has to fit (the open sheet scrolls itself) */
    const fits = secs.length >= 2 && max > vh * 0.25 && (touch() ? secs.length * TMARK + 28 : secs.length * ROW) + 160 < vh;
    setMode(fits ? 'rungs' : max > 8 ? 'plain' : 'none');
    if (mode === 'plain') {
      trackH = track.clientHeight;
      thumbH = Math.max(MIN_THUMB, Math.round(trackH * vh / sh));
      thumb.style.height = thumbH + 'px';
    }
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
      /* a dash's length is its section's share of the page: the ladder keeps "how much there is" */
      const len = secs.map((s, i) => (i + 1 < secs.length ? secs[i + 1].top : sh) - s.top);
      const most = Math.max(1, ...len);
      secs.forEach((s, i) => {
        s.w = Math.round(8 + 12 * Math.max(0, len[i]) / most);
        links[i].style.setProperty('--w', s.w + 'px');
        marks[i].style.setProperty('--w', Math.round(s.w / 2) + 'px');   // touch: 4–10 px, inside the gutter
      });
    }
    cur = -1;
    update();
  }

  function setMode(m: Mode) {
    if (m !== 'rungs') setOpen(false);
    mode = m;
    nav.hidden = m !== 'rungs';
    plain.hidden = m !== 'plain';
    /* a scroller with sections showing the plain variant gets its own contents list back */
    o.flat.classList.toggle('rail-flat', secs.length >= 2 && m !== 'rungs');
  }

  function update() {
    raf = 0;
    const y = Math.min(max, Math.max(0, getY()));
    if (mode === 'plain') {
      thumb.style.transform = `translateY(${max ? Math.round((trackH - thumbH) * y / max) : 0}px)`;
      return;
    }
    if (mode !== 'rungs') return;
    let i = 0;
    secs.forEach((s, j) => { if (s.start <= y + 0.5) i = j; });
    if (y >= max - 1) i = secs.length - 1;
    const s = secs[i];
    const f = y >= max - 1 ? 1 : Math.min(1, Math.max(0, (y - s.start) / Math.max(1, s.end - s.start)));
    if (i !== cur) {
      cur = i;
      links.forEach((a, j) => {
        a.classList.toggle('on', j === i);
        a.classList.toggle('done', j < i);
        if (j === i) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        marks[j].classList.toggle('on', j === i);
        marks[j].classList.toggle('done', j < i);
      });
      btn.setAttribute('aria-label', `On this page: ${secs[i].label}, ${i + 1} of ${secs.length}`);
    }
    links[i].style.setProperty('--f', f.toFixed(3));
    marks[i].style.setProperty('--f', f.toFixed(3));
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

  /* the pointer's place on the ladder, mapped between section starts: a drag scrubs section by section */
  function ladder(clientY: number) {
    const top = links[0].getBoundingClientRect().top;
    const fy = Math.min(secs.length - 0.001, Math.max(0, (clientY - top) / ROW));
    const i = Math.floor(fy), t = fy - i, s = secs[i];
    return s.start + (s.end - s.start) * t;
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

  /* ---------- drag: the ladder scrubs section by section, the plain track in proportion ---------- */
  let drag: { id: number; y0: number; s0: number; on: boolean; plain: boolean; grab: number } | null = null;
  let swallow = false;
  nav.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    drag = { id: e.pointerId, y0: e.clientY, s0: getY(), on: false, plain: false, grab: 0 };
  });
  /* the plain track: a press on the thumb holds it where it was taken; a press on the track goes there
     (smooth, or instant under reduced motion) and a drag from there follows the pointer */
  const fromTrack = (clientY: number, grab: number) => {
    const r = track.getBoundingClientRect();
    const room = Math.max(1, trackH - thumbH);
    return Math.min(max, Math.max(0, (clientY - r.top - grab) / room * max));
  };
  plain.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch' || mode !== 'plain') return;
    e.preventDefault();
    const t = thumb.getBoundingClientRect();
    const onThumb = e.clientY >= t.top && e.clientY <= t.bottom;
    drag = { id: e.pointerId, y0: e.clientY, s0: getY(), on: false, plain: true, grab: onThumb ? e.clientY - t.top : thumbH / 2 };
    plain.setPointerCapture(e.pointerId);
    plain.classList.add('is-drag');
    if (!onThumb) setY(fromTrack(e.clientY, drag.grab), reduce() ? 'instant' : 'smooth');
  });
  const move = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      if (Math.abs(e.clientY - drag.y0) < DRAG) return;
      drag.on = true;
      if (!drag.plain) {
        nav.setPointerCapture(e.pointerId);
        nav.classList.add('is-drag');
        setOpen(true);
      }
      root.classList.add('rail-grab');
      getSelection()?.removeAllRanges();
    }
    e.preventDefault();
    setY(drag.plain ? fromTrack(e.clientY, drag.grab) : ladder(e.clientY), 'instant');
  };
  nav.addEventListener('pointermove', move);
  plain.addEventListener('pointermove', move);
  const end = (e?: Event) => {
    if (!drag) return;
    const was = drag.on;
    drag = null;
    plain.classList.remove('is-drag');
    if (!was) return;
    swallow = true;
    setTimeout(() => { swallow = false; }, 0);
    nav.classList.remove('is-drag');
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

/* ---------- colour: every lit dash keeps ≥ 3:1 on the ground (research §5: Eat Map rose at a fixed
   rest opacity fell to 2.4:1). The dashes behind you keep each accent's hue and chroma and lower only its
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
