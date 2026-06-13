<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href: string;
    class?: string;
    children: Snippet;
  }

  let { href, class: className = '', children }: Props = $props();

  // Prefer history back (SvelteKit restores scroll); fall back to `href` when
  // there is no prior entry in this app's history.
  function onclick(e: MouseEvent) {
    const idx = (history.state as { 'sveltekit:index'?: number } | null)?.[
      'sveltekit:index'
    ];
    if (typeof idx === 'number' && idx > 0) {
      e.preventDefault();
      history.back();
    }
  }
</script>

<a {href} class={className} {onclick}>
  {@render children()}
</a>
