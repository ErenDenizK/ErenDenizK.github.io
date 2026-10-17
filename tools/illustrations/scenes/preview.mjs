// node preview.mjs <scene> <out.svg> [debug]
import fs from 'fs';
const [scene, out, dbg] = process.argv.slice(2);
const mod = await import(`./${scene.split(':')[0]}.mjs`);
const fn = mod[scene.split(':')[1]];
const t = Date.now();
const res = fn({ debug: !!dbg });
const s = res.svg();
fs.writeFileSync(out, s);
const kb = (Buffer.byteLength(s) / 1024).toFixed(1);
const zlib = await import('zlib');
console.log(scene, kb, 'KB raw', (zlib.gzipSync(s).length / 1024).toFixed(1), 'KB gz', Date.now() - t, 'ms', JSON.stringify(Object.fromEntries(Object.entries(res.P.stats).map(([k, v]) => [k, Math.round(v)]))));
