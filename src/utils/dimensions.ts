import { isDimensioned, type Wall } from '@/types/plan'
import { clamp, round } from '@/utils/geometry'
import { objectExtent } from '@/utils/objectSpacing'

/**
 * A single measured distance along the wall. `from` and `to` are the wall-local
 * x coordinates the segment is drawn at, `length` is the figure printed above
 * it. Both differ at the wall ends as soon as the wall carries a dimension
 * margin: the ticks move into the room, the numbers stay the model values.
 */
export interface DimensionSegment {
  from: number
  to: number
  length: number
}

const EPSILON = 0.05

/**
 * Collects the tick positions of the detail dimension row: the wall ends plus
 * both edges of every object taking part in the dimension. Objects without an
 * extent contribute their centre twice, the duplicate is dropped below.
 */
function detailTicks(wall: Wall): number[] {
  const ticks: number[] = [0, wall.length]

  for (const object of wall.objects) {
    if (!isDimensioned(object)) continue
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

/**
 * Pulls the two outermost ticks inwards by the margins of the wall. Only the
 * drawn positions move; every `length` stays the measured value, so a wall
 * entered with 616 cm keeps printing 616 whatever its margins are.
 */
function applyMargins(wall: Wall, segments: DimensionSegment[]): DimensionSegment[] {
  const first = segments[0]
  const last = segments[segments.length - 1]
  if (!first || !last) return segments
  first.from += wall.dimensionMarginStart
  last.to -= wall.dimensionMarginEnd
  return segments
}

/** The single segment of the overall dimension row. */
export function totalSegments(wall: Wall): DimensionSegment[] {
  if (wall.length <= EPSILON) return []
  return applyMargins(wall, [{ from: 0, to: wall.length, length: round(wall.length) }])
}

/** The chain of distances between the objects of a wall. */
export function detailSegments(wall: Wall): DimensionSegment[] {
  if (wall.length <= EPSILON) return []
  const segments = toSegments(detailTicks(wall))
  // A wall without objects would only repeat the overall dimension.
  return segments.length > 1 ? applyMargins(wall, segments) : []
}
