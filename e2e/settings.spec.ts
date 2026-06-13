import { test, expect, type ShopPage } from './fixtures';

/** Sign in on the home page, then open settings via client-side navigation. */
async function openSettings(app: ShopPage) {
  await app.gotoHome();
  await app.signIn('Google');
  await app.accountButton.click(); // logged-in account button routes to /settings
  await expect(app.page).toHaveURL(/\/settings\/?$/);
}

test.describe('Settings — access control', () => {
  test('a guest visiting settings is prompted to sign in', async ({ app, page }) => {
    await page.goto('/settings/'); // full load → no session
    await expect(page.getByRole('heading', { name: 'Please sign in' })).toBeVisible();
    await expect(app.authDialog).toBeVisible();
  });
});

test.describe('Settings — signed in', () => {
  test('lands on the profile tab populated from the session', async ({ app, page }) => {
    await openSettings(app);
    await expect(page).toHaveTitle(/Account settings/);
    await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveValue('Mona Halabi');
    // `exact` keeps this off the footer newsletter input (aria-label "Email address").
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('you@google.com');
    await expect(page.getByText('via Google')).toBeVisible();
  });

  test('saving the profile flashes a confirmation toast', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await app.expectToast('Profile saved');
  });

  test('the orders tab lists past orders with their statuses', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Orders' }).click();

    await expect(page.getByText('Order #SB-1042')).toBeVisible();
    await expect(page.getByText('Order #SB-0987')).toBeVisible();
    await expect(page.getByText('Order #SB-0811')).toBeVisible();
    // `exact` keeps these off the footer copy ("…baked at dawn and delivered…").
    await expect(page.getByText('Delivered', { exact: true })).toBeVisible();
    await expect(page.getByText('Processing', { exact: true })).toBeVisible();
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
  });

  test('a notification toggle flips its state and flashes a toast', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Notifications' }).click();

    const seasonal = page.getByRole('button', { name: 'New seasonal cakes' });
    await expect(seasonal).toHaveAttribute('aria-pressed', 'true'); // starts on
    await seasonal.click();
    await app.expectToast('Preference updated');
    await expect(seasonal).toHaveAttribute('aria-pressed', 'false');
  });

  test('the payment tab shows saved cards', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Payment' }).click();
    await expect(page.getByText('Visa •••• 4291')).toBeVisible();
    await expect(page.getByText('Mastercard •••• 8810')).toBeVisible();
  });

  test('the security tab reflects the OAuth provider', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Security' }).click();
    await expect(page.getByText('Connected via Google')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Two-factor authentication' })).toBeVisible();
  });

  test('signing out clears the session and returns home', async ({ app, page }) => {
    await openSettings(app);
    await page.getByRole('button', { name: 'Sign out' }).click();

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await app.expectToast('Signed out');
    await expect(app.accountButton).toHaveAttribute('title', 'Sign in'); // logged out again
  });
});
