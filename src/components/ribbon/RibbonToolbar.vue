<script setup lang="ts">
import RibbonButton from '@/components/ribbon/RibbonButton.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { useViewport } from '@/composables/useViewport'
import { TOOLS, type ToolDefinition, type ToolId } from '@/types/tools'
import type { IconName } from '@/components/ribbon/icons'

/** Ribbon with the file commands, the tools and the view commands. */
const emit = defineEmits<{
  (event: 'new-plan'): void
  (event: 'open'): void
  (event: 'save'): void
  (event: 'export-svg'): void
  (event: 'fit'): void
}>()

const store = usePlanStore()
const viewport = useViewport()

function tool(id: ToolId): ToolDefinition {
  return TOOLS.find((definition) => definition.id === id)!
}

const TOOL_GROUPS: ReadonlyArray<{ caption: string; tools: ToolId[] }> = [
  { caption: 'Werkzeuge', tools: ['select', 'wall'] },
  { caption: 'Formen', tools: ['door', 'window', 'doubleWindow'] },
  { caption: 'Installation', tools: ['socket', 'water', 'radiator'] },
]
</script>

<template>
  <header class="ribbon">
    <section class="ribbon-group">
      <div class="ribbon-buttons">
        <RibbonButton icon="new" label="Neu" @click="emit('new-plan')" />
        <RibbonButton icon="open" label="Öffnen" shortcut="Strg O" @click="emit('open')" />
        <RibbonButton icon="save" label="Speichern" shortcut="Strg S" @click="emit('save')" />
        <RibbonButton icon="export" label="SVG Export" shortcut="Strg E" @click="emit('export-svg')" />
      </div>
      <span class="ribbon-caption">Datei</span>
    </section>

    <section v-for="group in TOOL_GROUPS" :key="group.caption" class="ribbon-group">
      <div class="ribbon-buttons">
        <RibbonButton
          v-for="id in group.tools"
          :key="id"
          :icon="id as IconName"
          :label="tool(id).label"
          :shortcut="tool(id).shortcut"
          :hint="tool(id).hint"
          :active="store.state.tool === id"
          @click="store.setTool(id)"
        />
      </div>
      <span class="ribbon-caption">{{ group.caption }}</span>
    </section>

    <section class="ribbon-group">
      <div class="ribbon-buttons">
        <RibbonButton icon="zoomIn" label="Größer" shortcut="Strg +" @click="viewport.zoomIn()" />
        <RibbonButton icon="zoomOut" label="Kleiner" shortcut="Strg -" @click="viewport.zoomOut()" />
        <RibbonButton icon="fit" label="Einpassen" shortcut="Strg 0" @click="emit('fit')" />
        <RibbonButton
          icon="undo"
          label="Rückgängig"
          shortcut="Strg Z"
          :disabled="!store.canUndo.value"
          @click="store.undo()"
        />
        <RibbonButton
          icon="redo"
          label="Wiederholen"
          shortcut="Strg Y"
          :disabled="!store.canRedo.value"
          @click="store.redo()"
        />
      </div>
      <span class="ribbon-caption">Ansicht</span>
    </section>
  </header>
</template>

<style scoped>
.ribbon {
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding: 4px 8px 0;
  background: #f3f5f8;
  border-bottom: 1px solid #d6dae1;
  overflow-x: auto;
}
.ribbon-group {
  display: grid;
  gap: 2px;
  padding: 0 8px 2px;
  border-right: 1px solid #e2e6ec;
}
.ribbon-group:last-child {
  border-right: none;
}
.ribbon-buttons {
  display: flex;
  gap: 2px;
}
.ribbon-caption {
  font-size: 10px;
  color: #8a94a3;
  text-align: center;
}
</style>
