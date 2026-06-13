import type { Product } from '$lib/types';

export const PRODUCTS: Product[] = [
  {
    id: 'pancho-pineapple',
    price: 900,
    rating: 4.9,
    reviews: 214,
    category: ['signature', 'fruit'],
    grad: ['#F0C080', '#E0A070'],
    tags: ['bestseller', 'tropical'],
    allergensKey: 'eggsDairyWheat',
    servesKey: '8to10',
  },
  {
    id: 'rose-velvet',
    price: 700,
    rating: 4.8,
    reviews: 168,
    category: ['signature'],
    grad: ['#E89A88', '#D77A66'],
    tags: ['new', 'floral'],
    allergensKey: 'eggsDairyWheat',
    servesKey: '8',
  },
  {
    id: 'cocoa-grove',
    price: 750,
    rating: 5.0,
    reviews: 309,
    category: ['chocolate'],
    grad: ['#8A5A30', '#5A3416'],
    tags: ['rich'],
    allergensKey: 'eggsDairyWheatSoy',
    servesKey: '10to12',
  },
  {
    id: 'vanilla-bean',
    price: 700,
    rating: 4.7,
    reviews: 142,
    category: ['classic'],
    grad: ['#FBEFD3', '#F0C080'],
    tags: ['classic'],
    allergensKey: 'eggsDairyWheat',
    servesKey: '8',
  },
  {
    id: 'lemon-meadow',
    price: 500,
    rating: 4.8,
    reviews: 97,
    category: ['fruit'],
    grad: ['#F0D9A0', '#E0C080'],
    tags: ['zesty'],
    allergensKey: 'eggsDairyWheat',
    servesKey: '8',
  },
  {
    id: 'chestnut-hush',
    price: 550,
    rating: 4.9,
    reviews: 121,
    category: ['seasonal'],
    grad: ['#C08850', '#8A5A30'],
    tags: ['seasonal', 'nutty'],
    allergensKey: 'eggsDairyWheatNuts',
    servesKey: '10',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
