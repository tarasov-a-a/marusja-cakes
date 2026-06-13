import { describe, expect, it } from 'vitest';
import { WHATSAPP_NUMBER } from './contacts';
import type { TranslateFn } from './i18n';
import { buildOrderMarkdown, telegramChatUrl, whatsAppHref } from './order';
import type { CartItem, Product } from './types';

/** Minimal translator: known cart keys + `{{var}}` interpolation; else echoes the key. */
const t: TranslateFn = (key, params) => {
  const map: Record<string, string> = {
    'cart:orderHeading': 'New order',
    'cart:subtotal': 'Subtotal',
    'cart:delivery': 'Delivery',
    'cart:free': 'Free',
    'cart:total': 'Total',
    'cart:orderLine': '{{name}} · {{size}} × {{qty}} — {{price}}',
    'products:test-cake.name': 'Test Cake',
  };
  let out = map[key] ?? key;
  if (params) out = out.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(params[k] ?? ''));
  return out;
};

const product: Product = {
  id: 'test-cake',
  price: 100,
  rating: 5,
  reviews: 1,
  category: ['classic'],
  grad: ['#000', '#fff'],
  tags: ['classic'],
  allergensKey: 'none',
  servesKey: 'small',
};

const cart: CartItem[] = [{ key: 'test-cake', product, qty: 2, size: 'Standard', price: 100 }];

describe('buildOrderMarkdown', () => {
  it('renders heading, per-item line totals, and a bold total', () => {
    const md = buildOrderMarkdown(cart, t, { subtotal: 200, delivery: 150, total: 350 });
    expect(md).toContain('# New order');
    expect(md).toContain('Test Cake · Standard × 2 — E£200.00');
    expect(md).toContain('Subtotal: E£200.00');
    expect(md).toContain('Delivery: E£150.00');
    expect(md).toContain('**Total: E£350.00**');
  });

  it('labels free delivery instead of a price when delivery is 0', () => {
    const md = buildOrderMarkdown(cart, t, { subtotal: 200, delivery: 0, total: 200 });
    expect(md).toContain('Delivery: Free');
    expect(md).not.toContain('Delivery: E£0');
  });
});

describe('whatsAppHref', () => {
  it('builds a wa.me link with the WhatsApp-formatted order url-encoded', () => {
    const href = whatsAppHref(WHATSAPP_NUMBER, '# New order\n**Total: E£10**');
    expect(href.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    const text = decodeURIComponent(href.split('?text=')[1]);
    expect(text).toBe('*New order*\n*Total: E£10*');
  });
});

describe('telegramChatUrl', () => {
  it('builds a t.me link from a username', () => {
    expect(telegramChatUrl('anatolii_tarasov_a')).toBe('https://t.me/anatolii_tarasov_a');
  });
});
