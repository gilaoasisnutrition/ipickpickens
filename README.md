# IPickPickens.com

Campaign website for **C. Michael Pickens**, candidate for **Pacific County
Commissioner (Washington), 2028**. Slogan & domain: **I Pick Pickens** —
[ipickpickens.com](https://ipickpickens.com).

Built with [Astro](https://astro.build) (static output) and vanilla CSS. Deployed
to **Cloudflare Workers** using static assets.

---

## Tech stack
- **Astro 5** — static site generator, zero client JS by default
- **Vanilla CSS** with design tokens as CSS custom properties (`src/styles/global.css`)
- Two tiny vanilla-JS islands: the mobile nav toggle (`Nav.astro`) and the
  donation panel interactions (`DonateWidget.astro`)
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
  assets/              # placeholder images (see ASSETS.md) — swap in real photos
  favicon.svg
src/
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
    About.astro        # "A Leader of Leaders" bio + timeline + Hinkle pull-quote
    Books.astro        # two book cards
    Platform.astro     # six county-scoped issue cards
    Roots.astro        # Pacific County Roots photo strip
    Endorsements.astro # designed "coming soon" grid
    Events.astro       # placeholder event list w/ sample entry
    GetInvolved.astro  # signup form UI (non-functional)
    DonateWidget.astro # donation panel placeholder (swappable)
    Footer.astro       # nav repeat, socials, PDC disclaimer box
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

## ⚠️ Before launch — items awaiting candidate/committee input

**Draft copy** (marked in the code with `<!-- DRAFT COPY — verify with candidate -->`):
- Hero credential line, full bio, all Platform positions, book blurbs, the Hinkle
  pull-quote wording, and the donation trust line.
- Confirm the candidate's **exact current title** (Chair, LPWA) and all timeline
  years/dates.

**Functional TODOs** (marked with `data-todo="…"` or `TODO:` in the code):
- `form-backend` — Get Involved signup form has no backend wired.
- `donate-embed` — DonateWidget is visual-only. **TODO: replace with the Give
  Gold Payments embed.**
- `amazon-link` — book "Get the Book" buttons need real purchase URLs.
- `events` / `endorsements` — placeholder content to be replaced with real data.
- Social links (`facebook-url`, `x-url`, `instagram-url`, `youtube-url`) in the footer.

**Compliance:**
- The footer disclaimer box (`Paid for by [Committee Name TBD] — [Address TBD]`)
  must be finalized. Confirm **Washington State PDC** requirements (committee
  registration, contribution limits, employer/occupation collection, and exact
  disclaimer language) **before accepting any contributions**. Ref:
  <https://www.pdc.wa.gov/>.

**Assets:**
- Replace all placeholder images per [ASSETS.md](./ASSETS.md), including a real
  candidate portrait and a real 1200×630 OG image.
