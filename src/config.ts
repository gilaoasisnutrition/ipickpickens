/**
 * Site-wide configuration. Public values only — secrets (e.g. the Turnstile
 * SECRET key) belong in Worker vars/secrets, never here.
 */

/**
 * Cloudflare Turnstile SITE key (public). Create one (free) at
 * dash.cloudflare.com → Turnstile → Add site, then paste it here and set the
 * matching secret on the Worker:  npx wrangler secret put TURNSTILE_SECRET_KEY
 * While empty, the signup form works without a bot check.
 */
export const TURNSTILE_SITE_KEY = '';

/**
 * Cloudflare Web Analytics token (public). Create (free) at
 * dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site.
 * While empty, no analytics script is emitted.
 */
export const CF_ANALYTICS_TOKEN = '';

export const SITE_URL = 'https://ipickpickens.com';

export const SOCIALS = {
  facebook: 'https://www.facebook.com/cmichael.pickens',
  x: 'https://x.com/LibertarianLead',
  instagram: 'https://www.instagram.com/cmichaelpickens/',
  youtube: 'https://www.youtube.com/@CMichaelPickens/',
};

export const BOOKS = {
  libertarianLeadership:
    'https://www.amazon.com/Libertarian-Leadership-Planting-Seed-Future/dp/0983963525',
  liberatedMind:
    'https://www.amazon.com/Liberated-Mind-Rewire-Reclaim-Rewrite/dp/B0FFJ1XRYJ',
};
