import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Toggle from './Toggle.svelte';

describe('Toggle.svelte', () => {
  it('renders the label and an off switch by default', () => {
    render(Toggle, { props: { label: 'Email alerts' } });
    expect(screen.getByText('Email alerts')).toBeInTheDocument();
    const sw = screen.getByRole('button', { name: 'Email alerts' });
    expect(sw).toHaveAttribute('aria-pressed', 'false');
  });

  it('honors the initial=true state', () => {
    render(Toggle, { props: { label: 'SMS', initial: true } });
    expect(screen.getByRole('button', { name: 'SMS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('flips aria-pressed on click', async () => {
    render(Toggle, { props: { label: 'Push' } });
    const sw = screen.getByRole('button', { name: 'Push' });
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-pressed', 'false');
  });

  it('invokes onToggle on every change', async () => {
    const onToggle = vi.fn();
    render(Toggle, { props: { label: 'Push', onToggle } });
    const sw = screen.getByRole('button', { name: 'Push' });
    await userEvent.click(sw);
    await userEvent.click(sw);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('does not throw when onToggle is omitted', async () => {
    render(Toggle, { props: { label: 'Push' } });
    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Push' })),
    ).resolves.not.toThrow();
  });
});
