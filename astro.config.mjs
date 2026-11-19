import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkFaqAccordion from './src/plugins/remark-faq-accordion.mjs';

export default defineConfig({
  site: 'https://floridadumpsterdirectory.com',
  output: 'static',
  integrations: [
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkFaqAccordion],
  },
});
