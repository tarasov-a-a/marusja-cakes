import { describe, expect, it, vi } from 'vitest';
import type { TranslateFn } from '$lib/i18n';
import { localizeProduct, localizeProducts } from './localize';
import { PRODUCTS } from './data/products';

// Echo translator: returns the key it was asked for, so we can assert exactly
// which i18n keys `localize` builds — without depending on real locale data.
const echo: TranslateFn = (key) => `T(${key})`;

describe('localize', () => {
  describe('localizeProduct', () => {
    const product = PRODUCTS[0]; // pancho-pineapple

    it('preserves all locale-neutral fields from the source product', () => {
      const result = localizeProduct(product, echo);
      expect(result).toMatchObject({
        id: product.id,
        price: product.price,
        rating: product.rating,
        grad: product.grad,
        category: product.category,
        tags: product.tags,
      });
    });

    it('builds the namespaced i18n keys for name, tagline and desc', () => {
      const result = localizeProduct(product, echo);
      expect(result.name).toBe('T(products:pancho-pineapple.name)');
      expect(result.tagline).toBe('T(products:pancho-pineapple.tagline)');
      expect(result.desc).toBe('T(products:pancho-pineapple.desc)');
    });

    it('uses only the FIRST category for the category label', () => {
      // pancho-pineapple has category ['signature', 'fruit'] — label must be signature.
      const result = localizeProduct(product, echo);
      expect(result.categoryLabel).toBe('T(categories:signature)');
    });

    it('maps every tag to a tags-namespaced label, preserving order', () => {
      const result = localizeProduct(product, echo);
      expect(result.tagLabels).toEqual(
        product.tags.map((tag) => `T(tags:${tag})`),
      );
      expect(result.tagLabels).toHaveLength(product.tags.length);
    });

    it('resolves allergens and serves from their keys', () => {
      const result = localizeProduct(product, echo);
      expect(result.allergens).toBe('T(allergens:eggsDairyWheat)');
      expect(result.serves).toBe('T(serves:8to10)');
    });

    it('invokes the translator once per translated field', () => {
      const t = vi.fn(echo);
      const p = PRODUCTS.find((x) => x.id === 'rose-velvet')!; // 2 tags
      localizeProduct(p, t);
      // name, tagline, desc, category, allergens, serves (6) + one per tag (2)
      expect(t).toHaveBeenCalledTimes(6 + p.tags.length);
    });
  });

  describe('localizeProducts', () => {
    it('localizes every product and preserves order', () => {
      const result = localizeProducts(PRODUCTS, echo);
      expect(result).toHaveLength(PRODUCTS.length);
      expect(result.map((p) => p.id)).toEqual(PRODUCTS.map((p) => p.id));
    });

    it('returns an empty array for empty input', () => {
      expect(localizeProducts([], echo)).toEqual([]);
    });
  });
});
