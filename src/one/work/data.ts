/* Work's model (phase3 design-spec.md 3.3): each project becomes a set of prints, a light, a head and a
   presentation, read from the project file, its world.json and src/one/work/stage.json. Nothing here
   names a product: a new project is a new content file (ADR-0002). Fields without data are left out, so
   the components hide them. */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { getWorld, shot, type Shot, type World, fills } from '../../lib/world';
import { poster, type Poster } from '../../lib/media';
import { readManifest } from '../../lib/files.mjs';
import { WORDMARK_FACES } from '../../lib/wordmarks';
import { url, ym, isPlaceholder, type Project } from '../../lib/site';
import stageData from './stage.json';

type StageEntry = { hero?: string; focus?: Record<string, [number, number]>; props?: { capture: string; crop: number[]; radius?: number; at: [number, number, number]; turn?: number; phone?: boolean }[] };
const STAGE = stageData as unknown as Record<string, StageEntry>;

const propFiles = import.meta.glob<{ default: ImageMetadata }>('./props/*.png', { eager: true });
/* The line art behind each project (spec v2 §5.1; owner, 2026-10-16, row W4): art/<slug>.svg, optional.
   One file per project with three layer groups (#back, #mid, #front); the page loads it one screen
   ahead (scripts/art.ts) and uses the file itself as a CSS mask for the still twin. */
const artUrls = import.meta.glob<string>('./art/*.svg', { eager: true, query: '?url', import: 'default' });
const artRaw = import.meta.glob<string>('./art/*.svg', { eager: true, query: '?raw', import: 'default' });

/** The places of a drawing: the flat ground rings of its #front group, in viewBox units, the lowest
    first (the route lights them in that order as the torn paper rises: spec v2 §3.3.4). */
function stopsOf(svg: string): [number, number][] {
  const i = svg.indexOf('<g id="front"');
  if (i < 0) return [];
  const out: [number, number][] = [];
  for (const m of svg.slice(i).matchAll(/M(-?[\d.]+) (-?[\d.]+)a([\d.]+) ([\d.]+) 0 1 0/g)) {
    const [x, y, rx, ry] = [m[1], m[2], m[3], m[4]].map(Number);
    if (rx > 2.5 * ry && ry < 10 && !out.some(([a, b]) => Math.abs(a - x - rx) < 30 && Math.abs(b - y) < 30)) out.push([+(x + rx).toFixed(1), y]);
  }
  return out.sort((a, b) => b[1] - a[1]);
}

/** One image in AVIF and WebP at the given widths (never wider than the master). */
export type Pic = { avif: string; webp: string; src: string; w: number; h: number };
async function pic(img: ImageMetadata, widths: number[], quality = 62): Promise<Pic> {
  const fit = [...new Set(widths.map((w) => Math.min(w, img.width)))];
  const enc = async (format: 'avif' | 'webp') => {
    const list = await Promise.all(fit.map((w) => getImage({ src: img, width: w, format, quality })));
    return list.map((r, i) => `${r.src} ${fit[i]}w`).join(', ');
  };
  const fallback = await getImage({ src: img, width: fit[fit.length - 1], format: 'webp', quality });
  return { avif: await enc('avif'), webp: await enc('webp'), src: fallback.src, w: img.width, h: img.height };
}

