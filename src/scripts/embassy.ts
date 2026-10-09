/* The embassy's two moving things (docs/design/family.md §3.1), both paused unless they can be seen:
   - the product's light field (docs/family-kit/light.css markup, written at build time): a drifting field
     runs only while its band is on screen, the tab is visible and motion is welcome (light.md rules 6-7,
     the same conditions light.js mountField() uses); an "event" field brightens once when the band first
     arrives and settles back within its world's settle time; a still field never moves;
   - the signature clip: sources are set only when it is in view and motion is welcome, it plays once and
     rests on its poster, it gives way when it leaves the view or the tab hides, and it takes the page's
     one video slot from the object stage (media research §8.7: at most one playing video).
   Works on the project page and on the copy of the article the sheet shows; the sheet calls the
   returned cleanup when it changes or closes. */
import { reduce, motionOK, mq } from './env';
import { api as Media } from './media';

export function initEmbassy(root: ParentNode): () => void {
  const offs: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('.emb').forEach((band) => {
    const field = band.querySelector<HTMLElement>('.kl-field');
    if (field) offs.push(light(band, field));
    band.querySelectorAll<HTMLElement>('[data-clip]').forEach((c) => offs.push(clip(c)));
  });
  return () => offs.forEach((f) => f());
}

function light(band: HTMLElement, field: HTMLElement) {
  const behaviour = field.dataset.klBehaviour;
  let onScreen = false, arrived = false;
  const update = () => {
    field.dataset.klStill = String(reduce());
    field.dataset.klRunning = String(behaviour === 'drift' && !reduce() && onScreen && document.visibilityState === 'visible');
  };
  const pulse = () => {
    if (behaviour !== 'event' || arrived || reduce() || !field.animate) return;
    arrived = true;
    const [boost, settle] = (field.dataset.event || '1.25,4').split(',').map(Number);
    const cap = +getComputedStyle(field).getPropertyValue('--kl-cap') || 0.3;
    field.animate([{ opacity: Math.min(1, cap * boost) }, { opacity: cap }], { duration: Math.min(5, settle) * 1000, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  };
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      onScreen = e.isIntersecting;
      /* the arrival: the band's light is in a fifth of the view */
      if (e.isIntersecting && e.intersectionRect.height > innerHeight * 0.2) pulse();
    }
    update();
  }, { threshold: [0, 0.05, 0.1, 0.2, 0.3] });
  io.observe(band);
  document.addEventListener('visibilitychange', update);
  mq.reduce.addEventListener?.('change', update);
  update();
  return () => { io.disconnect(); document.removeEventListener('visibilitychange', update); mq.reduce.removeEventListener?.('change', update); };
}

function clip(fig: HTMLElement) {
  const v = fig.querySelector<HTMLVideoElement>('video');
  if (!v) return () => {};
  let played = false, inView = false;
  const stop = () => {
    fig.classList.remove('is-playing');
    try { v.pause(); } catch {}
    Media.yieldVideo?.(v);
  };
  const start = () => {
    if (played || !inView || !motionOK() || document.hidden || Media.refused?.()) return;
    played = true;
    if (!v.getAttribute('src') && !v.querySelector('source[src]')) {
      v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; });
      v.load();
    }
    Media.claimVideo?.(v);
    v.currentTime = 0;
    v.play().then(() => {
      const on = () => { if (!v.paused) fig.classList.add('is-playing'); };
      if ('requestVideoFrameCallback' in v) (v as any).requestVideoFrameCallback(on);
      else requestAnimationFrame(() => requestAnimationFrame(on));
    }, () => { fig.classList.remove('is-playing'); });   // refused: the poster stays, silently
  };
  /* played once: the clip ends and rests on its poster (it fades back to it) */
  v.addEventListener('ended', () => { fig.classList.remove('is-playing'); Media.yieldVideo?.(v); });
  v.addEventListener('pause', () => fig.classList.remove('is-playing'));
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      inView = e.isIntersecting && e.intersectionRatio >= 0.6;
      if (inView) start();
      else if (e.intersectionRatio < 0.2) { if (!v.paused) stop(); played = false; }   // out of view: next time it plays again
    }
  }, { threshold: [0, 0.2, 0.6, 1] });
  io.observe(fig);
  const vis = () => { if (document.hidden) stop(); };
  document.addEventListener('visibilitychange', vis);
  return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis); stop(); };
}
