import { test, expect, PRODUCTS, price } from './fixtures';

const pancho = PRODUCTS.pancho;

/** Locate a cart line by the product name it shows. */
function cartLine(page: import('@playwright/test').Page, name: string) {
  return page.locator('.item').filter({ hasText: name });
}

test.describe('Cart — empty state', () => {
  test('shows the empty cart message and a path back to the menu', async ({ page, app }) => {
    await page.goto('/cart/'); // full load → in-memory cart starts empty
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();

    await page.getByRole('link', { name: /Find a cake/ }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(app.menuHeading).toBeVisible();
  });
});

test.describe('Cart — with items', () => {
  test('adding a cake from the menu shows it in the cart with correct totals', async ({
    app,
    page,
  }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.expectCartCount(1);

    await app.openCart(); // client-side nav preserves the cart store
    await expect(page).toHaveURL(/\/cart\/?$/);

    await expect(cartLine(page, pancho.name)).toBeVisible();
    // Subtotal 900 ≤ 1500 → flat E£150 delivery → total E£1050.
    await expect(page.locator('.summary .rowVal').first()).toHaveText(price(900, 2));
    await expect(page.locator('.totalVal')).toHaveText(price(1050, 2));
    await expect(page.getByText('Add E£600.00 more for free delivery!')).toBeVisible();
  });

  test('crossing the free-delivery threshold removes the delivery fee', async ({ app, page }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.addToCartFromCard(pancho.name); // qty 2 → subtotal 1800 > 1500
    await app.openCart();

    await expect(page.locator('.rowValFree')).toHaveText('Free');
    await expect(page.locator('.totalVal')).toHaveText(price(1800, 2));
    await expect(page.getByText(/more for free delivery/)).toBeHidden();
  });

  test('the in-cart stepper updates quantity, totals and the header badge', async ({
    app,
    page,
  }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.openCart();

    const line = cartLine(page, pancho.name);
    const plus = line.locator('.qty .qtyBtn').nth(1);
    const minus = line.locator('.qty .qtyBtn').first();

    await plus.click();
    await expect(line.locator('.itemPrice')).toHaveText(price(1800)); // 900 × 2
    await app.expectCartCount(2);

    await minus.click();
    await expect(line.locator('.itemPrice')).toHaveText(price(900));
    await app.expectCartCount(1);
  });

  test('decrementing the last unit removes the line and empties the cart', async ({
    app,
    page,
  }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.openCart();

    await cartLine(page, pancho.name).locator('.qty .qtyBtn').first().click();
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
  });

  test('the remove button clears the item', async ({ app, page }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.openCart();

    await page.getByRole('button', { name: /Remove/ }).click();
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
    await app.expectCartCount(0);
  });

  test('checkout is a mocked flow that flashes a toast', async ({ app, page }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.openCart();

    await page.getByRole('button', { name: /Checkout/ }).click();
    await app.expectToast(/Checkout flow/);
  });

  test('"Keep shopping" returns to the menu while preserving the cart', async ({ app, page }) => {
    await app.gotoHome();
    await app.addToCartFromCard(pancho.name);
    await app.openCart();

    await page.getByRole('link', { name: /Keep shopping/ }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await app.expectCartCount(1); // cart survives client-side navigation
  });
});
