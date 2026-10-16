// Makes every plate in plates.json: the line twin (line-twin.py, run with an isolated interpreter), then
// its bitmaps (render.mjs) into src/assets/plates/<name>-<width>.webp. The SVG master stays in a
// temporary folder: it is reproducible from the photo and too heavy to ship (spec 7.4).
// node tools/illustrations/line-twin/make.mjs [name]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../../..');
const plates = JSON.parse(fs.readFileSync(path.join(here, 'plates.json'), 'utf8'));
const only = process.argv[2];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'line-twin-'));
fs.mkdirSync(path.join(root, 'src/assets/plates'), { recursive: true });
for (const [name, p] of Object.entries(plates)) {
  if (only && name !== only) continue;
  const stem = path.join(tmp, name);
  execFileSync('python3', ['-I', path.join(here, 'line-twin.py'), path.join(root, p.photo), stem,
    '--crop', p.crop.join(','), '--scale', String(p.scale), '--bands', p.bands, '--turd', String(p.turd)], { stdio: 'inherit' });
  execFileSync('node', [path.join(here, 'render.mjs'), stem + '.svg', path.join(root, 'src/assets/plates', name), p.widths.join(','), String(p.quality)], { stdio: 'inherit', cwd: root });
}
