import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { currency, priceIn } from '$lib/currency';
import { getProductById } from '$lib/data/products';
import type { CartItem, Product, SizeKey, User } from '$lib/types';

// ── Cart ──────────────────────────────────────────────────────────────────
// The cart is the one piece of shopping state we persist (locale being the
// other, in i18n). We store a *minimal* form — only the product id, quantity and
// chosen size key. The `product` snapshot and the unit `price` are NOT persisted;
// both are re-derived from the catalogue (the source of truth) on load, so a
// stored cart always reflects current product config and prices. See loadCart().
export const CART_STORAGE_KEY = 'marusja-cakes-cart';

/** What actually lives in localStorage: just enough to rehydrate a cart line. */
interface StoredCartItem {
  key: string;
  qty: number;
  size: SizeKey;
}

function serializeCart(items: CartItem[]): StoredCartItem[] {
  return items.map(({ key, qty, size }) => ({ key, qty, size }));
}

/**
 * Read the persisted cart and rehydrate each line from the catalogue: re-attach
 * the product and recompute the unit price from its current `sizes` config.
 * Lines are silently dropped when the product no longer exists, the chosen size
 * is no longer offered, or the stored shape is malformed — a corrupt or stale
 * entry never breaks load. Returns `[]` off the browser and on any parse failure.
 */
export function loadCart(): CartItem[] {
  if (!browser) return [];
  let raw: string | null;
  try {
    raw = localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const { key, qty, size } = entry as Record<string, unknown>;
      if (
        typeof key !== 'string' ||
        typeof size !== 'string' ||
        typeof qty !== 'number' ||
        !Number.isFinite(qty) ||
        qty <= 0
      ) {
        continue;
      }
      const product = getProductById(key);
      if (!product) continue;
      const opt = product.sizes.find((s) => s.size === size);
      if (!opt) continue; // chosen size discontinued — drop the line
      items.push({ key, product, qty, size: opt.size, price: opt.price });
    }
    return items;
  } catch {
    return [];
  }
}

export const cart = writable<CartItem[]>(loadCart());

// Mirror every cart mutation back to localStorage. Runs once immediately with
// the loaded value (a harmless round-trip) and on each change thereafter.
if (browser) {
  cart.subscribe((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializeCart(items)));
    } catch {
      // Storage unavailable or over quota — keep the in-memory cart working.
    }
  });
}

export function addToCart(product: Product, qty = 1, size?: SizeKey): void {
  // Price always comes from the catalogue — the chosen size's config price, or
  // the headline (default) size when none/an unknown one is given.
  const opt = product.sizes.find((s) => s.size === size) ?? product.sizes[0];
  cart.update((items) => {
    const key = product.id;
    const found = items.find((i) => i.key === key);
    if (found) {
      return items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
    }
    return [...items, { key, product, qty, size: opt.size, price: opt.price }];
  });
}

export function updateQty(key: string, delta: number): void {
  cart.update((items) =>
    items
      .map((i) => (i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
      .filter((i) => i.qty > 0),
  );
}

export function removeItem(key: string): void {
  cart.update((items) => items.filter((i) => i.key !== key));
}

export const cartCount = derived(cart, ($cart) =>
  $cart.reduce((sum, i) => sum + i.qty, 0),
);

// Subtotal in the active currency — re-derives when the cart OR currency changes.
export const subtotal = derived([cart, currency], ([$cart, $currency]) =>
  $cart.reduce((sum, i) => sum + i.qty * priceIn(i.price, $currency), 0),
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const user = writable<User | null>(null);
export const authOpen = writable(false);

export function setUser(value: User | null): void {
  user.set(value);
}

export function setAuthOpen(open: boolean): void {
  authOpen.set(open);
}

// ── Toast ─────────────────────────────────────────────────────────────────
export const toast = writable<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function flash(message: string): void {
  if (!browser) return;
  if (toastTimer) clearTimeout(toastTimer);
  toast.set(message);
  toastTimer = setTimeout(() => {
    toast.set(null);
    toastTimer = null;
  }, 2200);
}

/** Read the current cart synchronously (used in event handlers). */
export const cartSnapshot = () => get(cart);
