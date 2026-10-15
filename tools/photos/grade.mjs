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

let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

fs.mkdirSync(OUT, { recursive: true });

// The gate selfie, square, for the ID card on About (ADR-0008): face and thumb both inside the frame.
{
  const base = sharp(path.join(SRC, 'eren-ytu-gate.jpg')).extract({ left: 680, top: 290, width: 1150, height: 1150 })
    .modulate({ brightness: 0.95, saturation: 0.9 });
  const buf = await base.png().toBuffer();
  for (const w of [360, 640, 960]) {
    await sharp(buf).resize(w).avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `gate-card-${w}.avif`));
    await sharp(buf).resize(w).webp({ quality: 74, smartSubsample: true }).toFile(path.join(OUT, `gate-card-${w}.webp`));
  }
}

// Static page grain: a 128 px tile, light noise at low alpha (about +-2 levels on the ground).
{
  const n = 128, gb = Buffer.alloc(n * n * 4);
  for (let i = 0; i < n * n; i++) { const v = Math.round(rnd() * 90); gb[i * 4] = gb[i * 4 + 1] = gb[i * 4 + 2] = v; gb[i * 4 + 3] = 12; }
  await sharp(gb, { raw: { width: n, height: n, channels: 4 } }).png({ palette: true, colours: 16, compressionLevel: 9 }).toFile(path.join(OUT, 'grain.png'));   // 5 KB
}

for (const f of fs.readdirSync(OUT).sort()) console.log(f.padEnd(24), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1), 'KB');
