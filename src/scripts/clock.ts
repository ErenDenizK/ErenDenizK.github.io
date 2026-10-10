/* Istanbul and its time in the bar (brief, 2026-10-10: "the Istanbul + clock detail comes back"; site
   audit §7; prototype E). The bar's inline script writes the first value before first paint
   (components/Bar.astro); this keeps it on the minute, and catches up when the tab comes back. Local
   Istanbul time from the platform's time-zone data, 24-hour, two digits each: "14:05". */
const fmt = (() => {
  try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Istanbul' }); } catch { return null; }
})();

export function istanbulTime(d = new Date()) { return fmt ? fmt.format(d) : ''; }

export function initClock() {
  const times = [...document.querySelectorAll<HTMLTimeElement>('[data-clock] time')];
  if (!times.length || !fmt) return;
  let t = 0;
  const tick = () => {
    const s = istanbulTime();
    for (const el of times) if (el.textContent !== s) { el.textContent = s; el.dateTime = s; }
    clearTimeout(t);
    t = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);   // just after the next minute turns
  };
  tick();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}
