// @ts-check
import { defineConfig } from 'astro/config';

// Static output — Astro builds to ./dist, which Cloudflare Workers serves
// directly as static assets (see wrangler.jsonc). No SSR adapter needed.
export default defineConfig({
  site: 'https://becanine.com',
  output: 'static',
  build: {
    format: 'directory',
  },
});
