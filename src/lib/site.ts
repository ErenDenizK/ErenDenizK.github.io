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

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => showDrafts || !p.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getLog(): Promise<LogEntry[]> {
  const all = await getCollection('log', (e) => showDrafts || !e.data.draft);
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
