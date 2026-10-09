/* The object stage's first paint (ADR-0006 item 3): the poster comes from the object's manifest
   when tools/objects has rendered it (media/objects/<name>/manifest.json), otherwise from the
   interim poster in src/assets/objects/. Everything that moves is loaded later by the client
   (src/scripts/media.ts), which reads the same manifest. */
import { readManifest } from './files.mjs';
import { url } from './site';

const fallbacks = import.meta.glob<string>('../assets/objects/*-poster.webp', { query: '?url', import: 'default', eager: true });

/** The CSS glow colour per object (media carries no glow, media research §8.5). Recto glows with a
    softer green: lime goes olive on black at low alpha (craft audit §5.3). */
export const LIGHTS: Record<string, string> = {
  edk: '#c9d4ff', recto: '#a6d873', englishprep: '#efb1cb', eatmap: '#eb4f6b', log: '#8fb8ff',
};

export type Poster = {
  name: string;
  light: string;
  w: number;
  h: number;
  src: string;
  sources: { type: string; srcset: string }[];
  manifest: string | null;
};

export function poster(name: string): Poster {
  const m = readManifest(name);
  const light = LIGHTS[name] || m?.light || '#c9d4ff';
  if (m?.poster?.sources?.length) {
    const dir = url(`media/objects/${name}/`);
    const byType = new Map<string, string[]>();
    for (const s of m.poster.sources) {
      const list = byType.get(s.type) || [];
      list.push(`${dir}${s.src} ${s.w}w`);
      byType.set(s.type, list);
    }
    const webp = m.poster.sources.filter((s: { type: string }) => s.type === 'image/webp').sort((a: { w: number }, b: { w: number }) => b.w - a.w)[0];
    return {
      name, light, w: m.poster.w, h: m.poster.h,
      src: dir + (webp || m.poster.sources[0]).src,
      sources: [...byType].map(([type, l]) => ({ type, srcset: l.join(', ') })),
      manifest: dir + 'manifest.json',
    };
  }
  const f = fallbacks[`../assets/objects/${name}-poster.webp`];
  if (!f) throw new Error(`no poster for object "${name}": render media/objects/${name}/ or add src/assets/objects/${name}-poster.webp`);
  return { name, light, w: 1200, h: 1200, src: f, sources: [], manifest: null };
}
