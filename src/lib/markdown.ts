/**
 * Markdown and llms.txt builders. Pure functions over src/data and src/lib/onerm.ts,
 * so the markdown alternates carry exactly the copy and numbers the HTML page shows.
 * Served by the endpoints in src/pages (index.md.ts, llms.txt.ts, llms-full.txt.ts).
 */
import { SITE } from '../data/site';
import { LIFTS } from '../data/flow';
import { HOW_IT_WORKS, HERO, FORMULAS_COPY, FORMULA_META, EXAMPLE_SET, FAQ, CITATION } from '../data/content';
import { FORMULAS, estimate, TRAINING_PLAN } from './onerm';

/** Absolute URL on the site. */
export function absolute(path: string): string {
  return new URL(path, SITE.url).toString();
}

/** Markdown from the same HTML strings the page renders (see htmlToText in schema.ts). */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<li>/g, '- ')
    .replace(/<\/li>/g, '\n')
    .replace(/<\/p>|<\/ul>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Rows of the formula comparison table, shared by Formulas.astro and the markdown. */
export function formulaRows() {
  const { weight: w, reps: r } = EXAMPLE_SET;
  const rows = FORMULA_META.map((f) => ({ ...f, value: Math.round(FORMULAS[f.id](w, r)) }));
  return { w, r, rows, avg: estimate(w, r).max };
}

function table(header: string[], body: string[][]): string {
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [line(header), line(header.map(() => '---')), ...body.map(line)].join('\n');
}

/** The landing page as markdown. */
export function pageMarkdown(): string {
  const url = absolute(SITE.path);
  const C = FORMULAS_COPY;
  const { w, r, rows, avg } = formulaRows();
  const parts: string[] = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    `Canonical: ${url}  \nMarkdown: ${absolute('/index.md')}`,
    htmlToMarkdown(HERO.ledeHtml),
    htmlToMarkdown(HERO.creditHtml),
    '## How it works',
    HOW_IT_WORKS.map((t, i) => `${i + 1}. ${t}`).join('\n'),
    `Lifts covered: ${LIFTS.map((l) => l.title.toLowerCase()).join(', ')}.`,
    `## ${C.heading}`,
    C.intro,
    `**${C.epley.name}**: ${C.epley.eq}. ${C.epley.note}`,
    `**${C.brzycki.name}**: ${C.brzycki.eq}. ${C.brzycki.note}`,
    C.comparison(w, r),
    table(
      ['Formula', 'Equation', `${w} × ${r}`],
      [
        ...rows.map((f) => [`${f.name} (${f.year}${f.used ? ', in our average' : ''})`, f.eq, String(f.value)]),
        ['Our estimate (Epley and Brzycki average)', '', String(avg)],
      ],
    ),
    `### ${C.rirHeading}`,
    C.rir,
    `### ${C.limitsHeading}`,
    C.limits,
    '## Training weights as a percentage of your max',
    table(['% of max', 'Reps'], TRAINING_PLAN.map(([pct, reps]) => [`${pct}%`, reps])),
    '## One-rep max FAQ',
    ...FAQ.flatMap((f) => [`### ${f.q}`, htmlToMarkdown(f.html)]),
    `## ${CITATION.heading}`,
    CITATION.intro,
    `**Method.** ${CITATION.method}`,
    `Citation: ${CITATION.text(SITE.brand, SITE.year, url)}`,
    `Link HTML: \`${CITATION.linkHtml(url)}\``,
  ];
  return parts.join('\n\n') + '\n';
}

/** Every page that has a markdown alternate. Spoke pages register here. */
export const PAGES = [
  { path: SITE.path, mdPath: '/index.md', title: SITE.name, description: SITE.description, body: pageMarkdown },
] as const;

/** /llms.txt, per the llms.txt convention: H1, summary blockquote, context, link lists. */
export function llmsTxt(): string {
  const url = absolute(SITE.path);
  return [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    `${CITATION.method} Every number on the site comes from the same published formulas, and every page is available as markdown at the links below.`,
    `Cite as: ${CITATION.text(SITE.brand, SITE.year, url)}`,
    '## Pages',
    PAGES.map((p) => `- [${p.title}](${absolute(p.mdPath)}): ${p.description}`).join('\n'),
    '## Optional',
    [
      `- [Full content](${absolute('/llms-full.txt')}): every page above in one file`,
      `- [Sitemap](${absolute('/sitemap-index.xml')})`,
    ].join('\n'),
  ].join('\n\n') + '\n';
}

/** /llms-full.txt: every page's markdown in one file. */
export function llmsFullTxt(): string {
  return PAGES.map((p) => p.body()).join('\n---\n\n');
}
