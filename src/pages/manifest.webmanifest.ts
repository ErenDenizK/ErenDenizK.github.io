import type { APIRoute } from 'astro';
import { getSite, url } from '../lib/site';
import { GROUND } from '../lib/theme';
export const GET: APIRoute = async () => {
  const site = await getSite();
  const m = {
    name: site.name, short_name: site.mark, start_url: url(), scope: url(), display: 'browser',
    background_color: GROUND, theme_color: GROUND,
    icons: [
      { src: url('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: url('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: url('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(m, null, 2), { headers: { 'content-type': 'application/manifest+json' } });
};
