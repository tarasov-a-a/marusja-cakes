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
GitHub Pages, S3, nginx…). Production runs on **Google Cloud Storage + Cloud
CDN** — see below.

## Deployment & CI/CD

Production is a GCS bucket served through a global HTTPS load balancer with
**Cloud CDN**, so the static files are edge-cached close to users (the bucket
itself lives in **`me-central1` / Doha** for low cache-miss latency to Egypt).
GitHub Actions builds and publishes on every push to `main`.

**Live URL:** <https://marusja-cakes.com> (`www` → apex 301; HTTP → HTTPS 301).

### Pipeline

- **`.github/workflows/ci.yml`** — on PRs and pushes to `main`: `npm run check`,
  unit tests (`npm test`), the static `build`, and the Playwright E2E suite.
- **`.github/workflows/deploy.yml`** — on pushes to `main` (and manual dispatch):
  build → publish to the bucket → set cache headers → invalidate the CDN.

Deploy authenticates to GCP **keylessly via Workload Identity Federation** — no
service-account keys are stored in GitHub. The non-secret identifiers come from
GitHub Actions **repository Variables** (not Secrets):

```ini
GCP_PROJECT      = marusja-cakes
GCP_WIF_PROVIDER = projects/867862583/locations/global/workloadIdentityPools/github-pool/providers/github-provider
GCP_DEPLOY_SA    = github-deployer@marusja-cakes.iam.gserviceaccount.com
GCS_BUCKET       = marusja-cakes-web
GCP_URL_MAP      = marusja-cakes-lb
```

The deploy service account is least-privilege: `roles/storage.objectAdmin` **and**
`roles/storage.legacyBucketReader` on `gs://marusja-cakes-web` (the latter supplies
`storage.buckets.get`, which `gcloud storage rsync` needs to validate the bucket —
`objectAdmin` alone doesn't grant it), plus a custom `cdnInvalidator` role
(`compute.urlMaps.invalidateCache`) at the project level.

### Caching

Hashed `_app/immutable/**` assets get `public, max-age=31536000, immutable`;
HTML and `_app/version.json` get `no-cache, must-revalidate`. Deploy uploads
without deleting old assets and then **invalidates the CDN** — that invalidation
is the atomic cutover, so in-flight visitors never hit a missing asset.

### GCP resources (project `marusja-cakes`)

```
Cloud DNS (marusja-cakes.com A → 34.111.160.133)
  → Global external HTTPS LB  (forwarding rules :443 / :80→301)
    ├─ host www.marusja-cakes.com → 301 apex
    └─ host marusja-cakes.com → backend bucket (Cloud CDN, CACHE_ALL_STATIC)
                                 → gs://marusja-cakes-web  (me-central1)
  Google-managed SSL cert: marusja-cakes.com + www.marusja-cakes.com
```

A manual publish (e.g. to seed or hot-fix) is the same three steps the workflow
runs, using your own `gcloud auth`:

```bash
gcloud storage rsync build gs://marusja-cakes-web --recursive --project=marusja-cakes
# then re-apply cache-control on _app/immutable/** and **.html (see deploy.yml), then:
gcloud compute url-maps invalidate-cdn-cache marusja-cakes-lb --path="/*" --async --project=marusja-cakes
```

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
