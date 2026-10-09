/* The media stage (ADR-0006; media research §8; the loader contract in prototypes/f/SPEC.md and the
   manifest in tools/objects/README.md).
   Tiers (ADR-0006 item 6):
   - every visitor: the poster, in the HTML, complete on its own;
   - motion welcome (no reduced motion, no Save-Data, play() not refused), phones and desktops:
     the idle loop, and the droplet change between tabs (droplet.out here, droplet.in on arrival);
   - desktop with a fine pointer, in addition: the lean grid (the four nearest half-size frames summed
     with "lighter", the exact bilinear blend; at rest it settles on an exact full-size frame) and the
     interaction clip on a press or on hover intent over a Work row.
   At most one video plays; offscreen slots pause; hidden documents pause everything. Everything is
   ground-subtracted and drawn with plus-lighter inside .m-stage. */
import { mq, reduce, motionOK, idle } from './env';

type Source = { src: string; type?: string };
type Manifest = {
  size: number;
  lean?: { cols: number; rows: number; center: { col: number; row: number }; crop: { x: number; y: number; w: number; h: number };
    tiers: { name: string; w: number; h: number; frames: string[] }[] };
  idle?: { sources: Source[] };
  clips?: Record<string, { sources: Source[] }>;
  droplet?: { duration?: number; out?: { sources: Source[] }; in?: { sources: Source[] } };
};
type Slot = HTMLElement & { _layer?: Layer; _t0?: number; _timer?: number; _pending?: string | null; _sweepT?: number };
type Layer = HTMLElement & {
  _idle?: HTMLVideoElement | null; _idleFailed?: boolean; _clip?: HTMLVideoElement | null; _drop?: HTMLVideoElement | null;
  _seq?: Lean | null; _anims?: Animation[]; _manifest?: string | null;
};
type Lean = {
  m: NonNullable<Manifest['lean']>; dir: string; half: (ImageBitmap | HTMLImageElement)[]; canvas: HTMLCanvasElement; ok: boolean;
  full: Map<number, HTMLImageElement>; empty: Set<number>; cur: { u: number; v: number }; target: { u: number; v: number }; raf: number; restKey: number;
};
export type ObjInfo = { manifest: string | null; src: string; srcset?: { type: string; srcset: string }[]; shadow?: { src: string; sources: { type: string; src: string }[] } | null; light: string };

const MID = 360;             // a change is committed once it passes its midpoint (craft audit §4.2)
const manifests = new Map<string, Promise<Manifest | null>>();
const manifestNow = new Map<string, Manifest>();
const visible = new Set<Slot>();
let playing: HTMLVideoElement | null = null;
let enhancing = false;
let refused = false;         // a play() was refused (Low Power Mode, policy): posters only from now on
let index: Record<string, ObjInfo> = {};
const desktopTier = () => mq.wide.matches && mq.fine.matches;
const moving = () => motionOK() && !refused;

export const api = { changes: 0, visible, playing: () => playing, show, play, refresh, arrive, leave };
(window as any).MediaStage = api;

