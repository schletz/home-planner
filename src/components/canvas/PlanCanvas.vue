<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import CanvasGrid from '@/components/canvas/CanvasGrid.vue'
import CanvasRuler from '@/components/canvas/CanvasRuler.vue'
import PlanView from '@/components/plan/PlanView.vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { snapPoint, type SnapKind } from '@/composables/useSnapping'
import { RULER_SIZE, useViewport } from '@/composables/useViewport'
import type { Point } from '@/types/plan'
import { worldToLocal } from '@/utils/geometry'
import { PLAN_STYLE } from '@/utils/planStyle'

/**
 * Drawing area with rulers, grid and plan. The canvas owns all pointer
 * interaction: it snaps the cursor, decides whether a click hits a wall, an
 * object or empty space, and reports insert requests to the application, which
 * then opens the matching dialog.
 *
 * Dragging always pans the view, so nothing on the plan can be moved with the
 * mouse and no rubber band is drawn. What a press means is therefore only
 * decided when the button is released: without movement it is a click on
 * whatever was under the pointer, with movement it was a pan.
 */
const emit = defineEmits<{
  (event: 'place-wall', point: Point): void
  (event: 'place-object', wallId: string, offset: number): void
  (event: 'cursor', point: Point | null): void
}>()

const store = usePlanStore()
const viewport = useViewport()

const root = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
const svg = shallowRef<SVGSVGElement | null>(null)
const planGroup = shallowRef<SVGGElement | null>(null)

const rulerSize = `${RULER_SIZE}px`

/** Movement in pixels up to which a drag still counts as a click. */
const CLICK_TOLERANCE = 3

/** What the pointer went down on, `null` for empty space. */
type Pick = { wallId: string; objectId?: string }

/** Snapped cursor position, used for the crosshair and for inserting. */
const cursor = ref<{ screen: Point; model: Point; kind: SnapKind } | null>(null)
const press = ref<{ x: number; y: number; moved: boolean; pick: Pick | null } | null>(null)
const draggingOrigin = ref(false)

const panning = computed(() => press.value?.moved === true)

const isDrawingTool = computed(() => store.state.tool !== 'select')

/** Click tolerance of thin walls, converted from pixels to centimetres. */
const hitWidth = computed(() => viewport.toModelDistance(14))

/** Hair lines must not fall below one pixel, no matter how far we zoom out. */
const lineVariables = computed(() => ({
  '--plan-line': String(Math.max(1, viewport.toModelDistance(1.2))),
  '--plan-hairline': String(Math.max(0.7, viewport.toModelDistance(1))),
}))

const transform = computed(
  () => `translate(${viewport.state.panX} ${viewport.state.panY}) scale(${viewport.state.scale})`,
)

const box = computed(() => viewport.visibleBox())

let observer: ResizeObserver | null = null

