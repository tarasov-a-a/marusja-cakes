<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    Bell,
    Camera,
    Check,
    CreditCard,
    LogOut,
    Package,
    Plus,
    Shield,
    Trash2,
    User,
  } from 'lucide-svelte';
  import OrderLine from '$lib/components/settings/OrderLine.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Field from '$lib/components/ui/Field.svelte';
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
  import Toggle from '$lib/components/ui/Toggle.svelte';
  import { getOrdersForUser, sortOrders } from '$lib/data/orders';
  import { formatPrice } from '$lib/currency';
  import { locale, t } from '$lib/i18n';
  import { flash, setAuthOpen, setUser, user } from '$lib/stores/shop';
  import type { Order, OrderItem, OrderStatus, SettingsTab } from '$lib/types';

  let tab = $state<SettingsTab>('profile');

  // Prompt sign-in when arriving without a session.
  $effect(() => {
    if (!$user) setAuthOpen(true);
  });

  function orderSubtotal(items: OrderItem[]) {
    return items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }
  function orderTotal(order: Order) {
    return orderSubtotal(order.items) + order.delivery;
  }

  let tabs = $derived([
    { id: 'profile' as const, label: $t('settings:tabs.profile'), Icon: User },
    { id: 'orders' as const, label: $t('settings:tabs.orders'), Icon: Package },
    { id: 'notifications' as const, label: $t('settings:tabs.notifications'), Icon: Bell },
    { id: 'payment' as const, label: $t('settings:tabs.payment'), Icon: CreditCard },
    { id: 'security' as const, label: $t('settings:tabs.security'), Icon: Shield },
  ]);

  let sortedOrders = $derived($user ? sortOrders(getOrdersForUser($user.id)) : []);

  const statusClass: Record<OrderStatus, string> = {
    delivered: 'statusDelivered',
    processing: 'statusProcessing',
    cancelled: 'statusCancelled',
  };

  let formatDate = $derived((iso: string) =>
    new Intl.DateTimeFormat($locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
      new Date(iso),
    ),
  );

  const paymentCards = [
    ['Visa', '•••• 4291', '12/27', 'var(--color-rose)'],
    ['Mastercard', '•••• 8810', '08/26', 'var(--color-caramel)'],
  ] as const;
</script>

<svelte:head>
  <title>{$t('settings:title')} · {$t('common:brand')}</title>
</svelte:head>

