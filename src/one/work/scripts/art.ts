/* The line art behind a project (spec v2 §5.1; art/README in the round-two notes). Each drawing is one
   SVG file with three layer groups: #back, #mid, #front. Until it loads (and in the still twin) the file
   is a CSS mask over the art box, so the drawing is there without JavaScript. One screen ahead of the
   view the file is fetched and each group becomes its own image (an SVG blob in an <img>, its ink baked
   in from the box's colour), so each layer is rasterised once and the compositor moves it at its own
   speed (back 0.85x, front 1.15x, with pointer parallax; mid moves with the page and stays painted). Inline SVG layers were measured to
   repaint every frame (about 40 ms a frame at 1440 px in the audit rig); images do not. Phones take the
   back layer only (spec v2 §3.3.3: one drawing layer), or the scene's phone master when it has one
   (art/<slug>-phone.svg, one #phone group: engraving guide §1.7).

   The engravings of round six (data-ink="fill") draw every line as a filled, tapered shape; their ink is a
   fill, and each layer takes its own strength from the opacity ladder (guide §1.9: back lighter, front
   stronger than the subject). */

export type ArtLayer = { el: HTMLImageElement; depth: number; px: number; still: boolean };
const DEPTH: Record<string, [number, number]> = { back: [0.85, 4], mid: [1, 10], front: [1.15, 18], phone: [0.9, 0] };
/* the opacity ladder of the engraving guide (§1.9) as a share of --art-o (.16): back .11, mid .16, front .19 */
const LADDER: Record<string, number> = { back: 0.7, mid: 1, front: 1.2, phone: 1 };

export function loadArt(box: HTMLElement, phone: boolean, done: (layers: ArtLayer[]) => void) {
  const master = phone && box.dataset.artPhone;
  const url = master || box.dataset.art;
  if (!url) return;
  /* the ink and the drawing's strength are baked into the strokes, so no layer needs a group opacity
     (a group opacity is one more full-size pass for the compositor) */
  const cs = getComputedStyle(box);
  const ink = rgb(cs.color);
  const strength = String(parseFloat(cs.getPropertyValue('--art-o')) || 0.14);
  fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then(async (txt) => {
    const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
    const src = doc.documentElement;
    if (src.nodeName !== 'svg') return;
    const groups = master ? ['phone'] : ['back', 'mid', 'front'];
    const fill = src.getAttribute('data-ink') === 'fill';
    const [, , VW, VH] = (src.getAttribute('viewBox') || '0 0 1600 1000').split(/[ ,]+/).map(Number);
    /* each layer's image is cut to its drawing's box (inside the view box): less area to composite */
    const probe = document.importNode(src, true) as unknown as SVGSVGElement;
    probe.setAttribute('style', `position:absolute;left:-9999px;top:0;width:${VW}px;height:${VH}px;visibility:hidden`);
    document.body.append(probe);
    const boxes: Record<string, [number, number, number, number]> = {};
    for (const id of groups) {
      const g = probe.querySelector<SVGGraphicsElement>(`g#${id}`);
      if (!g) continue;
      const r = g.getBBox();
      const x0 = Math.max(0, Math.floor(r.x) - 4), y0 = Math.max(0, Math.floor(r.y) - 4);
      const x1 = Math.min(VW, Math.ceil(r.x + r.width) + 4), y1 = Math.min(VH, Math.ceil(r.y + r.height) + 4);
      boxes[id] = [x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)];
    }
    probe.remove();
    const layers: ArtLayer[] = [];
    for (const id of phone && !master ? ['back'] : groups) {
      if (!src.querySelector(`g#${id}`)) continue;
      const svg = src.cloneNode(true) as Element;
      for (const o of ['back', 'mid', 'front', 'phone']) if (o !== id) svg.querySelector(`g#${o}`)?.remove();
      svg.querySelector('title')?.remove();
      svg.querySelector('desc')?.remove();
      if (fill) {
        svg.setAttribute('fill', ink);
        svg.setAttribute('fill-opacity', String(+strength * (LADDER[id] ?? 1)));
      } else {
        svg.setAttribute('stroke', ink);
        svg.setAttribute('stroke-opacity', strength);
      }
      svg.querySelector('g#places')?.remove();
      const [bx, by, bw, bh] = boxes[id] ?? [0, 0, VW, VH];
      svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
      svg.setAttribute('width', String(bw));
      svg.setAttribute('height', String(bh));
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.className = `fl-layer fl-layer-${id}`;
      img.setAttribute('aria-hidden', 'true');
      img.src = URL.createObjectURL(blob);
      img.style.cssText = `left: ${(bx / VW) * 100}%; top: ${(by / VH) * 100}%; width: ${(bw / VW) * 100}%; height: ${(bh / VH) * 100}%`;
      /* a drawing of the earlier rounds was drawn to its box's edges: fade its ink over the top and bottom
         18 % of the box, so that two neighbouring scenes never pile up in motion (row S20; the round-six
         engravings fade in the drawing itself and need no mask) */
      if (!fill) {
        const at = (Y: number) => (((Y - by) / bh) * 100).toFixed(1);
        const m = `linear-gradient(to bottom, transparent ${at(0)}%, #000 ${at(VH * 0.18)}%, #000 ${at(VH * 0.82)}%, transparent ${at(VH)}%)`;
        img.style.setProperty('-webkit-mask-image', m);
        img.style.setProperty('mask-image', m);
      }
      /* the middle layer moves with the page: it needs no transform and no layer of its own */
      layers.push({ el: img, depth: DEPTH[id][0], px: DEPTH[id][1], still: id === 'mid' });
    }
    await Promise.all(layers.map((l) => l.el.decode().catch(() => {})));
    const wrap = document.createElement('div');
    wrap.className = 'fl-ink';
    wrap.append(...layers.map((l) => l.el));
    box.prepend(wrap);
    box.classList.add('live');
    done(layers);
  }).catch(() => { /* the mask stays: the drawing at rest */ });
}

/** Any CSS colour as rgb(): computed colour-mix values read as color(srgb ...), which an SVG image
    may not parse; a one-pixel canvas turns them into plain numbers. */
function rgb(c: string): string {
  try {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const x = cv.getContext('2d')!;
    x.fillStyle = c;
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch { return '#e8e3dd'; }
}