export type Video = { src: string; type: string }[];
export type Screen = {
  id: string; alt: string;
  /** the step's title and body (the reel caption split at its first colon); none without a caption */
  title?: string; body?: string;
  wide: Pic; phone?: Pic; phoneFrame: boolean;
  focus: [number, number]; phoneFocus: [number, number];
  clip?: { wide: Video; phone?: Video; poster: Pic };
};
export type Prop = { pic: Pic; w: number; h: number; at: [number, number, number]; turn: number; phone: boolean; radius: number };
export type Obj = { name: string; poster: Poster; idle: Video; spin: Video; spinPhone: Video };
export type Model = {
  slug: string; title: string; order: number;
  /** the three pigments of the project's light: a1 the brightest, a3 the deepest */
  aura: [string, string, string];
  paper: string; raised: string;
  wordmark: string; wmClass: string;
  meta: string; metaLong: string;
  summary: string;
  facts: [string, string][];
  prints: Screen[];
  steps: Screen[];
  outcome?: string;
  numbers?: { value: string; label: string }[];
  quote?: string;
  how?: string[];
  /** the product's layers for the cutaway (spec v3 §6): a name and the indices of its items in `how` */
  howLayers?: { name: string; items: number[] }[];
  live?: { label: string; href: string; fill: string; ink: string };
  code?: { label: string; href: string };
  linksNote?: string;
  obj: Obj;
  /** the signature clip the hero plays once the open has settled (a phone cut under 700 px) */
  heroClip?: { wide: Video; phone?: Video };
  props: Prop[];
  /** the line art behind the project, and its places (none without a file) */
  art?: { url: string; stops: [number, number][] };
  /** two or three words from the stack line, floated in Work's margins (spec v2 §3.3.1, parity SH14) */
  tags: string[];
  /** the label of a print without screens (the first part of the stack line) */
  kind: string;
  href: string;
  home: string;
  next?: { slug: string; title: string; href: string };
};

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h: string) => { const [r, g, b] = hexRgb(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** The light of a project (spec 2.5): a1 is the project's own light (its glow, else world.json's
    accent light); a2 and a3 are the other pigments of its world.json light sources, the brighter
    first. With only one other pigment, the accent colour joins them. */
function auraOf(p: Project, w: World | null): [string, string, string] {
  const a1 = (p.data.accent.glow ?? w?.accent.light ?? p.data.accent.color).toLowerCase();
  const skip = new Set([a1, (w?.accent.light ?? '').toLowerCase()]);
  const pool = [...new Set((w?.light.sources ?? []).flatMap((s) => s.pigments.map((x) => x.toLowerCase())))].filter((x) => !skip.has(x));
  if (pool.length < 2) for (const x of [p.data.accent.color, p.data.accent.p2, p.data.accent.p3, w?.accent.color]) if (x && !skip.has(x.toLowerCase()) && !pool.includes(x.toLowerCase())) pool.push(x.toLowerCase());
  pool.sort((a, b) => lum(b) - lum(a));
  const a2 = pool[0] ?? a1, a3 = pool[pool.length - 1] ?? a2;
  return [a1, a2, a3];
}

const split = (caption?: string) => {
  if (!caption) return {};
  const i = caption.indexOf(':');
  return i < 0 ? { title: caption.trim() } : { title: caption.slice(0, i).trim(), body: caption.slice(i + 1).trim() };
};

function videoOf(s: Shot): Video { return s.video ?? []; }
function objVideos(name: string, key: 'idle' | 'spin' | 'spin-640'): Video {
  const m = readManifest(name);
  const dir = url(`media/objects/${name}/`);
  if (key === 'idle') return (m?.idle?.sources ?? []).map((s: { src: string; type: string }) => ({ src: dir + s.src, type: s.type }));
  const list = (m?.spin?.sources ?? []).map((s: { src: string; type: string }) => ({ src: dir + (key === 'spin-640' ? s.src.replace('spin.', 'spin-640.') : s.src), type: s.type }));
  return list;
}

/** Projects, sorted by order, into Work's model. `base` is Home's path under the site base. */
export async function models(projects: Project[], base: string): Promise<Model[]> {
  /* a caller may pass Home's full URL (url('lab/one/')): the site base is taken off, so it is never doubled */
  const site = url();
  if (site !== '/' && base.startsWith(site)) base = '/' + base.slice(site.length);
  const home = url(base);
  const list: Model[] = [];
  for (const p of projects) {
    const d = p.data;
    const w = await getWorld(p.id);
    const st = STAGE[p.id] ?? {};
    const focus = (id: string): [number, number] => st.focus?.[id] ?? [0.5, 0.5];
    const reel = d.reel ?? [];
    const caption = (id: string) => reel.find((r) => r.id === id)?.caption;
    const kindOf = (id: string) => w?.captures.find((c) => c.id === id)?.kind;
    const isWide = (id: string) => { const c = w?.captures.find((x) => x.id === id); return !!c && c.kind === 'screen' && c.viewport[0] >= 600; };

    const screen = async (id: string, phoneId?: string): Promise<Screen> => {
      const clip = kindOf(id) === 'signature';
      const s = shot(p.id, w!, { id }, clip ? 'signature' : 'screen');
      const ph = phoneId ? shot(p.id, w!, { id: phoneId }) : null;
      const wide = await pic(s.img, [680, 1360]);
      const out: Screen = {
        id, alt: s.alt, ...split(caption(id)), wide,
        phone: ph ? await pic(ph.img, [390, 780], 70) : undefined, phoneFrame: !!ph,
        focus: focus(id), phoneFocus: ph ? focus(ph.id) : focus(id),
      };
      if (clip) {
        const cut = d.clip?.id === id && d.clip.phone ? shot(p.id, w!, { id: d.clip.phone }, 'signature') : null;
        out.clip = { wide: videoOf(s), phone: cut ? videoOf(cut) : undefined, poster: wide };
      }
      return out;
    };

    /* the prints: the reel's still screens, in its order, then the project's other wide captures, up to three */
    const ids: { id: string; phone?: string }[] = reel.filter((r) => isWide(r.id)).map((r) => ({ id: r.id, phone: r.phone }));
    for (const c of d.captures) if (ids.length < 3 && isWide(c.id) && !ids.some((x) => x.id === c.id)) ids.push({ id: c.id });
    /* the hero frame (spec v2 §3.3.1): stage.json may name the capture that leads (a dark screen on the
       Graphite page rather than a white document); the others follow in reel order */
    const lead = ids.findIndex((x) => x.id === st.hero);
    if (lead > 0) ids.unshift(...ids.splice(lead, 1));
    const prints = w ? await Promise.all(ids.slice(0, 3).map((x) => screen(x.id, x.phone))) : [];
    /* the steps: the reel as written (a clip step plays the signature clip) */
    const steps = w ? await Promise.all(reel.map((r) => prints.find((x) => x.id === r.id) ?? screen(r.id, r.phone))) : [];

    const props: Prop[] = [];
    for (const [n, pr] of (st.props ?? []).entries()) {
      const f = propFiles[`./props/${p.id}-${n + 1}.png`]?.default;
      if (!f) throw new Error(`${p.id}: prop ${n + 1} is missing; run node src/one/work/tools/props.mjs`);
      props.push({ pic: await pic(f, [Math.round(f.width / 2), f.width], 70), w: pr.crop[2], h: pr.crop[3], at: pr.at, turn: pr.turn ?? 0, phone: !!pr.phone, radius: pr.radius ?? 0 });
    }

    let heroClip: Model['heroClip'];
    if (w && d.clip) {
      const c = shot(p.id, w, { id: d.clip.id }, 'signature');
      const cut = d.clip.phone ? shot(p.id, w, { id: d.clip.phone }, 'signature') : null;
      heroClip = { wide: videoOf(c), phone: cut ? videoOf(cut) : undefined };
    }

    const version = typeof d.version === 'string' ? d.version : undefined;
    const started = typeof d.started === 'string' ? `Since ${ym(d.started)}` : undefined;
    const meta = [d.status, d.statusNote, version].filter(Boolean).join(' · ');
    const wm = d.wordmark;
    const face = WORDMARK_FACES[wm?.face ?? 'Inter'];
    const stack = wm?.face === 'Inter' || !wm ? 'var(--f-sans)' : face.stack;
    const wordmark = [`--wm-f: ${stack}`, `--wm-w: ${wm?.weight ?? 600}`, `--wm-t: ${wm?.tracking ?? -0.02}em`, wm?.color && wm.color !== 'ink' ? `--wm-c: ${wm.color}` : '', wm?.dot ? `--wm-dot: ${wm.dot}` : ''].filter(Boolean).join('; ');
    const live = d.links.find((l) => l.kind === 'live');
    const code = d.links.find((l) => l.kind === 'code');
    const how = d.how.items;
    list.push({
      slug: p.id, title: d.title, order: d.order,
      aura: auraOf(p, w),
      paper: w?.ground.frame ?? w?.ground.base ?? '#17191e',
      raised: w?.ground.raised ?? w?.ground.frame ?? '#1f2227',
      wordmark, wmClass: [wm?.case === 'lower' ? 'wm-lower' : wm?.case === 'upper' ? 'wm-upper' : '', wm?.dot ? 'wm-dot' : ''].filter(Boolean).join(' '),
      meta, metaLong: [meta, started].filter(Boolean).join(' · '),
      summary: d.summary,
      facts: ([['Role', d.role], ['Runs on', d.runsOn], ['Stack', d.stack]] as [string, string | undefined][]).filter((f): f is [string, string] => !!f[1]),
      prints, steps,
      outcome: d.what.text,
      numbers: d.what.numbers,
      quote: d.why.quote,
      how: how?.length ? how : undefined,
      howLayers: how?.length ? d.how.layers : undefined,
      live: live ? { label: live.label, href: live.href, fill: d.accent.fill ?? (w && fills(w) ? w.accent.color : d.accent.color), ink: w?.accent.ink ?? '#121214' } : undefined,
      code: code ? { label: code.label, href: code.href } : undefined,
      linksNote: d.linksNote,
      obj: { name: d.object, poster: poster(d.object), idle: objVideos(d.object, 'idle'), spin: objVideos(d.object, 'spin'), spinPhone: objVideos(d.object, 'spin-640') },
      heroClip,
      props,
      art: artUrls[`./art/${p.id}.svg`] ? { url: artUrls[`./art/${p.id}.svg`], stops: stopsOf(artRaw[`./art/${p.id}.svg`]) } : undefined,
      tags: (d.stack ?? '').split(/\s*·\s*/).filter(Boolean).slice(0, 3),
      kind: (d.stack ?? d.runsOn).split(/\s*[·,]\s*/)[0],
      href: url(`${base.replace(/^\/|\/$/g, '')}/work/${p.id}/`),
      home,
    });
  }
  list.forEach((m, i) => { const n = list[(i + 1) % list.length]; if (n !== m) m.next = { slug: n.slug, title: n.title, href: n.href }; });
  return list;
}

/** For the static twins: unused placeholders are never printed (tests/e2e/placeholders.spec.ts). */
export const shown = (v: unknown) => v !== undefined && v !== null && !isPlaceholder(v);
