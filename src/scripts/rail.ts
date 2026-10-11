/* The rail: one custom scrollbar on every page and in the project sheet (ADR-0013, revising ADR-0011; its
   amendments of 2026-10-10 and 2026-10-11). The owner, 2026-10-11: "No native scrollbar anywhere; custom
   everywhere. [...] design something simpler and aesthetic." Four simple looks share one engine, chosen by
   html[data-rail] (the head script in layouts/Base.astro reads a temporary ?rail=a|b|c|d switch; ADR-0013
   amendment 2026-10-11, research docs/research/2026-10-rail-design.md):

   a  Beads (the owner's sketch): one mark per section in a short column, the sections behind you small
      dots, the ones ahead short dashes, the current one a long line that fills as you read it. A page
      without sections is split into its screens.
   b  Hairline: a 1 px line and a 2 px segment on it, the share in view. Nothing else is drawn; the line
      itself rests faint and wakes while the page moves. Sections show only as titles.
   c  Scale: a column of 1 px ticks, 6 px apart, with a needle at the place you are; the ticks around the
      needle lengthen like a lens. A section's first tick is longer.
   d  Segments: the line broken into one segment per section, each as long as its section; the ones behind
      you are lit, the current one fills to where you are.

   Whatever the look: scrolling is never taken over (the rail reads the scroll position and writes it only
   while dragged); a drag follows the pointer in proportion, a press goes there, Escape during a drag puts
   the page back; on desktop hover or focus opens the section titles beside the marks; on touch a scroller
   with sections is one 44 px button whose tap opens the titles as a small sheet, and without sections the
   rail is only drawn. The native bar is hidden on every page before first paint (html.rail-on for a fine
   pointer, html.rail-touch otherwise, never in forced colours), so the page never shifts sideways; without
   JavaScript and in forced colours the platform's own scrollbar stays. Sections are data in the markup:
   [data-rail-sec] (the label, or the element's text) and the h2s with ids inside [data-rail-heads];
   [data-rail-accent] gives the colour. The project sheet has its own rail (scripts/sheet.ts). */
import { root, reduce, mq } from './env';

const READ = 0.3;          // the reading line: a section is current once its top passes 30% of the view
const ROW = 28;            // one title per 28 px row at least; each row is a link at least 24 px tall (WCAG 2.5.8)
const TMARK = 8;           // touch: the least room one mark needs on the track
const DRAG = 4;            // pointer travel before a press on a title becomes a drag
const MIN_THUMB = 24;      // the shortest thumb (b)
const TICK = 6;            // c: one tick every 6 px
const LENS = 11;           // c: the lens's radius (px, the Gaussian's width)
const GAP = 4;             // d: the gap between two segments
const MIN_SEG = 8;         // d: the shortest segment
const SCREENS = [2, 6];    // a: a page without sections gets one bead per screen, between these
const GROUND: RGB = [10, 10, 11];
const PAST = 4.5;          // contrast the lit marks behind you keep against the ground (≥ 3:1, 1.4.11)
type RGB = [number, number, number];
type Mode = 'rungs' | 'plain' | 'none';
export type Look = 'a' | 'b' | 'c' | 'd';
export const LOOKS: Look[] = ['a', 'b', 'c', 'd'];
export const look = (): Look => (LOOKS.includes(root.dataset.rail as Look) ? root.dataset.rail as Look : 'a');

interface Sec { el: HTMLElement; label: string; a: string; ar: string; top: number; start: number; end: number }
/** what a mark stands for: a section, or (a page without sections, looks a and d) a stretch of the page */
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
  chooser();
}

/* The temporary switch (ADR-0013 amendment 2026-10-11): only a visitor who opened a page with ?rail= sees
   it, as four small links in the bottom-left corner, so the owner can compare the looks on a phone. It goes
   when the choice is made. */
