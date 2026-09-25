<!-- Botões − e + para ajustar um número sem abrir o teclado. -->
<script lang="ts">
  interface Props {
    value: number
    min?: number
    max?: number
    label: string
  }

  let { value = $bindable(), min = 1, max = 99, label }: Props = $props()
</script>

<div class="stepper" role="group" aria-label={label}>
  <button
    type="button"
    aria-label="Diminuir"
    disabled={value <= min}
    onclick={() => (value = Math.max(min, value - 1))}
  >
    <span class="material-symbols-outlined text-[1.25rem]!">remove</span>
  </button>
  <span class="stepper-divider" aria-hidden="true"></span>
  <button
    type="button"
    aria-label="Aumentar"
    disabled={value >= max}
    onclick={() => (value = Math.min(max, value + 1))}
  >
    <span class="material-symbols-outlined text-[1.25rem]!">add</span>
  </button>
</div>
