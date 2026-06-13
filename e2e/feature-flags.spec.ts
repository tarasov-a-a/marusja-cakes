import { test, expect } from './fixtures';
import { E2E_AUTH, E2E_EXTRA_NAV, E2E_MOBILE_NAV } from './flags';

/**
 * Contract for the build-time feature flags (src/lib/flags.ts), asserted against
 * whatever state the suite is running in. E2E defaults both flags OFF, so the
 * default run verifies the anonymous, desktop-only surface is genuinely absent;
 * running with a flag ON (e.g. `VITE_FEATURE_AUTH=true npm run test:e2e`) flips
 * the same assertions to verify the surface is present.
 */
test.describe('Feature flags', () => {
  test('the header account button matches the auth flag', async ({ app }) => {
    await app.gotoHome();
    if (E2E_AUTH) {
      await expect(app.accountButton).toBeVisible();
    } else {
      await expect(app.accountButton).toHaveCount(0);
    }
  });

  test('the mobile menu toggle matches the mobileNav flag', async ({ app, page }) => {
    await app.gotoHome();
    // The toggle is CSS-hidden on desktop (`mobOnly`), so assert on DOM presence
    // rather than visibility — the flag controls whether it renders at all.
    await expect(page.locator('.menuToggle')).toHaveCount(E2E_MOBILE_NAV ? 1 : 0);
  });

  test('the nav links match the extraNav flag', async ({ app }) => {
    await app.gotoHome();
    // The entire nav — "Cakes", "Our Story", "Order Custom" — is gated as a
    // block behind extraNav (default OFF); nothing renders when it's off.
    if (E2E_EXTRA_NAV) {
      await expect(app.navLink('Cakes')).toBeVisible();
      await expect(app.navLink('Our Story')).toBeVisible();
      await expect(app.navLink('Order Custom')).toBeVisible();
    } else {
      await expect(app.navLink('Cakes')).toHaveCount(0);
      await expect(app.navLink('Our Story')).toHaveCount(0);
      await expect(app.navLink('Order Custom')).toHaveCount(0);
    }
  });
});
