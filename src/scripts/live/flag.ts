/* The opt-in switch for live frames (ADR-0009, proposed; the owner chose pre-rendered media on
   2026-10-11 and the engine stays an experiment). It is on for one page load only: `?live` (or
   `?live=1`) in this URL turns it on, on wide screens or a fine pointer; a phone (coarse pointer on a
   narrow screen) needs `?live=force`. Nothing is remembered: a visit with `?live` once stuck in
   localStorage and showed the chip on later visits (owner's iPhone, 2026-10-11), so an old stored
   flag is cleared here. Off is the default, and then nothing of the engine is loaded: this file is
   all the default path carries. */
const OLD_KEY = 'edk-live';
const q = new URLSearchParams(location.search).get('live');
try { localStorage.removeItem(OLD_KEY); } catch {}

function decide(): boolean {
  if (q === null || q === '0' || q === 'off') return false;
  if (q === 'force') return true;
  const phone = !matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(min-width: 900px)').matches;
  return !phone;
}

export const liveOn = decide();
/** The slots that the engine drives: the Home object and the Home showcase (Recto's fan). */
export const LIVE_SLOTS = new Set(['home', 'showcase']);
/** The chip's "Turn off": the same page without the flag. */
export function liveOff() {
  const u = new URL(location.href);
  u.searchParams.delete('live');
  location.replace(u);
}
