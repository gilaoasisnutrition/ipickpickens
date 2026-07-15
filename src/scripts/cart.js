/**
 * BE Canine — cart brain.
 *
 * Vanilla ES module that owns all cart state, persistence, rendering, and
 * drawer behavior for the one-page storefront. Self-initializes on import.
 *
 * Integration hooks (rendered elsewhere):
 *   - Add buttons:   button[data-add-to-cart][data-product-id]
 *   - Header toggle: #cart-toggle containing [data-cart-count] badge(s)
 *   - Drawer root:   #cart-drawer (see src/components/CartDrawer.astro)
 *
 * Checkout is a single clean boundary: when the [data-checkout] button is
 * enabled, clicking it calls initiateCheckout(buildCheckoutPayload(getCart()))
 * from ./checkout.js. Nothing else in this file knows about processors.
 */

import products from '../data/products.json';
import { initiateCheckout, buildCheckoutPayload } from './checkout.js';

const STORAGE_KEY = 'becanine:cart:v1';
const STORAGE_VERSION = 1;
const MIN_QTY = 1;
const MAX_QTY = 99;

/** Catalog lookup — unknown ids are ignored everywhere (defensive). */
const productById = new Map(
  (Array.isArray(products) ? products : [])
    .filter((p) => p && typeof p.id === 'string')
    .map((p) => [p.id, p])
);

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** All money math happens in integer cents to avoid float drift. */
const toCents = (price) => Math.round(Number(price) * 100);
const formatCents = (cents) => usd.format(cents / 100);

/** @type {Array<{id: string, qty: number}>} */
let items = [];

let drawer = null;
let panel = null;
let itemsEl = null;
let subtotalEl = null;
let lastFocused = null;

/** Timers for the transient "Added ✓" button feedback. */
const feedbackTimers = new WeakMap();

/* --------------------------------------------------------------------------
   Persistence
   -------------------------------------------------------------------------- */

function clampQty(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.min(MAX_QTY, Math.max(0, n));
}

/** Read + sanitize persisted state. Tolerates missing/corrupt/legacy data. */
function loadItems() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  // Accept {version, items:[...]} (current) or a bare array (legacy/lenient).
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.items)
      ? parsed.items
      : [];

  const seen = new Set();
  const clean = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const id = entry.id;
    const qty = clampQty(entry.qty);
    if (typeof id !== 'string' || !productById.has(id)) continue; // drop unknown ids
    if (seen.has(id) || qty < MIN_QTY) continue;
    seen.add(id);
    clean.push({ id, qty });
  }
  return clean;
}

function saveItems() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, items })
    );
  } catch {
    // Storage may be unavailable (private mode, quota) — cart still works in memory.
  }
}

/* --------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

/**
 * @returns {{items: Array<{id, slug, name, price, image, qty, lineTotal}>, count: number, subtotal: number}}
 */
export function getCart() {
  let subtotalCents = 0;
  let count = 0;
  const detailed = [];
  for (const line of items) {
    const product = productById.get(line.id);
    if (!product) continue;
    const unitCents = toCents(product.price);
    const lineCents = unitCents * line.qty;
    subtotalCents += lineCents;
    count += line.qty;
    detailed.push({
      id: product.id,
      slug: product.slug || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: line.qty,
      lineTotal: lineCents / 100,
    });
  }
  return { items: detailed, count, subtotal: subtotalCents / 100 };
}

export function addItem(id, qty = 1) {
  if (!productById.has(id)) return;
  const amount = clampQty(qty);
  if (amount < MIN_QTY) return;
  const line = items.find((entry) => entry.id === id);
  if (line) {
    line.qty = Math.max(MIN_QTY, clampQty(line.qty + amount));
  } else {
    items.push({ id, qty: amount });
  }
  commit();
}

/** qty of 0 (or less) removes the line; otherwise clamped to 1–99. */
export function setQty(id, qty) {
  const n = clampQty(qty);
  if (n < MIN_QTY) {
    removeItem(id);
    return;
  }
  const line = items.find((entry) => entry.id === id);
  if (line) {
    line.qty = n;
    commit();
  } else if (productById.has(id)) {
    items.push({ id, qty: n });
    commit();
  }
}

export function removeItem(id) {
  const next = items.filter((entry) => entry.id !== id);
  if (next.length === items.length) return;
  items = next;
  commit();
}

export function clear() {
  if (!items.length) return;
  items = [];
  commit();
}

function commit() {
  saveItems();
  render();
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: getCart() }));
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderBadges(count) {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('has-items', count > 0);
  });
}

function lineItemHtml(line) {
  const name = escapeHtml(line.name);
  const id = escapeHtml(line.id);
  const unitCents = toCents(line.price);
  return `
    <li class="cart-line" data-line-id="${id}">
      <img class="cart-line-thumb" src="${escapeHtml(line.image)}" alt="" width="56" height="64" loading="lazy" />
      <div class="cart-line-body">
        <p class="cart-line-name">${name}</p>
        <p class="cart-line-unit">${formatCents(unitCents)} <span class="cart-line-each">each</span></p>
        <div class="cart-line-qty" role="group" aria-label="Quantity of ${name}">
          <button type="button" class="cart-qty-btn" data-cart-qty="dec" data-product-id="${id}" aria-label="Decrease quantity of ${name}">&minus;</button>
          <span class="cart-qty-value" aria-hidden="true">${line.qty}</span>
          <button type="button" class="cart-qty-btn" data-cart-qty="inc" data-product-id="${id}" aria-label="Increase quantity of ${name}"${line.qty >= MAX_QTY ? ' disabled' : ''}>+</button>
        </div>
      </div>
      <div class="cart-line-side">
        <button type="button" class="cart-line-remove" data-cart-remove data-product-id="${id}" aria-label="Remove ${name} from cart" title="Strike from ledger">&#10005;</button>
        <p class="cart-line-total">${formatCents(unitCents * line.qty)}</p>
      </div>
    </li>`;
}

