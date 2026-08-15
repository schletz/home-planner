<script setup lang="ts">
import { computed } from 'vue'
import { degToRad } from '@/utils/geometry'

/**
 * Shows in which direction a wall runs. The start point sits in the centre, the
 * arrow points to the wall end, so it is immediately visible whether 90° goes
 * up or down.
 */
const props = withDefaults(
  defineProps<{
    angle: number
    /** Wall thickness in cm, only used to keep the preview in proportion. */
    thickness?: number
    /** Edge length of the preview in pixels. */
    size?: number
    /** The caption is only useful where there is room for it. */
    caption?: boolean
  }>(),
  { thickness: 25, size: 132, caption: true },
)

const SIZE = computed(() => props.size)
const CENTER = computed(() => props.size / 2)
const RADIUS = computed(() => props.size / 2 - 18)

const end = computed(() => {
  const a = degToRad(props.angle)
  return {
    x: CENTER.value + Math.cos(a) * RADIUS.value,
    y: CENTER.value - Math.sin(a) * RADIUS.value,
  }
})

/** Two short lines forming the arrow head at the wall end. */
const arrow = computed(() => {
  const a = degToRad(props.angle)
  const head = 11
  const left = a + degToRad(150)
  const right = a - degToRad(150)
  return [
    `M ${end.value.x} ${end.value.y} L ${end.value.x + Math.cos(left) * head} ${end.value.y - Math.sin(left) * head}`,
    `M ${end.value.x} ${end.value.y} L ${end.value.x + Math.cos(right) * head} ${end.value.y - Math.sin(right) * head}`,
  ].join(' ')
})

const strokeWidth = computed(() => Math.min(Math.max((props.thickness ?? 25) / 6, 3), 10))
</script>

<template>
  <figure class="preview" :style="{ width: `${SIZE}px` }">
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
      <circle class="preview-ring" :cx="CENTER" :cy="CENTER" :r="RADIUS" />
      <path
        class="preview-cross"
        :d="`M ${CENTER - RADIUS} ${CENTER} h ${RADIUS * 2} M ${CENTER} ${CENTER - RADIUS} v ${RADIUS * 2}`"
      />
      <text class="preview-tick" text-anchor="end" :x="SIZE - 6" :y="CENTER - 4">0°</text>
      <text class="preview-tick" :x="CENTER + 5" :y="12">90°</text>
      <text class="preview-tick" :x="8" :y="CENTER - 4">180°</text>
      <text class="preview-tick" :x="CENTER + 5" :y="SIZE - 4">270°</text>
      <line
        class="preview-wall"
        :x1="CENTER"
        :y1="CENTER"
        :x2="end.x"
        :y2="end.y"
        :stroke-width="strokeWidth"
      />
      <path class="preview-arrow" :d="arrow" />
      <circle class="preview-start" :cx="CENTER" :cy="CENTER" r="4" />
    </svg>
    <figcaption v-if="caption">Startpunkt in der Mitte, Pfeil zeigt zum Wandende</figcaption>
  </figure>
</template>

<style scoped>
.preview {
  margin: 0;
  display: grid;
  justify-items: center;
  gap: 4px;
}
.preview-ring {
  fill: #f8fafc;
  stroke: #e2e8f0;
}
.preview-cross {
  stroke: #cbd5e1;
  stroke-dasharray: 3 3;
  fill: none;
}
.preview-tick {
  font-size: 9px;
  fill: #94a3b8;
}
.preview-wall {
  stroke: #3f3f46;
  stroke-linecap: round;
}
.preview-arrow {
  stroke: #ef4444;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
}
.preview-start {
  fill: #ef4444;
}
figcaption {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}
</style>
