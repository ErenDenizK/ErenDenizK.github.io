/* The person's part (spec v2 §3.5, §3.6): its interactive pieces, loaded when the part comes near. The
   ID card runs from its own component script (IdCard.astro, card3d.ts). */
import { initPostcards } from './postcards';

export function initRest() {
  initPostcards();
}
