/* The temporary switch between About's photo presentations (components/Photo.astro): ?photos=1|2|3
   swaps each postcard for the chosen alternative from its <template>, and loads only that one's
   script. With ?photos in the address, a small bar at the foot of the window lets the owner move
   between the four on a phone. Removed once the owner has picked. */
import { params } from '../env';

const LOOKS = [
  { n: '0', name: 'Postcard' },
  { n: '1', name: 'Darkroom' },
  { n: '2', name: 'Proof' },
  { n: '3', name: 'Depth' },
];
const load: Record<string, () => Promise<{ init: (scope?: ParentNode) => void }>> = {
  '1': () => import('./darkroom'),
  '2': () => import('./proof'),
  '3': () => import('./depth'),
};

const look = params.get('photos') ?? '';
const slots = [...document.querySelectorAll<HTMLElement>('[data-photo]')];
if (slots.length && load[look]) {
  for (const slot of slots) {
    const t = slot.querySelector<HTMLTemplateElement>(`template[data-look="${look}"]`);
    if (!t) continue;
    slot.querySelector('.pc')?.remove();
    slot.prepend(t.content.cloneNode(true));
  }
  document.documentElement.dataset.photos = look;
  load[look]().then((m) => m.init(document));
}

if (slots.length && params.has('photos')) {
  const bar = document.createElement('nav');
  bar.className = 'ph-switch';
  bar.setAttribute('aria-label', 'Photo presentation (temporary)');
  for (const l of LOOKS) {
    const a = document.createElement('a');
    const u = new URL(location.href);
    u.searchParams.set('photos', l.n);
    a.href = u.pathname + u.search + u.hash;
    a.textContent = l.name;
    if ((load[look] ? look : '0') === l.n) a.setAttribute('aria-current', 'true');
    bar.append(a);
  }
  const css = document.createElement('style');
  css.textContent = `.ph-switch{position:fixed;z-index:60;left:50%;bottom:max(14px,env(safe-area-inset-bottom));translate:-50% 0;display:flex;gap:2px;padding:4px;border-radius:999px;
    background:rgba(18,17,16,.82);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:0 0 0 1px rgba(255,245,235,.08),0 10px 30px -10px rgba(0,0,0,.8);font:500 13px/1 var(--f-ui)}
    .ph-switch a{display:grid;place-items:center;min-height:36px;padding:0 13px;border-radius:999px;color:var(--ink-2);text-decoration:none;white-space:nowrap}
    .ph-switch a:hover{color:var(--ink)}.ph-switch a[aria-current]{background:rgba(243,184,134,.16);color:var(--about)}`;
  document.head.append(css);
  document.body.append(bar);
}
