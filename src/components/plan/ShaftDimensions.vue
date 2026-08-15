<script setup lang="ts">
import { computed } from 'vue'
import { round } from '@/utils/geometry'
import {
  DIM_EXTENSION_GAP,
  DIM_EXTENSION_OVERSHOOT,
  DIM_SHAFT_DISTANCE,
  DIM_TEXT_SIZE,
  DIM_TICK,
} from '@/utils/planStyle'

/**
 * The two dimension lines of a shaft, drawn in wall-local coordinates.
 *
 * A shaft is the one object that has an extent in both directions, and its
 * depth points away from the wall — a row running along the wall can never show
 * it. It is therefore measured for itself: the width beyond the outer face, the
 * depth beside the right edge. Both lines use the classes of `DimensionRow`, so
 * screen and export keep one look for all dimensions.
 */
const props = defineProps<{
  /** Left and right edge of the shaft in wall-local x. */
  left: number
  right: number
  /** y of the wall face the shaft is mounted on. */
  faceY: number
  /** How far the shaft sticks into the room, in cm. */
  depth: number
  /** Direction away from the wall, `-1` for the `above` side. */
  sign: number
  /** True when the wall reads upside down, see `isTextFlipped`. */
  flipped: boolean
}>()

/** y of the outer face, i.e. the far side of the shaft. */
const outerY = computed(() => props.faceY + props.sign * props.depth)

/* Width, measured beyond the outer face. */
const widthLineY = computed(() => outerY.value + props.sign * DIM_SHAFT_DISTANCE)
const widthExtensionStartY = computed(() => outerY.value + props.sign * DIM_EXTENSION_GAP)
const widthExtensionEndY = computed(() => widthLineY.value + props.sign * DIM_EXTENSION_OVERSHOOT)
const widthTextY = computed(() => widthLineY.value + props.sign * DIM_TEXT_SIZE * 0.85)
const widthCenterX = computed(() => (props.left + props.right) / 2)

/* Depth, measured beside the right edge. */
const depthLineX = computed(() => props.right + DIM_SHAFT_DISTANCE)
const depthExtensionStartX = computed(() => props.right + DIM_EXTENSION_GAP)
const depthExtensionEndX = computed(() => depthLineX.value + DIM_EXTENSION_OVERSHOOT)
const depthTextX = computed(() => depthLineX.value + DIM_TEXT_SIZE * 0.85)
const depthCenterY = computed(() => (props.faceY + outerY.value) / 2)

/** Figures of a vertical row read bottom up, and follow the flip of the wall. */
const depthTextTransform = computed(
  () => `rotate(${props.flipped ? 90 : -90} ${depthTextX.value} ${depthCenterY.value})`,
)

const widthLabel = computed(() => round(props.right - props.left))
const depthLabel = computed(() => round(props.depth))
</script>

<template>
  <g class="plan-dimension">
    <line
      v-for="x in [left, right]"
      :key="`we-${x}`"
      class="plan-dimension-extension"
      :x1="x"
      :y1="widthExtensionStartY"
      :x2="x"
      :y2="widthExtensionEndY"
    />
    <line
      class="plan-dimension-line"
      :x1="left"
      :y1="widthLineY"
      :x2="right"
      :y2="widthLineY"
    />
    <line
      v-for="x in [left, right]"
      :key="`wt-${x}`"
      class="plan-dimension-tick"
      :x1="x - DIM_TICK"
      :y1="widthLineY + DIM_TICK"
      :x2="x + DIM_TICK"
      :y2="widthLineY - DIM_TICK"
    />
    <text
      class="plan-dimension-text"
      :x="widthCenterX"
      :y="widthTextY"
      :font-size="DIM_TEXT_SIZE"
      :transform="flipped ? `rotate(180 ${widthCenterX} ${widthTextY})` : undefined"
    >
      {{ widthLabel }}
    </text>

    <line
      v-for="y in [faceY, outerY]"
      :key="`de-${y}`"
      class="plan-dimension-extension"
      :x1="depthExtensionStartX"
      :y1="y"
      :x2="depthExtensionEndX"
      :y2="y"
    />
    <line
      class="plan-dimension-line"
      :x1="depthLineX"
      :y1="faceY"
      :x2="depthLineX"
      :y2="outerY"
    />
    <line
      v-for="y in [faceY, outerY]"
      :key="`dt-${y}`"
      class="plan-dimension-tick"
      :x1="depthLineX - DIM_TICK"
      :y1="y - DIM_TICK"
      :x2="depthLineX + DIM_TICK"
      :y2="y + DIM_TICK"
    />
    <text
      class="plan-dimension-text"
      :x="depthTextX"
      :y="depthCenterY"
      :font-size="DIM_TEXT_SIZE"
      :transform="depthTextTransform"
    >
      {{ depthLabel }}
    </text>
  </g>
</template>
