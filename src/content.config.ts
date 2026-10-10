/* Content collections (ADR-0002: content is data). Adding a project or a log entry is a new file
   under content/, never a code change. The schemas below are the contract; a bad frontmatter
   fails the build. Field guide: README.md, "Adding content". */
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { WORDMARK_FACES, WORDMARK_FACE_NAMES } from './lib/wordmarks';

/** Text the owner has not written yet: rendered as a dashed "placeholder" tag, never as a claim. */
const placeholder = z.object({ placeholder: z.string() });
const textOrPlaceholder = z.union([z.string(), placeholder]);

/** One section of a case study (what, why, how, learned, next). */
const section = z
  .object({
    text: z.string().optional(),
    items: z.array(z.string()).optional(),
    quote: z.string().optional(),
    numbers: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    placeholder: z.string().optional(),
  })
  .refine((s) => s.text || s.items || s.quote || s.placeholder, 'a section needs text, items, quote or placeholder');

const accent = z.object({
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  glow: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  p2: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  p3: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
});

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

/** The product's name in its own voice (components/Wordmark.astro, docs/research/2026-10-wordmarks.md).
    face: one of lib/wordmarks.ts, in a weight its subset carries; tracking in em; text overrides the
    title as drawn (the title stays the accessible name); color defaults to accent.color ("ink" = the
    house ink); dot appends the signature dot in that colour; image names an SVG logo in
    src/assets/wordmarks/ that replaces the type once a real logo exists. */
const wordmark = z
  .object({
    face: z.enum(WORDMARK_FACE_NAMES),
    weight: z.number().int(),
    tracking: z.number().min(-0.12).max(0.2).default(0),
    case: z.enum(['as-is', 'lower', 'upper']).default('as-is'),
    text: z.string().optional(),
    color: z.union([hex, z.literal('ink')]).optional(),
    dot: hex.optional(),
    image: z.string().regex(/^[a-z0-9-]+\.svg$/).optional(),
  })
  .refine((w) => (WORDMARK_FACES[w.face].weights as readonly number[]).includes(w.weight), {
    message: 'this weight is not in the face\'s subset (lib/wordmarks.ts, tools/fonts/subset.py)',
  });

/** One of the product's captures (its world.json `captures`, by id) chosen for the embassy
    (docs/design/family.md §3.2). `at` places it beside a section (default: the first opens the
    embassy, the rest stand with How); `caption` replaces world.json's caption in the maker's words. */
const pick = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  at: z.enum(['what', 'why', 'how', 'learned', 'next']).optional(),
  caption: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    /** Home leads with this project (the first marked, by order); without one, the project with the
        latest record entry leads, then the first by order. */
    featured: z.boolean().default(false),
    group: z.enum(['directed', 'by-hand']).default('directed'),
    status: z.enum(['Live', 'Public beta', 'In development', 'Paused', 'Archived']),
    statusNote: z.string().optional(),
    teaserMeta: z.string().optional(),
    version: textOrPlaceholder.optional(),
    role: z.string(),
    /** YYYY-MM, or a placeholder while the owner confirms it. */
    started: z.union([z.string().regex(/^\d{4}-\d{2}$/), placeholder]),
    runsOn: z.string(),
    stack: z.string().optional(),
    accent,
    wordmark: wordmark.optional(),
    /** Name of the object in media/objects/<object>/ (ADR-0006). */
    object: z.string(),
    /** Link-preview card id in tools/og/out/<og>.jpg; defaults to the home card. */
    og: z.string().optional(),
    summary: z.string(),
    summaryPlaceholder: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.url(), kind: z.enum(['live', 'code', 'other']) })).default([]),
    linksNote: z.string().optional(),
    /** Real screens from world.json, laid out in the embassy as the product lays them out
        (family.md §3.1); none listed, none shown. */
    captures: z.array(pick).default([]),
    /** The one signature clip (world.json kind "signature"), with an optional phone-sized cut of the
        same gesture for windows under 900 px. One video element either way. */
    clip: z.object({ id: z.string(), phone: z.string().optional(), caption: z.string().optional() }).optional(),
    /** Work's capture reel (ADR-0014): two to four steps shown in one platform frame, stepped by the
        reading position. id: a wide screen or the signature clip in world.json; phone: a phone screen
        shown beside it in a phone frame (a phone-first product); caption replaces world.json's. Left
        out, the reel is the project's first three wide captures; with no captures, the object is the
        picture. */
    reel: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      phone: z.string().regex(/^[a-z0-9-]+$/).optional(),
      caption: z.string().optional(),
    })).max(4).optional(),
    what: section,
    why: section,
    how: section,
    learned: section,
    next: section,
    draft: z.boolean().default(false),
  }),
});

/* The log (docs/design/log.md, accepted 2026-10-09). One file per entry,
   content/log/<year>/<slug>.md|mdx; the file name is the slug and is frozen at publish (§6.1). */
