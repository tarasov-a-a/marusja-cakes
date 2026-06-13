import type { Order, OrderItem, OrderStatus } from '$lib/types';

interface OrderTemplate {
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: number;
}

const ORDER_TEMPLATES: OrderTemplate[] = [
  {
    orderNumber: 'SB-1042',
    date: '2026-05-18T14:30:00.000Z',
    status: 'delivered',
    items: [
      { productId: 'pancho-pineapple', qty: 1, size: 'Standard', price: 900 },
      { productId: 'rose-velvet', qty: 1, size: 'Petite', price: 700 },
      { productId: 'cocoa-grove', qty: 1, size: 'Petite', price: 750 },
    ],
    delivery: 0,
  },
  {
    orderNumber: 'SB-0987',
    date: '2026-04-02T10:15:00.000Z',
    status: 'processing',
    items: [{ productId: 'cocoa-grove', qty: 1, size: 'Grand', price: 750 }],
    delivery: 100,
  },
  {
    orderNumber: 'SB-0811',
    date: '2026-02-14T09:00:00.000Z',
    status: 'cancelled',
    items: [
      { productId: 'vanilla-bean', qty: 2, size: 'Standard', price: 700 },
      { productId: 'lemon-meadow', qty: 1, size: 'Standard', price: 500 },
    ],
    delivery: 150,
  },
];

const ordersByUser = new Map<string, Order[]>();

function createMockOrdersForUser(userId: string): Order[] {
  return ORDER_TEMPLATES.map((template) => ({
    id: template.orderNumber,
    userId,
    date: template.date,
    status: template.status,
    items: template.items.map((item) => ({ ...item })),
    delivery: template.delivery,
  }));
}

export function getOrdersForUser(userId: string): Order[] {
  if (!ordersByUser.has(userId)) {
    ordersByUser.set(userId, createMockOrdersForUser(userId));
  }
  return ordersByUser.get(userId)!.slice().sort((a, b) => b.date.localeCompare(a.date));
}

export const sortOrders = (orders: Order[]): Order[] =>
  orders.slice(0).sort((o) => (o.status === 'processing' ? -1 : 0));
