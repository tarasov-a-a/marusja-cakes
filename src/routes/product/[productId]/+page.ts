import { error } from '@sveltejs/kit';
import { getProductById, PRODUCTS } from '$lib/data/products';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Tell the static adapter which product pages to render at build time.
export const entries: EntryGenerator = () =>
  PRODUCTS.map((p) => ({ productId: p.id }));

export const load: PageLoad = ({ params }) => {
  const product = getProductById(params.productId);
  if (!product) {
    throw error(404, `Product not found: ${params.productId}`);
  }
  return { product };
};
