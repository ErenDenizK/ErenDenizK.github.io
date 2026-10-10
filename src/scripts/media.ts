/* The media stage (ADR-0006; media research §8; the loader contract in prototypes/f/SPEC.md and the
   manifest in tools/objects/README.md).
   Tiers (ADR-0006 item 6, amended 2026-10-10):
   - every visitor: the poster, in the HTML, complete on its own;
   - motion welcome (no reduced motion, no Save-Data), phones and desktops: the float, the exact
     poster (or lean frame) bobbing as a whole in whole device pixels, transform only (WAAPI, below);
     and the droplet change between tabs (droplet.out here, droplet.in on arrival). The float replaced
     the idle loop, which was built from crossfaded 2° stills and pulsed in sharpness four times a
     second, with a seam every 6 s (site audit 2026-10-10 §3; real-time 3D study §1.2); `?idle=blend`
     brings that loop back for comparison;
   - phones and tablets, when the manifest has the optional `spin` loop: that loop (edk's letters
     turning, rendered frame by frame in Cycles; phone motion research,
     docs/research/2026-10-phone-motion.md); `?spin=0` leaves the float alone;
   - desktop with a fine pointer, in addition: the lean grid and the interaction clip on a press. The
     lean answers a pointer near the object only (lean.ts), returns to rest when the pointer leaves,
     moves on a spring, shows one exact frame for most poses with a short dissolve to the next (snapT),
     and comes to rest on an exact frame as the tail of the hand's own movement. It draws full-size
     frames decoded at the canvas's own size around the current pose, on a canvas that covers whole
     device pixels, so moving and resting are as sharp as the poster. A press while leaning glides
     to the rest pose first (the clip was rendered there) and hops from it.
   At most one video plays; offscreen slots pause; hidden documents pause everything. Everything is
   ground-subtracted and drawn with plus-lighter inside .m-stage.
   Solo slots (data-solo; Work has one per project, ADR-0010): only the one the page focuses (focus())
   goes past its poster; the others keep the still, and a solo slot that loses focus or leaves the
   screen gives back its videos and decoded frames at once.
   Behind the opt-in flag (live/flag.ts, ADR-0009 proposed), the Home object and the Home showcase are
   handed to the live frame engine instead (live/engine.ts, loaded only then); the droplet change
   between tabs stays here. Without the flag nothing below changes. */
import { mq, reduce, motionOK, idle } from './env';
import { liveOn, LIVE_SLOTS } from './live/flag';
import { aim, cellFor, REST_MS } from './lean';

