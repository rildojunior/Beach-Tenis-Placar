<!-- Alerta centralizado, para decisões rápidas (fim de set, confirmações). -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { alertIn, alertOut } from '../../lib/transitions'
  import { ui, type ModalId } from '../../stores/ui.svelte'

  interface Props {
    id: ModalId
    title: string
    onclose?: () => void
    /** Botões lado a lado (dois) em vez de empilhados. */
    row?: boolean
    icon?: Snippet
    children?: Snippet
    actions: Snippet
  }

  let {
    id,
    title,
    onclose = () => ui.close(id),
    row = false,
    icon,
    children,
    actions
  }: Props = $props()

  const open = $derived(ui.isOpen(id))
</script>

<svelte:window onkeydown={event => ui.handleEscape(event, id, onclose)} />

{#if open}
  <div
    class="fixed inset-0 grid place-items-center p-10"
    style:z-index={50 + ui.level(id)}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="alert-scrim" onclick={onclose} transition:fade={{ duration: 200 }}></div>

    <div
      class="alert material-regular"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      in:alertIn
      out:alertOut
    >
      <div class="alert-text">
        {@render icon?.()}
        <h2 class="alert-title">{title}</h2>
        {@render children?.()}
      </div>
      <div class={['alert-actions', row && 'alert-actions--row']}>
        {@render actions()}
      </div>
    </div>
  </div>
{/if}
