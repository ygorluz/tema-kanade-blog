import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { existsSync } from "node:fs";

const contentBase = existsSync("./src/content/blog") ? "./src/content/blog" : "./src/content/posts";

// Coerção ultra-resiliente para campos gerados pelo GitCMS
const coerceString = (fallback = "") =>
  z.preprocess((val) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "object") return fallback;
    return String(val).trim();
  }, z.string().default(fallback));

const coerceDate = z.preprocess((val) => {
  if (!val) return undefined;
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;
  const d = new Date(String(val).trim());
  return isNaN(d.getTime()) ? undefined : d;
}, z.date().optional());

const coerceTags = z.preprocess((val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === "object") {
    // Trata tanto {} quanto { "0": "tag1", "1": "tag2" } enviados por formulários CMS
    return Object.values(val).map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  return [];
}, z.array(z.string()).default([]));

const coerceBoolean = (fallback = false) =>
  z.preprocess((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const lower = val.trim().toLowerCase();
      if (lower === "true" || lower === "1" || lower === "sim" || lower === "yes") return true;
      if (lower === "false" || lower === "0" || lower === "nao" || lower === "no") return false;
    }
    if (typeof val === "number") return val !== 0;
    return fallback;
  }, z.boolean().default(fallback));

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: contentBase }),
  schema: z.object({
    title: coerceString("Sem título"),
    description: coerceString(""),
    date: coerceDate,
    pubDate: coerceDate,
    updatedDate: coerceDate,
    category: coerceString("Geral"),
    tags: coerceTags,
    cover: coerceString("notes"),
    heroImage: coerceString(""),
    coverImage: coerceString(""),
    image: coerceString(""),
    author: coerceString("Equipe Sabixão"),
    featured: coerceBoolean(false),
    draft: coerceBoolean(false),
  }),
});

export const collections = { posts, blog: posts };