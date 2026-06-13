import { test, expect, PRODUCTS, price } from './fixtures';

const pancho = PRODUCTS.pancho;

test.describe('Product detail', () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoProduct(pancho.id);
  });

  test('renders the product identity and rating', async ({ page }) => {
    await expect(page).toHaveTitle(new RegExp(pancho.name));
    await expect(page.getByRole('heading', { name: pancho.name, level: 1 })).toBeVisible();
    // Scope to the info panel — "Signature" also appears on related-product cards.
    await expect(page.locator('.info').getByText('Signature')).toBeVisible();
    await expect(page.getByText(/214 reviews/)).toBeVisible();
  });

  test('Standard size is selected by default and priced at the base price', async ({ app }) => {
    await expect(app.sizeButton('Standard')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.addToCartButton).toContainText(price(pancho.price)); // E£900
  });

  test('choosing a larger size updates the active state and the total', async ({ app }) => {
    await app.sizeButton('Grand').click();
    await expect(app.sizeButton('Grand')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.sizeButton('Standard')).toHaveAttribute('aria-pressed', 'false');
    // Grand delta is +18 → E£918 for a single cake.
    await expect(app.addToCartButton).toContainText(price(pancho.price + 18));
  });

  test('quantity stepper increments and clamps at a minimum of 1', async ({ app }) => {
    await expect(app.qtyValue).toHaveText('1');

    await app.qtyPlus.click();
    await expect(app.qtyValue).toHaveText('2');
    await expect(app.addToCartButton).toContainText(price(pancho.price * 2)); // E£1800

    await app.qtyMinus.click();
    await app.qtyMinus.click(); // would go to 0 — must clamp
    await expect(app.qtyValue).toHaveText('1');
  });

  test('adding to the cart updates the cart badge and flashes a toast', async ({ app }) => {
    await app.qtyPlus.click(); // qty = 2
    await app.addToCartButton.click();

    await app.expectToast(new RegExp(`${pancho.name} added to your cart`));
    await app.expectCartCount(2);
  });

  test('shows related products', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'You might also crave…' })).toBeVisible();
    await expect(page.locator('.related .card')).toHaveCount(3);
  });

  test('"Back to all cakes" returns to the landing page', async ({ app, page }) => {
    await page.getByRole('link', { name: 'Back to all cakes' }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(app.menuHeading).toBeVisible();
  });
});

test.describe('Product detail — edge cases', () => {
  test('an unknown product id returns a 404', async ({ page }) => {
    const response = await page.goto('/product/this-cake-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText(/Product not found/)).toBeVisible();
  });

  test('navigating between products resets the size and quantity selection', async ({
    app,
    page,
  }) => {
    await app.gotoProduct(pancho.id);
    await app.qtyPlus.click();
    await app.sizeButton('Grand').click();
    await expect(app.qtyValue).toHaveText('2');

    // Use the related-products grid to navigate client-side to another product.
    await page.locator('.related .card').first().getByRole('heading').click();
    await expect(app.qtyValue).toHaveText('1');
    await expect(app.sizeButton('Standard')).toHaveAttribute('aria-pressed', 'true');
  });
});
