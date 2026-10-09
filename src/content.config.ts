import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    modDate: z.coerce.date(),
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
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false)
  })
});

export const collections = { articles };
