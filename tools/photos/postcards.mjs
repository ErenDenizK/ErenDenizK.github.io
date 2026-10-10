// Writes the postcard photographs About shows (ADR-0008; brief, About, 2026-10-10 evening: "more photos, in
// the postcard style"). The photos are named in content/site.json (`about.chapters[].photos[].photo`, the
// file stem in content/photos/), so placing another one is a content change and a rerun of this script.
// Each is resized from the full-resolution original, never graded and never upscaled: a width larger than
// the original is skipped (brief, Photos, 2026-10-10: "never stretch a low-resolution derivative"). sharp
// drops EXIF, GPS and ICC metadata unless asked to keep it, so the files carry none.
// Widths: a postcard is at most about 420 CSS px wide on desktop and 358 px on a 390 px phone, so 1080 px
// covers a 3x phone and a 2x desktop pair; 480 and 760 serve 1x and 2x side columns.
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
  manifest[stem] = { width, height, widths };
  console.log(stem.padEnd(24), `${width}x${height}`, widths.join(' '));
}
fs.writeFileSync(path.join(OUT, 'postcards.json'), JSON.stringify(manifest, null, 2) + '\n');
