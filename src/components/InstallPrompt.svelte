<!-- Convite para instalar o app na tela inicial (Android e iPhone). -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { isIOS, isStandalone } from '../lib/device'
  import { STORAGE_KEYS } from '../lib/storage'
  import { rise } from '../lib/transitions'

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
  <div class="install-prompt material-regular" transition:rise>
    <img src="/icon-192.png" alt="" class="size-11 shrink-0 rounded-[0.625rem]" />

    <div class="min-w-0 flex-1">
      <p class="text-[0.9375rem] font-semibold">Instalar o placar</p>
      <p class="text-[0.8125rem] leading-snug text-label-2">
        {iosHint
          ? 'Toque em Compartilhar e depois em Adicionar à Tela de Início.'
          : 'Abra direto da tela inicial, mesmo sem internet.'}
      </p>
    </div>

    {#if !iosHint}
      <button
        onclick={install}
        class="h-8 rounded-full bg-primary px-4 text-[0.9375rem] font-semibold text-black"
      >
        Instalar
      </button>
    {/if}
    <button
      onclick={dismiss}
      class="sheet-close shrink-0"
      aria-label="Não mostrar novamente"
    >
      <span class="material-symbols-outlined text-[1.125rem]!">close</span>
    </button>
  </div>
{/if}
