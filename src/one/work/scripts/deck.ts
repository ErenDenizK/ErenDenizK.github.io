/* The deck (phase3 design-spec.md 4.5): two clocks, as Robin Noguier's portfolio does.
   Clock 1 is the scroll, 1:1, for geometry: in each project's slot the next set rises from below as a fan
   while the previous one lifts away, then the prints shuffle, one per 0.35 screens. One rAF writes the
   poses (transform, opacity) only while Work is on screen and only for the sets in view.
   Clock 2 is time: when the scroll settles on another project, its texts, the index and the light change.
   The grid in work.css pins the stage; this file never fixes or takes the scroll. */
import { soft, out, exit, clamp, lerp } from './ease';
import { setAura, hold, release, motion } from './bus';
import { onFirstFrame } from './frame';

type Pose = { x: number; y: number; r: number; shade: number };
/* rest poses in fractions of the print width (spec 3.3.1: +70 / -18 px and -84 / -6 px at 672 px) */
const DESK: Pose[] = [{ x: 0, y: 0, r: -1.6, shade: 0 }, { x: 0.104, y: -0.027, r: 4.2, shade: 0.38 }, { x: -0.125, y: -0.009, r: -6.5, shade: 0.5 }];
const PHONE: Pose[] = [{ x: 0, y: 0, r: -1, shade: 0 }, { x: 0.038, y: -0.031, r: 3, shade: 0.38 }, { x: -0.044, y: -0.013, r: -3.5, shade: 0.5 }];
/* the front print leaving: out to the right by 40 % of its width at +8 deg (phone: it lifts 16 px) */
const OUT_DESK: Pose = { x: 0.4, y: -0.02, r: 8, shade: 0 };
const OUT_PHONE: Pose = { x: 0, y: -0.05, r: -1, shade: 0 };
const FAN = [-4, 10, -10];          // extra turn per position while a set arrives (spec: "turns +-10 deg")
const ARRIVE = [-0.45, -0.15];      // a set arrives over these screens before its slot (its rest is the slot top)
const SHUFFLE0 = 0.15, STEP = 0.35; // shuffles start 0.15 screens into the slot, one print per 0.35 screens

export interface Proj {
  slug: string; k: number; n: number; aura: [string, string, string];
  el: HTMLElement; slot: HTMLElement; box: HTMLElement; prints: HTMLElement[]; shades: HTMLElement[];
  obj: HTMLElement | null; props: HTMLElement[]; txt: HTMLElement; btn: HTMLAnchorElement;
  cache: string[];
}
export interface Deck {
  projects: Proj[];
  current(): number;
  find(slug: string): Proj | undefined;
  /** the print in front right now, and the others in stack order */
  order(p: Proj): HTMLElement[];
  jump(slug: string): void;
  pause(on: boolean): void;
  live: boolean;
}

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), shade: lerp(a.shade, b.shade, t) });
const mod = (a: number, n: number) => ((a % n) + n) % n;

