<script setup lang="ts">
import { computed } from 'vue'
import NumberField from '@/components/form/NumberField.vue'
import type { Wall } from '@/types/plan'
import { round } from '@/utils/geometry'
import { gapBefore, startForGap } from '@/utils/objectSpacing'

/**
 * The two coupled distance fields of a wall object. Both describe the same
 * position — once measured from the wall start, once from the object in front
 * of it — so editing either one recalculates the other. On site only the second
 * measure is usually available: the tape runs from window to window, not back
 * to the corner every time.
 *
 * Both fields take arithmetic, because a position read from a sketch is often a
 * sum of two measurements rather than a single number.
 */
const props = withDefaults(
  defineProps<{
    wall: Wall
    offset: number
    /**
     * Extent of the object in front of its offset, e.g. half a radiator length.
     * Openings start at their offset and therefore need none.
     */
    leading?: number
    /** Id of the object being edited, so that it is not its own predecessor. */
    ignoreId?: string
  }>(),
  { leading: 0, ignoreId: undefined },
)

const emit = defineEmits<{
  (event: 'update:offset', value: number): void
  (event: 'commit'): void
}>()

/** Leading edge of the object, which is what the gap is measured to. */
const start = computed(() => props.offset - props.leading)

const gap = computed(() => gapBefore(props.wall, start.value, props.ignoreId))

function setGap(value: number): void {
  const nextStart = startForGap(props.wall, start.value, value, props.ignoreId)
  emit('update:offset', round(nextStart + props.leading))
}
</script>

<template>
  <NumberField
    :model-value="offset"
    label="Abstand zum Wandanfang"
    :min="0"
    expression
    @update:model-value="emit('update:offset', $event)"
    @commit="emit('commit')"
  />
  <NumberField
    :model-value="gap"
    label="Abstand zum vorigen Objekt"
    expression
    @update:model-value="setGap"
    @commit="emit('commit')"
  />
</template>
