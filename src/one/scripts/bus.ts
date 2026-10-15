/* The interface between PART A (the shell) and PART B (Work), design spec §7.5. PART B imports only this
   module and reads the data attributes PART A renders; PART A answers B's layer events. */
const root = document.documentElement;
const holds = new Set<string>();
export type Pigments = [string, string, string];
let last: Pigments | null = null;

/** Light the field with three pigments. ms: the cross-fade (default: the section change, 1100 ms). */
export function setAura(pigments: Pigments, o: { ms?: number } = {}): void {
  const ms = motion() === 'reduced' ? 0 : o.ms;
  if (ms !== undefined) root.style.setProperty('--aura-t', `${ms}ms`); else root.style.removeProperty('--aura-t');
  if (last && last.every((c, i) => c === pigments[i])) return;
  last = pigments;
  pigments.forEach((c, i) => root.style.setProperty(`--a${i + 1}`, c));
  root.style.setProperty('--accent', pigments[0]);
  document.dispatchEvent(new CustomEvent('one:aura', { detail: { pigments } }));
}
/** The pigments the field shows now (null before the first section is read). */
export const aura = (): Pigments | null => last;

/** While any owner holds the field, PART A's section observer does not change the aura (B holds it
    while the deck is pinned and sets the project's light itself). */
export function hold(owner: string): void { holds.add(owner); }
export function release(owner: string): void {
  if (!holds.delete(owner)) return;
  if (!holds.size) document.dispatchEvent(new CustomEvent('one:release'));
}
export const held = (): boolean => holds.size > 0;

/** Stop or restart the drift (an open layer has its own light). */
export function pauseField(paused: boolean): void { root.classList.toggle('field-paused', paused || document.hidden); root.dataset.fieldPause = paused ? '1' : ''; }

/** 'reduced' under prefers-reduced-motion or ?still (set before first paint: html.still). */
export const motion = (): 'full' | 'reduced' => (root.classList.contains('still') ? 'reduced' : 'full');

/** Parse data-aura="a1 a2 a3". */
export function pigmentsOf(el: Element): Pigments | null {
  const p = (el.getAttribute('data-aura') || '').trim().split(/\s+/);
  return p.length === 3 && p.every((c) => /^#[0-9a-f]{3,8}$/i.test(c)) ? (p as Pigments) : null;
}
