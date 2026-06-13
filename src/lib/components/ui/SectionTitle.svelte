<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<h2 class="title">{@render children()}</h2>

<style>
  .title {
    font-family: var(--font-serif);
    font-size: 25px;
    font-weight: 800;
    color: var(--color-cocoa);
    margin: 0 0 22px;
  }
</style>
