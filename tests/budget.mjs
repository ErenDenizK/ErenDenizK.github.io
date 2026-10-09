// First-paint budget (ADR-0006; media research §7: HTML, CSS, fonts and the first still <= 200 KB).
// For every page in the build: the HTML (gzip, as GitHub Pages serves it; CSS is inlined), the
// preloaded fonts, the page script (gzip), the CSS background images, and the high-priority image
// (the AVIF a 2x desktop picks for its ~470 px slot). Moving media loads later and is not counted.
// The About photo has its own bucket (media research §7: <= 180 KB at its largest width); it is the
// image marked data-budget="photo".
// node tests/budget.mjs [dist]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.resolve(process.argv[2] || 'dist');
const LIMIT = 200 * 1024, PHOTO = 180 * 1024;
const base = (() => { const h = fs.readFileSync(path.join(dist, 'index.html'), 'utf8'); return (/data-base="([^"]*)"/.exec(h) || [, '/'])[1]; })();
const local = (u) => { const p = u.split(/[?#]/)[0]; return p.startsWith(base) ? path.join(dist, p.slice(base.length)) : null; };
const size = (f) => (f && fs.existsSync(f) ? fs.statSync(f).size : 0);
const gz = (f) => (f && fs.existsSync(f) ? zlib.gzipSync(fs.readFileSync(f)).length : 0);
const kb = (n) => (n / 1024).toFixed(1).padStart(6) + ' KB';

const pages = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'media' && e.name !== 'og') walk(p); } else if (e.name.endsWith('.html')) pages.push(p); } })(dist);

let fail = false;
console.log('page'.padEnd(34), 'html'.padStart(9), 'fonts'.padStart(9), 'js'.padStart(9), 'images'.padStart(9), 'total'.padStart(9));
for (const f of pages.sort()) {
  const html = fs.readFileSync(f, 'utf8');
  const fonts = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)].reduce((n, m) => n + size(local(m[1])), 0);
  const js = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].reduce((n, m) => n + gz(local(m[1])), 0);
  let images = [...new Set([...html.matchAll(/url\(["']?([^)"']+)["']?\)/g)].map((m) => m[1]))].filter((u) => !u.endsWith('.woff2')).reduce((n, u) => n + size(local(u)), 0);
  const photo = /<picture>(?:(?!<\/picture>)[\s\S])*?data-budget="photo"[\s\S]*?<\/picture>/.exec(html);
  let photoBytes = 0;
  if (photo) {
    photoBytes = Math.max(...[...photo[0].matchAll(/<source type="image\/avif" srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((x) => size(local(x.trim().split(/\s+/)[0])))));
    if (photoBytes > PHOTO) fail = true;
  }
  const hi = /<picture>((?:(?!<\/picture>)[\s\S])*?fetchpriority="high"[\s\S]*?)<\/picture>/.exec(html);
  if (hi && !hi[1].includes('data-budget="photo"')) {
    const avif = /<source type="image\/avif" srcset="([^"]+)"/.exec(hi[1]);
    const cands = (avif ? avif[1] : (/src="([^"]+)"/.exec(hi[1]) || [, ''])[1] + ' 1200w').split(',').map((s) => s.trim().split(/\s+/)).map(([u, w]) => [u, parseInt(w) || 1200]);
    const pick = cands.sort((a, b) => a[1] - b[1]).find(([, w]) => w >= 940) || cands[cands.length - 1];
    images += size(local(pick[0]));
  }
  const total = gz(f) + fonts + js + images;
  const name = path.relative(dist, f);
  if (total > LIMIT) fail = true;
  console.log(name.padEnd(34), kb(gz(f)), kb(fonts), kb(js), kb(images), kb(total), total > LIMIT ? '  OVER' : '', photo ? ` + photo ${kb(photoBytes)}${photoBytes > PHOTO ? ' OVER' : ''}` : '');
}
console.log(`limits: ${kb(LIMIT)} per page at first paint; the About photo ${kb(PHOTO)} at its largest AVIF`);
process.exit(fail ? 1 : 0);
