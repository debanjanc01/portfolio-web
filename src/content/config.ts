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

// Writing: on-site notes (body, no url) and external articles/posts (url).
// mode labels the pillar so home/writing can mix systems with human substance.
// A `post` MUST carry a real permalink — no profile fallbacks.
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['article', 'post', 'note']).default('article'),
    /** Pillar label for cards and selected mixes. External listicles use article. */
    mode: z
      .enum(['dive', 'lesson', 'career', 'human', 'philosophy', 'building'])
      .optional(),
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
