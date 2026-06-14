import type { Order, OrderItem, OrderStatus } from '$lib/types';

interface OrderTemplate {
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: Order['delivery'];
}

// `rub` amounts here are PLACEHOLDERS pending the owner's confirmed price list
// (these are historical mock orders, shown in the order history).
const ORDER_TEMPLATES: OrderTemplate[] = [
  {
    orderNumber: 'SB-1042',
    date: '2026-05-18T14:30:00.000Z',
    status: 'delivered',
    items: [
      { productId: 'pancho-pineapple', qty: 1, size: 'Full cake', price: { egp: 900, rub: 1620 } },
      { productId: 'rose-velvet', qty: 1, size: 'Half cake', price: { egp: 400, rub: 720 } },
      { productId: 'cocoa-grove', qty: 1, size: 'Slice', price: { egp: 95, rub: 170 } },
    ],
    delivery: { egp: 0, rub: 0 },
  },
  {
    orderNumber: 'SB-0987',
    date: '2026-04-02T10:15:00.000Z',
    status: 'processing',
    items: [
      { productId: 'cocoa-grove', qty: 1, size: 'Full cake', price: { egp: 750, rub: 1350 } },
    ],
    delivery: { egp: 100, rub: 180 },
  },
  {
    orderNumber: 'SB-0811',
    date: '2026-02-14T09:00:00.000Z',
    status: 'cancelled',
    items: [
      { productId: 'vanilla-bean', qty: 2, size: 'Half cake', price: { egp: 400, rub: 720 } },
      { productId: 'lemon-meadow', qty: 1, size: 'Full cake', price: { egp: 500, rub: 900 } },
    ],
    delivery: { egp: 150, rub: 300 },
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
