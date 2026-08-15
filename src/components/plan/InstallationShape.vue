<script setup lang="ts">
import { computed } from 'vue'
import ShaftDimensions from '@/components/plan/ShaftDimensions.vue'
import type { Installation, Wall } from '@/types/plan'
import { clamp, isTextFlipped, sideSign } from '@/utils/geometry'
import { DIM_ROW_HEIGHT, DIM_SHAFT_DISTANCE, LABEL_TEXT_SIZE } from '@/utils/planStyle'

/**
 * Socket, water connection, radiator or shaft. The symbol sits on the selected
 * wall face and points away from the wall, drawn in wall-local coordinates.
 */
const props = defineProps<{
  wall: Wall
  installation: Installation
  selected: boolean
}>()

/** Radius of the round symbols in cm. */
const SYMBOL_RADIUS = 9

/** Depth of a radiator in cm. */
const RADIATOR_DEPTH = 12

/** Fallback extents of a shaft in cm, used when the data carries none. */
const SHAFT_WIDTH = 60
const SHAFT_DEPTH = 40

const sign = computed(() => sideSign(props.installation.side))
const half = computed(() => props.wall.thickness / 2)
const centerX = computed(() => clamp(props.installation.offset, 0, props.wall.length))
/** y of the wall face the symbol is mounted on. */
const faceY = computed(() => sign.value * half.value)

/** Half disc of the socket symbol, flat side against the wall. */
const socketPath = computed(() => {
  const r = SYMBOL_RADIUS
  const sweep = sign.value > 0 ? 0 : 1
  return `M ${centerX.value - r} ${faceY.value} A ${r} ${r} 0 0 ${sweep} ${centerX.value + r} ${faceY.value} Z`
})

const waterCenter = computed(() => ({
  x: centerX.value,
  y: faceY.value + sign.value * (SYMBOL_RADIUS + 4),
}))

const radiator = computed(() => {
  const length = Math.max(props.installation.length ?? 100, 10)
  return {
    x: centerX.value - length / 2,
    y: sign.value > 0 ? faceY.value : faceY.value - RADIATOR_DEPTH,
    width: length,
    height: RADIATOR_DEPTH,
  }
})

/**
 * A shaft is a piece of building material sticking out of the wall, so it is
 * drawn as a solid rectangle with the usual diagonal cross instead of a symbol.
 * Only its three free sides carry a contour: the fourth one lies in the wall
 * face and would cut the wall in two. An open path still fills as if it were
 * closed, so a single path yields both the body and the correct outline.
 */
const shaft = computed(() => {
  const width = Math.max(props.installation.length ?? SHAFT_WIDTH, 1)
  const depth = Math.max(props.installation.depth ?? SHAFT_DEPTH, 1)
  const left = centerX.value - width / 2
  const right = centerX.value + width / 2
  const outerY = faceY.value + sign.value * depth
  return {
    depth,
    left,
    right,
    body: `M ${left} ${faceY.value} L ${left} ${outerY} L ${right} ${outerY} L ${right} ${faceY.value}`,
    cross: `M ${left} ${faceY.value} L ${right} ${outerY} M ${left} ${outerY} L ${right} ${faceY.value}`,
  }
})

/**
 * Distance of the label from the wall face, depends on the symbol size. The
 * label of a shaft has to clear its own width dimension including the figures
 * above it, so it sits noticeably further out than the other ones.
 */
const labelDistance = computed(() => {
  if (props.installation.kind === 'radiator') return RADIATOR_DEPTH + LABEL_TEXT_SIZE
  if (props.installation.kind === 'shaft') {
    return shaft.value.depth + DIM_SHAFT_DISTANCE + DIM_ROW_HEIGHT + LABEL_TEXT_SIZE
  }
  return SYMBOL_RADIUS * 2.6
})

const labelPoint = computed(() => ({
  x: centerX.value,
  y: faceY.value + sign.value * labelDistance.value,
}))

const label = computed(() => {
  const text = props.installation.text?.trim()
  // A mounting height is meaningless for a shaft, it reaches from floor to ceiling.
  if (props.installation.kind === 'shaft') return text ?? ''
  return [text, `h=${props.installation.height}`].filter(Boolean).join(' ')
})

const flipped = computed(() => isTextFlipped(props.wall))
</script>

<template>
  <g class="plan-object" :class="{ 'is-selected': selected }">
    <template v-if="installation.kind === 'socket'">
      <line
        class="plan-symbol-line"
        :x1="centerX"
        :y1="faceY"
        :x2="centerX"
        :y2="faceY + sign * SYMBOL_RADIUS * 1.9"
      />
      <path class="plan-symbol" :d="socketPath" />
    </template>

    <template v-else-if="installation.kind === 'water'">
      <line
        class="plan-symbol-line"
        :x1="centerX"
        :y1="faceY"
        :x2="waterCenter.x"
        :y2="waterCenter.y"
      />
      <circle class="plan-symbol" :cx="waterCenter.x" :cy="waterCenter.y" :r="SYMBOL_RADIUS - 2" />
      <line
        class="plan-symbol-line"
        :x1="waterCenter.x - 4"
        :y1="waterCenter.y"
        :x2="waterCenter.x + 4"
        :y2="waterCenter.y"
      />
      <line
        class="plan-symbol-line"
        :x1="waterCenter.x"
        :y1="waterCenter.y - 4"
        :x2="waterCenter.x"
        :y2="waterCenter.y + 4"
      />
    </template>

    <template v-else-if="installation.kind === 'shaft'">
      <path class="plan-shaft" :d="shaft.body" />
      <path class="plan-shaft-cross" :d="shaft.cross" />
      <ShaftDimensions
        :left="shaft.left"
        :right="shaft.right"
        :face-y="faceY"
        :depth="shaft.depth"
        :sign="sign"
        :flipped="flipped"
      />
    </template>

    <template v-else>
      <rect
        class="plan-symbol"
        :x="radiator.x"
        :y="radiator.y"
        :width="radiator.width"
        :height="radiator.height"
      />
      <line
        class="plan-symbol-line"
        :x1="radiator.x + 2"
        :y1="radiator.y + radiator.height / 3"
        :x2="radiator.x + radiator.width - 2"
        :y2="radiator.y + radiator.height / 3"
      />
      <line
        class="plan-symbol-line"
        :x1="radiator.x + 2"
        :y1="radiator.y + (radiator.height * 2) / 3"
        :x2="radiator.x + radiator.width - 2"
        :y2="radiator.y + (radiator.height * 2) / 3"
      />
    </template>

    <text
      v-if="label"
      class="plan-label"
      :x="labelPoint.x"
      :y="labelPoint.y"
      :font-size="LABEL_TEXT_SIZE"
      :transform="flipped ? `rotate(180 ${labelPoint.x} ${labelPoint.y})` : undefined"
    >
      {{ label }}
    </text>
  </g>
</template>
