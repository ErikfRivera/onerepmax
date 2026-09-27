# PRD: One-Rep Max Calculator

## Goal

A free, mobile-first 1RM calculator that (1) ranks for "one rep max calculator" / "1rm calculator" (47k + 31k US searches/mo, Ahrefs KD 0, traffic potential ~88k), (2) earns links from coaches, lifters and fitness writers, and (3) acts as the hub for a strength-training topical cluster.

## Users and jobs

- **Lifter**: "Tell me my max from a set I already did, without a risky test day, and tell me what to train with."
- **Lifter (competitive)**: "Show me how I stack up against people like me."
- **Coach / writer**: "Give me a credible tool and method I can link to, embed or cite."

## What ships in v1 (built)

1. **Landing (step 1)**: social proof row, H1, subhead, formula credit (Epley, Brzycki), four-step "How it works" strip, lift picker. Lift picker must sit above the fold at 390×844.
2. **Flow**: reps (1–10) → how close to failure (0/1/2/3+ reps in reserve) → weight (prefilled per lift, lb/kg) → compare (sex: male/female/unspecified, IPF age class, bodyweight) with a skip option → calculating beat (~0.9s) → results.
3. **Results**: estimated max (Epley/Brzycki average, RIR-adjusted), both formula values, percentile vs. comparison group, training-weights table (95–60%), share card + native share.
4. **Below the fold**: auto-advancing testimonials (pausable), formula explainer with all seven published equations, FAQ (6 questions from Ahrefs question clusters), footer.
5. **SEO**: server-rendered content, canonical, OG, sitemap, robots, JSON-LD `@graph` (WebApplication + FAQPage, entities: 1RM → Wikipedia, Epley, Brzycki, NSCA, RPE, RIR).

## Open decisions / next

- **Comparison data** (blocks the ranking): choose a source (OpenPowerlifting raw, tested federations; or own submissions once volume allows), define groups (sex × IPF age class × bodyweight class; "Unspecified" = all lifters), build a percentile lookup table at build time (`src/data/standards.json`), replace `[62%]` and `[SOURCE]`.
- **Share images**: done. `/r/<result>` share pages with a result-specific OG image, plus Instagram story and post images (see CLAUDE.md, Sharing). Next: a "your friend lifted X" banner on the homepage for visitors arriving from a share link.
- **Embed**: `/embed` route with the calculator only + copy-paste iframe snippet and citation.
- **Per-lift pages**: `/bench-press-calculator` etc. with the lift preselected (biggest spoke: "max bench calculator" 21k).
- **Programmatic long tail**: "if I can bench 225 for 10 what is my max" style pages (dozens at 30–70/mo, near-zero KD). Generate from `onerm.ts` with unique tables per page; noindex thin combos.
- **Analytics**: PostHog funnel per step (landing → step 2 … → results), skip rate on compare, share clicks.
- **Real testimonials** collected from results page ("Did this help? Leave a quote").
