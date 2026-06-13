import { test, expect, PRODUCTS } from './fixtures';

test.describe('Menu category filtering', () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoHome();
  });

  test('defaults to "All" with every cake shown', async ({ app }) => {
    await expect(app.filterButton('All')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.productCards).toHaveCount(6);
  });

  test('"Signature" shows only signature cakes', async ({ app, page }) => {
    await app.filterButton('Signature').click();
    await expect(app.filterButton('Signature')).toHaveAttribute('aria-pressed', 'true');
    await expect(app.productCards).toHaveCount(2);
    await expect(page.getByRole('heading', { name: PRODUCTS.pancho.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: PRODUCTS.rose.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: PRODUCTS.cocoa.name })).toBeHidden();
  });

  test('"Chocolate" narrows to a single cake', async ({ app, page }) => {
    await app.filterButton('Chocolate').click();
    await expect(app.productCards).toHaveCount(1);
    await expect(page.getByRole('heading', { name: PRODUCTS.cocoa.name })).toBeVisible();
  });

  test('"Seasonal" narrows to a single cake', async ({ app, page }) => {
    await app.filterButton('Seasonal').click();
    await expect(app.productCards).toHaveCount(1);
    await expect(page.getByRole('heading', { name: PRODUCTS.chestnut.name })).toBeVisible();
  });

  test('a product can appear under more than one category', async ({ app, page }) => {
    // Pancho is both "signature" and "fruit".
    await app.filterButton('Fruit').click();
    await expect(app.productCards).toHaveCount(2);
    await expect(page.getByRole('heading', { name: PRODUCTS.pancho.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: PRODUCTS.lemon.name })).toBeVisible();
  });

  test('switching back to "All" restores the full list', async ({ app }) => {
    await app.filterButton('Chocolate').click();
    await expect(app.productCards).toHaveCount(1);
    await app.filterButton('All').click();
    await expect(app.productCards).toHaveCount(6);
  });
});
