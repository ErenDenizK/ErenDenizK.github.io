/* Concept 3, "Depth" (components/photo/Depth.astro; docs/research/2026-10-photo-presentation.md §3.3).
   The photograph as a window, with a painted depth map (tools/photos/depth.py):

   - looking around: a mouse over the photo moves the eye; a finger dragging sideways across it does the
     same (touch-action: pan-y, so a vertical drag still scrolls the page and the browser keeps it), and
     the page's scrolling moves the eye up and down as the photo passes, as walking past a window does;
     near things move against far ones (each pixel is sampled from where its depth puts it);
   - pulling focus: a tap or click picks the depth under it; that plane stays sharp, the others soften
     (a 12-tap golden-angle disc, at most 7 device pixels); a second tap on the same plane opens it all
     sharp again. From the keyboard, Enter or Space steps through near, far and all;
   - the glass in front (a band of light) slides against the look, and the photo's light on the wall
     grows as it nears the middle of the window.

   The WebGL context lives only while the photo is near the window; one loop per photo, asleep when
   nothing moves. Still twins: reduced motion or ?still shows the photograph still and sharp (no focus
   control); without WebGL the whole photo moves a little behind its glass (CSS variables). */
import { motionOK, mq } from '../env';
import { makeGL, px, type GL } from './gl';

const FRAG = `
varying vec2 v;uniform sampler2D T,Dm;uniform vec2 L,Px;uniform float F,Ap,S;
float dep(vec2 p){return texture2D(Dm,p).r;}
void main(){
  vec2 b=(v-.5)/S+.5;vec2 off=L*vec2(.026,.02);vec2 p=b;
  for(int i=0;i<5;i++){p=b+off*(dep(p)-.45);}
  float d=dep(p);
  float r=Ap*smoothstep(.06,.4,abs(d-F))*6.;
  vec3 c=texture2D(T,p).rgb;
  if(r>.3){vec3 a=c;
    for(int i=0;i<16;i++){float t=float(i)*2.39996;float q=sqrt((float(i)+.5)/16.);a+=texture2D(T,p+vec2(cos(t),sin(t))*q*r*Px).rgb;}
    c=a/17.;}
  gl_FragColor=vec4(c,1.);
}`;
const S = 1.06;

export function init(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-depth]').forEach(setup);
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

