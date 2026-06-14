import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import type { Product } from '$lib/types';
import {
  addToCart,
  authOpen,
  cart,
  cartCount,
  cartSnapshot,
  flash,
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

    it('uses the headline size price by default but honors an explicit override', () => {
      addToCart(product('a', 250));
      addToCart(product('b', 250), 1, 'Half cake', { egp: 999, rub: 999 });
      const [a, b] = get(cart);
      expect(a.price.egp).toBe(250);
      expect(b.price.egp).toBe(999);
    });

    it('respects custom qty and size', () => {
      addToCart(product('a'), 3, 'Half cake');
      expect(get(cart)[0]).toMatchObject({ qty: 3, size: 'Half cake' });
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
