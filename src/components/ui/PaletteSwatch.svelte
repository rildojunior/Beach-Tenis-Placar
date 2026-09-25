<script lang="ts">
  let { color, class: className = '' }: { color: string; class?: string } = $props()
</script>

<span class={['palette-swatch', className]} style:background={color}></span>
