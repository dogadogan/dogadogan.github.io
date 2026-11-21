import type { APIRoute } from 'astro';
import { getProjects, profile, topicById, clusterById, absolute } from '../lib/data';

export const GET: APIRoute = async () => {
  const projects = await getProjects();
  const out: string[] = [`# ${profile.fullName}, PhD: full publication list with abstracts`, '', profile.bio.trim(), ''];
  for (const p of projects) {
    const d = p.data;
    out.push(`## ${d.title}`);
    out.push('');
    out.push(`- Authors: ${d.authors.join(', ')}`);
    out.push(`- Venue: ${d.venue} (${d.year})`);
    if (d.award) out.push(`- Award: ${d.award}`);
    out.push(`- Topics: ${[...d.tags.map((t) => topicById[t].label), ...d.vision.map((v) => clusterById[v].label)].join(', ')}`);
    out.push(`- Page: ${absolute(`/projects/${p.id}/`)}`);
    for (const l of d.links) out.push(`- ${l.label}: ${absolute(l.url)}`);
    out.push('');
    out.push((p.body ?? '').trim());
    out.push('');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
