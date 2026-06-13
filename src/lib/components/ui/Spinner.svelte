<script lang="ts">
  interface Props {
    color?: string;
  }

  let { color = 'currentColor' }: Props = $props();
</script>

<span
  class="spinner"
  style="border-color: {color}40; border-top-color: {color};"
></span>

<style>
  .spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
    border-style: solid;
    border-width: 2.5px;
  }
</style>
