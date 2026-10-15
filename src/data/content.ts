/**
 * Page copy. Everything here renders in the HTML components AND in the markdown /
 * llms.txt builders (src/lib/markdown.ts), so the formats can never drift.
 */
import { MAX_REPS } from '../lib/onerm';

export const HOW_IT_WORKS = ['Pick your lift', 'Enter your set', 'Rate the effort', 'See where you rank'];

/** Hero copy. `html` strings carry inline <b> only. */
export const HERO = {
  ledeHtml: 'Find your <b>one-rep max</b>. See how you compare.',
  creditHtml:
    'Uses the two formulas strength coaches rely on most, developed by <b>Boyd Epley</b> (founder of the NSCA) and <b>Matt Brzycki</b> (Princeton strength coach).',
};

/** Formula explainer prose. The equations themselves live in FORMULA_META. */
export const FORMULAS_COPY = {
  heading: 'The one-rep max formulas we use',
  intro:
    'A 1RM calculator turns a hard set into an estimated max with a prediction equation. We use the two most widely cited, Epley and Brzycki, and average them.',
  epley: {
    name: 'Epley formula',
    eq: '1RM = w × (1 + r ÷ 30)',
    note: 'Published in 1985 by Boyd Epley, the University of Nebraska strength coach who founded the National Strength and Conditioning Association.',
  },
  brzycki: {
    name: 'Brzycki formula',
    eq: '1RM = w × 36 ÷ (37 − r)',
    note: 'Published in 1993 by Matt Brzycki, longtime strength coach at Princeton University.',
  },
  comparison: (w: number, r: number) =>
    `Epley reads a little high below 10 reps and Brzycki a little low. At exactly 10 reps they agree, so their average lands in the middle of the published formulas. Here is every major equation for the same set, ${w} lb × ${r} (w is weight, r is reps):`,
  rirHeading: 'Adjusting for reps in reserve',
  rir: 'Every formula assumes your set went to failure. If you had reps left, we add them to your rep count before calculating. This is the reps-in-reserve (RIR) method behind the modern RPE scale, introduced for lifting by Zourdos and colleagues in 2016.',
  limitsHeading: 'Where estimates break down',
  limits: `Formulas agree closely at 2–6 reps and spread apart past ${MAX_REPS}, which is why we cap input at ${MAX_REPS}. Brzycki stops working entirely near 37 reps. Lifters with a lot of endurance training tend to get overestimated; lifters who mostly train heavy singles tend to get underestimated.`,
};

/** Citation block. Rendered on the page (Cite.astro), in index.md and in llms.txt. */
export const CITATION = {
  heading: 'How to cite this calculator',
  intro: 'Link to or quote this page freely. The method and the worked examples are public and identical in every format of this page.',
  method: `Our estimate is the average of the Epley and Brzycki formulas, after adding reps in reserve to the reps you did. A single (1 rep) returns the weight itself. Reps are capped at ${MAX_REPS}.`,
  /** Plain-text citation, APA style. */
  text: (brand: string, year: number, url: string) => `${brand}. (${year}). One-rep max calculator [Web application]. ${url}`,
  /** Descriptive anchor for inbound links (see CLAUDE.md, SEO). */
  anchor: 'one rep max calculator',
  linkHtml: (url: string) => `<a href="${url}">one rep max calculator</a>`,
  formats: 'This page is also available as plain markdown for AI assistants and scripts.',
};

/**
 * SAMPLE testimonials — placeholders only.
 * The FTC's 2024 rule bans fabricated reviews. Replace every entry with a real,
 * consented, attributable quote before launch.
 */
export const TESTIMONIALS = [
  { tag: '[+30 lb bench in 10 weeks]', name: '[Name]', who: '[Recreational lifter, City]',
    quote: 'I’d been guessing my working weights for years. Once I had a real number and the percentage chart, my program finally made sense and my bench started moving again.' },
  { tag: '[First meet: 3 for 3 on squat]', name: '[Name]', who: '[Masters powerlifter, 40–49]',
    quote: 'I never test true maxes, so this was the first honest read on my squat. I picked my meet openers from it and went 3 for 3.' },
  { tag: '[Advanced for my bodyweight]', name: '[Name]', who: '[CrossFit athlete, City]',
    quote: 'Seeing where I rank against women my age and size changed how I think about my training. I stopped comparing myself to guys twice my weight.' },
  { tag: '[Used with 30+ athletes]', name: '[Name], [CSCS]', who: '[Strength coach, Gym name]',
    quote: 'I send every new client here before our first session. It gives us a safe starting max without a risky test day.' },
];

