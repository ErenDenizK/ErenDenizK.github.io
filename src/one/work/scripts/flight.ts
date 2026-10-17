/* The flight (spec v2 §3.3; owner's review 2026-10-16, W1, W2, W5, W6, W7). Robin Noguier's flow: the
   frames travel with the page, each at its own depth, bend through the middle of the view, skew with the
   speed of the scroll and regain their colour near the centre. Nothing is pinned, nothing is shuffled,
   nothing swaps: every value below is a pure function of the block's place in the view (u) and of the
   smoothed velocity (v), written once per frame from the page's one clock (ticker.ts). Scrolling back
   plays everything backwards.

   u = (block top - scroll position) / view height: 0 when the block stands at rest (its hero at its rest
   place under the bar), +1 one screen below, -1 one screen above. The last block holds u at 0 for its
   pin length while the torn paper rises over it (W7).

   Depth d means the element moves d times as fast as the page: its offset from normal flow is
   (d - 1) * u * vh. The hero leaves fast (1.18) and arrives slow (0.94), so it hangs a little at rest;
   side frames have fixed depths (0.82 left, 1.18 right); drawings 0.85 / 1 / 1.15; tags 0.6; the texts
   0.9 and their lines rise in masks. Layout is read on resize and on content change only (rule 4). */
import { onFrame, kick, initTicker } from '../../scripts/ticker';
import { splitLines } from './lines';
import { loadArt, type ArtLayer } from './art';
import { motion } from './bus';
import { onFirstFrame } from './frame';
import { setupFlow, type Flow } from './flow';

export interface Proj {
  slug: string; k: number; el: HTMLElement; stage: HTMLElement;
  hero: HTMLElement; front: HTMLElement; twin: HTMLElement | null; sides: HTMLElement[];
  obj: HTMLElement | null; txt: HTMLElement; title: HTMLElement; btn: HTMLAnchorElement;
  art: HTMLElement | null; layers: ArtLayer[]; tags: HTMLElement[];
  lines: { el: HTMLElement; o: number; mask: boolean }[];
  stops: SVGGElement[]; route: SVGPathElement | null;
  /** the objects preview (?objects=glass|line): the object beside the hero, and its line twin */
  objx: HTMLElement | null; objLine: HTMLElement | null;
  short: boolean; top: number; pin: number;
}
export interface Flight {
  projects: Proj[];
  live: boolean;
  find(slug: string): Proj | undefined;
  /** the hero print, then the side prints: the open's shared elements (open.ts) */
  order(p: Proj): HTMLElement[];
  /** scroll Home so the project stands at rest (u = 0) */
  jump(slug: string): void;
  pause(on: boolean): void;
}

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t;
const f1 = (n: number) => n.toFixed(1), f2 = (n: number) => n.toFixed(2), f3 = (n: number) => n.toFixed(3);

/* desktop and phone numbers (spec v2 §2.3, §3.3.1, §3.3.3) */
const D = { lead: 1.1, lag: 0.94, side: [0.82, 1.18], bend: 14, sideBend: 10, turn: -1, turnK: 3.5, sideTurn: [-5, 5], sideTurnK: 2, yaw: 24, scale: 0.12, skewMax: 6 };
const P = { lead: 1.08, lag: 0.96, side: [0.92, 1.08], bend: 0, sideBend: 0, turn: -1, turnK: 1.5, sideTurn: [-3, 3], sideTurnK: 1, yaw: 0, scale: 0.06, skewMax: 3 };
/* skew from velocity: 0.004 deg per px/s, so a brisk 1500 px/s reaches the 6 deg clamp */
const SKEW_K = 0.004;
/* the hold's rise of the drawing (spec v3 §9.2: 18 % of the view); its layers part a little by depth */
const HOLD_RISE = 0.18;

