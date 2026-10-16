/* Lines in masks (spec v2 §2.1, motion contract rule 9; scene.css). Each [data-lines] element holds
   plain text. After the fonts have loaded, its words are measured and regrouped into one mask per line
   (.ln > .ln-i, the line's index as --i), so a heading rises line by line as a function of its scene's
   --sp. The split is done again when the element's width changes. Screen readers read the same words
   (aria-label keeps the sentence whole). Under reduced motion or ?still nothing is split. */
import { motion } from './bus';

export function initLines(scope: ParentNode = document) {
  if (motion() === 'reduced') return;
  const els = [...scope.querySelectorAll<HTMLElement>('[data-lines]')].filter((el) => !el.children.length || el.dataset.linesText);
  if (!els.length) return;
  const split = (el: HTMLElement) => {
    const text = (el.dataset.linesText ??= el.textContent!.trim().replace(/\s+/g, ' '));
    el.setAttribute('aria-label', text);
    const words = text.split(' ');
    el.replaceChildren(...words.flatMap((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      s.setAttribute('aria-hidden', 'true');
      return i ? [document.createTextNode(' '), s] : [s];
    }));
    const lines: string[][] = [];
    let top = -Infinity;
    for (const s of el.querySelectorAll('span')) {
      const t = (s as HTMLElement).offsetTop;
      if (t > top + 2) { lines.push([]); top = t; }
      lines[lines.length - 1].push(s.textContent!);
    }
    el.replaceChildren(...lines.map((l, i) => {
      const ln = document.createElement('span');
      ln.className = 'ln';
      ln.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'ln-i';
      inner.style.setProperty('--i', String(i));
      inner.textContent = l.join(' ');
      ln.append(inner);
      return ln;
    }));
  };
  const widths = new WeakMap<HTMLElement, number>();
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement, w = Math.round(e.contentRect.width);
      if (widths.get(el) === w) continue;
      widths.set(el, w);
      split(el);
    }
  });
  document.fonts.ready.then(() => els.forEach((el) => ro.observe(el)));
}
