/* Shared build-time helpers: content queries, URLs under the base path, dates. */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { execSync } from 'node:child_process';

export type Project = CollectionEntry<'projects'>;
export type LogEntry = CollectionEntry<'log'>;
export type Placeholder = { placeholder: string };

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** A site path under the base: url('work/') -> '/Portfolio/work/'. */
export function url(path = ''): string {
  return BASE + path.replace(/^\//, '');
}
/** Absolute URL for meta tags and feeds. */
export function abs(path = ''): string {
  return new URL(url(path), import.meta.env.SITE).href;
}

export async function getSite() {
  const e = await getEntry('site', 'site');
  if (!e) throw new Error('content/site.json is missing');
  return e.data;
}

const showDrafts = import.meta.env.DEV || process.env.DRAFTS === '1';
/** Sample record entries (content/log/2026/sample-*) are on until the owner writes real ones. */
const showSamples = process.env.SAMPLES !== '0';

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => showDrafts || !p.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getLog(): Promise<LogEntry[]> {
  const all = await getCollection('log', (e) => (showDrafts || !e.data.draft) && (showSamples || !e.data.sample));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id));
}

export const projectPath = (p: Project | string) => `work/${typeof p === 'string' ? p : p.id}/`;
/** The frozen slug is the file name (log.md §6.1). */
export const entrySlug = (e: LogEntry) => e.id.split('/').pop()!;
export const entryYear = (e: LogEntry) => String(e.data.date.getUTCFullYear());
export const entryPath = (e: LogEntry) => `record/${entryYear(e)}/${entrySlug(e)}/`;

const MON = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const MONTH = 'January February March April May June July August September October November December'.split(' ');
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const dayMon = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
export const dayMonYear = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const longDate = (d: Date) => `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const monYear = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
/** "2026-09" -> "Sep 2026" / "September 2026". */
export const ym = (s: string, long = false) => {
  const [y, m] = s.split('-').map(Number);
  return `${(long ? MONTH : MON)[m - 1]} ${y}`;
};

/** A note has no title; its page and feed title is "Note, 6 Oct 2026" (log.md §3.1). */
export const entryTitle = (e: LogEntry) => e.data.title ?? `Note, ${dayMonYear(e.data.date)}`;
export const kindLabel = { note: 'Note', entry: 'Entry', essay: 'Essay' } as const;
export const categoryLabel = (c: string) => c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');

/** Reading time for essays only: 230 words a minute, rounded, at least 1 (log.md §3.4). */
export function readingMinutes(body = ''): number {
  const words = body.replace(/<[^>]+>|[#>*_`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function isPlaceholder(v: unknown): v is Placeholder {
  return !!v && typeof v === 'object' && 'placeholder' in (v as object);
}

/** "Updated <date>" in footers: the last commit, never typed by hand (requirements §12). */
let updatedCache: Date | null = null;
export function siteUpdated(): Date {
  if (updatedCache) return updatedCache;
  try {
    const s = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    updatedCache = s ? new Date(s) : new Date();
  } catch {
    updatedCache = new Date();
  }
  return updatedCache;
}

/** Threads (log.md §5.4): each project as marks on one time axis shared by all threads.
    A project gets a thread once it has three entries in at least two different months. */
export type Thread = {
  project: Project;
  count: number;
  since: Date;
  line: [number, number];
  marks: { x: number; kind: LogEntry['data']['kind'] }[];
  ticks: { x: number; h: number }[];
};
export function threads(entries: LogEntry[], projects: Project[]) {
  if (!entries.length) return { rows: [] as Thread[], axis: null };
  const times = entries.map((e) => e.data.date.getTime());
  const first = new Date(Math.min(...times)), last = new Date(Math.max(...times));
  const a0 = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1);
  const a1 = Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 1);
  const span = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth() + 1;
  const X = (ms: number) => +(2 + 96 * (ms - a0) / (a1 - a0)).toFixed(2); // percent, 2 % padding
  const rows: Thread[] = [];
  for (const p of projects) {
    const mine = entries.filter((e) => e.data.projects.some((r) => r.id === p.id));
    const months = new Map<string, number>();
    for (const e of mine) { const k = iso(e.data.date).slice(0, 7); months.set(k, (months.get(k) || 0) + 1); }
    if (mine.length < 3 || months.size < 2) continue;
    const t = mine.map((e) => e.data.date.getTime());
    rows.push({
      project: p,
      count: mine.length,
      since: new Date(Math.min(...t)),
      line: [X(Math.min(...t)), X(Math.max(...t))],
      marks: span <= 18 ? mine.map((e) => ({ x: X(e.data.date.getTime()), kind: e.data.kind })) : [],
      ticks: span > 18 ? [...months].map(([m, n]) => ({ x: X(Date.UTC(+m.slice(0, 4), +m.slice(5, 7) - 1, 15)), h: 4 + 4 * Math.min(n, 4) })) : [],
    });
  }
  const years: { x: number; label: string }[] = [];
  for (let y = first.getUTCFullYear() + 1; y <= last.getUTCFullYear(); y++) years.push({ x: X(Date.UTC(y, 0, 1)), label: String(y) });
  return { rows, axis: { start: monYear(first), end: monYear(last), years } };
}

