export const CURRENCY_SYMBOL = 'E£';

export function formatPrice(amount: number, decimals = 0): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(decimals)}`;
}
