import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pageSchema = z.object({
  page: z.string().optional(),
  url: z.string(),
  seo_title: z.string(),
  meta_description: z.string(),
  h1: z.string(),
  schema: z.string().optional(),
  draft: z.boolean().default(false),
  pubDate: z.coerce.date().optional(),
  primary_keyword: z.string().optional(),
  cluster: z.string().optional(),
  drop: z.number().optional(),
  note: z.string().optional(),
});

const cities = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cities' }),
  schema: pageSchema,
});

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: pageSchema,
});

const sizes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/sizes' }),
  schema: pageSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: pageSchema,
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: pageSchema,
});

const tools = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tools' }),
  schema: pageSchema,
});

export const collections = { cities, services, sizes, blog, legal, tools };
