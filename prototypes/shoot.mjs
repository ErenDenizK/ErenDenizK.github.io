// Usage: node prototypes/shoot.mjs <dir>  → <dir>/shots/{desktop,tablet,phone}.png
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
const dir = path.resolve(process.argv[2]);
const sizes = { desktop: [1440, 900, false], tablet: [1180, 820, true], phone: [390, 844, true] };
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [name, [width, height, touch]] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: touch, isMobile: name === 'phone', deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(dir, 'index.html'));
  await page.waitForTimeout(2500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await page.screenshot({ path: path.join(dir, 'shots', name + '.png') });
  console.log(name, 'overflowX=' + overflow, errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors');
  await page.close();
}
await browser.close();
