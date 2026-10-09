/* WebGL2 for the frame engine: one fragment shader that draws exact Cycles frames from texture
   arrays and adds a pointer light from the normal pass (liveliness research §6, proof 1). No
   library: a full-screen triangle, six sampler arrays and uniforms.

   Everything stays in the media's own sRGB code values, as the canvas 2D blend and the CSS
   plus-lighter compositing do: frames are ground-subtracted (the ground is exact 0), the blend of
   neighbouring frames is linear in code values (README "Drawing it"), the pool only scales object
   pixels, and every added light is gated by the beauty frame, so the ground stays exactly 0 and the
   page's own #0a0a0b shows through the plus-lighter canvas unchanged. */
export const VS = `#version 300 es
in vec2 a; out vec2 uv;
void main(){ uv = vec2(a.x * 0.5 + 0.5, 0.5 - a.y * 0.5); gl_Position = vec4(a, 0., 1.); }`;

export const FS = `#version 300 es
precision highp float; precision highp sampler2DArray;
uniform sampler2DArray tG, tF, tN, tC, tCN, tP;
uniform vec4 rect, gRect, cRect;
uniform vec2 cr, pose, shift, piv;
uniform float rot, fullLayer, nMode, nFade, restLayer, clipF, clipMix, nClip, peakOn, clipNOn;
uniform float lightAmt, poolAmt, size, kPool, kPoolR, kPoolGain, kSharp, kSpec, kRim;
uniform vec3 Lp, Lc, accent;
in vec2 uv; out vec4 o;
bool inside(vec2 u){ return all(greaterThanEqual(u, vec2(0.))) && all(lessThanEqual(u, vec2(1.))); }
vec3 nrm(vec4 t){ vec2 xy = t.rg * 2. - 1.; return vec3(xy, sqrt(max(0., 1. - dot(xy, xy)))); }
void main(){
  vec2 q = rect.xy + uv * rect.zw - piv - shift;              // square px, the float undone
  float cs = cos(rot), sn = sin(rot);
  vec2 p = vec2(cs * q.x + sn * q.y, -sn * q.x + cs * q.y) + piv;
  vec3 col = vec3(0.); vec4 nt = vec4(0.5, 0.5, 0., 0.);
  vec2 gu = (p - gRect.xy) / gRect.zw;
  if (inside(gu)) {
    if (fullLayer >= 0.) col = texture(tF, vec3(gu, fullLayer)).rgb;   // an exact full-size frame
    else {
      float i0 = clamp(floor(pose.x), 0., max(0., cr.x - 2.)), j0 = clamp(floor(pose.y), 0., max(0., cr.y - 2.));
      float tx = clamp(pose.x - i0, 0., 1.), ty = clamp(pose.y - j0, 0., 1.);
      float l00 = j0 * cr.x + i0, l01 = l00 + (cr.y > 1. ? cr.x : 0.);
      vec4 w = vec4((1. - tx) * (1. - ty), tx * (1. - ty), (1. - tx) * ty, tx * ty);
      col = texture(tG, vec3(gu, l00)).rgb * w.x + texture(tG, vec3(gu, l00 + 1.)).rgb * w.y
          + texture(tG, vec3(gu, l01)).rgb * w.z + texture(tG, vec3(gu, l01 + 1.)).rgb * w.w;
      if (nMode > 1.5) nt = texture(tN, vec3(gu, l00)) * w.x + texture(tN, vec3(gu, l00 + 1.)) * w.y
                          + texture(tN, vec3(gu, l01)) * w.z + texture(tN, vec3(gu, l01 + 1.)) * w.w;
    }
    if (nMode > 1.5 && fullLayer >= 0.) {
      float l = floor(pose.y + 0.5) * cr.x + floor(pose.x + 0.5);
      nt = texture(tN, vec3(gu, l));
    } else if (nMode > 0.5 && nMode < 1.5) nt = texture(tN, vec3(gu, restLayer));
  }
  float nAmt = nMode > 0.5 ? nFade : 0.;
  if (clipMix > 0.) {
    vec2 cu = (p - cRect.xy) / cRect.zw; vec3 cc = vec3(0.); vec4 cn = vec4(0.5, 0.5, 0., 0.);
    if (inside(cu)) {
      if (peakOn > 0.5) cc = texture(tP, vec3(cu, 0.)).rgb;
      else {
        float f0 = floor(clipF), f1 = min(f0 + 1., nClip - 1.), ft = clipF - f0;
        cc = mix(texture(tC, vec3(cu, f0)).rgb, texture(tC, vec3(cu, f1)).rgb, ft);
        if (clipNOn > 0.5) cn = mix(texture(tCN, vec3(cu, f0)), texture(tCN, vec3(cu, f1)), ft);
      }
      if (clipNOn > 0.5 && peakOn > 0.5) cn = texture(tCN, vec3(cu, nClip - 1.));
    }
    col = mix(col, cc, clipMix);
    if (clipNOn > 0.5) { nt = mix(nt, cn, clipMix); nAmt = mix(nAmt, 1., clipMix); }
    else nAmt *= 1. - clipMix;
  }
  float gate = smoothstep(1. / 255., 10. / 255., max(col.r, max(col.g, col.b))) * nAmt * lightAmt;
  if (gate > 0.) {
    vec3 N = normalize(nrm(nt));
    vec3 P = vec3(p.x, -p.y, 0.), L = vec3(Lp.x, -Lp.y, Lp.z);
    vec3 l = normalize(L - P), r = reflect(vec3(0., 0., -1.), N);
    float rl = max(dot(r, l), 0.), ndl = max(dot(N, l), 0.);
    float fres = 0.04 + 0.96 * pow(1. - clamp(N.z, 0., 1.), 5.);
    float d = length(p - Lp.xy) / size;
    float pool = exp(-d * d / (kPoolR * kPoolR));
    col *= mix(1., kPool + (1. - kPool + kPoolGain) * pool, poolAmt * gate);
    float glint = pow(rl, kSharp) * (0.25 + 0.75 * smoothstep(0.02, 0.5, 1. - N.z)) * kSpec;
    col += (Lc * glint + accent * fres * ndl * kRim) * gate;
  }
  o = vec4(col, 1.);
}`;

