<script lang="ts">
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import { getProductById } from '$lib/data/products';
  import { formatPrice } from '$lib/currency';
  import { t } from '$lib/i18n';
  import { localizeProduct } from '$lib/localize';
  import { getProductImagePath, hasPhotos } from '$lib/productImages';
  import type { OrderItem } from '$lib/types';

  let { item }: { item: OrderItem } = $props();

  let product = $derived(getProductById(item.productId));
  let localized = $derived(product ? localizeProduct(product, $t) : null);
</script>

{#if product && localized}
  <div class="orderItem">
    <a href={`/product/${item.productId}`} class="orderItemArt">
      <div class="orderItemArtInner">
        {#if hasPhotos(item.productId)}
          <img
            src={getProductImagePath(item.productId, 0)}
            alt={localized.name}
            class="heroImg"
            loading="eager"
          />
        {:else}
          <CakeArt grad={product.grad} />
        {/if}
      </div>
    </a>
    <div class="orderItemBody">
      <div class="orderItemName">{localized.name}</div>
      <div class="orderItemMeta">{$t('cart:each', { size: item.size, price: item.price })}</div>
    </div>
    <div class="orderItemQty">×{item.qty}</div>
    <div class="orderItemPrice">{formatPrice(item.price * item.qty)}</div>
  </div>
{/if}

<style>
  .orderItem {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--color-cream);
    border-radius: 14px;
  }

  .orderItemArt {
    width: 56px;
    height: 56px;
    background: linear-gradient(160deg, var(--color-cream), rgba(240, 192, 128, 0.33));
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    text-decoration: none;
    overflow: clip;
  }

  .orderItemArtInner {
    width: 100%;
    height: 100%;
  }

  .heroImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .orderItemBody {
    flex: 1;
    min-width: 0;
  }

  .orderItemName {
    font-family: var(--font-serif);
    font-weight: 800;
    font-size: 15px;
    color: var(--color-cocoa);
    line-height: 1.2;
  }

  .orderItemMeta {
    font-size: 12px;
    color: var(--color-coffee);
    opacity: 0.85;
    margin-top: 2px;
  }

  .orderItemQty {
    font-weight: 800;
    font-size: 14px;
    color: var(--color-coffee);
  }

  .orderItemPrice {
    font-weight: 800;
    font-size: 15px;
    color: var(--color-cocoa);
    min-width: 48px;
    text-align: end;
  }
</style>
