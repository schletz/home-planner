import type { Point } from '@/types/plan'
import { usePlanStore } from '@/composables/usePlanStore'
import { useViewport } from '@/composables/useViewport'
import { distance, round, wallEnd, wallStart } from '@/utils/geometry'

/** Spacing of the snap raster in cm, matching the coarse grid. */
export const SNAP_GRID = 50

/** Snap radius in screen pixels, independent of the zoom level. */
const SNAP_RADIUS_PX = 12

export type SnapKind = 'endpoint' | 'grid' | 'free'

/**
 * Decimals a snapped point is rounded to. A wall end is computed from a sine
 * and a cosine, so joining a wall to it would otherwise start at 615.9999999999
 * instead of 616. One decimal is a millimetre and therefore exact enough for
 * everything that gets built.
 */
const SNAP_DECIMALS = 1

function roundPoint(point: Point, decimals: number): Point {
  return { x: round(point.x, decimals), y: round(point.y, decimals) }
}

export interface SnapResult {
  point: Point
  kind: SnapKind
}

/**
 * Snaps a model point to the nearest wall end point, otherwise to the nearest
 * 50 cm raster point. The raster is aligned to the ruler origin so that the
 * zero point of the rulers always lies on a raster point.
 */
export function snapPoint(point: Point): SnapResult {
  const { state } = usePlanStore()
  const viewport = useViewport()
  const radius = viewport.toModelDistance(SNAP_RADIUS_PX)

  let best: Point | null = null
  let bestDistance = radius

  for (const wall of state.plan.walls) {
    for (const candidate of [wallStart(wall), wallEnd(wall)]) {
      const gap = distance(point, candidate)
      if (gap < bestDistance) {
        best = candidate
        bestDistance = gap
      }
    }
  }
  if (best) return { point: roundPoint(best, SNAP_DECIMALS), kind: 'endpoint' }

  const origin = state.plan.origin
  const raster: Point = {
    x: origin.x + Math.round((point.x - origin.x) / SNAP_GRID) * SNAP_GRID,
    y: origin.y + Math.round((point.y - origin.y) / SNAP_GRID) * SNAP_GRID,
  }
  if (distance(point, raster) < radius) {
    return { point: roundPoint(raster, SNAP_DECIMALS), kind: 'grid' }
  }

  // Without a snap target the position is at least rounded to whole
  // centimetres, fractions of a millimetre are worthless on a building site.
  return { point: { x: round(point.x, 0), y: round(point.y, 0) }, kind: 'free' }
}
