<script setup lang="ts">
import { computed } from 'vue'
import InstallationProperties from '@/components/palette/InstallationProperties.vue'
import OpeningProperties from '@/components/palette/OpeningProperties.vue'
import WallProperties from '@/components/palette/WallProperties.vue'
import TextField from '@/components/form/TextField.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { isOpening, OBJECT_LABELS } from '@/types/plan'

/** Right hand palette showing the properties of the current selection. */
const store = usePlanStore()

const wall = store.selectedWall
const object = store.selectedObject

const title = computed(() => {
  if (object.value) return OBJECT_LABELS[object.value.kind]
  if (wall.value) return 'Wand'
  return 'Plan'
})

const SHORTCUTS: ReadonlyArray<[string, string]> = [
  ['V / W', 'Auswahl / Wand zeichnen'],
  ['D / F / G', 'Türe / Fenster / Doppelfenster'],
  ['S / A / H / C', 'Steckdose / Wasser / Heizkörper / Schacht'],
  ['Pfeiltasten', 'Zeichenfläche verschieben'],
  ['Strg + / Strg -', 'Zoom'],
  ['Strg 0', 'Alles einpassen'],
  ['Entf', 'Auswahl löschen'],
  ['Esc', 'Werkzeug abbrechen'],
  ['Strg Z / Strg Y', 'Rückgängig / Wiederholen'],
]
</script>

<template>
  <aside class="palette">
    <header class="palette-header">
      <h2>{{ title }}</h2>
      <button
        v-if="wall"
        type="button"
        class="delete"
        title="Auswahl löschen (Entf)"
        @click="store.removeSelection()"
      >
        Löschen
      </button>
    </header>

    <div class="palette-body">
      <template v-if="wall && object">
        <button type="button" class="back" @click="store.select({ wallId: wall.id })">
          ← zur Wand
        </button>
        <OpeningProperties v-if="isOpening(object)" :wall="wall" :opening="object" />
        <InstallationProperties v-else :wall="wall" :installation="object" />
      </template>

      <WallProperties v-else-if="wall" :wall="wall" />

      <template v-else>
        <TextField
          :model-value="store.state.plan.name"
          label="Planname"
          @update:model-value="store.state.plan.name = $event"
          @commit="store.commit()"
        />
        <p class="empty">
          Kein Objekt ausgewählt. Mit dem Auswahlwerkzeug auf eine Wand oder ein Objekt klicken.
        </p>
        <dl class="shortcuts">
          <template v-for="[keys, description] in SHORTCUTS" :key="keys">
            <dt>{{ keys }}</dt>
            <dd>{{ description }}</dd>
          </template>
        </dl>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.palette {
  width: 300px;
  flex: none;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #d6dae1;
  background: #f8fafc;
  overflow: hidden;
}
.palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e6ec;
}
.palette-header h2 {
  margin: 0;
  font-size: 15px;
}
.delete {
  border: 1px solid #fca5a5;
  border-radius: 4px;
  background: #fff;
  color: #b91c1c;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
}
.delete:hover {
  background: #fef2f2;
}
.palette-body {
  padding: 12px;
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  align-content: start;
}
.back {
  justify-self: start;
  border: none;
  background: none;
  color: #2563eb;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.empty {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.45;
}
.shortcuts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  margin: 0;
  font-size: 12px;
  color: #4b5563;
}
.shortcuts dt {
  font-family: 'Consolas', monospace;
  color: #111827;
  white-space: nowrap;
}
.shortcuts dd {
  margin: 0;
}
</style>
