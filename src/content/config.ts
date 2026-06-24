import { defineCollection, z } from 'astro:content';

const timeline = defineCollection({
  type: 'content',
  schema: z.object({
    role: z.string(),
    company: z.string(),
    start: z.date(), // ISO date, e.g. 2023-06-01
    end: z.date().optional(), // omit if present/current
    location: z.string().optional(),
    stack: z.array(z.string()).default([]),
    focus: z.array(z.string()).default([]),
  }),
});

// Writing: articles + posts (link out) and, later, on-site notes (with a body).
// A `post` MUST carry a real permalink — no profile fallbacks. Entries without
// a real url should stay draft so nothing ghost-links.
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['article', 'post', 'note']).default('article'),
    source: z.string().optional(), // SigNoz, Geekflare, LinkedIn, X, ...
    url: z.string().url().optional(), // required for article/post; omit for on-site note
    date: z.date().optional(),
    hook: z.string().optional(), // shown on post cards / home
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false), // surfaced on the home page
    draft: z.boolean().default(false),
    order: z.number().default(0), // manual sort when date is absent
  }),
});

// Work: selected projects + proof of work, with the decision and the lesson.
const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['project', 'experiment', 'diagram']).default('project'),
    summary: z.string(),
    decision: z.string().optional(),
    lesson: z.string().optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    date: z.date().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { timeline, writing, work };
