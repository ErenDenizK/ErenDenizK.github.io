/* The flow (owner, 2026-10-17, row S31; lab switch ?work=flow, flow.css). The owner asked whether a
   horizontal, turning, living, cylinder-like flow of flying sheets would be better than the vertical
   flight. This is that flow, built beside the flight so the two can be compared on the same page.

   The idea: the projects are sheets on a drum. The drum stands upright behind the view and turns as the
   page scrolls, so the next project comes in from the right edge already half turned, faces the reader
   at the centre and turns away to the left. Each project's other screens are smaller sheets on a wider
   drum (they fly past faster, so the depth reads without any shading), its engraving slides behind it at
   its own depths, and its texts change in place, line by line in their masks, the way the flight's do.

   How it is built: the page keeps one block per project (the anchors, the rail's beads and the aura still
   read them), but in the flow each block is only a spacer. Every block's stage moves into one sticky
   view (.fl-flow), so the compositor holds the stages still while the page scrolls; this module writes
   only transforms and opacities, as pure functions of the scroll position (g, the project at the centre,
   continuous) and the smoothed velocity. Scrolling back plays everything backwards.

   g = (scroll position - the first block's top) / L, where L is one block's scroll length. Near each
   whole g the drum slows (a detent: g moves 0.45 times as fast at a project as on average and 1.55
   times as fast between two), so every project rests a moment in front of the reader without a pin.
   The last block holds for --hold while the torn paper rises over it, as in the flight (W7). */
import type { Proj } from './flight';

export interface FlowFrame { y: number; v: number; vh: number; vw: number; dt: number }
type Put = (el: Element, prop: 'transform' | 'opacity' | 'strokeDashoffset' | 'visibility' | 'clipPath', v: string) => void;
type Line = { el: HTMLElement; o: number; mask: boolean };

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t;
const f1 = (n: number) => n.toFixed(1), f2 = (n: number) => n.toFixed(2), f3 = (n: number) => n.toFixed(3);

/* desktop and phone numbers. dTheta: the drum's angle between two projects; r: the drum's radius as a
   share of the view's width (the next project's centre then sits at r * sin(dTheta) of the width, past
   the edge on the phone, half in on desktop); side: the outer drum of the other screens */
const D = { dTheta: 44, r: 1.0, side: 1.22, sideSpread: 0.42, sideY: [0.24, -0.2], lean: 3, flutter: 5, skewMax: 4, art: 0.55, txt: 90, tilt: 2.2 };
const P = { dTheta: 50, r: 1.15, side: 1.3, sideSpread: 0.5, sideY: [0.2, -0.16], lean: 0, flutter: 4, skewMax: 2.5, art: 0.7, txt: 48, tilt: 1.6 };
const SKEW_K = 0.003;
const DETENT = 0.55;
const HOLD_RISE = 0.18;

/** g with a detent at each project: x - a sin(2 pi x) / (2 pi), monotonic for a < 1 */
const detent = (g: number) => { const k = Math.floor(g), x = g - k; return k + x - (DETENT * Math.sin(2 * Math.PI * x)) / (2 * Math.PI); };

export interface Flow {
  /** the scroll position at which project k stands at the centre */
  topOf(p: Proj): number;
  measure(): void;
  frame(f: FlowFrame, px: number, py: number, lines: (p: Proj) => Line[], put: Put): void;
}