/** Entries about one project, newest first (the log is already sorted). */
export const entriesFor = (p: Project, log: LogEntry[]) => log.filter((e) => e.data.projects.some((r) => r.id === p.id));

/** The project Home's showcase leads with (data, not code): the first marked `featured`; without
    one, the project of the latest record entry; without entries, the first by order. */
export function leadProject(projects: Project[], log: LogEntry[]): Project {
  const marked = projects.find((p) => p.data.featured);
  if (marked) return marked;
  for (const e of log) {
    const p = projects.find((x) => e.data.projects.some((r) => r.id === x.id));
    if (p) return p;
  }
  return projects[0];
}

/** "Public beta · 1.0.0-beta · since Sep 2026": the short status line; unwritten facts are left out. */
export function statusLine(p: Project): string {
  const d = p.data;
  const bits: string[] = [d.status];
  if (d.version && !isPlaceholder(d.version)) bits.push(d.version);
  if (!isPlaceholder(d.started)) bits.push('since ' + ym(d.started));
  return bits.join(' · ');
}

/* ---------- the record's own helpers (docs/design/log.md §4–§5, amended 2026-10-09) ---------- */

/** The colour a project shows on black: its glow where lime would go olive, otherwise its accent. */
export const projectColor = (p: Project) => p.data.accent.glow ?? p.data.accent.color;
/** The Record's own light, for entries about no project (readability research C2). */
export const LOG_BLUE = 'var(--log)';

/** An entry's projects, in the order the entry lists them. */
export const entryProjects = (e: LogEntry, projects: Project[]) =>
  e.data.projects.map((r) => projects.find((p) => p.id === r.id)).filter((p): p is Project => !!p);

/** The colours of an entry's spine mark: one per project (at most three), or Log blue. */
export const entryColors = (e: LogEntry, projects: Project[]) => {
  const c = entryProjects(e, projects).map(projectColor).slice(0, 3);
  return c.length ? c : [LOG_BLUE];
};

/** A mark's fill: one colour, or hard-edged slices for an entry about two or three projects. */
export function markFill(colors: string[]): string {
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  return `conic-gradient(from 90deg, ${colors.map((c, i) => `${c} ${(i * step).toFixed(1)}% ${((i + 1) * step).toFixed(1)}%`).join(', ')})`;
}

/** The row shape (log.md §4): a note, an entry, a release (an entry or essay with a version) or an essay. */
export type RowShape = 'note' | 'entry' | 'release' | 'essay';
export const rowShape = (e: LogEntry): RowShape => (e.data.kind === 'note' ? 'note' : e.data.version ? 'release' : e.data.kind);

/** "Recto 1.0.0-beta": the release headline, as the product writes it. */
export const releaseName = (e: LogEntry, projects: Project[]) => {
  const p = entryProjects(e, projects)[0];
  return [p?.data.title, e.data.version].filter(Boolean).join(' ');
};

/** Up to three items of a release, the body's first Markdown list, inline marks stripped (log.md §4). */
export function releaseItems(body = '', max = 3): string[] {
  const out: string[] = [];
  for (const line of body.split('\n')) {
    const m = /^\s{0,3}[-*+]\s+(.+)$/.exec(line);
    if (m) out.push(m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim());
    else if (out.length && line.trim()) break;
    if (out.length === max) break;
  }
  return out;
}

/** The year strip (log.md §5.4, amended): twelve months, a tick per entry in its project's colour,
    stacked when a month is busy. Drawn at build; each month with entries links to its top row in the list. */
export type StripMonth = { label: string; long: string; ticks: { color: string; shape: RowShape }[]; first: string | null };
export function yearStrip(year: string, entries: LogEntry[], projects: Project[]): StripMonth[] {
  const mine = entries.filter((e) => entryYear(e) === year);
  return MON.map((label, m) => {
    const inMonth = mine.filter((e) => e.data.date.getUTCMonth() === m);   // newest first, as the list
    const oldestFirst = [...inMonth].reverse();
    return {
      label,
      long: MONTH[m],
      ticks: oldestFirst.map((e) => ({ color: entryColors(e, projects)[0], shape: rowShape(e) })),
      first: inMonth.length ? entrySlug(inMonth[0]) : null,   // the month's top row in the newest-first list
    };
  });
}

/** One row of project links appears above the list from this many entries (readability research §8). */
export const PROJECT_LINKS_FROM = 40;
