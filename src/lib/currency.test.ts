import { describe, expect, it } from 'vitest';
import { DELIVERY, formatPrice, priceIn, SUPPORTED_CURRENCIES, type Money } from './currency';

describe('currency', () => {
  describe('SUPPORTED_CURRENCIES', () => {
    it('lists Egyptian pounds and Russian rubles', () => {
      expect(SUPPORTED_CURRENCIES).toEqual(['egp', 'rub']);
    });
  });

  describe('priceIn', () => {
    const money: Money = { egp: 700, rub: 1300 };

    it('reads the amount for the requested currency', () => {
      expect(priceIn(money, 'egp')).toBe(700);
      expect(priceIn(money, 'rub')).toBe(1300);
    });
  });

  describe('formatPrice', () => {
    it('prefixes EGP with the pound symbol and no decimals by default', () => {
      expect(formatPrice(900, 'egp')).toBe('E£900');
    });

    it('suffixes RUB with the ruble symbol after a space', () => {
      expect(formatPrice(1620, 'rub')).toBe('1620 ₽');
    });

    it('rounds to zero decimals by default (toFixed rounding)', () => {
      expect(formatPrice(12.4, 'egp')).toBe('E£12');
      expect(formatPrice(12.5, 'egp')).toBe('E£13');
    });

    it.each([
      [0, 'egp', 0, 'E£0'],
      [5, 'egp', 2, 'E£5.00'],
      [1234.5, 'egp', 2, 'E£1234.50'],
      [5, 'rub', 2, '5.00 ₽'],
    ] as const)('formats amount=%s currency=%s decimals=%s as %s', (amount, cur, decimals, expected) => {
      expect(formatPrice(amount, cur, decimals)).toBe(expected);
    });

    it('handles negative amounts', () => {
      expect(formatPrice(-50, 'egp')).toBe('E£-50');
      expect(formatPrice(-50, 'rub')).toBe('-50 ₽');
    });

    it('does not group thousands (raw toFixed output)', () => {
      expect(formatPrice(1000000, 'egp')).toBe('E£1000000');
    });
  });

  describe('DELIVERY', () => {
    it('defines a free-over threshold and a flat fee per currency', () => {
      for (const cur of SUPPORTED_CURRENCIES) {
        expect(DELIVERY[cur].freeOver).toBeGreaterThan(0);
        expect(DELIVERY[cur].fee).toBeGreaterThan(0);
      }
    });
  });
});
