/* The contents ladder (brief §7, 2026-10-09 late: concept B; ADR-0011; research
   docs/research/2026-10-scroll-rail.md §4 B). One dash per section at the right edge, where the native
   scrollbar was. The current dash fills as you read through its section; the dashes behind you stay lit
   in their own section's colour, the ones ahead are quiet, and each dash's length is its section's share
   of the page, so the ladder still says how much is left (the weakness §4 B names). Hover opens the
   titles; a click goes there; a drag along the dashes scrubs section by section.

   Scrolling is never taken over: the rail reads scrollY and writes it only while dragged. The page opts
   in at build time (<html data-rail>, layouts/Base.astro) and the head script hides the native bar
   before first paint only without forced colours (html.rail-on for a fine pointer, html.rail-touch
   otherwise); without JavaScript and in forced colours the platform's own scrollbar stays.
   Touch (phones and tablets, brief §7 2026-10-10 "bring the ladder to phones too"; ADR-0011 item 12):
   html.rail-touch. Native scrolling stays; the platform's indicator is hidden so it never draws over the
   ladder (iOS honours scrollbar-width on the root). The ladder is a slim column of short dashes inside
   the right gutter, drawn by one 44 px button. A tap opens the titles as a small sheet beside it (44 px
   rows); a title goes there and closes it, as do a tap outside, Escape and the button again. No hover
   and no drag on touch. Sections are data in the markup: [data-rail-sec] (the label, or the element's
   text) and the h2s with ids inside [data-rail-heads]; [data-rail-accent] gives the colour. A
   page with fewer than two sections or under a quarter screen of overflow gets no rail, and the native
   bar comes back. */
import { root, reduce, mq } from './env';

const READ = 0.3;          // the reading line: a section is current once its top passes 30% of the window
const ROW = 28;            // one dash per 28 px row; each row is a link at least 24 px tall (WCAG 2.5.8)
const TMARK = 10;          // touch: one 2 px dash and its 8 px gap per section in the closed ladder
const DRAG = 4;            // pointer travel before a press becomes a scrub
const GROUND: RGB = [10, 10, 11];
const PAST = 4.5;          // contrast the lit dashes behind you keep against the ground (≥ 3:1, 1.4.11)
type RGB = [number, number, number];

interface Sec { el: HTMLElement; label: string; a: string; ar: string; top: number; start: number; end: number; w: number }

export function initRail() {
  if (!root.hasAttribute('data-rail')) return;
  const nodes = [...document.querySelectorAll<HTMLElement>('[data-rail-sec], [data-rail-heads] h2[id]')];
  const main = document.getElementById('main');
  if (nodes.length < 2 || !main) { off(); return; }

  const nav = document.createElement('nav');
  nav.className = 'rail';
  nav.id = 'rail';
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
  btn.setAttribute('aria-controls', 'rail-sheet');
  const sheet = document.createElement('div');
  sheet.className = 'rail-sheet';
  sheet.id = 'rail-sheet';
  sheet.append(list, foot);
  nav.append(sheet, btn);
  main.before(nav);

  const pageAccent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ddd6cb';
  const minutes = +(document.querySelector<HTMLElement>('[data-rail-minutes]')?.dataset.railMinutes ?? 0);
  const secs: Sec[] = nodes.map((el, i) => {
    if (!el.id) el.id = 'rail-s-' + i;
    const accent = el.closest<HTMLElement>('[data-rail-accent]')?.dataset.railAccent || pageAccent;
    const rgb = resolve(accent, nav);
    return { el, label: (el.dataset.railSec || el.textContent || '').trim(), a: css(rgb), ar: css(rest(rgb)), top: 0, start: 0, end: 0, w: 12 };
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

  let vh = 0, max = 0, cur = -1, raf = 0, shown = false;

  function measure() {
    vh = innerHeight;
    const sh = document.documentElement.scrollHeight;
    max = Math.max(0, sh - vh);
    /* touch: the closed ladder is what has to fit (the open sheet scrolls itself). Once iOS has hidden its
       indicator for this tab it does not bring it back (WebKit turns it off and never on again), so the
       ladder must not go away just because a phone was turned on its side. */
    const fits = max > vh * 0.25 && (touch() ? secs.length * TMARK + 28 : secs.length * ROW) + 160 < vh;
    if (!fits || !qualifies()) { hide(); return; }
    show();
    const y = scrollY;
    secs.forEach((s) => { s.top = s.el.getBoundingClientRect().top + y; });
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
    cur = -1;
    update();
  }

  function update() {
    raf = 0;
    if (!shown) return;
    const y = Math.min(max, Math.max(0, scrollY));
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
    foot.textContent = minutes
      ? (p >= 0.99 ? 'At the end' : `About ${Math.max(1, Math.ceil(minutes * (1 - p)))} min left`)
      : `${Math.round(p * 100)}% down the page`;
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

  function show() {
    root.classList.toggle('rail-on', !touch());
    root.classList.toggle('rail-touch', touch());
    if (shown) return;
    shown = true; nav.hidden = false;
  }
  function hide() { shown = false; nav.hidden = true; setOpen(false); off(); }

  /* going to a section: smooth, or instant under reduced motion; a keyboard press also moves focus there */
  function go(i: number, keyboard: boolean) {
    const el = secs[i].el;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = i === 0 ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - Math.max(margin, barOffset()));
    scrollTo({ top, behavior: reduce() ? 'instant' : 'smooth' });
    if (keyboard) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }
  function barOffset() { return (parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) || 84) + 24; }

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

  /* ---------- drag ---------- */
  let drag: { id: number; y0: number; s0: number; on: boolean } | null = null;
  let swallow = false;
  nav.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    drag = { id: e.pointerId, y0: e.clientY, s0: scrollY, on: false };
  });
  nav.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      if (Math.abs(e.clientY - drag.y0) < DRAG) return;
      drag.on = true;
      nav.setPointerCapture(e.pointerId);
      nav.classList.add('is-drag');
      setOpen(true);
      root.classList.add('rail-grab');
      getSelection()?.removeAllRanges();
    }
    e.preventDefault();
    scrollTo({ top: ladder(e.clientY), behavior: 'instant' });
  });
  const end = (e?: Event) => {
    if (!drag) return;
    const was = drag.on;
    drag = null;
    if (!was) return;
    swallow = true;
    setTimeout(() => { swallow = false; }, 0);
    nav.classList.remove('is-drag');
    root.classList.remove('rail-grab');
    if (e && e.type === 'pointerup' && !nav.matches(':hover')) setOpen(false);
  };
  nav.addEventListener('pointerup', end);
  nav.addEventListener('pointercancel', end);
  nav.addEventListener('lostpointercapture', end);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drag?.on) { scrollTo({ top: drag.s0, behavior: 'instant' }); end(); }
  });
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
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && touch() && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
  });
  nav.addEventListener('keydown', (e) => {
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -2;
    if (to === -2) return;
    e.preventDefault();
    links[Math.max(0, Math.min(links.length - 1, to))].focus();
  });

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(main);
  const recheck = () => { setOpen(false); if (qualifies()) measure(); else hide(); };
  mq.fine.addEventListener?.('change', recheck);
  forced.addEventListener?.('change', recheck);
  measure();
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
