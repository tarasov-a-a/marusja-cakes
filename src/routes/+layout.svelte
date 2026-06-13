<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import '../app.css';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import BgTexture from '$lib/components/layout/BgTexture.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { dir, locale, STORAGE_KEY } from '$lib/i18n';

  let { children }: { children: Snippet } = $props();

  // Keep <html lang/dir> in sync with the active locale and persist the choice.
  $effect(() => {
    if (!browser) return;
    document.documentElement.lang = $locale;
    document.documentElement.dir = $dir;
    localStorage.setItem(STORAGE_KEY, $locale);
  });
</script>

<div class="shell">
  <BgTexture />
  <Header />
  <main class="main">
    {@render children()}
  </main>
  <Footer />
  <AuthModal />
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
</style>
