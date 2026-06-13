import { describe, expect, it } from 'vitest';
import { CURRENCY_SYMBOL, formatPrice } from './currency';

describe('currency', () => {
  describe('CURRENCY_SYMBOL', () => {
    it('is the Egyptian pound symbol', () => {
      expect(CURRENCY_SYMBOL).toBe('E£');
    });
  });

  describe('formatPrice', () => {
    it('prefixes the amount with the currency symbol and no decimals by default', () => {
      expect(formatPrice(900)).toBe('E£900');
    });

    it('rounds to zero decimals by default (banker-agnostic toFixed rounding)', () => {
      expect(formatPrice(12.4)).toBe('E£12');
      expect(formatPrice(12.5)).toBe('E£13');
    });

    it.each([
      [0, 0, 'E£0'],
      [5, 2, 'E£5.00'],
      [1234.5, 2, 'E£1234.50'],
      [0.1, 1, 'E£0.1'],
    ])('formats amount=%s with decimals=%s as %s', (amount, decimals, expected) => {
      expect(formatPrice(amount, decimals)).toBe(expected);
    });

    it('handles negative amounts', () => {
      expect(formatPrice(-50)).toBe('E£-50');
    });

    it('does not group thousands (raw toFixed output)', () => {
      expect(formatPrice(1000000)).toBe('E£1000000');
    });
  });
});