type Source = { src: string; type?: string };
type Manifest = {
  size: number;
  lean?: { cols: number; rows: number; center: { col: number; row: number }; crop: { x: number; y: number; w: number; h: number }; stepDeg?: { yaw: number; pitch: number };
    tiers: { name: string; w: number; h: number; frames: string[] }[] };
  idle?: { sources: Source[] };
  spin?: { sources: Source[] };
  clips?: Record<string, { sources: Source[] }>;
  droplet?: { duration?: number; out?: { sources: Source[] }; in?: { sources: Source[] } };
};
type Slot = HTMLElement & { _layer?: Layer; _t0?: number; _timer?: number; _pending?: string | null; _sweepT?: number };
type Frame = ImageBitmap | HTMLImageElement;
type Layer = HTMLElement & {
  _idle?: HTMLVideoElement | null; _idleFailed?: boolean; _clip?: HTMLVideoElement | null; _drop?: HTMLVideoElement | null;
  _seq?: Lean | null; _anims?: Animation[]; _manifest?: string | null;
};
type Lean = {
  m: NonNullable<Manifest['lean']>; S: number; dir: string; half: Frame[]; canvas: HTMLCanvasElement; ok: boolean; slot: Slot;
  /** full-size frames: the fetched files, and an LRU of frames decoded at the canvas's size */
  blobs: Map<number, Promise<Blob | null>>; full: Map<number, ImageBitmap>; decoding: Set<number>; cap: number;
  /** blend full-size frames: the canvas shows more pixels than the half-size frames have */
  useFull: boolean; dw: number; dh: number;
  /** where the frame sits in the canvas, in device pixels (the canvas box is snapped, the frame is not moved) */
  ox: number; oy: number; pw: number; ph: number;
  empty: Set<number>; cur: { u: number; v: number }; vel: { u: number; v: number }; target: { u: number; v: number }; raf: number;
  /** gliding to the rest pose for the interaction clip; resolves once there */
  hop: boolean; centred: (() => void) | null;
  /** what the last draw showed (tests and the HUD-less measurements read it) */
  drawn: { exact: boolean; full: boolean; u: number; v: number };
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
let current: Slot | null = null;   // the focused solo slot
const desktopTier = () => mq.wide.matches && mq.fine.matches;
const benched = (el: Slot) => el.hasAttribute('data-solo') && el !== current;
const moving = () => motionOK() && !refused;
const spinOff = /[?&]spin=0\b/.test(location.search);
const idleBlend = /[?&]idle=blend\b/.test(location.search);
/** The loop a slot plays: the real-rendered spin on phones and tablets where there is one; the blended
    idle only for the ?idle=blend comparison. Otherwise there is no loop: the poster floats. */
const loopOf = (m: Manifest) => (!desktopTier() && !spinOff && m.spin) || (idleBlend ? m.idle : undefined);

/* ---- the float: the layer showing the exact poster (or lean frame, or clip) bobs as a whole, in whole
   device pixels (ADR-0006 amendment of 2026-10-10, evening). A bitmap moved by a fraction of a pixel, or
   turned by any angle, is resampled by the compositor: the float's sway and roll had the object at 0.48-0.58
   of its still sharpness most of the time, and a photograph of a 3D object turning in its own plane reads
   as a card. So only the bob is kept, as a sine of BOB of the slot quantised to device pixels: each step
   holds an exact, crisp position (measured as sharp as the still at DPR 1, 1.5 and 2). Every floating
   layer shares one phase, counted from the first float on the page, so a layer that replaces another (a
   change of object) floats on in step; offscreen it pauses. ---- */
const BOB = 0.0055, BOB_MS = 6980;
let floatT0: number | null = null;
type Floater = HTMLElement & { _float?: Animation | null };
/** The bob as step keyframes: -A sin(2 pi t) rounded to whole device pixels, a keyframe at each change. */
function bobFrames(el: HTMLElement): Keyframe[] {
  const dpr = devicePixelRatio || 1;
  const A = Math.max(1, Math.round(BOB * el.getBoundingClientRect().width * dpr));
  const ks: Keyframe[] = [];
  let last = NaN;
  for (let i = 0, N = 2048; i <= N; i++) {
    const n = Math.round(-A * Math.sin((2 * Math.PI * i) / N)) || 0;
    if (n !== last || i === N) { ks.push({ offset: i / N, translate: `0 ${n / dpr}px`, easing: 'steps(1, end)' }); last = n; }
  }
  return ks;
}
function floatLayer(layer: Floater, el: Slot) {
  if (!moving() || reduce() || !('animate' in layer)) return;
  layer._float?.cancel();
  const a = layer.animate(bobFrames(el), { duration: BOB_MS, iterations: Infinity });
  if (floatT0 === null) floatT0 = (document.timeline.currentTime as number) ?? 0;
  a.startTime = floatT0;
  layer._float = a;
}
function float(el: Slot, on: boolean) {
  const layers = [...el.querySelectorAll<Floater>('.m-layer')];
  if (!on) { el.classList.add('float-off'); layers.forEach((l) => l._float?.pause()); return; }
  el.classList.remove('float-off');
  if (el.classList.contains('floating')) { layers.forEach((l) => { if (l._float && floatT0 !== null) l._float.startTime = floatT0; }); return; }
  if (isLive(el) || !moving()) return;
  layers.forEach((l) => floatLayer(l, el));
  el.classList.add('floating');
}

/* The embassy's signature clip (scripts/embassy.ts) shares the one-video rule: claiming pauses whatever
   plays here; a stage that starts again pauses the clip in turn (start() above). */
function claimVideo(v: HTMLVideoElement) { if (playing && playing !== v) { try { playing.pause(); } catch {} } playing = v; }
function yieldVideo(v: HTMLVideoElement) { if (playing === v) playing = null; }
export const api = { changes: 0, visible, playing: () => playing, show, play, refresh, arrive, leave, focus, focused: () => current, claimVideo, yieldVideo, refused: () => refused };
const live = liveOn ? import('./live/engine') : null;
live?.then((L) => L.init()).catch(() => {});
const isLive = (el: Slot) => !!live && LIVE_SLOTS.has(el.dataset.slot || '');
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
  arbitrate();
  aimSoon();   // a slot back in view looks where the pointer is now, not where it was (audit §4)
}, { rootMargin: '80px' }) : null;

/* Where two slots are visible at once (a phone's Home shows the pinned object and, below it, the
   showcase), the loop belongs to the slot whose centre is nearest the middle of the window, and it moves
   as the page scrolls. Before, the second slot to wake paused the first mid-play(), whose play()
   rejected with AbortError, and the first slot gave up its loop for the rest of the visit: a phone's
   Home object never moved (phone motion research §4). */
