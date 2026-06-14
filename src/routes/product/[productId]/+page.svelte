<script lang="ts">
  import { ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-svelte';
  import BackLink from '$lib/components/ui/BackLink.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import ProductMedia from '$lib/components/product/ProductMedia.svelte';
  import Stars from '$lib/components/ui/Stars.svelte';
  import { PRODUCTS } from '$lib/data/products';
  import { formatPrice } from '$lib/currency';
  import { t } from '$lib/i18n';
  import { localizeProduct, localizeProducts } from '$lib/localize';
  import { addToCart, flash } from '$lib/stores/shop';
  import type { SizeKey } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let qty = $state(1);
  // Selected format key; the $effect below pins it to the product's default size.
  let size = $state<SizeKey>('full');

  // Reset selection when navigating between products.
  $effect(() => {
    qty = 1;
    size = data.product.sizes[0].size;
  });

  let product = $derived(data.product);
  let localized = $derived(localizeProduct(product, $t));

  // Available formats come straight from the product configuration — a cake is
  // only offered in the sizes it lists (e.g. pancho-pineapple is full-cake only).
  let sizes = $derived(
    product.sizes.map((opt) => ({
      key: opt.size,
      label: $t(`product:sizes.${opt.size}`),
      sub: $t('product:sizes.serves', { serves: $t(`serves:${opt.servesKey}`) }),
      price: opt.price,
    })),
  );

  let related = $derived(
    localizeProducts(PRODUCTS, $t)
      .filter((p) => p.id !== product.id)
      .slice(0, 3),
  );

  let selected = $derived(product.sizes.find((s) => s.size === size) ?? product.sizes[0]);
  let sizePrice = $derived(selected.price);
  let sizeLabel = $derived($t(`product:sizes.${selected.size}`));

  let metaRows = $derived([
    ['serves', $t(`serves:${selected.servesKey}`)],
    ['allergens', localized.allergens],
    ['keeps', $t('product:meta.keepsValue')],
    ['delivery', $t('product:meta.deliveryValue')],
  ] as const);
</script>

<svelte:head>
  <title>{localized.name} · {$t('common:brand')}</title>
</svelte:head>

<div class="page">
  <BackLink href="/" class="back flipDir">
    <ChevronLeft size={18} class="flipDir" />
    {$t('common:backToCakes')}
  </BackLink>

  <div class="grid heroGrid">
    <div class="artPanel">
      <div class="artBox">
        <div class="artTags">
          {#each localized.tagLabels as tag (tag)}
            <span class="artTag">{tag}</span>
          {/each}
        </div>
        <div class="artMain">
          <ProductMedia productId={product.id} grad={product.grad} alt={localized.name} />
        </div>
      </div>
    </div>

    <div class="info">
      <span class="category">{localized.categoryLabel}</span>
      <h1 class="name">{localized.name}</h1>
      <div class="ratingRow">
        <Stars value={product.rating} size={17} />
        <span class="ratingNum">{product.rating}</span>
        <span class="reviews">· {$t('common:reviews', { count: product.reviews })}</span>
      </div>
      <p class="desc">{localized.desc}</p>

      <div>
        <div class="sizeLabel">{$t('product:chooseSize')}</div>
        <div class="sizes">
          {#each sizes as s (s.key)}
            <button
              type="button"
              class="sizeBtn {size === s.key ? 'sizeActive' : ''}"
              aria-pressed={size === s.key}
              onclick={() => (size = s.key)}
            >
              <div class="sizeName">{s.label}</div>
              <div class="sizeSub">{s.sub}</div>
              <div class="sizePrice">{formatPrice(s.price)}</div>
            </button>
          {/each}
        </div>
      </div>

      <div class="qtyRow">
        <div class="qty">
          <button
            type="button"
            class="qtyBtn qtyBtnMinus"
            onclick={() => (qty = Math.max(1, qty - 1))}
          >
            <Minus size={18} />
          </button>
          <span class="qtyVal">{qty}</span>
          <button type="button" class="qtyBtn qtyBtnPlus" onclick={() => (qty += 1)}>
            <Plus size={18} />
          </button>
        </div>
        <Button
          variant="rose"
          fullWidth
          onclick={() => {
            addToCart(product, qty, sizeLabel, sizePrice);
            flash($t('cart:added', { name: localized.name }));
          }}
        >
          <ShoppingBag size={19} />
          {$t('product:addToCart', { total: sizePrice * qty })}
        </Button>
      </div>

      <div class="meta">
        {#each metaRows as [k, v] (k)}
          <div>
            <div class="metaKey">{$t(`product:meta.${k}`)}</div>
            <div class="metaVal">{v}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="related">
    <h2 class="relatedTitle">{$t('product:related')}</h2>
    <div class="relatedGrid">
      {#each related as r, i (r.id)}
        <ProductCard product={r} index={i} />
      {/each}
    </div>
  </div>
</div>

<style>
  .page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 20px 24px 0;
  }

  /* BackLink renders its own <a>, so target it through the component boundary. */
  .page :global(.back) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--color-coffee);
    font-weight: 700;
    font-family: inherit;
    font-size: 15px;
    cursor: pointer;
    margin-bottom: 18px;
    text-decoration: none;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 44px;
    align-items: start;
  }

  .artPanel {
    animation: rise 0.6s ease both;
  }

  .artBox {
    background: linear-gradient(160deg, var(--color-cream), var(--color-honey));
    border-radius: 32px;
    border: 2px solid var(--color-card-edge);
    padding: 40px;
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
  }

  .artTags {
    position: absolute;
    top: 18px;
    inset-inline-start: 18px;
    display: flex;
    gap: 7px;
    z-index: 1;
  }

  .artTag {
    background: var(--color-cocoa);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    padding: 6px 13px;
    border-radius: 999px;
  }

  .artMain {
    width: 100%;
  }

  .info {
    animation: rise 0.6s ease both;
    animation-delay: 0.1s;
  }

  .category {
    font-weight: 800;
    color: var(--color-rose);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 13px;
  }

  .name {
    font-family: var(--font-serif);
    font-size: 44px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin: 8px 0 10px;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .ratingRow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .ratingNum {
    font-weight: 700;
    color: var(--color-cocoa);
  }

  .reviews {
    color: var(--color-coffee);
    opacity: 0.8;
  }

  .desc {
    font-size: 16.5px;
    line-height: 1.65;
    color: var(--color-coffee);
    margin-bottom: 26px;
  }

  .sizeLabel {
    font-weight: 800;
    color: var(--color-cocoa);
    margin-bottom: 10px;
    font-size: 14px;
  }

  .sizes {
    display: grid;
    /* One column per offered size — a cake made in a single format fills the row. */
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin-bottom: 22px;
  }

  .sizeBtn {
    text-align: start;
    padding: 13px 15px;
    border-radius: 16px;
    border: 2.5px solid var(--color-card-edge);
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  .sizeBtn:not(.sizeActive):hover {
    border-color: var(--color-honey);
    background: var(--color-sponge);
  }

  .sizeActive {
    border-color: var(--color-cocoa);
    background: var(--color-sponge);
  }

  .sizeName {
    font-weight: 800;
    color: var(--color-cocoa);
    font-size: 15px;
  }

  .sizeSub {
    font-size: 12px;
    color: var(--color-coffee);
    opacity: 0.8;
  }

  .sizePrice {
    font-weight: 800;
    color: var(--color-rose);
    margin-top: 4px;
  }

  .qtyRow {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 22px;
  }

  .qty {
    display: flex;
    align-items: center;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 999px;
    padding: 5px;
  }

  .qtyBtn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.2s, transform 0.15s;
  }

  .qtyBtn:active {
    transform: scale(0.9);
  }

  .qtyBtnMinus {
    background: transparent;
    color: var(--color-cocoa);
  }

  .qtyBtnMinus:hover {
    background: rgba(90, 52, 22, 0.08);
  }

  .qtyBtnPlus {
    background: var(--color-cocoa);
    color: var(--color-sponge);
  }

  .qtyBtnPlus:hover {
    background: #4a2b12;
  }

  .qtyVal {
    width: 36px;
    text-align: center;
    font-weight: 800;
    color: var(--color-cocoa);
    font-size: 17px;
  }

  .meta {
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 20px;
    padding: 18px 22px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .metaKey {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-rose);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metaVal {
    color: var(--color-cocoa);
    font-weight: 600;
    font-size: 14.5px;
  }

  .related {
    margin-top: 64px;
  }

  .relatedTitle {
    font-family: var(--font-serif);
    font-size: 30px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin-bottom: 20px;
  }

  .relatedGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 26px;
  }
</style>
