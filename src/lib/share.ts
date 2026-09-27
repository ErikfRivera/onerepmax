/**
 * Shareable results. A result is encoded in its URL (/r/bench-225lb-x5-rir1), so share pages
 * need no database and every number is recomputed from onerm.ts on the server. Pure functions,
 * used by the share page, the image endpoint and the client flow.
 */
import { LIFTS, RIR, type LiftId } from '../data/flow';
import { SITE } from '../data/site';
import { estimate, fmt, MAX_REPS, MIN_REPS, WEIGHT_CEILING, type Estimate, type Unit } from './onerm';

export interface SharedResult {
  lift: LiftId;
  weight: number;
  unit: Unit;
  reps: number;
  rir: number;
}

export const LIFT_SLUGS: Record<LiftId, string> = {
  Bench: 'bench',
  Squat: 'squat',
  Deadlift: 'deadlift',
  Press: 'overhead-press',
};

/** Image sizes per destination. og = link previews (Facebook, X, iMessage, Slack…). */
export const IMAGE_FORMATS = {
  og: { width: 1200, height: 630 },
  post: { width: 1080, height: 1350 }, // Instagram feed, 4:5
  story: { width: 1080, height: 1920 }, // Instagram / Facebook stories, 9:16
} as const;
export type ImageFormat = keyof typeof IMAGE_FORMATS;

export const isImageFormat = (v: unknown): v is ImageFormat =>
  typeof v === 'string' && Object.hasOwn(IMAGE_FORMATS, v);

export function shareSlug(r: SharedResult): string {
  return `${LIFT_SLUGS[r.lift]}-${fmt(r.weight)}${r.unit}-x${r.reps}${r.rir ? `-rir${r.rir}` : ''}`;
}

export const sharePath = (r: SharedResult) => `/r/${shareSlug(r)}`;
export const imagePath = (r: SharedResult, f: ImageFormat) => `${sharePath(r)}/${f}.png`;

const SLUG_RE = /^([a-z-]+)-(\d{1,4}(?:\.\d)?)(lb|kg)-x(\d{1,2})(?:-rir(\d))?$/;

/** Parse a share slug. Returns null for anything invalid or not in canonical form. */
export function parseShareSlug(slug: string | undefined): SharedResult | null {
  const m = slug ? SLUG_RE.exec(slug) : null;
  if (!m) return null;
  const lift = (Object.keys(LIFT_SLUGS) as LiftId[]).find((id) => LIFT_SLUGS[id] === m[1]);
  const unit = m[3] as Unit;
  const r: SharedResult = { lift: lift!, weight: Number(m[2]), unit, reps: Number(m[4]), rir: Number(m[5] ?? 0) };
  const valid = lift
    && r.weight > 0 && r.weight <= WEIGHT_CEILING[unit]
    && r.reps >= MIN_REPS && r.reps <= MAX_REPS
    && RIR.some((x) => x.v === r.rir);
  // One URL per result: reject "0225lb", "225.0lb", "-rir0" and friends.
  return valid && shareSlug(r) === slug ? r : null;
}

export interface ShareCopy {
  est: Estimate;
  /** Lift name as used in running text, e.g. "overhead press". */
  label: string;
  /** "225 lb × 5 to failure" */
  set: string;
  /** og:title and <title> */
  title: string;
  /** meta description and og:description */
  description: string;
  /** Text for X and the native share sheet (the link is added separately). */
  post: string;
  /** Alt text for the share images. */
  alt: string;
}

export function shareCopy(r: SharedResult): ShareCopy {
  const est = estimate(r.weight, r.reps, r.rir);
  const { label } = LIFTS.find((l) => l.id === r.lift)!;
  const effort = r.rir === 0 ? 'to failure' : `with ${RIR.find((x) => x.v === r.rir)!.short}`;
  const set = `${fmt(r.weight)} ${r.unit} × ${r.reps} ${effort}`;
  const max = `${est.max} ${r.unit}`;
  return {
    est,
    label,
    set,
    title: `My estimated ${label} max is ${max}. What’s yours?`,
    description: `Estimated from ${set} using the Epley and Brzycki formulas. Enter one hard set to estimate your own one-rep max and training weights. Free, no sign-up.`,
    post: `My estimated ${label} max is ${max} (${fmt(r.weight)} × ${r.reps}). What’s yours?`,
    alt: `Estimated ${label} one-rep max: ${max}, from ${set}.`,
  };
}

/** Caption copied to the clipboard for Instagram, which ignores text passed by websites. */
export function instagramCaption(r: SharedResult, url: string): string {
  const handle = SITE.social.instagram ? ` @${SITE.social.instagram}` : '';
  const tags = SITE.hashtags.map((t) => `#${t}`).join(' ');
  return `${shareCopy(r).post}\n\nFind yours: ${url}${handle}\n\n${tags}`;
}

export function xIntentUrl(r: SharedResult, url: string): string {
  const q = new URLSearchParams({ text: shareCopy(r).post, url });
  if (SITE.social.x) q.set('via', SITE.social.x);
  return `https://x.com/intent/post?${q}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: url })}`;
}
