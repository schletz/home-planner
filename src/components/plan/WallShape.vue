<script setup lang="ts">
import { computed } from 'vue'
import DimensionRow from '@/components/plan/DimensionRow.vue'
import InstallationShape from '@/components/plan/InstallationShape.vue'
import OpeningShape from '@/components/plan/OpeningShape.vue'
import { isOpening, type Selection, type Wall, type WallSide } from '@/types/plan'
import { detailSegments, totalSegments } from '@/utils/dimensions'
import { DIM_DETAIL_DISTANCE, DIM_TOTAL_DISTANCE } from '@/utils/planStyle'
import { bodySpans } from '@/utils/wallGeometry'

/**
 * A complete wall: the solid body between its openings, all objects sitting in
 * the wall and the two dimension rows. The group transform maps wall-local
 * coordinates to the world, so every child can be drawn as if the wall started
 * at the origin and ran along the x axis.
 */
const props = defineProps<{
  wall: Wall
  selection: Selection | null
  /** Width of the invisible click area in cm, set by the canvas from the zoom. */
  hitWidth: number
}>()

const emit = defineEmits<{
  (event: 'pick-wall', payload: PointerEvent): void
  (event: 'pick-object', payload: PointerEvent, objectId: string): void
}>()

const transform = computed(
  () => `translate(${props.wall.x} ${props.wall.y}) rotate(${-props.wall.angle})`,
)

const spans = computed(() => bodySpans(props.wall))
const half = computed(() => props.wall.thickness / 2)

const wallSelected = computed(
  () => props.selection?.wallId === props.wall.id && !props.selection.objectId,
)

function objectSelected(objectId: string): boolean {
  return props.selection?.wallId === props.wall.id && props.selection.objectId === objectId
}

const detail = computed(() => detailSegments(props.wall))
const total = computed(() => totalSegments(props.wall))

function placement(side: Wall['totalDimension']): WallSide | null {
  return side === 'none' ? null : side
}
</script>

<template>
  <g class="plan-wall" :transform="transform">
    <line
      class="plan-wall-hit"
      :x1="0"
      :y1="0"
      :x2="wall.length"
      :y2="0"
      :stroke-width="Math.max(wall.thickness, hitWidth)"
      @pointerdown="emit('pick-wall', $event)"
    />

    <rect
      v-for="span in spans"
      :key="`${span.from}-${span.to}`"
      class="plan-wall-body"
      :class="{ 'is-selected': wallSelected }"
      :x="span.from"
      :y="-half"
      :width="span.to - span.from"
      :height="wall.thickness"
      @pointerdown="emit('pick-wall', $event)"
    />

    <g v-for="object in wall.objects" :key="object.id" @pointerdown="emit('pick-object', $event, object.id)">
      <OpeningShape
        v-if="isOpening(object)"
        :wall="wall"
        :opening="object"
        :selected="objectSelected(object.id)"
      />
      <InstallationShape
        v-else
        :wall="wall"
        :installation="object"
        :selected="objectSelected(object.id)"
      />
    </g>

    <DimensionRow
      v-if="placement(wall.detailDimension)"
      :wall="wall"
      :segments="detail"
      :side="placement(wall.detailDimension)!"
      :distance="DIM_DETAIL_DISTANCE"
    />
    <DimensionRow
      v-if="placement(wall.totalDimension)"
      :wall="wall"
      :segments="total"
      :side="placement(wall.totalDimension)!"
      :distance="DIM_TOTAL_DISTANCE"
    />
  </g>
</template>
