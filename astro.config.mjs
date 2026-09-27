// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://example.com', // TODO: real domain (keep in sync with src/data/site.ts)
  // Pages are prerendered by default. Share pages and images (src/pages/r/) opt out with
  // `prerender = false` and run as Vercel functions.
  adapter: vercel(),
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
});
