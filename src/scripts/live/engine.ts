/* The live frame engine (ADR-0009, proposed; liveliness research §5 "one engine, one light").
   Loaded only behind the opt-in flag (live/flag.ts). It replaces, for the Home object and the Home
   showcase, the idle video, the Canvas2D lean and the interaction video with one WebGL2 canvas
   that draws exact Cycles frames, every frame, driven by springs that add instead of switching:

   - float: E's bob, sway and a tiny roll, applied to the whole frame as a 2D move, so a floating
     object is a Cycles frame moved, never a blend of frames;
   - lean: the pointer turns the object across the grid (the four nearest frames, blended exactly);
     when the pointer rests, the pose settles onto an exact frame, and the full-size frame replaces
     the half-size blend;
   - state axes: an interaction is a spring over frames, not a fire-and-forget video. Recto's fan
     opens on hover and closes from wherever it is on leave (it reverses mid-way); edk's hop plays
     its frames forward. Both gather the lean to the centre first (the clip was rendered there) and
     crossfade from the leaned pose over the last degree or two;
   - light: a pointer light (touch and scroll on phones; a slow wander at rest) relights the Cycles
     pixels from the normal pass: a glint on bevels and an accent fresnel, added; a pool that scales
     the pixels only while the pointer moves, unless ?light=soft|pool asks for it at rest.

   The ground stays exact (gl.ts), the contact shadow stays in the page (multiply, faded with lean
   and the float), and the droplet change between tabs stays video (media.ts). Tiers, benchmark and
   watchdog: tier.ts. Memory: a budget per tier (below). Hidden or offscreen: the loop stops; after
   30 s offscreen the GPU memory is released and rebuilt on return from the HTTP cache. */
import { mq, params, reduce } from '../env';
import { spring, step, settle, retune, type Spring } from './spring';
import { program, texArray, upload, type Tex, type U } from './gl';
import { type Tier, ORDER, stillReason, ceiling, softwareRenderer, bench, fromBench, Watchdog, renderer, force, override } from './tier';
import { liveOff } from './flag';
import { aim, cellFor, REST_MS } from '../lean';

type Img = { src: string; type: string; bytes: number };
type Rect = { x: number; y: number; w: number; h: number };
export type Manifest = {
  name: string; light: string; size: number;
  lean: { cols: number; rows: number; center: { col: number; row: number }; crop: Rect;
    tiers: { name: string; w: number; h: number; frames: string[] }[] };
  normals?: { w: number; h: number; rows: (Img & { row: number; frames: number })[]; rest: Img;
    clips?: { interact?: Img & { crop: Rect; w: number; h: number; frames: number } } };
  states?: { interact?: { axis: 'time' | 'state'; fps: number; frames: number; crop: Rect; peak?: number; values?: number[];
    half: Img & { w: number; h: number }; peakFull?: Img & { w: number; h: number } } };
};

/* ---- the A/B knobs (ADR-0009 "Trying it") ---- */
const LIGHTS = {
  glint: { rest: 0, move: 0.35 },   // default: at rest the exact frame plus an added glint
  soft: { rest: 0.45, move: 0.6 },
  pool: { rest: 1, move: 1 },       // the research proof's pool, always on
  off: { rest: 0, move: 0 },
} as const;
const lightName = (params.get('light') || 'glint') as keyof typeof LIGHTS;
const LIGHT = LIGHTS[lightName] || LIGHTS.glint;
const FLOAT = params.get('float') !== '0';
const HUD = params.has('hud');
const MB = 1 << 20;
/** GPU memory per object and tier (liveliness research §4 "Memory"): the planner fits full-size
    rest slots into what the half grid, the normals and the clip leave. */
const BUDGET: Record<Tier, number> = { still: 0, phone: 4 * MB, lite: 40 * MB, full: 60 * MB };
const K = { kPool: 0.68, kPoolR: 0.32, kPoolGain: 0.18, kSharp: 30, kSpec: 1.6, kRim: 0.35 };
const LC: [number, number, number] = [1.0, 0.97, 0.92];

/* ---- one pointer for the page ---- */
const ptr = { x: 0, y: 0, t: -1e9, in: false, touch: -1e9, tx: 0, ty: 0 };
let listening = false;
const slots = new Map<HTMLElement, LiveSlot>();
function listen() {
  if (listening) return;
  listening = true;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') { ptr.touch = performance.now(); ptr.tx = e.clientX; ptr.ty = e.clientY; }
    else { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); ptr.in = true; }
    slots.forEach((s) => s.poke());
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') { ptr.touch = performance.now(); ptr.tx = e.clientX; ptr.ty = e.clientY; slots.forEach((s) => s.poke()); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { ptr.in = false; slots.forEach((s) => s.poke()); });
  addEventListener('blur', () => { ptr.in = false; });
  addEventListener('scroll', () => slots.forEach((s) => s.poke(true)), { passive: true });
}

const hex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

async function bitmap(url: string, count: (n: number) => void): Promise<ImageBitmap> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const b = await r.blob();
  count(b.size);
  return createImageBitmap(b, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
}

