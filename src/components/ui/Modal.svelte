<!--
  Modal genérico. Fica aberto enquanto `id` estiver na pilha de `ui`.
  Toque fora do cartão ou Esc chamam `onclose`.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { ui, type ModalId } from '../../stores/ui.svelte'

  interface Props {
    id: ModalId
    title?: string
    /** Texto acessível do botão de fechar. Sem ele, o botão não aparece. */
    closeLabel?: string
    onclose?: () => void
    class?: string
    header?: Snippet
    children: Snippet
  }

  let {
    id,
    title,
    closeLabel,
    onclose = () => ui.close(id),
    class: className = '',
    header,
    children
  }: Props = $props()

  const open = $derived(ui.isOpen(id))

  function onkeydown(event: KeyboardEvent) {
    // Só o modal do topo fecha; preventDefault evita fechar os de baixo em cascata.
    if (event.key !== 'Escape' || ui.top !== id || event.defaultPrevented) return
    event.preventDefault()
    onclose()
  }
</script>

<svelte:window {onkeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="modal-overlay"
    style:z-index={50 + ui.level(id)}
    onclick={event => event.target === event.currentTarget && onclose()}
    transition:fade={{ duration: 200 }}
  >
    <div
      class="modal-card {className}"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      transition:scale={{ start: 0.95, duration: 200 }}
    >
      {#if title || header}
        <div class="relative">
          {#if header}
            {@render header()}
          {:else}
            <h2 class="modal-title">{title}</h2>
          {/if}
          {#if closeLabel}
            <button onclick={onclose} aria-label={closeLabel} class="modal-close-button">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          {/if}
        </div>
      {/if}

      {@render children()}
    </div>
  </div>
{/if}
