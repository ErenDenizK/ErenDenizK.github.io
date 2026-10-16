/* The person's part (design spec §3.4): the ID card and the postcards, loaded when the part comes near. */
import { initIdCard } from './idcard';
import { initPostcards } from './postcards';

export function initRest() {
  initIdCard();
  initPostcards();
}
