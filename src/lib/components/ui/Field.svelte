<script lang="ts">
  interface Props {
    label: string;
    value?: string;
  }

  let { label, value = '' }: Props = $props();
</script>

<label class="label">
  <span class="labelText">{label}</span>
  <input class="input" {value} />
</label>

<style>
  .label {
    display: block;
  }

  .labelText {
    display: block;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--color-rose);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  .input {
    width: 100%;
    box-sizing: border-box;
    background: var(--color-cream);
    border: 2px solid var(--color-card-edge);
    border-radius: 12px;
    padding: 11px 14px;
    font-family: inherit;
    font-size: 15px;
    color: var(--color-cocoa);
    font-weight: 600;
    outline: none;
  }

  .input:focus {
    border-color: var(--color-cocoa);
  }
</style>
