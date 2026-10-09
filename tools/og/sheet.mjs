// Contact sheets for the rendered cards: each card at full size, at chat size, as crops and
// in a generic feed-post frame. Run after build.mjs.
//
//   node tools/og/sheet.mjs [--fonts <dir>] [--docs]
//
// out/sheets/<id>.jpg   one sheet per card (all sizes)
// out/sheets/overview-{grid,chat,posts,icons}.webp   overviews, each under 300 KB
// --variants includes cards marked "variant" (e.g. home-centered)
// --docs copies chat, posts and icons to docs/research/assets/2026-10-og-*.webp
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontCss } from './fonts.mjs';
import { serve } from './serve.mjs';
import { encode } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const out = path.join(here, 'out');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const fontsDir = path.resolve(arg('--fonts', here));
const require = createRequire(path.join(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules', '/'));
const { chromium } = require('playwright');

const data = JSON.parse(fs.readFileSync(path.join(here, 'cards.json'), 'utf8'));
const { server, origin } = await serve(repo, fontsDir);
const dir = path.join(out, 'sheets');
fs.mkdirSync(dir, { recursive: true });

const cards = data.cards.filter((c) => !c.variant || process.argv.includes('--variants')).filter((c) => fs.existsSync(path.join(out, `${c.id}.jpg`))).map((c) => ({
  id: c.id,
  src: `${origin}/tools/og/out/${c.id}.jpg`,
  bytes: `${Math.round(fs.statSync(path.join(out, `${c.id}.jpg`)).size / 1024)} KB jpg`,
  ogTitle: c.og.title, ogDescription: c.og.description, postText: c.sample.postText, host: data.site.host,
}));
const avatar = null; // neutral grey circle in the post frame

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(`${origin}/tools/og/sheet.html`);
  await page.addStyleTag({ content: fontCss(fontsDir, origin + '/__fonts') });

  const shoot = async (view, payload, file, type) => {
    const { w, h } = await page.evaluate(([v, p, o]) => window.sheet(v, p, o), [view, payload, { avatar }]);
    await page.setViewportSize({ width: w, height: Math.min(h, 16000) });
    await page.waitForTimeout(80);
    const png = await page.screenshot({ type: 'png', fullPage: true });
    if (type === 'jpg') {
      fs.writeFileSync(file, await page.screenshot({ type: 'jpeg', quality: 86, fullPage: true }));
    } else {
      const enc = await browser.newPage();
      const r = await encode(enc, png, 'image/webp', 0.86, 300 * 1024);
      await enc.close();
      fs.writeFileSync(file, Buffer.from(r.b64, 'base64'));
    }
    console.log(path.relative(repo, file), `${w}×${h}`, `${Math.round(fs.statSync(file).size / 1024)} KB`);
  };

  for (const c of cards) await shoot('card', c, path.join(dir, `${c.id}.jpg`), 'jpg');
  const iconList = ['wordmark', 'letter', 'inverse', 'blue'].filter((n) => fs.existsSync(path.join(out, 'icons', `${n}-favicon-16.png`)))
    .map((name) => ({ name, base: `${origin}/tools/og/out/icons` }));
  if (iconList.length) await shoot('icons', iconList, path.join(dir, 'overview-icons.webp'), 'webp');
  await shoot('grid', cards, path.join(dir, 'overview-grid.webp'), 'webp');
  await shoot('chat', cards, path.join(dir, 'overview-chat.webp'), 'webp');
  await shoot('posts', cards.filter((c) => ['home', 'recto', 'about'].includes(c.id)), path.join(dir, 'overview-posts.webp'), 'webp');

  if (process.argv.includes('--docs')) {
    for (const n of ['chat', 'posts', 'icons']) {
      fs.copyFileSync(path.join(dir, `overview-${n}.webp`), path.join(repo, 'docs/research/assets', `2026-10-og-${n}.webp`));
    }
    console.log('copied overviews to docs/research/assets/');
  }
} finally {
  await browser.close();
  server.close();
}
