<!-- Convite para instalar o app na tela inicial (Android e iPhone). -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { isIOS, isStandalone } from '../lib/device'
  import { STORAGE_KEYS } from '../lib/storage'

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }

  let deferred: BeforeInstallPromptEvent | null = $state(null)
  let iosHint = $state(false)
  let visible = $state(false)

  const dismissed = () => localStorage.getItem(STORAGE_KEYS.installDismissed) !== null

  onMount(() => {
    if (isStandalone() || dismissed()) return

    if (isIOS()) {
      iosHint = true
      visible = true
      return
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      deferred = event as BeforeInstallPromptEvent
      visible = true
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  })

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    visible = false
    if (outcome === 'dismissed') dismiss()
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEYS.installDismissed, '1')
    deferred = null
    visible = false
  }
</script>

{#if visible}
  <div class="install-prompt" transition:fly={{ y: 30, duration: 300 }}>
    <span class="material-symbols-outlined text-3xl text-primary">download</span>

    <div class="flex-1">
      <p class="text-sm font-bold">Instalar App</p>
      <p class="text-xs opacity-70">
        {iosHint
          ? 'No iPhone: compartilhar → Adicionar à Tela de Início'
          : 'Adicione o placar à tela inicial'}
      </p>
    </div>

    <div class="flex flex-col items-end gap-2">
      {#if !iosHint}
        <button onclick={install} class="install-primary-btn">Instalar</button>
      {/if}
      <button onclick={dismiss} class="install-dismiss-btn">Não mostrar novamente</button>
    </div>
  </div>
{/if}
