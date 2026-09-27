import { SITE } from '../data/site';
import { FAQ } from '../data/content';

/** Plain text for schema from the same HTML shown on the page, so they never drift. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\/li>/g, '; ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ ;/g, ';')
    .replace(/:;\s*/g, ': ')
    .replace(/;\s*(The same)/g, '. $1')
    .trim();
}

export function pageSchema() {
  const url = new URL(SITE.path, SITE.url).toString();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: 'One-Rep Max Calculator',
        url,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        description: SITE.description,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: SITE.brand, url: SITE.url },
        about: { '@type': 'Thing', name: 'One-repetition maximum', sameAs: 'https://en.wikipedia.org/wiki/One-repetition_maximum' },
        mentions: [
          { '@type': 'Person', name: 'Boyd Epley', description: 'Founder of the National Strength and Conditioning Association; author of the Epley 1RM formula (1985)' },
          { '@type': 'Person', name: 'Matt Brzycki', description: 'Princeton University strength coach; author of the Brzycki 1RM formula (1993)' },
          { '@type': 'Organization', name: 'National Strength and Conditioning Association', url: 'https://www.nsca.com' },
          { '@type': 'Thing', name: 'Rating of perceived exertion (RPE)' },
          { '@type': 'Thing', name: 'Reps in reserve (RIR)' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: htmlToText(f.html) },
        })),
      },
    ],
  };
}
