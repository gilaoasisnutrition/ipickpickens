/**
 * Cloudflare Worker for becanine.com.
 *
 * - Serves the static Astro build (./dist) via the ASSETS binding.
 * - POST /api/subscribe — email-capture STUB. It validates the address and
 *   returns success without storing anything yet. To go live, replace the
 *   marked block with a real destination (Cloudflare KV, D1, or an email
 *   provider API such as Mailchimp/Resend/Kit) — the front-end contract
 *   stays the same.
 *
 * Contract:
 *   Request:  POST /api/subscribe  { "email": "person@example.com" }
 *   Response: 200 { "ok": true }   |   400 { "ok": false, "error": "..." }
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }
      let email = '';
      try {
        ({ email = '' } = await request.json());
      } catch {
        return json({ ok: false, error: 'Invalid JSON body' }, 400);
      }
      email = String(email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        return json({ ok: false, error: 'Please enter a valid email address' }, 400);
      }

      // ── STUB ─────────────────────────────────────────────────────────
      // Store `email` here (KV put, D1 insert, or provider API call).
      // ─────────────────────────────────────────────────────────────────

      return json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  },
};
