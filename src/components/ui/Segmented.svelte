<!-- Controle segmentado do iOS: opções lado a lado, com um destaque que desliza. -->
<script lang="ts" generics="T extends string">
  interface Props {
    options: { value: T; label: string }[]
    value: T
    label: string
  }

  let { options, value = $bindable(), label }: Props = $props()

  const index = $derived(
    Math.max(
      0,
      options.findIndex(option => option.value === value)
    )
  )
</script>

<div
  class="segmented"
  role="radiogroup"
  aria-label={label}
  style:--count={options.length}
>
  <span class="segmented-thumb" style:translate="{index * 100}% 0" aria-hidden="true"
  ></span>
  {#each options as option (option.value)}
    <button
      type="button"
      role="radio"
      aria-checked={option.value === value}
      class="segmented-option"
      onclick={() => (value = option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
