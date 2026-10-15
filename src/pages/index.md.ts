import type { APIRoute } from 'astro';
import { pageMarkdown } from '../lib/markdown';

/** Markdown alternate of the landing page (linked from <head> as rel="alternate"). */
export const GET: APIRoute = () =>
  new Response(pageMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
