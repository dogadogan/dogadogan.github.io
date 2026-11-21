import { defineMiddleware } from 'astro:middleware';

// Open every external link in a new tab. Runs at build time for the static
// pages (and in `npm run dev`), so the attribute is in the shipped HTML.
const OWN_HOSTS = /^https?:\/\/(www\.)?dogadogan\.com(\/|$)/i;

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if (!res.headers.get('content-type')?.includes('text/html')) return res;
  const html = await res.text();
  const out = html.replace(/<a\b([^>]*?)>/g, (tag, attrs: string) => {
    const href = attrs.match(/\shref="([^"]+)"/)?.[1];
    if (!href || !/^https?:\/\//i.test(href) || OWN_HOSTS.test(href) || /\starget=/.test(attrs)) return tag;
    const rel = /\srel="/.test(attrs)
      ? attrs.replace(/\srel="([^"]*)"/, (_m, r: string) => ` rel="${r.includes('noopener') ? r : `${r} noopener`}"`)
      : `${attrs} rel="noopener"`;
    return `<a${rel} target="_blank">`;
  });
  return new Response(out, { status: res.status, headers: res.headers });
});
