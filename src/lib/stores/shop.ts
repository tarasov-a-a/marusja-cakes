import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { currency, priceIn, type Money } from '$lib/currency';
import type { CartItem, Product, User } from '$lib/types';

// ── Cart ──────────────────────────────────────────────────────────────────
export const cart = writable<CartItem[]>([]);

export function addToCart(
  product: Product,
  qty = 1,
  size = '',
  price?: Money,
): void {
  const headline = product.sizes[0];
  const unitPrice = price ?? headline.price;
  const sizeLabel = size || headline.size;
  cart.update((items) => {
    const key = product.id;
    const found = items.find((i) => i.key === key);
    if (found) {
      return items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
    }
    return [...items, { key, product, qty, size: sizeLabel, price: unitPrice }];
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
