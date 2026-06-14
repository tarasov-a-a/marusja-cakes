<script lang="ts">
  import { ArrowRight, Sparkles } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { t } from '$lib/i18n';
  import { currency, fmt, priceIn } from '$lib/currency';
  import { getProductById, headlinePrice } from '$lib/data/products';
  import {
    getLandingHeroSrc,
    getLandingHeroSrcSet,
    LANDING_HERO_SIZES,
  } from '$lib/productImages';

  // The hero "from" tag mirrors the bestseller's headline price.
  const heroPrice = headlinePrice(getProductById('pancho-pineapple')!);

  let stats = $derived([
    ['12k+', $t('landing:stats.cakes')],
    ['4.9★', $t('landing:stats.rating')],
    [$t('landing:stats.dailyValue'), $t('landing:stats.daily')],
  ] as const);

  function scrollToMenu() {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<section class="section heroGrid">
  <div class="left">
    <div class="badge">
      <Sparkles size={15} color="var(--color-rose)" />
      {$t('landing:badge')}
    </div>
    <h1 class="title">
      {$t('landing:heroTitle')}
      <br />
      <span class="accent">{$t('landing:heroTitleAccent')}</span>
    </h1>
    <p class="subtitle">{$t('landing:heroSubtitle')}</p>
    <div class="actions">
      <Button variant="primary" onclick={scrollToMenu}>
        {$t('landing:browseCakes')} <ArrowRight size={18} />
      </Button>
      <a href="/product/pancho-pineapple">
        <Button variant="soft">{$t('landing:bestseller')}</Button>
      </a>
    </div>
    <div class="stats">
      {#each stats as [n, l] (l)}
        <div>
          <div class="statNum">{n}</div>
          <div class="statLabel">{l}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="right">
    <div class="glow" aria-hidden="true"></div>
    <div class="blob">
      <div class="blobClip" aria-hidden="true">
        <img
          src={getLandingHeroSrc()}
          srcset={getLandingHeroSrcSet()}
          sizes={LANDING_HERO_SIZES}
          width={524}
          height={524}
          alt=""
          class="heroImg"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div class="priceTag">
        <small>{$t('common:from')}</small>{$fmt(priceIn(heroPrice, $currency))}
      </div>
    </div>
  </div>
</section>

<style>
  .section {
    max-width: 1180px;
    margin: 0 auto;
    padding: 30px 24px 10px;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 30px;
    align-items: center;
  }

  .left {
    animation: rise 0.7s ease both;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    padding: 8px 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
    color: var(--color-coffee);
    margin-bottom: 22px;
  }

  .title {
    font-family: var(--font-serif);
    font-size: clamp(40px, 6vw, 70px);
    line-height: 0.98;
    font-weight: 900;
    color: var(--color-cocoa);
    letter-spacing: -0.025em;
    margin: 0 0 20px;
  }

  .accent {
    color: var(--color-rose);
    font-style: italic;
  }

  .subtitle {
    font-size: 18px;
    line-height: 1.55;
    color: var(--color-coffee);
    max-width: 460px;
    margin-bottom: 30px;
  }

  .actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .stats {
    display: flex;
    gap: 28px;
    margin-top: 38px;
  }

  .statNum {
    font-family: var(--font-serif);
    font-weight: 900;
    font-size: 27px;
    color: var(--color-cocoa);
    line-height: 30px;
  }

  .statLabel {
    font-size: 12.5px;
    color: var(--color-coffee);
    font-weight: 600;
    opacity: 0.8;
  }

  .right {
    position: relative;
    animation: rise 0.7s ease both;
    animation-delay: 0.12s;
  }

  .glow {
    position: absolute;
    inset: 8% 6%;
    background: radial-gradient(circle, var(--color-honey), transparent 70%);
    filter: blur(20px);
    opacity: 0.6;
  }

  .blob {
    position: relative;
    border: 3px solid var(--color-cocoa);
    border-radius: 42% 58% 55% 45% / 50% 48% 52% 50%;
    box-shadow: 0 26px 50px rgba(90, 52, 22, 0.22);
    overflow: visible;
  }

  .blobClip {
    overflow: hidden;
    border-radius: inherit;
    aspect-ratio: 1;
    line-height: 0;
  }

  .heroImg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .priceTag {
    position: absolute;
    top: -6px;
    inset-inline-end: 22px;
    background: var(--color-rose);
    color: #fff;
    padding: 12px 16px;
    border-radius: 18px;
    font-weight: 800;
    font-size: 14px;
    transform: rotate(7deg);
    box-shadow: 0 8px 18px rgba(215, 122, 102, 0.4);
  }

  .priceTag small {
    font-size: 11px;
    display: block;
    opacity: 0.85;
  }

  @media (max-width: 880px) {
    .section {
      padding-block-start: 10px;
    }
  }
</style>
