// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com', // TODO: real domain (keep in sync with src/data/site.ts)
  // Markdown and text routes are alternates, not pages: keep them out of the sitemap.
  integrations: [sitemap({ filter: (page) => !/\.(md|txt)$/.test(page) })],
  build: { inlineStylesheets: 'always' },
});
