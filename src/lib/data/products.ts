import type { Money } from '$lib/currency';
import type { Product, SizeOption } from '$lib/types';

// NOTE: `rub` prices below are PLACEHOLDERS (~1.8× EGP, rounded) pending the
// shop owner's exact Russian-ruble price list. Replace each `rub` value with the
// confirmed price; `egp` values are the live catalogue prices.
export const PRODUCTS: Product[] = [
  {
    id: 'pancho-pineapple',
    rating: 4.9,
    reviews: 214,
    category: ['signature', 'fruit'],
    grad: ['#F0C080', '#E0A070'],
    tags: ['bestseller', 'tropical'],
    allergensKey: 'eggsDairyWheat',
    // A layered showpiece — only ever made as a whole cake.
    sizes: [{ size: 'full', price: { egp: 900, rub: 1620 }, servesKey: '8to10' }],
  },
  {
    id: 'rose-velvet',
    rating: 4.8,
    reviews: 168,
    category: ['signature'],
    grad: ['#E89A88', '#D77A66'],
    tags: ['new', 'floral'],
    allergensKey: 'eggsDairyWheat',
    sizes: [
      { size: 'full', price: { egp: 700, rub: 1260 }, servesKey: '8' },
      { size: 'half', price: { egp: 400, rub: 720 }, servesKey: '4' },
      { size: 'slice', price: { egp: 90, rub: 160 }, servesKey: '1' },
    ],
  },
  {
    id: 'cocoa-grove',
    rating: 5.0,
    reviews: 309,
    category: ['chocolate'],
    grad: ['#8A5A30', '#5A3416'],
    tags: ['rich'],
    allergensKey: 'eggsDairyWheatSoy',
    sizes: [
      { size: 'full', price: { egp: 750, rub: 1350 }, servesKey: '10to12' },
      { size: 'half', price: { egp: 430, rub: 770 }, servesKey: '6' },
      { size: 'slice', price: { egp: 95, rub: 170 }, servesKey: '1' },
    ],
  },
  {
    id: 'vanilla-bean',
    rating: 4.7,
    reviews: 142,
    category: ['classic'],
    grad: ['#FBEFD3', '#F0C080'],
    tags: ['classic'],
    allergensKey: 'eggsDairyWheat',
    sizes: [
      { size: 'full', price: { egp: 700, rub: 1260 }, servesKey: '8' },
      { size: 'half', price: { egp: 400, rub: 720 }, servesKey: '4' },
      { size: 'slice', price: { egp: 85, rub: 150 }, servesKey: '1' },
    ],
  },
  {
    id: 'lemon-meadow',
    rating: 4.8,
    reviews: 97,
    category: ['fruit'],
    grad: ['#F0D9A0', '#E0C080'],
    tags: ['zesty'],
    allergensKey: 'eggsDairyWheat',
    sizes: [
      { size: 'full', price: { egp: 500, rub: 900 }, servesKey: '8' },
      { size: 'half', price: { egp: 290, rub: 520 }, servesKey: '4' },
      { size: 'slice', price: { egp: 70, rub: 125 }, servesKey: '1' },
    ],
  },
  {
    id: 'chestnut-hush',
    rating: 4.9,
    reviews: 121,
    category: ['seasonal'],
    grad: ['#C08850', '#8A5A30'],
    tags: ['seasonal', 'nutty'],
    allergensKey: 'eggsDairyWheatNuts',
    sizes: [
      { size: 'full', price: { egp: 550, rub: 990 }, servesKey: '10' },
      { size: 'half', price: { egp: 320, rub: 580 }, servesKey: '5' },
      { size: 'slice', price: { egp: 75, rub: 135 }, servesKey: '1' },
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** The default/headline format (the largest size) — drives card "from" pricing. */
export function defaultSize(product: Product): SizeOption {
  return product.sizes[0];
}

/** The headline price shown on cards: the default (largest) size's price. */
export function headlinePrice(product: Product): Money {
  return defaultSize(product).price;
}
