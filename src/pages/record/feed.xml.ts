/* One Atom feed for every kind (log.md §6.2–6.3): newest 50, full content, permanent tag: ids that do
   not change if the domain does. Figures (inline SVG) are replaced by their caption and a link. */
import type { APIRoute } from 'astro';
import { getLog, getSite, abs, entryPath, entrySlug, entryTitle, iso, siteUpdated } from '../../lib/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const site = await getSite();
  const entries = (await getLog()).slice(0, 50);
  const updatedOf = (e: (typeof entries)[number]) =>
    [e.data.date, ...e.data.updated.map((u) => u.date), ...e.data.corrections.map((c) => c.date)].sort((a, b) => b.getTime() - a.getTime())[0];
  const feedUpdated = entries.length ? entries.map(updatedOf).sort((a, b) => b.getTime() - a.getTime())[0] : siteUpdated();
  const items = entries.map((e) => {
    const link = abs(entryPath(e));
    let html = e.rendered?.html ?? '';
    html = html.replace(/<figure class="fig"[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption><\/figure>/g, (_m, cap) => `<p>[Figure: ${cap}] <a href="${link}">See it on the site.</a></p>`);
    if (!html) html = `<p>${esc(e.data.dek ?? '')} <a href="${link}">Read it on the site.</a></p>`;
    return `  <entry>
    <id>tag:erendenizk.github.io,${iso(e.data.date)}:record/${entrySlug(e)}</id>
    <title>${esc(entryTitle(e))}</title>
    <link rel="alternate" type="text/html" href="${link}"/>
    <published>${e.data.date.toISOString()}</published>
    <updated>${updatedOf(e).toISOString()}</updated>
    ${e.data.dek ? `<summary>${esc(e.data.dek)}</summary>` : ''}
    <category term="${esc(e.data.category)}"/>
    <content type="html">${esc(html)}</content>
  </entry>`;
  });
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <id>tag:erendenizk.github.io,2026-10-09:record</id>
  <title>${esc(site.log.title)} · ${esc(site.name)}</title>
  <subtitle>${esc(site.log.dek)}</subtitle>
  <link rel="alternate" type="text/html" href="${abs('record/')}"/>
  <link rel="self" type="application/atom+xml" href="${abs('record/feed.xml')}"/>
  <updated>${feedUpdated.toISOString()}</updated>
  <author><name>${esc(site.name)}</name><uri>${abs()}</uri></author>
  <icon>${abs('icon-192.png')}</icon>
${items.join('\n')}
</feed>
`;
  return new Response(xml, { headers: { 'content-type': 'application/atom+xml; charset=utf-8' } });
};
