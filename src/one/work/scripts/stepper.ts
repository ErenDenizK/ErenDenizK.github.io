/* The steps of a presentation, scrubbed by the scroll (spec v2 §3.4; owner's review 2026-10-16, O3:
   not "scroll a bit, the image does not change, scroll more, it jumps to the second image").

   Wide windows with motion: a sticky stage (the index row, the window, the step text). Each step owns
   70 % of a view of scroll. Around each boundary a transition window of 45 % of a step plays as a pure
   function of the scroll position: the next screen slides up over the last (translateY 100 % to 0)
   while the last moves back (up 4 %, scale 0.95, darkening to 45 %); the text rolls over (the old lines
   leave by the exit rise in the first third, the new lines rise in their masks in the second); the index rule
   glides between the two labels and the label inks follow. Between windows the screen pushes in slowly
   (scale 1 to 1.025), so no span is dead. Scrolling back plays it all backwards.

   Elsewhere (phones, reduced motion, no JavaScript) the steps stay a list; on phones each screen rises
   by its own view timeline in CSS. The rail beads of the steps are .st-mark elements, placed here at the
   scroll offset where each step is the one shown. A clip step plays the signature clip while it is the
   one shown (one video at a time); the hero's clip yields to it. */
import { motion } from './bus';
import { onFirstFrame } from './frame';

export interface Stepper { update(): void; destroy(): void; yieldTo(v: HTMLVideoElement): void }

const STEP = 0.7;     // views of scroll per step
const WIN = 0.45;     // the transition window, as a share of a step
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = (t: number) => clamp(t) * clamp(t);

