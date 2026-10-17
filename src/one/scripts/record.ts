/* The Record's pages (ADR-0019; record-language §5). The layout already runs the shell (the field, the rail,
   the glass, the clock, the quiet band); this file adds what only the Record has: the recorder in its head
   (scripts/media.ts: float, lean, press clip), the project filter from about forty entries (log.ts), the
   copy-link button and the essay's contents list that follows the reading position. */
import { initMedia } from '../../scripts/media';
import { initLog } from '../../scripts/log';

const head = document.querySelector<HTMLElement>('.rh');
if (head) initMedia(head);
initLog();

/* the arrival (record.css, html.rec-in): the head plays once per load; a page restored from the
   back/forward cache keeps its finished state */
const root = document.documentElement;
if (root.classList.contains('motion')) requestAnimationFrame(() => root.classList.add('rec-in'));
else root.classList.add('rec-in');

/* Copy link on entry pages: shown only where the clipboard exists */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => {
  if (!navigator.clipboard) return;
  b.hidden = false;
  b.addEventListener('click', () => {
    navigator.clipboard.writeText(b.dataset.copy!).then(() => {
      b.classList.add('copied');
      b.querySelector('.copy-l')!.textContent = 'Copied';
      setTimeout(() => { b.classList.remove('copied'); b.querySelector('.copy-l')!.textContent = 'Copy link'; }, 1800);
    }).catch(() => {});
  });
});

/* Essay pages: the contents list follows the reading position */
{
  const links = [...document.querySelectorAll('.post-toc ol a')];
  const heads = links.map((a) => document.getElementById(decodeURIComponent((a.getAttribute('href') || '').slice(1)))).filter(Boolean) as HTMLElement[];
  if (heads.length) addEventListener('scroll', () => {
    let on = -1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 160) on = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === on));
  }, { passive: true });
}
