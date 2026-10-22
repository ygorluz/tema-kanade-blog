import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { existsSync } from "node:fs";

const contentBase = existsSync("./src/content/blog") ? "./src/content/blog" : "./src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: contentBase }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(""),
    date: z.coerce.date().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional().default("Geral"),
    tags: z.array(z.string()).optional().default([]),
    cover: z.string().optional(),
    heroImage: z.string().optional(),
    coverImage: z.string().optional(),
    image: z.string().optional(),
    author: z.string().optional().default("Redação"),
    featured: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts, blog: posts };