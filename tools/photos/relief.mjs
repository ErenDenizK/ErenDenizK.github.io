// The ID card's photograph in depth (spec v3 §3.2, review row T3): three cut layers that move with the
// card's lean, so the photo stops reading flat. Layers, from the back:
//   gate-card-bg-<w>      the background, with the person's and the hand's area filled from its own edges
//   gate-card-person-<w>  head, hair, hood, shoulders and straps, with alpha
//   gate-card-near-<w>    the thumbs-up hand and its forearm, with alpha
// The cut lines are data (content/photos/masks/gate-card.json, drawn once over the photograph), smoothed
// here (Catmull-Rom) and feathered 1.5 px. The fill behind the cut-outs is a normalised blur of the
// background around them (each pixel takes the average of the known pixels near it, at growing radii),
// so only colour and light continue into the hole; the layers move by at most about 7 px, so only a thin
// rim of the fill is ever seen. The grade is the live card's (tools/photos/live.mjs), applied to the same
// crop, so the layers match the flat photo exactly. Run: node tools/photos/relief.mjs [--preview <png>]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const OUT = path.join(ROOT, 'src/assets/photos');
const masks = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/photos/masks/gate-card.json'), 'utf8'));
const S = masks.size;

/* the live card's grade (live.mjs), on the same crop */
const graded = await sharp(path.join(ROOT, 'content/photos/eren-ytu-gate.jpg')).extract({ left: 680, top: 290, width: 1150, height: 1150 })
  .modulate({ brightness: 0.95 * 1.06, saturation: 0.9 * 1.16 })
  .linear(1.07, -128 * 0.07)
  .recomb([[1.03, 0, 0], [0, 1, 0], [0, 0, 0.97]])
  .resize(S).removeAlpha().raw().toBuffer();

/** a closed Catmull-Rom path through the points */
function smooth(pts) {
  const n = pts.length, f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
/** a polygon as a one-channel mask (0..255), feathered */
async function mask(pts, feather = 1.5) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" fill="#000"/><path d="${smooth(pts)}" fill="#fff"/></svg>`;
  return sharp(Buffer.from(svg)).blur(feather).extractChannel(0).raw().toBuffer();
}
const person = await mask(masks.person);
const near = await mask(masks.near);

/* known background: neither the person nor the hand (grown by 3 px, so no edge colour leaks into the fill) */
const N = S * S;
const known = new Float32Array(N);
for (let i = 0; i < N; i++) known[i] = Math.max(0, 1 - Math.max(person[i], near[i]) / 255 * 1.4) ** 2;
const blurF = async (data, ch, sigma) => {
  const buf = Buffer.alloc(N * ch);
  for (let i = 0; i < N * ch; i++) buf[i] = Math.max(0, Math.min(255, Math.round(data[i])));
  const img = sharp(buf, { raw: { width: S, height: S, channels: ch } }).blur(sigma);
  /* sharp writes a one-channel raw image back as three channels unless told otherwise */
  return (ch === 1 ? img.extractChannel(0) : img).raw().toBuffer();
};
/* normalised convolution at growing radii: the smallest radius that has enough known pixels wins */
async function fillFrom(known) {
  const fill = new Float32Array(N * 3);
  const done = new Uint8Array(N);
  for (const [sigma, min] of [[6, 24], [16, 16], [40, 8], [100, 2], [220, 0.5]]) {
    const w = new Float32Array(N), c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { w[i] = known[i] * 255; for (let k = 0; k < 3; k++) c[i * 3 + k] = graded[i * 3 + k] * known[i]; }
    const bw = await blurF(w, 1, sigma), bc = await blurF(c, 3, sigma);
    for (let i = 0; i < N; i++) {
      if (done[i] || bw[i] < min) continue;
      for (let k = 0; k < 3; k++) fill[i * 3 + k] = Math.min(255, (bc[i * 3 + k] * 255) / bw[i]);
      done[i] = 1;
    }
  }
  return fill;
}
const fill = await fillFrom(known);
/* behind the hand: whatever is next to it, background or jacket, so the rim the hand uncovers as it
   moves has the colour of its own side (a grey fill along the jacket read as a cut-out) */
