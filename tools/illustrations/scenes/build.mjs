// Draws the project scenes into src/one/work/art/ and checks each against its size budget (engraving
// guide §1.10: desktop master 140 KB raw and 45 KB gzip, phone master 70 KB raw).
//   node tools/illustrations/scenes/build.mjs [name ...]
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../../src/one/work/art');
const scenes = {
  'eat-map': ['./eat-map.mjs', 'eatMapDesktop', 140, 45],
  'eat-map-phone': ['./eat-map.mjs', 'eatMapPhone', 70, 24],
  recto: ['./recto.mjs', 'rectoDesktop', 140, 45],
  'recto-phone': ['./recto.mjs', 'rectoPhone', 70, 24],
};
const want = process.argv.slice(2);
let bad = 0;
for (const [name, [file, fn, raw, gz]] of Object.entries(scenes)) {
  if (want.length && !want.includes(name)) continue;
  const mod = await import(file);
  if (!mod[fn]) continue;
  const svg = mod[fn]().svg();
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
  const kb = Buffer.byteLength(svg) / 1024, kz = zlib.gzipSync(svg).length / 1024;
  const ok = kb <= raw && kz <= gz;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'OVER'} ${name}.svg ${kb.toFixed(1)} KB raw (budget ${raw}), ${kz.toFixed(1)} KB gzip (budget ${gz})`);
}
process.exitCode = bad ? 1 : 0;
