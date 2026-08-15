<script setup lang="ts">
import { computed } from 'vue'
import type { Opening, Wall } from '@/types/plan'
import { clamp, isTextFlipped, sideSign } from '@/utils/geometry'
import { arcPath, clearWidth, isHingedAtStart, swingSide } from '@/utils/wallGeometry'
import { LABEL_TEXT_SIZE } from '@/utils/planStyle'

/**
 * Door, window or double window drawn in wall-local coordinates: x runs along
 * the wall, y grows towards the `below` side, the wall centre line is y = 0.
 */
const props = defineProps<{
  wall: Wall
  opening: Opening
  selected: boolean
}>()

interface Leaf {
  x: number
  y1: number
  y2: number
  arc: string
}

const half = computed(() => props.wall.thickness / 2)
const start = computed(() => clamp(props.opening.offset, 0, props.wall.length))
const end = computed(() => clamp(start.value + props.opening.width, 0, props.wall.length))
const frame = computed(() => clamp(props.opening.frame, 0, (end.value - start.value) / 2 - 0.5))
const sign = computed(() => sideSign(swingSide(props.opening)))

/** Inner edges of the opening, i.e. the clear opening between the frames. */
const clearStart = computed(() => start.value + frame.value)
const clearEnd = computed(() => end.value - frame.value)

/**
 * The swinging parts. A door has one leaf hinged at the selected jamb, a double
 * window has two leaves hinged at both outer jambs, each covering half of the
 * clear width.
 */
const leaves = computed<Leaf[]>(() => {
  const width = clearWidth(props.opening)
  const faceY = sign.value * half.value

  const build = (hingeX: number, farX: number, radius: number): Leaf => ({
    x: hingeX,
    y1: faceY,
    y2: faceY + sign.value * radius,
    arc: arcPath(
      { x: hingeX, y: faceY },
      { x: hingeX, y: faceY + sign.value * radius },
      { x: farX, y: faceY },
    ),
  })

  if (props.opening.kind === 'doubleWindow') {
    const half_ = width / 2
    return [
      build(clearStart.value, clearStart.value + half_, half_),
      build(clearEnd.value, clearEnd.value - half_, half_),
    ]
  }

  return isHingedAtStart(props.opening)
    ? [build(clearStart.value, clearEnd.value, width)]
    : [build(clearEnd.value, clearStart.value, width)]
})

const isWindow = computed(() => props.opening.kind !== 'door')

/** Height of the glass pane in the drawing, kept inside the wall thickness. */
const glassOffset = computed(() => Math.max(half.value / 3, 1))

const label = computed(() => props.opening.text?.trim() ?? '')

/** Labels sit on the side opposite to the leaf so they never overlap the arc. */
const labelPoint = computed(() => ({
  x: (start.value + end.value) / 2,
  y: -sign.value * (half.value + LABEL_TEXT_SIZE * 0.9),
}))

const flipped = computed(() => isTextFlipped(props.wall))
</script>

<template>
  <g class="plan-object" :class="{ 'is-selected': selected }">
    <!-- The white reveal hides the grid inside the opening. -->
    <rect
      class="plan-opening-reveal"
      :x="start"
      :y="-half"
      :width="end - start"
      :height="wall.thickness"
    />
    <line class="plan-jamb" :x1="start" :y1="-half" :x2="start" :y2="half" />
    <line class="plan-jamb" :x1="end" :y1="-half" :x2="end" :y2="half" />

    <rect
      v-if="frame > 0"
      class="plan-opening-frame"
      :x="start"
      :y="-half"
      :width="frame"
      :height="wall.thickness"
    />
    <rect
      v-if="frame > 0"
      class="plan-opening-frame"
      :x="end - frame"
      :y="-half"
      :width="frame"
      :height="wall.thickness"
    />

    <template v-if="isWindow">
      <line
        class="plan-glass"
        :x1="clearStart"
        :y1="-glassOffset"
        :x2="clearEnd"
        :y2="-glassOffset"
      />
      <line
        class="plan-glass"
        :x1="clearStart"
        :y1="glassOffset"
        :x2="clearEnd"
        :y2="glassOffset"
      />
      <rect
        v-if="opening.kind === 'doubleWindow'"
        class="plan-opening-frame"
        :x="(clearStart + clearEnd) / 2 - frame / 2"
        :y="-half"
        :width="frame"
        :height="wall.thickness"
      />
    </template>

    <template v-for="(leaf, index) in leaves" :key="index">
      <line class="plan-leaf" :x1="leaf.x" :y1="leaf.y1" :x2="leaf.x" :y2="leaf.y2" />
      <path class="plan-arc" :d="leaf.arc" />
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
