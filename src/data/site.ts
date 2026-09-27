/** Brand and URL placeholders. Replace before launch — search the repo for "[" to find the rest. */
export const SITE = {
  brand: '[Brand]',
  url: 'https://example.com', // TODO: real domain (also set `site` in astro.config.mjs)
  path: '/', // calculator lives at the root for now
  title: 'One-Rep Max Calculator: Estimate Your 1RM and See How You Compare',
  description:
    'Free one-rep max calculator. Enter one hard set to estimate your 1RM for bench, squat, deadlift or press, get training weights, and see how you compare.',
  usersCount: '[12.4k]+', // TODO: real number, or remove the proof row
  year: 2026,
  /**
   * Social handles, without the @. Empty = left out. When set, X posts add "via @handle" and the
   * Instagram caption tags the account. TODO: real handles.
   */
  social: { x: '', instagram: '' },
  /** Hashtags appended to the Instagram caption. */
  hashtags: ['1RM', 'strengthtraining'],
};
