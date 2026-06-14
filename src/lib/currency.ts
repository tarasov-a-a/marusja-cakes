import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

export const SUPPORTED_CURRENCIES = ['egp', 'rub'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * A price expressed in every supported currency. Prices are authored explicitly
 * per currency in the catalogue (`data/products.ts`) — there is no FX
 * conversion; the active currency just selects which number to read.
 */
export type Money = Record<SupportedCurrency, number>;

export const CURRENCY_STORAGE_KEY = 'marusja-cakes-currency';

interface CurrencyConfig {
  /** Display symbol. */
  symbol: string;
  /** Where the symbol sits relative to the amount. */
  position: 'prefix' | 'suffix';
}

const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  egp: { symbol: 'E£', position: 'prefix' },
  rub: { symbol: '₽', position: 'suffix' },
};

/** Read the price for `currency` out of a per-currency `Money` map. */
export function priceIn(money: Money, currency: SupportedCurrency): number {
  return money[currency];
}

/**
 * Format an amount (already in `currency`) with that currency's symbol and
 * placement. Plain `toFixed` — no `Intl` grouping — matching the app's terse
 * price style (e.g. `E£900`, `1620 ₽`).
 */
export function formatPrice(
  amount: number,
  currency: SupportedCurrency,
  decimals = 0,
): string {
  const { symbol, position } = CURRENCIES[currency];
  const value = amount.toFixed(decimals);
  return position === 'prefix' ? `${symbol}${value}` : `${value} ${symbol}`;
}

/** Free-delivery threshold and flat fee, authored per currency. */
export const DELIVERY: Record<SupportedCurrency, { freeOver: number; fee: number }> = {
  egp: { freeOver: 1500, fee: 150 },
  // TODO(rub): confirm Russian-ruble delivery thresholds with the shop owner.
  rub: { freeOver: 3000, fee: 300 },
};

function getInitialCurrency(): SupportedCurrency {
  if (!browser) return 'egp';
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) {
    return stored as SupportedCurrency;
  }
  return 'egp';
}

export const currency = writable<SupportedCurrency>(getInitialCurrency());

export function setCurrency(code: SupportedCurrency): void {
  currency.set(code);
}

/** Reactive formatter: `$fmt(priceIn(size.price, $currency))`, `$fmt(total, 2)`. */
export const fmt = derived(
  currency,
  ($currency) =>
    (amount: number, decimals = 0): string =>
      formatPrice(amount, $currency, decimals),
);
