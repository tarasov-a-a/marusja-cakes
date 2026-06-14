<script lang="ts">
  import { goto } from '$app/navigation';
  import { Plus, Star } from 'lucide-svelte';
  import ProductMedia from '$lib/components/product/ProductMedia.svelte';
  import { currency, fmt, priceIn } from '$lib/currency';
  import { defaultSize, headlinePrice } from '$lib/data/products';
  import { t } from '$lib/i18n';
  import { addToCart, flash } from '$lib/stores/shop';
  import type { LocalizedProduct } from '$lib/types';

  interface Props {
    product: LocalizedProduct;
    index?: number;
  }

  let { product, index = 0 }: Props = $props();

  let highlightFirst = $derived(
    product.tags[0] === 'bestseller' || product.tags[0] === 'new',
  );
</script>

<div
  class="card"
  style="animation-delay: {index * 0.07}s"
  role="link"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && goto(`/product/${product.id}`)}
>
  <div class="artWrap">
    <div class="tags">
      {#each product.tagLabels as tag, i (tag)}
        <span class="tag {i === 0 && highlightFirst ? 'tagHighlight' : 'tagDefault'}">
          {tag}
        </span>
      {/each}
    </div>
    <div class="art">
      <ProductMedia
        productId={product.id}
        grad={product.grad}
        alt={product.name}
        compact
        class="gallery"
      />
    </div>
  </div>
  <div
    class="body"
    role="button"
    tabindex="-1"
    onclick={() => goto(`/product/${product.id}`)}
    onkeydown={(e) => e.key === 'Enter' && goto(`/product/${product.id}`)}
  >
    <div class="meta">
      <span class="category">{product.categoryLabel}</span>
      <span class="rating">
        <Star size={13} fill="var(--color-honey)" color="var(--color-honey)" />
        {product.rating}
      </span>
    </div>
    <h3 class="name">{product.name}</h3>
    <p class="tagline">{product.tagline}</p>
    <div class="footer">
      <div class="price">{$fmt(priceIn(headlinePrice(product), $currency))}</div>
      <button
        type="button"
        class="addBtn"
        aria-label={$t('common:a11y.addToCart', { name: product.name })}
        onclick={(e) => {
          e.stopPropagation();
          const headline = defaultSize(product);
          addToCart(product, 1, $t(`product:sizes.${headline.size}`), headline.price);
          flash($t('cart:added', { name: product.name }));
        }}
      >
        <Plus size={22} strokeWidth={2.6} />
      </button>
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;
    background: var(--color-sponge);
    border-radius: 28px;
    border: 2px solid var(--color-card-edge);
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(90, 52, 22, 0.08);
    transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
    animation: rise 0.6s ease both;
  }

  .card:hover {
    filter: drop-shadow(0 22px 44px rgba(90, 52, 22, 0.18));
  }

  .artWrap {
    position: relative;
    background: linear-gradient(160deg, var(--color-cream), rgba(240, 192, 128, 0.2));
    padding: 26px 20px 14px;
    display: grid;
    place-items: center;
  }

  .tags {
    position: absolute;
    top: 14px;
    inset-inline-start: 14px;
    display: flex;
    gap: 6px;
    z-index: 1;
  }

  .tag {
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 11px;
    border-radius: 999px;
    letter-spacing: 0.03em;
  }

  .tagHighlight {
    background: var(--color-rose);
  }

  .tagDefault {
    background: var(--color-cocoa);
  }

  .art {
    width: 100%;
  }

  .body {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    padding: 18px 22px 22px;
    cursor: pointer;
    text-align: start;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .category {
    font-size: 12px;
    font-weight: 800;
    color: var(--color-rose);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-coffee);
  }

  .name {
    font-family: var(--font-serif);
    font-size: 21px;
    font-weight: 700;
    color: var(--color-cocoa);
    margin: 2px 0 5px;
    line-height: 1.1;
  }

  .tagline {
    color: var(--color-coffee);
    font-size: 13.5px;
    line-height: 1.4;
    margin-bottom: 16px;
    opacity: 0.85;
    min-height: 38px;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }

  .price {
    font-family: var(--font-serif);
    font-size: 26px;
    font-weight: 900;
    color: var(--color-cocoa);
  }

  .addBtn {
    background: var(--color-cocoa);
    border: none;
    color: var(--color-sponge);
    width: 46px;
    height: 46px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 4px 0 #3d2310;
    transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
  }

  .addBtn:hover {
    background: #4a2b12;
  }

  .addBtn:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #3d2310;
  }
</style>
