<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'rose' | 'soft' | 'ghost';

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    fullWidth?: boolean;
    children: Snippet;
  }

  let {
    variant = 'primary',
    fullWidth = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

<button
  type="button"
  class="btn {variant} {fullWidth ? 'full' : ''} {className}"
  {...rest}
>
  {@render children()}
</button>

<style>
  .btn {
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-family: inherit;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s;
    font-size: 15px;
    letter-spacing: 0.01em;
  }

  .btn:active {
    transform: translateY(3px);
  }

  .primary {
    background: var(--color-cocoa);
    color: var(--color-sponge);
    padding: 13px 26px;
    box-shadow: var(--shadow-cocoa);
  }

  .rose {
    background: var(--color-rose);
    color: #fff;
    padding: 13px 26px;
    box-shadow: 0 6px 0 #b85c4a;
  }

  .soft {
    background: var(--color-sponge);
    color: var(--color-cocoa);
    padding: 12px 22px;
    border: 2px solid var(--color-card-edge);
    box-shadow: none;
  }

  .soft:active {
    transform: none;
  }

  .ghost {
    background: transparent;
    color: var(--color-cocoa);
    padding: 10px 16px;
    box-shadow: none;
  }

  .ghost:active {
    transform: none;
  }

  .full {
    width: 100%;
  }
</style>
