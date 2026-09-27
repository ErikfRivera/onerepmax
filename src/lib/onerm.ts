/**
 * One-rep max math. Pure functions only — no DOM, no side effects.
 * Every number shown on the site (calculator, formula table, FAQ examples)
 * must come from here so copy and code can never drift apart.
 */

export type Unit = 'lb' | 'kg';

export const LB_PER_KG = 2.20462;
export const MIN_REPS = 1;
export const MAX_REPS = 10;

/** Published 1RM prediction equations. w = weight, r = reps to failure. */
export const FORMULAS = {
  epley: (w: number, r: number) => w * (1 + r / 30),
  brzycki: (w: number, r: number) => (w * 36) / (37 - r),
  lander: (w: number, r: number) => (100 * w) / (101.3 - 2.67123 * r),
  lombardi: (w: number, r: number) => w * Math.pow(r, 0.1),
  mayhew: (w: number, r: number) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
  oconner: (w: number, r: number) => w * (1 + 0.025 * r),
  wathen: (w: number, r: number) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)),
} as const;

export type FormulaId = keyof typeof FORMULAS;

export interface Estimate {
  /** Rounded average of Epley and Brzycki — the number we show. */
  max: number;
  epley: number;
  brzycki: number;
  /** Reps actually used in the formulas (reps done + reps in reserve). */
  effectiveReps: number;
}

/**
 * Estimate a one-rep max from a set.
 * @param weight load on the bar, including the bar
 * @param reps reps completed (1–10)
 * @param rir reps in reserve (0 = true failure). Added to reps before the formulas run.
 */
export function estimate(weight: number, reps: number, rir = 0): Estimate {
  if (!(weight > 0)) return { max: 0, epley: 0, brzycki: 0, effectiveReps: 0 };
  const r = clamp(Math.round(reps), MIN_REPS, MAX_REPS) + Math.max(0, Math.round(rir));
  const e = r === 1 ? weight : FORMULAS.epley(weight, r);
  const b = r === 1 ? weight : FORMULAS.brzycki(weight, r);
  return { max: Math.round((e + b) / 2), epley: Math.round(e), brzycki: Math.round(b), effectiveReps: r };
}

/** Percent-of-max training table, rounded to loadable increments. */
export const TRAINING_PLAN: ReadonlyArray<readonly [pct: number, reps: string]> = [
  [95, '1–2'], [90, '3–4'], [85, '5–6'], [80, '7–8'],
  [75, '9–10'], [70, '11–12'], [65, '13–15'], [60, '16–20'],
];

export function roundTo(unit: Unit): number {
  return unit === 'lb' ? 5 : 2.5;
}

export function trainingTable(max: number, unit: Unit) {
  const step = roundTo(unit);
  return TRAINING_PLAN.map(([pct, reps]) => ({
    pct,
    reps,
    weight: fmt(Math.round((max * pct) / 100 / step) * step),
  }));
}

export function convertWeight(value: number, to: Unit): number {
  return to === 'kg'
    ? Math.round((value / LB_PER_KG) * 2) / 2 // nearest 0.5 kg
    : Math.round((value * LB_PER_KG) / 5) * 5; // nearest 5 lb
}

export function convertBodyweight(value: number, to: Unit): number {
  return Math.round(to === 'kg' ? value / LB_PER_KG : value * LB_PER_KG);
}

/** Sanity warnings for the weight step. Empty string = fine. */
export function weightWarning(weight: number, unit: Unit): string {
  const emptyBar = unit === 'lb' ? 45 : 20;
  const ceiling = unit === 'lb' ? 1200 : 550;
  if (weight > 0 && weight < emptyBar) return 'That’s lighter than an empty bar. Double-check the number.';
  if (weight > ceiling) return 'That’s above the world record. Double-check the number.';
  return '';
}

export function fmt(v: number): string {
  return String(Math.round(v * 10) / 10);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
