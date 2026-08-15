<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import PlanCanvas from '@/components/canvas/PlanCanvas.vue'
import InstallationDialog from '@/components/dialogs/InstallationDialog.vue'
import OpeningDialog from '@/components/dialogs/OpeningDialog.vue'
import WallDialog from '@/components/dialogs/WallDialog.vue'
import PropertiesPalette from '@/components/palette/PropertiesPalette.vue'
import RibbonToolbar from '@/components/ribbon/RibbonToolbar.vue'
import StatusBar from '@/components/StatusBar.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { useShortcuts } from '@/composables/useShortcuts'
import { useViewport } from '@/composables/useViewport'
import type { Installation, InstallationKind, Opening, OpeningKind, Point } from '@/types/plan'
import { INSTALLATION_TOOLS, SHAPE_TOOLS } from '@/types/tools'
import { buildSvgDocument } from '@/utils/svgExport'
import { downloadBlob, openPlanFromFile, savePlanToFile, toFileName } from '@/utils/storage'

/**
 * Application shell. It wires the canvas to the insert dialogs: the canvas only
 * reports where the user clicked, this component decides which dialog belongs
 * to the active tool and writes the result into the store.
 */
const store = usePlanStore()
const viewport = useViewport()

const canvas = useTemplateRef<InstanceType<typeof PlanCanvas>>('canvas')

const cursor = ref<Point | null>(null)
const pendingWallStart = ref<Point | null>(null)
const pendingObject = ref<{ wallId: string; offset: number } | null>(null)

const pendingWall = computed(() =>
  pendingObject.value ? store.findWall(pendingObject.value.wallId) : undefined,
)
const openingKind = computed(() =>
  SHAPE_TOOLS.includes(store.state.tool) ? (store.state.tool as OpeningKind) : null,
)
const installationKind = computed(() =>
  INSTALLATION_TOOLS.includes(store.state.tool) ? (store.state.tool as InstallationKind) : null,
)

function onPlaceWall(point: Point): void {
  pendingWallStart.value = point
}

function onPlaceObject(wallId: string, offset: number): void {
  pendingObject.value = { wallId, offset }
}

function confirmOpening(opening: Opening): void {
  if (pendingObject.value) store.addObject(pendingObject.value.wallId, opening)
  pendingObject.value = null
}

function confirmInstallation(installation: Installation): void {
  if (pendingObject.value) store.addObject(pendingObject.value.wallId, installation)
  pendingObject.value = null
}

/* -------------------------------------------------------------------------- */
/* File commands                                                               */
/* -------------------------------------------------------------------------- */

function newPlan(): void {
  const hasContent = store.state.plan.walls.length > 0
  if (hasContent && !window.confirm('Neuen Plan beginnen? Der aktuelle Plan wird verworfen.')) return
  store.newPlan()
}

async function openPlan(): Promise<void> {
  const plan = await openPlanFromFile()
  if (!plan) return
  store.loadPlan(plan)
  fitToPlan()
}

function savePlan(): void {
  savePlanToFile(store.state.plan)
}

function exportSvg(): void {
  const element = canvas.value?.planElement()
  if (!element || store.state.plan.walls.length === 0) {
    window.alert('Der Plan ist leer, es gibt nichts zu exportieren.')
    return
  }
  downloadBlob(
    buildSvgDocument(element),
    toFileName(store.state.plan.name, 'svg'),
    'image/svg+xml',
  )
}

/** Zooms so that the whole plan including its dimensions fits on screen. */
function fitToPlan(): void {
  const element = canvas.value?.planElement()
  if (!element || store.state.plan.walls.length === 0) return
  const box = element.getBBox()
  viewport.fitTo({ x: box.x, y: box.y, width: box.width, height: box.height })
}

useShortcuts({ open: openPlan, save: savePlan, exportSvg, fit: fitToPlan })
</script>

<template>
  <div class="app">
    <RibbonToolbar
      @new-plan="newPlan"
      @open="openPlan"
      @save="savePlan"
      @export-svg="exportSvg"
      @fit="fitToPlan"
    />

    <main class="workspace">
      <PlanCanvas
        ref="canvas"
        @place-wall="onPlaceWall"
        @place-object="onPlaceObject"
        @cursor="cursor = $event"
      />
      <PropertiesPalette />
    </main>

    <StatusBar :cursor="cursor" />

    <WallDialog
      v-if="pendingWallStart"
      :start="pendingWallStart"
      @confirm="
        (wall) => {
          store.addWall(wall)
          pendingWallStart = null
        }
      "
      @cancel="pendingWallStart = null"
    />

    <OpeningDialog
      v-if="pendingObject && pendingWall && openingKind"
      :kind="openingKind"
      :wall="pendingWall"
      :offset="pendingObject.offset"
      @confirm="confirmOpening"
      @cancel="pendingObject = null"
    />

    <InstallationDialog
      v-if="pendingObject && pendingWall && installationKind"
      :kind="installationKind"
      :wall="pendingWall"
      :offset="pendingObject.offset"
      @confirm="confirmInstallation"
      @cancel="pendingObject = null"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
}
.workspace {
  flex: 1;
  display: flex;
  min-height: 0;
}
.workspace > :first-child {
  flex: 1;
  min-width: 0;
}
</style>
