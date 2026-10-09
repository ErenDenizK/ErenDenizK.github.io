/* The media stage (ADR-0006; media research §8; the loader contract in prototypes/f/SPEC.md).
   1. The poster is in the HTML and complete on its own.
   2. After load and idle, for a slot on screen, with motion welcome: read the object's manifest
      (media/objects/<name>/manifest.json), then start the idle loop (every tier) and, on a desktop
      with a fine pointer, the lean grid: the pointer picks a fractional angle, the four nearest
      half-size frames are blended on a canvas, and at rest the exact full-size frame is drawn.
   3. A press on the object (or hover intent on its Work tile) plays its interaction clip once.
   4. At most one video plays; offscreen slots pause; hidden documents pause everything.
   Everything is drawn with plus-lighter over the exact ground; nothing here forms a stacking context. */
import { mq, reduce, motionOK, idle } from './env';

type Source = { src: string; type?: string };
type Manifest = {
  size: number;
  light?: string;
  poster?: { w: number; h: number; sources: { src: string; type: string; w: number }[] };
  lean?: { cols: number; rows: number; center: { col: number; row: number }; crop: { x: number; y: number; w: number; h: number };
    tiers: { name: string; w: number; h: number; frames: string[] }[] };
  idle?: { sources: Source[] };
  clips?: Record<string, { sources: Source[] }>;
};
type Slot = HTMLElement & {
  _layer?: Layer; _t0?: number; _timer?: number; _pending?: string | null; _sweepT?: number;
};
type Layer = HTMLElement & {
  _idle?: HTMLVideoElement | null; _idleFailed?: boolean; _clip?: HTMLVideoElement | null;
  _seq?: Lean | null; _anims?: Animation[]; _manifest?: string | null;
};
type Lean = {
  m: NonNullable<Manifest['lean']>; dir: string; half: HTMLImageElement[]; canvas: HTMLCanvasElement; ok: boolean;
  full: Map<number, HTMLImageElement>; cur: { u: number; v: number }; target: { u: number; v: number }; active: number; raf: number; restKey: number;
};

export type ObjInfo = { manifest: string | null; src: string; srcset?: { type: string; srcset: string }[]; light: string };

const MID = 360;             // a change is committed once it passes its midpoint (craft audit §4.2)
const manifests = new Map<string, Promise<Manifest | null>>();
const visible = new Set<Slot>();
let playing: HTMLVideoElement | null = null;
let enhancing = false;
let index: Record<string, ObjInfo> = {};

export const api = { changes: 0, visible, playing: () => playing, show, play, refresh, arrive };
(window as any).MediaStage = api;

function getManifest(url: string | null | undefined): Promise<Manifest | null> {
  if (!url) return Promise.resolve(null);
  if (!manifests.has(url)) manifests.set(url, fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return manifests.get(url)!;
}
const dirOf = (url: string) => url.slice(0, url.lastIndexOf('/') + 1);

const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
  for (const e of es) {
    const el = e.target as Slot;
    if (e.isIntersecting) { visible.add(el); wake(el); } else { visible.delete(el); sleep(el); }
  }
}, { rootMargin: '80px' }) : null;

/* ---- video ---- */
function pick(v: HTMLVideoElement, list: Source[], dir: string): string | null {
  for (const s of list || []) if (!s.type || v.canPlayType(s.type)) return dir + s.src;
  return null;
}
function makeVideo(list: Source[], dir: string, loop: boolean, cls: string): HTMLVideoElement | null {
  const v = document.createElement('video');
  const src = pick(v, list, dir);
  if (!src) return null;
  v.muted = true; v.defaultMuted = true; v.playsInline = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.loop = loop; v.preload = 'auto'; (v as any).disablePictureInPicture = true;
  v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
  v.className = cls;
  v.dataset.src = src;
  return v;
}
function release(v: HTMLVideoElement) {
  try { v.pause(); } catch {}
  if (playing === v) playing = null;
  v.removeAttribute('src'); try { v.load(); } catch {}
  v.remove();
}
/* play() is called at once (iOS fetches nothing before it); if it is refused (Low Power Mode, policy)
   the still stays, silently, with no play button. The swap happens on the first painted frame. */
function start(v: HTMLVideoElement, onFrame: () => void): Promise<void> {
  if (playing && playing !== v) { try { playing.pause(); } catch {} }
  playing = v;
  if (!v.getAttribute('src')) v.src = v.dataset.src!;
  return v.play().then(() => {
    if ('requestVideoFrameCallback' in v) (v as any).requestVideoFrameCallback(() => onFrame());
    else v.addEventListener('playing', () => requestAnimationFrame(() => requestAnimationFrame(onFrame)), { once: true });
  });
}

