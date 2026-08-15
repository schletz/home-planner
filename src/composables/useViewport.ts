import { reactive } from 'vue'
import type { Point } from '@/types/plan'
import { clamp } from '@/utils/geometry'

/**
 * Pan and zoom of the drawing area.
 *
 * `scale` is the number of screen pixels per centimetre, `panX`/`panY` is the
 * screen position of the model point (0, 0). Screen coordinates are relative to
 * the top left corner of the drawing area, not of the window.
 */

const MIN_SCALE = 0.04
const MAX_SCALE = 12
const ZOOM_STEP = 1.25

/** Width of the rulers in pixels. */
export const RULER_SIZE = 26

interface ViewportState {
  scale: number
  panX: number
  panY: number
  /** Size of the drawing area in pixels, kept in sync by the canvas. */
  width: number
  height: number
}

const state = reactive<ViewportState>({
  scale: 0.6,
  panX: 120,
  panY: 120,
  width: 800,
  height: 600,
})

function toScreen(point: Point): Point {
  return { x: point.x * state.scale + state.panX, y: point.y * state.scale + state.panY }
}

function toModel(screenX: number, screenY: number): Point {
  return { x: (screenX - state.panX) / state.scale, y: (screenY - state.panY) / state.scale }
}

/** Converts a pixel distance into centimetres. */
function toModelDistance(pixels: number): number {
  return pixels / state.scale
}

function panBy(deltaX: number, deltaY: number): void {
  state.panX += deltaX
  state.panY += deltaY
}

/** Zooms by `factor`, keeping the model point below the given pixel fixed. */
function zoomAt(factor: number, screenX: number, screenY: number): void {
  const next = clamp(state.scale * factor, MIN_SCALE, MAX_SCALE)
  const applied = next / state.scale
  state.panX = screenX - (screenX - state.panX) * applied
  state.panY = screenY - (screenY - state.panY) * applied
  state.scale = next
}

function zoomIn(): void {
  zoomAt(ZOOM_STEP, state.width / 2, state.height / 2)
}

function zoomOut(): void {
  zoomAt(1 / ZOOM_STEP, state.width / 2, state.height / 2)
}

function setSize(width: number, height: number): void {
  state.width = width
  state.height = height
}

/** Centres the given model rectangle in the drawing area. */
function fitTo(box: { x: number; y: number; width: number; height: number }, padding = 80): void {
  if (box.width <= 0 || box.height <= 0) return
  const scale = clamp(
    Math.min(
      (state.width - padding * 2) / box.width,
      (state.height - padding * 2) / box.height,
    ),
    MIN_SCALE,
    MAX_SCALE,
  )
  state.scale = scale
  state.panX = state.width / 2 - (box.x + box.width / 2) * scale
  state.panY = state.height / 2 - (box.y + box.height / 2) * scale
}

/** Model rectangle currently visible in the drawing area. */
function visibleBox(): { minX: number; minY: number; maxX: number; maxY: number } {
  const topLeft = toModel(0, 0)
  const bottomRight = toModel(state.width, state.height)
  return { minX: topLeft.x, minY: topLeft.y, maxX: bottomRight.x, maxY: bottomRight.y }
}

const viewport = {
  state,
  toScreen,
  toModel,
  toModelDistance,
  panBy,
  zoomAt,
  zoomIn,
  zoomOut,
  setSize,
  fitTo,
  visibleBox,
}

export type Viewport = typeof viewport

export function useViewport(): Viewport {
  return viewport
}