const off = (el: Slot) => { const r = el.getBoundingClientRect(); return Math.abs(r.top + r.height / 2 - innerHeight / 2); };
const owner = () => (playing?.classList.contains('m-idle') ? playing.closest<Slot>('.media') : null);
/** Another visible slot's loop is playing and that slot is nearer the middle than this one. */
function outranked(el: Slot) {
  const o = owner();
  return !!o && o !== el && visible.has(o) && off(o) <= off(el);
}
function arbitrate() {
  const o = owner();
  if (!o || visible.size < 2) return;
  let best: Slot = o;
  visible.forEach((el) => { if (off(el) < off(best) - 24) best = el; });   // 24 px: no flicker at the tie
  if (best !== o) wake(best);
}
let arb = 0;
addEventListener('scroll', () => { if (!arb) arb = requestAnimationFrame(() => { arb = 0; arbitrate(); }); }, { passive: true });
const showVideo = (layer: Layer) => () => { if (layer.isConnected) layer.classList.add('video-on'); };

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
/** Put the stage (and the contact shadow) on whole device pixels of the document: grid() for its origin
    and its size, the nearest such box, at most half a grid step away (2 CSS px at DPR 1.25). A slot laid
    out at x 878.31 and 470 px wide is 587.5 device pixels at x 1097.9 at DPR 1.25, and the poster drawn
    there was resampled twice: 0.54 of the same file drawn on whole pixels (ADR-0006 amendment of
    2026-10-10, evening). Without the script the stage simply fills the slot. */
function fit(el: Slot) {
  const parts = [el.querySelector<HTMLElement>('.m-stage'), el.querySelector<HTMLElement>('.m-shadow')].filter(Boolean) as HTMLElement[];
  const r = el.getBoundingClientRect();
  if (!r.width) return;
  const dpr = devicePixelRatio || 1, g = grid(dpr), x0 = r.left + scrollX, y0 = r.top + scrollY;
  const gx = Math.round(x0 / g) * g, gy = Math.round(y0 / g) * g, gw = Math.max(g, Math.round(r.width / g) * g), gh = Math.max(g, Math.round(r.height / g) * g);
  const box = { inset: 'auto', left: `${gx - x0}px`, top: `${gy - y0}px`, width: `${gw}px`, height: `${gh}px` };
  parts.forEach((p) => Object.assign(p.style, box));
}
function build(el: Slot) {
  if (el._layer) { fit(el); return; }
  fit(el);
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
/** A layer for another object; `sizes` is the slot's own, so the poster comes at the slot's width (encode.py poster_widths). */
function layerFor(name: string, sizes = '470px'): Layer {
  const info = index[name];
  const layer = document.createElement('div') as Layer;
  layer.className = 'm-layer';
  layer.dataset.obj = name;
  layer._manifest = info?.manifest ?? null;
  if (info) {
    const pic = document.createElement('picture');
    for (const s of info.srcset || []) { const so = document.createElement('source'); so.type = s.type; so.srcset = s.srcset; so.sizes = sizes; pic.appendChild(so); }
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

/** Change the object in a slot. Never restarts mid-change: a request inside the
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
  const neo = layerFor(name, old.querySelector('source')?.getAttribute('sizes') || undefined);
  if (el.classList.contains('floating')) floatLayer(neo, el);
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
  fit(el);   // the new contact shadow
  if (visible.has(el)) { if (!opts.instant) arrive(el); wake(el); }
}
function kill(l: Layer) {
  (l._anims || []).forEach((a) => { try { a.cancel(); } catch {} });
  l.querySelectorAll('video').forEach(release);
  if (l._seq) dropLean(l._seq);
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
  if (!el._layer || document.hidden || !visible.has(el) || !el.offsetParent || benched(el)) return;
  const layer = el._layer;
  fit(el);
  if (!enhancing || !moving() || layer.classList.contains('arriving')) return;
  float(el, true);
  if (isLive(el)) {
    getManifest(layer._manifest).then((m) => {
      if (!m || el._layer !== layer || !visible.has(el) || document.hidden) return;
      live!.then((L) => L.wake(el, layer, dirOf(layer._manifest!), m as any));
    });
    return;
  }
  if (layer._idle) { if (!outranked(el)) start(layer._idle, showVideo(layer)).catch(() => {}); return; }
  getManifest(layer._manifest).then((m) => {
    if (!m || !layer.isConnected || el._layer !== layer || !visible.has(el) || benched(el) || layer.classList.contains('arriving')) return;
    const dir = dirOf(layer._manifest!);
    const loop = loopOf(m);
    if (loop && !layer._idleFailed && !layer._idle) {
      const v = makeVideo(loop.sources, dir, true, 'm-idle');
      if (v) {
        layer._idle = v;
        layer.appendChild(v);
        /* an interrupted play() (another slot took the loop) is not a failure: the element stays, paused,
           and plays when this slot is the one most in view again */
        if (!outranked(el)) start(v, showVideo(layer))
          .catch((err) => { if (err?.name === 'AbortError') return; release(v); layer._idle = null; layer._idleFailed = true; });
      }
    }
    if (m.lean && desktopTier() && !layer._seq) loadLean(layer, m, dir);
  });
}
function sleep(el: Slot) {
  float(el, false);
  if (isLive(el)) live!.then((L) => L.sleep(el));
  if (el.hasAttribute('data-solo')) { shed(el); return; }
  const gone = !el.offsetParent;
  el.querySelectorAll<Layer>('.m-layer').forEach((layer) => {
    layer.querySelectorAll('video').forEach((v) => {
      if (v.classList.contains('m-drop')) return;
      if (gone) { release(v); if (layer._idle === v) { layer._idle = null; layer.classList.remove('video-on'); } if (layer._clip === v) layer._clip = null; }
      else { try { v.pause(); } catch {} if (playing === v) playing = null; }
    });
  });
}