/* ---- slots and layers ---- */
function build(el: Slot) {
  if (el._layer) return;
  el._layer = el.querySelector('.m-layer') as Layer;
  el._layer._manifest = el.dataset.manifest || null;
  setGlint(el);
  if (io) io.observe(el); else visible.add(el);
  el.addEventListener('click', () => play(el, 'interact'));
}
function setGlint(el: Slot) {
  const img = el._layer?.querySelector('img') as HTMLImageElement | null;
  const g = el.querySelector('.m-glint') as HTMLElement | null;
  if (!img || !g) return;
  const set = () => { const u = `url("${img.currentSrc || img.src}")`; g.style.setProperty('-webkit-mask-image', u); g.style.maskImage = u; };
  if (img.complete) set(); else img.addEventListener('load', set, { once: true });
}
function layerFor(name: string): Layer {
  const info = index[name];
  const layer = document.createElement('div') as Layer;
  layer.className = 'm-layer';
  layer.dataset.obj = name;
  layer._manifest = info?.manifest ?? null;
  if (info) {
    const pic = document.createElement('picture');
    for (const s of info.srcset || []) { const so = document.createElement('source'); so.type = s.type; so.srcset = s.srcset; so.sizes = '470px'; pic.appendChild(so); }
    const img = new Image();
    img.className = 'm-poster'; img.alt = ''; img.decoding = 'async'; img.width = 1200; img.height = 1200;
    img.src = info.src;
    pic.appendChild(img);
    layer.appendChild(pic);
  }
  return layer;
}
function animateLayer(layer: Layer, frames: Keyframe[], o: KeyframeAnimationOptions): Animation[] {
  return [...layer.querySelectorAll('img, video, canvas')].map((c) => c.animate(frames, o));
}

/** Change the object in a slot. Never restarts mid-change: a request inside the first half is held
    and applied when the change passes its midpoint. */
function show(el: Slot, name: string, opts: { instant?: boolean; light?: string } = {}) {
  build(el);
  if (el._timer) { clearTimeout(el._timer); el._timer = 0; }
  el._pending = null;
  if (el.dataset.obj === name) return;
  const since = performance.now() - (el._t0 ?? -1e9);
  if (!opts.instant && since < MID) {
    el._pending = name;
    el._timer = window.setTimeout(() => { el._timer = 0; const n = el._pending; el._pending = null; if (n) show(el, n, opts); }, MID - since);
    return;
  }
  apply(el, name, opts);
}
function apply(el: Slot, name: string, opts: { instant?: boolean; light?: string }) {
  api.changes++;
  el._t0 = performance.now();
  const old = el._layer!;
  el.dataset.obj = name;
  el.style.setProperty('--light', opts.light || index[name]?.light || '');
  el.querySelectorAll<Layer>('.m-layer.leaving').forEach(kill);
  const neo = layerFor(name);
  el.insertBefore(neo, el.querySelector('.m-glint'));
  el._layer = neo;
  setGlint(el);
  const rm = reduce();
  old.classList.add('leaving');
  old.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch {} });
  if (opts.instant) kill(old);
  else {
    const c0 = old.querySelector('img, video, canvas');
    const op = c0 ? +getComputedStyle(c0).opacity : 1;
    const as = animateLayer(old, rm ? [{ opacity: op }, { opacity: 0 }] : [{ opacity: op, transform: 'none' }, { opacity: 0, transform: 'scale(0.97)' }],
      { duration: rm ? 150 : 360, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    old._anims = as;
    if (as[0]) as[0].onfinish = () => kill(old); else kill(old);
    animateLayer(neo, rm ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'none' }],
      { duration: rm ? 150 : 480, delay: rm ? 0 : 240, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)', fill: 'backwards' });
  }
  if (visible.has(el)) { if (!opts.instant) arrive(el); wake(el); }
}
function kill(l: Layer) {
  (l._anims || []).forEach((a) => { try { a.cancel(); } catch {} });
  l.querySelectorAll('video').forEach(release);
  if (l._seq) cancelAnimationFrame(l._seq.raf);
  l.remove();
}
/** One slow sweep of light across the object when it arrives: the only life without a loop. */
function arrive(el: Slot) {
  if (reduce()) return;
  el.classList.remove('sweep'); void el.offsetWidth; el.classList.add('sweep');
  clearTimeout(el._sweepT);
  el._sweepT = window.setTimeout(() => el.classList.remove('sweep'), 1900);
}

