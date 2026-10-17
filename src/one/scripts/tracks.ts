/* How I work's drops (spec v2 §3.5.3; Tracks.astro). Each drop travels a route measured from the
   laid-out figure: down its lane's line, then (side by side) round the U to the middle and down into the
   node, or (stacked, phones) the hand's drop down its own line and the agents' drop down its line and
   into the node. The routes are measured again when the figure's size changes. The drops run only while
   the figure is on screen (class .on) and no project layer is open. Reduced motion: nothing runs (the
   CSS holds a drop at the top of each line).

   Round six (review row S25): the drop was a rigid 64 px bar on offset-path with offset-rotate: auto,
   so at every corner the whole tail turned at once (the 90 degree snap), and on the U's 26 px radius the
   straight tail stuck out past the curve. Now the tail is the route itself: eight strokes of the same
   path, each a dash that ends at the head, longer ones fainter and thinner, so the tail bends exactly
   where the head went and tapers to a hair. The route has no corner left: the turn from the U's floor
   down into the node is an arc too. The tail's length follows the speed (a comet's tail): short where
   the drop leaves the top, longest at the fastest part of the fall, short again as it eases into the
   node. At the end the head rests in the node while the tail drains into it, and the node brightens. */
import { motion } from './bus';

const NS = 'http://www.w3.org/2000/svg';
/** the tail's strokes: from the longest and faintest to the shortest and brightest */
const LAYERS = 8;
/** the tail: a base length, px more per px/s of speed, and the most (the old comet was 64 px; the drops
    fall at 40 to 110 px/s, so the tail ranges from about 26 px at the ends to about 70 px mid-fall) */
const TAIL_BASE = 22, TAIL_K = 0.55, TAIL_MAX = 76;
/** a drop's cycle, as fractions of its period: travel, then the tail drains into the node, then rest */
const TRAVEL = 0.86, DRAIN = 0.05;

type Drop = { route: 0 | 1; T: number; ph: number; strong: number; pulse: HTMLElement | null; g: SVGGElement; tails: SVGPathElement[]; head: SVGCircleElement; halo: SVGCircleElement };

export function initTracks(root: ParentNode = document) {
  if (motion() === 'reduced') return;
  for (const fig of root.querySelectorAll<HTMLElement>('[data-tracks]')) mount(fig);
}

/** ease in and out (the fall accelerates down the line and eases into the node), and its slope */
const ease = (u: number) => u * u * (3 - 2 * u);
const slope = (u: number) => 6 * u * (1 - u);

