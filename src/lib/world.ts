/* A product's world inside its embassy (docs/design/family.md §3.1), read from the family kit's contract
   (docs/family-kit/presentation.md): content/projects/<slug>/world.json and its captures/ folder.
   Here the world becomes CSS custom properties, the kit's light field (light.css markup, drawn at build
   time so it is there without JavaScript) and responsive captures. Nothing here knows a product. */
import { getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { toLinear } from '../../docs/family-kit/springs.js';
import { url } from './site';

export type World = CollectionEntry<'worlds'>['data'];
type Spring = World['motion']['press'];

export async function getWorld(slug: string): Promise<World | null> {
  const e = await getEntry('worlds', slug);
  return e?.data ?? null;
}

const curve = (s: Spring, fallback: { easing: string; duration: number }) => (s ? toLinear(s) : fallback);

/** The world's tokens, scoped to the embassy: styles/embassy.css re-points the house names (--ink,
    --read, --rule ...) at these inside .emb, so every existing component takes the product's colours. */
export function worldVars(w: World): string {
  const press = curve(w.motion.press, { easing: 'ease-out', duration: 120 });
  const settle = curve(w.motion.settle, { easing: 'ease-out', duration: 300 });
  const g = w.accent.gradient;
  const display = w.fonts.display ?? w.fonts.ui;
  const v: Record<string, string | number | undefined> = {
    '--w-ground': w.ground.base, '--w-frame': w.ground.frame ?? w.ground.base, '--w-raised': w.ground.raised ?? w.ground.frame ?? w.ground.base,
    '--w-hair': w.ground.hairline ?? 'rgba(255, 255, 255, 0.1)',
    '--w-ink': w.ink.primary, '--w-ink2': w.ink.secondary, '--w-ink3': w.ink.tertiary ?? w.ink.secondary, '--w-link': w.ink.link ?? w.ink.primary,
    '--w-accent': w.accent.color, '--w-accent-ink': w.accent.ink, '--w-accent-light': w.accent.light ?? w.accent.color,
    '--w-accent-fill': g ? `linear-gradient(${g.angle}deg in srgb, ${g.stops.join(', ')})` : w.accent.color,
    '--w-radius': `${w.accent.radius ?? 999}px`,
    '--w-face': w.fonts.ui.stack, '--w-btn-w': w.fonts.ui.weights?.includes(500) ? 500 : (w.fonts.ui.weights?.at(-1) ?? 500), '--w-ui-t': `${w.fonts.ui.tracking ?? 0}em`,
    '--w-display': display.stack, '--w-display-w': display.weights?.at(-1) ?? 600, '--w-display-t': `${display.tracking ?? -0.02}em`,
    '--w-display-s': `${display.size ?? 28}px`, '--w-display-lh': display.lineHeight && display.size ? (display.lineHeight / display.size).toFixed(3) : 1.2,
    '--w-press': w.motion.pressScale?.mouse ?? 0.97, '--w-press-touch': w.motion.pressScale?.touch ?? w.motion.pressScale?.mouse ?? 0.97,
    '--w-press-d': `${press.duration}ms`, '--w-press-e': press.easing,
    '--w-settle-d': `${settle.duration}ms`, '--w-settle-e': settle.easing,
  };
  return Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${k}: ${x}`).join('; ');
}

/** The kit's light field (light.js mountField, written out at build time): one .kl-field with one cap,
    sources at their centre and size in % of the field, pigments offset by i/n of their cycle. */
export function field(slug: string, w: World) {
  const l = w.light;
  return {
    cap: l.cap,
    behaviour: l.behaviour,
    event: l.event,
    sources: l.sources.map((s, i) => {
      const [x, y] = s.at ?? [50, 50];
      const [sw, sh] = s.size ?? [70, 70];
      const st = [`--kl-x: ${x}%`, `--kl-y: ${y}%`, `--kl-w: ${sw}%`, `--kl-h: ${sh}%`];
      if (s.drift) {
        st.push(`--kl-drift: ${s.drift.period}s`, `--kl-drift-phase: ${s.drift.phase ?? 0}s`);
        /* the product's own path (world.json drift.path) replaces the kit's generic one */
        if (s.drift.path) st.push(`animation-name: emb-${slug}-${i}`);
      }
      const n = s.pigments.length;
      return {
        style: st.join('; '),
        pigments: s.pigments.map((color, k) => {
          const ps = [`--kl-color: ${color}`];
          const cycled = n > 1 && !!s.cycle;
          if (cycled) ps.push(`--kl-cycle: ${s.cycle!.period}s`, `--kl-cycle-phase: ${(s.cycle!.phase ?? 0) - ((n - k) % n) * (s.cycle!.period / n)}s`);
          return { style: ps.join('; '), n: cycled ? n : undefined, first: k === 0 };
        }),
      };
    }),
    keyframes: l.sources.map((s, i) => s.drift?.path
      ? `@keyframes emb-${slug}-${i}{${s.drift.path.map(([at, t]) => `${at}%{transform:${t}}`).join('')}}`
      : '').join(''),
  };
}

/* ---- captures ---- */

const masters = import.meta.glob<{ default: ImageMetadata }>('/content/projects/*/captures/*.png', { eager: true });

export type Shot = {
  id: string; alt: string; caption?: string; at?: string; shot: string;
  frame: 'wide' | 'phone'; img: ImageMetadata;
  video?: { src: string; type: string }[]; duration?: number;
};
/* Codec strings for what tools/captures/clip.mjs writes; the level follows the frame size (a wide clip of
   1440 x 900 is level 4.0 in all three codecs, a phone clip of 390 x 844 level 3.x). A wrong string makes a
   browser skip a source it could play, so tests/worlds.mjs reads the levels back with ffprobe. */
const TYPES: Record<'wide' | 'phone', Record<string, string>> = {
  wide: { av1: 'video/mp4; codecs="av01.0.08M.10"', hevc: 'video/mp4; codecs="hvc1.2.4.L120.B0"', h264: 'video/mp4; codecs="avc1.640028"' },
  phone: { av1: 'video/mp4; codecs="av01.0.04M.10"', hevc: 'video/mp4; codecs="hvc1.2.4.L90.B0"', h264: 'video/mp4; codecs="avc1.64001e"' },
};

/** A capture chosen in the project's frontmatter, resolved against its world.json entry and the master
    file beside it. A missing id or file fails the build, so a typo never ships an empty frame. */
export function shot(slug: string, w: World, pick: { id: string; at?: string; caption?: string }, kind: 'screen' | 'signature' = 'screen'): Shot {
  const c = w.captures.find((x) => x.id === pick.id);
  if (!c || c.kind !== kind) throw new Error(`${slug}: world.json has no ${kind} capture "${pick.id}"`);
  const png = c.files.find((f) => f.endsWith('.png'));
  const img = png && masters[`/content/projects/${slug}/${png}`]?.default;
  if (!img) throw new Error(`${slug}: capture "${c.id}" needs its PNG master in content/projects/${slug}/captures/`);
  const alt = c.alt ?? c.caption;
  const frame = c.viewport[0] < 600 ? 'phone' : 'wide';
  const video = kind === 'signature'
    ? c.files.filter((f) => f.endsWith('.mp4')).map((f) => ({ src: url(`media/captures/${slug}/${f.split('/').pop()}`), type: TYPES[frame][f.split('.').at(-2)!] ?? 'video/mp4' }))
    : undefined;
  return {
    id: c.id, alt, caption: pick.caption ?? c.caption, at: pick.at, shot: c.shot,
    frame, img, video, duration: c.durationSeconds,
  };
}
