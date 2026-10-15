/* Work's side of the A/B interface (phase3 design-spec.md 7.5). PART A owns src/one/scripts/bus.ts;
   until it lands, these calls use window.oneBus when PART A's shell publishes it, and otherwise drive the
   scratch lab's field directly (the light as --a1..--a3 on the root). When bus.ts exists, this file
   becomes: export { setAura, hold, release, pauseField, motion } from '../../scripts/bus'; plus emit(). */
type Pigments = [string, string, string];
interface Bus {
  setAura(p: Pigments, o?: { ms?: number }): void;
  hold(owner: string): void;
  release(owner: string): void;
  pauseField(paused: boolean): void;
  motion(): 'full' | 'reduced';
}
const shell = (): Bus | undefined => (window as unknown as { oneBus?: Bus }).oneBus;
const root = document.documentElement;
const held = new Set<string>();

export function setAura(p: Pigments, o: { ms?: number } = {}) {
  const b = shell();
  if (b) return b.setAura(p, o);
  root.style.setProperty('--lab-ms', `${o.ms ?? 500}ms`);
  root.style.setProperty('--a1', p[0]);
  root.style.setProperty('--a2', p[1]);
  root.style.setProperty('--a3', p[2]);
}
export function hold(owner: string) { const b = shell(); if (b) b.hold(owner); else held.add(owner); }
export function release(owner: string) { const b = shell(); if (b) b.release(owner); else held.delete(owner); }
export function pauseField(paused: boolean) { shell()?.pauseField(paused); }
export function motion(): 'full' | 'reduced' {
  const b = shell();
  if (b) return b.motion();
  return root.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]still\b/.test(location.search) ? 'reduced' : 'full';
}
/** one:layer-open / one:layer-close on document, with the project's slug (PART A answers both) */
export function emit(type: 'one:layer-open' | 'one:layer-close', slug: string) {
  document.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { slug } }));
}