/** Give back everything past the poster: videos (their decoders) and the lean's decoded frames.
    The poster comes back as a crossfade, never a cut: the classes go first, so the poster fades in while
    the video or the lean fades out (both 200 ms linear, so the additive sum stays at one), and only after
    the fade are the elements released. Releasing first left nothing under the fading poster: the object
    vanished and faded back each time a Work section lost focus while scrolling (measured on a phone
    emulation, 2026-10-10). */
const FADE = 260;            // the 200 ms layer crossfade (global.css) and a frame or two of slack
function shed(el: Slot) {
  el.querySelectorAll<Layer>('.m-layer').forEach((layer) => {
    const vids = [...layer.querySelectorAll('video')].filter((v) => !v.classList.contains('m-drop'));
    vids.forEach((v) => { try { v.pause(); } catch {} if (playing === v) playing = null; v.classList.remove('m-idle', 'm-clip'); });   // falls to the base opacity 0
    layer._idle = null; layer._clip = null;
    layer.classList.remove('video-on', 'clip-on', 'seq-on');
    const seq = layer._seq;
    if (seq) { cancelAnimationFrame(seq.raf); seq.ok = false; layer._seq = null; }
    const wrap = seq ? layer.querySelector('.m-lean') : null;
    if (wrap) wrap.classList.add('m-shed');
    window.setTimeout(() => {
      vids.forEach(release);
      if (seq) dropLean(seq);
      wrap?.remove();
    }, reduce() ? 0 : FADE);
  });
}
/** Make one solo slot the one that moves (Work: the section in view). The one before gives back its
    decoders; the new one goes past its poster when it is on screen and motion is welcome. */
function focus(el: Slot | null) {
  if (el === current) return;
  const was = current;
  current = el;
  if (was) shed(was);
  if (el) { build(el); wake(el); }
}

/* ---- lean ---- */
const FULL_BYTES = 40 << 20;   // decoded full-size frames per object (ADR-0006 item 3, amended 2026-10-10)
function loadLean(layer: Layer, m: Manifest, dir: string) {
  const lean = m.lean!;
  const tier = lean.tiers.find((t) => t.name === 'half') || lean.tiers[0];
  const wrap = document.createElement('div'); wrap.className = 'm-lean';
  const c = document.createElement('canvas');
  /* a CPU canvas: it is painted into the layer like an image, on the device-pixel grid. A GPU canvas
     (Chrome makes one from about 256 x 256 up) is a layer of its own that the compositor placed at the
     slot's fractional offset (x .625 at DPR 2) and resampled: 0.46 of the poster's sharpness at rest */
  c.getContext('2d', { willReadFrequently: true });
  wrap.appendChild(c);
  const slot = layer.closest<Slot>('.media')!;
  const ci = lean.center.col / (lean.cols - 1), cj = lean.center.row / Math.max(1, lean.rows - 1);
  const seq: Lean = { m: lean, S: m.size, dir, half: [], canvas: c, ok: false, slot, blobs: new Map(), full: new Map(), decoding: new Set(), cap: 0, useFull: false, dw: 0, dh: 0, ox: 0, oy: 0, pw: 0, ph: 0,
    empty: new Set(), cur: { u: ci, v: cj }, vel: { u: 0, v: 0 }, target: { u: ci, v: cj }, raf: 0, hop: false, centred: null, drawn: { exact: true, full: false, u: ci, v: cj } };
  layer._seq = seq;
  size(seq);
  Promise.all(tier.frames.map((u) => fetch(dir + u).then((r) => r.blob()).then((b) => createImageBitmap(b)))).then((frames) => {
    if (!layer.isConnected || layer._seq !== seq) { frames.forEach((f) => f.close()); return; }   // shed while loading
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
    size(seq);   // now inside the stage, measured from it
    draw(seq);
    aimSoon();
    /* the full-size files follow in the background, so the sharp frames are at hand before they are needed */
    if (seq.useFull) idle(() => { if (seq.ok) fullTier(seq)?.frames.forEach((_, i) => blob(seq, i)); });
  }).catch(() => { if (layer._seq === seq) layer._seq = null; });
}
const fullTier = (seq: Lean) => seq.m.tiers.find((t) => t.name === 'full');
/** The smallest whole CSS length that is also a whole number of device pixels: 1 px at DPR 1 and 2, 2 at
    1.5, 4 at 1.25. Chrome draws a canvas whose box is not on this grid resampled as a whole: a box a
    fraction of a CSS pixel wide (365.5 px at DPR 2, odd device widths) lost three quarters of a 1-px
    checkerboard's contrast, a box between device pixels (DPR 1.5) half its detail. */
