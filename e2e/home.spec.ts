import { test, expect, ALL_PRODUCTS, PRODUCTS, price } from './fixtures';

test.describe('Landing page', () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoHome();
  });

  test('renders the hero with title, subtitle and stats', async ({ page }) => {
    await expect(page).toHaveTitle(/Marusja Cakes/);
    await expect(
      page.getByRole('heading', { name: /Cakes that taste like/ }),
    ).toBeVisible();
    await expect(page.getByText('Baked fresh this morning')).toBeVisible();
    await expect(page.getByText('happy cakes')).toBeVisible();
    await expect(page.getByText('avg rating')).toBeVisible();
  });

  test('shows the trust strip promises', async ({ page }) => {
    await expect(page.getByText('Free delivery over E£1500')).toBeVisible();
    await expect(page.getByText('Always made to order')).toBeVisible();
  });

  test('lists every product in the menu', async ({ app }) => {
    await expect(app.productCards).toHaveCount(ALL_PRODUCTS.length);
    for (const product of ALL_PRODUCTS) {
      await expect(
        app.page.getByRole('heading', { name: product.name, exact: true }),
      ).toBeVisible();
    }
  });

  test('"Browse the cakes" scrolls to the menu section', async ({ app, page }) => {
    await page.getByRole('button', { name: /Browse the cakes/ }).click();
    await expect(app.menuHeading).toBeInViewport();
  });

  test('"Today\'s bestseller" links to the flagship product', async ({ page }) => {
    await page.getByRole('link', { name: /Today's bestseller/ }).click();
    await expect(page).toHaveURL(/\/product\/pancho-pineapple\/?$/);
    await expect(
      page.getByRole('heading', { name: PRODUCTS.pancho.name, level: 1 }),
    ).toBeVisible();
  });

  test('the price tag on the hero reflects the cheapest cake', async ({ page }) => {
    await expect(page.getByText(price(900)).first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('a product card navigates to its detail page', async ({ app, page }) => {
    await app.gotoHome();
    await app.openProductFromCard(PRODUCTS.rose.name);
    await expect(page).toHaveURL(/\/product\/rose-velvet\/?$/);
    await expect(
      page.getByRole('heading', { name: PRODUCTS.rose.name, level: 1 }),
    ).toBeVisible();
  });

  test('the header logo returns to the home page', async ({ app, page }) => {
    await app.gotoProduct(PRODUCTS.cocoa.id);
    await expect(
      page.getByRole('heading', { name: PRODUCTS.cocoa.name, level: 1 }),
    ).toBeVisible();

    await app.header.locator('a.logoBtn').click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(app.menuHeading).toBeVisible();
  });

  test('the cart starts empty (no badge)', async ({ app }) => {
    await app.gotoHome();
    await app.expectCartCount(0);
  });
});
