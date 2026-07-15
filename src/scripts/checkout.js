/**
 * BE Canine — checkout boundary.
 *
 * This module is the ONLY seam between the cart UI (src/scripts/cart.js) and
 * any future payment processor. The cart calls exactly one function —
 * initiateCheckout(buildCheckoutPayload(getCart())) — and knows nothing else.
 *
 * Payload shape (version 1) passed to initiateCheckout:
 *
 *   {
 *     "version": 1,
 *     "currency": "USD",
 *     "items": [
 *       {
 *         "id": "joint-support",        // product id (equals slug)
 *         "slug": "joint-support",
 *         "name": "Sound Stride — Hip & Joint Botanical Blend",
 *         "unitPriceCents": 4800,       // integer cents, no float drift
 *         "quantity": 2,                // 1–99
 *         "lineTotalCents": 9600        // unitPriceCents * quantity
 *       }
 *     ],
 *     "subtotalCents": 9600,            // sum of lineTotalCents
 *     "itemCount": 2,                   // sum of quantities
 *     "createdAt": "2026-07-15T12:00:00.000Z"  // ISO 8601
 *   }
 *
 * Plugging in a processor (Stripe, Shopify, Paddle, ...):
 *   1. Implement the integration entirely inside initiateCheckout(): POST the
 *      payload to a server-side route (e.g. a Cloudflare Worker at
 *      /api/checkout) that creates a checkout session with the processor's
 *      secret key — prices must be re-derived server-side from the catalog,
 *      never trusted from the client — then redirect the browser to the
 *      session URL it returns.
 *   2. Remove the `disabled` attribute from the drawer's [data-checkout]
 *      button (src/components/CartDrawer.astro) and update its label.
 *   3. That's it. No cart UI, state, or storage code changes.
 *
 * See CHECKOUT.md at the repo root for the same contract in prose.
 */

/**
 * Convert the cart snapshot from getCart() into the version-1 checkout
 * payload documented above. Pure function; safe to call with a missing or
 * malformed cart (yields an empty payload).
 *
 * @param {{items?: Array<{id: string, slug?: string, name: string, price: number, qty: number}>}} cart
 * @returns {{version: 1, currency: 'USD', items: Array<object>, subtotalCents: number, itemCount: number, createdAt: string}}
 */
export function buildCheckoutPayload(cart) {
  const source = cart && Array.isArray(cart.items) ? cart.items : [];

  const items = source.map((line) => {
    const unitPriceCents = Math.round(Number(line.price) * 100);
    const quantity = Math.min(99, Math.max(1, Math.floor(Number(line.qty) || 1)));
    return {
      id: line.id,
      slug: line.slug || line.id,
      name: line.name,
      unitPriceCents,
      quantity,
      lineTotalCents: unitPriceCents * quantity,
    };
  });

  return {
    version: 1,
    currency: 'USD',
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Begin checkout for the given payload.
 *
 * STUB — no payment processor is configured yet. Logs the payload it would
 * send and reports back to the caller. Replace the body of this function
 * (and only this function) when wiring up a real processor; the cart UI
 * requires no changes.
 *
 * @param {ReturnType<typeof buildCheckoutPayload>} cartPayload
 * @returns {{status: 'pending', reason: 'no-processor-configured'}}
 */
export function initiateCheckout(cartPayload) {
  console.info('[becanine] initiateCheckout called — no processor configured yet.', cartPayload);
  return { status: 'pending', reason: 'no-processor-configured' };
}
