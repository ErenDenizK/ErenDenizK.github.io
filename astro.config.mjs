// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import siteAssets from './src/integrations/site-assets.mjs';
import fs from 'node:fs';
import path from 'node:path';

// Base path (ADR-0001 item 7). The repo is ErenDenizK.github.io, so the live site is at
// https://erendenizk.github.io/ (base "/"); any other repo name is served under /<repo>/. BASE_PATH wins;
// otherwise the repo name in GITHUB_REPOSITORY decides; locally the base is "/".
function basePath() {
  if (process.env.BASE_PATH) return process.env.BASE_PATH;
  const repo = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';
  if (!repo || repo.toLowerCase().endsWith('.github.io')) return '/';
  return '/' + repo;
}
const base = basePath().replace(/\/?$/, '/');

// Sample record entries (`sample: true`) test the design and are not record: kept out of the sitemap, as
// out of the feed. Their pages end in /record/<year>/<file name>/ (src/lib/site.ts entryPath).
function sampleSlugs(dir = process.env.LOG_DIR || './content/log') {
  const out = new Set();
  /** @param {string} d */
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/^[^_].*\.mdx?$/.test(e.name)) {
        const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(p, 'utf8'))?.[1] ?? '';
        if (/^sample:\s*true\s*$/m.test(front)) out.add(e.name.replace(/\.mdx?$/, ''));
      }
    }
  };
  walk(dir);
  return out;
}
const samples = sampleSlugs();
/** @param {string} page */
const isSample = (page) => { const m = /\/record\/\d{4}\/([^/]+)\/?$/.exec(page); return !!m && samples.has(m[1]); };

export default defineConfig({
  site: process.env.SITE_URL || 'https://erendenizk.github.io',
  base,
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR || './dist',
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: false,
  devToolbar: { enabled: false },
  integrations: [
    mdx(),
    /* /lab/ holds hidden component workbenches (ADR-0008): never in the sitemap; nor are samples */
    sitemap({ filter: (page) => !/\/404\/?$/.test(page) && !/\/lab\//.test(page) && !isSample(page) }),
    siteAssets(),
  ],
});
