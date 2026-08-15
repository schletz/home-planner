<script setup lang="ts">
import { computed } from 'vue'
import DimensionRow from '@/components/plan/DimensionRow.vue'
import InstallationShape from '@/components/plan/InstallationShape.vue'
import OpeningShape from '@/components/plan/OpeningShape.vue'
import { isOpening, type Selection, type Wall } from '@/types/plan'
import { detailSegments, totalSegments } from '@/utils/dimensions'
import { wallTransform } from '@/utils/geometry'

/**
 * Everything of a wall that sits on top of its body: the click area, all
 * objects inside the wall and the two dimension rows. The body itself is drawn
 * by `WallBody` in an earlier pass, because corners can only be closed when all
 * walls are painted together.
 *
 * The group transform maps wall-local coordinates to the world, so every child
 * can be drawn as if the wall started at the origin and ran along the x axis.
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

const transform = computed(() => wallTransform(props.wall))

function objectSelected(objectId: string): boolean {
  return props.selection?.wallId === props.wall.id && props.selection.objectId === objectId
}

const detail = computed(() => detailSegments(props.wall))
const total = computed(() => totalSegments(props.wall))
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

    <!-- An offset of zero switches the row off. -->
    <DimensionRow
      v-if="wall.detailDimension"
      :wall="wall"
      :segments="detail"
      :distance="wall.detailDimension"
    />
    <DimensionRow
      v-if="wall.totalDimension"
      :wall="wall"
      :segments="total"
      :distance="wall.totalDimension"
    />
  </g>
</template>
