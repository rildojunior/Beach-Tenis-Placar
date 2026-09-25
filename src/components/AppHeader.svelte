<script lang="ts">
  import { ui } from '../stores/ui.svelte'
</script>

<header class="app-header">
  <button onclick={() => ui.open('history')} class="icon-button" aria-label="Histórico">
    <span class="material-symbols-outlined text-[1.375rem]!">history</span>
  </button>

  <div class="text-center">
    <h1 class="text-[1.0625rem] leading-tight font-semibold">Beach Tennis</h1>
    <p class="text-xs text-label-2">Placar</p>
  </div>

  <button
    onclick={() => ui.open('settings')}
    class="icon-button"
    aria-label="Configurações"
  >
    <span class="material-symbols-outlined text-[1.375rem]!">settings</span>
  </button>
</header>
