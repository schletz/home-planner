<script setup lang="ts">
import { computed } from 'vue'
import CheckField from '@/components/form/CheckField.vue'
import NumberField from '@/components/form/NumberField.vue'
import ObjectOffsetFields from '@/components/form/ObjectOffsetFields.vue'
import OptionGroup from '@/components/form/OptionGroup.vue'
import TextField from '@/components/form/TextField.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { isDimensioned, type Installation, type Wall, type WallSide } from '@/types/plan'

/** Properties of the selected socket, water connection or radiator. */
const props = defineProps<{ wall: Wall; installation: Installation }>()

const store = usePlanStore()

const SIDES: ReadonlyArray<{ value: WallSide; label: string }> = [
  { value: 'above', label: 'Darüber' },
  { value: 'below', label: 'Darunter' },
]

const isShaft = computed(() => props.installation.kind === 'shaft')
const hasLength = computed(() => props.installation.kind === 'radiator' || isShaft.value)
/** A shaft reaches from floor to ceiling, a mounting height says nothing. */
const hasHeight = computed(() => !isShaft.value)
const lengthLabel = computed(() => (isShaft.value ? 'Breite' : 'Länge'))
/** Objects with an extent are placed by their centre, openings by their edge. */
const leading = computed(() =>
  hasLength.value ? (props.installation.length ?? 100) / 2 : 0,
)
const dimensionHint = computed(() =>
  isShaft.value
    ? 'Der Schacht wird immer selbst bemaßt; die Option steuert nur den Eintrag in der Wandbemaßung.'
    : 'Ausschalten, wenn ein anderes Objekt an derselben Stelle sitzt.',
)

function set(patch: Partial<Installation>): void {
  store.updateObject(props.wall.id, props.installation.id, patch)
}
</script>

<template>
  <div class="section">
    <div class="grid">
      <ObjectOffsetFields
        :wall="wall"
        :offset="installation.offset"
        :leading="leading"
        :ignore-id="installation.id"
        @update:offset="set({ offset: $event })"
        @commit="store.commit()"
      />
      <NumberField
        v-if="hasHeight"
        :model-value="installation.height"
        label="Höhe über Boden"
        :min="0"
        @update:model-value="set({ height: $event })"
        @commit="store.commit()"
      />
      <NumberField
        v-if="hasLength"
        :model-value="installation.length ?? 100"
        :label="lengthLabel"
        :min="10"
        @update:model-value="set({ length: $event })"
        @commit="store.commit()"
      />
      <NumberField
        v-if="isShaft"
        :model-value="installation.depth ?? 40"
        label="Tiefe"
        :min="1"
        @update:model-value="set({ depth: $event })"
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
    <CheckField
      :model-value="isDimensioned(installation)"
      label="In Bemaßung berücksichtigen"
      :hint="dimensionHint"
      @update:model-value="set({ includeInDimension: $event })"
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
