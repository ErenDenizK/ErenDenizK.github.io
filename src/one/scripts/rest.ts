/* The person's part (spec v2 §3.5 to §3.7): its interactive pieces, loaded when the part comes near.
   The ID card runs from its own component script (IdCard.astro, card3d.ts). */
import { initPostcards } from './postcards';
import { initTracks } from './tracks';
import { initMedia } from '../../scripts/media';

export function initRest() {
  initTracks();
  initPostcards();
  const rec = document.getElementById('record');
  if (rec) initMedia(rec);
}
