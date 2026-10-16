/* Glass version c (glass.css; glass study V7 §3): a WebGL lens light for each glass object. WebGL cannot
   read the page's pixels, so it cannot refract the real content; it adds the light CSS draws only
   approximately: an aura caustic gathered at the lower inner edge (stronger toward the middle), the
   second pigment at the ends and a specular arc at the top, added with plus-lighter over a's CSS body.
   Gate: WebGL without a major performance caveat and not a software renderer (?glassforce=1 skips the
   gate, for measuring). A canvas is drawn again only when its size or the aura changes; the aura is read
   at most every 160 ms while the page scrolls or the field cross-fades. */
import { eachGlass } from './glass';

const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
const FS = `precision highp float;
  uniform vec4 uRect; uniform float uDpr; uniform vec3 uA1, uA2;
  float pill(vec2 p, vec2 s, out vec2 n){ float r = s.y * .5; vec2 c = clamp(p, vec2(r), s - vec2(r)); vec2 v = p - c;
    float l = max(length(v), 1e-3); n = v / l; return r - l; }
  void main(){
    vec2 p = vec2(gl_FragCoord.x, uRect.w * uDpr - gl_FragCoord.y) / uDpr; vec2 n; float d = pill(p, uRect.zw, n);
    float a = clamp(d * uDpr + .5, 0., 1.); if (a <= 0.) discard;
    float rim = min(12., uRect.w * .5); float m = pow(1. - clamp(d / rim, 0., 1.), 2.2);
    float side = 1. - abs(p.x / uRect.z - .5) * 2.;
    vec3 c = uA1 * .22 * m * max(n.y, 0.) * (.4 + .6 * side);
    c += uA2 * .08 * m * abs(n.x);
    c += vec3(.07) * smoothstep(5., 0., d) * max(-n.y, 0.) * (.3 + .7 * side);
    gl_FragColor = vec4(c * a, 0.);
  }`;

type Item = { el: HTMLElement; cv: HTMLCanvasElement; gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null>; key: string };

function program(gl: WebGLRenderingContext) {
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const l = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const k of ['uRect', 'uDpr', 'uA1', 'uA2']) u[k] = gl.getUniformLocation(p, k);
  return u;
}

/* a computed colour (rgb(), or a #hex from the typed --a1) as 0-1 channels */
function rgb(s: string): [number, number, number] | null {
  s = s.trim();
  if (s[0] === '#') { const v = parseInt(s.slice(1, 7), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; }
  const m = s.match(/[\d.]+/g);
  return m && m.length >= 3 ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : null;
}

export function initLight() {
  const force = /[?&]glassforce=1\b/.test(location.search);
  const probe = document.createElement('canvas').getContext('webgl', { failIfMajorPerformanceCaveat: true });
  const ext = probe?.getExtension('WEBGL_debug_renderer_info');
  const soft = !probe || /SwiftShader|llvmpipe|Software/i.test(ext ? String(probe.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '');
  probe?.getExtension('WEBGL_lose_context')?.loseContext();
  if (soft && !force) return;
  const dpr = Math.min(devicePixelRatio || 1, 3);
  const items: Item[] = [];
  let raf = 0, lastRead = 0;
  eachGlass((el) => {
    const cv = document.createElement('canvas');
    cv.className = 'g-gl'; cv.setAttribute('aria-hidden', 'true');
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const u = program(gl);
    if (!u) return;
    el.prepend(cv);
    items.push({ el, cv, gl, u, key: '' });
    queue();
  });
  function draw(now: number) {
    raf = 0;
    if (now - lastRead < 160) { queue(); return; }
    lastRead = now;
    for (const it of items) {
      if (!it.el.isConnected) continue;
      const cs = getComputedStyle(it.el);
      const a1 = cs.getPropertyValue('--a1'), a2 = cs.getPropertyValue('--a2');
      const w = it.el.offsetWidth, h = it.el.offsetHeight;
      const key = `${w}x${h} ${a1} ${a2}`;
      if (!w || key === it.key) continue;
      it.key = key;
      const { cv, gl, u } = it;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.uDpr, dpr); gl.uniform4f(u.uRect, 0, 0, w, h);
      gl.uniform3fv(u.uA1, rgb(a1) ?? [0.43, 0.55, 1]); gl.uniform3fv(u.uA2, rgb(a2) ?? [0.6, 0.61, 0.94]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  function queue() { if (!raf) raf = requestAnimationFrame(draw); }
  addEventListener('scroll', queue, { passive: true, capture: true });
  addEventListener('resize', queue);
  /* the field cross-fades --a1 over about a second after a section change: keep reading while it runs */
  let tail = 0;
  addEventListener('scroll', () => { clearTimeout(tail); tail = window.setTimeout(() => { let k = 0; const t = () => { queue(); if (++k < 8) setTimeout(t, 180); }; t(); }, 120); }, { passive: true, capture: true });
}