function setup(el: HTMLElement) {
  if (el.dataset.live) return;
  el.dataset.live = '1';
  const pic = el.querySelector<HTMLElement>('.dp-pic')!;
  const img = pic.querySelector<HTMLImageElement>('img')!;
  const canvas = pic.querySelector<HTMLCanvasElement>('canvas')!;
  const ring = pic.querySelector<HTMLElement>('.dp-ring')!;
  const hit = pic.querySelector<HTMLButtonElement>('.dp-hit');
  if (!motionOK()) { if (hit) hit.hidden = true; return; }
  el.classList.add('is-live');

  /* the depth map, also read on the CPU so a tap knows the depth under it */
  let map: HTMLImageElement | null = null, depthAt: ((u: number, v: number) => number) | null = null;
  const mapReady = el.dataset.map ? new Promise<void>((res) => {
    const m = new Image();
    m.decoding = 'async';
    m.onload = () => {
      map = m;
      try {
        const c = document.createElement('canvas');
        c.width = m.naturalWidth; c.height = m.naturalHeight;
        const x = c.getContext('2d', { willReadFrequently: true })!;
        x.drawImage(m, 0, 0);
        const data = x.getImageData(0, 0, c.width, c.height).data;
        depthAt = (u, v) => data[(Math.round(clamp(v, 0, 1) * (c.height - 1)) * c.width + Math.round(clamp(u, 0, 1) * (c.width - 1))) * 4] / 255;
      } catch { depthAt = null; }
      res();
    };
    m.onerror = () => res();
    m.src = el.dataset.map!;
  }) : Promise.resolve();

  /* ---- state: the look (lx, ly), focus depth (f) and aperture (ap), each eased toward a target ---- */
  let lx = 0, ly = 0, f = 0.5, ap = 0, near = 0;
  let mx = 0, my = 0, mouse = false, dragX = 0, fT = 0.5, apT = 0;
  let raf = 0, last = 0, visible = false;
  let g: GL | null = null, starting = false;

  const scrollLook = () => {
    const r = pic.getBoundingClientRect();
    const c = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
    near = 1 - Math.min(1, Math.abs(c));
    return clamp(c, -1, 1) * 0.75;
  };
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const lxT = mouse ? mx : dragX;
    const lyT = clamp(scrollLook() + (mouse ? my * 0.6 : 0), -1, 1);
    const e = (rate: number) => 1 - Math.exp(-dt * rate);
    lx += (lxT - lx) * e(mouse ? 7 : 9); ly += (lyT - ly) * e(8);
    f += (fT - f) * e(6); ap += (apT - ap) * e(6);
    if (!drag && !mouse) dragX += (0 - dragX) * e(1.8);
    el.style.setProperty('--lx', lx.toFixed(4));
    el.style.setProperty('--ly', ly.toFixed(4));
    el.style.setProperty('--near', near.toFixed(3));
    if (g) {
      const gl = g.gl;
      gl.uniform2f(g.u('L'), lx, ly);
      gl.uniform1f(g.u('F'), f);
      gl.uniform1f(g.u('Ap'), ap);
      g.draw();
    }
    const moving = Math.abs(lxT - lx) > 0.002 || Math.abs(lyT - ly) > 0.002 || Math.abs(fT - f) > 0.002 || Math.abs(apT - ap) > 0.002 || Math.abs(dragX) > 0.002 && !mouse && !drag;
    if (moving || drag) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /* ---- WebGL, only while near the window ---- */
  function size() {
    if (!g) return;
    const r = pic.getBoundingClientRect();
    const [w, h] = px(r.width, r.height);
    g.size(w, h);
    g.gl.uniform2f(g.u('Px'), 1 / w, 1 / h);
  }
  async function start() {
    if (g || starting) return;
    starting = true;
    await Promise.all([img.complete && img.naturalWidth ? null : new Promise((r) => img.addEventListener('load', r, { once: true })), mapReady]);
    await img.decode?.().catch(() => undefined);
    starting = false;
    if (!visible || g || !map) return;
    const made = makeGL(canvas, FRAG, stop);
    if (!made) return;   // the CSS look stays
    if (!made.texture(img, 0, 'T') || !made.texture(map, 1, 'Dm')) { made.lose(); return; }
    g = made;
    g.gl.uniform1f(g.u('S'), S);
    size();
    el.classList.add('is-gl');
    kick();
  }
  function stop() {
    el.classList.remove('is-gl');
    const old = g; g = null;
    setTimeout(() => { old?.lose(); }, 400);
  }
  new IntersectionObserver((es) => {
    const e = es[es.length - 1];
    visible = e.isIntersecting;
    if (visible) { start(); kick(); } else if (g) stop();
  }, { rootMargin: '25% 0px' }).observe(el);
  new ResizeObserver(() => { size(); kick(); }).observe(pic);
  addEventListener('scroll', kick, { passive: true });

  /* ---- looking: a mouse moves the eye; a finger dragging sideways does too ---- */
  pic.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !mq.fine.matches) return;
    const r = pic.getBoundingClientRect();
    mx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    my = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    mouse = true; kick();
  });
  pic.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { mouse = false; mx = my = 0; dragX = lx; kick(); } });
  type Drag = { id: number; x0: number; y0: number; from: number; moved: boolean };
  let drag: Drag | null = null, swallow = false;
  pic.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: dragX, moved: false };
  });
  pic.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 8) drag.moved = true;
    if (drag.moved) { dragX = clamp(drag.from + dx / (pic.clientWidth * 0.45), -1, 1); kick(); }
  });
  const release = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved) { swallow = true; setTimeout(() => (swallow = false), 0); }
    drag = null; kick();
  };
  pic.addEventListener('pointerup', release);
  pic.addEventListener('pointercancel', release);

  /* ---- pulling focus ---- */
  const steps = [0.92, 0.04, -1];
  let step = -1;
  function pull(u: number, v: number, d: number | null) {
    if (d === null || (apT > 0.5 && Math.abs(d - fT) < 0.12)) apT = 0;
    else { fT = d; apT = 1; }
    ring.style.left = `${(u * 100).toFixed(2)}%`;
    ring.style.top = `${(v * 100).toFixed(2)}%`;
    ring.classList.remove('is-on'); void ring.offsetWidth; ring.classList.add('is-on');
    kick();
  }
  hit?.addEventListener('click', (e) => {
    if (swallow) return;
    if (e.detail === 0) {   // the keyboard: near, far, all
      step = (step + 1) % steps.length;
      const d = steps[step];
      pull(0.5, 0.5, d < 0 ? null : d);
      return;
    }
    const r = pic.getBoundingClientRect();
    const u = clamp((e.clientX - r.left) / r.width, 0, 1), v = clamp((e.clientY - r.top) / r.height, 0, 1);
    /* the picture is drawn a little larger than its window: find the point of the map under the tap */
    const d = depthAt ? depthAt((u - 0.5) / S + 0.5 + lx * 0.026 * 0.5, (v - 0.5) / S + 0.5 + ly * 0.02 * 0.5) : null;
    pull(u, v, d);
  });

  scrollLook();
  visible = true; kick(); visible = false;
}