const dated = z.object({ date: z.coerce.date(), note: z.string() });
const log = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: process.env.LOG_DIR || './content/log' }),
  schema: ({ image }) => z
    .object({
      /** note: 1-3 sentences, no title, read whole in the list · entry: a few paragraphs, its own page ·
          essay: long, with figures (§3.1). Every kind has its own page. */
      kind: z.enum(['note', 'entry', 'essay']),
      title: z.string().max(80).optional(),
      dek: z.string().optional(),
      /** Publication date; never changes. */
      date: z.coerce.date(),
      /** Appended after publishing (§3.5); the body carries the dated block too. */
      updated: z.array(dated).default([]),
      /** Changed facts (§3.6). */
      corrections: z.array(z.object({ date: z.coerce.date(), was: z.string(), now: z.string() })).default([]),
      /** One category, open vocabulary: personal, work, school, ... (§3.7). */
      category: z.string().regex(/^[a-z][a-z-]*$/),
      /** Projects the entry is about (§3.8); they draw the threads. */
      projects: z.array(reference('projects')).default([]),
      /** Drawings from tools/illustrations used in the body (MDX: <Figure name="..." />). */
      figures: z.array(z.string()).default([]),
      /** Essay only: the figure whose plate shows in the index. */
      lead: z.string().optional(),
      /** A version shipped (§3.2a): the row takes the release look, "Recto 1.0.0-beta" in the project's
          colour, with the body's first three list items under it. Written as the product writes it. */
      version: z.string().max(32).optional(),
      /** One pull-out line on the entry page, only a number or fact the owner stated ("300 pages, no freeze"). */
      key: z.string().max(60).optional(),
      /** One real image (screenshot, kit render or photo), a path relative to the entry file. It opens the
          entry page at figure width, and is the thumbnail of an essay or a release in the list. */
      image: image().optional(),
      /** What the image shows, for screen readers; required with an image. */
      imageAlt: z.string().optional(),
      /** One sentence under the image saying what to see in it (§7.3). */
      caption: z.string().optional(),
      /** The owner's own next step; closes the entry page as "Next: ..." (omitted if they gave none). */
      next: z.string().optional(),
      /** "more" when the agent did more than edit (§3.9). */
      help: z.enum(['edit', 'more']).default('edit'),
      helpNote: z.string().optional(),
      draft: z.boolean().default(false),
      /** A sample written to test the record's design, not a real entry: tagged "Sample" in the list
          and on its page, and dropped from the build with SAMPLES=0 (delete them before the first release). */
      sample: z.boolean().default(false),
    })
    .refine((e) => e.kind === 'note' || (e.title && e.dek), 'entries and essays need a title and a dek')
    .refine((e) => e.kind !== 'note' || !e.title, 'notes have no title (log.md §3.1)')
    .refine((e) => !e.image || e.imageAlt, 'an image needs imageAlt (log.md §7.3)')
    .refine((e) => e.kind !== 'note' || (!e.version && !e.key && !e.image), 'a note has no version, key line or image (log.md §3.1)'),
});

/* Each product's world inside its embassy (docs/design/family.md §3.1): content/projects/<slug>/world.json,
   the family kit's contract (docs/family-kit/presentation.md, world.schema.json; tests/worlds.mjs
   validates every file against that schema and light.js checkField()). Values are copied from the
   product's own token files, never redrawn; a new project's world is data, never code (ADR-0002).
   This schema names only what the embassy reads; the entry id is the project's slug. */