function grid(dpr: number) {
  for (let k = 1; k <= 16; k++) if (Math.abs(k * dpr - Math.round(k * dpr)) < 1e-6) return k;
  return 1;
}
/** Where the lean canvas sits and what it holds (ADR-0006 amendment of 2026-10-10, evening).
    - Full-size frames wherever the half-size ones would be drawn at more than 0.75 of their size: a
      half-size frame reduced only to 0.9 (DPR 1) kept 0.78-0.89 of the full frame's detail, and a soft
      frame in motion that turns sharp at rest is the pop the audit saw (§3.2).
    - Decoded at exactly the device size, Lanczos-filtered in a worker (lean-resize.worker.ts), up to
      1.5x the file's own size (Work at DPR 2) and enlarged by the canvas only beyond that.
    - The canvas holds exactly the device pixels it covers: its box is snapped outward to grid() in
      document space and the frame drawn inside at its own place, rounded to a device pixel. Before,
      548 px of backing store over a 365.33 px box at x 929.64 (DPR 1.5) were resampled as a whole: 0.45
      of an <img> of the same frame. */
function size(seq: Lean) {
  const half = seq.m.tiers.find((t) => t.name === 'half') || seq.m.tiers[0], full = fullTier(seq) || half, crop = seq.m.crop;
  const stage = seq.canvas.closest<HTMLElement>('.m-stage') || seq.slot;   // fitted to whole pixels (fit)
  const dpr = devicePixelRatio || 1, r = stage.getBoundingClientRect(), k = r.width / seq.S;
  const px = crop.w * k * dpr;
  const useFull = !!fullTier(seq) && px > half.w * 0.75;
  const dw = Math.max(2, Math.min(Math.round(full.w * (resizer() ? 1.5 : 1)), Math.round(px || full.w)));
  const dh = Math.max(2, Math.round((dw * full.h) / full.w));
  /* drawn at its decoded size, or enlarged to the crop where the screen asks for more than that */
  const pw = Math.max(dw, Math.round(px)), ph = pw === dw ? dh : Math.round((pw * full.h) / full.w);   // never stretched by a pixel
  /* the crop in document CSS px (scrolling moves the page by whole device pixels), snapped outward */
  const g = grid(dpr), sx = r.left + scrollX, sy = r.top + scrollY, x0 = sx + crop.x * k, y0 = sy + crop.y * k;
  const gx = Math.floor(x0 / g + 1e-6) * g, gy = Math.floor(y0 / g + 1e-6) * g;
  const gw = Math.ceil((x0 + pw / dpr - gx) / g - 1e-6) * g, gh = Math.ceil((y0 + ph / dpr - gy) / g - 1e-6) * g;
  const cw = Math.round(gw * dpr), ch = Math.round(gh * dpr);
  const ox = Math.round((x0 - gx) * dpr), oy = Math.round((y0 - gy) * dpr);
  Object.assign(seq.canvas.style, { left: gx - sx + 'px', top: gy - sy + 'px', width: gw + 'px', height: gh + 'px' });
  const resized = seq.canvas.width !== cw || seq.canvas.height !== ch;
  if (resized) { seq.canvas.width = cw; seq.canvas.height = ch; }
  const moved = resized || ox !== seq.ox || oy !== seq.oy || pw !== seq.pw || ph !== seq.ph;
  Object.assign(seq, { ox, oy, pw, ph });
  if (dw !== seq.dw || useFull !== seq.useFull) {
    if (seq.dw && dw !== seq.dw) { seq.full.forEach((f) => f.close()); seq.full.clear(); }   // decoded at the old size
    seq.dw = dw; seq.dh = dh; seq.useFull = useFull;
    seq.cap = Math.max(8, Math.min(30, Math.floor(FULL_BYTES / (dw * dh * 4))));
  } else if (!moved) return;
  if (seq.ok) draw(seq);
}
/* One worker for every lean on the page: frames decoded and Lanczos-reduced to the canvas's size. Where
   there is no worker or no OffscreenCanvas, or the worker fails, the browser's own resize stands in. */
