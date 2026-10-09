/* Shared client conditions. Moving media only when motion is welcome and the connection can carry it
   (media research §8.6); ?still forces stills everywhere. */
export const root = document.documentElement;
export const params = new URLSearchParams(location.search);
export const mq = {
  wide: matchMedia('(min-width: 900px)'),
  reduce: matchMedia('(prefers-reduced-motion: reduce)'),
  fine: matchMedia('(hover: hover) and (pointer: fine)'),
};
export const reduce = () => mq.reduce.matches;
const conn = (navigator as any).connection || {};
const saveData = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
export const motionOK = () => !reduce() && !saveData && !params.has('still');
export const base = root.dataset.base || '/';
/** Path relative to the base, without slashes at either end: "work/recto". */
export function rel(pathname: string): string {
  let p = pathname;
  if (p.startsWith(base)) p = p.slice(base.length);
  return p.replace(/^\/+|\/+$/g, '');
}
export const idle = (f: () => void) => ((window as any).requestIdleCallback || ((g: () => void) => setTimeout(g, 600)))(f, { timeout: 2500 });
