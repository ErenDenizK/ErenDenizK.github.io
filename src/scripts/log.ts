/* The record (docs/design/log.md §5.3, amended 2026-10-09): no controls until about forty entries;
   then one row of project links, each a plain link to ?project=<slug>. This script only applies that
   query to the list already on the page; without it, the full list shows and the links still load. */
export function initLog() {
  const list = document.getElementById('log-list');
  const nav = document.getElementById('rec-projects');
  if (!list || !nav) return;
  const project = new URLSearchParams(location.search).get('project') || '';
  nav.querySelectorAll<HTMLAnchorElement>('a[data-p]').forEach((a) => {
    if (a.dataset.p === project) a.setAttribute('aria-current', 'page');
  });
  if (!project) return;
  for (const li of list.querySelectorAll<HTMLElement>('.entry')) {
    li.hidden = !(li.dataset.projects || '').split(' ').includes(project);
  }
  list.querySelectorAll<HTMLElement>('.ygroup').forEach((g) => { g.hidden = !g.querySelector('.entry:not([hidden])'); });
}
