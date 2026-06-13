import { test, expect, PROVIDER_NAMES } from './fixtures';

test.describe('Authentication modal', () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoHome();
  });

  test('opens from the header account button with all providers', async ({ app }) => {
    await app.openAuth();
    await expect(app.authDialog).toHaveAttribute('aria-modal', 'true');
    await expect(
      app.authDialog.getByText('Sign in to save your box & track orders'),
    ).toBeVisible();

    for (const provider of ['Google', 'Apple', 'Facebook', 'GitHub']) {
      await expect(app.providerButton(provider)).toBeVisible();
    }
    await expect(app.authDialog.getByText('secured by OAuth 2.0')).toBeVisible();
  });

  test('signing in with Google updates the header and flashes a toast', async ({ app }) => {
    await app.signIn('Google');

    await app.expectToast(/Signed in with Google/);
    await expect(app.accountButton).toContainText(PROVIDER_NAMES.Google.split(' ')[0]); // "Mona"
    await expect(app.accountButton).toHaveAttribute('title', 'Account');
  });

  test('signing in with Apple uses that provider identity', async ({ app }) => {
    await app.signIn('Apple');
    await expect(app.accountButton).toContainText(PROVIDER_NAMES.Apple.split(' ')[0]); // "Sam"
  });

  test('shows a loading state that disables the other providers', async ({ app }) => {
    await app.openAuth();
    await app.providerButton('Google').click();
    // While the mocked OAuth round-trip is in flight every provider is disabled.
    await expect(app.providerButton('Apple')).toBeDisabled();
    await expect(app.authDialog).toBeHidden(); // resolves and closes on its own
  });

  test('closes via the X button without signing in', async ({ app }) => {
    await app.openAuth();
    await app.authCloseButton.click();
    await expect(app.authDialog).toBeHidden();
    await expect(app.accountButton).toHaveAttribute('title', 'Sign in');
  });

  test('closes when clicking the overlay backdrop', async ({ app, page }) => {
    await app.openAuth();
    await page.locator('.overlay').click({ position: { x: 5, y: 5 } });
    await expect(app.authDialog).toBeHidden();
  });

  test('closes on Escape', async ({ app, page }) => {
    await app.openAuth();
    await app.providerButton('Google').focus(); // keydown must originate inside the overlay
    await page.keyboard.press('Escape');
    await expect(app.authDialog).toBeHidden();
  });

  test('clicking inside the modal does not close it', async ({ app }) => {
    await app.openAuth();
    await app.authDialog.getByText('Welcome to Marusja Cakes').click();
    await expect(app.authDialog).toBeVisible();
  });
});
