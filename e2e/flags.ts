/**
 * E2E feature-flag resolution.
 *
 * The app default for every flag is ON (see src/lib/flags.ts), but the E2E suite
 * deliberately defaults them OFF so the default run exercises the anonymous,
 * desktop-only configuration: no auth surface, no mobile menu toggle.
 *
 * The same values are consumed in two places, which must agree:
 *  - playwright.config.ts hands them to the dev server via `webServer.env`, so
 *    the app under test renders in that flag state;
 *  - specs import the booleans to skip flows that require a flag ON.
 * Both read `process.env` from the shell that launched `playwright test`, so to
 * run the suite with a flag ON, export it for the whole command:
 *
 *   VITE_FEATURE_AUTH=true npm run test:e2e
 *
 * Mirrors the parsing in src/lib/flags.ts — it can't be imported directly because
 * that module reads `import.meta.env`, which only exists under Vite, not in the
 * Node host that runs Playwright.
 */
const FALSY = new Set(['false', '0', 'off', 'no']);

function parseFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return fallback;
  return !FALSY.has(normalized);
}

/** Auth surface (header account button, auth modal, /settings). E2E default: OFF. */
export const E2E_AUTH = parseFlag(process.env.VITE_FEATURE_AUTH, false);

/** Mobile hamburger toggle + dropdown nav. E2E default: OFF. */
export const E2E_MOBILE_NAV = parseFlag(process.env.VITE_FEATURE_MOBILE_NAV, false);

/**
 * Extra header nav links ("Our Story" / "Order Custom"). E2E default: OFF —
 * which here also matches the app's own default (these links ship hidden).
 */
export const E2E_EXTRA_NAV = parseFlag(process.env.VITE_FEATURE_EXTRA_NAV, false);

/**
 * Flag values handed to the dev server so the app renders in the E2E flag state.
 * Passed explicitly (not via `.env`) so they win over any local `.env` file when
 * Playwright starts a fresh server.
 */
export const FLAG_ENV: Record<string, string> = {
  VITE_FEATURE_AUTH: String(E2E_AUTH),
  VITE_FEATURE_MOBILE_NAV: String(E2E_MOBILE_NAV),
  VITE_FEATURE_EXTRA_NAV: String(E2E_EXTRA_NAV),
};
