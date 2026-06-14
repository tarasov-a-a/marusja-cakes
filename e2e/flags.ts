/**
 * E2E feature-flag resolution.
 *
 * The suite mirrors the PRODUCTION flag config: it reads the committed
 * `.env.production` (the same file `vite build` ships), so E2E exercises exactly
 * what the deployed site renders. Today that's the anonymous, desktop-only build
 * (auth + mobileNav off). A shell override still wins, so to flip a flag for one
 * run, export it for the whole command:
 *
 *   VITE_FEATURE_AUTH=true npm run test:e2e
 *
 * The same values are consumed in two places, which must agree:
 *  - playwright.config.ts hands them to the dev server via `webServer.env`, so
 *    the app under test renders in that flag state;
 *  - specs import the booleans to skip / flip flows that require a flag ON.
 *
 * This runs in the Node host (not under Vite), so it can't import src/lib/flags.ts
 * (`import.meta.env`) nor `.env.production` via Vite. Both the `parseFlag` logic
 * and a tiny `.env` reader are mirrored here, dependency-free, to keep the host
 * free of Vite coupling. Fallbacks match the app's own defaults in src/lib/flags.ts.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FALSY = new Set(['false', '0', 'off', 'no']);

function parseFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return fallback;
  return !FALSY.has(normalized);
}

/** Minimal `KEY=value` reader — enough for the flat, quote-free `.env.production`. */
function readEnvFile(file: string): Record<string, string> {
  const env: Record<string, string> = {};
  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return env; // file absent ⇒ fall back to app defaults below
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const fileEnv = readEnvFile(path.resolve(process.cwd(), '.env.production'));

/** Shell env wins over `.env.production`, which wins over the app default. */
function flag(name: string, fallback: boolean): boolean {
  return parseFlag(process.env[name] ?? fileEnv[name], fallback);
}

/** Auth surface (header account button, auth modal, /settings). */
export const E2E_AUTH = flag('VITE_FEATURE_AUTH', true);

/** Mobile hamburger toggle + dropdown nav. */
export const E2E_MOBILE_NAV = flag('VITE_FEATURE_MOBILE_NAV', true);

/** Extra header nav links ("Our Story" / "Order Custom"). App default: OFF. */
export const E2E_EXTRA_NAV = flag('VITE_FEATURE_EXTRA_NAV', false);

/**
 * Flag values handed to the dev server so the app renders in the E2E flag state.
 * Passed explicitly (resolved above from `.env.production` + any shell override)
 * so they win over the dev server's own `.env`/`.env.local` when Playwright
 * starts a fresh server. NOTE: the dev server runs in *development* mode and so
 * never loads `.env.production` itself — these injected values are what carry the
 * production flag config into the suite.
 */
export const FLAG_ENV: Record<string, string> = {
  VITE_FEATURE_AUTH: String(E2E_AUTH),
  VITE_FEATURE_MOBILE_NAV: String(E2E_MOBILE_NAV),
  VITE_FEATURE_EXTRA_NAV: String(E2E_EXTRA_NAV),
};
