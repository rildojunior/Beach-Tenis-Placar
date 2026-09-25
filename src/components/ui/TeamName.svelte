<!--
  Nome do time que cabe em espaços pequenos sem esconder ninguém:
  duplas aparecem com um jogador por linha; outros nomes quebram em até
  duas linhas. O que ainda não couber termina em "…".
-->
<script lang="ts">
  import { splitTeamName } from '../../lib/team-name'

  let { name, class: className = '' }: { name: string; class?: string } = $props()

  const players = $derived(splitTeamName(name))
</script>

<span class={['team-name', className]} title={name}>
  {#if players.length === 2}
    <span class="truncate">{players[0]}</span>
    <span class="truncate">{players[1]}</span>
  {:else}
    <span class="line-clamp-2 break-words">{name}</span>
  {/if}
</span>
