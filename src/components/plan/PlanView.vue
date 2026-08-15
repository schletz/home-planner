<script setup lang="ts">
import { computed } from 'vue'
import WallBody from '@/components/plan/WallBody.vue'
import WallShape from '@/components/plan/WallShape.vue'
import type { Plan, Selection, Wall } from '@/types/plan'
import { NO_OVERHANG, wallOverhang, type Overhang } from '@/utils/wallGeometry'

/**
 * The drawing itself. This group is the single source of the SVG export, which
 * simply clones it — screen and exported file can therefore never drift apart.
 *
 * The three passes are what makes joined walls look solid: every wall outline
 * is drawn first, then every wall fill covers the outlines that run through a
 * neighbour, and only afterwards come the objects and the dimension rows. A
 * wall can therefore not be drawn on its own; the order matters.
 */
const props = defineProps<{
  plan: Plan
  selection: Selection | null
  hitWidth: number
}>()

const emit = defineEmits<{
  (event: 'pick-wall', payload: PointerEvent, wallId: string): void
  (event: 'pick-object', payload: PointerEvent, wallId: string, objectId: string): void
}>()

/**
 * Corner overhangs are the only place where a wall has to know about its
 * neighbours, so they are computed here where the whole plan is available and
 * handed to the shapes as a plain value.
 */
const overhangs = computed(
  () => new Map(props.plan.walls.map((wall) => [wall.id, wallOverhang(wall, props.plan.walls)])),
)

function overhangOf(wallId: string): Overhang {
  return overhangs.value.get(wallId) ?? NO_OVERHANG
}

function isSelected(wall: Wall): boolean {
  return props.selection?.wallId === wall.id && !props.selection.objectId
}
</script>

<template>
  <g class="plan-root">
    <template v-for="pass in (['outline', 'fill'] as const)" :key="pass">
      <WallBody
        v-for="wall in plan.walls"
        :key="`${pass}-${wall.id}`"
        :wall="wall"
        :overhang="overhangOf(wall.id)"
        :selected="isSelected(wall)"
        :pass="pass"
        @pick-wall="emit('pick-wall', $event, wall.id)"
      />
    </template>

    <WallShape
      v-for="wall in plan.walls"
      :key="wall.id"
      :wall="wall"
      :selection="selection"
      :hit-width="hitWidth"
      @pick-wall="emit('pick-wall', $event, wall.id)"
      @pick-object="(event, objectId) => emit('pick-object', event, wall.id, objectId)"
    />
  </g>
</template>