export class LiveSlot {
  readonly name: string;
  tier: Tier = 'still';
  reason = '';
  state: 'boot' | 'run' | 'paused' | 'cold' | 'still' = 'boot';
  private wrap: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private u!: U;
  private tex: Partial<Record<'G' | 'F' | 'N' | 'C' | 'CN' | 'P', Tex>> = {};
  private dummy: Tex[] = [];
  private rect: Rect = { x: 0, y: 0, w: 1, h: 1 };
  private dpr = 1;
  private useFull = false;
  private fullK = 0;
  private full = new Map<number, number>();     // grid frame -> F layer
  private fullLru: number[] = [];
  private fullWant = new Set<number>();
  private have = { rest: false, grid: false, normals: 'none' as 'none' | 'rest' | 'grid', clip: false, clipN: false, peak: false };
  private raf = 0;
  private last = 0;
  private t = 0;
  private odd = false;
  private input = -1e9;
  private born = 0;
  private coldT = 0;
  private gen = 0;
  private hovering = false;
  private intentT = 0;
  private want = 0;
  private hop: 'idle' | 'gather' | 'play' = 'idle';
  private ct = 0;
  private cool = 0;
  private lightOn = LIGHT !== LIGHTS.off;
  private yaw: Spring; private pitch: Spring;
  private lx: Spring; private ly: Spring; private pool: Spring; private fl: Spring; private st: Spring;
  private wd: Watchdog;
  private ro: ResizeObserver | null = null;
  readonly stats = { bench: 0, bytes: 0, memory: 0, frames: 0, draw: [] as number[], steps: [] as string[], renderer: '', firstDrawMs: 0, gridMs: 0, readyMs: 0 };
  private c: { col: number; row: number };
  /** the exact cell a resting pointer settles on, chosen once per rest (lean.ts cellFor) */
  private restAim: { key: string; y: number; p: number } | null = null;

  constructor(readonly el: HTMLElement, readonly layer: HTMLElement, readonly m: Manifest, readonly dir: string) {
    this.name = el.dataset.slot || m.name;
    this.c = m.lean.center;
    this.yaw = spring(this.c.col, 70, 0.72);       // research proof 2: 90 % in 322 ms, 3.7 % overshoot, weight
    this.pitch = spring(this.c.row, 70, 0.8);
    const S = m.size;
    this.lx = spring(-0.25 * S, 160, 0.9);
    this.ly = spring(0.32 * S, 160, 0.9);
    this.pool = spring(0, 40, 1);
    this.fl = spring(0, 6, 1);                     // the float fades in and out over about a second
    this.st = spring(0, 120, 0.55);                // the state axis: underdamped, it overshoots into the stop
    this.wd = new Watchdog(() => this.stepDown());
  }

