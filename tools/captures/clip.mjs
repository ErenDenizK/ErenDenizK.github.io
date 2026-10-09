// Encodes a product's signature clip for its embassy (docs/family-kit/presentation.md §3; media
// research §8): AV1 10-bit, then HEVC Main 10 tagged hvc1, then H.264, BT.709 limited range tagged,
// no audio, +faststart, and the poster as a lossless PNG of frame 0 (the build derives its AVIF and
// WebP like every other capture). Files land beside the screens, named as the kit names them:
//   content/projects/<slug>/captures/<slug>-signature-<w>x<h>@<dpr>x{-poster.png,.av1.mp4,.hevc.mp4,.h264.mp4}
// Screens need no tool: their PNG masters go into the same folder and world.json lists them.
//
//   node tools/captures/clip.mjs <slug> <master.webm|mp4|mov|frames/%04d.png> <w>x<h> <dpr> [--to <s>] [--fps <n>]
//   --to keeps only the start of a longer recording (the gesture, ending on a rest pose);
//   --hold <s> holds the last frame that long, so a short gesture rests before it ends
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const [slug, src, vp, dpr, ...flags] = process.argv.slice(2);
if (!slug || !src || !/^\d+x\d+$/.test(vp || '') || !dpr) {
  console.error('usage: clip.mjs <slug> <master> <w>x<h> <dpr> [--to <s>] [--fps <n>]');
  process.exit(2);
}
const opt = (k) => (flags.includes(k) ? flags[flags.indexOf(k) + 1] : null);
const to = opt('--to'), fps = opt('--fps'), hold = opt('--hold');
const frames = /%\d*d/.test(src);
const OUT = path.join(ROOT, 'content/projects', slug, 'captures');
fs.mkdirSync(OUT, { recursive: true });
const stem = path.join(OUT, `${slug}-signature-${vp}@${dpr}x`);
/* -t before -i trims the input, so a --hold is added after the cut */
const trim = to ? ['-t', to] : [];
const input = frames ? ['-framerate', fps || '60', ...trim, '-i', src] : [...trim, '-i', src];
const TAG = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-an', '-movflags', '+faststart'];
const VF = ['-vf', `scale=out_color_matrix=bt709:out_range=tv${fps && !frames ? `,fps=${fps}` : ''}${hold ? `,tpad=stop_mode=clone:stop_duration=${hold}` : ''}`];
const run = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...input, ...args], { stdio: 'inherit' });
/* UI text is sharper than a rendered object (presentation.md §3): the kit's CRFs, not the objects' */
run([...VF, '-c:v', 'libsvtav1', '-preset', '5', '-crf', '30', '-pix_fmt', 'yuv420p10le', '-svtav1-params', 'tune=0', ...TAG, `${stem}.av1.mp4`]);
run([...VF, '-c:v', 'libx265', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p10le', '-tag:v', 'hvc1', '-x265-params', 'log-level=error', ...TAG, `${stem}.hevc.mp4`]);
run([...VF, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p', ...TAG, `${stem}.h264.mp4`]);
run(['-frames:v', '1', `${stem}-poster.png`]);
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${stem}.h264.mp4`]).toString();
for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith(path.basename(stem)))) console.log(f.padEnd(56), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1), 'KB');
console.log(`duration ${dur.toFixed(2)} s: list it in world.json as kind "signature", files [poster, av1, hevc, h264], durationSeconds ${dur.toFixed(1)}`);
