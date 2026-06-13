<script lang="ts">
  import { X } from 'lucide-svelte';
  import { avatarDataUrl, PROVIDERS, type ProviderId } from '$lib/auth';
  import ProviderGlyph from '$lib/components/auth/ProviderGlyph.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { t } from '$lib/i18n';
  import { LOGO } from '$lib/logo';
  import { authOpen, flash, setAuthOpen, setUser } from '$lib/stores/shop';

  let loading = $state<string | null>(null);

  function signIn(prov: ProviderId) {
    loading = prov;
    setTimeout(() => {
      setUser({
        id: crypto.randomUUID(),
        name:
          prov === 'Google'
            ? 'Mona Halabi'
            : prov === 'Apple'
              ? 'Sam Rivera'
              : 'Alex Carter',
        email: `you@${prov.toLowerCase()}.com`,
        provider: prov,
        avatar: avatarDataUrl(prov),
      });
      loading = null;
      setAuthOpen(false);
      flash($t('auth:signedIn', { provider: prov }));
    }, 1100);
  }
</script>

{#if $authOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="overlay"
    onclick={() => !loading && setAuthOpen(false)}
    onkeydown={(e) => e.key === 'Escape' && !loading && setAuthOpen(false)}
    role="presentation"
  >
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div class="top">
        <button type="button" class="close" onclick={() => setAuthOpen(false)}>
          <X size={18} />
        </button>
        <div class="logo">
          <img src={LOGO} alt="" />
        </div>
        <h2 id="auth-title" class="welcome">{$t('auth:welcome')}</h2>
        <p class="subtitle">{$t('auth:subtitle')}</p>
      </div>

      <div class="body">
        <div class="providers">
          {#each PROVIDERS as p (p.id)}
            <button
              type="button"
              disabled={!!loading}
              class="providerBtn {loading && loading !== p.id ? 'dimmed' : ''}"
              style="border: 1.5px solid {p.border}; background: {p.color}; color: {p.text};"
              onclick={() => signIn(p.id)}
            >
              {#if loading === p.id}
                <Spinner color={p.text} />
              {:else}
                <ProviderGlyph glyph={p.glyph} />
                {$t('auth:continueWith', { provider: p.id })}
              {/if}
            </button>
          {/each}
        </div>

        <div class="divider">
          <div class="dividerLine"></div>
          {$t('auth:secured')}
          <div class="dividerLine"></div>
        </div>

        <p class="disclaimer">{$t('auth:disclaimer')}</p>
        <p class="terms">{$t('auth:terms')}</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(90, 52, 22, 0.45);
    backdrop-filter: blur(6px);
    z-index: 300;
    display: grid;
    place-items: center;
    padding: 20px;
    animation: fade 0.25s ease;
  }

  .modal {
    background: var(--color-cream);
    border-radius: 30px;
    border: 2px solid var(--color-cocoa);
    width: 100%;
    max-width: 420px;
    padding: 0 0 30px;
    overflow: hidden;
    box-shadow: 0 30px 70px rgba(90, 52, 22, 0.4);
    animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  .top {
    background: linear-gradient(160deg, var(--color-honey), var(--color-caramel));
    padding: 30px 30px 26px;
    position: relative;
    text-align: center;
  }

  .close {
    position: absolute;
    top: 16px;
    inset-inline-end: 16px;
    background: rgba(90, 52, 22, 0.15);
    border: none;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--color-cocoa);
    transition: background 0.2s, transform 0.15s;
  }

  .close:hover {
    background: rgba(90, 52, 22, 0.26);
  }

  .close:active {
    transform: scale(0.92);
  }

  .logo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--color-cocoa);
    margin: 0 auto 12px;
    box-shadow: 0 6px 0 rgba(90, 52, 22, 0.25);
  }

  .logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .welcome {
    font-family: var(--font-serif);
    font-size: 26px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin: 0;
  }

  .subtitle {
    color: #7a4d28;
    font-size: 14.5px;
    margin-top: 4px;
    font-weight: 600;
  }

  .body {
    padding: 26px 30px 0;
  }

  .providers {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .providerBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    padding: 13px;
    border-radius: 14px;
    font-family: inherit;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 0.15s, opacity 0.2s, filter 0.2s;
  }

  .providerBtn:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  .providerBtn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .providerBtn:disabled {
    cursor: wait;
  }

  .dimmed {
    opacity: 0.5;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0 18px;
    color: var(--color-coffee);
    font-size: 13px;
    font-weight: 600;
  }

  .dividerLine {
    flex: 1;
    height: 1.5px;
    background: var(--color-card-edge);
  }

  .disclaimer {
    text-align: center;
    font-size: 12.5px;
    color: var(--color-coffee);
    opacity: 0.8;
    line-height: 1.5;
  }

  .terms {
    text-align: center;
    font-size: 12px;
    color: var(--color-coffee);
    opacity: 0.7;
    margin-top: 14px;
  }
</style>
