<script setup lang="ts">
import WallShape from '@/components/plan/WallShape.vue'
import type { Plan, Selection } from '@/types/plan'

/**
 * The drawing itself. This group is the single source of the SVG export, which
 * simply clones it — screen and exported file can therefore never drift apart.
 */
defineProps<{
  plan: Plan
  selection: Selection | null
  hitWidth: number
}>()

const emit = defineEmits<{
  (event: 'pick-wall', payload: PointerEvent, wallId: string): void
  (event: 'pick-object', payload: PointerEvent, wallId: string, objectId: string): void
}>()
</script>

<template>
  <g class="plan-root">
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
