import fs from 'node:fs';
import path from 'node:path';

// @font-face rules pointing at the local Fontsource files: latin plus latin-ext, where
// "Kuyucaklıoğlu" finds its ı and ğ. The opsz files carry both the wght and opsz axes.
// base: URL prefix under which `dir` is served (see serve.mjs).
export function fontCss(dir, base) {
  const ranges = {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  };
  const faces = [['Newsreader', 'newsreader', '400 500'], ['Inter', 'inter', '100 900']];
  let css = '';
  for (const [family, pkg, weight] of faces) {
    for (const [sub, range] of Object.entries(ranges)) {
      const f = path.join(dir, 'node_modules/@fontsource-variable', pkg, 'files', `${pkg}-${sub}-opsz-normal.woff2`);
      if (!fs.existsSync(f)) throw new Error(`missing font ${f}\ninstall: cd ${dir} && npm i @fontsource-variable/newsreader@5.3.0 @fontsource-variable/inter@5.3.0`);
      css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:block;src:url("${base}/node_modules/@fontsource-variable/${pkg}/files/${pkg}-${sub}-opsz-normal.woff2") format("woff2");unicode-range:${range};}\n`;
    }
  }
  return css;
}

