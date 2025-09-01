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

export const collections = { timeline };


