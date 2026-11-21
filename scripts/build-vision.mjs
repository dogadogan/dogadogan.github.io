// Turns the Illustrator export (design/vision.svg) into an inline, interactive SVG:
//  - moves the embedded base64 PNG out to /public (and shrinks it), so the HTML stays small
//  - prefixes classes/ids so the SVG's <style> can't leak into the page
//  - marks theme panels and clusters with data attributes the filter script listens to
//  - turns bold project names into links (see `svgLinks` in src/data/taxonomy.yaml)
// Re-run automatically on `npm run dev` / `npm run build`. To update the diagram,
// export from Illustrator over design/vision.svg, keeping the <g id="..."> layer names.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from 'yaml';

const root = new URL('../', import.meta.url);
const src = readFileSync(new URL('design/vision.svg', root), 'utf8');
const taxonomy = parse(readFileSync(new URL('src/data/taxonomy.yaml', root), 'utf8'));

let svg = src
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace(/<!--[\s\S]*?-->\s*/g, '');

// 1. External raster image(s)
mkdirSync(new URL('public/images/vision/', root), { recursive: true });
let imgIndex = 0;
const images = [];
svg = svg.replace(/xlink:href="data:image\/(png|jpeg);base64,([^"]+)"/g, (_, type, b64) => {
  const name = `vision-${++imgIndex}.webp`;
  images.push({ name, buf: Buffer.from(b64, 'base64') });
  return `href="/images/vision/${name}"`;
});
try {
  const sharp = (await import('sharp')).default;
  for (const { name, buf } of images) {
    await sharp(buf).resize({ width: 360, withoutEnlargement: true }).webp({ quality: 82 }).toFile(new URL(`public/images/vision/${name}`, root).pathname);
  }
} catch (e) {
  console.warn('[vision] sharp unavailable, writing PNGs instead:', e.message);
  for (const { name, buf } of images) writeFileSync(new URL(`public/images/vision/${name.replace('.webp', '.png')}`, root), buf);
  svg = svg.replace(/(\/images\/vision\/vision-\d+)\.webp/g, '$1.png');
}

