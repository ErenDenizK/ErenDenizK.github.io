/* Work's capture reels (ADR-0014; components/Reel.astro). On wide windows tall enough for a pinned stage
   (html.reel-on, set by an inline script on the page before the chapters paint), each chapter is taller
   than the window and its stage is sticky; this only reads the scroll position and shows the step it
   has reached (half a step is the switch point). The ticks go to a step by scrolling the page there, so
   the browser keeps owning the scroll, Back and keyboard paging. A clip step plays its video once while
   it is shown, motion is welcome and the tab is visible, taking the page's one video slot from the
   object stage (media.ts), and rests on its poster. Reduced motion: steps swap without a fade (CSS) and
   clips keep their posters. Below the threshold the reel is the list of framed screens. */
import { root, mq, reduce, motionOK } from './env';
import { api as Media } from './media';

const MIN_H = 640;
const wanted = () => mq.wide.matches && innerHeight >= MIN_H && !matchMedia('(forced-colors: active)').matches;

type Reel = { el: HTMLElement; stage: HTMLElement; shots: HTMLElement[]; ticks: HTMLButtonElement[]; n: number; cur: number };

export function initReels() {
  const reels: Reel[] = [...document.querySelectorAll<HTMLElement>('.w-proj.has-reel')].map((el) => {
    const shots = [...el.querySelectorAll<HTMLElement>('.w-shot')];
    return { el, stage: el.querySelector<HTMLElement>('.w-stage')!, shots, ticks: [...el.querySelectorAll<HTMLButtonElement>('.w-tick')], n: shots.length, cur: 0 };
  });
  if (!reels.length) return;

  const barH = () => parseFloat(getComputedStyle(root).getPropertyValue('--bar-h')) || 84;
  const stepPx = (r: Reel) => (r.n > 1 ? (r.el.offsetHeight - r.stage.offsetHeight) / (r.n - 1) : 0);
  const on = () => root.classList.contains('reel-on');
  /* a chapter whose text column is taller than its pinned stage (a very short window, a long text) is not
     pinned: it shows its framed screens as a list beside the text, which stays in view on its own */
  const pinned = (r: Reel) => on() && !r.el.classList.contains('no-pin');
  function fit() {
    for (const r of reels) {
      r.el.classList.remove('no-pin');
      if (!on()) continue;
      const text = r.el.querySelector<HTMLElement>('.w-text');
      const cs = getComputedStyle(r.stage);
      const room = r.stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (text && text.offsetHeight > room + 1) r.el.classList.add('no-pin');
    }
  }

  function show(r: Reel, i: number) {
    if (i === r.cur) return;
    r.cur = i;
    r.shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
    r.ticks.forEach((t, k) => (k === i ? t.setAttribute('aria-current', 'step') : t.removeAttribute('aria-current')));
  }

  /* ---- the clip: once per showing ---- */
  const played = new WeakSet<HTMLElement>();
  function stopClip(fig: HTMLElement) {
    const v = fig.querySelector<HTMLVideoElement>('video.w-clip');
    if (!v) return;
    fig.classList.remove('is-playing');
    if (!v.paused) { try { v.pause(); } catch {} }
    Media.yieldVideo?.(v);
    played.delete(fig);
  }
  function playClip(fig: HTMLElement) {
    const v = fig.querySelector<HTMLVideoElement>('video.w-clip');
    if (!v || played.has(fig) || !motionOK() || document.hidden || Media.refused?.()) return;
    played.add(fig);
    if (!v.querySelector('source[src]')) {
      v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; });
      v.load();
      v.addEventListener('ended', () => { fig.classList.remove('is-playing'); Media.yieldVideo?.(v); });
      v.addEventListener('pause', () => fig.classList.remove('is-playing'));
    }
    Media.claimVideo?.(v);
    try { v.currentTime = 0; } catch {}
    v.play().then(() => {
      const lit = () => { if (!v.paused) fig.classList.add('is-playing'); };
      if ('requestVideoFrameCallback' in v) (v as any).requestVideoFrameCallback(lit);
      else requestAnimationFrame(() => requestAnimationFrame(lit));
    }, () => fig.classList.remove('is-playing'));   // refused: the poster stays
  }

  let raf = 0;
  function update() {
    raf = 0;
    if (root.classList.contains('sheet-open')) return;
    const top = barH(), mid = innerHeight / 2;
    for (const r of reels) {
      const box = r.el.getBoundingClientRect();
      const step = stepPx(r);
      const i = pinned(r) && step > 0 ? Math.max(0, Math.min(r.n - 1, Math.round((top - box.top) / step))) : 0;
      show(r, i);
      const inView = box.top <= mid && box.bottom > mid;
      r.shots.forEach((fig, k) => {
        if (!fig.classList.contains('is-clip')) return;
        if (pinned(r) && k === r.cur && inView) playClip(fig); else stopClip(fig);
      });
    }
  }
  const soon = () => { if (!raf) raf = requestAnimationFrame(update); };

  /* a row of screens that scrolls inside itself (phones) is a named region the keyboard can reach and
     scroll; a row that does not overflow is no tab stop */
  function rows() {
    for (const r of reels) {
      const row = r.el.querySelector<HTMLElement>('.w-screens');
      if (!row) continue;
      const scrolls = row.scrollWidth > row.clientWidth + 1;
      if (scrolls) {
        row.tabIndex = 0; row.setAttribute('role', 'region');
        row.setAttribute('aria-label', `${r.el.querySelector('.w-title')?.textContent?.trim() ?? ''} screens`);
      } else { row.removeAttribute('tabindex'); row.removeAttribute('role'); row.removeAttribute('aria-label'); }
    }
  }

  function mode() {
    const want = wanted();
    if (want !== on()) root.classList.toggle('reel-on', want);
    fit();
    rows();
    reels.forEach((r) => r.el.querySelector<HTMLElement>('.w-ticks')?.toggleAttribute('hidden', !pinned(r)));
    soon();
  }

  reels.forEach((r) => r.ticks.forEach((t, k) => t.addEventListener('click', () => {
    const step = stepPx(r);
    const y = r.el.getBoundingClientRect().top + scrollY - barH() + k * step + 1;
    scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' });
  })));

  addEventListener('scroll', soon, { passive: true });
  addEventListener('resize', mode, { passive: true });
  document.fonts?.ready.then(mode);   // the wordmarks' faces change the column's height
  addEventListener('pageshow', soon);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reels.forEach((r) => r.shots.forEach((f) => f.classList.contains('is-clip') && stopClip(f)));
    else soon();
  });
  mode();
}
