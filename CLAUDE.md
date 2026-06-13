# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

**Marusja Cakes** — a static cake-shop web app. SvelteKit 2 + Svelte 5 (runes) +
TypeScript, prerendered to plain HTML/CSS/JS with `@sveltejs/adapter-static`.
There is **no backend**: cart, auth, and toast state live in in-memory Svelte
stores; the only persisted state is the chosen locale (`localStorage`). The
`build/` output deploys to any static host.

This is a v2 rewrite of a React/Vite prototype that still lives at `../app-v1`
(an additional working directory). Treat `app-v1` as read-only reference for
parity questions; all new work happens here in `app-svelte`.

## Commands

```bash
npm run dev              # Vite dev server (port 5173 — E2E expects this)
npm run build            # static build → ./build
npm run preview          # serve the static build
npm run check            # svelte-check: types + a11y (run before declaring done)

npm test                 # Vitest unit suite (run once)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # unit suite + V8 coverage gate (80% all metrics)
npm run test:e2e         # Playwright E2E (auto-starts dev server)
npm run test:e2e:ui      # Playwright UI mode
```

After any change, the green-light bar is: `npm run check` clean, `npm test`
green, and — if behaviour changed — the relevant `test:e2e` spec green.

## Architecture

### Rendering model — this constrains everything
- Every route is **prerendered** (`+layout.ts`: `prerender = true`, `ssr = true`,
  `trailingSlash = 'always'`). Always use trailing-slash internal paths
  (`/cart/`, `/product/<id>/`).
- Dynamic routes must enumerate themselves for the static adapter. See
  [+page.ts](src/routes/product/[productId]/+page.ts): `entries()` lists every
  product id so each detail page is built. **If you add a dynamic route, you
  must provide `entries()`** or it won't be in the build.
- `adapter-static` runs with `strict: true` and a `200.html` SPA fallback. A
  build error about an un-prerenderable page usually means a missing `entries()`
  or a route that reads request-time data (there is none here — keep it that way).

### State (`src/lib/stores/shop.ts`)
- `cart`, `user`, `authOpen`, `toast` are plain `writable` stores; `cartCount`
  and `subtotal` are `derived`. Mutations go through the exported functions
  (`addToCart`, `updateQty`, `removeItem`, `setUser`, `flash`, …) — don't poke
  store internals from components.
- **In-memory means a full page load resets cart/auth.** This is load-bearing
  for tests (see QA below) and intended product behaviour, not a bug to "fix"
  with persistence unless explicitly asked.
- `flash()` and other browser-only paths guard on `browser` from
  `$app/environment`. Preserve those guards — prerendering executes module code.

### Ordering — chat deep links, no checkout backend
- There is **no payment/checkout flow**. The cart's "Send your order in" buttons
  ([cart/+page.svelte](src/routes/cart/+page.svelte)) hand the order to the shop
  owner over WhatsApp / Telegram via **client-side click-to-chat deep links** —
  staying true to the no-backend rule. Don't "add checkout" with a server.
- [order.ts](src/lib/order.ts) builds the order as locale-aware standard Markdown
  (`buildOrderMarkdown`, reusing `localizeProduct` + `formatPrice` + the `cart:*`
  keys) and turns it into links (`whatsAppHref` → `wa.me/<number>?text=…`,
  `telegramChatUrl` → `t.me/<username>`).
- [messenger.ts](src/lib/messenger.ts) is the **converter half** of the
  `messenger-send` skill, vendored as dependency-free pure functions:
  `toWhatsAppText` (the WhatsApp deep link) and `toPlainText` (the clipboard copy).
  The skill's *senders* are deliberately omitted — they need bot tokens + a
  recipient chat id + a server, which this app doesn't have.
- **Telegram can't pre-fill a DM to a personal username**, so that button copies
  the order to the clipboard, opens the chat, and flashes a "paste it" toast.
- Owner handles live in [contacts.ts](src/lib/contacts.ts) (`WHATSAPP_NUMBER`,
  `TELEGRAM_USERNAME`), defaulting to the live accounts with optional
  `VITE_WHATSAPP_NUMBER` / `VITE_TELEGRAM_USERNAME` build-time overrides. The
  WhatsApp/Telegram **Button variants carry the official brand colors.**

