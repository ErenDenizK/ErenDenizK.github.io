/* Files the site serves straight from the repo, without copying them into public/:
   - media/objects/<name>/**   the pre-rendered objects (ADR-0006), written by tools/objects
   - content/projects/<slug>/captures/*.mp4   each product's signature clip (family-kit
                                presentation.md §3), published as media/captures/<slug>/<file>; its
                                screens and poster are PNG masters the build turns into AVIF and WebP
   - tools/og/out/<id>.jpg      link-preview cards, published under a content-hashed name so
                                platform caches always see a new URL (link-preview research §1.5)
   - tools/og/out/icons/*       favicon and home-screen icons
   One list, used by the pages (to write URLs) and by the integration (to copy or serve them). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = process.cwd();
export const MEDIA_DIR = path.join(ROOT, 'media/objects');
export const PROJECTS_DIR = path.join(ROOT, 'content/projects');
export const OG_DIR = path.join(ROOT, 'tools/og/out');

/** Icon choice (owner, 2026-10-09): "e" at 16 and 32 px, "edk" from 48 px and on home screens,
    warm off-white on black. To swap, change these two names (tools/og/out/icons/<variant>-*). */
export const ICONS = { small: 'letter', large: 'wordmark' };

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8);

/** Published path (no base) of a link-preview card, e.g. "og/recto.3fa2c1d0.jpg". */
export function ogPath(id) {
  const file = path.join(OG_DIR, id + '.jpg');
  if (!fs.existsSync(file)) return null;
  return `og/${id}.${hash(file)}.jpg`;
}

/** Cards the pages use: home, about and each project's `og` (variants and samples stay in tools/og). */
function usedCards() {
  const ids = new Set(['home', 'about']);
  const dir = path.join(ROOT, 'content/projects');
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(f)) continue;                     // a project's folder holds its world.json
    const m = /^og:\s*([\w-]+)/m.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (m) ids.add(m[1]);
  }
  return ids;
}

/** Every file to publish: [published path, source path]. */
export function publishedFiles() {
  const out = [];
  if (fs.existsSync(MEDIA_DIR)) {
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(avif|webp|png|jpg|mp4|json)$/.test(e.name)) out.push(['media/objects/' + path.relative(MEDIA_DIR, p).split(path.sep).join('/'), p]);
      }
    };
    walk(MEDIA_DIR);
  }
  if (fs.existsSync(PROJECTS_DIR)) for (const slug of fs.readdirSync(PROJECTS_DIR)) {
    const dir = path.join(PROJECTS_DIR, slug, 'captures');
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.mp4')) out.push([`media/captures/${slug}/${f}`, path.join(dir, f)]);
  }
  for (const id of usedCards()) {
    const p = ogPath(id);
    if (p) out.push([p, path.join(OG_DIR, id + '.jpg')]);
  }
  const I = path.join(OG_DIR, 'icons');
  const icon = (variant, name) => path.join(I, `${variant}-${name}`);
  for (const [pub, src] of [
    ['favicon-16.png', icon(ICONS.small, 'favicon-16.png')],
    ['favicon-32.png', icon(ICONS.small, 'favicon-32.png')],
    ['favicon-48.png', icon(ICONS.large, 'favicon-48.png')],
    ['apple-touch-icon.png', icon(ICONS.large, 'apple-touch-icon-180.png')],
    ['icon-192.png', icon(ICONS.large, 'icon-192.png')],
    ['icon-512.png', icon(ICONS.large, 'icon-512.png')],
    ['icon-maskable-512.png', icon(ICONS.large, 'maskable-512.png')],
  ]) if (fs.existsSync(src)) out.push([pub, src]);
  return out;
}

/** favicon.ico: the 16 and 32 px "e" and the 48 px "edk", PNG payloads (link-preview research §2). */
export function faviconIco() {
  const I = path.join(OG_DIR, 'icons');
  const imgs = [[16, ICONS.small], [32, ICONS.small], [48, ICONS.large]]
    .map(([s, v]) => [s, path.join(I, `${v}-favicon-${s}.png`)])
    .filter(([, f]) => fs.existsSync(f))
    .map(([s, f]) => [s, fs.readFileSync(f)]);
  if (!imgs.length) return null;
  const head = Buffer.alloc(6 + 16 * imgs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let offset = head.length;
  imgs.forEach(([s, buf], i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(s, o); head.writeUInt8(s, o + 1); head.writeUInt8(0, o + 2); head.writeUInt8(0, o + 3);
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8); head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...imgs.map(([, b]) => b)]);
}

/** The object's manifest (tools/objects/README.md, "The manifest"), or null while it is not rendered. */
export function readManifest(name) {
  const f = path.join(MEDIA_DIR, name, 'manifest.json');
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}
