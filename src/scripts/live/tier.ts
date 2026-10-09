/* Tiers for the frame engine (liveliness research §3 c, §7). Decided once per page view, before
   anything heavy loads, and only ever stepped down afterwards (no oscillation):
     still         reduced motion, Save-Data, ?still, no WebGL2, a software renderer, a failed
                   benchmark, or the watchdog's floor: the poster, complete on its own;
     phone         coarse pointer on a narrow screen: the rest frame and its normal map, the
                   float and a light that follows touch and scroll;
     lite          a weak GPU, DPR 1: the half grid (lean), rest normals, the clip at half size;
     full          the half grid in motion, exact full-size frames at rest, normals for every
                   pose, the clip with its own normals and an exact full-size peak.
   Overrides for the A/B: ?live=force skips the renderer and benchmark gates (headless tests run on
   a software renderer), ?tier=still|phone|lite|full picks a tier, ?watchdog=0 keeps it. */
import { mq, reduce, motionOK, params } from '../env';

export type Tier = 'still' | 'phone' | 'lite' | 'full';
export const ORDER: Tier[] = ['still', 'phone', 'lite', 'full'];
export const force = params.get('live') === 'force';
const pick = params.get('tier') as Tier | null;
export const override: Tier | null = pick && ORDER.includes(pick) ? pick : null;

const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|software/i;
export function renderer(gl: WebGL2RenderingContext): string {
  const e = gl.getExtension('WEBGL_debug_renderer_info');
  return e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
}

/** Why the engine must not run at all, or null. Checked before a context is made. */
export function stillReason(): string | null {
  if (reduce()) return 'reduced motion';
  if (!motionOK()) return 'save-data or ?still';
  if (override === 'still') return '?tier=still';
  return null;
}
/** The tier the device class allows, before the benchmark. */
export function ceiling(): Tier {
  if (override) return override;
  if (!mq.fine.matches && !mq.wide.matches) return 'phone';
  return 'full';
}
/** The renderer string can only refuse (Safari masks it), never promote. */
export function softwareRenderer(gl: WebGL2RenderingContext): boolean {
  return !force && SOFTWARE.test(renderer(gl));
}

/** Median GPU time (ms) of the real shader at the real canvas size, forcing a sync each frame by
    reading one pixel back. About 12 frames, at most about 120 ms; run after first paint, on idle. */
export function bench(gl: WebGL2RenderingContext, draw: () => void, n = 12): number {
  const px = new Uint8Array(4);
  const t: number[] = [];
  draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);   // warm-up: compile, upload
  const start = performance.now();
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    draw();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    t.push(performance.now() - t0);
    if (performance.now() - start > 120 && t.length >= 3) break;   // a slow device has answered already
  }
  t.sort((a, b) => a - b);
  return t[t.length >> 1];
}
/** Benchmark verdict: under 4 ms a frame keeps the ceiling, under 10 ms allows lite (phone stays
    phone), slower is still. */
export function fromBench(ms: number, top: Tier): Tier {
  if (force || override) return top;
  if (ms < 4) return top;
  if (ms < 10) return top === 'full' ? 'lite' : top;
  return 'still';
}

/** Frame-time watchdog: the p90 of rAF intervals over a rolling 2 s window; above 22 ms for a
    whole window, call down() and start a fresh window. It never steps up. */
export class Watchdog {
  private t: number[] = [];
  private since = 0;
  private last = 0;
  steps = 0;
  p90 = 0;
  constructor(private down: () => boolean, private on = params.get('watchdog') !== '0') {}
  reset(now: number) { this.t = []; this.since = now; this.last = 0; }
  tick(now: number) {
    if (this.last) {
      const d = now - this.last;
      if (d < 250) this.t.push(d);        // a long gap is a paused tab or a hidden page, not a slow frame
    }
    this.last = now;
    if (now - this.since < 2000 || this.t.length < 30) return;
    const s = [...this.t].sort((a, b) => a - b);
    this.p90 = s[Math.floor(s.length * 0.9)];
    if (this.on && this.p90 > 22 && this.down()) this.steps++;
    this.reset(now);
  }
}
