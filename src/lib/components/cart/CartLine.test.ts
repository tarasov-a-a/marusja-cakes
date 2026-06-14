import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { setLocale } from '$lib/i18n';
import { cart } from '$lib/stores/shop';
import { getProductById } from '$lib/data/products';
import type { CartItem } from '$lib/types';
import CartLine from './CartLine.svelte';

const item: CartItem = {
  key: 'pancho-pineapple',
  product: getProductById('pancho-pineapple')!,
  qty: 2,
  size: 'Full cake',
  price: 900,
};

beforeEach(() => {
  setLocale('en');
  cart.set([{ ...item }]);
});

describe('CartLine.svelte', () => {
  it('renders the localized product name', () => {
    render(CartLine, { props: { item } });
    expect(screen.getByText('Pancho Pineapple with walnut')).toBeInTheDocument();
  });

  it('renders the line total as qty * price, formatted', () => {
    render(CartLine, { props: { item } });
    expect(screen.getByText('E£1800')).toBeInTheDocument(); // 2 * 900
  });

  it('links the artwork to the product page', () => {
    render(CartLine, { props: { item } });
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/product/pancho-pineapple',
    );
  });

  it('renders a real photo (with alt text) for a product that has photos', () => {
    render(CartLine, { props: { item } });
    expect(screen.getByAltText('Pancho Pineapple with walnut')).toBeInTheDocument();
  });

  it('increments quantity in the store via the + button', async () => {
    const { container } = render(CartLine, { props: { item } });
    const [, plus] = container.querySelectorAll('.qtyBtn');
    await userEvent.click(plus);
    expect(get(cart)[0].qty).toBe(3);
  });

  it('decrements quantity in the store via the − button', async () => {
    const { container } = render(CartLine, { props: { item } });
    const [minus] = container.querySelectorAll('.qtyBtn');
    await userEvent.click(minus);
    expect(get(cart)[0].qty).toBe(1);
  });

  it('removes the line from the store via Remove', async () => {
    render(CartLine, { props: { item } });
    await userEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(get(cart)).toHaveLength(0);
  });
});
