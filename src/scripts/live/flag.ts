/* The opt-in switch for live frames (ADR-0009, proposed): the owner A/Bs the frame engine on the
   live site. `?live` (or `?live=1`, `?live=force`) turns it on and remembers it in this browser,
   `?live=0` turns it off again; without either, the remembered choice decides. Off is the default,
   and then nothing of the engine is loaded: this file is all the default path carries. */
const KEY = 'edk-live';
const q = new URLSearchParams(location.search).get('live');

function decide(): boolean {
  try {
    if (q === '0' || q === 'off') { localStorage.removeItem(KEY); return false; }
    if (q !== null) { localStorage.setItem(KEY, '1'); return true; }
    return localStorage.getItem(KEY) === '1';
  } catch {
    return q !== null && q !== '0' && q !== 'off';
  }
}

export const liveOn = decide();
/** The slots that the engine drives: the Home object and the Home showcase (Recto's fan). */
export const LIVE_SLOTS = new Set(['home', 'showcase']);
export function liveOff() {
  try { localStorage.removeItem(KEY); } catch {}
  const u = new URL(location.href);
  u.searchParams.set('live', '0');
  location.replace(u);
}
