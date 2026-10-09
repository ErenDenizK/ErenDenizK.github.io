/* Unwritten text never reaches the site (owner, 2026-10-09): placeholders stay in content/ and are
   left out of every built page. Scans the whole build, not a rendered page, so nothing hides behind JS. */
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const MARKERS = [/class="[^"]*\bph\b/, /\bis-ph\b/, /owner to write/i, /to come\b/i, /to confirm\b/i, /no URL yet/i, /nothing yet/i, /placeholder/i];

function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'media' || e.name === 'og' || e.name === '_astro' ? [] : pages(p);
    return /\.(html|xml|webmanifest)$/.test(e.name) ? [p] : [];
  });
}

test('the build contains no placeholder markers', () => {
  const found: string[] = [];
  for (const f of pages('dist')) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of MARKERS) { const hit = m.exec(text); if (hit) found.push(`${path.relative('dist', f)}: ${hit[0]}`); }
  }
  expect(found).toEqual([]);
});
