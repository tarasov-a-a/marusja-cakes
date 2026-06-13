# Marusja Cakes — Honest Cakes (SvelteKit)

Static cake-shop web app, rewritten from the React/Vite prototype (`../app-v1`) to
**SvelteKit 2 (Svelte 5 runes) + adapter-static**. Every route is prerendered to
plain HTML/CSS/JS at build time — no server required.

## Stack

- **SvelteKit 2 + Svelte 5** (runes) + **TypeScript**
- **`@sveltejs/adapter-static`** — fully prerendered, with a `200.html` SPA fallback
- Scoped component styles + a small global design-token sheet (`src/app.css`)
- Lightweight reactive **i18n** store (English, Russian, Arabic with RTL) — supports
  `{{var}}` interpolation and CLDR plurals via `Intl.PluralRules`
- **Svelte stores** for cart / auth / toast (replacing Zustand)
- **Build-time feature flags** (`VITE_FEATURE_*`, statically inlined — prerender-safe)
- **`lucide-svelte`** icons

## Routes

| Path | Page |
|------|------|
| `/` | Landing (hero, trust strip, menu, story band) |
| `/product/[productId]` | Product detail — prerendered for all products via `entries()` |
| `/cart` | Cart, order summary, and WhatsApp/Telegram order send |
| `/settings` | Account (profile, orders, notifications, payment, security) |

## Commands

```bash
npm install
npm run dev       # dev server
npm run build     # static build → ./build
npm run preview   # serve the static build locally
npm run check     # svelte-check (types + a11y)
```

The contents of `build/` are deployable to any static host (Netlify, Vercel,
GitHub Pages, S3, nginx…).

## Feature flags

A handful of surfaces are gated by build-time flags (`src/lib/flags.ts`), read from
`VITE_FEATURE_*` env vars and statically inlined by Vite — so they stay
prerender-safe and are fixed per build. Copy `.env.example` to `.env` to override,
or set one inline:

```bash
VITE_FEATURE_AUTH=false npm run build   # ship an anonymous-only catalog/cart
```

| Flag | Default | Controls |
|------|---------|----------|
| `VITE_FEATURE_AUTH` | on | Header account button, auth modal, `/settings` |
| `VITE_FEATURE_MOBILE_NAV` | on | Header hamburger toggle + dropdown nav |
| `VITE_FEATURE_EXTRA_NAV` | off | "Our Story" / "Order Custom" nav links |

A flag is off only when set to a falsy token (`false`/`0`/`off`/`no`); unset or
anything else keeps the committed default. Changing a flag needs a rebuild.

## Ordering

There is **no checkout / payment backend** — the cart's "Send your order in"
buttons hand the order to the shop owner over WhatsApp and Telegram via
client-side click-to-chat deep links, so the app stays fully static. The order is
built once as Markdown (`src/lib/order.ts`) and rendered per platform by the
vendored `messenger-send` converters (`src/lib/messenger.ts`). Telegram can't
pre-fill a DM to a personal username, so that button copies the order to the
clipboard and opens the chat to paste.

The target accounts live in `src/lib/contacts.ts` and default to the live
handles; override per build via `.env`:

| Var | Default | Used for |
|-----|---------|----------|
| `VITE_WHATSAPP_NUMBER` | `381665814358` | `wa.me/<number>` (digits only, no `+`) |
| `VITE_TELEGRAM_USERNAME` | `anatolii_tarasov_a` | `t.me/<username>` (no leading `@`) |

## Project structure

- `src/routes/` — file-based routes; `+layout.svelte` is the app shell
- `src/lib/components/` — `ui`, `layout`, `landing`, `product`, `auth`, `cart`, `settings`
- `src/lib/i18n/` — translator store + `locales/{en,ru,ar}/*.json`
- `src/lib/stores/shop.ts` — cart / user / toast state
- `src/lib/flags.ts` — build-time feature flags (`VITE_FEATURE_*`)
- `src/lib/data/` — locale-neutral product & order records
- `src/lib/actions/` — Svelte actions (e.g. `portal` for overlay escape)
- `src/lib/constants/` — locale-neutral lookups (e.g. category keys)
- `static/` — responsive WebP image variants (`{asset}_{n}-{width}w.webp`)

## Images

Only `pancho-pineapple` (and the landing hero) ship with real photos. Products
without photos render the `CakeArt` SVG, generated from each product's `grad`
colors — so the menu never shows broken images.
