import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// Allowed topic / vision ids come from src/data/taxonomy.yaml, so a typo in a
// project file fails the build with a clear message instead of silently vanishing.
const taxonomy = parse(readFileSync(new URL('./data/taxonomy.yaml', import.meta.url), 'utf8'));
const topicIds = taxonomy.topics.map((t: { id: string }) => t.id) as [string, ...string[]];
const visionIds = taxonomy.themes.flatMap((t: { clusters: { id: string }[] }) => t.clusters.map((c) => c.id)) as [
  string,
  ...string[],
];

const link = z.object({ label: z.string(), url: z.string() });

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    short: z.string().describe('Short name shown as the headline, e.g. "InfraredTags"'),
    authors: z.array(z.string()).min(1),
    authorNote: z.string().optional(),
    venue: z.string(),
    venueShort: z.string(),
    venueUrl: z.string().url().optional(),
    year: z.number().int(),
    order: z.number().default(100).describe('Sort order within a year; lower comes first'),
    tags: z.array(z.enum(topicIds)).min(1),
    vision: z.array(z.enum(visionIds)).default([]),
    featured: z.boolean().default(false),
    award: z.string().optional(),
    awardUrl: z.string().url().optional(),
    affiliation: z.string().optional(),
    youtube: z.string().length(11).optional().describe('YouTube video id (11 characters)'),
    image: z.string().optional().describe('Path under /public, used when there is no YouTube video'),
    links: z.array(link).default([]),
    press: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
