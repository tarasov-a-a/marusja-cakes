import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '$lib/data/products';
import { entries, load, prerender } from './+page';

// `load` is typed as PageLoad; in unit tests we only feed it the `params` it reads.
const run = (productId: string) =>
  (load as (e: { params: { productId: string } }) => { product: unknown })({
    params: { productId },
  });

describe('product/[productId] page loader', () => {
  it('is marked for prerendering', () => {
    expect(prerender).toBe(true);
  });

  describe('entries (static prerender list)', () => {
    it('enumerates every product id so each page is built', () => {
      // `entries` is synchronous here; EntryGenerator widens to a Promise union.
      const ids = (entries() as Array<{ productId: string }>).map((e) => e.productId);
      expect(ids).toEqual(PRODUCTS.map((p) => p.id));
    });
  });

  describe('load', () => {
    it('returns the matching product for a valid id', () => {
      const data = run('pancho-pineapple') as { product: { id: string } };
      expect(data.product.id).toBe('pancho-pineapple');
    });

    it('throws a 404 for an unknown product id', () => {
      try {
        run('not-a-cake');
        expect.unreachable('load should have thrown');
      } catch (e) {
        expect((e as { status: number }).status).toBe(404);
      }
    });
  });
});
