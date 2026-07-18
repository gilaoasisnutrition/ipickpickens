# IPickPickens.com

Professional showcase site for **C. Michael Pickens** — author, leadership
educator, Chair of the Libertarian Party of Washington, and host of
[Advancing Liberty Media](https://advancinglibertymedia.com). Domain:
[ipickpickens.com](https://ipickpickens.com).

> Note: Pickens has not filed for any office. Earlier drafts of this site were
> campaign-framed; the campaign components (Platform, Events, Endorsements,
> Donate, PDC disclaimer) were removed in the professional-showcase refresh and
> can be recovered from git history if he files later.

Built with [Astro](https://astro.build) (static output) and vanilla CSS. Deployed
to **Cloudflare Workers** using static assets.

---

## Tech stack
- **Astro 5** — static site generator, zero client JS by default
- **Vanilla CSS** with design tokens as CSS custom properties (`src/styles/global.css`)
- Two tiny vanilla-JS islands: the mobile nav toggle (`Nav.astro`) and the
  contact form (`Contact.astro`)
- Fonts: Besley (display), Archivo (utility/signage), Source Sans 3 (body) via
  Google Fonts with `font-display: swap`
- **Cloudflare Workers** static assets for hosting (`wrangler.jsonc`)

---

## Local development

```bash
npm install        # install dependencies
npm run dev        # start Astro dev server → http://localhost:4321
```

Other scripts:

```bash
npm run build          # build static site to ./dist
npm run preview        # preview the built ./dist with Astro
npm run wrangler:dev   # serve ./dist through the Cloudflare Workers runtime
npm run deploy         # wrangler deploy (see Deployment below)
```

---

## Project structure

```
public/
  assets/              # placeholder images + small static assets (see ASSETS.md)
  robots.txt
  favicon.svg
worker/
  index.js             # Cloudflare Worker: serves ./dist + POST /api/contact → KV + ALM webhook
src/
  config.ts            # public config: Turnstile site key, analytics token, scheduler + links
  assets/photos/       # real photos — optimized by Astro at build (WebP + srcset)
  layouts/
    BaseLayout.astro   # <head>, meta/OG tags, font loading, skip link
  styles/
    global.css         # design tokens, reset, shared primitives
  components/
    Nav.astro          # sticky nav + mobile menu (JS island)
    Ticker.astro       # scrolling keyword strip (razor-clam glyphs)
    Hero.astro         # eyebrow + two-line name + credential + CTAs + portrait
    ChartTexture.astro # signature nautical-chart SVG (hero background)
    TideDivider.astro  # signature tide-line section divider
    CelticTexture.astro# subtle Celtic knotwork lattice (heritage texture)
    Triquetra.astro    # Celtic trinity-knot accent glyph
    Principles.astro   # four Guiding Principles cards
    About.astro        # "A Leader of Leaders" bio + photo-thumbnail timeline + Hinkle pull-quote
    Highlight.astro    # Jack Canfield featured-interview section
    Livestream.astro   # daily weekday livestream section (w/ Dee Oh Gee)
    Books.astro        # compact books strip
    SevenPrinciples.astro # Seven Principles of Good Government (after Gary Johnson)
    Roots.astro        # Pacific County Roots photo strip
    Contact.astro      # scheduler CTA + contact form (→ /api/contact)
    Footer.astro       # nav repeat, socials
  pages/
    index.astro        # assembles the single-page site
wrangler.jsonc         # Cloudflare Workers static-assets config
```

---

## Replacing placeholder assets

All images are gradient-SVG placeholders. See **[ASSETS.md](./ASSETS.md)** for the
full inventory: every filename, its dimensions/aspect, where it appears, and a
ready-to-paste generation prompt for each scenery image.

Quick version: drop your real image into `public/assets/`, then search the repo
for the placeholder filename (e.g. `roots-oysters.svg`) and update the `src`.

> The hero portrait (`portrait-hero`) and the two book covers must be **real**
> images — never AI-generated.

---

## Deployment (Cloudflare Workers)

Hosting is configured in `wrangler.jsonc`:

```jsonc
{
  "name": "ipickpickens",
  "compatibility_date": "2026-07-01",
  "assets": { "directory": "./dist" }
}
```

First-time deploy (run by the campaign owner):

```bash
npm run build                 # produce ./dist
npx wrangler login            # authenticate with your Cloudflare account
npm run deploy                # wrangler deploy → publishes ./dist
```

Then, in the Cloudflare dashboard, attach the custom domain **ipickpickens.com**
to the Worker (Workers & Pages → your Worker → Settings → Domains & Routes).

To verify the Workers runtime locally before deploying:

```bash
npm run build
npm run wrangler:dev          # serves ./dist via the Workers runtime
```

---

## ⚠️ Before launch — items awaiting Michael's input

**Two paste-in values (blocked in this environment — needed from
AdvancingLibertyMedia.com):**
- `SCHEDULER_URL` in `src/config.ts` — the exact "book a call" scheduler link.
  Until pasted, all scheduler buttons land on AdvancingLibertyMedia.com itself.
- `CONTACT_WEBHOOK_URL` in `wrangler.jsonc` — the webhook endpoint the ALM
  contact form posts to. Until pasted, contact messages are only stored in KV
  (nothing is lost; the Worker forwards to the webhook once set).

**Draft copy** (marked in the code with `<!-- DRAFT COPY — verify with Michael -->`):
- Hero credential line, full bio, book blurbs, and the Hinkle pull-quote wording.
- Confirm the **exact current title** (Chair, LPWA), his role/wording for
  **Advancing Liberty Media**, and all timeline years/dates.

**Contact form backend** — ✅ live: `worker/index.js` stores messages in the
`ipickpickens-signups` KV namespace (keys prefixed `contact:`). Read them with
`npx wrangler kv key list --binding SIGNUPS` (add `--local` during dev).

**Optional hardening (5 min each, both free):**
- **Turnstile bot check** — dash.cloudflare.com → Turnstile → Add site; paste
  the site key into `src/config.ts`, then
  `npx wrangler secret put TURNSTILE_SECRET_KEY`. Until then the form works
  without a bot check.
- **Cloudflare Web Analytics** — dash.cloudflare.com → Web Analytics → Add a
  site; paste the token into `src/config.ts`.

**Assets:**
- Replace remaining placeholder images per [ASSETS.md](./ASSETS.md), including
  a real 1200×630 OG image (the meta tags reference `og-image.png`, which does
  not exist yet).