/* ---- progressive enhancement of a visible slot ---- */
function wake(el: Slot) {
  if (!el._layer || document.hidden || !visible.has(el) || !el.offsetParent) return;
  const layer = el._layer;
  if (!enhancing || !motionOK()) return;
  if (layer._idle) { start(layer._idle, () => {}).catch(() => {}); return; }
  getManifest(layer._manifest).then((m) => {
    if (!m || !layer.isConnected || el._layer !== layer || !visible.has(el)) return;
    const dir = dirOf(layer._manifest!);
    if (m.idle && !layer._idleFailed && !layer._idle) {
      const v = makeVideo(m.idle.sources, dir, true, 'm-idle');
      if (v) {
        layer._idle = v;
        layer.appendChild(v);
        start(v, () => { if (layer.isConnected) layer.classList.add('video-on'); })
          .catch(() => { release(v); layer._idle = null; layer._idleFailed = true; });
      }
    }
    if (m.lean && mq.wide.matches && mq.fine.matches && !layer._seq) loadLean(el, layer, m, dir);
  });
}
function sleep(el: Slot) {
  const gone = !el.offsetParent;
  el.querySelectorAll<Layer>('.m-layer').forEach((layer) => {
    layer.querySelectorAll('video').forEach((v) => {
      if (gone) { release(v); if (layer._idle === v) { layer._idle = null; layer.classList.remove('video-on'); } if (layer._clip === v) layer._clip = null; }
      else { try { v.pause(); } catch {} if (playing === v) playing = null; }
    });
  });
}

/* ---- lean ---- */
function loadLean(el: Slot, layer: Layer, m: Manifest, dir: string) {
  const lean = m.lean!;
  const tier = lean.tiers.find((t) => t.name === 'half') || lean.tiers[0];
  const c = document.createElement('canvas');
  c.width = tier.w * 2; c.height = tier.h * 2;   // drawn at 2x so the full frame at rest is sharp
  const k = 100 / m.size;
  Object.assign(c.style, { left: lean.crop.x * k + '%', top: lean.crop.y * k + '%', width: lean.crop.w * k + '%', height: lean.crop.h * k + '%', inset: 'auto' });
  const seq: Lean = { m: lean, dir, half: [], canvas: c, ok: false, full: new Map(), cur: { u: 0.5, v: 0.5 }, target: { u: 0.5, v: 0.5 }, active: 0, raf: 0, restKey: -1 };
  layer._seq = seq;
  let left = tier.frames.length;
  tier.frames.forEach((u, i) => {
    const img = new Image(); img.decoding = 'async'; img.src = dir + u;
    img.decode().then(() => {
      seq.half[i] = img;
      if (--left === 0 && layer.isConnected) { layer.appendChild(c); seq.ok = true; draw(seq); }
    }).catch(() => { layer._seq = null; });
  });
}
function cell(seq: Lean, col: number, row: number) { return row * seq.m.cols + col; }
/* Bilinear blend of the four nearest frames; at rest (target reached) the exact full-size frame. */
function draw(seq: Lean) {
  const { cols, rows } = seq.m;
  const x = seq.cur.u * (cols - 1), y = seq.cur.v * (rows - 1);
  const c0 = Math.floor(x), r0 = Math.floor(y), c1 = Math.min(cols - 1, c0 + 1), r1 = Math.min(rows - 1, r0 + 1);
  const fx = x - c0, fy = y - r0;
  const ctx = seq.canvas.getContext('2d')!;
  const W = seq.canvas.width, H = seq.canvas.height;
  const atRest = Math.abs(seq.cur.u - seq.target.u) < 0.002 && Math.abs(seq.cur.v - seq.target.v) < 0.002;
  const nearest = cell(seq, Math.round(x), Math.round(y));
  const full = atRest ? seq.full.get(nearest) : undefined;
  ctx.globalAlpha = 1;
  if (full) { ctx.drawImage(full, 0, 0, W, H); return; }
  /* draw the heaviest corner opaque, then blend the others in by their share (renormalised) */
  const corners = [[c0, r0, (1 - fx) * (1 - fy)], [c1, r0, fx * (1 - fy)], [c0, r1, (1 - fx) * fy], [c1, r1, fx * fy]] as const;
  let acc = 0;
  for (const [cc, rr, w] of corners) {
    if (w < 0.004) continue;
    const img = seq.half[cell(seq, cc, rr)];
    if (!img) continue;
    acc += w;
    ctx.globalAlpha = w / acc;
    ctx.drawImage(img, 0, 0, W, H);
  }
  if (atRest) loadFull(seq, nearest);
}
function loadFull(seq: Lean, i: number) {
  if (seq.full.has(i) || seq.restKey === i) return;
  seq.restKey = i;
  const tier = seq.m.tiers.find((t) => t.name === 'full');
  if (!tier) return;
  const img = new Image(); img.decoding = 'async'; img.src = seq.dir + tier.frames[i];
  img.decode().then(() => {
    seq.full.set(i, img);
    while (seq.full.size > 30) seq.full.delete(seq.full.keys().next().value!);   // keep 25-40 decoded frames (ADR-0006 item 3)
    if (seq.restKey === i) draw(seq);
  }).catch(() => {});
}
/* Critically damped follow, about 120 ms (media research §5). */
function step(el: Slot) {
  const seq = el._layer?._seq;
  if (!seq || !seq.ok) return;
  cancelAnimationFrame(seq.raf);
  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const a = 1 - Math.exp(-dt / 0.06);
    seq.cur.u += (seq.target.u - seq.cur.u) * a;
    seq.cur.v += (seq.target.v - seq.cur.v) * a;
    const done = Math.abs(seq.cur.u - seq.target.u) < 0.002 && Math.abs(seq.cur.v - seq.target.v) < 0.002;
    if (done) { seq.cur.u = seq.target.u; seq.cur.v = seq.target.v; }
    draw(seq);
    if (!done) seq.raf = requestAnimationFrame(tick);
  };
  seq.raf = requestAnimationFrame(tick);
}

