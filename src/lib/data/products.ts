import type { Product, SizeOption } from '$lib/types';

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
    sizes: [{ size: 'full', price: 900, servesKey: '8to10' }],
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
      { size: 'full', price: 700, servesKey: '8' },
      { size: 'half', price: 400, servesKey: '4' },
      { size: 'slice', price: 90, servesKey: '1' },
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
      { size: 'full', price: 750, servesKey: '10to12' },
      { size: 'half', price: 430, servesKey: '6' },
      { size: 'slice', price: 95, servesKey: '1' },
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
      { size: 'full', price: 700, servesKey: '8' },
      { size: 'half', price: 400, servesKey: '4' },
      { size: 'slice', price: 85, servesKey: '1' },
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
      { size: 'full', price: 500, servesKey: '8' },
      { size: 'half', price: 290, servesKey: '4' },
      { size: 'slice', price: 70, servesKey: '1' },
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
      { size: 'full', price: 550, servesKey: '10' },
      { size: 'half', price: 320, servesKey: '5' },
      { size: 'slice', price: 75, servesKey: '1' },
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
export function headlinePrice(product: Product): number {
  return defaultSize(product).price;
}
