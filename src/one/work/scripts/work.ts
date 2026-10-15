/* Work's entry (PART B of phase3 design-spec.md). Home: the deck and the open / close. The static
   project page: its steps, its hero clip, and Close going back when it came from Home. */
import { initDeck } from './deck';
import { initOpen } from './open';
import { initStepper } from './stepper';
import { motion } from './bus';
import { spin } from './loops';

export function initWork() {
  const sec = document.getElementById('work');
  if (!sec || sec.dataset.ready) return;
  sec.dataset.ready = '1';
  initOpen(sec, initDeck(sec));
}

export function initStatic() {
  const pres = document.querySelector<HTMLElement>('.pres-page');
  if (!pres) return;
  const steps = initStepper(pres.querySelector('[data-steps]'), window);
  spin(pres.querySelector<HTMLElement>('.hero-object'), matchMedia('(max-width: 699.98px)').matches);
  const v = pres.querySelector<HTMLVideoElement>('.hero-video');
  if (v && motion() === 'full') {
    setTimeout(() => {
      v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; s.removeAttribute('data-src'); });
      v.load();
      v.addEventListener('playing', () => v.classList.add('on'), { once: true });
      v.addEventListener('ended', () => v.classList.remove('on'), { once: true });
      v.play().catch(() => {});
      steps?.yieldTo(v);
    }, 600);
  }
  /* Close: back to Home when Home sent us here (one history step), else the link itself */
  pres.querySelector<HTMLAnchorElement>('[data-close]')?.addEventListener('click', (e) => {
    try {
      if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
    } catch { /* follow the link */ }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') pres.querySelector<HTMLAnchorElement>('[data-close]')?.click(); });
}