/* ---- interaction clips: play once over the idle state, then hand back ---- */
function play(el: Slot, clip: string): boolean {
  const layer = el._layer;
  if (!layer || !motionOK() || layer._clip || !visible.has(el)) return false;
  getManifest(layer._manifest).then((m) => {
    const spec = m?.clips?.[clip];
    if (!spec || layer._clip || el._layer !== layer) return;
    const v = makeVideo(spec.sources, dirOf(layer._manifest!), false, 'm-clip');
    if (!v) return;
    layer._clip = v;
    layer.appendChild(v);
    const back = () => { if (layer._idle) start(layer._idle, () => {}).catch(() => {}); };
    start(v, () => { layer.classList.add('clip-on'); }).then(() => {
      v.addEventListener('ended', () => {
        layer.classList.remove('clip-on');
        setTimeout(() => { release(v); layer._clip = null; back(); }, 220);
      }, { once: true });
    }).catch(() => { release(v); layer._clip = null; back(); });
  });
  return true;
}

/* ---- pointer: lean, a small parallax and a glint that follows the hand (fine pointer only) ---- */
let px = 0, py = 0, raf = 0, idleT = 0;
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce()) return;
  px = e.clientX; py = e.clientY;
  if (!raf) raf = requestAnimationFrame(tick);
}, { passive: true });
function tick() {
  raf = 0;
  visible.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const mx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (innerWidth / 2)));
    const my = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (innerHeight / 2)));
    el.style.setProperty('--gx', (50 + mx * 28).toFixed(1) + '%');
    el.style.setProperty('--gy', (40 + my * 24).toFixed(1) + '%');
    const layer = el._layer, seq = layer?._seq;
    if (seq && seq.ok) {
      /* the lean replaces the parallax: the object turns toward the pointer (yaw +-16, pitch +-4) */
      seq.target = { u: (mx + 1) / 2, v: (1 - my) / 2 };
      layer!.classList.add('seq-on');
      el.style.setProperty('--mx', '0'); el.style.setProperty('--my', '0');
      step(el);
    } else {
      el.style.setProperty('--mx', mx.toFixed(3));
      el.style.setProperty('--my', my.toFixed(3));
    }
  });
  /* after the pointer rests, the object eases back to its centre and the idle loop shows again */
  clearTimeout(idleT);
  idleT = window.setTimeout(() => visible.forEach((el) => {
    const layer = el._layer, seq = layer?._seq;
    if (!seq || !seq.ok) return;
    seq.target = { u: seq.m.center.col / (seq.m.cols - 1), v: seq.m.center.row / Math.max(1, seq.m.rows - 1) };
    step(el);
    setTimeout(() => { if (layer!._idle) layer!.classList.remove('seq-on'); }, 400);
  }), 2500);
}

document.addEventListener('visibilitychange', () => visible.forEach((el) => (document.hidden ? sleep(el) : wake(el))));
/** Re-check slots after something was shown or hidden (IO does not fire for display changes everywhere). */
function refresh() {
  document.querySelectorAll<Slot>('.media').forEach((el) => {
    build(el);
    if (el.offsetParent) { if (visible.has(el)) wake(el); } else sleep(el);
  });
}

export function initMedia(root: ParentNode = document) {
  const idx = document.getElementById('media-index');
  if (idx) try { index = { ...index, ...JSON.parse(idx.textContent || '{}') }; } catch {}
  root.querySelectorAll<Slot>('.media').forEach(build);
}
function later() { idle(() => { enhancing = true; visible.forEach(wake); }); }
if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
