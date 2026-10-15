import { describe, expect, it } from 'vitest';
import { htmlToMarkdown, pageMarkdown, llmsTxt, llmsFullTxt, PAGES, formulaRows, absolute } from './markdown';
import { robotsTxt, AI_CRAWLERS } from './robots';
import { pageSchema } from './schema';
import { estimate, FORMULAS, MAX_REPS, TRAINING_PLAN } from './onerm';
import { FAQ, FAQ_EXAMPLES, FORMULA_META, EXAMPLE_SET, CITATION, FORMULAS_COPY, HERO } from '../data/content';
import { SITE } from '../data/site';

describe('htmlToMarkdown()', () => {
  const answer = FAQ.find((f) => f.q.startsWith('If I can bench 225'))!.html;
  it('turns list items into dash bullets and leaves no tags', () => {
    const md = htmlToMarkdown(answer);
    expect(md).toContain(`\n- 225 × 10 ≈ ${estimate(225, 10).max} lb\n`);
    expect(md).not.toMatch(/<[^>]+>/);
  });
  it('keeps paragraphs apart and bolds <b>', () => {
    expect(htmlToMarkdown('<p>One <b>two</b>.</p><p>Three.</p>')).toBe('One **two**.\n\nThree.');
  });
});

describe('index.md matches the page', () => {
  const md = pageMarkdown();
  it('starts with the H1 and description', () => {
    expect(md.startsWith(`# ${SITE.name}\n\n> ${SITE.description}`)).toBe(true);
    expect(md).toContain(`Canonical: ${absolute(SITE.path)}`);
  });
  it('carries the hero and formula prose', () => {
    expect(md).toContain(htmlToMarkdown(HERO.creditHtml));
    expect(md).toContain(FORMULAS_COPY.intro);
    expect(md).toContain(FORMULAS_COPY.rir);
    expect(md).toContain(FORMULAS_COPY.limits);
  });
  it('has every FAQ question as a heading with its answer', () => {
    for (const f of FAQ) {
      expect(md).toContain(`### ${f.q}\n\n${htmlToMarkdown(f.html)}`);
    }
  });
  for (const ex of FAQ_EXAMPLES) {
    it(`FAQ example ${ex.weight} × ${ex.reps} matches the math`, () => {
      expect(md).toContain(`${ex.weight} × ${ex.reps} ≈ ${estimate(ex.weight, ex.reps).max} lb`);
    });
  }
  it('formula table rows come from onerm.ts', () => {
    const { weight: w, reps: r } = EXAMPLE_SET;
    for (const f of FORMULA_META) {
      expect(md).toContain(`| ${f.eq} | ${Math.round(FORMULAS[f.id](w, r))} |`);
    }
    expect(md).toContain(`| Our estimate (Epley and Brzycki average) |  | ${estimate(w, r).max} |`);
    expect(formulaRows().avg).toBe(estimate(w, r).max);
  });
  it('lists the training percentages', () => {
    for (const [pct, reps] of TRAINING_PLAN) expect(md).toContain(`| ${pct}% | ${reps} |`);
  });
  it('ends with the citation block', () => {
    expect(md).toContain(`## ${CITATION.heading}`);
    expect(md).toContain(CITATION.text(SITE.brand, SITE.year, absolute(SITE.path)));
    expect(md).toContain(CITATION.linkHtml(absolute(SITE.path)));
  });
  it('contains no HTML tags outside the link snippet', () => {
    expect(md.replace(CITATION.linkHtml(absolute(SITE.path)), '')).not.toMatch(/<[^>]+>/);
  });
});

describe('citation copy', () => {
  it('states the rep cap from onerm.ts', () => {
    expect(CITATION.method).toContain(`capped at ${MAX_REPS}`);
    expect(FORMULAS_COPY.limits).toContain(`cap input at ${MAX_REPS}`);
  });
  it('uses a descriptive anchor', () => {
    expect(CITATION.linkHtml('https://x.test/')).toBe(`<a href="https://x.test/">${CITATION.anchor}</a>`);
  });
});

describe('llms.txt', () => {
  const txt = llmsTxt();
  it('follows the llms.txt shape: H1, blockquote, sections', () => {
    expect(txt.startsWith(`# ${SITE.name}\n\n> `)).toBe(true);
    expect(txt).toContain('\n## Pages\n');
    expect(txt).toContain('\n## Optional\n');
  });
  it('links every registered page as an absolute markdown URL', () => {
    for (const p of PAGES) {
      expect(txt).toContain(`- [${p.title}](${absolute(p.mdPath)}): ${p.description}`);
      expect(absolute(p.mdPath)).toMatch(/^https:\/\/.+\.md$/);
    }
  });
  it('states the method and citation', () => {
    expect(txt).toContain(CITATION.method);
    expect(txt).toContain(`Cite as: ${CITATION.text(SITE.brand, SITE.year, absolute(SITE.path))}`);
  });
  it('llms-full.txt contains every page body', () => {
    const full = llmsFullTxt();
    for (const p of PAGES) expect(full).toContain(p.body());
  });
});

describe('robots.txt', () => {
  const txt = robotsTxt();
  it('allows everyone and points at the sitemap', () => {
    expect(txt.startsWith('User-agent: *\nAllow: /\n')).toBe(true);
    expect(txt).toContain(`Sitemap: ${absolute('/sitemap-index.xml')}`);
  });
  it('names every AI crawler explicitly', () => {
    for (const ua of AI_CRAWLERS) expect(txt).toContain(`User-agent: ${ua}\nAllow: /`);
  });
});

describe('JSON-LD graph', () => {
  const graph = pageSchema()['@graph'] as Array<Record<string, any>>;
  const byType = (t: string) => graph.find((n) => n['@type'] === t)!;
  it('has Organization and WebSite nodes the app points at', () => {
    const org = byType('Organization'), site = byType('WebSite'), app = byType('WebApplication');
    expect(org.name).toBe(SITE.brand);
    expect(site.publisher).toEqual({ '@id': org['@id'] });
    expect(app.publisher).toEqual({ '@id': org['@id'] });
    expect(app.isPartOf).toEqual({ '@id': site['@id'] });
    expect(app.name).toBe(SITE.name);
  });
  it('FAQ answers are the page strings as plain text', () => {
    const faq = byType('FAQPage');
    expect(faq.mainEntity).toHaveLength(FAQ.length);
    expect(faq.mainEntity[2].acceptedAnswer.text).toContain(`225 × 10 ≈ ${estimate(225, 10).max} lb`);
  });
});
