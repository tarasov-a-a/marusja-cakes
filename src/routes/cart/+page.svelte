<script lang="ts">
  import { ArrowRight, MessageCircle, Send } from 'lucide-svelte';
  import CartLine from '$lib/components/cart/CartLine.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import { TELEGRAM_USERNAME, WHATSAPP_NUMBER } from '$lib/contacts';
  import { formatPrice } from '$lib/currency';
  import { t } from '$lib/i18n';
  import { buildOrderMarkdown, telegramHref, whatsAppHref } from '$lib/order';
  import { cart, subtotal } from '$lib/stores/shop';

  let delivery = $derived($subtotal > 1500 || $subtotal === 0 ? 0 : 150);
  let total = $derived($subtotal + delivery);

  let orderMd = $derived(
    buildOrderMarkdown($cart, $t, { subtotal: $subtotal, delivery, total }),
  );
  // Both deep links pre-fill the chat with the order; the customer just hits Send.
  let waHref = $derived(whatsAppHref(WHATSAPP_NUMBER, orderMd));
  let tgHref = $derived(telegramHref(TELEGRAM_USERNAME, orderMd));
</script>

<svelte:head>
  <title>{$t('cart:title')} · {$t('common:brand')}</title>
</svelte:head>

{#if $cart.length === 0}
  <div class="empty">
    <div class="emptyArt">
      <CakeArt grad={['#F0C080', '#E0A070']} />
    </div>
    <h2 class="emptyTitle">{$t('cart:emptyTitle')}</h2>
    <p class="emptyText">{$t('cart:emptyText')}</p>
    <a href="/">
      <Button variant="primary">
        {$t('cart:findCake')} <ArrowRight size={17} />
      </Button>
    </a>
  </div>
{:else}
  <div class="page">
    <h1 class="title">{$t('cart:title')}</h1>
    <p class="subtitle">{$t('cart:treats', { count: $cart.length })}</p>

    <div class="grid heroGrid">
      <div class="items">
        {#each $cart as item (item.key)}
          <CartLine {item} />
        {/each}
      </div>

      <div class="summary">
        <h2 class="summaryTitle">{$t('cart:summary')}</h2>
        <div class="row">
          <span>{$t('cart:subtotal')}</span>
          <span class="rowVal">{formatPrice($subtotal, 2)}</span>
        </div>
        <div class="row">
          <span>{$t('cart:delivery')}</span>
          <span class="rowVal {delivery === 0 ? 'rowValFree' : ''}">
            {delivery === 0 ? $t('cart:free') : formatPrice(delivery, 2)}
          </span>
        </div>
        {#if delivery > 0}
          <div class="hint">
            {$t('cart:freeDeliveryHint', { amount: (1500 - $subtotal).toFixed(2) })}
          </div>
        {/if}
        <div class="totalRow">
          <span class="totalLabel">{$t('cart:total')}</span>
          <span class="totalVal">{formatPrice(total, 2)}</span>
        </div>
        <div class="sendOrder">
          <h3 class="sendTitle">{$t('cart:sendOrderTitle')}</h3>
          <div class="sendButtons">
            <a href={waHref} target="_blank" rel="noopener noreferrer" class="sendLink">
              <Button variant="whatsapp" fullWidth>
                <MessageCircle size={18} /> {$t('cart:whatsapp')}
              </Button>
            </a>
            <a href={tgHref} target="_blank" rel="noopener noreferrer" class="sendLink">
              <Button variant="telegram" fullWidth>
                <Send size={18} /> {$t('cart:telegram')}
              </Button>
            </a>
          </div>
        </div>
        <a href="/" class="keepShopping">{$t('cart:keepShopping')}</a>
      </div>
    </div>
  </div>
{/if}

<style>
  .empty {
    max-width: 600px;
    margin: 0 auto;
    padding: 60px 24px;
    text-align: center;
  }

  .emptyArt {
    width: 180px;
    margin: 0 auto 10px;
    opacity: 0.5;
  }

  .emptyTitle {
    font-family: var(--font-serif);
    font-size: 34px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin: 10px 0;
  }

  .emptyText {
    color: var(--color-coffee);
    font-size: 16px;
    margin-bottom: 26px;
  }

  .page {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 24px 0;
    box-sizing: border-box;
  }

  .title {
    font-family: var(--font-serif);
    font-size: 42px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin-bottom: 6px;
  }

  .subtitle {
    color: var(--color-coffee);
    margin-bottom: 28px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1.6fr 0.9fr;
    gap: 30px;
    align-items: start;
    min-width: 0;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .summary {
    background: var(--color-cocoa);
    border-radius: 26px;
    padding: 26px 26px 28px;
    color: var(--color-sponge);
    position: sticky;
    top: 90px;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .summaryTitle {
    font-family: var(--font-serif);
    font-size: 24px;
    font-weight: 800;
    color: var(--color-cream);
    margin: 0 0 18px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    padding: 9px 0;
    color: var(--color-honey);
    font-size: 15px;
    min-width: 0;
  }

  .row > span:first-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  .rowVal {
    font-weight: 700;
    color: var(--color-cream);
    flex-shrink: 0;
    text-align: end;
    white-space: nowrap;
  }

  .rowValFree {
    color: #9fd49a;
  }

  .hint {
    background: rgba(240, 192, 128, 0.12);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--color-honey);
    margin: 6px 0;
  }

  .totalRow {
    border-top: 1px solid rgba(240, 192, 128, 0.25);
    margin: 14px 0;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
  }

  .totalLabel {
    font-weight: 700;
    font-size: 16px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .totalVal {
    font-family: var(--font-serif);
    font-weight: 900;
    font-size: 30px;
    color: var(--color-cream);
    flex-shrink: 0;
    text-align: end;
    white-space: nowrap;
  }

  .keepShopping {
    display: inline-block;
    width: 100%;
    margin-top: 20px;
    background: none;
    border: none;
    color: var(--color-honey);
    font-family: inherit;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: color 0.2s;
  }

  .keepShopping:hover {
    color: var(--color-cream);
  }

  .sendTitle {
    font-family: var(--font-serif);
    font-size: 18px;
    font-weight: 800;
    color: var(--color-cream);
    margin: 4px 0 12px;
  }

  .sendButtons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sendLink {
    display: block;
    text-decoration: none;
  }

  @media (max-width: 640px) {
    .page {
      padding: 16px 16px 0;
    }

    .title {
      font-size: 32px;
    }

    .summary {
      position: static;
      padding: 22px 18px 24px;
      border-radius: 22px;
    }

    .summaryTitle {
      font-size: 22px;
    }

    .totalVal {
      font-size: 26px;
    }
  }
</style>
