<script lang="ts">
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import ImageGallery from '$lib/components/ui/ImageGallery.svelte';
  import { hasPhotos } from '$lib/productImages';

  interface Props {
    productId: string;
    grad: [string, string];
    alt: string;
    compact?: boolean;
    class?: string;
  }

  let { productId, grad, alt, compact = false, class: className = '' }: Props = $props();
</script>

{#if hasPhotos(productId)}
  <ImageGallery {productId} {alt} {compact} class={className} />
{:else}
  <div class="art {compact ? 'compact' : ''} {className}">
    <CakeArt {grad} />
  </div>
{/if}

<style>
  .art {
    width: 100%;
    display: grid;
    place-items: center;
    padding: 6% 8%;
  }

  .compact {
    padding: 2% 6%;
  }
</style>
