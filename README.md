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
- **`lucide-svelte`** icons

## Routes

| Path | Page |
|------|------|
| `/` | Landing (hero, trust strip, menu, story band) |
| `/product/[productId]` | Product detail — prerendered for all products via `entries()` |
| `/cart` | Cart + order summary |
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

## Project structure

- `src/routes/` — file-based routes; `+layout.svelte` is the app shell
- `src/lib/components/` — `ui`, `layout`, `landing`, `product`, `auth`, `cart`, `settings`
- `src/lib/i18n/` — translator store + `locales/{en,ru,ar}/*.json`
- `src/lib/stores/shop.ts` — cart / user / toast state
- `src/lib/data/` — locale-neutral product & order records
- `src/lib/actions/` — Svelte actions (e.g. `portal` for overlay escape)
- `src/lib/constants/` — locale-neutral lookups (e.g. category keys)
- `static/` — responsive WebP image variants (`{asset}_{n}-{width}w.webp`)

## Images

Only `pancho-pineapple` (and the landing hero) ship with real photos. Products
without photos render the `CakeArt` SVG, generated from each product's `grad`
colors — so the menu never shows broken images.
