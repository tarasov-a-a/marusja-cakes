<script lang="ts">
  import { ArrowRight, CreditCard, Shield } from 'lucide-svelte';
  import CartLine from '$lib/components/cart/CartLine.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import { formatPrice } from '$lib/currency';
  import { t } from '$lib/i18n';
  import { cart, flash, subtotal } from '$lib/stores/shop';

  let delivery = $derived($subtotal > 1500 || $subtotal === 0 ? 0 : 150);
  let total = $derived($subtotal + delivery);
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
        <Button variant="rose" fullWidth onclick={() => flash($t('cart:checkoutMock'))}>
          <CreditCard size={18} /> {$t('cart:checkout')}
        </Button>
        <a href="/" class="keepShopping">{$t('cart:keepShopping')}</a>
        <div class="secure">
          <Shield size={14} /> {$t('cart:secure')}
        </div>
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
    margin-top: 12px;
    background: none;
    border: none;
    color: var(--color-honey);
    font-family: inherit;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
  }

  .secure {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    margin-top: 16px;
    color: var(--color-honey);
    opacity: 0.7;
    font-size: 12.5px;
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
