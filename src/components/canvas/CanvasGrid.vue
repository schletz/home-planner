<script setup lang="ts">
import { computed } from 'vue'
import type { Point } from '@/types/plan'

/**
 * Grid of the drawing area: a fine 10 cm raster and a coarse 50 cm raster, both
 * aligned to the ruler origin. The grid lives inside the zoom group, therefore
 * line widths are divided by the scale to stay one pixel wide.
 */
const props = defineProps<{
  origin: Point
  scale: number
  box: { minX: number; minY: number; maxX: number; maxY: number }
}>()

const FINE = 10
const COARSE = 50

/** The fine raster is hidden as soon as it would become visual noise. */
const showFine = computed(() => props.scale * FINE >= 4)

function buildPath(step: number, skipCoarse: boolean): string {
  const { minX, minY, maxX, maxY } = props.box
  const parts: string[] = []
  const firstX = Math.ceil((minX - props.origin.x) / step) * step + props.origin.x
  const firstY = Math.ceil((minY - props.origin.y) / step) * step + props.origin.y

  for (let x = firstX; x <= maxX; x += step) {
    if (skipCoarse && Math.abs((x - props.origin.x) % COARSE) < 0.001) continue
    parts.push(`M ${x} ${minY} L ${x} ${maxY}`)
  }
  for (let y = firstY; y <= maxY; y += step) {
    if (skipCoarse && Math.abs((y - props.origin.y) % COARSE) < 0.001) continue
    parts.push(`M ${minX} ${y} L ${maxX} ${y}`)
  }
  return parts.join(' ')
}

const finePath = computed(() => (showFine.value ? buildPath(FINE, true) : ''))
const coarsePath = computed(() => buildPath(COARSE, false))
const lineWidth = computed(() => 1 / props.scale)
</script>

<template>
  <g class="canvas-grid">
    <path v-if="finePath" class="grid-fine" :d="finePath" :stroke-width="lineWidth" />
    <path class="grid-coarse" :d="coarsePath" :stroke-width="lineWidth" />
    <path
      class="grid-axis"
      :d="`M ${box.minX} ${origin.y} L ${box.maxX} ${origin.y} M ${origin.x} ${box.minY} L ${origin.x} ${box.maxY}`"
      :stroke-width="lineWidth"
    />
  </g>
</template>

<style scoped>
.canvas-grid {
  pointer-events: none;
}
.grid-fine {
  fill: none;
  stroke: #e6e8eb;
}
.grid-coarse {
  fill: none;
  stroke: #c9ced6;
}
.grid-axis {
  fill: none;
  stroke: #ef4444;
  opacity: 0.55;
}
</style>
