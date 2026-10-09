// Renders each object's GLB through rig.js beside its Cycles poster and saves
// prototypes/e-dark/objects/compare-<name>.png (ADR-0005 §3: reviewed side by side).
//
//   THREE_DIR=<path to the three@0.170.0 package> node tools/objects/compare.mjs recto edk ...
//
// Needs Playwright with Chromium (PLAYWRIGHT=<path to the playwright package>); WebGL runs on
// SwiftShader when there is no GPU. OUT_DIR / OBJ_DIR override where files are read and written.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const threeDir = process.env.THREE_DIR;
if (!threeDir) throw new Error('set THREE_DIR to the three@0.170.0 package directory');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const objDir = process.env.OBJ_DIR || '/prototypes/e-dark/objects';
const outDir = process.env.OUT_DIR || path.join(repo, 'prototypes/e-dark/objects');

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = url.startsWith('/npm/three@0.170.0/')
    ? path.join(threeDir, url.slice('/npm/three@0.170.0/'.length))
    : url.startsWith('/ext/') ? path.join(process.env.EXT_DIR || '/nonexistent', url.slice(5))
    : path.join(repo, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
for (const name of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 628 }, deviceScaleFactor: 1 });
  page.on('console', (m) => m.type() === 'error' && console.log(name, 'console', m.text()));
  page.on('pageerror', (e) => console.log(name, 'pageerror', e.message));
  await page.goto(`http://localhost:${port}/tools/objects/compare.html?name=${name}&dir=${objDir}`);
  await page.waitForFunction('window.__ready', null, { timeout: 180000 });
  const err = await page.evaluate(() => window.__err);
  if (err) { console.log(name, 'failed:', err); await page.close(); continue; }
  const out = path.join(outDir, `compare-${name}.png`);
  await page.screenshot({ path: out });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
server.close();
