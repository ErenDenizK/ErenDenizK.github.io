// Grades the owner's photos into the page ground and writes the site's image files.
// Rules: docs/research/2026-10-media.md §6 and §8.9. Sources: content/photos/ (full resolution,
// metadata stripped). Output: src/assets/photos/ (committed). Run: node tools/photos/grade.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const SRC = path.join(ROOT, 'content/photos');
const OUT = path.join(ROOT, 'src/assets/photos');
const G = [10, 10, 11];   // the page ground, sRGB code values

let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const gauss = () => { let u = 0; while (!u) u = rnd(); const v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const toLin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (l) => 255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055);

fs.mkdirSync(OUT, { recursive: true });

// Courtyard through the tinted lens: crop the brightest finger, grade in linear light (exposure
// down, saturation -15 %, a slight warm split), a vignette that reaches the ground, clamp to never
// fall below the ground, sub-LSB dither, then encode (media research §6.2).
{
  const src = sharp(path.join(SRC, 'park-through-lens.jpg')).extract({ left: 150, top: 0, width: 1350, height: 2000 });
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, out = Buffer.alloc(W * H * 3);
  const gl = G.map(toLin);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * info.channels;
    let r = toLin(data[i]), g = toLin(data[i + 1]), b = toLin(data[i + 2]);
    const e = 0.42; r *= e; g *= e; b *= e;
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b, s = 0.85;
    r = L + (r - L) * s; g = L + (g - L) * s; b = L + (b - L) * s;
    r *= 1.02; b *= 0.95;
    const dx = (x / W - 0.56) / 0.62, dy = (y / H - 0.44) / 0.66, d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
    const v = 1 - 0.85 * Math.pow(d, 2.2);
    const o = [r, g, b].map((c, k) => toSrgb(gl[k] + Math.max(0, c - gl[k]) * v));
    for (let k = 0; k < 3; k++) out[(y * W + x) * 3 + k] = Math.max(G[k], Math.min(255, Math.round(o[k] + gauss() * 0.6)));
  }
  const png = await sharp(out, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  for (const w of [750, 1000, 1350]) {
    await sharp(png).resize(w).avif({ quality: 50, effort: 6 }).toFile(path.join(OUT, `courtyard-${w}.avif`));
    await sharp(png).resize(w).webp({ quality: 74, effort: 6, smartSubsample: true }).toFile(path.join(OUT, `courtyard-${w}.webp`));
  }
}

// The gate selfie: a 4:5 crop around the face and the thumb.
{
  const base = sharp(path.join(SRC, 'eren-ytu-gate.jpg')).extract({ left: 700, top: 150, width: 1080, height: 1350 })
    .modulate({ brightness: 0.95, saturation: 0.9 });
  const buf = await base.png().toBuffer();
  for (const w of [480, 760]) {
    await sharp(buf).resize(w).avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `gate-${w}.avif`));
    await sharp(buf).resize(w).webp({ quality: 74, smartSubsample: true }).toFile(path.join(OUT, `gate-${w}.webp`));
  }
}

// Static page grain: a 128 px tile, light noise at low alpha (about +-2 levels on the ground).
{
  const n = 128, gb = Buffer.alloc(n * n * 4);
  for (let i = 0; i < n * n; i++) { const v = Math.round(rnd() * 90); gb[i * 4] = gb[i * 4 + 1] = gb[i * 4 + 2] = v; gb[i * 4 + 3] = 12; }
  await sharp(gb, { raw: { width: n, height: n, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'grain.png'));
}

for (const f of fs.readdirSync(OUT).sort()) console.log(f.padEnd(24), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1), 'KB');
