// Colour maths for the palette checker: CSS colour parsing, alpha compositing, OKLab/OKLCH,
// WCAG 2 contrast and APCA lightness contrast (Lc). Zero dependencies.
//
// The WCAG 2, APCA and OKLCH maths are ported from the owner's other app, English Prep
// (github.com/ErenDenizK/english-prep, tools/color.mjs). The CSS parsing, color-mix() and
// compositing are new here.
//
// Why both contrast models: WCAG 2 is the legal benchmark. Its formula overestimates contrast for
// very dark colours. This site is dark, so the error lands where the whole interface lives. Every
// pairing is measured with both, and has to satisfy both.

/* ---- channels ---- */

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function gammaEncode(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function gammaDecode(c) {
  // WCAG moved this threshold from 0.03928 to 0.04045 in 2021 to match IEC sRGB. No difference at 8 bits.
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** A colour here is { r, g, b, a }: sRGB channels 0..255 (unrounded), alpha 0..1. */
const rgba = (r, g, b, a = 1) => ({ r, g, b, a });

export function toHex({ r, g, b, a = 1 }) {
  const h = [r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('');
  return '#' + h + (a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : '');
}

/* ---- OKLab / OKLCH (Björn Ottosson's matrices) ---- */

function linearToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function toOklab(c) {
  return linearToOklab([c.r, c.g, c.b].map((v) => gammaDecode(v / 255)));
}

function fromOklab(lab, a = 1) {
  const [r, g, b] = oklabToLinear(lab).map((v) => clamp01(gammaEncode(clamp01(v))) * 255);
  return rgba(r, g, b, a);
}

/** OKLCH coordinates of a colour, for reports: L 0..1, C, H in degrees. */
export function toOklch(c) {
  const [L, a, b] = toOklab(c);
  const C = Math.hypot(a, b);
  const H = C < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return { L, C, H };
}

export function oklch(L, C, H, a = 1) {
  const rad = (H * Math.PI) / 180;
  return fromOklab([L, C * Math.cos(rad), C * Math.sin(rad)], a);
}

/* ---- CSS colour syntax ---- */

const NAMED = {
  transparent: rgba(0, 0, 0, 0),
  black: rgba(0, 0, 0),
  white: rgba(255, 255, 255),
  currentcolor: null,
};

/** Splits a function's argument list on top-level commas (or spaces when there are none). */
function splitArgs(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

const num = (s, scale = 1) => (s.endsWith('%') ? (parseFloat(s) / 100) * scale : parseFloat(s));

/** The body of the outermost function call at the start of `s`, e.g. "rgb(1 2 3)" -> "1 2 3". */
function callBody(s) {
  const open = s.indexOf('(');
  let depth = 0;
  for (let i = open; i < s.length; i += 1) {
    if (s[i] === '(') depth += 1;
    if (s[i] === ')') {
      depth -= 1;
      if (depth === 0) return s.slice(open + 1, i);
    }
  }
  throw new Error(`unbalanced parentheses in ${s}`);
}

/**
 * Parses one CSS colour with no var() left in it: hex, rgb()/rgba(), oklch(), oklab(), the
 * named colours above, and color-mix() in srgb, srgb-linear or oklab.
 * @returns {{r:number,g:number,b:number,a:number}}
 */
export function parseColor(input) {
  const s = input.trim().toLowerCase();
  if (s in NAMED) {
    if (!NAMED[s]) throw new Error(`${s} depends on the element; declare the colour instead`);
    return { ...NAMED[s] };
  }
  if (s.startsWith('#')) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return rgba(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a);
  }
  if (s.startsWith('rgb')) {
    const parts = callBody(s).replace('/', ' ').split(/[\s,]+/).filter(Boolean);
    const [r, g, b] = parts.slice(0, 3).map((p) => num(p, 255));
    return rgba(r, g, b, parts[3] !== undefined ? num(parts[3]) : 1);
  }
  if (s.startsWith('oklch') || s.startsWith('oklab')) {
    const parts = callBody(s).replace('/', ' ').split(/\s+/).filter(Boolean);
    const a = parts[3] !== undefined ? num(parts[3]) : 1;
    const L = num(parts[0]);
    if (s.startsWith('oklch')) return oklch(L, num(parts[1], 0.4), parseFloat(parts[2]), a);
    return fromOklab([L, num(parts[1], 0.4), num(parts[2], 0.4)], a);
  }
  if (s.startsWith('color-mix')) return colorMix(callBody(s));
  throw new Error(`unsupported colour: ${input}`);
}

/** color-mix() per CSS Color 5 §2: percentage normalisation and premultiplied interpolation. */
function colorMix(body) {
  const [space, ...items] = splitArgs(body);
  const method = space.replace(/^in\s+/, '').trim();
  const parsed = items.map((item) => {
    const m = item.match(/\s(\d+(?:\.\d+)?)%\s*$/) || item.match(/^(\d+(?:\.\d+)?)%\s/);
    const colour = m ? item.replace(m[0], ' ').trim() : item;
    return { c: parseColor(colour), p: m ? parseFloat(m[1]) / 100 : null };
  });
  let [p1, p2] = [parsed[0].p, parsed[1].p];
  if (p1 === null && p2 === null) [p1, p2] = [0.5, 0.5];
  else if (p1 === null) p1 = 1 - p2;
  else if (p2 === null) p2 = 1 - p1;
  const sum = p1 + p2;
  const alphaScale = sum < 1 ? sum : 1;
  [p1, p2] = [p1 / sum, p2 / sum];

  const [c1, c2] = [parsed[0].c, parsed[1].c];
  const to = {
    srgb: (c) => [c.r / 255, c.g / 255, c.b / 255],
    'srgb-linear': (c) => [c.r, c.g, c.b].map((v) => gammaDecode(v / 255)),
    oklab: (c) => toOklab(c),
  }[method];
  if (!to) throw new Error(`color-mix space not supported: ${method}`);
  const a = c1.a * p1 + c2.a * p2;
  if (a === 0) return rgba(0, 0, 0, 0);
  // premultiplied: a transparent end contributes no hue
  const v1 = to(c1).map((v) => v * c1.a);
  const v2 = to(c2).map((v) => v * c2.a);
  const mixed = v1.map((v, i) => (v * p1 + v2[i] * p2) / a);
  const outA = a * alphaScale;
  if (method === 'srgb') return rgba(mixed[0] * 255, mixed[1] * 255, mixed[2] * 255, outA);
  if (method === 'srgb-linear') {
    const [r, g, b] = mixed.map((v) => clamp01(gammaEncode(clamp01(v))) * 255);
    return rgba(r, g, b, outA);
  }
  return fromOklab(mixed, outA);
}

/** Paints `top` over `bottom` (source-over, in gamma-encoded sRGB, as browsers composite). */
export function over(top, bottom) {
  const a = top.a + bottom.a * (1 - top.a);
  if (a === 0) return rgba(0, 0, 0, 0);
  const ch = (k) => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
  return rgba(ch('r'), ch('g'), ch('b'), a);
}

/** Flattens a stack of layers, bottom first. The bottom layer must be opaque. */
export function flatten(layers) {
  const [base, ...rest] = layers;
  if (base.a < 1) throw new Error('the bottom layer of a ground must be opaque');
  return rest.reduce((acc, layer) => over(layer, acc), base);
}

/* ---- WCAG 2 (ported) ---- */

function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => gammaDecode(c / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** @returns {number} contrast ratio 1..21 between two opaque colours */
export function wcagContrast(fg, bg) {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---- APCA 0.0.98G-4g (ported; constants from the reference implementation, apca-w3) ---- */

const MAIN_TRC = 2.4;
const S_RCO = 0.2126729, S_GCO = 0.7151522, S_BCO = 0.072175;
const NORM_BG = 0.56, NORM_TXT = 0.57, REV_BG = 0.65, REV_TXT = 0.62;
const BLK_THRS = 0.022, BLK_CLMP = 1.414;
const SCALE_BOW = 1.14, SCALE_WOB = 1.14;
const LO_BOW_OFFSET = 0.027, LO_WOB_OFFSET = 0.027;
const DELTA_Y_MIN = 0.0005, LO_CLIP = 0.1;

const apcaY = ({ r, g, b }) =>
  S_RCO * (r / 255) ** MAIN_TRC + S_GCO * (g / 255) ** MAIN_TRC + S_BCO * (b / 255) ** MAIN_TRC;

const softClamp = (y) => (y > BLK_THRS ? y : y + (BLK_THRS - y) ** BLK_CLMP);

/**
 * @returns {number} Lc. Negative means light text on a dark ground. The floors use the magnitude.
 *   APCA is not symmetric: the text and the ground are not interchangeable.
 */
export function apca(text, bg) {
  const yTxt = softClamp(apcaY(text));
  const yBg = softClamp(apcaY(bg));
  if (Math.abs(yBg - yTxt) < DELTA_Y_MIN) return 0;
  let output;
  if (yBg > yTxt) {
    output = (yBg ** NORM_BG - yTxt ** NORM_TXT) * SCALE_BOW;
    output = output < LO_CLIP ? 0 : output - LO_BOW_OFFSET;
  } else {
    output = (yBg ** REV_BG - yTxt ** REV_TXT) * SCALE_WOB;
    output = output > -LO_CLIP ? 0 : output + LO_WOB_OFFSET;
  }
  return output * 100;
}
