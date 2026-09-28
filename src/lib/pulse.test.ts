import { describe, expect, it } from 'vitest';
import { createPulse, detectMarket, shuffle, timeAgo, type Rng } from './pulse';
import { MARKETS, PULSE_TEMPLATES } from '../data/pulse';

/** Small deterministic PRNG (mulberry32) so tests are repeatable. */
function seeded(seed: number): Rng {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('detectMarket()', () => {
  it('prefers the time zone over the language tag', () => {
    expect(detectMarket('Europe/London', ['en-US'])).toBe('GB');
    expect(detectMarket('America/Toronto', ['en-US'])).toBe('CA');
    expect(detectMarket('America/Chicago', ['es-MX'])).toBe('US');
    expect(detectMarket('Australia/Perth', ['en'])).toBe('AU');
  });
  it('falls back to the language region', () => {
    expect(detectMarket('Etc/UTC', ['de-DE', 'en'])).toBe('DE');
    expect(detectMarket(undefined, ['zh-Hant-TW', 'pt-BR'])).toBe('BR');
  });
  it('defaults to the US', () => {
    expect(detectMarket('Asia/Tokyo', ['ja-JP'])).toBe('US');
    expect(detectMarket(undefined, [])).toBe('US');
  });
});

describe('shuffle()', () => {
  it('returns a permutation and leaves the input alone', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input, seeded(1));
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('gives different visitors different orders', () => {
    expect(shuffle(PULSE_TEMPLATES, seeded(1))).not.toEqual(shuffle(PULSE_TEMPLATES, seeded(2)));
  });
});

describe('timeAgo()', () => {
  it('formats recent times', () => {
    expect(timeAgo(20_000)).toBe('just now');
    expect(timeAgo(3 * 60_000)).toBe('3 min ago');
    expect(timeAgo(2 * 3_600_000)).toBe('2 hr ago');
  });
});

describe('createPulse()', () => {
  it('has at least 20 different notifications', () => {
    expect(PULSE_TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });
  it('cycles through every template before repeating, using local cities', () => {
    const p = createPulse('GB', seeded(7), new Date('2026-09-28T15:00:00').getTime());
    const seen = new Set<string>();
    for (let i = 0; i < PULSE_TEMPLATES.length; i++) {
      const t = p.nextToast();
      seen.add(t.rest.replace(/\d[\d,]*/g, '#').replace(/bench|squat|deadlift|overhead press/g, 'LIFT'));
      expect(t.lead + t.rest).not.toMatch(/undefined|NaN|\$\{/);
      const city = MARKETS.GB.cities.find((c) => t.lead.includes(c));
      if (/ in | near |:$/.test(t.lead) && !t.lead.includes(MARKETS.GB.name)) expect(city).toBeDefined();
    }
    expect(seen.size).toBeGreaterThanOrEqual(PULSE_TEMPLATES.length - 3);
  });
  it('counts each new activity toward today', () => {
    const p = createPulse('US', seeded(3));
    const before = p.today;
    const a = p.activity(Date.now());
    expect(p.today).toBe(before + 1);
    expect(MARKETS.US.cities).toContain(a.city);
    expect(a.reps).toBeGreaterThanOrEqual(1);
    expect(a.reps).toBeLessThanOrEqual(10);
  });
  it('keeps the live count in a believable range', () => {
    const p = createPulse('US', seeded(9));
    for (let i = 0; i < 500; i++) {
      p.drift();
      expect(p.hereNow).toBeGreaterThanOrEqual(12);
      expect(p.hereNow).toBeLessThanOrEqual(90);
    }
  });
});
