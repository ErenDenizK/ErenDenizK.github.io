/* Publishes the repo files listed in src/lib/files.mjs: copied into dist/ after a build,
   served from the repo by the dev server. Nothing is duplicated into public/. */
import fs from 'node:fs';
import path from 'node:path';
import { publishedFiles, faviconIco } from '../lib/files.mjs';

const TYPES = { '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.json': 'application/json', '.ico': 'image/x-icon' };

export default function siteAssets() {
  let base = '/';
  return {
    name: 'site-assets',
    hooks: {
      'astro:config:done': ({ config }) => { base = config.base.replace(/\/?$/, '/'); },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent((req.url || '').split('?')[0]);
          if (!url.startsWith(base)) return next();
          const rel = url.slice(base.length);
          if (rel === 'favicon.ico') { const ico = faviconIco(); if (ico) { res.setHeader('content-type', TYPES['.ico']); return res.end(ico); } }
          const hit = publishedFiles().find(([pub]) => pub === rel);
          if (!hit) return next();
          const stat = fs.statSync(hit[1]);
          res.setHeader('content-type', TYPES[path.extname(hit[1])] || 'application/octet-stream');
          res.setHeader('accept-ranges', 'bytes');
          const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
          if (range) {
            const start = range[1] ? +range[1] : 0, end = range[2] ? +range[2] : stat.size - 1;
            res.statusCode = 206;
            res.setHeader('content-range', `bytes ${start}-${end}/${stat.size}`);
            res.setHeader('content-length', end - start + 1);
            return fs.createReadStream(hit[1], { start, end }).pipe(res);
          }
          res.setHeader('content-length', stat.size);
          fs.createReadStream(hit[1]).pipe(res);
        });
      },
      'astro:build:done': ({ dir, logger }) => {
        const out = new URL(dir).pathname;
        let n = 0, bytes = 0;
        for (const [pub, src] of publishedFiles()) {
          const dest = path.join(out, pub);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
          n++; bytes += fs.statSync(src).size;
        }
        const ico = faviconIco();
        if (ico) fs.writeFileSync(path.join(out, 'favicon.ico'), ico);
        logger.info(`published ${n} repo files (${(bytes / 1048576).toFixed(1)} MB) and favicon.ico`);
      },
    },
  };
}
