<script setup lang="ts">
import { computed } from 'vue'
import NumberField from '@/components/form/NumberField.vue'
import OptionGroup from '@/components/form/OptionGroup.vue'
import TextField from '@/components/form/TextField.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import type { Installation, Wall, WallSide } from '@/types/plan'

/** Properties of the selected socket, water connection or radiator. */
const props = defineProps<{ wall: Wall; installation: Installation }>()

const store = usePlanStore()

const SIDES: ReadonlyArray<{ value: WallSide; label: string }> = [
  { value: 'above', label: 'Darüber' },
  { value: 'below', label: 'Darunter' },
]

const hasLength = computed(() => props.installation.kind === 'radiator')

function set(patch: Partial<Installation>): void {
  store.updateObject(props.wall.id, props.installation.id, patch)
}
</script>

<template>
  <div class="section">
    <div class="grid">
      <NumberField
        :model-value="installation.offset"
        label="Abstand zum Wandanfang"
        :min="0"
        @update:model-value="set({ offset: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="installation.height"
        label="Höhe über Boden"
        :min="0"
        @update:model-value="set({ height: $event })"
        @commit="store.commit()"
      />
      <NumberField
        v-if="hasLength"
        :model-value="installation.length ?? 100"
        label="Länge"
        :min="10"
        @update:model-value="set({ length: $event })"
        @commit="store.commit()"
      />
    </div>
    <OptionGroup
      :model-value="installation.side"
      label="Wandseite"
      :options="SIDES"
      @update:model-value="set({ side: $event })"
      @commit="store.commit()"
    />
    <TextField
      :model-value="installation.text ?? ''"
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
