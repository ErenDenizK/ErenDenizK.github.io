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
    })
    .refine((e) => e.kind === 'note' || (e.title && e.dek), 'entries and essays need a title and a dek')
    .refine((e) => e.kind !== 'note' || !e.title, 'notes have no title (log.md §3.1)')
    .refine((e) => !e.image || e.imageAlt, 'an image needs imageAlt (log.md §7.3)')
    .refine((e) => e.kind !== 'note' || (!e.version && !e.key && !e.image), 'a note has no version, key line or image (log.md §3.1)'),
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
    about: z.object({
      kicker: z.string(),
      title: z.string(),
      ledes: z.array(z.string()),
      courtyard: z.object({ alt: z.string(), caption: z.string() }),
      selfie: z.object({ alt: z.string(), caption: z.string() }),
      /** The ID card on About (brief §7, 2026-10-09: "a digital ID card like event badges"). */
      card: z.object({
        label: z.string(),
        issued: z.string(),
        back: z.string(),
        hint: z.object({ drag: z.string(), click: z.string(), tap: z.string() }),
      }),
      facts: z.array(z.tuple([z.string(), z.string()])),
      tracks: z.object({
        title: z.string(),
        items: z.array(z.object({ label: z.string(), title: z.string(), text: z.string(), list: z.array(z.string()) })),
        both: z.string(),
      }),
      colophon: z.array(z.tuple([z.string(), z.string()])),
      now: z.object({ label: z.string(), text: z.string() }),
    }),
  }),
});

export const collections = { projects, log, site };
