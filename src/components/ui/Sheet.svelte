<!--
  Folha que sobe da borda de baixo, no estilo do iOS.

  - Abre e fecha com mola, e pode ser interrompida no meio do caminho.
  - Pode ser arrastada para baixo pelo topo. Ao soltar, usa a velocidade do
    dedo para decidir se fecha (projeção de impulso) e continua o movimento
    na mesma velocidade.
  - Arrastar para cima oferece resistência progressiva (rubber band).
  - Com "Reduzir movimento", aparece e some só esmaecendo.
-->
<script lang="ts">
  import { tick, untrack, type Snippet } from 'svelte'
  import { prefersReducedMotion } from 'svelte/motion'
  import { project, rubberband, VelocityTracker } from '../../lib/gesture'
  import { SPRING_DEFAULT, SPRING_MOMENTUM, SpringValue } from '../../lib/spring'
  import { ui, type ModalId } from '../../stores/ui.svelte'

  interface Props {
    id: ModalId
    title: string
    closeLabel?: string
    onclose?: () => void
    subtitle?: Snippet
    children: Snippet
  }

  let {
    id,
    title,
    closeLabel = 'Fechar',
    onclose = () => ui.close(id),
    subtitle,
    children
  }: Props = $props()

  const open = $derived(ui.isOpen(id))
  const buried = $derived(open && ui.top !== id)
  const reduced = $derived(prefersReducedMotion.current)

  let rendered = $state(false)
  let height = $state(0)
  let offset = $state(0)
  let zIndex = $state(50)

  const spring = new SpringValue(0, value => (offset = value))
  const hiddenOffset = () => (height || window.innerHeight) + 32
  const progress = $derived(Math.min(1, Math.max(0, 1 - offset / (height || 1))))

  $effect(() => {
    const isOpen = open
    untrack(() => (isOpen ? show() : hide()))
  })

  async function show() {
    zIndex = 50 + ui.level(id)
    if (!rendered) {
      spring.jump(window.innerHeight)
      rendered = true
      await tick()
    }
    spring.to(0, SPRING_DEFAULT)
  }

  async function hide() {
    if (!rendered) return
    const reached = await spring.to(hiddenOffset(), SPRING_DEFAULT)
    if (reached) rendered = false
  }

  // ----- Arrastar para fechar -----
  const tracker = new VelocityTracker()
  let dragging = false
  let startY = 0
  let startOffset = 0

  function onpointerdown(event: PointerEvent) {
    if (reduced || event.button !== 0) return
    if ((event.target as HTMLElement).closest('button')) return

    try {
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    } catch {
      // Ponteiro já liberado pelo navegador: segue sem captura.
    }
    spring.stop() // agarra a folha onde ela estiver, mesmo no meio de uma animação
    dragging = true
    startY = event.clientY
    startOffset = spring.value
    tracker.reset()
    tracker.add(event.timeStamp, startOffset)
  }

  function onpointermove(event: PointerEvent) {
    if (!dragging) return
    const raw = startOffset + event.clientY - startY
    const next = raw < 0 ? -rubberband(-raw, height) : raw
    spring.jump(next)
    tracker.add(event.timeStamp, next)
  }

  function onpointerup() {
    if (!dragging) return
    dragging = false

    const velocity = tracker.velocity()
    spring.velocity = velocity // a mola continua na velocidade do dedo

    const projected = spring.value + project(velocity)
    if (projected > height / 2) onclose()
    else spring.to(0, SPRING_MOMENTUM)
  }
</script>

<svelte:window onkeydown={event => ui.handleEscape(event, id, onclose)} />

{#if rendered}
  <div class="fixed inset-0" style:z-index={zIndex}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="sheet-scrim" style:opacity={progress} onclick={onclose}></div>

    <div
      class="sheet-positioner"
      style:transform={reduced ? null : `translate3d(0, ${offset}px, 0)`}
      style:opacity={reduced ? progress : null}
    >
      <div
        class={['sheet material-thick', buried && 'sheet--buried']}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        bind:offsetHeight={height}
      >
        <!-- Área de arrastar. Teclado usa o botão de fechar ou Esc. -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <header
          class="sheet-header"
          {onpointerdown}
          {onpointermove}
          {onpointerup}
          onpointercancel={onpointerup}
        >
          <div class="sheet-grabber" aria-hidden="true"></div>
          <div class="sheet-titlebar">
            <span></span>
            <div class="min-w-0">
              <h2 class="sheet-title">{title}</h2>
              {@render subtitle?.()}
            </div>
            <button class="sheet-close" aria-label={closeLabel} onclick={onclose}>
              <span class="material-symbols-outlined text-[1.25rem]!">close</span>
            </button>
          </div>
        </header>

        <div class="sheet-body">
          {@render children()}
        </div>

        <div class="sheet-dim" aria-hidden="true"></div>
      </div>
    </div>
  </div>
{/if}
