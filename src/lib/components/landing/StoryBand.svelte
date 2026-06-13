<script lang="ts">
  import { ArrowRight } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import CakeArt from '$lib/components/ui/CakeArt.svelte';
  import { t } from '$lib/i18n';
</script>

<section class="wrap">
  <div class="band heroGrid">
    <div class="deco" aria-hidden="true">
      <CakeArt grad={['#fff', '#fde']} />
    </div>
    <div class="content">
      <h2 class="title">{$t('landing:storyTitle')}</h2>
      <p class="text">{$t('landing:storyText')}</p>
      <a href="/">
        <Button variant="soft" style="background: #fff">
          {$t('landing:customOrder')} <ArrowRight size={17} />
        </Button>
      </a>
    </div>
  </div>
</section>

<style>
  .wrap {
    max-width: 1180px;
    margin: 70px auto 0;
    padding: 0 24px;
  }

  .band {
    background: linear-gradient(135deg, var(--color-blush), var(--color-rose));
    border-radius: 32px;
    padding: 48px 44px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 30px;
    align-items: center;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .deco {
    position: absolute;
    inset-inline-end: -30px;
    bottom: -40px;
    opacity: 0.25;
    width: 220px;
  }

  .content {
    position: relative;
  }

  .title {
    font-family: var(--font-serif);
    font-size: 36px;
    font-weight: 900;
    margin: 0 0 12px;
    line-height: 1.05;
  }

  .text {
    font-size: 17px;
    line-height: 1.5;
    opacity: 0.95;
    max-width: 460px;
    margin-bottom: 24px;
  }
</style>
