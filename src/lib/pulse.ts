import { LIFTS } from '../data/flow';
import {
  DEFAULT_MARKET, LIFT_BADGE, LIFT_SHARE, MARKETS, PULSE_TEMPLATES, TIMEZONE_MARKETS,
  type MarketCode, type PulseCtx,
} from '../data/pulse';

/** Returns a float in [0, 1). Math.random in the browser, seeded in tests. */
export type Rng = () => number;

type LiftId = (typeof LIFTS)[number]['id'];

export interface PulseToast {
  badge: [string, string];
  lead: string;
  rest: string;
  meta: string;
}

export interface PulseActivity {
  lift: LiftId;
  reps: number;
  city: string;
  /** Epoch ms. */
  at: number;
}

/**
 * Picks the visitor's market. The time zone says where the device is; the language
 * tag often doesn't (en-US is the default almost everywhere), so it's the fallback.
 */
export function detectMarket(timeZone: string | undefined, languages: readonly string[]): MarketCode {
  if (timeZone) {
    const byZone = TIMEZONE_MARKETS[timeZone];
    if (byZone) return byZone;
    if (timeZone.startsWith('Australia/')) return 'AU';
  }
  for (const tag of languages) {
    const region = tag.split('-').slice(1).find((p) => /^[a-z]{2}$/i.test(p))?.toUpperCase();
    if (region && region in MARKETS) return region as MarketCode;
  }
  return DEFAULT_MARKET;
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function timeAgo(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  return `${Math.floor(min / 60)} hr ago`;
}

const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pick = <T,>(rng: Rng, items: readonly T[]) => items[Math.floor(rng() * items.length)];
const fmt = (n: number) => n.toLocaleString('en-US');
/** Sets of 3–6 are the most common thing people type in. */
const REP_POOL = [1, 2, 3, 3, 3, 4, 5, 5, 5, 5, 6, 6, 8, 8, 10];

function pickLift(rng: Rng): LiftId {
  let r = rng();
  for (const l of LIFTS) {
    r -= LIFT_SHARE[l.id];
    if (r < 0) return l.id;
  }
  return LIFTS[0].id;
}

/**
 * TEST DATA generator for the live activity layer (see src/data/pulse.ts).
 * Each visit gets its own shuffled message order, starting point and counts.
 */
export function createPulse(market: MarketCode, rng: Rng = Math.random, now = Date.now()) {
  const m = MARKETS[market];
  const order = shuffle(PULSE_TEMPLATES, rng);
  let cursor = 0;
  let hereNow = int(rng, 24, 71);
  const day = new Date(now);
  const dayFrac = (day.getHours() * 60 + day.getMinutes()) / 1440;
  let today = Math.round(320 + dayFrac * 2400) + int(rng, 0, 120);
  const liftToday = (lift: LiftId) => Math.round(today * LIFT_SHARE[lift]);
  const label = (lift: LiftId) => LIFTS.find((l) => l.id === lift)!.label;

  return {
    market,
    get hereNow() { return hereNow; },
    get today() { return today; },
    /** Nudges the "here now" count so it doesn't sit still. */
    drift() { hereNow = Math.min(90, Math.max(12, hereNow + int(rng, -3, 3))); },

    /** One recent calculation for the feed. Bumps today's total. */
    activity(at: number): PulseActivity {
      today++;
      return { lift: pickLift(rng), reps: pick(rng, REP_POOL), city: pick(rng, m.cities), at };
    },

    /** The next notification, cycling through the shuffled templates. */
    nextToast(): PulseToast {
      const t = order[cursor++ % order.length];
      const lift = t.lift ?? pickLift(rng);
      const reps = t.reps ? int(rng, t.reps[0], t.reps[1]) : pick(rng, REP_POOL);
      const c: PulseCtx = {
        city: pick(rng, m.cities),
        country: m.name,
        lift: label(lift),
        reps,
        hereNow: fmt(hereNow),
        lastHour: fmt(Math.round(hereNow * 2.6)),
        liftToday: fmt(liftToday(lift)),
      };
      const ago = int(rng, 0, 4) * 60_000;
      return {
        badge: t.badge ? t.badge(c) : [LIFT_BADGE[lift], `${reps} REP${reps === 1 ? '' : 'S'}`],
        lead: t.lead(c),
        rest: t.rest(c),
        meta: t.count ? 'Updated just now' : `${timeAgo(ago)} · ${fmt(liftToday(lift))} ${c.lift} maxes today`,
      };
    },
  };
}