function chooser() {
  let chosen = false;
  try { chosen = !!sessionStorage.getItem('edk-rail'); } catch { /* storage blocked: no switch */ }
  if (!chosen || !(root.classList.contains('rail-on') || root.classList.contains('rail-touch'))) return;
  const box = document.createElement('nav');
  box.className = 'rail-pick';
  box.setAttribute('aria-label', 'Scrollbar look (prototype)');
  const names: Record<Look, string> = { a: 'Beads', b: 'Hairline', c: 'Scale', d: 'Segments' };
  for (const l of LOOKS) {
    const a = document.createElement('a');
    const u = new URL(location.href);
    u.searchParams.set('rail', l);
    a.href = u.pathname + u.search + u.hash;
    a.textContent = l.toUpperCase();
    a.title = names[l];
    a.setAttribute('aria-label', names[l]);
    if (l === look()) a.setAttribute('aria-current', 'true');
    box.append(a);
  }
  document.body.append(box);
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
  const L = look();

  /* ---------- the bar: one track and one thumb (the thumb is b's segment and c's needle) ---------- */
  const bar = () => {
    const track = document.createElement('div');
    track.className = 'rail-track';
    const thumb = document.createElement('i');
    thumb.className = 'rail-thumb';
    track.append(thumb);
    return { track, thumb };
  };

  /* ---------- with sections: the bar, its marks and the titles beside it ---------- */
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
    ladderBar.track.append(m);
    marks.push(m);
    return a;
  });
  /* the titles are only built where there are sections to mark */
  if (secs.length >= 2) o.host.insertBefore(nav, plain);
  plainBar.track.style.setProperty('--thumb', css(pageRGB));

  let vh = 0, max = 0, cur = -1, raf = 0, mode: Mode = 'none', trackH = 0, thumbH = 0;
  let units: Unit[] = [];
  let ticks: { m: HTMLElement; y: number; s: number }[] = [];
  const vmarks: HTMLElement[] = [];

  function measure() {
    if (!qualifies() || !(root.classList.contains('rail-on') || root.classList.contains('rail-touch'))) { setMode('none'); return; }
    vh = viewH();
    const sh = fullH();
    max = Math.max(0, sh - vh);
    if (!vh) { setMode('none'); return; }       // not laid out (a closed dialog)
    /* the marks get a row each beside the track (on touch only a mark: the open sheet scrolls itself) */
    const barH = Math.min(innerHeight * 0.44, 320);   // --rail-h
    const fits = secs.length >= 2 && max > vh * 0.25 && secs.length * (touch() ? TMARK : ROW) <= barH;
    setMode(fits ? 'rungs' : max > 8 ? 'plain' : 'none');
    if (mode === 'none') return;
    const { track, thumb } = active();
    trackH = L === 'a' ? barH : track.clientHeight;
    thumbH = Math.max(MIN_THUMB, Math.round(trackH * vh / sh));
    thumb.style.height = L === 'b' ? thumbH + 'px' : '';

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
    } else if (L === 'a' || L === 'd') {
      /* no sections: a stretches the page into its screens, d draws one segment */
      const n = L === 'd' ? 1 : Math.max(SCREENS[0], Math.min(SCREENS[1], Math.round(sh / vh)));
      while (vmarks.length < n) vmarks.push(mark('var(--thumb)', 'var(--thumb-r)'));
      vmarks.forEach((m, i) => { if (i < n) { if (m.parentElement !== plainBar.track) plainBar.track.append(m); } else m.remove(); });
      plainBar.track.style.setProperty('--thumb-r', css(rest(pageRGB)));
      units = vmarks.slice(0, n).map((m, i) => ({ start: max * i / n, end: max * (i + 1) / n, m }));
    } else units = [];

    layout(track);
    if (mode === 'rungs') titles(barH);
    cur = -1;
    update();
  }

  /* where each look puts its marks; returns nothing, but leaves y (row centre for the titles) on each unit */
  const ys: number[] = [];
  function layout(track: HTMLElement) {
    ys.length = 0;
    if (L === 'b') {
      const room = Math.max(0, trackH - thumbH);
      units.forEach((u) => { const y = max ? Math.round(room * u.start / max) : 0; u.m.style.setProperty('--y', y + 'px'); ys.push(y + 1); });
    } else if (L === 'c') {
      units.forEach((u) => { const y = max ? Math.round((trackH - 1) * u.start / max) : 0; u.m.style.setProperty('--y', y + 'px'); ys.push(y); });
      /* the ticks: rebuilt when the height changes */
      const n = Math.floor((trackH - 1) / TICK) + 1;
      if (ticks.length !== n || ticks[0]?.m.parentElement !== track) {
        ticks.forEach((t) => t.m.remove());
        ticks = [];
        const step = (trackH - 1) / (n - 1);
        for (let i = 0; i < n; i++) {
          const m = document.createElement('i');
          m.className = 'rail-k';
          const y = Math.round(i * step);
          m.style.setProperty('--y', y + 'px');
          track.prepend(m);
          ticks.push({ m, y, s: -1 });
        }
      }
      /* a section's tick takes the place of the scale's tick beside it */
      for (const t of ticks) t.m.hidden = ys.some((y) => Math.abs(y - t.y) < TICK / 2 + 0.5);
    } else if (L === 'd') {
      /* each segment as long as its section's stretch of scrolling, at least MIN_SEG, with GAP between */
      const n = units.length, avail = trackH - GAP * (n - 1);
      const raw = units.map((u) => (max ? (u.end - u.start) / max : 1 / n) * avail);
      const small = raw.map((h) => h < MIN_SEG);
      const fixed = small.filter(Boolean).length * MIN_SEG, free = raw.reduce((t, h, i) => t + (small[i] ? 0 : h), 0);
      const k = free ? (avail - fixed) / free : 1;
      let y = 0;
      units.forEach((u, i) => {
        const h = small[i] ? MIN_SEG : raw[i] * k;
        u.m.style.setProperty('--y', Math.round(y) + 'px');
        u.m.style.setProperty('--h', Math.round(y + h) - Math.round(y) + 'px');
        ys.push(Math.round(y) + 1);
        y += h + GAP;
      });
    } else {
      /* a: the beads are a flex column centred on the track (rail.css); its titles are centred on it */
      const mid = trackH / 2;
      units.forEach((_, i) => ys.push(mid + (i - (units.length - 1) / 2) * ROW));
    }
  }

  /* the titles beside the marks: each row level with its mark, pushed apart to one row where marks crowd and
     kept within half a row of the track's ends */
  function titles(barH: number) {
    const c = ys.slice();
    for (let i = 1; i < c.length; i++) c[i] = Math.max(c[i], c[i - 1] + ROW);
    if (c[c.length - 1] > barH) {
      c[c.length - 1] = barH;
      for (let i = c.length - 2; i >= 0; i--) c[i] = Math.min(c[i], c[i + 1] - ROW);
    }
    sheet.style.setProperty('--st', Math.round(c[0] - ROW / 2) + 'px');
    c.forEach((ci, i) => (links[i].parentElement as HTMLElement).style.setProperty('--mt', i ? Math.max(0, Math.round(ci - c[i - 1] - ROW)) + 'px' : '0px'));
  }

  function setMode(m: Mode) {
    if (m !== 'rungs') setOpen(false);
    mode = m;
    nav.hidden = m !== 'rungs';
    plain.hidden = m !== 'plain';
    /* a scroller with sections showing the bar alone gets its own contents list back */
    o.flat.classList.toggle('rail-flat', secs.length >= 2 && m !== 'rungs');
  }

  let liveT = 0;
  function update() {
    raf = 0;
    if (mode === 'none') return;
    const y = Math.min(max, Math.max(0, getY()));
    const p = max ? y / max : 1;
    const { thumb } = active();
    if (L === 'b') thumb.style.transform = `translateY(${max ? Math.round((trackH - thumbH) * p) : 0}px)`;
    if (L === 'c') {
      /* the needle and the lens around it: continuous, so the lens glides between ticks */
      const yp = (trackH - 1) * p;
      thumb.style.transform = `translateY(${yp.toFixed(1)}px)`;
      for (const t of ticks) {
        const g = Math.exp(-(((t.y - yp) / LENS) ** 2));
        const s = Math.round(g * 100) / 100;
        if (s !== t.s) { t.s = s; t.m.style.setProperty('--g', String(s)); }
      }
      units.forEach((u) => { const g = Math.exp(-(((parseFloat(u.m.style.getPropertyValue('--y')) - yp) / LENS) ** 2)); u.m.style.setProperty('--g', g.toFixed(2)); });
    }
    /* the current unit, and how far into it */
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
        /* the thumb carries the current section's light */
        nav.style.setProperty('--thumb', secs[i].a);
        btn.setAttribute('aria-label', `On this page: ${secs[i].label}, ${i + 1} of ${secs.length}`);
      }
    }
    if (mode !== 'rungs') return;
    foot.textContent = o.minutes
      ? (p >= 0.99 ? 'At the end' : `About ${Math.max(1, Math.ceil(o.minutes * (1 - p)))} min left`)
      : `${Math.round(p * 100)}% down the page`;
  }
  /* awake while the scroller moves (b's line wakes; the others brighten a touch), resting a second after */
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

  /* ---------- drag: one behaviour for every look, as a scrollbar's. b: a press on the thumb holds it where
     it was taken and a drag follows in proportion. The others have no thumb to hold: the pointer's place
     along the marks is the place in the page. A press elsewhere goes there (smooth, or instant under
     reduced motion) and a drag continues from there; a click on a title goes to its section. Escape during
     a drag puts the page back. ---------- */
  let drag: { id: number; y0: number; s0: number; on: boolean; host: HTMLElement; grab: number } | null = null;
  let swallow = false;
  const fromTrack = (clientY: number, grab: number) => {
    const r = active().track.getBoundingClientRect();
    if (L !== 'b') return Math.min(max, Math.max(0, (clientY - r.top) / Math.max(1, r.height) * max));
    const room = Math.max(1, trackH - thumbH);
    return Math.min(max, Math.max(0, (clientY - r.top - grab) / room * max));
  };
  const press = (host: HTMLElement) => (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === 'touch' || mode === 'none') return;
    const t = active().thumb.getBoundingClientRect();
    const onThumb = L === 'b' && e.clientY >= t.top - 2 && e.clientY <= t.bottom + 2;
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
      clearTimeout(openT); clearTimeout(closeT); clearTimeout(liveT);
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
