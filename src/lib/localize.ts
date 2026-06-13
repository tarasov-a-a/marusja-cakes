import type { TranslateFn } from '$lib/i18n';
import type { LocalizedProduct, Product } from '$lib/types';

/** Build a fully localized product from a locale-neutral record + translator. */
export function localizeProduct(product: Product, t: TranslateFn): LocalizedProduct {
  return {
    ...product,
    name: t(`products:${product.id}.name`),
    tagline: t(`products:${product.id}.tagline`),
    desc: t(`products:${product.id}.desc`),
    categoryLabel: t(`categories:${product.category[0]}`),
    tagLabels: product.tags.map((tag) => t(`tags:${tag}`)),
    allergens: t(`allergens:${product.allergensKey}`),
    serves: t(`serves:${product.servesKey}`),
  };
}

export function localizeProducts(products: Product[], t: TranslateFn): LocalizedProduct[] {
  return products.map((p) => localizeProduct(p, t));
}
