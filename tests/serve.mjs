// A static server that behaves like GitHub Pages for the tests: the build under its base path,
// directory indexes, /404.html with status 404, byte ranges (206) for video, no compression.
// node tests/serve.mjs <dir> <port> [base]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [dir = 'dist', port = '4329', base = process.env.BASE_PATH || '/'] = process.argv.slice(2);
const root = path.resolve(dir);
const B = base.replace(/\/?$/, '/');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };

http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  const send = (file, status = 200) => {
    const stat = fs.statSync(file);
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    res.setHeader('content-type', type);
    res.setHeader('accept-ranges', 'bytes');
    res.setHeader('cache-control', 'max-age=600');
    if (range && status === 200) {
      const start = range[1] ? +range[1] : 0, end = range[2] ? +range[2] : stat.size - 1;
      res.writeHead(206, { 'content-range': `bytes ${start}-${end}/${stat.size}`, 'content-length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(status, { 'content-length': stat.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  };
  const notFound = () => (fs.existsSync(path.join(root, '404.html')) ? send(path.join(root, '404.html'), 404) : (res.writeHead(404), res.end('not found')));
  if (!url.startsWith(B)) { if (url === B.slice(0, -1)) { res.writeHead(301, { location: B }); return res.end(); } return notFound(); }
  let file = path.join(root, url.slice(B.length));
  if (!file.startsWith(root)) return notFound();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(301, { location: url + '/' }); return res.end(); }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (!fs.existsSync(file)) return notFound();
  send(file);
}).listen(+port, () => console.log(`serving ${root} at http://localhost:${port}${B}`));
