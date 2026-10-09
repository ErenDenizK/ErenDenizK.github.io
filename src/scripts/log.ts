/* The record (docs/design/log.md): entries open in place (their title is a link to their page, so
   the page works without JavaScript), a deep link to /record/#<slug> opens that entry, and from 20
   entries the list filters by kind, category and project, carried in the URL (§5.3). */
import { reduce, mq } from './env';

export function initLog() {
  const list = document.getElementById('log-list');
  if (!list) return;
  const setOpen = (li: Element, open: boolean) => {
    li.classList.toggle('open', open);
    li.querySelector('.e-row')?.setAttribute('aria-expanded', String(open));
  };
  list.addEventListener('click', (e) => {
    const me = e as MouseEvent;
    if (me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;
    const a = (e.target as Element).closest('a.e-row:not(.e-link)');
    if (!a) return;
    e.preventDefault();
    const li = a.closest('.entry')!;
    setOpen(li, !li.classList.contains('open'));
  });
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash) {
    const li = document.getElementById(hash);
    if (li && li.classList.contains('entry')) {
      const b = li.querySelector<HTMLElement>('.e-body');
      if (b) { b.style.transition = 'none'; setOpen(li, true); void b.offsetHeight; b.style.transition = ''; }
      li.scrollIntoView({ block: 'start' });
      scrollBy(0, mq.wide.matches ? -100 : -76);
    }
  }

  /* filters */
  const filters = document.getElementById('filters');
  const q = new URLSearchParams(location.search);
  const state = { kind: q.get('kind') || 'all', cat: q.get('cat'), project: q.get('project') };
  const entries = [...list.querySelectorAll<HTMLElement>('.entry')];
  function apply() {
    let n = 0;
    for (const li of entries) {
      const ok = (state.kind === 'all' || li.dataset.kind === state.kind)
        && (!state.cat || li.dataset.cat === state.cat)
        && (!state.project || (li.dataset.projects || '').split(' ').includes(state.project));
      li.hidden = !ok;
      if (ok) n++;
    }
    list!.querySelectorAll<HTMLElement>('.ygroup').forEach((g) => { g.hidden = !g.querySelector('.entry:not([hidden])'); });
    filters?.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind)));
    filters?.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)));
    document.querySelectorAll<HTMLElement>('.threads .thread').forEach((t) => {
      t.setAttribute('aria-current', String(t.dataset.p === state.project));
      t.classList.toggle('dim', !!state.project && t.dataset.p !== state.project);
    });
    const out = document.getElementById('filter-state');
    const any = state.kind !== 'all' || state.cat || state.project;
    if (out) {
      out.replaceChildren();
      if (any) {
        out.append(`Showing ${n} ${n === 1 ? 'entry' : 'entries'}. `);
        const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Show everything';
        b.addEventListener('click', () => { state.kind = 'all'; state.cat = null; state.project = null; sync(); });
        out.append(b);
      }
    }
  }
  function sync() {
    const p = new URLSearchParams();
    if (state.kind !== 'all') p.set('kind', state.kind);
    if (state.cat) p.set('cat', state.cat);
    if (state.project) p.set('project', state.project);
    history.replaceState(history.state, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
    apply();
  }
  filters?.addEventListener('click', (e) => {
    const b = (e.target as Element).closest('button');
    if (!b) return;
    if (b.dataset.kind) state.kind = b.dataset.kind;
    if (b.dataset.cat) state.cat = state.cat === b.dataset.cat ? null : b.dataset.cat;
    sync();
  });
  document.querySelectorAll<HTMLAnchorElement>('.threads a.thread').forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    state.project = state.project === t.dataset.p ? null : t.dataset.p!;
    sync();
    if (!reduce()) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  if (state.kind !== 'all' || state.cat || state.project) apply();
}
