/* Work's side of the A/B interface (phase3 design-spec.md 7.5): PART A's bus, plus the layer events that
   Work fires and PART A answers (inert #main, the field paused, the rail hidden). */
export { setAura, hold, release, pauseField, motion } from '../../scripts/bus';

/** one:layer-open / one:layer-close on document, with the project's slug (PART A answers both) */
export function emit(type: 'one:layer-open' | 'one:layer-close', slug: string) {
  document.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { slug } }));
}