export function initStepper(sec: HTMLElement | null, scroller: HTMLElement | Window): Stepper | null {
  if (!sec) return null;
  const items = [...sec.querySelectorAll<HTMLElement>('.st')];
  const shots = items.map((el) => el.querySelector<HTMLElement>('.st-shot')!);
  const dims = items.map((el) => el.querySelector<HTMLElement>('.st-dim'));
  const txts = items.map((el) => [...el.querySelectorAll<HTMLElement>('.st-txt > .st-ln > *')]);
  const idx = [...sec.querySelectorAll<HTMLElement>('.st-idx li')];
  const rule = sec.querySelector<HTMLElement>('.st-rule');
  const marks = [...sec.querySelectorAll<HTMLElement>('.st-mark')];
  const n = items.length;
  const wide = matchMedia('(min-width: 900px)');
  let pinned = false, other: HTMLVideoElement | null = null, playing = -1, raf = 0;
  let top = 0, vh = innerHeight, labels: { x: number; w: number }[] = [];
  const ac = new AbortController();
  const getY = () => (scroller instanceof Window ? scrollY : scroller.scrollTop);
  const last = new Map<Element, string>();
  const put = (el: HTMLElement | null, k: 'transform' | 'opacity' | 'color', v: string) => {
    if (!el) return;
    const key = k + v;
    if (last.get(el) === key && k !== 'color') return;
    last.set(el, key);
    el.style[k] = v;
  };

  const video = (k: number) => items[k]?.querySelector<HTMLVideoElement>('.st-video') ?? null;
  function play(k: number) {
    if (k === playing) return;
    playing = k;
    items.forEach((_, i) => { const v = video(i); if (v && i !== k) { v.pause(); v.classList.remove('on'); } });
    const v = video(k);
    if (!v || motion() !== 'full') return;
    other?.pause();
    if (v.querySelector('source[data-src]')) { v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; s.removeAttribute('data-src'); }); v.load(); }
    onFirstFrame(v, () => v.classList.add('on'));
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  /* layout: on resize and mode change only */
  function measure() {
    vh = innerHeight;
    const sr = sec!.getBoundingClientRect();
    const base = scroller instanceof Window ? 0 : scroller.getBoundingClientRect().top;
    top = sr.top - base + getY();
    const row = sec!.querySelector<HTMLElement>('.st-idx');
    const rr = row?.getBoundingClientRect();
    labels = idx.map((li) => { const r = li.getBoundingClientRect(); return { x: r.left - (rr?.left ?? 0), w: r.width }; });
    /* the rail's beads: where each step is the one shown */
    marks.forEach((m, k) => {
      const y = pinned ? k * STEP * vh : (items[k].getBoundingClientRect().top - sr.top);
      m.style.top = `${Math.round(y)}px`;
    });
    last.clear();
  }
  function mode() {
    pinned = wide.matches && motion() === 'full' && n > 1;
    sec!.classList.toggle('pinned', pinned);
    sec!.style.setProperty('--st-len', String(STEP));
    /* the held stage shows screens that lazy loading would never reach: load them now */
    if (pinned) sec!.querySelectorAll<HTMLImageElement>('.st-img').forEach((im) => (im.loading = 'eager'));
    if (!pinned) {
      for (const el of [...shots, ...dims, ...txts.flat()]) if (el) { el.style.transform = ''; el.style.opacity = ''; }
      items.forEach((el) => { el.style.visibility = ''; el.style.zIndex = ''; });
      if (rule) rule.style.transform = '';
      idx.forEach((el) => (el.style.color = ''));
    }
    measure();
    update();
  }

  function frame() {
    raf = 0;
    if (!pinned) return;
    const s = clamp((getY() - top) / (STEP * vh), 0, n - 1);
    const win = (k: number) => smooth((s - (k + 0.5 - WIN / 2)) / WIN);        // boundary k -> k+1
    const roll = (k: number) => (s - (k + 0.5 - WIN / 2)) / (WIN / 3);           // first third of it
    let shown = 0;
    for (let i = 0; i < n; i++) {
      const a = i === 0 ? 1 : win(i - 1);          // arrival of step i
      const b = i === n - 1 ? 0 : win(i);          // departure of step i
      if (a >= 0.5 && b < 0.5) shown = i;
      const vis = a > 0 && b < 1;
      items[i].style.visibility = vis ? 'visible' : 'hidden';
      items[i].style.zIndex = String(i + 1);
      if (!vis) continue;
      const q = clamp((s - (i - 0.5 + WIN / 2)) / (1 - WIN));    // the slow push-in between windows
      const sc = (1 + 0.025 * q) * (1 - 0.05 * b);
      put(shots[i], 'transform', `translate3d(0, ${((1 - a) * 100 - 4 * b).toFixed(2)}%, 0) scale(${sc.toFixed(4)})`);
      put(dims[i], 'opacity', (0.45 * b).toFixed(3));
      /* the text: the old lines leave over the first third of the window, the new ones rise over the
         second, so two texts never share the place */
      const tin = i === 0 ? 1 : easeOut(roll(i - 1) - 1);
      const tout = i === n - 1 ? 0 : easeIn(roll(i));
      txts[i].forEach((el, j) => {
        const d = j * 0.06;
        const ti = i === 0 ? 1 : easeOut(roll(i - 1) - 1 - d * 3);
        put(el, 'transform', `translate3d(0, ${((1 - ti) * 112 - tout * 30).toFixed(1)}%, 0) skewY(${((1 - ti) * 4).toFixed(2)}deg)`);
        put(el, 'opacity', (Math.min(tin, 1) * (1 - tout)).toFixed(3));
      });
    }
    /* the index rule glides between the labels; the label inks follow */
    const k = Math.min(n - 2, Math.max(0, Math.floor(s - 0.5 + WIN / 2)));
    const t = n > 1 ? win(k) : 0;
    const A = labels[k], B = labels[k + 1] ?? labels[k];
    if (rule && A && B) put(rule, 'transform', `translate3d(${(A.x + (B.x - A.x) * t).toFixed(1)}px, 0, 0) scaleX(${(A.w + (B.w - A.w) * t).toFixed(1)})`);
    idx.forEach((el, i) => {
      const on = i === k ? 1 - t : i === k + 1 ? t : 0;
      put(el, 'color', `color-mix(in srgb, var(--ink) ${(on * 100).toFixed(0)}%, var(--ink-3))`);
    });
    play(shown);
  }
  function update() { if (!raf) raf = requestAnimationFrame(frame); }

  idx.forEach((el, k) => el.addEventListener('click', () => {
    scroller.scrollTo({ top: top + k * STEP * vh + (k ? 2 : 0), behavior: 'smooth' });
  }, { signal: ac.signal }));
  /* the list form: a clip step plays while most of it is in view */
  const io = new IntersectionObserver((es) => { if (pinned) return; for (const e of es) { const k = items.indexOf(e.target as HTMLElement); if (e.isIntersecting) { playing = -1; play(k); } else video(k)?.pause(); } },
    { root: scroller instanceof Window ? null : scroller, threshold: 0.6 });
  items.forEach((el, k) => { if (video(k)) io.observe(el); });
  (scroller instanceof Window ? window : scroller).addEventListener('scroll', update, { passive: true, signal: ac.signal });
  addEventListener('resize', mode, { passive: true, signal: ac.signal });
  const ro = new ResizeObserver(() => { measure(); update(); });
  ro.observe(sec);
  mode();
  return {
    update,
    destroy() { ac.abort(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); },
    yieldTo(v) { other = v; },
  };
}
