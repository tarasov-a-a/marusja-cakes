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
import { toPlainText, toWhatsAppText } from '$lib/messenger';
import type { CartItem } from '$lib/types';

export interface OrderTotals {
  subtotal: number;
  delivery: number;
  total: number;
}

/**
 * Build the order as standard Markdown: a cheerful 🎂 heading, a warm intro, one
 * 🍰-bulleted line per item with its line total, then subtotal / 🚚 delivery /
 * **🎉 total** and a thank-you sign-off. Reuses the existing `cart:*` i18n keys
 * so the words follow the active locale; the emoji are language-neutral message
 * decoration (kept here, not in i18n, so the on-page summary stays plain).
 */
export function buildOrderMarkdown(
  cart: CartItem[],
  t: TranslateFn,
  { subtotal, delivery, total }: OrderTotals,
): string {
  const lines: string[] = [
    `# 🎂 ${t('cart:orderHeading')}`,
    '',
    t('cart:orderIntro'),
    '',
  ];

  for (const item of cart) {
    const name = localizeProduct(item.product, t).name;
    lines.push(
      `🍰 ${t('cart:orderLine', {
        name,
        size: item.size,
        qty: item.qty,
        price: formatPrice(item.qty * item.price, 2),
      })}`,
    );
  }

  const deliveryLabel = delivery === 0 ? t('cart:free') : formatPrice(delivery, 2);
  lines.push(
    '',
    `${t('cart:subtotal')}: ${formatPrice(subtotal, 2)}`,
    `🚚 ${t('cart:delivery')}: ${deliveryLabel}`,
    `**🎉 ${t('cart:total')}: ${formatPrice(total, 2)}**`,
    '',
    t('cart:orderThanks'),
  );

  return lines.join('\n');
}

/** Click-to-chat WhatsApp deep link with the order pre-filled as WhatsApp text. */
export function whatsAppHref(number: string, markdown: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(toWhatsAppText(markdown))}`;
}

/**
 * Click-to-chat Telegram deep link with the order pre-filled as a draft. A
 * `t.me/<username>?text=` link opens the chat with the text dropped into the
 * compose box — Telegram does NOT auto-format `*bold*` there, so we send the
 * plain-text flavor (markers stripped) for a clean, readable draft.
 */
export function telegramHref(username: string, markdown: string): string {
  return `https://t.me/${username}?text=${encodeURIComponent(toPlainText(markdown))}`;
}
