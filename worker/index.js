/**
 * IPickPickens.com Worker.
 *
 * Serves the static Astro build (ASSETS binding) and handles the Contact
 * form at POST /api/contact:
 *   - optional Cloudflare Turnstile verification (enforced only when the
 *     TURNSTILE_SECRET_KEY secret is set: npx wrangler secret put TURNSTILE_SECRET_KEY)
 *   - stores each message as JSON in the SIGNUPS KV namespace
 *   - forwards each message to the Libertarian Leadership Academy webhook when
 *     CONTACT_WEBHOOK_URL is set (wrangler.jsonc vars) — the same endpoint
 *     the Libertarian Leadership Academy contact form posts to
 *
 * Read stored messages any time with:
 *   npx wrangler kv key list --namespace-id <id>
 *   npx wrangler kv key get <key> --namespace-id <id>
 */

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // /api/signup kept as an alias for any cached pages still posting there.
    if (url.pathname === '/api/contact' || url.pathname === '/api/signup') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
          status: 405,
          headers: JSON_HEADERS,
        });
      }
      return handleContact(request, env, ctx);
    }

    const response = await env.ASSETS.fetch(request);

    // Keep staging / workers.dev copies out of search results — only the real
    // domain should be indexed (avoids duplicate-content penalties too).
    const PROD_HOSTS = ['ipickpickens.com', 'www.ipickpickens.com'];
    if (!PROD_HOSTS.includes(url.hostname)) {
      const marked = new Response(response.body, response);
      marked.headers.set('X-Robots-Tag', 'noindex');
      return marked;
    }
    return response;
  },
};

async function handleContact(request, env, ctx) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'Expected form data.' });
  }

  const name = (form.get('name') || '').toString().trim().slice(0, 200);
  const email = (form.get('email') || '').toString().trim().slice(0, 200);
  const message = (form.get('message') || '').toString().trim().slice(0, 4000);
  const interest = form.getAll('interest').map((h) => h.toString().slice(0, 60));

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: 'Please provide your name and a valid email.' });
  }

  // Turnstile bot check — enforced only when the secret is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = (form.get('cf-turnstile-response') || '').toString();
    const verified = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request);
    if (!verified) {
      return json(403, { ok: false, error: 'Bot check failed — please try again.' });
    }
  }

  if (!env.SIGNUPS) {
    return json(503, { ok: false, error: 'Message storage is not configured yet.' });
  }

  const record = {
    name,
    email,
    interest,
    message,
    at: new Date().toISOString(),
    ua: request.headers.get('user-agent') || '',
  };
  // Key sorts chronologically; suffix avoids collisions within the same ms.
  const key = `contact:${record.at}:${crypto.randomUUID().slice(0, 8)}`;
  await env.SIGNUPS.put(key, JSON.stringify(record));

  // Forward to the Academy webhook after responding; KV already has the copy, so
  // a webhook hiccup never loses the message or fails the visitor.
  if (env.CONTACT_WEBHOOK_URL) {
    ctx.waitUntil(
      fetch(env.CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify(record),
      }).catch(() => {})
    );
  }

  // No-JS fallback: regular form posts get redirected back with a flag.
  const accepts = request.headers.get('accept') || '';
  if (!accepts.includes('application/json')) {
    return Response.redirect(new URL('/?contact=thanks#contact', request.url).toString(), 303);
  }
  return json(200, { ok: true });
}

async function verifyTurnstile(secret, token, request) {
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: request.headers.get('cf-connecting-ip') || '',
    }),
  });
  const data = await res.json();
  return !!data.success;
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
