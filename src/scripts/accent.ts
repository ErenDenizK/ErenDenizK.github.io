/* The page accent (brief §7, after v0: "the colour-changing dot in edk. and the lit, coloured tabs felt
   alive"). Every page sets --accent on <html> at build time (layouts/Base.astro); the dot in the mark
   and the light in the active tab take it, and glide to a new value (styles/global.css, "Chrome
   accent"). Here it follows what is in front of the reader: on Work the project you dwell on, and over
   any page the project open in the sheet. Closing the sheet gives the page its own accent back. */
import { root } from './env';

const own = root.style.getPropertyValue('--accent');
let page = own;

export function setAccent(c: string | null) {
  page = c || own;
  if (!root.classList.contains('sheet-open')) root.style.setProperty('--accent', page);
}

export function initAccent() {
  const dlg = document.getElementById('focus');
  if (!dlg) return;
  /* the sheet copies the project's --pg / --p onto the dialog (scripts/sheet.ts fill) */
  const sync = () => {
    const open = root.classList.contains('sheet-open');
    const p = dlg.style.getPropertyValue('--pg').trim() || dlg.style.getPropertyValue('--p').trim();
    root.style.setProperty('--accent', open && p ? p : page);
  };
  const mo = new MutationObserver(sync);
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  mo.observe(dlg, { attributes: true, attributeFilter: ['style'] });
}
