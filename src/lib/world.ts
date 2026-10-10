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

/** A gradient is the button's fill only when it starts at the accent (English Prep's Sakura pair); a
    gradient that does not (Recto's mark gradient) belongs to the mark, and the button keeps the one accent. */
export const fills = (w: World) => !!w.accent.gradient && w.accent.gradient.stops[0].toLowerCase() === w.accent.color.toLowerCase();

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
    '--w-accent-fill': fills(w) ? `linear-gradient(${g!.angle}deg in srgb, ${g!.stops.join(', ')})` : w.accent.color,
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
/* Codec strings by the clip's pixel width (viewport x dpr): a phone clip (390 px), a wide one at 1x (1440 px,
   level 4.0 in all three codecs) and a wide one at 2x (2880 px at 60 fps, level 5.1 / 5.2). A wrong string
   makes a browser skip a source it could play, so tests/worlds.mjs reads the levels back with ffprobe. */
export const CLIP_LEVELS = {
  phone: { av1: 4, hevc: 90, h264: 30 }, wide: { av1: 8, hevc: 120, h264: 40 }, hi: { av1: 13, hevc: 153, h264: 52 },
} as const;
export const clipBucket = (px: number) => (px < 600 ? 'phone' : px <= 1920 ? 'wide' : 'hi');
const codec = (kind: string, level: number) => kind === 'av1' ? `av01.0.${String(level).padStart(2, '0')}M.10`
  : kind === 'hevc' ? `hvc1.2.4.L${level}.B0` : `avc1.6400${level.toString(16).padStart(2, '0')}`;

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
  const levels = CLIP_LEVELS[clipBucket(c.viewport[0] * c.dpr)] as Record<string, number>;
  const video = kind === 'signature'
    ? c.files.filter((f) => f.endsWith('.mp4')).map((f) => {
      const k = f.split('.').at(-2)!;
      return { src: url(`media/captures/${slug}/${f.split('/').pop()}`), type: levels[k] ? `video/mp4; codecs="${codec(k, levels[k])}"` : 'video/mp4' };
    })
    : undefined;
  return {
    id: c.id, alt, caption: pick.caption ?? c.caption, at: pick.at, shot: c.shot,
    frame, img, video, duration: c.durationSeconds,
  };
}

/* ---- Work's capture reel (ADR-0014) ---- */

export type Step = { main: Shot; phone: Shot | null; caption?: string; clip: boolean };
type ReelPick = { id: string; phone?: string; caption?: string };

/** The steps of a project's reel on Work: its `reel` field, or else its first three wide captures.
    Each id is looked up in world.json (a screen or the signature clip); a phone id must be a phone
    screen. Unknown ids fail the build, as for the embassy's captures. No world, no reel. */
export function reelSteps(slug: string, w: World | null, data: { reel?: ReelPick[]; captures: { id: string; caption?: string }[] }): Step[] {
  if (!w) return [];
  const kindOf = (id: string) => w.captures.find((c) => c.id === id)?.kind ?? 'screen';
  const picks: ReelPick[] = data.reel
    ?? data.captures.map((c) => ({ id: c.id, caption: c.caption })).filter((c) => shot(slug, w, c).frame === 'wide').slice(0, 3);
  return picks.map((r) => {
    const clip = kindOf(r.id) === 'signature';
    const main = shot(slug, w, { id: r.id, caption: r.caption }, clip ? 'signature' : 'screen');
    const phone = r.phone ? shot(slug, w, { id: r.phone }) : null;
    if (phone && phone.frame !== 'phone') throw new Error(`${slug}: reel phone "${r.phone}" is not a phone capture`);
    return { main, phone, caption: r.caption ?? main.caption, clip };
  });
}
