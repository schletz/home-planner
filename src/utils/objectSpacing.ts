import { isDimensioned, isOpening, type Wall, type WallObject } from '@/types/plan'
import { round } from '@/utils/geometry'

/**
 * Position of wall objects relative to each other.
 *
 * On site a distance is usually taken from one object to the next, not from the
 * wall start: the tape runs from the edge of one window to the edge of the next
 * one. Both descriptions address the same position, so the editor offers them
 * side by side and derives one from the other.
 *
 * The reference point is the same as in the detail dimension row, therefore the
 * value entered here is exactly the figure printed between two objects.
 */

/** Extent of an object along the wall in wall-local x coordinates. */
export interface Extent {
  start: number
  end: number
}

/** Distances below this are treated as equal, in cm. */
const EPSILON = 0.05

/**
 * Extent an object covers along the wall. Objects without a length — a socket
 * or a water connection — are measured to their centre, so start and end fall
 * together.
 *
 * A shaft is anchored like an opening, at the edge facing the wall start; the
 * radiator remains the one object that hangs symmetrically around its offset.
 */
export function objectExtent(object: WallObject): Extent {
  if (isOpening(object)) {
    return { start: object.offset, end: object.offset + object.width }
  }
  if (object.kind === 'shaft') {
    return { start: object.offset, end: object.offset + (object.length ?? 0) }
  }
  if (object.length) {
    const half = object.length / 2
    return { start: object.offset - half, end: object.offset + half }
  }
  return { start: object.offset, end: object.offset }
}

/**
 * End of the object sitting in front of `start`, or `0` for the wall start when
 * there is none. `ignoreId` keeps the object that is being edited from becoming
 * its own predecessor.
 *
 * Objects excluded from the dimension are skipped: the field is meant to show
 * the very figure printed in the detail row, and an object that does not appear
 * there must not become the reference point either.
 */
export function previousEnd(wall: Wall, start: number, ignoreId?: string): number {
  let previous: Extent | null = null
  for (const object of wall.objects) {
    if (object.id === ignoreId || !isDimensioned(object)) continue
    const extent = objectExtent(object)
    if (extent.start >= start - EPSILON) continue
    if (!previous || extent.start > previous.start) previous = extent
  }
  return previous ? previous.end : 0
}

/** Clear distance between the previous object and an object starting at `start`. */
export function gapBefore(wall: Wall, start: number, ignoreId?: string): number {
  return round(start - previousEnd(wall, start, ignoreId))
}

/**
 * Where an object has to start so that `gap` remains free in front of it. The
 * predecessor is looked up at the current position, so repeatedly editing the
 * gap keeps measuring against the same object.
 */
export function startForGap(
  wall: Wall,
  currentStart: number,
  gap: number,
  ignoreId?: string,
): number {
  return round(previousEnd(wall, currentStart, ignoreId) + gap)
}