let worker: Worker | null | undefined;
const jobs = new Map<number, (b: ImageBitmap | null) => void>();
let jobId = 0;
function resizer(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (!('OffscreenCanvas' in window)) throw 0;
    worker = new Worker(new URL('./lean-resize.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; bitmap: ImageBitmap | null }>) => { jobs.get(e.data.id)?.(e.data.bitmap); jobs.delete(e.data.id); };
    worker.onerror = () => { worker = null; jobs.forEach((f) => f(null)); jobs.clear(); };
  } catch { worker = null; }
  return worker;
}
function decodeTo(b: Blob, w: number, h: number): Promise<ImageBitmap | null> {
  const wk = resizer();
  const fallback = () => createImageBitmap(b, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' });
  if (!wk) return fallback();
  return new Promise<ImageBitmap | null>((res) => { const id = ++jobId; jobs.set(id, res); wk.postMessage({ id, blob: b, w, h }); })
    .then((bm) => bm || fallback());
}
function dropLean(seq: Lean) {
  cancelAnimationFrame(seq.raf);
  seq.ok = false;
  seq.half.forEach((f) => { if ('close' in f) f.close(); }); seq.half = [];
  seq.full.forEach((f) => f.close()); seq.full.clear(); seq.blobs.clear();
}
const cell = (seq: Lean, col: number, row: number) => row * seq.m.cols + col;
function blob(seq: Lean, i: number): Promise<Blob | null> {
  let b = seq.blobs.get(i);
  if (!b) {
    const t = fullTier(seq);
    b = t ? fetch(seq.dir + t.frames[i]).then((r) => (r.ok ? r.blob() : null)).catch(() => null) : Promise.resolve(null);
    seq.blobs.set(i, b);
  }
  return b;
}
/** Decode one full-size frame at the canvas's size into the LRU; redraw if it was wanted now. */
function decodeFull(seq: Lean, i: number) {
  if (seq.full.has(i)) { const f = seq.full.get(i)!; seq.full.delete(i); seq.full.set(i, f); return; }   // most recent last
  if (seq.decoding.has(i) || seq.empty.has(i)) return;
  seq.decoding.add(i);
  const dw = seq.dw, dh = seq.dh;
  blob(seq, i).then((b) => (b ? decodeTo(b, dw, dh) : null)).then((f) => {
    seq.decoding.delete(i);
    if (!f) return;
    if (!seq.ok || dw !== seq.dw) { f.close(); return; }
    seq.full.set(i, f);
    while (seq.full.size > seq.cap) { const [k, old] = seq.full.entries().next().value!; old.close(); seq.full.delete(k); }
    if (!seq.raf) draw(seq);   // a resting pose waiting for its sharp frame
  }).catch(() => seq.decoding.delete(i));
}
/** How much of the next frame shows at a fraction t of the way between two cells: none for the first
    (1 - SNAP) / 2 of the way, all of it for the last, and a smoothstep across the SNAP in the middle.
    Two renders a step apart added together are a double image, the cardboard "2.5D" of a slow sweep
    (ADR-0006 amendment of 2026-10-10, evening: a 50/50 mix of neighbours keeps 0.49 of a frame's
    sharpness); a linear crossfade showed such a mix in nearly every pose of a moving hand. Now most
    poses are one exact frame and the change to the next is a short dissolve, still tied to the pose
    (so it never runs on after the hand stops). */
const SNAP = 0.24;
const snapT = (t: number) => { const x = Math.min(1, Math.max(0, (t - (1 - SNAP) / 2) / SNAP)); return x * x * (3 - 2 * x); };
/* The nearest frames, weighted to sum to 1, added with "lighter" over black: an exact frame for most
   poses, a short dissolve between neighbours (snapT) for the rest (tools/objects/README.md). Full-size
   frames when every frame of the blend is decoded, else half-size ones, never a mix (a mix sharpens one
   ghost and not the other). */
function draw(seq: Lean) {
  const { cols, rows } = seq.m;
  const fx = seq.cur.u * (cols - 1), fy = seq.cur.v * (rows - 1);
  const i0 = Math.min(Math.floor(fx), cols - 2), j0 = Math.max(0, Math.min(Math.floor(fy), rows - 2));
  const tx = snapT(fx - i0), ty = rows > 1 ? snapT(fy - j0) : 0;
  const ctx = seq.canvas.getContext('2d')!;
  const W = seq.canvas.width, H = seq.canvas.height;
  let w = [[i0, j0, (1 - tx) * (1 - ty)], [i0 + 1, j0, tx * (1 - ty)], [i0, j0 + 1, (1 - tx) * ty], [i0 + 1, j0 + 1, tx * ty]]
    .map(([i, j, a]) => [cell(seq, i, Math.min(rows - 1, j)), a])
    .filter(([k, a]) => a > 0.002 && seq.half[k] && !seq.empty.has(k));
  if (!w.length) {   // every neighbour is a dropped frame: use the middle row at this angle
    const mid = Math.floor(rows / 2);
    w = [[cell(seq, i0, mid), 1 - tx], [cell(seq, i0 + 1, mid), tx]].filter(([k, a]) => a > 0.002 && !seq.empty.has(k));
  }
  let full = false;
  if (seq.useFull) {
    w.forEach(([k]) => decodeFull(seq, k));
    full = w.every(([k]) => seq.full.has(k));
    /* the neighbourhood the pose is heading into, so moving stays sharp: 4° behind, 6° ahead, whatever
       the grid's step (2°, or 1° for edk since 2026-10-10) */
    const ahead = seq.vel.u >= 0 ? 1 : -1, per = 2 / (seq.m.stepDeg?.yaw || 2);
    for (let d = -2 * per; d <= 3 * per; d++) {
      const i = i0 + (d * ahead) + (ahead < 0 ? 1 : 0);
      if (i < 0 || i >= cols) continue;
      for (let j = j0; j <= Math.min(rows - 1, j0 + 1); j++) decodeFull(seq, cell(seq, i, j));
    }
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';   // a half-size frame standing in
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const total = w.reduce((n, [, a]) => n + a, 0) || 1;
  for (const [k, a] of w) { ctx.globalAlpha = a / total; ctx.drawImage(full ? seq.full.get(k)! : seq.half[k], seq.ox, seq.oy, seq.pw, seq.ph); }
  seq.drawn = { exact: w.length === 1, full, u: seq.cur.u, v: seq.cur.v };
}
/* A spring (ζ 0.9, about 300 ms to arrive), so the pose never changes speed in a step: when the hand
   stops and the target moves to an exact cell, the motion bends toward it instead of starting a second
   movement. A glide to the rest pose for the clip is stiffer and critically damped. */
function follow(seq: Lean) {
  if (seq.raf) return;
  size(seq);   // the page may have moved under the slot since (fonts, a scrollbar): stay on whole pixels
  let last = performance.now();
  const tick = (now: number) => {
    seq.raf = 0;
    if (!seq.ok) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    const w = seq.hop ? 28 : 16, c = 2 * w * (seq.hop ? 1 : 0.9);
    for (let t = dt; t > 1e-6; t -= 1 / 240) {
      const h = Math.min(1 / 240, t);
      for (const a of ['u', 'v'] as const) {
        seq.vel[a] += (w * w * (seq.target[a] - seq.cur[a]) - c * seq.vel[a]) * h;
        seq.cur[a] += seq.vel[a] * h;
      }
    }
    let still = true;
    for (const a of ['u', 'v'] as const) {
      if (Math.abs(seq.cur[a] - seq.target[a]) < 4e-4 && Math.abs(seq.vel[a]) < 6e-3) { seq.cur[a] = seq.target[a]; seq.vel[a] = 0; }
      else still = false;
    }
    if (seq.centred && Math.abs(seq.cur.u - seq.target.u) * (seq.m.cols - 1) < 0.25 && Math.abs(seq.cur.v - seq.target.v) * (seq.m.rows - 1) < 0.25) { const f = seq.centred; seq.centred = null; f(); }
    draw(seq);
    if (!still) seq.raf = requestAnimationFrame(tick);
  };
  seq.raf = requestAnimationFrame(tick);
}
const centreOf = (seq: Lean) => ({ u: seq.m.center.col / (seq.m.cols - 1), v: seq.m.center.row / Math.max(1, seq.m.rows - 1) });

/* ---- interaction clips (desktop tier): once over the rest pose, then back to the lean ---- */
function play(el: Slot, clip: string): boolean {
  const layer = el._layer;
  if (isLive(el)) return false;            // the engine answers the pointer itself
  if (!layer || !moving() || !desktopTier() || layer._clip || layer._drop || !visible.has(el) || benched(el)) return false;
  /* the clip was rendered at the rest pose: a leaning object glides there first, and hops from it */
  const seq = layer._seq && layer._seq.ok && layer.classList.contains('seq-on') ? layer._seq : null;
  const centred = seq ? new Promise<void>((res) => { seq.hop = true; seq.target = centreOf(seq); seq.centred = res; follow(seq); }) : Promise.resolve();
  const done = () => { if (seq) { seq.hop = false; seq.centred = null; aimSoon(); } };
  getManifest(layer._manifest).then((m) => {
    const spec = m?.clips?.[clip];
    if (!spec || layer._clip || el._layer !== layer || benched(el)) { done(); return; }
    const v = makeVideo(spec.sources, dirOf(layer._manifest!), false, 'm-clip');
    if (!v) { done(); return; }
    layer._clip = v;
    layer.appendChild(v);
    v.src = v.dataset.src!;
    const back = () => { done(); if (layer._idle) start(layer._idle, () => {}).catch(() => {}); };
    /* the clip starts once the pose is home and the clip can play; a clip that cannot gives up */
    const ready = new Promise<void>((res, rej) => {
      if (v.readyState >= 3) res();
      else { v.addEventListener('canplay', () => res(), { once: true }); v.addEventListener('error', () => rej(), { once: true }); }
      setTimeout(() => rej(), 2500);
    });
    Promise.all([centred, ready]).then(() => start(v, () => { layer.classList.add('clip-on'); })).then(() => {
      v.addEventListener('ended', () => {
        layer.classList.remove('clip-on');
        setTimeout(() => { release(v); layer._clip = null; back(); }, 220);
      }, { once: true });
    }).catch(() => { release(v); layer._clip = null; back(); });
  });
  return true;
}

/* ---- the droplet change between tabs (ADR-0006 item 5, ADR-0007) ----
   Leaving: the stage starts its droplet.out (24 frames at 60 fps, 400 ms, played at its own rate: a
   1.143x speed-up dropped about one frame in seven on a 60 Hz screen, site audit B10), and the page
   navigates at the same moment; the old page keeps melting until the new one is ready, and the cross-document view transition
   carries the rest, crossfading at the droplet (owner, 2026-10-09: barely felt, still readable).
   Arriving: the stage shows only its glow until droplet.in (droplet back to the object) has its first frame. */
const DROP_KEY = 'edk-droplet';
/** Where several solo slots share a page (Work), the stage, the object that melts and arrives and carries
    the view-transition name (which must be unique), is the solo slot nearest the middle of the window. */
function centreStage() {
  const solos = [...document.querySelectorAll<Slot>('.media[data-solo]')].filter((x) => x.offsetParent);
  if (solos.length < 2) return;
  const mid = innerHeight / 2;
  const d = (x: Slot) => { const r = x.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid)); };
  const best = solos.reduce((a, b) => (d(b) < d(a) ? b : a));
  solos.forEach((x) => x.classList.toggle('stage', x === best));
}
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
  centreStage();
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

/* ---- pointer (fine pointer only): the lean and a glint that follows the hand ----
   The pointer counts only while it is in the window; the page moving under a resting pointer (a wheel
   scroll) re-aims too, so an object scrolled back into view never shows a stale lean (audit §4). */
let px = 0, py = 0, ptrIn = false, raf = 0, at = -1e9, restT = 0;
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce()) return;
  px = e.clientX; py = e.clientY; at = performance.now(); ptrIn = true;
  aimSoon();
}, { passive: true });
const away = () => { if (!ptrIn) return; ptrIn = false; aimSoon(); };
document.documentElement.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') away(); });
document.addEventListener('mouseleave', away);
addEventListener('blur', away);
addEventListener('scroll', () => { if (ptrIn) aimSoon(); }, { passive: true });
function aimSoon() { if (!raf) raf = requestAnimationFrame(aimAll); }
function aimAll() {
  raf = 0;
  visible.forEach((el) => {
    if (isLive(el)) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const { mx, my } = ptrIn ? aim(r, px, py) : { mx: 0, my: 0 };
    el.style.setProperty('--gx', (50 + mx * 28).toFixed(1) + '%');
    el.style.setProperty('--gy', (40 + my * 24).toFixed(1) + '%');
    const layer = el._layer, seq = layer?._seq;
    if (seq && seq.ok && !layer!._drop) {
      /* the object turns toward the pointer: yaw +-16 degrees, pitch +-4 (the grid's arc) */
      if (!seq.hop && !layer!._clip) {
        const c = centreOf(seq);
        seq.target = { u: Math.min(1, Math.max(0, c.u + mx * 0.7)), v: Math.min(1, Math.max(0, c.v - my * 0.7)) };
        if (mx || my) layer!.classList.add('seq-on');
        follow(seq);
      }
    }
  });
  clearTimeout(restT);
  restT = window.setTimeout(rest, REST_MS);
}
/** The pointer rests: each lean settles on an exact cell, as the tail of the movement (lean.ts). */
function rest() {
  visible.forEach((el) => {
    const layer = el._layer, seq = layer?._seq;
    if (!seq || !seq.ok || seq.hop) return;
    const { cols, rows } = seq.m;
    seq.target = {
      u: cellFor(seq.target.u * (cols - 1), seq.cur.u * (cols - 1)) / (cols - 1),
      v: rows > 1 ? cellFor(seq.target.v * (rows - 1), seq.cur.v * (rows - 1)) / (rows - 1) : 0,
    };
    follow(seq);
    /* the ?idle=blend comparison hands back to its loop after a longer rest, as before */
    if (layer!._idle) setTimeout(() => {
      if (performance.now() - at < 4000 || !layer!._idle) return;
      layer!.classList.remove('seq-on');
    }, 4200);
  });
}
let rsz = 0;
addEventListener('resize', () => { clearTimeout(rsz); rsz = window.setTimeout(() => document.querySelectorAll<Slot>('.media').forEach((el) => {
  fit(el);
  const seq = el._layer?._seq; if (seq?.ok) size(seq);
  el.querySelectorAll<Floater>('.m-layer').forEach((l) => (l._float?.effect as KeyframeEffect | null)?.setKeyframes(bobFrames(el)));   // a new size or screen density
}), 150); });

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
