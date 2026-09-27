/**
 * Server-only: renders a result as a PNG for link previews and Instagram.
 * Layout is described as a satori element tree (flexbox subset of CSS), rasterized with resvg.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import archivo800 from '@fontsource/archivo/files/archivo-latin-800-normal.woff?inline';
import archivo900 from '@fontsource/archivo/files/archivo-latin-900-normal.woff?inline';
import sans500 from '@fontsource/instrument-sans/files/instrument-sans-latin-500-normal.woff?inline';
import sans700 from '@fontsource/instrument-sans/files/instrument-sans-latin-700-normal.woff?inline';
import { IMAGE_FORMATS, shareCopy, type ImageFormat, type SharedResult } from './share';

// Brand tokens (see the top of global.css). Share images are always the dark card.
const INK = '#16150F';
const GROUND = '#F4F2EE';
const MUTED = '#BDB8AC';
const ACCENT = '#E0582B';
const GOLD = '#B08A3E';

/** Fonts are inlined into the server bundle as data URLs so the function needs no file access. */
const fromDataUrl = (u: string) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');
const FONTS = [
  { name: 'Archivo', data: fromDataUrl(archivo800), weight: 800 as const },
  { name: 'Archivo', data: fromDataUrl(archivo900), weight: 900 as const },
  { name: 'Instrument Sans', data: fromDataUrl(sans500), weight: 500 as const },
  { name: 'Instrument Sans', data: fromDataUrl(sans700), weight: 700 as const },
];

type Style = Record<string, string | number>;
type Child = El | string;
interface El { type: string; key: null; props: { style?: Style; children?: Child | Child[] } }
const el = (style: Style, ...children: Child[]): El => ({
  type: 'div', key: null, props: { style: { display: 'flex', ...style }, children },
});

export async function renderShareImage(r: SharedResult, format: ImageFormat, host: string): Promise<Buffer> {
  const { width, height } = IMAGE_FORMATS[format];
  const c = shareCopy(r);
  const wide = format === 'og';
  // Scale type from a 1080px-wide portrait card; the landscape card is sized on its own.
  const s = wide ? 0.62 : 1;
  const digits = String(c.est.max).length;
  const numSize = { og: 300, post: 400, story: 440 }[format] * (digits >= 4 ? 0.72 : 1);

  const kicker = el(
    { alignItems: 'center', gap: 18 * s, fontFamily: 'Instrument Sans', fontWeight: 700, fontSize: 40 * s,
      letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED },
    el({ width: 44 * s, height: 6 * s, background: GOLD, borderRadius: 3 }),
    `Estimated ${c.label} max`,
  );
  const number = el(
    { alignItems: 'baseline', gap: 20 * s, fontFamily: 'Archivo', color: GROUND },
    el({ fontWeight: 900, fontSize: numSize, lineHeight: 0.9, letterSpacing: '-0.03em' }, String(c.est.max)),
    el({ fontWeight: 800, fontSize: 96 * (wide ? 0.8 : 1) }, r.unit),
  );
  const detail = el(
    { flexDirection: 'column', gap: 10 * s, fontFamily: 'Instrument Sans', fontWeight: 500, fontSize: 40 * s, color: MUTED },
    el({ color: GROUND }, `From ${c.set}`),
    el({}, `Epley ${c.est.epley} · Brzycki ${c.est.brzycki}`),
  );
  const cta = el(
    { alignItems: 'center', justifyContent: 'space-between', gap: 24 * s, background: ACCENT, color: INK,
      borderRadius: 28 * s, padding: `${34 * s}px ${44 * s}px` },
    el({ fontFamily: 'Archivo', fontWeight: 800, fontSize: 56 * s }, 'What’s your max?'),
    el({ fontFamily: 'Instrument Sans', fontWeight: 700, fontSize: 34 * s }, host),
  );

  // Stories keep content clear of Instagram's top bar and reply field.
  const pad = format === 'story' ? '260px 80px 340px' : wide ? '64px 72px' : '96px 80px';
  const tree = el(
    { width, height, flexDirection: 'column', justifyContent: format === 'story' ? 'center' : 'space-between',
      gap: 120, background: INK, padding: pad },
    el({ flexDirection: 'column', gap: (wide ? 18 : 40) * s }, kicker, number, detail),
    cta,
  );

  const svg = await satori(tree as never, { width, height, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}
