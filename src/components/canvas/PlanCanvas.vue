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

/** Snapped cursor position, used for the crosshair and for inserting. */
const cursor = ref<{ screen: Point; model: Point; kind: SnapKind } | null>(null)
const panning = ref(false)
const draggingOrigin = ref(false)
const spacePressed = ref(false)

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
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

function isTextInput(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  const tag = element?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Space' && !isTextInput(event.target)) spacePressed.value = true
}

function onKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') spacePressed.value = false
}

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
  if (panning.value) {
    viewport.panBy(event.movementX, event.movementY)
  }
  updateCursor(event)
}

function onPointerLeave(): void {
  cursor.value = null
  emit('cursor', null)
}

function onPointerDown(event: PointerEvent): void {
  // Middle button and space + drag pan the view like in every graphics program.
  if (event.button === 1 || (event.button === 0 && spacePressed.value)) {
    event.preventDefault()
    panning.value = true
    ;(event.target as Element).setPointerCapture?.(event.pointerId)
    return
  }
  if (event.button !== 0) return

  updateCursor(event)
  if (store.state.tool === 'wall') {
    // Suppressing the compatibility mouse events keeps the focus in the dialog
    // that is about to open.
    event.preventDefault()
    emit('place-wall', cursor.value!.model)
    return
  }
  if (store.state.tool === 'select') store.select(null)
}

function onPointerUp(event: PointerEvent): void {
  panning.value = false
  if (draggingOrigin.value) {
    const screen = screenPoint(event)
    const snapped = snapPoint(viewport.toModel(screen.x, screen.y))
    store.setOrigin(snapped.point)
    draggingOrigin.value = false
  }
}

function onWheel(event: WheelEvent): void {
  event.preventDefault()
  const screen = screenPoint(event)
  viewport.zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, screen.x, screen.y)
}

/** A wall was hit: either select it or insert the object of the active tool. */
function onPickWall(event: PointerEvent, wallId: string): void {
  if (event.button !== 0 || spacePressed.value) return
  event.stopPropagation()
  updateCursor(event)

  if (store.state.tool === 'select') {
    store.select({ wallId })
    return
  }
  if (store.state.tool === 'wall') {
    event.preventDefault()
    emit('place-wall', cursor.value!.model)
    return
  }

  const wall = store.findWall(wallId)
  if (!wall) return
  // Insert tools measure the click position along the wall.
  event.preventDefault()
  const screen = screenPoint(event)
  const local = worldToLocal(wall, viewport.toModel(screen.x, screen.y))
  emit('place-object', wallId, Math.round(Math.min(Math.max(local.x, 0), wall.length)))
}

function onPickObject(event: PointerEvent, wallId: string, objectId: string): void {
  if (event.button !== 0 || spacePressed.value) return
  if (store.state.tool !== 'select') {
    onPickWall(event, wallId)
    return
  }
  event.stopPropagation()
  store.select({ wallId, objectId })
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
      :class="{ 'is-drawing': isDrawingTool, 'is-panning': panning || spacePressed }"
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
}
.canvas-surface.is-drawing {
  cursor: crosshair;
}
.canvas-surface.is-panning {
  cursor: grab;
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