export function initDeck(sec: HTMLElement): Deck {
  const projects: Proj[] = [...sec.querySelectorAll<HTMLElement>('.proj')].map((el, k) => {
    const slot = el.querySelector<HTMLElement>('.slot')!;
    const prints = [...el.querySelectorAll<HTMLElement>('.set-link > .pr')];
    return {
      slug: el.dataset.slug!, k, n: prints.length || 1,
      aura: (slot.dataset.aura || '').split(' ') as [string, string, string],
      el, slot, box: el.querySelector<HTMLElement>('.set-box')!, prints,
      shades: prints.map((p) => p.querySelector<HTMLElement>('.pr-shade')!),
      obj: el.querySelector<HTMLElement>('.set-obj'), props: [...el.querySelectorAll<HTMLElement>('.prop')],
      txt: el.querySelector<HTMLElement>('.txt-in')!, btn: el.querySelector<HTMLAnchorElement>('.btn')!,
      cache: [],
    };
  });
  const idx = sec.querySelector<HTMLElement>('[data-idx]');
  const deckOn = () => motion() === 'full' && getComputedStyle(sec).display === 'grid';
  const phoneMq = matchMedia('(max-width: 699.98px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  let vh = innerHeight, pw = 672, top = 134, secTop = 0, secH = 0, slotTop: number[] = [], running = false, raf = 0, paused = false, lastS = NaN;
  let cur = 0, shown = 0, settleT = 0, pinned = false;
  const deck: Deck = {
    projects, live: false,
    current: () => cur,
    find: (slug) => projects.find((p) => p.slug === slug),
    order: (p) => [...p.prints].sort((a, b) => +(a.dataset.pos || 0) - +(b.dataset.pos || 0)),
    jump(slug) {
      const p = deck.find(slug);
      if (!p) return;
      const y = sec.getBoundingClientRect().top + scrollY + (slotTop[p.k] ?? 0);
      scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
      lastS = NaN; frame(); swap(cur, false);
    },
    pause(on) { paused = on; if (!on) { lastS = NaN; kick(); } },
  };
  if (!deckOn()) { projects.forEach((p) => p.el.toggleAttribute('data-on', true)); return deck; }
  deck.live = true;

  function measure() {
    vh = projects[0].box.closest<HTMLElement>('.set')!.clientHeight || innerHeight;
    pw = projects[0].box.offsetWidth || 672;
    top = projects[0].box.offsetTop;
    slotTop = projects.map((p) => p.slot.offsetTop);
    const r = sec.getBoundingClientRect();
    secTop = r.top + scrollY; secH = r.height; lastS = NaN;
  }

  /* ---- clock 1: geometry ---- */
  function arrival(p: Proj, s: number) {
    if (p.k === 0) return 1;
    const u = (s - slotTop[p.k]) / vh;
    return clamp((u - ARRIVE[0]) / (ARRIVE[1] - ARRIVE[0]));
  }
  function write(p: Proj, i: number, v: string) { if (p.cache[i] !== v) { p.cache[i] = v; return true; } return false; }

  function frame() {
    raf = 0;
    if (paused) return;
    /* no layout read per frame: the section's place comes from measure() (resize, ResizeObserver) */
    const s = scrollY - secTop;
    if (s === lastS) return;
    lastS = s;
    const r = { top: -s, bottom: secH - s };
    const phone = phoneMq.matches;
    const P = phone ? PHONE : DESK, O = phone ? OUT_PHONE : OUT_DESK;
    const raws = projects.map((p) => arrival(p, s));
    cur = 0;
    raws.forEach((a, k) => { if (k > 0 && a >= 0.5) cur = k; });
    const D = vh - top - (phone ? 30 : 34);   // the waiting set shows its top edge at the bottom of the view
    projects.forEach((p, k) => {
      const raw = raws[k];
      const nextRaw = k + 1 < projects.length ? raws[k + 1] : 0;
      const e = exit(clamp(nextRaw * 1.25));
      const waiting = raw === 0;
      const visible = (waiting ? k === cur + 1 : true) && e < 1 && (k <= cur + 1);
      if (write(p, 0, visible ? '1' : '0')) p.box.style.visibility = visible ? '' : 'hidden';
      if (!visible) return;
      const a = soft(raw);
      const y = (1 - a) * D - e * 0.7 * vh;
      const rot = e * 6, sc = 1 - 0.08 * e;
      const op = lerp(0.32, 1, a) * (1 - e);
      if (write(p, 1, `${y.toFixed(1)}|${rot.toFixed(2)}|${sc.toFixed(3)}`)) p.box.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      if (write(p, 2, op.toFixed(3))) p.box.style.opacity = op.toFixed(3);
      /* the object at 0.6x and the props at 1.25x of the set's travel (spec 4.3) */
      if (p.obj && write(p, 3, a.toFixed(3))) {
        p.obj.style.transform = `translate3d(0, ${(-(1 - a) * D * 0.4).toFixed(1)}px, 0)`;
        p.obj.style.opacity = a.toFixed(3);
      }
      if (p.props.length && write(p, 4, a.toFixed(3))) for (const pr of p.props) {
        pr.style.transform = `translate3d(0, ${((1 - a) * D * 0.25).toFixed(1)}px, 0)`;
        pr.style.opacity = clamp(a * 1.4 - 0.4).toFixed(3);
      }
      /* the shuffle */
      const u = (s - slotTop[k]) / vh;
      let q = 0;
      for (let j = 0; j < p.n - 1; j++) q += soft(clamp((u - SHUFFLE0 - STEP * j) / STEP));
      const fan = phone ? 0.5 : 1;
      p.prints.forEach((el, j) => {
        const m = mod(j - q, p.n);
        let pose: Pose, z: number;
        if (m <= p.n - 1 + 1e-6) {
          const lo = Math.floor(m), hi = Math.min(Math.ceil(m), p.n - 1), f = m - lo;
          pose = lerpPose(P[lo], P[hi], f);
          /* the print coming forward gains its colour over the last half of its move */
          pose.shade = f > 0.5 ? lerp(P[lo].shade, P[hi].shade, (f - 0.5) * 2) : P[lo].shade;
          z = 10 - Math.round(m) * 2;
        } else {
          const v = p.n - m; // 0 at the front, 1 at the back
          if (v < 0.5) { pose = lerpPose(P[0], O, out(v * 2)); z = 20; }
          else { pose = lerpPose(O, P[p.n - 1], soft((v - 0.5) * 2)); pose.shade = lerp(0, P[p.n - 1].shade, (v - 0.5) * 2); z = 0; }
        }
        const pos = Math.round(m) % p.n;
        const rr = pose.r + (1 - a) * FAN[pos] * fan;
        const t = `translate3d(${(pose.x * pw).toFixed(1)}px, ${(pose.y * pw).toFixed(1)}px, 0) rotate(${rr.toFixed(2)}deg)`;
        if (write(p, 10 + j * 3, t)) el.style.transform = t;
        if (write(p, 11 + j * 3, `${z}|${pos}`)) { el.style.zIndex = String(z); el.dataset.pos = String(pos); }
        if (write(p, 12 + j * 3, pose.shade.toFixed(3))) p.shades[j].style.opacity = pose.shade.toFixed(3);
      });
    });
    /* the texts shown wait for the scroll to settle (clock 2), but step aside while another set passes
       through them, so a print never runs over a title */
    const nx = raws[shown + 1] ?? 0, own = shown > 0 ? clamp(raws[shown] * 3 - 2) : 1;
    const dim = Math.min(1 - clamp(nx * 3), own);
    const t = projects[shown].txt;
    const v = dim >= 0.999 ? '' : dim.toFixed(3);
    if (t.style.opacity !== v) t.style.opacity = v;
    /* while the stage is pinned, Work owns the light (bus.hold) */
    const nowPinned = r.top <= 1 && r.bottom >= vh - 1;
    if (nowPinned !== pinned) { pinned = nowPinned; if (pinned) { hold('work'); setAura(projects[shown].aura, { ms: 500 }); } else release('work'); }
  }
  const kick = () => { if (!raf && running) raf = requestAnimationFrame(frame); };

  /* ---- clock 2: the texts, the index, the light, the object's loop ---- */
  const parts = (p: Proj) => [...p.txt.querySelectorAll<HTMLElement>('[data-part]')];
  function swap(to: number, animate = true) {
    const from = shown;
    shown = to;
    const a = projects[from], b = projects[to];
    const dimA = a.txt.style.opacity === '' ? 1 : parseFloat(a.txt.style.opacity);
    a.txt.style.opacity = ''; b.txt.style.opacity = '';
    if (idx) {
      const t = String(to + 1).padStart(2, '0');
      if (idx.textContent !== t) {
        if (animate) idx.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 150, easing: 'cubic-bezier(.4, 0, .2, 1)' })
          .finished.then(() => { idx.textContent = t; idx.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)' }); }, () => { idx.textContent = t; });
        else idx.textContent = t;
      }
    }
    if (from !== to && animate) {
      /* the old texts leave from where they are (they may have stepped aside already) */
      a.txt.animate([{ opacity: dimA, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 160, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' })
        .finished.then((an) => { if (shown !== from) a.el.removeAttribute('data-on'); an.cancel(); }, () => {});
      b.el.setAttribute('data-on', '');
      const step = phoneMq.matches ? 75 : 90;
      parts(b).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, delay: 140 + i * step, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' }));
    } else {
      projects.forEach((p) => p.el.toggleAttribute('data-on', p === b));
    }
    if (pinned) setAura(b.aura, { ms: 500 });
    loops(to);
  }

  /* the glass object's idle loop plays for the project in front only (desktop, fine pointer) */
  function loops(k: number) {
    projects.forEach((p, i) => {
      const v = p.obj?.querySelector('video');
      if (i !== k) { v?.pause(); return; }
      if (!p.obj || !fine.matches || phoneMq.matches) return;
      if (v) { v.play().catch(() => {}); return; }
      const src = JSON.parse(p.obj.dataset.videos || '{}').wide as { src: string; type: string }[] | undefined;
      if (!src?.length) return;
      const vid = document.createElement('video');
      vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('aria-hidden', 'true'); vid.preload = 'auto';
      for (const s of src) { const so = document.createElement('source'); so.src = s.src; so.type = s.type; vid.append(so); }
      onFirstFrame(vid, () => vid.classList.add('on'));
      p.obj.append(vid);
      vid.play().catch(() => {});
    });
  }

  function settle() {
    clearTimeout(settleT);
    settleT = window.setTimeout(() => { lastS = NaN; frame(); if (cur !== shown) swap(cur); }, 200);
  }
  const onScroll = () => { kick(); settle(); };
  addEventListener('scroll', onScroll, { passive: true });
  if ('onscrollend' in window) addEventListener('scrollend', () => { clearTimeout(settleT); settleT = window.setTimeout(() => { lastS = NaN; frame(); if (cur !== shown) swap(cur); }, 120); });
  addEventListener('resize', () => { measure(); for (const p of projects) p.cache = []; kick(); }, { passive: true });
  const ro = new ResizeObserver(() => { measure(); kick(); });
  ro.observe(sec); ro.observe(document.body);
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) kick(); else if (pinned) { pinned = false; release('work'); } }, { rootMargin: '50% 0px' }).observe(sec);

  /* focus on a project's button brings its slot into place (spec 4.5, "Focus and keys") */
  sec.addEventListener('focusin', (e) => {
    const p = projects.find((x) => x.btn === e.target);
    if (!p || p.k === cur) return;
    const y = sec.getBoundingClientRect().top + scrollY + slotTop[p.k];
    scrollTo({ top: y, behavior: 'smooth' });
  });

  measure();
  sec.setAttribute('data-live', '');
  running = true;
  frame();
  shown = cur;
  swap(cur, false);
  return deck;
}
