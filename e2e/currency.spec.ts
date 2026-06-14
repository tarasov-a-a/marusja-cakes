import { expect, test } from './fixtures';

/**
 * Currency switching. Prices are authored per-currency in the catalogue and the
 * active currency only selects which number to show, so switching re-prices
 * every surface live. EGP is the default (the shipped config), so the rest of
 * the suite keeps asserting `E£` prices without touching this.
 */
test.describe('currency switcher', () => {
  test('defaults to EGP with the pound symbol', async ({ app, page }) => {
    await app.gotoHome();
    await expect(app.currencyButton('EGP')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('E£900').first()).toBeVisible();
  });

  test('switching to RUB re-prices the catalogue live', async ({ app, page }) => {
    await app.gotoHome();
    await app.currencyButton('RUB').click();
    await expect(app.currencyButton('RUB')).toHaveAttribute('aria-pressed', 'true');
    // Pancho's full-cake RUB price (1620 ₽); the ruble symbol trails the amount.
    await expect(page.getByText('1620 ₽').first()).toBeVisible();
    await expect(page.getByText('E£900')).toHaveCount(0);
  });

  test('persists the chosen currency across a reload', async ({ app, page }) => {
    await app.gotoHome();
    await app.currencyButton('RUB').click();
    await expect(page.getByText('1620 ₽').first()).toBeVisible();

    await page.reload();
    await app.waitForHydration();
    await expect(app.currencyButton('RUB')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('1620 ₽').first()).toBeVisible();
  });
});