export function initFlight(sec: HTMLElement): Flight {
  const phoneMq = matchMedia('(max-width: 699.98px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const projects: Proj[] = [...sec.querySelectorAll<HTMLElement>('.proj')].map((el, k) => {
    const hero = el.querySelector<HTMLElement>('.fl-hero')!;
    return {
      slug: el.dataset.slug!, k, el, stage: el.querySelector<HTMLElement>('.fl-stage')!,
      hero, front: hero.querySelector<HTMLElement>('.pr')!, twin: hero.querySelector<HTMLElement>('.pr-twin'),
      sides: [...el.querySelectorAll<HTMLElement>('.fl-side')],
      obj: hero.querySelector<HTMLElement>('.pr-object'),
      txt: el.querySelector<HTMLElement>('.txt-in')!, title: el.querySelector<HTMLElement>('.w-title')!,
      btn: el.querySelector<HTMLAnchorElement>('.btn')!,
      art: el.querySelector<HTMLElement>('.fl-art'), layers: [], tags: [...el.querySelectorAll<HTMLElement>('.fl-tag')],
      lines: [], stops: [...el.querySelectorAll<SVGGElement>('.fl-stop')], route: el.querySelector<SVGPathElement>('.fl-route-line'),
      objx: el.querySelector<HTMLElement>('.fl-obj'), objLine: el.querySelector<HTMLElement>('.fl-obj-line'),
      short: el.hasAttribute('data-short'), top: 0, pin: 0,
    };
  });
  let paused = false;
  /* one cache per property, so an unchanged value is never written again */
  const cache = { transform: new Map<Element, string>(), opacity: new Map<Element, string>(), strokeDashoffset: new Map<Element, string>(), visibility: new Map<Element, string>(), clipPath: new Map<Element, string>() };
  const put = (el: Element, prop: keyof typeof cache, v: string) => {
    const m = cache[prop];
    if (m.get(el) === v) return;
    m.set(el, v);
    (el as HTMLElement).style[prop] = v;
  };
  const clearCache = () => { for (const m of Object.values(cache)) m.clear(); };

  const flight: Flight = {
    projects, live: false,
    find: (slug) => projects.find((p) => p.slug === slug),
    order: (p) => [p.front, ...p.sides.map((s) => s.querySelector<HTMLElement>('.pr')!)],
    jump(slug) {
      const p = flight.find(slug);
      if (!p) return;
      measure();
      scrollTo({ top: p.top, behavior: 'instant' as ScrollBehavior });
      kick();
    },
    pause(on) { paused = on; if (!on) { clearCache(); kick(); } },
  };
  if (motion() !== 'full') return flight;
  flight.live = true;
  sec.setAttribute('data-live', '');
  initTicker();
  /* ?work=flow (row S31): the same projects on a turning drum instead of the vertical flight (flow.ts) */
  const objectsOn = /^(glass|line)$/.test(document.documentElement.dataset.objects ?? '');
  const flow: Flow | null = document.documentElement.dataset.work === 'flow' ? setupFlow(sec, projects, phoneMq) : null;

  /* ---- layout: read on resize, font load and content change only ---- */
  let width = -1;
  function cut() {
    for (const p of projects) {
      const promise = p.stage.querySelector<HTMLElement>('[data-lines]');
      const pl = promise ? splitLines(promise) : [];
      const meta = p.stage.querySelector<HTMLElement>('.w-meta .li');
      const title = p.stage.querySelector<HTMLElement>('.w-title .li');
      p.lines = [
        ...(meta ? [{ el: meta, o: -0.04, mask: true }] : []),
        ...(title ? [{ el: title, o: 0, mask: true }] : []),
        ...pl.map((el, i) => ({ el, o: 0.06 * (i + 1), mask: true })),
        { el: p.stage.querySelector<HTMLElement>('.w-acts')!, o: 0.06 * (pl.length + 1), mask: false },
      ];
    }
    clearCache();
  }
  function measure() {
    if (innerWidth !== width) { width = innerWidth; cut(); }
    const sy = scrollY;
    for (const p of projects) {
      const r = p.el.getBoundingClientRect();
      p.top = r.top + sy;
      p.pin = p.el.hasAttribute('data-last') ? Math.max(0, p.el.offsetHeight - p.stage.offsetHeight) : 0;
    }
    flow?.measure();
    kick();
  }

  /* ---- pointer parallax (fine pointers): the layers lean toward the pointer, 100 ms time constant ---- */
  let tx = 0, ty = 0, px = 0, py = 0;
  if (fine.matches) addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; kick(); }, { passive: true });

  /* ---- the glass object of a project without screens: its idle loop while it is near the centre ---- */
  const loops = new Map<Proj, HTMLVideoElement>();
  function loop(p: Proj, on: boolean) {
    if (!p.obj || phoneMq.matches) return;
    let v = loops.get(p);
    if (!on) { v?.pause(); return; }
    if (!v) {
      const src = (JSON.parse(p.obj.dataset.videos || '{}').wide ?? []) as { src: string; type: string }[];
      if (!src.length) return;
      v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('aria-hidden', 'true'); v.preload = 'auto';
      for (const s of src) { const so = document.createElement('source'); so.src = s.src; so.type = s.type; v.append(so); }
      const vv = v;
      onFirstFrame(vv, () => vv.classList.add('on'));
      p.obj.append(v);
      loops.set(p, v);
    }
    if (v.paused) v.play().catch(() => {});
  }

  /* ---- the frame ---- */
  function frame(f: { y: number; v: number; vh: number; dt: number }): boolean {
    if (paused) return false;
    const phone = phoneMq.matches, N = phone ? P : D;
    const vh = f.vh, y = f.y;
    const sk = clamp(f.v * SKEW_K, -N.skewMax, N.skewMax);
    const kp = 1 - Math.exp(-f.dt / 100);
    px += (tx - px) * kp; py += (ty - py) * kp;
    const settling = Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002;
    if (flow) {
      flow.frame({ ...f, vw: innerWidth }, px, py, (p) => p.lines, put);
      for (const p of projects) if (p.short) loop(p, Math.abs(p.top - y) < 0.6 * vh);
      return settling;
    }

    for (const p of projects) {
      const u0 = (p.top - y) / vh;
      let u = u0;
      const pinU = p.pin / vh;
      if (pinU > 0) u = u > 0 ? u : u >= -pinU ? 0 : u + pinU;
      if (u > 1.6 || u < -1.6) { loop(p, false); continue; }
      const au = Math.abs(u);
      /* the hold (spec v3 §9.2): h runs 0 to 1 while the last block is held, so the held view is never one
         still picture: the drawing rises into the empty upper half, the frame recedes a little, the texts
         leave ahead of the torn edge and the route reaches its last place as the hold ends */
      const h = pinU > 0 ? clamp(-u0 / pinU) : 0;

      /* the hero */
      const d = u < 0 ? N.lead : N.lag;
      const hy = (d - 1) * u * vh;
      const rx = clamp(-N.bend * u, -18, 18);
      const rz = N.turn - N.turnK * u;
      const sc = (1 - N.scale * Math.pow(Math.min(au, 1.4), 1.5)) * (1 - 0.05 * h);
      const hz = rz - 1.2 * h;
      put(p.hero, 'transform', `translate3d(0, ${f1(hy - 0.05 * h * vh)}px, 0) perspective(1400px) rotateX(${f2(rx + 4 * h)}deg) rotate(${f2(hz)}deg) skewY(${f2(sk)}deg) scale(${f3(sc)})`);
      if (p.twin) put(p.twin, 'opacity', f3(smooth(0.22, 0.8, au)));
      /* the object beside the hero (?objects): nearer than the print (1.28), it arrives late and leaves
         early, leaning a little as it passes; the line twin draws itself upward as it arrives */
      if (p.objx && objectsOn) {
        const oy = (1.28 - 1) * u * vh;
        put(p.objx, 'transform', `translate3d(${f1(-px * 22)}px, ${f1(oy - py * 10)}px, 0) rotate(${f2(-3 + 4 * u + sk * 0.8)}deg)`);
        put(p.objx, 'opacity', f3(1 - smooth(0.55, 1.05, au)));
        if (p.objLine) put(p.objLine, 'clipPath', `inset(${f1(100 * smooth(0.08, 0.62, u))}% 0 0 0)`);
      }
      if (p.short) loop(p, au < 0.6);

      /* the side frames: other screens of the same project, dim, mostly outside the view (W5, W6) */
      p.sides.forEach((s, i) => {
        if (phone) return;
        const sd = N.side[i] ?? 1;
        const sy = (sd - 1) * u * vh;
        const yaw = i ? -N.yaw : N.yaw;
        put(s, 'transform', `translate3d(0, ${f1(sy)}px, 0) perspective(1200px) rotateY(${yaw}deg) rotateX(${f2(-N.sideBend * u)}deg) rotate(${f2(N.sideTurn[i] - N.sideTurnK * u)}deg) skewY(${f2(sk * 1.3)}deg)`);
      });

      /* the drawing, its layers at their depths, leaning toward the pointer */
      const artOp = 1 - smooth(0.45, 1.05, au);
      if (p.art && pinU > 0) put(p.art, 'transform', `translate3d(0, ${f1(-HOLD_RISE * h * vh)}px, 0)`);
      for (const l of p.layers) {
        if (l.still) continue;
        const ly = (l.depth - 1) * (u - 0.6 * h) * vh + py * l.px;
        put(l.el, 'transform', `translate3d(${f1(-px * l.px)}px, ${f1(ly)}px, 0)`);
        put(l.el, 'opacity', f3(artOp));
        put(l.el, 'visibility', artOp > 0 ? 'visible' : 'hidden');
      }
      p.tags.forEach((t) => {
        put(t, 'transform', `translate3d(0, ${f1(-0.4 * u * vh)}px, 0)`);
        put(t, 'opacity', f3(1 - smooth(0.25, 0.75, au)));
      });

      /* the texts: the block at 0.9x, each line rising in its mask, leaving by the exit rise */
      /* the texts' lines leave during the hold, ahead of the torn edge: at 1440 the button is gone by the
         hold's middle, before the edge's teeth reach it (a white button seen between the teeth read as a
         torn blob). On the phone the edge never reaches them (they sit in the upper half and the hold is
         short), so they only begin to leave. The block drifts up ahead of the edge as it rises (12 % of
         the view at 1440, 5 % on the phone), so the edge never meets a line still showing. */
      const ut = u - h * (phone ? 0.15 : 1.2);
      put(p.txt, 'transform', `translate3d(0, ${f1(-0.1 * u * vh - h * (phone ? 0.05 : 0.12) * vh)}px, 0) skewY(${f2(sk * 0.5)}deg)`);
      for (const ln of p.lines) {
        const pin = easeOut(clamp((0.62 - ln.o - ut) / 0.42));
        const pout = easeIn(clamp((-ut - 0.16 - ln.o * 0.5) / 0.34));
        const yy = ln.mask ? (1 - pin) * 112 - pout * 30 : (1 - pin) * 40 - pout * 30;
        const skw = (1 - pin) * 4;
        put(ln.el, 'transform', `translate3d(0, ${f1(yy)}%, 0) skewY(${f2(skw)}deg)`);
        put(ln.el, 'opacity', f3(ln.mask ? 1 - pout : pin * (1 - pout)));
      }

      /* the last block: its places light up one by one along the route, from the block's arrival (a third
         of a view before rest) to the end of the hold, so the route is whole when the torn edge takes the
         view (W7, spec v3 §9.2) */
      if (p.stops.length && p.art) {
        const n = p.stops.length;
        const t = clamp((0.35 - u0) / (0.35 + Math.max(pinU, 0.05)));
        p.stops.forEach((g, i) => {
          const a = n > 1 ? smooth(i / n - 0.04, (i + 1) / n, t) : t;
          put(g, 'opacity', f3(0.25 + 0.75 * a));
        });
        if (p.route) put(p.route, 'strokeDashoffset', f3(1 - smooth(0.5 / n, 1, t)));
      }
    }
    return settling;
  }

  /* ---- the prints are never grey (review V17; round 2 and 3 critiques: lazy side frames showed their
     empty screen for up to 2 s after a jump from the rail). Three things:
     1. near: a block within two views of the view fetches its pictures now (the browser's own lazy
        distance is too short for a rail jump, which crosses thousands of pixels in half a second);
     2. a jump: a press on the rail (Home's rail or its bloom), its keys, or a scroll faster than
        4000 px/s fetches every picture of Work at once (the few side frames are all that is lazy);
     3. decode before reveal: a side frame stays out of sight (opacity 0) until its picture is decoded,
        then comes in over 240 ms, so no frame ever shows an empty screen. ---- */
  const warmed = new WeakSet<Proj>();
  function warmProj(p: Proj) {
    if (warmed.has(p)) return;
    warmed.add(p);
    /* phones never show the side frames (here or in the layer): their pictures stay unfetched */
    const sel = phoneMq.matches ? '.fl-hero img[loading="lazy"]' : 'img[loading="lazy"]';
    p.stage.querySelectorAll<HTMLImageElement>(sel).forEach((im) => { im.loading = 'eager'; });
    if (phoneMq.matches) { p.sides.forEach((s) => s.classList.add('ready')); return; }
    p.sides.forEach((s) => {
      const im = s.querySelector<HTMLImageElement>('.pr-screen img');
      if (!im) { s.classList.add('ready'); return; }
      const ok = () => s.classList.add('ready');
      (im.complete && im.naturalWidth ? im.decode() : new Promise((r, j) => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', j, { once: true }); }).then(() => im.decode()))
        .then(ok, ok);
    });
  }
  const warmAll = () => projects.forEach(warmProj);
  const near = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const p = projects.find((x) => x.el === e.target);
    if (p) { warmProj(p); near.unobserve(p.el); }
  }), { rootMargin: '200% 0px' });
  projects.forEach((p) => near.observe(p.el));
  const railish = (t: EventTarget | null) => t instanceof Element && !!t.closest('.rail, .rail-plain, [data-rail]') && !t.closest('.layer');
  document.addEventListener('pointerdown', (e) => { if (railish(e.target)) warmAll(); }, { passive: true, capture: true });
  document.addEventListener('keydown', (e) => { if (railish(e.target)) warmAll(); }, { capture: true });
  onFrame((f) => { if (Math.abs(f.v) > 4000) warmAll(); return false; });

  /* ---- start ---- */
  measure();
  projects.forEach((p) => {
    if (!p.art) return;
    const io = new IntersectionObserver((e) => {
      if (!e.some((x) => x.isIntersecting)) return;
      io.disconnect();
      loadArt(p.art!, phoneMq.matches, (layers) => { p.layers = layers; clearCache(); kick(); });
    }, { rootMargin: '100% 0px' });
    io.observe(p.el);
  });
  onFrame(frame);
  addEventListener('resize', measure, { passive: true });
  document.fonts?.ready.then(measure);
  const ro = new ResizeObserver(() => measure());
  ro.observe(sec);
  ro.observe(document.body);

  /* focus on a project's button brings it to rest (keyboard users meet a whole frame) */
  sec.addEventListener('focusin', (e) => {
    const p = projects.find((x) => x.btn === e.target);
    if (!p || !(e.target as HTMLElement).matches(':focus-visible')) return;
    if (Math.abs(p.top - scrollY) > 4) scrollTo({ top: p.top, behavior: 'smooth' });
  });
  return flight;
}
