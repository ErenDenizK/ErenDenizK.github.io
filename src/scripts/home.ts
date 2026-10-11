/* Home's scroll story (pages/index.astro, styles/home.css; docs/research/2026-10-home-a.md). Scrolling is
   never taken over: this only reads the reading position and turns it into
   - the pose of the pinned glass on its real 1° grid (media.ts `pose`, desktop with a fine pointer, where the
     lean grid is loaded): each chapter names one or more poses (data-pose "mx,my;mx,my"), placed where the
     chapter is centred in the window (several spread across it), and the pose between them eases;
   - the light: the chapter crossing the middle of the window gives the stage its colours (data-light,
     -light2, -light3) and the page its accent (the dot in the mark, the tab, the rail);
   - the object: a chapter that names another object (data-obj) changes the glass into it once the chapter
     has held the middle for a moment, so a fling through the page swaps nothing (as Work, ADR-0010);
   - phones: the glass shrinks into an emblem as the first screen leaves (--k), and the reading text slides
     under a veil instead of over the glass.
   A press on the glass plays its hop (media.ts) and sends a ring of light out. Reduced motion, Save-Data and
   ?still keep posters and no entrances; without this script the page is complete as it is. */
import { root, mq, motionOK } from './env';
import { setAccent } from './accent';
import { liveOn } from './live/flag';

type Pose = { mx: number; my: number };
type Key = { y: number; p: Pose };
const HOLD = 280;   // ms a chapter holds the middle before the glass changes into its object
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

const ha = document.querySelector<HTMLElement>('[data-ha]');
if (ha) init(ha);

