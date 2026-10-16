/* The shell's one entry (design spec §7.3): the field, the scroll reveal, the scroll driver, the rail,
   the clock, the person's part, and PART A's answers to PART B's layer events (§7.5). */
import { initField } from './field';
import { initArrive } from './arrive';
import { initScrub } from './scrub';
import { initTicker } from './ticker';
import { initScene } from './scene';
import { initLines } from './lines';
import { pauseField, motion } from './bus';
import { initRail } from '../../scripts/rail';
import { bloom } from './bloom';
import { initClock } from '../../scripts/clock';

const root = document.documentElement;

/* the one scroll source and clock first: everything scroll-linked subscribes to it (spec v2 §7) */
initTicker();
initField();
initScrub();
initScene();
initLines();
initArrive();
/* the rail's hold-to-scrub and bloom (review row V6, scripts/bloom.ts); the names keep the page's three parts.
   The person's part has no heading on the page and its first section is already "Eren", so it has no label;
   it stays a group of its own because Work stands between it and the brief. */
initRail({
  ext: bloom((el) => el.closest('#record') ? 'The record' : el.closest('#work') ? 'Work' : undefined),
});
initClock();

/* the quiet band under the bar, once the page has moved */
const moved = () => root.classList.toggle('moved', scrollY > 8);
addEventListener('scroll', moved, { passive: true });
moved();
/* an open project scrolls its own layer under the bar: the band follows the layer's scroll there */
document.addEventListener('scroll', (e) => {
  const t = e.target;
  if (t instanceof HTMLElement && t.classList.contains('layer')) root.classList.toggle('moved', t.scrollTop > 8);
}, { capture: true, passive: true });

/* PART B opens a project as a layer over Home: the field pauses, Home goes inert, the page rail hides */
const main = document.getElementById('main');
document.addEventListener('one:layer-open', () => {
  pauseField(true);
  main?.setAttribute('inert', '');
  root.classList.add('layer-open');
});
document.addEventListener('one:layer-close', () => {
  pauseField(false);
  main?.removeAttribute('inert');
  root.classList.remove('layer-open');
  moved();
});

/* the person's part loads its interactive pieces when it comes near */
const rest = document.querySelector('[data-part="rest"]');
if (rest) {
  const go = () => import('./rest').then((m) => m.initRest());
  const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '150% 0px' });
  io.observe(rest);
}

/* the footer's glass object: its idle loop plays only while it is on screen and motion is welcome */
const loop = document.querySelector<HTMLVideoElement>('video[data-loop]');
if (loop && motion() === 'full' && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
  new IntersectionObserver((e) => {
    if (e[0].isIntersecting) {
      if (loop.preload === 'none') { loop.preload = 'auto'; loop.load(); loop.addEventListener('playing', () => loop.classList.add('is-on'), { once: true }); }
      loop.play().catch(() => {});
    } else loop.pause();
  }, { rootMargin: '10% 0px' }).observe(loop);
}
