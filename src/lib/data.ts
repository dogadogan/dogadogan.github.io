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

/** Remove Markdown images (inline logos) but keep links. */
export const noImages = (s: string = '') => s.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

/** Markdown → plain text (for meta descriptions and JSON-LD). */
export const plain = (s: string = '') => noImages(s).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();

export const absolute = (path: string) => new URL(path, profile.siteUrl).href;
