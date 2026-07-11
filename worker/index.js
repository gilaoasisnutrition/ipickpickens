/**
 * IPickPickens.com Worker.
 *
 * Serves the static Astro build (ASSETS binding) and handles the Get Involved
 * signup form at POST /api/signup:
 *   - optional Cloudflare Turnstile verification (enforced only when the
 *     TURNSTILE_SECRET_KEY secret is set: npx wrangler secret put TURNSTILE_SECRET_KEY)
 *   - stores each signup as JSON in the SIGNUPS KV namespace
 *
 * Read signups any time with:
 *   npx wrangler kv key list --namespace-id <id>
 *   npx wrangler kv key get <key> --namespace-id <id>
 */

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/signup') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
          status: 405,
          headers: JSON_HEADERS,
        });
      }
      return handleSignup(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleSignup(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'Expected form data.' });
  }

  const name = (form.get('name') || '').toString().trim().slice(0, 200);
  const email = (form.get('email') || '').toString().trim().slice(0, 200);
  const zip = (form.get('zip') || '').toString().trim().slice(0, 10);
  const help = form.getAll('help').map((h) => h.toString().slice(0, 60));

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
    return json(503, { ok: false, error: 'Signup storage is not configured yet.' });
  }

  const record = {
    name,
    email,
    zip,
    help,
    at: new Date().toISOString(),
    ua: request.headers.get('user-agent') || '',
  };
  // Key sorts chronologically; suffix avoids collisions within the same ms.
  const key = `signup:${record.at}:${crypto.randomUUID().slice(0, 8)}`;
  await env.SIGNUPS.put(key, JSON.stringify(record));

  // No-JS fallback: regular form posts get redirected back with a flag.
  const accepts = request.headers.get('accept') || '';
  if (!accepts.includes('application/json')) {
    return Response.redirect(new URL('/?signup=thanks#get-involved', request.url).toString(), 303);
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
