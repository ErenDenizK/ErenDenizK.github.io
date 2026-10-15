/* The steps of a presentation (phase3 design-spec.md 3.3.4, part 3). Wide windows with motion: the
   steps pin in the middle of the view and change in time (not scrubbed) when the next step's threshold,
   every 90 % of a screen, crosses the middle of the view. Elsewhere they stay a list. A clip step plays
   the signature clip while it is shown (one video at a time); the hero's clip yields to it. */
import { motion } from './bus';

export interface Stepper { update(): void; destroy(): void; yieldTo(v: HTMLVideoElement): void }

export function initStepper(sec: HTMLElement | null, scroller: HTMLElement | Window): Stepper | null {
  if (!sec) return null;
  const items = [...sec.querySelectorAll<HTMLElement>('.st')];
  const idx = [...sec.querySelectorAll<HTMLElement>('.st-idx li')];
  const n = items.length;
  const wide = matchMedia('(min-width: 900px)');
  let active = -1, pinned = false, other: HTMLVideoElement | null = null;
  const ac = new AbortController();

  const video = (k: number) => items[k]?.querySelector<HTMLVideoElement>('.st-video') ?? null;
  function play(k: number) {
    items.forEach((_, i) => { const v = video(i); if (v && i !== k) { v.pause(); v.classList.remove('on'); } });
    const v = video(k);
    if (!v || motion() !== 'full') return;
    other?.pause();
    if (v.querySelector('source[data-src]')) { v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; s.removeAttribute('data-src'); }); v.load(); }
    v.addEventListener('playing', () => v.classList.add('on'), { once: true });
    v.currentTime = 0;
    v.play().catch(() => {});
  }
  function set(k: number) {
    if (k === active) return;
    const was = active;
    active = k;
    items.forEach((el, i) => { el.classList.toggle('on', i === k); el.classList.toggle('was', i === was && was >= 0); });
    idx.forEach((el, i) => el.classList.toggle('on', i === k));
    play(k);
  }
  function mode() {
    pinned = wide.matches && motion() === 'full' && n > 1;
    sec!.classList.toggle('pinned', pinned);
    if (!pinned) { items.forEach((el) => el.classList.remove('on', 'was')); active = -1; }
    update();
  }
  function update() {
    if (!pinned) return;
    const vh = innerHeight;
    const progress = -sec!.getBoundingClientRect().top;
    set(Math.max(0, Math.min(n - 1, Math.floor((progress + 0.5 * vh) / (0.9 * vh)))));
  }
  idx.forEach((el, k) => el.addEventListener('click', () => {
    const r = sec.getBoundingClientRect();
    const y = (scroller instanceof Window ? scrollY : scroller.scrollTop) + r.top + (0.9 * k - 0.5) * innerHeight + (k ? 2 : 0) + (k ? 0 : 0.5 * innerHeight);
    scroller.scrollTo({ top: y, behavior: 'smooth' });
  }, { signal: ac.signal }));
  /* the list form: a clip step plays while most of it is in view */
  const io = new IntersectionObserver((es) => { if (pinned) return; for (const e of es) { const k = items.indexOf(e.target as HTMLElement); if (e.isIntersecting) play(k); else video(k)?.pause(); } },
    { root: scroller instanceof Window ? null : scroller, threshold: 0.6 });
  items.forEach((el) => { if (video(items.indexOf(el))) io.observe(el); });
  if (scroller instanceof Window) addEventListener('scroll', update, { passive: true, signal: ac.signal });
  addEventListener('resize', mode, { passive: true, signal: ac.signal });
  mode();
  return {
    update,
    destroy() { ac.abort(); io.disconnect(); },
    yieldTo(v) { other = v; },
  };
}