function getManifest(url: string | null | undefined): Promise<Manifest | null> {
  if (!url) return Promise.resolve(null);
  if (!manifests.has(url)) manifests.set(url, fetch(url).then((r) => (r.ok ? r.json() : null)).then((m) => { if (m) manifestNow.set(url, m); return m; }).catch(() => null));
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
function makeVideo(list: Source[], dir: string, loop: boolean, cls: string): HTMLVideoElement | null {
  const v = document.createElement('video');
  const s = (list || []).find((x) => !x.type || v.canPlayType(x.type));
  if (!s) return null;
  v.muted = true; v.defaultMuted = true; v.playsInline = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.loop = loop; v.preload = 'auto'; (v as any).disablePictureInPicture = true;
  v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
  v.className = cls;
  v.dataset.src = dir + s.src;
  return v;
}
function release(v: HTMLVideoElement) {
  try { v.pause(); } catch {}
  if (playing === v) playing = null;
  v.removeAttribute('src'); try { v.load(); } catch {}
  v.remove();
}
/* play() is called at once (iOS fetches nothing before it); if it is refused the still stays, silently,
   with no play button. The swap happens on the first painted frame. */
function start(v: HTMLVideoElement, onFrame: () => void): Promise<void> {
  if (playing && playing !== v) { try { playing.pause(); } catch {} }
  playing = v;
  if (!v.getAttribute('src')) v.src = v.dataset.src!;
  return v.play().then(() => {
    if ('requestVideoFrameCallback' in v) (v as any).requestVideoFrameCallback(() => onFrame());
    else (v as HTMLVideoElement).addEventListener('playing', () => requestAnimationFrame(() => requestAnimationFrame(onFrame)), { once: true });
  }, (err) => { if (err && err.name === 'NotAllowedError') refused = true; throw err; });
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
  return [...layer.querySelectorAll('img, video, .m-lean')].map((c) => c.animate(frames, o));
}

/** Change the object in a slot (Work's hover intent). Never restarts mid-change: a request inside the
    first half is held and applied when the change passes its midpoint. */
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
  /* the contact shadow follows the object */
  el.querySelector('.m-shadow-pic')?.remove();
  const sh = index[name]?.shadow;
  if (sh) {
    const pic = document.createElement('picture'); pic.className = 'm-shadow-pic';
    for (const s of sh.sources) { const so = document.createElement('source'); so.type = s.type; so.srcset = s.src; pic.appendChild(so); }
    const img = new Image(); img.className = 'm-shadow'; img.alt = ''; img.src = sh.src; pic.appendChild(img);
    el.insertBefore(pic, el.querySelector('.m-stage'));
  }
  const neo = layerFor(name);
  const glint = el.querySelector('.m-glint')!;
  glint.parentNode!.insertBefore(neo, glint);
  el._layer = neo;
  setGlint(el);
  const rm = reduce();
  old.classList.add('leaving');
  old.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch {} });
  if (opts.instant) kill(old);
  else {
    const c0 = old.querySelector('img, video');
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
/** One slow sweep of light across the object when it arrives. */
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
  if (!enhancing || !moving() || layer.classList.contains('arriving')) return;
  if (layer._idle) { start(layer._idle, () => {}).catch(() => {}); return; }
  getManifest(layer._manifest).then((m) => {
    if (!m || !layer.isConnected || el._layer !== layer || !visible.has(el) || layer.classList.contains('arriving')) return;
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
    if (m.lean && desktopTier() && !layer._seq) loadLean(layer, m, dir);
  });
}
function sleep(el: Slot) {
  const gone = !el.offsetParent;
  el.querySelectorAll<Layer>('.m-layer').forEach((layer) => {
    layer.querySelectorAll('video').forEach((v) => {
      if (v.classList.contains('m-drop')) return;
      if (gone) { release(v); if (layer._idle === v) { layer._idle = null; layer.classList.remove('video-on'); } if (layer._clip === v) layer._clip = null; }
      else { try { v.pause(); } catch {} if (playing === v) playing = null; }
    });
  });
}

/* ---- lean ---- */
function loadLean(layer: Layer, m: Manifest, dir: string) {
  const lean = m.lean!;
  const tier = lean.tiers.find((t) => t.name === 'half') || lean.tiers[0];
  const full = lean.tiers.find((t) => t.name === 'full') || tier;
  const wrap = document.createElement('div'); wrap.className = 'm-lean';
  const c = document.createElement('canvas');
  c.width = full.w; c.height = full.h;
  const k = 100 / m.size;
  Object.assign(c.style, { left: lean.crop.x * k + '%', top: lean.crop.y * k + '%', width: lean.crop.w * k + '%', height: lean.crop.h * k + '%' });
  wrap.appendChild(c);
  const seq: Lean = { m: lean, dir, half: [], canvas: c, ok: false, full: new Map(), empty: new Set(), cur: { u: 0.5, v: 0.5 }, target: { u: 0.5, v: 0.5 }, raf: 0, restKey: -1 };
  const ci = lean.center.col / (lean.cols - 1), cj = lean.center.row / Math.max(1, lean.rows - 1);
  seq.cur = { u: ci, v: cj }; seq.target = { u: ci, v: cj };
  layer._seq = seq;
  Promise.all(tier.frames.map((u) => fetch(dir + u).then((r) => r.blob()).then((b) => createImageBitmap(b)))).then((frames) => {
    if (!layer.isConnected) { frames.forEach((f) => f.close()); return; }
    seq.half = frames;
    /* a render can drop the object from a frame (tools/objects/README.md); such frames are left out of
       the blend instead of flashing black */
    const probe = document.createElement('canvas'); probe.width = probe.height = 16;
    const pc = probe.getContext('2d', { willReadFrequently: true })!;
    frames.forEach((f, i) => {
      pc.clearRect(0, 0, 16, 16); pc.drawImage(f, 0, 0, 16, 16);
      const d = pc.getImageData(0, 0, 16, 16).data;
      let sum = 0; for (let k = 0; k < d.length; k += 4) sum += d[k] + d[k + 1] + d[k + 2];
      if (sum < 16 * 16 * 3) seq.empty.add(i);
    });
    layer.appendChild(wrap);
    seq.ok = true;
    draw(seq);
  }).catch(() => { layer._seq = null; });
}
const cell = (seq: Lean, col: number, row: number) => row * seq.m.cols + col;
/* The four nearest frames, weighted to sum to 1, added with "lighter" over black: the exact bilinear
   blend (tools/objects/README.md). On an exact cell with its full-size frame decoded, that frame alone. */
