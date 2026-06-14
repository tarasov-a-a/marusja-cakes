import { test, expect, PRODUCTS, price } from './fixtures';

const pancho = PRODUCTS.pancho;
const rose = PRODUCTS.rose;
// Per-size prices for rose-velvet, mirrored from src/lib/data/products.ts.
const ROSE_FULL = 700;
const ROSE_HALF = 400;

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

  test('the full cake is selected by default and priced at the full price', async ({ app }) => {
    await expect(app.sizeButton('Full cake')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.addToCartButton).toContainText(price(pancho.price)); // E£900
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

test.describe('Product detail — size selection', () => {
  // rose-velvet is offered in all three formats — pancho-pineapple is full-only.
  test.beforeEach(async ({ app }) => {
    await app.gotoProduct(rose.id);
  });

  test('all three formats are offered for a multi-size cake', async ({ app }) => {
    await expect(app.sizeButton('Full cake')).toBeVisible();
    await expect(app.sizeButton('Half cake')).toBeVisible();
    await expect(app.sizeButton('Slice')).toBeVisible();
  });

  test('full cake is the default selection and headline price', async ({ app }) => {
    await expect(app.sizeButton('Full cake')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.addToCartButton).toContainText(price(ROSE_FULL)); // E£700
  });

  test('choosing a smaller size updates the active state and the total', async ({ app }) => {
    await app.sizeButton('Half cake').click();
    await expect(app.sizeButton('Half cake')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.sizeButton('Full cake')).toHaveAttribute('aria-pressed', 'false');
    await expect(app.addToCartButton).toContainText(price(ROSE_HALF)); // E£400
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
    await app.gotoProduct(rose.id);
    await app.qtyPlus.click();
    await app.sizeButton('Half cake').click();
    await expect(app.qtyValue).toHaveText('2');
    await expect(app.sizeButton('Half cake')).toHaveAttribute('aria-pressed', 'true');

    // Use the related-products grid to navigate client-side to another product.
    await page.locator('.related .card').first().getByRole('heading').click();
    await expect(app.qtyValue).toHaveText('1');
    // The newly opened cake defaults back to its full-cake format.
    await expect(app.sizeButton('Full cake')).toHaveAttribute('aria-pressed', 'true');
  });
});
