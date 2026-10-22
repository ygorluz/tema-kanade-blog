/**
 * Helper para gerar URL dos posts respeitando siteConfig.postUrlPrefix.
 * - postUrlPrefix === '' (default/URL limpa) ou ausente → /slug/
 * - postUrlPrefix === 'blog' → /blog/slug/
 * - postUrlPrefix === 'posts' → /posts/slug/
 */
import { readData } from './readData';

export function getPostUrlPrefix(): string {
  const siteConfig = readData<any>('siteConfig.json', {});
  const raw = siteConfig?.postUrlPrefix;
  if (raw === '' || raw === null || raw === undefined) return '';
  return String(raw).replace(/^\/+|\/+$/g, '');
}

export function postUrl(slugOrId: string): string {
  const clean = String(slugOrId || '').replace(/^\/+|\/+$/g, '');
  const prefix = getPostUrlPrefix();
  if (!prefix) {
    return `/${clean}/`;
  }
  return `/${prefix}/${clean}/`;
}
