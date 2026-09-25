<script lang="ts">
  let { checked = $bindable(false), label }: { checked?: boolean; label: string } =
    $props()
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onclick={() => (checked = !checked)}
  class="switch"
>
  <span class="switch-thumb"></span>
</button>
