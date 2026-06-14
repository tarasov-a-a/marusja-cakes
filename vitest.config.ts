import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import path from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// Mirror the PRODUCTION flag config in unit tests. `vite build` inlines
// `import.meta.env.VITE_FEATURE_*` from `.env.production`; Vitest runs in `test`
// mode and would otherwise read `.env`/code defaults instead. We load the same
// env the production build resolves and statically replace each flag via
// `define`, so `features.*` under Vitest matches what the deployed site ships.
// (`loadEnv('production', …)` follows the real build's precedence: `.env.production`
// wins over `.env`/`.env.local`.)
const prodFlags = loadEnv('production', process.cwd(), 'VITE_FEATURE_');
const flagDefines = Object.fromEntries(
  Object.entries(prodFlags).map(([key, value]) => [
    `import.meta.env.${key}`,
    JSON.stringify(value),
  ]),
);

// Standalone Vitest config (does NOT use the full `sveltekit()` plugin, which
// pulls in the server router and breaks unit-level component mounting). We wire
// the Svelte compiler + Testing Library plugin directly, alias `$lib`/`$app`,
// and run everything under jsdom.
export default defineConfig({
  define: flagDefines,
  plugins: [svelte({ preprocess: vitePreprocess() }), svelteTesting()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      // `$app/*` is provided by SvelteKit at build time; stub the bits our
      // units touch so they can be imported in isolation.
      $app: path.resolve('./src/test/mocks/app'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // The unit suite owns the LOGIC layer (pure functions, stores, data,
      // actions, i18n, route loaders) plus the components that have dedicated
      // unit tests. Presentational page/layout components (Header, Footer,
      // ProductCard, ImageGallery, route `+page.svelte` shells, …) are
      // intentionally OUT of unit scope — they are best covered by E2E
      // (Playwright). Scoping the gate here keeps the 80% threshold meaningful
      // instead of measuring untested view code.
      include: [
        'src/lib/**/*.ts',
        'src/routes/**/+page.ts',
        // components with their own *.test.ts:
        'src/lib/components/ui/Button.svelte',
        'src/lib/components/ui/Toggle.svelte',
        'src/lib/components/ui/Stars.svelte',
        'src/lib/components/ui/Spinner.svelte',
        'src/lib/components/ui/Field.svelte',
        'src/lib/components/ui/Toast.svelte',
        'src/lib/components/cart/CartLine.svelte',
        'src/lib/components/auth/AuthModal.svelte',
        'src/lib/components/auth/ProviderGlyph.svelte',
      ],
      exclude: [
        'src/lib/**/*.d.ts',
        'src/lib/types.ts', // type-only declarations, no runtime
        'src/test/**',
        '**/*.test.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