/** Display metadata for the formula comparison table. Values are computed from src/lib/onerm.ts. */
export const FORMULA_META = [
  { id: 'epley', name: 'Epley', year: 1985, eq: 'w × (1 + r ÷ 30)', used: true },
  { id: 'brzycki', name: 'Brzycki', year: 1993, eq: 'w × 36 ÷ (37 − r)', used: true },
  { id: 'lander', name: 'Lander', year: 1985, eq: '100w ÷ (101.3 − 2.67123r)', used: false },
  { id: 'lombardi', name: 'Lombardi', year: 1989, eq: 'w × r^0.10', used: false },
  { id: 'mayhew', name: 'Mayhew et al.', year: 1992, eq: '100w ÷ (52.2 + 41.9e^(−0.055r))', used: false },
  { id: 'oconner', name: 'O’Conner et al.', year: 1989, eq: 'w × (1 + 0.025r)', used: false },
  { id: 'wathen', name: 'Wathen', year: 1994, eq: '100w ÷ (48.8 + 53.8e^(−0.075r))', used: false },
] as const;

/** Worked example used in the formula table. */
export const EXAMPLE_SET = { weight: 225, reps: 5 };

/**
 * FAQ. Questions map to Ahrefs question clusters (see docs/topical-map.md).
 * `html` renders on the page; the schema uses a plain-text version of the same string.
 * Numbers in the "225 for 10" answer are asserted by src/lib/onerm.test.ts.
 */
export const FAQ_EXAMPLES = [
  { weight: 135, reps: 10 }, { weight: 185, reps: 5 }, { weight: 225, reps: 8 }, { weight: 225, reps: 10 },
];

export const FAQ = [
  { q: 'What is a one-rep max (1RM)?',
    html: '<p>Your one-rep max, or 1RM, is the heaviest weight you can lift for a single rep with good form. In the gym it’s the standard way to measure strength on lifts like the bench press, squat and deadlift, and coaches use it to set training weights as a percentage of your max.</p>' },
  { q: 'How do you calculate your one-rep max?',
    html: '<p>Lift a weight you can handle for 2–10 reps, take the set close to failure, then plug the weight and reps into a formula. The Epley formula is weight × (1 + reps ÷ 30). The Brzycki formula is weight × 36 ÷ (37 − reps). This calculator runs both and shows the average, which is safer than testing a true max.</p>' },
  { q: 'If I can bench 225 for 10 reps, what’s my max?',
    html: '<p>About 300 lb. Here are common sets and their estimated max, using the average of Epley and Brzycki:</p><ul><li>135 × 10 ≈ 180 lb</li><li>185 × 5 ≈ 212 lb</li><li>225 × 8 ≈ 282 lb</li><li>225 × 10 ≈ 300 lb</li></ul><p>The same math works for squat, deadlift and overhead press.</p>' },
  { q: 'How accurate is a one-rep max calculator?',
    html: '<p>For sets of 2–6 reps taken close to failure, estimates usually land within a few percent of a tested max. Accuracy drops as reps climb past 10, and some lifters are naturally better at high reps than heavy singles. Treat the number as a starting point for training weights, not a guarantee.</p>' },
  { q: 'How do you test your one-rep max safely?',
    html: '<p>Warm up well, then work up in small jumps: about 5 reps at 50% of your expected max, 3 at 70%, 1 at 80% and 1 at 90%, resting 2–5 minutes between heavy sets. Then attempt your max in 2–3 tries. Always use a spotter or safety pins, and stop if your form breaks down.</p>' },
  { q: 'How can I increase my max bench?',
    html: '<p>Bench 2–3 times a week, spend most sets in the 3–6 rep range at roughly 75–90% of your max, and add a little weight each week. Build your triceps, shoulders and upper back, keep your technique consistent, and eat and sleep enough to recover. Recalculate your max every 4–8 weeks to update your training weights.</p>' },
];

export const FOOTER_LINKS = [
  { label: 'Contact', href: '#' }, // TODO: contact page or mailto
  { label: 'Privacy', href: '#' }, // TODO: /privacy
  { label: 'Terms', href: '#' }, // TODO: /terms
];
