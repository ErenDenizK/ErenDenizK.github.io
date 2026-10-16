/* Which light the field shows (design spec §4.4): the set of the section whose box crosses the middle
   of the view (a 10 % band), the deepest one where sections nest (a Record strip inside the person's
   part). The next section's first pigment glows at the lower edge (spec §3.2). Holds from PART B
   (bus.ts) freeze the choice while the deck sets the light itself. The drift pauses with the tab. */
import { setAura, held, pigmentsOf, pauseField, motion, type Pigments } from './bus';

const root = document.documentElement;

export function initField() {
  const secs = [...document.querySelectorAll<HTMLElement>('[data-aura]')];
  if (!secs.length) return;
  /* every section also carries its pigments as --s1..3, for the still twin's pools (field.css) */
  for (const s of secs) {
    const p = pigmentsOf(s);
    if (p && !s.style.getPropertyValue('--s1')) p.forEach((c, i) => s.style.setProperty(`--s${i + 1}`, c));
  }
  const inBand = new Set<HTMLElement>();
  let current: HTMLElement | null = null;

  const pick = () => {
    const live = [...inBand].filter((s) => ![...inBand].some((o) => o !== s && s.contains(o)));
    const next = live.at(-1) ?? current ?? secs[0];
    if (next === current && !held()) return apply(next);
    current = next;
    apply(next);
  };
  const apply = (s: HTMLElement) => {
    if (held()) return;
    const p = pigmentsOf(s);
    if (p) setAura(p);
    /* the next section's light, the first one after this whole section in document order */
    const after = secs.find((o) => !s.contains(o) && !o.contains(s) && (s.compareDocumentPosition(o) & Node.DOCUMENT_POSITION_FOLLOWING));
    const n = after && pigmentsOf(after);
    root.style.setProperty('--n1', n ? n[0] : (p as Pigments | null)?.[2] ?? '#121214');
    root.style.setProperty('--n-o', n ? '0.18' : '0');
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) inBand.add(e.target as HTMLElement); else inBand.delete(e.target as HTMLElement);
    }
    pick();
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  secs.forEach((s) => io.observe(s));
  document.addEventListener('one:release', () => current && apply(current));

  /* first paint: the brief's light, at once */
  setAura(pigmentsOf(secs[0])!, { ms: 0 });
  requestAnimationFrame(() => root.style.removeProperty('--aura-t'));

  const vis = () => pauseField(root.dataset.fieldPause === '1');
  document.addEventListener('visibilitychange', vis);
  if (motion() === 'reduced') root.classList.add('field-paused');
}
