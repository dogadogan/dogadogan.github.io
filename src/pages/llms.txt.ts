import type { APIRoute } from 'astro';
import { getProjects, noImages, profile, taxonomy, topicById, clusterById, summaryOf, absolute } from '../lib/data';

// llms.txt: a plain-Markdown map of the site for LLMs and AI agents (https://llmstxt.org).
export const GET: APIRoute = async () => {
  const projects = await getProjects();
  const lines: string[] = [];
  lines.push(`# ${profile.fullName}, PhD`);
  lines.push('');
  lines.push(`> ${profile.title} at ${profile.org} (${profile.lab}), ${profile.location}. PhD from MIT CSAIL. ${profile.thesis}: ${profile.thesisLong}`);
  lines.push('');
  lines.push(noImages(profile.summary));
  lines.push('');
  lines.push('## Research directions');
  for (const th of taxonomy.themes) {
    lines.push(`- **${th.label}**: ${th.clusters.map((c: any) => c.label).join('; ')}`);
  }
  lines.push('');
  lines.push('## Projects and publications');
  for (const p of projects) {
    const d = p.data;
    const tags = [...d.tags.map((t) => topicById[t].label), ...d.vision.map((v) => clusterById[v].label)].join(', ');
    lines.push(
      `- [${d.title}](${absolute(`/projects/${p.id}/`)}) (${d.venueShort}${d.award ? `; ${d.award}` : ''}). ${d.authors.join(', ')}. Topics: ${tags}. ${summaryOf(p, 200)}`,
    );
  }
  lines.push('');
  lines.push('## Profiles');
  for (const l of profile.links) lines.push(`- [${l.label}](${l.url})`);
  lines.push('');
  lines.push('## Optional');
  lines.push(`- [Full abstracts](${absolute('/llms-full.txt')})`);
  lines.push(`- [Structured data (JSON)](${absolute('/publications.json')})`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
