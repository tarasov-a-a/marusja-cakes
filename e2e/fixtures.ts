import { test as base, expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared E2E fixtures and a light Page-Object Model for MarusjaCakes.
 *
 * Design notes that every spec depends on:
 *  - Cart + auth state live in in-memory Svelte stores. A full page load
 *    (`page.goto`, `page.reload`) RESETS them; client-side navigation (clicking
 *    an internal `<a>` or the in-app account button) PRESERVES them. So any
 *    multi-page flow that carries cart/auth state must navigate by clicking,
 *    never by `goto`. The POM methods below encode that rule.
 *  - Locale is the only persisted state (localStorage 'marusja-cakes-locale').
 *  - Auth is mocked: picking a provider resolves after ~1.1s, sets a user, and
 *    closes the modal. Toasts auto-dismiss after ~2.2s, so assert on them
 *    promptly via the always-present `.toast` element's text.
 */

export const CURRENCY = 'E£';

/** Locale-neutral catalog facts mirrored from src/lib/data/products.ts. */
export const PRODUCTS = {
  pancho: { id: 'pancho-pineapple', name: 'Pancho Pineapple with walnut', price: 900 },
  rose: { id: 'rose-velvet', name: 'Rose Velvet Cloud', price: 700 },
  cocoa: { id: 'cocoa-grove', name: 'Cocoa Grove Torte', price: 750 },
  vanilla: { id: 'vanilla-bean', name: 'Vanilla Bean Sunhat', price: 700 },
  lemon: { id: 'lemon-meadow', name: 'Lemon Meadow', price: 500 },
  chestnut: { id: 'chestnut-hush', name: 'Chestnut Hush', price: 550 },
} as const;

export const ALL_PRODUCTS = Object.values(PRODUCTS);

/** Mock auth providers and the display name each one signs in as. */
export const PROVIDER_NAMES: Record<string, string> = {
  Google: 'Mona Halabi',
  Apple: 'Sam Rivera',
  Facebook: 'Alex Carter',
  GitHub: 'Alex Carter',
};

/** Money formatting that mirrors src/lib/currency.ts `formatPrice`. */
export function price(amount: number, decimals = 0): string {
  return `${CURRENCY}${amount.toFixed(decimals)}`;
}

/**
 * Thin Page-Object wrapper. Locators favour roles/labels; CSS is used only for
 * the handful of icon-only controls in the app that expose no accessible name
 * (a genuine a11y gap, flagged in the accessibility spec).
 */
export class ShopPage {
  constructor(readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────
  async gotoHome() {
    await this.page.goto('/');
    await expect(this.menuHeading).toBeVisible();
    await this.waitForHydration();
  }

  async gotoProduct(id: string) {
    await this.page.goto(`/product/${id}/`);
    await this.waitForHydration();
  }

  /**
   * Block until SvelteKit has hydrated. Routes are prerendered to static HTML,
   * so the markup (and thus role/text locators) is present *before* the JS
   * attaches the reactive `onclick` handlers. On a slow CI runner a click can
   * land on un-hydrated HTML and be silently dropped. `data-hydrated` is set on
   * <html> by a client-only `$effect` in +layout.svelte, so waiting for it
   * guarantees handlers are live before the first interaction.
   */
  async waitForHydration() {
    await expect(this.page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  }

  // ── Header ──────────────────────────────────────────────────────────────
  get header(): Locator {
    return this.page.getByRole('banner');
  }

  /** Cart link is icon-only (no accessible name) — target by href. */
  get cartLink(): Locator {
    return this.header.locator('a[href="/cart"]');
  }

  get cartBadge(): Locator {
    return this.cartLink.locator('.cartBadge');
  }

  /**
   * Account/sign-in button. Its accessible name changes with state — `title`
   * ("Sign in") when logged out, but the user's first name once logged in
   * (button text content wins over `title`). We therefore target the single
   * stable element and assert state via its `title` attribute / text.
   */
  get accountButton(): Locator {
    return this.header.locator('button.userBtn');
  }

  /** Desktop nav link by its visible label (e.g. 'Cakes', 'Our Story'). */
  navLink(label: string): Locator {
    return this.header.locator('nav.deskNav').getByRole('link', { name: label, exact: true });
  }

  async openCart() {
    await this.cartLink.click();
  }

  async expectCartCount(n: number) {
    if (n === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(n));
    }
  }

  // ── Menu / product cards ─────────────────────────────────────────────────
  get menuHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Pick your slice of joy' });
  }

  filterButton(label: string): Locator {
    return this.page.getByRole('button', { name: label, exact: true });
  }

  /** The card whose heading matches `name`. */
  card(name: string): Locator {
    return this.page
      .locator('.card')
      .filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  get productCards(): Locator {
    return this.page.locator('.card');
  }

  async openProductFromCard(name: string) {
    await this.card(name).getByRole('heading', { name, exact: true }).click();
  }

  async addToCartFromCard(name: string) {
    await this.card(name).locator('.addBtn').click();
  }

  // ── Product detail ───────────────────────────────────────────────────────
  sizeButton(label: 'Full cake' | 'Half cake' | 'Slice'): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^${label}`) });
  }

  get qtyMinus(): Locator {
    return this.page.locator('.qtyBtnMinus');
  }

  get qtyPlus(): Locator {
    return this.page.locator('.qtyBtnPlus');
  }

  get qtyValue(): Locator {
    return this.page.locator('.qtyVal');
  }

  get addToCartButton(): Locator {
    return this.page.getByRole('button', { name: /Add to cart/ });
  }

  // ── Auth modal ────────────────────────────────────────────────────────────
  get authDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Welcome to Marusja Cakes' });
  }

  providerButton(provider: string): Locator {
    return this.authDialog.getByRole('button', { name: `Continue with ${provider}` });
  }

  get authCloseButton(): Locator {
    return this.authDialog.locator('.close');
  }

  async openAuth() {
    await this.accountButton.click();
    await expect(this.authDialog).toBeVisible();
  }

  /** Complete the mocked OAuth flow; resolves once the modal has closed. */
  async signIn(provider: keyof typeof PROVIDER_NAMES = 'Google') {
    if (!(await this.authDialog.isVisible())) await this.openAuth();
    await this.providerButton(provider).click();
    await expect(this.authDialog).toBeHidden();
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  get toast(): Locator {
    return this.page.locator('.toast');
  }

  async expectToast(text: string | RegExp) {
    await expect(this.toast).toContainText(text);
  }

  // ── Language switcher (desktop) ────────────────────────────────────────────
  languageButton(label: 'English' | 'Русский' | 'العربية'): Locator {
    return this.page.locator('.switcher').getByRole('button', { name: label });
  }
}

/** `test` with an `app` fixture pre-wired to a fresh ShopPage. */
export const test = base.extend<{ app: ShopPage }>({
  app: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
});

export { expect };
