// The person's part of the two-page Home (spec v2 §3.5.1 and §3.6.1). Two jobs, no other files touched:
// 1. The ID card's livelier photo (review row C2): the same square crop of the gate selfie as
//    grade.mjs, regraded warmer and brighter (exposure +6 %, saturation +16 %, contrast +7 %,
//    warmth +6 % against the live card's grade), written as gate-card-live-<w>.{avif,webp}.
// 2. Measurements of each postcard photograph, for the postcard's back (row P4; spec v3 §2.1): the five
//    colours the photograph is made of (k-means in RGB on a 64 px copy, sorted by share) and the darkest
//    of them (`deep`, the back's ground). Two entries are the back's design data, not measurements: the
//    drawing of the photograph (`drawing`, the stem of src/one/rest/art/pc-<stem>.svg, present only when
//    that file exists) and the stamp's crop point (`crop`, CROPS below). The round-two luminance rows for
//    the postmark's cancellation lines are gone with the lines. Written to
//    src/assets/photos/postcards-meta.json.
// Nothing is invented: every colour is measured from the owner's file. Run: node tools/photos/live.mjs
// (`--meta` writes the measurements only and leaves the card's photo files alone).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const SRC = path.join(ROOT, 'content/photos');
const OUT = path.join(ROOT, 'src/assets/photos');

if (!process.argv.includes('--meta')) {
  // the live card's grade was brightness 0.95, saturation 0.9; this one is 6 % brighter, 16 % more
  // saturated, 7 % more contrast about mid grey, and 6 % warmer (red up, blue down by half each)
  const base = sharp(path.join(SRC, 'eren-ytu-gate.jpg')).extract({ left: 680, top: 290, width: 1150, height: 1150 })
    .modulate({ brightness: 0.95 * 1.06, saturation: 0.9 * 1.16 })
    .linear(1.07, -128 * 0.07)
    .recomb([[1.03, 0, 0], [0, 1, 0], [0, 0, 0.97]]);
  const buf = await base.png().toBuffer();
  for (const w of [360, 640, 960]) {
    await sharp(buf).resize(w).avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `gate-card-live-${w}.avif`));
    await sharp(buf).resize(w).webp({ quality: 74, smartSubsample: true }).toFile(path.join(OUT, `gate-card-live-${w}.webp`));
  }
}

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const stems = [...new Set((site.home?.postcards ?? []).map((p) => p.photo))];
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** k-means with a fixed start (evenly spaced by luminance), so every run gives the same colours */
function kmeans(px, k = 5, iters = 24) {
  const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  const sorted = [...px].sort((a, b) => lum(a) - lum(b));
  let cs = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]]);
  let assign = new Array(px.length).fill(0);
  for (let it = 0; it < iters; it++) {
    assign = px.map((p) => {
      let best = 0, bd = Infinity;
      cs.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = j; } });
      return best;
    });
    cs = cs.map((c, j) => {
      const m = px.filter((_, i) => assign[i] === j);
      return m.length ? [0, 1, 2].map((ch) => m.reduce((n, p) => n + p[ch], 0) / m.length) : c;
    });
  }
  const share = cs.map((_, j) => assign.filter((a) => a === j).length / px.length);
  return cs.map((c, j) => ({ hex: hex(c), share: +share[j].toFixed(3) })).sort((a, b) => b.share - a.share);
}

/* the stamp's crop point per photograph: the part of it the stamp shows (spec v3 §2.1) */
const CROPS = { 'park-through-lens': '60% 46%', 'metro-platform': '76% 52%', 'cat-sunset-silhouette': '36% 72%' };
const ART = path.join(ROOT, 'src/one/rest/art');
const lumOf = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)).reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);

const meta = {};
for (const stem of stems.sort()) {
  const file = path.join(SRC, `${stem}.jpg`);
  const { data } = await sharp(file).rotate().resize(64, 64, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);
  const palette = kmeans(px);
  const deep = palette.reduce((a, b) => (lumOf(b.hex) < lumOf(a.hex) ? b : a)).hex;
  meta[stem] = { palette, deep, crop: CROPS[stem] ?? '50% 50%', ...(fs.existsSync(path.join(ART, `pc-${stem}.svg`)) ? { drawing: stem } : {}) };
  console.log(stem.padEnd(24), palette.map((p) => p.hex).join(' '));
}
fs.writeFileSync(path.join(OUT, 'postcards-meta.json'), JSON.stringify(meta) + '\n');
