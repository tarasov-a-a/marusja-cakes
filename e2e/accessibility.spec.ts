import AxeBuilder from '@axe-core/playwright';
import { test, expect, PRODUCTS } from './fixtures';

/**
 * Rule ids that axe reports as PRE-EXISTING gaps in the app (not test defects).
 * Tracked here so the scan stays green-on-no-regression while still failing if
 * a NEW class of violation appears. See the report handed to the team:
 *   - 'link-name'     → the header cart link is icon-only (no accessible name)
 *   - 'button-name'   → product "add" / quantity steppers are icon-only
 *   - 'color-contrast'    → the rose/caramel palette (e.g. .priceTag, .category)
 *                           is below the WCAG AA 4.5:1 text-contrast threshold
 *   - 'nested-interactive'→ ProductCard nests role="button" inside role="link"
 *   - 'no-focusable-content' → those same ProductCard role wrappers expose no
 *                           natively focusable child
 * Remove an id from this list once the underlying markup/design is fixed.
 */
const KNOWN_A11Y_GAPS = new Set([
  'link-name',
  'button-name',
  'color-contrast',
  'nested-interactive',
  'no-focusable-content',
]);

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations;
}

function unexpected(violations: Awaited<ReturnType<typeof scan>>) {
  return violations.filter((v) => !KNOWN_A11Y_GAPS.has(v.id));
}

test.describe('Accessibility — automated scan', () => {
  test('home page has no unexpected WCAG A/AA violations', async ({ app, page }) => {
    await app.gotoHome();
    const violations = await scan(page);
    expect(unexpected(violations), JSON.stringify(unexpected(violations), null, 2)).toEqual([]);
  });

  test('product page has no unexpected WCAG A/AA violations', async ({ app, page }) => {
    await app.gotoProduct(PRODUCTS.pancho.id);
    const violations = await scan(page);
    expect(unexpected(violations), JSON.stringify(unexpected(violations), null, 2)).toEqual([]);
  });

  test('auth modal has no unexpected WCAG A/AA violations', async ({ app, page }) => {
    await app.gotoHome();
    await app.openAuth();
    const violations = await scan(page);
    expect(unexpected(violations), JSON.stringify(unexpected(violations), null, 2)).toEqual([]);
  });
});

test.describe('Accessibility — semantics', () => {
  test('the landing page exposes a single h1 and the main landmarks', async ({ app, page }) => {
    await app.gotoHome();
    await expect(page.getByRole('banner')).toBeVisible(); // <header>
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible(); // <footer>
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('the product page has exactly one h1 (the product name)', async ({ app, page }) => {
    await app.gotoProduct(PRODUCTS.rose.id);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(PRODUCTS.rose.name);
  });

  test('the auth modal is an accessible dialog', async ({ app }) => {
    await app.gotoHome();
    await app.openAuth();
    await expect(app.authDialog).toHaveAttribute('aria-modal', 'true');
    await expect(app.authDialog).toHaveAttribute('aria-labelledby', 'auth-title');
  });

  test('the document advertises its language', async ({ app, page }) => {
    await app.gotoHome();
    await expect(page.locator('html')).toHaveAttribute('lang', /en|ru|ar/);
  });
});
