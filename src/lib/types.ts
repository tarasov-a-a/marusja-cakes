import type { Money } from '$lib/currency';

export type CategoryKey =
  | 'signature'
  | 'chocolate'
  | 'classic'
  | 'fruit'
  | 'seasonal';

export type TagKey =
  | 'bestseller'
  | 'honey'
  | 'new'
  | 'floral'
  | 'rich'
  | 'classic'
  | 'zesty'
  | 'seasonal'
  | 'nutty'
  | 'tropical';

/** The three cake formats. Not every cake is produced in every size. */
export type SizeKey = 'full' | 'half' | 'slice';

/**
 * One purchasable format of a cake. A product's `sizes` list carries the full
 * size catalogue for that cake — which formats exist, their price, and how many
 * each serves. Locale-neutral: `servesKey` is a `serves:*` i18n key, never a
 * display string.
 */
export interface SizeOption {
  size: SizeKey;
  price: Money;
  servesKey: string;
}

export interface Product {
  id: string;
  rating: number;
  reviews: number;
  category: CategoryKey[];
  grad: [string, string];
  tags: TagKey[];
  allergensKey: string;
  /** Available formats, ordered largest → smallest. `sizes[0]` is the default. */
  sizes: SizeOption[];
}

export interface LocalizedProduct extends Product {
  name: string;
  tagline: string;
  desc: string;
  categoryLabel: string;
  tagLabels: string[];
  allergens: string;
  serves: string;
}

export interface CartItem {
  key: string;
  product: Product;
  qty: number;
  size: string;
  price: Money;
}

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar: string;
}

export type OrderStatus = 'delivered' | 'processing' | 'cancelled';

export interface OrderItem {
  productId: string;
  qty: number;
  size: string;
  price: Money;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: Money;
}

export type SettingsTab = 'profile' | 'orders' | 'notifications' | 'payment' | 'security';