onMounted(() => {
  if (surface.value) {
    observer = new ResizeObserver(([entry]) => {
      if (entry) viewport.setSize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(surface.value)
  }
  // Vue strips <style> elements from templates, so the plan style is inserted
  // by hand. It has to live inside the SVG because the export clones it.
  if (svg.value) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = PLAN_STYLE
    svg.value.insertBefore(style, svg.value.firstChild)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

/** Pointer position relative to the top left corner of the drawing area. */
function screenPoint(event: PointerEvent | WheelEvent): Point {
  const rect = surface.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function updateCursor(event: PointerEvent): void {
  const screen = screenPoint(event)
  const raw = viewport.toModel(screen.x, screen.y)
  const snapped = snapPoint(raw)
  cursor.value = { screen: viewport.toScreen(snapped.point), model: snapped.point, kind: snapped.kind }
  emit('cursor', snapped.point)
}

function onPointerMove(event: PointerEvent): void {
  const active = press.value
  if (active) {
    if (!active.moved && Math.hypot(event.clientX - active.x, event.clientY - active.y) > CLICK_TOLERANCE) {
      active.moved = true
    }
    if (active.moved) viewport.panBy(event.movementX, event.movementY)
  }
  updateCursor(event)
}

function onPointerLeave(): void {
  cursor.value = null
  emit('cursor', null)
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0 && event.button !== 1) return
  // A drawing tool may open a dialog on release; suppressing the compatibility
  // mouse events keeps the focus off the canvas, so the dialog can take it. The
  // middle button is suppressed because of the autoscroll. The select tool must
  // keep them: a palette field being edited has to lose the focus, otherwise it
  // never fires `change` and never closes its undo step.
  if (isDrawingTool.value || event.button === 1) event.preventDefault()

  const pick = pendingPick
  pendingPick = null
  press.value = {
    x: event.clientX,
    y: event.clientY,
    // The middle button pans from the first pixel, the left one only once it moves.
    moved: event.button === 1,
    pick: event.button === 0 ? pick : null,
  }
  // Capturing on the surface keeps the moves coming when the pointer leaves it.
  surface.value?.setPointerCapture(event.pointerId)
  updateCursor(event)
}

function onPointerUp(event: PointerEvent): void {
  if (draggingOrigin.value) {
    const screen = screenPoint(event)
    const snapped = snapPoint(viewport.toModel(screen.x, screen.y))
    store.setOrigin(snapped.point)
    draggingOrigin.value = false
  }

  const active = press.value
  press.value = null
  if (!active || active.moved || event.button !== 0) return
  updateCursor(event)
  applyPick(active.pick, event)
}

function onWheel(event: WheelEvent): void {
  event.preventDefault()
  const screen = screenPoint(event)
  viewport.zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, screen.x, screen.y)
}

/**
 * Walls and objects only note that they were hit; the event keeps bubbling to
 * the surface, which needs it to start a possible pan. Because the press may
 * still turn into one, nothing is acted on before the release.
 */
let pendingPick: Pick | null = null

function onPickWall(event: PointerEvent, wallId: string): void {
  if (event.button === 0) pendingPick = { wallId }
}

function onPickObject(event: PointerEvent, wallId: string, objectId: string): void {
  if (event.button === 0) pendingPick = { wallId, objectId }
}

/** The button was released without dragging, so this press was a click. */
function applyPick(pick: Pick | null, event: PointerEvent): void {
  if (!pick) {
    if (store.state.tool === 'wall') emit('place-wall', cursor.value!.model)
    else if (store.state.tool === 'select') store.select(null)
    return
  }
  // Only the select tool tells an object from the wall it sits in; every other
  // tool inserts into the wall, wherever inside it the click landed.
  if (pick.objectId && store.state.tool === 'select') {
    store.select({ wallId: pick.wallId, objectId: pick.objectId })
    return
  }
  if (store.state.tool === 'select') {
    store.select({ wallId: pick.wallId })
    return
  }
  if (store.state.tool === 'wall') {
    emit('place-wall', cursor.value!.model)
    return
  }

  const wall = store.findWall(pick.wallId)
  if (!wall) return
  // Insert tools measure the click position along the wall.
  const screen = screenPoint(event)
  const local = worldToLocal(wall, viewport.toModel(screen.x, screen.y))
  emit('place-object', pick.wallId, Math.round(Math.min(Math.max(local.x, 0), wall.length)))
}

/* -------------------------------------------------------------------------- */
/* Origin handle                                                               */
/* -------------------------------------------------------------------------- */

function onOriginDragStart(event: PointerEvent): void {
  event.preventDefault()
  draggingOrigin.value = true
  ;(event.target as Element).setPointerCapture?.(event.pointerId)
}

function onOriginDragMove(event: PointerEvent): void {
  if (!draggingOrigin.value) return
  updateCursor(event)
}

function onOriginDragEnd(event: PointerEvent): void {
  if (!draggingOrigin.value) return
  onPointerUp(event)
}

defineExpose({
  /** The group the SVG export clones. */
  planElement: () => planGroup.value,
})
</script>

<template>
  <div ref="root" class="canvas">
    <button
      class="canvas-origin"
      type="button"
      title="Nullpunkt der Lineale auf einen Punkt im Plan ziehen"
      @pointerdown="onOriginDragStart"
      @pointermove="onOriginDragMove"
      @pointerup="onOriginDragEnd"
    >
      <span class="canvas-origin-mark" />
    </button>

    <CanvasRuler
      class="canvas-ruler-top"
      orientation="horizontal"
      :scale="viewport.state.scale"
      :pan="viewport.state.panX"
      :origin="store.state.plan.origin.x"
      :size="viewport.state.width"
      :cursor="cursor?.screen.x ?? null"
    />
    <CanvasRuler
      class="canvas-ruler-left"
      orientation="vertical"
      :scale="viewport.state.scale"
      :pan="viewport.state.panY"
      :origin="store.state.plan.origin.y"
      :size="viewport.state.height"
      :cursor="cursor?.screen.y ?? null"
    />

    <div
      ref="surface"
      class="canvas-surface"
      :class="{ 'is-drawing': isDrawingTool, 'is-panning': panning }"
      @pointermove="onPointerMove"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointerleave="onPointerLeave"
      @wheel="onWheel"
      @contextmenu.prevent
    >
      <svg ref="svg" class="canvas-svg" :style="lineVariables">
        <g :transform="transform">
          <CanvasGrid :origin="store.state.plan.origin" :scale="viewport.state.scale" :box="box" />
          <g ref="planGroup">
            <PlanView
              :plan="store.state.plan"
              :selection="store.state.selection"
              :hit-width="hitWidth"
              @pick-wall="onPickWall"
              @pick-object="onPickObject"
            />
          </g>
        </g>

        <g v-if="cursor && (isDrawingTool || draggingOrigin)" class="canvas-crosshair">
          <path
            :d="`M ${cursor.screen.x - 12} ${cursor.screen.y} h 24 M ${cursor.screen.x} ${cursor.screen.y - 12} v 24`"
          />
          <circle
            v-if="cursor.kind !== 'free'"
            :cx="cursor.screen.x"
            :cy="cursor.screen.y"
            r="6"
            :class="cursor.kind === 'endpoint' ? 'is-endpoint' : 'is-grid'"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  display: grid;
  grid-template-columns: v-bind(rulerSize) 1fr;
  grid-template-rows: v-bind(rulerSize) 1fr;
  min-width: 0;
  min-height: 0;
  background: #ffffff;
}
.canvas-origin {
  grid-column: 1;
  grid-row: 1;
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  border-right: 1px solid #d6dae1;
  border-bottom: 1px solid #d6dae1;
  background: #eceef1;
  cursor: move;
  touch-action: none;
}
.canvas-origin-mark {
  width: 10px;
  height: 10px;
  border-right: 2px solid #ef4444;
  border-bottom: 2px solid #ef4444;
}
.canvas-ruler-top {
  grid-column: 2;
  grid-row: 1;
  border-bottom: 1px solid #d6dae1;
  overflow: hidden;
}
.canvas-ruler-left {
  grid-column: 1;
  grid-row: 2;
  border-right: 1px solid #d6dae1;
  overflow: hidden;
}
.canvas-surface {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  overflow: hidden;
  touch-action: none;
  /* Dragging pans, so it must never select the labels of the drawing. */
  user-select: none;
}
.canvas-surface.is-drawing {
  cursor: crosshair;
}
/* Only while actually dragging — the idle cursor still belongs to the tool. */
.canvas-surface.is-panning {
  cursor: grabbing;
}
.canvas-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.canvas-crosshair {
  pointer-events: none;
}
.canvas-crosshair path {
  stroke: #ef4444;
  stroke-width: 1;
  fill: none;
}
.canvas-crosshair circle {
  fill: none;
  stroke-width: 1.5;
}
.canvas-crosshair circle.is-endpoint {
  stroke: #16a34a;
}
.canvas-crosshair circle.is-grid {
  stroke: #2563eb;
}
</style>