function mount(fig: HTMLElement) {
  const lanes = [...fig.querySelectorAll<HTMLElement>('.tr-lane')];
  const node = fig.querySelector<HTMLElement>('.tr-node');
  if (lanes.length !== 2 || !node) return;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'tr-drops');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const routes = [0, 1].map(() => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'tr-route'); svg.append(p); return p; });
  const make = (route: 0 | 1, T: number, ph: number, strong: number, cls: string, pulse: HTMLElement | null = null): Drop => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `tr-drop ${cls}`);
    const tails = Array.from({ length: LAYERS }, (_, k) => {
      const p = document.createElementNS(NS, 'path');
      /* k = 0 is the longest: the thinnest and faintest; the last, shortest, is nearly the head's width */
      const f = (k + 1) / LAYERS;
      p.setAttribute('stroke-width', (0.8 + 4.4 * f * f).toFixed(2));
      p.style.opacity = (0.1 + 0.14 * f).toFixed(3);
      g.append(p);
      return p;
    });
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('r', '7');
    halo.setAttribute('class', 'tr-halo');
    const head = document.createElementNS(NS, 'circle');
    head.setAttribute('r', '3.6');
    head.setAttribute('class', 'tr-head');
    g.append(halo, head);
    svg.append(g);
    return { route, T, ph, strong, pulse, g, tails, head, halo };
  };
  /* the same clocks as before (Tracks.astro's node pulses keep them): 7.0 s and 5.6 s, a second,
     fainter drop on the agents' lane */
  const drops = [make(0, 7, -1.2, 1, 'd0', node.querySelector('.n0')), make(1, 5.6, -3.6, 1, 'd1', node.querySelector('.n1')), make(1, 5.6, -0.8, 0.55, 'd1b')];
  fig.append(svg);

  let len = [0, 0];
  const route = () => {
    const f = fig.getBoundingClientRect();
    const box = (e: HTMLElement) => { const r = e.getBoundingClientRect(); return { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height }; };
    const [a, b] = lanes.map(box), n = box(node);
    const ny = n.y + n.h / 2;
    const ax = a.x + 4, bx = b.x + 4;
    const f1 = (v: number) => v.toFixed(1);
    let r0: string, r1: string;
    if (Math.abs(ax - bx) < 2) {
      /* stacked: the hand's drop down its line; the agents' drop down its line and into the node */
      r0 = `M${f1(ax)} ${f1(a.y + 8)} V${f1(a.y + a.h)}`;
      r1 = `M${f1(bx)} ${f1(b.y + 4)} V${f1(ny)}`;
    } else {
      /* side by side: down the line, round the U (radius 26) along its floor, then a small arc (radius
         r) down into the node: no corner anywhere, so the tail never has to turn at once */
      const ub = a.y + a.h + 34, R = 26, mid = (ax + bx) / 2;
      const r = Math.max(4, Math.min(12, (ny - ub) * 0.8, (mid - ax - R) * 0.8));
      r0 = `M${f1(ax)} ${f1(a.y + 8)} V${f1(ub - R)} A${R} ${R} 0 0 0 ${f1(ax + R)} ${f1(ub)} H${f1(mid - r)} A${f1(r)} ${f1(r)} 0 0 1 ${f1(mid)} ${f1(ub + r)} V${f1(ny)}`;
      r1 = `M${f1(bx)} ${f1(b.y + 8)} V${f1(ub - R)} A${R} ${R} 0 0 1 ${f1(bx - R)} ${f1(ub)} H${f1(mid + r)} A${f1(r)} ${f1(r)} 0 0 0 ${f1(mid)} ${f1(ub + r)} V${f1(ny)}`;
    }
    routes[0].setAttribute('d', r0);
    routes[1].setAttribute('d', r1);
    len = routes.map((p) => p.getTotalLength());
    for (const d of drops) for (const t of d.tails) t.setAttribute('d', d.route ? r1 : r0);
    fig.classList.add('routed');
    draw(performance.now());
  };

  function place(d: Drop, now: number) {
    const L = len[d.route];
    if (!L) return;
    const T = d.T * 1000;
    const u = ((((now / 1000 - d.ph) * 1000) % T) + T) % T / T;
    let s: number, tail: number, a: number;
    if (d.pulse) {
      /* the node: dark until the drop is about to arrive, brightest just after, then it widens and fades */
      const k = u < TRAVEL - 0.02 ? 0 : u < TRAVEL + 0.03 ? (u - TRAVEL + 0.02) / 0.05 : 1 - (u - TRAVEL - 0.03) / (1 - TRAVEL - 0.03);
      const sc = u < TRAVEL + 0.03 ? 0.6 + 0.9 * k : 1.5 + 0.4 * (1 - k);
      d.pulse.style.opacity = Math.max(0, k).toFixed(3);
      d.pulse.style.transform = `scale(${sc.toFixed(3)})`;
    }
    if (u < TRAVEL) {
      const v = u / TRAVEL;
      s = ease(v) * L;
      const speed = (slope(v) * L) / (TRAVEL * d.T); // px/s
      tail = Math.min(s, TAIL_BASE + Math.min(TAIL_MAX - TAIL_BASE, speed * TAIL_K));
      a = Math.min(1, v / 0.07); // it gathers at the top of its line
    } else if (u < TRAVEL + DRAIN) {
      /* the head rests in the node; what is left of the tail drains into it */
      const v = (u - TRAVEL) / DRAIN;
      s = L;
      tail = TAIL_BASE * (1 - v) * (1 - v);
      a = 1 - ease(v);
    } else { d.g.style.opacity = '0'; return; }
    d.g.style.opacity = (a * d.strong).toFixed(3);
    for (let k = 0; k < LAYERS; k++) {
      const l = Math.max(0.01, (tail * (LAYERS - k)) / LAYERS);
      const p = d.tails[k];
      p.style.strokeDasharray = `${l.toFixed(2)} ${(L + l + 10).toFixed(1)}`;
      p.style.strokeDashoffset = (-(s - l)).toFixed(2);
    }
    const pt = routes[d.route].getPointAtLength(s);
    const x = pt.x.toFixed(2), y = pt.y.toFixed(2);
    d.head.setAttribute('cx', x); d.head.setAttribute('cy', y);
    d.halo.setAttribute('cx', x); d.halo.setAttribute('cy', y);
  }
  function draw(now: number) { for (const d of drops) place(d, now); }

  let raf = 0, on = false;
  const loop = (now: number) => {
    raf = 0;
    if (!on || document.documentElement.classList.contains('layer-open')) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  };
  const wake = () => { if (on && !raf) raf = requestAnimationFrame(loop); };
  new ResizeObserver(route).observe(fig);
  document.fonts.ready.then(route);
  new IntersectionObserver((es) => { on = es[0].isIntersecting; fig.classList.toggle('on', on); wake(); }, { rootMargin: '10% 0px' }).observe(fig);
  /* the project layer pauses the drops (html.layer-open); they pick up again when it closes */
  new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
