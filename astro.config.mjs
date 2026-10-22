import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, existsSync } from 'node:fs';

let siteUrl = 'https://example.com';
try {
  if (existsSync('src/data/siteConfig.json')) {
    const cfg = JSON.parse(readFileSync('src/data/siteConfig.json', 'utf-8'));
    if (cfg.url) {
      let raw = String(cfg.url).trim().replace(/\/$/, '');
      if (raw && !/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
      if (raw) siteUrl = raw;
    }
  }
} catch {}

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const site = process.env.SITE_URL || env.SITE_URL || siteUrl;

export default defineConfig({
  site,
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [vue()],
  vite: { plugins: [tailwindcss()] },
});
