<script setup lang="ts">
import CheckField from '@/components/form/CheckField.vue'
import NumberField from '@/components/form/NumberField.vue'
import ObjectOffsetFields from '@/components/form/ObjectOffsetFields.vue'
import OptionGroup from '@/components/form/OptionGroup.vue'
import TextField from '@/components/form/TextField.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { isDimensioned, type Opening, type SwingDirection, type Wall } from '@/types/plan'

/** Properties of the selected door, window or double window. */
const props = defineProps<{ wall: Wall; opening: Opening }>()

const store = usePlanStore()

const SWINGS: ReadonlyArray<{ value: SwingDirection; label: string }> = [
  { value: 'start-above', label: 'Anfang, darüber' },
  { value: 'start-below', label: 'Anfang, darunter' },
  { value: 'end-above', label: 'Ende, darüber' },
  { value: 'end-below', label: 'Ende, darunter' },
]

function set(patch: Partial<Opening>): void {
  store.updateObject(props.wall.id, props.opening.id, patch)
}
</script>

<template>
  <div class="section">
    <div class="grid">
      <ObjectOffsetFields
        :wall="wall"
        :offset="opening.offset"
        :ignore-id="opening.id"
        @update:offset="set({ offset: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="opening.width"
        label="Breite"
        :min="1"
        @update:model-value="set({ width: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="opening.frame"
        label="Rand (Stock)"
        :min="0"
        @update:model-value="set({ frame: $event })"
        @commit="store.commit()"
      />
    </div>
    <OptionGroup
      :model-value="opening.swing"
      label="Öffnungsrichtung"
      :options="SWINGS"
      @update:model-value="set({ swing: $event })"
      @commit="store.commit()"
    />
    <CheckField
      :model-value="isDimensioned(opening)"
      label="In Bemaßung berücksichtigen"
      hint="Ausschalten, wenn ein anderes Objekt an derselben Stelle sitzt."
      @update:model-value="set({ includeInDimension: $event })"
      @commit="store.commit()"
    />
    <TextField
      :model-value="opening.text ?? ''"
      label="Text (optional)"
      @update:model-value="set({ text: $event })"
      @commit="store.commit()"
    />
  </div>
</template>

<style scoped>
.section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
</style>
