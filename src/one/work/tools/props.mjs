#!/usr/bin/env node
/* Cuts Work's UI fragments ("props", phase3 design-spec.md 3.3.1) from each project's own captures.
   Reads src/one/work/stage.json and content/projects/<slug>/world.json; writes one PNG per prop to
   src/one/work/props/<slug>-<n>.png at the capture's own pixel density. The build turns the PNGs into
   AVIF and WebP. Run: node src/one/work/tools/props.mjs */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const stage = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/one/work/stage.json'), 'utf8'));
const out = path.join(ROOT, 'src/one/work/props');
fs.mkdirSync(out, { recursive: true });

for (const [slug, s] of Object.entries(stage)) {
  if (slug.startsWith('$') || !s.props) continue;
  const world = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/projects', slug, 'world.json'), 'utf8'));
  for (const [n, p] of s.props.entries()) {
    const c = world.captures.find((x) => x.id === p.capture);
    if (!c) throw new Error(`${slug}: no capture "${p.capture}" in world.json`);
    const png = c.files.find((f) => f.endsWith('.png') && f.includes(`${c.viewport[0]}x${c.viewport[1]}`)) ?? c.files.find((f) => f.endsWith('.png'));
    const [x, y, w, h] = p.crop.map((v) => Math.round(v * c.dpr));
    const r = Math.round((p.radius ?? 0) * c.dpr);
    const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
    const file = path.join(out, `${slug}-${n + 1}.png`);
    await sharp(path.join(ROOT, 'content/projects', slug, png))
      .extract({ left: x, top: y, width: w, height: h })
      .ensureAlpha()
      .composite([{ input: mask, blend: 'dest-in' }])
      .png({ compressionLevel: 9 })
      .toFile(file);
    console.log(path.relative(ROOT, file), `${w}x${h}`);
  }
}