export function setupFlow(sec: HTMLElement, projects: Proj[], phoneMq: MediaQueryList): Flow {
  /* one sticky view holds every stage; each block keeps its id, its rail bead and its aura as a spacer */
  const view = document.createElement('div');
  view.className = 'fl-flow';
  view.setAttribute('aria-hidden', 'false');
  sec.prepend(view);
  for (const p of projects) {
    /* the stage carries its block's light and attributes with it, so its rules still apply */
    p.stage.setAttribute('style', p.el.getAttribute('style') ?? '');
    for (const a of ['data-slug', 'data-k', 'data-short', 'data-last']) if (p.el.hasAttribute(a)) p.stage.setAttribute(a, p.el.getAttribute(a)!);
    if (p.hero.querySelector('.pr[data-phone-frame]')) p.stage.setAttribute('data-phone', '');
    view.append(p.stage);
    /* the open marks the block (open.ts): its stage follows, so the opened sheet leaves the flow */
    new MutationObserver(() => p.stage.classList.toggle('opened', p.el.classList.contains('opened'))).observe(p.el, { attributes: true, attributeFilter: ['class'] });
  }
  sec.setAttribute('data-flow', '');

  let top0 = 0, L = 1, holdPx = 0, lastTop = 0;
  const zs = new Map<HTMLElement, string>();

  return {
    topOf: (p) => p.top,
    measure() {
      const first = projects[0], last = projects[projects.length - 1];
      top0 = first.top;
      L = Math.max(1, first.el.offsetHeight);
      lastTop = last.top;
      holdPx = Math.max(0, last.el.offsetHeight - innerHeight);
    },
    frame(f, px, py, lines, put) {
      const phone = phoneMq.matches, N = phone ? P : D;
      const vw = f.vw, vh = f.vh, n = projects.length;
      const raw = (f.y - top0) / L;
      /* the last block's hold: g stays on the last project while the torn paper rises (W7) */
      const h = holdPx > 0 ? clamp((f.y - lastTop) / holdPx) : 0;
      const g = raw < 0 ? raw : Math.min(detent(Math.min(raw, n - 1)), n - 1);
      const sk = clamp(f.v * SKEW_K, -N.skewMax, N.skewMax);
      const R = N.r * vw;

      for (const p of projects) {
        /* t: where the project stands on the drum, in projects: 0 at the centre, +1 the next to come */
        const t = p.k - g;
        const at = Math.abs(t);
        const show = at < 1.75;
        put(p.stage, 'visibility', show ? 'visible' : 'hidden');
        const z = String(20 - Math.round(at * 4));
        if (zs.get(p.stage) !== z) { zs.set(p.stage, z); p.stage.style.zIndex = z; }
        if (!show) continue;
        /* before the flow begins (g < 0) the first sheet rises with the page and only starts to turn */
        const tt = raw < 0 && p.k === 0 ? t * 0.35 : t;
        const th = N.dTheta * tt * (Math.PI / 180);
        const x = R * Math.sin(th), zd = R * (Math.cos(th) - 1);
        /* the sheet flutters a little as it travels (a sheet in air), most between two places */
        const fl = N.flutter * Math.sin(Math.PI * clamp(at, 0, 2)) * Math.sign(t || 1);
        const ry = N.dTheta * tt + px * N.lean;
        const rz = -1 - N.tilt * tt + sk * 0.6;
        const sc = 1 - 0.05 * h;
        put(p.hero, 'transform', `translate3d(${f1(x)}px, ${f1(-0.05 * h * vh + Math.abs(x) * 0.04)}px, ${f1(zd)}px) rotateY(${f2(ry)}deg) rotateX(${f2(fl - py * N.lean * 0.6 + 4 * h)}deg) rotate(${f2(rz)}deg) scale(${f3(sc)})`);
        /* the object beside the hero (?objects) rides the drum a little outside the sheet, so it parts
           from the print as the drum turns; its line twin draws upward as it comes to the front */
        if (p.objx) {
          const Ro = R * 1.1, xo = Ro * Math.sin(th), zo = Ro * (Math.cos(th) - 1) + 60;
          put(p.objx, 'transform', `translate3d(${f1(xo)}px, ${f1(Math.abs(x) * 0.05)}px, ${f1(zo)}px) rotateY(${f2(ry * 0.6)}deg) rotate(${f2(-3 - 3 * tt + sk)}deg)`);
          put(p.objx, 'opacity', f3(1 - smooth(0.6, 1.1, at)));
          if (p.objLine) put(p.objLine, 'clipPath', `inset(${f1(100 * smooth(0.1, 0.7, tt))}% 0 0 0)`);
        }
        /* the greyscale twin: colour comes back as the sheet faces the reader */
        if (p.twin) put(p.twin, 'opacity', f3(smooth(0.12, 0.6, at)));
        put(p.hero, 'opacity', f3(1 - smooth(1.25, 1.7, at)));

        /* the other screens: smaller sheets on the outer drum, one ahead and one behind the hero, so they
           cross the view faster than it does and part from it as it turns */
        p.sides.forEach((s, i) => {
          if (phone) return;
          const o = (i ? 1 : -1) * N.sideSpread;
          const ts = tt + o;
          const ths = N.dTheta * ts * (Math.PI / 180);
          const Rs = R * N.side;
          const xs = Rs * Math.sin(ths), zs2 = Rs * (Math.cos(ths) - 1) - 120;
          const ys = N.sideY[i] * vh * (1 - 0.35 * Math.min(at, 1));
          put(s, 'transform', `translate3d(${f1(xs)}px, ${f1(ys)}px, ${f1(zs2)}px) rotateY(${f2(N.dTheta * ts)}deg) rotateX(${f2(-fl * 1.6)}deg) rotate(${f2((i ? 6 : -6) - N.tilt * 2 * ts + sk)}deg)`);
          put(s, 'opacity', f3(1 - smooth(0.9, 1.4, Math.abs(ts))));
        });

        /* the engraving slides with the drum at its depths and fades before it meets the next one: the
           two scenes share the view only in the middle of a turn (S20) */
        const artOp = 1 - smooth(0.22, 0.62, at);
        if (p.art) {
          put(p.art, 'transform', `translate3d(${f1(-t * N.art * vw)}px, ${f1(-HOLD_RISE * h * vh)}px, 0)`);
          put(p.art, 'opacity', f3(artOp));
        }
        for (const l of p.layers) {
          const lx = -t * (l.depth - 1) * 0.9 * vw - px * l.px;
          put(l.el, 'transform', `translate3d(${f1(lx)}px, ${f1(py * l.px)}px, 0)`);
          put(l.el, 'opacity', '1');
          put(l.el, 'visibility', artOp > 0 ? 'visible' : 'hidden');
        }
        p.tags.forEach((tg, i) => {
          put(tg, 'transform', `translate3d(${f1(-t * vw * (0.7 + 0.15 * i))}px, 0, 0)`);
          put(tg, 'opacity', f3(1 - smooth(0.2, 0.6, at)));
        });

        /* the texts change in place: the leaving project's lines rise out of their masks while the coming
           one's rise in, and the block slides a little with the turn */
        const ut = t - h * (phone ? 0.15 : 1.2);
        put(p.txt, 'transform', `translate3d(${f1(-t * N.txt)}px, ${f1(-h * (phone ? 0.05 : 0.12) * vh)}px, 0)`);
        /* the text's hush belongs to the project in front: the others' would darken the view */
        put(p.txt, 'opacity', f3(1 - smooth(0.45, 0.85, at)));
        for (const ln of lines(p)) {
          /* the handover is clean: the leaving lines are gone before the coming ones start (at the middle
             of a turn the line masks are empty for a moment, while the sheets cross) */
          const pin = easeOut(clamp((0.45 - ln.o - ut) / 0.35));
          const pout = easeIn(clamp((-ut - 0.05 - ln.o * 0.5) / 0.3));
          const yy = ln.mask ? (1 - pin) * 112 - pout * 30 : (1 - pin) * 40 - pout * 30;
          put(ln.el, 'transform', `translate3d(0, ${f1(yy)}%, 0) skewY(${f2((1 - pin) * 4)}deg)`);
          put(ln.el, 'opacity', f3(ln.mask ? (ut > 0.6 ? 0 : 1 - pout) : pin * (1 - pout)));
        }

        /* the last project's places light along its route through the hold, as in the flight */
        if (p.stops.length && p.art) {
          const m = p.stops.length;
          const u0 = (p.top - f.y) / vh;
          const pinU = holdPx / vh;
          const q = clamp((0.35 - u0) / (0.35 + Math.max(pinU, 0.05)));
          p.stops.forEach((st, i) => put(st, 'opacity', f3(0.25 + 0.75 * (m > 1 ? smooth(i / m - 0.04, (i + 1) / m, q) : q))));
          if (p.route) put(p.route, 'strokeDashoffset', f3(1 - smooth(0.5 / m, 1, q)));
        }
      }
    },
  };
}
