// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://debanjanc01.github.io/portfolio-web',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
