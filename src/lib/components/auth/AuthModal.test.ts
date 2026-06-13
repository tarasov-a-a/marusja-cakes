import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { setLocale } from '$lib/i18n';
import { authOpen, user } from '$lib/stores/shop';
import AuthModal from './AuthModal.svelte';

beforeEach(() => {
  setLocale('en');
  authOpen.set(false);
  user.set(null);
});

describe('AuthModal.svelte', () => {
  it('renders nothing while closed', () => {
    render(AuthModal);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an accessible dialog with all providers when opened', async () => {
    render(AuthModal);
    authOpen.set(true);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'auth-title');

    for (const provider of ['Google', 'Apple', 'Facebook', 'GitHub']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`Continue with ${provider}`) }),
      ).toBeInTheDocument();
    }
  });

  it('closes when the close (X) button is clicked', async () => {
    render(AuthModal);
    authOpen.set(true);
    await screen.findByRole('dialog');

    // The X button is the first button with no provider label.
    await fireEvent.click(screen.getAllByRole('button')[0]);
    expect(get(authOpen)).toBe(false);
  });

  describe('OAuth sign-in flow', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    // Each provider maps to a demo name + a `you@<provider>.com` email.
    it.each([
      ['Google', 'Mona Halabi', 'you@google.com'],
      ['Apple', 'Sam Rivera', 'you@apple.com'],
      ['Facebook', 'Alex Carter', 'you@facebook.com'],
      ['GitHub', 'Alex Carter', 'you@github.com'],
    ])(
      'signs in with %s, sets the user and closes the modal',
      async (provider, name, email) => {
        render(AuthModal);
        authOpen.set(true);
        await vi.advanceTimersByTimeAsync(0); // let the {#if} block mount

        await fireEvent.click(
          screen.getByRole('button', { name: new RegExp(`Continue with ${provider}`) }),
        );

        // Provider round-trip is mocked at 1100ms.
        await vi.advanceTimersByTimeAsync(1100);

        expect(get(user)).toMatchObject({ provider, name, email });
        expect(get(authOpen)).toBe(false);
      },
    );

    it('shows a spinner and disables every provider while a sign-in is pending', async () => {
      const { container } = render(AuthModal);
      authOpen.set(true);
      await vi.advanceTimersByTimeAsync(0);

      await fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/ }));

      // Mid-flight: the active provider swaps its label for a spinner, and every
      // provider button is disabled until the round-trip resolves.
      expect(container.querySelector('.spinner')).toBeInTheDocument();
      const providerBtns = container.querySelectorAll<HTMLButtonElement>('.providerBtn');
      expect(providerBtns).toHaveLength(4);
      providerBtns.forEach((btn) => expect(btn).toBeDisabled());

      await vi.advanceTimersByTimeAsync(1100);
    });
  });
});
