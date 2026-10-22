import { getCollection, type CollectionEntry } from "astro:content";
import { postUrl } from "./postUrl";

export type PostSummary = {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  cover: string;
  heroImage?: string;
  author: string;
  featured: boolean;
  minutes: number;
};

export async function getPosts(): Promise<CollectionEntry<"posts">[]> {
  const collection = await getCollection("posts", ({ data }: any) => !data.draft);
  return collection.sort((a: any, b: any) => {
    const dateA = a.data.pubDate || a.data.date || new Date(0);
    const dateB = b.data.pubDate || b.data.date || new Date(0);
    return new Date(dateB).valueOf() - new Date(dateA).valueOf();
  });
}

export function summarize(post: CollectionEntry<"posts">): PostSummary {
  const d = post.data.pubDate || post.data.date || new Date();
  const dateObj = d instanceof Date ? d : new Date(d);
  const dateStr = isNaN(dateObj.getTime()) ? new Date().toISOString().slice(0, 10) : dateObj.toISOString().slice(0, 10);
  const bodyText = post.body || "";
  const wordsCount = bodyText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordsCount / 200));

  return {
    id: post.id,
    url: postUrl(post.id),
    title: post.data.title,
    description: post.data.description || "",
    date: dateStr,
    category: post.data.category || "Geral",
    tags: Array.isArray(post.data.tags) ? post.data.tags : [],
    cover: post.data.cover || "notes",
    heroImage: post.data.heroImage || post.data.image || post.data.coverImage || "",
    author: post.data.author || "Redação",
    featured: Boolean(post.data.featured),
    minutes,
  };
}

export function getCategories(posts: PostSummary[]): string[] {
  const set = new Set(posts.map(p => p.category).filter(Boolean));
  return set.size ? [...set] : ["Tecnologia", "Criatividade", "Design", "Produtividade"];
}

export function getTags(posts: PostSummary[]): string[] {
  return [...new Set(posts.flatMap(post => post.tags))].filter(Boolean);
}