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

export interface Product {
  id: string;
  price: number;
  rating: number;
  reviews: number;
  category: CategoryKey[];
  grad: [string, string];
  tags: TagKey[];
  allergensKey: string;
  servesKey: string;
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
  price: number;
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
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: number;
}

export type SettingsTab = 'profile' | 'orders' | 'notifications' | 'payment' | 'security';