### Data layer — locale-neutral by design
- `src/lib/data/` holds **locale-neutral** records: a `Product` has `id`, `price`,
  `grad`, `category`/`tag`/`allergens`/`serves` **keys** — never display strings.
- Display strings come only from i18n. [localize.ts](src/lib/localize.ts) joins
  a `Product` + the translator into a `LocalizedProduct`. Keep this split: data
  carries keys, i18n carries words. Adding a product = add the record in
  `data/products.ts` **and** its strings in every locale's `products.json`.
- Types live in [types.ts](src/lib/types.ts) — `Product` vs `LocalizedProduct`
  is the core distinction; respect it when typing component props.

### i18n (`src/lib/i18n/index.ts`)
- Custom lightweight store, **not** a library. Locales: `en`, `ru`, `ar` (Arabic
  is RTL). JSON namespaces under `locales/<lang>/<namespace>.json` are eager-globbed.
- Usage in components: `$t('namespace:path.to.key', { var, count })`. No colon ⇒
  `common` namespace. Supports `{{var}}` interpolation and `Intl.PluralRules`
  plurals (`key_one` / `key_other` etc.). Missing keys fall back to `en`, then to
  the raw key string.
- `dir` store drives RTL; [+layout.svelte](src/routes/+layout.svelte) syncs
  `<html lang/dir>` and persists locale. **Any new user-facing string must be added
  to all three locales** — `check`/tests won't always catch an English-only string,
  so be deliberate.

### Components (`src/lib/components/`)
Grouped by area: `ui` (primitives — Button, Toggle, Field, Stars, Spinner, Toast),
`layout` (Header, Footer, shell chrome), `landing`, `product`, `auth`, `cart`,
`settings`. Conventions:
- **Svelte 5 runes only**: `$props()`, `$state`, `$derived`, `$effect`. Props via
  a typed `Props` interface; spread `...rest` for passthrough (see
  [Button.svelte](src/lib/components/ui/Button.svelte)). No legacy `export let`.
- **Scoped `<style>` per component**; global tokens (color/font CSS variables,
  shared keyframes) live in [app.css](src/app.css). Use the `--color-*` tokens,
  don't hardcode hexes in components.
- Children via `Snippet` + `{@render children()}`.
- Overlays use the [`portal` action](src/lib/actions/portal.ts) to escape
  transformed ancestors.

### Images (`src/lib/productImages.ts`)
Only `pancho-pineapple` and the landing hero ship real responsive WebP variants
(`static/{asset}_{n}-{width}w.webp`). Every other product renders the generated
`CakeArt` SVG from its `grad` colors — so the menu never shows a broken image.
`hasPhotos(id)` gates which path renders. Helpers build `srcset`/`sizes`; keep the
width lists and the `static/` files in sync if you touch image output.

### Feature flags (`src/lib/flags.ts`)
Build-time flags read from `VITE_FEATURE_*` env vars. Vite **statically inlines**
`import.meta.env.VITE_*` at build, so this stays prerender-safe (no request-time
read) and the value is fixed per build. Set them in `.env`/`.env.local`
(gitignored — see [.env.example](.env.example)) or inline a build:
`VITE_FEATURE_AUTH=false npm run build`.
- Convention: a flag is OFF **only** when explicitly set to a falsy token
  (`false`/`0`/`off`/`no`). Unset or anything else ⇒ ON, so features keep their
  committed default unless a build deliberately turns them off. `parseFlag()`
  encodes this; reuse it rather than reading env vars ad hoc.