function draw(seq: Lean) {
  const { cols, rows } = seq.m;
  const fx = seq.cur.u * (cols - 1), fy = seq.cur.v * (rows - 1);
  const i0 = Math.min(Math.floor(fx), cols - 2), j0 = Math.max(0, Math.min(Math.floor(fy), rows - 2));
  const tx = fx - i0, ty = rows > 1 ? fy - j0 : 0;
  const ctx = seq.canvas.getContext('2d')!;
  const W = seq.canvas.width, H = seq.canvas.height;
  const exact = Math.abs(fx - Math.round(fx)) < 1e-3 && Math.abs(fy - Math.round(fy)) < 1e-3;
  const at = cell(seq, Math.round(fx), Math.round(fy));
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (exact && !seq.empty.has(at)) {
    const f = seq.full.get(at);
    if (f) { ctx.drawImage(f, 0, 0, W, H); return; }
    loadFull(seq, at);
  }
  ctx.globalCompositeOperation = 'lighter';
  let w = [[i0, j0, (1 - tx) * (1 - ty)], [i0 + 1, j0, tx * (1 - ty)], [i0, j0 + 1, (1 - tx) * ty], [i0 + 1, j0 + 1, tx * ty]]
    .map(([i, j, a]) => [cell(seq, i, Math.min(rows - 1, j)), a])
    .filter(([k, a]) => a > 0.002 && seq.half[k] && !seq.empty.has(k));
  if (!w.length) {   // every neighbour is a dropped frame: use the middle row at this angle
    const mid = Math.floor(rows / 2);
    w = [[cell(seq, i0, mid), 1 - tx], [cell(seq, i0 + 1, mid), tx]].filter(([k, a]) => a > 0.002 && !seq.empty.has(k));
  }
  const total = w.reduce((n, [, a]) => n + a, 0) || 1;
  for (const [k, a] of w) { ctx.globalAlpha = a / total; ctx.drawImage(seq.half[k], 0, 0, W, H); }
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
function follow(seq: Lean) {
  cancelAnimationFrame(seq.raf);
  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = 1 - Math.exp(-dt * 8);
    seq.cur.u += (seq.target.u - seq.cur.u) * k;
    seq.cur.v += (seq.target.v - seq.cur.v) * k;
    if (Math.abs(seq.cur.u - seq.target.u) < 1e-3) seq.cur.u = seq.target.u;
    if (Math.abs(seq.cur.v - seq.target.v) < 1e-3) seq.cur.v = seq.target.v;
    draw(seq);
    if (seq.cur.u !== seq.target.u || seq.cur.v !== seq.target.v) seq.raf = requestAnimationFrame(tick);
  };
  seq.raf = requestAnimationFrame(tick);
}