const hexRe = /^#[0-9a-f]{6}$/;
const springOrNull = z.union([z.object({ duration: z.number(), bounce: z.number().optional() }), z.object({ stiffness: z.number(), damping: z.number() }), z.null()]);
const face = z.object({ family: z.string(), stack: z.string().regex(/^[^;{}<>]*$/), weights: z.array(z.number()).optional(), tracking: z.number().optional(), size: z.number().optional(), lineHeight: z.number().optional() });
const worlds = defineCollection({
  loader: glob({ pattern: '*/world.json', base: './content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.object({
    version: z.literal(1),
    slug: z.string(),
    name: z.string(),
    source: z.object({ repo: z.string(), commit: z.string(), files: z.array(z.string()), date: z.string(), estimated: z.array(z.string()).optional() }),
    ground: z.object({ base: z.string().regex(hexRe), frame: z.string().regex(hexRe).optional(), raised: z.string().regex(hexRe).optional(), hairline: z.string().regex(hexRe).optional() }),
    ink: z.object({ primary: z.string().regex(hexRe), secondary: z.string().regex(hexRe), tertiary: z.string().regex(hexRe).optional(), link: z.string().regex(hexRe).optional() }),
    accent: z.object({
      color: z.string().regex(hexRe), ink: z.string().regex(hexRe), job: z.string(), radius: z.number().optional(), light: z.string().regex(hexRe).optional(),
      gradient: z.object({ stops: z.array(z.string().regex(hexRe)).min(2), angle: z.number() }).optional(),
    }),
    light: z.object({
      behaviour: z.enum(['still', 'event', 'drift']),
      theme: z.enum(['dark', 'light']),
      cap: z.number(),
      sources: z.array(z.object({
        pigments: z.array(z.string().regex(hexRe)).min(1).max(3),
        at: z.tuple([z.number(), z.number()]).optional(),
        size: z.tuple([z.number(), z.number()]).optional(),
        /** path: the product's own keyframes (percent, transform), an embassy extension the kit's drift allows */
        drift: z.object({ period: z.number(), phase: z.number().optional(), path: z.array(z.tuple([z.number(), z.string().regex(/^[^;{}<>]*$/)])).optional() }).passthrough().optional(),
        cycle: z.object({ period: z.number(), phase: z.number().optional() }).passthrough().optional(),
      })),
      event: z.object({ boost: z.number().optional(), settle: z.number().optional() }).optional(),
      note: z.string().optional(),
    }),
    fonts: z.object({ ui: face, display: face.optional(), reading: face.optional() }),
    motion: z.object({
      press: springOrNull, settle: springOrNull, glide: springOrNull, pop: springOrNull,
      pressScale: z.object({ mouse: z.number().optional(), touch: z.number().optional() }).optional(),
      ease: z.string().regex(/^[^;{}<>]*$/).optional(),
      note: z.string().optional(),
    }),
    promise: z.object({ text: z.string(), lang: z.string(), gloss: z.string().optional(), evidence: z.string() }),
    links: z.object({ open: z.string().optional(), code: z.string().optional(), about: z.string().optional() }).optional(),
    captures: z.array(z.object({
      id: z.string(), kind: z.enum(['screen', 'signature']), files: z.array(z.string()).min(1),
      viewport: z.tuple([z.number(), z.number()]), dpr: z.number(), touch: z.boolean().optional(), theme: z.enum(['dark', 'light']).optional(),
      caption: z.string(), alt: z.string().optional(), durationSeconds: z.number().optional(), shot: z.string(),
    })),
  }),
});

const site = defineCollection({
  loader: file('./content/site.json', { parser: (text) => ({ site: JSON.parse(text) }) }),
  schema: z.object({
    name: z.string(),
    nameLines: z.array(z.string()),
    firstName: z.string(),
    mark: z.string(),
    host: z.string(),
    kicker: z.object({ study: z.string(), school: z.string(), schoolShort: z.string(), year: z.string() }),
    lede: z.string(),
    description: z.string(),
    links: z.object({ github: z.url(), linkedin: z.union([z.url(), placeholder]) }),
    now: z.object({ label: z.string(), text: z.string() }),
    home: z.object({ showcase: z.object({ title: z.string(), all: z.string(), kicker: z.string(), cta: z.string(), also: z.string() }) }),
    work: z.object({
      kicker: z.string(), title: z.string(), dek: z.string(), byHand: z.string(),
      /** The one way into a project's focus view from its section. */
      cta: z.string(),
      /** Catalog group headings; a group with no projects is left out. */
      groups: z.object({ directed: z.string(), byHand: z.string() }),
    }),
    log: z.object({ title: z.string(), dek: z.string(), writingNote: z.string(), empty: z.string() }),
    /** About is an "about me" article (brief, About, 2026-10-10 evening): the ID card, a short opening,
        then chapters in the owner's voice. Each chapter is a rung of the rail (ADR-0013). */
    about: z.object({
      kicker: z.string(),
      title: z.string(),
      opening: z.string(),
      selfie: z.object({ alt: z.string(), caption: z.string() }),
      /** The ID card on About (brief §7, 2026-10-09: "a digital ID card like event badges"). */
      card: z.object({
        label: z.string(),
        issued: z.string(),
        back: z.string(),
        hint: z.object({ drag: z.string(), click: z.string(), tap: z.string() }),
      }),
      chapters: z.array(z.object({
        /** the chapter's anchor: about/#<id> */
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string(),
        /** paragraphs */
        text: z.array(z.string()),
        /** a list drawn from elsewhere: the directed projects (title, summary, link) or site.links */
        list: z.enum(['products', 'links']).optional(),
        /** postcards beside the chapter (ADR-0008): one stands in the margin, two or more form a row.
            `photo` is a file stem in content/photos/; run `npm run photos` after adding one. */
        photos: z.array(z.object({
          photo: z.string().regex(/^[a-z0-9-]+$/),
          alt: z.string(),
          note: z.string(),
          place: z.string(),
          date: z.string().optional(),
        })).max(3).optional(),
      })).min(1),
      colophon: z.array(z.tuple([z.string(), z.string()])),
    }),
  }),
});

export const collections = { projects, worlds, log, site };
