<script lang="ts">
  import { Minus, Plus, Trash2 } from 'lucide-svelte';
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import { currency, fmt, priceIn } from '$lib/currency';
  import { t } from '$lib/i18n';
  import { localizeProduct } from '$lib/localize';
  import { getProductImagePath, hasPhotos } from '$lib/productImages';
  import { removeItem, updateQty } from '$lib/stores/shop';
  import type { CartItem } from '$lib/types';

  let { item }: { item: CartItem } = $props();

  let localized = $derived(localizeProduct(item.product, $t));
</script>

<div class="item">
  <a href={`/product/${item.product.id}`} class="itemArt">
    <div class="itemArtInner">
      {#if hasPhotos(item.product.id)}
        <img
          src={getProductImagePath(item.product.id, 0)}
          alt={localized.name}
          class="heroImg"
          loading="eager"
        />
      {:else}
        <CakeArt grad={item.product.grad} />
      {/if}
    </div>
  </a>
  <div class="itemBody">
    <div class="itemName">{localized.name}</div>
    <div class="itemMeta">
      {$t('cart:each', { size: item.size, price: $fmt(priceIn(item.price, $currency)) })}
    </div>
    <div class="itemActions">
      <div class="qty">
        <button type="button" class="qtyBtn" onclick={() => updateQty(item.key, -1)}>
          <Minus size={15} color="var(--color-cocoa)" />
        </button>
        <span style="width: 28px; text-align: center; font-weight: 800;">{item.qty}</span>
        <button
          type="button"
          class="qtyBtn"
          style="background: var(--color-cocoa); color: var(--color-sponge);"
          onclick={() => updateQty(item.key, 1)}
        >
          <Plus size={15} />
        </button>
      </div>
      <button type="button" class="remove" onclick={() => removeItem(item.key)}>
        <Trash2 size={15} /> {$t('cart:remove')}
      </button>
    </div>
  </div>
  <div class="itemPrice">{$fmt(priceIn(item.price, $currency) * item.qty)}</div>
</div>

<style>
  .item {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 22px;
    padding: 16px;
    align-items: center;
    min-width: 0;
  }

  .itemArt {
    width: 92px;
    height: 92px;
    background: linear-gradient(160deg, var(--color-cream), rgba(240, 192, 128, 0.33));
    border-radius: 16px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    cursor: pointer;
    text-decoration: none;
    overflow: clip;
  }

  .itemArtInner {
    width: 100%;
    height: 100%;
  }

  .itemBody {
    flex: 1;
    min-width: 0;
  }

  .itemName {
    font-family: var(--font-serif);
    font-weight: 800;
    font-size: 19px;
    color: var(--color-cocoa);
    line-height: 1.1;
  }

  .itemMeta {
    font-size: 13px;
    color: var(--color-coffee);
    opacity: 0.85;
    margin: 2px 0 8px;
  }

  .itemActions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  .qty {
    display: flex;
    align-items: center;
    background: var(--color-cream);
    border-radius: 999px;
    padding: 3px;
    border: 1.5px solid var(--color-card-edge);
  }

  .qtyBtn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.2s, transform 0.15s, filter 0.2s;
  }

  .qtyBtn:hover {
    background: rgba(90, 52, 22, 0.1);
    filter: brightness(0.94);
  }

  .qtyBtn:active {
    transform: scale(0.9);
  }

  .remove {
    background: none;
    border: none;
    color: var(--color-rose);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    font-family: inherit;
    font-size: 13.5px;
    transition: color 0.2s;
  }

  .remove:hover {
    color: #b34a38;
  }

  .itemPrice {
    font-family: var(--font-serif);
    font-weight: 900;
    font-size: 22px;
    color: var(--color-cocoa);
    flex-shrink: 0;
    white-space: nowrap;
  }

  .heroImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 640px) {
    .item {
      gap: 12px;
      padding: 14px;
      align-items: flex-start;
    }

    .itemArt {
      width: 72px;
      height: 72px;
    }

    .itemArtInner {
      width: 60px;
    }

    .itemBody {
      flex: 1 1 calc(100% - 84px);
    }

    .itemName {
      font-size: 17px;
    }

    .itemPrice {
      flex: 1 0 100%;
      text-align: end;
      font-size: 20px;
      padding-top: 8px;
      border-top: 1px solid var(--color-card-edge);
    }
  }
</style>
