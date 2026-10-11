// Writes the postcard photographs About shows (ADR-0008; brief, About, 2026-10-10 evening: "more photos, in
// the postcard style"). The photos are named in content/site.json (`about.chapters[].photos[].photo`, the
// file stem in content/photos/), so placing another one is a content change and a rerun of this script.
// Each is resized from the full-resolution original, never graded and never upscaled: a width larger than
// the original is skipped (brief, Photos, 2026-10-10: "never stretch a low-resolution derivative"). sharp
// drops EXIF, GPS and ICC metadata unless asked to keep it, so the files carry none.
// Widths: a postcard is at most about 420 CSS px wide on desktop and 358 px on a 390 px phone, so 1080 px
// covers a 3x phone and a 2x desktop pair; 480 and 760 serve 1x and 2x side columns.
// Tone: each photo's own light colour for the pile on About (docs/research/2026-10-about-and-postcards.md
// row 10: the light around a picture is sampled from it). The mean of the photo's more saturated pixels,
// lifted to a fixed lightness so every tone glows alike on the black page; stored as `tone` (hex).
// Output: src/assets/photos/pc-<stem>-<w>.{avif,webp} and src/assets/photos/postcards.json (committed).
// Run: node tools/photos/postcards.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const require = createRequire(path.join(ROOT, 'package.json'));
const sharp = require('sharp');
const SRC = path.join(ROOT, 'content/photos');
const OUT = path.join(ROOT, 'src/assets/photos');
const WIDTHS = [480, 760, 1080];

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const stems = [...new Set((site.about.chapters ?? []).flatMap((c) => (c.photos ?? []).map((p) => p.photo)))];

// files from an earlier run that no chapter names any more
for (const f of fs.readdirSync(OUT)) {
  const m = /^pc-(.+)-\d+\.(avif|webp)$/.exec(f);
  if (m && !stems.includes(m[1])) fs.rmSync(path.join(OUT, f));
}

/** The photo's light: the mean colour of its most saturated half, at HSL lightness 0.62, saturation >= 0.5. */
async function tone(file) {
  const { data } = await sharp(file).rotate().resize(48, 48, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    px.push({ r, g, b, s: Math.max(r, g, b) - Math.min(r, g, b) });
  }
  px.sort((a, b) => b.s - a.s);
  const top = px.slice(0, px.length >> 1);
  const m = (k) => top.reduce((n, p) => n + p[k], 0) / top.length / 255;
  const [r, g, b] = [m('r'), m('g'), m('b')];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const s = Math.max(0.5, Math.min(0.85, d / (1 - Math.abs(mx + mn - 1) || 1))), l = 0.62;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), o = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [R, G, B].map((v) => Math.round((v + o) * 255).toString(16).padStart(2, '0')).join('');
}

const manifest = {};
for (const stem of stems.sort()) {
  const file = path.join(SRC, `${stem}.jpg`);
  if (!fs.existsSync(file)) throw new Error(`content/photos/${stem}.jpg not found (named in content/site.json)`);
  const img = sharp(file).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  for (const w of widths) {
    const r = sharp(file).rotate().resize(w);
    await r.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `pc-${stem}-${w}.avif`));
    await r.clone().webp({ quality: 76, effort: 6, smartSubsample: true }).toFile(path.join(OUT, `pc-${stem}-${w}.webp`));
  }
  manifest[stem] = { width, height, widths, tone: await tone(file) };
  console.log(stem.padEnd(24), `${width}x${height}`, widths.join(' '), manifest[stem].tone);
}
fs.writeFileSync(path.join(OUT, 'postcards.json'), JSON.stringify(manifest, null, 2) + '\n');
