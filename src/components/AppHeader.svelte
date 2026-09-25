<script lang="ts">
  import { ui } from '../stores/ui.svelte'
</script>

<header class="app-header">
  <div class="flex justify-start">
    <button onclick={() => ui.open('history')} class="icon-button" aria-label="Histórico">
      <span class="material-symbols-outlined text-xl">history</span>
    </button>
  </div>

  <div class="col-span-2 text-center">
    <h1 class="font-black tracking-tight uppercase">Beach Tennis</h1>
    <span class="text-xs tracking-widest text-primary">PLACAR</span>
  </div>

  <div class="flex justify-end">
    <button
      onclick={() => ui.open('settings')}
      class="icon-button"
      aria-label="Configurações"
    >
      <span class="material-symbols-outlined text-xl">settings</span>
    </button>
  </div>
</header>
