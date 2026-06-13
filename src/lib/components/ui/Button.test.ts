import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

// A text-only snippet helper so we can pass `children` to the component.
const label = (text: string) =>
  createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button.svelte', () => {
  it('renders its children inside a real <button>', () => {
    render(Button, { props: { children: label('Add to cart') } });
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(Button, { props: { children: label('Click') } });
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies the default "primary" variant class', () => {
    render(Button, { props: { children: label('Click') } });
    expect(screen.getByRole('button')).toHaveClass('btn', 'primary');
  });

  it.each(['primary', 'rose', 'soft', 'ghost'] as const)(
    'applies the "%s" variant class',
    (variant) => {
      render(Button, { props: { variant, children: label('Click') } });
      expect(screen.getByRole('button')).toHaveClass(variant);
    },
  );

  it('adds the "full" class only when fullWidth is set', () => {
    const { unmount } = render(Button, {
      props: { fullWidth: true, children: label('Wide') },
    });
    expect(screen.getByRole('button')).toHaveClass('full');
    unmount();

    render(Button, { props: { children: label('Narrow') } });
    expect(screen.getByRole('button')).not.toHaveClass('full');
  });

  it('merges a caller-supplied class', () => {
    render(Button, { props: { class: 'extra', children: label('Click') } });
    expect(screen.getByRole('button')).toHaveClass('extra');
  });

  it('forwards arbitrary HTML attributes (rest props) like disabled', () => {
    render(Button, { props: { disabled: true, children: label('Click') } });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onclick when clicked', async () => {
    const onclick = vi.fn();
    render(Button, { props: { onclick, children: label('Click') } });
    await userEvent.click(screen.getByRole('button'));
    expect(onclick).toHaveBeenCalledTimes(1);
  });
});
