// A static server for the render pages: the repo at /, the font directory at /__fonts/.
// Served over http so the canvas can read posters (file:// taints it).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.woff2': 'font/woff2', '.json': 'application/json', '.js': 'text/javascript', '.avif': 'image/avif', '.svg': 'image/svg+xml' };

export function serve(repo, fontsDir) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const [base, rel] = url.startsWith('/__fonts/') ? [fontsDir, url.slice(9)] : [repo, url.slice(1)];
    const file = path.resolve(base, rel);
    if (!file.startsWith(path.resolve(base)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}
