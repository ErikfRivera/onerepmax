import { describe, expect, it } from 'vitest';
import { estimate, FORMULAS, trainingTable, convertWeight, convertBodyweight, weightWarning } from './onerm';
import { FAQ, FAQ_EXAMPLES, FORMULA_META, EXAMPLE_SET } from '../data/content';

describe('estimate()', () => {
  it('averages Epley and Brzycki', () => {
    expect(estimate(225, 5)).toEqual({ max: 258, epley: 263, brzycki: 253, effectiveReps: 5 });
  });
  it('returns the weight itself for a single', () => {
    expect(estimate(315, 1).max).toBe(315);
  });
  it('adds reps in reserve before running the formulas', () => {
    expect(estimate(225, 5, 1)).toEqual(estimate(225, 6));
    expect(estimate(225, 5, 1).effectiveReps).toBe(6);
  });
  it('clamps reps to 1–10', () => {
    expect(estimate(100, 25).effectiveReps).toBe(10);
    expect(estimate(100, 0).effectiveReps).toBe(1);
  });
  it('handles empty or invalid weight', () => {
    expect(estimate(0, 5).max).toBe(0);
    expect(estimate(NaN, 5).max).toBe(0);
  });
});

describe('formulas', () => {
  it('Epley and Brzycki agree exactly at 10 reps (claim made on the page)', () => {
    expect(FORMULAS.epley(100, 10)).toBeCloseTo(FORMULAS.brzycki(100, 10), 6);
  });
  it('Epley reads higher than Brzycki below 10 reps (claim made on the page)', () => {
    for (let r = 2; r < 10; r++) expect(FORMULAS.epley(100, r)).toBeGreaterThan(FORMULAS.brzycki(100, r));
  });
  it('every formula in the table has an implementation', () => {
    for (const f of FORMULA_META) expect(typeof FORMULAS[f.id]).toBe('function');
  });
  it('worked example lands within the published spread', () => {
    const vals = FORMULA_META.map((f) => FORMULAS[f.id](EXAMPLE_SET.weight, EXAMPLE_SET.reps));
    const avg = estimate(EXAMPLE_SET.weight, EXAMPLE_SET.reps).max;
    expect(avg).toBeGreaterThan(Math.min(...vals));
    expect(avg).toBeLessThan(Math.max(...vals));
  });
});

describe('FAQ copy matches the math', () => {
  const answer = FAQ.find((f) => f.q.startsWith('If I can bench 225'))!.html;
  for (const ex of FAQ_EXAMPLES) {
    it(`${ex.weight} × ${ex.reps}`, () => {
      expect(answer).toContain(`${ex.weight} × ${ex.reps} ≈ ${estimate(ex.weight, ex.reps).max} lb`);
    });
  }
  it('headline answer (225 × 10 ≈ 300)', () => {
    expect(answer).toContain(`About ${estimate(225, 10).max} lb`);
  });
});

describe('training table and units', () => {
  it('rounds to 5 lb and 2.5 kg', () => {
    expect(trainingTable(258, 'lb')[0]).toEqual({ pct: 95, reps: '1–2', weight: '245' });
    expect(trainingTable(117, 'kg')[0].weight).toBe('110');
    expect(trainingTable(120, 'kg')[0].weight).toBe('115');
  });
  it('converts units', () => {
    expect(convertWeight(225, 'kg')).toBe(102);
    expect(convertWeight(100, 'lb')).toBe(220);
    expect(convertBodyweight(180, 'kg')).toBe(82);
  });
  it('flags impossible weights', () => {
    expect(weightWarning(30, 'lb')).not.toBe('');
    expect(weightWarning(225, 'lb')).toBe('');
    expect(weightWarning(600, 'kg')).not.toBe('');
  });
});
