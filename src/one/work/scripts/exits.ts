/* The ways out of an opened project (spec v3 §4, review row T15: visitors did not find the exit). One
   language with the photo view: the labelled close capsule that folds to the cross, Escape (open.ts), a
   close cursor over the empty space beside the hero on fine pointers, and on touch a pull past the top or
   the end of the layer that fills a ring around the cross and closes at 96 px.
   The fold: the close starts as cross, "Close" and an esc key cap; after the first close of the session,
   the first scroll in the layer or 4 s it folds to the cross alone, and later opens start folded. */
import { motion } from './bus';

const KEY = 'one-close-folded';
const PULL = 96;          // px of finger travel that closes (the ring is full here)
const BAND = 120;         // the rubber band's reach: the layer never moves more than this
const FOLD_MS = 4000;
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const band = (d: number) => (BAND * d) / (d + BAND);

export function wasFolded() { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } }
export function rememberFold() { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked: the fold is only a convenience */ } }

export interface Exits { destroy(): void }

export function initExits(l: HTMLElement, back: () => void): Exits {
  const ac = new AbortController();
  const passive = { passive: true, signal: ac.signal };
  const caps = l.querySelector<HTMLElement>('[data-caps]');
  const inner = l.querySelector<HTMLElement>('.pb-in');
  const fold = () => caps?.classList.add('folded');
  const foldT = window.setTimeout(fold, FOLD_MS);
  l.addEventListener('scroll', () => { if (l.scrollTop > 8) fold(); }, passive);

  /* ---- the close cursor: over the empty space of the hero's band, a glass disc with the cross ---- */
  let cur: HTMLElement | null = null;
  if (fine()) {
    cur = document.createElement('div');
    cur.className = 'cursor-x';
    cur.setAttribute('aria-hidden', 'true');
    const icon = l.querySelector('.cap-xi .icon')?.cloneNode(true);
    if (icon) cur.append(icon);
    const lb = document.createElement('b');
    lb.textContent = 'Close';
    cur.append(lb);
    l.append(cur);
    const head = l.querySelector<HTMLElement>('.pt');
    const empty = (e: PointerEvent) => {
      const t = e.target as Element;
      /* the side prints count as empty space: they are still pictures beside the hero, and at 1440 they fill
         most of the margin, which left the close cursor almost no room (round 3 critique) */
      if (!head || t.closest('a, button, .hero, .pt-obj, .pt-head > :not(.hush), .facts > *, .caps, .rail, .rail-plain')) return false;
      const r = head.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return false;
      /* never over the text column, where the pointer reads */
      return Math.abs(e.clientX - innerWidth / 2) > 340;
    };
    let on = false;
    l.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const v = empty(e);
      if (v !== on) { on = v; l.classList.toggle('cur-x', v); }
      if (v) cur!.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, passive);
    l.addEventListener('pointerleave', () => { on = false; l.classList.remove('cur-x'); }, passive);
    l.addEventListener('click', (e) => {
      if (!on || e.button !== 0 || e.defaultPrevented) return;
      e.preventDefault();
      back();
    }, { signal: ac.signal });
  }

  /* ---- touch: pull past the top or the end; the ring around the cross shows how close the close is ---- */
  let y0 = 0, dir = 0, d = 0, atTop = false, atEnd = false;
  const setPull = (px: number) => {
    d = px;
    if (inner) inner.style.transform = px ? `translateY(${dir * band(px)}px)` : '';
    caps?.style.setProperty('--pull', String(Math.min(100, (px / PULL) * 100)));
    caps?.classList.toggle('armed', px >= PULL);
  };
  if (!fine() && motion() === 'full' && inner) {
    l.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { dir = 2; return; }
      y0 = e.touches[0].clientY;
      atTop = l.scrollTop <= 0;
      atEnd = l.scrollTop >= l.scrollHeight - l.clientHeight - 1;
      dir = 0;
    }, passive);
    l.addEventListener('touchmove', (e) => {
      if (dir === 2 || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - y0;
      if (!dir) {
        if (atTop && dy > 6) dir = 1;
        else if (atEnd && dy < -6) dir = -1;
        else if (Math.abs(dy) > 6) { dir = 2; return; }
        else return;
      }
      setPull(Math.max(0, dir * dy - 6));
    }, passive);
    const end = () => {
      if (dir !== 1 && dir !== -1) { dir = 0; return; }
      if (d >= PULL) { fold(); back(); return; }
      const from = inner.style.transform;
      setPull(0);
      if (from) inner.animate([{ transform: from }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      dir = 0;
    };
    l.addEventListener('touchend', end, passive);
    l.addEventListener('touchcancel', end, passive);
  }

  return {
    destroy() {
      ac.abort();
      clearTimeout(foldT);
      cur?.remove();
      l.classList.remove('cur-x');
    },
  };
}
