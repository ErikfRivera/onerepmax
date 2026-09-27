import { describe, expect, it } from 'vitest';
import { estimate } from './onerm';
import {
  facebookShareUrl, imagePath, instagramCaption, parseShareSlug, shareCopy, shareSlug, xIntentUrl,
  type SharedResult,
} from './share';

const bench: SharedResult = { lift: 'Bench', weight: 225, unit: 'lb', reps: 5, rir: 0 };

describe('share slugs', () => {
  it('encodes a result as a readable slug', () => {
    expect(shareSlug(bench)).toBe('bench-225lb-x5');
    expect(shareSlug({ lift: 'Press', weight: 52.5, unit: 'kg', reps: 3, rir: 2 })).toBe('overhead-press-52.5kg-x3-rir2');
    expect(imagePath(bench, 'story')).toBe('/r/bench-225lb-x5/story.png');
  });
  it('round-trips every lift, unit and effort level', () => {
    for (const lift of ['Bench', 'Squat', 'Deadlift', 'Press'] as const)
      for (const unit of ['lb', 'kg'] as const)
        for (const rir of [0, 1, 2, 3]) {
          const r = { lift, weight: 102.5, unit, reps: 7, rir };
          expect(parseShareSlug(shareSlug(r))).toEqual(r);
        }
  });
  it.each([
    'bench-225lb', 'bench-225lb-x0', 'bench-225lb-x11', 'bench-0lb-x5', 'bench-1201lb-x5', 'bench-551kg-x5',
    'bench-225lb-x5-rir4', 'curl-50lb-x5', 'bench-225st-x5', '', 'bench-225lb-x5/../../etc',
  ])('rejects invalid slug %j', (s) => expect(parseShareSlug(s)).toBeNull());
  it.each(['bench-0225lb-x5', 'bench-225.0lb-x5', 'bench-225lb-x05', 'bench-225lb-x5-rir0'])(
    'rejects non-canonical slug %j so each result has one URL', (s) => expect(parseShareSlug(s)).toBeNull());
  it('accepts the heaviest plausible load', () => {
    expect(parseShareSlug('deadlift-1200lb-x1')).not.toBeNull();
    expect(parseShareSlug('deadlift-550kg-x1')).not.toBeNull();
  });
});

describe('share copy matches the math', () => {
  it('uses the same estimate as the calculator', () => {
    const c = shareCopy(bench);
    expect(c.est).toEqual(estimate(225, 5, 0));
    expect(c.title).toBe(`My estimated bench max is ${estimate(225, 5).max} lb. What’s yours?`);
    expect(c.post).toContain(`${estimate(225, 5).max} lb (225 × 5)`);
  });
  it('describes reps in reserve', () => {
    expect(shareCopy(bench).set).toBe('225 lb × 5 to failure');
    expect(shareCopy({ ...bench, rir: 3 }).set).toBe('225 lb × 5 with 3+ in reserve');
    expect(shareCopy({ ...bench, rir: 2 }).est.max).toBe(estimate(225, 7).max);
  });
  it('keeps copy free of exclamation marks and placeholders', () => {
    const c = shareCopy({ lift: 'Press', weight: 60, unit: 'kg', reps: 4, rir: 1 });
    for (const s of [c.title, c.description, c.post, c.alt]) expect(s).not.toMatch(/[![\]]/);
  });
});

describe('share destinations', () => {
  const url = 'https://example.com/r/bench-225lb-x5';
  it('builds an X intent with text and link', () => {
    const u = new URL(xIntentUrl(bench, url));
    expect(u.searchParams.get('url')).toBe(url);
    expect(u.searchParams.get('text')).toBe(shareCopy(bench).post);
  });
  it('builds a Facebook sharer link', () => {
    expect(new URL(facebookShareUrl(url)).searchParams.get('u')).toBe(url);
  });
  it('puts the link in the Instagram caption', () => {
    expect(instagramCaption(bench, url)).toContain(`Find yours: ${url}`);
  });
});
