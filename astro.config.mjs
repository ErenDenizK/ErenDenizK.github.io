// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import siteAssets from './src/integrations/site-assets.mjs';

// Base path (ADR-0001 item 7). The site lives at https://erendenizk.github.io/ once the repo is
// renamed ErenDenizK.github.io; until then GitHub Pages serves it under /<repo>/. BASE_PATH wins;
// otherwise the repo name in GITHUB_REPOSITORY decides; locally the base is "/".
function basePath() {
  if (process.env.BASE_PATH) return process.env.BASE_PATH;
  const repo = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';
  if (!repo || repo.toLowerCase().endsWith('.github.io')) return '/';
  return '/' + repo;
}
const base = basePath().replace(/\/?$/, '/');

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
    sitemap({ filter: (page) => !/\/404\/?$/.test(page) }),
    siteAssets(),
  ],
});
