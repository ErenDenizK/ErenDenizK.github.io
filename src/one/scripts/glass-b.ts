/* Glass version b (glass.css; glass study V7 §3): an SVG displacement rim for each glass object. Chromium
   is the only engine that draws backdrop-filter: url(), so elsewhere nothing is added and a stays. The map
   is drawn per object size on a 2D canvas: R and G hold the inward normal of the pill, scaled by
   (1 - d / 14)^2 inside a 14 px rim band; the centre is neutral (128), so only the edge bends. A
   ResizeObserver redraws it when a capsule folds. */
import { eachGlass } from './glass';

const NS = 'http://www.w3.org/2000/svg';
const RIM = 14, SCALE = 40;

function map(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  if (!x) return '';
  const img = x.createImageData(w, h), d = img.data;
  const r = Math.min(h, w) / 2, rim = Math.min(RIM, r);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const px = i + 0.5, py = j + 0.5;
    const cx = Math.min(Math.max(px, r), w - r), cy = Math.min(Math.max(py, r), h - r);
    const vx = px - cx, vy = py - cy, len = Math.hypot(vx, vy) || 1;
    const din = r - len;
    const m = din >= 0 && din < rim ? (1 - din / rim) ** 2 : 0;
    const k = (j * w + i) * 4;
    d[k] = 128 - (vx / len) * m * 127; d[k + 1] = 128 - (vy / len) * m * 127; d[k + 2] = 128; d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c.toDataURL();
}

export function initLens() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? [];
  if (!brands.some((b) => /Chromium/.test(b.brand))) return;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  document.body.appendChild(svg);
  let n = 0;
  eachGlass((el) => {
    const id = `g-lens-${n++}`;
    const f = document.createElementNS(NS, 'filter');
    f.id = id;
    for (const [a, v] of [['filterUnits', 'userSpaceOnUse'], ['primitiveUnits', 'userSpaceOnUse'], ['color-interpolation-filters', 'sRGB']]) f.setAttribute(a, v);
    const im = document.createElementNS(NS, 'feImage');
    im.setAttribute('result', 'map'); im.setAttribute('preserveAspectRatio', 'none');
    const dm = document.createElementNS(NS, 'feDisplacementMap');
    for (const [a, v] of [['in', 'SourceGraphic'], ['in2', 'map'], ['scale', String(SCALE)], ['xChannelSelector', 'R'], ['yChannelSelector', 'G']]) dm.setAttribute(a, v);
    f.append(im, dm);
    svg.appendChild(f);
    let last = '';
    const size = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h || `${w}x${h}` === last) return;
      last = `${w}x${h}`;
      for (const [a, v] of [['x', 0], ['y', 0], ['width', w], ['height', h]] as const) { f.setAttribute(a, String(v)); im.setAttribute(a, String(v)); }
      im.setAttribute('href', map(w, h));
    };
    size();
    new ResizeObserver(size).observe(el);
    el.style.setProperty('--glass-lens', `url(#${id})`);
    el.classList.add('g-lens');
  });
}
