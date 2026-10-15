import { SITE } from '../data/site';

/**
 * AI crawlers and answer-engine fetchers we explicitly welcome. Each gets its own
 * `Allow: /` group so the intent is visible to anyone reading robots.txt, and so
 * blocking one later is a one-line change. Everything else falls under `User-agent: *`.
 */
export const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI: training, search index, live fetch
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', // Anthropic
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Google-Extended', // Google AI (Gemini, AI Overviews grounding)
  'Applebot-Extended', // Apple Intelligence
  'Amazonbot', 'Meta-ExternalAgent', 'CCBot', // Alexa, Meta AI, Common Crawl
] as const;

export function robotsTxt(): string {
  const groups = AI_CRAWLERS.map((ua) => `User-agent: ${ua}\nAllow: /`);
  return [
    'User-agent: *',
    'Allow: /',
    '',
    ...groups.flatMap((g) => [g, '']),
    `Sitemap: ${new URL('/sitemap-index.xml', SITE.url).toString()}`,
    '',
  ].join('\n');
}
