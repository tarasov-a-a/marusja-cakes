import { describe, expect, it } from 'vitest';
import { defaultSize, getProductById, headlinePrice, PRODUCTS } from './products';
import { CATEGORY_KEYS } from '../constants/categories';
import enAllergens from '../i18n/locales/en/allergens.json';
import enCategories from '../i18n/locales/en/categories.json';
import enProducts from '../i18n/locales/en/products.json';
import enServes from '../i18n/locales/en/serves.json';
import enTags from '../i18n/locales/en/tags.json';

describe('products data', () => {
  describe('getProductById', () => {
    it('returns the matching product', () => {
      expect(getProductById('cocoa-grove')?.id).toBe('cocoa-grove');
    });

    it('returns undefined for an unknown id', () => {
      expect(getProductById('does-not-exist')).toBeUndefined();
    });

    it('returns undefined for an empty id', () => {
      expect(getProductById('')).toBeUndefined();
    });
  });

  describe('size helpers', () => {
    it('defaultSize returns the first (largest) format', () => {
      const cocoa = getProductById('cocoa-grove')!;
      expect(defaultSize(cocoa)).toBe(cocoa.sizes[0]);
      expect(defaultSize(cocoa).size).toBe('full');
    });

    it('headlinePrice is the default size price', () => {
      const cocoa = getProductById('cocoa-grove')!;
      expect(headlinePrice(cocoa)).toBe(cocoa.sizes[0].price);
    });
  });

  describe('catalogue integrity', () => {
    it('has unique product ids', () => {
      const ids = PRODUCTS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(PRODUCTS)('$id is internally well-formed', (product) => {
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.reviews).toBeGreaterThanOrEqual(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(product.tags.length).toBeGreaterThan(0);
      expect(product.grad).toHaveLength(2);
      product.grad.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{3,8}$/));
      expect(product.allergensKey).not.toBe('');
      product.category.forEach((c) => expect(CATEGORY_KEYS).toContain(c));
    });

    const SIZE_KEYS = ['full', 'half', 'slice'] as const;

    it.each(PRODUCTS)('$id offers a well-formed, ordered size catalogue', (product) => {
      expect(product.sizes.length).toBeGreaterThan(0);
      // Default (headline) format is always the full cake.
      expect(product.sizes[0].size).toBe('full');
      // No duplicate formats, and sizes run largest → smallest by price.
      const keys = product.sizes.map((s) => s.size);
      expect(new Set(keys).size).toBe(keys.length);
      const prices = product.sizes.map((s) => s.price.egp);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
      product.sizes.forEach((opt) => {
        expect(SIZE_KEYS).toContain(opt.size);
        // Every supported currency must carry a positive price.
        expect(opt.price.egp).toBeGreaterThan(0);
        expect(opt.price.rub).toBeGreaterThan(0);
        expect(opt.servesKey).not.toBe('');
      });
    });
  });

  // QA-critical: every key a product references MUST have an English translation,
  // otherwise the UI silently renders the raw key string.
  describe('translation-key integrity (en)', () => {
    it.each(PRODUCTS)('$id has name/tagline/desc translations', (product) => {
      const entry = (enProducts as Record<string, Record<string, string>>)[product.id];
      expect(entry).toBeDefined();
      expect(entry.name).toBeTruthy();
      expect(entry.tagline).toBeTruthy();
      expect(entry.desc).toBeTruthy();
    });

    it.each(PRODUCTS)('$id has resolvable category/tag/allergen/serves keys', (product) => {
      product.category.forEach((c) =>
        expect(enCategories as Record<string, string>).toHaveProperty(c),
      );
      product.tags.forEach((tag) =>
        expect(enTags as Record<string, string>).toHaveProperty(tag),
      );
      expect(enAllergens as Record<string, string>).toHaveProperty(product.allergensKey);
      product.sizes.forEach((opt) =>
        expect(enServes as Record<string, string>).toHaveProperty(opt.servesKey),
      );
    });
  });
});
