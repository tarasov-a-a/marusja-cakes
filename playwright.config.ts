import { defineConfig, devices } from '@playwright/test';

/**
 * E2E configuration for the MarusjaCakes SvelteKit app.
 *
 * The app is a static, client-side SPA: cart and auth state live in in-memory
 * Svelte stores (a full page load resets them; client-side navigation keeps
 * them). Locale is the only persisted state (localStorage). Tests are written
 * with that model in mind — see e2e/fixtures.ts for the shared helpers.
 *
 * We drive the Vite dev server (port 5173) which handles SvelteKit routing and
 * the `trailingSlash: 'always'` redirects transparently.
 */
const PORT = 5173;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // One behaviour per test, fully isolated — no shared state between tests.
  fullyParallel: true,
  // Fail the build on CI if a `test.only` was committed by accident.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The Vite dev server compiles routes on demand from a single process; too
  // many cold parallel loads (plus heavy axe injection) starve it. Cap local
  // concurrency so the suite stays deterministic without masking real waits.
  workers: process.env.CI ? 2 : 4,
  // Give web-first assertions headroom for dev-server cold compiles.
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL,
    // Rich debugging on retries without slowing the happy path.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
