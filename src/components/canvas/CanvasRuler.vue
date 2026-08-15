<script setup lang="ts">
import { computed } from 'vue'
import { RULER_SIZE } from '@/composables/useViewport'

/**
 * Horizontal or vertical ruler. Values are shown relative to the ruler origin,
 * which the user can drag onto any point of the plan.
 */
const props = defineProps<{
  orientation: 'horizontal' | 'vertical'
  /** Screen pixels per centimetre. */
  scale: number
  /** Screen position of the model coordinate 0 in pixels. */
  pan: number
  /** Model coordinate that is shown as 0 on the ruler. */
  origin: number
  /** Length of the ruler in pixels. */
  size: number
  /** Mouse position along the ruler in pixels, or null when outside. */
  cursor: number | null
}>()

const STEPS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

interface Tick {
  position: number
  label: string | null
}

/** Smallest raster whose labels still keep a readable distance. */
const labelStep = computed(
  () => STEPS.find((step) => step * props.scale >= 55) ?? STEPS[STEPS.length - 1]!,
)

const minorStep = computed(() => {
  const candidate = labelStep.value / 5
  return candidate * props.scale >= 5 ? candidate : labelStep.value
})

const ticks = computed<Tick[]>(() => {
  const step = minorStep.value
  const modelStart = (0 - props.pan) / props.scale
  const modelEnd = (props.size - props.pan) / props.scale
  const first = Math.ceil((modelStart - props.origin) / step) * step + props.origin
  const result: Tick[] = []

  for (let model = first; model <= modelEnd; model += step) {
    const value = model - props.origin
    const isLabel = Math.abs(value % labelStep.value) < step / 10
    result.push({
      position: model * props.scale + props.pan,
      label: isLabel ? String(Math.round(value)) : null,
    })
  }
  return result
})

const isHorizontal = computed(() => props.orientation === 'horizontal')
const width = computed(() => (isHorizontal.value ? props.size : RULER_SIZE))
const height = computed(() => (isHorizontal.value ? RULER_SIZE : props.size))

/** Ticks grow from the inner edge of the ruler towards the drawing area. */
function tickPath(tick: Tick): string {
  const length = tick.label ? 11 : 5
  return isHorizontal.value
    ? `M ${tick.position} ${RULER_SIZE} L ${tick.position} ${RULER_SIZE - length}`
    : `M ${RULER_SIZE} ${tick.position} L ${RULER_SIZE - length} ${tick.position}`
}
</script>

<template>
  <svg class="ruler" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`">
    <rect class="ruler-background" x="0" y="0" :width="width" :height="height" />
    <path
      v-for="tick in ticks"
      :key="tick.position"
      class="ruler-tick"
      :class="{ 'is-major': tick.label !== null }"
      :d="tickPath(tick)"
    />
    <template v-for="tick in ticks" :key="`l-${tick.position}`">
      <text
        v-if="tick.label !== null"
        class="ruler-label"
        :x="isHorizontal ? tick.position + 2 : RULER_SIZE - 4"
        :y="isHorizontal ? 9 : tick.position - 2"
        :transform="isHorizontal ? undefined : `rotate(-90 ${RULER_SIZE - 4} ${tick.position - 2})`"
      >
        {{ tick.label }}
      </text>
    </template>
    <path
      v-if="cursor !== null"
      class="ruler-cursor"
      :d="
        isHorizontal
          ? `M ${cursor} 0 L ${cursor} ${RULER_SIZE}`
          : `M 0 ${cursor} L ${RULER_SIZE} ${cursor}`
      "
    />
  </svg>
</template>

<style scoped>
.ruler {
  display: block;
}
.ruler-background {
  fill: #f4f5f7;
  stroke: none;
}
.ruler-tick {
  stroke: #c2c8d0;
  stroke-width: 1;
  fill: none;
}
.ruler-tick.is-major {
  stroke: #6b7280;
}
.ruler-label {
  fill: #4b5563;
  font-size: 9px;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.ruler-cursor {
  stroke: #ef4444;
  stroke-width: 1;
  fill: none;
}
</style>
