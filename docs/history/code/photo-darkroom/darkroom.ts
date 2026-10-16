/* Concept 1, "Darkroom" (components/photo/Darkroom.astro; docs/research/2026-10-photo-presentation.md
   §3.1). The print develops as it is scrolled into view: how far it has come is set by where it stands
   in the window (never backwards: a print does not undevelop), and what is drawn chases that with a
   short lag, so a quick scroll still shows it develop. When it is done the canvas hands over to the
   <img> and its WebGL context is let go. A tap (or Enter, Space) turns the safelight on: the label is
   written over the print in light; a second tap turns the light back.

   One loop per print, only while it is developing. Still twins: reduced motion or ?still shows the print
   developed and the label crossfades (CSS); no WebGL develops it with a CSS filter. */
import { motionOK } from '../env';
import { makeGL, px, type GL } from './gl';

/* The developer: a front washes out from one corner (F); behind it the print comes up highlights
   first, red-monochrome first and in colour last; the front's edge refracts a little and catches the
   light. At P = 1 the output is the photograph exactly. D, after that, slides a sheen off as it dries. */
const FRAG = `
varying vec2 v;uniform sampler2D T;uniform float P,D,Tm,A;uniform vec2 F;
void main(){
  vec2 q=(v-F)*vec2(A,1.);float dist=length(q)/length(vec2(A,1.));
  float front=P*1.75-.3;float local=clamp((front-dist)/.45,0.,1.);
  float band=exp(-pow((front-dist)*9.,2.))*(1.-step(1.,P));
  vec2 w=vec2(sin(dist*80.-Tm*5.+v.y*20.),cos(dist*64.-Tm*4.+v.x*14.))*.0035*band;
  vec3 c=texture2D(T,v+w).rgb;
  float L=dot(c,vec3(.2126,.7152,.0722));
  float th=1.-local*1.15;
  float k=smoothstep(th-.05,th+.45,L+local*.25);
  vec3 mono=vec3(L)*vec3(1.,.42,.34);
  vec3 dev=mix(mono,c,smoothstep(.35,.95,local))*k;
  dev=mix(dev,c,smoothstep(.9,1.,local));
  vec3 paper=vec3(.055,.013,.01)*(1.-v.y*.65);
  vec3 o=mix(paper,dev,smoothstep(0.,.12,local));
  o+=band*.07*vec3(1.,.8,.72);
  float s=exp(-pow((v.y-(D*1.6-.3))*5.,2.))*D*(1.-D)*4.;
  o+=s*.07;
  gl_FragColor=vec4(o,1.);
}`;

export function init(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-darkroom]').forEach(setup);
}

function setup(el: HTMLElement) {
  if (el.dataset.live) return;
  el.dataset.live = '1';
  const img = el.querySelector<HTMLImageElement>('img')!;
  const canvas = el.querySelector<HTMLCanvasElement>('canvas')!;
  const hit = el.querySelector<HTMLButtonElement>('.dk-hit')!;
  let developed = false;

  const safe = (on: boolean) => {
    el.classList.toggle('is-safe', on);
    hit.setAttribute('aria-pressed', String(on));
  };
  hit.addEventListener('click', () => {
    if (!developed) finish();
    safe(!el.classList.contains('is-safe'));
  });

  let finish = () => { developed = true; el.classList.add('is-developed'); };
  if (!motionOK()) { el.classList.add('is-still'); finish(); return; }

  const ready = () => (img.complete && img.naturalWidth ? Promise.resolve() : new Promise<void>((r) => img.addEventListener('load', () => r(), { once: true })));
  /* where the print stands: 0 when its top enters the window, 1 when its middle is a little above the
     window's middle */
  const where = () => {
    const r = el.querySelector('.dk-print')!.getBoundingClientRect();
    const vh = innerHeight;
    if (r.bottom < 0) return 1;
    return Math.min(1, Math.max(0, (vh * 0.98 - r.top) / (vh * 0.98 - (vh * 0.52 - r.height / 2))));
  };

  let g: GL | null = null;
  const css = () => {
    g?.lose(); g = null;
    el.classList.remove('is-live');
    el.classList.add('is-css');
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); requestAnimationFrame(() => finish()); }
    }, { threshold: 0.35 });
    io.observe(el);
    finish = () => { developed = true; io.disconnect(); el.classList.add('is-developed'); };
  };

  g = makeGL(canvas, FRAG, () => { if (!developed) css(); });
  if (!g) { css(); return; }
  el.classList.add('is-live');
  const gl = g;
  const from = el.dataset.from === 'tr' ? [1, 0] : [0, 0];

  let target = 0, p = 0, dry = 0, t0 = 0, last = 0, raf = 0, tex = false, visible = false;
  finish = () => { target = 1; p = Math.max(p, 0.999); kick(); };

  function size() {
    const r = canvas.getBoundingClientRect();
    const [w, h] = px(r.width, r.height);
    gl.size(w, h);
    gl.gl.uniform1f(gl.u('A'), r.width / Math.max(1, r.height));
  }
  function done() {
    developed = true;
    el.classList.add('is-developed');
    cancelAnimationFrame(raf); raf = 0;
    io.disconnect();
    /* the canvas fades to the <img> it shows exactly; then its context is let go */
    setTimeout(() => { gl.lose(); canvas.width = canvas.height = 1; }, 600);
  }
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    target = Math.max(target, where());
    /* chase the target with a short lag, and never slower than a slow developer */
    if (p < target) p = Math.min(target, p + Math.max((target - p) * (1 - Math.exp(-dt * 2.6)), dt * 0.12));
    if (p >= 0.999) { p = 1; dry = Math.min(1, dry + dt / 1.1); }
    gl.gl.uniform1f(gl.u('P'), p);
    gl.gl.uniform1f(gl.u('D'), dry);
    gl.gl.uniform1f(gl.u('Tm'), (now - t0) / 1000);
    gl.draw();
    if (dry >= 1) { done(); return; }
    if (visible || p < target) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (raf || !tex || developed) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
    if (visible) kick();
  }, { rootMargin: '10% 0px' });

  ready().then(() => img.decode?.().catch(() => undefined)).then(() => {
    if (developed) return;
    size();
    gl.gl.uniform2f(gl.u('F'), from[0], from[1]);
    if (!gl.texture(img, 0, 'T')) { css(); return; }
    tex = true;
    t0 = performance.now();
    /* already past it (a link to a later chapter): it is simply developed */
    if (where() >= 1 && el.getBoundingClientRect().bottom < 0) { p = target = 1; dry = 1; }
    gl.gl.uniform1f(gl.u('P'), p); gl.gl.uniform1f(gl.u('D'), dry); gl.draw();
    if (dry >= 1) { done(); return; }
    io.observe(el);
    new ResizeObserver(() => { if (!developed) { size(); gl.draw(); } }).observe(canvas);
  });
}
