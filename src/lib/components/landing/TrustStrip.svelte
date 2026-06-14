<script lang="ts">
  import { Cake, Clock, Heart, Truck } from 'lucide-svelte';
  import { currency, DELIVERY, fmt } from '$lib/currency';
  import { t } from '$lib/i18n';

  let items = $derived([
    [Truck, $t('landing:trust.delivery', { amount: $fmt(DELIVERY[$currency].freeOver) })],
    [Clock, $t('landing:trust.nextDay')],
    [Cake, $t('landing:trust.madeToOrder')],
    [Heart, $t('landing:trust.butter')],
  ] as const);
</script>

<section class="wrap">
  <div class="strip">
    {#each items as [Icon, text], i (i)}
      <div class="item">
        <Icon size={20} color="var(--color-honey)" />
        {text}
      </div>
    {/each}
  </div>
</section>

<style>
  .wrap {
    max-width: 1180px;
    margin: 20px auto 0;
    padding: 0 24px;
  }

  .strip {
    background: var(--color-cocoa);
    border-radius: 24px;
    padding: 20px 30px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 16px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--color-cream);
    font-weight: 600;
    font-size: 14.5px;
  }
</style>
