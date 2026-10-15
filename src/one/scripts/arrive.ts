/* Arrive one by one (design spec §4.2): whatever starts below 85 % of the view waits at rest-minus-a-rise
   and plays once when its top passes that line. Text rises 12 px; images, prints and cards 24 px with a
   scale from 0.97 (base.css). Siblings in one [data-arrive-group] are --step apart, at most four in a
   row. Nothing above the line ever hides, so a reload in the middle of the page shows it at once; no
   motion means no wait at all (html.still). Never inside a Record reading column. */
import { motion } from './bus';

export function initArrive(scope: ParentNode = document) {
  if (motion() === 'reduced' || !('IntersectionObserver' in window)) return;
  const els = [...scope.querySelectorAll<HTMLElement>('[data-arrive]')];
  for (const g of scope.querySelectorAll<HTMLElement>('[data-arrive-group]')) {
    [...g.querySelectorAll<HTMLElement>('[data-arrive]')].forEach((el, i) => el.style.setProperty('--i', String(i % 4)));
  }
  const line = innerHeight * 0.85;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      el.classList.add('in');
      el.classList.remove('pre');
      io.unobserve(el);
      /* after the reveal the element holds no transition, so later state changes are not delayed */
      el.addEventListener('transitionend', () => { el.classList.remove('in'); el.removeAttribute('data-arrive'); }, { once: true });
    }
  }, { rootMargin: '0px 0px -15% 0px' });
  for (const el of els) {
    if (el.getBoundingClientRect().top <= line) continue;
    el.classList.add('pre');
    io.observe(el);
  }
}
