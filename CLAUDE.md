# CLAUDE.md

One-rep max calculator built as a **linkable asset**: a free, mobile-first tool that earns links from coaches, lifters and fitness writers, and anchors a topical cluster around strength training. Read `docs/PRD.md` before building features and `docs/topical-map.md` before creating pages.

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm test          # Vitest: formula math + FAQ-copy consistency
npm run build     # astro check + static build to dist/
```

Deploys to Vercel as a static Astro site (no adapter needed). Run `npm test && npm run build` before every commit.

## Architecture

```
src/
  pages/index.astro        Landing + calculator. Step 1 and all SEO content are server-rendered.
  layouts/Base.astro       <head>: meta, canonical, OG, fonts, JSON-LD
  components/              One component per landing section (Hero, HowItWorks, LiftPicker,
                           Testimonials, Formulas, Faq, Footer, Laurel)
  scripts/flow.ts          Client-side steps 2–5, calculating beat, results (renders into #flow)
  scripts/carousel.ts      Auto-advancing testimonials with pause control
  lib/onerm.ts             ALL math. Pure functions. Single source of truth for every number.
  lib/onerm.test.ts        Tests, including "FAQ copy matches the math"
  lib/schema.ts            JSON-LD @graph (WebApplication + FAQPage), built from src/data
  data/                    site.ts (brand/URL), flow.ts (answer options), content.ts (copy)
  styles/global.css        Design tokens + all styles
```

## Rules

**Math**
- Every number shown anywhere (results, formula table, FAQ examples) comes from `src/lib/onerm.ts`. Never hard-code a computed value in copy without a test asserting it (see `FAQ copy matches the math`).
- Our estimate = average of Epley and Brzycki, after adding reps in reserve to reps. A single (1 rep) returns the weight itself. Reps are capped at 10.

**SEO**
- Content that should rank must be server-rendered in `.astro` components, never injected by client JS. The flow in `scripts/flow.ts` is for interaction only.
- Schema text is generated from the same strings rendered on the page (`lib/schema.ts` → `htmlToText`). Don't write schema copy by hand.
- One H1 per page. Question-style H2/H3s should match real query phrasing from `docs/topical-map.md`.
- Internal links to spoke pages use descriptive anchors ("bench press max calculator"), not "click here".

**Design system** (tokens live at the top of `global.css`)
- Ground `#F4F2EE`, ink `#16150F`, accent `#E0582B` (text-on-light accent `#B8431C`), laurel gold `#B08A3E`. Dark mode redefines the same tokens.
- Type: Archivo (display, condensed via `font-stretch`) + Instrument Sans (text).
- Mobile first at 390×844. On the landing page, the lift picker ("Which lift did you do?" + four tiles) must stay above the fold on a standard iPhone. Check this after any change above it.
- Touch targets ≥44px. Text contrast ≥4.5:1. Respect `prefers-reduced-motion`. Every auto-moving element needs a pause control.

**Flow UX** (progressive disclosure, micro-conversions)
- One question per screen. Step 1 (lift) has Bench preselected and a Continue button, so the select-then-continue pattern is clear. Later single-choice steps auto-advance ~180ms after the tap. Typed inputs get a Continue button.
- Order: lift → reps → how close to failure → weight → compare (sex, age group, bodyweight). The compare step always offers "Skip, just show my max."
- Answered steps show as editable chips under the progress bar.

**Copy**
- Sentence case, plain verbs, no exclamation marks. Buttons say what happens ("Calculate my max").
- Bracketed values like `[12.4k]`, `[62%]`, `[SOURCE]`, `[Name]` are placeholders. Never ship them and never replace them with invented numbers or people. Testimonials must be real and consented (FTC 2024 rule on fake reviews).

## Placeholders to resolve before launch

Search the repo for `[` and `TODO`:
- Domain: `astro.config.mjs` `site`, `src/data/site.ts`, `public/robots.txt`
- Brand name and logo
- Users count in the proof row
- Percentile data + source for the ranking (see PRD, "Comparison data")
- Real testimonials
- Footer link targets and Privacy/Terms pages
