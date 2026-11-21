import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { getCollection, type CollectionEntry } from 'astro:content';

const load = (name: string) => parse(readFileSync(join(process.cwd(), 'src/data', `${name}.yaml`), 'utf8'));

export const profile = load('profile');
export const taxonomy = load('taxonomy');
export const cv = load('cv');
export const activities = load('activities');
export const patents = load('patents').patents as any[];

export type Project = CollectionEntry<'projects'>;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', (p) => !p.data.draft);
  return all.sort((a, b) => b.data.year - a.data.year || a.data.order - b.data.order);
}

export const topicById: Record<string, { id: string; label: string; axis: string }> = Object.fromEntries(
  taxonomy.topics.map((t: any) => [t.id, t]),
);

export const clusterById: Record<string, { id: string; label: string; theme: string; themeLabel: string }> =
  Object.fromEntries(
    taxonomy.themes.flatMap((th: any) =>
      th.clusters.map((c: any) => [c.id, { ...c, theme: th.id, themeLabel: th.label }]),
    ),
  );

export const isMe = (name: string) => /Dog(a|ğa) Dog(a|ğa)n/i.test(name);

export function youtubeThumb(id: string, size: 'hq' | 'maxres' = 'hq') {
  return `https://i.ytimg.com/vi/${id}/${size === 'hq' ? 'hqdefault' : 'maxresdefault'}.jpg`;
}

export function projectImage(p: Project): string | undefined {
  return p.data.image ?? (p.data.youtube ? youtubeThumb(p.data.youtube) : undefined);
}

/** First sentence-ish summary of the abstract, for cards, meta descriptions and llms.txt. */
export function summaryOf(p: Project, max = 220): string {
  const plain = (p.body ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

/** Tiny Markdown → HTML for inline YAML strings (links, bold, italics, paragraphs). */
export function md(s: string = ''): string {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t: string) =>
    esc(t)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="inline-logo" src="$2" alt="$1" loading="lazy" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const paras = s.trim().split(/\n\s*\n/);
  return paras.length > 1 ? paras.map((p) => `<p>${inline(p.trim())}</p>`).join('') : inline(s.trim());
}

/** Display text for a project link label: sentence case, acronyms in caps. */
export function linkLabel(l: string): string {
  if (/^(open-source(: GitHub)?|GitHub)$/i.test(l)) return 'Code';
  const s = l.replace(/\b(doi|pdf|chi|uist|acm)\b/gi, (m) => m.toUpperCase());
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ICONS: Record<string, string> = {
  paper: '<path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13M6.5 8h4M6.5 10.5h4"/>',
  web: '<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c1.8 1.8 2.6 3.9 2.6 6.2S9.8 12.4 8 14.2C6.2 12.4 5.4 10.3 5.4 8S6.2 3.6 8 1.8"/>',
  video: '<rect x="1.8" y="3.3" width="12.4" height="9.4" rx="1.6"/><path d="M6.6 6v4l3.4-2z"/>',
  talk: '<rect x="2" y="2.5" width="12" height="8" rx="1"/><path d="M8 10.5V14M5.5 14h5M5 5.5h6M5 7.8h3.5"/>',
  code: '<path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5"/>',
  doi: '<path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/>',
  demo: '<rect x="1.8" y="2.5" width="12.4" height="11" rx="1.6"/><path d="M1.8 5.8h12.4"/><circle cx="4" cy="4.15" r=".35"/><circle cx="5.7" cy="4.15" r=".35"/>',
  poster: '<rect x="2.5" y="1.8" width="11" height="12.4" rx="1"/><path d="m2.5 11 3.2-3.2 2.6 2.6 1.7-1.7 3.5 3.5"/><circle cx="10.3" cy="5.2" r="1.1"/>',
  data: '<ellipse cx="8" cy="3.8" rx="5.2" ry="2"/><path d="M2.8 3.8v8.4c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V3.8M2.8 8c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2"/>',
};

/** Small grayscale icon for a project link, chosen from its label. */
export function linkIcon(label: string): string {
  const l = label.toLowerCase();
  const key =
    /video/.test(l) ? 'video'
    : /talk/.test(l) ? 'talk'
    : /code|github|open-source|kaggle/.test(l) ? 'code'
    : /^doi$/.test(l) ? 'doi'
    : /demo/.test(l) ? 'demo'
    : /^poster$/.test(l) ? 'poster'
    : /data/.test(l) ? 'data'
    : /paper|pdf|poster|journal/.test(l) ? 'paper'
    : 'web';
  return `<svg class="link-icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg>`;
}

/** Remove Markdown images (inline logos) but keep links. */
export const noImages = (s: string = '') => s.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

/** Markdown → plain text (for meta descriptions and JSON-LD). */
export const plain = (s: string = '') => noImages(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();

export const absolute = (path: string) => new URL(path, profile.siteUrl).href;
