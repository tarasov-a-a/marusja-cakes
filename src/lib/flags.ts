/**
 * File/env-based feature flags.
 *
 * Flags are read from Vite env vars (prefix `VITE_FEATURE_`). Vite *statically
 * replaces* `import.meta.env.VITE_*` at build time, so this is safe under
 * prerendering (no request-time read) and the value is fixed per build. Gating
 * is by runtime check (`{#if features.x}`): a disabled branch never renders and
 * its handlers never run, though the component code still ships in the bundle.
 *
 * Set values in `.env` / `.env.local` (gitignored) — see `.env.example` for the
 * available flags. To switch a flag per build without a file, pass it inline:
 *
 *   VITE_FEATURE_AUTH=false npm run build
 *
 * Convention: a flag is OFF only when explicitly set to a falsy string
 * (`false` / `0` / `off` / `no`). Anything else — including *unset* — is ON, so
 * features default to their committed behaviour unless a build deliberately
 * turns them off.
 */

const FALSY = new Set(['false', '0', 'off', 'no']);

/**
 * Parse an env-var string into a boolean flag.
 * `undefined`/empty → `fallback`; an explicit falsy token → `false`;
 * anything else → `true`.
 */
export function parseFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return fallback;
  return !FALSY.has(normalized);
}

export const features = {
  /**
   * Account sign-in: the header user button, the auth modal, and the
   * `/settings` account area. Off ⇒ the app is a pure anonymous catalog/cart.
   * Defaults ON to preserve existing behaviour.
   */
  auth: parseFlag(import.meta.env.VITE_FEATURE_AUTH, true),
  /**
   * Mobile navigation: the header hamburger toggle and the dropdown nav it
   * opens. Off ⇒ the menu toggle is hidden (desktop nav links only).
   * Defaults ON to preserve existing behaviour.
   */
  mobileNav: parseFlag(import.meta.env.VITE_FEATURE_MOBILE_NAV, true),
  /**
   * Extra header nav links beyond the catalog: "Our Story" (`nav.story`) and
   * "Order Custom" (`nav.custom`). Off ⇒ only the "Cakes" (`nav.cakes`) link
   * shows. Defaults OFF — these destinations don't exist yet, so they stay
   * hidden until a build opts in.
   */
  extraNav: parseFlag(import.meta.env.VITE_FEATURE_EXTRA_NAV, false),
} as const;

export type FeatureName = keyof typeof features;

/** Imperative check, for use outside `.svelte` markup. */
export function isEnabled(name: FeatureName): boolean {
  return features[name];
}
