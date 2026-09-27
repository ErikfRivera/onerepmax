import type { APIRoute } from 'astro';
import { isImageFormat, parseShareSlug } from '../../../lib/share';
import { renderShareImage } from '../../../lib/share-image';

export const prerender = false;

/** /r/bench-225lb-x5/{og,post,story}.png */
export const GET: APIRoute = async ({ params, url }) => {
  const r = parseShareSlug(params.slug);
  if (!r || !isImageFormat(params.format)) return new Response('Not found', { status: 404 });
  const png = await renderShareImage(r, params.format, url.host.replace(/^www\./, ''));
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // Same URL, same image. A day in browsers; the CDN keeps it until the next deploy.
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
    },
  });
};
