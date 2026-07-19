# BE Canine — becanine.com

One-page storefront for **BE Canine**, the pet line of Botanical Enlightenment: premium botanical nutrition supplements for dogs, styled after an 18th–19th century herbalist's field guide.

## Tech stack

- **[Astro 5](https://astro.build)** — fully static output (`astro build` → `dist/`)
- **Vanilla JS cart** — no framework; cart state persists in `localStorage`
- **Cloudflare Workers** — static assets hosting via `wrangler.jsonc`, with a tiny Worker (`worker/index.js`) in front for the `/api/subscribe` stub
- **Fonts** — IM Fell English, IM Fell English SC, and EB Garamond, self-hosted via [Fontsource](https://fontsource.org) (no third-party font CDN at runtime)

## Local development

```sh
npm install
npm run dev            # Astro dev server → http://localhost:4321
npm run build          # static build → dist/
npm run preview        # preview the built site
npm run wrangler:dev   # run the Worker locally: serves dist/ + POST /api/subscribe stub
```

Note: `wrangler:dev` serves the **built** site, so run `npm run build` first.

## Project structure

```
├── astro.config.mjs
├── wrangler.jsonc              # Workers config: assets binding + (commented) custom-domain routes
├── worker/
│   └── index.js                # serves dist/ via ASSETS binding; POST /api/subscribe stub
├── public/
│   ├── favicon.svg
│   └── assets/                 # engraved SVG plates (og-image, hero, products/)
│       └── products/           # one numbered botanical plate per product
└── src/
    ├── components/             # one .astro file per page section
    ├── data/
    │   └── products.json       # the product catalog (see below)
    ├── layouts/
    ├── pages/
    │   └── index.astro         # the one page
    ├── scripts/
    │   ├── cart.js             # vanilla cart, localStorage-backed
    │   └── checkout.js         # checkout boundary (see CHECKOUT.md)
    └── styles/
```

## Swapping in real products

Everything product-related lives in `src/data/products.json`. Each entry:

| Field | Meaning |
| --- | --- |
| `id` | stable unique identifier (used by the cart) |
| `slug` | URL/DOM-friendly handle |
| `name` | display name |
| `shortDescription` | one-line card copy |
| `price` | USD as a plain number (e.g. `34`) |
| `image` | path under `public/` (e.g. `/assets/products/calm-blend.svg`) |
| `badges` | array of short label strings shown on the card |
| `inStock` | boolean; out-of-stock disables the add-to-cart button |

Drop real product photography into `public/assets/products/` and point each `image` field at it — no code changes needed.

## Deployment (Cloudflare Workers)

```sh
npx wrangler login   # once
npm run deploy       # astro build + wrangler deploy
```

The first deploy serves the site at `becanine.<account>.workers.dev`.

### Deploy via GitHub Actions (no local setup)

`.github/workflows/deploy.yml` builds and deploys on every push to the build
branch (or manually via *Actions → Deploy becanine to Cloudflare Workers →
Run workflow*). One-time setup:

1. Create an API token at *dash.cloudflare.com → My Profile → API Tokens*
   using the **Edit Cloudflare Workers** template.
2. Add it as the `CLOUDFLARE_API_TOKEN` repository secret (*Settings →
   Secrets and variables → Actions*). If the token can see more than one
   account, also add `CLOUDFLARE_ACCOUNT_ID`.

### Custom domain: becanine.com

1. Add the `becanine.com` zone to the same Cloudflare account.
2. Either uncomment the `routes` block in `wrangler.jsonc` (`custom_domain: true` entries for the apex and `www`) and redeploy, **or** attach it in the dashboard: *Workers & Pages → becanine → Settings → Domains & Routes*.

DNS records are created automatically for custom domains on Workers — no manual A/CNAME records needed.

## Email capture

The front end POSTs `{ "email": "..." }` to `/api/subscribe`. `worker/index.js` currently just validates and returns success — it is a stub. Wire a real destination there: a KV namespace binding, or a provider API call (Mailchimp, Resend, Klaviyo, etc.). The handler is the single place to change.

## Checkout

See `CHECKOUT.md`. The integration boundary is `initiateCheckout(cartPayload)` in `src/scripts/checkout.js`; the checkout button ships disabled until a payment provider is wired in.

## Editorial guardrails

Site copy is premium **nutrition/wellness** positioning only: structure–function language (supports, maintains, promotes), never disease-treatment claims. The standard FDA structure–function disclaimer lives in the site footer — keep it there. When editing copy or product data, stay within these rules.
