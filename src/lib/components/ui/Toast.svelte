<script lang="ts">
  import { Check } from 'lucide-svelte';
  import { toast } from '$lib/stores/shop';
</script>

<div class="toast {$toast ? 'visible' : ''}">
  <Check
    class="toast-check"
    size={16}
    width={16}
    height={16}
    strokeWidth={3}
    color="var(--color-honey)"
  />
  {$toast}
</div>

<style>
  .toast {
    --gutter: 24px;
    max-width: calc(100vw - (var(--gutter) * 2));
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(30px);
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
    background: var(--color-cocoa);
    color: var(--color-sponge);
    padding: 13px 22px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 14px;
    z-index: 200;
    pointer-events: none;
    box-shadow: 0 12px 30px rgba(90, 52, 22, 0.35);
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .visible {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  @media (max-width: 600px) {
    .toast {
      width: calc(100vw - (var(--gutter) * 2));
    }
  }
</style>
