<script lang="ts">
  import { Globe } from 'lucide-svelte';
  import { locale, setLocale, SUPPORTED_LANGUAGES, t, type SupportedLanguage } from '$lib/i18n';

  let open = $state(false);
  let compactRef = $state<HTMLDivElement | null>(null);

  function change(code: SupportedLanguage) {
    setLocale(code);
    open = false;
  }

  $effect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!compactRef?.contains(e.target as Node)) open = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') open = false;
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div class="switcher" role="group" aria-label="Language">
  {#each SUPPORTED_LANGUAGES as code (code)}
    <button
      type="button"
      class="langBtn {$locale === code ? 'active' : ''}"
      onclick={() => change(code)}
    >
      {$t(`language:${code}`)}
    </button>
  {/each}
</div>

<div bind:this={compactRef} class="compact">
  <button
    type="button"
    class="compactTrigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label="Language"
    onclick={() => (open = !open)}
  >
    <Globe size={22} strokeWidth={2.2} />
  </button>

  {#if open}
    <ul class="menu" role="listbox" aria-label="Language">
      {#each SUPPORTED_LANGUAGES as code (code)}
        <li role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={$locale === code}
            class="menuItem {$locale === code ? 'menuItemActive' : ''}"
            onclick={() => change(code)}
          >
            {$t(`language:${code}`)}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .switcher {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 999px;
    padding: 4px;
  }

  .langBtn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 999px;
    color: var(--color-coffee);
    transition: background 0.2s, color 0.2s;
  }

  .langBtn:hover {
    color: var(--color-cocoa);
  }

  .active {
    background: var(--color-cocoa);
    color: var(--color-sponge) !important;
  }

  .compact {
    display: none;
    position: relative;
  }

  .compactTrigger {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 2px solid transparent;
    padding: 8px;
    border-radius: 999px;
    cursor: pointer;
    color: var(--color-cocoa);
  }

  .compactTrigger:hover {
    background: rgba(90, 52, 22, 0.08);
  }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    inset-inline-end: 0;
    z-index: 100;
    margin: 0;
    padding: 4px;
    list-style: none;
    min-width: 140px;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(90, 52, 22, 0.15);
  }

  .menuItem {
    display: block;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 10px;
    color: var(--color-coffee);
    text-align: start;
    transition: background 0.2s, color 0.2s;
  }

  .menuItem:hover {
    color: var(--color-cocoa);
    background: rgba(90, 52, 22, 0.06);
  }

  .menuItemActive {
    background: var(--color-cocoa);
    color: var(--color-sponge);
  }

  .menuItemActive:hover {
    background: var(--color-cocoa);
    color: var(--color-sponge);
  }

  @media (max-width: 880px) {
    .switcher {
      display: none;
    }

    .compact {
      display: block;
    }
  }
</style>
