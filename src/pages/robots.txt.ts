import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/robots';

/** Generated so the domain comes from src/data/site.ts like everything else. */
export const GET: APIRoute = () =>
  new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
