<script lang="ts">
  import { goto } from '$app/navigation';
  import { Menu as MenuIcon, ShoppingBag, User, X } from 'lucide-svelte';
  import LanguageSwitcher from '$lib/components/layout/LanguageSwitcher.svelte';
  import { t } from '$lib/i18n';
  import { LOGO } from '$lib/logo';
  import { cartCount, setAuthOpen, user } from '$lib/stores/shop';

  let stuck = $state(false);
  let mobile = $state(false);

  $effect(() => {
    const onScroll = () => (stuck = window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  let nav = $derived([
    { label: $t('common:nav.cakes'), href: '/' },
    { label: $t('common:nav.story'), href: '/' },
    { label: $t('common:nav.custom'), href: '/' },
  ]);
</script>

<header class="header {stuck ? 'stuck' : ''}">
  <div class="inner">
    <a href="/" class="logoBtn" onclick={() => (mobile = false)}>
      <div class="logoImg">
        <img src={LOGO} alt={$t('common:brand')} />
      </div>
      <div class="brand">
        <div class="brandName">{$t('common:brand')}</div>
        <div class="brandTag">{$t('common:tagline')}</div>
      </div>
    </a>

    <nav class="nav deskNav">
      {#each nav as item (item.label)}
        <a href={item.href} class="navLink">{item.label}</a>
      {/each}
    </nav>

    <div class="actions">
      <LanguageSwitcher />
      <button
        type="button"
        class="userBtn {$user ? 'userBtnLogged' : ''}"
        onclick={() => ($user ? goto('/settings') : setAuthOpen(true))}
        title={$user ? 'Account' : 'Sign in'}
      >
        {#if $user}
          <img src={$user.avatar} alt="" class="userAvatar" />
          <span class="deskNav">{$user.name.split(' ')[0]}</span>
        {:else}
          <User size={22} strokeWidth={2.2} />
        {/if}
      </button>

      <a href="/cart" class="cartBtn">
        <ShoppingBag size={21} color="var(--color-sponge)" strokeWidth={2.2} />
        {#if $cartCount > 0}
          <span class="cartBadge">{$cartCount}</span>
        {/if}
      </a>

      <button
        type="button"
        class="menuToggle mobOnly"
        onclick={() => (mobile = !mobile)}
        aria-expanded={mobile}
      >
        {#if mobile}
          <X size={26} />
        {:else}
          <MenuIcon size={26} />
        {/if}
      </button>
    </div>
  </div>

  {#if mobile}
    <div class="mobileNav mobOnly mobileOpen">
      {#each nav as item (item.label)}
        <a href={item.href} class="mobileLink" onclick={() => (mobile = false)}>
          {item.label}
        </a>
      {/each}
    </div>
  {/if}
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 90;
    transition: all 0.3s ease;
    border-bottom: 1.5px solid transparent;
  }

  .stuck {
    background: rgba(246, 220, 169, 0.92);
    backdrop-filter: blur(10px);
    border-bottom-color: var(--color-card-edge);
  }

  .inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logoBtn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    color: inherit;
  }

  .logoImg {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    border: 2.5px solid var(--color-cocoa);
    box-shadow: 0 4px 0 rgba(90, 52, 22, 0.25);
    flex-shrink: 0;
  }

  .logoImg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .brand {
    text-align: start;
    line-height: 1;
  }

  .brandName {
    font-family: var(--font-serif);
    font-weight: 900;
    font-size: 22px;
    color: var(--color-cocoa);
    letter-spacing: -0.02em;
  }

  .brandTag {
    font-size: 10.5px;
    color: var(--color-coffee);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .nav {
    display: flex;
    gap: 6px;
    margin-inline-start: 18px;
  }

  .navLink {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    font-size: 15px;
    color: var(--color-cocoa);
    padding: 8px 14px;
    border-radius: 999px;
    transition: background 0.2s;
    text-decoration: none;
  }

  .navLink:hover {
    background: rgba(90, 52, 22, 0.08);
  }

  .actions {
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .userBtn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 2px solid transparent;
    padding: 8px;
    border-radius: 999px;
    cursor: pointer;
    font-family: inherit;
    color: var(--color-cocoa);
    font-weight: 700;
  }

  .userBtnLogged {
    background: var(--color-sponge);
    border-color: var(--color-card-edge);
    padding: 5px 12px 5px 6px;
  }

  .userAvatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-cocoa);
  }

  .cartBtn {
    position: relative;
    background: var(--color-cocoa);
    border: none;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    cursor: pointer;
    display: grid;
    place-items: center;
    box-shadow: 0 5px 0 #3d2310;
    text-decoration: none;
  }

  .cartBadge {
    position: absolute;
    top: -5px;
    inset-inline-end: -5px;
    background: var(--color-rose);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    min-width: 22px;
    height: 22px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    border: 2px solid var(--color-cream);
    padding: 0 5px;
  }

  .menuToggle {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-cocoa);
    display: none;
  }

  .mobileNav {
    display: none;
    flex-direction: column;
    padding: 0 24px 16px;
    gap: 4px;
  }

  .mobileLink {
    text-align: start;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 14px;
    padding: 13px 16px;
    font-family: inherit;
    font-weight: 700;
    color: var(--color-cocoa);
    font-size: 16px;
    cursor: pointer;
    text-decoration: none;
  }

  .mobileOpen {
    display: flex;
  }
</style>
