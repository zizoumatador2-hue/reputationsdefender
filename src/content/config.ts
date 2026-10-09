import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.date(),
    modDate: z.date(),
    category: z.enum([
      'online-reputation',
      'google-search',
      'personal-privacy',
      'personal-information-removal',
      'data-brokers',
      'business-reputation',
      'online-reviews',
      'personal-branding'
    ]),
    cluster: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    author: z.string().default('Christopher Kunz'),
    readingTime: z.string().optional(),
    featured: z.boolean().default(false)
  })
});

export const collections = { articles };
