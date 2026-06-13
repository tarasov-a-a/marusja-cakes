<script lang="ts">
  interface Props {
    grad: [string, string];
    slice?: boolean;
    size?: string | number;
    class?: string;
  }

  let { grad, slice = false, size = '100%', class: className = '' }: Props = $props();

  let id = $derived('g' + grad.join('').replace(/#/g, ''));
</script>

<svg
  viewBox="0 0 200 200"
  width={size}
  height={size}
  class={className}
  style="display: block"
>
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color={grad[0]} />
      <stop offset="100%" stop-color={grad[1]} />
    </linearGradient>
    <linearGradient id={id + 'p'} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity=".95" />
      <stop offset="100%" stop-color="#fff" stop-opacity=".7" />
    </linearGradient>
  </defs>
  <ellipse
    cx="100"
    cy="158"
    rx="78"
    ry="14"
    fill="var(--color-sponge)"
    stroke="var(--color-cocoa)"
    stroke-width="3.5"
  />
  {#if slice}
    <g>
      <path
        d="M50 60 L150 60 L100 150 Z"
        fill="url(#{id})"
        stroke="var(--color-cocoa)"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <path d="M58 78 L142 78" stroke="var(--color-cocoa)" stroke-width="2.5" opacity=".55" />
      <path d="M66 96 L134 96" stroke="var(--color-cocoa)" stroke-width="2.5" opacity=".55" />
      <path d="M74 114 L126 114" stroke="var(--color-cocoa)" stroke-width="2.5" opacity=".55" />
      <path
        d="M50 60 Q100 44 150 60"
        fill="url(#{id}p)"
        stroke="var(--color-cocoa)"
        stroke-width="4"
      />
    </g>
  {:else}
    <g>
      <path
        d="M52 120 Q100 132 148 120 L148 150 Q100 162 52 150 Z"
        fill="url(#{id})"
        stroke="var(--color-cocoa)"
        stroke-width="4"
      />
      <path
        d="M60 92 Q100 104 140 92 L140 122 Q100 134 60 122 Z"
        fill="url(#{id})"
        stroke="var(--color-cocoa)"
        stroke-width="4"
      />
      <path
        d="M60 92 Q100 78 140 92 Q140 100 132 102 Q128 110 120 104 Q112 112 104 104 Q96 112 88 104 Q80 112 72 104 Q64 110 60 102 Z"
        fill="url(#{id}p)"
        stroke="var(--color-cocoa)"
        stroke-width="3.5"
        stroke-linejoin="round"
      />
      <circle cx="100" cy="74" r="8" fill="var(--color-rose)" stroke="var(--color-cocoa)" stroke-width="3" />
      <path
        d="M100 66 Q104 56 110 58"
        fill="none"
        stroke="var(--color-cocoa)"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
  {/if}
</svg>
