// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output — Astro builds to ./dist, which Cloudflare Workers serves
// directly as static assets (see wrangler.jsonc). No SSR adapter needed.
export default defineConfig({
  site: 'https://ipickpickens.com',
  output: 'static',
  integrations: [sitemap()],
  build: {
    // Emit clean directory-style URLs (e.g. /about/ -> /about/index.html)
    format: 'directory',
  },
});
