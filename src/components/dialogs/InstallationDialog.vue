<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseDialog from '@/components/dialogs/BaseDialog.vue'
import NumberField from '@/components/form/NumberField.vue'
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
  side: defaults.installation[props.kind].side,
  text: '',
})

const SIDES: ReadonlyArray<{ value: WallSide; label: string }> = [
  { value: 'above', label: 'Darüber' },
  { value: 'below', label: 'Darunter' },
]

const title = computed(() => `${OBJECT_LABELS[props.kind]} einfügen`)
const hasLength = computed(() => props.kind === 'radiator')

function confirm(): void {
  const installation: Installation = {
    id: createId('obj'),
    kind: props.kind,
    offset: clamp(draft.offset, 0, props.wall.length),
    height: Math.max(draft.height, 0),
    side: draft.side,
  }
  if (hasLength.value) installation.length = Math.max(draft.length, 10)
  const text = draft.text.trim()
  if (text) installation.text = text

  Object.assign(defaults.installation[props.kind], {
    height: installation.height,
    length: installation.length ?? defaults.installation[props.kind].length,
    side: installation.side,
  })
  emit('confirm', installation)
}
</script>

<template>
  <BaseDialog :title="title" @confirm="confirm" @cancel="emit('cancel')">
    <div class="grid">
      <NumberField v-model="draft.offset" label="Abstand zum Wandanfang" :min="0" />
      <NumberField v-model="draft.height" label="Höhe über Boden" :min="0" />
      <NumberField v-if="hasLength" v-model="draft.length" label="Länge" :min="10" />
    </div>
    <OptionGroup v-model="draft.side" label="Wandseite" :options="SIDES" />
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
