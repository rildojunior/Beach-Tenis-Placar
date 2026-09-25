<!--
  Número que rola ao mudar, apontando para onde o placar foi:
  sobe quando aumenta e desce quando diminui.
-->
<script lang="ts">
  import { untrack } from 'svelte'
  import { roll } from '../../lib/transitions'

  interface Props {
    value: string | number
    /** Direção fixa. Sem ela, compara com o valor anterior. */
    direction?: 1 | -1
  }

  let { value, direction }: Props = $props()

  let previous = untrack(() => value)
  let current: 1 | -1 = $state(1)

  $effect.pre(() => {
    const next = value
    current = direction ?? (Number(next) >= Number(previous) ? 1 : -1)
    previous = next
  })
</script>

<span class="rolling">
  {#key value}
    <span
      in:roll={{ direction: current }}
      out:roll={{ direction: current, leaving: true }}
    >
      {value}
    </span>
  {/key}
</span>
