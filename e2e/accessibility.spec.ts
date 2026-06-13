import AxeBuilder from '@axe-core/playwright';
import { test, expect, PRODUCTS } from './fixtures';
import { E2E_AUTH } from './flags';

/**
 * PRE-EXISTING a11y gaps in the app (not test defects), allow-listed per rule by
 * the STABLE class signature of the offending element. We deliberately do NOT
 * allow-list whole rule ids: a bare `color-contrast` suppression would also hide
 * a brand-new contrast failure on an unrelated component. Instead each known gap
 * lists the element signatures we accept — a violation node whose target matches
 * none of them is reported as unexpected and fails the scan.
 *
 * Signatures are matched as substrings of axe's node `target`, so they must be
 * stable class tokens only — never Svelte scoped hashes (`s-…`) or `:nth-child`,
 * both of which change between builds.
 *
 *   - 'link-name'      → icon-only header cart link + footer social links
 *   - 'button-name'    → icon-only add-to-cart / quantity steppers / modal close
 *   - 'color-contrast' → the rose/caramel palette is below WCAG AA 4.5:1
 *   - 'nested-interactive' → ProductCard nests role="button" inside role="link"
 *
 * Remove a signature (or a whole rule) once the underlying markup/design is fixed.
 */
const KNOWN_A11Y_GAPS: Record<string, string[]> = {
  'link-name': ['.cartBtn', '.social'],
  'button-name': ['.addBtn', '.qtyBtnMinus', '.qtyBtnPlus', '.submitBtn', '.close'],
  'color-contrast': [
    '.priceTag',
    '.label',
    '.filterBtn',
    '.tagHighlight',
    '.tagDefault',
    '.category',
    '.tagline',
    '.rating',
    '.copy',
    '.metaKey',
    '.sizeSub',
    '.sizePrice',
    '.btn',
    '.providerBtn',
    '.price',
    '> h3',
  ],
  'nested-interactive': ['.card'],
};

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations;
}

/** A node is "known" only if its target matches an allow-listed signature for its rule. */
function isKnownNode(ruleId: string, target: string): boolean {
  return (KNOWN_A11Y_GAPS[ruleId] ?? []).some((sig) => target.includes(sig));
}

/**
 * Reduce raw violations to the genuinely unexpected ones: any unknown rule, or a
 * known rule firing on a node whose target we haven't allow-listed. Returns the
 * offending {rule, target} pairs so the failure message names them precisely.
 */
function unexpected(violations: Awaited<ReturnType<typeof scan>>) {
  const offenders: Array<{ rule: string; target: string }> = [];
  for (const v of violations) {
    for (const node of v.nodes) {
      const target = node.target.join(' ');
      if (!isKnownNode(v.id, target)) offenders.push({ rule: v.id, target });
    }
  }
  return offenders;
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
    test.skip(!E2E_AUTH, 'auth feature flag is OFF in this run');
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
    test.skip(!E2E_AUTH, 'auth feature flag is OFF in this run');
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
