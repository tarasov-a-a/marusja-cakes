<script lang="ts">
  import { Star } from 'lucide-svelte';

  interface Props {
    value: number;
    size?: number;
  }

  let { value, size = 14 }: Props = $props();
</script>

<span class="stars">
  {#each [0, 1, 2, 3, 4] as i (i)}
    <Star
      {size}
      fill={i < Math.round(value) ? 'var(--color-honey)' : 'none'}
      color="var(--color-caramel)"
      strokeWidth={2}
    />
  {/each}
</span>

<style>
  .stars {
    display: inline-flex;
    gap: 1px;
  }
</style>
