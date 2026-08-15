<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseDialog from '@/components/dialogs/BaseDialog.vue'
import NumberField from '@/components/form/NumberField.vue'
import ObjectOffsetFields from '@/components/form/ObjectOffsetFields.vue'
import OptionGroup from '@/components/form/OptionGroup.vue'
import TextField from '@/components/form/TextField.vue'
import { useDefaults } from '@/composables/useDefaults'
import { OBJECT_LABELS, type Opening, type OpeningKind, type SwingDirection, type Wall } from '@/types/plan'
import { clamp } from '@/utils/geometry'
import { createId } from '@/utils/id'

/** Dialog for a door, window or double window inside an existing wall. */
const props = defineProps<{
  kind: OpeningKind
  wall: Wall
  offset: number
}>()

const emit = defineEmits<{
  (event: 'confirm', opening: Opening): void
  (event: 'cancel'): void
}>()

const defaults = useDefaults()

const draft = reactive({
  offset: props.offset,
  width: defaults.opening[props.kind].width,
  frame: defaults.opening[props.kind].frame,
  swing: defaults.opening[props.kind].swing,
  text: '',
})

const SWINGS: ReadonlyArray<{ value: SwingDirection; label: string; title: string }> = [
  { value: 'start-above', label: 'Anfang, darüber', title: 'Angeschlagen am Wandanfang, öffnet zur oberen Seite' },
  { value: 'start-below', label: 'Anfang, darunter', title: 'Angeschlagen am Wandanfang, öffnet zur unteren Seite' },
  { value: 'end-above', label: 'Ende, darüber', title: 'Angeschlagen am Wandende, öffnet zur oberen Seite' },
  { value: 'end-below', label: 'Ende, darunter', title: 'Angeschlagen am Wandende, öffnet zur unteren Seite' },
]

const title = computed(() => `${OBJECT_LABELS[props.kind]} einfügen`)

/** A double window is hinged at both jambs, only the side matters there. */
const swingHint = computed(() =>
  props.kind === 'doubleWindow'
    ? 'Beim Doppelfenster zählt nur die Seite, beide Flügel sind außen angeschlagen.'
    : '',
)

function confirm(): void {
  const width = clamp(Math.max(draft.width, 1), 1, props.wall.length)
  const opening: Opening = {
    id: createId('obj'),
    kind: props.kind,
    offset: clamp(draft.offset, 0, props.wall.length - width),
    width,
    frame: clamp(draft.frame, 0, width / 2 - 0.5),
    swing: draft.swing,
  }
  const text = draft.text.trim()
  if (text) opening.text = text

  Object.assign(defaults.opening[props.kind], {
    width: opening.width,
    frame: opening.frame,
    swing: opening.swing,
  })
  emit('confirm', opening)
}
</script>

<template>
  <BaseDialog :title="title" @confirm="confirm" @cancel="emit('cancel')">
    <div class="grid">
      <ObjectOffsetFields :wall="wall" v-model:offset="draft.offset" />
      <NumberField v-model="draft.width" label="Breite" :min="1" />
      <NumberField v-model="draft.frame" label="Rand (Stock)" :min="0" />
    </div>
    <OptionGroup v-model="draft.swing" label="Öffnungsrichtung" :options="SWINGS" />
    <p v-if="swingHint" class="hint">{{ swingHint }}</p>
    <TextField v-model="draft.text" label="Text (optional)" placeholder="z. B. Bad" />
  </BaseDialog>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.hint {
  margin: -4px 0 0;
  font-size: 12px;
  color: #6b7280;
}
</style>
