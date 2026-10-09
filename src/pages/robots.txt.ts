import type { APIRoute } from 'astro';
import { abs } from '../lib/site';
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap-index.xml')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