function renderDrawer(cart) {
  if (itemsEl) {
    itemsEl.innerHTML = cart.items.length
      ? cart.items.map(lineItemHtml).join('')
      : `
        <li class="cart-empty">
          <span class="cart-empty-flourish" aria-hidden="true">&#10086;</span>
          <p class="cart-empty-text">Your satchel is empty.</p>
          <a class="cart-empty-link" href="#products" data-cart-close>Browse the collection</a>
        </li>`;
  }
  if (subtotalEl) {
    subtotalEl.textContent = formatCents(toCents(cart.subtotal));
  }
}

function render() {
  const cart = getCart();
  renderBadges(cart.count);
  renderDrawer(cart);
}

/* --------------------------------------------------------------------------
   Drawer behavior
   -------------------------------------------------------------------------- */

function isOpen() {
  return Boolean(drawer && drawer.classList.contains('is-open'));
}

function openDrawer() {
  if (!drawer || isOpen()) return;
  lastFocused = document.activeElement;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
  const target =
    (panel && panel.querySelector('[data-cart-close]')) || panel || drawer;
  window.requestAnimationFrame(() => {
    if (target && typeof target.focus === 'function') target.focus();
  });
}

function closeDrawer() {
  if (!drawer || !isOpen()) return;
  // Restore focus before making the drawer inert so focus never gets trapped.
  const toggle = document.getElementById('cart-toggle');
  const target = toggle || lastFocused;
  if (target && typeof target.focus === 'function') target.focus();
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('inert', '');
  document.body.style.overflow = '';
  lastFocused = null;
}

/** Focus a control inside the drawer after a re-render, with a safe fallback. */
function refocusInDrawer(selector) {
  if (!panel) return;
  const el = selector ? panel.querySelector(selector) : null;
  const fallback = panel.querySelector('[data-cart-close]');
  const target = el || fallback || panel;
  if (target && typeof target.focus === 'function') target.focus();
}

/* --------------------------------------------------------------------------
   Events
   -------------------------------------------------------------------------- */

function showAddedFeedback(button) {
  if (!('cartLabel' in button.dataset)) {
    button.dataset.cartLabel = button.innerHTML;
  }
  const pending = feedbackTimers.get(button);
  if (pending) clearTimeout(pending);
  button.classList.add('is-added');
  button.textContent = 'Added ✓';
  feedbackTimers.set(
    button,
    setTimeout(() => {
      button.innerHTML = button.dataset.cartLabel;
      button.classList.remove('is-added');
      feedbackTimers.delete(button);
    }, 1200)
  );
}

function onDocumentClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  // Add to cart (product grid buttons rendered elsewhere).
  const addBtn = target.closest('[data-add-to-cart][data-product-id]');
  if (addBtn) {
    const id = addBtn.getAttribute('data-product-id');
    if (id && productById.has(id)) {
      addItem(id);
      showAddedFeedback(addBtn);
      openDrawer();
    }
    return;
  }

  // Header toggle.
  if (target.closest('#cart-toggle')) {
    if (isOpen()) closeDrawer();
    else openDrawer();
    return;
  }

  // Close controls: overlay, ✕ button, "continue browsing", empty-state link.
  // No preventDefault — the empty-state anchor still navigates to #products.
  if (target.closest('[data-cart-close]')) {
    closeDrawer();
    return;
  }

  // Quantity stepper inside the drawer.
  const qtyBtn = target.closest('[data-cart-qty][data-product-id]');
  if (qtyBtn && drawer && drawer.contains(qtyBtn)) {
    const id = qtyBtn.getAttribute('data-product-id');
    const dir = qtyBtn.getAttribute('data-cart-qty');
    const line = items.find((entry) => entry.id === id);
    if (line) {
      setQty(id, line.qty + (dir === 'inc' ? 1 : -1));
      refocusInDrawer(`[data-cart-qty="${dir}"][data-product-id="${CSS.escape(id)}"]`);
    }
    return;
  }

  // Strike a line from the ledger.
  const removeBtn = target.closest('[data-cart-remove][data-product-id]');
  if (removeBtn && drawer && drawer.contains(removeBtn)) {
    removeItem(removeBtn.getAttribute('data-product-id'));
    refocusInDrawer(null);
    return;
  }

  // Checkout boundary — disabled today ("coming soon"); if a processor
  // integration enables the button, this is the only handoff point.
  const checkoutBtn = target.closest('[data-checkout]');
  if (checkoutBtn && drawer && drawer.contains(checkoutBtn) && !checkoutBtn.disabled) {
    initiateCheckout(buildCheckoutPayload(getCart()));
  }
}

function onKeydown(event) {
  if (!isOpen()) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer();
    return;
  }

  // Keep Tab focus inside the open dialog.
  if (event.key !== 'Tab' || !panel) return;
  const focusables = panel.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Keep multiple open tabs in sync. */
function onStorage(event) {
  if (event.key !== STORAGE_KEY) return;
  items = loadItems();
  render();
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: getCart() }));
}

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */

function init() {
  drawer = document.getElementById('cart-drawer');
  panel = drawer ? drawer.querySelector('.cart-panel') : null;
  itemsEl = drawer ? drawer.querySelector('[data-cart-items]') : null;
  subtotalEl = drawer ? drawer.querySelector('[data-cart-subtotal]') : null;

  items = loadItems();
  render();

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('storage', onStorage);
}

// Module scripts run after parsing, but guard anyway.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
