<script setup lang="ts">
import { computed } from 'vue'
import type { Wall, WallSide } from '@/types/plan'
import type { DimensionSegment } from '@/utils/dimensions'
import { isTextFlipped, round, sideSign } from '@/utils/geometry'
import {
  DIM_EXTENSION_GAP,
  DIM_EXTENSION_OVERSHOOT,
  DIM_TEXT_SIZE,
  DIM_TICK,
} from '@/utils/planStyle'

/**
 * One row of dimensions along a wall, drawn in wall-local coordinates. The row
 * consists of extension lines at every measuring point, a continuous dimension
 * line with slanted ticks and the figures above it.
 */
const props = defineProps<{
  wall: Wall
  segments: DimensionSegment[]
  side: WallSide
  /** Distance of the dimension line from the wall face in cm. */
  distance: number
}>()

const sign = computed(() => sideSign(props.side))
const faceY = computed(() => sign.value * (props.wall.thickness / 2))
const lineY = computed(() => faceY.value + sign.value * props.distance)

/** Every measuring point, i.e. the segment borders without duplicates. */
const ticks = computed(() => {
  const values = props.segments.map((segment) => segment.from)
  const last = props.segments[props.segments.length - 1]
  if (last) values.push(last.to)
  return values
})

const extensionStartY = computed(() => faceY.value + sign.value * DIM_EXTENSION_GAP)
const extensionEndY = computed(() => lineY.value + sign.value * DIM_EXTENSION_OVERSHOOT)

const flipped = computed(() => isTextFlipped(props.wall))

function labelY(): number {
  return lineY.value + sign.value * DIM_TEXT_SIZE * 0.85
}
</script>

<template>
  <g v-if="segments.length" class="plan-dimension">
    <line
      v-for="tick in ticks"
      :key="`e-${tick}`"
      class="plan-dimension-extension"
      :x1="tick"
      :y1="extensionStartY"
      :x2="tick"
      :y2="extensionEndY"
    />
    <line
      class="plan-dimension-line"
      :x1="ticks[0]"
      :y1="lineY"
      :x2="ticks[ticks.length - 1]"
      :y2="lineY"
    />
    <line
      v-for="tick in ticks"
      :key="`t-${tick}`"
      class="plan-dimension-tick"
      :x1="tick - DIM_TICK"
      :y1="lineY + DIM_TICK"
      :x2="tick + DIM_TICK"
      :y2="lineY - DIM_TICK"
    />
    <text
      v-for="segment in segments"
      :key="`l-${segment.from}`"
      class="plan-dimension-text"
      :x="(segment.from + segment.to) / 2"
      :y="labelY()"
      :font-size="DIM_TEXT_SIZE"
      :transform="
        flipped ? `rotate(180 ${(segment.from + segment.to) / 2} ${labelY()})` : undefined
      "
    >
      {{ round(segment.length) }}
    </text>
  </g>
</template>
