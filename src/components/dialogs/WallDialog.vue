<script setup lang="ts">
import { reactive } from 'vue'
import AnglePreview from '@/components/dialogs/AnglePreview.vue'
import BaseDialog from '@/components/dialogs/BaseDialog.vue'
import NumberField from '@/components/form/NumberField.vue'
import { useDefaults } from '@/composables/useDefaults'
import type { Point, Wall } from '@/types/plan'
import { normalizeAngle } from '@/utils/geometry'

/** Dialog for a new wall. The start point comes from the click on the canvas. */
const props = defineProps<{ start: Point }>()

const emit = defineEmits<{
  (event: 'confirm', wall: Omit<Wall, 'id' | 'objects'>): void
  (event: 'cancel'): void
}>()

const defaults = useDefaults()

const draft = reactive({
  x: props.start.x,
  y: props.start.y,
  length: defaults.wall.length,
  angle: defaults.wall.angle,
  thickness: defaults.wall.thickness,
  totalDimension: defaults.wall.totalDimension,
  detailDimension: defaults.wall.detailDimension,
  dimensionMarginStart: defaults.wall.dimensionMarginStart,
  dimensionMarginEnd: defaults.wall.dimensionMarginEnd,
})

const QUICK_ANGLES = [0, 90, 180, 270]

function confirm(): void {
  const wall: Omit<Wall, 'id' | 'objects'> = {
    x: draft.x,
    y: draft.y,
    length: Math.max(draft.length, 1),
    angle: normalizeAngle(draft.angle),
    thickness: Math.max(draft.thickness, 1),
    totalDimension: draft.totalDimension,
    detailDimension: draft.detailDimension,
    dimensionMarginStart: draft.dimensionMarginStart,
    dimensionMarginEnd: draft.dimensionMarginEnd,
  }
  Object.assign(defaults.wall, {
    length: wall.length,
    angle: wall.angle,
    thickness: wall.thickness,
    totalDimension: wall.totalDimension,
    detailDimension: wall.detailDimension,
    dimensionMarginStart: wall.dimensionMarginStart,
    dimensionMarginEnd: wall.dimensionMarginEnd,
  })
  emit('confirm', wall)
}
</script>

<template>
  <BaseDialog title="Wand zeichnen" confirm-label="Wand erstellen" @confirm="confirm" @cancel="emit('cancel')">
    <div class="grid">
      <NumberField v-model="draft.length" label="Länge" />
      <NumberField v-model="draft.thickness" label="Wandstärke" :min="1" />
      <NumberField v-model="draft.x" label="X Beginn" />
      <NumberField v-model="draft.y" label="Y Beginn" />
    </div>

    <div class="angle">
      <div class="angle-input">
        <NumberField v-model="draft.angle" label="Winkel" unit="°" :step="5" />
        <div class="angle-quick">
          <button
            v-for="value in QUICK_ANGLES"
            :key="value"
            type="button"
            class="angle-button"
            :class="{ 'is-active': normalizeAngle(draft.angle) === value }"
            @click="draft.angle = value"
          >
            {{ value }}°
          </button>
        </div>
      </div>
      <AnglePreview :angle="draft.angle" :thickness="draft.thickness" />
    </div>

    <div class="grid">
      <NumberField v-model="draft.totalDimension" label="Gesamtbemaßung" :step="5" />
      <NumberField v-model="draft.detailDimension" label="Detailbemaßung" :step="5" />
    </div>
    <p class="hint">
      Abstand der Maßlinie von der Wand. Negativ liegt darüber, positiv darunter, 0 blendet die
      Bemaßung aus.
    </p>

    <div class="grid">
      <NumberField v-model="draft.dimensionMarginStart" label="Bemaßungsrand links" :step="5" />
      <NumberField v-model="draft.dimensionMarginEnd" label="Bemaßungsrand rechts" :step="5" />
    </div>
    <p class="hint">
      Rückt die äußeren Maßstriche nach innen, etwa um die halbe Stärke der anschließenden Wand.
      Links ist der Wandanfang. Die Maßzahlen bleiben unverändert.
    </p>
  </BaseDialog>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.angle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}
.hint {
  margin: -4px 0 0;
  font-size: 12px;
  color: #6b7280;
}
.angle-input {
  display: grid;
  gap: 8px;
  align-content: start;
}
.angle-quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.angle-button {
  padding: 6px 0;
  border: 1px solid #c7ccd4;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
}
.angle-button.is-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
</style>
