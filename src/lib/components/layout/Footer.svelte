<script lang="ts">
  import { ArrowRight, Facebook, Instagram, Mail, Twitter } from 'lucide-svelte';
  import { t } from '$lib/i18n';
  import { LOGO } from '$lib/logo';

  const socials = [
    { Icon: Instagram, key: 'instagram' },
    { Icon: Facebook, key: 'facebook' },
    { Icon: Twitter, key: 'twitter' },
    { Icon: Mail, key: 'email' },
  ];

  let columns = $derived([
    {
      title: $t('footer:sweets'),
      links: [
        $t('footer:links.signature'),
        $t('footer:links.chocolate'),
        $t('footer:links.seasonal'),
        $t('footer:links.gifts'),
      ],
    },
    {
      title: $t('footer:company'),
      links: [
        $t('footer:links.story'),
        $t('footer:links.bakers'),
        $t('footer:links.sustainability'),
        $t('footer:links.careers'),
      ],
    },
  ]);
</script>

<footer class="footer">
  <div class="scallop" aria-hidden="true"></div>
  <div class="inner footerGrid">
    <div>
      <div class="brandRow">
        <div class="logo">
          <img src={LOGO} alt="" />
        </div>
        <div class="brandName">{$t('common:brand')}</div>
      </div>
      <p class="about">{$t('footer:about')}</p>
      <div class="socials">
        {#each socials as { Icon, key } (key)}
          <a
            href="/"
            class="social"
            aria-label={$t(`common:a11y.social.${key}`)}
            onclick={(e) => e.preventDefault()}
          >
            <Icon size={19} />
          </a>
        {/each}
      </div>
    </div>
    {#each columns as col (col.title)}
      <div>
        <h4 class="colTitle">{col.title}</h4>
        {#each col.links as l (l)}
          <a href="/" class="colLink">{l}</a>
        {/each}
      </div>
    {/each}
    <div>
      <h4 class="colTitle">{$t('footer:newsletterTitle')}</h4>
      <p class="newsletterText">{$t('footer:newsletterText')}</p>
      <div class="newsletterRow">
        <input
          class="emailInput"
          type="email"
          placeholder={$t('footer:emailPlaceholder')}
          aria-label={$t('common:a11y.emailLabel')}
        />
        <button type="button" class="submitBtn" aria-label={$t('common:a11y.subscribe')}>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  </div>
  <div class="copy">{$t('footer:copyright')}</div>
</footer>

<style>
  .footer {
    background: var(--color-cocoa);
    color: var(--color-sponge);
    margin-top: 80px;
    position: relative;
  }

  .scallop {
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 22px;
    background: radial-gradient(circle at 11px -2px, transparent 12px, var(--color-cocoa) 13px);
    background-size: 24px 24px;
    transform: translateY(-20px);
  }

  .inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 56px 24px 30px;
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
    gap: 40px;
  }

  .brandRow {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 16px;
  }

  .logo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    border: 2.5px solid var(--color-honey);
  }

  .logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .brandName {
    font-family: var(--font-serif);
    font-weight: 900;
    font-size: 24px;
    color: var(--color-cream);
  }

  .about {
    color: var(--color-honey);
    line-height: 1.6;
    font-size: 14.5px;
    max-width: 280px;
    opacity: 0.9;
  }

  .socials {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .social {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(240, 192, 128, 0.14);
    display: grid;
    place-items: center;
    color: var(--color-honey);
    transition: all 0.2s;
    text-decoration: none;
  }

  .social:hover {
    background: var(--color-honey);
    color: var(--color-cocoa);
  }

  .colTitle {
    font-family: var(--font-serif);
    font-size: 17px;
    color: var(--color-cream);
    margin: 0 0 16px;
    font-weight: 700;
  }

  .colLink {
    display: block;
    background: none;
    border: none;
    color: var(--color-honey);
    opacity: 0.82;
    font-family: inherit;
    font-size: 14.5px;
    padding: 6px 0;
    cursor: pointer;
    text-align: start;
    text-decoration: none;
  }

  .newsletterText {
    color: var(--color-honey);
    opacity: 0.85;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .newsletterRow {
    display: flex;
    gap: 8px;
  }

  .emailInput {
    flex: 1;
    background: rgba(251, 239, 211, 0.1);
    border: 1.5px solid rgba(240, 192, 128, 0.3);
    border-radius: 999px;
    padding: 11px 16px;
    color: var(--color-cream);
    font-family: inherit;
    font-size: 14px;
    outline: none;
  }

  .submitBtn {
    background: var(--color-honey);
    border: none;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--color-cocoa);
  }

  .copy {
    border-top: 1px solid rgba(240, 192, 128, 0.18);
    padding: 20px 24px;
    text-align: center;
    color: var(--color-honey);
    opacity: 0.7;
    font-size: 13px;
  }
</style>
