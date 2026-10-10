/* Decodes a full-size lean frame and brings it to the canvas's device size with a Lanczos-3 filter, off
   the main thread (media.ts decodeFull; ADR-0006 amendment of 2026-10-10, evening). The browser's own
   reductions (createImageBitmap's resizeQuality, drawImage's imageSmoothingQuality, the page's paint)
   kept 0.68-0.79 of a Lanczos reduction's detail at the ratios the lean uses (0.56-0.9), so a resting
   lean frame looked softer than the poster beside it, which the page draws 1:1 (encode.py
   poster_widths). The frames are ground-subtracted and opaque: RGB is filtered, alpha stays 255. */

type Job = { id: number; blob: Blob; w: number; h: number };

/** Weights of a separable Lanczos-3 resample from n to m samples: for each output sample, the first
    input index and its normalised weights. */
function kernel(n: number, m: number): { start: Int32Array; size: number; w: Float32Array } {
  const s = n / m, f = Math.max(1, s), r = 3 * f;
  const size = Math.ceil(r) * 2 + 1;
  const start = new Int32Array(m), w = new Float32Array(m * size);
  const L = (x: number) => (x === 0 ? 1 : Math.abs(x) >= 3 ? 0 : (3 * Math.sin(Math.PI * x) * Math.sin((Math.PI * x) / 3)) / (Math.PI * Math.PI * x * x));
  for (let o = 0; o < m; o++) {
    const c = (o + 0.5) * s - 0.5, i0 = Math.floor(c - r) + 1;
    start[o] = i0;
    let sum = 0;
    for (let k = 0; k < size; k++) {
      const i = i0 + k;
      const v = i < i0 || (i - c) / f >= 3 ? 0 : L((i - c) / f);
      w[o * size + k] = v; sum += v;
    }
    for (let k = 0; k < size; k++) w[o * size + k] /= sum || 1;
  }
  return { start, size, w };
}

function resize(src: ImageData, W: number, H: number): ImageData {
  const sw = src.width, sh = src.height, d = src.data;
  const kx = kernel(sw, W), ky = kernel(sh, H);
  /* horizontal pass into a float buffer (sh rows x W columns x 3), then vertical into bytes */
  const tmp = new Float32Array(sh * W * 3);
  for (let y = 0; y < sh; y++) {
    const row = y * sw * 4;
    for (let x = 0; x < W; x++) {
      let r = 0, g = 0, b = 0;
      const i0 = kx.start[x], base = x * kx.size;
      for (let k = 0; k < kx.size; k++) {
        const wt = kx.w[base + k];
        if (!wt) continue;
        const i = Math.min(sw - 1, Math.max(0, i0 + k)) * 4 + row;
        r += d[i] * wt; g += d[i + 1] * wt; b += d[i + 2] * wt;
      }
      const t = (y * W + x) * 3;
      tmp[t] = r; tmp[t + 1] = g; tmp[t + 2] = b;
    }
  }
  const out = new ImageData(W, H), o = out.data;
  for (let y = 0; y < H; y++) {
    const j0 = ky.start[y], base = y * ky.size;
    for (let x = 0; x < W; x++) {
      let r = 0, g = 0, b = 0;
      for (let k = 0; k < ky.size; k++) {
        const wt = ky.w[base + k];
        if (!wt) continue;
        const t = (Math.min(sh - 1, Math.max(0, j0 + k)) * W + x) * 3;
        r += tmp[t] * wt; g += tmp[t + 1] * wt; b += tmp[t + 2] * wt;
      }
      const p = (y * W + x) * 4;
      o[p] = r; o[p + 1] = g; o[p + 2] = b; o[p + 3] = 255;   // Uint8ClampedArray rounds and clamps
    }
  }
  return out;
}

self.onmessage = async (e: MessageEvent<Job>) => {
  const { id, blob, w, h } = e.data;
  try {
    const src = await createImageBitmap(blob);
    if (src.width === w && src.height === h) { (self as any).postMessage({ id, bitmap: src }, [src]); return; }
    const a = new OffscreenCanvas(src.width, src.height).getContext('2d', { willReadFrequently: true })!;
    a.drawImage(src, 0, 0);
    const img = a.getImageData(0, 0, src.width, src.height);
    src.close();
    const b = new OffscreenCanvas(w, h);
    b.getContext('2d')!.putImageData(resize(img, w, h), 0, 0);
    const bitmap = b.transferToImageBitmap();
    (self as any).postMessage({ id, bitmap }, [bitmap]);
  } catch {
    (self as any).postMessage({ id, bitmap: null });
  }
};
