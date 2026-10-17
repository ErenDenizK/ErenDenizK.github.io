/* The person's part's guilloché rosettes as static SVG files (src/one/rest/guilloche.ts says why). */
import type { APIRoute } from 'astro';
import { ROSETTES, rosetteSvg, type RosetteName } from '../../one/rest/guilloche';

export const getStaticPaths = () => Object.keys(ROSETTES).map((name) => ({ params: { name } }));
export const GET: APIRoute = ({ params }) =>
  new Response(rosetteSvg(params.name as RosetteName), { headers: { 'content-type': 'image/svg+xml' } });
