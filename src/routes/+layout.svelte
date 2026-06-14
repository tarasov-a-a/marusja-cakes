<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import '../app.css';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import BgTexture from '$lib/components/layout/BgTexture.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { currency, CURRENCY_STORAGE_KEY } from '$lib/currency';
  import { features } from '$lib/flags';
  import { dir, locale, STORAGE_KEY, t } from '$lib/i18n';

  let { children }: { children: Snippet } = $props();

  // Keep <html lang/dir> in sync with the active locale and persist the choice.
  // `data-hydrated` flips to "true" only once this client-only effect runs, i.e.
  // after hydration — E2E navigation waits on it so clicks never race ahead of
  // the interactive handlers (see e2e/fixtures.ts).
  $effect(() => {
    if (!browser) return;
    document.documentElement.lang = $locale;
    document.documentElement.dir = $dir;
    document.documentElement.dataset.hydrated = 'true';
    localStorage.setItem(STORAGE_KEY, $locale);
    localStorage.setItem(CURRENCY_STORAGE_KEY, $currency);
  });
</script>

<div class="shell">
  <a href="#main" class="skipLink">{$t('common:a11y.skipToContent')}</a>
  <BgTexture />
  <Header />
  <main id="main" class="main">
    {@render children()}
  </main>
  <Footer />
  {#if features.auth}
    <AuthModal />
  {/if}
  <Toast />
</div>

<style>
  .shell {
    min-height: 100vh;
    background: var(--color-cream);
    font-family: var(--font-sans);
    color: var(--color-cocoa);
    position: relative;
  }

  .main {
    position: relative;
    z-index: 1;
    padding-top: 8px;
  }

  .skipLink {
    position: absolute;
    inset-inline-start: -9999px;
    top: 0;
    z-index: 1000;
    background: var(--color-cocoa);
    color: var(--color-cream);
    padding: 10px 16px;
    border-radius: 0 0 12px 12px;
    font-weight: 700;
    text-decoration: none;
  }

  .skipLink:focus {
    inset-inline-start: 0;
  }
</style>
