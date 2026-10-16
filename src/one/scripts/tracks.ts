/* How I work's drops (spec v2 §3.5.3; Tracks.astro). Each drop travels an offset path measured from
   the laid-out figure: down its lane's line, then (side by side) round the U to the middle and down
   into the node, or (stacked, phones) the hand's drop down its own line and the agents' drop down its
   line and into the node. The paths are measured again when the figure's size changes. The drops run
   only while the figure is on screen (class .on). Reduced motion: nothing runs (the CSS holds a drop
   at the top of each line). */
import { motion } from './bus';

export function initTracks(root: ParentNode = document) {
  if (motion() === 'reduced' || !CSS.supports('offset-path', 'path("M0 0")')) return;
  for (const fig of root.querySelectorAll<HTMLElement>('[data-tracks]')) mount(fig);
}

function mount(fig: HTMLElement) {
  const lanes = [...fig.querySelectorAll<HTMLElement>('.tr-lane')];
  const node = fig.querySelector<HTMLElement>('.tr-node');
  if (lanes.length !== 2 || !node) return;
  const route = () => {
    const f = fig.getBoundingClientRect();
    const box = (e: HTMLElement) => { const r = e.getBoundingClientRect(); return { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height }; };
    const [a, b] = lanes.map(box), n = box(node);
    const nx = n.x + n.w / 2, ny = n.y + n.h / 2;
    const ax = a.x + 4, bx = b.x + 4;
    const f1 = (v: number) => v.toFixed(1);
    let r0: string, r1: string;
    if (Math.abs(ax - bx) < 2) {
      /* stacked: the hand's drop down its line; the agents' drop down its line and into the node */
      r0 = `M${f1(ax)} ${f1(a.y + 8)} V${f1(a.y + a.h)}`;
      r1 = `M${f1(bx)} ${f1(b.y + 4)} V${f1(ny)}`;
    } else {
      /* side by side: down the line, round the U (radius 26) to the middle, down into the node */
      const ub = a.y + a.h + 34, R = 26, mid = (ax + bx) / 2;
      r0 = `M${f1(ax)} ${f1(a.y + 8)} V${f1(ub - R)} A${R} ${R} 0 0 0 ${f1(ax + R)} ${f1(ub)} H${f1(mid)} V${f1(ny)}`;
      r1 = `M${f1(bx)} ${f1(b.y + 8)} V${f1(ub - R)} A${R} ${R} 0 0 1 ${f1(bx - R)} ${f1(ub)} H${f1(mid)} V${f1(ny)}`;
      void nx;
    }
    fig.style.setProperty('--r0', `path("${r0}")`);
    fig.style.setProperty('--r1', `path("${r1}")`);
    fig.classList.add('routed');
  };
  new ResizeObserver(route).observe(fig);
  document.fonts.ready.then(route);
  new IntersectionObserver((es) => fig.classList.toggle('on', es[0].isIntersecting), { rootMargin: '10% 0px' }).observe(fig);
}