export const UNIFORMS = ['tG', 'tF', 'tN', 'tC', 'tCN', 'tP', 'rect', 'gRect', 'cRect', 'cr', 'pose', 'shift', 'piv', 'rot',
  'fullLayer', 'nMode', 'nFade', 'restLayer', 'clipF', 'clipMix', 'nClip', 'peakOn', 'clipNOn', 'lightAmt', 'poolAmt', 'size',
  'kPool', 'kPoolR', 'kPoolGain', 'kSharp', 'kSpec', 'kRim', 'Lp', 'Lc', 'accent'] as const;
export type U = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
export const UNITS = { tG: 0, tF: 1, tN: 2, tC: 3, tCN: 4, tP: 5 } as const;
export type Unit = keyof typeof UNITS;

export function program(gl: WebGL2RenderingContext): { prog: WebGLProgram; u: U } {
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s); gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(x) || 'shader');
    return x;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.bindAttribLocation(prog, 0, 'a');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(prog) || 'link');
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = {} as U;
  for (const n of UNIFORMS) u[n] = gl.getUniformLocation(prog, n);
  for (const [n, i] of Object.entries(UNITS)) gl.uniform1i(u[n as Unit], i);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  return { prog, u };
}

/** A texture array of n layers, w x h, RGBA8 (immutable storage). Returns it with its bytes. */
export function texArray(gl: WebGL2RenderingContext, unit: Unit, w: number, h: number, n: number, rg = false): Tex {
  const tex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + UNITS[unit]);
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, rg ? gl.RG8 : gl.RGBA8, w, h, n);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { tex, bytes: w * h * n * (rg ? 2 : 4), w, h, n, rg, unit };
}
/** Normal maps carry two channels (x, y; z is rebuilt), so they live in RG8: half the memory. */
export type Tex = { tex: WebGLTexture; bytes: number; w: number; h: number; n: number; rg: boolean; unit: Unit };

/** Upload an image (one frame, or a strip of frames stacked top to bottom) into layers from z. */
export function upload(gl: WebGL2RenderingContext, t: Tex, img: ImageBitmap | ImageData | Uint8Array, z: number, frames?: number) {
  const n = frames ?? Math.max(1, Math.min(t.n - z, Math.round(('height' in img ? img.height : t.h) / t.h)));
  gl.activeTexture(gl.TEXTURE0 + UNITS[t.unit]);
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, t.tex);
  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, t.h);
  const fmt = t.rg ? gl.RG : gl.RGBA;
  if (img instanceof Uint8Array) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, z, t.w, t.h, n, fmt, gl.UNSIGNED_BYTE, img);
  else if (img.width === t.w) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, z, t.w, t.h, n, fmt, gl.UNSIGNED_BYTE, img);
  gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, 0);
}
