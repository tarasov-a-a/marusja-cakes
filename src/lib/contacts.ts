/**
 * Shop contact handles for the cart's "Send your order in" buttons.
 *
 * Like the feature flags (see src/lib/flags.ts), `import.meta.env.VITE_*` is
 * statically inlined by Vite at build time — safe under prerendering. The
 * committed defaults are the live accounts, so the app works with zero config; a
 * build can override either via `.env` (see .env.example).
 */

/** WhatsApp number in international format, digits only (no `+`/spaces) — for `wa.me/<number>`. */
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '381665814358';

/** Telegram username without the leading `@` — for `t.me/<username>`. */
export const TELEGRAM_USERNAME = import.meta.env.VITE_TELEGRAM_USERNAME || 'anatolii_tarasov_a';
