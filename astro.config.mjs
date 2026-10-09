import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://reputationsdefender.com',
  integrations: [sitemap()],
  prefetch: false,
  compressHTML: true,
  build: {
    inlineStylesheets: 'never'
  }
});
