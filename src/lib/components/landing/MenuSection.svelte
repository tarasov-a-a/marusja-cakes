<script lang="ts">
  import ProductCard from '$lib/components/product/ProductCard.svelte';
  import { ALL_CATEGORY, CATEGORY_KEYS } from '$lib/constants/categories';
  import { PRODUCTS } from '$lib/data/products';
  import { t } from '$lib/i18n';
  import { localizeProducts } from '$lib/localize';
  import type { CategoryKey } from '$lib/types';

  let cat = $state<string>(ALL_CATEGORY);

  const categories = [ALL_CATEGORY, ...CATEGORY_KEYS];

  let localized = $derived(localizeProducts(PRODUCTS, $t));
  let list = $derived(
    cat === ALL_CATEGORY
      ? localized
      : localized.filter((p) => p.category.includes(cat as CategoryKey)),
  );
</script>

<section id="menu" class="section">
  <div class="head">
    <div>
      <span class="label">{$t('landing:menuLabel')}</span>
      <h2 class="title">{$t('landing:menuTitle')}</h2>
    </div>
    <div class="filters">
      {#each categories as c (c)}
        <button
          type="button"
          class="filterBtn {cat === c ? 'filterActive' : ''}"
          aria-pressed={cat === c}
          onclick={() => (cat = c)}
        >
          {$t(`categories:${c}`)}
        </button>
      {/each}
    </div>
  </div>
  <div class="grid">
    {#each list as p, i (p.id)}
      <ProductCard product={p} index={i} />
    {/each}
  </div>
</section>

<style>
  .section {
    max-width: 1180px;
    margin: 0 auto;
    padding: 60px 24px 0;
  }

  .head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 26px;
  }

  .label {
    font-weight: 800;
    color: var(--color-rose);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 13px;
  }

  .title {
    font-family: var(--font-serif);
    font-size: 40px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin: 6px 0 0;
    letter-spacing: -0.02em;
  }

  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filterBtn {
    padding: 9px 18px;
    border-radius: 999px;
    border: 2px solid var(--color-card-edge);
    background: transparent;
    color: var(--color-coffee);
    font-weight: 700;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filterBtn:not(.filterActive):hover {
    border-color: var(--color-cocoa);
    color: var(--color-cocoa);
  }

  .filterBtn:active {
    transform: scale(0.96);
  }

  .filterActive {
    border-color: var(--color-cocoa);
    background: var(--color-cocoa);
    color: var(--color-sponge);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 26px;
  }
</style>