- Current flags: `auth` (default **ON** — header account button, auth modal,
  `/settings`; off ⇒ pure anonymous catalog/cart), `mobileNav` (default **ON** —
  hamburger toggle + dropdown nav), `extraNav` (default **OFF** — the "Our Story" /
  "Order Custom" links, whose destinations don't exist yet; "Cakes" always shows).
- Gate in markup with `{#if features.x}` (a disabled branch never renders and its
  handlers never run, though the code still ships); use `isEnabled(name)` outside
  `.svelte` files. `/settings` redirects home when `auth` is off rather than
  prompting a modal that no longer renders.
- Changing a flag requires a rebuild / dev-server restart — it's not runtime
  toggleable.

## Testing

Two layers with a deliberate division of labour — respect the boundary.

### Unit (Vitest + @testing-library/svelte, jsdom)
- Config: [vitest.config.ts](vitest.config.ts). It wires the Svelte compiler +
  Testing Library plugin **directly** (not the full `sveltekit()` plugin, which
  breaks isolated component mounting), aliases `$lib` and stubs `$app` →
  [src/test/mocks/app](src/test/mocks/app). Setup ([setup.ts](src/test/setup.ts))
  pulls in jest-dom matchers and clears `localStorage` after each test.
- **Coverage scope is intentional, not lazy.** The 80% gate covers the *logic*
  layer (`src/lib/**/*.ts`, route `+page.ts` loaders) plus the UI primitives that
  have their own `*.test.ts`. Presentational page/layout shells (Header, Footer,
  ProductCard, route `+page.svelte`) are **excluded from unit coverage on purpose
  — they're E2E's job.** When you add logic, add its unit test; when you add a
  *reusable* component with behaviour, add its `*.test.ts` and add it to the
  coverage `include` list. Don't chase coverage by unit-testing view shells.
- Co-locate tests as `<name>.test.ts` next to the source.

### E2E (Playwright, Chromium)
- Config: [playwright.config.ts](playwright.config.ts). Drives the **dev server**
  on port 5173; the suite is `fullyParallel`, every test fully isolated.
- **Use the Page-Object Model and fixtures** in [e2e/fixtures.ts](e2e/fixtures.ts)
  — import `test`/`expect` from there, not from `@playwright/test`. The `app`
  fixture gives a fresh `ShopPage`.
- **The store-reset rule is the #1 E2E gotcha:** cart/auth state survives
  client-side navigation (clicking an internal `<a>`/button) but is **wiped by
  `page.goto`/`reload`**. Any flow that carries cart or auth across pages must
  navigate by **clicking**, never by `goto`. The POM methods encode this — follow
  them.
- Auth is mocked (~1.1s to resolve, then sets a user + closes the modal). Toasts
  auto-dismiss after ~2.2s — assert on `.toast` text promptly.
- Prefer role/label locators. CSS-class locators are used only for the handful of
  icon-only controls that expose no accessible name — those are a known a11y gap
  flagged in `accessibility.spec.ts`, not a pattern to copy.
- Accessibility is enforced in E2E via `@axe-core/playwright` — don't regress it.
- **Feature flags default OFF in E2E** (unlike the app, which defaults most ON).
  [e2e/flags.ts](e2e/flags.ts) mirrors `parseFlag` from `src/lib/flags.ts` (it
  can't import that module — `import.meta.env` doesn't exist in the Node host) and
  exports `FLAG_ENV`, which [playwright.config.ts](playwright.config.ts) hands to
  the dev server via `webServer.env`. So the default run exercises the anonymous,
  desktop-only build. Auth/settings/a11y specs `skip` when `E2E_AUTH` is off;
  [feature-flags.spec.ts](e2e/feature-flags.spec.ts) asserts each surface matches
  its flag. To run with a flag on, export it for the whole command:
  `VITE_FEATURE_AUTH=true npm run test:e2e`. Caveat: `env` is ignored when a local
  dev server is reused (`reuseExistingServer`) — that server keeps its own flags.

## Conventions & guardrails

- **TypeScript strict** ([tsconfig.json](tsconfig.json)) with `checkJs`. Config
  files carry JSDoc types. Keep it strict-clean — `npm run check` must pass.
- Indentation is **2 spaces**; existing files favour explicit return types on
  exported functions and small pure helpers. Match the surrounding style.
- **No new runtime dependencies** without a clear reason — the only one is
  `lucide-svelte`. This app's value is being tiny and fully static.
- Don't introduce server endpoints, runtime data fetching, or anything that
  defeats prerendering. If a feature seems to need a backend, surface that
  trade-off rather than silently adding SSR.
- Keep the data/i18n split: catalog facts are keys in `data/`, words are JSON in
  `i18n/locales/`.
- `build/`, `.svelte-kit/`, `coverage/`, `test-results/`, `playwright-report/`
  are generated — never edit by hand (all gitignored).
