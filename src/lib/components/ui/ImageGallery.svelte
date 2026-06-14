<script lang="ts">
  import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';
  import { portal } from '$lib/actions/portal';
  import { dir, t } from '$lib/i18n';
  import {
    buildSrcSet,
    getProductImagePath,
    HERO_SIZES_COMPACT,
    HERO_SIZES_PRODUCT,
    HERO_WIDTHS_COMPACT,
    HERO_WIDTHS_PRODUCT,
    IMAGE_COUNT,
    LIGHTBOX_SIZES,
    LIGHTBOX_WIDTHS,
    THUMB_SIZES_COMPACT,
    THUMB_SIZES_PRODUCT,
    THUMB_WIDTHS,
  } from '$lib/productImages';

  interface Props {
    productId: string;
    alt: string;
    class?: string;
    compact?: boolean;
  }

  let { productId, alt, class: className = '', compact = false }: Props = $props();

  const imageIndices = Array.from({ length: IMAGE_COUNT }, (_, i) => i);
  const count = imageIndices.length;

  let activeIndex = $state(0);
  let lightboxOpen = $state(false);

  let heroSizes = $derived(compact ? HERO_SIZES_COMPACT : HERO_SIZES_PRODUCT);
  let heroWidths = $derived(compact ? HERO_WIDTHS_COMPACT : HERO_WIDTHS_PRODUCT);
  let thumbSizes = $derived(compact ? THUMB_SIZES_COMPACT : THUMB_SIZES_PRODUCT);

  let heroSrc = $derived(getProductImagePath(productId, activeIndex));
  let heroSrcSet = $derived(buildSrcSet(productId, activeIndex, heroWidths));
  let lightboxSrc = $derived(getProductImagePath(productId, activeIndex));
  let lightboxSrcSet = $derived(buildSrcSet(productId, activeIndex, LIGHTBOX_WIDTHS));

  let heroAlt = $derived(activeIndex === 0 ? alt : `${alt} (${activeIndex + 1})`);
  let isRtl = $derived($dir === 'rtl');

  function goPrev() {
    if (activeIndex > 0) activeIndex -= 1;
  }
  function goNext() {
    if (activeIndex < count - 1) activeIndex += 1;
  }
  function closeLightbox() {
    lightboxOpen = false;
  }

  // Lock body scroll + keyboard nav while the lightbox is open.
  $effect(() => {
    if (!lightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        isRtl ? goNext() : goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        isRtl ? goPrev() : goNext();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  });
</script>

<div class="root {compact ? 'compact' : ''} {className}">
  <button
    type="button"
    class="hero heroButton"
    aria-label={$t('common:gallery.openLightbox')}
    onclick={(e) => {
      e.stopPropagation();
      lightboxOpen = true;
    }}
  >
    <img
      src={heroSrc}
      srcset={heroSrcSet}
      sizes={heroSizes}
      alt={heroAlt}
      class="heroImg"
      loading={activeIndex === 0 ? 'eager' : 'lazy'}
      decoding="async"
    />
  </button>
  <div class="thumbs">
    {#each imageIndices as i (i)}
      <button
        type="button"
        class="thumb {i === activeIndex ? 'thumbActive' : ''}"
        aria-label={`${alt}, image ${i + 1} of ${count}`}
        aria-current={i === activeIndex ? 'true' : undefined}
        onclick={(e) => {
          e.stopPropagation();
          activeIndex = i;
        }}
      >
        <img
          src={getProductImagePath(productId, i)}
          srcset={buildSrcSet(productId, i, THUMB_WIDTHS)}
          sizes={thumbSizes}
          alt=""
          class="thumbImg"
          loading="lazy"
          decoding="async"
        />
      </button>
    {/each}
  </div>
</div>

{#if lightboxOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="lightboxOverlay"
    use:portal
    onclick={closeLightbox}
    onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="presentation"
  >
    <div
      class="lightboxPanel"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-label={$t('common:gallery.openLightbox')}
    >
      <button
        type="button"
        class="lightboxClose"
        onclick={closeLightbox}
        aria-label={$t('common:gallery.close')}
      >
        <X size={20} />
      </button>

      <div class="lightboxStage">
        <img
          src={lightboxSrc}
          srcset={lightboxSrcSet}
          sizes={LIGHTBOX_SIZES}
          alt={heroAlt}
          class="lightboxImg"
          decoding="async"
        />
      </div>

      {#if activeIndex > 0}
        <button
          type="button"
          class="lightboxNav lightboxPrev"
          onclick={goPrev}
          aria-label={$t('common:gallery.previous')}
        >
          <ChevronLeft size={28} class="flipDir" />
        </button>
      {/if}

      {#if activeIndex < count - 1}
        <button
          type="button"
          class="lightboxNav lightboxNext"
          onclick={goNext}
          aria-label={$t('common:gallery.next')}
        >
          <ChevronRight size={28} class="flipDir" />
        </button>
      {/if}

      <p class="lightboxCounter" aria-live="polite">
        {$t('common:gallery.imageOf', { current: activeIndex + 1, total: count })}
      </p>
    </div>
  </div>
{/if}

<style>
  .root {
    width: 100%;
    --gallery-hero-radius: 20px;
    --gallery-hero-aspect: 1;
    --gallery-thumb-gap: 10px;
    --gallery-thumb-radius: 14px;
    --gallery-thumb-padding: 6px;
  }

  .hero {
    width: 100%;
    aspect-ratio: var(--gallery-hero-aspect);
    border-radius: var(--gallery-hero-radius);
    overflow: hidden;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
  }

  .heroButton {
    display: block;
    padding: 0;
    margin: 0;
    font: inherit;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .heroButton:hover {
    border-color: var(--color-honey);
  }

  .heroButton:focus-visible {
    outline: 2px solid var(--color-cocoa);
    outline-offset: 2px;
  }

  .heroImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }

  .thumbs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--gallery-thumb-gap);
    margin-top: var(--gallery-thumb-gap);
  }

  .thumb {
    aspect-ratio: 1;
    padding: var(--gallery-thumb-padding);
    border-radius: var(--gallery-thumb-radius);
    border: 2px solid var(--color-card-edge);
    background: var(--color-sponge);
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .thumb:hover {
    border-color: var(--color-honey);
  }

  .thumbActive {
    border-color: var(--color-cocoa) !important;
  }

  .thumbImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: calc(var(--gallery-thumb-radius) - 4px);
  }

  .compact {
    --gallery-hero-radius: 16px;
    --gallery-hero-aspect: 4 / 3;
    --gallery-thumb-gap: 6px;
    --gallery-thumb-radius: 10px;
    --gallery-thumb-padding: 4px;
  }

  .lightboxOverlay {
    position: fixed;
    inset: 0;
    background: rgba(90, 52, 22, 0.45);
    backdrop-filter: blur(6px);
    z-index: 310;
    display: grid;
    place-items: center;
    padding: 20px;
    animation: fade 0.25s ease;
  }

  .lightboxPanel {
    position: relative;
    width: 85vw;
    height: 75vh;
    max-width: 100%;
    background: var(--color-cream);
    border-radius: 24px;
    border: 2px solid var(--color-cocoa);
    box-shadow: 0 30px 70px rgba(90, 52, 22, 0.4);
    padding: 8px;
    animation: pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  .lightboxClose {
    position: absolute;
    top: 12px;
    inset-inline-end: 12px;
    z-index: 1;
    background: rgba(90, 52, 22, 0.45);
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--color-cream);
    transition: background 0.2s;
  }

  .lightboxClose:hover {
    background: rgba(90, 52, 22, 0.65);
  }

  .lightboxNav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    background: rgba(90, 52, 22, 0.45);
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--color-cream);
    transition: background 0.2s, transform 0.15s;
  }

  .lightboxPrev {
    inset-inline-start: 12px;
  }

  .lightboxNext {
    inset-inline-end: 12px;
  }

  .lightboxNav:hover {
    background: rgba(90, 52, 22, 0.65);
  }

  .lightboxNav:active {
    transform: translateY(-50%) scale(0.95);
  }

  .lightboxStage {
    width: 100%;
    height: 100%;
  }

  .lightboxImg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 16px;
  }

  .lightboxCounter {
    position: absolute;
    inset-inline-start: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    z-index: 1;
    margin: 0;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(90, 52, 22, 0.45);
    font-size: 13px;
    font-weight: 700;
    color: var(--color-cream);
  }
</style>
