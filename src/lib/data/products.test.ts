import { describe, expect, it } from 'vitest';
import { getProductById, PRODUCTS } from './products';
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

  describe('catalogue integrity', () => {
    it('has unique product ids', () => {
      const ids = PRODUCTS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(PRODUCTS)('$id is internally well-formed', (product) => {
      expect(product.price).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(product.reviews).toBeGreaterThanOrEqual(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(product.tags.length).toBeGreaterThan(0);
      expect(product.grad).toHaveLength(2);
      product.grad.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{3,8}$/));
      expect(product.allergensKey).not.toBe('');
      expect(product.servesKey).not.toBe('');
      product.category.forEach((c) => expect(CATEGORY_KEYS).toContain(c));
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
      expect(enServes as Record<string, string>).toHaveProperty(product.servesKey);
    });
  });
});
