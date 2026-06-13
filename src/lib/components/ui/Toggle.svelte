<script lang="ts">
  interface Props {
    label: string;
    initial?: boolean;
    onToggle?: () => void;
  }

  let { label, initial = false, onToggle }: Props = $props();

  // svelte-ignore state_referenced_locally
  let on = $state(initial);

  function toggle() {
    on = !on;
    onToggle?.();
  }
</script>

<div class="row">
  <span class="label">{label}</span>
  <button
    type="button"
    class="track {on ? 'trackOn' : 'trackOff'}"
    onclick={toggle}
    aria-pressed={on}
    aria-label={label}
  >
    <span class="thumb {on ? 'thumbOn' : 'thumbOff'}"></span>
  </button>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 0;
    border-bottom: 1px solid rgba(232, 198, 138, 0.53);
  }

  .label {
    font-weight: 600;
    color: var(--color-cocoa);
    font-size: 15.5px;
  }

  .track {
    width: 50px;
    height: 28px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
  }

  .trackOn {
    background: var(--color-cocoa);
  }

  .trackOff {
    background: var(--color-card-edge);
  }

  .thumb {
    position: absolute;
    top: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-sponge);
    transition: inset-inline-start 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
  }

  .thumbOn {
    inset-inline-start: 25px;
  }

  .thumbOff {
    inset-inline-start: 3px;
  }
</style>