/* ---- interaction clips (desktop tier): once over the idle state, then hand back ---- */
function play(el: Slot, clip: string): boolean {
  const layer = el._layer;
  if (!layer || !moving() || !desktopTier() || layer._clip || layer._drop || !visible.has(el)) return false;
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

/* ---- the droplet change between tabs (ADR-0006 item 5, ADR-0007) ----
   Leaving: the stage starts its droplet.out, sped up to about 350 ms, and the page navigates at the same
   moment; the old page keeps melting until the new one is ready, and the cross-document view transition
   carries the rest, crossfading at the droplet (owner, 2026-10-09: barely felt, still readable).
   Arriving: the stage shows only its glow until droplet.in (droplet back to the object) has its first frame. */
const DROP_KEY = 'edk-droplet';
const MELT = 0.35;           // seconds
let leaving: Promise<void> | null = null;
function stageSlot(): Slot | null {
  const el = document.querySelector<Slot>('.media.stage');
  return el && el.offsetParent && visible.has(el) ? el : null;
}
/** Resolves when the page should navigate: as soon as the melt is on screen (or at once, or after
    120 ms if it cannot start). The melt then plays on while the next page loads. */
function leave(): Promise<void> {
  if (leaving) return Promise.resolve();
  try { sessionStorage.setItem(DROP_KEY, String(Date.now())); } catch {}
  const el = stageSlot();
  const layer = el?._layer;
  if (!el || !layer || !enhancing || !moving() || !layer._manifest) return Promise.resolve();
  const m = manifestNow.get(layer._manifest);
  const spec = m?.droplet?.out;
  const v = spec && makeVideo(spec.sources, dirOf(layer._manifest), false, 'm-drop');
  if (!v) return Promise.resolve();
  leaving = new Promise<void>((resolve) => {
    const t = window.setTimeout(resolve, 120);
    layer._drop = v;
    v.defaultPlaybackRate = v.playbackRate = (m!.droplet!.duration || 0.4) / MELT;
    layer.appendChild(v);
    start(v, () => { v.classList.add('on'); layer.classList.add('dropping'); clearTimeout(t); resolve(); })
      .catch(() => { clearTimeout(t); resolve(); });
  });
  return leaving;
}
function arriveByDroplet() {
  let at = 0;
  try { at = +(sessionStorage.getItem(DROP_KEY) || 0); sessionStorage.removeItem(DROP_KEY); } catch {}
  const flag = document.documentElement;
  const el = document.querySelector<Slot>('.media.stage');
  if (!at || Date.now() - at > 4000 || !moving() || !el || !el.dataset.manifest) { delete flag.dataset.arrive; return; }
  build(el);
  const layer = el._layer!;
  layer.classList.add('arriving');
  delete flag.dataset.arrive;
  const show = () => { if (!layer.classList.contains('arriving')) return; layer.classList.remove('arriving'); arrive(el); wake(el); };
  const t = window.setTimeout(show, 1400);    // the poster comes back if the clip is slow
  getManifest(layer._manifest).then((m) => {
    const spec = m?.droplet?.in;
    const v = spec && makeVideo(spec.sources, dirOf(layer._manifest!), false, 'm-drop');
    if (!v || !layer.classList.contains('arriving')) { clearTimeout(t); show(); return; }
    layer._drop = v;
    layer.appendChild(v);
    start(v, () => { clearTimeout(t); v.classList.add('on'); }).then(() => {
      v.addEventListener('ended', () => {
        layer.classList.remove('arriving');
        enhancing = true;
        wake(el);
        setTimeout(() => { release(v); layer._drop = null; }, 220);
      }, { once: true });
    }).catch(() => { clearTimeout(t); show(); });
  });
}

/* ---- pointer (fine pointer only): the lean, or a small parallax, and a glint that follows the hand ---- */
let px = 0, py = 0, raf = 0, at = -1e9, settleT = 0;
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce()) return;
  px = e.clientX; py = e.clientY; at = performance.now();
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
    if (seq && seq.ok && !layer!._clip && !layer!._drop) {
      /* the object turns toward the pointer: yaw +-16 degrees, pitch +-4 (the grid's arc) */
      seq.target = { u: Math.min(1, Math.max(0, 0.5 + mx * 0.7)), v: Math.min(1, Math.max(0, 0.5 - my * 0.7)) };
      layer!.classList.add('seq-on');
      el.style.setProperty('--mx', '0'); el.style.setProperty('--my', '0');
      follow(seq);
    } else {
      el.style.setProperty('--mx', mx.toFixed(3));
      el.style.setProperty('--my', my.toFixed(3));
    }
  });
  /* when the pointer rests, settle on the nearest exact frame; after a longer rest, back to the idle loop */
  clearTimeout(settleT);
  settleT = window.setTimeout(() => visible.forEach((el) => {
    const layer = el._layer, seq = layer?._seq;
    if (!seq || !seq.ok) return;
    const { cols, rows } = seq.m;
    seq.target = { u: Math.round(seq.target.u * (cols - 1)) / (cols - 1), v: Math.round(seq.target.v * (rows - 1)) / Math.max(1, rows - 1) };
    follow(seq);
    setTimeout(() => {
      if (performance.now() - at < 4000 || !layer!._idle) return;
      layer!.classList.remove('seq-on');
    }, 4200);
  }), 300);
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
arriveByDroplet();
function later() { idle(() => { enhancing = true; visible.forEach(wake); }); }
if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
/* bfcache: a page restored mid-droplet shows its object again */
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  leaving = null;
  document.querySelectorAll<Slot>('.media').forEach((el) => {
    const l = el._layer;
    if (!l) return;
    l.classList.remove('dropping', 'arriving');
    if (l._drop) { release(l._drop); l._drop = null; }
    wake(el);
  });
});
