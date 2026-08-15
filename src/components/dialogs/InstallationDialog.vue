<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseDialog from '@/components/dialogs/BaseDialog.vue'
import CheckField from '@/components/form/CheckField.vue'
import NumberField from '@/components/form/NumberField.vue'
import ObjectOffsetFields from '@/components/form/ObjectOffsetFields.vue'
import OptionGroup from '@/components/form/OptionGroup.vue'
import TextField from '@/components/form/TextField.vue'
import { useDefaults } from '@/composables/useDefaults'
import {
  OBJECT_LABELS,
  type Installation,
  type InstallationKind,
  type Wall,
  type WallSide,
} from '@/types/plan'
import { clamp } from '@/utils/geometry'
import { createId } from '@/utils/id'

/** Dialog for a socket, water connection or radiator on an existing wall. */
const props = defineProps<{
  kind: InstallationKind
  wall: Wall
  offset: number
}>()

const emit = defineEmits<{
  (event: 'confirm', installation: Installation): void
  (event: 'cancel'): void
}>()

const defaults = useDefaults()

const draft = reactive({
  offset: props.offset,
  height: defaults.installation[props.kind].height,
  length: defaults.installation[props.kind].length,
  depth: defaults.installation[props.kind].depth,
  side: defaults.installation[props.kind].side,
  includeInDimension: defaults.installation[props.kind].includeInDimension,
  text: '',
})

const SIDES: ReadonlyArray<{ value: WallSide; label: string }> = [
  { value: 'above', label: 'Darüber' },
  { value: 'below', label: 'Darunter' },
]

const title = computed(() => `${OBJECT_LABELS[props.kind]} einfügen`)
const isShaft = computed(() => props.kind === 'shaft')
const hasLength = computed(() => props.kind === 'radiator' || isShaft.value)
/** A shaft reaches from floor to ceiling, a mounting height says nothing. */
const hasHeight = computed(() => !isShaft.value)
const lengthLabel = computed(() => (isShaft.value ? 'Breite' : 'Länge'))
/** Objects with an extent are placed by their centre, openings by their edge. */
const leading = computed(() => (hasLength.value ? draft.length / 2 : 0))
const dimensionHint = computed(() =>
  isShaft.value
    ? 'Der Schacht wird immer selbst bemaßt; die Option steuert nur den Eintrag in der Wandbemaßung.'
    : 'Ausschalten, wenn ein anderes Objekt an derselben Stelle sitzt.',
)

function confirm(): void {
  const installation: Installation = {
    id: createId('obj'),
    kind: props.kind,
    offset: clamp(draft.offset, 0, props.wall.length),
    height: hasHeight.value ? Math.max(draft.height, 0) : 0,
    side: draft.side,
  }
  if (hasLength.value) installation.length = Math.max(draft.length, 10)
  if (isShaft.value) installation.depth = Math.max(draft.depth, 1)
  // A missing flag means "measured", so only the exception is written out.
  if (!draft.includeInDimension) installation.includeInDimension = false
  const text = draft.text.trim()
  if (text) installation.text = text

  Object.assign(defaults.installation[props.kind], {
    height: installation.height,
    length: installation.length ?? defaults.installation[props.kind].length,
    depth: installation.depth ?? defaults.installation[props.kind].depth,
    side: installation.side,
    includeInDimension: draft.includeInDimension,
  })
  emit('confirm', installation)
}
</script>

<template>
  <BaseDialog :title="title" @confirm="confirm" @cancel="emit('cancel')">
    <div class="grid">
      <ObjectOffsetFields :wall="wall" v-model:offset="draft.offset" :leading="leading" />
      <NumberField v-if="hasHeight" v-model="draft.height" label="Höhe über Boden" :min="0" />
      <NumberField v-if="hasLength" v-model="draft.length" :label="lengthLabel" :min="10" />
      <NumberField v-if="isShaft" v-model="draft.depth" label="Tiefe" :min="1" />
    </div>
    <OptionGroup v-model="draft.side" label="Wandseite" :options="SIDES" />
    <CheckField
      v-model="draft.includeInDimension"
      label="In Bemaßung berücksichtigen"
      :hint="dimensionHint"
    />
    <TextField v-model="draft.text" label="Text (optional)" placeholder="z. B. Waschmaschine" />
  </BaseDialog>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
</style>
