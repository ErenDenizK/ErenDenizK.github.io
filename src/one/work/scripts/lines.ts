/* Text in line masks (spec v2 §2.1 and §7 rule 9). A paragraph marked [data-lines] is cut into its
   rendered lines: each line becomes .ln (the mask: overflow hidden, padded 0.06 em above and 0.26 em
   below so no ascender or descender is cut at rest) around .li (the line that moves). The words stay
   the same text nodes in the same order, so screen readers and copy read the paragraph as before. The
   cut is made again when the paragraph's width changes. */

const words = new WeakMap<HTMLElement, string>();

/** Cut el into lines; returns the moving inner element of each line. */
export function splitLines(el: HTMLElement): HTMLElement[] {
  const text = words.get(el) ?? (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  words.set(el, text);
  const parts = text.split(' ');
  el.textContent = '';
  const probes = parts.map((w, i) => {
    const s = document.createElement('span');
    s.textContent = i < parts.length - 1 ? w + ' ' : w;
    el.append(s);
    return s;
  });
  const rows: string[][] = [];
  let top = -1e9;
  for (const s of probes) {
    const t = s.offsetTop;
    if (Math.abs(t - top) > 2) { rows.push([]); top = t; }
    rows[rows.length - 1].push(s.textContent ?? '');
  }
  el.textContent = '';
  return rows.map((r) => {
    const ln = document.createElement('span');
    ln.className = 'ln';
    const li = document.createElement('span');
    li.className = 'li';
    li.textContent = r.join('').trimEnd();
    ln.append(li);
    el.append(ln, ' ');
    return li;
  });
}
