import { test, expect, PRODUCTS } from './fixtures';

const RU_MENU_TITLE = 'Выбери свой кусочек радости';
const RU_PANCHO = 'Панчо с ананасом и грецким орехом';
const AR_BRAND = 'كعكات ماروسجا';
const LOCALE_KEY = 'marusja-cakes-locale';

test.describe('Internationalisation', () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoHome();
  });

  test('defaults to English (lang=en, dir=ltr)', async ({ app, page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(app.menuHeading).toBeVisible();
    await expect(app.languageButton('English')).toHaveClass(/active/);
  });

  test('switching to Russian translates content and updates <html lang>', async ({ app, page }) => {
    await app.languageButton('Русский').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.getByRole('heading', { name: RU_MENU_TITLE })).toBeVisible();
    await expect(page.getByRole('heading', { name: RU_PANCHO })).toBeVisible();
    await expect(page.getByRole('heading', { name: PRODUCTS.pancho.name })).toBeHidden();
  });

  test('switching to Arabic flips the document direction to RTL', async ({ app, page }) => {
    await app.languageButton('العربية').click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.getByText(AR_BRAND).first()).toBeVisible(); // brand shows in header + footer
  });

  test('the selected locale persists across a full page reload', async ({ app, page }) => {
    await app.languageButton('Русский').click();
    await expect(page.getByRole('heading', { name: RU_MENU_TITLE })).toBeVisible();

    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), LOCALE_KEY))
      .toBe('ru');

    await page.reload();
    await expect(page.getByRole('heading', { name: RU_MENU_TITLE })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });
});
