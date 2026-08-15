<script setup lang="ts">
import AnglePreview from '@/components/dialogs/AnglePreview.vue'
import NumberField from '@/components/form/NumberField.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { OBJECT_LABELS, type Wall } from '@/types/plan'

/** Properties of the selected wall, edited directly in the palette. */
const props = defineProps<{ wall: Wall }>()

const store = usePlanStore()

function set(patch: Partial<Omit<Wall, 'id' | 'objects'>>): void {
  store.updateWall(props.wall.id, patch)
}
</script>

<template>
  <div class="section">
    <div class="grid">
      <NumberField
        :model-value="wall.length"
        label="Länge"
        :min="1"
        @update:model-value="set({ length: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="wall.thickness"
        label="Wandstärke"
        :min="1"
        @update:model-value="set({ thickness: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="wall.x"
        label="X Beginn"
        @update:model-value="set({ x: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="wall.y"
        label="Y Beginn"
        @update:model-value="set({ y: $event })"
        @commit="store.commit()"
      />
    </div>

    <div class="angle">
      <NumberField
        :model-value="wall.angle"
        label="Winkel"
        unit="°"
        :step="5"
        @update:model-value="set({ angle: $event })"
        @commit="store.commit()"
      />
      <AnglePreview :angle="wall.angle" :thickness="wall.thickness" :size="108" :caption="false" />
    </div>

    <div class="grid">
      <NumberField
        :model-value="wall.totalDimension"
        label="Gesamtbemaßung"
        :step="5"
        @update:model-value="set({ totalDimension: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="wall.detailDimension"
        label="Detailbemaßung"
        :step="5"
        @update:model-value="set({ detailDimension: $event })"
        @commit="store.commit()"
      />
    </div>
    <p class="hint">
      Abstand der Maßlinie von der Wand. Negativ liegt darüber, positiv darunter, 0 blendet die
      Bemaßung aus.
    </p>

    <div class="grid">
      <NumberField
        :model-value="wall.dimensionMarginStart"
        label="Bemaßungsrand links"
        :step="5"
        @update:model-value="set({ dimensionMarginStart: $event })"
        @commit="store.commit()"
      />
      <NumberField
        :model-value="wall.dimensionMarginEnd"
        label="Bemaßungsrand rechts"
        :step="5"
        @update:model-value="set({ dimensionMarginEnd: $event })"
        @commit="store.commit()"
      />
    </div>
    <p class="hint">
      Rückt die äußeren Maßstriche nach innen, etwa um die halbe Stärke der anschließenden Wand.
      Links ist der Wandanfang. Die Maßzahlen bleiben unverändert.
    </p>

    <div v-if="wall.objects.length" class="objects">
      <span class="objects-title">Objekte in dieser Wand</span>
      <button
        v-for="object in wall.objects"
        :key="object.id"
        type="button"
        class="object-button"
        @click="store.select({ wallId: wall.id, objectId: object.id })"
      >
        {{ OBJECT_LABELS[object.kind] }}
        <span class="object-offset">{{ object.offset }} cm</span>
      </button>
    </div>
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
.angle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
}
.hint {
  margin: -6px 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}
.objects {
  display: grid;
  gap: 4px;
}
.objects-title {
  font-size: 12px;
  color: #4b5563;
}
.object-button {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid #dbe0e6;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
.object-button:hover {
  border-color: #2563eb;
}
.object-offset {
  color: #6b7280;
  font-variant-numeric: tabular-nums;
}
</style>
