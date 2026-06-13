import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { toast } from '$lib/stores/shop';
import Toast from './Toast.svelte';

afterEach(() => toast.set(null));

describe('Toast.svelte', () => {
  it('is hidden (no "visible" class) when the toast store is empty', () => {
    const { container } = render(Toast);
    expect(container.querySelector('.toast')).not.toHaveClass('visible');
  });

  it('shows the message and the "visible" class when the store is set', async () => {
    const { container } = render(Toast);
    toast.set('Added to your cart');
    expect(await screen.findByText('Added to your cart')).toBeInTheDocument();
    expect(container.querySelector('.toast')).toHaveClass('visible');
  });

  it('reacts to the store clearing back to null', async () => {
    const { container } = render(Toast);
    toast.set('Hi');
    await screen.findByText('Hi');
    toast.set(null);
    // Re-query after the reactive update settles.
    await Promise.resolve();
    expect(container.querySelector('.toast')).not.toHaveClass('visible');
  });
});
