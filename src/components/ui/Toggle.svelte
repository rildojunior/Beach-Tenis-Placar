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
  class={[
    'relative h-6 w-12 shrink-0 rounded-full transition-colors',
    checked ? 'bg-primary' : 'bg-white/10'
  ]}
>
  <span
    class="absolute top-1 left-1 size-4 rounded-full bg-white transition-transform"
    class:translate-x-6={checked}
  ></span>
</button>