{#if !$user}
  <div class="guest">
    <User size={56} color="var(--color-caramel)" style="margin-bottom: 16px" />
    <h1 class="guestTitle">{$t('settings:signInTitle')}</h1>
    <p class="guestText">{$t('settings:signInText')}</p>
  </div>
{:else}
  <div class="page">
    <h1 class="title">{$t('settings:title')}</h1>
    <div class="grid heroGrid">
      <div class="sidebar">
        {#each tabs as { id, label, Icon } (id)}
          <button
            type="button"
            class="tabBtn {tab === id ? 'tabActive' : ''}"
            onclick={() => (tab = id)}
          >
            <Icon size={18} /> {label}
          </button>
        {/each}
        <button
          type="button"
          class="signOut"
          onclick={() => {
            setUser(null);
            goto('/');
            flash($t('settings:signedOut'));
          }}
        >
          <LogOut size={18} /> {$t('settings:signOut')}
        </button>
      </div>

      <div class="panel">
        {#if tab === 'profile'}
          <div>
            <SectionTitle>{$t('settings:profile.title')}</SectionTitle>
            <div class="profileHead">
              <div class="avatarWrap">
                <img src={$user.avatar} alt="" class="avatar" />
                <button type="button" class="cameraBtn" aria-label={$t('common:a11y.changePhoto')}>
                  <Camera size={14} color="#fff" />
                </button>
              </div>
              <div>
                <div class="profileName">{$user.name}</div>
                <div class="profileVia">
                  {$t('settings:profile.via', { provider: $user.provider })}
                  <Check size={14} color="#5B8F4F" />
                </div>
              </div>
            </div>
            <div class="fields">
              <Field label={$t('settings:profile.fullName')} value={$user.name} />
              <Field label={$t('settings:profile.email')} value={$user.email} />
              <Field label={$t('settings:profile.phone')} value={$t('settings:profile.phoneValue')} />
              <Field
                label={$t('settings:profile.birthday')}
                value={$t('settings:profile.birthdayValue')}
              />
              <div class="fullWidth">
                <Field
                  label={$t('settings:profile.address')}
                  value={$t('settings:profile.addressValue')}
                />
              </div>
            </div>
            <div style="margin-top: 24px">
              <Button variant="primary" onclick={() => flash($t('settings:profile.saved'))}>
                {$t('settings:profile.save')}
              </Button>
            </div>
          </div>
        {/if}

        {#if tab === 'orders'}
          <div>
            {#if sortedOrders.length === 0}
              <p class="ordersEmpty">{$t('settings:orders.empty')}</p>
            {:else}
              {#each sortedOrders as order (order.id)}
                <div class="orderCard">
                  <div class="orderHead">
                    <div>
                      <div class="orderId">{$t('settings:orders.orderId', { id: order.id })}</div>
                      <div class="orderDate">
                        {$t('settings:orders.placedOn', { date: formatDate(order.date) })}
                      </div>
                      <div class="orderItemCount">
                        {$t('settings:orders.items', { count: order.items.length })}
                      </div>
                    </div>
                    <span class="statusBadge {statusClass[order.status]}">
                      {$t(`settings:orders.status.${order.status}`)}
                    </span>
                  </div>
                  <div class="orderItems">
                    {#each order.items as item (`${order.id}-${item.productId}-${item.size}`)}
                      <OrderLine {item} />
                    {/each}
                  </div>
                  <div class="orderFooter">
                    <div class="orderRow">
                      <span>{$t('settings:orders.delivery')}</span>
                      <span>
                        {order.delivery === 0
                          ? $t('settings:orders.free')
                          : formatPrice(order.delivery, 2)}
                      </span>
                    </div>
                    <div class="orderTotal">
                      <span>{$t('settings:orders.total')}</span>
                      <span>{formatPrice(orderTotal(order), 2)}</span>
                    </div>
                  </div>
                  <div style="margin-top: 14px">
                    <Button variant="soft" onclick={() => flash($t('settings:orders.reorderMock'))}>
                      {$t('settings:orders.reorder')}
                    </Button>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}

        {#if tab === 'notifications'}
          <div>
            <SectionTitle>{$t('settings:notifications.title')}</SectionTitle>
            <Toggle
              label={$t('settings:notifications.seasonal')}
              initial
              onToggle={() => flash($t('settings:notifications.updated'))}
            />
            <Toggle
              label={$t('settings:notifications.orders')}
              initial
              onToggle={() => flash($t('settings:notifications.updated'))}
            />
            <Toggle
              label={$t('settings:notifications.birthday')}
              initial
              onToggle={() => flash($t('settings:notifications.updated'))}
            />
            <Toggle
              label={$t('settings:notifications.newsletter')}
              onToggle={() => flash($t('settings:notifications.updated'))}
            />
            <Toggle
              label={$t('settings:notifications.sms')}
              initial
              onToggle={() => flash($t('settings:notifications.updated'))}
            />
          </div>
        {/if}

        {#if tab === 'payment'}
          <div>
            <SectionTitle>{$t('settings:payment.title')}</SectionTitle>
            {#each paymentCards as [brand, num, exp, col] (num)}
              <div class="card">
                <div class="cardBrand" style="background: {col}">
                  {brand.slice(0, 4).toUpperCase()}
                </div>
                <div class="cardBody">
                  <div class="cardTitle">{brand} {num}</div>
                  <div class="cardSub">{$t('settings:payment.expires', { exp })}</div>
                </div>
                <button type="button" class="removeCard">
                  <Trash2 size={17} />
                </button>
              </div>
            {/each}
            <Button variant="soft" onclick={() => flash($t('settings:payment.addMock'))}>
              <Plus size={17} /> {$t('settings:payment.add')}
            </Button>
          </div>
        {/if}

        {#if tab === 'security'}
          <div>
            <SectionTitle>{$t('settings:security.title')}</SectionTitle>
            <div class="oauthBox">
              <Shield size={22} color="#5B8F4F" />
              <div>
                <div class="oauthTitle">
                  {$t('settings:security.connected', { provider: $user.provider })}
                </div>
                <div class="oauthSub">{$t('settings:security.oauth')}</div>
              </div>
            </div>
            <Toggle
              label={$t('settings:security.twoFactor')}
              initial
              onToggle={() => flash($t('settings:security.twoFactorUpdated'))}
            />
            <Toggle
              label={$t('settings:security.loginAlerts')}
              initial
              onToggle={() => flash($t('settings:security.alertsUpdated'))}
            />
            <Toggle
              label={$t('settings:security.trustedDevices')}
              onToggle={() => flash($t('settings:security.updated'))}
            />
            <div style="margin-top: 18px">
              <Button variant="soft" onclick={() => flash($t('settings:security.sessionsReviewed'))}>
                {$t('settings:security.reviewSessions')}
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px 24px 0;
  }

  .title {
    font-family: var(--font-serif);
    font-size: 40px;
    font-weight: 900;
    color: var(--color-cocoa);
    margin-bottom: 24px;
  }

  .grid {
    display: grid;
    grid-template-columns: 230px 1fr;
    gap: 26px;
    align-items: start;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tabBtn {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 16px;
    border-radius: 14px;
    border: none;
    background: var(--color-sponge);
    color: var(--color-cocoa);
    font-family: inherit;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    text-align: start;
    box-shadow: inset 0 0 0 2px var(--color-card-edge);
    transition: all 0.2s;
  }

  .tabActive {
    background: var(--color-cocoa);
    color: var(--color-sponge);
    box-shadow: none;
  }

  .signOut {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 16px;
    border-radius: 14px;
    border: none;
    background: transparent;
    color: var(--color-rose);
    font-family: inherit;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    margin-top: 8px;
  }

  .panel {
    background: var(--color-sponge);
    border: 2px solid var(--color-card-edge);
    border-radius: 26px;
    padding: 30px 32px;
    min-height: 380px;
  }

  .profileHead {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 28px;
  }

  .avatarWrap {
    position: relative;
  }

  .avatar {
    width: 86px;
    height: 86px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-cocoa);
  }

  .cameraBtn {
    position: absolute;
    bottom: -2px;
    inset-inline-end: -2px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--color-rose);
    border: 2.5px solid var(--color-sponge);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .profileName {
    font-family: var(--font-serif);
    font-weight: 800;
    font-size: 22px;
    color: var(--color-cocoa);
  }

  .profileVia {
    color: var(--color-coffee);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .fullWidth {
    grid-column: 1 / -1;
  }

  .card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 18px;
    border: 2px solid var(--color-card-edge);
    border-radius: 16px;
    margin-bottom: 12px;
  }

  .cardBrand {
    width: 50px;
    height: 34px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    color: #fff;
    font-weight: 800;
    font-size: 11px;
  }

  .cardBody {
    flex: 1;
  }

  .cardTitle {
    font-weight: 800;
    color: var(--color-cocoa);
  }

  .cardSub {
    font-size: 13px;
    color: var(--color-coffee);
    opacity: 0.8;
  }

  .removeCard {
    background: none;
    border: none;
    color: var(--color-rose);
    cursor: pointer;
  }

  .oauthBox {
    background: var(--color-cream);
    border: 2px solid var(--color-card-edge);
    border-radius: 16px;
    padding: 16px 18px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .oauthTitle {
    font-weight: 800;
    color: var(--color-cocoa);
  }

  .oauthSub {
    font-size: 13px;
    color: var(--color-coffee);
  }

  .guest {
    max-width: 600px;
    margin: 0 auto;
    padding: 80px 24px;
    text-align: center;
  }

  .guestTitle {
    font-family: var(--font-serif);
    font-size: 30px;
    font-weight: 900;
    color: var(--color-cocoa);
  }

  .guestText {
    color: var(--color-coffee);
    margin-top: 8px;
  }

  .ordersEmpty {
    color: var(--color-coffee);
    font-size: 15px;
  }

  .orderCard {
    border: 2px solid var(--color-card-edge);
    border-radius: 18px;
    padding: 18px 20px;
    margin-bottom: 16px;
  }

  .orderHead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .orderId {
    font-family: var(--font-serif);
    font-weight: 800;
    font-size: 18px;
    color: var(--color-cocoa);
  }

  .orderDate,
  .orderItemCount {
    font-size: 13px;
    color: var(--color-coffee);
    opacity: 0.85;
    margin-top: 2px;
  }

  .statusBadge {
    flex-shrink: 0;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .statusDelivered {
    background: rgba(91, 143, 79, 0.15);
    color: #5b8f4f;
  }

  .statusProcessing {
    background: rgba(240, 192, 128, 0.35);
    color: var(--color-cocoa);
  }

  .statusCancelled {
    background: rgba(200, 80, 80, 0.12);
    color: var(--color-rose);
  }

  .orderItems {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .orderFooter {
    border-top: 1px solid rgba(232, 198, 138, 0.45);
    padding-top: 12px;
  }

  .orderRow {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--color-coffee);
    margin-bottom: 6px;
  }

  .orderTotal {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    font-size: 16px;
    color: var(--color-cocoa);
    margin-top: 4px;
  }
</style>
