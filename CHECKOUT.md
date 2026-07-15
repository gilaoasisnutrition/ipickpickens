# Checkout Integration

## Architecture

The cart UI and checkout are separated by exactly **one function call**:

```js
// src/scripts/cart.js — the only place checkout is invoked
initiateCheckout(buildCheckoutPayload(getCart()));
```

Everything cart-related (state, localStorage persistence, drawer rendering,
badges, events) lives in `src/scripts/cart.js` and knows nothing about payment
processors. Everything processor-related lives in `src/scripts/checkout.js`.
Swapping or adding a processor never touches the cart UI.

Today `initiateCheckout()` is a documented stub: it logs the payload and
returns `{ status: 'pending', reason: 'no-processor-configured' }`. The
drawer's checkout button (`[data-checkout]` in
`src/components/CartDrawer.astro`) is rendered `disabled` with the label
"Checkout — Coming Soon".

## Payload shape (version 1)

`buildCheckoutPayload(cart)` produces:

```json
{
  "version": 1,
  "currency": "USD",
  "items": [
    {
      "id": "joint-support",
      "slug": "joint-support",
      "name": "Sound Stride — Hip & Joint Botanical Blend",
      "unitPriceCents": 4800,
      "quantity": 2,
      "lineTotalCents": 9600
    }
  ],
  "subtotalCents": 9600,
  "itemCount": 2,
  "createdAt": "2026-07-15T12:00:00.000Z"
}
```

Notes:

- All money is **integer cents** — no floating-point dollar values cross the
  boundary.
- `id` equals `slug` for the current catalog (`src/data/products.json`).
- `subtotalCents` is the sum of `lineTotalCents`; `itemCount` is the sum of
  `quantity` (each quantity is clamped to 1–99).
- `createdAt` is an ISO 8601 timestamp of when the payload was built.

## Plugging in a processor (Stripe, Shopify, Paddle, ...)

1. **Implement inside `initiateCheckout()`** in `src/scripts/checkout.js`:
   POST the payload to a server-side route — e.g. a Cloudflare Worker route
   such as `/api/checkout` in `worker/index.js` — which creates a checkout
   session with the processor's secret key and returns the session URL. Then
   redirect the browser (`window.location.assign(sessionUrl)`).
   The server must re-derive prices from the product catalog and treat the
   client payload as a claim, never as a source of truth for amounts.
2. **Enable the button**: remove the `disabled` attribute from the
   `[data-checkout]` button in `src/components/CartDrawer.astro` and update
   its label (e.g. "Proceed to Checkout"). `cart.js` already listens for
   clicks on the enabled button and performs the handoff.
3. **Nothing else changes.** Cart state, drawer rendering, badges, and
   persistence are untouched.
