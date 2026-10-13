import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://reputationsdefender.com',
  integrations: [
    sitemap({
      // Utility pages should not compete with indexable content.
      filter: (page) => !page.includes('/404'),
    }),
  ],
  prefetch: false,
  compressHTML: true,
  build: {
    inlineStylesheets: 'never'
  },
  redirects: {
    '/privacy-guides/': '/resources/'
  }
});