const knownHand = new Float32Array(N);
const nearWide = await sharp(Buffer.from(near), { raw: { width: S, height: S, channels: 1 } }).blur(3).extractChannel(0).raw().toBuffer();
for (let i = 0; i < N; i++) knownHand[i] = Math.max(0, 1 - Math.max(near[i], nearWide[i] * 2.5) / 255) ** 2;
const fillHand = await fillFrom(knownHand);
const bg = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) bg[i * 3 + k] = Math.round(graded[i * 3 + k] * known[i] + fill[i * 3 + k] * (1 - known[i]));
/* a soft blur over the filled area only, so the fill has no blotches */
const bgSoft = await sharp(bg, { raw: { width: S, height: S, channels: 3 } }).blur(8).raw().toBuffer();
for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) bg[i * 3 + k] = Math.round(bg[i * 3 + k] * known[i] + bgSoft[i * 3 + k] * (1 - known[i]));

const rgba = (alpha) => { const b = Buffer.alloc(N * 4); for (let i = 0; i < N; i++) { b[i * 4] = graded[i * 3]; b[i * 4 + 1] = graded[i * 3 + 1]; b[i * 4 + 2] = graded[i * 3 + 2]; b[i * 4 + 3] = alpha(i); } return b; };
/* the person, with the hand's place filled from around it: what the hand uncovers as it moves */
const personBuf = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const h = 1 - knownHand[i];
  for (let k = 0; k < 3; k++) personBuf[i * 4 + k] = Math.round(graded[i * 3 + k] * (1 - h) + fillHand[i * 3 + k] * h);
  personBuf[i * 4 + 3] = Math.max(person[i], near[i]);
}
const nearBuf = rgba((i) => near[i]);

const pi = process.argv.indexOf('--preview');
if (pi > 0) {
  /* the cut lines over the photograph, the fill alone, side by side */
  const over = Buffer.alloc(N * 3);
  for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) over[i * 3 + k] = Math.round(graded[i * 3 + k] * 0.55 + (k === 0 ? person[i] : k === 2 ? near[i] : 0) * 0.45);
  const a = await sharp(over, { raw: { width: S, height: S, channels: 3 } }).png().toBuffer();
  const b = await sharp(bg, { raw: { width: S, height: S, channels: 3 } }).png().toBuffer();
  await sharp({ create: { width: S * 2, height: S, channels: 3, background: '#000' } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: S, top: 0 }]).png().toFile(process.argv[pi + 1]);
  console.log('preview', process.argv[pi + 1]);
} else {
  let total = 0;
  for (const w of [640, 960]) {
    for (const [name, buf, ch] of [['bg', bg, 3], ['person', personBuf, 4], ['near', nearBuf, 4]]) {
      const img = () => sharp(buf, { raw: { width: S, height: S, channels: ch } }).resize(w);
      const fa = path.join(OUT, `gate-card-${name}-${w}.avif`), fw = path.join(OUT, `gate-card-${name}-${w}.webp`);
      await img().avif({ quality: name === 'bg' ? 44 : 52, effort: 6 }).toFile(fa);
      await img().webp({ quality: name === 'bg' ? 66 : 74, smartSubsample: true, alphaQuality: 80 }).toFile(fw);
      const kb = fs.statSync(fa).size / 1024;
      if (w === 640) total += kb;
      console.log(`gate-card-${name}-${w}`.padEnd(24), `avif ${kb.toFixed(1)} KB`, `webp ${(fs.statSync(fw).size / 1024).toFixed(1)} KB`);
    }
  }
  console.log(`three layers at 640 px: ${total.toFixed(1)} KB avif (budget 70 KB)`);
}
