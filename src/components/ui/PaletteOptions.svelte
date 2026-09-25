<!-- Círculos de cor. Cores usadas por outros times ficam desabilitadas. -->
<script lang="ts">
  import { TEAM_COLOR_PALETTES } from '../../lib/palettes'

  interface Props {
    selectedId: string | null
    usedIds: Set<string>
    onpick: (paletteId: string) => void
  }

  let { selectedId, usedIds, onpick }: Props = $props()
</script>

<div class="palette-options" role="group" aria-label="Cores">
  {#each TEAM_COLOR_PALETTES as palette (palette.id)}
    {@const selected = palette.id === selectedId}
    {@const unavailable = !selected && usedIds.has(palette.id)}
    <button
      type="button"
      class="swatch-option"
      disabled={unavailable}
      aria-pressed={selected}
      aria-label={unavailable ? `${palette.label} (em uso)` : palette.label}
      title={unavailable ? `${palette.label} (em uso)` : palette.label}
      onclick={() => onpick(palette.id)}
    >
      <span style:background={palette.primary}></span>
    </button>
  {/each}
</div>
