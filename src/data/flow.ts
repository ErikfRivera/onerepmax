/** Answer options for the five-step flow. */
export const LIFTS = [
  { id: 'Bench', sub: 'Bench press', label: 'bench', title: 'Bench', defaultLb: 185 },
  { id: 'Squat', sub: 'Back squat', label: 'squat', title: 'Squat', defaultLb: 225 },
  { id: 'Deadlift', sub: 'Conventional or sumo', label: 'deadlift', title: 'Deadlift', defaultLb: 275 },
  { id: 'Press', sub: 'Overhead press', label: 'overhead press', title: 'Overhead press', defaultLb: 115 },
] as const;
export type LiftId = (typeof LIFTS)[number]['id'];

/** Reps in reserve. v is added to the rep count before the formulas run. */
export const RIR = [
  { v: 0, title: 'Couldn’t do another rep', sub: 'True failure', short: 'to failure' },
  { v: 1, title: 'Maybe 1 more', sub: 'Last rep was a grind', short: '1 in reserve' },
  { v: 2, title: '2 more in the tank', sub: 'Hard, but not all-out', short: '2 in reserve' },
  { v: 3, title: '3 or more left', sub: 'Your estimate will be rough', short: '3+ in reserve' },
] as const;

/** Standard powerlifting age classes (IPF / OpenPowerlifting). */
export const AGE_BANDS = [
  ['14–18', 'Sub-junior'], ['19–23', 'Junior'], ['24–39', 'Open'], ['40–49', 'Masters I'],
  ['50–59', 'Masters II'], ['60–69', 'Masters III'], ['70+', 'Masters IV'],
] as const;

export const SEXES = ['Male', 'Female', 'Unspecified'] as const;
