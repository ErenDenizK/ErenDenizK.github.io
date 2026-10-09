// Renders the link-preview cards and the icon candidates from cards.json.
//
//   node tools/og/build.mjs [--fonts <dir>] [--only <id,id>] [--no-icons] [--png]
//
// --fonts names a directory whose node_modules holds @fontsource-variable/newsreader and
// @fontsource-variable/inter (default: tools/og). Playwright is resolved from
// PLAYWRIGHT_PATH or /opt/node-tools/node_modules. Nothing here ships with the site.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontCss as fontCssFrom } from './fonts.mjs';
import { serve } from './serve.mjs';
import { encode as encodeWith } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const out = path.join(here, 'out');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const fontsDir = path.resolve(arg('--fonts', here));
const only = arg('--only', '') ? arg('--only').split(',') : null;
const require = createRequire(path.join(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules', '/'));
const { chromium } = require('playwright');

const MAX_BYTES = 200 * 1024;
const encode = (page, png, type, q) => encodeWith(page, png, type, q, MAX_BYTES);
const { server, origin } = await serve(repo, fontsDir);
const fontCss = () => fontCssFrom(fontsDir, origin + '/__fonts');
const data = JSON.parse(fs.readFileSync(path.join(here, 'cards.json'), 'utf8'));

async function cards(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(origin + '/tools/og/card.html');
  await page.addStyleTag({ content: fontCss() });
  const enc = await browser.newPage();
  const rows = [];
  for (const c of data.cards) {
    if (only && !only.includes(c.id)) continue;
    await page.evaluate(([c, site, root]) => window.render(c, site, root), [c, data.site, origin + '/']);
    await page.waitForTimeout(60);
    const png = await page.screenshot({ type: 'png' });
    if (process.argv.includes('--png')) fs.writeFileSync(path.join(out, `${c.id}.png`), png);
    const jpg = await encode(enc, png, 'image/jpeg', 0.9);
    const webp = await encode(enc, png, 'image/webp', 0.9);
    const jb = Buffer.from(jpg.b64, 'base64'), wb = Buffer.from(webp.b64, 'base64');
    fs.writeFileSync(path.join(out, `${c.id}.jpg`), jb);
    fs.writeFileSync(path.join(out, `${c.id}.webp`), wb);
    rows.push({ id: c.id, jpg: `${(jb.length / 1024).toFixed(0)} KB q${jpg.q}`, webp: `${(wb.length / 1024).toFixed(0)} KB q${webp.q}` });
  }
  console.table(rows);
  if (errors.length) console.error('page errors:\n' + errors.join('\n'));
  await page.close(); await enc.close();
}

// ICO with PNG payloads (supported by every browser that reads ICO since Vista-era IE).
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e); head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
}

async function icons(browser) {
  const dir = path.join(out, 'icons');
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.goto(origin + '/tools/og/icon.html');
  await page.addStyleTag({ content: fontCss() });
  const variants = await page.evaluate(() => Object.keys(window.VARIANTS));
  // purpose: favicon tiles keep a rounded corner; touch and manifest icons are full-bleed
  // squares (iOS and Android apply their own mask); maskable keeps the mark in the 80% circle.
  const jobs = [
    ...[16, 32, 48].map((s) => ({ s, kind: 'favicon' })),
    { s: 180, kind: 'touch' }, { s: 192, kind: 'touch' }, { s: 512, kind: 'touch' },
    { s: 512, kind: 'maskable' },
  ];
  for (const v of variants) {
    const fav = [];
    for (const { s, kind } of jobs) {
      await page.setViewportSize({ width: s, height: s });
      await page.evaluate(([v, s, kind]) => window.draw(v, s, kind), [v, s, kind]);
      const buf = await page.screenshot({ type: 'png', omitBackground: true });
      const name = kind === 'favicon' ? `${v}-favicon-${s}.png` : kind === 'maskable' ? `${v}-maskable-${s}.png` : `${v}-${kind === 'touch' && s === 180 ? 'apple-touch-icon-180' : 'icon-' + s}.png`;
      fs.writeFileSync(path.join(dir, name), buf);
      if (kind === 'favicon') fav.push({ size: s, buf });
    }
    fs.writeFileSync(path.join(dir, `${v}-favicon.ico`), ico(fav.filter((f) => f.size <= 48)));
  }
  console.log(`icons: ${variants.join(', ')} -> ${path.relative(repo, dir)}`);
  await page.close();
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
try {
  await cards(browser);
  if (!process.argv.includes('--no-icons')) await icons(browser);
} finally {
  await browser.close();
  server.close();
}
