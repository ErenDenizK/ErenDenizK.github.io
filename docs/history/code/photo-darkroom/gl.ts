/* The one WebGL piece About's photographs share (docs/research/2026-10-photo-presentation.md): a canvas,
   one full-screen triangle and one fragment shader over the photograph. WebGL 1 only, no library, a
   few hundred bytes. Anything that fails (no context, a shader that does not compile, a lost context)
   returns null or calls `lost`, and the caller keeps the still photograph it already shows. */

export type GL = {
  gl: WebGLRenderingContext;
  u: (name: string) => WebGLUniformLocation | null;
  texture: (src: TexImageSource, unit: number, name: string) => boolean;
  size: (w: number, h: number) => void;
  draw: () => void;
  lose: () => void;
};

const VERT = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';

export function makeGL(canvas: HTMLCanvasElement, frag: string, lost?: () => void): GL | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
  } catch { gl = null; }
  if (!gl) return null;
  const g = gl;
  const sh = (type: number, src: string) => {
    const s = g.createShader(type)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(g.VERTEX_SHADER, VERT), fs = sh(g.FRAGMENT_SHADER, 'precision mediump float;' + frag);
  if (!vs || !fs) return null;
  const prog = g.createProgram()!;
  g.attachShader(prog, vs); g.attachShader(prog, fs); g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, 'p');
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!cache.has(name)) cache.set(name, g.getUniformLocation(prog, name));
    return cache.get(name)!;
  };
  if (lost) canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost(); }, { once: true });
  return {
    gl: g,
    u,
    texture(src, unit, name) {
      try {
        const t = g.createTexture();
        g.activeTexture(g.TEXTURE0 + unit);
        g.bindTexture(g.TEXTURE_2D, t);
        g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, src);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.uniform1i(u(name), unit);
        return g.getError() === g.NO_ERROR;
      } catch { return false; }
    },
    size(w, h) {
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      g.viewport(0, 0, w, h);
    },
    draw() { g.drawArrays(g.TRIANGLES, 0, 3); },
    lose() { g.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}

/** The canvas's pixel size for a box of css size w × h: at most 2 device pixels per css pixel. */
export const px = (w: number, h: number) => {
  const d = Math.min(2, devicePixelRatio || 1);
  return [Math.max(1, Math.round(w * d)), Math.max(1, Math.round(h * d))] as const;
};
