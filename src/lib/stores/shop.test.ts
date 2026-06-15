import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { PRODUCTS } from '$lib/data/products';
import type { Product } from '$lib/types';
import {
  addToCart,
  authOpen,
  cart,
  CART_STORAGE_KEY,
  cartCount,
  cartSnapshot,
  flash,
  loadCart,
  removeItem,
  setAuthOpen,
  setUser,
  subtotal,
  toast,
  updateQty,
  user,
} from './shop';

const product = (id: string, price = 100): Product => ({
  id,
  rating: 5,
  reviews: 0,
  category: ['signature'],
  grad: ['#000', '#fff'],
  tags: ['new'],
  allergensKey: 'eggsDairyWheat',
  sizes: [{ size: 'full', price: { egp: price, rub: price }, servesKey: '8' }],
});

/** A cake offered in all three formats, for exercising size-keyed pricing. */
const multiSizeProduct = (id: string): Product => ({
  ...product(id),
  sizes: [
    { size: 'full', price: { egp: 700, rub: 700 }, servesKey: '8' },
    { size: 'half', price: { egp: 400, rub: 400 }, servesKey: '4' },
    { size: 'slice', price: { egp: 90, rub: 90 }, servesKey: '1' },
  ],
});

beforeEach(() => {
  cart.set([]);
  user.set(null);
  authOpen.set(false);
  toast.set(null);
});

describe('shop store — cart', () => {
  describe('addToCart', () => {
    it('adds a new line, defaulting to the headline (full) size', () => {
      addToCart(product('cocoa-grove'));
      const items = get(cart);
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ key: 'cocoa-grove', qty: 1, size: 'full' });
    });

    it('derives the unit price from the catalogue for the chosen size', () => {
      addToCart(product('a', 250)); // single-size cake → headline price
      addToCart(multiSizeProduct('b'), 1, 'half'); // half-cake config price
      const [a, b] = get(cart);
      expect(a.price).toEqual({ egp: 250, rub: 250 });
      expect(b).toMatchObject({ size: 'half', price: { egp: 400, rub: 400 } });
    });

    it('falls back to the headline size when the given size is unknown', () => {
      // @ts-expect-error — exercising a size key that isn't in the config
      addToCart(multiSizeProduct('a'), 1, 'gigantic');
      expect(get(cart)[0]).toMatchObject({ size: 'full', price: { egp: 700, rub: 700 } });
    });

    it('respects custom qty and size', () => {
      addToCart(multiSizeProduct('a'), 3, 'half');
      expect(get(cart)[0]).toMatchObject({ qty: 3, size: 'half', price: { egp: 400, rub: 400 } });
    });

    it('increments quantity instead of duplicating an existing line', () => {
      addToCart(product('a'), 1);
      addToCart(product('a'), 2);
      const items = get(cart);
      expect(items).toHaveLength(1);
      expect(items[0].qty).toBe(3);
    });
  });

  describe('updateQty', () => {
    it('applies a positive delta', () => {
      addToCart(product('a'), 1);
      updateQty('a', 2);
      expect(get(cart)[0].qty).toBe(3);
    });

    it('applies a negative delta but never below removal', () => {
      addToCart(product('a'), 2);
      updateQty('a', -1);
      expect(get(cart)[0].qty).toBe(1);
    });

    it('removes the line when quantity reaches zero', () => {
      addToCart(product('a'), 1);
      updateQty('a', -1);
      expect(get(cart)).toHaveLength(0);
    });

    it('removes the line when a large negative delta would go below zero', () => {
      addToCart(product('a'), 2);
      updateQty('a', -5);
      expect(get(cart)).toHaveLength(0);
    });

    it('ignores an unknown key', () => {
      addToCart(product('a'), 1);
      updateQty('ghost', 5);
      expect(get(cart)).toHaveLength(1);
      expect(get(cart)[0].qty).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('removes only the matching line', () => {
      addToCart(product('a'));
      addToCart(product('b'));
      removeItem('a');
      expect(get(cart).map((i) => i.key)).toEqual(['b']);
    });
  });

  describe('derived: cartCount & subtotal', () => {
    it('cartCount sums quantities', () => {
      addToCart(product('a'), 2);
      addToCart(product('b'), 3);
      expect(get(cartCount)).toBe(5);
    });

    it('subtotal sums qty * price', () => {
      addToCart(product('a', 100), 2); // 200
      addToCart(product('b', 50), 3); //  150
      expect(get(subtotal)).toBe(350);
    });

    it('are zero for an empty cart', () => {
      expect(get(cartCount)).toBe(0);
      expect(get(subtotal)).toBe(0);
    });
  });

  describe('cartSnapshot', () => {
    it('reads the current cart synchronously', () => {
      addToCart(product('a'), 2);
      expect(cartSnapshot()).toEqual(get(cart));
    });
  });
});

