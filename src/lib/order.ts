/**
 * Order-message builders for the cart's "Send your order in" buttons.
 *
 * Pure, locale-aware functions: turn the cart into a styled standard-Markdown
 * summary, then into per-messenger deep links. Rendering to each platform's
 * flavor is the `messenger` module's job (see src/lib/messenger.ts).
 */

import { formatPrice } from '$lib/currency';
import type { TranslateFn } from '$lib/i18n';
import { localizeProduct } from '$lib/localize';
import { toWhatsAppText } from '$lib/messenger';
import type { CartItem } from '$lib/types';

export interface OrderTotals {
  subtotal: number;
  delivery: number;
  total: number;
}

/**
 * Build the order as standard Markdown (a bold heading, one line per item with
 * its line total, then subtotal / delivery / **total**). Reuses the existing
 * `cart:*` i18n keys so the message follows the active locale.
 */
export function buildOrderMarkdown(
  cart: CartItem[],
  t: TranslateFn,
  { subtotal, delivery, total }: OrderTotals,
): string {
  const lines: string[] = [`# ${t('cart:orderHeading')}`, ''];

  for (const item of cart) {
    const name = localizeProduct(item.product, t).name;
    lines.push(
      t('cart:orderLine', {
        name,
        size: item.size,
        qty: item.qty,
        price: formatPrice(item.qty * item.price, 2),
      }),
    );
  }

  const deliveryLabel = delivery === 0 ? t('cart:free') : formatPrice(delivery, 2);
  lines.push(
    '',
    `${t('cart:subtotal')}: ${formatPrice(subtotal, 2)}`,
    `${t('cart:delivery')}: ${deliveryLabel}`,
    `**${t('cart:total')}: ${formatPrice(total, 2)}**`,
  );

  return lines.join('\n');
}

/** Click-to-chat WhatsApp deep link with the order pre-filled as WhatsApp text. */
export function whatsAppHref(number: string, markdown: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(toWhatsAppText(markdown))}`;
}

/**
 * Telegram chat link. A `t.me/<username>` link to a personal account cannot
 * pre-fill message text, so callers copy the order to the clipboard first (see
 * the cart page) and the user pastes it into this chat.
 */
export function telegramChatUrl(username: string): string {
  return `https://t.me/${username}`;
}
