/* The How it's made plates in Home's layer (round 6, S29). Home's HTML has a budget (tests/budget.mjs),
   and each presentation waits in a <template> on Home, so a plate's drawing is not written there: its slot
   names the project's static page, which has the same drawing, and the drawing is taken from it when the
   layer is built (or warmed on hover). The plate sits far down the layer, so it is in place long before
   the reader scrolls to it; until then (or offline) the slot keeps its size and the list beside it holds
   the content. */
const cache = new Map<string, Promise<string | null>>();

function get(src: string): Promise<string | null> {
  let p = cache.get(src);
  if (!p) {
    p = fetch(src).then((r) => (r.ok ? r.text() : null)).then((t) => {
      if (!t) return null;
      const svg = new DOMParser().parseFromString(t, 'text/html').querySelector('.hm-art:not(.hm-art-slot)');
      return svg ? svg.outerHTML : null;
    }).catch(() => null);
    cache.set(src, p);
  }
  return p;
}

export function fillPlates(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-plate-src]').forEach((slot) => {
    get(slot.dataset.plateSrc!).then((html) => { if (html && slot.parentNode) slot.outerHTML = html; });
  });
}