describe('shop store — cart persistence', () => {
  const realId = PRODUCTS[0].id; // pancho-pineapple (full-only)
  const multi = PRODUCTS[1]; // rose-velvet (full / half / slice)
  const half = multi.sizes.find((s) => s.size === 'half')!;

  it('mirrors every cart mutation to localStorage as a minimal shape (no product, no price)', () => {
    addToCart(multi, 2, 'half');
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null');
    expect(stored).toEqual([{ key: multi.id, qty: 2, size: 'half' }]);
    // Neither the bulky Product snapshot nor the price is persisted.
    expect(stored[0]).not.toHaveProperty('product');
    expect(stored[0]).not.toHaveProperty('price');
  });

  it('persists an empty array once the cart is cleared', () => {
    addToCart(product(realId));
    removeItem(realId);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe('[]');
  });

  describe('loadCart', () => {
    it('rehydrates each line and repopulates the price from the catalogue config', () => {
      // No price is stored — loadCart must derive it from the product's sizes.
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([{ key: multi.id, qty: 3, size: 'half' }]),
      );
      const [line] = loadCart();
      expect(line).toMatchObject({ key: multi.id, qty: 3, size: 'half', price: half.price });
      expect(line.product).toBe(multi); // the live catalogue record, not a snapshot
    });

    it('ignores a stale price left in storage, trusting the current config', () => {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([{ key: multi.id, qty: 1, size: 'half', price: 1 }]),
      );
      expect(loadCart()[0].price).toBe(half.price);
    });

    it('drops lines whose product no longer exists in the catalogue', () => {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([{ key: 'discontinued-cake', qty: 1, size: 'full' }]),
      );
      expect(loadCart()).toEqual([]);
    });

    it('drops lines whose chosen size is no longer offered', () => {
      // pancho-pineapple is full-only, so a stored 'slice' line can't be priced.
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([{ key: realId, qty: 1, size: 'slice' }]),
      );
      expect(loadCart()).toEqual([]);
    });

    it('drops malformed lines (bad types, non-positive qty) without throwing', () => {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify([
          { key: realId, qty: 0, size: 'full' }, // qty not positive
          { key: realId, qty: 1, size: 5 }, // size not a string
          { key: realId, qty: 'two', size: 'full' }, // qty not a number
          null,
          'nonsense',
          { key: realId, qty: 1, size: 'full' }, // the one valid line
        ]),
      );
      const items = loadCart();
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ key: realId, qty: 1 });
    });

    it('returns an empty cart for absent or unparseable storage', () => {
      expect(loadCart()).toEqual([]);
      localStorage.setItem(CART_STORAGE_KEY, 'not json {');
      expect(loadCart()).toEqual([]);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ not: 'an array' }));
      expect(loadCart()).toEqual([]);
    });
  });
});

describe('shop store — auth', () => {
  it('setUser sets and clears the current user', () => {
    const u = {
      id: '1',
      name: 'Mona',
      email: 'm@x.com',
      provider: 'Google',
      avatar: 'data:...',
    };
    setUser(u);
    expect(get(user)).toEqual(u);
    setUser(null);
    expect(get(user)).toBeNull();
  });

  it('setAuthOpen toggles the modal flag', () => {
    setAuthOpen(true);
    expect(get(authOpen)).toBe(true);
    setAuthOpen(false);
    expect(get(authOpen)).toBe(false);
  });
});

describe('shop store — toast / flash', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the message immediately and auto-clears after 2200ms', () => {
    flash('Saved');
    expect(get(toast)).toBe('Saved');
    vi.advanceTimersByTime(2199);
    expect(get(toast)).toBe('Saved');
    vi.advanceTimersByTime(1);
    expect(get(toast)).toBeNull();
  });

  it('resets the dismiss timer when flashed again', () => {
    flash('first');
    vi.advanceTimersByTime(1000);
    flash('second');
    expect(get(toast)).toBe('second');
    // 1500ms after the SECOND flash — original timer would have fired, the reset one not yet.
    vi.advanceTimersByTime(1500);
    expect(get(toast)).toBe('second');
    vi.advanceTimersByTime(700);
    expect(get(toast)).toBeNull();
  });
});
