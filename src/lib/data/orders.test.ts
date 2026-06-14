import { describe, expect, it } from 'vitest';
import type { Order } from '$lib/types';
import { getOrdersForUser, sortOrders } from './orders';

describe('orders data', () => {
  describe('getOrdersForUser', () => {
    it('returns the three seeded mock orders', () => {
      expect(getOrdersForUser('user-1')).toHaveLength(3);
    });

    it('stamps every order with the requested userId', () => {
      const orders = getOrdersForUser('user-42');
      expect(orders.every((o) => o.userId === 'user-42')).toBe(true);
    });

    it('returns orders sorted by date, newest first', () => {
      const ids = getOrdersForUser('user-1').map((o) => o.id);
      expect(ids).toEqual(['SB-1042', 'SB-0987', 'SB-0811']);
    });

    it('hands back a fresh array on each call (callers may safely sort/mutate it)', () => {
      const a = getOrdersForUser('user-1');
      const b = getOrdersForUser('user-1');
      expect(a).not.toBe(b);
      expect(a.map((o) => o.id)).toEqual(b.map((o) => o.id));
    });

    it('isolates orders per user', () => {
      const alice = getOrdersForUser('alice');
      const bob = getOrdersForUser('bob');
      expect(alice).not.toBe(bob);
      expect(alice.every((o) => o.userId === 'alice')).toBe(true);
      expect(bob.every((o) => o.userId === 'bob')).toBe(true);
    });
  });

  describe('sortOrders', () => {
    const make = (id: string, status: Order['status']): Order => ({
      id,
      userId: 'u',
      date: '2026-01-01T00:00:00.000Z',
      status,
      items: [],
      delivery: { egp: 0, rub: 0 },
    });

    it('returns a new array without mutating the input', () => {
      const input = [make('a', 'delivered'), make('b', 'processing')];
      const result = sortOrders(input);
      expect(result).not.toBe(input);
      expect(input.map((o) => o.id)).toEqual(['a', 'b']);
    });

    it('preserves all orders (no drops or duplicates)', () => {
      const input = [
        make('a', 'delivered'),
        make('b', 'processing'),
        make('c', 'cancelled'),
      ];
      const result = sortOrders(input);
      expect(result).toHaveLength(input.length);
      expect(new Set(result.map((o) => o.id))).toEqual(new Set(['a', 'b', 'c']));
    });

    it('handles an empty list', () => {
      expect(sortOrders([])).toEqual([]);
    });
  });
});
