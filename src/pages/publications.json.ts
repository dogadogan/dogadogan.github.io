import type { APIRoute } from 'astro';
import { getProjects, profile, absolute } from '../lib/data';

export const GET: APIRoute = async () => {
  const projects = await getProjects();
  const data = {
    author: profile.fullName,
    url: profile.siteUrl,
    generated: new Date().toISOString(),
    publications: projects.map((p) => ({
      id: p.id,
      url: absolute(`/projects/${p.id}/`),
      ...p.data,
      links: p.data.links.map((l) => ({ ...l, url: absolute(l.url) })),
      abstract: (p.body ?? '').trim(),
    })),
  };
  return new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