// 2. Namespace classes and ids
svg = svg
  .replace(/\.st(\d+)/g, '.v-st$1')
  .replace(/class="([^"]+)"/g, (_, c) => `class="${c.replace(/\bst(\d+)\b/g, 'v-st$1')}"`)
  .replace(/id="((?:radial|linear)-gradient\d*)"/g, 'id="v-$1"')
  .replace(/url\(#((?:radial|linear)-gradient\d*)\)/g, 'url(#v-$1)')
  .replace(/xlink:href="#/g, 'href="#');

// 3. Interactive regions
const label = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
for (const theme of taxonomy.themes) {
  svg = svg.replace(
    `<g id="${theme.svgGroup}">`,
    `<g id="v-${theme.svgGroup}" class="v-hit v-theme" data-theme="${theme.id}" role="button" tabindex="0" aria-pressed="false" aria-label="Show projects on ${label(theme.label)}">`,
  );
  for (const g of theme.alsoGroups ?? []) {
    svg = svg.replace(`<g id="${g}">`, `<g id="v-${g}" class="v-hit v-theme-art" data-theme="${theme.id}">`);
  }
  for (const c of theme.clusters) {
    svg = svg.replace(
      `<g id="${c.svgGroup}">`,
      `<g id="v-${c.svgGroup}" class="v-hit v-cluster" data-vision="${c.id}" data-theme="${theme.id}" role="button" tabindex="0" aria-pressed="false" aria-label="Show projects on ${label(c.label)}">`,
    );
  }
  svg = svg.replace(/<g id="(panel_left|panel_right)">/, (_, id) =>
    `<g id="v-${id}" class="v-panel" data-panel-theme="${id === 'panel_left' ? taxonomy.themes[0].id : taxonomy.themes[1].id}">`,
  );
}
// Illustrator sometimes files an icon under the wrong layer (e.g. the award ribbon of
// "Natural markers" lives inside "Interior markers"). Move each small icon group into the
// cluster whose card actually contains it, so hit areas and highlights match what you see.
{
  const clusters = [];
  const openRe = /<g id="v-[^"]+" class="v-hit v-cluster"[^>]*>\s*<rect[^>]*?x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g;
  for (let m; (m = openRe.exec(svg)); ) {
    clusters.push({ index: m.index, tagEnd: svg.indexOf('>', m.index) + 1, x: +m[1], y: +m[2], w: +m[3], h: +m[4] });
  }
  const iconRe = /<g>\s*(?:<(?:path|circle|rect)[^>]*\/>\s*)+<\/g>/g;
  const firstPoint = (block) => {
    const d = block.match(/d="M([\d.]+),([\d.]+)/);
    if (d) return [+d[1], +d[2]];
    const c = block.match(/cx="([\d.]+)" cy="([\d.]+)"/);
    return c ? [+c[1], +c[2]] : null;
  };
  const owner = (i) => clusters.filter((c) => c.index < i).at(-1);
  const moves = [];
  for (let m; (m = iconRe.exec(svg)); ) {
    const pt = firstPoint(m[0]);
    const home = owner(m.index);
    if (!pt || !home) continue;
    const inside = (c) => pt[0] >= c.x && pt[0] <= c.x + c.w && pt[1] >= c.y && pt[1] <= c.y + c.h;
    if (inside(home)) continue;
    const target = clusters.find(inside);
    if (target) moves.push({ start: m.index, block: m[0], target });
  }
  // apply from the end so earlier indexes stay valid
  for (const mv of moves.sort((a, b) => b.start - a.start)) {
    svg = svg.slice(0, mv.start) + svg.slice(mv.start + mv.block.length);
  }
  for (const mv of moves.sort((a, b) => b.target.tagEnd - a.target.tagEnd)) {
    svg = svg.slice(0, mv.target.tagEnd) + mv.block + svg.slice(mv.target.tagEnd);
  }
  if (moves.length) console.log(`[vision] moved ${moves.length} misplaced icon(s) into their cluster`);
}

// remaining layer ids -> prefixed, so they never collide with page ids
svg = svg.replace(/<g id="(?!v-)([^"]+)"/g, '<g id="v-$1"');

// 4. Project-name links
let linked = 0;
for (const [name, target] of Object.entries(taxonomy.svgLinks)) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '&amp;');
  const re = new RegExp(`(<text class="v-st8"[^>]*>)(<tspan[^>]*>${esc}\\s*</tspan>)(</text>)`);
  if (!re.test(svg)) {
    console.warn(`[vision] name not found in SVG: ${name}`);
    continue;
  }
  const external = /^https?:/.test(target);
  const href = external ? target : `#p-${target}`;
  const attrs = external ? ' target="_blank" rel="noopener"' : ` data-project="${target}"`;
  svg = svg.replace(re, `<a href="${href}" class="v-link"${attrs}>$1$2$3</a>`);
  linked++;
}

// 5. Root element: responsive + accessible
svg = svg.replace(
  /<svg id="Layer_1"([^>]*)>/,
  (_, attrs) =>
    `<svg class="vision-svg"${attrs.replace(/\s*version="1\.1"/, '')} role="group" aria-labelledby="vision-title vision-desc"><title id="vision-title">Research vision: two directions in a reinforcing loop</title><desc id="vision-desc">Left: AI-first information access (agentic interfaces and content optimization; synthetic user evaluation; AI + AR). Right: metadata for the physical world (natural, structural, and interior markers). Center: a reinforcing loop between digital and physical contexts, from better understanding to better experiences, anywhere.</desc>`,
);

mkdirSync(new URL('src/generated/', root), { recursive: true });
writeFileSync(new URL('src/generated/vision.svg', root), svg);
console.log(`[vision] ${(src.length / 1024).toFixed(0)} KB -> ${(svg.length / 1024).toFixed(0)} KB inline, ${images.length} image(s) extracted, ${linked} names linked`);
