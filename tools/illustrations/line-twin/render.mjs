// Renders a line twin's SVG master (line-twin.py) into the bitmaps the page loads: white lines on a
// transparent ground, as alpha WebP, at the widths given. The page sets the ink colour and the
// opacity in CSS (a mask), so one file serves every ink. potrace already dropped the speckles.
// node tools/illustrations/line-twin/render.mjs <master.svg> <out-stem> <width>[,<width>...] [quality]
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const sharp = require('sharp');
const [svgFile, stem, widths = '1440,900', q = '70'] = process.argv.slice(2);
if (!svgFile || !stem) { console.error('usage: render.mjs <master.svg> <out-stem> <w,w> [quality]'); process.exit(1); }
const svg = fs.readFileSync(svgFile, 'utf8').replace(/fill="#000000"/g, 'fill="#ffffff"');
for (const w of widths.split(',').map(Number)) {
  const out = `${stem}-${w}.webp`;
  /* render white on transparent; the luminance becomes the alpha, so anti-aliased edges stay soft */
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 }).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    px[j] = px[j + 1] = px[j + 2] = 255;
    px[j + 3] = data[i + 3];
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: +q, alphaQuality: +q, effort: 6 }).toFile(out);
  console.log(out, info.width + 'x' + info.height, (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
}
