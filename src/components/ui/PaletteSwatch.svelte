<script lang="ts">
  let { color }: { color: string } = $props()
</script>

<span class="palette-swatch" style:background={color}></span>