  /* ---------------------------------------------------------------- boot */
  async boot() {
    const gen = ++this.gen;
    const why = stillReason();
    if (why) return this.still(why);
    const top = this.tier === 'still' ? ceiling() : this.tier;   // a rebuilt slot keeps its tier
    this.wrap = document.createElement('div');
    this.wrap.className = 'm-live';
    this.canvas = document.createElement('canvas');
    this.wrap.appendChild(this.canvas);
    const gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) return this.still('no WebGL2');
    this.gl = gl;
    this.stats.renderer = renderer(gl);
    if (softwareRenderer(gl)) return this.still('software renderer');
    this.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); if (this.gl === gl) this.still('context lost'); });   // ours (release) is not a loss
    try { this.u = program(gl).u; } catch (e) { return this.still('shader: ' + (e as Error).message); }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    this.layout(top);
    this.layer.appendChild(this.wrap);
    this.statics();
    /* the benchmark: the real shader, at the real size, on stand-in textures of the real sizes */
    if (!this.stats.bench) {
      const g = this.m.lean.tiers.find((t) => t.name === 'half')!;
      const fill = (t: Tex) => upload(gl, t, new Uint8Array(t.w * t.h * t.n * (t.rg ? 2 : 4)).fill(96), 0, t.n);
      const dG = texArray(gl, 'tG', g.w, g.h, 4), dN = texArray(gl, 'tN', g.w, g.h, 4, true);
      [dG, dN].forEach(fill);
      this.dummy.push(dG, dN, texArray(gl, 'tF', 1, 1, 1), texArray(gl, 'tC', 1, 1, 2), texArray(gl, 'tCN', 1, 1, 2, true), texArray(gl, 'tP', 1, 1, 1));
      gl.uniform2f(this.u.cr, 2, 2);
      gl.uniform2f(this.u.pose, 0.5, 0.5);
      gl.uniform1f(this.u.nMode, 2); gl.uniform1f(this.u.nFade, 1); gl.uniform1f(this.u.lightAmt, 1); gl.uniform1f(this.u.poolAmt, 1);
      gl.uniform1f(this.u.clipMix, 0.5); gl.uniform1f(this.u.fullLayer, -1);
      this.stats.bench = +bench(gl, () => gl.drawArrays(gl.TRIANGLES, 0, 3)).toFixed(2);
      this.dummy.forEach((t) => gl.deleteTexture(t.tex));
      this.dummy = [];
    }
    const tier = this.tier === 'still' ? fromBench(this.stats.bench, top) : top;
    if (tier === 'still') return this.still(`benchmark ${this.stats.bench} ms a frame`);
    this.tier = tier;
    if (tier !== top) this.layout(tier);
    this.plan();
    this.state = 'run';
    this.born = performance.now();
    this.el.classList.add('live');
    this.attachInput();
    this.ro = 'ResizeObserver' in window ? new ResizeObserver(() => this.resize()) : null;
    this.ro?.observe(this.el);
    await this.load(gen);
  }

  /** The canvas covers the grid's crop and the clip's, plus room for the float. */
  private layout(tier: Tier) {
    const m = this.m, S = m.size, g = m.lean.crop, s = m.states?.interact?.crop;
    let x0 = g.x, y0 = g.y, x1 = g.x + g.w, y1 = g.y + g.h;
    if (s && tier !== 'phone') { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + s.w); y1 = Math.max(y1, s.y + s.h); }
    const pad = Math.ceil(S * 0.014);
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(S, x1 + pad); y1 = Math.min(S, y1 + pad);
    this.rect = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const k = 100 / S;
    Object.assign(this.canvas!.style, { left: x0 * k + '%', top: y0 * k + '%', width: (x1 - x0) * k + '%', height: (y1 - y0) * k + '%' });
    this.dpr = tier === 'lite' ? 1 : Math.min(2, devicePixelRatio || 1);
    this.resize();
  }
  private resize() {
    const cv = this.canvas, gl = this.gl;
    if (!cv || !gl) return;
    const w = this.el.getBoundingClientRect().width;
    if (!w) return;
    const px = (w * this.rect.w) / this.m.size;
    cv.width = Math.max(2, Math.round(px * this.dpr));
    cv.height = Math.max(2, Math.round(((w * this.rect.h) / this.m.size) * this.dpr));
    gl.viewport(0, 0, cv.width, cv.height);
    /* full-size frames only where the canvas would show their extra pixels (a half frame drawn
       larger than about 1.3x looks soft; a full frame drawn at half size aliases without mipmaps) */
    const half = this.m.lean.tiers.find((t) => t.name === 'half')!;
    const shown = (cv.width * this.m.lean.crop.w) / this.rect.w;
    this.useFull = this.tier !== 'lite' && this.fullK > 0 && shown > half.w * 1.3;
    if (this.tier === 'phone') this.useFull = true;
    this.poke();
  }
  private statics() {
    const gl = this.gl!, u = this.u, m = this.m, g = m.lean.crop, s = m.states?.interact;
    gl.uniform4f(u.rect, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    gl.uniform4f(u.gRect, g.x, g.y, g.w, g.h);
    if (s) gl.uniform4f(u.cRect, s.crop.x, s.crop.y, s.crop.w, s.crop.h);
    gl.uniform2f(u.piv, g.x + g.w / 2, g.y + g.h / 2);
    gl.uniform1f(u.size, m.size);
    for (const [k, v] of Object.entries(K)) gl.uniform1f(u[k as keyof typeof K], params.has(k) ? +params.get(k)! : v);
    gl.uniform3f(u.Lc, ...LC);
    gl.uniform3f(u.accent, ...hex(m.light || '#c9d4ff'));
  }

  /* ---------------------------------------------------------------- memory plan and loading */
  private plan() {
    const gl = this.gl!, m = this.m, tier = this.tier;
    const half = m.lean.tiers.find((t) => t.name === 'half')!, full = m.lean.tiers.find((t) => t.name === 'full')!;
    const n = m.lean.cols * m.lean.rows, nm = m.normals, st = m.states?.interact, cn = nm?.clips?.interact;
    const T = this.tex;
    Object.values(T).forEach((t) => t && gl.deleteTexture(t.tex));
    this.tex = {};
    const one = (u: 'tG' | 'tF' | 'tN' | 'tC' | 'tCN' | 'tP', rg = false) => texArray(gl, u, 1, 1, 1, rg);
    if (tier === 'phone') {
      this.tex = { G: one('tG'), F: texArray(gl, 'tF', full.w, full.h, 1), N: nm ? texArray(gl, 'tN', nm.w, nm.h, 1, true) : one('tN', true), C: one('tC'), CN: one('tCN', true), P: one('tP') };
      this.fullK = 1;
    } else {
      this.tex.G = texArray(gl, 'tG', half.w, half.h, n);
      const gridN = tier === 'full' && nm ? nm.w * nm.h * 2 * n : 0;
      const clip = st && tier !== 'still' ? st.half.w * st.half.h * 4 * st.frames : 0;
      const clipN = st && cn ? cn.w * cn.h * 2 * cn.frames : 0;
      /* full-size frames only where the canvas would show their extra pixels (see resize) */
      const w = this.el.getBoundingClientRect().width * this.dpr * (m.lean.crop.w / m.size);
      const fullUseful = tier === 'full' && w > half.w * 1.3;
      const peak = fullUseful && st?.peakFull ? st.peakFull.w * st.peakFull.h * 4 : 0;
      const fixed = this.tex.G.bytes + gridN + clip + clipN + peak;
      const slot = full.w * full.h * 4;
      this.fullK = fullUseful ? clamp(Math.floor((BUDGET.full - fixed) / slot), 0, 6) : 0;
      this.tex.F = this.fullK ? texArray(gl, 'tF', full.w, full.h, this.fullK) : one('tF');
      this.tex.N = nm ? (gridN ? texArray(gl, 'tN', nm.w, nm.h, n, true) : texArray(gl, 'tN', nm.w, nm.h, 1, true)) : one('tN', true);
      this.tex.C = clip ? texArray(gl, 'tC', st!.half.w, st!.half.h, st!.frames) : one('tC');
      this.tex.CN = clipN ? texArray(gl, 'tCN', cn!.w, cn!.h, cn!.frames, true) : one('tCN', true);
      this.tex.P = peak ? texArray(gl, 'tP', st!.peakFull!.w, st!.peakFull!.h, 1) : one('tP');
    }
    this.full.clear(); this.fullLru = []; this.fullWant.clear();
    this.have = { rest: false, grid: false, normals: 'none', clip: false, clipN: false, peak: false };
    this.stats.memory = Object.values(this.tex).reduce((a, t) => a + (t ? t.bytes : 0), 0);
    this.resize();
  }

  private async load(gen: number) {
    const gl = this.gl!, m = this.m, d = this.dir, T = this.tex;
    const half = m.lean.tiers.find((t) => t.name === 'half')!, full = m.lean.tiers.find((t) => t.name === 'full')!;
    const ci = this.c.row * m.lean.cols + this.c.col;
    const count = (b: number) => { this.stats.bytes += b; };
    const alive = () => gen === this.gen && !!this.gl && this.state !== 'still';
    const t0 = performance.now();
    try {
      /* 1. the rest frame (exact) and its normals: the first live frame */
      const restSrc = this.useFull || this.tier === 'phone' ? full.frames[ci] : half.frames[ci];
      const [rest, rn] = await Promise.all([bitmap(d + restSrc, count), m.normals ? bitmap(d + m.normals.rest.src, count) : null]);
      if (!alive()) return;
      if (this.useFull || this.tier === 'phone') { upload(gl, T.F!, rest, 0); this.full.set(ci, 0); this.fullLru.push(ci); }
      else upload(gl, T.G!, rest, ci);
      rest.close();
      const restLayer = T.N!.n > 1 ? ci : 0;
      if (rn) { upload(gl, T.N!, rn, restLayer); rn.close(); this.have.normals = 'rest'; }
      gl.uniform1f(this.u.restLayer, restLayer);
      this.have.rest = true;
      this.stats.firstDrawMs = Math.round(performance.now() - t0);
      this.show();
      if (this.tier === 'phone') { this.stats.readyMs = this.stats.firstDrawMs; return; }
      /* 2. the half grid: the lean */
      await Promise.all(half.frames.map((f, i) => bitmap(d + f, count).then((b) => { if (alive()) upload(gl, T.G!, b, i); b.close(); })));
      if (!alive()) return;
      this.have.grid = true;
      this.stats.gridMs = Math.round(performance.now() - t0);
      this.poke();
      /* 3. the clip as an axis (half size, its normals, the exact peak) */
      const st = m.states?.interact, cn = m.normals?.clips?.interact;
      if (st && T.C!.n > 1) {
        const jobs: Promise<void>[] = [bitmap(d + st.half.src, count).then((b) => { if (alive()) upload(gl, T.C!, b, 0); b.close(); })];
        if (cn && T.CN!.n > 1) jobs.push(bitmap(d + cn.src, count).then((b) => { if (alive()) { upload(gl, T.CN!, b, 0); this.have.clipN = true; } b.close(); }));
        if (st.peakFull && T.P!.w > 1) jobs.push(bitmap(d + st.peakFull.src, count).then((b) => { if (alive()) { upload(gl, T.P!, b, 0); this.have.peak = true; } b.close(); }));
        await Promise.all(jobs);
        if (!alive()) return;
        gl.uniform1f(this.u.nClip, st.frames);
        this.have.clip = true;
      }
      /* 4. normals for every pose (full tier), the current row first */
      if (m.normals && T.N!.n > 1) {
        const rows = [...m.normals.rows].sort((a, b) => Math.abs(a.row - this.c.row) - Math.abs(b.row - this.c.row));
        for (const r of rows) {
          const b = await bitmap(d + r.src, count);
          if (!alive()) { b.close(); return; }
          upload(gl, T.N!, b, r.row * m.lean.cols);
          b.close();
        }
        this.have.normals = 'grid';
      }
      this.stats.readyMs = Math.round(performance.now() - t0);
      this.poke();
    } catch (e) {
      if (alive()) { this.have.grid ? console.warn('live:', e) : this.still('load failed'); }
    }
  }
  /** A full-size frame for the pose the lean has settled on (an LRU of fullK layers). */
  private wantFull(i: number) {
    if (!this.useFull || this.full.has(i) || this.fullWant.has(i) || !this.fullK) return;
    this.fullWant.add(i);
    const gen = this.gen, full = this.m.lean.tiers.find((t) => t.name === 'full')!;
    bitmap(this.dir + full.frames[i], (b) => { this.stats.bytes += b; }).then((b) => {
      this.fullWant.delete(i);
      if (gen !== this.gen || !this.gl || this.state === 'still') { b.close(); return; }
      let z: number;
      if (this.fullLru.length < this.fullK) z = this.fullLru.length;
      else { const old = this.fullLru.shift()!; z = this.full.get(old)!; this.full.delete(old); }
      upload(this.gl, this.tex.F!, b, z);
      b.close();
      this.full.set(i, z); this.fullLru.push(i);
      this.poke();
    }).catch(() => this.fullWant.delete(i));
  }

  /* ---------------------------------------------------------------- input */
  private attachInput() {
    listen();
    slots.set(this.el, this);
    const st = this.m.states?.interact;
    this.el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      this.hovering = true;
      if (st?.axis === 'state') this.want = 1;
      else {
        /* hover intent: a pointer crossing the stage on its way elsewhere does not hop it */
        clearTimeout(this.intentT);
        this.intentT = window.setTimeout(() => { if (this.hovering) { this.trigger(); this.poke(); } }, 140);
      }
      this.poke();
    });
    this.el.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      this.hovering = false;
      clearTimeout(this.intentT);
      if (st?.axis === 'state') this.want = 0;
      this.poke();
    });
    this.el.addEventListener('pointerdown', (e) => {
      if (st?.axis === 'state') { if (e.pointerType === 'touch') this.want = this.want ? 0 : 1; }
      else this.trigger();
      this.poke();
    });
  }
  private trigger() {
    if (!this.have.clip || this.hop !== 'idle' || performance.now() < this.cool) return;
    this.hop = 'gather';
  }
  /** Something happened: draw at full rate for a while (and restart the loop if it had settled). */
  poke(scrollOnly = false) {
    if (!scrollOnly) this.input = performance.now();
    else if (this.tier === 'phone') this.input = performance.now();
    if (this.state === 'run' && !this.raf && !document.hidden) this.loop();
  }

  /* ---------------------------------------------------------------- the frame */
  private loop() {
    this.last = performance.now();
    this.wd.reset(this.last);
    const tick = (now: number) => {
      this.raf = 0;
      if (this.state !== 'run') return;
      const dt = Math.min(0.1, (now - this.last) / 1000);   // springs substep; a slow frame still keeps time
      this.last = now;
      this.wd.tick(now);
      if (this.state !== 'run') return;          // the watchdog may have stepped to still
      const busy = this.update(dt, now);
      /* 60 fps while anything moves on input, 30 fps for the slow float and wander, and nothing at
         all once the object has settled after a minute without input (render on demand) */
      this.odd = !this.odd;
      if (busy === 'stop') { this.draw(); return; }
      if (busy === 'fast' || this.odd) this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private update(dt: number, now: number): 'fast' | 'slow' | 'stop' {
    const m = this.m, S = m.size, c = this.c, st = m.states?.interact;
    this.t += dt;
    const t = this.t;
    const sinceInput = now - this.input;
    const sleepy = sinceInput > 60000 && !this.hovering;
    const r = this.el.getBoundingClientRect();
    const touchRecent = now - ptr.touch < 2500;
    const mouseRecent = now - ptr.t < 2500 && ptr.in;
    /* lean: a pointer near the object turns it (yaw +-70 % of the grid's arc), faded out with distance
       (lean.ts, shared with the media stage); resting, it settles on an exact cell, chosen once, ahead
       in the direction of travel */
    let yT = c.col, pT = c.row;
    const lean = this.have.grid && this.tier !== 'phone';
    if (lean && ptr.in && r.width) {
      const { mx, my } = aim(r, ptr.x, ptr.y);
      yT = c.col + mx * 0.7 * c.col;
      pT = c.row - my * 0.7 * c.row;
      if (now - ptr.t > REST_MS) {
        const key = `${ptr.t}|${yT.toFixed(4)}|${pT.toFixed(4)}`;
        if (this.restAim?.key !== key) this.restAim = { key, y: cellFor(yT, this.yaw.x), p: cellFor(pT, this.pitch.x) };
        yT = this.restAim.y; pT = this.restAim.p;
      }
    }
    const interacting = this.hop !== 'idle' || this.want > 0 || this.st.x > 1e-3;
    if (interacting) { yT = c.col; pT = c.row; }
    retune(this.yaw, interacting ? 220 : 70, interacting ? 0.9 : 0.72);
    retune(this.pitch, interacting ? 220 : 70, interacting ? 0.95 : 0.8);
    this.yaw.to = yT; this.pitch.to = pT;
    step(this.yaw, dt); step(this.pitch, dt);
    const restYaw = settle(this.yaw), restPitch = settle(this.pitch);
    const dist = Math.hypot(this.yaw.x - c.col, this.pitch.x - c.row);

    /* the interaction axis */
    let clipF = 0, clipMix = 0, peakOn = 0, clipBusy = false;
    if (st && this.have.clip) {
      if (st.axis === 'time') {
        if (this.hop === 'gather' && dist < 0.35) { this.hop = 'play'; this.ct = 0; }
        if (this.hop === 'play') {
          this.ct += dt * st.fps;
          if (this.ct >= st.frames - 1) { this.hop = 'idle'; this.ct = 0; this.cool = now + 500; }
        }
        clipBusy = this.hop !== 'idle';
        clipF = this.ct;
        clipMix = this.hop === 'play' ? Math.min(1, this.ct / 3) : 0;
      } else {
        this.st.to = this.want && dist < 1 ? 1 : 0;
        step(this.st, dt);
        const atRest = settle(this.st, 1e-3);
        if (this.st.to === 0 && atRest) this.st.x = 0;
        const sx = clamp(this.st.x, 0, 1), vals = st.values || [];
        let f = sx * (st.frames - 1);
        if (vals.length === st.frames) {        // the fan's own amount, not the clip's clock
          let i = 0;
          while (i < vals.length - 2 && vals[i + 1] < sx) i++;
          f = i + clamp((sx - vals[i]) / Math.max(1e-6, vals[i + 1] - vals[i]), 0, 1);
        }
        clipF = f;
        clipBusy = this.st.x > 1e-3 || this.st.to > 0;
        clipMix = clipBusy ? smooth(1, 0.2, dist) : 0;
        peakOn = this.have.peak && atRest && this.st.to === 1 && this.useFull ? 1 : 0;
      }
    }

    /* float: E's bob (2.5 % of the radius there; 0.7 % of the square here), sway and roll, on three
       incommensurate sines; it fades out after a minute without input */
    this.fl.to = FLOAT && !sleepy ? 1 : 0;
    step(this.fl, dt);
    const a = this.fl.x;
    const bob = a * S * 0.007 * (Math.sin(t * 0.9) * 0.8 + Math.sin(t * 1.37 + 1) * 0.2);
    const sway = a * S * 0.0018 * Math.sin(t * 0.53 + 2);
    const roll = a * 0.0045 * Math.sin(t * 0.71 + 0.5);

    /* light: the pointer (or touch, or scroll on a phone), else a slow wander; an arrival sweep */
    const age = (now - this.born) / 1000;
    let lxT: number, lyT: number;
    if (age < 1.7 && !reduce()) { lxT = S * (-0.2 + 1.4 * smooth(0, 1.6, age)); lyT = S * 0.34; }
    else if (mouseRecent && r.width) { lxT = clamp(((ptr.x - r.left) / r.width) * S, -0.4 * S, 1.4 * S); lyT = clamp(((ptr.y - r.top) / r.height) * S, -0.4 * S, 1.4 * S); }
    else if (touchRecent && r.width) { lxT = clamp(((ptr.tx - r.left) / r.width) * S, -0.4 * S, 1.4 * S); lyT = clamp(((ptr.ty - r.top) / r.height) * S, -0.4 * S, 1.4 * S); }
    else if (sleepy) { lxT = S * 0.5; lyT = S * 0.3; }
    else {
      lxT = S * (0.5 + 0.34 * Math.cos(t * 0.42));
      lyT = S * (0.42 + 0.16 * Math.sin(t * 0.61));
      if (this.tier === 'phone' && r.height) lyT += S * 0.25 * clamp((r.top + r.height / 2) / innerHeight - 0.5, -1, 1);
    }
    this.lx.to = lxT; this.ly.to = lyT;
    step(this.lx, dt); step(this.ly, dt);
    this.pool.to = this.lightOn ? (mouseRecent || touchRecent ? LIGHT.move : LIGHT.rest) : 0;
    step(this.pool, dt);

    /* the contact shadow belongs to the rest pose: lighter when leaned (as the current stage) and
       when the float lifts the object */
    const leanAmt = Math.abs(this.yaw.x - c.col) / Math.max(1, c.col);
    const up = a ? Math.max(0, bob) / (S * 0.007) : 0;
    this.el.style.setProperty('--live-shadow', ((1 - 0.3 * leanAmt) * (1 - 0.18 * up) * (1 - 0.35 * clipMix * (st?.axis === 'time' ? 1 : 0))).toFixed(3));

    /* uniforms */
    const gl = this.gl!, u = this.u;
    const px = clamp(this.yaw.x, 0, m.lean.cols - 1), py = clamp(this.pitch.x, 0, m.lean.rows - 1);
    let fullLayer = -1;
    if (this.tier === 'phone') fullLayer = 0;
    else if (restYaw && restPitch && Number.isInteger(px) && Number.isInteger(py)) {
      const i = py * m.lean.cols + px;
      if (this.useFull) { if (this.full.has(i)) fullLayer = this.full.get(i)!; else this.wantFull(i); }
    }
    gl.uniform2f(u.cr, m.lean.cols, m.lean.rows);
    gl.uniform2f(u.pose, px, py);
    gl.uniform1f(u.fullLayer, fullLayer);
    const nGrid = this.have.normals === 'grid';
    gl.uniform1f(u.nMode, nGrid ? 2 : this.have.normals === 'rest' ? 1 : 0);
    gl.uniform1f(u.nFade, nGrid ? 1 : clamp(1 - dist / 2, 0, 1));   // rest normals only fit near the rest pose
    gl.uniform2f(u.shift, sway, -bob);
    gl.uniform1f(u.rot, roll);
    gl.uniform1f(u.clipF, clipF); gl.uniform1f(u.clipMix, clipMix); gl.uniform1f(u.peakOn, peakOn);
    gl.uniform1f(u.clipNOn, this.have.clipN ? 1 : 0);
    gl.uniform1f(u.lightAmt, this.lightOn ? 1 : 0);
    gl.uniform1f(u.poolAmt, this.pool.x);
    gl.uniform3f(u.Lp, this.lx.x, this.ly.x, S * 0.55);
    this.snap = { yaw: +((this.yaw.x - c.col) * 2).toFixed(2), pitch: +((this.pitch.x - c.row) * 4).toFixed(2), exact: fullLayer >= 0 || (restYaw && restPitch), fullLayer, axis: +this.st.x.toFixed(3), clipF: +clipF.toFixed(2), clipMix: +clipMix.toFixed(2), hop: this.hop, bob: +bob.toFixed(2), light: [Math.round(this.lx.x), Math.round(this.ly.x)], pool: +this.pool.x.toFixed(2) };

    const moving = !restYaw || !restPitch || clipBusy || Math.abs(this.lx.v) + Math.abs(this.ly.v) > S * 0.05;
    if (sleepy && !moving && this.fl.x < 1e-3 && Math.abs(this.pool.x) < 1e-3) return 'stop';
    return sinceInput < 1000 || clipBusy || !restYaw || !restPitch || age < 1.8 ? 'fast' : 'slow';
  }
  snap: Record<string, unknown> = {};

  private draw() {
    const gl = this.gl;
    if (!gl || !this.have.rest) return;
    const t0 = performance.now();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.stats.frames++;
    const d = this.stats.draw;
    d.push(performance.now() - t0);
    if (d.length > 120) d.shift();
    if (HUD) hud();
  }

  /* ---------------------------------------------------------------- lifecycle */
  private show() {
    if (this.state !== 'run') return;
    this.layer.classList.add('live-on');
    this.el.classList.add('live-on');
    this.poke();
  }
  /** The watchdog's ladder: DPR 2 to 1.5 to 1, full to lite, light off, then the still. */
  private stepDown(): boolean {
    let what: string;
    if (this.dpr > 1.5) { this.dpr = 1.5; what = 'dpr 1.5'; this.resize(); }
    else if (this.dpr > 1) { this.dpr = 1; what = 'dpr 1'; this.resize(); }
    else if (this.tier === 'full') { this.tier = 'lite'; what = 'lite'; this.downToLite(); }
    else if (this.lightOn) { this.lightOn = false; what = 'light off'; }
    else { this.still('watchdog'); what = 'still'; }
    this.stats.steps.push(`${what} (p90 ${this.wd.p90.toFixed(1)} ms)`);
    return true;
  }
  private downToLite() {
    /* keep what is loaded where it is still used; drop the full-size slots and the grid normals */
    const gl = this.gl!, T = this.tex;
    if (T.F && T.F.w > 1) { gl.deleteTexture(T.F.tex); T.F = texArray(gl, 'tF', 1, 1, 1); }
    if (T.P && T.P.w > 1) { gl.deleteTexture(T.P.tex); T.P = texArray(gl, 'tP', 1, 1, 1); }
    this.full.clear(); this.fullLru = []; this.fullK = 0; this.have.peak = false;
    if (this.have.normals === 'grid') { this.have.normals = 'rest'; this.gl!.uniform1f(this.u.restLayer, this.c.row * this.m.lean.cols + this.c.col); }
    this.useFull = false;
    this.stats.memory = Object.values(T).reduce((a, t) => a + (t ? t.bytes : 0), 0);
  }
  still(reason: string) {
    this.reason = reason;
    this.tier = 'still';
    this.state = 'still';
    cancelAnimationFrame(this.raf); this.raf = 0;
    this.layer.classList.remove('live-on');
    this.el.classList.remove('live-on', 'live');
    this.release();
    this.wrap?.remove();
    this.wrap = null; this.canvas = null;
    this.ro?.disconnect();
    slots.delete(this.el);
    if (HUD) hud();
  }
  private release() {
    const gl = this.gl;
    if (!gl) return;
    Object.values(this.tex).forEach((t) => t && gl.deleteTexture(t.tex));
    this.tex = {};
    this.gl = null;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  pause() {
    cancelAnimationFrame(this.raf); this.raf = 0;
    if (this.state !== 'run') return;
    this.state = 'paused';
    clearTimeout(this.coldT);
    this.coldT = window.setTimeout(() => this.cold(), 30000);
  }
  resume() {
    clearTimeout(this.coldT);
    if (this.state === 'paused') { this.state = 'run'; this.poke(); }
    else if (this.state === 'cold') { this.state = 'boot'; this.boot(); }
  }
  /** Long offscreen: give the GPU memory back; the HTTP cache rebuilds it on return. */
  private cold() {
    if (this.state !== 'paused') return;
    this.gen++;
    this.layer.classList.remove('live-on');
    this.el.classList.remove('live-on');
    this.release();
    this.wrap?.remove();
    this.wrap = null; this.canvas = null;
    this.ro?.disconnect();
    this.stats.memory = 0;
    this.state = 'cold';
  }
  info() {
    const d = [...this.stats.draw].sort((a, b) => a - b);
    return { tier: this.tier, state: this.state, reason: this.reason, dpr: this.dpr, useFull: this.useFull, fullK: this.fullK, have: { ...this.have },
      ...this.stats, draw: undefined, drawP50: d.length ? +d[d.length >> 1].toFixed(3) : 0, wdP90: +this.wd.p90.toFixed(1), memoryMB: +(this.stats.memory / MB).toFixed(1),
      canvas: this.canvas ? [this.canvas.width, this.canvas.height] : null, light: lightName, float: FLOAT, ...this.snap };
  }
}

/* ---------------------------------------------------------------- page-level API (media.ts) */
const all = new Map<HTMLElement, LiveSlot>();
const stills: Record<string, string> = {};
export function wake(el: HTMLElement, layer: HTMLElement, dir: string, m: Manifest) {
  let s = all.get(el);
  if (s && s.layer !== layer) { s.still('replaced'); all.delete(el); s = undefined; }
  if (!s) { s = new LiveSlot(el, layer, m, dir); all.set(el, s); s.boot(); return; }
  s.resume();
}
export function sleep(el: HTMLElement) { all.get(el)?.pause(); }
export function has(el: HTMLElement) { const s = all.get(el); return !!s && s.state !== 'still'; }

function report() {
  const out: Record<string, unknown> = { on: true, force, override, reduce: reduce(), fine: mq.fine.matches, still: stills };
  all.forEach((s, el) => { out[el.dataset.slot || s.name] = s.info(); });
  return out;
}
(window as any).__live = { report, slots: all };

/* ---- the visible switch: a small chip while the flag is on, to see the tier and turn it off ---- */
let chip: HTMLElement | null = null;
let hudEl: HTMLElement | null = null;
export function init() {
  const why = stillReason();
  if (why) stills.page = why;
  if (chip) return;
  chip = document.createElement('div');
  chip.className = 'live-chip';
  chip.setAttribute('role', 'group');
  chip.setAttribute('aria-label', 'Live frames test');
  const label = document.createElement('span');
  const off = document.createElement('button');
  off.type = 'button';
  off.textContent = 'Turn off';
  off.addEventListener('click', liveOff);
  chip.append(label, off);
  Object.assign(chip.style, { position: 'fixed', left: '12px', bottom: '12px', zIndex: '60', display: 'flex', gap: '10px', alignItems: 'center',
    font: '500 12px/1 var(--f-sans, system-ui)', color: 'var(--ink-3, #8a867f)', background: 'rgba(16,16,18,0.86)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '999px', padding: '6px 6px 6px 12px', backdropFilter: 'blur(8px)' });
  Object.assign(off.style, { font: 'inherit', color: 'var(--ink, #e9e5de)', background: 'rgba(255,255,255,0.06)', border: '0', borderRadius: '999px', padding: '6px 10px', cursor: 'pointer' });
  const upd = () => {
    const tiers = [...all.values()].map((s) => (s.tier === 'still' ? `still (${s.reason || stills.page || '...'})` : s.tier));
    label.textContent = `Live frames: ${tiers.length ? [...new Set(tiers)].join(', ') : why ? `still (${why})` : 'starting'}`;
  };
  upd();
  setInterval(upd, 1000);
  document.body.appendChild(chip);
  if (HUD) {
    hudEl = document.createElement('pre');
    Object.assign(hudEl.style, { position: 'fixed', right: '12px', bottom: '12px', zIndex: '60', font: '11px/1.35 ui-monospace, monospace', color: '#8a867f', margin: '0', pointerEvents: 'none', whiteSpace: 'pre' });
    document.body.appendChild(hudEl);
  }
}
let hudAt = 0;
function hud() {
  const now = performance.now();
  if (!hudEl || now - hudAt < 250) return;
  hudAt = now;
  const lines: string[] = [];
  all.forEach((s) => {
    const i = s.info() as Record<string, unknown>;
    lines.push(`${s.name}: ${i.tier} ${i.state} dpr ${i.dpr} bench ${i.bench} ms draw p50 ${i.drawP50} ms wd p90 ${i.wdP90} ms\n  ${i.memoryMB} MB gpu  ${Math.round((i.bytes as number) / 1024)} KB  yaw ${i.yaw} pitch ${i.pitch} axis ${i.axis} hop ${i.hop} ${i.exact ? 'exact' : 'blend'} full ${i.fullLayer}`);
  });
  hudEl.textContent = lines.join('\n');
}
export { ORDER };