function init(ha: HTMLElement) {
  const stage = ha.querySelector<HTMLElement>('.ha-stage')!;
  const slot = stage.querySelector<HTMLElement>('.media')!;
  const ring = stage.querySelector<HTMLElement>('.ha-ring');
  const hero = ha.querySelector<HTMLElement>('.ha-hero')!;
  const chapters = [...ha.querySelectorAll<HTMLElement>('[data-ch]')];
  const moving = motionOK();
  const phone = () => !mq.wide.matches;
  const media = () => (window as any).MediaStage;
  root.classList.add('ha-js');
  if (moving) root.classList.add('ha-motion');

  /* ---- reading text arrives as it enters ---- */
  const rv = [...ha.querySelectorAll<HTMLElement>('.ha-rv')];
  if (moving && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add('in'));

  /* ---- the poses, placed on the page ---- */
  let keys: Key[] = [];
  const measure = () => {
    const vh = innerHeight;
    keys = [];
    for (const ch of chapters) {
      const list = (ch.dataset.pose || '').split(';').filter(Boolean).map((s) => { const [mx, my] = s.split(',').map(Number); return { mx: mx || 0, my: my || 0 }; });
      if (!list.length) continue;
      const r = ch.getBoundingClientRect(), top = r.top + scrollY;
      const c = ch === hero ? 0 : top + r.height / 2 - vh / 2;
      const spread = list.length > 1 ? r.height * 0.32 : 0;
      list.forEach((p, i) => keys.push({ y: list.length > 1 ? c - spread + (2 * spread * i) / (list.length - 1) : c, p }));
    }
    keys.sort((a, b) => a.y - b.y);
  };
  const poseAt = (y: number): Pose => {
    if (!keys.length) return { mx: 0, my: 0 };
    if (y <= keys[0].y) return keys[0].p;
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (y <= b.y) { const t = smooth((y - a.y) / Math.max(1, b.y - a.y)); return { mx: a.p.mx + (b.p.mx - a.p.mx) * t, my: a.p.my + (b.p.my - a.p.my) * t }; }
    }
    return keys[keys.length - 1].p;
  };

  /* ---- the press: the hop is media.ts's; the ring is the page's ---- */
  let hinted = false;
  const hint = ha.querySelector<HTMLElement>('.ha-hint');
  try { hinted = !!localStorage.getItem('edk-hop'); } catch {}
  if (hint && !hinted && moving && mq.fine.matches && mq.wide.matches) hint.hidden = false;
  slot.addEventListener('click', () => {
    if (ring && moving) { ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go'); }
    if (hint) hint.hidden = true;
    try { localStorage.setItem('edk-hop', '1'); } catch {}
  });

  /* ---- which object the glass is, and what of it moves ----
     The stage is a solo slot (media.ts): only while it is focused does it go past its poster. edk keeps it
     focused everywhere (its lean grid is what the scroll turns on a desktop; its spin loop plays on a phone).
     A product keeps it focused on touch screens (their loops), but on a desktop with a fine pointer it stays
     a still: the scroll poses only edk, and each product's grid (1.3-1.9 MB) is not worth fetching for a
     chapter read in passing (Home's idle grids were already 3.1 MB: home research §1.2, item 8). */
  const focusFor = (obj: string) => media()?.focus(obj === 'edk' || !(mq.fine.matches && mq.wide.matches) ? slot : null);
  const change = (obj: string, light?: string) => {
    const m = media();
    if (!m) return;
    if (obj !== 'edk') focusFor(obj);
    m.show(slot, obj, { light });
    if (obj === 'edk') focusFor(obj);
  };

  /* ---- the frame: light, accent, object, pose, emblem ---- */
  let cur: HTMLElement | null = null, raf = 0, swapT = 0, lastPose: Pose = { mx: 9, my: 9 };
  /** the chapter crossing the middle of the window (or the nearest one) */
  const atMiddle = () => {
    const mid = innerHeight / 2;
    let best = chapters[0], bestD = Infinity;
    for (const ch of chapters) {
      const r = ch.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) return ch;
      const d = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (d < bestD) { bestD = d; best = ch; }
    }
    return best;
  };
  const pin = () => root.classList.toggle('ha-pin', moving && phone());
  const frame = () => {
    raf = 0;
    if (root.classList.contains('sheet-open')) return;
    const vh = innerHeight, y = scrollY;
    const best = atMiddle();
    if (best !== cur) {
      cur = best;
      const d = best.dataset;
      stage.style.setProperty('--l1', d.light || 'var(--edk)');
      stage.style.setProperty('--l2', d.light2 || d.light || 'var(--edk)');
      stage.style.setProperty('--l3', d.light3 || d.light2 || d.light || 'var(--edk)');
      setAccent(d.light || null);
      clearTimeout(swapT);
      const want = d.obj || 'edk';
      /* read the page again when the hold is over: a slow frame must not count as holding */
      if (want !== slot.dataset.obj && !liveOn) swapT = window.setTimeout(() => { if (cur === best && atMiddle() === best) change(want, d.light); }, HOLD);
    }
    /* the bar's clock rests while the first screen shows its own */
    root.classList.toggle('ha-top', hero.getBoundingClientRect().bottom > vh * 0.35);
    /* phones: the glass becomes the emblem as the first screen leaves */
    if (root.classList.contains('ha-pin')) ha.style.setProperty('--k', smooth(clamp(y / (hero.offsetHeight * 0.62))).toFixed(4));
    /* the pose on the grid (desktop with a fine pointer: the only tier with a lean grid) */
    if (moving && !phone() && mq.fine.matches) {
      const p = poseAt(y);
      if (Math.abs(p.mx - lastPose.mx) > 0.004 || Math.abs(p.my - lastPose.my) > 0.004) { lastPose = p; media()?.pose?.(slot, p); }
    }
  };
  const soon = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const relayout = () => { pin(); measure(); lastPose = { mx: 9, my: 9 }; soon(); };
  addEventListener('scroll', soon, { passive: true });
  addEventListener('resize', relayout, { passive: true });
  addEventListener('pageshow', relayout);
  /* fonts and lazy screens change chapter heights after load */
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); soon(); }).observe(ha);
  relayout();
  /* the stage moves once the media script is there; on a first visit (not arriving through the droplet) one
     slow sweep of light crosses the glass as the light blooms */
  const start = () => {
    const m = media();
    if (!m) return;
    focusFor(slot.dataset.obj || 'edk');
    let dropped = false;
    dropped = !!slot.querySelector(".m-layer.arriving");
    if (moving && !dropped) setTimeout(() => m.arrive?.(slot), 650);
  };
  if (media()) start(); else addEventListener('load', start, { once: true });
}
