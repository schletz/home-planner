import type { Wall } from '@/types/plan'
import { clamp, round } from '@/utils/geometry'
import { objectExtent } from '@/utils/objectSpacing'

/** A single measured distance along the wall, in wall-local x coordinates. */
export interface DimensionSegment {
  from: number
  to: number
  length: number
}

const EPSILON = 0.05

/**
 * Collects the tick positions of the detail dimension row: the wall ends plus
 * both edges of every object. Objects without an extent contribute their centre
 * twice, the duplicate is dropped below.
 */
function detailTicks(wall: Wall): number[] {
  const ticks: number[] = [0, wall.length]

  for (const object of wall.objects) {
    const extent = objectExtent(object)
    ticks.push(extent.start, extent.end)
  }

  const inside = ticks
    .map((tick) => clamp(tick, 0, wall.length))
    .sort((a, b) => a - b)

  // Drop ticks that would produce a zero length segment.
  return inside.filter((tick, index) => index === 0 || tick - inside[index - 1]! > EPSILON)
}

function toSegments(ticks: number[]): DimensionSegment[] {
  const segments: DimensionSegment[] = []
  for (let i = 1; i < ticks.length; i += 1) {
    const from = ticks[i - 1]!
    const to = ticks[i]!
    segments.push({ from, to, length: round(to - from) })
  }
  return segments
}

/** The single segment of the overall dimension row. */
export function totalSegments(wall: Wall): DimensionSegment[] {
  if (wall.length <= EPSILON) return []
  return [{ from: 0, to: wall.length, length: round(wall.length) }]
}

/** The chain of distances between the objects of a wall. */
export function detailSegments(wall: Wall): DimensionSegment[] {
  if (wall.length <= EPSILON) return []
  const segments = toSegments(detailTicks(wall))
  // A wall without objects would only repeat the overall dimension.
  return segments.length > 1 ? segments : []
}
